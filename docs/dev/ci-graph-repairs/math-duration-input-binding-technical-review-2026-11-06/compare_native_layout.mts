import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {normalizeCanonicalLandscape} from '../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {applyCompositionViewProjection} from '../../app/src/utils/compositionViewRuntime.ts'
import {convertLearningGoal} from '../../app/src/goalTypes.ts'
import {goalMatchesFilters} from '../../app/src/utils/goalFilters.ts'
const root=resolve(import.meta.dirname,'../..'),base=resolve(root,'tmp/math-duration-split-binding-review-2026-11-06')
const path='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const old=JSON.parse(execFileSync('git',['show','5cb5e567d08bc9f640942529d9099cbce03a4747:'+path],{cwd:root,maxBuffer:50*1024*1024}).toString())
const current=JSON.parse(readFileSync(resolve(root,path),'utf8'))
const oldCanonical=normalizeCanonicalLandscape(old),newCanonical=normalizeCanonicalLandscape(current)
const policy=JSON.parse(readFileSync(resolve(root,'app/scripts/config/math-duration-split-spanning-tree-policy.json'),'utf8'))
const files=[...policy.sek1Templates.map((x:any)=>x.fileName),...policy.crossStageTemplates.map((x:any)=>x.outputFileName)]
assert.equal(new Set(files).size,18)
const changedMemory=new Set(['ca708087-71f8-5fae-91c5-b80721a4208f','bd55594a-3e06-5097-8324-4f2f1349fd2a','ffbdd7a9-45c6-54f1-988c-58256ca05eeb','1eb0b286-2dac-5164-8d39-cd36c5704bc4'])
const rows=[]
for(const file of files){
 const a=readFileSync(resolve(base,'old-views',file)),b=readFileSync(resolve(base,'candidate-views',file));assert.equal(a.toString(),b.toString(),file+' bytes')
 const view=normalizeCompositionView(JSON.parse(a.toString()))
 const left=compileCompositionView(view,oldCanonical),right=compileCompositionView(view,newCanonical)
 assert.deepEqual(left,right,file+' entire compiled tree/findings')
 assert.equal(left.findings.filter((x:any)=>x.severity==='error').length,0,file+' genuine compiler success')
 const oldRoles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(oldCanonical.goals.map(g=>[g.id,g])))
 const newRoles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(newCanonical.goals.map(g=>[g.id,g])))
 for(const k of ['targetGoalIds','prerequisiteOnlyGoalIds'] as const)assert.deepEqual([...oldRoles[k]].sort(),[...newRoles[k]].sort(),file+' '+k)
 const oldUi=old.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:old.landscapeId})),newUi=current.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:current.landscapeId}))
 const oldProjected=applyCompositionViewProjection([{meta:old,goals:oldUi}],view)[0].goals,newProjected=applyCompositionViewProjection([{meta:current,goals:newUi}],view)[0].goals
 assert.equal(oldProjected.length,newProjected.length);const allowedPayloadDeltas=[]
 for(let i=0;i<oldProjected.length;i++){
  const x=oldProjected[i],y=newProjected[i];assert.equal(x.id,y.id,file+' UI order')
  if(JSON.stringify(x)!==JSON.stringify(y)){
   assert(changedMemory.has(x.id),file+' unapproved goal payload change '+x.id)
   assert.deepEqual({...x,requires:undefined,effectiveRequires:undefined},{...y,requires:undefined,effectiveRequires:undefined},file+' non-prerequisite UI payload')
   allowedPayloadDeltas.push({goalId:x.id,oldRequires:x.requires,newRequires:y.requires,oldEffectiveRequires:x.effectiveRequires,newEffectiveRequires:y.effectiveRequires})
  }
 }
 const filters=[view.scope.jurisdiction,view.scope.durationModel,view.scope.courseProfile].filter(Boolean) as string[]
 const selected=(ui:any[],roles:any)=>ui.filter(g=>roles.targetGoalIds.has(g.id)&&g.contains.length===0&&goalMatchesFilters(g,filters)).map(g=>g.id).sort()
 assert.deepEqual(selected(oldUi,oldRoles),selected(newUi,newRoles),file+' filtered atomic targets')
 rows.push({fileName:file,sha256:createHash('sha256').update(a).digest('hex'),scope:view.scope,targetRoleGoalCount:oldRoles.targetGoalIds.size,supportRoleGoalCount:oldRoles.prerequisiteOnlyGoalIds.size,filteredAtomicTargets:selected(oldUi,oldRoles),compilerErrors:0,allFindingsEqual:true,compiledTreeAndOrderEqual:true,targetAndSupportSetsEqual:true,nativeUiLayoutAndAllOtherPayloadFieldsEqual:true,onlyPreviouslyAuthorizedMemoryRequiresAndEffectiveRequiresPayloadDeltas:allowedPayloadDeltas})
 console.log('PASS',file)
}
writeFileSync(resolve(base,'native-layout-comparison.json'),JSON.stringify({status:'PASS',outputs:rows,all18ExactGeneratedBytes:true,all18NativeTreeRoleScopeMembershipEqual:true,requiresDifferencesNotErasedFromClaim:'Native UI output retains the four authorized Memory prerequisite edits; no claim of full goal payload equality across the source repair.',noLiveWrites:true},null,2)+'\n')
