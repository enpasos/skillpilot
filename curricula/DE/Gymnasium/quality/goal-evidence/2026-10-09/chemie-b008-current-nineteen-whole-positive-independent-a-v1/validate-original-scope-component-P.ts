import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {
  POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceReviewInput,
  fingerprintPositiveGoalEvidenceProfile,
  validatePositiveGoalEvidenceRecordSemantics,
} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'

const own=dirname(fileURLToPath(import.meta.url))
const root=resolve(own,'../../../../../../..')
const base=resolve(own,'..')
const author=resolve(base,'chemie-b008-current-nineteen-whole-positive-author-v1')
const rawPath=resolve(base,'chemie-b008-current-twenty-six-native-preparation-author-v1/input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json')
const load=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const sha=(value:Buffer|string)=>`sha256:${createHash('sha256').update(value).digest('hex')}`
const binding=(path:string)=>({path:relative(root,path),digest:sha(readFileSync(path)),bytes:readFileSync(path).length})
const verdict=load(resolve(own,'nineteen-whole-science-source-scope-P.first.independent-A.verdict.json'))
const raw=load(rawPath)
const specs=readFileSync(resolve(author,'author-candidates.jsonl'),'utf8').trim().split('\n').map(line=>JSON.parse(line))
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
  const routine=raw.routineBodies.find((v:any)=>v.wholeGoal.id===spec.goalId)
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
  const notes=verdict.records[index].reviewNotes
  const record={
    $schema:POSITIVE_GOAL_EVIDENCE_SCHEMA_URL,schemaVersion:2,
    reviewId:'chemie-b008-current-nineteen-original-scope-component-independent-a-v1',
    goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint:criteriaFP,
    landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',goalId:spec.goalId,
    goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),
    reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFP,resourceDigests,'curricularAtomic'),
    profileFingerprint:fingerprintPositiveGoalEvidenceProfile(spec.profile),
    status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:verdict.reviewedAt,
    reviewer:'OpenAI Codex independent A /root/bio_science14_independent_a; model variant unexposed',
    reason:`Independent original-scope candidate review. ${notes.chemicalReasoning} ${notes.observablePerformanceAndTransfer}`,
    evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],
    dissent:[
      'This record validates the exact original whole-goal component input and the exact new profile body. It is not bound to reviewed native pages or the later current19 resource capsule and cannot count as current D/P/A/M/V or strict completion.',
      'Whole Source19, current national source/course/target applicability and concrete partner operator closure remain HOLD. No author example records actual learner laboratory work, research, digital output, dialogue or presentation.',
      ...(index===16?['CHEM19A-001 HOLD: mandatory supplied spatial L/L2 poses/contact comparison is not finite/reproducible in the available kit; retain original archive and supply operative bounded geometry materials.']:[]),
    ],profile:spec.profile,
  }
  if(!validate(record))errors.push(...(validate.errors??[]).map(e=>`${spec.goalId}: ${e.instancePath} ${e.message}`))
  errors.push(...validatePositiveGoalEvidenceRecordSemantics(record as any,goal,resourceDigests,'curricularAtomic'))
  rows.push({goalId:goal.id,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,scientificVerdict:verdict.records[index].scientificCandidateVerdict,semanticKindForComponentCheck:'curricularAtomic',authoritativeCurrentSemanticKindApproval:false,sourceInputPointer:`/routineBodies/${raw.routineBodies.indexOf(routine)}/wholeGoal`})
  return record
})
const outputPath=resolve(own,'nineteen.original-goal.component-positive.records.jsonl')
writeFileSync(outputPath,records.map(r=>JSON.stringify(r)).join('\n')+'\n',{flag:'wx'})
const report={schemaVersion:1,role:'Actual closed normal P-v2 schema and semantics checks of the chosen original component inputs; no current native P approval',exactInputs:[binding(rawPath),binding(resolve(author,'author-candidates.jsonl')),binding(criteriaPath),binding(schemaPath),binding(resolve(own,'nineteen-whole-science-source-scope-P.first.independent-A.verdict.json'))],recordOutput:binding(outputPath),records:records.length,resourceBindings,rows,errors,status:errors.length?'HOLD':'PASS_component_contract_only',ordinaryCurrentPApproved:false,authoritativeCurrentSemanticKindApproval:false,humanApproval:false,humanTrial:false,strictGain:0}
writeFileSync(resolve(own,'component-profile-schema-and-semantics.actual-validation.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({records:records.length,errors,ordinaryCurrentPApproved:false,strictGain:0}))
if(errors.length)process.exitCode=1
