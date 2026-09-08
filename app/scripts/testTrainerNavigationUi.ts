import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Page } from 'playwright'

import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const landscapeId = 'trainer-navigation-landscape'
const classId = 'trainer-navigation-class'
const rootGoalId = 'trainer-root'
const firstGoalId = 'trainer-goal-one'
const secondGoalId = 'trainer-goal-two'

const goal = (
  id: string,
  title: string,
  contains: string[] = [],
) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} erklären.`,
  core: true,
  weight: 1,
  tags: id === rootGoalId ? ['root', 'GK'] : ['GK'],
  dimensionTags: {
    framework: 'trainer-navigation-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Navigation',
  },
  courseLevel: 'GK',
  requires: [],
  contains,
  examples: [],
})

const landscape = {
  landscapeId,
  locale: 'de-DE',
  subject: 'Navigationstest',
  frameworkId: 'trainer-navigation-test',
  title: 'Lehrkräfte-Navigationstest',
  description: 'Deterministische Testlandschaft für die Lehrkräfte-Navigation.',
  filters: [
    { id: 'all', label: 'Alle' },
    { id: 'GK', label: 'Grundkurs' },
  ],
  goals: [
    goal(rootGoalId, 'Navigationswurzel', [firstGoalId, secondGoalId]),
    goal(firstGoalId, 'Erstes Ziel'),
    goal(secondGoalId, 'Zweites Ziel'),
  ],
}

interface HistoryProbeEntry {
  kind: 'push' | 'replace' | 'popstate'
  href: string
}

interface HistoryProbeSnapshot {
  entries: HistoryProbeEntry[]
  length: number
}

const readHistoryProbe = (page: Page): Promise<HistoryProbeSnapshot> => page.evaluate(() => {
  const probe = (window as Window & {
    __trainerNavigationHistoryProbe?: { entries: HistoryProbeEntry[] }
  }).__trainerNavigationHistoryProbe
  return {
    entries: probe?.entries ?? [],
    length: window.history.length,
  }
})

const clearHistoryProbe = (page: Page) => page.evaluate(() => {
  const probe = (window as Window & {
    __trainerNavigationHistoryProbe?: { entries: HistoryProbeEntry[] }
  }).__trainerNavigationHistoryProbe
  if (probe) probe.entries.length = 0
})

const visibleGoalHeading = (page: Page, title: string) =>
  page.locator('main').getByRole('heading', { name: title, exact: true })

const selectTreeGoal = async (page: Page, title: string) => {
  const treeAside = page.locator('aside').nth(1)
  try {
    await treeAside.getByTitle(new RegExp(`^${title}(?: \\(|$)`, 'u')).click({ timeout: 10_000 })
  } catch (error) {
    const asideText = (await treeAside.textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n`
      + `Tree text: ${asideText.slice(0, 1_000)}`,
    )
  }
}

const waitForStableGoal = async (
  page: Page,
  goalId: string,
  title: string,
) => {
  try {
    await page.waitForURL((url) => url.pathname === `/trainer/${goalId}`, { timeout: 10_000 })
    await visibleGoalHeading(page, title).waitFor({ timeout: 10_000 })
  } catch (error) {
    const bodyText = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n`
      + `Current URL: ${page.url()}\nVisible body: ${bodyText.slice(0, 1_000)}`,
    )
  }
  await page.waitForTimeout(250)
  assert(
    new URL(page.url()).pathname === `/trainer/${goalId}`
      && await visibleGoalHeading(page, title).count() === 1,
    `${title} remains synchronized with /trainer/${goalId} after settling`,
  )
}

const assertSingleHistoryEntry = (
  before: HistoryProbeSnapshot,
  after: HistoryProbeSnapshot,
  expectedGoalId: string,
) => {
  assert(
    after.length === before.length + 1,
    `selecting ${expectedGoalId} adds exactly one browser-history entry`,
  )
  const actionEntries = after.entries.slice(before.entries.length)
  const pushes = actionEntries.filter((entry) => entry.kind === 'push')
  assert(
    actionEntries.length === 1
      && pushes.length === 1
      && new URL(pushes[0].href).pathname === `/trainer/${expectedGoalId}`,
    `selecting ${expectedGoalId} performs exactly one history mutation, a pushState to its trainer URL; got ${JSON.stringify(actionEntries)}`,
  )
}

const assertNoWildcardFilterFlicker = (entries: HistoryProbeEntry[]) => {
  const wildcardEntries = entries.filter((entry) => {
    const url = new URL(entry.href)
    return url.pathname.startsWith('/trainer')
      && url.searchParams.getAll('f').some((value) => value.toLowerCase() === 'all')
  })
  assert(
    wildcardEntries.length === 0,
    `trainer navigation never flashes through f=all; got ${JSON.stringify(wildcardEntries)}`,
  )
}

const installApi = async (page: Page) => {
  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (pathname === `/api/ui/landscapes/${landscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([landscape]),
      })
      return
    }
    if (pathname === '/api/ui/landscapes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summaries: [landscape] }),
      })
      return
    }

    await route.fulfill({ status: 404, body: '' })
  })
}

const testPlanningSubjectNavigation = async (browser: Browser, baseUrl: string) => {
  const rootLandscapeId = 'trainer-navigation-curriculum'
  const physicsLandscapeId = 'trainer-navigation-physics'
  const learnerId = '11111111-2222-4333-8444-555555555555'
  const personalConfig = {
    [rootLandscapeId]: { selected: true, filterId: 'DE-HE', stage: 'sek2' },
    [landscapeId]: { selected: true, filterId: 'GK' },
    [physicsLandscapeId]: { selected: true, filterId: 'GK' },
  }
  const makeLandscape = (id: string, subject: string, childIds: string[]) => ({
    ...landscape,
    landscapeId: id,
    subject,
    title: subject,
    frameworkId: 'canonical-gymnasium-navigation-test',
    goals: [
      { ...goal(`${id}-root`, subject, childIds), tags: ['root', 'GK', 'DE-HE'] },
      ...childIds.map((childId) => ({ ...goal(childId, `${subject} Lernziel`), tags: ['GK', 'DE-HE'] })),
    ],
  })
  const subjectLandscapes = [
    makeLandscape(landscapeId, 'Mathematik', [`${landscapeId}-atomic`]),
    makeLandscape(physicsLandscapeId, 'Physik', [`${physicsLandscapeId}-atomic`]),
  ]
  const rootLandscape = makeLandscape(rootLandscapeId, 'Gymnasium', [])
  rootLandscape.goals[0].contains = subjectLandscapes.map(({ landscapeId: id }) => `${id}-root`)
  const allLandscapes = [rootLandscape, ...subjectLandscapes]
  const context = await browser.newContext({ locale: 'de-DE' })
  await context.addInitScript((seed) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: seed.classId,
      name: 'Fächerübergreifende Planung',
      landscapeId: seed.landscapeId,
      rootLandscapeId: seed.rootLandscapeId,
      activeFilter: 'DE-HE',
      personalConfig: seed.personalConfig,
      students: [{ id: seed.learnerId, name: 'Alex', accessMode: 'learner-id' }],
      source: 'existing-learner',
    }]))
  }, { classId, landscapeId, rootLandscapeId, learnerId, personalConfig })
  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  let delayCompositionLandscapeId: string | null = null
  let releaseComposition: (() => void) | undefined
  let compositionResponse: Promise<void> | undefined
  await page.route('**/api/ui/**', async (route) => {
    const url = new URL(route.request().url())
    const json = (body: unknown) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
    if (url.pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
    } else if (url.pathname === '/api/ui/landscapes') {
      await json({ summaries: allLandscapes })
    } else if (url.pathname.endsWith('/closure')) {
      await json(allLandscapes)
    } else if (url.pathname === '/api/ui/composition-views/match') {
      const requestedLandscapeId = url.searchParams.get('landscapeId')!
      if (requestedLandscapeId === delayCompositionLandscapeId) {
        await compositionResponse
      }
      await json({
        viewId: `navigation-${requestedLandscapeId}`,
        landscapeId: requestedLandscapeId,
        scope: { jurisdiction: 'DE-HE', schoolForm: 'Gymnasium', stage: 'SekII', courseProfile: 'GK' },
        rootNodes: [{
          kind: 'structure', id: 'sek2', label: 'Sekundarstufe II',
          children: [{ kind: 'canonicalSubtree', goalId: `${requestedLandscapeId}-root` }],
        }],
      })
    } else if (url.pathname === `/api/ui/learners/${learnerId}`) {
      await json({ skillpilotId: learnerId, personalCurriculum: JSON.stringify(personalConfig) })
    } else if (url.pathname === `/api/ui/learners/${learnerId}/mastery`) {
      await json({ mastery: {} })
    } else if (url.pathname === `/api/ui/learners/${learnerId}/planning-scope`) {
      const requestedLandscapeId = url.searchParams.get('landscapeId')!
      await json({
        curriculumId: rootLandscapeId,
        landscapeId: requestedLandscapeId,
        scopeAtomicGoalIds: [`${requestedLandscapeId}-atomic`],
        openAtomicGoalIds: [`${requestedLandscapeId}-atomic`],
        totalAtomicGoalCount: 1,
        masteredAtomicGoalCount: 0,
        capturedAt: new Date().toISOString(),
      })
    } else if (url.pathname === `/api/ui/learners/${learnerId}/learning-plans`) {
      await json({ asOf: url.searchParams.get('asOf'), followLearningPlans: false, plans: [] })
    } else {
      await route.fulfill({ status: 404, body: '' })
    }
  })

  try {
    await page.goto(`${baseUrl}/scripts/fixtures/trainerNavigationUi.html`)
    await page.getByText('Fächerübergreifende Planung', { exact: true }).click()
    await page.getByRole('button', { name: 'Planung', exact: true }).click()
    const activation = page.getByTestId('trainer-learning-plan-activation')
    await activation.getByRole('button', { name: 'Fachplan bearbeiten: Physik', exact: true }).waitFor()

    for (const [subjectId, subject] of [[physicsLandscapeId, 'Physik'], [landscapeId, 'Mathematik']]) {
      delayCompositionLandscapeId = subjectId
      const requestObserved = page.waitForRequest((request) => {
        const url = new URL(request.url())
        return url.pathname === '/api/ui/composition-views/match'
          && url.searchParams.get('landscapeId') === subjectId
      })
      compositionResponse = new Promise<void>((resolve) => { releaseComposition = resolve })
      await activation.getByRole('button', { name: `Fachplan bearbeiten: ${subject}`, exact: true }).click()
      await requestObserved
      await page.getByTestId('trainer-course-plan-view').waitFor()
      assert(
        await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).count() === 0,
        `switching to ${subject} keeps the course open while its composition is loading`,
      )
      delayCompositionLandscapeId = null
      releaseComposition?.()
      await activation.getByRole('button', { name: `Fachplan bearbeiten: ${subject}`, exact: true }).waitFor()
      await page.waitForFunction((id) => {
        const url = new URL(location.href)
        return url.searchParams.get('l') === id
          && url.searchParams.get('view') === 'plan'
          && decodeURIComponent(url.pathname).startsWith('/trainer/')
          && decodeURIComponent(url.pathname).includes(id)
      }, subjectId)
      assert(
        await activation.getByRole('button', { name: `Fachplan bearbeiten: ${subject}`, exact: true }).getAttribute('aria-pressed') === 'true',
        `the ${subject} plan is active after its delayed composition resolves`,
      )
      assert(
        await page.getByRole('button', { name: 'Planung', exact: true }).getAttribute('aria-current') === 'page',
        'the selected planning workspace survives the subject switch',
      )
    }
    await page.getByRole('button', { name: /Alle Klassen$/u }).click()
    await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
    assert(browserErrors.length === 0, `planning subject navigation browser errors:\n${browserErrors.join('\n')}`)
  } catch (error) {
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nCurrent URL: ${page.url()}\nVisible body: ${(await page.locator('body').innerText()).slice(0, 4_000)}`)
  } finally {
    releaseComposition?.()
    await context.close()
  }
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/trainerNavigationUi.html',
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
  const context = await browser.newContext({ locale: 'de-DE' })
  await context.addInitScript(({ fixtureClassId, fixtureLandscapeId }) => {
    if (sessionStorage.getItem('skillpilot_trainer_navigation_seeded') === 'true') return
    sessionStorage.setItem('skillpilot_trainer_navigation_seeded', 'true')
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', fixtureLandscapeId)
    localStorage.setItem('skillpilot_active_class', fixtureClassId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: fixtureClassId,
      name: 'Navigationstest',
      landscapeId: fixtureLandscapeId,
      activeFilter: 'GK',
      students: [],
      currentGoalId: 'trainer-root',
    }]))

    const historyProbe = { entries: [] as HistoryProbeEntry[] }
    ;(window as Window & {
      __trainerNavigationHistoryProbe?: typeof historyProbe
    }).__trainerNavigationHistoryProbe = historyProbe

    const originalPushState = history.pushState.bind(history)
    const originalReplaceState = history.replaceState.bind(history)
    history.pushState = (...args) => {
      originalPushState(...args)
      historyProbe.entries.push({ kind: 'push', href: location.href })
    }
    history.replaceState = (...args) => {
      originalReplaceState(...args)
      historyProbe.entries.push({ kind: 'replace', href: location.href })
    }
    window.addEventListener('popstate', () => {
      historyProbe.entries.push({ kind: 'popstate', href: location.href })
    })
  }, { fixtureClassId: classId, fixtureLandscapeId: landscapeId })

  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  await installApi(page)

  await page.goto(`${server.baseUrl}/scripts/fixtures/trainerNavigationUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await clearHistoryProbe(page)

  const beforeClassOpen = await readHistoryProbe(page)
  await page.getByText('Navigationstest', { exact: true }).click()
  await waitForStableGoal(page, rootGoalId, 'Navigationswurzel')
  const afterClassOpen = await readHistoryProbe(page)
  assertSingleHistoryEntry(beforeClassOpen, afterClassOpen, rootGoalId)

  const beforeFirstClick = afterClassOpen
  await selectTreeGoal(page, 'Erstes Ziel')
  await waitForStableGoal(page, firstGoalId, 'Erstes Ziel')
  const afterFirstClick = await readHistoryProbe(page)
  assertSingleHistoryEntry(beforeFirstClick, afterFirstClick, firstGoalId)

  const beforeSecondClick = afterFirstClick
  await selectTreeGoal(page, 'Zweites Ziel')
  await waitForStableGoal(page, secondGoalId, 'Zweites Ziel')
  const afterSecondClick = await readHistoryProbe(page)
  assertSingleHistoryEntry(beforeSecondClick, afterSecondClick, secondGoalId)

  const historyLengthBeforeTraversal = afterSecondClick.length
  await page.goBack()
  await waitForStableGoal(page, firstGoalId, 'Erstes Ziel')
  assert(
    (await readHistoryProbe(page)).length === historyLengthBeforeTraversal,
    'browser Back changes the active trainer entry without adding history',
  )

  await page.goForward()
  await waitForStableGoal(page, secondGoalId, 'Zweites Ziel')
  assert(
    (await readHistoryProbe(page)).length === historyLengthBeforeTraversal,
    'browser Forward restores the trainer entry without adding history',
  )

  await page.goBack()
  await waitForStableGoal(page, firstGoalId, 'Erstes Ziel')
  await page.goBack()
  await waitForStableGoal(page, rootGoalId, 'Navigationswurzel')
  await page.goBack()
  await page.waitForURL((url) => url.pathname === '/trainer')
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await page.waitForTimeout(350)
  assert(
    (await readHistoryProbe(page)).length === historyLengthBeforeTraversal,
    'browser Back returns through every trainer depth without adding history',
  )

  await page.getByText('Navigationstest', { exact: true }).click()
  await waitForStableGoal(page, rootGoalId, 'Navigationswurzel')
  await page.getByRole('button', { name: /Alle Klassen$/u }).click()
  await page.waitForURL((url) => url.pathname === '/trainer')
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await page.waitForTimeout(350)
  assert(
    new URL(page.url()).pathname === '/trainer'
      && await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).count() === 1,
    'Alle Klassen remains stably on the /trainer overview',
  )

  const historyLengthBeforeAllClassesBack = (await readHistoryProbe(page)).length
  await page.goBack()
  await waitForStableGoal(page, rootGoalId, 'Navigationswurzel')
  assert(
    (await readHistoryProbe(page)).length === historyLengthBeforeAllClassesBack,
    'browser Back after Alle Klassen restores the previous class context without adding history',
  )

  const finalProbe = await readHistoryProbe(page)
  assertNoWildcardFilterFlicker(finalProbe.entries)
  assert(
    browserErrors.length === 0,
    `trainer navigation browser errors:\n${browserErrors.join('\n')}`,
  )

  const historyLengthBeforeTrainerExit = await page.evaluate(() => history.length)
  await page.getByRole('button', { name: 'Logout / Startseite', exact: true }).click()
  await page.waitForURL((url) => url.pathname === '/')
  const logoutState = await page.evaluate(() => ({
    role: localStorage.getItem('skillpilot_role'),
    skillpilotId: localStorage.getItem('skillpilot_id'),
    uiSessionId: sessionStorage.getItem('skillpilot_ui_session_id'),
    historyLength: history.length,
  }))
  assert(
    logoutState.role === null
      && logoutState.skillpilotId === null
      && logoutState.uiSessionId === null,
    `trainer exit clears session identity before returning to the start page; got ${JSON.stringify(logoutState)}`,
  )
  assert(
    logoutState.historyLength === historyLengthBeforeTrainerExit,
    'trainer exit replaces the active trainer entry instead of adding another browser-history entry',
  )
  assert(
    browserErrors.length === 0,
    `trainer exit browser errors:\n${browserErrors.join('\n')}`,
  )

  await context.close()
  await testPlanningSubjectNavigation(browser, server.baseUrl)
  console.log('Trainer navigation UI regression test passed.')
} finally {
  await browser?.close()
  await server.close()
}
