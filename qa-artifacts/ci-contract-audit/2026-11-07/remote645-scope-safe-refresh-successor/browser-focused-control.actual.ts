import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'

import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import type { PersonalizationPlan } from '../src/utils/personalCurriculumEditorApi'
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
  buffer: { totalWorkdays: 1, remainingWorkdays: 1 },
  nextEligibleGoal: { goalId }, continueReason: null, canContinue: true,
})
const planStatusBody = {
  asOf: '2026-09-09',
  periodBasis: 'DAY',
  periodStart: '2026-09-09',
  periodEnd: '2026-09-09',
  timeZone: 'Europe/Berlin',
  language: 'de',
  evaluable: true,
  statusText: 'Mathematik: Tagesziel 0 von 1 \u00b7 im Plan\nPhysik: Tagesziel 0 von 1 \u00b7 im Plan',
  noticeText: null,
  activeGoal: null,
  followLearningPlans: true,
  resumeAvailable: true,
  subjects: [
    {
      subjectKey: 'mathematik', landscapeIds: [mathId], subjectLabel: 'Mathematik', evaluable: true,
      periodText: 'Tagesziel 0 von 1', planStatusText: 'im Plan',
      subjectLine: 'Mathematik: Tagesziel 0 von 1 \u00b7 im Plan',
      statusDirection: 'on_track', current: false, canContinue: true,
      periodGauge: { completed: 0, target: 1, needlePosition: 0 },
      balanceGauge: { net: 0, typicalAmount: 1, scaleLimit: 2, needlePosition: 0, severeBehind: false, strongAhead: false },
    },
    {
      subjectKey: 'physik', landscapeIds: [physicsId], subjectLabel: 'Physik', evaluable: true,
      periodText: 'Tagesziel 0 von 1', planStatusText: 'im Plan',
      subjectLine: 'Physik: Tagesziel 0 von 1 \u00b7 im Plan',
      statusDirection: 'on_track', current: false, canContinue: true,
      periodGauge: { completed: 0, target: 1, needlePosition: 0 },
      balanceGauge: { net: 0, typicalAmount: 1, scaleLimit: 2, needlePosition: 0, severeBehind: false, strongAhead: false },
    },
  ],
  unavailablePlanCount: 0,
}

const plans = (): Reply => ({ body: {
  asOf: '2026-09-09', followLearningPlans: true,
  status: planStatusBody,
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
  const open = async (
    initial?: Partial<Record<Endpoint, Reply | Promise<Reply>>>,
    root: 'canonical' | 'legacy' = 'canonical',
  ) => {
    const context = await browser!.newContext({ viewport: { width: 1280, height: 900 }, locale: 'de-DE' })
    contexts.push(context)
    await context.addInitScript(() => {
      localStorage.setItem('skillpilot_lang', 'de')
      localStorage.setItem('skillpilot_theme', 'light')
      // The observer records transient regressions too, not just the final UI.
      Object.assign(window, { startupFixtureTexts: [] as string[], startupFixtureActiveGoals: [] as string[] })
      document.addEventListener('DOMContentLoaded', () => {
        const snapshots = window as unknown as { startupFixtureTexts: string[]; startupFixtureActiveGoals: string[] }
        new MutationObserver(() => {
          snapshots.startupFixtureTexts.push(document.body.innerText)
          const banner = document.querySelector<HTMLElement>('[data-testid="learner-active-goal-banner"]')
          if (banner) snapshots.startupFixtureActiveGoals.push(banner.innerText)
        }).observe(document.body, {
          childList: true, subtree: true, characterData: true,
        })
      })
    })
    const page = await context.newPage()
    const errors: string[] = []
    const unexpected: string[] = []
    const contentRequests: string[] = []
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
      if (/^\/api\/ui\/learners\/fixture-learner-[ab]\/content-(?:selection|materials)$/u.test(path)
          && request.method() === 'GET') {
        contentRequests.push(path)
        return json({ status: 404, body: { error: 'Optional content pilot disabled' } })
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
    await page.goto(`${server.baseUrl}/scripts/fixtures/learnerViewStartupUi.html?root=${root}`)
    return { context, page, replies, errors, unexpected, requests, contentRequests }
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
    const sidebar = page.locator('#learner-goal-sidebar')
    for (const subject of ['Mathematik', 'Physik']) {
      const subjectLabel = sidebar.getByText(subject, { exact: true })
      // Legacy content can render before the saved sidebar scope has loaded.
      await subjectLabel.waitFor({ state: 'visible', timeout: 20_000 })
      assert.equal(await subjectLabel.count(), 1,
        `${subject} must appear once even when the saved composition scope has the same title.`)
    }
    const overview = page.getByTestId('learner-plan-today-overview')
    // The cockpit shows the backend text; it never fabricates completions of its own.
    for (const [key, subject] of [['mathematik', 'Mathematik'], ['physik', 'Physik']] as const) {
      const row = overview.getByTestId(`learner-plan-subject-${key}`)
      await row.getByTestId('learner-plan-period-gauge').getByText('0 von 1', { exact: true }).waitFor()
      await row.getByText('im Plan').first().waitFor()
      assert.ok(subject.length > 0)
    }
    assert.equal(await overview.getByRole('progressbar').count(), 0,
      'no locally derived progress bar may survive in the cockpit')
  }

  // A new learner's SSE update must survive an older learner's in-flight
  // refresh. Old replies must never restore that learner's focus or status.
  {
    const h = await open()
    await waitReady(h.page, mathTitle)
    const oldStateGate = gate()
    h.replies[learnerA]!.state = oldStateGate.promise
    const oldStateRequest = h.page.waitForRequest(request => (
      new URL(request.url()).pathname === `/api/ui/learners/${learnerA}/state`
    ))
    await emit(h.page, learnerA, 'FULL_REFRESH')
    await oldStateRequest
    await h.page.evaluate(() => {
      (window as unknown as { startupFixtureActiveGoals: string[] }).startupFixtureActiveGoals = []
    })
    await h.page.getByTestId('fixture-switch-learner').click()
    await waitReady(h.page, physicsTitle)
    const bStateReads = () => h.requests.filter(r => r.learnerId === learnerB && r.endpoint === 'state').length
    const bPlanReads = () => h.requests.filter(r => r.learnerId === learnerB && r.endpoint === 'plans').length
    assert.equal(bStateReads(), 1, 'B has exactly one initial state read while A is still pending')
    assert.equal(bPlanReads(), 1, 'B has exactly one initial plan read while A is still pending')
    const nextTitle = 'Kräfte und Bewegung erklären'
    h.replies[learnerB]!.state = { body: {
      activeGoal: { id: 'physics-lower' }, frontier: [],
      goals: { planned: [{ id: 'physics-lower' }], mastered_count: 1, total_count: 4,
        personalized: { mastered_atomic: 1, total_atomic: 4 } },
      stateMachine: { activeGoal: { id: 'physics-lower' }, goalOptions: [], requiredAction: null },
    } }
    h.replies[learnerB]!.plans = { body: {
      ...(plans().body as object), status: {
        ...planStatusBody, activeGoal: { title: nextTitle, announcement: `Dein aktives Lernziel: ${nextTitle}` },
        subjects: planStatusBody.subjects.map(subject => subject.subjectKey === 'physik' ? {
          ...subject, periodText: 'Tagesziel 1 von 1',
          periodGauge: { completed: 1, target: 1, needlePosition: 1 },
        } : subject),
      },
    } }
    await emit(h.page, learnerB, 'FULL_REFRESH')
    await settledFrame(h.page)
    assert.equal(bStateReads(), 1, 'B event waits for the one in-flight A refresh')
    const newStateResponse = h.page.waitForResponse(response => (
      new URL(response.url()).pathname === `/api/ui/learners/${learnerB}/state`
    ), { timeout: 5000 })
    oldStateGate.resolve({ body: {
      activeGoal: { id: 'math-lower' }, frontier: [],
      goals: { planned: [{ id: 'math-lower' }], mastered_count: 999, total_count: 999 },
      stateMachine: { activeGoal: { id: 'math-lower' }, goalOptions: [], requiredAction: 'setPersonalization' },
    } })
    await newStateResponse
    const banner = h.page.getByTestId('learner-active-goal-banner')
    await banner.getByText(`Dein aktives Lernziel: ${nextTitle}`, { exact: true }).waitFor()
    await h.page.getByTestId('learner-plan-subject-physik').getByTestId('learner-plan-period-gauge')
      .getByText('1 von 1', { exact: true }).waitFor()
    await settledFrame(h.page)
    assert.equal(bStateReads(), 2, 'exactly one queued B state refresh follows its initial read')
    assert.equal(bPlanReads(), 2, 'the same queued B refresh reads its authoritative plan once')
    assert.equal(h.requests.filter(r => r.learnerId === learnerB && r.endpoint === 'profile').length, 1,
      'draining B does not duplicate its stable profile read')
    const activeTexts = await h.page.evaluate(() => (
      window as unknown as { startupFixtureActiveGoals: string[] }
    ).startupFixtureActiveGoals)
    assert(!activeTexts.some(text => text.includes(mathTitle) || text.includes('Lineare Gleichungen lösen')),
      'neither the old A banner nor its late goal may flash after switching to B')
    const texts = await h.page.evaluate(() => (
      window as unknown as { startupFixtureTexts: string[] }
    ).startupFixtureTexts)
    assert(!texts.some(text => text.includes('999')), 'late A counters must not flash in B')
    await assertNoFalseSetup(h.page)
    assert.deepEqual(h.unexpected, [])
    assert.deepEqual(h.errors, [])
    await h.context.close()
    console.log('Cross-learner in-flight SSE regression passed: one queued B refresh, no A UI leak.')
  }

  console.log('Focused cross-learner browser regression passed')
} finally {
  for (const pending of pendingGates) pending.resolve({ status: 503, body: { error: 'Fixture cleanup' } })
  await Promise.all(contexts.map((context) => context.close()))
  await browser?.close()
  await server.close()
}
