import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Download, type Page } from 'playwright'
import tailwindcss from '@tailwindcss/vite'

import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const landscapeId = 'trainer-course-plan-landscape'
const classId = 'trainer-course-plan-class'
const studentId = '11111111-2222-4333-8444-555555555555'
const studentName = 'Nicht im Plan anzeigen'
const rootGoalId = 'trainer-course-plan-root'
const clusterGoalId = 'trainer-course-plan-mechanics'
const firstGoalId = 'trainer-course-plan-goal-one'
const secondGoalId = 'trainer-course-plan-goal-two'

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
  await context.addInitScript(({ fixtureClassId, fixtureLandscapeId, fixtureStudentId, fixtureStudentName }) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', fixtureLandscapeId)
    localStorage.setItem('skillpilot_active_class', fixtureClassId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: fixtureClassId,
      name: 'Physik LK',
      landscapeId: fixtureLandscapeId,
      activeFilter: 'LK',
      students: [{ id: fixtureStudentId, name: fixtureStudentName }],
      currentGoalId: 'trainer-course-plan-root',
    }]))
  }, {
    fixtureClassId: classId,
    fixtureLandscapeId: landscapeId,
    fixtureStudentId: studentId,
    fixtureStudentName: studentName,
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
  await page.getByText('Physik LK', { exact: true }).click()
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
  await form.getByLabel('Von', { exact: true }).fill(today)
  await form.getByLabel('Bis einschließlich', { exact: true }).fill(blockEnd)
  await form.getByRole('button', { name: 'Abschnitt speichern', exact: true }).click()

  await page.getByRole('heading', { name: 'Mechanik', exact: true }).waitFor()
  assert(await page.getByText('2 Lernziele', { exact: true }).count() >= 1, 'the selected cluster is expanded to two planning units')

  const mechanicsBlock = page.getByTestId('course-plan-block').filter({ has: page.getByRole('heading', { name: 'Mechanik', exact: true }) })
  await mechanicsBlock.getByText('Enthaltene Lernziele und Unterrichtsstand', { exact: true }).click()
  await mechanicsBlock.getByRole('checkbox', { name: /Kräfte beschreiben/u }).check()
  assert(await page.getByText('Mindestens 1 von 2 bestätigt', { exact: true }).count() >= 1, 'unattested coverage is presented as a lower bound')
  await page.getByRole('button', { name: 'Stand bis heute vollständig nachgetragen', exact: true }).click()
  assert(await page.getByText('Datenstand für heute bestätigt', { exact: true }).count() >= 1, 'explicit teacher attestation enables the current coverage status')

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
  }, { storageKey: 'skillpilot_teacher_course_plans_v1', activeClassId: classId })
  assert(
    persistedPlan?.blocks?.some((block) => (
      'goalId' in block && block.goalId === clusterGoalId
    )) === true,
    `the restored plan revision persists locally; got ${JSON.stringify(persistedPlan)}`,
  )
  assert(persistedPlan?.blocks?.some((block) => block.title === 'Reserve') === false, 'the reverted plan block does not persist')
  assert(persistedPlan?.blocks?.some((block) => block.title === 'Mechanik-Aufgaben sicher bearbeiten') === true, 'the concrete dated target remains after reverting the later buffer change')
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

  await context.close()
  console.log('Trainer course-plan UI regression test passed.')
} finally {
  await browser?.close()
  await server.close()
}
