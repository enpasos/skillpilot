import assert from 'node:assert/strict'
import type { LevelCompletion } from './levelCompletionApi'
import { effectiveMasteryFromSnapshot, parseLearningUnits, learningCompletionAnnotations } from './learningUnitsApi'

const unit = {
  contractId: 'unit-one', revision: '1', programUnitId: 'module-one',
  title: { de: 'Vektoren' }, promise: { de: 'Du kannst Projektionen berechnen.' },
  introduction: { de: 'Du kannst damit Schatten und Abstände untersuchen.' },
  ownGoalIds: ['A', 'B', 'Q', 'K'], requiredChildContractRefs: [],
  ownAssessmentGoalIds: ['Q'], ownRecallGoalIds: ['K'], complete: false,
  targetCount: 4, explicitTargetCount: 1, recognizedTargetCount: 2,
  ownRecognizedGoalIds: ['A', 'B'], pendingGoalIds: ['K'],
}
const raw = {
  calculationStatus: 'valid', semantics: 'global-unit-recognition-v1', contractDigest: 'sha256:fixture',
  recognizedGoalIds: ['A', 'B'], units: [unit],
}
const parsed = parseLearningUnits(raw)!
const explicit = { Q: 1, K: 0, A: 0 }
assert.deepEqual(effectiveMasteryFromSnapshot(explicit, parsed), { Q: 1, K: 0, A: 1, B: 1 })
assert.deepEqual(explicit, { Q: 1, K: 0, A: 0 }, 'recognition must never write the explicit result map')
assert.equal(parsed.units[0].complete, false, 'an open recall goal keeps the unit incomplete')
const partiallyUnavailable = parseLearningUnits({ ...raw, calculationStatus: 'partial', units: [{ ...unit, calculationStatus: 'unavailable' }] })!
assert.equal(partiallyUnavailable.units[0].calculationStatus, 'unavailable')
assert.deepEqual(partiallyUnavailable.recognizedGoalIds, ['A', 'B'], 'an unavailable unit status does not erase separately published valid recognition')
assert.deepEqual(effectiveMasteryFromSnapshot(explicit, null), explicit, 'legacy responses retain explicit mastery')
assert.deepEqual(parseLearningUnits({ ...raw, calculationStatus: 'partial' })?.recognizedGoalIds, ['A', 'B'], 'admitted contracts survive quarantine of another contract')
assert.throws(() => parseLearningUnits({ ...raw, recognizedGoalIds: ['A', 'A'] }))
assert.throws(() => parseLearningUnits({ ...raw, calculationStatus: 'unavailable' }))
assert.throws(() => parseLearningUnits({ ...raw, units: [{ ...unit, recognizedTargetCount: 4 }] }))
assert.throws(() => parseLearningUnits({ ...raw, semantics: 'focus-relative-waiver' }))
assert.deepEqual(parseLearningUnits({ ...raw, calculationStatus: 'unavailable', contractDigest: null, recognizedGoalIds: [], units: [] }), { ...raw, voluntaryGoalIds: [], calculationStatus: 'unavailable', contractDigest: null, recognizedGoalIds: [], units: [] })
assert.deepEqual(parsed.voluntaryGoalIds, [], 'older backend snapshots do not authorize voluntary starts')
assert.deepEqual(parseLearningUnits({ ...raw, voluntaryGoalIds: ['A'] })?.voluntaryGoalIds, ['A'])
assert.throws(() => parseLearningUnits({ ...raw, voluntaryGoalIds: ['unpublished'] }), 'a voluntary option must refer to backend-recognized competence')
assert.equal(parseLearningUnits(undefined), null)
const physicsLegacy: LevelCompletion = {
  calculationStatus: 'valid', profileId: 'physics-profile', learnerRevision: 1, title: { de: 'Physik' },
  masteredTargetCount: 1, waivedTargetCount: 1, pendingTargetCount: 0, targetCount: 2,
  masteredAssessmentCount: 1, requiredAssessmentCount: 1, waivedTargetGoalIds: ['physics-A'],
  assessments: [], profileOptions: [], directAssessmentRunning: false, actions: [],
}
const mixed = learningCompletionAnnotations(physicsLegacy, parsed, false)
assert.equal(mixed.get('physics-A')?.reason, 'assessment', 'backend-retained Physics section waivers coexist with Mathematics global recognition')
assert.equal(mixed.get('A')?.reason, 'recognized')
assert.equal(learningCompletionAnnotations(physicsLegacy, { ...parsed, units: [], recognizedGoalIds: [] }, false).has('physics-A'), true,
  'loading a Mathematics catalog must not suppress a Physics-only legacy route')
assert.equal(learningCompletionAnnotations(physicsLegacy, parsed, true).size, 0, 'stale state supplies neither legacy nor new annotations')
console.log('Learning-unit readmodel: global recognition, explicit results, open recall and invalid-snapshot checks passed.')

const compatibilityWitness: LevelCompletion = { ...physicsLegacy, waivedTargetGoalIds: ['A'], waiverDetails: [{ goalId: 'A', title: { de: 'A' }, ruleId: 'learning_unit_application', assessments: [], assessmentCount: 0 }] }
assert.equal(learningCompletionAnnotations(compatibilityWitness, null, false).get('A')?.reason, 'recognized', 'a compatibility-only witness keeps its global meaning')
assert.equal(learningCompletionAnnotations(compatibilityWitness, { ...parsed, recognizedGoalIds: [] }, false).has('A'), false, 'older compatibility state cannot resurrect recognition absent from the authoritative snapshot')
assert.equal(learningCompletionAnnotations(compatibilityWitness, { ...parsed, calculationStatus: 'unavailable', recognizedGoalIds: [] }, false).has('A'), false)

const offer = { status: 'valid', revision: 'offer-1', bindingDigest: 'sha256:offer', coverage: 'partial',
  scopeKey: { rootLandscapeId: 'root', landscapeId: 'math', schoolForm: 'Gymnasium', jurisdiction: 'ALL', stage: 'CrossStage', durationModel: null, courseProfile: 'GK+LK' },
  rootContractRefs: [{ contractId: unit.contractId, revision: unit.revision }], coveredTargetCount: 4, totalTargetCount: 10 }
assert.equal(parseLearningUnits({ ...raw, offerBinding: offer })?.offerBinding?.status, 'valid')
for (const status of ['unavailable', 'unresolved']) {
  const independent = parseLearningUnits({ ...raw, voluntaryGoalIds: ['A'], offerBinding: { ...offer, status } })!
  assert.deepEqual(independent.recognizedGoalIds, ['A', 'B'], 'offer availability must never revoke global recognition')
  assert.deepEqual(independent.voluntaryGoalIds, ['A'], 'ordinary voluntary practice remains backend-authorized independently of unit offer availability')
  assert.deepEqual(independent.units, [], 'unavailable offers must not expose stale unit navigation')
  assert.equal(effectiveMasteryFromSnapshot(explicit, independent).A, 1)
}
const malformedOffer = parseLearningUnits({ ...raw, offerBinding: { ...offer, status: 'unknown' } })!
assert.equal(malformedOffer.offerBinding?.status, 'unavailable')
assert.deepEqual(malformedOffer.recognizedGoalIds, ['A', 'B'], 'malformed offer metadata cannot invalidate a valid recognition snapshot')
