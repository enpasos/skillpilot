import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Route } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)), 'scripts/fixtures/coursePlanLearnerProgressUi.html', { plugins: [tailwindcss()] })
let browser: Browser | null = null
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  let completedA = 1
  let failing = false
  let inconsistent = false
  let holdNext = false
  const held: { route: Route; body: string }[] = []
  const requests: { learnerId: string; landscapeId: string; method: string }[] = []
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    assert.match(url.pathname, /^\/api\/ui\/learners\/learner-[a-f]\/planning-scope$/)
    const learnerId = url.pathname.split('/')[4]
    const landscapeId = url.searchParams.get('landscapeId')!
    requests.push({ learnerId, landscapeId, method: route.request().method() })
    if (failing) { await route.fulfill({ status: 503, body: '{}' }); return }
    const total = landscapeId === 'physics' ? 25 : learnerId === 'learner-a' ? 601 : 30
    const completed = landscapeId === 'physics' ? 0 : learnerId === 'learner-a' ? completedA : 6
    const ids = Array.from({ length: total }, (_, index) => index === 0 ? 'orientation-goal' : `goal-${index}`)
    const body = JSON.stringify({
      curriculumId: 'synthetic-curriculum', landscapeId,
      scopeAtomicGoalIds: ids, openAtomicGoalIds: ids.slice(completed),
      totalAtomicGoalCount: total, masteredAtomicGoalCount: inconsistent ? total + 1 : completed,
      capturedAt: '2026-09-21T12:00:00Z',
    })
    if (holdNext) { holdNext = false; held.push({ route, body }); return }
    await route.fulfill({ status: 200, contentType: 'application/json', body })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/coursePlanLearnerProgressUi.html`)
  const panel = page.getByTestId('course-plan-learner-progress')
  await panel.getByText('1 von 601 Lernzielen abgeschlossen', { exact: true }).waitFor()
  assert.match(await panel.innerText(), /Persönlicher Fachumfang/)
  assert.match(await panel.innerText(), /einschließlich abgeschlossener Orientierungsziele/)
  assert(!/598|Unterrichts-IST|bestätigt|erreicht am|capturedAt/.test(await panel.innerText()), 'saved progress must not use the stable plan denominator, manual coverage or estimated completion dates')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'mobile layout remains within viewport')
  assert.equal(await panel.locator('progress').getAttribute('value'), '1')

  completedA = 2
  await page.getByRole('button', { name: 'Refresh event', exact: true }).click()
  await panel.getByText('2 von 601 Lernzielen abgeschlossen', { exact: true }).waitFor()
  const countBeforeUnrelatedEvent = requests.length
  await page.getByRole('button', { name: 'Unrelated event', exact: true }).click()
  await page.waitForTimeout(200)
  assert.equal(requests.length, countBeforeUnrelatedEvent, 'unrelated learner changes do not reload this scope')

  failing = true
  await panel.getByRole('button', { name: 'Aktualisieren', exact: true }).click()
  await panel.getByText('Lernfortschritt derzeit nicht verfügbar. Bitte erneut aktualisieren.', { exact: true }).waitFor()
  assert(!/\d+ von \d+/.test(await panel.innerText()), 'read failure must not masquerade as zero or stale mastery')
  failing = false
  inconsistent = true
  await panel.getByRole('button', { name: 'Aktualisieren', exact: true }).click()
  await page.waitForTimeout(150)
  await panel.getByText('Lernfortschritt derzeit nicht verfügbar. Bitte erneut aktualisieren.', { exact: true }).waitFor()
  assert.equal(await panel.locator('progress').count(), 0, 'inconsistent server totals fail closed')
  inconsistent = false

  holdNext = true
  await panel.getByRole('button', { name: 'Aktualisieren', exact: true }).click()
  await panel.getByText('Lernfortschritt wird geladen …', { exact: true }).waitFor()
  assert(!/\d+ von \d+/.test(await panel.innerText()), 'loading is not zero')
  await page.waitForFunction(() => document.querySelector('[data-testid="course-plan-learner-progress"]')?.textContent?.includes('wird geladen'))
  await page.getByRole('button', { name: 'Switch learner', exact: true }).click()
  await panel.getByText('6 von 30 Lernzielen abgeschlossen', { exact: true }).waitFor()
  assert.equal(held.length, 1)
  const stale = held.shift()!
  await stale.route.fulfill({ status: 200, contentType: 'application/json', body: stale.body }).catch(() => undefined)
  await page.waitForTimeout(100)
  assert(!/601|Person A/.test(await panel.innerText()), 'late response from the previous learner must not leak into the new profile')

  await page.getByRole('button', { name: 'Switch subject', exact: true }).click()
  await panel.getByText('0 von 25 Lernzielen abgeschlossen', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Switch language', exact: true }).click()
  await panel.getByText('0 of 25 learning goals completed', { exact: true }).waitFor()
  assert.match(await panel.innerText(), /Personal subject scope/)
  await page.getByRole('button', { name: 'Switch subject', exact: true }).click()
  await panel.getByText('6 of 30 learning goals completed', { exact: true }).waitFor()

  // Timeout must be an explicit unknown, then allow a retry.
  await page.clock.install()
  holdNext = true
  await panel.getByRole('button', { name: 'Refresh', exact: true }).click()
  await panel.getByText('Loading learning progress …', { exact: true }).waitFor()
  await page.clock.fastForward(15_100)
  await panel.getByText('Learning progress is currently unavailable. Please refresh again.', { exact: true }).waitFor()
  const timedOut = held.shift()!
  await timedOut.route.fulfill({ status: 200, contentType: 'application/json', body: timedOut.body }).catch(() => undefined)
  await panel.getByRole('button', { name: 'Refresh', exact: true }).click()
  await panel.getByText('6 of 30 learning goals completed', { exact: true }).waitFor()

  await page.getByRole('button', { name: 'Show class', exact: true }).click()
  await panel.getByTestId('learner-progress-learner-f').getByText('6 of 30 learning goals completed', { exact: true }).waitFor()
  assert.equal(await panel.locator('li').count(), 6)
  assert.equal(await panel.getByText('2 of 601 learning goals completed', { exact: true }).count(), 1)
  assert.equal(await panel.getByText('6 of 30 learning goals completed', { exact: true }).count(), 5)
  assert(!/32 of 751/.test(await panel.innerText()), 'class totals must not merge different personal scopes')
  completedA = 3
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await page.clock.fastForward(110)
  await panel.getByText('3 of 601 learning goals completed', { exact: true }).waitFor()

  await page.getByRole('button', { name: 'Empty class', exact: true }).click()
  await panel.getByText('No learners assigned yet.', { exact: true }).waitFor()
  assert.equal(await panel.locator('li').count(), 0)
  assert(!/0 of 0/.test(await panel.innerText()), 'missing learners are not a zero progress result')
  assert(requests.every(({ method }) => method === 'GET'), 'the progress panel must be read-only')
  assert.equal(await page.evaluate(() => localStorage.length + sessionStorage.length), 0, 'fresh learner progress is never persisted as a plan baseline')
  assert.deepEqual(browserErrors, [])
  console.log('Saved learner progress UI tests passed')
  await context.close()
} finally {
  await browser?.close()
  await server.close()
}
