// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import type { SkillLandscape } from '../src/landscapeTypes'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { collectRenderedAtomicGoalIdsFromCompositionView, evaluateRouteProfile, createRouteProfiles } from './generateCurriculumQualityStatus'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'

const routeProfiles = createRouteProfiles()
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
const compiledProfile = {
  ...profile, compositionViewStage: 'SekII', compositionViewApplicabilityMode: 'compiled-jurisdiction',
} as const
const measured = evaluateRouteProfile(landscape, compiledProfile, compilation).rules.find(rule => rule.id === 'CQR-104')!
assert.equal(measured.status, 'fail', 'Restoring a collection must not hide the remaining applicability and state-view gaps.')
assert.equal(measured.metrics?.projectionScopesWithoutExpectedTerminalAutonomyGoals, 5,
  'Five jurisdictions still lack a genuinely applicable endpoint; visibility is not applicability evidence.')
assert(!measured.details?.some(detail => detail.includes('de-de-gym-biology-gk.view.json')
  && detail.includes('e8caebd4-57bc-5c2f-881d-0b1693777c64')),
  'The GK view must not be required to expose the LK-only ENG/ECG assessment.')
// Global rule details are capped at 20; unrelated stage-structure findings may
// consume that budget. Check the actual state view independently so the missing
// endpoint assertion cannot depend on the order or number of other findings.
const stateViewPath = resolve(root, 'curricula/DE/Gymnasium/composition-views/biologie/de-st-gym-sekii-biology-gk.view.json')
const stateEndpointIds = [
  '1d0c84df-8040-5cab-8a7c-359366937e44',
  '7c7f147c-2b64-5b0c-90c1-ea9a9bf4b03a',
]
for (const id of stateEndpointIds) {
  assert(expectedGk.includes(id), `${id} must be an independently authored GK assessment.`)
  assert(byId.get(id)?.applicability?.jurisdiction?.includes('DE-ST'),
    `${id} must be explicitly applicable to the learner's state.`)
  assert(compilation.reports.find(report => report.landscapeId === landscape.landscapeId)
    ?.goals.find(goal => goal.goalId === id)?.compiledApplicability.jurisdiction?.includes('DE-ST'),
    `${id} must be independently applicable in Sachsen-Anhalt.`)
}
const stateMeasured = evaluateRouteProfile(landscape, compiledProfile, compilation, undefined, [stateViewPath])
  .rules.find(rule => rule.id === 'CQR-104')!
assert.equal(stateMeasured.status, 'fail')
assert.equal(stateMeasured.metrics?.projectionScopesMissingTerminalAutonomyGoals, 1)
assert(stateEndpointIds.every(id => stateMeasured.details?.some(detail =>
  detail.startsWith('Missing terminal autonomy goal(s):')
  && detail.includes('de-st-gym-sekii-biology-gk.view.json') && detail.includes(id))),
  'A missing independently applicable state-view endpoint must still fail.')

const stateFixture = mkdtempSync(resolve(tmpdir(), 'biology-state-endpoint-'))
try {
  const completeStateView = JSON.parse(readFileSync(stateViewPath, 'utf8'))
  completeStateView.rootNodes[0].children.push(...stateEndpointIds.map(goalId => ({ kind: 'goalEntry', goalId })))
  const completeStatePath = resolve(stateFixture, 'complete-state.json')
  writeFileSync(completeStatePath, JSON.stringify(completeStateView))
  const completeStateMeasured = evaluateRouteProfile(landscape, compiledProfile, compilation, undefined, [completeStatePath])
    .rules.find(rule => rule.id === 'CQR-104')!
  assert.equal(completeStateMeasured.status, 'pass',
    `Exposing the independently applicable endpoints must satisfy the state-view gate: ${JSON.stringify(completeStateMeasured)}`)
  assert.equal(completeStateMeasured.metrics?.projectionScopesMissingTerminalAutonomyGoals, 0)
} finally {
  rmSync(stateFixture, { recursive: true, force: true })
}

// Use the producer's complete current catalog: Physics routes also depend on
// Mathematics preparation and its motivation anchor across subject boundaries.
const currentCatalog = loadCurrentCurriculumCatalog(liveVerificationInputs).entries
  .map(entry => entry.landscape as SkillLandscape)
const configuredProfiles = routeProfiles.filter(profile => profile.compositionViewStage)
for (const configured of configuredProfiles) {
  const source = currentCatalog.find(entry => entry.landscapeId === configured.landscapeId)
  assert(source, `Missing source for ${configured.profileId}`)
  const rule = evaluateRouteProfile(source, configured, compilation, currentCatalog).rules.find(rule => rule.id === 'CQR-104')!
  assert.equal(rule.status, 'pass', `${configured.profileId}: ${JSON.stringify(rule)}`)
}
console.log(`Biology assessment projection: 21 GK assessments restored, five LK-only assessments excluded; unresolved endpoint gaps still fail; all ${configuredProfiles.length} pinned visibility scopes pass.`)
