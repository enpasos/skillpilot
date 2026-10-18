// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,unlinkSync} from 'node:fs'
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
const out=base+'chemie-current450-SN-reviewed-pair-normal-integration-technical-20261018-v1'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const proposal=base+'chemie-current450-SN-film-fixing-paired-placement-author-20261018-v2/AUTHOR.one-whole-SN-view-before-after.pending.json'
const pairReview=base+'chemie-current450-T3-photometry-material-independent-a-20261018-v1/REVIEW.SN-paired-source-course-prerequisite-placement.independent-a.json'
const bodies=base+'chemie-current450-T3-phosphate-bilingual-material-author-20261018-v4/AUTHOR.eighteen-exams.seventeen-whole-objects-exact.pending.json'
const bodyReview=base+'chemie-current450-T3-photometry-material-independent-a-20261018-v1/REVIEW.full18-task-bodies-and-current-context.independent-a.json'
const sourceReceipt=base+'chemie-current450-SN-film-source-binding-normal-integration-technical-20261018-v1/RECEIPT.actual-existing-source-fit-binding-integration.json'
const id='61c1d898-07b3-53a0-b8a0-a7c49006eff9',ordinary='f4f7f028-10db-53f9-bdae-456e0c6d0896',parent='5964272f-e835-5a24-b2b1-c162be6b75cb'
const view='curricula/DE/Gymnasium/composition-views/chemie/de-sn-gk.view.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),dump=(x:any)=>JSON.stringify(x,null,2)+'\n'
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
assert(!existsSync(out))
const inputs=[canonical,semantic,registry,view,proposal,pairReview,bodies,bodyReview,sourceReceipt].map(pin)
const protect=read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]).map(pin)
const beforeRaw=readFileSync(canonical,'utf8'),before=JSON.parse(beforeRaw),after=structuredClone(before),semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw)
assert.equal(before.goals.length,679)
const pair=read(proposal),review=read(pairReview),reviewBodies=read(bodyReview)
assert.deepEqual(review.acceptedCandidate,pin(proposal));assert.equal(review.verdict,'accept_exact_SN_GK_optional_ordinary_and_assessment_pair_placement');assert.equal(review.findings.length,0)
assert.deepEqual(reviewBodies.acceptedWholeContainer,pin(bodies));const accepted=reviewBodies.perGoalDecisions.find((r:any)=>r.goalId===id);assert.equal(accepted.verdict,'accept_whole_v4_task_solution_scoring_body')
const source=read(sourceReceipt);for(const output of source.outputs)assert.deepEqual(pin(output.path),output,'Current source binding drift')
const exam=structuredClone(read(bodies).goals.find((g:any)=>g.id===id));assert.deepEqual(exam.requires,[ordinary]);assert.equal(exam.phase,'Q1');assert.deepEqual(exam.applicability.jurisdiction,['DE-SN']);assert(exam.tags.includes('GK')&&!exam.tags.includes('LK'))
exam.extendedData.authorProposal.authoredStatus=exam.extendedData.authorProposal.status;exam.extendedData.authorProposal.status='INTEGRATED_MACHINE_REVIEWED_ASSESSMENT_DESIGN'
exam.extendedData.assessmentDesignReview={reviewPaths:[bodyReview,pairReview],sourceBindingReceipt:sourceReceipt,actualLearnerExecution:false,humanApproval:false,humanTrial:false}
const p=after.goals.find((g:any)=>g.id===parent);assert(p&&!p.contains.includes(id));p.contains.push(id);after.goals.push(exam)
const vRaw=readFileSync(view,'utf8'),v=JSON.parse(vRaw),vAfter=structuredClone(v)
assert.deepEqual(v.scope,pair.beforeWholeView.scope)
const delta=pair.sparseOperation
function find(nodes:any[]):any{for(const n of nodes){if(n.id===delta.parentStructureId)return n;const x=n.children&&find(n.children);if(x)return x}}
const parentView=find(vAfter.rootNodes),oldParent=find(pair.beforeWholeView.rootNodes);assert(parentView&&oldParent)
// Previously reviewed insertions can coexist; every authored original node remains whole and ordered.
let oldIndex=-1;for(const n of oldParent.children){const i=parentView.children.findIndex((x:any)=>isDeepStrictEqual(n,x));assert(i>oldIndex);oldIndex=i}
assert(!parentView.children.some((n:any)=>n.id===delta.appendOneNode.id));parentView.children.push(delta.appendOneNode)
function projection(raw:any,view:any){const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,m),landscape={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};const p=applyCompositionViewProjection([landscape],normalizeCompositionView(view))[0],by=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by),stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,by,children)){const ps=parents.get(c)??new Set<string>();ps.add(id);parents.set(c,ps);stack.push(c)}}const filters=[view.scope.jurisdiction,view.scope.courseProfile,view.scope.durationModel].filter(Boolean);return{targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,parents}}
const checks=[]
for(const n of readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json'))){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+n,old=read(path),next=path===view?vAfter:old,b=projection(before,old),a=projection(after,next),added=[...a.targets].filter(id=>!b.targets.has(id)).sort(),lost=[...b.targets].filter(id=>!a.targets.has(id))
 assert.deepEqual(added,path===view?[id,ordinary].sort():[],'Unintended source/course offer '+path);assert.equal(lost.length,0)
 for(const goalId of b.targets)assert.deepEqual([...(b.parents.get(goalId)??[])].sort(),[...(a.parents.get(goalId)??[])].sort(),'Old visible parent changed')
 for(const g of before.goals)if(g.id!==ordinary)assert.equal(b.roles.targetGoalIds.has(g.id),a.roles.targetGoalIds.has(g.id),'Old target role changed')
 if(path===view){const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g])),seen=new Set<string>(),pending=[id];while(pending.length){const gid=pending.pop()!;if(seen.has(gid))continue;seen.add(gid);assert(a.targets.has(gid),'Missing transitive prerequisite '+gid);pending.push(...(by.get(gid).requires??[]))}assert.equal(a.parents.get(id)?.size,1);assert.equal(a.parents.get(ordinary)?.size,1)}
 checks.push({path,added,lost,oldParentsPreserved:true,ordinaryRolesPreservedExceptReviewedSNTarget:true})
}
const all=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));for(const edge of ['requires','contains']){const state=new Map<string,number>();function visit(id:string){assert.notEqual(state.get(id),1,'Cycle');if(state.get(id)===2)return;state.set(id,1);for(const n of all.get(id)[edge]??[]){assert(all.has(n));visit(n)}state.set(id,2)}for(const id of all.keys())visit(id)}
sem.decisions.find((r:any)=>r.goalId===parent).sourceFingerprint=fingerprintSemanticKindSourceGoal(p)
sem.decisions.push({goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(exam),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'machine-reviewed-source-matched-SN-GK-optional-film-fixing-assessment-20261018'})
sem.counts.practiceAssessment++;sem.counts.total++;assert.equal(sem.counts.curricularAtomic,450)
const marker='\n  "goals": [\n',start=beforeRaw.indexOf(marker)+marker.length,end=beforeRaw.lastIndexOf('\n  ]'),body=beforeRaw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!);assert.equal(starts.length,679)
let patched='';for(let i=0;i<starts.length;i++){const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));patched+=g.id===parent?'    '+JSON.stringify(p,null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part}
patched=patched.replace(/\s*$/,'')+',\n    '+JSON.stringify(exam,null,2).replace(/\n/g,'\n    ')
const afterRaw=beforeRaw.slice(0,start)+patched+beforeRaw.slice(end);assert.deepEqual(JSON.parse(afterRaw),after)
const evaluator='app/scripts/generateCurriculumQualityStatus.ts',probe='app/scripts/.__chemie450_SN_route_probe.ts';let beforeRoute:any,afterRoute:any
try{writeFileSync(probe,readFileSync(evaluator,'utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'});const m:any=await import(pathToFileURL(resolve(probe)).href),profile=m.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2');beforeRoute=m.evaluateRouteProfile(before,profile,{reports:[]});afterRoute=m.evaluateRouteProfile(after,profile,{reports:[]});assert.equal(beforeRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingTerminalPath,85);assert.equal(afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingMotivationPath,0)}finally{if(existsSync(probe))unlinkSync(probe)}
assert.deepEqual(inputs.slice(0,4),[canonical,semantic,registry,view].map(pin));assert.deepEqual(protect,protect.map(p=>pin(p.path)))
mkdirSync(out);writeFileSync(out+'/BEFORE.canonical.exact.json.snapshot',beforeRaw,{flag:'wx'});writeFileSync(out+'/BEFORE.semantic-kinds.exact.json.snapshot',semRaw,{flag:'wx'});writeFileSync(out+'/BEFORE.SN-view.exact.json.snapshot',vRaw,{flag:'wx'})
writeFileSync(canonical,afterRaw);writeFileSync(semantic,dump(sem));writeFileSync(view,dump(vAfter))
assert.deepEqual(read(canonical),after);assert.deepEqual(protect,protect.map(p=>pin(p.path)));assert.deepEqual(pin(registry),inputs[2])
writeFileSync(out+'/integration-writer.mts',readFileSync('tmp/integrate_chemie450_SN_reviewed_pair.mts'),{flag:'wx'})
writeFileSync(out+'/RECEIPT.actual-source-matched-SN-pair-integration.json',dump({role:'EXISTING_SOURCE_FIT_AND_REVIEWED_ASSESSMENT_PAIR_INTEGRATION_NOT_NEW_ORDINARY_SCIENCE',inputs,viewChecks:checks,sourceBindingReceipt:sourceReceipt,ordinaryGoalAndPositiveProfileUnmodified:true,exactReviewedSparseOptionalNodeRebasedOverReviewedT3Insertions:true,beforeRoute,afterRoute,progress:{newAssessmentDesigns:1,newOrdinaryTargets:1,newOrdinaryScientificFirstCompletions:0,newNativeDOrPBindings:0},limits:{fullCentralM7NotClaimed:true,CQR003FullPassNotClaimed:true,finalNativeAndApplicabilityPending:true,actualLearnerSelection:false,actualLearnerExecution:false,humanApproval:false,humanTrial:false},outputs:[canonical,semantic,view].map(pin)}),{flag:'wx'})
writeFileSync(out+'/SEAL.actual-SN-pair-integration.json',dump({role:'TECHNICAL_INTEGRATION_NOT_REVIEW_VOTE',files:readdirSync(out).map(n=>pin(out+'/'+n)),outputs:[canonical,semantic,view].map(pin)}),{flag:'wx'})
console.log(JSON.stringify({out,viewCount:checks.length,newExam:id,newTarget:ordinary,routeMetrics:afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics,ordinarySciencePreserved:true,protectedInputsPreserved:true}))
