import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { parseSourceMappingV2Json } from './lib/sourceMappingV2Json'
import { resolvePredecessors } from './sourceMappingPredecessors'
import { sourceMappingDigest, sourceRowSha256 } from './sourceMappingDigest'
import { normalizedDeviationReason, validateDeviation, type DeclinedDecision } from './sourceMappingDeviation'
export { sourceRowSha256 } from './sourceMappingDigest'

export type ReviewFile = { path: string; document: Record<string, unknown> }
export type CarrierKind = 'subject' | 'crossCutting'
export type Contribution = {
  canonicalGoalId: string
  kind: CarrierKind
  matchType: 'partial' | 'exact'
  performance: string
  scopeIds: string[]
}
type RowDecision = { sourceGoalId: string; rowSha256: string; authorId: string }
type Carried = RowDecision & {
  decision: 'carried'
  mainKind: CarrierKind
  performance: string
  contributions: Contribution[]
  reviewerId: string
  reviewedAt: string
}
type Decision = Carried | DeclinedDecision | (RowDecision & { decision: 'open'; rationale: string })
type Identity = { targetLandscapeId: string; sourceId: string; edition: string }
export type SourceIdentity = Identity & { sourceLandscapeId: string }
type ParentContext = { kind: 'sourceGoal' | 'passage' | 'extraction'; id: string; contextSha256: string }
export type OfficialRow = {
  sourceGoalId: string
  wording: string
  sourceRecordSha256: string
  parentContext: ParentContext[]
  applicableScopeIds: string[]
  regularTargetsByScope: Record<string, string[]>
}
export type SourceEdition = SourceIdentity & {
  sourceExtractionPath: string
  sourceExtractionSha256: string
  rows: OfficialRow[]
  historicalExtractions?: { path: string; sha256: string }[]
  retainedLegacyReviews?: { path: string; edition: string; sourceExtractionPath: string; sourceExtractionSha256: string }[]
  retiredRowSuccessors?: { sourceGoalId: string; successorSourceGoalId: string; successorRowSha256: string }[]
  legacyReviewPaths: string[]
  selectedReviews: { sourceGoalId: string; reviewPath: string }[]
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

const schemaDirectory = new URL('../../contracts/drafts/source-mapping-review/v2/', import.meta.url)
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

type SourceRecord = Record<string, unknown>

/** Hash the applicable headings and passages, while membership follows the extraction's own links. */
function indexExtractionContext(source: SourceRecord, records: Map<string, SourceRecord>, path: string) {
  const parents = new Map<string, Set<string>>()
  const parentContexts = new Map<string, ParentContext>()
  const rowPassages = new Map<string, Set<string>>()
  const passages = new Map<string, ParentContext>()
  const link = (index: Map<string, Set<string>>, child: string, parent: string) => {
    const entries = index.get(child) ?? new Set<string>()
    entries.add(parent)
    index.set(child, entries)
  }
  for (const [id, { contains, ...metadata }] of records) {
    if (contains === undefined) continue
    if (!Array.isArray(contains) || contains.some(child => typeof child !== 'string' || !records.has(child))) {
      throw new Error(`Invalid containment at ${id} in ${path}`)
    }
    if (!contains.length) continue
    parentContexts.set(id, { kind: 'sourceGoal', id, contextSha256: sourceMappingDigest(metadata) })
    for (const child of contains) link(parents, child, id)
  }
  if (source.passages !== undefined && !Array.isArray(source.passages)) {
    throw new Error(`Invalid source passages in ${path}`)
  }
  for (const passage of source.passages ?? []) {
    const id = passage?.id ?? passage?.passageId
    if (typeof id !== 'string' || !id.trim() || passages.has(id)) {
      throw new Error(`Missing or duplicate source passage ${id} in ${path}`)
    }
    const { sourceGoalIds, ...metadata } = passage
    passages.set(id, { kind: 'passage', id, contextSha256: sourceMappingDigest(metadata) })
    if (sourceGoalIds === undefined) continue
    if (!Array.isArray(sourceGoalIds) || sourceGoalIds.some(child => typeof child !== 'string')) {
      throw new Error(`Invalid passage membership at ${id} in ${path}`)
    }
    for (const child of sourceGoalIds) if (records.has(child)) link(rowPassages, child, id)
  }
  for (const [id, record] of records) {
    if (record.passageId === undefined) continue
    if (typeof record.passageId !== 'string' || !passages.has(record.passageId)) {
      throw new Error(`Unresolved source passage ${record.passageId} on ${id} in ${path}`)
    }
    link(rowPassages, id, record.passageId)
  }
  const scopeFields = ['title', 'subject', 'jurisdiction', 'schoolType', 'stage', 'courseLevel', 'courseProfile',
    'durationModel', 'durationModels', 'scopeRules', 'scopeQualification']
  const sourceMetadata = Object.fromEntries(scopeFields.filter(field => Object.hasOwn(source, field))
    .map(field => [field, source[field]]))
  const cache = new Map<string, Map<string, ParentContext>>()
  const active = new Set<string>()
  function inherited(id: string): Map<string, ParentContext> {
    const cached = cache.get(id)
    if (cached) return cached
    if (active.has(id)) throw new Error(`Cyclic source containment at ${id} in ${path}`)
    active.add(id)
    const contexts = new Map<string, ParentContext>()
    for (const parent of parents.get(id) ?? []) {
      contexts.set(`sourceGoal:${parent}`, parentContexts.get(parent)!)
      for (const [key, record] of inherited(parent)) contexts.set(key, record)
    }
    for (const passage of rowPassages.get(id) ?? []) contexts.set(`passage:${passage}`, passages.get(passage)!)
    active.delete(id)
    cache.set(id, contexts)
    return contexts
  }
  // Validate disconnected structures and cycles even if they contain no atomic row.
  for (const id of records.keys()) inherited(id)
  const extraction: ParentContext[] = Object.keys(sourceMetadata).length === 0 ? [] : [{
    kind: 'extraction', id: String(source.sourceLandscapeId), contextSha256: sourceMappingDigest(sourceMetadata),
  }]
  return (id: string): ParentContext[] => {
    const contexts = inherited(id)
    return [...extraction, ...[...contexts.keys()].sort().map(key => contexts.get(key)!)]
  }
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
  const source = parseSourceMappingV2Json(bytes, edition.sourceExtractionPath)
  if (source?.sourceLandscapeId !== edition.sourceLandscapeId || !Array.isArray(source.sourceGoals)) {
    throw new Error(`Source extraction does not identify this landscape: ${edition.sourceExtractionPath}`)
  }
  const records = new Map<string, SourceRecord>()
  for (const record of source.sourceGoals) {
    const id = record?.id
    if (typeof id !== 'string' || !id.trim() || records.has(id)) throw new Error(`Missing or duplicate official source row: ${id}`)
    records.set(id, record)
  }
  const contextFor = indexExtractionContext(source, records, edition.sourceExtractionPath)
  let atomicCount = 0
  for (const [id, record] of records) {
    if (Array.isArray(record.contains) && record.contains.length > 0) continue
    const row = rows.get(id)
    if (!row) throw new Error(`Missing or duplicate official source row: ${id}`)
    const wording = [record.sourceText, record.description, record.title].find(text => typeof text === 'string' && text.trim())
    if (wording !== row.wording || sourceMappingDigest(record) !== row.sourceRecordSha256) {
      throw new Error(`Stale wording or source record: ${row.sourceGoalId}`)
    }
    if (sourceMappingDigest(contextFor(id)) !== sourceMappingDigest(row.parentContext)) {
      throw new Error(`Stale source parent context: ${id}`)
    }
    const regularTargetScopes = Object.keys(row.regularTargetsByScope)
    if (!sameScopes(row.applicableScopeIds, regularTargetScopes)) {
      throw new Error(`Regular target sets must match the official applicable scopes: ${id}`)
    }
    atomicCount++
  }
  if (atomicCount !== rows.size) throw new Error(`Inventoried row absent from source extraction: ${edition.sourceExtractionPath}`)
}

function sameScopes(first: string[], second: string[]): boolean {
  const scopeSet = new Set(second)
  return first.length === second.length && first.every(scope => scopeSet.has(scope))
}

function checkCarriers(row: OfficialRow, decision: Carried): void {
  if (!decision.contributions.some(c => c.kind === decision.mainKind)) {
    throw new Error(`Main carrier kind absent on ${row.sourceGoalId}`)
  }
  const applicable = new Set(row.applicableScopeIds)
  const coverage = new Set<string>()
  const contributions = new Set<string>()
  for (const carrier of decision.contributions) {
    if (contributions.has(carrier.canonicalGoalId)) throw new Error(`Repeated carrier on ${row.sourceGoalId}`)
    contributions.add(carrier.canonicalGoalId)
    for (const scopeId of carrier.scopeIds) {
      if (!applicable.has(scopeId) ||
          !row.regularTargetsByScope[scopeId].includes(carrier.canonicalGoalId)) {
        throw new Error(`Carrier ${carrier.canonicalGoalId} is not a regular target in ${scopeId} for ${row.sourceGoalId}`)
      }
      coverage.add(scopeId)
    }
  }
  if (coverage.size !== applicable.size) {
    throw new Error(`Incomplete course or module coverage for ${row.sourceGoalId}`)
  }
}

function checkReferences(edition: SourceEdition, effective: Map<string, EffectiveDecision>, rows: Map<string, OfficialRow>): void {
  for (const [origin, first] of effective) {
    if (first.decision !== 'declined') continue
    const visited = new Set([origin])
    let decision = first as EffectiveDecision
    while (decision.decision === 'declined') {
      const deviation = decision.deviation
      if (deviation.category !== 'duplicate' && deviation.category !== 'replacedWithinEdition') {
        if (visited.size > 1) throw new Error(`Reference from ${origin} has no positive carrier`)
        break
      }
      const precedingScopes = rows.get(decision.sourceGoalId)!.applicableScopeIds
      const ref = deviation.category === 'duplicate' ? deviation.evidence.duplicateOf : deviation.evidence.replacedBy
      const next = effective.get(ref.sourceGoalId)
      if (!next || next.rowSha256 !== ref.rowSha256 || next.decision === 'open') {
        throw new Error(`Unresolved reference in ${edition.edition} from ${origin} to ${ref.sourceGoalId}`)
      }
      if (visited.has(ref.sourceGoalId)) throw new Error(`Cyclic reference from ${origin}`)
      const succeedingScopes = rows.get(ref.sourceGoalId)!.applicableScopeIds
      if (deviation.category === 'duplicate') {
        if (!sameScopes(precedingScopes, succeedingScopes)) throw new Error(`Duplicate rows have different scope: ${origin}`)
      } else {
        const change = deviation.evidence.scopeChange
        if (change && (!sameScopes(precedingScopes, change.fromScopeIds) || !sameScopes(succeedingScopes, change.toScopeIds))) {
          throw new Error(`Replacement scope evidence does not match the official scopes: ${origin}`)
        }
        if (!change && !precedingScopes.every(scope => succeedingScopes.includes(scope))) {
          throw new Error(`Replacement does not cover the original applicable scopes: ${origin}`)
        }
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
    const selections = new Map<string, string>()
    for (const { sourceGoalId, reviewPath } of edition.selectedReviews) {
      if (!rows.has(sourceGoalId)) throw new Error(`Selection for unknown row ${sourceGoalId}`)
      if (selections.has(sourceGoalId)) throw new Error(`Repeated review selection for row ${sourceGoalId}`)
      selections.set(sourceGoalId, reviewPath)
    }
    for (const [rowId, row] of rows) {
      const options = candidates.get(id)?.get(rowId) ?? []
      const selected = selections.get(rowId)
      const option = selected ? options.find(entry => entry.reviewPath === selected) : options.length === 1 ? options[0] : undefined
      if (!option) throw new Error(`Missing or ambiguous effective decision: ${id} ${rowId}`)
      const { decision, reviewId, reviewPath } = option
      if (decision.rowSha256 !== sourceRowSha256(edition, row)) throw new Error(`Stale official row binding: ${rowId}`)
      if (decision.decision === 'carried') checkCarriers(row, decision)
      if (decision.decision === 'declined') {
        validateDeviation(decision, edition, readEvidence)
        const reason = normalizedDeviationReason(decision.deviation.reason)
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
