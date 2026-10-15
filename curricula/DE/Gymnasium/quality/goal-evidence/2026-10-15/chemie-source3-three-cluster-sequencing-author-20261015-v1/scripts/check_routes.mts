// SPDX-License-Identifier: Apache-2.0
// Bounded technical check with unchanged production compilation/projection helpers.
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath,pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'
const repo=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const at=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(repo,p))).digest('hex')
const write=(p:string,x:any)=>writeFileSync(resolve(own,p),JSON.stringify(x,null,2)+'\n')
const sel=at('INPUTS.physical-exact-selector.json'),land=read(sel.canonical.path),ledger=read(sel.semanticLedger.path)
const G=new Map<string,any>(land.goals.map((g:any)=>[g.id,g])),K=new Map(ledger.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const modules=['app/src/utils/authoring/compositionViewAuthoring.ts','app/scripts/compositionViewSourceCoverage.ts','app/src/hooks/useLandscapes.ts']
const {compileCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(resolve(repo,modules[0])).href)
const {collectAuthoritativeTargetAtomicGoalIds}=await import(pathToFileURL(resolve(repo,modules[1])).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(repo,modules[2])).href)
const {applyCompositionViewProjection}=await import(pathToFileURL(resolve(repo,'app/src/utils/compositionViewRuntime.ts')).href)
const effective=new Map<string,any>(prepareLandscapeEntries([land]).flatMap((e:any)=>e.goals).map((g:any)=>[g.id,g]))
const req=createRequire(resolve(repo,'app/package.json')),Ajv=req('ajv/dist/2020').default,formats=req('ajv-formats')
const ajv=new Ajv({allErrors:true,strict:false});formats(ajv)
const schemaPath='contracts/curriculum-package/v1/composition-view.schema.json',validate=ajv.compile(read(schemaPath))
const cas=at('CAS.two-whole-LK-views-and-two-exact-GK-controls.author.json')
const opportunities=at('materials/ten-complete-acquisition-opportunities.DE-EN.author.json').opportunities
const byOpportunity=new Map(opportunities.map((o:any)=>[o.goalId,o]))
let projected=new Map<string,any>(effective)
const dependencies=(id:string,eff:boolean)=>{
 const seen=new Set<string>(),stack=[...(eff?(projected.get(id)?.effectiveRequires??[]):G.get(id)?.requires??[])]
 while(stack.length){const p=stack.pop()!;if(seen.has(p))continue;seen.add(p)
  stack.push(...(eff?(projected.get(p)?.effectiveRequires??[]):G.get(p)?.requires??[]),...(eff?projected.get(p)?.contains??[]:G.get(p)?.contains??[]))}
 return [...seen].sort()
}
const topological=(ids:Set<string>,eff:boolean)=>{
 const done=new Set<string>(),busy=new Set<string>(),order:string[]=[]
 const visit=(id:string)=>{if(done.has(id))return;if(busy.has(id))throw new Error('prerequisite cycle '+id);busy.add(id)
  for(const dep of dependencies(id,eff)){if(ids.has(dep))visit(dep)}
  busy.delete(id);done.add(id);order.push(id)}
 for(const id of [...ids].sort())visit(id);return order
}
const cycleWitness=(start:string)=>{
 const queue:[string,string[]][]=[[start,[start]]],seen=new Set<string>([start])
 while(queue.length){const [id,path]=queue.shift()!;const g=projected.get(id)
  for(const dep of [...(g?.effectiveRequires??[]),...(g?.contains??[])]){
   if(dep===start)return [...path,start]
   if(!seen.has(dep)){seen.add(dep);queue.push([dep,[...path,dep]])}
  }}
 return []
}
const reports=[]
for(const row of cas.rows){
 const before=read(row.before.path),view=read(row.after.path),schemaOK=validate(view)
 const activeViewPath='curricula/DE/Gymnasium/composition-views/chemie/'+row.name+'.view.json'
 const activeView=read(activeViewPath),activeTargets=collectAuthoritativeTargetAtomicGoalIds(land,activeView)
 const schemaErrors=schemaOK?[]:structuredClone(validate.errors)
 const compiled=compileCompositionView(view,land),old=collectAuthoritativeTargetAtomicGoalIds(land,before),targets=collectAuthoritativeTargetAtomicGoalIds(land,view)
 const oldProjected=new Map<string,any>(applyCompositionViewProjection(prepareLandscapeEntries([land]),before)[0].goals.map((g:any)=>[g.id,g]))
 projected=new Map<string,any>(applyCompositionViewProjection(prepareLandscapeEntries([land]),view)[0].goals.map((g:any)=>[g.id,g]))
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,G)
 const selected=sel.sourceGoalIds.filter((id:string)=>targets.has(id))
 const sourceRows=sel.sourceGoalIds.map((id:string)=>({goalId:id,target:targets.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id),
  missingRawAtomicPrerequisites:dependencies(id,false).filter(p=>K.get(p)==='curricularAtomic'&&!targets.has(p)),
  missingEffectiveAtomicPrerequisites:dependencies(id,true).filter(p=>K.get(p)==='curricularAtomic'&&!targets.has(p)),
  rawPrerequisites:dependencies(id,false),effectivePrerequisites:dependencies(id,true)}))
 const required=new Set<string>(selected.flatMap((id:string)=>[id,...dependencies(id,false)]).filter((id:string)=>K.get(id)==='curricularAtomic'))
 const ordered=topological(required,false)
 const acquisitionSteps=ordered.map(id=>({goalId:id,title:G.get(id).title,target:targets.has(id),
  newlyAddedTarget:row.addedTargetGoalIds.includes(id),wholeDirectContainsExpandedPrerequisiteGoalIds:dependencies(id,false),
  learningOpportunity:byOpportunity.has(id)?relative(repo,resolve(own,'materials/ten-complete-acquisition-opportunities.DE-EN.author.json'))+'#acquire-'+id.split('-')[0]:null,
  acquisitionRule:byOpportunity.has(id)?'Complete the bound designed learning opportunity; require its independent observable criteria. Practical operators require actual future observed execution.':'Existing explicit target in retained whole view. Acquire normally or independently demonstrate existing competence under the complete whole-goal criteria; do not assume mastery from visibility or scope.',
  actualObservation:null,masteryAssumed:false}))
 const expectedSelected=row.name==='de-hb-lk'?sel.sourceGoalIds.slice(0,2):row.name==='de-bw-lk'?[sel.sourceGoalIds[2]]:[]
 const added=[...targets].filter(i=>!old.has(i)).sort(),removed=[...old].filter(i=>!targets.has(i)).sort()
 const positiveScopes={scopeUnchanged:JSON.stringify(before.scope)===JSON.stringify(view.scope),
  selectedSourceGoalIds:expectedSelected,expectedSelectedPresent:expectedSelected.every((i:string)=>targets.has(i)),
  otherSourceCarriersAbsent:sel.sourceGoalIds.filter((i:string)=>!expectedSelected.includes(i)).every((i:string)=>!targets.has(i)&&!roles.prerequisiteOnlyGoalIds.has(i)),
  addedTargetsJurisdictionCompatible:row.addedTargetGoalIds.every((i:string)=>!G.get(i).applicability?.jurisdiction||G.get(i).applicability.jurisdiction.includes(view.scope.jurisdiction)),
  newTargetsAreOrdinaryAtoms:row.addedTargetGoalIds.every((i:string)=>K.get(i)==='curricularAtomic'&&G.get(i).contains.length===0),
  noNewPrerequisiteOnly:row.addedTargetGoalIds.every((i:string)=>targets.has(i)&&!roles.prerequisiteOnlyGoalIds.has(i))}
 const expected=JSON.stringify([...row.addedTargetGoalIds].sort())===JSON.stringify(added)
 const scopedPrereqPass=sourceRows.filter((r:any)=>r.target).every((r:any)=>r.missingRawAtomicPrerequisites.length===0)
 const newTargetEffectiveChecks=row.addedTargetGoalIds.map((id:string)=>{
  const candidateDependencies=dependencies(id,true)
  const saved=projected;projected=oldProjected;const oldDependencies=dependencies(id,true);projected=saved
  return {goalId:id,actualProjectedEffectiveRequires:projected.get(id)?.effectiveRequires??[],
   actualProjectedPrerequisiteClosure:candidateDependencies,
   missingOrdinaryTargetPrerequisites:candidateDependencies.filter(p=>K.get(p)==='curricularAtomic'&&!targets.has(p)),
   selfDependency:candidateDependencies.includes(id),
   actualProjectedCycleWitness:cycleWitness(id),
   prerequisiteClosureUnchangedFromOriginalView:JSON.stringify(candidateDependencies)===JSON.stringify(oldDependencies),
   oldProjectedPrerequisiteClosure:oldDependencies,
   acquisitionMayBeClaimedReady:!candidateDependencies.includes(id)&&candidateDependencies.filter(p=>K.get(p)==='curricularAtomic'&&!targets.has(p)).length===0}
 })
 const actualEffectiveAcquisitionPass=newTargetEffectiveChecks.every((r:any)=>r.acquisitionMayBeClaimedReady)
 const selectedCarrierEffectivePass=sourceRows.filter((r:any)=>r.target).every((r:any)=>r.missingEffectiveAtomicPrerequisites.length===0&&!r.effectivePrerequisites.includes(r.goalId))
 const ownOpportunityPass=row.addedTargetGoalIds.every((i:string)=>byOpportunity.has(i))
 reports.push({view:row.name,before:row.before,after:row.after,scope:view.scope,schemaOK,schemaErrors,
  compileFindings:compiled.findings,beforeTargetAtomicCount:old.size,afterTargetAtomicCount:targets.size,
  beforeTargetAtomicIds:[...old].sort(),afterTargetAtomicIds:[...targets].sort(),
  activeCurrentViewReference:{path:activeViewPath,sha256:digest(activeViewPath),
   projectionBasis:'Same exact prospective554 graph used for all comparisons; no active runtime or registry modification/acceptance claim.',
   targetAtomicCount:activeTargets.size,targetAtomicIds:[...activeTargets].sort(),
   explicitSourceCarriersPresent:sel.sourceGoalIds.filter((id:string)=>activeTargets.has(id)),
   extraTargetsInBoundV3BeforeView:[...old].filter(id=>!activeTargets.has(id)).sort()},
  addedTargetGoalIds:added,removedTargetGoalIds:removed,exactExpectedAdditions:expected,
  positiveScopes,selectedSourceRows:sourceRows,acquisitionSteps,
  newTargetActualProjectedEffectiveChecks:newTargetEffectiveChecks,
  directContainsExpandedClosurePass:scopedPrereqPass,
  actualProjectedNewTargetAcquisitionPass:actualEffectiveAcquisitionPass,
  actualProjectedSelectedCarrierAcquisitionPass:selectedCarrierEffectivePass,
  allAddedTargetsHaveExplicitAcquisitionDesign:ownOpportunityPass,
  structuralAndDirectClosurePass:schemaOK&&compiled.findings.every((f:any)=>f.severity!=='error')&&expected&&removed.length===0&&scopedPrereqPass&&ownOpportunityPass&&Object.values(positiveScopes).every(x=>Array.isArray(x)||Boolean(x)),
  acquisitionRouteReady:scopedPrereqPass&&actualEffectiveAcquisitionPass&&selectedCarrierEffectivePass})
}
const proof={schemaVersion:1,role:'Unmodified stock helpers, exact prospective554 graph, bounded author route diagnostics; no independent scientific approval',
 canonical:sel.canonical,semanticLedger:sel.semanticLedger,productionHelpers:modules.map(path=>({path,sha256:digest(path)})),
 schema:{path:schemaPath,sha256:digest(schemaPath)},reports,
 technicalStructuralAndDirectClosurePass:reports.every(r=>r.structuralAndDirectClosurePass),
 pass:reports.every(r=>r.structuralAndDirectClosurePass&&r.acquisitionRouteReady),
 allProposedAcquisitionRoutesReady:reports.filter(r=>r.view.endsWith('-lk')).every(r=>r.acquisitionRouteReady),
 newScienceVotes:0,newStrictClosures:0,restoredBindings:0,
 limits:'Closes the explicitly named acquisition design/membership gaps for the three selected source carriers at candidate level. It does not approve the full source/course inventory, optional programme choice, human trial, practical performance or M7.'}
write('checks/CHECK.stock-compiler-positive-scopes-and-prerequisites.actual.json',proof)
write('candidate/two-explicit-LK-acquisition-routes.author.json',{schemaVersion:1,
 rows:reports.filter(r=>r.view.endsWith('-lk')).map(r=>({view:r.view,scope:r.scope,wholeView:r.after,
  selectedSourceGoalIds:r.selectedSourceRows.filter((x:any)=>x.target).map((x:any)=>x.goalId),
  acquisitionSteps:r.acquisitionSteps,sourceMappingForAddedPrerequisites:'none-author-curated-learning-route',
  acquisitionRouteReady:r.acquisitionRouteReady,
  priorKnowledgePolicy:'Prior knowledge may be demonstrated independently, with actual performance where the whole target requires it; no automatic mastery, invisible prerequisiteOnly substitution, or historical learner trial required for machine M7.'}))})
console.log(JSON.stringify({structuralAndDirectClosurePass:proof.technicalStructuralAndDirectClosurePass,allProposedAcquisitionRoutesReady:proof.allProposedAcquisitionRoutesReady,overallAcquisitionPass:proof.pass,views:reports.map(r=>({view:r.view,before:r.beforeTargetAtomicCount,after:r.afterTargetAtomicCount,added:r.addedTargetGoalIds.length,removed:r.removedTargetGoalIds.length,structuralAndDirectClosurePass:r.structuralAndDirectClosurePass,acquisitionRouteReady:r.acquisitionRouteReady,
  sourceRows:r.selectedSourceRows.filter((x:any)=>x.target).map((x:any)=>({id:x.goalId,missingRaw:x.missingRawAtomicPrerequisites,missingEffective:x.missingEffectiveAtomicPrerequisites}))})),newScienceVotes:0}))
if(!proof.technicalStructuralAndDirectClosurePass)process.exitCode=1
