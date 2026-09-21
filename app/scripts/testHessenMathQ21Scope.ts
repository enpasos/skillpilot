import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'
import { buildApplicabilityCompilation, intersectApplicabilityJurisdictions } from './applicabilityCompiler'
import type { SkillLandscape } from '../src/landscapeTypes'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const raw = readJson('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json') as SkillLandscape
const landscape = normalizeCanonicalLandscape(raw)
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const rawGoalById = new Map(raw.goals.map((goal) => [goal.id, goal]))
const common = [
  '61686d85-0301-550e-bab9-bd9411c3e7ce', '5dabf0b3-89b1-59a6-ae57-014f92becd3b',
  '6517427b-cf4e-5ebf-9a76-e1035617687c', 'dd6c5e08-0cc6-53c0-b317-ebaba277c776',
  '772b11c9-1348-5ab9-bc3f-458c46b312b6', 'a12bef54-7595-5f48-a7a8-9cfe1d8e9729',
  '4c6369b0-4b58-5ac0-915c-82c348ae1c14', '62a1c6f2-1775-5a19-98e0-ed3dd722039f',
  'c15fe32d-1c83-4127-b1a4-9125af3d8f5d', 'dbc13bb0-963b-49a8-a441-2183f4b64c8e',
]
const lkOnly = [
  '06ce2b1b-e888-5322-9ed9-dfc6d322956a', '04fe49bf-8c3e-5986-ae83-3c69c0c3e4c8',
  '8b3ce429-e6bb-5d33-b6aa-6ded41afc74c', '3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4',
  'ebc41c8b-5754-5161-9b07-f4525b9fd9b4', '0c5e2ed1-4efb-5bdb-a8e5-fe830eb92c85',
  '91311908-9209-58e4-8429-99dad9df546d',
]
const tasks = [
  'bbb340ed-1009-4966-ae96-bfea4437505a',
  '46bb8422-a822-46e1-8bcc-8b6475994b3a',
  '1429363f-628f-4f42-80e5-8a9a935147cc',
]
const changedPrerequisites = [
  '993a14e8-60f0-5764-9340-b2447a5fa84b', 'c0e34fa8-fde5-5a4e-9b84-c5d5db719b58',
  '972cc7e8-be9c-444c-ba45-98e817b3cf14', '91e2f564-3bc8-4924-af85-2a3fa84c1471',
]
const assessmentClusterId = '967d1863-1b9b-4798-8a35-ae4e9760e322'
// Both native commands own explicit terminal-cluster lists. Inspect only these
// declarations here; importing validateGraph would start its full-repo run.
for (const script of ['validateGraph.ts', 'generateCurriculumQualityStatus.ts']) {
  const source = readFileSync(resolve(repoRoot, 'app/scripts', script), 'utf8')
  const declaration = source.match(/const CANONICAL_GYM_MATH_SEK2_PRACTICE_CLUSTER_IDS = \[([\s\S]*?)\]/u)
  assert(declaration, `${script}: native Sek-II terminal-cluster selector missing`)
  const clusterIds = [...declaration[1].matchAll(/'([^']+)'/gu)].map((match) => match[1])
  assert.equal(clusterIds.filter((id) => id === assessmentClusterId).length, 1, `${script}: HE Q2.1 assessments must participate in native route/assessment gates`)
}
assert.deepEqual(rawGoalById.get(assessmentClusterId)?.contains, tasks)

// Applicability is a compiled eligibility cache, not a composition placement.
// These original assessments have no independent source-goal mapping: derive
// eligibility from all assessed prerequisites, while the views below retain
// their deliberately HE-GK-only target placement.
for (const id of tasks) {
  assert.equal(rawGoalById.get(id)?.extendedData?.applicabilityFromRequires, true, `${id}: assessment applicability must derive from all prerequisites`)
  assert.equal(rawGoalById.get(id)?.extendedData?.applicabilityMappingInheritance, 'boundary', `${id}: broad ancestor mappings must not supply assessment applicability`)
}
const applicability = buildApplicabilityCompilation().reports.find((report) => report.landscapeId === raw.landscapeId)
assert(applicability, 'Native applicability report missing for canonical Mathematics')
const applicabilityById = new Map(applicability.goals.map((goal) => [goal.goalId, goal]))
for (const id of tasks) {
  const task = rawGoalById.get(id)!
  const compiled = applicabilityById.get(id)!
  const expected = intersectApplicabilityJurisdictions(task.requires.map((requiredId) => applicabilityById.get(requiredId)!.compiledApplicability))
  assert(expected.includes('DE-HE'), `${id}: HE applicability lost`)
  assert.deepEqual(compiled.compiledApplicability, { jurisdiction: expected }, `${id}: assessment must use all-of prerequisite applicability`)
  assert.deepEqual(task.applicability, compiled.compiledApplicability, `${id}: committed applicability cache is stale`)
  assert.equal(compiled.evidence.length, expected.length * task.requires.length, `${id}: incomplete prerequisite evidence`)
  assert(compiled.evidence.every((entry) => entry.kind === 'assessment-requires' && task.requires.includes(entry.source.replace(/^requires /u, ''))), `${id}: assessment eligibility must not claim source coverage`)
}
const compiledCluster = applicabilityById.get(assessmentClusterId)!
const childJurisdictions = [...new Set(tasks.flatMap((id) => applicabilityById.get(id)!.compiledApplicability.jurisdiction ?? []))].sort()
assert.deepEqual(compiledCluster.compiledApplicability, { jurisdiction: childJurisdictions }, 'Assessment cluster must use child-union applicability')
assert.deepEqual(rawGoalById.get(assessmentClusterId)!.applicability, compiledCluster.compiledApplicability, 'Assessment cluster applicability cache is stale')
assert(compiledCluster.evidence.every((entry) => entry.kind === 'child-union'), 'Assessment cluster must not claim direct source coverage')
assert.deepEqual(applicability.findings.filter((finding) => [assessmentClusterId, ...tasks].includes(finding.goalId ?? '') && finding.severity !== 'diagnostic'), [], 'HE Q2.1 applicability must have no errors or warnings')

const kindLedger = readJson('curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json') as {
  decisions: Array<{ goalId: string, semanticKind: string, sourceFingerprint: string }>
}
const expectedKinds = new Map([
  ...changedPrerequisites.map((id) => [id, 'curricularAtomic'] as const),
  ['c01b1ce9-a667-4a46-b251-ec33ae602b15', 'programStructure'],
  [assessmentClusterId, 'curricularArea'],
  ...tasks.map((id) => [id, 'practiceAssessment'] as const),
])
for (const [id, kind] of expectedKinds) {
  const decisions = kindLedger.decisions.filter((decision) => decision.goalId === id)
  assert.equal(decisions.length, 1, `${id}: expected one semantic-kind classification`)
  assert.equal(decisions[0].semanticKind, kind, `${id}: structural repair must not change the semantic kind`)
  assert.equal(decisions[0].sourceFingerprint, fingerprintSemanticKindSourceGoal(rawGoalById.get(id)! as unknown as Record<string, unknown>), `${id}: semantic-kind source binding is stale`)
}
const heGkFiles = new Set(['de-he-sekii-gk.view.json', 'de-he-gk.view.json', 'de-he-gk-g8.view.json', 'de-he-gk-g9.view.json'])
const ancestorClosure = (start: string) => {
  const visited = new Set<string>()
  const visit = (id: string) => {
    for (const predecessor of goalById.get(id)?.requires ?? []) {
      if (visited.has(predecessor)) continue
      visited.add(predecessor)
      visit(predecessor)
    }
  }
  visit(start)
  return visited
}

// A qualitative parameter interpretation/problem formulation must not require
// parameter calibration or the antiderivative of 1/x through these old edges.
for (const id of changedPrerequisites) {
  assert(!ancestorClosure(id).has('3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4'), `${id}: compulsory logarithmic integration returned`)
}
for (const id of changedPrerequisites.slice(0, 2)) {
  for (const parameterId of changedPrerequisites.slice(2)) {
    assert(!goalById.get(id)!.requires.includes(parameterId), `${id}: reversed parameter prerequisite returned`)
  }
}

const assessed = new Set<string>()
for (const id of tasks) {
  const task = rawGoalById.get(id)
  assert(task?.examData, `${id}: task missing`)
  assert.equal(task.nodeKind, 'exam')
  assert.deepEqual(task.requires, task.examData.coveredGoalIds, `${id}: declared coverage must equal the concrete assessed prerequisites`)
  for (const covered of task.examData.coveredGoalIds ?? []) {
    assert(common.includes(covered), `${id}: unrelated coverage added`)
    assert(!assessed.has(covered), `${id}: duplicate claimed coverage`)
    assessed.add(covered)
  }
  const scoring = task.examData.scoring!
  assert.equal(scoring.steps!.reduce((sum, step) => sum + step.points, 0), scoring.maxPoints)
  assert(scoring.passingPoints > 0 && scoring.passingPoints <= scoring.maxPoints)
  for (const forbidden of lkOnly) assert(!ancestorClosure(id).has(forbidden), `${id}: LK-only prerequisite introduced`)
}
assert.deepEqual([...assessed].sort(), [...common].sort())

const viewDir = 'curricula/DE/Gymnasium/composition-views/mathematik'
const memory = readFileSync(resolve(repoRoot, 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl'), 'utf8')
  .trim().split('\n').map((line) => JSON.parse(line) as { goalId: string, status: string, memoryGoalIds?: string[] })
let checkedHe = 0
let checkedOther = 0
for (const name of readdirSync(resolve(repoRoot, viewDir)).filter((name) => name.endsWith('.view.json'))) {
  const view = normalizeCompositionView(readJson(`${viewDir}/${name}`))
  const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  if (!heGkFiles.has(name)) {
    for (const id of tasks) assert(!targetGoalIds.has(id), `${name}: HE-only assessment leaked into another existing view`)
    checkedOther += 1
    continue
  }
  checkedHe += 1
  assert.deepEqual(compileCompositionView(view, landscape).findings, [], `${name}: invalid composition`)
  for (const id of [...common, ...tasks]) assert(targetGoalIds.has(id), `${name}: common content or endpoint missing: ${id}`)
  for (const id of lkOnly) {
    assert(!targetGoalIds.has(id), `${name}: LK-only Q2.1 content is a GK target`)
    assert(!prerequisiteOnlyGoalIds.has(id), `${name}: LK-only content hidden as a prerequisite`)
  }
  for (const id of [...common, ...tasks]) {
    for (const predecessor of goalById.get(id)!.requires) {
      assert(targetGoalIds.has(predecessor) || prerequisiteOnlyGoalIds.has(predecessor), `${name}: direct route prerequisite missing: ${predecessor}`)
    }
  }
  for (const decision of memory.filter((item) => item.status === 'memory_required' && targetGoalIds.has(item.goalId))) {
    assert(decision.memoryGoalIds?.some((id) => targetGoalIds.has(id)), `${name}: required memory support missing: ${decision.goalId}`)
  }
}
assert.equal(checkedHe, 4)
console.log(`HE Q2.1 regression passed: ${checkedHe} GK views, 10 shared goals, 3 local assessments; ${checkedOther} other views exclude the new HE assessments; native requires-derived/child-union applicability, current caches, memory visibility and removed prerequisite coupling checked.`)
