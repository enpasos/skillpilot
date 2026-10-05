// Apache-2.0. Scoped native ledger validation; does not modify curriculum data.
import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
const result=await loadGoalDescriptionRolloutInFlightLedger(process.argv[2])
console.log(JSON.stringify({packages:result.activeBatches.length,claimedGoalIds:result.activeBatches.reduce((n,b)=>n+b.config.goalIds.length,0),paths:result.ledger.activeBatchConfigPaths},null,2))
