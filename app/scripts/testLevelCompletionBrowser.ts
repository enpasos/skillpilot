import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Page } from 'playwright'
import type { LevelCompletion } from '../src/utils/levelCompletionApi'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import { startViteTestServer } from './viteTestServer'

const learner = 'fixture-learner-a'
const rootId = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsId = 'e6f2b9c1-7a3d-4e8f-9c2b-6d1e0f4a9b52'
const title = { de: 'Skalarprodukt und orthogonale Projektion', en: 'Dot product and orthogonal projection' }
const unselected = (revision: number): LevelCompletion => ({
  calculationStatus: 'notApplicable', learnerRevision: revision, title: {},
  masteredTargetCount: 0, waivedTargetCount: 0, pendingTargetCount: 0, targetCount: 0,
  masteredAssessmentCount: 0, requiredAssessmentCount: 0, waivedTargetGoalIds: [], assessments: [],
  profileOptions: [{ profileId: 'math-completion', title, targetCount: 2, requiredAssessmentCount: 1,
    assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen', en: 'Assess dot product' }, mastered: false, startAvailable: true }] }], directAssessmentRunning: false, actions: [],
})
const selected = (revision: number, running = false): LevelCompletion => ({
  calculationStatus: 'valid', contextRef: 'fixture-context', profileId: 'math-completion', profileRevision: '1',
  curriculumGeneration: 'fixture-generation', learnerRevision: revision, title, complete: false,
  masteredTargetCount: 0, waivedTargetCount: 0, pendingTargetCount: 2, targetCount: 2,
  masteredAssessmentCount: 0, requiredAssessmentCount: 1, waivedTargetGoalIds: [],
  assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen', en: 'Assess dot product' }, mastered: false, startAvailable: !running }],
  profileOptions: [], directAssessmentRunning: running,
  actions: [
    ...(running ? [{ action: 'retryAssessment' as const, goalId: 'math-exam', title: { de: 'Prüfung erneut versuchen', en: 'Try assessment again' } },
      { action: 'learnGoal' as const, goalId: 'math-support', intent: 'support' as const, title: { de: 'Orthogonale Projektion erklären', en: 'Explain orthogonal projection' } }] : []),
    { action: 'leaveProfile', title: { de: 'Zur regulären Lernansicht', en: 'Return to regular learning' } },
  ],
})
const state = (completion: LevelCompletion | null) => ({
  activeGoal: { id: 'math-upper' }, frontier: [],
  goals: { planned: [{ id: 'math-upper' }], mastered_count: 0, total_count: 4, personalized: { mastered_atomic: 0, total_atomic: 4 } },
  stateMachine: { activeGoal: { id: 'math-upper' }, goalOptions: [], requiredAction: null },
  levelCompletion: completion,
})
const profile = {
  skillpilotId: learner, selectedCurriculum: rootId, createdAt: '2026-09-01T08:00:00Z',
  personalCurriculum: JSON.stringify({
    [rootId]: { selected: true, filterId: 'DE-HE', durationModel: 'G9', stage: 'CrossStage' },
    [mathId]: { selected: true, filterId: 'GK+LK' }, [physicsId]: { selected: true, filterId: 'GK+LK' },
    __skillpilot_stage_scope_sek1__: { selected: true }, __skillpilot_stage_scope_sek2__: { selected: true },
  }),
  learningStrategy: 'SEQUENTIAL', autoPilot: false, followLearningPlans: true,
  strictMode: true, showGoalVisualizationsInChat: true, copySources: [], activeGoalId: 'math-upper',
}
const savedPlan = {
  stage: 'COMPLETE', stageId: null, stageLabel: null, groupId: null, groupLabel: null, groupInstanceId: null,
  minSelections: 0, maxSelections: 0, selectedCount: 0, options: [], displayOptions: [], navigationOptions: [],
  currentSelectedOptions: [], currentRewindId: null, completedDecisions: [], preservedDecisions: [], pendingDecisions: [],
  canReopenMigratedPersonalization: false, problemCode: null,
}

const waitForTreeReveal = (page: Page, goalId: string) => page.waitForFunction(id => (
  document.activeElement === document.querySelector(`[data-goal-id="${CSS.escape(id)}"]`)
), goalId)

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(appRoot, 'scripts/fixtures/learnerViewStartupUi.html', { plugins: [tailwindcss()] })
let browser: Browser | null = null
try {
  browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'] })
  const open = async (initial: LevelCompletion, mobile = false, completionTree = false,
    options: { shortcutPreference?: boolean; explicitCountPreference?: boolean; language?: 'de' | 'en'; handoff?: boolean; entryGoal?: string; examMastered?: boolean; noCompletion?: boolean } = {}) => {
    const context = await browser!.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, hasTouch: mobile, locale: 'de-DE' })
    await context.addInitScript(({ learner, rootId, termsVersion, language }) => {
      localStorage.setItem('skillpilot_lang', language)
      localStorage.setItem('skillpilot_theme', 'light')
      localStorage.setItem('skillpilot_id', learner)
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_learner_landscape', rootId)
      localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
    }, { learner, rootId, termsVersion: CURRENT_TERMS_VERSION, language: options.language ?? 'de' })
    const page = await context.newPage()
    const errors: string[] = []
    const writes: { path: string; body: Record<string, unknown> }[] = []
    const mutationRequests: string[] = []
    const preferenceCompletion = (enabled: boolean, revision: number): LevelCompletion | null => initial.profileId?.startsWith('automatic:')
      ? { ...initial, learnerRevision: revision, navigationIntent: undefined, directAssessmentRunning: false, actions: [],
        profileOptions: enabled ? initial.profileOptions : [],
        assessments: initial.assessments.map(assessment => ({ ...assessment, startAvailable: enabled && assessment.startAvailable,
          ...(enabled ? {} : { unavailableReason: 'assessment_shortcuts_disabled' }) })) }
      : enabled ? unselected(revision) : null
    let completion: LevelCompletion | null = options.noCompletion ? null
      : options.shortcutPreference === false ? preferenceCompletion(false, initial.learnerRevision) : initial
    let storedProfile = { ...profile,
      ...(options.shortcutPreference === undefined ? {} : { useAssessmentShortcuts: options.shortcutPreference }),
      ...(options.explicitCountPreference === undefined ? {} : { learningPlanCountOnlyExplicitGoals: options.explicitCountPreference }),
    }
    let automaticPreferenceSse = false
    let preferencesFailOnce = false
    let profileFailOnce = false
    let profileBarrierOnce: Promise<void> | null = null
    let preferencesBarrier: Promise<void> | null = null
    let stateUnavailable = false
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/api/**', async (route) => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) mutationRequests.push(path)
      const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      if (path === '/api/ui/curriculum-catalog') return json({ catalogApiVersion: '1.2', generationSha256: '0'.repeat(64), packages: [], rootLandscapeIds: [], landscapes: [], views: [], offerings: [], decks: [], resources: [], sourceEvidence: [] })
      if (path === `/api/ui/learners/${learner}`) {
        const snapshot = { ...storedProfile }
        // The signed-export-compatible backend omits the false default.
        if (snapshot.learningPlanCountOnlyExplicitGoals === false) delete snapshot.learningPlanCountOnlyExplicitGoals
        if (profileBarrierOnce) {
          const barrier = profileBarrierOnce
          profileBarrierOnce = null
          await barrier
        }
        if (profileFailOnce) {
          profileFailOnce = false
          return json({ error: 'profile-reload-failed' }, 503)
        }
        return json(snapshot)
      }
      if (path === '/api/ui/learners/fixture-learner-b') return json({ ...profile, skillpilotId: 'fixture-learner-b', useAssessmentShortcuts: false })
      if (path === '/api/ui/learners/fixture-learner-b/state') return json(state(null))
      if (path === '/api/ui/learners/fixture-learner-b/personalization-plan') return json(savedPlan)
      if (request.method() === 'PUT' && path.endsWith('/preferences')) {
        const body = request.postDataJSON() as Record<string, unknown>
        writes.push({ path, body })
        if (preferencesBarrier) await preferencesBarrier
        if (preferencesFailOnce) {
          preferencesFailOnce = false
          return json({ error: 'preferences-save-failed' }, 503)
        }
        if (body.useAssessmentShortcuts !== undefined) assert.equal(typeof body.useAssessmentShortcuts, 'boolean')
        if (body.learningPlanCountOnlyExplicitGoals !== undefined) assert.equal(typeof body.learningPlanCountOnlyExplicitGoals, 'boolean')
        const previouslyEnabled = storedProfile.useAssessmentShortcuts ?? true
        storedProfile = { ...storedProfile, ...body }
        if ((storedProfile.useAssessmentShortcuts ?? true) !== previouslyEnabled) {
          completion = preferenceCompletion(storedProfile.useAssessmentShortcuts ?? true, (completion?.learnerRevision ?? initial.learnerRevision) + 1)
        }
        if (automaticPreferenceSse) {
          await page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
        }
        return route.fulfill({ status: 200, body: '' })
      }
      if (path === `/api/ui/learners/${learner}/state`) {
        const payload = state(completion)
        if (completionTree) payload.goals = { ...payload.goals, mastered_count: 1, total_count: 5, personalized: { mastered_atomic: 1, total_atomic: 5 } }
        return stateUnavailable ? json({}, 503) : json(payload)
      }
      if (path === `/api/ui/learners/${learner}/resume` || path === '/api/ui/learners/fixture-learner-b/resume') return json({ lastActivityAt: '2026-09-09T08:00:00Z', scheduledDeletionAt: '2027-03-09T08:00:00Z' })
      if (path === '/api/ui/landscapes') return json({ summaries: [{ curriculumId: rootId, filename: 'canonical-gymnasium.json', country: 'DE', region: 'DE', type: 'GYMNASIUM', level: 'Sekundarstufe', subject: 'Gymnasium', locale: 'de-DE', title: 'Gymnasium (DE)', schoolType: 'Gymnasium', qualityMaturity: 'M6' }] })
      if (path === `/api/ui/learners/${learner}/personalization-plan`) return json(savedPlan)
      if (request.method() === 'POST' && path.endsWith('/level-completion/actions')) {
        const body = request.postDataJSON() as Record<string, unknown>
        writes.push({ path, body })
        assert.ok(completion)
        assert.equal(body.expectedRevision, completion.learnerRevision)
        completion = body.action === 'selectProfile' ? selected(completion.learnerRevision + 1) : unselected(completion.learnerRevision + 1)
        return json(state(completion))
      }
      if (request.method() === 'POST' && path.endsWith('/claude/v1/launch')) {
        const body = request.postDataJSON() as Record<string, unknown>
        writes.push({ path, body })
        const assessment = body.completionAssessment as { expectedRevision?: number } | undefined
        if (assessment && assessment.expectedRevision !== completion?.learnerRevision) return json({ error: 'stale-assessment-choice' }, 409)
        const learningSessionId = `spc_${'A'.repeat(43)}`
        return json({ prompt: `Nutze SkillPilot. Session: ${learningSessionId}`, webUrl: 'https://claude.ai/new', learningSessionId, expiresAt: '2027-01-01T00:00:00Z' })
      }
      return json({}, 404)
    })
    const params = new URLSearchParams({
      ...(completionTree ? { completionTree: '1' } : {}),
      ...(options.handoff ? { completionShortcuts: '1' } : {}),
      ...(options.entryGoal ? { entryGoal: options.entryGoal } : {}),
      ...(options.examMastered === false ? { examMastered: '0' } : {}),
    })
    await page.goto(`${server.baseUrl}/scripts/fixtures/learnerViewStartupUi.html?${params}`)
    if (options.shortcutPreference === false || options.noCompletion) await page.getByTestId('learner-current-goal').waitFor()
    else await page.getByTestId('level-completion-card').waitFor()
    return { page, context, writes, mutationRequests, errors,
      unavailable: () => { stateUnavailable = true }, available: () => { stateUnavailable = false },
      update: (next: LevelCompletion) => { completion = next },
      autoPreferenceSse: () => { automaticPreferenceSse = true },
      failPreferencesOnce: () => { preferencesFailOnce = true },
      failProfileOnce: () => { profileFailOnce = true },
      remoteShortcuts: (enabled: boolean) => {
        storedProfile = { ...storedProfile, useAssessmentShortcuts: enabled }
        completion = preferenceCompletion(enabled, (completion?.learnerRevision ?? initial.learnerRevision) + 1)
      },
      remoteExplicitCount: (enabled: boolean) => { storedProfile = { ...storedProfile, learningPlanCountOnlyExplicitGoals: enabled } },
      holdProfileOnce: () => {
        let release!: () => void
        profileBarrierOnce = new Promise<void>((resolve) => { release = resolve })
        return release
      },
      holdPreferenceSave: () => {
        let release!: () => void
        preferencesBarrier = new Promise<void>((resolve) => { release = resolve })
        return () => { preferencesBarrier = null; release() }
      },
    }
  }

  {
    const h = await open(unselected(1))
    assert.equal(h.writes.length, 0, 'a profile is never selected automatically')
    await h.page.getByTestId('completion-shortcut-discovery').locator('summary').click()
    await h.page.getByTestId('level-completion-card').getByRole('button', { name: `Abschnitt als Lernweg wählen: ${title.de}`, exact: true }).click()
    await h.page.getByTestId('level-completion-card').getByText('0 von 2 Lernzielen geschafft.', { exact: true }).waitFor()
    assert.equal(await h.page.getByText('Dein regulärer Lernplan ist pausiert', { exact: false }).count(), 0,
      'a saved following preference alone does not establish an existing paused plan')
    assert.deepEqual(h.writes[0].body, { action: 'selectProfile', profileId: 'math-completion', expectedRevision: 1 })
    await h.page.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).click()
    const providers = h.page.getByTestId('coach-provider-choice')
    await providers.waitFor()
    assert.equal(h.writes.filter((write) => write.path.endsWith('/launch')).length, 0, 'provider selection never creates an early assessment binding')
    assert.equal(await providers.getByRole('radio', { name: /ChatGPT Desktop/u }).isDisabled(), true)
    assert.equal(await providers.getByRole('radio', { name: /Gemini/u }).isDisabled(), true)
    assert.equal(await providers.getByRole('radio', { name: /Claude/u }).isChecked(), true)
    await h.page.evaluate(() => {
      window.open = (() => ({ opener: null, location: { href: '' }, close() {} })) as unknown as typeof window.open
      const button = document.querySelector<HTMLButtonElement>('[data-testid="claude-plugin-start"]')
      button?.click()
      button?.click()
    })
    await h.page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/claude/v1/launch'))
    const launches = h.writes.filter((write) => write.path.endsWith('/launch'))
    assert.equal(launches.length, 1, 'synchronous double click creates only one provider session')
    assert.deepEqual(launches[0].body.completionAssessment, { profileId: 'math-completion', goalId: 'math-exam', expectedRevision: 2 })
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  {
    const h = await open(unselected(100), false, true, { examMastered: false })
    const disclosure = h.page.getByTestId('completion-shortcut-discovery')
    assert.equal(await disclosure.evaluate(element => (element as HTMLDetailsElement).open), false,
      'discovery starts compact and does not interrupt ordinary learning')
    await disclosure.locator('summary').click()
    await disclosure.getByText('Skalarprodukt prüfen', { exact: true }).waitFor()
    assert.equal(h.writes.length, 0, 'browsing concrete assessments does not select a profile')
    await disclosure.getByRole('button', { name: 'Im Lernzielbaum anzeigen: Skalarprodukt prüfen', exact: true }).click()
    await waitForTreeReveal(h.page, 'math-exam')
    const contextual = h.page.getByTestId('selected-goal-assessment-shortcuts')
    await contextual.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).waitFor()
    assert.equal(h.writes.length, 0, 'the exact assessment goal can be inspected without activating normal or shortcut work')
    await contextual.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).click()
    const providers = h.page.getByTestId('coach-provider-choice')
    await providers.waitFor()
    assert.equal(await providers.getByRole('radio', { name: /Claude/u }).isChecked(), true)
    assert.equal(await providers.getByRole('radio', { name: /ChatGPT Desktop/u }).isDisabled(), true)
    assert.equal(await providers.getByRole('radio', { name: /Gemini/u }).isDisabled(), true)
    assert.equal(h.writes.length, 0, 'provider selection alone still does not activate a profile or assessment')
    await h.page.evaluate(() => { window.open = (() => ({ opener: null, location: { href: '' }, close() {} })) as unknown as typeof window.open })
    await Promise.all([
      h.page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/claude/v1/launch')),
      h.page.getByTestId('claude-plugin-start').click(),
    ])
    assert.equal(h.writes.length, 1)
    assert.match(h.writes[0].path, /\/claude\/v1\/launch$/u)
    assert.deepEqual(h.writes[0].body.completionAssessment, { profileId: 'math-completion', goalId: 'math-exam', expectedRevision: 100 },
      'the explicit launch carries the unselected-profile assessment choice atomically')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(unselected(110), true, true, { handoff: true, entryGoal: 'math-exam', examMastered: false, language: 'en' })
    const disclosure = h.page.getByTestId('completion-shortcut-discovery')
    const summary = disclosure.locator('summary')
    await h.page.waitForFunction(() => document.activeElement?.matches('[data-completion-shortcuts-heading]'))
    assert.equal(await disclosure.evaluate(element => (element as HTMLDetailsElement).open), true)
    await disclosure.getByText('Assess dot product', { exact: true }).waitFor()
    await h.page.getByTestId('selected-goal-assessment-shortcuts').getByRole('link', { name: 'Try assessment directly', exact: true }).waitFor()
    assert.equal(h.writes.length, 0, 'a provider-neutral handoff only opens and focuses discovery')
    await summary.click()
    const ordinaryStart = h.page.getByTestId('learner-coach-start-link')
    await ordinaryStart.focus()
    h.update(unselected(111))
    const refreshed = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Preferences refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
    await refreshed
    assert.equal(await disclosure.evaluate(element => (element as HTMLDetailsElement).open), false, 'refresh does not reopen a manually closed handoff disclosure')
    assert.equal(await ordinaryStart.evaluate(element => element === document.activeElement), true, 'the read-only handoff focuses once per navigation')
    assert.equal(h.writes.length, 0)
    assert.equal(await h.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(unselected(115), false, true, { handoff: true, entryGoal: 'math-upper', examMastered: false })
    const disclosure = h.page.getByTestId('completion-shortcut-discovery')
    await disclosure.getByText('Die angefragte Prüfung ist hier aktuell nicht als Abkürzung verfügbar.', { exact: false }).waitFor()
    await disclosure.getByText('Skalarprodukt prüfen', { exact: true }).waitFor()
    assert.equal(await h.page.getByTestId('selected-goal-assessment-shortcuts').count(), 0,
      'other offered assessments are not presented as a shortcut for the requested unrelated goal')
    await disclosure.getByRole('button', { name: 'Lerneinstellungen öffnen', exact: true }).click()
    await h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true }).waitFor()
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const preview = unselected(116)
    preview.profileOptions[0].assessments![0] = { ...preview.profileOptions[0].assessments![0], mastered: true, startAvailable: false }
    const h = await open(preview, false, true, { handoff: true, entryGoal: 'math-exam' })
    const contextual = h.page.getByTestId('selected-goal-assessment-shortcuts')
    await contextual.getByText('Geschafft', { exact: true }).waitFor()
    assert.equal(await h.page.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).count(), 0,
      'an already mastered assessment is shown as achieved without a fresh shortcut attempt')
    assert.equal(await h.page.getByText('Die angefragte Prüfung ist hier aktuell nicht als Abkürzung verfügbar.', { exact: false }).count(), 0)
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  for (const disabled of [true, false]) {
    const h = await open(unselected(120), false, true, { handoff: true, entryGoal: 'math-exam',
      shortcutPreference: disabled ? false : undefined, noCompletion: !disabled, language: disabled ? 'de' : 'en' })
    const notice = h.page.getByTestId('completion-shortcuts-unavailable')
    await notice.getByText(disabled ? 'Du hast Prüfungsabkürzungen ausgeschaltet.' : 'No suitable assessment shortcuts are currently available', { exact: false }).waitFor()
    assert.equal(await h.page.getByRole('link', { name: /Prüfung direkt versuchen|Try assessment directly/u }).count(), 0)
    await notice.getByRole('button', { name: disabled ? 'Lerneinstellungen öffnen' : 'Open learning settings', exact: true }).click()
    const settings = h.page.getByRole('dialog', { name: disabled ? 'Mein Lehrplan' : 'My Curriculum', exact: true })
    const choice = settings.getByRole('checkbox', { name: disabled ? 'Prüfungsabkürzungen anbieten' : 'Offer assessment shortcuts', exact: true })
    assert.equal(await choice.isChecked(), !disabled, 'handoff does not override the learner preference')
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(unselected(130), false, true, { entryGoal: 'math-exam', examMastered: false })
    await h.page.getByTestId('completion-shortcut-discovery').locator('summary').click()
    h.unavailable()
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_CHANGED' } })), learner)
    await h.page.getByText('Diese Ansicht ist veraltet.', { exact: false }).waitFor()
    assert.equal(await h.page.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).count(), 0,
      'a stale state disables discovery and contextual direct entry together')
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(unselected(140))
    const discovery = h.page.getByTestId('completion-shortcut-discovery')
    await discovery.locator('summary').click()
    await discovery.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).click()
    await h.page.getByTestId('coach-provider-choice').waitFor()
    assert.equal(h.writes.length, 0)
    h.update(unselected(141))
    await h.page.evaluate(() => { window.open = (() => ({ opener: null, location: { href: '' }, close() {} })) as unknown as typeof window.open })
    await h.page.getByTestId('claude-plugin-start').click()
    await h.page.getByTestId('completion-assessment-launch-notice').getByText('Diese Prüfungsauswahl konnte nicht bestätigt werden.', { exact: false }).waitFor()
    assert.equal(h.writes.length, 1, 'a revision conflict does not fall back to profile selection or another launch')
    assert.deepEqual(h.writes[0].body.completionAssessment, { profileId: 'math-completion', goalId: 'math-exam', expectedRevision: 140 })
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(40))
    const tree = h.page.locator('#learner-goal-sidebar')
    const upperBranch = tree.locator('[data-goal-id="math-sek-ii"] > button[aria-expanded]')
    const rootBranch = tree.locator('[data-goal-id="math-root"] > button[aria-expanded]')
    await upperBranch.waitFor()
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'true', 'entry reveals the active path')
    await upperBranch.click()
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'false', 'an automatically revealed branch can be closed')
    assert.equal(await tree.locator('[data-goal-id="math-upper"]').count(), 0)

    h.update({ ...selected(41), title: { de: 'Aktualisierter Lernabschnitt', en: 'Updated section' } })
    await h.page.evaluate((learnerId) => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_CHANGED' } })), learner)
    await h.page.getByTestId('level-completion-card').getByText('Aktualisierter Lernabschnitt', { exact: true }).waitFor()
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'false', 'refreshing unchanged navigation respects the manual collapse')

    await upperBranch.focus()
    await upperBranch.press('Enter')
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'true', 'keyboard can reopen a branch')
    await upperBranch.press('Space')
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'false', 'keyboard can close it again')
    await rootBranch.click()
    assert.equal(await rootBranch.getAttribute('aria-expanded'), 'false', 'the active root can also be closed')
    await rootBranch.click()
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'false', 'reopening a parent preserves the child collapse')

    const lowerBranch = tree.locator('[data-goal-id="math-sek-i"] > button[aria-expanded]')
    if (await lowerBranch.getAttribute('aria-expanded') === 'false') await lowerBranch.click()
    await tree.locator('[data-goal-id="math-lower"]').click()
    assert.equal(await lowerBranch.getAttribute('aria-expanded'), 'true', 'navigation reveals its selected branch')
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'false', 'navigation leaves an unrelated branch closed')

    await tree.getByTitle('Gehe zum aktiven Ziel', { exact: true }).click()
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'true', 'an explicit reveal reopens the active path')
    await upperBranch.click()
    assert.equal(await upperBranch.getAttribute('aria-expanded'), 'false', 'explicit reveal does not lock the path open')
    assert.equal(h.writes.length, 0, 'tree expansion never writes learner results or focus')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  {
    const h = await open(selected(3, true), true)
    const card = h.page.getByTestId('level-completion-card')
    await card.getByRole('button', { name: 'Zur regulären Lernansicht', exact: true }).click()
    const confirmation = card.getByRole('group', { name: 'Laufende Prüfung beenden' })
    await confirmation.waitFor()
    assert.equal(h.writes.length, 0, 'asking for confirmation does not end the assessment')
    await confirmation.getByRole('button', { name: 'Prüfung fortsetzen' }).click()
    assert.equal(h.writes.length, 0, 'cancelling preserves the active assessment')
    await card.getByRole('button', { name: 'Zur regulären Lernansicht', exact: true }).click()
    await card.getByRole('button', { name: 'Prüfung beenden und wechseln' }).click()
    await card.getByTestId('completion-shortcut-discovery').waitFor()
    assert.deepEqual(h.writes[0].body, { action: 'leaveProfile', expectedRevision: 3 })
    assert.equal(await h.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  {
    const h = await open(selected(7, true))
    const card = h.page.getByTestId('level-completion-card')
    const support = card.getByRole('button', { name: 'Orthogonale Projektion erklären', exact: true })
    await support.focus()
    await support.press('Enter')
    await card.getByRole('group', { name: 'Laufende Prüfung beenden' }).waitFor()
    h.update(selected(8, true))
    await h.page.evaluate((learnerId) => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_CHANGED' } })), learner)
    await card.getByText('Der Lernstand hat sich geändert.', { exact: false }).waitFor()
    assert.equal(await card.getByRole('button', { name: 'Prüfung beenden und wechseln' }).count(), 0, 'SSE cannot silently rebind an old confirmation to a new revision')
    assert.equal(await support.evaluate((element) => element === document.activeElement), true, 'focus returns to the preserved choice after stale confirmation')
    assert.equal(h.writes.length, 0)
    await support.press('Enter')
    await card.getByRole('button', { name: 'Prüfung beenden und wechseln' }).click()
    await card.getByTestId('completion-shortcut-discovery').waitFor()
    assert.deepEqual(h.writes[0].body, { action: 'learnGoal', goalId: 'math-support', intent: 'support', expectedRevision: 8 })
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  {
    const h = await open(selected(10, true))
    const card = h.page.getByTestId('level-completion-card')
    await card.getByRole('button', { name: 'Prüfung erneut versuchen', exact: true }).click()
    const retry = card.getByRole('link', { name: 'Prüfung erneut versuchen', exact: true })
    assert.match(await retry.getAttribute('href') ?? '', /completionRetry=1/u)
    await retry.click()
    await h.page.getByTestId('coach-provider-choice').waitFor()
    assert.equal(h.writes.length, 0, 'confirming retry still waits for actual provider launch')
    await h.page.evaluate(() => { window.open = (() => ({ opener: null, location: { href: '' }, close() {} })) as unknown as typeof window.open })
    await Promise.all([
      h.page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/claude/v1/launch')),
      h.page.getByTestId('claude-plugin-start').click(),
    ])
    assert.deepEqual(h.writes[0].body.completionAssessment, { profileId: 'math-completion', goalId: 'math-exam', expectedRevision: 10, restartCurrent: true })
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  {
    const h = await open(selected(5), true)
    h.unavailable()
    await h.page.evaluate((learnerId) => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_CHANGED' } })), learner)
    const card = h.page.getByTestId('level-completion-card')
    await card.getByText('Diese Ansicht ist veraltet.', { exact: false }).waitFor()
    assert.equal(await card.getByRole('link', { name: 'Prüfung direkt versuchen' }).count(), 0)
    assert.equal(await card.getByRole('button', { name: 'Zur regulären Lernansicht' }).isDisabled(), true)
    assert.equal(h.writes.length, 0)
    const screenshotDir = fileURLToPath(new URL('../../tmp/level-completion-browser/', import.meta.url))
    await mkdir(screenshotDir, { recursive: true })
    await h.page.screenshot({ path: `${screenshotDir}mobile-stale.png` })
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  for (const mobile of [false, true]) {
    const scopeTitle = 'Mathematischer Testabschnitt'
    const completed: LevelCompletion = {
      ...selected(200), profileId: 'automatic:math-all', title: { de: scopeTitle }, navigationIntent: 'required',
      complete: true, targetCount: 3, masteredTargetCount: 1, waivedTargetCount: 2, pendingTargetCount: 0,
      masteredAssessmentCount: 1, waivedTargetGoalIds: ['math-upper', 'math-lower'],
      assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' }, mastered: true, startAvailable: false }],
      waiverDetails: ['math-upper', 'math-lower'].map(goalId => ({
        goalId, title: { de: goalId === 'math-upper' ? 'Ableitungen für Wachstumsmodelle deuten' : 'Lineare Gleichungen lösen' },
        ruleId: 'no_remaining_demand', assessments: [], assessmentCount: 0,
      })),
    }
    const h = await open(completed, mobile, true)
    if (mobile) {
      await h.page.getByTestId('learner-mobile-menu-button').focus()
      await h.page.getByTestId('learner-mobile-menu-button').press('Enter')
    }
    const tree = h.page.locator('#learner-goal-sidebar')
    const rootRow = tree.locator('[data-goal-id="math-root"]')
    const progress = rootRow.getByTestId('completion-tree-progress')
    const explicit = progress.getByTestId('completion-tree-progress-explicit')
    const implicit = progress.getByTestId('completion-tree-progress-implicit')
    const tooltip = h.page.getByRole('tooltip')
    await progress.waitFor({ state: 'visible' })
    await h.page.waitForFunction(() => document.querySelector(
      '[data-goal-id="math-root"] [data-testid="completion-tree-progress"]',
    )?.getAttribute('aria-label')?.includes('2 implizit erledigt'))
    assert.equal(await progress.evaluate(element => element.tagName), 'BUTTON')
    assert.match(await progress.getAttribute('aria-label') ?? '', /3 von 3 Lernzielen erledigt/u)
    assert.match(await progress.getAttribute('aria-label') ?? '', /100\s*%/u)
    assert.match(await progress.getAttribute('aria-label') ?? '', /1 explizit geschafft/u)
    assert.match(await progress.getAttribute('aria-label') ?? '', /2 implizit erledigt/u)
    const rowHeight = (await rootRow.boundingBox())!.height
    const totalWidth = (await explicit.boundingBox())!.width + (await implicit.boundingBox())!.width
    assert.ok(Math.abs((await explicit.boundingBox())!.width / totalWidth - 1 / 3) < 0.03)
    assert.ok(Math.abs((await implicit.boundingBox())!.width / totalWidth - 2 / 3) < 0.03)
    const explicitColor = await explicit.evaluate(element => getComputedStyle(element).backgroundColor)
    const implicitColor = await implicit.evaluate(element => getComputedStyle(element).backgroundColor)
    assert.notEqual(explicitColor, implicitColor, 'explicit and implicit completion use distinct visible segments')
    assert.equal(await h.page.locator('[data-fixture-selected-goal]').getAttribute('data-fixture-selected-goal'), 'math-upper')
    assert.equal(await tooltip.count(), 0)
    const initialMutationRequests = [...h.mutationRequests]

    if (mobile) await progress.tap()
    else await progress.hover()
    await tooltip.getByText('3 von 3 Lernzielen erledigt', { exact: true }).waitFor()
    await tooltip.getByText('1 explizit geschafft', { exact: true }).waitFor()
    await tooltip.getByText('2 implizit erledigt', { exact: true }).waitFor()
    await tooltip.getByText('0 offen', { exact: true }).waitFor()
    await tooltip.getByText(scopeTitle, { exact: false }).waitFor()
    assert.equal(await progress.getAttribute('aria-describedby'), await tooltip.getAttribute('id'))
    assert.equal((await rootRow.boundingBox())!.height, rowHeight, 'progress details do not enlarge a tree row')
    const tooltipBox = (await tooltip.boundingBox())!
    const viewport = h.page.viewportSize()!
    assert.ok(tooltipBox.x >= 0 && tooltipBox.y >= 0
      && tooltipBox.x + tooltipBox.width <= viewport.width
      && tooltipBox.y + tooltipBox.height <= viewport.height, 'progress tooltip stays within a narrow viewport')
    assert.equal(await h.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    const screenshotDir = fileURLToPath(new URL('../../tmp/level-completion-browser/', import.meta.url))
    await mkdir(screenshotDir, { recursive: true })
    await h.page.screenshot({ path: `${screenshotDir}${mobile ? 'mobile' : 'desktop'}-tree-progress-tooltip.png` })
    await progress.press('Escape')
    await tooltip.waitFor({ state: 'detached' })
    await h.page.mouse.move(0, 0)
    await progress.blur()
    await progress.focus()
    await tooltip.waitFor({ state: 'visible' })
    await progress.press('Escape')
    await tooltip.waitFor({ state: 'detached' })
    assert.equal(await progress.evaluate(element => document.activeElement === element), true,
      'Escape closes the progress tooltip while retaining keyboard focus')
    if (mobile) await progress.tap()
    else await progress.click()
    await tooltip.waitFor({ state: 'visible' })
    await tree.getByText('Meine Lernziele', { exact: true }).click()
    await tooltip.waitFor({ state: 'detached' })
    assert.equal(await h.page.locator('[data-fixture-selected-goal]').getAttribute('data-fixture-selected-goal'), 'math-upper',
      'hover, focus, click and touch on progress never select the cluster')
    await tree.screenshot({ path: `${screenshotDir}${mobile ? 'mobile' : 'desktop'}-tree-progress-segments.png` })

    const beforeCollapse = await progress.getAttribute('aria-label')
    const rootToggle = rootRow.locator('button[aria-expanded]')
    await rootToggle.click()
    assert.equal(await rootToggle.getAttribute('aria-expanded'), 'false')
    assert.equal(await tree.locator('[data-goal-id="math-upper"]').count(), 0)
    assert.match(await progress.getAttribute('aria-label') ?? '', /100\s*%/u)
    assert.equal(await progress.getAttribute('aria-label'), beforeCollapse, 'collapsed descendants retain their unique completion counts')
    await rootToggle.click()
    assert.equal(await progress.getAttribute('aria-label'), beforeCollapse)

    // Authoritative mastery can arrive before the refreshed overlay. Explicit
    // mastery wins during that overlap, and the leaf must still be counted once.
    await h.page.evaluate(() => window.dispatchEvent(new CustomEvent('learner-startup-fixture-mastery', {
      detail: { goalId: 'math-upper', value: 1 },
    })))
    await h.page.waitForFunction(() => /2 explizit geschafft/.test(document.querySelector(
      '[data-goal-id="math-root"] [data-testid="completion-tree-progress"]',
    )?.getAttribute('aria-label') ?? ''))
    assert.match(await progress.getAttribute('aria-label') ?? '', /3 von 3 Lernzielen erledigt/u,
      'a mastered previously implicit goal is never counted twice')
    assert.match(await progress.getAttribute('aria-label') ?? '', /1 implizit erledigt/u)
    assert.ok(Math.abs((await explicit.boundingBox())!.width / totalWidth - 2 / 3) < 0.03)
    assert.ok(Math.abs((await implicit.boundingBox())!.width / totalWidth - 1 / 3) < 0.03)
    assert.equal(await explicit.evaluate(element => getComputedStyle(element).backgroundColor), explicitColor)
    assert.equal(await implicit.evaluate(element => getComputedStyle(element).backgroundColor), implicitColor)
    assert.equal(await tree.locator('[data-goal-id="math-upper"] svg.lucide-check').count(), 1)

    h.update({ ...completed, learnerRevision: 201, masteredTargetCount: 2, waivedTargetCount: 1,
      waivedTargetGoalIds: ['math-lower'], waiverDetails: completed.waiverDetails!.filter(detail => detail.goalId === 'math-lower') })
    const refreshed = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', {
      detail: { learnerId, type: 'ACTIVE_GOAL_UPDATE' },
    })), learner)
    await refreshed
    assert.match(await progress.getAttribute('aria-label') ?? '', /100\s*%/u)
    assert.match(await progress.getAttribute('aria-label') ?? '', /2 explizit geschafft/u)

    // Invalid completion evidence removes implicit credit even while the
    // ordinary learner state and its explicitly mastered goals remain usable.
    h.update({ ...completed, learnerRevision: 202, calculationStatus: 'invalid', complete: undefined })
    const invalidRefreshed = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', {
      detail: { learnerId, type: 'ACTIVE_GOAL_UPDATE' },
    })), learner)
    await invalidRefreshed
    await h.page.waitForFunction(() => document.querySelector(
      '[data-goal-id="math-root"] [data-testid="completion-tree-progress-implicit"]',
    )?.getBoundingClientRect().width === 0)
    assert.ok(Math.abs((await explicit.boundingBox())!.width / totalWidth - 2 / 3) < 0.03,
      'invalid completion removes blue credit while preserving both real mastery results')
    assert.match(await progress.getAttribute('aria-label') ?? '', /2 explizit geschafft/u)
    assert.match(await progress.getAttribute('aria-label') ?? '', /1 offen/u)

    const recovered: LevelCompletion = { ...completed, learnerRevision: 203, masteredTargetCount: 2, waivedTargetCount: 1,
      waivedTargetGoalIds: ['math-lower'], waiverDetails: completed.waiverDetails!.filter(detail => detail.goalId === 'math-lower') }
    h.update(recovered)
    const validRefreshed = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', {
      detail: { learnerId, type: 'ACTIVE_GOAL_UPDATE' },
    })), learner)
    await validRefreshed
    await h.page.waitForFunction(() => document.querySelector(
      '[data-goal-id="math-root"] [data-testid="completion-tree-progress"]',
    )?.getAttribute('aria-label')?.includes('1 implizit erledigt'))

    h.unavailable()
    const staleResponse = h.page.waitForResponse(response => new URL(response.url()).pathname === `/api/ui/learners/${learner}/state`
      && response.status() === 503)
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', {
      detail: { learnerId, type: 'ACTIVE_GOAL_UPDATE' },
    })), learner)
    await staleResponse
    await h.page.getByTestId('level-completion-card').getByText('Diese Ansicht ist veraltet.', { exact: false }).waitFor()
    assert.equal(await h.page.evaluate(() => [...document.querySelectorAll(
      '[data-testid="completion-tree-progress-implicit"]',
    )].some(element => element.getBoundingClientRect().width > 0)), false,
    'a failed state reload cannot leave visible implicit credit, including when the scope gate replaces the tree')
    h.available()
    h.update({ ...recovered, learnerRevision: 204 })
    const transportRestored = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', {
      detail: { learnerId, type: 'ACTIVE_GOAL_UPDATE' },
    })), learner)
    await transportRestored
    await progress.waitFor({ state: 'visible' })
    assert.match(await progress.getAttribute('aria-label') ?? '', /2 explizit geschafft/u)
    assert.match(await progress.getAttribute('aria-label') ?? '', /1 implizit erledigt/u)
    assert.equal(await tree.locator('[data-goal-id="math-upper"] svg.lucide-check').count(), 1,
      'recovering authoritative state retains the actually achieved goal')
    assert.equal(await tree.locator('[data-goal-id="math-exam"] svg.lucide-check').count(), 1,
      'recovering authoritative state retains the original passed assessment')
    assert.equal(await h.page.locator('[data-fixture-selected-goal]').getAttribute('data-fixture-selected-goal'), 'math-upper')
    assert.deepEqual(h.mutationRequests, initialMutationRequests,
      'progress inspection and refreshed display never add a backend mutation after ordinary learner startup')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  for (const mobile of [false, true]) {
    const completed: LevelCompletion = {
      ...selected(10), complete: true, masteredTargetCount: 1, waivedTargetCount: 1, pendingTargetCount: 0,
      masteredAssessmentCount: 1, waivedTargetGoalIds: ['math-upper'],
      assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' }, mastered: true, startAvailable: false }],
      waiverDetails: [{ goalId: 'math-upper', title: { de: 'Ableitungen für Wachstumsmodelle deuten' }, ruleId: 'rule',
        assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' } }], assessmentCount: 1 }],
    }
    const h = await open(completed, mobile, true)
    const card = h.page.getByTestId('level-completion-card')
    await card.getByText('1 von 2 Lernzielen geschafft.', { exact: true }).waitFor()
    await card.getByText('Warum entfällt diese Vorbereitung?', { exact: true }).click()
    await card.locator('details').getByRole('button', { name: 'Im Lernzielbaum anzeigen' }).click()
    await waitForTreeReveal(h.page, 'math-upper')
    const row = h.page.locator('[data-goal-id="math-upper"]')
    const waiver = row.getByTestId('completion-tree-waiver')
    await waiver.waitFor({ state: 'visible' })
    assert.equal(await row.locator('svg.lucide-check').count(), 0, 'waived preparation does not acquire a mastery check')
    assert.equal(await waiver.locator('svg.lucide-shield-check').count(), 1, 'coverage uses its own compact status icon')
    assert.equal(await row.locator('svg.lucide-target').count(), 0, 'the coverage icon replaces the open target icon')
    assert.equal(await h.page.locator('[data-goal-id="math-exam"] svg.lucide-check').count(), 1, 'only the actually mastered exam has a check')
    assert.equal(await waiver.getAttribute('aria-label'), 'Für diesen Abschnitt durch Prüfung abgedeckt')
    assert.equal(await row.locator('details, summary').count(), 0, 'the tree keeps a compact row without an inline explanation block')
    assert.doesNotMatch(await row.innerText(), /Für diesen Abschnitt durch Prüfung abgedeckt|separate Vorbereitung/u)
    const screenshotDir = fileURLToPath(new URL('../../tmp/level-completion-browser/', import.meta.url))
    await mkdir(screenshotDir, { recursive: true })
    await h.page.locator('#learner-goal-sidebar').screenshot({ path: `${screenshotDir}${mobile ? 'mobile' : 'desktop'}-tree-compact.png` })
    await row.screenshot({ path: `${screenshotDir}${mobile ? 'mobile' : 'desktop'}-waiver-row.png` })
    const rowHeight = (await row.boundingBox())!.height
    const tooltip = h.page.getByRole('tooltip')
    assert.equal(await tooltip.count(), 0)
    if (mobile) await waiver.tap()
    else await waiver.hover()
    await tooltip.waitFor({ state: 'visible' })
    await tooltip.getByText(title.de, { exact: false }).waitFor()
    await tooltip.getByText('Skalarprodukt prüfen', { exact: false }).waitFor()
    await tooltip.getByText(/Lernstand.*unverändert/u).waitFor()
    if (mobile) await tooltip.getByText('Skalarprodukt prüfen', { exact: false }).tap()
    else {
      await waiver.focus()
      await tooltip.getByText('Skalarprodukt prüfen', { exact: false }).click()
    }
    // Touch compatibility mouse events and the 150 ms leave timer must not
    // dismiss explanatory content while the learner interacts inside it.
    await h.page.waitForTimeout(200)
    assert.equal(await tooltip.isVisible(), true, 'interacting inside the tooltip keeps it available')
    assert.equal(await waiver.getAttribute('aria-describedby'), await tooltip.getAttribute('id'))
    assert.equal(await tooltip.getByRole('button').count(), 0, 'the explanatory tooltip is noninteractive')
    assert.equal((await row.boundingBox())!.height, rowHeight, 'opening the tooltip does not expand the tree row')
    const tooltipBox = (await tooltip.boundingBox())!
    const viewport = h.page.viewportSize()!
    assert.ok(tooltipBox.x >= 0 && tooltipBox.y >= 0
      && tooltipBox.x + tooltipBox.width <= viewport.width
      && tooltipBox.y + tooltipBox.height <= viewport.height, 'tooltip remains within the visible viewport')
    assert.equal(await h.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true)
    assert.equal(h.writes.length, 0, 'showing goals and waiver explanations must not write learner state')
    await h.page.screenshot({ path: `${screenshotDir}${mobile ? 'mobile' : 'desktop'}-tree-waiver.png` })
    await waiver.press('Escape')
    await tooltip.waitFor({ state: 'detached' })
    if (!mobile) {
      await h.page.mouse.move(0, 0)
      await waiver.blur()
      await waiver.focus()
      await tooltip.waitFor({ state: 'visible' })
      await waiver.press('Escape')
      await tooltip.waitFor({ state: 'detached' })
      assert.equal(await waiver.evaluate((element) => element === document.activeElement), true, 'keyboard dismissal preserves icon focus')
    }
    if (mobile) await waiver.tap()
    else await waiver.hover()
    await tooltip.waitFor({ state: 'visible' })
    await h.page.locator('#learner-goal-sidebar').getByText('Meine Lernziele', { exact: true }).click()
    await tooltip.waitFor({ state: 'detached' })
    if (mobile) await h.page.getByRole('button', { name: 'Lernzielmenü schließen', exact: true }).click()
    await card.getByRole('button', { name: 'Im Lernzielbaum anzeigen: Skalarprodukt prüfen', exact: true }).click()
    await waitForTreeReveal(h.page, 'math-exam')
    await h.page.waitForFunction(() => document.querySelector('[data-goal-id="math-exam"]')?.classList.contains('bg-sky-100'))
    await h.page.locator('[data-goal-id="math-sek-ii"]').getByRole('button', { name: /einklappen$/ }).click()
    await waiver.waitFor({ state: 'detached' })
    if (mobile) await h.page.getByRole('button', { name: 'Lernzielmenü schließen', exact: true }).click()
    await card.locator('details').getByRole('button', { name: 'Im Lernzielbaum anzeigen' }).click()
    await waitForTreeReveal(h.page, 'math-upper')
    await waiver.waitFor({ state: 'visible' })
    await h.page.waitForFunction(() => document.querySelector('[data-goal-id="math-upper"]')?.classList.contains('bg-sky-100'))
    let revision = completed.learnerRevision
    const update = async (next: LevelCompletion) => {
      h.update({ ...next, learnerRevision: ++revision })
      const refreshed = h.page.waitForEvent('console', { predicate: (message) => message.text().includes('[SSE] ✅ Refresh complete') })
      // Use the real active-goal event so successive updates bypass the generic 800ms refresh throttle.
      await h.page.evaluate((learnerId) => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_UPDATE' } })), learner)
      await refreshed
    }
    for (const next of [
      { ...completed, learnerRevision: 11, waivedTargetGoalIds: [], waiverDetails: [], waivedTargetCount: 0, pendingTargetCount: 1, complete: false },
      { ...completed, learnerRevision: 12, calculationStatus: 'invalid' as const, complete: undefined },
      unselected(13),
    ]) {
      if (mobile) await waiver.tap()
      else await waiver.focus()
      await tooltip.waitFor({ state: 'visible' })
      await update(next)
      await waiver.waitFor({ state: 'detached' })
      await tooltip.waitFor({ state: 'detached' })
      await update(completed)
      await waiver.waitFor({ state: 'visible' })
    }
    if (mobile) await waiver.tap()
    else await waiver.focus()
    await tooltip.waitFor({ state: 'visible' })
    h.unavailable()
    await update(completed)
    await waiver.waitFor({ state: 'detached' })
    await tooltip.waitFor({ state: 'detached' })
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const assessments = ['math-exam', 'math-exam-two', 'math-exam-three'].map((goalId, index) => ({
      goalId,
      title: { de: `Prüfung ${index + 1}: ${'Vektorprojektionen geometrisch erläutern und begründet anwenden. '.repeat(3)}`.slice(0, 130) },
      mastered: true, startAvailable: false,
    }))
    const completed: LevelCompletion = {
      ...selected(20), complete: true, targetCount: 4, masteredTargetCount: 3, waivedTargetCount: 1, pendingTargetCount: 0,
      requiredAssessmentCount: 3, masteredAssessmentCount: 3, waivedTargetGoalIds: ['math-upper'], assessments,
      waiverDetails: [{ goalId: 'math-upper', title: { de: 'Ableitungen für Wachstumsmodelle deuten' }, ruleId: 'three-assessments',
        assessments: assessments.map(({ goalId, title: assessmentTitle }) => ({ goalId, title: assessmentTitle })), assessmentCount: 3 }],
    }
    const h = await open(completed, false, true)
    await h.page.setViewportSize({ width: 640, height: 360 })
    const card = h.page.getByTestId('level-completion-card')
    await card.getByText('Warum entfällt diese Vorbereitung?', { exact: true }).click()
    await card.locator('details').getByRole('button', { name: 'Im Lernzielbaum anzeigen' }).click()
    // Reveal finishes by focusing the row in a rendering frame. Enter the icon
    // only after that navigation, otherwise the pending row focus steals it.
    await waitForTreeReveal(h.page, 'math-upper')
    const waiver = h.page.locator('[data-goal-id="math-upper"]').getByTestId('completion-tree-waiver')
    await h.page.keyboard.press('Tab')
    assert.equal(await waiver.evaluate(element => element === document.activeElement), true,
      'keyboard navigation enters the waiver icon after revealing its goal row')
    const tooltip = h.page.getByRole('tooltip')
    await tooltip.waitFor({ state: 'visible' })
    assert.equal(await tooltip.evaluate((element) => element.scrollHeight > element.clientHeight), true,
      'long valid assessment titles exercise an overflowing tooltip in a short viewport')
    await tooltip.getByText('Für diesen Abschnitt durch Prüfung abgedeckt', { exact: true }).click()
    await h.page.waitForTimeout(200)
    assert.equal(await tooltip.isVisible(), true, 'clicking tooltip text after trigger focus does not dismiss it')
    await waiver.focus()
    await waiver.press('ArrowDown')
    const afterArrow = await tooltip.evaluate((element) => element.scrollTop)
    assert.ok(afterArrow > 0, 'ArrowDown scrolls explanatory content while focus stays on the icon')
    await waiver.press('PageDown')
    assert.ok(await tooltip.evaluate((element) => element.scrollTop) > afterArrow, 'PageDown reveals more of the tooltip')
    await waiver.press('End')
    const end = await tooltip.evaluate((element) => ({ top: element.scrollTop, maximum: element.scrollHeight - element.clientHeight }))
    assert.ok(Math.abs(end.top - end.maximum) <= 1, 'End reaches the complete explanation')
    const reasonBox = (await tooltip.getByText(/Lernstand.*unverändert/u).boundingBox())!
    const tooltipBox = (await tooltip.boundingBox())!
    assert.ok(reasonBox.y >= tooltipBox.y && reasonBox.y + reasonBox.height <= tooltipBox.y + tooltipBox.height,
      'the unchanged-mastery explanation at the bottom is visible after keyboard scrolling')
    await waiver.press('Home')
    assert.equal(await tooltip.evaluate((element) => element.scrollTop), 0, 'Home returns to the start of the tooltip')
    await waiver.press('Escape')
    await tooltip.waitFor({ state: 'detached' })
    assert.equal(await waiver.evaluate((element) => element === document.activeElement), true, 'Escape retains trigger focus')
    assert.equal(h.writes.length, 0, 'reading and scrolling the tooltip never writes learner state')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const completed: LevelCompletion = {
      ...selected(30), complete: true, masteredTargetCount: 1, waivedTargetCount: 1, pendingTargetCount: 0,
      masteredAssessmentCount: 1, waivedTargetGoalIds: ['math-upper'],
      assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' }, mastered: true, startAvailable: false }],
      waiverDetails: [{ goalId: 'math-upper', title: { de: 'Ableitungen für Wachstumsmodelle deuten' }, ruleId: 'rule',
        assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' } }], assessmentCount: 1 }],
    }
    const h = await open(completed, false, true)
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true })
    const waiver = h.page.getByTestId('completion-tree-waiver')
    const card = h.page.getByTestId('level-completion-card')
    const openSettings = async () => {
      await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
      await choice.waitFor()
    }
    await openSettings()
    assert.equal(await choice.isChecked(), true, 'profiles without a legacy preference default to enabled shortcuts')
    await choice.uncheck()
    assert.equal(await waiver.count(), 1, 'an unsaved setting cannot alter authoritative waivers')
    assert.equal(h.writes.length, 0)
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    await openSettings()
    assert.equal(await choice.isChecked(), true, 'closing without saving restores the persisted setting')

    await choice.uncheck()
    h.failPreferencesOnce()
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.getByRole('alert').getByText('Deine Einstellungen konnten nicht gespeichert werden.', { exact: false }).waitFor()
    assert.equal(await choice.isChecked(), false, 'a failed save preserves the draft for retry')
    assert.equal(await waiver.count(), 1, 'a rejected save does not change the active completion projection')
    const release = h.holdPreferenceSave()
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.getByRole('button', { name: 'Speichert...', exact: true }).waitFor()
    assert.equal(await waiver.count(), 1, 'pending preference writes do not locally remove waivers')
    release()
    await dialog.waitFor({ state: 'detached' })
    await card.waitFor({ state: 'detached' })
    await waiver.waitFor({ state: 'detached' })
    assert.equal(await h.page.locator('[data-goal-id="math-exam"] svg.lucide-check').count(), 1,
      'disabling shortcuts leaves actual assessment mastery visible')

    await h.page.reload()
    await h.page.getByTestId('learner-current-goal').waitFor()
    await openSettings()
    assert.equal(await choice.isChecked(), false, 'the saved false preference survives a fresh profile fetch and page reload')
    await choice.check()
    assert.equal(await card.count(), 0, 'an unsaved enable choice does not fabricate completion options')
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    await openSettings()
    assert.equal(await choice.isChecked(), false)
    await choice.check()
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    await card.getByTestId('completion-shortcut-discovery').waitFor()
    assert.equal(await waiver.count(), 0, 'enabling restores backend options without silently reselecting a profile')
    await openSettings()
    assert.equal(await choice.isChecked(), true, 'the restored preference is rehydrated from the saved profile')
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    assert.deepEqual(h.writes.map(({ path, body }) => ({ preferences: path.endsWith('/preferences'), shortcuts: body.useAssessmentShortcuts })), [
      { preferences: true, shortcuts: false }, { preferences: true, shortcuts: false }, { preferences: true, shortcuts: true },
    ], 'only explicit save/retry actions update preferences; no mastery or scope writes occur')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(55, true))
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Nur explizit erreichte Lernziele zählen', exact: true })
    const shortcuts = dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true })
    const running = h.page.getByText('Eine Prüfung läuft in deinem Lerncoach.', { exact: true })
    const openSettings = () => h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    await running.waitFor()
    await openSettings()
    assert.equal(await choice.isChecked(), false, 'older profiles default to inclusive plan counting')
    await choice.check()
    assert.equal(await shortcuts.isChecked(), true, 'the plan counting preference does not change shortcut access')
    assert.equal(await dialog.getByText('Beim Speichern beendest du den laufenden direkten Prüfungsversuch.', { exact: false }).count(), 0)
    assert.equal(h.writes.length, 0, 'editing the counting draft must not change any backend state')
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    await openSettings()
    assert.equal(await choice.isChecked(), false, 'cancel discards the unsaved counting choice')
    await choice.check()
    h.autoPreferenceSse()
    h.failProfileOnce()
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.getByRole('alert').getByText('Deine Einstellungen wurden gespeichert.', { exact: false }).waitFor()
    assert.equal(await choice.isChecked(), true, 'a failed reload cannot roll back an accepted counting preference')
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    await running.waitFor()
    assert.deepEqual(h.writes.map(write => write.body), [{ learningPlanCountOnlyExplicitGoals: true }],
      'changing plan counting saves only that preference; retry only reloads and never ends a running assessment')
    await h.page.reload()
    await running.waitFor()
    await openSettings()
    assert.equal(await choice.isChecked(), true, 'the saved profile restores explicit counting after reload')
    await choice.uncheck()
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    await running.waitFor()
    await openSettings()
    assert.equal(await choice.isChecked(), false, 'a saved false value omitted by the backend restores inclusive counting')
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    assert.deepEqual(h.writes.map(write => write.body), [
      { learningPlanCountOnlyExplicitGoals: true }, { learningPlanCountOnlyExplicitGoals: false },
    ], 'restoring inclusive counting causes no mastery, navigation or plan-edit write')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(56))
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Nur explizit erreichte Lernziele zählen', exact: true })
    const strict = dialog.getByRole('checkbox', { name: /^Strict Mode aktivieren/ })
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    await strict.uncheck()
    h.remoteExplicitCount(true)
    const refreshed = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Preferences refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
    await refreshed
    await h.page.waitForFunction(() => document.querySelector<HTMLInputElement>('[aria-label="Nur explizit erreichte Lernziele zählen"]')?.checked)
    assert.equal(await strict.isChecked(), false, 'a remote count preference preserves unrelated dirty fields')
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(h.writes.map(write => write.body), [{ strictMode: false }],
      'saving an unrelated preference cannot overwrite a remote plan counting choice')
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    assert.equal(await choice.isChecked(), true)
    await choice.uncheck()
    const again = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Preferences refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
    await again
    assert.equal(await choice.isChecked(), false, 'a locally edited counting choice survives a profile refresh')
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(57), true, false, { language: 'en', shortcutPreference: false, explicitCountPreference: true })
    await h.page.getByTestId('learner-mobile-menu-button').focus()
    await h.page.getByTestId('learner-mobile-menu-button').press('Enter')
    await h.page.getByRole('button', { name: 'Open settings', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'My Curriculum', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Count only explicitly achieved learning goals', exact: true })
    await choice.waitFor()
    assert.equal(await choice.isChecked(), true)
    assert.equal(await dialog.getByRole('checkbox', { name: 'Offer assessment shortcuts', exact: true }).isChecked(), false,
      'restored explicit counting is independent of disabled shortcut starts')
    await choice.uncheck()
    h.failPreferencesOnce()
    await dialog.getByRole('button', { name: 'Done', exact: true }).click()
    await dialog.getByRole('alert').getByText('Your settings could not be saved.', { exact: false }).waitFor()
    await dialog.getByRole('button', { name: 'Done', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(h.writes.map(write => write.body), [
      { learningPlanCountOnlyExplicitGoals: false }, { learningPlanCountOnlyExplicitGoals: false },
    ], 'failed preferences can be retried without changing shortcut access')
    assert.equal(await h.page.getByTestId('level-completion-card').count(), 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(60))
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true })
    const strict = dialog.getByRole('checkbox', { name: /^Strict Mode aktivieren/ })
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    await strict.uncheck()
    h.remoteShortcuts(false)
    const refreshed = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Preferences refresh complete') })
    await h.page.evaluate((learnerId) => {
      // The immediately preceding generic event exercises the refresh throttle.
      window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_CHANGED' } }))
      window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } }))
    }, learner)
    await refreshed
    await h.page.waitForFunction(() => !document.querySelector<HTMLInputElement>('[aria-label="Prüfungsabkürzungen anbieten"]')?.checked)
    assert.equal(await choice.isChecked(), false, 'an untouched field follows another tab despite an in-flight generic SSE refresh')
    assert.equal(await strict.isChecked(), false, "the learner's independent unsaved edit survives profile refresh")
    assert.equal(h.writes.length, 0, 'receiving saved preferences never writes them back')
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(h.writes.map(write => write.body), [{ strictMode: false }], 'saving an unrelated dirty field cannot re-enable shortcuts')
    await h.page.getByTestId('level-completion-card').waitFor({ state: 'detached' })
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    assert.equal(await choice.isChecked(), false)
    // The user's own changed flag is retained through an unrelated profile refresh.
    await choice.check()
    const again = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Preferences refresh complete') })
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
    await again
    assert.equal(await choice.isChecked(), true, 'an explicitly changed shortcut draft survives a same-value saved profile refresh')
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(70))
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    await dialog.getByRole('checkbox', { name: /^Strict Mode aktivieren/ }).uncheck()
    // Even a missed SSE event must not make an unchanged local checkbox write true.
    h.remoteShortcuts(false)
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(h.writes.map(write => write.body), [{ strictMode: false }])
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    assert.equal(await dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true }).isChecked(), false,
      'the final profile reload retains a concurrent opt-out even if its SSE was missed')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const completed: LevelCompletion = {
      ...selected(80), complete: true, masteredTargetCount: 1, waivedTargetCount: 1, pendingTargetCount: 0,
      masteredAssessmentCount: 1, waivedTargetGoalIds: ['math-upper'],
      assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' }, mastered: true, startAvailable: false }],
      waiverDetails: [{ goalId: 'math-upper', title: { de: 'Ableitungen für Wachstumsmodelle deuten' }, ruleId: 'rule',
        assessments: [{ goalId: 'math-exam', title: { de: 'Skalarprodukt prüfen' } }], assessmentCount: 1 }],
    }
    const h = await open(completed, false, true)
    await h.page.getByTestId('completion-tree-waiver').waitFor()
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true })
    await choice.uncheck()
    h.failProfileOnce()
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.getByRole('alert').getByText('Deine Einstellungen wurden gespeichert.', { exact: false }).waitFor()
    await h.page.getByTestId('completion-tree-waiver').waitFor({ state: 'detached' })
    await h.page.getByTestId('level-completion-card').waitFor({ state: 'detached' })
    assert.equal(await choice.isChecked(), false, 'a profile reload failure does not imply rollback of an accepted setting')
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    assert.deepEqual(h.writes.map(write => write.body), [{ useAssessmentShortcuts: false }],
      'retry after a successful write only reloads; it does not repeat the preference mutation')
    assert.equal(await h.page.locator('[data-goal-id="math-exam"] svg.lucide-check').count(), 1)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(85))
    h.autoPreferenceSse()
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true })
    await choice.uncheck()
    const release = h.holdProfileOnce()
    const reloadStarted = h.page.waitForRequest(request => new URL(request.url()).pathname === `/api/ui/learners/${learner}`)
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await reloadStarted
    // A second tab commits while the first post-save profile snapshot is held.
    // Its event is coalesced, then drained by another authoritative reload.
    h.remoteShortcuts(true)
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
    release()
    await dialog.waitFor({ state: 'detached' })
    await h.page.getByTestId('completion-shortcut-discovery').waitFor()
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    assert.equal(await choice.isChecked(), true, 'a concurrent remote save is reflected after the pending reload completes')
    assert.equal(await dialog.getByRole('alert').count(), 0, 'the backend save event does not cause a spurious reload error')
    assert.deepEqual(h.writes.map(write => write.body), [{ useAssessmentShortcuts: false }])
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(90))
    const release = h.holdProfileOnce()
    const requested = h.page.waitForRequest(request => new URL(request.url()).pathname === `/api/ui/learners/${learner}`)
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'PREFERENCES_CHANGED' } })), learner)
    await requested
    await h.page.getByTestId('fixture-switch-learner').click()
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    const choice = h.page.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true })
    await choice.waitFor()
    assert.equal(await choice.isChecked(), false)
    const oldRefresh = h.page.waitForEvent('console', { predicate: message => message.text().includes('[SSE] ✅ Preferences refresh complete') })
    release()
    await oldRefresh
    assert.equal(await choice.isChecked(), false, 'a delayed preference profile for the previous learner cannot change the new learner')
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(selected(40, true))
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    await dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true }).uncheck()
    await dialog.getByRole('status').getByText('Beim Speichern beendest du den laufenden direkten Prüfungsversuch.', { exact: false }).waitFor()
    await dialog.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
    await h.page.getByTestId('level-completion-card').getByText('Eine Prüfung läuft in deinem Lerncoach.', { exact: true }).waitFor()
    assert.equal(h.writes.length, 0, 'cancelling the setting preserves the running assessment')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const h = await open(unselected(50), false, false, { shortcutPreference: false, language: 'en' })
    await h.page.getByRole('button', { name: 'Open settings', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'My Curriculum', exact: true })
    const choice = dialog.getByRole('checkbox', { name: 'Offer assessment shortcuts', exact: true })
    await choice.waitFor()
    assert.equal(await choice.isChecked(), false, 'an explicit false preference is respected on first English startup')
    await dialog.getByText('Your saved learning progress stays unchanged.', { exact: false }).waitFor()
    await dialog.getByRole('button', { name: 'Close settings', exact: true }).click()
    assert.equal(h.writes.length, 0)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  for (const mobile of [false, true]) {
    const implicit: LevelCompletion = {
      ...selected(160), profileId: 'automatic:math-section', title: { de: 'Funktionen', en: 'Functions' },
      navigationIntent: 'required', complete: true, masteredTargetCount: 0, waivedTargetCount: 2,
      pendingTargetCount: 0, requiredAssessmentCount: 0, masteredAssessmentCount: 0,
      waivedTargetGoalIds: ['math-upper', 'math-lower'], assessments: [],
      waiverDetails: [{ goalId: 'math-upper', title: { de: 'Ableitungen für Wachstumsmodelle deuten' },
        ruleId: 'no_remaining_demand', assessments: [], assessmentCount: 0 }],
    }
    const h = await open(implicit, mobile, true, { examMastered: false })
    const card = h.page.getByTestId('level-completion-card')
    await card.getByText('Lernabschnitt abgeschlossen.', { exact: true }).waitFor()
    await card.getByText('0 von 2 Lernzielen direkt geschafft.', { exact: true }).waitFor()
    await card.getByText('2 Lernziele sind in diesem Abschnitt implizit erledigt', { exact: false }).waitFor()
    await card.getByText('Warum sind diese Ziele implizit erledigt?', { exact: true }).click()
    assert.equal(await card.getByText('Geschaffte Prüfungen:', { exact: false }).count(), 0,
      'ordinary mastery or absent demand must not be explained as a passed assessment')
    await card.getByRole('button', { name: 'Im Lernzielbaum anzeigen: Ableitungen für Wachstumsmodelle deuten', exact: true }).click()
    await waitForTreeReveal(h.page, 'math-upper')
    const row = h.page.locator('[data-goal-id="math-upper"]')
    const icon = row.getByRole('button', { name: 'Für diesen Abschnitt nicht mehr erforderlich', exact: true })
    if (mobile) await icon.tap()
    else {
      await row.press('Tab')
      assert.equal(await icon.evaluate(element => document.activeElement === element), true)
    }
    const tooltip = h.page.getByRole('tooltip')
    await tooltip.getByText('Das Ziel ist hier implizit erledigt;', { exact: false }).waitFor()
    assert.equal(await tooltip.getByText('Bestandene Prüfungen:', { exact: false }).count(), 0)
    assert.equal(await row.locator('svg.lucide-check').count(), 0, 'implicit completion never adds a mastery check')
    assert.ok((await row.boundingBox())!.height < 80, 'generic explanations keep the same compact tree row')
    assert.equal(h.writes.length, 0, 'inspection and tooltip interaction never choose a route or write mastery')
    await h.page.keyboard.press('Escape')
    h.unavailable()
    await h.page.evaluate(learnerId => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail: { learnerId, type: 'ACTIVE_GOAL_CHANGED' } })), learner)
    await card.getByText('Diese Ansicht ist veraltet.', { exact: false }).waitFor()
    assert.equal(await h.page.getByTestId('completion-tree-waiver').count(), 0, 'stale generic context cannot retain implicit tree markers')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const assessments = Array.from({ length: 37 }, (_, i) => ({
      goalId: `generic-exam-${i + 1}`, title: { de: `Prüfung ${i + 1}`, en: `Assessment ${i + 1}` },
      mastered: i === 30, startAvailable: i !== 30,
    }))
    const overview: LevelCompletion = {
      ...selected(170), profileId: 'automatic:personal-curriculum', navigationIntent: undefined,
      title: { de: 'Persönlicher Lehrplan', en: 'Personal Curriculum' }, complete: false,
      masteredTargetCount: 1, waivedTargetCount: 0, pendingTargetCount: 36, targetCount: 37,
      masteredAssessmentCount: 1, requiredAssessmentCount: 37, assessments, actions: [],
      profileOptions: Array.from({ length: 30 }, (_, i) => ({
        profileId: `automatic:scope-${i + 1}`, title: { de: `Abschnitt ${i + 1}` },
        targetCount: 2, requiredAssessmentCount: 1, assessments: [assessments[i]],
      })),
    }
    const h = await open(overview)
    const card = h.page.getByTestId('level-completion-card')
    const disclosure = card.getByTestId('completion-shortcut-discovery')
    assert.equal(await disclosure.evaluate(element => (element as HTMLDetailsElement).open), false,
      'automatic read-only overview does not pretend to be a selected route')
    await disclosure.locator('summary').click()
    await card.getByTestId('completion-default-overview').waitFor()
    assert.equal(await h.page.getByTestId('learner-coach-start-link').getAttribute('href'), '/?start=coach',
      'read-only evaluation cannot turn the ordinary coach launch into a section route')
    assert.equal(await card.getByText('Dein regulärer Lernplan ist pausiert', { exact: false }).count(), 0)
    assert.equal(await card.getByRole('button', { name: 'Zur regulären Lernansicht' }).count(), 0)
    const browser = card.getByTestId('completion-assessment-browser')
    assert.equal(await browser.getByRole('listitem').count(), 8, 'large backend lists render one bounded page')
    await browser.getByRole('navigation', { name: 'Prüfungsseiten' }).getByRole('button', { name: 'Weiter', exact: true }).click()
    await browser.getByText('Prüfung 9', { exact: true }).waitFor()
    const search = browser.getByRole('searchbox', { name: 'Prüfung suchen', exact: true })
    await search.fill('Prüfung 37')
    await browser.getByText('Prüfung 37', { exact: true }).waitFor()
    const launch = browser.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true })
    const choice = new URLSearchParams((await launch.getAttribute('href'))!.split('?')[1])
    assert.equal(choice.get('completionProfile'), 'automatic:personal-curriculum')
    assert.equal(choice.get('completionGoal'), 'generic-exam-37', 'search reaches assessments beyond the old 24-choice limit')
    await search.fill('Prüfung 31')
    await browser.getByText('Geschafft', { exact: true }).waitFor()
    assert.equal(await browser.getByRole('link').count(), 0, 'achieved assessments remain searchable without a false start offer')
    await search.fill('unbekannte Prüfung')
    await browser.getByText('Keine Prüfung passt zu deiner Suche.', { exact: true }).waitFor()
    await card.getByRole('searchbox', { name: 'Lernabschnitt suchen', exact: true }).fill('Abschnitt 30')
    assert.equal(h.writes.length, 0, 'searching and paging never writes learning state')
    await card.getByRole('button', { name: 'Abschnitt als Lernweg wählen: Abschnitt 30', exact: true }).click()
    assert.equal(h.writes.length, 1)
    assert.deepEqual(h.writes[0].body, { action: 'selectProfile', profileId: 'automatic:scope-30', expectedRevision: 170 },
      'only deliberate section selection writes the exact backend scope')
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const overview: LevelCompletion = {
      ...selected(175), profileId: 'automatic:personal-curriculum', navigationIntent: undefined,
      title: { de: 'Persönlicher Lehrplan' }, targetCount: 2, masteredTargetCount: 0,
      waivedTargetCount: 1, pendingTargetCount: 1, waivedTargetGoalIds: ['math-upper'], actions: [],
      profileOptions: [{ profileId: 'automatic:math-section', title: { de: 'Mathematik' }, targetCount: 2,
        requiredAssessmentCount: 1, assessments: selected(175).assessments }],
      waiverDetails: [{ goalId: 'math-upper', title: { de: 'Ableitungen für Wachstumsmodelle deuten' },
        ruleId: 'no_remaining_demand', assessments: [], assessmentCount: 0 }],
    }
    const h = await open(overview, false, true, { examMastered: false })
    const card = h.page.getByTestId('level-completion-card')
    await card.getByTestId('completion-shortcut-discovery').locator('summary').click()
    const waiver = h.page.getByTestId('completion-tree-waiver')
    await waiver.waitFor()
    await card.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).waitFor()
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    const dialog = h.page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
    await dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true }).uncheck()
    assert.equal(await waiver.count(), 1, 'unsaved optout does not affect implicit evaluation')
    await dialog.getByRole('button', { name: 'Fertig', exact: true }).click()
    await dialog.waitFor({ state: 'detached' })
    await card.getByRole('link', { name: 'Prüfung direkt versuchen', exact: true }).waitFor({ state: 'detached' })
    await card.getByTestId('completion-default-overview').getByText('1 implizit erledigt', { exact: false }).waitFor()
    assert.equal(await waiver.count(), 1, 'saved optout hides offers but retains backend implicit completion')
    assert.equal(await card.getByRole('button', { name: 'Abschnitt als Lernweg wählen', exact: false }).count(), 0)
    assert.equal(await h.page.locator('[data-goal-id="math-upper"] svg.lucide-check').count(), 0)
    assert.deepEqual(h.writes.map(write => write.body), [{ useAssessmentShortcuts: false }])
    await h.page.reload()
    await h.page.getByTestId('completion-tree-waiver').waitFor()
    await h.page.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
    assert.equal(await dialog.getByRole('checkbox', { name: 'Prüfungsabkürzungen anbieten', exact: true }).isChecked(), false)
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  {
    const scope: LevelCompletion = { ...selected(180), profileId: 'automatic:math-section', navigationIntent: 'required',
      title: { de: 'Sekundarstufe I', en: 'Lower secondary' } }
    const h = await open(scope, true, false, { language: 'en' })
    const card = h.page.getByTestId('level-completion-card')
    await card.getByRole('list', { name: 'Assessments in this section', exact: true }).waitFor()
    await card.getByRole('link', { name: 'Try assessment directly', exact: true }).click()
    await h.page.getByTestId('coach-provider-choice').waitFor()
    assert.equal(h.writes.length, 0)
    await h.page.evaluate(() => { window.open = (() => ({ opener: null, location: { href: '' }, close() {} })) as unknown as typeof window.open })
    await Promise.all([
      h.page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/claude/v1/launch')),
      h.page.getByTestId('claude-plugin-start').click(),
    ])
    assert.deepEqual(h.writes[0].body.completionAssessment, { profileId: 'automatic:math-section', goalId: 'math-exam', expectedRevision: 180 })
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }
  console.log('Level completion Cockpit/provider-choice browser tests passed.')
} finally {
  await browser?.close()
  await server.close()
}
