import { findUnitPracticeExercise } from '../../utils/unitLearningMaterial'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { FlashcardPracticeRequest } from '../../utils/flashcardPractice'
import type { UiGoal } from '../../goalTypes'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { mapEntryPath } from './mapEntryPath'
import { GoalPracticeDialog } from '../GoalPracticeDialog'
import { UnitIntroduction } from '../UnitIntroduction'
import { isMastered } from '../../goalUiUtils'
import { UNIT_MAP_LEARNING_MATERIALS } from './learnerUnitMapPreviewSubjects'
import { filterLearnerUnitMapToSubjects } from './learnerUnitMapProjection'
import { createLearnerUnitMapCache, MATHEMATICS_LANDSCAPE_ID,
  UNIT_MAP_PREVIEW_SUBJECT_IDS } from './learnerUnitMapPreview'
import type { LearningEntryProgress } from './types'
import { buildUnitAssessmentActions, buildUnitFlashcardActions, findUnitMaterialScopes, placeUnitLearningResources, unitResourcePlacements } from './unitLearningMaterialActions'

const subjectLabel = (landscapeId: string, english: boolean) => landscapeId === MATHEMATICS_LANDSCAPE_ID
  ? english ? 'Mathematics' : 'Mathematik' : english ? 'Physics' : 'Physik'

/** Lazy product adapter; the original GoalCard remains the only goal detail view. */
export default function LearnerGoalNavigationMap(props: LearnerGoalNavigationMapProps) {
  const { rootGoals, goalIndexAll, canonicalGoalSources, visibleGoalIds, visibleChildrenByParent,
    getMastery, completionWaivers, onPracticeFlashcards, getFlashcardSource, onOpenGoal, onRequestUnitStudy } = props
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
  const canPracticeFlashcards = Boolean(onPracticeFlashcards)
  const bindings = useMemo(() => UNIT_MAP_LEARNING_MATERIALS.flatMap(material => {
    const scopes = findUnitMaterialScopes(material, progressFixture, goalIndexAll, visibleGoalIds)
    if (!scopes.size) return []
    const memoryId = material.unit.flashcardGoalId
    const memory = memoryId && visibleGoalIds.has(memoryId) && progressFixture.entries[memoryId]?.kind === 'memory'
      ? goalIndexAll.get(memoryId) : undefined
    const source = canPracticeFlashcards && memory?.landscapeId === material.unit.landscapeId
      ? getFlashcardSource?.(memory) : undefined
    return [{ material, scopes, source }]
  }), [progressFixture, goalIndexAll, visibleGoalIds, canPracticeFlashcards, getFlashcardSource])
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
    flashcards: canPracticeFlashcards ? buildUnitFlashcardActions(material, progressFixture, goalIndexAll, visibleGoalIds,
      source ? decks.get(source) : undefined, language, scopes) : new Map<string, FlashcardPracticeRequest>(),
    assessments: buildUnitAssessmentActions(material, progressFixture, goalIndexAll, visibleGoalIds, language, scopes),
  })), [bindings, progressFixture, goalIndexAll, visibleGoalIds, decks, language, canPracticeFlashcards])
  const materialScopes = useMemo(() => new Set(resources.flatMap(({ scopes }) => [...scopes])), [resources])
  // Route selection can recreate the goal index and its actions while the same resource nodes stay on the board.
  const placementKey = useMemo(() => JSON.stringify(resources.flatMap(unitResourcePlacements)), [resources])
  const fixture = useMemo(() => placeUnitLearningResources(progressFixture, JSON.parse(placementKey)), [progressFixture, placementKey])
  const [entryIntent, setEntryIntent] = useState({ active: props.active, explicit: false })
  const selectedKind = fixture.entries[props.selectedGoalId]?.kind
  const ordinarySelection = props.active && !!selectedKind && selectedKind !== 'assessment'
  // Adjust per-opening intent before commit, keeping the map camera free of a
  // second render caused by an effect that changes the introduction's height.
  if (entryIntent.active !== props.active) setEntryIntent({ active: props.active, explicit: ordinarySelection })
  else if (ordinarySelection && !entryIntent.explicit) setEntryIntent({ ...entryIntent, explicit: true })
  const enterUnit = useCallback(() => setEntryIntent(current => ({ ...current, explicit: true })), [])
  const requestStudy = useCallback(async (scopeId: string, goalId: string, targetGoalId?: string) => {
    const scopeGoalId = [...(mapEntryPath(progressFixture, scopeId) ?? [])].reverse().find(id => goalIndexAll.has(id)) ?? goalId
    return !onRequestUnitStudy || await onRequestUnitStudy(scopeGoalId, targetGoalId)
  }, [progressFixture, goalIndexAll, onRequestUnitStudy])
  const getGoalAction = useCallback((scopeId: string, id: string) => {
    const homeId = progressFixture.entryPaths?.[id]?.at(-2)
    const home = progressFixture.entries[id]?.sourceSections?.filter(source => source.kind !== 'canonicalSubtree').at(-1)?.title ?? (homeId && progressFixture.entries[homeId]?.title)
    for (const { flashcards, assessments } of resources) {
      const cards = flashcards.get(scopeId)
      if (cards?.goalId === id && onPracticeFlashcards) {
        const context = cards.goalIds && home ? (english ? `From the deck “${home}”` : `Aus dem Stapel „${home}“`) : undefined
        return { title: cards.title, context, label: cards.title, open: async () => {
          if (await requestStudy(scopeId, id)) onPracticeFlashcards(cards)
        } }
      }
      const assessment = assessments.get(scopeId)
      if (assessment?.goalId === id && onOpenGoal) {
        const context = home && (english ? `Assessment from “${home}”` : `Prüfung aus „${home}“`)
        return { title: fixture.entries[id].title, context, label: assessment.title, open: () => onOpenGoal(id) }
      }
    }
  }, [resources, english, fixture, progressFixture, onPracticeFlashcards, onOpenGoal, requestStudy])
  const [openExercise, setOpenExercise] = useState<{ scopeId: string; goalId: string } | null>(null)
  const getExercise = useCallback((scopeId: string, goalId: string) => {
    if (!visibleGoalIds.has(goalId) || !progressFixture.entries[scopeId]?.children?.includes(goalId)) return
    const path = mapEntryPath(progressFixture, scopeId)
    if (!path) return
    return findUnitPracticeExercise(goalIndexAll.get(goalId), [...path].reverse(),
      id => resources.find(resource => resource.scopes.has(id))?.material, language)
  }, [resources, progressFixture, goalIndexAll, visibleGoalIds, language])
  const getPracticeAction = useCallback((scopeId: string, goalId: string) => {
    const exercise = getExercise(scopeId, goalId)
    if (exercise) return { label: `${english ? 'Practice' : 'Üben'}: ${exercise.title}`,
      open: async () => { if (await requestStudy(scopeId, goalId, goalId)) setOpenExercise({ scopeId, goalId }) } }
    if (progressFixture.entries[goalId]?.sourceSections && onPracticeFlashcards) {
      for (const { flashcards } of resources) {
        const action = flashcards.get(goalId)
        if (action) return { label: action.title, open: async () => {
          if (await requestStudy(scopeId, goalId)) onPracticeFlashcards(action)
        } }
      }
    }
  }, [english, getExercise, progressFixture, resources, onPracticeFlashcards, requestStudy])
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
      result[id] = { total: value.totalCount, explicit: value.explicitCount, implicit: value.implicitCount, notRequired: value.notRequiredCount,
        explicitRatio: value.explicitRatio, implicitRatio: value.implicitRatio,
        sectionTitle: scope ? completionLabel(scope, language) : undefined }
      const waiver = completionWaivers.get(id)
      if (waiver?.reason === 'assessment') result[id].waiverLabel = language === 'en'
        ? `Credited through assessment for this section: ${completionLabel(waiver.sectionTitle, language)}`
        : `Fachlich angerechnet für diesen Lernabschnitt: ${completionLabel(waiver.sectionTitle, language)}`
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
      command={command} assessedUnit={props.unitAssessmentSummary} showInspector={false}
      onScopeEnter={enterUnit}
      toolbar={toolbar} locationBarContainer={props.locationBarContainer}
      getPracticeAction={getPracticeAction} getGoalAction={getGoalAction} materialScopes={materialScopes}
      renderScopeActions={scopeId => {
        const intros = resources.flatMap(({ scopes, material }) => scopes.has(scopeId) ? [material] : [])
        const subdecks = new Map<string, FlashcardPracticeRequest>()
        for (const { flashcards } of resources) {
          const action = flashcards.get(scopeId)
          if (action?.goalIds && !fixture.entries[scopeId]?.children?.includes(action.goalId)) subdecks.set(action.goalId, action)
        }
        return <>
          {intros.map(material => {
            const nextId = [...new Set([...(props.activeGoalId ? [props.activeGoalId] : []), ...(props.availableGoalIds ?? [])])].find(id => id !== material.unit.orientationGoalId
              && fixture.entries[id] && (mapEntryPath(fixture, id) ?? []).includes(scopeId))
            return <UnitIntroduction key={material.unit.landscapeId + material.unit.compositionNodeId}
              material={material} language={language} active={props.active} compact
              deferUntilRequested={!entryIntent.explicit && selectedKind === 'assessment'}
              context={(mapEntryPath(fixture, scopeId) ?? []).filter(id => id !== fixture.rootId).map(id => fixture.entries[id]?.title).filter(Boolean)}
              completed={!!material.unit.orientationGoalId && isMastered(getMastery(material.unit.orientationGoalId))}
              credited={completionWaivers.get(material.unit.orientationGoalId ?? '')?.reason === 'assessment'}
              nextStep={nextId ? { title: fixture.entries[nextId].title, open: () => (onOpenGoal ?? props.onSelectGoal)(nextId) } : undefined}
              onContinue={props.onContinueUnitIntroduction} />
          })}
          {[...subdecks.values()].map(action => <button key={action.goalId} type="button" className="lum-flashcard-action"
            data-testid="learning-map-flashcard-practice" onClick={async () => {
              if (await requestStudy(scopeId, action.goalId)) onPracticeFlashcards?.(action)
            }}>
            <BookOpen size={17} aria-hidden="true" />{action.title}</button>)}
          {scopeId === props.unitAssessmentSummary?.scopeGoalId && props.unitAssessmentSummary.content}
        </>
      }} onEntrySelect={(goalId) => {
        const goal = goalIndexAll.get(goalId)
        if (goal && !goal.personalCurriculumProjection?.presentationOnly) props.onSelectGoal(goalId)
      }}
      onReturnToTree={props.onReturnToTree} onEscape={props.onEscape} />
    {exercise && <GoalPracticeDialog exercise={exercise} language={language} onDismiss={() => setOpenExercise(null)} />}
  </div>
}
