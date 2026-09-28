import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Read-only guard for the candidate's factual baseline and arithmetic. It is
// deliberately not a release/approval check and never writes canonical data.
const root = resolve(import.meta.dirname, ...Array(9).fill('..'))
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const graph = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')
const extraction = read('curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-27/aeae-k6-source-assessment-candidate-20260927-v1/DE_HE_MATHEMATIK_SEKII_KC2024_PROCESS_K6.candidate.source-extraction.json')
const byId = new Map(graph.goals.map(goal => [goal.id, goal]))

const specs = [
  ['canonical_math_sek2_q4_assessment_he_k6_notation_function_family', '0232b2b3-5a2e-55b7-80f5-002d2ebe65ae', 'aeae526e-b3a4-5a17-b177-351df0307cb9', ['GK', 'LK'], [1, 1, 1, 1, 2], 6, 3],
  ['canonical_math_sek2_q4_assessment_he_k6_response_function_family', '7fa5c39c-ed29-53b3-8bf1-f3ec240cd40b', '83a6ccb1-576e-59e1-8a97-8a332ec7dda8', ['GK', 'LK'], [2, 1, 2, 1], 6, 3],
  ['canonical_math_sek2_q4_assessment_he_k6_reflection_function_family', 'deb1df32-7d99-5f67-8cf7-3bc4ba75c6c2', '8b635349-abc3-59e7-af93-ec28940bf690', ['GK', 'LK'], [1, 3, 2], 6, 3],
  ['canonical_math_sek2_q4_assessment_he_k6_cooperation_function_family', '3c92e589-6b2a-57db-8497-a877e9e7dfa9', 'fc2cf102-dcde-5565-884f-7c9e3e3b54b6', ['GK', 'LK'], [2, 2, 2, 2], 8, 4],
  ['canonical_math_sek2_q4_assessment_he_lk_k6_precision_function_family', '9b9b0e7a-f6be-5554-8979-9b421e4fd8a0', 'b35f8254-dfcc-5d4d-b77f-7b182999617f', ['LK'], [2, 2, 2, 2], 8, 4],
]
const stableId = shortKey => {
  const hex = createHash('sha1').update('DE-GYM-CANONICAL-MATH:' + shortKey).digest('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

assert.equal(graph.landscapeId, '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')
assert.equal(extraction.jurisdiction, 'DE-HE')
for (const [shortKey, candidateId, coveredId, courses, points, max, pass] of specs) {
  assert.equal(stableId(shortKey), candidateId, `candidate ID for ${shortKey}`)
  assert.equal(byId.has(candidateId), false, `candidate ${candidateId} must remain noncanonical`)
  const goal = byId.get(coveredId)
  assert.ok(goal, `covered goal ${coveredId}`)
  for (const course of courses) assert.ok(goal.tags.includes(course), `${coveredId} missing ${course}`)
  assert.equal(points.reduce((sum, score) => sum + score, 0), max, `rubric sum ${candidateId}`)
  assert.equal(pass * 2, max, `threshold ${candidateId}`)
}
const oldExam = byId.get('b9a501c4-9d74-5514-b77b-895980b89b1b')
const claimed = ['aeae526e-b3a4-5a17-b177-351df0307cb9', '83a6ccb1-576e-59e1-8a97-8a332ec7dda8', 'fc2cf102-dcde-5565-884f-7c9e3e3b54b6', '8b635349-abc3-59e7-af93-ec28940bf690', 'b35f8254-dfcc-5d4d-b77f-7b182999617f']
assert.deepEqual(oldExam.requires, claimed)
assert.deepEqual(oldExam.examData.coveredGoalIds, claimed)
assert.deepEqual(oldExam.tags.slice(0, 2), ['GK', 'LK'])
assert.equal(oldExam.examData.reviewStatus, 'released')
assert.equal(oldExam.examData.scoring.maxPoints, 20)
assert.equal(oldExam.examData.scoring.passingPoints, 10)
assert.equal(extraction.sourceGoals.find(goal => goal.standardId === 'K6.1')?.demandLevel, 'AB1')
assert.equal(extraction.sourceGoals.find(goal => goal.standardId === 'K6.2')?.demandLevel, 'AB1')
assert.equal(extraction.sourceGoals.find(goal => goal.standardId === 'K6.3')?.demandLevel, 'AB2')
const f = (a, x) => x * x + a * x
assert.equal(f(2, 1), 3)
assert.equal(f(-1, 2), 2)
assert.equal(f(1, 1), 2)
assert.equal(f(2, -2), 0)
assert.equal(f(-2, 2), 0)
for (const a of [-4, -1, 0, 1, 3]) {
  assert.equal(f(a, 0), 0)
  assert.equal(f(a, -a), 0)
  assert.ok(Math.abs(f(a, -a / 2) + a * a / 4) < 1e-12)
}
console.log('CHECK aeae_k6_q4_assessment_candidate baseline=5 items=5 math=pass source-AB=pass; candidate only, no release')
