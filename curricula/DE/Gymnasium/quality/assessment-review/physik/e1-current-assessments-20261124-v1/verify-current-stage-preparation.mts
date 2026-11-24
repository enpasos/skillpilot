// SPDX-License-Identifier: Apache-2.0
// Run from the repository root with app/node_modules/.bin/tsx.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const base = 'curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1'
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const fileDigest = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const objectDigest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')
const { normalizeCanonicalLandscape } = await import(pathToFileURL(resolve('app/src/utils/authoring/canonicalAuthoring.ts')).href)
const { collectWholeMaterialPrerequisiteClosure } = await import(pathToFileURL(resolve('app/scripts/generateCurriculumQualityStatus.ts')).href)
const review = read(`${base}/current-stage-preparation.actual.json`)
for (const input of [review.predecessorPreparation, review.predecessorStageReview, review.predecessorEndpointReview, ...review.predecessorEndpointInputs, ...review.evidence]) {
  assert.equal(fileDigest(input.path), input.sha256, `Bound input changed: ${input.path}`)
}
const docs = ['PHYSIK', 'MATHEMATIK', 'CHEMIE'].map(subject =>
  read(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`))
const catalog = { ...docs[0], goals: docs.flatMap(doc => doc.goals) }
type Goal = { id: string; [field: string]: unknown }
const index = (items: Goal[]) => new Map(items.map(goal => [goal.id, goal]))
const raw = index(catalog.goals)
const normalized = index(normalizeCanonicalLandscape(catalog).goals)
const historicalRows = read(review.predecessorPreparation.path).goals
const priorGoals = index(historicalRows.map((row: {goal: Goal}) => row.goal))
assert.equal(raw.size, catalog.goals.length)
assert.equal(priorGoals.size, 71)
for (const file of review.predecessorEndpointInputs) {
  for (const { goal } of read(file.path).goals) {
    if (priorGoals.has(goal.id)) assert.deepEqual(priorGoals.get(goal.id), goal)
    priorGoals.set(goal.id, goal)
  }
}
const dependencies = new Set<string>()
for (const row of [...review.assessments, ...review.rejected]) {
  const closure = collectWholeMaterialPrerequisiteClosure(catalog, row.goalId)
  assert.equal(closure.unresolvedReferences.size, 0)
  assert.deepEqual([...closure.atomicGoalIds].sort(), row.fullRealPrerequisiteIds)
  row.fullRealPrerequisiteIds.forEach((id: string) => dependencies.add(id))
}
for (const row of review.assessments) {
  assert.equal(objectDigest(raw.get(row.goalId)), row.assessmentRawSha256)
  assert.equal(objectDigest(normalized.get(row.goalId)), row.assessmentNormalizedSha256)
}
const oldGapReview = read(review.predecessorEndpointReview.path)
const oldRejections = [oldGapReview.circleDecision, ...oldGapReview.energyDecision.candidates]
assert.deepEqual(review.rejected.map((r: {goalId: string}) => r.goalId), oldRejections.map(r => r.taskId))
for (const row of review.rejected) {
  dependencies.add(row.goalId)
  assert.equal(row.decision, 'NOT_APPROVED_SOURCE_STAGE')
  assert.deepEqual(row.fullRealPrerequisiteIds, oldRejections.find(r => r.taskId === row.goalId).closureGoalIds)
}
const sourcePlan = read('scripts/generate_laender_physics_stage_views.sources.json')
assert.equal(sourcePlan.reviewedLowerAssessmentBindings.SN.assessments[oldGapReview.circleDecision.taskId], undefined)
for (const item of oldGapReview.circleDecision.preservedLowerSeedExclusions) {
  assert.deepEqual(sourcePlan.reviewedLowerSourceMembership.decisions.SN[item.goalId], item.decision)
}
assert.deepEqual([...dependencies].sort(), review.payloads.map((row: { goalId: string }) => row.goalId))
for (const row of review.payloads) {
  const goal = raw.get(row.goalId)
  assert(goal)
  assert.equal(objectDigest(goal), row.rawSha256, row.goalId + ' exact authored preparation')
  assert.equal(objectDigest(normalized.get(row.goalId)), row.normalizedSha256, row.goalId + ' exact native preparation')
  const old = priorGoals.get(row.goalId)
  if (old) {
    const expected = structuredClone(old)
    for (const delta of row.reviewedChanges) {
      assert.deepEqual(expected[delta.field], delta.before)
      expected[delta.field] = delta.after
    }
    assert.deepEqual(goal, expected, row.goalId + ' only reviewed changes after the predecessor')
  } else {
    assert.deepEqual(goal, row.newPreparationGoal)
  }
}
console.log(`Current source-stage assessment preparation verified for ${review.assessments.length} offers and ${dependencies.size} exact payloads.`)
