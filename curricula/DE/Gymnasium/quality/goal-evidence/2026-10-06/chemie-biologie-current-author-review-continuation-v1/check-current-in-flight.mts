// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalDescriptionRolloutInFlightLedger } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const read = async (path: string) => JSON.parse(await readFile(resolve(root, path), 'utf8'))
const { activeBatches } = await loadGoalDescriptionRolloutInFlightLedger()
const central = await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-three-current383-author-continuation-v2/central-before.actual.json')
const errors: string[] = []
const all = new Set<string>()
for (const batch of activeBatches) {
  const subject = central.subjects.find((s: any) => s.subject === batch.config.subject)
  const valid = new Set(subject.currentGoalIds)
  const strict = new Set(subject.strictCompleteGoalIds)
  for (const goalId of batch.config.goalIds) {
    if (all.has(goalId)) errors.push(`duplicate current goal claim ${goalId}`)
    all.add(goalId)
    if (!valid.has(goalId)) errors.push(`not current curricularAtomic ${goalId}`)
    if (strict.has(goalId)) errors.push(`already strict-complete ${goalId}`)
  }
}
const receipt = { checkedAt: new Date().toISOString(),
  status: errors.length ? 'fail' : 'pass_native_current_in_flight_scope',
  configurations: activeBatches.length, currentOpenUniqueGoalIds: all.size,
  candidateReservationOnly: true, newStrictCompletions: 0, restoredStrictBindings: 0,
  humanApproval: false, errors }
await writeFile(resolve(own, 'current-in-flight.actual.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify(receipt))
if (errors.length) process.exitCode = 1
