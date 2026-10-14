// Technical stock measurements only; no scientific approval. Apache-2.0.
import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root=process.cwd()
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-e560-child1-property-comparison-targeted-P-author-successor-20261014-v1'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const beforeP=read(`${base}/positive/two-complete-positive-v2-child-profiles.DEEN.author.json`)
const afterP=read(`${own}/candidate/two-whole-profiles.property-comparison-author-successor.json`)
const beforeC=read(`${base}/positive/four-whole-child-cases.DEEN.author.json`)
const afterC=read(`${own}/candidate/four-whole-cases.property-comparison-author-successor.json`)
assert.deepEqual(beforeC.cases[0],afterC.cases[0]);assert.deepEqual(beforeC.cases.slice(2),afterC.cases.slice(2));assert.deepEqual(beforeP.goals[1],afterP.goals[1])
for(const c of afterC.cases){
 const g=afterP.goals.find((g:any)=>g.goalId===c.goalId),brief=g.profile.applicationCaseBriefs.find((b:any)=>b.id===c.caseId)
 assert.equal(brief.taskDemandDe,c.taskDe);assert.equal(brief.taskDemandEn,c.taskEn);assert.equal(brief.expectedPerformanceDe,c.modelAnswerDe);assert.equal(brief.expectedPerformanceEn,c.modelAnswerEn)
 assert.equal(c.rubric.reduce((n:number,r:any)=>n+r.maximumPoints,0),6)
}
const materializer=await import(pathToFileURL(resolve(root,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const config={$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:afterP.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0',landscapePath:`${base}/candidate/canonical533.current407.author.inactive.json`,semanticKindLedgerPath:`${base}/candidate/semantic533.current407.author.proposals.inactive.json`,reviewCriteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md',reviewPath:`${own}/not-written.jsonl`,reviewedResourceTypes:[],requireApproved:false,scope:{label:'Targeted child1 property-comparison author successor; unreviewed E0/G0 designs',goalIds:afterP.goals.map((g:any)=>g.goalId)}}
const a=await materializer.buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:afterP})
const b=await materializer.buildPositiveGoalEvidenceCandidateRecords({config,candidateSet:beforeP})
assert.equal(a[0].goalFingerprint,b[0].goalFingerprint);assert.equal(a[0].reviewInputFingerprint,b[0].reviewInputFingerprint);assert.notEqual(a[0].profileFingerprint,b[0].profileFingerprint)
assert.deepEqual(a[1],b[1])
writeFileSync(resolve(root,`${own}/checks/stock-targeted-P-design-measurements.actual.json`),JSON.stringify({status:'PASS technical stock profile semantics and case joins; genuine independent A/B review pending',onlyChild1ProfileFingerprintChanged:true,childGoalAndReviewInputFingerprintsUnchanged:true,child2WholeProfileAndCasesUnchanged:true,case1WholeContentUnchanged:true,case2OriginalDataOtherRubricsAndCoverageContractUnchanged:true,fourWholeCaseBriefTaskAnswerJoins:true,profiles:a.map((r:any)=>({goalId:r.goalId,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,status:r.status,reviewAuthority:r.reviewAuthority,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope})),currentPositiveRecordsWritten:false,newIndependentVotes:0,newStrictCompletions:0,activeWrites:false},null,2)+'\n')
console.log('PASS targeted child1 property-comparison design; exact case1/child2 retention; unchanged goals and review inputs; new child1 profile fingerprint only; E0/G0')
