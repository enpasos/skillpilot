// SPDX-License-Identifier: Apache-2.0
// Actual ordinary loader verification after guarded adoption, not a new scientific review.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs'
import {dirname, resolve, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs, stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url))
const author = resolve(own, '../biologie-upper-science-fourteen-whole-author-v1/native-targeted-two-v2')
const entry = JSON.parse(readFileSync(resolve(author, 'neutral-targeted-two-native-independent-review.entry.json'), 'utf8'))
const expectedPath = resolve(root, entry.actualFullCandidateModelPath)
const expected = JSON.parse(readFileSync(expectedPath, 'utf8'))
const {model} = await loadGoalBookBuildInputs(resolve(root, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
assert.equal(model.pages.length, 394)
assert.equal(expected.pages.length, 394)
const expectedPages = new Map<string, any>(expected.pages.map((page: any) => [page.goalId, page]))
const differences = model.pages.flatMap(page => {
  const previous = expectedPages.get(page.goalId)
  assert.ok(previous, page.goalId)
  const keys = new Set([...Object.keys(page), ...Object.keys(previous)])
  const changedFields = [...keys].filter(key => stableGoalBookJson((page as any)[key]) !== stableGoalBookJson(previous[key]))
  return changedFields.length ? [{goalId: page.goalId, changedFields}] : []
})
const diagnostics = {schemaVersion: 1, verifiedAt: new Date().toISOString(),
  ordinaryCurrentPublicLoader: true, actualPageCount: 394,
  exactFinalWholeCandidatePageCount: model.pages.length - differences.length,
  differences, finalIndependentTargetedFrame: {
    path: relative(root, expectedPath), sha256: 'sha256:' + createHash('sha256').update(readFileSync(expectedPath)).digest('hex'),
  }, actualModelDigest: model.digest, newScientificReviewClaimed: false,
  humanApproval: false, humanTrial: false}
mkdirSync(resolve(own, 'checks'), {recursive: true})
writeFileSync(resolve(own, 'checks/current394-fourteen-native-frame.actual.json'), JSON.stringify(diagnostics, null, 2) + '\n', {flag: 'wx'})
assert.deepEqual(differences, [], 'All whole current394 pages must equal the actually reviewed final frame')
console.log('PASS: ordinary current loader, all394 whole pages exact; prior12 reviews and targeted2 final contexts retained')
