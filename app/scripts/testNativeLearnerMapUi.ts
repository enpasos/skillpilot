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
import { nativeMapDeck, nativeMapIds as id, nativeMapLandscapes, nativeMapProfile, nativeMapView } from './fixtures/nativeLearningMapData'
import type { LearningUnitsReadModel } from '../src/utils/learningUnitsApi'
import { learningUnitNavigationId } from '../src/components/learningUnitMap/learnerUnitMapProjection'

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

async function open(width = 1440, failLayoutWorker = false, reducedMotion: 'reduce' | 'no-preference' = 'reduce', withUnits = false) {
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
  const landscapes = withUnits ? nativeMapLandscapes.map(landscape => ({ ...landscape,
    goals: landscape.goals.map(goal => goal.id === id.other ? { ...goal, nodeKind: 'exam' as const } : goal),
  })) : nativeMapLandscapes
  const learningUnits: LearningUnitsReadModel = { calculationStatus: 'valid', semantics: 'global-unit-recognition-v1', contractDigest: 'fixture-contracts',
    recognizedGoalIds: [id.application], voluntaryGoalIds: [id.application], units: [{
      contractId: 'reviewed-native-unit', revision: 'r1', programUnitId: 'reviewed-native-program-unit',
      title: { de: 'Vektoren selbständig anwenden' }, promise: { de: 'Du kannst Vektoren in einer eigenen Lösung anwenden.' }, introduction: { de: 'Motivation zur eigenen Anwendung.' },
      ownGoalIds: [id.application, id.other], requiredChildContractRefs: [], ownAssessmentGoalIds: [id.other], ownRecallGoalIds: [],
      complete: false, targetCount: 2, explicitTargetCount: 0, recognizedTargetCount: 1,
      ownRecognizedGoalIds: [id.application], pendingGoalIds: [id.other],
    }], offerBinding: { status: 'valid', revision: 'native-offer-r1', bindingDigest: 'native-offer', coverage: 'partial', coveredTargetCount: 2, totalTargetCount: 5,
      rootContractRefs: [{ contractId: 'reviewed-native-unit', revision: 'r1' }],
      scopeKey: { rootLandscapeId: id.root, landscapeId: id.math, schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII', durationModel: 'G9', courseProfile: 'GK+LK' },
    } }
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
    ...(withUnits ? { learningUnits } : {}),
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
      return json(physicsOnly ? landscapes.filter(landscape => landscape.landscapeId !== id.math) : landscapes)
    }
    if (path === `/api/ui/learners/${id.learner}` && request.method() === 'GET') return json(nativeMapProfile(physicsOnly))
    const suffix = path.replace(`/api/ui/learners/${id.learner}`, '')
    if (suffix === '/resume' && ['GET', 'POST'].includes(request.method())) return json({ lastActivityAt: '2026-11-05T08:00:00Z', scheduledDeletionAt: '2027-05-05T08:00:00Z' })
    if (suffix === '/mastery' && request.method() === 'GET') return json({ mastery, ...(withUnits ? { learningUnits } : {}) })
    if (suffix === '/state' && request.method() === 'GET') return json(state())
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
  return { page, context, errors, unexpected, requests, writes, mastery, learningUnits,
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

async function navigation(page: Page, mode: 'tree' | 'map') {
  await page.getByTestId(`learner-goal-navigation-${mode}`).click()
  assert.equal(await page.getByTestId(`learner-goal-navigation-${mode}`).getAttribute('aria-pressed'), 'true')
}
async function scope(page: Page, goalId: string) {
  await page.locator(`.lum-canvas[data-scope-id="${goalId}"][aria-busy="false"]`).waitFor()
}
const node = (page: Page, goalId: string) => page.locator(`[data-entry-id="${goalId}"] .lum-node-main`)
const selectedTitle = (page: Page, title: string) => page.getByTestId('learner-current-goal').getByRole('heading', { name: title, exact: true }).waitFor()
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
  assert.equal(await sidebar.getAttribute('data-goal-navigation-mode'), 'tree')
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

  stage = 'native map navigation and result/state isolation'
  await navigation(page, 'map')
  await scope(page, id.section)
  await page.getByTestId('native-cockpit-map').evaluate(element => element.setAttribute('data-native-map-witness', 'original'))
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')
  assert.equal(await page.locator('.lum-inspector').count(), 0)
  assert.equal(await page.locator('.learner-cockpit-selection img').count(), 1)
  assert.equal(await page.getByTestId('native-cockpit-map').locator('img').count(), 0, 'map navigation never duplicates the goal image')
  assert.equal(await page.locator(`[data-entry-id="${id.support}"]`).count(), 0)
  assert.deepEqual((await page.locator('.lum-node[data-entry-id]').evaluateAll(nodes => nodes.map(n => n.getAttribute('data-entry-id')))).sort(),
    [id.foundation, id.application, id.memory].sort(), 'map shows the actual native authored visible children')
  assert.equal(await page.locator('.lum-node-open').count(), 0, 'leaf goals never get a scope arrow')
  await node(page, id.foundation).focus()
  await afterEffects(page)
  await selectedTitle(page, 'Skalarprodukte anwenden')
  await page.keyboard.press('Enter')
  await selectedTitle(page, 'Vektoren darstellen')
  assert.equal(await page.getByTestId('native-cockpit-map').getAttribute('data-native-map-witness'), 'original', 'product navigation map remains mounted when selecting a goal')
  assert.ok((await page.getByTestId('learner-active-goal-banner').innerText()).includes('Skalarprodukte anwenden'))
  assert.deepEqual(h.writes, [], 'map selection and keyboard focus never write active goal, mastery or learning focus')
  assert.deepEqual(h.mastery, { [id.foundation]: 1 })

  stage = 'same-ID reveal and double-click scope navigation'
  await page.getByTestId('learner-active-goal-banner').getByRole('button', { name: 'Gehe zum aktiven Ziel', exact: true }).click()
  await selectedTitle(page, 'Skalarprodukte anwenden')
  await scope(page, id.section)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(page, id.mathRoot)
  // Selected goal still has the same ID while its containing scope is hidden.
  await page.getByTestId('learner-active-goal-banner').getByRole('button', { name: 'Gehe zum aktiven Ziel', exact: true }).click()
  await scope(page, id.section)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(page, id.mathRoot)
  await node(page, id.section).dblclick({ delay: 100 })
  await scope(page, id.section)
  await selectedTitle(page, 'Vektoren')
  const leaf = node(page, id.foundation)
  await leaf.dblclick({ delay: 100 })
  await selectedTitle(page, 'Vektoren darstellen')
  await scope(page, id.section)
  await leaf.dblclick({ delay: 100, modifiers: ['Shift'] })
  await scope(page, id.mathRoot)
  assert.deepEqual(h.writes, [])
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')
  await page.screenshot({ path: join(artifacts, '02-native-map.png') })

  stage = 'SRS answer survives tree/map changes in production App'
  await node(page, id.section).dblclick({ delay: 100 })
  await scope(page, id.section)
  await node(page, id.memory).click()
  await selectedTitle(page, 'Vektoren erinnern')
  await page.getByRole('button', { name: /^Karteikarten lernen/u }).click()
  await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
  const flip = page.getByRole('button', { name: 'Zum Umdrehen tippen', exact: true })
  await flip.evaluate(element => element.setAttribute('data-native-drill-witness', 'original'))
  const answer = await page.locator('.learner-cockpit-selection').innerText()
  await navigation(page, 'tree')
  assert.equal(await sidebar.evaluate(element => element.getBoundingClientRect().width), classicWidth)
  await navigation(page, 'map')
  assert.equal(await flip.getAttribute('aria-pressed'), 'true')
  assert.equal(await flip.getAttribute('data-native-drill-witness'), 'original')
  assert.equal(await page.locator('.learner-cockpit-selection').innerText(), answer)
  assert.equal(await main.getAttribute('data-native-instance-witness'), 'original')

  stage = 'genuine tree focus, subject selection and changed Personal Curriculum'
  await navigation(page, 'tree')
  const physicsRow = sidebar.locator(`[data-goal-id="${id.physicsRoot}"]`)
  await physicsRow.waitFor()
  await Promise.all([
    page.waitForResponse(response => response.request().method() === 'PUT' && new URL(response.url()).pathname.endsWith('/planned')),
    physicsRow.getByRole('button', { name: 'Als Lernfokus setzen', exact: true }).click(),
  ])
  assert.deepEqual(h.writes.map(write => write.body), [{ goals: [id.physicsRoot] }])
  await physicsRow.click()
  await selectedTitle(page, 'Physik')
  await navigation(page, 'map')
  await node(page, id.physicsRoot).dblclick({ delay: 100 })
  await scope(page, id.physicsRoot)
  await node(page, id.physicsGoal).click()
  await selectedTitle(page, 'Kräfte beschreiben')
  assert.ok((await page.getByTestId('learner-active-goal-banner').innerText()).includes('Skalarprodukte anwenden'), 'browsing a different subject does not change active learning')
  await h.changePersonalCurriculum()
  await page.getByTestId('learner-active-goal-banner').filter({ hasText: 'Kräfte beschreiben' }).waitFor()
  await navigation(page, 'map')
  await scope(page, id.physicsRoot)
  await page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  assert.equal(await page.locator(`[data-entry-id="${id.mathRoot}"]`).count(), 0, 'reloaded native Personal Curriculum removes unselected subject')
  await navigation(page, 'tree')
  assert.equal(await sidebar.locator(`[data-goal-id="${id.mathRoot}"]`).count(), 0)
  assert.deepEqual(h.writes.map(write => write.body), [
    { goals: [id.physicsRoot] }, { rewindId: 'native-subjects-change' }, { optionId: 'physics-only' },
  ], 'only the explicit focus and authored curriculum actions mutate the isolated learner')
  assert.deepEqual(h.mastery, { [id.foundation]: 1 }, 'Personal Curriculum switching preserves global results')
  assert.deepEqual(h.errors, [])
  assert.deepEqual(h.unexpected, [])
  await h.context.close()

  stage = 'authoritative unit hierarchy keeps the native tree and atomic goal card'
  {
    const u = await open(1440, false, 'reduce', true)
    const unitId = learningUnitNavigationId(u.learningUnits.units[0])
    const main = u.page.getByTestId('learner-current-goal')
    await main.evaluate(element => element.setAttribute('data-unit-goal-card-witness', 'original'))
    await navigation(u.page, 'map')
    await scope(u.page, unitId)
    await u.page.getByTestId('learning-map-board').getByText('Du kannst Vektoren in einer eigenen Lösung anwenden.', { exact: true }).waitFor()
    assert.equal(await u.page.locator(`[data-entry-id="${id.other}"]`).getAttribute('data-entry-kind'), 'assessment')
    assert.equal(await u.page.locator(`[data-entry-id="${id.application}"]`).getByRole('img', { name: 'Durch selbständige Anwendung gemeistert', exact: true }).count(), 1)
    assert.equal(await u.page.locator('.lum-canvas img').count(), 0, 'the unit map never renders a second goal image')
    assert.equal(await main.locator('img').count(), 1)
    await u.page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
    await scope(u.page, '__learner_goal_map_root__')
    const unitNode = u.page.locator(`[data-entry-id="${unitId}"]`)
    assert.equal(await unitNode.getAttribute('data-entry-kind'), 'unit')
    assert.match(await unitNode.innerText(), /1\/2 erledigt/u, 'unit counts are the published backend counts')
    await node(u.page, unitId).click()
    await scope(u.page, unitId)
    assert.equal(await main.getAttribute('data-unit-goal-card-witness'), 'original', 'unit navigation preserves the original atomic goal card')
    assert.equal(await main.getByRole('heading', { name: 'Skalarprodukte anwenden', exact: true }).count(), 1)
    await node(u.page, id.other).click()
    await selectedTitle(u.page, 'Änderungsraten deuten')
    await u.page.getByTestId('learner-active-goal-banner').getByRole('button', { name: 'Gehe zum aktiven Ziel', exact: true }).click()
    await selectedTitle(u.page, 'Skalarprodukte anwenden')
    await scope(u.page, unitId)
    await navigation(u.page, 'tree')
    await u.page.locator('#learner-goal-sidebar [data-goal-id="' + id.section + '"]').waitFor()
    assert.equal(await u.page.locator(`[data-goal-id="${unitId}"]`).count(), 0, 'the original canonical tree stays intact')
    assert.deepEqual(u.writes, [], 'units and atomic navigation never write results, focus or active goals')
    assert.deepEqual(u.mastery, { [id.foundation]: 1 }, 'derived recognition is never saved as explicit mastery')
    assert.deepEqual(u.errors, [])
    assert.deepEqual(u.unexpected, [])
    await u.context.close()
  }

  for (const width of [320, 390]) {
    stage = `native mobile navigation at ${width}px`
    const m = await open(width)
    const opener = m.page.getByRole('button', { name: 'Lernzielmenü öffnen', exact: true })
    await opener.focus()
    await m.page.keyboard.press('Enter')
    await navigation(m.page, 'map')
    await scope(m.page, id.section)
    await m.page.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
    await node(m.page, id.foundation).focus()
    await afterEffects(m.page)
    await selectedTitle(m.page, 'Skalarprodukte anwenden')
    assert.equal(await m.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    await m.page.screenshot({ path: join(artifacts, `03-native-map-${width}.png`) })
    await node(m.page, id.foundation).click()
    await selectedTitle(m.page, 'Vektoren darstellen')
    await m.page.waitForFunction(() => (document.getElementById('learner-goal-sidebar')?.getBoundingClientRect().right ?? 1) <= 1)
    await opener.focus()
    await m.page.keyboard.press('Enter')
    await navigation(m.page, 'tree')
    await m.page.getByRole('button', { name: 'Lernzielmenü schließen', exact: true }).click()
    assert.equal(await m.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.deepEqual(m.writes, [])
    assert.deepEqual(m.errors, [])
    assert.deepEqual(m.unexpected, [])
    await m.context.close()
  }
  stage = 'native App double-click with normal motion'
  const animated = await open(1440, false, 'no-preference')
  await navigation(animated.page, 'map')
  await scope(animated.page, id.section)
  await animated.page.getByRole('button', { name: 'Eine Ebene auftauchen', exact: true }).click()
  await scope(animated.page, id.mathRoot)
  await node(animated.page, id.section).dblclick({ delay: 100 })
  await scope(animated.page, id.section)
  await selectedTitle(animated.page, 'Vektoren')
  assert.deepEqual(animated.writes, [])
  assert.deepEqual(animated.errors, [])
  assert.deepEqual(animated.unexpected, [])
  await animated.context.close()

  stage = 'layout worker failure has a local return-to-tree action'
  const failed = await open(1440, true)
  await navigation(failed.page, 'map')
  await failed.page.getByText('Die Karte konnte nicht angeordnet werden.', { exact: true }).waitFor()
  await failed.page.getByRole('button', { name: 'Zum Baum wechseln', exact: true }).click()
  await selectedTitle(failed.page, 'Skalarprodukte anwenden')
  assert.equal(await failed.page.locator('#learner-goal-sidebar').getAttribute('data-goal-navigation-mode'), 'tree')
  assert.deepEqual(failed.writes, [])
  assert.deepEqual(failed.errors, [])
  assert.deepEqual(failed.unexpected, [])
  await failed.context.close()

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
  console.log('Native product App learner map browser regression passed (desktop, 320px, 390px; isolated HTTP/SSE).')
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
