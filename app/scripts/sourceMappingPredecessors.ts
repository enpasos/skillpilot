// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
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

function originalDocument(value: Record<string, unknown>): OriginalDocument {
  return {
    locations: [value.path, value.localPath, value.url].filter(stringId),
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
  const extraction = JSON.parse(bytes.toString('utf8'))
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
    ? originalDocument(extraction.sourceDocument) : undefined
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

function registerSuccessors(converted: ConvertedEdition): void {
  const current = new Map(converted.edition.rows.map(row => [row.sourceGoalId, row]))
  for (const ref of converted.edition.retiredRowSuccessors ?? []) {
    const successor = current.get(ref.successorSourceGoalId)
    if (converted.successorRowIds.has(ref.sourceGoalId)
      || converted.currentRowIds.has(ref.sourceGoalId) || !converted.rowIds.has(ref.sourceGoalId)
      || !successor || successor.sourceRecordSha256 !== ref.successorSourceRecordSha256) {
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
  const sources = new Map<string, ConvertedSource>()
  const legacyByPath = new Map(legacy.map(file => [file.path, file]))
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
    const current = { path: edition.sourceExtractionPath, sha256: edition.sourceExtractionSha256 }
    const currentExtraction = readExtractionRows(current, edition.sourceLandscapeId, readEvidence)
    const extractionRefs = [current, ...(edition.historicalExtractions ?? [])]
    for (const [index, ref] of extractionRefs.entries()) {
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
    for (const path of edition.legacyReviewPaths) {
      const file = legacyByPath.get(path)
      if (!file || !boundTo(file, edition) || source.predecessors.has(path)) invalidBinding(path)
      const extractionPath = file.document.sourceExtractionPath
      if (extractionPath !== undefined && (!stringId(extractionPath) || source.byPath.get(extractionPath)?.converted !== converted)) {
        invalidBinding(path)
      }
      source.predecessors.set(path, converted)
    }
  }

  for (const source of sources.values()) {
    for (const { edition } of source.editions) {
      for (const ref of edition.retainedLegacyReviews ?? []) {
        const file = legacyByPath.get(ref.path)
        if (!file || !boundTo(file, edition)
          || (file.document.sourceExtractionPath !== undefined && file.document.sourceExtractionPath !== ref.sourceExtractionPath)
          || source.predecessors.has(ref.path) || source.retained.has(ref.path)
          || source.editions.some(converted => converted.edition.edition === ref.edition)
          || source.byPath.has(ref.sourceExtractionPath) || source.digests.has(ref.sourceExtractionSha256)) {
          invalidBinding(ref.path)
        }
        const retained = readExtractionRows({ path: ref.sourceExtractionPath, sha256: ref.sourceExtractionSha256 },
          edition.sourceLandscapeId, readEvidence)
        verifyRetainedEdition(ref.path, readLegacyRows(file), retained, source)
        source.retained.add(ref.path)
      }
    }
  }

  const superseded = new Set<string>()
  for (const file of legacy) {
    const { path, document } = file
    const source = sources.get(sourceKey(document))
    if (!source) continue
    if (document.sourceExtractionPath !== undefined && !stringId(document.sourceExtractionPath)) invalidBinding(path)
    if (source.retained.has(path)) continue
    const chosen = source.predecessors.get(path)
    const ids = [...readLegacyRows(file)]
    const overlaps = source.editions.filter(converted => ids.some(id => converted.rowIds.has(id)))
    if (stringId(document.sourceExtractionPath)) {
      const bound = source.byPath.get(document.sourceExtractionPath)
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
