import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { validateGoalDescriptionReviewCampaignResults } from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaignResults.ts'
import { reviewPositiveGoalEvidenceConfig } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
const root='/home/enpasos/projects/skillpilot'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-independent-b-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const bytes=(p:string)=>readFileSync(resolve(root,p))
const bind=(p:string)=>({path:p,sha256:'sha256:'+createHash('sha256').update(bytes(p)).digest('hex'),bytes:bytes(p).length})
async function main(){
 const receipt=read(own+'/normal-current-records.materialization.receipt.json')
 const ent=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-upper-science-fourteen-whole-author-v1/native-targeted-two-v2/neutral-targeted-two-native-independent-review.entry.json')
 const ce=ent.campaigns.find((x:any)=>x.side==='b');const campaign=read(ce.campaignPath);const batch=campaign.batches[0]
 const d=await validateGoalDescriptionReviewCampaignResults({bundle:read(ent.actualNativeBundlePath),input:read(ce.inputPath),campaign,resultPairs:[{batchId:batch.batchId,run:read(receipt.normalD2Run.path),batchInputBytes:bytes(ce.batchesDirectory+'/'+batch.batchId+'.input.jsonl'),recordsBytes:bytes(receipt.normalD2Records.path)}]})
 const p=receipt.positiveOutputs.map((o:any)=>{const r=reviewPositiveGoalEvidenceConfig(o.config.path);return {label:o.label,config:bind(o.config.path),recordCount:r.records.length,counts:r.counts,errors:r.errors}})
 const output={schemaVersion:1,createdAtUTC:new Date().toISOString(),actualD2CampaignValidator:{recordCount:d.records.length,errors:d.errors,run:bind(receipt.normalD2Run.path),records:bind(receipt.normalD2Records.path)},actualPositiveNormalValidators:p,humanApproval:false,strictGain:0,activeWrites:[]}
 const path=resolve(root,own+'/normal-D2-P12-P2.actual-validator-terminal.json');if(existsSync(path))throw Error('existing output');writeFileSync(path,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify(output));if(d.errors.length||p.some((x:any)=>x.errors.length))process.exitCode=1
}
main().catch(e=>{console.error(e);process.exitCode=1})
