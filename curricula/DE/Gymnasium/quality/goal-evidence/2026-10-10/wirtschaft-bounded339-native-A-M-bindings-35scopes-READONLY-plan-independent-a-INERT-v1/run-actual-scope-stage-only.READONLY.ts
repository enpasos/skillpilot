import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes'
import {goalMatchesGlobalStageScope} from '../../../../../../../app/src/utils/personalCurriculumStageScope'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters'
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime'

// Scope-only orchestration: imports no A/M CLI and calls no native fingerprint.
// No source/compiler/card/ledger/config mutation occurs. SourceScopev3 is an
// incomplete historical candidate, not the forthcoming stable source composite.
const out=dirname(fileURLToPath(import.meta.url))
const root=resolve(out,'../../../../../../..')
const q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const land='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const reg=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const subject=reg.subjects.find((x:any)=>x.subject==='wirtschaftswissenschaften')
const mconfig=read(subject.memoryReviewConfigPath)
const oldM=readFileSync(resolve(root,mconfig.reviewPath),'utf8').trim().split(/\r?\n/).map(l=>JSON.parse(l))
const five=read(q+'wirtschaft-five-semantic-successor-memory-decisions-three-cards-AUTHOR-INERT-root-v1/five-goal-memory-decisions.no-native-fingerprints.AUTHOR-INERT.json').decisions
const focalIds=five.map((x:any)=>x.goalId)
const specs=[
  {label:'actual-current679-READONLY-baseline',canonical:subject.landscapePath,views:'curricula/DE/Gymnasium/composition-views/wirtschaft',useCandidateDecisions:false},
  {label:'sealed-INCOMPLETE-SourceScopev3-681-DRAFT-only',canonical:q+'wirtschaft-1826-source-scope-and-native34views-AUTHOR-INERT-v3/canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',views:q+'wirtschaft-1826-source-scope-and-native34views-AUTHOR-INERT-v3/view-candidates',useCandidateDecisions:true},
]
function flattened(nodes:any[]):string[]{return nodes.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...flattened(n.children??[])])}
const reports=[]
for(const spec of specs){
  const raw=read(spec.canonical),canonical=normalizeCanonicalLandscape(raw)
  const index=buildCanonicalGraphIndex(canonical)
  const ui=raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:land}))
  const uiById=new Map(ui.map((g:any)=>[g.id,g]))
  const decisions=new Map(oldM.map((m:any)=>[m.goalId,m]))
  if(spec.useCandidateDecisions)five.forEach((m:any)=>{if(index.goalById.has(m.goalId))decisions.set(m.goalId,m)})
  const views=[]
  for(const name of readdirSync(resolve(root,spec.views)).filter(n=>n.endsWith('.view.json')).sort()){
    const path=spec.views+'/'+name,view=normalizeCompositionView(read(path))
    const compilation=compileCompositionView(view,canonical)
    const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,index.goalById)
    const compiledIds=flattened(compilation.compiledRootNodes)
    const projected=applyCompositionViewProjection([{meta:{landscapeId:land,title:raw.title,subject:raw.subject},goals:ui} as any],read(path))[0]
    const projectedById=new Map(projected.goals.map((g:any)=>[g.id,g]))
    const stageConfig:any={[land]:{selected:true,stage:view.scope.stage}}
    const filters=[view.scope.courseProfile,view.scope.jurisdiction,view.scope.durationModel].filter(Boolean) as string[]
    const stagePass=(id:string)=>goalMatchesGlobalStageScope(uiById.get(id) as any,stageConfig,{landscapeId:land,rootLandscapeId:land})
    const fullPass=(id:string)=>stagePass(id)&&goalMatchesFilters(uiById.get(id) as any,filters)
    const afterStage=new Set([...roles.targetGoalIds].filter(stagePass))
    const afterFull=new Set([...roles.targetGoalIds].filter(fullPass))
    const requiredBefore=[...roles.targetGoalIds].filter(id=>decisions.get(id)?.status==='memory_required')
    const requiredAfterStage=requiredBefore.filter(id=>afterStage.has(id))
    const requiredAfterFull=requiredBefore.filter(id=>afterFull.has(id))
    const missingMemory=(goalIds:string[],visible:Set<string>)=>goalIds.flatMap(id=>{
      const m=decisions.get(id)
      const visibleMemory=(m?.memoryGoalIds??[]).filter((memoryId:string)=>visible.has(memoryId))
      return visibleMemory.length?[]:[{goalId:id,memoryGoalIds:m?.memoryGoalIds??[],deckIds:m?.deckIds??[]}]
    })
    const focal=focalIds.map((id:string)=>({goalId:id,presentInThisCanonical:index.goalById.has(id),role:roles.targetGoalIds.has(id)?'target':roles.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent',passesNativeStage:uiById.has(id)?stagePass(id):null,passesNativeScopeFilters:uiById.has(id)?fullPass(id):null,memoryDecision:decisions.get(id)?.status??null,referencedMemoryGoalIds:decisions.get(id)?.memoryGoalIds??[],visibleReferencedMemoryGoalIds:(decisions.get(id)?.memoryGoalIds??[]).filter((x:string)=>afterFull.has(x))}))
    views.push({name,path,scope:view.scope,filters,compileErrors:compilation.findings.filter((f:any)=>f.severity==='error'),duplicateCompiledSourceIds:compiledIds.filter((x,i)=>compiledIds.indexOf(x)!==i),nativeRoleTargetCount:roles.targetGoalIds.size,nativeCompiledVisibleCount:compiledIds.length,afterNativeStageTargetCount:afterStage.size,afterNativeStageAndCountryCourseDurationTargetCount:afterFull.size,memoryRequiredBeforeStage:requiredBefore,memoryRequiredAfterNativeStage:requiredAfterStage,memoryRequiredAfterNativeStageAndScopeFilters:requiredAfterFull,missingReferencedMemoryBeforeStage:missingMemory(requiredBefore,roles.targetGoalIds),missingReferencedMemoryAfterNativeStage:missingMemory(requiredAfterStage,afterStage),missingReferencedMemoryAfterNativeStageAndScopeFilters:missingMemory(requiredAfterFull,afterFull),focalFive:focal,runtimeProjectionRetainsPrerequisiteOnlyIds:[...roles.prerequisiteOnlyGoalIds].filter(id=>projectedById.has(id)),runtimeProjectionMissingPrerequisiteOnlyIds:[...roles.prerequisiteOnlyGoalIds].filter(id=>!projectedById.has(id)),isNativeMPrivateVisibilityHelperRun:false,isNativeAorMFingerprintRun:false})
  }
  reports.push({...spec,canonicalGoalCount:raw.goals.length,viewCount:views.length,views,interpretation:'Actual native role/compiler/runtime/stage/filter calls only. Does not execute private M collector or prove stable final source/scope integration; historical v3 is explicitly INCOMPLETE.'})
}
const report={createdAt:new Date().toISOString(),reviewAuthority:'ai_candidate',status:'READONLY_DRAFT_SCOPE_OBSERVATIONS',activeWrites:0,nativeGoalFingerprintsComputed:0,nativeCardFingerprintsComputed:0,reports}
writeFileSync(resolve(out,'actual-current-and-INCOMPLETE-v3-35-native-scopes-stage-memory-subsets.READONLY.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(reports.map(r=>({label:r.label,views:r.views.length,compileErrors:r.views.flatMap(v=>v.compileErrors).length,sekI:r.views.filter(v=>v.scope.stage==='SekI').map(v=>({name:v.name,unfiltered:v.nativeRoleTargetCount,afterStage:v.afterNativeStageTargetCount,memoryRequiredBeforeStage:v.memoryRequiredBeforeStage.length,memoryRequiredAfterStage:v.memoryRequiredAfterNativeStage.length,missingMemoryAfterStage:v.missingReferencedMemoryAfterNativeStage.length,focalFive:v.focalFive}))})),null,2))
