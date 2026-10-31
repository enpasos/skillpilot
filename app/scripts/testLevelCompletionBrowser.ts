import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'
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
  profileOptions: [{ profileId: 'math-completion', title }], directAssessmentRunning: false, actions: [],
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
const state = (completion: LevelCompletion) => ({
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

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(appRoot, 'scripts/fixtures/learnerViewStartupUi.html', { plugins: [tailwindcss()] })
let browser: Browser | null = null
try {
  browser = await chromium.launch({ headless: true, args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'] })
  const open = async (initial: LevelCompletion, mobile = false, completionTree = false) => {
    const context = await browser!.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, hasTouch: mobile, locale: 'de-DE' })
    await context.addInitScript(({ learner, rootId, termsVersion }) => {
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_theme', 'light')
      localStorage.setItem('skillpilot_id', learner)
      localStorage.setItem('skillpilot_role', 'learner')
      localStorage.setItem('skillpilot_learner_landscape', rootId)
      localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
    }, { learner, rootId, termsVersion: CURRENT_TERMS_VERSION })
    const page = await context.newPage()
    const errors: string[] = []
    const writes: { path: string; body: Record<string, unknown> }[] = []
    let completion = initial
    let stateUnavailable = false
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/api/**', async (route) => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      const json = (body: unknown, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })
      if (path === '/api/ui/curriculum-catalog') return json({ catalogApiVersion: '1.2', generationSha256: '0'.repeat(64), packages: [], rootLandscapeIds: [], landscapes: [], views: [], offerings: [], decks: [], resources: [], sourceEvidence: [] })
      if (path === `/api/ui/learners/${learner}`) return json(profile)
      if (path === `/api/ui/learners/${learner}/state`) {
        const payload = state(completion)
        if (completionTree) payload.goals = { ...payload.goals, mastered_count: 1, total_count: 5, personalized: { mastered_atomic: 1, total_atomic: 5 } }
        return stateUnavailable ? json({}, 503) : json(payload)
      }
      if (path === `/api/ui/learners/${learner}/resume`) return json({ lastActivityAt: '2026-09-09T08:00:00Z', scheduledDeletionAt: '2027-03-09T08:00:00Z' })
      if (path === '/api/ui/landscapes') return json({ summaries: [{ curriculumId: rootId, filename: 'canonical-gymnasium.json', country: 'DE', region: 'DE', type: 'GYMNASIUM', level: 'Sekundarstufe', subject: 'Gymnasium', locale: 'de-DE', title: 'Gymnasium (DE)', schoolType: 'Gymnasium', qualityMaturity: 'M6' }] })
      if (path === `/api/ui/learners/${learner}/personalization-plan`) return json(savedPlan)
      if (request.method() === 'POST' && path.endsWith('/level-completion/actions')) {
        const body = request.postDataJSON() as Record<string, unknown>
        writes.push({ path, body })
        assert.equal(body.expectedRevision, completion.learnerRevision)
        completion = body.action === 'selectProfile' ? selected(completion.learnerRevision + 1) : unselected(completion.learnerRevision + 1)
        return json(state(completion))
      }
      if (request.method() === 'POST' && path.endsWith('/claude/v1/launch')) {
        writes.push({ path, body: request.postDataJSON() as Record<string, unknown> })
        const learningSessionId = `spc_${'A'.repeat(43)}`
        return json({ prompt: `Nutze SkillPilot. Session: ${learningSessionId}`, webUrl: 'https://claude.ai/new', learningSessionId, expiresAt: '2027-01-01T00:00:00Z' })
      }
      return json({}, 404)
    })
    await page.goto(`${server.baseUrl}/scripts/fixtures/learnerViewStartupUi.html${completionTree ? '?completionTree=1' : ''}`)
    await page.getByTestId('level-completion-card').waitFor()
    return { page, context, writes, errors, unavailable: () => { stateUnavailable = true }, update: (next: LevelCompletion) => { completion = next } }
  }

  {
    const h = await open(unselected(1))
    assert.equal(h.writes.length, 0, 'a profile is never selected automatically')
    await h.page.getByTestId('level-completion-card').getByRole('button', { name: title.de, exact: true }).click()
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
    await card.getByRole('button', { name: title.de, exact: true }).waitFor()
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
    await card.getByRole('button', { name: title.de, exact: true }).waitFor()
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
    await h.page.waitForFunction(() => document.querySelector('[data-goal-id="math-exam"]')?.classList.contains('bg-sky-100'))
    await h.page.locator('[data-goal-id="math-sek-ii"]').getByRole('button', { name: /einklappen$/ }).click()
    await waiver.waitFor({ state: 'detached' })
    if (mobile) await h.page.getByRole('button', { name: 'Lernzielmenü schließen', exact: true }).click()
    await card.locator('details').getByRole('button', { name: 'Im Lernzielbaum anzeigen' }).click()
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
    const waiver = h.page.locator('[data-goal-id="math-upper"]').getByTestId('completion-tree-waiver')
    await waiver.focus()
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
  console.log('Level completion Cockpit/provider-choice browser tests passed.')
} finally {
  await browser?.close()
  await server.close()
}
