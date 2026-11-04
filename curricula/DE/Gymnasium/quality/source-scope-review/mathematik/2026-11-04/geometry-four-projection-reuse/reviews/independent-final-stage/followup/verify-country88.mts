import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const F=dirname(fileURLToPath(import.meta.url)),H=resolve(F,'../..'),C=resolve(H,'geometry-four-source-and-guard-followup-20261104-v1/check-host'),sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex'),policyPath='app/scripts/config/math-country-seki-stage-policy.json',policy=JSON.parse(readFileSync(resolve(C,policyPath),'utf8'))
const {assertMathStagePolicyInputs,deriveMathCountrySekIViews,deriveMathExistingStageViews}=await import(pathToFileURL(resolve(C,'app/scripts/generateMathCountrySekICompositionViews.ts')).href)
const started=performance.now(),validated=assertMathStagePolicyInputs(C,policy),outputs=[...deriveMathCountrySekIViews(C,policy),...deriveMathExistingStageViews(C,policy)]
assert.equal(outputs.length,88)
const rows=outputs.map((x:any)=>{assert.equal(readFileSync(resolve(C,x.path),'utf8'),JSON.stringify(x.view,null,2)+'\n');return{path:x.path,viewId:x.view.viewId,sha256:sha(resolve(C,x.path))}})
const report={status:'PASS_OWN_ACTUAL_EFFECTIVE_SOURCE_INPUT_READER_AND_COUNTRY88_BYTE_EXACT_READONLY',policySha256:sha(resolve(C,policyPath)),sourceDecisions:validated.decisions.decisions.length,views:rows,seconds:Math.round((performance.now()-started)/10)/100,receiptNotNeededForPreview:true,stageApproval:false}
writeFileSync(resolve(F,'country88-independent.actual.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,views:rows.length,seconds:report.seconds}))
