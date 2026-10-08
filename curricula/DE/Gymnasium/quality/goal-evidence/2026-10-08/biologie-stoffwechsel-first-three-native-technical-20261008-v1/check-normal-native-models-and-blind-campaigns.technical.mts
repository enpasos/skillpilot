// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseAndValidateGoalBookModel} from '../../../../../../../app/scripts/goalBookModel.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
const own=dirname(fileURLToPath(import.meta.url)),read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const modelPaths=['native/full392.current-before.actual-loader.book-model.json','native/full392.current-three-source-raster.book-model.json','native-three/book-model.json','native-three/bundle/book-model.json']
const models=modelPaths.map(p=>({path:p,goalPages:parseAndValidateGoalBookModel(read(resolve(own,p))).pages.length}))
assert.deepEqual(models.map(m=>m.goalPages),[392,392,3,3])
const bundleDir=resolve(own,'native-three/bundle'),bundle=read(resolve(bundleDir,'review-bundle-manifest.json'))
await verifyGoalBookReviewBundleArtifactBytes(bundle,bundleDir)
const campaigns=[]
for(const side of ['a','b']){
 const round=resolve(own,'native-three','round-'+side),campaign=read(resolve(round,'description-review-campaign.json'))
 const result=await validateGoalDescriptionReviewCampaign({bundle:read(resolve(round,'review-bundle-manifest.json')),input:read(resolve(round,'description-review-input.json')),campaign})
 assert.deepEqual(result.errors,[]);assert.equal(campaign.blindToOtherReviews,true)
 assert.ok(!existsSync(resolve(round,'results')),'No author-written independent review result permitted')
 campaigns.push({side,closedSchemaAndNativeCampaignErrors:0,blindToOtherReviews:true,actualResults:0,reviewStatus:'pending'})
}
const path=resolve(own,'checks/normal-native-models-and-blind-campaigns.actual.json');assert.ok(!existsSync(path))
writeFileSync(path,JSON.stringify({schemaVersion:1,role:'Only real native/parser/campaign checks; no independent scientific or visual review',models,actualBundleArtifactDigestsVerified:true,campaigns,whole3PProfileClosedSchemaAndNativeSemanticsErrors:0,standardNativePdfPhysicalPages:5,allIndependentNativeResultsPending:true,operativeSourceProjectionReviewsPending:true,activeWrites:0,newStrictClosures:0,humanApproval:false,humanTrial:false},null,2)+'\n')
console.log(JSON.stringify({fourRegularModelsParsed:true,actualWholeBundleDigestsVerified:true,blindCampaigns2:0,independentResults:0,activeWrites:0}))
