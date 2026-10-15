import assert from 'node:assert/strict'
import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {readActiveLandscapes,buildRequiresInventory,stableJson,bytesFingerprint} from './isolated-root/app/scripts/lib/crossSubjectRequiresInventory'
import {buildCrossLandscapeGraph,findCrossLandscapeCycles,graphKey} from './isolated-root/app/scripts/lib/crossLandscapeGraph'
import {validateRequiresDecisions} from './isolated-root/app/scripts/lib/crossSubjectRequiresReview'
import {normalizeCanonicalLandscape} from './isolated-root/app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from './isolated-root/app/src/utils/authoring/compositionViewAuthoring'
import {convertLearningGoal} from './isolated-root/app/src/goalTypes'
import {applyCompositionViewProjection,compositionViewExposesGoal} from './isolated-root/app/src/utils/compositionViewRuntime'
import {buildDirectChildrenMap,getRenderedChildIds} from './isolated-root/app/src/utils/treeProjectionRuntime'
import {fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceProfile,fingerprintPositiveGoalEvidenceReviewInput} from './isolated-root/app/scripts/positiveGoalEvidenceProfileModel'
import {fingerprintSemanticKindSourceGoal} from './isolated-root/app/scripts/goalBookModel'
const O=dirname(fileURLToPath(import.meta.url)),M=resolve(O,'../../..'),R=resolve(O,'isolated-root')
const B='curricula/DE/Gymnasium/quality/cross-subject-requires/2026-10-15/fresh-four-existing-math-portable-v1'
const paths={math:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',physics:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',registry:'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'}
const inputs=new Map<string,any>()
function read(p:string){const raw=readFileSync(p),binding={path:relative(M,p),bytes:raw.length,sha256:bytesFingerprint(raw)};inputs.set(p,binding);return JSON.parse(raw.toString())}
function bind(p:string){const raw=readFileSync(p);return {path:relative(M,p),bytes:raw.length,sha256:bytesFingerprint(raw)}}
function files(p:string):string[]{return readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(resolve(p,e.name)):e.name.endsWith('.view.json')?[resolve(p,e.name)]:[])}
const oldMath=read(resolve(M,paths.math)),mathRaw=read(resolve(R,paths.math)),oldPhy=read(resolve(M,paths.physics)),phyRaw=read(resolve(R,paths.physics));assert.deepEqual(oldMath,mathRaw)
const materialized=read(resolve(O,'four-whole-Goal-P-Math-and-independent-Requires-review-input.actual.json')),selected=new Map(materialized.rows.map((r:any)=>[r.goalId,r]))
const oldBy=new Map(oldPhy.goals.map((g:any)=>[g.id,g]));let changed=0,added=0
for(const g of phyRaw.goals){const old:any=oldBy.get(g.id);assert(old);if(selected.has(g.id)){assert.deepEqual(g,(selected.get(g.id) as any).wholeProposedGoal);assert.deepEqual({...g,requires:old.requires},old);changed++;added+=g.requires.filter((id:string)=>!old.requires.includes(id)).length;assert(old.requires.every((id:string)=>g.requires.includes(id)))}else assert.deepEqual(g,old)}
assert.equal(changed,4);assert.equal(added,7)
const cfg=read(resolve(R,'curricula/quality/cross-subject-requires/math-physics.config.json')),active=readActiveLandscapes(R,{...cfg,excludedDirectories:['quality']}),graph=buildCrossLandscapeGraph(active)
assert.equal(active.length,593);assert.deepEqual(findCrossLandscapeCycles(graph),[]);assert.deepEqual(graph.diagnostics.filter(d=>['missing_reference','ambiguous_reference'].includes(d.code)),[])
const math=normalizeCanonicalLandscape(mathRaw),phy=normalizeCanonicalLandscape(phyRaw),mathIds=new Set(math.goals.map(g=>g.id)),phyIds=new Set(phy.goals.map(g=>g.id)),allGoals=new Map([...math.goals,...phy.goals].map(g=>[g.id,g]))
const roots=new Map([math,phy].map(l=>[l.landscapeId,l.goals.find(g=>g.tags?.includes('root'))!.id])),landscapes=new Map([math,phy].map(l=>[l.landscapeId,l])),universe={landscapeId:'joint',title:'joint',goals:[...math.goals,...phy.goals]}
const entries=[phy,math].map(l=>({meta:l,goals:l.goals.map(g=>convertLearningGoal(g,{landscapeId:l.landscapeId}))}))
function tree(raw:any){const projected=applyCompositionViewProjection(entries,raw),own=projected.find(e=>e.meta.landscapeId===raw.landscapeId)!,by=new Map(projected.flatMap(e=>e.goals).map(g=>[g.id,g])),children=buildDirectChildrenMap(by);const walk=(id:string):any=>({id,title:by.get(id)!.title,contains:getRenderedChildIds(id,by,children).map(walk)});return own.goals.filter(g=>g.tags?.includes('root')).map(g=>walk(g.id))}
const viewRows:any[]=[];let rawBefore=0,rawAfter=0,changedViews=0
function rawMathRefs(node:any):number{return (node.kind==='goalEntry'&&node.projectionRole==='prerequisiteOnly'&&mathIds.has(node.goalId)?1:0)+(node.children??[]).reduce((a:number,n:any)=>a+rawMathRefs(n),0)}
for(const subject of ['mathematik','physik'])for(const src of files(resolve(M,'curricula/DE/Gymnasium/composition-views',subject)).sort()){
 const rel=relative(M,src),before=read(src),after=read(resolve(R,rel)),br=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(before).rootNodes,allGoals,roots),ar=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(after).rootNodes,allGoals,roots),own=subject==='physik'?phy:math,bc=compileCompositionView(normalizeCompositionView(before),own,universe,landscapes),ac=compileCompositionView(normalizeCompositionView(after),own,universe,landscapes)
 assert.deepEqual(bc.findings.filter(x=>x.severity==='error'),[]);assert.deepEqual(ac.findings.filter(x=>x.severity==='error'),[]);assert.deepEqual([...br.targetGoalIds].sort(),[...ar.targetGoalIds].sort());assert.deepEqual(bc.compiledRootNodes,ac.compiledRootNodes);assert.deepEqual(tree(before),tree(after))
 if(subject==='physik'){
  rawBefore+=before.rootNodes.reduce((a:number,n:any)=>a+rawMathRefs(n),0);rawAfter+=after.rootNodes.reduce((a:number,n:any)=>a+rawMathRefs(n),0);if(stableJson(before)!==stableJson(after))changedViews++
  assert([...ar.targetGoalIds].every(id=>!mathIds.has(id)))
  for(const pid of new Set([...ar.targetGoalIds,...ar.prerequisiteOnlyGoalIds]))if(phyIds.has(pid))for(const key of graph.effectiveRequires.get(graphKey(phy.landscapeId,pid))??[]){const n=graph.nodes.get(key)!;if(n.landscapeId===math.landscapeId)assert(ar.targetGoalIds.has(n.goal.id)||ar.prerequisiteOnlyGoalIds.has(n.goal.id))}
  for(const id of ar.prerequisiteOnlyGoalIds)if(mathIds.has(id))assert(!compositionViewExposesGoal(entries,after,id))
 }
 viewRows.push({path:rel,subject,targetSetDigest:bytesFingerprint(Buffer.from(stableJson([...ar.targetGoalIds].sort()))),compiledForestAndFrontendTreeUnchanged:true})
}
assert.equal(viewRows.length,157);assert.equal(changedViews,66);assert.equal(rawAfter-rawBefore,257)
const authorpath=resolve(M,materialized.originalRequiresAuthorAndPeer[0].path),peerpath=resolve(M,materialized.originalRequiresAuthorAndPeer[1].path),author=read(authorpath),peer=read(peerpath),inventory=read(resolve(R,'native-output/four-current-candidate.inventory.json'))
assert.deepEqual(inventory,buildRequiresInventory(R,cfg))
const vr=validateRequiresDecisions(inventory,author,{familyIds:['canonical-gymnasium'],independentReview:peer,authorLedgerSha256:bind(authorpath).sha256,inventorySha256:bind(resolve(R,'native-output/four-current-candidate.inventory.json')).sha256,reviewedInventorySha256:author.baselineInventorySha256,sourcePathExists:p=>existsSync(resolve(R,p))});assert.deepEqual(vr.errors,[])
const records=readFileSync(resolve(R,B,'current-P/four.review.jsonl'),'utf8').trim().split('\n').map(x=>JSON.parse(x)),kind=read(resolve(R,'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'));const pRows=[]
for(const row of materialized.rows){const g=phyRaw.goals.find((g:any)=>g.id===row.goalId),p=records.find(x=>x.goalId===g.id),digests:any={};for(const l of g.resourceLinks??[])if(l.type==='goal-visualization')digests[l.url]=bind(resolve(R,'app/public',l.url.replace(/^\//,''))).sha256
 assert.equal(p.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(p.profile));assert.equal(p.goalFingerprint,fingerprintGoalForPositiveEvidence(g,'curricularAtomic'));assert.equal(p.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(g,p.reviewCriteriaFingerprint,digests,'curricularAtomic'));assert.deepEqual(p.profile,row.currentWholePositiveEvidence.record.profile)
 const k=kind.decisions.find((x:any)=>x.goalId===g.id);assert.equal(k.sourceFingerprint,fingerprintSemanticKindSourceGoal(g));assert.equal(k.semanticKind,'curricularAtomic');pRows.push({goalId:g.id,actualFullAssetPInputFingerprint:p.reviewInputFingerprint,unchangedWholeProfileFingerprint:p.profileFingerprint,currentKindSourceFingerprint:k.sourceFingerprint})
}
const mainReg=read(resolve(M,paths.registry)),privateReg=read(resolve(R,paths.registry));assert.equal(privateReg.subjects.length,5);assert.deepEqual(privateReg.subjects.filter((s:any)=>s.subject!=='physik'),mainReg.subjects.filter((s:any)=>s.subject!=='physik'))
const result={createdAtUTC:new Date().toISOString(),physicsRequiresOnlyChangedGoals:changed,MathAdds:added,allOtherPhysicsAndWholeMathUnchanged:true,globalNativeGraphLandscapes:active.length,cycles:0,missingOrAmbiguousReferences:0,existingUnrelatedGraphDiagnostics:graph.diagnostics.length,nativeOriginalRequiresAuthor:bind(authorpath),nativeIndependentRequiresPeer:bind(peerpath),candidateInventory:bind(resolve(R,'native-output/four-current-candidate.inventory.json')),originalAuthorInventoryHash:author.baselineInventorySha256,RequiresValidation:vr,PhysicsViews:69,MathViews:88,changedPhysicsViews:changedViews,authoredAtomicMathSupportReferences:{before:rawBefore,after:rawAfter,added:rawAfter-rawBefore},actualDirectPlusContainsForeignGuardsResolved:true,all157TargetSetsCompiledForestsAndFrontendTreesUnchanged:true,noMathTargetInPhysicsOnly:true,selectedMathSubjectTargetUnionUnchanged:true,P4AndKind4NativeBindings:pRows,fiveSubjectsFourNonPhysicsStructureExact:true,currentMainBindings:[bind(resolve(M,paths.math)),bind(resolve(M,paths.physics)),bind(resolve(M,paths.registry))],viewRows,authority:'Bounded actual native technical replay, not new science/source/placement/human/learner-consent/host acceptance; transitive Math learning contexts remain globally installed, not automatically added as Physics guards or targets.'}
writeFileSync(resolve(O,'final-four-current-native-graph-projection-quality-binding.actual.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({...result,viewRows:undefined},null,2))
