// SPDX-License-Identifier: Apache-2.0
// Actual composition-authoring APIs only; no native publication classifier or D/P/V.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const snapshot=read(resolve(author,'author-input-snapshot-manifest.actual.json'))
const snapshots=new Map<string,string>(snapshot.inputs.map((x:any)=>[x.path,x.snapshotPath]))
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const before=read(resolve(root,snapshots.get(canonical)!)),after=read(resolve(author,'candidate/canonical.476-split-author.json'))
const old='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
const children=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
const beforeGoals=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),afterGoals=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
assert.equal(before.goals.length,474);assert.equal(after.goals.length,476)
for(const goal of before.goals)if(goal.id!==old)assert.deepEqual(afterGoals.get(goal.id),goal)
const oldGoal=beforeGoals.get(old),newCluster=afterGoals.get(old)
assert.deepEqual({...newCluster,type:oldGoal.type,contains:oldGoal.contains,weight:oldGoal.weight},oldGoal)
assert.deepEqual(newCluster.contains,children);assert.equal(newCluster.weight,2);assert.equal(newCluster.type,'cluster')
for(const id of children){const g=afterGoals.get(id);assert.deepEqual(g.requires,oldGoal.requires);assert.deepEqual(g.applicability,oldGoal.applicability);assert.deepEqual(g.tags,oldGoal.tags);assert.equal(g.sourceRef,oldGoal.sourceRef);assert.equal(g.extendedData.provenance.sourceGoalId,oldGoal.extendedData.provenance.sourceGoalId);assert.deepEqual(g.contains,[]);assert.equal(g.weight,1)}
const ledger=read(resolve(root,snapshots.get('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')!))
// Review partition used for comparison. No changed/new authoritative ledger is
// fabricated, written or supplied to the publication compiler.
const oldAtomic=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
assert.equal(oldAtomic.size,391)
const expectedAtomic=new Set(oldAtomic);expectedAtomic.delete(old);for(const id of children)expectedAtomic.add(id)
assert.equal(expectedAtomic.size,392)
const proposals=read(resolve(author,'scope-preserving-view-reference-proposals.author.json'))
const candidateByPath=new Map<string,string>(proposals.proposals.map((p:any)=>[p.activePath,p.candidatePath]))
assert.equal(candidateByPath.size,21)
const pointer=(o:any,p:string)=>p.split('/').slice(1).reduce((v,k)=>v[k.replace(/~1/g,'/').replace(/~0/g,'~')],o)
for(const proposal of proposals.proposals){
  const b=read(resolve(root,snapshots.get(proposal.activePath)!)),a=read(resolve(root,proposal.candidatePath)),copy=structuredClone(b)
  for(const c of proposal.changes){assert.deepEqual(pointer(copy,c.jsonPointer),c.before);assert.equal(c.before.kind,'goalEntry');assert.equal(c.before.goalId,old);assert.deepEqual({...c.after,kind:c.before.kind},c.before);pointer(copy,c.jsonPointer).kind='canonicalSubtree'}
  assert.deepEqual(copy,a)
}
const nb=normalizeCanonicalLandscape(before),na=normalizeCanonicalLandscape(after),scopeRows=[]
const paths=[...snapshots.keys()].filter(p=>p.endsWith('.view.json'));assert.equal(paths.length,31)
for(const path of paths){
 const b=normalizeCompositionView(read(resolve(root,snapshots.get(path)!))),a=normalizeCompositionView(read(resolve(root,candidateByPath.get(path)||snapshots.get(path)!)))
 const bc=compileCompositionView(b,nb),ac=compileCompositionView(a,na)
 assert.deepEqual(bc.findings.filter((f:any)=>f.severity==='error'),[]);assert.deepEqual(ac.findings.filter((f:any)=>f.severity==='error'),[])
 assert.deepEqual(b.scope,a.scope)
 const bp=collectCompositionProjectionRoleGoalIds(b.rootNodes,beforeGoals),ap=collectCompositionProjectionRoleGoalIds(a.rootNodes,afterGoals)
 const ba=[...bp.targetGoalIds].filter(id=>oldAtomic.has(id)).sort(),aa=[...ap.targetGoalIds].filter(id=>expectedAtomic.has(id)).sort()
 const expected=ba.filter(id=>id!==old);if(ba.includes(old))expected.push(...children);expected.sort();assert.deepEqual(aa,expected)
 assert.deepEqual([...ap.prerequisiteOnlyGoalIds].sort(),[...bp.prerequisiteOnlyGoalIds].sort())
 scopeRows.push({path,scope:b.scope,originalAtomicTargets:ba.length,proposedAtomicTargets:aa.length,delta:aa.length-ba.length,
  oldScopeContainedOriginalGoal:ba.includes(old),newChildIds:children.filter(id=>aa.includes(id)),allOtherAtomicTargetIdsExact:true,
  prerequisiteOnlyExact:true,rewrittenOpaqueEntry:candidateByPath.has(path),actualNativeAuthoringErrors:0})
}
const errors=validateCanonicalLandscape(na).filter((r:any)=>r.severity==='error');assert.deepEqual(errors,[])
const graphs=[]
for(const field of ['contains','requires']){const visiting=new Set<string>(),visited=new Set<string>();const visit=(id:string)=>{assert.ok(!visiting.has(id),field+' cycle '+id);if(visited.has(id))return;visiting.add(id);for(const next of afterGoals.get(id)[field]||[]){assert.ok(afterGoals.has(next));visit(next)}visiting.delete(id);visited.add(id)};for(const id of afterGoals.keys())visit(id);graphs.push({field,nodes:visited.size,cycles:0,missingReferences:0})}
assert.equal(scopeRows.filter(r=>r.delta===1).length,23);assert.equal(scopeRows.filter(r=>r.delta===0).length,8)
const requiresConsumer=beforeGoals.get('4b7fdc2c-9dbe-5439-8d84-295abc240eec');assert.deepEqual(afterGoals.get(requiresConsumer.id),requiresConsumer)
const containsParent=beforeGoals.get('a13a7d2b-a11b-5d34-b29e-88cf786ca983');assert.deepEqual(afterGoals.get(containsParent.id),containsParent)
writeFileSync(resolve(own,'split31-scopes-and-DAG.actual-native-authoring.independent-b.receipt.json'),JSON.stringify({
 artifactKind:'actual-independent-B-composition-authoring-scope-DAG-check-no-publication-compiler',recordedAt:new Date().toISOString(),
 nativeApis:['normalizeCompositionView','compileCompositionView','collectCompositionProjectionRoleGoalIds','validateCanonicalLandscape'],
 originalFrozenAuthorBaseline:'174/391 stale inactive author baseline; active rebase mandatory',views:scopeRows,rewrittenViews:21,viewCount:31,
 scopeDeltaPlusOne:23,scopeDeltaZero:8,graphs,allOther473WholeGoalBodiesExact:true,parentStableIdExact:old,requiresConsumerWholeBodyExact:true,containsParentWholeBodyExact:true,
 scientificPartitionSource:'two-child-whole-source-P-class-AM-scientific-first.independent-b.verdict.json',
 newAuthoritativeSemanticLedgerWritten:false,native392BookCompilerCalled:false,newD_P_VBindingApproval:false,
 widerNationalOriginalPrimarySourceApproval:false,currentActiveBaselineOrStrictReportRecomputed:false,activeWrites:0,strictGainClaimed:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log('Actual native authoring scope/DAG check:31 views,21 exact goalEntry-to-subtree replacements,23 exact+1 target scopes/8 unchanged;473 other whole goals exact,contains/requires acyclic. No native392 publication,D/P/V or national-primary-source approval.')
