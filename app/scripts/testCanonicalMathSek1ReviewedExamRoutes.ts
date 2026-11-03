import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import {
  collectCanonicalMathSek1ExamVisibilityFindings,
  collectCanonicalMathSek1ReviewedExamRouteFindings,
  hasUnavailableCurricularAtomicAssessmentPrerequisite,
  isAssessmentExplicitlyOutsideJurisdiction,
  shouldRequireCanonicalMathSek1AssessmentEndpoint,
} from './lib/canonicalMathSek1ReviewedExamRoutes'

const canonicalPath = resolve(
  process.cwd(),
  '../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const landscape = normalizeCanonicalLandscape(JSON.parse(readFileSync(canonicalPath, 'utf8')))

assert.deepEqual(
  collectCanonicalMathSek1ReviewedExamRouteFindings(landscape),
  [],
  'Die freigegebenen J7-Prüfungsrouten 4 und 6 müssen im kanonischen Jahrgangsbaum vollständig erreichbar sein.',
)

const reviewedPrerequisiteIds = new Set([
  '7dea79d2-67f2-4d92-b6cc-ad1b953dca3d',
  'bd8fd6d5-7155-45a5-96f0-008a4e9acb3a',
])
const withoutReviewedYearPlacements = {
  ...landscape,
  goals: landscape.goals.map((goal) => (
    goal.id === '5a7095a2-2b3a-48bf-9536-eca79ee5ff8c'
      ? {
          ...goal,
          contains: goal.contains.filter((goalId) => !reviewedPrerequisiteIds.has(goalId)),
        }
      : goal
  )),
}
const missingPlacementFindings = collectCanonicalMathSek1ReviewedExamRouteFindings(
  withoutReviewedYearPlacements,
)

assert.equal(missingPlacementFindings.length, 2)
assert.deepEqual(
  new Set(missingPlacementFindings.map((finding) => finding.goalId)),
  reviewedPrerequisiteIds,
)
assert.ok(missingPlacementFindings.every((finding) => finding.code === 'CPV-218'))

const withoutReviewedTaskPrerequisite = {
  ...landscape,
  goals: landscape.goals.map((goal) => (
    goal.id === 'a157b619-e875-5db6-b26a-607a39de00dc'
      ? {
          ...goal,
          requires: goal.requires.filter(
            (goalId) => goalId !== '7dea79d2-67f2-4d92-b6cc-ad1b953dca3d',
          ),
        }
      : goal
  )),
}
const missingTaskPrerequisiteFindings = collectCanonicalMathSek1ReviewedExamRouteFindings(
  withoutReviewedTaskPrerequisite,
)

assert.equal(missingTaskPrerequisiteFindings.length, 1)
assert.equal(missingTaskPrerequisiteFindings[0]?.code, 'CPV-218')
assert.equal(
  missingTaskPrerequisiteFindings[0]?.goalId,
  'a157b619-e875-5db6-b26a-607a39de00dc',
)

const assessment = {
  requires: ['curricular-prerequisite', 'orientation-prerequisite'],
  extendedData: { applicabilityFromRequires: true },
}
const curricularAtomicGoalIds = new Set(['curricular-prerequisite', 'indirect-prerequisite'])
const visibleCurricularTarget = new Set(['curricular-prerequisite'])

assert.equal(hasUnavailableCurricularAtomicAssessmentPrerequisite(
  assessment, curricularAtomicGoalIds, new Set(),
), true, 'An explicitly applicability-derived assessment may be absent when a direct curricular target is excluded.')
assert.equal(hasUnavailableCurricularAtomicAssessmentPrerequisite(
  assessment, curricularAtomicGoalIds, visibleCurricularTarget,
), false, 'Missing orientation or indirect prerequisites must not waive the required assessment endpoint.')
assert.equal(hasUnavailableCurricularAtomicAssessmentPrerequisite(
  { ...assessment, extendedData: {} }, curricularAtomicGoalIds, new Set(),
), false, 'Missing target prerequisites alone must not waive assessments without applicabilityFromRequires.')
assert.equal(hasUnavailableCurricularAtomicAssessmentPrerequisite(
  { ...assessment, requires: ['unknown-prerequisite'] }, curricularAtomicGoalIds, new Set(),
), false, 'Unknown prerequisites must not be treated as authoritatively curricular atomic goals.')
assert.equal(hasUnavailableCurricularAtomicAssessmentPrerequisite(
  { ...assessment, requires: [] }, curricularAtomicGoalIds, new Set(),
), false, 'An empty prerequisite list must not waive an assessment endpoint.')
assert.equal(hasUnavailableCurricularAtomicAssessmentPrerequisite(
  assessment, curricularAtomicGoalIds, new Set(['orientation-prerequisite']),
), true, 'A curricular goal available only as prerequisite support is still absent from the target projection.')

const terminal = { id: 'exam', requires: ['curricular-prerequisite'],
  extendedData: { applicabilityFromRequires: true } }
assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(
  terminal, curricularAtomicGoalIds,
  new Set(['exam', 'curricular-prerequisite']),
  new Set(['curricular-prerequisite']),
), false, 'A foreign exam explicitly shown only as prerequisite support is not a learner-facing terminal.')
assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(
  terminal, curricularAtomicGoalIds,
  new Set(['exam', 'curricular-prerequisite']),
  new Set(['exam', 'curricular-prerequisite']),
), true, 'An authored target exam remains required.')
assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(
  terminal, curricularAtomicGoalIds,
  new Set(['curricular-prerequisite']),
  new Set(['curricular-prerequisite']),
), true, 'A wholly missing exam must still fail route coverage when its assessed target is available.')
assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(
  terminal, curricularAtomicGoalIds, new Set(), new Set(),
), false, 'Only exact unavailable curricular-atomic prerequisites may waive an absent derived exam.')
assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(
  { ...terminal, extendedData: {} }, curricularAtomicGoalIds, new Set(), new Set(),
), true, 'An absent exam without applicabilityFromRequires must remain required.')

for (const [file, requiredTaskId, excludedVariantId] of [
  ['de-he-seki-g8.view.json', '0dded9c1-043e-57cb-82fc-792b391e9cb0', 'e5494c67-aed6-5710-8ae3-51ae147c10e9'],
  ['de-he-seki-g9.view.json', 'e5494c67-aed6-5710-8ae3-51ae147c10e9', '0dded9c1-043e-57cb-82fc-792b391e9cb0'],
] as const) {
  const view = normalizeCompositionView(JSON.parse(readFileSync(resolve(process.cwd(),
    '../curricula/DE/Gymnasium/composition-views/mathematik', file), 'utf8')))
  const goalById = new Map(landscape.goals.map(goal => [goal.id, goal]))
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  const referenced = new Set([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds])
  assert(roles.targetGoalIds.has(requiredTaskId), `${file}: the selected prism task remains required`)
  assert(roles.prerequisiteOnlyGoalIds.has(excludedVariantId), `${file}: the alternative is explicitly outside the target`)
  assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(goalById.get(requiredTaskId)!,
    new Set(), referenced, roles.targetGoalIds), true)
  assert.equal(shouldRequireCanonicalMathSek1AssessmentEndpoint(goalById.get(excludedVariantId)!,
    new Set(), referenced, roles.targetGoalIds), false,
  `${file}: exclusivity must not require both versions of the same assessment`)
}

for (const [goalId, homeJurisdiction] of [
  ['5f6496ef-e4d2-5341-8a2c-3293b2e4e25a', 'DE-BW'],
  ['79f5f4cc-10e1-56a5-8ed3-8cd51688db41', 'DE-SL'],
] as const) {
  const localAssessment = landscape.goals.find((goal) => goal.id === goalId)
  assert.ok(localAssessment, `Missing regression assessment ${goalId}`)
  assert.equal(isAssessmentExplicitlyOutsideJurisdiction(localAssessment, homeJurisdiction), false,
    'A missing local assessment must remain a validation error in its own land.')
  assert.equal(isAssessmentExplicitlyOutsideJurisdiction(localAssessment, 'DE-HE'), true,
    'A foreign land need not display an explicitly land-specific assessment from a shared year folder.')
  assert.equal(isAssessmentExplicitlyOutsideJurisdiction(localAssessment, undefined), false,
    'The national catalog must still require every land-specific assessment.')
}
for (const unrestrictedAssessment of [undefined, {}, { applicability: {} },
  { applicability: { jurisdiction: [] } }, { applicability: { jurisdiction: 'DE-BW' } },
  { applicability: { jurisdiction: ['DE-BW', null] } }]) {
  assert.equal(isAssessmentExplicitlyOutsideJurisdiction(unrestrictedAssessment, 'DE-HE'), false,
    'Absent, unrestricted or malformed jurisdiction evidence must not waive a missing exam.')
}
assert.equal(isAssessmentExplicitlyOutsideJurisdiction(
  { applicability: { jurisdiction: ['DE-BW', 'DE-SL'] } }, 'DE-SL',
), false, 'Every explicitly included land retains its assessment requirement.')

// Exercise the production collector with actual compiler output. Authored
// headings may replace a canonical folder; required tasks must remain visible.
const fixtureId = 'exam-visibility-fixture'
const visibilityPolicy = {
  landscapeId: fixtureId,
  motivationGoalId: 'motivation',
  legacyPracticeClusterId: 'legacy-practice',
  expectedYears: ['8'],
  examFolderIdsByYear: { '8': 'exam-folder' },
}
const visibilityLandscape = normalizeCanonicalLandscape({
  landscapeId: fixtureId,
  goals: [
    { id: 'motivation', title: 'Motivation', requires: [], contains: [] },
    { id: 'preparation', title: 'Preparation', requires: [], contains: [], semanticKind: 'curricularAtomic' },
    { id: 'exam-folder', title: 'Canonical exam family', type: 'cluster', requires: [], contains: ['exam-a', 'exam-b'] },
    ...['exam-a', 'exam-b'].map(id => ({ id, title: id, nodeKind: 'exam', contains: [],
      requires: ['preparation'], extendedData: { applicabilityFromRequires: true } })),
  ],
})
const visiblePrerequisites = [
  { kind: 'goalEntry', goalId: 'motivation' },
  { kind: 'goalEntry', goalId: 'preparation' },
]
const inspectVisibility = (nodes: unknown[], canonical = visibilityLandscape) => {
  const before = JSON.stringify(canonical)
  const view = normalizeCompositionView({ viewId: 'visibility', landscapeId: fixtureId,
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekI' }, rootNodes: nodes })
  const compiled = compileCompositionView(view, canonical)
  const result = collectCanonicalMathSek1ExamVisibilityFindings(
    view, canonical, compiled.compiledRootNodes, visibilityPolicy,
  )
  assert.equal(JSON.stringify(canonical), before, 'Visibility checks never mutate authored goals or learner outcomes.')
  return result
}
assert.deepEqual(inspectVisibility([...visiblePrerequisites, {
  kind: 'structure', id: 'reviewed-neutral-heading', label: 'Reviewed assessments', children: [
    { kind: 'goalEntry', goalId: 'exam-a' }, { kind: 'goalEntry', goalId: 'exam-b' },
  ],
}]), [], 'Visible exact tasks satisfy their family without requiring its canonical navigation container.')
const missingTaskWithoutFolder = inspectVisibility([...visiblePrerequisites, { kind: 'goalEntry', goalId: 'exam-a' }])
assert.equal(missingTaskWithoutFolder.length, 1)
assert.equal(missingTaskWithoutFolder[0].code, 'CPV-211')
assert.equal(missingTaskWithoutFolder[0].severity, 'error')
assert.match(missingTaskWithoutFolder[0].message, /1 Aufgabenknoten/u,
  'A missing folder must not hide another missing required task when preparation remains a target.')
const folderWithoutTasks = inspectVisibility([...visiblePrerequisites, { kind: 'goalEntry', goalId: 'exam-folder' }])
assert.equal(folderWithoutTasks.length, 1)
assert.equal(folderWithoutTasks[0].code, 'CPV-211')
assert.match(folderWithoutTasks[0].message, /2 Aufgabenknoten/u,
  'An opaque container alone does not replace its required assessment tasks.')
assert.deepEqual(inspectVisibility([...visiblePrerequisites,
  { kind: 'goalEntry', goalId: 'exam-a', projectionRole: 'prerequisiteOnly' },
  { kind: 'goalEntry', goalId: 'exam-b', projectionRole: 'prerequisiteOnly' },
]), [], 'Existing explicit support-only exclusions stay effective even without a visible folder.')
assert.deepEqual(inspectVisibility([{ kind: 'goalEntry', goalId: 'motivation' }]), [],
  'Existing applicabilityFromRequires exclusions remain effective when curricular preparation is outside the target.')
const foreignTask = { ...visibilityLandscape, goals: visibilityLandscape.goals.map(goal => goal.id === 'exam-b'
  ? { ...goal, applicability: { jurisdiction: ['DE-BE'] } } : goal) }
assert.deepEqual(inspectVisibility([...visiblePrerequisites, { kind: 'goalEntry', goalId: 'exam-a' }], foreignTask), [],
  'Existing explicit foreign-jurisdiction exclusions remain effective.')
const unknownPreparation = { ...visibilityLandscape, goals: visibilityLandscape.goals.map(goal => goal.id === 'exam-b'
  ? { ...goal, requires: ['unknown-preparation'] } : goal) }
assert.equal(inspectVisibility([...visiblePrerequisites, { kind: 'goalEntry', goalId: 'exam-a' }], unknownPreparation)[0]?.code,
  'CPV-211', 'Unknown preparation must not silently waive a missing assessment.')

console.log('Canonical Mathematics Sek-I reviewed exam-route and production assessment-visibility regressions passed.')
