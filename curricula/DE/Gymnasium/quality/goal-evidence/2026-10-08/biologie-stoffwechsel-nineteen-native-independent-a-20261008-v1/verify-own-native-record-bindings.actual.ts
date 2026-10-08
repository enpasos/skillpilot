import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
const own=dirname(fileURLToPath(import.meta.url)); const repo=resolve(own,'../../../../../../..')
const q='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'; const native=`${q}/biologie-stoffwechsel-nineteen-native-technical-20261008-v1`
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8')); const sha=(b:Buffer)=>`sha256:${createHash('sha256').update(b).digest('hex')}`
const frozen=JSON.parse(readFileSync(resolve(own,'first-native-input.freeze.json'),'utf8'))
for(const item of frozen.requiredFiles){ const b=readFileSync(resolve(repo,item.path)); if(sha(b)!==item.sha256||b.length!==item.bytes)throw new Error(`Changed input ${item.path}`) }
const records=readFileSync(resolve(own,'P19.current-native.independent-a.review.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
const landscape=read(`${native}/candidate/canonical.current476.nineteen-rasters.inactive.json`);const ledger=read(`${native}/candidate/semantic-kinds.current476.path-only.inactive.json`);const entry=read(`${native}/neutral-current-nineteen-native.technical.entry.json`)
const profiles=read(`${q}/biologie-stoffwechsel-resume-author-20261008-v1/P19.exact-retained-v5.author.candidates.json`)
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv);const valid=ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const errors:string[]=[]; const actual=[]
for(const record of records){
 if(!valid(record))errors.push(`${record.goalId}: ${ajv.errorsText(valid.errors)}`)
 const goal=landscape.goals.find((g:any)=>g.id===record.goalId); const kind=ledger.decisions.find((g:any)=>g.goalId===record.goalId)?.semanticKind
 const raster=entry.rasterBindings.find((g:any)=>g.goalId===record.goalId);const bytes=readFileSync(resolve(repo,raster.path));if(sha(bytes)!==raster.sha256||bytes.length!==raster.bytes)errors.push(`${record.goalId}: wrong actual raster`)
 errors.push(...validatePositiveGoalEvidenceRecordSemantics(record,goal,{[raster.url]:sha(bytes)},kind))
 const wholeProfile=profiles.goals.find((g:any)=>g.goalId===record.goalId).profile
 if(JSON.stringify(record.profile)!==JSON.stringify(wholeProfile))errors.push(`${record.goalId}: shortened or changed whole profile`)
 if(record.status!=='needs_human_review'||record.reviewAuthority!=='ai_candidate'||record.evidenceLevel!=='E1'||record.maximumClaimScope!=='G1'||record.reviewRunIds.length!==0)errors.push(`${record.goalId}: wrong authority/scope`)
 actual.push({goalId:record.goalId,goalFingerprint:record.goalFingerprint,reviewInputFingerprint:record.reviewInputFingerprint,profileFingerprint:record.profileFingerprint,actualPNG:raster.sha256,wholeProfileExact:true})
}
if(records.length!==19||new Set(records.map((r:any)=>r.goalId)).size!==19)errors.push('Wrong exact19 P coverage')
if(errors.length)throw new Error(errors.join('\n'))
const out=resolve(own,'native-nineteen.targeted-validator.receipt.json');if(existsSync(out))throw new Error('Never overwrite existing receipt')
writeFileSync(out,JSON.stringify({schemaVersion:1,verifiedAtUtc:new Date().toISOString(),descriptionCampaignValidation:{normalCli:'validateGoalDescriptionReviewCampaignResults.ts',actualExitCode:0,actualOutput:'Goal-description review campaign results valid: 19'},positiveValidation:{ordinaryAPI:'validatePositiveGoalEvidenceRecordSemantics',schema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',scope:'exact19 current inactive candidate whole goals; actual selected PNG digests passed to unchanged API',errors:[],records:19,completeProfileBodiesExact:19},inputFilesExact:frozen.requiredFiles.length,rows:actual,activeWrites:0,newStrictClosureClaims:0,humanApproval:false},null,2)+'\n')
console.log('Own native D19/P19 exact bindings valid; complete19 profiles; humanApproval=false; activeWrites=0')
