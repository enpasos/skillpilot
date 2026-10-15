// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const root = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-equilibrium-four-source-scope-candidate-author-20261015-v1/'
const inputCanonicalPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1/candidate/canonical560.current422.one-rezeptfrei-term.author.json'
const inputSemanticPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1/candidate/semantic560.one-rezeptfrei-term.source-identity.author.json'
const canonicalPath = root + 'candidate/canonical560.current422.two-model-bound-descriptions.author.json'
const semanticPath = root + 'candidate/semantic560.two-description-source-identities.author.json'
const ids = ['a8ddb351-3501-5b6d-a908-c82a5d2f14d4', 'e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd', '1a51362e-fd84-5964-89b5-b435772c2149', 'f0f2c5f8-06f1-5774-a176-d96505727acf']
const changedIds = [ids[0], ids[3]]
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const ref = (path: string) => ({ path, sha256: 'sha256:' + createHash('sha256').update(readFileSync(path)).digest('hex'), bytes: readFileSync(path).length })
const write = (path: string, body: unknown) => writeFileSync(path, JSON.stringify(body, null, 2) + '\n', { flag: 'wx' })
const before = read(inputSemanticPath)
const after = structuredClone(before)
const canonical = read(canonicalPath)
const oldCanonical = read(inputCanonicalPath)
const goalById = new Map<string, any>(canonical.goals.map((g: any) => [g.id, g]))
const changes = []
for (const goalId of changedIds) {
  const decision = after.decisions.find((d: any) => d.goalId === goalId)
  assert.ok(decision)
  const previous = decision.sourceFingerprint
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goalById.get(goalId))
  assert.notEqual(previous, decision.sourceFingerprint)
  changes.push({ goalId, previous, current: decision.sourceFingerprint })
}
assert.equal(after.decisions.length, 560)
assert.equal(after.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').length, 422)
assert.deepEqual(before.decisions.filter((d: any) => !changedIds.includes(d.goalId)), after.decisions.filter((d: any) => !changedIds.includes(d.goalId)))
for (let i = 0; i < after.decisions.length; i++) {
  const { sourceFingerprint: oldFP, ...oldRest } = before.decisions[i]
  const { sourceFingerprint: newFP, ...newRest } = after.decisions[i]
  assert.deepEqual(oldRest, newRest)
  assert.equal(newFP, fingerprintSemanticKindSourceGoal(goalById.get(after.decisions[i].goalId)))
}
write(semanticPath, after)
write(root + 'checks/CAS.stock-source-identity-two-only.actual.json', {
  role: 'Pure stock semantic source identity binding after author edits; no atomicity or other review approval',
  inputCanonical: ref(inputCanonicalPath), inputSemantic: ref(inputSemanticPath), canonical: ref(canonicalPath), semantic: ref(semanticPath),
  changedSourceIdentities: changes, other558WholeDecisionsExact: true, all560StockIdentitiesChecked: true,
  all560ClassificationAndBasisFieldsExact: true, curricularAtomicCountUnchanged: 422, newReviewVotes: 0,
})

const viewPaths = [
  'curricula/DE/Gymnasium/composition-views/chemie/de-de-gym-sekii-chemistry-lk.view.json',
  'curricula/DE/Gymnasium/composition-views/chemie/de-he-lk.view.json',
  'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/de-gym-chemie-bundesweit-source-de-by-sekii-lk.view.json',
  'app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/de-gym-chemie-bundesweit-source-de-he-sekii-lk.view.json',
]
const normalize = normalizeCanonicalLandscape(canonical)
const normalizedBefore = normalizeCanonicalLandscape(oldCanonical)
const wholePaths: any[] = []
const walkPath = (current: string, wanted: string, seen = new Set<string>()): string[] | null => {
  if (current === wanted) return [current]
  if (seen.has(current)) return null
  seen.add(current)
  for (const child of goalById.get(current)?.contains ?? []) {
    const result = walkPath(child, wanted, new Set(seen))
    if (result) return [current, ...result]
  }
  return null
}
const views = viewPaths.map(path => {
  const raw = read(path)
  const view = normalizeCompositionView(raw)
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goalById)
  const beforeRoles = collectCompositionProjectionRoleGoalIds(view.rootNodes, new Map(oldCanonical.goals.map((g: any) => [g.id, g])))
  assert.deepEqual([...roles.targetGoalIds].sort(), [...beforeRoles.targetGoalIds].sort())
  assert.deepEqual([...roles.prerequisiteOnlyGoalIds].sort(), [...beforeRoles.prerequisiteOnlyGoalIds].sort())
  const compiled = compileCompositionView(view, normalize)
  const oldCompiled = compileCompositionView(view, normalizedBefore)
  assert.deepEqual(compiled, oldCompiled)
  const occurrences = (nodes: any[], goalId: string): number => nodes.reduce((count, n) => count + (n.sourceGoalId === goalId ? 1 : 0) + occurrences(n.children ?? [], goalId), 0)
  const routes: any[] = []
  const walkView = (nodes: any[], labels: string[]) => {
    nodes.forEach(node => {
      if (node.kind === 'structure') walkView(node.children, [...labels, node.id])
      else if (node.kind === 'canonicalSubtree' || node.kind === 'goalEntry') {
        for (const id of ids) {
          const containsPath = node.kind === 'goalEntry' ? (node.goalId === id ? [id] : null) : walkPath(node.goalId, id)
          if (containsPath) routes.push({ goalId: id, authoredNodePath: [...labels, node.kind + ':' + node.goalId], explicitProjectionRole: node.projectionRole ?? 'target', wholeCanonicalContainsPath: containsPath })
        }
      }
    })
  }
  walkView(view.rootNodes, [])
  wholePaths.push(...routes)
  return {
    input: ref(path), viewId: view.viewId, scope: view.scope,
    goals: ids.map(goalId => ({ goalId, target: roles.targetGoalIds.has(goalId), prerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(goalId), compiledOccurrences: occurrences(compiled.compiledRootNodes, goalId) })),
    exactTargetProjectionUnchangedByDescriptionEdits: true,
    compilerFindingsUnchanged: true, findings: compiled.findings, routes,
  }
})
assert.ok(views.slice(0, 2).every(view => view.goals.every(goal => goal.target && goal.compiledOccurrences > 0)))
assert.ok(views.slice(2).every(view => view.goals.every(goal => !goal.target && goal.compiledOccurrences === 0)))
write(root + 'checks/READONLY.existing-LK-compiler-and-provenance.actual.json', {
  role: 'Read-only use of existing composition compiler and explicit current provenance; no source/curriculum or runtime acceptance',
  canonical: ref(canonicalPath), compiler: ref('app/src/utils/authoring/compositionViewAuthoring.ts'), normalizer: ref('app/src/utils/authoring/canonicalAuthoring.ts'),
  views,
  fourActualWholeGoalScopeAndProvenanceFields: ids.map(goalId => {
    const g = goalById.get(goalId)
    return { goalId, tags: g.tags, applicability: g.applicability, dimensionTags: g.dimensionTags, provenance: g.extendedData?.provenance }
  }),
  actualConclusion: 'All four are existing targets of the national authored SkillPilot LK composition and the authored HE-LK composition. Their unchanged applicability lists DE-BY and DE-HE and their unchanged tags contain LK. Neither generated BY nor HE source-atlas LK view contains them. These are distinct facts: existing SkillPilot target membership does not establish named official obligations or current source-atlas inclusion. No separate authored BY-LK view was found or invented.',
  goalAndSemanticClassesUnchanged: true, newSourceOrCourseReviewVotes: 0, optionalRuntimeFeatureClaimed: false,
})
console.log(JSON.stringify({ semantic: ref(semanticPath), checkedSourceIdentities: 560, compositionViewsReadOnly: views.length, newReviewVotes: 0 }))
