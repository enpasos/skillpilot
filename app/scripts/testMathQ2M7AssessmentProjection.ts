import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import { loadGoalBookBuildInputs } from './goalBookModel'
import { loadVerifiedPrerequisiteReductionContext } from './prerequisiteReductionProof'

const root = resolve(import.meta.dirname, '../..')
const canonicalPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const viewDirectory = resolve(root, 'curricula/DE/Gymnasium/composition-views/mathematik')
const atlasConfig = resolve(root, 'app/scripts/config/goal-books/de-gym-math-national-atlas.json')
const landscapeId = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const lkVolumeDerivationId = 'e9181209-1506-59df-9053-17f36b91bb06'
const spatId = '944dd479-9f30-5acb-ab32-3ea0b6dc8e06'
const tetraId = 'a594dec0-3977-5c43-9432-d4254a7f6130'

type Scope = { jurisdiction: string; stage: string; durationModel?: string | null; courseProfile?: string | null }
const scopeKey = (scope: Scope) => [scope.jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('|')
const pageScopes = (page: { applicability?: Array<{ jurisdiction: string; scopes: Array<Omit<Scope, 'jurisdiction'>> }> }) => new Set(
  (page.applicability ?? []).flatMap(({ jurisdiction, scopes }) => scopes
    .filter((scope) => scope.stage === 'SekII' && ['GK', 'LK'].includes(scope.courseProfile ?? ''))
    .map((scope) => scopeKey({ jurisdiction, ...scope }))),
)

const canonical = JSON.parse(readFileSync(canonicalPath, 'utf8')) as { goals: Array<{
  id: string
  shortKey?: string
  tags?: string[]
  requires?: string[]
  examData?: { coveredGoalIds?: string[] }
  extendedData?: { applicabilityFromRequires?: boolean; applicabilityMappingInheritance?: string }
}> }
const byId = new Map(canonical.goals.map((goal) => [goal.id, goal]))
const exams = canonical.goals.filter((goal) => goal.shortKey?.startsWith('canonical_math_sek2_q2_m7_route_'))
assert.equal(exams.length, 12)

// The two certified atomic cuts reduce the directly authored prerequisite basis; task coverage stays
// exactly authored. These fixed cases do not infer coverage from reachability.
const reducedPreparationCases = new Map([
  ['b321e32c-1dff-5529-8200-6879ee8fb10b', {
    coveredGoalIds: [
      '944dd479-9f30-5acb-ab32-3ea0b6dc8e06',
      'a594dec0-3977-5c43-9432-d4254a7f6130',
    ],
    requires: ['a594dec0-3977-5c43-9432-d4254a7f6130'],
    witness: [
      'b321e32c-1dff-5529-8200-6879ee8fb10b',
      'a594dec0-3977-5c43-9432-d4254a7f6130',
      '944dd479-9f30-5acb-ab32-3ea0b6dc8e06',
    ],
  }],
  ['d110ab96-275e-5ccb-8851-e02725baf31c', {
    coveredGoalIds: [
      'c71ae268-f28e-59f0-982d-91db8f963378',
      'e8237315-654e-5150-97de-49c4cb49b3d1',
      '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda',
    ],
    requires: [
      'e8237315-654e-5150-97de-49c4cb49b3d1',
      '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda',
    ],
    witness: [
      'd110ab96-275e-5ccb-8851-e02725baf31c',
      'e8237315-654e-5150-97de-49c4cb49b3d1',
      'c71ae268-f28e-59f0-982d-91db8f963378',
    ],
  }],
])
for (const [id, expected] of reducedPreparationCases) {
  const exam = byId.get(id)
  assert.ok(exam && exams.includes(exam), `Missing certified Q2 M7 route ${id}`)
  assert.deepEqual(exam.examData?.coveredGoalIds, expected.coveredGoalIds,
    `The Q2 M7 task retains its exact authored coverage ${id}`)
  assert.deepEqual(exam.requires, expected.requires,
    `The Q2 M7 route retains its exact current raw preparation ${id}`)
  assert.notDeepEqual(exam.requires, exam.examData?.coveredGoalIds,
    `The certified Q2 M7 case must exercise distinct preparation and coverage ${id}`)
  // Atomic tail[668] / tail[538]: every edge is literal in the current raw DAG.
  for (let edge = 0; edge < expected.witness.length - 1; edge++) {
    const source = expected.witness[edge]
    const prerequisite = expected.witness[edge + 1]
    assert.ok(byId.get(source)?.requires?.includes(prerequisite),
      `Missing current literal Q2 preparation witness ${source} -> ${prerequisite}`)
  }
}

let viewCount = 0
let targetExamPairs = 0
for (const filename of readdirSync(viewDirectory).filter((name) => name.endsWith('.view.json'))) {
  const view = JSON.parse(readFileSync(resolve(viewDirectory, filename), 'utf8')) as {
    landscapeId: string
    scope: { jurisdiction?: string; stage?: string; durationModel?: string; courseProfile?: string }
    rootNodes: Parameters<typeof collectCompositionProjectionRoleGoalIds>[0]
  }
  if (view.landscapeId !== landscapeId || !['SekII', 'CrossStage'].includes(view.scope.stage ?? '') || !['GK', 'LK'].includes(view.scope.courseProfile ?? '')) continue
  viewCount++
  const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, byId)
  for (const exam of exams) {
    const covered = exam.examData?.coveredGoalIds ?? []
    assert.ok(covered.length > 0, `${filename}: empty exam coverage ${exam.id}`)
    if (!reducedPreparationCases.has(exam.id)) {
      assert.deepEqual(exam.requires, covered, `${filename}: assessment requires/coverage mismatch ${exam.id}`)
    }
    assert.equal((exam as { examData?: { scoring?: { maxPoints?: number; passingPoints?: number } } }).examData?.scoring?.passingPoints,
      (exam as { examData?: { scoring?: { maxPoints?: number; passingPoints?: number } } }).examData?.scoring?.maxPoints,
      `${filename}: total-only scoring could pass without an assessed competency ${exam.id}`)
    assert.equal(exam.extendedData?.applicabilityFromRequires, true, `${filename}: assessment applicability does not follow its prerequisites ${exam.id}`)
    assert.equal(exam.extendedData?.applicabilityMappingInheritance, 'boundary', `${filename}: assessment inherits unrelated source evidence ${exam.id}`)
    const shouldTarget = (exam.tags ?? []).includes(view.scope.courseProfile!) && covered.every((id) => targetGoalIds.has(id))
    assert.equal(targetGoalIds.has(exam.id), shouldTarget, `${filename}: exam target role disagrees with covered target goals ${exam.id}`)
    if (shouldTarget) targetExamPairs++
  }
  if (view.scope.courseProfile === 'GK') {
    assert.ok(!targetGoalIds.has(lkVolumeDerivationId), `${filename}: LK volume derivation remains a GK target`)
  }
  if (view.scope.jurisdiction === 'DE-HE' && view.scope.courseProfile === 'GK') {
    for (const id of [spatId, tetraId, lkVolumeDerivationId]) {
      assert.ok(prerequisiteOnlyGoalIds.has(id) && !targetGoalIds.has(id), `${filename}: HE GK incorrectly targets LK Q2.3 material ${id}`)
    }
  }
}
assert.ok(viewCount >= 32, 'Too few authored Mathematics Sek-II/CrossStage course views tested')

const prerequisiteReductionContext = await loadVerifiedPrerequisiteReductionContext()
const { model } = await loadGoalBookBuildInputs(atlasConfig, undefined, prerequisiteReductionContext)
const pages = new Map(model.pages.map((page) => [page.goalId, page]))
for (const id of [spatId, tetraId, lkVolumeDerivationId]) {
  const page = pages.get(id)
  assert.ok(page, `Missing projected curricular page ${id}`)
  const scopes = pageScopes(page)
  assert.ok(![...scopes].some((scope) => scope.startsWith('DE-HE|SekII|') && scope.endsWith('|GK')),
    `HE GK still projects LK Q2.3 content ${id}`)
}
const volumeDerivationPage = pages.get(lkVolumeDerivationId)!
assert.ok(![...pageScopes(volumeDerivationPage)].some((scope) => scope.endsWith('|GK')),
  'LK volume derivation still has an effective GK target page')
console.log(`Math Q2 M7 assessment projection passed: ${viewCount} views, ${targetExamPairs} authored target pairs, LK scope and 100%-part scoring verified.`)
