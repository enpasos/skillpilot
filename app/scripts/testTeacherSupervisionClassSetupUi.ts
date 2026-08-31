import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'
import {
  TEACHER_PENDING_SUPERVISION_STORAGE_KEY,
  TEACHER_WORKSPACE_STORAGE_KEY,
} from '../src/utils/teacherSupervision'

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
  let membershipStatus = 'PENDING'
  let deleteCourseStatus = 204

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
      if (request.headers().authorization === 'Bearer sptw_stale_secret') {
        await route.fulfill({ status: 401, body: '' })
        return
      }
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
    if (url.pathname.endsWith('/courses/course-1') && request.method() === 'DELETE') {
      await route.fulfill({ status: deleteCourseStatus, body: '' })
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
            status: membershipStatus,
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
  await page.getByRole('button', { name: '+ Neue Klasse' }).click()
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

  const pendingBeforeReload = await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
  assert(pendingBeforeReload)
  assert.equal(pendingBeforeReload.includes(permanentId), false, 'reload state never persists the permanent learner ID')
  assert.equal(pendingBeforeReload.includes('sptw_browser_secret'), false, 'reload state never persists the workspace token')
  assert.deepEqual(JSON.parse(pendingBeforeReload), {
    version: 1,
    kind: 'invitation',
    workspaceId: 'workspace-1',
    courseId: 'course-1',
    memberId: 'member-1',
    invitationUrl: `${server.baseUrl}/betreuung#invite=spti_browser_secret`,
    className: 'Lokale Betreuung Alex',
    learnerAlias: 'Alex',
  })

  const creationRequestCount = requests.filter((request) => (
    request.method === 'POST'
    && (
      request.pathname.endsWith('/workspaces')
      || request.pathname.endsWith('/courses')
      || request.pathname.endsWith('/invitations')
    )
  )).length
  await page.reload()
  await page.getByRole('heading', { name: 'Bestätigung über den Einladungslink' }).waitFor()
  assert.equal(await page.getByLabel('Persönlicher Einladungslink').inputValue(), `${server.baseUrl}/betreuung#invite=spti_browser_secret`)
  assert.equal(await page.getByText('Warte auf die Bestätigung …', { exact: true }).count(), 1)
  assert.equal(
    requests.filter((request) => (
      request.method === 'POST'
      && (
        request.pathname.endsWith('/workspaces')
        || request.pathname.endsWith('/courses')
        || request.pathname.endsWith('/invitations')
      )
    )).length,
    creationRequestCount,
    'restoring the dialog never creates another workspace, course, or invitation',
  )

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

  membershipStatus = 'ACTIVE'
  await page.evaluate(() => sessionStorage.setItem('teacher-supervision-fixture-reject-save', 'true'))
  await page.getByRole('button', { name: 'Jetzt prüfen' }).click()
  await page.getByText('Die Betreuung konnte nicht eingerichtet werden. Bitte versuche es später erneut.', { exact: true }).waitFor()
  assert.equal(await page.getByTestId('saved-linked-session').count(), 0, 'a rejected durable class save never completes')
  assert.notEqual(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
    null,
    'a rejected durable class save retains the resumable invitation',
  )
  await page.evaluate(() => sessionStorage.removeItem('teacher-supervision-fixture-reject-save'))
  await page.getByRole('button', { name: 'Jetzt prüfen' }).click()
  const resumedCourseRequest = requests.findLast((request) => (
    request.pathname.endsWith('/courses/course-1') && request.method === 'GET'
  ))
  assert.equal(resumedCourseRequest?.authorization, 'Bearer sptw_browser_secret')
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
  assert.equal(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
    null,
    'successful completion clears the reload state',
  )

  await page.reload()
  await page.getByRole('button', { name: '+ Neue Klasse' }).click()
  await page.getByRole('heading', { name: 'Neue Klasse / Kurs anlegen' }).waitFor()
  await page.getByText('Bestehenden Lernenden verknüpfen', { exact: true }).click()
  await page.getByLabel('Bezeichnung', { exact: true }).fill('Abbruchtest')
  await page.getByLabel('Name in deiner Ansicht').fill('Sam')
  await page.getByLabel('So erkennt dich die lernende Person').fill('Frau Beispiel')
  await page.getByLabel('Bezeichnung in der Einladung').fill('Abbruchtest')
  await page.getByLabel('Vorhandene SkillPilot-ID').fill(permanentId)
  membershipStatus = 'PENDING'
  await page.getByRole('button', { name: 'Einladung erstellen' }).click()
  await page.getByLabel('Persönlicher Einladungslink').waitFor()

  deleteCourseStatus = 503
  await page.getByRole('button', { name: 'Einladung abbrechen' }).click()
  await page.getByText('Die Einladung konnte nicht sicher geschlossen werden. Bitte versuche es erneut.', { exact: true }).first().waitFor()
  const cleanupBeforeReload = await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
  assert(cleanupBeforeReload)
  assert.deepEqual(JSON.parse(cleanupBeforeReload), {
    version: 1,
    kind: 'cleanup-required',
    workspaceId: 'workspace-1',
    courseId: 'course-1',
  })

  await page.reload()
  await page.getByText('Die Einladung konnte nicht sicher geschlossen werden. Bitte versuche es erneut.', { exact: true }).first().waitFor()
  assert.equal(await page.getByLabel('Persönlicher Einladungslink').count(), 0, 'cleanup recovery never re-exposes the invitation')
  assert.equal(await page.getByRole('button', { name: 'Jetzt prüfen' }).count(), 0, 'cleanup recovery never resumes polling')
  deleteCourseStatus = 404
  await page.getByRole('button', { name: 'Einladung abbrechen' }).click()
  assert.notEqual(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
    null,
    'an ambiguous namespace-level 404 never discards the cleanup pointer',
  )
  deleteCourseStatus = 204
  await page.getByRole('button', { name: 'Einladung abbrechen' }).click()
  await page.getByRole('button', { name: '+ Neue Klasse' }).waitFor()
  assert.equal(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
    null,
    'a confirmed cancellation clears the reload state',
  )

  await page.getByRole('button', { name: '+ Neue Klasse' }).click()
  await page.getByText('Bestehenden Lernenden verknüpfen', { exact: true }).click()
  await page.getByLabel('Bezeichnung', { exact: true }).fill('Terminaltest')
  await page.getByLabel('Name in deiner Ansicht').fill('Kim')
  await page.getByLabel('So erkennt dich die lernende Person').fill('Frau Beispiel')
  await page.getByLabel('Bezeichnung in der Einladung').fill('Terminaltest')
  await page.getByLabel('Vorhandene SkillPilot-ID').fill(permanentId)
  await page.getByRole('button', { name: 'Einladung erstellen' }).click()
  await page.getByLabel('Persönlicher Einladungslink').waitFor()
  membershipStatus = 'EXPIRED'
  await page.getByRole('button', { name: 'Jetzt prüfen' }).click()
  await page.getByText('Die Betreuung konnte nicht eingerichtet werden. Bitte versuche es später erneut.', { exact: true }).waitFor()
  const terminalCleanup = await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY)
  assert(terminalCleanup)
  assert.deepEqual(JSON.parse(terminalCleanup), {
    version: 1,
    kind: 'cleanup-required',
    workspaceId: 'workspace-1',
    courseId: 'course-1',
  })
  assert.equal(await page.getByLabel('Persönlicher Einladungslink').count(), 0, 'terminal cleanup drops the bearer link')
  assert.equal(await page.getByRole('button', { name: 'Jetzt prüfen' }).count(), 0, 'terminal cleanup stops polling')
  await page.reload()
  await page.getByText('Die Einladung konnte nicht sicher geschlossen werden. Bitte versuche es erneut.', { exact: true }).first().waitFor()
  await page.getByRole('button', { name: 'Einladung abbrechen' }).click()
  await page.getByRole('button', { name: '+ Neue Klasse' }).waitFor()
  assert.equal(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
    null,
    'terminal cleanup is removed only after the course close is confirmed',
  )

  await page.getByRole('button', { name: '+ Neue Klasse' }).click()
  await page.getByText('Bestehenden Lernenden verknüpfen', { exact: true }).click()
  await page.getByLabel('Bezeichnung', { exact: true }).fill('Credentialtest')
  await page.getByLabel('Name in deiner Ansicht').fill('Jo')
  await page.getByLabel('So erkennt dich die lernende Person').fill('Frau Beispiel')
  await page.getByLabel('Bezeichnung in der Einladung').fill('Credentialtest')
  await page.getByLabel('Vorhandene SkillPilot-ID').fill(permanentId)
  membershipStatus = 'PENDING'
  await page.getByRole('button', { name: 'Einladung erstellen' }).click()
  await page.getByLabel('Persönlicher Einladungslink').waitFor()
  await page.evaluate((workspaceKey) => localStorage.removeItem(workspaceKey), TEACHER_WORKSPACE_STORAGE_KEY)
  await page.reload()
  await page.getByText(/Der Zugriffsschlüssel für diese offene Betreuung fehlt/u).waitFor()
  const missingCredentialCleanup = await page.evaluate(
    (storageKey) => localStorage.getItem(storageKey),
    TEACHER_PENDING_SUPERVISION_STORAGE_KEY,
  )
  assert(missingCredentialCleanup)
  assert.deepEqual(JSON.parse(missingCredentialCleanup), {
    version: 1,
    kind: 'cleanup-required',
    workspaceId: 'workspace-1',
    courseId: 'course-1',
  })
  assert.equal(await page.getByLabel('Persönlicher Einladungslink').count(), 0, 'a missing credential drops the invitation bearer')
  assert.equal(await page.getByRole('button', { name: 'Jetzt prüfen' }).count(), 0, 'a missing credential never polls')
  await page.getByText(/Wenn du den lokalen Hinweis verwirfst, kann die Freigabe fortbestehen/u).waitFor()
  page.once('dialog', async (dialog) => {
    assert.match(dialog.message(), /die lernende Person kann sie selbst widerrufen/u)
    await dialog.accept()
  })
  await page.getByRole('button', { name: 'Nur lokalen Hinweis verwerfen' }).click()
  await page.getByRole('button', { name: '+ Neue Klasse' }).waitFor()
  assert.equal(
    await page.evaluate((storageKey) => localStorage.getItem(storageKey), TEACHER_PENDING_SUPERVISION_STORAGE_KEY),
    null,
    'the explicit local-only discard uses a compare-and-clear operation',
  )

  await page.evaluate(({ workspaceKey }) => {
    localStorage.setItem(workspaceKey, JSON.stringify({
      version: 1,
      credentials: [{ workspaceId: 'workspace-stale', accessToken: 'sptw_stale_secret' }],
    }))
  }, { workspaceKey: TEACHER_WORKSPACE_STORAGE_KEY })
  const recoveryRequestStart = requests.length
  await page.getByRole('button', { name: '+ Neue Klasse' }).click()
  await page.getByText('Bestehenden Lernenden verknüpfen', { exact: true }).click()
  await page.getByLabel('Bezeichnung', { exact: true }).fill('Retentiontest')
  await page.getByLabel('Name in deiner Ansicht').fill('Lee')
  await page.getByLabel('So erkennt dich die lernende Person').fill('Frau Beispiel')
  await page.getByLabel('Bezeichnung in der Einladung').fill('Retentiontest')
  await page.getByLabel('Vorhandene SkillPilot-ID').fill(permanentId)
  await page.getByRole('button', { name: 'Einladung erstellen' }).click()
  await page.getByLabel('Persönlicher Einladungslink').waitFor()
  const recoveryRequests = requests.slice(recoveryRequestStart)
  assert.equal(
    recoveryRequests.filter((request) => request.pathname.endsWith('/workspaces') && request.method === 'POST').length,
    1,
    'an expired retained credential creates exactly one replacement workspace',
  )
  assert.deepEqual(
    recoveryRequests
      .filter((request) => request.pathname.endsWith('/courses') && request.method === 'POST')
      .map((request) => request.authorization),
    ['Bearer sptw_stale_secret', 'Bearer sptw_browser_secret'],
    'course creation retries exactly once with the replacement credential',
  )
  await page.getByRole('button', { name: 'Einladung abbrechen' }).click()
  await page.getByRole('button', { name: '+ Neue Klasse' }).waitFor()

  console.log('teacher supervision class setup UI regression test passed')
} finally {
  delete process.env.VITE_TEACHER_SUPERVISION_ENABLED
  await browser?.close()
  await server.close()
}
