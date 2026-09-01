import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const learnerId = '11111111-2222-4333-8444-555555555555'
const directClassId = 'existing-learner-disabled'
const legacyClassId = 'retired-server-linked-class'
const generatedClassId = 'ordinary-local-class'
const personalConfig = {
  root: { selected: true, filterId: 'DE-HE', stage: 'sek2' },
  math: { selected: true, filterId: 'LK' },
}

const goal = {
  id: 'math-root',
  title: 'Mathematik-Ziel',
  description: 'Die lernende Person kann das Testziel erklären.',
  core: true,
  weight: 1,
  tags: ['root', 'LK'],
  dimensionTags: {
    framework: 'existing-learner-disabled-test',
    demandLevel: 'AB1',
    processCompetencies: [],
    guidingIdeas: [],
    phase: 'GLOBAL',
    area: 'Test',
  },
  requires: [],
  contains: [],
  examples: [],
}
const landscapes = [
  {
    landscapeId: 'root',
    locale: 'de-DE',
    subject: 'Gymnasium',
    title: 'Gymnasium',
    description: 'Test root',
    filters: [{ id: 'DE-HE', label: 'Hessen' }],
    goals: [{ ...goal, id: 'school-root', title: 'Gymnasium', contains: ['math-root'] }],
  },
  {
    landscapeId: 'math',
    locale: 'de-DE',
    subject: 'Mathematik',
    title: 'Mathematik',
    description: 'Mathematik test',
    filters: [{ id: 'LK', label: 'Leistungskurs' }],
    goals: [goal],
  },
]

const directClass = {
  id: directClassId,
  name: 'Nicht verfügbare Direkt-ID-Karte',
  landscapeId: 'math',
  activeFilter: 'DE-HE',
  rootLandscapeId: 'root',
  personalConfig,
  students: [{ id: learnerId, name: 'Alex', accessMode: 'learner-id' }],
  source: 'existing-learner',
}

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/existingLearnerTrainerUi.html',
  {
    plugins: [{
      name: 'existing-learner-linking-disabled',
      config: () => ({
        define: {
          'import.meta.env.VITE_EXISTING_LEARNER_LINKING_ENABLED': JSON.stringify('false'),
        },
      }),
    }],
  },
)

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-background-networking', '--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const context = await browser.newContext({ locale: 'de-DE', timezoneId: 'Europe/Berlin' })
  await context.addInitScript((seed) => {
    localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_terms_accepted_version', '1.0.0')
    localStorage.setItem('skillpilot_role', 'trainer')
    localStorage.setItem('skillpilot_trainer_landscape', 'math')
    localStorage.setItem('skillpilot_teacher_workspace_v1', 'retired-secret')
    localStorage.setItem('skillpilot_teacher_pending_supervision_v1', 'retired-pending')
    localStorage.setItem('skillpilot_active_class', seed.directClassId)
    localStorage.setItem('skillpilot_classes', JSON.stringify([
      seed.directClass,
      {
        id: seed.legacyClassId,
        name: 'Alte Serverkarte',
        landscapeId: 'math',
        activeFilter: 'LK',
        students: [{ id: 'membership-id', name: 'Alt', accessMode: 'teacher-membership' }],
        source: 'linked-supervision',
      },
      {
        id: seed.generatedClassId,
        name: 'Reguläre lokale Klasse',
        landscapeId: 'math',
        activeFilter: 'DE-HE',
        rootLandscapeId: 'root',
        personalConfig: seed.personalConfig,
        students: [{ id: 'generated-learner', name: 'Neu' }],
        source: 'local-generated',
      },
    ]))
    localStorage.setItem('skillpilot_teacher_course_plans_v1', JSON.stringify({
      schemaVersion: 1,
      plansByClassId: {
        [seed.directClassId]: { classId: seed.directClassId },
        [`${seed.directClassId}:math`]: { classId: `${seed.directClassId}:math` },
        [seed.legacyClassId]: { classId: seed.legacyClassId },
        [seed.generatedClassId]: { classId: seed.generatedClassId },
      },
    }))
  }, { directClassId, directClass, legacyClassId, generatedClassId, personalConfig })

  const page = await context.newPage()
  const requests: Array<{ pathname: string; method: string }> = []
  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname
    requests.push({ pathname, method: request.method() })
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
    if (pathname === '/api/ui/landscapes/math/closure') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(landscapes),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/existingLearnerTrainerUi.html`)
  await page.getByRole('heading', { name: 'Kursorganisation', exact: true }).waitFor()
  await page.getByText('Reguläre lokale Klasse', { exact: true }).waitFor()
  assert.equal(await page.getByText('Nicht verfügbare Direkt-ID-Karte', { exact: true }).count(), 0)
  assert.equal(await page.getByText('Alte Serverkarte', { exact: true }).count(), 0)

  const browserState = await page.evaluate(() => ({
    classes: JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]'),
    activeClass: localStorage.getItem('skillpilot_active_class'),
    workspace: localStorage.getItem('skillpilot_teacher_workspace_v1'),
    pending: localStorage.getItem('skillpilot_teacher_pending_supervision_v1'),
    coursePlans: JSON.parse(localStorage.getItem('skillpilot_teacher_course_plans_v1') ?? '{}'),
  }))
  assert.deepEqual(browserState.classes.map((item: { id: string }) => item.id), [generatedClassId])
  assert.equal(browserState.activeClass, null)
  assert.equal(browserState.workspace, null)
  assert.equal(browserState.pending, null)
  assert.deepEqual(Object.keys(browserState.coursePlans.plansByClassId), [generatedClassId])

  await page.locator('input[type="file"]').setInputFiles({
    name: 'direct-id.skillpilot.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(directClass), 'utf8'),
  })
  await page.getByText('Direkt verknüpfte SkillPilot-IDs sind in dieser Ausgabe nicht verfügbar.', { exact: false }).waitFor()
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(localStorage.getItem('skillpilot_classes') ?? '[]')
      .map((item: { id: string }) => item.id)),
    [generatedClassId],
  )
  assert.equal(
    requests.some((request) => request.pathname.includes(`/learners/${learnerId}`)),
    false,
    'disabled existing-learner cards never issue learner requests',
  )

  await context.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('disabled existing learner UI tests passed')
