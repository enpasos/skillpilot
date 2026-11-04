import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import { collectRouteTerminalAutonomyGoals, terminalAutonomyGoalsForRouteScope, concreteExamReadinessIssues } from './generateCurriculumQualityStatus'
import { readFileSync } from 'node:fs'
import { bindCurricularReviewLandscape, isAuthoritativeCurricularReviewGoal } from './lib/curricularReviewPopulation'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import assert from 'node:assert/strict'
import {
  validateHardDirectAtomicRoutes,
  buildHardRouteProofGraph,
  type HardRouteProfile,
  hasHardRouteAssessmentRole,
  validateOrientationMotivationStructure,
  type HardRouteGoal,
  type HardRouteSemanticKind,
} from './lib/hardLearningRouteValidation'
import {
  validateOrientationOutlooks,
  type OrientationOutlookGoal,
} from './lib/orientationOutlookValidation'

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

type OrientationOutlookFixtureGoal = OrientationOutlookGoal & {
  stage: 'seki' | 'sekii'
}

const validOrientationOutlookGoals: OrientationOutlookFixtureGoal[] = [
  {
    id: 'orientation-outlook',
    title: 'Why this subject?',
    type: 'atomic',
    stage: 'seki',
    contains: [],
    requires: [],
    extendedData: {
      orientationOutlook: {
        paths: [
          {
            id: 'first-path',
            title: 'Erster Lernweg',
            titleEn: 'First learning path',
            learningOutlook: 'Du lernst den ersten Themenbereich kennen.',
            learningOutlookEn: 'You explore the first subject area.',
            practicalContexts: ['Erster Kontext'],
            practicalContextsEn: ['First context'],
            subtreeRootIds: ['cluster-a'],
            entryGoalIds: ['goal-a'],
            milestoneGoalIds: ['goal-a'],
          },
          {
            id: 'second-path',
            title: 'Zweiter Lernweg',
            titleEn: 'Second learning path',
            learningOutlook: 'Du lernst den zweiten Themenbereich kennen.',
            learningOutlookEn: 'You explore the second subject area.',
            practicalContexts: ['Zweiter Kontext'],
            practicalContextsEn: ['Second context'],
            subtreeRootIds: ['cluster-b'],
            entryGoalIds: ['goal-b'],
            milestoneGoalIds: ['goal-b'],
          },
        ],
      },
    },
  },
  { id: 'cluster-a', title: 'Fachlicher Bereich A', type: 'cluster', stage: 'seki', contains: ['goal-a'], requires: [] },
  { id: 'goal-a', title: 'Fachliches Ziel A', type: 'atomic', stage: 'seki', contains: [], requires: ['orientation-outlook'] },
  { id: 'cluster-b', title: 'Fachlicher Bereich B', type: 'cluster', stage: 'seki', contains: ['goal-b'], requires: [] },
  { id: 'goal-b', title: 'Fachliches Ziel B', type: 'atomic', stage: 'seki', contains: [], requires: ['orientation-outlook'] },
  { id: 'goal-detached', title: 'Detached goal', type: 'atomic', stage: 'seki', contains: [], requires: [] },
]

const validOrientationOutlookKinds = new Map<string, HardRouteSemanticKind>([
  ['orientation-outlook', 'orientation'],
  ['cluster-a', 'curricularArea'],
  ['goal-a', 'curricularAtomic'],
  ['cluster-b', 'curricularArea'],
  ['goal-b', 'curricularAtomic'],
  ['goal-detached', 'curricularAtomic'],
])

const sekiOrientationOutlookProfiles = [{
  orientationGoalId: 'orientation-outlook',
  scopeLabel: 'fixture / Sek I orientation outlook',
  stageGoalSelector: (goal: OrientationOutlookFixtureGoal) => goal.stage === 'seki',
}]

assert.deepEqual(
  validateOrientationOutlooks(
    validOrientationOutlookGoals,
    validOrientationOutlookKinds,
    sekiOrientationOutlookProfiles,
  ),
  [],
  'a bounded outlook with contained and directly reachable milestones is valid',
)

const invalidOrientationOutlookGoals = structuredClone(validOrientationOutlookGoals)
const invalidOutlook = invalidOrientationOutlookGoals[0]?.extendedData
  ?.orientationOutlook as { paths: Array<Record<string, unknown>> }
invalidOutlook.paths[0]!.title = 'Source-Extraction-Nachträge'
invalidOutlook.paths[0]!.subtreeRootIds = ['missing-cluster']
invalidOutlook.paths[0]!.entryGoalIds = ['goal-detached']
invalidOutlook.paths[0]!.milestoneGoalIds = ['goal-detached']

const invalidOrientationOutlookFindings = validateOrientationOutlooks(
  invalidOrientationOutlookGoals,
  validOrientationOutlookKinds,
  sekiOrientationOutlookProfiles,
)
assert.ok(
  invalidOrientationOutlookFindings.some((finding) => finding.message.includes('Source-Extraction')),
  'internal Source-Extraction labels must never become learner-facing outlook strands',
)
assert.ok(
  invalidOrientationOutlookFindings.some((finding) => finding.message.includes('Unknown subtree root')),
  'unknown subtree roots must fail hard',
)
assert.ok(
  invalidOrientationOutlookFindings.some((finding) => finding.message.includes('not contained')),
  'entries and milestones outside the authored path subtree must fail hard',
)
assert.ok(
  invalidOrientationOutlookFindings.some((finding) => finding.message.includes('not reachable')),
  'milestones without a direct requires route from the orientation anchor must fail hard',
)

const wrongAnchorKinds = new Map(validOrientationOutlookKinds)
wrongAnchorKinds.set('orientation-outlook', 'curricularAtomic')
assert.ok(
  validateOrientationOutlooks(
    validOrientationOutlookGoals,
    wrongAnchorKinds,
    sekiOrientationOutlookProfiles,
  ).some((finding) => finding.message.includes('semanticKind=orientation')),
  'the outlook anchor must be authoritatively classified as orientation',
)

const wrongRootKinds = new Map(validOrientationOutlookKinds)
wrongRootKinds.set('cluster-a', 'programStructure')
assert.ok(
  validateOrientationOutlooks(
    validOrientationOutlookGoals,
    wrongRootKinds,
    sekiOrientationOutlookProfiles,
  ).some((finding) => finding.message.includes('semanticKind=curricularArea')),
  'an outlook subtree root must be a curricularArea rather than a structural cluster',
)

for (const wrongMilestoneKind of [
  'orientation',
  'memory',
  'practiceAssessment',
  'runtimeSupport',
] as const) {
  const wrongMilestoneKinds = new Map(validOrientationOutlookKinds)
  wrongMilestoneKinds.set('goal-a', wrongMilestoneKind)
  assert.ok(
    validateOrientationOutlooks(
      validOrientationOutlookGoals,
      wrongMilestoneKinds,
      sekiOrientationOutlookProfiles,
    ).some((finding) => finding.message.includes('semanticKind=curricularAtomic')),
    `an outlook milestone must reject semanticKind=${wrongMilestoneKind}`,
  )
}

for (const wrongEntryKind of [
  'orientation',
  'memory',
  'practiceAssessment',
  'runtimeSupport',
] as const) {
  const wrongEntryKinds = new Map(validOrientationOutlookKinds)
  wrongEntryKinds.set('goal-a', wrongEntryKind)
  assert.ok(
    validateOrientationOutlooks(
      validOrientationOutlookGoals,
      wrongEntryKinds,
      sekiOrientationOutlookProfiles,
    ).some((finding) => finding.message.includes(
      'Entry goal goal-a must have authoritative semanticKind=curricularAtomic',
    )),
    `an orientation path entry must reject semanticKind=${wrongEntryKind}`,
  )
}

const clusterShortcutGoals = structuredClone(validOrientationOutlookGoals)
clusterShortcutGoals.find((goal) => goal.id === 'cluster-a')!.requires = ['orientation-outlook']
clusterShortcutGoals.find((goal) => goal.id === 'goal-a')!.requires = ['cluster-a']
assert.ok(
  validateOrientationOutlooks(
    clusterShortcutGoals,
    validOrientationOutlookKinds,
    sekiOrientationOutlookProfiles,
  ).some((finding) => finding.message.includes('Milestone goal-a is not reachable')),
  'cluster requires and contains membership must not prove an atomic didactic route',
)

const containsOnlyGoals = structuredClone(validOrientationOutlookGoals)
containsOnlyGoals.find((goal) => goal.id === 'goal-a')!.requires = []
assert.ok(
  validateOrientationOutlooks(
    containsOnlyGoals,
    validOrientationOutlookKinds,
    sekiOrientationOutlookProfiles,
  ).some((finding) => finding.message.includes('Milestone goal-a is not reachable')),
  'contains membership alone must never prove downstream sequencing',
)

const crossStageGoals = structuredClone(validOrientationOutlookGoals)
crossStageGoals.find((goal) => goal.id === 'goal-a')!.stage = 'sekii'
const crossStageFindings = validateOrientationOutlooks(
  crossStageGoals,
  validOrientationOutlookKinds,
  sekiOrientationOutlookProfiles,
)
assert.ok(
  crossStageFindings.some((finding) => finding.message.includes('Milestone goal-a is outside the explicit stage scope')),
  'a milestone from another stage must fail the explicit stage boundary',
)
assert.ok(
  crossStageFindings.some((finding) => finding.message.includes('Milestone goal-a is not reachable')),
  'a direct requires edge must not bridge an orientation outlook into another stage',
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

const productionLikeProfile = {
  ...profile,
  terminalGoalSelector: (goal: HardRouteGoal) => hasHardRouteAssessmentRole(goal, kinds.get(goal.id)),
}
assert.deepEqual(
  validateHardDirectAtomicRoutes(goals, kinds, productionLikeProfile),
  [],
  'the production selector must select the assessment leaf without treating its practiceAssessment folder as a terminal',
)
assert.ok(
  validateHardDirectAtomicRoutes(goals.map((goal) => (
    goal.id === 'exam-seki' ? { ...goal, requires: [] } : goal
  )), kinds, productionLikeProfile).some((finding) => finding.goalId === 'exam-seki'
    && finding.message.includes('no direct atomic path')),
  'excluding an implicit folder must preserve the selected assessment leaf prerequisite-route check',
)
assert.ok(
  validateHardDirectAtomicRoutes(goals.map((goal) => (
    goal.id === 'exam-folder-seki' ? { ...goal, contains: ['exam-seki', 'understand-b'] } : goal
  )), kinds, productionLikeProfile).some((finding) => finding.goalId === 'understand-b'
    && finding.message.includes('Terminal goal must be an in-scope atomic assessment')),
  'explicit folder descendants still require assessment roles even when the implicit selector excludes folders',
)


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

// An assessment execution form can assess the same authoritative curricular atom.
const curricularExam = { id: 'curricular-exam', nodeKind: 'exam', contains: [], requires: ['understand-b'],
  examData: { taskContent: '1. Solve.', solutionContent: 'Complete solution.', reviewStatus: 'released',
    scoring: { maxPoints: 2, passingPoints: 1, steps: [{ id: 'a', points: 2, description: 'Solve.' }] } } }
const sameIdentityGoals = [...goals.filter(g => !g.id.startsWith('exam-')), curricularExam]
const sameIdentityKinds = new Map(kinds).set('curricular-exam', 'curricularAtomic')
const sameIdentityProfile = { ...profile, terminalGoalClusterIds: [],
  goalSelector: (g: HardRouteGoal) => ['understand-a', 'understand-b', 'curricular-exam'].includes(g.id),
  terminalGoalSelector: (g: HardRouteGoal) => g.nodeKind === 'exam' || g.examData != null }
assert.deepEqual(validateHardDirectAtomicRoutes(sameIdentityGoals, sameIdentityKinds, sameIdentityProfile), [])
assert.ok(validateHardDirectAtomicRoutes(sameIdentityGoals.map(g => g.id === curricularExam.id
  ? { ...g, nodeKind: undefined, examData: undefined, title: 'Exam in the title' } : g), sameIdentityKinds, sameIdentityProfile)
  .some(f => f.message.includes('No atomic terminal')), 'an ordinary endpoint/title is not a terminal')
assert.ok(validateHardDirectAtomicRoutes(sameIdentityGoals, sameIdentityKinds, { ...sameIdentityProfile,
  routeGoalSelector: g => g.id !== curricularExam.id }).some(f => f.message.includes('terminal')),
  'an out-of-scope assessment cannot close this scope')
assert.ok(validateHardDirectAtomicRoutes(sameIdentityGoals.filter(g => !g.id.startsWith('understand-'))
  .map(g => g.id === curricularExam.id ? { ...g, requires: ['orientation-seki'] } : g), sameIdentityKinds,
  { ...sameIdentityProfile, goalSelector: g => g.id === curricularExam.id })
  .some(f => f.message.includes('ordinary curricular')), 'zero-length self-reach is not ordinary preparation')
assert.ok(validateHardDirectAtomicRoutes(sameIdentityGoals.map(g => g.id === 'understand-a'
  ? { ...g, requires: [] } : g), sameIdentityKinds, sameIdentityProfile)
  .some(f => f.message.includes('motivation')), 'motivation remains necessary')
const earlyCurricularAssessmentKinds = new Map(earlyAssessmentKinds).set('early-assessment', 'curricularAtomic')
const earlyCurricularAssessmentGoals = assessmentBeforeUnderstanding.map(g => g.id === 'early-assessment'
  ? { ...g, nodeKind: 'exam', examData: curricularExam.examData } : g)
for (const sourceHasAssessment of [false, true]) {
  const sameRankGoals = earlyCurricularAssessmentGoals.map(g => sourceHasAssessment && g.id === 'understand-a'
    ? { ...g, nodeKind: 'exam', examData: curricularExam.examData } : g)
  assert.ok(!validateHardDirectAtomicRoutes(sameRankGoals, earlyCurricularAssessmentKinds, profile)
    .some(f => f.message.includes('Route order is reversed')),
    'authoritative curricularAtomic rank permits ordinary or whole-form curricular prerequisites')
}
const wholeFormBeforePureAssessment = assessmentBeforeUnderstanding.map(g => g.id === 'understand-a'
  ? { ...g, nodeKind: 'exam', examData: curricularExam.examData } : g)
assert.ok(validateHardDirectAtomicRoutes(wholeFormBeforePureAssessment, earlyAssessmentKinds, profile)
  .some(f => f.goalId === 'understand-a' && f.message.includes('Route order is reversed')
    && f.message.includes('early-assessment')),
  'a curricular whole-form goal retains rank1 and cannot require a pure practiceAssessment of rank2')

// Test the existing strict schema+fingerprint ledger parser on whole real input,
// with transient copies only. No stale evidence or changed counts are accepted.
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const raw = JSON.parse(readFileSync(new URL('../../'+canonicalPath, import.meta.url), 'utf8'))
const ledger = JSON.parse(readFileSync(new URL('../../curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json', import.meta.url), 'utf8'))
const targetId = '5743b8f9-86cb-4e24-8859-351708d070ab'
const edited = structuredClone(raw)
const goal = edited.goals.find((g: {id: string}) => g.id === targetId)
Object.assign(goal, { nodeKind: 'exam', examData: curricularExam.examData })
// Use the actual current closed-schema ledger without rewriting decision bases.
const freshLedger = structuredClone(ledger)
freshLedger.decisions.find((d: {goalId: string}) => d.goalId === targetId).sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
const bound = bindCurricularReviewLandscape(edited, freshLedger, canonicalPath)
assert.equal(isAuthoritativeCurricularReviewGoal(bound.goals.find(g => g.id === targetId)!), true)
assert.equal(bound.goals.filter(g => isAuthoritativeCurricularReviewGoal(g)).length, ledger.counts.curricularAtomic,
  'the complete curricular denominator is preserved exactly')
const staleLedger = structuredClone(freshLedger)
staleLedger.decisions.find((d: {goalId: string}) => d.goalId === targetId).sourceFingerprint = ledger.decisions.find((d: {goalId: string}) => d.goalId === targetId).sourceFingerprint
assert.throws(() => bindCurricularReviewLandscape(edited, staleLedger, canonicalPath), /stale semantic-kind decision/)
assert.throws(() => bindCurricularReviewLandscape(edited, { ...freshLedger, counts: { ...freshLedger.counts, curricularAtomic: 0 } }, canonicalPath), /count/)
assert.equal(isAuthoritativeCurricularReviewGoal(bound.goals.find(g => g.semanticKind === 'practiceAssessment')!), false)
assert.equal(isAuthoritativeCurricularReviewGoal(bound.goals.find(g => g.semanticKind === 'orientation')!), false)
assert.equal(isAuthoritativeCurricularReviewGoal(bound.goals.find(g => g.semanticKind === 'memory')!), false)
assert.equal(isAuthoritativeCurricularReviewGoal({ ...goal, semanticKind: undefined }), undefined,
  'the existing legacy selector remains in charge without an authoritative decision')
console.log('Same-identity curricular assessment route and population regressions passed.')

assert.ok(validateHardDirectAtomicRoutes(sameIdentityGoals.map(g => g.id === curricularExam.id
  ? { ...g, examData: { ...curricularExam.examData, solutionContent: '' } } : g), sameIdentityKinds, sameIdentityProfile)
  .some(f => f.message.includes('task/rubric metadata')), 'missing actual task metadata stays invalid')

const invalidBasis = structuredClone(freshLedger)
invalidBasis.decisions[0].decisionBasis = 'arbitrary-unreviewed-basis'
assert.throws(() => bindCurricularReviewLandscape(edited, invalidBasis, canonicalPath), /closed JSON Schema/)

assert.equal(isAuthoritativeCurricularReviewGoal({ ...goal, semanticKind: 'curricularAtomic' }), undefined, 'unverified raw semanticKind cannot override a legacy review selector')

// The actual CQS global/scoped consumer sees the same competency as a terminal,
// while retaining the old duration-folder contract and all curricular members.
const cqsProfile = {
  terminalAutonomyClusterIds: [],
  terminalAutonomyClusterIdsByDurationModel: { G8: [], G9: [] },
  goalSelector: (g: {id: string}) => g.id === targetId,
}
const cqsTerminals = collectRouteTerminalAutonomyGoals(bound, cqsProfile)
assert.deepEqual(cqsTerminals.map(g => g.id), [targetId])
assert.equal(bound.goals.find(g => g.id === targetId)!.semanticKind, 'curricularAtomic')
const cqsMap = new Map(bound.goals.map(g => [g.id, g]))
for (const durationModel of ['G8', 'G9']) {
  assert.deepEqual(terminalAutonomyGoalsForRouteScope(cqsMap, cqsProfile as any, {durationModel}, cqsTerminals,
    new Set([targetId])).map(g => g.id), [targetId], 'a same-ID target remains an endpoint outside the old exam folders')
  assert.deepEqual(terminalAutonomyGoalsForRouteScope(cqsMap, cqsProfile as any, {durationModel}, cqsTerminals,
    new Set()), [], 'prerequisite-only or absent curricular assessment does not import a new obligation')
}
const ordinaryRaw = structuredClone(raw)
const ordinaryGoal = ordinaryRaw.goals.find((g: any) => g.id === targetId)!
delete ordinaryGoal.nodeKind
delete ordinaryGoal.examData
const ordinaryBound = bindCurricularReviewLandscape(ordinaryRaw, { ...freshLedger, decisions: freshLedger.decisions.map((d: any) =>
  d.goalId === targetId ? { ...d, sourceFingerprint: fingerprintSemanticKindSourceGoal(ordinaryGoal) } : d) }, canonicalPath)
assert.deepEqual(collectRouteTerminalAutonomyGoals(ordinaryBound, cqsProfile), [], 'an ordinary endpoint is not a CQS assessment terminal')
const cqsTask = bound.goals.find(g => g.id === targetId)!
assert.deepEqual(concreteExamReadinessIssues(cqsTask), [])
const unready = { ...cqsTask, examData: { ...cqsTask.examData!, solutionContent: '' } }
assert.ok(concreteExamReadinessIssues(unready).includes('missing solutionContent'), 'selection cannot suppress the real task/rubric gate')
console.log('CQS same-ID global/scoped terminal and unready-task regressions passed.')

const scopedPOnlyRoles = collectCompositionProjectionRoleGoalIds([{kind: 'goalEntry', goalId: targetId, projectionRole: 'prerequisiteOnly'}], cqsMap)
assert.ok(scopedPOnlyRoles.prerequisiteOnlyGoalIds.has(targetId))
assert.deepEqual(terminalAutonomyGoalsForRouteScope(cqsMap, cqsProfile as any, {durationModel:'G8'}, cqsTerminals, scopedPOnlyRoles.targetGoalIds), [])
const absentRoles = collectCompositionProjectionRoleGoalIds([{kind: 'goalEntry', goalId: '546bf0b3-6921-416b-a2ef-8fd37d429dc7'}], cqsMap)
assert.deepEqual(terminalAutonomyGoalsForRouteScope(cqsMap, cqsProfile as any, {durationModel:'G9'}, cqsTerminals, absentRoles.targetGoalIds), [])
const actualParent = bound.goals.find(g => g.contains?.includes(targetId))!
assert.equal(collectRouteTerminalAutonomyGoals(bound, {...cqsProfile, terminalAutonomyClusterIds:[actualParent.id]}).filter(g => g.id===targetId).length, 1)
const unreadyRaw = structuredClone(edited)
unreadyRaw.goals.find((g: any) => g.id===targetId).examData.solutionContent = ''
const unreadyLedger = structuredClone(freshLedger)
unreadyLedger.decisions.find((d: any) => d.goalId===targetId).sourceFingerprint = fingerprintSemanticKindSourceGoal(unreadyRaw.goals.find((g: any) => g.id===targetId))
const unreadyBound = bindCurricularReviewLandscape(unreadyRaw, unreadyLedger, canonicalPath)
const stillChecked = collectRouteTerminalAutonomyGoals(unreadyBound, cqsProfile)
assert.deepEqual(stillChecked.map(g => g.id), [targetId], 'an unready task stays in QA instead of disappearing')
assert.ok(concreteExamReadinessIssues(stillChecked[0]).includes('missing solutionContent'))

const legacyParent = bound.goals.find(g => g.contains?.some(id => cqsMap.get(id)?.semanticKind==='practiceAssessment'))!
const legacyIds = (legacyParent.contains ?? []).filter(id => !cqsMap.get(id)?.contains?.length && cqsMap.get(id)?.nodeKind!=='memory')
const durationProfile = {...cqsProfile, terminalAutonomyClusterIds:[legacyParent.id], terminalAutonomyClusterIdsByDurationModel:{G8:[legacyParent.id],G9:[]}}
const mixedTerminals = collectRouteTerminalAutonomyGoals(bound, durationProfile)
const durationG8 = terminalAutonomyGoalsForRouteScope(cqsMap, durationProfile as any, {durationModel:'G8'}, mixedTerminals, new Set([targetId])).map(g=>g.id)
assert.ok(durationG8.includes(targetId))
for (const id of legacyIds) assert.ok(durationG8.includes(id), 'legacy G8 terminal inventory retained '+id)
assert.deepEqual(terminalAutonomyGoalsForRouteScope(cqsMap, durationProfile as any, {durationModel:'G9'}, mixedTerminals, new Set([targetId])).map(g=>g.id), [targetId], 'legacy per-duration narrowing stays exact')
assert.deepEqual(collectRouteTerminalAutonomyGoals(bound, {...cqsProfile, goalSelector:()=>false}), [], 'no assessment crosses the selected global stage/profile')

// Directed prior-stage preparation changes the incoming proof only. These are
// the 16 independently proposed topology cases, with productive kind/role guards
// exercised separately below. There is no goal-ID exception in the implementation.
type StageFixtureGoal = HardRouteGoal & { stages: string[] }
const stageFixtures = (requirements: Record<string, string[]>): StageFixtureGoal[] =>
  ['a1', 'p1', 'q1', 'e1', 'a2', 'p2', 'q2', 'g2', 'e2', 'f3'].map((id) => ({
    id, stages: [id.endsWith('1') ? 'prior' : id.endsWith('2') ? 'current' : 'future'],
    contains: [], requires: requirements[id] ?? [],
    ...(id.startsWith('e') ? { nodeKind: 'exam', examData: curricularExam.examData } : {}),
  }))
const stageKinds = new Map<string, HardRouteSemanticKind>(stageFixtures({}).map((goal) => [goal.id,
  goal.id.startsWith('a') ? 'orientation' : goal.id.startsWith('e') ? 'practiceAssessment' : 'curricularAtomic']))
const currentStageProfile: HardRouteProfile<StageFixtureGoal> = {
  scopeLabel: 'fixture / directed Sek II preparation', motivationAnchorGoalIds: ['a2'],
  terminalGoalClusterIds: [], terminalGoalSelector: (goal) => goal.nodeKind === 'exam',
  routeGoalSelector: (goal) => goal.stages.includes('current'), goalSelector: (goal) => goal.id === 'g2',
  priorStagePreparation: { motivationAnchorGoalIds: ['a1'], routeGoalSelector: (goal) => goal.stages.includes('prior') },
}
const earlierStageProfile: HardRouteProfile<StageFixtureGoal> = {
  ...currentStageProfile, motivationAnchorGoalIds: ['a1'], priorStagePreparation: undefined,
  routeGoalSelector: (goal) => goal.stages.includes('prior') && !goal.stages.includes('current'),
  goalSelector: (goal) => goal.id === 'p1',
}
const directedPreparationCases: Array<{ name: string; requires: Record<string, string[]>;
  preparation: boolean; terminal: boolean; full: boolean; earlier?: boolean }> = [
  {"name": "unchanged same-stage route","requires": {"g2": ["p2"],"p2": ["a2"],"e2": ["g2"]},"preparation": true,"terminal": true,"full": true},
  {"name": "genuine earlier basis then own terminal","requires": {"g2": ["p1"],"p1": ["a1"],"e2": ["g2"]},"preparation": true,"terminal": true,"full": true,"earlier": true},
  {"name": "earlier preparation via current content","requires": {"g2": ["p2"],"p2": ["p1"],"p1": ["a1"],"e2": ["q2"],"q2": ["g2"]},"preparation": true,"terminal": true,"full": true},
  {"name": "preparation missing entirely","requires": {"e2": ["g2"]},"preparation": false,"terminal": true,"full": false},
  {"name": "earlier component lacks anchor","requires": {"g2": ["p1"],"e2": ["g2"]},"preparation": false,"terminal": true,"full": false,"earlier": false},
  {"name": "mere direct foreign motivation edge is no earlier content basis","requires": {"g2": ["a1"],"e2": ["g2"]},"preparation": false,"terminal": true,"full": false},
  {"name": "future preparation detour","requires": {"g2": ["f3"],"f3": ["p1"],"p1": ["a1"],"e2": ["g2"]},"preparation": false,"terminal": true,"full": false},
  {"name": "earlier-to-later-to-earlier bounce","requires": {"g2": ["p1"],"p1": ["p2"],"p2": ["q1"],"q1": ["a1"],"e2": ["g2"]},"preparation": false,"terminal": true,"full": false,"earlier": false},
  {"name": "earlier-to-later anchor bounce","requires": {"g2": ["p1"],"p1": ["a2"],"e2": ["g2"]},"preparation": false,"terminal": true,"full": false,"earlier": false},
  {"name": "own-stage terminal absent","requires": {"g2": ["p1"],"p1": ["a1"]},"preparation": true,"terminal": false,"full": false},
  {"name": "earlier assessment cannot stand in for current terminal","requires": {"g2": ["p1"],"p1": ["a1"],"e1": ["g2"]},"preparation": true,"terminal": false,"full": false},
  {"name": "terminal segment cannot use earlier bridge","requires": {"g2": ["p1"],"p1": ["a1"],"e2": ["q1"],"q1": ["g2"]},"preparation": true,"terminal": false,"full": false},
  {"name": "terminal segment cannot use future bridge","requires": {"g2": ["p1"],"p1": ["a1"],"e2": ["f3"],"f3": ["g2"]},"preparation": true,"terminal": false,"full": false},
  {"name": "reversed terminal edge does not prove completion","requires": {"g2": ["p1","e2"],"p1": ["a1"]},"preparation": true,"terminal": false,"full": false},
  {"name": "earlier-profile cannot be rescued by later stage","requires": {"p1": ["p2"],"p2": ["a1"],"g2": ["a2"],"e2": ["g2"]},"preparation": true,"terminal": true,"full": true,"earlier": false},
  {"name": "valid branch plus invalid branch does not legitimize invalid branch","requires": {"g2": ["p1","f3"],"p1": ["a1"],"f3": ["a2"],"e2": ["g2"]},"preparation": true,"terminal": true,"full": true,"earlier": true},
]
assert.equal(directedPreparationCases.length, 16)
for (const testCase of directedPreparationCases) {
  const fixtureGoals = stageFixtures(testCase.requires)
  const proof = buildHardRouteProofGraph(fixtureGoals, stageKinds, currentStageProfile)
  const findings = validateHardDirectAtomicRoutes(fixtureGoals, stageKinds, currentStageProfile)
  const missing = findings.filter((finding) => finding.goalId === 'g2' && finding.message.includes('missing direct atomic'))
  assert.equal(proof.hasPreparationPath('g2'), testCase.preparation, testCase.name)
  assert.equal(proof.hasEffectiveMotivationPath('g2', new Map(fixtureGoals.map((goal) => [goal.id, goal.requires ?? []]))),
    testCase.preparation, `GVR011 uses the same directed alternative: ${testCase.name}`)
  assert.equal(!missing.some((finding) => finding.message.includes('motivation')), testCase.preparation, testCase.name)
  assert.equal(!missing.some((finding) => finding.message.includes('terminal')), testCase.terminal, testCase.name)
  assert.equal(missing.length === 0, testCase.full, testCase.name)
  if (testCase.earlier !== undefined) {
    assert.equal(buildHardRouteProofGraph(fixtureGoals, stageKinds, earlierStageProfile).hasPreparationPath('p1'),
      testCase.earlier, `Sek I remains independent: ${testCase.name}`)
  }
}

const validEarlierRequirements = { g2: ['p1'], p1: ['a1'], e2: ['g2'] }
const earlierGoals = stageFixtures(validEarlierRequirements)
assert.deepEqual(validateHardDirectAtomicRoutes(earlierGoals, stageKinds, currentStageProfile), [])
const effectiveOnlyGoals = stageFixtures({ e2: ['g2'] })
const inheritedEarlierEdges = new Map([['g2', ['p1']], ['p1', ['a1']]])
assert.equal(buildHardRouteProofGraph(effectiveOnlyGoals, stageKinds, currentStageProfile)
  .hasEffectiveMotivationPath('g2', inheritedEarlierEdges), false,
'an effective/inherited earlier-stage shortcut cannot replace direct preparation')
assert.equal(buildHardRouteProofGraph(effectiveOnlyGoals, stageKinds, currentStageProfile)
  .hasEffectiveMotivationPath('g2', new Map([['g2', ['p2']], ['p2', ['a2']]])), true,
'GVR011 retains its weaker effective compatibility lane entirely within the current stage')
assert.equal(buildHardRouteProofGraph(effectiveOnlyGoals, stageKinds, currentStageProfile)
  .hasEffectiveMotivationPath('g2', new Map([['g2', ['p1']], ['p1', ['a2']]])), false,
'GVR011 cannot leave and reenter the current stage through effective edges')

for (const stages of [[], ['prior', 'current'], ['future']]) {
  const ambiguousBridge = earlierGoals.map((goal) => goal.id === 'p1' ? { ...goal, stages } : goal)
  assert.equal(buildHardRouteProofGraph(ambiguousBridge, stageKinds, currentStageProfile).hasPreparationPath('g2'), false,
    `an unresolved or overlapping preparation membership cannot prove a route: ${stages}`)
  assert.ok(validateHardDirectAtomicRoutes(earlierGoals.map((goal) => goal.id === 'e2' ? { ...goal, stages } : goal),
    stageKinds, currentStageProfile).some((finding) => finding.goalId === 'g2' && finding.message.includes('terminal')),
    'an unresolved or overlapping terminal cannot close the current-stage route')
}
for (const anchorId of ['a1', 'a2']) {
  const ambiguousAnchor = earlierGoals.map((goal) => goal.id === anchorId ? { ...goal, stages: ['prior', 'current'] } : goal)
  assert.ok(validateHardDirectAtomicRoutes(ambiguousAnchor, stageKinds, currentStageProfile)
    .some((finding) => finding.goalId === anchorId && finding.message.includes('Motivation anchor must')))
}
for (const invalidAnchor of [
  { requires: ['p1'] }, { contains: ['p1'] },
]) {
  assert.ok(validateHardDirectAtomicRoutes(earlierGoals.map((goal) => goal.id === 'a1' ? { ...goal, ...invalidAnchor } : goal),
    stageKinds, currentStageProfile).some((finding) => finding.goalId === 'a1' && finding.message.includes('Motivation anchor must')),
    'the earlier orientation remains an atomic prerequisite-free anchor')
}
assert.ok(validateHardDirectAtomicRoutes(earlierGoals, new Map(stageKinds).set('a1', 'curricularAtomic'), currentStageProfile)
  .some((finding) => finding.goalId === 'a1' && finding.message.includes('semanticKind=orientation')))
assert.ok(validateHardDirectAtomicRoutes(earlierGoals.filter((goal) => goal.id !== 'a1'), stageKinds, currentStageProfile)
  .some((finding) => finding.goalId === 'a1' && finding.message.includes('Missing motivation anchor')))
for (const earlierKind of ['memory', 'practiceAssessment'] as const) {
  assert.equal(buildHardRouteProofGraph(earlierGoals, new Map(stageKinds).set('p1', earlierKind), currentStageProfile)
    .hasPreparationPath('g2'), false, 'an earlier memory/assessment alone is not ordinary curricular preparation')
}
const earlierAssessment = earlierGoals.map((goal) => goal.id === 'p1'
  ? { ...goal, nodeKind: 'exam', examData: curricularExam.examData } : goal)
assert.equal(buildHardRouteProofGraph(earlierAssessment, stageKinds, currentStageProfile).hasPreparationPath('g2'), false,
  'a same-identity curricular assessment cannot substitute for ordinary earlier preparation')

const withBadPriorRequirement: StageFixtureGoal[] = [
  ...stageFixtures({ ...validEarlierRequirements, p1: ['a1', 'bad-cluster'] }),
  { id: 'bad-cluster', stages: ['prior'], contains: ['q1'], requires: [] },
]
assert.ok(validateHardDirectAtomicRoutes(withBadPriorRequirement, new Map(stageKinds).set('bad-cluster', 'curricularArea'), currentStageProfile)
  .some((finding) => finding.goalId === 'p1' && finding.message.includes('non-route direct prerequisite')),
  'a valid earlier path does not hide a cluster requirement on a participating preparation node')
assert.ok(validateHardDirectAtomicRoutes(stageFixtures({ ...validEarlierRequirements, g2: ['p1', 'e1'] }), stageKinds, currentStageProfile)
  .some((finding) => finding.goalId === 'g2' && finding.message.includes('Route order is reversed')),
  'a valid earlier branch does not hide a reversed assessment prerequisite')
assert.ok(validateHardDirectAtomicRoutes(earlierGoals.map((goal) => goal.id === 'e2'
  ? { ...goal, examData: { ...curricularExam.examData, solutionContent: '' } } : goal), stageKinds, currentStageProfile)
  .some((finding) => finding.goalId === 'e2' && finding.message.includes('task/rubric metadata')),
  'earlier preparation does not waive terminal task/rubric readiness')
const memoryStageKinds = new Map(stageKinds).set('m1', 'memory').set('m2', 'memory')
const withEarlierMemory: StageFixtureGoal[] = [
  ...stageFixtures({ ...validEarlierRequirements, g2: ['m2'] }),
  { id: 'm2', stages: ['current'], requires: ['m1'], contains: [] },
  { id: 'm1', stages: ['prior'], requires: ['p1'], contains: [] },
]
assert.deepEqual(validateHardDirectAtomicRoutes(withEarlierMemory, memoryStageKinds, currentStageProfile), [],
  'ordinary prior preparation may precede optional memory on the directed preparation route')
const earlyPriorMemory: StageFixtureGoal[] = [
  ...stageFixtures({ ...validEarlierRequirements, p1: ['m1'] }),
  { id: 'm1', stages: ['prior'], requires: ['a1'], contains: [] },
]
assert.ok(validateHardDirectAtomicRoutes(earlyPriorMemory, memoryStageKinds, currentStageProfile)
  .some((finding) => finding.goalId === 'm1' && finding.message.includes('without following an ordinary curricular')),
  'a participating earlier memory node still needs ordinary preparation before it')
assert.ok(validateHardDirectAtomicRoutes(stageFixtures({ e2: ['p1'], p1: ['a1'] }), stageKinds,
  { ...currentStageProfile, goalSelector: () => false }).some((finding) => finding.goalId === 'e2'
    && finding.message.includes('ordinary curricular')), 'prior ordinary preparation does not replace current-stage terminal content')

// Real reviewed whole competencies retain their exact authored preparation;
// terminal population remains entirely Sek II.
const actualSek1 = (goal: any) => goal.id === '65365dce-f33f-49d8-9516-42f75883aa86'
  || goal.tags?.includes('phase:SekI') || /^J(?:[5-9]|10)$/.test(goal.dimensionTags?.phase ?? '')
  || (goal.dimensionTags?.topicCode ?? '').includes('SEK1')
const actualSek2 = (goal: any) => goal.id === '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'
  || goal.tags?.includes('phase:SekII') || ['E', 'Q1', 'Q2', 'Q3', 'Q4'].includes(goal.dimensionTags?.phase)
  || (goal.dimensionTags?.topicCode ?? '').includes('SEK2')
const realPriorPreparationProfile: HardRouteProfile<HardRouteGoal> = {
  scopeLabel: 'real unchanged Sek II competencies', motivationAnchorGoalIds: ['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'],
  terminalGoalClusterIds: [], routeGoalSelector: actualSek2,
  priorStagePreparation: { motivationAnchorGoalIds: ['65365dce-f33f-49d8-9516-42f75883aa86'], routeGoalSelector: actualSek1 },
  goalSelector: (goal) => ['71f62cfa-7cc2-5f60-9691-bcdc2ee910df', '9f9c7ece-b81c-55fa-8073-dd816d7d4778'].includes(goal.id),
  terminalGoalSelector: (goal) => hasHardRouteAssessmentRole(goal, rawKinds.get(goal.id)),
}
const rawKinds = new Map<string, HardRouteSemanticKind>(ledger.decisions.map((decision: any) => [decision.goalId, decision.semanticKind]))
const realPreparationProof = buildHardRouteProofGraph(raw.goals, rawKinds, realPriorPreparationProfile)
for (const goalId of ['71f62cfa-7cc2-5f60-9691-bcdc2ee910df', '9f9c7ece-b81c-55fa-8073-dd816d7d4778']) {
  assert.equal(realPreparationProof.hasPreparationPath(goalId), true, goalId)
  assert.equal(buildHardRouteProofGraph(raw.goals, rawKinds, { ...realPriorPreparationProfile, priorStagePreparation: undefined })
    .hasPreparationPath(goalId), false, 'the legitimate earlier basis has no invented Sek II anchor edge')
  assert.ok(!validateHardDirectAtomicRoutes(raw.goals, rawKinds, realPriorPreparationProfile)
    .some((finding) => finding.goalId === goalId && finding.message.includes('missing direct atomic')), goalId)
}
console.log('Directed prior-stage preparation: all 16 topology cases, guard regressions and two real whole goals passed.')

// A good witness cannot waive a reversed edge excluded from that witness.
// Each variant retains genuine current/prior preparation and independent
// current-stage terminal routes, so a missing route cannot mask the edge guard.
for (const excludedAssessmentStages of [['current'], ['future'], ['prior', 'current']]) {
  const branchGoals: StageFixtureGoal[] = [
    ...stageFixtures({ g2: ['p1'], p1: ['a1', 'x-assessment'], q2: ['a2'], e2: ['g2'], e1: ['p1'] })
      .filter((goal) => ['a1', 'a2', 'p1', 'g2', 'q2', 'e1', 'e2'].includes(goal.id)),
    { id: 'parallel-terminal', stages: ['current'], contains: [], requires: ['q2'],
      nodeKind: 'exam', examData: curricularExam.examData },
    { id: 'x-assessment', stages: excludedAssessmentStages, contains: [], requires: ['q2'],
      nodeKind: 'exam', examData: curricularExam.examData },
  ]
  const branchKinds = new Map(stageKinds).set('parallel-terminal', 'practiceAssessment').set('x-assessment', 'practiceAssessment')
  const branchCurrentProfile = { ...currentStageProfile,
    goalSelector: (goal: StageFixtureGoal) => ['g2', 'q2'].includes(goal.id) }
  const proof = buildHardRouteProofGraph(branchGoals, branchKinds, branchCurrentProfile)
  assert.equal(proof.hasPreparationPath('g2'), true, 'genuine earlier preparation remains a valid witness')
  assert.deepEqual(proof.preparationEdges.get('p1'), ['a1'], 'the excluded assessment must stay outside the witness relation')
  for (const branchProfile of [branchCurrentProfile, earlierStageProfile]) {
    const findings = validateHardDirectAtomicRoutes(branchGoals, branchKinds, branchProfile)
    assert.ok(findings.some((finding) => finding.goalId === 'p1'
      && finding.message.includes('Route order is reversed') && finding.message.includes('x-assessment')),
      `an excluded assessment prerequisite must retain its authored edge guard: ${excludedAssessmentStages}`)
    assert.ok(!findings.some((finding) => finding.message.includes('missing direct atomic')),
      'both profiles have valid preparation and onward terminal routes independently of the reversed branch')
  }
}
console.log('Authored edge-order guards retain returning, future and ambiguous assessment branches beside valid routes.')
