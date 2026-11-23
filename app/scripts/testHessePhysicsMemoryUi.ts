import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Locator, type Page } from 'playwright'
import { createServer } from 'vite'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import { LEARNER_UI_REFRESH_EVENT } from '../src/utils/learnerUiEvents'
import type { SkillLandscape } from '../src/landscapeTypes'
import { nativeMapIds as id, nativeMapLandscapes, nativeMapProfile } from './fixtures/nativeLearningMapData'
import { readUnitMapMaterials } from './lib/unitLearningMaterialCatalog'

const materials = readUnitMapMaterials(fileURLToPath(new URL('../../curricula/', import.meta.url)))
const { flashcardGoalId: memoryId, assessmentGoalId: examId } = materials.find(item => item.unit.compositionNodeId === 'physics-e1-motion')!.unit
assert(memoryId && examId)
const canonical = JSON.parse(await readFile(new URL('../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url), 'utf8')) as SkillLandscape
const memory = canonical.goals.find(goal => goal.id === memoryId)!
const assessment = canonical.goals.find(goal => goal.id === examId)!
const requiredAssessmentIds = ['ee7d5f3d-858f-59d6-89b0-e5a7f437f458', '39f52dcb-ff1d-5cad-9ccb-30da803cfa85',
  'c933b7d2-edcb-5747-9378-9762659f260a', 'f13ca187-b680-5f47-b4ad-76bd474bd8a2']
const horizontalThrow = canonical.goals.find(goal => goal.id === '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2')!
const roadSafety = canonical.goals.find(goal => goal.id === '4a2bf015-052b-4af0-aed7-324259fa1a8a')!
const nativePhysics = nativeMapLandscapes.find(landscape => landscape.landscapeId === id.physics)!
const force = nativePhysics.goals.find(goal => goal.id === id.physicsGoal)!
const energyId = 'fixture-energy'
const landscapes: SkillLandscape[] = [nativeMapLandscapes[0], { ...nativePhysics, goals: [
  { ...nativePhysics.goals[0], contains: [force.id, energyId, memoryId, examId, horizontalThrow.id, roadSafety.id] }, force,
  { ...horizontalThrow, requires: [] }, { ...roadSafety, requires: [] },
  { ...force, id: energyId, title: 'Energie erklären' }, { ...memory, requires: [] }, { ...assessment, requires: [] },
] }]
const phaseId = 'composition:de-he-gym-sekii-physics-gk:structure:physics-e-phase'
const topicId = 'composition:de-he-gym-sekii-physics-gk:structure:physics-e1-motion'
const energyTopicId = 'composition:de-he-gym-sekii-physics-gk:structure:physics-e2-newton-and-conservation'
const view = { viewFormatVersion: '1.2', viewId: 'de-he-gym-sekii-physics-gk', landscapeId: id.physics,
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'Sekundarstufe II', durationModel: 'G9' }, rootNodes: [
    { kind: 'structure', id: 'physics-sekii-gk', label: 'Sekundarstufe II', children: [
      { kind: 'structure', id: 'physics-e-phase', label: 'Einführungsphase', children: [
        // This partial E.1 projection contains the throw, while the source also offers road safety.
        { kind: 'structure', id: 'physics-e1-motion', label: 'E.1 Bewegungen und ihre Beschreibung', children: [
          { kind: 'goalEntry', goalId: force.id }, { kind: 'goalEntry', goalId: horizontalThrow.id },
        ] },
        { kind: 'structure', id: 'physics-e2-newton-and-conservation', label: 'E.2 Energie', children: [{ kind: 'goalEntry', goalId: energyId }] },
        { kind: 'structure', id: 'physics-he-ephase-cross-topic-assessments', label: 'Themenübergreifende Prüfungen', children: [{ kind: 'goalEntry', goalId: examId }] },
        { kind: 'goalEntry', goalId: memoryId },
      ] },
    ] },
  ] }
const deck = { deckId: 'de_gymnasium_physics_mechanics_ephase', title: memory.title, cards: [
  // Deck format 2 names understanding goals in originGoalIds; e2-a keeps the legacy tag encoding.
  { id: 'e1-a', front: 'E1 Frage A', back: 'E1 Antwort A', originGoalIds: [force.id], category: 'E1', tags: ['GK'] },
  { id: 'e1-b', front: 'E1 Frage B', back: 'E1 Antwort B', originGoalIds: [force.id], category: 'E1', tags: ['GK'] },
  { id: 'e2-a', front: 'E2 Frage', back: 'E2 Antwort', category: 'E2', tags: ['GK', 'goal:' + energyId] },
] }
function monitorBoard(dialog: Locator) {
  return dialog.evaluateHandle((element, refreshEvent) => {
    const activity = { layouts: 0, busy: 0, loading: 0 }
    const result = { activity, lastRefresh: '' }
    const original = Worker.prototype.postMessage
    Worker.prototype.postMessage = function(message, ...args) {
      if (message?.cmd === 'layout') activity.layouts++
      return Reflect.apply(original, this, [message, ...args])
    }
    const canvas = element.querySelector('.lum-canvas')!
    new MutationObserver(records => {
      // Read batched mutations backwards to distinguish real false→true transitions from repeated attribute writes.
      let nextBusy = canvas.getAttribute('aria-busy')
      for (const record of records.reverse()) {
        if (record.attributeName === 'aria-busy' && record.target === canvas) {
          if (record.oldValue === 'false' && nextBusy === 'true') activity.busy++
          nextBusy = record.oldValue
        }
        for (const added of record.addedNodes) {
          if (added instanceof Element && (added.matches('.lum-loading') || added.querySelector('.lum-loading'))) activity.loading++
        }
      }
    }).observe(element, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-busy'], attributeOldValue: true })
    window.addEventListener(refreshEvent, event => {
      result.lastRefresh = (event as CustomEvent).detail.reason
    })
    return result
  }, LEARNER_UI_REFRESH_EVENT)
}

async function checkMapLayout(page: Page, dialog: Locator, releaseDeck: () => void, changeActiveGoal: () => void) {
  const board = dialog.locator(`.lum-canvas[data-scope-id="${topicId}"][aria-busy="false"]`)
  const node = (goalId: string) => dialog.locator(`[data-entry-id="${goalId}"]`)
  await node(examId!).waitFor()
  await board.waitFor()
  assert.equal(await node(memoryId!).count(), 0, 'the E.1 board has no topic deck before its cards arrive')
  const probe = await monitorBoard(dialog)
  releaseDeck()
  await node(memoryId!).waitFor()
  await board.waitFor()
  const afterDeck = await probe.evaluate(value => value.activity)
  assert.deepEqual(afterDeck, { layouts: 1, busy: 1, loading: 1 }, 'loading a new deck keeps the board busy until its camera is ready')
  const camera = () => dialog.locator('.react-flow__viewport').evaluate(element => (element as HTMLElement).style.transform)
  const fittedCamera = await camera()
  await dialog.getByRole('button', { name: 'Karte verkleinern', exact: true }).click()
  const chosenCamera = await camera()
  assert.notEqual(chosenCamera, fittedCamera)
  const afterZoom = await probe.evaluate(value => value.activity)
  assert.deepEqual(afterZoom, afterDeck, 'manual zoom on the ready board does not restart placement')
  const assertBoardStable = async (action: string) => {
    await board.waitFor()
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    assert.deepEqual(await probe.evaluate(value => value.activity), afterZoom, action)
    assert.equal(await camera(), chosenCamera, action)
  }
  await node(horizontalThrow.id).locator('.lum-node-main').click()
  await dialog.locator(`[data-selected-goal-id="${horizontalThrow.id}"]`).waitFor()
  await assertBoardStable('selecting another goal on the same board preserves the layout and camera')
  await dialog.locator(`[data-entry-id="${force.id}"][data-active-goal="true"] .lum-node-main`).click()
  await dialog.locator(`[data-selected-goal-id="${force.id}"]`).waitFor()
  changeActiveGoal()
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-learner-update', { detail: 'ACTIVE_GOAL_UPDATE' })))
  await page.waitForFunction(value => value.lastRefresh === 'ACTIVE_GOAL_UPDATE', probe)
  await dialog.locator(`[data-entry-id="${horizontalThrow.id}"][data-active-goal="true"]`).waitFor()
  await dialog.locator(`[data-selected-goal-id="${horizontalThrow.id}"]`).waitFor()
  await assertBoardStable('receiving a new active goal on the same board preserves the layout and camera')
}

async function centerGoal(dialog: Locator, title: string) {
  const search = dialog.getByRole('textbox', { name: 'In dieser Ebene suchen' })
  await search.click()
  await search.fill(title)
  await dialog.getByRole('option').first().waitFor()
  await search.press('Enter')
}

async function checkProjectionGraph(page: Page, dialog: Locator, releaseDeck: () => void, updateProgress: () => void,
  verifyRequiredCamera = false) {
  const cart = canonical.goals.find(goal => goal.id === 'ee7d5f3d-858f-59d6-89b0-e5a7f437f458')!
  const projectile = canonical.goals.find(goal => goal.id === '39f52dcb-ff1d-5cad-9ccb-30da803cfa85')!
  const board = dialog.locator('.lum-canvas[aria-busy="false"]')
  const graph = dialog.locator('.lum-flow')
  const camera = () => graph.locator('.react-flow__viewport').evaluate(element => (element as HTMLElement).style.transform)
  const waitForReadable = async (id: string) => {
    await page.waitForFunction(id => {
      const el = document.querySelector(`.lum-flow [data-entry-id="${id}"]`)
      const surface = el?.closest('.lum-flow')?.getBoundingClientRect()
      const rect = el?.getBoundingClientRect()
      return rect && surface && rect.width >= 175 && rect.left >= surface.left - 1 && rect.right <= surface.right + 1
        && rect.top >= surface.top - 1 && rect.bottom <= surface.bottom + 1
    }, id)
  }
  await board.waitFor()
  await waitForReadable(projectile.id)
  const initialZoom = await dialog.getByLabel('Zoomwert').innerText()
  if (verifyRequiredCamera) {
    await page.waitForFunction(ids => {
      const board = document.querySelector('[data-testid="learner-learning-map-dialog"] .lum-flow')!
      const surface = board.getBoundingClientRect()
      return ids.every(id => {
        const rect = board.querySelector(`[data-entry-id="${id}"] .lum-node-main`)?.getBoundingClientRect()
        return rect && rect.width >= 170 && rect.left >= surface.left && rect.right <= surface.right
          && rect.top >= surface.top && rect.bottom <= surface.bottom
      })
    }, requiredAssessmentIds.slice(0, 3))
    const framedCamera = await camera()
    await dialog.getByRole('button', { name: 'Karte verkleinern', exact: true }).click()
    await page.waitForFunction(before => (document.querySelector('.react-flow__viewport') as HTMLElement)?.style.transform !== before, framedCamera)
    const chosenCamera = await camera()
    assert.notEqual(chosenCamera, framedCamera)
    const refreshedContext = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/state'))
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-learner-update', { detail: 'MASTERY_UPDATE' })))
    const refreshed = await (await refreshedContext).json()
    assert.deepEqual(refreshed.levelCompletion.unitAssessment.parts.map((part: { goalId: string }) => part.goalId), requiredAssessmentIds)
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    assert.equal(await camera(), chosenCamera, 'a fresh equal-valued assessment array from a LearnerView refresh never overwrites manual zoom')
    await dialog.getByRole('button', { name: 'Lernkarte schließen', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open').click()
    await dialog.waitFor()
    await board.waitFor()
    await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
    assert.equal(await camera(), chosenCamera, 'reopening the previously closed map preserves the learner camera rather than reframing its selected assessment')
  }
  const count = graph.locator('[data-entry-kind="assessment"]')
  await dialog.getByRole('button', { name: 'Diese Ebene einpassen', exact: true }).click()
  await page.waitForFunction(() => document.querySelectorAll('.lum-flow [data-entry-kind="assessment"]').length === 6)
  assert.equal(await count.count(), 6)
  assert(await count.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).opacity === '1')),
    'neighbouring assessments retain full contrast when a peer is selected')
  await centerGoal(dialog, cart.title)
  await waitForReadable(cart.id)
  await graph.locator(`[data-entry-id="${cart.id}"] .lum-node-main`).press('Enter')
  await dialog.locator(`[data-selected-goal-id="${cart.id}"]`).waitFor()
  const probe = await monitorBoard(dialog)
  releaseDeck()
  await page.waitForFunction(value => value.activity.layouts === 1, probe)
  await board.waitFor()
  await centerGoal(dialog, 'Lernkarten zu E.1 üben')
  await graph.locator(`[data-entry-id="${memoryId}"]`).waitFor()
  assert.equal(await dialog.getByTestId('native-cockpit-map').getAttribute('data-selected-goal-id'), cart.id,
    'locating a borrowed deck does not route the cockpit away from the selected goal')
  const afterDeck = await probe.evaluate(value => value.activity)
  assert.deepEqual(afterDeck, { layouts: 1, busy: 1, loading: 1 }, 'a real deck changes the graph topology exactly once')
  await centerGoal(dialog, horizontalThrow.title)
  await waitForReadable(horizontalThrow.id)
  const goal = graph.locator(`[data-entry-id="${horizontalThrow.id}"]`)
  await goal.getByRole('img', { name: 'Noch offen' }).waitFor()
  const originalNode = await goal.elementHandle()
  const beforeMastery = await camera()
  updateProgress()
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('test-learner-update', { detail: 'MASTERY_UPDATE' })))
  await page.waitForFunction(value => value.lastRefresh === 'MASTERY_UPDATE', probe)
  const directEvidence = goal.getByRole('img', { name: 'Direkt nachgewiesen', exact: true })
  await directEvidence.waitFor()
  assert.equal(await directEvidence.getAttribute('data-testid'), 'learning-map-direct-evidence')
  assert.deepEqual(await probe.evaluate(value => value.activity), afterDeck, 'mastery updates without rearranging the graph')
  assert(await originalNode?.evaluate(element => element.isConnected), 'the same graph node remains mounted')
  assert.equal(await camera(), beforeMastery)
  return initialZoom
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const cacheDir = await mkdtemp(join(tmpdir(), 'skillpilot-he-memory-'))
const server = await createServer({ root: appRoot, configFile: false, cacheDir, logLevel: 'error',
  define: { 'import.meta.env.VITE_API_BASE': JSON.stringify(''), __UNIT_MAP_LEARNING_MATERIALS__: JSON.stringify(materials) }, plugins: [react(), tailwindcss(), {
    name: 'he-memory-no-service-worker', resolveId(source) { if (source === 'virtual:pwa-register') return '\0he-memory-pwa' },
    load(source) { if (source === '\0he-memory-pwa') return 'export const registerSW = () => () => {}' },
  }], optimizeDeps: { entries: ['index.html'], include: ['react/jsx-dev-runtime'] },
  server: { host: '127.0.0.1', port: 0, strictPort: false, hmr: false } })
await server.listen()
const address = server.httpServer!.address()
assert(address && typeof address !== 'string')
const origin = `http://127.0.0.1:${address.port}`
const browser = await chromium.launch({ headless: true })
const scenarios: {
  width: number
  height?: number
  viewFile?: string
  futureTopic?: boolean
  switchDuringSave?: boolean
  backgroundOverlap?: boolean
  deckDuringSearch?: boolean
  checkChildBoard?: boolean
}[] = [
  { width: 1440, viewFile: 'de-he-sekii-gk', checkChildBoard: true },
  ...['de-he-gk-g8', 'de-he-sekii-gk'].flatMap(viewFile => [
    ...[390, 761, 1024, 1440].map(width => ({ width, height: width === 1024 ? 650 : 900, viewFile })),
  ]),
  ...[{ width: 1024, height: 900 }, { width: 1024, height: 650 }, { width: 1100, height: 900 }, { width: 1440, height: 900 }]
    .map(size => ({ ...size, viewFile: 'de-he-sekii-lk' })),
  { width: 1440, futureTopic: false, switchDuringSave: false, backgroundOverlap: false },
  { width: 390, futureTopic: false, switchDuringSave: false, backgroundOverlap: false, deckDuringSearch: true },
  { width: 1440, futureTopic: true, switchDuringSave: false, backgroundOverlap: false },
  { width: 1440, futureTopic: false, switchDuringSave: true, backgroundOverlap: false },
  { width: 1440, futureTopic: false, switchDuringSave: true, backgroundOverlap: true },
]
try {
  for (const scenario of scenarios) {
    const { width, futureTopic, switchDuringSave, backgroundOverlap, viewFile, deckDuringSearch, checkChildBoard } = scenario
    const dataView = viewFile ? JSON.parse(await readFile(new URL(
      `../../curricula/DE/Gymnasium/composition-views/physik/${viewFile}.view.json`, import.meta.url), 'utf8')) : view
    const profile = nativeMapProfile(true)
    if (viewFile) {
      const config = JSON.parse(profile.personalCurriculum)
      config[id.root] = { selected: true, filterId: 'DE-HE', durationModel: dataView.scope.durationModel ?? 'G9', stage: dataView.scope.stage }
      config[id.physics].filterId = dataView.scope.courseProfile
      if (dataView.scope.stage === 'CrossStage') config.__skillpilot_stage_scope_sek1__ = { selected: true }
      profile.personalCurriculum = JSON.stringify(config)
    }
    const dataLandscapes = viewFile ? [nativeMapLandscapes[0], canonical] : landscapes
    const dataTopic = `composition:${dataView.viewId}:structure:physics-e1-motion`
    const initialGoal = viewFile ? canonical.goals.find(goal => goal.id === '39f52dcb-ff1d-5cad-9ccb-30da803cfa85')! : force
    const mastery: Record<string, number> = {}
    const checkLayout = width === 1440 && !futureTopic && !switchDuringSave
    let releaseDeck!: () => void
    const delayedDeck = new Promise<void>(resolve => { releaseDeck = resolve })
    const context = await browser.newContext({ viewport: { width, height: scenario.height ?? 960 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
    await context.addInitScript('globalThis.__name = (target) => target')
    await context.addInitScript(({ learner, root, terms }) => {
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_id', learner)
      localStorage.setItem('skillpilot_learner_landscape', root)
      localStorage.setItem('skillpilot_terms_accepted_version', terms)
      class TestEventSource extends EventTarget {
        readyState = 1
        constructor() { super(); window.addEventListener('test-learner-update', this.update) }
        onmessage: ((event: MessageEvent) => void) | null = null
        update = (event: Event) => this.onmessage?.(new MessageEvent('message', { data: JSON.stringify({ type: (event as CustomEvent).detail }) }))
        close() { window.removeEventListener('test-learner-update', this.update) }
      }
      Object.defineProperty(window, 'EventSource', { configurable: true, value: TestEventSource })
    }, { learner: id.learner, root: id.root, terms: CURRENT_TERMS_VERSION })
    context.setDefaultTimeout(30_000)
    const page = await context.newPage()
    const errors: string[] = [], unexpected: string[] = []
    const writes: { srsState: Record<string, { repetition?: number; nextReview?: number }> }[] = []
    let revision = '2026-11-18T08:00:00Z'
    let savePending = false, getsDuringWrite = 0, conflicts = 0
    const verifiedRecall = { status: 'passed', passedAt: '2026-11-01T08:00:00Z' }
    const outside = { id: 'e2-a', interval: 1, repetition: 1, ef: 2.5, nextReview: 0 }
    let srsState: Record<string, unknown> = {
      'e1-a': { id: 'e1-a', interval: 1, repetition: 1, ef: 2.5, nextReview: futureTopic ? Date.now() + 86_400_000 : 0, verifiedRecall },
      'e1-b': { id: 'e1-b', interval: 1, repetition: 1, ef: 2.5, nextReview: futureTopic ? Date.now() + 86_400_000 : 0, verifiedRecall }, 'e2-a': outside,
    }
    const cameraContext = viewFile === 'de-he-sekii-lk'
    const learnerState = { activeGoal: { id: initialGoal.id }, frontier: [{ id: initialGoal.id }],
      goals: { planned: [{ id: id.physicsRoot }], mastered_count: 0, total_count: 6, personalized: { mastered_atomic: 0, total_atomic: 5 } },
      stateMachine: { activeGoal: { id: initialGoal.id }, goalOptions: [], requiredAction: null },
      ...(cameraContext ? { levelCompletion: {
        calculationStatus: 'valid', contextRef: 'camera-scope', profileId: 'automatic:' + dataTopic,
        profileRevision: '1', curriculumGeneration: 'camera-generation', learnerRevision: 1,
        title: { de: 'E.1 Bewegungen und ihre Beschreibung' }, complete: false,
        masteredTargetCount: 0, waivedTargetCount: 0, pendingTargetCount: 4, targetCount: 4,
        masteredAssessmentCount: 0, requiredAssessmentCount: 4, waivedTargetGoalIds: [],
        assessments: requiredAssessmentIds.map(goalId => ({ goalId, title: { de: canonical.goals.find(goal => goal.id === goalId)!.title },
          mastered: false, startAvailable: false })), profileOptions: [], directAssessmentRunning: false, actions: [],
        unitAssessment: { sectionGoalId: dataTopic, revision: 'camera-contract', passed: false,
          parts: requiredAssessmentIds.map(goalId => ({ goalId, title: { de: canonical.goals.find(goal => goal.id === goalId)!.title },
            passed: false, materialCurrent: true })), planningCreditGoalIds: [], individuallyOpenGoalIds: [] },
      } } : {}),
    }
    page.on('pageerror', error => errors.push(error.message))
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url()), path = url.pathname
      const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      if (url.origin !== origin) return route.abort()
      if (path.includes('de_gymnasium_physics_flashcards_mechanics_ephase.')) {
        if (checkLayout || viewFile || deckDuringSearch) await delayedDeck
        return viewFile ? route.fulfill({ contentType: 'application/json', path: fileURLToPath(new URL(
          '../../curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json', import.meta.url)) }) : json(deck)
      }
      if (!path.startsWith('/api/')) return route.continue()
      if (path === '/api/ui/curriculum-catalog') return json({ error: 'Repository curriculum mode' }, 404)
      if (path === '/api/ui/landscapes') return json({ summaries: dataLandscapes.map(landscape => ({ curriculumId: landscape.landscapeId,
        title: landscape.title, subject: landscape.subject ?? 'Gymnasium', filename: `${landscape.landscapeId}.json`, frameworkId: 'canonical-gymnasium',
        country: 'DE', region: 'DE', type: 'GYMNASIUM', level: 'Sekundarstufe', locale: 'de-DE', schoolType: 'Gymnasium', qualityMaturity: 'M6' })) })
      if (path === '/api/ui/composition-views/match') {
        return json(url.searchParams.get('landscapeId') === id.physics ? dataView
          : { viewId: 'fixture-root', landscapeId: id.root, scope: dataView.scope, rootNodes: [{ kind: 'landscapeEntry', landscapeId: id.physics }] })
      }
      if (path.endsWith(`/landscapes/${id.root}/closure`)) return json(dataLandscapes)
      const suffix = path.replace(`/api/ui/learners/${id.learner}`, '')
      if (request.method() === 'GET' && suffix === `/exam-passes/${examId}`) {
        return json([{ passedAt: '2026-11-17T08:00:00Z', earnedPoints: 18, maxPoints: 25, passingPoints: 15,
          fingerprint: 'sha256:' + 'a'.repeat(64) }])
      }
      if (viewFile && suffix.startsWith('/exam-passes/') && request.method() === 'GET') return json([])
      if (!suffix && request.method() === 'GET') return json({ ...profile, activeGoalId: learnerState.activeGoal.id })
      if (suffix === '/mastery') return json({ mastery })
      if (suffix === '/state') return json(learnerState)
      if (suffix === '/unit-introduction') {
        return json({ orientationGoalId: null })
      }
      if (suffix === '/resume') return json({ lastActivityAt: '2026-11-18T08:00:00Z', scheduledDeletionAt: '2027-05-18T08:00:00Z' })
      if (suffix === '/personalization-plan') return json({ stage: 'COMPLETE', options: [], displayOptions: [], navigationOptions: [],
        currentSelectedOptions: [], completedDecisions: [], preservedDecisions: [], pendingDecisions: [], canReopenMigratedPersonalization: false, problemCode: null })
      if (suffix === '/learning-plans') return json({ asOf: '2026-11-18', followLearningPlans: false, plans: [], status: {
        asOf: '2026-11-18', periodBasis: 'DAY', periodStart: '2026-11-18', periodEnd: '2026-11-18', timeZone: 'Europe/Berlin', language: 'de',
        evaluable: false, statusText: '', noticeText: null, activeGoal: null, followLearningPlans: false, resumeAvailable: false, subjects: [], unavailablePlanCount: 0 } })
      if (suffix === `/client-state/${memoryId}`) {
        if (request.method() === 'PUT') {
          const body = request.postDataJSON()
          if (body.expectedUpdatedAt !== revision) { conflicts++; return json({ error: 'revision conflict' }, 409) }
          writes.push(body)
          savePending = true
          if (switchDuringSave) await new Promise(resolve => setTimeout(resolve, 1500))
          srsState = body.srsState
          revision = new Date(Date.parse('2026-11-18T08:10:00Z') + writes.length * 1000).toISOString()
          savePending = false
          return json({ savedAt: revision })
        }
        if (savePending) getsDuringWrite++
        return json({ srsState, updatedAt: revision })
      }
      if (viewFile && suffix.startsWith('/client-state/') && request.method() === 'GET') return json({ srsState: {}, updatedAt: revision })
      if (suffix === '/content-selection' || suffix === '/content-materials') return json({ error: 'Optional pilot disabled' }, 404)
      unexpected.push(`${request.method()} ${path}`)
      return json({ error: 'Unexpected isolated browser request' }, 404)
    })
    await page.goto(`${origin}/learner/${initialGoal.id}?l=${id.root}`, { waitUntil: 'domcontentloaded' })
    await page.getByTestId('learner-current-goal').getByRole('heading', { name: initialGoal.title, exact: true }).first().waitFor({ timeout: 30_000 })
    const opener = page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open')
    await opener.click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    await page.locator(`.lum-canvas[data-scope-id="${dataTopic}"][aria-busy="false"]`).waitFor({ timeout: 15_000 }).catch(async error => {
      console.error({ width, board: await page.locator('.lum-canvas').getAttribute('data-scope-id'),
        map: await dialog.innerText(), errors, unexpected })
      throw error
    })
    assert.equal(await dialog.locator('.lum-scope-actions, .lum-inspector, .unit-introduction, [data-testid="unit-assessment-summary"], [data-testid="learner-unit-assignment"], [data-testid="learning-map-flashcard-practice"]').count(), 0,
      'the real subject map shows only its header and graph, including nested topic boards')
    if (checkChildBoard) {
      releaseDeck()
      const nestedScope = `composition:${dataView.viewId}:structure:physics-e1-accelerated-and-free-fall`
      const title = 'Beschleunigte Bewegung und freier Fall'
      await centerGoal(dialog, title)
      const unit = dialog.locator(`[data-entry-id="${nestedScope}"]`)
      assert.equal(await unit.getByRole('button', { name: /üben/i }).count(), 0)
      await unit.getByRole('button', { name: `In ${title} hineinzoomen`, exact: true }).click()
      const board = dialog.locator(`.lum-canvas[data-scope-id="${nestedScope}"][aria-busy="false"]`)
      await board.waitFor()
      await board.locator('[data-entry-id="09029573-864f-40ca-bf8a-cee7bf6dcb73"] .lum-node-main').waitFor()
      assert.equal(await board.getByRole('button', { name: /^Üben(\s|:|$)/ }).count(), 0)
      assert.deepEqual(writes, [], 'opening the nested board never writes a result')
      assert.deepEqual(unexpected, [])
      assert.deepEqual(errors, [])
      await context.close()
      continue
    }
    if (viewFile) {
      const initialZoom = await checkProjectionGraph(page, dialog, releaseDeck, () => { mastery[horizontalThrow.id] = 1 }, cameraContext)
      if (width === 390 || width === 1440) {
        const cases = [
          { id: '716acf20-d882-5152-9735-099876d631b4', phase: 'physics-q1', source: 'Übungen' },
          { id: 'e0932fef-9e1c-5c95-b00c-7589e76d0e83', phase: 'physics-q2', source: 'Aufgaben zu Magnetfeldern und Induktion' },
        ]
        for (const example of cases) {
          const title = canonical.goals.find(goal => goal.id === example.id)!.title
          await page.goto(`${origin}/learner/${example.id}?l=${id.root}`, { waitUntil: 'domcontentloaded' })
          await page.getByTestId('learner-current-goal').getByRole('heading', { name: title, exact: true }).first().waitFor()
          await opener.click()
          const phase = `composition:${dataView.viewId}:structure:${example.phase}`
          await dialog.locator(`.lum-canvas[data-scope-id="${phase}"][aria-busy="false"]`).waitFor()
          const leaf = dialog.locator(`[data-entry-id="${example.id}"][data-entry-kind="assessment"]`)
          await leaf.waitFor()
          assert.equal(await leaf.locator('.lum-node-meta').innerText(), `Prüfung · ${example.source}`)
          assert.equal(await leaf.locator('.lum-node-open').count(), 0)
          await leaf.locator('.lum-node-main').press('Enter')
          await dialog.locator(`[data-selected-goal-id="${example.id}"]`).waitFor()
        }
      }
      assert.deepEqual(errors, [])
      assert.deepEqual(unexpected, [])
      console.log(`${viewFile} ${width}×${scenario.height}: six assessments, graph B→A; initial zoom ${initialZoom}, stable on mastery refresh`)
      await context.close()
      continue
    }
    if (checkLayout) await checkMapLayout(page, dialog, releaseDeck, () => {
      learnerState.activeGoal.id = horizontalThrow.id
      learnerState.stateMachine.activeGoal.id = horizontalThrow.id
    })
    const practice = dialog.getByRole('button', { name: 'Lernkarten zu E.1 üben', exact: true })
    if (!futureTopic && !switchDuringSave) {
      assert.equal(await dialog.getByRole('heading', { name: 'Ein Ball rollt vom Tisch. Wo landet er?', exact: true }).count(), 0,
        'the unit introduction stays in the Cockpit rather than above the graph')
      if (width === 390) await centerGoal(dialog, horizontalThrow.title)
      const throwNode = dialog.locator(`[data-entry-id="${horizontalThrow.id}"]`)
      const subjectGoal = throwNode.locator('.lum-node-main')
      await subjectGoal.waitFor()
      if (deckDuringSearch) {
        assert.equal(await dialog.locator(`[data-entry-id="${memoryId}"]`).count(), 0)
        const hydration = await monitorBoard(dialog)
        releaseDeck()
        await page.waitForFunction(value => value.activity.layouts === 1, hydration)
        await dialog.locator(`.lum-canvas[data-scope-id="${dataTopic}"][aria-busy="false"]`).waitFor()
      }
      assert.equal(await throwNode.getByRole('button').count(), 1, 'authored material does not add a second button')
      assert.equal(await dialog.locator(`[data-entry-id="${roadSafety.id}"]`).count(), 0)
      await subjectGoal.press('Enter')
      await dialog.locator(`[data-selected-goal-id="${horizontalThrow.id}"]`).waitFor()
      assert.equal(await dialog.isVisible(), true, 'selecting a goal stays on the map')
      assert.deepEqual(writes, [])
    }
    if (width === 390) await centerGoal(dialog, assessment.title)
    await dialog.locator(`[data-entry-id="${examId}"]`).getByText('Prüfung aus „Themenübergreifende Prüfungen“').waitFor()
    if (width === 390) await centerGoal(dialog, 'Lernkarten zu E.1 üben')
    await dialog.locator(`[data-entry-id="${memoryId}"]`).getByText('Aus dem Stapel „Einführungsphase“').waitFor()
    await practice.waitFor()
    for (const resource of [memoryId, examId]) {
      if (width === 390) await centerGoal(dialog, resource === memoryId ? 'Lernkarten zu E.1 üben' : assessment.title)
      const node = dialog.locator(`[data-entry-id="${resource}"]`)
      assert.equal(await node.evaluate(element => getComputedStyle(element).opacity), '1',
        'both resource labels remain readable while another goal is selected')
    }
    if (width === 390) await centerGoal(dialog, 'Lernkarten zu E.1 üben')
    await practice.focus()
    await page.keyboard.press('Enter')
    await dialog.waitFor({ state: 'hidden' })
    if (futureTopic) {
      await page.getByRole('heading', { name: 'Übung erledigt', exact: true }).waitFor()
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      assert.deepEqual(writes, [], 'a completed non-due topic does not submit an empty or partial original-deck snapshot')
      const restored = await page.evaluate(({ learner, goal }) => JSON.parse(localStorage.getItem(`srs_state_${learner}_${goal}`)!), { learner: id.learner, goal: memoryId })
      assert.deepEqual(restored, srsState, 'loading a non-due subset preserves the complete state')
      await context.close()
      continue
    }
    await page.getByText('Karte 1 von 2', { exact: true }).waitFor()
    assert.equal(await page.getByText('E2 Frage', { exact: true }).count(), 0)
    await page.locator(`[data-goal-id="${memoryId}"]`).waitFor()
    assert.equal(await page.locator(`[data-goal-id="${memoryId}"] .lucide-check`).count(), 0,
      'verified topic cards must not complete the full phase memory goal')
    if (switchDuringSave) {
      await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
      await page.getByRole('button', { name: 'Gewusst', exact: true }).click()
      if (backgroundOverlap) {
        await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')))
        await page.getByRole('button', { name: 'Nächste Karte', exact: true }).click()
        await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
        await page.getByRole('button', { name: 'Gewusst', exact: true }).click()
      }
      await page.getByRole('button', { name: 'Zur Auswahl', exact: true }).click()
      await opener.click()
      await page.locator(`.lum-canvas[data-scope-id="${phaseId}"][aria-busy="false"]`).waitFor()
      assert.equal(await dialog.locator(`[data-entry-id="${energyTopicId}"]`).count(), 0)
      const energy = dialog.locator(`[data-entry-id="${energyId}"][data-entry-kind="goal"]`)
      assert.match(await energy.locator('.lum-node-meta').innerText(), /E\.2 Energie/u)
      assert.equal(await energy.getByRole('button').count(), 1, 'a single-goal section also has no practice shortcut')
      await dialog.getByRole('button', { name: 'Gesamten Lernkartenstapel üben', exact: true }).click()
      await page.getByText(/Karte 1 von [12]/).waitFor()
      if (!await page.getByText('E2 Frage', { exact: true }).isVisible()) {
        await page.getByRole('button', { name: 'Nächste Karte', exact: true }).click()
      }
      await page.getByText('E2 Frage', { exact: true }).waitFor()
      assert.equal(getsDuringWrite, 0, 'the next topic reads after the previous topic save completes')
      await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
      const saved = page.waitForResponse(response => response.request().method() === 'PUT' && response.url().includes(`/client-state/${memoryId}`))
      await page.getByRole('button', { name: 'Gewusst', exact: true }).click()
      await page.evaluate(() => window.dispatchEvent(new Event('beforeunload')))
      await saved
      assert.equal(writes.length, backgroundOverlap ? 3 : 2, 'background leave notification does not duplicate the foreground write')
      assert.equal(conflicts, 0, 'a topic switch keeps the shared original-deck revision')
      assert.equal(writes.at(-1)!.srsState['e2-a'].repetition, 2)
      assert.equal(Object.values(writes.at(-1)!.srsState).filter(card => card.repetition === 2).length, backgroundOverlap ? 3 : 2,
        'the second topic save retains the first topic rating and its own final rating')
      await context.close()
      continue
    }
    for (let card = 0; card < 2; card++) {
      await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
      await page.getByRole('button', { name: 'Gewusst', exact: true }).click()
      if (card === 0) await page.getByRole('button', { name: 'Nächste Karte', exact: true }).click()
    }
    await page.waitForFunction(({ learner, goal }) => localStorage.getItem(`srs_state_last_sync_${learner}_${goal}`)?.startsWith('2026-11-18T08:10:'), { learner: id.learner, goal: memoryId })
    assert(writes.length > 0)
    assert.deepEqual(writes.at(-1)!.srsState['e2-a'], outside, 'practicing E.1 preserves unrelated card state in the original deck')
    assert.equal(Object.keys(writes.at(-1)!.srsState).length, 3, 'topic persistence keeps the full original card state')
    for (const card of ['e1-a', 'e1-b']) {
      assert.equal(writes.at(-1)!.srsState[card].repetition, 2, 'the immediate batch save contains the final rating')
      assert((writes.at(-1)!.srsState[card].nextReview ?? 0) > Date.now())
    }
    await page.getByRole('button', { name: 'Zur Auswahl', exact: true }).click()
    await opener.click()
    await page.locator(`.lum-canvas[data-scope-id="${phaseId}"][aria-busy="false"]`).waitFor()
    assert.equal(await dialog.locator(`[data-entry-id="${memoryId}"]`).count(), 1)
    await dialog.getByRole('button', { name: 'Gesamten Lernkartenstapel üben', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    // E.1 is now scheduled; the complete deck correctly offers the remaining E.2 card.
    await page.getByText('E2 Frage', { exact: true }).waitFor()
    const priorWrites = writes.length
    await page.getByRole('button', { name: 'Antwort zeigen', exact: true }).click()
    await Promise.all([
      page.waitForResponse(response => response.request().method() === 'PUT' && response.url().includes(`/client-state/${memoryId}`)),
      page.getByRole('button', { name: 'Gewusst', exact: true }).click(),
    ])
    await page.waitForFunction(({ learner, goal }) => {
      const stored = JSON.parse(localStorage.getItem(`srs_state_${learner}_${goal}`)!)
      return stored['e2-a']?.repetition === 2
    }, { learner: id.learner, goal: memoryId })
    assert(writes.length > priorWrites)
    assert.equal(writes.at(-1)!.srsState['e2-a'].repetition, 2, 'a one-card practice saves its own final rating')
    assert.equal(conflicts, 0)
    await page.getByRole('button', { name: 'Zur Auswahl', exact: true }).click()
    await opener.click()
    await page.locator(`.lum-canvas[data-scope-id="${phaseId}"][aria-busy="false"]`).waitFor()
    await dialog.locator(`[data-entry-id="${topicId}"] .lum-node-main`).dblclick()
    await page.locator(`.lum-canvas[data-scope-id="${topicId}"][aria-busy="false"]`).waitFor()
    await dialog.getByRole('button', { name: `Prüfung: ${assessment.title}`, exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByTestId('learner-current-goal').getByRole('heading', { name: assessment.title, exact: true }).waitFor()
    assert.equal(new URL(page.url()).pathname, `/learner/${examId}`, 'E.1 opens the single canonical assessment target')
    const history = page.getByRole('region', { name: 'Deine Prüfungsnachweise' })
    await history.getByText('Bestanden mit 18 von 25 Punkten (Bestehensgrenze 15)').waitFor()
    assert.equal(await history.locator('time').getAttribute('datetime'), '2026-11-17T08:00:00Z')
    assert.deepEqual(unexpected, [])
    assert.deepEqual(errors, [])
    await context.close()
  }
  console.log('Hessen Physics UI passed: ordinary goal selection without practice buttons, ELK/selection/active updates, keyboard/topic practice, original progress/state, complete deck, named assessment, desktop/mobile.')
} finally {
  await browser.close()
  await server.close()
  await rm(cacheDir, { recursive: true, force: true })
}
