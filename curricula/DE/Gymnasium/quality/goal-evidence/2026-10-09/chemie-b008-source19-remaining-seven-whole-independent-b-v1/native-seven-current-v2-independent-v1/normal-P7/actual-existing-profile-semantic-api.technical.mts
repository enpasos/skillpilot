import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root='/home/enpasos/projects/skillpilot',base=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const cfg=read(resolve(base,'profiles.independent-b.config.json'))
const rows=readFileSync(resolve(base,'profiles.independent-b.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const resources=read(resolve(base,'actual-byte-bound-seven-original-resource-digests.json')).resources
const goals=read(resolve(root,cfg.landscapePath)).goals
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const recordSchema=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const errors:string[]=[]
for (const r of rows){
 const resource=resources.find((x:any)=>x.goalId===r.goalId)
 const actual='sha256:'+createHash('sha256').update(readFileSync(resolve(root,resource.actualOriginal.path))).digest('hex')
 if(actual!==resource.actualOriginal.sha256 || actual!==resource.expectedActualNativeDigest)throw new Error('Actual image-byte binding changed '+r.goalId)
 if(!recordSchema(r))errors.push(r.goalId+': '+ajv.errorsText(recordSchema.errors))
 errors.push(...validatePositiveGoalEvidenceRecordSemantics(r,goals.find((g:any)=>g.id===r.goalId),{[resource.url]:actual},'curricularAtomic'))
}
const receipt={schemaVersion:1,executedAt:new Date().toISOString(),actualExistingAPI:'validatePositiveGoalEvidenceRecordSemantics',normalV2RecordSchema:true,scope:'portable_candidate_only_actual_original_asset_bytes; not ordinary active-public/import PASS',recordCount:rows.length,errors,noFsAliasMockOrSuppression:true,humanApproval:false,strictGain:0}
writeFileSync(resolve(base,'actual-existing-profile-semantic-api.receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(receipt));if(errors.length)process.exitCode=1
