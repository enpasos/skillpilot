import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const root = '/mnt/e/skillpilot-chemie-L7-20261017/current439-native6-actual-context-remediation-preparation-technical-a-v1'
const capsule = resolve(root, 'capsule')
const command = JSON.parse(await readFile(resolve(root, 'COMMAND.intended-exactly-one-native6-prepare.after-admin-ledger-check.json'), 'utf8'))
const entry = resolve(capsule, 'app/scripts/materializeGoalDescriptionRolloutBatch.ts')
const { loadGoalDescriptionRolloutInFlightLedger } = await import(pathToFileURL(entry).href)
const loaded = await loadGoalDescriptionRolloutInFlightLedger()
const actualHash = createHash('sha256').update(loaded.ledgerBytes).digest('hex')
if (actualHash !== command.activeLedger.sha256) throw new Error('New ledger bytes changed')
const owners: Record<string, string[]> = {}
let claimCount = 0
for (const row of loaded.activeBatches) {
  for (const gid of row.config.goalIds) {
    ;(owners[gid] ??= []).push(row.configPath)
    claimCount++
  }
}
for (const gid of command.exactSixOrder) {
  if (owners[gid]?.length !== 1 || owners[gid][0] !== command.config.path) {
    throw new Error(`Global active ownership is not unique for ${gid}: ${JSON.stringify(owners[gid])}`)
  }
}
if (loaded.activeBatches.length !== 16 || claimCount !== 174) throw new Error('Unexpected new active roster counts')
const result = {
  role: 'Actual stock ledger/schema API check plus global six-goal ownership; no prepare/render/Science',
  stockLoaderSucceeded: true,
  activeBatchConfigCount: loaded.activeBatches.length,
  activeClaimGoalCount: claimCount,
  ledgerSHA256: actualHash,
  globalSixUniqueOwners: Object.fromEntries(command.exactSixOrder.map((gid: string) => [gid, owners[gid]])),
  oldRAndFLedgersNotWritten: true,
  noScienceOrNativeVotes: true,
}
await writeFile(resolve(root, 'CHECK.actual-stock-ledger-schema-and-global-six-ownership.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify(result))
