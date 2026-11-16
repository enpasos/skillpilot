import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, type CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'
import {
  collectCanonicalMathSek1AssessmentCollectionFindings,
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

console.log('Canonical Mathematics Sek-I reviewed exam-route regression tests passed, including exact assessment target and jurisdiction applicability.')

// Real materialized J9/J10 collections retain their authored source identity.
// Check the actual preview and every applicable endpoint, not a folder label.
const materializedScopes: Array<[string, string[]]> = [
  ['de-de-seki', ['10']], ['de-hb-gk', ['10']], ['de-hb-lk', ['10']],
  ['de-sh-gk', ['9', '10']], ['de-sh-lk', ['9', '10']],
  ['de-sh-gk-g8', ['9']], ['de-sh-lk-g8', ['9']], ['de-sh-seki-g8', ['9']],
  ['de-sh-gk-g9', ['9', '10']], ['de-sh-lk-g9', ['9', '10']], ['de-sh-seki-g9', ['9', '10']],
]
const materializedFolderIds: Record<string, string> = {
  '9': 'f6c9c2b8-3dbd-4839-972f-c60f33c44b63',
  '10': 'cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8',
}
const semanticLedger = JSON.parse(readFileSync(resolve(process.cwd(),
  '../curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'), 'utf8')) as {
    decisions: Array<{ goalId: string; semanticKind: string }>
  }
const semanticKinds = new Map(semanticLedger.decisions.map((decision) => [decision.goalId, decision.semanticKind]))
const currentLandscape = { ...landscape, goals: landscape.goals.map((goal) => ({
  ...goal, semanticKind: semanticKinds.get(goal.id),
})) }
for (const [name, years] of materializedScopes) {
  const view = normalizeCompositionView(JSON.parse(readFileSync(resolve(process.cwd(),
    `../curricula/DE/Gymnasium/composition-views/mathematik/${name}.view.json`), 'utf8')))
  const folders = Object.fromEntries(years.map((year) => [year, materializedFolderIds[year]]))
  const evaluate = (candidate: typeof view) => collectCanonicalMathSek1AssessmentCollectionFindings(
    candidate, currentLandscape, compileCompositionView(candidate, currentLandscape).compiledRootNodes, folders,
  )
  assert.deepEqual(evaluate(view), [], `${name}: materialized source collections must keep every applicable task visible.`)
  if (name !== 'de-de-seki') continue
  const folderId = materializedFolderIds['10']
  const visitNodes = (nodes: CompositionViewNode[], action: (node: CompositionViewNode) => void): void => {
    for (const node of nodes) { action(node); if (node.kind === 'structure') visitNodes(node.children, action) }
  }
  const noBinding = structuredClone(view)
  visitNodes(noBinding.rootNodes, (node) => { if (node.canonicalSourceGoalId === folderId) delete node.canonicalSourceGoalId })
  assert(evaluate(noBinding).some((finding) => finding.code === 'CPV-211'),
    'The same label and all task IDs cannot replace an explicit source-collection binding.')
  const emptyCollection = structuredClone(view)
  visitNodes(emptyCollection.rootNodes, (node) => {
    if (node.kind === 'structure' && node.canonicalSourceGoalId === folderId) node.children = []
  })
  assert(evaluate(emptyCollection).some((finding) => finding.code === 'CPV-211'),
    'An empty declared source collection must fail.')
  const sourceTaskIds = new Set(currentLandscape.goals.find((goal) => goal.id === folderId)!.contains)
  let removedTaskId = ''
  const missingTask = structuredClone(view)
  visitNodes(missingTask.rootNodes, (node) => {
    if (node.kind !== 'structure' || node.canonicalSourceGoalId !== folderId) return
    const index = node.children.findIndex((child) => child.kind !== 'structure'
      && typeof child.goalId === 'string' && sourceTaskIds.has(child.goalId))
    assert(index >= 0)
    removedTaskId = String(node.children[index].goalId)
    node.children.splice(index, 1)
  })
  assert(removedTaskId)
  assert(evaluate(missingTask).some((finding) => finding.code === 'CPV-211' && finding.message.includes('Aufgabenknoten')),
    'Removing a required real task must still fail even though its source-bound collection remains.')
}
console.log('Materialized assessment collections passed: 16 real J9/J10 collections in 11 views, explicit source binding and missing-task negative checks.')
