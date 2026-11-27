import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MemoryCardOriginFields } from '../../utils/memoryCardOrigins'
import type { UiGoal } from '../../goalTypes'
import type { LearnerGoalNavigationMapProps } from '../../views/LearnerView'
import { buildTreeCompletionProgressMap } from '../../utils/treeCompletionProgress'
import { completionLabel } from '../../utils/levelCompletionApi'
import { LearningUnitMap } from './LearningUnitMap'
import { mapEntryPath } from './mapEntryPath'
import { UNIT_MAP_LEARNING_MATERIALS } from '../../utils/learnerNavigation/learnerUnitMapPreviewSubjects'
import { filterLearnerUnitMapToSubjects } from '../../utils/learnerNavigation/learnerUnitMapProjection'
import { learnerUnitMapSubjectIds, MATHEMATICS_LANDSCAPE_ID, PHYSICS_LANDSCAPE_ID,
  UNIT_MAP_PREVIEW_SUBJECT_IDS } from '../../utils/learnerNavigation/learnerUnitMapPreview'
import { useLearnerUnitFixture } from '../../utils/learnerNavigation/useLearnerUnitFixture'
import type { LearningEntryProgress } from './types'
import { buildUnitAssessmentActions, buildUnitFlashcardActions, cardDeckIdsByScope, findUnitMaterialScopes, mapDeckGoalIds,
  placeUnitLearningResources, unitResourcePlacements } from './unitLearningMaterialActions'

/** A course outside the two preview subjects is named by its own title. */
const subjectLabel = (landscapeId: string, english: boolean, courseTitles: ReadonlyMap<string, string>) =>
  landscapeId === MATHEMATICS_LANDSCAPE_ID ? english ? 'Mathematics' : 'Mathematik'
    : landscapeId === PHYSICS_LANDSCAPE_ID ? english ? 'Physics' : 'Physik'
      : courseTitles.get(landscapeId) ?? (english ? 'Course' : 'Kurs')

/** Lazy product adapter; the original GoalCard remains the only goal detail view. */
export default function LearnerGoalNavigationMap(props: LearnerGoalNavigationMapProps) {
  const { goalIndexAll, visibleGoalIds,
    getMastery, completionWaivers, onPracticeFlashcards, getFlashcardSource, onOpenGoal, onRequestUnitStudy } = props
  const english = props.language === 'en'
  const baseFixture = useLearnerUnitFixture(props)
  const [hiddenSubjects, setHiddenSubjects] = useState<readonly string[]>([])
  // The map covers Mathematics, Physics and courses that declare all their learning units;
  // subjects are filters, not nodes.
  // Route selection can recreate the goal index; the covered subjects are kept as a key so
  // that an unchanged answer keeps the subject list, and with it the fixture object.
  const coveredKey = useMemo(() => learnerUnitMapSubjectIds(props.canonicalGoalSources, goalIndexAll).sort().join('\u0000'),
    [props.canonicalGoalSources, goalIndexAll])
  const courseTitles = useMemo(() => new Map((props.canonicalGoalSources ?? []).flatMap(({ meta }) =>
    meta?.landscapeId && meta.title ? [[meta.landscapeId, meta.title] as const] : [])), [props.canonicalGoalSources])
  const mapSubjects = useMemo(() => {
    const covered = new Set(coveredKey.split('\u0000'))
    return baseFixture.subjectIds.filter(id => covered.has(id))
  }, [baseFixture, coveredKey])
  const shownSubjects = useMemo(() => {
    const shown = mapSubjects.filter(id => !hiddenSubjects.includes(id))
    return shown.length ? shown : mapSubjects
  }, [mapSubjects, hiddenSubjects])
  const progressFixture = useMemo(() => filterLearnerUnitMapToSubjects(baseFixture, new Set(shownSubjects)), [baseFixture, shownSubjects])
  const language = props.language ?? 'de'
  const canPracticeFlashcards = Boolean(onPracticeFlashcards)
  const bindings = useMemo(() => UNIT_MAP_LEARNING_MATERIALS.flatMap(material => {
    const scopes = findUnitMaterialScopes(material, progressFixture, goalIndexAll, visibleGoalIds)
    return scopes.size ? [{ material, scopes }] : []
  }), [progressFixture, goalIndexAll, visibleGoalIds])
  // Card practice follows the deck goals in the learner's scope (#85), not unit material files.
  const deckSources = useMemo(() => new Map(canPracticeFlashcards ? mapDeckGoalIds(progressFixture, visibleGoalIds).flatMap(id => {
    const deckGoal = goalIndexAll.get(id)
    const source = deckGoal && getFlashcardSource?.(deckGoal)
    return source ? [[id, source] as const] : []
  }) : []), [progressFixture, goalIndexAll, visibleGoalIds, canPracticeFlashcards, getFlashcardSource])
  // Avoid refetching when a render or language change yields the same authorized deck URLs.
  const sourceList = JSON.stringify([...new Set(deckSources.values())].sort())
  const [decks, setDecks] = useState<ReadonlyMap<string, MemoryCardOriginFields[]>>(new Map())
  const loadedDeckSources = useRef(new Set<string>())
  useEffect(() => {
    const controller = new AbortController()
    const sources = (JSON.parse(sourceList) as string[]).filter(source => !loadedDeckSources.current.has(source))
    // One deck file per deck goal, never per unit. All decks arrive in one update, because
    // every new card action changes the board topology and repeats its layout.
    void Promise.all(sources.map(source => fetch(source, { cache: 'no-store', signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('Flashcard deck unavailable')
      return response.json()
    }).then(data => Array.isArray(data?.cards) ? [[source, data.cards as MemoryCardOriginFields[]] as const] : [])
      .catch(() => [] /* Full decks keep the normal learner-facing load and error handling. */))).then(loaded => {
      const found = loaded.flat()
      if (controller.signal.aborted || !found.length) return
      for (const [source] of found) loadedDeckSources.current.add(source)
      setDecks(previous => new Map([...previous, ...found]))
    })
    return () => controller.abort()
  }, [sourceList])
  const cardActions = useMemo(() => new Map([...deckSources].flatMap(([id, source]) => {
    const actions = buildUnitFlashcardActions(id, progressFixture, goalIndexAll, visibleGoalIds, decks.get(source), language)
    return actions.size ? [[id, actions] as const] : []
  })), [deckSources, progressFixture, goalIndexAll, visibleGoalIds, decks, language])
  const resources = useMemo(() => bindings.map(({ material, scopes }) => ({
    material, scopes,
    assessments: buildUnitAssessmentActions(material, progressFixture, goalIndexAll, visibleGoalIds, language, scopes),
  })), [bindings, progressFixture, goalIndexAll, visibleGoalIds, language])
  const materialScopes = useMemo(() => new Set(resources.flatMap(({ scopes }) => [...scopes])), [resources])
  // Route selection can recreate the goal index and its actions while the same resource nodes stay on the board.
  const placementKey = useMemo(() => {
    const cardDeckIds = cardDeckIdsByScope(cardActions)
    const cardScopes = new Set([...cardDeckIds.keys()].filter(scopeId => !materialScopes.has(scopeId)))
    return JSON.stringify([...resources.flatMap(({ material, scopes, assessments }) =>
      unitResourcePlacements({ material, scopes, cardDeckIds, assessments })),
    ...unitResourcePlacements({ scopes: cardScopes, cardDeckIds, assessments: new Map() })])
  }, [resources, cardActions, materialScopes])
  const fixture = useMemo(() => placeUnitLearningResources(progressFixture, JSON.parse(placementKey)), [progressFixture, placementKey])
  const requestStudy = useCallback(async (scopeId: string, goalId: string) => {
    const scopeGoalId = [...(mapEntryPath(progressFixture, scopeId) ?? [])].reverse().find(id => goalIndexAll.has(id)) ?? goalId
    return !onRequestUnitStudy || await onRequestUnitStudy(scopeGoalId)
  }, [progressFixture, goalIndexAll, onRequestUnitStudy])
  const getGoalAction = useCallback((scopeId: string, id: string) => {
    const homeId = progressFixture.entryPaths?.[id]?.at(-2)
    const home = progressFixture.entries[id]?.sourceSections?.filter(source => source.kind !== 'canonicalSubtree').at(-1)?.title ?? (homeId && progressFixture.entries[homeId]?.title)
    const cards = cardActions.get(id)?.get(scopeId)
    if (cards && onPracticeFlashcards) {
      const context = cards.goalIds && home ? (english ? `From the deck “${home}”` : `Aus dem Stapel „${home}“`) : undefined
      return { title: cards.title, context, label: cards.title, open: async () => {
        if (await requestStudy(scopeId, id)) onPracticeFlashcards(cards)
      } }
    }
    for (const { assessments } of resources) {
      const assessment = assessments.get(scopeId)
      if (assessment?.goalId === id && onOpenGoal) {
        const context = home && (english ? `Assessment from “${home}”` : `Prüfung aus „${home}“`)
        return { title: fixture.entries[id].title, context, label: assessment.title, open: () => onOpenGoal(id) }
      }
    }
  }, [resources, cardActions, english, fixture, progressFixture, onPracticeFlashcards, onOpenGoal, requestStudy])
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

  if (!baseFixture.entries[baseFixture.rootId].children?.length) return <div className="learner-map-status" role="status" data-testid="learner-map-empty">
    <p>{english ? 'No learning goals are visible in this curriculum view.' : 'In dieser Lehrplanansicht sind keine Lernziele sichtbar.'}</p>
    <button type="button" onClick={props.onReturnToTree}>{english ? 'Return to tree' : 'Zum Baum wechseln'}</button>
  </div>
  if (!mapSubjects.length) return <div className="learner-map-status" role="status" data-testid="learner-map-subjects-unavailable">
    {/* The package-consumer edition carries no preview subjects (src/packageConsumer). */}
    <p>{!UNIT_MAP_PREVIEW_SUBJECT_IDS.length
      ? english ? 'The learning map is not available in this edition. Your subjects are in the goal tree.'
        : 'Die Lernkarte ist in dieser Ausgabe nicht verfügbar. Deine Fächer findest du im Lernzielbaum.'
      : english ? 'For now, the learning map is available only for Mathematics and Physics at the Gymnasium and for courses in which every learning goal belongs to a unit. Your other subjects are in the goal tree.'
        : 'Die Lernkarte gibt es vorerst nur für Mathematik und Physik am Gymnasium und für Kurse, in denen jedes Lernziel zu einer Einheit gehört. Deine anderen Fächer findest du im Lernzielbaum.'}</p>
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
        {subjectLabel(subject, english, courseTitles)}
      </button>
    })}
  </div> : undefined

  return <div className="learner-native-goal-map" data-testid="native-cockpit-map" data-map-view="units"
    data-selected-goal-id={props.selectedGoalId} data-map-active={props.active}>
    <LearningUnitMap fixture={fixture} embedded active={props.active} headingMode="context"
      rootLabel={english ? 'My learning goals' : 'Meine Lernziele'} language={props.language} learnerProgress={progress} activeGoalId={props.activeGoalId}
      command={command} assessmentContext={props.assessmentContext}
      toolbar={toolbar} locationBarContainer={props.locationBarContainer}
      getGoalAction={getGoalAction} materialScopes={materialScopes}
      onEntrySelect={(goalId) => {
        const goal = goalIndexAll.get(goalId)
        if (goal && !goal.personalCurriculumProjection?.presentationOnly) props.onSelectGoal(goalId)
      }}
      onReturnToTree={props.onReturnToTree} onEscape={props.onEscape} />
  </div>
}
