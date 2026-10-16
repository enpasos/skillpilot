// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
const R=process.cwd(), E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const L=R+'/tmp/chemie-m7-resumed-20261016/chemie-combined639-current-type-corrected-review-capsule-v1'
const S=E+'/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1'
const O=E+'/chemie-existing-seki-lab-cluster-four-sekii-support-placements-author-20261016-v1'
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const shared=read(S+'/CAS.eight-whole-views.author-inactive.json').operations
const land=read(L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const by=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]))
const {compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(R+'/app/src/utils/authoring/compositionViewAuthoring.ts')
const cluster='266a2b2a-9ee2-52f6-ae09-59343da9a60b', children=by.get(cluster).contains
assert.deepEqual(children,['416dfd33-8b43-5c49-903c-9847b95e4208','13d4f336-ab16-54a7-9479-c920b458f385'])
fs.mkdirSync(O+'/candidate',{recursive:true})
const operations=[],checks=[]
for(const file of ['de-de-gym-sekii-chemistry-gk.view.json','de-de-gym-sekii-chemistry-lk.view.json','de-he-sekii-gk.view.json','de-he-sekii-lk.view.json']){
 const op=shared.find((x:any)=>path.basename(x.beforePath)===file), normalPath='curricula/DE/Gymnasium/composition-views/chemie/'+file
 const before=op?.afterWhole??read(L+'/'+normalPath), rolesBefore=collectCompositionProjectionRoleGoalIds(before.rootNodes,by)
 assert.equal(before.scope.stage,'SekII');assert(!rolesBefore.targetGoalIds.has(cluster));assert(!rolesBefore.prerequisiteOnlyGoalIds.has(cluster))
 for(const id of children)assert(rolesBefore.prerequisiteOnlyGoalIds.has(id),'Both unchanged laboratory/safety atomic children must already be explicit support')
 assert(rolesBefore.targetGoalIds.has('a9c22adc-b543-5b0c-a2d8-3189facdff08')||rolesBefore.prerequisiteOnlyGoalIds.has('a9c22adc-b543-5b0c-a2d8-3189facdff08'))
 const after=structuredClone(before)
 after.rootNodes.push({kind:'structure',id:before.viewId+'-existing-seki-lab-interface-20261016',label:'Vorausgesetzte Grundlagen aus Sekundarstufe I',children:[{kind:'goalEntry',goalId:cluster,projectionRole:'prerequisiteOnly'}]})
 const rolesAfter=collectCompositionProjectionRoleGoalIds(after.rootNodes,by)
 assert.deepEqual(rolesAfter.targetGoalIds,rolesBefore.targetGoalIds)
 assert.deepEqual(new Set([...rolesAfter.prerequisiteOnlyGoalIds].filter(id=>id!==cluster)),rolesBefore.prerequisiteOnlyGoalIds)
 const findings=compileCompositionView(after,land).findings.filter((x:any)=>x.severity==='error');assert.equal(findings.length,0)
 const candidatePath=O+'/candidate/'+file;assert(!fs.existsSync(candidatePath));fs.writeFileSync(candidatePath,JSON.stringify(after,null,2)+'\n')
 operations.push({operation:'compare-and-swap-whole-view',targetPath:normalPath,dependsOnSharedEightViewCAS:!!op,beforeWhole:before,afterWhole:after,candidate:{path:candidatePath,sha256:sha(candidatePath)}})
 checks.push({file,targetIdsWholeSetUnchanged:true,supportAdditionExactly:[cluster],bothAtomicChildrenAlreadyExplicitSupport:children,orientationAlreadyActive:true,stockCompilerErrors:findings})
}
const whole={role:'Inactive AUTHOR candidate only; independent scope review required',basis:'The current SekII scopes explicitly retain both existing SekI laboratory/safety atomics as prerequisiteOnly but omit their existing canonical parent. Several retained foundational goals directly require that parent. Add only that exact interface, preserve the complete current target set and all prior support IDs. No new subject duty, prerequisite removal, card, canonical body, or assumed mastery is created.',dependsOn:{sharedCAS:S+'/CAS.eight-whole-views.author-inactive.json',sha256:sha(S+'/CAS.eight-whole-views.author-inactive.json')},unchangedWholeCluster:by.get(cluster),unchangedWholeChildren:children.map((id:string)=>by.get(id)),operations,checks,noExecutedBackendSession:true,HumanApproval:false,HumanTrial:false,M7Claim:false}
const p=O+'/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json';assert(!fs.existsSync(p));fs.writeFileSync(p,JSON.stringify(whole,null,2)+'\n')
console.log(JSON.stringify({path:p,sha256:sha(p),views:operations.length,compilerErrors:0,targetSetsUnchanged:true,supportOnlyOneExistingCluster:true}))
