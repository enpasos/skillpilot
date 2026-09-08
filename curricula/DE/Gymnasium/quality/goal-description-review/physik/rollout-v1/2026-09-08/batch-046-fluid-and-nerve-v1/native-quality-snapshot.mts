import fs from 'node:fs'
import { createHash } from 'node:crypto'
import { syncBuiltinESMExports } from 'node:module'
import { resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'

// Run the unmodified native status generator and floor checker against a fresh
// in-memory result. Shared reports are never written by this audit harness.
const root = process.cwd()
assert(fs.existsSync(resolve(root, 'AGENTS.md')), 'Run from the repository root')
const jsonPath = resolve(root, 'docs/qa-ci/status/curriculum-quality-status.json')
const mdPath = resolve(root, 'docs/qa-ci/status/curriculum-quality-status.md')
const statusDir = resolve(root, 'docs/qa-ci/status')
const originalRead = fs.readFileSync
const originalWrite = fs.writeFileSync
const originalMkdir = fs.mkdirSync
const originalLog = console.log
const toPath = (value: unknown): string =>
  resolve(value instanceof URL ? fileURLToPath(value) : String(value))
const captured = new Map<string, string>()
const nativeLogs: string[] = []
let floorFailure: string | null = null
let summary: unknown
try {
  fs.writeFileSync = ((file: unknown, data: unknown) => {
    const target = toPath(file)
    assert(target === jsonPath || target === mdPath, 'Unexpected native write: ' + target)
    assert(!captured.has(target), 'Unexpected duplicate native write')
    captured.set(target, String(data))
  }) as typeof fs.writeFileSync
  fs.mkdirSync = ((file: unknown) => {
    assert.equal(toPath(file), statusDir, 'Unexpected native mkdir')
    assert(fs.existsSync(statusDir), 'Shared status directory must already exist')
    return undefined
  }) as typeof fs.mkdirSync
  console.log = (...args: unknown[]) => { nativeLogs.push(args.map(String).join(' ')) }
  syncBuiltinESMExports()
  await import(pathToFileURL(resolve(root, 'app/scripts/generateCurriculumQualityStatus.ts')).href)
  assert.equal(captured.size, 2, 'Expected both native output artifacts')
  const freshJson = captured.get(jsonPath)!
  const status = JSON.parse(freshJson)
  fs.readFileSync = ((file: unknown, options?: unknown) => {
    if (toPath(file) === jsonPath) {
      return typeof options === 'string' || (options && typeof options === 'object' && 'encoding' in options)
        ? freshJson : Buffer.from(freshJson)
    }
    return originalRead(file as fs.PathOrFileDescriptor, options as never)
  }) as typeof fs.readFileSync
  syncBuiltinESMExports()
  try {
    await import(pathToFileURL(resolve(root, 'app/scripts/checkCurriculumMaturityFloors.ts')).href)
  } catch (error) {
    floorFailure = error instanceof Error ? error.message : String(error)
  }
  const physics = status.curricula.find((entry: { path: string }) =>
    entry.path === 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
  assert(physics, 'Fresh native canonical physics status missing')
  summary = {
    checkedAt: new Date().toISOString(),
    method: 'Unmodified native generator and native floor checker; exact output-path writes captured in process; floor reads fresh captured JSON.',
    sharedReportsWritten: false,
    nativeGeneratedAt: status.generatedAt,
    nativeStatusSha256: createHash('sha256').update(freshJson).digest('hex'),
    physics: {
      landscapeId: physics.landscapeId, maturity: physics.maturity,
      goals: physics.goals, atomicGoals: physics.atomicGoals,
      rules: physics.rules,
      scopes: physics.scopes.map((scope: { scopeId: string; maturity: string; rules: Array<{ status: string }> }) => ({
        scopeId: scope.scopeId, maturity: scope.maturity,
        nonPassingRules: scope.rules.filter(rule => rule.status !== 'pass'),
      })),
    },
    nativeLogs,
    floorPassed: floorFailure === null,
    floorFailure,
  }
} finally {
  fs.readFileSync = originalRead
  fs.writeFileSync = originalWrite
  fs.mkdirSync = originalMkdir
  console.log = originalLog
  syncBuiltinESMExports()
}
console.log(JSON.stringify(summary, null, 2))
if (floorFailure) process.exitCode = 1

