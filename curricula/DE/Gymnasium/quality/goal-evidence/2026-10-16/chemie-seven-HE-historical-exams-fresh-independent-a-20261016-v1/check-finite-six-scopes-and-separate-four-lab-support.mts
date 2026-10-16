// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const R='/home/enpasos/projects/skillpilot',E=resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
const O=resolve(E,'chemie-seven-HE-historical-exams-fresh-independent-a-20261016-v1'),S=resolve(E,'chemie-shared-three-and-faraday-kind-current437-independent-a-20261016-v1')
const A=resolve(E,'chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1'),G=resolve(E,'chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1')
const K=resolve(R,'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1'),B=resolve(E,'chemie-existing-seki-lab-cluster-four-sekii-support-placements-author-20261016-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const first=resolve(O,'FIRST.seven-whole-exam-science-and-interface.independent-a.frozen.json'),labfirst=resolve(S,'ADDENDUM.separate-four-SekII-lab-cluster-support.science-first.independent-a.json')
assert.equal(sha(first),'sha256:1c680b291f8184fb14e14bcd5b1512e20960427aa5793147fc0340c12e55e78c')
assert.equal(sha(labfirst),'sha256:5a68d67bfc77d29c7592be44e99ae8096f8bbc75e59111c01c5a4809b26d1c23')
const canonical=read(resolve(G,'candidate/CANONICAL639.six-whole-goal-operations.author-inactive-v3.json'))
const exams=read(resolve(A,'CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json')).operations
const by=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
for(const op of exams){assert.deepEqual(by.get(op.goalId),op.before);by.set(op.goalId,op.after)}
canonical.goals=canonical.goals.map((g:any)=>by.get(g.id))
const sharedViews=read(resolve(G,'CAS.eight-whole-views.author-inactive.json')).operations
const labViews=read(resolve(B,'CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json')).operations
const {compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const roles=(v:any)=>{const x=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);return {target:new Set<string>([...x.targetGoalIds].filter((id:string)=>goalMatchesFilters(by.get(id),[v.scope.courseProfile,v.scope.jurisdiction].filter(Boolean)))),support:x.prerequisiteOnlyGoalIds}}
const lab='266a2b2a-9ee2-52f6-ae09-59343da9a60b',children=['416dfd33-8b43-5c49-903c-9847b95e4208','13d4f336-ab16-54a7-9479-c920b458f385'],labRows=[]
for(const op of labViews){
 const shared=sharedViews.find((s:any)=>s.viewId===op.beforeWhole.viewId)
 assert.deepEqual(op.beforeWhole,shared?.afterWhole??read(resolve(K,op.targetPath)))
 const restored=structuredClone(op.afterWhole),addition=restored.rootNodes.pop();assert.deepEqual(restored,op.beforeWhole)
 assert.deepEqual(addition.children,[{kind:'goalEntry',goalId:lab,projectionRole:'prerequisiteOnly'}])
 const b=roles(op.beforeWhole),a=roles(op.afterWhole);assert.deepEqual([...a.target].sort(),[...b.target].sort())
 assert.deepEqual([...a.support].filter(id=>!b.support.has(id)),[lab]);assert.ok([...b.support].every(id=>a.support.has(id)))
 for(const id of children){assert.ok(b.support.has(id));assert.ok(a.support.has(id));assert.ok(!a.target.has(id))}
 assert.ok(!a.target.has(lab));assert.deepEqual(by.get(lab).contains,children)
 const compile=compileCompositionView(op.afterWhole,canonical,canonical);assert.deepEqual(compile.findings.filter((f:any)=>f.severity==='error'),[])
 labRows.push({viewId:op.afterWhole.viewId,decision:'KEEP',exactOnlyAppendedExistingClusterSupport:true,targetSetExact:true,allOtherSupportExact:true,childrenAlreadySupport:children,stockCompileErrors:0,noMasteryAssigned:true})
}
const names=['de-he-gk','de-he-lk','de-he-sekii-gk','de-he-sekii-lk','de-de-gym-sekii-chemistry-gk','de-de-gym-sekii-chemistry-lk'],examRows=[]
for(const name of names){
 const path=`curricula/DE/Gymnasium/composition-views/chemie/${name}.view.json`,base=read(resolve(K,path))
 const shared=sharedViews.find((s:any)=>s.viewId===base.viewId)?.afterWhole??base
 const v=labViews.find((s:any)=>s.targetPath===path)?.afterWhole??shared
 const r=roles(v),compile=compileCompositionView(v,canonical,canonical);assert.deepEqual(compile.findings.filter((f:any)=>f.severity==='error'),[])
 for(const op of exams){const g=op.after;assert.ok(r.target.has(g.id),name+' missing assessment target '+g.id)
  const reqs=g.requires.map((id:string)=>({goalId:id,role:r.target.has(id)?'target':r.support.has(id)?'prerequisiteOnly':'OMITTED'}))
  assert.ok(reqs.every((x:any)=>x.role!=='OMITTED'),name+' direct requirement omitted '+g.id)
  examRows.push({viewId:v.viewId,goalId:g.id,stillAuthoredTarget:true,directRequirements:reqs,stockCompileErrors:0,draftHardCheckGateStillClosed:true})
 }
}
assert.equal(sha(first),'sha256:1c680b291f8184fb14e14bcd5b1512e20960427aa5793147fc0340c12e55e78c')
writeFileSync(resolve(O,'CHECK.independent-seven-exam-direct-interfaces.four-HE-and-two-generic-SekII.json'),JSON.stringify({role:'Independent finite six-scope stock role/compiler checks after FIRST. No full39/source-applicability matrix or executed Java session',firstScienceSHA256:sha(first),views:6,examOccurrences:examRows.length,rows:examRows,scope:'In-memory exact shared6 + seven exams + separate reviewed lab4; normal inputs unchanged',HumanApproval:false,HumanTrial:false,M7Claim:false},null,2)+'\n')
writeFileSync(resolve(S,'CHECK.separate-four-SekII-lab-cluster-support.stock-roles.json'),JSON.stringify({role:'Separate independent bounded four-view check; not part of seven-exam science',scienceAddendumSHA256:sha(labfirst),rows:labRows,otherCanonicalBodiesUnchanged:true,HumanApproval:false,HumanTrial:false,M7Claim:false},null,2)+'\n')
console.log(JSON.stringify({sevenExamOccurrences:examRows.length,scopes:6,missingDirectPrerequisites:0,labScopes:4,labTargetChanges:0,stockCompileErrors:0,scienceFirstExact:true}))
