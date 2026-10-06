// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'

const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const read = async (p: string) => JSON.parse(await readFile(p, 'utf8'))
const { model: current } = await loadGoalBookBuildInputs(resolve(root, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
const proposed = await read(resolve(own, 'prospective-full.book-model.json'))
const before = await read(resolve(own, 'central-before.actual.json'))
const strict = new Set(before.subjects.find((s: any) => s.subject === 'biologie').strictCompleteGoalIds)
const oldBy = new Map(current.pages.map((p: any) => [p.goalId, p]))
const deltas = proposed.pages.flatMap((p: any) => {
  const previous = oldBy.get(p.goalId)
  if (JSON.stringify(previous) === JSON.stringify(p)) return []
  const fields = [...new Set([...Object.keys(previous ?? {}), ...Object.keys(p)])]
    .filter(k => JSON.stringify((previous as any)?.[k]) !== JSON.stringify(p[k]))
  return [{ goalId: p.goalId, strictBefore: strict.has(p.goalId), changedPageFields: fields,
    currentPage: previous, candidatePage: p }]
})
const receipt = { checkedAt: new Date().toISOString(), currentPages: current.pages.length,
  candidatePages: proposed.pages.length, currentModelDigest: current.digest,
  candidateModelDigest: proposed.digest, pageDeltas: deltas.length,
  affectedStrictGoalIds: deltas.filter((d: any) => d.strictBefore).map((d: any) => d.goalId),
  nativeInputComparisonOnly: true, activeWrites: 0, humanApproval: false,
  claimLimit: 'Every changed page/context requires targeted independent review. WholeGoal preservation alone does not certify page bindings.', deltas }
await writeFile(resolve(own, 'four-native-full-page-footprint.actual.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ pageDeltas: receipt.pageDeltas, affectedStrictGoalIds: receipt.affectedStrictGoalIds, activeWrites: 0 }))
