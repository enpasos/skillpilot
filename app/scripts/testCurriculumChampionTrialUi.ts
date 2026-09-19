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
  await page.addInitScript(() => { localStorage.setItem('skillpilot_lang', 'de'); localStorage.setItem('skillpilot_theme', 'light') })
  const trial: ChampionTrial = {
    state: 'not_started', scopeLabel: 'Mathematik: gesamter ausgewiesener Umfang', scopeCoverage: 'full',
    requiredGoals: 2, practicedGoals: 2, blockingFindings: 0, canStart: true, canComplete: false,
  }
  const champion = { id: 'fixture-champion', curriculumId: CANONICAL_GYMNASIUM_ROOT_ID, topicId: 'fixture-math', topicTitle: 'Mathematik',
    githubId: 'fixture', skillpilotIdMasked: '***', masteredCount: 2, totalTopicGoals: 2, issuesCount: 0, pullRequestsCount: 0, trial }
  let qualityStatus: CurriculumQualityStatus = 'machine_qa'
  const writes: Array<{ action: string; confirmed?: boolean }> = []
  await page.route('**/api/ui/curricula/champions/me', (route) => route.fulfill({ json: [champion] }))
  await page.route('**/api/ui/curricula/*/topics', (route) => route.fulfill({ json: [] }))
  await page.route('**/api/ui/curricula', (route) => route.fulfill({ json: {
    defaultCurriculumId: CANONICAL_GYMNASIUM_ROOT_ID, lastUpdatedAt: '2026-09-22T00:00:00Z', curricula: [{
      curriculumId: CANONICAL_GYMNASIUM_ROOT_ID, title: 'Gymnasium (DE)', subject: '', totalAtomicGoals: 2, totalMastered: 2,
      qualityStatus: null, humanTrialSubjectCount: qualityStatus.startsWith('human_') ? 1 : 0,
      topLevelTopics: ['Mathematik'], champions: [champion], subjectQuality: [{
        landscapeId: 'fixture-math', subject: 'Mathematik', maturity: 'M6', qualityStatus,
        goals: 2, atomicGoals: 2, warnings: 0, failures: 0,
      }],
    }],
  } }))
  await page.route('**/api/ui/curricula/champions/fixture-champion/trial', (route) => {
    assert.equal(route.request().method(), 'POST')
    const request = route.request().postDataJSON() as { action: string; confirmed?: boolean }
    writes.push(request)
    if (request.action === 'complete' && request.confirmed !== true) return route.fulfill({ status: 400, json: {} })
    trial.state = request.action === 'pause' ? 'paused' : request.action === 'complete' ? 'completed' : 'in_progress'
    trial.canStart = false; trial.canComplete = trial.state === 'in_progress'
    qualityStatus = trial.state === 'completed' ? 'human_trial_completed' : trial.state === 'in_progress' ? 'human_trial_in_progress' : 'machine_qa'
    return route.fulfill({ json: champion })
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/curriculaQualityLayoutUi.html`)
  const controls = page.getByRole('region', { name: 'Deine Curriculum-Erprobung', exact: true })
  const subjectRow = page.getByTestId('curriculum-quality-row').filter({ hasText: 'Mathematik' })
  await controls.getByRole('button', { name: 'Erprobung beginnen', exact: true }).waitFor()
  assert.equal(writes.length, 0, 'registration, existing mastery and loading never start a trial')
  assert.equal(await controls.getByRole('button', { name: 'Erprobung abschließen…', exact: true }).count(), 0)
  assert.equal(await subjectRow.locator('.lucide-badge-check').count(), 0, '2/2 mastery does not grant a seal')
  await controls.getByRole('button', { name: 'Erprobung beginnen', exact: true }).click()
  await controls.getByRole('button', { name: 'Erprobung pausieren', exact: true }).waitFor()
  await subjectRow.getByText('Menschliche QS läuft', { exact: true }).waitFor()
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
  await page.close()
} finally {
  await browser.close(); await server.close()
}
console.log('champion trial explicit action and confirmation UI tests passed')
