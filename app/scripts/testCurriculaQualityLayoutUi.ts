import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Page, type Route } from 'playwright'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
import { goalBookDefinitionById, goalBookRoute } from '../src/utils/goalBookPublicationRegistry'
import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const subjectMaturities = [
  ['Mathematik', 'M6'],
  ['Physik', 'M6'],
  ['Chemie', 'M6'],
  ['Biologie', 'M0'],
  ['Informatik', 'M0'],
  ['Deutsch', 'M0'],
  ['Englisch', 'M0'],
  ['Französisch', 'M0'],
  ['Latein', 'M0'],
  ['Geschichte', 'M6'],
  ['Politik und Wirtschaft', 'M0'],
  ['Wirtschaftswissenschaften', 'M0'],
] as const

const curriculaPayload = {
  defaultCurriculumId: CANONICAL_GYMNASIUM_ROOT_ID,
  lastUpdatedAt: '2026-08-15T00:00:00Z',
  curricula: [{
    curriculumId: CANONICAL_GYMNASIUM_ROOT_ID,
    title: 'Gymnasium (DE)',
    description: 'Gemeinsamer Einstiegspunkt für das Gymnasium in Deutschland.',
    country: 'DE',
    region: 'DE',
    subject: '',
    totalAtomicGoals: 4635,
    totalMastered: 0,
    qualityStatus: null,
    humanTrialSubjectCount: 1,
    topLevelTopics: subjectMaturities.map(([subject]) => subject),
    subjectQuality: subjectMaturities.map(([subject, maturity]) => ({
      subject,
      landscapeId: `fixture-${subject}`,
      qualityStatus: subject === 'Physik' ? 'human_trial_in_progress' : maturity === 'M6' ? 'machine_qa' : 'experimental',
      humanTrial: subject === 'Physik' ? {
        state: 'in_progress', scopeLabel: 'Physik Hessen Sek II', scopeCoverage: 'partial', requiredGoals: 20, practicedGoals: 3,
      } : null,
      maturity,
      goals: 100,
      atomicGoals: 80,
      warnings: 0,
      failures: 0,
    })),
    champions: [{
      id: 'fixture-champion',
      curriculumId: CANONICAL_GYMNASIUM_ROOT_ID,
      githubId: 'fixture',
      skillpilotIdMasked: '***',
      masteredCount: 1,
      totalTopicGoals: 1,
      issuesCount: 90123,
      pullRequestsCount: 80456,
    }],
  }],
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/curriculaQualityLayoutUi.html',
  { plugins: [tailwindcss()] },
)

const configurePage = async (page: Page, theme = 'light', language = 'de') => {
  await page.addInitScript(({ theme, language }) => {
    localStorage.setItem('skillpilot_lang', language)
    localStorage.setItem('skillpilot_theme', theme)
  }, { theme, language })
  await page.route('**/api/ui/curricula/champions/me', (route) => route.fulfill({ status: 401, json: {} }))
  await page.route('**/api/ui/curricula/*/topics', (route) => route.fulfill({ json: [] }))
  await page.route('**/api/ui/curricula', (route) => route.fulfill({ json: curriculaPayload }))
}

const loadFailureCases: { name: string; respond: (route: Route) => Promise<void> }[] = [
  {
    name: 'HTTP 500 JSON error',
    respond: (route) => route.fulfill({ status: 500, json: {
      status: 500, error: 'Internal Server Error', path: '/api/ui/curricula',
    } }),
  },
  {
    name: 'HTTP 500 with an empty curricula array',
    respond: (route) => route.fulfill({ status: 500, json: { curricula: [] } }),
  },
  {
    name: 'HTTP 200 without curricula',
    respond: (route) => route.fulfill({ json: { lastUpdatedAt: curriculaPayload.lastUpdatedAt } }),
  },
  {
    name: 'HTTP 200 with nonarray curricula',
    respond: (route) => route.fulfill({ json: { curricula: {} } }),
  },
  {
    name: 'HTTP 200 with a null curriculum',
    respond: (route) => route.fulfill({ json: { curricula: [null] } }),
  },
  {
    name: 'HTTP 200 with unavailable champions',
    respond: (route) => route.fulfill({ json: {
      curricula: [{ ...curriculaPayload.curricula[0], champions: null }],
    } }),
  },
  {
    name: 'network failure',
    respond: (route) => route.abort('failed'),
  },
  {
    name: 'HTML response',
    respond: (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html><h1>Unavailable</h1>' }),
  },
  {
    name: 'invalid JSON response',
    respond: (route) => route.fulfill({ contentType: 'application/json', body: '{"curricula":' }),
  },
]

const loadingCopy = {
  de: {
    error: 'Die Curricula konnten nicht geladen werden. Bitte versuche es erneut.',
    retry: 'Erneut versuchen',
    noData: 'Noch keine Curricula verfügbar.',
    home: 'Zurück zur Startseite',
  },
  en: {
    error: 'The curricula could not be loaded. Please try again.',
    retry: 'Retry',
    noData: 'No curricula available yet.',
    home: 'Back to Home',
  },
} as const

const testLoadingFailures = async (browser: Browser) => {
  for (const language of ['de', 'en'] as const) {
    const copy = loadingCopy[language]
    // Cover every failure shape in German, then the production HTTP error and
    // successful recovery in English as well. Both use a narrow mobile viewport.
    const cases = language === 'de' ? loadFailureCases : loadFailureCases.slice(0, 1)
    for (const failure of cases) {
      const page = await browser.newPage({
        locale: language === 'de' ? 'de-DE' : 'en-US',
        viewport: { width: 375, height: 900 },
      })
      const pageErrors: string[] = []
      page.on('pageerror', (error) => pageErrors.push(`${error.name}: ${error.message}`))
      await configurePage(page, 'light', language)
      let failing = true
      let requestCount = 0
      await page.route('**/api/ui/curricula', async (route) => {
        requestCount++
        if (failing) await failure.respond(route)
        else await route.fulfill({ json: curriculaPayload })
      })
      await page.goto(`${server.baseUrl}/scripts/fixtures/curriculaQualityLayoutUi.html`)

      const alert = page.getByRole('alert')
      await alert.waitFor()
      assert(await alert.innerText() === copy.error, `${failure.name} shows a readable ${language} loading error`)
      assert(await page.getByText(copy.noData, { exact: true }).count() === 0, `${failure.name} must not imply an empty directory`)
      assert(await page.getByRole('link', { name: copy.home, exact: true }).getAttribute('href') === '/', `${failure.name} retains navigation home`)
      const retry = page.getByRole('button', { name: copy.retry, exact: true })
      assert(await retry.isVisible() && await retry.isEnabled(), `${failure.name} offers an enabled retry`)
      const pageWidth = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }))
      assert(pageWidth.scroll === pageWidth.client, `${failure.name} error and retry fit at 375px in ${language}`)
      assert(pageErrors.length === 0, `${failure.name} causes no uncaught errors: ${pageErrors.join('; ')}`)

      const requestsBeforeRetry = requestCount
      failing = false
      await retry.click()
      const card = page.getByTestId('curriculum-quality-overview-card')
      await card.waitFor()
      assert(requestCount > requestsBeforeRetry, `${failure.name} retry makes a fresh API request`)
      assert(await page.getByTestId('curriculum-quality-row').count() === subjectMaturities.length, `${failure.name} retry loads the existing complete curriculum fixture`)
      assert(await page.getByRole('alert').count() === 0, `${failure.name} successful retry removes the loading error`)
      assert(await page.getByRole('button', { name: copy.retry, exact: true }).count() === 0, `${failure.name} successful retry removes the retry action`)
      assert(pageErrors.length === 0, `${failure.name} recovery causes no uncaught errors: ${pageErrors.join('; ')}`)
      await page.close()
    }

    const page = await browser.newPage({
      locale: language === 'de' ? 'de-DE' : 'en-US',
      viewport: { width: 375, height: 900 },
    })
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(`${error.name}: ${error.message}`))
    await configurePage(page, 'light', language)
    await page.route('**/api/ui/curricula', (route) => route.fulfill({ json: {
      defaultCurriculumId: null, lastUpdatedAt: curriculaPayload.lastUpdatedAt, curricula: [],
    } }))
    await page.goto(`${server.baseUrl}/scripts/fixtures/curriculaQualityLayoutUi.html`)
    await page.getByText(copy.noData, { exact: true }).waitFor()
    assert(await page.getByRole('alert').count() === 0, `a valid empty directory is not a loading error in ${language}`)
    assert(await page.getByRole('button', { name: copy.retry, exact: true }).count() === 0, `a valid empty directory has no error retry in ${language}`)
    assert(pageErrors.length === 0, `a valid empty directory causes no uncaught errors: ${pageErrors.join('; ')}`)
    await page.close()
  }
}

let browser: Browser | null = null

try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-background-networking',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-sandbox',
    ],
  })

  await testLoadingFailures(browser)

  for (const expected of [
    { width: 320, columns: 1, theme: 'light' },
    { width: 768, columns: 2, theme: 'light' },
    { width: 1024, columns: 3, theme: 'light' },
    { width: 320, columns: 1, theme: 'dark' },
  ]) {
    const page = await browser.newPage({
      locale: 'de-DE',
      viewport: { width: expected.width, height: 900 },
    })
    await configurePage(page, expected.theme)
    await page.goto(`${server.baseUrl}/scripts/fixtures/curriculaQualityLayoutUi.html`)

    const card = page.getByTestId('curriculum-quality-overview-card')
    await card.waitFor()
    const feedback = page.getByTestId('curricula-feedback-entry')
    assert(await feedback.isVisible(), 'anonymous visitors can reach goal feedback before Champion registration')
    assert(await page.locator('form').count() === 0, 'optional Champion registration stays closed initially')
    assert(
      await feedback.getByText('Öffentliches Lernziel-Feedback braucht weder ein GitHub-Konto noch eine Champion-Registrierung.', { exact: true }).count() === 1,
      'goal feedback is clearly independent of GitHub and Champion registration',
    )
    const subjects = [
      ['Mathematik', 'de-gym-mathematik-bundesweit'],
      ['Physik', 'de-gym-physik-bundesweit'],
      ['Chemie', 'de-gym-chemie-bundesweit'],
      ['Biologie', 'de-gym-biologie-bundesweit'],
    ] as const
    assert(await feedback.getByTestId('curricula-feedback-subject').count() === 4, 'all four sciences have an explicit feedback entry')
    for (const [subject, bookId] of subjects) {
      const subjectCard = feedback.getByTestId('curricula-feedback-subject').filter({ has: page.getByRole('heading', { name: subject, exact: true }) })
      assert(goalBookDefinitionById(bookId), `${subject} has its national book in the publication registry`)
      const link = subjectCard.getByRole('link', { name: `${subject}: Lernziele öffnen`, exact: true })
      assert(await link.getAttribute('href') === goalBookRoute(bookId), `${subject} opens its registered goal book, not an unbound feedback form`)
      assert(await subjectCard.locator('p').count() === 0, `${subject} entry shows only the subject and opening action, without scope details`)
    }
    assert(await feedback.getByText('Issues und Pull Requests sind dort möglich.', { exact: false }).count() === 1, 'GitHub copy states the available actions without migration wording')
    assert(await feedback.getByText('Für weitere Curricula ohne direkten Feedbackeinstieg nutze ebenfalls GitHub und nenne das Curriculum und das Thema.', { exact: true }).count() === 1, 'other curricula retain an explicit and honest GitHub fallback')
    assert(
      await feedback.getByRole('link', { name: 'Größeres Thema auf GitHub besprechen', exact: true }).getAttribute('href') === 'https://github.com/enpasos/skillpilot/issues',
      'GitHub remains available for larger and technical topics',
    )
    const bodyText = await page.locator('body').innerText()
    assert(!bodyText.includes('90123') && !bodyText.includes('80456'), 'API issue and pull-request counts must not become visible contribution metrics')
    assert(await card.getByText('Lernfortschritt', { exact: true }).count() === 1, 'existing learning progress remains separate from feedback')
    assert(await card.getByText('1 / 1', { exact: true }).count() === 1, 'the learning-progress value remains unchanged')
    const feedbackBeforeComic = await feedback.evaluate((element) => {
      const comic = document.querySelector('img[src="/comic3/champion.de.png"]')
      return comic != null && (element.compareDocumentPosition(comic) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    })
    assert(feedbackBeforeComic, 'the actionable feedback entry precedes the explanatory Champion comic')
    const grid = page.getByTestId('curriculum-quality-grid')
    const rows = page.getByTestId('curriculum-quality-row')
    assert(await rows.count() === subjectMaturities.length, 'every subject has one quality row')
    assert(await rows.filter({ hasText: 'Mathematik' }).getByText('Maschinelle QS', { exact: true }).isVisible(), 'the formerly hardcoded green subject follows server evidence')
    assert(await rows.filter({ hasText: 'Physik' }).getByText('Menschliche QS läuft', { exact: true }).isVisible(), 'a confirmed active trial has a distinct label')
    assert(await rows.filter({ hasText: 'Physik' }).getByText('Erprobungsumfang: Physik Hessen Sek II', { exact: true }).isVisible(), 'partial scope stays explicitly qualified')
    assert(await card.getByText('Menschliche QS in 1 Fächern', { exact: true }).isVisible(), 'collection reports a count rather than inheriting a subject seal')
    assert(await card.locator('.lucide-badge-check, .lucide-trophy').count() === 0, 'registration and 1/1 mastery alone create no completion seal')

    const rowGeometry = await rows.evaluateAll((elements) => elements.map((element) => {
      const row = element.getBoundingClientRect()
      const content = Array.from(element.children).map((child) => {
        const box = child.getBoundingClientRect()
        return { left: box.left, right: box.right }
      })
      return {
        left: row.left,
        right: row.right,
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        content,
      }
    }))
    assert(
      rowGeometry.every((row) => (
        row.scrollWidth <= row.clientWidth
        && row.content.every((content) => content.left >= row.left - 0.5 && content.right <= row.right + 0.5)
      )),
      `quality labels must stay inside their subject row at ${expected.width}px`,
    )

    const gridColumns = await rows.evaluateAll((elements) => (
      new Set(elements.map((element) => Math.round(element.getBoundingClientRect().left))).size
    ))
    assert(
      gridColumns === expected.columns,
      `quality grid should use ${expected.columns} columns at ${expected.width}px, got ${gridColumns}`,
    )

    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    assert(
      pageWidth.scroll === pageWidth.client,
      `page must not overflow at ${expected.width}px (${pageWidth.scroll}px > ${pageWidth.client}px)`,
    )

    if (expected.width >= 768) {
      const cardBox = await card.boundingBox()
      const gridBox = await grid.boundingBox()
      assert(cardBox && gridBox, 'quality card and grid expose layout boxes')
      assert(
        cardBox.width >= expected.width - 64,
        'the aggregate Gymnasium quality card spans the complete directory row',
      )
      assert(
        gridBox.x >= cardBox.x && gridBox.x + gridBox.width <= cardBox.x + cardBox.width,
        'the quality grid stays within the aggregate card',
      )
    }

    if (expected.width === 1024) {
      await page.getByRole('button', { name: 'Champion-Registrierung / Verwaltung', exact: true }).click()
      assert(await page.getByRole('button', { name: 'Mit GitHub verbinden', exact: true }).isVisible(), 'optional Champion registration retains its existing GitHub connection')
      await page.getByRole('button', { name: 'EN', exact: true }).click()
      await page.getByRole('heading', { name: 'Improve curricula together', exact: true }).waitFor()
      assert(await feedback.getByText('Public goal feedback does not require a GitHub account or Champion registration.', { exact: true }).count() === 1, 'English copy preserves the public-feedback boundary')
      assert(await feedback.getByTestId('curricula-feedback-subject').locator('p').count() === 0, 'English subject entries also omit scope details')
      assert(await feedback.getByText('Issues and pull requests are available there.', { exact: false }).count() === 1, 'English GitHub copy also states the available actions')
      assert(await page.getByRole('button', { name: 'Connect with GitHub', exact: true }).isVisible(), 'English Champion registration keeps the same action')
      assert(await card.getByText('Learning progress', { exact: true }).count() === 1, 'English learning progress remains visible')
      assert(await feedback.getByRole('link', { name: 'Mathematics: Open learning goals', exact: true }).getAttribute('href') === goalBookRoute('de-gym-mathematik-bundesweit'), 'English feedback uses the same actual mathematics book')
    }

    await page.close()
  }
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

await import('./testCurriculumChampionTrialUi')
console.log('curricula quality layout and champion trial UI tests passed')
