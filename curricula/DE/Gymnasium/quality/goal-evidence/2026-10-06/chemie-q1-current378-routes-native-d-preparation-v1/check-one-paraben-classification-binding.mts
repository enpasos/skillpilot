import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const canonical=JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8'))
const ledgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const beforeBytes=readFileSync(ledgerPath)
const ledger=JSON.parse(beforeBytes.toString())
const before=structuredClone(ledger)
const id='0d59b62e-d3f9-5969-b961-0c5e26316c04'
const goal=canonical.goals.find((g:any)=>g.id===id);const decision=ledger.decisions.find((d:any)=>d.goalId===id)
assert.equal(goal.extendedData.applicabilityMappingInheritance,'boundary')
assert.equal(decision.semanticKind,'curricularAtomic')
const actual=fingerprintSemanticKindSourceGoal(goal)
assert.equal(decision.sourceFingerprint,'sha256:3e428ba5cdae8ea563b1ffe9925471efe0f6e427ab91e40b232176338b51af1d')
assert.equal(actual,'sha256:f98153a2f25d11d1dddf20dd59c670eeb34dc7ed302a248e647920367fbab8a7')
const beforeDecision=structuredClone(decision)
decision.sourceFingerprint=actual
assert.deepEqual(ledger.decisions.filter((d:any)=>d.goalId!==id),before.decisions.filter((d:any)=>d.goalId!==id))
const afterBytes=JSON.stringify(ledger,null,2)+'\n'
writeFileSync(ledgerPath,afterBytes)
writeFileSync(own+'/semantic-kinds.controls-v2-paraben-v3.inactive.json',afterBytes)
const hash=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const result={schemaVersion:1,goalId:id,beforeDecision,afterDecision:decision,actualNativeFingerprint:actual,ledgerUpdateRequired:true,ledgerModified:true,changedDecisionCount:1,other478DecisionsExactPreviousInactiveLedger:true,beforeLedgerSHA256:hash(beforeBytes),afterLedgerSHA256:hash(afterBytes),reason:'Native pinned semantic-kind source-fingerprint includes extendedData; additive author v3 boundary requires this one technical classification binding update.',previousNoUpdateAssumptionWithdrawn:true,actualClassificationDecision:'Existing author-reviewed curricularAtomic paraben-use goal retained; sole additive scope boundary does not change its scientific task or semantic kind.',nativeCodeModified:false,scienceReviewDecision:null,activeWrites:false,humanApproval:false}
writeFileSync(own+'/one-paraben-classification-binding.actual.receipt.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result))
