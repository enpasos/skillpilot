// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson, fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel'
import { buildGoalDescriptionRolloutSubsetModel } from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch'
import { buildGoalDescriptionCanonicalContext } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionDualRoundResolution'
import { buildPositiveGoalEvidenceCandidateRecords } from '/home/enpasos/projects/skillpilot/app/scripts/materializePositiveGoalEvidenceCandidates'
import { positiveGoalEvidenceReviewInputPayload } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'

const root='/home/enpasos/projects/skillpilot', own=dirname(fileURLToPath(import.meta.url)), native=resolve(own,'isolated-repository')
const tracked=new Map<string,any>()
const binding=(p:string)=>{const bytes=readFileSync(p);return {path:relative(root,p),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}}
const read=(p:string)=>{tracked.set(p,binding(p));return JSON.parse(readFileSync(p,'utf8'))}
const jsonl=(p:string)=>{tracked.set(p,binding(p));return readFileSync(p,'utf8').split(/\r?\n/u).filter(Boolean).map(x=>JSON.parse(x))}
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
const copy=(p:string,q:string)=>{tracked.set(p,binding(p));mkdirSync(dirname(q),{recursive:true});copyFileSync(p,q);assert.equal(binding(q).sha256,binding(p).sha256)}
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const fields=(a:any,b:any)=>[...new Set([...Object.keys(a??{}),...Object.keys(b??{})])].filter(k=>!same(a?.[k],b?.[k]))
const guard=read(resolve(own,'external-declared-inputs.before-native-model.author.json'))
for(const b of guard.inputBindings)assert.deepEqual(binding(resolve(root,b.path)),b)
const ids:string[]=guard.selected21Ids, selected=new Set(ids)
const current=read(resolve(own,'inputs/current472.active-baseline.exact.json'))
const prior=read(resolve(own,'inputs/prior-stage02.current472.imageless-candidate.exact.json'))
const final=read(resolve(native,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))
const currentModel=read(resolve(own,'inputs/current390.book-model.exact.json'))
const priorModel=read(resolve(own,'inputs/prior-stage02.candidate390.book-model.exact.json'))
const neutralPrior=read(resolve(own,'inputs/prior-stage02.whole-neutral-input.exact.json'))
const importReceipt=read(resolve(own,'native-isolation-and-imports.actual.author.receipt.json'))
const pairedPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro21-paired-current-visual-synthesis-root-20261007-v1/twenty-one-exact-rasters-paired-visual-decisions.actual.receipt.json')
const paired=read(pairedPath)
copy(pairedPath,resolve(own,'inputs/current21-paired-visual-selection.exact.json'))
assert.equal(paired.entries.length,21)
assert.deepEqual([...paired.entries.map((r:any)=>r.goalId)].sort(),[...ids].sort())
for(const entry of paired.entries){
 const imported=importReceipt.selectedImages.find((r:any)=>r.goalId===entry.goalId)
 assert.deepEqual(imported.selectedUnchangedOriginalAsset,entry.asset)
 assert.ok(['KEEP','KEEP_after_targeted_regeneration'].includes(entry.pairedVisualDecision))
 assert.deepEqual(binding(resolve(root,entry.asset.path)),entry.asset)
}
const kindLedger=read(resolve(native,'inputs/semantic-kinds.final-image-candidate.json'))
const cg=new Map<string,any>(current.goals.map((g:any)=>[g.id,g])), pg=new Map<string,any>(prior.goals.map((g:any)=>[g.id,g])), fg=new Map<string,any>(final.goals.map((g:any)=>[g.id,g]))
assert.deepEqual(current.goals.map((g:any)=>g.id),final.goals.map((g:any)=>g.id))
for(const g of final.goals){assert.deepEqual(g.requires,cg.get(g.id).requires);assert.deepEqual(g.contains,cg.get(g.id).contains)}
for(const d of kindLedger.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(fg.get(d.goalId)))

// A single genuine full390 native model load with actual 95 private assets.
const build=await loadGoalBookBuildInputs('config/full-final390.book.config.json',native)
const finalModel=build.model
assert.equal(finalModel.pages.length,390)
assert.equal(finalModel.pages.filter((p:any)=>p.visualization!==null).length,95)
assert.deepEqual(finalModel.pages.map((p:any)=>p.goalId),currentModel.pages.map((p:any)=>p.goalId))
assert.deepEqual(finalModel.pages.map((p:any)=>p.goalId),priorModel.pages.map((p:any)=>p.goalId))
await writeGoalBookModel(finalModel,build.outputPath)
const cp=new Map<string,any>(currentModel.pages.map((p:any)=>[p.goalId,p])), pp=new Map<string,any>(priorModel.pages.map((p:any)=>[p.goalId,p])), fp=new Map<string,any>(finalModel.pages.map((p:any)=>[p.goalId,p]))
const input=(g:any,p:any)=>({goalId:g.id,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,currentTitleDe:g.title,currentTitleEn:g.titleEn,currentDescriptionDe:g.description,currentDescriptionEn:g.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(g),reviewContext:{page:p,evidenceProfile:null}})
const whole472=current.goals.map((c:any)=>{
 const p=pg.get(c.id),f=fg.get(c.id)
 const beforeSource={sourceRef:c.sourceRef??null,extendedData:c.extendedData??null,applicability:c.applicability??null}
 const priorSource={sourceRef:p.sourceRef??null,extendedData:p.extendedData??null,applicability:p.applicability??null}
 const finalSource={sourceRef:f.sourceRef??null,extendedData:f.extendedData??null,applicability:f.applicability??null}
 return {goalId:c.id,selected21:selected.has(c.id),wholeCurrentGoal:c,wholePriorStage02Goal:p,wholeFinalImageCandidateGoal:f,
  currentVsPriorWholeGoalExact:same(c,p),priorVsFinalWholeGoalExact:same(p,f),currentVsFinalWholeGoalExact:same(c,f),
  currentToPriorChangedFields:fields(c,p),priorToFinalChangedFields:fields(p,f),currentToFinalChangedFields:fields(c,f),
  sourceBindings:{current:beforeSource,priorStage02:priorSource,final:finalSource},priorVsFinalWholeSourceExact:same(priorSource,finalSource)}
})
assert.equal(whole472.filter((r:any)=>!r.selected21&&r.currentVsFinalWholeGoalExact).length,451)
assert.ok(whole472.filter((r:any)=>r.selected21).every((r:any)=>same(r.priorToFinalChangedFields,['resourceLinks'])))
assert.ok(whole472.every((r:any)=>r.priorVsFinalWholeSourceExact))
write(resolve(own,'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json'),{role:'technical whole-object comparison; no scientific coverage claim',rows:whole472})

const all390=currentModel.pages.map((c:any)=>{
 const p=pp.get(c.goalId),f=fp.get(c.goalId), ci=input(cg.get(c.goalId),c),pi=input(pg.get(c.goalId),p),fi=input(fg.get(c.goalId),f)
 return {goalId:c.goalId,selected21:selected.has(c.goalId),wholeCurrentPage:c,wholePriorStage02Page:p,wholeFinalNativePage:f,
  wholeCurrentDInput:ci,wholePriorStage02DInput:pi,wholeFinalDInput:fi,
  currentVsPriorWholePageExact:same(c,p),priorVsFinalWholePageExact:same(p,f),currentVsFinalWholePageExact:same(c,f),
  currentVsPriorDInputExact:same(ci,pi),priorVsFinalDInputExact:same(pi,fi),currentVsFinalDInputExact:same(ci,fi),
  currentToPriorPageChangedFields:fields(c,p),priorToFinalPageChangedFields:fields(p,f),
  nativeFingerprints:{current:{goal:c.goalFingerprint,page:c.pageFingerprint,context:fingerprintGoalDescriptionReviewContext(ci)},priorStage02:{goal:p.goalFingerprint,page:p.pageFingerprint,context:fingerprintGoalDescriptionReviewContext(pi)},final:{goal:f.goalFingerprint,page:f.pageFingerprint,context:fingerprintGoalDescriptionReviewContext(fi)}},
  imageBinding:{current:c.visualization,priorStage02:p.visualization,final:f.visualization}}
})
const protectedIds=read(resolve(own,'inputs/protected74.exact.json')).map((r:any)=>r.goalId)
const protectedRows=protectedIds.map((id:string)=>all390.find((r:any)=>r.goalId===id))
assert.equal(protectedRows.length,74)
assert.ok(protectedRows.every((r:any)=>r.currentVsFinalWholePageExact&&r.currentVsFinalDInputExact&&same(cg.get(r.goalId),fg.get(r.goalId))))
const unselectedChanged=all390.filter((r:any)=>!r.selected21&&!r.currentVsFinalWholePageExact)
assert.equal(unselectedChanged.length,1)
assert.ok(unselectedChanged[0].goalId.startsWith('9499943f'))
assert.ok(unselectedChanged[0].priorVsFinalWholePageExact&&unselectedChanged[0].priorVsFinalDInputExact)
assert.ok(same(cg.get(unselectedChanged[0].goalId),fg.get(unselectedChanged[0].goalId)))
assert.equal(all390.filter((r:any)=>!r.priorVsFinalWholePageExact).length,21)
write(resolve(own,'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json'),{role:'genuine native final model comparison with actual image digests; no atlas/country-source acceptance',
 currentModel:binding(resolve(own,'inputs/current390.book-model.exact.json')),priorModel:binding(resolve(own,'inputs/prior-stage02.candidate390.book-model.exact.json')),finalModel:binding(build.outputPath),
 all390OrderedPageIdsExact:true,protected74WholeGoalsPagesContextsAndImagesExact:true,protected74GoalIds:protectedIds,
 actualCurrentToFinalChangedPageIds:all390.filter((r:any)=>!r.currentVsFinalWholePageExact).map((r:any)=>r.goalId),
 actualPriorToFinalChangedPageIds:all390.filter((r:any)=>!r.priorVsFinalWholePageExact).map((r:any)=>r.goalId),
 oneUnselectedPriorContextDeltaRetained:unselectedChanged[0].goalId,
 bookLevelSourceBindings:{current:currentModel.source,priorStage02:priorModel.source,final:finalModel.source},rows:all390})

const subsets:any[]=[]
for(const [name,subsetIds] of [['twenty',ids.slice(0,20)],['one',ids.slice(20)]] as const){
 const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:finalModel,goalIds:[...subsetIds],bookId:priorModel.book.id.replace('current390','final-images-'+name),title:'Biologie – neuronale Informationsverarbeitung ('+subsetIds.length+' Ziele, endgültige Bildkandidaten)'})
 const output=resolve(own,'native-final-'+name+'/book-model.json')
 await writeGoalBookModel(subset,output)
 assert.equal(subset.pages.filter((p:any)=>p.visualization!==null).length,subsetIds.length)
 subsets.push({name,goalIds:subsetIds,model:subset,modelBinding:binding(output)})
}

// Current P bodies: exactly20 reused and only080b v4 replaced. Native materialization remains ai_candidate.
const pconfig=read(resolve(own,'candidate-scaffolds/positive21.final-image-candidate.config.json'))
const pspec=read(resolve(own,'candidate-scaffolds/positive21.final-image-candidate.spec.json'))
assert.deepEqual(pconfig.reviewedResourceTypes,[])
const precs=await buildPositiveGoalEvidenceCandidateRecords({config:pconfig,candidateSet:pspec})
writeFileSync(resolve(root,pconfig.reviewPath),precs.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const oldP=jsonl(resolve(own,'inputs/prior-stage02.positive-evidence.current21.actual.author-candidate.jsonl'))
const oldPMap=new Map(oldP.map((r:any)=>[r.goalId,r]))
const v4=read(resolve(own,'inputs/current080b.v4-whole-materials.exact.json'))
const pDeltas=precs.map((r:any)=>{
 const old=oldPMap.get(r.goalId),expected=r.goalId===v4.goalId?v4.completeProfile:old.profile
 assert.ok(same(r.profile,expected));assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.deepEqual(r.reviewRunIds,[])
 return {goalId:r.goalId,wholePriorRecord:old,wholeFinalTechnicalCandidateRecord:r,profileBodyExactToPrior:same(old.profile,r.profile),profileBodyExactToCurrentV4:r.goalId===v4.goalId?same(r.profile,v4.completeProfile):null,
  beforeReviewInputPayload:positiveGoalEvidenceReviewInputPayload(pg.get(r.goalId),old.reviewCriteriaFingerprint,{},'curricularAtomic'),
  finalReviewInputPayload:positiveGoalEvidenceReviewInputPayload(fg.get(r.goalId),r.reviewCriteriaFingerprint,{},'curricularAtomic'),
  imageHashBoundSeparatelyInNativePage:true,configuredNativePReviewedResourceTypes:[],scientificNewReviewer:false}
})
assert.equal(pDeltas.filter((r:any)=>r.profileBodyExactToPrior).length,20)
write(resolve(own,'all21-old-current-v4-final-native-P-material-profile-input-diffs.author.json'),{role:'technical native P candidate scaffold; no new scientific reviewer',old20ProfilesExact:true,only080bV4BodyReplacement:true,recordsRemainAiCandidates:true,nativeImageHashesInDPageAndRenderManifests:true,rows:pDeltas})

// Retain the actual current full390 A/M decisions and their eight view scopes. Images alter none of their native semantic fingerprint input fields.
const amRoot=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twelve-current-semantic-memory-independent-root-v2')
const normalize=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/gu,' ').trim()
const amPayload=(g:any,version:string)=>({ruleVersion:version,goalId:g.id,shortKey:g.shortKey??'',title:normalize(g.title),titleEn:normalize(g.titleEn),description:normalize(g.description),descriptionEn:normalize(g.descriptionEn),phase:normalize(g.dimensionTags?.phase),area:normalize(g.dimensionTags?.area),topicCode:normalize(g.dimensionTags?.topicCode),nodeKind:normalize(g.nodeKind)})
const amRows:any[]=[]
for(const kind of ['atomicity','memory']){
 const recordPath=resolve(amRoot,kind+'.full390.review.jsonl'), oldCfg=read(resolve(amRoot,kind+'.inert-current-candidate.config.json')), rows=jsonl(recordPath)
 copy(recordPath,resolve(own,'inputs/current-independent-'+kind+'.full390.exact.jsonl'))
 copy(resolve(amRoot,kind+'.inert-current-candidate.config.json'),resolve(own,'inputs/current-independent-'+kind+'.config.exact.json'))
 const cfg=structuredClone(oldCfg)
 cfg.landscapePath=relative(root,resolve(native,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'))
 cfg.reviewPath=relative(root,resolve(own,'candidate-scaffolds/current-content-'+kind+'.final-images.records.jsonl'))
 cfg.reportPath=relative(root,resolve(own,'candidate-scaffolds/current-content-'+kind+'.final-images.report.md'))
 copy(recordPath,resolve(root,cfg.reviewPath))
 if(kind==='memory'){
   copy(resolve(root,cfg.cardReviewPath),resolve(own,'inputs/current-independent-memory.cards.exact.jsonl'))
   cfg.cardReviewPath=relative(root,resolve(own,'inputs/current-independent-memory.cards.exact.jsonl'))
   for(const scope of cfg.visibilityScopes){tracked.set(resolve(root,scope.viewPath),binding(resolve(root,scope.viewPath)))}
   assert.equal(cfg.visibilityScopes.length,8)
 }
 write(resolve(own,'candidate-scaffolds/current-content-'+kind+'.final-images.config.json'),cfg)
 assert.equal(rows.length,390)
 for(const r of rows){
   const before=amPayload(pg.get(r.goalId),cfg.ruleVersion),after=amPayload(fg.get(r.goalId),cfg.ruleVersion)
   assert.ok(same(before,after)); const computed='sha256:'+createHash('sha256').update(stableGoalBookJson(after)).digest('hex')
   assert.equal(computed,r.fingerprint)
   amRows.push({kind,goalId:r.goalId,priorAndFinalNativeSemanticPayloadExact:true,storedFingerprint:r.fingerprint,calculatedFinalFingerprint:computed,wholeRecordUnmodified:true})
 }
}
write(resolve(own,'current390-AM-content-decisions-exact-technical-fingerprint-recalculation.author.json'),{role:'technical reproduction of unchanged native fingerprint input contract; no new A/M judgment',currentFull390AtomicityRecordsExact:true,currentFull390MemoryRecordsExact:true,currentEightMemoryViewScopesUnchanged:true,sourceHelperBindings:[binding(resolve(root,'app/scripts/semanticAtomicityReview.ts')),binding(resolve(root,'app/scripts/memoryCardReview.ts'))],records:amRows})

const imageMap=new Map(importReceipt.selectedImages.map((r:any)=>[r.goalId,r]))
const priorRawMap=new Map(neutralPrior.wholeCurrent21CandidateNativeRows.map((r:any)=>[r.goalId,r]))
const finalRows=ids.map(id=>{
 const subset=subsets.find(s=>s.goalIds.includes(id))!,page=subset.model.pages.find((p:any)=>p.goalId===id),priorRaw=priorRawMap.get(id)
 const ci=input(fg.get(id),page),pr=precs.find((r:any)=>r.goalId===id)!
 return {goalId:id,wholeCurrentGoal:cg.get(id),wholePriorStage02Goal:pg.get(id),wholeFinalImageCandidateGoal:fg.get(id),
  actualFullFinal390Page:fp.get(id),nativeFinalSubsetPage:page,nativeFinalSubsetDInput:ci,nativeFinalSubsetDContextFingerprint:fingerprintGoalDescriptionReviewContext(ci),
  nativeFinalSubsetName:subset.name,actualSubsetPageNumber:page.pageNumber,actualPdfPhysicalPageNumber:page.pageNumber+2,
  nativeSubsetDiffersFromFull390:true,sourceRefPrintedOnNativePage:false,
  actualFrozenSourceWitnessesUnmodified:priorRaw.actualFrozenSourceWitnesses,boundedOfficialPrimaryComponentsUnmodified:priorRaw.boundedOfficialPrimaryComponents,
  wholeOriginalSourceClosureUnmodified:priorRaw.wholeOriginalSourceClosure,
  positivePriorScientificProfileBody:oldPMap.get(id).profile,positiveCurrentFinalProfileBody:pr.profile,positiveFinalTechnicalCandidateRecord:pr,
  exactImageAuthorRoute:imageMap.get(id),sourceHOLDsRetained:true,wholeSourceApproval:false,
  noNewIndependentD_P_A_M_VReviewRecorded:true,humanApproval:false,humanTrial:false,newStrictCompletion:0}
})
write(resolve(own,'final21-whole-native-image-page-context-source-material-binding-review-input.author.raw.json'),{
 documentType:'neutral final21 native image/page/context/source/material binding inputs',role:'technical AUTHOR; no new scientific approvals',
 whole472Candidate:binding(resolve(native,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')),
 nativeFull390FinalModel:binding(build.outputPath),pairedCurrent21VisualSelectionExact:binding(pairedPath),whole472Diff:binding(resolve(own,'all472-whole-old-prior-final-goal-source-edge-image-diffs.author.json')),
 whole390PageContextDiff:binding(resolve(own,'all390-whole-old-prior-final-pages-contexts-images-diffs.author.json')),
 exactSelected21GoalIds:ids,records:finalRows,nativeSubsetModels:subsets.map(s=>({name:s.name,binding:s.modelBinding})),
 sourceHOLDsExact:binding(resolve(own,'inputs/source-HOLDs.exact.json')),
 currentIndependentAM390Continuity:binding(resolve(own,'current390-AM-content-decisions-exact-technical-fingerprint-recalculation.author.json')),
 currentVsFinalUnselected949ContextDeltaRetained:unselectedChanged[0].goalId,protected74WholeGoalsPagesContextsImagesExact:true,
 needTwoTargetedIndependentBindingReviews:true,noCountrySourceAtlasRebuild:true,noWholeSourceCoverageClaim:true,
 humanApproval:false,humanTrial:false,newStrictCompletion:0,activeWrites:false})
for(const [p,b]of tracked)assert.deepEqual(binding(p),b)
write(resolve(own,'native-full390-subsets-P-and-current-AM-preparation.actual.author.receipt.json'),{
 role:'technical author native preparation; not approval',nativeFull390ModelBuildCount:1,actualImageAssets:95,newSelectedImageAssets:21,existingProtectedImageAssets:74,
 nativeSubsetBuilds:[20,1],nativePRecordsMaterialized:21,positive20ProfileBodiesExact:true,current080bV4BodyExact:true,
 current390AandMContentRecordsExact:true,technicalAMFingerprintRecalculationRows:780,currentEightMemoryScopesUnchanged:true,
 finalPriorVsNewPagesChanged:21,finalCurrentVsNewPagesChanged:all390.filter((r:any)=>!r.currentVsFinalWholePageExact).length,
 protected74Exact:true,all451OutsideSelectedWholeGoalsExact:true,inputs:[...tracked.values()],
 fullNativeRenderPending:true,independentBindingReviewsPending:true,newScientificD_P_A_M_VJudgment:false,humanApproval:false,humanTrial:false,strictGain:0,activeWrites:false})
console.log(JSON.stringify({nativeFull390ModelBuilds:1,actualAssets:95,finalSelectedAssets:21,subsets:[20,1],nativeP:'21 author candidates',currentAM390:'whole records and native fingerprint payloads exact',protected74:'whole goals/pages/contexts/assets exact',unselected949:'prior context delta retained',strictGain:0,activeWrites:false}))
