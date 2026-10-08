// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const rel=(p:string)=>relative(root,p),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>{const bytes=readFileSync(p);return {path:rel(p),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}}
const entry=read(resolve(own,'neutral-sixteen-native-independent-review.entry.json'))
const bundleDir=resolve(root,dirname(entry.actualNativeBundlePath)),bundle=read(resolve(root,entry.actualNativeBundlePath))
const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle,bundleDir)
const fullBefore=parseAndValidateGoalBookModel(read(resolve(root,entry.actualFullCurrentBeforeModelPath))),fullAfter=parseAndValidateGoalBookModel(read(resolve(root,entry.actualFullCandidateModelPath)))
const subset=parseAndValidateGoalBookModel(read(resolve(own,'native-sixteen/book-model.json')))
assert.equal(fullBefore.pages.length,392);assert.equal(fullAfter.pages.length,392);assert.equal(subset.pages.length,16)
const campaigns=[]
for(const c of entry.campaigns){const campaign=read(resolve(root,c.campaignPath)),input=read(resolve(root,c.inputPath));const result=await validateGoalDescriptionReviewCampaign({bundle,input,campaign});assert.deepEqual(result.errors,[]);assert.deepEqual(campaign.batches.flatMap((b:any)=>b.goalIds),entry.goalIds);assert.equal(c.actualResultCount,0);assert.equal(campaign.blindToOtherReviews,true);campaigns.push({side:c.side,campaign:bind(resolve(root,c.campaignPath)),input:bind(resolve(root,c.inputPath)),errors:result.errors,actualResults:0})}
assert.notEqual(entry.campaigns[0].independenceGroupId,entry.campaigns[1].independenceGroupId)
const diff=read(resolve(root,entry.whole392PageContextDiffPath));assert.equal(diff.entries.length,392)
const unselected=diff.entries.filter((d:any)=>!d.selected);assert.equal(unselected.length,376);assert.ok(unselected.every((d:any)=>d.changedFields.length===0))
for(const d of diff.entries){assert.equal(stableGoalBookJson(d.wholeBeforePage),stableGoalBookJson(fullBefore.pages.find(p=>p.goalId===d.goalId)));assert.equal(stableGoalBookJson(d.wholeCandidatePage),stableGoalBookJson(fullAfter.pages.find(p=>p.goalId===d.goalId)))}
for(const r of entry.rasterBindings){const actual=bind(resolve(root,r.actualOriginalImage.path)),alias=bind(resolve(root,r.portableAlias.path));assert.equal(actual.sha256,r.actualOriginalImage.sha256);assert.equal(alias.sha256,actual.sha256);assert.equal(alias.bytes,actual.bytes);assert.equal(alias.bytes,r.portableAlias.bytes)}
const pdf=read(resolve(own,'native-sixteen/book.pdf.render-manifest.json'));assert.equal(pdf.goalPageCount,16);assert.equal(pdf.frontMatterPageCount,2)
const out=resolve(own,'checks/ordinary-native-campaign-bundle-and-whole-page-check.actual.json');assert.equal(existsSync(out),false)
writeFileSync(out,JSON.stringify({schemaVersion:1,scope:'ordinary technical provenance/model/campaign checks only',normalValidators:['parseAndValidateGoalBookModel','verifyGoalBookReviewBundleArtifactBytes','validateGoalDescriptionReviewCampaign'],fullBefore392:true,fullCandidate392:true,selectedNativeGoalCount:16,physicalPDFPages:18,unselectedWhole376PagesExact:true,portableActualPNGCount:16,verifiedBundleArtifactCount:verified.size,campaigns,scientificIndependentResultCount:0,scientificApproval:false,humanApproval:false,activeWrites:0,exitCode:0},null,2)+'\n')
console.log(JSON.stringify({technicalCheck:bind(out),errors:0,independentResults:0,strictGain:0}))
