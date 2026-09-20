import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { chromium } from 'playwright'
import { startViteTestServer } from './viteTestServer'
import { CANONICAL_GYMNASIUM_ROOT_ID } from '../src/utils/curriculumDisplay'
import type { ChampionTrial } from '../src/components/CurriculumChampionTrialControls'
import type { CurriculumQualityStatus } from '../src/utils/curriculumQualityPresentation'

const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)), 'scripts/fixtures/curriculaQualityLayoutUi.html', { plugins: [tailwindcss()] })
const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage', '--no-sandbox'] })
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } })
  page.setDefaultTimeout(10000)
  await page.addInitScript(() => {
    if (!localStorage.getItem('skillpilot_lang')) localStorage.setItem('skillpilot_lang', 'de')
    localStorage.setItem('skillpilot_theme', 'light')
  })
  const trial: ChampionTrial = {
    state: 'not_started', scopeLabel: 'Physik: gesamter ausgewiesener Umfang', scopeCoverage: 'full',
    requiredGoals: 2, practicedGoals: 0, blockingFindings: 0, findingsAvailable: true, canStart: true, canComplete: false,
  }
  const champion = { id: 'fixture-champion', curriculumId: CANONICAL_GYMNASIUM_ROOT_ID, topicId: 'fixture-physics', topicTitle: 'Physik',
    githubId: 'fixture', skillpilotIdMasked: '***', masteredCount: 0, totalTopicGoals: 2, issuesCount: 0, pullRequestsCount: 0, trial }
  let qualityStatus: CurriculumQualityStatus = 'machine_qa'
  let ownerStatus = 401
  let trialStatus = 200
  let oauthRequests = 0
  let ownerReads = 0
  const fixtureUrl = `${server.baseUrl}/scripts/fixtures/curriculaQualityLayoutUi.html`
  const writes: Array<{ action: string; confirmed?: boolean }> = []
  await page.route('**/api/ui/curricula/champions/me', (route) => {
    ownerReads++
    return route.fulfill({ status: ownerStatus, json: ownerStatus === 200 ? [champion] : {} })
  })
  // Exercise the existing OAuth entry and a fresh page load after a simulated
  // successful return; no real account, credentials or backend writes are used.
  await page.route('**/oauth2/authorization/github', (route) => {
    oauthRequests++
    ownerStatus = 200
    return route.fulfill({ status: 302, headers: { location: fixtureUrl } })
  })
  await page.route('**/api/ui/curricula/*/topics', (route) => route.fulfill({ json: [] }))
  await page.route('**/api/ui/curricula', (route) => route.fulfill({ json: {
    defaultCurriculumId: CANONICAL_GYMNASIUM_ROOT_ID, lastUpdatedAt: '2026-09-22T00:00:00Z', curricula: [{
      curriculumId: CANONICAL_GYMNASIUM_ROOT_ID, title: 'Gymnasium (DE)', subject: '', totalAtomicGoals: champion.totalTopicGoals, totalMastered: champion.masteredCount,
      qualityStatus: null, humanTrialSubjectCount: qualityStatus.startsWith('human_') ? 1 : 0,
      topLevelTopics: ['Physik'], champions: [champion], subjectQuality: [{
        landscapeId: 'fixture-physics', subject: 'Physik', maturity: 'M7', qualityStatus,
        goals: champion.totalTopicGoals, atomicGoals: champion.totalTopicGoals, warnings: 0, failures: 0,
      }],
    }],
  } }))
  await page.route('**/api/ui/curricula/champions/fixture-champion/trial', (route) => {
    assert.equal(route.request().method(), 'POST')
    const request = route.request().postDataJSON() as { action: string; confirmed?: boolean }
    writes.push(request)
    if (trialStatus !== 200) return route.fulfill({ status: trialStatus, json: {} })
    if (request.action === 'complete' && request.confirmed !== true) return route.fulfill({ status: 400, json: {} })
    trial.state = request.action === 'pause' ? 'paused' : request.action === 'complete' ? 'completed' : 'in_progress'
    trial.practicedGoals = 2
    champion.masteredCount = 2
    trial.canStart = false; trial.canComplete = trial.state === 'in_progress'
    qualityStatus = trial.state === 'completed' ? 'human_trial_completed' : trial.state === 'in_progress' ? 'human_trial_in_progress' : 'machine_qa'
    return route.fulfill({ json: champion })
  })
  await page.goto(fixtureUrl)
  const ownerArea = page.getByRole('region', { name: 'Deine menschliche QS', exact: true })
  const controls = page.getByRole('region', { name: 'Deine Curriculum-Erprobung', exact: true })
  const subjectRow = page.getByTestId('curriculum-quality-row').filter({ hasText: 'Physik' })
  await ownerArea.getByRole('button', { name: 'Mit GitHub verbinden', exact: true }).waitFor()
  assert.equal(await page.locator('form').count(), 0, 'existing champions can reconnect without opening registration')
  assert.equal(await controls.count(), 0, 'public champion rows must not expose owner actions')
  assert.equal(await ownerArea.getByRole('alert').count(), 0, '401 means signed out, not a server failure')
  await subjectRow.getByText('M7', { exact: true }).waitFor()
  await subjectRow.getByText('Maschinelle QS', { exact: true }).waitFor()
  assert.equal(writes.length, 0, 'M7 and publicly registered champions do not start human QA')
  await ownerArea.getByRole('button', { name: 'Mit GitHub verbinden', exact: true }).click()
  await controls.getByRole('button', { name: 'Erprobung beginnen', exact: true }).waitFor()
  assert.equal(oauthRequests, 1, 'the visible reconnect action uses the existing GitHub OAuth entry')
  assert.equal(writes.length, 0, 'registration and loading without learning activity never start a trial')
  assert.equal(await controls.getByRole('button', { name: 'Erprobung abschließen…', exact: true }).count(), 0)
  assert.equal(await subjectRow.locator('.lucide-badge-check').count(), 0, 'M7 without human learning activity does not grant a seal')
  await controls.getByRole('button', { name: 'Erprobung beginnen', exact: true }).click()
  await controls.getByRole('button', { name: 'Erprobung pausieren', exact: true }).waitFor()
  await subjectRow.getByText('Menschliche QS läuft', { exact: true }).waitFor()
  await subjectRow.getByText('M7', { exact: true }).waitFor()
  await page.getByText('Menschliche QS in 1 Fächern', { exact: true }).waitFor()
  await page.reload()
  await controls.getByRole('button', { name: 'Erprobung pausieren', exact: true }).waitFor()
  await subjectRow.getByText('Menschliche QS läuft', { exact: true }).waitFor()
  await subjectRow.getByText('M7', { exact: true }).waitFor()
  assert.equal(writes.length, 1, 'reloading preserves the recorded start without another write')
  await controls.getByRole('button', { name: 'Erprobung pausieren', exact: true }).click()
  await controls.getByRole('button', { name: 'Erprobung fortsetzen', exact: true }).waitFor()
  await subjectRow.getByText('Maschinelle QS', { exact: true }).waitFor()
  await controls.getByRole('button', { name: 'Erprobung fortsetzen', exact: true }).click()
  await controls.getByRole('button', { name: 'Erprobung abschließen…', exact: true }).waitFor()
  await controls.getByRole('button', { name: 'Erprobung abschließen…', exact: true }).click()
  const confirmation = controls.getByRole('group', { name: 'Erprobungsabschluss bestätigen', exact: true })
  await confirmation.waitFor()
  assert(!writes.some((write) => write.action === 'complete'), 'opening confirmation does not complete')
  await confirmation.getByRole('button', { name: 'Abbrechen', exact: true }).click()
  assert(!writes.some((write) => write.action === 'complete'), 'cancelling changes no completion')
  await controls.getByRole('button', { name: 'Erprobung abschließen…', exact: true }).click()
  await controls.getByRole('button', { name: 'Abschluss bestätigen', exact: true }).click()
  await controls.getByText('Menschlich erprobt', { exact: true }).waitFor()
  await subjectRow.getByText('Menschlich erprobt', { exact: true }).waitFor()
  assert.deepEqual(writes, [{ action: 'start' }, { action: 'pause' }, { action: 'resume' }, { action: 'complete', confirmed: true }])

  // Complete practical coverage cannot stand in for an unavailable findings review.
  trial.state = 'in_progress'
  trial.findingsAvailable = false
  trial.canComplete = false
  qualityStatus = 'human_trial_in_progress'
  await page.reload()
  await controls.getByText('Der aktuelle Befundstand ist nicht verfügbar. Der Abschluss kann noch nicht bestätigt werden.', { exact: true }).waitFor()
  assert(await controls.getByText('Inhaltsgebundene Praxisnachweise: 2 / 2', { exact: true }).isVisible())
  assert.equal(await controls.getByRole('button', { name: 'Erprobung abschließen…', exact: true }).count(), 0,
    'unavailable findings prevent completion even with full practical coverage')
  assert.equal(await controls.getByText('Blockierende Befunde: 0', { exact: true }).count(), 0,
    'unavailable findings must not look like an established absence of blockers')
  assert.equal(writes.length, 4, 'reading unavailable findings never sends a completion write')

  // An expired owner session must remove stale controls and offer the same
  // reconnect entry, without retrying the mutation automatically.
  ownerStatus = 401
  trialStatus = 401
  const readsBeforeExpiry = ownerReads
  await controls.getByRole('button', { name: 'Erprobung pausieren', exact: true }).click()
  await ownerArea.getByRole('button', { name: 'Mit GitHub verbinden', exact: true }).waitFor()
  assert.equal(await controls.count(), 0, 'expired sessions clear previously authenticated owner actions')
  assert(ownerReads > readsBeforeExpiry, 'a rejected trial action reloads owner authentication')
  assert.equal(writes.length, 5, 'an authentication failure does not automatically replay a trial action')
  assert.equal(trial.state, 'in_progress', 'failed pause leaves the public trial evidence unchanged')

  // A server error is distinct from signed-out state and is recoverable on
  // mobile, with the English copy selected.
  ownerStatus = 500
  await page.evaluate(() => localStorage.setItem('skillpilot_lang', 'en'))
  await page.setViewportSize({ width: 375, height: 812 })
  await page.reload()
  const englishOwnerArea = page.getByRole('region', { name: 'Your human QA', exact: true })
  await englishOwnerArea.getByRole('alert').waitFor()
  assert.equal(await englishOwnerArea.getByRole('button', { name: 'Connect with GitHub', exact: true }).count(), 0,
    'server failures must not silently look like signed-out state')
  const retry = englishOwnerArea.getByRole('button', { name: 'Retry', exact: true })
  await retry.scrollIntoViewIfNeeded()
  const retryBox = await retry.boundingBox()
  assert(retryBox && retryBox.x >= 0 && retryBox.x + retryBox.width <= 375,
    'the recoverable owner entry remains reachable on a narrow mobile screen')
  ownerStatus = 200
  await retry.click()
  const englishControls = page.getByRole('region', { name: 'Your curriculum trial', exact: true })
  await englishControls.getByRole('button', { name: 'Pause trial', exact: true }).waitFor()
  assert.equal(await englishOwnerArea.getByRole('alert').count(), 0, 'successful retry clears the initial loading error')
  assert.equal(writes.length, 5, 'recovery from an owner-load failure never mutates trial evidence')
  ownerStatus = 401
  await page.reload()
  const mobileConnect = englishOwnerArea.getByRole('button', { name: 'Connect with GitHub', exact: true })
  await mobileConnect.scrollIntoViewIfNeeded()
  const connectBox = await mobileConnect.boundingBox()
  assert(connectBox && connectBox.x >= 0 && connectBox.x + connectBox.width <= 375,
    'the English GitHub reconnect action remains reachable on a narrow mobile screen')
  assert.equal(await page.locator('form').count(), 0, 'mobile reconnect also stays independent of registration')
  assert.equal(writes.length, 5, 'signed-out mobile visits cannot change human QA evidence')

  // Existing scoped learning activity can establish an ongoing human trial,
  // while missing reviewed receipts still prevent a completion confirmation.
  ownerStatus = 200
  trialStatus = 200
  champion.masteredCount = 112
  champion.totalTopicGoals = 505
  trial.state = 'in_progress'
  trial.scopeLabel = 'Physics: personal curriculum scope'
  trial.scopeCoverage = 'partial'
  trial.requiredGoals = 505
  trial.practicedGoals = 0
  trial.findingsAvailable = true
  trial.canStart = false
  trial.canComplete = false
  qualityStatus = 'human_trial_in_progress'
  await page.reload()
  await englishControls.getByRole('button', { name: 'Pause trial', exact: true }).waitFor()
  await subjectRow.getByText('Human QA in progress', { exact: true }).waitFor()
  await subjectRow.getByText('M7', { exact: true }).waitFor()
  await page.getByText('Human QA in 1 subjects', { exact: true }).waitFor()
  await englishControls.getByText('Content-bound practice evidence: 0 / 505', { exact: true }).waitFor()
  assert.equal(await englishControls.getByRole('button', { name: 'Begin trial', exact: true }).count(), 0,
    'existing learning activity already recognized by the server needs no extra start action')
  assert.equal(await englishControls.getByRole('button', { name: 'Complete trial…', exact: true }).count(), 0,
    'existing mastery does not replace the receipt and confirmation requirements for completion')
  assert.equal(await subjectRow.locator('.lucide-badge-check').count(), 0,
    'a trial started from existing learning activity is not a human-tested seal')
  assert.equal(writes.length, 5, 'displaying an inferred ongoing trial never sends a synthetic start or completion')

  // A subsequent owner refresh can fail even after authentication succeeded.
  // Clear stale controls and let Retry discover an expired session honestly.
  ownerStatus = 500
  await englishControls.getByRole('button', { name: 'Pause trial', exact: true }).click()
  await englishOwnerArea.getByRole('alert').waitFor()
  assert.equal(await englishControls.count(), 0, 'ready-to-error owner refresh clears stale authenticated controls')
  ownerStatus = 401
  await englishOwnerArea.getByRole('button', { name: 'Retry', exact: true }).click()
  await englishOwnerArea.getByRole('button', { name: 'Connect with GitHub', exact: true }).waitFor()
  assert.equal(await englishOwnerArea.getByRole('alert').count(), 0, 'retrying an expired session shows the reconnect entry instead of a stale server error')
  assert.equal(await englishControls.count(), 0, '401 on Retry does not restore previously authenticated controls')
  assert.equal(writes.length, 6, 'owner refresh and retry never replay the successful pause')
  await page.close()
} finally {
  await browser.close(); await server.close()
}
console.log('champion trial explicit action and confirmation UI tests passed')
