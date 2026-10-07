// SPDX-License-Identifier: Apache-2.0
// Technical continuity probe; no scientific review, rendering or source approval.
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, chmodSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const own = dirname(fileURLToPath(import.meta.url))
const root = resolve(own, '../../../../../../..')
const base = dirname(own)
const read = (p:string) => JSON.parse(readFileSync(p,'utf8'))
const hash = (bytes:Buffer|string) => 'sha256:'+createHash('sha256').update(bytes).digest('hex')
const bind = (p:string) => ({path:relative(root,p),sha256:hash(readFileSync(p)),bytes:readFileSync(p).length})
const iso = read(resolve(own,'physical-isolation.receipt.json')).root
const modelHelpers = await import(pathToFileURL(resolve(iso,'app/scripts/goalBookModel.ts')).href)
const batchHelpers = await import(pathToFileURL(resolve(iso,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const sourceHelpers = await import(pathToFileURL(resolve(iso,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const contextHelpers = await import(pathToFileURL(resolve(iso,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const resolutionHelpers = await import(pathToFileURL(resolve(iso,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const evidenceHelpers = await import(pathToFileURL(resolve(iso,'app/scripts/goalEvidenceProfileModel.ts')).href)
const same = (a:any,b:any) => assert.equal(modelHelpers.stableGoalBookJson(a),modelHelpers.stableGoalBookJson(b))
const orig=resolve(base,'chemie-current-atomic-description-positive-gap-author-v1')
const v5=resolve(base,'chemie-current-coordinate-final-native-review-inputs-author-v5')
const v6=resolve(base,'chemie-current-aromatic-delocalization-final-native-author-v6')
const originalRaw=read(resolve(orig,'actual-current378-national359-subset15-page-source-context-bindings.json'))
const v5Raw=read(resolve(v5,'actual-one-delta-full378-and-fourteen-reuse.native-bindings.json'))
const originalCanonical=read(resolve(iso,originalRaw.actualCurrentWholeCanonical.path))
const fullCurrentPath=resolve(v6,'qa-artifacts/full-prospective378.book-model.json')
const fullCurrent=modelHelpers.parseAndValidateGoalBookModel(read(fullCurrentPath))
const currentCanonicalPath=resolve(v6,'prospective-current378.canonical.author-candidate.json')
const currentCanonical=read(currentCanonicalPath)
const oldGoals=new Map(originalCanonical.goals.map((g:any)=>[g.id,g]))
const currentGoals=new Map(currentCanonical.goals.map((g:any)=>[g.id,g]))
const currentPages=new Map(fullCurrent.pages.map((p:any)=>[p.goalId,p]))
assert.equal(fullCurrent.pages.length,378)
// The unchanged source helper uses the exact candidate in memory. Its original
// config remains byte-exact in the read-only copied production helper tree.
for(const p of [currentCanonicalPath,resolve(root,fullCurrent.source.semanticKindLedgerPath)]) {
 const dst=resolve(iso,relative(root,p))
 if(existsSync(dst)) assert.equal(hash(readFileSync(dst)),hash(readFileSync(p)))
 else {mkdirSync(dirname(dst),{recursive:true});copyFileSync(p,dst);chmodSync(dst,0o444)}
}
const atlasConfigPath=resolve(iso,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const originalAtlasConfig=read(atlasConfigPath)
const actualAtlasConfig={...originalAtlasConfig,landscapePath:relative(root,currentCanonicalPath),semanticKindLedgerPath:fullCurrent.source.semanticKindLedgerPath}
const atlas=sourceHelpers.buildGoalBookSourceAtlasInputs(actualAtlasConfig,iso)
const currentTargets=atlas.receipt.scopes.map((s:any)=>({key:s.key,count:s.goalIds.length,orderedGoalIds:s.goalIds,orderedDigest:hash(JSON.stringify(s.goalIds))}))
same(currentTargets,originalRaw.countryViewTargets)
const groups=read(resolve(own,'four-native-current-indices.actual.receipt.json')).groups
const currentAssetRoot='/tmp/skillpilot-chemie-native-v3-d1qwzf8r/app/public'
const continuityRows=[]
for(const group of groups) {
 const groupDir=dirname(resolve(root,group.index.path))
 const manifest=read(resolve(groupDir,'batch-manifest.json'))
 const cfg=read(resolve(root,manifest.configPath))
 const oldModel=modelHelpers.parseAndValidateGoalBookModel(read(resolve(groupDir,'bundle/book-model.json')))
 const actualCurrentSubset=batchHelpers.buildGoalDescriptionRolloutSubsetModel({baseModel:fullCurrent,goalIds:cfg.goalIds,bookId:cfg.bookId,title:cfg.title})
 const actualInput=read(resolve(groupDir,'round-a/description-review-input.json'))
 const html=read(resolve(groupDir,'bundle/book.html.render-manifest.json'))
 const pdf=read(resolve(groupDir,'bundle/book.pdf.render-manifest.json'))
 const existingResolutionByGoal=new Map(read(resolve(groupDir,'resolution-index.json')).resolutions.map((r:any)=>[r.goalId,r]))
 for(const gid of group.strictGoalIds) {
  const goal:any=currentGoals.get(gid)
  const fullPage:any=currentPages.get(gid)
  const subPage=actualCurrentSubset.pages.find((p:any)=>p.goalId===gid)!
  const oldPage=oldModel.pages.find((p:any)=>p.goalId===gid)!
  const inputGoal=actualInput.goals.find((g:any)=>g.goalId===gid)!
  // Compare COMPLETE page/context and whole raw goals, not only their hashes.
  same(subPage,oldPage)
  same(contextHelpers.buildGoalDescriptionCanonicalContext(goal),inputGoal.canonicalContext)
  same(subPage,inputGoal.reviewContext.page)
  assert.equal(inputGoal.reviewContext.evidenceProfile,null)
  assert.equal(goal.title,inputGoal.currentTitleDe);assert.equal(goal.titleEn,inputGoal.currentTitleEn)
  assert.equal(goal.description,inputGoal.currentDescriptionDe);assert.equal(goal.descriptionEn,inputGoal.currentDescriptionEn)
  assert.equal(evidenceHelpers.fingerprintGoalForEvidence(goal,modelHelpers.GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION,'curricularAtomic'),inputGoal.goalFingerprint)
  const originalRow=originalRaw.rows.find((r:any)=>r.goalId===gid)!
  const scopeWitnesses=atlas.receipt.scopes.flatMap((s:any)=>s.witnesses.filter((w:any)=>w.goalId===gid).map((w:any)=>({scopeKey:s.key,...w})))
  same(scopeWitnesses,originalRow.actualNativeSourceScopeWitnesses)
  let oldWhole:any,oldFullPage:any,primary:any
  if(groupDir.endsWith('native-original-ten')) {
   oldWhole=oldGoals.get(gid);oldFullPage=originalRow.fullCurrent378Page;primary=originalRow.authorPrimaryScope
  } else if(groupDir.endsWith('native-aromatic-single')) {
   const raw=read(resolve(v6,'actual-full378-single-aromatic-native-source-context-bindings.json'))
   oldWhole=raw.wholeProspectiveGoal;oldFullPage=raw.fullProspectivePage;primary=raw.authorPrimaryScope
  } else {
   const raw=v5Raw.selected15PageBindings.find((r:any)=>r.goalId===gid)!
   oldWhole=read(resolve(v5,'prospective-current378.canonical.author-candidate.json')).goals.find((g:any)=>g.id===gid)
   oldFullPage=raw.prospectiveFullPage;primary=raw.authorPrimaryScope
  }
  same(goal,oldWhole);same(fullPage,oldFullPage)
  const assetHTML=html.assets.find((a:any)=>a.publicPath===fullPage.visualization.url)!
  const assetPDF=pdf.assets.find((a:any)=>a.publicPath===fullPage.visualization.url)!
  assert.ok(assetHTML&&assetPDF)
  // The native HTML may embed WebP while PDF embeds JPEG. Their exact
  // distinct derivatives are bound independently to the SAME source raster.
  for(const k of ['publicPath','sourceSha256','sourceBytes','sourceWidth','sourceHeight','renderedWidth','renderedHeight']) assert.equal(assetHTML[k],assetPDF[k])
  assert.equal(assetHTML.sourceSha256,fullPage.visualization.originalDigest)
  assert.equal(assetPDF.sourceSha256,fullPage.visualization.originalDigest)
  const actualSource=resolve(groupDir.endsWith('native-original-ten')?resolve(root,'app/public'):currentAssetRoot,fullPage.visualization.url.replace(/^\//,''))
  assert.equal(hash(readFileSync(actualSource)),fullPage.visualization.originalDigest)
  const res:any=existingResolutionByGoal.get(gid)
  const resolution=read(resolve(groupDir,res.resolutionPath))
  assert.equal(resolution.goal.goalReviewContextFingerprint,resolutionHelpers.fingerprintGoalDescriptionReviewContext(inputGoal))
  continuityRows.push({goalId:gid,indexPath:group.index.path,strictCandidate:true,sourceReviewIsOriginalOrTargetedExistingReview:true,additionalScienceReview:false,wholeCurrentlyReviewedCanonicalGoal:goal,wholeCurrentFull378Page:fullPage,wholeCurrentProjectedNativePage:subPage,wholeCurrentCanonicalContext:inputGoal.canonicalContext,wholeNativeReviewContext:inputGoal.reviewContext,currentReviewContextFingerprint:resolutionHelpers.fingerprintGoalDescriptionReviewContext(inputGoal),actualCurrentSourceWitnesses:scopeWitnesses,boundedExistingPrimarySourceScope:primary,currentStageAndCourseAreNotInferredFromTags:true,actualRaster:{originalResourcePath:relative(root,actualSource),originalResourceSHA256:hash(readFileSync(actualSource)),originalResourceBytes:readFileSync(actualSource).length,htmlExactDerivativeBinding:assetHTML,pdfExactDerivativeBinding:assetPDF,distinctFormatDerivativesFromIdenticalSource:true},wholeGoalAndFullPageEqualExactReviewedCandidate:true,fullNativePageAndContextEqualExactReviewedInput:true,sourceWitnessesEqualOriginalCurrentRawInput:true,sourceCoverageApproval:false,humanApproval:false})
 }
}
assert.equal(continuityRows.length,15);assert.equal(new Set(continuityRows.map(r=>r.goalId)).size,15)
const before=read(resolve(orig,'actual-inputs.before-native-preparation.json'))
assert.equal(before.protectedStrictGoalIds.length,112)
for(const gid of before.protectedStrictGoalIds) same(currentGoals.get(gid),oldGoals.get(gid))
writeFileSync(resolve(own,'actual-current15-whole-goal-page-context-source-raster-continuity.json'),JSON.stringify({schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'technical_synthesizer continuity of existing scientific reviews; not an extra independent review',currentCanonical:bind(currentCanonicalPath),currentFull378Model:bind(fullCurrentPath),currentFullBookDigest:fullCurrent.digest,currentSubsetProjectionUsedUnmodifiedProductionHelper:true,currentAtlasConfigUsedOnlyInMemory:actualAtlasConfig,originalAtlasConfigBytesUnmodified:bind(resolve(root,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')),nativeCurrentAtlasInputBindings:atlas.receipt.inputBindings,currentCountryViewTargetSets:currentTargets,all48CountryTargetsExactOriginal:true,all112ProtectedWholeGoalsExactOriginal:true,protectedGoalsNotScientificallyRereviewed:true,rows:continuityRows,strictDescriptionCandidates:15,newIndependentReviewRounds:0,sourceApproval:false,wholeNationalCourseCoverageApproval:false,humanApproval:false,humanTrial:false,actualLearnerEvidence:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({nativeCurrentWholeGoalPageContextSourceRasterBindings:continuityRows.length,protectedWholeGoalsUnchanged:112,countryTargetsUnchanged:currentTargets.length,sourceApproval:false,newReviewRounds:0,activeWrites:0}))
