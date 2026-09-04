import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Download, type Page } from 'playwright'
import tailwindcss from '@tailwindcss/vite'

import { startViteTestServer } from './viteTestServer'
import {
  getTeacherCoursePlanStorageId,
  teacherCoursePlanStoragePrefixForClass,
} from '../src/utils/teacherCoursePlanContext'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertJsonEqual = (actual: unknown, expected: unknown, message: string) => {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${message}; got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`,
  )
}

const landscapeId = 'trainer-course-plan-landscape'
const classId = 'trainer-course-plan-class'
const studentId = '11111111-2222-4333-8444-555555555555'
const studentName = 'Nicht im Plan anzeigen'
const rootGoalId = 'trainer-course-plan-root'
const clusterGoalId = 'trainer-course-plan-mechanics'
const firstGoalId = 'trainer-course-plan-goal-one'
const secondGoalId = 'trainer-course-plan-goal-two'
const personalizedClassId = 'trainer-course-plan-existing-learner-class'
const personalizedRootLandscapeId = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const personalizedRootGoalId = 'trainer-course-plan-school-root-goal'
const personalizedMathRootGoalId = 'trainer-course-plan-math-root'
const personalizedCompositionViewId = 'merged:de-he-gym-math-lk-g9+de-he-gym-math-gk-g9'
const sekOneClusterGoalId = 'trainer-course-plan-sek-one'
const sekTwoClusterGoalId = 'trainer-course-plan-sek-two'
const sekTwoEClusterGoalId = 'trainer-course-plan-sek-two-e-phase'
const sekOneScopeGoalId = `composition:${personalizedCompositionViewId}:structure:sek1-g9`
const sekTwoScopeGoalId = `composition:${personalizedCompositionViewId}:structure:sek2-gk-lk`
const sekOneAtomicGoalIds = Array.from(
  { length: 259 },
  (_, index) => `trainer-course-plan-sek-one-${String(index + 1).padStart(3, '0')}`,
)
const sekTwoAtomicGoalIds = Array.from(
  { length: 3 },
  (_, index) => `trainer-course-plan-sek-two-${String(index + 1).padStart(3, '0')}`,
)
const crossPhaseLkGoalId = '49f9059a-876c-5051-8146-d008b5cc691c'
const personalizedScopeAtomicGoalIds = [
  ...sekOneAtomicGoalIds,
  ...sekTwoAtomicGoalIds,
  crossPhaseLkGoalId,
]
const personalizedOpenAtomicGoalIds = [
  ...sekOneAtomicGoalIds.slice(206),
  ...sekTwoAtomicGoalIds,
  crossPhaseLkGoalId,
]
const normalClassSession = {
  id: classId,
  name: 'Physik LK',
  landscapeId,
  activeFilter: 'LK',
  students: [{ id: studentId, name: studentName }],
  currentGoalId: rootGoalId,
}
const normalCoursePlanId = getTeacherCoursePlanStorageId(normalClassSession)
const personalizedConfig = {
  [personalizedRootLandscapeId]: {
    selected: true,
    filterId: 'DE-HE',
    stage: 'CrossStage',
    durationModel: 'G9',
  },
  [landscapeId]: {
    selected: true,
    filterId: 'GK+LK',
  },
}
const personalizedClassSession = {
  id: personalizedClassId,
  name: 'Mathematik Einzelbetreuung',
  landscapeId,
  activeFilter: 'DE-HE',
  rootLandscapeId: personalizedRootLandscapeId,
  personalConfig: personalizedConfig,
  students: [{ id: studentId, name: 'Alex', accessMode: 'learner-id' as const }],
  currentGoalId: sekOneClusterGoalId,
  source: 'existing-learner' as const,
}
const personalizedCoursePlanId = getTeacherCoursePlanStorageId(personalizedClassSession)

interface LearnerRequestGate {
  blocked: boolean
  releases: Array<() => void>
}

const goal = (id: string, title: string, contains: string[] = []) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} erklären.`,
  core: true,
  weight: 1,
  tags: id === rootGoalId ? ['root', 'LK'] : ['LK'],
  dimensionTags: {
    framework: 'trainer-course-plan-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Mechanik',
  },
  courseLevel: 'LK',
  requires: [],
  contains,
  examples: [],
})

const landscape = {
  landscapeId,
  locale: 'de-DE',
  subject: 'Physik',
  frameworkId: 'trainer-course-plan-test',
  title: 'Physik Kursplan-Test',
  description: 'Deterministische Testlandschaft für den lokalen Kursplan.',
  filters: [
    { id: 'all', label: 'Alle' },
    { id: 'LK', label: 'Leistungskurs' },
  ],
  goals: [
    goal(rootGoalId, 'Physik', [clusterGoalId]),
    goal(clusterGoalId, 'Mechanik', [firstGoalId, secondGoalId]),
    goal(firstGoalId, 'Kräfte beschreiben'),
    goal(secondGoalId, 'Bewegungen auswerten'),
  ],
}

const personalizedGoal = (
  id: string,
  title: string,
  phase: string,
  contains: string[] = [],
  tags: string[] = ['GK'],
) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} erklären.`,
  core: true,
  weight: 1,
  tags,
  dimensionTags: {
    framework: 'canonical-gymnasium-trainer-course-plan-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase,
    area: 'Mathematik',
  },
  courseLevel: tags.includes('GK') && tags.includes('LK')
    ? 'both'
    : tags.includes('LK')
      ? 'LK'
      : 'GK',
  requires: [],
  contains,
  examples: [],
  type: contains.length > 0 ? 'cluster' : 'atomic',
})

const personalizedMathLandscape = {
  landscapeId,
  locale: 'de-DE',
  subject: 'Mathematik',
  frameworkId: 'canonical-gymnasium-trainer-course-plan-test',
  title: 'Mathematik Kursplan-Test',
  description: 'Personalisierte Testlandschaft mit beiden Schulstufen.',
  filters: [
    { id: 'all', label: 'Alle' },
    { id: 'GK', label: 'Grundkurs' },
    { id: 'LK', label: 'Leistungskurs' },
    { id: 'GK+LK', label: 'Grund- und Leistungskurs' },
  ],
  goals: [
    personalizedGoal(
      personalizedMathRootGoalId,
      'Mathematik',
      'GLOBAL',
      [sekOneClusterGoalId, sekTwoClusterGoalId],
      ['root', 'GK', 'LK'],
    ),
    personalizedGoal(sekOneClusterGoalId, 'Sekundarstufe I', 'J6', sekOneAtomicGoalIds),
    ...sekOneAtomicGoalIds.map((id, index) => (
      personalizedGoal(id, `Sek-I-Ziel ${index + 1}`, 'J6')
    )),
    personalizedGoal(
      sekTwoClusterGoalId,
      'Sekundarstufe II',
      'GLOBAL',
      [sekTwoEClusterGoalId, ...sekTwoAtomicGoalIds.slice(1)],
      ['GK', 'LK'],
    ),
    personalizedGoal(
      sekTwoEClusterGoalId,
      'E.4 Exponentialfunktionen',
      'E',
      [sekTwoAtomicGoalIds[0]!, crossPhaseLkGoalId],
      ['GK', 'LK'],
    ),
    ...sekTwoAtomicGoalIds.map((id, index) => (
      personalizedGoal(id, `Sek-II-Ziel ${index + 1}`, 'E')
    )),
    personalizedGoal(
      crossPhaseLkGoalId,
      'Exponential- und Potenzfunktionen asymptotisch vergleichen (LK)',
      'Q4',
      [],
      ['LK'],
    ),
  ],
}

const personalizedRootLandscape = {
  landscapeId: personalizedRootLandscapeId,
  locale: 'de-DE',
  subject: 'Gymnasium',
  frameworkId: 'canonical-gymnasium-trainer-course-plan-test-root',
  title: 'Gymnasium',
  description: 'Testwurzel für den personalisierten Kursplan.',
  filters: [{ id: 'DE-HE', label: 'Hessen' }],
  goals: [personalizedGoal(
    personalizedRootGoalId,
    'Gymnasium',
    'GLOBAL',
    [personalizedMathRootGoalId],
    ['root', 'DE-HE'],
  )],
}

const personalizedCompositionView = {
  viewId: personalizedCompositionViewId,
  landscapeId,
  scope: {
    schoolForm: 'Gymnasium',
    jurisdiction: 'DE-HE',
    stage: 'CrossStage',
    durationModel: 'G9',
    courseProfile: 'GK+LK',
  },
  rootNodes: [{
    kind: 'structure',
    id: 'mathematik',
    label: 'Mathematik',
    children: [
      {
        kind: 'structure',
        id: 'sek1-g9',
        label: 'Sekundarstufe I',
        children: [{ kind: 'canonicalSubtree', goalId: sekOneClusterGoalId }],
      },
      {
        kind: 'structure',
        id: 'sek2-gk-lk',
        label: 'Sekundarstufe II (GK + LK)',
        children: [{ kind: 'canonicalSubtree', goalId: sekTwoClusterGoalId }],
      },
    ],
  }],
}

const localDateString = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (value: string, days: number) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year!, month! - 1, day! + days)).toISOString().slice(0, 10)
}

const installApi = async (
  page: Page,
  learnerRequests: string[],
  learnerRequestGate: LearnerRequestGate,
) => {
  await page.route('**/api/ui/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname
    if (pathname.includes(`/learners/${studentId}/`)) {
      learnerRequests.push(pathname)
      if (learnerRequestGate.blocked) {
        await new Promise<void>((resolve) => learnerRequestGate.releases.push(resolve))
      }
      try {
        await route.fulfill({ status: 404, body: '' })
      } catch {
        // The plan workspace intentionally aborts in-flight learner requests.
      }
      return
    }

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

const readDownload = async (download: Download) => {
  const path = await download.path()
  assert(path, 'course-plan export has a local download path')
  return readFile(path, 'utf8')
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const trainerViewSource = await readFile(
  fileURLToPath(new URL('../src/views/TrainerView.tsx', import.meta.url)),
  'utf8',
)
const coursePlanViewSource = await readFile(
  fileURLToPath(new URL('../src/components/CoursePlanPilotView.tsx', import.meta.url)),
  'utf8',
)
assert(
  trainerViewSource.includes(
    'key={`${activeCoursePlanStorageId}:${activeCoursePlanLearnerId}:${localizedLanguage}`}',
  ),
  'the trainer remounts the course-plan workspace when the linked learner identity changes',
)
assert(
  coursePlanViewSource.includes('confirmation.learnerId !== normalizedLearnerId')
    && coursePlanViewSource.includes('confirmation.landscapeId !== normalizedLandscapeId'),
  'publication confirmation is bound to the learner and subject inspected before the write',
)
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/trainerCoursePlanUi.html',
  { plugins: [tailwindcss()] },
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
  await context.addInitScript(({ fixtureClassId, fixtureLandscapeId, fixtureSession }) => {
    if (sessionStorage.getItem('skillpilot_trainer_course_plan_seeded') === '1') return
    sessionStorage.setItem('skillpilot_trainer_course_plan_seeded', '1')
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', fixtureLandscapeId)
    localStorage.setItem('skillpilot_active_class', fixtureClassId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([fixtureSession]))
  }, {
    fixtureClassId: classId,
    fixtureLandscapeId: landscapeId,
    fixtureSession: normalClassSession,
  })

  const page = await context.newPage()
  const browserErrors: string[] = []
  const learnerRequests: string[] = []
  const failedLearnerRequests: string[] = []
  const learnerRequestGate: LearnerRequestGate = { blocked: false, releases: [] }
  page.on('pageerror', (error) => browserErrors.push(error.message))
  page.on('requestfailed', (request) => {
    const pathname = new URL(request.url()).pathname
    if (pathname.includes(`/learners/${studentId}/`)) failedLearnerRequests.push(pathname)
  })
  await installApi(page, learnerRequests, learnerRequestGate)

  await page.goto(`${server.baseUrl}/scripts/fixtures/trainerCoursePlanUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  const openCourseButton = page.getByRole('button', { name: 'Kurs Physik LK öffnen', exact: true })
  await openCourseButton.focus()
  await page.keyboard.press('Enter')
  try {
    await page.getByRole('heading', { name: 'Plan & Lage', exact: true }).waitFor()
  } catch (error) {
    const body = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nURL: ${page.url()}\nBody: ${body.slice(0, 2_000)}`)
  }
  await page.waitForTimeout(300)

  const url = new URL(page.url())
  assert(url.searchParams.get('view') === 'plan', 'the plan workspace is represented in the trainer URL')
  assert(await page.getByText('Die Lehrkraft führt', { exact: true }).count() === 1, 'teacher agency is the first plan-page framing')
  assert(await page.getByText(studentName, { exact: true }).count() === 0, 'the local plan workspace does not render learner names')
  assert(
    await page.getByRole('button', { name: 'Im Cockpit bereitstellen', exact: true }).count() === 0,
    'classes without an existing-learner subject link expose no cockpit publication action',
  )
  assert(learnerRequests.length === 0, `the local plan workspace does not request learner data; got ${JSON.stringify(learnerRequests)}`)
  assert(await page.getByTestId('course-plan-empty-state').count() === 1, 'a guided three-step empty state is visible')

  const today = localDateString()
  const blockEnd = addDays(today, 13)
  await page.getByRole('button', { name: 'Ersten Abschnitt planen', exact: true }).click()
  const form = page.getByRole('heading', { name: 'Neuen Planabschnitt anlegen', exact: true }).locator('..').locator('..')
  const goalSelect = form.getByRole('combobox', { name: 'Lernziel oder Cluster' })
  const goalOptionValues = await goalSelect.locator('option').evaluateAll((options) => (
    options.map((option) => (option as HTMLOptionElement).value)
  ))
  assert(
    goalOptionValues.includes(clusterGoalId),
    `the projected cluster is offered for planning; got ${JSON.stringify(goalOptionValues)}`,
  )
  await goalSelect.selectOption(clusterGoalId)
  assert(
    await page.getByTestId('course-plan-save-status').getByText('Nicht gespeicherte Änderungen', { exact: true }).count() === 1,
    'editing a block draft exposes an explicit unsaved status',
  )
  await form.getByLabel('Von', { exact: true }).fill(today)
  await form.getByLabel('Bis einschließlich', { exact: true }).fill(blockEnd)
  await form.getByRole('button', { name: 'Abschnitt speichern', exact: true }).click()

  await page.getByRole('heading', { name: 'Mechanik', exact: true }).waitFor()
  assert(await page.getByText('2 Lernziele', { exact: true }).count() >= 1, 'the selected cluster is expanded to two planning units')

  const mechanicsBlock = page.getByTestId('course-plan-block').filter({ has: page.getByRole('heading', { name: 'Mechanik', exact: true }) })
  await mechanicsBlock.getByText('Enthaltene Lernziele und Unterrichtsstand', { exact: true }).click()
  const coverageEffectiveOn = addDays(today, -8)
  await page.getByLabel(/^Behandelt am/u).fill(coverageEffectiveOn)
  await mechanicsBlock.getByRole('checkbox', { name: /Kräfte beschreiben/u }).check()
  assert(await page.getByText('Mindestens 1 von 2 bestätigt', { exact: true }).count() >= 1, 'unattested coverage is presented as a lower bound')
  await page.getByRole('button', { name: 'Stand bis heute vollständig nachgetragen', exact: true }).click()
  assert(await page.getByText('Datenstand für heute bestätigt', { exact: true }).count() >= 1, 'explicit teacher attestation enables the current coverage status')

  const coursePlanScroller = page.getByTestId('trainer-course-plan-view')
  const editMechanicsButton = mechanicsBlock.getByRole('button', { name: 'Bearbeiten', exact: true })
  await editMechanicsButton.scrollIntoViewIfNeeded()
  const scrollTopBeforeEdit = await coursePlanScroller.evaluate((element) => element.scrollTop)
  assert(scrollTopBeforeEdit > 0, 'the edit regression starts from the scrolled plan block')
  await editMechanicsButton.click()
  const editFormHeading = page.getByRole('heading', { name: 'Planabschnitt bearbeiten', exact: true })
  await editFormHeading.waitFor()
  const editFormIsInView = await editFormHeading.evaluate((heading) => {
    const scroller = heading.closest<HTMLElement>('[data-testid="trainer-course-plan-view"]')
    if (!scroller) return false
    const headingRect = heading.getBoundingClientRect()
    const scrollerRect = scroller.getBoundingClientRect()
    return headingRect.top >= scrollerRect.top && headingRect.bottom <= scrollerRect.bottom
  })
  assert(editFormIsInView, 'editing scrolls the existing plan-section form into the visible plan workspace')
  assert(
    await editFormHeading.evaluate((heading) => document.activeElement === heading),
    'editing moves keyboard focus to the plan-section form heading',
  )
  const editForm = page.locator('section').filter({ has: editFormHeading })
  assert(
    await editForm.getByRole('combobox', { name: 'Lernziel oder Cluster' }).inputValue() === clusterGoalId,
    'the visible edit form is prefilled with the existing curriculum target',
  )
  assert(await editForm.getByLabel('Von', { exact: true }).inputValue() === today, 'the edit form keeps the existing start date')
  assert(await editForm.getByLabel('Bis einschließlich', { exact: true }).inputValue() === blockEnd, 'the edit form keeps the existing end date')
  await editForm.getByRole('button', { name: 'Abbrechen', exact: true }).click()

  await page.getByRole('button', { name: 'Abschnitt hinzufügen', exact: true }).click()
  const milestoneFormHeading = page.getByRole('heading', { name: 'Neuen Planabschnitt anlegen', exact: true })
  await milestoneFormHeading.waitFor()
  const milestoneForm = page.locator('section').filter({ has: milestoneFormHeading })
  await milestoneForm.getByRole('combobox').first().selectOption('milestone')
  await milestoneForm.getByRole('combobox', { name: 'Lernziel oder Cluster' }).selectOption(clusterGoalId)
  await milestoneForm.getByLabel(/^Bezeichnung/u).fill('Mechanik-Aufgaben sicher bearbeiten')
  await milestoneForm.getByLabel('Fällig am', { exact: true }).fill(addDays(today, 20))
  await milestoneForm.getByRole('button', { name: 'Abschnitt speichern', exact: true }).click()
  await page.getByRole('heading', { name: 'Mechanik-Aufgaben sicher bearbeiten', exact: true }).waitFor()
  assert(
    await page.getByText('Konkretes Ziel: Mechanik', { exact: true }).count() === 1,
    'a dated milestone can be linked to a concrete curriculum target',
  )

  await page.getByRole('button', { name: 'Abschnitt hinzufügen', exact: true }).click()
  const secondFormHeading = page.getByRole('heading', { name: 'Neuen Planabschnitt anlegen', exact: true })
  await secondFormHeading.waitFor()
  const secondForm = page.locator('section').filter({ has: secondFormHeading })
  await secondForm.getByRole('combobox').first().selectOption('buffer')
  await secondForm.getByLabel('Bezeichnung', { exact: true }).fill('Reserve')
  await secondForm.getByLabel('Von', { exact: true }).fill(addDays(today, 14))
  await secondForm.getByLabel('Bis einschließlich', { exact: true }).fill(addDays(today, 18))
  await secondForm.getByRole('button', { name: 'Abschnitt speichern', exact: true }).click()
  await page.getByRole('heading', { name: 'Reserve', exact: true }).waitFor()

  await page.getByRole('button', { name: 'Letzte Planänderung rückgängig machen', exact: true }).click()
  await page.getByRole('heading', { name: 'Reserve', exact: true }).waitFor({ state: 'detached' })
  assert(await page.getByRole('heading', { name: 'Mechanik', exact: true }).count() === 1, 'undo creates a new revision while restoring the previous plan')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Plan exportieren', exact: true }).click()
  const exported = await readDownload(await downloadPromise)
  assert(!exported.includes(classId), 'plan export omits the local class ID')
  assert(!exported.includes(studentId), 'plan export omits learner SkillPilot IDs')
  assert(!exported.includes(studentName), 'plan export omits learner names')
  assert(!/"mastery"\s*:/iu.test(exported), 'plan export omits learner mastery fields')
  const exportPayload = JSON.parse(exported) as { plan?: { blocks?: unknown[] } }
  assert(Array.isArray(exportPayload.plan?.blocks), 'plan export remains a schema-shaped reusable plan document')

  const persistedPlan = await page.evaluate(({ storageKey, activeClassId }) => {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const store = JSON.parse(raw) as { plansByClassId?: Record<string, { blocks?: Array<{ title?: string }> }> }
    return store.plansByClassId?.[activeClassId] ?? null
  }, { storageKey: 'skillpilot_teacher_course_plans_v1', activeClassId: normalCoursePlanId })
  assert(
    persistedPlan?.blocks?.some((block) => (
      'goalId' in block && block.goalId === clusterGoalId
    )) === true,
    `the restored plan revision persists locally; got ${JSON.stringify(persistedPlan)}`,
  )
  assert(persistedPlan?.blocks?.some((block) => block.title === 'Reserve') === false, 'the reverted plan block does not persist')
  assert(persistedPlan?.blocks?.some((block) => block.title === 'Mechanik-Aufgaben sicher bearbeiten') === true, 'the concrete dated target remains after reverting the later buffer change')
  assert(
    (persistedPlan as { coverageEvents?: Array<{ effectiveOn?: string }> } | null)?.coverageEvents?.[0]?.effectiveOn === coverageEffectiveOn,
    'a backfilled coverage event keeps the teacher-selected effective date',
  )
  assert(await page.getByText(studentName, { exact: true }).count() === 0, 'learner names remain absent after plan edits')
  assert(learnerRequests.length === 0, `plan workspace requests no learner data; got ${JSON.stringify(learnerRequests)}`)

  learnerRequestGate.blocked = true
  const learnerRequestStarted = page.waitForRequest((request) => (
    new URL(request.url()).pathname.includes(`/learners/${studentId}/`)
  ))
  await page.getByTestId('trainer-goals-tab').click()
  await learnerRequestStarted
  await page.getByTestId('trainer-plan-tab').click()
  await page.getByRole('heading', { name: 'Plan & Lage', exact: true }).waitFor()
  learnerRequestGate.blocked = false
  learnerRequestGate.releases.splice(0).forEach((release) => release())
  await page.waitForTimeout(100)
  assert(failedLearnerRequests.length > 0, 'switching to the plan workspace aborts in-flight learner requests')
  assert(await page.getByText(studentName, { exact: true }).count() === 0, 'the plan workspace remains free of learner names after an aborted request')
  assert(browserErrors.length === 0, `trainer course-plan browser errors:\n${browserErrors.join('\n')}`)

  if (process.env.SKILLPILOT_COURSE_PLAN_SCREENSHOT) {
    const scrollOffset = Number(process.env.SKILLPILOT_COURSE_PLAN_SCREENSHOT_SCROLL ?? 0)
    if (Number.isFinite(scrollOffset) && scrollOffset > 0) {
      await page.getByTestId('trainer-course-plan-view').evaluate((element, top) => {
        element.scrollTop = top
      }, scrollOffset)
    }
    await page.screenshot({
      path: process.env.SKILLPILOT_COURSE_PLAN_SCREENSHOT,
      fullPage: true,
    })
  }

  await page.evaluate(() => {
    const classes = JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]') as Array<{
      activeFilter?: string
    }>
    if (classes[0]) classes[0].activeFilter = 'all'
    localStorage.setItem('skillpilot_classes', JSON.stringify(classes))
    localStorage.setItem('skillpilot_test_trainer_course_plan_goal', 'trainer-course-plan-root')
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/trainerCoursePlanUi.html`)
  try {
    await page.getByRole('heading', { name: 'Plan & Lage', exact: true }).waitFor()
  } catch (error) {
    const body = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nURL: ${page.url()}\nBody: ${body.slice(0, 2_000)}`)
  }
  assert(
    await page.getByTestId('course-plan-empty-state').count() === 1,
    'changing the active course profile opens an isolated plan context instead of the old plan',
  )

  const foreignPlanId = 'foreign-class-plan'
  await page.evaluate(({ storageKey, sourcePlanId, legacyPlanId, foreignId }) => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) throw new Error('missing seeded course-plan store')
    const store = JSON.parse(raw) as {
      plansByClassId: Record<string, { classId: string }>
    }
    const sourcePlan = store.plansByClassId[sourcePlanId]
    if (!sourcePlan) throw new Error('missing source plan for cleanup regression')
    store.plansByClassId[legacyPlanId] = { ...structuredClone(sourcePlan), classId: legacyPlanId }
    store.plansByClassId[foreignId] = { ...structuredClone(sourcePlan), classId: foreignId }
    localStorage.setItem(storageKey, JSON.stringify(store))
  }, {
    storageKey: 'skillpilot_teacher_course_plans_v1',
    sourcePlanId: normalCoursePlanId,
    legacyPlanId: classId,
    foreignId: foreignPlanId,
  })
  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Klasse löschen: Physik LK', exact: true }).click()
  await page.getByRole('button', { name: 'Löschen', exact: true }).click()
  await page.getByText('Noch keine Klassen angelegt. Starte jetzt!', { exact: true }).waitFor()
  const cleanupResult = await page.evaluate(({ storageKey, classPrefix, legacyPlanId, foreignId }) => {
    const store = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as {
      plansByClassId?: Record<string, unknown>
    }
    const planIds = Object.keys(store.plansByClassId ?? {})
    return {
      classPlans: planIds.filter((planId) => planId.startsWith(classPrefix)),
      legacyExists: planIds.includes(legacyPlanId),
      foreignExists: planIds.includes(foreignId),
    }
  }, {
    storageKey: 'skillpilot_teacher_course_plans_v1',
    classPrefix: teacherCoursePlanStoragePrefixForClass(classId),
    legacyPlanId: classId,
    foreignId: foreignPlanId,
  })
  assertJsonEqual(cleanupResult.classPlans, [], 'class deletion removes every contextual plan variant')
  assert(cleanupResult.legacyExists === false, 'class deletion removes the legacy class-keyed plan')
  assert(cleanupResult.foreignExists === true, 'class deletion preserves foreign class plans')

  await context.close()
  const personalizedContext = await browser.newContext({
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
  })
  const personalizedToday = localDateString()
  const personalizedBlockEnd = addDays(personalizedToday, 12)
  await personalizedContext.addInitScript((seed) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', seed.landscapeId)
    localStorage.setItem('skillpilot_active_class', seed.classId)
    localStorage.setItem('skillpilot_test_trainer_course_plan_goal', seed.routeGoalId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: seed.classId,
      name: 'Mathematik Einzelbetreuung',
      landscapeId: seed.landscapeId,
      activeFilter: 'DE-HE',
      rootLandscapeId: seed.rootLandscapeId,
      personalConfig: seed.personalConfig,
      students: [{ id: seed.studentId, name: 'Alex', accessMode: 'learner-id' }],
      currentGoalId: seed.routeGoalId,
      source: 'existing-learner',
    }]))
    localStorage.setItem('skillpilot_teacher_course_plans_v1', JSON.stringify({
      schemaVersion: 1,
      plansByClassId: {
        [seed.coursePlanId]: {
          schemaVersion: 1,
          classId: seed.coursePlanId,
          revision: 1,
          revisionChangedOn: seed.today,
          revisionChangedAt: `${seed.today}T00:00:00.000Z`,
          revisionOrigin: 'initial',
          createdAt: `${seed.today}T00:00:00.000Z`,
          updatedAt: `${seed.today}T00:00:00.000Z`,
          schoolYearLabel: '2026/27',
          blocks: [{
            id: 'sek-one-learning-block',
            kind: 'learning',
            goalId: seed.sekOneScopeGoalId,
            title: 'Sek I',
            startDate: seed.today,
            endDate: seed.blockEnd,
          }],
          revisionHistory: [],
          coverageEvents: [],
          coverageAttestations: [],
        },
      },
    }))
  }, {
    landscapeId,
    classId: personalizedClassId,
    coursePlanId: personalizedCoursePlanId,
    rootLandscapeId: personalizedRootLandscapeId,
    personalConfig: personalizedConfig,
    studentId,
    routeGoalId: sekOneClusterGoalId,
    sekOneScopeGoalId,
    today: personalizedToday,
    blockEnd: personalizedBlockEnd,
  })

  const personalizedPage = await personalizedContext.newPage()
  const personalizedBrowserErrors: string[] = []
  const learnerPlanWrites: unknown[] = []
  const existingLearnerPlanRevision = 7
  personalizedPage.on('pageerror', (error) => personalizedBrowserErrors.push(error.message))
  let releasePlanningScope: (() => void) | undefined
  const planningScopeHold = new Promise<void>((resolve) => {
    releasePlanningScope = resolve
  })
  await personalizedPage.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const pathname = url.pathname
    if (pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (pathname === '/api/ui/landscapes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summaries: [personalizedRootLandscape, personalizedMathLandscape] }),
      })
      return
    }
    if (
      pathname === `/api/ui/landscapes/${landscapeId}/closure`
      || pathname === `/api/ui/landscapes/${personalizedRootLandscapeId}/closure`
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([personalizedRootLandscape, personalizedMathLandscape]),
      })
      return
    }
    if (pathname === '/api/ui/composition-views/match') {
      assert(url.searchParams.get('landscapeId') === landscapeId, 'composition request targets Mathematics')
      assert(url.searchParams.get('stage') === 'CrossStage', 'Level-2 composition includes both school stages')
      assert(url.searchParams.get('durationModel') === 'G9', 'Level-2 composition uses the G9 duration model')
      assert(url.searchParams.get('courseProfile') === 'GK+LK', 'Level-2 composition merges GK and LK')
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(personalizedCompositionView),
      })
      return
    }
    if (pathname === `/api/ui/learners/${studentId}`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          skillpilotId: studentId,
          personalCurriculum: JSON.stringify(personalizedConfig),
        }),
      })
      return
    }
    if (pathname === `/api/ui/learners/${studentId}/planning-scope`) {
      assert(request.method() === 'GET', 'planning scope remains read-only')
      assert(url.searchParams.get('landscapeId') === landscapeId, 'planning scope targets the active subject')
      assert(!url.searchParams.has('scopeGoalId'), 'landscape baseline is independent of a selected block')
      await planningScopeHold
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Cache-Control': 'no-store' },
        body: JSON.stringify({
          curriculumId: personalizedRootLandscapeId,
          landscapeId,
          scopeAtomicGoalIds: personalizedScopeAtomicGoalIds,
          totalAtomicGoalCount: personalizedScopeAtomicGoalIds.length,
          masteredAtomicGoalCount: 206,
          openAtomicGoalIds: personalizedOpenAtomicGoalIds,
          capturedAt: `${personalizedToday}T00:00:00.000Z`,
        }),
      })
      return
    }
    if (
      pathname === `/api/ui/learners/${studentId}/learning-plans/by-landscape`
      && url.searchParams.get('landscapeId') === landscapeId
    ) {
      const detail = ({
        revision,
        planLabel,
        blocks,
      }: {
        revision: number
        planLabel: string
        blocks: unknown[]
      }) => {
        const submittedAtomicGoalIds = blocks.flatMap((block) => {
          if (typeof block !== 'object' || block === null) return []
          const atomicGoalIds = (block as { atomicGoalIds?: unknown }).atomicGoalIds
          return Array.isArray(atomicGoalIds) ? atomicGoalIds.filter((value): value is string => typeof value === 'string') : []
        })
        const storedAtomicGoalIds = new Set(
          submittedAtomicGoalIds.filter((goalId) => personalizedOpenAtomicGoalIds.includes(goalId)),
        )
        return ({
        planId: landscapeId,
        revision,
        landscapeId,
        planLabel,
        stale: false,
        period: {
          startDate: personalizedToday,
          endDate: addDays(personalizedBlockEnd, 5),
        },
        currentBlock: null,
        nextMilestone: null,
        metrics: {
          dueThroughToday: 0,
          completedDueThroughToday: 0,
          openDueThroughToday: 0,
          dueToday: 0,
          completedDueToday: 0,
          openDueToday: 0,
          totalPlanned: storedAtomicGoalIds.size,
        },
        buffer: { totalWorkdays: 0, remainingWorkdays: 0 },
        pace: { status: 'neutral', reason: 'mastery-history-not-event-backed' },
        nextEligibleGoal: null,
        continueReason: 'no-open-due-frontier-goal',
        canContinue: false,
        blocks,
        })
      }
      if (request.method() === 'GET') {
        assert(url.searchParams.get('asOf') === personalizedToday, 'publication reads the current learner plan revision with an explicit date')
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'Cache-Control': 'no-store' },
          body: JSON.stringify(detail({
            revision: existingLearnerPlanRevision,
            planLabel: 'Bestehender Fachplan',
            blocks: [],
          })),
        })
        return
      }
      assert(request.method() === 'PUT', 'publication uses the subject-plan PUT endpoint')
      const body = request.postDataJSON() as {
        planLabel?: string
        blocks?: unknown[]
      }
      learnerPlanWrites.push(body)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(detail({
          revision: existingLearnerPlanRevision + 1,
          planLabel: body.planLabel ?? '',
          blocks: body.blocks ?? [],
        })),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  const planningScopeRequest = personalizedPage.waitForRequest((request) => (
    new URL(request.url()).pathname === `/api/ui/learners/${studentId}/planning-scope`
  ))
  await personalizedPage.goto(`${server.baseUrl}/scripts/fixtures/trainerCoursePlanUi.html`)
  await personalizedPage.getByRole('heading', { name: 'Plan & Lage', exact: true }).waitFor()
  await planningScopeRequest
  const earlyPublishButton = personalizedPage.getByRole('button', {
    name: 'Nur dieses Fach aktualisieren',
    exact: true,
  })
  assert(await earlyPublishButton.isDisabled(), 'publication stays disabled while the learning plan cannot be calculated')
  const earlyPublishDisabledReason = personalizedPage.locator('#course-plan-publish-disabled-reason')
  await earlyPublishDisabledReason.waitFor()
  assert(
    await earlyPublishButton.getAttribute('aria-describedby') === 'course-plan-publish-disabled-reason'
      && (await earlyPublishDisabledReason.textContent())?.trim()
        === 'Der Plan muss vollständig berechenbar sein, bevor er bereitgestellt werden kann.',
    'the disabled publication action explains the missing calculation basis',
  )
  assert(
    decodeURIComponent(new URL(personalizedPage.url()).pathname).endsWith(`/${sekOneClusterGoalId}`),
    `the current Level-3 route remains the Sek-I focus goal; got ${personalizedPage.url()}`,
  )

  await personalizedPage.getByRole('button', { name: 'Abschnitt hinzufügen', exact: true }).click()
  const preBaselineForm = personalizedPage
    .getByRole('heading', { name: 'Neuen Planabschnitt anlegen', exact: true })
    .locator('..')
    .locator('..')
  const preBaselineGoalValues = await preBaselineForm
    .getByRole('combobox', { name: 'Lernziel oder Cluster' })
    .locator('option')
    .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
  assert(
    preBaselineGoalValues.includes(sekTwoScopeGoalId),
    'Sek II is selectable from the full Level-2 personalization despite the Sek-I route',
  )
  assert(preBaselineGoalValues.includes(sekOneScopeGoalId), 'the existing synthetic Sek-I target remains selectable')
  await preBaselineForm.getByRole('button', { name: 'Abbrechen', exact: true }).click()
  releasePlanningScope?.()

  try {
    await personalizedPage.getByText('53 offene von 259 atomaren Zielen verplant', { exact: true }).waitFor()
  } catch (error) {
    const body = (await personalizedPage.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(`${error instanceof Error ? error.message : String(error)}\nBody: ${body.slice(0, 4_000)}`)
  }
  assert(
    await personalizedPage.getByText('6 von 53 fällig', { exact: true }).count() >= 1,
    'the existing Sek-I block schedules only its 53 open atoms and has six due today',
  )

  await personalizedPage.getByRole('button', { name: 'Abschnitt hinzufügen', exact: true }).click()
  const sekTwoForm = personalizedPage
    .getByRole('heading', { name: 'Neuen Planabschnitt anlegen', exact: true })
    .locator('..')
    .locator('..')
  const sekTwoGoalSelect = sekTwoForm.getByRole('combobox', { name: 'Lernziel oder Cluster' })
  const sekTwoOption = sekTwoGoalSelect.locator(`option[value="${sekTwoScopeGoalId}"]`)
  assert(await sekTwoOption.count() === 1, 'Sek II remains selectable after the authoritative baseline is loaded')
  assert(
    (await sekTwoOption.textContent())?.includes('4 offen von 4 atomaren Zielen') === true,
    'the synthetic Sek-II option retains the cross-phase Q4 target from the authoritative baseline',
  )
  await sekTwoGoalSelect.selectOption(sekTwoScopeGoalId)
  await sekTwoForm.getByLabel('Von', { exact: true }).fill(addDays(personalizedBlockEnd, 1))
  await sekTwoForm.getByLabel('Bis einschließlich', { exact: true }).fill(addDays(personalizedBlockEnd, 5))
  await sekTwoForm.getByRole('button', { name: 'Abschnitt speichern', exact: true }).click()
  await personalizedPage.getByRole('heading', { name: 'Sekundarstufe II (GK + LK)', exact: true }).waitFor()

  const persistedPersonalizedPlan = await personalizedPage.evaluate(({ storageKey, coursePlanId }) => {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const store = JSON.parse(raw) as {
      plansByClassId?: Record<string, {
        planningBaseline?: { source?: string; scopeAtomicGoalIds?: string[]; focusGoalIds?: string[] }
        blocks?: Array<{ goalId?: string }>
      }>
    }
    return store.plansByClassId?.[coursePlanId] ?? null
  }, {
    storageKey: 'skillpilot_teacher_course_plans_v1',
    coursePlanId: personalizedCoursePlanId,
  })
  assert(
    persistedPersonalizedPlan?.planningBaseline?.source === 'learner-planning-landscape-v1',
    'the course plan persists the focus-independent landscape baseline',
  )
  assert(
    persistedPersonalizedPlan?.planningBaseline?.scopeAtomicGoalIds?.length === 263,
    'the persisted baseline contains both personalized stages',
  )
  assert(
    !('focusGoalIds' in (persistedPersonalizedPlan?.planningBaseline ?? {})),
    'the v2 baseline persists no Level-3 focus identifiers',
  )
  assert(
    persistedPersonalizedPlan?.blocks?.some(({ goalId }) => goalId === sekTwoScopeGoalId) === true,
    'the newly selected synthetic Sek-II block is saved locally',
  )

  const publishButton = personalizedPage.getByRole('button', {
    name: 'Nur dieses Fach aktualisieren',
    exact: true,
  })
  assert(await publishButton.count() === 1, 'a linked learner and subject expose the explicit cockpit publication action')
  assert(!(await publishButton.isDisabled()), 'a calculable learning plan with atomic goals enables publication')
  const planLabelInput = personalizedPage.getByLabel('Schuljahr / Planbezeichnung', { exact: true })
  await planLabelInput.fill('Noch nicht gespeichert')
  assert(await publishButton.isDisabled(), 'publication is disabled while the plan label draft is unsaved')
  assert(
    await personalizedPage.getByText('Speichere oder verwirf zuerst die noch offenen Änderungen.', { exact: true }).count() === 1,
    'the disabled publication action explains the unsaved draft',
  )
  assert(
    await personalizedPage.getByTestId('course-plan-save-status').getByText('Nicht gespeicherte Änderungen', { exact: true }).count() === 1,
    'the plan status exposes the unsaved label draft',
  )
  await planLabelInput.fill('2026/27')
  assert(!(await publishButton.isDisabled()), 'restoring the persisted label re-enables publication')
  await publishButton.click()
  const publicationConfirmation = personalizedPage.getByTestId('course-plan-publication-confirmation')
  await publicationConfirmation.getByRole('heading', {
    name: 'Plan als unabhängige Kopie bereitstellen?',
    exact: true,
  }).waitFor()
  assert(
    await publicationConfirmation.getByText(/Spätere Änderungen werden nicht automatisch synchronisiert/u).count() === 1,
    'the confirmation explains that teacher and learner plans remain independent',
  )
  assert(
    await publicationConfirmation.getByText(`Im Cockpit besteht bereits ein Fachplan (Revision ${existingLearnerPlanRevision}). Beim Bestätigen wird er durch eine neue Revision ersetzt.`, { exact: true }).count() === 1,
    'the confirmation names the exact learner-plan revision that will be replaced',
  )
  assert(
    await publicationConfirmation.getByText(/57 kanonische Atomziele werden geprüft/u).count() === 1,
    'the confirmation limits publication to the immutable open-goal planning baseline',
  )
  assert(learnerPlanWrites.length === 0, 'opening the confirmation performs no write')
  await planLabelInput.fill('Während der Bestätigung geändert')
  await publicationConfirmation.waitFor({ state: 'detached' })
  assert(learnerPlanWrites.length === 0, 'editing after inspection invalidates the confirmation without writing')
  assert(
    await personalizedPage.getByText('Der Plan wurde während des Ladens geändert. Bitte speichere den Abschnitt erneut.', { exact: true }).count() === 1,
    'an invalidated confirmation explains that the plan must be checked again',
  )
  await planLabelInput.fill('2026/27')
  await publishButton.click()
  await personalizedPage.getByTestId('course-plan-publication-confirmation').waitFor()
  await publicationConfirmation.getByRole('button', { name: 'Fachplan ersetzen', exact: true }).click()
  await personalizedPage.getByTestId('trainer-course-plan-view').getByRole('status').filter({
    hasText: `Als unabhängige Kopie im Cockpit bereitgestellt · Revision ${existingLearnerPlanRevision + 1} · ${personalizedOpenAtomicGoalIds.length} Lernziele im persönlichen Plan`,
  }).waitFor()
  assert(learnerPlanWrites.length === 1, 'explicit confirmation performs exactly one learner-plan write')
  const learnerPlanWrite = learnerPlanWrites[0] as {
    expectedRevision?: unknown
    planLabel?: unknown
    blocks?: Array<{
      id?: string
      kind?: string
      goalId?: string
      atomicGoalIds?: string[]
    }>
  }
  assertJsonEqual(
    Object.keys(learnerPlanWrite).sort(),
    ['blocks', 'expectedRevision', 'planLabel'],
    'the request contains only optimistic revision, title, and independent plan blocks',
  )
  assert(learnerPlanWrite.expectedRevision === existingLearnerPlanRevision, 'the PUT guards the revision read before confirmation')
  assert(learnerPlanWrite.planLabel === '2026/27', 'the saved local plan label becomes the learner subject-plan title')
  const publishedSekOne = learnerPlanWrite.blocks?.find(({ id }) => id === 'sek-one-learning-block')
  assertJsonEqual(
    publishedSekOne?.atomicGoalIds,
    sekOneAtomicGoalIds.slice(206),
    'publication materializes only the Sek-I atoms captured as open in the teacher planning baseline',
  )
  const publishedSekTwo = learnerPlanWrite.blocks?.find(({ goalId }) => goalId === sekTwoScopeGoalId)
  assertJsonEqual(
    publishedSekTwo?.atomicGoalIds,
    [sekTwoAtomicGoalIds[0], crossPhaseLkGoalId, ...sekTwoAtomicGoalIds.slice(1)],
    'publication resolves a different stage and cross-phase goal through the complete subject projection',
  )
  const serializedLearnerPlanWrite = JSON.stringify(learnerPlanWrite)
  for (const forbidden of [
    personalizedClassId,
    personalizedCoursePlanId,
    'planningBaseline',
    'coverageEvents',
    'coverageAttestations',
    'revisionHistory',
    'mastery',
  ]) {
    assert(!serializedLearnerPlanWrite.includes(forbidden), `learner-plan write excludes ${forbidden}`)
  }
  assert(
    personalizedBrowserErrors.length === 0,
    `focus-independent course-plan browser errors:\n${personalizedBrowserErrors.join('\n')}`,
  )
  await personalizedContext.close()
  console.log('Trainer course-plan UI regression test passed.')
} finally {
  await browser?.close()
  await server.close()
}
