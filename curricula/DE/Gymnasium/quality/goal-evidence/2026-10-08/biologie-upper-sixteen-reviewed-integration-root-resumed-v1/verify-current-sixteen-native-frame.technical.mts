// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync, writeFileSync} from 'node:fs'
import {resolve, dirname, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs, stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url))
const native = resolve(own, '../biologie-upper-communication-evaluation-sixteen-native-author-technical-resumed-v1')
const entry = JSON.parse(readFileSync(resolve(native, 'neutral-sixteen-native-independent-review.entry.json'), 'utf8'))
const expectedPath = resolve(root, entry.actualFullCandidateModelPath)
const expected = JSON.parse(readFileSync(expectedPath, 'utf8'))
const ids = new Set<string>(entry.goalIds)
const {model} = await loadGoalBookBuildInputs(resolve(root, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
assert.equal(model.pages.length, 394)
const before = expected.pages.filter((page: any) => ids.has(page.goalId))
const now = model.pages.filter(page => ids.has(page.goalId))
assert.equal(before.length, 16)
assert.equal(now.length, 16)
const differences = now.flatMap(page => {
  const original = before.find((value: any) => value.goalId === page.goalId)
  const fields = Object.keys(page).filter(key => stableGoalBookJson((page as any)[key]) !== stableGoalBookJson(original[key]))
  return fields.length ? [{goalId: page.goalId, changedFields: fields}] : []
})
const diagnostic = {schemaVersion: 1, observedAt: new Date().toISOString(), ordinaryCurrentPublicLoader: true,
  actualPageCount: 394, selectedWholePages: 16, differences,
  originalActualReviewedFullModel: {path: relative(root, expectedPath), sha256: createHash('sha256').update(readFileSync(expectedPath)).digest('hex')},
  actualActiveModelDigest: model.digest, newScientificReviewByIntegrator: false, humanApproval: false}
writeFileSync(resolve(own, 'checks/current394-sixteen-native-frame.actual.json'), JSON.stringify(diagnostic, null, 2) + '\n', {flag: 'wx'})
assert.deepEqual(differences, [], 'Reviewed sixteen whole native pages must remain exact after the Basis2 supplement and current resource installation')
console.log('PASS: current ordinary public loader; all sixteen whole native pages and context equal the independently reviewed actual frame')
