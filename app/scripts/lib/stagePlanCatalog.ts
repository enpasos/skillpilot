// SPDX-License-Identifier: Apache-2.0
/** File-backed stage-plan authority and deterministic legacy projections.
 * This foundation does not certify pedagogy, prerequisite backflow or runtime acceptance.
 */
import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import { loadCurrentCurriculumCatalog, type CurrentCatalogEntry } from '../currentCurriculumCatalog'
import { liveVerificationInputs } from './verificationInputSnapshot'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, type CompositionView, type CompositionViewNode } from '../../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../../src/utils/authoring/canonicalAuthoring'
import {
  PLAN_COMPOSITION_SCHEMA, validateStagePlanCatalog,
  type PlacementBasis, type PlanStage, type StagePlan, type StagePlanGoal, type StagePlanStructureBinding,
} from '../../src/utils/stagePlan'

export const STAGE_PLAN_CATALOG_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1.3/stage-plan-catalog.schema.json'
export const STAGE_PLAN_INDEX_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1.3/stage-plan-projection-index.schema.json'
export const STAGE_PLAN_DIRECTORY = 'curricula/DE/Gymnasium/stage-plans'
export const STAGE_PLAN_CATALOG_PATH = `${STAGE_PLAN_DIRECTORY}/catalog.json`
export const STAGE_PLAN_INDEX_PATH = `${STAGE_PLAN_DIRECTORY}/generated/index.json`
export const COMPOSITION_VIEW_DIRECTORY = 'curricula/DE/Gymnasium/composition-views'
export const LEGACY_COMPOSITION_SCHEMA = 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json'
const schemaRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../contracts/curriculum-package')
const ajv = new Ajv2020({ strict: false, allErrors: true })
const compile = (name: string) => ajv.compile(JSON.parse(readFileSync(resolve(schemaRoot, name), 'utf8')))
const catalogSchema = compile('v1.3/stage-plan-catalog.schema.json')
const planSchema = compile('v1.3/stage-plan.schema.json')
const sourceViewSchema = compile('v1.3/composition-view.schema.json')
const legacyViewSchema = compile('v1/composition-view.schema.json')
const indexSchema = compile('v1.3/stage-plan-projection-index.schema.json')

export interface StagePlanFileCatalog {
  $schema: typeof STAGE_PLAN_CATALOG_SCHEMA
  catalogFormatVersion: '1.0'
  revision: string
  plans: { planId: string; path: string }[]
  views: { viewId: string; path: string; outputPath: string }[]
}
/** Independent activation configuration. No stage placements are duplicated here.
 * All paths are repository-relative, including the owned output inventory.
 */
export interface StagePlanActivationInventory {
  planIds: string[]
  views: { viewId: string; outputPath: string }[]
}
export interface RawStagePlanSource { path: string; sha256: string }
export interface StagePlanProjectionClaim {
  sourceViewId: string
  nodePath: string
  kind: 'canonicalSubtree' | 'goalEntry'
  goalId: string
  projectionRole: 'target' | 'prerequisiteOnly'
  placementBasis?: PlacementBasis
}
export interface StagePlanProjectionView {
  viewId: string
  landscapeId: string
  scope: CompositionView['scope']
  source: RawStagePlanSource
  artifact: RawStagePlanSource
  planIds: string[]
  sourceViewIds: string[]
  unitIds: string[]
  structureBindings: StagePlanStructureBinding[]
  placements: { goalId: string; planUnitId: string; stage: PlanStage; claims: StagePlanProjectionClaim[] }[]
  /** Support-node position grants neither a source claim nor a learning placement. */
  prerequisiteOnlyReferences: StagePlanProjectionClaim[]
}
export interface StagePlanProjectionIndex {
  $schema: typeof STAGE_PLAN_INDEX_SCHEMA
  indexFormatVersion: '1.0'
  generatedBy: 'skillpilot-stage-plan-materializer-v1'
  canonicalDomain: 'canonical-gymnasium-21' | 'isolated-test-fixture'
  catalog: RawStagePlanSource & { revision: string }
  canonicalSources: (RawStagePlanSource & { landscapeId: string })[]
  inventorySources: RawStagePlanSource[]
  activationInventory: StagePlanActivationInventory
  activationSource: RawStagePlanSource
  plans: { source: RawStagePlanSource; plan: StagePlan }[]
  views: StagePlanProjectionView[]
}
export interface StagePlanMaterialization {
  index: StagePlanProjectionIndex
  /** Includes exactly the owned compatibility views and the projection index. */
  artifacts: ReadonlyMap<string, string>
}
interface BuildOptions {
  repositoryRoot: string
  inventoryPath: string
  catalogPath?: string
}
const ensure: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`Stage-plan materialization: ${message}`)
}
const object = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value)
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const sorted = (values: readonly string[]) => [...values].sort(compare)
const hash = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const stable = (value: unknown): unknown => Array.isArray(value) ? value.map(stable) : object(value)
  ? Object.fromEntries(Object.keys(value).sort(compare).map(key => [key, stable(value[key])])) : value
const json = (value: unknown) => `${JSON.stringify(stable(value), null, 2)}\n`
const same = (a: unknown, b: unknown) => JSON.stringify(stable(a)) === JSON.stringify(stable(b))

/** Reject traversal, aliases and symlinks before any read or write, including absent output parents. */
export function resolveStagePlanPath(root: string, path: string, prefix?: string): string {
  ensure(typeof path === 'string' && /^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(path)
    && !path.split('/').some(part => !part || part === '.' || part === '..')
    && (!prefix || path.startsWith(`${prefix}/`)), `unsafe or out-of-domain path ${String(path)}`)
  const absoluteRoot = resolve(root), absolute = resolve(absoluteRoot, path)
  ensure(relative(absoluteRoot, absolute) !== '..' && !relative(absoluteRoot, absolute).startsWith(`..${sep}`), `path escapes repository: ${path}`)
  let current = absoluteRoot
  ensure(!lstatSync(current).isSymbolicLink(), `repository root is a symlink: ${current}`)
  for (const part of path.split('/')) {
    current = resolve(current, part)
    let metadata
    try { metadata = lstatSync(current) } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    }
    if (metadata) ensure(!metadata.isSymbolicLink(), `symlink path is forbidden: ${path}`)
  }
  return absolute
}
function readSource(root: string, path: string): { source: RawStagePlanSource; value: unknown; bytes: string } {
  const absolute = resolveStagePlanPath(root, path)
  ensure(lstatSync(absolute).isFile(), `not a regular source file: ${path}`)
  const raw = readFileSync(absolute), bytes = raw.toString('utf8')
  ensure(Buffer.from(bytes, 'utf8').equals(raw), `source is not valid UTF-8: ${path}`)
  return { source: { path, sha256: hash(raw) }, value: JSON.parse(bytes), bytes }
}
function declaredFiles(root: string, directory: string): string[] {
  const absolute = resolveStagePlanPath(root, directory)
  ensure(existsSync(absolute) && lstatSync(absolute).isDirectory(), `missing authored source directory ${directory}`)
  const files: string[] = []
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`
    resolveStagePlanPath(root, path)
    ensure(entry.isDirectory() || entry.isFile(), `nonregular authored source ${path}`)
    if (entry.isDirectory()) files.push(...declaredFiles(root, path))
    else if (/\.json$/iu.test(entry.name)) files.push(path)
  }
  return sorted(files)
}
function unique(values: readonly string[], label: string): void {
  ensure(new Set(values).size === values.length, `duplicate ${label}`)
}
export function validateStagePlanActivationInventory(value: unknown): asserts value is StagePlanActivationInventory {
  ensure(object(value) && same(Object.keys(value).sort(), ['planIds', 'views']) && Array.isArray(value.planIds)
    && value.planIds.length > 0 && value.planIds.every(id => typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u.test(id))
    && Array.isArray(value.views) && value.views.length > 0, 'missing or invalid independent activation inventory')
  unique(value.planIds, 'activation plan ID')
  for (const view of value.views) ensure(object(view) && same(Object.keys(view).sort(), ['outputPath', 'viewId'])
    && typeof view.viewId === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:+-]*$/u.test(view.viewId)
    && typeof view.outputPath === 'string', 'invalid activation view entry')
  const views = value.views as StagePlanActivationInventory['views']
  unique(views.map(view => view.viewId), 'activation view ID'); unique(views.map(view => view.outputPath), 'activation output')
}

function canonicalGoals(entries: readonly CurrentCatalogEntry[]) {
  const goals = new Map<string, StagePlanGoal>(), owners = new Set(entries.map(entry => entry.landscape.landscapeId))
  for (const { landscape } of entries) {
    // Use exactly the canonical normalization consumed by the native compiler,
    // including its fallback for isolated fixture goals without authored titles.
    const titles = new Map(normalizeCanonicalLandscape(landscape).goals.map(goal => [goal.id, goal.title]))
    for (const raw of landscape.goals) {
      ensure(typeof raw.id === 'string' && !raw.id.includes(':') && !goals.has(raw.id), `ambiguous canonical identity ${raw.id}`)
      ensure(raw.type === undefined || raw.type === 'atomic' || raw.type === 'cluster', `invalid canonical type ${raw.id}`)
      ensure((raw.contains === undefined || Array.isArray(raw.contains)) && (raw.requires === undefined || Array.isArray(raw.requires)), `invalid canonical graph arrays ${raw.id}`)
      const goal: StagePlanGoal = { id: raw.id, title: titles.get(raw.id)!, contains: raw.contains, requires: raw.requires, ...(raw.type ? { type: raw.type } : {}) }
      goals.set(raw.id, goal); goals.set(`${landscape.landscapeId}:${raw.id}`, goal)
    }
  }
  // Bare landscape IDs are not goal aliases. Exact qualified references retain
  // their owner; an arbitrary prefix can never be discarded to match a suffix.
  for (const goal of new Set(goals.values())) for (const ref of [...goal.contains ?? [], ...goal.requires ?? []]) {
    ensure(typeof ref === 'string' && goals.has(ref), `unresolved canonical reference ${goal.id}->${String(ref)}`)
    if (ref.includes(':')) ensure(owners.has(ref.split(':')[0]), `unknown canonical qualifier ${ref}`)
  }
  const visitGraph = (edge: 'contains' | 'requires') => {
    const active = new Set<string>(), done = new Set<string>()
    const visit = (goal: StagePlanGoal) => {
      ensure(!active.has(goal.id), `cycle in canonical ${edge} at ${goal.id}`)
      if (done.has(goal.id)) return
      active.add(goal.id)
      for (const ref of goal[edge] ?? []) visit(goals.get(ref)!)
      active.delete(goal.id); done.add(goal.id)
    }
    for (const goal of new Set(goals.values())) visit(goal)
  }
  visitGraph('contains'); visitGraph('requires')
  return goals
}

function legacyView(view: CompositionView, goals: ReadonlyMap<string, StagePlanGoal>): CompositionView {
  const node = (value: CompositionViewNode): CompositionViewNode | undefined => {
    if (value.kind === 'structure') {
      const children = value.children.map(node).filter((child): child is CompositionViewNode => child !== undefined)
      // A shared calendar unit may have no contribution from this subject.
      // Keep its authority, but never fabricate content to satisfy legacy CPV-007.
      if (!children.length && value.planUnitId) return undefined
      return { kind: value.kind, id: value.id, label: value.label, children }
    }
    return value.kind === 'canonicalSubtree' || value.kind === 'goalEntry'
      ? { ...Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'placementBasis')), goalId: goals.get(value.goalId)!.id } as CompositionViewNode
      : { ...value }
  }
  const { planBinding: _binding, ...legacy } = view
  void _binding
  return { ...legacy, $schema: LEGACY_COMPOSITION_SCHEMA, viewFormatVersion: '1.0', rootNodes: view.rootNodes.map(node).filter((child): child is CompositionViewNode => child !== undefined) }
}

/** Production always loads the complete authoritative Gymnasium domain (21 roots).
 * The catalog and independent activation inventory must agree exactly.
 */
export function buildStagePlanMaterialization(options: BuildOptions): StagePlanMaterialization {
  const manifest = readSource(options.repositoryRoot, 'curricula/curriculum_manifest.json').source
  const catalog = loadCurrentCurriculumCatalog(liveVerificationInputs, options.repositoryRoot)
  ensure(readSource(options.repositoryRoot, manifest.path).source.sha256 === manifest.sha256, 'canonical manifest changed during inventory loading')
  ensure(catalog.entries.length === 21, 'production requires the complete 21-root canonical Gymnasium catalog')
  return buildWithCanonicalCatalog(options, catalog.entries, false, [manifest])
}
/** Isolated fixture seam; callers cannot use it to emit a production authority claim. */
export function buildStagePlanMaterializationForTest(options: BuildOptions & { canonicalEntries: readonly CurrentCatalogEntry[] }): StagePlanMaterialization {
  const relativeRoot = resolve(options.repositoryRoot)
  ensure(relativeRoot !== resolve(dirname(fileURLToPath(import.meta.url)), '../../..'), 'fixture inventory cannot replace the production canonical catalog')
  return buildWithCanonicalCatalog(options, options.canonicalEntries, true)
}

function buildWithCanonicalCatalog(options: BuildOptions, entries: readonly CurrentCatalogEntry[], fixture: boolean, inventorySources: RawStagePlanSource[] = []): StagePlanMaterialization {
  const root = resolve(options.repositoryRoot), catalogPath = options.catalogPath ?? STAGE_PLAN_CATALOG_PATH
  const activationInput = readSource(root, options.inventoryPath), inventory = activationInput.value
  validateStagePlanActivationInventory(inventory)
  resolveStagePlanPath(root, catalogPath, STAGE_PLAN_DIRECTORY)
  const catalogInput = readSource(root, catalogPath)
  ensure(catalogSchema(catalogInput.value), `invalid catalog: ${JSON.stringify(catalogSchema.errors)}`)
  const catalog = catalogInput.value as StagePlanFileCatalog
  unique(catalog.plans.map(plan => plan.planId), 'plan ID'); unique(catalog.views.map(view => view.viewId), 'view ID')
  unique([...catalog.plans.map(plan => plan.path), ...catalog.views.map(view => view.path)], 'authored source path')
  unique(catalog.views.map(view => view.outputPath), 'output path')
  ensure(same(sorted(catalog.plans.map(plan => plan.planId)), sorted(inventory.planIds)), 'catalog has missing or extra activated plans')
  const viewInventory = (views: StagePlanActivationInventory['views']) => [...views].sort((a, b) => compare(a.viewId, b.viewId))
  ensure(same(viewInventory(catalog.views.map(({ viewId, outputPath }) => ({ viewId, outputPath }))), viewInventory(inventory.views)), 'catalog has missing or extra activated outputs')
  for (const plan of catalog.plans) resolveStagePlanPath(root, plan.path, `${STAGE_PLAN_DIRECTORY}/plans`)
  for (const view of catalog.views) {
    resolveStagePlanPath(root, view.path, `${STAGE_PLAN_DIRECTORY}/views`)
    resolveStagePlanPath(root, view.outputPath, COMPOSITION_VIEW_DIRECTORY)
    ensure(view.outputPath.endsWith('.view.json'), `output is not a compatibility view: ${view.outputPath}`)
  }
  ensure(same(declaredFiles(root, `${STAGE_PLAN_DIRECTORY}/plans`), sorted(catalog.plans.map(plan => plan.path))), 'unlisted or missing authored plan file')
  ensure(same(declaredFiles(root, `${STAGE_PLAN_DIRECTORY}/views`), sorted(catalog.views.map(view => view.path))), 'unlisted or missing authored view file')
  const plans = catalog.plans.map(entry => {
    const input = readSource(root, entry.path)
    ensure(planSchema(input.value), `invalid plan ${entry.path}: ${JSON.stringify(planSchema.errors)}`)
    ensure((input.value as StagePlan).planId === entry.planId, `manifest plan identity mismatch ${entry.path}`)
    return { source: input.source, plan: input.value as StagePlan }
  }).sort((a, b) => compare(a.plan.planId, b.plan.planId))
  const views = catalog.views.map(entry => {
    const input = readSource(root, entry.path)
    ensure(sourceViewSchema(input.value), `invalid source view ${entry.path}: ${JSON.stringify(sourceViewSchema.errors)}`)
    ensure(object(input.value) && input.value.viewId === entry.viewId && input.value.$schema === PLAN_COMPOSITION_SCHEMA, `manifest view identity mismatch ${entry.path}`)
    return { ...entry, source: input.source, view: input.value as CompositionView }
  }).sort((a, b) => compare(a.viewId, b.viewId))
  const goals = canonicalGoals(entries)
  // Normalize only exact references already resolved by canonicalGoals. The
  // legacy compiler consumes bare canonical IDs across the complete universe.
  const compilerLandscapes = new Map(entries.map(({ landscape }) => [landscape.landscapeId, normalizeCanonicalLandscape({
    ...landscape, goals: landscape.goals.map(goal => ({ ...goal,
      contains: (goal.contains ?? []).map(ref => goals.get(ref)!.id),
      requires: (goal.requires ?? []).map(ref => goals.get(ref)!.id),
    })),
  })]))
  const compilerUniverse = normalizeCanonicalLandscape({ landscapeId: 'stage-plan-complete-universe', title: 'Complete canonical goal universe',
    goals: [...compilerLandscapes.values()].flatMap(landscape => landscape.goals),
  })
  const validated = validateStagePlanCatalog({ plans: plans.map(entry => entry.plan), views: views.map(entry => entry.view), goals })
  ensure(!validated.findings.length, `invalid authority: ${JSON.stringify(validated.findings)}`)
  const artifacts = new Map<string, string>()
  const byViewId = new Map(views.map(entry => [entry.viewId, entry]))
  const compilerGoalById = new Map(compilerUniverse.goals.map(goal => [goal.id, goal]))
  const visibleAtoms = (ref: string, targets: ReadonlySet<string>, expand: boolean): string[] => {
    const goal = goals.get(ref)!
    if (!targets.has(goal.id)) return []
    return goal.contains?.length ? expand ? [...new Set(goal.contains.flatMap(child => visibleAtoms(child, targets, true)))] : [] : goal.type === 'cluster' ? [] : [goal.id]
  }
  const supportKey = (node: CompositionViewNode) => `${node.kind}:${goals.get(node.goalId as string)!.id}:${String(node.displayLabel ?? '')}`
  const indexViews: StagePlanProjectionView[] = []
  for (const entry of views) {
    const projected = validated.viewsById.get(entry.viewId)!, legacy = legacyView(projected, goals)
    ensure(legacyViewSchema(legacy), `invalid legacy projection ${entry.viewId}: ${JSON.stringify(legacyViewSchema.errors)}`)
    const compilation = compileCompositionView(legacy, compilerLandscapes.get(legacy.landscapeId) ?? null, compilerUniverse, compilerLandscapes)
    const compileErrors = compilation.findings.filter(finding => finding.severity === 'error')
    ensure(!compileErrors.length, `invalid legacy compilation ${entry.viewId}: ${JSON.stringify(compileErrors)}`)
    const compiledAtoms: string[] = []
    const collectCompiledAtoms = (nodes: typeof compilation.compiledRootNodes) => nodes.forEach(node => {
      const goal = node.sourceGoalId ? goals.get(node.sourceGoalId) : undefined
      if (goal && !goal.contains?.length && goal.type !== 'cluster') compiledAtoms.push(goal.id)
      collectCompiledAtoms(node.children)
    })
    collectCompiledAtoms(compilation.compiledRootNodes)
    ensure(same(sorted(compiledAtoms), sorted([...validated.placementsByViewId.get(entry.viewId)!.keys()])), `effective legacy projection differs from validated placement basis: ${entry.viewId}`)
    const content = json(legacy)
    artifacts.set(entry.outputPath, content)
    const binding = entry.view.planBinding as { planId?: string; planIds?: string[]; excerptOfViewId?: string; excerptOfViewIds?: string[]; unitIds?: string[] }
    const planIds = sorted(binding.planIds ?? [binding.planId!]), plan = validated.plansById.get(planIds[0])!
    const sourceViewIds = sorted(binding.excerptOfViewIds ?? [binding.excerptOfViewId ?? entry.viewId])
    const unitIds = binding.unitIds ?? plan.rootUnit.children
    const claimsByGoal = new Map<string, StagePlanProjectionClaim[]>(), support: StagePlanProjectionClaim[] = []
    const projectedSupport = new Set<string>()
    const collectSupport = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
      if (node.kind === 'structure') collectSupport(node.children)
      else if (node.projectionRole === 'prerequisiteOnly') projectedSupport.add(supportKey(node))
    })
    collectSupport(projected.rootNodes)
    for (const sourceViewId of sourceViewIds) {
      const sourceView = byViewId.get(sourceViewId)!.view
      const targets = collectCompositionProjectionRoleGoalIds(legacyView(sourceView, goals).rootNodes, compilerGoalById).targetGoalIds
      const walk = (nodes: CompositionViewNode[], path: string, selected = false) => nodes.forEach((node, index) => {
        const nodePath = `${path}[${index}]`
        if (node.kind === 'structure') { walk(node.children, `${nodePath}.children`, selected || unitIds.includes(String(node.planUnitId))); return }
        if (node.kind !== 'goalEntry' && node.kind !== 'canonicalSubtree') return
        const role = node.projectionRole ?? 'target'
        const claim: StagePlanProjectionClaim = { sourceViewId, nodePath, kind: node.kind, goalId: node.goalId,
          projectionRole: role, ...(node.placementBasis ? { placementBasis: structuredClone(node.placementBasis as PlacementBasis) } : {}) }
        if (role === 'prerequisiteOnly') { if (projectedSupport.has(supportKey(node))) support.push(claim) }
        else if (selected) for (const id of visibleAtoms(node.goalId, targets, node.kind === 'canonicalSubtree')) {
          claimsByGoal.set(id, [...claimsByGoal.get(id) ?? [], claim])
        }
      })
      walk(sourceView.rootNodes, 'rootNodes')
    }
    const placements = [...validated.placementsByViewId.get(entry.viewId)!].sort(([a], [b]) => compare(a, b))
      .map(([goalId, planUnitId]) => ({ goalId, planUnitId, stage: plan.units.find(unit => unit.id === planUnitId)!.stage, claims: claimsByGoal.get(goalId)! }))
    ensure(placements.every(placement => placement.claims?.length), `placement lacks authority claim: ${entry.viewId}`)
    indexViews.push({ viewId: entry.viewId, landscapeId: legacy.landscapeId, scope: legacy.scope, source: entry.source,
      artifact: { path: entry.outputPath, sha256: hash(content) }, planIds, sourceViewIds, unitIds: [...unitIds],
      structureBindings: (() => {
        const bindings: StagePlanProjectionView['structureBindings'] = []
        const nested = plan.units.some(unit => unit.kind !== 'stage')
        const emitted = new Set<string>()
        const noteEmitted = (nodes: CompositionViewNode[]) => nodes.forEach(node => { if (node.kind === 'structure') { emitted.add(node.id); noteEmitted(node.children) } })
        noteEmitted(legacy.rootNodes)
        const collect = (nodes: CompositionViewNode[]) => nodes.forEach(node => {
          if (node.kind !== 'structure') return
          const unit = plan.units.find(candidate => candidate.id === node.planUnitId)
          if (unit && emitted.has(node.id)) {
            const siblings = unit.parentUnitId === plan.rootUnit.id ? plan.rootUnit.children
              : plan.units.find(parent => parent.id === unit.parentUnitId)!.children!
            bindings.push({ structureId: String(node.id), planUnitId: unit.id, stage: unit.stage,
              order: siblings.indexOf(unit.id), after: [...unit.after], ...(nested ? {
                kind: unit.kind, parentUnitId: unit.parentUnitId,
                ...(unit.children ? { children: [...unit.children] } : {}),
                ...(unit.year !== undefined ? { year: unit.year } : {}), ...(unit.phase ? { phase: unit.phase } : {}),
              } : {}) })
          }
          collect(node.children)
        })
        collect(projected.rootNodes)
        return bindings
      })(), placements, prerequisiteOnlyReferences: support })
  }
  const canonicalSources = entries.map(entry => {
    const input = readSource(root, entry.path)
    ensure(same(input.value, entry.landscape), `canonical input changed during generation: ${entry.path}`)
    return { ...input.source, landscapeId: entry.landscape.landscapeId }
  })
    .sort((a, b) => compare(a.landscapeId, b.landscapeId))
  const index: StagePlanProjectionIndex = {
    $schema: STAGE_PLAN_INDEX_SCHEMA, indexFormatVersion: '1.0', generatedBy: 'skillpilot-stage-plan-materializer-v1',
    canonicalDomain: fixture ? 'isolated-test-fixture' : 'canonical-gymnasium-21',
    catalog: { ...catalogInput.source, revision: catalog.revision }, canonicalSources,
    inventorySources,
    activationInventory: { planIds: sorted(inventory.planIds), views: viewInventory(inventory.views) },
    activationSource: activationInput.source, plans, views: indexViews,
  }
  ensure(indexSchema(index), `invalid generated index: ${JSON.stringify(indexSchema.errors)}`)
  if (fixture) ensure(entries.length > 0, 'test inventory is empty')
  artifacts.set(STAGE_PLAN_INDEX_PATH, json(index))
  return { index, artifacts }
}

/** --check fails for absent, stale or edited owned outputs. --write never deletes
 * legacy files. Outputs owned by an older index require an explicit migration.
 */
export function applyStagePlanMaterialization(root: string, result: StagePlanMaterialization, mode: 'check' | 'write'): { checked: number; changed: string[] } {
  ensure(indexSchema(result.index), `invalid projection index: ${JSON.stringify(indexSchema.errors)}`)
  const expectedOutputs = result.index.views.map(entry => entry.artifact.path)
  unique(expectedOutputs, 'generated output'); unique(result.index.views.map(entry => entry.viewId), 'generated view ID')
  ensure(same(sorted([...result.artifacts.keys()]), sorted([...expectedOutputs, STAGE_PLAN_INDEX_PATH])), 'missing or extra materialized output')
  ensure(result.artifacts.get(STAGE_PLAN_INDEX_PATH) === json(result.index), 'materialized index bytes differ from validated index')
  for (const view of result.index.views) {
    resolveStagePlanPath(root, view.artifact.path, COMPOSITION_VIEW_DIRECTORY)
    ensure(hash(result.artifacts.get(view.artifact.path)!) === view.artifact.sha256, `materialized view digest differs from index: ${view.viewId}`)
  }
  for (const source of [result.index.catalog, result.index.activationSource, ...result.index.inventorySources, ...result.index.canonicalSources, ...result.index.plans.map(entry => entry.source), ...result.index.views.map(entry => entry.source)]) {
    ensure(readSource(root, source.path).source.sha256 === source.sha256, `authority changed after validation: ${source.path}`)
  }
  ensure(same(declaredFiles(root, `${STAGE_PLAN_DIRECTORY}/plans`), sorted(result.index.plans.map(entry => entry.source.path))), 'authored plan inventory changed after validation')
  ensure(same(declaredFiles(root, `${STAGE_PLAN_DIRECTORY}/views`), sorted(result.index.views.map(entry => entry.source.path))), 'authored view inventory changed after validation')
  const indexPath = resolveStagePlanPath(root, STAGE_PLAN_INDEX_PATH)
  if (existsSync(indexPath)) {
    const previous = JSON.parse(readFileSync(indexPath, 'utf8')) as unknown
    ensure(indexSchema(previous), 'existing generated index is malformed; restore it before regeneration')
    for (const view of (previous as StagePlanProjectionIndex).views) ensure(result.artifacts.has(view.artifact.path), `extra previously owned output ${view.artifact.path}; explicit ownership migration required`)
  }
  const changes = [...result.artifacts].filter(([path, content]) => {
    const absolute = resolveStagePlanPath(root, path)
    return !existsSync(absolute) || readFileSync(absolute, 'utf8') !== content
  })
  if (mode === 'check') ensure(!changes.length, `missing, stale or edited generated artifact(s): ${changes.map(([path]) => path).join(', ')}`)
  else for (const [path, content] of changes) {
    const absolute = resolveStagePlanPath(root, path)
    mkdirSync(dirname(absolute), { recursive: true }); writeFileSync(absolute, content)
  }
  return { checked: result.artifacts.size, changed: changes.map(([path]) => path) }
}
