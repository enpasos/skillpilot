// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import {
  applyStagePlanMaterialization, buildStagePlanMaterialization, buildStagePlanMaterializationForTest,
  COMPOSITION_VIEW_DIRECTORY, LEGACY_COMPOSITION_SCHEMA, resolveStagePlanPath,
  STAGE_PLAN_CATALOG_PATH, STAGE_PLAN_CATALOG_SCHEMA, STAGE_PLAN_DIRECTORY, STAGE_PLAN_INDEX_PATH,
  type StagePlanActivationInventory, type StagePlanFileCatalog,
} from './lib/stagePlanCatalog'
import { generateStagePlanViews } from './generateStagePlanViews'
import { reportStagePlanLearningFlow } from './reportStagePlanLearningFlow'
import type { CurrentCatalogEntry } from './currentCurriculumCatalog'
import { compileCompositionView, type CompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'
import { PLAN_COMPOSITION_SCHEMA, STAGE_PLAN_SCHEMA, type StagePlan } from '../src/utils/stagePlan'

const temporary = mkdtempSync(resolve(tmpdir(), 'skillpilot-stage-plan-materialization-'))
let fixtures = 0, negatives = 0
function fixture() {
  const root = resolve(temporary, `fixture-${fixtures++}`)
  mkdirSync(root)
  const write = (path: string, value: unknown) => {
    const absolute = resolve(root, path)
    mkdirSync(dirname(absolute), { recursive: true })
    writeFileSync(absolute, `${JSON.stringify(value, null, 2)}\n`)
  }
  const canonicalEntries: CurrentCatalogEntry[] = [
    { path: 'curricula/DE/Gymnasium/canonical/physics.json', landscape: { landscapeId: 'physics', goals: [
      { id: 'first', title: 'Goal 1', requires: ['math:support'], type: 'atomic' },
      { id: 'later', title: 'Goal 2', requires: ['first'], type: 'atomic' },
      { id: 'physics-root', title: 'Goal 3', type: 'cluster', contains: ['first', 'later'] },
    ] } },
    { path: 'curricula/DE/Gymnasium/canonical/math.json', landscape: { landscapeId: 'math', goals: [
      { id: 'support', title: 'Goal 1', type: 'atomic' }, { id: 'math-root', title: 'Goal 2', type: 'cluster', contains: ['support'] },
    ] } },
  ]
  canonicalEntries.forEach(entry => write(entry.path, entry.landscape))
  const g9: StagePlan = { $schema: STAGE_PLAN_SCHEMA, planFormatVersion: '1.0', planId: 'he-g9',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', durationModel: 'G9' },
    rootUnit: { id: 'root-g9', label: 'Hessen', children: ['explicit-first-unit', 'explicit-later-unit'] },
    units: [
      { id: 'explicit-first-unit', label: 'Arbitrary first label', kind: 'stage', stage: 'SekI', parentUnitId: 'root-g9', after: [] },
      { id: 'explicit-later-unit', label: 'Arbitrary second label', kind: 'stage', stage: 'SekII', parentUnitId: 'root-g9', after: ['explicit-first-unit'] },
    ],
    subjectViews: [{ landscapeId: 'physics', courseProfile: 'GK', viewId: 'physics-gk' }, { landscapeId: 'physics', courseProfile: 'LK', viewId: 'physics-lk' }],
  }
  const g8 = structuredClone(g9)
  g8.planId = 'he-g8'; g8.scope.durationModel = 'G8'; g8.rootUnit.id = 'root-g8'
  g8.units.forEach(unit => { unit.parentUnitId = 'root-g8' })
  const full = { $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: 'physics-gk', landscapeId: 'physics', language: 'de',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', courseProfile: 'GK', stage: 'CrossStage' },
    planBinding: { planIds: ['he-g9', 'he-g8'] },
    rootNodes: [
      { kind: 'structure', id: 'unrelated-root-one', label: 'First arbitrary heading', planUnitId: 'explicit-first-unit', children: [
        { kind: 'canonicalSubtree', goalId: 'physics:first', placementBasis: { kind: 'reviewedPreparation', sourceStage: 'SekII', references: ['retained review: §4'], rationale: 'Early preparation, distinct from the official source stage.' } },
        { kind: 'goalEntry', goalId: 'math:support', projectionRole: 'prerequisiteOnly' },
      ] },
      { kind: 'structure', id: 'unrelated-root-two', label: 'Second arbitrary heading', planUnitId: 'explicit-later-unit', children: [
        { kind: 'goalEntry', goalId: 'later', placementBasis: { kind: 'canonicalDefault', canonicalPhase: 'Q4' } },
      ] },
    ],
  }
  const lk = structuredClone(full)
  lk.viewId = 'physics-lk'; lk.scope.courseProfile = 'LK'; lk.rootNodes[0].id = 'source-local-lk-structure'
  const excerpt = { $schema: PLAN_COMPOSITION_SCHEMA, viewFormatVersion: '1.1', viewId: 'physics-first', landscapeId: 'physics', language: 'de',
    scope: { schoolForm: 'Gymnasium', jurisdiction: 'DE-HE', stage: 'SekI' },
    planBinding: { planIds: ['he-g8', 'he-g9'], excerptOfViewIds: ['physics-lk', 'physics-gk'], unitIds: ['explicit-first-unit'] },
  }
  const planPath = (id: string) => `${STAGE_PLAN_DIRECTORY}/plans/${id}.json`
  const viewPath = (id: string) => `${STAGE_PLAN_DIRECTORY}/views/physik/${id}.json`
  const outputPath = (id: string) => `${COMPOSITION_VIEW_DIRECTORY}/physik/${id}.view.json`
  const catalog: StagePlanFileCatalog = { $schema: STAGE_PLAN_CATALOG_SCHEMA, catalogFormatVersion: '1.0', revision: 'foundation-fixture-1',
    plans: [g9, g8].map(plan => ({ planId: plan.planId, path: planPath(plan.planId) })),
    views: [full, lk, excerpt].map(view => ({ viewId: view.viewId, path: viewPath(view.viewId), outputPath: outputPath(view.viewId) })),
  }
  const inventory: StagePlanActivationInventory = { planIds: ['he-g8', 'he-g9'], views: catalog.views.map(({ viewId, outputPath }) => ({ viewId, outputPath })) }
  const save = () => {
    write(STAGE_PLAN_CATALOG_PATH, catalog)
    write('activation.json', inventory)
    ;[g9, g8].forEach(plan => write(planPath(plan.planId), plan))
    ;[full, lk, excerpt].forEach(view => write(viewPath(view.viewId), view))
  }
  save()
  const build = () => buildStagePlanMaterializationForTest({ repositoryRoot: root, inventoryPath: 'activation.json', canonicalEntries })
  return { root, write, build, save, catalog, inventory, canonicalEntries, g9, g8, full, lk, excerpt, outputPath, viewPath }
}
function appendFirstStageNode(view: ReturnType<typeof fixture>['full'], node: unknown) {
  const children: unknown[] = view.rootNodes[0].children
  children.push(node)
}
function compileLegacy(value: ReturnType<typeof fixture>, view: CompositionView) {
  const landscapes = new Map(value.canonicalEntries.map(({ landscape }) => [landscape.landscapeId, normalizeCanonicalLandscape(landscape)]))
  const universe = normalizeCanonicalLandscape({ landscapeId: 'complete-test-universe', title: 'All canonical subjects',
    goals: [...landscapes.values()].flatMap(landscape => landscape.goals),
  })
  return compileCompositionView(view, landscapes.get(view.landscapeId)!, universe, landscapes)
}
function rejects(name: string, modify: (value: ReturnType<typeof fixture>) => void, pattern: RegExp) {
  const value = fixture(); modify(value)
  assert.throws(value.build, pattern, name); negatives++
}
try {
  const value = fixture(), generated = value.build()
  assert.equal(generated.index.canonicalDomain, 'isolated-test-fixture')
  assert.equal(generated.index.plans.length, 2)
  assert.equal(generated.artifacts.size, 4)
  assert.deepEqual([...value.build().artifacts], [...generated.artifacts], 'Repeat generation is byte-identical.')
  assert(!Object.hasOwn(value.excerpt, 'rootNodes'))
  const excerpt = JSON.parse(generated.artifacts.get(value.outputPath(value.excerpt.viewId))!)
  assert.equal(excerpt.$schema, LEGACY_COMPOSITION_SCHEMA)
  assert.equal(excerpt.viewFormatVersion, '1.0')
  assert.equal(excerpt.rootNodes[0].children[0].goalId, 'first', 'Exact qualified target aliases become legacy-compatible canonical IDs.')
  assert.equal(excerpt.rootNodes[0].children[1].goalId, 'support', 'Exact qualified foreign support aliases normalize too.')
  for (const view of generated.index.views) {
    const legacy = JSON.parse(generated.artifacts.get(view.artifact.path)!) as CompositionView
    assert.deepEqual(compileLegacy(value, legacy).findings.filter(finding => finding.severity === 'error'), [], 'Every emitted view compiles with the actual legacy compiler.')
  }
  assert.equal(generated.index.activationSource.path, 'activation.json')
  assert.equal(generated.index.activationSource.sha256, `sha256:${createHash('sha256').update(readFileSync(resolve(value.root, 'activation.json'))).digest('hex')}`)
  assert(!Object.hasOwn(excerpt, 'planBinding'))
  assert(!JSON.stringify(excerpt).includes('placementBasis'))
  assert(!JSON.stringify(excerpt).includes('planUnitId'))
  assert(!Object.hasOwn(excerpt.scope, 'courseProfile'))
  assert(!Object.hasOwn(excerpt.scope, 'durationModel'))
  assert.equal(excerpt.rootNodes[0].id, 'unrelated-root-one', 'Converged excerpts use a deterministic authority, preserving its runtime IDs.')
  const indexed = generated.index.views.find(view => view.viewId === value.excerpt.viewId)!
  assert.deepEqual(indexed.planIds, ['he-g8', 'he-g9'])
  assert.deepEqual(indexed.structureBindings, [{ structureId: 'unrelated-root-one', planUnitId: 'explicit-first-unit', stage: 'SekI', order: 0, after: [] }])
  assert.equal(indexed.placements[0].stage, 'SekI')
  assert(indexed.placements[0].claims.every(claim => claim.placementBasis?.kind === 'reviewedPreparation' && claim.placementBasis.sourceStage === 'SekII'))
  assert.deepEqual(indexed.placements[0].claims.map(claim => claim.sourceViewId), ['physics-gk', 'physics-lk'])
  assert(indexed.placements[0].claims.every(claim => claim.goalId === 'physics:first'), 'Provenance retains the authored qualified reference.')
  assert(indexed.prerequisiteOnlyReferences.every(claim => claim.goalId === 'math:support'))
  assert(!indexed.placements.some(item => item.goalId === 'support'), 'Support-node position does not become a learning placement.')
  assert(indexed.prerequisiteOnlyReferences.every(claim => !Object.hasOwn(claim, 'placementBasis')))
  const legacyPath = `${COMPOSITION_VIEW_DIRECTORY}/physik/unowned-national.view.json`
  value.write(legacyPath, { unowned: 'retained bytes' })
  const legacyBytes = readFileSync(resolve(value.root, legacyPath), 'utf8')
  assert.throws(() => applyStagePlanMaterialization(value.root, generated, 'check'), /missing, stale or edited/)
  const written = applyStagePlanMaterialization(value.root, generated, 'write')
  assert.equal(written.changed.length, 4)
  assert.equal(applyStagePlanMaterialization(value.root, generated, 'check').changed.length, 0)
  assert.equal(readFileSync(resolve(value.root, legacyPath), 'utf8'), legacyBytes)
  for (const [path, bytes] of generated.artifacts) if (path !== STAGE_PLAN_INDEX_PATH) {
    const indexEntry = generated.index.views.find(entry => entry.artifact.path === path)!
    assert.equal(indexEntry.artifact.sha256, `sha256:${createHash('sha256').update(bytes).digest('hex')}`)
  }
  value.write(value.outputPath('physics-first'), { edited: true })
  assert.throws(() => applyStagePlanMaterialization(value.root, generated, 'check'), /missing, stale or edited/)
  applyStagePlanMaterialization(value.root, generated, 'write')
  const index = JSON.parse(readFileSync(resolve(value.root, STAGE_PLAN_INDEX_PATH), 'utf8'))
  index.views[0].structureBindings[0].stage = 'SekII'
  value.write(STAGE_PLAN_INDEX_PATH, index)
  assert.throws(() => applyStagePlanMaterialization(value.root, generated, 'check'), /missing, stale or edited/)
  applyStagePlanMaterialization(value.root, generated, 'write')
  const older = structuredClone(generated.index)
  older.views[0].artifact.path = `${COMPOSITION_VIEW_DIRECTORY}/physik/previously-owned-extra.view.json`
  value.write(STAGE_PLAN_INDEX_PATH, older)
  assert.throws(() => applyStagePlanMaterialization(value.root, generated, 'write'), /extra previously owned output/)
  negatives += 4

  rejects('missing declared source', item => rmSync(resolve(item.root, item.viewPath('physics-gk'))), /unlisted or missing authored view/)
  rejects('unlisted plan', item => item.write(`${STAGE_PLAN_DIRECTORY}/plans/extra.json`, item.g9), /unlisted or missing authored plan/)
  rejects('unlisted view', item => item.write(`${STAGE_PLAN_DIRECTORY}/views/extra.json`, item.full), /unlisted or missing authored view/)
  rejects('missing activated view', item => { item.catalog.views.pop(); item.save() }, /missing or extra activated outputs/)
  rejects('missing activated plan', item => { item.catalog.plans.pop(); item.save() }, /missing or extra activated plans/)
  rejects('duplicate output', item => { item.catalog.views[1].outputPath = item.catalog.views[0].outputPath; item.save() }, /duplicate output/)
  rejects('duplicate view', item => { item.catalog.views.push(item.catalog.views[0]); item.save() }, /duplicate view ID/)
  rejects('duplicate source file', item => { item.catalog.views[1].path = item.catalog.views[0].path; item.save() }, /duplicate authored source path/)
  rejects('mismatched file identity', item => { item.full.viewId = 'another-id'; item.write(item.viewPath('physics-gk'), item.full) }, /manifest view identity mismatch/)
  rejects('traversal source path', item => { item.catalog.views[0].path = `${STAGE_PLAN_DIRECTORY}/views/../plans/he-g9.json`; item.save() }, /unsafe or out-of-domain/)
  rejects('absolute output path', item => { item.catalog.views[0].outputPath = '/tmp/unsafe.view.json'; item.inventory.views[0].outputPath = '/tmp/unsafe.view.json'; item.save() }, /invalid catalog|unsafe or out-of-domain/)
  rejects('output outside compatibility directory', item => { item.catalog.views[0].outputPath = `${STAGE_PLAN_DIRECTORY}/forbidden.view.json`; item.inventory.views[0].outputPath = item.catalog.views[0].outputPath; item.save() }, /unsafe or out-of-domain/)
  rejects('source symlink', item => { const path = resolve(item.root, item.viewPath('physics-gk')); rmSync(path); symlinkSync(resolve(item.root, item.viewPath('physics-lk')), path) }, /symlink path is forbidden/)
  rejects('invalid root stages', item => { item.full.rootNodes[0].planUnitId = 'sek1-heuristic'; item.save() }, /SP-REF/)
  rejects('ambiguous course-neutral excerpt', item => { item.lk.rootNodes[0].children.shift(); item.save() }, /SP-CONVERGENCE/)
  rejects('excerpt tree is forbidden', item => { Object.assign(item.excerpt, { rootNodes: item.full.rootNodes }); item.save() }, /invalid source view/)
  rejects('all profiles required', item => { item.excerpt.planBinding.excerptOfViewIds = ['physics-gk']; item.save() }, /invalid source view/)
  rejects('wrong goal qualifier', item => { item.full.rootNodes[0].children[0].goalId = 'wrong:first'; item.save() }, /SP-GOAL-REF/)
  rejects('foreign prerequisite cannot be omitted', item => { item.canonicalEntries[1].landscape.goals = []; item.write(item.canonicalEntries[1].path, item.canonicalEntries[1].landscape) }, /unresolved canonical reference/)
  rejects('unknown foreign qualifier', item => { item.canonicalEntries[0].landscape.goals[0].requires = ['wrong:support']; item.write(item.canonicalEntries[0].path, item.canonicalEntries[0].landscape) }, /unresolved canonical reference/)
  rejects('canonical contains cycle', item => { item.canonicalEntries[0].landscape.goals[0].contains = ['first']; item.write(item.canonicalEntries[0].path, item.canonicalEntries[0].landscape) }, /cycle in canonical contains/)
  rejects('canonical requires cycle', item => { item.canonicalEntries[1].landscape.goals[0].requires = ['first']; item.write(item.canonicalEntries[1].path, item.canonicalEntries[1].landscape) }, /cycle in canonical requires/)
  rejects('stale canonical fixture cannot bind new raw bytes', item => item.write(item.canonicalEntries[0].path, { ...item.canonicalEntries[0].landscape, extra: true }), /canonical input changed/)

  rejects('duplicate same-stage canonical target', item => {
    for (const view of [item.full, item.lk]) appendFirstStageNode(view, { kind: 'goalEntry', goalId: 'first' })
    item.save()
  }, /SP-DUPLICATE-GOAL/)
  rejects('overlap between a subtree and an explicit target', item => {
    for (const view of [item.full, item.lk]) appendFirstStageNode(view, { kind: 'canonicalSubtree', goalId: 'first' })
    item.save()
  }, /SP-DUPLICATE-GOAL/)
  rejects('actual compiler rejects empty nested structures', item => {
    for (const view of [item.full, item.lk]) appendFirstStageNode(view, { kind: 'structure', id: 'empty-nested', label: 'No content', children: [] })
    item.save()
  }, /invalid legacy compilation.*CPV-007/)

  const opaque = fixture()
  opaque.canonicalEntries[0].landscape.goals.push({ id: 'opaque-cluster', type: 'cluster', contains: ['hidden-atom'] }, { id: 'hidden-atom', type: 'atomic' })
  opaque.write(opaque.canonicalEntries[0].path, opaque.canonicalEntries[0].landscape)
  for (const view of [opaque.full, opaque.lk]) appendFirstStageNode(view, { kind: 'goalEntry', goalId: 'physics:opaque-cluster' })
  opaque.save()
  const opaqueResult = opaque.build()
  for (const view of opaqueResult.index.views) {
    assert(!view.placements.some(item => item.goalId === 'opaque-cluster' || item.goalId === 'hidden-atom'))
    const legacy = JSON.parse(opaqueResult.artifacts.get(view.artifact.path)!) as CompositionView
    const compilation = compileLegacy(opaque, legacy)
    assert.deepEqual(compilation.findings.filter(finding => finding.severity === 'error'), [])
    assert(!JSON.stringify(compilation.compiledRootNodes).includes('hidden-atom'), 'Opaque goalEntry clusters never expand hidden descendants.')
  }

  const differentHints = fixture()
  differentHints.lk.rootNodes[0].children.pop(); differentHints.save()
  assert.doesNotThrow(differentHints.build, 'Different invisible support declarations do not make an otherwise identical learner projection ambiguous.')

  rejects('canonical title and identity are different native labels', item => {
    Object.assign(item.canonicalEntries[0].landscape.goals.find(goal => goal.id === 'first')!, { title: 'Actual competency' })
    item.write(item.canonicalEntries[0].path, item.canonicalEntries[0].landscape)
    Object.assign(item.lk.rootNodes[0].children[0], { displayLabel: 'first' })
    item.save()
  }, /SP-CONVERGENCE/)
  for (const authoredTitle of [undefined, 'Actual competency']) {
    const matchingLabel = fixture()
    const first = matchingLabel.canonicalEntries[0].landscape.goals.find(goal => goal.id === 'first')!
    if (authoredTitle) Object.assign(first, { title: authoredTitle })
    else delete first.title
    matchingLabel.write(matchingLabel.canonicalEntries[0].path, matchingLabel.canonicalEntries[0].landscape)
    Object.assign(matchingLabel.lk.rootNodes[0].children[0], { displayLabel: authoredTitle ?? 'Goal 1' })
    matchingLabel.save()
    assert.doesNotThrow(matchingLabel.build, 'The materializer supplies the same authored or normalized canonical title as its native compiler.')
  }

  for (const kind of ['goalEntry', 'canonicalSubtree'] as const) {
    const overrides = fixture()
    const physicsGoals = overrides.canonicalEntries[0].landscape.goals
    const first = physicsGoals.find(goal => goal.id === 'first')!
    first.type = 'cluster'; first.contains = ['kept', kind === 'canonicalSubtree' ? 'narrow' : 'hidden']; first.requires = []
    physicsGoals.find(goal => goal.id === 'later')!.requires = ['kept']
    physicsGoals.push({ id: 'kept', type: 'atomic', requires: ['math:support'] }, { id: 'hidden', type: 'atomic' })
    if (kind === 'canonicalSubtree') physicsGoals.push({ id: 'narrow', type: 'cluster', contains: ['hidden'] })
    overrides.write(overrides.canonicalEntries[0].path, overrides.canonicalEntries[0].landscape)
    for (const view of [overrides.full, overrides.lk]) {
      const children: unknown[] = view.rootNodes[1].children
      children.push({ kind, goalId: kind === 'canonicalSubtree' ? 'physics:narrow' : 'physics:hidden', projectionRole: 'prerequisiteOnly' })
    }
    overrides.save()
    const built = overrides.build()
    const projected = JSON.parse(built.artifacts.get(overrides.outputPath(overrides.excerpt.viewId))!) as CompositionView
    const indexed = built.index.views.find(view => view.viewId === overrides.excerpt.viewId)!
    assert.deepEqual(indexed.placements.map(placement => placement.goalId), ['kept'], `${kind}: support overrides cannot become index seed placements.`)
    assert(indexed.prerequisiteOnlyReferences.some(claim => claim.goalId === (kind === 'canonicalSubtree' ? 'physics:narrow' : 'physics:hidden')
      && claim.nodePath.startsWith('rootNodes[1]')), 'Original global support provenance is indexed even when declared in the omitted stage.')
    assert(!indexed.placements.some(placement => placement.claims.some(claim => claim.projectionRole === 'prerequisiteOnly')))
    const firstRoot = projected.rootNodes[0]
    assert(firstRoot.kind === 'structure')
    assert.equal(firstRoot.children[0].kind, 'canonicalSubtree')
    assert.equal(firstRoot.children[0].goalId, 'first', 'Scoped target subtrees remain unflattened references.')
    assert(firstRoot.children.some(node => node.kind === 'structure' && node.id.startsWith('global-prerequisite-hints')))
    const compilation = compileLegacy(overrides, projected)
    assert.deepEqual(compilation.findings.filter(finding => finding.severity === 'error'), [])
    assert(!JSON.stringify(compilation.compiledRootNodes).includes('hidden'))
    assert(!JSON.stringify(compilation.compiledRootNodes).includes('global-prerequisite-hints'))
    assert(!Object.hasOwn(overrides.excerpt, 'rootNodes'))
    for (const view of built.index.views) assert(!view.placements.some(placement => placement.goalId === 'hidden'))
  }

  const activationChanged = fixture(), activationResult = activationChanged.build()
  activationChanged.write('activation.json', { ...activationChanged.inventory, planIds: ['different-plan'] })
  assert.throws(() => applyStagePlanMaterialization(activationChanged.root, activationResult, 'write'), /authority changed after validation: activation.json/)
  activationChanged.save()
  const rawActivationResult = activationChanged.build()
  const activationPath = resolve(activationChanged.root, 'activation.json')
  writeFileSync(activationPath, `${readFileSync(activationPath, 'utf8')} `)
  assert.throws(() => applyStagePlanMaterialization(activationChanged.root, rawActivationResult, 'write'), /authority changed after validation: activation.json/, 'Even an activation formatting-only edit changes the raw authority binding.')
  negatives += 2

  const extraOutputFixture = fixture(), extraOutputResult = extraOutputFixture.build()
  ;(extraOutputResult.artifacts as Map<string, string>).set(`${COMPOSITION_VIEW_DIRECTORY}/extra.view.json`, '{}\n')
  assert.throws(() => applyStagePlanMaterialization(extraOutputFixture.root, extraOutputResult, 'write'), /missing or extra materialized output/)
  const editedOutputFixture = fixture(), editedOutputResult = editedOutputFixture.build()
  ;(editedOutputResult.artifacts as Map<string, string>).set(editedOutputFixture.outputPath('physics-gk'), '{}\n')
  assert.throws(() => applyStagePlanMaterialization(editedOutputFixture.root, editedOutputResult, 'write'), /materialized view digest differs/)
  const addedSourceFixture = fixture(), addedSourceResult = addedSourceFixture.build()
  addedSourceFixture.write(`${STAGE_PLAN_DIRECTORY}/views/added-after-validation.json`, addedSourceFixture.full)
  assert.throws(() => applyStagePlanMaterialization(addedSourceFixture.root, addedSourceResult, 'write'), /authored view inventory changed after validation/)
  negatives += 3
  const changed = fixture(), before = changed.build()
  changed.full.rootNodes[0].label = 'Edited after validation'; changed.save()
  assert.throws(() => applyStagePlanMaterialization(changed.root, before, 'write'), /authority changed after validation/)
  assert.throws(() => resolveStagePlanPath(changed.root, 'a/../../outside'), /unsafe or out-of-domain/)
  const dangling = resolve(changed.root, 'dangling'); symlinkSync(resolve(changed.root, 'absent'), dangling)
  assert.throws(() => resolveStagePlanPath(changed.root, 'dangling/child'), /symlink path is forbidden/)
  assert.throws(() => generateStagePlanViews(['--write'], changed.root), /Usage:/)
  assert.throws(() => generateStagePlanViews(['--write', '--check'], changed.root), /exactly one/)
  assert.throws(() => generateStagePlanViews(['--check', '--inventory'], changed.root), /Missing value/)
  assert.throws(() => buildStagePlanMaterialization({ repositoryRoot: changed.root, inventoryPath: 'activation.json' }), /ENOENT/)
  negatives += 7

  // Exercise the production loader with a complete, isolated 21-owner catalog.
  // This verifies the existing overview/manifest authority, not a reduced fixture shortcut.
  const production = fixture()
  const additionalOwners = Array.from({ length: 18 }, (_, index) => `subject${index}`)
  for (const owner of additionalOwners) production.write(`curricula/DE/Gymnasium/canonical/${owner}.json`, {
    landscapeId: owner, goals: [{ id: `${owner}-root`, type: 'atomic', contains: [], requires: [] }],
  })
  production.write('curricula/curriculum_manifest.json', { curricula: [{ id: 'overview' }] })
  production.write('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_OVERVIEW.de.json', {
    landscapeId: 'overview', goals: [{ id: 'overview-root', type: 'cluster', contains: ['physics:physics-root', 'math:math-root', ...additionalOwners.map(owner => `${owner}:${owner}-root`)], requires: [] }],
    personalizationFlow: { stages: [{ id: 'subject', groups: [{ id: 'subject', source: { kind: 'offeredLandscapes', landscapeIds: ['physics', 'math', ...additionalOwners] } }] }] },
  })
  const productionBuild = () => buildStagePlanMaterialization({ repositoryRoot: production.root, inventoryPath: 'activation.json' })
  const productionResult = productionBuild()
  assert.equal(productionResult.index.canonicalDomain, 'canonical-gymnasium-21')
  assert.equal(productionResult.index.canonicalSources.length, 21)
  assert.equal(productionResult.index.inventorySources[0].path, 'curricula/curriculum_manifest.json')
  production.write('activation.json', production.inventory)
  generateStagePlanViews(['--write', '--inventory', 'activation.json'], production.root)
  generateStagePlanViews(['--check', '--inventory', 'activation.json'], production.root)
  const reportArguments = ['--inventory', 'activation.json', '--output', 'tmp/stage-flow.json', '--require-no-backflow']
  const report = reportStagePlanLearningFlow([...reportArguments, '--write'], production.root)
  assert.equal(report.status, 'no-stage-backflows')
  assert.equal(report.scopes.length, 4)
  assert.equal(report.authority.canonicalDomain, 'canonical-gymnasium-21')
  reportStagePlanLearningFlow([...reportArguments, '--check'], production.root)
  production.write('tmp/stage-flow.json', { stale: true })
  assert.throws(() => reportStagePlanLearningFlow([...reportArguments, '--check'], production.root), /report is missing or stale/)
  reportStagePlanLearningFlow([...reportArguments, '--write'], production.root)
  production.write(production.outputPath('physics-gk'), { stale: true })
  assert.throws(() => reportStagePlanLearningFlow([...reportArguments, '--write'], production.root), /missing, stale or edited/)
  generateStagePlanViews(['--write', '--inventory', 'activation.json'], production.root)
  const authorityBytes = readFileSync(resolve(production.root, 'activation.json'), 'utf8')
  assert.throws(() => reportStagePlanLearningFlow(['--write', '--inventory', 'activation.json', '--output', 'activation.json'], production.root), /report output must be a JSON file/)
  assert.equal(readFileSync(resolve(production.root, 'activation.json'), 'utf8'), authorityBytes)
  assert.throws(() => reportStagePlanLearningFlow(['--inventory', 'activation.json'], production.root), /Usage:/)
  negatives += 4
  production.write('curricula/DE/Gymnasium/canonical/extra.json', { landscapeId: 'undeclared', goals: [{ id: 'extra' }] })
  assert.throws(productionBuild, /missing or additional canonical source/)
  rmSync(resolve(production.root, 'curricula/DE/Gymnasium/canonical/extra.json'))
  production.write('curricula/curriculum_manifest.json', { curricula: [{ id: 'missing-overview' }] })
  assert.throws(productionBuild, /overview is not a declared curriculum root/)
  assert.throws(() => applyStagePlanMaterialization(production.root, productionResult, 'check'), /authority changed after validation/)
  production.write('curricula/curriculum_manifest.json', { curricula: [{ id: 'overview' }] })
  rmSync(resolve(production.root, 'curricula/DE/Gymnasium/canonical/subject0.json'))
  assert.throws(productionBuild, /missing or additional canonical source/)
  negatives += 4
  console.log(`Stage-plan materialization passed: deterministic v1 outputs, explicit unit index, raw digest binding, neutral excerpts, isolated fixtures and ${negatives} negative cases. No production views written.`)
} finally { rmSync(temporary, { recursive: true, force: true }) }
