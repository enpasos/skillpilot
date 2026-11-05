import assert from 'node:assert/strict'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest, mathCanonicalPath } from './learningUnitsMathAuthoring'
import { compactScalarArrays } from './learningUnits/compactJson'
import { prepareOfferBindings } from './learningUnitsMathOfferBindings'
import { prepareMathProjectionEvidence } from './learningUnitsMathProjectionEvidence'
import { validateNativeProjectionEvidence, type NativeProjectionEvidence } from './nativeProjectionEvidence'
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const bytes = (path: string) => readFileSync(resolve(repo, path), 'utf8')
const parse = (path: string) => JSON.parse(bytes(path))
const hash = (value: unknown) => digest(canonicalJson(value))
/** New generations only. Historical v1/v2 authoring and admitted bytes remain unchanged. */
export function prepareStableOfferBindings(raw: any, projection: NativeProjectionEvidence, config: any, catalog: any) {
  validateNativeProjectionEvidence(projection, repo, projection.landscapeId)
  assert.deepEqual(prepareMathProjectionEvidence(raw), projection, 'Evidence is not the exact current native projection')
  const checked = prepareOfferBindings(raw, config, catalog)
  const source = parse(mathCanonicalPath)
  const contractBindings = catalog.contracts.map((entry: any) => ({ ...entry })).sort((a: any, b: any) => a.path.localeCompare(b.path, 'en'))
  const definitions = new Map<string, any>(catalog.contracts.map((entry: any) => {
    const definition = parse(`curricula/${entry.path}`)
    return [`${definition.contractId}@${definition.revision}`, definition]
  }))
  const selected = [...new Set(config.rootSelections.map((selection: any) => `${selection.contractId}@${selection.revision}`))].sort()
  const ownership = selected.map(ref => {
    const definition = definitions.get(ref); assert.ok(definition)
    const unit = source.programUnits.find((unit: any) => unit.id === definition.sourceBinding.programUnitId); assert.ok(unit)
    return { ref, programUnit: unit, acquisitionPlacements: source.goalPlacements.filter((placement: any) => placement.unitId === unit.id && placement.acquisition)
      .sort((a: any, b: any) => canonicalJson(a).localeCompare(canonicalJson(b), 'en')) }
  })
  const proof = { schemaVersion: 1, semantics: 'stable-native-projection-and-reviewed-unit-selection-proof-v1', revision: config.revision,
    offeredScopeCount: projection.scopes.length, resolvedScopeCount: projection.scopes.length, partialScopeCount: checked.binder.offers.length,
    nativeProjectionCanonicalPayloadSha256: hash(projection), nativeProjectionStaticInputsSha256: hash(projection.inputs),
    sourceSha256: digest(bytes(mathCanonicalPath)), explicitSelectionConfigSha256: hash(config),
    historicalContractBindingsSha256: hash(contractBindings), historicalContractCount: contractBindings.length,
    explicitCurrentOwnershipSha256: hash(ownership), explicitSelectedContractCount: selected.length,
    projectionInputSha256: checked.binder.inputs, projectionInputCountBeforeReviewEvidence: Object.keys(checked.binder.inputs).length,
    reviewEvidenceBoundary: 'The two hashes of this generation\'s decision document and receipt are appended after this proof is fixed. They are not included in this proof\'s projection-input count or in its own reviewed-input digest; the final binder and catalog pointer bind those actual bytes without a self-hash cycle.',
    rowSetSha256: hash(checked.binder.offers), targetAtomicUnionCount: Object.keys(projection.targetAtomicMembership).length,
    emptyRootScopeCount: checked.binder.offers.filter(row => !row.rootContractRefs.length).length,
    selectedRootScopeCounts: config.rootSelections.map((selection: any) => ({ contractId: selection.contractId, revision: selection.revision, count: selection.scopeIds.length })),
    boundary: 'Partial current repository offer selection. No volatile raw run, M/I, measurement, active catalog pointer or current binder proof is a normative ancestor. Immutable contracts, their full pinned inputs and explicit current ownership remain bound. No complete subject, M7, package or host acceptance.' }
  const proofPath = `docs/dev/learning-units-mathematics-current-offers-${config.revision}.json`
  const proofBytes = `${compactScalarArrays(proof)}\n`
  const binder = { ...checked.binder, proof: { path: proofPath, sha256: digest(proofBytes) } }
  const reviewInput = { revision: config.revision, resolverRevision: binder.resolverRevision, inputs: binder.inputs,
    offers: binder.offers, proofSha256: digest(proofBytes) }
  return { binder, proofPath, proofBytes, reviewInput, reviewedInputSha256: hash(reviewInput) }
}
function main() {
  const args = process.argv.slice(2); const value = (key: string, fallback?: string) => { const index = args.indexOf(key); return index < 0 ? fallback : args[index + 1] }
  assert.equal(['--prepare','--apply','--check'].filter(flag => args.includes(flag)).length, 1, 'Choose --prepare, --apply or --check')
  const configPath = value('--config'); const nativePath = value('--native'); assert.ok(configPath && nativePath, 'Pass --config and --native')
  const projection = parse(value('--projection','docs/dev/learning-units-mathematics-native-source-projection.json')!)
  const catalogPath = 'curricula/DE/Gymnasium/learning-units/catalog.json'; const catalog = parse(catalogPath)
  const config = parse(configPath); const result = prepareStableOfferBindings(parse(nativePath), projection, config, catalog)
  const candidate = args.includes('--prepare')
  if (!candidate) {
    const receipt = parse(`curricula/${config.reviewReceiptPath}`)
    assert.equal(receipt.schemaVersion,1); assert.equal(receipt.semantics,'learning-unit-offer-review-v1')
    assert.equal(receipt.decision,'approved'); assert.ok(receipt.independentReviewer?.trim())
    assert.equal(receipt.reviewedInputSha256,result.reviewedInputSha256,'Stable offer review input changed')
    assert.equal(receipt.reviewPath,config.reviewRef)
    for (const path of [config.reviewRef,config.reviewReceiptPath]) result.binder.inputs[path]=digest(bytes(`curricula/${path}`))
  }
  const binderPath=`curricula/DE/Gymnasium/learning-units/offers/${config.revision}.json`
  const binderBytes=`${compactScalarArrays(result.binder)}\n`
  const artifacts=new Map([[binderPath,binderBytes],[result.proofPath,result.proofBytes]])
  if(candidate) {
    artifacts.set('review-input.json',`${compactScalarArrays({reviewedInputSha256:result.reviewedInputSha256,reviewInput:result.reviewInput})}\n`)
    const output=value('--output',`tmp/math-learning-units/current-offers/${config.revision}`)!
    for(const[path,data]of artifacts){const target=resolve(repo,output,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,data)}
  } else {
    artifacts.set(catalogPath,`${JSON.stringify({...catalog,currentOfferBinding:{path:binderPath.substring('curricula/'.length),sha256:digest(binderBytes)}},null,2)}\n`)
    for(const[path,data]of artifacts)if(args.includes('--check')||path===binderPath&&existsSync(resolve(repo,path)))assert.equal(bytes(path),data,`Immutable stable binder/generator drift ${path}`)
    if(!args.includes('--check'))for(const[path,data]of artifacts){mkdirSync(dirname(resolve(repo,path)),{recursive:true});writeFileSync(resolve(repo,path),data)}
  }
  console.log(JSON.stringify({revision:config.revision,scopeCount:result.binder.offers.length,reviewedInputSha256:result.reviewedInputSha256,candidateOnly:candidate}))
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main()
