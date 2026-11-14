import { useMemo, useState } from 'react'
import { Construction } from 'lucide-react'
import type { UiGoal } from '../../goalTypes'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { filterLearnerUnitMapToSubjects } from './learnerUnitMapProjection'
import { createLearnerUnitMapCache, MATHEMATICS_LANDSCAPE_ID, UNIT_MAP_COMPACT_LIST_THRESHOLD,
  UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreview'
import type { LearningEntryProgress } from './types'

const subjectLabel = (landscapeId: string, english: boolean) => landscapeId === MATHEMATICS_LANDSCAPE_ID
  ? english ? 'Mathematics' : 'Mathematik' : english ? 'Physics' : 'Physik'

/** Lazy product adapter; the original GoalCard remains the only goal detail view. */
export default function LearnerGoalNavigationMap(props: LearnerGoalNavigationMapProps) {
  const { rootGoals, goalIndexAll, canonicalGoalSources, visibleGoalIds, visibleChildrenByParent,
    getMastery, completionWaivers } = props
  const english = props.language === 'en'
  const canonicalSource = canonicalGoalSources ?? goalIndexAll
  const canonicalGoalIndexAll = useMemo(() => canonicalSource instanceof Map ? canonicalSource
    : new Map(canonicalSource.flatMap(source => source.goals.map(goal => [goal.id, goal] as const))), [canonicalSource])
  const landscapeSources = canonicalGoalSources
  const project = useMemo(() => createLearnerUnitMapCache(), [])
  const [requestedStep, setRequestedStep] = useState<number | null>(null)
  const [hiddenSubjects, setHiddenSubjects] = useState<readonly string[]>([])
  const view = useMemo(() => project({ rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent,
    useRawGoalTitles: props.useRawGoalTitles, landscapeSources, language: props.language }, requestedStep),
  [project, rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent, props.useRawGoalTitles,
    landscapeSources, props.language, requestedStep])
  // The map covers Mathematics and Physics only; subjects are filters, not nodes.
  const mapSubjects = useMemo(() => view.fixture.subjectIds.filter(id => UNIT_MAP_PREVIEW_SUBJECT_IDS.includes(id)), [view.fixture])
  const otherSubjects = view.fixture.subjectIds.length > mapSubjects.length
  const shownSubjects = useMemo(() => {
    const shown = mapSubjects.filter(id => !hiddenSubjects.includes(id))
    return shown.length ? shown : mapSubjects
  }, [mapSubjects, hiddenSubjects])
  const fixture = useMemo(() => filterLearnerUnitMapToSubjects(view.fixture, new Set(shownSubjects)), [view.fixture, shownSubjects])
  const progress = useMemo(() => {
    // Synthetic unit nodes stand in as clusters; only real goals count as atoms.
    const visibleGoals = new Map(Object.keys(fixture.entries).filter(id => id !== fixture.rootId).map(id => [id,
      goalIndexAll.get(id) ?? ({ id, title: fixture.entries[id].title, type: 'cluster', contains: [], weight: 1 } as unknown as UiGoal)] as const))
    const children = new Map(Object.values(fixture.entries).map(entry => [entry.id, entry.children ?? []]))
    const result: Record<string, LearningEntryProgress> = Object.create(null)
    const language = props.language ?? 'de'
    const scope = completionWaivers.values().next().value?.sectionTitle
    for (const [id, value] of buildTreeCompletionProgressMap(visibleGoals, children, getMastery, completionWaivers)) {
      result[id] = { total: value.totalCount, explicit: value.explicitCount, implicit: value.implicitCount,
        explicitRatio: value.explicitRatio, implicitRatio: value.implicitRatio,
        implicitScopeLabel: scope ? completionLabel(scope, language) : undefined }
      const waiver = completionWaivers.get(id)
      if (waiver) result[id].waiverLabel = language === 'en'
        ? `${waiver.reason === 'no_remaining_demand' ? 'No longer required' : 'Covered by assessment'} for this section: ${completionLabel(waiver.sectionTitle, language)}`
        : `${waiver.reason === 'no_remaining_demand' ? 'Nicht mehr erforderlich' : 'Durch Prüfung abgedeckt'} für diesen Lernabschnitt: ${completionLabel(waiver.sectionTitle, language)}`
    }
    return result
  }, [fixture, goalIndexAll, getMastery, completionWaivers, props.language])
  const command = useMemo(() => ({ entryId: props.selectedGoalId,
    // This is the global reveal sequence, independent of ordinary selection.
    nonce: props.revealRequest?.nonce ?? 0,
    revealEntryId: props.revealRequest?.entryId,
  }), [props.selectedGoalId, props.revealRequest])

  if (!view.fixture.entries[view.fixture.rootId].children?.length) return <div className="learner-map-status" role="status" data-testid="learner-map-empty">
    <p>{english ? 'No learning goals are visible in this curriculum view.' : 'In dieser Lehrplanansicht sind keine Lernziele sichtbar.'}</p>
    <button type="button" onClick={props.onReturnToTree}>{english ? 'Return to tree' : 'Zum Baum wechseln'}</button>
  </div>
  if (!mapSubjects.length) return <div className="learner-map-status" role="status" data-testid="learner-map-subjects-unavailable">
    <p>{english ? 'For now, the learning map is available for Mathematics and Physics only. Your other subjects are in the goal tree.'
      : 'Die Lernkarte gibt es vorerst nur für Mathematik und Physik. Deine anderen Fächer findest du im Lernzielbaum.'}</p>
    <button type="button" onClick={props.onReturnToTree}>{english ? 'Return to tree' : 'Zum Baum wechseln'}</button>
  </div>

  const notice = <div className="lum-construction-notice" role="note" data-testid="learner-map-construction-notice">
    <Construction size={16} aria-hidden="true" />
    <p><strong>{english ? 'Under construction:' : 'Baustelle:'}</strong> {english
      ? 'This view is still being built. It shows units and learning goals instead of the outline. For now, the sections of the curriculum count as units. The learning map currently covers Mathematics and Physics only.'
      : 'Diese Ansicht ist im Aufbau. Sie zeigt Einheiten und Lernziele statt der Gliederung. Als Einheiten gelten vorerst die Abschnitte des Lehrplans. Die Lernkarte umfasst derzeit nur Mathematik und Physik.'}
    {otherSubjects && <> {english ? 'Your other subjects are in the goal tree.' : 'Deine anderen Fächer findest du im Lernzielbaum.'}</>}</p>
  </div>
  const toolbar = <>
    {mapSubjects.length > 1 && <div className="lum-subject-filter" role="group" aria-label={english ? 'Subjects in the map' : 'Fächer in der Karte'}
      data-testid="learner-map-subject-filter">
      {mapSubjects.map(subject => {
        const pressed = shownSubjects.includes(subject)
        return <button key={subject} type="button" aria-pressed={pressed} data-subject-id={subject}
          disabled={pressed && shownSubjects.length === 1}
          title={pressed && shownSubjects.length === 1 ? english ? 'At least one subject stays visible.' : 'Mindestens ein Fach bleibt sichtbar.' : undefined}
          onClick={() => setHiddenSubjects(current => pressed ? [...current, subject] : current.filter(id => id !== subject))}>
          {subjectLabel(subject, english)}
        </button>
      })}
    </div>}
    {view.maxStep > 1 && <label className="lum-step-control" title={english
      ? 'Units are introduced top down. Step 1 makes only the outermost sections units; every further step adds the sections inside them.'
      : 'Einheiten werden von oben nach unten eingeführt. Schritt 1 macht nur die äußersten Abschnitte zu Einheiten; jeder weitere Schritt nimmt die Abschnitte darin hinzu.'}>
      <span className="lum-step-label" aria-hidden="true">{english ? 'Units top down, step' : 'Einheiten von oben, Schritt'}</span>
      <span className="lum-step-label-short" aria-hidden="true">{english ? 'Step' : 'Schritt'}</span>
      <select data-testid="learner-map-unit-step" aria-label={english ? 'Units top down, step' : 'Einheiten von oben, Schritt'}
        value={view.step} onChange={event => setRequestedStep(Number(event.target.value))}>
        {Array.from({ length: view.maxStep }, (_, index) => index + 1).map(step => <option key={step} value={step}>{step}</option>)}
      </select>
    </label>}
  </>

  return <div className="learner-native-goal-map" data-testid="native-cockpit-map" data-map-view="units" data-unit-step={view.step}
    data-selected-goal-id={props.selectedGoalId} data-map-active={props.active}>
    <LearningUnitMap fixture={fixture} embedded active={props.active} headingMode="context"
      rootLabel={english ? 'My learning goals' : 'Meine Lernziele'} language={props.language} learnerProgress={progress} activeGoalId={props.activeGoalId}
      command={command} showInspector={false} compactListThreshold={UNIT_MAP_COMPACT_LIST_THRESHOLD}
      notice={notice} toolbar={toolbar} onEntrySelect={(goalId) => {
        const goal = goalIndexAll.get(goalId)
        if (goal && !goal.personalCurriculumProjection?.presentationOnly) props.onSelectGoal(goalId)
      }}
      onReturnToTree={props.onReturnToTree} onEscape={props.onEscape} />
  </div>
}
