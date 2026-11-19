import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ClipboardCheck } from 'lucide-react'
import type { UiGoal } from '../../goalTypes'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { filterLearnerUnitMapToSubjects } from './learnerUnitMapProjection'
import { createLearnerUnitMapCache, MATHEMATICS_LANDSCAPE_ID, UNIT_MAP_COMPACT_LIST_THRESHOLD,
  UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreview'
import type { LearningEntryProgress } from './types'
import { buildHessePhysicsE1AssessmentActions, buildHessePhysicsFlashcardActions, HESSE_PHYSICS_E_MEMORY_GOAL_ID } from './hessePhysicsFlashcardActions'

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
  const [hiddenSubjects, setHiddenSubjects] = useState<readonly string[]>([])
  // Always the deepest top-down step: every section that can be a unit is one.
  const view = useMemo(() => project({ rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent,
    useRawGoalTitles: props.useRawGoalTitles, landscapeSources, language: props.language }, null),
  [project, rootGoals, goalIndexAll, canonicalGoalIndexAll, visibleGoalIds, visibleChildrenByParent, props.useRawGoalTitles,
    landscapeSources, props.language])
  // The map covers Mathematics and Physics only; subjects are filters, not nodes.
  const mapSubjects = useMemo(() => view.fixture.subjectIds.filter(id => UNIT_MAP_PREVIEW_SUBJECT_IDS.includes(id)), [view.fixture])
  const shownSubjects = useMemo(() => {
    const shown = mapSubjects.filter(id => !hiddenSubjects.includes(id))
    return shown.length ? shown : mapSubjects
  }, [mapSubjects, hiddenSubjects])
  const progressFixture = useMemo(() => filterLearnerUnitMapToSubjects(view.fixture, new Set(shownSubjects)), [view.fixture, shownSubjects])
  const memoryGoal = goalIndexAll.get(HESSE_PHYSICS_E_MEMORY_GOAL_ID)
  const canPractice = Boolean(props.onPracticeFlashcards)
  const basePractice = useMemo(() => canPractice
    ? buildHessePhysicsFlashcardActions(progressFixture, goalIndexAll, visibleGoalIds, undefined, props.language ?? 'de')
    : { fixture: progressFixture, actions: new Map() },
  [progressFixture, goalIndexAll, visibleGoalIds, props.language, canPractice])
  const deckSource = basePractice.actions.size && memoryGoal ? props.getFlashcardSource?.(memoryGoal) : undefined
  const [deck, setDeck] = useState<{ source: string; cards: { tags?: string[] }[] } | null>(null)
  useEffect(() => {
    if (!deckSource) return
    const controller = new AbortController()
    void fetch(deckSource, { cache: 'no-store', signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Flashcard deck unavailable')
      return response.json()
    }).then(data => {
      if (!controller.signal.aborted && Array.isArray(data.cards)) setDeck({ source: deckSource, cards: data.cards })
    }).catch(() => { /* The phase action still opens the normal deck with its load/error handling. */ })
    return () => controller.abort()
  }, [deckSource])
  const practice = useMemo(() => canPractice && deck && deck.source === deckSource
    ? buildHessePhysicsFlashcardActions(progressFixture, goalIndexAll, visibleGoalIds,
      deck.cards, props.language ?? 'de') : basePractice,
  [progressFixture, goalIndexAll, visibleGoalIds, deck, deckSource, props.language, canPractice, basePractice])
  const fixture = practice.fixture
  const assessmentActions = useMemo(() => buildHessePhysicsE1AssessmentActions(fixture, goalIndexAll,
    visibleGoalIds, props.language ?? 'de'), [fixture, goalIndexAll, visibleGoalIds, props.language])
  const progress = useMemo(() => {
    const fixture = progressFixture
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
  }, [progressFixture, goalIndexAll, getMastery, completionWaivers, props.language])
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
    {/* The package-consumer edition carries no preview subjects (src/packageConsumer). */}
    <p>{!UNIT_MAP_PREVIEW_SUBJECT_IDS.length
      ? english ? 'The learning map is not available in this edition. Your subjects are in the goal tree.'
        : 'Die Lernkarte ist in dieser Ausgabe nicht verfügbar. Deine Fächer findest du im Lernzielbaum.'
      : english ? 'For now, the learning map is available for Mathematics and Physics only. Your other subjects are in the goal tree.'
        : 'Die Lernkarte gibt es vorerst nur für Mathematik und Physik. Deine anderen Fächer findest du im Lernzielbaum.'}</p>
    <button type="button" onClick={props.onReturnToTree}>{english ? 'Return to tree' : 'Zum Baum wechseln'}</button>
  </div>

  const toolbar = mapSubjects.length > 1 ? <div className="lum-subject-filter" role="group" aria-label={english ? 'Subjects in the map' : 'Fächer in der Karte'}
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
  </div> : undefined

  return <div className="learner-native-goal-map" data-testid="native-cockpit-map" data-map-view="units"
    data-selected-goal-id={props.selectedGoalId} data-map-active={props.active}>
    <LearningUnitMap fixture={fixture} embedded active={props.active} headingMode="context"
      rootLabel={english ? 'My learning goals' : 'Meine Lernziele'} language={props.language} learnerProgress={progress} activeGoalId={props.activeGoalId}
      command={command} showInspector={false} compactListThreshold={UNIT_MAP_COMPACT_LIST_THRESHOLD}
      toolbar={toolbar} locationBarContainer={props.locationBarContainer}
      renderScopeActions={scopeId => {
        const action = practice.actions.get(scopeId)
        const assessment = props.onOpenGoal && assessmentActions.get(scopeId)
        return action || assessment ? <>
          {action && <button type="button" className="lum-flashcard-action" data-testid="learning-map-flashcard-practice"
            onClick={() => props.onPracticeFlashcards?.(action)}><BookOpen size={17} aria-hidden="true" />{action.title}</button>}
          {assessment && <button type="button" className="lum-flashcard-action" data-testid="learning-map-assessment-open"
            onClick={() => props.onOpenGoal?.(assessment.goalId)}><ClipboardCheck size={17} aria-hidden="true" />{assessment.title}</button>}
        </> : null
      }} onEntrySelect={(goalId) => {
        const goal = goalIndexAll.get(goalId)
        if (goal && !goal.personalCurriculumProjection?.presentationOnly) props.onSelectGoal(goalId)
      }}
      onReturnToTree={props.onReturnToTree} onEscape={props.onEscape} />
  </div>
}
