import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { normalizeLandscape, type LandscapeEntry } from '../hooks/useLandscapes'
import type { SkillLandscape } from '../landscapeTypes'
import { collectCompositionProjectionRoleGoalIds, type CompositionView } from './authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from './compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from './learnerTreeProjection'
import { buildDirectChildrenMap } from './treeProjectionRuntime'
import { goalMatchesFilters } from './goalFilters'
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


// A resolved composition is the authoritative membership. Canonical phase
// metadata can differ from the reviewed Hessen acquisition placement.
{
  const canonicalMath = JSON.parse(readFileSync(new URL(
    '../../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    import.meta.url,
  ), 'utf8')) as SkillLandscape
  const canonicalEntry = normalizeLandscape(canonicalMath)!
  // The real learner closure already applies explicit scope availability. In
  // particular, RP/BY-only own tasks cannot enter this HE fixture through a
  // broad canonical subtree. Reuse the existing filter for that input step.
  const canonicalMathEntry = {
    ...canonicalEntry,
    goals: canonicalEntry.goals.filter(goal => goalMatchesFilters(goal, ['DE-HE', 'GK+LK', 'G9'])),
  }
  const sourceView = JSON.parse(readFileSync(new URL(
    '../../../curricula/DE/Gymnasium/composition-views/mathematik/de-he-sekii-gk-lk.view.json',
    import.meta.url,
  ), 'utf8')) as CompositionView
  // The shared Sek-II source serves both duration models. The actual runtime
  // match adds the learner's committed G9 request to this scope envelope.
  const view = { ...sourceView, scope: { ...sourceView.scope, durationModel: 'G9' } }
  assert.deepEqual(view.scope, {
    schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekII',
    courseProfile: 'GK+LK', durationModel: 'G9',
  })
  const canonicalById = new Map(canonicalMathEntry.goals.map(goal => [goal.id, goal]))
  const expectedTargets = new Set([...collectCompositionProjectionRoleGoalIds(
    view.rootNodes, canonicalById,
  ).targetGoalIds].filter(id => canonicalById.get(id)?.contains.length === 0))
  assert(expectedTargets.size > 0, 'The actual reviewed Hessen G9 Sek-II GK+LK target scope must be nonempty.')

  const [projected] = applyCompositionViewProjection([canonicalMathEntry], view)
  const sourceBefore = JSON.stringify(projected)
  const [normalized] = normalizeLearnerProjectedEntries([projected])
  const goalsById = new Map(normalized.goals.map(goal => [goal.id, goal]))
  const visible = collapseLearnerSubjectRoots(goalsById, buildDirectChildrenMap(goalsById)).childrenByParent
  const root = normalized.goals.find(goal => goal.tags?.includes('root'))!
  const reached = new Set<string>()
  const walk = (id: string) => {
    if (reached.has(id)) return
    reached.add(id)
    for (const child of visible.get(id) ?? []) walk(child)
  }
  walk(root.id)
  const actualTargets = new Set([...reached].filter(id => {
    const goal = goalsById.get(id)
    return goal?.type !== 'cluster' && goal?.contains.length === 0
  }))
  assert.deepEqual([...actualTargets].sort(), [...expectedTargets].sort(),
    'Presentation normalization must preserve every resolved target ID, not only the count.')
  const previouslyLostQ4Members = [
    '49f9059a-876c-5051-8146-d008b5cc691c', 'b66d13c5-187e-530b-b4d3-efc7506a7f34',
    '6a66b4f5-d36e-5b53-91ad-cf25a849d66b', '10efb267-9733-5db3-a807-03f4cf54e336',
    'f1eee698-04c6-5d60-bcc6-a3c67129eea2', '4d55ba50-8d67-560c-a10f-cccff4728c40',
    '565fcd3f-52cd-5402-a0ac-a1069ed9c598', 'c66cb27b-8199-58fb-95f4-6314c0c2d07b',
    '911f3200-1dbc-59a6-90df-c883c77de39c', '3773bd34-3631-5fd2-b9b7-dfa01adf5abd',
    '1b664036-3c29-5d94-9f42-97069aaa2c53', '315093d4-515a-542c-b776-d72a12763d1a',
  ]
  for (const id of previouslyLostQ4Members) {
    assert(actualTargets.has(id), `The authored E-phase must retain reviewed canonical-Q4 member ${id}.`)
  }
  const passed = '8d314e15-69e9-5af1-a10a-be820b2f821d'
  const implicit = new Set(['6481fc23-d923-5ffc-ba49-f499328f43b8', '857c1c46-5d94-5dfb-9697-9a9fd04103c3'])
  const initial = buildTreeCompletionProgressMap(goalsById, visible, () => 0).get(root.id)!
  const after = buildTreeCompletionProgressMap(goalsById, visible, id => id === passed ? 1 : 0, implicit).get(root.id)!
  assert.equal(initial.totalCount, expectedTargets.size)
  assert.equal(initial.openCount, expectedTargets.size)
  assert.equal(after.totalCount, expectedTargets.size)
  assert.equal(after.explicitCount, 1)
  assert.equal(after.implicitCount, 2)
  assert.equal(after.openCount, expectedTargets.size - 3)
  assert.equal(JSON.stringify(projected), sourceBefore, 'Presentation normalization does not mutate the resolved source tree.')
}

// Legacy placement trees still need their existing phase filter and flattening.
{
  const legacy: LandscapeEntry = {
    meta: { landscapeId: 'LEGACY', locale: 'de', title: 'Legacy', description: '', goals: [] },
    goals: [
      goal('LEGACY_ROOT', { title: 'Legacy', contains: ['LEGACY_E'], tags: ['root'] }),
      goal('LEGACY_E', { title: 'E-Phase', contains: ['LEGACY_E_ATOM', 'LEGACY_Q4_ATOM'], phase: 'E', tags: ['synthetic:program-unit'] }),
      goal('LEGACY_E_ATOM', { phase: 'E' }),
      goal('LEGACY_Q4_ATOM', { phase: 'Q4' }),
    ],
  }
  const [normalized] = normalizeLearnerProjectedEntries([legacy])
  assert.deepEqual(normalized.goals.find(goal => goal.id === 'LEGACY_ROOT')?.contains, ['LEGACY_E_ATOM'],
    'An uncomposed legacy E-phase still flattens its program unit and excludes unrelated canonical Q4 content.')
  assert.deepEqual(legacy.goals[0].contains, ['LEGACY_E'], 'Legacy source entries remain unchanged too.')
}

console.log('treeCompletionProgress tests passed')
