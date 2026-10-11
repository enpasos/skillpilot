import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
const root=process.cwd()
const pkg='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-child-full-memory-source-author-successor-20261011-v5'
const cap=resolve(root,'tmp/m7-resumption-20261011/b007-v5-author/capsule')
const mod=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const atlas=await import(pathToFileURL(resolve(root,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const read=async(p:string)=>JSON.parse(await readFile(resolve(root,p),'utf8'))
const write=async(p:string,v:any)=>{await mkdir(dirname(resolve(root,p)),{recursive:true}); await writeFile(resolve(root,p),JSON.stringify(v,null,2)+'\n');await read(p)}
const cfg=await read(`${pkg}/candidate/source-atlas.normal-helper.inactive.inputs.json`)
const kinds=await read(cfg.semanticKindLedgerPath)
const whole=await read(cfg.landscapePath)
const memory=whole.goals.find((g:any)=>g.id==='1e372b97-6f1c-596c-8a8b-fc03193d784a')
const kind=kinds.decisions.find((g:any)=>g.goalId===memory.id)
const originalKinds=await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-image-current-native-technical-author-successor-20261011-v3/candidate/semantic-kinds.current523.native-path.inactive.json')
const oldFingerprint=originalKinds.decisions.find((g:any)=>g.goalId===memory.id).sourceFingerprint
kind.sourceFingerprint=mod.fingerprintSemanticKindSourceGoal(memory)
await write(cfg.semanticKindLedgerPath,kinds)
await write(`${pkg}/checks/one-memory-source-path-semantic-kind-technical-binding.actual.json`,{role:'Technical binding of one unchanged memory classification to inactive DE15 source path; no new scientific review',goalId:memory.id,semanticKind:kind.semanticKind,oldSourceFingerprint:oldFingerprint,newSourceFingerprint:kind.sourceFingerprint,onlyCanonicalChange:'extendedData.vocabularySource',other522DecisionsUnchanged:true,independentScienceReviewStatus:'pending'})
const derived=atlas.buildGoalBookSourceAtlasInputs(cfg,root)
assert.deepEqual(derived.receipt.counts,{canonicalCurricularAtomicGoals:402,publishedCurricularAtomicGoals:382,sourceViews:48,unresolvedSourceScopeDecisions:496,omittedGoals:20})
const manifest=await read(`${pkg}/candidate/source-atlas.closed-carriers.sources.json`)
let carrierCount=0
let exactGeneratedCarriers=0
const retainedAuthoredCarrierDifferences=[]
const entryIds=(node:any):string[]=>Array.isArray(node)?node.flatMap(entryIds):node&&typeof node==='object'?[...(node.kind==='goalEntry'?[node.goalId]:[]),...Object.values(node).flatMap(entryIds)]:[]
for (const path of manifest.sourcePaths){
 const carrier=await read(path)
 const legacy=JSON.parse(derived.outputs[`${cfg.outputDirectory}/${carrier.viewId}.view.json`])
 const {$schema,...rest}=carrier
 if(carrier.viewId==='de-gym-chemie-bundesweit-source-de-he-seki'){
   const authored=[...new Set(entryIds(carrier))].sort()
   const generated=[...new Set(entryIds(legacy))].sort()
   assert.deepEqual(authored.filter(x=>!generated.includes(x)),['413040cd-ba74-5227-948c-a778b0bd0f56'])
   assert.deepEqual(generated.filter(x=>!authored.includes(x)),[])
   assert.deepEqual(carrier.scope,legacy.scope)
   retainedAuthoredCarrierDifferences.push({path,reason:'Retained v4 authored HE structural groups and optional solubility atom; the normal source generator flat HE view omits that optional atom. Actual source judgment is pending.',authoredExtraGoalIds:['413040cd-ba74-5227-948c-a778b0bd0f56'],sourceScienceApproval:false,targetIds:authored})
 }else{assert.deepEqual(rest,legacy);exactGeneratedCarriers++}
 carrierCount++
}
assert.equal(carrierCount,48)
const carrierUnion=[...new Set((await Promise.all(manifest.sourcePaths.map(read))).flatMap(entryIds))].sort()
const generatedUnion=[...new Set(derived.receipt.scopes.flatMap((s:any)=>s.goalIds))].sort()
assert.deepEqual(carrierUnion,generatedUnion)
const oldDebt=await read(`${pkg}/review-inputs/source-debt.current-and-v4.exact-facts.json`)
assert.deepEqual(derived.receipt.omittedGoals,oldDebt.sourceAtlasComparison.omitted20.map((x:any)=>({goalId:x.goalId,reason:x.reason})))
await write(`${pkg}/checks/normal-source-atlas.compact.actual.json`,atlas.compactGoalBookSourceAtlasReceipt(derived.receipt))
const results=[]
for (const [kind,name,n] of [['source382','native-current-source-atlas382.closed-carriers.inactive.config.json',382],['whole402','native-current-whole402.inactive.config.json',402]] as const){
 const inputs=await mod.loadGoalBookBuildInputs(`${pkg}/candidate/${name}`,cap)
 mod.parseAndValidateGoalBookModel(inputs.model)
 assert.equal(inputs.model.pages.length,n)
 await write(`${pkg}/native/${kind}.normal.book-model.json`,inputs.model)
 results.push({kind,pages:n,digest:inputs.model.digest,config:`${pkg}/candidate/${name}`,normalLoaderAndModelValidation:'PASS',scienceApproval:false})
}
const model=await read(`${pkg}/native/whole402.normal.book-model.json`)
const raw=await read(`${pkg}/review-inputs/raw-fourteen-native-whole-pages.neutral.json`)
const old=await read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-image-current-native-technical-author-successor-20261011-v3/native/current-whole-normal-selected-pages-and-protected-contexts.author.json')
const ids=[...old.sixCurrentImagePages.map((p:any)=>p.goalId),...old.eightProtectedContexts.map((p:any)=>p.goalId)]
const selected=model.pages.filter((p:any)=>ids.includes(p.goalId))
assert.equal(selected.length,14)
for(const page of selected){
 const prior=old.sixCurrentImagePages.find((p:any)=>p.goalId===page.goalId)??old.eightProtectedContexts.find((p:any)=>p.goalId===page.goalId)?.currentWholeNormalNativePage
 assert.deepEqual(page,prior)
}
await write(`${pkg}/review-inputs/raw-current402-fourteen-normal-whole-pages.neutral.json`,{schemaVersion:1,role:'Actual v5 normal current402 page objects; no scientific judgments',modelDigest:model.digest,pages:selected})
await write(`${pkg}/checks/normal-source382-whole402-and-fourteen-page-preservation.actual.json`,{schemaVersion:1,role:'bounded technical normal source/model proof only',results,closedCarrierCount:48,exactGeneratedCarriers,retainedAuthoredCarrierDifferences,omitted20IdsAndReasonsExact:true,unresolvedRows:496,selected14WholePagesExactToPrior402NormalModel:true,independentScienceApprovalsAdded:0,humanApproval:false,strictGain:0})
console.log(JSON.stringify({normalSourceAtlasCounts:derived.receipt.counts,normalModels:results,actual14PagesExact:true,scienceApprovals:0}))
