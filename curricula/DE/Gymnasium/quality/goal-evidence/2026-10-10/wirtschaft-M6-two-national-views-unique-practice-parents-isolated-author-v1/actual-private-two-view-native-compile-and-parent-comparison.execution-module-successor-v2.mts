import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT='/home/enpasos/projects/skillpilot'
const OUT=path.dirname(fileURLToPath(import.meta.url))
const config=JSON.parse(fs.readFileSync(path.join(OUT,'private-two-view-native-capsule-and-whole-input-frame.AUTHOR.json'),'utf8'))
const CAP=config.capsule
const [{compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds},{normalizeCanonicalLandscape},{convertLearningGoal},{goalMatchesFilter},{applyCompositionViewProjection}, native]=await Promise.all([
 import(path.join(CAP,'app/src/utils/authoring/compositionViewAuthoring.ts')),
 import(path.join(CAP,'app/src/utils/authoring/canonicalAuthoring.ts')),
 import(path.join(CAP,'app/src/goalTypes.ts')),
 import(path.join(CAP,'app/src/utils/goalFilters.ts')),
 import(path.join(CAP,'app/src/utils/compositionViewRuntime.ts')),
 import(path.join(CAP,'app/scripts/validateCompositionViews.readonly-scoped-native-exports.ts')),
])
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const stable=(x:any):string=>JSON.stringify(Array.isArray(x)?x.map(v=>JSON.parse(stable(v))):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,JSON.parse(stable(x[k]))])):x)
const sorted=(x:Set<string>|string[])=>[...x].sort()
const assert=(v:boolean,m:string)=>{if(!v)throw Error(m)}
const write=(name:string,obj:any)=>{
 const p=path.join(OUT,name);fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n',{flag:'wx'})
 return {path:path.relative(ROOT,p),sha256:sha(p),bytes:fs.statSync(p).size}
}
const raw=read(config.canonicalInput), ledger=read(config.semanticKindsInput)
const kinds=new Map(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const landscape=normalizeCanonicalLandscape({...raw,goals:raw.goals.map((g:any)=>({...g,semanticKind:kinds.get(g.id)}))})
const goalById=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const uiGoals=raw.goals.map((g:any)=>convertLearningGoal({...g,semanticKind:kinds.get(g.id)},{landscapeId:raw.landscapeId}))
const uiById=new Map(uiGoals.map((g:any)=>[g.id,g]))
const rootGoals=new Map([[raw.landscapeId,raw.goals.find((g:any)=>(g.tags??[]).includes('root'))?.id]]) as Map<string,string>
const entries=[{meta:raw,goals:uiGoals}]
const compiledRows=(roots:any[])=>{
 const rows:any[]=[]
 const visit=(n:any,parts:string[],labels:string[],parent:any)=>{
  if(n.sourceGoalId)rows.push({goalId:n.sourceGoalId,wholeLabel:n.label,parentKey:parent?.sourceGoalId??parent?.runtimeId??null,parentLabel:parent?.label??null,wholePath:[...parts,n.runtimeId],wholeLabelPath:[...labels,n.label]})
  for(const child of n.children)visit(child,[...parts,n.runtimeId],[...labels,n.label],n)
 }
 for(const n of roots)visit(n,[],[],null)
 return rows
}
const nativeCompile=(view:any)=>{
 const v=normalizeCompositionView(view)
 const r=compileCompositionView(v,landscape,landscape,new Map([[landscape.landscapeId,landscape]]))
 // These are precisely the extra generic checks in validateCompositionViews.ts.
 // Mathematics-only conditions are false for both Economics scopes.
 const findings=[...r.findings,...native.collectGenericTreeFindings(r.compiledRootNodes),...native.collectDuplicateDirectPhaseStructureFindings(r.compiledRootNodes),...native.collectLearnerFacingCompositionLabelFindings(r.compiledRootNodes)]
 return {compiledRootNodes:r.compiledRootNodes,rows:compiledRows(r.compiledRootNodes),findings}
}
const outputs:any[]=[];const findingsByFrame:any[]=[]
for(const item of config.views){
 const before=read(path.join(ROOT,item.wholeBefore.path)),after=read(path.join(ROOT,item.wholeAfter.path))
 const b=nativeCompile(before),a=nativeCompile(after)
 const bRole=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(before).rootNodes,goalById,rootGoals)
 const aRole=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(after).rootNodes,goalById,rootGoals)
 assert(stable(sorted(bRole.targetGoalIds))===stable(sorted(aRole.targetGoalIds)),'target role loss')
 assert(stable(sorted(bRole.prerequisiteOnlyGoalIds))===stable(sorted(aRole.prerequisiteOnlyGoalIds)),'support role loss')
 assert(stable(sorted(new Set(b.rows.map((x:any)=>x.goalId))))===stable(sorted(new Set(a.rows.map((x:any)=>x.goalId)))),'compiled canonical goal loss')
 const beforeErrors=b.findings.filter((f:any)=>f.severity==='error'),afterErrors=a.findings.filter((f:any)=>f.severity==='error')
 assert(beforeErrors.length===item.removedDuplicateDirectReferences*2,'baseline does not match complete original stdout')
 assert(beforeErrors.every((f:any)=>['CPV-005','CPV-006'].includes(f.code)),'other baseline failure')
 assert(afterErrors.length===0,'after native view errors')
 const parentRows=[...new Set(b.rows.map((x:any)=>x.goalId))].sort().map(gid=>({
  goalId:gid,semanticKind:kinds.get(gid),wholeBeforeOccurrences:b.rows.filter((x:any)=>x.goalId===gid),wholeAfterOccurrences:a.rows.filter((x:any)=>x.goalId===gid),
 }))
 assert(parentRows.every(r=>r.wholeAfterOccurrences.length===1),'remaining duplicate visible canonical goal')
 const oldProjection=applyCompositionViewProjection(entries,before)[0]
 const newProjection=applyCompositionViewProjection(entries,after)[0]
 const oldUI=new Map(oldProjection.goals.map((g:any)=>[g.id,g])),newUI=new Map(newProjection.goals.map((g:any)=>[g.id,g]))
 const stableSemantics=['id','description','phase','area','level','core','requires','applicability','examData','sourceRef','effectiveRequires','inheritedRequires','nodeKind','type']
 for(const gid of goalById.keys()){
  const old=oldUI.get(gid) as any,cur=newUI.get(gid) as any
  assert(!!old&&!!cur,'source goal missing in runtime projection')
  for(const field of stableSemantics)assert(stable(old[field]??null)===stable(cur[field]??null),'runtime semantic mismatch '+gid+'/'+field)
 }
 const filteredLanes:any[]=[]
 for(const course of ['GK','LK']){
  const ids=sorted(bRole.targetGoalIds).filter(gid=>goalMatchesFilter(uiById.get(gid) as any,course))
  const now=sorted(aRole.targetGoalIds).filter(gid=>goalMatchesFilter(uiById.get(gid) as any,course))
  assert(stable(ids)===stable(now),'native course filter mismatch')
  const levelPhaseRows=ids.map(gid=>({goalId:gid,phase:(uiById.get(gid) as any).phase,level:(uiById.get(gid) as any).level,applicability:(uiById.get(gid) as any).applicability??null,semanticKind:kinds.get(gid)}))
  filteredLanes.push({courseProfile:course,wholeNativeCourseEligibleTargetIDs:ids,wholePhaseLevelScopeRows:levelPhaseRows,
   wholeCurricularAtomicIDs:ids.filter(gid=>kinds.get(gid)==='curricularAtomic'),wholeMemoryIDs:ids.filter(gid=>kinds.get(gid)==='memory'),wholeOrientationIDs:ids.filter(gid=>kinds.get(gid)==='orientation'),wholePracticeIDs:ids.filter(gid=>kinds.get(gid)==='practiceAssessment')})
 }
 const removed=read(path.join(OUT,'actual195-duplicate-practice-placements-empty-folders-and-unique-parent-choice.AUTHOR.json')).whole195RemovalReasons.find((r:any)=>r.courseProfile===item.courseProfile)
 const neg=structuredClone(after)
 neg.rootNodes[0].children.push(structuredClone(removed.wholeRemovedDirectPlacement))
 const n=nativeCompile(neg);const nErrors=n.findings.filter((f:any)=>f.severity==='error')
 assert(nErrors.length===2&&nErrors.every((f:any)=>['CPV-005','CPV-006'].includes(f.code)&&f.goalId===removed.goalId),'genuine duplicated placement negative not detected')
 const lane=write(`actual-national-${item.courseProfile.toLowerCase()}-whole-native-parents-role-course-phase-level-before-after.AUTHOR.json`,{
  nativeWholeSourcePrefix:config.nativeValidatorSource,
  originalView:item.wholeBefore,candidateView:item.wholeAfter,
  wholeRawTargetIDsExact:sorted(bRole.targetGoalIds),wholePrerequisiteOnlyIDsExact:sorted(bRole.prerequisiteOnlyGoalIds),
  wholeCompiledRowParentComparison:parentRows,wholeCourseAndPhaseLevelLanes:filteredLanes,
  runtimeSourceGoalsAllRetained:raw.goals.length,runtimeSemanticFieldsExact:stableSemantics,
  wholeBeforeNative:b,wholeAfterNative:a,wholeGenuineDuplicateReinsertNegative:n,
  ownAuthorChecksOnly:true,independentScienceOrScopeApproval:false,
 })
 outputs.push(lane)
 findingsByFrame.push({courseProfile:item.courseProfile,beforeErrors:beforeErrors.length,afterErrors:afterErrors.length,negativeErrors:nErrors.length,beforeWarnings:b.findings.filter((f:any)=>f.severity==='warning').length,afterWarnings:a.findings.filter((f:any)=>f.severity==='warning').length,targetIDs:bRole.targetGoalIds.size,supportIDs:bRole.prerequisiteOnlyGoalIds.size,compiledSourceGoals:a.rows.length,runtimeSourceGoals:raw.goals.length})
}
const endguards=config.wholeInputEndguards.map((b:any)=>({...b,actualCurrentSha256:sha(path.join(ROOT,b.path))}))
assert(endguards.every((b:any)=>b.sha256===b.actualCurrentSha256),'source inputs changed during author checks')
const guards=write('actual-whole35-active-view-CAN-SEM-registry-source-before-after-byte-endguards.AUTHOR.json',{wholeEndguards:endguards,allExact:true,sourceMapsUpdated:0,goalProfileOrRegistryWrites:0,activeWrites:0})
const result=write('actual-two-national-views-only-native-validator-positive-and-two-genuine-duplicate-negatives.AUTHOR.json',{nativeValidatorPrefixAndInstrumentalExportsOnly:config.helper,exactTwoEconomicsViewsOnly:true,noFull335Run:true,frames:findingsByFrame,wholeOutputs:outputs,endguards:guards,authorCandidatePendingForeignQualification:true,reviewRecordsCreated:0})
console.log(JSON.stringify({result,frames:findingsByFrame,activeWrites:0,reviewRecords:0}))
