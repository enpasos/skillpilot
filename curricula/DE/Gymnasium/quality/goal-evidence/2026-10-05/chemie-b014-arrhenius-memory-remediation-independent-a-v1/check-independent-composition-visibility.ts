import { readFileSync, writeFileSync } from 'node:fs'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'

const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1'
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-candidate-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const originId='28bb9d15-f865-5843-a035-6066580fea64', memoryId='417e65ec-68be-5f2e-9452-c3ba9b1d362f', prerequisiteId='d2ccd1d5-56f7-583f-9724-e97441367f91'
const baselineRaw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
const originalRaw=read(`${author}/canonical-with-one-memory-goal.inactive.candidate.json`)
const correctedRaw=read(`${own}/canonical-with-one-memory-goal.reviewed.inactive.candidate.json`)
const baseline=normalizeCanonicalLandscape(baselineRaw),original=normalizeCanonicalLandscape(originalRaw),corrected=normalizeCanonicalLandscape(correctedRaw)
const candidateRows:any[]=[]
const filteredRows:any[]=[]
const prereqRows:any[]=[]
const compiledPaths:any[]=[]
for (const [label,raw,canonical] of [['original',originalRaw,original],['corrected',correctedRaw,corrected]] as const) {
 const runtime=prepareLandscapeEntries([raw])[0]
 const runtimeGoals=new Map(runtime.goals.map(g=>[g.id,g]))
 const goals=new Map(canonical.goals.map(g=>[g.id,g]))
 const origin=runtimeGoals.get(originId)!, memory=runtimeGoals.get(memoryId)!
 const jurisdictions=origin.applicability?.jurisdiction ?? []
 for(const viewId of ['de-de-gym-chemistry-gk','de-de-gym-chemistry-lk','de-de-gym-seki-chemistry']) {
  const viewPath=`curricula/DE/Gymnasium/composition-views/chemie/${viewId}.view.json`
  const view=normalizeCompositionView(read(viewPath)),result=compileCompositionView(view,canonical)
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,goals)
  const oldRoles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(baseline.goals.map(g=>[g.id,g])))
  const removed=[...oldRoles.targetGoalIds].filter(id=>!roles.targetGoalIds.has(id))
  const added=[...roles.targetGoalIds].filter(id=>!oldRoles.targetGoalIds.has(id))
  const paths:any[]=[]
  const visit=(node:any,ancestors:string[])=>{
   const path=[...ancestors,node.sourceGoalId??node.label]
   if(node.sourceGoalId===originId || node.sourceGoalId===memoryId)paths.push({goalId:node.sourceGoalId,path,runtimeId:node.runtimeId})
   node.children.forEach((child:any)=>visit(child,path))
  }
  result.compiledRootNodes.forEach(node=>visit(node,[]))
  compiledPaths.push({candidate:label,viewPath,originOccurrences:paths.filter(p=>p.goalId===originId).length,memoryOccurrences:paths.filter(p=>p.goalId===memoryId).length,paths})
  candidateRows.push({candidate:label,viewPath,compileErrors:result.findings.filter(f=>f.severity==='error'),compileWarnings:result.findings.filter(f=>f.severity==='warning'),originTarget:roles.targetGoalIds.has(originId),memoryTarget:roles.targetGoalIds.has(memoryId),removedTargetIds:removed,addedTargetIds:added})
  const course=viewId.endsWith('-gk')?'GK':viewId.endsWith('-lk')?'LK':null
  if(!course)continue
  for(const jurisdiction of jurisdictions) {
   const filters=[course,jurisdiction]
   const originVisible=roles.targetGoalIds.has(originId)&&goalMatchesFilters(origin,filters)
   const memoryVisible=roles.targetGoalIds.has(memoryId)&&goalMatchesFilters(memory,filters)
   const prerequisites=(memory.effectiveRequires??memory.requires).map(id=>runtimeGoals.get(id)).filter(Boolean)
   const missingPrereqs=(memory.effectiveRequires??memory.requires).filter(id=>!runtimeGoals.has(id))
   const hiddenPrereqs=prerequisites.filter(g=>!roles.targetGoalIds.has(g!.id)||!goalMatchesFilters(g!,filters)).map(g=>g!.id)
   filteredRows.push({candidate:label,viewPath,courseProfile:course,jurisdiction,originVisible,memoryVisible,status:!originVisible||memoryVisible?'PASS':'HOLD_M-SCOPE-03'})
   prereqRows.push({candidate:label,courseProfile:course,jurisdiction,memoryEffectiveRequires:memory.effectiveRequires,missingPrereqs,hiddenPrereqs,status:missingPrereqs.length||hiddenPrereqs.length?'HOLD':'PASS'})
  }
 }
}
const runtime=prepareLandscapeEntries([correctedRaw])[0]
const runtimeGoals=new Map(runtime.goals.map(g=>[g.id,g]))
const ids=new Set(correctedRaw.goals.map((g:any)=>g.id));const dangling:any[]=[];const cycles:any[]=[]
for(const kind of ['contains','requires','effectiveRequires']) {
 const graph=kind==='effectiveRequires'?runtimeGoals:new Map(correctedRaw.goals.map((g:any)=>[g.id,g]))
 const done=new Set<string>(),active=new Set<string>()
 const visit=(id:string,path:string[])=>{
  if(active.has(id)){cycles.push({kind,path:[...path,id]});return}
  if(done.has(id))return
  active.add(id)
  for(const child of (graph.get(id) as any)?.[kind]??[]){if(!ids.has(child)){dangling.push({kind,from:id,to:child});continue}visit(child,[...path,id])}
  active.delete(id);done.add(id)
 }
 for(const id of ids)visit(String(id),[])
}
const correctedRows=filteredRows.filter(r=>r.candidate==='corrected')
const originalHolds=filteredRows.filter(r=>r.candidate==='original'&&r.status!=='PASS')
const correctedNative=candidateRows.filter(r=>r.candidate==='corrected')
const nativeErrors=validateCanonicalLandscape(corrected).filter((f:any)=>f.severity==='error')
const prerequisitesCorrected=prereqRows.filter(r=>r.candidate==='corrected')
const passed=correctedRows.length===32&&correctedRows.every(r=>r.status==='PASS')&&originalHolds.length===30&&correctedNative.every(r=>r.compileErrors.length===0&&r.removedTargetIds.length===0&&r.addedTargetIds.every((id:string)=>id===memoryId))&&prerequisitesCorrected.every(r=>r.status==='PASS')&&!cycles.length&&!dangling.length&&!nativeErrors.length
const receipt={status:passed?'PASS_independent_corrected_candidate':'HOLD',authority:'ai_candidate_independent_S_A_M_review',actualCompiler:'compileCompositionView + collectCompositionProjectionRoleGoalIds; actual goalMatchesFilters jurisdiction/course filtering; prepareLandscapeEntries effective prerequisite inheritance',candidateRows,compiledPaths,filteredRows,prereqRows,originalFilteredHOLDCount:originalHolds.length,correctedFilteredPASSCount:correctedRows.filter(r=>r.status==='PASS').length,canonicalDiagnosticErrors:nativeErrors,danglingEdges:dangling,cycles,sourceBreadth:'HOLD: no all-region source coverage or HE salt coverage claim',strictNetDelta:0,activeWrites:0,humanApproval:false,D2:false,P:false,V:false}
writeFileSync(`${own}/actual-composition-filtered-visibility-and-prerequisites.receipt.json`,JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({status:receipt.status,originalFilteredHOLDCount:originalHolds.length,correctedFilteredPASSCount:receipt.correctedFilteredPASSCount,nativeErrors:nativeErrors.length,cycles:cycles.length,dangling:dangling.length,correctedPrerequisitePASSCount:prerequisitesCorrected.filter(r=>r.status==='PASS').length}))
if(!passed)process.exitCode=1
