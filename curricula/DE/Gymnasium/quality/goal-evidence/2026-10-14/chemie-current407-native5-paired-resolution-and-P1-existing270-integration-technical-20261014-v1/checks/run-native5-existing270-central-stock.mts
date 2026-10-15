// Apache-2.0. Exactly Chemistry, inactive private host, unchanged stock engine.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-native5-paired-resolution-and-P1-existing270-integration-technical-20261014-v1'
const {generateDeepUnderstandingRollout,loadDeepUnderstandingRolloutConfig}=await import(pathToFileURL(resolve('app/scripts/reportDeepUnderstandingRollout.ts')).href)
const config=`${own}/config/chemie-current407-native5-existing270.inactive.config.json`
const loaded=loadDeepUnderstandingRolloutConfig(config)
if(loaded.subjects.length!==1||loaded.subjects[0].subject!=='chemie')throw Error('Exactly Chemistry required')
const startedAtUTC=new Date().toISOString()
const report=await generateDeepUnderstandingRollout(config)
const completedAtUTC=new Date().toISOString()
const subject=report.subjects.find((s:any)=>s.subject==='chemie')
if(report.subjects.length!==1||!subject)throw Error('Exactly one Chemistry result required')
mkdirSync(`${own}/receipts`,{recursive:true})
const path=`${own}/receipts/ACTUAL.current407-native5-existing270-chemistry-central-stock-report.json`
writeFileSync(path,JSON.stringify(report,null,2)+'\n')
if(JSON.stringify(JSON.parse(readFileSync(path,'utf8')))!==JSON.stringify(report))throw Error('Full output parse mismatch')
writeFileSync(`${own}/receipts/ACTUAL.current407-native5-central-stock-run-timestamps.json`,JSON.stringify({startedAtUTC,completedAtUTC,configPath:config,stockFunction:'generateDeepUnderstandingRollout',scope:'Exactly Chemistry; inactive private host; no source, human, Git, CI or active-adoption approval'},null,2)+'\n')
console.log(JSON.stringify({strictComplete:subject.strictComplete,denominator:subject.denominator,remaining:subject.remaining,gates:subject.gates,requiredChecks:subject.requiredChecks,blockingIssueCount:report.blockingIssueCount,issues:subject.issues}))
if(report.blockingIssueCount!==0)process.exitCode=1
