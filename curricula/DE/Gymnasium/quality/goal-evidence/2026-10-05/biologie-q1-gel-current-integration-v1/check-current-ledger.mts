// Apache-2.0. Validate actual native ledger and completed current IDs.
import { readFile, writeFile } from 'node:fs/promises'
import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
const own = new URL('.', import.meta.url)
const report = JSON.parse(await readFile(new URL('central-after-gel-current-v.report.json', own), 'utf8'))
const { activeBatches } = await loadGoalDescriptionRolloutInFlightLedger()
let activeGoalCount = 0
for (const { config } of activeBatches) {
  const subject = report.subjects.find((s: any) => s.subject === config.subject)
  for (const id of config.goalIds) {
    if (!subject.currentGoalIds.includes(id)) throw new Error(`Obsolete active ID ${id}`)
    if (subject.strictCompleteGoalIds.includes(id)) throw new Error(`Already strictly complete active ID ${id}`)
    activeGoalCount += 1
  }
}
const receipt = { status: 'pass', nativeLedgerValidation: true, activeBatchCount: activeBatches.length, activeGoalCount, obsoleteActiveIds: 0, alreadyStrictActiveIds: 0, machineCheckOnly: true, humanApprovalClaimed: false }
await writeFile(new URL('current-ledger.actual.receipt.json', own), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
