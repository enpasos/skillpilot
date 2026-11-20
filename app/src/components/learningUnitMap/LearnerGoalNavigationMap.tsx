import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { FlashcardPracticeRequest } from '../../utils/flashcardPractice'
import type { UiGoal } from '../../goalTypes'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { MapPracticeDialog } from './MapPracticeDialog'
import { UNIT_MAP_LEARNING_MATERIALS } from './learnerUnitMapPreviewSubjects'
import { filterLearnerUnitMapToSubjects } from './learnerUnitMapProjection'
import { createLearnerUnitMapCache, MATHEMATICS_LANDSCAPE_ID, UNIT_MAP_COMPACT_LIST_THRESHOLD,
  UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreview'
import type { LearningEntryProgress, LearningMapFixture } from './types'
import { buildUnitAssessmentActions, buildUnitFlashcardActions, findUnitMaterialScopes, placeUnitLearningResources } from './unitLearningMaterialActions'

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
  const language = props.language ?? 'de'
  const bindings = useMemo(() => UNIT_MAP_LEARNING_MATERIALS.flatMap(material => {
    const scopes = findUnitMaterialScopes(material, progressFixture, goalIndexAll, visibleGoalIds)
    if (!scopes.size) return []
    const memoryId = material.unit.flashcardGoalId
    const memory = memoryId && visibleGoalIds.has(memoryId) && progressFixture.entries[memoryId]?.kind === 'memory'
      ? goalIndexAll.get(memoryId) : undefined
    const source = onPracticeFlashcards && memory?.landscapeId === material.unit.landscapeId
      ? props.getFlashcardSource?.(memory) : undefined
    return [{ material, scopes, source }]
  }), [progressFixture, goalIndexAll, visibleGoalIds, onPracticeFlashcards, props.getFlashcardSource])
  // Avoid refetching when a render or language change yields the same authorized deck URLs.
  const sourceList = JSON.stringify([...new Set(bindings.flatMap(binding => binding.source ? [binding.source] : []))].sort())
  const [decks, setDecks] = useState<ReadonlyMap<string, { tags?: string[] }[]>>(new Map())
  useEffect(() => {
    const controller = new AbortController()
    for (const source of JSON.parse(sourceList) as string[]) {
      void fetch(source, { cache: 'no-store', signal: controller.signal }).then(response => {
        if (!response.ok) throw new Error('Flashcard deck unavailable')
        return response.json()
      }).then(data => {
        if (!controller.signal.aborted && Array.isArray(data.cards)) setDecks(previous => new Map(previous).set(source, data.cards))
      }).catch(() => { /* Full decks keep the normal learner-facing load and error handling. */ })
    }
    return () => controller.abort()
  }, [sourceList])
  const resources = useMemo(() => bindings.map(({ material, scopes, source }) => ({
    material, scopes,
    flashcards: onPracticeFlashcards ? buildUnitFlashcardActions(material, progressFixture, goalIndexAll, visibleGoalIds,
      source ? decks.get(source) : undefined, language, scopes) : new Map<string, FlashcardPracticeRequest>(),
    assessments: buildUnitAssessmentActions(material, progressFixture, goalIndexAll, visibleGoalIds, language, scopes),
  })), [bindings, progressFixture, goalIndexAll, visibleGoalIds, decks, language, onPracticeFlashcards])
  const materialScopes = useMemo(() => new Set(resources.flatMap(({ scopes }) => [...scopes])), [resources])
  const fixture = useMemo(() => resources.reduce<LearningMapFixture>((board, { scopes, flashcards, assessments }) =>
    placeUnitLearningResources(board, scopes, flashcards, assessments), progressFixture), [resources, progressFixture])
  const getGoalAction = useCallback((scopeId: string, id: string) => {
    const homeId = progressFixture.entryPaths?.[id]?.at(-2)
    const home = homeId && progressFixture.entries[homeId]?.title
    for (const { flashcards, assessments } of resources) {
      const cards = flashcards.get(scopeId)
      if (cards?.goalId === id && onPracticeFlashcards) {
        const context = cards.goalIds && home ? (english ? `From the deck “${home}”` : `Aus dem Stapel „${home}“`) : undefined
        return { title: cards.title, context, label: cards.title, open: () => onPracticeFlashcards(cards) }
      }
      const assessment = assessments.get(scopeId)
      if (assessment?.goalId === id && onOpenGoal) {
        const context = home && (english ? `Assessment from “${home}”` : `Prüfung aus „${home}“`)
        return { title: fixture.entries[id].title, context, label: assessment.title, open: () => onOpenGoal(id) }
      }
    }
  }, [resources, english, fixture, progressFixture, onPracticeFlashcards, onOpenGoal])
  const [openExercise, setOpenExercise] = useState<{ scopeId: string; goalId: string } | null>(null)
  const getExercise = useCallback((scopeId: string, goalId: string) => {
    if (!visibleGoalIds.has(goalId) || !progressFixture.entries[scopeId]?.children?.includes(goalId)) return
    for (const { scopes, material } of resources) {
      if (!scopes.has(scopeId) || goalIndexAll.get(goalId)?.landscapeId !== material.unit.landscapeId) continue
      const exercise = material.exercises.find(item => item.goalId === goalId)
      if (exercise) return exercise[language]
    }
  }, [resources, progressFixture, goalIndexAll, visibleGoalIds, language])
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
      getPracticeAction={getPracticeAction} getGoalAction={getGoalAction} mobileListScopes={materialScopes}
      renderScopeActions={scopeId => {
        const intros = resources.flatMap(({ scopes, material }) => scopes.has(scopeId) ? [material] : [])
        const subdecks = new Map<string, FlashcardPracticeRequest>()
        for (const { flashcards } of resources) {
          const action = flashcards.get(scopeId)
          if (action?.goalIds && !fixture.entries[scopeId]?.children?.includes(action.goalId)) subdecks.set(action.goalId, action)
        }
        return <>
          {intros.map(({ unit, intro }) => <div key={unit.landscapeId + unit.compositionNodeId} className="lum-scope-intro">
            <h2>{intro[language].question}</h2><p>{intro[language].promise}</p></div>)}
          {[...subdecks.values()].map(action => <button key={action.goalId} type="button" className="lum-flashcard-action"
            data-testid="learning-map-flashcard-practice" onClick={() => onPracticeFlashcards?.(action)}>
            <BookOpen size={17} aria-hidden="true" />{action.title}</button>)}
          {scopeId === props.unitAssessmentSummary?.scopeGoalId && props.unitAssessmentSummary.content}
        </>
      }} onEntrySelect={(goalId) => {
        const goal = goalIndexAll.get(goalId)
        if (goal && !goal.personalCurriculumProjection?.presentationOnly) props.onSelectGoal(goalId)
      }}
      onReturnToTree={props.onReturnToTree} onEscape={props.onEscape} />
    {exercise && <MapPracticeDialog exercise={exercise} language={language} onDismiss={() => setOpenExercise(null)} />}
  </div>
}
