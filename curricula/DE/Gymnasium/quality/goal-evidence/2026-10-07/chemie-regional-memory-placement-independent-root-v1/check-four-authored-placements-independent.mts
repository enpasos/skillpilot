// Apache-2.0. Independent readonly verification of four authored data views.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const root=process.cwd()
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-regional-memory-placement-independent-root-v1'
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-regional-all-required-memory-placement-author-v3'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const raw=read(author+'/raw-four-real-regional-memory-reference-placement-review-input.author-candidate.json')
assert.equal(sha(raw.currentCanonical.path),'4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6')
const canon=read(raw.currentCanonical.path)
const {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const {applyCompositionViewProjection}=await import(pathToFileURL(resolve(root,'app/src/utils/compositionViewRuntime.ts')).href)
const {convertLearningGoal}=await import(pathToFileURL(resolve(root,'app/src/goalTypes.ts')).href)
const goalMap=new Map(canon.goals.map((g:any)=>[g.id,g]))
const memoryRecords=readFileSync(resolve(root,raw.originalFullReviewLedgerPath),'utf8').trim().split('\n').map(JSON.parse)
assert.equal(memoryRecords.length,378)
const required=memoryRecords.filter((r:any)=>r.status==='memory_required')
assert.equal(required.length,54)
const findings:any[]=[]
for(const spec of raw.fourViewCandidatePlans){
 assert.equal(sha(spec.futureActiveViewPath),spec.originalSHA256)
 assert.equal(sha(spec.candidateViewPath),spec.candidateSHA256)
 const old=read(spec.futureActiveViewPath),next=read(spec.candidateViewPath)
 assert.equal(old.rootNodes.length,1)
 const {children:oldChildren,...oldRoot}=old.rootNodes[0],{children:nextChildren,...nextRoot}=next.rootNodes[0]
 assert.deepEqual(oldRoot,nextRoot)
 assert.equal(nextChildren.length,oldChildren.length+1)
 assert.deepEqual(nextChildren.slice(0,-1),oldChildren)
 const oldR=structuredClone(old),newR=structuredClone(next);oldR.rootNodes[0].children=[];newR.rootNodes[0].children=[]
 assert.deepEqual(oldR,newR)
 const beforeRoles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(old).rootNodes,goalMap as any)
 const afterRoles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(next).rootNodes,goalMap as any)
 const before=new Set<string>(beforeRoles.targetGoalIds),after=new Set<string>(afterRoles.targetGoalIds)
 const visibleRequired=required.filter((r:any)=>before.has(r.goalId))
 const needed=[...new Set<string>(visibleRequired.flatMap((r:any)=>r.memoryGoalIds))].sort()
 const branch=nextChildren.at(-1)
 assert.equal(branch.kind,'structure');assert.equal(branch.label,'Lernkarten zur Chemie')
 assert.deepEqual(branch.children,needed.map(goalId=>({kind:'goalEntry',goalId})))
 assert.equal(needed.length,6)
 for(const id of before)assert.ok(after.has(id))
 assert.deepEqual([...after].filter(id=>!before.has(id)).sort(),needed)
 assert.ok(needed.every(id=>(goalMap.get(id) as any).nodeKind==='memory'))
 for(const view of [old,next]){
  const normalized=normalizeCompositionView(view),compiled=compileCompositionView(normalized,canon)
  assert.deepEqual(compiled.findings,[])
  const input={meta:canon,goals:canon.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:canon.landscapeId}))}
  const projected=applyCompositionViewProjection([input] as any,view)[0]
  const runtime=new Map(projected.goals.map((g:any)=>[g.id,g])),seen=new Set<string>()
  const walk=(id:string)=>{if(seen.has(id))return;seen.add(id);for(const ch of (runtime.get(id) as any)?.contains??[])walk(ch)}
  projected.goals.filter((g:any)=>g.tags?.includes('root')).forEach((g:any)=>walk(g.id))
  const roles=collectCompositionProjectionRoleGoalIds(normalized.rootNodes,goalMap as any)
  for(const id of roles.targetGoalIds)assert.ok(seen.has(id),id)
  if(view===next)for(const r of visibleRequired)for(const ref of r.memoryGoalIds)assert.ok(seen.has(ref),ref)
 }
 const missingBefore=visibleRequired.filter((r:any)=>r.memoryGoalIds.some((ref:string)=>!before.has(ref)))
 assert.equal(missingBefore.length,old.scope.courseProfile==='GK'?30:32)
 findings.push({viewPath:spec.futureActiveViewPath,scope:old.scope,oldTargets:before.size,newTargets:after.size,allOldTargetsAndSourceBackedBranchPreserved:true,neededExistingMemoryGoalIds:needed,requiredCurrentTargets:visibleRequired.map((r:any)=>({goalId:r.goalId,memoryGoalIds:r.memoryGoalIds})),missingPairsBefore:missingBefore.length,missingPairsAfter:0,realRuntimeReachability:'PASS'})
}
const config=read(author+'/full378-memory.current-text-scope-only.future-active-config.author-candidate.json')
const original=read(raw.originalMemoryConfigPath)
assert.deepEqual({...config,visibilityScopes:original.visibilityScopes},original)
assert.deepEqual(config.visibilityScopes.slice(0,3),original.visibilityScopes)
for(const scope of config.visibilityScopes.slice(3))scope.viewPath=raw.fourViewCandidatePlans.find((p:any)=>p.futureActiveViewPath===scope.viewPath).candidateViewPath
// This own check explicitly refers to inert candidates, not active green views.
config.reportPath=own+'/inert-scoped-native-memory-report.md'
writeFileSync(resolve(root,own,'inert-current-text-seven-real-scopes.native-check.config.json'),JSON.stringify(config,null,2)+'\n')
const result={schemaVersion:1,documentType:'independent actual regional memory data-placement verdict',reviewedAtUTC:new Date().toISOString(),decision:'KEEP_FOUR_EXISTING_MEMORY_PLACEMENTS',rows:findings,actualMissingBefore:findings.reduce((s,r)=>s+r.missingPairsBefore,0),actualMissingAfter:0,normalSourceTargetsAddedOrRemoved:0,newMemoryContent:0,activeWrites:0,humanApproval:false,fullAppAcceptance:false,strictNetGain:0}
writeFileSync(resolve(root,own,'independent-four-views-real-runtime-and-exact-data-deltas.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({verdict:result.decision,views:4,missingBefore:result.actualMissingBefore,missingAfter:0,activeWrites:0}))
