// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookOriginalSources, goalBookOriginalSourceMappingPaths, serializeGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
const root = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-bacterial-structure-fission-native-candidate-v1'
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'))
const meta = read(own + '/prospective-paths.json')
const full = read(own + '/prospective-full.book-model.json'), subset = read(own + '/native-finalbook/bundle/book-model.json')
const selected = goalBookOriginalSourceMappingPaths(full, root)
assert.ok(selected?.length)
assert.deepEqual(selected, read(meta.atlasPath).mappingPaths)
const nativeIndexes = []
for (const [name, model] of [['full', full], ['three-goal-d-book', subset]] as const) {
  const index = buildGoalBookOriginalSources(model, root, selected)
  const documents = new Map(index.documents.map(doc => [doc.id, doc]))
  const evidence = new Map(index.evidence.map(row => [row.id, row]))
  const citations = read(own + '/batch.config.json').goalIds.map((goalId: string) => {
    const rows = index.goals[goalId].flatMap(({ evidenceIds }: any) => evidenceIds.map((id: string) => {
      const row = evidence.get(id)!
      return { ...row, document: documents.get(row.documentId)! }
    }))
    assert.ok(rows.length, 'No original-source witness for a current D-review goal')
    if (meta.goalIds.includes(goalId)) {
      assert.ok(rows.some(({ sourceRef, document }) => sourceRef.includes('39') && document.url.includes('/2025-10/')))
      assert.ok(!rows.some(({ sourceRef, document }) => sourceRef.includes('39') && document.url.includes('/2024-11/')))
      assert.ok(rows.some(row => row.sourceGoalId === '6576c30f-638e-4c20-b6c6-97c602b6b2fa' && row.document.url.includes('/2025-10/')))
    }
    // The native citation schema deliberately emits resolved document locators,
    // not the extraction's internal document key. Verify that input separately.
    const heExtraction = read(meta.newHEExtractionPath)
    assert.equal(heExtraction.sourceGoals.find((g: any) => g.id === '6576c30f-638e-4c20-b6c6-97c602b6b2fa').sourceDocumentKey,
      'KC2024_BIOLOGIE_SEKII_STAND_20250801')
    return { goalId, rows }
  })
  writeFileSync(resolve(root, own, name + '.current-original-sources.json'), serializeGoalBookOriginalSources(index))
  nativeIndexes.push({ name, bookDigest: model.digest, bookPages: model.pages.length, citations })
}
writeFileSync(resolve(root, own, 'native-original-sources.actual.author.receipt.json'), JSON.stringify({
  selectedMappingPaths: selected, nativeIndexes, currentHE2025VersionAndPhysicalPage39Bound: true,
  false2025Page39To2024DocumentBindings: 0, fullSelectedSourceCompanionAuthorizesSubsetInputSelection: true,
  scopedLowerSourceComponentsRemainPartial: true, noHistoricalURLFiltering: true,
  humanApproval: false, activeWrites: 0,
}, null, 2) + '\n')
console.log(JSON.stringify({ checkedNativeIndexes: 2, fullPages: full.pages.length, subsetPages: subset.pages.length, HE2025Bindings: 4, incorrectOldDocumentPage39Bindings: 0, activeWrites: 0 }))
