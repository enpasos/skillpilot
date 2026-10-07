// SPDX-License-Identifier: Apache-2.0
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validateGoalDescriptionReviewCampaign} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes} from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const root=resolve('.'),own=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-current479-native-refresh-author-20261007-v2')
assert.ok(!existsSync(resolve(own,'author.final.freeze.json')))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const selection=read(resolve(own,'nine-current-goals-and-four-bounded-candidates.author.raw.json')),candidate=read(resolve(own,'candidate/canonical.current479-four-bounded-proposals.json')),by=new Map(candidate.goals.map((g:any)=>[g.id,g])),errors:string[]=[],campaignRows=[]
const bundle=read(resolve(own,'native/four/bundle/review-bundle-manifest.json'))
await verifyGoalBookReviewBundleArtifactBytes(bundle,resolve(own,'native/four/bundle'))
for(const side of ['a','b']){
 const dir=resolve(own,'native/four/round-'+side),campaign=read(resolve(dir,'description-review-campaign.json')),input=read(resolve(dir,'description-review-input.json'))
 const checked=await validateGoalDescriptionReviewCampaign({bundle,input,campaign})
 errors.push(...checked.errors);campaignRows.push({side,errors:checked.errors,wholeGoals:input.goals.length,reviewInputFingerprint:input.reviewInputFingerprint,authorReviews:0})
}
const resources:Record<string,string>={}
for(const id of selection.reviewReadyGoalIds)for(const link of (by.get(id) as any).resourceLinks)if(link.type==='goal-visualization')resources[link.url]=sha(readFileSync(resolve(own,'selected-existing-images',link.url.split('/').at(-1))))
const ajv=new Ajv2020({strict:true,allErrors:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const records=readFileSync(resolve(own,'native/positive-four.current-author-candidate.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l))
for(const record of records){
 assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1');assert.deepEqual(record.reviewRunIds,[])
 errors.push(...validatePositiveGoalEvidenceRecordSemantics(record,by.get(record.goalId) as any,resources,'curricularAtomic'))
 if(!validate(record))errors.push(...(validate.errors??[]).map(e=>JSON.stringify(e)))
}
const index=read(resolve(own,'all-declared-input-snapshot-index.actual.json'))
for(const r of index.inputs){const b=readFileSync(resolve(root,r.path));assert.equal(createHash('sha256').update(b).digest('hex'),r.sha256);assert.equal(b.length,r.bytes)}

const assets=read(resolve(own,'native/full-model-actual-asset-digests-at-use.json'));const liveAssetDrift=[]
for(const r of assets.assetBindings){if(sha(readFileSync(resolve(root,r.path)))!==r.sha256)liveAssetDrift.push(r.path)}
assert.deepEqual(errors,[])
const receipt={role:'Actual final focused native checks of persisted author outputs before seal, no new science or human approval',campaignRows,wholeSelectedGoals:9,boundedReviewReadyDP:4,heldGoals:5,currentWholeCanonical479:true,pureNativeCurricularPages:378,profileRecords:records.length,caseBriefs:records.reduce((n,r)=>n+r.profile.applicationCaseBriefs.length,0),actualSelectedRasterDigests:resources,exactInputSnapshotsVerified:index.inputs.length,fullNativeAssetDigestsAtUse:assets.assetBindings.length,liveAssetDriftAtPreSeal:liveAssetDrift,errors,activeWrites:0,authorApprovalRecords:0,strictGain:0}
writeFileSync(resolve(own,'native/final-persisted-output-pre-seal.actual.validation.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(receipt))
