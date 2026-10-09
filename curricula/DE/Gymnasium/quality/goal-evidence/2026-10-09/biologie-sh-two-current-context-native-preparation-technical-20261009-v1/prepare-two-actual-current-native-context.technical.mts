// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,existsSync,cpSync} from 'node:fs'
import {resolve,dirname,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
const {chromium}=createRequire(resolve(process.cwd(),'app/package.json'))('playwright')
import {parseAndValidateGoalBookModel,loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'
import {writeGoalBookHtml,writeGoalBookPdf,writeGoalBookRenderManifest,goalBookFrontMatterPageCount} from '../../../../../../../app/scripts/goalBookRenderer.ts'
import {buildGoalBookReviewBundle} from '../../../../../../../app/scripts/exportGoalBookReviewBundle.ts'
import {createGoalDescriptionReviewCampaignArtifacts} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),H='e5f97788-c2ac-5f42-b5a5-55605b563a79',batchId='biologie-two-current-bounded-sh-context-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const bind=(p:string)=>{const f=resolve(R,p),b=readFileSync(f);return {path:relative(R,f),sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=(name:string,x:any)=>{const p=resolve(D,name);mkdirSync(dirname(p),{recursive:true});assert.ok(!existsSync(p),p);writeFileSync(p,typeof x==='string'?x:Buffer.isBuffer(x)?x:JSON.stringify(x,null,2)+'\n');return p}
const {model}=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',R);put('native/full394-actual-current.normal-model.json',model);const selected=[H,'2ae2da43-73d5-578f-84f4-be0585a7d8f9']
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:selected,bookId:batchId,title:'Biologie: zwei aktuelle begrenzte SH-Kontextbindungen'});parseAndValidateGoalBookModel(subset)
const preservedPNGs=[]
for(const ID of selected){const originalAsset=`app/public/assets/goal-visualizations/biologie/${ID}/${ID}.png`,assetCopy=resolve(D,`assets/goal-visualizations/biologie/${ID}/${ID}.png`);mkdirSync(dirname(assetCopy),{recursive:true});cpSync(resolve(R,originalAsset),assetCopy);assert.equal(bind(originalAsset).sha256,bind(relative(R,assetCopy)).sha256);preservedPNGs.push({goalId:ID,...bind(relative(R,assetCopy))})}
const native=resolve(D,'native/actual-two'),modelPath=put('native/actual-two/book-model.json',subset),htmlPath=resolve(native,'book.html'),pdfPath=resolve(native,'book.pdf')
const browser=chromium.executablePath();assert.ok(existsSync(browser));const options={publicRoot:D,feedbackBaseUrl:'https://skillpilot.com/feedback',printDerivativeProfile:'standard' as const,chromiumExecutablePath:browser}
await writeGoalBookRenderManifest(await writeGoalBookHtml(subset,htmlPath,options),htmlPath+'.render-manifest.json');const pdf=await writeGoalBookPdf(subset,pdfPath,options);await writeGoalBookRenderManifest(pdf,pdfPath+'.render-manifest.json')
assert.equal(pdf.goalPageCount,2);assert.equal(pdf.frontMatterPageCount,goalBookFrontMatterPageCount(subset));assert.equal(pdf.physicalPageCount,2+pdf.frontMatterPageCount)
const bundleDir=resolve(native,'bundle'),bundle=await buildGoalBookReviewBundle(subset,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDir,promptPath:resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath:resolve(R,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md'),goalIds:selected})
for(const f of bundle.files)put('native/actual-two/bundle/'+f.relativePath,f.content);put('native/actual-two/bundle/review-bundle-manifest.json',bundle.manifest)
const artifact=(role:string)=>{const a=bundle.manifest.artifacts.find(a=>a.role===role);assert.ok(a);return a},campaigns=[]
for(const side of ['a','b']){
 const out=resolve(native,'round-'+side),result=await createGoalDescriptionReviewCampaignArtifacts({bundleBytes:readFileSync(resolve(bundleDir,'review-bundle-manifest.json')),bookModelBytes:readFileSync(resolve(bundleDir,artifact('book_model').path)),reviewInputBytes:readFileSync(resolve(bundleDir,artifact('review_input_json').path)),bundleDirectory:bundleDir,outputDirectory:out,campaignOptions:{campaignId:batchId+'-campaign-'+side,roundId:batchId+'-independent-'+side,reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:batchId+'-independent-'+side,blindToOtherReviews:true,batchSize:20}})
 const input=read(relative(R,resolve(out,'description-review-input.json'))),checked=await validateGoalDescriptionReviewCampaign({bundle:bundle.manifest,input,campaign:result.campaign});assert.deepEqual(checked.errors,[])
 campaigns.push({side,campaign:bind(relative(R,resolve(out,'description-review-campaign.json'))),reviewInput:bind(relative(R,resolve(out,'description-review-input.json'))),goalIds:result.campaign.batches[0].goalIds,independenceGroupId:result.campaign.independenceGroupId,normalValidationErrors:checked.errors,actualIndependentResults:0})
}
put('native/actual-two/normal-render-bundle-and-two-independent-campaigns.actual.json',{schemaVersion:1,wholeNativeSubsetModel:bind(relative(R,modelPath)),actualOriginalHTML:bind(relative(R,htmlPath)),actualOriginalPDF:bind(relative(R,pdfPath)),actualBundleHTML:bind(relative(R,resolve(bundleDir,artifact('book_html').path))),actualBundlePDF:bind(relative(R,resolve(bundleDir,artifact('book_pdf').path))),normalRenderManifest:bind(relative(R,pdfPath+'.render-manifest.json')),goalPageCount:2,frontMatterPageCount:pdf.frontMatterPageCount,physicalPageCount:pdf.physicalPageCount,actualLayoutChecked:true,pageMap:selected.map((goalId,i)=>({goalId,goalPage:i+1,physicalPage:pdf.frontMatterPageCount+i+1})),preservedActualPNGs:preservedPNGs,campaigns,remaining392GoalsNotReReviewed:true,actualScopeReviewPending:true,nativeSemanticApproval:false,independentSourceApproval:false,humanApproval:false,strictGain:0,newScientificClosures:0,restoredBindings:0})
console.log(JSON.stringify({actualNativeGoalPages:2,physicalPDFPages:pdf.physicalPageCount,actualNormalCampaigns:2,independentResults:0,newScientificClosures:0,restoredBindings:0,strictGain:0}))
