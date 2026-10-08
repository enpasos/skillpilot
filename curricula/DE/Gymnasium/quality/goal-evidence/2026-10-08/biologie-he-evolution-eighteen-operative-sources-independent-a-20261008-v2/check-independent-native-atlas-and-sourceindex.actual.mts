import { readFileSync,writeFileSync } from 'node:fs'
import { dirname,relative } from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
const own=relative(process.cwd(),dirname(new URL(import.meta.url).pathname))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const write=(n:string,v:any)=>writeFileSync(`${own}/${n}`,JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const sha=(v:string)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const bcfg=read(`${own}/native-inputs/atlas.before-source-change.native-config.actual.json`),fcfg=read(`${own}/native-inputs/atlas.portable-final-after-source-change.native-config.actual.json`)
const b=buildGoalBookSourceAtlasInputs(bcfg),f=buildGoalBookSourceAtlasInputs(fcfg)
assert.deepEqual(b.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})),f.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})))
assert.deepEqual(b.receipt.counts,f.receipt.counts)
write('atlas.final.whole-native-receipt.actual.json',f.receipt)
const ids=new Set(read(`${own}/native-inputs/targeted-eighteen-operative-source-before-after.author.json`).deltas.map((x:any)=>x.canonicalGoalId))
const allIds=[...new Set(b.receipt.scopes.flatMap(s=>s.goalIds))]
// The source-index API only consumes IDs, whole canonical containment and
// applicability. These requests come directly from the real native atlas;
// this is an engineering consumer probe, not a goal-book model/build verdict.
const pages=allIds.map(goalId=>({goalId,applicability:b.receipt.scopes.filter(s=>s.goalIds.includes(goalId)).map(s=>({jurisdiction:s.jurisdiction,scopes:[{stage:s.stage,durationModel:null,courseProfile:s.courseProfile}]}))}))
const model:any={book:{id:bcfg.bookId,landscapeId:read(bcfg.landscapePath).landscapeId},source:{landscapePath:bcfg.landscapePath},digest:sha(JSON.stringify(pages)),pages}
write('source-consumer.whole-current-atlas-derived-engineering-requests.actual.json',{schemaVersion:1,probeType:'Existing native source-index API; requests derived from actual native source-atlas output, not a publication model or review verdict',bookId:bcfg.bookId,landscapeId:model.book.landscapeId,canonicalPath:bcfg.landscapePath,pages,fullBookBuilt:false,humanApproval:false})
const before=buildGoalBookOriginalSources(model,process.cwd(),bcfg.mappingPaths),after=buildGoalBookOriginalSources(model,process.cwd(),fcfg.mappingPaths)
write('source-consumer.before.whole-native-index.actual.json',before);write('source-consumer.final.whole-native-index.actual.json',after)
const normalize=(index:any,gid:string)=>{
 const evidence=new Map(index.evidence.map((x:any)=>[x.id,x])),docs=new Map(index.documents.map((x:any)=>[x.id,x]))
 return index.goals[gid].map((r:any)=>({...r,evidenceIds:undefined,evidence:r.evidenceIds.map((id:string)=>{const e:any=evidence.get(id);return {...e,id:undefined,documentId:undefined,document:{...(docs.get(e.documentId) as any),id:undefined}}}).sort((a:any,b:any)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))}))
}
const changed:string[]=[],others:string[]=[]
for(const gid of allIds){
 const a=normalize(before,gid),z=normalize(after,gid)
 if(JSON.stringify(a)!==JSON.stringify(z)){changed.push(gid);if(!ids.has(gid))others.push(gid)}
}
assert.deepEqual(others,[])
assert.equal(changed.length,18)
for(const id of ['80b42b5f-4b20-5035-907f-974a4a88618b','28b4ae51-e3f7-5abc-a363-022114f50f0f','3accc03b-3daf-5119-9f33-93af6f709919']){
 const refs=normalize(after,id).flatMap((s:any)=>s.evidence).filter((e:any)=>e.sourceScope.jurisdiction==='DE-HE')
 assert.ok(refs.length>0&&refs.every((e:any)=>e.sourceRef.includes('nicht verpflichtende Zusatzmodellvertiefung')))
}
const ns=normalize(after,'934d496d-eda4-5835-96d6-389885b93a51').flatMap((s:any)=>s.evidence).filter((e:any)=>e.sourceScope.jurisdiction==='DE-HE')
assert.ok(ns.length>0&&ns.every((e:any)=>e.sourceRef.includes('Optionales Themenfeld Q2.2 LK')))
write('source-consumer.final-stable-identity.native-verdict.actual.json',{schemaVersion:1,nativeAPIs:['buildGoalBookSourceAtlasInputs','buildGoalBookOriginalSources'],probeType:'Frozen author391 atlas-derived applicability requests; not the live post-HE12 universe; no complete book model/build claim',nativeSourceViews:f.receipt.counts.sourceViews,nativeNavigationViews:1,memoryVisibilityScopesAlreadyChecked:8,totalViewConsumersChecked:31,frozenAuthor391ProbeGoalCount:allIds.length,changedSourceContextGoalIds:changed,otherGoalSourceContextChanges:others,allScopeGoalIdSetsExact:true,explicitNonMandatoryModelReferencesPassed:3,explicitOptionalQ22ReferencesPassed:1,fullBookBuilt:false,currentD_PPageContextBindingsRequireTargetedReviews:true,sourceIndependentApprovals:0,activeWrites:0,humanApproval:false})
console.log(JSON.stringify({nativeSourceViews:f.receipt.counts.sourceViews,totalViewConsumersChecked:31,frozenAuthor391ProbeGoalCount:allIds.length,changedSourceContexts:changed.length,otherSourceContextChanges:0,allScopeGoalIdSetsExact:true,activeWrites:0}))
