// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDeepStrictEqual } from 'node:util'
import type { LearningGoal } from '../../src/landscapeTypes'

type EvidenceKind = 'atomicity' | 'memory-goal' | 'memory-card'
interface EvidenceInput { path: string; kind: EvidenceKind; bytes: Uint8Array }
interface ReviewRow { landscapeId: string; goalId?: string; memoryGoalIds?: string[]; originGoalIds?: string[]; [key: string]: unknown }
export interface SourceIdentityQaReviewSliceInput {
  manifestBytes: Uint8Array
  acceptedManifestSha256: string
  expectedBaseCommit: string
  owner: string
  sourcePath: string
  originalSourceBytes: Uint8Array
  candidateSourceBytes: Uint8Array
  evidence: readonly EvidenceInput[]
}
export interface SourceIdentityQaReviewContext {
  readonly kind: 'isolated-source-a-review-slice'
  readonly owner: string
  readonly sourceBase: string
  readonly manifestRawSha256: string
  readonly sourcePath: string
}
type Internal = {
  originalByCurrentId: Map<string, LearningGoal>
  candidateById: Map<string, LearningGoal>
  currentByOriginalId: Map<string, string>
  evidence: Map<string, { kind: EvidenceKind; rows: readonly ReviewRow[] }>
}
const internals = new WeakMap<SourceIdentityQaReviewContext, Internal>()
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const requireValue: (value: unknown, message: string) => asserts value = (value, message) => {
  if (!value) throw new Error(message)
}
const digest = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const freeze = <T>(value: T): T => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value) }
  return value
}

/** Bounded mechanics only: this cannot mint Composer, complete QA, or B capabilities. */
export function createSourceIdentityQaReviewSlice(input: SourceIdentityQaReviewSliceInput): SourceIdentityQaReviewContext {
  // Capture every caller buffer once. All parsing and projections use only these bytes.
  const owner = input.owner, sourcePath = input.sourcePath, expectedBaseCommit = input.expectedBaseCommit
  const acceptedManifestSha256 = input.acceptedManifestSha256
  const manifestRaw = Buffer.from(input.manifestBytes), originalRaw = Buffer.from(input.originalSourceBytes)
  const candidateRaw = Buffer.from(input.candidateSourceBytes)
  const evidence = input.evidence.map(entry => ({ path: entry.path, kind: entry.kind, bytes: Buffer.from(entry.bytes) }))
  requireValue(digest(manifestRaw) === acceptedManifestSha256, 'External Source-A manifest pin differs')
  requireValue(/^[0-9a-f]{64}$/u.test(acceptedManifestSha256) && /^[0-9a-f]{40}$/u.test(expectedBaseCommit),
    'Exact external Source-A pins are required')
  const temporary = mkdtempSync('/dev/shm/skillpilot-source-a-review-slice-')
  try {
    const manifestPath = resolve(temporary, 'manifest.json'), originalPath = resolve(temporary, 'original.json')
    const candidatePath = resolve(temporary, 'candidate.json'), requestPath = resolve(temporary, 'request.json')
    writeFileSync(manifestPath, manifestRaw); writeFileSync(originalPath, originalRaw); writeFileSync(candidatePath, candidateRaw)
    const inputs = evidence.map((entry, index) => {
      const localPath = resolve(temporary, `evidence-${index}.jsonl`); writeFileSync(localPath, entry.bytes)
      return { path: entry.path, kind: entry.kind, localPath }
    })
    writeFileSync(requestPath, JSON.stringify({ owner, sourcePath, originalPath, candidatePath, evidence: inputs }))
    const checked = spawnSync('python3', ['-B', resolve(root, 'scripts/verify_identity_qa_review_slice.py'), '--repo-root', root,
      '--manifest', manifestPath, '--request', requestPath, '--expected-base-commit', expectedBaseCommit,
      '--accepted-manifest-sha256', acceptedManifestSha256], { encoding: 'utf8', maxBuffer: 1024 * 1024 })
    requireValue(checked.status === 0, `Source-A review slice rejected: ${checked.stderr || checked.error?.message || checked.status}`)
    const result = JSON.parse(checked.stdout) as SourceIdentityQaReviewContext
    requireValue(result.kind === 'isolated-source-a-review-slice' && result.owner === owner
      && result.sourceBase === expectedBaseCommit && result.sourcePath === sourcePath
      && result.manifestRawSha256 === acceptedManifestSha256, 'Foreign review-slice verifier result')
    const original = JSON.parse(originalRaw.toString('utf8')) as { goals: LearningGoal[] }
    const candidate = JSON.parse(candidateRaw.toString('utf8')) as { goals: LearningGoal[] }
    const manifest = JSON.parse(manifestRaw.toString('utf8')) as { rules: Array<{ landscapeId: string; sourceGoalId: string; targetGoalId: string }> }
    const renamed = new Map(manifest.rules.filter(rule => rule.landscapeId === owner).map(rule => [rule.sourceGoalId, rule.targetGoalId]))
    const originalByCurrentId = new Map<string, LearningGoal>(), candidateById = new Map<string, LearningGoal>()
    const currentByOriginalId = new Map<string, string>()
    for (const goal of candidate.goals) {
      requireValue(!candidateById.has(goal.id), 'Duplicate candidate definition in selected source')
      candidateById.set(goal.id, freeze(goal))
    }
    for (const goal of original.goals) {
      const currentId = renamed.get(goal.id) ?? goal.id
      requireValue(!currentByOriginalId.has(goal.id) && !originalByCurrentId.has(currentId) && candidateById.has(currentId),
        'Non-bijective selected original/candidate definitions')
      currentByOriginalId.set(goal.id, currentId); originalByCurrentId.set(currentId, freeze(goal))
    }
    requireValue(originalByCurrentId.size === candidateById.size, 'Selected definition inventory differs')
    const rows = new Map<string, { kind: EvidenceKind; rows: readonly ReviewRow[] }>()
    for (const entry of evidence) rows.set(entry.path, { kind: entry.kind,
      rows: freeze(entry.bytes.toString('utf8').split(/\r?\n/u).filter(line => line.trim()).map(line => JSON.parse(line) as ReviewRow)) })
    const context = Object.freeze({ kind: result.kind, owner, sourceBase: expectedBaseCommit,
      sourcePath, manifestRawSha256: acceptedManifestSha256 })
    internals.set(context, { originalByCurrentId, candidateById, currentByOriginalId, evidence: rows })
    return context
  } finally { rmSync(temporary, { recursive: true, force: true }) }
}

function checked(context: SourceIdentityQaReviewContext, owner: string): Internal {
  const internal = internals.get(context)
  requireValue(internal && owner === context.owner, 'Exact owner and factory-minted Source-A review slice are required')
  return internal
}

/** Used only at the historical goal-fingerprint comparison, never for graph/scope checks. */
export function originalDefinitionForQaFingerprint(context: SourceIdentityQaReviewContext, owner: string, actualCandidate: LearningGoal): LearningGoal {
  const internal = checked(context, owner), candidate = internal.candidateById.get(actualCandidate.id)
  requireValue(candidate && isDeepStrictEqual(candidate, actualCandidate), 'Actual candidate definition differs from the verified slice')
  return internal.originalByCurrentId.get(actualCandidate.id)!
}

export function candidateIdForQaReference(context: SourceIdentityQaReviewContext, owner: string, originalId: string): string {
  const internal = checked(context, owner), parts = originalId.split(':')
  requireValue(parts.length === 1 || (parts.length === 2 && parts[0] === owner && parts[1]), 'Foreign or malformed owner-qualified QA reference')
  const id = parts.at(-1)!, current = internal.currentByOriginalId.get(id)
  requireValue(current, 'QA reference has no definition in the selected owner/source')
  return parts.length === 2 ? `${owner}:${current}` : current
}

/** Immutable read view of authenticated rows. Decisions, fingerprints, cards and timestamps are unchanged. */
export function candidateQaReviewRows(context: SourceIdentityQaReviewContext, owner: string, path: string, kind: EvidenceKind): readonly ReviewRow[] {
  const internal = checked(context, owner), evidence = internal.evidence.get(path)
  requireValue(evidence && evidence.kind === kind, 'Unbound original review path/kind')
  return freeze(evidence.rows.map(row => {
    const current = structuredClone(row)
    if (kind !== 'memory-card') current.goalId = candidateIdForQaReference(context, owner, row.goalId!)
    if (kind === 'memory-goal' && row.memoryGoalIds !== undefined) current.memoryGoalIds = row.memoryGoalIds.map(id => candidateIdForQaReference(context, owner, id))
    if (kind === 'memory-card' && row.originGoalIds !== undefined) current.originGoalIds = row.originGoalIds.map(id => candidateIdForQaReference(context, owner, id))
    return current
  }))
}
