import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import type { SkillLandscape } from '../src/landscapeTypes'
import { nativeMapIds as id, nativeMapLandscapes, nativeMapProfile } from './fixtures/nativeLearningMapData'
import { readUnitMapMaterials } from './lib/unitLearningMaterialCatalog'

const materials = readUnitMapMaterials(fileURLToPath(new URL('../../curricula/', import.meta.url)))
const { flashcardGoalId: memoryId, assessmentGoalId: examId } = materials.find(item => item.unit.compositionNodeId === 'physics-e1-motion')!.unit
assert(memoryId && examId)
const canonical = JSON.parse(await readFile(new URL('../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', import.meta.url), 'utf8')) as SkillLandscape
const memory = canonical.goals.find(goal => goal.id === memoryId)!
const assessment = canonical.goals.find(goal => goal.id === examId)!
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
  { id: 'e1-a', front: 'E1 Frage A', back: 'E1 Antwort A', category: 'E1', tags: ['GK', 'goal:' + force.id] },
  { id: 'e1-b', front: 'E1 Frage B', back: 'E1 Antwort B', category: 'E1', tags: ['GK', 'goal:' + force.id] },
  { id: 'e2-a', front: 'E2 Frage', back: 'E2 Antwort', category: 'E2', tags: ['GK', 'goal:' + energyId] },
] }
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
try {
  for (const { width, futureTopic, switchDuringSave, backgroundOverlap } of [
    { width: 1440, futureTopic: false, switchDuringSave: false, backgroundOverlap: false },
    { width: 390, futureTopic: false, switchDuringSave: false, backgroundOverlap: false },
    { width: 1440, futureTopic: true, switchDuringSave: false, backgroundOverlap: false },
    { width: 1440, futureTopic: false, switchDuringSave: true, backgroundOverlap: false },
    { width: 1440, futureTopic: false, switchDuringSave: true, backgroundOverlap: true },
  ]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce', serviceWorkers: 'block' })
    await context.addInitScript('globalThis.__name = (target) => target')
    await context.addInitScript(({ learner, root, terms }) => {
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_id', learner)
      localStorage.setItem('skillpilot_learner_landscape', root)
      localStorage.setItem('skillpilot_terms_accepted_version', terms)
      class TestEventSource extends EventTarget { readyState = 1; close() {} }
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
    const learnerState = { activeGoal: { id: force.id }, frontier: [{ id: force.id }],
      goals: { planned: [{ id: id.physicsRoot }], mastered_count: 0, total_count: 6, personalized: { mastered_atomic: 0, total_atomic: 5 } },
      stateMachine: { activeGoal: { id: force.id }, goalOptions: [], requiredAction: null } }
    page.on('pageerror', error => errors.push(error.message))
    await context.route('**/*', async route => {
      const request = route.request(), url = new URL(request.url()), path = url.pathname
      const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      if (url.origin !== origin) return route.abort()
      if (path.includes('de_gymnasium_physics_flashcards_mechanics_ephase.')) return json(deck)
      if (!path.startsWith('/api/')) return route.continue()
      if (path === '/api/ui/curriculum-catalog') return json({ error: 'Repository curriculum mode' }, 404)
      if (path === '/api/ui/landscapes') return json({ summaries: landscapes.map(landscape => ({ curriculumId: landscape.landscapeId,
        title: landscape.title, subject: landscape.subject ?? 'Gymnasium', filename: `${landscape.landscapeId}.json`, frameworkId: 'canonical-gymnasium',
        country: 'DE', region: 'DE', type: 'GYMNASIUM', level: 'Sekundarstufe', locale: 'de-DE', schoolType: 'Gymnasium', qualityMaturity: 'M6' })) })
      if (path === '/api/ui/composition-views/match') {
        return json(url.searchParams.get('landscapeId') === id.physics ? view
          : { viewId: 'fixture-root', landscapeId: id.root, scope: view.scope, rootNodes: [{ kind: 'landscapeEntry', landscapeId: id.physics }] })
      }
      if (path.endsWith(`/landscapes/${id.root}/closure`)) return json(landscapes)
      const suffix = path.replace(`/api/ui/learners/${id.learner}`, '')
      if (request.method() === 'GET' && suffix === `/exam-passes/${examId}`) {
        return json([{ passedAt: '2026-11-17T08:00:00Z', earnedPoints: 18, maxPoints: 25, passingPoints: 15,
          fingerprint: 'sha256:' + 'a'.repeat(64) }])
      }
      if (!suffix && request.method() === 'GET') return json(nativeMapProfile(true))
      if (suffix === '/mastery') return json({ mastery: {} })
      if (suffix === '/state') return json(learnerState)
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
      if (suffix === '/content-selection' || suffix === '/content-materials') return json({ error: 'Optional pilot disabled' }, 404)
      unexpected.push(`${request.method()} ${path}`)
      return json({ error: 'Unexpected isolated browser request' }, 404)
    })
    await page.goto(`${origin}/learner/${force.id}?l=${id.root}`, { waitUntil: 'domcontentloaded' })
    await page.getByTestId('learner-current-goal').getByRole('heading', { name: force.title, exact: true }).waitFor({ timeout: 30_000 })
    const opener = page.getByTestId('learner-main-content').getByTestId('learner-learning-map-open')
    await opener.click()
    const dialog = page.getByTestId('learner-learning-map-dialog')
    await page.locator(`.lum-canvas[data-scope-id="${topicId}"][aria-busy="false"]`).waitFor({ timeout: 15_000 }).catch(async error => {
      console.error({ width, board: await page.locator('.lum-canvas').getAttribute('data-scope-id'),
        map: await dialog.innerText(), errors, unexpected })
      throw error
    })
    const practice = dialog.getByRole('button', { name: 'Lernkarten zu E.1 üben', exact: true })
    if (!futureTopic && !switchDuringSave) {
      await dialog.getByRole('heading', { name: 'Ein Ball rollt vom Tisch. Wo landet er?', exact: true }).waitFor()
      const throwNode = dialog.locator(`[data-entry-id="${horizontalThrow.id}"]`)
      const openExercise = throwNode.getByRole('button', { name: 'Üben: Wo muss die Bodenmarke liegen?', exact: true })
      await openExercise.waitFor()
      assert.equal(await dialog.getByTestId('learning-map-practice-action').count(), 1,
        'the partial board shows only its own exercise, even when the landscape also contains another anchor')
      assert.equal(await dialog.locator(`[data-entry-id="${roadSafety.id}"]`).count(), 0)
      await openExercise.focus()
      await page.keyboard.press('Enter')
      const exercise = page.getByRole('dialog', { name: 'Wo muss die Bodenmarke liegen?', exact: true })
      await exercise.waitFor()
      assert.equal(await exercise.evaluate(element => element.contains(document.activeElement)), true)
      await exercise.getByText('Hinweis anzeigen', { exact: true }).click()
      assert(await exercise.getByText('Wie ändern sich die beiden Wege', { exact: false }).isVisible())
      const solution = exercise.getByText('Die Marke gehört also 52 cm', { exact: false })
      assert.equal(await solution.isVisible(), false)
      await exercise.getByText('Lösung vergleichen', { exact: true }).click()
      assert(await solution.isVisible())
      if (width === 390) await exercise.getByRole('button', { name: 'Übung schließen', exact: true }).click()
      else await page.keyboard.press('Escape')
      await exercise.waitFor({ state: 'hidden' })
      assert(await dialog.isVisible(), 'closing the exercise leaves the learning map open')
      assert(await openExercise.evaluate(element => document.activeElement === element), 'focus returns to the exercise button')
      if (width === 390) {
        const list = dialog.getByTestId('learning-map-compact-list')
        assert(await list.isVisible())
        const buttonBounds = await openExercise.boundingBox()
        assert(buttonBounds && buttonBounds.height >= 44 && buttonBounds.width >= 44)
        await openExercise.click()
        await exercise.waitFor()
        assert.equal(await solution.isVisible(), false, 'a new attempt opens without the solution')
        await page.keyboard.press('Escape')
        await exercise.waitFor({ state: 'hidden' })
        await dialog.getByRole('button', { name: 'Grafische Karte anzeigen' }).click()
        await list.waitFor({ state: 'hidden' })
        await dialog.getByRole('button', { name: 'Zielliste anzeigen' }).click()
        await list.waitFor()
      }
      assert.deepEqual(writes, [], 'reading and checking an exercise does not save a result')
    }
    await dialog.locator(`[data-entry-id="${examId}"]`).getByText('Prüfung aus „Themenübergreifende Prüfungen“').waitFor()
    await dialog.locator(`[data-entry-id="${memoryId}"]`).getByText('Aus dem Stapel „Einführungsphase“').waitFor()
    await practice.waitFor()
    for (const resource of [memoryId, examId]) {
      const node = dialog.locator(`[data-entry-id="${resource}"]`)
      assert.equal(await node.evaluate(element => getComputedStyle(element).opacity), '1',
        'both resource labels remain readable while another goal is selected')
    }
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
      await dialog.locator(`[data-entry-id="${energyTopicId}"] .lum-node-main`).dblclick()
      await page.locator(`.lum-canvas[data-scope-id="${energyTopicId}"][aria-busy="false"]`).waitFor()
      await dialog.getByRole('button', { name: 'Lernkarten zu E.2 üben', exact: true }).click()
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
  console.log('Hessen Physics UI passed: scoped E.1 exercise, dialog focus, keyboard/topic practice, original progress/state, complete deck, named assessment, desktop/mobile.')
} finally {
  await browser.close()
  await server.close()
  await rm(cacheDir, { recursive: true, force: true })
}
