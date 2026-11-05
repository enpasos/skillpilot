import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
const opt = (key: string, fallback: string) => { const index = args.indexOf(key); return index < 0 ? fallback : args[index + 1] }
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
const json = (path: string) => JSON.parse(read(path))
const config = json('app/scripts/config/learning-units/math-package-entry.json')
const nativePath = opt('--native-binder', 'curricula/DE/Gymnasium/learning-units/offers/math-2026-11-05-v2.json')
const native = json(nativePath)
const revision = 'math-package-2026-11-05-v2'
const binderPath = `DE/Gymnasium/learning-units/offers/${revision}.json`
const catalogPath = `DE/Gymnasium/learning-units/offers/${revision}.catalog.json`
const reviewRef = 'DE/Gymnasium/quality/learning-units/math-package-offers-2026-11-05-v2.md'
const receiptPath = 'DE/Gymnasium/quality/learning-units/math-package-offers-2026-11-05-v2.review.json'
const derivationBytes = read(`curricula/${config.derivationPath}`); const derivation = JSON.parse(derivationBytes)
assert.equal(digest(read(`curricula/${config.originalOverviewPath}`)), derivation.originalOverviewSha256)
assert.equal(digest(read(`curricula/${config.entryPath}`)), derivation.entrySha256)
const inputs: Record<string, string> = Object.fromEntries(Object.entries(native.inputs as Record<string, string>)
  .filter(([path]) => path !== native.reviewRef && !path.endsWith('math-current-offers-2026-11-05-v2.review.json')))
inputs[config.entryPath] = derivation.entrySha256
inputs[config.derivationPath] = digest(derivationBytes)
// Original overview stays pinned provenance; its exemption requires this exact derivation.
assert.equal(inputs[config.originalOverviewPath], derivation.originalOverviewSha256)
const offers = native.offers.map((row: any) => ({ ...row, scope: { ...row.scope, rootLandscapeId: config.entryLandscapeId },
  inputPaths: [...new Set([...row.inputPaths, config.entryPath, config.derivationPath, config.reviewRef])].sort() }))
assert.equal(offers.length, 182)
const proofPath = 'docs/dev/learning-units-mathematics-package-offer-authoring-v2.json'
const authoringProof = { schemaVersion: 1, semantics: 'reviewed-entry-offer-authoring-derivation-v1',
  scopeCount: offers.length, nativeReferencePath: nativePath, nativeReferenceScopeRowsSha256: digest(canonicalJson(native.offers)),
  packageScopeRowsSha256: digest(canonicalJson(offers)), entryDerivationPath: config.derivationPath,
  entryDerivationSha256: digest(derivationBytes), rootIdentityOnlyChanged: true,
  boundary: 'Authored package scope records derived from actual repository evidence; actual produced-package182 projection parity is a separate mandatory gate and is not claimed here.' }
const proofBytes = `${compactScalarArrays(authoringProof)}\n`
const reviewInput = { revision, inputs, offers, entryDerivation: { path: config.derivationPath, sha256: digest(derivationBytes) },
  contracts: json('curricula/DE/Gymnasium/learning-units/catalog.json').contracts,
  proofSha256: digest(proofBytes) }
const reviewedInputSha256 = digest(canonicalJson(reviewInput))
const prepare = args.includes('--prepare')
assert.equal(['--prepare', '--apply', '--check'].filter(flag => args.includes(flag)).length, 1, 'Choose exactly --prepare, --apply or --check')
if (!prepare) {
  const receipt = json(`curricula/${receiptPath}`)
  assert.equal(receipt.schemaVersion, 1); assert.equal(receipt.semantics, 'learning-unit-offer-review-v1')
  assert.equal(receipt.decision, 'approved'); assert.ok(receipt.independentReviewer?.trim())
  assert.equal(receipt.reviewedInputSha256, reviewedInputSha256); assert.equal(receipt.reviewPath, reviewRef)
  for (const path of [config.reviewRef, reviewRef, receiptPath]) inputs[path] = digest(read(`curricula/${path}`))
}
const binder = { schemaVersion: 1, semantics: 'current-learning-unit-offers-v1', revision,
  resolverRevision: 'native-personal-curriculum-offers-v1', inputs, reviewRef,
  proof: { path: proofPath, sha256: digest(proofBytes) }, entryDerivation: reviewInput.entryDerivation, offers }
const binderBytes = `${compactScalarArrays(binder)}\n`
const catalog = { ...json('curricula/DE/Gymnasium/learning-units/catalog.json'),
  currentOfferBinding: { path: binderPath, sha256: digest(binderBytes) } }
const artifacts = new Map([[`curricula/${binderPath}`, binderBytes], [`curricula/${catalogPath}`, `${JSON.stringify(catalog, null, 2)}\n`], [proofPath, proofBytes]])
if (prepare) {
  const output = opt('--output', 'tmp/math-learning-units/package-bindings/math-package-2026-11-05-v2')
  artifacts.set('review-input.json', `${compactScalarArrays({ reviewedInputSha256, reviewInput })}\n`)
  for (const [path, bytes] of artifacts) { const destination = resolve(root, output, path); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
} else {
  for (const [path, bytes] of artifacts) if (args.includes('--check') || existsSync(resolve(root, path))) assert.equal(read(path), bytes, `Immutable package binding drift ${path}`)
  if (!args.includes('--check')) for (const [path, bytes] of artifacts) { mkdirSync(dirname(resolve(root, path)), { recursive: true }); writeFileSync(resolve(root, path), bytes) }
}
console.log(JSON.stringify({ revision, reviewedInputSha256, scopeCount: offers.length, inputCount: Object.keys(inputs).length,
  entryLandscapeId: config.entryLandscapeId, packageCatalogPath: catalogPath, candidateOnly: prepare }))
