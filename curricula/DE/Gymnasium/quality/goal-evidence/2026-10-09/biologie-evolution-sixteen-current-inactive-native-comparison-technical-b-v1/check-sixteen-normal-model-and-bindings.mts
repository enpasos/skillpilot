// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { buildGoalBookModel, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts'
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const o = base + 'biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1/'
const n = base + 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1/'
const nb = base + 'biologie-evolution-current17-and-protected-contexts-native-independent-b-v1/'
const a = base + 'biologie-evolution-three-HE-partial-edge-scope-remediation-author-v1/'
const read = (p:string):any => JSON.parse(readFileSync(p,'utf8'))
const write = (p:string,x:any) => writeFileSync(o+p, JSON.stringify(x,null,2)+'\n')
const sha = (x:Buffer|string) => 'sha256:'+createHash('sha256').update(x).digest('hex')
const technicalFirst = read(o+'sixteen-technical-input-FIRST.freeze.json')
for(const binding of technicalFirst.inputBindings) assert.equal(sha(readFileSync(binding.path)),binding.sha256)
const selected = new Set<string>(technicalFirst.selected16GoalIds)
const config = read(o+'candidate/source-atlas.current479-394.only16.inputs.json')
const atlas = buildGoalBookSourceAtlasInputs(config,'.')
assert.equal(atlas.receipt.counts.canonicalCurricularAtomicGoals,394)
assert.equal(atlas.receipt.counts.publishedCurricularAtomicGoals,394)
assert.equal(atlas.receipt.counts.unresolvedSourceScopeDecisions,0)
const originalAtlas = buildGoalBookSourceAtlasInputs(read(a+'candidate/source-atlas.current479-394-three-HE-partial-edges.inputs.json'),'.')
const atlasChanges = Object.keys(atlas.outputs).filter(p => atlas.outputs[p]!==originalAtlas.outputs[p])
assert.ok(atlasChanges.every(p=>p.endsWith('source-projection.receipt.json')))
const book = read(o+'candidate/book.current394.only16.inactive.config.json')
const canon = read(book.landscapePath), kinds = read(book.semanticKindLedgerPath), qa=read(book.goalVisualizationQaPath)
const manifest = JSON.parse(atlas.outputs[config.manifestPath])
const rasterBindings=read(n+'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json').rasterBindings
const digests:Record<string,string>={}
for(const row of qa.records) if(row.visualizationState==='available') {
  // Future active URLs remain unchanged; the real source bytes are still inactive.
  const actualFile=selected.has(row.goalId)?rasterBindings.find((x:any)=>x.goalId===row.goalId).portableAlias.path:row.publicAssetPath
  const digest=sha(readFileSync(actualFile));assert.equal(digest,row.assetSha256);digests[row.imageUrl]=digest
}
const model=buildGoalBookModel({landscape:canon,semanticKindLedger:kinds,goalVisualizationQa:qa,
  goalVisualizationAssetDigests:digests,compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:JSON.parse(atlas.outputs[p])})),
  navigationView:JSON.parse(atlas.outputs[manifest.navigationViewPath]),durationModelPolicy:read(manifest.durationModelPolicyPath),
  evidenceReviewSources:[],config:book})
parseAndValidateGoalBookModel(model)
assert.equal(canon.goals.length,479);assert.equal(model.pages.length,394)
write('candidate/full394-only16-corrected-source.model.json',model)
const reviewed18=read(n+'native/full394.eighteen-raster-source7-candidate.book-model.json')
const baseline=read(n+'native/full394.current-before.actual-loader.book-model.json')
const oldCanon=read(n+'candidate/canonical.current479.eighteen-reviewed-raster.inactive.json')
const currentGoals=new Map<string,any>(canon.goals.map((g:any)=>[g.id,g]))
const oldGoals=new Map<string,any>(oldCanon.goals.map((g:any)=>[g.id,g]))
const reviewedDelta=reviewed18.pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(model.pages.find(q=>q.goalId===p.goalId))).map((p:any)=>p.goalId)
assert.deepEqual(reviewedDelta.sort(),technicalFirst.excludedUnchangedGoalIds.toSorted())
const baselineDelta=baseline.pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(model.pages.find(q=>q.goalId===p.goalId))).map((p:any)=>p.goalId)
assert.equal(baselineDelta.length,17)
assert.deepEqual(baselineDelta.toSorted(),[...selected,'2ae2da43-73d5-578f-84f4-be0585a7d8f9'].toSorted())
for(const id of technicalFirst.excludedUnchangedGoalIds) {
  assert.deepEqual(model.pages.find(p=>p.goalId===id),baseline.pages.find((p:any)=>p.goalId===id))
  assert.deepEqual(currentGoals.get(id),read(technicalFirst.inputBindings[0].path).goals.find((g:any)=>g.id===id))
}
const rows:any[]=[]
for(const selection of ['evolution17','protected-source-contexts']) {
  const input=read(n+'native-subsets/'+selection+'/round-b/description-review-input.json')
  for(const template of input.goals) {
    if(selection==='evolution17'&&!selected.has(template.goalId))continue
    const make=(wholeModel:any,goal:any)=>{
      const page=wholeModel.pages.find((p:any)=>p.goalId===template.goalId)
      const p=Object.fromEntries(Object.keys(template.reviewContext.page).filter(k=>k!=='pageFingerprint').map(k=>[k,page[k]]))
      p.pageFingerprint=fingerprintGoalDescriptionReviewPage(p as any)
      const native={...template,goalFingerprint:page.goalFingerprint,pageFingerprint:p.pageFingerprint,
        currentTitleDe:goal.title,currentTitleEn:goal.titleEn,currentDescriptionDe:goal.description,currentDescriptionEn:goal.descriptionEn,
        canonicalContext:buildGoalDescriptionCanonicalContext(goal),reviewContext:{page:p,evidenceProfile:template.reviewContext.evidenceProfile}}
      return {wholeNativeInput:native,pageFingerprint:p.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(native as any)}
    }
    const prior=make(reviewed18,oldGoals.get(template.goalId)),current=make(model,currentGoals.get(template.goalId))
    assert.deepEqual(prior,current)
    rows.push({goalId:template.goalId,selection,exactSamePreviouslyActuallyReviewedWholeNativePageAndContext:true,
      pageFingerprint:current.pageFingerprint,goalReviewContextFingerprint:current.goalReviewContextFingerprint,
      wholeCurrentNativeInput:current.wholeNativeInput,newScientificReviewClaimed:false})
  }
}
assert.equal(rows.length,31)
const originalSubset17=read(n+'native-subsets/evolution17/book-model.json')
console.log('STAGE whole394 model and31 global contexts checked; computing normal subset17')
const originalInput17=read(n+'native-subsets/evolution17/round-b/description-review-input.json')
const same17GoalIds=originalInput17.goals.map((g:any)=>g.goalId)
const currentSubset17=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:same17GoalIds,
  bookId:originalSubset17.book.id,title:originalSubset17.book.title})
const currentSubset16=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:[...selected],
  bookId:'biologie-evolution-only16-current-inactive-technical-b-v1',title:'Biologie: Evolution –16 inaktive aktuelle Prüfseiten'})
parseAndValidateGoalBookModel(currentSubset17);parseAndValidateGoalBookModel(currentSubset16)
console.log('STAGE normal current17 and16 subsets validated')
write('candidate/native16.actual-normal-subset.model.json',currentSubset16)
const subsetComparisons=originalInput17.goals.filter((g:any)=>selected.has(g.goalId)).map((template:any)=>{
  const make=(subset:any)=>{
    const page=subset.pages.find((p:any)=>p.goalId===template.goalId)
    const p=Object.fromEntries(Object.keys(template.reviewContext.page).filter(k=>k!=='pageFingerprint').map(k=>[k,page[k]]))
    p.pageFingerprint=fingerprintGoalDescriptionReviewPage(p as any)
    const g={...template,pageFingerprint:p.pageFingerprint,canonicalContext:buildGoalDescriptionCanonicalContext(currentGoals.get(template.goalId)),
      reviewContext:{page:p,evidenceProfile:template.reviewContext.evidenceProfile}}
    return {nativeInput:g,pageFingerprint:p.pageFingerprint,goalReviewContextFingerprint:fingerprintGoalDescriptionReviewContext(g as any)}
  }
  const sameScope=make(currentSubset17),sixteen=make(currentSubset16)
  assert.deepEqual(sameScope.nativeInput,template)
  const changes=Object.keys(template.reviewContext.page).filter(k=>stableGoalBookJson(template.reviewContext.page[k])!==stableGoalBookJson(sixteen.nativeInput.reviewContext.page[k]))
  assert.ok(changes.every(k=>['pageNumber','navigationOrder','treeOrder','pageFingerprint','requires','reverseRequires','externalRequires','externalReverseRequires'].includes(k)))
  // The ordinary subset builder changes printed page coordinates, and turns
  // the omitted Hox reverse link into a canonical external link. The whole
  // goal relation universe, title, and canonical targets must stay exact.
  const relationUniverse=(page:any,kind:string)=>[...(page[kind]??[]),...(page['external'+kind[0].toUpperCase()+kind.slice(1)]??[])]
    .map((r:any)=>({goalId:r.goalId,title:r.title})).sort((x:any,y:any)=>x.goalId.localeCompare(y.goalId))
  for(const kind of ['requires','reverseRequires'])assert.deepEqual(relationUniverse(template.reviewContext.page,kind),relationUniverse(sixteen.nativeInput.reviewContext.page,kind))
  const actualChangedFieldBodies=Object.fromEntries(changes.map(k=>[k,{before:template.reviewContext.page[k],after:sixteen.nativeInput.reviewContext.page[k]}]))
  return {goalId:template.goalId,exactOriginalActuallyViewedNative17GoalInputRetained:true,
    originalPageFingerprint:template.pageFingerprint,originalContextFingerprint:fingerprintGoalDescriptionReviewContext(template),
    current16PageFingerprint:sixteen.pageFingerprint,current16ContextFingerprint:sixteen.goalReviewContextFingerprint,
    current16SubsetPresentationCoordinateAndInternalExternalReferenceFieldsChanged:changes,
    actualChangedFieldBodies,canonicalRelationGoalIdAndTitleUniversesUnchanged:true,newScientificReviewClaimed:false}
})
const originalSubset15=read(n+'native-subsets/protected-source-contexts/book-model.json')
console.log('STAGE actual Native17 per-goal contexts compared; computing protected15 subset')
const originalInput15=read(n+'native-subsets/protected-source-contexts/round-b/description-review-input.json')
const currentSubset15=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:originalInput15.goals.map((g:any)=>g.goalId),
  bookId:originalSubset15.book.id,title:originalSubset15.book.title})
for(const template of originalInput15.goals)assert.deepEqual(currentSubset15.pages.find(p=>p.goalId===template.goalId),originalSubset15.pages.find((p:any)=>p.goalId===template.goalId))
console.log('STAGE native protected15 pages exact')
const protectedProof=read(nb+'protected15.normal-page-and-whole-native-context-fingerprints.exact.json')
assert.equal(protectedProof.unchangedProtectedContexts,14)
const ownP=read(o+'candidate/P16.inactive.config.json')
const records=readFileSync(ownP.reviewPath,'utf8').trim().split('\n').map(x=>JSON.parse(x))
const oldRecords=readFileSync(nb+'ordinary-P17/P17.independent-b.candidate.review.jsonl','utf8').trim().split('\n').map(x=>JSON.parse(x))
const criteria=sha(readFileSync(ownP.reviewCriteriaPath))
const positive=records.map((r:any)=>{
  const goal=currentGoals.get(r.goalId),old=oldRecords.find((x:any)=>x.goalId===r.goalId),raster=rasterBindings.find((x:any)=>x.goalId===r.goalId)
  const resources={[raster.resourceLinkCandidate.url]:raster.portableAlias.sha256}
  assert.deepEqual(r.profile,old.profile)
  assert.equal(r.goalFingerprint,fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'))
  assert.equal(r.reviewInputFingerprint,fingerprintPositiveGoalEvidenceReviewInput(goal,criteria,resources,'curricularAtomic'))
  assert.equal(r.profileFingerprint,fingerprintPositiveGoalEvidenceProfile(r.profile))
  assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(r,goal,resources,'curricularAtomic'),[])
  return {goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,
    actualFingerprintChangeFromOwnNativeP17:false,status:r.status,reviewAuthority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope}
})
assert.equal(positive.length,16)
const registry=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const bio=registry.subjects.find((s:any)=>s.subject==='biologie')
const protectedIds=new Set<string>(originalInput15.goals.map((g:any)=>g.goalId))
const activeCanonical=read(technicalFirst.inputBindings[0].path)
for(const id of protectedIds)assert.deepEqual(currentGoals.get(id),activeCanonical.goals.find((g:any)=>g.id===id))
const protectedP= bio.positiveEvidenceConfigPaths.filter((path:string)=>read(path).scope.goalIds.some((id:string)=>protectedIds.has(id))).map((path:string)=>{
  console.log('STAGE ordinary preserved P config '+path)
  const result=reviewPositiveGoalEvidenceConfig(path)
  assert.deepEqual(result.errors,[])
  const affected=result.records.filter((r:any)=>protectedIds.has(r.goalId))
  return {configPath:path,ordinaryUnmodifiedConfigScopeCount:result.config.scope.goalIds.length,ordinaryErrors:result.errors,
    affectedProtectedRows:affected.map((r:any)=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,
      profileFingerprint:r.profileFingerprint,status:r.status,reviewAuthority:r.reviewAuthority,
      exactExistingWholeGoalAndAllResourceBindingsPreserved:true,newScientificReviewClaimed:false}))}
})
assert.equal(protectedP.flatMap((x:any)=>x.affectedProtectedRows).length,15)
write('normal-full394-exact16-native31-and-P16.actual.json',{schemaVersion:1,license:'CC-BY-4.0',actualExitCode:0,
  selected16GoalIds:[...selected],heldUnchangedGoalIds:technicalFirst.excludedUnchangedGoalIds,
  ordinarySourceAtlasCounts:atlas.receipt.counts,sourceAtlasTechnicalOutputChanges:atlasChanges,
  complete394PageDeltaVsActuallyReviewed18:reviewedDelta,complete394PageDeltaVsActiveBaseline:baselineDelta,
  additionalUnreviewedNativePageOrSemanticContextChanges:[],normalWholeNative31ContextComparisons:rows,
  protected14ExactReuseFromActiveBaseline:true,protected2ae2CurrentNative15EvidenceExactlyReused:true,
  actualOriginalNative17InputVsCurrent16OrdinarySubsetComparisons:subsetComparisons,
  actualOriginalNative15PageContextUnchangedAfterExactly16Images:true,
  normalP16CurrentFingerprintsAndWholeProfiles:positive,
  protected15OrdinaryExistingPConfigChecksAndPreservedFingerprints:protectedP,
  subsetCampaignBindingWarning:'A newly exported16-only native bundle would change book/bundle/campaign/batch bindings and relative pagination; reuse of whole394 per-goal semantics is established, not a ready16-round artifact.',
  fullHEmandatoryElectiveCourseApproval:false,wholeSourceApproval:false,newScientificReviewClaimed:false,
  strictGain:0,activeWrites:0,humanApproval:false})
console.log('PASS full394 model: only16 resources,479 goals; 16 evolution+15 protected native contexts exactly reviewed; 14 original contexts reusable / 2ae2 current existing evidence; P16 unchanged; heldHox,parent exactbaseline; source394/0 unresolved; strictGain0')
