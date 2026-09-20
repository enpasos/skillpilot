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
  buffer: { totalWorkdays: 5, remainingWorkdays: 5 },
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
  const unexpectedRequests: string[] = []
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
  let storedPeriodBasis: 'DAY' | 'WEEK' = 'DAY'
  let unavailableStatus = false
  let omitStatus = false
  const preferenceWrites: Array<Record<string, unknown>> = []
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
    if (pathname.endsWith('/content-selection') && request.method() === 'GET') {
      return json({ revision: 0, selectedPackageIds: [], packages: [] })
    }
    if (pathname.endsWith('/content-materials') && request.method() === 'GET') {
      return json([])
    }
    if (pathname.endsWith('/preferences') && request.method() === 'PUT') {
      const preferences = request.postDataJSON()
      preferenceWrites.push(preferences)
      storedPeriodBasis = preferences.learningPlanPeriodBasis
      return json({ learningPlanPeriodBasis: storedPeriodBasis })
    }
    if (pathname.endsWith('/learning-plans')) {
      assert.equal(new URL(request.url()).searchParams.get('language'), 'de', 'the cockpit requests explicit display language')
      const subject = (key: string, label: string) => ({
        subjectKey: key, landscapeIds: [key === 'mathematik' ? 'math/sek-i' : 'physics/sek-ii'], subjectLabel: label, evaluable: true,
        periodText: storedPeriodBasis === 'DAY' ? 'Tagesziel 0 von 2' : 'Wochenziel 1 von 8', planStatusText: '2 Lernziele im R\u00fcckstand',
        subjectLine: `${label}: Tagesziel 0 von 2 \u00b7 2 Lernziele im R\u00fcckstand`,
        statusDirection: 'behind', current: key === 'mathematik', canContinue: true,
      })
      const subjects = [subject('mathematik', 'Mathematik'), subject('physik', 'Physik')]
      const status = {
        asOf: '2026-09-04', periodBasis: storedPeriodBasis,
        periodStart: storedPeriodBasis === 'WEEK' ? '2026-08-31' : '2026-09-04',
        periodEnd: storedPeriodBasis === 'WEEK' ? '2026-09-06' : '2026-09-04',
        timeZone: 'Europe/Berlin', language: 'de',
        evaluable: !unavailableStatus,
        statusText: subjects.map((entry) => entry.subjectLine).join('\n'),
        noticeText: unavailableStatus ? '2 Fachpläne nicht auswertbar (Mathematik, Physik).' : null,
        activeGoal: { title: 'Lineare Gleichungen lösen', announcement: 'Dein aktives Lernziel: Lineare Gleichungen lösen' },
        followLearningPlans: true, resumeAvailable: true,
        subjects: unavailableStatus ? subjects.map((entry) => ({ ...entry, evaluable: false, periodText: null, planStatusText: null, subjectLine: null, statusDirection: null, canContinue: false })) : subjects, unavailablePlanCount: unavailableStatus ? 2 : 0,
      }
      return json({
        asOf: '2026-09-04',
        followLearningPlans: true,
        status: omitStatus ? undefined : status,
        plans: unavailableStatus ? [] : [
          plan('math-plan', 'math/sek-i', 'Mathematik bis Klasse 10', 'math-goal-1'),
          plan('physics-plan', 'physics/sek-ii', 'Physik Oberstufe', 'physics-goal-1'),
        ],
      })
    }
    if (pathname === '/api/ui/learners/learner-42') {
      return json({
        skillpilotId: 'learner-42',
        createdAt: '2026-09-01T08:00:00Z',
        selectedCurriculum: 'school-root',
        personalCurriculum: JSON.stringify({ 'math/sek-i': { selected: true }, 'physics/sek-ii': { selected: true } }),
        learningStrategy: 'SEQUENTIAL',
        autoPilot: false,
        followLearningPlans: true,
        learningPlanPeriodBasis: storedPeriodBasis,
        strictMode: false,
        showGoalVisualizationsInChat: true,
        copySources: [],
        activeGoalId: 'math-goal-1',
      })
    }
    unexpectedRequests.push(`${request.method()} ${pathname}`)
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
  await overview.getByTestId('learner-plan-subject-mathematik').getByText('Tagesziel 0 von 2').first().waitFor()

  const menuBox = await menuButton.boundingBox()
  const overviewBox = await overview.boundingBox()
  assert(menuBox && overviewBox, 'mobile menu and Today overview must have measurable boxes')
  assert(menuBox.width >= 44 && menuBox.height >= 44, `mobile menu needs a 44px target: ${JSON.stringify(menuBox)}`)
  assert(
    menuBox.y + menuBox.height <= overviewBox.y,
    `mobile menu must not overlap Today overview: menu=${JSON.stringify(menuBox)}, overview=${JSON.stringify(overviewBox)}`,
  )
  assert.equal(await overview.getByRole('button', { name: 'Zu Mathematik wechseln', exact: true }).count(), 0)
  assert.equal(await page.getByText('Dein aktives Lernziel: Lineare Gleichungen lösen', { exact: true }).count(), 1)
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

  // Exercise the real settings-to-preferences-to-status path, including a fresh page load.
  await overview.getByRole('button', { name: 'Einstellungen öffnen' }).click()
  await page.getByRole('radio', { name: '1 Tag', exact: true }).waitFor()
  assert.equal(await page.getByRole('radio', { name: '1 Tag', exact: true }).isChecked(), true)
  await page.getByRole('radio', { name: '1 Woche', exact: true }).check()
  await page.getByRole('button', { name: 'Fertig', exact: true }).click()
  try {
  await overview.getByRole('heading', { name: 'Diese Woche', exact: true }).waitFor()
  } catch (error) {
    throw new Error(JSON.stringify({ body: await page.locator('body').innerText(), preferenceWrites, unexpectedRequests, browserErrors }), { cause: error })
  }
  assert.equal(preferenceWrites.at(-1)?.learningPlanPeriodBasis, 'WEEK')
  await page.reload()
  await overview.getByRole('heading', { name: 'Diese Woche', exact: true }).waitFor()
  const announcementLayout = await overview.getByTestId('learner-plan-active-goal').evaluate((element) => {
    const box = element.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(element)
    const textLines = Array.from(range.getClientRects())
    return {
      lineCount: textLines.length,
      allTextVisible: textLines.every((line) => line.left >= box.left - 1
        && line.right <= box.right + 1 && line.top >= box.top - 1 && line.bottom <= box.bottom + 1),
      overflow: element.scrollWidth > element.clientWidth,
      whiteSpace: getComputedStyle(element).whiteSpace,
    }
  })
  assert(announcementLayout.lineCount >= 2 && announcementLayout.allTextVisible
    && !announcementLayout.overflow && announcementLayout.whiteSpace === 'normal',
  `the complete backend announcement wraps visibly on mobile: ${JSON.stringify(announcementLayout)}`)
  if (process.env.SKILLPILOT_ISSUE48_SCREENSHOTS) {
    await page.screenshot({ path: fileURLToPath(new URL('../../tmp/issue48/cockpit-week-mobile.png', import.meta.url)), fullPage: true })
  }
  await overview.getByRole('button', { name: 'Einstellungen öffnen' }).click()
  assert.equal(await page.getByRole('radio', { name: '1 Woche', exact: true }).isChecked(), true)
  await page.getByRole('button', { name: 'Fertig', exact: true }).click()

  // A missing status invalidates the combined response, preserving a visibly stale snapshot.
  omitStatus = true
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await overview.getByText(/Aktualisierung fehlgeschlagen.*letzte Stand/u).waitFor()
  assert.equal(await overview.getByTestId('learner-plan-switch').first().isDisabled(), true)
  omitStatus = false
  await overview.getByRole('button', { name: 'Erneut versuchen', exact: true }).click()
  await page.waitForFunction(() => !document.body.textContent?.includes('Aktualisierung fehlgeschlagen.'))
  await overview.getByRole('heading', { name: 'Diese Woche', exact: true }).waitFor()
  omitStatus = true
  await page.reload()
  await page.getByText('Deine Fachpläne konnten gerade nicht geladen werden.', { exact: true }).waitFor()
  assert.equal(await overview.count(), 0, 'initial status failure cannot look like an empty healthy overview')
  omitStatus = false
  await page.getByRole('button', { name: 'Erneut versuchen', exact: true }).click()
  await overview.getByRole('heading', { name: 'Diese Woche', exact: true }).waitFor()

  unavailableStatus = true
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await overview.getByText('2 Fachpläne nicht auswertbar (Mathematik, Physik).', { exact: true }).waitFor()
  assert.equal(await overview.getByTestId(/learner-plan-subject-/u).count(), 2,
    'subjects remain visible when malformed plan details are excluded from the collection')
  assert.equal(await page.getByTestId('learner-plan-empty').count(), 0,
    'unavailable plans must not be presented as no plan')
  assert.equal(await overview.locator('[data-status-direction]').count(), 0)

  assert.equal(browserErrors.length, 0, `mobile LearnerView browser errors:\n${browserErrors.join('\n')}`)
  assert.deepEqual(unexpectedRequests, [], 'the full state already supplies focus; initial /planned must not be fetched')
  await context.close()
  console.log('mobile LearnerView plan chrome browser regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
