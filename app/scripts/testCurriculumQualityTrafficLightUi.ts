import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import { createServer } from 'vite'
import {
  CANONICAL_GYMNASIUM_MATH_ID,
  CANONICAL_GYMNASIUM_PHYSICS_ID,
} from '../src/utils/curriculumQualityTrafficLight'

const chemistryCurriculumId = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'
const experimentalCurriculumId = 'experimental-school-curriculum'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({
  root: appRoot,
  configFile: false,
  logLevel: 'error',
  server: {
    host: '127.0.0.1',
    port: 0,
    strictPort: false,
  },
})

await server.listen()

const address = server.httpServer?.address()
assert(address && typeof address !== 'string', 'Vite test server did not expose a TCP port')

const browser = await chromium.launch({
  headless: true,
  args: [
    '--disable-background-networking',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-sandbox',
  ],
})

try {
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
    `http://127.0.0.1:${address.port}/scripts/fixtures/curriculumQualityTrafficLightUi.html`,
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
    ({ mathId, currentId }) => {
      const values = [...document.querySelectorAll(
        '[data-testid="quality-filter-fixture"] select option',
      )]
        .map((option) => (option as HTMLOptionElement).value)
      return values.includes(mathId) && values.includes(currentId)
    },
    {
      mathId: CANONICAL_GYMNASIUM_MATH_ID,
      currentId: experimentalCurriculumId,
    },
  )

  const defaultIds = await visibleCurriculumIds()
  assert(
    defaultIds.includes(CANONICAL_GYMNASIUM_MATH_ID),
    'the default green filter shows a human-reviewed curriculum',
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
  assert(
    await qualityButtons.red.getAttribute('aria-pressed') === 'true',
    'the experimental filter exposes its active state accessibly',
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
      greenId: CANONICAL_GYMNASIUM_MATH_ID,
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
    CANONICAL_GYMNASIUM_PHYSICS_ID,
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
  await browser.close()
  await server.close()
}

console.log('curriculum quality traffic light UI tests passed')
