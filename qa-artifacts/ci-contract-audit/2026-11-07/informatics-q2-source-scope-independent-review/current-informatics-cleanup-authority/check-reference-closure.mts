import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {collectCompositionProjectionRoleGoalIds,compileCompositionView} from '/dev/shm/informatics-q2-source-scope-v3-20261107/candidate/app/src/utils/authoring/compositionViewAuthoring.ts';
import {checkSkillGraphIntegrity} from '/dev/shm/informatics-q2-source-scope-v3-20261107/candidate/app/scripts/lib/skillGraphIntegrity.ts';
import {resolveRetainedCoverage} from '/dev/shm/informatics-q2-source-scope-v3-20261107/ci/app/scripts/lib/retainedAssessmentCoverage.ts';
import {collectWholeMaterialPrerequisiteClosure} from '../native-closure-functions.mts';
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/informatics-q2-source-scope-v3-20261107/candidate';
const O=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review/current-informatics-cleanup-authority';
const rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(v:any)=>createHash('sha256').update(v).digest('hex');
const raw=readFileSync(W+'/'+rel);assert.equal(sha(raw),'c824e0b360470ef67ae4deb560146c7e677ad9601446b26cd5a46097c426e53b');
const before=JSON.parse(raw.toString()),inv=read(O+'/eight-definition-inventory.json'),rows=inv.exactlyEightRows;
const renames=new Map<string,string>(rows.filter((r:any)=>r.proposedNewId).map((r:any)=>[r.oldId,r.proposedNewId]));
const removed=new Set<string>([...rows.filter((r:any)=>!r.proposedNewId).map((r:any)=>r.oldId),...inv.additionalRemovalIds]);
const oldAll=new Set<string>([...removed,...renames.keys()]);
const mapId=(v:string)=>renames.get(v)??v;
const after=structuredClone(before);after.goals=after.goals.filter((g:any)=>!removed.has(g.id));
const authoredEdits:any[]=[];
for(const g of after.goals){
 const old=g.id;if(renames.has(old)){g.id=mapId(old);authoredEdits.push({ownerGoal:old,pointer:'/id',oldValue:old,newValue:g.id,planningOnly:true});}
 for(const field of ['contains','requires']){
  const b=g[field]??[],a=b.filter((x:string)=>!removed.has(x)).map(mapId);
  if(JSON.stringify(a)!==JSON.stringify(b))authoredEdits.push({ownerGoal:old,pointer:'/'+field,oldValue:b,newValue:a});g[field]=a;
 }
 if(g.examData?.coveredGoalIds){const b=g.examData.coveredGoalIds;assert(!b.some((x:string)=>removed.has(x)),g.id+' must not silently lose coverage');g.examData.coveredGoalIds=b.map(mapId);}
}
assert.equal(after.goals.length,283);assert.equal(after.goals.filter((g:any)=>g.examData).length,22);
const bm=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),am=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
const beforeViews=readdirSync(W+'/curricula/DE/Gymnasium/composition-views/informatik').filter(f=>f.endsWith('.view.json')).sort();
const viewRows=beforeViews.map(file=>{
 const p=W+'/curricula/DE/Gymnasium/composition-views/informatik/'+file,v=read(p);
 const b=collectCompositionProjectionRoleGoalIds(v.rootNodes,bm as any),a=collectCompositionProjectionRoleGoalIds(v.rootNodes,am as any);
 const wanted=[...b.targetGoalIds].map(mapId).sort();assert.deepEqual([...a.targetGoalIds].sort(),wanted);
 const bp=[...b.prerequisiteOnlyGoalIds].map(mapId).filter(x=>!removed.has(x)).sort();assert.deepEqual([...a.prerequisiteOnlyGoalIds].sort(),bp);
 const compiled=compileCompositionView(v,after);assert.equal(compiled.findings.filter((f:any)=>f.severity==='error').length,0);
 for(const x of removed)assert(!b.targetGoalIds.has(x),file+' unexpectedly already targets removed '+x);
 return {file,sha256:sha(readFileSync(p)),viewId:v.viewId,targetCount:a.targetGoalIds.size,removedOldIds:[...b.targetGoalIds].filter(x=>renames.has(x)),addedNewIds:[...a.targetGoalIds].filter(x=>[...renames.values()].includes(x)),ordinaryTargetsExactlyEqual:true,compileErrors:0};
});assert.equal(viewRows.length,19);
const remainingExams=after.goals.filter((g:any)=>g.examData).map((g:any)=>{
 const old=[...renames.entries()].find(([,v])=>v===g.id)?.[0]??g.id,b=bm.get(old);
 const prep=(s:any,id:string)=>[...collectWholeMaterialPrerequisiteClosure(s,id).atomicGoalIds].sort();assert.deepEqual(prep(after,g.id),prep(before,old));
 const declared=Object.hasOwn(g.examData,'coveredGoalIds');let atoms:any=null;
 if(declared){const a=resolveRetainedCoverage(after,g.examData.coveredGoalIds),z=resolveRetainedCoverage(before,b.examData.coveredGoalIds);assert.deepEqual(a.issues,[]);assert.deepEqual(a.atoms,z.atoms);atoms=a.atoms;}
 else assert(!Object.hasOwn(b.examData,'coveredGoalIds'));
 return {oldId:old,currentId:g.id,coverageState:declared?'DECLARED':'ABSENT_UNKNOWN',atoms,preparationUnchanged:true,materialUnchangedForStructuralProbeOnly:true};
});
const allFiles=readdirSync(W+'/curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.de.json')).sort();
const catalog=allFiles.map(f=>f==='DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'?after:read(W+'/curricula/DE/Gymnasium/canonical/'+f));
const graph=checkSkillGraphIntegrity(catalog,[after.landscapeId]);
assert(graph.checks.filter((c:any)=>c.id!=='G17').every((c:any)=>c.findingCount===0));
const crossCatalogReferences:any[]=[];
const scan=(x:any,path:string,hits:any[])=>{if(typeof x==='string'){for(const id of oldAll)if(x===id||x.endsWith(':'+id))hits.push({pointer:path,id});}else if(Array.isArray(x))x.forEach((v,i)=>scan(v,path+'/'+i,hits));else if(x&&typeof x==='object')Object.entries(x).forEach(([k,v])=>scan(v,path+'/'+k,hits));};
for(const f of allFiles){if(f==='DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json')continue;const hits:any[]=[];scan(read(W+'/curricula/DE/Gymnasium/canonical/'+f),'',hits);if(hits.length)crossCatalogReferences.push({file:f,hits});}
assert.deepEqual(crossCatalogReferences,[]);
const originalSourceReferences:any[]=[];scan(before,'',originalSourceReferences);
const currentReferences:any[]=[];scan(after,'',currentReferences);assert.deepEqual(currentReferences,[]);
// A partial deletion must fail the existing graph validator, not become a smaller pass denominator.
const negative=structuredClone(before);negative.goals=negative.goals.filter((g:any)=>!removed.has(g.id));
const negativeCatalog=catalog.map((s:any)=>s.landscapeId===negative.landscapeId?negative:s);
const negativeGraph=checkSkillGraphIntegrity(negativeCatalog,[negative.landscapeId]);
assert(negativeGraph.checks.some((c:any)=>c.id!=='G17'&&c.findingCount>0));
const output={kind:'Structural planning counterfactual only; no candidate source or material written; no QA pass',sourceSha256:sha(raw),observedActiveSourceSha256:sha(readFileSync(R+'/'+rel)),allCatalogs:allFiles.length,sourceDefinitionCounts:{before:before.goals.length,after:after.goals.length},examCounts:{before:25,after:22,declared:remainingExams.filter((g:any)=>g.coverageState==='DECLARED').length,unknown:remainingExams.filter((g:any)=>g.coverageState==='ABSENT_UNKNOWN').length},authoredEdits,originalSourceReferences,crossCatalogReferences,remainingOldExactGoalReferences:currentReferences,views:viewRows,remainingExams,graphChecks:graph.checks,negativeDanglingReferenceGraphChecks:negativeGraph.checks,limits:['Five renamed materials remain their exact old placeholders in this probe, deliberately still invalid; this is not a completed current assessment changeset.','Five original covered sets are compared to prevent silent target loss, not to approve the entire 166-atom compulsory offer.','39/12 global runtime and 50-scope CQR must be rerun on the final actual frame.','No source or learner data mutated. No history runtime or result mapping.']};
writeFileSync(O+'/reference-closure-check.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({views:viewRows.length,exams:output.examCounts,sourceDefinitions:output.sourceDefinitionCounts,otherCatalogReferences:crossCatalogReferences.length,graph:graph.checks,negative:negativeGraph.checks}));
