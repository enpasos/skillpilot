// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { createVisualizationContextVerifier, parseVisualizationReviewJson,
  type VisualizationContextReceiptReference, type VisualizationCurrentContext } from '../goalVisualizationReviewedContext'

// These are external acceptance pins for this finite historical input set.
// Neither a receipt nor a caller can nominate its own acceptance authority.
export const qualifiedVisualizationAuthority = Object.freeze({
  indexPath: 'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json',
  indexSha256: '46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0',
  capsulePath: 'qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07/capsule',
  capsuleSha256: '4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852',
  acceptedRepositoryCommit: '25a6f2164a81a7e6ae50db3557d20521fecf5124',
})
interface Index { rows: Array<{ landscapeId: string; goalId: string; receipt: VisualizationContextReceiptReference }> }
const sha = (raw: Buffer) => createHash('sha256').update(raw).digest('hex')
const factories = new Map<string, ReturnType<typeof initialize>>()
function initialize(root: string) {
  const pins = qualifiedVisualizationAuthority
  const raw = readFileSync(resolve(root, pins.indexPath))
  if (sha(raw) !== pins.indexSha256) throw new Error('External visualization context index differs')
  const index = parseVisualizationReviewJson(raw) as Index
  const rows = new Map(index.rows.map(row => [row.landscapeId + ':' + row.goalId, Object.freeze({ ...row.receipt })]))
  if (index.rows.length !== 57 || rows.size !== 57) throw new Error('External visualization index is incomplete or ambiguous')
  // A small separate original-evidence repository works in an actual shallow
  // checkout. The same raw OID/parent/path verifier runs before any V decision.
  const temporary = mkdtempSync(resolve(tmpdir(), 'skillpilot-qualified-v-'))
  const originalsRoot = resolve(temporary, 'originals')
  const run = spawnSync('python3', ['-B', resolve(root, 'scripts/visualization_qualified_context_capsule.py'), 'materialize',
    '--repository-root', root, '--accepted-commit', pins.acceptedRepositoryCommit,
    '--accepted-census-sha256', pins.indexSha256, '--census-path', pins.indexPath,
    '--capsule', resolve(root, pins.capsulePath), '--accepted-capsule-sha256', pins.capsuleSha256,
    '--output', originalsRoot, '--maximum-working-bytes', '134217728', '--maximum-object-bytes', '268435456'],
  { encoding: 'utf8', maxBuffer: 2 * 1024 * 1024 })
  if (run.status !== 0) {
    rmSync(temporary, { recursive: true, force: true })
    throw new Error('Authenticated original-context capsule failed: ' + (run.stderr || run.error?.message || run.stdout))
  }
  process.once('exit', () => rmSync(temporary, { recursive: true, force: true }))
  const verify = createVisualizationContextVerifier({ repositoryRoot: root, originalEvidenceRepositoryRoot: originalsRoot,
    acceptedRepositoryCommit: pins.acceptedRepositoryCommit })
  return (current: VisualizationCurrentContext) => {
    // Do not let the private history cache hide changed acceptance-index bytes.
    if (sha(readFileSync(resolve(root, pins.indexPath))) !== pins.indexSha256) {
      throw new Error('External visualization context index changed')
    }
    return verify(rows.get(current.landscapeId + ':' + current.goalId), current)
  }
}

/** Real original-byte authentication, never an imported set of ready goals. */
export function createQualifiedVisualizationContextAuthority(repositoryRoot: string) {
  const root = realpathSync(repositoryRoot)
  return (current: VisualizationCurrentContext) => {
    if (!factories.has(root)) factories.set(root, initialize(root))
    return factories.get(root)!(current)
  }
}
