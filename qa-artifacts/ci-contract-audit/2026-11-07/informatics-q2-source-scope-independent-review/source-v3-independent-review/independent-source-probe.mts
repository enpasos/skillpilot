import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {collectCompositionProjectionRoleGoalIds, compileCompositionView} from '/dev/shm/informatics-q2-source-scope-v3-20261107/candidate/app/src/utils/authoring/compositionViewAuthoring.ts';
import {checkSkillGraphIntegrity} from '/dev/shm/informatics-q2-source-scope-v3-20261107/candidate/app/scripts/lib/skillGraphIntegrity.ts';
import {protectedAssessmentMeaning, stableCoverageJson, resolveRetainedCoverage} from '/dev/shm/informatics-q2-source-scope-v3-20261107/ci/app/scripts/lib/retainedAssessmentCoverage.ts';
import {collectWholeMaterialPrerequisiteClosure} from '../native-closure-functions.mts';
const R='/home/enpasos/projects/skillpilot', W='/dev/shm/informatics-q2-source-scope-v3-20261107', P=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review', O=P+'/source-v3-independent-review';
const rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
const sha=(s:any)=>createHash('sha256').update(s).digest('hex'), read=(s:string)=>JSON.parse(readFileSync(s,'utf8'));
const rawBefore=gunzipSync(readFileSync(P+'/coverage-contract-followup/historical-informatics-source.json.gz')),rawAfter=readFileSync(W+'/candidate/'+rel);
assert.equal(sha(rawBefore),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e');
assert.equal(sha(rawAfter),'c824e0b360470ef67ae4deb560146c7e677ad9601446b26cd5a46097c426e53b');
const before=JSON.parse(rawBefore.toString()),after=JSON.parse(rawAfter.toString());
const bm=new Map(before.goals.map((g:any)=>[g.id,g])),am=new Map(after.goals.map((g:any)=>[g.id,g]));
const special='875cb53c-b48d-5b2b-8cb0-e20f27534f16', basic='7ad8caf0-3a31-56f1-bee1-574c01b0c156', agg='13be8508-9eb3-510d-bd5c-4ba4efcc2589', select='fd1f5c79-20e6-5829-98c1-0909e047cad4',held='f37f2d37-7686-5ed7-9c20-6f83d4fd2254';
const old3=['0df1bedd-5fda-5b3b-a959-c9610237bb3e','269a561b-f12e-57b2-9b05-e20f58c9dcf6','ca2ff162-c71f-500f-8ce7-321ab2cf3f1f'];
const er=['5c6ba0c6-5b7a-512f-8c19-739b20473639','2d1021d7-aa6a-520d-a56e-19a8305db9f3','58180f3b-3cf7-577d-b2ff-d9066ef481f5'];
const db4=['b86e8ab3-2c12-5b6b-b515-1e7d457c99c2','d13e297f-505d-576a-9a86-11ab4d7896c9','d9892508-97b5-529e-9b9e-c4889fba2166','4e0668e3-edca-57f4-b258-df87f23d2b4e'];
const diff=(a:string[],b:string[])=>a.filter(x=>!b.includes(x));
const prep=(s:any,id:string)=>[...collectWholeMaterialPrerequisiteClosure(s,id).atomicGoalIds].sort();
const rows=before.goals.filter((g:any)=>g.examData).map((g:any)=>{
 const n:any=am.get(g.id), declared=Object.hasOwn(g.examData,'coveredGoalIds');
 assert(n);assert.equal(Object.hasOwn(n.examData,'coveredGoalIds'),declared);
 const b=declared?resolveRetainedCoverage(before,g.examData.coveredGoalIds):undefined,a=declared?resolveRetainedCoverage(after,n.examData.coveredGoalIds):undefined;
 if(declared){assert.deepEqual(b!.issues,[]);assert.deepEqual(a!.issues,[]);assert.deepEqual(a!.atoms,b!.atoms);}
 else {assert.equal(n.examData.coveredGoalIds,undefined);assert.deepEqual(n.examData,g.examData);}
 const bp=prep(before,g.id),ap=prep(after,g.id),add=diff(ap,bp),rem=diff(bp,ap);
 assert.deepEqual(add,old3.includes(g.id)?[basic]:[]); assert.deepEqual(rem,db4.includes(g.id)?[special]:[]);
 return {goalId:g.id,title:g.title,coverageState:declared?'declared':'ABSENT_UNKNOWN',beforeReferences:declared?g.examData.coveredGoalIds:null,afterReferences:declared?n.examData.coveredGoalIds:null,beforeAtoms:declared?b!.atoms:null,afterAtoms:declared?a!.atoms:null,beforeHardPrerequisites:bp,afterHardPrerequisites:ap,addedHardPrerequisites:add,removedHardPrerequisites:rem,examDataSame:stableCoverageJson(n.examData)===stableCoverageJson(g.examData)};
});
assert.equal(rows.length,24);assert.equal(rows.filter((r:any)=>r.coverageState==='declared').length,14);
const edgeReview=read(P+'/edge-review.json');
const edges=edgeReview.records.filter((r:any)=>r.verdict==='support_preparation_minimization').map((r:any)=>{
 const g:any=am.get(r.examId),closure=prep(after,r.examId);
 assert(!(g.requires??[]).includes(r.removedPrerequisite)); assert(closure.includes(r.removedPrerequisite));
 const unchangedEndpoints=r.fullEndpointGoals.map((b:any)=>{
  const a:any=am.get(b.id);assert.equal(a.title,b.title);assert.equal(a.description,b.description);
  return {goalId:b.id,title:a.title,description:a.description,currentRequires:a.requires};
 });
 return {examId:r.examId,removed:r.removedPrerequisite,verdict:'supported_removal_still_prepared',originalReviewRationale:r.rationale,originalMaterialCases:r.materialCaseIds,unchangedEndpointMeanings:unchangedEndpoints};
});assert.equal(edges.length,18);
const correctedEdges=['98fcf9d1-71b8-5e5b-928b-166917330da4','a49d9d9c-a8f2-52e7-a90a-6ad4bfafafbb'].map(id=>{const g:any=am.get(id);assert.deepEqual(g.requires,[select]);return {id,requires:g.requires};});
for(const id of old3){const g:any=am.get(id);assert(g.requires.includes(agg));correctedEdges.push({id,requires:g.requires});}
const b875:any=bm.get(special),a875:any=am.get(special);
for(const key of ['id','title','titleEn','description','descriptionEn','type','tags','weight','contains'])assert.deepEqual(a875[key],b875[key]);
assert.deepEqual(a875.requires,[basic]);assert.deepEqual(a875.applicability,{});assert.equal(a875.extendedData.applicabilityProjection,'excluded');
const parents=after.goals.filter((g:any)=>(g.contains??[]).includes(special)).map((g:any)=>g.id);assert.deepEqual(parents,['29ec47db-7dfe-553d-b850-40e06f164545']);
const fullGoals={before:b875,after:a875,parents,oldObjectJsonSha256:sha(JSON.stringify(b875)),newObjectJsonSha256:sha(JSON.stringify(a875)),oldStableObjectSha256:sha(stableCoverageJson(b875)),newStableObjectSha256:sha(stableCoverageJson(a875)),oldProtectedMeaningSha256:sha(stableCoverageJson(protectedAssessmentMeaning(b875))),newProtectedMeaningSha256:sha(stableCoverageJson(protectedAssessmentMeaning(a875))),sourceBeforeSha256:sha(rawBefore),sourceAfterSha256:sha(rawAfter)};
const materialPath=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-material-review-corrections/native-examData.json',materials=read(materialPath);assert.equal(sha(readFileSync(materialPath)),'cb82c27a5cf0a53d7d946475dfd4f2ceae8e1065348580f97b7f0f9202871c92');
const materialChecks=[...old3,'6ebc2a67-ea20-5c4e-8a63-635f40438d6a'].map(id=>{const g:any=am.get(id);assert.deepEqual(g.examData,materials[id]);return {goalId:id,exactObjectEqual:true,examDataSha256:sha(JSON.stringify(g.examData)),reviewStatus:g.examData.reviewStatus,coverageCount:g.examData.coveredGoalIds.length};});assert(!am.has(held));
const views=readdirSync(W+'/candidate/curricula/DE/Gymnasium/composition-views/informatik').filter(p=>p.endsWith('.view.json')).sort().map(file=>{
 const v=read(W+'/candidate/curricula/DE/Gymnasium/composition-views/informatik/'+file),r=collectCompositionProjectionRoleGoalIds(v.rootNodes,am as any),compiled=compileCompositionView(v,after);
 for(const id of [special,...old3,held])assert(!r.targetGoalIds.has(id),file+' must exclude '+id);
 assert.equal(compiled.findings.filter((f:any)=>f.severity==='error').length,0,file);
 return {file,viewId:v.viewId,scope:v.scope,targetGoalIds:[...r.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...r.prerequisiteOnlyGoalIds].sort(),findings:compiled.findings};
});assert.equal(views.length,19);
const catalog=readdirSync(W+'/candidate/curricula/DE/Gymnasium/canonical').filter(p=>p.endsWith('.de.json')).sort().map(file=>read(W+'/candidate/curricula/DE/Gymnasium/canonical/'+file));
const graph=checkSkillGraphIntegrity(catalog,[after.landscapeId]);
const q3='31026f4a-629b-571f-b45d-a87f47a09d9e',q21='900065ef-d3ae-5145-b92c-50821795107a';
const negativeQ3=structuredClone(after);negativeQ3.goals.find((g:any)=>g.id===q3).contains.push(special);
const q3Counterexamples=['8877a2e6-ebf8-5b73-a88b-56d5145a20ba','0c346dc1-fdcc-5563-9154-28623d354574'].map(id=>{
 const original:any=am.get(id),b=resolveRetainedCoverage(after,original.examData.coveredGoalIds),a=resolveRetainedCoverage(negativeQ3,original.examData.coveredGoalIds);assert.equal(a.atoms.length,b.atoms.length+1);
 const pin=resolveRetainedCoverage(negativeQ3,b.atoms);assert.deepEqual(pin.atoms,b.atoms);
 return {goalId:id,baselineCount:b.atoms.length,negativeCount:a.atoms.length,added:diff(a.atoms,b.atoms),explicitAtomPinRestoresExactCoverage:true};
});
const negativeER=structuredClone(after);negativeER.goals.find((g:any)=>g.id===q21).contains.push(...er);
const erCounterexamples=['b86e8ab3-2c12-5b6b-b515-1e7d457c99c2','d13e297f-505d-576a-9a86-11ab4d7896c9','d9892508-97b5-529e-9b9e-c4889fba2166','4e0668e3-edca-57f4-b258-df87f23d2b4e'].map(id=>{
 const added=diff(prep(negativeER,id),prep(after,id));assert.deepEqual(added,[...er].sort());return {goalId:id,unprovedNewPrerequisitesIfOldQ21Expanded:added};
});
const final={status:'independent factual source probe; no material, runtime or QA release',sourceBeforeSha256:sha(rawBefore),sourceAfterSha256:sha(rawAfter),historical24:rows,ordinary875:fullGoals,materialChecks,retained18:edges,correctedFive:correctedEdges,views,graph:{checks:graph.checks,findings:graph.findings},q3Counterexamples,erCounterexamples,limits:['Only 14 declared historical coverage sets are machine proved. Ten ABSENT contracts remain unknown beyond their unchanged own exam results.','Old three gain only the justified basic-FSM prerequisite; this is no coverage inference.','Meaning of old3 materials and exact875 metadata still needs separately consumed bindings; this probe writes none.']};
writeFileSync(O+'/independent-source-probe.json',JSON.stringify(final,null,2)+'\n');console.log(JSON.stringify({historical:rows.length,declared:14,unknown:10,views:views.length,retainedRemovals:edges.length,fiveCorrections:correctedEdges.length,materialExact:materialChecks.length,ordinary875:fullGoals.oldProtectedMeaningSha256+' -> '+fullGoals.newProtectedMeaningSha256,graphChecks:graph.checks}));
