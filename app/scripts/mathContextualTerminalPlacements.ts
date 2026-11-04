import { applyQ3WholeScopePlacements, withoutQ3WholeScopePlacements } from './mathQ3WholeScopePlacements'
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { applyMathAssessmentScopeOperations, type MathAssessmentScopeOperation } from './mathStageScopePolicy'
import { collectCompositionProjectionRoleGoalIds } from '../src/utils/authoring/compositionViewAuthoring'
import type { CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'

const finitePath = 'curricula/DE/Gymnasium/assessments/mathematik/contextual-terminal-assessments-2026-11-04-v1/finite-scope-operations.json'
const policyPath = 'app/scripts/config/math-country-seki-stage-policy.json'
type View = { viewId: string; scope?: Record<string, string | undefined>; rootNodes: CompositionViewNode[] }
type Goal = { id?: string; contains?: readonly string[]; requires?: readonly string[]; nodeKind?: string; examData?: unknown }
type Binding = { path: string; sha256: string }
type Policy = { authoredAssessmentViews?: { outputViewId: string }[]; countries: { outputViewId: string }[]; existingStageViews: { outputViewId: string }[]; durationOutputViewIds: string[]; stageDecisionBindings: Binding[] }
const loaded = new Map<string, { fingerprint: string; operations: MathAssessmentScopeOperation[]; retained: { viewId: string; goalId: string; operationId: string }[] }>()
const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex')
/** Buildtime only. Reuse the normal producers' materialized-view and bound-decision guards. */
export function applyContextualTerminalPlacements<T extends View>(view: T, goals: ReadonlyMap<string, Goal>, root: string): T {
  view = withoutQ3WholeScopePlacements(view, goals, root)
  const path = resolve(root, finitePath)
  if (!existsSync(path)) throw new Error(`Missing finite contextual terminal authoring input: ${finitePath}`)
  const bytes = readFileSync(path), policyBytes = readFileSync(resolve(root, policyPath))
  const fingerprint = digest(bytes) + ':' + digest(policyBytes)
  let cached = loaded.get(path)
  if (cached?.fingerprint !== fingerprint) {
    const proposal = JSON.parse(bytes.toString('utf8')) as { counts?: { individualTaskReferences?: number }; assessmentScopeOperations?: MathAssessmentScopeOperation[]; independentDecisionBindings?: Binding[]; retainedExistingTargetPlacements?: { viewId: string; goalId: string; operationId: string }[] }
    const operations = proposal.assessmentScopeOperations, expectedCount = proposal.counts?.individualTaskReferences
    if (!Number.isSafeInteger(expectedCount) || (expectedCount ?? 0) < 1 || !Array.isArray(operations) || operations.length !== expectedCount
      || operations.some(o => !o || typeof o.id !== 'string' || !o.id.startsWith('contextual-terminal-') || o.action !== 'include-target' || !Array.isArray(o.goalIds) || o.goalIds.length !== 1)
      || new Set(operations.map(o => o.id)).size !== operations.length) {
      throw new Error('Finite contextual terminal operation identity/shape differs from bound reference inventory')
    }
    const policy = JSON.parse(policyBytes.toString('utf8')) as Policy
    const outputIds = new Set([...policy.countries.map(v => v.outputViewId), ...policy.existingStageViews.map(v => v.outputViewId), ...policy.durationOutputViewIds, ...(policy.authoredAssessmentViews ?? []).map(v => v.outputViewId)])
    const independentBindings = proposal.independentDecisionBindings
    if (!Array.isArray(independentBindings) || !independentBindings.length) throw new Error('Finite contextual terminal operations lack bound independent decisions')
    for (const operation of operations) {
      if (!outputIds.has(operation.viewId)) throw new Error(`Contextual assessment operation has no materialized view: ${operation.viewId}`)
      const decisionPath = typeof operation.sourceDecision === 'string' ? operation.sourceDecision.split('#')[0] : ''
      const binding = policy.stageDecisionBindings.find(b => b.path === decisionPath)
      if (!binding || !independentBindings.some(b => b.path === binding.path && b.sha256 === binding.sha256)
        || !existsSync(resolve(root, binding.path)) || digest(readFileSync(resolve(root, binding.path))) !== binding.sha256) {
        throw new Error(`Contextual assessment operation lacks its exact bound independent source decision: ${operation.id}`)
      }
    }
    const retained = proposal.retainedExistingTargetPlacements ?? []
    if (retained.length !== 2 || retained.some(r => !operations.some(o => o.id === r.operationId && o.viewId === r.viewId && o.goalIds[0] === r.goalId))) throw new Error('Existing target reuse differs from bound reference inventory')
    cached = { fingerprint, operations, retained }
    loaded.set(path, cached)
  }
  const retained = cached!.retained.filter(r => r.viewId === view.viewId)
  if (retained.length) {
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
    if (retained.some(r => !roles.targetGoalIds.has(r.goalId) || roles.prerequisiteOnlyGoalIds.has(r.goalId))) throw new Error('Bound existing B2 target path is missing')
  }
  return applyQ3WholeScopePlacements(applyMathAssessmentScopeOperations(view, goals, cached!.operations.filter(o => !retained.some(r => r.operationId === o.id))), goals, root)
}
