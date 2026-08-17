import { fileURLToPath } from 'node:url'
import { chromium, type Browser } from 'playwright'
import {
  CANONICAL_GYMNASIUM_MATH_ID,
  CANONICAL_GYMNASIUM_PHYSICS_ID,
} from '../src/utils/curriculumQualityTrafficLight'
import { startViteTestServer } from './viteTestServer'

const chemistryCurriculumId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const experimentalCurriculumId = 'experimental-school-curriculum'
const universityPhysicsId = 'university-physics'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/curriculumQualityTrafficLightUi.html',
)

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
  const page = await browser.newPage({ locale: 'de-DE' })
  const browserErrors: string[] = []
  page.on('pageerror', (error) => {
    browserErrors.push(error.message)
  })
  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(message.text())
    }
  })
  await page.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
  })
  await page.goto(
    `${server.baseUrl}/scripts/fixtures/curriculumQualityTrafficLightUi.html`,
  )

  const qualityFixture = page.getByTestId('quality-filter-fixture')
  const qualityButtons = {
    green: qualityFixture.getByRole('button', { name: 'Menschliche QS', exact: true }),
    orange: qualityFixture.getByRole('button', { name: 'Maschinelle QS', exact: true }),
    red: qualityFixture.getByRole('button', { name: 'Experimentell', exact: true }),
    all: qualityFixture.getByRole('button', { name: 'Alle', exact: true }),
  }
  await qualityButtons.green.waitFor().catch((error: unknown) => {
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\nBrowser errors:\n${browserErrors.join('\n')}`,
    )
  })

  for (const button of Object.values(qualityButtons)) {
    assert(await button.count() === 1, 'every quality meaning has exactly one visible filter')
  }
  assert(
    await qualityButtons.green.getAttribute('aria-pressed') === 'true',
    'the quality filter defaults to human-reviewed curricula',
  )
  assert(
    await qualityButtons.orange.getAttribute('aria-pressed') === 'false'
      && await qualityButtons.red.getAttribute('aria-pressed') === 'false'
      && await qualityButtons.all.getAttribute('aria-pressed') === 'false',
    'only the green filter is active initially',
  )

  const select = qualityFixture.locator('select')
  const visibleCurriculumIds = async () => select.locator('option').evaluateAll(
    (options) => options.map((option) => (option as HTMLOptionElement).value),
  )
  await page.waitForFunction(
    ({ physicsId, currentId }) => {
      const values = [...document.querySelectorAll(
        '[data-testid="quality-filter-fixture"] select option',
      )]
        .map((option) => (option as HTMLOptionElement).value)
      return values.includes(physicsId) && values.includes(currentId)
    },
    {
      physicsId: CANONICAL_GYMNASIUM_PHYSICS_ID,
      currentId: experimentalCurriculumId,
    },
  )

  const defaultIds = await visibleCurriculumIds()
  assert(
    defaultIds.includes(CANONICAL_GYMNASIUM_PHYSICS_ID)
      && defaultIds.includes(CANONICAL_GYMNASIUM_MATH_ID),
    'the default green filter shows human-reviewed mathematics and physics',
  )
  assert(
    !defaultIds.includes(chemistryCurriculumId),
    'the default green filter hides machine-reviewed curricula',
  )
  assert(
    await qualityFixture.locator('optgroup[label="Empfohlene Curricula"]').count() === 0,
    'ordinary curricula are listed without a recommended group heading',
  )
  assert(
    defaultIds.includes(experimentalCurriculumId)
      && await select.inputValue() === experimentalCurriculumId,
    'the currently selected experimental curriculum remains visible under the green filter',
  )
  assert(
    await qualityFixture.getByTestId('quality-filter-selection-title').textContent()
      === 'Experimentelles Fach',
    'the dropdown publishes the localized selected title for compact setup summaries',
  )

  await qualityButtons.orange.click()
  await page.waitForFunction(
    ({ orangeId, currentId }) => {
      const values = [...document.querySelectorAll(
        '[data-testid="quality-filter-fixture"] select option',
      )]
        .map((option) => (option as HTMLOptionElement).value)
      return values.includes(orangeId) && values.includes(currentId)
    },
    {
      orangeId: chemistryCurriculumId,
      currentId: experimentalCurriculumId,
    },
  )
  const orangeIds = await visibleCurriculumIds()
  assert(
    orangeIds.includes(chemistryCurriculumId)
      && !orangeIds.includes(CANONICAL_GYMNASIUM_MATH_ID),
    'the machine-review filter switches the visible curriculum set',
  )
  assert(
    orangeIds.includes(experimentalCurriculumId)
      && await select.inputValue() === experimentalCurriculumId,
    'the current curriculum remains visible after switching quality filters',
  )

  await qualityButtons.red.click()
  await page.waitForFunction(
    (currentId) => {
      const values = [...document.querySelectorAll(
        '[data-testid="quality-filter-fixture"] select option',
      )]
        .map((option) => (option as HTMLOptionElement).value)
      return values.includes(currentId)
    },
    experimentalCurriculumId,
  )
  assert(
    await qualityButtons.red.getAttribute('aria-pressed') === 'true',
    'the experimental filter exposes its active state accessibly',
  )
  assert(
    !(await visibleCurriculumIds()).includes(CANONICAL_GYMNASIUM_MATH_ID),
    'the experimental filter no longer contains human-reviewed mathematics',
  )

  await qualityButtons.all.click()
  await page.waitForFunction(
    ({ greenId, orangeId, redId }) => {
      const values = [...document.querySelectorAll(
        '[data-testid="quality-filter-fixture"] select option',
      )]
        .map((option) => (option as HTMLOptionElement).value)
      return values.includes(greenId) && values.includes(orangeId) && values.includes(redId)
    },
    {
      greenId: CANONICAL_GYMNASIUM_PHYSICS_ID,
      orangeId: chemistryCurriculumId,
      redId: experimentalCurriculumId,
    },
  )
  assert(
    await qualityButtons.all.getAttribute('aria-pressed') === 'true',
    'the all filter exposes its active state accessibly',
  )
  await qualityFixture.getByRole('button', {
    name: 'Universität & Hochschule',
    exact: true,
  }).click()
  await page.waitForFunction(
    (physicsId) => {
      const values = [...document.querySelectorAll(
        '[data-testid="quality-filter-fixture"] select option',
      )]
        .map((option) => (option as HTMLOptionElement).value)
      return values.includes(physicsId)
    },
    universityPhysicsId,
  )
  assert(
    await qualityFixture.getByTestId('quality-filter-selection').textContent()
      === experimentalCurriculumId,
    'browsing a category with one option does not overwrite an existing selection',
  )

  const singleCurriculumFixture = page.getByTestId('single-curriculum-fixture')
  const singleCurriculumSelect = singleCurriculumFixture.locator('select')
  await page.waitForFunction(
    (mathId) => (
      document.querySelector('[data-testid="single-curriculum-selection"]')?.textContent
      === mathId
    ),
    CANONICAL_GYMNASIUM_MATH_ID,
  )
  assert(
    await singleCurriculumSelect.inputValue() === CANONICAL_GYMNASIUM_MATH_ID,
    'the only available curriculum is selected automatically',
  )
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('curriculum quality traffic light UI tests passed')
