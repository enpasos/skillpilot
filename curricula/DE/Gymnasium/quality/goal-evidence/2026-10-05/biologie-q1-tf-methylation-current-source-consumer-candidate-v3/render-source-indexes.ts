// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookOriginalSources, goalBookOriginalSourceMappingPaths, serializeGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
import type { GoalBookModel } from '../../../../../../../app/scripts/goalBookModel'

const root = process.cwd()
const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-source-consumer-candidate-v3')
const full = JSON.parse(readFileSync(resolve(own, 'prospective-full.book-model.json'), 'utf8')) as GoalBookModel
const subset = JSON.parse(readFileSync(resolve(own, 'native-finalbook/bundle/book-model.json'), 'utf8')) as GoalBookModel
const selectedPaths = goalBookOriginalSourceMappingPaths(full, root)
assert.ok(selectedPaths?.length)
for (const [name, model] of [['full', full], ['three-goal-d-book', subset]] as const) {
  // The subset retains the checked full book's exact source inputs but has its own review-book ID.
  const index = buildGoalBookOriginalSources(model, root, selectedPaths)
  const documents = new Map(index.documents.map((doc) => [doc.id, doc]))
  const evidence = new Map(index.evidence.map((item) => [item.id, item]))
  for (const goalId of ['946ce2e7-c30d-5670-839d-003b0619c284', '0ac51522-352c-50d1-8b95-8d3992b4db15', '8eb86a82-122d-5cae-8f80-bb2850b29c2f']) {
    const actual = index.goals[goalId].flatMap(({ evidenceIds }) => evidenceIds.map((id) => {
      const item = evidence.get(id)!
      return { ...item, document: documents.get(item.documentId)! }
    }))
    assert.ok(actual.some(({ sourceRef, document }) => sourceRef.includes('39') && document.url.includes('/2025-10/')))
    assert.ok(!actual.some(({ sourceRef, document }) => sourceRef.includes('39') && document.url.includes('/2024-11/')))
  }
  writeFileSync(resolve(own, `${name}.current-original-sources.json`), serializeGoalBookOriginalSources(index))
}
writeFileSync(resolve(own, 'native-current-original-source-selection.actual.receipt.json'), `${JSON.stringify({
  checkedAtUTC: new Date().toISOString(), fullBookDigest: full.digest, subsetBookDigest: subset.digest,
  selectedMappingPaths: selectedPaths, subsetSourceSelectionOwnedByCheckedFullBaseModel: true,
  allThreeDGoalsHaveCorrectCurrentSourceLinks: true, falseOldDocumentPage39Bindings: 0,
  humanApproval: false, activeWrites: 0,
}, null, 2)}\n`)
console.log('Correct current original-source indexes compiled for full364 and native three-goal D book.')
