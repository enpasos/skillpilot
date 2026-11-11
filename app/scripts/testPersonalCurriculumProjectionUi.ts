import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import type { SkillLandscape } from '../src/landscapeTypes'
import { CANONICAL_GYMNASIUM_ROOT_ID as rootId } from '../src/utils/curriculumDisplay'
import { startViteTestServer } from './viteTestServer'

const chemistry = JSON.parse(readFileSync(new URL('../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json', import.meta.url), 'utf8')) as SkillLandscape
const chemistryView = JSON.parse(readFileSync(new URL('../../curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-sekii-chemistry-gk.view.json', import.meta.url), 'utf8'))
const chemistryId = chemistry.landscapeId
const chemistryRoot = chemistry.goals.find((goal) => goal.tags?.includes('root'))!
const target = '1c1420c2-a8e2-520f-8015-6df637a973bd'
const prerequisite = 'e7c363d4-e02d-4895-8750-ba62c2eb63fe'
const orientation = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
const foreignId = 'foreign-subject'
const foreignGoalId = 'foreign-required'
const projection = (rootLandscapeId: string, seedAtomicGoalIds: string[], targetGoalIds: string[], requiredByPaths = {}) => ({
  revision: 'atomic-prerequisite-learning-v1', rootLandscapeId, scopeRevision: 'same-personal-configuration',
  seedAtomicGoalIds, targetGoalIds, requiredByPaths,
})
const sourceGoal = chemistry.goals.find((goal) => goal.id === prerequisite)!
const payload = (requestedRoot: string) => [
  ...(requestedRoot === rootId ? [{ landscapeId: rootId, locale: 'de', title: 'Gymnasium', frameworkId: 'canonical-gymnasium',
    personalCurriculumProjection: projection(requestedRoot, [], []),
    goals: [{ ...chemistryRoot, id: 'full-plan-root', title: 'Gymnasium', contains: [chemistryRoot.id] }] }] : []),
  { ...chemistry, personalCurriculumProjection: projection(requestedRoot, [target, orientation], [target, orientation, prerequisite],
    { [prerequisite]: [target, prerequisite] }) },
  { ...chemistry, landscapeId: foreignId, title: 'Fremdfach', personalCurriculumProjection: projection(requestedRoot, [], [foreignGoalId],
    { [foreignGoalId]: [target, foreignGoalId] }),
  goals: [{ ...sourceGoal, id: foreignGoalId, title: 'Fremde notwendige Grundlage', phase: 'J7', courseLevel: 'LK', tags: ['LK', 'DE-BY'],
    dimensionTags: { ...sourceGoal.dimensionTags, phase: 'J7' }, applicability: { jurisdiction: ['DE-BY'], courseProfile: ['LK'] } }] },
]
const server = await startViteTestServer(fileURLToPath(new URL('../', import.meta.url)), 'scripts/fixtures/learnerCoreStartupUi.html')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage()
  const errors: string[] = []
  const publicReads: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.route('**/api/ui/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    const json = (data: unknown) => route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) })
    if (path === '/api/ui/curriculum-catalog') return route.fulfill({ status: 404 })
    if (path.startsWith('/api/ui/landscapes/')) { publicReads.push(path); return json([]) }
    if (path === '/api/ui/learners/learner-a') return json({ personalCurriculum: JSON.stringify({
      [rootId]: { selected: true, filterId: 'DE-HE', stage: 'SekII', durationModel: 'G9' },
      [chemistryId]: { selected: true, filterId: 'GK' }, [foreignId]: { selected: false, filterId: 'GK' },
    }) })
    if (path.endsWith('/mastery')) return json({ mastery: {} })
    if (path.endsWith('/closure')) return json(payload(path.split('/').at(-2)!))
    if (path === '/api/ui/composition-views/match') {
      const owner = url.searchParams.get('landscapeId')
      if (owner === chemistryId) return json(chemistryView)
      if (owner === rootId) return json({ viewId: 'full-plan', landscapeId: rootId, rootNodes: [{ kind: 'landscapeEntry', landscapeId: chemistryId }] })
      return route.fulfill({ status: 204 })
    }
    throw new Error(`Unexpected projection request: ${path}`)
  })
  await page.goto(`${server.baseUrl}/scripts/fixtures/learnerCoreStartupUi.html`)
  const tree = page.getByTestId('projection-tree')
  await tree.getByText('Fremde notwendige Grundlage', { exact: true }).waitFor()
  const prerequisiteRow = tree.locator(`[data-goal-id="${prerequisite}"]`)
  await prerequisiteRow.waitFor()
  assert.equal(await prerequisiteRow.count(), 1)
  assert.equal(await tree.locator(`[data-goal-id="${foreignGoalId}"]`).count(), 1)
  const preparationRow = tree.locator(`[data-goal-id="personal-curriculum:${rootId}:preparation"]`)
  assert.equal(await preparationRow.locator('button[aria-pressed]').count(), 0)
  await prerequisiteRow.locator('button[aria-pressed]').click()
  assert.equal(await page.getByTestId('focused-goal').innerText(), prerequisite)
  await prerequisiteRow.click()
  await preparationRow.click()
  assert.equal(await page.getByTestId('selected-goal').innerText(), prerequisite,
    'Selecting the presentation aggregate cannot navigate to an invented backend goal.')
  await page.getByRole('button', { name: 'Chemie einzeln' }).click()
  await tree.locator(`[data-goal-id="personal-curriculum:${chemistryId}:preparation"]`).waitFor()
  await tree.getByText('Fremde notwendige Grundlage', { exact: true }).waitFor()
  await page.getByRole('button', { name: 'Notwendige Fremdgrundlage' }).click()
  const foreignRoute = `/learner/${foreignGoalId}?l=${chemistryId}`
  await page.waitForFunction((expected) => document.querySelector('[data-testid="route"]')?.textContent === expected,
    foreignRoute)
  assert.equal(await page.getByTestId('route').innerText(), foreignRoute,
    'Opening a required foreign atom retains the committed standalone curriculum root.')
  await tree.getByText('Fremde notwendige Grundlage', { exact: true }).waitFor()
  assert.deepEqual(publicReads, [], 'Standalone authenticated subjects also use the authoritative learner response.')
  assert.deepEqual(errors, [])
  console.log('Personal Curriculum browser tree: Chemistry support target, foreign filters, navigation and standalone scope passed.')
} finally {
  await browser.close()
  await server.close()
}
