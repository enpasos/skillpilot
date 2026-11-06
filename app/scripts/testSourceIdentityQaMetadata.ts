// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertCompositionKindCoverage, loadCompositionSemanticKinds } from './lib/compositionSemanticKinds'
import { compositionKindsFromSourceIdentityView, createSourceIdentityQaMetadataView,
  type SourceIdentityQaMetadataView } from './lib/sourceIdentityQaMetadata'
import { parseSemanticKindLedger } from './goalBookModel'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const temporary = mkdtempSync(resolve(tmpdir(), 'source-identity-qa-tests-'))
let checked = 0
try {
  const ledgerPath = resolve(temporary, 'ledger.json')
  const ledger = { sourceLandscapeId: 'owner', decisions: [
    { goalId: 'one', semanticKind: 'curricularAtomic', decisionStatus: 'authoritative' },
    { goalId: 'two', semanticKind: 'curricularArea', decisionStatus: 'authoritative' },
  ] }
  writeFileSync(ledgerPath, JSON.stringify(ledger))
  const loaded = loadCompositionSemanticKinds([ledgerPath]).get('owner')!
  assertCompositionKindCoverage(loaded, ['one', 'two']); checked++
  assert.throws(() => assertCompositionKindCoverage(loaded, ['one']), /nicht deckungsgleich/u); checked++
  assert.throws(() => assertCompositionKindCoverage(loaded, ['one', 'two', 'missing']), /missing/u); checked++
  assert.throws(() => loadCompositionSemanticKinds([ledgerPath, ledgerPath]), /Mehr als ein/u); checked++
  writeFileSync(ledgerPath, JSON.stringify({ ...ledger, decisions: [...ledger.decisions, ledger.decisions[0]] }))
  assert.throws(() => loadCompositionSemanticKinds([ledgerPath]), /Doppelte/u); checked++
  writeFileSync(ledgerPath, JSON.stringify({ ...ledger, decisions: [{ ...ledger.decisions[0], decisionStatus: 'draft' }] }))
  assert.throws(() => loadCompositionSemanticKinds([ledgerPath]), /authoritative/u); checked++

  const base = '80d70f08e0ce31cbdc214e62b5d3e0e80cd850db'
  const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
  const raw = JSON.parse(execFileSync('git', ['show', `${base}:${canonicalPath}`], { cwd: root, maxBuffer: 16 * 1024 * 1024 }).toString())
  const kindLedger = JSON.parse(execFileSync('git', ['show', `${base}:curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json`], { cwd: root, maxBuffer: 16 * 1024 * 1024 }).toString())
  parseSemanticKindLedger(kindLedger, raw, raw.landscapeId, canonicalPath); checked++
  const changedKind = structuredClone(kindLedger); changedKind.decisions[0].semanticKind = 'unknown-kind'
  assert.throws(() => parseSemanticKindLedger(changedKind, raw, raw.landscapeId, canonicalPath)); checked++
  const missingKind = structuredClone(kindLedger); missingKind.decisions.pop()
  assert.throws(() => parseSemanticKindLedger(missingKind, raw, raw.landscapeId, canonicalPath)); checked++
  const changedText = structuredClone(raw); changedText.goals[0].description += ' altered'
  assert.throws(() => parseSemanticKindLedger(kindLedger, changedText, raw.landscapeId, canonicalPath), /stale/u); checked++

  const fake = Object.freeze({ candidateRoot: temporary, sourceBase: base, manifestRawSha256: '0'.repeat(64),
    evidenceDirectory: temporary, verified: true }) as SourceIdentityQaMetadataView
  assert.throws(() => compositionKindsFromSourceIdentityView(fake, 'owner', canonicalPath, Buffer.from('{}')), /factory-minted/u); checked++
  const original = resolve(temporary, 'original'), candidate = resolve(temporary, 'candidate')
  mkdirSync(original); mkdirSync(candidate)
  const manifest = resolve(temporary, 'untrusted.json'); writeFileSync(manifest, '{}')
  await assert.rejects(createSourceIdentityQaMetadataView({ sourceManifestPath: manifest,
    acceptedManifestSha256: '0'.repeat(64), expectedBaseCommit: base, originalRoot: original, candidateRoot: candidate }), /raw pin differs/u); checked++
  console.log(`Source-A metadata boundary: ${checked} controls/counterexamples passed; no fixture mints a production capability.`)
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
