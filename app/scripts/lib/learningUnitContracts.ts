// SPDX-License-Identifier: Apache-2.0
/**
 * Structural validity of authored learning-unit contracts.
 *
 * Graph Definition §11 (learning units) and §13.3 (unit validity rules):
 *   R1  every own ordinary goal lies on a prerequisite path from an own assessment
 *   R3  an assessment claims coverage only for goals it requires
 *   R4  every acquisition target has exactly one directly owning unit
 * plus non-empty total scope, an acyclic unit hierarchy and atomic own goals.
 *
 * This module validates static contracts only. It reads no learner state and
 * derives no recognition: R2 (reviewed coverage) is reported as evidence
 * status, and R5 (versioned binding) belongs to the runtime.
 */
import { createHash } from 'node:crypto'

export interface UnitGraphGoal {
  id: string
  title?: string
  contains?: string[]
  requires?: string[]
  nodeKind?: string | null
  semanticKind?: string | null
  tags?: (string | null)[] | null
  examData?: {
    coveredGoalIds?: unknown
    taskContent?: unknown
    solutionContent?: unknown
    scoring?: unknown
  } | null
  extendedData?: Record<string, unknown> | null
}
export interface UnitGraphLandscape { landscapeId: string; goals: UnitGraphGoal[] }

export type AtomicGoalKind = 'assessment' | 'memory' | 'orientation' | 'ordinary'

export interface LocalizedText { de: string; en: string }
export interface CoverageReview {
  assessmentGoalId: string
  goalIds: string[]
  reference: string
  taskRevision: string
  rubricRevision: string
}
export interface LearningUnit {
  id: string
  revision: string
  title: LocalizedText
  promise: LocalizedText
  ownGoalIds: string[]
  childUnitIds?: string[]
  coverageReviews?: CoverageReview[]
}
export interface LearningUnitCatalog {
  schemaVersion: 1
  catalogId: string
  landscapeId: string
  revision: string
  completeness: 'partial' | 'complete'
  units: LearningUnit[]
}

export type UnitFindingCode =
  | 'LU-CATALOG' | 'LU-REF' | 'LU-ATOMIC' | 'LU-KIND' | 'LU-GRAPH'
  | 'LU-UNIT-ID' | 'LU-CHILD' | 'LU-HIERARCHY' | 'LU-EMPTY-SCOPE'
  | 'LU-R1' | 'LU-R1-OFFERED' | 'LU-R2-EVIDENCE' | 'LU-R3' | 'LU-R4-MULTIPLE' | 'LU-R4-UNOWNED'
export interface UnitFinding {
  code: UnitFindingCode
  catalogId: string
  unitId?: string
  goalId?: string
  message: string
}
export interface UnitSummary {
  catalogId: string
  unitId: string
  ownGoals: Record<AtomicGoalKind, number>
  totalScope: number
  structurallyValid: boolean
  /** Own ordinary goals without reviewed coverage (R2). Empty means the evidence is complete. */
  goalsWithoutReviewedCoverage: string[]
}
export interface CatalogLedger {
  catalogId: string
  landscapeId: string
  completeness: 'partial' | 'complete'
  atomicGoals: number
  ownedGoals: number
  unownedGoals: Record<AtomicGoalKind, number>
}
export interface UnitValidationResult {
  findings: UnitFinding[]
  units: UnitSummary[]
  ledgers: CatalogLedger[]
}
export interface OfferedMembershipClass {
  id: string
  landscapeId: string
  /** Goals the offered view itself targets, before the prerequisite closure. */
  seedTargetGoalIds: ReadonlySet<string>
  /** The closed learning scope: seed targets plus the prerequisites the closure added as targets. */
  targetGoalIds: ReadonlySet<string>
  members: string[]
}

export class UnitGraphError extends Error {}

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const lower = (value: unknown): string => typeof value === 'string' ? value.trim().toLowerCase() : ''
const byCodeUnit = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0
const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort(byCodeUnit)

// Mirrors CompletionProfileCompiler.isAssessment / isMemory / isOrientation in
// the backend, the shared completion type semantics including the currently
// compatible legacy encodings. Keep both sides aligned.
const isAssessment = (goal: UnitGraphGoal): boolean => lower(goal.nodeKind) === 'exam'
  || (goal.examData !== undefined && goal.examData !== null)
  || ['practiceassessment', 'assessment'].includes(lower(goal.semanticKind))
const tagList = (goal: UnitGraphGoal): string[] => (goal.tags ?? []).filter((tag): tag is string => typeof tag === 'string')
const isMemory = (goal: UnitGraphGoal): boolean => lower(goal.nodeKind) === 'memory'
  || ['memory', 'memorization'].includes(lower(goal.semanticKind))
  || typeof goal.extendedData?.vocabularySource === 'string'
  || tagList(goal).some((tag) => tag.startsWith('srs-deck') || tag === 'memorization')
const isOrientation = (goal: UnitGraphGoal): boolean => hasText(goal.semanticKind)
  ? lower(goal.semanticKind) === 'orientation'
  : tagList(goal).some((tag) => ['orientation', 'motivation'].includes(lower(tag)))

interface Node { key: string; landscapeId: string; goal: UnitGraphGoal; contains: string[]; parents: string[] }

/**
 * Canonical skill graph with the normative three-step prerequisite relation of
 * Graph Definition §2.3: inherit along `contains`, expand to atoms, close.
 */
export class UnitGraph {
  private readonly nodes = new Map<string, Node>()
  private readonly keysById = new Map<string, string[]>()
  private readonly atomsMemo = new Map<string, string[]>()
  private readonly directMemo = new Map<string, string[]>()
  private readonly reachMemo = new Map<string, ReadonlySet<string>>()

  constructor(catalog: UnitGraphLandscape[]) {
    for (const landscape of catalog) {
      if (!hasText(landscape?.landscapeId) || !Array.isArray(landscape.goals)) {
        throw new UnitGraphError('Canonical landscape without ID or goals')
      }
      for (const goal of landscape.goals) {
        if (!hasText(goal?.id)) throw new UnitGraphError(`Goal without ID in ${landscape.landscapeId}`)
        const key = `${landscape.landscapeId}:${goal.id}`
        if (this.nodes.has(key)) throw new UnitGraphError(`Duplicate goal ${key}`)
        this.nodes.set(key, { key, landscapeId: landscape.landscapeId, goal, contains: [], parents: [] })
        this.keysById.set(goal.id, [...(this.keysById.get(goal.id) ?? []), key])
      }
    }
    for (const node of this.nodes.values()) {
      node.contains = sorted((node.goal.contains ?? []).map((ref) => this.resolve(ref, node.landscapeId)))
      for (const child of node.contains) this.nodes.get(child)!.parents.push(node.key)
    }
  }

  /** Same resolution order as the transitive-minimality auditor. */
  resolve(ref: string, fromLandscapeId: string): string {
    if (!hasText(ref)) throw new UnitGraphError(`Empty goal reference in ${fromLandscapeId}`)
    if (ref.includes(':')) {
      const [landscapeId, goalId, ...rest] = ref.split(':')
      const key = `${landscapeId || fromLandscapeId}:${goalId}`
      if (rest.length || !this.nodes.has(key)) throw new UnitGraphError(`Unknown goal reference ${ref}`)
      return key
    }
    const local = `${fromLandscapeId}:${ref}`
    if (this.nodes.has(local)) return local
    const matches = this.keysById.get(ref) ?? []
    if (matches.length !== 1) {
      throw new UnitGraphError(`${matches.length ? 'Ambiguous' : 'Unknown'} goal reference ${ref} from ${fromLandscapeId}`)
    }
    return matches[0]
  }

  has(key: string): boolean { return this.nodes.has(key) }
  goal(key: string): UnitGraphGoal { return this.nodes.get(key)!.goal }
  landscapeId(key: string): string { return this.nodes.get(key)!.landscapeId }
  isAtomic(key: string): boolean { return this.nodes.get(key)!.contains.length === 0 }
  atomicKeys(landscapeId: string): string[] {
    return [...this.nodes.values()].filter((node) => node.landscapeId === landscapeId && node.contains.length === 0)
      .map((node) => node.key).sort(byCodeUnit)
  }

  /** Every type predicate that holds; more than one is a contract defect for an owned goal. */
  kinds(key: string): AtomicGoalKind[] {
    const goal = this.goal(key)
    const kinds: AtomicGoalKind[] = []
    if (isAssessment(goal)) kinds.push('assessment')
    if (isMemory(goal)) kinds.push('memory')
    if (isOrientation(goal)) kinds.push('orientation')
    return kinds.length ? kinds : ['ordinary']
  }
  kind(key: string): AtomicGoalKind { return this.kinds(key)[0] }

  /** Atoms(g): the goal itself if atomic, otherwise its atomic descendants. */
  atoms(key: string, trail: string[] = []): string[] {
    const known = this.atomsMemo.get(key)
    if (known) return known
    if (trail.includes(key)) throw new UnitGraphError(`contains cycle: ${[...trail, key].join(' -> ')}`)
    const node = this.nodes.get(key)!
    const atoms = node.contains.length === 0 ? [key]
      : sorted(node.contains.flatMap((child) => this.atoms(child, [...trail, key])))
    this.atomsMemo.set(key, atoms)
    return atoms
  }

  private ancestors(key: string): string[] {
    const seen = new Set<string>(), queue = [...this.nodes.get(key)!.parents]
    for (let index = 0; index < queue.length; index++) {
      const parent = queue[index]
      if (seen.has(parent)) continue
      seen.add(parent)
      queue.push(...this.nodes.get(parent)!.parents)
    }
    return [...seen]
  }

  /** One step of the atomically expanded effective relation for an atom. */
  directAtomicRequires(key: string): string[] {
    const known = this.directMemo.get(key)
    if (known) return known
    const result = new Set<string>()
    for (const sourceKey of [key, ...this.ancestors(key)]) {
      const source = this.nodes.get(sourceKey)!
      for (const ref of source.goal.requires ?? []) {
        for (const atom of this.atoms(this.resolve(ref, source.landscapeId))) result.add(atom)
      }
    }
    const direct = sorted(result)
    this.directMemo.set(key, direct)
    return direct
  }

  /** Reach+ of an atom: everything it requires directly or transitively, never the atom itself unless cyclic. */
  reach(key: string): ReadonlySet<string> {
    const known = this.reachMemo.get(key)
    if (known) return known
    const seen = new Set<string>(), queue = [...this.directAtomicRequires(key)]
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index]
      if (seen.has(current)) continue
      seen.add(current)
      queue.push(...this.directAtomicRequires(current))
    }
    this.reachMemo.set(key, seen)
    return seen
  }
}

// Review bindings follow contracts/assessment-completion/v1: UTF-8 JSON with
// recursively sorted object keys, unchanged array order and compact separators.
// The backend hashes the same inputs with Jackson, whose output differs from
// JSON.stringify for non-integer numbers and some control characters, so such
// content is rejected instead of being hashed differently on the two sides.
function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return `{${Object.keys(record).sort(byCodeUnit).map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`
  }
  if (typeof value === 'number' && !Number.isSafeInteger(value)) {
    throw new UnitGraphError(`Review-bound content must use integer numbers, found ${value}`)
  }
  // eslint-disable-next-line no-control-regex
  if (typeof value === 'string' && /[\u0000-\u0007\u000b\u000e-\u001f]/u.test(value)) {
    throw new UnitGraphError('Review-bound content contains an unsupported control character')
  }
  return JSON.stringify(value)
}
const canonicalHash = (value: unknown): string =>
  `sha256:${createHash('sha256').update(canonicalJson(value), 'utf8').digest('hex')}`

export function assessmentReviewRevisions(goal: UnitGraphGoal): { taskRevision: string; rubricRevision: string } {
  const data = goal.examData
  if (!data || typeof data.taskContent !== 'string' || typeof data.solutionContent !== 'string'
    || data.scoring === null || typeof data.scoring !== 'object' || Array.isArray(data.scoring)) {
    throw new UnitGraphError(`Assessment ${goal.id} lacks a task, solution or rubric`)
  }
  return {
    taskRevision: canonicalHash({ taskContent: data.taskContent, solutionContent: data.solutionContent }),
    rubricRevision: canonicalHash(data.scoring),
  }
}

const emptyKindCount = (): Record<AtomicGoalKind, number> => ({ assessment: 0, memory: 0, orientation: 0, ordinary: 0 })
interface ResolvedUnit {
  catalog: LearningUnitCatalog
  unit: LearningUnit
  /** Own goals that resolved to a single-kind atomic goal of the catalog landscape. */
  own: Map<string, AtomicGoalKind>
  valid: boolean
}
const idOf = (key: string): string => key.slice(key.indexOf(':') + 1)

function resolveUnits(catalogs: LearningUnitCatalog[], graph: UnitGraph, report: (finding: UnitFinding) => void): ResolvedUnit[] {
  const resolved: ResolvedUnit[] = []
  const catalogIds = new Set<string>(), unitIds = new Map<string, string>(), landscapes = new Map<string, string>()
  for (const catalog of catalogs) {
    const { catalogId } = catalog
    if (catalogIds.has(catalogId)) report({ code: 'LU-CATALOG', catalogId, message: `Duplicate catalog ID ${catalogId}` })
    catalogIds.add(catalogId)
    // One catalog per landscape keeps completeness and ownership well defined.
    const other = landscapes.get(catalog.landscapeId)
    if (other) report({ code: 'LU-CATALOG', catalogId, message: `Landscape ${catalog.landscapeId} already has catalog ${other}` })
    else landscapes.set(catalog.landscapeId, catalogId)
    if (graph.atomicKeys(catalog.landscapeId).length === 0) {
      report({ code: 'LU-CATALOG', catalogId, message: `Unknown or empty canonical landscape ${catalog.landscapeId}` })
    }
    for (const unit of catalog.units) {
      const entry: ResolvedUnit = { catalog, unit, own: new Map(), valid: true }
      const fail = (finding: Omit<UnitFinding, 'catalogId' | 'unitId'>) => {
        entry.valid = false
        report({ ...finding, catalogId, unitId: unit.id })
      }
      const previous = unitIds.get(unit.id)
      if (previous) fail({ code: 'LU-UNIT-ID', message: `Unit ID ${unit.id} is already declared in catalog ${previous}` })
      else unitIds.set(unit.id, catalogId)
      for (const goalId of unit.ownGoalIds) {
        const key = `${catalog.landscapeId}:${goalId}`
        if (!graph.has(key)) {
          fail({ code: 'LU-REF', goalId, message: `Own goal ${goalId} is not a goal of ${catalog.landscapeId}` })
        } else if (!graph.isAtomic(key)) {
          fail({ code: 'LU-ATOMIC', goalId, message: `Own goal ${goalId} is a cluster; a unit owns atomic goals only` })
        } else if (graph.kinds(key).length > 1) {
          fail({ code: 'LU-KIND', goalId, message: `Own goal ${goalId} is classified as ${graph.kinds(key).join(' and ')}` })
        } else entry.own.set(key, graph.kind(key))
      }
      resolved.push(entry)
    }
  }
  return resolved
}

/** Hierarchy checks; returns the deduplicated total scope T(U) per unit ID where it is defined. */
function checkHierarchy(units: ResolvedUnit[], report: (unit: ResolvedUnit, finding: Omit<UnitFinding, 'catalogId' | 'unitId'>) => void) {
  const byId = new Map(units.map((entry) => [entry.unit.id, entry]))
  const children = new Map<string, string[]>()
  for (const entry of units) {
    const valid: string[] = []
    for (const childId of entry.unit.childUnitIds ?? []) {
      const child = byId.get(childId)
      if (!child) report(entry, { code: 'LU-CHILD', message: `Unknown child unit ${childId}` })
      else if (child.catalog !== entry.catalog) {
        report(entry, { code: 'LU-CHILD', message: `Child unit ${childId} belongs to catalog ${child.catalog.catalogId}` })
      } else if (childId === entry.unit.id) report(entry, { code: 'LU-HIERARCHY', message: 'A unit cannot be its own child' })
      else valid.push(childId)
    }
    children.set(entry.unit.id, valid)
  }
  const scopes = new Map<string, Set<string>>(), state = new Map<string, 'active' | 'done'>(), cyclic = new Set<string>()
  const visit = (id: string, trail: string[]): Set<string> | undefined => {
    if (state.get(id) === 'done') return scopes.get(id)
    if (state.get(id) === 'active') {
      const loop = [...trail.slice(trail.indexOf(id)), id]
      for (const member of new Set(loop)) {
        if (cyclic.has(member)) continue
        cyclic.add(member)
        report(byId.get(member)!, { code: 'LU-HIERARCHY', message: `Unit hierarchy cycle: ${loop.join(' -> ')}` })
      }
      return undefined
    }
    state.set(id, 'active')
    const scope = new Set(byId.get(id)!.own.keys())
    let defined = true
    for (const childId of children.get(id)!) {
      const childScope = visit(childId, [...trail, id])
      if (childScope) for (const key of childScope) scope.add(key)
      else defined = false
    }
    state.set(id, 'done')
    if (!defined || cyclic.has(id)) return undefined
    scopes.set(id, scope)
    return scope
  }
  for (const entry of units) visit(entry.unit.id, [])
  for (const entry of units) {
    const scope = scopes.get(entry.unit.id)
    if (scope?.size === 0) {
      report(entry, { code: 'LU-EMPTY-SCOPE', message: 'Total scope is empty; a unit needs own goals or required children with goals' })
    } else if (!scope && !cyclic.has(entry.unit.id)) {
      report(entry, { code: 'LU-HIERARCHY', message: 'Total scope is undefined because a descendant unit lies on a hierarchy cycle' })
    }
  }
  return scopes
}

function coveredGoalKeys(graph: UnitGraph, assessmentKey: string): { keys: string[]; problems: string[] } {
  const declared = graph.goal(assessmentKey).examData?.coveredGoalIds
  if (declared === undefined || declared === null) return { keys: [], problems: [] }
  if (!Array.isArray(declared)) return { keys: [], problems: ['coveredGoalIds is not a list'] }
  const keys: string[] = [], problems: string[] = []
  for (const ref of declared) {
    try {
      const key = graph.resolve(ref as string, graph.landscapeId(assessmentKey))
      if (graph.isAtomic(key)) keys.push(key)
      else problems.push(`${ref} is a cluster; coverage names atomic goals`)
    } catch (error) {
      problems.push(error instanceof Error ? error.message : String(error))
    }
  }
  return { keys, problems }
}

export interface UnitValidationOptions {
  /** Repository-relative existence check for review records; omit to skip it. */
  reviewRecordExists?: (path: string) => boolean
}

export function validateLearningUnitCatalogs(
  catalogs: LearningUnitCatalog[], graph: UnitGraph, options: UnitValidationOptions = {},
): UnitValidationResult {
  const findings: UnitFinding[] = []
  const units = resolveUnits(catalogs, graph, (finding) => findings.push(finding))
  const fail = (entry: ResolvedUnit, finding: Omit<UnitFinding, 'catalogId' | 'unitId'>) => {
    entry.valid = false
    findings.push({ ...finding, catalogId: entry.catalog.catalogId, unitId: entry.unit.id })
  }
  const scopes = checkHierarchy(units, fail)

  // R4, first half: no goal has two directly owning units.
  const owners = new Map<string, ResolvedUnit[]>()
  for (const entry of units) for (const key of entry.own.keys()) owners.set(key, [...(owners.get(key) ?? []), entry])
  for (const [key, owning] of owners) {
    if (owning.length < 2) continue
    for (const entry of owning) {
      fail(entry, { code: 'LU-R4-MULTIPLE', goalId: idOf(key),
        message: `Goal ${idOf(key)} is owned by ${owning.map((other) => other.unit.id).join(', ')}; exactly one unit owns a goal` })
    }
  }

  const summaries: UnitSummary[] = []
  for (const entry of units) {
    const assessments = [...entry.own].filter(([, kind]) => kind === 'assessment').map(([key]) => key)
    const memories = [...entry.own].filter(([, kind]) => kind === 'memory').map(([key]) => key)
    const ordinary = [...entry.own].filter(([, kind]) => kind === 'ordinary').map(([key]) => key)
    const reviewed = new Set<string>()
    try {
      for (const key of entry.own.keys()) {
        if (graph.reach(key).has(key)) fail(entry, { code: 'LU-GRAPH', goalId: idOf(key), message: `Goal ${idOf(key)} requires itself transitively` })
      }
      const assessed = new Set(assessments.flatMap((key) => [...graph.reach(key)]))
      const memorized = new Set(memories.flatMap((key) => [...graph.reach(key)]))
      // R1: an own assessment requires the goal; a path that leads only to a memory goal does not count.
      for (const key of ordinary) {
        if (assessed.has(key)) continue
        fail(entry, { code: 'LU-R1', goalId: idOf(key), message: memorized.has(key)
          ? `Goal ${idOf(key)} is required only by an own memory goal; an own assessment must require it`
          : `Goal ${idOf(key)} lies on no prerequisite path from an own assessment of the unit` })
      }
      // R3: every coverage claim of an own assessment is a goal that assessment requires.
      const coverage = new Map<string, Set<string>>()
      for (const assessment of assessments) {
        const { keys, problems } = coveredGoalKeys(graph, assessment)
        coverage.set(assessment, new Set(keys))
        for (const problem of problems) {
          fail(entry, { code: 'LU-R3', goalId: idOf(assessment), message: `Assessment ${idOf(assessment)} coverage: ${problem}` })
        }
        for (const key of keys) {
          if (graph.reach(assessment).has(key)) continue
          fail(entry, { code: 'LU-R3', goalId: idOf(assessment),
            message: `Assessment ${idOf(assessment)} claims coverage of ${idOf(key)} without requiring it` })
        }
      }
      // R2 evidence must be well formed and current wherever it is claimed.
      for (const review of entry.unit.coverageReviews ?? []) {
        const assessment = `${entry.catalog.landscapeId}:${review.assessmentGoalId}`
        const evidence = (message: string) => fail(entry, { code: 'LU-R2-EVIDENCE', goalId: review.assessmentGoalId, message })
        if (entry.own.get(assessment) !== 'assessment') {
          evidence(`Coverage review names ${review.assessmentGoalId}, which is not an own assessment of the unit`)
          continue
        }
        if (options.reviewRecordExists && !options.reviewRecordExists(review.reference)) {
          evidence(`Review record ${review.reference} does not exist`)
        }
        const revisions = assessmentReviewRevisions(graph.goal(assessment))
        if (revisions.taskRevision !== review.taskRevision || revisions.rubricRevision !== review.rubricRevision) {
          evidence(`Coverage review of ${review.assessmentGoalId} is stale: task or rubric changed since the review`)
          continue
        }
        for (const goalId of review.goalIds) {
          const key = `${entry.catalog.landscapeId}:${goalId}`
          if (entry.own.get(key) !== 'ordinary') evidence(`Reviewed goal ${goalId} is not an own ordinary goal of the unit`)
          else if (!graph.reach(assessment).has(key)) evidence(`Reviewed goal ${goalId} is not required by assessment ${review.assessmentGoalId}`)
          else if (!coverage.get(assessment)!.has(key)) evidence(`Reviewed goal ${goalId} is missing from coveredGoalIds of ${review.assessmentGoalId}`)
          else reviewed.add(key)
        }
      }
    } catch (error) {
      if (!(error instanceof UnitGraphError)) throw error
      fail(entry, { code: 'LU-GRAPH', message: error.message })
    }
    const ownGoals = emptyKindCount()
    for (const kind of entry.own.values()) ownGoals[kind]++
    summaries.push({
      catalogId: entry.catalog.catalogId, unitId: entry.unit.id, ownGoals,
      totalScope: scopes.get(entry.unit.id)?.size ?? 0, structurallyValid: entry.valid,
      goalsWithoutReviewedCoverage: ordinary.filter((key) => !reviewed.has(key)).map(idOf).sort(byCodeUnit),
    })
  }
  // A defect found after a unit was summarized (shared ownership) still marks it invalid.
  for (const summary of summaries) {
    summary.structurallyValid = units.find((entry) => entry.unit.id === summary.unitId && entry.catalog.catalogId === summary.catalogId)!.valid
  }

  // R4, second half: a complete catalog leaves no atomic goal of its landscape without an owner.
  const ledgers: CatalogLedger[] = catalogs.map((catalog) => {
    const atomic = graph.atomicKeys(catalog.landscapeId)
    const unowned = emptyKindCount()
    for (const key of atomic) {
      if (owners.has(key)) continue
      unowned[graph.kind(key)]++
      if (catalog.completeness === 'complete') {
        findings.push({ code: 'LU-R4-UNOWNED', catalogId: catalog.catalogId, goalId: idOf(key),
          message: `Goal ${idOf(key)} has no owning unit although the catalog is declared complete` })
      }
    }
    return {
      catalogId: catalog.catalogId, landscapeId: catalog.landscapeId, completeness: catalog.completeness,
      atomicGoals: atomic.length, ownedGoals: atomic.filter((key) => owners.has(key)).length, unownedGoals: unowned,
    }
  })
  return { findings, units: summaries, ledgers }
}

/**
 * R1 inside every offered curriculum: wherever the offered view itself targets
 * an own ordinary goal of a unit, an own assessment that requires it must be
 * learnable there, i.e. lie in the closed learning scope. A goal that is in
 * scope only because the prerequisite closure added it is acquired as a single
 * competence; the curriculum does not offer its unit, so no assessment is
 * demanded for it. Prerequisite paths use the unpruned canonical graph.
 */
export function validateOfferedScopes(
  catalogs: LearningUnitCatalog[], graph: UnitGraph, classes: OfferedMembershipClass[],
): UnitFinding[] {
  const findings: UnitFinding[] = []
  for (const catalog of catalogs) {
    const offered = classes.filter((membership) => membership.landscapeId === catalog.landscapeId)
    for (const unit of catalog.units) {
      const own = unit.ownGoalIds.map((goalId) => `${catalog.landscapeId}:${goalId}`)
        .filter((key) => graph.has(key) && graph.isAtomic(key))
      const ordinary = own.filter((key) => graph.kind(key) === 'ordinary')
      const assessments = own.filter((key) => graph.kind(key) === 'assessment')
      // goal -> classes whose view targets it while no own assessment requiring it is in scope.
      const uncovered = new Map<string, OfferedMembershipClass[]>()
      for (const membership of offered) {
        const assessed = new Set(assessments.filter((key) => membership.targetGoalIds.has(idOf(key)))
          .flatMap((key) => [...graph.reach(key)]))
        for (const key of ordinary) {
          if (!membership.seedTargetGoalIds.has(idOf(key)) || assessed.has(key)) continue
          uncovered.set(key, [...(uncovered.get(key) ?? []), membership])
        }
      }
      for (const [key, memberships] of uncovered) {
        const configurations = memberships.reduce((count, membership) => count + membership.members.length, 0)
        findings.push({ code: 'LU-R1-OFFERED', catalogId: catalog.catalogId, unitId: unit.id, goalId: idOf(key),
          message: `Goal ${idOf(key)} is a view target without a learnable own assessment in ${configurations} configuration(s), e.g. ${memberships[0].members[0]}` })
      }
    }
  }
  return findings
}
