// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'

interface ViewBinding {
  path: string
  previousSha256: string
  currentSha256: string
}

interface RetainedInputBinding extends ViewBinding {
  retainedPredecessor: { path: string; sha256: string }
}

const evidenceDirectory = 'curricula/DE/Gymnasium/quality/learning-units/extension-contract-w1-replay-20261127-v1'
const bindingPath = `${evidenceDirectory}/input-bindings.actual.json`
export const w1ViewEvidenceSha256 = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')

export function loadHessenPhysicsW1Bindings(repoRoot: string) {
  const receipt = JSON.parse(readFileSync(resolve(repoRoot, bindingPath), 'utf8')) as {
    schemaVersion: number; otherInputs: RetainedInputBinding[]
  }
  assert.equal(receipt.schemaVersion, 1)
  assert.deepEqual(receipt.otherInputs.map(({ path }) => path), [
    'app/src/utils/authoring/compositionViewAuthoring.ts',
    'app/src/utils/compositionViewRuntime.ts',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json',
  ])
  for (const binding of receipt.otherInputs) {
    assert.equal(binding.retainedPredecessor.path,
      `${evidenceDirectory}/${basename(binding.path)}.before-w1-replay.gz`)
  }
  return {
    otherInputs: new Map(receipt.otherInputs.map(binding => [binding.path, binding])),
  }
}

/** A materializer source and the overview configuration are separately bound.
 * Their retained bytes are used only for replay; current behavior is tested
 * with the current TypeScript and view documents. */
export function replayHessenPhysicsW1Input(
  repoRoot: string, path: string, current: Buffer, bindings: ReturnType<typeof loadHessenPhysicsW1Bindings>,
): Buffer {
  const source = bindings.otherInputs.get(path)
  if (!source) return current
  assert.equal(w1ViewEvidenceSha256(current), source.currentSha256, `${path}: changed successor input`)
  const retained = readFileSync(resolve(repoRoot, source.retainedPredecessor.path))
  assert.equal(w1ViewEvidenceSha256(retained), source.retainedPredecessor.sha256, `${path}: changed retained input`)
  const previous = gunzipSync(retained)
  assert.equal(w1ViewEvidenceSha256(previous), source.previousSha256, `${path}: retained input differs from sealed W1 bytes`)
  return previous
}
