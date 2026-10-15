import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateDeepUnderstandingRollout, loadDeepUnderstandingRolloutConfig } from './reportDeepUnderstandingRollout'

// No config/report/receipt path argument is accepted. Authority is the current
// registered Math+Physics native pipeline, including its full input/asset checks.
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..')
const configPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const hash=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const canonical=(v:unknown):unknown=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a<b?-1:a>b?1:0).map(([k,x])=>[k,canonical(x)])):v
const digest=(v:unknown)=>hash(JSON.stringify(canonical(v)))
if(process.argv.slice(2).length===1&&process.argv[2]==='--native-worker'&&process.env.SKILLPILOT_NATIVE_EXECUTABLES&&process.env.TSX_DISABLE_CACHE==='1'){
  const positiveEvidenceOwners:Record<string,unknown>={}
  const report=await generateDeepUnderstandingRollout(configPath,(path,config,record)=>{
    positiveEvidenceOwners[record.goalId]={landscapeId:record.landscapeId,configPath:path,reviewPath:config.reviewPath,
      reviewId:record.reviewId,goalFingerprint:record.goalFingerprint,profileFingerprint:record.profileFingerprint,
      reviewInputFingerprint:record.reviewInputFingerprint,recordSha256:digest(record),reviewAuthority:record.reviewAuthority,status:record.status}
  },new Set(['mathematik','physik']))
  if(report.blockingIssueCount!==0||report.subjects.length!==2||report.subjects.some(s=>!s.strictCompletionReady))throw new Error('Current registered native Kind/D/P/A/M/V acceptance is incomplete: '+JSON.stringify(report.subjects.map(s=>({subject:s.subject,strict:s.strictComplete,denominator:s.denominator,issues:s.issues}))))
  const config=loadDeepUnderstandingRolloutConfig(configPath)
  const goals=Object.fromEntries(config.subjects.filter(s=>['mathematik','physik'].includes(s.subject)).flatMap(s=>{
    const raw=JSON.parse(readFileSync(resolve(root,s.landscapePath),'utf8'))
    const accepted=new Set(report.subjects.find(r=>r.landscapeId===raw.landscapeId)!.strictCompleteGoalIds)
    return raw.goals.filter((g:{id:string})=>accepted.has(g.id)).map((g:{id:string})=>[g.id,{landscapeId:raw.landscapeId,landscapePath:s.landscapePath,rawGoalSha256:digest(g),positiveEvidenceOwner:positiveEvidenceOwners[g.id]}])
  }))
  console.log(JSON.stringify({producerContract:'registered-gymnasium-native-acceptance-v1',configPath,report,goals}))
}else{
  throw new Error('Run the fixed plain-CJS bootstrap runCompositionSupplementNativeAcceptance.cjs; direct TS producer/receipt paths are unsupported')
}
