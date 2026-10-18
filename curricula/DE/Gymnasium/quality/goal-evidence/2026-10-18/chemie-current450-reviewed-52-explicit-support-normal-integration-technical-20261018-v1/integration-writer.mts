// SPDX-License-Identifier: Apache-2.0
// Bounded, separately reviewed interface integration. No new ordinary scientific vote.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync,unlinkSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {isDeepStrictEqual} from 'node:util'
import {convertLearningGoal} from '../app/src/goalTypes'
import {applyCompositionViewProjection} from '../app/src/utils/compositionViewRuntime'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from '../app/src/utils/authoring/compositionViewAuthoring'
import {buildDirectChildrenMap,getRenderedChildIds} from '../app/src/utils/treeProjectionRuntime'
import {goalMatchesFilters} from '../app/src/utils/goalFilters'
import {fingerprintSemanticKindSourceGoal} from '../app/scripts/goalBookModel'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
const author=base+'chemie-current450-prospective-T2-T5-T4-transitive-support-author-20261018-v1/'
const out=base+'chemie-current450-reviewed-52-explicit-support-normal-integration-technical-20261018-v1'
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json',semantic='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',registry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),dump=(v:any)=>JSON.stringify(v,null,2)+'\n'
const pin=(path:string)=>{const b=readFileSync(path);return{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
assert(!existsSync(out),'Completed support integration must not be repeated')
const proposal=read(author+'PROPOSAL.exact52-sparse-prerequisiteOnly-append-CAS.pending.json'),inventory=read(author+'INVENTORY.complete41-prospective-transitive-requires.actual.json')
assert.deepEqual(pin(canonical),proposal.normalBaseline,'Support proposal baseline drift')
const graph=read(canonical),by=new Map<string,any>(graph.goals.map((g:any)=>[g.id,g])),prospectiveBy=new Map(by)
for(const g of read(base+'chemie-current450-T2-terminal-exams-interface-author-20261018-v6/AUTHOR.new-goals.full.draft.json').newGoals)prospectiveBy.set(g.id,g)
for(const g of read(base+'chemie-current450-T4-operative-two-material-author-20261018-v3/AUTHOR.two-new-complete-exam-goals.pending.json').goals)prospectiveBy.set(g.id,g)
const freezePath=author+'FREEZE.author.sha256.json',freeze=read(freezePath)
for(const f of freeze.files??freeze.members??[]){const path=f.path.startsWith('curricula/')?f.path:author+f.path;assert.deepEqual(pin(path),{path,sha256:f.sha256,bytes:f.bytes},'Author sealed member drift '+path)}
const inputs=[canonical,semantic,registry,freezePath,author+'PROPOSAL.exact52-sparse-prerequisiteOnly-append-CAS.pending.json',author+'AUTHOR.explicit-eight-prerequisite-support-role-decisions.pending.json',author+'INVENTORY.complete41-prospective-transitive-requires.actual.json'].map(pin)
const protection=read(registry).subjects.filter((s:any)=>s.subject!=='chemie').flatMap((s:any)=>[s.landscapePath,s.semanticKindLedgerPath,s.visualizationQaPath]).map(pin)
function project(graph:any,v:any){const m=new Map<string,any>(graph.goals.map((g:any)=>[g.id,g])),roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,m),p=applyCompositionViewProjection([{meta:graph,goals:graph.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:graph.landscapeId}))}],normalizeCompositionView(v))[0],by=new Map<string,any>(p.goals.map((g:any)=>[g.id,g])),children=buildDirectChildrenMap(by),stack=p.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id),seen=new Set<string>(),parents=new Map<string,Set<string>>();while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of getRenderedChildIds(id,by,children)){const ps=parents.get(c)??new Set<string>();ps.add(id);parents.set(c,ps);stack.push(c)}}const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel].filter(Boolean);return{targets:new Set<string>([...roles.targetGoalIds].filter(id=>seen.has(id)&&goalMatchesFilters(m.get(id),filters))),roles,seen,parents,filters,projected:by}}
const writes:any[]=[],checks:any[]=[],seenPairs=new Set<string>(),roleDecisions=read(author+'AUTHOR.explicit-eight-prerequisite-support-role-decisions.pending.json').decisions
for(const name of readdirSync('curricula/DE/Gymnasium/composition-views/chemie').filter(n=>n.endsWith('.view.json')).sort()){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name,v=read(path),next=structuredClone(v),op=proposal.operations.find((o:any)=>o.path===path),baseProjection=project(graph,v),row=inventory.results.find((r:any)=>r.path===path),newSupports:string[]=[]
 if(op){assert.deepEqual(pin(path),op.beforeFilePin,'Exact selected view CAS drift');const parts=op.arrayJsonPointer.split('/').slice(1);let a:any=next;for(const k of parts)a=a[k];assert(Array.isArray(a),'Support target is not array');assert.deepEqual(a,op.beforeArray,'Whole selected before array drift');for(const entry of op.appendEntries??op.appendChildren??op.append){assert.deepEqual(Object.keys(entry).sort(),['goalId','kind','projectionRole'],'Only bare role references permitted');assert.equal(entry.kind,'goalEntry','Unsupported support entry kind');assert.equal(entry.projectionRole,'prerequisiteOnly','Support proposal grants target');assert(by.has(entry.goalId),'Support must retain existing canonical ID');assert.equal(by.get(entry.goalId).contains?.length??0,0,'Literal required cluster must not replace atomic closure');assert(!baseProjection.roles.targetGoalIds.has(entry.goalId)&&!baseProjection.roles.prerequisiteOnlyGoalIds.has(entry.goalId),'Existing role must remain exact');assert(!baseProjection.targets.has(entry.goalId),'Support must not suppress target');const ownDecision=roleDecisions.find((d:any)=>d.goalId===entry.goalId);assert(ownDecision?.viewPaths.includes(path),'No authored role decision for pair');const missing=row.candidateClosure.missing.find((m:any)=>m.goalId===entry.goalId);assert(missing?.witnesses?.length,'No actual consumer prerequisite witness');for(const w of missing.witnesses){assert.equal(w.chain[0],w.seedGoalId,'Witness start differs');assert.equal(w.chain.at(-1),entry.goalId,'Witness end differs');assert.equal(w.edges.length,w.chain.length-1,'Witness edge count differs');for(let i=0;i<w.edges.length;i++){const e=w.edges[i];assert.equal(e.kind,'requires','Only actual unchanged requires paths expected');assert.equal(e.from,w.chain[i],'Witness from mismatch');assert.equal(e.to,w.chain[i+1],'Witness to mismatch');assert(prospectiveBy.get(e.from)?.requires?.includes(e.to),'Invented prerequisite edge');assert.equal(e.declaredByGoalId,e.from,'Wrong actual edge owner')}}newSupports.push(entry.goalId);seenPairs.add(path+'|'+entry.goalId);a.push(structuredClone(entry))}}
 const afterProjection=project(graph,next)
 assert.deepEqual([...afterProjection.targets].sort(),[...baseProjection.targets].sort(),'Filtered target scope changed')
 assert.deepEqual([...afterProjection.roles.targetGoalIds].sort(),[...baseProjection.roles.targetGoalIds].sort(),'Raw target scope changed')
 const actualNew=[...afterProjection.roles.prerequisiteOnlyGoalIds].filter(id=>!baseProjection.roles.prerequisiteOnlyGoalIds.has(id));assert.deepEqual(actualNew.sort(),newSupports.sort(),'Support-role delta differs')
 for(const id of baseProjection.roles.prerequisiteOnlyGoalIds)assert(afterProjection.roles.prerequisiteOnlyGoalIds.has(id),'Old support role lost')
 assert.deepEqual([...afterProjection.seen].sort(),[...baseProjection.seen].sort(),'Rendered goal set changed')
 for(const id of baseProjection.seen)assert.deepEqual([...(afterProjection.parents.get(id)??[])].sort(),[...(baseProjection.parents.get(id)??[])].sort(),'Old rendered parent changed')
 const errors=compileCompositionView(next,graph).findings.filter((f:any)=>f.severity==='error');assert.equal(errors.length,0,'Support composition error')
 checks.push({path,newSupportIds:newSupports,allOldTargetSupportRolesPreserved:true,noTargetOrRenderedOrParentChange:true,actualWitnessChainsVerified:true,compositionErrors:0})
 if(op)writes.push({path,before:pin(path),raw:readFileSync(path,'utf8'),next})
}
assert.equal(checks.length,41,'All41 scopes required');assert.equal(writes.length,12,'Expected12 views');assert.equal(seenPairs.size,52,'Expected52 support bindings');assert.equal(new Set(checks.flatMap(r=>r.newSupportIds)).size,8,'Expected8 existing atomic goals')
for(const r of inventory.results)for(const m of r.candidateClosure.missing)assert(seenPairs.has(r.path+'|'+m.goalId),'A genuine candidate prerequisite gap remains unaddressed')
for(const p of inputs)assert.deepEqual(pin(p.path),p,'Inputs changed during support preflight');for(const p of protection)assert.deepEqual(pin(p.path),p,'Protected subject drift');for(const w of writes)assert.deepEqual(pin(w.path),w.before,'View prewrite drift')
if(!process.argv.includes('--write')){console.log(JSON.stringify({checkOnly:true,views:41,changedViews:12,newSupportBindings:52,newTargets:0,newOrdinaryScience:0,allActualWitnessChainsVerified:true}));process.exit(0)}
mkdirSync(out);mkdirSync(out+'/before-views');for(const w of writes)writeFileSync(out+'/before-views/'+w.path.split('/').pop()+'.snapshot',w.raw,{flag:'wx'})
const reviewPath=out+'/REVIEW.actual-eight-role-decisions-and-52-witnesses.root.json'
writeFileSync(reviewPath,dump({role:'BOUNDED_INFORMED_ROOT_ROLE_AND_PREREQUISITE_BINDING_REVIEW_NOT_NEW_SCIENTIFIC_BODY_VOTE',inputs,decision:'ACCEPT_EXACT_EXPLICIT_SUPPORT_ROLES',scienceBoundary:'Existing reviewed requires chains are represented explicitly, not newly authored. Acid recognition supports the preexisting general qualitative functional-group foundation, not an assertion that nucleic acids have carboxyl groups. Pure-content quantification supports existing analgesic analysis. The six chemical food/digestion/enzyme competencies are upstream foundations of current digestive-aid and dosage-form goals, with all original requires/content/own assessment retained.',actualReview:'Root read all eight current DE/EN descriptions/requires and all role rationales, independently verified every actual canonical witness edge and replayed41views. No new source entitlement or direct exam coverage.',checks,limits:{newTargetOrProgressScope:0,newOrdinaryScienceVote:0,newNativeBinding:0,officialWholeSourceApproval:false,humanApproval:false,automaticMastery:false,remainingOlderTargetGapsPendingSeparateAudit:true}}),{flag:'wx'})
for(const w of writes)writeFileSync(w.path,dump(w.next))
for(const p of [...inputs.slice(0,3),...protection])assert.deepEqual(pin(p.path),p,'Unexpected protected graph/ledger/registry mutation')
writeFileSync(out+'/integration-writer.mts',readFileSync(process.argv[1]),{flag:'wx'})
writeFileSync(out+'/RECEIPT.actual-52-explicit-support-integration.json',dump({role:'TECHNICAL_INTEGRATION_OF_EXPLICIT_REVIEWED_PREREQUISITE_ROLES',review:pin(reviewPath),inputs,checks,protectedInputs:protection,outputs:writes.map(w=>pin(w.path)),newSupportBindings:52,newExistingAtomicGoalsRepresented:8,newTargets:0,newOrdinaryScientificFirstCompletions:0,newNativeDOrPBindings:0,remainingOlderTargetGapsPendingSeparateAudit:true,noM7Claim:true,noHumanApproval:true}),{flag:'wx'})
writeFileSync(out+'/SEAL.actual-52-explicit-support-integration.json',dump({role:'TECHNICAL_EXACT_OUTPUT_SEAL',members:readdirSync(out).filter(n=>n!=='before-views').map(n=>pin(out+'/'+n)),beforeViews:readdirSync(out+'/before-views').map(n=>pin(out+'/before-views/'+n)),outputs:writes.map(w=>pin(w.path))}),{flag:'wx'})
console.log(JSON.stringify({out,viewsChecked:41,changedViews:12,newExplicitSupportBindings:52,newTargets:0,newOrdinaryScience:0,allOldTargetsRolesAndRenderedParentsPreserved:true}))
