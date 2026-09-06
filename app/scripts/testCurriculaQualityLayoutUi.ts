import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Page } from 'playwright'
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
    topLevelTopics: subjectMaturities.map(([subject]) => subject),
    subjectQuality: subjectMaturities.map(([subject, maturity]) => ({
      subject,
      maturity,
      goals: 100,
      atomicGoals: 80,
      warnings: 0,
      failures: 0,
    })),
    champions: [{
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

const configurePage = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_theme', 'light')
  })
  await page.route('**/api/ui/curricula/champions/me', (route) => route.fulfill({ status: 401, json: {} }))
  await page.route('**/api/ui/curricula/*/topics', (route) => route.fulfill({ json: [] }))
  await page.route('**/api/ui/curricula', (route) => route.fulfill({ json: curriculaPayload }))
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

  for (const expected of [
    { width: 320, columns: 1 },
    { width: 768, columns: 2 },
    { width: 1024, columns: 3 },
  ]) {
    const page = await browser.newPage({
      locale: 'de-DE',
      viewport: { width: expected.width, height: 900 },
    })
    await configurePage(page)
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
    }
    assert(await feedback.getByText('Bundesweite Übersicht mit Geltung und Originalquellen je Lernziel', { exact: true }).count() === 1, 'Chemistry links the national atlas and its source matrix')
    assert(await feedback.getByText('Sek I: 16 Länder; Sek II: derzeit Hessen und Bayern', { exact: true }).count() === 1, 'Biology states its actual source coverage instead of claiming unsupported upper-secondary scopes')
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
      assert(await feedback.getByText('Nationwide overview with applicability and original sources per goal', { exact: true }).count() === 1, 'English Chemistry copy describes the national atlas')
      assert(await feedback.getByText('Lower secondary: 16 states; upper secondary: currently Hesse and Bavaria', { exact: true }).count() === 1, 'English Biology copy states the actual source coverage')
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

console.log('curricula quality layout UI tests passed')
