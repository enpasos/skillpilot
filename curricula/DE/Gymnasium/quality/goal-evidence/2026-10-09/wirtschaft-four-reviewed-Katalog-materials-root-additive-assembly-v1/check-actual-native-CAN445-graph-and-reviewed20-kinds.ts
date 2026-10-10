import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const out=dirname(fileURLToPath(import.meta.url))
const root=resolve(out,'../../../../../../..')
const framePath=resolve(out,'whole-CAN445-reviewed-E9-Q2-Q3-Q1-Q4-Katalog-and-pure-navigation.inert.json')
const raw=JSON.parse(readFileSync(framePath,'utf8'))
const index=new Map<string,Record<string,unknown>>(raw.goals.map((g:Record<string,unknown>)=>[g.id as string,g]))
const model=normalizeCanonicalLandscape(raw)
const diagnostics=validateCanonicalLandscape(model)
const errors=diagnostics.filter(d=>d.severity==='error')
assert.deepEqual(errors,[])
assert.equal(model.goals.length,445)
const q440=resolve(out,'../wirtschaft-twelve-reviewed-Q3-Q1-Q4-materials-root-additive-assembly-v1')
const q14=resolve(out,'../wirtschaft-Q1-Q4-fifteen-five-coherent-material-independent-whole-review-v1')
const q3Kinds=JSON.parse(readFileSync(resolve(q440,'eight-individual-independent-Q3-assessment-and-navigation-kind-decisions.json'),'utf8'))
const q14Whole=JSON.parse(readFileSync(resolve(q14,'seven-individual-independent-assessment-and-pure-navigation-kind-decisions.json'),'utf8'))
assert.equal(q14Whole.schemaVersion,1)
assert(Array.isArray(q14Whole.decisions))
const q14Kinds=q14Whole.decisions
const katalog=JSON.parse(readFileSync(resolve(out,'five-independent-Katalog-practiceAssessment.kind-decisions.exact-inputs.json'),'utf8'))
const reviewed=[...q3Kinds,...q14Kinds,...katalog]
assert.equal(new Set(reviewed.map(d=>d.goalId)).size,20)
const decisions=reviewed.map(d=>{
  const goal=index.get(d.goalId);assert(goal)
  assert.equal(d.semanticKind,'practiceAssessment')
  assert.equal(d.decisionStatus,'authoritative')
  const sourceFingerprint=fingerprintSemanticKindSourceGoal(goal)
  if(d.sourceFingerprint)assert.equal(d.sourceFingerprint,sourceFingerprint)
  return {goalId:d.goalId,sourceFingerprint,semanticKind:d.semanticKind,decisionStatus:d.decisionStatus,decisionBasis:d.decisionBasis}
})
const result={
  nativeNormalizationAndGraphErrors:errors,
  nativeWholeModelCount:model.goals.length,
  actualReviewedNewPracticeAssessmentKinds:20,
  sourceFingerprintContractId:'semantic-kind-source-fingerprint-v1',decisions,
  frame:{path:relative(root,framePath),sha256:createHash('sha256').update(readFileSync(framePath)).digest('hex')},
  nativeHelperSources:['app/scripts/goalBookModel.ts','app/src/utils/authoring/canonicalAuthoring.ts'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')})),
  fullBookRouteOwnerAndSourceCourseScopeExecuted:false,
  humanApproval:false,strictNetGain:0,
}
writeFileSync(resolve(out,'actual-native-CAN445-graph-and-reviewed20-practiceAssessment-kinds.result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(result))
