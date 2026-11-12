// SPDX-License-Identifier: Apache-2.0
/**
 * Structural validity of the learning units authored in a landscape.
 *
 * A learning unit is a `programUnits` entry of kind `learningUnit`; it owns
 * atomic goals through `goalPlacements` of relation `own`, requires the units
 * that name it as `parentUnitId`, and reviewed coverage is recorded on the
 * owned assessment as `examData.coverageReview` (curriculum-package contract
 * 1.2). Graph Definition §11 and §13.3 give the unit validity rules:
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
    coverageReview?: unknown
  } | null
  extendedData?: Record<string, unknown> | null
}
export interface UnitGraphProgramUnit { id?: unknown; kind?: unknown; parentUnitId?: unknown; [field: string]: unknown }
export interface UnitGraphGoalPlacement { goalId?: unknown; unitId?: unknown; relation?: unknown; context?: unknown }
export interface UnitGraphLandscape {
  landscapeId: string
  goals: UnitGraphGoal[]
  programUnits?: UnitGraphProgramUnit[] | null
  goalPlacements?: UnitGraphGoalPlacement[] | null
  learningUnitCoverage?: unknown
}

export type AtomicGoalKind = 'assessment' | 'memory' | 'orientation' | 'ordinary'

export interface CoverageReview {
  assessmentGoalId: string
  goalIds: string[]
  reference: string
  taskRevision: string
  rubricRevision: string
}
/** One learning unit as read from the placement layer. */
export interface LearningUnit {
  id: string
  ownGoalIds: string[]
  childUnitIds: string[]
  coverageReviews: CoverageReview[]
}
/** The learning units of one landscape. */
export interface LearningUnitCatalog {
  landscapeId: string
  completeness: 'partial' | 'complete'
  units: LearningUnit[]
}

export type UnitFindingCode =
  | 'LU-UNIT' | 'LU-UNIT-ID' | 'LU-PLACEMENT' | 'LU-REF' | 'LU-ATOMIC' | 'LU-KIND' | 'LU-GRAPH'
  | 'LU-CHILD' | 'LU-HIERARCHY' | 'LU-EMPTY-SCOPE'
  | 'LU-R1' | 'LU-R1-OFFERED' | 'LU-R2-EVIDENCE' | 'LU-R3' | 'LU-R4-MULTIPLE' | 'LU-R4-UNOWNED'
export interface UnitFinding {
  code: UnitFindingCode
  landscapeId: string
  unitId?: string
  goalId?: string
  message: string
}
export interface UnitSummary {
  landscapeId: string
  unitId: string
  ownGoals: Record<AtomicGoalKind, number>
  totalScope: number
  structurallyValid: boolean
  /** Own ordinary goals without reviewed coverage (R2). Empty means the evidence is complete. */
  goalsWithoutReviewedCoverage: string[]
}
export interface LandscapeLedger {
  landscapeId: string
  completeness: 'partial' | 'complete'
  atomicGoals: number
  ownedGoals: number
  unownedGoals: Record<AtomicGoalKind, number>
}
export interface UnitValidationResult {
  findings: UnitFinding[]
  units: UnitSummary[]
  ledgers: LandscapeLedger[]
  catalogs: LearningUnitCatalog[]
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
const idOf = (key: string): string => key.slice(key.indexOf(':') + 1)
const unitKey = (landscapeId: string, unitId: string): string => `${landscapeId}:${unitId}`

export const LEARNING_UNIT_KIND = 'learningUnit'
export const OWN_RELATION = 'own'
const unitFields = new Set(['id', 'kind', 'label', 'labelEn', 'promise', 'promiseEn', 'revision', 'parentUnitId', 'order'])
const unitOnlyFields = ['labelEn', 'promise', 'promiseEn', 'revision']
const reviewFields = new Set(['goalIds', 'reference', 'taskRevision', 'rubricRevision'])
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const revision = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-v[1-9][0-9]*$/u
const sha256 = /^sha256:[0-9a-f]{64}$/u
const repoPath = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]+$/u

export interface DerivedLearningUnits {
  catalogs: LearningUnitCatalog[]
  findings: UnitFinding[]
  /** `landscapeId:unitId` of units whose declaration is itself malformed. */
  invalidUnits: ReadonlySet<string>
}

/**
 * Reads the learning units from the placement layer and reports every
 * declaration that is not a well-formed part of the contract. The format is
 * closed: a field the contract does not define is a finding, so access rules
 * or waiver lists cannot ride along.
 */
export function deriveLearningUnits(landscapes: UnitGraphLandscape[]): DerivedLearningUnits {
  const catalogs: LearningUnitCatalog[] = [], findings: UnitFinding[] = [], invalidUnits = new Set<string>()
  for (const landscape of landscapes) {
    const { landscapeId } = landscape
    const programUnits = landscape.programUnits ?? [], placements = landscape.goalPlacements ?? []
    const report = (code: UnitFindingCode, message: string, at: { unitId?: string; goalId?: string } = {}) => {
      if (at.unitId) invalidUnits.add(unitKey(landscapeId, at.unitId))
      findings.push({ code, landscapeId, ...at, message })
    }
    const kindOf = new Map<string, unknown>(), units = new Map<string, LearningUnit>()
    for (const unit of programUnits) {
      const id = typeof unit.id === 'string' ? unit.id : ''
      const isLearningUnit = unit.kind === LEARNING_UNIT_KIND
      if (kindOf.has(id)) {
        if (isLearningUnit || kindOf.get(id) === LEARNING_UNIT_KIND) report('LU-UNIT-ID', `Program unit ID ${id} is declared more than once`, { unitId: id })
        continue
      }
      kindOf.set(id, unit.kind)
      if (!isLearningUnit) {
        const stray = unitOnlyFields.filter((field) => field in unit)
        if (stray.length) report('LU-UNIT', `Program unit ${id} of kind ${String(unit.kind)} carries learning-unit fields: ${stray.join(', ')}`)
        continue
      }
      units.set(id, { id, ownGoalIds: [], childUnitIds: [], coverageReviews: [] })
      const problems = [
        ...(slug.test(id) ? [] : ['id is not a lowercase slug']),
        ...['label', 'labelEn', 'promise', 'promiseEn'].filter((field) => !hasText(unit[field])).map((field) => `${field} is missing`),
        ...(typeof unit.revision === 'string' && revision.test(unit.revision) ? [] : ['revision is not YYYY-MM-DD-vN']),
        ...Object.keys(unit).filter((field) => !unitFields.has(field)).map((field) => `field ${field} is not part of the contract`),
      ]
      for (const problem of problems) report('LU-UNIT', `Learning unit ${id}: ${problem}`, { unitId: id })
    }
    // The parent requires the unit as a child; both ends are learning units.
    for (const unit of programUnits) {
      if (unit.parentUnitId === undefined || unit.parentUnitId === null || typeof unit.id !== 'string') continue
      const parent = String(unit.parentUnitId), child = units.get(unit.id)
      if (child && units.has(parent)) units.get(parent)!.childUnitIds.push(child.id)
      else if (child) report('LU-CHILD', `Parent ${parent} of learning unit ${child.id} is not a learning unit of this landscape`, { unitId: child.id })
      else if (units.has(parent)) report('LU-CHILD', `Program unit ${unit.id} of kind ${String(unit.kind)} names learning unit ${parent} as parent`, { unitId: parent })
    }
    const owner = new Map<string, string[]>(), seen = new Set<string>()
    for (const placement of placements) {
      const goalId = String(placement.goalId), unitId = String(placement.unitId), unit = units.get(unitId)
      if (placement.relation !== OWN_RELATION) {
        if (unit) report('LU-PLACEMENT', `Placement of ${goalId} in learning unit ${unitId} uses relation ${String(placement.relation)}; a learning unit takes only "${OWN_RELATION}"`, { unitId, goalId })
        continue
      }
      if (!unit) {
        report('LU-PLACEMENT', `Goal ${goalId} is owned by ${unitId}, which is not a learning unit of this landscape`, { goalId })
        continue
      }
      if (placement.context !== undefined && placement.context !== null) {
        report('LU-PLACEMENT', `Ownership of ${goalId} by ${unitId} carries a context; ownership is not scope-specific in this contract version`, { unitId, goalId })
      }
      if (seen.has(`${goalId} ${unitId}`)) {
        report('LU-PLACEMENT', `Ownership of ${goalId} by ${unitId} is declared more than once`, { unitId, goalId })
        continue
      }
      seen.add(`${goalId} ${unitId}`)
      unit.ownGoalIds.push(goalId)
      owner.set(goalId, [...(owner.get(goalId) ?? []), unitId])
    }
    for (const goal of landscape.goals) {
      const review = goal.examData?.coverageReview
      if (review === undefined || review === null) continue
      const evidence = (message: string, unitId?: string) => report('LU-R2-EVIDENCE', message, { goalId: goal.id, ...(unitId ? { unitId } : {}) })
      const owners = owner.get(goal.id) ?? []
      if (owners.length !== 1) {
        evidence(`Coverage review on ${goal.id}, which ${owners.length ? 'several units own' : 'no learning unit owns'}`)
        continue
      }
      const record = review as Record<string, unknown>
      const goalIds = Array.isArray(record.goalIds) ? record.goalIds : []
      const wellFormed = typeof review === 'object' && !Array.isArray(review)
        && Object.keys(record).every((field) => reviewFields.has(field))
        && goalIds.length > 0 && goalIds.every((id) => hasText(id)) && new Set(goalIds).size === goalIds.length
        && typeof record.reference === 'string' && repoPath.test(record.reference)
        && typeof record.taskRevision === 'string' && sha256.test(record.taskRevision)
        && typeof record.rubricRevision === 'string' && sha256.test(record.rubricRevision)
      if (!wellFormed) {
        evidence(`Coverage review on ${goal.id} is malformed: it needs goalIds, a repository-relative reference and sha256 task and rubric revisions, and nothing else`, owners[0])
        continue
      }
      units.get(owners[0])!.coverageReviews.push({
        assessmentGoalId: goal.id, goalIds: goalIds as string[], reference: record.reference as string,
        taskRevision: record.taskRevision as string, rubricRevision: record.rubricRevision as string,
      })
    }
    const coverage = landscape.learningUnitCoverage
    if (coverage !== undefined && coverage !== null && coverage !== 'partial' && coverage !== 'complete') {
      report('LU-UNIT', `learningUnitCoverage is ${JSON.stringify(coverage)}; it is "partial" or "complete"`)
    }
    if (units.size || coverage === 'complete' || coverage === 'partial') {
      catalogs.push({ landscapeId, completeness: coverage === 'complete' ? 'complete' : 'partial', units: [...units.values()] })
    }
  }
  return { catalogs, findings, invalidUnits }
}

interface ResolvedUnit {
  catalog: LearningUnitCatalog
  unit: LearningUnit
  key: string
  /** Own goals that resolved to a single-kind atomic goal of the landscape. */
  own: Map<string, AtomicGoalKind>
  valid: boolean
}
type Fail = (entry: ResolvedUnit, finding: Omit<UnitFinding, 'landscapeId' | 'unitId'>) => void

function resolveUnits(catalogs: LearningUnitCatalog[], graph: UnitGraph, invalidUnits: ReadonlySet<string>, fail: Fail): ResolvedUnit[] {
  const resolved: ResolvedUnit[] = []
  for (const catalog of catalogs) for (const unit of catalog.units) {
    const key = unitKey(catalog.landscapeId, unit.id)
    const entry: ResolvedUnit = { catalog, unit, key, own: new Map(), valid: !invalidUnits.has(key) }
    for (const goalId of unit.ownGoalIds) {
      const goalKey = `${catalog.landscapeId}:${goalId}`
      if (!graph.has(goalKey)) {
        fail(entry, { code: 'LU-REF', goalId, message: `Own goal ${goalId} is not a goal of landscape ${catalog.landscapeId}` })
      } else if (!graph.isAtomic(goalKey)) {
        fail(entry, { code: 'LU-ATOMIC', goalId, message: `Own goal ${goalId} is a cluster; a unit owns atomic goals only` })
      } else if (graph.kinds(goalKey).length > 1) {
        fail(entry, { code: 'LU-KIND', goalId, message: `Own goal ${goalId} is classified as ${graph.kinds(goalKey).join(' and ')}` })
      } else entry.own.set(goalKey, graph.kind(goalKey))
    }
    resolved.push(entry)
  }
  return resolved
}

/** Hierarchy checks; returns the deduplicated total scope T(U) per unit key where it is defined. */
function checkHierarchy(units: ResolvedUnit[], fail: Fail) {
  const byKey = new Map(units.map((entry) => [entry.key, entry]))
  const childKeys = (entry: ResolvedUnit) => entry.unit.childUnitIds.map((id) => unitKey(entry.catalog.landscapeId, id))
  const scopes = new Map<string, Set<string>>(), state = new Map<string, 'active' | 'done'>(), cyclic = new Set<string>()
  const visit = (key: string, trail: string[]): Set<string> | undefined => {
    if (state.get(key) === 'done') return scopes.get(key)
    if (state.get(key) === 'active') {
      const loop = [...trail.slice(trail.indexOf(key)), key]
      for (const member of new Set(loop)) {
        if (cyclic.has(member)) continue
        cyclic.add(member)
        fail(byKey.get(member)!, { code: 'LU-HIERARCHY', message: `Unit hierarchy cycle: ${loop.map(idOf).join(' -> ')}` })
      }
      return undefined
    }
    state.set(key, 'active')
    const entry = byKey.get(key)!, scope = new Set(entry.own.keys())
    let defined = true
    for (const child of childKeys(entry)) {
      const childScope = visit(child, [...trail, key])
      if (childScope) for (const goal of childScope) scope.add(goal)
      else defined = false
    }
    state.set(key, 'done')
    if (!defined || cyclic.has(key)) return undefined
    scopes.set(key, scope)
    return scope
  }
  for (const entry of units) visit(entry.key, [])
  for (const entry of units) {
    const scope = scopes.get(entry.key)
    if (scope?.size === 0) {
      fail(entry, { code: 'LU-EMPTY-SCOPE', message: 'Total scope is empty; a unit needs own goals or required children with goals' })
    } else if (!scope && !cyclic.has(entry.key)) {
      fail(entry, { code: 'LU-HIERARCHY', message: 'Total scope is undefined because a required child unit lies on a hierarchy cycle' })
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

export function validateLearningUnits(
  landscapes: UnitGraphLandscape[], graph: UnitGraph, options: UnitValidationOptions = {},
): UnitValidationResult {
  const derived = deriveLearningUnits(landscapes)
  const { catalogs } = derived, findings = [...derived.findings]
  const fail: Fail = (entry, finding) => {
    entry.valid = false
    findings.push({ ...finding, landscapeId: entry.catalog.landscapeId, unitId: entry.unit.id })
  }
  const units = resolveUnits(catalogs, graph, derived.invalidUnits, fail)
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

  const reviewedByUnit = new Map<string, Set<string>>()
  for (const entry of units) {
    const landscapeId = entry.catalog.landscapeId
    const assessments = [...entry.own].filter(([, kind]) => kind === 'assessment').map(([key]) => key)
    const memories = [...entry.own].filter(([, kind]) => kind === 'memory').map(([key]) => key)
    const ordinary = [...entry.own].filter(([, kind]) => kind === 'ordinary').map(([key]) => key)
    const reviewed = new Set<string>()
    reviewedByUnit.set(entry.key, reviewed)
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
      // R2 evidence must be founded and current wherever it is claimed.
      for (const review of entry.unit.coverageReviews) {
        const assessment = `${landscapeId}:${review.assessmentGoalId}`
        const evidence = (message: string) => fail(entry, { code: 'LU-R2-EVIDENCE', goalId: review.assessmentGoalId, message })
        if (entry.own.get(assessment) !== 'assessment') {
          evidence(`Coverage review on ${review.assessmentGoalId}, which is not an assessment`)
          continue
        }
        if (options.reviewRecordExists && !options.reviewRecordExists(review.reference)) {
          evidence(`Review record ${review.reference} does not exist`)
        }
        let revisions: ReturnType<typeof assessmentReviewRevisions>
        try {
          revisions = assessmentReviewRevisions(graph.goal(assessment))
        } catch (error) {
          if (!(error instanceof UnitGraphError)) throw error
          evidence(error.message)
          continue
        }
        if (revisions.taskRevision !== review.taskRevision || revisions.rubricRevision !== review.rubricRevision) {
          evidence(`Coverage review of ${review.assessmentGoalId} is stale: task or rubric changed since the review`)
          continue
        }
        for (const goalId of review.goalIds) {
          const key = `${landscapeId}:${goalId}`
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
  }
  const summaries: UnitSummary[] = units.map((entry) => {
    const ownGoals = emptyKindCount()
    for (const kind of entry.own.values()) ownGoals[kind]++
    return {
      landscapeId: entry.catalog.landscapeId, unitId: entry.unit.id, ownGoals,
      totalScope: scopes.get(entry.key)?.size ?? 0, structurallyValid: entry.valid,
      goalsWithoutReviewedCoverage: [...entry.own].filter(([key, kind]) => kind === 'ordinary' && !reviewedByUnit.get(entry.key)!.has(key))
        .map(([key]) => idOf(key)).sort(byCodeUnit),
    }
  })

  // R4, second half: a landscape declared complete leaves no atomic goal without an owner.
  const ledgers: LandscapeLedger[] = catalogs.map((catalog) => {
    const atomic = graph.atomicKeys(catalog.landscapeId)
    const unowned = emptyKindCount()
    for (const key of atomic) {
      if (owners.has(key)) continue
      unowned[graph.kind(key)]++
      if (catalog.completeness === 'complete') {
        findings.push({ code: 'LU-R4-UNOWNED', landscapeId: catalog.landscapeId, goalId: idOf(key),
          message: `Goal ${idOf(key)} has no owning unit although the landscape declares learningUnitCoverage "complete"` })
      }
    }
    return {
      landscapeId: catalog.landscapeId, completeness: catalog.completeness,
      atomicGoals: atomic.length, ownedGoals: atomic.filter((key) => owners.has(key)).length, unownedGoals: unowned,
    }
  })
  return { findings, units: summaries, ledgers, catalogs }
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
        findings.push({ code: 'LU-R1-OFFERED', landscapeId: catalog.landscapeId, unitId: unit.id, goalId: idOf(key),
          message: `Goal ${idOf(key)} is a view target without a learnable own assessment in ${configurations} configuration(s), e.g. ${memberships[0].members[0]}` })
      }
    }
  }
  return findings
}
