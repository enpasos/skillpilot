import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/learnerGoalFeedbackUi.html',
  { plugins: [tailwindcss()] },
)
const goalId = 'cf474eab-1379-4877-907e-58b0892ce734'
const binding = {
  bookId: 'de-gym-mathematik-bundesweit',
  goalId,
  edition: 'curricular-atomic-v1',
  goalFingerprint: `sha256:${'a'.repeat(64)}`,
  pageFingerprint: `sha256:${'b'.repeat(64)}`,
  bookDigest: `sha256:${'c'.repeat(64)}`,
  page: 42,
}

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const context = await browser.newContext({ locale: 'de-DE', viewport: { width: 390, height: 844 } })
  await context.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_theme', 'light')
  })
  await context.addCookies([{
    name: 'skillpilot_session',
    value: 'must-not-leave-the-cockpit',
    url: server.baseUrl,
  }])
  const page = await context.newPage()
  const errors: string[] = []
  const lookupUrls: URL[] = []
  const lookupCookieHeaders: Array<string | undefined> = []
  const lookupRefererHeaders: Array<string | undefined> = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.route('**/api/public/goal-feedback/v1/current-binding?*', async (route) => {
    lookupUrls.push(new URL(route.request().url()))
    lookupCookieHeaders.push(route.request().headers().cookie)
    lookupRefererHeaders.push(route.request().headers().referer)
    await new Promise((resolve) => setTimeout(resolve, 80))
    if (lookupUrls.length === 1) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify({ ...binding, bookId: new URL(route.request().url()).searchParams.get('bookId') }),
    })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/learnerGoalFeedbackUi.html?l=personalized-landscape&role=learner`)
  const feedbackButton = page.getByRole('button', { name: `Feedback zu diesem Lernziel: Natürliche Zahlen darstellen und am Zahlenstrahl verorten` })
  await feedbackButton.waitFor()
  assert.equal(
    await page.getByRole('button', { name: /Feedback zu diesem Lernziel/u }).count(),
    1,
    'only the ordinary published atomic goal exposes the Cockpit action',
  )
  assert.equal(lookupUrls.length, 0, 'browsing learning goals does not prefetch or consume the feedback rate limit')
  const buttonBox = await feedbackButton.boundingBox()
  assert(
    buttonBox && buttonBox.height >= 44,
    `the mobile action keeps a 44px touch target (${JSON.stringify(buttonBox)})`,
  )
  assert(buttonBox.x >= 0 && buttonBox.x + buttonBox.width <= 390, 'the action stays inside the 390px viewport')

  await feedbackButton.focus()
  await page.keyboard.press('Enter')
  await page.getByText('Feedback wird vorbereitet …', { exact: true }).waitFor()
  await page.getByRole('alert').filter({ hasText: 'gerade nicht verfügbar' }).waitFor()
  assert.equal(lookupUrls.length, 1, 'one deliberate action issues one binding lookup')

  await page.evaluate(() => {
    const button = document.querySelector<HTMLButtonElement>('button[aria-label^="Feedback zu diesem Lernziel"]')
    button?.click()
    button?.click()
  })
  await page.getByRole('heading', { name: 'Bestehender Feedbackweg' }).waitFor()
  assert.equal(lookupUrls.length, 2, 'the synchronous guard suppresses a rapid duplicate lookup')

  const lookupUrl = lookupUrls[1]
  assert.deepEqual([...lookupUrl.searchParams.keys()].sort(), ['bookId', 'goalId'])
  assert.equal(lookupUrl.searchParams.get('bookId'), binding.bookId)
  assert.equal(lookupUrl.searchParams.get('goalId'), goalId)
  assert(!/skillpilotId|learnerId|sessionId|chatSession/iu.test(lookupUrl.href))
  assert.deepEqual(lookupCookieHeaders, [undefined, undefined], 'the public lookup omits Cockpit cookies')
  assert.deepEqual(lookupRefererHeaders, [undefined, undefined], 'the public lookup omits the Cockpit referrer')

  const destinationSearch = await page.getByTestId('feedback-search').textContent() ?? ''
  const destinationParams = new URLSearchParams(destinationSearch)
  assert.deepEqual([...destinationParams.keys()].sort(), [
    'bookDigest',
    'bookId',
    'edition',
    'goalFingerprint',
    'goalId',
    'page',
    'pageFingerprint',
  ])
  assert.equal(destinationParams.get('bookId'), binding.bookId)
  assert.equal(destinationParams.get('goalId'), goalId)
  assert.equal(destinationParams.get('page'), String(binding.page))
  assert(!/skillpilotId|learnerId|sessionId|chatSession/iu.test(destinationSearch))
  const destinationState = await page.getByTestId('feedback-state').textContent() ?? ''
  assert.deepEqual(JSON.parse(destinationState), { goalFeedbackOrigin: 'learner-cockpit' })
  assert(!/skillpilotId|learnerId|sessionId|chatSession|returnUrl/iu.test(destinationState))
  for (const [subject, bookId] of [['chemistry', 'de-gym-chemie-lk'], ['biology', 'de-gym-biologie-gk']]) {
    await page.goto(`${server.baseUrl}/scripts/fixtures/learnerGoalFeedbackUi.html?subject=${subject}`)
    await feedbackButton.waitFor()
    assert.equal(await page.getByRole('button', { name: /Feedback zu diesem Lernziel/u }).count(), 1)
    const before = lookupUrls.length
    await feedbackButton.click()
    await page.getByRole('heading', { name: 'Bestehender Feedbackweg' }).waitFor()
    assert.equal(lookupUrls.length, before + 1)
    assert.equal(lookupUrls.at(-1)?.searchParams.get('bookId'), bookId)
    assert.equal(lookupCookieHeaders.at(-1), undefined)
    assert.equal(lookupRefererHeaders.at(-1), undefined)
    const params = new URLSearchParams(await page.getByTestId('feedback-search').textContent() ?? '')
    assert.deepEqual([...params.keys()].sort(), [...destinationParams.keys()].sort())
    assert.equal(params.get('bookId'), bookId)
    assert.equal(params.get('goalId'), goalId)
    assert.deepEqual(JSON.parse(await page.getByTestId('feedback-state').textContent() ?? '{}'), { goalFeedbackOrigin: 'learner-cockpit' })
  }
  assert.equal(errors.length, 0, `Cockpit feedback UI browser errors:\n${errors.join('\n')}`)
  await context.close()

  console.log('learner goal feedback UI regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
