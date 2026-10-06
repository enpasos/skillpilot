// SPDX-License-Identifier: Apache-2.0
import { readFileSync } from 'node:fs'
import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
void (async () => {
  const result = await loadGoalDescriptionRolloutInFlightLedger()
  const report = JSON.parse(readFileSync('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-q1-bacteria-e7-integration-v1/integrated-central-after-e7-current.stdout.txt', 'utf8'))
  let open = 0
  for (const batch of result.activeBatches) {
    const subject = report.subjects.find((entry: {subject: string}) => entry.subject === batch.config.subject)
    if (!subject) throw new Error('Missing current subject')
    const current = new Set(subject.currentGoalIds)
    const complete = new Set(subject.strictCompleteGoalIds)
    for (const id of batch.config.goalIds) {
      if (complete.has(id)) throw new Error('Already complete goal claimed: ' + id)
      if (!current.has(id)) throw new Error('Non-current goal claimed: ' + id)
      open += 1
    }
  }
  console.log(JSON.stringify({status:'PASS_NATIVE_LEDGER_AND_CURRENT_SCOPE', packages:result.activeBatches.length, uniqueOpenCurrentGoalIds:open, duplicateClaims:false, completedClaims:false}))
})().catch((error: unknown) => { console.error(error); process.exitCode = 1 })
