// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sha256WithoutLearningUnitLayer } from '../../../../../../../app/scripts/learningUnitLayerProjection.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..'),write=process.argv.includes('--write')
assert.ok(process.argv.slice(2).every(arg=>arg==='--write'))
const read=(path:string)=>readFileSync(resolve(root,path)),hash=(bytes:Buffer|string)=>`sha256:${createHash('sha256').update(bytes).digest('hex')}`
const predecessor=JSON.parse(readFileSync(resolve(directory,'edge-predecessor-input.json'),'utf8'))
const priorReceiptBytes=read(predecessor.previousStageDurationReceiptPath)
assert.equal(hash(priorReceiptBytes),predecessor.previousStageDurationReceiptSha256,'first-stage evidence changed')
const previousReceipt=JSON.parse(priorReceiptBytes.toString()),currentBytes=read(predecessor.canonicalPath),text=currentBytes.toString()
const beforeRequires=predecessor.goalBefore.requires,afterRequires=[beforeRequires[0],'858113c5-e53b-57bb-b01f-ba95c3ddcb6f',...beforeRequires.slice(1)]
const block=(values:string[])=>`      "requires": ${JSON.stringify(values,null,2).split('\n').map((line,index)=>index===0?line:`      ${line}`).join('\n')},`
const afterBlock=block(afterRequires),beforeBlock=block(beforeRequires)
assert.equal(text.split(afterBlock).length,2,'reviewed added-edge block is not unique')
const recoveredBefore=Buffer.from(text.replace(afterBlock,beforeBlock))
assert.equal(hash(recoveredBefore),predecessor.canonicalRawSha256,'another canonical byte changed beyond the single edge')
assert.equal(hash(recoveredBefore),`sha256:${previousReceipt.currentRawSha256}`,'captured predecessor is not the actually reviewed first-stage input')
assert.equal(sha256WithoutLearningUnitLayer(recoveredBefore),previousReceipt.currentProjectedSha256)
const currentGoal=JSON.parse(text).goals.find((goal:any)=>goal.id===predecessor.goalBefore.id)
assert.deepEqual(currentGoal,{...predecessor.goalBefore,requires:afterRequires},'current target changed beyond reviewed prerequisite')
const planPath='app/scripts/config/math-duration-split-spanning-tree-policy.json',plan=JSON.parse(read(planPath).toString())
const strip=(value:any)=>({...value,inputs:{...value.inputs,canonical:{...value.inputs.canonical,sha256:null}}})
assert.deepEqual(strip(plan),strip(predecessor.durationPlanBefore),'another layout binding changed')
assert.equal(predecessor.durationPlanBefore.inputs.canonical.sha256,previousReceipt.currentProjectedSha256)
const expected=sha256WithoutLearningUnitLayer(currentBytes)
if(write){plan.inputs.canonical.sha256=expected;writeFileSync(resolve(root,planPath),`${JSON.stringify(plan,null,2)}\n`)}else assert.equal(plan.inputs.canonical.sha256,expected)
const paths=previousReceipt.unchangedOutputs.map((item:any)=>item.path)
const beforeOutputs=paths.map((path:string)=>({path,sha256:hash(read(path)).slice(7)}))
assert.deepEqual(beforeOutputs,previousReceipt.unchangedOutputs,'a composition view changed since first-stage review')
const check=spawnSync('npm',['--prefix','app','run','-s','check:math-duration-composition-views'],{cwd:root,encoding:'utf8',maxBuffer:3000000})
assert.equal(check.status,0,`${check.stdout}\n${check.stderr}`)
assert.deepEqual(paths.map((path:string)=>({path,sha256:hash(read(path)).slice(7)})),beforeOutputs)
const receipt={schemaVersion:1,kind:'successor-technical-duration-input-maintenance',predecessorReceiptPath:predecessor.previousStageDurationReceiptPath,predecessorReceiptSha256:hash(priorReceiptBytes),canonicalPath:predecessor.canonicalPath,beforeRawSha256:hash(recoveredBefore),afterRawSha256:hash(currentBytes),beforeProjectedSha256:sha256WithoutLearningUnitLayer(recoveredBefore),afterProjectedSha256:expected,completeByteComparison:'Removing exactly the unique added08b→858 requires line reproduces every byte of the actual first-stage canonical input; its raw hash matches the immutable first-stage duration receipt. No other canonical byte changed.',changedGoalId:currentGoal.id,beforeRequires,afterRequires,generator:{command:'npm --prefix app run -s check:math-duration-composition-views',exitCode:check.status,stdout:check.stdout,stderr:check.stderr},unchangedOutputs:beforeOutputs,note:'Previous actual input and receipt are not overwritten or reinterpreted. Single edge responds to independently reviewed actual Q4 content; no general sufficiency, human approval or learner-result claim.'}
const receiptBytes=`${JSON.stringify(receipt,null,2)}\n`
if(write)writeFileSync(resolve(directory,'duration-successor.receipt.json'),receiptBytes);else assert.equal(readFileSync(resolve(directory,'duration-successor.receipt.json'),'utf8'),receiptBytes)
console.log(`Duration successor ${write?'materialized':'verified'}: one exact prerequisite-line delta; ${paths.length} unchanged regular-generator views.`)
