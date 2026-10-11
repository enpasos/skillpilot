import { readFile,writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { renderGoalBookReviewMarkdown } from '../../../../../../../app/scripts/exportGoalBookReviewBundle'
import { parseGoalBookEvidenceReviewRecord } from '../../../../../../../app/scripts/goalBookEvidenceReviewLoader'
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-checkpoint-independent-technical-audit-v1'
const config=JSON.parse(await readFile('app/scripts/config/goal-books/de-gym-economics-current-canonical.json','utf8'))
const model=JSON.parse(await readFile('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-current493-qualified-active-integration-and-book-root-v1/whole-active-current336.normal-production-book-model.json','utf8'))
const pages=new Map(model.pages.map((p:any)=>[p.goalId,p]))
const inputBytes=await readFile(config.evidenceReviewPaths[0])
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
let count=0,cases=0,expectations=0,textFields=0
for(const line of inputBytes.toString().split(/\r?\n/u).filter(s=>s.trim())){
 const row=parseGoalBookEvidenceReviewRecord(JSON.parse(line),'independent full Economics V2 transport audit')
 if(row.schemaVersion!==2)throw new Error('Expected actual V2 profile')
 const whole=JSON.stringify(row)
 const page=pages.get(row.goalId)
 if(!page)throw new Error('Missing actual full336 page')
 const markdown=renderGoalBookReviewMarkdown({schemaVersion:1,book:model.book,modelDigest:model.digest,pages:[{page:page as any,evidenceProfile:row}]})
 for(const exp of row.profile.expectations){
  for(const text of [exp.essentialUnderstandingDe,exp.essentialUnderstandingEn,exp.observablePerformanceDe,exp.observablePerformanceEn]){
   if(!markdown.includes(text))throw new Error('Incomplete expectation transport '+row.goalId)
   textFields++
  }
  expectations++
 }
 for(const item of row.profile.applicationCaseBriefs){
  for(const text of [item.taskDemandDe,item.taskDemandEn,item.expectedPerformanceDe,item.expectedPerformanceEn,item.understandingFocusDe,item.understandingFocusEn]){
   if(!markdown.includes(text))throw new Error('Incomplete applicationCaseBrief transport '+row.goalId)
   textFields++
  }
  cases++
 }
 if(row.status!=='needs_human_review'||row.reviewAuthority!=='ai_candidate'||row.evidenceLevel!=='E1'||row.maximumClaimScope!=='G1')throw new Error('Unexpected actual authority/status')
 for(const literal of ['needs_human_review','ai_candidate','maximum claim scope: \x60G1\x60'])if(!markdown.includes(literal))throw new Error('Authority omitted')
 if(JSON.stringify(row)!==whole)throw new Error('Renderer mutated native profile')
 count++
}
if(count!==336||cases!==685)throw new Error('Unexpected current whole P count')
if(sha(await readFile(config.evidenceReviewPaths[0]))!==sha(inputBytes))throw new Error('Native source bytes changed')
const result={technicalOnly:true,actualWholeNativePPath:config.evidenceReviewPaths[0],actualWholeNativePFileSha256:sha(inputBytes),
 actualV2Profiles:count,actualApplicationCaseBriefs:cases,actualExpectations:expectations,
 actualBilingualTextsChecked:textFields,allWholeSixCaseFieldsTransported:true,
 sourceBytesAndParsedRecordsUnchanged:true,allStatusNeedsHumanReviewAuthorityAiCandidateE1G1:true,
 noScientificReviewOrHumanApprovalClaimed:true}
await writeFile(root+'/raw.actual-all336-P685-V2-markdown-transport.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(result))
