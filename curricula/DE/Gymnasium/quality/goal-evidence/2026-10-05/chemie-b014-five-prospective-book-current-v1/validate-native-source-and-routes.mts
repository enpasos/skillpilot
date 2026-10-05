import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import {goalMatchesFilters} from '../../../../../../../app/src/utils/goalFilters'
import {prepareLandscapeEntries} from '../../../../../../../app/src/hooks/useLandscapes'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-five-prospective-book-current-v1',iso=resolve(root,'tmp/chemie-b014-five-native-isolated-20261005-v1')
const read=(base:string,path:string):any=>JSON.parse(readFileSync(resolve(base,path),'utf8'))
const sha=(base:string,path:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(base,path))).digest('hex')
const write=(name:string,v:any)=>writeFileSync(resolve(root,own,name),JSON.stringify(v,null,2)+'\n')
const ids=read(root,own+'/batch.config.json').goalIds as string[],set=new Set(ids)
const cfg='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',before=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(cfg,root),root),after=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(cfg,iso),iso)
const prior=before.receipt as any,next=after.receipt as any
const changedSources=new Set(read(root,own+'/two-he-source-clause-before-after.candidate.json').rows.map((r:any)=>r.sourceGoalId))
const sourceContexts:any[]=[]
for(const side of [{label:'before',base:root,receipt:prior},{label:'after',base:iso,receipt:next}]){
 const seen=new Set<string>()
 for(const scope of side.receipt.scopes)for(const w of scope.witnesses){
  if(!['/HE/','/BY/','/HB/'].some(s=>w.sourceExtractionPath.includes(s))||(!set.has(w.goalId)&&!changedSources.has(w.sourceGoalId)))continue
  const key=w.sourceExtractionPath+'|'+w.sourceGoalId
  if(seen.has(key))continue;seen.add(key)
  const extraction=read(side.base,w.sourceExtractionPath),source=extraction.sourceGoals.find((g:any)=>g.id===w.sourceGoalId)
  if(!source)throw new Error('Actual current source goal absent '+w.sourceGoalId)
  sourceContexts.push({side:side.label,sourceGoalId:source.id,sourceExtractionPath:w.sourceExtractionPath,sourceExtractionSha256:sha(side.base,w.sourceExtractionPath),sourceGoal:source,mappingPath:w.mappingPath,mappings:read(side.base,w.mappingPath).mappings.filter((m:any)=>m.legacyGoalId===w.sourceGoalId),componentPreservationLimit:'Actual current normative group and all mapped component carriers are retained. A routing match does not approve another unclosed companion.'})
 }
}
for(const context of sourceContexts.filter(x=>x.side==='before')){
 const current=sourceContexts.find(x=>x.side==='after'&&x.sourceGoalId===context.sourceGoalId&&x.sourceExtractionPath===context.sourceExtractionPath)
 if(!current||current.sourceExtractionSha256!==context.sourceExtractionSha256||JSON.stringify(current.sourceGoal)!==JSON.stringify(context.sourceGoal))throw new Error('Source bytes or components lost '+context.sourceGoalId)
 if(!changedSources.has(context.sourceGoalId)&&JSON.stringify(current.mappings)!==JSON.stringify(context.mappings))throw new Error('Unplanned source component change '+context.sourceGoalId)
}
const raw=read(iso,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),original=read(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'),landscape=normalizeCanonicalLandscape(raw),current=normalizeCanonicalLandscape(original),map=new Map(landscape.goals.map(g=>[g.id,g]))
const diagnostic=validateCanonicalLandscape(landscape)
if(diagnostic.some(d=>d.severity==='error'))throw new Error('Invalid native canonical contains DAG')
const runtime=new Map(prepareLandscapeEntries([raw])[0].goals.map(g=>[g.id,g])),oldRuntime=new Map(prepareLandscapeEntries([original])[0].goals.map(g=>[g.id,g]))
const missing:any[]=[],cycles:any[]=[]
for(const kind of ['requires','contains']){
 const done=new Set<string>(),active=new Set<string>()
 const visit=(id:string,path:string[])=>{if(active.has(id)){cycles.push({kind,path:[...path,id]});return};if(done.has(id))return;active.add(id);for(const child of (map.get(id) as any)[kind]??[]){if(!map.has(child)){missing.push({kind,from:id,to:child});continue};visit(child,[...path,id])};active.delete(id);done.add(id)}
 for(const id of map.keys())visit(id,[])
}
if(missing.length||cycles.length)throw new Error('Actual required/contains graph invalid')
const contexts:any[]=[]
for(const name of ['de-de-gym-chemistry-gk','de-de-gym-chemistry-lk','de-de-gym-seki-chemistry','de-he-gk','de-he-lk']){
 const path=`curricula/DE/Gymnasium/composition-views/chemie/${name}.view.json`,view=normalizeCompositionView(read(root,path)),compiled=compileCompositionView(view,landscape),oldCompiled=compileCompositionView(view,current)
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,map),oldRoles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(current.goals.map(g=>[g.id,g])))
 if(JSON.stringify([...roles.targetGoalIds].sort())!==JSON.stringify([...oldRoles.targetGoalIds].sort()))throw new Error('Unplanned view target scope change')
 for(const jurisdiction of ['DE-HE','DE-BY','DE-HB']){
  const course=name.endsWith('-gk')?'GK':name.endsWith('-lk')?'LK':null,filters=course?[course,jurisdiction]:[jurisdiction]
  const rows=ids.map(id=>({goalId:id,targetReference:roles.targetGoalIds.has(id),beforeVisible:oldRoles.targetGoalIds.has(id)&&goalMatchesFilters(oldRuntime.get(id)!,filters),afterVisible:roles.targetGoalIds.has(id)&&goalMatchesFilters(runtime.get(id)!,filters)}))
  if(rows.some(x=>x.beforeVisible&&!x.afterVisible))throw new Error('Existing actual source/profile view lost')
  contexts.push({viewPath:path,jurisdiction,course,compiledRootNodeCounts:[oldCompiled.compiledRootNodes.length,compiled.compiledRootNodes.length],rows})
 }
}
const sourceScopes=next.scopes.map((s:any)=>({...s,goalIds:s.goalIds.filter((id:string)=>set.has(id)),witnesses:s.witnesses.filter((w:any)=>set.has(w.goalId))})).filter((s:any)=>s.goalIds.length)
write('native-source-component-preservation-and-views.actual.receipt.json',{status:'PASS_bounded_current_source_components_and_actual_view_routes',sourceContexts,sourceScopes,affectedHEClauses:[...changedSources],allOtherCurrentHEBYHBSourceGroupComponentsUnchanged:true,actualViewContexts:contexts,all468OtherCanonicalGoalsUnchanged:original.goals.filter((g:any)=>!set.has(g.id)).every((g:any)=>JSON.stringify(g)===JSON.stringify(raw.goals.find((r:any)=>r.id===g.id))),nativeContainsDiagnostic:diagnostic,separateRequiresAndContainsMissingEdges:missing,separateRequiresAndContainsCycles:cycles,prospectiveSourceAtlasCounts:next.counts??after.manifest,sourceAtlasPublicationScopeRemainsExisting358NotBase376:true,threeUnresolvedCompanionPackagesNotAdopted:true,strictNetDelta:0,humanApproval:false,activeWrites:0})
console.log(JSON.stringify({status:'PASS_source_components_and_native_routes',exactHEBYHBContexts:sourceContexts.length,actualViewContexts:contexts.length,fullGoalCount:raw.goals.length,atomicBaseExpected:376,missingEdges:missing.length,cycles:cycles.length,activeWrites:0}))
