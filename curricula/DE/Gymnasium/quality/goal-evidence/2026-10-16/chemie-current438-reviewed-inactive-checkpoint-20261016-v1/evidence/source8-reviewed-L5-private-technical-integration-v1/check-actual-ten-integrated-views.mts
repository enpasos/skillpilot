import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const R=process.cwd(),T=resolve('tmp/chemie-m7-resumed-20261016');
const B=resolve(T,'chemie-combined639-two-GK-priors-final-review-capsule-v1'),K=resolve(T,'chemie-combined639-source8-reviewed-integration-capsule-L5-v1');
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const l=read(resolve(K,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'));
const by=new Map(l.goals.map((g:any)=>[g.id,g]));
const {collectCompositionProjectionRoleGoalIds:roles,compileCompositionView}=await import(resolve(R,'app/src/utils/authoring/compositionViewAuthoring.ts'));
const {convertLearningGoal}=await import(resolve(R,'app/src/goalTypes.ts'));
const {goalMatchesFilters}=await import(resolve(R,'app/src/utils/goalFilters.ts'));
const cas=read(resolve(T,'eight-empty-compiled-source-author-candidate-v2/CAS.guarded-thirty-one-whole-files.source8.AUTHOR.v2.inactive.json'));
const rows=[];
for(const op of cas.fileOperations.filter((x:any)=>x.logicalPath.includes('/composition-views/'))){
 const b=read(resolve(B,op.logicalPath)),a=read(resolve(K,op.logicalPath));
 const bp=roles(b.rootNodes,by),ap=roles(a.rootNodes,by);
 const actual=(v:any,p:any)=>new Set([...p.targetGoalIds].filter((id:any)=>by.has(id)&&goalMatchesFilters(convertLearningGoal(by.get(id),{landscapeId:l.landscapeId}),[v.scope.courseProfile])));
 const bt=actual(b,bp),at=actual(a,ap);
 const errors=compileCompositionView(a,l).findings.filter((f:any)=>f.severity==='error');assert.deepEqual(errors,[]);
 assert.deepEqual([...bt].filter(id=>!at.has(id)),[]);
 assert.deepEqual([...bp.prerequisiteOnlyGoalIds].sort(),[...ap.prerequisiteOnlyGoalIds].sort());
 rows.push({logicalPath:op.logicalPath,scope:a.scope,addedExistingActualTargets:[...at].filter(id=>!bt.has(id)),oldActualTargetsAllRetained:true,priorRolesExact:true,actualStockCompilerErrors:errors.length});
}
assert.equal(rows.length,10);assert.equal(rows.reduce((s,r)=>s+r.addedExistingActualTargets.length,0),12);
const data={role:'Actual read-only integrated Source8v2+SN existing-carrier finite view verification, not a science verdict or global APV run',actualViews:rows,wholeCanonicalGoals:l.goals.length,ordinaryCountUnchanged:437,existingActualTargetPlacementsAdded:12,stockErrors:0,globalRuns:0,HumanApproval:false,M7Claim:false};
writeFileSync(resolve(T,'source8-reviewed-L5-private-technical-integration-v1/CHECK.actual-ten-integrated-views.stock.json'),JSON.stringify(data,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({actualIntegratedViews:10,addedExistingTargets:12,ordinaryOrCanonicalChanges:0,stockErrors:0}));
