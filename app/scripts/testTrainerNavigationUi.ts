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

  await context.close()
  console.log('Trainer navigation UI regression test passed.')
} finally {
  await browser?.close()
  await server.close()
}
