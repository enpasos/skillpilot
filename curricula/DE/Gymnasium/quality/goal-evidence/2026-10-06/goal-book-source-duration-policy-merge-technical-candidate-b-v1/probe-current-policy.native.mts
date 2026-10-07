import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { parseSubjectDurationModelPolicy } from '../../../../../../../app/scripts/goalBookModel.ts'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/goal-book-source-duration-policy-merge-technical-candidate-b-v1/'
const policyPath = 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'
const policyBytes = await readFile(resolve(policyPath))
const policy = JSON.parse(policyBytes.toString('utf8'))
const rows = policy.decisions.filter((d:any)=>d.subject==='Biologie')
const expected = [...new Set<string>(rows.map((d:any)=>d.jurisdiction))].sort()
const original148 = {...policy, decisions:policy.decisions.slice(0,148)}
const oldPolicy = parseSubjectDurationModelPolicy(original148,'Biologie',expected,[])
const mode = process.argv[2]
assert(mode==='before'||mode==='after')
let failure: string|null = null
let result: Map<string,unknown>|null = null
try { result = parseSubjectDurationModelPolicy(policy,'Biologie',expected,[]) }
catch(error) { failure=error instanceof Error?error.message:String(error) }
if(mode==='before') assert.match(failure??'',/contains duplicate Biologie decision/)
else {
  assert.equal(failure,null)
  assert.deepEqual(result,oldPolicy)
}
const out = {
  schemaVersion:1,createdAtUTC:new Date().toISOString(),mode,policyPath,
  currentPolicySha256:createHash('sha256').update(policyBytes).digest('hex'),
  actualTotalRows:policy.decisions.length,actualSubjectRows:rows.length,
  effectiveJurisdictionCount:expected.length,effectivePolicySameAsOriginal148:mode==='after',
  failure,actualEffectiveDecisions:result?[...result.values()]:null,
  nativeProductionParserActuallyExecuted:true,activePolicyWrites:false,
  goalSourceOrHumanApproval:false,
}
await writeFile(resolve(base+`current-153-policy.${mode}.native.actual.json`),JSON.stringify(out,null,2)+'\n')
console.log(JSON.stringify(out))
