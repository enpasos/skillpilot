import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { buildApplicabilityCompilation } from '../../../app/scripts/applicabilityCompiler'

const mode = process.argv[2]
assert(mode === 'before' || mode === 'candidate')
const source = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const expected = mode === 'before'
  ? 'e0ff0cafccf0f638c4cb36d5a252480ccc7062750619ef0452a447775bf96fe1'
  : 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
assert.equal(sha(readFileSync(source)), expected)
const result = buildApplicabilityCompilation()
const report = result.reports.find(row => row.landscapeId === '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')
assert(report)
assert.equal(report.goals.length, 1252)
assert.equal(sha(readFileSync(source)), expected)
writeFileSync(`tmp/math-memory-candidate-5cb-qa/applicability-${mode}.json`, JSON.stringify({
  mode, sourceSha256: expected,
  compiler: { path: 'app/scripts/applicabilityCompiler.ts', sha256: sha(readFileSync('app/scripts/applicabilityCompiler.ts')) },
  report,
}, null, 2) + '\n')
console.log(JSON.stringify({ mode, goals: report.goals.length,
  errors: report.findings.filter(row => row.severity === 'error').length,
  warnings: report.findings.filter(row => row.severity === 'warning').length }))
