import { fileURLToPath } from 'node:url'
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
import { CANONICAL_GYMNASIUM_MATH_ID } from '../src/utils/curriculumQualityTrafficLight'
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
  await page.getByRole('button', { name: 'Jetzt starten' }).click().catch((error: unknown) => {
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
  const context = await browser.newContext({ locale: 'de-DE' })
  await context.addInitScript(() => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_legal_waiver_accepted', 'true')
  })

  const returning = await openFreshSetupPage(context, baseUrl)
  await returning.page.getByLabel('Deine SkillPilot-ID').fill(existingLearnerId)
  await continueToCompletedSetup(returning.page)

  const compactButtons = returning.page.getByRole('button', { name: /^Ändern:/u })
  await compactButtons.first().waitFor()
  assert(
    await compactButtons.count() === 2,
    'a preconfigured returning learner gets exactly two compact setup disclosures',
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
    '+1 weitere Angabe',
  ]) {
    assert(
      personalSummary.includes(selection),
      `the compact personal curriculum shows ${selection}`,
    )
  }
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

  await context.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('session setup completion UI tests passed')
