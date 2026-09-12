import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const canonicalRoot = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const mathId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsId = 'e6f2b9c1-7a3d-4e8f-9c2b-6d1e0f4a9b52'
const mathTitle = 'Ableitungen für Wachstumsmodelle deuten'
const physicsTitle = 'Elektrische Felder untersuchen'
const learnerA = 'fixture-learner-a'
const learnerB = 'fixture-learner-b'

type Reply = { status?: number; body: unknown }
type Endpoint = 'profile' | 'state' | 'plans'
const deferred = <T>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => { resolve = done })
  return { promise, resolve }
}
const profile = (learnerId: string): Reply => ({ body: {
  skillpilotId: learnerId,
  selectedCurriculum: canonicalRoot,
  createdAt: '2026-09-01T08:00:00Z',
  personalCurriculum: JSON.stringify({
    [canonicalRoot]: { selected: true, filterId: 'DE-HE', durationModel: 'G9', stage: 'CrossStage' },
    [mathId]: { selected: true, filterId: 'GK+LK' },
    [physicsId]: { selected: true, filterId: 'GK+LK' },
    __skillpilot_stage_scope_sek1__: { selected: true },
    __skillpilot_stage_scope_sek2__: { selected: true },
  }),
  learningStrategy: 'SEQUENTIAL', autoPilot: false, followLearningPlans: true,
  strictMode: false, showGoalVisualizationsInChat: true, copySources: [],
  activeGoalId: learnerId === learnerA ? 'math-upper' : 'physics-upper',
} })
const state = (learnerId: string): Reply => {
  const id = learnerId === learnerA ? 'math-upper' : 'physics-upper'
  return { body: {
    activeGoal: { id }, frontier: [],
    goals: {
      planned: [{ id }], mastered_count: 0, total_count: 4,
      personalized: { mastered_atomic: 0, total_atomic: 4 },
    },
    stateMachine: { activeGoal: { id }, goalOptions: [], requiredAction: null },
  } }
}
const subjectPlan = (landscapeId: string, goalId: string) => ({
  planId: `${goalId}-plan`, revision: 1, landscapeId, stale: false,
  planLabel: landscapeId === mathId ? 'Mathematik' : 'Physik',
  period: { startDate: '2026-09-01', endDate: '2027-06-30' },
  currentBlock: {
    blockId: `${goalId}-block`, kind: 'learning', title: 'Lernabschnitt',
    startDate: '2026-09-01', endDate: '2026-09-30',
  },
  nextMilestone: null,
  metrics: {
    dueThroughToday: 1, completedDueThroughToday: 0, openDueThroughToday: 1,
    dueToday: 1, completedDueToday: 0, openDueToday: 1, totalPlanned: 1,
  },
  buffer: { totalWorkdays: 1, remainingWorkdays: 1 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: { goalId }, continueReason: null, canContinue: true,
})
const plans = (): Reply => ({ body: {
  asOf: '2026-09-09', followLearningPlans: true,
  plans: [subjectPlan(mathId, 'math-upper'), subjectPlan(physicsId, 'physics-upper')],
} })

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(appRoot, 'scripts/fixtures/learnerViewStartupUi.html', {
  plugins: [tailwindcss()],
})
const screenshotDir = fileURLToPath(new URL('../../tmp/learner-cockpit-startup/', import.meta.url))
await mkdir(screenshotDir, { recursive: true })
let browser: Browser | null = null
const contexts: BrowserContext[] = []
const pendingGates: Array<ReturnType<typeof deferred<Reply>>> = []
const gate = () => {
  const next = deferred<Reply>()
  pendingGates.push(next)
  return next
}
const settledFrame = (page: Page) => page.evaluate(() => new Promise<void>((done) => {
  requestAnimationFrame(() => requestAnimationFrame(() => done()))
}))

try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const open = async (initial?: Partial<Record<Endpoint, Reply | Promise<Reply>>>) => {
    const context = await browser!.newContext({ viewport: { width: 1280, height: 900 }, locale: 'de-DE' })
    contexts.push(context)
    await context.addInitScript(() => {
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_theme', 'light')
      // The observer records transient regressions too, not just the final UI.
      Object.assign(window, { startupFixtureTexts: [] as string[] })
      document.addEventListener('DOMContentLoaded', () => {
        const texts = (window as unknown as { startupFixtureTexts: string[] }).startupFixtureTexts
        new MutationObserver(() => texts.push(document.body.innerText)).observe(document.body, {
          childList: true, subtree: true, characterData: true,
        })
      })
    })
    const page = await context.newPage()
    const errors: string[] = []
    const unexpected: string[] = []
    const requests: Array<{ learnerId: string; endpoint: Endpoint }> = []
    const replies: Record<string, Record<Endpoint, Reply | Promise<Reply>>> = {
      [learnerA]: { profile: profile(learnerA), state: state(learnerA), plans: plans(), ...initial },
      [learnerB]: { profile: profile(learnerB), state: state(learnerB), plans: plans() },
    }
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/api/**', async (route) => {
      const request = route.request()
      const path = new URL(request.url()).pathname
      const json = (reply: Reply) => route.fulfill({
        status: reply.status ?? 200,
        contentType: 'application/json',
        body: JSON.stringify(reply.body),
      })
      if (path === '/api/ui/curriculum-catalog') {
        return json({ body: {
          catalogApiVersion: '1.2', generationSha256: '0'.repeat(64), packages: [],
          rootLandscapeIds: [], landscapes: [], views: [], offerings: [], decks: [], resources: [], sourceEvidence: [],
        } })
      }
      const match = /^\/api\/ui\/learners\/(fixture-learner-[ab])(?:\/(state|learning-plans|resume))?$/u.exec(path)
      if (match && (request.method() === 'GET' || (match[2] === 'resume' && request.method() === 'POST'))) {
        if (match[2] === 'resume') return json({ body: {
          lastActivityAt: '2026-09-09T08:00:00Z', scheduledDeletionAt: '2027-03-09T08:00:00Z',
        } })
        const learnerId = match[1]!
        const endpoint: Endpoint = match[2] === 'learning-plans' ? 'plans' : match[2] === 'state' ? 'state' : 'profile'
        requests.push({ learnerId, endpoint })
        return json(await replies[learnerId]![endpoint])
      }
      unexpected.push(`${request.method()} ${path}`)
      return json({ status: 404, body: { error: 'Unexpected local fixture request' } })
    })
    await page.goto(`${server.baseUrl}/scripts/fixtures/learnerViewStartupUi.html`)
    return { context, page, replies, errors, unexpected, requests }
  }
  const assertNoFalseSetup = async (page: Page) => {
    assert.equal(await page.getByRole('dialog').count(), 0, 'a valid delayed scope must never open setup')
    const snapshots = await page.evaluate(() => (
      window as unknown as { startupFixtureTexts: string[] }
    ).startupFixtureTexts)
    assert(!snapshots.some((text) => /Persönlichen Lehrplan vervollständigen|Einrichtung fortsetzen/u.test(text)),
      'loading must not transiently claim that a valid personal curriculum needs setup')
    assert(!snapshots.some((text) => /Dein Lernumfang wird geladen|Der Lernbaum bleibt gesperrt/u.test(text)),
      'normal loading must not flash a second scope-loading or locked-tree explanation')
  }
  const emit = (page: Page, learnerId: string, type: string, nodeId?: string) => page.evaluate(
    (detail) => window.dispatchEvent(new CustomEvent('learner-startup-fixture-sse', { detail })),
    { learnerId, type, nodeId },
  )
  const waitReady = async (page: Page, title: string) => {
    await page.getByTestId('learner-current-goal').getByRole('heading', { name: title }).waitFor({ timeout: 20_000 })
    const overview = page.getByTestId('learner-plan-today-overview')
    await overview.getByText('Noch 2 Lernziele bis zu deinen heutigen Tageszielen.', { exact: true }).waitFor()
    for (const subject of ['Mathematik', 'Physik']) {
      const progress = overview.getByRole('progressbar', { name: `Tagesziel: ${subject}`, exact: true })
      await progress.waitFor()
      assert.equal(await progress.getAttribute('value'), '0', `${subject} must not show fabricated daily completions`)
      assert.equal(await progress.getAttribute('max'), '1', `${subject} must retain its own daily quota`)
      assert.equal(await progress.getAttribute('aria-valuetext'), '0 von 1 Lernzielen heute geschafft')
    }
  }

  // Delay the two independent authoritative reads in both possible orders.
  for (const first of ['profile', 'state'] as const) {
    const profileGate = gate()
    const stateGate = gate()
    const h = await open({ profile: profileGate.promise, state: stateGate.promise })
    await h.page.getByText('Dein Cockpit wird geladen …', { exact: true }).waitFor()
    await settledFrame(h.page)
    assert.equal(await h.page.getByRole('status').count(), 1, 'one quiet loading status, not duplicate loading banners')
    assert.equal(await h.page.getByTestId('learner-tree-loading').count(), 1)
    assert.equal(await h.page.getByTestId('learner-current-goal').count(), 0)
    if (first === 'profile') await h.page.screenshot({ path: `${screenshotDir}loading.png` })
    assert.equal(await h.page.locator('#learner-goal-sidebar button').filter({ hasText: /^0$/u }).count(), 0,
      'loading must not display a fabricated zero-goal counter')
    if (first === 'profile') profileGate.resolve(profile(learnerA))
    else stateGate.resolve(state(learnerA))
    await settledFrame(h.page)
    await assertNoFalseSetup(h.page)
    assert.equal(await h.page.getByText('Dein Cockpit wird geladen …', { exact: true }).count(), 1)
    profileGate.resolve(profile(learnerA))
    stateGate.resolve(state(learnerA))
    await waitReady(h.page, mathTitle)
    if (first === 'profile') await h.page.screenshot({ path: `${screenshotDir}ready.png` })
    await assertNoFalseSetup(h.page)
    assert.equal(h.requests.filter((r) => r.endpoint === 'profile').length, 1,
      'one profile request must serve personal configuration and learner metadata')
    assert.equal(h.requests.filter((r) => r.endpoint === 'state').length, 1)
    const focus = h.page.locator('#learner-goal-sidebar button[aria-pressed="true"]')
    await focus.waitFor()
    assert.equal(await focus.count(), 1, 'full /state planned goals preserve exactly the saved focus')
    assert.match(await focus.locator('..').innerText(), /Ableitungen/u)
    assert.deepEqual(h.unexpected, [], 'initial loading must not request the redundant /planned endpoint')

    if (first === 'profile') {
      const section = h.page.getByRole('region', { name: 'Meine Fachpläne' })
      const before = await h.page.getByTestId('learner-plan-today-overview').innerText()
      const beforeBox = await h.page.getByTestId('learner-plan-today-overview').boundingBox()
      const refreshGate = gate()
      h.replies[learnerA]!.plans = refreshGate.promise
      await emit(h.page, learnerA, 'CLIENT_STATE_UPDATED', 'unrelated-memory-goal')
      await h.page.waitForFunction(() => document.querySelector('[aria-label="Meine Fachpläne"]')?.getAttribute('aria-busy') === 'true')
      assert.equal(await section.getAttribute('aria-busy'), 'true')
      assert.equal(await h.page.getByTestId('learner-plan-continue').isDisabled(), true)
      assert.equal(await section.getByRole('button', { name: 'Zu Physik wechseln' }).isDisabled(), true)
      assert.equal(await h.page.getByTestId('learner-plan-today-overview').innerText(), before,
        'background refresh preserves existing labels and counts')
      assert.deepEqual(await h.page.getByTestId('learner-plan-today-overview').boundingBox(), beforeBox,
        'background refresh must not shift the overview with a temporary banner')
      assert.equal(await section.getByRole('status').count(), 0)
      assert.equal(await h.page.getByText('Fachpläne werden aktualisiert … Planaktionen sind kurz gesperrt.').count(), 0)
      refreshGate.resolve({ status: 503, body: { error: 'Controlled plan outage' } })
      await section.getByText(/Aktualisierung fehlgeschlagen/u).waitFor()
      assert.equal(await h.page.getByTestId('learner-plan-continue').isDisabled(), true)
      assert.equal(await section.getByRole('button', { name: 'Zu Physik wechseln' }).isDisabled(), true)
      h.replies[learnerA]!.plans = plans()
      h.replies[learnerA]!.state = state(learnerA)
      await section.getByRole('button', { name: 'Erneut versuchen' }).click()
      await h.page.waitForFunction(() => !document.querySelector<HTMLButtonElement>('[data-testid="learner-plan-continue"]')?.disabled)
      assert.equal(await section.getByText(/Aktualisierung fehlgeschlagen/u).count(), 0)
      const stateRequests = h.requests.filter((r) => r.endpoint === 'state').length
      const fullRefresh = h.page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/state'))
      await emit(h.page, learnerA, 'ACTIVE_GOAL_CHANGED')
      await fullRefresh
      await settledFrame(h.page)
      assert.equal(h.requests.filter((r) => r.endpoint === 'state').length, stateRequests + 1)
      assert.equal(h.requests.filter((r) => r.endpoint === 'profile').length, 1,
        'an SSE full refresh must not duplicate the stable profile request')
      assert.equal(await focus.count(), 1)
      assert.deepEqual(h.unexpected, [], 'SSE refresh must reuse planned goals from full /state')
    }
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  // A plan switch owns both the active goal and the saved focus even when a
  // same-learner /state refresh was already in flight before the transition.
  {
    const h = await open()
    await waitReady(h.page, mathTitle)
    let switchRequests = 0
    await h.page.route(`**/api/ui/learners/${learnerA}/learning-plans/physics-upper-plan/switch`, async (route) => {
      switchRequests += 1
      assert.equal(route.request().method(), 'POST')
      assert.deepEqual(route.request().postDataJSON(), { expectedRevision: 1, asOf: '2026-09-09' })
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          planId: 'physics-upper-plan', revision: 1, landscapeId: physicsId,
          focusGoalId: 'physics-upper', activeGoalId: 'physics-upper', changed: true,
          state: state(learnerB).body,
        }),
      })
    })
    const oldStateGate = gate()
    h.replies[learnerA]!.state = oldStateGate.promise
    const pendingStateRequest = h.page.waitForRequest((request) => (
      new URL(request.url()).pathname === `/api/ui/learners/${learnerA}/state`
    ))
    await emit(h.page, learnerA, 'ACTIVE_GOAL_CHANGED')
    await pendingStateRequest
    await h.page.getByRole('button', { name: 'Zu Physik wechseln' }).click()
    await waitReady(h.page, physicsTitle)
    const focus = h.page.locator('#learner-goal-sidebar button[aria-pressed="true"]')
    assert.equal(await focus.count(), 1)
    assert.match(await focus.locator('..').innerText(), /Elektrische Felder/u)
    assert.equal(switchRequests, 1)

    const oldStateResponse = h.page.waitForResponse((response) => (
      new URL(response.url()).pathname === `/api/ui/learners/${learnerA}/state`
    ))
    oldStateGate.resolve(state(learnerA))
    await oldStateResponse
    await settledFrame(h.page)
    await waitReady(h.page, physicsTitle)
    assert.equal(await focus.count(), 1)
    assert.match(await focus.locator('..').innerText(), /Elektrische Felder/u,
      'an older same-scope /state response must not restore the previous focus after a plan switch')
    await h.page.getByTestId('learner-plan-today-overview').getByText(/Du lernst gerade · Physik/u).waitFor()
    await assertNoFalseSetup(h.page)
    assert.deepEqual(h.unexpected, [])
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  // A real scope error remains actionable and is not disguised as loading.
  {
    const h = await open({ profile: { status: 503, body: { error: 'Controlled profile outage' } } })
    await h.page.getByTestId('learner-main-content').getByRole('heading', {
      name: 'Dein Lernumfang konnte nicht geprüft werden',
    }).waitFor()
    assert.equal(await h.page.getByTestId('learner-current-goal').count(), 0)
    h.replies[learnerA]!.profile = profile(learnerA)
    await h.page.getByRole('button', { name: 'Erneut versuchen' }).last().click()
    await waitReady(h.page, mathTitle)
    assert.equal(await h.page.getByRole('heading', { name: 'Dein Lernumfang konnte nicht geprüft werden' }).count(), 0)
    assert.equal(h.requests.filter((r) => r.endpoint === 'profile').length, 2, 'retry issues exactly one new profile read')
    assert.deepEqual(h.unexpected, [])
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  // Pending reads belonging to a former learner must never reopen setup, change
  // the active goal or replace the new learner's saved focus after a switch.
  {
    const profileGate = gate()
    const stateGate = gate()
    const h = await open({ profile: profileGate.promise, state: stateGate.promise })
    await h.page.getByText('Dein Cockpit wird geladen …', { exact: true }).waitFor()
    await h.page.getByTestId('fixture-switch-learner').click()
    await waitReady(h.page, physicsTitle)
    const oldStateResponse = h.page.waitForResponse((response) => new URL(response.url()).pathname === `/api/ui/learners/${learnerA}/state`)
    profileGate.resolve({ body: { ...profile(learnerA).body as object, personalCurriculum: '{}' } })
    stateGate.resolve({ body: {
      activeGoal: { id: 'math-lower' }, frontier: [],
      goals: { planned: [{ id: 'math-lower' }], mastered_count: 999, total_count: 999 },
      stateMachine: { activeGoal: { id: 'math-lower' }, goalOptions: [], requiredAction: 'setPersonalization' },
    } })
    await oldStateResponse
    await settledFrame(h.page)
    await waitReady(h.page, physicsTitle)
    await assertNoFalseSetup(h.page)
    const focus = h.page.locator('#learner-goal-sidebar button[aria-pressed="true"]')
    assert.equal(await focus.count(), 1)
    assert.match(await focus.locator('..').innerText(), /Elektrische Felder/u)
    assert.equal(h.requests.filter((r) => r.learnerId === learnerB && r.endpoint === 'profile').length, 1)
    assert.deepEqual(h.unexpected, [])
    assert.deepEqual(h.errors, [])
    await h.context.close()
  }

  console.log('LearnerView startup, request deduplication, quiet refresh and scope-isolation browser tests passed')
} finally {
  for (const pending of pendingGates) pending.resolve({ status: 503, body: { error: 'Fixture cleanup' } })
  await Promise.all(contexts.map((context) => context.close()))
  await browser?.close()
  await server.close()
}
