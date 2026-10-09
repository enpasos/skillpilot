import { readFileSync, writeFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-five-whole-atomicity-memory-independent-b-v1/'
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1/'
const verdict = JSON.parse(readFileSync(own+'twenty-five-whole-A-M.independent-b.first-verdict.immutable.json','utf8'))
const landscape = JSON.parse(readFileSync(author+'candidate/canonical504-current26-resource-links.inactive.json','utf8'))
const ledger = JSON.parse(readFileSync(author+'candidate/semantic-kinds.current504.technical-review-input.json','utf8'))
const rows = verdict.all25GoalResults.map((r:any)=>{
 const goal = landscape.goals.find((g:any)=>g.id===r.goalId)
 const technical = ledger.decisions.find((d:any)=>d.goalId===r.goalId)
 const fp = fingerprintSemanticKindSourceGoal(goal)
 return {goalId:r.goalId,ownFirstSemanticKind:r.semanticKind.semanticKind,actualSourceFingerprint:fp,technicalCandidateKind:technical.semanticKind,technicalCandidateSourceFingerprint:technical.sourceFingerprint,kindMatchesOwnFirst:technical.semanticKind===r.semanticKind.semanticKind,fingerprintMatchesActualBytes:fp===technical.sourceFingerprint,authoritativeMetadataAdopted:false,ownIndependentSemanticReason:r.semanticKind.reason}
})
const result = {schemaVersion:1,api:'existing fingerprintSemanticKindSourceGoal',role:'technical current actual source binding countercheck after independent semantic first',rows,failures:rows.filter((r:any)=>!r.kindMatchesOwnFirst||!r.fingerprintMatchesActualBytes),sourceCourseAndProtectedContextApproval:false,humanApproval:false,strictGain:0}
writeFileSync(own+'normal25-kind-existing-api.actual.receipt.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({rows:rows.length,failures:result.failures.length}))
