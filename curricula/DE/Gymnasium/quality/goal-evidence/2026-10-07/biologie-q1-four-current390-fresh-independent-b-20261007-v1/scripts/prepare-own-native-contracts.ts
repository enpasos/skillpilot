// SPDX-License-Identifier: Apache-2.0
import {createHash} from 'node:crypto'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../app/node_modules/ajv-formats'
import {stableGoalBookJson,parseAndValidateGoalBookModel} from '../../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionReviewInput,buildGoalDescriptionReviewCampaign,serializeGoalDescriptionReviewBatchInput,loadGoalDescriptionReviewRecordSchemaBytes,validateGoalDescriptionReviewCampaign,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH} from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import {verifyGoalBookReviewBundleArtifactBytes,writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts} from '../../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
async function main(){
 const base=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07'),author=resolve(base,'biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1'),own=resolve(base,'biologie-q1-four-current390-fresh-independent-b-20261007-v1'),out=resolve(own,'native-d-b')
 const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),write=(p:string,v:unknown)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n',{flag:'wx'})}
 const landscapePath=resolve(read(resolve(author,'native/atomicity.four.pending.config.json')).landscapePath),landscape=read(landscapePath)
 const modelBytes=readFileSync(resolve(author,'native/four/bundle/book-model.json')),model=parseAndValidateGoalBookModel(JSON.parse(modelBytes.toString())),bundle=read(resolve(author,'native/four/bundle/review-bundle-manifest.json'))
 if(sha(stableGoalBookJson(landscape))!==model.source.landscapeDigest)throw Error('Actual inert canonical source digest differs from sealed model')
 if(sha(modelBytes)!==bundle.artifacts.find((a:any)=>a.role==='book_model').digest||model.digest!==bundle.bookModelDigest)throw Error('Model artifact/digest mismatch')
 const verified=await verifyGoalBookReviewBundleArtifactBytes(bundle,resolve(author,'native/four/bundle'))
 const input=buildGoalDescriptionReviewInput({bundle,reviewInput:read(resolve(author,'native/four/bundle/review-input.json')),landscape})
 if(stableGoalBookJson(input)!==stableGoalBookJson(read(resolve(author,'native/four/round-b/description-review-input.json'))))throw Error('Own input differs from sealed exact current author input')
 const schema=await loadGoalDescriptionReviewRecordSchemaBytes(),campaign=buildGoalDescriptionReviewCampaign({bundle,input,campaignId:'biologie-q1-four-current390-native-author-candidate-20261007',roundId:'biologie-q1-four-current390-fresh-independent-b-20261007',reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'biologie-q1-four-current390-fresh-native-b-20261007',blindToOtherReviews:true,recordSchemaDigest:sha(schema),batchSize:4})
 const validation=await validateGoalDescriptionReviewCampaign({bundle,input,campaign});if(validation.errors.length)throw Error(validation.errors.join('\n'))
 write(resolve(out,'review-bundle-manifest.json'),bundle);write(resolve(out,'description-review-input.json'),input);write(resolve(out,'description-review-campaign.json'),campaign)
 mkdirSync(dirname(resolve(out,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH)),{recursive:true});writeFileSync(resolve(out,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schema,{flag:'wx'})
 await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle,campaignDirectory:out,verifiedArtifactBytes:verified})
 for(const b of campaign.batches){const p=resolve(out,'batches',b.batchId+'.input.jsonl');mkdirSync(dirname(p),{recursive:true});writeFileSync(p,serializeGoalDescriptionReviewBatchInput({bundleFingerprint:bundle.bundleFingerprint,bookDigest:bundle.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:b.batchId,goalIds:b.goalIds,goals:input.goals.slice((b.ordinal-1)*campaign.batchSize,(b.ordinal-1)*campaign.batchSize+b.goalIds.length)}),{flag:'wx'})}
 const resourceDigests:Record<string,string>={},records=readFileSync(resolve(author,'native/positive-four.current-author-candidate.jsonl'),'utf8').trim().split('\n').map(s=>JSON.parse(s)),errors:string[]=[]
 const publicRoot=resolve(landscapePath,'../../../../../../app/public')
 // Resolve the author's explicit inert public root; never reinterpret active image bytes.
 const inertPublicRoot=resolve('tmp/biologie-q1-four-current390-native-author-20261007-v1-attempt02/app/public')
 for(const r of records){const g=landscape.goals.find((x:any)=>x.id===r.goalId);for(const link of g.resourceLinks??[])if(link.type==='image')resourceDigests[link.url]=sha(readFileSync(resolve(inertPublicRoot,link.url.replace(/^\//,''))))}
 const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validate=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
 for(const r of records){const g=landscape.goals.find((x:any)=>x.id===r.goalId);errors.push(...validatePositiveGoalEvidenceRecordSemantics(r,g,resourceDigests,'curricularAtomic'));if(!validate(r))errors.push(...(validate.errors??[]).map(e=>JSON.stringify(e)))}
 write(resolve(own,'receipts/own-native-contract-and-P-technical-validation.actual.json'),{role:'Unmodified exported native APIs on exact sealed inert source; normal CLI active-source mismatch retained separately',landscapePath,landscapeLogicalDigest:sha(stableGoalBookJson(landscape)),modelArtifactDigest:sha(modelBytes),exactSealedReviewInput:true,bundleFingerprint:bundle.bundleFingerprint,bookDigest:bundle.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,campaignErrors:validation.errors,records:records.length,resourceDigests,positiveErrors:errors,statusOfPRecords:'needs_human_review',reviewAuthorityOfPRecords:'ai_candidate',humanApproval:false,strictGain:0})
 if(errors.length)throw Error(errors.join('\n'))
 console.log(JSON.stringify({nativeOwnCampaignGoals:campaign.goalCount,campaignErrors:validation.errors.length,nativePSchemaSemanticErrors:errors.length,exactSealedInput:true,source:'explicit unchanged inert source API'}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
