import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { UiGoal } from '../src/goalTypes'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { buildLearnerMapProjection } from '../src/components/learningUnitMap/learnerMapProjection'
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { nativeMapIds as id, nativeMapLandscapes, nativeMapView } from './fixtures/nativeLearningMapData'

function nativeTree(raw: SkillLandscape[], views: ReturnType<typeof nativeMapView>[]) {
  const source = prepareLandscapeEntries(raw)
  const canonicalGoalIndexAll = new Map(source.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
  const projected = views.reduce((entries, view) => applyCompositionViewProjection(entries, view), source)
    .map(entry => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
  const goalIndexAll = new Map(projected.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
  const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
  const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags?.includes('root') && goal.landscapeId !== id.root)
  const visibleGoalIds = new Set<string>()
  const visit = (goalId: string) => {
    if (visibleGoalIds.has(goalId)) return
    visibleGoalIds.add(goalId)
    for (const child of visibleChildrenByParent.get(goalId) ?? []) visit(child)
  }
  rootGoals.forEach(goal => visit(goal.id))
  return { rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent }
}

const native = nativeTree(nativeMapLandscapes, [nativeMapView(id.root), nativeMapView(id.math), nativeMapView(id.physics)])
const snapshot = JSON.stringify([...native.goalIndexAll])
const small = buildLearnerMapProjection(native)
assert.deepEqual(Object.keys(small.entries).filter(key => key !== small.rootId).sort(), [...native.visibleGoalIds].sort(), 'map has exactly the native tree members')
assert.deepEqual(small.entries[id.section].children, [id.foundation, id.application, id.memory], 'authored child ordering survives')
assert.equal(small.entries[id.section].kind, 'cluster', 'a navigation section is not an authored learning unit')
assert.equal(small.entries[id.memory].kind, 'memory')
assert.equal(small.entries[id.support], undefined, 'support remains context and never becomes a target')
const direct = small.scopeRelations?.[id.section]?.find(edge => edge.source === id.foundation && edge.target === id.application)
assert.deepEqual(direct, {
  source: id.foundation, target: id.application, kind: 'requirement',
  provenance: [{ requiredGoalId: id.foundation, dependentGoalId: id.application, authoredOnGoalId: id.application,
    inherited: false, sourceGoalIds: [id.foundation], unresolved: false }],
}, 'inverse requires direction represents learning flow from prerequisite to consumer')
const support = small.scopeContext?.[id.section]?.[id.application]?.find(edge => edge.requiredGoalId === id.support)
assert.deepEqual(support, { requiredGoalId: id.support, dependentGoalId: id.application, authoredOnGoalId: id.section,
  inherited: true, sourceGoalIds: [id.support], unresolved: false }, 'canonical cluster requirement provenance survives the native projection')
assert.equal(JSON.stringify([...native.goalIndexAll]), snapshot, 'navigation projection does not mutate native data')

// A composition view can reparent an atomic goal and expose only part of its
// prerequisite cluster. The canonical graph, not that visual parent, owns demand.
const clone = (source: UiGoal, goalId: string, contains: string[] = [], requires: string[] = []): UiGoal => ({
  ...source, id: goalId, title: goalId, contains, requires, effectiveRequires: [...requires], inheritedRequires: [],
  tags: [], type: contains.length ? 'cluster' : 'atomic', nodeKind: 'tutor',
})
const base = native.goalIndexAll.get(id.foundation)!
const a = clone(base, 'a')
const hidden = clone(base, 'hidden')
const prerequisite = clone(base, 'prerequisite', [a.id, hidden.id])
const oldParent = clone(base, 'canonical-parent', ['b'], [prerequisite.id])
const b = clone(base, 'b')
const left = clone(base, 'left', [a.id])
const right = clone(base, 'right', [b.id])
const top = clone(base, 'top', [left.id, right.id])
const source = new Map([a, hidden, prerequisite, oldParent, b, left, right, top].map(goal => [goal.id, goal]))
const shown = new Map([a, b, left, right, top].map(goal => [goal.id, goal]))
const grouped = buildLearnerMapProjection({ rootGoals: [top], goalIndexAll: shown, canonicalGoalIndexAll: source,
  visibleGoalIds: new Set(shown.keys()), visibleChildrenByParent: buildDirectChildrenMap(shown) })
const summary = grouped.scopeRelations?.top?.[0]
assert.deepEqual(summary, { source: 'left', target: 'right', kind: 'summary', provenance: [{
  requiredGoalId: prerequisite.id, dependentGoalId: b.id, authoredOnGoalId: oldParent.id,
  inherited: true, sourceGoalIds: [a.id], unresolved: false,
}] }, 'branch summaries preserve exact atomic demand and never imply a whole-unit gate')
assert.deepEqual(grouped.scopeContext?.top?.right?.[0]?.sourceGoalIds, [hidden.id], 'hidden part of cluster demand remains explainable context')
assert.equal(grouped.entries.prerequisite, undefined)
assert.equal(grouped.entries.hidden, undefined)

// A projected goalEntry can suppress children. It must keep cluster semantics
// without acquiring fictitious leaf mastery or changing the target denominator.
const hiddenChildren = buildLearnerMapProjection({ rootGoals: [prerequisite], goalIndexAll: source,
  visibleGoalIds: new Set([prerequisite.id]), visibleChildrenByParent: new Map() })
assert.equal(hiddenChildren.entries.prerequisite.kind, 'cluster')
assert.deepEqual(hiddenChildren.entries.prerequisite.children, [])

const projectGraph = (goals: UiGoal[], shownGoals: UiGoal[], roots: UiGoal[], children = buildDirectChildrenMap(new Map(shownGoals.map(goal => [goal.id, goal])))) =>
  buildLearnerMapProjection({ rootGoals: roots, goalIndexAll: new Map(shownGoals.map(goal => [goal.id, goal])),
    canonicalGoalIndexAll: new Map(goals.map(goal => [goal.id, goal])), visibleGoalIds: new Set(shownGoals.map(goal => goal.id)),
    visibleChildrenByParent: children })
const contexts = (fixture: ReturnType<typeof buildLearnerMapProjection>) => Object.values(fixture.scopeContext ?? {})
  .flatMap(board => Object.values(board).flat())

const c = clone(base, 'c')
const insideA = clone(base, 'inside-a', [], [c.id])
const insideG = clone(base, 'inside-group', [insideA.id, c.id])
const internal = projectGraph([insideG, insideA, c], [insideG, insideA, c], [insideG])
assert.equal(Object.values(internal.scopeContext?.[internal.rootId] ?? {}).flat().length, 0,
  'requirements fully inside one visible branch must not be labelled outside context on its parent board')

const hiddenB = clone(base, 'hidden-b', [], [c.id])
const visibleA = clone(base, 'visible-a', [], [hiddenB.id])
const chainRoot = clone(base, 'chain-root', [visibleA.id, c.id])
const hiddenChain = projectGraph([chainRoot, visibleA, hiddenB, c], [chainRoot, visibleA, c], [chainRoot])
assert(hiddenChain.getRequirementContext?.(hiddenB.id).some(context => context.requiredGoalId === c.id && context.dependentGoalId === hiddenB.id && context.authoredOnGoalId === hiddenB.id),
  'hidden intermediate demand retains its original C→B provenance instead of disappearing')
assert(!Object.values(hiddenChain.scopeRelations ?? {}).flat().some(edge => edge.provenance.some(p => p.requiredGoalId === c.id && p.dependentGoalId === visibleA.id)),
  'transitive explanatory context must not invent an authored C→A prerequisite')

const opaqueG = clone(base, 'opaque-group', [insideA.id])
const opaqueRoot = clone(base, 'opaque-root', [opaqueG.id, c.id])
const opaque = projectGraph([opaqueRoot, opaqueG, insideA, c], [opaqueRoot, opaqueG, c], [opaqueRoot],
  new Map([[opaqueRoot.id, [opaqueG.id, c.id]], [opaqueG.id, []], [c.id, []]]))
assert(Object.values(opaque.scopeRelations ?? {}).flat().some(edge => edge.source === c.id && edge.target === opaqueG.id
  && edge.kind === 'summary' && edge.provenance.some(p => p.dependentGoalId === insideA.id && p.requiredGoalId === c.id)),
  'opaque displayed clusters retain the original boundary demand of their hidden atomic descendants')

const incomplete = clone(base, 'incomplete-cluster', [c.id, 'missing-source-child'])
const consumer = clone(base, 'incomplete-consumer', [], [incomplete.id])
const incompleteRoot = clone(base, 'incomplete-root', [consumer.id, c.id])
const missing = projectGraph([incompleteRoot, consumer, incomplete, c], [incompleteRoot, consumer, c], [incompleteRoot])
assert(contexts(missing).some(context => context.requiredGoalId === incomplete.id && context.unresolved),
  'a known prerequisite cluster with a missing child must expose its incomplete demand')

const sharedA = clone(base, 'shared-a')
const parentOne = clone(base, 'parent-one', [sharedA.id], [c.id])
const parentTwo = clone(base, 'parent-two', [sharedA.id], [c.id])
const sharedRoot = clone(base, 'shared-root', [sharedA.id, c.id])
const shared = projectGraph([sharedRoot, sharedA, parentOne, parentTwo, c], [sharedRoot, sharedA, c], [sharedRoot])
const sharedEdges = shared.scopeRelations?.[sharedRoot.id]?.filter(edge => edge.source === c.id && edge.target === sharedA.id)
assert.equal(sharedEdges?.length, 1, 'multiple canonical parents must not duplicate a visible arrow')
assert.deepEqual(sharedEdges?.[0].provenance.map(p => p.authoredOnGoalId).sort(), [parentOne.id, parentTwo.id].sort(),
  'the shared arrow retains both independent authored requirement origins')

const unknownConsumer = clone(base, 'unknown-consumer', [], ['physics:Z', 'chemistry:Z'])
const unknownRoot = clone(base, 'unknown-root', [unknownConsumer.id])
const unknown = projectGraph([unknownRoot, unknownConsumer], [unknownRoot, unknownConsumer], [unknownRoot])
assert.deepEqual(unknown.getRequirementContext?.(unknownConsumer.id).map(p => p.requiredGoalId).sort(), ['chemistry:Z', 'physics:Z'],
  'unresolved qualified prerequisites with the same suffix must not collide')
assert(unknown.getRequirementContext?.(unknownConsumer.id).every(p => p.unresolved))

const emptyCluster = { ...clone(base, 'explicit-empty-cluster', [], [c.id]), type: 'cluster' as const }
const emptyRoot = clone(base, 'empty-root', [emptyCluster.id, c.id])
const empty = projectGraph([emptyRoot, emptyCluster, c], [emptyRoot, emptyCluster, c], [emptyRoot])
assert.equal(empty.entries[emptyCluster.id].kind, 'cluster', 'explicit empty clusters never become ordinary competence atoms')
assert(empty.scopeRelations?.[emptyRoot.id]?.some(edge => edge.source === c.id && edge.target === emptyCluster.id
  && edge.kind === 'summary' && edge.provenance.some(p => p.dependentGoalId === emptyCluster.id)),
  'an explicit empty cluster keeps its own authored preparation as a boundary summary')

const opaqueInternal = clone(base, 'opaque-internal-group', [insideA.id, c.id])
const opaqueInternalRoot = clone(base, 'opaque-internal-root', [opaqueInternal.id])
const opaqueInside = projectGraph([opaqueInternalRoot, opaqueInternal, insideA, c], [opaqueInternalRoot, opaqueInternal], [opaqueInternalRoot],
  new Map([[opaqueInternalRoot.id, [opaqueInternal.id]], [opaqueInternal.id, []]]))
assert.equal(contexts(opaqueInside).length, 0, 'a hidden prerequisite inside the same opaque branch is not outside boundary demand')
assert(opaqueInside.getRequirementContext?.(opaqueInternal.id).some(p => p.requiredGoalId === c.id && p.dependentGoalId === insideA.id),
  'the internal opaque requirement remains available through exact on-demand provenance')

// Run the current native normalization/composition/tree path on a real authored
// offering. This intentionally is not the prototype's two-goal snapshot.
const canonical = JSON.parse(await readFile(fileURLToPath(new URL('../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', import.meta.url)), 'utf8')) as SkillLandscape
const view = normalizeCompositionView(JSON.parse(await readFile(fileURLToPath(new URL('../../curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-lk.view.json', import.meta.url)), 'utf8')))
const real = nativeTree([canonical], [view])
const map = buildLearnerMapProjection(real)
const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, real.canonicalGoalIndexAll)
assert(real.visibleGoalIds.size > 150, 'real Hessian upper-secondary LK view must contain a substantial native target set')
assert.deepEqual(Object.keys(map.entries).filter(key => key !== map.rootId).sort(), [...real.visibleGoalIds].sort(), 'current real mathematics offering has exact tree/map membership parity')
for (const goalId of real.visibleGoalIds) assert.deepEqual(map.entries[goalId].children,
  (real.visibleChildrenByParent.get(goalId) ?? []).filter(child => real.visibleGoalIds.has(child)), `native authored children differ for ${goalId}`)
for (const goalId of roles.prerequisiteOnlyGoalIds) {
  if (!roles.targetGoalIds.has(goalId)) assert.equal(map.entries[goalId], undefined, `${goalId}: prerequisiteOnly must not become a map target`)
}
for (const goalId of ['3016ec37-1c2e-47db-83f5-e767923bc97e', 'e98672c6-871a-5d0b-889c-5afc51040f0d']) {
  assert(real.visibleGoalIds.has(goalId), `${goalId}: current native LK offering lost the real scalar-product/application section`)
}
assert.equal(map.entries['e98672c6-871a-5d0b-889c-5afc51040f0d'].kind, 'assessment')
assert(Object.values(map.scopeRelations ?? {}).some(edges => edges.some(edge => edge.kind === 'summary')), 'real math offering must preserve branch relation summaries')
console.log(`Native map projection passed: exact membership/ordering, directed provenance, support-only context, real HE Sek II LK (${real.visibleGoalIds.size} entries).`)
