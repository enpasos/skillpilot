import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectCompositionProjectionRoleGoalIds,
  normalizeCompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'
import { assertBavariaOptionalCandidateSnapshot } from './auditMathBavariaOptionalCourseProjection'
import {
  bavariaSekIIScopes,
  deriveBavariaOptionalOnlyGoalIds,
  remainingApplicabilityScopeCount,
  type BavariaMathSourceExtraction,
  type BavariaMathSourceMapping,
} from './mathBavariaOptionalCourseProjection'
import type { GoalBookPage } from './goalBookModel'

const extraction: BavariaMathSourceExtraction = {
  sourceDocuments: [
    { key: 'JGST12_VERTIEFUNG', role: 'optional-extension' },
    { key: 'JGST12_EA', role: 'binding-core' },
  ],
  sourceGoals: [
    { id: 'optional-a', sourceDocumentKey: 'JGST12_VERTIEFUNG' },
    { id: 'optional-b', sourceDocumentKey: 'JGST12_VERTIEFUNG' },
    { id: 'mandatory', sourceDocumentKey: 'JGST12_EA' },
  ],
}
const mapping: BavariaMathSourceMapping = { mappings: [
  { legacyGoalId: 'optional-a', canonicalGoalId: 'optional-only' },
  { legacyGoalId: 'optional-b', canonicalGoalId: 'shared' },
  { legacyGoalId: 'mandatory', canonicalGoalId: 'shared' },
] }
const result = deriveBavariaOptionalOnlyGoalIds(extraction, mapping)
assert.equal(result.optionalSourceGoalCount, 2)
assert.equal(result.optionalMappingRows, 2)
assert.deepEqual(result.optionalOnlyCanonicalIds, ['optional-only'])
assert.deepEqual(result.sharedCanonicalIds, ['shared'])

const page = { applicability: [
  { jurisdiction: 'DE-BY', scopes: [
    { stage: 'SekII', durationModel: 'G9', courseProfile: 'LK' },
    { stage: 'SekI', durationModel: 'G9', courseProfile: null },
  ] },
  { jurisdiction: 'DE-HE', scopes: [
    { stage: 'SekII', durationModel: 'G9', courseProfile: 'LK' },
  ] },
] } as GoalBookPage
assert.equal(bavariaSekIIScopes(page).length, 1)
assert.equal(remainingApplicabilityScopeCount(page), 2)
assert.equal(remainingApplicabilityScopeCount({
  ...page, applicability: [page.applicability![0]],
} as GoalBookPage), 1, 'BY Sek-I must not be removed with the optional BY Sek-II course')

assert.throws(() => deriveBavariaOptionalOnlyGoalIds({
  ...extraction,
  sourceDocuments: [{ key: 'JGST12_VERTIEFUNG', role: 'binding-core' }, extraction.sourceDocuments[1]],
}, mapping), /role changed/)
assert.throws(() => deriveBavariaOptionalOnlyGoalIds(extraction, {
  mappings: mapping.mappings.slice(1),
}), /not every optional BY source goal is mapped/)
assert.throws(() => deriveBavariaOptionalOnlyGoalIds(extraction, {
  mappings: [...mapping.mappings, { legacyGoalId: 'unknown', canonicalGoalId: 'wrong' }],
}), /unresolved BY source mapping/)

const storedCandidate = {
  status: 'non_active_source_mapping_derived_candidate',
  sourceDigest: 'sha256:unchanged',
  registeredStrictDClaimsOnAffectedPages: 1,
  pages: [
    { goalId: 'previously-complete', retainedScopeCount: 2, registeredStrictDClaim: true },
    { goalId: 'newly-complete', retainedScopeCount: 1, registeredStrictDClaim: false },
  ],
}
const advancedCandidate = structuredClone(storedCandidate)
advancedCandidate.registeredStrictDClaimsOnAffectedPages = 2
advancedCandidate.pages[1].registeredStrictDClaim = true
assert.doesNotThrow(() => assertBavariaOptionalCandidateSnapshot(advancedCandidate, storedCandidate),
  'new strict D progress must not stale the source/projection candidate')

const regressedCandidate = structuredClone(storedCandidate)
regressedCandidate.registeredStrictDClaimsOnAffectedPages = 0
regressedCandidate.pages[0].registeredStrictDClaim = false
assert.throws(() => assertBavariaOptionalCandidateSnapshot(regressedCandidate, storedCandidate),
  /previously registered strict D claim regressed/)
assert.throws(() => assertBavariaOptionalCandidateSnapshot({
  ...advancedCandidate,
  sourceDigest: 'sha256:changed',
}, storedCandidate), /source\/projection candidate drifted/)
assert.throws(() => assertBavariaOptionalCandidateSnapshot({
  ...advancedCandidate,
  registeredStrictDClaimsOnAffectedPages: 1,
}, storedCandidate), /strict D count disagrees with page claims/)

const root = fileURLToPath(new URL('../..', import.meta.url))
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const storedLiveCandidate = readJson(
  'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/'
  + 'rollout-v1/2026-09-27/m7-gklk-projection-preparation-20260927-v1/'
  + 'bavaria-optional-course-candidate.json',
)
const registry = readJson(
  'curricula/DE/Gymnasium/quality/deep-understanding-rollout/'
  + 'de-gymnasium-math-physics.config.json',
)
const mathRegistry = registry.subjects.find((subject: { subject: string }) => subject.subject === 'mathematik')
assert.ok(mathRegistry, 'Mathematics D registry is absent')
const liveStrictDIds = new Set<string>()
for (const path of mathRegistry.resolutionIndexPaths as string[]) {
  const index = readJson(path)
  for (const resolution of index.resolutions as Array<{
    goalId: string; strictDescriptionComplete: boolean
  }>) {
    if (resolution.strictDescriptionComplete) liveStrictDIds.add(resolution.goalId)
  }
}
const currentLiveCandidate = structuredClone(storedLiveCandidate)
for (const candidatePage of currentLiveCandidate.pages) {
  candidatePage.registeredStrictDClaim = liveStrictDIds.has(candidatePage.goalId)
}
currentLiveCandidate.registeredStrictDClaimsOnAffectedPages = currentLiveCandidate.pages
  .filter((candidatePage: { registeredStrictDClaim: boolean }) => candidatePage.registeredStrictDClaim).length
assertBavariaOptionalCandidateSnapshot(currentLiveCandidate, storedLiveCandidate)
assert.equal(storedLiveCandidate.status, 'non_active_source_mapping_derived_candidate',
  'the archived optional-course candidate is historical evidence, not the active BY course projection')

const currentExtraction = readJson(
  'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/'
  + 'DE_BY_MATHEMATIK_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
) as BavariaMathSourceExtraction & { sourceGoals: Array<{ topicCode: string }> }
const currentMapping = readJson(
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/'
  + 'bavaria_math_source_extraction_to_canonical_math.review.json',
) as BavariaMathSourceMapping
const currentCanonical = readJson(
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
) as { goals: Array<{ id: string; contains: string[] }> }
const goalById = new Map(currentCanonical.goals.map((goal) => [goal.id, goal]))
const viewTargets = (viewName: string) => {
  const view = normalizeCompositionView(readJson(
    `curricula/DE/Gymnasium/composition-views/mathematik/${viewName}.view.json`,
  ))
  return collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
}
const gkTargets = viewTargets('de-by-sekii-gk')
const lkTargets = viewTargets('de-by-sekii-lk')
const crossStageGkTargets = viewTargets('de-by-gk')
const crossStageLkTargets = viewTargets('de-by-lk')
for (const [gk, lk] of [
  [gkTargets.targetGoalIds, lkTargets.targetGoalIds],
  [crossStageGkTargets.targetGoalIds, crossStageLkTargets.targetGoalIds],
]) {
  assert.ok([...gk].every((goalId) => lk.has(goalId)),
    'every compulsory BY Mathematics target must also be in the LK projection')
}
const currentOptionalOnly = deriveBavariaOptionalOnlyGoalIds(currentExtraction, currentMapping)
for (const moduleNumber of [1, 2, 3, 4, 5]) {
  const moduleSourceIds = new Set(currentExtraction.sourceGoals
    .filter((goal) => goal.sourceDocumentKey === 'JGST12_VERTIEFUNG'
      && goal.topicCode === `M12-V.${moduleNumber}`)
    .map((goal) => goal.id))
  assert.ok(moduleSourceIds.size > 0, `Bavarian Vertiefung module ${moduleNumber} has no source goals`)
  assert.ok(currentMapping.mappings.some((row) => moduleSourceIds.has(row.legacyGoalId)
    && lkTargets.targetGoalIds.has(row.canonicalGoalId)
    && goalById.get(row.canonicalGoalId)?.contains.length === 0),
  `Bavarian Vertiefung module ${moduleNumber} has no atomic LK target`)
}
for (const goalId of currentOptionalOnly.optionalOnlyCanonicalIds) {
  const goal = goalById.get(goalId)
  assert.ok(goal, `source-mapped BY goal ${goalId} is missing from the canonical graph`)
  if (goal.contains.length > 0) continue
  assert.ok(lkTargets.targetGoalIds.has(goalId),
    `Vertiefungskurs atomic goal ${goalId} must be a BY-LK target`)
  assert.ok(!gkTargets.targetGoalIds.has(goalId),
    `Vertiefungskurs atomic goal ${goalId} must not be a BY-GK target`)
}
for (const goalId of [
  '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
  '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
  'b431148b-526c-4bde-b04b-48d23101d0d3',
  '49f9059a-876c-5051-8146-d008b5cc691c',
]) {
  for (const [gk, lk] of [
    [gkTargets.targetGoalIds, lkTargets.targetGoalIds],
    [crossStageGkTargets.targetGoalIds, crossStageLkTargets.targetGoalIds],
  ]) {
    assert.ok(gk.has(goalId) && lk.has(goalId),
      `regular compulsory BY goal ${goalId} must be in both course projections`)
  }
}
assert.ok(gkTargets.prerequisiteOnlyGoalIds.has('9b339361-7719-573d-a913-432246c502ee'))
assert.ok(lkTargets.targetGoalIds.has('9b339361-7719-573d-a913-432246c502ee'))

console.log('Bavaria optional Math projection: source derivation, GK/LK targets and historical candidate guards passed')
