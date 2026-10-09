import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
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
const base=resolve(own,'../..')
const author=resolve(base,'chemie-b008-current-nineteen-whole-positive-author-v1')
const rawPath=resolve(author,'remediation-v2/targeted-three.whole-goals-and-profile-bodies.v2-final.author-candidate.json')
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const sha=(value:Buffer|string)=>`sha256:${createHash('sha256').update(value).digest('hex')}`
const binding=(path:string)=>({path:relative(root,path),digest:sha(readFileSync(path)),bytes:readFileSync(path).length})
const verdict=load(resolve(own,'targeted-three-whole-material.first-followup.independent-A.verdict.json'))
const raw=load(rawPath)
const specs=readFileSync(resolve(author,'remediation-v2/targeted-three.author-candidates.v2-final.jsonl'),'utf8').trim().split('\n').map(line=>JSON.parse(line))
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
const schemaPath=resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const criteriaFP=sha(readFileSync(criteriaPath))
const ajv=new Ajv2020({allErrors:true,strict:false})
addFormats(ajv)
const validate=ajv.compile(load(schemaPath))
const errors:string[]=[]
const rows:any[]=[]
const resourceBindings:any[]=[]
const records=specs.map((spec:any,index:number)=>{
  const routine=raw.entries.find((v:any)=>v.wholeGoal.id===spec.goalId)
  if (!routine) throw new Error(`Missing exact original goal ${spec.goalId}`)
  const goal=routine.wholeGoal
  const resourceDigests:Record<string,string>={}
  for(const link of goal.resourceLinks??[]){
    if(link.type!=='goal-visualization')continue
    if(!link.url.startsWith('/assets/'))throw new Error(`Unsupported original URL ${link.url}`)
    const asset=resolve(root,'app/public'+link.url)
    resourceDigests[link.url]=sha(readFileSync(asset))
    resourceBindings.push({...binding(asset),url:link.url,goalId:goal.id,visualReviewPerformed:false,reason:'Digest binding of the actual original resource only; unchanged valid images were not rereviewed.'})
  }
  const notes=verdict.records.find((r:any)=>r.goalId===spec.goalId).reviewNotes
  const record={
    $schema:POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:2,
    reviewId:'chemie-b008-targeted-three-v2-final-component-independent-a-v1',
    goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint:criteriaFP,
    landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',goalId:spec.goalId,
    goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
    reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFP,resourceDigests,'curricularAtomic'),
    profileFingerprint:fingerprintPositiveGoalEvidenceProfile(spec.profile),
    status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:verdict.reviewedAt,
    reviewer:'OpenAI Codex independent A /root/bio_science14_independent_a; model variant unexposed',
    reason:`Independent targeted three whole material/profile successor candidate review. ${notes.chemicalReasoning} ${notes.observablePerformanceAndTransfer}`,
    evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],
    dissent:[
      'This record validates the exact original whole-goal component input and the exact new profile body. It is not bound to reviewed native pages or the later current19 resource capsule and cannot count as current D/P/A/M/V or strict completion.',
      'Whole Source19, current national source/course/target applicability and concrete partner operator closure remain HOLD. No author example records actual learner laboratory work, research, digital output, dialogue or presentation.',
      'Actual targeted semantic first approves bounded candidate material only; ROOT19-001/002/CHEM19A-001 resolved on this successor without rewriting earlier first judgments.',
    ],profile:spec.profile,
  }
  if(!validate(record))errors.push(...(validate.errors??[]).map(e=>`${spec.goalId}: ${e.instancePath} ${e.message}`))
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record as any,goal,resourceDigests,'curricularAtomic'))
  rows.push({goalId:goal.id,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,scientificVerdict:verdict.records.find((r:any)=>r.goalId===spec.goalId).scientificCandidateVerdict,semanticKindForComponentCheck:'curricularAtomic',authoritativeCurrentSemanticKindApproval:false,sourceInputPointer:`/entries/${raw.entries.indexOf(routine)}/wholeGoal`})
  return record
})
const outputPath=resolve(own,'targeted-three.v2-final.component-positive.records.jsonl')
writeFileSync(outputPath,records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const report={schemaVersion:1,role:'Actual closed normal P-v2 schema and semantics checks of the actual chosen v2-final component whole-goal/profile inputs with their exact empty-resource frame; no current native P approval',exactInputs:[binding(rawPath),binding(resolve(author,'remediation-v2/targeted-three.author-candidates.v2-final.jsonl')),binding(criteriaPath),binding(schemaPath),binding(resolve(own,'targeted-three-whole-material.first-followup.independent-A.verdict.json'))],recordOutput:binding(outputPath),records:records.length,resourceBindings,rows,errors,status:errors.length?'HOLD':'PASS_component_contract_only',ordinaryCurrentPApproved:false,authoritativeCurrentSemanticKindApproval:false,humanApproval:false,humanTrial:false,strictGain:0}
writeFileSync(resolve(own,'targeted-three.v2-final.component-profile-schema-and-semantics.actual-validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({records:records.length,errors,ordinaryCurrentPApproved:false,strictGain:0}))
if(errors.length)process.exitCode=1
