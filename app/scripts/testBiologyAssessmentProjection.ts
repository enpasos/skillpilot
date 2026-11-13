// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import type { SkillLandscape } from '../src/landscapeTypes'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { collectRenderedAtomicGoalIdsFromCompositionView, evaluateRouteProfile, routeProfiles } from './generateCurriculumQualityStatus'

const root = resolve(import.meta.dirname, '../..')
const viewPath = resolve(root, 'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json')
const landscape = JSON.parse(readFileSync(resolve(root,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'), 'utf8')) as SkillLandscape
const byId = new Map(landscape.goals.map(goal => [goal.id, goal]))
const view = JSON.parse(readFileSync(viewPath, 'utf8'))
const profile = routeProfiles.find(profile => profile.profileId === 'canonical-biology-sek2')!
assert(profile)
const examFolderIds = [
  ...profile.terminalAutonomyClusterIds,
  'b934de00-ac08-56f7-9947-1a70fa5930e2',
  'defe3acd-a6c2-585b-a439-0200846a92cb',
]
// Expected assessment identity and course come from the canonical contracts,
// independently of the projection that this regression checks.
const expectedAssessments = examFolderIds.flatMap(id => byId.get(id)!.contains ?? []).map(id => byId.get(id)!)
assert.equal(expectedAssessments.length, 26)
assert(expectedAssessments.every(goal => goal.examData && !(goal.contains?.length)))
const expectedGk = expectedAssessments.filter(goal => goal.tags?.includes('GK')).map(goal => goal.id)
const expectedLkOnly = expectedAssessments.filter(goal => !goal.tags?.includes('GK')).map(goal => goal.id)
assert.equal(expectedGk.length, 21)
const visibleGk = collectRenderedAtomicGoalIdsFromCompositionView(landscape, viewPath, ['GK'])
assert(expectedGk.every(id => visibleGk.has(id)), 'All 21 existing GK assessments must be accessible.')
assert(expectedLkOnly.every(id => !visibleGk.has(id)), 'The five LK-only assessments must stay outside the GK projection.')

const fixture = mkdtempSync(resolve(tmpdir(), 'biology-assessment-projection-'))
try {
  const shallow = structuredClone(view)
  for (const node of shallow.rootNodes[0].children) {
    if (examFolderIds.includes(node.goalId)) node.kind = 'goalEntry'
  }
  const brokenPath = resolve(fixture, 'shallow.json')
  writeFileSync(brokenPath, JSON.stringify(shallow))
  const brokenVisible = collectRenderedAtomicGoalIdsFromCompositionView(landscape, brokenPath, ['GK'])
  assert(expectedGk.every(id => !brokenVisible.has(id)), 'A shallow folder must reproduce the missing-assessment regression.')
  assert.deepEqual([...visibleGk].filter(id => !brokenVisible.has(id)).sort(), expectedGk.sort(),
    'Repair must add only the already authored assessment contents, no unrelated targets.')
  assert([...brokenVisible].filter(id => !(byId.get(id)?.contains?.length)).every(id => visibleGk.has(id)),
    'Previously visible canonical atomic targets must remain visible; folder shells are clusters, not new atoms.')
} finally {
  rmSync(fixture, { recursive: true, force: true })
}

const compilation = buildApplicabilityCompilation()
const measured = evaluateRouteProfile(landscape, {
  ...profile, compositionViewStage: 'SekII', compositionViewApplicabilityMode: 'compiled-jurisdiction',
}, compilation).rules.find(rule => rule.id === 'CQR-104')!
assert.equal(measured.status, 'fail', 'Restoring a collection must not hide the remaining applicability and state-view gaps.')
assert.equal(measured.metrics?.projectionScopesWithoutExpectedTerminalAutonomyGoals, 5,
  'Five jurisdictions still lack a genuinely applicable endpoint; visibility is not applicability evidence.')
assert(!measured.details?.some(detail => detail.includes('de-de-gym-biology-gk.view.json')
  && detail.includes('e8caebd4-57bc-5c2f-881d-0b1693777c64')),
  'The GK view must not be required to expose the LK-only ENG/ECG assessment.')
assert(measured.details?.some(detail => detail.includes('de-st-gym-sekii-biology-gk.view.json')
  && detail.includes('1d0c84df-8040-5cab-8a7c-359366937e44')),
  'A missing independently applicable state-view endpoint must still fail.')

const status = JSON.parse(readFileSync(resolve(root, 'docs/qa-ci/status/curriculum-quality-status.json'), 'utf8'))
for (const configured of routeProfiles.filter(profile => profile.compositionViewStage)) {
  const path = status.curricula.find((entry: { landscapeId: string }) => entry.landscapeId === configured.landscapeId)?.path
  assert(path, `Missing source for ${configured.profileId}`)
  const source = JSON.parse(readFileSync(resolve(root, path), 'utf8')) as SkillLandscape
  const rule = evaluateRouteProfile(source, configured, compilation).rules.find(rule => rule.id === 'CQR-104')!
  assert.equal(rule.status, 'pass', `${configured.profileId}: ${JSON.stringify(rule)}`)
}
console.log('Biology assessment projection: 21 GK assessments restored, five LK-only assessments excluded; unresolved endpoint gaps still fail; all eight pinned visibility scopes pass.')
