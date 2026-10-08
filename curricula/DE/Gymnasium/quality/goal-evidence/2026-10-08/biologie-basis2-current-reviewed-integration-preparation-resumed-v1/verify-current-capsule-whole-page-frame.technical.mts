// SPDX-License-Identifier: Apache-2.0
// Technical exact-frame verification; no new independent scientific judgment.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
const own = dirname(fileURLToPath(import.meta.url))
const expected = JSON.parse(readFileSync(resolve(own, '../biologie-stoffwechsel-two-basic-companions-complete-author-20261008-v2/native/full394.actual-primary-refined.final-model.json'), 'utf8'))
const { model } = await loadGoalBookBuildInputs(resolve('app/scripts/config/goal-books/de-gym-biology-national-atlas.json'))
assert.equal(model.pages.length, 394)
const differences = model.pages.flatMap((page) => {
  const earlier = expected.pages.find((candidate: any) => candidate.goalId === page.goalId)
  if (!earlier || stableGoalBookJson(page) !== stableGoalBookJson(earlier)) {
    const keys = earlier ? [...new Set([...Object.keys(page), ...Object.keys(earlier)])]
      .filter((key) => stableGoalBookJson((page as any)[key]) !== stableGoalBookJson(earlier[key])) : ['MISSING_REVIEWED_PAGE']
    return [{ goalId: page.goalId, changedKeys: keys }]
  }
  return []
})
writeFileSync(resolve(own, 'checks/capsule-actual-whole394-page-frame.json'), JSON.stringify({
  actualPageCount: model.pages.length, expectedPageCount: expected.pages.length,
  wholePageDeltasToActuallyReviewedFinal394: differences,
  exactCurrentModelDigest: model.digest,
  actualTwoPageNativeDAndExistingWordContextGenuineSeparateFirstSeals: true,
  newScientificReviewByIntegrator: false, activeWrites: 0, humanApproval: false,
}, null, 2) + '\n', { flag: 'wx' })
assert.deepEqual(differences, [], 'Whole candidate394 page objects must equal the genuine reviewed final native frame')
console.log('PASS: ordinary future-active capsule loader; all394 whole page objects exactly equal genuine reviewed final frame')
