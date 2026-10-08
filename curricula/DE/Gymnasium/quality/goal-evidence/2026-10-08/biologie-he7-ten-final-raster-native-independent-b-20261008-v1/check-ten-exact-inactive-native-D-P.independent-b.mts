import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'

const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he7-ten-final-raster-native-author-root-20261008-v1')
const entry=read(resolve(author,'neutral-ten-current-raster-native-independent-review.entry.json'))
const config=read(resolve(own,'P10.exact-inactive-native.independent-b.config.json'))
const firstSealPath=resolve(own,'ten-genuine-current-D-P-V.independent-b.first.freeze.json')
assert.equal(hash(firstSealPath),'93bbc0a9f2d940e98396de167cf37f6fb029efac3d1b89c825236e93f20cdeec')
for(const f of read(firstSealPath).frozenFiles){assert.equal(hash(resolve(root,f.path)),f.sha256);assert.equal(readFileSync(resolve(root,f.path)).length,f.bytes)}
const records=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(s=>JSON.parse(s))
const images=read(resolve(root,entry.fullActualPNGsAndToolProvenance)).images
const landscape=read(resolve(root,config.landscapePath))
const kinds=read(resolve(root,config.semanticKindLedgerPath)).decisions
assert.equal(records.length,10);assert.equal(images.length,10)
assert.deepEqual(records.map((r:any)=>r.goalId),config.scope.goalIds)
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const verified:any[]=[]
for(const row of records){
 const goal=landscape.goals.find((g:any)=>g.id===row.goalId);assert.ok(goal)
 const kind=kinds.find((k:any)=>k.goalId===row.goalId);assert.equal(kind.semanticKind,'curricularAtomic')
 assert.equal(kind.sourceFingerprint,fingerprintSemanticKindSourceGoal(goal))
 const image=images.find((i:any)=>i.goalId===row.goalId);assert.ok(image)
 assert.equal(hash(resolve(root,image.path)),image.sha256)
 const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
 const actualDigests:Record<string,string>={[links[0].url]:'sha256:'+image.sha256}
 assert.equal(row.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
 assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate')
 assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
 assert.ok(validate(row),ajv.errorsText(validate.errors))
 const errors=validatePositiveGoalEvidenceRecordSemantics(row,goal,actualDigests,'curricularAtomic')
 assert.deepEqual(errors,[])
 verified.push({goalId:row.goalId,goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,
  reviewInputFingerprint:row.reviewInputFingerprint,actualPNG:image.path,actualOriginalRasterSha256:image.sha256,
  actualResourceDigests:actualDigests,currentKind:'curricularAtomic',currentSourceFingerprintActuallyChecked:true,
  schemaErrors:0,semanticErrors:0,status:row.status,reviewAuthority:row.reviewAuthority,evidenceLevel:row.evidenceLevel,maximumClaimScope:row.maximumClaimScope})
}
writeFileSync(resolve(own,'P10.actual-inactive-schema-semantics-original-PNG.independent-b.receipt.json'),JSON.stringify({
 schemaVersion:1,artifactKind:'independent-B-actual-ten-inactive-current-P-schema-semantics-original-PNG',recordedAt:new Date().toISOString(),
 nativeApi:'validatePositiveGoalEvidenceRecordSemantics',closedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
 exactPositiveInputPath:config.reviewPath,records:verified,configuredGoals:10,needsHumanReview:10,approved:0,schemaErrors:0,semanticErrors:0,
 actualInactiveOriginalRasterBytesRead:true,ownFirstVerdictSealPath:firstSealPath,ownFirstVerdictSealSha256:hash(firstSealPath),
 independentWholeScienceBasis:'ten-whole-current-D-P-source-AM-native-page.independent-b.first.verdict.json',
 independentActualVisualBasis:'ten-actual-PNG-width-native-page-V.independent-b.first.verdicts.json',
 nativePassIsScientificOrVisualApproval:false,actualPublicCLIStillPendingIntegration:true,
 why:'Actual selected inactive assets are not installed at public URLs. This standard native API checks their real original PNG bytes; no CLI, schema, ignore or source exception is introduced.',
 peerAFinalOutputsRead:false,activeWrites:0,strictGainClaimed:0,realLearnerEvidence:false,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual independent B P10:10 current profiles,0 schema/semantic errors; exact original PNG and current source-kind bound; ai_candidate/needs_human_review,E1/G1 retained.')
const campaignPath=resolve(root,entry.independentCampaignB)
const d=await validateGoalDescriptionReviewCampaignResultDirectories({
 bundle:read(resolve(campaignPath,'review-bundle-manifest.json')),input:read(resolve(campaignPath,'description-review-input.json')),
 campaign:read(resolve(campaignPath,'description-review-campaign.json')),batchesDirectory:resolve(campaignPath,'batches'),
 resultsDirectory:resolve(own,'round-b/results')})
assert.deepEqual(d.errors,[]);assert.equal(d.records.length,10)
assert.deepEqual(d.records.map((r:any)=>r.goalId),config.scope.goalIds)
assert.ok(d.records.every((r:any)=>r.decision==='keep'&&r.recordStatus==='candidate'&&r.reviewAuthority==='ai_candidate'))
writeFileSync(resolve(own,'D10.actual-native-campaign-independent-b.receipt.json'),JSON.stringify({
 schemaVersion:1,artifactKind:'independent-B-actual-native-ten-record-campaign-validation',recordedAt:new Date().toISOString(),
 nativeApi:'validateGoalDescriptionReviewCampaignResultDirectories',campaignPath:entry.independentCampaignB,
 actualBatchSize:10,records:10,KEEP:10,errors:d.errors,actualWholePDFAndPageChecksSealed:true,
 nativePassIsScientificOrVisualApproval:false,peerAFinalOutputsRead:false,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual independent B D10 campaign native check:0 errors,10 actual KEEP records,correct batchSize10 and bound own completed run.')
