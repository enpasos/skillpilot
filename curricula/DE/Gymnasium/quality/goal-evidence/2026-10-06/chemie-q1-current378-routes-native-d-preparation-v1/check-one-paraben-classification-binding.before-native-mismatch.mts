import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const canonical=JSON.parse(readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json','utf8'))
const ledger=JSON.parse(readFileSync('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json','utf8'))
const id='0d59b62e-d3f9-5969-b961-0c5e26316c04'
const goal=canonical.goals.find((g:any)=>g.id===id);const decision=ledger.decisions.find((d:any)=>d.goalId===id)
assert.equal(goal.extendedData.applicabilityMappingInheritance,'boundary')
assert.equal(decision.semanticKind,'curricularAtomic')
const actual=fingerprintSemanticKindSourceGoal(goal)
assert.equal(actual,decision.sourceFingerprint)
const result={schemaVersion:1,goalId:id,boundFingerprint:decision.sourceFingerprint,actualNativeFingerprint:actual,ledgerUpdateRequired:false,ledgerModified:false,reason:'Applicability mapping inheritance boundary does not change the pinned semantic-kind source-fingerprint field set.',nativeCodeModified:false,scienceReviewDecision:null,activeWrites:false,humanApproval:false}
writeFileSync(own+'/one-paraben-classification-binding.actual.receipt.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify(result))
