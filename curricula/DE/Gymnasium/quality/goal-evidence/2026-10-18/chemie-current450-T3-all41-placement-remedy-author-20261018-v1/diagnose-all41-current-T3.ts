// SPDX-License-Identifier: Apache-2.0
// One finite integration; no reviewer vote, central completion or human claim.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {isDeepStrictEqual} from 'node:util'
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes'
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const out=base+'chemie-current450-T3-all41-placement-remedy-author-20261018-v1'
const author=base+'chemie-current450-T3-terminal-exams-author-20261018-v2/'
const bodyPath=base+'chemie-current450-T3-phosphate-bilingual-material-author-20261018-v4/AUTHOR.eighteen-exams.seventeen-whole-objects-exact.pending.json'
const reviewPath=base+'chemie-current450-T3-photometry-material-independent-a-20261018-v1/REVIEW.full18-task-bodies-and-current-context.independent-a.json'
const reviewC=base+'chemie-current450-T3-terminal-exams-informed-independent-c-20261018-v1/FIRST.actual-eighteen-whole-exams-informed-independent-c.json'
const delivery=base+'chemie-current450-T3-reviewed-resource-delivery-technical-20261018-v1/RECEIPT.actual-five-reviewed-resources-and-local-HTTP-delivery.json'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const held='61c1d898-07b3-53a0-b8a0-a7c49006eff9'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:any)=>createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}}
const dump=(x:any)=>JSON.stringify(x,null,2)+'\n'

const beforeRaw=readFileSync(canonical,'utf8'),before=JSON.parse(beforeRaw),semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw)
assert.equal(before.goals.length,662,'Unexpected graph baseline')
const inputs=[canonical,semantic,registry,bodyPath,reviewPath,reviewC,delivery,author+'AUTHOR.exact-selected-view-child-array-CAS.INACTIVE.json',author+'AUTHOR.sparse-existing-parent-contains-and-current-view-placement-proposals.INACTIVE.json',author+'AUTHOR.finite-T3-matrix.nineteen-existing-end-goals.json'].map(pin)
const protection=read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]).map(pin)
const accepted=read(reviewPath)
assert.deepEqual(accepted.acceptedWholeContainer,pin(bodyPath),'Review accepts different task bytes')
assert.equal(accepted.bodyClosure.acceptedNewWholeTaskBodies,18)
assert.equal(accepted.bodyClosure.openScientificTaskBodyFindings,0)
const candidates=read(bodyPath).goals.filter((g:any)=>g.id!==held)
assert.equal(candidates.length,17)
const selected=new Set<string>(candidates.map((g:any)=>g.id))
for(const g of candidates){const r=accepted.perGoalDecisions.find((r:any)=>r.goalId===g.id);assert(r?.actualWholeDEENTaskAndAnswerRead&&r?.allBilingualScoringCriteriaRead);assert.equal(r.verdict,'accept_whole_v4_task_solution_scoring_body');assert.equal(r.placementDecision,'reviewed_current_selected_finite_projection_pass')}
const currentInputs=read(author+'inputs/T3.nineteen-whole-current-goals-and-native-positive-profiles.json').records
const beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
for(const r of currentInputs)assert.deepEqual(beforeBy.get(r.goal.id),r.goal,'Ordinary expectation changed '+r.goal.id)
const after=structuredClone(before),by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const changes=read(author+'AUTHOR.sparse-existing-parent-contains-and-current-view-placement-proposals.INACTIVE.json').placements.filter((p:any)=>selected.has(p.endpointId))
const changedParents=new Set<string>()
for(const p of changes){const parent=by.get(p.parentGoalId);assert(parent);assert.deepEqual(beforeBy.get(p.parentGoalId).contains,p.parentBeforeContains);assert(!parent.contains.includes(p.endpointId));parent.contains.push(p.endpointId);changedParents.add(p.parentGoalId)}
const integrated=candidates.map((g:any)=>{const x=structuredClone(g);x.extendedData.authorProposal.authoredStatus=x.extendedData.authorProposal.status;x.extendedData.authorProposal.status='INTEGRATED_MACHINE_REVIEWED_ASSESSMENT_DESIGN';x.extendedData.assessmentDesignReview={reviewPaths:[reviewC,reviewPath],operativeMaterialDeliveryReceipt:delivery,actualLearnerExecution:false,humanApproval:false,humanTrial:false};assert.deepEqual(x.examData,g.examData);return x})
after.goals.push(...integrated)
assert.equal(after.goals.length,679)
const allIds=new Set(after.goals.map((g:any)=>g.id));assert.equal(allIds.size,679)
for(const edge of ['requires','contains']){
 const state=new Map<string,number>();const all=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));
 function visit(id:string){assert.notEqual(state.get(id),1,'Cycle '+edge+' '+id);if(state.get(id)===2)return;state.set(id,1);for(const next of all.get(id)[edge]??[]){assert(all.has(next),'Missing '+edge+' '+next);visit(next)}state.set(id,2)}
 for(const id of all.keys())visit(id)
}
const operations=read(author+'AUTHOR.exact-selected-view-child-array-CAS.INACTIVE.json').operations
const matrices=read(author+'AUTHOR.finite-T3-matrix.nineteen-existing-end-goals.json').matrix.filter((m:any)=>selected.has(m.endpointId))
const viewDir='curricula/DE/Gymnasium/composition-views/chemie/'
const views=readdirSync(viewDir).filter(n=>n.endsWith('.view.json')).map(n=>viewDir+n)
const viewWrites:any[]=[]
function childArray(v:any,ids:string[]){let a=v.rootNodes;for(const id of ids){const n=a.find((x:any)=>x.id===id);assert(n?.kind==='structure','Missing structure '+id);a=n.children}return a}
function project(raw:any,v:any){
 const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]));const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m)
 const landscape={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
 const p=applyCompositionViewProjection([landscape],normalizeCompositionView(v))[0]
 const projected=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(projected)
 const stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>()
 while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,projected,children)){const ps=parents.get(child)??new Set<string>();ps.add(id);parents.set(child,ps);stack.push(child)}}
 const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean)
 return{projected,seen,scope:v.scope,targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,parents}
}
const checks:any[]=[]
for(const path of views){
 const raw=readFileSync(path,'utf8'),v=JSON.parse(raw),a=structuredClone(v)
 for(const op of operations.filter((o:any)=>o.normalView.path===path)){
  assert.deepEqual(op.normalView,pin(path),'View before bytes changed')
  const arr=childArray(a,op.stableStructureIdPath)
  for(const ins of op.insertions.filter((x:any)=>selected.has(x.newNode.goalId))){const meta=ins.selectedAnchorMetadataCAS;const index=arr.findIndex((n:any)=>n.kind===meta.kind&&(meta.id?n.id===meta.id:n.goalId===meta.goalId));assert(index>=0);assert(!arr.some((n:any)=>n.goalId===ins.newNode.goalId));arr.splice(index+1,0,ins.newNode)}
 }
 const b=project(before,v),p=project(after,a)
 const expected=matrices.filter((m:any)=>m.currentTargetViews.some((q:any)=>q.path===path)).map((m:any)=>m.endpointId)
 const oldLost=[...b.targets].filter(id=>!p.targets.has(id)),oldAdded=[...p.targets].filter(id=>!b.targets.has(id)&&!selected.has(id))
 const newVisible=[...p.targets].filter(id=>selected.has(id)),missing=expected.filter((id:string)=>!p.targets.has(id)),extra=newVisible.filter(id=>!expected.includes(id))
 const absentPrerequisites=integrated.filter((g:any)=>p.targets.has(g.id)).flatMap((g:any)=>g.requires.filter((id:string)=>!p.targets.has(id)).map((id:string)=>({exam:g.id,requires:id})))
 const duplicateParents=newVisible.filter(id=>(p.parents.get(id)?.size??0)!==1)
 const roleChanged=before.goals.filter((g:any)=>b.roles.targetGoalIds.has(g.id)!==p.roles.targetGoalIds.has(g.id)||b.roles.prerequisiteOnlyGoalIds.has(g.id)!==p.roles.prerequisiteOnlyGoalIds.has(g.id)).map((g:any)=>g.id)
 const result={path,scope:v.scope,expected,newVisible,oldLost,oldAdded,missing,extra,absentPrerequisites,duplicateParents,roleChanged,details:newVisible.map(id=>{const g=integrated.find((g:any)=>g.id===id);return {examId:id,title:g.title,requires:g.requires,renderedParents:[...(p.parents.get(id)??[])],applicability:g.applicability,tags:g.tags,requiredDetails:g.requires.map((r:string)=>({id:r,title:by.get(r)?.title,target:p.targets.has(r),graphAvailable:p.projected.has(r),rendered:p.seen.has(r),applicability:by.get(r)?.applicability,tags:by.get(r)?.tags}))}})}
 checks.push(result)

 if(!isDeepStrictEqual(v,a))viewWrites.push({path,beforeRaw:raw,afterRaw:dump(a),beforePin:pin(path)})
}

const blockers=checks.filter(r=>r.oldLost.length+r.oldAdded.length+r.missing.length+r.extra.length+r.absentPrerequisites.length+r.duplicateParents.length+r.roleChanged.length)
writeFileSync(out+'/DIAG.actual-all41-before-remedy.json',dump({role:'ACTUAL_RUNTIME_IN_MEMORY_DIAGNOSIS_NO_NORMAL_WRITES',inputs,canonical:pin(canonical),candidateBody:pin(bodyPath),views:checks.length,heldEndpoint:held,checks,blockers,normalWrites:0}))
console.log(JSON.stringify({views:checks.length,blockerViews:blockers.length,blockers:blockers.map(r=>({path:r.path,scope:r.scope,extra:r.extra,missing:r.missing,absentPrerequisites:r.absentPrerequisites,duplicateParents:r.duplicateParents,oldLost:r.oldLost,oldAdded:r.oldAdded,roleChanged:r.roleChanged,details:r.details.filter((d:any)=>r.extra.includes(d.examId)||r.absentPrerequisites.some((a:any)=>a.exam===d.examId))}))}))
