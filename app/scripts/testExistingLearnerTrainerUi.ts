import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const learnerId = '11111111-2222-4333-8444-555555555555'
const classId = 'existing-learner-class'
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

const goal = (id: string, title: string) => ({
  id,
  title,
  description: `Die lernende Person kann ${title.toLowerCase()} erklären.`,
  core: true,
  weight: 1,
  tags: ['root', 'LK'],
  dimensionTags: {
    framework: 'existing-learner-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Test',
  },
  requires: [],
  contains: [],
  examples: [],
})
const rootGoal = {
  ...goal('school-root', 'Gymnasium'),
  contains: ['math-root', 'physics-root'],
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
    goals: [goal('math-root', 'Mathematik-Ziel')],
  },
  {
    landscapeId: 'physics',
    locale: 'de-DE',
    subject: 'Physik',
    title: 'Physik',
    description: 'Physik test',
    filters: [{ id: 'LK', label: 'Leistungskurs' }],
    goals: [goal('physics-root', 'Physik-Ziel')],
  },
]

const appRoot = fileURLToPath(new URL('../', import.meta.url))
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
    ]))
    localStorage.setItem('skillpilot_teacher_course_plans_v1', JSON.stringify({
      schemaVersion: 1,
      plansByClassId: {
        [seed.legacyClassId]: { classId: seed.legacyClassId },
        [`${seed.legacyClassId}:math`]: { classId: `${seed.legacyClassId}:math` },
      },
    }))
  }, { learnerId, classId, legacyClassId, personalConfig })

  const page = await context.newPage()
  const requests: Array<{ pathname: string; method: string }> = []
  const browserErrors: string[] = []
  let profileRequestCount = 0
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
        body: JSON.stringify({ summaries: landscapes }),
      })
      return
    }
    if (/^\/api\/ui\/landscapes\/(?:math|physics)\/closure$/u.test(pathname)) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(landscapes) })
      return
    }
    if (pathname === `/api/ui/learners/${learnerId}`) {
      profileRequestCount += 1
      if (profileRequestCount === 2) {
        markDelayedProfileRequested?.()
        await delayedProfileResponse
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          skillpilotId: learnerId,
          personalCurriculum: JSON.stringify(
            profileRequestCount === 2 ? refreshedPersonalConfig : personalConfig,
          ),
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
  assert.deepEqual(browserState.classes.map((item: { id: string }) => item.id), [classId])
  assert.equal(browserState.workspace, null)
  assert.equal(browserState.pending, null)
  assert.deepEqual(browserState.coursePlans.plansByClassId, {})

  await page.getByText('Direkte Einzelbetreuung', { exact: true }).click()
  await page.getByText('Diese Lehreransicht liest Lernstand und Personalisierung.', { exact: false }).waitFor()
  const subjectSelect = page.getByLabel('Fachansicht')
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
