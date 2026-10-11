import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'

const root = process.argv[2]
if (!root) throw Error('Need repository root')
const rel = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-Q1-Q4-fifteen-five-coherent-material-independent-whole-review-v1'
const materialPath = resolve(root, rel, 'whole-five-KEEP-material-bodies.machine-released-inert-independent-candidate.json')
const navPath = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-Q1-Q4-fifteen-five-coherent-material-author-v1/whole-two-Q1-Q4-prerequisite-free-material-navigation.cluster.author-candidates.json')
const decisionPath = resolve(root, rel, 'seven-individual-independent-assessment-and-pure-navigation-kind-decisions.json')
const hash = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const materials = JSON.parse(readFileSync(materialPath, 'utf8'))
const nav = JSON.parse(readFileSync(navPath, 'utf8'))
const content = JSON.parse(readFileSync(decisionPath, 'utf8'))
const goals = [...materials, ...nav]
if (goals.length !== 7 || content.decisions.length !== 7) throw Error('Expected seven actual independent whole decisions')
const decisions = content.decisions.map((row: any) => {
  const goal = goals.find((g: any) => g.id === row.goalId)
  if (!goal || row.semanticKind !== 'practiceAssessment' || row.decisionStatus !== 'authoritative') throw Error('Wrong actual independent source decision')
  if (goal.examData && goal.examData.reviewStatus !== 'released') throw Error('Not accepted actual inert material')
  if (!goal.examData && (goal.type !== 'cluster' || goal.requires.length !== 0)) throw Error('Not prerequisite-free pure navigation')
  return {
    goalId: row.goalId,
    sourceFingerprint: fingerprintSemanticKindSourceGoal(goal),
    semanticKind: row.semanticKind,
    decisionStatus: row.decisionStatus,
    decisionBasis: row.decisionBasis,
    classificationReasonDe: row.classificationReasonDe,
    independentWholeContentDecisionPreserved: true,
    nativeBindingOnlyNoNewScientificApproval: true,
  }
})
const out = resolve(root, rel, 'actual-native-seven-independent-whole-decision-source-fingerprints.result.json')
if (existsSync(out)) throw Error('Do not overwrite native output')
const result = {
  schemaVersion: 1,
  reviewer: '/root/economics_source3_independent_final_performance_need',
  nativeHelper: 'app/scripts/goalBookModel.ts#fingerprintSemanticKindSourceGoal',
  helperWholeSha256: hash(resolve(root, 'app/scripts/goalBookModel.ts')),
  actualIndependentMaterialSource: { path: materialPath.slice(root.length + 1), sha256: hash(materialPath) },
  actualPureNavSource: { path: navPath.slice(root.length + 1), sha256: hash(navPath) },
  actualWholeIndependentKindDecisions: { path: decisionPath.slice(root.length + 1), sha256: hash(decisionPath) },
  decisions,
  currentCanonicalOrSemanticLedgerWrites: 0,
  sourceCourseOrRegistryApproval: false,
  humanApproval: false,
  strictNetGain: 0,
}
writeFileSync(out, JSON.stringify(result, null, 2) + '\n')
JSON.parse(readFileSync(out, 'utf8'))
process.stdout.write(JSON.stringify({ output: out.slice(root.length + 1), sha256: hash(out), actualNativeBindings: decisions.length, strictNetGain: 0 }) + '\n')
