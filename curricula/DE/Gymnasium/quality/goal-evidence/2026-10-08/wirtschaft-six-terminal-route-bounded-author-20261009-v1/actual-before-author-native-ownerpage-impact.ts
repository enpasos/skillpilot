import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { buildGoalBookModel, fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const root = '/home/enpasos/projects/skillpilot'
const base = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-six-terminal-route-bounded-author-20261009-v1')
const read = (path: string): any => JSON.parse(readFileSync(resolve(base, path), 'utf8'))
const write = (path: string, value: any) => writeFileSync(resolve(base, path), JSON.stringify(value, null, 2) + '\n')
const sha = (value: string | Buffer) => createHash('sha256').update(value).digest('hex')
const before = read('inputs/01-DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const ledger = read('inputs/02-wirtschaftswissenschaften.semantic-kinds.json')
const qa = read('inputs/03-wirtschaftswissenschaften.qa.json')
const config = read('inputs/04-de-gym-economics-current-canonical.json')
const view = read('inputs/05-de-gym-economics-current-canonical.view.json')
const plan = read('actual-pre-author-four-terminal-outline-and-impact-scope.plan.json')
const originals = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const generic = read('inputs/10-whole-goals.candidate.json').filter((g: any) => plan.existingFullGoalEdits.includes(g.id))
const after = structuredClone(before)
for (const g of generic) after.goals[after.goals.findIndex((x: any) => x.id === g.id)] = g
const nav = after.goals.find((g: any) => g.id === 'f8922e23-f00e-53f7-be2f-1016e2b0ddf2')
nav.title = 'BY: Übungen zu abgegrenzten Wirtschafts- und Rechtskompetenzen'
nav.titleEn = 'BY: practice in defined economic and legal competencies'
nav.description = 'Bündelt sieben eigenständige materialgestützte Übungsabschlüsse zu Haushalts-, Markt- und Verhaltenskompetenzen, grundlegenden Rechtsfällen sowie ausdrücklich ausgewählten Fertigungs- und Beschäftigungskompetenzen. Der Navigationscluster erhebt keinen zusätzlichen fachlichen Kompetenzanspruch.'
nav.descriptionEn = 'Groups seven independent material-based practice assessments in household, market and behavioural competencies, basic legal cases and explicitly selected production and employment competencies. This navigation cluster asserts no additional subject competence.'
nav.contains.push(...plan.newTerminalOutlines.map((g: any) => g.id))
after.goals.push(...plan.newTerminalOutlines)
const afterLedger = structuredClone(ledger)
for (const goal of after.goals) {
  let decision = afterLedger.decisions.find((x: any) => x.goalId === goal.id)
  if (!decision) {
    // Transient native category binding for the explicit author outline only.
    // No live ledger, description decision, exam release or M7 approval is written.
    decision = { goalId: goal.id, semanticKind: 'practiceAssessment', decisionStatus: 'authoritative', decisionBasis: 'reviewed-current-pilot-practice-assessment' }
    afterLedger.decisions.push(decision)
  }
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
afterLedger.counts.practiceAssessment += 4
afterLedger.counts.total += 4
const digests = Object.fromEntries(qa.records.filter((q: any) => q.publicAssetPath).map((q: any) => [q.imageUrl, 'sha256:' + sha(readFileSync(resolve(root, q.publicAssetPath)))]))
const args = { compositionView: view, goalVisualizationQa: qa, goalVisualizationAssetDigests: digests, evidenceReviewSources: [], config: { ...config, evidenceReviewPaths: [] } }
const modelBefore = buildGoalBookModel({ ...args, landscape: before, semanticKindLedger: ledger })
const modelAfter = buildGoalBookModel({ ...args, landscape: after, semanticKindLedger: afterLedger })
const strictReportPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-twenty-current311-resumed-native-preparation-20261008-v1/root-reviewed-twenty-integration-v1/actual-post-integration-six-required-native-checks-and-full-central/current-central-five-subject-report.actual.json'
const strictReportBytes = readFileSync(resolve(root, strictReportPath))
const strict = JSON.parse(strictReportBytes.toString()).subjects.find((s: any) => s.subject === 'wirtschaftswissenschaften')
const strictIds = new Set<string>(strict.strictCompleteGoalIds)
const afterPages = new Map(modelAfter.pages.map(p => [p.goalId, p]))
const changed = modelBefore.pages.flatMap(p => {
  const next = afterPages.get(p.goalId)!
  const fields = Object.keys(p).filter(k => stableGoalBookJson((p as any)[k]) !== stableGoalBookJson((next as any)[k]))
  return fields.length ? [{ goalId: p.goalId, title: p.title, wasStrict281: strictIds.has(p.goalId), changedFields: fields, beforeWholeOwnerPageSha256: sha(stableGoalBookJson(p)), afterOutlineWholeOwnerPageSha256: sha(stableGoalBookJson(next)), before: p, afterOutline: next }] : []
})
write('actual-native-current311-ownerpage-impact-before-author-outline.json', {
  schemaVersion: 1, kind: 'pre-author-counterfactual-native-ownerpage-impact-not-description-approval',
  canonicalSnapshotSha256: sha(readFileSync(resolve(base, 'inputs/01-DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'))),
  note: 'Both native models omit positive evidence uniformly only to isolate structural/context differences. This is no P review, no final D input and no restored binding. The four assessment outlines are transient classification proposals, not released exams. Actual final exam bodies require a successor impact check.',
  strictBaseline: { path: strictReportPath, sha256: sha(strictReportBytes), strictComplete: strict.strictComplete, denominator: strict.denominator },
  beforeOwnerPages: modelBefore.pages.length, afterOwnerPages: modelAfter.pages.length,
  modifiedExistingWholeGoals: after.goals.filter((g: any) => originals.has(g.id) && stableGoalBookJson(g) !== stableGoalBookJson(originals.get(g.id))).map((g: any) => ({ goalId: g.id, before: originals.get(g.id), outline: g })),
  newAssessmentOutlines: plan.newTerminalOutlines,
  affectedCurricularAtomicOwnerPages: changed,
  affectedStrict281GoalIds: changed.filter(x => x.wasStrict281).map(x => x.goalId),
  unchangedWholeOwnerPages: modelBefore.pages.length - changed.length,
})
console.log(JSON.stringify({ before: modelBefore.pages.length, after: modelAfter.pages.length, changed: changed.map(({goalId, title, wasStrict281, changedFields}) => ({goalId, title, wasStrict281, changedFields})) }, null, 2))
