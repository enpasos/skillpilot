import { createHash } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const roots = [
  { label: 'main', root: '/home/enpasos/projects/skillpilot' },
  { label: 'F', root: '/mnt/e/skillpilot-chemie-L7-20261017/current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule' },
]
const observedAt = new Date().toISOString()
const results = []
for (const { label, root } of roots) {
  const api = await import(pathToFileURL(`${root}/app/scripts/materializeGoalDescriptionRolloutBatch.ts`).href)
  const loaded = await api.loadGoalDescriptionRolloutInFlightLedger()
  results.push({
    label,
    root,
    exportName: 'loadGoalDescriptionRolloutInFlightLedger',
    argument: 'omitted; stock default ledger',
    ledgerPath: loaded.ledgerPath,
    ledgerSha256: createHash('sha256').update(loaded.ledgerBytes).digest('hex'),
    returnKeys: Object.keys(loaded),
    activeBatchCount: loaded.activeBatches.length,
    claimCount: loaded.activeBatches.reduce((sum, batch) => sum + batch.config.goalIds.length, 0),
    activeBatches: loaded.activeBatches.map((batch) => ({
      configPath: batch.configPath,
      configSha256: createHash('sha256').update(batch.configBytes).digest('hex'),
      batchId: batch.config.batchId,
      subject: batch.config.subject,
      baseGoalBookConfigPath: batch.config.baseGoalBookConfigPath,
      goalIds: batch.config.goalIds,
      outputDirectory: batch.outputDirectory,
    })),
  })
}
const result = {
  observedAt,
  completedAt: new Date().toISOString(),
  operation: 'Only the stock exported ledger loader; no prepare, selection, renderer, central, compiler, PDF or review call',
  command: 'TSX_DISABLE_CACHE=1 node --import /home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs /mnt/e/skillpilot-chemie-L7-20261017/current439-jurisdiction-only-native20-preparation-technical-c-v1/ownership-audit/load-ledger-readonly.mts',
  results,
}
const path = '/mnt/e/skillpilot-chemie-L7-20261017/current439-jurisdiction-only-native20-preparation-technical-c-v1/ownership-audit/ACTUAL.stock-ledger-loader.json'
await writeFile(path, `${JSON.stringify(result, null, 2)}\n`, { flag: 'wx' })
console.log(JSON.stringify({ path, observedAt, results: results.map(({ label, activeBatchCount, claimCount, ledgerSha256 }) => ({ label, activeBatchCount, claimCount, ledgerSha256 })) }))
