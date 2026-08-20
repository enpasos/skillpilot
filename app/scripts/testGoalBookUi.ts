import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type Page } from 'playwright'
import { startViteTestServer } from './viteTestServer'

const FIRST_GOAL_ID = '11111111-1111-4111-8111-111111111111'
const SECOND_GOAL_ID = '22222222-2222-4222-8222-222222222222'
const THIRD_GOAL_ID = '33333333-3333-4333-8333-333333333333'
const INDEX_PATH = '/lernzielbuch/index.json'
const MODEL_PATH = '/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json'
const PDF_PATH = '/lernzielbuch/de-gym-mathematik-bundesweit.pdf'
const PHYSICS_MODEL_PATH = '/lernzielbuch/de-gym-physik-bundesweit.book-model.json'
const PHYSICS_PDF_PATH = '/lernzielbuch/de-gym-physik-bundesweit.pdf'
const MATHEMATICS_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const PHYSICS_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const modelFixture = await readFile(
  fileURLToPath(new URL('./fixtures/goalBookUi.model.json', import.meta.url)),
  'utf8',
)
const singleBookIndexFixture = await readFile(
  fileURLToPath(new URL('./fixtures/goalBookUi.index.json', import.meta.url)),
  'utf8',
)
const physicsModel = JSON.parse(
  modelFixture.replaceAll(MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID),
) as Record<string, unknown>
const physicsBook = physicsModel.book as Record<string, unknown>
physicsBook.id = 'de-gym-physik-bundesweit'
physicsBook.title = 'Lernzielbuch Physik – bundesweiter Atlas'
const physicsSource = physicsModel.source as Record<string, unknown>
physicsSource.externalLandscapes = [{
  path: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  landscapeId: MATHEMATICS_LANDSCAPE_ID,
  digest: `sha256:${'9'.repeat(64)}`,
}]
const physicsPages = physicsModel.pages as Array<Record<string, unknown>>
const externalPrerequisites = physicsPages[2].externalPrerequisites as Array<Record<string, unknown>>
externalPrerequisites[0].landscapeId = MATHEMATICS_LANDSCAPE_ID
const physicsFixture = `${JSON.stringify(physicsModel, null, 2)}\n`
const physicsFixtureSha256 = `sha256:${createHash('sha256').update(physicsFixture).digest('hex')}`
const index = JSON.parse(singleBookIndexFixture) as {
  schemaVersion: 1
  books: Array<Record<string, unknown>>
}
index.books.push({
  bookId: 'de-gym-physik-bundesweit',
  title: physicsBook.title,
  locale: 'de-DE',
  publicationMode: 'review',
  pageCount: 3,
  model: {
    url: PHYSICS_MODEL_PATH,
    sha256: physicsFixtureSha256,
    modelDigest: physicsModel.digest,
  },
  pdf: {
    url: PHYSICS_PDF_PATH,
    sha256: `sha256:${'e'.repeat(64)}`,
    renderManifestUrl: `${PHYSICS_PDF_PATH}.render-manifest.json`,
    renderManifestSha256: `sha256:${'f'.repeat(64)}`,
  },
})
const indexFixture = JSON.stringify(index)
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/goalBookUi.html',
)

let browser: Browser | null = null

const assertNoHorizontalOverflow = async (page: Page, width: number) => {
  await page.setViewportSize({ width, height: 900 })
  await page.waitForTimeout(50)
  const dimensions = await page.evaluate(() => ({
    bodyClientWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    documentClientWidth: document.documentElement.clientWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
  }))
  const overflowSources = dimensions.documentScrollWidth > dimensions.documentClientWidth
    ? await page.evaluate(() => [...document.querySelectorAll<HTMLElement>('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}.${element.className}`,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        }
      })
      .filter(({ right, scrollWidth, clientWidth }) => (
        right > document.documentElement.clientWidth + 1 || scrollWidth > clientWidth + 1
      ))
      .sort((left, right) => Math.max(right.right, right.scrollWidth) - Math.max(left.right, left.scrollWidth))
      .slice(0, 8))
    : []
  assert(
    dimensions.documentScrollWidth <= dimensions.documentClientWidth
      && dimensions.bodyScrollWidth <= dimensions.bodyClientWidth,
    `${width}px layout has horizontal overflow: ${JSON.stringify({ dimensions, overflowSources })}`,
  )
}

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
  const context = await browser.newContext({
    locale: 'de-DE',
    viewport: { width: 1440, height: 900 },
  })
  await context.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_theme', 'light')
  })

  const page = await context.newPage()
  page.setDefaultTimeout(10_000)
  const browserErrors: string[] = []
  const requests: Array<{ method: string; pathname: string }> = []
  let indexRequests = 0
  let mathModelRequests = 0
  let physicsModelRequests = 0
  let imageRequests = 0

  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  page.on('request', (request) => {
    const url = new URL(request.url())
    requests.push({ method: request.method(), pathname: url.pathname })
  })

  await page.route(`**${INDEX_PATH}`, async (route) => {
    indexRequests += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: indexFixture,
    })
  })
  await page.route(`**${MODEL_PATH}`, async (route) => {
    mathModelRequests += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: modelFixture,
    })
  })
  await page.route(`**${PHYSICS_MODEL_PATH}`, async (route) => {
    physicsModelRequests += 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: physicsFixture,
    })
  })
  await page.route('**/assets/goal-visualizations/goal-book-ui-*.svg', async (route) => {
    imageRequests += 1
    const title = new URL(route.request().url()).pathname.split('/').at(-1) ?? 'visualization'
    await route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="#e0f2fe"/><text x="20" y="50">${title}</text></svg>`,
    })
  })
  const fixtureUrl = `${server.baseUrl}/scripts/fixtures/goalBookUi.html`
  await page.goto(`${fixtureUrl}#goal-${SECOND_GOAL_ID}`)
  await page.getByRole('heading', { name: 'Brüche addieren und begründen' }).waitFor()
    .catch(async (error: unknown) => {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\nBrowser errors:\n${browserErrors.join('\n')}\nIndex requests: ${indexRequests}; math model requests: ${mathModelRequests}; physics model requests: ${physicsModelRequests}\nPage text:\n${(await page.locator('body').innerText()).slice(0, 4_000)}`,
      )
    })

  const goalBookShell = page.getByTestId('goal-book-shell')
  const shellClasses = (await goalBookShell.getAttribute('class'))?.split(/\s+/u) ?? []
  assert(
    shellClasses.includes('bg-slate-50')
      && shellClasses.includes('dark:bg-app-gradient')
      && !shellClasses.includes('bg-app-gradient'),
    'the learning-goal-book shell binds the light surface separately from the dark application gradient',
  )
  assert(
    await page.locator('html.light').count() === 1
      && await page.locator('meta[name="theme-color"]').getAttribute('content') === '#ffffff'
      && await page.evaluate(() => localStorage.getItem('skillpilot_theme')) === 'light',
    'the learning-goal-book fixture starts with the explicit light theme contract',
  )
  await page.getByLabel('Zum dunklen Modus wechseln').click()
  assert(
    await page.locator('html.dark').count() === 1
      && await page.locator('meta[name="theme-color"]').getAttribute('content') === '#343541'
      && await page.evaluate(() => localStorage.getItem('skillpilot_theme')) === 'dark',
    'the theme control switches the learning-goal-book view to dark mode',
  )
  await assertNoHorizontalOverflow(page, 375)
  await assertNoHorizontalOverflow(page, 1440)
  await page.getByLabel('Zum hellen Modus wechseln').click()
  assert(
    await page.locator('html.light').count() === 1
      && await page.locator('meta[name="theme-color"]').getAttribute('content') === '#ffffff'
      && await page.evaluate(() => localStorage.getItem('skillpilot_theme')) === 'light',
    'the theme control switches the learning-goal-book view back to light mode',
  )

  assert(
    indexRequests >= 1 && mathModelRequests >= 1 && physicsModelRequests === 0,
    'the read-only view loads its publication index and bound goal-book model',
  )
  assert(
    await page.getByTestId('goal-book-page').count() === 1,
    'the view renders exactly one selected learning-goal detail page',
  )
  assert(
    await page.getByTestId('goal-book-page').locator('img').count() === 1,
    'the selected detail renders exactly one visualization',
  )
  await page.getByTestId('goal-book-page').locator('img').waitFor()
  assert(
    imageRequests === 1,
    'the browser requests only the selected visualization instead of all book images',
  )
  assert(
    page.url().endsWith(`#goal-${SECOND_GOAL_ID}`),
    'a stable goal hash opens the requested learning goal directly',
  )

  const search = page.getByLabel('Lernziele durchsuchen')
  const applicabilityFilters = page.getByRole('group', { name: 'Curriculum filtern' })
  const jurisdictionFilter = applicabilityFilters.getByLabel('Bundesland')
  const stageFilter = applicabilityFilters.getByLabel('Stufe')
  const durationFilter = applicabilityFilters.getByLabel('Bildungsgang')
  const courseFilter = applicabilityFilters.getByLabel('Kursprofil')
  assert(
    await stageFilter.isDisabled()
      && await durationFilter.isDisabled()
      && await courseFilter.isDisabled(),
    'state-dependent filters stay disabled until a German state is selected',
  )
  await jurisdictionFilter.selectOption('DE-HE')
  await stageFilter.selectOption('SekI')
  assert(
    !await durationFilter.isDisabled()
      && await courseFilter.isDisabled()
      && await durationFilter.locator('option[value="G8"]').count() === 1
      && await durationFilter.locator('option[value="G9"]').count() === 1,
    'Hesse lower-secondary exposes only its authored G8/G9 variants and no upper-secondary course profile',
  )
  await durationFilter.selectOption('G8')
  const results = page.getByRole('region', { name: 'Lernziele' })
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByRole('link', { name: /Natürliche Zahlen vergleichen/u }).count() === 1,
    'the coupled Hesse, lower-secondary, G8 tuple filters without creating a false G9 or course-profile combination',
  )
  const applicability = page.getByRole('heading', { name: 'Curriculare Geltung' })
    .locator('xpath=ancestor::section[1]')
  assert(
    (await applicability.innerText()).includes('Hessen: G8/G9'),
    'the page exposes a compact state-coupled applicability summary',
  )
  await applicability.getByText('Vollständige Geltungsmatrix anzeigen', { exact: true }).click()
  assert(
    await applicability.getByRole('table').count() === 1
      && (await applicability.getByRole('table').innerText()).includes('Sekundarstufe II'),
    'the exact applicability tuples are available in an expandable detail matrix',
  )
  await jurisdictionFilter.selectOption('DE-BY')
  await stageFilter.selectOption('SekI')
  assert(
    !await durationFilter.isDisabled()
      && await durationFilter.locator('option[value="G8"]').count() === 0
      && await durationFilter.locator('option[value="G9"]').count() === 1,
    'Bavaria lower-secondary exposes its authored G9 route without inheriting another state’s G8 route',
  )
  await stageFilter.selectOption('SekII')
  assert(
    !await durationFilter.isDisabled()
      && await durationFilter.locator('option[value="G9"]').count() === 1
      && !await courseFilter.isDisabled()
      && await courseFilter.locator('option[value="GK"]').count() === 1,
    'a state-specific upper-secondary G9 scope remains available when it is explicitly authored',
  )
  await durationFilter.selectOption('G9')
  await courseFilter.selectOption('GK')
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 1,
    'duration and course profile match one exact upper-secondary state tuple',
  )
  await jurisdictionFilter.selectOption('')
  assert(
    await stageFilter.isDisabled() && await results.getByRole('link').count() === 3,
    'clearing the state also clears every dependent applicability filter',
  )
  await search.fill(THIRD_GOAL_ID)
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByText(THIRD_GOAL_ID, { exact: true }).count() === 1,
    'search matches a full stable learning-goal ID',
  )
  await search.fill('natürliche vergleichen')
  assert(
    await results.getByRole('link', { name: /Natürliche Zahlen vergleichen/u }).count() === 1,
    'search matches title terms with normalized German text',
  )

  await search.fill('')
  await page.getByRole('navigation', { name: 'Kapitel' })
    .getByRole('button', { name: /Geometrie/u })
    .click()
  await results.getByRole('link', { name: /Natürliche Zahlen vergleichen/u })
    .waitFor({ state: 'hidden' })
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 1,
    'chapter navigation restricts the result list to the selected chapter',
  )
  await results.getByRole('link', { name: /Flächeninhalte berechnen/u }).click()
  await page.getByRole('heading', { name: 'Flächeninhalte berechnen' }).waitFor()
  assert(
    await page.getByTestId('goal-book-page')
      .getByRole('link', { name: /Längen sicher messen/u })
      .getAttribute('href')
      === 'https://skillpilot.com/lernzielbuch?landscape=68a8ac50-f5f5-4e24-8aa9-5e408ca01ced&edition=curricular-atomic-v1#goal-external-measurement-goal',
    'an external prerequisite remains a canonical, edition-bound atlas link',
  )

  await page.getByRole('navigation', { name: 'Kapitel' })
    .getByRole('button', { name: /Alle Lernziele/u })
    .click()
  await page.getByTestId('goal-book-page')
    .getByRole('link', { name: new RegExp(`Brüche addieren.*${SECOND_GOAL_ID}`, 'su') })
    .click()
  await page.getByRole('heading', { name: 'Brüche addieren und begründen' }).waitFor()
  await page.getByTestId('goal-book-page')
    .getByRole('link', { name: new RegExp(`Natürliche Zahlen vergleichen.*${FIRST_GOAL_ID}`, 'su') })
    .click()
  await page.getByRole('heading', { name: 'Natürliche Zahlen vergleichen' }).waitFor()
  assert(
    page.url().endsWith(`#goal-${FIRST_GOAL_ID}`),
    'an internal prerequisite relation updates the stable hash deep-link',
  )
  assert(
    await page.getByTestId('goal-book-page').count() === 1,
    'following an internal relation replaces the detail instead of appending pages',
  )

  const pdfLink = page.getByTestId('goal-book-pdf')
  assert(
    await pdfLink.getAttribute('href') === PDF_PATH
      && await pdfLink.getAttribute('download') !== null,
    'the UI exposes the published PDF as a real download link',
  )
  const subjectNavigation = page.getByRole('navigation', { name: 'Fach auswählen' })
  assert(
    await subjectNavigation.getByRole('link', { name: 'Mathematik', exact: true }).getAttribute('aria-current') === 'page'
      && await subjectNavigation.getByRole('link', { name: 'Physik', exact: true }).count() === 1,
    'the complete closed publication catalog is presented as a subject selector',
  )
  await subjectNavigation.getByRole('link', { name: 'Physik', exact: true }).click()
  await page.getByRole('heading', { name: 'Lernzielbuch Physik – bundesweiter Atlas' }).waitFor()
  assert(
    mathModelRequests >= 1
      && physicsModelRequests === 1
      && page.url().includes('?book=de-gym-physik-bundesweit')
      && await page.getByTestId('goal-book-pdf').getAttribute('href') === PHYSICS_PDF_PATH,
    'a stable subject deep link loads only the selected physics model and follows it with the physics PDF',
  )
  await page.evaluate(() => {
    window.location.hash = '#goal-external-measurement-goal'
  })
  await page.getByRole('heading', { name: 'Lernziel außerhalb dieser Ausgabe' }).waitFor()
  assert(
    await page.getByText('Fachliche Herkunft: Mathematik', { exact: true }).count() === 1,
    'a cross-subject relation identifies mathematics as its bound subject source',
  )
  await page.evaluate((goalId) => {
    window.location.hash = `#goal-${goalId}`
  }, FIRST_GOAL_ID)
  await page.getByRole('heading', { name: 'Natürliche Zahlen vergleichen' }).waitFor()
  await page.getByRole('button', { name: 'EN', exact: true }).click()
  assert(
    await page.getByRole('link', { name: /Download PDF/u }).count() === 1
      && await page.getByLabel('Search learning goals').count() === 1
      && await page.getByText('The book content is currently available in German.').count() === 1
      && await page.getByRole('group', { name: 'Filter curriculum' }).count() === 1
      && await page.getByLabel('German state').count() === 1
      && await page.getByRole('heading', { name: 'Curricular applicability' }).count() === 1,
    'the navigation chrome switches from German to English while identifying German book content',
  )
  await page.getByRole('button', { name: 'DE', exact: true }).click()
  assert(
    await page.getByLabel('Lernziele durchsuchen').count() === 1,
    'the navigation chrome can switch back to German',
  )

  await assertNoHorizontalOverflow(page, 375)
  await assertNoHorizontalOverflow(page, 1440)

  const feedbackSection = page.getByRole('heading', { name: 'Feedback-Pilot' })
    .locator('xpath=ancestor::section[1]')
  assert(
    await feedbackSection.getByRole('button').count() === 0
      && await feedbackSection.locator('form').count() === 0,
    'the visible feedback pilot has no form or mutation control in this slice',
  )
  assert(
    (await feedbackSection.innerText()).includes('noch keine Daten übermittelt'),
    'the feedback pilot explicitly states that this slice transmits no data',
  )
  const feedbackHref = await feedbackSection.getByRole('link').getAttribute('href')
  const feedbackUrl = new URL(feedbackHref ?? '', 'https://skillpilot.test')
  assert(
    feedbackUrl.pathname === '/lernziel-feedback'
      && feedbackUrl.searchParams.get('bookId') === 'de-gym-physik-bundesweit'
      && feedbackUrl.searchParams.get('goalId') === FIRST_GOAL_ID
      && feedbackUrl.searchParams.get('edition') === 'curricular-atomic-v1'
      && feedbackUrl.searchParams.get('goalFingerprint')?.startsWith('sha256:') === true
      && feedbackUrl.searchParams.get('pageFingerprint')?.startsWith('sha256:') === true
      && feedbackUrl.searchParams.get('bookDigest')?.startsWith('sha256:') === true,
    'the read-only feedback placeholder is bound to the exact edition and fingerprints',
  )
  assert(
    requests.every(({ method }) => method === 'GET')
      && requests.every(({ pathname }) => (
        !pathname.startsWith('/api/')
        && !pathname.toLocaleLowerCase('en-US').includes('learner')
        && !pathname.toLocaleLowerCase('en-US').includes('feedback')
      )),
    `the read-only view made a learner, feedback, API, or mutation request: ${JSON.stringify(requests)}`,
  )
  assert(browserErrors.length === 0, `browser errors: ${browserErrors.join('\n')}`)
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('goal-book UI browser tests passed')
