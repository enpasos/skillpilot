// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current-native-independent-root-a-20261007-v1')
const author=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v2')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const rows=read(resolve(author,'four-current-native-whole-goals-cases-source-review-input.author.raw.json')).wholeFourGoals
const records=readFileSync(resolve(own,'native/positive-four.root-current-images.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const resourceDigests:Record<string,string>={}
const images=[]
for(const row of rows) for(const link of row.wholeCandidateGoal.resourceLinks??[]) {
  if(link.type!=='goal-visualization'||link.resourceType!=='image')continue
  const path=resolve(author,'selected-existing-images',row.goalId+'.png')
  resourceDigests[link.url]=hash(path)
  images.push({goalId:row.goalId,path,url:link.url,digest:resourceDigests[link.url]})
}
if(images.length!==4)throw new Error('Four actual retained PNG bindings required')
const schemaPath=resolve('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(schemaPath));const errors:string[]=[]
for(const record of records){
  const goal=rows.find((r:any)=>r.goalId===record.goalId).wholeCandidateGoal
  if(record.goalFingerprint!==fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'))errors.push(record.goalId+': goal binding')
  if(record.reviewInputFingerprint!==fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,resourceDigests,'curricularAtomic'))errors.push(record.goalId+': current image input binding')
  if(record.profileFingerprint!==fingerprintPositiveGoalEvidenceProfile(record.profile))errors.push(record.goalId+': whole profile binding')
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record,goal,resourceDigests,'curricularAtomic'))
  if(!validate(record))errors.push(...(validate.errors??[]).map((e:any)=>JSON.stringify(e)))
}
writeFileSync(resolve(own,'native/four-current-P.native-schema-semantic-and-image-binding.actual.json'),JSON.stringify({completedAtUTC:new Date().toISOString(),checked:records.length,images,resourceDigests,schemaPath,schemaDigest:hash(schemaPath),errors,scientificDecisionSource:'own original first pass plus ffef v2 targeted reconciliation',status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',humanApproval:false,strictGain:0},null,2)+'\n',{flag:'wx'})
if(errors.length)throw new Error(errors.join('\n'))
console.log('Current Root P4: native schema, semantics and four actual image bindings pass')
