import {readFileSync,writeFileSync}from'node:fs'
import {createHash}from'node:crypto'
import assert from'node:assert/strict'
import Ajv2020 from'/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from'/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import {fingerprintPositiveGoalEvidenceProfile}from'/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const root='/home/enpasos/projects/skillpilot',out=`${root}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-nine-current-reviewed-p-v1`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const candidate=read(`${out}/positive-evidence.candidates.json`)
const sourcePath=`${root}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-stoffmenge-quantitative-foundations-twelve-candidate-v1/positive-evidence.candidates.json`
const source=read(sourcePath),input=read(`${root}/curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1/2026-10-05/batch-013-stoffmenge-revised-nine-current-v1/round-a/description-review-input.json`)
const schemaPath=`${root}/contracts/goal-evidence/v2/goal-evidence-profile.schema.json`,schema=read(schemaPath)
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv)
// Validate the genuine unchanged inner schema. No current record is built.
const validate=ajv.compile({$schema:schema.$schema,$id:'https://skillpilot.com/local/unbound-profile-validation',$defs:schema.$defs,$ref:'#/$defs/profile'})
assert.deepEqual(Object.keys(candidate).sort(),['schemaVersion','authoringContract','reviewId','reviewedAt','reviewer','goals'].sort())
assert.equal(candidate.schemaVersion,1);assert.equal(candidate.authoringContract,'positive-understanding-evidence-candidates-v1')
assert.match(candidate.reviewId,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert(candidate.reviewId.length<=100)
assert(Number.isFinite(Date.parse(candidate.reviewedAt)));assert(candidate.reviewer.trim())
assert.deepEqual(candidate.goals.map((g:any)=>g.goalId),input.goals.map((g:any)=>g.goalId))
assert.equal(candidate.goals.length,9);assert.equal(new Set(candidate.goals.map((g:any)=>g.goalId)).size,9)
const sourceById=new Map(source.goals.map((g:any)=>[g.goalId,g]))
const rows=candidate.goals.map((g:any)=>{
 const original:any=sourceById.get(g.goalId)
 assert.deepEqual(Object.keys(g).sort(),['goalId','reason','evidenceLevel','maximumClaimScope','dissent','profile'].sort())
 assert(g.reason.trim()&&g.reason.length<=2000);assert.equal(g.evidenceLevel,'E1');assert.equal(g.maximumClaimScope,'G1');assert.deepEqual(g.dissent,[])
 assert(validate(g.profile),JSON.stringify(validate.errors));assert.deepEqual(g.profile,original.profile)
 const p=g.profile,expectIds=p.expectations.map((x:any)=>x.id)
 for(const key of['expectations','variationAxes','applicationCaseBriefs'])assert.equal(p[key].length,new Set(p[key].map((x:any)=>x.id)).size)
 assert(p.coverageExpectations.requiredExpectationIds.every((x:string)=>expectIds.includes(x)))
 assert(p.coverageExpectations.alternativeExpectationGroups.flat().every((x:string)=>expectIds.includes(x)))
 const before=fingerprintPositiveGoalEvidenceProfile(original.profile),after=fingerprintPositiveGoalEvidenceProfile(g.profile)
 assert.equal(after,before)
 return {goalId:g.goalId,innerSchemaValid:true,profileLocalSemanticsValid:true,sourceProfileFingerprint:before,filteredProfileFingerprint:after,innerProfileUnchanged:true,reasonCharacters:g.reason.length}
})
const receipt={checkedAtUtc:new Date().toISOString(),method:'Genuine contracts/goal-evidence/v2 $defs.profile schema with Ajv2020; exact CandidateSet/CandidateSpec keys and scope/order from the actual materializer interface; actual official inner-profile fingerprint function. Profile-local reference/uniqueness constraints follow current positiveGoalEvidenceProfileModel.ts. This is unbound authoring validation only.',candidateAuthoringContract:'positive-understanding-evidence-candidates-v1',profileRuleVersion:'positive-understanding-evidence-v2',profileSchemaPath:schemaPath.slice(root.length+1),profileSchemaDigest:sha(schemaPath),actualMaterializerDigest:sha(`${root}/app/scripts/materializePositiveGoalEvidenceCandidates.ts`),candidateDigest:sha(`${out}/positive-evidence.candidates.json`),sourceCandidateDigest:sha(sourcePath),materializerInvoked:false,currentRecordsConstructed:0,currentRecordsWritten:0,reviewConfigWritten:false,registryMutation:false,goalResourceOrPageBindingClaimed:false,humanApproval:false,rows}
writeFileSync(`${out}/unbound-authoring-validation.receipt.json`,JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({profiles:rows.length,innerSchemaErrors:0,innerProfilesUnchanged:true,currentRecordsConstructed:0,currentRecordsWritten:0}))
