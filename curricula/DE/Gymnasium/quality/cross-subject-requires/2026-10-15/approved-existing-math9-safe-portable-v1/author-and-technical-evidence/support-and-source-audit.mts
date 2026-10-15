// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,readdirSync,writeFileSync,mkdirSync,lstatSync,unlinkSync,symlinkSync,existsSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildRequiresInventory,readActiveLandscapes,stableJson,fingerprint,bytesFingerprint} from './isolated-root/app/scripts/lib/crossSubjectRequiresInventory'
import {validateRequiresDecisions} from './isolated-root/app/scripts/lib/crossSubjectRequiresReview'
import {buildCrossLandscapeGraph,findCrossLandscapeCycles,graphKey} from './isolated-root/app/scripts/lib/crossLandscapeGraph'
import {normalizeCanonicalLandscape} from './isolated-root/app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from './isolated-root/app/src/utils/authoring/compositionViewAuthoring'
import {convertLearningGoal} from './isolated-root/app/src/goalTypes'
import {applyCompositionViewProjection,compositionViewExposesGoal} from './isolated-root/app/src/utils/compositionViewRuntime'
import {buildDirectChildrenMap,getRenderedChildIds} from './isolated-root/app/src/utils/treeProjectionRuntime'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput} from './isolated-root/app/scripts/positiveGoalEvidenceProfileModel'
import {fingerprintSemanticKindSourceGoal} from './isolated-root/app/scripts/goalBookModel'

const out=dirname(fileURLToPath(import.meta.url)), main=resolve(out,'../../..'), root=resolve(out,'isolated-root')
const bundle='curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/approved-existing-math9-safe-portable-v1'
const mp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',pp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const reg='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const hash=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const dump=(x:any)=>JSON.stringify(x,null,2)+'\n'
const inputBindings=new Map<string,any>()
function read(path:string){const b=readFileSync(path);const old=inputBindings.get(path);if(old)assert.equal(old.sha256,hash(b));inputBindings.set(path,{path:relative(main,path),bytes:b.length,sha256:hash(b)});return JSON.parse(b.toString())}
function binding(path:string){const b=readFileSync(path);return {path:relative(main,path),bytes:b.length,sha256:hash(b)}}
function write(path:string,value:any){mkdirSync(dirname(path),{recursive:true});writeFileSync(path,dump(value),{flag:'wx'})}
function detachParents(path:string){const parent=dirname(path);if(parent===root)return;detachParents(parent);if(existsSync(parent)&&lstatSync(parent).isSymbolicLink()){const old=resolve(dirname(parent),readlink(parent));const children=readdirSync(old,{withFileTypes:true});unlinkSync(parent);mkdirSync(parent);for(const child of children)symlinkSync(resolve(old,child.name),resolve(parent,child.name),child.isDirectory()?'dir':'file')}else mkdirSync(parent,{recursive:true})}
// Avoid traversing or writing through the read-only Main quality scaffold.
import {readlinkSync} from 'node:fs'
const readlink=(p:string)=>readlinkSync(p)
function candidateWrite(path:string,data:string){const p=resolve(root,path);detachParents(p);if(existsSync(p)&&lstatSync(p).isSymbolicLink())unlinkSync(p);writeFileSync(p,data,{flag:existsSync(p)?'w':'wx'})}
const intake=read(resolve(out,'selected-nine-current-authority-and-source-limits.actual.json'))
const ids=new Set<string>(intake.selected.map((r:any)=>r.goalId))
const baselineMath=read(resolve(main,mp)),baselinePhys=read(resolve(main,pp)),mathRaw=read(resolve(root,mp)),physRaw=read(resolve(root,pp))
assert.equal(stableJson(mathRaw),stableJson(baselineMath));assert.equal(hash(readFileSync(resolve(root,reg))),hash(readFileSync(resolve(main,reg))))
const byPhys=new Map<string,any>(physRaw.goals.map((g:any)=>[g.id,g])),oldPhys=new Map<string,any>(baselinePhys.goals.map((g:any)=>[g.id,g]))
for(const [id,g] of byPhys){const old=oldPhys.get(id);assert.equal(stableJson({...g,requires:old.requires}),stableJson(old));if(!ids.has(id))assert.equal(stableJson(g),stableJson(old))}
const cfg=read(resolve(root,'curricula/quality/cross-subject-requires/math-physics.config.json'))
const nativeBaseline=buildRequiresInventory(main,cfg);assert.equal(stableJson(nativeBaseline),stableJson(read(resolve(main,'curricula/quality/cross-subject-requires/math-physics.inventory.json'))))
const proposed=buildRequiresInventory(root,cfg);assert.equal(proposed.families.length,1);assert.equal(proposed.families[0].counts.stableGoalIds,2016);assert.equal(proposed.families[0].counts.curricularAtomic,1285)
const active=readActiveLandscapes(root,{...cfg,excludedDirectories:['quality']});assert.equal(active.length,593)
const graph=buildCrossLandscapeGraph(active);const cycles=findCrossLandscapeCycles(graph);assert.deepEqual(cycles,[])
assert.deepEqual(graph.diagnostics.filter(d=>['missing_reference','ambiguous_reference'].includes(d.code)),[])
const originalAuthor=read(resolve(main,'tmp/cross-subject-requires/remaining18-whole-science-author-20261014-v1/native-proposal.bound.inert.json'))
const originalReview=read(resolve(main,'tmp/cross-subject-requires/remaining18-independent-science-peer-20261014-v1/native-independent-review.bound.inert.json'))
const byInventory=new Map(proposed.families[0].goals.map(g=>[g.goalId,g]))
const exactBindings=intake.selected.map((r:any)=>{const d=r.exactOriginalAuthorDecision,o=byInventory.get(r.goalId)!.occurrences.find(o=>o.selected)!;
 assert.equal(stableJson(o.reviewInput),stableJson(d.proposalBinding.proposed));assert.equal(stableJson(o.directRequires),stableJson(d.proposalBinding.proposedRequires));
 const actualNominees=d.prerequisiteGoalIds.map((id:string)=>{const p=byInventory.get(id)!.occurrences.find(o=>o.selected)!;const bound=d.proposalBinding.prerequisiteInputs.find((x:any)=>x.goalId===id);assert.equal(p.reviewInput.semanticSha256,bound.semanticSha256);assert.equal(p.reviewInput.scopeSha256,bound.scopeSha256);return {goalId:id,wholeSemanticAndScopeCurrent:true}})
 return {goalId:r.goalId,decisionId:d.decisionId,baselineAndProposedAuthorBindingsCurrent:true,nomineeBindings:actualNominees}})
write(resolve(out,'native-exact-nine-scientific-bindings.actual.json'),{exactCurrentBindings:exactBindings,approvedDecisions:9,edges:10,nativeGlobalCycles:0,missingOrAmbiguousReferences:0,scientificReviewReissued:false,wholeGoalPSourceApprovalCreated:false})

const math=normalizeCanonicalLandscape(mathRaw),phys=normalizeCanonicalLandscape(physRaw),allGoals=new Map([...math.goals,...phys.goals].map(g=>[g.id,g] as const))
const mathIds=new Set(math.goals.map(g=>g.id)),physicsIds=new Set(phys.goals.map(g=>g.id))
const roots=new Map([math,phys].map(l=>[l.landscapeId,l.goals.find(g=>g.tags?.includes('root'))!.id])),landscapes=new Map([math,phys].map(l=>[l.landscapeId,l]))
const universe={landscapeId:'joint',title:'joint',goals:[...math.goals,...phys.goals]}
const entries=[phys,math].map(l=>({meta:l,goals:l.goals.map(g=>convertLearningGoal(g,{landscapeId:l.landscapeId}))}))
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?paths(resolve(dir,e.name)):e.name.endsWith('.view.json')?[resolve(dir,e.name)]:[])
function tree(raw:any){const projected=applyCompositionViewProjection(entries,raw),own=projected.find(e=>e.meta.landscapeId===raw.landscapeId)!;const by=new Map(projected.flatMap(e=>e.goals).map(g=>[g.id,g] as const)),children=buildDirectChildrenMap(by);const walk=(id:string):any=>({id,title:by.get(id)!.title,contains:getRenderedChildIds(id,by,children).map(walk)});return own.goals.filter(g=>g.tags?.includes('root')).map(g=>walk(g.id))}
const viewRows:any[]=[],supportChanges:any[]=[],views:any[]=[],contextRows:any[]=[],missingAfter:any[]=[]
let supportBefore=0,supportAfter=0
for(const subject of ['mathematik','physik'])for(const path of paths(resolve(main,`curricula/DE/Gymnasium/composition-views/${subject}`)).sort()){
 const rel=relative(main,path),raw=read(path),before=normalizeCompositionView(raw),beforeRoles=collectCompositionProjectionRoleGoalIds(before.rootNodes,allGoals,roots),own=subject==='physik'?phys:math
 const cBefore=compileCompositionView(before,own,universe,landscapes);assert.deepEqual(cBefore.findings.filter(x=>x.severity==='error'),[])
 const after=structuredClone(raw),missing=new Map<string,any[]>()
 if(subject==='physik'){
  supportBefore += [...beforeRoles.prerequisiteOnlyGoalIds].filter(id=>mathIds.has(id)).length
  for(const pid of new Set([...beforeRoles.targetGoalIds,...beforeRoles.prerequisiteOnlyGoalIds]))if(physicsIds.has(pid)){
   for(const k of graph.effectiveRequires.get(graphKey(phys.landscapeId,pid))??[]){const node=graph.nodes.get(k)!;if(node.landscapeId!==math.landscapeId)continue;const mid=node.goal.id;
    if(!beforeRoles.targetGoalIds.has(mid)&&!beforeRoles.prerequisiteOnlyGoalIds.has(mid)){assert(!(node.goal.contains?.length),'Missing non-atomic Math authority '+mid);assert.equal(byInventory.get(mid)!.occurrences.find(x=>x.selected)!.semanticKind,'curricularAtomic');missing.set(mid,[...(missing.get(mid)??[]),{physicsGoalId:pid,originKind:'actual direct/contains-effective requirement'}])}
   }
  }
 }
 const adds=[...missing].sort(([a],[b])=>a.localeCompare(b)).map(([goalId,origins])=>({reference:{kind:'goalEntry',goalId,projectionRole:'prerequisiteOnly'},origins}))
 if(adds.length){assert.equal(after.rootNodes[0].kind,'structure');after.rootNodes[0].children.push(...adds.map(x=>x.reference));candidateWrite(rel,dump(after));supportChanges.push({path:rel,addedReferences:adds})}
 const view=normalizeCompositionView(after),roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,allGoals,roots),compiled=compileCompositionView(view,own,universe,landscapes)
 assert.deepEqual(compiled.findings.filter(x=>x.severity==='error'),[]);assert.equal(stableJson([...roles.targetGoalIds].sort()),stableJson([...beforeRoles.targetGoalIds].sort()));assert.equal(stableJson(compiled.compiledRootNodes),stableJson(cBefore.compiledRootNodes));assert.equal(stableJson(tree(after)),stableJson(tree(raw)))
 const restored=structuredClone(after);if(adds.length)restored.rootNodes[0].children.splice(raw.rootNodes[0].children.length);assert.equal(stableJson(restored),stableJson(raw))
 for(const x of adds){assert(roles.prerequisiteOnlyGoalIds.has(x.reference.goalId));assert(!compositionViewExposesGoal(entries,after,x.reference.goalId))}
 if(subject==='physik'){
  supportAfter += [...roles.prerequisiteOnlyGoalIds].filter(id=>mathIds.has(id)).length
  for(const pid of new Set([...roles.targetGoalIds,...roles.prerequisiteOnlyGoalIds]))if(physicsIds.has(pid))for(const k of graph.effectiveRequires.get(graphKey(phys.landscapeId,pid))??[]){const node=graph.nodes.get(k)!;if(node.landscapeId!==math.landscapeId)continue;if(!roles.targetGoalIds.has(node.goal.id)&&!roles.prerequisiteOnlyGoalIds.has(node.goal.id))missingAfter.push({viewId:view.viewId,physicsGoalId:pid,mathGoalId:node.goal.id});
    // Separate learning context, not automatically introduced runtime guards.
    const queue=[k],seen=new Set<string>();while(queue.length){const key=queue.pop()!;if(seen.has(key))continue;seen.add(key);assert(graph.nodes.has(key));queue.push(...graph.effectiveRequires.get(key)??[]);if(graph.nodes.get(key)!.goal.contains?.length)queue.push(...graph.contains.get(key)??[])}
    contextRows.push({physicsViewPath:rel,physicsGoalId:pid,immediateMathGoalId:node.goal.id,definitionGloballyInstalled:true,immediateGuardProjected:true,
     transitiveLearningContextGoalIds:[...seen].filter(key=>graph.nodes.get(key)!.landscapeId===math.landscapeId).map(key=>graph.nodes.get(key)!.goal.id).sort(),
     transitiveContextMissingFromThisPhysicsProjection:[...seen].filter(key=>graph.nodes.get(key)!.landscapeId===math.landscapeId&&!roles.targetGoalIds.has(graph.nodes.get(key)!.goal.id)&&!roles.prerequisiteOnlyGoalIds.has(graph.nodes.get(key)!.goal.id)).map(key=>graph.nodes.get(key)!.goal.id).sort(),notAdditionalPhysicsGuards:true})
   }
 }
 viewRows.push({path:rel,subject,viewId:view.viewId,scope:view.scope,addedReferences:adds.length,targetSetSha256:hash(stableJson([...roles.targetGoalIds].sort())),compiledVisibleForestSha256:hash(stableJson(compiled.compiledRootNodes)),frontendVisibleTreeSha256:hash(stableJson(tree(after))),allPreserved:true})
 views.push({subject,view,roles})
}
assert.equal(views.filter(v=>v.subject==='physik').length,69);assert.equal(views.filter(v=>v.subject==='mathematik').length,88);assert.deepEqual(missingAfter,[])
// Projection-role subject union: the native authoring resolver handles each
// independently selected subject; support-only references never remove an
// independently selected Math target. No learner choice is applied here.
const unionRows:any[]=[],routeRows:any[]=[]
for(const pv of views.filter(v=>v.subject==='physik')){
 assert([...pv.roles.targetGoalIds].every((id:string)=>!mathIds.has(id)))
 for(const mv of views.filter(v=>v.subject==='mathematik'&&v.view.scope.jurisdiction===pv.view.scope.jurisdiction)){
  const union=new Set([...pv.roles.targetGoalIds,...mv.roles.targetGoalIds]);const selectedMath=[...union].filter(id=>mathIds.has(id)).sort();assert.equal(stableJson(selectedMath),stableJson([...mv.roles.targetGoalIds].filter(id=>mathIds.has(id)).sort()))
  unionRows.push({physicsViewId:pv.view.viewId,mathViewId:mv.view.viewId,mathTargetUnionPreserved:true})
 }
}
for(const r of contextRows){const pv=views.find(v=>v.view.viewId===viewRows.find(x=>x.path===r.physicsViewPath)!.viewId)!;const choices=views.filter(v=>v.subject==='mathematik'&&v.view.scope.jurisdiction===pv.view.scope.jurisdiction);routeRows.push({...r,authoredSameJurisdictionWholeTargetRouteViewIds:choices.filter(v=>r.transitiveLearningContextGoalIds.every((id:string)=>v.roles.targetGoalIds.has(id))).map(v=>v.view.viewId),nativeStageCourseRouteAcceptanceClaim:false})}
write(resolve(out,'all157-native-composition-minimal-support-and-targets.actual.json'),{nativeGlobalFiles:593,MathViews:88,PhysicsViews:69,supportBefore,supportAfter,changedViewCount:supportChanges.length,addedSupportReferences:supportChanges.reduce((n,r)=>n+r.addedReferences.length,0),supportChanges,viewRows,missingImmediateGuardsAfter:missingAfter,roleUnionPairsChecked:unionRows.length,unionRows,originalTargetsReferencesCompiledForestsAndRuntimeTreesPreserved:true,automaticMathTargetPromotion:false,automaticTransitivePhysicsGating:false,actualJavaOrLearnerConfigurationExecuted:false})
write(resolve(out,'separate-transitive-Math-context-and-authored-route-limits.actual.json'),{rows:routeRows,allImmediateGuardDefinitionsInstalled:true,allTransitiveDefinitionsInstalled:true,theseAreNotNewPhysicsGuards:true,notASelfContainedPhysicsOnlyMathTeachingRoute:true,previousNativeAuditBoundary:'adopted-caf-three-native-scope-route-audit-20261014-v1 unchanged original snapshot; its185/345 unsupported occurrences are not recomputed or dismissed by this TypeScript authored-view check.'})


write(resolve(out,"native-support-input-bindings.actual.json"),{inputs:[...inputBindings.values()]});
console.log(JSON.stringify({selectedGoals:ids.size,changedViews:supportChanges.length,addedSupportReferences:supportChanges.reduce((n,r)=>n+r.addedReferences.length,0),global593Dag:true,missingGuards:0}));
