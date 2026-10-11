import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const root = process.cwd()
const { buildApplicabilityCompilation } = await import(pathToFileURL(resolve(root,'app/scripts/applicabilityCompiler.ts')).href)
const result=buildApplicabilityCompilation()
const report=result.reports.find((r:any)=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')
if (!report) throw new Error('No current Chemistry applicability report')
const n=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-four-materialized-applicability-D-context-root-preparation-20261011-v1')
const expected=JSON.parse(readFileSync(resolve(n,'inputs/normal-four-applicability-fields.compiled-evidence.actual.json'),'utf8'))
const four=expected.actualCompilerEvidence.map((e:any)=>{
 const current=report.goals.find((g:any)=>g.goalId===e.id)
 if (!current)throw new Error('Missing actual goal '+e.id)
 return {goalId:e.id,compiledApplicability:current.compiledApplicability,expectedApplicability:e.after,evidence:current.evidence,compiledEqual:JSON.stringify(current.compiledApplicability)===JSON.stringify(e.after),evidenceEqual:JSON.stringify(current.evidence)===JSON.stringify(e.evidence)}
})
const output=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-four-applicability-D-context-targeted-independent-b-20261011-v1/checks.normal-in-memory-four-current-applicability.actual.json')
writeFileSync(output,JSON.stringify({role:'Read-only normal compiler called in memory; only four current Chemistry goals inspected; no applicability report writer called',four,allFourCompiledEqual:four.every((r:any)=>r.compiledEqual),allFourEvidenceEqual:four.every((r:any)=>r.evidenceEqual)},null,2)+'\n')
console.log(JSON.stringify({four:four.length,allFourCompiledEqual:four.every((r:any)=>r.compiledEqual),allFourEvidenceEqual:four.every((r:any)=>r.evidenceEqual)}))
