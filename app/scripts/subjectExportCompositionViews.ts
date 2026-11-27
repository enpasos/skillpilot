import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  createCompositionEffectiveRequirementsReader,
  getCompositionProjectionRole,
  normalizeCompositionView,
  readCompositionViewFormatVersion,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape, normalizeGoalRef, type CanonicalAuthoringLandscape } from '../src/utils/authoring/canonicalAuthoring'

export const COMPOSITION_VIEW_13_SOURCE_PATH = 'contracts/composition-view/v1.3/composition-view.schema.json'
export const COMPOSITION_VIEW_13_PACKAGE_PATH = 'schemas/composition-view/v1.3/composition-view.schema.json'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
let validateV13: ReturnType<Ajv2020['compile']> | undefined
export type SubjectCompositionGoal = {
  type?: string; contains?: readonly string[]; requires?: readonly string[]; coveredGoalIds?: readonly string[]
  tags?: readonly string[]; landscapeId?: string
  examData?: unknown
}
export interface SubjectCompositionGraphContext {
  rootGoalIdByLandscapeId?: ReadonlyMap<string, string>
  /** Registered atom excerpts prove their listed edges, not absence of
   * prerequisites inherited from an unbundled canonical parent. */
  incompleteGoalIds?: ReadonlySet<string>
}
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)
const coverageOf = (goal: SubjectCompositionGoal): readonly string[] => goal.coveredGoalIds
  ?? (object(goal.examData) && Array.isArray(goal.examData.coveredGoalIds)
    ? goal.examData.coveredGoalIds.filter((id): id is string => typeof id === 'string') : [])

/** The ordinary subject export keeps source views. Reject unsupported semantics
 * before sanitation and again on import; never normalise an unknown role. */
export function subjectExportCompositionViewIssues(value: unknown, goals?: ReadonlyMap<string, SubjectCompositionGoal>, context: SubjectCompositionGraphContext = {}): string[] {
  const issues: string[] = []
  if (!object(value)) return ['Composition view must be an object']
  let version: ReturnType<typeof readCompositionViewFormatVersion>
  try { version = readCompositionViewFormatVersion(value) }
  catch (error) { return [error instanceof Error ? error.message : String(error)] }
  const schema = value.$schema
  const expected = version === '1.2' ? 'https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json'
    : version === '1.3' ? 'https://skillpilot.com/schemas/composition-view/v1.3/composition-view.schema.json'
      : version === '1.1' ? 'https://skillpilot.com/schemas/curriculum-package/v1.3/composition-view.schema.json'
      : 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json'
  if (schema !== undefined && schema !== expected || version !== '1.0' && schema !== expected) {
    issues.push('Composition source schema and view format version differ')
  }
  if (version === '1.3') {
    validateV13 ??= new Ajv2020({ allErrors: true, strict: false }).compile(
      JSON.parse(readFileSync(resolve(root, COMPOSITION_VIEW_13_SOURCE_PATH), 'utf8')))
    if (!validateV13(value)) issues.push(`Composition view 1.3 violates its closed source schema: ${JSON.stringify(validateV13.errors?.slice(0, 3))}`)
  }
  if (!Array.isArray(value.rootNodes)) return [...issues, 'Composition rootNodes must be an array']
  const explicitRoles = new Map<string, string[]>()
  const pending = value.rootNodes.map(node => ({ node, depth: 0 }))
  while (pending.length) {
    const { node, depth } = pending.pop()!
    if (!object(node)) { issues.push('Composition node must be an object'); continue }
    if (node.projectionRole !== undefined) {
      if (node.kind !== 'goalEntry' && node.kind !== 'canonicalSubtree') issues.push('projectionRole requires a goal entry')
      else {
        try { getCompositionProjectionRole(node as unknown as Parameters<typeof getCompositionProjectionRole>[0]) }
        catch (error) { issues.push(error instanceof Error ? error.message : String(error)) }
      }
      if (node.projectionRole === 'voluntary' && version !== '1.3') issues.push('voluntary requires view format 1.3')
    }
    if ('acquisitionPlacement' in node && (version !== '1.2' && version !== '1.3' || node.kind !== 'goalEntry'
      || node.projectionRole !== 'prerequisiteOnly' || node.acquisitionPlacement !== true || depth === 0)) {
      issues.push('acquisitionPlacement requires a nested prerequisiteOnly goalEntry in view format 1.2 or 1.3')
    }
    if (node.kind === 'goalEntry' && typeof node.goalId === 'string') {
      const roles = explicitRoles.get(node.goalId) ?? []
      roles.push(typeof node.projectionRole === 'string' ? node.projectionRole : 'target')
      explicitRoles.set(node.goalId, roles)
      const goal = goals?.get(node.goalId)
      if (node.projectionRole === 'voluntary' && goal && (goal.contains?.length || goal.type !== undefined && goal.type !== 'atomic')) {
        issues.push(`Voluntary entry is not a canonical atom: ${node.goalId}`)
      }
    }
    if (Array.isArray(node.children)) pending.push(...node.children.map(child => ({ node: child, depth: depth + 1 })))
  }
  if (version === '1.3') for (const [id, roles] of explicitRoles) {
    if (roles.filter(role => role === 'voluntary').length > 1) issues.push(`Duplicate visible voluntary goal place: ${id}`)
    if (roles.includes('voluntary') && roles.some(role => role !== 'voluntary')) issues.push(`Conflicting effective composition roles: ${id}`)
  }
  if (version === '1.3' && goals && !issues.length) {
    try {
      const roots = new Map(context.rootGoalIdByLandscapeId)
      for (const [id, goal] of goals) if (goal.landscapeId && goal.tags?.includes('root')) {
        const existing = roots.get(goal.landscapeId)
        if (existing && existing !== id) issues.push(`Ambiguous canonical landscape root: ${goal.landscapeId}`)
        else roots.set(goal.landscapeId, id)
      }
      const canonical = normalizeCanonicalLandscape({ landscapeId: value.landscapeId, title: 'Composition transport graph',
        goals: [...goals].map(([id, goal]) => ({ id, title: id, type: goal.type,
          contains: [...goal.contains ?? []], requires: [...goal.requires ?? []],
          tags: roots.get(String(value.landscapeId)) === id ? ['root'] : [],
          examData: { coveredGoalIds: [...coverageOf(goal)] },
        })) })
      const canonicalById = new Map(canonical.goals.map(goal => [goal.id, goal]))
      const landscapes = new Map<string, CanonicalAuthoringLandscape>()
      for (const [landscapeId, id] of roots) {
        const rootGoal = canonicalById.get(id)
        if (rootGoal) landscapes.set(landscapeId, { landscapeId, title: landscapeId, goals: [{ ...rootGoal, tags: ['root'] }] })
      }
      const compiled = compileCompositionView(normalizeCompositionView(value), canonical, canonical, landscapes)
      issues.push(...compiled.findings.filter(finding => finding.severity === 'error')
        .map(finding => `${finding.code}${finding.goalId ? ` ${finding.goalId}` : ''}: ${finding.message}`))
      const roles = collectCompositionProjectionRoleGoalIds(value.rootNodes as CompositionViewNode[], goals, roots)
      for (const id of new Set([...roles.targetGoalIds, ...roles.prerequisiteOnlyGoalIds, ...roles.voluntaryGoalIds])) {
        if (!goals.has(id)) issues.push(`Composition role has no bound canonical goal: ${id}`)
        else if (context.incompleteGoalIds?.has(id)) issues.push(`Composition 1.3 role needs a complete foreign canonical body: ${id}; use a full-standalone curriculum package`)
      }
      const effectiveRequirements = createCompositionEffectiveRequirementsReader(goals)
      const seen = new Set<string>(), needed = [...roles.targetAtomicGoalIds, ...roles.voluntaryAtomicGoalIds]
      while (needed.length) {
        const id = needed.pop()!
        if (seen.has(id)) continue
        seen.add(id)
        const goal = goals.get(id)
        if (!goal) issues.push(`Composition learning path has no bound canonical goal: ${id}`)
        else {
          if (context.incompleteGoalIds?.has(id)) issues.push(`Composition 1.3 learning path needs a complete foreign canonical body: ${id}; use a full-standalone curriculum package`)
          needed.push(...(goal.contains ?? []).map(ref => goals.has(ref) ? ref : normalizeGoalRef(ref)), ...effectiveRequirements(id))
          for (const covered of coverageOf(goal)) {
            const coverageSeen = new Set<string>(), coverage = [covered]
            while (coverage.length) {
              const reference = coverage.pop()!
              const key = goals.has(reference) ? reference : normalizeGoalRef(reference)
              if (coverageSeen.has(key)) continue
              coverageSeen.add(key)
              const coveredGoal = goals.get(key)
              if (!coveredGoal) issues.push(`Assessment coverage has no bound canonical goal: ${reference}`)
              else coverage.push(...coveredGoal.contains ?? [])
            }
          }
        }
      }
    } catch (error) { issues.push(error instanceof Error ? error.message : String(error)) }
  }
  return issues
}
