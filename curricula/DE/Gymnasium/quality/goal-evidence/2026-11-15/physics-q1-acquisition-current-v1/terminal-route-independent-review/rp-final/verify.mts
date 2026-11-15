import assert from 'node:assert/strict'
import{readFileSync,readdirSync,writeFileSync}from'node:fs'
import{createHash}from'node:crypto'
import{collectRenderedAtomicGoalIdsFromCompositionView as collect,createRouteProfiles,evaluateRouteProfile}from'../../../app/scripts/generateCurriculumQualityStatus'
import{buildApplicabilityCompilation}from'../../../app/scripts/applicabilityCompiler'
import{collectCompositionProjectionRoleGoalIds,compileCompositionView}from'../../../app/src/utils/authoring/compositionViewAuthoring'
import{normalizeCanonicalLandscape}from'../../../app/src/utils/authoring/canonicalAuthoring'
const O='tmp/pr159-terminal-route-independent-review-20261115/rp-v3-final-review/',read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sort=(xs:Iterable<string>)=>[...new Set(xs)].sort()
const C='curricula/DE/Gymnasium/canonical/',files=readdirSync(C).filter(f=>f.endsWith('.json')).sort().map(f=>C+f),catalog=files.map(read),p=catalog.find(c=>c.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'),goals=new Map<string,any>(catalog.flatMap(c=>c.goals.map((g:any)=>[g.id,g])))
const norm=catalog.map(normalizeCanonicalLandscape),landscapes=new Map(norm.map(c=>[c.landscapeId,c])),universe=normalizeCanonicalLandscape({landscapeId:'rp-v2-independent',title:'Universe',goals:norm.flatMap(c=>c.goals)})
const refs=['72effc66-87f4-5f5e-8d36-1547677365fb','d67502e3-5e0a-595b-a24b-65b1c40de36e','106417ed-80db-5490-a1ee-bb4160d3f2b4','1730c01d-8c85-57df-b031-c11e2a0511b1']
const closure=(seeds:Iterable<string>)=>{const found=new Set<string>(),q=[...seeds];for(const raw of q){const id=raw.split(':').at(-1)!;if(found.has(id))continue;found.add(id);const g=goals.get(id);assert(g,id);q.push(...(g.requires??[]))}return found}
const omitRefs=(v:any)=>{const out=structuredClone(v);const visit=(nodes:any[])=>{for(let i=nodes.length-1;i>=0;i--){const n=nodes[i];if(n.goalId&&refs.includes(n.goalId)&&n.projectionRole==='prerequisiteOnly')nodes.splice(i,1);else if(n.children)visit(n.children)}};visit(out.rootNodes);return out}
const rows=[]
for(const name of ['de-rp-gk.view.json','de-rp-lk.view.json']){
 const beforePath='curricula/DE/Gymnasium/composition-views/physik/'+name,afterPath='tmp/physics-cqr104-consistent-stage-projection-20261115/rp-v3/views/'+name,before=read(beforePath),after=read(afterPath),filters=[before.scope.courseProfile]
 assert.deepEqual(omitRefs(after),omitRefs(before),'Only the exact four prerequisiteOnly references change place; every other node and task placement stays identical')
 const b=collectCompositionProjectionRoleGoalIds(before.rootNodes,goals),a=collectCompositionProjectionRoleGoalIds(after.rootNodes,goals)
 assert.deepEqual(sort(a.targetGoalIds),sort(b.targetGoalIds),'Global target roles unchanged')
 assert.deepEqual(sort(a.prerequisiteOnlyGoalIds),sort(b.prerequisiteOnlyGoalIds),'Global prerequisiteOnly roles unchanged')
 const bs=sort(b.targetGoalIds).filter(id=>!goals.get(id).contains?.length),as=sort(a.targetGoalIds).filter(id=>!goals.get(id).contains?.length),bl=sort(closure(bs)),al=sort(closure(as))
 assert.deepEqual(as,bs);assert.deepEqual(al,bl)
 const stages=['SekI','SekII','CrossStage'].map(stage=>{
  const tb=collect(p,beforePath,filters,false,stage as any,[],catalog),ta=collect(p,afterPath,filters,false,stage as any,[],catalog),vb=collect(p,beforePath,filters,true,stage as any,[],catalog),va=collect(p,afterPath,filters,true,stage as any,[],catalog)
  assert.deepEqual(sort(ta),sort(tb),'All native stage and full target sets unchanged')
  if(stage==='SekI')for(const id of refs)assert(!closure(tb).has(id),'No existing whole target or assessment requires removed stage support')
  return{stage,targetsBefore:tb.size,targetsAfter:ta.size,supportVisibilityRemoved:sort(vb).filter(id=>!va.has(id)),supportVisibilityAdded:sort(va).filter(id=>!vb.has(id))}
 })
 const comp=compileCompositionView(after,landscapes.get(p.landscapeId)!,universe,landscapes);assert.deepEqual(comp.findings,[])
 rows.push({name,sourceSha256:createHash('sha256').update(readFileSync(beforePath)).digest('hex'),candidateSha256:createHash('sha256').update(readFileSync(afterPath)).digest('hex'),onlyFourSupportReferencePlacementsChanged:true,allGlobalRolesEqual:true,SBefore:bs.length,SAfter:as.length,LBefore:bl.length,LAfter:al.length,stages,compilerFindings:comp.findings})
}
const applicability=buildApplicabilityCompilation(catalog.map((landscape,index)=>({file:files[index],landscape}))),profile=createRouteProfiles().find(p=>p.profileId==='canonical-physics-sek1')!
const views=['de-rp-gk.view.json','de-rp-lk.view.json'].map(f=>'tmp/physics-cqr104-consistent-stage-projection-20261115/rp-v3/views/'+f)
const rules=evaluateRouteProfile(p,profile,applicability,catalog,views).rules
assert.equal(rules.find((r:any)=>r.id==='CQR-104')?.status,'pass','Exact RP candidate scopes must pass native CQR104')
const before=read(O+'input-pins.before.json'),pins=before.files.map((x:any)=>{const sha256=createHash('sha256').update(readFileSync(x.path)).digest('hex');return{path:x.path,sha256,unchanged:sha256===x.sha256}})
writeFileSync(O+'input-pins.after.json',JSON.stringify({atUtc:new Date().toISOString(),files:pins},null,2)+'\n')
writeFileSync(O+'native-verification.actual.json',JSON.stringify({atUtc:new Date().toISOString(),rows,rules,allInputsUnchanged:pins.every((p:any)=>p.unchanged)},null,2)+'\n')
assert(pins.every((p:any)=>p.unchanged),'Concurrent input evolution detected; not claimed unchanged')
console.log(JSON.stringify({rows,CQR104:rules.find((r:any)=>r.id==='CQR-104')}))
