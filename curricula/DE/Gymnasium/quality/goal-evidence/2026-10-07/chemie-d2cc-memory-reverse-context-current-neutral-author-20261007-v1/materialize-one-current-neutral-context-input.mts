// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookModel,fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from '../../../../../../../app/scripts/goalBookRenderer'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import {buildGoalDescriptionReviewInput,buildGoalDescriptionReviewCampaign,serializeGoalDescriptionReviewBatchInput,loadGoalDescriptionReviewRecordSchemaBytes,validateGoalDescriptionReviewCampaign,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes,writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,v:any)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,Buffer.isBuffer(v)||typeof v==='string'?v:JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
const source=resolve(own,'../chemie-two-corrected-raster-current-native-author-20261007-v1')
const ids=['d2ccd1d5-56f7-583f-9724-e97441367f91']
const landscape=read(resolve(source,'candidate/canonical.current480-two-corrected-images-and-reviewed-support.json'))
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const full=read(resolve(source,'native/full378.book-model.json'))
assert.equal(full.pages.length,378)
const old=read(resolve(own,'../chemie-b007-b014-four-current479-native-refresh-author-20261007-v2/native/full378.book-model.json'))
const oldPage=old.pages.find((p:any)=>p.goalId===ids[0]),newPage=full.pages.find((p:any)=>p.goalId===ids[0])
const changed=Object.keys(newPage).filter(k=>JSON.stringify(newPage[k])!==JSON.stringify(oldPage[k]));assert.deepEqual(changed.sort(),['externalReverseRequires','pageFingerprint'].sort())
assert.deepEqual(newPage.externalReverseRequires.map((x:any)=>x.goalId),['417e65ec-68be-5f2e-9452-c3ba9b1d362f'])
write(resolve(own,'actual-page-context-delta.json'),{goalId:ids[0],changedKeys:changed,before:oldPage,after:newPage,oldPageFingerprint:oldPage.pageFingerprint,newPageFingerprint:newPage.pageFingerprint,scope:'Only one memory support reverse prerequisite; no text, asset, P-body, primary-source or learner approval change',strictGain:0})
const ordered=full.pages.filter((p:any)=>ids.includes(p.goalId)).map((p:any)=>p.goalId)
const model=buildGoalDescriptionRolloutSubsetModel({baseModel:full,goalIds:ordered,bookId:'chemie-d2cc-memory-context-author-20261007-v1',title:'Chemie: saure, alkalische und neutrale Lösungen – Kontextbindung'})
const modelPath=resolve(own,'native/one/book-model.json'),htmlPath=resolve(own,'native/one/book.html'),pdfPath=resolve(own,'native/one/book.pdf');write(modelPath,model)
const publicRoot=resolve(root,'app/public')
const options={publicRoot,feedbackBaseUrl:'https://skillpilot.com/lernziel-feedback',printDerivativeProfile:'bounded-atlas'as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(model,htmlPath,options),htmlPath+'.render-manifest.json')
await writeGoalBookRenderManifest(await writeGoalBookPdf(model,pdfPath,options),pdfPath+'.render-manifest.json')
const bundleDirectory=resolve(own,'native/one/bundle'),bundle=await buildGoalBookReviewBundle(model,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'),goalIds:ordered})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory),input=buildGoalDescriptionReviewInput({bundle:bundle.manifest,reviewInput:bundle.input,landscape}),schemaBytes=await loadGoalDescriptionReviewRecordSchemaBytes()
for(const side of ['a','b']){
 const out=resolve(own,'native/one/round-'+side),campaign=buildGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaignId:'chemie-d2cc-memory-context-campaign-'+side+'-20261007-v1',roundId:'chemie-d2cc-memory-context-independent-'+side+'-20261007-v1',reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'chemie-d2cc-memory-context-independent-'+side+'-20261007-v1',blindToOtherReviews:true,recordSchemaDigest:sha(schemaBytes),batchSize:20})
 const checked=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaign});assert.deepEqual(checked.errors,[])
 write(resolve(out,'review-bundle-manifest.json'),bundle.manifest);write(resolve(out,'description-review-input.json'),input);write(resolve(out,'description-review-campaign.json'),campaign);write(resolve(out,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schemaBytes)
 await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:bundle.manifest,campaignDirectory:out,verifiedArtifactBytes:verified})
 for(const batch of campaign.batches){const bytes=serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.manifest.bundleFingerprint,bookDigest:bundle.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals});const path=resolve(out,'batches',batch.batchId+'.input.jsonl');write(path,bytes);assert.equal(sha(readFileSync(path)),batch.batchInputFingerprint);assert.equal(readFileSync(path,'utf8').trim().split('\n').length,1)}
}
write(resolve(own,'native/one/current-neutral-full-input.json'),{role:'Neutral actual current page/context input, two independent targeted reviews pending',wholeSelectedGoals:ids.map(id=>by.get(id)),newMemorySupportGoal:by.get('417e65ec-68be-5f2e-9452-c3ba9b1d362f'),nativeInput:input,actualPDF:'native/one/book.pdf',physicalGoalPages:[3],actualDelta:'actual-page-context-delta.json',actualImage:newPage.visualization,independentFirstPassDirectories:['native/one/round-a','native/one/round-b'],activeWrites:0,humanApproval:false,strictGain:0})
console.log(JSON.stringify({actualFullPureModel:full.pages.length,actualNativeSubset:ordered,rawPersistedBatchesMatchCampaign:true,authorApproval:false,changedKeys:changed}))
