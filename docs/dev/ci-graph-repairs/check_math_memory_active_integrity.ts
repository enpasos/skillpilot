import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { evaluateGraphIntegrity } from '../../../app/scripts/generateCurriculumQualityStatus'

const directory = 'curricula/DE/Gymnasium/canonical/'
const catalog = readdirSync(directory).filter(name => name.endsWith('.de.json')).map(name => {
  const sourceFile = directory + name
  const bytes = readFileSync(sourceFile)
  const document = JSON.parse(bytes.toString('utf8'))
  return { landscapeId: document.landscapeId, sourceFile, goals: document.goals,
    sourceSha256: createHash('sha256').update(bytes).digest('hex'), document }
})
assert.equal(catalog.length, 21)
const math = catalog.find(row => row.landscapeId === '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')!
assert.equal(math.sourceSha256, 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6')
const report = evaluateGraphIntegrity(math.document, catalog)
assert.equal(report.status, 'fail', 'Remaining genuine graph findings must still block readiness.')
writeFileSync('tmp/math-memory-active-integrity.json', JSON.stringify({
  source: { path: math.sourceFile, sha256: math.sourceSha256 },
  catalogSources: catalog.map(({ document, goals, ...binding }) => binding),
  report,
}, null, 2) + '\n')
console.log(JSON.stringify({ status: report.status, metrics: report.metrics, summary: report.summary }))
