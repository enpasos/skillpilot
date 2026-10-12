import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const { loadGoalDescriptionRolloutInFlightLedger } = await import(pathToFileURL(
  resolve(process.cwd(), 'app/scripts/materializeGoalDescriptionRolloutBatch.ts'),
).href)

const result = await loadGoalDescriptionRolloutInFlightLedger()
console.log(JSON.stringify({
  normalUnmodifiedLoader: true,
  schemaValidatedActiveBatchCount: result.activeBatches.length,
  claimedGoalCount: result.activeBatches.reduce((count, batch) => count + batch.config.goalIds.length, 0),
  activeBatchConfigPaths: result.ledger.activeBatchConfigPaths,
}, null, 2))
