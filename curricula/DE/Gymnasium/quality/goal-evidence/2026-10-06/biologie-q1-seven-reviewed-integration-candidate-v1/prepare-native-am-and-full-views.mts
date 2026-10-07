import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel'
import { fingerprintGoalForEvidence } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

const repo = resolve('.')
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-reviewed-integration-candidate-v1'
const prepared = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
const reviewed = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-native-v7-independent-b-v1'
const read = (path: string): any => JSON.parse(readFileSync(resolve(repo, path), 'utf8'))
const write = (path: string, value: unknown) => { mkdirSync(dirname(resolve(repo, path)), { recursive: true }); writeFileSync(resolve(repo, path), JSON.stringify(value, null, 2) + '\n') }
const binding = (path: string) => { const data = readFileSync(resolve(repo, path)); return { path, sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length } }
const same = (a: unknown, b: unknown) => stableGoalBookJson(a) === stableGoalBookJson(b)
const amInput = read(prepared + '/inputs/atomicity-memory-native-review-inputs.pending.json')
const raw = read(amInput.canonical.path)
const semantic = read(amInput.semanticKindLedger.path)
const active = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
const oldIds = new Set<string>(active.goals.map((g: any) => g.id))
const ids: string[] = amInput.rows.map((r: any) => r.goalId)
const science = read(reviewed + '/seven-science-operator-atomicity-prerequisite.review.json')
const memory = read(reviewed + '/seven-individual-memory-decisions.review.json')
const metadataDeltas: any[] = []
for (const goal of raw.goals) {
  if (oldIds.has(goal.id)) continue
  const before = structuredClone(goal)
  if (!goal.extendedData?.authorCandidate) throw new Error('Missing frozen author provenance ' + goal.id)
  metadataDeltas.push({ goalId: goal.id, removedCandidateMetadata: goal.extendedData.authorCandidate })
  delete goal.extendedData.authorCandidate
  if (!same(buildGoalDescriptionCanonicalContext(before), buildGoalDescriptionCanonicalContext(goal))) throw new Error('D context changed ' + goal.id)
  if (fingerprintGoalForEvidence(before, 'positive-understanding-evidence-v2', 'curricularAtomic') !== fingerprintGoalForEvidence(goal, 'positive-understanding-evidence-v2', 'curricularAtomic')) throw new Error('Goal evidence semantics changed ' + goal.id)
  semantic.decisions.find((r: any) => r.goalId === goal.id).sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
}
const canonicalPath = own + '/canonical-390.integration-candidate.json'
semantic.sourceLandscapePath = canonicalPath
write(canonicalPath, raw)
write(own + '/semantic-kinds-390.integration-candidate.json', semantic)
const normalized = normalizeCanonicalLandscape(raw)
const graph = new Map(normalized.goals.map(g => [g.id, g]))
const guiRows: any[] = []
for (const sourcePath of [
  'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-seki-biology.view.json',
  'curricula/DE/Gymnasium/composition-views/biologie/de-de-gym-biology-gk.view.json',
]) {
  const current = read(sourcePath)
  const next = structuredClone(current)
  const included = current.scope.stage === 'SekI' ? ids.filter(id => id !== 'bfb5dfb6-8e35-5452-b581-96e061d8b826') : ids
  const destination = current.scope.stage === 'SekI' ? next.rootNodes[0].children.find((n: any) => n.id === 'biology-seki') : next.rootNodes[0]
  destination.children.push({ kind: 'structure', id: 'biology-genetic-information-models', label: 'Genetische Information und Variabilität an Modellen', children: included.map(goalId => ({ kind: 'goalEntry', goalId })) })
  const before = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(current).rootNodes, graph)
  const after = collectCompositionProjectionRoleGoalIds(normalizeCompositionView(next).rootNodes, graph)
  const lost = [...before.targetGoalIds].filter(id => !after.targetGoalIds.has(id))
  const added = [...after.targetGoalIds].filter(id => !before.targetGoalIds.has(id))
  const compiled = compileCompositionView(normalizeCompositionView(next), normalized)
  const errors = compiled.findings.filter(f => f.severity === 'error')
  if (lost.length || errors.length || !same([...added].sort(), [...included].sort())) throw new Error('Invalid full GUI superset ' + sourcePath + ': ' + JSON.stringify({ lost, errors, added }))
  const candidatePath = own + '/views/' + sourcePath.split('/').at(-1)
  write(candidatePath, next)
  guiRows.push({ source: binding(sourcePath), candidate: binding(candidatePath), beforeTargetCount: before.targetGoalIds.size, afterTargetCount: after.targetGoalIds.size, lostTargetIds: lost, addedTargetIds: added, stageBounded: true, STSekIIOnlyGoalExcludedFromSekI: !after.targetGoalIds.has('bfb5dfb6-8e35-5452-b581-96e061d8b826') || current.scope.stage !== 'SekI', nativeFindings: compiled.findings })
}
const now = new Date().toISOString()
for (const [lane, baseline, decisions] of [
  ['atomicity', amInput.existingFullAtomicity, science.goals],
  ['memory', amInput.existingFullMemory, memory.rows],
] as const) {
  const config = read(baseline.config.path)
  const historicalBytes = readFileSync(resolve(repo, baseline.review.path), 'utf8')
  const historicalIds = new Set(historicalBytes.trim().split('\n').map(line => JSON.parse(line).goalId))
  const rows = ids.map(id => {
    if (historicalIds.has(id)) throw new Error('Existing ID would be overwritten ' + id)
    const review: any = decisions.find((r: any) => r.goalId === id)
    if (!review || review.verdict !== 'KEEP') throw new Error('Missing actual independent review ' + id)
    const common = { schemaVersion: 1, reviewId: config.reviewId, ruleVersion: config.ruleVersion, landscapeId: config.landscapeId, goalId: id, fingerprint: '', reviewedAt: now, reviewer: 'biology_q1_v7_source_science_independent_b', reason: lane === 'atomicity' ? review.singleContentRoutineReason : review.individualCurrentSemanticsReason }
    return lane === 'atomicity'
      ? { ...common, status: 'atomic', semanticAtomic: true }
      : { ...common, status: 'no_memory_needed', memoryUseful: false, memoryGoalIds: [], deckIds: [] }
  })
  const reviewPath = own + '/full-' + lane + '.review.jsonl'
  writeFileSync(resolve(repo, reviewPath), historicalBytes + rows.map(r => JSON.stringify(r)).join('\n') + '\n')
  config.landscapePath = canonicalPath
  config.reviewPath = reviewPath
  config.reportPath = own + '/full-' + lane + '.report.md'
  if (lane === 'memory') {
    config.cardReviewPath = own + '/full-memory.cards.review.jsonl'
    writeFileSync(resolve(repo, config.cardReviewPath), readFileSync(resolve(repo, baseline.cards.path)))
    config.visibilityScopes = config.visibilityScopes.map((scope: any) => ({ ...scope, viewPath: own + '/views/' + scope.viewPath.split('/').at(-1) }))
  }
  write(own + '/full-' + lane + '.candidate.config.json', config)
}
write(own + '/author-metadata-native-am-and-gui-supersets.actual.json', {
  schemaVersion: 1, createdAtUTC: now,
  role: 'native materialization of individually justified independent A/M findings and proposed full GUI supersets; no active integration',
  input: binding(amInput.canonical.path), canonicalCandidate: binding(canonicalPath), metadataDeltas,
  metadataDecision: 'Move transient author candidate status to this historical provenance receipt; keep all curriculum semantics, actual D contexts, descriptions and image links unchanged.',
  actualIndependentScienceReview: binding(reviewed + '/seven-science-operator-atomicity-prerequisite.review.json'),
  actualIndependentMemoryReview: binding(reviewed + '/seven-individual-memory-decisions.review.json'),
  rows: guiRows, historicalReviewsPreservedAsExactPrefixesBeforeNativeFingerprintWrite: true,
  individualReviewReasonForEveryNewRecord: true, newMemoryCardsRequired: false,
  nativeChecks: 'pending actual checker execution after fingerprint materialization',
  activeWrites: false, strictGain: 0, humanApproval: false, humanTrial: false,
})
console.log(JSON.stringify({ prepared: true, newAMRecords: ids.length, fullGUISupersets: guiRows.map(r => [r.beforeTargetCount, r.afterTargetCount]), activeWrites: false }))
