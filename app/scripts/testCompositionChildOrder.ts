// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, readCompositionChildOrder, type CompositionChildOrder,
  type CompositionStructureNode, type CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection, applyPersonalCurriculumProjection } from '../src/utils/compositionViewRuntime'
import { collapseLearnerSubjectRoots, normalizeLearnerProjectedEntries } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { createLearnerUnitMapCache, deriveLearnerUnitMapPreview, MATHEMATICS_LANDSCAPE_ID as math,
  type LearnerStagePlanMapContext } from '../src/utils/learnerNavigation/learnerUnitMapPreview'
import { buildLearnerUnitMapProjection } from '../src/utils/learnerNavigation/learnerUnitMapProjection'
import { STAGE_PLAN_SCHEMA } from '../src/utils/stagePlan'

const schemaId = 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json'
const ajv = new Ajv2020({ allErrors: true, strict: false })
const schema = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/composition-view/v1.2/composition-view.schema.json', import.meta.url), 'utf8')))
const legacySchema = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/curriculum-package/v1/composition-view.schema.json', import.meta.url), 'utf8')))
const names = ['a', 'b', 'c', 'd']
const goal = (id: string, requires: string[] = [], contains: string[] = []): LearningGoal => ({
  id, title: id, description: `Die lernende Person kann ${id}.`, requires, contains, tags: [], weight: 1, core: true,
  dimensionTags: { phase: 'GLOBAL', framework: 'fixture', demandLevel: 'AB2', processCompetencies: [], guidingIdeas: [] },
})
const landscape: SkillLandscape = { landscapeId: math, title: 'Mathematik', subject: 'Mathematik', description: 'Partial-order fixture', locale: 'de-DE', goals: [
  { ...goal('root', [], names), tags: ['root'] }, goal('a'), goal('b', ['a']), goal('c', ['b']), goal('d', ['a']),
] }
const order: CompositionChildOrder = { after: [{ unit: 'b', after: 'a' }, { unit: 'c', after: 'b' }, { unit: 'd', after: 'a' }] }
const view = (childOrder?: CompositionChildOrder): CompositionView => ({ $schema: schemaId, viewFormatVersion: '1.2', language: 'de',
  viewId: 'partial-order-fixture', landscapeId: math, scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'CrossStage' },
  rootNodes: [{ kind: 'structure', id: 'topics', label: 'Themen', ...(childOrder ? { childOrder } : {}), children:
    names.map(id => ({ kind: 'structure', id, label: `Thema ${id}`, children: [{ kind: 'goalEntry', goalId: id }] })) }],
})
const prepare = (raw: CompositionView, sourceLandscape = landscape) => {
  const sources = prepareLandscapeEntries([sourceLandscape])
  const authored = applyCompositionViewProjection(sources, raw).map(entry => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
  const projected = applyPersonalCurriculumProjection(authored, sources)
  const goalIndexAll = new Map(projected.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
  const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
  const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags.includes('root'))
  const visibleGoalIds = new Set<string>()
  const visit = (id: string) => { if (visibleGoalIds.has(id)) return; visibleGoalIds.add(id); (visibleChildrenByParent.get(id) ?? []).forEach(visit) }
  rootGoals.forEach(goal => visit(goal.id))
  return { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent, landscapeSources: sources,
    canonicalGoalIndexAll: new Map(sources.flatMap(entry => entry.goals).map(goal => [goal.id, goal])) }
}
const nodeId = (id: string) => `composition:partial-order-fixture:structure:${id}`
const pairs = (preview: ReturnType<typeof deriveLearnerUnitMapPreview>) => preview.after.map(pair => {
  const id = (key: string) => key.slice(key.lastIndexOf(':') + 1)
  return `${id(pair.after)}>${id(pair.unit)}`
}).sort()
const sourceSnapshot = JSON.stringify(landscape)
const legacy = prepare(view())
assert.deepEqual(pairs(deriveLearnerUnitMapPreview(legacy)), ['a>b', 'b>c', 'c>d'], 'Absent declaration preserves legacy adjacency.')
const partialView = view(order)
assert(schema(partialView), JSON.stringify(schema.errors))
for (const name of ['de-he-gk', 'de-he-lk', 'de-he-sekii-gk', 'de-he-sekii-lk', 'de-he-gk-g8', 'de-he-gk-g9', 'de-he-lk-g8', 'de-he-lk-g9']) {
  const actual = JSON.parse(readFileSync(new URL(`../../curricula/DE/Gymnasium/composition-views/physik/${name}.view.json`, import.meta.url), 'utf8'))
  assert(schema(actual), `${name}: ${JSON.stringify(schema.errors)}`)
}
assert(!legacySchema({ ...partialView, $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json', viewFormatVersion: '1.0' }),
  'The immutable v1 schema rejects the new field instead of silently changing its contract.')
assert.deepEqual(compileCompositionView(partialView, normalizeCanonicalLandscape(landscape)).findings.filter(f => f.code === 'CPV-010'), [])
const input = prepare(partialView), partial = deriveLearnerUnitMapPreview(input)
assert.deepEqual(input.goalIndexAll.get(nodeId('topics'))?.extendedData?.compositionChildOrder, order)
assert.deepEqual(pairs(partial), ['a>b', 'a>d', 'b>c'], 'Declared partial order replaces the whole sibling chain, including its tail.')
const map = buildLearnerUnitMapProjection({ ...input, units: partial.units, after: partial.after })
assert.deepEqual(map.findings, [], 'The partial declaration covers every actual cross-unit demand.')
assert(!map.scopeRelations?.[nodeId('topics')]?.some(edge => edge.source === nodeId('c') && edge.target === nodeId('d')),
  'No display-order edge is fabricated between the independent branches.')

const independent = structuredClone(landscape)
independent.goals.forEach(goal => { goal.requires = [] })
const empty = prepare(view({ after: [] }), independent)
assert.deepEqual(pairs(deriveLearnerUnitMapPreview(empty)), [], 'An explicit empty declaration does not fall back to adjacency.')
assert.deepEqual(readCompositionChildOrder(undefined, names), undefined)
assert.deepEqual(readCompositionChildOrder({ after: [] }, names), { after: [] })
const filtered = { ...input, visibleGoalIds: new Set([...input.visibleGoalIds].filter(id => id !== nodeId('b') && id !== 'b')) }
assert.deepEqual(pairs(deriveLearnerUnitMapPreview(filtered)), ['a>c', 'a>d'], 'Filtering B retains the declared A→B→C reachability without inventing C→D.')
const personalSource = structuredClone(independent)
personalSource.personalCurriculumProjection = { revision: 'atomic-prerequisite-learning-v1', rootLandscapeId: math, scopeRevision: 'fixture-scope',
  seedAtomicGoalIds: ['a', 'c', 'd'], targetGoalIds: ['a', 'c', 'd'], requiredByPaths: {} }
const personal = prepare(view(order), personalSource)
assert(!personal.goalIndexAll.get(nodeId('topics'))!.contains.includes(nodeId('b')), 'The actual Personal Curriculum projection removes empty B from its parent.')
assert.deepEqual(pairs(deriveLearnerUnitMapPreview(personal)), ['a>c', 'a>d'],
  'Source child identities survive the full composition → Personal Curriculum → preview path, retaining A→C.')

let negatives = 0
for (const [name, value] of [
  ['unknown', { after: [{ unit: 'missing', after: 'a' }] }],
  ['nonsibling', { after: [{ unit: 'topics', after: 'a' }] }],
  ['self', { after: [{ unit: 'a', after: 'a' }] }],
  ['duplicate', { after: [{ unit: 'b', after: 'a' }, { unit: 'b', after: 'a' }] }],
  ['cycle', { after: [{ unit: 'b', after: 'a' }, { unit: 'a', after: 'b' }] }],
  ['redundant', { after: [{ unit: 'b', after: 'a' }, { unit: 'c', after: 'b' }, { unit: 'c', after: 'a' }] }],
  ['unknown field', { after: [], implicitTail: true }],
  ['wrong shape', { after: 'a' }],
] as const) {
  const invalid = view(); (invalid.rootNodes[0] as CompositionStructureNode).childOrder = value as unknown as CompositionChildOrder
  assert.throws(() => readCompositionChildOrder(value, names), /Invalid composition childOrder/u, name)
  assert(compileCompositionView(invalid, normalizeCanonicalLandscape(landscape)).findings.some(f => f.code === 'CPV-010'), name)
  assert.throws(() => prepare(invalid), /Invalid composition childOrder/u, `${name}: malformed source never receives a legacy runtime fallback`)
  negatives++
}

// A verified shared plan owns the temporal order, regardless of compatibility
// metadata. These identities deliberately differ from every source section ID.
const planId = 'fixture-shared-plan', parentId = 'calendar-lower'
const plan: LearnerStagePlanMapContext['plan'] = { $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId,
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
  rootUnit: { id: 'calendar-root', label: 'Calendar', children: [parentId, 'calendar-upper'] },
  units: [{ id: parentId, label: 'Lower', kind: 'stage', stage: 'SekI', parentUnitId: 'calendar-root', after: [], children: names.map(id => `calendar-${id}`) },
    { id: 'calendar-upper', label: 'Upper', kind: 'stage', stage: 'SekII', parentUnitId: 'calendar-root', after: [parentId] },
    ...names.map((id, index) => ({ id: `calendar-${id}`, label: `Year ${index + 5}`, kind: 'year' as const, stage: 'SekI' as const, parentUnitId: parentId,
      after: index ? [`calendar-${names[index - 1]}`] : [], year: index + 5,
      basis: { kind: 'reviewedStructure' as const, references: ['fixture'], rationale: 'Isolated temporal fixture.' } }))],
  subjectViews: [{ landscapeId: math, courseProfile: 'GK', viewId: partialView.viewId }],
}
const context: LearnerStagePlanMapContext = { plan, views: [{ viewId: partialView.viewId, planIds: [planId], structureBindings:
  [{ structureId: 'topics', planUnitId: parentId, stage: 'SekI', order: 0, after: [] }, ...names.map((id, index) => ({
    structureId: id, planUnitId: `calendar-${id}`, stage: 'SekI' as const, order: index, after: index ? [`calendar-${names[index - 1]}`] : [],
  }))] }] }
const bound = deriveLearnerUnitMapPreview({ ...input, stagePlanContext: context })
assert.deepEqual(bound.after.map(pair => `${pair.after}>${pair.unit}`).sort(), names.slice(1).map((id, index) =>
  `plan:${planId}:calendar-${names[index]}>plan:${planId}:calendar-${id}`).sort(), 'Verified plan bindings take precedence over the source-view partial order.')

const cache = createLearnerUnitMapCache(), first = cache(input, null)
input.goalIndexAll.get(nodeId('topics'))!.extendedData!.compositionChildOrder = { after: [] }
const changed = cache(input, null)
assert.notEqual(changed.fixture, first.fixture, 'Changing only child-order metadata invalidates the map cache.')
assert.equal(JSON.stringify(landscape), sourceSnapshot, 'Neither declaration, filtering, validation nor map projection rewrites canonical requires or goal content.')
console.log(`Composition child order passed: legacy/empty/partial semantics, real demands, filtered reachability, schema isolation, ${negatives} fail-closed cases, plan precedence and cache invalidation.`)
