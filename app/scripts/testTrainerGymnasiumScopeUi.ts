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
const mathSek1DistractorGoalId = 'trainer-gymnasium-math-sek1-distractor'
const mathSek2GoalId = 'trainer-gymnasium-math-sek2'
const physicsSek2GoalId = 'trainer-gymnasium-physics-sek2'

const goal = (
  id: string,
  title: string,
  contains: string[] = [],
  options: { root?: boolean; tags?: string[]; phase?: string } = {},
) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} einordnen.`,
  core: true,
  weight: 1,
  tags: [
    ...(options.root ? ['root'] : []),
    'canonical',
    'GK',
    'LK',
    'DE-HE',
    'G8',
    'G9',
    ...(options.tags ?? []),
  ],
  dimensionTags: {
    framework: 'canonical-gymnasium-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: options.phase ?? 'GLOBAL',
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
  goals: [goal(rootGoalId, 'Gymnasium', [mathRootGoalId, physicsRootGoalId], { root: true })],
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
  goals: [
    goal(mathRootGoalId, 'Mathematik', [mathSek1DistractorGoalId, mathSek2GoalId], { root: true }),
    goal(
      mathSek1DistractorGoalId,
      'Frühe Geometrie und Raumvorstellungen',
      [],
      { tags: ['phase:SekI'] },
    ),
    goal(
      mathSek2GoalId,
      'Sekundarstufe II Mathematik',
      [],
      { tags: ['phase:SekI'] },
    ),
  ],
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
  goals: [
    goal(physicsRootGoalId, 'Physik', [physicsSek2GoalId], { root: true }),
    goal(physicsSek2GoalId, 'Sekundarstufe II Physik'),
  ],
}

const compositionView = (
  landscapeId: string,
  targetGoalId: string,
  prerequisiteOnlyGoalId?: string,
) => ({
  viewId: `trainer-test-${landscapeId}-de-he-sekii-lk`,
  landscapeId,
  scope: {
    jurisdiction: 'DE-HE',
    schoolForm: 'Gymnasium',
    stage: 'SekII',
    courseProfile: 'LK',
  },
  rootNodes: [{
    kind: 'structure',
    id: 'sek2-lk',
    label: 'Sekundarstufe II (LK)',
    children: [
      { kind: 'canonicalSubtree', goalId: targetGoalId },
      ...(prerequisiteOnlyGoalId
        ? [{ kind: 'goalEntry', goalId: prerequisiteOnlyGoalId, projectionRole: 'prerequisiteOnly' }]
        : []),
    ],
  }],
})

const installApi = async (page: Page) => {
  let learnerCreateRequests = 0
  const closureRequests: string[] = []
  const abortedClosureRequests: string[] = []
  const compositionViewRequests: string[] = []
  let mathCompositionNoMatch = false
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname.endsWith('/closure')) closureRequests.push(url.pathname)
  })
  page.on('requestfailed', (request) => {
    const url = new URL(request.url())
    if (url.pathname.endsWith('/closure')) abortedClosureRequests.push(url.pathname)
  })
  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname

    if (pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (pathname === '/api/ui/composition-views/match') {
      const requestUrl = new URL(request.url())
      compositionViewRequests.push(requestUrl.toString())
      await new Promise((resolve) => setTimeout(resolve, 150))
      const landscapeId = requestUrl.searchParams.get('landscapeId')
      if (landscapeId === mathLandscapeId) {
        if (mathCompositionNoMatch) {
          await route.fulfill({ status: 204, body: '' })
          return
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(compositionView(
            mathLandscapeId,
            mathSek2GoalId,
            mathSek1DistractorGoalId,
          )),
        })
        return
      }
      if (landscapeId === physicsLandscapeId) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(compositionView(physicsLandscapeId, physicsSek2GoalId)),
        })
        return
      }
      await route.fulfill({ status: 204, body: '' })
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
    if (pathname === `/api/ui/landscapes/${physicsLandscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([physicsLandscape]),
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
  return {
    getLearnerCreateRequests: () => learnerCreateRequests,
    getClosureRequests: () => [...closureRequests],
    getAbortedClosureRequests: () => [...abortedClosureRequests],
    getCompositionViewRequests: () => [...compositionViewRequests],
    setMathCompositionNoMatch: (value: boolean) => {
      mathCompositionNoMatch = value
    },
  }
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
  const {
    getLearnerCreateRequests,
    getClosureRequests,
    getAbortedClosureRequests,
    getCompositionViewRequests,
    setMathCompositionNoMatch,
  } = await installApi(page)

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

  const compositionRequestCountBeforeOpen = getCompositionViewRequests().length
  await classCard.click()
  await page.getByTestId('trainer-composition-loading').waitFor()
  assert(
    await page.getByText('Frühe Geometrie und Raumvorstellungen', { exact: true }).count() === 0,
    'the broad lower-secondary node never flashes while the class composition view is loading',
  )
  await page.waitForURL((url) => url.pathname === `/trainer/${mathRootGoalId}`)
  const trainerTreePanel = page.getByTestId('trainer-competence-tree-panel')
  await trainerTreePanel.getByText('Sekundarstufe II (LK)', { exact: true }).waitFor()
  assert(
    await trainerTreePanel.getByText('Frühe Geometrie und Raumvorstellungen', { exact: true }).count() === 0,
    'the trainer tree excludes the lower-secondary distractor from an upper-secondary class',
  )
  assert(
    await trainerTreePanel.getByText('Sekundarstufe II (LK)', { exact: true }).count() === 1,
    'the trainer tree uses the exact learner-facing composition label without adding another LK suffix',
  )
  const compositionStructureRow = trainerTreePanel
    .getByText('Sekundarstufe II (LK)', { exact: true })
    .locator('..')
  await compositionStructureRow.getByRole('button').first().click()
  const explicitCompositionTarget = trainerTreePanel.getByText('Sekundarstufe II Mathematik', { exact: true })
  await explicitCompositionTarget.waitFor()
  await explicitCompositionTarget.click()
  await page.waitForURL((url) => url.pathname === `/trainer/${mathSek2GoalId}`)
  assert(
    await trainerTreePanel.getByText('Sekundarstufe II Mathematik', { exact: true }).count() === 1,
    'an explicit composition target remains authoritative even when legacy stage tags disagree',
  )

  const mathCompositionRequests = getCompositionViewRequests().slice(compositionRequestCountBeforeOpen)
  assert(
    mathCompositionRequests.length === 1,
    `opening the class resolves exactly one composition view; got ${JSON.stringify(mathCompositionRequests)}`,
  )
  const compositionRequestUrl = new URL(mathCompositionRequests[0])
  assert(
    JSON.stringify(Array.from(compositionRequestUrl.searchParams.keys()).sort())
      === JSON.stringify([
        'courseProfile',
        'durationModel',
        'jurisdiction',
        'landscapeId',
        'schoolForm',
        'stage',
      ]),
    `composition matching sends only curriculum scope keys; got ${compositionRequestUrl.search}`,
  )
  assert(
    compositionRequestUrl.searchParams.get('landscapeId') === mathLandscapeId
      && compositionRequestUrl.searchParams.get('schoolForm') === 'Gymnasium'
      && compositionRequestUrl.searchParams.get('jurisdiction') === 'DE-HE'
      && compositionRequestUrl.searchParams.get('stage') === 'SekII'
      && compositionRequestUrl.searchParams.get('courseProfile') === 'LK'
      && compositionRequestUrl.searchParams.get('durationModel') === 'G9',
    `composition matching uses the local class scope exactly; got ${compositionRequestUrl.search}`,
  )
  assert(
    !compositionRequestUrl.toString().includes(classId)
      && !compositionRequestUrl.toString().includes(studentId)
      && !decodeURIComponent(compositionRequestUrl.toString()).includes('Taunusgymnasium'),
    'composition matching never sends the local class identity, label, or student mapping',
  )

  const settledMathUrl = page.url()
  const settledMathCompositionRequestCount = getCompositionViewRequests().length
  await page.waitForTimeout(500)
  assert(page.url() === settledMathUrl, 'the matched Mathematics class route remains stable')
  assert(
    getCompositionViewRequests().length === settledMathCompositionRequestCount,
    'the settled Mathematics class view does not repeat composition matching',
  )
  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()

  setMathCompositionNoMatch(true)
  await classCard.click()
  await page.getByText(
    'Für diese Klassenauswahl konnte keine passende Curriculumansicht geladen werden.',
    { exact: true },
  ).first().waitFor()
  assert(
    await page.getByText('Frühe Geometrie und Raumvorstellungen', { exact: true }).count() === 0,
    'a missing composition view stays fail-closed instead of exposing the broad canonical tree',
  )
  setMathCompositionNoMatch(false)
  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()

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

  const closureRequestCountBeforeCreate = getClosureRequests().length
  await newClassButton.click()
  await page.getByRole('heading', { name: 'Neue Klasse / Kurs anlegen' }).waitFor()
  await page.getByLabel('Bezeichnung').fill('Physik LK – Regressionsklasse')
  await page.getByLabel('Sicht / Bundesland').selectOption('DE-HE')
  await page.getByLabel('Sekundarstufe II', { exact: true }).check()
  await page.getByLabel('Fach / Landscape').selectOption(physicsLandscapeId)
  await page.getByLabel('G9').check()
  await page.getByLabel('Filter / Niveau').selectOption('LK')
  await page.getByRole('button', { name: 'Klasse anlegen' }).click()

  try {
    await page.waitForURL((url) => url.pathname === `/trainer/${physicsRootGoalId}`, { timeout: 10_000 })
    await page.getByRole('heading', { name: 'Physik', exact: true }).waitFor({ timeout: 10_000 })
  } catch (error) {
    const bodyText = (await page.locator('body').textContent() ?? '').replace(/\s+/gu, ' ').trim()
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}\n`
      + `Current URL: ${page.url()}\n`
      + `Closure requests: ${JSON.stringify(getClosureRequests().slice(closureRequestCountBeforeCreate))}\n`
      + `Aborted closure requests: ${JSON.stringify(getAbortedClosureRequests())}\n`
      + `Body: ${bodyText.slice(0, 2_000)}`,
    )
  }
  await page.waitForTimeout(500)
  const closureRequestsAfterCreate = getClosureRequests().slice(closureRequestCountBeforeCreate)
  const stableUrl = page.url()
  const stableClosureRequestCount = getClosureRequests().length
  assert(
    closureRequestsAfterCreate.filter((pathname) => pathname === `/api/ui/landscapes/${physicsLandscapeId}/closure`).length === 1,
    `creating and opening a class loads its subject closure exactly once; got ${JSON.stringify(closureRequestsAfterCreate)}`,
  )
  assert(
    closureRequestsAfterCreate.every((pathname) => pathname === `/api/ui/landscapes/${physicsLandscapeId}/closure`),
    `creating a Physics class never falls back to another landscape closure; got ${JSON.stringify(closureRequestsAfterCreate)}`,
  )
  assert(
    getAbortedClosureRequests().length === 0,
    `creating and opening a class does not abort closure loads; got ${JSON.stringify(getAbortedClosureRequests())}`,
  )
  const createdClassState = await page.evaluate((className) => {
    const classes = JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]') as Array<{ id?: string; name?: string }>
    const createdClass = classes.find((entry) => entry.name === className)
    return {
      createdClassId: createdClass?.id,
      activeClassId: localStorage.getItem('skillpilot_active_class'),
    }
  }, 'Physik LK – Regressionsklasse')
  assert(
    createdClassState.createdClassId === createdClassState.activeClassId,
    'the created class remains the locally active class after its landscape has loaded',
  )

  await page.waitForTimeout(750)
  const finalUrl = new URL(page.url())
  assert(
    page.url() === stableUrl
      && finalUrl.pathname === `/trainer/${physicsRootGoalId}`
      && finalUrl.searchParams.get('l') === physicsLandscapeId,
    `the created class route remains stable; expected ${stableUrl}, got ${page.url()}`,
  )
  assert(
    getClosureRequests().length === stableClosureRequestCount,
    `the settled class view issues no further closure requests; got ${JSON.stringify(getClosureRequests())}`,
  )
  assert(
    await page.getByRole('heading', { name: 'Physik', exact: true }).count() === 1
      && await page.getByText('Landscapes laden ...', { exact: true }).count() === 0,
    'the Physics class view remains visible without returning to the landscape loader',
  )
  assert(browserErrors.length === 0, `trainer Gymnasium scope browser errors:\n${browserErrors.join('\n')}`)

  await context.close()
  console.log('Trainer Gymnasium scope UI regression test passed.')
} finally {
  await browser?.close()
  await server.close()
}
