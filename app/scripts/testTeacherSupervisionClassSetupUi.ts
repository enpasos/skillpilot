import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
process.env.VITE_TEACHER_SUPERVISION_ENABLED = 'true'

const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/teacherSupervisionClassSetupUi.html',
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
  const requests: Array<{ pathname: string; method: string; body: unknown; authorization: string | null }> = []
  let membershipActive = false

  await page.route('**/api/ui/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.pathname === '/api/ui/curriculum-catalog') {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    if (!url.pathname.startsWith('/api/ui/teacher-supervision/v1/')) {
      await route.fulfill({ status: 404, body: '' })
      return
    }
    requests.push({
      pathname: url.pathname,
      method: request.method(),
      body: request.postDataJSON?.() ?? null,
      authorization: request.headers().authorization ?? null,
    })
    if (url.pathname.endsWith('/workspaces')) {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ workspaceId: 'workspace-1', accessToken: 'sptw_browser_secret' }),
      })
      return
    }
    if (url.pathname.endsWith('/courses') && request.method() === 'POST') {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ courseId: 'course-1', courseLabel: 'SkillPilot-Einzelbetreuung' }),
      })
      return
    }
    if (url.pathname.endsWith('/invitations')) {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          invitationId: 'invitation-1',
          memberId: 'member-1',
          invitationUrl: '/betreuung#invite=spti_browser_secret',
          status: 'PENDING',
        }),
      })
      return
    }
    if (url.pathname.endsWith('/courses/course-1') && request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          courseId: 'course-1',
          courseLabel: 'SkillPilot-Einzelbetreuung',
          members: [{
            memberId: 'member-1',
            status: membershipActive ? 'ACTIVE' : 'PENDING',
            personalizationFingerprint: 'sha256:browser-projection',
            rootLandscapeId: 'gymnasium-root',
            scope: { jurisdiction: 'DE-HE', durationModel: 'G9', stage: 'SekII' },
            subjects: [
              { landscapeId: 'math', title: 'Mathematik', filterId: 'LK' },
              { landscapeId: 'physics', title: 'Physik', filterId: 'LK' },
            ],
          }],
        }),
      })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/teacherSupervisionClassSetupUi.html`)
  await page.getByRole('heading', { name: 'Neue Klasse / Kurs anlegen' }).waitFor()
  await page.getByText('Bestehenden Lernenden verknüpfen', { exact: true }).click()
  await page.getByLabel('Bezeichnung', { exact: true }).fill('Lokale Betreuung Alex')
  await page.getByLabel('Name in deiner Ansicht').fill('Alex')
  await page.getByLabel('So erkennt dich die lernende Person').fill('Frau Beispiel')
  await page.getByLabel('Bezeichnung in der Einladung').fill('SkillPilot-Einzelbetreuung')
  const permanentId = '11111111-2222-4333-8444-555555555555'
  await page.getByLabel('Vorhandene SkillPilot-ID').fill(permanentId)
  await page.getByRole('button', { name: 'Einladung erstellen' }).click()

  const invitationInput = page.getByLabel('Persönlicher Einladungslink')
  await invitationInput.waitFor()
  assert.equal(await invitationInput.inputValue(), `${server.baseUrl}/betreuung#invite=spti_browser_secret`)
  assert.equal(await page.getByText('Warte auf die Bestätigung …', { exact: true }).count(), 1)

  const workspaceRequest = requests.find((request) => request.pathname.endsWith('/workspaces'))
  const courseRequest = requests.find((request) => request.pathname.endsWith('/courses'))
  const invitationRequest = requests.find((request) => request.pathname.endsWith('/invitations'))
  assert.deepEqual(workspaceRequest?.body, {})
  assert.deepEqual(courseRequest?.body, {
    courseLabel: 'SkillPilot-Einzelbetreuung',
    teacherDisplayName: 'Frau Beispiel',
  })
  assert.equal(JSON.stringify(courseRequest?.body).includes('Alex'), false, 'local aliases never enter the server course')
  assert.deepEqual(invitationRequest?.body, { skillpilotId: permanentId })
  assert.equal(courseRequest?.authorization, 'Bearer sptw_browser_secret')

  membershipActive = true
  await page.getByRole('button', { name: 'Jetzt prüfen' }).click()
  const savedText = await page.getByTestId('saved-linked-session').textContent()
  assert(savedText)
  const saved = JSON.parse(savedText)
  assert.equal(saved.source, 'linked-supervision')
  assert.deepEqual(saved.students, [{ id: 'member-1', name: 'Alex', accessMode: 'teacher-membership' }])
  assert.deepEqual(saved.linkedSupervision.subjects.map((subject: { title: string }) => subject.title), ['Mathematik', 'Physik'])
  assert.equal(savedText.includes(permanentId), false, 'the permanent SkillPilot ID is not persisted in the class card')
  assert.equal(savedText.includes('sptw_browser_secret'), false, 'the workspace capability is stored outside ClassSession')
  assert.equal(
    requests.some((request) => request.pathname.includes(permanentId)),
    false,
    'the permanent learner ID is never placed in an HTTP URL',
  )

  console.log('teacher supervision class setup UI regression test passed')
} finally {
  delete process.env.VITE_TEACHER_SUPERVISION_ENABLED
  await browser?.close()
  await server.close()
}
