import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type BrowserContext, type Page } from 'playwright'
import { createServer } from 'vite'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import { nativeMapDeck, nativeMapIds as id, nativeMapLandscapes, nativeMapProfile, nativeMapSections as section,
  nativeMapView } from './fixtures/nativeLearningMapData'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const artifacts = fileURLToPath(new URL('../../tmp/s1-cockpit-map/', import.meta.url))
const cacheDir = await mkdtemp(join(tmpdir(), 'skillpilot-native-map-'))
// Use the production index.html, main.tsx and App. Only service-worker
// registration is stubbed: its lifecycle has a separate production-build test.
// HTTP/SSE adapters below live in the test, never in the application bundle.
const server = await createServer({
  root: appRoot, configFile: false, cacheDir, logLevel: 'error',
  define: { 'import.meta.env.VITE_API_BASE': JSON.stringify('') },
  plugins: [react(), tailwindcss(), {
    name: 'native-map-test-no-service-worker',
    resolveId(source) { if (source === 'virtual:pwa-register') return '\0native-map-test-pwa' },
    load(source) { if (source === '\0native-map-test-pwa') return 'export const registerSW = () => () => {}' },
  }],
  optimizeDeps: { entries: ['index.html'], include: ['react/jsx-dev-runtime'] },
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false },
})
await server.listen()
const address = server.httpServer?.address()
assert.ok(address && typeof address !== 'string')
const origin = `http://127.0.0.1:${address.port}`
const browser = await chromium.launch({ headless: true })
const contexts: BrowserContext[] = []
let stage = 'startup'
let lastPage: Page | null = null

async function open(width = 1440, failLayoutWorker = false, reducedMotion: 'reduce' | 'no-preference' = 'reduce') {
  const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion, serviceWorkers: 'block' })
  contexts.push(context)
  // tsx preserves names in serialized test classes with this helper. Supply it
  // for Playwright's browser-side transport stub, where the Node helper is absent.
  await context.addInitScript('globalThis.__name = (target) => target')
  await context.addInitScript(({ learner, root, terms, failLayoutWorker }) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_theme', 'light')
    localStorage.setItem('skillpilot_role', 'learner')
    localStorage.setItem('skillpilot_id', learner)
    localStorage.setItem('skillpilot_learner_landscape', root)
    localStorage.setItem('skillpilot_terms_accepted_version', terms)
    // Keep a bounded pointer/DOM trace for diagnosing real App rerenders if a
    // semantic double-click fails; it never changes application event handling.
    const pointerTrace: unknown[] = []
    const instances = new WeakMap<Element, number>()
    let nextInstance = 0
    Object.assign(window, { nativeMapPointerTrace: pointerTrace })
    for (const type of ['click', 'dblclick']) document.addEventListener(type, event => {
      const main = (event.target as Element)?.closest('.lum-node-main')
      if (!main) return
      if (!instances.has(main)) instances.set(main, ++nextInstance)
      pointerTrace.push({ type, detail: (event as MouseEvent).detail, instance: instances.get(main),
        entry: main.closest('[data-entry-id]')?.getAttribute('data-entry-id'),
        scope: document.querySelector('.lum-canvas')?.getAttribute('data-scope-id'),
        camera: document.querySelector<HTMLElement>('.react-flow__viewport')?.style.transform })
      if (pointerTrace.length > 12) pointerTrace.shift()
    }, true)
    if (failLayoutWorker) Object.defineProperty(window, 'Worker', { configurable: true, value: new Proxy(Worker, {
      construct(target, args) {
        if (String(args[0]).includes('elk-worker')) throw new Error('Controlled native-map layout worker failure')
        return Reflect.construct(target, args)
      },
    }) })
    class TestEventSource extends EventTarget {
      readonly readyState = 1
      readonly url: string
      onopen: ((event: Event) => void) | null = null
      onmessage: ((event: MessageEvent) => void) | null = null
      onerror = null
      private readonly receive = (event: Event) => {
        const detail = (event as CustomEvent).detail
        this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(detail) }))
      }
      constructor(url: string | URL) {
        super()
        this.url = String(url)
        if (!this.url.endsWith(`/api/ui/updates/${learner}`)) throw new Error(`Unexpected SSE URL: ${this.url}`)
        window.addEventListener('native-map-test-sse', this.receive)
        queueMicrotask(() => this.onopen?.(new Event('open')))
      }
      close() { window.removeEventListener('native-map-test-sse', this.receive) }
    }
    Object.defineProperty(window, 'EventSource', { configurable: true, value: TestEventSource })
  }, { learner: id.learner, root: id.root, terms: CURRENT_TERMS_VERSION, failLayoutWorker })
  const page = await context.newPage()
  lastPage = page
  const errors: string[] = []
  const unexpected: string[] = []
  const requests: string[] = []
  const writes: Array<{ path: string; body: unknown }> = []
  let physicsOnly = false
  let planned: string[] = [id.section]
  let active: string = id.application
  let choosingSubjects = false
  const subjectOption = (landscapeId: string, label: string) => ({
    optionId: landscapeId === id.physics ? 'physics-only' : 'mathematics', stageId: 'subjects', groupId: 'subjects', groupInstanceId: 'native-subjects',
    landscapeId, landscapeLabel: label, filterId: null, filterLabel: null, scopeKey: null, scopeValue: null, scopeLabel: null, kind: 'VALUE',
  })
  const physicsOption = subjectOption(id.physics, 'Physik')
  const personalPlan = () => ({
    stage: choosingSubjects ? 'SELECTION' : 'COMPLETE', stageId: choosingSubjects ? 'subjects' : null,
    stageLabel: choosingSubjects ? 'Fächer auswählen' : null, groupId: choosingSubjects ? 'subjects' : null,
    groupLabel: choosingSubjects ? 'Fächer auswählen' : null, groupInstanceId: choosingSubjects ? 'native-subjects' : null,
    minSelections: choosingSubjects ? 1 : 0, maxSelections: choosingSubjects ? 1 : 0, selectedCount: 0,
    options: choosingSubjects ? [physicsOption] : [], displayOptions: choosingSubjects ? [physicsOption] : [], navigationOptions: [], currentSelectedOptions: [],
    currentRewindId: null, completedDecisions: choosingSubjects ? [] : [{ rewindId: 'native-subjects-change', stageLabel: 'Fächer',
      selectedOptions: physicsOnly ? [physicsOption] : [subjectOption(id.math, 'Mathematik'), physicsOption] }],
    preservedDecisions: [], pendingDecisions: [], canReopenMigratedPersonalization: false, problemCode: null,
  })
  const mastery = { [id.foundation]: 1 }
  const state = () => ({
    activeGoal: { id: active }, frontier: [{ id: active }],
    goals: { planned: planned.map(goalId => ({ id: goalId })), mastered_count: 1, total_count: physicsOnly ? 1 : 5,
      personalized: { mastered_atomic: 1, total_atomic: physicsOnly ? 1 : 5 } },
    stateMachine: { activeGoal: { id: active }, goalOptions: [], requiredAction: null },
  })
  page.on('pageerror', error => errors.push(error.message))
  await context.route('**/*', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    requests.push(`${request.method()} ${path}`)
    const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.origin !== origin) {
      unexpected.push(`${request.method()} ${url.origin}${path}`)
      return route.abort()
    }
    if (path === '/fixtures/native-map-goal.svg') return route.fulfill({ contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><path d="M20 100L220 20M20 100L160 80" stroke="blue" stroke-width="3"/></svg>' })
    if (path === '/fixtures/native-vectors-deck.json') return json(nativeMapDeck)
    if (!path.startsWith('/api/')) return route.continue()
    if (path === '/api/ui/curriculum-catalog') return json({ error: 'Repository curriculum mode' }, 404)
    if (path === '/api/ui/landscapes') return json({ summaries: nativeMapLandscapes.map(landscape => ({
      curriculumId: landscape.landscapeId, title: landscape.title, subject: landscape.subject ?? 'Gymnasium',
      filename: `${landscape.landscapeId}.json`, frameworkId: 'canonical-gymnasium', country: 'DE', region: 'DE',
      type: 'GYMNASIUM', level: 'Sekundarstufe', locale: 'de-DE', schoolType: 'Gymnasium', qualityMaturity: 'M6',
    })) })
    if (path === '/api/ui/composition-views/match') {
      assert.equal(url.searchParams.get('stage'), 'SekII')
      return json(nativeMapView(url.searchParams.get('landscapeId')!, physicsOnly))
    }
    if (path === `/api/ui/learners/${id.learner}/landscapes/${id.root}/closure`) {
      return json(physicsOnly ? nativeMapLandscapes.filter(landscape => landscape.landscapeId !== id.math) : nativeMapLandscapes)
    }
    if (path === `/api/ui/learners/${id.learner}` && request.method() === 'GET') return json(nativeMapProfile(physicsOnly))
    const suffix = path.replace(`/api/ui/learners/${id.learner}`, '')
    if (suffix === '/resume' && ['GET', 'POST'].includes(request.method())) return json({ lastActivityAt: '2026-11-05T08:00:00Z', scheduledDeletionAt: '2027-05-05T08:00:00Z' })
    if (suffix === '/mastery' && request.method() === 'GET') return json({ mastery })
    if (suffix === '/state' && request.method() === 'GET') return json(state())
    if (suffix === '/unit-introduction' && request.method() === 'GET') return json({ orientationGoalId: null })
    if (suffix === '/learning-plans' && request.method() === 'GET') return json({ asOf: '2026-11-05', followLearningPlans: false, plans: [],
      status: { asOf: '2026-11-05', periodBasis: 'DAY', periodStart: '2026-11-05', periodEnd: '2026-11-05', timeZone: 'Europe/Berlin', language: 'de',
        evaluable: false, statusText: '', noticeText: null, activeGoal: null, followLearningPlans: false, resumeAvailable: false, subjects: [], unavailablePlanCount: 0 } })
    if (suffix === '/personalization-plan' && request.method() === 'GET') return json(personalPlan())
    if (suffix === '/personalization-rewind' && request.method() === 'POST') {
      writes.push({ path, body: request.postDataJSON() })
      choosingSubjects = true
      return json(personalPlan())
    }
    if (suffix === '/personalization-options' && request.method() === 'POST') {
      const body = request.postDataJSON() as { optionId: string }
      writes.push({ path, body })
      assert.equal(body.optionId, physicsOption.optionId)
      physicsOnly = true
      choosingSubjects = false
      active = id.physicsGoal
      planned = [id.physicsRoot]
      return json(personalPlan())
    }
    if (suffix === `/client-state/${id.memory}` && request.method() === 'GET') return json({ srsState: {}, updatedAt: '2026-11-05T08:00:00Z' })
    if (suffix === '/planned' && request.method() === 'PUT') {
      const body = request.postDataJSON() as { goals: string[] }
      writes.push({ path, body })
      planned = [...body.goals]
      return json({ state: state() })
    }
    if (suffix === '/content-selection' || suffix === '/content-materials') return json({ error: 'Optional pilot disabled' }, 404)
    unexpected.push(`${request.method()} ${path}`)
    return json({ error: 'Unexpected isolated browser request' }, 404)
  })
  await page.goto(`${origin}/learner/${id.application}?l=${id.root}`)
  await page.getByTestId('learner-current-goal').getByRole('heading', { name: 'Skalarprodukte anwenden', exact: true }).waitFor({ timeout: 30_000 })
  await page.getByTestId('learner-active-goal-banner').waitFor()
  await page.getByTestId('learner-progress-loading').waitFor({ state: 'hidden' })
  return { page, context, errors, unexpected, requests, writes, mastery,
    changePersonalCurriculum: async () => {
      await sidebarSettings(page).click()
      const settings = page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
      await Promise.all([
        page.waitForResponse(response => new URL(response.url()).pathname.endsWith(`/landscapes/${id.root}/closure`)),
        settings.getByRole('button', { name: /^Fächer ändern, derzeit /u }).click(),
      ])
      // The existing authored scope refresh remounts the workspace. Continue
      // through its settings surface with the returned selection plan.
      await settings.waitFor({ state: 'hidden' })
      await sidebarSettings(page).click()
      await settings.getByRole('button', { name: 'Physik', exact: true }).click()
      await settings.waitFor({ state: 'hidden' })
    },
  }
}

const mapDialog = (page: Page) => page.getByTestId('learner-learning-map-dialog')
const mapRoot = '__learner_goal_map_root__'
const mapOpener = (page: Page) => page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open')
async function openMap(page: Page) {
  await mapOpener(page).click()
  await mapDialog(page).waitFor()
  assert.equal(await mapOpener(page).getAttribute('aria-expanded'), 'true')
}
async function closeMap(page: Page) {
  await mapDialog(page).getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
  await mapDialog(page).waitFor({ state: 'hidden' })
  assert.equal(await mapOpener(page).getAttribute('aria-expanded'), 'false')
}
async function scope(page: Page, goalId: string) {
  await page.locator(`.lum-canvas[data-scope-id="${goalId}"][aria-busy="false"]`).waitFor()
  const map = page.getByTestId('native-cockpit-map')
  assert.equal(await map.locator('.lum-scope-actions, .lum-inspector, .unit-introduction, [data-testid="unit-assessment-summary"], [data-testid="learner-unit-assignment"], [data-testid="learning-map-flashcard-practice"]').count(), 0,
    'every normal and nested map scope contains the graph without learning, assessment or assignment panels')
  assert.equal(await map.locator('.lum-workspace > :not(.lum-canvas)').count(), 0,
    'the graph occupies the whole map workspace without an information sidebar')
}
async function fillsWindow(page: Page, label: string) {
  const viewport = page.viewportSize()
  const box = await mapDialog(page).boundingBox()
  assert.ok(viewport && box)
  assert.deepEqual([box.x, box.y, box.width, box.height].map(Math.round), [0, 0, viewport.width, viewport.height], `${label}: the learning map uses the entire window`)
  const board = await page.getByTestId('learning-map-board').boundingBox()
  assert.ok(board && board.width >= viewport.width - 1 && board.height >= viewport.height * 0.75, `${label}: the map board fills the window below its header`)
}
const node = (page: Page, goalId: string) => page.locator(`[data-entry-id="${goalId}"] .lum-node-main`)
const selectedTitle = (page: Page, title: string) => page.getByTestId('learner-current-goal').getByRole('heading', { name: title, exact: true }).waitFor()
// While the full-window map is open, the Cockpit selection is visible on the map adapter.
const mapSelection = (page: Page, goalId: string) => page.locator(`[data-testid="native-cockpit-map"][data-selected-goal-id="${goalId}"]`).waitFor({ state: 'attached' })
const focusedTestId = (page: Page, testId: string) => page.waitForFunction(expected => document.activeElement?.getAttribute('data-testid') === expected, testId)
const sidebarSettings = (page: Page) => page.locator('#learner-goal-sidebar').getByRole('button', { name: 'Einstellungen öffnen', exact: true })
const afterEffects = (page: Page) => page.evaluate(() => new Promise<void>(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
}))

try {
  await mkdir(artifacts, { recursive: true })
  const h = await open()
  const { page } = h
  const main = page.getByTestId('learner-main-content')
  const sidebar = page.locator('#learner-goal-sidebar')
  assert.equal(await sidebar.getByRole('button', { name: /Lernkarte/u }).count(), 0, 'the goal menu keeps only the tree')
  assert.equal(await mapOpener(page).getAttribute('aria-expanded'), 'false')
  assert.equal(await mapDialog(page).isVisible(), false)
  const [openerBox, startBox, mainBox] = await Promise.all([mapOpener(page).boundingBox(),
    main.getByTestId('learner-coach-start-link').boundingBox(), main.boundingBox()])
  assert.ok(openerBox && startBox && mainBox)
  assert.ok(Math.abs((openerBox.y + openerBox.height / 2) - (startBox.y + startBox.height / 2)) < 1, 'Lernkarte and Lernen starten share one row')
  assert.ok(openerBox.x + openerBox.width <= startBox.x && startBox.x - (openerBox.x + openerBox.width) <= 12, 'Lernkarte sits directly beside Lernen starten')
  assert.ok(mainBox.x + mainBox.width - (startBox.x + startBox.width) <= 48 && openerBox.y - mainBox.y <= 40, 'both actions sit at the top right of the main window')
  assert.equal(h.requests.some(path => /learningUnitMap|elkjs|elk-worker/u.test(path)), false, 'classic startup must not fetch a map module or layout worker')
  assert.equal(h.requests.some(path => /\/prototypes\//u.test(path)), false, 'real product entry must not use prototype data or adapters')
  assert.equal(h.requests.some(path => path.includes(`/api/ui/landscapes/${id.root}/closure`)), false, 'canonical learner startup must use the scoped closure')
  assert.equal(await sidebar.locator(`[data-goal-id="${id.support}"]`).count(), 0, 'prerequisiteOnly support is absent from tree targets')
  await main.evaluate(element => element.setAttribute('data-native-instance-witness', 'original'))
  const classicWidth = await sidebar.evaluate(element => element.getBoundingClientRect().width)
  const goalImage = page.locator('.learner-cockpit-selection img')
  await goalImage.waitFor()
  await goalImage.evaluate(async (image: HTMLImageElement) => { if (!image.complete) await image.decode() })
  assert.equal(await goalImage.count(), 1, 'the original goal card displays its one native learning image')
  await page.screenshot({ path: join(artifacts, '01-native-classic.png') })

  stage = 'full-window native map navigation and result/state isolation'
  await openMap(page)
  // The learner map is the unit map: the active goal opens on the board of its unit "Vektorrechnung".
  await scope(page, section.vectors)
  await fillsWindow(page, 'desktop')
  await page.screenshot({ path: join(artifacts, '02-native-map-full-window.png') })
  assert.equal(await page.getByTestId('native-cockpit-map').getAttribute('data-map-view'), 'units')
  // The construction-site note is a badge behind the dialog title; its detail is the tooltip, not a row of its own.
  const notice = mapDialog(page).locator('.learner-learning-map-header [role="note"][data-testid="learner-map-construction-notice"]')
  assert.equal(await notice.isVisible(), true)
  assert.ok((await notice.innerText()).startsWith('noch Baustelle'), `visible construction-site badge: ${await notice.innerText()}`)
  const noticeDetail = await notice.getAttribute('title') ?? ''
  assert.ok(noticeDetail.includes('Einheiten und Lernziele statt der Gliederung') && noticeDetail.includes('Abschnitte des Lehrplans')
    && noticeDetail.includes('nur Mathematik und Physik') && noticeDetail.includes('anderen Fächer findest du im Lernzielbaum'),
  `construction-site detail: ${noticeDetail}`)
  assert.equal(await page.locator('.lum-app [data-testid="learner-map-construction-notice"]').count(), 0, 'the map itself spends no row on the note')
  const subjectFilter = page.getByTestId('learner-map-subject-filter')
  assert.deepEqual(await subjectFilter.getByRole('button').evaluateAll(buttons => buttons.map(button => [button.textContent, button.getAttribute('aria-pressed')])),
    [['Mathematik', 'true'], ['Physik', 'true']], 'the subject filter offers exactly the subjects present')
  assert.equal(await page.locator('.lum-toolbar select').count(), 0, 'the map offers no choice of a top-down step')
  assert.equal(await page.getByRole('button', { name: /Zur (bisherigen|alten) Ansicht/u }).count(), 0, 'there is no switch to another map view')
  await page.getByTestId('native-cockpit-map').evaluate(element => element.setAttribute('data-native-map-witness', 'original'))
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')
  assert.equal(await page.locator('.lum-inspector').count(), 0)
  assert.equal(await page.locator('.learner-cockpit-selection img').count(), 1)
  assert.equal(await page.getByTestId('native-cockpit-map').locator('img').count(), 0, 'map navigation never duplicates the goal image')
  assert.equal(await page.locator(`[data-entry-id="${id.support}"]`).count(), 0)
  assert.equal(await page.locator(`[data-entry-id="${id.section}"]`).count(), 0, 'the cluster "Vektoren" is no unit and leaves the map')
  assert.deepEqual((await page.locator('.lum-node[data-entry-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-entry-id')))).sort(),
    [id.foundation, id.application, id.memory].sort(), 'the unit holds the goals of the removed cluster')
  assert.equal(await page.locator(`.lum-node[data-entry-id="${id.application}"]`).getAttribute('data-active-goal'), 'true',
    'the active learning goal stays marked in the unit map')
  assert.equal(await page.locator(`.lum-node[data-entry-id="${id.foundation}"] .lum-node-state`).getAttribute('class'),
    'lum-node-icon lum-node-state is-explicit', 'goal progress stays visible in the unit map')
  assert.equal(await page.locator('.lum-node-open').count(), 0, 'leaf goals never get a scope arrow')
  await node(page, id.foundation).focus()
  await afterEffects(page)
  await mapSelection(page, id.application)
  await page.keyboard.press('Enter')
  await mapSelection(page, id.foundation)
  assert.equal(await mapDialog(page).isVisible(), true, 'choosing a goal keeps the full-window map open')
  assert.equal(await page.getByTestId('native-cockpit-map').getAttribute('data-native-map-witness'), 'original', 'product navigation map remains mounted when selecting a goal')
  assert.ok((await page.getByTestId('learner-active-goal-banner').innerText()).includes('Skalarprodukte anwenden'))
  assert.deepEqual(h.writes, [], 'map selection and keyboard focus never write active goal, mastery or learning focus')
  assert.deepEqual(h.mastery, { [id.foundation]: 1 })

  stage = 'closing the map shows the goal chosen on the map'
  await closeMap(page)
  await selectedTitle(page, 'Vektoren darstellen')
  await focusedTestId(page, 'learner-current-goal')
  await sidebar.locator(`[data-goal-id="${id.foundation}"]`).waitFor()
  assert.equal(await sidebar.evaluate(element => element.getBoundingClientRect().width), classicWidth, 'the goal menu keeps its tree width')
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')

  stage = 'same-ID reveal and double-click scope navigation'
  await page.getByTestId('learner-active-goal-banner').getByRole('button', { name: 'Gehe zum aktiven Ziel', exact: true }).click()
  await selectedTitle(page, 'Skalarprodukte anwenden')
  await openMap(page)
  await scope(page, section.vectors)
  await mapSelection(page, id.application)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(page, section.stageUnit)
  await closeMap(page)
  await focusedTestId(page, 'learner-learning-map-open')
  // Selected goal still has the same ID while its containing scope is hidden.
  await page.getByTestId('learner-active-goal-banner').getByRole('button', { name: 'Gehe zum aktiven Ziel', exact: true }).click()
  await openMap(page)
  await scope(page, section.vectors)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(page, section.stageUnit)
  await node(page, section.vectors).dblclick({ delay: 100 })
  await scope(page, section.vectors)
  await mapSelection(page, section.vectors)
  const leaf = node(page, id.foundation)
  await leaf.dblclick({ delay: 100 })
  await mapSelection(page, id.foundation)
  await scope(page, section.vectors)
  await leaf.dblclick({ delay: 100, modifiers: ['Shift'] })
  await scope(page, section.stageUnit)
  assert.deepEqual(h.writes, [])
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')
  await page.screenshot({ path: join(artifacts, '02-native-map.png') })

  stage = 'one stage unit for both subjects, declared order and Rückgriff'
  assert.deepEqual((await page.locator('.lum-node[data-entry-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-entry-id')))).sort(),
    [section.vectors, id.other, id.physicsGoal].sort(), 'Sekundarstufe II holds the declared ordering position of the single Mathematics goal')
  assert.equal(await page.locator(`[data-entry-id="${section.analysis}"]`).count(), 0)
  assert.equal(await page.locator(`[data-entry-id="${id.other}"] .lum-node-meta`).innerText(), 'Fachziel · Änderungsraten')
  const vectorUnit = page.locator(`.lum-node[data-entry-id="${section.vectors}"]`)
  assert.equal(await vectorUnit.locator('.lum-node-meta').innerText(), 'Einheit · 1/3 mit Nachweis')
  assert.equal(await vectorUnit.locator('.lum-node-progress').getAttribute('aria-label'),
    '1 direkt nachgewiesen, 0 fachlich angerechnet, 2 offen.',
    'the unit reports its one directly demonstrated goal and the two goals still open')
  const [vectorsBox, analysisBox] = await Promise.all([node(page, section.vectors).boundingBox(), node(page, id.other).boundingBox()])
  assert.ok(vectorsBox && analysisBox && vectorsBox.x + vectorsBox.width < analysisBox.x,
    'the declared order, not the Rückgriff, sets the direction: the earlier unit stands on the left')
  const legend = page.getByTestId('learning-map-order-legend')
  assert.equal(await legend.isVisible(), true, 'the order legend explains the arrows between units')
  assert.ok((await legend.innerText()).includes('erklärte Reihenfolge') && (await legend.innerText()).includes('1 Rückgriff'))
  assert.equal(await page.locator('.react-flow__edge[aria-label^="Rückgriff: Vektorrechnung braucht Ziele aus Änderungsraten"]').count(), 1,
    'a goal of the earlier unit needing a goal of the later unit is marked as Rückgriff')
  assert.equal(await page.locator('.react-flow__edge[aria-label="Änderungsraten deuten kommt nach Vektorrechnung (erklärte Reihenfolge)"]').count(), 1)
  const backwardStroke = await page.locator('.react-flow__edge[aria-label^="Rückgriff"] path').first().evaluate(path => getComputedStyle(path).strokeDasharray)
  const declaredStroke = await page.locator('.react-flow__edge[aria-label$="(erklärte Reihenfolge)"] path').first().evaluate(path => getComputedStyle(path).strokeDasharray)
  assert.notEqual(backwardStroke, declaredStroke, 'a Rückgriff is drawn differently from the declared order')

  const declaredOrder = page.locator('.react-flow__edge[aria-label="Änderungsraten deuten kommt nach Vektorrechnung (erklärte Reihenfolge)"] .react-flow__edge-path')
  await node(page, section.vectors).click()
  await mapSelection(page, section.vectors)
  const highlightedOrder = await declaredOrder.evaluate(path => ({
    color: getComputedStyle(path).stroke, width: getComputedStyle(path).strokeWidth,
  }))
  await node(page, id.physicsGoal).click()
  await mapSelection(page, id.physicsGoal)
  const unrelatedOrder = await declaredOrder.evaluate(path => ({
    color: getComputedStyle(path).stroke, width: getComputedStyle(path).strokeWidth,
    opacity: getComputedStyle(path).opacity, dashed: getComputedStyle(path).strokeDasharray,
    marker: path.getAttribute('marker-end'),
  }))
  assert.equal(unrelatedOrder.opacity, '1', 'declared phase order remains fully visible when an unrelated goal is selected')
  assert.equal(unrelatedOrder.dashed, 'none', 'the declared order keeps its solid relation semantics')
  assert.ok(unrelatedOrder.marker?.startsWith('url('), 'the declared order keeps its arrowhead')
  assert.notEqual(highlightedOrder.color, unrelatedOrder.color, 'selection still highlights the adjacent order in blue')
  assert.ok(parseFloat(highlightedOrder.width) > parseFloat(unrelatedOrder.width), 'selection still emphasizes adjacent order lines')
  await page.screenshot({ path: join(artifacts, '02-native-order-unrelated-selection.png') })
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(page, mapRoot)
  assert.deepEqual(await page.locator('.lum-node[data-entry-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-entry-id'))),
    [section.stageUnit], 'subjects are filters, not nodes: the root shows one Sekundarstufe II')
  await node(page, section.stageUnit).dblclick({ delay: 100 })
  await scope(page, section.stageUnit)

  stage = 'subject filter'
  await page.getByTestId('learner-map-subject-filter').getByRole('button', { name: 'Physik', exact: true }).click()
  await page.locator(`[data-entry-id="${id.physicsGoal}"]`).waitFor({ state: 'detached' })
  assert.equal(await page.getByTestId('learner-map-subject-filter').getByRole('button', { name: 'Mathematik', exact: true }).isDisabled(), true,
    'the last visible subject cannot be hidden')
  await scope(page, section.stageUnit)
  await page.getByTestId('learner-map-subject-filter').getByRole('button', { name: 'Physik', exact: true }).click()
  await page.locator(`[data-entry-id="${id.physicsGoal}"]`).waitFor()
  await scope(page, section.stageUnit)
  await node(page, section.vectors).waitFor()
  assert.deepEqual(h.writes, [], 'the subject filter never writes learner state')

  stage = 'SRS answer survives opening and closing the full-window map'
  await node(page, section.vectors).dblclick({ delay: 100 })
  await scope(page, section.vectors)
  await node(page, id.memory).click()
  await mapSelection(page, id.memory)
  await closeMap(page)
  await selectedTitle(page, 'Vektoren erinnern')
  await page.getByRole('button', { name: /^Karteikarten lernen/u }).click()
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
  const flip = page.getByRole('button', { name: 'Zum Umdrehen tippen', exact: true })
  await flip.evaluate(element => element.setAttribute('data-native-drill-witness', 'original'))
  const answer = await page.locator('.learner-cockpit-selection').innerText()
  await openMap(page)
  assert.equal(await page.getByTestId('native-cockpit-map').getAttribute('data-native-map-witness'), 'original', 'the map keeps its state between openings')
  await closeMap(page)
  assert.equal(await sidebar.evaluate(element => element.getBoundingClientRect().width), classicWidth)
  assert.equal(await flip.getAttribute('aria-pressed'), 'true')
  assert.equal(await flip.getAttribute('data-native-drill-witness'), 'original')
  assert.equal(await page.locator('.learner-cockpit-selection').innerText(), answer)
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')

  stage = 'genuine tree focus, subject selection and changed Personal Curriculum'
  const physicsRow = sidebar.locator(`[data-goal-id="${id.physicsRoot}"]`)
  await physicsRow.waitFor()
  await Promise.all([
    page.waitForResponse(response => response.request().method() === 'PUT' && new URL(response.url()).pathname.endsWith('/planned')),
    physicsRow.getByRole('button', { name: 'Als Lernfokus setzen', exact: true }).click(),
  ])
  assert.deepEqual(h.writes.map(write => write.body), [{ goals: [id.physicsRoot] }])
  await physicsRow.click()
  await selectedTitle(page, 'Physik')
  await openMap(page)
  // The subject root is no map node; selecting it leads to the root board.
  await scope(page, mapRoot)
  await node(page, section.stageUnit).dblclick({ delay: 100 })
  await scope(page, section.stageUnit)
  await node(page, id.physicsGoal).click()
  await mapSelection(page, id.physicsGoal)
  await closeMap(page)
  await selectedTitle(page, 'Kräfte beschreiben')
  assert.ok((await page.getByTestId('learner-active-goal-banner').innerText()).includes('Skalarprodukte anwenden'), 'browsing a different subject does not change active learning')
  await h.changePersonalCurriculum()
  await page.getByTestId('learner-active-goal-banner').filter({ hasText: 'Kräfte beschreiben' }).waitFor()
  await openMap(page)
  // With one subject, the stage unit has a single tree node and keeps its ID.
  await scope(page, section.physicsStage)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await node(page, section.physicsStage).waitFor()
  assert.equal(await page.locator(`[data-entry-id="${section.vectors}"], [data-entry-id="${section.stageUnit}"]`).count(), 0,
    'reloaded native Personal Curriculum removes unselected subject')
  assert.equal(await page.getByTestId('learner-map-subject-filter').count(), 0, 'a single subject needs no filter')
  await closeMap(page)
  assert.equal(await sidebar.locator(`[data-goal-id="${id.mathRoot}"]`).count(), 0)
  assert.deepEqual(h.writes.map(write => write.body), [
    { goals: [id.physicsRoot] }, { rewindId: 'native-subjects-change' }, { optionId: 'physics-only' },
  ], 'only the explicit focus and authored curriculum actions mutate the isolated learner')
  assert.deepEqual(h.mastery, { [id.foundation]: 1 }, 'Personal Curriculum switching preserves global results')
  assert.deepEqual(h.errors, [])
  assert.deepEqual(h.unexpected, [])
  await h.context.close()

  for (const width of [320, 390]) {
    stage = `native mobile full-window map at ${width}px`
    const m = await open(width)
    const [openerBox, startBox] = await Promise.all([mapOpener(m.page).boundingBox(),
      m.page.getByTestId('learner-coach-start-link').boundingBox()])
    assert.ok(openerBox && startBox && Math.abs(openerBox.y - startBox.y) < 1 && openerBox.x + openerBox.width <= startBox.x,
      `Lernkarte and Lernen starten share one row at ${width}px`)
    assert.equal(await m.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await mapOpener(m.page).focus()
    await m.page.keyboard.press('Enter')
    await mapDialog(m.page).waitFor()
    await scope(m.page, section.vectors)
    await m.page.getByTestId('learner-map-construction-notice').waitFor()
    await fillsWindow(m.page, `${width}px`)
    await m.page.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    await node(m.page, id.foundation).focus()
    await afterEffects(m.page)
    await mapSelection(m.page, id.application)
    assert.equal(await m.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await m.page.screenshot({ path: join(artifacts, `03-native-map-${width}.png`) })
    await node(m.page, id.foundation).click()
    await mapSelection(m.page, id.foundation)
    assert.equal(await mapDialog(m.page).isVisible(), true, 'a tap chooses a goal without closing the map')
    await closeMap(m.page)
    await selectedTitle(m.page, 'Vektoren darstellen')
    await focusedTestId(m.page, 'learner-current-goal')
    const opener = m.page.getByRole('button', { name: 'Lernzielmenü öffnen', exact: true })
    await opener.focus()
    await m.page.keyboard.press('Enter')
    await m.page.waitForFunction(() => (document.getElementById('learner-goal-sidebar')?.getBoundingClientRect().left ?? -1) >= -1)
    await m.page.locator('#learner-goal-sidebar').locator(`[data-goal-id="${id.foundation}"]`).waitFor()
    await m.page.getByRole('button', { name: 'Lernzielmenü schließen', exact: true }).click()
    assert.equal(await m.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.deepEqual(m.writes, [])
    assert.deepEqual(m.errors, [])
    assert.deepEqual(m.unexpected, [])
    await m.context.close()
  }
  stage = 'native App double-click with normal motion'
  const animated = await open(1440, false, 'no-preference')
  await openMap(animated.page)
  await scope(animated.page, section.vectors)
  await animated.page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(animated.page, section.stageUnit)
  await node(animated.page, section.vectors).dblclick({ delay: 100 })
  await scope(animated.page, section.vectors)
  await mapSelection(animated.page, section.vectors)

  stage = 'Escape closes the full-window map without leaving the map level'
  await node(animated.page, id.foundation).focus()
  await animated.page.keyboard.press('Escape')
  await mapDialog(animated.page).waitFor({ state: 'hidden' })
  await selectedTitle(animated.page, 'Vektorrechnung')
  await focusedTestId(animated.page, 'learner-current-goal')
  await openMap(animated.page)
  await scope(animated.page, section.vectors)
  await mapSelection(animated.page, section.vectors)
  // Escape outside the map surface uses the dialog's own close request.
  await mapDialog(animated.page).getByRole('button', { name: 'Lernkarte schließen', exact: true }).focus()
  await animated.page.keyboard.press('Escape')
  await mapDialog(animated.page).waitFor({ state: 'hidden' })
  await focusedTestId(animated.page, 'learner-learning-map-open')
  assert.deepEqual(animated.writes, [])
  assert.deepEqual(animated.errors, [])
  assert.deepEqual(animated.unexpected, [])
  await animated.context.close()

  stage = 'layout worker failure has a local return-to-tree action'
  const failed = await open(1440, true)
  await openMap(failed.page)
  await failed.page.getByText('Die Karte konnte nicht angeordnet werden.', { exact: true }).waitFor()
  await failed.page.getByRole('button', { name: 'Zum Baum wechseln', exact: true }).click()
  await mapDialog(failed.page).waitFor({ state: 'hidden' })
  await selectedTitle(failed.page, 'Skalarprodukte anwenden')
  await failed.page.waitForFunction(goalId => document.activeElement?.getAttribute('data-goal-id') === goalId, id.application)
  assert.deepEqual(failed.writes, [])
  assert.deepEqual(failed.errors, [])
  assert.deepEqual(failed.unexpected, [])
  await failed.context.close()

  stage = 'a 205-goal board supports graph navigation, evidence, search and keyboard selection'
  const unitMap = await open(1440)
  const unitPage = unitMap.page
  await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=large`)
  const largeUnit = 'composition:fx-phys:structure:physics-seki'
  await scope(unitPage, largeUnit)
  const searchGoal = async (title: string) => {
    const search = unitPage.getByRole('textbox', { name: 'In dieser Ebene suchen' })
    await search.fill(title)
    await search.press('Enter')
  }
  const fitGraph = unitPage.getByRole('button', { name: 'Diese Ebene einpassen', exact: true })
  await fitGraph.waitFor()
  await unitPage.locator('[data-entry-id="force-003"] .lum-node-main[aria-pressed="true"]').waitFor()
  await searchGoal('Kraft 2')
  await unitPage.locator('[data-entry-id="force-002"][data-active-goal="true"]').waitFor()
  await searchGoal('Kraft 1')
  await unitPage.locator('[data-entry-id="force-001"]').getByTestId('learning-map-direct-evidence').waitFor()
  await searchGoal('Kraft 150')
  await node(unitPage, 'force-150').press('Enter')
  await unitPage.getByTestId('unit-map-selected').filter({ hasText: 'force-150' }).waitFor()
  assert.equal(await node(unitPage, 'force-150').getAttribute('aria-pressed'), 'true')
  await unitPage.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(unitPage, mapRoot)
  await node(unitPage, largeUnit).dblclick({ delay: 100 })
  await scope(unitPage, largeUnit)
  await searchGoal('Kraft 10')
  await node(unitPage, 'force-010').dblclick({ delay: 100, modifiers: ['Shift'] })
  await scope(unitPage, mapRoot)
  await unitPage.screenshot({ path: join(artifacts, '04-unit-map-root.png') })
  await node(unitPage, largeUnit).dblclick({ delay: 100 })
  await scope(unitPage, largeUnit)
  await unitPage.screenshot({ path: join(artifacts, '05-large-unit-graph.png') })

  stage = 'ordinary large boards retain a readable starting point and an explicit overview'
  for (const hydrate of [false, true]) {
    await unitPage.setViewportSize(hydrate ? { width: 900, height: 640 } : { width: 1440, height: 960 })
    await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=overview${hydrate ? '&hydrate' : ''}`)
    await scope(unitPage, largeUnit)
    if (hydrate) {
      await node(unitPage, 'force-016').click()
      await unitPage.getByRole('button', { name: 'Load last goal' }).click()
    }
    if (!hydrate) assert.equal(await unitPage.getByLabel('Zoomwert').innerText(), '100 %')
    await unitPage.getByRole('button', { name: 'Diese Ebene einpassen' }).click()
    await node(unitPage, 'force-017').click()
    await unitPage.getByTestId('unit-map-selected').filter({ hasText: 'force-017' }).waitFor()
    const fits = await unitPage.locator('.lum-flow').evaluate(surface => {
      const viewport = surface.getBoundingClientRect()
      return [...surface.querySelectorAll('.lum-node')].filter(card => {
        const rect = card.getBoundingClientRect()
        return rect.left >= viewport.left && rect.top >= viewport.top && rect.right <= viewport.right && rect.bottom <= viewport.bottom
      }).length
    })
    assert.equal(fits, 17, 'all goals on this board fit in the desktop viewport')
  }

  // A resize retains the learner's camera. Fit to the new viewport with the
  // same control available to someone who previously panned or zoomed in.
  await unitPage.setViewportSize({ width: 800, height: 580 })
  await unitPage.getByRole('button', { name: 'Diese Ebene einpassen' }).click()
  await node(unitPage, 'force-001').click()
  await node(unitPage, 'force-017').click()

  stage = 'a long graph remains readable and its distant goals are selectable through search'
  await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=wide`)
  await scope(unitPage, largeUnit)
  assert.equal(await unitPage.getByLabel('Zoomwert').innerText(), '100 %')
  await unitPage.getByRole('textbox', { name: 'In dieser Ebene suchen' }).fill('Kraft 17')
  await unitPage.getByRole('option', { name: /Kraft 17/ }).click()
  await node(unitPage, 'force-017').click()
  await unitPage.getByTestId('unit-map-selected').filter({ hasText: 'force-017' }).waitFor()

  stage = 'one routed assessment stays readable in its nested child at 1024 pixels'
  await unitPage.setViewportSize({ width: 1024, height: 900 })
  await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=nested-single-assessment`)
  await scope(unitPage, 'composition:fx-single:structure:uniform')
  await unitPage.locator('[data-entry-id="single-motion-assessment"].is-focused').waitFor()
  assert.equal(await unitPage.locator('[data-entry-kind="assessment"]').count(), 1)
  await unitPage.waitForFunction(() => {
    const surface = document.querySelector('.lum-flow')!.getBoundingClientRect()
    const card = document.querySelector('[data-entry-id="single-motion-assessment"] .lum-node-main')!.getBoundingClientRect()
    return card.width >= 170 && card.left >= surface.left && card.right <= surface.right
      && card.top >= surface.top && card.bottom <= surface.bottom
  }, undefined, { timeout: 10000 })
  await unitPage.getByTestId('unit-map-selected').filter({ hasText: 'single-motion-assessment' }).waitFor()
  const focusedZoom = await unitPage.getByLabel('Zoomwert').innerText()
  await unitPage.getByRole('button', { name: 'Karte verkleinern', exact: true }).click()
  await afterEffects(unitPage)
  const manualZoom = await unitPage.getByLabel('Zoomwert').innerText()
  assert(Number.parseInt(manualZoom) < Number.parseInt(focusedZoom), 'The learner can still zoom out explicitly')
  await unitPage.setViewportSize({ width: 1100, height: 900 })
  await afterEffects(unitPage)
  assert.equal(await unitPage.getByLabel('Zoomwert').innerText(), manualZoom,
    'Resizing never resets a manually moved single-assessment camera')

  stage = 'a second subject opens neighbouring assessments together on a large board'
  await unitPage.setViewportSize({ width: 1024, height: 768 })
  await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=math-assessments`)
  await scope(unitPage, 'composition:fx-math:structure:sek1')
  await unitPage.waitForFunction(() => {
    const surface = document.querySelector('.lum-flow')!.getBoundingClientRect()
    return ['quadratic-9', 'quadratic-11'].every(id => {
      const rect = document.querySelector(`[data-entry-id="${id}"] .lum-node-main`)?.getBoundingClientRect()
      return rect && rect.width >= 170 && rect.left >= surface.left && rect.right <= surface.right
        && rect.top >= surface.top && rect.bottom <= surface.bottom
    })
  })
  await node(unitPage, 'quadratic-9').click()
  await unitPage.getByTestId('unit-map-selected').filter({ hasText: 'quadratic-9' }).waitFor()

  stage = 'a tree without Mathematics and Physics gets a notice instead of a map'
  await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=other`)
  const unavailable = unitPage.getByTestId('learner-map-subjects-unavailable')
  await unavailable.waitFor()
  assert.ok((await unavailable.innerText()).includes('vorerst nur für Mathematik und Physik'))
  assert.equal(await unitPage.locator('.lum-app').count(), 0)
  await unavailable.getByRole('button', { name: 'Zum Baum wechseln', exact: true }).click()
  await unitPage.getByTestId('unit-map-returned').filter({ hasText: 'returned' }).waitFor()

  stage = 'other subjects beside Mathematics are left to the tree'
  await unitPage.goto(`${origin}/scripts/fixtures/learnerUnitMapUi.html?mode=mixed`)
  await scope(unitPage, mapRoot)
  assert.deepEqual(await unitPage.locator('.lum-node[data-entry-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-entry-id'))), ['numbers'],
    'Chemistry is not shown in the map')
  assert.equal(await unitPage.getByTestId('learner-map-subject-filter').count(), 0)
  assert.deepEqual(unitMap.errors, [])
  assert.deepEqual(unitMap.unexpected, [])
  assert.deepEqual(unitMap.writes, [])
  await unitMap.context.close()

  stage = 'delayed controlled command echo and explicit reveal precedence'
  const commands = await open(1440, false, 'no-preference')
  const commandPage = commands.page
  await commandPage.goto(`${origin}/scripts/fixtures/learnerMapCommandsUi.html`)
  await scope(commandPage, 'command-section')
  await commandPage.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(commandPage, 'command-group')
  await node(commandPage, 'command-section').dblclick({ delay: 100 })
  await scope(commandPage, 'command-section')
  await commandPage.getByTestId('command-release-echo').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-section' }).waitFor()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-section')
  await commandPage.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(commandPage, 'command-group')
  await node(commandPage, 'command-section').dblclick({ delay: 100 })
  await scope(commandPage, 'command-section')
  await commandPage.getByTestId('command-reveal-selected').click()
  await scope(commandPage, 'command-group')
  await commandPage.getByTestId('command-release-echo').click()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-group')
  await commandPage.getByTestId('command-reveal-a').click()
  await scope(commandPage, 'command-section')
  await node(commandPage, 'command-b').click()
  await commandPage.getByTestId('command-release-echo').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-b' }).waitFor()
  await node(commandPage, 'command-a').click()
  await commandPage.getByTestId('command-release-echo').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-a' }).waitFor()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-section')

  stage = 'map focus restoration preserves an answer input outside the map'
  await node(commandPage, 'command-a').focus()
  await commandPage.keyboard.press('Escape')
  await commandPage.waitForFunction(() => !document.querySelector('.lum-node-main[aria-pressed="true"]'))
  await commandPage.keyboard.press('Escape')
  const answerInput = commandPage.getByTestId('command-current-answer')
  await answerInput.focus()
  await scope(commandPage, 'command-group')
  assert.equal(await answerInput.evaluate(element => document.activeElement === element), true,
    'a completed map transition must not steal focus after the learner returns to a current answer')
  await commandPage.keyboard.press('Escape')
  await afterEffects(commandPage)
  await scope(commandPage, 'command-group')
  assert.equal(await answerInput.inputValue(), 'An unfinished answer')

  stage = 'explicit reveal target precedes its routed selected ID'
  await commandPage.evaluate(() => {
    const trail: string[] = []
    Object.assign(window, { nativeCommandScopeTrail: trail })
    new MutationObserver(records => {
      for (const record of records) {
        if (!(record.target instanceof Element) || !record.target.matches('.lum-canvas')) continue
        for (const value of [record.oldValue, record.target.getAttribute('data-scope-id')]) {
          if (value && trail[trail.length - 1] !== value) trail.push(value)
        }
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-scope-id'] })
  })
  await commandPage.getByTestId('command-reveal-b-before-route').click()
  assert.equal(await commandPage.getByTestId('command-parent-selection').innerText(), 'command-a',
    'the explicit reveal counter/target arrives while the routed selection is still A')
  await scope(commandPage, 'command-other-section')
  await afterEffects(commandPage)
  const visitedScopes = await commandPage.evaluate(() => (window as unknown as { nativeCommandScopeTrail: string[] }).nativeCommandScopeTrail)
  assert(!visitedScopes.includes('command-section'), 'a fresh reveal of B must never first navigate to the old selected A parent')
  await commandPage.getByTestId('command-release-reveal-route').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-other-b' }).waitFor()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-other-section')

  stage = 'new external selection supersedes a pending explicit reveal'
  await commandPage.getByTestId('command-route-a').click()
  await scope(commandPage, 'command-section')
  await commandPage.getByTestId('command-reveal-b-before-route').click()
  await commandPage.waitForFunction(() => document.querySelector('.lum-canvas')?.getAttribute('aria-busy') === 'true')
  await commandPage.getByTestId('command-external-c').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-c' }).waitFor()
  await scope(commandPage, 'command-c-section')
  await afterEffects(commandPage)
  await scope(commandPage, 'command-c-section')

  stage = 'revealed cluster route echo preserves camera-only drilling'
  await commandPage.getByTestId('command-route-a').click()
  await scope(commandPage, 'command-section')
  await commandPage.getByTestId('command-reveal-section-before-route').click()
  await scope(commandPage, 'command-group')
  await commandPage.locator('[data-entry-id="command-section"] .lum-node-open').click()
  await scope(commandPage, 'command-section')
  assert.equal(await commandPage.getByTestId('command-parent-selection').innerText(), 'command-a',
    'using the separate scope arrow leaves the delayed route unchanged')
  await commandPage.getByTestId('command-release-reveal-route').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-section' }).waitFor()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-section')

  stage = 'local selection supersedes an unavailable explicit reveal'
  await commandPage.getByTestId('command-reveal-unavailable').click()
  await afterEffects(commandPage)
  await node(commandPage, 'command-b').click()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-section')
  assert.equal(await node(commandPage, 'command-b').getAttribute('aria-pressed'), 'true',
    'local selection wins while an unavailable explicit target is pending')
  await commandPage.getByTestId('command-release-echo').click()
  await commandPage.getByTestId('command-parent-selection').filter({ hasText: 'command-b' }).waitFor()
  await afterEffects(commandPage)
  await scope(commandPage, 'command-section')
  assert.equal(await node(commandPage, 'command-b').getAttribute('aria-pressed'), 'true')
  assert.deepEqual(commands.errors, [])
  assert.deepEqual(commands.unexpected, [])
  assert.deepEqual(commands.writes, [])
  await commands.context.close()

  stage = 'manual unit entry consumes a deliberately delayed routed focus'
  const deferredCommands = await open()
  const deferredPage = deferredCommands.page
  await deferredPage.goto(`${origin}/scripts/fixtures/learnerMapCommandsUi.html?deferFocus=1`)
  await scope(deferredPage, 'command-section')
  await deferredPage.waitForFunction(() => (window as Window & { deferredMapCommandFrames?: { count: () => number } }).deferredMapCommandFrames!.count() > 0)
  await deferredPage.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(deferredPage, 'command-group')
  await deferredPage.getByTestId('command-release-focus').click()
  await afterEffects(deferredPage)
  assert.equal(await deferredPage.getByTestId('learning-map-board').getAttribute('data-scope-id'), 'command-group',
    'the delayed initial goal command cannot replay after an explicit scope move')
  await deferredPage.getByTestId('command-reveal-a').click()
  await scope(deferredPage, 'command-section')
  await deferredPage.locator('[data-entry-id="command-a"] .lum-node-main[aria-pressed="true"]').waitFor()
  assert.equal(await node(deferredPage, 'command-a').getAttribute('aria-pressed'), 'true', 'a new reveal nonce still acts')
  await deferredPage.getByTestId('command-delay-focus').click()
  await deferredPage.getByTestId('command-reveal-section-before-route').click()
  await scope(deferredPage, 'command-group')
  await deferredPage.waitForFunction(() => (window as Window & { deferredMapCommandFrames?: { count: () => number } }).deferredMapCommandFrames!.count() > 0)
  await deferredPage.locator('[data-entry-id="command-section"] .lum-node-open').press('Enter')
  await scope(deferredPage, 'command-section')
  await deferredPage.getByTestId('command-release-focus').click()
  await deferredPage.getByTestId('command-release-reveal-route').click()
  await afterEffects(deferredPage)
  assert.equal(await deferredPage.getByTestId('learning-map-board').getAttribute('data-scope-id'), 'command-section',
    'a pending global reveal and its later route echo cannot undo a deliberate child drill')
  await deferredPage.getByTestId('command-reveal-b-before-route').click()
  await scope(deferredPage, 'command-other-section')
  await deferredPage.getByTestId('command-release-reveal-route').click()
  await afterEffects(deferredPage)
  await scope(deferredPage, 'command-other-section')
  assert.deepEqual(deferredCommands.errors, [])
  assert.deepEqual(deferredCommands.unexpected, [])
  assert.deepEqual(deferredCommands.writes, [])
  await deferredCommands.context.close()
  console.log('Native product App full-window learner map browser regression passed (desktop, 320px, 390px; isolated HTTP/SSE).')
} catch (error) {
  console.error(`Native learner map browser failure at: ${stage}`)
  if (lastPage && !lastPage.isClosed()) {
    await lastPage.screenshot({ path: join(artifacts, 'failure.png') }).catch(() => undefined)
    console.error((await lastPage.locator('body').innerText()).slice(0, 9000))
    console.error(await lastPage.evaluate(() => (window as unknown as { nativeMapPointerTrace?: unknown }).nativeMapPointerTrace))
  }
  throw error
} finally {
  await Promise.all(contexts.map(context => context.close()))
  await browser.close()
  await server.close()
  await rm(cacheDir, { recursive: true, force: true })
}
