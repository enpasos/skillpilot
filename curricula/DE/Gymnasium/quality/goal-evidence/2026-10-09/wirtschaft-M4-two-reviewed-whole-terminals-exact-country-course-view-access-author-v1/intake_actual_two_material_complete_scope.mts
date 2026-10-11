import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
const [capsule, packagePath, viewsPath, output] = process.argv.slice(2)
const native: any = await import(pathToFileURL(join(capsule, 'app/scripts/two-material-access.native-diagnostic-exports.ts')).href)
const current = JSON.parse(readFileSync(join(packagePath, 'inputs/whole-current-CAN494-actual8965-before-two-view-access.json'), 'utf8'))
const actualCompilation = JSON.parse(readFileSync(join(packagePath, 'actual-native-current494-base-v1/whole-actual-seven-material-CAN494.native-applicability-report.json'), 'utf8'))
const report = actualCompilation.report
const goalById = new Map(current.goals.map((g: any) => [g.id, g]))
const compiledById = new Map(report.goals.map((g: any) => [g.goalId, new Set(g.compiledApplicability.jurisdiction ?? [])]))
const profile = native.routeProfiles.find((p: any) => p.landscapeId === current.landscapeId)
const views = readdirSync(viewsPath).filter((name: string) => name.endsWith('.view.json')).map((name: string) => ({ name, file:join(viewsPath,name), view:JSON.parse(readFileSync(join(viewsPath,name),'utf8')) })).filter(({view}: any) => view.scope.stage === 'CrossStage')
assert.equal(views.length,34)
const jurisdictions = actualCompilation.compilationSummaryForThisPrivateSubset.supportedValues
const project = (item: any, jurisdiction: string) => {
  const filters = [item.view.scope.courseProfile, item.view.scope.durationModel].filter(Boolean)
  const target = native.collectRenderedAtomicGoalIdsFromCompositionView(current,item.file,filters,false,'CrossStage',profile.motivationAnchorGoalIds)
  const visible = native.collectRenderedAtomicGoalIdsFromCompositionView(current,item.file,filters,true,'CrossStage',profile.motivationAnchorGoalIds)
  for (const ids of [target,visible]) for (const id of ids) if (!(compiledById.get(id) as Set<string>|undefined)?.has(jurisdiction)) ids.delete(id)
  return { target,visible,filters }
}
const projections: any[]=[]
const materialIds=['f80d7cbb-e03c-5613-a4b6-8a1bad485385','73c49b24-e928-54f4-b4d3-93347d532e5b']
const closures = materialIds.map(id=>({id,...native.collectWholeMaterialPrerequisiteClosure(current,id)}))
const atomicEdges = native.buildAtomicDirectRequiresEdges(current)
for (const item of views) for (const jurisdiction of item.view.scope.jurisdiction ? [item.view.scope.jurisdiction] : jurisdictions) {
  const projected = project(item,jurisdiction)
  let authority:any=null
  if (!item.view.scope.jurisdiction) {
    const authorities = views.filter((a: any)=>a.view.scope.jurisdiction===jurisdiction && a.view.scope.courseProfile===item.view.scope.courseProfile && a.view.scope.durationModel===item.view.scope.durationModel)
    assert.equal(authorities.length,1,`${item.name}/${jurisdiction} actual state authority`)
    authority=project(authorities[0],jurisdiction)
    const ownSupport=[...projected.visible].filter((id:any)=>!projected.target.has(id))
    for(const id of projected.target)if(!authority.target.has(id))projected.target.delete(id)
    projected.visible.clear()
    for(const id of [...projected.target,...ownSupport,...[...authority.visible].filter((id:any)=>!authority.target.has(id))])projected.visible.add(id)
  }
  const materials=closures.map((closure:any)=>{
    const material:any=goalById.get(closure.id)
    const courseCompatible=native.goalMatchesFilters(native.convertLearningGoal(material,{landscapeId:current.landscapeId}),projected.filters)
    const countryCompatible=(compiledById.get(closure.id)as Set<string>)?.has(jurisdiction)??false
    const missing=[...closure.atomicGoalIds].filter((id:any)=>!projected.visible.has(id)).sort()
    const localEdges=new Map([...atomicEdges].filter(([id]:any)=>projected.visible.has(id)).map(([id,requires]:any)=>[id,requires.filter((rid:any)=>projected.visible.has(rid))]))
    // The prospective terminal itself is the only added vertex; all prerequisite vertices pre-exist.
    localEdges.set(closure.id,(atomicEdges.get(closure.id)??[]).filter((id:any)=>projected.visible.has(id)))
    const hasPath=native.createPathChecker(localEdges)
    const coveredChecks=material.examData.coveredGoalIds.map((id:string)=>({goalId:id,currentLocalVisible:goalById.has(id)&&projected.visible.has(id),realAtomicPrerequisitePath:hasPath(closure.id,id),ordinaryTarget:projected.target.has(id)}))
    const entireWholeMaterialEligible=material.examData.reviewStatus==='released' && countryCompatible && courseCompatible && closure.unresolvedReferences.size===0 && missing.length===0 && coveredChecks.every((x:any)=>x.currentLocalVisible&&x.realAtomicPrerequisitePath) && coveredChecks.some((x:any)=>x.ordinaryTarget)
    return {materialGoalId:closure.id,wholeMaterialEligible:entireWholeMaterialEligible,currentMaterialVisibleAsTarget:projected.target.has(closure.id),compiledCountryCompatible:countryCompatible,courseCompatible,wholeHardPrerequisiteGoalIds:[...closure.atomicGoalIds].sort(),unresolvedReferences:[...closure.unresolvedReferences].sort(),missingWholePrerequisiteGoalIds:missing,coveredChecks,requiresOnlyExistingTargetOrSupport:true}
  })
  projections.push({viewFile:item.name,scope:item.view.scope,jurisdiction,nationalStateAuthorityUsed:!!authority,targetGoalIds:[...projected.target].sort(),visibleAtomicTargetAndSupportGoalIds:[...projected.visible].sort(),materials})
}
assert.equal(projections.length,64)
const actualRouteResult=native.evaluateRouteProfile(current,profile,{reports:[report],summary:actualCompilation.compilationSummaryForThisPrivateSubset})
writeFileSync(output,JSON.stringify({role:'BOUNDED_VIEW_AUTHOR_NATIVE_CURRENT_SCOPE_INTAKE_NO_SELF_APPROVAL',currentCanonicalGoals:current.goals.length,currentNativeApplicability:report.summary,existingWholeViews:34,actualCountryAndNationalProjections:64,completeInheritedClosureNativeCodeUnmodified:true,projections,actualWholeRouteProfileResult:actualRouteResult,humanApproval:false,strictFiveGateGain:0},null,2)+'\n')
console.log(JSON.stringify({views:34,scopes:64,materials:closures.map((x:any)=>({id:x.id,closure:[...x.atomicGoalIds].sort(),unresolved:[...x.unresolvedReferences]})),eligibleMissing:projections.flatMap(p=>p.materials.filter((m:any)=>m.wholeMaterialEligible&&!m.currentMaterialVisibleAsTarget).map((m:any)=>({view:p.viewFile,jurisdiction:p.jurisdiction,material:m.materialGoalId})))}))
