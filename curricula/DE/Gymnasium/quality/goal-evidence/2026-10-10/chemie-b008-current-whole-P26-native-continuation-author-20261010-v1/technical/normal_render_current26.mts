// SPDX-License-Identifier: Apache-2.0
// Existing normal whole-bundle API with two ordinary independent20+6 campaigns.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {loadGoalBookBuildInputs,stableGoalBookJson} from './isolated-normal-capsule/app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from './isolated-normal-capsule/app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest} from './isolated-normal-capsule/app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from './isolated-normal-capsule/app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts,verifyGoalBookReviewBundleArtifactBytes} from './isolated-normal-capsule/app/scripts/createGoalDescriptionReviewCampaign.ts'
import {validateGoalDescriptionReviewCampaign} from './isolated-normal-capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'

const root=resolve('.'),p='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-whole-P26-native-continuation-author-20261010-v1',out=p+'/native/current26'
const read=(f:string)=>JSON.parse(readFileSync(resolve(root,f),'utf8'))
const bind=(f:string)=>{const b=readFileSync(resolve(root,f));return {path:f,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=(f:string,x:any)=>{assert.ok(f.startsWith(p+'/'));const abs=resolve(root,f);mkdirSync(dirname(abs),{recursive:true});writeFileSync(abs,Buffer.isBuffer(x)?x:typeof x==='string'?x:JSON.stringify(x,null,2)+'\n')}
const full=await loadGoalBookBuildInputs(p+'/native/after-whole-normal-book.config.json',root);assert.equal(full.model.pages.length,398)
const ids=read(p+'/materials/whole26-current-operative-materials-and-profiles.exact-assembly.json').goalIds
const ordered=full.model.pages.filter(x=>ids.includes(x.goalId)).map(x=>x.goalId);assert.equal(ordered.length,26)
const batchId='chemie-b008-current-whole-P26-native-20261010-v1'
const model=buildGoalDescriptionRolloutSubsetModel({baseModel:full.model,goalIds:ordered,bookId:batchId,title:'Chemie – 26 aktuelle ganze Prozesskompetenz-Kandidaten'})
put(out+'/book-model.json',model)
const modelPath=resolve(root,out+'/book-model.json'),htmlPath=resolve(root,out+'/book.html'),pdfPath=resolve(root,out+'/book.pdf')
const options={publicRoot:resolve(root,'app/public'),feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const}
await writeGoalBookRenderManifest(await writeGoalBookHtml(model,htmlPath,options),htmlPath+'.render-manifest.json')
const pdf=await writeGoalBookPdf(model,pdfPath,options);assert.equal(pdf.goalPageCount,26);await writeGoalBookRenderManifest(pdf,pdfPath+'.render-manifest.json')
const bundleDirectory=resolve(root,out+'/bundle')
const bundle=await buildGoalBookReviewBundle(model,{modelPath,htmlPath,pdfPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',pdfRenderManifestPath:pdfPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md'),goalIds:ordered})
for(const f of bundle.files)put(out+'/bundle/'+f.relativePath,f.content)
put(out+'/bundle/review-bundle-manifest.json',bundle.manifest)
const artifact=(role:string)=>{const a=bundle.manifest.artifacts.find(a=>a.role===role);assert.ok(a);return a}
await verifyGoalBookReviewBundleArtifactBytes(bundle.manifest,bundleDirectory)
const campaigns=[]
for(const side of ['a','b']){
 const dir=resolve(root,out+'/round-'+side)
 const result=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(root,out+'/bundle/review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDirectory,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDirectory,artifact('review_input_json').path)),bundleDirectory,outputDirectory:dir,campaignOptions:{campaignId:batchId+'-campaign-'+side,roundId:batchId+'-independent-'+side,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:batchId+'-independent-'+side,blindToOtherReviews:true,batchSize:20}})
 const errors=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input:result.input,campaign:result.campaign});assert.deepEqual(errors.errors,[])
 assert.deepEqual(result.campaign.batches.map(x=>x.goalIds.length),[20,6]);assert.deepEqual(result.campaign.batches.flatMap(x=>x.goalIds),ordered)
 campaigns.push({side,campaignPath:out+'/round-'+side+'/description-review-campaign.json',inputPath:out+'/round-'+side+'/description-review-input.json',normalValidationErrors:errors.errors,ordinaryBatchSizes:[20,6],genuineCurrentIndependentReviewCount:0})
}
const profiles=read(out+'/bundle/'+artifact('review_input_json').path).pages;assert.equal(profiles.length,26)
assert.ok(profiles.every((x:any)=>x.evidenceProfile&&x.evidenceProfile.expectations.length>0),'Actual current V2 profiles must be present in all26 whole normal review inputs')
put(p+'/checks/normal-whole26-native-and-two-ordinary-campaigns.actual.json',{schemaVersion:1,role:'Actual normal full26 native/model/bundle/ordinary20+6 blind-campaign preparation and contract validation; no independent scientific verdict',normalAPIs:['loadGoalBookBuildInputs','buildGoalDescriptionRolloutSubsetModel','writeGoalBookHtml','writeGoalBookPdf','buildGoalBookReviewBundle','createGoalDescriptionReviewCampaignArtifacts','validateGoalDescriptionReviewCampaign','verifyGoalBookReviewBundleArtifactBytes'],actualNativeModel:bind(out+'/book-model.json'),modelDigest:model.digest,wholeCurrentNativeGoalIds:ordered,currentWholeP26ProfilesActuallyPresentInInput:true,wholeNativeHTML:bind(out+'/book.html'),wholeNativePDF:bind(out+'/book.pdf'),ordinaryPDFGoalPageCount:pdf.goalPageCount,ordinaryPDFFrontMatterPageCount:pdf.frontMatterPageCount,normalBundle:bind(out+'/bundle/review-bundle-manifest.json'),bundleFingerprint:bundle.manifest.bundleFingerprint,wholeArtifactBytesVerified:true,campaigns,actualCurrentIndependentReviews:0,wholeSourceCourseAndTargetedProtectedContextApproval:false,activeWrites:[],strictGain:0,humanApproval:false})
console.log(JSON.stringify({nativeGoalPages:26,actualCurrentV2ProfilesInAllNativeInputs:true,normalIndependentCampaigns:2,ordinaryBatchSizes:[20,6],modelDigest:model.digest,bundleFingerprint:bundle.manifest.bundleFingerprint,actualIndependentReviews:0,activeWrites:0,strictGain:0}))
