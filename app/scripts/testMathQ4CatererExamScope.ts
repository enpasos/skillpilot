import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SkillLandscape } from '../src/landscapeTypes'
import {
  collectCompositionProjectionRoleGoalIds,
  normalizeCompositionView,
} from '../src/utils/authoring/compositionViewAuthoring'
import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const viewDir = 'curricula/DE/Gymnasium/composition-views/mathematik'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const examId = '3095e125-fbb7-51c6-bf12-ffbb1735b9b7'
const coveredIds = [
  'fde351a8-98b1-5d75-b4df-813beb2bbe3c', // model equations and their meaning
  '8d2021d0-aa14-5023-998b-187356de7986', // calculate the cost comparison
  '70f37fda-545f-51dc-a002-c8e435e5c4a5', // interpret the decision in context
  '5836c821-d43b-5c02-9ee5-e86bb87bb054', // state model limitations
]

const landscape = readJson(canonicalPath) as SkillLandscape
const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const examGoal = goalById.get(examId)
assert(examGoal?.examData, 'Missing Q4 Caterer exam')
const exam = examGoal.examData
assert.deepEqual(examGoal.requires, coveredIds, 'Exam prerequisites must match the four assessed atoms exactly')
assert.deepEqual(exam.coveredGoalIds, coveredIds, 'Exam coverage must match the four assessed atoms exactly')
assert.deepEqual(examGoal.dimensionTags?.guidingIdeas, ['L1', 'L4'], 'Only number and functional-relation strands are assessed')
assert.deepEqual(exam.coveredStrands, ['L1', 'L4'])

const kinds = readJson(kindPath) as {
  decisions: Array<{ goalId: string, semanticKind: string, decisionStatus: string, sourceFingerprint: string }>
}
for (const id of coveredIds) {
  const goal = goalById.get(id)
  assert(goal, `Missing assessed goal ${id}`)
  assert.deepEqual(goal.contains, [], `${id}: coverage must name an atomic goal, not a cluster`)
  assert(goal.tags?.includes('GK') && goal.tags.includes('LK'), `${id}: the shared exam must not require an LK-only goal`)
  const decisions = kinds.decisions.filter((entry) => entry.goalId === id)
  assert.equal(decisions.length, 1, `${id}: expected one semantic-kind decision`)
  assert.equal(decisions[0].semanticKind, 'curricularAtomic')
  assert.equal(decisions[0].decisionStatus, 'authoritative')
  assert.equal(decisions[0].sourceFingerprint, fingerprintSemanticKindSourceGoal(goal as unknown as Record<string, unknown>), `${id}: stale semantic-kind binding`)
}

// A direct GK/LK tag is insufficient if an LK-only prerequisite is hidden
// further upstream in the canonical requires route.
const examined = new Set<string>()
const examining = new Set<string>()
const checkPrerequisites = (id: string) => {
  assert(!examining.has(id), `Requires cycle at ${id}`)
  if (examined.has(id)) return
  const goal = goalById.get(id)
  assert(goal, `Missing prerequisite ${id}`)
  assert(!(goal.tags?.includes('LK') && !goal.tags.includes('GK')), `LK-only prerequisite in GK exam route: ${id}`)
  examining.add(id)
  for (const required of goal.requires ?? []) checkPrerequisites(required)
  examining.delete(id)
  examined.add(id)
}
for (const id of coveredIds) checkPrerequisites(id)
assert(!examined.has(examId), 'Exam cannot be its own transitive prerequisite')

const task = exam.taskContent ?? ''
const solution = exam.solutionContent ?? ''
assert.equal([...task.matchAll(/^\d\. /gmu)].length, 4, 'Expected four task parts')
assert.equal([...solution.matchAll(/^\d\. /gmu)].length, 4, 'Expected four solution parts')
assert.match(task, /nichtnegative ganze Zahl/u, 'Meal count must have a discrete, nonnegative domain')
assert.match(task, /1\. .*Kostenfunktionen.*Bedeutung der Summanden/u)
assert.match(task, /2\. .*kleinste Anzahl Essen.*günstiger/u)
assert.match(task, /3\. .*120.*Entscheiden|3\. Entscheiden.*120/u)
assert.match(task, /4\. .*mindestens zwei Aspekte der Realität/u)
for (const fragment of ['250', '4{,}20', '80', '5{,}10']) {
  assert(task.includes(fragment), `Missing Caterer tariff ${fragment}`)
}

const costA = (meals: number) => 250 + 4.2 * meals
const costB = (meals: number) => 80 + 5.1 * meals
const firstCheaperCount = Math.floor((250 - 80) / (5.1 - 4.2)) + 1
assert.equal(firstCheaperCount, 189)
assert(costA(firstCheaperCount - 1) >= costB(firstCheaperCount - 1))
assert(costA(firstCheaperCount) < costB(firstCheaperCount))
assert.equal(costA(120), 754)
assert.equal(costB(120), 692)
assert.equal(costA(120) - costB(120), 62)
for (const fragment of [
  'K_A(x)=250+4{,}2x', 'K_B(x)=80+5{,}1x',
  '189', 'kleinste mögliche Anzahl Essen',
  'K_A(120)=250+4{,}2\\cdot 120=754',
  'K_B(120)=80+5{,}1\\cdot 120=692',
  '62\\,\\mathrm{EUR}',
  'Qualitätsunterschiede', 'Lieferkosten',
]) {
  assert(solution.includes(fragment), `Missing or changed solution evidence: ${fragment}`)
}
assert.match(solution, /Grundgebühren.*Preise.*pro Essen/u, 'Cost model terms need a contextual interpretation')
assert.match(solution, /keine vollständige Entscheidungsgrundlage/u, 'Model limitations need a qualified conclusion')
assert.equal(exam.scoring?.maxPoints, 20)
assert.deepEqual(exam.scoring?.steps?.map((step) => step.points), [4, 6, 4, 6])
assert.equal(exam.scoring?.steps?.reduce((sum, step) => sum + step.points, 0), 20)

const targetViews: string[] = []
const gkTargetViews: string[] = []
const missingByView: string[] = []
for (const name of readdirSync(resolve(repoRoot, viewDir)).filter((entry) => entry.endsWith('.view.json'))) {
  const view = normalizeCompositionView(readJson(`${viewDir}/${name}`))
  const { targetGoalIds, prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  if (!targetGoalIds.has(examId)) continue
  targetViews.push(name)
  if (name.includes('-gk')) gkTargetViews.push(name)
  const unavailable = coveredIds.filter((id) => !targetGoalIds.has(id) && !prerequisiteOnlyGoalIds.has(id))
  if (unavailable.length) missingByView.push(`${name}: ${unavailable.join(', ')}`)
}
assert(targetViews.length > 0, 'No learner-facing composition view contains the exam')
assert(gkTargetViews.length > 0, 'No GK composition view contains the shared exam')
assert.deepEqual(missingByView, [], `Exam prerequisites are absent in target views:\n${missingByView.join('\n')}`)
console.log(`Q4 Caterer exam: four current GK/LK atoms, four task parts, and ${targetViews.length} target views (${gkTargetViews.length} GK) verified`)
