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
const out=base+'chemie-current450-T1-reviewed-twelve-normal-integration-technical-20261018-v1'
const author=base+'chemie-current450-T1-terminal-exams-interface-author-20261018-v7/'
const v6=base+'chemie-current450-T1-terminal-exams-author-20261018-v6/AUTHOR.new-goals.full.draft.json'
const reviewB=base+'chemie-current450-T1-terminal-exams-informed-independent-b-20261018-v1/FIRST.independent-B.v6.json'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const excluded='d7abdeb3-5b69-5744-b7fd-8149fd92b0d5',excludedOrdinary='8edee6b6-9ead-515e-93f5-feada64522b2'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),dump=(x:any)=>JSON.stringify(x,null,2)+'\n'
const pin=(p:string)=>{const b=readFileSync(p);return{path:p,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
assert(!existsSync(out),'Never overwrite sealed technical evidence')
const seal=author+'SEAL.interface-author-v7.pending-independent-review.json'
assert.equal(pin(seal).sha256,'2d7e50b60d1f19cede8c32895c5d769ecca0c08a85d2f3bd94776f9f7ace33b8')
for(const f of read(seal).files){const path=f.path.startsWith('curricula/')?f.path:author+f.path;assert.equal(pin(path).sha256,f.sha256,'Author seal changed '+path)}
const inputs=[canonical,semantic,registry,seal,v6,reviewB,author+'AUTHOR.new-goals.full.draft.json',author+'AUTHOR.actual-phase-inventory-and-rationale.json',author+'AUTHOR.endpoint-view-and-excluded-interfaces.json',author+'AUTHOR.canonical-contains-parent-whole-CAS.json',author+'AUTHOR.view-whole-CAS.json'].map(pin)
const protect=read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]).map(pin)
const beforeRaw=readFileSync(canonical,'utf8'),before=JSON.parse(beforeRaw),after=structuredClone(before),semRaw=readFileSync(semantic,'utf8'),sem=JSON.parse(semRaw)
assert.equal(before.goals.length,680)
const beforeBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),candidate=read(author+'AUTHOR.new-goals.full.draft.json').newGoals,previous=read(v6).newGoals,byOld=new Map<string,any>(previous.map((g:any)=>[g.id,g]))
assert.equal(candidate.length,12);assert.equal(read(reviewB).requiredNewContentFindings.length,0)
assert.equal(Object.keys(read(reviewB).currentExamContentDecisions).length,12)
assert(Object.values(read(reviewB).currentExamContentDecisions).every((s:any)=>s.startsWith('KEEP')))
const interfaces=read(author+'AUTHOR.endpoint-view-and-excluded-interfaces.json'),phases=read(author+'AUTHOR.actual-phase-inventory-and-rationale.json').records
assert.deepEqual(beforeBy.get(excludedOrdinary),interfaces.grignardOrdinaryBeforeWholeGoal)
assert.equal(beforeBy.get(excludedOrdinary).extendedData.applicabilityProjection,'excluded')
for(const g of candidate){
 assert(!beforeBy.has(g.id));const old=byOld.get(g.id);assert(old);assert.deepEqual(g.examData,old.examData,'Whole reviewed scientific payload changed')
 const r=phases.find((r:any)=>r.endpointId===g.id);assert(r)
 const ordinaryPhases=[...new Set(g.requires.map((id:string)=>{const q=beforeBy.get(id);assert(q);return q.phase??q.dimensionTags?.phase??'GLOBAL'}))]
 assert.equal(ordinaryPhases.length,1,'Unreviewed mixed phase')
 assert.equal(g.phase,ordinaryPhases[0]);assert.equal(g.dimensionTags.phase,ordinaryPhases[0])
 assert.deepEqual(g.requires,g.examData.coveredGoalIds)
 const stripped=structuredClone(g);stripped.phase=old.phase;stripped.dimensionTags.phase=old.dimensionTags.phase
 if(g.id===excluded){
  assert.equal(g.extendedData.applicabilityProjection,'excluded');assert.deepEqual(g.requires,[excludedOrdinary]);assert.equal(interfaces.records.find((r:any)=>r.endpointId===g.id).proposedTargetViews.length,0)
  delete stripped.extendedData.applicabilityProjection;delete stripped.extendedData.terminalRouteCandidate.excludedOfferBoundary
  stripped.extendedData.terminalRouteCandidate.integrationHolds=old.extendedData.terminalRouteCandidate.integrationHolds
 }
 assert.deepEqual(stripped,old,'Unexpected non-interface delta '+g.id)
}
const parentCAS=read(author+'AUTHOR.canonical-contains-parent-whole-CAS.json')
assert.deepEqual(parentCAS.canonicalBeforeFilePin,pin(canonical));assert.deepEqual(beforeBy.get(parentCAS.parentGoalId),parentCAS.beforeWholeGoal)
const proposedParent=structuredClone(parentCAS.candidateWholeGoal),undo=structuredClone(proposedParent);undo.contains=parentCAS.beforeWholeGoal.contains;assert.deepEqual(undo,parentCAS.beforeWholeGoal)
assert.deepEqual(proposedParent.contains,[...parentCAS.beforeWholeGoal.contains,...candidate.map((g:any)=>g.id)])
after.goals=after.goals.map((g:any)=>g.id===parentCAS.parentGoalId?proposedParent:g)
const added=candidate.map((g:any)=>{const x=structuredClone(g),r=x.extendedData.terminalRouteCandidate;r.authoredStatus=r.status;r.status='INTEGRATED_MACHINE_REVIEWED_ASSESSMENT_DESIGN';r.authoredIntegrationHolds=r.integrationHolds;r.integrationHolds=[];x.extendedData.assessmentDesignReview={contentReview:reviewB,interfaceReview:out+'/REVIEW.bounded-T1-phase-scope-and-exclusion.root.json',ordinaryScienceReapproval:false,actualLearnerExecution:false,humanApproval:false,humanTrial:false};return x})
after.goals.push(...added)
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));assert.equal(by.size,692)
for(const edge of ['requires','contains']){const state=new Map<string,number>();function visit(id:string){assert.notEqual(state.get(id),1,'Cycle '+edge);if(state.get(id)===2)return;state.set(id,1);for(const n of by.get(id)[edge]??[]){assert(by.has(n));visit(n)}state.set(id,2)}for(const id of by.keys())visit(id)}
function project(raw:any,view:any){const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,m),landscape={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))};const p=applyCompositionViewProjection([landscape],normalizeCompositionView(view))[0],by=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by),stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const child of getRenderedChildIds(id,by,children)){const ps=parents.get(child)??new Set<string>();ps.add(id);parents.set(child,ps);stack.push(child)}}const filters=[view.scope.jurisdiction,view.scope.courseProfile,view.scope.durationModel].filter(Boolean);return{targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents,filters}}
const viewCAS=read(author+'AUTHOR.view-whole-CAS.json').records,writes:any[]=[],checks:any[]=[]
for(const name of readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json'))){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name,raw=readFileSync(path,'utf8'),v=JSON.parse(raw),op=viewCAS.find((r:any)=>r.path===path),next=op?.candidateWholeView??v
 if(op){assert.deepEqual(op.beforeFilePin,pin(path));assert.deepEqual(op.beforeWholeView,v);assert.deepEqual({...next,rootNodes:v.rootNodes},{...v,rootNodes:v.rootNodes});const matching=(nodes:any[]):any=>nodes.find(n=>n.id===op.parentStructureId);const old=matching(v.rootNodes),neu=matching(next.rootNodes);assert(old&&neu);assert.deepEqual(neu.children.slice(0,old.children.length),old.children);assert.equal(neu.children.length,old.children.length+1);writes.push({path,raw,next,before:pin(path)})}
 const b=project(before,v),a=project(after,next),newIds=new Set(candidate.map((g:any)=>g.id)),actual=[...a.targets].filter(id=>newIds.has(id)).sort(),expected=interfaces.records.filter((r:any)=>r.proposedTargetViews.includes(path)).map((r:any)=>r.endpointId).sort()
 assert.deepEqual(actual,expected,'Scope offer mismatch '+path);assert(!a.targets.has(excluded)&&!a.seen.has(excluded),'Excluded Grignard offered')
 assert.equal(b.roles.targetGoalIds.has(excludedOrdinary),a.roles.targetGoalIds.has(excludedOrdinary))
 for(const g of before.goals){assert.equal(b.roles.targetGoalIds.has(g.id),a.roles.targetGoalIds.has(g.id));assert.equal(b.roles.prerequisiteOnlyGoalIds.has(g.id),a.roles.prerequisiteOnlyGoalIds.has(g.id));assert.equal(b.targets.has(g.id),a.targets.has(g.id))}
 for(const oldId of b.seen)assert.deepEqual([...(b.parents.get(oldId)??[])].sort(),[...(a.parents.get(oldId)??[])].sort(),'Old rendered parent '+path+' '+oldId)
 for(const id of actual){assert.equal(a.parents.get(id)?.size,1);for(const req of by.get(id).requires)assert(a.targets.has(req),'Missing actual target prerequisite '+req)}
 // Recalculate eligibility separately from the author's claimed view inventory.
 const eligible=candidate.filter((g:any)=>g.id!==excluded&&g.requires.every((id:string)=>b.targets.has(id))&&goalMatchesFilters(g,b.filters)).map((g:any)=>g.id).sort();assert.deepEqual(actual,eligible,'Authored eligibility fails independent runtime scope check '+path)
 checks.push({path,actualNewEndpointIds:actual,oldTargetRoleParentAndRenderedSetsPreserved:true,excludedEnrichmentNotOffered:true,allRequiredOrdinaryTargetsPresent:true})
}
assert.equal(writes.length,38)
sem.decisions.find((r:any)=>r.goalId===parentCAS.parentGoalId).sourceFingerprint=fingerprintSemanticKindSourceGoal(proposedParent)
for(const g of added)sem.decisions.push({goalId:g.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(g),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'machine-reviewed-T1-assessment-v6-science-v7-local-phase-explicit-views-and-excluded-enrichment-interface-20261018'})
sem.counts.practiceAssessment+=12;sem.counts.total+=12;assert.equal(sem.counts.curricularAtomic,450)
const marker='\n  "goals": [\n',start=beforeRaw.indexOf(marker)+marker.length,end=beforeRaw.lastIndexOf('\n  ]'),body=beforeRaw.slice(start,end),starts=[...body.matchAll(/^    \{/gm)].map(m=>m.index!);assert.equal(starts.length,680)
let patched='';for(let i=0;i<starts.length;i++){const part=body.slice(starts[i],starts[i+1]??body.length),g=JSON.parse(part.trim().replace(/,$/,''));patched+=g.id===parentCAS.parentGoalId?'    '+JSON.stringify(proposedParent,null,2).replace(/\n/g,'\n    ')+part.slice(part.lastIndexOf('}')+1):part}
patched=patched.replace(/\s*$/,'')+',\n'+added.map((g:any)=>'    '+JSON.stringify(g,null,2).replace(/\n/g,'\n    ')).join(',\n')
const afterRaw=beforeRaw.slice(0,start)+patched+beforeRaw.slice(end);assert.deepEqual(JSON.parse(afterRaw),after)
const evaluator='app/scripts/generateCurriculumQualityStatus.ts',probe='app/scripts/.__chemie450_T1_route_probe.ts';let beforeRoute:any,afterRoute:any
try{writeFileSync(probe,readFileSync(evaluator,'utf8')+'\nexport {evaluateRouteProfile,routeProfiles};\n',{flag:'wx'});const m:any=await import(pathToFileURL(resolve(probe)).href),profile=m.routeProfiles.find((p:any)=>p.profileId==='canonical-chemistry-sek2');beforeRoute=m.evaluateRouteProfile(before,profile,{reports:[]});afterRoute=m.evaluateRouteProfile(after,profile,{reports:[]});assert.equal(beforeRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingTerminalPath,84);assert(afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics.missingTerminalPath<84)}finally{if(existsSync(probe))unlinkSync(probe)}
assert.deepEqual(inputs.slice(0,3),[canonical,semantic,registry].map(pin));for(const w of writes)assert.deepEqual(pin(w.path),w.before);assert.deepEqual(protect,protect.map(p=>pin(p.path)))
mkdirSync(out);mkdirSync(out+'/before-views');writeFileSync(out+'/BEFORE.canonical.exact.json.snapshot',beforeRaw,{flag:'wx'});writeFileSync(out+'/BEFORE.semantic-kinds.exact.json.snapshot',semRaw,{flag:'wx'});for(const w of writes)writeFileSync(out+'/before-views/'+w.path.split('/').pop()+'.snapshot',w.raw,{flag:'wx'})
writeFileSync(canonical,afterRaw);writeFileSync(semantic,dump(sem));for(const w of writes)writeFileSync(w.path,dump(w.next))
assert.deepEqual(read(canonical),after);assert.deepEqual(protect,protect.map(p=>pin(p.path)));assert.deepEqual(pin(registry),inputs[2])
writeFileSync(out+'/integration-writer.mts',readFileSync('tmp/integrate_chemie450_T1_reviewed_twelve.mts'),{flag:'wx'})
writeFileSync(out+'/REVIEW.bounded-T1-phase-scope-and-exclusion.root.json',dump({role:'INDEPENDENT_ROOT_INTERFACE_REVIEW_NOT_WHOLE_ORDINARY_OR_EXAM_SCIENCE_REVIEW',author:'/root/chemie_t2_independent_a_complete',reviewer:'/root',acceptedAuthorSeal:pin(seal),verdict:'ACCEPT_EXACT_LOCAL_PHASES_EXPLICIT_REVIEWED_TARGETS_AND_EXCLUDED_CANONICAL_ENRICHMENT',actualIndependentChecks:checks,phaseInventory:phases,allTwelveReviewedV6ExamDataWholeExact:true,rationale:'The five local phases equal the actual current assessed ordinary phase. Seven bounded cross-phase tasks retain GLOBAL and are separately named from Abitur. Explicit target entries are authored only in the actual matching course views whose whole assessed goals are already targets. Existing target/support roles and every rendered old parent stay exact. The Grignard canonical terminal retains the existing excluded enrichment boundary and supplies no default learner route or official source claim; it is scientifically reviewed canonical practice only.',ordinaryAndPReapproval:false,humanApproval:false}),{flag:'wx'})
const beforeMetrics=beforeRoute.rules.find((r:any)=>r.id==='CQR-101').metrics,afterMetrics=afterRoute.rules.find((r:any)=>r.id==='CQR-101').metrics
writeFileSync(out+'/RECEIPT.actual-T1-twelve-assessment-integration.json',dump({role:'REVIEWED_DESIGN_AND_SCOPE_INTEGRATION_NOT_NEW_ORDINARY_SCIENTIFIC_APPROVAL',inputs,integratedEndpointIds:added.map((g:any)=>g.id),viewChecks:checks,changedViews:writes.length,explicitTargetAppearances:checks.reduce((n,r)=>n+r.actualNewEndpointIds.length,0),protectedInputs:protect,allOldOrdinaryAndPositiveProfilesExact:true,excludedCanonicalEnrichmentEndpoint:excluded,excludedCanonicalEndpointNotLearnerOffer:true,beforeRoute,afterRoute,progress:{newAssessmentDesigns:12,recoveredCanonicalTerminalRoutes:beforeMetrics.missingTerminalPath-afterMetrics.missingTerminalPath,remainingTerminal:afterMetrics.missingTerminalPath,remainingMotivation:afterMetrics.missingMotivationPath,newOrdinaryScientificFirstCompletions:0,newNativeBindings:0},limits:{nativeContextAndCentralAndAPChecksPending:true,examReviewStatusRemainsDraftUntilReleaseGates:true,newStandCIPassed:false,M7Claim:false,humanApproval:false,actualLearnerExecution:false},outputs:[canonical,semantic,...writes.map(w=>w.path)].map(pin)}),{flag:'wx'})
writeFileSync(out+'/SEAL.actual-T1-twelve-integration.json',dump({role:'TECHNICAL_INTEGRATION_NOT_ADDITIONAL_SCIENTIFIC_VOTE',files:readdirSync(out).filter(n=>n!=='before-views').map(n=>pin(out+'/'+n)),beforeViews:readdirSync(out+'/before-views').map(n=>pin(out+'/before-views/'+n)),outputs:[canonical,semantic,...writes.map(w=>w.path)].map(pin)}),{flag:'wx'})
console.log(JSON.stringify({out,integrated:12,viewsChecked:checks.length,viewsChanged:writes.length,afterMetrics,ordinaryAndProtectedSciencePreserved:true,excludedEnrichmentNotOffered:true}))
