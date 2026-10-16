// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const T='tmp/chemie-m7-resumed-20261016',O=`${T}/eight-empty-compiled-source-independent-b-v1`,A=`${T}/eight-empty-compiled-source-author-candidate-v1`,P=`${T}/eight-empty-compiled-source-next-author-preparation-v1`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const stable=(x:any):any=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x
const fp=(x:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(stable(x))).digest('hex')
const save=(n:string,x:any)=>writeFileSync(`${O}/${n}`,JSON.stringify(x,null,2)+'\n',{flag:'wx'})
const first=`${O}/FIRST.source8-v1.actual-independent-b.science.json`;assert.equal(sha(first),'sha256:a35cf72bc24cbfcbd287453d00f880256ab9d1daa1e70e5fd73580e3eb5abc19')
const sp=`${A}/OUTPUTS.concrete-source8-author-candidate.selector.json`;assert.equal(sha(sp),'sha256:7f6b93ea3f2d2c4f828dbd7b4b681fc4273eb1fefc6f15d104267a2b647a172e')
const selector=read(sp),cas=read(selector.guardedCAS.path),cells=read(selector.nineExactWholeCellPairs.path).cells,plan=read(`${P}/PLAN.eight-existing-ordinary-source-and-scope-author-only.json`)
const K=resolve(`${T}/chemie-combined639-two-GK-priors-final-review-capsule-v1`)
assert.equal(sha(cas.baselineCanonical.path),selector.baselineCanonicalSHA256)
const l=read(cas.baselineCanonical.path),by=new Map<string,any>(l.goals.map((g:any)=>[g.id,g]))
const eight=plan.exactOrdinaryScope.map((r:any)=>{assert.equal(fp(by.get(r.goalId)),r.wholeCurrentFingerprint);return {goalId:r.goalId,currentWholeFingerprint:r.wholeCurrentFingerprint,unchanged:true}})
const {collectCompositionProjectionRoleGoalIds:roles,compileCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const {convertLearningGoal}=await import(`${K}/app/src/goalTypes.ts`)
const {goalMatchesFilters}=await import(`${K}/app/src/utils/goalFilters.ts`)
const selectedIds=new Set<string>(cells.map((c:any)=>c.sourceGoalId)),sourceChecks=[],mappingChecks=[],viewChecks=[]
const stripEntries=(x:any,ids:Set<string>):any=>Array.isArray(x)?x.filter(n=>!(n?.kind==='goalEntry'&&ids.has(n.goalId)&&n.projectionRole==='target')).map(n=>stripEntries(n,ids)):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,stripEntries(v,ids)])):x
for(const op of cas.fileOperations){
 assert.equal(sha(op.before.path),op.before.sha256);assert.equal(sha(op.after.path),op.after.sha256)
 const b=read(op.before.path),a=read(op.after.path)
 if(op.logicalPath.includes('/mapping/')){
  const associated=cells.flatMap((c:any)=>c.mappingArrays.filter((m:any)=>m.logicalPath===op.logicalPath).map((m:any)=>({c,m})));assert.ok(associated.length)
  const selectedHere=new Set(associated.map((x:any)=>x.c.sourceGoalId))
  for(const {c,m} of associated){
   assert.deepEqual(b.mappings.filter((x:any)=>x.legacyGoalId===c.sourceGoalId),m.beforeWholeSelectedMappingArray)
   assert.deepEqual(a.mappings.filter((x:any)=>x.legacyGoalId===c.sourceGoalId),m.afterWholeSelectedMappingArray)
   assert.deepEqual((b.decisions??[]).filter((x:any)=>x.sourceGoalId===c.sourceGoalId),m.beforeWholeSelectedDecisionArray)
   assert.deepEqual((a.decisions??[]).filter((x:any)=>x.sourceGoalId===c.sourceGoalId),m.afterWholeSelectedDecisionArray)
   assert.ok(m.afterWholeSelectedMappingArray.every((x:any)=>x.matchType==='partial'||c.sourceCase==='NW'&&x.canonicalGoalId==='b7ae47da-6afa-5651-977a-3139af7d6eab'&&x.matchType==='exact'))
   assert.ok(m.afterWholeSelectedDecisionArray.every((x:any)=>x.authorOnly===true&&x.decision==='pending_independent_review'&&x.wholeSourceUnionApproved===false))
  }
  assert.deepEqual(b.mappings.filter((x:any)=>!selectedHere.has(x.legacyGoalId)),a.mappings.filter((x:any)=>!selectedHere.has(x.legacyGoalId)))
  assert.deepEqual((b.decisions??[]).filter((x:any)=>!selectedHere.has(x.sourceGoalId)),(a.decisions??[]).filter((x:any)=>!selectedHere.has(x.sourceGoalId)))
  assert.equal(a.source8AuthorCandidate?.newIndependentVotes,0);assert.equal(a.source8AuthorCandidate?.wholeSourceApproval,false)
  mappingChecks.push({logicalPath:op.logicalPath,selectedCellIds:[...selectedHere],allUnrelatedWholeMappingAndDecisionRowsExact:true,noFabricatedVotes:true})
 }else if(op.logicalPath.includes('/source-extraction/')){
  assert.deepEqual(b.sourceGoals.filter((g:any)=>!selectedIds.has(g.id)),a.sourceGoals.filter((g:any)=>!selectedIds.has(g.id)))
  const relevant=cells.filter((c:any)=>c.logicalSourcePath===op.logicalPath)
  for(const c of relevant){assert.deepEqual(b.sourceGoals.find((g:any)=>g.id===c.sourceGoalId)??null,c.beforeWholeSourceCell);assert.deepEqual(a.sourceGoals.find((g:any)=>g.id===c.sourceGoalId),c.afterWholeSourceCell)}
  const pids=new Set(relevant.flatMap((c:any)=>c.afterWholeDedicatedPassages.map((p:any)=>p.id)))
  assert.deepEqual((b.passages??[]).filter((p:any)=>!pids.has(p.id)),(a.passages??[]).filter((p:any)=>!pids.has(p.id)))
  sourceChecks.push({logicalPath:op.logicalPath,selectedCellIds:relevant.map((c:any)=>c.sourceGoalId),allOtherWholeSourceCellsAndPassagesExact:true})
 }else if(op.logicalPath.includes('/composition-views/')){
  const pv=plan.scopeCASPlan.find((p:any)=>p.viewPath.endsWith(op.logicalPath));assert.ok(pv)
  const ids=new Set<string>(pv.appendOnlyExistingTargetEntries.map((g:any)=>g.goalId))
  assert.deepEqual(stripEntries(a,ids),b)
  const br=roles(b.rootNodes,by),ar=roles(a.rootNodes,by),target=(r:any)=>new Set<string>([...r.targetGoalIds].filter((id:any)=>by.has(id)&&goalMatchesFilters(convertLearningGoal(by.get(id),{landscapeId:l.landscapeId}),[a.scope.courseProfile])))
  const bt=target(br),at=target(ar);assert.deepEqual([...at].filter(id=>!bt.has(id)).sort(),[...ids].sort());assert.deepEqual([...bt].filter(id=>!at.has(id)),[])
  assert.deepEqual([...br.prerequisiteOnlyGoalIds].sort(),[...ar.prerequisiteOnlyGoalIds].sort())
  assert.deepEqual(compileCompositionView(a,l).findings.filter((f:any)=>f.severity==='error'),[])
  viewChecks.push({logicalPath:op.logicalPath,scope:a.scope,addedExistingTargetIds:[...ids],allOtherWholeNodesAndFieldsExact:true,otherTargetsExact:true,supportRolesExact:true,stockCompilerErrors:0,sourceApplicabilityNotGloballyRecompiled:true,scientificHHPlacementFindingRemains:op.logicalPath.includes('/de-hh-')})
 }else assert.fail(op.logicalPath)
}
assert.equal(mappingChecks.length,18);assert.equal(sourceChecks.length,2);assert.equal(viewChecks.length,10);assert.equal(viewChecks.reduce((s:number,r:any)=>s+r.addedExistingTargetIds.length,0),12)
assert.equal(sha(cas.baselineCanonical.path),'sha256:62f13c6ae943186ddcb60ae4af1b075c6bd6ad3c48ac766d21cc583cac6c1746')
save('CHECK.source8-v1.actual-finite-thirty-files-and-ten-views.independent-b.json',{role:'Own actual finite read-only mechanical check after scientificFIRST; no global compiler or science inferred from PASS',scienceFIRST:{path:first,sha256:sha(first)},selector:{path:sp,sha256:sha(sp)},canonicalSHA256:sha(cas.baselineCanonical.path),eightWholeOrdinary:eight,sourceChecks,mappingChecks,viewChecks,counts:{wholeFiles:30,mappingFiles:18,sourceFiles:2,views:10,sourceCells:9,existingOrdinaryTargetPlacements:12,newCanonicalOrdinary:0,newIndependentAuthorVotes:0},source9BoundedScienceVoteOnly:true,HHActiveSourceAndTwoChapterPathsStillREVISE:true,allOldOrdinaryDAndPUnmodified:true,globalAPVOrDPOrMRun:false,HumanApproval:false,HumanTrial:false,M7Claim:false,authorWrites:false,normalWrites:false})
console.log(JSON.stringify({files:30,mappings:18,sourceFiles:2,views:10,placements:12,wholeOrdinaryExact:8,stockViewErrors:0,scientificV1Decision:'REVISE'}))
