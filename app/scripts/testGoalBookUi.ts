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
const rawModelFixture = await readFile(
  fileURLToPath(new URL('./fixtures/goalBookUi.model.json', import.meta.url)),
  'utf8',
)
const singleBookIndexFixture = await readFile(
  fileURLToPath(new URL('./fixtures/goalBookUi.index.json', import.meta.url)),
  'utf8',
)

const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`)
      .join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

const stableDigest = (value: unknown): string => (
  `sha256:${createHash('sha256').update(stableJson(value)).digest('hex')}`
)

const personalizedView = ({
  viewId,
  scope,
  targetGoalIds,
  chapterLabel,
}: {
  viewId: string
  scope: Record<string, string>
  targetGoalIds: string[]
  chapterLabel: string
}) => ({
  viewId,
  landscapeId: MATHEMATICS_LANDSCAPE_ID,
  scope,
  rootNodes: [{
    kind: 'structure',
    id: `${viewId}-root`,
    label: 'Mathematik',
    children: [{
      kind: 'structure',
      id: `${viewId}-chapter`,
      label: chapterLabel,
      children: targetGoalIds.map((goalId) => ({ kind: 'goalEntry', goalId })),
    }],
  }],
})

const matchedViews = {
  heSekIG8: personalizedView({
    viewId: 'goal-book-test-he-seki-g8',
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-HE',
      stage: 'SekI',
      durationModel: 'G8',
    },
    targetGoalIds: [FIRST_GOAL_ID],
    chapterLabel: 'Hessischer Zahlenpfad',
  }),
  bySekIG9: personalizedView({
    viewId: 'goal-book-test-by-seki',
    // The server may select this reviewed duration-neutral authored view for
    // the uniquely inferred G9 learner request.
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-BY',
      stage: 'SekI',
    },
    targetGoalIds: [SECOND_GOAL_ID, FIRST_GOAL_ID],
    chapterLabel: 'Bayerischer Zahlenpfad',
  }),
  bySekIIGk: personalizedView({
    viewId: 'goal-book-test-by-sekii-gk',
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-BY',
      stage: 'SekII',
      courseProfile: 'GK',
      durationModel: 'G9',
    },
    targetGoalIds: [THIRD_GOAL_ID],
    chapterLabel: 'Bayerische Oberstufe',
  }),
  heSekIIGk: personalizedView({
    viewId: 'goal-book-test-he-sekii-gk-bound-error',
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-HE',
      stage: 'SekII',
      courseProfile: 'GK',
    },
    targetGoalIds: [FIRST_GOAL_ID],
    chapterLabel: 'Gebundene hessische Oberstufe GK',
  }),
  heSekIILk: personalizedView({
    viewId: 'goal-book-test-he-sekii-lk-bound-no-match',
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE-HE',
      stage: 'SekII',
      courseProfile: 'LK',
    },
    targetGoalIds: [SECOND_GOAL_ID],
    chapterLabel: 'Gebundene hessische Oberstufe LK',
  }),
}

const mathModel = JSON.parse(rawModelFixture) as Record<string, unknown>
mathModel.schemaVersion = '1.1.0'
const mathSource = mathModel.source as Record<string, unknown>
mathSource.compositionViewSources = Object.values(matchedViews).map((view) => ({
  path: `curricula/DE/Gymnasium/composition-views/mathematik/${view.viewId}.view.json`,
  viewId: view.viewId,
  scope: view.scope,
  digest: stableDigest(view),
    projectionFingerprint: stableDigest({
      viewId: view.viewId,
      scope: view.scope,
      curricularAtomicGoalIds: view.rootNodes[0].children[0].children
        .map(({ goalId }) => goalId)
        .sort(),
    }),
}))
mathModel.navigation = {
  schemaVersion: '1.0.0',
  canonicalProjectionSource: {
    path: 'app/scripts/config/goal-books/navigation/goal-book-ui.view.json',
    viewId: 'goal-book-ui-canonical',
    title: 'Kanonische Testgliederung',
    scope: { schoolForm: 'Gymnasium' },
    digest: `sha256:${'7'.repeat(64)}`,
    projectionFingerprint: `sha256:${'8'.repeat(64)}`,
  },
  goalGraph: {
    schemaVersion: '1.0.0',
    landscapeId: MATHEMATICS_LANDSCAPE_ID,
    title: 'Mathematik',
    goals: [{
      id: 'mathematik',
      title: 'Mathematik',
      contains: ['algebra', 'geometrie'],
      type: 'cluster',
      semanticKind: 'curricularArea',
    }, {
      id: 'algebra',
      title: 'Algebra',
      contains: [FIRST_GOAL_ID, SECOND_GOAL_ID],
      type: 'cluster',
      semanticKind: 'curricularArea',
    }, {
      id: 'geometrie',
      title: 'Geometrie',
      contains: [THIRD_GOAL_ID],
      type: 'cluster',
      semanticKind: 'curricularArea',
    }, ...[
      [FIRST_GOAL_ID, 'Natürliche Zahlen vergleichen'],
      [SECOND_GOAL_ID, 'Brüche addieren und begründen'],
      [THIRD_GOAL_ID, 'Flächeninhalte berechnen'],
    ].map(([id, title]) => ({
      id,
      title,
      contains: [],
      type: 'atomic',
      semanticKind: 'curricularAtomic',
    }))],
    digest: `sha256:${'6'.repeat(64)}`,
  },
}
const mathChapters = mathModel.chapters as Array<Record<string, unknown>>
mathChapters.forEach((chapter, index) => { chapter.order = index })
mathChapters[0].treeOrder = 0
mathChapters[1].treeOrder = 1
mathChapters[2].treeOrder = 4
const mathPages = mathModel.pages as Array<Record<string, unknown>>
mathPages.forEach((goalPage, index) => { goalPage.navigationOrder = index })
mathPages[0].treeOrder = 2
mathPages[1].treeOrder = 3
mathPages[2].treeOrder = 5
const modelFixture = `${JSON.stringify(mathModel, null, 2)}\n`

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
const mathFixtureSha256 = `sha256:${createHash('sha256').update(modelFixture).digest('hex')}`
const mathIndexModel = index.books[0].model as Record<string, unknown>
mathIndexModel.sha256 = mathFixtureSha256
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
  let delayNextMathModelResponse = false
  let imageRequests = 0
  const compositionViewRequests: URL[] = []

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
    if (delayNextMathModelResponse) {
      delayNextMathModelResponse = false
      await new Promise((resolve) => setTimeout(resolve, 400))
    }
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
  await page.route('**/api/ui/composition-views/match?*', async (route) => {
    const url = new URL(route.request().url())
    compositionViewRequests.push(url)
    const scopeKey = [
      url.searchParams.get('jurisdiction'),
      url.searchParams.get('stage'),
      url.searchParams.get('durationModel'),
      url.searchParams.get('courseProfile'),
    ].join('|')
    const view = scopeKey === 'DE-HE|SekI|G8|'
      ? matchedViews.heSekIG8
      : scopeKey === 'DE-BY|SekI|G9|'
        ? matchedViews.bySekIG9
        : scopeKey === 'DE-BY|SekII|G9|GK'
          ? matchedViews.bySekIIGk
          : null
    if (scopeKey === 'DE-HE|SekII||GK') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: '{invalid-json',
      })
      return
    }
    if (!view) {
      await route.fulfill({ status: 204, body: '' })
      return
    }
    if (scopeKey === 'DE-HE|SekI|G8|') {
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json; charset=utf-8',
      body: JSON.stringify(view),
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
  const chapterNavigation = page.getByRole('navigation', { name: 'Kapitel' })
  await chapterNavigation.getByTestId('goal-book-view-label')
    .filter({ hasText: 'Personalisierte Kapitelsicht' })
    .waitFor()
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByRole('link', { name: /Natürliche Zahlen vergleichen/u }).count() === 1,
    'the coupled Hesse, lower-secondary, G8 tuple filters without creating a false G9 or course-profile combination',
  )
  assert(
    (await chapterNavigation.getByTestId('goal-book-view-label').innerText())
      === 'Personalisierte Kapitelsicht · Hessen · Sekundarstufe I · G8'
      && await chapterNavigation.getByRole('button', { name: 'Alle Lernziele (1)', exact: true }).count() === 1
      && await chapterNavigation.getByRole('button', { name: /^Hessischer Zahlenpfad.*1 Lernziele$/u }).count() === 1
      && await chapterNavigation.getByRole('button', { name: /^Algebra/u }).count() === 0,
    'the complete Level-2 filter switches both target membership and tree to the bound Cockpit composition view',
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
  await page.getByTestId('goal-book-page')
    .getByRole('link', { name: new RegExp(`Brüche addieren.*${SECOND_GOAL_ID}`, 'su') })
    .click()
  await page.getByRole('heading', { name: 'Brüche addieren und begründen' }).waitFor()
  assert(
    await results.getByRole('link').count() === 1
      && await page.getByTestId('goal-book-outside-current-selection').count() === 1,
    'a bound personalized target set can show an internal prerequisite or dependent as a marked reference without widening its results',
  )
  await search.fill('kein vorhandenes lernziel')
  await results.getByRole('button', { name: 'Suche und Kapitel zurücksetzen' }).click()
  assert(
    await results.getByRole('link').count() === 1
      && (await chapterNavigation.getByTestId('goal-book-view-label').innerText())
        === 'Personalisierte Kapitelsicht · Hessen · Sekundarstufe I · G8',
    'clearing an empty search preserves the committed personalization scope',
  )
  await jurisdictionFilter.selectOption('DE-BY')
  await stageFilter.selectOption('SekI')
  await chapterNavigation.getByTestId('goal-book-view-label')
    .filter({ hasText: 'Personalisierte Kapitelsicht · Bayern · Sekundarstufe I · G9' })
    .waitFor()
  assert(
    !await durationFilter.isDisabled()
      && await durationFilter.locator('option[value="G8"]').count() === 0
      && await durationFilter.locator('option[value="G9"]').count() === 1,
    'Bavaria lower-secondary infers its sole G9 scope, requests the matching view, and labels that resolved scope',
  )
  const bavariaSekIResultTexts = await results.getByRole('link').allInnerTexts()
  assert(
    bavariaSekIResultTexts.length === 2
      && bavariaSekIResultTexts[0].includes('Brüche addieren und begründen')
      && bavariaSekIResultTexts[1].includes('Natürliche Zahlen vergleichen'),
    'the personalized result list follows authored Composition View order instead of BookModel page order',
  )
  await page.getByRole('heading', { name: 'Brüche addieren und begründen' }).waitFor()
  await page.getByTestId('goal-book-page')
    .getByRole('link', { name: 'Nächstes Lernziel' })
    .click()
  await page.getByRole('heading', { name: 'Natürliche Zahlen vergleichen' }).waitFor()
  assert(
    page.url().endsWith(`#goal-${FIRST_GOAL_ID}`),
    'the personalized next-goal action follows the same authored Composition View order',
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
  await chapterNavigation.getByTestId('goal-book-view-label')
    .filter({ hasText: 'Personalisierte Kapitelsicht · Bayern · Sekundarstufe II · G9 · GK' })
    .waitFor()
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 1,
    'duration and course profile match one exact upper-secondary state tuple',
  )

  await jurisdictionFilter.selectOption('DE-HE')
  await stageFilter.selectOption('SekII')
  await courseFilter.selectOption('GK')
  await page.getByTestId('goal-book-personalized-projection-status')
    .filter({ hasText: 'konnte nicht geladen werden' })
    .waitFor()
  assert(
    await page.getByRole('navigation', { name: 'Kapitel' }).count() === 0
      && await page.getByRole('region', { name: 'Lernziele' }).count() === 0,
    'a matcher error fails closed without exposing the canonical tree or target list',
  )
  await courseFilter.selectOption('LK')
  await page.getByTestId('goal-book-personalized-projection-status')
    .filter({ hasText: 'keine geprüfte Kapitelsicht verfügbar' })
    .waitFor()
  assert(
    await page.getByRole('navigation', { name: 'Kapitel' }).count() === 0,
    'a 204 no-match response also fails closed instead of widening to the atlas',
  )

  await jurisdictionFilter.selectOption('')
  await jurisdictionFilter.selectOption('DE-HE')
  await stageFilter.selectOption('SekI')
  await durationFilter.selectOption('G8')
  await jurisdictionFilter.selectOption('')
  await page.waitForTimeout(180)
  assert(
    await stageFilter.isDisabled()
      && await results.getByRole('link').count() === 3
      && await chapterNavigation.getByRole('button', { name: 'Alle Lernziele (3)', exact: true }).count() === 1
      && await chapterNavigation.getByTestId('goal-book-view-label').innerText() === 'Kanonische Gesamtsicht',
    'clearing the state aborts the delayed matcher and keeps the canonical view instead of applying a stale response',
  )
  await search.fill(THIRD_GOAL_ID)
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByText(THIRD_GOAL_ID, { exact: true }).count() === 1,
    'search matches a full stable learning-goal ID',
  )
  await search.fill('natürliche vergleichen')
  assert(
    await results.getByRole('link', { name: /Natürliche Zahlen vergleichen/u }).count() === 1
      && await chapterNavigation.getByRole('button', { name: 'Alle Lernziele (3)', exact: true }).count() === 1,
    'search matches normalized title terms without rewriting the chapter projection or its counts',
  )

  await search.fill('')
  const geometryToggle = chapterNavigation.getByRole('button', {
    name: 'Kapitel aufklappen: Geometrie',
    exact: true,
  })
  await geometryToggle.click()
  const expandedGeometryToggle = chapterNavigation.getByRole('button', {
    name: 'Kapitel einklappen: Geometrie',
    exact: true,
  })
  assert(
    await expandedGeometryToggle.getAttribute('aria-expanded') === 'true'
      && await results.getByRole('link').count() === 3
      && await chapterNavigation.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 1,
    'the dedicated chapter chevron expands the recursive tree without selecting or filtering the row',
  )
  await chapterNavigation
    .getByRole('button', { name: /^Geometrie.*1 Lernziele$/u })
    .click()
  await results.getByRole('link', { name: /Natürliche Zahlen vergleichen/u })
    .waitFor({ state: 'hidden' })
  assert(
    await results.getByRole('link').count() === 1
      && await results.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 1,
    'chapter navigation restricts the result list to the selected chapter',
  )
  await chapterNavigation.getByRole('button', {
    name: 'Kapitel einklappen: Geometrie',
    exact: true,
  }).click()
  assert(
    await chapterNavigation.getByRole('button', {
      name: 'Kapitel aufklappen: Geometrie',
      exact: true,
    }).getAttribute('aria-expanded') === 'false'
      && await chapterNavigation.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 0
      && await results.getByRole('link', { name: /Flächeninhalte berechnen/u }).count() === 1,
    'a selected chapter can still be collapsed without changing its result scope',
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
  await page.getByTestId('goal-book-page')
    .getByRole('link', { name: new RegExp(`Brüche addieren.*${SECOND_GOAL_ID}`, 'su') })
    .click()
  await page.getByRole('heading', { name: 'Brüche addieren und begründen' }).waitFor()
  assert(
    await results.getByRole('link').count() === 3,
    'an internal relation outside the selected chapter clears only that chapter narrowing and opens its target',
  )

  await chapterNavigation
    .getByRole('button', { name: /Alle Lernziele/u })
    .click()
  const algebraRow = chapterNavigation.getByRole('button', { name: /^Algebra.*2 Lernziele$/u })
  await algebraRow.focus()
  await algebraRow.press('ArrowRight')
  assert(
    await chapterNavigation.getByRole('button', {
      name: 'Kapitel einklappen: Algebra',
      exact: true,
    }).getAttribute('aria-expanded') === 'true'
      && await results.getByRole('link').count() === 3,
    'right-arrow keyboard navigation expands a chapter without changing the selected result scope',
  )
  await chapterNavigation
    .getByRole('link', { name: new RegExp(`Brüche addieren.*${SECOND_GOAL_ID}`, 'su') })
    .click()
  await page.getByRole('heading', { name: 'Brüche addieren und begründen' }).waitFor()
  assert(
    await results.getByRole('link').count() === 3,
    'selecting an atomic tree leaf clears a different chapter filter so the requested goal opens',
  )
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
      && await page.getByTestId('goal-book-pdf').getAttribute('href') === PHYSICS_PDF_PATH
      && await page.getByText('Das verlinkte Lernziel gehört nicht zu dieser Ausgabe.').count() === 0,
    'a stable subject deep link loads only the selected physics model and follows it with the physics PDF',
  )
  const physicsSearch = page.getByLabel('Lernziele durchsuchen')
  const physicsJurisdiction = page.getByLabel('Bundesland')
  await physicsJurisdiction.selectOption('DE-HE')
  await page.getByRole('navigation', { name: 'Kapitel' })
    .getByRole('button', { name: /^Algebra.*2 Lernziele$/u })
    .click()
  await physicsSearch.fill('physik-zustand-aus-vorherigem-fach')
  delayNextMathModelResponse = true
  await page.goBack()
  await page.getByRole('status').filter({ hasText: 'Lernzielbuch wird geladen' }).waitFor()
  assert(
    await page.getByRole('heading', { name: 'Lernzielbuch Physik – bundesweiter Atlas' }).count() === 0
      && await page.getByTestId('goal-book-page').count() === 0
      && await page.getByTestId('goal-book-pdf').getAttribute('aria-disabled') === 'true',
    'browser history hides the stale subject model, detail, and PDF while the previous subject reloads',
  )
  await page.getByRole('heading', { name: 'Lernzielbuch Mathematik – bundesweiter Atlas' }).waitFor()
  assert(
    await page.getByLabel('Lernziele durchsuchen').inputValue() === ''
      && await page.getByLabel('Bundesland').inputValue() === ''
      && await page.getByRole('region', { name: 'Lernziele' }).getByRole('link').count() === 3
      && await page.evaluate(() => window.location.hash) === '',
    'browser Back resets search, chapter, hash, and Level-2 filters like an explicit subject-tab change',
  )
  await page.goForward()
  await page.getByRole('heading', { name: 'Lernzielbuch Physik – bundesweiter Atlas' }).waitFor()
  assert(
    await page.getByLabel('Lernziele durchsuchen').inputValue() === ''
      && await page.getByLabel('Bundesland').inputValue() === ''
      && await page.getByRole('region', { name: 'Lernziele' }).getByRole('link').count() === 3,
    'browser Forward applies the same centralized clean subject state',
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

  const goalPage = page.getByTestId('goal-book-page')
  const feedbackLink = goalPage.getByRole('link', {
    name: 'Feedback zu „Natürliche Zahlen vergleichen“',
  })
  assert(
    await feedbackLink.count() === 1
      && await page.locator('form').count() === 0
      && await page.getByText('Feedback-Pilot', { exact: true }).count() === 0,
    'feedback is attached to the visible goal page without placing a form or ambiguous global pilot below the book',
  )
  const feedbackHref = await feedbackLink.getAttribute('href')
  const feedbackUrl = new URL(feedbackHref ?? '', 'https://skillpilot.test')
  assert(
    feedbackUrl.pathname === '/lernziel-feedback'
      && feedbackUrl.searchParams.get('bookId') === 'de-gym-physik-bundesweit'
      && feedbackUrl.searchParams.get('goalId') === FIRST_GOAL_ID
      && feedbackUrl.searchParams.get('edition') === 'curricular-atomic-v1'
      && feedbackUrl.searchParams.get('goalFingerprint')?.startsWith('sha256:') === true
      && feedbackUrl.searchParams.get('pageFingerprint')?.startsWith('sha256:') === true
      && feedbackUrl.searchParams.get('bookDigest')?.startsWith('sha256:') === true,
    'the goal-local feedback action is bound to the exact edition and fingerprints',
  )
  assert(
    requests.every(({ method }) => method === 'GET')
      && requests.every(({ pathname }) => (
        !pathname.startsWith('/api/')
        || pathname === '/api/ui/composition-views/match'
      ))
      && requests.filter(({ pathname }) => pathname.startsWith('/api/')).every(({ pathname }) => (
        !pathname.toLocaleLowerCase('en-US').includes('learner')
        && !pathname.toLocaleLowerCase('en-US').includes('feedback')
      )),
    `the book view made a learner, feedback-intake, or mutation request before the action was opened: ${JSON.stringify(requests)}`,
  )
  assert(
    compositionViewRequests.length >= 3
      && compositionViewRequests.every((url) => (
        url.origin === new URL(server.baseUrl).origin
        && url.searchParams.get('landscapeId') === MATHEMATICS_LANDSCAPE_ID
        && url.searchParams.get('schoolForm') === 'Gymnasium'
      )),
    'personalized chapter views are resolved only through same-origin, scope-bound matcher GETs',
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
