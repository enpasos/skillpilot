import assert from 'node:assert/strict'
import type { UiGoal } from '../src/goalTypes'
import type { LearningUnitReadModel, LearningUnitsReadModel } from '../src/utils/learningUnitsApi'
import { buildLearnerMapProjection, createLearnerMapProjectionCache } from '../src/components/learningUnitMap/learnerMapProjection'
import { learningUnitNavigationId, projectLearningUnitNavigation } from '../src/components/learningUnitMap/learnerUnitMapProjection'

const goal = (id: string, contains: string[] = [], requires: string[] = []): UiGoal => ({
  id, title: id, description: id, contains, requires, type: contains.length ? 'cluster' : 'atomic', phase: 'GLOBAL',
  themenfeld: '', area: '', level: 1, core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '', examples: [],
})
const goals = [goal('gym', ['math', 'physics']), goal('math', ['calendar-year', 'assessment-area']),
  goal('calendar-year', ['A', 'K']), goal('assessment-area', ['Q']), goal('A'),
  { ...goal('Q', [], ['A']), nodeKind: 'exam' as const }, { ...goal('K'), nodeKind: 'memory' as const },
  goal('physics', ['P']), goal('P', [], ['A'])]
const index = new Map(goals.map(value => [value.id, value]))
const base = { rootGoals: [goals[0]], goalIndexAll: index, canonicalGoalIndexAll: index,
  visibleGoalIds: new Set(index.keys()), visibleChildrenByParent: new Map(goals.map(value => [value.id, value.contains])) }
const unit: LearningUnitReadModel = { contractId: 'reviewed-unit', revision: 'r1', programUnitId: 'program-unit',
  title: { de: 'Vektoren anwenden', en: 'Apply vectors' }, promise: { de: 'Du kannst Vektoren selbständig anwenden.' }, introduction: { de: 'Motivation' },
  ownGoalIds: ['A', 'Q', 'K'], requiredChildContractRefs: [], ownAssessmentGoalIds: ['Q'], ownRecallGoalIds: ['K'],
  complete: false, targetCount: 3, explicitTargetCount: 1, recognizedTargetCount: 1, ownRecognizedGoalIds: ['A'], pendingGoalIds: ['K'] }
const parent: LearningUnitReadModel = { ...unit, contractId: 'course-root', title: { de: 'Vektorkurs' },
  ownGoalIds: [], requiredChildContractRefs: [{ contractId: unit.contractId, revision: unit.revision }], ownAssessmentGoalIds: [], ownRecallGoalIds: [], ownRecognizedGoalIds: [] }
const readModel: LearningUnitsReadModel = { calculationStatus: 'valid', semantics: 'global-unit-recognition-v1', contractDigest: 'digest',
  recognizedGoalIds: ['A'], voluntaryGoalIds: ['A'], units: [parent, unit], offerBinding: {
    status: 'valid', revision: 'offer-r1', bindingDigest: 'binding', coverage: 'partial', coveredTargetCount: 3, totalTargetCount: 4,
    scopeKey: { rootLandscapeId: 'entry', landscapeId: 'math', schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage', durationModel: 'G9', courseProfile: 'LK' },
    rootContractRefs: [{ contractId: parent.contractId, revision: parent.revision }],
  } }
const navigation = projectLearningUnitNavigation(base, readModel, 'de')
const fixture = buildLearnerMapProjection(navigation.input)
const parentId = learningUnitNavigationId(parent)
const unitId = learningUnitNavigationId(unit)
assert.equal(fixture.entries[parentId].kind, 'unit')
assert.equal(fixture.entries[unitId].kind, 'unit')
assert.deepEqual(fixture.entries[parentId].children, [unitId])
assert.deepEqual(fixture.entries[unitId].children, ['A', 'Q', 'K'], 'reviewed Own joins goals from different canonical parents')
assert.deepEqual(fixture.entryPaths?.A.slice(-3), [parentId, unitId, 'A'])
assert.equal(fixture.entries.Q.kind, 'assessment')
assert.equal(fixture.entries.K.kind, 'memory')
assert.equal(fixture.entries.P.kind, 'goal', 'uncovered Physics remains ordinary navigation')
assert.ok(!fixture.entries['calendar-year'], 'empty canonical areas are pruned without promoting calendar headings to units')
assert.equal(Object.values(fixture.entries).flatMap(entry => entry.children ?? []).filter(id => id === 'A').length, 1)
assert.deepEqual(fixture.getRequirementContext?.('P').map(value => value.requiredGoalId), ['A'], 'an atomic prerequisite remains atomic rather than becoming a whole foreign unit')
assert.equal(navigation.unitsByEntryId.get(unitId), unit, 'unit counts/completion remain the actual backend record')
assert.ok(!index.has(unitId), 'source goal definitions stay unchanged')
assert.ok(navigation.navigationEntryIds.has(parentId) && !navigation.navigationEntryIds.has('A'))
const cache = createLearnerMapProjectionCache()
const first = cache(navigation.input)
const changedProgress = structuredClone(readModel)
changedProgress.units[1].explicitTargetCount = 2
changedProgress.units[1].recognizedTargetCount = 0
assert.equal(cache(projectLearningUnitNavigation(base, changedProgress, 'de').input), first, 'progress refreshes preserve the map layout/camera fixture')
const unavailable = { ...readModel, offerBinding: { ...readModel.offerBinding!, status: 'unavailable' as const } }
assert.equal(projectLearningUnitNavigation(base, unavailable, 'de').input, base)
assert.deepEqual(unavailable.recognizedGoalIds, ['A'], 'offer failure never retracts global recognition')
const missingChild = structuredClone(readModel)
missingChild.units = [parent]
assert.equal(projectLearningUnitNavigation(base, missingChild, 'de').input, base, 'missing authoritative child does not create a guessed unit hierarchy')
const conflict = structuredClone(readModel)
conflict.units[0].ownGoalIds = ['A']
assert.equal(projectLearningUnitNavigation(base, conflict, 'de').input, base, 'direct ownership conflicts fail closed')
const cyclic = structuredClone(readModel)
cyclic.units[1].requiredChildContractRefs = [{ contractId: parent.contractId, revision: parent.revision }]
assert.equal(projectLearningUnitNavigation(base, cyclic, 'de').input, base)
assert.equal(projectLearningUnitNavigation(base, { ...readModel, offerBinding: undefined }, 'de').input, base,
  'legacy metadata alone never promotes a calendar or canonical area to a unit')
console.log('Authoritative unit navigation passed: selected roots/children/Own, protected Q/K, partial Physics, one atomic path, global I fallback and stable progress refresh.')
