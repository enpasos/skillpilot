import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'
import { navigateToLearnerLearningPlanGoal } from '../src/utils/learnerLearningPlanNavigation'

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
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
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
  await page.getByRole('button', { name: 'Einstellungen öffnen' }).click()
  await page.waitForFunction(() => {
    const labels = Array.from(document.querySelectorAll('label'))
    const label = labels.find((candidate) => candidate.textContent?.includes('Nach Plan lernen'))
    return (label?.querySelector('input[type="checkbox"]') as HTMLInputElement | null)?.checked === true
  })
  await page.getByRole('button', { name: 'Fertig' }).click()
  await page.getByTestId('plan-mode-applied').filter({ hasText: 'true' }).waitFor()

  assert.equal(await page.getByTestId('cockpit-fixture').locator('article').count(), 2, 'Math and Physics remain separate subject-plan cards')
  await page.getByTestId('cockpit-fixture').getByRole('heading', { name: 'Mein Plan für Mathematik' }).waitFor()
  const physicsCard = page.getByTestId('learner-plan-today-physics/sek-ii')
  await physicsCard.getByRole('heading', { name: 'Mein Plan für Physik' }).waitFor()
  assert.equal(
    await physicsCard.locator('[data-testid="learner-plan-pace-neutral"] svg').count(),
    1,
    'the learner cockpit renders the neutral seven-day gauge',
  )
  assert.equal(
    await page.getByTestId('cockpit-fixture').getByRole('button', { name: 'Nächstes Planziel starten' }).count(),
    1,
    'only the actionable subject plan exposes the explicit transition',
  )

  await page.getByRole('button', { name: 'Automatischen Plan-Handoff simulieren' }).click()
  await page.getByTestId('cockpit-route').filter({
    hasText: '/learner/physics-auto-goal?l=physics%2Fsek-ii',
  }).waitFor()
  const automaticRoute = new URL(
    await page.getByTestId('cockpit-route').textContent() ?? '',
    'https://skillpilot.test',
  )
  assert.equal(automaticRoute.pathname, '/learner/physics-auto-goal')
  assert.equal(automaticRoute.searchParams.get('l'), 'physics/sek-ii')

  await physicsCard.getByRole('button', { name: 'Nächstes Planziel starten' }).click()
  await page.getByTestId('cockpit-route').filter({
    hasText: '/learner/physics-goal-1?l=physics%2Fsek-ii',
  }).waitFor()
  const routeText = await page.getByTestId('cockpit-route').textContent() ?? ''
  const routeUrl = new URL(routeText, 'https://skillpilot.test')
  assert.equal(routeUrl.pathname, '/learner/physics-goal-1')
  assert.equal(routeUrl.searchParams.get('l'), 'physics/sek-ii')

  const inFlightFixture = page.getByTestId('in-flight-refresh-fixture')
  assert.equal(
    await inFlightFixture.getByRole('button', { name: 'Nächstes Planziel starten' }).count(),
    1,
    'the stored plan is actionable before refresh',
  )
  await inFlightFixture.getByRole('button', { name: 'Aktualisierung starten' }).click()
  await inFlightFixture.getByTestId('in-flight-status').filter({ hasText: 'loading' }).waitFor()
  await inFlightFixture.getByRole('heading', { name: 'Mein Plan für Mathematik' }).waitFor()
  assert.equal(
    await inFlightFixture.getByRole('button', { name: 'Nächstes Planziel starten' }).count(),
    0,
    'the old plan stays visible but cannot be started while refresh is pending',
  )
  await inFlightFixture.getByRole('button', { name: 'Aktualisierung abschließen' }).click()
  await inFlightFixture.getByTestId('in-flight-status').filter({ hasText: 'ready' }).waitFor()
  assert.equal(
    await inFlightFixture.getByRole('button', { name: 'Nächstes Planziel starten' }).count(),
    1,
    'the action returns only after the deferred refresh completes',
  )
  assert.equal(errors.length, 0, `learner plan Cockpit browser errors:\n${errors.join('\n')}`)

  console.log('learner plan Cockpit browser regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
