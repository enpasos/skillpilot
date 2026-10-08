// Scoped independent B validation. Writes only this review's technical evidence.
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { validateGoalDescriptionReviewCampaignResultDirectories } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaignResults'

const out=dirname(fileURLToPath(import.meta.url)), root=resolve(out,'../../../../../../..')
const author=resolve(out,'../chemie-q3-two-native-source-roles-resume-technical-20261008-v1'), round=resolve(author,'native/two/round-b')
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const sha=(bytes:Buffer)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const canonical=read(resolve(author,'candidate/canonical.current480.two-resource-links.inactive.json'))
const models=read(resolve(author,'native/full378-candidate.actual-api.book-model.json'))
const records=readFileSync(resolve(out,'P2-actual-independent-b-candidate.records.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validate=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
const positive=[]
for(const record of records){
 const goal=canonical.goals.find((g:any)=>g.id===record.goalId)
 const link=goal.resourceLinks.find((l:any)=>l.type==='goal-visualization'&&l.role==='primary')
 const ext=link.url.endsWith('.png')?'.png':'.jpg'
 const actual=sha(readFileSync(resolve(author,'selected-images',record.goalId+ext)))
 const resources={[link.url]:actual}
 const page=models.pages.find((p:any)=>p.goalId===record.goalId)
 const schemaPass=validate(record)
 const errors=validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,'curricularAtomic')
 if(page.visualization.originalDigest!==actual)errors.push('Full378 page actual asset binding differs')
 positive.push({goalId:record.goalId,actualResources:resources,schemaPass,schemaErrors:validate.errors??[],semanticErrors:errors,full378GoalFingerprintEqualsRecord:page.goalFingerprint===record.goalFingerprint})
}
const campaignResult=await validateGoalDescriptionReviewCampaignResultDirectories({bundle:read(resolve(round,'review-bundle-manifest.json')),input:read(resolve(round,'description-review-input.json')),campaign:read(resolve(round,'description-review-campaign.json')),batchesDirectory:resolve(round,'batches'),resultsDirectory:resolve(round,'results')})
const result={schemaVersion:1,reviewer:'/root/curricula_live_diagnosis/zip64_loader_source',ordinaryRoundBRecords:campaignResult.records.length,ordinaryRoundBErrors:campaignResult.errors,positive,allPassed:campaignResult.errors.length===0&&positive.every(p=>p.schemaPass&&p.semanticErrors.length===0&&p.full378GoalFingerprintEqualsRecord),activeWrites:0,fullQARun:false}
writeFileSync(resolve(out,'native-b.actual-api-and-campaign-validation.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result,null,2));if(!result.allPassed)process.exitCode=1
