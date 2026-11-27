// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCurrentCurriculumCatalog } from './currentCurriculumCatalog'
import { exportRepositorySourceMappingEdges, exportSourceMappingEdges, readCurrentLegacySourceMappings } from './exportSourceMappingEdges'
import { readAllGoalMappingFiles } from './generateCurriculumQualityStatus'
import { liveVerificationInputs } from './lib/verificationInputSnapshot'
import { deviationApprovalSha256, type DeclinedDecision } from './sourceMappingDeviation'
import { sourceMappingDigest } from './sourceMappingDigest'
import { loadSourceMappingReviews, sourceRowSha256, type SourceMappingInputs } from './sourceMappingReview'

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const noEvidence = (path: string): Buffer => {
  throw new Error(`Unexpected evidence read in source-mapping parity test: ${path}`)
}

const v1Mappings = readAllGoalMappingFiles()
const v1Export = exportSourceMappingEdges(loadSourceMappingReviews({
  legacyReviews: readCurrentLegacySourceMappings(),
  editions: [],
  reviews: [],
  readEvidence: noEvidence,
}))
assert.deepEqual(v1Export.positiveEdges, [])
assert.deepEqual(v1Export.legacyMappings.map(file => file.path), v1Mappings.map(file => file.file))

const catalog = loadCurrentCurriculumCatalog(liveVerificationInputs, repository)
const totals = new Map(catalog.entries.map(({ path, landscape }) => [landscape.landscapeId, {
  landscapeId: landscape.landscapeId,
  catalogPath: path,
  reviewedFiles: 0,
  directFiles: 0,
  mappingEdges: 0,
  decisions: 0,
}]))
const sourceDigest = createHash('sha256')
for (const [index, { path, document }] of v1Export.legacyMappings.entries()) {
  const source = readFileSync(resolve(repository, path))
  assert.deepEqual(document, JSON.parse(source.toString('utf8')), `Legacy file changed in export: ${path}`)
  const legacy = v1Mappings[index]
  const stats = legacy.targetLandscapeId && totals.get(legacy.targetLandscapeId)
  assert(stats, `Legacy mapping outside the declared catalog: ${path}`)
  if (legacy.sourceExtractionPath) stats.reviewedFiles += 1
  else stats.directFiles += 1
  stats.mappingEdges += legacy.mappings?.length ?? 0
  stats.decisions += legacy.decisions?.length ?? 0
  sourceDigest.update(path).update('\0').update(createHash('sha256').update(source).digest()).update('\0')
}
assert([...totals.values()].some(subject => subject.reviewedFiles > 0))
assert([...totals.values()].some(subject => subject.reviewedFiles === 0 && subject.directFiles > 0))
assert([...totals.values()].some(subject => subject.reviewedFiles + subject.directFiles === 0))

const targetLandscapeId = 'physics'
const sourceLandscapeId = 'physics-source'
const sourceId = 'official-plan'
const edition = '2026'
const sourceExtractionPath = 'fixtures/official-plan-2026.source-extraction.json'
const mappingDirectory = 'curricula/DE/Gymnasium/mapping/DE-HE'
const selectedPath = `${mappingDirectory}/physics-selected.review.json`
const historicalPath = `${mappingDirectory}/physics-legacy.review.json`
const previousEditionPath = `${mappingDirectory}/physics-legacy-other-edition.review.json`
const unselectedPath = `${mappingDirectory}/physics-newer-unselected.review.json`
const sourceGoals = [
  { id: 'interpret-measurements', sourceText: 'Messwerte darstellen und physikalisch deuten.' },
  { id: 'plan-investigation', sourceText: 'Eine Untersuchung für ein gegebenes Modell planen.' },
  { id: 'maintain-equipment', sourceText: 'Die Schule stellt geeignete Geräte zur Verfügung.' },
]
const extraction = Buffer.from(JSON.stringify({ sourceLandscapeId, sourceGoals }))
const carriedRow = {
  sourceGoalId: sourceGoals[0].id,
  wording: sourceGoals[0].sourceText,
  sourceRecordSha256: sourceMappingDigest(sourceGoals[0]),
  context: { page: 6 },
  scope: { course: 'GK' },
  regularTargetsByScope: { GK: ['interpret-graph', 'document-measurement', 'other-regular-goal'] },
}
const openRow = {
  sourceGoalId: sourceGoals[1].id,
  wording: sourceGoals[1].sourceText,
  sourceRecordSha256: sourceMappingDigest(sourceGoals[1]),
  context: { page: 7 },
  scope: { course: 'GK' },
  regularTargetsByScope: { GK: ['plan-experiment'] },
}
const declinedRow = {
  sourceGoalId: sourceGoals[2].id,
  wording: sourceGoals[2].sourceText,
  sourceRecordSha256: sourceMappingDigest(sourceGoals[2]),
  context: { page: 8 },
  scope: { course: 'GK' },
  regularTargetsByScope: { GK: ['organize-lab'] },
}
const editionBinding = {
  targetLandscapeId,
  sourceLandscapeId,
  sourceId,
  edition,
  sourceExtractionPath,
  sourceExtractionSha256: createHash('sha256').update(extraction).digest('hex'),
  legacyReviewPaths: [historicalPath],
  selectedReviews: Object.fromEntries([carriedRow, openRow, declinedRow].map(row => [row.sourceGoalId, selectedPath])),
  rows: [carriedRow, openRow, declinedRow],
}
const historicalDocument = {
  version: 1,
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath,
  decisions: [
    { sourceGoalId: carriedRow.sourceGoalId, decision: 'mapped', canonicalGoalIds: ['interpret-graph', 'document-measurement'], courseLevelDecision: 'GK' },
    { sourceGoalId: openRow.sourceGoalId, decision: 'mapped', canonicalGoalIds: ['plan-experiment'] },
    { sourceGoalId: declinedRow.sourceGoalId, decision: 'mapped', canonicalGoalIds: ['organize-lab'] },
  ],
  mappings: [
    { legacyGoalId: carriedRow.sourceGoalId, canonicalGoalId: 'document-measurement', matchType: 'partial' },
    { legacyGoalId: carriedRow.sourceGoalId, canonicalGoalId: 'interpret-graph', matchType: 'partial', courseLevelDecision: 'GK' },
    { legacyGoalId: openRow.sourceGoalId, canonicalGoalId: 'plan-experiment', matchType: 'exact' },
    { legacyGoalId: declinedRow.sourceGoalId, canonicalGoalId: 'organize-lab', matchType: 'exact' },
  ],
}
const olderEditionFile = { path: previousEditionPath, document: {
  ...historicalDocument, sourceExtractionPath: 'fixtures/official-plan-2020.source-extraction.json',
} }
const legacyReviews = [{ path: historicalPath, document: historicalDocument }, olderEditionFile]
const documentIdentity = { version: 2, targetLandscapeId, sourceLandscapeId, sourceId, edition }
const selectedCarried = {
  sourceGoalId: carriedRow.sourceGoalId,
  rowSha256: sourceRowSha256(editionBinding, carriedRow),
  decision: 'carried',
  mainKind: 'subject',
  performance: 'Messdaten aufbereiten und daraus den physikalischen Zusammenhang begründen.',
  author: 'author-fixture',
  reviewer: 'reviewer-fixture',
  reviewedAt: '2026-11-24',
  contributions: [
    { canonicalGoalId: 'interpret-graph', kind: 'subject', matchType: 'partial', performance: 'Den Zusammenhang aus dem Graphen ableiten.', scopeIds: ['GK'] },
    { canonicalGoalId: 'document-measurement', kind: 'crossCutting', matchType: 'partial', performance: 'Messdaten in einem Diagramm dokumentieren.', scopeIds: ['GK'] },
  ],
}
const selectedOpen = {
  sourceGoalId: openRow.sourceGoalId,
  rowSha256: sourceRowSha256(editionBinding, openRow),
  decision: 'open',
  author: 'author-fixture',
  rationale: 'Ein Nachweis für die eigene Versuchsplanung steht aus.',
}
const approvalPath = 'fixtures/approval-maintain-equipment.json'
const selectedDeclined: DeclinedDecision = {
  sourceGoalId: declinedRow.sourceGoalId,
  rowSha256: sourceRowSha256(editionBinding, declinedRow),
  decision: 'declined',
  author: 'author-fixture',
  reviewer: 'reviewer-fixture',
  reviewedAt: '2026-11-26',
  deviation: {
    categoryVersion: 1,
    category: 'schoolOrTeacher',
    reason: 'Der Satz verlangt die Bereitstellung von Geräten durch die Schule.',
    evidence: {
      addressedTo: 'school', subject: 'Die Schule', operator: 'stellt zur Verfügung',
      heading: 'Rahmenbedingungen', tableHeader: 'Ausstattung',
      sourceLocation: { locator: 'S. 8', excerpt: declinedRow.wording },
    },
    review: { path: approvalPath, sha256: '' },
  },
}
const approval = Buffer.from(JSON.stringify({
  schemaVersion: 1,
  verdict: 'approved',
  decisionSha256: deviationApprovalSha256(selectedDeclined, editionBinding),
  reviewer: selectedDeclined.reviewer,
  reviewedAt: selectedDeclined.reviewedAt,
}))
selectedDeclined.deviation.review.sha256 = createHash('sha256').update(approval).digest('hex')
const chosenReview = { path: selectedPath, document: {
  ...documentIdentity,
  reviewId: 'selected-review',
  decisions: [selectedCarried, selectedOpen, selectedDeclined],
} }
const newerUnselectedReview = { path: unselectedPath, document: {
  ...documentIdentity,
  reviewId: 'newer-unselected-review',
  decisions: [{ ...selectedCarried, reviewedAt: '2026-11-27', contributions: [
    { canonicalGoalId: 'other-regular-goal', kind: 'subject', matchType: 'exact', performance: 'Andere Leistung.', scopeIds: ['GK'] },
  ] }],
} }
const evidenceFiles = new Map([[approvalPath, approval], [sourceExtractionPath, extraction]])
const fixture = {
  legacyReviews,
  editions: [editionBinding],
  reviews: [newerUnselectedReview, chosenReview],
  readEvidence: path => evidenceFiles.get(path) ?? noEvidence(path),
} satisfies SourceMappingInputs

const v2Export = exportSourceMappingEdges(loadSourceMappingReviews(fixture))
assert.deepEqual(v2Export.legacyMappings, [olderEditionFile], 'Only the converted edition stops using the historical files')
assert.deepEqual(v2Export.positiveEdges.map(edge => [edge.legacyGoalId, edge.canonicalGoalId, edge.kind, edge.scopeIds]), [
  [carriedRow.sourceGoalId, 'document-measurement', 'crossCutting', ['GK']],
  [carriedRow.sourceGoalId, 'interpret-graph', 'subject', ['GK']],
], 'Open, declined and unselected decisions contribute no positive edge')
assert.deepEqual(
  v2Export.positiveEdges.map(({ legacyGoalId, canonicalGoalId, matchType }) => ({ legacyGoalId, canonicalGoalId, matchType })),
  historicalDocument.mappings.filter(edge => edge.legacyGoalId === carriedRow.sourceGoalId)
    .map(({ legacyGoalId, canonicalGoalId, matchType }) => ({ legacyGoalId, canonicalGoalId, matchType })),
  'Precise migration of a carried row retains the positive endpoint pairs and match types',
)
for (const edge of v2Export.positiveEdges) {
  assert.equal(edge.targetLandscapeId, targetLandscapeId)
  assert.equal(edge.sourceLandscapeId, sourceLandscapeId)
  assert.equal(edge.sourceId, sourceId)
  assert.equal(edge.edition, edition)
  assert.equal(edge.sourceExtractionPath, sourceExtractionPath)
  assert.equal(edge.rowSha256, selectedCarried.rowSha256)
  assert.equal(edge.reviewId, 'selected-review')
  assert.equal(edge.reviewPath, selectedPath)
  assert.equal(edge.matchType, 'partial')
  assert(edge.performance.length > 0)
}
assert.deepEqual(exportSourceMappingEdges(loadSourceMappingReviews({ ...fixture, reviews: [...fixture.reviews].reverse() })), v2Export)

const temporaryRepository = mkdtempSync(resolve(tmpdir(), 'source-mapping-export-'))
try {
  const write = (path: string, bytes: Buffer) => {
    const absolutePath = resolve(temporaryRepository, path)
    mkdirSync(dirname(absolutePath), { recursive: true })
    writeFileSync(absolutePath, bytes)
    return { path, sha256: createHash('sha256').update(bytes).digest('hex') }
  }
  const writeJson = (path: string, document: unknown) => write(path, Buffer.from(JSON.stringify(document)))
  for (const file of legacyReviews) writeJson(file.path, file.document)
  assert.equal(exportRepositorySourceMappingEdges(temporaryRepository).legacyMappings.length, 2)
  write(approvalPath, approval)
  write(sourceExtractionPath, extraction)
  const editionRef = writeJson('fixtures/official-plan-2026.inventory.json', editionBinding)
  const selectedRef = writeJson(chosenReview.path, chosenReview.document)
  const unselectedRef = writeJson(newerUnselectedReview.path, newerUnselectedReview.document)
  const manifestPath = 'fixtures/manifest.json'
  const manifest = { version: 1, editions: [editionRef], reviews: [unselectedRef, selectedRef] }
  writeJson(manifestPath, manifest)
  assert.deepEqual(exportRepositorySourceMappingEdges(temporaryRepository, manifestPath), v2Export)
  assert.throws(() => exportRepositorySourceMappingEdges(temporaryRepository), /requires an explicit manifest entry/)

  writeJson(manifestPath, { ...manifest, reviews: [selectedRef] })
  assert.throws(() => exportRepositorySourceMappingEdges(temporaryRepository, manifestPath), /requires an explicit manifest entry/)
  writeJson(manifestPath, { ...manifest, reviews: [{ ...unselectedRef, sha256: '0'.repeat(64) }, selectedRef] })
  assert.throws(() => exportRepositorySourceMappingEdges(temporaryRepository, manifestPath), /input hash mismatch/)
  writeJson(manifestPath, { ...manifest, editions: [{ ...editionRef, path: '../outside.json' }] })
  assert.throws(() => exportRepositorySourceMappingEdges(temporaryRepository, manifestPath), /repository-relative path/)

  writeJson(manifestPath, manifest)
  writeJson(sourceExtractionPath, { sourceLandscapeId, sourceGoals: sourceGoals.slice(1) })
  assert.throws(() => exportRepositorySourceMappingEdges(temporaryRepository, manifestPath), /Stale source extraction/)

  write(sourceExtractionPath, extraction)
  writeJson(`${mappingDirectory}/future-format.review.json`, { schemaVersion: '2.0' })
  assert.throws(() => exportRepositorySourceMappingEdges(temporaryRepository, manifestPath), /Unsupported source-mapping version/)
} finally {
  rmSync(temporaryRepository, { recursive: true, force: true })
}

console.log(JSON.stringify({
  legacyFiles: v1Mappings.length,
  legacyFileInventorySha256: sourceDigest.digest('hex'),
  landscapes: [...totals.values()],
  examplePositiveEdges: v2Export.positiveEdges.length,
}, null, 2))
