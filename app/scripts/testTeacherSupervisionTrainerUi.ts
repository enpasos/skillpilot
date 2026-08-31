import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Page } from 'playwright'

import { startViteTestServer } from './viteTestServer'
import { TEACHER_WORKSPACE_STORAGE_KEY } from '../src/utils/teacherSupervision'

const mathLandscapeId = 'teacher-supervision-math'
const physicsLandscapeId = 'teacher-supervision-physics'
const classId = 'teacher-supervision-linked-class'
const workspaceId = 'teacher-supervision-workspace'
const courseId = 'teacher-supervision-course'
const memberId = 'teacher-supervision-member'
const mathRootGoalId = 'teacher-supervision-math-root'
const physicsRootGoalId = 'teacher-supervision-physics-root'
const mathCanonicalGoalId = 'cf474eab-1379-4877-907e-58b0892ce734'
const physicsCanonicalGoalId = 'aa1a2cb3-8f76-45a4-9d3d-219a5e28c463'
const initialFingerprint = 'sha256:teacher-browser-projection-v1'
const changedFingerprint = 'sha256:teacher-browser-projection-v2'

const goal = (
  id: string,
  title: string,
  contains: string[] = [],
  root = false,
) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} nachvollziehbar erklären.`,
  core: true,
  weight: 1,
  tags: root ? ['root'] : [],
  dimensionTags: {
    framework: 'teacher-supervision-browser-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Betreuungstest',
  },
  requires: [],
  contains,
  examples: [],
})

const mathLandscape = {
  landscapeId: mathLandscapeId,
  locale: 'de-DE',
  subject: 'Mathematik',
  frameworkId: 'teacher-supervision-browser-test',
  title: 'Mathematik Betreuungstest',
  description: 'Deterministische Mathematik-Landschaft für die verknüpfte Betreuung.',
  filters: [
    { id: 'all', label: 'Alle' },
    { id: 'GK', label: 'Grundkurs' },
    { id: 'LK', label: 'Leistungskurs' },
  ],
  goals: [
    goal(mathRootGoalId, 'Mathematik Wurzel', [mathCanonicalGoalId], true),
    goal(mathCanonicalGoalId, 'Mathematik UUID-Lernziel'),
  ],
}

const physicsLandscape = {
  landscapeId: physicsLandscapeId,
  locale: 'de-DE',
  subject: 'Physik',
  frameworkId: 'teacher-supervision-browser-test',
  title: 'Physik Betreuungstest',
  description: 'Deterministische Physik-Landschaft für die verknüpfte Betreuung.',
  filters: [
    { id: 'all', label: 'Alle' },
    { id: 'GK', label: 'Grundkurs' },
    { id: 'LK', label: 'Leistungskurs' },
  ],
  goals: [
    goal(physicsRootGoalId, 'Physik Wurzel', [physicsCanonicalGoalId], true),
    goal(physicsCanonicalGoalId, 'Physik UUID-Lernziel'),
  ],
}

type RecordedRequest = {
  pathname: string
  method: string
  authorization: string | null
  body: unknown
}

type StoredLinkedClass = {
  activeFilter?: string
  landscapeId?: string
  linkedSupervision?: {
    personalizationFingerprint?: string
    subjects?: Array<{ landscapeId: string; activeFilter: string }>
  }
}

const readStoredClass = (page: Page): Promise<StoredLinkedClass | null> =>
  page.evaluate((expectedClassId) => {
    const parsed = JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]') as Array<StoredLinkedClass & { id?: string }>
    return parsed.find((candidate) => candidate.id === expectedClassId) ?? null
  }, classId)

const appRoot = fileURLToPath(new URL('../', import.meta.url))
process.env.VITE_TEACHER_SUPERVISION_ENABLED = 'true'
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/teacherSupervisionTrainerUi.html',
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
  await context.addInitScript((seed) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', seed.mathLandscapeId)
    localStorage.setItem('skillpilot_active_class', seed.classId)
    localStorage.setItem(seed.workspaceStorageKey, JSON.stringify({
      version: 1,
      credentials: [{
        workspaceId: seed.workspaceId,
        accessToken: 'sptw_teacher_browser_secret',
      }],
    }))
    localStorage.setItem('skillpilot_classes', JSON.stringify([{
      id: seed.classId,
      name: 'Einzelbetreuung Alex',
      landscapeId: seed.mathLandscapeId,
      activeFilter: 'LK',
      personalConfig: {
        [seed.mathLandscapeId]: { selected: true, filterId: 'LK' },
      },
      students: [{
        id: seed.memberId,
        name: 'Alex',
        accessMode: 'teacher-membership',
      }],
      source: 'linked-supervision',
      linkedSupervision: {
        workspaceId: seed.workspaceId,
        courseId: seed.courseId,
        memberId: seed.memberId,
        personalizationFingerprint: seed.initialFingerprint,
        subjects: [
          {
            landscapeId: seed.mathLandscapeId,
            title: 'Mathematik',
            activeFilter: 'LK',
            personalConfig: {
              [seed.mathLandscapeId]: { selected: true, filterId: 'LK' },
            },
          },
          {
            landscapeId: seed.physicsLandscapeId,
            title: 'Physik',
            activeFilter: 'LK',
            personalConfig: {
              [seed.physicsLandscapeId]: { selected: true, filterId: 'LK' },
            },
          },
        ],
      },
    }]))
  }, {
    classId,
    mathLandscapeId,
    physicsLandscapeId,
    workspaceId,
    courseId,
    memberId,
    initialFingerprint,
    workspaceStorageKey: TEACHER_WORKSPACE_STORAGE_KEY,
  })

  const page = await context.newPage()
  const browserErrors: string[] = []
  const requests: RecordedRequest[] = []
  let projectionVersion: 1 | 2 = 1
  let corruptMasteryBinding = false
  page.on('pageerror', (error) => browserErrors.push(error.message))

  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const recorded: RecordedRequest = {
      pathname: url.pathname,
      method: request.method(),
      authorization: request.headers().authorization ?? null,
      body: request.postData() ? request.postDataJSON() : null,
    }
    requests.push(recorded)

    if (url.pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (url.pathname === '/api/ui/landscapes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summaries: [mathLandscape, physicsLandscape] }),
      })
      return
    }
    if (url.pathname === `/api/ui/landscapes/${mathLandscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mathLandscape]),
      })
      return
    }
    if (url.pathname === `/api/ui/landscapes/${physicsLandscapeId}/closure`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([physicsLandscape]),
      })
      return
    }
    if (
      url.pathname === `/api/ui/teacher-supervision/v1/courses/${courseId}`
      && request.method() === 'GET'
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          courseId,
          courseLabel: 'Einzelbetreuung',
          members: [{
            memberId,
            status: 'ACTIVE',
            personalizationFingerprint: projectionVersion === 1 ? initialFingerprint : changedFingerprint,
            subjects: [
              { landscapeId: mathLandscapeId, title: 'Mathematik', filterId: 'LK' },
              {
                landscapeId: physicsLandscapeId,
                title: 'Physik',
                filterId: projectionVersion === 1 ? 'LK' : 'GK',
              },
            ],
          }],
        }),
      })
      return
    }
    if (
      url.pathname === `/api/ui/teacher-supervision/v1/courses/${courseId}/members/${memberId}/mastery`
      && request.method() === 'POST'
    ) {
      const body = recorded.body as { landscapeId?: string } | null
      if (body?.landscapeId === mathLandscapeId) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            memberId,
            landscapeId: mathLandscapeId,
            personalizationFingerprint: projectionVersion === 1 ? initialFingerprint : changedFingerprint,
            mastery: {
              [mathCanonicalGoalId]: 0.75,
              cf474eab_1379_4877_907e_58b0892ce734: 0,
            },
          }),
        })
        return
      }
      if (body?.landscapeId === physicsLandscapeId) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            memberId,
            landscapeId: corruptMasteryBinding ? mathLandscapeId : physicsLandscapeId,
            personalizationFingerprint: projectionVersion === 1 ? initialFingerprint : changedFingerprint,
            mastery: {
              [physicsCanonicalGoalId]: 0.4,
              aa1a2cb3_8f76_45a4_9d3d_219a5e28c463: 1,
            },
          }),
        })
        return
      }
      await route.fulfill({ status: 400, body: '' })
      return
    }

    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/teacherSupervisionTrainerUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await page.getByText('Einzelbetreuung Alex', { exact: true }).click()

  const subjectSwitch = page.getByLabel('Fachansicht')
  await subjectSwitch.waitFor()
  assert.deepEqual(
    await subjectSwitch.locator('option').allTextContents(),
    ['Mathematik', 'Physik'],
    'the active server projection exposes exactly Mathematics and Physics',
  )
  assert.equal(await subjectSwitch.inputValue(), mathLandscapeId)
  await page.locator('[title="Fortschritt: 75%"]').waitFor({ state: 'attached' })
  assert.equal(
    await page.locator('input[type="range"]').count(),
    0,
    'linked supervision exposes no mastery-write control',
  )
  assert.equal(
    await page.locator('[title="Zu meiner Liste hinzufügen"], [title="Von meiner Liste entfernen"]').count(),
    0,
    'the linked competence tree replaces plan buttons with read-only markers',
  )
  assert.equal(
    await page.getByRole('button', { name: /zu Lernplan|vom Lernplan|zuweisen/u }).count(),
    0,
    'linked supervision exposes no bulk plan-write action',
  )

  await subjectSwitch.selectOption(physicsLandscapeId)
  await page.getByRole('heading', { name: 'Physik Wurzel', exact: true }).waitFor()
  await page.locator('[title="Fortschritt: 40%"]').waitFor({ state: 'attached' })
  assert.equal(await page.getByLabel('Fachansicht').inputValue(), physicsLandscapeId)

  await page.getByRole('button', { name: /Alle Klassen$/u }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  projectionVersion = 2
  await page.getByText('Einzelbetreuung Alex', { exact: true }).click()
  await page.getByRole('heading', {
    name: 'Personalisierung geändert – Fachansichten prüfen',
    exact: true,
  }).waitFor()

  const beforeApply = await readStoredClass(page)
  assert.equal(beforeApply?.linkedSupervision?.personalizationFingerprint, initialFingerprint)
  assert.equal(
    beforeApply?.linkedSupervision?.subjects?.find(
      (subject) => subject.landscapeId === physicsLandscapeId,
    )?.activeFilter,
    'LK',
    'a changed server projection is never written before confirmation',
  )

  await page.getByRole('button', {
    name: 'Neue Fachansichten übernehmen',
    exact: true,
  }).click()
  await page.getByLabel('Fachansicht').waitFor()
  await page.locator('[title="Fortschritt: 40%"]').waitFor({ state: 'attached' })

  const afterApply = await readStoredClass(page)
  assert.equal(afterApply?.landscapeId, physicsLandscapeId)
  assert.equal(afterApply?.activeFilter, 'GK')
  assert.equal(afterApply?.linkedSupervision?.personalizationFingerprint, changedFingerprint)
  assert.equal(
    afterApply?.linkedSupervision?.subjects?.find(
      (subject) => subject.landscapeId === physicsLandscapeId,
    )?.activeFilter,
    'GK',
    'the reviewed server projection is persisted only after the explicit apply action',
  )

  await page.getByRole('button', { name: /Alle Klassen$/u }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  corruptMasteryBinding = true
  await page.getByText('Einzelbetreuung Alex', { exact: true }).click()
  await page.getByRole('heading', {
    name: 'Die Freigabe konnte nicht geprüft werden',
    exact: true,
  }).waitFor()
  assert.equal(
    await page.locator('[title="Fortschritt: 40%"]').count(),
    0,
    'a mastery response bound to another subject fails closed instead of rendering stale progress',
  )

  const teacherApiRequests = requests.filter(
    (request) => request.pathname.startsWith('/api/ui/teacher-supervision/v1/'),
  )
  assert(
    teacherApiRequests.some((request) => (
      request.pathname.endsWith(`/courses/${courseId}`)
      && request.method === 'GET'
      && request.authorization === 'Bearer sptw_teacher_browser_secret'
    )),
    'opening the linked class validates the server projection with the device capability',
  )
  assert.deepEqual(
    Array.from(new Set(
      teacherApiRequests
        .filter((request) => request.pathname.endsWith('/mastery'))
        .map((request) => (
          request.body as { landscapeId?: string } | null
        )?.landscapeId),
    )),
    [mathLandscapeId, physicsLandscapeId],
    'mastery is loaded through the membership endpoint for both subjects',
  )
  assert.equal(
    requests.some((request) => request.pathname.startsWith('/api/ui/learners/')),
    false,
    'linked supervision never falls back to direct learner-ID endpoints',
  )
  assert.equal(
    requests.some((request) => request.method === 'PUT' || request.method === 'DELETE'),
    false,
    'opening, switching and accepting a projection perform no learner-state write request',
  )
  assert.equal(
    browserErrors.length,
    0,
    `teacher supervision trainer browser errors:\n${browserErrors.join('\n')}`,
  )

  await context.close()
  console.log('teacher supervision UI security and linked trainer browser tests passed')
} finally {
  delete process.env.VITE_TEACHER_SUPERVISION_ENABLED
  await browser?.close()
  await server.close()
}
