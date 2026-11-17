// SPDX-License-Identifier: Apache-2.0
import {
  compareLearnerCompositionScopeMatches,
  isCombinedLearnerCourseProfile,
  scoreLearnerCompositionScope,
} from '../../src/utils/learnerCompositionScopeMatching'
import type { StageProjection } from './nationalStageProjection'

export interface StageAuthorityView {
  viewId: string
  landscapeId: string
  scope: Record<string, unknown>
}

interface ScopeReferenceNode {
  kind: string
  goalId?: string
  projectionRole?: string
  children?: readonly ScopeReferenceNode[]
}

/** Only an authored atomic support reference establishes an explicit scope
 * exclusion. Expanding a broad support subtree here would waive a lost target
 * or assessment after deletion of its more specific target reference. */
export function collectExplicitAtomicSupportReferences(
  nodes: readonly ScopeReferenceNode[], atomicGoalIds: ReadonlySet<string>,
): Set<string> {
  const result = new Set<string>()
  const visit = (node: ScopeReferenceNode) => {
    if (node.kind === 'structure') node.children?.forEach(visit)
    else if ((node.kind === 'goalEntry' || node.kind === 'canonicalSubtree')
      && node.projectionRole === 'prerequisiteOnly' && node.goalId && atomicGoalIds.has(node.goalId)) result.add(node.goalId)
  }
  nodes.forEach(visit)
  return result
}

/** Match source-stage membership using the learner adapter's exact stage
 * contract. A CrossStage placement slice cannot establish that membership.
 * A Land audit also needs that Land's source authority, rather than silently
 * substituting a national view. Sek-I course selection is neutral, as in
 * LearnerService.deriveCompositionScope. */
export function selectCompositionStageAuthorities<T extends { view: StageAuthorityView }>(
  entries: readonly T[], landscapeId: string, scope: Record<string, unknown>,
  stage: 'SekI' | 'SekII',
): T[] {
  const requested: Record<string, unknown> = { ...scope, stage }
  if (stage === 'SekI') delete requested.courseProfile
  const candidates = entries.flatMap(entry => {
    if (entry.view.landscapeId !== landscapeId
      || entry.view.scope.jurisdiction !== requested.jurisdiction) return []
    const score = scoreLearnerCompositionScope(entry.view.scope, requested)
    return score ? [{ entry, score }] : []
  }).sort((left, right) => compareLearnerCompositionScopeMatches(left.score, right.score))
  if (!candidates.length) return []
  const best = candidates[0].score
  return candidates.filter(candidate => isCombinedLearnerCourseProfile(requested) && best.courseFallbackCount > 0
    ? candidate.score.scopeSize === best.scopeSize && candidate.score.courseFallbackCount === best.courseFallbackCount
    : compareLearnerCompositionScopeMatches(candidate.score, best) === 0)
    .map(candidate => candidate.entry)
}

/** A duration-neutral exposure can be audited against separately authored
 * duration scopes. Their seed sets remain separate; no union establishes an
 * invented neutral stage authority. An explicit requested duration never falls
 * back to the other model. */
export function compositionStageAuthorityScopes<T extends { view: StageAuthorityView }>(
  entries: readonly T[], landscapeId: string, scope: Record<string, unknown>,
  stage: 'SekI' | 'SekII',
): Array<Record<string, unknown>> {
  if (scope.durationModel || selectCompositionStageAuthorities(entries, landscapeId, scope, stage).length) return [{ ...scope }]
  const durations = new Set(entries.flatMap(({ view }) => (
    view.landscapeId === landscapeId && view.scope.stage === stage
      && view.scope.jurisdiction === scope.jurisdiction && (view.scope.durationModel === 'G8' || view.scope.durationModel === 'G9')
      ? [view.scope.durationModel] : []
  )))
  const contexts = [...durations].sort().map(durationModel => ({ ...scope, durationModel }))
    .filter(candidate => selectCompositionStageAuthorities(entries, landscapeId, candidate, stage).length > 0)
  return contexts.length ? contexts : [{ ...scope }]
}

const agree = (left: ReadonlySet<string>, right: ReadonlySet<string>) => (
  left.size === right.size && [...left].every(id => right.has(id))
)

/** The authority supplies membership, while the audited full view must still
 * expose every applicable target and preparation atom. No goal is imported,
 * and independent endpoint obligations are never derived from this result. */
export function materializeCompositionStageMembership(
  exposure: StageProjection, authorities: readonly StageProjection[],
): { projection: StageProjection; authority: StageProjection | null; errors: string[] } {
  const unchanged = {
    targetGoalIds: new Set(exposure.targetGoalIds),
    visibleGoalIds: new Set(exposure.visibleGoalIds),
  }
  if (!authorities.length) return { projection: unchanged, authority: null, errors: ['Missing explicit source-stage authority'] }
  const authority = authorities[0]
  if (authorities.some(candidate => !agree(candidate.targetGoalIds, authority.targetGoalIds)
    || !agree(candidate.visibleGoalIds, authority.visibleGoalIds))) {
    return { projection: unchanged, authority: null, errors: ['Conflicting explicit source-stage authorities'] }
  }
  return {
    projection: {
      targetGoalIds: new Set([...authority.targetGoalIds].filter(id => exposure.targetGoalIds.has(id))),
      visibleGoalIds: new Set([...authority.visibleGoalIds].filter(id => exposure.visibleGoalIds.has(id))),
    },
    authority: { targetGoalIds: new Set(authority.targetGoalIds), visibleGoalIds: new Set(authority.visibleGoalIds) },
    errors: [],
  }
}

/** Declaring an atom as possible support does not put it in the selected
 * learning basis. Intersect exposure with the unpruned requires closure of S;
 * never add a missing prerequisite from the catalog. */
export function collectCompositionStageLearningBasis(
  targetGoalIds: ReadonlySet<string>,
  edges: ReadonlyMap<string, readonly string[]>, anchors: readonly string[],
): Set<string> {
  const learning = new Set<string>(), pending = [...targetGoalIds, ...anchors]
  while (pending.length) {
    const id = pending.pop()!
    if (learning.has(id)) continue
    learning.add(id)
    pending.push(...(edges.get(id) ?? []))
  }
  return learning
}

export function restrictCompositionStageRouteSupport(
  visibleGoalIds: Set<string>, targetGoalIds: ReadonlySet<string>,
  edges: ReadonlyMap<string, readonly string[]>, anchors: readonly string[],
): void {
  const learning = collectCompositionStageLearningBasis(targetGoalIds, edges, anchors)
  for (const id of visibleGoalIds) if (!learning.has(id)) visibleGoalIds.delete(id)
}
