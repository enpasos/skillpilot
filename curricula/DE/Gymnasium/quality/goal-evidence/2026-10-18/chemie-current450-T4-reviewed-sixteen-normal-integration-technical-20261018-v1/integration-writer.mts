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
const out=base+'chemie-current450-T4-reviewed-sixteen-normal-integration-technical-20261018-v1'
const author=base+'chemie-current450-T4-terminal-exams-author-20261018-v1/'
const reviewDir=base+'chemie-current450-T4-terminal-exams-independent-a-20261018-v1/'
const reviewPath=reviewDir+'FIRST.actual-sixteen-bodies-thirty-five-materials-independent-a.json',correctionPath=reviewDir+'CORRECTION.actual-phase-finding-retraction.independent-a.json'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),dump=(x:any)=>JSON.stringify(x,null,2)+'\n'
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
assert(!existsSync(out))
const inputs=[canonical,semantic,registry,reviewPath,correctionPath,author+'AUTHOR.sixteen-whole-new-exam-goals.pending.json',author+'AUTHOR.sparse-existing-view-practice-placements.pending.json',author+'AUTHOR.sparse-phase-practice-contains-appends.pending.json',author+'INPUT.whole-current-eighteen-goals-and-P.json'].map(pin)
const protection=read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]).map(pin)
const beforeRaw=readFileSync(canonical,'utf8'),before=JSON.parse(beforeRaw),after=structuredClone(before),beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw)
assert.equal(before.goals.length,692)
const review=read(reviewPath),correction=read(correctionPath),candidate=read(author+'AUTHOR.sixteen-whole-new-exam-goals.pending.json').goals
assert.equal(candidate.length,16);assert.equal(review.records.length,16)
assert.equal(correction.decision,'RETRACT_FALSE_PHASE_HOLD_ACCEPT_ORIGINAL_Q4_INTERFACE')
const orientation=read(base+'chemie-current450-twenty-seven-orientation-entry-author-20261018-v1/AUTHOR.27-orientation-entry-requires-only.pending.json').records
const currentContext=[]
for(const r of read(author+'INPUT.whole-current-eighteen-goals-and-P.json').records){
 const current=beforeBy.get(r.goal.id);assert(current);if(!isDeepStrictEqual(current,r.goal)){const approved=orientation.find((o:any)=>o.goalId===r.goal.id);assert(approved);assert.deepEqual(r.goal,approved.beforeWholeGoal);assert.deepEqual(current,approved.proposedWholeGoal)}
 assert.deepEqual(pin(r.PRecordFile.path),r.PRecordFile)
 const row=readFileSync(r.PRecordFile.path,'utf8').split(/\r?\n/).filter(Boolean).map(s=>JSON.parse(s)).find((x:any)=>x.goalId===r.goal.id);assert.deepEqual(row,r.wholePRecord)
 currentContext.push({goalId:r.goal.id,wholeScientificBodyUnchanged:true,onlyPossibleDelta:'already independently reviewed orientation requires append',positiveProfileWholeExact:true})
}
for(const g of candidate){const r=review.records.find((r:any)=>r.endpointId===g.id);assert.equal(r.bodyVerdict,'ACCEPT_CURRENT_COMPLETE_BODY');assert(r.interfaceVerdict==='ACCEPT_CURRENT_INTERFACE'||g.id==='eaf7cf9a-7ede-53bf-a268-a1dc4b3dd086');assert.equal(g.requires.length,1);assert.deepEqual(g.requires,g.examData.coveredGoalIds);const o=beforeBy.get(g.requires[0]);assert.equal(g.dimensionTags.phase,o.phase??o.dimensionTags?.phase)}
const parentOp=read(author+'AUTHOR.sparse-phase-practice-contains-appends.pending.json').operations;assert.equal(parentOp.length,1)
const parentId=parentOp[0].parentId,parent=after.goals.find((g:any)=>g.id===parentId),baseline=parentOp[0].beforeWholeParent,without=structuredClone(parent);without.contains=baseline.contains;assert.deepEqual(without,baseline);for(const id of baseline.contains)assert(parent.contains.includes(id))
assert.deepEqual(parentOp[0].append,candidate.map((g:any)=>g.id));assert(candidate.every((g:any)=>!beforeBy.has(g.id)))
parent.contains.push(...candidate.map((g:any)=>g.id))
const added=candidate.map((g:any)=>{const x=structuredClone(g);x.extendedData.authorAssessmentGate=x.extendedData.assessmentGate;x.extendedData.assessmentGate='Machine-reviewed task design integrated; final applicability/native/release checks pending. No actual performance or human approval.';x.extendedData.assessmentDesignReview={reviewPaths:[reviewPath,correctionPath],scopeIntegration:out+'/RECEIPT.actual-T4-sixteen-assessment-integration.json',actualLearnerExecution:false,humanApproval:false,humanTrial:false};assert.deepEqual(x.examData,g.examData);return x})
after.goals.push(...added)
const allBy=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));assert.equal(allBy.size,708)
for(const edge of ['requires','contains']){const state=new Map<string,number>();function visit(id:string){assert.notEqual(state.get(id),1,'Cycle '+edge);if(state.get(id)===2)return;state.set(id,1);for(const n of allBy.get(id)[edge]??[]){assert(allBy.has(n));visit(n)}state.set(id,2)}for(const id of allBy.keys())visit(id)}
const operations=read(author+'AUTHOR.sparse-existing-view-practice-placements.pending.json').parentOperations
function get(nodes:any[],path:string[]):any{let current:any;for(const id of path){current=nodes.find(n=>n.id===id);assert(current,'Missing structure '+id);nodes=current.children}return current}
function preserved(old:any,current:any){const o=structuredClone(old),c=structuredClone(current);delete o.children;delete c.children;assert.deepEqual(o,c,'Changed old parent fields');if(old.children){let prev=-1;for(const n of old.children){const i=current.children.findIndex((x:any)=>x.kind===n.kind&&(n.id?x.id===n.id:x.goalId===n.goalId));assert(i>prev,'Removed/reordered old node');preserved(n,current.children[i]);prev=i}}}
function project(raw:any,v:any){const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m),p=applyCompositionViewProjection([{meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}],normalizeCompositionView(v))[0],by=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by),stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,by,children)){const ps=parents.get(c)??new Set<string>();ps.add(id);parents.set(c,ps);stack.push(c)}}const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean);return{targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents,filters}}
const writes:any[]=[],checks:any[]=[],newIds=new Set(candidate.map((g:any)=>g.id))
for(const name of readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json'))){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name,raw=readFileSync(path,'utf8'),v=JSON.parse(raw),next=structuredClone(v)
 for(const op of operations.filter((o:any)=>o.normalView.path===path)){
  const p=get(next.rootNodes,op.parentPath);preserved(op.beforeWholeParent,p)
  for(const ins of op.insertions){
   const anchor=ins.afterExactExistingTargetEntry,index=p.children.findIndex((n:any)=>n.kind===anchor.kind&&(anchor.id?n.id===anchor.id:n.goalId===anchor.goalId))
   assert(index>=0,'Missing exact reviewed insertion anchor '+path)
   const entry=ins.newEntry
   assert(!p.children.some((n:any)=>n.kind===entry.kind&&(entry.id?n.id===entry.id:n.goalId===entry.goalId)),'Duplicate same-kind assessment node '+path+' '+(entry.id??entry.goalId))
   p.children.splice(index+1,0,entry)
  }
 }
 const b=project(before,v),a=project(after,next),actual=[...a.targets].filter(id=>newIds.has(id)).sort(),expected=candidate.filter((g:any)=>g.requires.every((id:string)=>b.targets.has(id))&&goalMatchesFilters(g,b.filters)).map((g:any)=>g.id).sort()
 assert.deepEqual(actual,expected,'Unintended or missing offered assessment '+path)
 for(const g of before.goals){assert.equal(b.roles.targetGoalIds.has(g.id),a.roles.targetGoalIds.has(g.id));assert.equal(b.roles.prerequisiteOnlyGoalIds.has(g.id),a.roles.prerequisiteOnlyGoalIds.has(g.id));assert.equal(b.targets.has(g.id),a.targets.has(g.id))}
 for(const id of b.seen)assert.deepEqual([...(b.parents.get(id)??[])].sort(),[...(a.parents.get(id)??[])].sort(),'Old rendered parent changed')
 for(const id of actual){assert.equal(a.parents.get(id)?.size,1);for(const req of allBy.get(id).requires)assert(a.targets.has(req))}
 checks.push({path,actualNewEndpoints:actual,allOldTargetsRolesParentsExact:true,allExpectedCourseScopedEndpointsPresent:true})
 if(!isDeepStrictEqual(v,next))writes.push({path,raw,next,before:pin(path)})
}
const appearanceCount=checks.reduce((n,r)=>n+r.actualNewEndpoints.length,0);assert.equal(appearanceCount,162)
sem.decisions.find((r:any)=>r.goalId===parentId).sourceFingerprint=fingerprintSemanticKindSourceGoal(parent)
for(const g of added)sem.decisions.push({goalId:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'machine-reviewed-T4-current-whole-body-and-source-local-interface-A-with-exact-phase-finding-retraction-20261018'})
sem.counts.practiceAssessment+=16;sem.counts.total+=16;assert.equal(sem.counts.curricularAtomic,450)
const marker='\n  "goals": [\n',start=beforeRaw.indexOf(marker)+marker.length,end=beforeRaw.lastIndexOf('\n  ]'),body=beforeRaw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!);assert.equal(starts.length,692)
let patched='';for(let i=0;i<starts.length;i++){const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));patched+=g.id===parentId?'    '+JSON.stringify(parent,null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part}
patched=patched.replace(/\s*$/,'')+',\n'+added.map((g:any)=>'    '+JSON.stringify(g,null,2).replace(/\n/g,'\n    ')).join(',\n');const afterRaw=beforeRaw.slice(0,start)+patched+beforeRaw.slice(end);assert.deepEqual(JSON.parse(afterRaw),after)
const evaluator='app/scripts/generateCurriculumQualityStatus.ts',probe='app/scripts/.__chemie450_T4_route_probe.ts';let beforeRoute:any,afterRoute:any
try{writeFileSync(probe,readFileSync(evaluator,'utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'});const m:any=await import(pathToFileURL(resolve(probe)).href),profile=m.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2');beforeRoute=m.evaluateRouteProfile(before,profile,{reports:[]});afterRoute=m.evaluateRouteProfile(after,profile,{reports:[]});assert.equal(beforeRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingTerminalPath,65);assert(afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingTerminalPath<65)}finally{if(existsSync(probe))unlinkSync(probe)}
assert.deepEqual(inputs.slice(0,3),[canonical,semantic,registry].map(pin));for(const w of writes)assert.deepEqual(pin(w.path),w.before);assert.deepEqual(protection,protection.map(p=>pin(p.path)))
mkdirSync(out);mkdirSync(out+'/before-views');writeFileSync(out+'/BEFORE.canonical.exact.json.snapshot',beforeRaw,{flag:'wx'});writeFileSync(out+'/BEFORE.semantic-kinds.exact.json.snapshot',semRaw,{flag:'wx'});for(const w of writes)writeFileSync(out+'/before-views/'+w.path.split('/').pop()+'.snapshot',w.raw,{flag:'wx'})
writeFileSync(canonical,afterRaw);writeFileSync(semantic,dump(sem));for(const w of writes)writeFileSync(w.path,dump(w.next))
assert.deepEqual(read(canonical),after);assert.deepEqual(protection,protection.map(p=>pin(p.path)));assert.deepEqual(pin(registry),inputs[2])
writeFileSync(out+'/integration-writer.mts',readFileSync('tmp/integrate_chemie450_T4_reviewed_sixteen.mts'),{flag:'wx'})
const metrics=afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics
writeFileSync(out+'/RECEIPT.actual-T4-sixteen-assessment-integration.json',dump({role:'REVIEWED_ASSESSMENT_DESIGN_AND_SPARSE_SCOPE_INTEGRATION_NOT_NEW_ORDINARY_SCIENCE',inputs,integratedEndpointIds:added.map((g:any)=>g.id),actualCurrentContextChecks:currentContext,viewChecks:checks,changedViews:writes.length,actualIntendedNewAppearances:appearanceCount,allOldTargetsRolesParentsPreserved:true,protectedInputs:protection,beforeRoute,afterRoute,progress:{newAssessmentDesigns:16,remainingMotivation:metrics.missingMotivationPath,remainingTerminal:metrics.missingTerminalPath,newOrdinaryScientificFirstCompletions:0,newNativeDOrPBindings:0},limits:{vatDyeAndSurfactantOperativeHoldsRemain:true,finalNativeAndCentralAndAPAndReleaseChecksPending:true,newStandCIPassed:false,M7Claim:false,humanApproval:false,actualLearnerPerformance:false},outputs:[canonical,semantic,...writes.map(w=>w.path)].map(pin)}),{flag:'wx'})
writeFileSync(out+'/SEAL.actual-T4-sixteen-integration.json',dump({role:'TECHNICAL_INTEGRATION_NOT_NEW_REVIEW_VOTE',files:readdirSync(out).filter(n=>n!=='before-views').map(n=>pin(out+'/'+n)),beforeViews:readdirSync(out+'/before-views').map(n=>pin(out+'/before-views/'+n)),outputs:[canonical,semantic,...writes.map(w=>w.path)].map(pin)}),{flag:'wx'})
console.log(JSON.stringify({out,integrated:16,viewCount:checks.length,changedViews:writes.length,appearanceCount,metrics,allOldOrdinaryAndProtectedInputsPreserved:true}))
