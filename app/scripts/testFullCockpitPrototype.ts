import assert from 'node:assert/strict'
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from 'playwright'
import { createServer } from 'vite'
import { fullCockpitData as data } from '../prototypes/fullCockpitData'
import { getLegalTermsCopy } from '../src/utils/legalTermsCopy'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const artifacts = fileURLToPath(new URL('../../tmp/learning-cockpit-prototype-review/', import.meta.url))
const externalOrigin = process.env.PROTOTYPE_ORIGIN
const server = externalOrigin ? null : await createServer({ root: appRoot,
  configFile: `${appRoot}/prototypes/vite.config.ts`, logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false } })
await server?.listen()
const address = server?.httpServer?.address()
const origin = externalOrigin ?? (address && typeof address !== 'string' ? `http://127.0.0.1:${address.port}` : '')
assert.ok(origin)
const browser = await chromium.launch()
const errors: string[] = []
const rejected: string[] = []
let stage = 'load'
let lastPage: Page | null = null

async function ready(page: Page) {
  await page.getByTestId('learner-main-content').waitFor()
  await page.getByTestId('learner-learning-progress').waitFor()
  await page.getByTestId('learner-active-goal-banner').waitFor()
}

async function open(width: number, reducedMotion: 'reduce' | 'no-preference' = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion, serviceWorkers: 'block' })
  await context.route('**/*', route => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.origin !== origin || /^\/(api|oauth2|login)(\/|$)/.test(url.pathname) || !['GET', 'HEAD'].includes(request.method())) {
      rejected.push(`${request.method()} ${url.origin}${url.pathname}`)
      return route.abort()
    }
    return route.continue()
  })
  const page = await context.newPage()
  lastPage = page
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' || message.text().startsWith('[FullCockpit local adapter]')) errors.push(message.text())
  })
  await page.goto(`${origin}/prototypes/full-cockpit.html`)
  await ready(page)
  return page
}

const mapDialog = (page: Page) => page.getByTestId('learner-learning-map-dialog')
const mapOpener = (page: Page) => page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open')

async function openMap(page: Page, scopeId?: string) {
  await mapOpener(page).click()
  await mapDialog(page).waitFor()
  const viewport = page.viewportSize()
  const box = await mapDialog(page).boundingBox()
  assert.ok(viewport && box)
  assert.deepEqual([box.x, box.y, box.width, box.height].map(Math.round), [0, 0, viewport.width, viewport.height], 'the learning map uses the entire window')
  if (scopeId) await page.locator(`.lum-canvas[data-scope-id="${scopeId}"][aria-busy="false"]`).waitFor()
}

async function closeMap(page: Page) {
  await mapDialog(page).getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
  await mapDialog(page).waitFor({ state: 'hidden' })
}

async function actionsShareTopRow(page: Page, label: string) {
  const [openerBox, startBox] = await Promise.all([mapOpener(page).boundingBox(),
    page.getByTestId('learner-coach-start-link').boundingBox()])
  assert.ok(openerBox && startBox && Math.abs(openerBox.y - startBox.y) < 1 && openerBox.x + openerBox.width <= startBox.x,
    `${label}: Lernkarte sits beside Lernen starten`)
}

async function unchangedMain(page: Page) {
  assert.equal(await page.getByTestId('learner-main-content').getAttribute('data-instance-witness'), 'original')
  await page.getByTestId('learner-learning-progress').waitFor()
  await page.getByTestId('learner-active-goal-banner').waitFor()
  assert.equal(await page.locator('.lum-inspector').count(), 0, 'the original GoalCard supplies the details')
}

async function waitDrawer(page: Page, open: boolean) {
  await page.waitForFunction(expected => {
    const rect = document.getElementById('learner-goal-sidebar')?.getBoundingClientRect()
    return Boolean(rect && (expected ? rect.left >= -1 : rect.right <= 1))
  }, open)
}

async function scenarioRefreshRace(page: Page) {
  // Capture an actual older fixture response before holding its delivery. The
  // completed scenario must refresh independently and survive that stale reply.
  const probe = await page.evaluateHandle(() => {
    const originalFetch = window.fetch
    let release!: () => void
    const heldResponse = new Promise<void>(resolve => { release = resolve })
    type Summary = { revision: number; achieved: number; target: number }
    const probe = { held: null as Summary | null, responses: [] as Summary[], release,
      restore() { window.fetch = originalFetch } }
    window.fetch = async (input, init) => {
      const response = await originalFetch(input, init)
      const url = new URL(input instanceof Request ? input.url : String(input), location.origin)
      if (url.pathname.endsWith('/learning-plans') && (init?.method ?? 'GET') === 'GET') {
        const payload = await response.clone().json() as { plans: { revision: number }[];
          status: { subjects: { subjectKey: string; learningScope: { achievedGoalCount: number; targetGoalCount: number } }[] } }
        const scope = payload.status.subjects.find(subject => subject.subjectKey === 'mathematik')!.learningScope
        const summary = { revision: payload.plans[0].revision, achieved: scope.achievedGoalCount, target: scope.targetGoalCount }
        probe.responses.push(summary)
        if (!probe.held) {
          probe.held = summary
          await heldResponse
        }
      }
      return response
    }
    return probe
  })
  const events: string[] = []
  const recordEvent = (message: { text: () => string }) => {
    if (message.text().startsWith('[SSE]')) events.push(message.text())
  }
  page.on('console', recordEvent)
  try {
    await page.getByTestId('full-cockpit-scenario').selectOption('memory')
    await page.waitForFunction(probe => probe.held !== null, probe)
    assert.deepEqual(await probe.evaluate(probe => [probe.held?.achieved, probe.held?.target]), [0, 2])
    const completedRefreshFinished = page.waitForEvent('console', { predicate: message => message.text() === '[SSE] ✅ Preferences refresh complete' })
    await page.getByTestId('full-cockpit-scenario').selectOption('completed')
    const progress = page.getByTestId('learner-plan-subject-mathematik').getByTestId('learner-plan-achieved-goals')
    await progress.filter({ hasText: '2 von 2' }).waitFor()
    await unchangedMain(page)
    await completedRefreshFinished
    const olderRefreshFinished = page.waitForEvent('console', { predicate: message => message.text() === '[SSE] ✅ Preferences refresh complete' })
    await probe.evaluate(probe => probe.release())
    await olderRefreshFinished
    assert.equal(await progress.innerText(), '2 von 2', 'an older scenario response must not replace the completed scenario')
  } finally {
    console.log('Full Cockpit scenario refresh race:', JSON.stringify({
      ...await probe.evaluate(probe => ({ held: probe.held, responses: probe.responses,
        scenario: (document.querySelector('[data-testid="full-cockpit-scenario"]') as HTMLSelectElement)?.value,
        selectedGoalId: document.querySelector('[data-testid="full-cockpit-comparison"]')?.getAttribute('data-selected-goal-id'),
        progress: document.querySelector('[data-testid="learner-plan-subject-mathematik"] [data-testid="learner-plan-achieved-goals"]')?.textContent,
        mainWitness: document.querySelector('[data-testid="learner-main-content"]')?.getAttribute('data-instance-witness') })), events,
    }))
    await probe.evaluate(probe => { probe.release(); probe.restore() })
    await probe.dispose()
    page.off('console', recordEvent)
  }
  await page.getByTestId('full-cockpit-scenario').selectOption('ordinary')
  await page.getByTestId('learner-plan-subject-mathematik').getByTestId('learner-plan-achieved-goals').filter({ hasText: '0 von 2' }).waitFor()
  await page.locator('.learner-cockpit-selection img').waitFor()
  await unchangedMain(page)
}

try {
  await mkdir(artifacts, { recursive: true })
  const page = await open(1440)
  const comparison = page.getByTestId('full-cockpit-comparison')
  const main = page.getByTestId('learner-main-content')
  const sidebar = page.locator('#learner-goal-sidebar')
  const selected = page.locator('.learner-cockpit-selection')
  assert.equal(await mapDialog(page).isVisible(), false)
  assert.equal(await sidebar.getByRole('button', { name: /Lernkarte/u }).count(), 0, 'the goal menu keeps only the tree')
  await actionsShareTopRow(page, 'desktop')
  const originalWidth = await sidebar.evaluate(element => element.getBoundingClientRect().width)
  await main.evaluate(element => element.setAttribute('data-instance-witness', 'original'))
  await selected.locator('img').waitFor()
  await selected.locator('img').evaluate(async (image: HTMLImageElement) => { if (!image.complete) await image.decode() })
  assert.ok(await selected.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth > 0))
  await page.screenshot({ path: `${artifacts}/10-full-classic.png` })

  stage = 'scenario refresh replaces an older in-flight fixture response without remounting'
  await scenarioRefreshRace(page)

  stage = 'full-window navigation map, original GoalCard, separate active goal and unchanged tree width'
  await openMap(page, data.mathScopeId)
  await unchangedMain(page)
  assert.equal(await selected.locator('img').count(), 1, 'the original GoalCard stays mounted behind the map')
  await page.locator(`[data-entry-id="${data.assessmentId}"] .lum-node-main`).focus()
  assert.equal(await comparison.getAttribute('data-selected-goal-id'), data.ordinaryId, 'keyboard focus highlights without selecting another original goal')
  await page.locator(`[data-entry-id="${data.assessmentId}"] .lum-node-main`).click()
  await page.waitForFunction(id => document.querySelector('[data-testid="full-cockpit-comparison"]')?.getAttribute('data-selected-goal-id') === id, data.assessmentId)
  assert.equal(await comparison.getAttribute('data-active-goal-id'), data.ordinaryId)
  assert.equal(await mapDialog(page).isVisible(), true, 'choosing a goal keeps the map open')
  await unchangedMain(page)
  await page.screenshot({ path: `${artifacts}/14-full-map.png` })
  await closeMap(page)
  await selected.getByText('Prüfungsaufgabe', { exact: true }).waitFor()
  assert.equal(await sidebar.evaluate(element => element.getBoundingClientRect().width), originalWidth)
  await unchangedMain(page)
  await page.getByTestId('full-cockpit-scenario').selectOption('ordinary')
  await selected.locator('img').waitFor()
  assert.equal(await comparison.getAttribute('data-selected-goal-id'), data.ordinaryId)

  stage = 'original settings, material selection and weekly plan instruments'
  await sidebar.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
  const settings = page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
  await settings.waitFor()
  for (const label of ['Nach Plan lernen', 'Strict Mode aktivieren', 'Prüfungsabkürzungen anbieten', 'Lernzielbilder im Chat anzeigen']) {
    assert.equal(await settings.getByRole('checkbox', { name: new RegExp(`^${label}(?:\\s|$)`) }).count(), 1, label)
  }
  await settings.getByRole('radio', { name: '1 Woche', exact: true }).check()
  await settings.locator('summary').filter({ hasText: 'Zusätzliche Lernmaterialien' }).click()
  await settings.getByRole('checkbox', { name: /Materialpaket · UI-Testdaten/ }).waitFor()
  await settings.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await settings.getByText('Materialauswahl gespeichert.', { exact: true }).waitFor()
  await page.screenshot({ path: `${artifacts}/11-full-settings.png` })
  await settings.getByRole('button', { name: 'Fertig', exact: true }).click()
  await settings.waitFor({ state: 'hidden' })
  await page.getByTestId('learner-learning-progress').getByText(/diese woche/i).first().waitFor()
  await unchangedMain(page)
  await page.screenshot({ path: `${artifacts}/12-full-plan.png` })

  stage = 'original SRS drill survives opening/closing the map and original coach setup'
  await page.getByTestId('full-cockpit-scenario').selectOption('memory')
  await page.getByRole('button', { name: /^Karteikarten lernen/ }).click()
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
  const flip = page.getByRole('button', { name: 'Zum Umdrehen tippen', exact: true })
  assert.equal(await flip.getAttribute('aria-pressed'), 'true')
  await flip.evaluate(element => element.setAttribute('data-drill-instance-witness', 'original'))
  const cardText = await selected.innerText()
  await openMap(page, data.mathLandscapeId)
  await unchangedMain(page)
  await closeMap(page)
  assert.equal(await selected.innerText(), cardText)
  assert.equal(await flip.getAttribute('aria-pressed'), 'true')
  assert.equal(await flip.getAttribute('data-drill-instance-witness'), 'original')
  assert.equal(await sidebar.evaluate(element => element.getBoundingClientRect().width), originalWidth)
  await page.screenshot({ path: `${artifacts}/13-full-srs.png` })
  await page.getByTestId('learner-coach-start-link').click()
  const setup = page.getByRole('region', { name: 'Coach einrichten' })
  await setup.waitFor()
  const legal = getLegalTermsCopy('de')
  const localTerms = setup.getByRole('checkbox', { name: legal.acceptanceLabel, exact: true })
  if (await localTerms.isVisible()) {
    // Exercise the original gate in isolated fixture storage; no real account or service is involved.
    await localTerms.check()
    await setup.getByRole('button', { name: legal.confirmButton, exact: true }).click()
  }
  await setup.getByTestId('coach-provider-choice').waitFor()
  assert.equal(await main.count(), 1, 'original LearnerView remains mounted behind setup')
  await page.getByRole('button', { name: '← Zum Cockpit', exact: true }).click()
  await unchangedMain(page)
  assert.equal(await selected.innerText(), cardText)
  assert.equal(await flip.getAttribute('aria-pressed'), 'true')
  assert.equal(await flip.getAttribute('data-drill-instance-witness'), 'original')

  stage = 'same explicit and implicit icons, whole-subject and plan-scope counts'
  await page.getByTestId('full-cockpit-scenario').selectOption('completed')
  await selected.getByText('Prüfungsaufgabe', { exact: true }).waitFor()
  const mathProgress = page.getByTestId('learner-plan-subject-mathematik')
  await mathProgress.getByTestId('learner-plan-achieved-goals').filter({ hasText: '2 von 2' }).waitFor()
  assert.match(await mathProgress.getByTestId('learner-plan-whole-subject-progress').innerText(), /2 von 55/)
  assert.match(await mathProgress.getByTestId('learner-plan-period-gauge').innerText(), /1 von 8/)
  const treeOrdinary = sidebar.locator(`[data-goal-id="${data.ordinaryId}"]`)
  await treeOrdinary.getByTestId('completion-tree-waiver').waitFor()
  assert.equal(await treeOrdinary.locator('.lucide-shield-check').count(), 1)
  assert.equal(await sidebar.locator(`[data-goal-id="${data.assessmentId}"] .lucide-check`).count(), 1)
  await openMap(page, data.mathScopeId)
  const ordinaryNode = page.locator(`[data-entry-id="${data.ordinaryId}"]`)
  const examNode = page.locator(`[data-entry-id="${data.assessmentId}"]`)
  await ordinaryNode.locator('.lum-node-state.is-implicit .lucide-shield-check').waitFor()
  await examNode.locator('.lum-node-state.is-explicit .lucide-check').waitFor()
  await unchangedMain(page)
  await page.screenshot({ path: `${artifacts}/16-full-map-completed.png` })
  await closeMap(page)

  stage = 'original data management, export/import and deletion confirmation'
  await sidebar.getByRole('button', { name: 'Daten & SkillPilot-ID', exact: true }).click()
  // Its accessible name intentionally changes on the original delete-confirmation step.
  const management = page.getByRole('dialog')
  await management.waitFor()
  for (const name of ['Lernstand exportieren', 'Sicherungsdatei importieren', 'SkillPilot-ID und Daten löschen']) {
    assert.equal(await management.getByRole('button', { name, exact: true }).isVisible(), true)
  }
  await management.getByRole('button', { name: 'SkillPilot-ID und Daten löschen', exact: true }).click()
  await page.getByRole('heading', { name: 'Löschung endgültig bestätigen', exact: true }).waitFor()
  assert.equal(await management.getByRole('button', { name: 'Endgültig löschen', exact: true }).isDisabled(), true)
  await management.getByRole('button', { name: 'Dialog schließen', exact: true }).click()
  await page.getByRole('heading', { name: 'Daten & SkillPilot-ID', exact: true }).waitFor()
  await management.getByRole('button', { name: 'Dialog schließen', exact: true }).click()
  await management.waitFor({ state: 'hidden' })
  await sidebar.getByRole('button', { name: 'Daten & SkillPilot-ID', exact: true }).click()
  const pendingDownload = page.waitForEvent('download')
  await management.getByRole('button', { name: 'Lernstand exportieren', exact: true }).click()
  const downloaded = await pendingDownload
  const downloadedPath = await downloaded.path()
  assert.ok(downloadedPath)
  const archive = await readFile(downloadedPath)
  const parsed = JSON.parse(archive.toString())
  assert.equal(parsed.serverExport.schema, 'skillpilot-local-cockpit-demo/v1')
  assert.deepEqual(parsed.serverExport.snapshot.mastery, { [data.assessmentId]: 1 })
  assert.deepEqual(parsed.serverExport.snapshot.implicitGoalIds, [data.ordinaryId])
  const pendingChooser = page.waitForEvent('filechooser')
  await management.getByRole('button', { name: 'Sicherungsdatei importieren', exact: true }).click()
  const chooser = await pendingChooser
  const originalReload = page.waitForEvent('domcontentloaded')
  await chooser.setFiles({ name: 'local-cockpit-demo.json', mimeType: 'application/json', buffer: archive })
  await originalReload
  await ready(page)
  assert.equal(new URL(page.url()).origin, origin, 'the original import reload stays on this local prototype')

  stage = '320/390px full-window map, original mobile menu, no overflow and original close'
  for (const width of [320, 390]) {
    const mobile = await open(width)
    await actionsShareTopRow(mobile, `${width}px`)
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `cockpit at ${width}`)
    await openMap(mobile, data.mathScopeId)
    // The second sibling can be outside a narrow, culled viewport; the selected A is visible.
    await mobile.locator(`[data-entry-id="${data.ordinaryId}"] .lum-node-main`).focus()
    assert.equal(await mobile.getByTestId('full-cockpit-comparison').getAttribute('data-selected-goal-id'), data.ordinaryId)
    assert.equal(await mobile.locator('.lum-inspector').count(), 0)
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `map at ${width}`)
    await mobile.screenshot({ path: `${artifacts}/15-full-navigation-map-${width}.png` })
    await closeMap(mobile)
    const opener = mobile.getByRole('button', { name: 'Lernzielmenü öffnen', exact: true })
    await opener.focus()
    await mobile.keyboard.press('Enter')
    await waitDrawer(mobile, true)
    await mobile.getByRole('button', { name: 'Lernzielmenü schließen', exact: true }).click()
    await waitDrawer(mobile, false)
    assert.equal(await mobile.getByTestId('learner-learning-progress').isVisible(), true)
    assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `tree at ${width}`)
    await mobile.screenshot({ path: `${artifacts}/15-full-classic-${width}.png` })
    await mobile.context().close()
  }

  stage = 'natural double-click opens an unselected unit without selection echo or pointer movement'
  for (const motion of ['no-preference', 'reduce'] as const) {
    const drill = await open(1440, motion)
    const drillComparison = drill.getByTestId('full-cockpit-comparison')
    await openMap(drill, data.mathScopeId)
    await drill.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await drill.locator(`.lum-canvas[data-scope-id="${data.mathLandscapeId}"][aria-busy="false"]`).waitFor()
    const unit = drill.locator(`[data-entry-id="${data.contextId}"] .lum-node-main`)
    assert.equal(await drillComparison.getAttribute('data-selected-goal-id'), data.ordinaryId)
    await unit.evaluate(element => {
      element.setAttribute('data-native-double-clicks', '0')
      element.addEventListener('dblclick', () => element.setAttribute('data-native-double-clicks', '1'))
    })
    const originalButton = await unit.elementHandle()
    const box = await unit.boundingBox()
    assert.ok(originalButton && box)
    // A fixed pointer with a human click interval catches DOM replacement and
    // automatic panning between clicks; a zero-delay locator dblclick does not.
    await drill.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2, { delay: 120 })
    await drill.locator(`.lum-canvas[data-scope-id="${data.contextId}"][aria-busy="false"]`).waitFor()
    assert.equal(await originalButton.getAttribute('data-native-double-clicks'), '1')
    assert.equal(await drillComparison.getAttribute('data-selected-goal-id'), data.contextId)
    assert.equal(await drillComparison.getAttribute('data-active-goal-id'), data.ordinaryId)
    assert.equal(await drill.locator('.lum-node-open').count(), 0, 'The context contains leaf goals, not further scopes')
    await drill.screenshot({ path: `${artifacts}/16-full-open-context-${motion}.png` })

    const leaf = drill.locator('[data-entry-kind="goal"] .lum-node-main').first()
    const leafId = await leaf.evaluate(element => element.closest('[data-entry-id]')?.getAttribute('data-entry-id'))
    assert.ok(leafId)
    await leaf.click()
    assert.equal(await drillComparison.getAttribute('data-selected-goal-id'), leafId)
    assert.equal(await drillComparison.getAttribute('data-active-goal-id'), data.ordinaryId)
    await leaf.press('Enter')
    assert.equal(await drill.getByTestId('learning-map-board').getAttribute('data-scope-id'), data.contextId)
    await leaf.dblclick({ modifiers: ['Shift'], delay: 120 })
    await drill.locator(`.lum-canvas[data-scope-id="${data.mathLandscapeId}"][aria-busy="false"]`).waitFor()
    await drill.locator(`[data-entry-id="${data.contextId}"] .lum-node-open`).click()
    await drill.locator(`.lum-canvas[data-scope-id="${data.contextId}"][aria-busy="false"]`).waitFor()
    // The active-goal reveal is part of the Cockpit; the reopened map follows it.
    await closeMap(drill)
    await drill.getByTestId('learner-active-goal-banner').getByRole('button', { name: 'Gehe zum aktiven Ziel', exact: true }).click()
    await openMap(drill, data.mathScopeId)
    assert.equal(await drillComparison.getAttribute('data-selected-goal-id'), data.ordinaryId)
    await drill.context().close()
  }
  assert.deepEqual(rejected, [], 'No API, external network, or write may leave the local adapter')
  assert.deepEqual(errors, [], 'No browser errors or unknown API fallback')
  console.log('Full original Cockpit navigation passed: tree plus full-window map, unchanged main/SRS, selection versus active goal, original settings/materials/plan/data/provider, explicit/implicit icons and 320/390px.')
} catch (error) {
  console.error(`Full Cockpit navigation failed at: ${stage}`)
  await lastPage?.screenshot({ path: `${artifacts}/failure.png` }).catch(() => {})
  throw error
} finally {
  await browser.close()
  await server?.close()
}
