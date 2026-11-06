import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {fingerprintSemanticKindSourceGoal,parseSemanticKindLedger} from '../../../../app/scripts/goalBookModel'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../app/scripts/positiveGoalEvidenceProfileModel'
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const input='tmp/math-orientation-normalization-review-2026-11-06/evidence-impact.json'
assert.equal(sha(readFileSync(input)),'e435113958fc9068c0753a3bff50c2c3e079f7fc6918881bfd715c59c83dff41')
const impact=load(input),original=load(impact.source.path),candidate=load(impact.candidatePath)
assert.equal(sha(readFileSync(impact.source.path)),impact.source.sha256)
assert.equal(sha(readFileSync(impact.candidatePath)),'b2155f4167f104e5b8eef183f7bb9a7a792a873a9e5d009d5083e0bc84c68cfd')
const ledger=load(impact.rows[0].semanticKind.ledgerPath),fresh=structuredClone(ledger),decisions:any[]=[],pChecks:any[]=[]
for(const r of impact.rows){
 const before=original.goals.find((g:any)=>g.id===r.goalId),after=candidate.goals.find((g:any)=>g.id===r.goalId)
 const old=ledger.decisions.find((d:any)=>d.goalId===r.goalId),next=fresh.decisions.find((d:any)=>d.goalId===r.goalId)
 assert.equal(fingerprintSemanticKindSourceGoal(before),old.sourceFingerprint)
 next.sourceFingerprint=fingerprintSemanticKindSourceGoal(after)
 assert.equal(next.sourceFingerprint,r.semanticKind.candidateFingerprint)
 next.decisionBasis='reviewed-current-semantic-recheck-curricular-atomic'
 decisions.push({goalId:r.goalId,before:old,proposedFreshDecision:next})
 const p=r.positiveBindings[0],record=readFileSync(p.reviewPath,'utf8').trim().split('\n').map(JSON.parse).find((z:any)=>z.goalId===r.goalId)
 const errorsBefore=validatePositiveGoalEvidenceRecordSemantics(record,before,p.resourceDigests,'curricularAtomic')
 const errorsAfter=validatePositiveGoalEvidenceRecordSemantics(record,after,p.resourceDigests,'curricularAtomic')
 assert.deepEqual(errorsBefore,[]);assert.equal(errorsAfter.length,1);assert.ok(errorsAfter[0].includes('stale reviewInputFingerprint'))
 pChecks.push({goalId:r.goalId,before:errorsBefore,candidateWithHistoricalRecord:errorsAfter,recordChanged:false})
}
const parse=(l:any,g:any)=>parseSemanticKindLedger(l,g,ledger.sourceLandscapeId,ledger.sourceLandscapePath)
parse(ledger,original);let oldRejected=false;try{parse(ledger,candidate)}catch(e){oldRejected=true}assert.ok(oldRejected);parse(fresh,candidate)
const result={status:'fresh-kind-decisions-format-checked-historical-P-correctly-stale-not-D-P-qualification',source:impact.source,candidateSha256:sha(readFileSync(impact.candidatePath)),newKindJudgments:'The peer review supplies the substantive three independent curricularAtomic judgments; this script checks only their native format/binding.',kindControls:{originalWithOriginalLedger:'pass',candidateWithOriginalLedger:'reject',candidateWithThreeFreshDecisions:'pass'},decisions,pChecks,activeSourceOrQaWrites:false}
writeFileSync('qa-artifacts/ci-contract-audit/2026-11-06/math-orientation-three-peer/kind-and-staleness.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({kindControls:result.kindControls,pBeforeAllValid:true,pCandidateAllThreeStale:true,activeWrites:false}))
