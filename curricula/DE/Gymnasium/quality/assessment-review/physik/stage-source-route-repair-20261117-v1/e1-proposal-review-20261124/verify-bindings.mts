// SPDX-License-Identifier: Apache-2.0
// Run from repository root: app/node_modules/.bin/tsx <this-file>.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const root=resolve(process.argv[2]??process.cwd())
const base='curricula/DE/Gymnasium/quality/assessment-review/physik/stage-source-route-repair-20261117-v1/e1-proposal-review-20261124/'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const sha=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const manifest=read(base+'evidence-manifest.actual.json')
for(const file of manifest.files)assert.equal(sha(file.path),file.sha256,file.path)
const comparison=read(base+'author-release-byte-comparison.actual.json')
assert.equal(comparison.status,'FINAL_HH_BYTES_MATCH_BOTH_BLIND_REVIEW_INPUTS')
assert.equal(comparison.HH.finalAuthorSubmittedGoal.sha256,'ee6fcaf12fdc8993ad18d3704cf407557491bb53b927cdb367195aeb768de415')
assert.equal(comparison.HH.separateFinalAuthorREADME.sha256,'b114b8d6b4935e86c8fd2141c01601d5cf1585dcd4a92726cf23ffdf2b7fce82')
for(const a of [comparison.HH.finalAuthorSubmittedGoal,comparison.HH.separateFinalAuthorREADME,comparison.authorReleaseNotice])assert.equal(sha(a.path),a.sha256)
const withdrawal=read(base+'hh-author-withdrawal-successor.actual.json')
assert.equal(withdrawal.status,'HH_PROPOSAL_WITHDRAWN_NO_INTEGRATION_OR_OFFER_BINDING')
for(const a of [withdrawal.authorWithdrawalNotice,withdrawal.priorExactHHReviewDisposition,withdrawal.concreteCounterreviewForAuthor])assert.equal(sha(a.path),a.sha256)
assert.equal(comparison.SN.historicalReviewedDraftSha256,'f631c9f12c3bc9f1aaccc35da01b3d330a232fb2b11ff54bb9be9f1fdb4c10a6')
assert.equal(comparison.SN.unsubmittedSuccessorSha256,'19f49003a7f5395cbebbc129e01e01a47a3f2d4fd0dbde1abf45d68f75626026')
const threads=[]
for(const [q,model]of [['a','gpt-6.1-sol'],['b','gpt-6.2-astra']]){
 const run=read(`${base}round-${q}/run.actual.json`);assert.equal(run.model,model);assert.equal(run.reasoningEffort,'ultra');assert.equal(run.exitCode,0);assert.equal(run.sandbox.type,'read-only');assert.equal(run.blindToOtherRun,true);threads.push(run.threadId)
 for(const a of [...run.inputArtifacts,...run.outputArtifacts])assert.equal(sha(a.path),a.sha256)
 const execution=read(run.executionContextCopy);assert.equal(execution.actualFirstTurnContext.payload.model,model);assert.equal(execution.actualFirstTurnContext.payload.effort,'ultra');assert.equal(execution.actualFirstTurnContext.payload.cwd,run.cwd)
 const events=readFileSync(resolve(root,`${base}round-${q}/events.jsonl`),'utf8').trim().split('\n').map(l=>JSON.parse(l));assert.equal(events[0].thread_id,run.threadId);assert.equal(events.at(-1).type,'turn.completed')
 const response=read(`${base}round-${q}/response.json`);assert.equal(response.reviews.length,2);assert.deepEqual(response.reviews.map((r:any)=>r.exactProposalDecision),q==='a'?['revise','revise']:['hold_source_preparation','revise']);assert(response.reviews.every((r:any)=>!r.integrableWithoutAcceptedCutChange))
}
assert.notEqual(threads[0],threads[1])
for(const p of read(base+'primary-source-bindings.actual.json').bindings){assert.equal(sha(p.primaryPdfPath),p.primaryPdfSha256);assert.equal(sha(p.reviewedPageTextPath),p.reviewedPageTextSha256)}
const scores=read(base+'independent-score-boundaries.actual.json').scoreReviews
assert.deepEqual(scores.map((r:any)=>[r.enumeratedAuthoredScoreStates,r.authoredPassingStates,r.anyAuthoredPassWithZeroCore]),[[243,16,false],[729,22,false]])
console.log(JSON.stringify({status:'PASS',actualBlindRuns:2,HHFinalBytesExact:true,HHAuthorWithdrawalBound:true,SNFindingsHistoricalOnly:true,sourceBindings:5,noTaskOrOfferIntegration:true}))
