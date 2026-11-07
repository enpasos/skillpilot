import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {collectCompositionProjectionRoleGoalIds} from '../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {discoverCurriculumAssessmentScope,evaluateCurriculumExamReadiness,evaluateExamTaskReadiness} from '../../../../app/scripts/generateCurriculumQualityStatus.ts';
const R=process.cwd(),O=R+'/qa-artifacts/ci-contract-audit/2026-11-07/informatics-q2-source-scope-independent-review';
const path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(sha(R+'/'+path),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e');
assert.equal(sha('/dev/shm/info-source-review/'+path),'7586e38b7c96688bc8c5f02b2e2b1327284d271c73404693c9f872d29422d661');
assert.equal(sha(R+'/app/scripts/generateCurriculumQualityStatus.ts'),'4342979a74b85e3aa2bce2e95a95e14f7c5a05fe83698076bd82b8c0182b5da6');
const before=read(R+'/'+path),candidate=read('/dev/shm/info-source-review/'+path);
const ids=['8877a2e6-ebf8-5b73-a88b-56d5145a20ba','0c346dc1-fdcc-5563-9154-28623d354574'];
const addition='875cb53c-b48d-5b2b-8cb0-e20f27534f16',cluster='31026f4a-629b-571f-b45d-a87f47a09d9e';
const goal=(s:any,id:string)=>s.goals.find((g:any)=>g.id===id);
const atoms=(s:any,refs:string[])=>{
 const byId=new Map(s.goals.map((g:any)=>[g.id,g]));
 assert.equal(byId.size,s.goals.length);for(const id of refs)assert.ok(byId.has(id),'All examined actual local coverage references resolve.');
 const expanded=collectCompositionProjectionRoleGoalIds(refs.map(goalId=>({kind:'canonicalSubtree',goalId})),byId as any);
 return [...expanded.targetGoalIds].filter(id=>!(byId.get(id)as any)?.contains?.length).sort();
};
const baseline=before.goals.filter((g:any)=>g.examData).map((g:any)=>({id:g.id,coveredGoalIds:g.examData.coveredGoalIds??[],resolvedAtomicGoalIds:atoms(before,g.examData.coveredGoalIds??[])}));
assert.equal(baseline.length,24);
const compare=(s:any)=>baseline.map(b=>{const current=atoms(s,goal(s,b.id).examData.coveredGoalIds??[]);return{id:b.id,oldCount:b.resolvedAtomicGoalIds.length,currentCount:current.length,added:current.filter(i=>!b.resolvedAtomicGoalIds.includes(i)),removed:b.resolvedAtomicGoalIds.filter(i=>!current.includes(i))}}).filter(row=>row.added.length||row.removed.length);
// Review-only proposed hard invariant: consumes existing native expansion and a bound prior source.
// This is not an installed CI rule or evidence of complete material semantics.
const assertStableCoverage=(s:any)=>assert.deepEqual(compare(s),[],'Retained stable exam identity must retain its bound resolved coverage.');
const native=(s:any)=>{const scope=discoverCurriculumAssessmentScope(s,[],[s]);const rules=evaluateCurriculumExamReadiness(s,[],[s],scope);return{scope,structure:rules.find(r=>r.id==='CQR-204'),readiness:rules.find(r=>r.id==='CQR-202'),targetPayloadReadiness:ids.map(id=>({id,result:evaluateExamTaskReadiness([goal(s,id)])}))};};
const originalNative=native(before),cases:any[]=[];
for(const id of ids){
 const mutant=structuredClone(before);goal(mutant,cluster).contains.push(addition);
 // Isolate one unchanged old exam contract by explicitly preserving the sibling exam's old coverage.
 const other=ids.find(i=>i!==id)!;goal(mutant,other).examData.coveredGoalIds=baseline.find(b=>b.id===other)!.resolvedAtomicGoalIds;
 assert.deepEqual(goal(mutant,id).examData,goal(before,id).examData,'The affected exam data and stable ID remain byte-meaning identical.');
 const drifts=compare(mutant);assert.equal(drifts.length,1);assert.equal(drifts[0].id,id);assert.deepEqual(drifts[0].added,[addition]);assert.deepEqual(drifts[0].removed,[]);
 assert.throws(()=>assertStableCoverage(mutant));const result=native(mutant);
 assert.deepEqual(result.structure?.assessmentValidation?.failingGoalIds,originalNative.structure?.assessmentValidation?.failingGoalIds);
 assert.equal(result.targetPayloadReadiness.find((r:any)=>r.id===id)?.result.status,'pass');
 assert.ok(!result.structure?.assessmentValidation?.failingGoalIds.includes(id));
 cases.push({kind:'native-contains-growth-negative',id,mutation:{parent:cluster,addedChild:addition,otherExamPinned:other},coverageDrift:drifts,nativeCurrentCqr204DetectsThisDrift:false,proposedHardInvariantRejected:true,native:result});
}
const pinPositive=structuredClone(candidate);
for(const id of ids)goal(pinPositive,id).examData.coveredGoalIds=baseline.find(b=>b.id===id)!.resolvedAtomicGoalIds;
assertStableCoverage(pinPositive);const positiveNative=native(pinPositive);
assert.equal(positiveNative.structure?.assessmentValidation?.failingGoalIds.length,5,'The five unrelated actual placeholders remain failures.');
for(const row of positiveNative.targetPayloadReadiness)assert.equal(row.result.status,'pass');
assert.equal(compare(candidate).length,2);
const out={method:'Actual native composition expansion and CQR retained/readiness functions. The scoped CQR call omits view discovery to isolate the definition/coverage invariant; full candidate view/runtime evidence is separate.',baselineSourceSha256:sha(R+'/'+path),candidateSourceSha256:sha('/dev/shm/info-source-review/'+path),baselineCount:baseline.length,baseline,actualCandidateDrifts:compare(candidate),originalNative,cases,correctPinPositive:{pinnedIds:ids,all24Stable:true,remainingUnrelatedPlaceholderFailures:5,native:positiveNative},limit:'Positive explicit coverage pins do not repair seven hard-prerequisite drifts or make875/old41 valid compulsory state goals; no all-curriculum proof and no active CI implementation.'};
writeFileSync(O+'/coverage-gate-counterchecks.json',JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({baselineCount:baseline.length,candidateDrifts:compare(candidate),twoNegativesRejected:cases.length,correctPinPositive:true,unrelatedPlaceholderFailures:5,existingCQR204MissesBothDrifts:true}));
