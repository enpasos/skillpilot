import assert from 'node:assert/strict'
import type { UiGoal } from '../goalTypes'
import { buildTreeCompletionProgressMap } from './treeCompletionProgress'

const goal = (id: string, changes: Partial<UiGoal> = {}): UiGoal => ({
  id, title: id, description: '', phase: 'GLOBAL', themenfeld: '', area: '',
  level: 1, core: true, weight: 1, leitideen: [], kompetenzen: [], sourceRef: '',
  requires: [], contains: [], examples: [], ...changes,
})
const graph = (...goals: UiGoal[]) => new Map(goals.map(entry => [entry.id, entry]))
const children = (...entries: [string, string[]][]) => new Map(entries)

{
  const goals = graph(goal('root', { contains: ['exam', 'a', 'b'] }), goal('exam'), goal('a'), goal('b'))
  const visible = children(['root', ['exam', 'a', 'b']])
  const progress = buildTreeCompletionProgressMap(goals, visible, id => id === 'exam' ? 1 : 0, new Set(['a', 'b']))
  assert.deepEqual(progress.get('root'), {
    totalCount: 3, explicitCount: 1, implicitCount: 2, openCount: 0,
    totalWeight: 3, explicitWeight: 1, implicitWeight: 2, openWeight: 0,
    explicitRatio: 1 / 3, implicitRatio: 2 / 3,
  }, 'one passed goal and two implicit goals fill separate segments without extra mastery')
}

{
  const goals = graph(
    goal('root', { contains: ['left', 'right'], weight: 999 }),
    goal('left', { contains: ['a', 'shared'], weight: 888 }),
    goal('right', { contains: ['shared', 'nested'], weight: 777 }),
    goal('nested', { contains: ['open'], weight: 666 }),
    goal('a', { weight: 2 }), goal('shared', { weight: 3 }), goal('open', { weight: 5 }),
  )
  const visible = children(
    ['root', ['left', 'right']], ['left', ['a', 'shared', 'shared']],
    ['right', ['shared', 'nested']], ['nested', ['open']],
  )
  const reads = new Map<string, number>()
  const before = JSON.stringify([...goals])
  const progress = buildTreeCompletionProgressMap(goals, visible, id => {
    reads.set(id, (reads.get(id) ?? 0) + 1)
    return id === 'a' ? 1 : 0
  }, new Set(['shared']))
  assert.deepEqual(progress.get('root'), {
    totalCount: 3, explicitCount: 1, implicitCount: 1, openCount: 1,
    totalWeight: 10, explicitWeight: 2, implicitWeight: 3, openWeight: 5,
    explicitRatio: 0.2, implicitRatio: 0.3,
  }, 'diamond paths and duplicate child entries count each atom once, using atom weights only')
  assert.equal(progress.get('left')?.totalWeight, 5)
  assert.equal(progress.get('right')?.totalWeight, 8)
  assert.equal(progress.get('nested')?.openCount, 1)
  assert.deepEqual([...reads].sort(), [['a', 1], ['open', 1], ['shared', 1]],
    'shared atoms are read once per build; cluster mastery is never used')
  assert.equal(JSON.stringify([...goals]), before, 'aggregation does not modify graph or mastery')
}

{
  const goals = graph(
    goal('root', { contains: ['mastered', 'threshold', 'below'] }),
    goal('mastered'), goal('threshold'), goal('below'),
  )
  const mastery = new Map([['mastered', 1], ['threshold', 0.9], ['below', 0.899]])
  const progress = buildTreeCompletionProgressMap(goals, children(['root', ['mastered', 'threshold', 'below']]),
    id => mastery.get(id) ?? 0, new Set(['mastered', 'threshold', 'below']))
  assert.equal(progress.get('root')?.explicitCount, 2, 'mastery follows the existing leaf check threshold')
  assert.equal(progress.get('root')?.implicitCount, 1, 'explicit mastery wins over overlapping implicit membership')
  assert.equal(progress.get('threshold')?.explicitRatio, 1, 'a mastered atom counts binarily, not as 90% progress')
}

{
  const goals = graph(
    goal('root', { contains: ['visible', 'filtered', 'empty'] }),
    goal('visible'), goal('filtered', { contains: ['hidden'], weight: 10 }),
    goal('empty', { type: 'cluster' }), goal('hidden'),
  )
  const visible = children(['root', ['visible', 'filtered', 'empty']], ['filtered', []])
  const progress = buildTreeCompletionProgressMap(goals, visible, () => 1, new Set(['hidden', 'filtered']))
  assert.equal(progress.get('root')?.totalCount, 1, 'only visible descendants contribute to the parent')
  for (const id of ['filtered', 'empty']) {
    assert.equal(progress.get(id)?.totalCount, 0, 'filtered and explicitly empty clusters never become atoms')
    assert.equal(progress.get(id)?.totalWeight, 0)
    assert.equal(progress.get(id)?.explicitRatio, 0)
    assert.equal(progress.get(id)?.implicitRatio, 0)
  }
}

{
  const goals = graph(goal('root', { contains: ['a', 'b'] }), goal('a'), goal('b', { requires: ['a'] }))
  const visible = children(['root', ['a', 'b']])
  const mastery = new Map([['a', 0], ['b', 0]])
  const read = (id: string) => mastery.get(id) ?? 0
  const first = buildTreeCompletionProgressMap(goals, visible, read, new Map([['a', {}]]))
  const changedScope = buildTreeCompletionProgressMap(goals, visible, read, new Set(['b']))
  const noImplicit = buildTreeCompletionProgressMap(goals, visible, read)
  assert.equal(first.get('a')?.implicitCount, 1)
  assert.equal(changedScope.get('a')?.openCount, 1, 'changing context removes previous implicit annotations')
  assert.equal(changedScope.get('b')?.implicitCount, 1)
  assert.equal(noImplicit.get('root')?.openCount, 2, 'missing or stale waiver maps leave goals open')
  mastery.set('b', 1)
  const afterPass = buildTreeCompletionProgressMap(goals, visible, read, new Set())
  assert.equal(afterPass.get('root')?.explicitCount, 1, 'a new build observes changed mastery without global caches')
  assert.equal(afterPass.get('a')?.openCount, 1, 'requires edges never create implicit membership in the UI')
  assert.equal(first.get('root')?.explicitCount, 0, 'later builds do not mutate prior snapshots')
}

{
  const invalidWeights = [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, undefined]
  const atoms = invalidWeights.map((weight, index) => goal(`a${index}`, { weight }))
  const goals = graph(goal('root', { contains: atoms.map(atom => atom.id) }), ...atoms)
  const progress = buildTreeCompletionProgressMap(goals, children(['root', atoms.map(atom => atom.id)]), () => 0)
  assert.equal(progress.get('root')?.totalWeight, invalidWeights.length,
    'missing, nonpositive and nonfinite atom weights fall back to one rather than hiding goals')
  assert.equal(progress.get('root')?.openCount, invalidWeights.length)
  assert.equal(progress.get('root')?.openWeight, invalidWeights.length)
}

assert.equal(buildTreeCompletionProgressMap(new Map(), new Map(), () => 0).size, 0)
console.log('treeCompletionProgress tests passed')
