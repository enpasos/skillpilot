// SPDX-License-Identifier: Apache-2.0
// Checks actual reviewer-authored judgments; never generates reviewer decisions.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),author=resolve(own,'../chemie-q3-two-native-source-roles-resume-technical-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const campaign=read(resolve(author,'native/two/round-a/description-review-campaign.json'))
const checked=await validateGoalDescriptionReviewCampaignResultDirectories({bundle:read(resolve(author,'native/two/bundle/review-bundle-manifest.json')),input:read(resolve(author,'native/two/round-a/description-review-input.json')),campaign,batchesDirectory:resolve(author,'native/two/round-a/batches'),resultsDirectory:resolve(own,'round-a/results')})
assert.deepEqual(checked.errors,[])
const can=read(resolve(author,'candidate/canonical.current480.two-resource-links.inactive.json')),qa=read(resolve(author,'candidate/visualization-qa.current378.only-six-unapproved.inactive.json'))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const originals=readFileSync(resolve(author,'positive/P2-current-whole-profiles-real-resource-native-author.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const profiles=readFileSync(resolve(own,'P2-current-full-profile.independent-a.review.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const checks=[]
for(const p of profiles){
 const g=can.goals.find((g:any)=>g.id===p.goalId),q=qa.records.find((q:any)=>q.goalId===p.goalId)
 const digest='sha256:'+createHash('sha256').update(readFileSync(resolve(root,q.publicAssetPath))).digest('hex');assert.equal(digest,q.assetSha256)
 assert.deepEqual(p.profile,originals.find(o=>o.goalId===p.goalId).profile)
 assert.ok(validate(p),ajv.errorsText(validate.errors))
 assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(p,g,{[q.imageUrl]:digest},'curricularAtomic'),[])
 checks.push({goalId:p.goalId,actualResourceDigest:digest,wholeProfileExact:true,closedV2SchemaErrors:0,nativeSemanticErrors:0})
}
writeFileSync(resolve(own,'actual-d-p-schema-validation.before-seal.json'),JSON.stringify({schemaVersion:1,role:'Actual independent A outputs validated through unchanged ordinary APIs',D:checked,P:checks,humanApproval:false,activeWrites:0,newStrictClosures:0},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({currentDRecords:checked.records.length,currentPRecords:checks.length,Derrors:checked.errors.length,Perrors:0,activeWrites:0}))
