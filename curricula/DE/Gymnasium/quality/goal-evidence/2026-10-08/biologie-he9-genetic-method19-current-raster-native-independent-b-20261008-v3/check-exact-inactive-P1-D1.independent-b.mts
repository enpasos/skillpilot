// SPDX-License-Identifier: Apache-2.0
// Native closed schema and semantics for an exact inactive one-goal B candidate.
// The genuine science and actual image/page verdicts are independently recorded.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const gid='1b7f08a1-33df-5779-af66-430c91d699b7'
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-genetic-method19-current-raster-native-author-root-v3')
const entry=read(resolve(author,'neutral-one-current-raster-native-independent-review.entry.json'))
const config=read(resolve(own,'P1.exact-inactive.native.config.json'))
const rows=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(s=>JSON.parse(s))
assert.equal(rows.length,1)
const row=rows[0];assert.equal(row.goalId,gid)
const goal=read(resolve(root,config.landscapePath)).goals.find((g:any)=>g.id===gid);assert.ok(goal)
const kindRow=read(resolve(root,config.semanticKindLedgerPath)).decisions.find((r:any)=>r.goalId===gid)
assert.equal(kindRow.semanticKind,'curricularAtomic')
assert.equal(kindRow.sourceFingerprint,fingerprintSemanticKindSourceGoal(goal))
const actualRasterPath=resolve(author,entry.actualPNG)
assert.equal(hash(actualRasterPath),'2f99ed69b15dcf1bb16328e56430a18e82b1f35593eba5540907dfdb7f3a8139')
const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+hash(actualRasterPath)}
assert.equal(row.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate')
assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.ok(validate(row),ajv.errorsText(validate.errors))
const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,'curricularAtomic')
assert.deepEqual(semanticErrors,[])
writeFileSync(resolve(own,'P1.exact-inactive-native-api.independent-b.actual.json'),JSON.stringify({
 schemaVersion:1,artifactKind:'independent-B-exact-inactive-one-current-native-P1-schema-and-semantics',recordedAt:new Date().toISOString(),
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeClosedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 exactPositiveInputPath:config.reviewPath,goalId:gid,actualOriginalRasterPath:entry.actualPNG,actualResourceDigests:actualDigests,
 goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,
 currentSemanticClassificationSourceFingerprintActuallyVerified:true,
 configuredGoals:1,needsHumanReview:1,approved:0,schemaErrors:0,semanticErrors:0,actualOriginalRasterBytesRead:true,
 technicalPassIsScienceOrVisualApproval:false,independentWholeScienceBasis:'whole-targeted-D-P-source-class-AM-current-page.independent-b.first.verdict.json',
 independentActualVisualBasis:'actual-one-PNG-widths-new-native-page-V.independent-b.first.verdict.json',
 actualPublicCLIStillPendingIntegration:true,why:'The selected inactive actual image has not been installed in app/public; native API checks its exact original bytes without changing standard CLI behavior.',
 realLearnerEvidence:false,peerANewNativeOutputsRead:false,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual independent B inactive P1:0 schema/semantic errors; actual current classification and PNG bound; needs_human_review,ai_candidate,E1/G1 retained.')
const campaignPath=resolve(author,entry.actualBlindCampaigns.b)
const d=await validateGoalDescriptionReviewCampaignResultDirectories({
 bundle:read(resolve(campaignPath,'review-bundle-manifest.json')),
 input:read(resolve(campaignPath,'description-review-input.json')),
 campaign:read(resolve(campaignPath,'description-review-campaign.json')),
 batchesDirectory:resolve(campaignPath,'batches'),resultsDirectory:resolve(own,'round-b/results')})
assert.deepEqual(d.errors,[])
assert.equal(d.records.length,1);assert.equal(d.records[0].goalId,gid);assert.equal(d.records[0].decision,'keep')
writeFileSync(resolve(own,'D1.actual-native-campaign-validation.independent-b.receipt.json'),JSON.stringify({
 schemaVersion:1,artifactKind:'independent-B-actual-one-current-D-campaign-check',recordedAt:new Date().toISOString(),
 nativeApi:'validateGoalDescriptionReviewCampaignResultDirectories',errors:d.errors,records:d.records.length,
 currentDescriptionDecision:'keep',oldOwnFinding:'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE',
 oldOwnFindingCandidateState:'resolved in actually corrected whole current native input; original first HOLD retained',
 exactCampaignPath:entry.actualBlindCampaigns.b,newCurrentNativePageActuallyReviewed:true,
 nativeTechnicalPassIsScienceOrVisualApproval:false,peerANewNativeOutputsRead:false,
 activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual independent B native D1 round-b campaign:0 errors;1 KEEP bound to corrected whole current DE/EN and actual new page.')
