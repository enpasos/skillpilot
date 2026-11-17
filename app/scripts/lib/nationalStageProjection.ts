export interface StageProjection {
  targetGoalIds: ReadonlySet<string>
  visibleGoalIds: ReadonlySet<string>
}

export interface NationalStageExposure extends StageProjection {
  viewId: string
  landscapeId: string
  scope: Record<string, unknown>
}

// Explicit view identities form the reviewed family contract. A new national
// view is not silently bound by a similar filename or its first matching course.
export const PHYSICS_NATIONAL_STAGE_EXPOSURE_SOURCES: Readonly<Record<string, readonly string[]>> = {
  'de-de-gym-physics-gk': ['de-de-gym-physics-gk'],
  'de-de-gym-physics-lk': ['de-de-gym-physics-lk'],
  'de-de-gym-seki-physics': ['de-de-gym-physics-gk', 'de-de-gym-physics-lk'],
  'de-de-gym-sekii-physics-gk': ['de-de-gym-physics-gk'],
  'de-de-gym-sekii-physics-lk': ['de-de-gym-physics-lk'],
}

const setsAgree = (left: ReadonlySet<string>, right: ReadonlySet<string>) => (
  left.size === right.size && [...left].every(id => right.has(id))
)

/** Materialize a compatibility audit, not a new hybrid learner view.
 * A Land selection in the learner API already selects the actual Land view.
 * This audit binds its stage authority to an explicitly exposed national family.
 * Targets and prerequisite support retain separate, intersected boundaries.
 */
export function materializeNationalStageProjection(input: {
  landscapeId: string
  scope: Record<string, unknown>
  defaultProjection: StageProjection
  jurisdiction: string | null
  sourceViewIds: readonly string[]
  nationalExposureFamily: readonly NationalStageExposure[]
  stageAuthorities: readonly StageProjection[]
}): { projection: StageProjection; errors: string[] } {
  const unchanged = () => ({
    projection: {
      targetGoalIds: new Set(input.defaultProjection.targetGoalIds),
      visibleGoalIds: new Set(input.defaultProjection.visibleGoalIds),
    },
    errors: [] as string[],
  })
  // The canonical default is independent of any Land authority or family.
  if (!input.jurisdiction) return unchanged()
  const errors: string[] = []
  if (!input.stageAuthorities.length) errors.push('Missing jurisdiction stage authority')
  const authority = input.stageAuthorities[0]
  if (authority && input.stageAuthorities.some(candidate => (
    !setsAgree(candidate.targetGoalIds, authority.targetGoalIds)
    || !setsAgree(candidate.visibleGoalIds, authority.visibleGoalIds)
  ))) errors.push('Ambiguous jurisdiction stage authority')

  const ids = new Set(input.sourceViewIds)
  if (!ids.size || ids.size !== input.sourceViewIds.length) errors.push('Missing or duplicate national exposure family binding')
  const sources = input.sourceViewIds.flatMap(id => {
    const candidates = input.nationalExposureFamily.filter(candidate => candidate.viewId === id)
    if (candidates.length !== 1) {
      errors.push(`Missing or ambiguous national exposure source: ${id}`)
      return []
    }
    const source = candidates[0]
    if (source.landscapeId !== input.landscapeId || source.scope.jurisdiction
      || source.scope.stage !== 'CrossStage'
      || source.scope.schoolForm !== input.scope.schoolForm
      || source.scope.durationModel !== input.scope.durationModel
      || (input.scope.courseProfile && source.scope.courseProfile !== input.scope.courseProfile)) {
      errors.push(`Incompatible national exposure source: ${id}`)
      return []
    }
    return [source]
  })
  if (!input.scope.courseProfile && sources.length) {
    const availableProfiles = new Set(input.nationalExposureFamily.filter(source => (
      source.landscapeId === input.landscapeId && !source.scope.jurisdiction
      && source.scope.stage === 'CrossStage' && source.scope.schoolForm === input.scope.schoolForm
      && source.scope.durationModel === input.scope.durationModel
    )).map(source => source.scope.courseProfile))
    const boundProfiles = new Set(sources.map(source => source.scope.courseProfile))
    if (sources.length !== 2 || boundProfiles.size !== 2 || !boundProfiles.has('GK') || !boundProfiles.has('LK')) {
      errors.push('Course-neutral exposure requires the complete explicit GK/LK family')
    }
    if (availableProfiles.size !== boundProfiles.size
      || [...availableProfiles].some(profile => !boundProfiles.has(profile))) {
      errors.push('Incomplete course-neutral national exposure family')
    }
  }
  if (errors.length || !authority || !sources.length) return { ...unchanged(), errors }

  const projections = sources.map(source => ({
    targetGoalIds: new Set([...authority.targetGoalIds].filter(id => source.targetGoalIds.has(id))),
    visibleGoalIds: new Set([...authority.visibleGoalIds].filter(id => source.visibleGoalIds.has(id))),
  }))
  const projection = projections[0]
  // A course-neutral source scope exposes the explicitly bound complete course
  // family. Its exposure is the union of those two full sources; the unique
  // Land-stage authority still supplies the separate membership boundary.
  // Support-only in both sources never becomes a target.
  if (!input.scope.courseProfile) return {
    projection: {
      targetGoalIds: new Set(projections.flatMap(candidate => [...candidate.targetGoalIds])),
      visibleGoalIds: new Set(projections.flatMap(candidate => [...candidate.visibleGoalIds])),
    },
    errors: [],
  }
  if (projections.some(candidate => (
    !setsAgree(candidate.targetGoalIds, projection.targetGoalIds)
    || !setsAgree(candidate.visibleGoalIds, projection.visibleGoalIds)
  ))) {
    return { ...unchanged(), errors: ['Ambiguous relevant national family stage projection'] }
  }
  return { projection, errors }
}
