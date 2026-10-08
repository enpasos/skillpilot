// SPDX-License-Identifier: Apache-2.0
// Actual native schemas and semantic APIs. Scientific D19 HOLD is preserved.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'

const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-eighteen-final-raster-native-author-root-20261008-v1')
const entry=read(resolve(author,'neutral-eighteen-actual-raster-native-independent-review.entry.json'))
const config=read(resolve(own,'P18.exact-inactive.native.config.json'))
const records=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(s=>JSON.parse(s))
assert.equal(records.length,18)
const candidate=read(resolve(root,config.landscapePath))
const goals=new Map<string,any>(candidate.goals.map((g:any)=>[g.id,g]))
const kinds=read(resolve(root,config.semanticKindLedgerPath))
const kindById=new Map<string,any>(kinds.decisions.map((r:any)=>[r.goalId,r.semanticKind]))
const images=read(resolve(root,entry.actualPNGSelectionManifest)).images
assert.equal(images.length,18)
const imageById=new Map<string,any>(images.map((r:any)=>[r.goalId,r]))
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const checks=[]
for(const row of records){
  const goal=goals.get(row.goalId),image=imageById.get(row.goalId);assert.ok(goal);assert.ok(image)
  assert.equal(kindById.get(row.goalId),'curricularAtomic')
  assert.equal(hash(resolve(root,image.path)),image.sha256)
  const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
  const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+hash(resolve(root,image.path))}
  assert.equal(row.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
  assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate')
  assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
  assert.ok(validate(row),ajv.errorsText(validate.errors))
  const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,kindById.get(row.goalId))
  assert.deepEqual(semanticErrors,[])
  checks.push({goalId:row.goalId,status:row.status,reviewAuthority:row.reviewAuthority,evidenceLevel:row.evidenceLevel,maximumClaimScope:row.maximumClaimScope,
    actualSelectedRaster:image.path,actualSelectedRasterSha256:image.sha256,actualResourceDigests:actualDigests,
    goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,schemaErrors:0,semanticErrors:0})
}
writeFileSync(resolve(own,'P18.actual-exact-inactive-native-api.independent-b.receipt.json'),JSON.stringify({
  schemaVersion:1,artifactKind:'independent-B-actual-eighteen-inactive-native-P-schema-semantic-check',recordedAt:new Date().toISOString(),
  nativeApi:'validatePositiveGoalEvidenceRecordSemantics',nativeSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
  reviewPath:config.reviewPath,exactInactiveCanonical:config.landscapePath,rows:checks,configuredGoals:18,needsHumanReview:18,approved:0,schemaErrors:0,semanticErrors:0,
  technicalPassIsWholeScienceApproval:false,wholeCurrentCoverageScientificPASS:17,wholeCurrentCoverageScientificHOLD:1,
  heldGoalId:'1b7f08a1-33df-5779-af66-430c91d699b7',heldFinding:'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE',
  scientificBasis:'eighteen-whole-DEEN-source-P-science-first.independent-b.verdicts.json',
  actualPublicAssetCLIPendingIntegration:true,why:'Deliberately inactive candidate PNGs are not installed in app/public; actual native API binds actual reviewed raster bytes without weakening the standard CLI.',
  peerAFinalReviewRead:false,activeWrites:0,strictGainClaimed:0,realLearnerEvidence:false,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual inactive P18 native schema+semantic checks:0 errors;18 needs_human_review/AI candidate/E1/G1. Separate actual science:17 full current coverage PASS; D19 EN-scope HOLD preserved.')
const campaignPath=resolve(root,entry.roundB)
const result=await validateGoalDescriptionReviewCampaignResultDirectories({
  bundle:read(resolve(campaignPath,'review-bundle-manifest.json')),input:read(resolve(campaignPath,'description-review-input.json')),
  campaign:read(resolve(campaignPath,'description-review-campaign.json')),batchesDirectory:resolve(campaignPath,'batches'),resultsDirectory:resolve(own,'round-b/results')})
assert.deepEqual(result.errors,[])
assert.equal(result.records.length,18);assert.equal(result.records.filter((r:any)=>r.decision==='keep').length,17)
const revise=result.records.filter((r:any)=>r.decision==='revise');assert.equal(revise.length,1)
assert.equal(revise[0].goalId,'1b7f08a1-33df-5779-af66-430c91d699b7')
writeFileSync(resolve(own,'D18.actual-native-campaign-validation.independent-b.receipt.json'),JSON.stringify({
  schemaVersion:1,artifactKind:'independent-B-actual-eighteen-D-native-campaign-result-check',recordedAt:new Date().toISOString(),
  nativeApi:'validateGoalDescriptionReviewCampaignResultDirectories',exactCampaignPath:entry.roundB,errors:result.errors,records:18,keep:17,revise:1,
  unresolvedFinding:'B-D19-EN-BIOTECHNOLOGY-BROADER-SCOPE',unresolvedGoalId:revise[0].goalId,
  nativeTechnicalPassIsFindingResolution:false,actualVKeep:18,peerAFinalReviewRead:false,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual native independent B D18 campaign:0 errors;17 KEEP and1 REVISE. No current whole19 approval or assumed future correction; actual V18 KEEP recorded separately.')
