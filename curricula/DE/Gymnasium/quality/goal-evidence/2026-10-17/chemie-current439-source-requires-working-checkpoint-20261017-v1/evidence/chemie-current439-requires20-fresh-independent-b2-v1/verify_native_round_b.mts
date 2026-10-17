import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { validateGoalDescriptionReviewBatch } from '/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-only-native20-preparation-technical-c-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'
const output = '/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-requires20-fresh-independent-b2-v1'
const validator = '/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-only-native20-preparation-technical-c-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'
const digest = (value: Buffer) => createHash('sha256').update(value).digest('hex')
const [bundleBytes,inputBytes,campaignBytes,runBytes,batchInputBytes,recordsBytes,validatorBytes,firstBytes,sealBytes] = await Promise.all([
 'native/review-bundle-manifest.json','native/description-review-input.json','native/description-review-campaign.json','native/run-manifest.json','native/batch-001.input.jsonl','native/description-records.jsonl',
].map(p=>readFile(`${output}/${p}`)).concat([readFile(validator),readFile(`${output}/FIRST.science.free-independent-round-b.json`),readFile(`${output}/FIRST.seal.json`)]))
const result = await validateGoalDescriptionReviewBatch({bundle:JSON.parse(bundleBytes.toString()),input:JSON.parse(inputBytes.toString()),campaign:JSON.parse(campaignBytes.toString()),run:JSON.parse(runBytes.toString()),batchInputBytes,recordsBytes})
const seal = JSON.parse(sealBytes.toString())
const frozenRoot='/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-only-native20-preparation-technical-c-v1/capsule/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-requires-only-native20-preparation-technical-c-v1/native20/round-b'
const frozenInput=await readFile(`${frozenRoot}/description-review-input.json`)
const frozenCampaign=await readFile(`${frozenRoot}/description-review-campaign.json`)
const canonicalStockValidator=await readFile('/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts')
const copiedExact=digest(inputBytes)===digest(frozenInput)&&digest(campaignBytes)===digest(frozenCampaign)
const checks={atUTC:new Date().toISOString(),validatorImportPath:validator,validatorSha256:digest(validatorBytes),stockValidatorUnmodified:digest(validatorBytes)===digest(canonicalStockValidator),execArgv:process.execArgv,nodeVersion:process.version,checks:{stockNativeBatchErrors:result.errors,stockNativeRecordCount:result.records.length,firstSealUnchanged:digest(firstBytes)===seal.sha256,stockCurrentInputCopiedByteExact:copiedExact},pins:{firstSha256:digest(firstBytes),recordsSha256:digest(recordsBytes),runSha256:digest(runBytes),batchInputSha256:digest(batchInputBytes),campaignSha256:digest(campaignBytes)},status:result.errors.length===0&&digest(firstBytes)===seal.sha256&&copiedExact?'PASS':'FAIL',scope:'Technical native validation only; all records remain candidate/ai_candidate; no content changes or human approval.'}
await writeFile(`${output}/CHECK.actual-imported-unmodified-stock-round-b.json`,JSON.stringify(checks,null,2)+'\n')
console.log(JSON.stringify(checks))
if(checks.status!=='PASS')process.exitCode=1
