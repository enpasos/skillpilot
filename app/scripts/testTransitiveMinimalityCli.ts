// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import type { AuditLandscape } from './auditTransitiveMinimality'

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cache = resolve(appRoot, 'node_modules/.tmp')
mkdirSync(cache, { recursive: true })
const temporary = mkdtempSync(resolve(cache, 'g17-cli-'))
after(() => rmSync(temporary, { recursive: true, force: true }))
let nextFile = 0
const minimal: AuditLandscape = { landscapeId: 'A', goals: [{ id: 'a' }] }
const redundant: AuditLandscape = { landscapeId: 'B', goals: [
  { id: 'q', requires: ['b', 'a'] }, { id: 'b', requires: ['a'] }, { id: 'a' },
] }
type RootReport = {
  rootLandscapeId: string; status: string; error?: string; nodeCount?: number
  inheritanceOnlyAncestors?: string[]; goalKeys: string[]; findings: [number, number, number[], number[]][]
}
type Report = {
  status: string; mode: string; error?: string; selection?: string; roots?: string[]
  referenceCatalogSources?: { path: string; sha256: string; landscapeId: string }[]
  rootResults?: RootReport[]
}
function catalog(files: Record<string, unknown>): string {
  const directory = mkdtempSync(resolve(temporary, 'catalog-'))
  for (const [name, value] of Object.entries(files)) {
    const file = resolve(directory, name)
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value))
  }
  return directory
}
function invoke(args: string[], expectedExit: number) {
  const result = spawnSync(process.execPath, ['--import', 'tsx', resolve(appRoot, 'scripts/auditTransitiveMinimality.ts'), ...args],
    { cwd: appRoot, encoding: 'utf8', timeout: 30_000 })
  assert.ifError(result.error)
  assert.equal(result.status, expectedExit, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`)
  return result
}
function run(args: string[], expectedExit: number): Report {
  const output = resolve(temporary, `report-${nextFile++}.json`)
  invoke(['--output', output, ...args], expectedExit)
  return JSON.parse(readFileSync(output, 'utf8')) as Report
}

test('a minimal complete catalog passes in every mode', () => {
  const directory = catalog({ 'A.json': minimal })
  for (const flags of [[], ['--check'], ['--report-only']]) {
    const report = run(['--catalog', directory, ...flags], 0)
    assert.equal(report.status, 'pass')
    assert.equal(report.selection, 'complete-catalog')
    assert.deepEqual(report.roots, ['A'])
  }
})

test('default/check fail on redundancy; report-only retains fail while allowing inspection', () => {
  const directory = catalog({ 'A.json': minimal, 'B.json': redundant })
  for (const flags of [[], ['--check'], ['--report-only']]) {
    const report = run(['--catalog', directory, ...flags], flags.includes('--report-only') ? 0 : 1)
    assert.equal(report.status, 'fail')
    assert.equal(report.selection, 'complete-catalog')
    assert.deepEqual(report.roots, ['A', 'B'])
    assert.deepEqual(report.rootResults!.map((entry) => [entry.rootLandscapeId, entry.status]), [['A', 'pass'], ['B', 'fail']])
    assert.equal(report.rootResults![1].findings.length, 1)
  }
})

test('explicit roots are a declared partial scan and retain the complete reference catalog', () => {
  const directory = catalog({ 'A.json': minimal, 'B.json': redundant })
  const report = run(['--catalog', directory, '--root', 'A', '--root', 'A'], 0)
  assert.equal(report.status, 'pass')
  assert.equal(report.selection, 'explicit-roots')
  assert.deepEqual(report.roots, ['A']) // repeated roots are deterministically deduplicated
  assert.equal(report.rootResults!.length, 1)
  assert.deepEqual(report.referenceCatalogSources!.map((entry) => entry.landscapeId), ['A', 'B'])
  for (const entry of report.referenceCatalogSources!) assert.match(entry.sha256, /^[a-f0-9]{64}$/)
})

test('catalog discovery matches producer recursion, JSON extension and deck exclusion', () => {
  const directory = catalog({ 'A.json': minimal, 'nested/SECOND.JSON': redundant,
    'ignored_deck.json': '{bad json', 'nested/not-json.txt': '{bad json' })
  const report = run(['--catalog', directory], 1)
  assert.deepEqual(report.roots, ['A', 'B'])
  assert.equal(report.referenceCatalogSources!.length, 2)
  assert.ok(report.referenceCatalogSources!.some((entry) => entry.path.endsWith('/nested/SECOND.JSON')))
})

test('one invalid effective root does not suppress another root result', () => {
  const directory = catalog({ 'A.json': minimal, 'Cycle.json': { landscapeId: 'Cycle', goals: [
    { id: 'cluster', contains: ['x'], requires: ['x'] }, { id: 'x' },
  ] } })
  for (const flags of [[], ['--report-only']]) {
    const report = run(['--catalog', directory, ...flags], 2)
    assert.equal(report.status, 'invalid-input')
    assert.deepEqual(report.rootResults!.map((entry) => [entry.rootLandscapeId, entry.status]), [['A', 'pass'], ['Cycle', 'invalid-input']])
    assert.match(report.rootResults![1].error!, /effective requires cycle/)
  }
  assert.equal(run(['--catalog', directory, '--root', 'A'], 0).status, 'pass')
})

test('foreign reference and ancestor closure preserve proof origins without unrelated siblings', () => {
  const directory = catalog({ 'L.json': { landscapeId: 'L', goals: [{ id: 'q', requires: ['F:b', 'F:c'] }] },
    'foreign/F.json': { landscapeId: 'F', goals: [
      { id: 'parent', contains: ['b', 'sibling'], requires: ['c'] },
      { id: 'b' }, { id: 'c' }, { id: 'sibling', requires: ['sibling'] },
    ] } })
  const entry = run(['--catalog', directory, '--root', 'L'], 1).rootResults![0]
  assert.equal(entry.nodeCount, 4)
  assert.deepEqual(entry.inheritanceOnlyAncestors, ['F:parent'])
  const [source, prerequisite, witness, origins] = entry.findings[0]
  assert.deepEqual([entry.goalKeys[source], entry.goalKeys[prerequisite]], ['L:q', 'F:c'])
  assert.deepEqual(witness.map((index) => entry.goalKeys[index]), ['L:q', 'F:b', 'F:c'])
  assert.deepEqual(origins.map((index) => entry.goalKeys[index]), ['L:q', 'F:parent'])
  assert.ok(!entry.goalKeys.includes('F:sibling'))
})

test('unknown roots and empty roots remain invalid alongside a valid root', () => {
  const directory = catalog({ 'A.json': minimal, 'Empty.json': { landscapeId: 'Empty', goals: [] } })
  for (const selected of [['--root', 'Missing'], ['--root', 'A', '--root', 'Empty']]) {
    const report = run(['--catalog', directory, '--report-only', ...selected], 2)
    assert.equal(report.status, 'invalid-input')
    assert.equal(report.rootResults!.at(-1)!.status, 'invalid-input')
  }
})

test('loading errors and an empty catalog are invalid in report-only mode too', () => {
  for (const directory of [catalog({}), resolve(temporary, 'missing'), catalog({ 'bad.json': '{bad' })]) {
    const report = run(['--catalog', directory, '--report-only'], 2)
    assert.equal(report.status, 'invalid-input')
    assert.ok(report.error)
  }
})

test('invalid shapes and duplicate ownership fail through the real CLI', () => {
  const bad: unknown[] = [null, { landscapeId: 'L', goals: {} }, { landscapeId: '', goals: [] },
    { landscapeId: 'L', goals: [null] }, { landscapeId: 'L', goals: [{}] },
    { landscapeId: 'L', goals: [{ id: 1 }] }, { landscapeId: 'L', goals: [{ id: 'a', requires: 'b' }] },
    { landscapeId: 'L', goals: [{ id: 'a', contains: [null] }] },
    { landscapeId: 'L', goals: [{ id: 'a' }, { id: 'a' }] }]
  for (const input of bad) assert.equal(run(['--catalog', catalog({ 'bad.json': input })], 2).status, 'invalid-input')
  const report = run(['--catalog', catalog({ 'A.json': minimal, 'duplicate.json': { landscapeId: 'A', goals: [{ id: 'other' }] } })], 2)
  assert.match(report.error!, /Duplicate landscape ID/)
})

test('unknown and ambiguous references fail through the real CLI', () => {
  for (const reference of ['missing', 'F:missing', 'common']) {
    const directory = catalog({ 'L.json': { landscapeId: 'L', goals: [{ id: 'q', requires: [reference] }] },
      'F.json': { landscapeId: 'F', goals: [{ id: 'common' }] },
      'G.json': { landscapeId: 'G', goals: [{ id: 'common' }] } })
    const report = run(['--catalog', directory, '--root', 'L'], 2)
    assert.equal(report.status, 'invalid-input')
    assert.match(report.rootResults![0].error!, /Unknown reference|Ambiguous reference/)
  }
})

test('argument errors and unwritable report paths never succeed', () => {
  for (const args of [['--unknown'], ['--catalog'], ['--root'], ['--output'], ['--root', '--check'],
    ['--catalog', ''], ['--root', ''], ['--check', '--report-only'], ['--check', '--check']]) {
    assert.match(invoke(args, 2).stderr, /invalid-input/)
  }
  const directory = catalog({ 'A.json': minimal })
  assert.match(invoke(['--catalog', directory, '--output', resolve(temporary, 'missing/report.json')], 2).stderr, /Cannot write report/)
})

test('identical catalogs and options generate byte-identical reports', () => {
  const directory = catalog({ 'A.json': minimal, 'B.json': redundant })
  const paths = [resolve(temporary, 'first.json'), resolve(temporary, 'second.json')]
  for (const output of paths) invoke(['--catalog', directory, '--report-only', '--output', output], 0)
  assert.equal(readFileSync(paths[0], 'utf8'), readFileSync(paths[1], 'utf8'))
})
