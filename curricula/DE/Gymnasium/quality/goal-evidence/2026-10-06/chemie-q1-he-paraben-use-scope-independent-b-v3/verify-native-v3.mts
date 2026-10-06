// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-paraben-use-scope-independent-b-v3'
const root=resolve(own,'native-physical-isolate')
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const modulePath=resolve(root,'app/scripts/applicabilityCompiler.ts')
assert.equal(sha(modulePath),sha('app/scripts/applicabilityCompiler.ts'))
const compiler=await import(pathToFileURL(modulePath).href)
const result=compiler.buildApplicabilityCompilation()
const report=result.reports.find((r:any)=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
assert(report)
const ids=['0d59b62e-d3f9-5969-b961-0c5e26316c04','4cb74d76-99f1-5264-b1e3-448cda47b005','3d6699ae-ebbd-5a55-8798-b809a9d74f0a','18819a59-2442-530f-a7c3-26755398ec66','d3cd250f-5221-589d-aa1c-44a4692d1acb','171b47e2-2c53-50f2-a145-a26b896fd73f']
const selected=report.goals.filter((g:any)=>ids.includes(g.goalId))
writeFileSync(resolve(own,'results/native-v3.actual.json'),JSON.stringify({
  checkedAtUTC:new Date().toISOString(),reviewer:'independent-b',compilerSHA256:sha(modulePath),
  candidateCanonicalSHA256:sha(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')),
  summary:report.summary,selectedGoalRows:selected,allCompiledGoalRows:report.goals,projections:report.projections,findings:report.findings,
  nativeDFreigabe:false,fullCQRRun:false,activeWrites:false,humanApproval:false,humanTrial:false,
},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({summary:report.summary,selected}))
