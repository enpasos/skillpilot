import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'
import type { OfferBinder, OfferScope, SelectionConfig } from './learningUnits/adapterTypes'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const read = (path: string) => readFileSync(resolve(root, checkedPath(path)), 'utf8')
const json = (path: string) => JSON.parse(read(path))
export interface MathPackageBindingOptions {
  revision: string
  nativeBinderPath: string
  nativeSelectionConfigPath: string
  sourceCatalogPath: string
  reviewRef: string
  reviewReceiptPath: string
  proofPath: string
}
/** Exact historical recipe. Its nine-contract catalog is immutable source data. */
export const historicalMathPackageBindingOptions: MathPackageBindingOptions = {
  revision: 'math-package-2026-11-05-v2',
  nativeBinderPath: 'curricula/DE/Gymnasium/learning-units/offers/math-2026-11-05-v2.json',
  nativeSelectionConfigPath: 'app/scripts/config/learning-units/math-current-offer-roots-v2.json',
  sourceCatalogPath: 'curricula/DE/Gymnasium/learning-units/offers/math-package-2026-11-05-v2.catalog.json',
  reviewRef: 'DE/Gymnasium/quality/learning-units/math-package-offers-2026-11-05-v2.md',
  reviewReceiptPath: 'DE/Gymnasium/quality/learning-units/math-package-offers-2026-11-05-v2.review.json',
  proofPath: 'docs/dev/learning-units-mathematics-package-offer-authoring-v2.json',
}
function checkedPath(path: string): string {
  assert.ok(typeof path === 'string' && path && !path.startsWith('/') && !path.includes('\\')
    && !path.split('/').some(part => !part || part === '.' || part === '..'), 'Unsafe package binding path')
  return path
}
export function prepareMathPackageBindings(options: MathPackageBindingOptions, approved = false) {
  assert.match(options.revision, /^math-package-[a-z0-9-]+$/)
  const historical = options.revision === historicalMathPackageBindingOptions.revision
  if (historical) assert.deepEqual(options, historicalMathPackageBindingOptions, 'Historical V2 recipe is immutable')
  for (const [key, value] of Object.entries(options)) if (key !== 'revision') checkedPath(value)
  assert.ok(options.reviewRef.endsWith('.md'))
  assert.equal(options.reviewReceiptPath, options.reviewRef.replace(/\.md$/, '.review.json'), 'Package review and receipt paths differ')
  assert.ok(options.proofPath.startsWith('docs/dev/') && options.proofPath.endsWith('.json'))
  const config = json('app/scripts/config/learning-units/math-package-entry.json')
  const selection = json(options.nativeSelectionConfigPath) as SelectionConfig
  const native = json(options.nativeBinderPath) as OfferBinder
  const sourceCatalog = json(options.sourceCatalogPath)
  assert.equal(selection.schemaVersion, 1)
  assert.equal(native.revision, selection.revision, 'Source binder and selection revisions differ')
  assert.equal(native.reviewRef, selection.reviewRef, 'Source binder and selection review differ')
  assert.equal(native.semantics, 'current-learning-unit-offers-v1')
  assert.equal(native.resolverRevision, 'native-personal-curriculum-offers-v1')
  assert.equal(sourceCatalog.schemaVersion, 1)
  for (const path of [selection.reviewRef, selection.reviewReceiptPath]) {
    checkedPath(path)
    assert.equal(native.inputs[path], digest(read(`curricula/${path}`)), 'Source review input is absent or stale')
  }
  assert.equal(new Set([selection.reviewRef, selection.reviewReceiptPath, config.reviewRef,
    options.reviewRef, options.reviewReceiptPath]).size, 5, 'Source, Entry and package reviews must remain distinct')
  if (!historical) {
    assert.deepEqual(sourceCatalog.currentOfferBinding, {
      path: options.nativeBinderPath.replace(/^curricula\//, ''), sha256: digest(read(options.nativeBinderPath)),
    }, 'New package generation requires the explicitly admitted native binder')
    for (const [path, sha] of Object.entries(native.inputs)) assert.equal(digest(read(`curricula/${path}`)), sha, `Current source input drift ${path}`)
  }
  const contractRefs = new Set<string>()
  for (const entry of sourceCatalog.contracts) {
    assert.equal(digest(read(`curricula/${entry.path}`)), entry.sha256, 'Source contract changed')
    for (const [path, sha] of Object.entries(entry.inputs)) assert.equal(digest(read(`curricula/${path}`)), sha, `Frozen contract input drift ${path}`)
    const definition = json(`curricula/${entry.path}`)
    const ref = `${definition.contractId}@${definition.revision}`
    assert.ok(!contractRefs.has(ref), 'Duplicate source contract'); contractRefs.add(ref)
  }
  const scopeId = (scope: OfferScope) => [scope.jurisdiction, scope.stage, scope.durationModel ?? '', scope.courseProfile ?? ''].join('/')
  const offeredScopes = new Set(native.offers.map((row) => scopeId(row.scope)))
  assert.equal(offeredScopes.size, 182)
  for (const selected of selection.rootSelections) {
    assert.ok(contractRefs.has(`${selected.contractId}@${selected.revision}`), 'Selected source root missing from catalog')
    assert.equal(new Set(selected.scopeIds).size, selected.scopeIds.length, 'Duplicate selected source scope')
    selected.scopeIds.forEach((id: string) => assert.ok(offeredScopes.has(id), 'Selected source scope is not offered'))
  }
  const derivationBytes = read(`curricula/${config.derivationPath}`); const derivation = JSON.parse(derivationBytes)
  assert.equal(digest(read(`curricula/${config.originalOverviewPath}`)), derivation.originalOverviewSha256)
  assert.equal(digest(read(`curricula/${config.entryPath}`)), derivation.entrySha256)
  const inputs: Record<string, string> = Object.fromEntries(Object.entries(native.inputs as Record<string, string>)
    .filter(([path]) => path !== selection.reviewRef && path !== selection.reviewReceiptPath))
  inputs[config.entryPath] = derivation.entrySha256
  inputs[config.derivationPath] = digest(derivationBytes)
  // V2's approved digest predates the stronger Entry-review boundary; retain exact historical bytes.
  if (!historical) inputs[config.reviewRef] = digest(read(`curricula/${config.reviewRef}`))
  assert.equal(inputs[config.originalOverviewPath], derivation.originalOverviewSha256)
  const originalRoot = json(`curricula/${config.originalOverviewPath}`).landscapeId
  const offers = native.offers.map((row) => {
    assert.equal(row.scope.rootLandscapeId, originalRoot, 'Source offer does not use the reviewed original overview')
    assert.equal(row.scope.landscapeId, config.mathematicsLandscapeId)
    assert.equal(row.coverage, 'partial')
    assert.deepEqual(row.rootContractRefs, selection.rootSelections
      .filter((selected) => selected.scopeIds.includes(scopeId(row.scope)))
      .map(({ contractId, revision }) => ({ contractId, revision })), 'Source roots differ from explicit selection')
    return { ...row, scope: { ...row.scope, rootLandscapeId: config.entryLandscapeId },
      inputPaths: [...new Set([...row.inputPaths, config.entryPath, config.derivationPath, config.reviewRef])].sort() }
  })
  assert.equal(offers.length, 182)
  const authoringProof = { schemaVersion: 1, semantics: 'reviewed-entry-offer-authoring-derivation-v1',
    scopeCount: offers.length, nativeReferencePath: options.nativeBinderPath, nativeReferenceScopeRowsSha256: digest(canonicalJson(native.offers)),
    packageScopeRowsSha256: digest(canonicalJson(offers)), entryDerivationPath: config.derivationPath,
    entryDerivationSha256: digest(derivationBytes), rootIdentityOnlyChanged: true,
    ...(!historical ? { revision: options.revision, nativeReferenceSha256: digest(read(options.nativeBinderPath)),
      nativeSelectionConfigPath: options.nativeSelectionConfigPath, nativeSelectionConfigSha256: digest(read(options.nativeSelectionConfigPath)),
      sourceCatalogPath: options.sourceCatalogPath, sourceContractsSha256: digest(canonicalJson(sourceCatalog.contracts)),
      sourceContractCount: sourceCatalog.contracts.length, entryReviewSha256: inputs[config.reviewRef],
      reviewEvidenceBoundary: 'Entry source, derivation and its existing independent review are pre-review inputs. Only this package generation decision and receipt are appended after the proof and reviewed-input digest are fixed; no self-hash cycle.' } : {}),
    boundary: 'Authored package scope records derived from actual repository evidence; actual produced-package182 projection parity is a separate mandatory gate and is not claimed here.' }
  const proofBytes = `${compactScalarArrays(authoringProof)}\n`
  const reviewInput = { revision: options.revision, inputs, offers, entryDerivation: { path: config.derivationPath, sha256: digest(derivationBytes) },
    contracts: sourceCatalog.contracts, proofSha256: digest(proofBytes) }
  const reviewedInputSha256 = digest(canonicalJson(reviewInput))
  const binderInputs = { ...inputs }
  if (approved) {
    const receipt = json(`curricula/${options.reviewReceiptPath}`)
    assert.equal(receipt.schemaVersion, 1); assert.equal(receipt.semantics, 'learning-unit-offer-review-v1')
    assert.equal(receipt.decision, 'approved'); assert.ok(receipt.independentReviewer?.trim())
    assert.equal(receipt.reviewedInputSha256, reviewedInputSha256); assert.equal(receipt.reviewPath, options.reviewRef)
    for (const path of [config.reviewRef, options.reviewRef, options.reviewReceiptPath]) binderInputs[path] = digest(read(`curricula/${path}`))
  }
  const binderPath = `DE/Gymnasium/learning-units/offers/${options.revision}.json`
  const catalogPath = `DE/Gymnasium/learning-units/offers/${options.revision}.catalog.json`
  const binder = { schemaVersion: 1, semantics: 'current-learning-unit-offers-v1', revision: options.revision,
    resolverRevision: 'native-personal-curriculum-offers-v1', inputs: binderInputs, reviewRef: options.reviewRef,
    proof: { path: options.proofPath, sha256: digest(proofBytes) }, entryDerivation: reviewInput.entryDerivation, offers }
  const binderBytes = `${compactScalarArrays(binder)}\n`
  const catalog = { ...sourceCatalog, currentOfferBinding: { path: binderPath, sha256: digest(binderBytes) } }
  const artifacts = new Map([[`curricula/${binderPath}`, binderBytes], [`curricula/${catalogPath}`, `${JSON.stringify(catalog, null, 2)}\n`], [options.proofPath, proofBytes]])
  return { binder, catalog, catalogPath, artifacts, reviewInput, reviewedInputSha256 }
}
function main() {
  const args = process.argv.slice(2)
  const keys = { '--revision': 'revision', '--native-binder': 'nativeBinderPath', '--native-selection-config': 'nativeSelectionConfigPath',
    '--source-catalog': 'sourceCatalogPath', '--review-ref': 'reviewRef', '--review-receipt': 'reviewReceiptPath', '--proof': 'proofPath' } as const
  const opt = (key: string) => { const index = args.indexOf(key); if (index < 0) return undefined
    assert.ok(args[index + 1] && !args[index + 1].startsWith('--'), `Missing value for ${key}`); return args[index + 1] }
  const valueFlags = new Set([...Object.keys(keys), '--output']); const seen = new Set<string>()
  for (let index = 0; index < args.length; index++) {
    const flag = args[index]
    assert.ok(['--prepare', '--apply', '--check'].includes(flag) || valueFlags.has(flag), `Unknown package binding argument ${flag}`)
    assert.ok(!seen.has(flag), `Duplicate package binding argument ${flag}`); seen.add(flag)
    if (valueFlags.has(flag)) { opt(flag); index++ }
  }
  const options = { ...historicalMathPackageBindingOptions }
  for (const [key, name] of Object.entries(keys)) if (args.includes(key)) options[name as keyof MathPackageBindingOptions] = opt(key)!
  if (options.revision !== historicalMathPackageBindingOptions.revision) for (const key of Object.keys(keys)) assert.ok(args.includes(key), `New generation requires explicit ${key}`)
  assert.equal(['--prepare', '--apply', '--check'].filter(flag => args.includes(flag)).length, 1, 'Choose exactly --prepare, --apply or --check')
  const prepare = args.includes('--prepare'); const result = prepareMathPackageBindings(options, !prepare)
  if (prepare) {
    result.artifacts.set('review-input.json', `${compactScalarArrays({ reviewedInputSha256: result.reviewedInputSha256, reviewInput: result.reviewInput })}\n`)
    const output = checkedPath(opt('--output') ?? `tmp/math-learning-units/package-bindings/${options.revision}`)
    for (const [path, bytes] of result.artifacts) { const destination = resolve(root, output, path); mkdirSync(dirname(destination), { recursive: true }); writeFileSync(destination, bytes) }
  } else {
    for (const [path, bytes] of result.artifacts) if (args.includes('--check') || existsSync(resolve(root, path))) assert.equal(read(path), bytes, `Immutable package binding drift ${path}`)
    if (!args.includes('--check')) for (const [path, bytes] of result.artifacts) { mkdirSync(dirname(resolve(root, path)), { recursive: true }); writeFileSync(resolve(root, path), bytes) }
  }
  console.log(JSON.stringify({ revision: options.revision, reviewedInputSha256: result.reviewedInputSha256, scopeCount: result.binder.offers.length,
    inputCount: Object.keys(result.binder.inputs).length, entryLandscapeId: result.binder.offers[0].scope.rootLandscapeId,
    packageCatalogPath: result.catalogPath, candidateOnly: prepare }))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
