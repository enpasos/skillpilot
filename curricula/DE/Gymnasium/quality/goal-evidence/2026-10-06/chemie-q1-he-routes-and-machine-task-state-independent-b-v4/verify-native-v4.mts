// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-routes-and-machine-task-state-independent-b-v4'
const root=resolve(own,'native-physical-isolate')
const rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const canon=resolve(root,rel),candidate=readFileSync(canon)
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const modulePath=resolve(root,'app/scripts/applicabilityCompiler.ts')
assert.equal(sha(modulePath),sha('app/scripts/applicabilityCompiler.ts'))
const compiler=await import(pathToFileURL(modulePath).href)
const get=()=>compiler.buildApplicabilityCompilation().reports.find((r:any)=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
const candidateReport=get();assert(candidateReport)
const ids=['0d59b62e-d3f9-5969-b961-0c5e26316c04','4cb74d76-99f1-5264-b1e3-448cda47b005','3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66','d3cd250f-5221-589d-aa1c-44a4692d1acb','171b47e2-2c53-50f2-a145-a26b896fd73f']
const selected=candidateReport.goals.filter((g:any)=>ids.includes(g.goalId))
for(const g of selected){assert.deepEqual(g.compiledApplicability.jurisdiction,['DE-HE']);assert(!g.evidence.some((e:any)=>e.value==='DE-BY'))}
assert.equal(candidateReport.summary.errors,0)
writeFileSync(resolve(own,'results/native-v4.actual.json'),JSON.stringify({
  checkedAtUTC:new Date().toISOString(),reviewer:'independent-b',compilerSHA256:sha(modulePath),candidateCanonicalSHA256:sha(canon),
  summary:candidateReport.summary,selectedGoalRows:selected,allCompiledGoalRows:candidateReport.goals,projections:candidateReport.projections,findings:candidateReport.findings,
  nativeDFreigabe:false,fullCQRRun:false,activeWrites:false,humanApproval:false,humanTrial:false,
},null,2)+'\n',{flag:'wx'})
const manifest=JSON.parse(readFileSync(resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-independent-b-v1/inputs/native-scope-inputs.actual.json'),'utf8'))
const saved=manifest.historicalReviewedCandidateOverlays.map((p:string)=>({rel:p,path:resolve(root,p),bytes:readFileSync(resolve(root,p))}))
let activeReport:any
try{
  writeFileSync(canon,readFileSync(resolve(own,'inputs/frozen-own-predecessors/active376-canonical-at-final-review.json')))
  for(const row of saved){if(existsSync(row.rel))writeFileSync(row.path,readFileSync(row.rel));else unlinkSync(row.path)}
  activeReport=get();assert(activeReport)
}finally{
  writeFileSync(canon,candidate)
  for(const row of saved)writeFileSync(row.path,row.bytes)
}
writeFileSync(resolve(own,'results/native-active376.actual.json'),JSON.stringify({
  checkedAtUTC:new Date().toISOString(),reviewer:'independent-b',scope:'Active474-node canonical and actual current versions/absence of the two candidate-only source/mapping overlays, in own physical isolate; all other frozen common native inputs retained.',
  summary:activeReport.summary,allCompiledGoalRows:activeReport.goals,projections:activeReport.projections,findings:activeReport.findings,
  overlaysRestoredToCurrentForActiveMeasurement:saved.map((r:any)=>({path:r.rel,currentExists:existsSync(r.rel)})),candidateRestoredByteExact:readFileSync(canon).equals(candidate),
  nativeDFreigabe:false,fullCQRRun:false,activeWrites:false,humanApproval:false,humanTrial:false,
},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({candidateSummary:candidateReport.summary,activeSummary:activeReport.summary,selected:selected.map((g:any)=>({id:g.goalId,scope:g.compiledApplicability}))}))
