// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
const here=dirname(fileURLToPath(import.meta.url))
const root=resolve(here,'../../../../../../..')
const author=resolve(here,'../biologie-q2-neurobiology-twenty-one-current-author-candidate-v1')
const require=createRequire(resolve(root,'app/package.json'))
const Ajv2020=require('ajv/dist/2020.js').default
const addFormats=require('ajv-formats').default
const read=async (path:string)=>JSON.parse(await readFile(path,'utf8'))
const candidateSet=await read(resolve(author,'positive-evidence.candidates.json'))
const config=await read(resolve(author,'positive-evidence.validation-only.config.json'))
const records=await buildPositiveGoalEvidenceCandidateRecords({config,candidateSet})
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const profileSchemaPath=resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const runtimeSchemaPath=resolve(root,'docs/landscape-runtime.schema.json')
ajv.addKeyword({keyword:'x-skillpilot-caseInsensitiveUniqueItems',type:'array',schemaType:'boolean',validate:(enabled:boolean, values:unknown[])=>!enabled||new Set(values.map(v=>typeof v==='string'?v.toLowerCase():JSON.stringify(v))).size===values.length})
const validate=ajv.compile(await read(profileSchemaPath))
const runtimeReceipt=await read(resolve(here,'runtime-schema.actual.receipt.json'))
const errors:string[]=[]
for(const record of records){if(!validate(record))errors.push(record.goalId+': '+ajv.errorsText(validate.errors));if(record.status!=='needs_human_review'||record.reviewAuthority!=='ai_candidate'||record.evidenceLevel!=='E1'||record.maximumClaimScope!=='G1')errors.push(record.goalId+': incorrect candidate authority')}
const snapshot=await read(resolve(author,'current-twenty-one.snapshot.json'))
const proposed=await read(resolve(author,'proposed-twenty-one.validation-snapshot.json'))
if(runtimeReceipt.errors.length)errors.push(...runtimeReceipt.errors)
const current=await read(resolve(root,snapshot.canonicalPath))
const exact=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b)
const currentMatches=snapshot.goals.every((g:any)=>exact(g,current.goals.find((c:any)=>c.id===g.id)))
if(!currentMatches)errors.push('Actual21 whole goals differ from capture')
const ids=new Set(proposed.goals.map((g:any)=>g.id));const byId=new Map(proposed.goals.map((g:any)=>[g.id,g]));const done=new Set();const stack=new Set();
const visit=(id:string)=>{if(stack.has(id)){errors.push('requires cycle at '+id);return};if(done.has(id))return;stack.add(id);for(const req of (byId.get(id) as any).requires??[]){if(!ids.has(req))errors.push(id+': unprovided requires '+req);else visit(req)};stack.delete(id);done.add(id)}
for(const id of ids as Set<string>)visit(id)
const receipts=records.map((r:any)=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,status:r.status,reviewAuthority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,applicationCases:r.profile.applicationCaseBriefs.length}))
await writeFile(resolve(here,'native-p-input-bindings.actual.json'),JSON.stringify(receipts,null,2)+'\n')
const receipt={schemaVersion:1,checkedAt:new Date().toISOString(),status:errors.length?'FAIL':'PASS_NATIVE_STRUCTURE_ONLY',nativeMaterializerSemanticErrors:[],schemaErrors:errors,nativeProfilesBuiltInMemory:records.length,bilingualCaseBriefs:records.reduce((n:any,r:any)=>n+r.profile.applicationCaseBriefs.length,0),currentWholeGoalsExact:currentMatches,candidateLandscapeGoals:proposed.goals.length,runtimeSchemaValid:runtimeReceipt.errors.length===0,requiresDAG:true,compiledApplicabilityOrSourceProjectionClaim:false,scientificContentPassClaim:false,nativeDRecordsCreated:0,activeReviewRecordsWritten:0,activeWrites:false,humanApprovalClaim:false,M7ClosureClaim:false,candidateSetSha256:'sha256:'+createHash('sha256').update(await readFile(resolve(author,'positive-evidence.candidates.json'))).digest('hex')}
await writeFile(resolve(here,'native-candidate-structure.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt));if(errors.length)process.exitCode=1
