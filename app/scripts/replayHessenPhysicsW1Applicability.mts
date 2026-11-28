// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { loadHessenPhysicsW1Bindings, replayHessenPhysicsW1Input, w1ViewEvidenceSha256 } from './lib/hessenPhysicsW1ViewEvidence.ts'

const root = process.cwd()
const sealedVerifier = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/routes/applicability/verify-final.kb5-kg4-arrow.mts'
const bindings = loadHessenPhysicsW1Bindings(root)
const legacyInputs = new Map([...bindings.otherInputs.keys()].map(path => [
  path, replayHessenPhysicsW1Input(root, path, readFileSync(resolve(root, path)), bindings),
]))

const replay = mkdtempSync(join(tmpdir(), 'skillpilot-hessen-w1-replay-'))
try {
  // Restore only the inputs named by the original 115/117 W1 bindings. The
  // compressed reverse diff operates on private copies of V1 inputs.
  const receiptBytes = readFileSync(resolve(root, 'curricula/DE/Gymnasium/quality/learning-units/math-planar-vector-ladder-20261128-v1/round-0336/main-242/sealed-replay-inputs.actual.json'))
  assert.equal(w1ViewEvidenceSha256(receiptBytes), 'bbf1dcca7559417d0fcf7828c472d90e066589a985e4bef3c6d5807ea10a6bf7')
  const receipt = JSON.parse(receiptBytes.toString('utf8')) as {
    patch: { path: string; sha256: string }
    inputs: { path: string; currentSha256: string; sealedSha256: string }[]
    vectorMappingsAddedAfterSeal: { path: string; sha256: string }[]
  }
  const sources = join(replay, 'input-reconstruction')
  for (const input of receipt.inputs) {
    const current = readFileSync(resolve(root, input.path))
    assert.equal(w1ViewEvidenceSha256(current), input.currentSha256, input.path)
    const copy = resolve(sources, input.path)
    mkdirSync(dirname(copy), { recursive: true })
    writeFileSync(copy, current)
  }
  const patch = readFileSync(resolve(root, receipt.patch.path))
  assert.equal(w1ViewEvidenceSha256(patch), receipt.patch.sha256)
  execFileSync('git', ['apply', '--no-index', '--whitespace=nowarn', '-'], { cwd: sources, input: gunzipSync(patch) })
  for (const input of receipt.inputs) {
    const sealed = readFileSync(resolve(sources, input.path))
    assert.equal(w1ViewEvidenceSha256(sealed), input.sealedSha256, input.path)
    legacyInputs.set(input.path, sealed)
  }
  const mappingsAfterSeal = new Set(receipt.vectorMappingsAddedAfterSeal.map(input => {
    assert.equal(w1ViewEvidenceSha256(readFileSync(resolve(root, input.path))), input.sha256, input.path)
    return input.path
  }))
  // Applicability discovers mappings by walking real curriculum directories.
  // Mirror their directory entries while linking unchanged file contents.
  // Review evidence is read through named paths and linked as a whole.
  const overlay = (directory: string) => {
    for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
      const filename = entry.name
      const path = directory ? `${directory}/${filename}` : filename
      if (mappingsAfterSeal.has(path)) continue
      const destination = resolve(replay, path)
      const bytes = legacyInputs.get(path)
      const discoverableCurriculumDirectory = (path === 'curricula/DE' || directory.startsWith('curricula/DE'))
        && entry.isDirectory() && !path.split('/').includes('quality')
      if (bytes) {
        writeFileSync(destination, bytes)
      } else if (discoverableCurriculumDirectory || [...legacyInputs.keys()].some(input => input.startsWith(`${path}/`))) {
        mkdirSync(destination)
        overlay(path)
      } else {
        symlinkSync(resolve(root, path), destination)
      }
    }
  }
  overlay('')
  const output = execFileSync(process.execPath, [
    '--preserve-symlinks', '--preserve-symlinks-main',
    '--import', resolve(root, 'app/node_modules/tsx/dist/loader.mjs'),
    resolve(replay, sealedVerifier), '--mode=verify',
  ], { cwd: replay, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  process.stdout.write(output)
} finally {
  rmSync(replay, { recursive: true, force: true })
}
