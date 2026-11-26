// SPDX-License-Identifier: Apache-2.0
// Run from repository root with --baseline=<Task M baseline.actual.json.gz>.
// The baseline is external immutable Task M evidence; only compact comparisons are saved.
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {resolve,relative} from 'node:path'
import {createHash} from 'node:crypto'
import {gunzipSync} from 'node:zlib'
import {pathToFileURL} from 'node:url'
const dynamic=(p:string)=>import(pathToFileURL(resolve(process.cwd(),p)).href)
const {createRouteProfiles,evaluateRouteProfile,buildEffectiveRequiresEdges,collectRenderedAtomicGoalIdsFromCompositionView,collectWholeMaterialPrerequisiteClosure}=await dynamic('app/scripts/generateCurriculumQualityStatus.ts')
const {buildApplicabilityCompilation}=await dynamic('app/scripts/applicabilityCompiler.ts')
const {buildRouteCatalogContext,restrictForeignRouteSupport}=await dynamic('app/scripts/lib/routeCatalogContext.ts')
const {restrictCompositionStageRouteSupport}=await dynamic('app/scripts/lib/compositionStageRouteMembership.ts')
const {validateHardDirectAtomicRoutes}=await dynamic('app/scripts/lib/hardLearningRouteValidation.ts')
const {deriveSemanticRouteProfiles}=await dynamic('app/scripts/lib/semanticRouteInventory.ts')
const {normalizeCompositionView,collectCompositionProjectionRoleGoalIds}=await dynamic('app/src/utils/authoring/compositionViewAuthoring.ts')
const {loadOptionalHistoricalReviewContext}=await dynamic('app/scripts/optionalHistoricalReviewContext.ts')
const {parseSemanticKindLedger}=await dynamic('app/scripts/goalBookModel.ts')
const root=resolve(process.cwd()), out=resolve(root,'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/routes')
const load=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const phys='7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const catalogDir='curricula/DE/Gymnasium/canonical', viewDir=process.argv.find(a=>a.startsWith('--views-dir='))?.slice('--views-dir='.length)??'curricula/DE/Gymnasium/composition-views/physik'
const paths=readdirSync(resolve(root,catalogDir)).filter(n=>n.endsWith('.json')).sort().map(n=>`${catalogDir}/${n}`)
const catalog=paths.map(load), physics=catalog.find(d=>d.landscapeId===phys)
const viewFiles=readdirSync(resolve(root,viewDir)).filter(n=>n.endsWith('.view.json')).sort().map(n=>resolve(root,viewDir,n))
const views=viewFiles.map(f=>({file:f,view:normalizeCompositionView(JSON.parse(readFileSync(f,'utf8')))}))
const qaProfiles=createRouteProfiles(root).filter(p=>p.landscapeId===phys)
const policy=load('app/scripts/config/semantic-route-coverage.json')
const history=await loadOptionalHistoricalReviewContext({repositoryRoot:root})
const kinds=new Map<string,any>(), owners=new Map<string,string>()
for(const source of policy.ledgerSources){
 const ledger=load(source.path), current=catalog.find(c=>c.landscapeId===source.landscapeId)
 const parsed=parseSemanticKindLedger(ledger,current,source.landscapeId,ledger.sourceLandscapePath,history.context)
 for(const goal of current.goals){kinds.set(goal.id,parsed.semanticKindByGoalId.get(goal.id));owners.set(goal.id,source.landscapeId)}
}
const semanticProfiles=deriveSemanticRouteProfiles(policy,kinds,owners,createRouteProfiles(root)).filter(p=>p.landscapeId===phys)
const allRouteGoals=catalog.filter(c=>policy.ledgerSources.some((s:any)=>s.landscapeId===c.landscapeId)).flatMap(c=>c.goals)
const ids={pot:physics.goals.find((g:any)=>g.id.startsWith('6affc2ea')).id,kin:physics.goals.find((g:any)=>g.id.startsWith('7eeff2de')).id,cons:physics.goals.find((g:any)=>g.id.startsWith('839ecc8f')).id,newton:physics.goals.find((g:any)=>g.id.startsWith('5f289cdc')).id,derivation:'2d3f849e-20b1-5b3e-90d0-63d98c6b2b1b',k3:'e0085acf-af64-5c73-8abf-85a5bbfbdaa6'}
const context=buildRouteCatalogContext(physics,catalog).landscape
const byId=new Map<string,any>(context.goals.map((g:any)=>[g.id,g]))
const effective=buildEffectiveRequiresEdges(context)
const direct=new Map<string,string[]>(context.goals.filter((g:any)=>!g.contains?.length).map((g:any)=>[g.id,(g.requires??[]).filter((r:string)=>byId.has(r)&&!byId.get(r).contains?.length)]))
const reachCache=new WeakMap<object,Map<object,Map<string,Set<string>>>>();const noAllowed={};
const reach=(start:string,edges:Map<string,string[]>,allowed?:Set<string>)=>{let ec=reachCache.get(edges);if(!ec){ec=new Map();reachCache.set(edges,ec)}let ac=ec.get(allowed??noAllowed);if(!ac){ac=new Map();ec.set(allowed??noAllowed,ac)}const hit=ac.get(start);if(hit)return hit;const seen=new Set<string>(),q=[start];while(q.length){const id=q.pop()!;if(seen.has(id)||(allowed&&!allowed.has(id)))continue;seen.add(id);q.push(...edges.get(id)??[])}seen.delete(start);ac.set(start,seen);return seen}
const closure=context.goals.filter((g:any)=>!g.contains?.length).map((g:any)=>({goalId:g.id,direct:[...reach(g.id,direct)].sort(),effective:[...reach(g.id,effective)].sort()}))
console.log(`current: applicability`)
const applicability=buildApplicabilityCompilation(catalog.map((landscape:any,i:number)=>({file:resolve(root,paths[i]),landscape})))
const appById=new Map(applicability.reports.flatMap(r=>r.goals).map(g=>[g.goalId,new Set(g.compiledApplicability.jurisdiction??[])]))
console.log(`current: exact native CQR profile evaluation`)
const native=qaProfiles.map(p=>evaluateRouteProfile(physics,p,applicability,catalog,viewFiles))
const hard=semanticProfiles.map(p=>({profileId:p.profileId,findings:validateHardDirectAtomicRoutes(allRouteGoals,kinds,p),selected:allRouteGoals.filter(p.goalSelector).map((g:any)=>g.id).sort()}))
const gvr011=qaProfiles.map(p=>({profileId:p.profileId,missingMotivation:physics.goals.filter((g:any)=>p.goalSelector(g)&&!p.motivationAnchorGoalIds.some(a=>g.id===a||reach(g.id,effective).has(a))).map((g:any)=>g.id).sort()}))
console.log(`current: 90 actual composition projections`)
const rows=views.map(({file,view},vi)=>{
 const filters=[view.scope.courseProfile,view.scope.durationModel].filter((v):v is string=>typeof v==='string')
 const targets=collectRenderedAtomicGoalIdsFromCompositionView(physics,file,filters,false,'CrossStage',[],catalog)
 const visible=collectRenderedAtomicGoalIdsFromCompositionView(physics,file,filters,true,'CrossStage',[],catalog)
 if(view.scope.jurisdiction){for(const id of [...targets])if(!appById.get(id)?.has(view.scope.jurisdiction))targets.delete(id);for(const id of [...visible])if(!appById.get(id)?.has(view.scope.jurisdiction))visible.delete(id)}
 const anchors=[...new Set(qaProfiles.flatMap(p=>p.motivationAnchorGoalIds))]
 restrictForeignRouteSupport(visible,targets,new Set(physics.goals.map((g:any)=>g.id)),effective,anchors)
 restrictCompositionStageRouteSupport(visible,targets,effective,anchors)
 const selected=[...targets].filter(id=>kinds.get(id)==='curricularAtomic').sort()
 const terminals=[...targets].filter(id=>kinds.get(id)==='practiceAssessment').sort()
 const termReach=new Map(terminals.map(id=>[id,reach(id,direct,visible)]))
 const routeRows=selected.map(goalId=>({goalId,motivation:anchors.filter(a=>goalId===a||reach(goalId,effective,visible).has(a)),directMotivation:anchors.filter(a=>goalId===a||reach(goalId,direct,visible).has(a)),terminalIds:terminals.filter(t=>termReach.get(t)!.has(goalId))}))
 const occurrences:any[]=[];const orders:any[]=[];const visit=(nodes:any[],trail:string[])=>nodes.forEach(n=>{if(n.kind==='structure'){if(n.childOrder)orders.push({parentId:n.id,after:n.childOrder.after});visit(n.children,[...trail,n.id])}else if(Object.values(ids).includes(n.goalId)||n.acquisitionPlacement)occurrences.push({goalId:n.goalId,role:n.projectionRole??'target',acquisition:n.acquisitionPlacement===true,path:trail})});visit(view.rootNodes,[])
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(catalog.flatMap((c:any)=>c.goals.map((g:any)=>[g.id,g]))))
 const focus=Object.fromEntries(Object.entries(ids).map(([name,id])=>[name,{id,role:roles.targetGoalIds.has(id)?'target':roles.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent',renderedTarget:targets.has(id),renderedVisible:visible.has(id),requiresClosure:[...reach(id,effective,visible)].sort()}]))
 return {viewId:view.viewId,file:relative(root,file),scope:view.scope,selected,terminals,visible:[...visible].sort(),routeRows,focus,occurrences,orders}
})
const exams=physics.goals.filter((g:any)=>g.examData).map((g:any)=>({goalId:g.id,title:g.title,requires:g.requires,coveredGoalIds:g.examData.coveredGoalIds??[],closure:[...collectWholeMaterialPrerequisiteClosure(context,g.id).atomicGoalIds].sort()}))

const baselineFile=process.argv.find(a=>a.startsWith('--baseline='))?.slice('--baseline='.length)
if(!baselineFile)throw Error('Provide the immutable Task M baseline measurement with --baseline=')
const baselineBytes=readFileSync(baselineFile), baseline=JSON.parse(gunzipSync(baselineBytes).toString())
const beforeById=new Map(baseline.views.map((v:any)=>[v.viewId,v]))
const reportRows=rows.map((after:any)=>{
 const before:any=beforeById.get(after.viewId);if(!before)throw Error('Missing baseline view '+after.viewId)
 const previous=new Map(before.routeRows.map((r:any)=>[r.goalId,r]))
 const losses=after.routeRows.flatMap((r:any)=>{
  const old:any=previous.get(r.goalId);if(!old)return []
  return [...(old.motivation.length&&!r.motivation.length?[{goalId:r.goalId,kind:'motivation'}]:[]),...(old.terminalIds.length&&!r.terminalIds.length?[{goalId:r.goalId,kind:'terminal'}]:[])]
 })
 const keys=(a:any)=>JSON.stringify(a)
 const unordered=(a:any[])=>keys(a.map(keys).sort())
 const orderValue=(row:any)=>row?{...row,after:[...row.after].sort((a:any,b:any)=>(a.unit+'|'+a.after).localeCompare(b.unit+'|'+b.after))}:row
 const delta=(left:any[],right:any[])=>{const present=new Set(right.map(keys));return left.filter(row=>!present.has(keys(row)))}
 const previousOrders=new Map(before.orders.map((r:any)=>[r.parentId,r])),currentOrders=new Map(after.orders.map((r:any)=>[r.parentId,r]))
 const changedParents=new Set([...previousOrders.keys(),...currentOrders.keys()].filter(id=>keys(orderValue(previousOrders.get(id)))!==keys(orderValue(currentOrders.get(id)))))
 const focus=Object.fromEntries(Object.entries(after.focus).map(([key,value]:[string,any])=>[key,{...value,requiresClosure:undefined,requiresClosureCount:value.requiresClosure.length,trackedPrerequisites:value.requiresClosure.filter((id:string)=>Object.values(ids).includes(id))}]))
 return {viewId:after.viewId,file:after.file,scope:after.scope,beforeSelectedCount:before.selected.length,afterSelectedCount:after.selected.length,beforeVisibleCount:before.visible.length,afterVisibleCount:after.visible.length,addedTargets:after.selected.filter((id:string)=>!before.selected.includes(id)),removedTargets:before.selected.filter((id:string)=>!after.selected.includes(id)),lostOnlyRoutes:losses,focus,derivationRoute:after.routeRows.find((r:any)=>r.goalId===ids.derivation)??null,changedAcquisitionPlaces:unordered(before.occurrences.filter((r:any)=>r.acquisition))!==unordered(after.occurrences.filter((r:any)=>r.acquisition)),changedPartialOrder:changedParents.size>0,changedReferencePresentationOrderOnly:unordered(before.occurrences)===unordered(after.occurrences)&&keys(before.occurrences)!==keys(after.occurrences),removedOccurrences:delta(before.occurrences,after.occurrences),addedOccurrences:delta(after.occurrences,before.occurrences),beforeChangedOrders:before.orders.filter((r:any)=>changedParents.has(r.parentId)),afterChangedOrders:after.orders.filter((r:any)=>changedParents.has(r.parentId))}
})
const targetRows=reportRows.filter((r:any)=>r.addedTargets.includes(ids.derivation))
const controls=reportRows.filter((r:any)=>['de-bw-gk.view.json','de-bw-lk.view.json','de-bw-seki.view.json'].some(f=>r.file.endsWith('/'+f))).map((r:any)=>{
 const before:any=beforeById.get(r.viewId),after:any=rows.find((v:any)=>v.viewId===r.viewId)
 return {viewId:r.viewId,file:r.file,kineticEnergyBefore:before.routeRows.find((v:any)=>v.goalId===ids.kin),kineticEnergyAfter:after.routeRows.find((v:any)=>v.goalId===ids.kin)}
})
const summary={schema:'physics-e2-energy-current-routes-v1',baselineCommit:baseline.baseline,baselineMeasurementSha256:createHash('sha256').update(baselineBytes).digest('hex'),method:'Current native stage CQR profiles and all 90 actual composition projections; native course/duration projection, compiled jurisdiction filtering, foreign/stage support restriction and direct atomic terminal paths. Baseline is the immutable Task M measurement of 284063239d. No account or learner data.',ids,native,gvr011,hard,counts:{views:reportRows.length,newDerivationTargetViews:targetRows.length,viewsWithChangedAcquisitionPlaces:reportRows.filter((r:any)=>r.changedAcquisitionPlaces).length,viewsWithChangedPartialOrders:reportRows.filter((r:any)=>r.changedPartialOrder).length,lostOnlyRoutes:reportRows.flatMap((r:any)=>r.lostOnlyRoutes).length},targetViews:targetRows.map((r:any)=>r.viewId),badenWuerttembergControls:controls,bindings:[...paths,...viewFiles.map(f=>relative(root,f))].map(path=>({path,sha256:createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')})),views:reportRows,limitations:['Native CQR/GVR run their registered scopes; per-view direct route comparisons are additional diagnostics.','Declared assessment coverage is metadata. Task and rubric adequacy require the separate K3 review.','This creates no learner, mastery or card results.']}
writeFileSync(resolve(out,'all-90-route-regression.actual.json'),JSON.stringify(summary,null,2)+'\n')
if(reportRows.length!==90||targetRows.length!==14||reportRows.some((r:any)=>r.lostOnlyRoutes.length)||targetRows.some((r:any)=>!r.derivationRoute?.terminalIds.includes(ids.k3)||!r.derivationRoute?.directMotivation.length)||controls.length!==3||controls.some((r:any)=>!r.kineticEnergyAfter?.terminalIds.length))throw Error('Unexpected route regression')
console.log(JSON.stringify(summary.counts))
