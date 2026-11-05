import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { prepareStableOfferBindings } from './learningUnitsMathStableOfferBindings'
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const args=process.argv.slice(2); const option=(key:string,fallback?:string)=>{const index=args.indexOf(key);return index<0?fallback:args[index+1]}
const read=(path:string)=>JSON.parse(readFileSync(resolve(repo,path),'utf8'))
const nativePath=option('--native'); const configPath=option('--config')
assert.ok(nativePath&&configPath,'Pass --native <fresh-raw> --config <explicit-new-generation>')
const raw=read(nativePath);const config=read(configPath);const projection=read('docs/dev/learning-units-mathematics-native-source-projection.json')
const catalog=read('curricula/DE/Gymnasium/learning-units/catalog.json')
const baseline=prepareStableOfferBindings(raw,projection,config,catalog)
const changed=structuredClone(raw)
changed.catalogAdmissionMeasurement={elapsedNanos:999,usedHeapBeforeBytes:7,usedHeapAfterBytes:12}
changed.globalRecognitionAtEmptyMastery=['diagnostic-only']
changed.actualContractEvaluations=[{differentRunDiagnostic:true}]
changed.nativeMapperInputSha256['curricula/DE/Gymnasium/learning-units/catalog.json']='a'.repeat(64)
changed.nativeMapperInputSha256['curricula/DE/Gymnasium/learning-units/offers/proof-only-diagnostic.json']='b'.repeat(64)
changed.scopes.forEach((row:any)=>{row.learningUnitReadModel={different:true};row.nativeOfferContext={different:true}})
const pointerChanged=structuredClone(catalog)
pointerChanged.currentOfferBinding={path:'DE/Gymnasium/learning-units/offers/other-current-pointer.json',sha256:'c'.repeat(64)}
const actual=prepareStableOfferBindings(changed,projection,config,pointerChanged)
assert.deepEqual(actual.binder,baseline.binder,'Volatile diagnostics or current pointer entered normative binder ancestry')
assert.equal(actual.proofBytes,baseline.proofBytes)
assert.equal(actual.reviewedInputSha256,baseline.reviewedInputSha256)
const fewer=structuredClone(config);fewer.rootSelections[0].scopeIds.pop()
const selectionChanged=prepareStableOfferBindings(raw,projection,fewer,catalog)
assert.notEqual(selectionChanged.reviewedInputSha256,baseline.reviewedInputSha256,'Explicit scope ownership change escaped proof')
const alteredContract=structuredClone(catalog);alteredContract.contracts[0].sha256='d'.repeat(64)
assert.throws(()=>prepareStableOfferBindings(raw,projection,config,alteredContract),/Assertion|equal/)
const alteredPin=structuredClone(catalog);const input=Object.keys(alteredPin.contracts[0].inputs)[0];alteredPin.contracts[0].inputs[input]='e'.repeat(64)
assert.throws(()=>prepareStableOfferBindings(raw,projection,config,alteredPin),/Frozen contract input drift/)
const duplicate=structuredClone(config);duplicate.rootSelections.push(duplicate.rootSelections[0])
assert.throws(()=>prepareStableOfferBindings(raw,projection,duplicate,catalog),/Duplicate child acquisition path/)
const wrongScope=structuredClone(config);wrongScope.rootSelections[0].scopeIds.push('ALL/SekI//')
assert.throws(()=>prepareStableOfferBindings(raw,projection,wrongScope,catalog),/outside actual native target/)
const proof=JSON.parse(baseline.proofBytes)
assert.equal(proof.projectionInputCountBeforeReviewEvidence,Object.keys(baseline.binder.inputs).length)
assert.ok(proof.reviewEvidenceBoundary.includes('two hashes'))
assert.equal(proof.historicalContractCount,catalog.contracts.length)
assert.equal(proof.explicitSelectedContractCount,config.rootSelections.length)
assert.ok(!('nativeReportSha256'in proof)&&!('nativeInputManifestSha256'in proof),'Full raw report must remain diagnostic-only')
const report={schemaVersion:1,semantics:'actual-stable-offer-authoring-mutation-proof-v1',revision:config.revision,
 scopes:baseline.binder.offers.length,reviewedInputSha256:baseline.reviewedInputSha256,
 volatileTimingMasteryReadmodelsAndCatalogProofOnlyIgnored:true,currentPointerBeforeAfterIgnored:true,
 explicitSelectionChangeChangesProof:true,immutableContractAndInputTamperingRejected:true,
 duplicateOwnerAndWrongScopeRejected:true,contractBindingsRetained:catalog.contracts.length,
 projectionInputCountBeforeReviewEvidence:proof.projectionInputCountBeforeReviewEvidence,
 reviewEvidenceSelfReferenceBoundaryExplicit:true,proofSha256:digest(baseline.proofBytes),
 boundary:'In-memory adversarial checks with current real source files. Actual post-activation native/API182 and fresh binder --check remain separate gates.'}
const output=option('--output');if(output)writeFileSync(resolve(repo,output),JSON.stringify(report,null,2)+'\n')
console.log(canonicalJson(report))
