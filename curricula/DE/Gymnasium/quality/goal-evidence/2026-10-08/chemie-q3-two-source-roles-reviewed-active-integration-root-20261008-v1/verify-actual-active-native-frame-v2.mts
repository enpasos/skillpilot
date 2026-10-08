// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { loadGoalBookBuildInputs, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const expectedPath=resolve(own,'../chemie-q3-two-source-roles-reviewed-integration-preparation-technical-20261008-v1/native/current378.paired-two.actual-model.json')
const expected=JSON.parse(readFileSync(expectedPath,'utf8'))
const {model}=await loadGoalBookBuildInputs(resolve(own,'active378-configured-review-frame.book.config.json'))
assert.equal(model.pages.length,378)
assert.equal(stableGoalBookJson(model.pages),stableGoalBookJson(expected.pages))
const {model:published}=await loadGoalBookBuildInputs(resolve(root,'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'))
assert.equal(published.pages.length,359)
const selected=['d9cce642-4f89-57f8-832a-abeb62586195','3eada74b-25b8-55dc-811a-acb473196f53']
for(const id of selected){
 const full=model.pages.find(p=>p.goalId===id), publicPage=published.pages.find(p=>p.goalId===id)
 assert.ok(full&&publicPage)
 assert.equal(stableGoalBookJson(publicPage.visualization),stableGoalBookJson(full.visualization))
 assert.equal(publicPage.goalFingerprint,full.goalFingerprint)
}
writeFileSync(resolve(own,'actual-active378-and-published359-native-frame.proof.json'),JSON.stringify({observedAt:new Date().toISOString(),ordinaryLoaderWithActiveCanonicalKindsQA:true,configuredReviewedWholeScopeCount:378,all378WholePageObjectsExactToActualReviewedNativeFrame:true,publishedAtlasConfiguredPageCount:359,selectedCurrentPublishedImagesAndGoalFingerprintsExactToReviewedFrame:true,originalReviewedModel:{path:relative(root,expectedPath),sha256:createHash('sha256').update(readFileSync(expectedPath)).digest('hex')},actualActiveFullModelDigest:model.digest,actualPublishedModelDigest:published.digest,sourceOrPublicationScopeChanges:false,newScientificReviewByIntegrator:false,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log('PASS: ordinary active378 reviewed scope and current published359 atlas; selected images and goals exact')
