// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats'
import { buildGoalBookReviewBundle } from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import { buildGoalDescriptionReviewInput, buildGoalDescriptionReviewCampaign, serializeGoalDescriptionReviewBatchInput, loadGoalDescriptionReviewRecordSchemaBytes, validateGoalDescriptionReviewCampaign, GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { verifyGoalBookReviewBundleArtifactBytes, writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts } from '../../../../../../../app/scripts/createGoalDescriptionReviewCampaign'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
async function main(){
const root=resolve('.'),own=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1'),sparse=resolve('tmp/biologie-q1-four-current390-native-author-20261007-v1-attempt02')
if(existsSync(resolve(own,'author.final.freeze.json')))throw new Error('Sealed author output')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const write=(p:string,v:unknown)=>{mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n')}
const four=['0daa79f6-8f61-5506-98f9-65db83062ba8','475eebb4-4eb0-524f-b1ec-4a672bf856d2','ffef97e3-12d6-5090-9816-46ab9e57fae2','e70d8a85-2dea-5165-919b-200fee9f4db4']
const landscape=read(resolve(sparse,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')),modelPath=resolve(own,'native/four/book-model.json'),model=read(modelPath)
const pdfPath=resolve(own,'native/four/book.pdf'),htmlPath=resolve(own,'native/four/book.html'),bundleDirectory=resolve(own,'native/four/bundle')
const promptPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md'),criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md')
const built=await buildGoalBookReviewBundle(model,{modelPath,pdfPath,pdfRenderManifestPath:pdfPath+'.render-manifest.json',htmlPath,htmlRenderManifestPath:htmlPath+'.render-manifest.json',outputDirectory:bundleDirectory,promptPath,criteriaPath,goalIds:four})
for(const f of built.files){const p=resolve(bundleDirectory,f.relativePath);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,f.content,{flag:'wx'})}
write(resolve(bundleDirectory,'review-bundle-manifest.json'),built.manifest)
const verified=await verifyGoalBookReviewBundleArtifactBytes(built.manifest,bundleDirectory),input=buildGoalDescriptionReviewInput({bundle:built.manifest,reviewInput:built.input,landscape}),schemaBytes=await loadGoalDescriptionReviewRecordSchemaBytes(),recordSchemaDigest=hash(schemaBytes),campaignRows=[]
for(const side of ['a','b']){
 const out=resolve(own,'native/four/round-'+side),campaign=buildGoalDescriptionReviewCampaign({bundle:built.manifest,input,campaignId:'biologie-q1-four-current390-native-author-candidate-20261007',roundId:'biologie-q1-four-current390-independent-'+side+'-20261007',reviewerRole:'internal_ai_reviewer',reviewPass:'first_pass',independenceGroupId:'biologie-q1-four-current390-independent-'+side+'-20261007',blindToOtherReviews:true,recordSchemaDigest,batchSize:4})
 const result=await validateGoalDescriptionReviewCampaign({bundle:built.manifest,input,campaign});if(result.errors.length)throw new Error(result.errors.join('\n'))
 write(resolve(out,'review-bundle-manifest.json'),built.manifest);write(resolve(out,'description-review-input.json'),input);write(resolve(out,'description-review-campaign.json'),campaign)
 mkdirSync(dirname(resolve(out,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH)),{recursive:true});writeFileSync(resolve(out,GOAL_DESCRIPTION_REVIEW_RECORD_SCHEMA_ARTIFACT_PATH),schemaBytes)
 await writeVerifiedGoalDescriptionReviewCampaignGuidanceArtifacts({bundle:built.manifest,campaignDirectory:out,verifiedArtifactBytes:verified})
 for(const b of campaign.batches){const offset=(b.ordinal-1)*campaign.batchSize,p=resolve(out,'batches',b.batchId+'.input.jsonl');mkdirSync(dirname(p),{recursive:true});writeFileSync(p,serializeGoalDescriptionReviewBatchInput({bundleFingerprint:built.manifest.bundleFingerprint,bookDigest:built.manifest.bookModelDigest,reviewInputFingerprint:input.reviewInputFingerprint,inputSchemaVersion:input.schemaVersion,recordSchemaDigest:campaign.recordSchemaDigest,batchId:b.batchId,goalIds:b.goalIds,goals:input.goals.slice(offset,offset+b.goalIds.length)}))}
 campaignRows.push({side,folder:relative(root,out),errors:result.errors,goalCount:campaign.goalCount,independenceGroupId:campaign.independenceGroupId,bundleFingerprint:campaign.bundleFingerprint,bookDigest:campaign.bookDigest,reviewInputFingerprint:campaign.reviewInputFingerprint,reviewerRun:'not performed; author prepares contracts only',nativeReviewRecords:0})
}
write(resolve(own,'native/four/native-campaign-contracts.actual.validation.json'),{role:'Fresh actual native D contracts, no author verdict or independent approvals',campaignRows,authorNativeReviewRecords:0,strictGain:0,humanApproval:false})
const oldP=read(resolve(own,'four-exact-P-profile-bodies-and-eight-cases.author.json')).records
const records=[],errors:string[]=[],resourceDigests:Record<string,string>={}
for(const id of four){const goal=landscape.goals.find((g:any)=>g.id===id),old=oldP.find((p:any)=>p.goalId===id)
 for(const link of goal.resourceLinks??[])if(link.type==='image'){const path=resolve(sparse,'app/public',link.url.replace(/^\//,''));resourceDigests[link.url]=hash(readFileSync(path))}
 const record={...old,reviewId:'biologie-q1-four-current390-author-candidate-20261007-v1',goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,old.reviewCriteriaFingerprint,resourceDigests,'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(old.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:new Date().toISOString(),reviewer:'Codex author; exact retained historical profiles, fresh technical bindings pending independent current review',reason:old.reason+' Current author candidate: four whole goals and exact selected PNG digests are bound through native API; this technical rebinding is not independent P approval.',reviewRunIds:[],evidenceLevel:'E1',maximumClaimScope:'G1',dissent:[...old.dissent,'All detailed country/whole-source holds and separate partner duties remain open; author bindings require independent current-page/source review.']}
 if(JSON.stringify(record.profile)!==JSON.stringify(old.profile))throw new Error('Existing profile bodies changed')
 errors.push(...validatePositiveGoalEvidenceRecordSemantics(record as any,goal,resourceDigests,'curricularAtomic'));records.push(record)
}
const schemaPath=resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const validate=ajv.compile(read(schemaPath))
for(const record of records)if(!validate(record))errors.push(...(validate.errors??[]).map((e:any)=>JSON.stringify(e)))
if(errors.length)throw new Error(errors.join('\n'))
writeFileSync(resolve(own,'native/positive-four.current-author-candidate.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
write(resolve(own,'native/positive-four.actual-resource-binding.validation.json'),{role:'Native record schema plus native semantic validation on actual task-owned selected PNGs; no independent review or ordinary active-image CLI claim',records:4,exactProfileBodies:4,exactCaseBriefBodies:8,errors,resourceDigests,evidenceLevel:'E1',maximumClaimScope:'G1',status:'needs_human_review',reviewAuthority:'ai_candidate',independentPApproval:false,authorRunIDs:[],humanApproval:false,strictGain:0})
console.log(JSON.stringify({nativeDCampaigns:2,nativeCampaignErrors:0,goalCountPerRound:4,authorNativeDRecords:0,nativePSchemaAndActualResourceSemanticErrors:0,retainedProfiles:4,retainedCases:8,independentApproval:false,strictGain:0}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
