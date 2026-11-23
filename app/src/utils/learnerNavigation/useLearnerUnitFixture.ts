import { useMemo } from 'react'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { createLearnerUnitMapCache } from './learnerUnitMapPreview'

type ProjectionProps = Pick<LearnerGoalNavigationMapProps, 'rootGoals' | 'goalIndexAll' | 'canonicalGoalSources'
  | 'visibleGoalIds' | 'visibleChildrenByParent' | 'useRawGoalTitles' | 'language' | 'unitFixture'>

/** Both navigation surfaces read the same dependency projection. Layout starts only upon opening the map. */
export function useLearnerUnitFixture({ rootGoals, goalIndexAll, canonicalGoalSources, visibleGoalIds,
  visibleChildrenByParent, useRawGoalTitles, language, unitFixture }: ProjectionProps) {
  const project = useMemo(() => createLearnerUnitMapCache(), [])
  const canonicalSource = unitFixture ? goalIndexAll : canonicalGoalSources ?? goalIndexAll
  const canonicalGoalIndexAll = useMemo(() => canonicalSource instanceof Map ? canonicalSource
    : new Map(canonicalSource.flatMap(source => source.goals.map(goal => [goal.id, goal] as const))), [canonicalSource])
  return useMemo(() => unitFixture ?? project({ rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds,
    visibleChildrenByParent, useRawGoalTitles, landscapeSources: canonicalGoalSources, language }, null).fixture,
  [unitFixture, project, rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent,
    useRawGoalTitles, canonicalGoalSources, language])
}
