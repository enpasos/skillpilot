// SPDX-License-Identifier: Apache-2.0
// Independent boundary probes use the actual current predicate, not a copied implementation.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname, sep } from 'node:path'
import ts from '../../../../../../../app/node_modules/typescript/lib/typescript.js'
const root = resolve('.')
const checkerPath = 'app/scripts/checkTerminology.ts'
const source = readFileSync(checkerPath, 'utf8')
const code = source.slice(source.indexOf('const capturedCommandOutputs ='), source.indexOf('function collectScannableFiles'))
const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const actualPredicate = () => new Function('repoRoot', 'toPosixPath', 'dirname', 'resolve', 'readdirSync', 'readFileSync', 'createHash', js + '; return isCapturedCommandOutput;')(
  root, (p: string) => p.split(sep).join('/'), dirname, resolve, readdirSync, readFileSync, createHash)
const directory = 'tmp/terminology-independent-a-malformed-argv'
mkdirSync(directory, { recursive: true })
const path = directory + '/fixture.stderr.actual.txt'
const contents = 'Actual receipt boundary fixture: ' + String.fromCodePoint(108,101,97,114,110,105,110,103,32,108,97,110,100,115,99,97,112,101) + '\n'
writeFileSync(path, contents)
const binding = { path, sha256: 'sha256:' + createHash('sha256').update(contents).digest('hex'), bytes: Buffer.byteLength(contents) }
const cases = [
  { name: 'empty argv', argv: [], expectedCapture: false },
  { name: 'numeric executable argv', argv: [42], expectedCapture: false },
  { name: 'null executable argv', argv: [null], expectedCapture: false },
  { name: 'empty executable string', argv: [''], expectedCapture: false },
  { name: 'whitespace-only executable string', argv: ['  '], expectedCapture: false },
  { name: 'nonstring argument after executable', argv: ['fixture-command', 42], expectedCapture: false },
  { name: 'valid command with intentionally empty later argument', argv: ['fixture-command', ''], expectedCapture: true },
]
const results = cases.map(test => {
  writeFileSync(directory + '/fixture.terminal.actual.json', JSON.stringify({ argv: test.argv, exitCode: 1, stderr: binding }) + '\n')
  const actualCapture = actualPredicate()(path, contents)
  return { ...test, actualCapture, expectationPassed: actualCapture === test.expectedCapture }
})
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/terminology-captured-command-boundary-independent-a-v1/'
writeFileSync(own + 'actual-malformed-argv-boundary.independent-a.actual.json', JSON.stringify({ schemaVersion: 1,
  role: 'Independent executed malformed argv probes; no active checker changes', checkerPath,
  checkerSha256: 'sha256:' + createHash('sha256').update(source).digest('hex'), results,
  allPassed: results.every(r => r.expectationPassed), findingId: 'TRM-A-ARGV-001', humanApproval: false }, null, 2) + '\n')
console.log(JSON.stringify(results, null, 2))
