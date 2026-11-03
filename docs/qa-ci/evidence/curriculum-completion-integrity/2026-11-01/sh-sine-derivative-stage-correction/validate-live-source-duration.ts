import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../app/src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../app/src/utils/authoring/canonicalAuthoring'

const root = process.cwd()
const capsule = resolve(root, 'docs/qa-ci/evidence/curriculum-completion-integrity/2026-11-01/sh-sine-derivative-stage-correction')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const raw = read(resolve(root, canonicalPath))
const beforeCanonical = read(resolve(capsule, 'before', canonicalPath))
const plan = read(resolve(capsule, 'reviewed-candidate/candidate-operations.json'))
const expectedCanonical = structuredClone(beforeCanonical)
expectedCanonical.goalPlacements.push(plan.canonicalPlacementOperation.appendAfterIndependentReview)
assert.deepEqual(raw, expectedCanonical, 'Only the one approved contextual placement may change canonical data.')
const landscape = normalizeCanonicalLandscape(raw)
const goals = new Map(landscape.goals.map((goal) => [goal.id, goal]))
const f9 = plan.ordinaryGoalId
const exam = plan.unchangedOwnAssessmentId
const sourceViews = new Set(plan.baseAndStandaloneUpperViewOperations.map((op: { path: string }) => op.path.split('/').at(-1)))
const generatedNames = new Set(read(resolve(root, 'app/scripts/config/math-duration-split-spanning-tree-policy.json')).sek1Templates.map((t: { fileName: string }) => t.fileName))
for (const t of read(resolve(root, 'app/scripts/config/math-duration-split-spanning-tree-policy.json')).crossStageTemplates) generatedNames.add(t.outputFileName)
const expectedChanged = new Set([...sourceViews, ...[...generatedNames].filter((name) => String(name).startsWith('de-sh-'))])
const signature = (f: { code: string; goalId?: string; message: string }) => JSON.stringify({ code: f.code, goalId: f.goalId, message: f.message })
const findStructure = (nodes: any[], id: string): any => {
  for (const node of nodes) {
    if (node.kind !== 'structure') continue
    if (node.id === id) return node
    const found = findStructure(node.children, id)
    if (found) return found
  }
}
const checks = []
for (const name of readdirSync(resolve(capsule, 'before/math-views')).sort()) {
  const beforePath = resolve(capsule, 'before/math-views', name)
  const afterPath = resolve(root, 'curricula/DE/Gymnasium/composition-views/mathematik', name)
  const before = normalizeCompositionView(read(beforePath))
  const after = normalizeCompositionView(read(afterPath))
  const beforeRoles = collectCompositionProjectionRoleGoalIds(before.rootNodes, goals)
  const afterRoles = collectCompositionProjectionRoleGoalIds(after.rootNodes, goals)
  const added = [...afterRoles.targetGoalIds].filter((id) => !beforeRoles.targetGoalIds.has(id)).sort()
  const removed = [...beforeRoles.targetGoalIds].filter((id) => !afterRoles.targetGoalIds.has(id)).sort()
  const expectedAdded = ['de-sh-sekii-gk.view.json', 'de-sh-sekii-lk.view.json'].includes(name) ? [f9] : []
  const expectedRemoved = name.startsWith('de-sh-seki-') ? [f9, ...(name.includes('-g9.') ? [exam] : [])].sort() : []
  assert.deepEqual(added, expectedAdded, `${name}: unexpected added target`)
  assert.deepEqual(removed, expectedRemoved, `${name}: unexpected removed target`)
  if (!expectedChanged.has(name)) assert.equal(sha(afterPath), sha(beforePath), `${name}: unrelated view changed`)
  const oldErrors = new Set(compileCompositionView(before, landscape).findings.filter((f) => f.severity === 'error').map(signature))
  const newErrors = compileCompositionView(after, landscape).findings.filter((f) => f.severity === 'error' && !oldErrors.has(signature(f)))
  assert.deepEqual(newErrors, [], `${name}: new compiler error`)
  if (name.startsWith('de-sh-')) {
    const suffix = name.includes('-g8.') ? 'g8' : name.includes('-g9.') ? 'g9' : ''
    const sekI = findStructure(after.rootNodes, suffix ? `sh-sek1-${suffix}` : 'sek1')
    if (sekI) assert(!collectCompositionProjectionRoleGoalIds([sekI], goals).targetGoalIds.has(f9), `${name}: f9 remains in SekI`)
    if (name.startsWith('de-sh-gk') || name.startsWith('de-sh-lk') || name.startsWith('de-sh-sekii-')) {
      const sekII = findStructure(after.rootNodes, 'analysis-derivative-applications-sekii')
      assert(sekII && collectCompositionProjectionRoleGoalIds([sekII], goals).targetGoalIds.has(f9), `${name}: f9 missing from SekII`)
    }
  }
  checks.push({ fileName: name, byteChanged: sha(afterPath) !== sha(beforePath), addedTargetGoalIds: added, removedTargetGoalIds: removed, noNewCompilerErrors: true, afterSha256: sha(afterPath) })
}
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_math_upper_secondary_source_extraction_to_canonical_math.review.json'
const beforeMapping = read(resolve(capsule, 'before', mappingPath))
const mapping = read(resolve(root, mappingPath))
assert.deepEqual(mapping.decisions, beforeMapping.decisions, 'Old review decision objects must remain exact.')
assert.deepEqual(mapping.mappings.slice(0, -4), beforeMapping.mappings)
assert.deepEqual(mapping.mappings.slice(-4), plan.sourceMappingOperations.map((op: any) => op.appendEdgeAfterIndependentReview))
assert.equal(mapping.sourceScopeReviewAddenda.at(-1).reviewedAt, '2026-11-01')
assert.equal(mapping.sourceScopeReviewAddenda.at(-1).operative, true)
const result = { schemaVersion: 1, status: 'PASS-bounded-native-delta', checkedMathViews: checks.length, generatedViews: generatedNames.size, changedViewCount: checks.filter((x) => x.byteChanged).length, all1254CanonicalGoalObjectsUnchanged: true, oneContextualPlacementAppended: true, fourPartialEdgesAdded: true, allHistoricalMappingDecisionsUnchanged: true, unrelatedViewsIncludingCurrentBYRefsByteIdentical: true, checks, fullBackendMatrixStillRequired: true, m7Acceptance: false }
writeFileSync(resolve(capsule, 'live-source-duration-validation.json'), JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ checkedMathViews: checks.length, generatedViews: generatedNames.size, changedViewCount: result.changedViewCount, result: result.status }))
