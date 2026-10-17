import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { buildApplicabilityCompilation } from '/home/enpasos/projects/skillpilot/tmp/chemie-SH032-readonly-b-stock-capsule-20261016/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot'
const out=root+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-existing435-carrier-readonly-audit-b-20261016-v1'
const input=JSON.parse(fs.readFileSync(out+'/INPUT.current629-selected-whole-goals-and-all435-text-index.actual.json','utf8'))
const ids=new Set(input.selectedWholeGoals.map((g:any)=>g.id))
const compiled=buildApplicabilityCompilation()
const chemistry=compiled.reports.find((r:any)=>r.landscapeId==='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0')!
const result={role:'Read-only stock Applicability compilation; no source coverage or M7 verdict',canonicalSha256:input.canonical.sha256,summary:chemistry.summary,selectedGoals:chemistry.goals.filter((g:any)=>ids.has(g.goalId)),findings:chemistry.findings,newVotes:0,normalWrites:0}
const output=process.argv[2]; if(!output) throw new Error('Supply a fresh output filename'); if(fs.existsSync(out+'/'+output)) throw new Error('Refusing to overwrite frozen output'); fs.writeFileSync(out+'/'+output,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({summary:result.summary,selectedGoals:result.selectedGoals.length,ac700:result.selectedGoals.find((g:any)=>g.goalId==='ac700167-001f-5ff8-9a7d-85909f5daa4f')}))
