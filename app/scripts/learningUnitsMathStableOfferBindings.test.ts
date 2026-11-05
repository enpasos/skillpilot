import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { canonicalJson, digest } from './learningUnitsMathAuthoring'
import { prepareStableOfferBindings, validateFreshNativeOfferRuntime } from './learningUnitsMathStableOfferBindings'
import type { NativeReadModel, NativeReport, NativeRow, UnitCatalog, UnitDefinition } from './learningUnits/adapterTypes'
const repo=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const args=process.argv.slice(2); const option=(key:string,fallback?:string)=>{const index=args.indexOf(key);return index<0?fallback:args[index+1]}
const read=(path:string)=>JSON.parse(readFileSync(resolve(repo,path),'utf8'))
const nativePath=option('--native'); const configPath=option('--config')
assert.ok(nativePath&&configPath,'Pass --native <fresh-raw> --config <explicit-new-generation>')
const raw=read(nativePath) as NativeReport;const config=read(configPath);const projection=read(option('--projection','docs/dev/learning-units-mathematics-native-source-projection.json')!)
const catalog=read('curricula/DE/Gymnasium/learning-units/catalog.json') as UnitCatalog
const baseline=prepareStableOfferBindings(raw,projection,config,catalog)
assert.ok(!('app/scripts/learningUnitsMathStableOfferBindings.ts' in projection.inputs), 'Runtime acceptance CLI unexpectedly entered normative projection inputs')
const definitions=catalog.contracts.map((entry)=>read(`curricula/${entry.path}`) as UnitDefinition)
const runtime=validateFreshNativeOfferRuntime(raw,baseline.binder,config,definitions)
const runtimeOnly={learningUnitCatalogQuarantines:raw.learningUnitCatalogQuarantines,
 globalRecognitionAtEmptyMastery:raw.globalRecognitionAtEmptyMastery,
 scopes:raw.scopes.map((row)=>({scopeId:row.scopeId,learningUnitReadModel:row.learningUnitReadModel}))}
const nonempty=runtimeOnly.scopes.findIndex((row)=>row.learningUnitReadModel.units.length>0)
assert.ok(nonempty>=0)
const mutations:Array<[string,(value:typeof runtimeOnly)=>void]>=[
 ['unavailable binding',value=>{value.scopes[0].learningUnitReadModel.offerBinding.status='unavailable'}],
 ['unavailable read model',value=>{value.scopes[0].learningUnitReadModel.calculationStatus='unavailable'}],
 ['old revision',value=>{value.scopes[0].learningUnitReadModel.offerBinding.revision='old-revision'}],
 ['wrong roots',value=>{value.scopes[nonempty].learningUnitReadModel.offerBinding.rootContractRefs=[]}],
 ['missing row',value=>{value.scopes.pop()}],
 ['duplicate row',value=>{value.scopes[value.scopes.length-1]=value.scopes[0]}],
 ['unexpected quarantine',value=>{value.learningUnitCatalogQuarantines={'contract@revision':'unexpected quarantine'}}],
 ['recognized at empty mastery',value=>{value.globalRecognitionAtEmptyMastery=['unexpected-goal']}],
 ['missing selected unit',value=>{value.scopes[nonempty].learningUnitReadModel.units.pop()}],
 ['unexpected unit',value=>{value.scopes[0].learningUnitReadModel.units.push({contractId:'unselected',revision:'v1'})}],
]
for(const[label,mutate]of mutations){const value=structuredClone(runtimeOnly);mutate(value)
 assert.throws(()=>validateFreshNativeOfferRuntime(value,baseline.binder,config,definitions),label)}
const parent={contractId:'parent',revision:'v1'},child={contractId:'child',revision:'v1'}
const fixtureScope={jurisdiction:'DE-HE',stage:'SekI',durationModel:null,courseProfile:null}
const fixtureBinder={revision:'fixture-v1',offers:[{scope:fixtureScope,rootContractRefs:[parent]}]}
const fixtureRaw={learningUnitCatalogQuarantines:{},globalRecognitionAtEmptyMastery:[],scopes:[{scopeId:'DE-HE/SekI//',
 learningUnitReadModel:{calculationStatus:'valid',offerBinding:{status:'valid',revision:'fixture-v1',scopeKey:fixtureScope,rootContractRefs:[parent]},units:[parent,child]}}]}
const fixtureDefinitions=[{...parent,requiredChildContractRefs:[child]},{...child,requiredChildContractRefs:[]}]
assert.equal(validateFreshNativeOfferRuntime(fixtureRaw,fixtureBinder,{revision:'fixture-v1'},fixtureDefinitions).unitScopePairs,2)
const missingChild=structuredClone(fixtureRaw);missingChild.scopes[0].learningUnitReadModel.units.pop()
assert.throws(()=>validateFreshNativeOfferRuntime(missingChild,fixtureBinder,{revision:'fixture-v1'},fixtureDefinitions),/units differ/)
const changed=structuredClone(raw)
changed.catalogAdmissionMeasurement={elapsedNanos:999,usedHeapBeforeBytes:7,usedHeapAfterBytes:12}
changed.globalRecognitionAtEmptyMastery=['diagnostic-only']
changed.actualContractEvaluations=[{differentRunDiagnostic:true}] as unknown as NativeReport['actualContractEvaluations']
changed.nativeMapperInputSha256['curricula/DE/Gymnasium/learning-units/catalog.json']='a'.repeat(64)
changed.nativeMapperInputSha256['curricula/DE/Gymnasium/learning-units/offers/proof-only-diagnostic.json']='b'.repeat(64)
changed.scopes.forEach((row)=>{row.learningUnitReadModel={different:true} as unknown as NativeReadModel;row.nativeOfferContext={different:true} as unknown as NativeRow['nativeOfferContext']})
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
 freshRuntimeCheck:runtime,freshRuntimeAdversarialCasesRejected:mutations.length,recursiveChildMaterializationChecked:true,
 boundary:'In-memory adversarial checks with current real source files. Actual post-activation native/API182 and fresh binder --check remain separate gates.'}
const output=option('--output');if(output)writeFileSync(resolve(repo,output),JSON.stringify(report,null,2)+'\n')
console.log(canonicalJson(report))
