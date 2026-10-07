// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const own=dirname(fileURLToPath(import.meta.url)), root=resolve(own,'../../../../../../..')
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-hh-thirty-two-source-restoration-author-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const digest=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')}`
const configPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
const config=read(configPath), configHash=digest(configPath)
assert.equal(config.expectedCurricularAtomicGoalCount,390)
const mappingPath=author+'/HH.bounded-component-mappings.author-v1.candidate.json'
assert.ok(!config.mappingPaths.includes(mappingPath))
const mapping=read(mappingPath), source=read(mapping.sourceExtractionPath)
const decisions=read(author+'/HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json')
const guard=JSON.parse(readFileSync(resolve(own,'actual-current-input-guard.independent-a.json'),'utf8'))
for(const b of guard.inputBindings) assert.equal(digest(b.path),b.sha256,b.path)
const baseline=buildGoalBookSourceAtlasInputs(config,root)
const candidate=buildGoalBookSourceAtlasInputs({...config,mappingPaths:[...config.mappingPaths,mappingPath]},root)
const targets=(r:typeof baseline)=>r.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds}))
assert.deepEqual(targets(candidate),targets(baseline))
assert.equal(candidate.outputs[config.navigationViewPath],baseline.outputs[config.navigationViewPath])
assert.equal(source.sourceGoals.length,21)
const witnesses=candidate.receipt.scopes.flatMap(s=>s.witnesses.filter(w=>w.mappingPath===mappingPath).map(w=>({scopeKey:s.key,...w})))
assert.equal(witnesses.length,21)
assert.deepEqual(witnesses.map(w=>w.goalId).sort(),mapping.mappings.map((r:any)=>r.canonicalGoalId).sort())
assert.ok(witnesses.every(w=>w.scopeKey==='DE-HH/SekI/'&&w.coverage==='direct'&&w.goalId===w.mappedTargetGoalId&&w.profileBasis==='source-metadata'))
assert.equal(decisions.openCurrentGoalScopeHolds.length,11)
assert.ok(decisions.openCurrentGoalScopeHolds.every((r:any)=>!witnesses.some(w=>w.goalId===r.goalId)))
assert.equal(source.retainedOriginalSourceObligations.originalWholeHoldDecision.decision,'needs_canonical_goal')
for(const b of [...guard.inputBindings,...candidate.receipt.inputBindings]) assert.equal(digest(b.path),b.sha256,b.path)
assert.equal(digest(configPath),configHash)
const result={schemaVersion:1,createdAtUTC:new Date().toISOString(),role:'independent A targeted native execution; source science decisions kept separate',configBinding:{path:configPath,sha256:configHash},nativeHelperBinding:{path:'app/scripts/goalBookSourceAtlasInputs.ts',sha256:digest('app/scripts/goalBookSourceAtlasInputs.ts')},baselineCounts:baseline.receipt.counts,candidateCounts:candidate.receipt.counts,allCompleteOrderedCountryTargetSetsExactlyPreserved:true,countryScopes:targets(baseline),canonicalNavigationExactlyPreserved:true,newDirectHHWitnesses:witnesses,originalWholeHoldRetained:true,remainingElevenWholePairHolds:decisions.openCurrentGoalScopeHolds.map((r:any)=>r.goalId),actualInputBindings:candidate.receipt.inputBindings,original155OtherPairsNotChanged:true,fullNeuro21HoldOverlay:'NOT_RUN',compilerStatusPromotion:false,activeWrites:false,newStrictCompletions:0,restoredActiveBindings:0,strictNetGain:0,humanApproval:false,humanTrial:false}
writeFileSync(resolve(own,'native-current390-additive-atlas.independent-a.actual.receipt.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({nativeTargetedResult:'PASS',countryScopes:baseline.receipt.scopes.length,directHHWitnesses:witnesses.length,wholePairHolds:11,strictNetGain:0,fullNeuro21HoldOverlay:'NOT_RUN'}))
