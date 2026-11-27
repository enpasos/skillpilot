// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import { sourceMappingDigest } from './sourceMappingDigest'
import { resolvePredecessors } from './sourceMappingPredecessors'
import { loadSourceMappingReviews, sourceRowSha256, type ReviewFile, type SourceEdition } from './sourceMappingReview'

const targetLandscapeId = '08a43a1b-d97e-522c-9dfa-c950a493364e'
const shSource = '7b8cf796-04c9-5f04-856c-579ec6a95d12'
const bySource = '357a7003-b636-570e-a0bd-6bb63518d2f6'
const shPdf = 'Fachanforderungen_Biologie_Sekundarstufe_2023_barrierearm.pdf'
const shRow = 'sh-biology-seki-fa-2023-gv-09-geschichte-verwandtschaft-systematik-und-evolution-erklaren'
const shAnotherRow = 'sh-biology-seki-fa-2023-sf-02-struktur-und-funktion-von-zellen-organen-organismen-und-biomolekulen-erklaren'
const byComponentRow = '59425bf6-7c27-58f6-80fd9f11eb68'
const byLegacyRows = ['3684bc95-f3db-5b57-b12e-9e02de718fad', '51457572-b3ad-5ba3-aa12-86ca45067b08']
const files = new Map<string, Buffer>()
function readEvidence(path: string): Buffer {
  const bytes = files.get(path)
  if (!bytes) throw new Error(`Missing test evidence: ${path}`)
  return bytes
}
function extraction(path: string, sourceLandscapeId: string, rows: string[], documentPath?: string) {
  const bytes = Buffer.from(JSON.stringify({
    sourceLandscapeId,
    sourceDocument: documentPath ? { path: documentPath, official: true } : undefined,
    sourceGoals: rows.map(id => ({ id, sourceText: id })),
  }))
  files.set(path, bytes)
  return { path, sha256: createHash('sha256').update(bytes).digest('hex') }
}
function converted(sourceLandscapeId: string, version: string, ref: ReturnType<typeof extraction>): SourceEdition {
  const { sourceGoals } = JSON.parse(readEvidence(ref.path).toString('utf8')) as {
    sourceGoals: { id: string; sourceText: string; contains?: string[] }[]
  }
  const rows = sourceGoals.filter(record => !record.contains?.length).map(record => ({
    sourceGoalId: record.id, wording: record.sourceText, sourceRecordSha256: sourceMappingDigest(record),
    parentContext: [], applicableScopeIds: ['GK'], regularTargetsByScope: { GK: [] },
  }))
  return { sourceLandscapeId, targetLandscapeId, sourceId: `${sourceLandscapeId}-source`, edition: version,
    sourceExtractionPath: ref.path, sourceExtractionSha256: ref.sha256, rows, legacyReviewPaths: [], selectedReviews: [] }
}
function legacyReview(path: string, sourceLandscapeId: string, ids: string[], sourceExtractionPath?: string): ReviewFile {
  return { path, document: { version: 1, targetLandscapeId, sourceLandscapeId,
    ...(sourceExtractionPath === undefined ? {} : { sourceExtractionPath }),
    mappings: ids.map(legacyGoalId => ({ legacyGoalId, canonicalGoalId: 'legacy-goal' })) } }
}
function retire(editions: SourceEdition[], reviews: ReviewFile[]): string[] {
  return [...resolvePredecessors(editions, reviews, readEvidence)].sort()
}

// Sample the real SH 2023 full extraction and its one-row bounded component. Both use the same original PDF.
const full = extraction('SH/DE_SH_BIOLOGIE_SEKI_FACHANFORDERUNGEN_2023.source-extraction.json', shSource,
  [shRow, shAnotherRow], shPdf)
const component = extraction('SH/source-components/DE_SH_BIOLOGIE_SEKI_HIERARCHY_BOUNDED_20261009_V1.source-extraction.json',
  shSource, [shRow], shPdf)
const currentReview = legacyReview('SH/lower-secondary/full.review.json', shSource, [shRow, shAnotherRow], full.path)
const componentReview = legacyReview('SH/source-components/hierarchy.review.json', shSource, [shRow], component.path)
const unrelatedPath = extraction('SH/older.source-extraction.json', shSource, [shRow], 'Fachanforderungen_older.pdf')
const unrelatedReview = legacyReview('SH/older.review.json', shSource, [shRow], unrelatedPath.path)
const retainedOlder = { path: unrelatedReview.path, edition: 'older', sourceExtractionPath: unrelatedPath.path,
  sourceExtractionSha256: unrelatedPath.sha256 }
const current = { ...converted(shSource, '2023', full), legacyReviewPaths: [currentReview.path],
  retainedLegacyReviews: [retainedOlder] }
const relevantReviews = [currentReview, componentReview, unrelatedReview]
assert.deepEqual(retire([current], [currentReview, unrelatedReview]), [currentReview.path])
const disjointComponent = legacyReview('SH/disjoint.review.json', shSource, ['outside-current-edition'], unrelatedPath.path)
assert.deepEqual(retire([current], [currentReview, unrelatedReview, disjointComponent]), [currentReview.path])
assert.throws(() => retire([{ ...current, historicalExtractions: [unrelatedPath] }], relevantReviews),
  /different original edition/)
assert.throws(() => retire([current, converted(shSource, '2026', full)], relevantReviews), /registered more than once/)
const copiedCurrent = extraction('SH/copied-full-extraction.json', shSource, [shRow, shAnotherRow], shPdf)
assert.throws(() => retire([current, converted(shSource, '2026', copiedCurrent)], relevantReviews), /registered more than once/)
assert.throws(() => retire([{ ...current, legacyReviewPaths: [...current.legacyReviewPaths, componentReview.path] }], relevantReviews),
  /Invalid predecessor or edition binding/)
assert.throws(() => retire([{ ...current, historicalExtractions: [component] }], relevantReviews),
  /Specify the legacy review belonging to the converted edition/)
const withAlias = { ...current, historicalExtractions: [component], legacyReviewPaths: [currentReview.path, componentReview.path] }
assert.deepEqual(retire([withAlias], relevantReviews), [currentReview.path, componentReview.path].sort())
assert.deepEqual(retire([withAlias], [...relevantReviews].reverse()), [currentReview.path, componentReview.path].sort())
assert.throws(() => retire([{ ...withAlias, historicalExtractions: [{ ...component, sha256: 'a'.repeat(64) }] }], relevantReviews),
  /Stale predecessor extraction/)
const incorrectComponentReview = legacyReview(componentReview.path, shSource, [shAnotherRow], component.path)
assert.throws(() => retire([withAlias], [currentReview, incorrectComponentReview, unrelatedReview]), /Invalid predecessor or edition binding/)
const otherConversion = converted(shSource, '2020', component)
assert.throws(() => retire([withAlias, otherConversion], relevantReviews), /registered more than once/)
const copiedAlias = extraction('SH/copied-extraction.json', shSource, [shRow], shPdf)
assert.throws(() => retire([withAlias, converted(shSource, '2020', copiedAlias)], relevantReviews), /registered more than once/)

// Sample the disjoint real BY legacy/component collision. The V1 direct mapping has no sourceExtractionPath.
const byComponent = extraction('BY/source-components/DE_BY_BIOLOGIE_POTENTIAL_RECORDINGS_GA_EA.bounded-20261007-v1.source-extraction.json',
  bySource, [byComponentRow], 'BY/current-original.pdf')
const byConversion = converted(bySource, 'new-extraction', byComponent)
const byReview = legacyReview('BY/gymnasium/bavaria_biology_to_canonical_biology.json', bySource, byLegacyRows)
assert.deepEqual(retire([byConversion], [byReview]), [])
assert.throws(() => retire([{ ...byConversion, legacyReviewPaths: [byReview.path] }], [byReview]),
  /Invalid predecessor or edition binding/)

const overlapping = legacyReview('BY/legacy-older.json', bySource, [byComponentRow])
assert.throws(() => retire([byConversion], [overlapping]), /Specify the predecessor or retained edition/)
assert.deepEqual(retire([{ ...byConversion, legacyReviewPaths: [overlapping.path] }], [overlapping]), [overlapping.path])
const mixed = legacyReview('BY/legacy-mixed.json', bySource, [byComponentRow, ...byLegacyRows])
assert.throws(() => retire([{ ...byConversion, legacyReviewPaths: [mixed.path] }], [mixed]),
  /Invalid predecessor or edition binding/)
const byOlder = extraction('BY/legacy-full-source.json', bySource, [byComponentRow, ...byLegacyRows], 'BY/older-original.pdf')
const retained = { path: mixed.path, edition: 'older-extraction', sourceExtractionPath: byOlder.path,
  sourceExtractionSha256: byOlder.sha256 }
assert.deepEqual(retire([{ ...byConversion, retainedLegacyReviews: [retained] }], [mixed]), [])
assert.throws(() => retire([{ ...byConversion, retainedLegacyReviews: [{ ...retained, edition: byConversion.edition }] }], [mixed]),
  /Invalid predecessor or edition binding/)
assert.throws(() => retire([{ ...byConversion, retainedLegacyReviews: [{ ...retained, sourceExtractionSha256: 'b'.repeat(64) }] }], [mixed]),
  /Stale predecessor extraction/)
const wrongLandscape = extraction('BY/other-landscape.json', shSource, [byComponentRow, ...byLegacyRows])
assert.throws(() => retire([{ ...byConversion, retainedLegacyReviews: [{ ...retained, sourceExtractionPath: wrongLandscape.path,
  sourceExtractionSha256: wrongLandscape.sha256 }] }], [mixed]), /Invalid predecessor extraction landscape/)
const olderConverted = converted(bySource, 'older-extraction', byOlder)
assert.throws(() => retire([{ ...byConversion, legacyReviewPaths: [overlapping.path] }, olderConverted], [overlapping]),
  /Invalid predecessor or edition binding/)

console.log('Hash-bound SH predecessor aliases and disjoint or ambiguous BY legacy mappings passed.')


test('an overlapping path-backed component cannot escape edition assignment', () => {
  assert.throws(() => retire([current], relevantReviews), /Specify the predecessor or retained edition for overlapping legacy review/)
  assert.throws(() => retire([{ ...current, retainedLegacyReviews: [] }], [currentReview, unrelatedReview]),
    /Specify the predecessor or retained edition for overlapping legacy review/)
  const wrongPath = { ...retainedOlder, sourceExtractionPath: component.path, sourceExtractionSha256: component.sha256 }
  assert.throws(() => retire([{ ...current, retainedLegacyReviews: [wrongPath] }], [currentReview, unrelatedReview]),
    /Invalid predecessor or edition binding/)
})

test('a renamed or reformatted copy of the same original cannot retain a positive legacy mapping', () => {
  const aliasPath = 'SH/reformatted.json'
  const bytes = Buffer.from(JSON.stringify(JSON.parse(readEvidence(full.path).toString('utf8')), null, 2))
  files.set(aliasPath, bytes)
  const legacy = legacyReview('SH/pathless.review.json', shSource, [shRow])
  const alias = {
    path: legacy.path, edition: 'older-copy', sourceExtractionPath: aliasPath,
    sourceExtractionSha256: createHash('sha256').update(bytes).digest('hex'),
  }
  assert.throws(() => retire([{ ...current, retainedLegacyReviews: [...current.retainedLegacyReviews, alias] }],
    [currentReview, unrelatedReview, legacy]),
    /Cannot verify a distinct retained edition/)
})

test('retirement cannot discard a historical V1 row without an inventoried decision or successor', () => {
  const oldRef = extraction('migration/old.json', shSource, ['A', 'B'], shPdf)
  const newRef = extraction('migration/current.json', shSource, ['A'], shPdf)
  const legacy = legacyReview('migration/v1.json', shSource, ['B'], oldRef.path)
  const pathless = legacyReview('migration/pathless-v1.json', shSource, ['B'])
  const edition: SourceEdition = {
    ...converted(shSource, 'migration', newRef),
    historicalExtractions: [oldRef], legacyReviewPaths: [legacy.path, pathless.path],
  }
  assert.throws(() => retire([edition], [legacy, pathless]), /Retired legacy row has no current decision or successor: B/)
  assert.throws(() => retire([edition], [pathless, legacy]), /Retired legacy row has no current decision or successor: B/)
  const successor = {
    sourceGoalId: 'B', successorSourceGoalId: 'A', successorSourceRecordSha256: edition.rows[0].sourceRecordSha256,
  }
  const withSuccessor = { ...edition, retiredRowSuccessors: [successor] }
  assert.deepEqual(retire([withSuccessor], [pathless, legacy]), [pathless.path, legacy.path].sort())
  for (const invalid of [
    { ...successor, sourceGoalId: 'unknown' },
    { ...successor, sourceGoalId: 'A' },
    { ...successor, successorSourceGoalId: 'B' },
    { ...successor, successorSourceRecordSha256: 'b'.repeat(64) },
  ]) {
    assert.throws(() => retire([{ ...edition, retiredRowSuccessors: [invalid] }], [pathless, legacy]),
      /Invalid retired source row successor/)
  }
  assert.throws(() => retire([{ ...edition, retiredRowSuccessors: [successor, successor] }], [pathless, legacy]),
    /Invalid retired source row successor/)
  const decision = {
    sourceGoalId: 'A', rowSha256: sourceRowSha256(withSuccessor, edition.rows[0]),
    decision: 'open', authorId: '00000000-0000-4000-8000-000000000001', rationale: 'Ein aktueller Nachweis steht aus.',
  }
  const reviews = [{
    path: 'migration/v2.json',
    document: { version: 2, reviewId: 'migration-review',
      sourceLandscapeId: shSource, targetLandscapeId, sourceId: edition.sourceId,
      edition: edition.edition, decisions: [decision] },
  }]
  const inputs = { editions: [withSuccessor], legacyReviews: [legacy, pathless], readEvidence }
  const loaded = loadSourceMappingReviews({ ...inputs, reviews })
  assert.deepEqual(loaded.legacyReviews, [])
  assert.deepEqual(loaded.effectiveDecisions.map(({ sourceGoalId, decision }) => [sourceGoalId, decision]), [['A', 'open']])
  assert.throws(() => loadSourceMappingReviews({ ...inputs, reviews: [] }), /Missing or ambiguous effective decision/)
})
