// Apache-2.0. No scientific approval: schema and exact author-input binding only.
import {readFileSync,writeFileSync,mkdirSync}from'node:fs'
import {createHash}from'node:crypto'
import {createRequire}from'node:module'
import {fingerprintPositiveGoalEvidenceReviewInput,validatePositiveGoalEvidenceRecordSemantics,fingerprintPositiveGoalEvidenceProfile}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
import {reviewPositiveGoalEvidenceConfig}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceReview.ts'
const R='/home/enpasos/projects/skillpilot',rel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-residual-e5d-case2-complete-material-targeted-author-successor-20261014-v1',O=R+'/'+rel
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(x:Buffer|string)=>'sha256:'+createHash('sha256').update(x).digest('hex'),write=(n:string,x:unknown)=>writeFileSync(O+'/'+n,JSON.stringify(x,null,2)+'\n')
const records=readFileSync(O+'/inputs/two-original-P2-profile-records.unchanged-reference.jsonl','utf8').split(/\r?\n/).filter(x=>x.trim()).map(x=>JSON.parse(x))
const original=records.find(x=>x.goalId==='e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd'),record=structuredClone(original)
const canonical=read(O+'/inputs/canonical536.prospective409.original-unchanged.json'),goal=canonical.goals.find((x:any)=>x.id===record.goalId),criteria=readFileSync(O+'/P/criteria.material-only-e5d-successor.E0-G0.md')
record.reviewId='chemie-residual-e5d-material-only-author-successor-20261014-v1'
record.reviewCriteriaFingerprint=sha(criteria)
record.reviewInputFingerprint=fingerprintPositiveGoalEvidenceReviewInput(goal,record.reviewCriteriaFingerprint,{},'curricularAtomic')
record.reviewedAt=new Date().toISOString()
record.reviewer='Same residual-duty AUTHOR; targeted missing D material correction, not an independent review'
record.reason='Unreviewed E0/G0 material-only successor. Case2 D now actually supplies substance/use information and three handling rules; F requires only the insufficiency of equal coarsepH, no unknown specific hazards. Whole profile body, task/model/rubric, other three cases and goals remain exact. No new learner execution, independent vote, source/course/A/M/kind/D/V/Human approval.'
record.reviewRunIds=[];record.dissent=[];record.evidenceLevel='E0';record.maximumClaimScope='G0';record.status='needs_human_review';record.reviewAuthority='ai_candidate'
if(JSON.stringify(record.profile)!==JSON.stringify(original.profile))throw Error('profile body changed')
if(record.goalFingerprint!==original.goalFingerprint||record.profileFingerprint!==original.profileFingerprint||record.profileFingerprint!==fingerprintPositiveGoalEvidenceProfile(record.profile))throw Error('scientific fingerprint changed')
const errors=validatePositiveGoalEvidenceRecordSemantics(record,goal,{},'curricularAtomic');if(errors.length)throw Error(JSON.stringify(errors))
const require=createRequire(R+'/app/package.json'),Ajv=require('ajv/dist/2020').default,ajv=new Ajv({strict:true,allErrors:true});require('ajv-formats')(ajv)
const schema=ajv.compile(read(R+'/contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));if(!schema(record))throw Error(JSON.stringify(schema.errors))
writeFileSync(O+'/P/P1.e5d-material-only-unreviewed-author.E0G0.jsonl',JSON.stringify(record)+'\n')
mkdirSync(O+'/config',{recursive:true});mkdirSync(O+'/checks',{recursive:true})
const config={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:record.reviewId,goalFingerprintRuleVersion:record.goalFingerprintRuleVersion,profileRuleVersion:record.profileRuleVersion,landscapeId:record.landscapeId,landscapePath:rel+'/inputs/canonical536.prospective409.original-unchanged.json',semanticKindLedgerPath:rel+'/inputs/semantic533.original-unchanged.json',reviewCriteriaPath:rel+'/P/criteria.material-only-e5d-successor.E0-G0.md',reviewPath:rel+'/P/P1.e5d-material-only-unreviewed-author.E0G0.jsonl',reviewedResourceTypes:['goal-visualization'],reviewRunManifestPaths:[],requireApproved:false,scope:{label:'Material-only unreviewed author successor; original pending-kind baseline retained, not current kind approval',goalIds:[record.goalId]}}
write('config/P1.e5d-material-only.NONOPERATIVE-pending-kind.config.json',config)
const normal=reviewPositiveGoalEvidenceConfig(rel+'/config/P1.e5d-material-only.NONOPERATIVE-pending-kind.config.json')
if(normal.errors.length!==3||normal.errors.filter(x=>x.includes('no authoritative semantic-kind')).length!==1)throw Error('Unexpected ordinary old-kind-ledger state:'+JSON.stringify(normal.errors))
write('checks/STOCK.schema-and-explicit-prospective-FP-pass-normal-original-kind-ledger-HOLD.actual.json',{schemaVersion:1,checkedAt:new Date().toISOString(),recordSchemaValid:true,explicitProspectiveKindSemanticsErrors:errors,profileBodyAndGoalProfileFingerprintsUnchanged:true,newCriteriaBindsActualSuccessorMaterialSHA:true,normalUnmodifiedPConfig:normal.config,normalExpectedErrors:normal.errors,normalApprovalOrGatePass:false,why:'This author package retains its exact original533 semantic ledger. Actual independent kind science/integration is separate; no new authority rows are fabricated here.',newIndependentVotes:0,newLearnerWork:false,newPClosure:false})
console.log(JSON.stringify({schemaPass:true,unchangedWholeProfile:true,normalExpectedMissingKind:1,normalExpectedDependentFingerprintErrors:2,authorE0G0:true,newApprovals:0}))
