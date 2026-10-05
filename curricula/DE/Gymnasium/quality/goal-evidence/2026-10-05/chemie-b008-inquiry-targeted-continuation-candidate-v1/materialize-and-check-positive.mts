import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile, fingerprintPositiveGoalEvidenceReviewInput, validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel'
const root='/home/enpasos/projects/skillpilot'
const out=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-inquiry-targeted-continuation-candidate-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const digest=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
const startedAt=new Date().toISOString()
const specs=read(resolve(out,'positive-evidence.candidates.json')), goals=read(resolve(out,'provisional-profile-goals.json'))
const criteriaPath=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md')
const criteriaFp=digest(criteriaPath)
const schemaPath=resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const validate=ajv.compile(read(schemaPath))
const results:any[]=[]
const records=specs.goals.map((s:any)=>{
 const goal=goals.goals.find((g:any)=>g.id===s.goalId)
 const r={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',schemaVersion:2,reviewId:specs.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',reviewCriteriaFingerprint:criteriaFp,landscapeId:goals.landscapeId,goalId:s.goalId,goalFingerprint:fingerprintGoalForPositiveEvidence(goal,'curricularAtomic'),reviewInputFingerprint:fingerprintPositiveGoalEvidenceReviewInput(goal,criteriaFp,{},'curricularAtomic'),profileFingerprint:fingerprintPositiveGoalEvidenceProfile(s.profile),status:'needs_human_review',reviewAuthority:'ai_candidate',reviewedAt:specs.reviewedAt,reviewer:specs.reviewer,reason:s.reason,evidenceLevel:'E1',maximumClaimScope:'G1',reviewRunIds:[],dissent:s.dissent,profile:s.profile}
 const valid=validate(r)
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(r as any,goal,{},'curricularAtomic')
 results.push({candidateGoalId:s.goalId,schemaValid:!!valid,schemaErrors:validate.errors??[],provisionalBindingSemanticErrors:semanticErrors})
 return r
})
writeFileSync(resolve(out,'positive-evidence.records.jsonl'),records.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const proof={schemaVersion:1,startedAt,completedAt:new Date().toISOString(),scope:'Contract and fingerprint validation against the explicit provisional-profile-goals snapshot. No active canonical/semantic-ledger or authoritative registration validation is claimed.',schemaPath:schemaPath.slice(root.length+1),schemaByteDigest:digest(schemaPath),criteriaByteDigest:criteriaFp,provisionalSnapshotByteDigest:digest(resolve(out,'provisional-profile-goals.json')),authoringCandidateByteDigest:digest(resolve(out,'positive-evidence.candidates.json')),recordsByteDigest:digest(resolve(out,'positive-evidence.records.jsonl')),DfreezeByteDigest:digest(resolve(out,'D-findings.frozen.json')),profileCount:records.length,allSchemaAndProvisionalFingerprintChecksPassed:results.every(r=>r.schemaValid&&!r.provisionalBindingSemanticErrors.length),results}
writeFileSync(resolve(out,'positive-validation-proof.json'),JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify({profileCount:proof.profileCount,allSchemaAndProvisionalFingerprintChecksPassed:proof.allSchemaAndProvisionalFingerprintChecksPassed,recordsByteDigest:proof.recordsByteDigest,DfreezeByteDigest:proof.DfreezeByteDigest},null,2))
process.exitCode=proof.allSchemaAndProvisionalFingerprintChecksPassed?0:1
