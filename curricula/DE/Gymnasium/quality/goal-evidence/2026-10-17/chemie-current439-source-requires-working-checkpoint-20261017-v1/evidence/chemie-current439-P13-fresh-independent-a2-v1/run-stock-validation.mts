import { readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { createHash } from 'node:crypto'
import { validateGoalDescriptionReviewBatch, validateGoalDescriptionReviewCampaign } from '/mnt/e/skillpilot-chemie-L7-20261017/current439-P13-native-preparation-technical-root-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import { validateGoalDescriptionReviewCampaignResultDirectories } from '/mnt/e/skillpilot-chemie-L7-20261017/current439-P13-native-preparation-technical-root-v1/capsule/app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
const out='/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-P13-fresh-independent-a2-v1'
const selector=JSON.parse(await readFile('/mnt/e/skillpilot-chemie-L7-20261017/review-scientific-views-root-v1/SELECTOR.P13.scientific-view-for-independent-review.json','utf8'))
const pins=selector.rounds[0].inputPins
const buffers=await Promise.all(pins.map((pin:any)=>readFile(pin.path)))
for(let i=0;i<pins.length;i++)if(createHash('sha256').update(buffers[i]).digest('hex')!==pins[i].sha256)throw new Error('Original input pin mismatch '+i)
const [bundle,input,campaign]=buffers.slice(0,3).map((b:any)=>JSON.parse(b.toString('utf8')))
const batch=campaign.batches[0];const resultsDirectory=join(out,'native-round-a-results')
const run=JSON.parse(await readFile(join(resultsDirectory,batch.batchId+'.run.json'),'utf8'))
const recordsBytes=await readFile(join(resultsDirectory,batch.batchId+'.records.jsonl'))
const cr=await validateGoalDescriptionReviewCampaign({bundle,input,campaign})
const br=await validateGoalDescriptionReviewBatch({bundle,input,campaign,run,batchInputBytes:buffers[3],recordsBytes})
const ar=await validateGoalDescriptionReviewCampaignResultDirectories({bundle,input,campaign,batchesDirectory:dirname(pins[3].path),resultsDirectory})
const result={checkedAtUTC:new Date().toISOString(),stockApiExecuted:true,campaign:{errors:cr.errors},batch:{errors:br.errors,recordCount:br.records.length},campaignResults:{errors:ar.errors,recordCount:ar.records.length},humanApproval:false,scope:'only original thirteen-goal round A; no central QS/build'}
await writeFile(join(out,'stock-validation.result.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2))
if(cr.errors.length||br.errors.length||ar.errors.length)process.exitCode=1
