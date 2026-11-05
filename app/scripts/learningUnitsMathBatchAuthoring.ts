import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest, mathCanonicalPath } from './learningUnitsMathAuthoring'
import { prepareBatch, type Batch } from './learningUnits/batchAuthoring'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const argv = process.argv.slice(2)
const value = (key: string) => { const index = argv.indexOf(key); return index < 0 ? undefined : argv[index + 1] }
const batchPath = value('--batch'); assert.ok(batchPath, 'Required: --batch <reviewed static batch.json>')
assert.equal(Number(argv.includes('--plan')) + Number(argv.includes('--apply')) + Number(argv.includes('--check')), 1, 'Choose exactly --plan, --apply or --check')
const batch = JSON.parse(readFileSync(resolve(root, batchPath), 'utf8')) as Batch
const fromGit = (path: string) => execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${batch.baselineRef}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
const canonical = JSON.parse(fromGit(mathCanonicalPath))
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const catalogPath = 'curricula/DE/Gymnasium/learning-units/catalog.json'
const ledger = JSON.parse(fromGit(ledgerPath)); const catalog = JSON.parse(fromGit(catalogPath))
const inputRoot = value('--input-root')
const read = (path: string) => {
  assert.ok(!path.split('/').includes('..') && !path.startsWith('/'), 'Curriculum input must be a relative path')
  const candidate = inputRoot ? resolve(root, inputRoot, path) : undefined
  return readFileSync(candidate && existsSync(candidate) ? candidate : resolve(root, 'curricula', path), 'utf8')
}
const result = prepareBatch(batch, canonical, ledger, catalog, read, argv.includes('--plan'))
const artifacts = new Map(result.artifacts)
artifacts.set(mathCanonicalPath.substring('curricula/'.length), `${JSON.stringify(result.source, null, 2)}\n`)
artifacts.set(ledgerPath.substring('curricula/'.length), `${JSON.stringify(result.ledger, null, 2)}\n`)
artifacts.set(catalogPath.substring('curricula/'.length), `${JSON.stringify(result.catalog, null, 2)}\n`)
const output = resolve(root, value('--output') ?? `tmp/math-learning-units/batches/${batch.generation}`)
if (argv.includes('--plan')) {
  for (const [path, bytes] of artifacts) { const destination = resolve(output, 'candidate-curricula', path); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
  mkdirSync(output, { recursive: true }); writeFileSync(resolve(output, 'content-review-inputs.json'), `${JSON.stringify(result.reviews, null, 2)}\n`)
  writeFileSync(resolve(output, 'structural-proof.json'), `${JSON.stringify(result.proof, null, 2)}\n`)
} else {
  const immutablePrefixes = ['DE/Gymnasium/learning-units/contracts/', 'DE/Gymnasium/learning-units/sources/', 'DE/Gymnasium/learning-units/inputs/']
  for (const [path, bytes] of artifacts) {
    const destination = resolve(root, 'curricula', path)
    if (existsSync(destination) && immutablePrefixes.some(prefix => path.startsWith(prefix))) assert.equal(readFileSync(destination, 'utf8'), bytes, `Immutable archive ${path}`)
    if (argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), bytes, `Generated drift ${path}`)
  }
  if (argv.includes('--apply')) {
    // Refuse an intervening source generation; a plan must be refreshed before applying.
    for (const path of [mathCanonicalPath, ledgerPath, catalogPath]) assert.equal(digest(readFileSync(resolve(root, path))), digest(fromGit(path)), `Live generation changed since batch baseline: ${path}`)
    for (const [path, bytes] of artifacts) { const destination = resolve(root, 'curricula', path); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
  }
}
console.log(JSON.stringify({ generation: batch.generation, artifacts: artifacts.size, reviews: result.reviews.map(({ contractId, status, reviewedInputSha256 }) => ({ contractId, status, reviewedInputSha256 })), proofSha256: digest(canonicalJson(result.proof)) }))
