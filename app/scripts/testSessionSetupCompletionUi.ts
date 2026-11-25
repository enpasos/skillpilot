import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
const CANONICAL_GYMNASIUM_MATH_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
import { CURRENT_TERMS_VERSION } from '../src/utils/legalTermsVersion'
import type {
  PersonalizationCompletedDecision,
  PersonalizationOption,
  PersonalizationPlan,
} from '../src/utils/personalCurriculumEditorApi'
import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const existingLearnerId = '11111111-1111-4111-8111-111111111111'
const generatedLearnerId = '22222222-2222-4222-8222-222222222222'
const incompleteLearnerId = '33333333-3333-4333-8333-333333333333'
const curriculumTitle = 'Gymnasium (DE)'
const landscape = {
  curriculumId: CANONICAL_GYMNASIUM_ROOT_ID,
  filename: 'canonical-gymnasium.json',
  country: 'DE',
  region: 'DE',
  type: 'GYMNASIUM',
  level: 'Sekundarstufe',
  subject: 'Gymnasium',
  locale: 'de-DE',
  title: curriculumTitle,
  schoolType: 'Gymnasium',
  qualityMaturity: 'M6',
}
const alternativeLandscape = {
  ...landscape,
  curriculumId: CANONICAL_GYMNASIUM_MATH_ID,
  filename: 'alternative-gymnasium.json',
  region: 'DE-HE',
  subject: 'Mathematik',
  title: 'Gymnasium Hessen (DE)',
}

const option = (
  optionId: string,
  groupId: string,
  landscapeLabel: string | null,
  filterId: string | null = null,
  filterLabel: string | null = null,
): PersonalizationOption => ({
  optionId,
  stageId: groupId,
  groupId,
  groupInstanceId: `${groupId}:root`,
  landscapeId: landscapeLabel?.toLowerCase() ?? null,
  landscapeLabel,
  filterId,
  filterLabel,
  scopeKey: null,
  scopeValue: null,
  scopeLabel: null,
  kind: 'VALUE',
})

const completedDecision = (
  rewindId: string,
  groupId: string,
  selectedOptions: PersonalizationOption[],
): PersonalizationCompletedDecision => ({
  rewindId,
  stageId: groupId,
  stageLabel: groupId === 'jurisdiction'
    ? 'Bundesland auswählen'
    : groupId === 'stage'
      ? 'Lernumfang auswählen'
      : 'Fach auswählen',
  groupId,
  groupLabel: groupId,
  groupInstanceId: `${groupId}:root`,
  selectedOptions,
})

const completePlan: PersonalizationPlan = {
  stage: 'COMPLETE',
  stageId: null,
  stageLabel: null,
  groupId: null,
  groupLabel: null,
  groupInstanceId: null,
  minSelections: 0,
  maxSelections: 0,
  selectedCount: 0,
  options: [],
  displayOptions: [],
  navigationOptions: [],
  currentSelectedOptions: [],
  currentRewindId: null,
  completedDecisions: [
    completedDecision('rewind-jurisdiction', 'jurisdiction', [
      option('all-states', 'jurisdiction', null, 'ALL', 'Kanonische DE-Sicht'),
    ]),
    completedDecision('rewind-stage', 'stage', [{
      ...option('cross-stage', 'stage', null),
      kind: 'SCOPE_VALUE',
      scopeKey: 'stage',
      scopeValue: 'CrossStage',
      scopeLabel: 'Sekundarstufe I und II',
    }]),
    completedDecision('rewind-subject', 'subject', [
      option('math', 'subject', 'Mathematik'),
      option('physics', 'subject', 'Physik'),
    ]),
  ],
  preservedDecisions: [],
  pendingDecisions: [],
  canReopenMigratedPersonalization: false,
  problemCode: null,
}

const selectionPlan: PersonalizationPlan = {
  ...completePlan,
  stage: 'SELECTION',
  stageId: 'jurisdiction',
  stageLabel: 'Bundesland auswählen',
  groupId: 'jurisdiction',
  groupLabel: 'Bundesland auswählen',
  groupInstanceId: 'jurisdiction:root',
  minSelections: 1,
  maxSelections: 1,
  selectedCount: 0,
  options: [option('all-states', 'jurisdiction', null, 'ALL', 'Kanonische DE-Sicht')],
  displayOptions: [option('all-states', 'jurisdiction', null, 'ALL', 'Kanonische DE-Sicht')],
  currentSelectedOptions: [],
  completedDecisions: [],
  preservedDecisions: [],
  pendingDecisions: [],
}

const installApi = async (page: Page) => {
  let selectedCurriculumId = CANONICAL_GYMNASIUM_ROOT_ID
  const metrics = {
    landscapeRequests: 0,
    rewindRequests: 0,
    curriculumSaveRequests: 0,
    resumeRequests: 0,
    retentionRequests: 0,
    deletionRequests: 0,
    lastDeletionConfirmation: '',
  }
  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const respond = (body: unknown) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })

    if (path === '/api/ui/landscapes' && request.method() === 'GET') {
      metrics.landscapeRequests += 1
      await respond({ summaries: [landscape, alternativeLandscape] })
      return
    }
    if (path === '/api/ui/learners' && request.method() === 'POST') {
      // Keep ID creation observably asynchronous so the browser contract must
      // wait for the backend-created value instead of relying on local timing.
      await new Promise(resolve => setTimeout(resolve, 75))
      await respond({
        skillpilotId: generatedLearnerId,
        availableCurricula: [landscape],
      })
      return
    }
    if (
      path.endsWith('/personalization-plan')
      && request.method() === 'GET'
    ) {
      await respond(path.includes(incompleteLearnerId) ? selectionPlan : completePlan)
      return
    }
    if (
      path.endsWith('/personalization-rewind')
      && request.method() === 'POST'
    ) {
      metrics.rewindRequests += 1
      await respond(selectionPlan)
      return
    }
    if (path.endsWith('/curriculum') && request.method() === 'PUT') {
      const body = request.postDataJSON() as { curriculumId?: string }
      assert(body.curriculumId, 'the curriculum update carries a curriculumId')
      selectedCurriculumId = body.curriculumId
      metrics.curriculumSaveRequests += 1
      await respond({ status: 'updated' })
      return
    }
    if (path.endsWith('/resume') && request.method() === 'POST') {
      metrics.resumeRequests += 1
      await respond({
        lastActivityAt: '2026-08-13T08:00:00Z',
        scheduledDeletionAt: '2027-08-13T08:00:00Z',
      })
      return
    }
    if (path.endsWith('/retention') && request.method() === 'GET') {
      metrics.retentionRequests += 1
      // Retention arrives after the dialog opens, as it does over the network.
      await new Promise(resolve => setTimeout(resolve, 75))
      await respond({
        lastActivityAt: '2026-08-13T08:00:00Z',
        scheduledDeletionAt: '2027-08-13T08:00:00Z',
      })
      return
    }
    if (
      path.startsWith('/api/ui/learners/')
      && request.method() === 'DELETE'
    ) {
      const body = request.postDataJSON() as { confirmationSkillpilotId?: string }
      metrics.deletionRequests += 1
      metrics.lastDeletionConfirmation = body.confirmationSkillpilotId ?? ''
      await route.fulfill({
        status: path.endsWith(`/${incompleteLearnerId}`) ? 404 : 204,
      })
      return
    }
    if (
      (path === `/api/ui/learners/${existingLearnerId}`
        || path === `/api/ui/learners/${generatedLearnerId}`
        || path === `/api/ui/learners/${incompleteLearnerId}`)
      && request.method() === 'GET'
    ) {
      await respond({ selectedCurriculum: selectedCurriculumId })
      return
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ path, method: request.method() }),
    })
  })
  return metrics
}

const openFreshSetupPage = async (
  context: BrowserContext,
  baseUrl: string,
) => {
  const page = await context.newPage()
  page.setDefaultTimeout(10_000)
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text())
  })
  const apiMetrics = await installApi(page)
  await page.goto(baseUrl)
  await page.getByTestId('public-landing-action-learning').click().catch((error: unknown) => {
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\nBrowser errors:\n${browserErrors.join('\n')}`,
    )
  })
  await page.getByLabel('Deine SkillPilot-ID').waitFor().catch((error: unknown) => {
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\nBrowser errors:\n${browserErrors.join('\n')}`,
    )
  })
  return { page, browserErrors, apiMetrics }
}

const continueToCompletedSetup = async (page: Page) => {
  await page.getByRole('button', {
    name: 'Weiter zu Schritt 2: Curriculum wählen',
  }).click()
  await page.getByRole('heading', { name: 'Los geht’s' }).waitFor()
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/sessionSetupCompletionUi.html',
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
  const baseUrl = `${server.baseUrl}/scripts/fixtures/sessionSetupCompletionUi.html`

  const termsContext = await browser.newContext({ locale: 'de-DE' })
  await termsContext.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
  })
  const termsPage = await termsContext.newPage()
  await installApi(termsPage)
  await termsPage.goto(baseUrl)
  assert(
    await termsPage.getByTestId('public-landing-action-goal-book').count() === 1,
    'the public start page exposes exactly one learning-goal book link',
  )
  assert(
    await termsPage.getByTestId('public-landing-action-goal-book').getAttribute('href')
      === '/lernzielbuch',
    'the public learning-goal book link uses the existing read-only route',
  )
  await termsPage.getByTestId('public-landing-action-learning').click()
  await termsPage.getByRole('heading', {
    name: 'Bitte akzeptiere die Nutzungsbedingungen, um mit SkillPilot zu starten:',
  }).waitFor()
  assert(
    await termsPage.getByLabel('Deine SkillPilot-ID').count() === 0,
    'learner setup remains hidden before accepting the current Terms',
  )
  await termsPage.getByRole('checkbox', { name: /Ich akzeptiere die Nutzungsbedingungen/u }).check()
  await termsPage.getByRole('button', { name: 'Akzeptieren & Fortfahren' }).click()
  await termsPage.getByLabel('Deine SkillPilot-ID').waitFor()
  assert(
    await termsPage.evaluate(() => localStorage.getItem('skillpilot_terms_accepted_version')) === CURRENT_TERMS_VERSION,
    'the first-party gate stores exactly the canonical current Terms acceptance',
  )
  await termsContext.close()

  const trainerTermsContext = await browser.newContext({ locale: 'de-DE' })
  await trainerTermsContext.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_trainer_landscape', 'obsolete-global-trainer-context')
  })
  const trainerTermsPage = await trainerTermsContext.newPage()
  await installApi(trainerTermsPage)
  await trainerTermsPage.goto(baseUrl)
  await trainerTermsPage.getByTestId('public-landing-action-course-planning').click()
  await trainerTermsPage.getByRole('heading', {
    name: 'Bitte akzeptiere die Nutzungsbedingungen, um mit SkillPilot zu starten:',
  }).waitFor()
  assert(
    await trainerTermsPage.getByRole('heading', { name: 'Kurs vorbereiten' }).count() === 0,
    'trainer setup remains hidden before accepting the same current Terms',
  )
  await trainerTermsPage.getByRole('checkbox', { name: /Ich akzeptiere die Nutzungsbedingungen/u }).check()
  await trainerTermsPage.getByRole('button', { name: 'Akzeptieren & Fortfahren' }).click()
  await trainerTermsPage.waitForFunction(() => (
    (window as Window & { __sessionSetupStartProbe?: unknown[] })
      .__sessionSetupStartProbe?.length === 1
  ))
  const trainerStart = await trainerTermsPage.evaluate(() => (
    (window as Window & {
      __sessionSetupStartProbe?: Array<{
        id: string
        landscapeId?: string
        role?: string
      }>
    }).__sessionSetupStartProbe?.[0]
  ))
  assert(
    trainerStart?.id === ''
      && trainerStart.landscapeId === ''
      && trainerStart.role === 'trainer'
      && await trainerTermsPage.getByRole('button', {
        name: 'Kursorganisation öffnen',
        exact: true,
      }).count() === 0
      && await trainerTermsPage.getByText(
        'Das Curriculum wählst du beim Anlegen des jeweiligen Kurses.',
        { exact: false },
      ).count() === 0
      && await trainerTermsPage.evaluate(() => localStorage.getItem('skillpilot_trainer_landscape')) === null,
    'accepting the required Terms starts course organization directly with an empty context and no redundant confirmation',
  )
  await trainerTermsContext.close()

  const emptyTrainerContext = await browser.newContext({ locale: 'de-DE' })
  await emptyTrainerContext.addInitScript((termsVersion) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
    localStorage.setItem('skillpilot_trainer_landscape', 'obsolete-global-trainer-context')
  }, CURRENT_TERMS_VERSION)
  const emptyTrainerPage = await emptyTrainerContext.newPage()
  emptyTrainerPage.setDefaultTimeout(60_000)
  const emptyTrainerErrors: string[] = []
  emptyTrainerPage.on('pageerror', (error) => emptyTrainerErrors.push(error.message))
  emptyTrainerPage.on('console', (message) => {
    if (message.type() === 'error') emptyTrainerErrors.push(message.text())
  })
  await installApi(emptyTrainerPage)
  await emptyTrainerPage.goto(`${baseUrl}?fixture=trainer-app-entry`)
  await emptyTrainerPage.getByTestId('public-landing-action-course-planning').click()
  await emptyTrainerPage.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
    .catch(async (error: unknown) => {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}\n`
        + `URL: ${emptyTrainerPage.url()}\n`
        + `Body: ${(await emptyTrainerPage.locator('body').innerText()).slice(0, 2_000)}\n`
        + `Browser errors:\n${emptyTrainerErrors.join('\n')}`,
      )
    })
  assert(
    new URL(emptyTrainerPage.url()).pathname === '/trainer'
      && !new URL(emptyTrainerPage.url()).searchParams.has('l')
      && await emptyTrainerPage.getByText(
        'Das Curriculum wählst du beim Anlegen des jeweiligen Kurses.',
        { exact: false },
      ).count() === 0
      && await emptyTrainerPage.evaluate(() => localStorage.getItem('skillpilot_trainer_landscape')) === null,
    'the real App opens trainer course organization directly with an empty landscape context',
  )
  await emptyTrainerContext.close()

  const directTrainerContext = await browser.newContext({ locale: 'de-DE' })
  await directTrainerContext.addInitScript((termsVersion) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', 'obsolete-global-trainer-context')
  }, CURRENT_TERMS_VERSION)
  const directTrainerPage = await directTrainerContext.newPage()
  directTrainerPage.setDefaultTimeout(60_000)
  await installApi(directTrainerPage)
  await directTrainerPage.goto(`${baseUrl}?fixture=trainer-direct-entry`)
  await directTrainerPage.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  assert(
    new URL(directTrainerPage.url()).pathname === '/trainer'
      && !new URL(directTrainerPage.url()).searchParams.has('l')
      && await directTrainerPage.evaluate(() => localStorage.getItem('skillpilot_trainer_landscape')) === null,
    'direct trainer entry also retires the obsolete global curriculum context',
  )
  await directTrainerContext.close()

  const unavailableOverviewContext = await browser.newContext({ locale: 'de-DE' })
  await unavailableOverviewContext.addInitScript((termsVersion) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
    localStorage.setItem('skillpilot_role', 'trainer')
  }, CURRENT_TERMS_VERSION)
  const unavailableOverviewPage = await unavailableOverviewContext.newPage()
  unavailableOverviewPage.setDefaultTimeout(60_000)
  await installApi(unavailableOverviewPage)
  await unavailableOverviewPage.route(/\/api\/ui\/landscapes(?:\?.*)?$/u, async (route) => {
    await route.fulfill({ status: 503, body: 'overview unavailable' })
  })
  await unavailableOverviewPage.goto(`${baseUrl}?fixture=trainer-direct-entry`)
  await unavailableOverviewPage.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  assert(
    await unavailableOverviewPage.getByText('Fehler beim Laden der Skill-Landschaften', { exact: false }).count() === 0,
    'an unavailable curriculum overview does not block the local course organization',
  )
  await unavailableOverviewContext.close()

  const unavailableCourseContext = await browser.newContext({ locale: 'de-DE' })
  await unavailableCourseContext.addInitScript(({ rootLandscapeId, termsVersion }) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: 'unavailable-course',
      name: 'Nicht ladbarer Kurs',
      landscapeId: rootLandscapeId,
      rootLandscapeId,
      activeFilter: 'all',
      personalConfig: { [rootLandscapeId]: { selected: true } },
      students: [],
      source: 'local-generated',
    }]))
  }, { rootLandscapeId: CANONICAL_GYMNASIUM_ROOT_ID, termsVersion: CURRENT_TERMS_VERSION })
  const unavailableCoursePage = await unavailableCourseContext.newPage()
  unavailableCoursePage.setDefaultTimeout(60_000)
  await installApi(unavailableCoursePage)
  await unavailableCoursePage.goto(`${baseUrl}?fixture=trainer-direct-entry`)
  await unavailableCoursePage.getByText('Nicht ladbarer Kurs', { exact: true }).click()
  await unavailableCoursePage.getByRole('heading', {
    name: 'Kurs-Curriculum nicht verfügbar',
    exact: true,
  }).waitFor()
  await unavailableCoursePage.getByText(
    'Deine lokal gespeicherten Kursdaten bleiben erhalten.',
    { exact: false },
  ).waitFor()
  await unavailableCoursePage.getByRole('button', { name: 'Alle Klassen', exact: true }).click()
  await unavailableCoursePage.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await unavailableCourseContext.close()

  const blockedStorageContext = await browser.newContext({ locale: 'de-DE' })
  await blockedStorageContext.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = function (key: string, value: string) {
      if (key === 'skillpilot_terms_accepted_version') {
        throw new DOMException('Storage blocked', 'SecurityError')
      }
      originalSetItem.call(this, key, value)
    }
  })
  const blockedStoragePage = await blockedStorageContext.newPage()
  await installApi(blockedStoragePage)
  await blockedStoragePage.goto(baseUrl)
  await blockedStoragePage.getByTestId('public-landing-action-learning').click()
  await blockedStoragePage.getByRole('checkbox', { name: /Ich akzeptiere die Nutzungsbedingungen/u }).check()
  await blockedStoragePage.getByRole('button', { name: 'Akzeptieren & Fortfahren' }).click()
  await blockedStoragePage.getByRole('alert').waitFor()
  assert(
    await blockedStoragePage.getByLabel('Deine SkillPilot-ID').count() === 0,
    'a failed Terms write remains fail-closed instead of creating a page-only acceptance',
  )
  await blockedStorageContext.close()

  const context = await browser.newContext({ locale: 'de-DE' })
  await context.addInitScript((termsVersion) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
  }, CURRENT_TERMS_VERSION)

  const returning = await openFreshSetupPage(context, baseUrl)
  await returning.page.getByLabel('Deine SkillPilot-ID').fill(existingLearnerId)
  await continueToCompletedSetup(returning.page)
  const claudeStart = returning.page.getByTestId('claude-plugin-start')
  await claudeStart.waitFor()
  assert(await claudeStart.isEnabled(), 'the completed setup offers the working Claude beta')
  // Continuing with an already complete setup brings the start action into view.
  await returning.page.waitForFunction(() => {
    const start = document.querySelector('[data-testid="claude-plugin-start"]')
    if (!start) return false
    const box = start.getBoundingClientRect()
    return box.top >= 0 && box.bottom <= window.innerHeight
  })
  const providerChoice = returning.page.getByTestId('coach-provider-choice')
  assert(await providerChoice.getByRole('radio', { name: /Claude-Lerncoach/u }).isChecked(),
    'Claude remains the default provider')
  assert(await providerChoice.getByRole('radio', { name: /ChatGPT Desktop/u }).count() === 1,
    'ChatGPT Desktop is selectable in the normal authored start flow')
  const claudeStartText = await returning.page.getByTestId('claude-v1-start-options').textContent() ?? ''
  assert(
    !claudeStartText.includes('Voice') && claudeStartText.includes('ab 18 Jahren'),
    'the compact Claude start keeps the age notice and leaves voice-mode guidance to the FAQ',
  )
  assert(
    await providerChoice.getByRole('radio', { name: /Claude-Lerncoach.*Voice-Mode/u }).count() === 1,
    'the Claude choice still names voice mode as available',
  )
  assert(
    returning.apiMetrics.resumeRequests === 1,
    'continuing with an existing learner records exactly one resume activity',
  )
  assert(await returning.page.getByTestId('chatgpt-desktop-start').count() === 0,
    'the desktop handoff is absent while Claude is selected')

  const chatTestContext = await browser.newContext({ locale: 'de-DE', permissions: ['clipboard-read', 'clipboard-write'] })
  await chatTestContext.addInitScript((termsVersion) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
  }, CURRENT_TERMS_VERSION)
  const nativeTest = await openFreshSetupPage(chatTestContext, baseUrl)
  await nativeTest.page.getByLabel('Deine SkillPilot-ID').fill(existingLearnerId)
  await continueToCompletedSetup(nativeTest.page)
  await nativeTest.page.getByRole('radio', { name: /ChatGPT Desktop/u }).check()
  assert(await nativeTest.page.getByTestId('claude-plugin-start').count() === 0,
    'selecting ChatGPT hides the Claude launch to prevent provider-mixed starts')
  const desktopStart = nativeTest.page.getByTestId('chatgpt-desktop-start')
  assert((await desktopStart.textContent())?.includes('Browser und Mobil-App sind dafür noch nicht bestätigt'),
    'the beta makes its confirmed desktop scope clear')
  const setupLink = desktopStart.getByRole('link', { name: 'Plugin einrichten' })
  assert(await setupLink.getAttribute('href') === '/plugins#chatgpt-desktop'
    && await setupLink.getAttribute('target') === '_blank',
    'the one-time setup opens the maintained desktop plugin guide in its own tab')
  assert((await desktopStart.textContent())?.includes('Zum ersten Mal mit ChatGPT?')
    && await desktopStart.getByText('GitHub-Adresse des SkillPilot-Marketplace').count() === 0,
    'the start step keeps the setup to one line, as the Claude start does')
  await nativeTest.page.evaluate(() => navigator.clipboard.writeText('clipboard before the start'))
  let nativeLaunches = 0
  let heldPreparation: { started: () => void; release: Promise<void> } | null = null
  let claudeLaunches = 0
  await nativeTest.page.route('**/claude/v1/launch', async (route) => {
    claudeLaunches += 1
    await route.fulfill({ status: 500, body: 'Wrong provider' })
  })
  const startMessage = `Setze meine Lernsession fort. learningSessionId: sps_${'A'.repeat(43)}`
  await nativeTest.page.route('**/openai/v1/launch', async (route) => {
    nativeLaunches += 1
    const held = heldPreparation
    held?.started()
    if (held) await held.release
    const request = route.request()
    const body = request.postDataJSON() as Record<string, unknown>
    assert(request.method() === 'POST', 'test start uses the existing first-party launch')
    assert(body.providerEligibilityConfirmed === true && body.communicationLocale === 'de',
      'test start preserves explicit eligibility and communication locale')
    assert(body.client === 'chatgpt-desktop-beta', 'launch identifies the selected desktop beta')
    assert(body.selectedCurriculum === CANONICAL_GYMNASIUM_ROOT_ID,
      'test start uses the configured personal curriculum')
    await new Promise(resolve => setTimeout(resolve, 100))
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      prompt: startMessage, learningSessionId: `sps_${'A'.repeat(43)}`,
      expiresAt: '2099-09-25T10:00:00Z', webUrl: 'https://chatgpt.com/',
    }) })
  })
  // The test browser has no desktop app: record each followed app link instead of leaving the page.
  await nativeTest.page.evaluate(() => {
    const opened: string[] = []
    ;(window as unknown as { __chatLinkOpens: string[] }).__chatLinkOpens = opened
    document.addEventListener('click', (event) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="codex:"]')
      if (!link) return
      opened.push(link.getAttribute('href') ?? '')
      event.preventDefault()
    }, true)
  })
  const chatLinkOpens = () => nativeTest.page.evaluate(
    () => (window as unknown as { __chatLinkOpens: string[] }).__chatLinkOpens,
  )
  const startButton = nativeTest.page.getByRole('button', { name: 'Lernen mit ChatGPT starten' })
  nativeTest.page.once('dialog', dialog => void dialog.dismiss())
  await startButton.click()
  assert(nativeLaunches === 0, 'declining eligibility does not create a learning session')
  assert(await nativeTest.page.getByTestId('chatgpt-desktop-open-codex').count() === 0
    && (await chatLinkOpens()).length === 0,
    'without a learning session no chat is opened')
  const locationBeforeStart = nativeTest.page.url()
  nativeTest.page.once('dialog', dialog => void dialog.accept())
  await startButton.click()
  const handoff = nativeTest.page.getByTestId('chatgpt-desktop-handoff')
  await handoff.waitFor()
  await nativeTest.page.waitForFunction(
    () => (window as unknown as { __chatLinkOpens: string[] }).__chatLinkOpens.length === 1,
  )
  const chatLink = nativeTest.page.getByRole('link', { name: 'Chat erneut öffnen' })
  const href = await chatLink.getAttribute('href')
  assert(href && Number(nativeLaunches) === 1 && (await chatLinkOpens())[0] === href,
    'one click creates one learning session and opens the chat through the visible app link')
  const localCodexStart = new URL(href)
  assert(localCodexStart.protocol === 'codex:' && localCodexStart.hostname === 'threads'
    && localCodexStart.pathname === '/new' && !localCodexStart.hash,
    'the link opens a new local Codex thread')
  assert([...localCodexStart.searchParams.keys()].join(',') === 'prompt'
    && localCodexStart.searchParams.get('prompt') ===
      `[@SkillPilot Coach](plugin://skillpilot-coach@skillpilot-chatgpt-marketplace) ${startMessage}`,
    'the link carries the Git plugin mention and the authoritative start message as its only argument')
  assert(!href.includes(existingLearnerId) && !decodeURIComponent(href).includes(existingLearnerId),
    'the app link excludes the permanent learner ID')
  assert((await handoff.getByRole('status').textContent())?.includes('Startnachricht bereits eingetragen'),
    'the learner is told that the start message is already in the chat')
  assert(nativeTest.page.url() === locationBeforeStart
    && await nativeTest.page.evaluate(() => navigator.clipboard.readText()) === 'clipboard before the start',
    'starting leaves the page and the clipboard alone')
  await chatLink.click()
  assert((await chatLinkOpens()).length === 2 && Number(nativeLaunches) === 1,
    'the visible link opens the same chat again without creating another session')
  const fallback = nativeTest.page.getByTestId('chatgpt-desktop-fallback')
  const preparedMessage = nativeTest.page.getByLabel('Startnachricht für ChatGPT Desktop')
  assert(!await preparedMessage.isVisible(), 'the manual way stays closed while the direct start is the main path')
  await fallback.getByText('Der Chat öffnet sich nicht?', { exact: true }).click()
  assert(await preparedMessage.inputValue() === startMessage,
    'the fallback shows the authoritative session handoff unchanged')
  await nativeTest.page.getByRole('button', { name: 'ChatGPT-Startnachricht kopieren' }).click()
  await nativeTest.page.getByRole('button', { name: 'ChatGPT-Startnachricht kopiert', exact: true }).waitFor()
  assert(await nativeTest.page.evaluate(() => navigator.clipboard.readText()) === startMessage,
    'the fallback copy hands the exact server prompt to the clipboard')
  assert(await nativeTest.page.evaluate(() => !JSON.stringify(localStorage).includes('sps_')
    && !JSON.stringify(sessionStorage).includes('sps_')), 'session capabilities are not persisted in browser storage')
  assert(chatTestContext.pages().length === 1, 'a desktop start does not navigate to an unselected web chat')
  assert(claudeLaunches === 0, 'a ChatGPT start never falls back to a Claude launch')
  await nativeTest.page.getByRole('radio', { name: /Claude-Lerncoach/u }).check()
  assert(await nativeTest.page.getByTestId('chatgpt-desktop-handoff').count() === 0,
    'switching provider removes the provider-bound start message')
  await nativeTest.page.getByRole('radio', { name: /ChatGPT Desktop/u }).check()
  assert(await nativeTest.page.getByTestId('chatgpt-desktop-handoff').count() === 0,
    'returning to ChatGPT requires a fresh explicit start')
  let releasePreparation!: () => void
  let preparationStarted!: () => void
  const started = new Promise<void>(resolve => { preparationStarted = resolve })
  heldPreparation = {
    started: preparationStarted,
    release: new Promise<void>(resolve => { releasePreparation = resolve }),
  }
  await nativeTest.page.getByRole('button', { name: 'Lernen mit ChatGPT starten' }).click()
  await started
  await nativeTest.page.getByRole('radio', { name: /Claude-Lerncoach/u }).check()
  await nativeTest.page.getByRole('radio', { name: /ChatGPT Desktop/u }).check()
  const finished = nativeTest.page.waitForResponse('**/openai/v1/launch')
  releasePreparation()
  await finished
  await nativeTest.page.waitForTimeout(150)
  assert(await nativeTest.page.getByTestId('chatgpt-desktop-handoff').count() === 0
    && (await chatLinkOpens()).length === 2,
    'an in-flight launch from the previous provider mount can neither resurrect its prompt nor open a chat')
  assert(Number(nativeLaunches) === 2 && claudeLaunches === 0,
    'provider switching does not generate a substitute session')
  await nativeTest.page.unroute('**/claude/v1/launch')
  let staleClaudeNavigations = 0
  await chatTestContext.route('https://claude.ai/**', async (route) => {
    staleClaudeNavigations += 1
    await route.fulfill({ status: 200, contentType: 'text/html', body: 'Unexpected stale launch' })
  })
  let releaseClaudeLaunch!: () => void
  let claudeLaunchStarted!: () => void
  const claudeStarted = new Promise<void>(resolve => { claudeLaunchStarted = resolve })
  const claudeHeld = new Promise<void>(resolve => { releaseClaudeLaunch = resolve })
  await nativeTest.page.route('**/claude/v1/launch', async (route) => {
    claudeLaunchStarted()
    await claudeHeld
    const learningSessionId = `spc_${'B'.repeat(43)}`
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({
      prompt: `Nutze den SkillPilot-Coach-Skill. learningSessionId: ${learningSessionId}`,
      learningSessionId, expiresAt: '2099-09-25T10:00:00Z', webUrl: 'https://claude.ai/new',
    }) })
  })
  await nativeTest.page.getByRole('radio', { name: /Claude-Lerncoach/u }).check()
  const placeholder = nativeTest.page.waitForEvent('popup')
  await nativeTest.page.getByTestId('claude-plugin-start').click()
  const pendingClaudeWindow = await placeholder
  await claudeStarted
  await nativeTest.page.getByRole('radio', { name: /ChatGPT Desktop/u }).check()
  await nativeTest.page.getByRole('radio', { name: /Claude-Lerncoach/u }).check()
  const staleClosed = pendingClaudeWindow.waitForEvent('close')
  releaseClaudeLaunch()
  await staleClosed
  assert(staleClaudeNavigations === 0 && chatTestContext.pages().length === 1,
    'a pending Claude launch closes its placeholder without delivering a stale session after switching away and back')
  assert(await nativeTest.page.getByTestId('claude-plugin-start').isEnabled(),
    'an invalidated launch does not leave the selected provider stuck in a busy state')
  await chatTestContext.close()

  const compactButtons = returning.page.getByRole('button', { name: /^Ändern:/u })
  await compactButtons.first().waitFor()
  assert(
    await compactButtons.count() === 3,
    'a preconfigured returning learner gets all three completed setup steps as compact disclosures',
  )
  const idCard = returning.page
    .getByRole('heading', { name: 'SkillPilot-ID festlegen' })
    .locator('xpath=ancestor::section[1]')
  const idSummary = await idCard.locator('p').first().textContent() ?? ''
  assert(
    idSummary.includes('Bestätigt')
      && idSummary.includes('11111111…1111')
      && !idSummary.includes(existingLearnerId),
    'the compact ID step confirms the learner with a short form of the SkillPilot ID',
  )
  assert(
    await idCard.getByRole('button', { name: 'Ändern: SkillPilot-ID festlegen' })
      .getAttribute('aria-expanded') === 'false'
      && !await returning.page.getByLabel('Deine SkillPilot-ID').isVisible(),
    'the confirmed ID step starts collapsed, so the start step follows directly',
  )
  await idCard.getByRole('button', { name: 'Ändern: SkillPilot-ID festlegen' }).click()
  assert(
    await returning.page.getByLabel('Deine SkillPilot-ID').inputValue() === existingLearnerId
      && await idCard.getByRole('button', { name: 'Daten & SkillPilot-ID' }).isVisible(),
    'reopening the ID step restores the full ID field and its data management',
  )
  await idCard.getByRole('button', { name: 'Einklappen: SkillPilot-ID festlegen' }).click()
  const cockpitStart = returning.page.getByTestId('learner-cockpit-start')
  assert(
    await cockpitStart.getByRole('heading', { name: 'Cockpit: Überblick und Einstellungen' }).isVisible()
      && await cockpitStart.getByRole('link', { name: 'Cockpit öffnen' }).getAttribute('target') === '_blank',
    'the start step offers the Cockpit separately as overview and settings',
  )
  assert(
    await returning.page.getByRole('button', { name: /Lernen mit Claude starten/u }).isVisible()
      && (await cockpitStart.textContent())?.includes('Gelernt wird mit dem Lerncoach'),
    'the coach start is named as the way to learn, and the Cockpit says so too',
  )
  const curriculumCard = returning.page
    .getByRole('heading', { name: 'Curriculum wählen' })
    .locator('xpath=ancestor::section[1]')
  const personalCard = returning.page
    .getByRole('heading', { name: 'Persönliches Curriculum festlegen' })
    .locator('xpath=ancestor::section[1]')
  assert(
    await curriculumCard.getByRole('button', { name: 'Ändern: Curriculum wählen' })
      .getAttribute('aria-expanded') === 'false'
      && await personalCard.getByRole('button', {
        name: 'Ändern: Persönliches Curriculum festlegen',
      }).getAttribute('aria-expanded') === 'false',
    'both completed setup steps start collapsed for a returning learner',
  )
  const curriculumSummary = await curriculumCard.locator('p').first().textContent() ?? ''
  assert(
    curriculumSummary.includes(curriculumTitle),
    'the compact curriculum step shows the localized selected curriculum',
  )
  const personalSummary = await personalCard.locator('p').first().textContent() ?? ''
  for (const selection of [
    'Alle Bundesländer',
    'Sekundarstufe I und II',
    'Mathematik',
    'Physik',
  ]) {
    assert(
      personalSummary.includes(selection),
      `the compact personal curriculum shows ${selection}`,
    )
  }
  assert(
    !/\+\d|weitere Angabe/u.test(personalSummary),
    'the compact personal curriculum names every selected parameter instead of counting hidden ones',
  )
  assert(
    !await curriculumCard.locator('select').isVisible()
      && !await personalCard.getByRole('button', { name: /Bundesland auswählen ändern/u }).isVisible(),
    'the full curriculum controls stay hidden while the summaries are collapsed',
  )

  const landscapeRequestsAfterSettle = returning.apiMetrics.landscapeRequests
  await returning.page.waitForTimeout(150)
  assert(
    returning.apiMetrics.landscapeRequests === landscapeRequestsAfterSettle,
    'entering compact mode does not remount the dropdown or start another landscape request',
  )

  await curriculumCard.getByRole('button', { name: 'Ändern: Curriculum wählen' }).click()
  assert(
    await curriculumCard.locator('select').isVisible()
      && await personalCard.getByRole('button', {
        name: 'Ändern: Persönliches Curriculum festlegen',
      }).getAttribute('aria-expanded') === 'false',
    'opening step 2 reveals its real control without opening step 3',
  )
  await personalCard.getByRole('button', {
    name: 'Ändern: Persönliches Curriculum festlegen',
  }).click()
  assert(
    await personalCard.getByRole('button', { name: /Bundesland auswählen ändern/u }).isVisible(),
    'opening step 3 reveals its targeted edit controls',
  )
  await personalCard.getByRole('button', {
    name: 'Einklappen: Persönliches Curriculum festlegen',
  }).press('Enter')
  assert(
    await personalCard.getByRole('button', {
      name: 'Ändern: Persönliches Curriculum festlegen',
    }).getAttribute('aria-expanded') === 'false',
    'the disclosure can be collapsed from the keyboard',
  )
  await personalCard.getByRole('button', {
    name: 'Ändern: Persönliches Curriculum festlegen',
  }).click()
  await personalCard.getByRole('button', { name: /Bundesland auswählen ändern/u }).click()
  const selectionHeading = personalCard.getByRole('heading', {
    name: 'Bundesland auswählen',
  }).last()
  await selectionHeading.waitFor()
  assert(
    returning.apiMetrics.rewindRequests === 1
      && await selectionHeading.evaluate((heading) => document.activeElement === heading),
    'changing a compact personal curriculum preserves the editor and moves focus to the reopened question',
  )
  assert(
    returning.browserErrors.length === 0,
    `returning learner browser errors:\n${returning.browserErrors.join('\n')}`,
  )
  await returning.page.close()

  const curriculumChange = await openFreshSetupPage(context, baseUrl)
  await curriculumChange.page.getByLabel('Deine SkillPilot-ID').fill(existingLearnerId)
  await continueToCompletedSetup(curriculumChange.page)
  const curriculumChangeButton = curriculumChange.page.getByRole('button', {
    name: 'Ändern: Curriculum wählen',
  })
  await curriculumChangeButton.waitFor()
  await curriculumChangeButton.click()
  await curriculumChange.page.getByRole('button', { name: 'Alle', exact: true }).click()
  const curriculumSelect = curriculumChange.page.getByLabel('Dein Curriculum')
  await curriculumSelect.focus()
  await curriculumSelect.selectOption(alternativeLandscape.curriculumId)
  await curriculumChange.page.waitForFunction(
    (curriculumId) => {
      const select = document.getElementById('sessionCurriculumSelect') as HTMLSelectElement | null
      return select?.value === curriculumId && !select.disabled
    },
    alternativeLandscape.curriculumId,
  )
  assert(
    curriculumChange.apiMetrics.curriculumSaveRequests === 1
      && await curriculumSelect.evaluate((select) => document.activeElement === select),
    'changing the curriculum keeps the stable select focused after the authoritative reread',
  )
  assert(
    curriculumChange.apiMetrics.resumeRequests === 1,
    'the authoritative reread after a curriculum save does not create another resume activity',
  )
  const landscapeRequestsAfterCurriculumChange = curriculumChange.apiMetrics.landscapeRequests
  await curriculumChange.page.waitForTimeout(150)
  assert(
    curriculumChange.apiMetrics.landscapeRequests === landscapeRequestsAfterCurriculumChange,
    'the curriculum change settles without a landscape request loop',
  )
  assert(
    curriculumChange.browserErrors.length === 0,
    `curriculum change browser errors:\n${curriculumChange.browserErrors.join('\n')}`,
  )
  await curriculumChange.page.close()

  const freshGeneratedDeletion = await openFreshSetupPage(context, baseUrl)
  await freshGeneratedDeletion.page.getByRole('button', { name: 'Neue SkillPilot-ID erstellen' }).click()
  await freshGeneratedDeletion.page.waitForFunction(
    (learnerId) => {
      const input = document.getElementById('skillpilotIdInput') as HTMLInputElement | null
      return input?.value === learnerId
    },
    generatedLearnerId,
  )
  const freshDataAction = freshGeneratedDeletion.page.getByRole('button', {
    name: 'Daten & SkillPilot-ID',
  })
  await freshDataAction.waitFor()
  assert(
    await freshGeneratedDeletion.page.getByRole('heading', { name: 'Curriculum wählen' }).count() === 0,
    'a freshly generated learner can manage its data before curriculum setup starts',
  )
  await freshDataAction.click()
  const freshDataDialog = freshGeneratedDeletion.page.getByRole('dialog', { name: 'Daten & SkillPilot-ID' })
  await freshDataDialog.waitFor()
  const scheduledDeletion = freshDataDialog.locator('time[datetime="2027-08-13T08:00:00Z"]')
  await scheduledDeletion.waitFor()
  assert(
    freshGeneratedDeletion.apiMetrics.retentionRequests === 1
      && await scheduledDeletion.count() === 1,
    'the fresh-ID dialog loads authoritative retention data',
  )
  assert(
    await freshGeneratedDeletion.page.getByRole('button', { name: 'Lernstand exportieren' }).count() === 0
      && await freshGeneratedDeletion.page.getByRole('button', { name: 'Sicherungsdatei importieren' }).count() === 0,
    'SessionSetup exposes a delete-only data dialog without non-functional transfer actions',
  )
  await freshGeneratedDeletion.page.getByRole('button', { name: 'SkillPilot-ID und Daten löschen' }).click()
  await freshGeneratedDeletion.page.getByRole('checkbox', {
    name: /Ich verstehe, dass die SkillPilot-ID/u,
  }).check()
  await freshGeneratedDeletion.page.getByRole('button', { name: 'Endgültig löschen' }).click()
  await freshGeneratedDeletion.page.getByTestId('public-landing-action-learning').waitFor()
  assert(
    freshGeneratedDeletion.apiMetrics.deletionRequests === 1
      && freshGeneratedDeletion.apiMetrics.lastDeletionConfirmation === generatedLearnerId,
    'fresh-ID deletion sends exactly one ID-confirmed DELETE before resetting setup',
  )
  assert(
    await freshGeneratedDeletion.page.evaluate(() => localStorage.getItem('skillpilot_id')) === null,
    'server-confirmed fresh-ID deletion leaves no current learner browser session',
  )
  assert(
    freshGeneratedDeletion.browserErrors.length === 0,
    `fresh generated deletion browser errors:\n${freshGeneratedDeletion.browserErrors.join('\n')}`,
  )
  await freshGeneratedDeletion.page.close()

  const generated = await openFreshSetupPage(context, baseUrl)
  await generated.page.getByRole('button', { name: 'Neue SkillPilot-ID erstellen' }).click()
  const generatedIdInput = generated.page.getByLabel('Deine SkillPilot-ID')
  await generated.page.waitForFunction(
    (learnerId) => {
      const input = document.getElementById('skillpilotIdInput') as HTMLInputElement | null
      return input?.value === learnerId
    },
    generatedLearnerId,
  )
  assert(
    await generatedIdInput.inputValue() === generatedLearnerId,
    'the generated-ID path uses the backend-created learner',
  )
  await continueToCompletedSetup(generated.page)
  assert(
    await generated.page.getByRole('button', { name: /^Ändern:/u }).count() === 0,
    'a setup completed for a newly generated ID stays open in the current visit',
  )
  assert(
    await generated.page.getByLabel('Dein Curriculum').isVisible()
      && await generated.page.getByRole('heading', {
        name: 'Dein persönlicher Lehrplan ist eingerichtet.',
      }).isVisible(),
    'the new learner keeps the full curriculum and completion confirmation visible',
  )
  assert(
    generated.browserErrors.length === 0,
    `generated learner browser errors:\n${generated.browserErrors.join('\n')}`,
  )
  await generated.page.close()

  const incomplete = await openFreshSetupPage(context, baseUrl)
  await incomplete.page.getByLabel('Deine SkillPilot-ID').fill(incompleteLearnerId)
  await incomplete.page.getByRole('button', {
    name: 'Weiter zu Schritt 2: Curriculum wählen',
  }).click()
  await incomplete.page.getByRole('heading', { name: 'Bundesland auswählen' }).waitFor()
  assert(
    await incomplete.page.getByRole('button', { name: /^Ändern:/u }).count() === 0
      && !await incomplete.page.getByRole('heading', { name: 'Los geht’s' }).isVisible(),
    'an existing learner with an incomplete personal curriculum stays open and cannot skip to step 4',
  )
  assert(
    incomplete.browserErrors.length === 0,
    `incomplete learner browser errors:\n${incomplete.browserErrors.join('\n')}`,
  )
  await incomplete.page.getByRole('button', { name: 'Daten & SkillPilot-ID' }).click()
  await incomplete.page.getByRole('button', { name: 'SkillPilot-ID und Daten löschen' }).click()
  await incomplete.page.getByRole('checkbox', {
    name: /Ich verstehe, dass die SkillPilot-ID/u,
  }).check()
  await incomplete.page.getByRole('button', { name: 'Endgültig löschen' }).click()
  await incomplete.page.getByTestId('public-landing-action-learning').waitFor()
  assert(
    incomplete.apiMetrics.deletionRequests === 1
      && incomplete.apiMetrics.lastDeletionConfirmation === incompleteLearnerId,
    'a deletion 404 is treated as already absent and resets incomplete setup',
  )

  await context.close()

  // The learner decides whether this browser remembers the SkillPilot ID.
  const retentionContext = await browser.newContext({ locale: 'de-DE' })
  await retentionContext.addInitScript((termsVersion) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', termsVersion)
  }, CURRENT_TERMS_VERSION)
  // Stand-in for the Cockpit document only; module requests must reach the test server.
  await retentionContext.route((url) => url.pathname === '/learner', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><title>Cockpit</title>',
  }))
  const storedId = (page: Page) => page.evaluate(() => ({
    remembered: localStorage.getItem('skillpilot_id'),
    tab: sessionStorage.getItem('skillpilot_id'),
  }))

  const secure = await openFreshSetupPage(retentionContext, baseUrl)
  await secure.page.getByLabel('Deine SkillPilot-ID').fill(existingLearnerId)
  const retention = secure.page.getByTestId('skillpilot-id-retention')
  assert(
    await retention.getByRole('radio', { name: /^Sicher/u }).isChecked()
      && !await retention.getByRole('radio', { name: /^Bequem/u }).isChecked(),
    'a newly entered ID starts with the secure choice',
  )
  await continueToCompletedSetup(secure.page)
  const secureIdCard = secure.page
    .getByRole('heading', { name: 'SkillPilot-ID festlegen' })
    .locator('xpath=ancestor::section[1]')
  await secureIdCard.getByRole('button', { name: 'Ändern: SkillPilot-ID festlegen' }).waitFor()
  assert(
    (await secureIdCard.locator('p').first().textContent())?.includes('Sicher: nur in diesem Tab'),
    'the collapsed ID step names the secure choice',
  )
  const afterSecureConfirm = await storedId(secure.page)
  assert(
    afterSecureConfirm.remembered === null && afterSecureConfirm.tab === null,
    'confirming a secure ID stores it nowhere before a start',
  )
  const [secureCockpit] = await Promise.all([
    secure.page.waitForEvent('popup'),
    secure.page.getByTestId('learner-cockpit-start').getByRole('link').click(),
  ])
  await secureCockpit.waitForLoadState('domcontentloaded')
  const afterSecureStart = await storedId(secure.page)
  assert(
    afterSecureStart.remembered === null && afterSecureStart.tab === existingLearnerId,
    'a secure start keeps the ID with the tab and out of the durable browser storage',
  )
  assert(
    (await storedId(secureCockpit)).tab === existingLearnerId,
    'the Cockpit tab opened from a secure start receives the access',
  )
  await secureCockpit.close()
  const unrelatedTab = await retentionContext.newPage()
  await unrelatedTab.goto(baseUrl)
  const unrelated = await storedId(unrelatedTab)
  assert(
    unrelated.remembered === null && unrelated.tab === null,
    'another tab of the same browser finds no access after a secure start',
  )
  await unrelatedTab.close()

  await secureIdCard.getByRole('button', { name: 'Ändern: SkillPilot-ID festlegen' }).click()
  await retention.getByRole('radio', { name: /^Bequem/u }).check()
  await secure.page.waitForFunction(
    (learnerId) => localStorage.getItem('skillpilot_id') === learnerId
      && sessionStorage.getItem('skillpilot_id') === null,
    existingLearnerId,
  )
  assert(
    (await secureIdCard.locator('p').first().textContent())?.includes('Bequem: im Browser gemerkt'),
    'the ID step names the convenient choice',
  )
  assert(
    secure.browserErrors.length === 0,
    `secure choice browser errors:\n${secure.browserErrors.join('\n')}`,
  )
  await secure.page.close()

  const laterVisit = await retentionContext.newPage()
  laterVisit.setDefaultTimeout(10_000)
  const laterErrors: string[] = []
  laterVisit.on('pageerror', (error) => laterErrors.push(error.message))
  const laterMetrics = await installApi(laterVisit)
  await laterVisit.goto(baseUrl)
  await laterVisit.getByTestId('public-landing-action-learning').click()
  await laterVisit.getByRole('button', { name: 'Ändern: SkillPilot-ID festlegen' }).waitFor()
  await laterVisit.getByTestId('claude-plugin-start').waitFor()
  assert(
    laterMetrics.resumeRequests === 1,
    'a remembered ID continues with exactly one resume and no further click',
  )
  const laterIdCard = laterVisit
    .getByRole('heading', { name: 'SkillPilot-ID festlegen' })
    .locator('xpath=ancestor::section[1]')
  assert(
    (await laterIdCard.locator('p').first().textContent())?.includes('Bequem: im Browser gemerkt'),
    'a later visit shows that this browser remembers the ID',
  )
  await laterIdCard.getByRole('button', { name: 'Ändern: SkillPilot-ID festlegen' }).click()
  await laterVisit.getByTestId('skillpilot-id-retention').getByRole('radio', { name: /^Sicher/u }).check()
  assert(
    (await storedId(laterVisit)).remembered === null,
    'switching back to secure removes the remembered ID at once',
  )
  assert(
    await laterVisit.getByLabel('Deine SkillPilot-ID').inputValue() === existingLearnerId
      && await laterVisit.getByTestId('claude-plugin-start').isEnabled(),
    'switching to secure keeps the confirmed setup of the open page usable',
  )
  assert(laterErrors.length === 0, `later visit browser errors:\n${laterErrors.join('\n')}`)
  await retentionContext.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('session setup completion UI tests passed')
