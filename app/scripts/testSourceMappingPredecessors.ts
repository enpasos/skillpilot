// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { resolvePredecessors } from './sourceMappingPredecessors'
import type { ReviewFile, SourceEdition } from './sourceMappingReview'

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
  return { sourceLandscapeId, targetLandscapeId, sourceId: `${sourceLandscapeId}-source`, edition: version,
    sourceExtractionPath: ref.path, sourceExtractionSha256: ref.sha256, rows: [], legacyReviewPaths: [], selectedReviews: {} }
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
const current = { ...converted(shSource, '2023', full), legacyReviewPaths: [currentReview.path] }
const relevantReviews = [currentReview, componentReview, unrelatedReview]
assert.deepEqual(retire([current], relevantReviews), [currentReview.path])
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
assert.throws(() => retire([withAlias], [currentReview, incorrectComponentReview]), /Invalid predecessor or edition binding/)
const otherConversion = converted(shSource, '2020', component)
assert.throws(() => retire([withAlias, otherConversion], relevantReviews), /registered more than once/)
const copiedAlias = extraction('SH/copied-extraction.json', shSource, [shRow], shPdf)
assert.throws(() => retire([withAlias, converted(shSource, '2020', copiedAlias)], relevantReviews), /registered more than once/)

// Sample the disjoint real BY legacy/component collision. The V1 direct mapping has no sourceExtractionPath.
const byComponent = extraction('BY/source-components/DE_BY_BIOLOGIE_POTENTIAL_RECORDINGS_GA_EA.bounded-20261007-v1.source-extraction.json',
  bySource, [byComponentRow])
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
const byOlder = extraction('BY/legacy-full-source.json', bySource, [byComponentRow, ...byLegacyRows])
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
