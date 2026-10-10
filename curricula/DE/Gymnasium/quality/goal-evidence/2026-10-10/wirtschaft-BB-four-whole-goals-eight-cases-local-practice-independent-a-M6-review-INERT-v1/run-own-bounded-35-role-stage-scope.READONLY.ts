import {readFileSync,writeFileSync,readdirSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {normalizeCanonicalLandscape,buildCanonicalGraphIndex} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes'
import {goalMatchesGlobalStageScope} from '../../../../../../../app/src/utils/personalCurriculumStageScope'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters'
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime'

const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..')
const author=resolve(out,'../wirtschaft-BB-LK-three-market-facets-eight-cases-local-practice-AUTHOR-INERT-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const raw=read(resolve(author,'canonical-candidate/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))
const canonical=normalizeCanonicalLandscape(raw),index=buildCanonicalGraphIndex(canonical)
const land='605bdaf6-32d5-56fd-8d92-5a80c2fd2901'
const ui=raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:land})),uiById=new Map(ui.map((g:any)=>[g.id,g]))
const goals=read(resolve(author,'four-whole-ordinary-goals-three-mandatory-one-optional.AUTHOR-INERT.json')).goals
const practice=read(resolve(author,'whole-local-BB-LK-practice-DEEN-material-answer-rubric.AUTHOR-INERT.json'))
const focalIds=[...goals.map((g:any)=>g.id),practice.id]
const report=[]
function flatten(nodes:any[]):string[]{return nodes.flatMap(n=>[...(n.sourceGoalId?[n.sourceGoalId]:[]),...flatten(n.children??[])])}
for(const name of readdirSync(resolve(author,'view-candidates')).filter(n=>n.endsWith('.view.json')).sort()){
 const path=resolve(author,'view-candidates',name),view=normalizeCompositionView(read(path))
 const compiled=compileCompositionView(view,canonical)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,index.goalById),visible=flatten(compiled.compiledRootNodes)
 const projected=applyCompositionViewProjection([{meta:{landscapeId:land,title:raw.title,subject:raw.subject},goals:ui} as any],read(path))[0]
 const projectedById=new Map(projected.goals.map((g:any)=>[g.id,g]))
 const stage:any={[land]:{selected:true,stage:view.scope.stage}}
 const filters=[view.scope.courseProfile,view.scope.jurisdiction,view.scope.durationModel].filter(Boolean) as string[]
 const pass=(id:string)=>goalMatchesGlobalStageScope(uiById.get(id) as any,stage,{landscapeId:land,rootLandscapeId:land})&&goalMatchesFilters(uiById.get(id) as any,filters)
 report.push({path:path.slice(root.length+1),scope:view.scope,compileErrors:compiled.findings.filter((f:any)=>f.severity==='error'),duplicateVisibleIds:visible.filter((id,i)=>visible.indexOf(id)!==i),focal:focalIds.map(id=>({goalId:id,authoredRole:roles.targetGoalIds.has(id)?'target':roles.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent',compiledVisible:visible.includes(id),passesNativeStageAndScope:pass(id),runtimeRetained:projectedById.has(id),runtimeRole:(projectedById.get(id) as any)?.extendedData?.compositionProjectionRole??null})),allFocalPrerequisitesPresent:focalIds.every(id=>(index.goalById.get(id)?.requires??[]).every((r:string)=>index.goalById.has(r)))})
}
const errors=report.flatMap(r=>r.compileErrors),duplicates=report.flatMap(r=>r.duplicateVisibleIds)
const unexpectedTargets=report.flatMap(r=>r.focal.filter(f=>f.authoredRole==='target'&&!(r.scope.jurisdiction==='DE-BB'&&r.scope.courseProfile==='LK')).map(f=>({path:r.path,goalId:f.goalId})))
const results={createdAt:new Date().toISOString(),role:'ACTUAL_INDEPENDENT_BOUNDED_NATIVE_SCOPE_CALLS',canonicalGoalCount:raw.goals.length,viewCount:report.length,compileErrors:errors.length,duplicateVisibleIds:duplicates.length,unexpectedFourGoalOrPracticeTargetsOutsideBBLK:unexpectedTargets,views:report,nativeAorMFingerprintsComputed:0,nativeMPrivateCollectorExecuted:false,activeWrites:0,wholeLandscapeSourceApproval:false,interpretation:'Only the four new goals and local practice were inspected across all 35 authored views. LK steering remains deliberately selected. This technical observation does not approve national or optional curriculum obligations, the final integrated M6 ledger, or unchanged goals.'}
writeFileSync(resolve(out,'actual-own-bounded-35-role-stage-scope.READONLY.json'),JSON.stringify(results,null,2)+'\n')
console.log(JSON.stringify({views:report.length,compileErrors:errors.length,duplicates:duplicates.length,unexpectedTargets,BBLK:report.filter(r=>r.scope.jurisdiction==='DE-BB'&&r.scope.courseProfile==='LK').map(r=>r.focal),SekI:report.filter(r=>r.scope.stage==='SekI').map(r=>r.focal)},null,2))
if(errors.length||duplicates.length||unexpectedTargets.length)process.exitCode=1
