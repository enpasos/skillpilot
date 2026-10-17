import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {collectCompositionProjectionRoleGoalIds as roles,compileCompositionView} from '../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {convertLearningGoal} from '../../app/src/goalTypes.ts';
import {goalMatchesFilters} from '../../app/src/utils/goalFilters.ts';
const T=resolve('tmp/chemie-m7-resumed-20261016'),L=resolve(T,'chemie-shared640-recycling-native-author-capsule-L6-v1'),B=resolve(T,'chemie-combined639-source8-reviewed-integration-capsule-L5-v1');
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const canPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const can=read(resolve(L,canPath)),old=read(resolve(B,canPath));
const by=new Map<string,any>(can.goals.map((g:any)=>[g.id,g])),before=new Map<string,any>(old.goals.map((g:any)=>[g.id,g]));
const receipt=read(resolve(T,'HE-v2-reviewed-L6-private-integration.actual.json'));
const compilers=[];
for(const path of receipt.uniqueFinalViews){
 const view=read(resolve(L,path));const errors=compileCompositionView(view,can).findings.filter((f:any)=>f.severity==='error');
 assert.deepEqual(errors,[]);compilers.push({path,actualStockErrors:errors.length});
}
const scopes=read(resolve(L,'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json')).visibilityScopes;
const contexts=[],new459=[];const missing=[];
const isTarget=(id:string,v:any,p:any,m:Map<string,any>)=>p.targetGoalIds.has(id)&&m.has(id)&&goalMatchesFilters(convertLearningGoal(m.get(id),{landscapeId:can.landscapeId}),[v.scope.courseProfile]);
for(const {viewPath:path} of scopes){
 const v=read(resolve(L,path)),p=roles(v.rootNodes,by),bv=read(resolve(B,path)),bp=roles(bv.rootNodes,before);
 for(const id of receipt.uniqueExistingChangedGoalIds){
  if(!isTarget(id,v,p,by))continue;
  for(const prior of by.get(id).requires??[]){
   if((before.get(id).requires??[]).includes(prior))continue;
   const role=isTarget(prior,v,p,by)?'target':p.prerequisiteOnlyGoalIds.has(prior)?'prerequisiteOnly':'missing';
   const row={viewPath:path,goalId:id,newPrior:prior,role};contexts.push(row);if(role==='missing')missing.push(row);
  }
 }
 const id='459724db-9f9a-5967-8d9a-2b6277415275';
 if(isTarget(id,v,p,by))for(const prior of by.get(id).requires){
  const role=isTarget(prior,v,p,by)?'target':p.prerequisiteOnlyGoalIds.has(prior)?'prerequisiteOnly':'missing';
  const row={viewPath:path,goalId:id,prior,role};new459.push(row);if(role==='missing')missing.push(row);
 }
}
assert.equal(compilers.length,9);assert.equal(contexts.length,97);assert.equal(new459.length,8);assert.deepEqual(missing,[]);
const out=resolve(T,'CHECK.actual-applied-L6-nine-compilers-39-views-97-new-priors-and-eight-new459-contexts.json');
writeFileSync(out,JSON.stringify({role:'Actual applied finite stock compiler/role check; no complete transitive-source or M7 verdict',actualOwnedViewCompilers:compilers,actualViews:scopes.length,newDirectContexts:contexts,new459DirectAcquisitionContexts:new459,newMissingDirectContexts:missing,limits:['Preexisting transitive role boundaries remain separately documented; no full39closure waiver'],normalWrites:0,HumanApproval:false,M7Claim:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({actualIntegratedStockCompilers:9,actualViews:scopes.length,newDirectContexts:contexts.length,new459Contexts:new459.length,missing:missing.length,output:out}));
