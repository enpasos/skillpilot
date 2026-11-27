// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import type { ReviewFile, SourceEdition, SourceMappingInputs } from './sourceMappingReview'

type ExtractionRef = { path: string; sha256: string }
type ExtractedRows = { rowIds: Set<string>; originalLocations: string[]; effectiveFrom?: string }
type ConvertedEdition = { edition: SourceEdition; rowIds: Set<string> }
type BoundExtraction = { converted: ConvertedEdition; rowIds: Set<string> }
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

function readExtractionRows(ref: ExtractionRef, sourceLandscapeId: string, readEvidence: ReadEvidence): ExtractedRows {
  const bytes = readEvidence(ref.path)
  if (createHash('sha256').update(bytes).digest('hex') !== ref.sha256) {
    throw new Error(`Stale predecessor extraction: ${ref.path}`)
  }
  const extraction = JSON.parse(bytes.toString('utf8'))
  if (extraction?.sourceLandscapeId !== sourceLandscapeId || !Array.isArray(extraction.sourceGoals)) {
    throw new Error(`Invalid predecessor extraction landscape: ${ref.path}`)
  }
  const rows = new Set<string>()
  for (const record of extraction.sourceGoals) {
    if (!stringId(record?.id)) throw new Error(`Missing row identity in predecessor extraction: ${ref.path}`)
    rows.add(record.id)
  }
  if (rows.size === 0) throw new Error(`Empty predecessor extraction: ${ref.path}`)
  const original = extraction.sourceDocument
  return {
    rowIds: rows,
    originalLocations: [original?.path, original?.localPath, original?.url].filter(stringId),
    effectiveFrom: stringId(original?.effectiveFrom) ? original.effectiveFrom : undefined,
  }
}

function conflictingOriginal(left: ExtractedRows, right: ExtractedRows): boolean {
  return (left.originalLocations.length > 0 && right.originalLocations.length > 0
      && !left.originalLocations.some(location => right.originalLocations.includes(location)))
    || (left.effectiveFrom !== undefined && right.effectiveFrom !== undefined && left.effectiveFrom !== right.effectiveFrom)
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

/** Files without explicit extraction provenance can only be retired as an entire, unambiguous set. */
export function resolvePredecessors(editions: SourceEdition[], legacy: ReviewFile[], readEvidence: ReadEvidence): Set<string> {
  const sources = new Map<string, ConvertedSource>()
  const legacyByPath = new Map(legacy.map(file => [file.path, file]))
  for (const edition of editions) {
    const key = sourceKey(edition)
    const source: ConvertedSource = sources.get(key) ?? {
      editions: [], byPath: new Map(), digests: new Set(), predecessors: new Map(), retained: new Set(),
    }
    sources.set(key, source)
    const converted: ConvertedEdition = { edition, rowIds: new Set() }
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
      if (historical && conflictingOriginal(currentExtraction, extraction)) {
        throw new Error(`Historical predecessor extraction identifies a different original edition: ${ref.path}`)
      }
      for (const id of extraction.rowIds) converted.rowIds.add(id)
      source.byPath.set(ref.path, { converted, rowIds: extraction.rowIds })
      source.digests.add(ref.sha256)
    }
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
        if (!file || !boundTo(file, edition) || file.document.sourceExtractionPath !== undefined
          || source.predecessors.has(ref.path) || source.retained.has(ref.path)
          || source.editions.some(converted => converted.edition.edition === ref.edition)
          || source.byPath.has(ref.sourceExtractionPath) || source.digests.has(ref.sourceExtractionSha256)) {
          invalidBinding(ref.path)
        }
        const { rowIds } = readExtractionRows({ path: ref.sourceExtractionPath, sha256: ref.sourceExtractionSha256 },
          edition.sourceLandscapeId, readEvidence)
        const ids = readLegacyRows(file)
        if (ids.size === 0 || [...ids].some(id => !rowIds.has(id))) invalidBinding(ref.path)
        source.retained.add(ref.path)
      }
    }
  }

  const superseded = new Set<string>()
  for (const file of legacy) {
    const { path, document } = file
    const source = sources.get(sourceKey(document))
    if (!source) continue
    const chosen = source.predecessors.get(path)
    if (stringId(document.sourceExtractionPath)) {
      const bound = source.byPath.get(document.sourceExtractionPath)
      if (!bound) continue
      if (!chosen) throw new Error(`Specify the legacy review belonging to the converted edition: ${path}`)
      const ids = readLegacyRows(file)
      if (ids.size === 0 || [...ids].some(id => !bound.rowIds.has(id))) invalidBinding(path)
      superseded.add(path)
      continue
    }
    if (document.sourceExtractionPath !== undefined) invalidBinding(path)
    if (source.retained.has(path)) continue
    const ids = [...readLegacyRows(file)]
    const overlaps = source.editions.filter(converted => ids.some(id => converted.rowIds.has(id)))
    if (!chosen) {
      if (overlaps.length === 0) continue
      throw new Error(`Specify the predecessor or retained edition for overlapping pathless legacy review: ${path}`)
    }
    if (overlaps.length !== 1 || chosen !== overlaps[0] || ids.some(id => !chosen.rowIds.has(id))) {
      invalidBinding(path)
    }
    superseded.add(path)
  }
  return superseded
}
