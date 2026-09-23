import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Locator } from 'playwright'

import { navigateToLearnerLearningPlanGoal } from '../src/utils/learnerLearningPlanNavigation'
import { startViteTestServer } from './viteTestServer'

const assertMobileSubjectLayout = async (overview: Locator, viewport: string) => {
  const rows = await overview.locator('[data-testid^="learner-plan-subject-"]').evaluateAll((elements) => elements.map((row) => {
    const period = row.querySelector('[data-testid="learner-plan-period-gauge"]')!.getBoundingClientRect()
    const balance = row.querySelector('[data-testid="learner-plan-balance-gauge"]')!.getBoundingClientRect()
    const switchButton = row.querySelector('[data-testid="learner-plan-switch"]')?.getBoundingClientRect()
    return {
      subject: row.getAttribute('data-testid'),
      periodWidth: period.width,
      balanceWidth: balance.width,
      periodTop: period.top,
      balanceTop: balance.top,
      periodBottom: period.bottom,
      balanceBottom: balance.bottom,
      switchTop: switchButton?.top ?? null,
      switchWidth: switchButton?.width ?? null,
      gaugeSpan: balance.right - period.left,
      scrollWidth: row.scrollWidth,
      clientWidth: row.clientWidth,
    }
  }))
  assert.equal(rows.length, 2, `${viewport}: both subject rows render`)
  for (const row of rows) {
    assert.ok(row.periodWidth >= 110 && row.balanceWidth >= 110,
      `${viewport}: ${row.subject} gauges stay readable: ${JSON.stringify(row)}`)
    assert.ok(Math.abs(row.periodTop - row.balanceTop) <= 2,
      `${viewport}: ${row.subject} gauges remain side by side: ${JSON.stringify(row)}`)
    assert.ok(row.scrollWidth <= row.clientWidth,
      `${viewport}: ${row.subject} does not overflow: ${JSON.stringify(row)}`)
    if (row.switchTop !== null && row.switchWidth !== null) {
      assert.ok(row.switchTop >= Math.max(row.periodBottom, row.balanceBottom) + 4,
        `${viewport}: subject switch appears below both gauges: ${JSON.stringify(row)}`)
      assert.ok(row.switchWidth >= row.gaugeSpan - 2,
        `${viewport}: subject switch uses the mobile row width: ${JSON.stringify(row)}`)
    }
  }
}

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
  await page.route('**/api/ui/learners/history-fixture/history', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { goalId: 'recorded', timestamp: '2026-09-10T23:30:00Z', value: 1, source: 'completion_event' },
      { goalId: 'legacy', timestamp: '2026-09-09T12:00:00Z', value: 1, source: 'legacy_last_updated' },
      { goalId: 'old-server', timestamp: '2026-09-08T12:00:00Z', value: 1 },
    ]),
  }))
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
  await overview.getByTestId('learner-plan-subject-mathematik').getByText('0 von 2 Zielen', { exact: true }).waitFor()
  assert.equal(await overview.getByTestId(/learner-plan-subject-/u).count(), 2)
  await overview.getByTestId('learner-plan-subject-mathematik').getByText('0 von 2 Zielen', { exact: true }).waitFor()
  const physicsPlanRow = overview.getByTestId('learner-plan-subject-physik')
  await physicsPlanRow.getByText('0 von 2 Zielen', { exact: true }).waitFor()
  assert.equal(await overview.getByTestId('learner-plan-period-gauge').count(), 2)
  assert.equal(await overview.getByTestId('learner-plan-balance-gauge').count(), 2)
  assert.equal(await overview.getByRole('img', { name: /0 von 2 Zielen/u }).count(), 2)
  assert.equal(await physicsPlanRow.getByTestId('learner-plan-period-gauge').getAttribute('data-needle-position'), '0')
  assert.equal(await physicsPlanRow.getByTestId('learner-plan-balance-gauge').getAttribute('data-needle-position'), '-0.2')
  assert.equal(await overview.getByText('Tempo der letzten 7 Tage').count(), 0)
  assert.equal(await overview.getByText('Nächstes Planziel starten').count(), 0)
  const overviewHeight = await overview.evaluate((element) => element.getBoundingClientRect().height)
  // Two readable dials per subject add height to the former text-only card.
  assert.ok(overviewHeight < 1020, `closed mobile today overview should stay readable, got ${overviewHeight}px`)
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
  await assertMobileSubjectLayout(overview, '390px cockpit')
  await page.setViewportSize({ width: 320, height: 640 })
  const narrowLayout = await overview.evaluate((element) => ({
    viewportWidth: window.innerWidth,
    right: element.getBoundingClientRect().right,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }))
  assert.ok(narrowLayout.right <= narrowLayout.viewportWidth)
  assert.ok(narrowLayout.scrollWidth <= narrowLayout.clientWidth,
    `narrow mobile overview should not overflow horizontally: ${JSON.stringify(narrowLayout)}`)
  await assertMobileSubjectLayout(overview, '320px cockpit')
  await page.setViewportSize({ width: 390, height: 844 })
  await physicsPlanRow.getByLabel('Plandetails: Physik').click()
  await physicsPlanRow.getByText('0 von 2 Zielen', { exact: true }).waitFor()
  // Plan details describe the schedule only; the extra-work tally is gone from the status.
  assert.equal(await physicsPlanRow.getByText(/offenes Planziel|offene Planziele/u).count(), 0)
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
  assert.equal(await overview.getByRole('button', { name: 'Weiterlernen' }).count(), 0)
  assert.equal(await overview.getByRole('button', { name: 'Einstellungen öffnen' }).count(), 0)
  await page.getByTestId('learner-current-goal').waitFor()
  assert.match(await page.getByTestId('learner-current-goal').innerText(), /math-goal-1/u,
    'reconciliation routes to the active learning content without a continue button')

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
  const inFlightSwitch = inFlightFixture.getByRole('button', { name: 'Zu Mathematik wechseln' })
  assert.equal(await inFlightSwitch.isEnabled(), true, 'the stored plan is actionable before refresh')
  await inFlightFixture.getByRole('button', { name: 'Aktualisierung starten' }).click()
  await inFlightFixture.getByTestId('in-flight-status').filter({ hasText: 'loading' }).waitFor()
  await inFlightFixture.getByRole('heading', { name: 'Heute' }).waitFor()
  assert.equal(await inFlightSwitch.isDisabled(), true, 'the visible old plan is fail-closed while refresh is pending')
  await inFlightFixture.getByRole('button', { name: 'Aktualisierung abschließen' }).click()
  await inFlightFixture.getByTestId('in-flight-status').filter({ hasText: 'ready' }).waitFor()
  assert.equal(await inFlightSwitch.isEnabled(), true, 'the action returns after the refresh completes')
  assert.equal(reconcileRequests, 1, 'later rerenders and retries do not repeat first-start reconcile')

  const progressFixture = page.getByTestId('daily-progress-fixture')
  await progressFixture.getByText('0 von 2 Zielen', { exact: true }).waitFor()
  assert.equal(await progressFixture.getByTestId('learner-plan-period-gauge').getAttribute('data-needle-position'), '0')
  assert.equal(await progressFixture.getByRole('progressbar').count(), 0,
    'the cockpit renders the backend status, never a locally derived progress bar')
  await progressFixture.getByRole('button', { name: 'Tagespensum abschließen' }).click()
  await progressFixture.getByText('2 von 2 Zielen', { exact: true }).waitFor()
  assert.equal(await progressFixture.getByTestId('learner-plan-period-gauge').getAttribute('data-needle-position'), '1')
  assert.equal(await progressFixture.getByTestId('voluntary-start-count').textContent(), '0', 'reaching the period target starts no extra work')
  await progressFixture.getByRole('button', { name: 'Zu Mathematik wechseln' }).click()
  assert.equal(await progressFixture.getByTestId('voluntary-start-count').textContent(), '1', 'extra work requires an explicit click')
  await progressFixture.getByRole('button', { name: 'Zusätzliches Ziel abschließen' }).click()
  await progressFixture.getByText('1 Lernziel vorgearbeitet', { exact: false }).first().waitFor()
  const completedLayout = await progressFixture.getByTestId('learner-plan-subject-mathematik').evaluate((row) => {
    const period = row.querySelector('[data-testid="learner-plan-period-gauge"]')!.getBoundingClientRect()
    const balance = row.querySelector('[data-testid="learner-plan-balance-gauge"]')!.getBoundingClientRect()
    const button = row.querySelector('button')!.getBoundingClientRect()
    return { periodWidth: period.width, balanceWidth: balance.width,
      dialBottom: Math.max(period.bottom, balance.bottom), buttonTop: button.top }
  })
  assert.ok(completedLayout.periodWidth >= 110 && completedLayout.balanceWidth >= 110,
    `both gauges stay readable on mobile: ${JSON.stringify(completedLayout)}`)
  assert.ok(completedLayout.buttonTop >= completedLayout.dialBottom,
    'the switch action follows the mobile gauges without overlap')
  await progressFixture.getByTestId('learner-plan-today-overview').screenshot({
    path: fileURLToPath(new URL('../../tmp/learner-plan-daily-quota-mobile.png', import.meta.url)),
  })
  await progressFixture.getByRole('button', { name: 'Historie öffnen' }).evaluate((element: HTMLButtonElement) => element.click())
  await page.getByRole('heading', { name: 'Lerngeschwindigkeit' }).waitFor()
  await page.getByText('Abgeschlossen am: 11.09.2026').waitFor()
  await page.getByText('Letzte Aktualisierung: 09.09.2026').waitFor()
  await page.getByText('Letzte Aktualisierung: 08.09.2026').waitFor()
  await page.getByText('Erfasste Abschlüsse / Woche (letzte 8 Wochen)').waitFor()
  assert.equal(errors.length, 0, `learner plan Cockpit browser errors:\n${errors.join('\n')}`)

  console.log('learner plan Cockpit browser regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
