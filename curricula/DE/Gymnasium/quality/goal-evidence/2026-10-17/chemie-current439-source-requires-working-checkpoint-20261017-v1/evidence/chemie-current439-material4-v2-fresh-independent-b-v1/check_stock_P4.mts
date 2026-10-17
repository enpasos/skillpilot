import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'
const require=createRequire('/home/enpasos/projects/skillpilot/app/package.json')
const Ajv2020=require('ajv/dist/2020.js').default
const addFormats=require('ajv-formats').default
const out='/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-material4-v2-fresh-independent-b-v1'
const repo='/home/enpasos/projects/skillpilot'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const view=read(out+'/INPUT.final-native4-scientific-view.exact.json')
const selector=read(out+'/INPUT.clean-native4-selector.exact.json')
const landscape=read(view.sourceCanonicalPin.path)
const goalById=new Map(landscape.goals.map((g:any)=>[g.id,g]))
const semantics=read(view.sourceSemanticKindsPinForTechnicalBindingOnly.path)
const kindById=new Map(semantics.decisions.map((g:any)=>[g.goalId,g.semanticKind]))
const pBytes=readFileSync(out+'/P4.whole-current-profiles.independent-b.candidate.jsonl')
const records=pBytes.toString().trim().split('\n').map((s:string)=>JSON.parse(s))
const run=read(out+'/P4.whole-current-profiles.independent-b.run.json')
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
 const expectedProfile=view.goals.find((g:any)=>g.goalId===record.goalId)?.reviewContext.evidenceProfile.profile
 if(JSON.stringify(expectedProfile)!==JSON.stringify(record.profile))errors.push(record.goalId+': whole profile body differs from frozen science view')
 if(record.reviewCriteriaFingerprint!==run.criteriaFingerprint)errors.push(record.goalId+': P criteria/run mismatch')
 if(JSON.stringify(record.reviewRunIds)!==JSON.stringify([run.runId]))errors.push(record.goalId+': P run reference mismatch')
 findings.push({goalId:record.goalId,schemaValid:recordSchema(record),stockSemanticErrors:semanticErrors,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,status:record.status,reviewAuthority:record.reviewAuthority})
}
if(!runSchema(run))errors.push('P run schema: '+ajv.errorsText(runSchema.errors))
if(run.outputDigest!==hash(pBytes))errors.push('P run outputDigest mismatch')
if(JSON.stringify(run.goalIds)!==JSON.stringify(records.map((r:any)=>r.goalId)))errors.push('P run order mismatch')
const criteriaPath=repo+'/curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md'
if(hash(readFileSync(criteriaPath))!==run.criteriaFingerprint)errors.push('P exact criteria bytes mismatch')
if(records.length!==4)errors.push('P4 exact coverage count mismatch')
const result={checkedAtUTC:new Date().toISOString(),actualValidators:['contracts/goal-evidence/v2/goal-evidence-profile.schema.json','app/scripts/positiveGoalEvidenceProfileModel.ts:validatePositiveGoalEvidenceRecordSemantics','contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'],scope:'Four exact current independent-B P candidate records, full profile retention, native schema and direct stock per-record semantic validation with final canonical goals, semantic kinds and actual image digests. No full central configuration/build acceptance or human approval claim.',recordCount:records.length,errors,findings,valid:errors.length===0}
writeFileSync(out+'/CHECK.actual-stock-P4-record-schema-and-semantics.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({recordCount:records.length,valid:result.valid,errors}))
if(errors.length)process.exitCode=1
