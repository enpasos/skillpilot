// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve(own,'../../../../../../..')
const cp='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const config=JSON.parse(readFileSync(resolve(root,cp),'utf8'))
assert.equal(config.expectedCurricularAtomicGoalCount,390)
const baseline=buildGoalBookSourceAtlasInputs(config,root)
const mapping=resolve(own,'TH.nineteen-component-mappings.author-v2.candidate.json').slice(root.length+1)
const candidate=buildGoalBookSourceAtlasInputs({...config,mappingPaths:[...config.mappingPaths,mapping]},root)
const scopes=(r:any)=>r.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds}))
assert.deepEqual(scopes(candidate),scopes(baseline))
const m=JSON.parse(readFileSync(resolve(root,mapping),'utf8'))
const proposedIds=m.mappings.map((r:any)=>r.canonicalGoalId)
const th=candidate.receipt.scopes.find((s:any)=>s.key==='DE-TH/SekI/')
const witnesses=th.witnesses.filter((w:any)=>w.mappingPath===mapping)
assert.equal(proposedIds.length,19)
assert.deepEqual([...new Set(witnesses.map((w:any)=>w.goalId))].sort(),proposedIds.sort())
const old=JSON.parse(readFileSync(resolve(own,'current-canon-and-source-author-input-preservation.json'),'utf8'))
const canonical=JSON.parse(readFileSync(resolve(root,config.landscapePath),'utf8'))
assert.deepEqual(canonical,old.currentCanonicalWholeGoalSnapshot)
const receipt={schemaVersion:1,createdAtUTC:new Date().toISOString(),nativeCodePath:'app/scripts/goalBookSourceAtlasInputs.ts',nativeCodeSha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(root,'app/scripts/goalBookSourceAtlasInputs.ts'))).digest('hex'),current390AtlasContract:{status:'PASS',expected:390,baseline:baseline.receipt.counts,candidate:candidate.receipt.counts},allCurrentSourceViewTargetSetsExactlyPreserved:true,currentCanonicalWholePayloadExactlyPreserved:true,proposedTHDirectComponentWitnessCount:19,proposedTHDirectComponentWitnesses:witnesses,actualInputBindings:candidate.receipt.inputBindings,baselineScopes:scopes(baseline),candidateScopes:scopes(candidate),scopeLimitation:'Current Atlas plus isolated additional TH component candidates only. The historical Neuro21 whole-source-hold overlay has NOT been reproduced here, so this is NOT full prospective 52/187 restoration or approval. Current broad original mappings remain active baseline evidence, not new source-author approval.',bookModelReproduction:'Not run: this scoped additive source compile preserves every actual current view target set; whole Neuro21 hold-overlay view/book preservation remains explicitly pending.',activeWrites:false,restoredActiveBindings:0,strictCompletionsAdded:0,independentReviewPending:true,humanApproval:false,humanTrial:false}
writeFileSync(resolve(own,'native-th-nineteen-current-atlas.author-v2.actual.receipt.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({current390Atlas:'PASS',exactCurrentScopesPreserved:true,newTHComponentWitnesses:19,fullNeuroHoldOverlayRestoration:'NOT_RUN',activeWrites:false,strictGain:0}))
