import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-q1-current378-routes-native-d-preparation-v1'
const canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const ledgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const bytes=readFileSync(ledgerPath);const ledger=JSON.parse(bytes.toString());const before=structuredClone(ledger)
const raw=JSON.parse(readFileSync(canon,'utf8'));const goals=new Map(raw.goals.map((g:any)=>[g.id,g]))
const ids=['00139854-e5a7-5c12-ab50-2268c80bf776','bf6c39f0-1e44-53b2-8ff6-025f2e36e125','c91350bc-7d2e-523c-bd50-0324bccfcf98','4cb74d76-99f1-5264-b1e3-448cda47b005','171b47e2-2c53-50f2-a145-a26b896fd73f']
const updates=ids.map(goalId=>{
 const d=ledger.decisions.find((d:any)=>d.goalId===goalId);assert.equal(d.semanticKind,'practiceAssessment');assert.equal(d.decisionStatus,'authoritative')
 const beforeDecision=structuredClone(d);const actual=fingerprintSemanticKindSourceGoal(goals.get(goalId) as any);assert.notEqual(actual,d.sourceFingerprint);d.sourceFingerprint=actual
 return {goalId,beforeDecision,afterDecision:structuredClone(d),changedFields:['sourceFingerprint'],classificationRetained:'practiceAssessment'}
})
assert.deepEqual(ledger.decisions.filter((d:any)=>!ids.includes(d.goalId)),before.decisions.filter((d:any)=>!ids.includes(d.goalId)))
assert.equal(ledger.decisions.length,479)
const afterBytes=JSON.stringify(ledger,null,2)+'\n';writeFileSync(ledgerPath,afterBytes);writeFileSync(own+'/semantic-kinds.final-v4.inactive.json',afterBytes)
const hash=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const receipt={schemaVersion:1,createdAtUTC:new Date().toISOString(),beforeLedgerSHA256:hash(bytes),afterLedgerSHA256:hash(afterBytes),updates,changedDecisionCount:5,other474DecisionsExactPreviousInactiveLedger:true,countsExact:ledger.counts,
 actualClassificationBasis:'Parent-author v4 retains the three existing practice assessments and the two new material-supported 24/24 assessments; separate actual A and B full-content decisions underlie machine task release. Native binding update only.',
 bulkFingerprintsRefreshed:false,nativeCodeModified:false,scienceDPAReviewDecisions:[],activeWrites:false,humanApproval:false}
writeFileSync(own+'/five-v4-classification-bindings.actual.receipt.json',JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify({changedDecisionCount:updates.length,other474Exact:true,afterLedgerSHA256:hash(afterBytes)}))
