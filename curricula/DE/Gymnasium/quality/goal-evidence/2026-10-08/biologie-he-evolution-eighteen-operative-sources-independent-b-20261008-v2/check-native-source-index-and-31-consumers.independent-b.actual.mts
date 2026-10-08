import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative} from 'node:path'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
const own=relative(process.cwd(),dirname(new URL(import.meta.url).pathname)),a=`${own}/input-snapshots/author`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(n:string,v:any)=>writeFileSync(`${own}/${n}`,JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const bc=read(`${own}/atlas.before.independent-b.native-config.json`),ac=read(`${own}/atlas.after.independent-b.native-config.json`)
const before=buildGoalBookSourceAtlasInputs(bc),after=buildGoalBookSourceAtlasInputs(ac)
assert.deepEqual(before.receipt.counts,after.receipt.counts)
assert.deepEqual(before.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds})),after.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds})))
write('native-atlas-before.whole.actual.json',before.receipt);write('native-atlas-after.whole.actual.json',after.receipt)
const ids=[...new Set(before.receipt.scopes.flatMap((s:any)=>s.goalIds))] as string[]
assert.equal(ids.length,391)
const selected=read(`${own}/first-eighteen-operative-source-judgment.independent-b.json`).decisions.map((d:any)=>d.canonicalGoalId)
const pages=ids.map(goalId=>({goalId,applicability:before.receipt.scopes.filter((s:any)=>s.goalIds.includes(goalId)).map((s:any)=>({jurisdiction:s.jurisdiction,scopes:[{stage:s.stage,durationModel:null,courseProfile:s.courseProfile}]}))}))
const model:any={book:{id:bc.bookId,landscapeId:read(bc.landscapePath).landscapeId},source:{landscapePath:bc.landscapePath},digest:'sha256:'+createHash('sha256').update(JSON.stringify(pages)).digest('hex'),pages}
const ib=buildGoalBookOriginalSources(model,process.cwd(),bc.mappingPaths),ia=buildGoalBookOriginalSources(model,process.cwd(),ac.mappingPaths)
write('native-source-index-before.whole.actual.json',ib);write('native-source-index-after.whole.actual.json',ia)
const normalize=(index:any,gid:string)=>{
 const evidence=new Map(index.evidence.map((x:any)=>[x.id,x])),docs=new Map(index.documents.map((x:any)=>[x.id,x]))
 return index.goals[gid].map((s:any)=>({...s,evidenceIds:undefined,evidence:s.evidenceIds.map((id:string)=>{const e:any=evidence.get(id);return {...e,id:undefined,documentId:undefined,document:{...(docs.get(e.documentId) as any),id:undefined}}}).sort((x:any,y:any)=>JSON.stringify(x).localeCompare(JSON.stringify(y)))})).sort((x:any,y:any)=>JSON.stringify(x).localeCompare(JSON.stringify(y)))
}
const changed=ids.filter(g=>JSON.stringify(normalize(ib,g))!==JSON.stringify(normalize(ia,g)))
assert.deepEqual([...changed].sort(),[...selected].sort())
const author=read(`${a}/source-consumer.final.whole-native-index.actual.json`)
for(const g of ids) assert.deepEqual(normalize(ia,g),normalize(author,g))
const contexts=selected.map((goalId:string)=>({goalId,wholeSourceIndexContext:normalize(ia,goalId)}))
write('native-eighteen-whole-source-index-contexts.independent-b.actual.json',{contexts,independentAPIRun:true,wholeSelectedContextCount:18,scientificOtherJurisdictionSourcesApproved:false})
for(const goalId of ['80b42b5f-4b20-5035-907f-974a4a88618b','28b4ae51-e3f7-5abc-a363-022114f50f0f','3accc03b-3daf-5119-9f33-93af6f709919']){
 const refs=normalize(ia,goalId).flatMap((s:any)=>s.evidence).filter((e:any)=>e.sourceScope.jurisdiction==='DE-HE')
 assert.ok(refs.length>0&&refs.every((e:any)=>e.sourceRef.includes('nicht verpflichtende Zusatzmodellvertiefung')))
}
const ns=normalize(ia,'934d496d-eda4-5835-96d6-389885b93a51').flatMap((s:any)=>s.evidence).filter((e:any)=>e.sourceScope.jurisdiction==='DE-HE')
assert.ok(ns.length>0&&ns.every((e:any)=>e.sourceRef.includes('Optionales Themenfeld Q2.2 LK')))
// The eight memory visibility inputs are inherited byte/semantic exact from B's
// genuine earlier review; no new memory decision is generated for a source edit.
const prior='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-q4-evolution-eighteen-whole-science-independent-b-20261008-v1'
const pm=read(`${prior}/M18.retained-native.config.json`),am=read(`${a}/M18.current-whole-source-v2.native-config.actual.json`)
assert.equal(pm.visibilityScopes.length,8);assert.equal(am.visibilityScopes.length,8)
for(const scope of pm.visibilityScopes){
 const name=scope.viewPath.split('/').pop(),next=am.visibilityScopes.find((s:any)=>s.viewPath.endsWith('/'+name));assert.ok(next)
 const authorPath=next.viewPath.replace('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he-evolution-eighteen-operative-sources-author-20261008-v2/',`${a}/`)
 assert.deepEqual(read(scope.viewPath),read(authorPath))
}
assert.equal(read(`${prior}/M18.independent-retained-check.terminal.actual.json`).exitCode,0)
write('native-source-index-and-31-consumer-preservation.actual.json',{nativeAPIs:['buildGoalBookSourceAtlasInputs','buildGoalBookOriginalSources'],newlyGeneratedSourceViews:after.receipt.counts.sourceViews,navigationViews:1,retainedPreviouslyActuallyCheckedMemoryVisibilityScopes:8,totalPreservedViewConsumers:31,all391FrozenAtlasScopeGoalSetsExact:true,wholeCurrentActive392AcceptanceClaim:false,changedCompleteSourceContexts:changed,otherSourceContextChanges:[],allAuthorFinalContextSemanticsIndependentlyReproduced:true,explicitNonMandatoryModelReferences:3,explicitOptionalQ22MisuseReference:1,operativeDecisionLocatorHOLD:18,fullBookBuilt:false,finalDPVAcceptance:false,humanApproval:false,activeWrites:0})
console.log(JSON.stringify({independentNativeSourceViews:after.receipt.counts.sourceViews,navigationViews:1,retainedMemoryScopes:8,totalPreservedConsumers:31,changedSourceContexts:18,otherSourceContextChanges:0,operativeDecisionLocatorHOLD:18}))
