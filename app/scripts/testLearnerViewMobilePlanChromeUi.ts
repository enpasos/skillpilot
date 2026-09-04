import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import { chromium, type Browser, type Route } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/learnerViewMobilePlanChromeUi.html',
  { plugins: [tailwindcss()] },
)

const plan = (
  planId: string,
  landscapeId: string,
  planLabel: string,
  openDueThroughToday: number,
  nextGoalId: string,
) => ({
  planId,
  revision: 4,
  landscapeId,
  planLabel,
  stale: false,
  period: { startDate: '2026-09-01', endDate: '2027-06-30' },
  currentBlock: {
    blockId: `${planId}-current`,
    kind: 'learning',
    title: 'Aktueller Lernabschnitt',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  },
  nextMilestone: null,
  metrics: {
    dueThroughToday: 6,
    completedDueThroughToday: 6 - openDueThroughToday,
    openDueThroughToday,
    dueToday: Math.min(2, openDueThroughToday),
    completedDueToday: 0,
    openDueToday: Math.min(2, openDueThroughToday),
    totalPlanned: 24,
  },
  buffer: { totalWorkdays: 5, remainingWorkdays: 5 },
  pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
  nextEligibleGoal: { goalId: nextGoalId },
  continueReason: null,
  canContinue: true,
})

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const context = await browser.newContext({
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    viewport: { width: 390, height: 844 },
  })
  await context.addInitScript({
    content: "localStorage.setItem('skillpilot_lang', 'de'); localStorage.setItem('skillpilot_theme', 'light');",
  })

  const page = await context.newPage()
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })

  await page.route('**/api/ui/curriculum-catalog', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      catalogApiVersion: '1.2',
      generationSha256: '0'.repeat(64),
      packages: [],
      rootLandscapeIds: [],
      landscapes: [],
      views: [],
      offerings: [],
      decks: [],
      resources: [],
      sourceEvidence: [],
    }),
  }))
  const handleLearnerRequest = (route: Route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    const json = (body: unknown) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })

    if (pathname.endsWith('/resume')) {
      return json({
        lastActivityAt: '2026-09-04T08:00:00Z',
        scheduledDeletionAt: '2027-03-04T08:00:00Z',
      })
    }
    if (pathname.endsWith('/state')) {
      return json({
        activeGoal: { id: 'math-goal-1' },
        frontier: [],
        goals: {
          planned: [{ id: 'math-goal-1' }],
          mastered_count: 0,
          total_count: 2,
        },
        stateMachine: {
          activeGoal: { id: 'math-goal-1' },
          goalOptions: [],
          requiredAction: null,
        },
      })
    }
    if (pathname.endsWith('/planned')) return json({ goals: ['math-goal-1'] })
    if (pathname.endsWith('/learning-plans')) {
      return json({
        asOf: '2026-09-04',
        followLearningPlans: true,
        plans: [
          plan('math-plan', 'math/sek-i', 'Mathematik bis Klasse 10', 2, 'math-goal-1'),
          plan('physics-plan', 'physics/sek-ii', 'Physik Oberstufe', 3, 'physics-goal-1'),
        ],
      })
    }
    if (pathname === '/api/ui/learners/learner-42') {
      return json({
        skillpilotId: 'learner-42',
        createdAt: '2026-09-01T08:00:00Z',
        selectedCurriculum: 'school-root',
        personalCurriculum: '',
        learningStrategy: 'SEQUENTIAL',
        autoPilot: false,
        followLearningPlans: true,
        strictMode: false,
        showGoalVisualizationsInChat: true,
        copySources: [],
        activeGoalId: 'math-goal-1',
      })
    }
    return route.fulfill({ status: 404, body: 'Unexpected learner fixture request' })
  }
  await page.route('**/api/ui/learners/learner-42', handleLearnerRequest)
  await page.route('**/api/ui/learners/learner-42/**', handleLearnerRequest)

  await page.goto(`${server.baseUrl}/scripts/fixtures/learnerViewMobilePlanChromeUi.html`)
  const menuButton = page.getByRole('button', { name: 'Lernzielmenü öffnen' })
  const overview = page.getByTestId('learner-plan-today-overview')
  await menuButton.waitFor()
  try {
    await overview.getByRole('heading', { name: 'Heute' }).waitFor({ timeout: 10_000 })
  } catch (error) {
    const body = await page.locator('body').innerText()
    throw new Error(`LearnerView did not render Today overview. Body:\n${body}\nBrowser errors:\n${browserErrors.join('\n')}`, { cause: error })
  }
  await overview.getByText('5 Planziele sind bis heute noch offen.').waitFor()

  const menuBox = await menuButton.boundingBox()
  const overviewBox = await overview.boundingBox()
  assert(menuBox && overviewBox, 'mobile menu and Today overview must have measurable boxes')
  assert(menuBox.width >= 44 && menuBox.height >= 44, `mobile menu needs a 44px target: ${JSON.stringify(menuBox)}`)
  assert(
    menuBox.y + menuBox.height <= overviewBox.y,
    `mobile menu must not overlap Today overview: menu=${JSON.stringify(menuBox)}, overview=${JSON.stringify(overviewBox)}`,
  )
  assert.equal(await menuButton.getAttribute('aria-controls'), 'learner-goal-sidebar')
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    true,
    'the real LearnerView must not overflow the 390px viewport',
  )

  await menuButton.click()
  const sidebar = page.locator('#learner-goal-sidebar')
  await page.waitForFunction(() => {
    const element = document.getElementById('learner-goal-sidebar')
    return Boolean(element && element.getBoundingClientRect().left >= 0)
  })
  assert.equal(await sidebar.getByRole('heading', { name: 'Meine Lernziele' }).isVisible(), true)
  const closeButton = sidebar.getByRole('button', { name: 'Lernzielmenü schließen' })
  const closeBox = await closeButton.boundingBox()
  assert(closeBox && closeBox.width >= 44 && closeBox.height >= 44, 'mobile close action needs a 44px target')
  await closeButton.click()
  await menuButton.waitFor()

  assert.equal(browserErrors.length, 0, `mobile LearnerView browser errors:\n${browserErrors.join('\n')}`)
  await context.close()
  console.log('mobile LearnerView plan chrome browser regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
