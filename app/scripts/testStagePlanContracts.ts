// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  deriveStagePlanPreparation, getStagePlanStructureMetadata, PLAN_COMPOSITION_SCHEMA, STAGE_PLAN_SCHEMA,
  validateStagePlanCatalog, type StagePlan, type StagePlanCatalog, type StagePlanGoal,
} from '../src/utils/stagePlan'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, type CompositionView, type CompositionViewNode, type CompositionStructureNode } from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'

const ajv = new Ajv2020({ strict: false, allErrors: true })
const schema = (path: string) => JSON.parse(readFileSync(new URL(`../../contracts/curriculum-package/${path}`, import.meta.url), 'utf8'))
const planSchema = ajv.compile(schema('v1.3/stage-plan.schema.json'))
const viewSchema = ajv.compile(schema('v1.3/composition-view.schema.json'))
const legacySchema = ajv.compile(schema('v1/composition-view.schema.json'))

function fixture() {
  const plan: StagePlan = {
    $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId: 'de-he-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
    rootUnit: { id: 'plan-root', label: 'Hessen G9', children: ['arbitrary-foundation-id', 'arbitrary-upper-id'] },
    units: [
      { id: 'arbitrary-foundation-id', label: 'Grundlagen', kind: 'stage', stage: 'SekI', parentUnitId: 'plan-root', after: [] },
      { id: 'arbitrary-upper-id', label: 'Vertiefung', kind: 'stage', stage: 'SekII', parentUnitId: 'plan-root', after: ['arbitrary-foundation-id'] },
    ],
    subjectViews: [{ landscapeId: 'physics', courseProfile: 'GK', viewId: 'physics-he-g9-gk-full' }],
  }
  const full = {
    $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: 'physics-he-g9-gk-full', landscapeId: 'physics', language: 'de',
    scope: { ...plan.scope, stage: 'CrossStage', courseProfile: 'GK' }, planBinding: { planId: plan.planId },
    rootNodes: [
      { kind: 'structure', id: 'subject-one', label: 'The label is not a stage selector', planUnitId: plan.units[0].id,
        children: [{ kind: 'canonicalSubtree', goalId: 'first', placementBasis: { kind: 'officialSource', sourceStage: 'SekI', references: ['source-a §1'] } }] },
      { kind: 'structure', id: 'subject-two', label: 'Another arbitrary label', planUnitId: plan.units[1].id,
        children: [
          { kind: 'goalEntry', goalId: 'later', placementBasis: { kind: 'canonicalDefault', canonicalPhase: 'Q4' } },
          { kind: 'goalEntry', goalId: 'support', projectionRole: 'prerequisiteOnly' },
        ] },
    ],
  }
  const excerpt = {
    $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: 'physics-he-g9-gk-first', landscapeId: 'physics', language: 'de',
    scope: { ...plan.scope, stage: 'SekI', courseProfile: 'GK' },
    planBinding: { planId: plan.planId, excerptOfViewId: full.viewId, unitIds: [plan.units[0].id] },
  }
  const goals = new Map<string, StagePlanGoal>([
    ['first', { id: 'first', title: 'first', requires: ['support'] }],
    ['later', { id: 'later', title: 'later', requires: ['first', 'support'] }],
    ['support', { id: 'support', title: 'support', requires: ['foundation'] }],
    ['foundation', { id: 'foundation', title: 'foundation' }],
  ])
  return { plan, full, excerpt, goals }
}
const catalog = (value: ReturnType<typeof fixture>): StagePlanCatalog => ({ plans: [value.plan], views: [value.excerpt, value.full], goals: value.goals })
const valid = fixture()
assert(planSchema(valid.plan), JSON.stringify(planSchema.errors))
assert(viewSchema(valid.full), JSON.stringify(viewSchema.errors))
assert(viewSchema(valid.excerpt), JSON.stringify(viewSchema.errors))
assert(!legacySchema(valid.full), 'Immutable legacy schema must still reject new plan fields.')
const result = validateStagePlanCatalog(catalog(valid))
assert.deepEqual(result.findings, [])
const noGoals = validateStagePlanCatalog({ plans: [valid.plan], views: [valid.full] } as unknown as StagePlanCatalog)
assert(noGoals.findings.some(finding => finding.code === 'SP-CATALOG'), 'JavaScript callers cannot omit the canonical catalog and receive authoritative success.')
assert.equal(noGoals.viewsById.size, 0)
assert.equal(noGoals.placementsByViewId.size, 0)
const excerpt = result.viewsById.get(valid.excerpt.viewId)!
assert.equal(excerpt.rootNodes.length, 1)
assert.equal(excerpt.rootNodes[0].kind, 'structure')
assert.equal(excerpt.rootNodes[0].id, 'subject-one', 'The legacy runtime tree retains authored node identities.')
assert.deepEqual(getStagePlanStructureMetadata(valid.plan, excerpt.rootNodes[0]), {
  planId: 'de-he-g9', planUnitId: 'arbitrary-foundation-id', stage: 'SekI', after: [],
})
assert.deepEqual([...result.placementsByViewId.get(valid.excerpt.viewId)!], [['first', valid.plan.units[0].id]])
assert.notEqual(excerpt.rootNodes[0], valid.full.rootNodes[0], 'Materialization never shares mutable tree nodes with its authority.')
assert(!Object.hasOwn(valid.excerpt, 'rootNodes'), 'Materialization does not mutate authored excerpts.')

let negativeCases = 0
function rejects(name: string, modify: (value: ReturnType<typeof fixture>) => void, expectedCode: string) {
  const value = fixture(); modify(value)
  const checked = validateStagePlanCatalog(catalog(value))
  assert(checked.findings.some(finding => finding.code === expectedCode), `${name}: ${JSON.stringify(checked.findings)}`)
  assert.equal(checked.viewsById.size, 0, `${name}: invalid catalogs cannot produce runtime trees`)
  assert.equal(checked.placementsByViewId.size, 0, `${name}: invalid catalogs cannot claim placements`)
  negativeCases++
}
function legacyCompile(value: ReturnType<typeof fixture>, view = value.full as unknown as CompositionView) {
  const canonical = normalizeCanonicalLandscape({ landscapeId: value.full.landscapeId, title: 'Contract fixture',
    goals: [...new Map([...value.goals.values()].map(goal => [goal.id, goal])).values()]
      .map(goal => ({ ...goal, title: goal.title ?? goal.id, contains: [...goal.contains ?? []], requires: [...goal.requires ?? []] })),
  })
  return compileCompositionView(view, canonical)
}
function compiledAtomicIds(value: ReturnType<typeof fixture>, view: CompositionView) {
  const compilation = legacyCompile(value, view)
  assert.deepEqual(compilation.findings.filter(finding => finding.severity === 'error'), [])
  const ids: string[] = []
  const walk = (nodes: typeof compilation.compiledRootNodes) => nodes.forEach(node => {
    const goal = node.sourceGoalId ? value.goals.get(node.sourceGoalId) : undefined
    if (goal && goal.type !== 'cluster' && !goal.contains?.length) ids.push(goal.id)
    walk(node.children)
  })
  walk(compilation.compiledRootNodes)
  return ids.sort()
}
rejects('unknown after endpoint', value => { value.plan.units[1].after = ['missing'] }, 'SP-REF')
rejects('after cycle', value => { value.plan.units[0].after = [value.plan.units[1].id] }, 'SP-CYCLE')
rejects('missing stage order', value => { value.plan.units[1].after = [] }, 'SP-ORDER')
rejects('third root child', value => { value.plan.rootUnit.children.push('extra') }, 'SP-ROOT')
rejects('reversed stage root', value => { value.plan.rootUnit.children.reverse() }, 'SP-ROOT')
rejects('bad parent', value => { value.plan.units[1].parentUnitId = value.plan.units[0].id }, 'SP-REF')
rejects('duplicate unit', value => { value.plan.units[1].id = value.plan.units[0].id }, 'SP-DUPLICATE')
rejects('national catalog is not a Land plan', value => { value.plan.scope.jurisdiction = 'DE' }, 'SP-SHAPE')
rejects('missing subject authority', value => { value.plan.subjectViews[0].viewId = 'missing' }, 'SP-AUTHORITY')
rejects('duplicate subject authority', value => { value.plan.subjectViews.push(value.plan.subjectViews[0]) }, 'SP-AUTHORITY')
rejects('unknown plan', value => { value.full.planBinding.planId = 'missing' }, 'SP-REF')
rejects('unknown shared stage', value => { value.full.rootNodes[0].planUnitId = 'legacy-stage-id' }, 'SP-REF')
rejects('stage scope does not match excerpt', value => { value.excerpt.scope.stage = 'SekII' }, 'SP-EXCERPT')
rejects('excerpt cycle / excerpt authority', value => { value.excerpt.planBinding.excerptOfViewId = value.excerpt.viewId }, 'SP-EXCERPT')
rejects('excerpt duplicates authored tree', value => { Object.assign(value.excerpt, { rootNodes: value.full.rootNodes }) }, 'SP-EXCERPT')
rejects('excerpt references missing unit', value => { value.excerpt.planBinding.unitIds = ['missing'] }, 'SP-EXCERPT')
rejects('scope mismatch', value => { value.full.scope.durationModel = 'G8' }, 'SP-SCOPE')
rejects('unknown field', value => { Object.assign(value.plan.units[0], { stageOverride: 'SekII' }) }, 'SP-SHAPE')
rejects('unknown goal', value => { value.goals.delete('first') }, 'SP-GOAL-REF')
rejects('wrong landscape qualifier cannot match a bare goal suffix', value => { value.full.rootNodes[0].children[0].goalId = 'wrong-landscape:first' }, 'SP-GOAL-REF')
rejects('contains cycle', value => { value.goals.set('first', { id: 'first', contains: ['first'] }) }, 'SP-GRAPH')
rejects('duplicate target placements', value => {
  value.full.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'first' } as typeof value.full.rootNodes[1]['children'][number])
}, 'SP-PLACEMENT')
rejects('source claim requires evidence', value => {
  (value.full.rootNodes[0].children[0].placementBasis as { references: string[] }).references = []
}, 'SP-SOURCE')
rejects('early placement is not an unqualified source assignment', value => {
  (value.full.rootNodes[0].children[0].placementBasis as { sourceStage: string }).sourceStage = 'SekII'
}, 'SP-SOURCE')
rejects('prerequisiteOnly position is not source evidence', value => {
  Object.assign(value.full.rootNodes[1].children[1], { placementBasis: { kind: 'officialSource', sourceStage: 'SekII', references: ['unrelated source'] } })
}, 'SP-SOURCE')

function rejectsVisibleDuplicate(name: string, modify: (value: ReturnType<typeof fixture>) => void) {
  const value = fixture(); modify(value)
  assert(legacyCompile(value).findings.some(finding => finding.code === 'CPV-005'), `${name}: reproduction must violate the real compiler's visible-occurrence contract`)
  const checked = validateStagePlanCatalog(catalog(value))
  assert(checked.findings.some(finding => finding.code === 'SP-DUPLICATE-GOAL'), `${name}: ${JSON.stringify(checked.findings)}`)
  assert.equal(checked.viewsById.size, 0)
  assert.equal(checked.placementsByViewId.size, 0)
  negativeCases++
}
rejectsVisibleDuplicate('repeated same-stage goalEntry', value => {
  value.full.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'later' } as typeof value.full.rootNodes[1]['children'][number])
})
rejectsVisibleDuplicate('repeated same-stage canonicalSubtree', value => {
  value.full.rootNodes[0].children.push(structuredClone(value.full.rootNodes[0].children[0]))
})
rejectsVisibleDuplicate('overlapping distinct subtrees', value => {
  value.goals.set('larger-subtree', { id: 'larger-subtree', type: 'cluster', contains: ['first'] })
  value.full.rootNodes[0].children.push({ kind: 'canonicalSubtree', goalId: 'larger-subtree' } as typeof value.full.rootNodes[0]['children'][number])
})
rejectsVisibleDuplicate('goalEntry overlaps a subtree descendant', value => {
  value.goals.set('first', { id: 'first', type: 'cluster', contains: ['visible-child'] })
  value.goals.set('visible-child', { id: 'visible-child' })
  value.full.rootNodes[0].children.push({ kind: 'goalEntry', goalId: 'visible-child' } as typeof value.full.rootNodes[0]['children'][number])
})
rejectsVisibleDuplicate('a canonical DAG repeats a descendant inside one subtree', value => {
  value.goals.set('first', { id: 'first', type: 'cluster', contains: ['left', 'right'] })
  value.goals.set('left', { id: 'left', type: 'cluster', contains: ['shared-child'] })
  value.goals.set('right', { id: 'right', type: 'cluster', contains: ['shared-child'] })
  value.goals.set('shared-child', { id: 'shared-child' })
})
rejectsVisibleDuplicate('repeated opaque cluster entries still duplicate a visible goal', value => {
  value.goals.set('opaque', { id: 'opaque', type: 'cluster', contains: ['hidden'] })
  value.goals.set('hidden', { id: 'hidden' })
  for (let index = 0; index < 2; index++) value.full.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'opaque' } as typeof value.full.rootNodes[1]['children'][number])
})

const duplicateSupport = fixture()
duplicateSupport.full.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'support', projectionRole: 'prerequisiteOnly' } as typeof duplicateSupport.full.rootNodes[1]['children'][number])
assert(!legacyCompile(duplicateSupport).findings.some(finding => finding.code === 'CPV-005'))
assert.deepEqual(validateStagePlanCatalog(catalog(duplicateSupport)).findings, [], 'Repeated support declarations do not duplicate visible goals.')

// Actual Economics deliberately displays an examination cluster as an opaque
// goalEntry. It must remain visible without acquiring its hidden examinations.
const economics = JSON.parse(readFileSync(new URL('../../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', import.meta.url), 'utf8')) as { goals: StagePlanGoal[] }
const economicsView = JSON.parse(readFileSync(new URL('../../curricula/DE/Gymnasium/composition-views/wirtschaft/de-he-gym-economics-lk.view.json', import.meta.url), 'utf8')) as { rootNodes: CompositionViewNode[] }
function findGoalEntry(nodes: CompositionViewNode[], goalId: string): CompositionViewNode | undefined {
  for (const node of nodes) {
    if (node.kind === 'goalEntry' && node.goalId === goalId) return node
    if (node.kind === 'structure') { const nested = findGoalEntry(node.children, goalId); if (nested) return nested }
  }
  return undefined
}
const opaqueId = 'a068e975-4dae-56ba-b510-f26532d6de0b', opaqueEntry = findGoalEntry(economicsView.rootNodes, opaqueId)
const opaqueGoal = economics.goals.find(goal => goal.id === opaqueId)
assert(opaqueEntry && opaqueGoal?.type === 'cluster' && opaqueGoal.contains?.length, 'Keep the real opaque examination-cluster reproduction meaningful.')
const opaque = fixture()
economics.goals.forEach(goal => opaque.goals.set(goal.id, goal))
opaque.full.rootNodes[1].children.push(structuredClone(opaqueEntry) as typeof opaque.full.rootNodes[1]['children'][number])
const opaqueResult = validateStagePlanCatalog(catalog(opaque))
assert.deepEqual(opaqueResult.findings, [])
assert(findGoalEntry(opaqueResult.viewsById.get(opaque.full.viewId)!.rootNodes, opaqueId), 'The opaque navigation entry is retained.')
const opaquePlacements = opaqueResult.placementsByViewId.get(opaque.full.viewId)!
assert(!opaquePlacements.has(opaqueId), 'A cluster never becomes an atomic placement.')
assert(opaqueGoal.contains.every(child => !opaquePlacements.has(child)), 'Opaque goalEntry does not add hidden children to the learning scope.')
assert.deepEqual(opaquePlacements, result.placementsByViewId.get(valid.full.viewId), 'Adding navigation alone leaves the complete acquisition target map unchanged.')
assert.deepEqual(deriveStagePlanPreparation(opaque.plan, opaquePlacements, opaque.goals).findings, [], 'Successful opaque-entry validation must not poison later prerequisite closure.')
assert(!legacyCompile(opaque).findings.some(finding => finding.severity === 'error'), 'The real compiler accepts the opaque-entry behavior.')

const separateChild = fixture()
separateChild.goals.set('opaque', { id: 'opaque', type: 'cluster', contains: ['independent-child'] })
separateChild.goals.set('independent-child', { id: 'independent-child' })
separateChild.goals.set('empty-cluster', { id: 'empty-cluster', type: 'cluster', contains: [] })
for (const goalId of ['opaque', 'independent-child', 'empty-cluster']) separateChild.full.rootNodes[1].children.push({ kind: 'goalEntry', goalId } as typeof separateChild.full.rootNodes[1]['children'][number])
const separateChildResult = validateStagePlanCatalog(catalog(separateChild))
assert.deepEqual(separateChildResult.findings, [])
assert(separateChildResult.placementsByViewId.get(separateChild.full.viewId)!.has('independent-child'), 'An explicitly selected child remains a target alongside an opaque parent.')
assert(!separateChildResult.placementsByViewId.get(separateChild.full.viewId)!.has('opaque'))
assert(!separateChildResult.placementsByViewId.get(separateChild.full.viewId)!.has('empty-cluster'), 'Explicit cluster identity remains authoritative even with no children.')

function roleOverrideFixture(kind: 'goalEntry' | 'canonicalSubtree') {
  const value = fixture()
  value.goals.set('first', { id: 'first', type: 'cluster', contains: ['kept', 'narrow'] })
  value.goals.set('kept', { id: 'kept' })
  value.goals.set('narrow', { id: 'narrow', type: 'cluster', contains: ['hidden'] })
  value.goals.set('hidden', { id: 'hidden' })
  value.goals.set('later', { id: 'later' })
  const support = { kind, goalId: kind === 'goalEntry' ? 'hidden' : 'narrow', projectionRole: 'prerequisiteOnly' }
  value.full.rootNodes[1].children.push(support as typeof value.full.rootNodes[1]['children'][number])
  return value
}
for (const kind of ['goalEntry', 'canonicalSubtree'] as const) {
  const value = roleOverrideFixture(kind), checked = validateStagePlanCatalog(catalog(value))
  assert.deepEqual(checked.findings, [], `${kind}: specific overrides are resolved by the existing collector, not rejected as raw role conflicts.`)
  assert(!checked.placementsByViewId.get(value.full.viewId)!.has('hidden'))
  const projected = checked.viewsById.get(value.excerpt.viewId)!
  assert.deepEqual(compiledAtomicIds(value, projected), [...checked.placementsByViewId.get(value.excerpt.viewId)!.keys()].sort())
  const firstRoot = projected.rootNodes[0] as CompositionStructureNode
  assert.equal(firstRoot.children[0].kind, 'canonicalSubtree')
  assert.equal(firstRoot.children[0].goalId, 'first', 'Scoped subtree references stay authored references, never flattened atomic entries.')
  assert(firstRoot.children.some(node => node.kind === 'structure' && node.children.some(child => child.projectionRole === 'prerequisiteOnly' && child.kind === kind)), 'Needed original support declarations survive outside-stage pruning in an invisible section.')
  assert(!JSON.stringify(legacyCompile(value, projected).compiledRootNodes).includes('global-prerequisite-hints'), 'The derived support section stays invisible in the actual compiler.')
  assert(!Object.hasOwn(value.excerpt, 'rootNodes'), 'Role preservation does not author an excerpt tree.')
}
const targetWins = roleOverrideFixture('canonicalSubtree')
targetWins.full.rootNodes[0].children.push({ kind: 'goalEntry', goalId: 'hidden' } as typeof targetWins.full.rootNodes[0]['children'][number])
const targetWinsResult = validateStagePlanCatalog(catalog(targetWins))
assert.deepEqual(targetWinsResult.findings, [], 'A specific target goalEntry outranks a prerequisite-only subtree exactly as in the existing compiler.')
assert(targetWinsResult.placementsByViewId.get(targetWins.full.viewId)!.has('hidden'))
assert.deepEqual(compiledAtomicIds(targetWins, targetWinsResult.viewsById.get(targetWins.excerpt.viewId)!), [...targetWinsResult.placementsByViewId.get(targetWins.excerpt.viewId)!.keys()].sort())
const effectiveDuplicate = roleOverrideFixture('canonicalSubtree')
for (const index of [0, 1]) effectiveDuplicate.full.rootNodes[index].children.push({ kind: 'goalEntry', goalId: 'hidden' } as typeof effectiveDuplicate.full.rootNodes[0]['children'][number])
assert(legacyCompile(effectiveDuplicate).findings.some(finding => finding.code === 'CPV-005'))
const effectiveDuplicateResult = validateStagePlanCatalog(catalog(effectiveDuplicate))
assert(effectiveDuplicateResult.findings.some(finding => finding.code === 'SP-DUPLICATE-GOAL'))
assert(effectiveDuplicateResult.findings.some(finding => finding.code === 'SP-PLACEMENT'), 'Specific target overrides do not excuse a genuinely duplicated effective placement across stages.')
assert.equal(effectiveDuplicateResult.viewsById.size, 0)
negativeCases++

const hiddenRepeated = roleOverrideFixture('goalEntry')
hiddenRepeated.goals.set('first', { id: 'first', type: 'cluster', contains: ['left', 'right', 'kept'] })
hiddenRepeated.goals.set('left', { id: 'left', type: 'cluster', contains: ['hidden'] })
hiddenRepeated.goals.set('right', { id: 'right', type: 'cluster', contains: ['hidden'] })
const hiddenRepeatedResult = validateStagePlanCatalog(catalog(hiddenRepeated))
assert.deepEqual(hiddenRepeatedResult.findings, [], 'Two raw containment paths to an effectively hidden goal do not duplicate a visible goal.')
assert(!hiddenRepeatedResult.placementsByViewId.get(hiddenRepeated.full.viewId)!.has('hidden'))
assert.deepEqual(compiledAtomicIds(hiddenRepeated, hiddenRepeatedResult.viewsById.get(hiddenRepeated.excerpt.viewId)!), ['kept'])

// A target declaration outside the excerpt can also affect role specificity.
// Retaining support hints must fail closed if it cannot preserve that projection.
const lostExternalTarget = fixture()
for (const [goalId, contains] of [['first', ['inside-one']], ['inside-one', ['inside-two']], ['inside-two', ['hidden']],
  ['support-root', ['support-middle']], ['support-middle', ['hidden']], ['external-root', ['hidden']]] as Array<[string, string[]]>) {
  lostExternalTarget.goals.set(goalId, { id: goalId, type: 'cluster', contains })
}
lostExternalTarget.goals.set('hidden', { id: 'hidden' }); lostExternalTarget.goals.set('later', { id: 'later' })
lostExternalTarget.full.rootNodes[0].children.push({ kind: 'canonicalSubtree', goalId: 'support-root', projectionRole: 'prerequisiteOnly' } as typeof lostExternalTarget.full.rootNodes[0]['children'][number])
lostExternalTarget.full.rootNodes[1].children.push({ kind: 'canonicalSubtree', goalId: 'external-root' } as typeof lostExternalTarget.full.rootNodes[1]['children'][number])
lostExternalTarget.full.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'external-root', projectionRole: 'prerequisiteOnly' } as typeof lostExternalTarget.full.rootNodes[1]['children'][number])
const lostExternalResult = validateStagePlanCatalog(catalog(lostExternalTarget))
assert(lostExternalResult.findings.some(finding => finding.code === 'SP-EXCERPT-ROLES'), JSON.stringify(lostExternalResult.findings))
assert.equal(lostExternalResult.viewsById.size, 0)
negativeCases++

// Real-data counterexamples from the activation design audit. Stage IDs below
// select existing test fragments only; they do not author a Land placement or
// decide where a genuine outside-stage target belongs.
const realGoalCatalog = new Map<string, StagePlanGoal>()
const realCanonicalRoot = new URL('../../curricula/DE/Gymnasium/canonical/', import.meta.url)
for (const file of readdirSync(realCanonicalRoot).filter(name => name.endsWith('.json'))) {
  const landscape = JSON.parse(readFileSync(new URL(file, realCanonicalRoot), 'utf8')) as { landscapeId: string; goals: StagePlanGoal[] }
  for (const goal of landscape.goals) { realGoalCatalog.set(goal.id, goal); realGoalCatalog.set(`${landscape.landscapeId}:${goal.id}`, goal) }
}
function findStructure(nodes: CompositionViewNode[], id: string): CompositionStructureNode | undefined {
  for (const node of nodes) if (node.kind === 'structure') {
    if (node.id === id) return node
    const nested = findStructure(node.children, id); if (nested) return nested
  }
  return undefined
}
for (const [file, firstId, secondId] of [['de-bb-gk.view.json', 'sek1', 'sek-ii'], ['de-he-gk-g8.view.json', 'sek1-g8', 'sek2-gk']]) {
  const source = JSON.parse(readFileSync(new URL(`../../curricula/DE/Gymnasium/composition-views/mathematik/${file}`, import.meta.url), 'utf8')) as CompositionView
  const first = findStructure(source.rootNodes, firstId), second = findStructure(source.rootNodes, secondId)
  assert(first && second, `Keep the existing stage fragments explicit for ${file}.`)
  const looseSupport: CompositionViewNode[] = []
  const looseTargets: CompositionViewNode[] = []
  const collectLooseSupport = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
    if (node.kind === 'structure') { if (node.id !== firstId && node.id !== secondId) collectLooseSupport(node.children); return }
    // A later real-data package may add true targets outside these fragments.
    // This role regression neither assigns those targets a stage nor proves the
    // complete Land view valid; it tests exactly the two existing stage fragments.
    if (node.projectionRole === 'prerequisiteOnly') looseSupport.push(structuredClone(node))
    else looseTargets.push(structuredClone(node))
  })
  collectLooseSupport(source.rootNodes)
  if (file === 'de-bb-gk.view.json') assert(looseSupport.length > 0, `${file}: keep actual global support overrides in the reproduction.`)
  // HE's current normalized tree has no loose global declarations. Its
  // existing nested roles remain part of the same legacy role-only fixture.
  const value = fixture()
  value.goals = realGoalCatalog
  value.plan.planId = `${source.viewId}-test-plan`
  value.plan.scope.jurisdiction = String(source.scope.jurisdiction)
  value.plan.scope.durationModel = String(source.scope.durationModel ?? value.plan.scope.durationModel)
  value.full.viewId = `${source.viewId}-test-authority`; value.full.landscapeId = source.landscapeId
  value.full.scope = { ...value.plan.scope, stage: 'CrossStage', courseProfile: String(source.scope.courseProfile) }
  value.full.planBinding.planId = value.plan.planId
  // This isolated 1.1 fixture tests role specificity only. It is not a
  // source-format converter: current 1.2 ordering, evidence and acquisition
  // semantics remain tested at their actual versioned boundaries. Preserve
  // exactly the current reference kinds, IDs and projection roles here.
  const roleFixtureNodes = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.map(node => node.kind === 'structure'
    ? { kind: node.kind, id: node.id, label: node.label, children: roleFixtureNodes(node.children),
      ...(node.planUnitId ? { planUnitId: node.planUnitId } : {}) }
    : { kind: node.kind, goalId: node.goalId, ...(node.projectionRole ? { projectionRole: node.projectionRole } : {}),
      ...(node.displayLabel ? { displayLabel: node.displayLabel } : {}) } as CompositionViewNode)
  value.full.rootNodes = roleFixtureNodes([
    { ...structuredClone(first), planUnitId: value.plan.units[0].id, children: [...structuredClone(first.children), ...looseSupport] },
    { ...structuredClone(second), planUnitId: value.plan.units[1].id },
  ]) as typeof value.full.rootNodes
  value.plan.subjectViews = [{ landscapeId: source.landscapeId, courseProfile: String(source.scope.courseProfile), viewId: value.full.viewId }]
  value.excerpt.viewId = `${source.viewId}-test-seki`; value.excerpt.landscapeId = source.landscapeId
  value.excerpt.scope = { ...value.full.scope, stage: 'SekI' }
  value.excerpt.planBinding = { planId: value.plan.planId, excerptOfViewId: value.full.viewId, unitIds: [value.plan.units[0].id] }
  const checked = validateStagePlanCatalog(catalog(value))
  assert.deepEqual(checked.findings, [], `${file}: ${JSON.stringify(checked.findings.slice(0, 5))}`)
  const fullPlacements = checked.placementsByViewId.get(value.full.viewId)!
  const selectedSource = { ...source, rootNodes: [structuredClone(first), structuredClone(second), ...looseSupport] }
  assert.deepEqual([...fullPlacements.keys()].sort(), compiledAtomicIds(value, selectedSource), `${file}: the explicit existing stage fragments preserve their native compiler target scope.`)
  const unplacedAtomicIds = compiledAtomicIds(value, source).filter(id => !fullPlacements.has(id))
  const outsideOnly = { ...source, rootNodes: [...looseTargets, ...looseSupport] }
  assert.deepEqual(unplacedAtomicIds, looseTargets.length ? compiledAtomicIds(value, outsideOnly) : [], `${file}: every full-view target outside the tested stages is diagnosed explicitly.`)
  // Preserve the genuine complete-view failure. Adding any of these actual
  // outside-stage declarations to an authority must fail closed; the fragment
  // test above never turns their technical practice container into a stage.
  for (const node of looseTargets) {
    const complete = structuredClone(value)
    complete.full.rootNodes.push(structuredClone(node) as typeof complete.full.rootNodes[number])
    const fullCheck = validateStagePlanCatalog(catalog(complete))
    assert(fullCheck.findings.some(finding => finding.code === 'SP-PLACEMENT'), `${file}: true outside targets cannot pass as a complete plan.`)
    assert.equal(fullCheck.placementsByViewId.size, 0)
  }
  if (unplacedAtomicIds.length) console.log(`Full-view stage diagnosis remains blocked: ${file}: ${unplacedAtomicIds.join(', ')}`)
  const { prerequisiteOnlyGoalIds } = collectCompositionProjectionRoleGoalIds(source.rootNodes, realGoalCatalog)
  for (const id of prerequisiteOnlyGoalIds) assert(!fullPlacements.has(realGoalCatalog.get(id)!.id), `${file}: effective support ${id} cannot become a seed target.`)
  const derived = checked.viewsById.get(value.excerpt.viewId)!
  assert.deepEqual(compiledAtomicIds(value, derived), [...checked.placementsByViewId.get(value.excerpt.viewId)!.keys()].sort(), `${file}: derived excerpt agrees with actual compilation after global support retention.`)
}

// Legitimate reviewed early learning keeps its official source assignment separate.
const early = fixture()
early.full.rootNodes[0].children[0].placementBasis = {
  kind: 'reviewedPreparation', sourceStage: 'SekII', references: ['review:early-first'], rationale: 'Elementary model is needed for the first diode task.',
} as typeof early.full.rootNodes[0]['children'][number]['placementBasis']
assert(viewSchema(early.full), JSON.stringify(viewSchema.errors))
assert.deepEqual(validateStagePlanCatalog(catalog(early)).findings, [])

// Missing inherited evidence remains unresolved, rather than inventing a claim.
const inherited = fixture()
delete inherited.full.rootNodes[0].children[0].placementBasis
assert.deepEqual(validateStagePlanCatalog(catalog(inherited)).findings, [])

const profile = fixture()
const upper = structuredClone(profile.full)
upper.viewId = 'physics-he-g9-lk-full'; upper.scope.courseProfile = 'LK'
upper.rootNodes[1].children.push(upper.rootNodes[0].children.pop()! as typeof upper.rootNodes[1]['children'][number])
profile.plan.subjectViews.push({ landscapeId: 'physics', courseProfile: 'LK', viewId: upper.viewId })
const inconsistent = validateStagePlanCatalog({ ...catalog(profile), views: [profile.full, profile.excerpt, upper] })
assert(inconsistent.findings.some(finding => finding.code === 'SP-PROFILE'), JSON.stringify(inconsistent.findings))
assert.equal(inconsistent.viewsById.size, 0)
negativeCases++

const crossSubject = fixture(), math = structuredClone(crossSubject.full)
math.viewId = 'math-he-g9-gk-full'; math.landscapeId = 'math'
const moved = math.rootNodes[0].children.pop()!
delete moved.placementBasis
math.rootNodes[1].children.push(moved as typeof math.rootNodes[1]['children'][number])
crossSubject.plan.subjectViews.push({ landscapeId: 'math', courseProfile: 'GK', viewId: math.viewId })
const crossSubjectConflict = validateStagePlanCatalog({ ...catalog(crossSubject), views: [crossSubject.full, math] })
assert(crossSubjectConflict.findings.some(finding => finding.code === 'SP-PROFILE'), 'One canonical atom has one placement across subjects, not one per subject.')
assert.equal(crossSubjectConflict.viewsById.size, 0)
negativeCases++

const qualified = fixture()
qualified.full.rootNodes[0].children[0].goalId = 'physics:first'
qualified.goals.set('physics:first', qualified.goals.get('first')!)
qualified.goals.set('math:foundation', qualified.goals.get('foundation')!)
qualified.goals.set('support', { id: 'support', requires: ['math:foundation'] })
const qualifiedResult = validateStagePlanCatalog(catalog(qualified))
assert.deepEqual(qualifiedResult.findings, [])
assert.equal(qualifiedResult.placementsByViewId.get(qualified.full.viewId)!.get('first'), qualified.plan.units[0].id)
const qualifiedPreparation = deriveStagePlanPreparation(qualified.plan, qualifiedResult.placementsByViewId.get(qualified.full.viewId)!, qualified.goals)
assert.deepEqual(qualifiedPreparation.findings, [])
assert(qualifiedPreparation.preparations.some(item => item.goalId === 'foundation' && item.witnessPath.join('/') === 'first/support/foundation'), 'Exact supplied cross-subject aliases resolve to stable canonical identities.')

const duplicatePlan = validateStagePlanCatalog({ plans: [valid.plan, { ...valid.plan, planId: 'other-authority' }], views: [valid.full], goals: valid.goals })
assert(duplicatePlan.findings.some(finding => finding.code === 'SP-AUTHORITY'))
negativeCases++

// Actual inventory has duration-neutral Physics but G8/G9 Mathematics. Keep
// one Physics source tree and explicit duration-specific plans and Math trees.
function sharedDurationFixture() {
  const value = fixture(), g9 = value.plan, g8 = structuredClone(value.plan)
  g8.planId = 'de-he-g8'; g8.scope.durationModel = 'G8'; g8.rootUnit.id = 'plan-root-g8'
  g8.units.forEach(unit => { unit.parentUnitId = g8.rootUnit.id })
  const neutralScope = { schoolForm: value.full.scope.schoolForm, jurisdiction: value.full.scope.jurisdiction,
    stage: value.full.scope.stage, courseProfile: value.full.scope.courseProfile }
  const physics = { ...value.full, scope: neutralScope, planBinding: { planIds: [g9.planId, g8.planId] } }
  const mathG9 = structuredClone(value.full), mathG8 = structuredClone(value.full)
  for (const [mathView, plan] of [[mathG9, g9], [mathG8, g8]] as const) {
    mathView.viewId = `math-${plan.planId}`; mathView.landscapeId = 'math'
    mathView.planBinding.planId = plan.planId; mathView.scope.durationModel = plan.scope.durationModel
    mathView.rootNodes[0].children[0].goalId = 'math-first'
    mathView.rootNodes[1].children[0].goalId = 'math-later'
    plan.subjectViews.push({ landscapeId: 'math', courseProfile: 'GK', viewId: mathView.viewId })
  }
  const contextualFull = { ...value.excerpt, viewId: 'physics-he-g8-full', scope: { ...value.excerpt.scope, stage: 'CrossStage', durationModel: 'G8' },
    planBinding: { planId: g8.planId, excerptOfViewId: physics.viewId, unitIds: [...g8.rootUnit.children] } }
  value.goals.set('math-first', { id: 'math-first' }); value.goals.set('math-later', { id: 'math-later' })
  return { g9, g8, physics, mathG9, mathG8, contextualFull, goals: value.goals }
}
const sharedCatalog = (value: ReturnType<typeof sharedDurationFixture>): StagePlanCatalog => ({
  plans: [value.g9, value.g8], views: [value.physics, value.mathG9, value.mathG8, value.contextualFull], goals: value.goals,
})
const sharedDuration = sharedDurationFixture(), sharedResult = validateStagePlanCatalog(sharedCatalog(sharedDuration))
assert(viewSchema(sharedDuration.physics), JSON.stringify(viewSchema.errors))
assert(viewSchema(sharedDuration.contextualFull), JSON.stringify(viewSchema.errors))
assert.deepEqual(sharedResult.findings, [])
assert.equal(sharedResult.plansById.size, 2, 'There remains one explicit plan per duration.')
assert.equal(sharedResult.viewsById.get(sharedDuration.contextualFull.viewId)!.rootNodes.length, 2)
assert.equal(sharedResult.viewsById.get(sharedDuration.contextualFull.viewId)!.scope.durationModel, 'G8')
assert.deepEqual(sharedResult.viewsById.get(sharedDuration.contextualFull.viewId)!.rootNodes, sharedDuration.physics.rootNodes)
assert(!Object.hasOwn(sharedDuration.physics.scope, 'durationModel'), 'Sharing preserves one duration-neutral Physics source.')
assert(!Object.hasOwn(sharedDuration.contextualFull, 'rootNodes'), 'Contextual full views do not duplicate authored placement decisions.')
assert.equal(sharedResult.placementsByViewId.get(sharedDuration.contextualFull.viewId)!.get('first'), sharedDuration.g8.units[0].id)
function rejectsShared(name: string, modify: (value: ReturnType<typeof sharedDurationFixture>) => void, code: string) {
  const value = sharedDurationFixture(); modify(value)
  const checked = validateStagePlanCatalog(sharedCatalog(value))
  assert(checked.findings.some(finding => finding.code === code), `${name}: ${JSON.stringify(checked.findings)}`)
  assert.equal(checked.viewsById.size, 0)
  negativeCases++
}
rejectsShared('unknown explicitly shared plan', value => { value.physics.planBinding.planIds.push('missing-plan') }, 'SP-REF')
rejectsShared('declared shared plan must select source', value => { value.g8.subjectViews.shift() }, 'SP-AUTHORITY')
rejectsShared('neutral authority needs at least one declared plan context', value => { value.physics.planBinding.planIds = [] }, 'SP-AUTHORITY')
rejectsShared('duration-specific source cannot claim neutral sharing', value => { Object.assign(value.physics.scope, { durationModel: 'G9' }) }, 'SP-SCOPE')
rejectsShared('stage identity must agree across duration contexts', value => {
  value.g8.rootUnit.children[0] = 'other-stage-id'; value.g8.units[0].id = 'other-stage-id'; value.g8.units[1].after = ['other-stage-id']
}, 'SP-SHARING')
rejectsShared('source sharing cannot cross Land', value => { value.g8.scope.jurisdiction = 'DE-RP' }, 'SP-SHARING')
rejectsShared('contextual full excerpt respects order', value => { value.contextualFull.planBinding.unitIds.reverse() }, 'SP-EXCERPT')

const neutralDuration = sharedDurationFixture()
const physicsUpper = {
  ...neutralDuration.contextualFull, viewId: 'physics-he-upper-neutral-duration',
  scope: { ...neutralDuration.physics.scope, stage: 'SekII' },
  planBinding: { planIds: [neutralDuration.g9.planId, neutralDuration.g8.planId], excerptOfViewId: neutralDuration.physics.viewId,
    unitIds: [neutralDuration.g9.units[1].id] },
}
assert(viewSchema(physicsUpper), JSON.stringify(viewSchema.errors))
const neutralDurationResult = validateStagePlanCatalog({ ...sharedCatalog(neutralDuration), views: [...sharedCatalog(neutralDuration).views, physicsUpper] })
const missingSharedUnit = { ...physicsUpper, planBinding: { ...physicsUpper.planBinding, unitIds: ['missing-unit'] } }
const missingSharedResult = validateStagePlanCatalog({ ...sharedCatalog(neutralDuration), views: [...sharedCatalog(neutralDuration).views, missingSharedUnit] })
assert(missingSharedResult.findings.some(finding => finding.code === 'SP-EXCERPT'), 'An unknown unit in a shared excerpt is a structured rejection, never an unchecked dereference.')
assert.equal(missingSharedResult.viewsById.size, 0)
negativeCases++
assert.deepEqual(neutralDurationResult.findings, [])
assert.equal(neutralDurationResult.viewsById.get(physicsUpper.viewId)!.rootNodes.length, 1)
assert(!Object.hasOwn(neutralDurationResult.viewsById.get(physicsUpper.viewId)!.scope, 'durationModel'), 'Duration-neutral Physics upper views remain duration-neutral after materialization.')
const stampedDuration = { ...physicsUpper, scope: { ...physicsUpper.scope, durationModel: 'G8' } }
assert(validateStagePlanCatalog({ ...sharedCatalog(neutralDuration), views: [...sharedCatalog(neutralDuration).views, stampedDuration] }).findings.some(finding => finding.code === 'SP-SCOPE'))
negativeCases++
const oneContext = sharedDurationFixture()
oneContext.physics.planBinding.planIds = [oneContext.g9.planId]
const oneContextExcerpt = { ...physicsUpper, planBinding: { ...physicsUpper.planBinding, planIds: [oneContext.g9.planId] } }
assert(viewSchema(oneContext.physics), JSON.stringify(viewSchema.errors))
assert(viewSchema(oneContextExcerpt), JSON.stringify(viewSchema.errors))
const oneContextResult = validateStagePlanCatalog({ plans: [oneContext.g9], views: [oneContext.physics, oneContext.mathG9, oneContextExcerpt], goals: oneContext.goals })
assert.deepEqual(oneContextResult.findings, [], 'An omitted duration may have one explicit supported context; never invent a second duration just to keep an offer neutral.')
assert(!Object.hasOwn(oneContextResult.viewsById.get(oneContextExcerpt.viewId)!.scope, 'durationModel'))

function independentProfileFixture() {
  const value = fixture(), lk = structuredClone(value.full)
  lk.viewId = 'physics-he-g9-lk-full'; lk.scope.courseProfile = 'LK'
  lk.rootNodes[0].id = 'lk-source-local-structure-id'
  lk.rootNodes[1].children.push({ kind: 'goalEntry', goalId: 'lk-only-upper' } as typeof lk.rootNodes[1]['children'][number])
  value.goals.set('lk-only-upper', { id: 'lk-only-upper' })
  value.plan.subjectViews.push({ landscapeId: 'physics', courseProfile: 'LK', viewId: lk.viewId })
  const neutral = { ...value.excerpt, viewId: 'physics-he-g9-first-no-course',
    scope: { ...value.plan.scope, stage: 'SekI' },
    planBinding: { planId: value.plan.planId, excerptOfViewIds: [value.full.viewId, lk.viewId], unitIds: [value.plan.units[0].id] },
  }
  return { ...value, lk, neutral, extraAuthorities: [] as typeof value.full[] }
}
const independentCatalog = (value: ReturnType<typeof independentProfileFixture>): StagePlanCatalog => ({
  plans: [value.plan], views: [value.neutral, value.lk, value.full, ...value.extraAuthorities], goals: value.goals,
})
const independent = independentProfileFixture(), independentResult = validateStagePlanCatalog(independentCatalog(independent))
assert(viewSchema(independent.neutral), JSON.stringify(viewSchema.errors))
assert.deepEqual(independentResult.findings, [], 'Profile differences outside the selected stage do not invalidate a common SekI projection.')
assert(!Object.hasOwn(independentResult.viewsById.get(independent.neutral.viewId)!.scope, 'courseProfile'), 'No arbitrary course is stamped onto an independent scope.')
function nativeGoalLabel(value: ReturnType<typeof fixture>, view: CompositionView, goalId: string): string {
  const labels: string[] = []
  const collect = (nodes: ReturnType<typeof legacyCompile>['compiledRootNodes']) => nodes.forEach(node => {
    if (node.sourceGoalId === goalId) labels.push(node.label)
    collect(node.children)
  })
  const compiled = legacyCompile(value, view)
  assert.deepEqual(compiled.findings.filter(finding => finding.severity === 'error'), [])
  collect(compiled.compiledRootNodes)
  assert.equal(labels.length, 1)
  return labels[0]
}
for (const [label, converges] of [['first', false], ['Actual competency', true]] as const) {
  const value = independentProfileFixture()
  value.goals.get('first')!.title = 'Actual competency'
  Object.assign(value.lk.rootNodes[0].children[0], { displayLabel: label })
  assert.equal(nativeGoalLabel(value, value.full as unknown as CompositionView, 'first'), 'Actual competency')
  assert.equal(nativeGoalLabel(value, value.lk as unknown as CompositionView, 'first'), label)
  const checked = validateStagePlanCatalog(independentCatalog(value))
  assert.equal(checked.findings.some(finding => finding.code === 'SP-CONVERGENCE'), !converges,
    'Convergence compares actual native labels, never substitutes canonical identity for the title.')
  if (converges) assert.deepEqual(checked.findings, [])
  else { assert.equal(checked.viewsById.size, 0); negativeCases++ }
}
const missingTitle = independentProfileFixture()
delete missingTitle.goals.get('first')!.title
const missingTitleResult = validateStagePlanCatalog(independentCatalog(missingTitle))
assert(missingTitleResult.findings.some(finding => finding.code === 'SP-LABEL'), 'An unresolved default title cannot prove multiauthority label convergence.')
assert.equal(missingTitleResult.viewsById.size, 0)
negativeCases++
for (const label of ['', '   ', '\t\n', ' Actual competency ']) {
  const value = independentProfileFixture()
  value.goals.get('first')!.title = 'Actual competency'
  Object.assign(value.lk.rootNodes[0].children[0], { displayLabel: label })
  assert.equal(nativeGoalLabel(value, value.lk as unknown as CompositionView, 'first'), 'Actual competency', 'The native compiler trims a label and falls back for empty/whitespace strings.')
  assert.equal(viewSchema(value.lk), false, 'The candidate source keeps its stricter nonblank, trimmed-label contract.')
  const checked = validateStagePlanCatalog(independentCatalog(value))
  assert(checked.findings.some(finding => finding.code === 'SP-SHAPE'))
  assert.equal(checked.viewsById.size, 0)
  negativeCases++
}
const reverseSources = independentProfileFixture(); reverseSources.neutral.planBinding.excerptOfViewIds.reverse()
assert.deepEqual(validateStagePlanCatalog(independentCatalog(reverseSources)).viewsById.get(reverseSources.neutral.viewId)!.rootNodes,
  independentResult.viewsById.get(independent.neutral.viewId)!.rootNodes, 'Only validated convergence, never listed source order, determines the common tree.')
function rejectsIndependent(name: string, modify: (value: ReturnType<typeof independentProfileFixture>) => void, code: string) {
  const value = independentProfileFixture(); modify(value)
  const checked = validateStagePlanCatalog(independentCatalog(value))
  assert(checked.findings.some(finding => finding.code === code), `${name}: ${JSON.stringify(checked.findings)}`)
  assert.equal(checked.viewsById.size, 0)
  negativeCases++
}
rejectsIndependent('cannot choose only GK', value => { value.neutral.planBinding.excerptOfViewIds.pop() }, 'SP-EXCERPT')
rejectsIndependent('cannot duplicate GK to simulate two profiles', value => { value.neutral.planBinding.excerptOfViewIds[1] = value.full.viewId }, 'SP-DUPLICATE')
rejectsIndependent('unknown source', value => { value.neutral.planBinding.excerptOfViewIds[1] = 'missing-lk-source' }, 'SP-EXCERPT')
rejectsIndependent('independent scope cannot name a preferred profile', value => { Object.assign(value.neutral.scope, { courseProfile: 'GK' }) }, 'SP-EXCERPT')
rejectsIndependent('selected target sets must converge', value => {
  value.lk.rootNodes[0].children.push({ kind: 'goalEntry', goalId: 'only-lk-first' } as typeof value.lk.rootNodes[0]['children'][number])
  value.goals.set('only-lk-first', { id: 'only-lk-first' })
}, 'SP-CONVERGENCE')
rejectsIndependent('selected stage presentation must converge', value => { value.lk.rootNodes[0].label = 'Different common-stage meaning' }, 'SP-CONVERGENCE')
rejectsIndependent('must include every declared course authority', value => {
  const third = structuredClone(value.full); third.viewId = 'third-course'; third.scope.courseProfile = 'GK+LK'
  value.plan.subjectViews.push({ landscapeId: 'physics', courseProfile: 'GK+LK', viewId: third.viewId })
  value.extraAuthorities.push(third)
}, 'SP-EXCERPT')
rejectsIndependent('cannot mix single and independent source declarations', value => {
  Object.assign(value.neutral.planBinding, { excerptOfViewId: value.full.viewId })
}, 'SP-EXCERPT')

// Exercise the simultaneous omission of duration AND course profile too.
const combined = sharedDurationFixture(), combinedLk = structuredClone(combined.physics)
combinedLk.viewId = 'shared-physics-lk'; combinedLk.scope.courseProfile = 'LK'
for (const plan of [combined.g8, combined.g9]) plan.subjectViews.push({ landscapeId: 'physics', courseProfile: 'LK', viewId: combinedLk.viewId })
const combinedExcerpt = { ...physicsUpper, viewId: 'shared-physics-first-no-course',
  scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekI' },
  planBinding: { planIds: [combined.g8.planId, combined.g9.planId], excerptOfViewIds: [combined.physics.viewId, combinedLk.viewId], unitIds: [combined.g8.units[0].id] },
}
assert(viewSchema(combinedExcerpt), JSON.stringify(viewSchema.errors))
const combinedResult = validateStagePlanCatalog({ ...sharedCatalog(combined), views: [...sharedCatalog(combined).views, combinedLk, combinedExcerpt] })
assert.deepEqual(combinedResult.findings, [])
assert.deepEqual(combinedResult.viewsById.get(combinedExcerpt.viewId)!.scope, combinedExcerpt.scope)

// Scope evidence from the actual offering inventory. These assertions do not
// assign new durations or courses to any Land or author real goal placements.
const compositionRoot = new URL('../../curricula/DE/Gymnasium/composition-views/', import.meta.url)
const inventory = (subject: string) => readdirSync(new URL(`${subject}/`, compositionRoot)).filter(name => name.endsWith('.view.json'))
  .map(name => JSON.parse(readFileSync(new URL(`${subject}/${name}`, compositionRoot), 'utf8')) as { viewId: string; landscapeId: string; scope: Record<string, string> })
const mathNeutral = inventory('mathematik').filter(view => ['DE-HE', 'DE-RP', 'DE-SH'].includes(view.scope.jurisdiction)
  && view.scope.stage === 'SekI' && ['G8', 'G9'].includes(view.scope.durationModel) && view.scope.courseProfile === undefined)
assert.equal(mathNeutral.length, 6, 'Six actual duration-specific Mathematics SekI offerings omit a course profile.')
for (const existing of mathNeutral) {
  const value = independentProfileFixture()
  Object.assign(value.plan.scope, { jurisdiction: existing.scope.jurisdiction, durationModel: existing.scope.durationModel })
  for (const source of [value.full, value.lk]) Object.assign(source.scope, value.plan.scope)
  value.neutral.scope = { ...existing.scope } as typeof value.neutral.scope
  value.neutral.viewId = existing.viewId
  const checked = validateStagePlanCatalog(independentCatalog(value))
  assert.deepEqual(checked.findings, [], existing.viewId)
  assert.deepEqual(checked.viewsById.get(existing.viewId)!.scope, existing.scope)
}
const physicsNeutral = inventory('physik').filter(view => /^DE-[A-Z]{2}$/u.test(view.scope.jurisdiction ?? '') && view.scope.stage === 'SekII')
assert.equal(physicsNeutral.length, 32, 'All 32 Land Physics upper offerings omit duration and need explicit shared-context support.')
assert(physicsNeutral.every(view => view.scope.durationModel === undefined && ['GK', 'LK'].includes(view.scope.courseProfile)))

// prerequisiteOnly is authored under SekII above, but its checked first need is
// SekI. Both it and its transitive prerequisite get preparation placements.
const preparations = deriveStagePlanPreparation(valid.plan, result.placementsByViewId.get(valid.full.viewId)!, valid.goals)
assert.deepEqual(preparations.findings, [])
assert.deepEqual(preparations.preparations, [
  { goalId: 'support', planUnitId: valid.plan.units[0].id, witnessPath: ['first', 'support'] },
  { goalId: 'foundation', planUnitId: valid.plan.units[0].id, witnessPath: ['first', 'support', 'foundation'] },
])
const reversedInput = deriveStagePlanPreparation(valid.plan, new Map([...result.placementsByViewId.get(valid.full.viewId)!].reverse()), valid.goals)
assert.deepEqual(reversedInput.preparations.sort((a, b) => a.goalId.localeCompare(b.goalId)), [...preparations.preparations].sort((a, b) => a.goalId.localeCompare(b.goalId)), 'First need is independent of iteration order.')
assert.equal(preparations.preparations.some(item => 'sourceStage' in item), false, 'Closure never creates official source claims.')
const backflowGoals = new Map(valid.goals)
backflowGoals.set('first', { id: 'first', requires: ['later'] })
backflowGoals.set('later', { id: 'later' })
assert(deriveStagePlanPreparation(valid.plan, result.placementsByViewId.get(valid.full.viewId)!, backflowGoals).findings.some(finding => finding.code === 'SP-BACKFLOW'))
const brokenGoals = new Map(valid.goals); brokenGoals.delete('support')
const broken = deriveStagePlanPreparation(valid.plan, result.placementsByViewId.get(valid.full.viewId)!, brokenGoals)
assert(broken.findings.some(finding => finding.code === 'SP-GRAPH'))
assert.deepEqual(broken.preparations, [], 'An incomplete graph cannot claim a learning basis.')
const brokenTransitiveGoals = new Map(valid.goals); brokenTransitiveGoals.delete('foundation')
const brokenTransitive = deriveStagePlanPreparation(valid.plan, result.placementsByViewId.get(valid.full.viewId)!, brokenTransitiveGoals)
assert(brokenTransitive.findings.some(finding => finding.code === 'SP-GRAPH' && finding.path === 'foundation'))
assert.deepEqual(brokenTransitive.preparations, [], 'Missing transitive prerequisite references also prevent a learning-basis claim.')
const wrongQualifierGoals = new Map(valid.goals); wrongQualifierGoals.set('support', { id: 'support', requires: ['wrong-landscape:foundation'] })
const wrongQualifier = deriveStagePlanPreparation(valid.plan, result.placementsByViewId.get(valid.full.viewId)!, wrongQualifierGoals)
assert(wrongQualifier.findings.some(finding => finding.code === 'SP-GRAPH' && finding.path === 'wrong-landscape:foundation'))
assert.deepEqual(wrongQualifier.preparations, [], 'Wrong qualifier on a transitive prerequisite must fail despite a matching bare suffix.')
const cyclicGoals = new Map(valid.goals); cyclicGoals.set('foundation', { id: 'foundation', requires: ['support'] })
assert.deepEqual(deriveStagePlanPreparation(valid.plan, result.placementsByViewId.get(valid.full.viewId)!, cyclicGoals).preparations, [])

// Legacy 1.0 remains usable and cannot accidentally acquire plan semantics.
const legacy = { viewId: 'old', landscapeId: 'physics', scope: { schoolForm: 'Gymnasium' }, rootNodes: [] }
assert.equal(validateStagePlanCatalog({ plans: [], views: [legacy], goals: new Map() }).viewsById.get('old'), legacy)
assert(validateStagePlanCatalog({ plans: [], views: [{ ...legacy, viewFormatVersion: '9.0' }], goals: new Map() }).findings.some(finding => finding.code === 'SP-SHAPE'), 'Unknown versions cannot silently become legacy views.')
for (const malformed of [null, {}, { ...valid.plan, units: [null] }, { ...valid.plan, subjectViews: [null] }]) {
  const checked = validateStagePlanCatalog({ plans: [malformed], views: [valid.full], goals: valid.goals })
  assert(checked.findings.length)
  assert.equal(checked.viewsById.size, 0)
}

console.log(`Stage-plan candidate contracts passed: authority/excerpt materialization, source/placement separation, first-need preparation and ${negativeCases} negative cases.`)

// The same required contract gate also exercises nested materialization and diagnosis.
await import('./testNestedStagePlans')
