import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, type Page } from 'playwright'
import { createServer } from 'vite'
import { cockpitMathData as data } from '../prototypes/cockpitMathData'

const root = fileURLToPath(new URL('../', import.meta.url))
const artifacts = fileURLToPath(new URL('../../tmp/learning-cockpit-prototype-review/', import.meta.url))
const vite = await createServer({ root, configFile: `${root}/prototypes/vite.config.ts`, logLevel: 'error',
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false, ws: false } })
await vite.listen()
const address = vite.httpServer?.address()
assert.ok(address && typeof address !== 'string')
const origin = `http://127.0.0.1:${address.port}`
const browser = await chromium.launch()
const errors: string[] = []
const rejected: string[] = []
const assessmentId = data.assessment.goalId
const ordinaryId = data.targetGoalIds.find(id => id !== assessmentId)!
type View = 'learn' | 'map' | 'plan'
const views: View[] = ['learn', 'map', 'plan']
let stage = 'initial'

async function open(width: number, height: number) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce', serviceWorkers: 'block' })
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
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${origin}/prototypes/cockpit.html`)
  await visibleView(page, 'learn')
  return page
}

async function visibleView(page: Page, expected: View) {
  for (const view of views) {
    const panel = page.getByTestId(`cockpit-view-${view}`)
    assert.equal(await panel.isVisible(), view === expected, `Only the ${expected} view may be visible`)
    const flags = await panel.evaluate(element => ({ hidden: (element as HTMLElement).hidden, inert: (element as HTMLElement).inert }))
    assert.deepEqual(flags, { hidden: view !== expected, inert: view !== expected })
  }
  assert.equal(await page.locator('h1:visible').count(), 1, 'There must be one clear current subject')
}

async function show(page: Page, view: View) {
  await page.getByTestId(`cockpit-tab-${view}`).click()
  await visibleView(page, view)
  if (view === 'map') await page.locator('.lum-canvas[aria-busy="false"]').waitFor()
}

async function settled(page: Page, scope: string) {
  await page.waitForFunction(expected => {
    const canvas = document.querySelector('.lum-canvas')
    return canvas?.getAttribute('data-scope-id') === expected && canvas.getAttribute('aria-busy') === 'false'
  }, scope)
}

async function frames(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
}

async function camera(page: Page) {
  return page.locator('.react-flow__viewport').evaluate(element => getComputedStyle(element).transform)
}

async function counts(page: Page, total: string, today: string, week: string) {
  await show(page, 'plan')
  assert.match(await page.getByTestId('cockpit-progress-total').innerText(), new RegExp(total.replace('/', '\\s*/\\s*')))
  assert.match(await page.getByTestId('cockpit-today-explicit').innerText(), new RegExp(`^${today}\\s*/\\s*1`))
  assert.match(await page.getByTestId('cockpit-week-explicit').innerText(), new RegExp(`^${week}\\s*/\\s*1`))
}

try {
  await mkdir(artifacts, { recursive: true })
  const page = await open(1440, 1000)
  assert.equal(await page.getByTestId('cockpit-active-panel').getAttribute('data-active-goal-id'), ordinaryId)
  assert.equal(await page.getByTestId('cockpit-period-gauge').isVisible(), false)
  assert.equal(await page.getByRole('complementary', { name: 'Ausgewählter Bereich' }).count(), 0)
  assert.match(await page.getByTestId('cockpit-scenario').getAttribute('title') ?? '', /04\.11\.2026/)
  assert.equal(await page.locator('img:visible').count(), 1)
  await page.screenshot({ path: `${artifacts}/01-context-learning.png` })

  stage = 'original bitmap'
  await page.getByTestId('cockpit-goal-image-button').click()
  const imageDialog = page.getByTestId('cockpit-image-dialog')
  await imageDialog.waitFor({ state: 'visible' })
  assert.equal(await imageDialog.getAttribute('data-image-goal-id'), ordinaryId)
  await imageDialog.locator('img').evaluate(async element => {
    const image = element as HTMLImageElement
    await image.decode()
    if (image.naturalWidth !== 2816 || image.naturalHeight !== 1536) throw new Error('Original bitmap did not load')
  })
  await page.keyboard.press('Escape')
  await imageDialog.waitFor({ state: 'hidden' })
  await visibleView(page, 'learn')

  stage = 'one map context and persistent selection'
  await show(page, 'map')
  await settled(page, data.unitId)
  const map = page.getByTestId('cockpit-view-map')
  assert.equal(await map.getByText(data.unitTitle, { exact: true }).count(), 1)
  assert.equal(await map.getByRole('textbox', { name: 'In dieser Ebene suchen' }).count(), 0, 'Two goals do not need a search box')
  assert.equal(await map.locator('.react-flow__minimap').count(), 0, 'A small desktop diagram does not need a minimap')
  assert.equal(await page.getByTestId('cockpit-active-panel').isVisible(), false)
  assert.equal(await page.getByTestId('cockpit-period-gauge').isVisible(), false)
  assert.equal(await map.locator(`[data-entry-id="${ordinaryId}"] .lucide-send`).count(), 1)
  assert.equal(await map.locator(`[data-entry-id="${assessmentId}"] .lucide-target`).count(), 1)
  await map.locator(`[data-entry-id="${assessmentId}"] .lum-node-main`).click()
  await frames(page)
  const selected = map.locator(`[data-entry-id="${assessmentId}"] .lum-node-main`)
  assert.equal(await selected.getAttribute('aria-pressed'), 'true')
  const pane = await map.locator('.react-flow__pane').boundingBox()
  assert.ok(pane)
  await page.mouse.move(pane.x + 30, pane.y + 30)
  await page.mouse.down()
  await page.mouse.move(pane.x + 85, pane.y + 55, { steps: 5 })
  await page.mouse.up()
  await frames(page)
  const before = await camera(page)
  await page.screenshot({ path: `${artifacts}/02-context-map.png` })
  await show(page, 'learn')
  assert.equal(await page.getByTestId('cockpit-active-panel').getAttribute('data-active-goal-id'), ordinaryId)
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+f')
  assert.equal(await map.locator('input:focus').count(), 0, 'The hidden map must not capture search shortcuts')
  await show(page, 'plan')
  assert.equal(await page.getByRole('complementary', { name: 'Ausgewählter Bereich' }).count(), 0)
  await page.screenshot({ path: `${artifacts}/03-context-plan.png` })
  await show(page, 'map')
  await settled(page, data.unitId)
  await frames(page)
  assert.equal(await camera(page), before, 'View changes restore the exact map camera')
  assert.equal(await selected.getAttribute('aria-pressed'), 'true', 'View changes preserve the map selection')

  stage = 'exam preview from map'
  const inspector = page.getByRole('complementary', { name: 'Ausgewählter Bereich' })
  await inspector.getByRole('button', { name: 'Prüfung ansehen', exact: true }).click()
  const dialog = page.getByTestId('cockpit-preview-dialog')
  await dialog.waitFor({ state: 'visible' })
  assert.equal(await dialog.getAttribute('data-preview-goal-id'), assessmentId)
  assert.equal(await dialog.locator('img').count(), 0)
  assert.ok(await dialog.locator('.katex').count() > 0)
  assert.equal(await dialog.locator('.katex-error').count(), 0)
  assert.match(await page.getByTestId('cockpit-task-preview').innerText(), /Gegeben sind die Vektoren/)
  assert.doesNotMatch(await page.getByTestId('cockpit-task-preview').innerText(), /Der Projektionsvektor ist/)
  await page.getByTestId('cockpit-coach-preview').getByText('Coach-Startvorschau', { exact: true }).click()
  const coachText = await page.getByTestId('cockpit-coach-preview').innerText()
  assert.ok(coachText.includes(data.goalById[assessmentId].title))
  assert.ok(!coachText.includes(data.goalById[ordinaryId].title))
  assert.doesNotMatch(coachText, /learningSessionId|Use the current level-completion|Ask for consent/)
  await dialog.getByText('Bewertungsregeln', { exact: true }).click()
  assert.match(await dialog.innerText(), /Maximal 10 Punkte · bestanden ab 10 Punkten/)
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await visibleView(page, 'map')
  await settled(page, data.unitId)
  assert.equal(await selected.getAttribute('aria-pressed'), 'true')
  await show(page, 'learn')
  assert.equal(await page.getByTestId('cockpit-active-panel').getAttribute('data-active-goal-id'), ordinaryId)

  stage = 'fixed plan scope and explicit period quotas'
  await counts(page, '0/2', '0', '0')
  await page.getByTestId('cockpit-scenario').selectOption('before-assessment')
  await counts(page, '1/2', '0', '1')
  await show(page, 'learn')
  assert.equal(await page.getByTestId('cockpit-active-panel').getAttribute('data-active-goal-id'), assessmentId)
  assert.equal(await page.locator('img:visible').count(), 0, 'The active exam must not inherit another goal image')
  assert.equal(await page.getByRole('button', { name: 'Prüfung direkt versuchen', exact: true }).count(), 0, 'The same exam does not need a duplicate start button')
  await page.getByTestId('cockpit-scenario').selectOption('passed-assessment')
  await counts(page, '2/2', '1', '1')
  await show(page, 'map')
  await settled(page, data.unitId)
  assert.equal(await map.locator(`[data-entry-id="${ordinaryId}"] .lucide-shield-check`).count(), 1)
  assert.equal(await map.locator(`[data-entry-id="${assessmentId}"] .lucide-check`).count(), 1)
  assert.equal(await map.locator('[data-active-goal="true"]').count(), 0)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await settled(page, data.rootId)
  assert.equal(await map.getByRole('heading', { name: 'Mathematik', exact: true }).count(), 1)
  assert.equal(await map.getByRole('navigation', { name: 'Aktuelle Kartenebene' }).count(), 0, 'The root has no empty breadcrumb')
  await counts(page, '2/2', '1', '1')
  await show(page, 'map')
  await settled(page, data.rootId)
  await map.locator(`[data-entry-id="${data.cards.goalId}"] .lum-node-main`).click()
  await page.getByRole('complementary', { name: 'Ausgewählter Bereich' }).getByRole('button', { name: 'Lernkarten ansehen (Kontext)' }).click()
  await dialog.waitFor({ state: 'visible' })
  assert.equal(await dialog.locator('.cp-card-preview > details').count(), data.cards.cards.length)
  assert.equal(await page.getByTestId('cockpit-coach-preview').count(), 0)
  await page.keyboard.press('Escape')
  await show(page, 'learn')
  assert.equal(await page.getByRole('button', { name: 'Lernen fortsetzen', exact: true }).count(), 0)
  await page.getByRole('button', { name: 'Freiwillig vertiefen', exact: true }).click()
  await dialog.waitFor({ state: 'visible' })
  assert.equal(await dialog.getAttribute('data-preview-goal-id'), ordinaryId)
  await dialog.getByRole('button', { name: /Lernzielbild/ }).click()
  await imageDialog.waitFor({ state: 'visible' })
  await page.keyboard.press('Escape')
  await imageDialog.waitFor({ state: 'hidden' })
  await dialog.waitFor({ state: 'visible' })
  await page.keyboard.press('Escape')
  await dialog.waitFor({ state: 'hidden' })
  await visibleView(page, 'learn')

  stage = 'explicit map reveal and accessible view separation'
  await page.getByTestId('cockpit-scenario').selectOption('new')
  await page.getByRole('button', { name: 'Aktives Ziel in der Karte', exact: true }).click()
  await visibleView(page, 'map')
  await settled(page, data.unitId)
  await map.locator(`[data-entry-id="${ordinaryId}"] .lum-node-main[aria-pressed="true"]`).waitFor()
  await show(page, 'learn')
  await page.getByTestId('cockpit-tab-learn').focus()
  for (let step = 0; step < 16; step++) {
    await page.keyboard.press('Tab')
    assert.equal(await page.evaluate(() => !!document.activeElement?.closest('[inert], [hidden]')), false)
  }
  await page.getByRole('button', { name: 'Quellen und Grenzen des Prototyps' }).click()
  const about = page.getByTestId('cockpit-about-dialog')
  await about.waitFor({ state: 'visible' })
  assert.ok((await about.innerText()).includes(data.sourcePaths.canonical))
  await page.keyboard.press('Escape')
  await about.waitFor({ state: 'hidden' })
  await visibleView(page, 'learn')

  stage = 'narrow contexts'
  for (const width of [390, 320]) {
    const mobile = await open(width, 844)
    assert.equal(await mobile.locator('body').evaluate(element => element.scrollWidth <= window.innerWidth), true)
    await mobile.getByTestId('cockpit-goal-image-button').click()
    await mobile.getByTestId('cockpit-image-dialog').waitFor({ state: 'visible' })
    await mobile.getByRole('button', { name: 'Lernzielbild schließen' }).click()
    await mobile.screenshot({ path: `${artifacts}/04-context-learning-${width}.png`, fullPage: true })
    for (const view of ['map', 'plan'] as const) {
      await show(mobile, view)
      assert.equal(await mobile.locator('body').evaluate(element => element.scrollWidth <= window.innerWidth), true)
      await mobile.screenshot({ path: `${artifacts}/05-context-${view}-${width}.png`, fullPage: true })
    }
  }
  assert.deepEqual(errors, [])
  assert.deepEqual(rejected, [], 'The prototype must not contact learner APIs or external services')
  console.log('PASS: three exclusive views, one context heading, stable map camera/selection, inactive shortcuts, keyboard isolation, explicit navigation, fixed counters, real previews, familiar icons, 320/390px and no API traffic')
  console.log(`Screenshots: ${artifacts}`)
} catch (error) {
  console.error({ stage, errors, rejected })
  throw error
} finally {
  await browser.close()
  await vite.close()
}
