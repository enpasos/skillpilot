// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const R='/home/enpasos/projects/skillpilot', T=R+'/tmp/chemie-m7-resumed-20261016',
 L=T+'/chemie-shared640-recycling-native-author-capsule-L6-v1',
 O=T+'/BB-BE-eleven-crossstage-LK-acquisition-view-only-author-successor-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(b:any)=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>({path:p.slice(R.length+1),sha256:sha(fs.readFileSync(p))});
const {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView}
 =await import(L+'/app/src/utils/authoring/compositionViewAuthoring.ts');
const {goalMatchesFilters}=await import(L+'/app/src/utils/goalFilters.ts');
const casPath=O+'/CAS.two-whole-BB-BE-CrossStage-LK-views.eleven-existing-acquisition-targets.AUTHOR.inactive.json';
const cas=read(casPath), canPath=L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
assert.equal(sha(fs.readFileSync(canPath)),cas.canonicalBinding.sha256);
const can=read(canPath),by=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
const oldRead=read(T+'/BB-BE-eleven-existing9fef-prior-acquisition-boundary-readonly-v1/INPUT.exact-current-fourteen-whole-goals-and-fourteen-whole-P-records.readonly.json');
const ids=new Set<string>(oldRead.knownElevenGoalIds);
const starts=['9fef5c29-62bc-5ada-b96b-6885bcb049cb','1c1420c2-a8e2-520f-8015-6df637a973bd','5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c'];
const memoryConfigPath=L+'/curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json';
const mc=read(memoryConfigPath),mPath=L+'/'+mc.reviewPath;
const selectedM=fs.readFileSync(mPath,'utf8').split('\n').filter(Boolean).map(JSON.parse).filter((m:any)=>ids.has(m.goalId));
function sets(v:any){const x=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);return {
 target:new Set<string>([...x.targetGoalIds].filter(i=>goalMatchesFilters(by.get(i),v.scope.courseProfile))),
 support:new Set<string>([...x.prerequisiteOnlyGoalIds].filter(i=>goalMatchesFilters(by.get(i),v.scope.courseProfile)))};}
function role(s:any,i:string){return s.target.has(i)?'target':s.support.has(i)?'prerequisiteOnly':'missing';}
function closure(start:string){const out=new Set<string>(),q=[...(by.get(start)?.requires??[])];while(q.length){const i=q.shift()!;if(out.has(i))continue;out.add(i);q.push(...(by.get(i)?.requires??[]));}return [...out];}
const rows=[];
for(const op of cas.operations){
 assert.equal(sha(fs.readFileSync(L+'/'+op.targetPath)),op.expectedCurrentFileSha256);
 assert.deepEqual(read(L+'/'+op.targetPath),op.before);
 const b=sets(op.before),a=sets(op.after),added=[...a.target].filter(i=>!b.target.has(i));
 assert.deepEqual(new Set(added),ids);
 assert.deepEqual([...b.target].filter(i=>!a.target.has(i)),[]);
 assert.deepEqual(a.support,b.support);
 const compiled=compileCompositionView(normalizeCompositionView(op.after),can);
 const errs=compiled.findings.filter((f:any)=>f.severity==='error');assert.equal(errs.length,0);
 const closures=starts.map(start=>({start,beforeMissing:closure(start).filter(i=>role(b,i)==='missing'),afterMissing:closure(start).filter(i=>role(a,i)==='missing'),allClosureGoalIds:closure(start)}));
 assert(closures.every(c=>c.afterMissing.length===0));
 rows.push({viewId:op.before.viewId,scope:op.before.scope,before:pin(L+'/'+op.targetPath),
   actualStockCompileErrors:errs,actualStockCompileAllFindings:compiled.findings,
   targetCountBefore:b.target.size,targetCountAfter:a.target.size,addedTargetGoalIds:added,
   lostTargetGoalIds:[],supportRolesExact:true,
   finiteThreeStartCanonicalRequiresClosures:closures,
   selectedCurrentMemoryReferences: selectedM.filter((m:any)=>m.status==='memory_required').map((m:any)=>({ordinaryGoalId:m.goalId,wholeCurrentMemoryDecision:m,
     beforeOrdinaryRole:role(b,m.goalId),afterOrdinaryRole:role(a,m.goalId),
     referencedMemoryRoles:m.memoryGoalIds.map((i:string)=>({goalId:i,beforeRole:role(b,i),afterRole:role(a,i)}))})),
   noFullMemoryGateExecuted:true});
}
const protectedPaths=[canPath,L+'/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',memoryConfigPath,mPath,
 L+'/'+mc.cardReviewPath,L+'/app/src/utils/authoring/compositionViewAuthoring.ts',L+'/app/src/utils/goalFilters.ts',
 L+'/app/scripts/generateCurriculumQualityStatus.ts',L+'/backend/src/main/java/com/skillpilot/backend/service/LearnerService.java'];
const result={role:'Bounded actual stock two-view compile and role/three-start closure checks of inactive AUTHOR candidate; not fullAPV/M/central',
 canonical:pin(canPath),candidate:pin(casPath),sourceModulesAndProtectedInputs:protectedPaths.filter(p=>fs.existsSync(p)).map(pin),
 exactSelectedFourteenCurrentWholes:oldRead.wholeCurrentGoals.every((g:any)=>JSON.stringify(g)===JSON.stringify(by.get(g.id))),
 selectedWholeCurrentMemoryDecisions:selectedM,scopes:rows,
 fullAPV:0,fullCentral:0,globalM:0,ordinaryGoalWrites:0,sourceWrites:0,RorL6Writes:0,
 newIndependentVotes:0,MachineM7Claim:false,HumanApproval:false};
fs.writeFileSync(O+'/CHECK.actual-stock-two-view-eleven-targets-and-three-start-closure.AUTHOR.technical.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({actualStockCompiles:rows.map(s=>({view:s.viewId,errors:s.actualStockCompileErrors.length,added:s.addedTargetGoalIds.length,lost:0,closureMissing:s.finiteThreeStartCanonicalRequiresClosures.map(c=>({start:c.start,before:c.beforeMissing.length,after:c.afterMissing.length})),memory:s.selectedCurrentMemoryReferences.map(m=>({ordinary:m.ordinaryGoalId,refs:m.referencedMemoryRoles}))})),actualCanonical:pin(canPath)}));
