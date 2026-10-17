import {readFile, writeFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {validateGoalDescriptionReviewBatch} from '/mnt/e/skillpilot-chemie-L7-20261017/current439-remaining-mixed18-preparation-technical-c-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'
const O='/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-mixed18-independent-a-v1'
const validator='/mnt/e/skillpilot-chemie-L7-20261017/current439-remaining-mixed18-preparation-technical-c-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'
const frozen='/mnt/e/skillpilot-chemie-L7-20261017/current439-remaining-mixed18-preparation-technical-c-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remaining-mixed18-preparation-technical-c-v1/native18/round-a'
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex')
const [bundleBytes,inputBytes,campaignBytes,runBytes,batchInputBytes,recordsBytes,validatorBytes,firstBytes,canonicalValidatorBytes,frozenInputBytes,frozenCampaignBytes]=await Promise.all([
 ...['review-bundle-manifest.json','description-review-input.json','description-review-campaign.json','run-manifest.json','batch-001.input.jsonl','description-records.jsonl'].map(p=>readFile(`${O}/native/${p}`)),
 readFile(validator),readFile(`${O}/FIRST.science.free-independent-round-a.sealed.json`),readFile('/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'),readFile(`${frozen}/description-review-input.json`),readFile(`${frozen}/description-review-campaign.json`)
])
const campaign=JSON.parse(campaignBytes.toString());const batch=campaign.batches[0]
const frozenBatch=await readFile(`${frozen}/batches/${batch.batchId}.input.jsonl`)
const result=await validateGoalDescriptionReviewBatch({bundle:JSON.parse(bundleBytes.toString()),input:JSON.parse(inputBytes.toString()),campaign,run:JSON.parse(runBytes.toString()),batchInputBytes,recordsBytes})
const firstUnchanged=sha(firstBytes)==='7cf873ab7b79a6e3ce9c7a938e3bbface9ac15b556f300e5600f677b3aeec876'
const exact=sha(inputBytes)===sha(frozenInputBytes)&&sha(campaignBytes)===sha(frozenCampaignBytes)&&sha(batchInputBytes)===sha(frozenBatch)
const unmodified=sha(validatorBytes)===sha(canonicalValidatorBytes)
const checks={atUTC:new Date().toISOString(),validatorImportPath:validator,validatorSha256:sha(validatorBytes),stockValidatorUnmodified:unmodified,execArgv:process.execArgv,nodeVersion:process.version,checks:{stockNativeBatchErrors:result.errors,stockNativeRecordCount:result.records.length,firstSealUnchanged:firstUnchanged,stockCurrentInputCampaignBatchCopiedByteExact:exact},pins:{firstSha256:sha(firstBytes),recordsSha256:sha(recordsBytes),runSha256:sha(runBytes),batchInputSha256:sha(batchInputBytes),campaignSha256:sha(campaignBytes)},status:result.errors.length===0&&result.records.length===18&&firstUnchanged&&exact&&unmodified?'PASS':'FAIL',scope:'Technical native validation only. All records remain candidate/ai_candidate. No canonical C/P/image changes, integration or human approval.'}
await writeFile(`${O}/CHECK.actual-imported-unmodified-stock-round-a.json`,JSON.stringify(checks,null,2)+'\n')
console.log(JSON.stringify(checks))
if(checks.status!=='PASS')process.exitCode=1
