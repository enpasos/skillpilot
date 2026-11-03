import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import { collectRouteTerminalAutonomyGoals, terminalAutonomyGoalsForRouteScope, concreteExamReadinessIssues } from './generateCurriculumQualityStatus'
import { readFileSync } from 'node:fs'
import { bindCurricularReviewLandscape, isAuthoritativeCurricularReviewGoal } from './lib/curricularReviewPopulation'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import assert from 'node:assert/strict'
import {
  validateHardDirectAtomicRoutes,
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
assert.ok(validateHardDirectAtomicRoutes(earlyCurricularAssessmentGoals, earlyCurricularAssessmentKinds, profile)
  .some(f => f.message.includes('Route order is reversed')), 'curricular membership does not lower the assessment execution role')

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
