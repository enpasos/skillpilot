import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest, mathCanonicalPath } from './learningUnitsMathAuthoring'
import { prepareBatch, type Batch } from './learningUnits/batchAuthoring'
import type { SemanticLedger } from './learningUnits/adapterTypes'
import { writeAtomicAuthoringFile } from './atomicAuthoringFile'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const argv = process.argv.slice(2)
const value = (key: string) => { const index = argv.indexOf(key); return index < 0 ? undefined : argv[index + 1] }
const batchPath = value('--batch'); assert.ok(batchPath, 'Required: --batch <reviewed static batch.json>')
assert.equal(['--plan', '--stage-source', '--apply', '--check'].filter(flag => argv.includes(flag)).length, 1, 'Choose exactly --plan, --stage-source, --apply or --check')
const batch = JSON.parse(readFileSync(resolve(root, batchPath), 'utf8')) as Batch
const fromGit = (path: string) => execFileSync('git', ['-c', 'core.trustctime=false', 'show', `${batch.baselineRef}:${path}`], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
const canonical = JSON.parse(fromGit(mathCanonicalPath))
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const catalogPath = 'curricula/DE/Gymnasium/learning-units/catalog.json'
const ledger = JSON.parse(fromGit(ledgerPath)) as SemanticLedger; const catalog = JSON.parse(fromGit(catalogPath))
const inputRoot = value('--input-root')
const patchedViewPaths = new Set((batch.compositionViewEdits ?? []).map(edit => edit.path))
const read = (path: string) => {
  assert.ok(!path.split('/').includes('..') && !path.startsWith('/'), 'Curriculum input must be a relative path')
  // Reproduce an explicit edit from its immutable generation, also after --stage-source.
  // Reading the already edited live view would otherwise apply the addition twice.
  if (patchedViewPaths.has(path)) return fromGit(`curricula/${path}`)
  const candidate = inputRoot ? resolve(root, inputRoot, path) : undefined
  return readFileSync(candidate && existsSync(candidate) ? candidate : resolve(root, 'curricula', path), 'utf8')
}
const result = prepareBatch(batch, canonical, ledger, catalog, read, argv.includes('--plan') || argv.includes('--stage-source'))
// Offer generations are independently reviewed; content reproduction must retain their pointer.
const liveCatalog = JSON.parse(readFileSync(resolve(root, catalogPath), 'utf8'))
if (liveCatalog.currentOfferBinding) result.catalog.currentOfferBinding = liveCatalog.currentOfferBinding
const artifacts = new Map(result.artifacts)
if (batch.qualityProofPath) artifacts.set(batch.qualityProofPath, `${JSON.stringify(result.proof, null, 2)}\n`)
if (batch.semanticRebindProofPath) {
  const records = ledger.decisions.map((previous) => {
    const current = result.ledger.decisions.find((entry) => entry.goalId === previous.goalId)
    assert.ok(current)
    assert.equal(current.semanticKind, previous.semanticKind); assert.equal(current.decisionStatus, previous.decisionStatus); assert.equal(current.decisionBasis, previous.decisionBasis)
    return previous.sourceFingerprint === current.sourceFingerprint ? [] : [{ goalId: current.goalId,
      previousFingerprint: previous.sourceFingerprint, currentFingerprint: current.sourceFingerprint,
      unchangedSemanticKind: current.semanticKind, unchangedDecisionStatus: current.decisionStatus, unchangedDecisionBasis: current.decisionBasis }]
  }).flat()
  artifacts.set(batch.semanticRebindProofPath, `${JSON.stringify({ schemaVersion: 1, semantics: 'reachability-neutral-semantic-source-rebind-v1',
    baselineRef: batch.baselineRef, generation: batch.generation, proofPath: batch.qualityProofPath,
    proofSha256: digest(canonicalJson(result.proof)), exactOriginalFullReachabilityPreserved: true,
    existingSemanticDecisionsUnchanged: true, newQualityApproval: false, decisions: records,
    newAssessmentGoalIds: result.proof.newAssessmentGoalIds,
    ...(result.proof.newOrdinaryGoalIds ? { newOrdinaryGoalIds: result.proof.newOrdinaryGoalIds,
      newClusterGoalIds: result.proof.newClusterGoalIds } : {}) }, null, 2)}\n`)
}
artifacts.set(mathCanonicalPath.substring('curricula/'.length), `${JSON.stringify(result.source, null, 2)}\n`)
artifacts.set(ledgerPath.substring('curricula/'.length), `${JSON.stringify(result.ledger, null, 2)}\n`)
if (!argv.includes('--stage-source')) artifacts.set(catalogPath.substring('curricula/'.length), `${JSON.stringify(result.catalog, null, 2)}\n`)
const output = resolve(root, value('--output') ?? `tmp/math-learning-units/batches/${batch.generation}`)
if (argv.includes('--plan')) {
  for (const [path, bytes] of artifacts) { const destination = resolve(output, 'candidate-curricula', path); mkdirSync(dirname(destination), { recursive: true }); writeAtomicAuthoringFile(destination, bytes) }
  mkdirSync(output, { recursive: true }); writeAtomicAuthoringFile(resolve(output, 'content-review-inputs.json'), `${JSON.stringify(result.reviews, null, 2)}\n`)
  writeAtomicAuthoringFile(resolve(output, 'structural-proof.json'), `${JSON.stringify(result.proof, null, 2)}\n`)
} else {
  const immutablePrefixes = ['DE/Gymnasium/learning-units/contracts/', 'DE/Gymnasium/learning-units/sources/', 'DE/Gymnasium/learning-units/inputs/']
  for (const [path, bytes] of artifacts) {
    const destination = resolve(root, 'curricula', path)
    if (existsSync(destination) && immutablePrefixes.some(prefix => path.startsWith(prefix))) assert.equal(readFileSync(destination, 'utf8'), bytes, `Immutable archive ${path}`)
    if (argv.includes('--check')) assert.equal(readFileSync(destination, 'utf8'), bytes, `Generated drift ${path}`)
  }
  if (argv.includes('--apply') || argv.includes('--stage-source')) {
    // Refuse an intervening source generation; a plan must be refreshed before applying.
    for (const path of [mathCanonicalPath, ledgerPath, catalogPath, ...[...patchedViewPaths].map(path => `curricula/${path}`)]) {
      const actual = digest(readFileSync(resolve(root, path)))
      const generated = artifacts.get(path.substring('curricula/'.length))
      assert.ok(actual === digest(fromGit(path)) || generated && actual === digest(generated), `Live generation changed since batch baseline: ${path}`)
    }
    for (const [path, bytes] of artifacts) {
      const destination = resolve(root, 'curricula', path)
      if (existsSync(destination) && readFileSync(destination, 'utf8') === bytes) continue
      mkdirSync(dirname(destination), { recursive: true }); writeAtomicAuthoringFile(destination, bytes)
    }
  }
}
console.log(JSON.stringify({ generation: batch.generation, artifacts: artifacts.size, reviews: result.reviews.map(({ contractId, status, reviewedInputSha256 }) => ({ contractId, status, reviewedInputSha256 })), proofSha256: digest(canonicalJson(result.proof)) }))
