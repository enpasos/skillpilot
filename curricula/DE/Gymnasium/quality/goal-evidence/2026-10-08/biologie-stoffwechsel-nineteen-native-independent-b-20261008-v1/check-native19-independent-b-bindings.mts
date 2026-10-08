// Scoped actual B record validation only; no active or whole QA writes.
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics,fingerprintPositiveGoalEvidenceProfile,fingerprintGoalForPositiveEvidence,fingerprintPositiveGoalEvidenceReviewInput} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import {validateGoalDescriptionReviewCampaignResultDirectories} from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'
const out=dirname(fileURLToPath(import.meta.url)),root=resolve(out,'../../../../../../..')
const a=resolve(out,'../biologie-stoffwechsel-nineteen-native-technical-20261008-v1'),round=resolve(a,'native-nineteen/round-b')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const c=read(resolve(a,'candidate/canonical.current476.nineteen-rasters.inactive.json'))
const full=read(resolve(a,'native/full392.current-raster.book-model.json'))
const selected=read(resolve(a,'native-nineteen/book-model.json'))
const records=readFileSync(resolve(out,'P19-current-raster.actual-independent-b.records.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const schema=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const positive=records.map(record=>{
 const goal=c.goals.find((g:any)=>g.id===record.goalId)
 const link=goal.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&l.role==='primary')
 const actual=sha(readFileSync(resolve(a,'selected-images',record.goalId+'.png')))
 const resources={[link.url]:actual},page=full.pages.find((p:any)=>p.goalId===record.goalId),small=selected.pages.find((p:any)=>p.goalId===record.goalId)
 const schemaPass=schema(record),semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic')
 const fp=fingerprintGoalForPositiveEvidence(goal,'curricularAtomic')
 const input=fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,resources,'curricularAtomic')
 return {goalId:record.goalId,actualResources:resources,schemaPass,schemaErrors:schema.errors??[],semanticErrors,goalFingerprintExact:fp===record.goalFingerprint,profileFingerprintExact:fingerprintPositiveGoalEvidenceProfile(record.profile)===record.profileFingerprint,reviewInputFingerprintExact:input===record.reviewInputFingerprint,full392AndNative19GoalFingerprintExact:page.goalFingerprint===fp&&small.goalFingerprint===fp,full392AndNative19ActualPNGExact:page.visualization.originalDigest===actual&&small.visualization.originalDigest===actual,reviewRunIds:record.reviewRunIds,status:record.status,reviewAuthority:record.reviewAuthority,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope}
})
const campaign=await validateGoalDescriptionReviewCampaignResultDirectories({bundle:read(resolve(round,'review-bundle-manifest.json')),input:read(resolve(round,'description-review-input.json')),campaign:read(resolve(round,'description-review-campaign.json')),batchesDirectory:resolve(round,'batches'),resultsDirectory:resolve(round,'results')})
const result={schemaVersion:1,ordinaryBRecordCount:campaign.records.length,ordinaryBErrors:campaign.errors,positive,allPassed:campaign.records.length===19&&campaign.errors.length===0&&positive.every(p=>p.schemaPass&&p.semanticErrors.length===0&&p.goalFingerprintExact&&p.profileFingerprintExact&&p.reviewInputFingerprintExact&&p.full392AndNative19GoalFingerprintExact&&p.full392AndNative19ActualPNGExact&&p.reviewRunIds.length===0&&p.status==='needs_human_review'&&p.reviewAuthority==='ai_candidate'&&p.evidenceLevel==='E1'&&p.maximumClaimScope==='G1'),activeWrites:0,fullQARun:false}
writeFileSync(resolve(out,'native19-b.actual-API-and-campaign-validation.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({allPassed:result.allPassed,DRecords:campaign.records.length,DErrors:campaign.errors,PRecords:positive.length,PErrors:positive.filter(p=>!p.schemaPass||p.semanticErrors.length||!p.goalFingerprintExact||!p.reviewInputFingerprintExact||!p.profileFingerprintExact)}))
if(!result.allPassed)process.exitCode=1
