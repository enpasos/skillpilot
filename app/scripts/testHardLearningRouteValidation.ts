import assert from 'node:assert/strict'
import {
  validateHardDirectAtomicRoutes,
  validateOrientationMotivationStructure,
  type HardRouteGoal,
  type HardRouteSemanticKind,
} from './lib/hardLearningRouteValidation'

assert.deepEqual(
  validateOrientationMotivationStructure({
    id: 'orientation-valid',
    semanticKind: 'orientation',
    type: 'atomic',
    nodeKind: 'tutor',
    tags: ['Motivation', 'Orientation'],
    requires: [],
    contains: [],
    examples: [],
  }),
  [],
  'an atomic prerequisite-free orientation without assessment metadata is valid',
)

const malformedOrientationFindings = validateOrientationMotivationStructure({
  id: 'orientation-malformed',
  semanticKind: 'orientation',
  type: 'cluster',
  nodeKind: 'exam',
  tags: ['Motivation', 'memorization', 'srs-deck:orientation', 'Assessment'],
  requires: ['prior-content'],
  contains: ['content-child'],
  examples: ['hard-check'],
  examData: { taskContent: 'Detailwissen prüfen' },
})
assert.ok(malformedOrientationFindings.some((finding) => finding.message.includes('atomic')))
assert.ok(malformedOrientationFindings.some((finding) => finding.message.includes('prerequisite-free')))
assert.ok(malformedOrientationFindings.some((finding) => finding.message.includes('examData')))
assert.ok(malformedOrientationFindings.some((finding) => finding.message.includes('nodeKind=exam')))
assert.ok(malformedOrientationFindings.some((finding) => finding.message.includes('examples')))
assert.ok(malformedOrientationFindings.some((finding) => finding.message.includes('memorization')))

assert.ok(
  validateOrientationMotivationStructure({
    id: 'legacy-orientation',
    tags: ['Motivation'],
    requires: ['detailed-prior-knowledge'],
    contains: [],
  }).some((finding) => finding.message.includes('prerequisite-free')),
  'explicit legacy motivation tags are checked when no semantic kind is available',
)

assert.deepEqual(
  validateOrientationMotivationStructure({
    id: 'authoritative-non-orientation',
    semanticKind: 'curricularAtomic',
    tags: ['Motivation', 'Orientation'],
    requires: ['ordinary-prerequisite'],
    contains: [],
  }),
  [],
  'an authoritative non-orientation semantic kind suppresses legacy tag fallback',
)

const goals: HardRouteGoal[] = [
  { id: 'orientation-seki', title: 'Orientation Sek I', requires: [], contains: [] },
  { id: 'orientation-sekii', title: 'Orientation Sek II', requires: [], contains: [] },
  { id: 'understand-a', title: 'Understand A', requires: ['orientation-seki'], contains: [] },
  { id: 'understand-b', title: 'Understand B', requires: ['understand-a'], contains: [] },
  { id: 'exam-seki', title: 'Exam Sek I', requires: ['understand-b'], contains: [] },
  { id: 'exam-folder-seki', title: 'Exam folder Sek I', requires: [], contains: ['exam-seki'] },
]

const kinds = new Map<string, HardRouteSemanticKind>([
  ['orientation-seki', 'orientation'],
  ['orientation-sekii', 'orientation'],
  ['understand-a', 'curricularAtomic'],
  ['understand-b', 'curricularAtomic'],
  ['exam-seki', 'practiceAssessment'],
  ['exam-folder-seki', 'practiceAssessment'],
])

const profile = {
  scopeLabel: 'fixture / Sek I',
  motivationAnchorGoalIds: ['orientation-seki'],
  terminalGoalClusterIds: ['exam-folder-seki'],
  goalSelector: (goal: HardRouteGoal) => ['understand-a', 'understand-b'].includes(goal.id),
}

assert.deepEqual(validateHardDirectAtomicRoutes(goals, kinds, profile), [])

const routeWithOptionalMemory: HardRouteGoal[] = [
  ...goals,
  { id: 'memory-a', title: 'Optional memory support', requires: ['understand-a'], contains: [] },
].map((goal) => (
  goal.id === 'understand-b' ? { ...goal, requires: ['memory-a'] } : goal
))
const optionalMemoryKinds = new Map(kinds)
optionalMemoryKinds.set('memory-a', 'memory')
assert.deepEqual(
  validateHardDirectAtomicRoutes(routeWithOptionalMemory, optionalMemoryKinds, profile),
  [],
  'a reviewed memory node may participate in a route without making memory mandatory in every route',
)

const withoutMotivationEdge = goals.map((goal) => (
  goal.id === 'understand-a' ? { ...goal, requires: [] } : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(withoutMotivationEdge, kinds, profile)
    .some((finding) => finding.goalId === 'understand-a' && finding.message.includes('motivation')),
  'a missing direct motivation route must fail hard',
)

const detachedTerminal = goals.map((goal) => (
  goal.id === 'exam-seki' ? { ...goal, requires: ['orientation-seki'] } : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(detachedTerminal, kinds, profile)
    .some((finding) => finding.goalId === 'understand-b' && finding.message.includes('terminal')),
  'a curricular goal without a forward terminal route must fail hard',
)

const terminalWithoutAnchor = goals.map((goal) => (
  goal.id === 'exam-seki' ? { ...goal, requires: [] } : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(terminalWithoutAnchor, kinds, profile)
    .some((finding) => finding.goalId === 'exam-seki'
      && finding.message.includes('no direct atomic path')),
  'every configured terminal must itself connect back to the stage orientation',
)

const throughClusterShortcut: HardRouteGoal[] = [
  ...goals,
  { id: 'orientation-wrapper', title: 'Orientation wrapper', requires: ['orientation-seki'], contains: ['orientation-seki'] },
].map((goal) => (
  goal.id === 'understand-a' ? { ...goal, requires: ['orientation-wrapper'] } : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(throughClusterShortcut, kinds, profile)
    .some((finding) => finding.goalId === 'understand-a' && finding.message.includes('motivation')),
  'cluster inheritance must not satisfy the direct atomic route gate',
)

const withAdditionalClusterShortcut: HardRouteGoal[] = [
  ...goals,
  { id: 'compatibility-cluster', title: 'Compatibility cluster', requires: [], contains: ['orientation-seki'] },
].map((goal) => (
  goal.id === 'understand-a'
    ? { ...goal, requires: ['orientation-seki', 'compatibility-cluster'] }
    : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(withAdditionalClusterShortcut, kinds, profile)
    .some((finding) => finding.goalId === 'understand-a'
      && finding.message.includes('non-route direct prerequisite')),
  'an additional valid edge must not hide a forbidden cluster prerequisite',
)

const wrongStageProfile = { ...profile, motivationAnchorGoalIds: ['orientation-sekii'] }
assert.ok(
  validateHardDirectAtomicRoutes(goals, kinds, wrongStageProfile)
    .some((finding) => finding.goalId === 'understand-a' && finding.message.includes('motivation')),
  'a Sek-II orientation must not satisfy a Sek-I route',
)

const crossStageShortcut: HardRouteGoal[] = [
  ...goals,
  { id: 'understand-sekii', title: 'Understand Sek II', requires: ['orientation-sekii'], contains: [] },
].map((goal) => (
  goal.id === 'understand-a' ? { ...goal, requires: ['understand-sekii'] } : goal
))
const crossStageKinds = new Map(kinds)
crossStageKinds.set('understand-sekii', 'curricularAtomic')
const stageBoundProfile = {
  ...profile,
  routeGoalSelector: (goal: HardRouteGoal) => goal.id !== 'orientation-sekii'
    && goal.id !== 'understand-sekii',
}
assert.ok(
  validateHardDirectAtomicRoutes(crossStageShortcut, crossStageKinds, stageBoundProfile)
    .some((finding) => finding.goalId === 'understand-a' && finding.message.includes('motivation')),
  'a route must not use another stage as proof for its motivation segment',
)

const wrongTerminalKinds = new Map(kinds)
wrongTerminalKinds.set('exam-seki', 'curricularAtomic')
assert.ok(
  validateHardDirectAtomicRoutes(goals, wrongTerminalKinds, profile)
    .some((finding) => finding.goalId === 'exam-seki' && finding.message.includes('practiceAssessment')),
  'a terminal without semanticKind=practiceAssessment must fail hard',
)

const throughRuntimeSupport: HardRouteGoal[] = [
  ...goals,
  { id: 'runtime-support', title: 'Runtime helper', requires: ['orientation-seki'], contains: [] },
].map((goal) => (
  goal.id === 'understand-a' ? { ...goal, requires: ['runtime-support'] } : goal
))
const runtimeSupportKinds = new Map(kinds)
runtimeSupportKinds.set('runtime-support', 'runtimeSupport')
assert.ok(
  validateHardDirectAtomicRoutes(throughRuntimeSupport, runtimeSupportKinds, profile)
    .some((finding) => finding.goalId === 'understand-a' && finding.message.includes('motivation')),
  'runtime support nodes must not prove a didactic route',
)

const assessmentBeforeUnderstanding: HardRouteGoal[] = [
  ...goals,
  { id: 'early-assessment', title: 'Premature assessment', requires: ['orientation-seki'], contains: [] },
].map((goal) => (
  goal.id === 'understand-a' ? { ...goal, requires: ['early-assessment'] } : goal
))
const earlyAssessmentKinds = new Map(kinds)
earlyAssessmentKinds.set('early-assessment', 'practiceAssessment')
assert.ok(
  validateHardDirectAtomicRoutes(assessmentBeforeUnderstanding, earlyAssessmentKinds, profile)
    .some((finding) => finding.goalId === 'understand-a'
      && finding.message.includes('Route order is reversed')),
  'an assessment goal must not be used as a prerequisite before curricular understanding',
)

const hiddenClusterOnParticipatingMemory: HardRouteGoal[] = [
  ...routeWithOptionalMemory,
  { id: 'memory-cluster', title: 'Memory compatibility cluster', requires: [], contains: ['memory-a'] },
].map((goal) => (
  goal.id === 'memory-a'
    ? { ...goal, requires: ['understand-a', 'memory-cluster'] }
    : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(hiddenClusterOnParticipatingMemory, optionalMemoryKinds, profile)
    .some((finding) => finding.goalId === 'memory-a'
      && finding.message.includes('non-route direct prerequisite')),
  'a participating memory goal must not hide an additional cluster prerequisite',
)

const memoryBeforeUnderstanding: HardRouteGoal[] = [
  ...goals,
  { id: 'memory-first', title: 'Memory before understanding', requires: ['orientation-seki'], contains: [] },
].map((goal) => (
  goal.id === 'understand-a' ? { ...goal, requires: ['memory-first'] } : goal
))
const memoryFirstKinds = new Map(kinds)
memoryFirstKinds.set('memory-first', 'memory')
assert.ok(
  validateHardDirectAtomicRoutes(memoryBeforeUnderstanding, memoryFirstKinds, profile)
    .some((finding) => finding.goalId === 'memory-first'
      && finding.message.includes('without following an ordinary curricular atomic goal')),
  'memory may support a route only after ordinary curricular understanding has begun',
)

const directExamAfterOrientation = goals.map((goal) => (
  goal.id === 'exam-seki' ? { ...goal, requires: ['orientation-seki'] } : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(directExamAfterOrientation, kinds, {
    ...profile,
    goalSelector: () => false,
  }).some((finding) => finding.goalId === 'exam-seki'
    && finding.message.includes('no route through an ordinary curricular atomic goal')),
  'every terminal route must pass through ordinary curricular learning',
)

const missingSelectedKind = new Map(kinds)
missingSelectedKind.delete('understand-a')
assert.ok(
  validateHardDirectAtomicRoutes(goals, missingSelectedKind, profile)
    .some((finding) => finding.goalId === 'understand-a'
      && finding.message.includes('semanticKind=curricularAtomic')),
  'an unclassified selected goal must not disappear from the hard route check',
)

const selectedGoalBecameCluster = goals.map((goal) => (
  goal.id === 'understand-a'
    ? { ...goal, contains: ['understand-b'] }
    : goal
))
assert.ok(
  validateHardDirectAtomicRoutes(selectedGoalBecameCluster, kinds, profile)
    .some((finding) => finding.goalId === 'understand-a'
      && finding.message.includes('must be atomic')),
  'a curricularAtomic ledger decision must not disappear from coverage when the goal acquires children',
)

console.log('Hard learning-route validation regression tests passed.')
