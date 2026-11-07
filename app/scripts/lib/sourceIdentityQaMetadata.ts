// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, realpathSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { parseSemanticKindLedger } from '../goalBookModel'
import { hasStrictDeepUnderstandingCompletion, type DeepUnderstandingRolloutReport } from '../reportDeepUnderstandingRollout'
import { assertCompositionKindCoverage } from './compositionSemanticKinds'

const execute = promisify(execFile)
const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const digest = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex')
const requireValue: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(message)
}

export interface SourceIdentityQaMetadataOptions {
  sourceManifestPath: string
  acceptedManifestSha256: string
  expectedBaseCommit: string
  originalRoot: string
  candidateRoot: string
}
export interface SourceIdentityQaMetadataView {
  readonly candidateRoot: string
  readonly sourceBase: string
  readonly manifestRawSha256: string
  readonly evidenceDirectory: string
}
type Internal = {
  kinds: Map<string, Map<string, string>>
  canonicalRawDigests: Map<string, string>
  canonicalOwners: Map<string, string>
}
const capabilities = new WeakMap<object, Internal>()

function immutableKinds(source: ReadonlyMap<string, string>): ReadonlyMap<string, string> {
  const snapshot = new Map(source)
  const result: ReadonlyMap<string, string> = Object.freeze({
    size: snapshot.size,
    get: (key: string) => snapshot.get(key), has: (key: string) => snapshot.has(key),
    keys: () => snapshot.keys(), values: () => snapshot.values(), entries: () => snapshot.entries(),
    [Symbol.iterator]: () => snapshot[Symbol.iterator](),
    forEach: (callback: (value: string, key: string, map: ReadonlyMap<string, string>) => void, thisArg?: unknown) => {
      snapshot.forEach((value, key) => callback.call(thisArg, value, key, result))
    },
  })
  return result
}

function ledgerFiles(root: string): string[] {
  const directory = resolve(root, 'curricula/DE/Gymnasium/quality/release-model')
  const walk = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory() ? walk(resolve(path, entry.name))
      : entry.isFile() && entry.name.endsWith('.semantic-kinds.json') ? [resolve(path, entry.name)] : []
  ))
  return walk(directory).sort()
}

function checkedOptions(input: SourceIdentityQaMetadataOptions): SourceIdentityQaMetadataOptions {
  const fields = ['sourceManifestPath', 'acceptedManifestSha256', 'expectedBaseCommit', 'originalRoot', 'candidateRoot']
  requireValue(input && typeof input === 'object' && Object.keys(input).length === fields.length
    && fields.every((key) => typeof input[key as keyof typeof input] === 'string'), 'Invalid isolated Source-A request fields')
  requireValue(/^[0-9a-f]{64}$/u.test(input.acceptedManifestSha256), 'Invalid external Source-A raw pin')
  requireValue(/^[0-9a-f]{40}$/u.test(input.expectedBaseCommit), 'Invalid external Source-A base')
  const result = { ...input, sourceManifestPath: realpathSync(input.sourceManifestPath),
    originalRoot: realpathSync(input.originalRoot), candidateRoot: realpathSync(input.candidateRoot) }
  requireValue(result.originalRoot !== result.candidateRoot, 'Original and candidate roots must be distinct')
  return result
}

/** Executes the real kernel and original QA producer; no report-import/mint API. */
export async function createSourceIdentityQaMetadataView(input: SourceIdentityQaMetadataOptions): Promise<SourceIdentityQaMetadataView> {
  const options = checkedOptions(input)
  const manifestRaw = readFileSync(options.sourceManifestPath)
  requireValue(digest(manifestRaw) === options.acceptedManifestSha256, 'External Source-A raw pin differs')
  const manifest = JSON.parse(manifestRaw.toString('utf8')) as {
    baseCommit: string
    catalog: { sourceFiles: Array<{ path: string; landscapeId: string }> }
    rules: Array<{ landscapeId: string; sourceGoalId: string; targetGoalId: string }>
  }
  requireValue(manifest.baseCommit === options.expectedBaseCommit, 'External Source-A base differs')
  const evidence = mkdtempSync(resolve(tmpdir(), 'source-identity-qa-'))
  const contextCode = ['app/scripts/validateCompositionViews.ts', 'app/scripts/goalBookModel.ts',
    'app/scripts/lib/compositionSemanticKinds.ts', 'app/scripts/lib/sourceIdentityQaMetadata.ts',
    'scripts/verify_identity_qa_source_context.py', 'scripts/verify_identity_qa_producer_reads.py',
    'scripts/prepare_identity_qa_candidate.py'].map((path) => ({ path, sha256: digest(readFileSync(resolve(toolRoot, path))) }))
  writeFileSync(resolve(evidence, 'readonly-context-code.json'), JSON.stringify(contextCode, null, 2))
  const sourceArgs = ['--manifest', options.sourceManifestPath, '--accepted-manifest-sha256', options.acceptedManifestSha256,
    '--expected-base-commit', options.expectedBaseCommit, '--original-root', options.originalRoot, '--candidate-root', options.candidateRoot]
  const source = await execute('python3', ['-B', resolve(toolRoot, 'scripts/verify_identity_qa_source_context.py'), ...sourceArgs],
    { maxBuffer: 4 * 1024 * 1024, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } })
  const context = JSON.parse(source.stdout) as { manifestRawSha256: string; baseCommit: string; originalRoot: string; candidateRoot: string; ruleCount: number }
  requireValue(context.manifestRawSha256 === options.acceptedManifestSha256 && context.baseCommit === options.expectedBaseCommit
    && context.originalRoot === options.originalRoot && context.candidateRoot === options.candidateRoot && context.ruleCount === 164,
  'Actual Source-A producer returned a foreign/incomplete context')
  writeFileSync(resolve(evidence, 'source-context.json'), source.stdout)

  // Reuse the existing strict original-ledger validator and its pinned profile.
  for (const path of ['contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json',
    'contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json']) {
    requireValue(readFileSync(resolve(toolRoot, path)).equals(readFileSync(resolve(options.originalRoot, path))),
      `Semantic-kind validator profile/schema differs from the original snapshot: ${path}`)
  }
  const rename = new Map<string, Map<string, string>>()
  for (const rule of manifest.rules) {
    const owned = rename.get(rule.landscapeId) ?? new Map<string, string>()
    requireValue(!owned.has(rule.sourceGoalId), 'Duplicate declared source identity')
    owned.set(rule.sourceGoalId, rule.targetGoalId); rename.set(rule.landscapeId, owned)
  }
  const kinds = new Map<string, Map<string, string>>()
  const canonicalRawDigests = new Map<string, string>()
  const canonicalOwners = new Map<string, string>()
  for (const file of manifest.catalog.sourceFiles.filter((entry) => entry.path.startsWith('curricula/DE/Gymnasium/canonical/'))) {
    const path = resolve(options.candidateRoot, file.path)
    requireValue(!canonicalOwners.has(path), 'Duplicate canonical catalog path')
    canonicalOwners.set(path, file.landscapeId)
    canonicalRawDigests.set(path, digest(readFileSync(path)))
  }
  const originalLedgerRawDigests = new Map<string, string>()
  for (const path of ledgerFiles(options.originalRoot)) {
    const bytes = readFileSync(path)
    originalLedgerRawDigests.set(path, digest(bytes))
    const ledger = JSON.parse(bytes.toString('utf8')) as { sourceLandscapeId: string; sourceLandscapePath: string }
    const catalog = manifest.catalog.sourceFiles.find((file) => file.path === ledger.sourceLandscapePath
      && file.landscapeId === ledger.sourceLandscapeId && file.path.startsWith('curricula/DE/Gymnasium/canonical/'))
    requireValue(catalog, 'Composer ledger owner/source is not an exact canonical catalog entry')
    const rawOriginal = JSON.parse(readFileSync(resolve(options.originalRoot, catalog.path), 'utf8')) as unknown
    const parsed = parseSemanticKindLedger(ledger, rawOriginal, catalog.landscapeId, catalog.path)
    requireValue(!kinds.has(catalog.landscapeId), 'Duplicate Composer ledger owner')
    const projected = new Map<string, string>()
    for (const [sourceId, kind] of parsed.semanticKindByGoalId) {
      const currentId = rename.get(catalog.landscapeId)?.get(sourceId) ?? sourceId
      requireValue(!projected.has(currentId), 'Projected semantic-kind identity collision')
      projected.set(currentId, kind)
    }
    const currentPath = resolve(options.candidateRoot, catalog.path)
    const currentBytes = readFileSync(currentPath)
    const current = JSON.parse(currentBytes.toString('utf8')) as { goals: Array<{ id: string }> }
    assertCompositionKindCoverage(projected, current.goals.map(({ id }) => id))
    canonicalRawDigests.set(currentPath, digest(currentBytes))
    kinds.set(catalog.landscapeId, projected)
  }
  requireValue(kinds.size > 0, 'Composer semantic-kind scope is empty')

  const tracePath = resolve(evidence, 'original-producer.reads.strace')
  const qaScript = resolve(options.originalRoot, 'app/scripts/reportDeepUnderstandingRollout.ts')
  const qa = await execute('strace', ['-f', '-qq', '-e', 'trace=openat', '-o', tracePath,
    process.execPath, '--import', 'tsx', qaScript, '--mode=check', '--format=json'],
  { cwd: resolve(options.originalRoot, 'app'), maxBuffer: 64 * 1024 * 1024 })
  writeFileSync(resolve(evidence, 'original-deep-qa.json'), qa.stdout)
  const report = JSON.parse(qa.stdout) as DeepUnderstandingRolloutReport
  requireValue(report.blockingIssueCount === 0 && Array.isArray(report.subjects) && report.subjects.length > 0
    && report.subjects.every(hasStrictDeepUnderstandingCompletion), 'Actual original deep QA is incomplete')
  const reads = await execute('python3', ['-B', resolve(toolRoot, 'scripts/verify_identity_qa_producer_reads.py'),
    '--original-root', options.originalRoot, '--expected-base-commit', options.expectedBaseCommit, '--read-trace', tracePath],
  { maxBuffer: 4 * 1024 * 1024, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } })
  const authenticated = JSON.parse(reads.stdout) as { authenticatedReadPaths: number }
  requireValue(authenticated.authenticatedReadPaths > 0, 'Original QA producer read scope is empty')
  writeFileSync(resolve(evidence, 'original-producer-read-authentication.json'), reads.stdout)

  for (const [path, expected] of originalLedgerRawDigests) requireValue(digest(readFileSync(path)) === expected, 'Original ledger changed during QA')
  for (const [path, expected] of canonicalRawDigests) requireValue(digest(readFileSync(path)) === expected, 'Current candidate changed during original QA')
  for (const { path, sha256 } of contextCode) requireValue(digest(readFileSync(resolve(toolRoot, path))) === sha256,
    `Readonly metadata context code changed during verification: ${path}`)
  const qaOwners = new Set<string>()
  for (const subject of report.subjects) {
    requireValue(!qaOwners.has(subject.landscapeId), 'Duplicate actual QA result owner')
    qaOwners.add(subject.landscapeId)
  }
  const view = Object.freeze({ candidateRoot: options.candidateRoot, sourceBase: options.expectedBaseCommit,
    manifestRawSha256: options.acceptedManifestSha256, evidenceDirectory: evidence })
  capabilities.set(view, { kinds, canonicalRawDigests, canonicalOwners })
  writeFileSync(resolve(evidence, 'metadata-view.json'), JSON.stringify({ purpose: 'isolated-composition-kind-view',
    sourceBase: view.sourceBase, manifestRawSha256: view.manifestRawSha256, owners: [...kinds.keys()],
    kindRows: [...kinds.values()].reduce((sum, map) => sum + map.size, 0),
    originalQaSubjects: report.subjects.map((subject) => ({ owner: subject.landscapeId, complete: subject.strictComplete })),
    runtimeActivationAllowed: false, candidateQaApproval: false }, null, 2))
  return view
}

export function compositionKindsFromSourceIdentityView(
  view: SourceIdentityQaMetadataView,
  owner: string,
  currentCanonicalPath: string,
  actualCurrentBytes: Buffer,
): ReadonlyMap<string, string> | undefined {
  const internal = capabilities.get(view)
  requireValue(internal, 'A factory-minted Source-A metadata capability is required')
  const path = resolve(currentCanonicalPath)
  requireValue(internal.canonicalOwners.get(path) === owner, 'Current canonical owner/path is outside the verified catalog')
  requireValue(internal.canonicalRawDigests.get(path) === digest(actualCurrentBytes), 'Current canonical bytes differ from the verified metadata context')
  const kinds = internal.kinds.get(owner)
  if (!kinds) return undefined // Exactly the existing Composer owners; no new role inference.
  return immutableKinds(kinds)
}

