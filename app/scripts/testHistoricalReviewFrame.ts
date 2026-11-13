// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { fingerprintPrerequisiteReductionDocument as digest, loadVerifiedPrerequisiteReductionContext, PREREQUISITE_REDUCTION_CONTRACT, reviewBindingGoal, verifiedPrerequisiteReductionSummary } from './prerequisiteReductionProof'
const scratch = resolve(import.meta.dirname, '../../tmp'); mkdirSync(scratch, { recursive: true })
const atom = (id: string, requires: string[] = []) => ({ id, type: 'atomic', contains: [], requires })
async function fixture(work: (f: {
  directory: string; current: ReturnType<typeof atom>[]; other: ReturnType<typeof atom>[]
  options: { repositoryRoot: string; catalogPath: string; registryPath: string; historicalFramePath: string }
  write: (name: string, value: unknown) => void; frame: Record<string, unknown>
}) => Promise<void>) {
  const directory = mkdtempSync(resolve(scratch, 'historical-review-frame-'))
  try {
    mkdirSync(resolve(directory, 'canonical'))
    const write = (name: string, value: unknown) => writeFileSync(resolve(directory, name), JSON.stringify(value))
    const before = { landscapeId: 'L', goals: [atom('q', ['p', 'r']), atom('p', ['r']), atom('r')] }
    const certified = structuredClone(before); certified.goals[0].requires = ['p']
    const originalOther = { landscapeId: 'U', goals: [atom('u', ['v']), atom('v')] }
    const other = structuredClone(originalOther); other.goals[0].requires = []
    write('canonical/L.json', certified); write('canonical/U.json', other)
    const registry = { schemaVersion: 1, proofContract: PREREQUISITE_REDUCTION_CONTRACT, auditScope: 'origin-source-landscape-closure',
      catalogSources: [{ path: 'canonical/L.json', landscapeId: 'L', baselineDocumentDigest: digest(before), currentDocumentDigest: digest(certified) }, { path: 'canonical/U.json', landscapeId: 'U', baselineDocumentDigest: digest(originalOther), currentDocumentDigest: digest(originalOther) }],
      originalRequires: [{ source: 'L:q', requires: before.goals[0].requires }], removals: [{ source: 'L:q', prerequisite: 'L:r', witness: ['L:q', 'L:p', 'L:r'] }] }
    write('proof.json', registry)
    const frame = { schemaVersion: 1, contract: 'dependency-bounded-historical-review-frame-v1', registryPath: 'proof.json', registryRawDigest: `sha256:${createHash('sha256').update(readFileSync(resolve(directory, 'proof.json'))).digest('hex')}`, documents: [{ path: 'canonical/U.json', landscapeId: 'U', originalRequires: [{ goalId: 'u', requires: ['v'] }] }] }
    write('frame.json', frame)
    await work({ directory, current: certified.goals, other: other.goals, write, frame,
      options: { repositoryRoot: directory, catalogPath: 'canonical', registryPath: 'proof.json', historicalFramePath: 'frame.json' } })
  } finally { rmSync(directory, { recursive: true, force: true }) }
}
test('verified old full frame grants historical values only to unchanged dependency-closed subjects', async () => fixture(async f => {
  const context = await loadVerifiedPrerequisiteReductionContext(f.options)
  assert(context)
  const summary = verifiedPrerequisiteReductionSummary(context)!
  assert.equal(summary.mode, 'dependency-bounded-certified-baseline-comparison')
  assert.deepEqual(summary.dependencyBinding?.eligibleLandscapeIds, ['L'])
  assert.deepEqual(reviewBindingGoal(context, 'L:q', f.current[0]).requires, ['p', 'r'])
  assert.equal(reviewBindingGoal(context, 'U:u', f.other[0]), f.other[0])
  assert.throws(() => reviewBindingGoal(context, 'L:q', { ...f.current[0], title: 'changed after verification' }), /current goal differs/)
  assert.throws(() => reviewBindingGoal({} as NonNullable<typeof context>, 'L:q', f.current[0]), /forged/)
}))
for (const kind of ['proof binding', 'reconstruction', 'eligible source']) test(`scoped reuse rejects changed ${kind}`, async () => fixture(async f => {
  if (kind === 'proof binding') { f.frame.registryRawDigest = 'sha256:' + '0'.repeat(64); f.write('frame.json', f.frame) }
  if (kind === 'reconstruction') { const altered = structuredClone(f.frame); altered.documents = [{ path: 'canonical/U.json', landscapeId: 'U', originalRequires: [{ goalId: 'u', requires: [] }] }]; f.write('frame.json', altered) }
  if (kind === 'eligible source') f.write('canonical/L.json', { landscapeId: 'L', goals: [{ ...f.current[0], title: 'unverified new content' }, ...f.current.slice(1)] })
  await assert.rejects(loadVerifiedPrerequisiteReductionContext(f.options))
}))
