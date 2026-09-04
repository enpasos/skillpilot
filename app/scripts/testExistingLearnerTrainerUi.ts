import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser, type Download } from 'playwright'

import { startViteTestServer } from './viteTestServer'
import { getTeacherCoursePlanStorageId } from '../src/utils/teacherCoursePlanContext'

const learnerId = '11111111-2222-4333-8444-555555555555'
const secondLearnerId = '66666666-7777-4888-8999-000000000000'
const classId = 'existing-learner-class'
const secondClassId = 'existing-learner-class-second-root'
const legacyClassId = 'retired-server-linked-class'
const personalConfig = {
  root: { selected: true, filterId: 'DE-HE', stage: 'sek2' },
  math: { selected: true, filterId: 'LK' },
  physics: { selected: true, filterId: 'LK' },
}
const refreshedPersonalConfig = {
  ...personalConfig,
  math: { selected: true, filterId: 'GK' },
}
const mathCoursePlanId = getTeacherCoursePlanStorageId({
  id: classId,
  name: 'Direkte Einzelbetreuung',
  landscapeId: 'math',
  activeFilter: 'DE-HE',
  rootLandscapeId: 'root',
  personalConfig,
  students: [{ id: learnerId, name: 'Alex', accessMode: 'learner-id' }],
  source: 'existing-learner',
})
const secondStoredPersonalConfig = {
  'other-root': { selected: true, filterId: 'DE-BY', stage: 'sek2' },
  chemistry: { selected: true, filterId: 'STALE' },
}
const secondRefreshedPersonalConfig = {
  ...secondStoredPersonalConfig,
  chemistry: { selected: true, filterId: 'REFRESHED' },
}

const goal = (id: string, title: string, contains: string[] = []) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} erklären.`,
  core: true,
  weight: 1,
  tags: ['LK'],
  dimensionTags: {
    framework: 'existing-learner-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Test',
  },
  requires: [],
  contains,
  examples: [],
  type: contains.length > 0 ? 'cluster' : 'atomic',
})
const mathAtomicGoals = Array.from({ length: 259 }, (_, index) => (
  goal(`math-atomic-${String(index + 1).padStart(3, '0')}`, `Mathematik-Ziel ${index + 1}`)
))
const mathAtomicGoalIds = mathAtomicGoals.map(({ id }) => id)
const mathRootGoal = {
  ...goal('math-root', 'Mathematik-Ziel', mathAtomicGoalIds),
  tags: ['root', 'LK'],
}
const rootGoal = {
  ...goal('school-root', 'Gymnasium', ['math-root', 'physics-root']),
  tags: ['root', 'DE-HE'],
}
const physicsRootGoal = {
  ...goal('physics-root', 'Physik-Ziel'),
  tags: ['root', 'LK'],
}
const otherRootGoal = {
  ...goal('other-school-root', 'Anderes Curriculum', ['chemistry-root']),
  tags: ['root', 'DE-BY'],
}
const chemistryRootGoal = {
  ...goal('chemistry-root', 'Chemie-Ziel'),
  tags: ['root'],
}
const landscapes = [
  {
    landscapeId: 'root',
    locale: 'de-DE',
    subject: 'Gymnasium',
    title: 'Gymnasium',
    description: 'Test root',
    filters: [{ id: 'DE-HE', label: 'Hessen' }],
    goals: [rootGoal],
  },
  {
    landscapeId: 'math',
    locale: 'de-DE',
    subject: 'Mathematik',
    title: 'Mathematik',
    description: 'Mathematik test',
    filters: [{ id: 'LK', label: 'Leistungskurs' }],
    goals: [mathRootGoal, ...mathAtomicGoals],
  },
  {
    landscapeId: 'physics',
    locale: 'de-DE',
    subject: 'Physik',
    title: 'Physik',
    description: 'Physik test',
    filters: [{ id: 'LK', label: 'Leistungskurs' }],
    goals: [physicsRootGoal],
  },
]
const otherLandscapes = [
  {
    landscapeId: 'other-root',
    locale: 'de-DE',
    subject: 'Anderes Curriculum',
    title: 'Anderes Curriculum',
    description: 'Second test root',
    filters: [{ id: 'DE-BY', label: 'Bayern' }],
    goals: [otherRootGoal],
  },
  {
    landscapeId: 'chemistry',
    locale: 'de-DE',
    subject: 'Chemie',
    title: 'Chemie',
    description: 'Chemie test',
    filters: [{ id: 'REFRESHED', label: 'Aktualisiert' }],
    goals: [chemistryRootGoal],
  },
]

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const readDownload = async (download: Download) => {
  const path = await download.path()
  assert(path, 'course-plan export has a local download path')
  return readFile(path, 'utf8')
}
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/existingLearnerTrainerUi.html',
)

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const context = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin' })
  await context.addInitScript((seed) => {
    const trackedWindow = window as typeof window & {
      __existingLearnerFetches: Array<{ url: string; cache?: RequestCache }>
    }
    trackedWindow.__existingLearnerFetches = []
    const nativeFetch = window.fetch.bind(window)
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url
      trackedWindow.__existingLearnerFetches.push({ url, cache: init?.cache })
      return nativeFetch(input, init)
    }

    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', 'math')
    localStorage.setItem('skillpilot_teacher_workspace_v1', 'retired-secret')
    localStorage.setItem('skillpilot_teacher_pending_supervision_v1', 'retired-pending')
    localStorage.setItem('skillpilot_classes', JSON.stringify([
      {
        id: seed.legacyClassId,
        name: 'Alte Serverkarte',
        landscapeId: 'math',
        activeFilter: 'LK',
        students: [{ id: 'membership-id', name: 'Alt', accessMode: 'teacher-membership' }],
        source: 'linked-supervision',
        linkedSupervision: { workspaceId: 'workspace', courseId: 'course', memberId: 'member' },
      },
      {
        id: seed.classId,
        name: 'Direkte Einzelbetreuung',
        landscapeId: 'math',
        activeFilter: 'DE-HE',
        rootLandscapeId: 'root',
        personalConfig: seed.personalConfig,
        students: [{ id: seed.learnerId, name: 'Alex', accessMode: 'learner-id' }],
        source: 'existing-learner',
      },
      {
        id: seed.secondClassId,
        name: 'Zweite Einzelbetreuung',
        landscapeId: 'chemistry',
        activeFilter: 'STALE',
        rootLandscapeId: 'other-root',
        personalConfig: seed.secondStoredPersonalConfig,
        students: [{ id: seed.secondLearnerId, name: 'Bea', accessMode: 'learner-id' }],
        source: 'existing-learner',
      },
    ]))
    localStorage.setItem('skillpilot_teacher_course_plans_v1', JSON.stringify({
      schemaVersion: 1,
      plansByClassId: {
        [seed.legacyClassId]: { classId: seed.legacyClassId },
        [`${seed.legacyClassId}:math`]: { classId: `${seed.legacyClassId}:math` },
        [seed.mathCoursePlanId]: {
          schemaVersion: 1,
          classId: seed.mathCoursePlanId,
          revision: 1,
          revisionChangedOn: '2026-08-01',
          revisionChangedAt: '2026-08-01T08:00:00.000Z',
          revisionOrigin: 'initial',
          createdAt: '2026-08-01T08:00:00.000Z',
          updatedAt: '2026-08-31T08:00:00.000Z',
          schoolYearLabel: '2026/27',
          blocks: [{
            id: 'sek-one-learning-block',
            kind: 'learning',
            goalId: 'math-root',
            title: 'Sek I',
            startDate: '2026-09-01',
            endDate: '2026-09-13',
          }],
          revisionHistory: [],
          coverageEvents: [],
          coverageAttestations: [{
            id: 'legacy-attestation',
            throughDate: '2026-09-01',
            recordedAt: '2026-08-31T08:00:00.000Z',
            planRevision: 1,
            coverageEventCount: 0,
          }],
        },
      },
    }))
  }, {
    learnerId,
    secondLearnerId,
    classId,
    secondClassId,
    legacyClassId,
    mathCoursePlanId,
    personalConfig,
    secondStoredPersonalConfig,
  })

  const page = await context.newPage()
  await page.clock.setFixedTime(new Date('2026-09-01T06:00:00.000Z'))
  const requests: Array<{ pathname: string; method: string }> = []
  const browserErrors: string[] = []
  let delayNextProfileRequest = false
  let markDelayedProfileRequested: (() => void) | undefined
  let releaseDelayedProfileResponse: (() => void) | undefined
  const delayedProfileRequested = new Promise<void>((resolve) => {
    markDelayedProfileRequested = resolve
  })
  const delayedProfileResponse = new Promise<void>((resolve) => {
    releaseDelayedProfileResponse = resolve
  })
  page.on('pageerror', (error) => browserErrors.push(error.message))
  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    requests.push({
      pathname,
      method: request.method(),
    })
    if (pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (pathname === '/api/ui/landscapes') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ summaries: [...landscapes, ...otherLandscapes] }),
      })
      return
    }
    if (/^\/api\/ui\/landscapes\/(?:root|math|physics)\/closure$/u.test(pathname)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(landscapes) })
      return
    }
    if (/^\/api\/ui\/landscapes\/(?:other-root|chemistry)\/closure$/u.test(pathname)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(otherLandscapes) })
      return
    }
    if (pathname === `/api/ui/learners/${learnerId}`) {
      const delayedRequest = delayNextProfileRequest
      if (delayedRequest) {
        delayNextProfileRequest = false
        markDelayedProfileRequested?.()
        await delayedProfileResponse
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          skillpilotId: learnerId,
          personalCurriculum: JSON.stringify(
            delayedRequest ? refreshedPersonalConfig : personalConfig,
          ),
        }),
      })
      return
    }
    if (pathname === `/api/ui/learners/${secondLearnerId}`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          skillpilotId: secondLearnerId,
          personalCurriculum: JSON.stringify(secondRefreshedPersonalConfig),
        }),
      })
      return
    }
    if (pathname === `/api/ui/learners/${learnerId}/mastery`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mastery: { 'math-root': 1, 'physics-root': 0.5 } }),
      })
      return
    }
    if (pathname === `/api/ui/learners/${learnerId}/planning-scope`) {
      const requestUrl = new URL(request.url())
      assert.equal(requestUrl.searchParams.get('landscapeId'), 'math')
      assert.equal(requestUrl.searchParams.has('scopeGoalId'), false)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Cache-Control': 'no-store' },
        body: JSON.stringify({
          curriculumId: 'root',
          landscapeId: 'math',
          scopeAtomicGoalIds: mathAtomicGoalIds,
          totalAtomicGoalCount: 259,
          masteredAtomicGoalCount: 206,
          openAtomicGoalIds: mathAtomicGoalIds.slice(206),
          capturedAt: '2026-09-01T06:00:00.000Z',
        }),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/existingLearnerTrainerUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await page.getByText('Direkte Einzelbetreuung', { exact: true }).waitFor()
  assert.equal(await page.getByText('Alte Serverkarte', { exact: true }).count(), 0)
  const browserState = await page.evaluate(() => ({
    classes: JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]'),
    workspace: localStorage.getItem('skillpilot_teacher_workspace_v1'),
    pending: localStorage.getItem('skillpilot_teacher_pending_supervision_v1'),
    coursePlans: JSON.parse(localStorage.getItem('skillpilot_teacher_course_plans_v1') ?? '{}'),
  }))
  assert.deepEqual(
    browserState.classes.map((item: { id: string }) => item.id),
    [classId, secondClassId],
  )
  assert.equal(browserState.workspace, null)
  assert.equal(browserState.pending, null)
  assert.deepEqual(Object.keys(browserState.coursePlans.plansByClassId), [mathCoursePlanId])

  await page.getByText('Direkte Einzelbetreuung', { exact: true }).click()
  await page.getByText('Diese Lehreransicht liest Lernstand und Personalisierung.', { exact: false }).waitFor()
  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByText('Zweite Einzelbetreuung', { exact: true }).click()
  await page.getByText('Diese Lehreransicht liest Lernstand und Personalisierung.', { exact: false }).waitFor()
  await page.waitForFunction(({ storedClassId, expectedConfig }) => {
    const classes = JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]') as Array<{
      id: string
      personalConfig?: unknown
    }>
    return JSON.stringify(classes.find((item) => item.id === storedClassId)?.personalConfig)
      === JSON.stringify(expectedConfig)
  }, { storedClassId: secondClassId, expectedConfig: secondRefreshedPersonalConfig })
  assert.equal(
    await page.getByLabel('Fachansicht').locator('option:checked').textContent(),
    'Chemie',
    'switching between existing-learner courses must use the newly opened course root closure',
  )
  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByText('Zweite Einzelbetreuung', { exact: true })
    .locator('xpath=../..')
    .getByTitle('Klasse löschen')
    .click()
  await page.getByRole('heading', { name: 'Klasse löschen', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Löschen', exact: true }).click()
  await page.getByText('Zweite Einzelbetreuung', { exact: true }).waitFor({ state: 'detached' })
  await page.getByText('Direkte Einzelbetreuung', { exact: true }).click()
  await page.getByText('Diese Lehreransicht liest Lernstand und Personalisierung.', { exact: false }).waitFor()
  await page.getByRole('button', { name: 'Planung', exact: true }).click()
  await page.getByRole('heading', { name: 'Planabschnitte', exact: true }).waitFor()
  assert.equal(await page.getByRole('button', { name: 'Plan bearbeiten', exact: true }).getAttribute('aria-current'), 'page')
  await page.getByRole('button', { name: 'Unterricht & Verlauf', exact: true }).click()
  await page.getByText('53 offene von 259 atomaren Zielen verplant', { exact: true }).waitFor()
  const roundedDueValues = page.getByText('6 von 53 fällig', { exact: true })
  await roundedDueValues.first().waitFor()
  assert.equal(await roundedDueValues.count(), 2)
  await page.getByText('Wochenkontingent: 29,4 Ziele/Woche', { exact: true }).waitFor()
  assert.equal(await page.getByText(/29\.444444/u).count(), 0)

  const storedDirectPlan = await page.evaluate((storageId) => {
    const store = JSON.parse(localStorage.getItem('skillpilot_teacher_course_plans_v1') ?? '{}')
    return store.plansByClassId?.[storageId]
  }, mathCoursePlanId)
  assert.equal(storedDirectPlan.planningBaseline.totalAtomicGoalCount, 259)
  assert.equal(storedDirectPlan.planningBaseline.masteredAtomicGoalCount, 206)
  assert.equal(storedDirectPlan.planningBaseline.openAtomicGoalIds.length, 53)
  assert.equal(storedDirectPlan.planningBaseline.source, 'learner-planning-landscape-v1')
  assert.equal('focusGoalIds' in storedDirectPlan.planningBaseline, false)
  assert.equal(storedDirectPlan.revision, 2)
  assert.equal(storedDirectPlan.revisionHistory.length, 1)
  assert.equal(storedDirectPlan.coverageAttestations[0].planRevision, 1)
  assert.equal(JSON.stringify(storedDirectPlan).includes(learnerId), false)

  await page.locator('summary[aria-label="Weitere Aktionen"]').click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Plan exportieren', exact: true }).click()
  const exportedPlan = await readDownload(await downloadPromise)
  assert.equal(exportedPlan.includes('planningBaseline'), false)
  assert.equal(exportedPlan.includes('openAtomicGoalIds'), false)
  assert.equal(exportedPlan.includes(learnerId), false)
  const parsedExport = JSON.parse(exportedPlan)
  assert.equal(parsedExport.semantics.learnerDerivedPlanningBaselineIncluded, false)
  assert.equal(parsedExport.semantics.teacherEnteredFreeTextExportedUnchanged, true)
  assert.equal('learnerDataIncluded' in parsedExport.semantics, false)

  const planningScopeCacheModes = await page.evaluate((pathname) => {
    const trackedWindow = window as typeof window & {
      __existingLearnerFetches?: Array<{ url: string; cache?: RequestCache }>
    }
    return (trackedWindow.__existingLearnerFetches ?? [])
      .filter((request) => new URL(request.url, location.href).pathname === pathname)
      .map((request) => request.cache)
  }, `/api/ui/learners/${learnerId}/planning-scope`)
  assert.ok(
    planningScopeCacheModes.length > 0
      && planningScopeCacheModes.every((cache) => cache === 'no-store'),
    'planning-scope reads must bypass browser caches',
  )

  await page.getByRole('button', { name: 'Lernziele', exact: true }).click()
  await page.waitForURL((url) => !url.searchParams.has('view'))
  const subjectSelect = page.getByLabel('Fachansicht')
  await subjectSelect.waitFor({ state: 'visible' })
  assert.deepEqual(await subjectSelect.locator('option').allTextContents(), ['Mathematik', 'Physik'])
  await subjectSelect.selectOption('physics')
  await page.getByRole('heading', { name: 'Physik-Ziel', exact: true }).waitFor()

  assert.equal(requests.some((request) => request.pathname.endsWith('/planned')), false)
  assert.equal(requests.some((request) => request.pathname.includes('teacher-supervision')), false)
  assert.equal(requests.some((request) => request.method !== 'GET'), false)
  const masteryCacheModes = await page.evaluate((pathname) => {
    const trackedWindow = window as typeof window & {
      __existingLearnerFetches?: Array<{ url: string; cache?: RequestCache }>
    }
    return (trackedWindow.__existingLearnerFetches ?? [])
      .filter((request) => new URL(request.url, location.href).pathname === pathname)
      .map((request) => request.cache)
  }, `/api/ui/learners/${learnerId}/mastery`)
  assert.ok(
    masteryCacheModes.length > 0 && masteryCacheModes.every((cache) => cache === 'no-store'),
    'direct-ID mastery reads must bypass browser caches',
  )
  assert.equal(browserErrors.length, 0, `browser errors:\n${browserErrors.join('\n')}`)

  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  delayNextProfileRequest = true
  await page.getByText('Direkte Einzelbetreuung', { exact: true }).click()
  await delayedProfileRequested
  await page.getByRole('button', { name: /Alle Klassen/u }).click()
  await page.getByTitle('Klasse löschen').click()
  await page.getByRole('heading', { name: 'Klasse löschen', exact: true }).waitFor()
  await page.getByRole('button', { name: 'Löschen', exact: true }).click()
  await page.getByText('Noch keine Klassen angelegt. Starte jetzt!', { exact: true }).waitFor()

  releaseDelayedProfileResponse?.()
  await page.waitForTimeout(100)
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]')),
    [],
    'a late profile response must never resurrect a deleted direct-ID class',
  )
  assert.equal(await page.getByText('Direkte Einzelbetreuung', { exact: true }).count(), 0)

  await context.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('existing learner trainer UI tests passed')
