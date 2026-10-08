import fs from 'node:fs/promises'
import path from 'node:path'
import {createHash} from 'node:crypto'
import Ajv from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts'
const repo=process.cwd(),own=path.relative(repo,path.dirname(new URL(import.meta.url).pathname))
const read=async(p:string)=>JSON.parse(await fs.readFile(path.join(repo,p),'utf8'))
const cfg=await read(own+'/P18.whole-current-author.config.json'),land=await read(cfg.landscapePath),ledger=await read(cfg.semanticKindLedgerPath),authored=await read(own+'/P18.thirty-six-whole-DEEN-cases.author.candidates.json'),whole=await read(own+'/eighteen-whole-goals-thirty-six-complete-DEEN-cases.author.json')
const rows=(await fs.readFile(path.join(repo,cfg.reviewPath),'utf8')).trim().split('\n').map(s=>JSON.parse(s))
const ajv=new Ajv({strict:true,allErrors:true});addFormats(ajv)
const validate=ajv.compile(await read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
const by=new Map(land.goals.map((g:any)=>[g.id,g])),kinds=new Map(ledger.decisions.map((d:any)=>[d.goalId,d]))
const equal=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const assert=(v:any,m:string)=>{if(!v)throw new Error(m)}
assert(rows.length===18&&whole.wholeCases.length===36,'whole P18/cases36 counts')
const results=rows.map((r:any,i:number)=>{const goal=by.get(r.goalId) as any,kind=kinds.get(r.goalId) as any,pair=whole.wholeCases.filter((c:any)=>c.goalId===r.goalId);const closedSchemaValid=validate(r);const semanticErrors=validatePositiveGoalEvidenceRecordSemantics(r,goal,{},kind.semanticKind);assert(kind.decisionStatus==='authoritative'&&kind.sourceFingerprint===fingerprintSemanticKindSourceGoal(goal),'Retained current classifier '+r.goalId);assert(equal(r.profile,authored.goals[i].profile),'Whole profile preserved '+r.goalId);assert(equal(goal,whole.wholeGoalBodies[i]),'Whole current goal '+r.goalId);assert(pair.length===2&&pair.every((c:any,j:number)=>{const brief=r.profile.applicationCaseBriefs[j];return brief.id===c.id&&brief.taskDemandDe===c.material.de+' '+c.task.de&&brief.taskDemandEn===c.material.en+' '+c.task.en&&brief.expectedPerformanceDe===c.modelAnswer.de&&brief.expectedPerformanceEn===c.modelAnswer.en}),'Whole DEEN material/task/model binding '+r.goalId);assert(r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.evidenceLevel==='E1'&&r.maximumClaimScope==='G1'&&r.reviewRunIds.length===0,'candidate bounds');return {goalId:r.goalId,closedSchemaValid,schemaErrors:structuredClone(validate.errors),nativeSemanticErrors:semanticErrors,wholeProfileBodyPreservedExact:true,wholeDEENMaterialTaskModelAnswerCasesExact:2,retainedClassificationSourceFingerprintCurrent:true}})
assert(results.every(r=>r.closedSchemaValid&&r.nativeSemanticErrors.length===0),'native P18 closed schema and semantics')
const live=await read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),liveBy=new Map(live.goals.map((g:any)=>[g.id,g]));assert(whole.wholeGoalBodies.every((g:any)=>equal(g,liveBy.get(g.id))),'Current18 live whole bodies changed')
const report={checkedAt:new Date().toISOString(),actualApiExitCode:0,results,wholeGoals:18,wholeDEENCases:36,wholeProfiles:18,current18LiveWholeBodiesExact:true,approved:0,needsHumanReview:18,actualIndependentScienceReviews:0,actualPerformedExperiments:0,learnerData:false,imagesInspectedOrGenerated:0,activeWrites:0,interpretation:'Strict native schema/profile/goal/resource/criteria binding validation only. New evolutionary/source/operator and two-goal wording judgments remain author candidates awaiting genuine independent whole science reviews; no historical review restarted or approval manufactured.'}
await fs.writeFile(path.join(repo,own,'P18.closed-native-schema-semantic-and-whole36-case-bindings.actual.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({exitCode:0,closedSchemas:18,nativeSemanticErrors:0,exactWholeProfiles:18,exactWholeDEENCases:36,currentWholeGoalsExact:18,approved:0,needsHumanReview:18,actualIndependentReviews:0}))
