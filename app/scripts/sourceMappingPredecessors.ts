// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { posix } from 'node:path'
import { parseSourceMappingV2Json } from './lib/sourceMappingV2Json'
import { sourceRowSha256 } from './sourceMappingDigest'
import type { ReviewFile, SourceEdition, SourceMappingInputs } from './sourceMappingReview'

type ExtractionRef = { path: string; sha256: string }
type OriginalDocument = { locations: string[]; effectiveFrom?: string; sha256?: string }
type ExtractedRows = { originals: OriginalDocument[]; originsByRowId: Map<string, OriginalDocument[]> }
type ConvertedEdition = {
  edition: SourceEdition
  extractions: ExtractedRows[]
  rowIds: Set<string>
  currentRowIds: Set<string>
  successorRowIds: Set<string>
}
type BoundExtraction = { converted: ConvertedEdition; extraction: ExtractedRows }
type ConvertedSource = {
  editions: ConvertedEdition[]
  byPath: Map<string, BoundExtraction>
  digests: Set<string>
  predecessors: Map<string, ConvertedEdition>
  retained: Set<string>
}

type ReadEvidence = SourceMappingInputs['readEvidence']

function sourceKey({ targetLandscapeId, sourceLandscapeId }: Record<string, unknown>): string {
  return JSON.stringify([targetLandscapeId, sourceLandscapeId])
}

function stringId(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeRepositoryPath(path: string): string | undefined {
  if (!stringId(path) || posix.isAbsolute(path) || /[:\\]/u.test(path)) return undefined
  const normalized = posix.normalize(path).replace(/\/$/u, '')
  return normalized === '.' || normalized === '..' || normalized.startsWith('../') ? undefined : normalized
}

function repositoryPath(path: string): string {
  return normalizeRepositoryPath(path) ?? invalidBinding(path)
}

function originalLocation(location: string): string | undefined {
  if (posix.isAbsolute(location) || /[:\\]/u.test(location)) return location
  return normalizeRepositoryPath(location)
}

function originalDocument(value: Record<string, unknown>): OriginalDocument {
  return {
    locations: [...new Set([value.path, value.localPath, value.url]
      .filter(stringId).map(originalLocation).filter(stringId))],
    effectiveFrom: stringId(value.effectiveFrom) ? value.effectiveFrom : undefined,
    sha256: typeof value.sha256 === 'string' && /^(sha256:)?[a-f0-9]{64}$/u.test(value.sha256)
      ? value.sha256.replace(/^sha256:/u, '') : undefined,
  }
}

function readExtractionRows(ref: ExtractionRef, sourceLandscapeId: string, readEvidence: ReadEvidence): ExtractedRows {
  const bytes = readEvidence(ref.path)
  if (createHash('sha256').update(bytes).digest('hex') !== ref.sha256) {
    throw new Error(`Stale predecessor extraction: ${ref.path}`)
  }
  const extraction = parseSourceMappingV2Json(bytes, ref.path)
  if (extraction?.sourceLandscapeId !== sourceLandscapeId || !Array.isArray(extraction.sourceGoals)) {
    throw new Error(`Invalid predecessor extraction landscape: ${ref.path}`)
  }
  const originalsByKey = new Map<string, OriginalDocument>()
  for (const entry of Array.isArray(extraction.sourceDocuments) ? extraction.sourceDocuments : []) {
    if (!stringId(entry?.key)) continue
    if (originalsByKey.has(entry.key)) throw new Error(`Repeated original document key: ${ref.path}`)
    originalsByKey.set(entry.key, originalDocument(entry))
  }
  const original = extraction.sourceDocument && typeof extraction.sourceDocument === 'object'
    ? originalDocument(extraction.sourceDocument as Record<string, unknown>) : undefined
  const originals = original ? [original, ...originalsByKey.values()] : [...originalsByKey.values()]
  const originsByRowId = new Map<string, OriginalDocument[]>()
  for (const record of extraction.sourceGoals) {
    if (!stringId(record?.id)) throw new Error(`Missing row identity in predecessor extraction: ${ref.path}`)
    if (originsByRowId.has(record.id)) throw new Error(`Repeated row in predecessor extraction: ${ref.path}`)
    const identified = originalsByKey.get(record.sourceDocumentKey)
    originsByRowId.set(record.id, identified ? [identified] : originals)
  }
  if (originsByRowId.size === 0) throw new Error(`Empty predecessor extraction: ${ref.path}`)
  return { originals, originsByRowId }
}

function distinctOriginal(left: OriginalDocument, right: OriginalDocument): boolean {
  if (left.sha256 !== undefined && left.sha256 === right.sha256) return false
  return (left.locations.length > 0 && right.locations.length > 0
      && !left.locations.some(location => right.locations.includes(location)))
    || (left.effectiveFrom !== undefined && right.effectiveFrom !== undefined && left.effectiveFrom !== right.effectiveFrom)
}

function distinctOriginals(left: OriginalDocument[], right: OriginalDocument[]): boolean {
  return left.length > 0 && right.length > 0
    && left.every(original => right.every(other => distinctOriginal(original, other)))
}

function readLegacyRows({ path, document }: ReviewFile): Set<string> {
  const ids = new Set<string>()
  for (const [records, field] of [[document.mappings, 'legacyGoalId'], [document.decisions, 'sourceGoalId']] as const) {
    if (records === undefined) continue
    if (!Array.isArray(records)) throw new Error(`Legacy review has no verifiable row list: ${path}`)
    for (const record of records) {
      const id = record?.[field]
      if (!stringId(id)) throw new Error(`Legacy review has no verifiable row identity: ${path}`)
      ids.add(id)
    }
  }
  return ids
}

function boundTo(legacy: ReviewFile, edition: SourceEdition): boolean {
  return sourceKey(legacy.document) === sourceKey(edition)
}

function invalidBinding(path: string): never {
  throw new Error(`Invalid predecessor or edition binding: ${path}`)
}

function legacyExtractionPath({ path, document }: ReviewFile): string | undefined {
  const reference = document.sourceExtractionPath
  if (reference === undefined) return undefined
  if (!stringId(reference)) invalidBinding(path)
  return normalizeRepositoryPath(reference) ?? invalidBinding(path)
}

function registerSuccessors(converted: ConvertedEdition): void {
  const current = new Map(converted.edition.rows.map(row => [row.sourceGoalId, row]))
  for (const ref of converted.edition.retiredRowSuccessors ?? []) {
    const successor = current.get(ref.successorSourceGoalId)
    if (converted.successorRowIds.has(ref.sourceGoalId)
      || converted.currentRowIds.has(ref.sourceGoalId) || !converted.rowIds.has(ref.sourceGoalId)
      || !successor || sourceRowSha256(converted.edition, successor) !== ref.successorRowSha256) {
      throw new Error(`Invalid retired source row successor: ${ref.sourceGoalId}`)
    }
    converted.successorRowIds.add(ref.sourceGoalId)
  }
}

function verifyRetainedEdition(path: string, ids: Set<string>, retained: ExtractedRows, source: ConvertedSource): void {
  if (ids.size === 0 || [...ids].some(id => !retained.originsByRowId.has(id))) invalidBinding(path)
  for (const converted of source.editions) {
    for (const extraction of converted.extractions) {
      for (const id of ids) {
        const original = extraction.originsByRowId.get(id)
        if (original && !distinctOriginals(original, retained.originsByRowId.get(id)!)) {
          throw new Error(`Cannot verify a distinct retained edition for ${id}: ${path}`)
        }
      }
    }
  }
}

/** Retire complete V1 files only after binding all of their rows to a converted edition. */
export function resolvePredecessors(editions: SourceEdition[], legacy: ReviewFile[], readEvidence: ReadEvidence): Set<string> {
  if (editions.length === 0) return new Set()
  const sources = new Map<string, ConvertedSource>()
  const legacyByPath = new Map<string, ReviewFile>()
  for (const file of legacy) {
    const path = repositoryPath(file.path)
    if (legacyByPath.has(path)) throw new Error(`Repeated review path ${path}`)
    legacyByPath.set(path, file)
  }
  for (const edition of editions) {
    const key = sourceKey(edition)
    const source: ConvertedSource = sources.get(key) ?? {
      editions: [], byPath: new Map(), digests: new Set(), predecessors: new Map(), retained: new Set(),
    }
    sources.set(key, source)
    const converted: ConvertedEdition = {
      edition, extractions: [], rowIds: new Set(),
      currentRowIds: new Set(edition.rows.map(row => row.sourceGoalId)), successorRowIds: new Set(),
    }
    source.editions.push(converted)
    const current = { path: repositoryPath(edition.sourceExtractionPath), sha256: edition.sourceExtractionSha256 }
    const currentExtraction = readExtractionRows(current, edition.sourceLandscapeId, readEvidence)
    const extractionRefs = [current, ...(edition.historicalExtractions ?? [])]
    for (const [index, rawRef] of extractionRefs.entries()) {
      const ref = { ...rawRef, path: repositoryPath(rawRef.path) }
      const historical = index > 0
      if (source.byPath.has(ref.path) || source.digests.has(ref.sha256)) {
        throw new Error(`Predecessor extraction is registered more than once: ${ref.path}`)
      }
      const extraction = historical ? readExtractionRows(ref, edition.sourceLandscapeId, readEvidence) : currentExtraction
      if (historical && distinctOriginals(currentExtraction.originals, extraction.originals)) {
        throw new Error(`Historical predecessor extraction identifies a different original edition: ${ref.path}`)
      }
      for (const id of extraction.originsByRowId.keys()) converted.rowIds.add(id)
      converted.extractions.push(extraction)
      source.byPath.set(ref.path, { converted, extraction })
      source.digests.add(ref.sha256)
    }
    registerSuccessors(converted)
    for (const reference of edition.legacyReviewPaths) {
      const path = repositoryPath(reference)
      const file = legacyByPath.get(path)
      if (!file || !boundTo(file, edition) || source.predecessors.has(path)) invalidBinding(path)
      const extractionPath = legacyExtractionPath(file)
      if (extractionPath !== undefined && source.byPath.get(extractionPath)?.converted !== converted) {
        invalidBinding(path)
      }
      source.predecessors.set(path, converted)
    }
  }

  for (const source of sources.values()) {
    for (const { edition } of source.editions) {
      for (const ref of edition.retainedLegacyReviews ?? []) {
        const path = repositoryPath(ref.path)
        const extractionPath = repositoryPath(ref.sourceExtractionPath)
        const file = legacyByPath.get(path)
        const legacyPath = file && legacyExtractionPath(file)
        if (!file || !boundTo(file, edition)
          || (legacyPath !== undefined && legacyPath !== extractionPath)
          || source.predecessors.has(path) || source.retained.has(path)
          || source.editions.some(converted => converted.edition.edition === ref.edition)
          || source.byPath.has(extractionPath) || source.digests.has(ref.sourceExtractionSha256)) {
          invalidBinding(ref.path)
        }
        const retained = readExtractionRows({ path: extractionPath, sha256: ref.sourceExtractionSha256 },
          edition.sourceLandscapeId, readEvidence)
        verifyRetainedEdition(ref.path, readLegacyRows(file), retained, source)
        source.retained.add(path)
      }
    }
  }

  const superseded = new Set<string>()
  for (const file of legacy) {
    const { path, document } = file
    const source = sources.get(sourceKey(document))
    if (!source) continue
    const identity = repositoryPath(path)
    const extractionPath = legacyExtractionPath(file)
    if (source.retained.has(identity)) continue
    const chosen = source.predecessors.get(identity)
    const ids = [...readLegacyRows(file)]
    const overlaps = source.editions.filter(converted => ids.some(id => converted.rowIds.has(id)))
    if (extractionPath !== undefined) {
      const bound = source.byPath.get(extractionPath)
      if (!chosen) {
        if (bound) throw new Error(`Specify the legacy review belonging to the converted edition: ${path}`)
        if (overlaps.length > 0) {
          throw new Error(`Specify the predecessor or retained edition for overlapping legacy review: ${path}`)
        }
        continue
      }
      if (!bound || ids.length === 0 || ids.some(id => !bound.extraction.originsByRowId.has(id))) invalidBinding(path)
    } else if (!chosen) {
      if (overlaps.length === 0) continue
      throw new Error(`Specify the predecessor or retained edition for overlapping pathless legacy review: ${path}`)
    } else if (overlaps.length !== 1 || chosen !== overlaps[0] || ids.some(id => !chosen.rowIds.has(id))) {
      invalidBinding(path)
    }
    for (const id of ids) {
      if (!chosen.currentRowIds.has(id) && !chosen.successorRowIds.has(id)) {
        throw new Error(`Retired legacy row has no current decision or successor: ${id} in ${path}`)
      }
    }
    superseded.add(path)
  }
  return superseded
}
