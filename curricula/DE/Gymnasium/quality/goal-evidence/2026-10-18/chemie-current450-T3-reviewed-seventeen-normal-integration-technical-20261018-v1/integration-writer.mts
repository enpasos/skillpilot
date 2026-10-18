// SPDX-License-Identifier: Apache-2.0
// One finite integration; no reviewer vote, central completion or human claim.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,existsSync,unlinkSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {isDeepStrictEqual} from 'node:util'
import {convertLearningGoal} from '../app/src/goalTypes'
import {applyCompositionViewProjection} from '../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../app/src/utils/goalFilters'
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const out=base+'chemie-current450-T3-reviewed-seventeen-normal-integration-technical-20261018-v1'
const author=base+'chemie-current450-T3-terminal-exams-author-20261018-v2/'
const bodyPath=base+'chemie-current450-T3-phosphate-bilingual-material-author-20261018-v4/AUTHOR.eighteen-exams.seventeen-whole-objects-exact.pending.json'
const reviewPath=base+'chemie-current450-T3-photometry-material-independent-a-20261018-v1/REVIEW.full18-task-bodies-and-current-context.independent-a.json'
const reviewC=base+'chemie-current450-T3-terminal-exams-informed-independent-c-20261018-v1/FIRST.actual-eighteen-whole-exams-informed-independent-c.json'
const delivery=base+'chemie-current450-T3-reviewed-resource-delivery-technical-20261018-v1/RECEIPT.actual-five-reviewed-resources-and-local-HTTP-delivery.json'
const roleRemedy=base+'chemie-current450-T3-all41-placement-remedy-author-20261018-v1/AUTHOR.four-view-sparse-root-role-overrides.pending.json'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const held='61c1d898-07b3-53a0-b8a0-a7c49006eff9'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:any)=>createHash('sha256').update(b).digest('hex')
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:sha(b),bytes:b.length}}
const dump=(x:any)=>JSON.stringify(x,null,2)+'\n'
assert(!existsSync(out),'Refuse to overwrite completed evidence')
const beforeRaw=readFileSync(canonical,'utf8'),before=JSON.parse(beforeRaw),semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw)
assert.equal(before.goals.length,662,'Unexpected graph baseline')
const inputs=[canonical,semantic,registry,bodyPath,reviewPath,reviewC,delivery,author+'AUTHOR.exact-selected-view-child-array-CAS.INACTIVE.json',author+'AUTHOR.sparse-existing-parent-contains-and-current-view-placement-proposals.INACTIVE.json',author+'AUTHOR.finite-T3-matrix.nineteen-existing-end-goals.json'].map(pin)
assert.equal(pin(roleRemedy).sha256,'56c3cfb264873538da99c7e5952641dfd9502102ccce7267f0bbb815687f26e3')
inputs.push(pin(roleRemedy))
const roleOps=read(roleRemedy).operations
assert.equal(roleOps.length,4)
assert.equal(roleOps.reduce((n:number,o:any)=>n+o.append.length,0),22)
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
 return{targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,parents}
}
const checks:any[]=[]
for(const path of views){
 const raw=readFileSync(path,'utf8'),v=JSON.parse(raw),a=structuredClone(v)
 for(const op of operations.filter((o:any)=>o.normalView.path===path)){
  assert.deepEqual(op.normalView,pin(path),'View before bytes changed')
  const arr=childArray(a,op.stableStructureIdPath)
  for(const ins of op.insertions.filter((x:any)=>selected.has(x.newNode.goalId))){const meta=ins.selectedAnchorMetadataCAS;const index=arr.findIndex((n:any)=>n.kind===meta.kind&&(meta.id?n.id===meta.id:n.goalId===meta.goalId));assert(index>=0);assert(!arr.some((n:any)=>n.goalId===ins.newNode.goalId));arr.splice(index+1,0,ins.newNode)}
 }
 for(const op of roleOps.filter((o:any)=>o.normalView.path===path)){
  assert.deepEqual(op.normalView,pin(path),'Role remedy view drift')
  assert.equal(v.scope.jurisdiction,'DE-HE')
  for(const entry of op.append){assert(selected.has(entry.goalId));assert.equal(entry.kind,'goalEntry');assert.equal(entry.projectionRole,'prerequisiteOnly');assert(!a.rootNodes.some((n:any)=>n.kind==='goalEntry'&&n.goalId===entry.goalId));a.rootNodes.push(entry)}
  assert.deepEqual(a,read(op.candidateWholeView.path),'Independent role application differs from sealed author view')
 }
 const b=project(before,v),p=project(after,a)
 const expected=matrices.filter((m:any)=>m.currentTargetViews.some((q:any)=>q.path===path)).map((m:any)=>m.endpointId)
 const oldLost=[...b.targets].filter(id=>!p.targets.has(id)),oldAdded=[...p.targets].filter(id=>!b.targets.has(id)&&!selected.has(id))
 const newVisible=[...p.targets].filter(id=>selected.has(id)),missing=expected.filter((id:string)=>!p.targets.has(id)),extra=newVisible.filter(id=>!expected.includes(id))
 const absentPrerequisites=integrated.filter((g:any)=>p.targets.has(g.id)).flatMap((g:any)=>g.requires.filter((id:string)=>!p.targets.has(id)).map((id:string)=>({exam:g.id,requires:id})))
 const duplicateParents=newVisible.filter(id=>(p.parents.get(id)?.size??0)!==1)
 const roleChanged=before.goals.filter((g:any)=>b.roles.targetGoalIds.has(g.id)!==p.roles.targetGoalIds.has(g.id)||b.roles.prerequisiteOnlyGoalIds.has(g.id)!==p.roles.prerequisiteOnlyGoalIds.has(g.id)).map((g:any)=>g.id)
 const oldParentChanges=[...b.targets].filter(id=>!isDeepStrictEqual([...(b.parents.get(id)??[])].sort(),[...(p.parents.get(id)??[])].sort()))
 const result={path,expected,newVisible,oldLost,oldAdded,missing,extra,absentPrerequisites,duplicateParents,roleChanged,oldParentChanges}
 checks.push(result)
 assert.equal(oldLost.length+oldAdded.length+missing.length+extra.length+absentPrerequisites.length+duplicateParents.length+roleChanged.length+oldParentChanges.length,0,'Projection mismatch '+JSON.stringify(result))
 if(!isDeepStrictEqual(v,a))viewWrites.push({path,beforeRaw:raw,afterRaw:dump(a),beforePin:pin(path)})
}
const semanticAfter=structuredClone(sem)
for(const id of changedParents){const row=semanticAfter.decisions.find((r:any)=>r.goalId===id);assert(row);row.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(id))}
for(const g of integrated)semanticAfter.decisions.push({goalId:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'machine-reviewed-own-local-assessment-T3-20261018-body-A-C-and-bounded-material-followups'})
semanticAfter.counts.practiceAssessment+=17;semanticAfter.counts.total+=17
assert.equal(semanticAfter.counts.curricularAtomic,450,'Never change ordinary denominator through assessment integration')
// Patch only changed parent blocks and append new nodes; keep all 450 ordinary bodies exact.
const marker='\n  "goals": [\n',start=beforeRaw.indexOf(marker)+marker.length,end=beforeRaw.lastIndexOf('\n  ]')
assert(start>=marker.length&&end>start)
const body=beforeRaw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!)
assert.equal(starts.length,before.goals.length)
let patched=''
for(let i=0;i<starts.length;i++){const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));assert.equal(g.id,before.goals[i].id);patched+=changedParents.has(g.id)?'    '+JSON.stringify(by.get(g.id),null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part}
patched=patched.replace(/\s*$/,'')+',\n'+integrated.map((g:any)=>'    '+JSON.stringify(g,null,2).replace(/\n/g,'\n    ')).join(',\n')
const afterRaw=beforeRaw.slice(0,start)+patched+beforeRaw.slice(end)
assert.deepEqual(JSON.parse(afterRaw),after)
for(const g of before.goals)if(!changedParents.has(g.id))assert.deepEqual(after.goals.find((x:any)=>x.id===g.id),g)
const original='app/scripts/generateCurriculumQualityStatus.ts',probe='app/scripts/.__chemie450_T3_route_probe.ts',originalPin=pin(original)
let beforeRoute:any,afterRoute:any
try{
 writeFileSync(probe,readFileSync(original,'utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'})
 const mod:any=await import(pathToFileURL(resolve(probe)).href),profile=mod.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2')
 beforeRoute=mod.evaluateRouteProfile(before,profile,{reports:[]});afterRoute=mod.evaluateRouteProfile(after,profile,{reports:[]})
 const prev=beforeRoute.rules.find((r:any)=>r.id==='CQR-101').metrics,next=afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics
 assert.equal(prev.missingMotivationPath,0);assert.equal(next.missingMotivationPath,0);assert.equal(prev.missingTerminalPath,103);assert(next.missingTerminalPath<103)
}finally{if(existsSync(probe))unlinkSync(probe)}
assert.deepEqual(pin(original),originalPin)
assert.deepEqual(inputs.slice(0,3),[canonical,semantic,registry].map(pin),'Normal CAS drift')
for(const v of viewWrites)assert.deepEqual(pin(v.path),v.beforePin)
assert.deepEqual(protection,protection.map(p=>pin(p.path)))
mkdirSync(out)
writeFileSync(out+'/BEFORE.canonical.exact.json.snapshot',beforeRaw,{flag:'wx'})
writeFileSync(out+'/BEFORE.semantic-kinds.exact.json.snapshot',semRaw,{flag:'wx'})
mkdirSync(out+'/before-views')
for(const v of viewWrites)writeFileSync(out+'/before-views/'+v.path.split('/').pop()+'.snapshot',v.beforeRaw,{flag:'wx'})
writeFileSync(canonical,afterRaw);writeFileSync(semantic,dump(semanticAfter))
for(const v of viewWrites)writeFileSync(v.path,v.afterRaw)
assert.deepEqual(read(canonical),after)
assert.deepEqual(protection,protection.map(p=>pin(p.path)))
assert.deepEqual(pin(registry),inputs[2])
writeFileSync(out+'/integration-writer.mts',readFileSync('tmp/integrate_chemie450_T3_reviewed_seventeen.mts'),{flag:'wx'})
writeFileSync(out+'/REVIEW.bounded-four-view-role-delta.root.json',dump({role:'INFORMED_INDEPENDENT_ROOT_REVIEW_OF_NEW_ROLE_DELTA_ONLY_NOT_WHOLE_TASK_SCIENCE',reviewer:'/root',author:'/root/chemie_orientation_independent_a',acceptedCandidate:pin(roleRemedy),verdict:'ACCEPT_EXACT_22_NEW_GRAPH_ONLY_ROLES_IN_FOUR_HE_VIEWS',actualIndependentCheck:checks,assessment:'These finite explicit scope assignments override the broad practice-subtree inheritance only for the new assessment IDs. Their whole assessed ordinary competencies are not target goals in these four scopes. They therefore remain graph-only, without claiming that they are prerequisites or supplied learner tasks. No existing target, support role or rendered parent is changed; no new ordinary scope, runtime inference or source credit is introduced.',oldGraphOnlyRolesUnchanged:true,taskBodyApprovalClaim:false,humanApproval:false,normalWritesByReview:false}),{flag:'wx'})
const beforeMetrics=beforeRoute.rules.find((r:any)=>r.id==='CQR-101').metrics,afterMetrics=afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics
writeFileSync(out+'/RECEIPT.actual-T3-seventeen-assessment-integration.json',dump({role:'REVIEWED_ASSESSMENT_DESIGN_INTEGRATION_NOT_NEW_ORDINARY_SCIENTIFIC_APPROVAL',inputs,integratedEndpointIds:[...selected],heldEndpoint:{id:held,reason:'SN optional film-fixing source-cell binding pending; not integrated or silently counted'},viewChecks:checks,changedViewCount:viewWrites.length,canonicalParentsChanged:[...changedParents],beforeRoute,afterRoute,outputs:[canonical,semantic,...viewWrites.map(v=>v.path)].map(pin),protectedInputs:protection,registryUnchanged:true,progress:{newAssessmentDesigns:17,recoveredTerminalRoutes:beforeMetrics.missingTerminalPath-afterMetrics.missingTerminalPath,missingMotivation:afterMetrics.missingMotivationPath,missingTerminal:afterMetrics.missingTerminalPath,newOrdinaryScientificFirstCompletions:0,newNativeDOrPBindings:0},limits:{fullCentralReportNotRun:true,applicabilityAndDependentSourceGatesPending:true,finalNativePageAndProfileBindingsPending:true,M7Claim:false,newStandCIPassed:false,humanApproval:false,humanTrial:false,actualLearnerPerformance:false}}),{flag:'wx'})
const files=readdirSync(out).filter(n=>n!=='before-views').map(n=>pin(out+'/'+n))
for(const n of readdirSync(out+'/before-views'))files.push(pin(out+'/before-views/'+n))
writeFileSync(out+'/SEAL.actual-seventeen-assessment-integration.json',dump({role:'TECHNICAL_INTEGRATION_NOT_REVIEW_VOTE',files,outputs:[canonical,semantic,...viewWrites.map(v=>v.path)].map(pin),historicalEvidenceUnmodified:true}),{flag:'wx'})
console.log(JSON.stringify({out,integrated:17,viewsChecked:checks.length,viewsChanged:viewWrites.length,before:beforeMetrics,after:afterMetrics,ordinaryBodiesPreserved:true,protectedInputsPreserved:true}))
