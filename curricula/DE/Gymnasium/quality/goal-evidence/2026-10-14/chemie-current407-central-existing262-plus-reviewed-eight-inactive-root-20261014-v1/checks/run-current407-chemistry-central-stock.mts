// Apache-2.0: bounded inactive orchestration of the unchanged central checker.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-central-existing262-plus-reviewed-eight-inactive-root-20261014-v1'
const {generateDeepUnderstandingRollout}=await import(pathToFileURL(resolve(process.cwd(),'app/scripts/reportDeepUnderstandingRollout.ts')).href)
const report=await generateDeepUnderstandingRollout(`${own}/config/chemie-current407-central.inactive.config.json`)
const subject=report.subjects.find((s:any)=>s.subject==='chemie')
if(report.subjects.length!==1||!subject)throw new Error('Scope must be precisely Chemistry')
mkdirSync(`${own}/receipts`,{recursive:true})
const path=`${own}/receipts/ACTUAL.current407-inactive-chemistry-central-stock-report.json`
writeFileSync(path,JSON.stringify(report,null,2)+'\n')
const parsed=JSON.parse(readFileSync(path,'utf8'))
if(JSON.stringify(parsed)!==JSON.stringify(report))throw new Error('Complete report parse differs')
console.log(JSON.stringify({subject:subject.subject,denominator:subject.denominator,strictComplete:subject.strictComplete,
 percentage:subject.percentage,remaining:subject.remaining,gates:subject.gates,
 requiredChecks:subject.requiredChecks,blockingIssueCount:report.blockingIssueCount,issues:subject.issues}))
if(report.blockingIssueCount!==0)process.exitCode=1
