// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-source-atlas-receipt-cluster-metadata-refresh-v1'
const cfgPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const cfg=readGoalBookSourceAtlasInputConfig(cfgPath),native=buildGoalBookSourceAtlasInputs(cfg)
const receiptPath=cfg.outputDirectory+'/source-projection.receipt.json'
const before=JSON.parse(readFileSync(receiptPath,'utf8')),after=JSON.parse(native.outputs[receiptPath])
const allowed=[cfg.landscapePath,cfg.semanticKindLedgerPath]
const bindingDeltas:any[]=[]
assert.equal(before.inputBindings.length,after.inputBindings.length)
for(let i=0;i<before.inputBindings.length;i++){
 const a=before.inputBindings[i],b=after.inputBindings[i]
 assert.equal(a.path,b.path)
 if(a.sha256!==b.sha256){assert(allowed.includes(a.path));bindingDeltas.push({jsonPointer:'/inputBindings/'+i+'/sha256',path:a.path,before:a.sha256,after:b.sha256})}
}
assert.deepEqual(bindingDeltas.map(d=>d.path).sort(),allowed.sort())
const equivalent=structuredClone(after)
equivalent.inputBindings=before.inputBindings
assert.deepEqual(equivalent,before,'The whole native receipt must change only the two technical input hash bindings')
const hash=(v:string|Buffer)=>createHash('sha256').update(v).digest('hex')
const outputs=Object.entries(native.outputs).map(([path,bytes])=>({path,beforeSHA256:hash(readFileSync(path)),afterNativeSHA256:hash(bytes),byteExact:readFileSync(path,'utf8')===bytes}))
assert(outputs.every(row=>row.path===receiptPath||row.byteExact))
assert.deepEqual(outputs.filter(row=>!row.byteExact).map(row=>row.path),[receiptPath])
const rootHistory='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1'
const oldCanon=JSON.parse(readFileSync(rootHistory+'/biologie-canonical.before-cluster-schema-metadata.json','utf8'))
const currentCanon=JSON.parse(readFileSync(cfg.landscapePath,'utf8'))
const oldKind=JSON.parse(readFileSync(rootHistory+'/biologie-semantic-kinds.before-cluster-schema-metadata.json','utf8'))
const currentKind=JSON.parse(readFileSync(cfg.semanticKindLedgerPath,'utf8'))
assert.equal('sha256:'+hash(readFileSync(rootHistory+'/biologie-canonical.before-cluster-schema-metadata.json')),before.inputBindings.find((b:any)=>b.path===cfg.landscapePath).sha256)
assert.equal('sha256:'+hash(readFileSync(rootHistory+'/biologie-semantic-kinds.before-cluster-schema-metadata.json')),before.inputBindings.find((b:any)=>b.path===cfg.semanticKindLedgerPath).sha256)
const oldBy=new Map(oldCanon.goals.map((g:any)=>[g.id,g]))
const changedGoals=currentCanon.goals.filter((g:any)=>JSON.stringify(oldBy.get(g.id))!==JSON.stringify(g)).map((g:any)=>({goalId:g.id,before:oldBy.get(g.id),after:g}))
assert.equal(changedGoals.length,1)
assert.equal(changedGoals[0].goalId,'9cd0dbbc-9507-5879-8c4f-df54529969ec')
const oldRows=new Map(oldKind.decisions.map((d:any)=>[d.goalId,d]))
const changedKinds=currentKind.decisions.filter((d:any)=>JSON.stringify(oldRows.get(d.goalId))!==JSON.stringify(d)).map((d:any)=>({goalId:d.goalId,before:oldRows.get(d.goalId),after:d}))
assert.equal(changedKinds.length,1)
assert.equal(changedKinds[0].goalId,changedGoals[0].goalId)
assert.equal(currentCanon.goals.length,oldCanon.goals.length)
assert.equal(currentKind.decisions.length,oldKind.decisions.length)
assert.deepEqual(currentKind.counts,oldKind.counts)
writeFileSync(own+'/native-generated-receipt.preview.candidate.json',native.outputs[receiptPath],{flag:'wx'})
const result={atUTC:new Date().toISOString(),status:'Actual unchanged native generator preview passed; no active output writes yet',nativeGeneratorPath:'app/scripts/goalBookSourceAtlasInputs.ts',nativeGeneratorSHA256:hash(readFileSync('app/scripts/goalBookSourceAtlasInputs.ts')),configPath:cfgPath,wholeReceiptOnlyTechnicalInputBindingDeltas:bindingDeltas,claimsExact:JSON.stringify(before.claims)===JSON.stringify(after.claims),countsExact:JSON.stringify(before.counts)===JSON.stringify(after.counts),witnessesScopesAndWholeSourceRowsExact:true,allOtherWholeReceiptFieldsExact:true,nativeCounts:after.counts,allGeneratedOutputByteComparisons:outputs,generatedOutputCount:outputs.length,unchangedGeneratedOutputCount:outputs.filter(x=>x.byteExact).length,changedCanonicalWholeGoalRows:changedGoals,changedSemanticKindRows:changedKinds,unchangedCanonicalWholeGoals:currentCanon.goals.length-1,unchangedSemanticKindRows:currentKind.decisions.length-1,sourceCurricularAtomicGoalsUnchanged:383,activeWrites:false,newScientificReview:false,humanApproval:false,newScientificClosures:0}
writeFileSync(own+'/actual-native-preview-and-complete-deltas.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({outputCount:outputs.length,unchangedOutputCount:outputs.filter(x=>x.byteExact).length,onlyChangedOutput:receiptPath,technicalInputHashDeltas:bindingDeltas,nativeCounts:after.counts,newScientificClosures:0,activeWrites:false}))
