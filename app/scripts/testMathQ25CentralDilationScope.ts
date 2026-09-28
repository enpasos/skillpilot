import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  normalizeCompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'
import { buildApplicabilityCompilation } from './applicabilityCompiler'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { collectAuthoritativeTargetAtomicGoalIds } from './compositionViewSourceCoverage'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const canonical = readJson(canonicalPath) as SkillLandscape
const landscape = normalizeCanonicalLandscape(canonical)
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const rawGoals = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const goalId = '7d37513b-fa1a-54cc-9e2a-9279a381f0f0'
const localAssessmentId = '7d160e08-d987-4a63-873b-44496f6e11d3'
const q2PracticeId = '14b19ee4-364e-50bd-b6a3-499471356ef3'
const oldParentId = '1a84cea4-d2a2-4527-b914-1a03e56e0814'
const q25ParentId = 'b3d2284c-21e0-5af8-942a-a4c11390c84a'
const matrixGoalId = '35558905-753d-5fcb-b25e-7f85ffdbff56'
const assessmentId = '1878f680-095c-511d-aaed-e98393f7fde9'
const goal = rawGoals.get(goalId)
assert(goal, 'The existing 7d goal must remain in the canonical M7 denominator')
assert.equal(goal.extendedData?.applicabilityMappingInheritance, 'boundary')
assert.deepEqual(goal.applicability, { jurisdiction: ['DE-HE'] })
assert.deepEqual(goal.requires, [
  '87c55be5-06a9-41e2-a0d4-c60f7c8b8078',
  '5f548596-9bc3-532e-88a0-81d5029809e9',
  matrixGoalId,
])
assert.match(goal.description, /k²/u)
assert.match(goal.description, /k³/u)
assert.match(goal.description, /positivem Faktor k/u)
assert(!rawGoals.get(oldParentId)?.contains.includes(goalId), 'The former Q2.2 parent must not retain 7d')
const q25Children = rawGoals.get(q25ParentId)?.contains ?? []
assert.equal(q25Children.filter((id) => id === goalId).length, 1)
assert.equal(q25Children.indexOf(goalId), q25Children.indexOf(matrixGoalId) + 1)

const sourceMapping = readJson('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_source_extraction_to_canonical_math.review.json') as {
  mappings: Array<{ legacyGoalId: string, canonicalGoalId: string, matchType: string }>
  decisions: Array<{ sourceGoalId: string, topicCode: string, canonicalGoalIds: string[], rationale: string }>
}
for (const [sourceGoalId, topicCode] of [
  ['he-math-sekii-q2-2-b04-a03-87ad462f', 'Q2.2'],
  ['he-math-sekii-q2-5-b03-a04-ed1b9593', 'Q2.5'],
] as const) {
  const mapping = sourceMapping.mappings.filter((entry) => entry.legacyGoalId === sourceGoalId && entry.canonicalGoalId === goalId)
  assert.equal(mapping.length, 1, `${topicCode}: one source-to-7d binding expected`)
  assert.equal(mapping[0].matchType, 'partial', `${topicCode}: the derived combination is not a literal exact source goal`)
  const decision = sourceMapping.decisions.find((entry) => entry.sourceGoalId === sourceGoalId)
  assert.equal(decision?.topicCode, topicCode)
  assert(decision.canonicalGoalIds.includes(goalId))
  assert.match(decision.rationale, /Faktoren k²\/k³/u)
}
const legacyMapping = readJson('curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_math_upper_secondary_to_canonical_math.json') as {
  mappings: Array<{ legacyGoalId: string, canonicalGoalId: string, matchType: string }>
}
assert.equal(legacyMapping.mappings.find((entry) => entry.legacyGoalId === '9f8fcb66-4cf0-4e65-a6cb-9d7f7cb0f2d6' && entry.canonicalGoalId === goalId)?.matchType, 'partial')

const compiled = buildApplicabilityCompilation().reports.find((report) => report.landscapeId === canonical.landscapeId)
assert(compiled, 'Native applicability report missing for canonical Mathematics')
const compiledGoal = compiled.goals.find((entry) => entry.goalId === goalId)
assert(compiledGoal)
assert.deepEqual(compiledGoal.compiledApplicability, { jurisdiction: ['DE-HE'] })
assert(compiledGoal.evidence.filter((entry) => entry.kind === 'mapping').every((entry) => entry.mappingStrength === 'partial'))
assert.deepEqual(compiled.findings.filter((finding) => finding.goalId === goalId), [])
const compiledAssessment = compiled.goals.find((entry) => entry.goalId === localAssessmentId)
assert(compiledAssessment)
assert.deepEqual(compiledAssessment.compiledApplicability, { jurisdiction: ['DE-HE'] })
assert(compiledAssessment.evidence.some((entry) => entry.kind === 'assessment-requires'))
assert.deepEqual(compiled.findings.filter((finding) => finding.goalId === localAssessmentId), [])

const root = landscape.goals.find((candidate) => candidate.tags?.includes('root'))
assert(root)
const viewDir = 'curricula/DE/Gymnasium/composition-views/mathematik'
const files = readdirSync(resolve(repoRoot, viewDir)).filter((name) => name.endsWith('.view.json'))
let heLkTargets = 0
let byGkM134Targets = 0
let byLkM134Targets = 0
let national7dTargets = 0
let heLkAssessmentTargets = 0
let nationalAssessmentTargets = 0
const bavarianM134GoalId = 'dc12f281-f161-572b-a973-8405ae9b2498'
for (const name of files) {
  const view = normalizeCompositionView(readJson(`${viewDir}/${name}`))
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals, new Map([[canonical.landscapeId, root.id]]))
  if (view.scope.jurisdiction === 'DE-BY' && targetGoalIds.has(bavarianM134GoalId)) {
    if (view.scope.courseProfile === 'GK') byGkM134Targets++
    if (view.scope.courseProfile === 'LK') byLkM134Targets++
  }
  if (view.scope.jurisdiction && view.scope.jurisdiction !== 'DE-BY') {
    assert(!targetGoalIds.has(bavarianM134GoalId), `${name}: BY-only M13.4 must not leak to another state`)
  }
  if (!view.scope.jurisdiction && targetGoalIds.has(goalId)) {
    assert.equal(view.scope.courseProfile, 'LK', `${name}: the national GK aggregate must not contain the LK-only 7d goal`)
    national7dTargets++
  }
  if (targetGoalIds.has(localAssessmentId)) {
    if (!view.scope.jurisdiction) {
      assert.equal(view.scope.courseProfile, 'LK', `${name}: national GK must not target the HE-LK assessment`)
      nationalAssessmentTargets++
    } else {
      assert.equal(view.scope.jurisdiction, 'DE-HE', `${name}: no non-HE target for the local Q2.5 assessment`)
      assert.equal(view.scope.courseProfile, 'LK', `${name}: the local Q2.5 assessment is LK-only`)
      heLkAssessmentTargets++
    }
    assert(targetGoalIds.has(goalId), `${name}: terminal assessment requires a target route through 7d`)
  }
  if (targetGoalIds.has(goalId)) {
    if (!view.scope.jurisdiction) continue // National LK intentionally shows the cross-state union.
    assert.equal(view.scope.jurisdiction, 'DE-HE', `${name}: no source-backed non-HE projection for 7d`)
    assert.equal(view.scope.courseProfile, 'LK', `${name}: the derived extension is LK-only`)
    heLkTargets++
  }
}
assert(heLkTargets > 0, '7d must be reachable in HE-LK composition views')
assert(byGkM134Targets > 0 && byLkM134Targets > 0, 'BY M13.4 must remain reachable in both interim projection profiles')
assert(national7dTargets > 0, 'The national view must retain its cross-state union')
assert.equal(heLkAssessmentTargets, heLkTargets, 'Every HE-LK route to 7d needs its matching Q2 terminal')
assert.equal(nationalAssessmentTargets, national7dTargets, 'National LK union must retain the Q2 terminal')
for (const [name, shouldHave7d, shouldHaveM134] of [
  ['de-he-lk.view.json', true, false],
  ['de-bb-gk.view.json', false, false],
  ['de-by-gk.view.json', false, true],
  ['de-by-lk.view.json', false, true],
  ['de-de-gk.view.json', false, true],
  ['de-de-lk.view.json', true, true],
] as const) {
  const runtimeTargets = collectAuthoritativeTargetAtomicGoalIds(canonical, readJson(`${viewDir}/${name}`))
  assert.equal(runtimeTargets.has(goalId), shouldHave7d, `${name}: runtime tree differs from the effective 7d target role`)
  assert.equal(runtimeTargets.has(localAssessmentId), shouldHave7d, `${name}: runtime tree differs from the effective Q2.5 terminal role`)
  assert.equal(runtimeTargets.has(bavarianM134GoalId), shouldHaveM134, `${name}: runtime tree differs from the effective M13.4 target role`)
}

const assessment = rawGoals.get(assessmentId)
assert(assessment?.examData)
assert(!assessment.requires.includes(goalId), 'The unchanged pyramid task cannot require the new dilation argument')
assert(!assessment.examData.coveredGoalIds?.includes(goalId), 'The unchanged pyramid task cannot claim 7d coverage')
assert.equal(assessment.examData.reviewStatus, 'released', 'Do not silently alter the published assessment review state')
assert((assessment.examData.coveredGoalIds?.length ?? 0) > 3, 'Broader assessment coverage remains a separate open QA item')

const localAssessment = rawGoals.get(localAssessmentId)
assert(localAssessment?.examData)
assert.deepEqual(localAssessment.requires, [goalId])
assert.deepEqual(localAssessment.examData.coveredGoalIds, [goalId])
assert.equal(localAssessment.examData.reviewStatus, 'released')
assert.equal(localAssessment.examData.scoring?.maxPoints, 12)
assert.equal(localAssessment.examData.scoring?.passingPoints, 10)
assert.deepEqual(localAssessment.examData.scoring?.steps?.map((step) => step.points), [1, 4, 1, 4, 1, 1])
const areaReasoning = localAssessment.examData.scoring?.steps?.find((step) => step.id === 'area_factor_reasoning')
const volumeReasoning = localAssessment.examData.scoring?.steps?.find((step) => step.id === 'volume_factor_reasoning')
assert.match(areaReasoning?.description ?? '', /höchstens 1\/4 ohne Herleitung von k² aus dem Kantenprodukt/u)
assert.match(volumeReasoning?.description ?? '', /höchstens 1\/4 ohne Herleitung von k³ aus dem Kantenprodukt/u)
const maximumWithoutTwoPointsInEitherReasoning = 12 - 4 + 1
assert(maximumWithoutTwoPointsInEitherReasoning < localAssessment.examData.scoring.passingPoints)
assert(rawGoals.get(q2PracticeId)?.contains.includes(localAssessmentId), 'The new exam must be a direct Q2 terminal child')
const assessmentSourceDir = 'curricula/DE/Gymnasium/assessments/mathematik/sekii/q2/central-dilation-area-volume-he-lk-v1'
for (const language of ['de', 'en']) {
  const source = readFileSync(resolve(repoRoot, `${assessmentSourceDir}/task.${language}.md`), 'utf8')
  assert.match(source, /k\^2/u)
  assert.match(source, /k\^3/u)
  assert.match(source, /10 (BE|points)/u)
}
assert.match(localAssessment.examData.taskContent ?? '', /Zentimetern/u)
assert.match(localAssessment.examData.taskContentEn ?? '', /centimetres/u)
assert.match(localAssessment.examData.taskContent ?? '', /richtigen Bruchteilen/u)
assert.match(localAssessment.examData.taskContentEn ?? '', /correct fractions/u)

const kindLedger = readJson('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json') as {
  counts: { curricularAtomic: number, practiceAssessment: number },
  decisions: Array<{ goalId: string, semanticKind: string, sourceFingerprint: string }>
}
assert.equal(kindLedger.counts.curricularAtomic, 799, 'The new terminal does not change the M7 denominator')
for (const [id, kind] of [[goalId, 'curricularAtomic'], [oldParentId, 'curricularArea'], [q25ParentId, 'curricularArea'], [q2PracticeId, 'practiceAssessment'], [assessmentId, 'practiceAssessment'], [localAssessmentId, 'practiceAssessment']]) {
  const decision = kindLedger.decisions.find((entry) => entry.goalId === id)
  assert.equal(decision?.semanticKind, kind)
  assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(rawGoals.get(id)! as unknown as Record<string, unknown>))
}
console.log(`PASS HE-LK 7d/Q2.5 terminal, scoring and BY-exclusion regression across ${files.length} views (${heLkTargets} HE-LK targets)`)
