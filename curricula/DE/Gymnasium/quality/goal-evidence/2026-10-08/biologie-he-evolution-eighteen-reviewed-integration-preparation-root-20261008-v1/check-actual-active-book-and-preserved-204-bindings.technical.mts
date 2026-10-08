// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel.ts'
const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url)), base = resolve(own, '..')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const before = read(resolve(base, 'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1/native-eighteen-author/full392.current-before.real-loader.book-model.json'))
const { model } = await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
const selected = new Set(read(resolve(base, 'biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1/neutral-eighteen-current-raster-native-author-review.entry.json')).goalIds)
const oldBy = new Map(before.pages.map((p: any) => [p.goalId, p]))
assert.equal(model.pages.length, 392)
const protectedIds = read(resolve(base, 'biologie-he9-split-reviewed-active-integration-root-v1/affected-check-central.stdout.actual.txt')).subjects.find((s: any) => s.subject === 'biologie').strictCompleteGoalIds
assert.equal(protectedIds.length, 204)
let unchanged = 0
for (const page of model.pages) {
  if (!selected.has(page.goalId)) {
    assert.deepEqual(page, oldBy.get(page.goalId), 'Whole active unaffected page changed: ' + page.goalId)
    unchanged++
  }
  if (protectedIds.includes(page.goalId)) assert.deepEqual(page, oldBy.get(page.goalId))
}
assert.equal(unchanged, 374)
const output = resolve(own, 'actual-active392-book-and-preserved204-bindings.technical.json')
assert.equal(existsSync(output), false)
writeFileSync(output, JSON.stringify({ schemaVersion: 1, actualCompilerApi: 'loadGoalBookBuildInputs', actualActiveBookModelDigest: model.digest, actualCurrentAtomicPages: 392, other374WholePageObjectsAndFingerprintsExact: true, all204PreviousStrictWholePagesAndFingerprintsExact: true, selected18ImageAndTargetedTextChanges: 'genuine separately reviewed', newScientificReviewByThisTechnicalCheck: false, humanApproval: false }, null, 2) + '\n', { flag: 'wx' })
console.log(JSON.stringify({ actualActive392: 'PASS', other374WholePagesExact: true, protected204WholePagesExact: true }))
