// SPDX-License-Identifier: Apache-2.0
// Independent source-candidate check. No review ledger or active curriculum write.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '../../../../../../..')
const candidate = resolve(here, '../biologie-ni-five-existing-source-prerequisite-fixes-candidate-v1')
const basePath = resolve(here, '../biologie-ni-five-current-adoption-candidate-v3/canonical.biologie.candidate.json')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const digest = (path: string) => 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex')
const activePath = resolve(repo, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const active = read(activePath), base = read(basePath)
const delta = read(resolve(candidate, 'one-existing-prerequisite.before-after.candidate.json'))
const templates = read(resolve(candidate, 'four-missing-seki.goal-templates.candidate.json')).goalTemplates
const authoredAfter = read(resolve(candidate, 'canonical.edge-only.inactive.candidate.json'))
const after = structuredClone(base)
const goal = after.goals.find((g: any) => g.id === delta.goalId)
assert.deepEqual(goal.requires, delta.before)
goal.requires = [...delta.after]
assert.deepEqual(after, authoredAfter)
assert.equal(active.goals.length, 441)
assert.equal(base.goals.length, 446)
const existingDifferences = active.goals.map((g: any) => {
 const bg = base.goals.find((b: any) => b.id === g.id)
 assert(bg)
 return {goalId:g.id, fields:Object.keys({...g,...bg}).filter(k=>JSON.stringify(g[k])!==JSON.stringify(bg[k]))}
}).filter((r: any)=>r.fields.length)
assert.equal(existingDifferences.length,2)
assert(existingDifferences.every((r:any)=>r.fields.length===1&&r.fields[0]==='contains'))
const dna='0daa79f6-8f61-5506-98f9-65db83062ba8', protein='475eebb4-4eb0-524f-b1ec-4a672bf856d2'
const endpoints=['0db20819-ee94-54c6-8ecb-aff8c9b7419e',delta.goalId,'9dff0360-c2e9-5e43-af8b-87e264281cf7','9f73b963-5fac-5a90-a993-d7b7c0cc8526','ffef97e3-12d6-5090-9816-46ab9e57fae2']
const native=(landscape:any)=> {
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
  assert(!open.has(id),'Native effective-requires cycle '+[...path,id].join(' -> '))
  if(done.has(id))return
  open.add(id);for(const r of n.get(id).eff)visit(r,[...path,id]);open.delete(id);done.add(id)
 }
 for(const id of n.keys())visit(id,[])
 return {nodesChecked:done.size,canonicalErrors:[],canonicalWarnings:diag.filter((d:any)=>d.severity!=='error'),missingEffectiveReferences:[],effectiveRequiresCycles:[]}
}
const closure=(n:Map<string,any>,id:string,seen=new Set<string>()):Set<string>=> {
 if(seen.has(id))return seen
 seen.add(id);for(const r of n.get(id).eff)closure(n,r,seen);return seen
}
const actualPath=(n:Map<string,any>,id:string,target:string,seen=new Set<string>()):string[]|null=>{
 if(id===target)return[id]
 if(seen.has(id))return null
 seen.add(id)
 for(const r of n.get(id).eff){const path=actualPath(n,r,target,seen);if(path)return[id,...path]}
 return null
}
const beforeNative=native(base),afterNative=native(after),activeNative=native(active)
const contexts=(n:Map<string,any>,id:string)=>({directRequires:n.get(id).direct,effectiveRequires:n.get(id).eff,transitiveRequires:[...closure(n,id)].filter(r=>r!==id).sort(),reverseEffectiveRequires:[...n].filter(([,g])=>g.eff.includes(id)).map(([i])=>i).sort()})
const changed=[...beforeNative.keys()].map(goalId=>({goalId,title:beforeNative.get(goalId).title,before:contexts(beforeNative,goalId),after:contexts(afterNative,goalId)})).filter(r=>JSON.stringify(r.before)!==JSON.stringify(r.after))
const checkedTemplates=structuredClone(after)
const temp=new Map<string,string>(templates.map((t:any)=>[t.candidateKey,'independent-source-a-check-only:'+t.candidateKey]))
for(const t of templates){assert.equal(t.id,null);checkedTemplates.goals.push({id:temp.get(t.candidateKey),title:t.title,titleEn:t.titleEn,description:t.description,descriptionEn:t.descriptionEn,contains:[],requires:[...t.requires,...t.requiresCandidateKeys.map((k:string)=>temp.get(k))],tags:t.tags,type:t.type,weight:t.weight,applicability:t.applicability})}
const templateNative=native(checkedTemplates)
const templatePaths=templates.map((t:any)=>{
 const id=temp.get(t.candidateKey)!,cl=[...closure(templateNative,id)].filter(r=>r!==id)
 assert(!cl.includes(dna)&&!cl.includes(protein))
 return {candidateKey:t.candidateKey,stableId:null,nativeEffectiveRequires:templateNative.get(id).eff,transitivePrerequisites:cl.map(goalId=>({goalId:goalId.startsWith('independent-source-a-check-only:')?null:goalId,candidateKey:goalId.startsWith('independent-source-a-check-only:')?goalId.slice('independent-source-a-check-only:'.length):null,title:templateNative.get(goalId).title})),DNAPath:actualPath(templateNative,id,dna),proteinPath:actualPath(templateNative,id,protein)}
})
const combinedChanged=[...beforeNative.keys()].filter(id=>JSON.stringify(contexts(beforeNative,id))!==JSON.stringify(contexts(templateNative,id)))
const result={status:'independent_native_targeted_check_pass',reviewType:'source_candidate_review',inputs:[activePath,basePath,...['one-existing-prerequisite.before-after.candidate.json','four-missing-seki.goal-templates.candidate.json','canonical.edge-only.inactive.candidate.json'].map(f=>resolve(candidate,f))].map(path=>({path:path.slice(repo.length+1),digest:digest(path)})),nativeFunctions:['prepareLandscapeEntries','normalizeCanonicalLandscape','validateCanonicalLandscape'],active441:check(active,activeNative),base446:check(base,beforeNative),edgeOnly446:check(after,afterNative),temporaryUnplaced450:check(checkedTemplates,templateNative),actualExistingDelta:delta.goalId,onlyRequiresChanged:true,preservedDEENBodies:true,existingActiveToNI5BaseChanges:existingDifferences,pedigreeAfterContext:contexts(afterNative,delta.goalId),fiveEndpointsDNAPaths:endpoints.map(goalId=>({goalId,before:actualPath(beforeNative,goalId,dna),after:actualPath(afterNative,goalId,dna),proteinAfter:actualPath(afterNative,goalId,protein)})),edgeOnlyContextChangeCount:changed.length,edgeOnlyContextChanges:changed,combinedExistingContextChangeCount:combinedChanged.length,combinedExistingChangedContextGoalIds:combinedChanged,templatePaths,limits:['Canonical validator checks contains/references/types; effective-requires DAG checked separately with actual inherited prerequisites.','450-model templates have no final contains placement: this result cannot prove final composition-view/stage/parent-inheritance readiness.','Source-retarget mapping/view changes are not materialized; full source coverage is not approved.','No native current BookModel D review, P read/write, image V review, global QA build, M7 or human approval.'],PContentsRead:false,foreignReviewOutputsRead:false,humanApproval:false,activeWrites:0}
assert(!closure(afterNative,delta.goalId).has(dna))
assert(!closure(afterNative,delta.goalId).has(protein))
assert.equal(result.fiveEndpointsDNAPaths.filter(r=>r.before).length,5)
assert.equal(result.fiveEndpointsDNAPaths.filter(r=>r.after).length,2)
assert.equal(changed.length,15)
assert.equal(combinedChanged.length,20)
writeFileSync(resolve(here,'native-independent.receipt.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({nativeEffectiveRequiresDAG:'PASS',activeNodes:441,baseNodes:446,edgeNodes:446,temporaryUnplacedNodes:450,pedigreeDNARemoved:true,edgeOnlyDNAPathsRemoved:3,globalMolecularEndpointsRetained:2,edgeContexts:changed.length,combinedExistingContexts:combinedChanged.length,activeWrites:0}))
