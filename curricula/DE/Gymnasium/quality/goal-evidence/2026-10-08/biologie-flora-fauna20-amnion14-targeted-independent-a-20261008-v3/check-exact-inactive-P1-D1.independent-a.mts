// SPDX-License-Identifier: Apache-2.0
// Actual native schemas/APIs for a deliberately inactive single-goal candidate.
// A technical PASS does not create the separately observed targeted anatomical V-PASS.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const gid='321ea315-37fe-5f9e-8fa8-dd631bb447c7'
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-flora-fauna20-amnion14-raster-native-targeted-author-root-v3')
const entry=read(resolve(author,'neutral-targeted-amnion14-current-raster-native.entry.json'))
const config=read(resolve(own,'P1.exact-inactive.native.config.json'))
const records=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const row=records.find((r:any)=>r.goalId===gid);assert.ok(row)
const candidate=read(resolve(root,config.landscapePath))
const goal=candidate.goals.find((g:any)=>g.id===gid);assert.ok(goal)
const kinds=read(resolve(root,config.semanticKindLedgerPath))
const kind=kinds.decisions.find((r:any)=>r.goalId===gid)?.semanticKind
assert.equal(kind,'curricularAtomic')
assert.equal(hash(resolve(root,entry.targetedImage.path)),entry.targetedImage.sha256)
const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+hash(resolve(root,entry.targetedImage.path))}
assert.equal(row.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate')
assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.ok(validate(row),ajv.errorsText(validate.errors))
const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,kind)
assert.deepEqual(semanticErrors,[])
const pReceipt={schemaVersion:1,artifactKind:'independent-A-exact-inactive-native-targeted-P1-api-check',recordedAt:new Date().toISOString(),
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeClosedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 exactPositiveInputPath:config.reviewPath,goalId:gid,exactSelectedRaster:entry.targetedImage,
 actualResourceDigests:actualDigests,goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,
 configuredGoals:1,needsHumanReview:1,approved:0,schemaErrors:0,semanticErrors:0,actualRasterBytesRead:true,
 schemaAndBindingPassIsScienceOrVisualApproval:false,scientificBasis:'targeted-current-D-P-source-retention.independent-a.receipt.json',
 actualVisualVerdict:'PASS',closedVisualFinding:'A-AMNION14-V3-LEFT-POINTER-EMBRYO-BACK',actualVisualPassBasis:'actual-amnion14-v4-V-first-independent-a.verdict.json',
 actualPublicCLIStillPendingIntegration:true,why:'Inactive candidates deliberately not installed in app/public; exact native API binds actual original PNG bytes without weakening the standard CLI.',
 realLearnerEvidence:false,activeWrites:0,strictGainClaimed:0,humanApproval:false}
writeFileSync(resolve(own,'P1.exact-inactive-native-api.independent-a.actual.json'),JSON.stringify(pReceipt,null,2)+'\n',{flag:'wx'})
console.log('Targeted actual inactive native P1 API:0 schema/semantic errors; needs_human_review,E1/G1. Separate actual v4 anatomical V-PASS recorded; prior v3 HOLD retained in history.')
const campaignPath=resolve(root,entry.nativeCampaignA)
const d=await validateGoalDescriptionReviewCampaignResultDirectories({
 bundle:read(resolve(campaignPath,'review-bundle-manifest.json')),
 input:read(resolve(campaignPath,'description-review-input.json')),
 campaign:read(resolve(campaignPath,'description-review-campaign.json')),
 batchesDirectory:resolve(campaignPath,'batches'),resultsDirectory:resolve(own,'round-a/results')})
assert.deepEqual(d.errors,[])
assert.equal(d.records.length,1);assert.equal(d.records[0].goalId,gid);assert.equal(d.records[0].decision,'keep')
writeFileSync(resolve(own,'D1.actual-native-campaign-validation.independent-a.receipt.json'),JSON.stringify({
 schemaVersion:1,artifactKind:'independent-A-actual-one-goal-D-campaign-check',recordedAt:new Date().toISOString(),
 nativeApi:'validateGoalDescriptionReviewCampaignResultDirectories',errors:d.errors,records:d.records.length,
 retainedDescriptionDecision:'keep',newVisualCompatibilityVerdict:'PASS',nativeTechnicalPassIsVisualApproval:false,
 exactCampaignPath:entry.nativeCampaignA,peerBReviewRead:false,activeWrites:0,strictGainClaimed:0,humanApproval:false},null,2)+'\n',{flag:'wx'})
console.log('Targeted actual native D1 campaign:0 errors; unchanged description KEEP, actual v4 image/page compatibility PASS recorded separately.')
