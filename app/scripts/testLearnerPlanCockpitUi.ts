import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'

import { navigateToLearnerLearningPlanGoal } from '../src/utils/learnerLearningPlanNavigation'
import { startViteTestServer } from './viteTestServer'

let unsafeLocalSelection: string | null = null
assert.equal(
  navigateToLearnerLearningPlanGoal(
    'math/sek-i',
    { landscapeId: 'physics/sek-ii', activeGoalId: 'physics-goal' },
    { selectGoal: (goalId) => { unsafeLocalSelection = goalId } },
  ),
  false,
  'cross-subject navigation fails closed without a landscape-aware handler',
)
assert.equal(unsafeLocalSelection, null)

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/learnerPlanCockpitUi.html',
  { plugins: [tailwindcss()] },
)

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const page = await browser.newPage({ locale: 'de-DE', viewport: { width: 390, height: 844 } })
  const errors: string[] = []
  let reconcileRequests = 0
  const switchRequests = new Map<string, number>()
  const learnerMutationPaths: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('status of 409')) {
      errors.push(message.text())
    }
  })
  page.on('request', (request) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) return
    const pathname = new URL(request.url()).pathname
    if (pathname.startsWith('/api/ui/learners/learner-42/')) {
      learnerMutationPaths.push(pathname)
    }
  })
  await page.route('**/api/ui/curriculum-catalog', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      catalogApiVersion: '1.2',
      generationSha256: '0'.repeat(64),
      packages: [],
      rootLandscapeIds: [],
      landscapes: [],
      views: [],
      offerings: [],
      decks: [],
      resources: [],
      sourceEvidence: [],
    }),
  }))
  await page.route('**/api/ui/learners/learner-42/learning-plans/reconcile', async (route) => {
    reconcileRequests += 1
    assert.deepEqual(route.request().postDataJSON(), { asOf: '2026-09-04' })
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        planId: 'math-plan',
        revision: 4,
        landscapeId: 'math/sek-i',
        focusGoalId: 'math-root',
        activeGoalId: 'math-goal-1',
        changed: true,
        state: { stateMachine: { activeGoal: { id: 'math-goal-1' } } },
      }),
    })
  })
  await page.route('**/api/ui/learners/learner-42/learning-plans/*/switch', async (route) => {
    const match = /learning-plans\/([^/]+)\/switch$/u.exec(new URL(route.request().url()).pathname)
    const planId = decodeURIComponent(match?.[1] ?? '')
    const requestNumber = (switchRequests.get(planId) ?? 0) + 1
    switchRequests.set(planId, requestNumber)
    assert.deepEqual(route.request().postDataJSON(), {
      expectedRevision: 4,
      asOf: '2026-09-04',
    })

    if (planId === 'math-plan' && requestNumber === 1) {
      await route.fulfill({ status: 409, body: 'Plan revision conflict' })
      return
    }

    const physics = planId === 'physics-plan'
    if (physics) {
      await new Promise((resolve) => setTimeout(resolve, 80))
    }
    const landscapeId = physics ? 'physics/sek-ii' : 'math/sek-i'
    const activeGoalId = physics ? 'physics-goal-1' : 'math-goal-1'
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        planId,
        revision: 4,
        landscapeId,
        focusGoalId: physics ? 'physics-root' : 'math-root',
        activeGoalId,
        changed: true,
        state: { stateMachine: { activeGoal: { id: activeGoalId } } },
      }),
    })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/learnerPlanCockpitUi.html`)
  await page.getByTestId('plan-mode-backend-prop').filter({ hasText: 'true' }).waitFor()
  const followLearningPlansCheckbox = page.getByRole('checkbox', { name: /^Nach Plan lernen\b/u })
  const autoPilotCheckbox = page.getByRole('checkbox', { name: /^Autopilot aktivieren\b/u })
  await page.waitForFunction(() => {
    const labels = Array.from(document.querySelectorAll('label'))
    const label = labels.find((candidate) => candidate.textContent?.includes('Nach Plan lernen'))
    return (label?.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked === true
  })
  assert.equal(await autoPilotCheckbox.isDisabled(), true, 'plan mode visibly pauses the retained Autopilot preference')
  await page.getByText(/Im Planmodus pausiert/u).waitFor()
  await followLearningPlansCheckbox.click()
  assert.equal(await followLearningPlansCheckbox.isChecked(), false)
  assert.equal(await autoPilotCheckbox.isEnabled(), true, 'turning plan mode off restores the Autopilot control')
  await page.locator('.fixed.inset-0').getByRole('button').first().click()
  await page.getByRole('button', { name: 'Einstellungen öffnen' }).first().click()
  await page.waitForFunction(() => {
    const labels = Array.from(document.querySelectorAll('label'))
    const label = labels.find((candidate) => candidate.textContent?.includes('Nach Plan lernen'))
    return (label?.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked === true
  })
  await page.getByRole('button', { name: 'Fertig' }).click()
  await page.getByTestId('plan-mode-applied').filter({ hasText: 'true' }).waitFor()

  const overview = page.getByTestId('cockpit-fixture').getByTestId('learner-plan-today-overview')
  await overview.getByRole('heading', { name: 'Heute' }).waitFor()
  await overview.getByText('5 Planziele sind bis heute noch offen.').waitFor()
  await overview.getByText('Rückstände aus früheren Tagen sind mitgezählt.').waitFor()
  assert.equal(await overview.getByTestId(/learner-plan-subject-/u).count(), 2)
  await overview.getByTestId('learner-plan-subject-math/sek-i').getByText('2 Ziele offen').waitFor()
  const physicsPlanRow = overview.getByTestId('learner-plan-subject-physics/sek-ii')
  await physicsPlanRow.getByText('3 Ziele offen').waitFor()
  assert.equal(await overview.getByText('Tempo der letzten 7 Tage').count(), 0)
  assert.equal(await overview.getByText('Nächstes Planziel starten').count(), 0)
  const overviewHeight = await overview.evaluate((element) => element.getBoundingClientRect().height)
  assert.ok(overviewHeight < 620, `closed mobile today overview should stay compact, got ${overviewHeight}px`)
  const mobileLayout = await overview.evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return {
      left: bounds.left,
      right: bounds.right,
      viewportWidth: window.innerWidth,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
    }
  })
  assert.ok(mobileLayout.left >= 0 && mobileLayout.right <= mobileLayout.viewportWidth)
  assert.ok(
    mobileLayout.scrollWidth <= mobileLayout.clientWidth,
    `mobile today overview should not overflow horizontally (${mobileLayout.scrollWidth}px > ${mobileLayout.clientWidth}px)`,
  )
  await physicsPlanRow.getByLabel('Plandetails: Physik').click()
  await physicsPlanRow.getByText('2 offen · 0 beherrscht').waitFor()
  await physicsPlanRow.getByText('1 offenes Ziel aus früheren Tagen').waitFor()
  await physicsPlanRow.getByLabel('Plandetails: Physik').click()

  const mathPlanLabel = overview.getByText('Mathematik bis Klasse 10')
  assert.equal(await mathPlanLabel.isVisible(), false, 'subject details start collapsed')
  await overview.getByLabel('Plandetails: Mathematik').click()
  assert.equal(await mathPlanLabel.isVisible(), true, 'plan details remain available on demand')
  await page.getByTestId('cockpit-route').filter({
    hasText: '/learner/math-goal-1?l=math%2Fsek-i',
  }).waitFor()
  await page.waitForTimeout(120)
  assert.equal(reconcileRequests, 1, 'the first due goal is reconciled exactly once for the plan revision/day')
  await overview.getByText('Aktuelles Fach').waitFor()
  await overview.getByText(/Du lernst gerade · Mathematik/u).waitFor()
  assert.equal(await overview.getByRole('button', { name: 'Weiterlernen' }).count(), 1)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(() => window.scrollY === 0)
  await overview.getByRole('button', { name: 'Weiterlernen' }).click()
  await page.getByTestId('learner-current-goal').waitFor()
  assert.equal(
    await page.getByTestId('learner-current-goal').evaluate((element) => document.activeElement === element),
    true,
    'continue scrolls to and focuses the active learning goal',
  )
  const continueViewport = await page.getByTestId('learner-current-goal').evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return { top: bounds.top, bottom: bounds.bottom, viewportHeight: window.innerHeight, scrollY: window.scrollY }
  })
  assert.ok(continueViewport.scrollY > 500, `continue should move the document, got scrollY=${continueViewport.scrollY}`)
  assert.ok(
    continueViewport.top >= 0 && continueViewport.bottom <= continueViewport.viewportHeight,
    'continue keeps the focused goal visible in the viewport',
  )

  const physicsSwitch = overview.getByRole('button', { name: 'Zu Physik wechseln' })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(() => window.scrollY === 0)
  await physicsSwitch.evaluate((element: HTMLButtonElement) => {
    element.click()
    element.click()
  })
  await page.getByTestId('cockpit-route').filter({
    hasText: '/learner/physics-goal-1?l=physics%2Fsek-ii',
  }).waitFor()
  assert.equal(switchRequests.get('physics-plan'), 1, 'a fast double click issues one switch request')
  assert.equal(
    await page.getByTestId('mastery-snapshot').textContent(),
    'math-goal-1:0.5;physics-goal-1:0',
    'switching subjects does not alter mastery',
  )
  await overview.getByText(/Du lernst gerade · Physik/u).waitFor()
  await page.waitForFunction(() => document.activeElement?.getAttribute('data-testid') === 'learner-current-goal')
  const switchViewport = await page.getByTestId('learner-current-goal').evaluate((element) => {
    const bounds = element.getBoundingClientRect()
    return { top: bounds.top, bottom: bounds.bottom, viewportHeight: window.innerHeight, scrollY: window.scrollY }
  })
  assert.ok(switchViewport.scrollY > 500, `subject switch should move the document, got scrollY=${switchViewport.scrollY}`)
  assert.ok(
    switchViewport.top >= 0 && switchViewport.bottom <= switchViewport.viewportHeight,
    'subject switch keeps the focused goal visible in the viewport',
  )
  assert.deepEqual(
    learnerMutationPaths,
    [
      '/api/ui/learners/learner-42/learning-plans/reconcile',
      '/api/ui/learners/learner-42/learning-plans/physics-plan/switch',
    ],
    'first start and subject switch use only their dedicated learning-plan mutations',
  )

  await overview.getByRole('button', { name: 'Zu Mathematik wechseln' }).click()
  await overview.getByRole('alert').filter({ hasText: 'Fachplan wurde inzwischen geändert' }).waitFor()
  assert.match(await page.getByTestId('cockpit-route').textContent() ?? '', /physics-goal-1/u)
  assert.equal(await page.getByTestId('mastery-snapshot').textContent(), 'math-goal-1:0.5;physics-goal-1:0')
  await overview.getByRole('button', { name: 'Erneut versuchen' }).click()
  await page.getByTestId('retry-count').filter({ hasText: '1' }).waitFor()
  await overview.getByRole('button', { name: 'Zu Mathematik wechseln' }).click()
  await page.getByTestId('cockpit-route').filter({
    hasText: '/learner/math-goal-1?l=math%2Fsek-i',
  }).waitFor()
  assert.equal(switchRequests.get('math-plan'), 2, 'a conflict remains recoverable after an explicit retry')
  assert.equal(
    learnerMutationPaths.some((pathname) => /mastery|active-goal|planned-goal/u.test(pathname)),
    false,
    'switching and retrying never call a mastery or legacy goal-selection mutation',
  )

  const inFlightFixture = page.getByTestId('in-flight-refresh-fixture')
  const inFlightContinue = inFlightFixture.getByRole('button', { name: 'Weiterlernen' })
  assert.equal(await inFlightContinue.isEnabled(), true, 'the stored plan is actionable before refresh')
  await inFlightFixture.getByRole('button', { name: 'Aktualisierung starten' }).click()
  await inFlightFixture.getByTestId('in-flight-status').filter({ hasText: 'loading' }).waitFor()
  await inFlightFixture.getByRole('heading', { name: 'Heute' }).waitFor()
  assert.equal(await inFlightContinue.isDisabled(), true, 'the visible old plan is fail-closed while refresh is pending')
  await inFlightFixture.getByRole('button', { name: 'Aktualisierung abschließen' }).click()
  await inFlightFixture.getByTestId('in-flight-status').filter({ hasText: 'ready' }).waitFor()
  assert.equal(await inFlightContinue.isEnabled(), true, 'the action returns after the refresh completes')
  assert.equal(reconcileRequests, 1, 'later rerenders and retries do not repeat first-start reconcile')
  assert.equal(errors.length, 0, `learner plan Cockpit browser errors:\n${errors.join('\n')}`)

  console.log('learner plan Cockpit browser regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
