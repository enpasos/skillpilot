import assert from'node:assert/strict'
import{readFileSync,readdirSync,writeFileSync}from'node:fs'
import{createHash}from'node:crypto'
import{normalizeCanonicalLandscape}from'../../../app/src/utils/authoring/canonicalAuthoring'
import{collectCompositionProjectionRoleGoalIds,compileCompositionView}from'../../../app/src/utils/authoring/compositionViewAuthoring'
import{UnitGraph}from'../../../app/scripts/lib/learningUnitContracts'
const O='tmp/pr159-terminal-route-independent-review-20261115/electrical-views-review/',read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex'),sort=(x:Iterable<string>)=>[...new Set(x)].sort()
const C='curricula/DE/Gymnasium/canonical/',files=readdirSync(C).filter(f=>f.endsWith('.json')).sort().map(f=>C+f),catalog=files.map(read),goals=new Map<string,any>(catalog.flatMap(c=>c.goals.map((g:any)=>[g.id,g]))),owners=new Map<string,string>(catalog.flatMap(c=>c.goals.map((g:any)=>[g.id,c.landscapeId])))
const graph=new UnitGraph(catalog),norm=catalog.map(normalizeCanonicalLandscape),landscapes=new Map(norm.map(c=>[c.landscapeId,c])),p=catalog.find(c=>c.landscapeId==='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'),universe=normalizeCanonicalLandscape({landscapeId:'electrical-independent-universe',title:'Universe',goals:norm.flatMap(c=>c.goals)})
const beforeMap=read('tmp/physics-cqr104-consistent-stage-projection-20261115/old-input-view-map.actual.json');assert.equal(sha('tmp/physics-cqr104-consistent-stage-projection-20261115/old-input-view-map.actual.json'),'6a0ac5b3553d958af4507ed9045d5d62154b7a092c80f2e563d1010a1780531b');
const proof=read('tmp/physics-cqr104-consistent-stage-projection-20261115/electrical-views/candidate-proof.actual.json'),task='d96479ce-5d3e-57e9-83f4-a8ba2e7ddaa8',concept='1730c01d-8c85-57df-b031-c11e2a0511b1',capacitor='9f59a088-3939-59e9-821d-167fadfda782',key=(id:string)=>owners.get(id)+':'+id
assert.equal(sha(C+'DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),proof.canonicalPhysicsSha256)
assert.deepEqual(goals.get(task).requires,[concept]);assert(!graph.reach(key(task)).has(key(capacitor)),'No capacitor prerequisite imported')
const fullClosure=(ids:Iterable<string>)=>{const q=[...ids],seen=new Set<string>();for(const raw of q){const id=raw.split(':').at(-1)!;if(seen.has(id))continue;seen.add(id);const g=goals.get(id);assert(g,id);q.push(...(g.requires??[]))}return seen}
let materializedCount=0,totalOccurrences=0,errors=0;const rows=[]
for(const row of proof.rows){
 const mapped=beforeMap.rows.find((m:any)=>m.originalActivePath===row.sourcePath);assert(mapped);assert.equal(mapped.sha256,row.sourceSha256);assert.equal(sha(mapped.retainedByteExactBeforePath),row.sourceSha256);const beforePath=row.inputPath===row.sourcePath?mapped.retainedByteExactBeforePath:row.inputPath;assert.equal(sha(beforePath),row.inputSha256);assert.equal(sha(row.candidatePath),row.candidateSha256)
 const before=read(beforePath),after=read(row.candidatePath),b=collectCompositionProjectionRoleGoalIds(before.rootNodes,goals),a=collectCompositionProjectionRoleGoalIds(after.rootNodes,goals)
 const bs=sort(b.targetGoalIds).filter(id=>graph.isAtomic(key(id))&&id!==task),as=sort(a.targetGoalIds).filter(id=>graph.isAtomic(key(id))&&id!==task)
 assert.deepEqual(as,bs,'All non-new-task atomic targets, including every old assessment/memory/orientation, unchanged')
 const bl=sort(fullClosure(bs)).filter(id=>id!==task),al=sort(fullClosure([...as,...(a.targetGoalIds.has(task)?[task]:[])])).filter(id=>id!==task)
 assert.deepEqual(al,bl,'Full all-kind canonical learning basis unchanged apart from the new task')
 const materializations:any[]=[],occurrences:any[]=[]
 const visit=(nodes:any[],path:any[]=[])=>{for(const n of nodes){
  if(n.kind==='structure'){
   if(n.canonicalSourceGoalId){
    const original=goals.get(n.canonicalSourceGoalId);assert(original?.contains?.length,'Materialization names a real canonical cluster')
    const actual=n.children.filter((c:any)=>c.goalId!==task).map((c:any)=>c.goalId??c.canonicalSourceGoalId)
    assert.deepEqual(actual,original.contains.filter((id:string)=>id!==task),'All non-task direct canonical children preserved, same order and identities')
    if(n.originalCanonicalSubtree)assert.equal(n.originalCanonicalSubtree.goalId,n.canonicalSourceGoalId)
    materializations.push(n.canonicalSourceGoalId)
   }
   visit(n.children,[...path,{id:n.id,label:n.label}])
  }else if(n.goalId){
   const stack=[n.goalId],seen=new Set<string>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);if(id===task)occurrences.push({nodeKind:n.kind,nodeGoalId:n.goalId,projectionRole:n.projectionRole??'target',path});if(n.kind==='canonicalSubtree')stack.push(...(goals.get(id)?.contains??[]))}
  }
 }}
 visit(after.rootNodes)
 const expects=!!row.placement;assert.equal(occurrences.length,expects?1:0,'Exactly one new-task occurrence when applicable; none otherwise')
 if(expects){assert(a.targetGoalIds.has(task));assert.equal(occurrences[0].projectionRole,'target');assert(fullClosure(bs).has(concept),'Existing full target basis already requires the entire assessed goal')}
 if(row.scope.jurisdiction==='DE-BY'){
  assert(expects);const ids=occurrences[0].path.map((n:any)=>n.id)
  assert(ids.includes(row.scope.stage==='CrossStage'?'physics-by-ph9-1':'physics-by-ph12-ga-1'),'Actual BY placement follows existing1730 stage/year')
  assert.deepEqual(goals.get(task).requires,[concept]);assert(goals.get(concept).requires.includes('bbee4c52-4e95-5529-990f-706aa99316a3'))
 }
 const compile=compileCompositionView(after,landscapes.get(p.landscapeId)!,universe,landscapes),compileErrors=compile.findings.filter(f=>f.severity==='error');assert.deepEqual(compileErrors,[])
 errors+=compileErrors.length;totalOccurrences+=occurrences.length;materializedCount+=materializations.length
 rows.push({sourcePath:beforePath,sourceSha256:row.inputSha256,candidatePath:row.candidatePath,candidateSha256:row.candidateSha256,nonTaskAtomicTargetCountBefore:bs.length,nonTaskAtomicTargetCountAfter:as.length,fullNonTaskLearningBasisCountBefore:bl.length,fullNonTaskLearningBasisCountAfter:al.length,taskOccurrences:occurrences,materializedSourceGoalIds:materializations,compileErrorCount:compileErrors.length})
}
assert.equal(rows.length,69);assert.equal(totalOccurrences,68)
const before=read(O+'input-pins.reconstructed-before.json'),pins=before.files.map((p:any)=>({path:p.path,sha256:sha(p.path),unchanged:sha(p.path)===p.sha256}));assert(pins.every((p:any)=>p.unchanged),'Inputs changed during structural verification')
writeFileSync(O+'input-pins.reconstructed-after.json',JSON.stringify({atUtc:new Date().toISOString(),files:pins},null,2)+'\n')
writeFileSync(O+'structural-verification.final.actual.json',JSON.stringify({atUtc:new Date().toISOString(),candidateProofSHA256:sha('tmp/physics-cqr104-consistent-stage-projection-20261115/electrical-views/candidate-proof.actual.json'),viewCount:rows.length,taskOccurrenceCount:totalOccurrences,materializedCanonicalSourceCount:materializedCount,compileErrors:errors,allNonTaskTargetsPreserved:true,fullNonTaskLearningBasisPreserved:true,noCapacitorPrerequisite:true,allInputsUnchanged:true,rows},null,2)+'\n')
console.log(JSON.stringify({views:rows.length,taskOccurrences:totalOccurrences,materializedSources:materializedCount,compileErrors:errors,unchangedPins:pins.length,allNonTaskTargetsAndLearningBasesPreserved:true}))
