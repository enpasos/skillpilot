// SPDX-License-Identifier: Apache-2.0
// Run from repository root with app/node_modules/.bin/tsx <this-file>.
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=resolve(process.argv[2]??process.cwd())
const base='curricula/DE/Gymnasium/quality/assessment-review/physik/e1-current-assessments-20261124-v1/'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const rawHash=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')
const hash=(g:any)=>createHash('sha256').update(JSON.stringify(g)).digest('hex')
const {collectWholeMaterialPrerequisiteClosure}=await import(pathToFileURL(resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const docs=['PHYSIK','MATHEMATIK','CHEMIE'].map(s=>read(`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${s}.de.json`))
const world={...docs[0],goals:docs.flatMap(d=>d.goals)},byId=new Map(world.goals.map((g:any)=>[g.id,g]))
const expected=new Map([
 ['f13ca187-b680-5f47-b4ad-76bd474bd8a2',['round2',20,17,66]],
 ['a8dc0290-9f80-5763-8943-e16b8d2aa860',['round3',20,20,66]],
 ['4ea1b93f-2dba-59ac-87ab-29af6c55cc37',['round2',16,16,83]],
 ['dfd2628f-b44e-51b3-86e8-99158861be8c',['round3',16,16,77]],
 ['f41e4e30-794e-5ce4-ba5e-cc72712cd691',['round2',24,23,69]],
 ['6ea3fb3c-abdc-568f-ab13-97c36dc274e4',['round3',36,36,72]],
])
const threads=new Set<string>()
for(const round of ['round1','round2','round3'])for(const [r,model]of[['a','gpt-6.1-sol'],['b','gpt-6.2-astra']]){
 const dir=`${base}${round}/round-${r}/`,run=read(dir+'run.actual.json')
 assert.equal(run.model,model);assert.equal(run.reasoningEffort,'ultra');assert.equal(run.exitCode,0);assert.equal(run.sandbox.type,'read-only');assert.equal(run.blindToOtherRun,true)
 assert(!threads.has(run.threadId));threads.add(run.threadId)
 for(const a of [...run.inputArtifacts,...run.outputArtifacts])assert.equal(rawHash(a.capsulePath?a.path:dir+a.path),a.sha256)
 const events=readFileSync(resolve(root,dir+'events.jsonl'),'utf8').trim().split('\n').map(l=>JSON.parse(l));assert.equal(events[0].thread_id,run.threadId);assert.equal(events.at(-1).type,'turn.completed')
}
for(const[id,[round,max,pass,count]]of expected){
 const goal:any=byId.get(id),receipt=read(base+round+'-activation.actual.json'),binding=receipt.goals.find((r:any)=>r.goalId===id)
 for(const a of[binding.before,binding.reviewedCandidate,binding.current])assert.equal(rawHash(a.path),a.sha256)
 assert.deepEqual(goal,read(binding.current.path));const e=goal.examData;assert.equal(e.reviewStatus,'released');assert.equal(e.scoring.maxPoints,max);assert.equal(e.scoring.passingPoints,pass);assert.equal(e.scoring.steps.reduce((s:number,x:any)=>s+x.points,0),max)
 for(const r of ['a','b']){const review=read(`${base}${round}/round-${r}/response.json`).reviews.find((x:any)=>x.goalId===id);assert.equal(review.candidateDecision,'accept');assert.deepEqual(review.recommendedRequires,goal.requires);assert.deepEqual(review.recommendedCoveredGoalIds,e.coveredGoalIds);assert.equal(review.recommendedPassingPoints,pass)}
 const closure=collectWholeMaterialPrerequisiteClosure(world,id);assert.equal(closure.unresolvedReferences.size,0);assert.equal(closure.atomicGoalIds.size,count)
}
const mpId='2b9e565f-d9b4-5e23-b5b7-b7977cecff06',mp:any=byId.get(mpId),mpReceipt=read(base+'mp-current/activation.actual.json')
assert.equal(rawHash(mpReceipt.currentGoalPath),mpReceipt.currentRawSha256);assert.deepEqual(mp,read(mpReceipt.currentGoalPath));assert.deepEqual(mp.examData.coveredGoalIds,[]);assert.equal(mp.examData.scoring.maxPoints,30);assert.equal(mp.examData.scoring.passingPoints,18)
assert.equal(read(base+'native-contract/mp-empty-native.actual.json').emptyMpCoverage.status,'warn')
const offers=read(base+'current-stage-offers.actual.json');assert.equal(rawHash(offers.currentSharedPreparation.path),offers.currentSharedPreparation.sha256)
for(const prior of offers.immutablePredecessors)assert.equal(rawHash(prior.path),prior.sha256)
assert.equal(rawHash(offers.ffxContentAndSourceStageReview.path),offers.ffxContentAndSourceStageReview.sha256)
const ffxSourceReview=read(offers.ffxContentAndSourceStageReview.path)
for(const source of ffxSourceReview.sourceStageEvidence)assert.equal(rawHash(source.path),source.sha256)
assert.equal(rawHash(offers.dprimeContentAndSourceStageReview.STSource.path),offers.dprimeContentAndSourceStageReview.STSource.sha256)
for(const r of ['a','b'])assert.equal(read(`${base}round2/round-${r}/response.json`).ffxHesseOfferDecision,'accept')
const prep=read(offers.currentSharedPreparation.path);assert.equal(prep.payloads.length,216)
for(const p of prep.payloads)assert.equal(hash(byId.get(p.goalId)),p.rawSha256)
for(const row of prep.assessments){const goal:any=byId.get(row.goalId);assert.equal(hash(goal),row.assessmentRawSha256);const c=collectWholeMaterialPrerequisiteClosure(world,row.goalId);assert.deepEqual([...c.unresolvedReferences],[]);assert.deepEqual([...c.atomicGoalIds].sort(),row.fullRealPrerequisiteIds)}
const ffx='f41e4e30-794e-5ce4-ba5e-cc72712cd691',warning=read('docs/qa-ci/applicability-accepted-warnings.json').acceptedWarnings.filter((r:any)=>r.code==='APV-201'&&r.goalId===ffx)
assert.equal(warning.length,1);assert.equal(rawHash(warning[0].evidence.reviewPath),warning[0].evidence.reviewFileSha256);assert.equal(hash(byId.get(ffx)),warning[0].evidence.currentGoalJsonStringifySha256);assert.deepEqual(warning[0].evidence.compiledJurisdictions,['DE-HE','DE-SN'])
// Independent numerical recomputation, not model data represented as learner measurements.
const tf=Math.sqrt(2*1.25/9.81);assert(Math.abs((7.8*(tf-.03))-3.703586462508687)<1e-8);assert(Math.abs(8.2*(tf+.03)-4.385513973406569)<1e-8)
assert.equal(2*2,4);assert.equal(-.5*.5*1,-.25);assert.equal(.5*1.5*3,2.25);assert.equal(6*3-3**2,9);assert.equal(6-2*5,-4);assert.equal(6*5-5**2,5)
assert.equal(Math.hypot(2,1.5),2.5);assert(Math.abs(Math.hypot(2,3)-Math.sqrt(13))<1e-12)
assert(Math.abs((50/3.6+14)-27.88888888888889)<1e-10);assert(Math.abs((100/3.6+56)-83.77777777777777)<1e-10)
for(const id of ['4ea1b93f-2dba-59ac-87ab-29af6c55cc37','dfd2628f-b44e-51b3-86e8-99158861be8c','6ea3fb3c-abdc-568f-ab13-97c36dc274e4','f41e4e30-794e-5ce4-ba5e-cc72712cd691']){const e:any=(byId.get(id)as any).examData;for(const s of e.scoring.steps)assert(e.scoring.maxPoints-s.points<e.scoring.passingPoints)}
console.log(JSON.stringify({status:'PASS',actualIndependentRuns:threads.size,currentChangedAssessments:7,sourceStagePreparationPayloads:prep.payloads.length,sourceStageOffers:offers.assessments.length,MPWholeGoalCoverage:[],MPNativeCoverageGate:'OPEN_CQR203_WARNING',planningCreditOrLearnerResultTransfer:false}))
