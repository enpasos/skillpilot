import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal, normalizeGraph } from '../../../../../../../app/scripts/goalBookModel'

const out = dirname(fileURLToPath(import.meta.url))
const root = resolve(out, '../../../../../../..')
const files = [
  resolve(out, 'whole-four-Source25-income-methods-GK-LK-insolvency.independently-reviewed-machine-released.inert.json'),
  resolve(out, 'actual-four-whole-DEEN-material-and-thirteen-performance-KEEP.individual-decisions.json'),
  resolve(root, 'app/scripts/goalBookModel.ts'),
]
const bind = (p: string) => ({ path: relative(root, p), sha256: createHash('sha256').update(readFileSync(p)).digest('hex') })
const guards = files.map(bind)
const goals = JSON.parse(readFileSync(files[0], 'utf8')) as Array<Record<string, any>>
assert.equal(goals.length, 4)
for (const g of goals) {
  assert.equal(g.type, 'atomic')
  assert.equal(g.examData.reviewStatus, 'released')
  assert.deepEqual(g.contains, [])
  assert.deepEqual(g.requires, g.examData.coveredGoalIds)
}
const normalized = normalizeGraph(goals)
assert.deepEqual(normalized.errors, [])
const result = {
  sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
  independentReviewer: '/root', originalWholeMaterialAuthor: '/root/economics_independent_continuation_a',
  actualFrozenReviewedWholeInputs: guards,
  decisions: goals.map(g => ({goalId:g.id, sourceFingerprint:fingerprintSemanticKindSourceGoal(g),
    semanticKind:'practiceAssessment', decisionStatus:'authoritative', decisionBasis:'reviewed-current-pilot-practice-assessment'})),
  nativeNormalizeGraphErrors: normalized.errors,
  scientificReasonDe: 'Vier ganze unabhängig gelesene und fachlich KEEP bewertete examData-Endpunkte prüfen genau ihre tatsächlich bewerteten ordinaryLeistungen. Sie ergänzen keine curricularAtomic- oder Memory-Kompetenz. Native Quelle exakt gegen diese acceptedWholeBodies gebunden; fachliches Urteil steht in den separat ganzen Review-/Gegenantwortartefakten.',
  sourceCourseOwnerDualDescriptionOrHumanApproval:false, liveWrites:false, strictNetGain:0,
}
assert.deepEqual(files.map(bind), guards)
writeFileSync(resolve(out,'four-independent-material-practiceAssessment.actual-native-bindings.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify(result))
