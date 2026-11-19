import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { FlashcardPracticeRequest } from '../../utils/flashcardPractice'
import type { UiGoal } from '../../goalTypes'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { MapPracticeDialog } from './MapPracticeDialog'
import { HESSE_PHYSICS_E1_PRACTICE } from './learnerUnitMapPreviewSubjects'
import { filterLearnerUnitMapToSubjects } from './learnerUnitMapProjection'
import { createLearnerUnitMapCache, MATHEMATICS_LANDSCAPE_ID, UNIT_MAP_COMPACT_LIST_THRESHOLD,
  UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreview'
import type { LearningEntryProgress } from './types'
import { buildHessePhysicsE1AssessmentActions, buildHessePhysicsFlashcardActions, findHessePhysicsE1Scopes, placeHessePhysicsE1Resources, HESSE_PHYSICS_E_MEMORY_GOAL_ID } from './hessePhysicsFlashcardActions'

const subjectLabel = (landscapeId: string, english: boolean) => landscapeId === MATHEMATICS_LANDSCAPE_ID
  ? english ? 'Mathematics' : 'Mathematik' : english ? 'Physics' : 'Physik'

/** Lazy product adapter; the original GoalCard remains the only goal detail view. */
export default function LearnerGoalNavigationMap(props: LearnerGoalNavigationMapProps) {
  const { rootGoals, goalIndexAll, canonicalGoalSources, visibleGoalIds, visibleChildrenByParent,
    getMastery, completionWaivers, onPracticeFlashcards, onOpenGoal } = props
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
  const canPractice = Boolean(onPracticeFlashcards)
  const basePractice = useMemo(() => canPractice
    ? buildHessePhysicsFlashcardActions(progressFixture, goalIndexAll, visibleGoalIds, undefined, props.language ?? 'de')
    : new Map<string, FlashcardPracticeRequest>(),
  [progressFixture, goalIndexAll, visibleGoalIds, props.language, canPractice])
  const deckSource = basePractice.size && memoryGoal ? props.getFlashcardSource?.(memoryGoal) : undefined
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
  const language = props.language ?? 'de'
  const e1Scopes = useMemo(() => findHessePhysicsE1Scopes(progressFixture, goalIndexAll, visibleGoalIds),
    [progressFixture, goalIndexAll, visibleGoalIds])
  const assessmentActions = useMemo(() => buildHessePhysicsE1AssessmentActions(progressFixture, goalIndexAll,
    visibleGoalIds, language, e1Scopes), [progressFixture, goalIndexAll, visibleGoalIds, language, e1Scopes])
  const fixture = useMemo(() => placeHessePhysicsE1Resources(progressFixture, e1Scopes, practice, assessmentActions),
    [progressFixture, e1Scopes, practice, assessmentActions])
  const getGoalAction = useCallback((scopeId: string, id: string) => {
    const cards = practice.get(scopeId)
    if (cards?.goalId === id && onPracticeFlashcards) {
      const title = cards.goalIds ? (english ? 'Flashcards for E.1' : 'Lernkarten zu E.1')
        : (english ? 'E phase flashcards' : 'Lernkarten zur E-Phase')
      const context = cards.goalIds ? (english ? 'From the E phase deck' : 'Aus dem Deck der E-Phase') : undefined
      return { title, context, label: cards.title, open: () => onPracticeFlashcards?.(cards) }
    }
    const assessment = assessmentActions.get(scopeId)
    if (assessment?.goalId === id && onOpenGoal) {
      return { title: fixture.entries[id].title, context: english ? 'E phase assessment' : 'Prüfung der E-Phase', label: assessment.title, open: () => onOpenGoal?.(id) }
    }
  }, [practice, english, assessmentActions, fixture, onPracticeFlashcards, onOpenGoal])
  const [openExercise, setOpenExercise] = useState<{ scopeId: string; goalId: string } | null>(null)
  const getExercise = useCallback((scopeId: string, goalId: string) => {
    if (!e1Scopes.has(scopeId) || !visibleGoalIds.has(goalId) || !fixture.entries[scopeId]?.children?.includes(goalId)) return
    return HESSE_PHYSICS_E1_PRACTICE?.exercises.find(item => item.goalId === goalId)?.[language]
  }, [e1Scopes, fixture, visibleGoalIds, language])
  const getPracticeAction = useCallback((scopeId: string, goalId: string) => {
    const exercise = getExercise(scopeId, goalId)
    if (exercise) return { label: `${english ? 'Practice' : 'Üben'}: ${exercise.title}`,
      open: () => setOpenExercise({ scopeId, goalId }) }
  }, [english, getExercise])
  const exercise = openExercise && props.active && getExercise(openExercise.scopeId, openExercise.goalId)
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
      getPracticeAction={getPracticeAction} getGoalAction={getGoalAction} mobileListScopes={e1Scopes}
      renderScopeActions={scopeId => {
        const action = practice.get(scopeId)
        const intro = e1Scopes.has(scopeId) && HESSE_PHYSICS_E1_PRACTICE?.intro[language]
        if (intro) return <div className="lum-scope-intro"><h2>{intro.question}</h2><p>{intro.promise}</p></div>
        if (action?.goalIds) return <button type="button" className="lum-flashcard-action" data-testid="learning-map-flashcard-practice"
          onClick={() => onPracticeFlashcards?.(action)}><BookOpen size={17} aria-hidden="true" />{action.title}</button>
        return null
      }} onEntrySelect={(goalId) => {
        const goal = goalIndexAll.get(goalId)
        if (goal && !goal.personalCurriculumProjection?.presentationOnly) props.onSelectGoal(goalId)
      }}
      onReturnToTree={props.onReturnToTree} onEscape={props.onEscape} />
    {exercise && <MapPracticeDialog exercise={exercise} language={language} onDismiss={() => setOpenExercise(null)} />}
  </div>
}
