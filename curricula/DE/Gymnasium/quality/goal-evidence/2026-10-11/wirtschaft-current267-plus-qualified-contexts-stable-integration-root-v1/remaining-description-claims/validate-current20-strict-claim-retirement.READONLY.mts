import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'

const root = process.cwd()
const directory = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current267-plus-qualified-contexts-stable-integration-root-v1/remaining-description-claims'
const oldPath = `${directory}/in-flight-before-current20-retirement.EXACT.json`
const candidatePath = `${directory}/in-flight-only-current-strict20-retired.CANDIDATE.json`
const [original, current] = await Promise.all([
  loadGoalDescriptionRolloutInFlightLedger(oldPath),
  loadGoalDescriptionRolloutInFlightLedger(candidatePath),
])
const report = JSON.parse(readFileSync(resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-fifth-M7-forty-five-qualified-owner-and-bounded-indirect-context-integration-root-v1/candidate45.current267.actual-native.raw.txt'), 'utf8'))
const strict = new Set<string>(report.subjects.find((s: { subject: string }) => s.subject === 'wirtschaftswissenschaften').strictCompleteGoalIds)
const oldEconomics = original.activeBatches.filter(({ config }) => config.subject === 'wirtschaftswissenschaften')
const newEconomics = current.activeBatches.filter(({ config }) => config.subject === 'wirtschaftswissenschaften')
assert.equal(oldEconomics.length, 6)
assert.equal(newEconomics.length, 6)
let retiredCount = 0
let remainingCount = 0
for (let i = 0; i < oldEconomics.length; i++) {
  const before = oldEconomics[i].config
  const after = newEconomics[i].config
  const remaining = before.goalIds.filter((id) => !strict.has(id))
  retiredCount += before.goalIds.length - remaining.length
  remainingCount += remaining.length
  assert.deepEqual(after.goalIds, remaining)
  assert.equal(after.batchId, `${before.batchId}-remaining-current291`)
  const { goalIds: _oldGoals, batchId: _oldBatch, outputDirectory: _oldOutput, ...oldFacts } = before
  const { goalIds: _newGoals, batchId: _newBatch, outputDirectory: _newOutput, ...newFacts } = after
  assert.deepEqual(newFacts, oldFacts)
  assert(after.goalIds.every((id) => !strict.has(id)))
}
assert.equal(retiredCount, 20)
assert.equal(remainingCount, 24)
assert.deepEqual(
  original.activeBatches.filter(({ config }) => config.subject !== 'wirtschaftswissenschaften').map(({ configPath, configBytes }) => [configPath, configBytes.toString()]),
  current.activeBatches.filter(({ config }) => config.subject !== 'wirtschaftswissenschaften').map(({ configPath, configBytes }) => [configPath, configBytes.toString()]),
)
console.log(JSON.stringify({ status: 'PASS', nativeLedgerAndSixConfigsValidated: true, duplicateClaims: 0, retiredStrictClaims: retiredCount, remainingEconomicsClaims: remainingCount, foreignClaimsWholeExact: true, scientificReviewClaim: false }))
