import { useMemo } from 'react'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { createLearnerMapProjectionCache } from './learnerMapProjection'
import { projectLearningUnitNavigation } from './learnerUnitMapProjection'
import type { LearningEntryProgress } from './types'

/** Lazy product adapter; the original GoalCard remains the only goal detail view. */
export default function LearnerGoalNavigationMap(props: LearnerGoalNavigationMapProps) {
  const { rootGoals, goalIndexAll, canonicalGoalSources, visibleGoalIds, visibleChildrenByParent,
    getMastery, completionWaivers } = props
  const canonicalSource = canonicalGoalSources ?? goalIndexAll
  const canonicalGoalIndexAll = useMemo(() => canonicalSource instanceof Map ? canonicalSource
    : new Map(canonicalSource.flatMap(source => source.goals.map(goal => [goal.id, goal] as const))), [canonicalSource])
  const project = useMemo(() => createLearnerMapProjectionCache(), [])
  const unitNavigation = useMemo(() => projectLearningUnitNavigation({ rootGoals, goalIndexAll,
    canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent, useRawGoalTitles: props.useRawGoalTitles },
  props.learningUnits, props.language ?? 'de'),
  [rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent, props.useRawGoalTitles, props.learningUnits, props.language])
  const fixture = useMemo(() => project(unitNavigation.input), [project, unitNavigation.input])
  const progress = useMemo(() => {
    const visibleGoals = new Map(Object.keys(fixture.entries).flatMap(id => {
      const goal = goalIndexAll.get(id)
      return goal ? [[id, goal] as const] : []
    }))
    const children = new Map(Object.values(fixture.entries).map(entry => [entry.id, entry.children ?? []]))
    const result: Record<string, LearningEntryProgress> = Object.create(null)
    const language = props.language ?? 'de'
    const scope = completionWaivers.values().next().value?.sectionTitle
    for (const [id, value] of buildTreeCompletionProgressMap(visibleGoals, children, getMastery, completionWaivers)) {
      result[id] = { total: value.totalCount, explicit: value.explicitCount, implicit: value.implicitCount,
        explicitRatio: value.explicitRatio, implicitRatio: value.implicitRatio,
        globalRecognition: value.globalRecognition,
        recognizedCount: value.recognizedCount,
        implicitScopeLabel: value.implicitCount > (value.recognizedCount ?? 0) && scope ? completionLabel(scope, language) : undefined }
      const waiver = completionWaivers.get(id)
      if (waiver) result[id].waiverLabel = waiver.reason === 'recognized'
        ? (language === 'en' ? 'Mastered through independent application' : 'Durch selbständige Anwendung gemeistert') : language === 'en'
        ? `${waiver.reason === 'no_remaining_demand' ? 'No longer required' : 'Covered by assessment'} for this section: ${completionLabel(waiver.sectionTitle, language)}`
        : `${waiver.reason === 'no_remaining_demand' ? 'Nicht mehr erforderlich' : 'Durch Prüfung abgedeckt'} für diesen Lernabschnitt: ${completionLabel(waiver.sectionTitle, language)}`
    }
    // Unit counts are published by the backend; tree progress does not derive
    // a second recognition or completion rule for the unit hierarchy.
    for (const [id, unit] of unitNavigation.unitsByEntryId) result[id] = {
      total: unit.targetCount, explicit: unit.explicitTargetCount, implicit: unit.recognizedTargetCount,
      recognizedCount: unit.recognizedTargetCount, globalRecognition: true,
    }
    return result
  }, [fixture, goalIndexAll, getMastery, completionWaivers, props.language, unitNavigation.unitsByEntryId])
  const command = useMemo(() => ({ entryId: props.selectedGoalId,
    // This is the global reveal sequence, independent of ordinary selection.
    nonce: props.revealRequest?.nonce ?? 0,
    revealEntryId: props.revealRequest?.entryId,
  }), [props.selectedGoalId, props.revealRequest])
  const english = props.language === 'en'

  if (!fixture.entries[fixture.rootId].children?.length) return <div className="learner-map-status" role="status" data-testid="learner-map-empty">
    <p>{english ? 'No learning goals are visible in this curriculum view.' : 'In dieser Lehrplanansicht sind keine Lernziele sichtbar.'}</p>
    <button type="button" onClick={props.onReturnToTree}>{english ? 'Return to tree' : 'Zum Baum wechseln'}</button>
  </div>

  return <div className="learner-native-goal-map" data-testid="native-cockpit-map"
    data-selected-goal-id={props.selectedGoalId} data-map-active={props.active}>
    <LearningUnitMap fixture={fixture} embedded active={props.active} headingMode="context"
      rootLabel={english ? 'My learning goals' : 'Meine Lernziele'} language={props.language} learnerProgress={progress} activeGoalId={props.activeGoalId}
      command={command} showInspector={false} navigationEntryIds={unitNavigation.navigationEntryIds}
      onEntrySelect={id => { if (goalIndexAll.has(id)) props.onSelectGoal(id) }}
      onReturnToTree={props.onReturnToTree} />
  </div>
}
