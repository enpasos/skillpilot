import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-methods4-v2-split3-current578-inactive-composition-technical-20261016-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const manifest=read(path.join(out,'VIEWS26.whole-composed-current-CAS-and-delta.neutral.json'))
const original=read(read(path.join(out,'GOALS.exact-five-before-after-eight-new-CAS.neutral.json')).baseCanonical.path)
const current=read(path.join(out,'candidate/CANONICAL.current586.composed-current578-whole-inactive.json'))
const oldMap=new Map<string,any>(original.goals.map((g:any)=>[g.id,g]))
const newMap=new Map<string,any>(current.goals.map((g:any)=>[g.id,g]))
const newIds=new Set<string>(read(path.join(out,'DENOMINATOR.current-and-prospective-no-normal-semantic-votes.json')).wholeNewGoalIds)
const children=['2d16528c-1424-5999-b3d2-af4593a147fc','cc5a626a-dc85-57e2-b422-259f92901545','0959eef2-3c7d-5b33-a109-ddf332a5dbd9','4d9defde-d3bc-5c43-83ff-9cf6f2930643','4955f745-b946-5d3d-82d6-5e52dc8549a3','f57d53b0-5bdf-5998-81f4-8bfb2fc5bde7']
const role=(p:any,id:string)=>p.targetGoalIds.has(id)?'target':p.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent'
const roots=new Map([[current.landscapeId,'442c31c5-c561-5c7a-90bb-2335d779175c']])
const rows:any[]=[]
for(const m of manifest.views){
 const afterView=read(m.wholeAfterCandidate.path)
 const before=collectCompositionProjectionRoleGoalIds(m.wholeBeforeView.rootNodes,oldMap,roots)
 const after=collectCompositionProjectionRoleGoalIds(afterView.rootNodes,newMap,roots)
 const removed=[...before.targetGoalIds].filter(id=>!after.targetGoalIds.has(id)).sort()
 assert.deepEqual(removed,[],m.normalViewPath+' lost existing targets')
 const allowedExistingAdditions=m.normalViewPath.includes('de-bb-gk')||m.normalViewPath.includes('de-be-gk')?['978a6f25-0601-5457-9211-aab206c95603']:[]
 const otherAdded=[...after.targetGoalIds].filter(id=>!before.targetGoalIds.has(id)&&!newIds.has(id)&&!allowedExistingAdditions.includes(id)).sort()
 assert.deepEqual(otherAdded,[],m.normalViewPath+' invented unrelated target roles')
 if(m.normalViewPath.includes('de-he-')){
   for(const id of children)assert.equal(role(after,id),id===children[2]?'target':'prerequisiteOnly','HE-GK '+id)
 }
 if(m.normalViewPath.includes('de-ni-'))assert.equal(role(after,'5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d'),'target','NI GC')
 if(m.normalViewPath.includes('de-bb-gk')||m.normalViewPath.includes('de-be-gk'))assert.equal(role(after,'978a6f25-0601-5457-9211-aab206c95603'),'target','BB/BE GK planar chromatography')
 if(m.normalViewPath.includes('de-ni-lk'))assert.equal(role(after,'413c5ee5-7826-549f-ad76-63743c59b188'),'target','413 must not be retired')
 assert.equal(role(after,'4a7dee38-1056-5e27-acec-e6a12f58109f'),'absent','RP elective must not be unconditionally introduced')
 rows.push({normalViewPath:m.normalViewPath,scope:afterView.scope,allExistingTargetRolesRetained:true,noUnrelatedAddedTargetRoles:true,
  newGoalRoles:[...newIds].sort().map(id=>({goalId:id,role:role(after,id)})),targetCountBefore:before.targetGoalIds.size,targetCountAfter:after.targetGoalIds.size,
  fullCourseApproval:false})
}
const variants=read(path.join(out,'VIEWS3.conditional-elective-only-composed-proposals.HOLD.json')).variants
for(const v of variants){
 const b=read(v.jointUnconditionalBefore.path);const a=read(v.wholeConditionalCandidate.path)
 const before=collectCompositionProjectionRoleGoalIds(b.rootNodes,newMap,roots)
 const after=collectCompositionProjectionRoleGoalIds(a.rootNodes,newMap,roots)
 assert.deepEqual([...before.targetGoalIds].filter(id=>!after.targetGoalIds.has(id)),[])
 const id=v.normalViewPath.includes('de-rp-')?'4a7dee38-1056-5e27-acec-e6a12f58109f':'5cd8b2a2-2c90-5e29-8061-dd5e3a682f9d'
 assert.equal(role(after,id),'target')
}
const purposes=read(path.join(out,'VIEWS47.actual-H-prioritized-purpose-inventory.neutral.json')).purposes
const purposeRows=purposes.map((m:any)=>{
 const v=read(m.wholeCurrentCandidate.path)
 const p=collectCompositionProjectionRoleGoalIds(v.rootNodes,newMap,roots)
 const referenced=new Set<string>()
 const walk=(nodes:any[])=>nodes.forEach(n=>{if(n.goalId)referenced.add(n.goalId);if(n.children)walk(n.children)})
 walk(v.rootNodes)
 assert.deepEqual([...referenced].filter(id=>!newMap.has(id)),[],m.viewId+' dangling actual references')
 return {purposeIndex:m.purposeIndex,viewId:m.viewId,scope:m.scope,allDirectGoalReferencesResolve:true,targetCount:p.targetGoalIds.size,
  newGoalRoles:[...newIds].sort().map(id=>({goalId:id,role:role(p,id)})),noNewSourcebookOrCourseApproval:true}
})
fs.writeFileSync(path.join(out,'CHECK.actual-repository-role-compiler-26-and-47-purposes.json'),JSON.stringify({
 status:'PASS_bounded_technical_role_and_reference_assertions',rows,conditionalVariantCount:variants.length,purposeRows,
 usedExistingRepositoryCompiler:true,noRuntimeCodeModification:true,noBackendLearnerOrCardVisibilityExecution:true,
 newScientificVotes:0,HumanApproval:false,HumanTrial:false,
},null,2)+'\n')
console.log(JSON.stringify({status:'PASS technical role assertions',changedViews:rows.length,conditionalVariants:variants.length,purposes:purposeRows.length}))
