// SPDX-License-Identifier: Apache-2.0
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { loadHessenPhysicsW1Bindings, replayHessenPhysicsW1Input } from './lib/hessenPhysicsW1ViewEvidence.ts'

const root = process.cwd()
const sealedVerifier = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/routes/applicability/verify-final.kb5-kg4-arrow.mts'
const bindings = loadHessenPhysicsW1Bindings(root)
const legacyInputs = new Map([...bindings.otherInputs.keys()].map(path => [
  path, replayHessenPhysicsW1Input(root, path, readFileSync(resolve(root, path)), bindings),
]))

const replay = mkdtempSync(join(tmpdir(), 'skillpilot-hessen-w1-replay-'))
try {
  // Applicability discovers mappings by walking real curriculum directories.
  // Mirror their directory entries while linking unchanged file contents.
  // Review evidence is read through named paths and linked as a whole.
  const overlay = (directory: string) => {
    for (const entry of readdirSync(resolve(root, directory), { withFileTypes: true })) {
      const filename = entry.name
      const path = directory ? `${directory}/${filename}` : filename
      const destination = resolve(replay, path)
      const bytes = legacyInputs.get(path)
      const discoverableCurriculumDirectory = (path === 'curricula/DE' || directory.startsWith('curricula/DE'))
        && entry.isDirectory() && filename !== 'quality'
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
