import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import Elk from 'elkjs/lib/elk.bundled.js'
import { computeLearningScopeLayout } from '../src/components/learningUnitMap/learningScopeLayoutCore'
import { NODE_HEIGHT, NODE_WIDTH, type LayoutDirection, type LearningScopeLayout } from '../src/components/learningUnitMap/layoutTypes'
import { buildLearnerUnitMapProjection } from '../src/components/learningUnitMap/learnerUnitMapProjection'
import { deriveLearnerUnitMapPreview } from '../src/components/learningUnitMap/learnerUnitMapPreview'
import type { LearningMapFixture, LearningMapRelation } from '../src/components/learningUnitMap/types'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'

// The bundled Node engine uses an in-process fake worker, as in the app's layout core test.
const elk = new Elk()
const board = (ids: string[], relations: LearningMapRelation[]): LearningMapFixture => ({ rootId: 'root', title: 'Board', entries: {
  root: { id: 'root', title: 'Board', description: '', kind: 'cluster', children: ids, requires: [], position: { x: 0, y: 0 } },
  ...Object.fromEntries(ids.map(id => [id, { id, title: id, description: '', kind: 'unit' as const, children: [`${id}-goal`], requires: [], position: { x: 0, y: 0 } }])),
}, scopeRelations: { root: relations } })
const declared = (source: string, target: string): LearningMapRelation => ({ source, target, kind: 'summary', provenance: [], unitOrder: 'declared' })
const derived = (source: string, target: string): LearningMapRelation => ({ source, target, kind: 'summary', provenance: [], unitOrder: 'derived' })
const backward = (source: string, target: string): LearningMapRelation => ({ source, target, kind: 'summary', provenance: [], backward: true })
const before = (layout: LearningScopeLayout, direction: LayoutDirection, first: string, second: string) => direction === 'RIGHT'
  ? layout.positions[first].x + NODE_WIDTH <= layout.positions[second].x
  : layout.positions[first].y + NODE_HEIGHT <= layout.positions[second].y

for (const direction of ['RIGHT', 'DOWN'] as const) {
  // Declared a before b plus a Rückgriff from b's side: the declared order defines the direction.
  const rueckgriff = await computeLearningScopeLayout(elk, board(['a', 'b'], [declared('a', 'b'), backward('b', 'a')]), 'root', direction)
  assert(before(rueckgriff, direction, 'a', 'b'), `${direction}: the declared order, not the Rückgriff, places a before b`)
  const back = rueckgriff.edges.find(edge => edge.id === 'sibling:b->a')!
  assert.equal(back.reversed, true, 'the Rückgriff is laid out along the declared order and drawn back against it')
  assert.deepEqual([back.source, back.target], ['a', 'b'])
  const start = back.points[0]
  const port = rueckgriff.ports.a.find(item => item.id === back.sourceHandle)!
  assert.deepEqual([start.x, start.y], [rueckgriff.positions.a.x + port.x, rueckgriff.positions.a.y + port.y],
    'the Rückgriff route starts at the earlier unit, where its arrowhead points')
  assert.equal(rueckgriff.edges.find(edge => edge.id === 'sibling:a->b')?.reversed, undefined)

  // A declared order outranks derived goal demand that closes a cycle with it.
  const conflict = await computeLearningScopeLayout(elk, board(['a', 'b', 'c', 'd'], [
    declared('a', 'b'), derived('b', 'c'), derived('c', 'a'), derived('b', 'd'), derived('d', 'a'),
  ]), 'root', direction)
  assert(before(conflict, direction, 'a', 'b'), `${direction}: cycle breaking reverses derived demand, never the declared order`)
}

// Real views: on every board of Bavaria's Sekundarstufe I at step 2, each declared order
// points with the flow and each Rückgriff is drawn against it.
const read = async (path: string) => JSON.parse(await readFile(fileURLToPath(new URL(`../../curricula/DE/Gymnasium/${path}`, import.meta.url)), 'utf8'))
const source = prepareLandscapeEntries(await Promise.all(['MATHEMATIK', 'PHYSIK'].map(subject => read(`canonical/DE_DEU_S_GYM_CANONICAL_${subject}.de.json`))))
const views = [await read('composition-views/mathematik/de-by-gk.view.json'), await read('composition-views/physik/de-by-gk.view.json')]
const projected = views.reduce<LandscapeEntry[]>((entries, view) => applyCompositionViewProjection(entries, view), source)
  .map(entry => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
const goalIndexAll = new Map(projected.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags?.includes('root'))
const visibleGoalIds = new Set<string>()
const visit = (id: string) => { if (visibleGoalIds.has(id)) return; visibleGoalIds.add(id); (visibleChildrenByParent.get(id) ?? []).forEach(visit) }
rootGoals.forEach(goal => visit(goal.id))
const tree = { rootGoals, goalIndexAll, canonicalGoalIndexAll: new Map(source.flatMap(entry => entry.goals).map(goal => [goal.id, goal])),
  visibleGoalIds, visibleChildrenByParent }
const preview = deriveLearnerUnitMapPreview(tree, 2)
const map = buildLearnerUnitMapProjection({ ...tree, units: preview.units, after: preview.after })
const stage = map.unitEntryIds.sek1
const relations = map.scopeRelations?.[stage] ?? []
assert(relations.some(relation => relation.backward) && relations.some(relation => relation.unitOrder === 'declared'),
  'the real Sekundarstufe I board has declared orders and Rückgriffe')
const real = await computeLearningScopeLayout(elk, map, stage, 'RIGHT')
for (const relation of relations) {
  if (relation.unitOrder === 'declared') assert(before(real, 'RIGHT', relation.source, relation.target),
    `${map.entries[relation.source].title} -> ${map.entries[relation.target].title}: a declared order points with the flow`)
  if (relation.backward) assert.equal(real.edges.find(edge => edge.id === `sibling:${relation.source}->${relation.target}`)?.reversed, true)
}

console.log(`Learner unit map layout passed: declared order directs, Rückgriffe are drawn back (RIGHT and DOWN), declared order outranks derived demand, real BY Sek I board (${relations.length} relations).`)
