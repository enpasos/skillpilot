// SPDX-License-Identifier: Apache-2.0
// Read-only successor check; historical reviews and shared generator inputs are never written.
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fingerprintCurrentCurriculumDocument as digest } from '../../../../../../../../../../app/scripts/currentCurriculumCatalog'
import { collectWholeMaterialPrerequisiteClosure } from '../../../../../../../../../../app/scripts/generateCurriculumQualityStatus'
const root = resolve(import.meta.dirname, '../../../../../../../../../..')
const base = 'curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-stage-20261124/sn/accb-scope-followup-20261124'
const bytes = (p: string) => readFileSync(resolve(root, p))
const read = (p: string) => JSON.parse(bytes(p).toString('utf8'))
const hash = (p: string) => createHash('sha256').update(bytes(p)).digest('hex')
const own = (name: string) => read(base + '/' + name)
const accb = own('review.actual.json'), energy = own('energy91c-review.actual.json')
const snap = own('current-goals-profile-and-source-decisions.json'), en = own('energy91c-current-goal-profile-P72.json')
const subjects = ['PHYSIK', 'MATHEMATIK', 'CHEMIE'].map(subject => read(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`))
const landscape = { ...subjects[0], goals: subjects.flatMap(subject => subject.goals) }
const goals = new Map<string, any>(landscape.goals.map((goal: any) => [goal.id, goal]))
for (const item of [...snap.goals, ...en.fullRealPreparation.goals]) {
  assert.deepEqual(goals.get(item.goal.id), item.goal)
  assert.equal(digest(item.goal), item.normalizedSha256)
}
assert.deepEqual(goals.get(en.goal.id), en.goal)
assert.equal(digest(en.goal), en.currentGoalNormalizedSha256)
const circleClosure = collectWholeMaterialPrerequisiteClosure(landscape, accb.scope.endpointId)
assert.deepEqual([...circleClosure.atomicGoalIds].sort(), snap.fullRealClosure.goalIds)
assert.equal(circleClosure.unresolvedReferences.size, 0)
const energyClosure = collectWholeMaterialPrerequisiteClosure(landscape, en.goal.id)
assert.equal(energyClosure.atomicGoalIds.size, 71)
assert.equal(energyClosure.unresolvedReferences.size, 0)
assert.deepEqual([en.goal.id, ...energyClosure.atomicGoalIds].sort(), en.fullRealPreparation.goalIds)
for (const predecessor of accb.historicalPredecessors) assert.equal(hash(predecessor.path), predecessor.sha256)
assert.equal(hash(energy.historicalPredecessor.path), energy.historicalPredecessor.sha256)
assert.equal(hash(accb.currentSnapshot.path), accb.currentSnapshot.sha256)
assert.equal(hash(energy.snapshot.path), energy.snapshot.sha256)
assert.equal(hash(energy.independentCounterReview.path), energy.independentCounterReview.sha256)
assert.equal(hash(accb.normativeGoalFinding.source.path), accb.normativeGoalFinding.source.sha256)
assert.equal(hash(energy.normativeGoal.evidence.path), energy.normativeGoal.evidence.sha256)
for (const [path, expected] of [[snap.activePositiveEvidenceConfigPath, snap.activePositiveEvidenceConfigSha256],
  [snap.activePositiveEvidenceReviewPath, snap.activePositiveEvidenceReviewSha256],
  [en.currentUnderstandingProfile.configPath, en.currentUnderstandingProfile.configSha256],
  [en.currentUnderstandingProfile.reviewPath, en.currentUnderstandingProfile.reviewSha256]]) assert.equal(hash(path), expected)
const fragment = own('sources-config.fragment.json')
const before = structuredClone(fragment.citationOnlyJsonPatch[0].value)
const after = structuredClone(before)
for (const patch of fragment.citationOnlyJsonPatch.slice(1)) {
  const relative = patch.path.slice(fragment.citationOnlyJsonPatch[0].path.length + 1).split('/')
  let parent = after
  for (const key of relative.slice(0, -1)) parent = parent[key]
  parent[relative.at(-1)!] = patch.value
}
for (const key of ['action', 'classification', 'canonicalDescription', 'sourceGoalIds', 'retainedMapping', 'retainedExtraction']) assert.deepEqual(after[key], before[key])
assert.deepEqual(after.primaryEvidence[0].pdfPages, [39, 59])
const source = read(fragment.targetPath)
const actual = source.reviewedLowerSourceMembership.decisions.SN[before.sourceGoalIds ? 'ec7a0a68-730b-5c94-ac72-a937508f8303' : '']
assert([JSON.stringify(before), JSON.stringify(after)].includes(JSON.stringify(actual)), 'Omega decision differs from both exact historical and citation-only successor')
assert(!source.reviewedLowerSourceMembership.decisions.SN[accb.scope.goalId], 'No whole-accb lower-source exclusion was qualified')
assert(!source.reviewedLowerSourceMembership.decisions.SN[en.goal.id], 'No whole-energy lower-source exclusion was qualified')
console.log(JSON.stringify({ schema: 'sn-source-followup-read-only-verification-v1', status: 'PASS',
  checkedAt: new Date().toISOString(), circlePreparation: circleClosure.atomicGoalIds.size,
  energyPrerequisites: 71, energyRequiredGoalPlusPrerequisites: 72,
  currentOmegaCitation: JSON.stringify(actual) === JSON.stringify(after) ? 'EXACT_CITATION_ONLY_SUCCESSOR' : 'HISTORICAL_BEFORE_PARENT_ACTIVATION',
  sharedSourceInput: { path: fragment.targetPath, sha256: hash(fragment.targetPath) },
  artifacts: readdirSync(resolve(root, base)).filter(name => name !== 'verification.actual.json').sort().map(name => ({ path: base + '/' + name, sha256: hash(base + '/' + name) })),
  noSharedInputsWritten: true, noAssessmentOrGateChange: true }, null, 2))
