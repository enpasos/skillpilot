// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { prepareLandscapeEntries, type LandscapeEntry } from '../src/hooks/useLandscapes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { applyCompositionViewProjection, applyPersonalCurriculumProjection } from '../src/utils/compositionViewRuntime'
import { buildLearnerNavigationProjection, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildLearnerUnitMapProjection } from '../src/components/learningUnitMap/learnerUnitMapProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import type { CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { compileCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'

const goal = (id: string, requires: string[] = [], contains: string[] = []): LearningGoal => ({
  id, title: id, description: id, requires, contains, tags: [], weight: 1, core: true,
  dimensionTags: { phase: 'GLOBAL', framework: 'fixture', demandLevel: 'AB2', processCompetencies: [], guidingIdeas: [] },
})
const raw: SkillLandscape = { landscapeId: 'subject', title: 'Fach', subject: 'Fach', description: '', locale: 'de-DE', goals: [
  { ...goal('root', [], ['a', 'b', 'outside']), title: 'Fach', tags: ['root'] }, goal('a'), goal('b', ['a']), goal('outside'),
] }
const source = prepareLandscapeEntries([raw])
const personal: LandscapeEntry[] = source.map(entry => ({ ...entry, meta: { ...entry.meta, personalCurriculumProjection: {
  revision: 'atomic-prerequisite-learning-v1', rootLandscapeId: 'subject', scopeRevision: 'fixture',
  seedAtomicGoalIds: ['b'], targetGoalIds: ['a', 'b'], requiredByPaths: { a: ['b', 'a'] },
} } }))
const view: CompositionView = { viewId: 'explicit-preparation', viewFormatVersion: '1.2', landscapeId: 'subject',
  scope: { schoolForm: 'Gymnasium', stage: 'CrossStage' }, rootNodes: [{ kind: 'structure', id: 'subject', label: 'Fach',
    childOrder: { after: [{ unit: 'later', after: 'earlier' }] }, children: [
    { kind: 'structure', id: 'earlier', label: 'Früherer Lernplatz', childOrder: { after: [] }, children: [
      { kind: 'structure', id: 'topic', label: 'Grundlagen', children: [
        { kind: 'goalEntry', goalId: 'a', projectionRole: 'prerequisiteOnly', acquisitionPlacement: true },
        { kind: 'goalEntry', goalId: 'outside', projectionRole: 'prerequisiteOnly', acquisitionPlacement: true },
      ] },
    ] },
    { kind: 'structure', id: 'later', label: 'Anwendung', children: [{ kind: 'goalEntry', goalId: 'b' }] },
  ] }] }
const id = (name: string) => `composition:explicit-preparation:structure:${name}`
const all = (entries: LandscapeEntry[]) => new Map(entries.flatMap(entry => entry.goals.map(goal => [goal.id, goal] as const)))
const reachable = (entries: LandscapeEntry[]) => {
  const index = all(entries), found = new Set<string>()
  const visit = (id: string) => { if (found.has(id)) return; found.add(id); index.get(id)?.contains.forEach(visit) }
  entries.flatMap(entry => entry.goals).filter(goal => goal.tags.includes('root')).forEach(goal => visit(goal.id))
  return found
}
const snapshot = JSON.stringify({ source, personal, view })
assert(!compileCompositionView(view, normalizeCanonicalLandscape(raw)).findings.some(finding => finding.code === 'CPV-011'))
for (const mode of ['target', 'legacy', 'cluster', 'root', 'false'] as const) {
  const candidate = structuredClone(view)
  const root = candidate.rootNodes[0]
  assert(root.kind === 'structure')
  const earlier = root.children[0]
  assert(earlier.kind === 'structure')
  const topic = earlier.children[0]
  assert(topic.kind === 'structure')
  const atom = topic.children[0]
  assert(atom.kind === 'goalEntry')
  if (mode === 'target') atom.projectionRole = 'target'
  if (mode === 'legacy') candidate.viewFormatVersion = '1.0'
  if (mode === 'cluster') atom.goalId = 'root'
  if (mode === 'root') candidate.rootNodes = [atom]
  if (mode === 'false') Object.assign(atom, { acquisitionPlacement: false })
  assert(compileCompositionView(candidate, normalizeCanonicalLandscape(raw)).findings.some(finding => finding.code === 'CPV-011'), mode)
}
const authored = normalizeLearnerProjectedEntries(applyCompositionViewProjection(source, view))
assert.deepEqual(all(authored).get('root')?.extendedData?.compositionChildOrder,
  { after: [{ unit: 'later', after: 'earlier' }] }, 'Anchoring onto a canonical root retains its explicit source order.')
assert(!reachable(authored).has('a'), 'An authored support template never creates an acquisition target.')
assert(!all(authored).has(id('earlier')), 'An empty support-only branch stays invisible before authoritative closure.')
assert.deepEqual(applyPersonalCurriculumProjection(authored, source), authored, 'Public/trainer use without backend metadata is unchanged.')
const result = applyPersonalCurriculumProjection(authored, personal)
assert.deepEqual(all(result).get(id('topic'))?.contains, ['a'])
assert(all(result).get('root')?.contains.includes(id('earlier')))
assert.deepEqual(all(result).get('root')?.contains, [id('earlier'), id('later')],
  'restoring a support branch keeps its source position before the existing later unit')
assert.deepEqual(all(result).get(id('earlier'))?.extendedData?.compositionChildOrder, { after: [] })
assert(!reachable(result).has('outside'), 'A supported but unnecessary atom never becomes visible.')
assert.deepEqual([...reachable(result)].filter(key => ['a', 'b', 'outside'].includes(key)).sort(), ['a', 'b'])
assert(!result.flatMap(entry => entry.goals).some(goal => goal.personalCurriculumProjection?.presentationOnly),
  'An explicit earlier learning place avoids an unrelated fallback preparation branch.')
assert.deepEqual(applyPersonalCurriculumProjection(result, personal), result, 'Repeated projection is idempotent.')
assert.equal(JSON.stringify({ source, personal, view }), snapshot, 'Canonical inputs, seeds and authoritative L remain untouched.')

for (const mode of ['single', 'ordered', 'several', 'target'] as const) {
  const variant = structuredClone(view)
  const root = variant.rootNodes[0]
  assert(root.kind === 'structure')
  const earlier = root.children[0]
  assert(earlier.kind === 'structure')
  const folder = earlier.children[0]
  assert(folder.kind === 'structure')
  if (mode !== 'several') folder.children = [folder.children[0]]
  if (mode === 'ordered') {
    earlier.children.push({ kind: 'structure', id: 'next', label: 'Weiter', children: [{ kind: 'goalEntry', goalId: 'outside' }] })
    earlier.childOrder = { after: [{ unit: 'next', after: folder.id }] }
  }
  if (mode === 'target') folder.children = [{ kind: 'goalEntry', goalId: 'a' }]
  const projected = applyPersonalCurriculumProjection(applyCompositionViewProjection(source, variant), personal)
  const index = all(projected)
  const before = buildDirectChildrenMap(index)
  const nav = buildLearnerNavigationProjection(index, before)
  assert.deepEqual(before.get(id('earlier')), [id('topic')], 'Original placement remains addressable.')
  if (mode === 'single') {
    assert.deepEqual(nav.childrenByParent.get(id('earlier')), ['a'])
    assert(!nav.childrenByParent.has(id('topic')))
    assert.equal(nav.targetByAlias.get(id('topic')), 'a')
    assert.deepEqual(nav.childrenByAlias.get(id('topic')), ['a'])
    assert.deepEqual(index.get('a')?.preparationSource, { id: id('topic'), title: 'Grundlagen' })
    assert.deepEqual(index.get('a')?.personalCurriculumProjection?.requiredByPath, ['b', 'a'])
  } else {
    assert.deepEqual(nav.childrenByParent.get(id('earlier')), [id('topic')], mode)
    assert.equal(index.get('a')?.preparationSource, undefined, mode)
  }
}

for (const kind of ['goalEntry', 'canonicalSubtree'] as const) {
  const candidate = structuredClone(view)
  const parent = candidate.rootNodes[0]
  assert(parent.kind === 'structure')
  parent.childOrder = { after: [] }
  const following = kind === 'goalEntry' ? 'b' : 'bundle'
  parent.children[1] = { kind, goalId: following }
  const withBundle = prepareLandscapeEntries([{ ...raw, goals: [...raw.goals, goal('bundle', [], ['b'])] }])
  const projected = normalizeLearnerProjectedEntries(applyCompositionViewProjection(withBundle, candidate))
  const restored = applyPersonalCurriculumProjection(projected, personal)
  assert.deepEqual(all(restored).get('root')?.contains, [id('earlier'), following],
    `${kind}: a restored structure retains its source position before a canonical reference`)
}

for (const kind of ['goalEntry', 'canonicalSubtree'] as const) {
  const differentlyPhased = (id: string, contains: string[] = []) => ({
    ...goal(id, id === 'b' ? ['a'] : [], contains),
    dimensionTags: { ...goal(id).dimensionTags, phase: 'Q2' },
  })
  const phaseSource = prepareLandscapeEntries([{ ...raw, goals: [
    raw.goals[0], goal('a'), differentlyPhased('b'), goal('outside'), differentlyPhased('bundle', ['b']),
  ] }])
  assert.equal(all(phaseSource).get('b')?.phase, 'Q2')
  const candidate = structuredClone(view)
  const parent = candidate.rootNodes[0]
  assert(parent.kind === 'structure')
  parent.children = [{ kind: 'structure', id: 'q1', label: 'Q1', children: [
    { kind, goalId: kind === 'goalEntry' ? 'b' : 'bundle' },
  ] }]
  parent.childOrder = { after: [] }
  const projected = applyCompositionViewProjection(phaseSource, candidate)
  const normalized = normalizeLearnerProjectedEntries(projected)
  assert(reachable(normalized).has('b'), `${kind}: explicit Q1 placement survives a canonical Q2 phase hint`)
  assert.deepEqual(normalizeLearnerProjectedEntries(normalized), normalized)
  const legacy = structuredClone(candidate)
  legacy.viewFormatVersion = '1.0'
  delete (legacy.rootNodes[0] as { childOrder?: unknown }).childOrder
  assert(!reachable(normalizeLearnerProjectedEntries(applyCompositionViewProjection(phaseSource, legacy))).has('b'),
    `${kind}: unbound legacy phase normalization retains its existing behavior`)
}

const preplaced = structuredClone(authored)
all(preplaced).get(id('later'))!.contains.push('a')
const retained = applyPersonalCurriculumProjection(preplaced, personal)
assert(all(retained).get(id('later'))!.contains.includes('a'), 'A support template never steals an already authored target placement.')
assert(!all(retained).has(id('earlier')))

for (const mode of ['legacy', 'global', 'subtree', 'unmarked'] as const) {
  const candidate = structuredClone(view)
  const root = candidate.rootNodes[0]
  assert(root.kind === 'structure')
  const earlier = root.children[0]
  assert(earlier.kind === 'structure')
  if (mode === 'legacy') candidate.viewFormatVersion = '1.0'
  if (mode === 'global') {
    root.children.splice(0, 1, { kind: 'goalEntry', goalId: 'a', projectionRole: 'prerequisiteOnly' })
    root.childOrder = { after: [] }
  }
  if (mode === 'subtree') earlier.children = [{ kind: 'canonicalSubtree', goalId: 'a', projectionRole: 'prerequisiteOnly' }]
  if (mode === 'unmarked') {
    const topic = earlier.children[0]
    assert(topic.kind === 'structure')
    for (const child of topic.children) delete child.acquisitionPlacement
  }
  const projected = applyPersonalCurriculumProjection(normalizeLearnerProjectedEntries(applyCompositionViewProjection(source, candidate)), personal)
  assert(!all(projected).has(id('topic')), `${mode}: no guessed acquisition placement`)
  assert(projected.flatMap(entry => entry.goals).some(goal => goal.personalCurriculumProjection?.presentationOnly
    && goal.contains.includes('a')), `${mode}: necessary unplaced atoms retain the existing fallback`)
}
const foreignRaw: SkillLandscape = { ...raw, landscapeId: 'foreign', title: 'Anderes Fach', subject: 'Anderes Fach', goals: [
  { ...goal('foreign-root', [], ['c']), title: 'Anderes Fach', tags: ['root'] }, goal('c', ['a']),
] }
const combinedSource = prepareLandscapeEntries([raw, foreignRaw])
const combinedPersonal: LandscapeEntry[] = combinedSource.map(entry => ({ ...entry, meta: { ...entry.meta, personalCurriculumProjection: {
  revision: 'atomic-prerequisite-learning-v1', rootLandscapeId: 'combined', scopeRevision: 'fixture',
  seedAtomicGoalIds: entry.meta.landscapeId === 'subject' ? ['b'] : ['c'],
  targetGoalIds: entry.meta.landscapeId === 'subject' ? ['a', 'b'] : ['c'],
  requiredByPaths: entry.meta.landscapeId === 'subject' ? { a: ['b', 'a'] } : {},
} } }))
const foreignView: CompositionView = { ...view, viewId: 'foreign-preparation', landscapeId: 'foreign', rootNodes: [
  { kind: 'structure', id: 'foreign', label: 'Anderes Fach', children: [
    { kind: 'goalEntry', goalId: 'c' },
    { kind: 'structure', id: 'f1', label: 'Anwendung', children: [
      { kind: 'structure', id: 'f2', label: 'Kontext', children: [
        { kind: 'structure', id: 'f3', label: 'Vertiefung', children: [
          { kind: 'structure', id: 'f4', label: 'Vorbereitung', children: [
            { kind: 'goalEntry', goalId: 'a', projectionRole: 'prerequisiteOnly', acquisitionPlacement: true },
          ] },
        ] },
      ] },
    ] },
  ] },
] }
for (const reverse of [false, true]) for (const hasOwnPlace of [false, true]) {
  const ownView = structuredClone(view)
  if (!hasOwnPlace) {
    const removeMarker = (nodes: typeof ownView.rootNodes) => nodes.forEach(node => {
      delete node.acquisitionPlacement
      if (node.kind === 'structure') removeMarker(node.children)
    })
    removeMarker(ownView.rootNodes)
  }
  const views = reverse ? [foreignView, ownView] : [ownView, foreignView]
  const inputs = reverse ? [...combinedSource].reverse() : combinedSource
  const composed = normalizeLearnerProjectedEntries(views.reduce(applyCompositionViewProjection, inputs))
  const actual = applyPersonalCurriculumProjection(composed, combinedPersonal)
  const expectedParent = hasOwnPlace ? id('topic') : 'composition:foreign-preparation:structure:f4'
  assert.deepEqual(actual.flatMap(entry => entry.goals).filter(g => g.contains.includes('a')).map(g => g.id), [expectedParent],
    'subject ownership outranks foreign wrapper depth; a foreign template remains available without an own acquisition place')
  assert.deepEqual([...reachable(actual)].filter(key => ['a', 'b', 'c', 'outside'].includes(key)).sort(), ['a', 'b', 'c'])
}
console.log('Explicit preparation placements passed: authoritative closure only, full ancestor reconstruction, no scope growth, no target relocation, idempotence, subject ownership and legacy/global/subtree boundaries.')

// An explicitly placed canonical subject area is a source, not a new teaching unit.
const areaSource = prepareLandscapeEntries([{ ...raw, goals: [
  { ...goal('root', [], ['area', 'opaque', 'support', 'material']), title: 'Fach', tags: ['root'] },
  goal('area', [], ['a', 'nested']), goal('nested', [], ['b']), goal('a'), goal('b'),
  goal('opaque', [], ['hidden']), goal('hidden'), goal('support', [], ['unused']), goal('unused'),
  { ...goal('material', [], ['lab']), resourceLinks: [{ type: 'document', title: 'Labor', url: '/labor' }] }, goal('lab'),
] }])
const areaView: CompositionView = { ...view, rootNodes: [{ kind: 'structure', id: 'subject', label: 'Fach',
  childOrder: { after: [{ unit: 'later', after: 'earlier' }] }, children: [
    { kind: 'structure', id: 'earlier', label: 'Unterricht', children: [
      { kind: 'canonicalSubtree', goalId: 'area', displayLabel: 'Lokale Herkunft' },
      { kind: 'canonicalSubtree', goalId: 'material' }, { kind: 'goalEntry', goalId: 'opaque' },
      { kind: 'canonicalSubtree', goalId: 'support', projectionRole: 'prerequisiteOnly' },
    ] },
    { kind: 'structure', id: 'later', label: 'Zweiter Lernort', children: [{ kind: 'canonicalSubtree', goalId: 'area' }] },
  ] }] }
const areaGoals = all(applyCompositionViewProjection(areaSource, areaView))
const nav = buildLearnerNavigationProjection(areaGoals, buildDirectChildrenMap(areaGoals))
assert.deepEqual(nav.childrenByParent.get(id('earlier')), ['a', 'b', 'material', 'opaque'])
assert.deepEqual(nav.childrenByParent.get(id('later')), ['a', 'b'])
assert.deepEqual(nav.childrenByParent.get('root'), [id('earlier'), id('later')])
assert.deepEqual(nav.childrenByAlias.get('area'), ['a', 'nested'])
assert.deepEqual(nav.childrenByAlias.get('nested'), ['b'])
assert(!nav.targetByAlias.has('area'))
assert(!nav.childrenByAlias.has('material'))
assert(!nav.childrenByAlias.has('opaque'))
assert(!nav.childrenByAlias.has('support'))
const labels = (parent: string, atom: string) =>
  nav.navigationGoals.get(parent)?.childNavigationSources?.get(atom)?.map(source => source.title)
assert.deepEqual(labels(id('earlier'), 'b'), ['Lokale Herkunft', 'nested'])
assert.deepEqual(labels(id('later'), 'b'), ['area', 'nested'], 'The unlabeled placement uses its canonical title.')
assert.deepEqual(areaGoals.get('area')?.contains, ['a', 'nested'])
assert.equal(areaGoals.get(id('earlier'))?.childNavigationSources, undefined, 'The shared domain input is immutable.')
const unitMap = buildLearnerUnitMapProjection({ rootGoals: [areaGoals.get('root')!], goalIndexAll: nav.navigationGoals,
  canonicalGoalIndexAll: areaGoals, visibleGoalIds: new Set(areaGoals.keys()), visibleChildrenByParent: nav.childrenByParent,
  units: new Map(['earlier', 'later'].map(unit => [id(unit), { key: unit }])), after: [{ unit: 'later', after: 'earlier' }] })
assert.equal(unitMap.entryPaths?.area, undefined, 'A multi-board source must not pick its first member or board.')
assert.deepEqual(unitMap.entries.a.sourceSections?.map(source => source.title), ['Lokale Herkunft'])
assert(unitMap.findings.some(finding => finding.kind === 'goalInTwoPlaces'))
console.log('Canonical subtree navigation passed: nested sources, localized placements, independent material, opaque and support-only groups, order, and ambiguous source routes.')
