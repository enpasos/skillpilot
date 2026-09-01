import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
const learnerId = '11111111-2222-4333-8444-555555555555'
const personalCurriculum = {
  'gymnasium-root': { selected: true, filterId: 'DE-HE', stage: 'sek2' },
  math: { selected: true, filterId: 'LK' },
  physics: { selected: true, filterId: 'LK' },
}

const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/existingLearnerClassSetupUi.html',
)

let browser: Browser | null = null
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--disable-dev-shm-usage', '--disable-gpu', '--no-sandbox'],
  })
  const context = await browser.newContext({ locale: 'de-DE' })
  await context.addInitScript(() => localStorage.setItem('skillpilot_lang', 'de'))
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
    if (pathname === `/api/ui/learners/${learnerId}`) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          skillpilotId: learnerId,
          personalCurriculum: JSON.stringify({ personalCurriculum }),
        }),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/existingLearnerClassSetupUi.html`)
  await page.getByRole('heading', { name: 'Neue Klasse / Kurs anlegen' }).waitFor()
  await page.getByText('Bestehende SkillPilot-ID lokal hinzufügen', { exact: true }).click()

  assert.equal(await page.getByText('So erkennt dich die lernende Person').count(), 0)
  assert.equal(await page.getByText('Bezeichnung in der Einladung').count(), 0)
  assert.equal(await page.getByText('Einladung').count(), 0)
  assert.equal(
    await page.getByText(/passwortverschlüsselte/u).count(),
    2,
    'setup copy discloses the deliberate encrypted-export exception for alias and ID',
  )
  await page.getByLabel('Bezeichnung', { exact: true }).fill('Einzelbetreuung')
  await page.getByLabel('Name in deiner Ansicht').fill('Alex')
  await page.getByLabel('Vorhandene SkillPilot-ID').fill(learnerId)
  await page.getByRole('button', { name: 'Klasse lokal anlegen' }).click()

  const savedText = await page.getByTestId('saved-existing-learner-session').textContent()
  assert(savedText)
  const saved = JSON.parse(savedText)
  assert.equal(saved.source, 'existing-learner')
  assert.equal(saved.landscapeId, 'math')
  assert.deepEqual(saved.personalConfig, personalCurriculum)
  assert.deepEqual(saved.students, [{
    id: learnerId,
    name: 'Alex',
    accessMode: 'learner-id',
  }])
  assert.equal(
    requests.filter((request) => request.pathname === `/api/ui/learners/${learnerId}`).length,
    1,
    'the learner profile is read exactly once during creation',
  )
  assert.equal(
    requests.some((request) => request.pathname.includes('teacher-supervision')),
    false,
    'direct local linking never calls the retired supervision API',
  )
  assert.equal(
    requests.some((request) => request.method !== 'GET'),
    false,
    'creating the local card does not write server state',
  )

  await context.close()
} finally {
  try {
    await browser?.close()
  } finally {
    await server.close()
  }
}

console.log('existing learner class setup UI tests passed')
