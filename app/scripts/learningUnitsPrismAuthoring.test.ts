import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { atomicRelation, canonicalJson, digest, fullClosure, goalMeaning, mathCanonicalPath, reachable, type MathGoal } from './learningUnitsMathAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const load = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const config = load('app/scripts/config/learning-units/math-right-prisms-volume-surface.json')
const original = JSON.parse(execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${config.baselineRef}:${mathCanonicalPath}`],
  { cwd: root, encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 })) as { goals: MathGoal[] }
const current = load(mathCanonicalPath) as { goals: MathGoal[]; programUnits: Array<{ id: string; learningUnit?: { requiredChildUnitIds: string[] } }>; goalPlacements: Array<{ unitId: string; acquisition?: boolean }> }
const contract = load(`curricula/DE/Gymnasium/learning-units/contracts/${config.contractId}/${config.revision}.json`)
const proof = load('curricula/DE/Gymnasium/quality/learning-units/math-right-prisms-2026-11-05/structural-proof.json')
const currentGoals = new Map(current.goals.map(goal => [goal.id, goal]))
for (const before of original.goals) {
  const after = currentGoals.get(before.id); assert.ok(after, `Lost original goal ${before.id}`)
  assert.deepEqual(goalMeaning(after), goalMeaning(before), `Changed original fixed goal meaning ${before.id}`)
}
const frozenSource = load('curricula/DE/Gymnasium/learning-units/sources/math-2026-11-05-prisms-v1.source.json').landscapes[0] as { goals: MathGoal[] }
const added = frozenSource.goals.filter(goal => !original.goals.some(original => original.id === goal.id))
assert.deepEqual(added.map(goal => goal.id), [config.assessmentGoalId])
assert.deepEqual(added[0].requires, config.ownOrdinaryGoalIds)
assert.deepEqual(added[0].examData?.coveredGoalIds, config.ownOrdinaryGoalIds)
assert.ok(!contract.ownGoalIds.includes(config.excludedOldPrerequisiteId))
assert.ok(!(config.excludedOldPrerequisiteId in contract.atomicPrerequisites))
assert.equal(contract.ownGoalIds.length, 3)
assert.deepEqual(contract.ownRecallGoalIds, [])
assert.deepEqual(contract.requiredChildContractRefs, [])
assert.deepEqual(current.programUnits.find(unit => unit.id === config.programUnitId)?.learningUnit?.requiredChildUnitIds, [])
assert.equal(current.goalPlacements.filter(placement => placement.unitId === config.programUnitId && placement.acquisition).length, 3)
const actual = atomicRelation(current.goals)
const expectedContext = [...reachable(contract.ownGoalIds, actual)].sort()
assert.deepEqual(Object.fromEntries(expectedContext.map(id => [id, actual[id]])), contract.atomicPrerequisites)
for (const [goalId, prerequisites] of Object.entries(contract.atomicPrerequisites) as Array<[string, string[]]>) {
  for (const prerequisite of prerequisites) assert.ok(!reachable(prerequisites.filter(id => id !== prerequisite), contract.atomicPrerequisites).has(prerequisite), `Redundant frozen prerequisite ${goalId}->${prerequisite}`)
}
const beforeR = fullClosure(atomicRelation(original.goals))
const afterR = fullClosure(actual)
for (const [goalId, demand] of Object.entries(beforeR)) assert.deepEqual(afterR[goalId], demand, `Changed an original transitive demand ${goalId}`)
assert.equal(proof.reductionFullReachabilityBeforeSha256, proof.reductionFullReachabilityAfterSha256)
const oldMaterial = JSON.parse(execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${config.materialRef}:${mathCanonicalPath}`],
  { cwd: root, encoding: 'utf8', maxBuffer: 12 * 1024 * 1024 })) as { goals: MathGoal[] }
const oldExam = oldMaterial.goals.find(goal => goal.id === config.assessmentGoalId)!.examData!
const newExam = currentGoals.get(config.assessmentGoalId)!.examData!
assert.deepEqual({ taskContent: newExam.taskContent, solutionContent: newExam.solutionContent, scoring: newExam.scoring },
  { taskContent: oldExam.taskContent, solutionContent: oldExam.solutionContent, scoring: oldExam.scoring }, 'Historical reviewed normal performance changed')
assert.equal(digest(canonicalJson({ taskContent: newExam.taskContent, solutionContent: newExam.solutionContent })), contract.assessmentClaims[config.assessmentGoalId].taskRevision)
assert.equal(digest(canonicalJson(newExam.scoring)), contract.assessmentClaims[config.assessmentGoalId].rubricRevision)
console.log('Prism source proof passed: 807 ordinary meanings preserved, one new Q, 978 original demand closures unchanged, minimal frozen own-context and exact historical task/rubric')
