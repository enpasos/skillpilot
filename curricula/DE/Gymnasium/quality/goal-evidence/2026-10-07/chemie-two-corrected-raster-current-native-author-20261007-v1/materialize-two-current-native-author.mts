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
const ids=read(resolve(own,'selected-goals.json')).goalIds as string[]
const canonicalPath=resolve(own,'candidate/canonical.current480-two-corrected-images-and-reviewed-support.json'),landscape=read(canonicalPath),kind=read(resolve(own,'candidate/semantic-kinds.original-input.json'))
const by=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
for(const d of kind.decisions)d.sourceFingerprint=fingerprintSemanticKindSourceGoal(by.get(d.goalId))
const support=by.get('417e65ec-68be-5f2e-9452-c3ba9b1d362f')
kind.decisions.push({goalId:support.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(support),semanticKind:'memory',decisionStatus:'authoritative',decisionBasis:'reviewed-current-pilot-memory'})
kind.counts.memory++;kind.counts.total++;kind.sourceLandscapePath=relative(root,canonicalPath)
write(resolve(own,'candidate/semantic-kinds.current-inert.json'),kind)
const qa=read(resolve(own,'candidate/visualization-qa.author-input.json')),view=read(resolve(own,'candidate/review-view.original-input.json')),digests:Record<string,string>={}
for(const row of qa.records)if(row.visualizationState==='available')digests[row.imageUrl]=sha(readFileSync(resolve(root,row.publicAssetPath)))
const config={schemaVersion:1,bookId:'chemie-two-corrected-current-author-20261007-v1',title:'Chemie: zwei gezielte aktuelle Bildkorrekturen',landscapePath:relative(root,canonicalPath),compositionViewPath:relative(root,resolve(own,'candidate/review-view.original-input.json')),semanticKindLedgerPath:relative(root,resolve(own,'candidate/semantic-kinds.current-inert.json')),goalVisualizationQaPath:relative(root,resolve(own,'candidate/visualization-qa.author-input.json')),publicationMode:'review',atlasBaseUrl:'https://skillpilot.com/lernzielbuch',evidenceReviewPaths:[],outputPath:relative(root,resolve(own,'native/full378.book-model.json'))}
write(resolve(own,'native/full378.book.config.json'),config)
const full=buildGoalBookModel({landscape,compositionView:view,semanticKindLedger:kind,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config}as any)
assert.equal(full.pages.length,378);write(resolve(own,'native/full378.book-model.json'),full)
const ordered=full.pages.filter((p:any)=>ids.includes(p.goalId)).map((p:any)=>p.goalId)
const model=buildGoalDescriptionRolloutSubsetModel({baseModel:full,goalIds:ordered,bookId:'chemie-two-corrected-raster-author-20261007-v1',title:'Chemie: galvanisches Element und Brønsted-Konzept'})
const modelPath=resolve(own,'native/two/book-model.json'),htmlPath=resolve(own,'native/two/book.html'),pdfPath=resolve(own,'native/two/book.pdf');write(modelPath,model)
const publicRoot=resolve(own,'native/public')
for(const id of ids){const link=by.get(id).resourceLinks.find((x:any)=>x.type==='goal-visualization');write(resolve(publicRoot,link.url.slice(1)),readFileSync(resolve(own,'selected-images',id+'.png')))}
const options={publicRoot,feedbackBaseUrl:'https://skillpilot.com/lernziel-feedback',printDerivativeProfile:'bounded-atlas'as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(model,htmlPath,options),htmlPath+'.render-manifest.json')
await writeGoalBookRenderManifest(await writeGoalBookPdf(model,pdfPath,options),pdfPath+'.render-manifest.json')
const bundleDirectory=resolve(own,'native/two/bundle'),bundle=await buildGoalBookReviewBundle(model,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'),goalIds:ordered})
for(const file of bundle.files)write(resolve(bundleDirectory,file.relativePath),file.content)
write(resolve(bundleDirectory,'review-bundle-manifest.json'),bundle.manifest)
const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory),input=buildGoalDescriptionReviewInput({bundle:bundle.manifest,reviewInput:bundle.input,landscape}),schemaBytes=await loadGoalDescriptionReviewRecordSchemaBytes()
for(const side of ['a','b']){
 const out=resolve(own,'native/two/round-'+side),campaign=buildGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaignId:'chemie-two-corrected-current-campaign-'+side+'-20261007-v1',roundId:'chemie-two-corrected-current-independent-'+side+'-20261007-v1',reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'chemie-two-corrected-current-independent-'+side+'-20261007-v1',blindToOtherReviews:true,recordSchemaDigest:sha(schemaBytes),batchSize:2})
 const checked=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaign});assert.deepEqual(checked.errors,[])
 write(resolve(out,'review-bundle-manifest.json'),bundle.manifest);write(resolve(out,'description-review-input.json'),input);write(resolve(out,'description-review-campaign.json'),campaign);write(resolve(out,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schemaBytes)
 await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:bundle.manifest,campaignDirectory:out,verifiedArtifactBytes:verified})
 for(const batch of campaign.batches){const bytes=serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.manifest.bundleFingerprint,bookDigest:bundle.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:batch.batchId,goalIds:batch.goalIds,goals:input.goals});const path=resolve(out,'batches',batch.batchId+'.input.jsonl');write(path,bytes);assert.equal(sha(readFileSync(path)),batch.batchInputFingerprint);assert.equal(readFileSync(path,'utf8').trim().split('\n').length,2)}
}
write(resolve(own,'native/two/current-neutral-full-input.json'),{role:'Author candidate only, genuine independent reviews pending',wholeSelectedGoals:ids.map(id=>by.get(id)),nativeInput:input,actualPDF:'native/two/book.pdf',physicalGoalPages:[3,4],actualImages:ids.map(id=>'selected-images/'+id+'.png'),previousScientificCases:'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-current479-native-refresh-author-20261007-v2/materials/four-whole-goals-eight-complete-DE-EN-cases.reviewer-ready.md',independentFirstPassDirectories:['native/two/round-a','native/two/round-b'],activeWrites:0,humanApproval:false,strictGain:0})
console.log(JSON.stringify({actualFullPureModel:full.pages.length,actualNativeSubset:ordered,rawPersistedBatchesMatchCampaign:true,authorApproval:false}))
