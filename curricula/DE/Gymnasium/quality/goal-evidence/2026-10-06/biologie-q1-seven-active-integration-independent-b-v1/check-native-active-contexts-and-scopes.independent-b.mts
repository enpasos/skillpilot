import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { buildGoalBookModel, stableGoalBookJson, fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const own=base+'biologie-q1-seven-active-integration-independent-b-v1/'
const prep=base+'biologie-q1-seven-final-native-review-inputs-author-v1/'
const candidate=base+'biologie-q1-seven-reviewed-integration-candidate-v1/'
const bindings=new Map<string,any>()
const bytes=(path:string)=>{const b=readFileSync(resolve(path));bindings.set(path,{path,sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length});return b}
const read=(path:string)=>JSON.parse(bytes(path).toString())
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const assert=(c:any,s:string)=>{if(!c)throw new Error(s)}
const canonical=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const kinds=read('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
const reviewedKinds=read(candidate+'semantic-kinds-390.integration-candidate.json')
assert(same(kinds,{...reviewedKinds,sourceLandscapePath:'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'}),'Active semantic ledger differs beyond production routing')
const qa=read('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
const oldCanonical=read(own+'before/00-DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const oldKinds=read(own+'before/02-biologie.semantic-kinds.json')
const oldQA=read(own+'before/01-biologie.qa.json')
const config=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const oldConfig=read(own+'before/04-de-gym-biology-national-atlas.inputs.json')
const oldAtlasConfig=structuredClone(oldConfig)
oldAtlasConfig.landscapePath=own+'before/00-DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
oldAtlasConfig.semanticKindLedgerPath=own+'before/02-biologie.semantic-kinds.json'
assert(same(config.mappingPaths.slice(0,oldConfig.mappingPaths.length),oldConfig.mappingPaths)&&config.mappingPaths.length===oldConfig.mappingPaths.length+6,'Old source mapping paths changed')
const restoredConfig=structuredClone(config)
restoredConfig.mappingPaths=oldConfig.mappingPaths
restoredConfig.expectedCurricularAtomicGoalCount=oldConfig.expectedCurricularAtomicGoalCount
assert(same(restoredConfig,oldConfig),'Source atlas config changed beyond six paths/count')
const oldAtlas=buildGoalBookSourceAtlasInputs(oldAtlasConfig,resolve('.'))
const atlas=buildGoalBookSourceAtlasInputs(config,resolve('.'))
for (const r of [...oldAtlas.receipt.inputBindings,...atlas.receipt.inputBindings]) if(!bindings.has(r.path))bytes(r.path)
assert(oldAtlas.receipt.counts.publishedCurricularAtomicGoals===383&&atlas.receipt.counts.publishedCurricularAtomicGoals===390&&atlas.receipt.omittedGoals.length===0,'Native atlas coverage changed')
const scopes=atlas.receipt.scopes.map((s:any)=>{
  const before=oldAtlas.receipt.scopes.find((o:any)=>o.key===s.key)
  const oldIds=new Set(before?.goalIds??[])
  assert([...oldIds].every(id=>s.goalIds.includes(id)),'Old source scope target lost '+s.key)
  return {key:s.key,oldCount:oldIds.size,newCount:s.goalIds.length,addedGoalIds:s.goalIds.filter((id:string)=>!oldIds.has(id)),lostGoalIds:[]}
})
assert(oldAtlas.receipt.scopes.every((s:any)=>atlas.receipt.scopes.some((a:any)=>a.key===s.key)),'Old source scope removed')
const dinput=read(prep+'round-b/description-review-input.json')
const ids=dinput.goals.map((r:any)=>r.goalId)
const expectedDirect:any={
  [ids[0]]:['DE-BB/SekI/','DE-BE/SekI/'],
  [ids[1]]:['DE-SN/SekI/','DE-TH/SekI/'],
  [ids[2]]:['DE-ST/SekII/GK','DE-ST/SekII/LK'],
  [ids[3]]:['DE-MV/SekI/','DE-ST/SekII/GK','DE-ST/SekII/LK'],
  [ids[4]]:['DE-MV/SekI/'],
  [ids[5]]:['DE-MV/SekI/','DE-SN/SekI/','DE-ST/SekII/GK','DE-ST/SekII/LK','DE-TH/SekI/'],
  [ids[6]]:['DE-TH/SekI/'],
}
const direct=ids.map((id:string)=>{
  const actual=atlas.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).map((s:any)=>s.key).sort()
  assert(same(actual,expectedDirect[id].sort()),'New direct source applicability mismatch '+id)
  const witnesses=atlas.receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===id))
  assert(witnesses.every((w:any)=>w.coverage==='direct'&&w.profileBasis==='source-metadata'),'Indirect scope promoted to direct')
  return {goalId:id,actualDirectSourceScopes:actual,directWitnessCount:witnesses.length,verdict:'KEEP'}
})
const resourceDigests:any={}
for (const r of qa.records) if(r.visualizationState==='available'&&r.publicAssetPath)resourceDigests[r.imageUrl]='sha256:'+createHash('sha256').update(bytes(r.publicAssetPath)).digest('hex')
const bookConfig=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
const build=(a:any,c:any,k:any,q:any)=>{
  const manifest=JSON.parse(a.outputs[bookConfig.compositionViewManifestPath])
  return buildGoalBookModel({landscape:c,semanticKindLedger:k,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(a.outputs[path])})),navigationView:JSON.parse(a.outputs[manifest.navigationViewPath]),durationModelPolicy:read(config.durationModelPolicyPath),goalVisualizationQa:q,goalVisualizationAssetDigests:resourceDigests,evidenceReviewSources:[],config:bookConfig})
}
const oldBook=build(oldAtlas,oldCanonical,oldKinds,oldQA)
const book=build(atlas,canonical,kinds,qa)
const currentGoals=new Map(canonical.goals.map((g:any)=>[g.id,g]))
const currentPages=new Map(book.pages.map((p:any)=>[p.goalId,p]))
const oldPages=oldBook.pages.map((p:any)=>{const actual:any=currentPages.get(p.goalId);assert(actual&&actual.goalFingerprint===p.goalFingerprint&&actual.pageFingerprint===p.pageFingerprint,'Historical native page changed '+p.goalId);return{goalId:p.goalId,goalFingerprintExact:true,pageFingerprintExact:true}})
assert(oldBook.pages.length===383&&book.pages.length===390,'Native page count differs')
const frozenBook=read(prep+'qa-artifacts/full-390.book-model.json')
const reviewedDModel=read(prep+'bundle/book-model.json')
const activeDModel=read(candidate+'native-d-seven/bundle/book-model.json')
assert(same(activeDModel,reviewedDModel),'Actual registered native D model differs from personally viewed frozen D bundle')
const positiveRows=bytes(candidate+'positive.seven.independent-current.review.jsonl').toString().trim().split('\n').map(s=>JSON.parse(s))
const seven=ids.map((id:string)=>{
  const goal:any=currentGoals.get(id);const page:any=currentPages.get(id)
  const reviewed=dinput.goals.find((r:any)=>r.goalId===id)
  const original=frozenBook.pages.find((p:any)=>p.goalId===id)
  assert(same(buildGoalDescriptionCanonicalContext(goal),reviewed.canonicalContext),'Active D canonical context differs '+id)
  assert(page.goalFingerprint===original.goalFingerprint&&page.pageFingerprint===original.pageFingerprint,'Active final page differs '+id)
  const resolution=read(candidate+'native-d-seven/resolutions/'+id+'.resolution.json')
  const dPage=activeDModel.pages.find((p:any)=>p.goalId===id)
  assert(resolution.decision==='keep_current'&&resolution.status==='resolved'&&resolution.goal.goalFingerprint===dPage.goalFingerprint&&resolution.goal.pageFingerprint===dPage.pageFingerprint&&resolution.goal.goalFingerprint===page.goalFingerprint,'Active native D resolution mismatch')
  const p=positiveRows.find((r:any)=>r.goalId===id)
  assert(p.goalFingerprint===fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')&&p.reviewInputFingerprint===fingerprintPositiveGoalEvidenceReviewInput(goal,p.reviewCriteriaFingerprint,resourceDigests,'curricularAtomic'),'Active P fingerprints differ')
  assert(validatePositiveGoalEvidenceRecordSemantics(p,goal,resourceDigests,'curricularAtomic').length===0,'Active native P semantic validation')
  assert(p.status==='needs_human_review'&&p.reviewAuthority==='ai_candidate'&&p.evidenceLevel==='E1'&&p.maximumClaimScope==='G1','Inflated current P claim')
  assert(kinds.decisions.find((r:any)=>r.goalId===id)?.sourceFingerprint===fingerprintSemanticKindSourceGoal(goal),'Active semantic source binding')
  return{goalId:id,actualFinalNativePageExact:true,actualDContextExact:true,actualDResolutionPageAndGoalBindingsExact:true,actualPNativeSemanticAndImageBindingValid:true,humanReviewPending:true,verdict:'KEEP'}
})
const normalized=normalizeCanonicalLandscape(canonical)
const graph=new Map(normalized.goals.map(g=>[g.id,g]))
const views=[]
for (const [name,snapshot] of [['de-de-gym-seki-biology.view.json','06-de-de-gym-seki-biology.view.json'],['de-de-gym-biology-gk.view.json','07-de-de-gym-biology-gk.view.json']]) {
  const previous=read(own+'before/'+snapshot)
  const active=read('curricula/DE/Gymnasium/composition-views/biologie/'+name)
  assert(same(active,read(candidate+'views/'+name)),'Active GUI differs from independently reviewed candidate')
  const previousRoles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(previous).rootNodes,graph)
  const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(active).rootNodes,graph)
  assert([...previousRoles.targetGoalIds].every(id=>roles.targetGoalIds.has(id)),'Old GUI target lost')
  const added=[...roles.targetGoalIds].filter(id=>!previousRoles.targetGoalIds.has(id))
  assert(same(added.sort(),(previous.scope.stage==='SekI'?ids.filter((id:string)=>id!==ids[2]):ids).sort()),'Stage-specific GUI additions differ')
  const findings=compileCompositionView(normalizeCompositionView(active),normalized).findings.filter(f=>f.severity==='error')
  assert(findings.length===0,'Native GUI compilation error')
  views.push({view:name,oldTargets:previousRoles.targetGoalIds.size,newTargets:roles.targetGoalIds.size,addedTargets:added,oldTargetsPreserved:true,nativeCompilationErrors:[],STPointGoalExcludedFromSekI:previous.scope.stage==='SekI'?!roles.targetGoalIds.has(ids[2]):null})
}
const output={schemaVersion:1,createdAtUTC:new Date().toISOString(),verdict:'KEEP',nativeSourceCounts:atlas.receipt.counts,oldNativeSourceCounts:oldAtlas.receipt.counts,sourceScopes:scopes,directSourceApplicability:direct,nativeBookCounts:[oldBook.pages.length,book.pages.length],old383NativeGoalAndPageFingerprints:oldPages,sevenFinalNativeBindings:seven,completeGUIViews:views,allActualInputs:[...bindings.values()],fullPDFRebuilt:false,activeWrites:false,peerAOutputsRead:false,humanApproval:false,humanTrial:false,centralFullCheckPerformedByThisReviewer:false}
writeFileSync(resolve(own+'native-active-contexts-and-scopes.independent-b.actual.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({verdict:'KEEP',source:atlas.receipt.counts,nativeBookPages:[oldBook.pages.length,book.pages.length],old383PageFingerprintsExact:true,sevenActualDPImageBindingsExact:true,GUI:views.map(v=>[v.oldTargets,v.newTargets])}))
