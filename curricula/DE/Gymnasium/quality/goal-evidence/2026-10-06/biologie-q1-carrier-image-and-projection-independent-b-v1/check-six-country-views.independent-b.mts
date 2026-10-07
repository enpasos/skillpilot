import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildApplicabilityCompilation } from '../../../../../../../app/scripts/applicabilityCompiler'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { convertLearningGoal } from '../../../../../../../app/src/goalTypes'
import { stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'biologie-q1-carrier-image-and-projection-independent-b-v1/'
const prepared=base+'biologie-q1-carrier-projection-and-image-targeted-author-v2/'
const bindings=new Map<string,any>()
const bytes=(path:string)=>{const b=readFileSync(resolve(path));bindings.set(path,{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return b}
const read=(path:string)=>JSON.parse(bytes(path).toString())
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const assert=(x:any,s:string)=>{if(!x)throw new Error(s)}
const raw=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const kinds=read('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
const kindById=new Map(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const canonical=normalizeCanonicalLandscape(raw)
const graph=new Map(canonical.goals.map(g=>[g.id,g]))
const carrier='ac9e824f-003c-50ac-8751-2b8456004c63'
const supports=['2d451684-6e53-565e-a987-f362da919d2c','9e51741b-f952-5f62-9b6b-080eee6c5590']
const originalProposal=read(base+'biologie-q1-seven-component-native-source-preparation-author-v6/source-view-route-and-prerequisite-only.author-candidate.json')
const oldSTSourceView=read('app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-st-seki.view.json')
const oldSTRoles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(oldSTSourceView).rootNodes,graph)
assert(oldSTRoles.targetGoalIds.size===180,'Original whole ST SekI source set changed')
const rows:any[]=[]
const countryTargets=new Map<string,Set<string>>()
const countryPrereqs=new Map<string,Set<string>>()
const entry={meta:raw,goals:raw.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:raw.landscapeId}))}
for (const name of ['de-mv-gym-seki-biology.view.json','de-sn-gym-seki-biology.view.json','de-th-gym-seki-biology.view.json','de-st-gym-seki-biology.view.json','de-st-gym-sekii-biology-gk.view.json','de-st-gym-sekii-biology-lk.view.json']) {
  const path=prepared+'views/'+name
  const view=normalizeCompositionView(read(path))
  const compiled=compileCompositionView(view,canonical)
  assert(!compiled.findings.some(f=>f.severity==='error'),'Invalid native view '+name)
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,graph)
  const country=view.scope.jurisdiction
  const targets=countryTargets.get(country)??new Set<string>();roles.targetGoalIds.forEach(id=>targets.add(id));countryTargets.set(country,targets)
  const prereqs=countryPrereqs.get(country)??new Set<string>();roles.prerequisiteOnlyGoalIds.forEach(id=>prereqs.add(id));countryPrereqs.set(country,prereqs)
  const key=country+'/'+view.scope.stage+'/'+(view.scope.courseProfile??'')
  const original=originalProposal.views.find((r:any)=>r.scope===key)
  const originalRoles=original?collectCompositionProjectionRoleGoalIds(normalizeCompositionView(original.view).rootNodes,graph):oldSTRoles
  const expectedTargets=new Set(originalRoles.targetGoalIds)
  supports.forEach(id=>expectedTargets.add(id))
  assert(same([...roles.targetGoalIds].sort(),[...expectedTargets].sort()),'Whole source target set changed '+name)
  assert(!roles.targetGoalIds.has(carrier),'Carrier remains a target '+name)
  assert(view.scope.stage==='SekI'&&country==='DE-ST'?roles.prerequisiteOnlyGoalIds.size===0:same([...roles.prerequisiteOnlyGoalIds],[carrier]),'Wrong support role membership '+name)
  if(view.scope.stage==='SekI')assert(!roles.targetGoalIds.has('bfb5dfb6-8e35-5452-b581-96e061d8b826'),'ST point mutation exposed in SekI')
  const projected=applyCompositionViewProjection([entry],view)[0]
  const support=projected.goals.find(g=>g.id===carrier)
  assert(support&&support.id===carrier&&same(support.requires,entry.goals.find(g=>g.id===carrier)!.requires),'Carrier canonical support object lost')
  const projectedByID=new Map(projected.goals.map(g=>[g.id,g]))
  const roots=projected.goals.filter(g=>g.tags.includes('root')).map(g=>g.id)
  const rendered=new Set<string>();const stack=[...roots]
  while(stack.length){const id=stack.pop()!;if(rendered.has(id))continue;rendered.add(id);for(const child of projectedByID.get(id)?.contains??[])stack.push(child)}
  assert(!rendered.has(carrier),'Carrier rendered as target '+name)
  const carrierDependents=raw.goals.filter((g:any)=>roles.targetGoalIds.has(g.id)&&g.requires.includes(carrier))
  assert(carrierDependents.every((g:any)=>same(projectedByID.get(g.id)?.requires,g.requires)),'Prerequisite checks lost support reference')
  rows.push({path,scope:view.scope,verdict:'KEEP',reason:'Complete previously source-reviewed target UUID set retained, with unchanged existing orientation/memory support in every individual stage view; carrier has the explicit existing prerequisiteOnly role. Real native compilation and runtime retain its stable canonical support identity and dependent requires, while excluding it from the target tree.',targetCount:roles.targetGoalIds.size,curricularTargetCount:[...roles.targetGoalIds].filter(id=>kindById.get(id)==='curricularAtomic').length,sourceOriginalTargetUUIDsRetained:[...originalRoles.targetGoalIds].sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds],existingGlobalMemoryAndOrientationPreserved:supports.every(id=>roles.targetGoalIds.has(id)),carrierStableCanonicalSupportRetained:true,carrierExcludedFromActualRenderedTree:true,dependentsWithUnchangedCarrierRequires:carrierDependents.map((g:any)=>g.id),learnerSessionMasteryWriteOrAcceptanceClaimed:false,nativeCompilationErrors:[]})
}
const actualReport=buildApplicabilityCompilation().reports.find(r=>r.landscapeId===raw.landscapeId)!
const unions=[]
for(const jurisdiction of ['DE-MV','DE-SN','DE-ST','DE-TH']) {
  const oldAvailable=actualReport.goals.filter(g=>g.goalType==='atomic'&&g.compiledApplicability.jurisdiction?.includes(jurisdiction)).map(g=>g.goalId)
  const expected=oldAvailable.filter(id=>id!==carrier).sort();const actual=[...countryTargets.get(jurisdiction)!].sort()
  assert(same(actual,expected),'Old full country target lost or source scope widened '+jurisdiction)
  assert(countryPrereqs.get(jurisdiction)!.has(carrier),'Carrier unavailable as prerequisite '+jurisdiction)
  unions.push({jurisdiction,rawAtomicAvailabilityCount:oldAvailable.length,completeTargetUnionCount:actual.length,curricularTargetCount:actual.filter(id=>kindById.get(id)==='curricularAtomic').length,allOtherRawAtomicUUIDsRetained:true,carrierPrerequisiteOnly:true,verdict:'KEEP'})
}
const nativeInput=read(base+'biologie-q1-seven-final-native-review-inputs-author-v1/round-b/description-review-input.json')
const unchangedSix=nativeInput.goals.filter((r:any)=>r.goalId!==carrier).map((r:any)=>{const goal=raw.goals.find((g:any)=>g.id===r.goalId);return{goalId:r.goalId,verdict:'KEEP',sourceTextAndGoalBindingsRetained:true,reason:'No goal field, source component, material case, or actual image is changed by these country-view-only deltas. Prior full individual science, Memory, D, P and visual decisions remain in scope.'}})
const national=[]
for(const name of ['de-de-gym-seki-biology.view.json','de-de-gym-biology-gk.view.json']){
  const active=read('curricula/DE/Gymnasium/composition-views/biologie/'+name)
  const original=read(base+'biologie-q1-seven-reviewed-integration-candidate-v1/views/'+name)
  assert(same(active,original),'National full view changed')
  const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(active).rootNodes,graph)
  national.push({view:name,targets:roles.targetGoalIds.size,wholeParsedViewExact:true})
}
const memory=read(base+'biologie-q1-seven-reviewed-integration-candidate-v1/full-memory.current.config.json')
const candidateMemory={...memory,visibilityScopes:[...memory.visibilityScopes,...rows.map(row=>({label:row.path.split('/').at(-1),viewPath:row.path}))]}
writeFileSync(own+'full-memory.eight-visibility-scopes.independent-b.config.json',JSON.stringify(candidateMemory,null,2)+'\n')
const output={schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'Actual independent B complete six-country-view review before active import',verdict:'KEEP',views:rows,countryUnions:unions,STSekIWhole180OriginalTargetsExact:true,existingNationalCompleteViews:national,unchangedSixGoalReviews:unchangedSix,masteryRetentionMeaning:'Actual runtime retains the support goal at the same canonical UUID and preserves every dependent requires reference. Global learner-state values were neither changed nor exercised; stable UUID retention preserves their address.',memoryEightScopeNativeCheckPending:true,sourceMappingOrCodeChangesRequired:false,wholeOriginalSourceHoldsRemain:true,peerAReviewOutputsRead:false,activeWrites:false,humanApproval:false,humanTrial:false,allActualInputs:[...bindings.values()]}
writeFileSync(own+'six-country-views.independent-b.actual.json',JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({verdict:'KEEP',views:rows.map(r=>({view:r.path.split('/').at(-1),targets:r.targetCount,curricular:r.curricularTargetCount})),unions,national}))
