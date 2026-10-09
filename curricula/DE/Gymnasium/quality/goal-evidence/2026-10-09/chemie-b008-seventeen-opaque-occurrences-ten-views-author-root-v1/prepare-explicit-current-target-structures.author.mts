// SPDX-License-Identifier: Apache-2.0
// Author a real structural candidate; no source, course, or independent approval.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const root=resolve('.'), out=dirname(fileURLToPath(import.meta.url))
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
const author=base+'/chemie-b008-current-twenty-six-native-preparation-author-v1'
const bindings=new Map<string,any>()
const bind=(p:string)=>{const b=readFileSync(resolve(root,p));const r={path:relative(root,resolve(root,p)),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length};bindings.set(r.path,r);return r}
const verify=(ref:any)=>{const r=bind(ref.path);assert.equal(r.sha256,'sha256:'+ref.sha256.replace(/^sha256:/,''));if(ref.bytes!==undefined)assert.equal(r.bytes,ref.bytes);return ref.path}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(resolve(root,p),'utf8'))}
const write=(name:string,value:any)=>{const p=resolve(out,name);assert.ok(!existsSync(p),p);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(value,null,2)+'\n');return bind(p)}
const diagnosticPath=base+'/chemie-b008-source-atlas-rest-twenty-neutral-planning-a-v1/actual-current395-source-scope-and-rest20.read-only-diagnosis.json'
const diagnosis=read(diagnosticPath)
const canonicalPath=author+'/source-view-remediation-author-v3/canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json'
const canonical=read(canonicalPath)
const ledger=read(author+'/candidate/semantic-kinds.current504.technical-review-input.json')
const kinds=new Map(ledger.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]))
const atoms=new Set<string>(ledger.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').map((r:any)=>r.goalId))
assert.equal(atoms.size,395)
const classified=normalizeCanonicalLandscape({...canonical,goals:canonical.goals.map((g:any)=>({...g,semanticKind:kinds.get(g.id)}))})
const normalizedGoals=new Map(classified.goals.map((g:any)=>[g.id,g]))
const errors=diagnosis.actual17OpaqueViewErrors
assert.equal(errors.length,17)
const viewIds=[...new Set<string>(errors.map((r:any)=>r.viewId))]
assert.equal(viewIds.length,10)
const sourceInputs=diagnosis.actualBindingMetadata.map((r:any)=>{
 const mapping=read(verify(r.mapping)),extraction=read(verify(r.sourceExtraction))
 assert.equal(mapping.targetLandscapeId,canonical.landscapeId)
 return {mapping,extraction,mappingBinding:r.mapping,extractionBinding:r.sourceExtraction}
})
const sorted=(set:Set<string>)=>[...set].sort()
const descendants=(id:string):Set<string>=>{const found=new Set<string>(),pending=[id];while(pending.length){const next=pending.pop()!;if(found.has(next))continue;found.add(next);pending.push(...(goals.get(next)?.contains??[]))}return found}
const rows:any[]=[]
for(const viewId of viewIds){
 const affected=errors.filter((r:any)=>r.viewId===viewId)
 const old=read(verify(affected[0].viewBinding))
 const fresh=structuredClone(old)
 assert.equal(old.rootNodes.length,1);assert.equal(old.rootNodes[0].kind,'structure')
 const oldChildren=old.rootNodes[0].children
 assert.ok(oldChildren.every((r:any)=>r.kind==='goalEntry'))
 const affectedIds=new Set<string>(affected.map((r:any)=>r.goalId))
 const relocation=new Map<string,{clusterId:string,node:any}>()
 const structures=new Map<string,any>()
 const roleLists=collectCompositionProjectionRoleGoalIds(old.rootNodes,normalizedGoals)
 for(const clusterId of affectedIds){
  assert.equal(kinds.get(clusterId),'curricularArea')
  const cluster=goals.get(clusterId)
  const branch=descendants(clusterId)
  const present=oldChildren.filter((r:any)=>r.goalId!==clusterId&&!affectedIds.has(r.goalId)&&branch.has(r.goalId))
  assert.ok(present.length>0,`${viewId}/${clusterId}: no existing visible member to preserve`)
  for(const node of present){assert.ok(!relocation.has(node.goalId));relocation.set(node.goalId,{clusterId,node})}
  const original=oldChildren.find((r:any)=>r.goalId===clusterId)
  assert.ok(original);assert.notEqual(original.projectionRole,'prerequisiteOnly')
  structures.set(clusterId,{kind:'structure',id:`${viewId}-explicit-current-${clusterId}`,label:cluster.title,children:present})
 }
 fresh.rootNodes[0].children=oldChildren.flatMap((node:any)=>structures.has(node.goalId)?[structures.get(node.goalId)]:relocation.has(node.goalId)?[]:[node])
 const beforeRoles=roleLists,afterRoles=collectCompositionProjectionRoleGoalIds(fresh.rootNodes,normalizedGoals)
 const beforeAtoms=sorted(new Set([...beforeRoles.targetGoalIds].filter(id=>atoms.has(id))))
 const afterAtoms=sorted(new Set([...afterRoles.targetGoalIds].filter(id=>atoms.has(id))))
 assert.deepEqual(afterAtoms,beforeAtoms)
 assert.deepEqual(sorted(afterRoles.prerequisiteOnlyGoalIds),sorted(beforeRoles.prerequisiteOnlyGoalIds))
 const removedNonAtomic=sorted(new Set([...beforeRoles.targetGoalIds].filter(id=>!afterRoles.targetGoalIds.has(id))))
 assert.deepEqual(removedNonAtomic,sorted(affectedIds))
 const before=compileCompositionView(old,classified)
 const after=compileCompositionView(fresh,classified)
 assert.deepEqual(before.findings.filter((f:any)=>f.severity==='error'),affected.map((r:any)=>{const {viewId,viewBinding,scope,...finding}=r;return finding}))
 assert.deepEqual(after.findings.filter((f:any)=>f.severity==='error'),[])
 const sources=sourceInputs.filter(r=>r.extraction.jurisdiction===old.scope.jurisdiction)
 const sourceContexts=[...affectedIds].map(clusterId=>({clusterId,wholeCluster:goals.get(clusterId),
  alreadyVisibleRelocatedWholeChildren:structures.get(clusterId).children.map((n:any)=>({wholeGoal:goals.get(n.goalId),originalGoalReference:n})),
  notAddedAbsentCanonicalChildren:(goals.get(clusterId).contains??[]).filter((id:string)=>!structures.get(clusterId).children.some((n:any)=>n.goalId===id)),
  wholeUnfilteredIncomingOriginalSourceRows:sources.flatMap(r=>r.mapping.decisions.filter((d:any)=>d.decision==='mapped'&&d.canonicalGoalIds.some((id:string)=>id.replace(canonical.landscapeId+':','')===clusterId)).map((d:any)=>{
   const sourceGoal=r.extraction.sourceGoals.find((g:any)=>g.id===d.sourceGoalId)
   assert.ok(sourceGoal)
   const passage=r.extraction.passages.find((p:any)=>p.id===sourceGoal.passageId)
   return {mapping:r.mappingBinding,sourceExtraction:r.extractionBinding,wholeSourceGoal:sourceGoal,wholePassage:passage,
    wholeDecision:d,allOriginalCanonicalPartnerIds:d.canonicalGoalIds,
    wholeSourceDocument:r.extraction.sourceDocument??null,wholeSourceDocuments:r.extraction.sourceDocuments??null,
    actualScopeMustBeIndependentlyMatched:true,unfilteredCandidateContextIsNotAWholeSourceClaim:true}
  }))}))
 const candidate=write(`views/${viewId}.explicit-existing-targets.author-candidate.json`,fresh)
 rows.push({viewId,scope:old.scope,originalView:bind(affected[0].viewBinding.path),candidateView:candidate,
  originalOpaqueFindings:before.findings.filter((f:any)=>f.severity==='error'),normalCandidateErrors:after.findings.filter((f:any)=>f.severity==='error'),
  beforeAtomicTargetIds:beforeAtoms,afterAtomicTargetIds:afterAtoms,
  targetAtomicUniverseExact:true,prerequisiteOnlyUniverseExact:true,
  nonAtomicOpaqueReferenceIdsReplacedWithExplicitStructures:removedNonAtomic,
  wholeSourceAndPartnerContexts:sourceContexts,
  authorDecision:'CANDIDATE_ONLY_TWO_INDEPENDENT_TARGETED_SOURCE_SCOPE_REVIEWS_REQUIRED',
  wholeCourseSourceAtlasAndNativeApproval:false})
}
const proof=write('ten-whole-views-seventeen-real-structures-and-source-contexts.author-candidate.actual.json',{
 schemaVersion:1,role:'Actual author candidate: explicit structure over existing visible canonical references; no new goals or implied source coverage',
 createdAt:new Date().toISOString(),wholeCanonical:bind(canonicalPath),actualOriginalDiagnostic:bind(diagnosticPath),
 authoritativeCurrentCandidateAtomicGoalCount:395,opaqueOccurrences:17,distinctAffectedViews:10,
 actualInputBindings:[...bindings.values()],rows,
 fullCurrentAtomicTargetSetsUnchanged:true,noNewCanonicalSubtreeExpansion:true,noMandatorySourceDutyDropped:true,
 normativeSourceCoverageNotGrantedByTechnicalCompiler:true,originalFourClustersAndAllChildrenUnchanged:true,
 allOriginalInputsPreserved:true,independentReviewerDecisions:[],
 wholeSourceApproval:false,wholeCourseApproval:false,nativeApproval:false,
 humanApproval:false,humanTrial:false,newM7Closures:0,restoredM7Bindings:0,netStrictGain:0,activeWrites:[]})
const entry=write('neutral-ten-views-seventeen-opaque-structures.author-independent-review.entry.json',{
 schemaVersion:1,role:'Neutral whole source/context author handoff for two independent targeted structural reviews',
 wholeViewAndSourceCandidate:proof,actualCurrentCanonical:bind(canonicalPath),
 originalDiagnosis:bind(diagnosticPath),candidateViews:rows.map(r=>r.candidateView),
 affectedClusters:[...new Set(errors.map((r:any)=>r.goalId))],opaqueOccurrences:17,distinctAffectedViews:10,
 currentCandidateAtomicUniverse:395,technicalCompilerErrors:0,
 authorCandidateNotIndependentApproval:true,wholeSourceApproval:false,wholeCourseApproval:false,nativeApproval:false,
 humanApproval:false,humanTrial:false,netStrictGain:0,activeWrites:[]})
const freeze=write('ten-views-seventeen-opaque-structures.author.first.freeze.json',{
 schemaVersion:1,sealedAt:new Date().toISOString(),role:'Immutable author first with actual structural changes and whole source context',entry,proof,
 candidateViews:rows.map(r=>r.candidateView),script:bind(fileURLToPath(import.meta.url)),originalBindingsUnchanged:true})
console.log(JSON.stringify({entry,firstFreeze:freeze,affectedViews:10,opaqueOccurrences:17,normalCompilerErrors:0,independentApproval:false,netStrictGain:0}))
