import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  collectCanonicalMathSek1ReviewedExamRouteFindings,
  hasUnavailableCurricularAtomicAssessmentPrerequisite,
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

console.log('Canonical Mathematics Sek-I reviewed exam-route regression tests passed, including exact assessment target applicability.')
