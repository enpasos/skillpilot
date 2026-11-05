import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import { loadGoalBookBuildInputs } from './goalBookModel'

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
const reviewedCoverage: Record<string, string[]> = {
  'b321e32c-1dff-5529-8200-6879ee8fb10b': [spatId, tetraId],
  'd110ab96-275e-5ccb-8851-e02725baf31c': ['c71ae268-f28e-59f0-982d-91db8f963378', 'e8237315-654e-5150-97de-49c4cb49b3d1', '2f2c9f1a-07f0-59e4-b84a-60648c3b0bda'],
  '938d47a2-5d7c-52d6-8644-5cc6060d76a1': [lkVolumeDerivationId],
  'e98672c6-871a-5d0b-889c-5afc51040f0d': ['3016ec37-1c2e-47db-83f5-e767923bc97e'],
  'e3c70a12-7886-51f7-8bcd-ed54865415d6': ['ed5d869b-af4e-4b80-b34d-a2338e16ce34'],
  '4f85d29a-bd52-5f21-8b57-55def4440e1b': ['6fc9246a-9448-4cdb-b627-cf20ea1c65d3', '54cfe5ce-693e-5d4a-ac1b-009570fbbc11'],
  '03b00864-7001-5c6a-875b-dc269b3484d9': ['06de364f-9b63-4044-8229-a975621dc6df'],
  'bc244d82-bac0-5b13-8a33-d7b101835480': ['baf7276f-60a0-4d96-b959-d63acfb929de'],
  '60dbe2ed-55fb-5352-8829-1ea23fbee024': ['509ae03b-96b1-4bb1-b015-b83d14569dae'],
  '240f7716-7c6f-5705-876e-8046fd8a6720': ['8eb14d81-353a-4909-9464-61be7b1ba5b8'],
  '6cff2b2e-be7f-531a-8849-e5fb3a55978a': ['eb6bfdd9-3cbe-51b5-9798-a741bdc2782e'],
  '9809780d-c860-5a79-87ec-2a3479cc7f1f': ['ef1524f1-0b2f-59f7-a001-5ab3e3dececb'],
}
const fullRequires = (goalId: string): Set<string> => {
  const reached = new Set<string>()
  const pending = [...(byId.get(goalId)?.requires ?? [])]
  while (pending.length > 0) {
    const id = pending.pop()!
    assert.ok(byId.has(id), `Unknown preparation goal ${id}`)
    if (reached.has(id)) continue
    reached.add(id)
    pending.push(...(byId.get(id)?.requires ?? []))
  }
  return reached
}
for (const exam of exams) {
  assert.deepEqual(exam.examData?.coveredGoalIds, reviewedCoverage[exam.id], `Reviewed coverage changed ${exam.id}`)
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
    const preparation = fullRequires(exam.id)
    assert.ok(covered.every((id) => preparation.has(id)),
      `${filename}: assessment preparation no longer includes its reviewed coverage ${exam.id}`)
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

const { model } = await loadGoalBookBuildInputs(atlasConfig)
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
