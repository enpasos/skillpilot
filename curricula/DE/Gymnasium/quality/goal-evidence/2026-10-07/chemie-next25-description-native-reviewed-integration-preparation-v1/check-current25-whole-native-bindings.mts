// SPDX-License-Identifier: Apache-2.0
// Read-only binding verification by a technical synthesizer, not another subject review.
import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const root=process.cwd()
const own=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-next25-description-native-reviewed-integration-preparation-v1')
const base=join(root,'curricula/DE/Gymnasium/quality/goal-evidence')
const v2=join(base,'2026-10-06/chemie-next-coherent-current-gap-native-author-v2')
const v3=join(base,'2026-10-07/chemie-next25-orbital-nano-targeted-author-v3')
const orbital='0acc8cd2-be6d-567e-a023-1d9e90475510'
const nano='5e2eb826-6e60-5273-91d6-c23f6dfa33b1'
const {stableGoalBookJson,parseAndValidateGoalBookModel}=await import(pathToFileURL(join(root,'app/scripts/goalBookModel.ts')).href)
const {buildGoalDescriptionCanonicalContext}=await import(pathToFileURL(join(root,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const {fingerprintGoalDescriptionReviewContext}=await import(pathToFileURL(join(root,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const {fingerprintGoalForEvidence}=await import(pathToFileURL(join(root,'app/scripts/goalEvidenceProfileModel.ts')).href)
const rawHash=(bytes:any)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const read=async(p:string)=>JSON.parse(await readFile(p,'utf8'))
const rel=(p:string)=>p.slice(root.length+1)
const binding=async(p:string)=>{const b=await readFile(p);return {path:rel(p),sha256:rawHash(b),bytes:b.length}}
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const requireSame=(a:any,b:any,n:string)=>assert(same(a,b),n)
const inputs:any[]=[]
for(const g of ['twenty','five'])inputs.push(...(await read(join(v2,'native-d-'+g+'/round-a/description-review-input.json'))).goals)
const currentOne=(await read(join(v3,'native-d-one-orbital-final-current/round-a/description-review-input.json'))).goals[0]
const selected=inputs.map(g=>g.goalId)
assert.equal(selected.length,25);assert.equal(new Set(selected).size,25)
const oldCanonPath=join(v2,'canonical.final-png-current.author-candidate.json')
const currentCanonPath=join(v3,'canonical.targeted-final-complete-alttext.candidate.json')
const oldModelPath=join(v2,'qa-artifacts/full-prospective378.book-model.json')
const currentModelPath=join(v3,'full378.targeted-final-complete-alttext.book-model.json')
const oldCanon=await read(oldCanonPath),currentCanon=await read(currentCanonPath)
const oldModel=parseAndValidateGoalBookModel(await read(oldModelPath)),currentModel=parseAndValidateGoalBookModel(await read(currentModelPath))
const oldById=new Map(oldCanon.goals.map((g:any)=>[g.id,g])),currentById=new Map(currentCanon.goals.map((g:any)=>[g.id,g]))
const oldPage=new Map(oldModel.pages.map((p:any)=>[p.goalId,p])),currentPage=new Map(currentModel.pages.map((p:any)=>[p.goalId,p]))
assert.equal(oldCanon.goals.length,479);assert.equal(currentCanon.goals.length,479)
assert.equal(oldModel.pages.length,378);assert.equal(currentModel.pages.length,378)
requireSame(oldCanon.goals.map((g:any)=>g.id),currentCanon.goals.map((g:any)=>g.id),'whole479 ID/order')
requireSame(oldModel.pages.map((p:any)=>p.goalId),currentModel.pages.map((p:any)=>p.goalId),'whole378 page ID/order')
requireSame(oldModel.navigation,currentModel.navigation,'whole navigation');requireSame(oldModel.chapters,currentModel.chapters,'whole chapters')
const changedWholeGoals=oldCanon.goals.filter((g:any)=>!same(g,currentById.get(g.id))).map((g:any)=>g.id)
requireSame(changedWholeGoals.sort(),[orbital,nano].sort(),'only real orbital/nano whole-goal deltas')
const changedWholePages=oldModel.pages.filter((p:any)=>!same(p,currentPage.get(p.goalId))).map((p:any)=>p.goalId)
requireSame(changedWholePages,[orbital],'only orbital native full page delta')
for(const g of oldCanon.goals){const c:any=currentById.get(g.id);requireSame(g.requires,c.requires,'all479 requires '+g.id);requireSame(g.contains,c.contains,'all479 contains '+g.id)}
const rawV2=await read(join(v2,'actual-final-current25-whole-native-review-inputs.author.raw.json'))
const rawV2ById=new Map(rawV2.wholeCurrent25CandidateNativeRows.map((r:any)=>[r.goalId,r]))
const finalKind=await read(join(v3,'semantic-kinds.targeted-final-native-bindings.candidate.json'))
const kind=new Map(finalKind.decisions.map((d:any)=>[d.goalId,d.semanticKind]))
const rows:any[]=[]
for(const gid of selected){
  const previous=inputs.find(g=>g.goalId===gid),reviewed=gid===orbital?currentOne:previous
  const actual:any=currentById.get(gid),before:any=oldById.get(gid),page:any=currentPage.get(gid),raw:any=rawV2ById.get(gid)
  assert(actual&&page&&raw)
  const actualGoalFP=fingerprintGoalForEvidence(actual,'goal-evidence-v1',kind.get(gid))
  assert.equal(actualGoalFP,page.goalFingerprint,gid+' current model goal FP')
  assert.equal(actualGoalFP,reviewed.goalFingerprint,gid+' actual reviewed current goal FP')
  assert.equal(actual.title,reviewed.currentTitleDe);assert.equal(actual.titleEn,reviewed.currentTitleEn)
  assert.equal(actual.description,reviewed.currentDescriptionDe);assert.equal(actual.descriptionEn,reviewed.currentDescriptionEn)
  requireSame(buildGoalDescriptionCanonicalContext(actual),reviewed.canonicalContext,gid+' complete native canonical context')
  const currentNativeBoundInput={...reviewed,currentTitleDe:actual.title,currentTitleEn:actual.titleEn,currentDescriptionDe:actual.description,currentDescriptionEn:actual.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(actual)}
  requireSame(currentNativeBoundInput,reviewed,gid+' whole native input against real current canonical')
  const fp=fingerprintGoalDescriptionReviewContext(currentNativeBoundInput)
  assert.equal(fp,fingerprintGoalDescriptionReviewContext(reviewed))
  if(gid!==orbital){requireSame(oldPage.get(gid),page,gid+' whole full378 page reuse');requireSame(previous,reviewed,gid+' whole original native input reuse')}
  if(gid!==orbital&&gid!==nano)requireSame(before,actual,gid+' whole current goal reuse')
  if(gid===nano){const a=structuredClone(before),b=structuredClone(actual);delete a.extendedData.provenance.sourceRef;delete b.extendedData.provenance.sourceRef;requireSame(a,b,'nano ONLY provenance sourceRef delta')}
  const sourceBindings=raw.sourceBindings
  const checkedSources:any[]=[]
  for(const entry of [...sourceBindings.actualPrimaryOriginals,...sourceBindings.actualPrimaryRasters,...(sourceBindings.actualSecondaryConfirmation?[sourceBindings.actualSecondaryConfirmation]:[]),sourceBindings.actualPrimaryFetchAndPageExtractionReceipt]){
    if(!entry)continue;const b=await binding(join(root,entry.path));assert.equal(b.sha256,entry.sha256);assert.equal(b.bytes,entry.bytes);checkedSources.push(b)
  }
  const raster=raw.actualRaster
  const sourceBinding=raster.sourceFreezeBinding??{path:rel(join(root,'app/public',raster.publicPath)),sha256:raster.sourceSha256}
  const actualRaster=await binding(join(root,sourceBinding.path));assert.equal(actualRaster.sha256,sourceBinding.sha256);assert.equal(actualRaster.sha256,page.visualization.originalDigest)
  assert.equal(reviewed.reviewContext.page.visualization.originalDigest,page.visualization.originalDigest)
  const deltaFields=Object.keys({...before,...actual}).filter(k=>!same(before[k]??null,actual[k]??null))
  rows.push({goalId:gid,wholeOriginalV2Goal:before,wholeFinalV3Goal:actual,actualWholeGoalDeltaFields:deltaFields,wholeGoalExactToV2:same(before,actual),wholeOriginalFull378Page:oldPage.get(gid),wholeFinalFull378Page:page,wholeFull378PageExactToV2:same(oldPage.get(gid),page),wholeReviewedNativeInput:reviewed,wholeNativeInputExactAgainstCurrentCanonical:true,nativeReviewContextFingerprint:fp,actualCurrentGoalFingerprint:actualGoalFP,derivativePageFingerprint:reviewed.pageFingerprint,full378PageFingerprint:page.pageFingerprint,derivativePageFPDiffersFromFull:reviewed.pageFingerprint!==page.pageFingerprint,sourceRefBefore:before.sourceRef??null,sourceRefFinal:actual.sourceRef??null,wholeExtendedDataBefore:before.extendedData??null,wholeExtendedDataFinal:actual.extendedData??null,originalBoundedPrimaryScope:raw.boundedPrimaryScope,actualUnchangedPrimaryInputBindings:checkedSources,actualRasterBinding:actualRaster,wholeReviewedVisualization:reviewed.reviewContext.page.visualization,wholeFinalFull378Visualization:page.visualization,role:'technical binding verification, no new subject review'})
}
const nanoRaw=await read(join(v3,'one-orbital-and-one-nano-final-targeted.raw-review-input.json'))
const actualNano:any=currentById.get(nano)
assert.equal(actualNano.extendedData.provenance.sourceRef,nanoRaw.finalNanoSourceExtractionRow.sourceRef)
assert(nanoRaw.finalNanoSourceExtractionRow.sourceRef.endsWith('S. 14.'))
const orbitalRaw:any=currentById.get(orbital)
requireSame(orbitalRaw,nanoRaw.wholeFinalOrbital,'final exact current orbital wholegoal')
requireSame(currentOne.reviewContext.page.externalPrerequisites.map((r:any)=>r.goalId).sort(),orbitalRaw.requires.slice().sort(),'one-book two actual external prerequisites')
const actualBuildUps=currentCanon.goals.filter((g:any)=>(g.requires??[]).includes(orbital)).map((g:any)=>g.id).sort()
requireSame(currentOne.reviewContext.page.externalReverseRequires.map((r:any)=>r.goalId).sort(),actualBuildUps,'one-book five actual external buildup goals')
assert.equal(actualBuildUps.length,5)
const receipt={role:'technical_synthesizer current whole binding verifier',checkedAtUTC:new Date().toISOString(),status:'candidate',reviewAuthority:'ai_candidate',newIndependentScientificReviewRounds:0,currentCanonical:await binding(currentCanonPath),originalV2Canonical:await binding(oldCanonPath),currentFull378Model:await binding(currentModelPath),originalV2Full378Model:await binding(oldModelPath),all479IDsAndOrderExact:true,all479WholeEdgesExact:true,whole377Full378PagesExactToV2:true,changedWholeNativePageIds:changedWholePages,changedWholeCanonicalGoalIds:changedWholeGoals,selected25IDs:selected,selected24CompleteNativeInputsAndFullPagesReusedExactly:true,selected23WholeCanonicalGoalsExact:true,nanoWholeGoalChangedOnlyProvenanceSourceRef:true,nanoNativeDContextAndPageAndRasterExact:true,nanoBeforeSourceRef:(oldById.get(nano) as any).extendedData.provenance.sourceRef,nanoCurrentSourceRef:actualNano.extendedData.provenance.sourceRef,nanoCurrentExtractionRow:nanoRaw.finalNanoSourceExtractionRow,nanoLocatorCorrectionIsMetadataNotNewDScience:true,orbitalCurrentWholeGoalAndNativeInputExactToFinalSingleReview:true,orbitalTwoPrerequisiteIDs:orbitalRaw.requires,orbitalFiveBuildUpIDs:actualBuildUps,nativeSubsetPageFPDifferencesAreActualSubsetDerivativesNotProductErrors:true,rows,sourceBoundaries:{unresolvedSourceScopeDecisions:496,omittedWholeSourceGoals:19,fullSourceAtlasOrNationalSupersetApproved:false},otherGatesReviewed:false,humanApproval:false,humanTrial:false,activeWrites:0,activeStrictNetGain:0}
await writeFile(join(own,'actual-current25-whole-goal-native-page-context-source-raster-bindings.synthesizer.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({actualCurrentBoundGoals:rows.length,whole377PagesExact:true,whole23SelectedCanonicalGoalsExact:true,nanoOnlySourceMetadataDelta:true,orbitalNewActualD1:true,newScientificRounds:0,activeWrites:0}))
