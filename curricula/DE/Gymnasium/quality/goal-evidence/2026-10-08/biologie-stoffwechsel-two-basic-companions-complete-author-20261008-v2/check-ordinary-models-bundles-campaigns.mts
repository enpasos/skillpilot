// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {parseAndValidateGoalBookModel} from '../../../../../../../app/scripts/goalBookModel.ts'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign.ts'
const own=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const paths=['native/full392.current-before.actual-loader.exact-model.json','native/full394.basic2-after-source3.actual-model.json','native/original-three-native-frame.after-basic2.actual-model.json','native-two/book-model.json','native-two/bundle/book-model.json','existing-word-context/before/book-model.json','existing-word-context/before/bundle/book-model.json','existing-word-context/after/book-model.json','existing-word-context/after/bundle/book-model.json']
const models=paths.map(p=>({path:p,goalPages:parseAndValidateGoalBookModel(read(resolve(own,p))).pages.length}))
assert.deepEqual(models.map(m=>m.goalPages),[392,394,3,2,2,1,1,1,1])
const bundles=[]
for(const dir of ['native-two','existing-word-context/before','existing-word-context/after']){
 const bundleDirectory=resolve(own,dir,'bundle'),bundle=read(resolve(bundleDirectory,'review-bundle-manifest.json'))
 await verifyGoalBookReviewBundleArtifactBytes(bundle,bundleDirectory)
 bundles.push({path:dir+'/bundle/review-bundle-manifest.json',actualWholeArtifactBytesVerified:true})
}
const campaigns=[]
for(const dir of ['native-two','existing-word-context/after'])for(const side of ['a','b']){
 const round=resolve(own,dir,'round-'+side),campaign=read(resolve(round,'description-review-campaign.json'))
 const result=await validateGoalDescriptionReviewCampaign({bundle:read(resolve(round,'review-bundle-manifest.json')),input:read(resolve(round,'description-review-input.json')),campaign})
 assert.deepEqual(result.errors,[]);assert.equal(campaign.blindToOtherReviews,true);assert.ok(!existsSync(resolve(round,'results')),'Author must not create peer results')
 campaigns.push({path:dir+'/round-'+side+'/description-review-campaign.json',closedSchemaAndOrdinaryCampaignErrors:0,blindToOtherReviews:true,actualIndependentResults:0,reviewStatus:'pending'})
}
const output=resolve(own,'checks/ordinary-nine-models-three-bundles-four-blind-campaigns.actual.json');assert.ok(!existsSync(output))
writeFileSync(output,JSON.stringify({schemaVersion:1,role:'Actual ordinary technical checks, not independent scientific review',models,bundles,campaigns,wholeP2ClosedSchemaAndNativeSemanticsErrors:0,actualNative2PhysicalPdfPages:4,actualExistingWordContextPhysicalPdfPages:3,allIndependentResultsPending:true,activeWrites:0,newStrictClosures:0,humanApproval:false,humanTrial:false},null,2)+'\n')
console.log(JSON.stringify({ordinaryModels:9,actualArtifactBundles:3,blindCampaigns:4,allNormalErrors:0,independentResults:0,activeWrites:0}))
