import {readFileSync,writeFileSync} from 'node:fs'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters'
import {prepareLandscapeEntries} from '../../../../../../../app/src/hooks/useLandscapes'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
const read=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const ids=new Set<string>(read(`${own}/exact-current-companion-reuse-and-placement-witnesses.json`).rows.map((r:any)=>r.goalId))
const configPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const result=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(configPath,process.cwd()),process.cwd())
const receipt=result.receipt as any
const scopes=receipt.scopes.map((s:any)=>({...s,goalIds:s.goalIds.filter((id:string)=>ids.has(id)),witnesses:s.witnesses.filter((w:any)=>ids.has(w.goalId))})).filter((s:any)=>s.goalIds.length)
const contexts=new Map<string,any>()
for(const s of scopes)for(const w of s.witnesses){
 if(!['/HE/','/BY/','/HB/'].some(t=>w.sourceExtractionPath.includes(t)))continue
 const key=`${w.sourceExtractionPath}|${w.sourceGoalId}`
 if(contexts.has(key))continue
 const ex=read(w.sourceExtractionPath),source=ex.sourceGoals.find((g:any)=>g.id===w.sourceGoalId)
 contexts.set(key,{sourceExtractionPath:w.sourceExtractionPath,sourceLandscapeId:ex.sourceLandscapeId,sourceGoal:source,
  mappingPath:w.mappingPath,mappings:read(w.mappingPath).mappings.filter((m:any)=>m.legacyGoalId===w.sourceGoalId&&ids.has(m.canonicalGoalId)),
  scope:'Exact current routing witness, not new complete normative approval'})
}
writeFileSync(`${own}/actual-native-companion-source-scope-witnesses.json`,JSON.stringify({observedAt:new Date().toISOString(),status:'inactive_current_routing_witness',inputBindings:receipt.inputBindings,scopes,contexts:[...contexts.values()],noSourceMappingMutation:true},null,2)+'\n')
const raw=read(`${own}/eight-full-runtime.validation-snapshot.json`),landscape=normalizeCanonicalLandscape(raw)
const map=new Map(landscape.goals.map(g=>[g.id,g]))
const runtimeMap=new Map(prepareLandscapeEntries([raw])[0].goals.map(g=>[g.id,g]))
const targetIds=read(`${own}/eight-complete-text-source-prerequisite-deltas.json`).rows.map((r:any)=>r.goalId)
const plans=read(`${own}/three-complete-companion-text-prerequisite-placement-deltas.json`).rows
const rows:any[]=[]
for(const name of ['de-de-gym-chemistry-gk','de-de-gym-chemistry-lk','de-de-gym-seki-chemistry','de-he-gk','de-he-lk']){
 const path=`curricula/DE/Gymnasium/composition-views/chemie/${name}.view.json`
 const view=normalizeCompositionView(read(path)),compiled=compileCompositionView(view,landscape)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,map)
 const compiledPaths:any[]=[]
 const walk=(node:any,ancestors:string[])=>{const current=[...ancestors,node.sourceGoalId??node.label];if(ids.has(node.sourceGoalId)||targetIds.includes(node.sourceGoalId))compiledPaths.push({goalId:node.sourceGoalId,path:current});node.children.forEach((c:any)=>walk(c,current))}
 compiled.compiledRootNodes.forEach(n=>walk(n,[]))
 for(const jurisdiction of ['DE-HE','DE-BY','DE-HB']){
  const course=name.endsWith('-gk')?'GK':name.endsWith('-lk')?'LK':null
  const filters=course?[course,jurisdiction]:[jurisdiction]
  const goals=[...new Set<string>([...targetIds,...ids])].map(goalId=>({goalId,targetReference:roles.targetGoalIds.has(goalId),matchesActualFilters:goalMatchesFilters(runtimeMap.get(goalId)!,filters),actualVisible:roles.targetGoalIds.has(goalId)&&goalMatchesFilters(runtimeMap.get(goalId)!,filters),compiledPaths:compiledPaths.filter(p=>p.goalId===goalId)}))
  rows.push({viewPath:path,jurisdiction,courseProfile:course,goals,companionProspectiveMetadataOnly:plans.map((p:any)=>({goalId:p.goalId,beforeMatchesActualFilters:goalMatchesFilters(runtimeMap.get(p.goalId)!,filters),proposedMetadataMatchesActualFilters:goalMatchesFilters(p.after,filters),limit:'Full proposed earlier source/profile application not approved by a filter result; additional regional bindings and actual complete source/operator checks required.'}))})
 }
}
writeFileSync(`${own}/actual-filtered-visible-goals-and-compiled-paths.receipt.json`,JSON.stringify({observedAt:new Date().toISOString(),status:'inactive_exact_visibility_diagnostic',actualCompiler:'compileCompositionView + collectCompositionProjectionRoleGoalIds + prepareLandscapeEntries + goalMatchesFilters',rows,sourceProfileTagChangesRemainConditional:true,noActiveMutation:true},null,2)+'\n')
console.log(JSON.stringify({reuseGoalIds:ids.size,currentRoutingScopes:scopes.length,exactHEBYHBSourceContexts:contexts.size,actualFilteredViewContexts:rows.length}))
