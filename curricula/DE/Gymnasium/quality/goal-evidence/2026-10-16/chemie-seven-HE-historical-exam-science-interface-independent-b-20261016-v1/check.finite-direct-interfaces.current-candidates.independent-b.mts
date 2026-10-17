// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve} from 'node:path'
const E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
const O=`${E}/chemie-seven-HE-historical-exam-science-interface-independent-b-20261016-v1`
const K=resolve('tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const l=read(`${K}/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json`)
const by=new Map<string,any>(l.goals.map((g:any)=>[g.id,g]))
const seven=read(`${E}/chemie-seven-HE-historical-exam-atomic-interface-and-material-author-successor-20261016-v1/CAS.seven-WHOLE-exams.current639.AUTHOR.inactive.json`).operations
for(const op of seven)by.set(op.goalId,op.after)
for(const op of read(`${E}/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1/CAS.six-whole-goal-operations.author-inactive-v3.json`).operations)by.set(op.goalId,op.afterWhole)
const dir=`${K}/curricula/DE/Gymnasium/composition-views/chemie`,views=new Map<string,any>()
for(const f of readdirSync(dir).filter(f=>f.endsWith('.json')))views.set(f,read(`${dir}/${f}`))
for(const op of read(`${E}/chemie-shared-carrier-three-boundaries-and-generic-four-view-author-successor-20261016-v1/CAS.eight-whole-views.author-inactive.json`).operations)views.set(op.name+'.view.json',op.afterWhole)
for(const op of read(`${E}/chemie-existing-seki-lab-cluster-four-sekii-support-placements-author-20261016-v1/CAS.four-whole-views.existing-lab-cluster-only.author-inactive.json`).operations)views.set(op.targetPath.split('/').at(-1),op.afterWhole)
const {collectCompositionProjectionRoleGoalIds:roles}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const diagnostic=read(`${E}/chemie-current437-nine-targeted-native-pages-combined639-technical-20261016-v1/CHECK.actual-combined639-stock82-and39views.before-Fruit-practical-placement.json`)
const ids=new Set<string>(seven.map((o:any)=>o.goalId)),checks=[]
function leaves(id:string):string[]{const g=by.get(id);if(!g.contains?.length)return [id];let c=g.contains.filter((x:string)=>by.has(x));if(c.some((x:string)=>!by.get(x).tags?.length||by.get(x).tags.includes('GK')))c=c.filter((x:string)=>!by.get(x).tags?.length||by.get(x).tags.includes('GK'));return [...new Set(c.flatMap((x:string)=>leaves(x)))]}
for(const viewInfo of diagnostic.views){
 const view=views.get(viewInfo.file);assert.ok(view)
 const r=roles(view.rootNodes,by),allowed=new Set<string>([...r.targetGoalIds,...r.prerequisiteOnlyGoalIds])
 for(const terminal of viewInfo.terminals.filter((t:any)=>ids.has(t.goalId))){
  const g=by.get(terminal.goalId);assert.ok(r.targetGoalIds.has(g.id))
  const missing=g.requires.filter((id:string)=>!allowed.has(id))
  const clusterLeaves=g.requires.flatMap((id:string)=>allowed.has(id)?leaves(id).filter(x=>!allowed.has(x)).map(x=>({cluster:id,leaf:x})):[])
  assert.deepEqual(missing,[]);assert.deepEqual(clusterLeaves,[])
  checks.push({view:viewInfo.file,scope:view.scope,goalId:g.id,actualRequires:g.requires.map((id:string)=>({id,role:r.targetGoalIds.has(id)?'target':'prerequisiteOnly'})),missingImmediateDirectRequirements:missing,missingGlobalCoreClusterLeaves:clusterLeaves,reviewStatus:g.examData.reviewStatus})
 }
}
assert.equal(checks.filter(x=>x.scope.jurisdiction==='DE-HE').length,28)
writeFileSync(`${O}/CHECK.finite-seven-all-current-targeted-direct-interfaces.independent-b.json`,JSON.stringify({role:'Bounded source-based current-candidate interface witness after science; actual stock explicit-role collector; not an executed learner session',hypotheticalInMemoryOnly:true,actualSevenTargetedViewOccurrences:checks.length,HEFourViews28Occurrences:true,rows:checks,missingDirectOrGlobalCoreLeaf:0,draftReleaseGateRemains:true,otherRouteOrScienceHoldsNotWaived:true,normalWrites:false,HumanApproval:false,HumanTrial:false,M7Claim:false},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({targetedOccurrences:checks.length,HE:28,immediateBoundaries:0,executedBackendSession:false}))
