import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'

import { chromium, type Browser } from 'playwright'

import { startViteTestServer } from './viteTestServer'

const appRoot = fileURLToPath(new URL('../', import.meta.url))
process.env.VITE_TEACHER_SUPERVISION_ENABLED = 'true'

const server = await startViteTestServer(
  appRoot,
  'scripts/fixtures/teacherSupervisionConsentUi.html',
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
  const requests: Array<{ pathname: string; method: string; body: unknown }> = []
  let revoked = false

  await page.route('**/api/ui/teacher-supervision/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const body = request.postDataJSON?.() ?? null
    requests.push({ pathname: url.pathname, method: request.method(), body })
    if (url.pathname.endsWith('/invitations/preview')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          courseLabel: 'SkillPilot-Einzelbetreuung',
          teacherDisplayName: 'Frau Beispiel',
          status: 'PENDING',
          requestedCapabilities: ['PERSONAL_CURRICULUM_READ', 'MASTERY_READ'],
        }),
      })
      return
    }
    if (url.pathname.endsWith('/invitations/accept')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ memberId: 'member-1', status: 'ACTIVE' }),
      })
      return
    }
    if (url.pathname.endsWith('/learner-memberships/list') && request.method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          memberships: revoked ? [] : [{
            memberId: 'member-1',
            courseLabel: 'SkillPilot-Einzelbetreuung',
            teacherDisplayName: 'Frau Beispiel',
            status: 'ACTIVE',
          }],
        }),
      })
      return
    }
    if (url.pathname.endsWith('/learner-memberships/revoke') && request.method() === 'POST') {
      revoked = true
      await route.fulfill({ status: 204, body: '' })
      return
    }
    await route.fulfill({ status: 404, body: '' })
  })

  await page.goto(`${server.baseUrl}/scripts/fixtures/teacherSupervisionConsentUi.html`)
  await page.getByRole('heading', { name: 'Betreuung freigeben' }).waitFor()
  assert.equal(new URL(page.url()).hash, '', 'the invitation token is removed from the browser URL immediately')
  assert.equal(
    await page.getByText('Die anfragende Person nennt sich', { exact: true }).count(),
    1,
    'the free-form teacher label is presented as an unverified self-description',
  )
  assert.equal(await page.getByText(/Bestätige nur, wenn du diese Anfrage erwartest/u).count(), 1)

  const skillpilotId = '11111111-2222-4333-8444-555555555555'
  await page.getByLabel('Deine SkillPilot-ID').fill(skillpilotId)
  await page.getByLabel(/Ich erwarte diese Anfrage/u).check()
  await page.getByRole('button', { name: 'Freigeben', exact: true }).click()
  await page.getByRole('heading', { name: 'Betreuung freigegeben' }).waitFor()

  const previewRequest = requests.find((request) => request.pathname.endsWith('/invitations/preview'))
  const acceptRequest = requests.find((request) => request.pathname.endsWith('/invitations/accept'))
  assert.deepEqual(previewRequest?.body, { invitationToken: 'spti_browser_secret' })
  assert.deepEqual(acceptRequest?.body, {
    invitationToken: 'spti_browser_secret',
    skillpilotId,
    acknowledged: true,
  })
  assert.equal(
    requests.some((request) => request.pathname.includes('spti_browser_secret')),
    false,
    'the invitation token is never placed in an HTTP path',
  )

  await page.getByRole('button', { name: 'Freigaben anzeigen' }).click()
  await page.getByText('SkillPilot-Einzelbetreuung', { exact: true }).waitFor()
  await page.getByText('Aktiv', { exact: true }).waitFor()
  page.once('dialog', async (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Widerrufen' }).click()
  await page.getByText(/keine aktiven Betreuungsfreigaben/u).waitFor()
  assert.equal(revoked, true, 'the learner can explicitly revoke the membership')
  const listRequest = requests.find((request) => request.pathname.endsWith('/learner-memberships/list'))
  const revokeRequest = requests.find((request) => request.pathname.endsWith('/learner-memberships/revoke'))
  assert.deepEqual(listRequest?.body, { skillpilotId })
  assert.deepEqual(revokeRequest?.body, { skillpilotId, memberId: 'member-1' })
  assert.equal(
    requests.some((request) => request.pathname.includes(skillpilotId)),
    false,
    'the learner access key stays out of all supervision URLs',
  )

  console.log('teacher supervision consent UI regression test passed')
} finally {
  delete process.env.VITE_TEACHER_SUPERVISION_ENABLED
  await browser?.close()
  await server.close()
}
