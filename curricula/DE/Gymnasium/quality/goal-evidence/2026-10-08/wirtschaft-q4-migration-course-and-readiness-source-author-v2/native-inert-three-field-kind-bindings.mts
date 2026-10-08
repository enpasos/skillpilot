// Apache-2.0. Native binding of unchanged classifications in an inert author trial.
import { readFile, writeFile } from 'node:fs/promises'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
const root='/home/enpasos/projects/skillpilot'
const iso='/tmp/skillpilot-wirtschaft-q4-migration-scope-inert-v2-current164-wnp2f297'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-q4-migration-course-and-readiness-source-author-v2'
const can='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const kind='curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-m7-current-baseline-20261008-v1/wirtschaftswissenschaften.semantic-kinds.json'
const raw=JSON.parse(await readFile(iso+'/'+can,'utf8'))
const ledger=JSON.parse(await readFile(iso+'/'+kind,'utf8'))
const actual=[]
for(const d of ledger.decisions){
  if(!['6de44afa-7f91-5fa4-9292-ec06e86e97a4','44fb56bb-7b5a-4b34-9ca4-c4052f94da89'].includes(d.goalId))continue
  const goal=raw.goals.find((g:any)=>g.id===d.goalId)
  const before=d.sourceFingerprint
  // The preparer's unused wrong-name placeholder was inert and is removed here;
  // the actual source binding comes exclusively from the native whole-goal function.
  const removedInertNonContractPlaceholder=d.sourceGoalFingerprint??null
  delete d.sourceGoalFingerprint
  d.sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
  actual.push({goalId:d.goalId,semanticKindUnchanged:d.semanticKind,beforeSourceFingerprint:before,
    nativeCurrentSourceFingerprint:d.sourceFingerprint,removedInertNonContractPlaceholder})
}
await writeFile(iso+'/'+kind,JSON.stringify(ledger,null,2)+'\n')
await writeFile(root+'/'+own+'/native-inert-three-field-kind-binding.actual.json',JSON.stringify({
  role:'technical_inert_source_binding',actualCheckedAt:new Date().toISOString(),physicalIsolate:iso,
  actualBindings:actual,nativeWholeGoalFunction:'fingerprintSemanticKindSourceGoal',
  independentClassificationOrSourceApprovalClaim:false,activeWrites:0,newStrictClosures:0,
},null,2)+'\n',{flag:'wx'})
console.log('Two unchanged kinds bound to the actual inert three-field candidate using the native whole-goal function.')
