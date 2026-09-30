import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
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
const screenshotDir = process.env.SKILLPILOT_COCKPIT_LAYOUT_SCREENSHOTS
if (screenshotDir) await mkdir(screenshotDir, { recursive: true })

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
    hasTouch: true,
    isMobile: true,
  })
  await context.addInitScript({
    content: "localStorage.setItem('skillpilot_lang', 'de'); localStorage.setItem('skillpilot_theme', 'light');",
  })

  const page = await context.newPage()
  const touchSession = await context.newCDPSession(page)
  const swipe = async (startX: number, startY: number, endX: number, endY: number) => {
    await touchSession.send('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: [{ x: startX, y: startY, id: 1 }],
    })
    for (let step = 1; step <= 5; step += 1) {
      await page.waitForTimeout(16)
      await touchSession.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{
          x: startX + (endX - startX) * step / 5,
          y: startY + (endY - startY) * step / 5,
          id: 1,
        }],
      })
    }
    await touchSession.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  const openGoalMenuBySwipe = async () => {
    await swipe(15, 500, 220, 505)
    await page.waitForFunction(() => {
      const element = document.getElementById('learner-goal-sidebar')
      return Boolean(element && element.getBoundingClientRect().left >= 0)
    })
  }
  const waitForClosedGoalMenu = () => page.waitForFunction(() => {
    const element = document.getElementById('learner-goal-sidebar')
    return Boolean(element && element.getBoundingClientRect().right <= 0)
  })
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
  let followLearningPlans = true
  let unavailableStatus = false
  let omitStatus = false
  let returnWrongStatusLanguage = false
  const requestedPlanLanguages: string[] = []
  let englishPlanBarrier: Promise<void> | null = null
  let englishPlanRequestStarted = () => {}
  const preferenceWrites: Array<Record<string, unknown>> = []
  let preferenceSaveBarrier: Promise<void> | null = null
  let preferenceSaveStarted = () => {}
  let materialRevision = 0
  let selectedPackageIds: string[] = []
  let materialSelectionReads = 0
  let materialSaveBarrier: Promise<void> | null = null
  let materialSaveStarted = () => {}
  const materialWrites: Array<Record<string, unknown>> = []
  const materialPackage = {
    packageId: 'math-pilot', version: '1.0.0', title: 'Mathe-Pilot – Gleichungen verstehen',
    description: 'Ergänzende Materialien zum Lösen linearer Gleichungen.',
    providerName: 'Beispielanbieter', providerUrl: 'https://provider.example/',
    access: 'public-link', aiUsage: 'link-only', materialCount: 1,
  }
  const handleLearnerRequest = async (route: Route) => {
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
    if (pathname.endsWith('/content-selection')) {
      assert.equal(request.headers()['x-skillpilot-content-capability'], undefined,
        'material settings use the ordinary learner context without an extra key')
      if (request.method() === 'PUT') {
        const body = request.postDataJSON()
        materialWrites.push(body)
        assert.equal(body.expectedRevision, materialRevision)
        selectedPackageIds = body.selectedPackageIds
        materialRevision += 1
        if (materialSaveBarrier) {
          materialSaveStarted()
          await materialSaveBarrier
        }
      } else {
        assert.equal(request.method(), 'GET')
        materialSelectionReads += 1
      }
      return json({ revision: materialRevision, selectedPackageIds, packages: [materialPackage] })
    }
    if (pathname.endsWith('/content-materials') && request.method() === 'GET') {
      const goalId = new URL(request.url()).searchParams.get('goalId')
      return json(goalId === 'math-goal-1' && selectedPackageIds.includes('math-pilot') ? [{
        title: 'Lineare Gleichungen verstehen', url: 'https://provider.example/gleichungen',
        provider: 'Beispielanbieter', resourceType: 'article', language: 'de',
        sections: ['Gleichungen'], access: 'public-link', aiUsage: 'link-only',
      }] : [])
    }
    if (pathname.endsWith('/preferences') && request.method() === 'PUT') {
      const preferences = request.postDataJSON()
      preferenceWrites.push(preferences)
      storedPeriodBasis = preferences.learningPlanPeriodBasis
      if (preferenceSaveBarrier) {
        preferenceSaveStarted()
        await preferenceSaveBarrier
      }
      return json({ learningPlanPeriodBasis: storedPeriodBasis })
    }
    if (pathname.endsWith('/learning-plans')) {
      const requestedLanguage = new URL(request.url()).searchParams.get('language')
      assert.ok(requestedLanguage === 'de' || requestedLanguage === 'en',
        'the cockpit requests an explicit supported display language')
      requestedPlanLanguages.push(requestedLanguage)
      if (requestedLanguage === 'en' && englishPlanBarrier) {
        englishPlanRequestStarted()
        await englishPlanBarrier
      }
      const english = requestedLanguage === 'en'
      const subject = (key: string, label: string) => {
        const periodText = storedPeriodBasis === 'DAY'
          ? (english ? 'Daily target 0 of 2' : 'Tagesziel 0 von 2')
          : (english ? 'Weekly target 1 of 8' : 'Wochenziel 1 von 8')
        const planStatusText = english ? '2 learning goals behind' : '2 Lernziele im R\u00fcckstand'
        return {
          subjectKey: key, landscapeIds: [key === 'mathematik' ? 'math/sek-i' : 'physics/sek-ii'], subjectLabel: label, evaluable: true,
          periodText, planStatusText,
          subjectLine: `${label}: ${periodText} \u00b7 ${planStatusText}`,
          statusDirection: 'behind', current: key === 'mathematik', canContinue: true,
          periodGauge: storedPeriodBasis === 'DAY'
            ? { completed: 0, target: 2, needlePosition: 0 }
            : { completed: 1, target: 8, needlePosition: 0.125 },
          balanceGauge: { net: -2, typicalAmount: 2, scaleLimit: 4, needlePosition: -0.4, severeBehind: false, strongAhead: false },
        }
      }
      const subjects = [subject('mathematik', english ? 'Mathematics' : 'Mathematik'),
        subject('physik', english ? 'Physics' : 'Physik')]
      const status = {
        asOf: '2026-09-04', periodBasis: storedPeriodBasis,
        periodStart: storedPeriodBasis === 'WEEK' ? '2026-08-31' : '2026-09-04',
        periodEnd: storedPeriodBasis === 'WEEK' ? '2026-09-06' : '2026-09-04',
        timeZone: 'Europe/Berlin', language: returnWrongStatusLanguage && english ? 'de' : requestedLanguage,
        evaluable: !unavailableStatus,
        statusText: subjects.map((entry) => entry.subjectLine).join('\n'),
        noticeText: unavailableStatus
          ? (english ? '2 subject plans unavailable (Mathematics, Physics).'
            : '2 Fachpläne nicht auswertbar (Mathematik, Physik).') : null,
        activeGoal: english
          ? { title: 'Solve linear equations', announcement: 'Your active learning goal: Solve linear equations' }
          : { title: 'Lineare Gleichungen lösen', announcement: 'Dein aktives Lernziel: Lineare Gleichungen lösen' },
        followLearningPlans, resumeAvailable: true,
        subjects: !followLearningPlans ? [] : unavailableStatus ? subjects.map((entry) => ({ ...entry, evaluable: false, periodText: null, planStatusText: null, subjectLine: null, statusDirection: null, periodGauge: null, balanceGauge: null, canContinue: false })) : subjects, unavailablePlanCount: unavailableStatus ? 2 : 0,
      }
      return json({
        asOf: '2026-09-04',
        followLearningPlans,
        status: omitStatus ? undefined : status,
        plans: unavailableStatus || !followLearningPlans ? [] : [
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
        followLearningPlans,
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
  const activeGoalBanner = page.getByTestId('learner-active-goal-banner')
  const selectedGoal = page.getByTestId('learner-current-goal')
  const learningProgress = page.getByTestId('learner-learning-progress')
  assert.equal(await overview.getByRole('button', { name: 'Einstellungen öffnen' }).count(), 0)
  assert.equal(await overview.getByRole('button', { name: 'Weiterlernen' }).count(), 0)
  try {
    const heading = overview.getByRole('heading', { name: 'Lernplan', exact: true })
    await heading.waitFor({ timeout: 10_000 })
    assert.match(await heading.getAttribute('class') ?? '', /\bsr-only\b/u)
    assert.equal(await overview.getAttribute('aria-labelledby'), await heading.getAttribute('id'))
    await overview.getByTestId('learner-plan-period-gauge').first()
      .getByText('Heute', { exact: true }).waitFor({ timeout: 10_000 })
  } catch (error) {
    const body = await page.locator('body').innerText()
    throw new Error(`LearnerView did not render Today overview. Body:\n${body}\nBrowser errors:\n${browserErrors.join('\n')}`, { cause: error })
  }
  await overview.getByTestId('learner-plan-subject-mathematik').getByText('0 von 2', { exact: true }).waitFor()

  assert.equal(await menuButton.count(), 1, 'the mobile goal menu keeps a keyboard-accessible opener')
  const menuBox = await menuButton.boundingBox()
  assert(!menuBox || (menuBox.width <= 2 && menuBox.height <= 2),
    `the mobile goal menu opener must be screen-reader-only: ${JSON.stringify(menuBox)}`)
  assert.equal(await menuButton.getAttribute('aria-controls'), 'learner-goal-sidebar')
  await menuButton.focus()
  const focusedMenuBox = await menuButton.boundingBox()
  assert(focusedMenuBox && focusedMenuBox.width >= 44 && focusedMenuBox.height >= 44,
    `the mobile opener must be usable with a keyboard: ${JSON.stringify(focusedMenuBox)}`)
  await menuButton.evaluate((element) => (element as HTMLElement).blur())
  assert.equal(await overview.getByRole('button', { name: 'Zu Mathematik wechseln', exact: true }).count(), 0)
  const physicsSwitch = overview.getByTestId('learner-plan-subject-physik')
    .getByRole('button', { name: 'Zu Physik wechseln', exact: true })
  assert.equal(await physicsSwitch.getByText('Wechseln', { exact: true }).isVisible(), true,
    'the compact switch badge retains the full accessible subject action')
  assert.equal(await page.locator('summary').filter({ hasText: 'Zusätzliche Lernmaterialien' }).count(), 0,
    'material configuration does not occupy the ordinary learning view')
  assert.equal(materialSelectionReads, 0, 'the selection catalog is loaded only when settings are opened')
  assert.equal(await page.getByText('Dein aktives Lernziel: Lineare Gleichungen lösen', { exact: true }).count(), 1)
  assert.equal(await overview.getByTestId('learner-plan-active-goal').count(), 0,
    'the active goal has its own place above the selected content, outside the progress overview')
  await learningProgress.getByRole('heading', { name: 'Dein Lernstand', exact: true }).waitFor()
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 })
    const activeBox = await activeGoalBanner.boundingBox()
    const selectedBox = await selectedGoal.boundingBox()
    const progressBox = await learningProgress.boundingBox()
    assert(activeBox && selectedBox && progressBox)
    assert(activeBox.y + activeBox.height <= selectedBox.y + 1,
      `the active goal comes before selected content at ${width}px`)
    assert(selectedBox.y + selectedBox.height <= progressBox.y + 1,
      `selected content comes before learning progress at ${width}px`)
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true,
      `the real LearnerView must not overflow the ${width}px viewport`)
    assert(await overview.evaluate((element) => element.scrollWidth <= element.clientWidth),
      `the original needle displays must fit inside the learning progress card at ${width}px`)
    if (screenshotDir) await page.screenshot({ path: `${screenshotDir}/mobile-${width}.png`, fullPage: true })
  }

  const sidebar = page.locator('#learner-goal-sidebar')
  await waitForClosedGoalMenu()
  await swipe(110, 600, 300, 605)
  await page.waitForTimeout(350)
  assert(await sidebar.evaluate((element) => element.getBoundingClientRect().right <= 0),
    'a horizontal gesture starting in the content must not open the goal menu')

  const mainContent = page.getByTestId('learner-main-content')
  assert.equal(await mainContent.evaluate((element) => getComputedStyle(element).paddingTop), '24px',
    'the hidden mobile menu no longer reserves space above the learning content')
  const addedScrollSpace = await mainContent.evaluate((element) => {
    if (element.scrollHeight > element.clientHeight + 300) return false
    const spacer = document.createElement('div')
    spacer.dataset.testid = 'touch-scroll-spacer'
    spacer.style.cssText = 'flex: 0 0 900px; width: 1px;'
    element.appendChild(spacer)
    return true
  })
  const scrollTopBefore = await mainContent.evaluate((element) => element.scrollTop)
  await swipe(15, 650, 22, 360)
  await page.waitForTimeout(100)
  assert(await mainContent.evaluate((element) => element.scrollTop) > scrollTopBefore,
    'vertical scrolling from the left edge must keep scrolling the main content')
  await page.waitForTimeout(350)
  assert(await sidebar.evaluate((element) => element.getBoundingClientRect().right <= 0),
    'vertical scrolling at the left edge must not open the goal menu')
  if (addedScrollSpace) await mainContent.getByTestId('touch-scroll-spacer').evaluate((element) => element.remove())
  await mainContent.evaluate((element) => { element.scrollTop = 0 })

  await openGoalMenuBySwipe()
  assert.equal(await sidebar.getByRole('heading', { name: 'Meine Lernziele' }).isVisible(), true)
  const closeButton = sidebar.getByRole('button', { name: 'Lernzielmenü schließen' })
  const closeBox = await closeButton.boundingBox()
  assert(closeBox && closeBox.width >= 44 && closeBox.height >= 44, 'mobile close action needs a 44px target')
  const desktopHideButton = sidebar.getByRole('button', { name: 'Lernziele ausblenden', includeHidden: true })
  assert.equal(await desktopHideButton.isVisible(), false, 'the desktop sidebar toggle stays hidden on mobile')
  assert.equal(await sidebar.locator('label[for="morph-toggle"]').count(), 0,
    'the theme switch stays out of the goal menu on mobile')

  await closeButton.click()
  await waitForClosedGoalMenu()
  await openGoalMenuBySwipe()
  await page.mouse.click(370, 500)
  await waitForClosedGoalMenu()
  await openGoalMenuBySwipe()

  // Material selection belongs to the existing gear settings, not the learning area.
  await sidebar.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
  const settings = page.getByRole('dialog', { name: 'Mein Lehrplan', exact: true })
  const materialSummary = settings.locator('summary').filter({ hasText: 'Zusätzliche Lernmaterialien' })
  await materialSummary.waitFor()
  await materialSummary.click()
  const materialChoice = settings.getByRole('checkbox', { name: /Mathe-Pilot – Gleichungen verstehen/u })
  await materialChoice.waitFor()
  assert.equal(await materialChoice.isChecked(), false, 'material packages start unselected')
  assert.equal(await settings.locator('input[type="password"]').count(), 0)
  await materialChoice.check()
  assert.deepEqual(selectedPackageIds, [], 'draft selection is not saved until explicitly submitted')
  let releaseMaterialSave = () => {}
  materialSaveBarrier = new Promise<void>((resolve) => { releaseMaterialSave = resolve })
  const materialSaveInFlight = new Promise<void>((resolve) => { materialSaveStarted = resolve })
  await settings.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).click()
  await materialSaveInFlight
  await settings.locator('button[aria-label="Einstellungen schließen"]:disabled').waitFor()
  assert.equal(await settings.getByRole('button', { name: 'Einstellungen schließen', exact: true }).isDisabled(), true,
    'closing settings cannot unmount a pending material save before its refresh')
  assert.equal(await settings.getByRole('button', { name: 'Fertig', exact: true }).isDisabled(), true,
    'Done also waits for a pending material save')
  releaseMaterialSave()
  materialSaveBarrier = null
  await settings.getByText('Materialauswahl gespeichert.', { exact: true }).waitFor()
  assert.equal(await settings.getByRole('button', { name: 'Einstellungen schließen', exact: true }).isEnabled(), true)
  assert.equal(await settings.getByRole('button', { name: 'Fertig', exact: true }).isEnabled(), true)
  assert.deepEqual(materialWrites, [{ expectedRevision: 0, selectedPackageIds: ['math-pilot'] }])
  assert.deepEqual(preferenceWrites, [], 'saving materials does not submit curriculum preferences')
  assert(await settings.evaluate((element) => element.scrollWidth <= element.clientWidth),
    'material settings fit the mobile dialog without horizontal overflow')
  if (process.env.SKILLPILOT_MATERIAL_SETTINGS_SCREENSHOT) {
    await page.screenshot({ path: `${process.env.SKILLPILOT_MATERIAL_SETTINGS_SCREENSHOT}-settings.png`, fullPage: true })
  }
  await settings.getByRole('button', { name: 'Einstellungen schließen', exact: true }).click()
  await settings.waitFor({ state: 'detached' })
  await closeButton.click()
  await waitForClosedGoalMenu()

  const materialRegion = page.getByRole('region', { name: 'Materialien zu diesem Lernziel', exact: true })
  const materialLink = materialRegion.getByRole('link', { name: /Lineare Gleichungen verstehen/u })
  await materialLink.waitFor()
  assert.equal(await materialRegion.getByRole('heading').count(), 0, 'a material link needs no separate card heading')
  assert.equal(await materialRegion.locator('p').count(), 0, 'the compact link has no extra explanatory paragraphs')
  assert.equal(await materialRegion.getByText(/deiner Auswahl/u).count(), 0)
  assert.equal(await materialLink.locator('svg').count(), 1, 'the link includes an icon for the content type')
  assert.equal(await materialLink.getAttribute('rel'), 'noopener noreferrer')
  assert.equal(await materialLink.getAttribute('referrerpolicy'), 'no-referrer')
  assert.equal(await page.locator('summary').filter({ hasText: 'Zusätzliche Lernmaterialien' }).count(), 0,
    'closing settings removes configuration from the learning view')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    'compact material links stay within the mobile viewport')
  if (process.env.SKILLPILOT_MATERIAL_SETTINGS_SCREENSHOT) {
    await materialLink.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `${process.env.SKILLPILOT_MATERIAL_SETTINGS_SCREENSHOT}-goal.png`, fullPage: true })
  }

  // Exercise the real settings-to-preferences-to-status path, including a fresh page load.
  await openGoalMenuBySwipe()
  await sidebar.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
  await materialSummary.waitFor()
  await materialSummary.click()
  assert.equal(await materialChoice.isChecked(), true, 'saved materials survive closing and reopening real settings')
  assert.equal(materialWrites.length, 1, 'reopening settings never resubmits material selection')
  await page.getByRole('radio', { name: '1 Tag', exact: true }).waitFor()
  assert.equal(await page.getByRole('radio', { name: '1 Tag', exact: true }).isChecked(), true)
  await page.getByRole('radio', { name: '1 Woche', exact: true }).check()
  let releasePreferenceSave = () => {}
  preferenceSaveBarrier = new Promise<void>((resolve) => { releasePreferenceSave = resolve })
  const preferenceSaveInFlight = new Promise<void>((resolve) => { preferenceSaveStarted = resolve })
  await page.getByRole('button', { name: 'Fertig', exact: true }).click()
  await preferenceSaveInFlight
  await settings.locator('details input[type="checkbox"]:disabled').waitFor()
  assert.equal(await materialChoice.isDisabled(), true,
    'a pending preferences save prevents material changes before settings close')
  assert.equal(await settings.getByRole('button', { name: 'Materialauswahl speichern', exact: true }).isDisabled(), true,
    'material submission cannot race the preferences save and dialog close')
  assert.equal(materialWrites.length, 1, 'saving preferences does not write the material selection again')
  releasePreferenceSave()
  preferenceSaveBarrier = null
  try {
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('Diese Woche', { exact: true }).waitFor()
  } catch (error) {
    throw new Error(JSON.stringify({ body: await page.locator('body').innerText(), preferenceWrites, unexpectedRequests, browserErrors }), { cause: error })
  }
  assert.equal(preferenceWrites.at(-1)?.learningPlanPeriodBasis, 'WEEK')
  await settings.waitFor({ state: 'detached' })
  await closeButton.click()
  await page.reload()
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('Diese Woche', { exact: true }).waitFor()
  const weeklyMathRow = overview.getByTestId('learner-plan-subject-mathematik')
  await weeklyMathRow.getByText('1 von 8', { exact: true }).waitFor()
  assert.equal(await weeklyMathRow.getByTestId('learner-plan-period-gauge').getAttribute('data-needle-position'), '0.125')
  await weeklyMathRow.getByText('1 von 8', { exact: true }).waitFor()
  assert.equal(await weeklyMathRow.getByText(/Typisch:/u).count(), 0)
  const announcementLayout = await activeGoalBanner.getByTestId('learner-plan-active-goal').evaluate((element) => {
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
  await openGoalMenuBySwipe()
  await sidebar.getByRole('button', { name: 'Einstellungen öffnen', exact: true }).click()
  assert.equal(await page.getByRole('radio', { name: '1 Woche', exact: true }).isChecked(), true)
  await page.getByRole('button', { name: 'Fertig', exact: true }).click()
  await settings.waitFor({ state: 'detached' })
  await closeButton.click()

  // A missing status invalidates the combined response, preserving a visibly stale snapshot.
  omitStatus = true
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await overview.getByText(/Aktualisierung fehlgeschlagen.*letzte Stand/u).waitFor()
  assert.equal(await overview.getByTestId('learner-plan-switch').first().isDisabled(), true)
  omitStatus = false
  await overview.getByRole('button', { name: 'Erneut versuchen', exact: true }).click()
  await page.waitForFunction(() => !document.body.textContent?.includes('Aktualisierung fehlgeschlagen.'))
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('Diese Woche', { exact: true }).waitFor()
  omitStatus = true
  await page.reload()
  await page.getByText('Deine Fachpläne konnten gerade nicht geladen werden.', { exact: true }).waitFor()
  assert.equal(await overview.count(), 0, 'initial status failure cannot look like an empty healthy overview')
  omitStatus = false
  await page.getByRole('button', { name: 'Erneut versuchen', exact: true }).click()
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('Diese Woche', { exact: true }).waitFor()

  unavailableStatus = true
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await overview.getByText('2 Fachpläne nicht auswertbar (Mathematik, Physik).', { exact: true }).waitFor()
  assert.equal(await overview.getByTestId(/learner-plan-subject-/u).count(), 2,
    'subjects remain visible when malformed plan details are excluded from the collection')
  assert.equal(await page.getByTestId('learner-plan-empty').count(), 0,
    'unavailable plans must not be presented as no plan')
  assert.equal(await overview.locator('[data-status-direction]').count(), 0)
  assert.equal(await overview.getByTestId('learner-plan-gauges-unavailable').count(), 2)
  assert.equal(await overview.locator('[data-needle-position]').count(), 0,
    'unevaluable subjects keep two muted dials without suggesting a balance')

  // The real LearnerView requests a fresh backend wording on a live language change.
  // Hold that response so mixed German backend text with English UI copy is observable.
  unavailableStatus = false
  let releaseEnglishPlan = () => {}
  englishPlanBarrier = new Promise<void>((resolve) => { releaseEnglishPlan = resolve })
  const englishPlanRequest = new Promise<void>((resolve) => { englishPlanRequestStarted = resolve })
  await page.evaluate(() => window.dispatchEvent(new Event('fixture-switch-language')))
  await englishPlanRequest
  await learningProgress.getByRole('heading', { name: 'Your learning progress', exact: true }).waitFor()
  assert.equal(await learningProgress
    .getByText('2 Lernziele im Rückstand', { exact: true }).count(), 0,
  'German backend status must disappear while the English status is loading')
  releaseEnglishPlan()
  englishPlanBarrier = null
  const englishHeading = overview.getByRole('heading', { name: 'Learning plan', exact: true })
  await englishHeading.waitFor()
  assert.match(await englishHeading.getAttribute('class') ?? '', /\bsr-only\b/u)
  assert.equal(await overview.getAttribute('aria-labelledby'), await englishHeading.getAttribute('id'))
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('This week', { exact: true }).waitFor()
  const englishMathRow = overview.getByTestId('learner-plan-subject-mathematik')
  await englishMathRow.getByText('1 of 8', { exact: true }).waitFor()
  await englishMathRow.getByText('2 learning goals behind', { exact: true }).waitFor()
  await activeGoalBanner.getByText('You are learning · Mathematics', { exact: true }).waitFor()
  await activeGoalBanner.getByText('Your active learning goal: Solve linear equations', { exact: true }).waitFor()
  await overview.getByText('Current subject', { exact: true }).waitFor()
  assert.equal(await overview.getByRole('button', { name: 'Switch to Physics' }).count(), 1)
  assert.equal(await overview.getByLabel('Plan details: Mathematics').count(), 1)
  assert.equal(await overview.getByText('Plandetails', { exact: true }).count(), 0)
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'en')
  assert.equal(requestedPlanLanguages.at(-1), 'en', 'language=en reaches the backend status endpoint')

  await page.evaluate(() => window.dispatchEvent(new Event('fixture-switch-language')))
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('Diese Woche', { exact: true }).waitFor()
  await activeGoalBanner.getByText('Du lernst gerade · Mathematik', { exact: true }).waitFor()
  assert.equal(requestedPlanLanguages.at(-1), 'de', 'switching back reloads German backend status')

  returnWrongStatusLanguage = true
  await page.evaluate(() => window.dispatchEvent(new Event('fixture-switch-language')))
  await page.getByText('Your subject plans could not be loaded right now.', { exact: true }).waitFor()
  assert.equal(await overview.count(), 0,
    'a backend response in the wrong language cannot revive the old German overview')
  returnWrongStatusLanguage = false
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await overview.getByTestId('learner-plan-period-gauge').first().getByText('This week', { exact: true }).waitFor()
  await activeGoalBanner.getByText('You are learning · Mathematics', { exact: true }).waitFor()

  await page.setViewportSize({ width: 1280, height: 900 })
  const desktopActiveBox = await activeGoalBanner.boundingBox()
  const desktopSelectedBox = await selectedGoal.boundingBox()
  const desktopProgressBox = await learningProgress.boundingBox()
  assert(desktopActiveBox && desktopSelectedBox && desktopProgressBox)
  assert(desktopActiveBox.y + desktopActiveBox.height <= desktopSelectedBox.y + 1,
    'the active goal stays above the desktop content columns')
  assert(desktopSelectedBox.x + desktopSelectedBox.width <= desktopProgressBox.x,
    'selected content occupies the left column and learning progress the right column')
  assert(Math.abs(desktopSelectedBox.y - desktopProgressBox.y) <= 1,
    'desktop content and progress start on the same row')
  assert.equal(await overview.getByTestId('learner-plan-period-gauge').count(), 2,
    'the new arrangement retains the original per-subject needle displays')
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    'the desktop cockpit fits without horizontal overflow')
  if (screenshotDir) await page.screenshot({ path: `${screenshotDir}/desktop.png`, fullPage: true })
  const desktopHide = sidebar.getByRole('button', { name: 'Hide learning goals' })
  await desktopHide.waitFor({ state: 'visible' })
  assert.equal(await desktopHide.getAttribute('aria-expanded'), 'true')
  await desktopHide.click()
  const desktopShow = page.getByRole('button', { name: 'Show learning goals' })
  await desktopShow.waitFor({ state: 'visible' })
  assert.equal(await desktopShow.getAttribute('aria-expanded'), 'false')
  assert.equal(await sidebar.isVisible(), false, 'the desktop action hides the goal tree')
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Show learning goals')
  await desktopShow.click()
  await desktopHide.waitFor({ state: 'visible' })
  assert.equal(await desktopHide.getAttribute('aria-expanded'), 'true')
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Hide learning goals')

  followLearningPlans = false
  await page.reload()
  await activeGoalBanner.getByText('Dein aktives Lernziel: Lineare Gleichungen lösen', { exact: true }).waitFor()
  assert.equal(await overview.count(), 0)
  assert.equal(await learningProgress.count(), 0,
    'an active goal remains visible when plan mode is off and there are no subject plans')
  await selectedGoal.getByRole('heading', { name: 'Lineare Gleichungen lösen', exact: true }).waitFor()

  assert.equal(browserErrors.length, 0, `mobile LearnerView browser errors:\n${browserErrors.join('\n')}`)
  assert.deepEqual(unexpectedRequests, [], 'the full state already supplies focus; initial /planned must not be fetched')
  await context.close()
  console.log('mobile LearnerView plan chrome browser regression test passed')
} finally {
  await browser?.close()
  await server.close()
}
