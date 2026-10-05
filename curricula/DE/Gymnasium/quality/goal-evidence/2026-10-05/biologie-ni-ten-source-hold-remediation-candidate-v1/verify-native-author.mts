// SPDX-License-Identifier: Apache-2.0
// Targeted author candidate check; no active curriculum or review ledger writes.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
const here=dirname(fileURLToPath(import.meta.url)),repo=resolve(here,'../../../../../../..')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const hash=(v:any):string=>'sha256:'+createHash('sha256').update(JSON.stringify(v)).digest('hex')
const activePath=resolve(repo,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const basePath=resolve(here,'../biologie-ni-five-current-adoption-candidate-v3/canonical.biologie.candidate.json')
const afterPath=resolve(here,'canonical.existing-two-changes.inactive.candidate.json')
const active=read(activePath),base=read(basePath),after=read(afterPath)
const newTemplates=read(resolve(here,'nine-missing-performance.DEEN.goal-templates.candidate.json')).goalTemplates
const priorTemplates=read(resolve(here,'four-prior-templates.referenced.candidate.json')).goalTemplatesCopiedWithoutSemanticChange
const memoryTemplates=read(resolve(here,'two-memory-goals.DEEN.templates.candidate.json')).goalTemplates
const templates=[...priorTemplates,...newTemplates,...memoryTemplates]
assert.equal(templates.length,15)
const tempIds=new Map<string,string>(templates.map((t:any)=>[t.candidateKey,'author-check-only:'+t.candidateKey]))
const temporary=structuredClone(after)
for(const t of templates){
 assert.equal(t.id,null)
 for(const key of t.requiresCandidateKeys)assert(tempIds.has(key),key)
 temporary.goals.push({id:tempIds.get(t.candidateKey),title:t.title,titleEn:t.titleEn,description:t.description,descriptionEn:t.descriptionEn,
  contains:[],requires:[...t.requires,...t.requiresCandidateKeys.map((k:string)=>tempIds.get(k))],tags:t.tags,type:t.type,weight:t.weight,
  applicability:t.applicability,...(t.nodeKind?{nodeKind:t.nodeKind}:{})})
}
const native=(landscape:any)=>{
 const prepared=prepareLandscapeEntries([landscape])[0]
 const strip=(id:string)=>id.startsWith(landscape.landscapeId+':')?id.slice(landscape.landscapeId.length+1):id
 return new Map<string,any>(prepared.goals.map((g:any)=>[g.id,{...g,eff:(g.effectiveRequires??[]).map(strip),direct:(g.requires??[]).map(strip)}]))
}
const check=(landscape:any,n:Map<string,any>)=>{
 const diag=validateCanonicalLandscape(normalizeCanonicalLandscape(landscape))
 assert.deepEqual(diag.filter((d:any)=>d.severity==='error'),[])
 const done=new Set<string>(),open=new Set<string>()
 const visit=(id:string,path:string[])=>{
  assert(n.has(id),'Missing native reference '+id)
  assert(!open.has(id),'EffectiveRequires cycle '+[...path,id].join(' -> '))
  if(done.has(id))return
  open.add(id);for(const r of n.get(id).eff)visit(r,[...path,id]);open.delete(id);done.add(id)
 }
 for(const id of n.keys())visit(id,[])
 return {nodesChecked:done.size,canonicalErrors:[],canonicalWarnings:diag.filter((d:any)=>d.severity!=='error'),missingEffectiveReferences:[],effectiveRequiresCycles:[]}
}
const closure=(n:Map<string,any>,id:string,seen=new Set<string>()):Set<string>=>{
 if(seen.has(id))return seen
 seen.add(id);for(const r of n.get(id).eff)closure(n,r,seen);return seen
}
const path=(n:Map<string,any>,id:string,target:string,seen=new Set<string>()):string[]|null=>{
 if(id===target)return[id]
 if(seen.has(id))return null
 seen.add(id)
 for(const r of n.get(id).eff){const p=path(n,r,target,seen);if(p)return[id,...p]}
 return null
}
const nb=native(base),na=native(after),nt=native(temporary),nact=native(active)
const dna='0daa79f6-8f61-5506-98f9-65db83062ba8',protein='475eebb4-4eb0-524f-b1ec-4a672bf856d2'
const pedigree='440854be-7f06-5678-91cb-ba8dcab56959',evo='9f73b963-5fac-5a90-a993-d7b7c0cc8526',identify='0380f992-723a-513d-8c3f-8ca7f8e0394f'
const context=(n:Map<string,any>,id:string)=>{
 const prereqs=[...closure(n,id)].filter(i=>i!==id).sort()
 const reverse=[...n].filter(([,g])=>g.eff.includes(id)).map(([i])=>i).sort()
 const data={goal:n.get(id),nativeEffectiveRequires:n.get(id).eff,transitivePrerequisiteBodies:prereqs.map(i=>n.get(i)),reverseEffectiveRequireBodies:reverse.map(i=>n.get(i))}
 return {sha256:hash(data),goalId:id,nativeEffectiveRequires:n.get(id).eff,transitivePrerequisites:prereqs,reverseEffectiveRequires:reverse,recipe:'JSON.stringify({goal:actualPreparedGoal,nativeEffectiveRequires,transitivePrerequisiteBodies:sortedIDsMappedToPreparedBodies,reverseEffectiveRequireBodies:sortedIDsMappedToPreparedBodies}); sha256, author-context fingerprint only'}
}
const changed=base.goals.map((g:any)=>{
 const ag=after.goals.find((x:any)=>x.id===g.id)
 return {goalId:g.id,fields:Object.keys({...g,...ag}).filter(k=>JSON.stringify(g[k])!==JSON.stringify(ag[k]))}
}).filter((g:any)=>g.fields.length)
assert.deepEqual(changed,[{goalId:pedigree,fields:['requires']},{goalId:evo,fields:['description','descriptionEn']}])
assert.deepEqual(nb.get(evo).eff,na.get(evo).eff)
assert(path(na,evo,dna)&&path(na,evo,protein))
const candidatePaths=templates.map((t:any)=>{
 const id=tempIds.get(t.candidateKey)!
 assert.equal(path(nt,id,dna),null)
 assert.equal(path(nt,id,protein),null)
 return {candidateKey:t.candidateKey,stableId:null,kind:t.nodeKind==='memory'?'memory':'ordinary',gradeBand:t.gradeBand,
  ...context(nt,id),DNAPath:null,proteinPath:null,unplaced:true}
})
const sourceExisting=[identify,pedigree].map(goalId=>{
 assert.equal(path(na,goalId,dna),null);assert.equal(path(na,goalId,protein),null)
 return {...context(na,goalId),DNAPath:null,proteinPath:null}
})
const currentContextChanges=base.goals.map((g:any)=>({goalId:g.id,title:g.title,before:context(nb,g.id),after:context(na,g.id)})).filter((x:any)=>x.before.sha256!==x.after.sha256)
const closestRejected='f95b3b49-dacd-5d17-be2d-98b404b709c3'
const photo='860c80f9-e463-598b-8ef8-79f65c12f235'
assert(path(nb,closestRejected,photo))
const result={status:'targeted_native_author_candidate_pass',role:'candidate_author',reviewType:'author_targeted_native_check_not_D',
 inputs:[activePath,basePath,afterPath,...['nine-missing-performance.DEEN.goal-templates.candidate.json','four-prior-templates.referenced.candidate.json','two-memory-goals.DEEN.templates.candidate.json'].map(f=>resolve(here,f))].map(p=>({path:p.slice(repo.length+1),sha256:digest(p)})),
 nativeFunctions:['prepareLandscapeEntries','normalizeCanonicalLandscape','validateCanonicalLandscape'],
 active441:check(active,nact),base446:check(base,nb),existingTwoChanges446:check(after,na),temporaryUnplaced461:check(temporary,nt),
 existingSemanticChanges:changed,global9fRequiresPreserved:true,global9fDNAPathRetained:path(na,evo,dna),global9fProteinPathRetained:path(na,evo,protein),
 sourceExistingPaths:sourceExisting,all15CandidatePaths:candidatePaths,currentExistingContextChangeCount:currentContextChanges.length,currentExistingContextChanges:currentContextChanges,
 closestRejectedSpeciesReuse:{goalId:closestRejected,actualEffectiveContext:context(nb,closestRejected),photosynthesisClusterPath:path(nb,closestRejected,photo),
  authorReason:'Broad habitat scope plus inherited photosynthesis/cell-respiration route is not a neutral NI5/6 selected-tree memory performance.'},
 limits:['461-check uses temporary IDs and unplaced templates, not stable public goal IDs.',
 'Final parent placement, cluster inheritance, composition views and configured Memory visibility are not checked or approved.',
 'Semantic fingerprints here bind the native prepared bodies and effective prerequisites; they are not official D/A/M/P ledger fingerprints.',
 'All 16 routes are proposals; existing 440 full diploidy/recombination source context needs a fresh reviewer judgement.',
 'Global9f regional-source rebinding remains open; retaining its molecular route prevents NI source reuse.',
 'No global QS/build, P, independent native Book-D, V, HumanApproval or M7 claim.'],
 PContentsRead:false,PContentsCreated:false,activeWrites:0,humanApproval:false}
writeFileSync(resolve(here,'native-author.receipt.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({nativeEffectiveRequiresDAG:'PASS',active:441,base:446,existingAfter:446,temporaryUnplaced:461,ordinaryTemplates:13,memoryTemplates:2,NIPathsToDNA:0,global9fMolecularPathRetained:true,existingChangedNativeContexts:currentContextChanges.length,activeWrites:0}))
