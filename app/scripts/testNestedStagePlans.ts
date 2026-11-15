// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { createHash } from 'node:crypto'
import Ajv2020 from 'ajv/dist/2020.js'
import { deriveStagePlanPreparation, getStagePlanStructureMetadata, validateStagePlanCatalog } from '../src/utils/stagePlan'
import { diagnoseStagePlanLearningFlow } from '../src/utils/stagePlanReport'
import { stagePlanLeafOrder } from '../src/utils/stagePlanHierarchy'
import { nestedStagePlanFixture, NESTED_MATH, NESTED_PHYSICS } from './fixtures/nestedStagePlan'
import { buildStagePlanMaterializationForTest, applyStagePlanMaterialization, STAGE_PLAN_CATALOG_PATH, STAGE_PLAN_CATALOG_SCHEMA, STAGE_PLAN_DIRECTORY } from './lib/stagePlanCatalog'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, type CompositionStructureNode } from '../src/utils/authoring/compositionViewAuthoring'
import type { CurrentCatalogEntry } from './currentCurriculumCatalog'
import { prepareLandscapeEntries } from '../src/hooks/useLandscapes'
import type { SkillLandscape } from '../src/landscapeTypes'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { normalizeLearnerProjectedEntries, collapseLearnerSubjectRoots } from '../src/utils/learnerTreeProjection'
import { buildDirectChildrenMap } from '../src/utils/treeProjectionRuntime'
import { deriveLearnerUnitMapPreview, resolveLearnerStagePlanContext } from '../src/components/learningUnitMap/learnerUnitMapPreview'
import { buildLearnerUnitMapProjection } from '../src/components/learningUnitMap/learnerUnitMapProjection'


const input = nestedStagePlanFixture()
const asCatalog = (f = input) => ({ plans: [f.plan], views: [...f.views, f.excerpt], goals: f.goals })
const ajv = new Ajv2020({ strict: false, allErrors: true })
const schema = ajv.compile(JSON.parse(readFileSync(new URL('../../contracts/curriculum-package/v1.3/stage-plan.schema.json', import.meta.url), 'utf8')))
assert(schema(input.plan), JSON.stringify(schema.errors))
const original = JSON.stringify(asCatalog())
const accepted = validateStagePlanCatalog(asCatalog())
assert.deepEqual(accepted.findings, [])
const math = input.views.find(view => view.landscapeId === NESTED_MATH)!
const placed = accepted.placementsByViewId.get(math.viewId)!
assert.deepEqual([...placed], Object.entries(input.own).filter(([id]) => id.startsWith('m')))
assert.deepEqual([...stagePlanLeafOrder(input.plan).keys()], ['y5', 'y6', 'e', 'q1', 'q2', 'q3', 'q4'])
assert.deepEqual([...accepted.placementsByViewId.get(input.excerpt.viewId)!], [['m5', 'y5'], ['m6', 'y6']], 'A stage excerpt carries its nested placements, not a copy at the parent stage.')
assert.deepEqual(getStagePlanStructureMetadata(input.plan, (math.rootNodes[0] as CompositionStructureNode).children[1]), {
  planId: input.plan.planId, planUnitId: 'y6', stage: 'SekI', after: ['y5'], kind: 'year', parentUnitId: 'lower', year: 6,
})
const diagnosis = diagnoseStagePlanLearningFlow(asCatalog())
assert.equal(diagnosis.status, 'no-stage-backflows')
assert.equal(diagnosis.scopes.length, 4)
for (const scope of diagnosis.scopes) {
  assert.deepEqual(scope.preparation.map(p => [p.goalId, p.planUnitId]), [['bridge', 'y6'], ['foundation', 'y6']])
  assert.equal(scope.units.find(unit => unit.id === 'lower')!.targetCount, 3)
  assert.equal(scope.units.find(unit => unit.id === 'lower')!.preparationCount, 2)
  assert.equal(scope.units.find(unit => unit.id === 'y5')!.targetCount, 1)
  assert.equal(scope.units.length, 9)
}
assert.equal(JSON.stringify(asCatalog()), original, 'Preparation and reporting never rewrite authored declarations.')
let negatives = 0
const rejects = (name: string, edit: (f: ReturnType<typeof nestedStagePlanFixture>) => void, code: string) => {
  const f = nestedStagePlanFixture(); edit(f)
  const checked = validateStagePlanCatalog(asCatalog(f))
  assert(checked.findings.some(finding => finding.code === code), `${name}: ${JSON.stringify(checked.findings)}`)
  assert.equal(checked.viewsById.size, 0); assert.equal(checked.placementsByViewId.size, 0); negatives++
}
rejects('missing parent membership', f => { f.plan.units[0].children!.pop() }, 'SP-REF')
rejects('wrong parent', f => { f.plan.units.find(u => u.id === 'y6')!.parentUnitId = 'upper' }, 'SP-REF')
rejects('missing explicit sibling order', f => { f.plan.units.find(u => u.id === 'y6')!.after = [] }, 'SP-ORDER')
rejects('backward year order', f => { f.plan.units[0].children!.reverse() }, 'SP-ORDER')
rejects('same year twice', f => { f.plan.units.find(u => u.id === 'y6')!.year = 5 }, 'SP-ORDER')
rejects('cycle among years', f => { f.plan.units.find(u => u.id === 'y5')!.after = ['y6'] }, 'SP-CYCLE')
rejects('cross-parent after', f => { f.plan.units.find(u => u.id === 'q1')!.after = ['y6'] }, 'SP-REF')
rejects('wrong stage kind', f => { f.plan.units.find(u => u.id === 'q1')!.kind = 'year' }, 'SP-SHAPE')
rejects('missing year basis', f => { delete f.plan.units.find(u => u.id === 'y5')!.basis }, 'SP-SOURCE')
rejects('empty evidence', f => { f.plan.units.find(u => u.id === 'q2')!.basis!.references = [] }, 'SP-SOURCE')
const yearNode = (f: ReturnType<typeof nestedStagePlanFixture>) => ((f.views[0].rootNodes[0] as CompositionStructureNode).children[0] as CompositionStructureNode)
rejects('nested canonical default is not a free relocation', f => { yearNode(f).children[0].placementBasis = { kind: 'canonicalDefault', canonicalPhase: 'J9' } }, 'SP-SOURCE')
rejects('missing nested placement basis', f => { delete yearNode(f).children[0].placementBasis }, 'SP-SOURCE')
rejects('unsupported official year claim', f => { yearNode(f).children[0].placementBasis = { kind: 'officialSource', sourceStage: 'SekI', sourceUnitId: 'y6', references: ['fixture'] } }, 'SP-SOURCE')
rejects('missing declared child in a subject', f => { (f.views[0].rootNodes[0] as CompositionStructureNode).children.pop() }, 'SP-ROOT')
rejects('view contradicts plan order', f => { (f.views[0].rootNodes[0] as CompositionStructureNode).children.reverse() }, 'SP-ORDER')
rejects('aggregate placement cannot guess a year', f => { (f.views[0].rootNodes[0] as CompositionStructureNode).children.push({ kind: 'goalEntry', goalId: 'foundation' }) }, 'SP-PLACEMENT')
rejects('two own places for one target', f => { ((f.views[0].rootNodes[0] as CompositionStructureNode).children[1] as CompositionStructureNode).children.push(structuredClone(yearNode(f).children[0])) }, 'SP-PLACEMENT')
const withinYear = nestedStagePlanFixture()
withinYear.goals.get('m6')!.requires = ['bridge']; withinYear.goals.get('m5')!.requires = ['m6']
const yearReport = diagnoseStagePlanLearningFlow(asCatalog(withinYear))
assert.equal(yearReport.status, 'backflows-present')
assert(yearReport.scopes.every(scope => scope.directBackflows.some(flow => flow.fromUnitId === 'y5' && flow.requiredUnitId === 'y6')), 'Same-stage year backflows are real findings, not hidden by their shared stage.')
const withinPhase = nestedStagePlanFixture()
withinPhase.goals.get('mq1')!.requires = []; withinPhase.goals.get('me')!.requires = ['mq3']
const phaseReport = diagnoseStagePlanLearningFlow(asCatalog(withinPhase))
assert.equal(phaseReport.status, 'backflows-present')
assert(phaseReport.scopes.every(scope => scope.directBackflows.some(flow => flow.fromUnitId === 'e' && flow.requiredUnitId === 'q3')))
const early = nestedStagePlanFixture()
early.goals.get('me')!.requires = ['bridge']; early.goals.get('m6')!.requires = ['m5', 'bridge']
assert.equal(deriveStagePlanPreparation(early.plan, accepted.placementsByViewId.get(math.viewId)!, early.goals).preparations.find(p => p.goalId === 'bridge')!.planUnitId, 'y6')

// Actual materializer -> v1 legacy compilation -> recursively bound index.
const root = mkdtempSync(join(tmpdir(), 'skillpilot-nested-plan-'))
try {
  const write = (path: string, value: unknown) => { const file = join(root, path); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(value)) }
  const canonicalEntries = [NESTED_MATH, NESTED_PHYSICS].map(landscapeId => {
    const goals = [...new Map([...input.goals].filter(([key]) => key.startsWith(`${landscapeId}:`)).map(([, goal]) => [goal.id, goal])).values()]
    const completeGoals = goals.map(goal => ({ ...goal, title: goal.title ?? goal.id, description: 'Isolated contract fixture', tags: [],
      contains: [...goal.contains ?? []], requires: [...goal.requires ?? []], weight: 1, core: true,
      dimensionTags: { phase: 'GLOBAL', framework: 'isolated-fixture', demandLevel: 'AB2', processCompetencies: [], guidingIdeas: [] } }))
    const landscape = { landscapeId, title: landscapeId, subject: landscapeId === NESTED_MATH ? 'Mathematik' : 'Physik', goals: [
      { id: `${landscapeId}-root`, title: 'Subject root', description: 'Fixture root', type: 'cluster', tags: ['root'], contains: goals.map(goal => goal.id), requires: [] }, ...completeGoals] }
    const path = `curricula/DE/Gymnasium/canonical/${landscapeId}.json`; write(path, landscape)
    return { path, landscape }
  }) as CurrentCatalogEntry[]
  const allViews = [...input.views, input.excerpt]
  const catalog = { $schema: STAGE_PLAN_CATALOG_SCHEMA, catalogFormatVersion: '1.0', revision: 'nested-fixture-only',
    plans: [{ planId: input.plan.planId, path: `${STAGE_PLAN_DIRECTORY}/plans/fixture.json` }],
    views: allViews.map(view => ({ viewId: view.viewId, path: `${STAGE_PLAN_DIRECTORY}/views/${view.viewId}.json`, outputPath: `curricula/DE/Gymnasium/composition-views/fixture/${view.viewId}.view.json` })) }
  write(STAGE_PLAN_CATALOG_PATH, catalog); write(catalog.plans[0].path, input.plan)
  allViews.forEach((view, i) => write(catalog.views[i].path, view))
  write('activation.json', { planIds: [input.plan.planId], views: catalog.views.map(({ viewId, outputPath }) => ({ viewId, outputPath })) })
  const options = { repositoryRoot: root, inventoryPath: 'activation.json', canonicalEntries }
  const generated = buildStagePlanMaterializationForTest(options)
  assert.equal(generated.index.views.find(v => v.viewId === math.viewId)!.structureBindings.length, 9)
  assert.equal(generated.index.views.find(v => v.viewId === 'math-lower')!.structureBindings.length, 3)
  assert(generated.index.views.find(v => v.viewId === math.viewId)!.structureBindings.some(binding => binding.kind === 'phase' && binding.phase === 'Q4' && binding.parentUnitId === 'upper'))
  const neutral = generated.index.views.find(v => v.viewId === 'math-lower')!
  assert.deepEqual(neutral.placements.map(p => p.planUnitId), ['y5', 'y6'])
  applyStagePlanMaterialization(root, generated, 'write'); applyStagePlanMaterialization(root, generated, 'check')
  assert.deepEqual([...buildStagePlanMaterializationForTest(options).artifacts], [...generated.artifacts])
  const legacy = JSON.parse(generated.artifacts.get(catalog.views[0].outputPath)!)
  assert(!JSON.stringify(legacy).includes('planUnitId'), 'Old runtime contract remains v1; the recursive v1.3 index carries declared identity.')
  const landscapes = new Map(canonicalEntries.map(entry => [entry.landscape.landscapeId, normalizeCanonicalLandscape(entry.landscape)]))
  const universe = normalizeCanonicalLandscape({ landscapeId: 'universe', title: 'Universe', goals: [...landscapes.values()].flatMap(l => l.goals) })
  assert.deepEqual(compileCompositionView(legacy, landscapes.get(legacy.landscapeId)!, universe, landscapes).findings.filter(f => f.severity === 'error'), [])
  const projectMap = (result: typeof generated, runtimeMetadata = false, legacyLandscapeIds = new Set<string>()) => {
    const sources = prepareLandscapeEntries(canonicalEntries.map(entry => entry.landscape) as unknown as SkillLandscape[])
    let projected = sources
    for (const source of result.index.views.filter(view => view.scope.stage === 'CrossStage' && view.scope.courseProfile === 'GK')) {
      const payload = JSON.parse(result.artifacts.get(source.artifact.path)!)
      if (runtimeMetadata && !legacyLandscapeIds.has(source.landscapeId)) payload.stagePlanProjection = { plan: result.index.plans[0].plan, views: [source],
        indexSource: { path: 'curricula/DE/Gymnasium/stage-plans/generated/index.json',
          sha256: `sha256:${createHash('sha256').update(JSON.stringify(result.index)).digest('hex')}` } }
      projected = applyCompositionViewProjection(projected, payload)
    }
    projected = projected.map(entry => normalizeLearnerProjectedEntries([entry])[0] ?? entry)
    const goalIndexAll = new Map(projected.flatMap(entry => entry.goals).map(goal => [goal.id, goal]))
    const { childrenByParent: visibleChildrenByParent } = collapseLearnerSubjectRoots(goalIndexAll, buildDirectChildrenMap(goalIndexAll))
    const rootGoals = [...goalIndexAll.values()].filter(goal => goal.tags.includes('root'))
    const visibleGoalIds = new Set<string>()
    const visit = (id: string) => { if (visibleGoalIds.has(id)) return; visibleGoalIds.add(id); (visibleChildrenByParent.get(id) ?? []).forEach(visit) }
    rootGoals.forEach(goal => visit(goal.id))
    const input = { rootGoals, goalIndexAll, visibleGoalIds, visibleChildrenByParent, landscapeSources: sources,
      canonicalGoalIndexAll: new Map(sources.flatMap(entry => entry.goals).map(goal => [goal.id, goal])),
      stagePlanContext: runtimeMetadata ? undefined : { plan: result.index.plans[0].plan, views: result.index.views } }
    const preview = deriveLearnerUnitMapPreview(input)
    assert.equal(preview.maxStep, 2, 'Only explicitly indexed stages and temporal children count; arbitrary sections never become a second hierarchy.')
    const map = buildLearnerUnitMapProjection({ ...input, units: preview.units, after: preview.after })
    return { input, preview, map }
  }
  const displayed = projectMap(generated), key = (id: string) => `plan:${input.plan.planId}:${id}`
  const entry = (id: string) => displayed.map.unitEntryIds[key(id)]
  assert.deepEqual(displayed.map.entries[displayed.map.rootId].children, [entry('lower'), entry('upper')])
  assert.deepEqual(displayed.map.entries[entry('lower')].children, ['y5', 'y6'].map(entry), 'The actual learner projection exposes years inside SekI.')
  assert.deepEqual(displayed.map.entries[entry('upper')].children, ['e', 'q1', 'q2', 'q3', 'q4'].map(entry), 'E and Q1–Q4 are actual child units inside SekII.')
  assert.equal(displayed.map.entries[entry('y5')].title, 'Jahrgangsstufe 5', 'Labels come from the shared plan, not source-local headings.')
  assert.deepEqual(displayed.map.entries[entry('lower')].subjects, [NESTED_MATH, NESTED_PHYSICS])
  assert.deepEqual(displayed.map.findings, [])
  const transported = projectMap(generated, true)
  assert.deepEqual(transported.map.unitEntryIds, displayed.map.unitEntryIds, 'The actual composition adapter transports runtime index metadata; the map needs no hand-injected plan context.')
  assert.deepEqual(transported.map.scopeRelations, displayed.map.scopeRelations)
  const legacyDisplay = projectMap(generated, true, new Set([NESTED_MATH, NESTED_PHYSICS]))
  const mixedDisplay = projectMap(generated, true, new Set([NESTED_MATH]))
  const mathUnits = (display: typeof displayed) => [...display.preview.units]
    .filter(([id]) => display.input.goalIndexAll.get(id)?.landscapeId === NESTED_MATH)
    .map(([id, identity]) => [id, identity] as const)
  assert.equal(mathUnits(legacyDisplay).length, 9)
  assert.deepEqual(mathUnits(mixedDisplay), mathUnits(legacyDisplay),
    'A bound Physics contribution preserves every unbound Mathematics stage/year/phase preview and its legacy identity.')
  const legacyMathKeys = new Set(mathUnits(legacyDisplay).map(([, identity]) => identity.key))
  assert.deepEqual(mixedDisplay.preview.after.filter(edge => legacyMathKeys.has(edge.unit) || legacyMathKeys.has(edge.after)),
    legacyDisplay.preview.after.filter(edge => legacyMathKeys.has(edge.unit) || legacyMathKeys.has(edge.after)),
    'Unbound sibling order remains unchanged beside a declared contribution.')
  assert(mixedDisplay.preview.after.some(edge => edge.unit === key('upper') && edge.after === key('lower')),
    'The bound contribution keeps its declared stage order.')
  assert(mixedDisplay.preview.after.every(edge => edge.unit.startsWith('plan:') === edge.after.startsWith('plan:')),
    'The mixed map never fabricates an order between declared and unbound units.')
  const mixedMathGoalPath = mixedDisplay.map.entryPaths?.m5 ?? []
  const legacyMathGoalPath = legacyDisplay.map.entryPaths?.m5 ?? []
  assert.deepEqual(mixedMathGoalPath, legacyMathGoalPath,
    'The unbound atomic goal stays inside its actual legacy unit path instead of becoming detached.')
  assert(mixedMathGoalPath.length >= 3)
  const boundPhysicsKeys = [...mixedDisplay.preview.units].filter(([id]) => mixedDisplay.input.goalIndexAll.get(id)?.landscapeId === NESTED_PHYSICS)
    .map(([, identity]) => identity.key)
  assert(boundPhysicsKeys.every(unit => unit.startsWith(`plan:${input.plan.planId}:`)), 'Bound identities remain declared plan identities.')
  const runtimeGoal = [...transported.input.goalIndexAll.values()].find(goal => goal.extendedData?.stagePlanProjection)!
  const malformedGoals = new Map(transported.input.goalIndexAll)
  malformedGoals.set(runtimeGoal.id, { ...runtimeGoal, extendedData: { ...runtimeGoal.extendedData, stagePlanProjection: { plan: input.plan } } })
  assert.throws(() => resolveLearnerStagePlanContext(malformedGoals), /verified runtime stage-plan authority/)
  const mixedGoals = new Map(transported.input.goalIndexAll)
  const changedEpoch = structuredClone(runtimeGoal.extendedData!.stagePlanProjection) as { indexSource: { sha256: string } }
  changedEpoch.indexSource.sha256 = `sha256:${'0'.repeat(64)}`
  mixedGoals.set(runtimeGoal.id, { ...runtimeGoal, extendedData: { ...runtimeGoal.extendedData, stagePlanProjection: changedEpoch } })
  assert.throws(() => resolveLearnerStagePlanContext(mixedGoals), /Mixed runtime stage-plan index epochs/)
  assert.equal(deriveLearnerUnitMapPreview(displayed.input, 1).units.size, 4, 'Both subjects share the two outer plan identities at step1.')
  // An actual changed prerequisite remains a red backward arrow at the root.
  const mathSource = canonicalEntries.find(entry => entry.landscape.landscapeId === NESTED_MATH)!
  mathSource.landscape.goals.find(goal => goal.id === 'm6')!.requires = ['bridge']
  mathSource.landscape.goals.find(goal => goal.id === 'm5')!.requires = ['mq2']
  write(mathSource.path, mathSource.landscape)
  const withBackflow = projectMap(buildStagePlanMaterializationForTest(options)).map
  assert(withBackflow.scopeRelations?.[withBackflow.rootId]?.some(relation => relation.backward
    && relation.provenance.some(witness => witness.dependentGoalId === 'm5' && witness.requiredGoalId === 'mq2')),
  'Declaring shared nested units must not hide a real backward atomic demand.')

} finally { rmSync(root, { recursive: true, force: true }) }
console.log(`Nested v1.3 stage/year/phase integration passed: 9 explicit units, recursive native materialization, first-need preparation, same-stage year/phase backflows and ${negatives} invalid plans. Fixture only; no real plan activated.`)
