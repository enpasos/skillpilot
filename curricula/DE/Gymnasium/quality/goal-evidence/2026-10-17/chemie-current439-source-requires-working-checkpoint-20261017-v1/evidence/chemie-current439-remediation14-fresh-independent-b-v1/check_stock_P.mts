import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const require = createRequire('/home/enpasos/projects/skillpilot/app/package.json')
const Ajv2020 = require('ajv/dist/2020.js').default
const addFormats = require('ajv-formats').default
const out='/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-remediation14-fresh-independent-b-v1'
const repo='/home/enpasos/projects/skillpilot'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const view=read(out+'/INPUT.final-native14-scientific-view.exact.json')
const selector=read(out+'/INPUT.clean-native14-selector.exact.json')
const landscape=read(view.sourceCanonicalPin.path)
const goalById=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const semantics=read(view.sourceSemanticKindsPinForTechnicalBindingOnly.path)
const kindById=new Map(semantics.decisions.map((g:any)=>[g.goalId,g.semanticKind]))
const pBytes=readFileSync(out+'/P14.whole-current-profiles.independent-b.candidate.jsonl')
const records=pBytes.toString().trim().split('\n').map((s:string)=>JSON.parse(s))
const ajv=new Ajv2020({allErrors:true,strict:true});addFormats(ajv)
const recordSchema=ajv.compile(read(repo+'/contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const runSchema=ajv.compile(read(repo+'/contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'))
const errors:string[]=[]; const findings:any[]=[]
for(const record of records){
 if(!recordSchema(record))errors.push(`${record.goalId}: schema ${ajv.errorsText(recordSchema.errors)}`)
 const goal:any=goalById.get(record.goalId);const digests:Record<string,string>={}
 for(const link of goal.resourceLinks??[]){if(link.type==='goal-visualization')digests[link.url]=hash(readFileSync(resolve(selector.capsule,'app/public',link.url.slice(1))))}
 const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(record,goal,digests,kindById.get(record.goalId) as string)
 errors.push(...semanticErrors)
 findings.push({goalId:record.goalId,schemaValid:recordSchema(record),stockSemanticErrors:semanticErrors,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,status:record.status,reviewAuthority:record.reviewAuthority})
}
const groups=read(out+'/P.actual-two-criteria-run-groups.json')
const knownCriteria=new Map(['chemistry-positive-understanding-evidence-profile-criteria-v1.md','chemistry-goal-description-understanding-evidence-review-criteria-v1.md'].map((name:string)=>[hash(readFileSync(repo+'/curricula/DE/Gymnasium/quality/goal-evidence/prompts/'+name)),name]))
const groupedIds:string[]=[]
for(const group of groups){
 const run=read(group.runPath);const bytes=readFileSync(group.recordsPath);const subset=bytes.toString().trim().split('\n').map((s:string)=>JSON.parse(s))
 if(!runSchema(run))errors.push('P run schema: '+ajv.errorsText(runSchema.errors))
 if(run.outputDigest!==hash(bytes))errors.push('P run outputDigest mismatch')
 if(JSON.stringify(run.goalIds)!==JSON.stringify(subset.map((p:any)=>p.goalId)))errors.push('P run order mismatch')
 if(!knownCriteria.has(run.criteriaFingerprint))errors.push('P actual criteria bytes mismatch')
 for(const r of subset){
  groupedIds.push(r.goalId)
  if(r.reviewCriteriaFingerprint!==run.criteriaFingerprint)errors.push(r.goalId+': P criteria mismatch')
  if(JSON.stringify(r.reviewRunIds)!==JSON.stringify([run.runId]))errors.push(r.goalId+': P run reference mismatch')
  if(JSON.stringify(r)!==JSON.stringify(records.find((p:any)=>p.goalId===r.goalId)))errors.push(r.goalId+': P combined record mismatch')
 }
}
if(JSON.stringify([...groupedIds].sort())!==JSON.stringify(records.map((p:any)=>p.goalId).sort()))errors.push('P grouped exact coverage mismatch')
const result={checkedAtUTC:new Date().toISOString(),actualValidators:['contracts/goal-evidence/v2/goal-evidence-profile.schema.json','app/scripts/positiveGoalEvidenceProfileModel.ts:validatePositiveGoalEvidenceRecordSemantics','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'],scope:'Exact independent-B P14 candidate records and P run schema; direct stock per-record semantic validator with final canonical goals, semantic kinds and actual bound image digests. Does not assert full central configuration acceptance or scientific closure of four material holds.',recordCount:records.length,errors,findings,valid:errors.length===0}
writeFileSync(out+'/CHECK.actual-stock-P14-record-schema-and-semantics.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({recordCount:records.length,valid:result.valid,errors}))
if(errors.length)process.exitCode=1
