import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Page } from 'playwright'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
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
      issuesCount: 0,
      pullRequestsCount: 0,
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
  await page.route('**/api/ui/curricula/champions/me', (route) => route.fulfill({ json: [] }))
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
