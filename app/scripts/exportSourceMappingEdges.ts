// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  loadSourceMappingReviews,
  readRepositoryEvidence,
  requireLegacyMappingVersion,
  type SourceMappingInputs,
} from './sourceMappingReview'

type LoadedMappingReviews = ReturnType<typeof loadSourceMappingReviews>
type FileReference = { path: string; sha256: string }
type BoundReview = SourceMappingInputs['reviews'][number] & { sha256: string }

const repository = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')

export function readCurrentLegacySourceMappings(
  repositoryRoot = repository,
  registeredReviews: readonly BoundReview[] = [],
): SourceMappingInputs['legacyReviews'] {
  const mappingRoot = resolve(repositoryRoot, 'curricula/DE')
  const files: string[] = []
  const visit = (directory: string, withinMapping: boolean) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory() && entry.name !== 'quality') {
        visit(path, withinMapping || entry.name === 'mapping')
      } else if (withinMapping && entry.isFile() && entry.name.endsWith('.json')) {
        files.push(path)
      }
    }
  }
  if (existsSync(mappingRoot)) visit(mappingRoot, false)
  const registeredByPath = new Map(registeredReviews.map(review => [review.path, review.sha256]))
  return files.sort((left, right) => left.localeCompare(right)).flatMap(file => {
    const path = relative(repositoryRoot, file).split(sep).join('/')
    const bytes = readFileSync(file)
    const document = readObject(bytes, path)
    if (document.version === 2) {
      const registered = registeredByPath.get(path)
      if (!registered) throw new Error(`V2 review in mapping directory requires an explicit manifest entry: ${path}`)
      if (digest(bytes) !== registered) throw new Error(`V2 review changed after manifest verification: ${path}`)
      return []
    }
    requireLegacyMappingVersion(document, path)
    return [{ path, document }]
  })
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0
}

/** Preserve the historical file bundles and derive positive edges from effective V2 decisions. */
export function exportSourceMappingEdges({ legacyReviews, effectiveDecisions }: LoadedMappingReviews) {
  const positiveEdges = effectiveDecisions.flatMap(decision => {
    if (decision.decision !== 'carried') return []
    return decision.contributions.map(contribution => ({
      targetLandscapeId: decision.targetLandscapeId,
      sourceLandscapeId: decision.sourceLandscapeId,
      sourceId: decision.sourceId,
      edition: decision.edition,
      sourceExtractionPath: decision.sourceExtractionPath,
      legacyGoalId: decision.sourceGoalId,
      rowSha256: decision.rowSha256,
      reviewId: decision.reviewId,
      reviewPath: decision.reviewPath,
      canonicalGoalId: contribution.canonicalGoalId,
      matchType: contribution.matchType,
      kind: contribution.kind,
      performance: contribution.performance,
      scopeIds: contribution.scopeIds,
    }))
  })
  positiveEdges.sort((left, right) =>
    compareText(left.targetLandscapeId, right.targetLandscapeId)
    || compareText(left.sourceId, right.sourceId)
    || compareText(left.edition, right.edition)
    || compareText(left.legacyGoalId, right.legacyGoalId)
    || compareText(left.canonicalGoalId, right.canonicalGoalId))

  return { version: 1 as const, legacyMappings: legacyReviews, positiveEdges }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readObject(bytes: Buffer, path: string): Record<string, unknown> {
  const value: unknown = JSON.parse(bytes.toString('utf8'))
  if (!isObject(value)) throw new Error(`Expected a JSON object: ${path}`)
  return value
}

function readReference(value: unknown): FileReference {
  if (!isObject(value) || Object.keys(value).length !== 2 || typeof value.path !== 'string'
    || typeof value.sha256 !== 'string' || !/^[a-f0-9]{64}$/u.test(value.sha256)) {
    throw new Error('Each source-mapping manifest input needs a repository-relative path and a SHA-256')
  }
  return { path: value.path, sha256: value.sha256 }
}

function readExplicitSelection(path: string, readEvidence: SourceMappingInputs['readEvidence']) {
  const manifest = readObject(readEvidence(path), path)
  if (manifest.version !== 1 || Object.keys(manifest).length !== 3
    || !Array.isArray(manifest.editions) || !Array.isArray(manifest.reviews)) {
    throw new Error('Expected a version 1 source-mapping manifest with editions and reviews arrays')
  }
  const seen = new Set([path])
  const readBoundFile = (value: unknown) => {
    const reference = readReference(value)
    if (seen.has(reference.path)) throw new Error(`Repeated source-mapping manifest input: ${reference.path}`)
    seen.add(reference.path)
    const bytes = readEvidence(reference.path)
    if (digest(bytes) !== reference.sha256) throw new Error(`Source-mapping input hash mismatch: ${reference.path}`)
    return { ...reference, document: readObject(bytes, reference.path) }
  }
  // The shared loader validates the edition's shape and binding before selecting any row.
  const editions = manifest.editions.map(value => readBoundFile(value).document as SourceMappingInputs['editions'][number])
  return { editions, reviews: manifest.reviews.map(readBoundFile) }
}

export function exportRepositorySourceMappingEdges(repositoryRoot = repository, manifestPath?: string) {
  const readEvidence = readRepositoryEvidence(repositoryRoot)
  const selection = manifestPath === undefined ? { editions: [], reviews: [] } : readExplicitSelection(manifestPath, readEvidence)
  const result = loadSourceMappingReviews({
    legacyReviews: readCurrentLegacySourceMappings(repositoryRoot, selection.reviews),
    ...selection,
    readEvidence,
  })
  return exportSourceMappingEdges(result)
}

function main(args: string[]) {
  if (args.length !== 0 && !(args.length === 2 && args[0] === '--v2-input')) {
    throw new Error('Usage: tsx app/scripts/exportSourceMappingEdges.ts [--v2-input selection.json]')
  }
  process.stdout.write(`${JSON.stringify(exportRepositorySourceMappingEdges(repository, args[1]))}\n`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2))
}
