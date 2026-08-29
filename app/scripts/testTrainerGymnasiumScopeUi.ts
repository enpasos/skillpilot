import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Page } from 'playwright'

import { startViteTestServer } from './viteTestServer'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const source = (relativePath: string) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

const appSource = source('src/App.tsx')
const classSetupSource = source('src/components/ClassSetup.tsx')
const trainerViewSource = source('src/views/TrainerView.tsx')

assert(
  appSource.includes('canonicalGymnasiumSetupLandscapeEntries.some(')
    && appSource.includes('classSetupRootLandscapeId={trainerClassSetupRootLandscapeId}'),
  'direct subject trainer setup uses the canonical Gymnasium closure and an explicit root ID',
)
assert(
  classSetupSource.includes('stageSelection.sek1Selected || stageSelection.sek2Selected'),
  'duration offerings are available for both lower- and upper-secondary class scopes',
)
assert(
  classSetupSource.includes('const students: StudentMapping[] = initialSession ? initialSession.students : []')
    && trainerViewSource.includes('initialSession={editingClass ?? undefined}'),
  'editing a class keeps its existing learners instead of creating replacement IDs',
)
assert(
  !trainerViewSource.includes('>{c.landscapeId}</span>')
    && trainerViewSource.includes('{scope.subjectLabel}'),
  'class cards render a readable subject label instead of the raw landscape UUID',
)
assert(
  trainerViewSource.includes("localStorage.setItem('skillpilot_classes'")
    && !trainerViewSource.includes("fetch(toApi('/api/ui/classes"),
  'class data and name-to-SkillPilot-ID mappings remain local-only',
)

const rootLandscapeId = 'a0e13c56-c25f-4742-9272-3a1a603ee52e'
const mathLandscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const physicsLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const classId = 'trainer-gymnasium-scope-class'
const studentId = '11111111-2222-4333-8444-555555555555'
const rootGoalId = 'trainer-gymnasium-root-goal'
const mathRootGoalId = 'trainer-gymnasium-math-root'
const physicsRootGoalId = 'trainer-gymnasium-physics-root'

const goal = (id: string, title: string, contains: string[] = []) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} einordnen.`,
  core: true,
  weight: 1,
  tags: ['root', 'canonical', 'GK', 'LK'],
  dimensionTags: {
    framework: 'canonical-gymnasium-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Test',
  },
  courseLevel: 'GK+LK',
  requires: [],
  contains,
  examples: [],
})

const rootLandscape = {
  landscapeId: rootLandscapeId,
  locale: 'de-DE',
  subject: 'Gymnasium',
  frameworkId: 'canonical-gymnasium-overview',
  title: 'Gymnasium (DE)',
  description: 'Kanonischer Gymnasium-Einstieg.',
  filters: [
    { id: 'ALL', label: 'Alle Bundesländer' },
    { id: 'DE-HE', label: 'Hessen' },
  ],
  goals: [goal(rootGoalId, 'Gymnasium', [mathRootGoalId, physicsRootGoalId])],
}

const mathLandscape = {
  landscapeId: mathLandscapeId,
  locale: 'de-DE',
  subject: 'Mathematik',
  frameworkId: 'canonical-gymnasium-mathematik',
  title: 'Mathematik (Gymnasium, DE)',
  description: 'Kanonische Mathematik.',
  filters: [
    { id: 'GK', label: 'Grundkurs' },
    { id: 'LK', label: 'Leistungskurs' },
  ],
  goals: [goal(mathRootGoalId, 'Mathematik')],
}

const physicsLandscape = {
  landscapeId: physicsLandscapeId,
  locale: 'de-DE',
  subject: 'Physik',
  frameworkId: 'canonical-gymnasium-physik',
  title: 'Physik (Gymnasium, DE)',
  description: 'Kanonische Physik.',
  filters: [
    { id: 'GK', label: 'Grundkurs' },
    { id: 'LK', label: 'Leistungskurs' },
  ],
  goals: [goal(physicsRootGoalId, 'Physik')],
}

const installApi = async (page: Page) => {
  let learnerCreateRequests = 0
  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (pathname === `/api/ui/landscapes/${mathLandscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mathLandscape]),
      })
      return
    }
    if (pathname === `/api/ui/landscapes/${rootLandscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([rootLandscape, mathLandscape, physicsLandscape]),
      })
      return
    }
    if (pathname === '/api/ui/learners' && request.method() === 'POST') {
      learnerCreateRequests += 1
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ skillpilotId: crypto.randomUUID() }),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })
  return () => learnerCreateRequests
}

const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/trainerGymnasiumScopeUi.html',
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
  await context.addInitScript(({ fixtureClassId, fixtureMathId, fixtureRootId, fixtureStudentId }) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', fixtureMathId)
    localStorage.setItem('skillpilot_last_landscape', fixtureMathId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: fixtureClassId,
      name: 'Mathe LK – Taunusgymnasium',
      landscapeId: fixtureMathId,
      activeFilter: 'DE-HE',
      rootLandscapeId: fixtureRootId,
      personalConfig: {
        [fixtureRootId]: { selected: true, filterId: 'DE-HE', stage: 'SekII' },
        [fixtureMathId]: { selected: true, filterId: 'LK', durationModel: 'G9' },
      },
      students: [{ name: 'Erhaltene Schülerin', id: fixtureStudentId }],
    }]))
  }, {
    fixtureClassId: classId,
    fixtureMathId: mathLandscapeId,
    fixtureRootId: rootLandscapeId,
    fixtureStudentId: studentId,
  })

  const page = await context.newPage()
  page.setDefaultTimeout(60_000)
  const browserErrors: string[] = []
  page.on('pageerror', (error) => browserErrors.push(error.message))
  const getLearnerCreateRequests = await installApi(page)

  await page.goto(`${server.baseUrl}/scripts/fixtures/trainerGymnasiumScopeUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  const newClassButton = page.getByRole('button', { name: /Neue Klasse$/u })
  await newClassButton.waitFor()
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === '+ Neue Klasse',
    ) as HTMLButtonElement | undefined
    return button?.disabled === false
  })

  const classCard = page.getByText('Mathe LK – Taunusgymnasium', { exact: true }).locator('..').locator('..')
  const classCardText = (await classCard.textContent() ?? '').replace(/\s+/gu, ' ')
  assert(classCardText.includes('Mathematik'), 'existing class card shows the readable subject')
  assert(classCardText.includes('Hessen (DE-HE)'), 'existing class card shows the jurisdiction')
  assert(classCardText.includes('Sekundarstufe II'), 'existing class card shows the stage')
  assert(classCardText.includes('G9'), 'existing class card shows the Gymnasium duration')
  assert(classCardText.includes('LK'), 'existing class card shows the course profile')
  assert(!classCardText.includes(mathLandscapeId), 'existing class card does not expose the raw landscape UUID')

  await newClassButton.click()
  await page.getByRole('heading', { name: 'Neue Klasse / Kurs anlegen' }).waitFor()
  try {
    await page.getByLabel('Sicht / Bundesland').selectOption('DE-HE', { timeout: 10_000 })
  } catch (error) {
    const bodyText = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n`
      + `Trainer setup body: ${bodyText.slice(0, 2_000)}`,
    )
  }
  await page.getByLabel('Sekundarstufe II', { exact: true }).check()
  assert(
    await page.getByLabel('Fach / Landscape').locator('option').allTextContents()
      .then((options) => options.includes('Mathematik') && options.includes('Physik')),
    'direct subject entry offers the complete canonical Gymnasium subject closure',
  )
  await page.getByLabel('G8').waitFor()
  await page.getByLabel('G9').waitFor()
  assert(
    await page.getByLabel('Sekundarstufe I', { exact: true }).isChecked() === false
      && await page.getByLabel('Sekundarstufe II', { exact: true }).isChecked(),
    'G8/G9 choices remain visible for a purely upper-secondary scope',
  )
  await page.getByRole('button', { name: 'Abbrechen' }).click()

  await page.getByTitle('Klasse und Curriculum bearbeiten').click()
  await page.getByRole('heading', { name: 'Klasse / Kurs bearbeiten' }).waitFor()
  assert(
    await page.getByLabel('Bezeichnung').inputValue() === 'Mathe LK – Taunusgymnasium',
    'edit restores the local class label',
  )
  assert(
    await page.getByLabel('Schülerliste (Namen)').count() === 0,
    'scope editing does not recreate or rewrite the local student mapping',
  )
  assert(await page.getByLabel('Sicht / Bundesland').inputValue() === 'DE-HE', 'edit restores jurisdiction')
  assert(
    await page.getByLabel('Sekundarstufe II', { exact: true }).isChecked(),
    'edit restores the upper-secondary scope',
  )
  assert(await page.getByLabel('G9').isChecked(), 'edit restores the duration model')
  assert(await page.getByLabel('Filter / Niveau').inputValue() === 'LK', 'edit restores the course profile')
  await page.getByLabel('G8').check()
  await page.getByRole('button', { name: 'Änderungen speichern' }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()

  const storedClass = await page.evaluate((fixtureClassId) => {
    const classes = JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]') as Array<Record<string, unknown>>
    return classes.find((entry) => entry.id === fixtureClassId)
  }, classId) as {
    students?: Array<{ id?: string }>
    personalConfig?: Record<string, { durationModel?: string }>
  } | undefined
  assert(storedClass?.students?.[0]?.id === studentId, 'editing preserves the existing student ID')
  assert(
    storedClass?.personalConfig?.[mathLandscapeId]?.durationModel === 'G8',
    'editing replaces the class scope with the newly selected duration model',
  )
  assert(getLearnerCreateRequests() === 0, 'editing does not issue learner-creation requests')
  assert(browserErrors.length === 0, `trainer Gymnasium scope browser errors:\n${browserErrors.join('\n')}`)

  await context.close()
  console.log('Trainer Gymnasium scope UI regression test passed.')
} finally {
  await browser?.close()
  await server.close()
}
