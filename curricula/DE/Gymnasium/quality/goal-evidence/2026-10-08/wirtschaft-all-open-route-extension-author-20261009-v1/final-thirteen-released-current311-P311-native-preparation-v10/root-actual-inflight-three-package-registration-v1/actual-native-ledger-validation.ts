import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'

async function main() {
  const result = await loadGoalDescriptionRolloutInFlightLedger()
  const economics = result.activeBatches.filter(b => b.config.subject === 'wirtschaftswissenschaften')
  const ids = economics.flatMap(b => b.config.goalIds)
  if (economics.length !== 3 || ids.length !== 46 || new Set(ids).size !== 46) {
    throw new Error('Expected exactly three real Economics batches with 46 distinct goals')
  }
  console.log(JSON.stringify({ nativeLedgerValidation: 'PASS', activeBatches: result.activeBatches.length,
    economicsBatches: economics.length, economicsDistinctGoalClaims: new Set(ids).size,
    foreignBatches: result.activeBatches.length - economics.length, strictNet: 0 }))
}

main().catch(error => { console.error(error); process.exitCode = 1 })
