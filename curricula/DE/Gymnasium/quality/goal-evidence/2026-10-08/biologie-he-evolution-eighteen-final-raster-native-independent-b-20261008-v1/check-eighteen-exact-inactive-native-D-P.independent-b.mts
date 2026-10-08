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
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),author=resolve(own,'../biologie-he-evolution-eighteen-raster-native-author-technical-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const first=resolve(own,'eighteen-current-D-P-V.independent-b.first.freeze.json')
assert.equal(hash(first),'6d25d626664e9fd13665c70106f9d3f1cacb93c53dbd08159dac1cbafa31aa50')
for(const f of read(first).files){assert.equal(hash(resolve(root,f.path)),f.sha256);assert.equal(readFileSync(resolve(root,f.path)).length,f.bytes)}
const entry=read(resolve(author,'neutral-eighteen-current-raster-native-author-review.entry.json'))
const config=read(resolve(author,'positive/P18.current-whole.actual-raster-author.inactive.config.json'))
const landscape=read(resolve(root,config.landscapePath)),kinds=read(resolve(root,config.semanticKindLedgerPath)).decisions
const records=readFileSync(resolve(root,config.reviewPath),'utf8').trim().split('\n').map(x=>JSON.parse(x))
const images=read(resolve(root,entry.actualPhysicalPagesAnd36Widths)).captures
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(records.length,18);assert.equal(images.length,18);assert.deepEqual(records.map((p:any)=>p.goalId),entry.goalIds)
const verified:any[]=[]
for(const row of records){
 const goal=landscape.goals.find((g:any)=>g.id===row.goalId),kind=kinds.find((k:any)=>k.goalId===row.goalId),img=images.find((x:any)=>x.goalId===row.goalId)
 assert.equal(kind.semanticKind,'curricularAtomic');assert.equal(kind.sourceFingerprint,fingerprintSemanticKindSourceGoal(goal))
 const links=goal.resourceLinks.filter((l:any)=>l.type==='goal-visualization');assert.equal(links.length,1)
 assert.equal(hash(resolve(root,img.sourcePath)),img.sourceSha256);assert.equal(hash(resolve(root,img.originalPNG.path)),img.sourceSha256)
 const digests:Record<string,string>={[links[0].url]:'sha256:'+img.sourceSha256}
 assert.equal(row.reviewCriteriaFingerprint,'sha256:'+hash(resolve(root,config.reviewCriteriaPath)))
 assert.equal(row.status,'needs_human_review');assert.equal(row.reviewAuthority,'ai_candidate');assert.equal(row.evidenceLevel,'E1');assert.equal(row.maximumClaimScope,'G1')
 assert.ok(validate(row),ajv.errorsText(validate.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(row,goal,digests,'curricularAtomic'),[])
 verified.push({goalId:row.goalId,currentKind:'curricularAtomic',goalFingerprint:row.goalFingerprint,profileFingerprint:row.profileFingerprint,reviewInputFingerprint:row.reviewInputFingerprint,actualRasterPath:img.originalPNG.path,actualRasterSha256:img.sourceSha256,actualResourceDigests:digests,schemaErrors:0,semanticErrors:0,status:row.status,reviewAuthority:row.reviewAuthority,evidenceLevel:row.evidenceLevel,maximumClaimScope:row.maximumClaimScope})
}
writeFileSync(resolve(own,'P18.actual-inactive-closed-schema-semantics-selected-PNG.independent-b.receipt.json'),JSON.stringify({schemaVersion:1,reviewedAt:new Date().toISOString(),nativeApi:'validatePositiveGoalEvidenceRecordSemantics',records:verified,configuredGoals:18,approved:0,schemaErrors:0,semanticErrors:0,ownFirstSealSha256:hash(first),scientificWholeCasesRetained:true,scienceBasis:'eighteen-current-whole-D-P-source-context.independent-b.first.verdict.json',visualBasis:'eighteen-actual-PNG-width-native-pages-V.independent-b.first.verdicts.json',actualV17KEEP1HOLD:true,nativePassIsVisualApproval:false,ordinaryRasterPCLIPendingPublicInstallation:true,peerAFinalRead:false,activeWrites:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual P18 native closed-schema/API:18 current original PNG-bound records,0 errors; E1/G1 AI candidates/needs_human_review. V1 anatomical HOLD remains; public CLI pending install.')
const q=resolve(root,entry.roundB)
const result=await validateGoalDescriptionReviewCampaignResultDirectories({bundle:read(resolve(q,'review-bundle-manifest.json')),input:read(resolve(q,'description-review-input.json')),campaign:read(resolve(q,'description-review-campaign.json')),batchesDirectory:resolve(q,'batches'),resultsDirectory:resolve(own,'round-b/results')})
assert.deepEqual(result.errors,[]);assert.equal(result.records.length,18);assert.ok(result.records.every((r:any)=>r.decision==='keep'&&r.recordStatus==='candidate'&&r.reviewAuthority==='ai_candidate'))
writeFileSync(resolve(own,'D18.actual-native-independent-b-campaign.receipt.json'),JSON.stringify({schemaVersion:1,nativeApi:'validateGoalDescriptionReviewCampaignResultDirectories',actualBatchSize:18,actualOwnRecords:18,KEEP:18,errors:result.errors,ownFirstSealSha256:hash(first),actualNativePagesSeen:18,V1HOLDNotResolvedByNativePass:true,peerAFinalRead:false,activeWrites:0,humanApproval:false,humanTrial:false},null,2)+'\n',{flag:'wx'})
console.log('Actual D18 native own round-B campaign API:18 KEEP candidate records,0 errors,real18 batch and own completed run; no V/Human approval inferred.')
