// SPDX-License-Identifier: Apache-2.0
import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join } from 'node:path'
import { validateGoalDescriptionReviewCampaignResultDirectories } from '/home/enpasos/projects/skillpilot/tmp/chemie-q1-final378-independent-a-native-d-20261006-v1/app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
const root='/home/enpasos/projects/skillpilot'
const evidence=join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
const prep=join(evidence,'chemie-q1-current378-routes-native-d-preparation-v1')
const own=join(evidence,'chemie-q1-final378-independent-a-native-d-v1')
const load=async(path:string)=>JSON.parse(await readFile(path,'utf8'))
const sha=(bytes:Buffer)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const checks=await Promise.all(['001','002','003'].map(async n=>{
 const round=join(prep,'native-current-d-batches','batch-'+n,'round-a')
 const results=join(own,'native-current-d-results','batch-'+n,'results')
 const campaign=await load(join(round,'description-review-campaign.json'))
 const validation=await validateGoalDescriptionReviewCampaignResultDirectories({bundle:await load(join(round,'review-bundle-manifest.json')),input:await load(join(round,'description-review-input.json')),campaign,batchesDirectory:join(round,'batches'),resultsDirectory:results})
 const batch=campaign.batches[0]
 return {batch:n,campaignId:campaign.campaignId,roundId:campaign.roundId,resultsDirectory:results,recordCount:validation.records.length,errors:validation.errors,recordsDigest:sha(await readFile(join(results,batch.batchId+'.records.jsonl'))),runDigest:sha(await readFile(join(results,batch.batchId+'.run.json')))}
}))
const result={schemaVersion:1,nativeValidator:'validateGoalDescriptionReviewCampaignResultDirectories',nativeCodeModified:false,checks,recordCount:checks.reduce((sum,c)=>sum+c.recordCount,0),errors:checks.flatMap(c=>c.errors),activeWrites:false,humanApproval:false}
await writeFile(join(own,'native-a-results-validation.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result))
if(result.errors.length)process.exitCode=1
