import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {
  POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own=dirname(fileURLToPath(import.meta.url))
const root=resolve(own,'../../../../../../../..')
const old=resolve(own,'..')
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(v:Buffer|string)=>`sha256:${createHash('sha256').update(v).digest('hex')}`
const bind=(p:string)=>({path:relative(root,p),sha256:sha(readFileSync(p)),bytes:readFileSync(p).length})
const original=load(resolve(old,'remaining-seven.normal-positive-profile-bodies.author-candidate.json'))
const revised=load(resolve(own,'remaining-seven.normal-positive-profile-bodies.v2.author-candidate.json'))
const candidates=load(resolve(own,'remaining-seven.normal-positive-candidate-set.v2.author-candidate.json'))
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
const schemaPath=resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const criteriaFP=sha(readFileSync(criteriaPath))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
const validate=ajv.compile(load(schemaPath))
const errors:string[]=[]
const changedProfileIds:string[]=[]
const records=candidates.goals.map((spec:any,index:number)=>{
  const g=revised.entries[index].goal
  if(JSON.stringify(g)!==JSON.stringify(original.entries[index].goal))errors.push(`${g.id}: original goal changed`)
  if(JSON.stringify(spec.profile)!==JSON.stringify(revised.entries[index].profile))errors.push(`${g.id}: candidate/profile body differs`)
  if(JSON.stringify(spec.profile)!==JSON.stringify(original.entries[index].profile))changedProfileIds.push(g.id)
  if((g.resourceLinks??[]).length)errors.push(`${g.id}: prospective original-goal author scope unexpectedly has resources`)
  const r={$schema:POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:2,reviewId:candidates.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFP,landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',goalId:g.id,goalFingerprint:fingerprintGoalForPositiveEvidence(g,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(g,criteriaFP,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(spec.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:candidates.reviewedAt,reviewer:candidates.reviewer,reason:spec.reason,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:spec.dissent,profile:spec.profile}
  if(!validate(r))errors.push(...(validate.errors??[]).map(e=>`${g.id}: ${e.instancePath} ${e.message}`))
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(r as any,g,{},'curricularAtomic'))
  return r
})
const expectedChanged=['9fc800d1-92d1-5ef6-81c1-33960ae034dd','6c7ce93c-7675-51da-bc0c-7d0257f7ff7d']
if(JSON.stringify(changedProfileIds)!==JSON.stringify(expectedChanged))errors.push('Exactly2 targeted profile bodies were not changed')
const output=resolve(own,'remaining-seven.positive-understanding-evidence-v2.author-candidates.v2.jsonl')
writeFileSync(output,records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
writeFileSync(resolve(own,'targeted-seven-author-v2.normal-profile-actual-validation.json'),JSON.stringify({schemaVersion:1,role:'Actual author contract checks only; no independent/current-native approval',inputBindings:[bind(resolve(old,'remaining-seven.normal-positive-profile-bodies.author-candidate.json')),bind(resolve(own,'remaining-seven.normal-positive-profile-bodies.v2.author-candidate.json')),bind(resolve(own,'remaining-seven.normal-positive-candidate-set.v2.author-candidate.json')),bind(criteriaPath),bind(schemaPath)],output:bind(output),records:records.length,changedProfileIds,unchangedProfiles:5,originalGoalBodiesUnchanged:true,exactOriginalGoalResourcesEmpty:true,errors,status:errors.length?'HOLD':'PASS_author_contract_only',independentApproval:false,currentNativePApproval:false,formalCurrentSemanticKindApproval:false,humanApproval:false,humanTrial:false,strictGain:0},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({records:records.length,changedProfileIds,errors,currentNativePApproval:false}))
if(errors.length)process.exitCode=1
