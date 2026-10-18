// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {convertLearningGoal} from '../../../../../../../../app/src/goalTypes';
import {applyCompositionViewProjection} from '../../../../../../../../app/src/utils/compositionViewRuntime';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from '../../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import {buildDirectChildrenMap,getRenderedChildIds} from '../../../../../../../../app/src/utils/treeProjectionRuntime';
import {goalMatchesFilters} from '../../../../../../../../app/src/utils/goalFilters';
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/';
const O=base+'chemie-current450-prospective-T2-T5-T4-transitive-support-author-20261018-v1/';
const T2=base+'chemie-current450-T2-terminal-exams-interface-author-20261018-v6/';
const T5=base+'chemie-current450-T5-terminal-exams-author-20261018-v3/';
const T5P=base+'chemie-current450-T5-terminal-exams-author-20261018-v2/';
const T4=base+'chemie-current450-T4-operative-two-material-author-20261018-v3/';
const T5I=base+'chemie-current450-T5-reviewed-eight-normal-integration-technical-20261018-v1/';
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const pin=(path:string)=>{const b=readFileSync(path);return{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}};
const dump=(n:string,x:any)=>writeFileSync(O+n,JSON.stringify(x,null,2)+'\n');
const inputs=[canonical,T2+'AUTHOR.new-goals.full.draft.json',T2+'AUTHOR.view-whole-CAS.json',T2+'AUTHOR.canonical-contains-parent-whole-CAS.json',T2+'FREEZE.author.sha256.json',T2+'FREEZE.source-and-placement-review-inputs.sha256.json',T5+'AUTHOR.eight-complete-exam-goals.draft.json',T5+'FREEZE.author.sha256.json',T5P+'PROPOSAL.five-exact-view-child-array-append-CAS.draft.json',T5P+'PROPOSAL.placement-and-applicability.draft.json',T4+'AUTHOR.two-new-complete-exam-goals.pending.json',T4+'PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json',T4+'PROPOSAL.two-exact-source-view-placements.pending.json',T4+'FREEZE.author.sha256.json',T5I+'SEAL.actual-T5-eight-integration.json'].map(pin);
function checkSeal(p:string,folder:string){const s=read(p);for(const x of s.members??s.files??[]){const path=x.path.startsWith('curricula/')?x.path:folder+x.path;const now=pin(path);assert.equal(now.sha256,x.sha256,'Sealed member drift '+path);assert.equal(now.bytes,x.bytes)}}
checkSeal(T2+'FREEZE.author.sha256.json',T2);checkSeal(T2+'FREEZE.source-and-placement-review-inputs.sha256.json',T2);checkSeal(T5+'FREEZE.author.sha256.json',T5);checkSeal(T4+'FREEZE.author.sha256.json',T4);
const before=read(canonical),after=structuredClone(before);assert.equal(before.goals.length,716);for(const q of read(T5I+'SEAL.actual-T5-eight-integration.json').outputs)assert.deepEqual(pin(q.path),q,'Known T5 integration output drift');
const t2=read(T2+'AUTHOR.new-goals.full.draft.json').newGoals,t5=read(T5+'AUTHOR.eight-complete-exam-goals.draft.json'),t4=read(T4+'AUTHOR.two-new-complete-exam-goals.pending.json').goals;
const candidates=[...t2,...t5,...t4];assert.equal(candidates.length,29);
const oldBy=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]));const newCandidates=[...t2,...t4];for(const g of newCandidates)assert(!oldBy.has(g.id));for(const g of t5)assert.deepEqual(oldBy.get(g.id).examData,g.examData,'Integrated T5 scientific body drift');
const parent='5964272f-e835-5a24-b2b1-c162be6b75cb';const p=after.goals.find((g:any)=>g.id===parent);p.contains.push(...newCandidates.map((g:any)=>g.id));after.goals.push(...newCandidates);
const by=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]));assert.equal(by.size,737);
const candidateIds=new Set(newCandidates.map((g:any)=>g.id));
const packageOf=(id:string)=>t2.some((g:any)=>g.id===id)?'T2v6':t5.some((g:any)=>g.id===id)?'T5v3':t4.some((g:any)=>g.id===id)?'T4operativev3':'existing-current';
const t2views=read(T2+'AUTHOR.view-whole-CAS.json').records,t5ops=read(T5P+'PROPOSAL.five-exact-view-child-array-append-CAS.draft.json').operations,t4ops=read(T4+'PROPOSAL.exact-two-endpoint-view-child-array-CAS.pending.json').operations;
function find(ns:any[],id:string):any{for(const n of ns){if(n.id===id)return n;const r=find(n.children??[],id);if(r)return r}}
function nodeAt(v:any,ids:string[]){let ns=v.rootNodes,n:any;for(const id of ids){n=ns.find((x:any)=>x.id===id);assert(n,'Missing structure '+id);ns=n.children}return n}
function append(node:any,children:any[]){for(const child of children){assert(!node.children.some((n:any)=>n.kind===child.kind&&(child.id?n.id===child.id:n.goalId===child.goalId)),'Duplicate append');node.children.push(structuredClone(child))}}
function prospective(v:any,path:string){const historical708=structuredClone(v);const known=t5ops.find((x:any)=>x.normalView.path===path);if(known){const arr=nodeAt(historical708,known.stableStructureIdPath).children;assert.deepEqual(arr,known.beforeChildren.concat(known.appendChildren),'Known exact T5-only array delta');arr.splice(known.beforeChildren.length)}const out=structuredClone(v),cas=t2views.find((x:any)=>x.path===path);if(cas){assert.deepEqual(historical708,cas.beforeWholeView,'Only reviewed T5 delta may separate current716 from sealed T2 baseline');for(const op of cas.operations)append(find(out.rootNodes,op.parentStructureId),op.appendChildren)}
 for(const ops of [t4ops]){const op=ops.find((x:any)=>x.normalView.path===path);if(op){assert.deepEqual(nodeAt(historical708,op.stableStructureIdPath).children,op.beforeChildren,'Exact selected baseline child array');append(nodeAt(out,op.stableStructureIdPath),op.appendChildren)}}return out}
function project(raw:any,v:any){const m=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g])),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m),p=applyCompositionViewProjection([{meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}],normalizeCompositionView(v))[0],pm=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(pm),stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,string[]>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,pm,children)){parents.set(c,[...(parents.get(c)||[]),id].sort());stack.push(c)}}const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean);return {targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents,projected:pm}}
// Exact inherited-requires/required-cluster expansion used by the root T5 writer.
const parentByChild=new Map<string,Set<string>>();
for(const g of after.goals)for(const id of g.contains??[]){const ps=parentByChild.get(id)??new Set<string>();ps.add(g.id);parentByChild.set(id,ps)}
const effectiveCache=new Map<string,Map<string,any>>();
function effectiveRequires(id:string){
 const old=effectiveCache.get(id);if(old)return old;
 const out=new Map<string,any>();for(const r of by.get(id)?.requires??[])out.set(r,{kind:'requires',from:id,to:r,declaredByGoalId:id});
 const seen=new Set<string>(),stack=[...(parentByChild.get(id)??[])];
 while(stack.length){const p=stack.pop()!;if(seen.has(p))continue;seen.add(p);for(const r of by.get(p)?.requires??[])if(!out.has(r))out.set(r,{kind:'inheritedRequires',from:id,to:r,declaredByGoalId:p});stack.push(...(parentByChild.get(p)??[]))}
 effectiveCache.set(id,out);return out;
}
function closure(seeds:string[],ctx:any){
 const missing=new Map<string,any>(),all=new Set<string>(),atoms=new Set<string>(),cycles:any[]=[];
 for(const seed of seeds){const seen=new Set<string>(),queue:any[]=[...effectiveRequires(seed)].map(([id,edge])=>({id,chain:[seed,id],edges:[edge]}));
  for(let n=0;n<queue.length;n++){const q=queue[n],id=q.id;if(seen.has(id))continue;seen.add(id);all.add(id);if(id===seed)cycles.push({seedGoalId:seed,chain:q.chain,edges:q.edges});const g=by.get(id);assert(g,'Unknown canonical prerequisite '+id);
   if((g.contains??[]).length===0){atoms.add(id);if(!ctx.targets.has(id)&&!ctx.roles.prerequisiteOnlyGoalIds.has(id)){const m=missing.get(id)||{goalId:id,title:g.title,rawTargetRole:ctx.roles.targetGoalIds.has(id),graphObjectPresent:ctx.projected.has(id),witnesses:[]};m.witnesses.push({seedGoalId:seed,seedPackage:packageOf(seed),chain:q.chain,edges:q.edges});missing.set(id,m)}}
   for(const child of g.contains??[])queue.push({id:child,chain:[...q.chain,child],edges:[...q.edges,{kind:'requiredClusterContainsExpansion',from:id,to:child}]});
   for(const [req,edge]of effectiveRequires(id))queue.push({id:req,chain:[...q.chain,req],edges:[...q.edges,edge]});
  }
 }
 return{requiredGoalIds:[...all].sort(),requiredAtomicGoalIds:[...atoms].sort(),missingGraphGoalIds:[...all].filter(id=>!ctx.projected.has(id)).sort(),effectiveCycles:cycles,missing:[...missing.values()].sort((a,b)=>a.goalId.localeCompare(b.goalId))};
}
const views=readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json')).sort().map(n=>'curricula/DE/Gymnasium/composition-views/chemie/'+n);assert.equal(views.length,41);
const results:any[]=[];const viewInputs:any[]=[];
for(const path of views){const v=read(path),pv=prospective(v,path),b=project(before,v),a=project(after,pv);const newExamTargets=[...a.targets].filter(id=>candidateIds.has(id)),newOrdinaryTargets=[...a.targets].filter(id=>oldBy.has(id)&&!b.targets.has(id));const seeds=[...newExamTargets,...newOrdinaryTargets];const candidateClosure=closure(seeds,a),allTargetClosure=closure([...a.targets],a),baselineClosure=closure([...b.targets],b);results.push({path,scope:v.scope,newExamTargets:newExamTargets.map(id=>({goalId:id,package:packageOf(id)})),newOrdinaryTargets,baselineTargetGoalIds:[...b.targets].sort(),prospectiveTargetGoalIds:[...a.targets].sort(),integratedT5Closure:closure(t5.filter((g:any)=>a.targets.has(g.id)).map((g:any)=>g.id),a),prospectiveTargetCount:a.targets.size,prospectiveSupportCount:a.roles.prerequisiteOnlyGoalIds.size,candidateClosure,allTargetClosure,baselineClosure});viewInputs.push(pin(path))}
const decisions=read(O+'AUTHOR.explicit-eight-prerequisite-support-role-decisions.pending.json').decisions;
inputs.push(pin(O+'AUTHOR.explicit-eight-prerequisite-support-role-decisions.pending.json'));
function supportEntries(path:string){return decisions.filter((d:any)=>d.viewPaths.includes(path)).map((d:any)=>({kind:'goalEntry',goalId:d.goalId,projectionRole:d.proposedProjectionRole})).sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId))}
for(const r of results){assert.deepEqual(supportEntries(r.path).map((e:any)=>e.goalId),r.candidateClosure.missing.map((m:any)=>m.goalId),'Explicit author role decision must exactly equal genuine missing atomic prerequisites');for(const m of r.candidateClosure.missing){assert(!m.rawTargetRole&&m.graphObjectPresent,'Existing role or graph-object issue requires separate author judgment');assert.equal(by.get(m.goalId).contains.length,0)}}
function testPlacement(location:'rootNodes'|'rootStructureChildren'){
 const checks:any[]=[],ops:any[]=[];
 for(const r of results){const v=read(r.path),pv=prospective(v,r.path),plain=project(after,pv),entries=supportEntries(r.path),next=structuredClone(pv),normal=structuredClone(v);
  if(entries.length){if(location==='rootNodes'){next.rootNodes.push(...structuredClone(entries));normal.rootNodes.push(...structuredClone(entries))}else{assert.equal(next.rootNodes[0].kind,'structure');next.rootNodes[0].children.push(...structuredClone(entries));normal.rootNodes[0].children.push(...structuredClone(entries))}}
  const fixed=project(after,next),normalBefore=project(before,v),normalFixed=project(before,normal),missing=closure([...r.newExamTargets.map((g:any)=>g.goalId),...r.newOrdinaryTargets],fixed);
  const expected=new Set(entries.map((e:any)=>e.goalId));
  const targetChanges=[...new Set([...plain.roles.targetGoalIds,...fixed.roles.targetGoalIds])].filter(id=>plain.roles.targetGoalIds.has(id)!==fixed.roles.targetGoalIds.has(id));
  const filteredTargetChanges=[...new Set([...plain.targets,...fixed.targets])].filter(id=>plain.targets.has(id)!==fixed.targets.has(id));
  const supportAdds=[...fixed.roles.prerequisiteOnlyGoalIds].filter(id=>!plain.roles.prerequisiteOnlyGoalIds.has(id)).sort();assert.deepEqual(supportAdds,[...expected].sort());
  const supportLoss=[...plain.roles.prerequisiteOnlyGoalIds].filter(id=>!fixed.roles.prerequisiteOnlyGoalIds.has(id));
  const seenChanges=[...new Set([...plain.seen,...fixed.seen])].filter(id=>plain.seen.has(id)!==fixed.seen.has(id));
  const parentChanges=[...plain.seen].filter(id=>JSON.stringify(plain.parents.get(id))!==JSON.stringify(fixed.parents.get(id)));
  const normalSeenChanges=[...new Set([...normalBefore.seen,...normalFixed.seen])].filter(id=>normalBefore.seen.has(id)!==normalFixed.seen.has(id));
  const normalParentChanges=[...normalBefore.seen].filter(id=>JSON.stringify(normalBefore.parents.get(id))!==JSON.stringify(normalFixed.parents.get(id)));
  const errors=compileCompositionView(next,after).findings.filter((f:any)=>f.severity==='error');
  checks.push({path:r.path,supportAdded:supportAdds,missingEffectiveCandidateAtomicPrerequisites:missing.missing.map((m:any)=>m.goalId),missingGraphPrerequisites:missing.missingGraphGoalIds,effectiveCycles:missing.effectiveCycles,targetChanges,filteredTargetChanges,supportLoss,renderedSetChanges:seenChanges,oldRenderedParentChanges:parentChanges,normalOnlyRenderedSetChanges:normalSeenChanges,normalOnlyParentChanges:normalParentChanges,compositionErrors:errors,integratedT5ClosureAfterSupport:closure(t5.filter((g:any)=>fixed.targets.has(g.id)).map((g:any)=>g.id),fixed),remainingAllTargetClosure:closure([...fixed.targets],fixed)});
  if(entries.length)ops.push({path:r.path,beforeFilePin:pin(r.path),arrayJsonPointer:location==='rootNodes'?'/rootNodes':'/rootNodes/0/children',parentStructureId:location==='rootNodes'?null:v.rootNodes[0].id,beforeArray:location==='rootNodes'?v.rootNodes:v.rootNodes[0].children,appendEntries:entries,afterArray:location==='rootNodes'?normal.rootNodes:normal.rootNodes[0].children,roleRationaleGoalIds:[...expected].sort(),candidateWitnesses:r.candidateClosure.missing});
 }
 const failed=checks.filter(c=>c.missingEffectiveCandidateAtomicPrerequisites.length||c.missingGraphPrerequisites.length||c.effectiveCycles.length||c.targetChanges.length||c.filteredTargetChanges.length||c.supportLoss.length||c.renderedSetChanges.length||c.oldRenderedParentChanges.length||c.normalOnlyRenderedSetChanges.length||c.normalOnlyParentChanges.length||c.compositionErrors.length||c.integratedT5ClosureAfterSupport.missing.length);
 return{location,checks,operations:ops,failed,pass:failed.length===0};
}
const rootNodeTrial=testPlacement('rootNodes');
const childTrial=rootNodeTrial.pass?null:testPlacement('rootStructureChildren');
const badRootPaths=new Set(rootNodeTrial.failed.map((r:any)=>r.path));
const selected=rootNodeTrial.pass?rootNodeTrial:{location:'rootNodes when interface-preserving; existing root structure children only for exact runtime-anchor preservation',pass:childTrial!.pass,checks:rootNodeTrial.checks.map((r:any)=>badRootPaths.has(r.path)?childTrial!.checks.find((c:any)=>c.path===r.path):r),operations:rootNodeTrial.operations.map((r:any)=>badRootPaths.has(r.path)?childTrial!.operations.find((c:any)=>c.path===r.path):r)};
assert(selected.pass,'Neither append location preserves exact target/rendered interfaces');
dump('CHECK.rootNodes-placement-actual-runtime-trial.json',{status:rootNodeTrial.pass?'PASS_PREFERRED_NONRENDERED_ROOTNODE_ENTRIES':'REJECT_PREFERRED_LOCATION_RENDERED_INTERFACE_CHANGES',location:rootNodeTrial.location,affectedViews:rootNodeTrial.failed.map((x:any)=>({path:x.path,oldRenderedParentChanges:x.oldRenderedParentChanges,normalOnlyParentChanges:x.normalOnlyParentChanges,renderedSetChanges:x.renderedSetChanges,normalOnlyRenderedSetChanges:x.normalOnlyRenderedSetChanges})),normalWrites:0});
dump('PROPOSAL.exact52-sparse-prerequisiteOnly-append-CAS.pending.json',{role:'EXPLICIT_AUTHOR_SUPPORT_ONLY_CAS_PENDING_ROOT_INDEPENDENT_REVIEW',normalBaseline:inputs[0],selectedAppendLocation:selected.location,operations:selected.operations,counts:{views:selected.operations.length,goalEntryAppends:selected.operations.reduce((n:number,x:any)=>n+x.appendEntries.length,0),distinctExistingAtomicGoalIds:decisions.length,newTargets:0,newGoals:0},compositionWithExistingCandidates:'Apply sparse entries while retaining all normal716 arrays and all already reviewed T2/T4 appends. Normal arrays are pinned for CAS; target-folder changes from independent packages are composed in memory only.',noRuntimeInference:true,ordinaryAndAssessmentBodiesUnchanged:true,noSourceEntitlementOrThemeSelectionClaim:true,normalWrites:0});
dump('CHECK.actual41-support-only-closure-and-interface.json',{status:'PASS_ALL41_FULL_EFFECTIVE_CANDIDATE_CLOSURE_AND_SUPPORT_ONLY_INTERFACE',selectedAppendLocation:selected.location,views:41,checks:selected.checks,normalWrites:0,newScientificOrHumanApproval:false});
for(const q of inputs)assert.deepEqual(pin(q.path),q,'Input changed during read-only authoring');
const sparse=results.filter(x=>x.candidateClosure.missing.length).map(x=>({path:x.path,missing:x.candidateClosure.missing}));
const ids=[...new Set(sparse.flatMap(x=>x.missing.map((m:any)=>m.goalId)))].sort();
const kindsPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';const kinds=new Map<string,any>(read(kindsPath).decisions.map((d:any)=>[d.goalId,d]));
dump('INPUT.current716-structural-classification-fields.json',{canonicalPin:inputs[0],semanticKindsPin:pin(kindsPath),scientificBodiesReauthored:false,goals:before.goals.map((g:any)=>({id:g.id,title:g.title,type:g.type,contains:g.contains??[],requires:g.requires??[],semanticKind:kinds.get(g.id)?.semanticKind,semanticDecisionStatus:kinds.get(g.id)?.decisionStatus,applicabilityProjection:g.extendedData?.applicabilityProjection??null,tags:g.tags??[],phase:g.phase??g.dimensionTags?.phase??null}))});
dump('INPUT.exact-current-and-sealed-candidate-pins.json',{inputs,normalViewInputs:viewInputs,currentGoalCount:716,prospectiveGoalCount:737,normalWrites:0});
dump('INVENTORY.complete41-prospective-transitive-requires.actual.json',{status:'ACTUAL_ALL41_TRANSITIVE_REQUIRES_INVENTORY_BEFORE_AUTHOR_ROLE_DECISION',scope:'Full effective inherited-cluster requires and required-cluster expansion into current atomic descendants, exactly matching root T5 writer; stock role/projection/reachability/filter functions. Stable716 includes independently reviewed T5 integration; prospective T2v6 and T4v3 sparse appends preserve it. New candidate and newly offered ordinary consumers plus complete all-target and baseline inventories are recorded separately.',results,summary:{candidatePackageCount:3,newCandidateExamCount:21,integratedT5ScientificBodiesVerifiedExact:8,newExamOffers:results.reduce((n,r)=>n+r.newExamTargets.length,0),newOrdinaryOffers:results.reduce((n,r)=>n+r.newOrdinaryTargets.length,0),affectedCandidateViews:sparse.length,distinctMissingCandidateGoals:ids.length,missingCandidateViewGoalEntries:sparse.reduce((n,r)=>n+r.missing.length,0),otherBaselineStockDeficitsNotAutoRemedied:true},normalWrites:0});
dump('INPUT.selected-missing-prerequisite-whole-current-goals.json',{canonicalPin:inputs[0],records:ids.map(goalId=>({goalId,wholeCurrentGoal:by.get(goalId)}))});
console.log(JSON.stringify({affectedViews:sparse.length,missingViewGoalEntries:sparse.reduce((n,r)=>n+r.missing.length,0),distinctMissingGoals:ids.length,selectedAppendLocation:selected.location,preferredRootNodesPassed:rootNodeTrial.pass,integratedT5Missing:results.reduce((n,r)=>n+r.integratedT5Closure.missing.length,0),candidateCycleViews:results.filter(r=>r.candidateClosure.effectiveCycles.length).length,allTargetDeficitPairs:results.reduce((n,r)=>n+r.allTargetClosure.missing.length,0),baselineDeficitPairs:results.reduce((n,r)=>n+r.baselineClosure.missing.length,0)},null,2));
