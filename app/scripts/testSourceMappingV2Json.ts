// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test, type TestContext } from 'node:test'
import { exportRepositorySourceMappingEdges } from './exportSourceMappingEdges'
import { deviationApprovalSha256, type DeclinedDecision } from './sourceMappingDeviation'
import { sourceMappingDigest } from './sourceMappingDigest'
import { sourceRowSha256, type SourceEdition } from './sourceMappingReview'

const manifestPath = 'selection.json'
const editionPath = 'edition.json'
const reviewPath = 'curricula/DE/Gymnasium/mapping/review.json'
const legacyPath = 'curricula/DE/Gymnasium/mapping/legacy.json'
const currentPath = 'current.json'
const historicalPath = 'historical.json'
const retainedPath = 'retained.json'
const approvalPath = 'approval.json'
const identity = {
  targetLandscapeId: 'physics', sourceId: 'official-plan', sourceLandscapeId: 'regional-physics', edition: '2026',
}
const authorId = '11111111-1111-4111-8111-111111111111'
const reviewerId = '22222222-2222-4222-8222-222222222222'
const sha256 = (raw: string) => createHash('sha256').update(raw).digest('hex')
const sourceRecord = { id: 'row', sourceText: 'A statement with braces { and } and an escaped quote " inside.' }
const original = { path: 'official/plan-2026.pdf', official: true }
const source = {
  sourceLandscapeId: identity.sourceLandscapeId, sourceDocument: original, sourceGoals: [sourceRecord],
}
const row = {
  sourceGoalId: sourceRecord.id, wording: sourceRecord.sourceText, sourceRecordSha256: sourceMappingDigest(sourceRecord),
  parentContext: [], applicableScopeIds: ['GK'], regularTargetsByScope: { GK: [] },
}

function repository(context: TestContext) {
  const root = mkdtempSync(join(tmpdir(), 'skillpilot-source-mapping-json-'))
  context.after(() => rmSync(root, { recursive: true, force: true }))
  const write = (path: string, raw: string) => {
    const file = join(root, path)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, raw)
    return { path, sha256: sha256(raw) }
  }
  return { root, write }
}

type Alteration = { path: string; encodedKey: string; before: string; value: unknown }

function conversion(context: TestContext, alteration?: Alteration) {
  const { root, write } = repository(context)
  const put = (path: string, document: unknown) => {
    let raw = JSON.stringify(document)
    if (alteration?.path === path) {
      const member = `${JSON.stringify(alteration.before)}:`
      assert(raw.includes(member), `the fixture must contain ${member} in ${path}`)
      raw = raw.replace(member, () => `"${alteration.encodedKey}":${JSON.stringify(alteration.value)},${member}`)
    }
    return write(path, raw)
  }

  const current = put(currentPath, source)
  const historical = put(historicalPath, { ...source, extractionId: 'historical-transcript-of-the-same-original' })
  const retained = put(retainedPath, { ...source, sourceDocument: { path: 'official/plan-2020.pdf', official: true } })
  put(legacyPath, { version: 1, targetLandscapeId: identity.targetLandscapeId, sourceLandscapeId: identity.sourceLandscapeId,
    mappings: [{ legacyGoalId: row.sourceGoalId, canonicalGoalId: 'historical-goal' }] })
  const edition: SourceEdition = {
    ...identity, sourceExtractionPath: current.path, sourceExtractionSha256: current.sha256, rows: [row],
    legacyReviewPaths: [], historicalExtractions: [historical],
    retainedLegacyReviews: [{ path: legacyPath, edition: '2020', sourceExtractionPath: retained.path,
      sourceExtractionSha256: retained.sha256 }],
    selectedReviews: [{ sourceGoalId: row.sourceGoalId, reviewPath }],
  }
  const decision: DeclinedDecision = {
    sourceGoalId: row.sourceGoalId, rowSha256: sourceRowSha256(edition, row), decision: 'declined',
    authorId, reviewerId, reviewedAt: '2026-11-27',
    deviation: {
      categoryVersion: 1, category: 'schoolOrTeacher', reason: 'This planning instruction addresses the teacher.',
      review: { path: approvalPath, sha256: '' }, evidence: {
        addressedTo: 'teacher', subject: 'Die Lehrkraft', operator: 'plant', heading: 'Unterricht',
        tableHeader: 'Vorgaben', sourceLocation: { locator: 'S. 12', excerpt: 'Die Lehrkraft plant den Unterricht.' },
      },
    },
  }
  decision.deviation.review = put(approvalPath, { schemaVersion: 1, decisionSha256: deviationApprovalSha256(decision, edition),
    reviewerId, reviewedAt: decision.reviewedAt, verdict: 'approved' })
  const review = put(reviewPath, { version: 2, reviewId: 'review', ...identity, decisions: [decision] })
  const boundEdition = put(editionPath, edition)
  put(manifestPath, { version: 1, editions: [boundEdition], reviews: [review] })
  return () => exportRepositorySourceMappingEdges(root, manifestPath)
}

test('the V2 manifest binds unambiguous nested JSON without prohibiting the same keys in different objects', context => {
  const result = conversion(context)()
  assert.deepEqual(result.positiveEdges, [])
  assert.deepEqual(result.legacyMappings.map(item => item.path), [legacyPath])
})

const alterations: Alteration[] = [
  { path: manifestPath, before: 'reviews', encodedKey: 'reviews', value: [] },
  { path: editionPath, before: 'reviewPath', encodedKey: 'reviewPath', value: 'unselected.json' },
  { path: reviewPath, before: 'excerpt', encodedKey: 'excer\\u0070t', value: 'Changed excerpt.' },
  { path: approvalPath, before: 'verdict', encodedKey: 'verdict', value: 'rejected' },
  { path: currentPath, before: 'sourceText', encodedKey: 'sourceText', value: 'A conflicting source text.' },
  { path: historicalPath, before: 'path', encodedKey: 'path', value: 'official/another-plan.pdf' },
  { path: retainedPath, before: 'path', encodedKey: 'path', value: 'official/plan-2026.pdf' },
]
for (const change of alterations) {
  test(`V2 conversion rejects a duplicate ${change.before} in ${change.path} even with a fresh file hash`, context => {
    const load = conversion(context, change)
    assert.throws(load, error => error instanceof Error && error.message.includes(`Duplicate JSON member "${change.before}"`)
      && error.message.includes(change.path))
  })
}

test('mapping discovery rejects a V2 version hidden behind an escaped-equivalent V1 version', context => {
  const { root, write } = repository(context)
  write(legacyPath, '{"version":2,"ver\\u0073ion":1,"mappings":[]}')
  assert.throws(() => exportRepositorySourceMappingEdges(root), /Duplicate JSON member "version"/)
})

test('V1 mapping JSON retains its historical parser behavior without a conversion', context => {
  const { root, write } = repository(context)
  write(legacyPath, '{"version":1,"file":"first.csv","file":"last.csv","metadata":{"version":2},"mappings":[]}')
  const result = exportRepositorySourceMappingEdges(root)
  assert.deepEqual(result.legacyMappings, [{ path: legacyPath,
    document: { version: 1, file: 'last.csv', metadata: { version: 2 }, mappings: [] } }])
})
