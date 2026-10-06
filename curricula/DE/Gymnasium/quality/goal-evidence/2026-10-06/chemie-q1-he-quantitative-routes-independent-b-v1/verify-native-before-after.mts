// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-he-quantitative-routes-independent-b-v1'
const rel = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const root = resolve(own,'native-physical-isolate')
const path = resolve(root,rel)
const candidate = readFileSync(path)
const compiler = await import(pathToFileURL(resolve(root,'app/scripts/applicabilityCompiler.ts')).href)
const get = () => compiler.buildApplicabilityCompilation().reports.find((r:any)=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
let before: any
try {
  writeFileSync(path,readFileSync(resolve(own,'inputs/retained407/prospective-input-tree',rel)))
  before = get()
} finally {writeFileSync(path,candidate)}
const after = get()
assert(before && after)
writeFileSync(resolve(own,'results/native-before-after.actual.json'),JSON.stringify({
  checkedAtUTC:new Date().toISOString(),reviewer:'independent-b',status:'measured own physical isolate',
  before:{summary:before.summary,goals:before.goals,projections:before.projections},
  after:{summary:after.summary,goals:after.goals,projections:after.projections},
  candidateRestoredByteExact:readFileSync(path).equals(candidate),activeWrites:false,nativeDFreigabe:false,humanApproval:false,humanTrial:false,
},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({beforeSummary:before.summary,afterSummary:after.summary,projectionSample:after.projections[0],parabenBefore:before.goals.find((g:any)=>g.goalId.startsWith('0d59b62e')).compiledApplicability,parabenAfter:after.goals.find((g:any)=>g.goalId.startsWith('0d59b62e')).compiledApplicability}))
