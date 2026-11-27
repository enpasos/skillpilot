import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { resolvePredecessors } from './sourceMappingPredecessors'
import { sourceMappingDigest } from './sourceMappingDigest'
import { validateDeviation, type DeclinedDecision } from './sourceMappingDeviation'

export type ReviewFile = { path: string; document: Record<string, unknown> }
export type CarrierKind = 'subject' | 'crossCutting'
export type Contribution = {
  canonicalGoalId: string
  kind: CarrierKind
  matchType: 'partial' | 'exact'
  performance: string
  scopeIds: string[]
}
type RowDecision = { sourceGoalId: string; rowSha256: string; author: string }
type Carried = RowDecision & {
  decision: 'carried'
  mainKind: CarrierKind
  performance: string
  contributions: Contribution[]
  reviewer: string
  reviewedAt: string
}
type Decision = Carried | DeclinedDecision | (RowDecision & { decision: 'open'; rationale: string })
type Identity = { targetLandscapeId: string; sourceId: string; edition: string }
type SourceIdentity = Identity & { sourceLandscapeId: string }
export type OfficialRow = {
  sourceGoalId: string
  wording: string
  sourceRecordSha256: string
  context: Record<string, unknown>
  scope: Record<string, unknown>
  regularTargetsByScope: Record<string, string[]>
}
export type SourceEdition = SourceIdentity & {
  sourceExtractionPath: string
  sourceExtractionSha256: string
  rows: OfficialRow[]
  historicalExtractions?: { path: string; sha256: string }[]
  retainedLegacyReviews?: { path: string; edition: string; sourceExtractionPath: string; sourceExtractionSha256: string }[]
  legacyReviewPaths: string[]
  selectedReviews: Record<string, string>
}
type Review = SourceIdentity & { version: 2; reviewId: string; decisions: Decision[] }
type ReviewedRow = { decision: Decision; reviewId: string; reviewPath: string }
export type EffectiveDecision = Decision & SourceIdentity & {
  sourceExtractionPath: string
  reviewId: string
  reviewPath: string
}
export type SourceMappingInputs = {
  legacyReviews: ReviewFile[]
  editions: SourceEdition[]
  reviews: ReviewFile[]
  readEvidence: (path: string) => Buffer
}

const schemaDirectory = new URL('../../contracts/source-mapping-review/v2/', import.meta.url)
function schema(name: string) {
  return JSON.parse(readFileSync(new URL(name, schemaDirectory), 'utf8'))
}
const ajv = new Ajv2020({ strict: true, allErrors: true })
addFormats(ajv)
ajv.addSchema(schema('deviation.schema.json'))
const checkReview = ajv.compile<Review>(schema('review.schema.json'))
const checkEdition = ajv.compile<SourceEdition>(schema('edition.schema.json'))

function key(identity: Identity): string {
  return JSON.stringify([identity.targetLandscapeId, identity.sourceId, identity.edition])
}
function portablePath(path: string): void {
  if (typeof path !== 'string' || path.includes('\\') || path.includes(':') ||
      path.split('/').some(part => !part || part === '..' || part === '.')) {
    throw new Error(`Expected a repository-relative path: ${path}`)
  }
}
export function readRepositoryEvidence(repoRoot = fileURLToPath(new URL('../..', import.meta.url))) {
  const root = realpathSync(repoRoot)
  return (path: string): Buffer => {
    portablePath(path)
    const file = realpathSync(resolve(root, path))
    const name = relative(root, file)
    if (name === '..' || name.startsWith('..' + sep) || isAbsolute(name)) {
      throw new Error(`Evidence resolves outside the repository: ${path}`)
    }
    return readFileSync(file)
  }
}

export function sourceRowSha256(edition: SourceIdentity, row: OfficialRow): string {
  const { targetLandscapeId, sourceLandscapeId, sourceId, edition: version } = edition
  return sourceMappingDigest({ targetLandscapeId, sourceLandscapeId, sourceId, edition: version,
    sourceGoalId: row.sourceGoalId, sourceRecordSha256: row.sourceRecordSha256, wording: row.wording, context: row.context, scope: row.scope,
    scopeIds: Object.keys(row.regularTargetsByScope).sort() })
}

/** A conversion covers the complete atomic inventory of this registered extraction. */
function checkExtraction(edition: SourceEdition, rows: Map<string, OfficialRow>, readEvidence: SourceMappingInputs['readEvidence']): void {
  if (edition.sourceExtractionPath.split('/').includes('source-components')) {
    throw new Error(`A bounded source component cannot establish the complete official inventory: ${edition.sourceExtractionPath}`)
  }
  const bytes = readEvidence(edition.sourceExtractionPath)
  if (createHash('sha256').update(bytes).digest('hex') !== edition.sourceExtractionSha256) {
    throw new Error(`Stale source extraction: ${edition.sourceExtractionPath}`)
  }
  const source = JSON.parse(bytes.toString('utf8'))
  if (source?.sourceLandscapeId !== edition.sourceLandscapeId || !Array.isArray(source.sourceGoals)) {
    throw new Error(`Source extraction does not identify this landscape: ${edition.sourceExtractionPath}`)
  }
  const seen = new Set<string>()
  for (const record of source.sourceGoals) {
    if (Array.isArray(record?.contains) && record.contains.length > 0) continue
    const row = rows.get(record?.id)
    if (!row || seen.has(row.sourceGoalId)) throw new Error(`Missing or duplicate official source row: ${record?.id}`)
    const wording = [record.sourceText, record.description, record.title].find(text => typeof text === 'string' && text.trim())
    if (wording !== row.wording || sourceMappingDigest(record) !== row.sourceRecordSha256) {
      throw new Error(`Stale wording or source record: ${row.sourceGoalId}`)
    }
    seen.add(row.sourceGoalId)
  }
  if (seen.size !== rows.size) throw new Error(`Inventoried row absent from source extraction: ${edition.sourceExtractionPath}`)
}

function checkCarriers(row: OfficialRow, decision: Carried): void {
  if (!decision.contributions.some(c => c.kind === decision.mainKind)) {
    throw new Error(`Main carrier kind absent on ${row.sourceGoalId}`)
  }
  const coverage = new Set<string>()
  const contributions = new Set<string>()
  for (const carrier of decision.contributions) {
    if (contributions.has(carrier.canonicalGoalId)) throw new Error(`Repeated carrier on ${row.sourceGoalId}`)
    contributions.add(carrier.canonicalGoalId)
    for (const scopeId of carrier.scopeIds) {
      if (!Object.hasOwn(row.regularTargetsByScope, scopeId) ||
          !row.regularTargetsByScope[scopeId].includes(carrier.canonicalGoalId)) {
        throw new Error(`Carrier ${carrier.canonicalGoalId} is not a regular target in ${scopeId} for ${row.sourceGoalId}`)
      }
      coverage.add(scopeId)
    }
  }
  if (coverage.size !== Object.keys(row.regularTargetsByScope).length) {
    throw new Error(`Incomplete course or module coverage for ${row.sourceGoalId}`)
  }
}

function checkReferences(edition: SourceEdition, effective: Map<string, EffectiveDecision>, rows: Map<string, OfficialRow>): void {
  for (const [origin, first] of effective) {
    if (first.decision !== 'declined') continue
    const visited = new Set([origin])
    let decision = first as EffectiveDecision
    while (decision.decision === 'declined') {
      const { category, evidence } = decision.deviation
      if (category !== 'duplicate' && category !== 'replacedWithinEdition') {
        if (visited.size > 1) throw new Error(`Reference from ${origin} has no positive carrier`)
        break
      }
      const previous = rows.get(decision.sourceGoalId)!
      const field = category === 'duplicate' ? 'duplicateOf' : 'replacedBy'
      const ref = (evidence as unknown as Record<string, { sourceGoalId: string; rowSha256: string }>)[field]
      const next = effective.get(ref.sourceGoalId)
      if (!next || next.rowSha256 !== ref.rowSha256 || next.decision === 'open') {
        throw new Error(`Unresolved reference in ${edition.edition} from ${origin} to ${ref.sourceGoalId}`)
      }
      if (visited.has(ref.sourceGoalId)) throw new Error(`Cyclic reference from ${origin}`)
      if (category === 'duplicate') {
        const target = rows.get(ref.sourceGoalId)!
        const scopeDigest = (row: OfficialRow) => sourceMappingDigest([row.scope, Object.keys(row.regularTargetsByScope).sort()])
        if (scopeDigest(previous) !== scopeDigest(target)) throw new Error(`Duplicate rows have different scope: ${origin}`)
      }
      visited.add(ref.sourceGoalId)
      decision = next
    }
  }
}

export function requireLegacyMappingVersion(document: ReviewFile['document'], path: string): void {
  const { version, schemaVersion } = document
  if ((version === undefined && schemaVersion === undefined) ||
      (version !== undefined && version !== 1) ||
      (schemaVersion !== undefined && schemaVersion !== 1 && schemaVersion !== '1.0')) {
    throw new Error(`Unsupported source-mapping version: ${path}`)
  }
}

export function loadSourceMappingReviews(inputs: SourceMappingInputs): {
  legacyReviews: ReviewFile[]; effectiveDecisions: EffectiveDecision[]
} {
  const { legacyReviews, editions, reviews, readEvidence } = inputs
  const files = new Set<string>()
  for (const file of [...legacyReviews, ...reviews]) {
    portablePath(file.path)
    if (files.has(file.path)) throw new Error(`Repeated review path ${file.path}`)
    files.add(file.path)
  }
  for (const { path, document } of legacyReviews) {
    requireLegacyMappingVersion(document, path)
  }
  const byEdition = new Map<string, SourceEdition>()
  const sourceRows = new Map<string, Map<string, OfficialRow>>()
  for (const edition of editions) {
    if (!checkEdition(edition)) throw new Error(`Invalid registered edition: ${ajv.errorsText(checkEdition.errors)}`)
    const id = key(edition)
    if (byEdition.has(id)) throw new Error(`Repeated edition ${id}`)
    byEdition.set(id, edition)
    const rows = new Map(edition.rows.map(row => [row.sourceGoalId, row]))
    if (rows.size !== edition.rows.length) throw new Error(`Duplicate official row in ${id}`)
    sourceRows.set(id, rows)
    portablePath(edition.sourceExtractionPath)
    checkExtraction(edition, rows, readEvidence)
  }
  const superseded = resolvePredecessors(editions, legacyReviews, readEvidence)

  const candidates = new Map<string, Map<string, ReviewedRow[]>>()
  for (const { path, document } of reviews) {
    if (!checkReview(document)) throw new Error(`Invalid V2 review ${path}: ${ajv.errorsText(checkReview.errors)}`)
    const id = key(document)
    const edition = byEdition.get(id)
    if (!edition || document.sourceLandscapeId !== edition.sourceLandscapeId) throw new Error(`Unregistered source or edition: ${path}`)
    const group = candidates.get(id) ?? new Map<string, ReviewedRow[]>()
    candidates.set(id, group)
    const inFile = new Set<string>()
    for (const decision of document.decisions) {
      const rowId = decision.sourceGoalId
      if (!sourceRows.get(id)!.has(rowId) || inFile.has(rowId)) throw new Error(`Unknown or duplicate row ${rowId} in ${path}`)
      inFile.add(rowId)
      const list = group.get(rowId) ?? []
      list.push({ decision, reviewId: document.reviewId, reviewPath: path })
      group.set(rowId, list)
    }
  }
  const effectiveDecisions: EffectiveDecision[] = []
  const reasons = new Map<string, string>()
  for (const [id, edition] of byEdition) {
    const rows = sourceRows.get(id)!
    const effective = new Map<string, EffectiveDecision>()
    for (const selected of Object.keys(edition.selectedReviews)) {
      if (!rows.has(selected)) throw new Error(`Selection for unknown row ${selected}`)
    }
    for (const [rowId, row] of rows) {
      const options = candidates.get(id)?.get(rowId) ?? []
      const selected = Object.hasOwn(edition.selectedReviews, rowId) ? edition.selectedReviews[rowId] : undefined
      const option = selected ? options.find(entry => entry.reviewPath === selected) : options.length === 1 ? options[0] : undefined
      if (!option) throw new Error(`Missing or ambiguous effective decision: ${id} ${rowId}`)
      const { decision, reviewId, reviewPath } = option
      if (decision.rowSha256 !== sourceRowSha256(edition, row)) throw new Error(`Stale official row binding: ${rowId}`)
      if (decision.decision === 'carried') checkCarriers(row, decision)
      if (decision.decision === 'declined') {
        validateDeviation(decision, edition, readEvidence)
        const reason = decision.deviation.reason.normalize('NFKC').trim().toLowerCase().replace(/\s+/gu, ' ')
        if (reasons.has(reason)) throw new Error(`Repeated deviation reason on ${reasons.get(reason)} and ${rowId}`)
        reasons.set(reason, rowId)
      }
      effective.set(rowId, { ...decision, targetLandscapeId: edition.targetLandscapeId, sourceLandscapeId: edition.sourceLandscapeId,
        sourceId: edition.sourceId, edition: edition.edition, sourceExtractionPath: edition.sourceExtractionPath, reviewId, reviewPath })
    }
    checkReferences(edition, effective, rows)
    effectiveDecisions.push(...effective.values())
  }
  return { legacyReviews: legacyReviews.filter(file => !superseded.has(file.path)), effectiveDecisions }
}
