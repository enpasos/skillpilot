import assert from 'node:assert/strict'
import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const directory = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-M7-current346-final-machine-closure-root-v1'
const before = await loadGoalDescriptionRolloutInFlightLedger(`${directory}/in-flight-before-final24-retirement.EXACT.json`)
const after = await loadGoalDescriptionRolloutInFlightLedger(`${directory}/in-flight-only-six-foreign-claims-final346.CANDIDATE.json`)
const retired = before.activeBatches.filter(({config}) => config.subject === 'wirtschaftswissenschaften')
assert.equal(retired.flatMap(({config})=>config.goalIds).length,24)
assert.equal(after.activeBatches.filter(({config})=>config.subject === 'wirtschaftswissenschaften').length,0)
assert.equal(after.activeBatches.length,6)
assert.deepEqual(before.activeBatches.filter(({config}) => config.subject !== 'wirtschaftswissenschaften').map(({configPath,configBytes})=>[configPath,configBytes.toString()]),after.activeBatches.map(({configPath,configBytes})=>[configPath,configBytes.toString()]))
console.log(JSON.stringify({status:'PASS',retiredCurrentStrictClaims:24,remainingEconomicsClaims:0,foreignBatchesWholeExact:6,duplicateClaims:0,humanApproval:false}))
