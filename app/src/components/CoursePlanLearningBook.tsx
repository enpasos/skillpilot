import React, { useMemo, useState } from 'react'

import type { UiGoal } from '../goalTypes'
import { goalBookDefinitionByLandscapeId, goalBookRoute } from '../utils/goalBookPublicationRegistry'
import { InlineMathText } from './InlineMathText'

interface PlanningGoalOption {
  goal: UiGoal
  count: number
  totalCount: number
  atomicGoalIds: string[]
}

interface CoursePlanLearningBookProps {
  options: readonly PlanningGoalOption[]
  goals: ReadonlyMap<string, UiGoal>
  plannedGoalIds: ReadonlySet<string> | null
  language: 'de' | 'en'
  onPrepareGoal: (goalId: string) => void
}

/** Current, scope-limited curriculum selection; not a published BookModel. */
export const CoursePlanLearningBook: React.FC<CoursePlanLearningBookProps> = ({ options, goals, plannedGoalIds, language, onPrepareGoal }) => {
  const de = language === 'de'
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [onlyUnplanned, setOnlyUnplanned] = useState(false)
  const [showIncluded, setShowIncluded] = useState(false)
  const [showPrerequisites, setShowPrerequisites] = useState(false)
  const unplannedIds = useMemo(() => plannedGoalIds === null ? null : [...new Set(options.flatMap((option) => option.atomicGoalIds))]
    .filter((id) => goals.has(id) && !plannedGoalIds.has(id)), [goals, options, plannedGoalIds])
  const unplanned = useMemo(() => new Set(unplannedIds ?? []), [unplannedIds])
  const matches = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(de ? 'de-DE' : 'en-GB')
    return options.filter(({ goal, atomicGoalIds }) => goals.has(goal.id)
      && (!onlyUnplanned || plannedGoalIds === null || atomicGoalIds.some((id) => unplanned.has(id)))
      && (!needle || `${goal.title} ${goal.description} ${goal.id}`.toLocaleLowerCase(de ? 'de-DE' : 'en-GB').includes(needle)))
  }, [de, goals, onlyUnplanned, options, plannedGoalIds, query, unplanned])
  const selected = matches.find(({ goal }) => goal.id === selectedId) ?? matches[0]
  const selectedGoal = selected ? goals.get(selected.goal.id) : undefined
  const definition = selectedGoal?.landscapeId ? goalBookDefinitionByLandscapeId(selectedGoal.landscapeId) : undefined
  const ordinaryAtom = selectedGoal?.semanticKind === 'curricularAtomic'
    || (selectedGoal?.semanticKind === undefined && selectedGoal?.type === 'atomic'
      && selectedGoal.nodeKind === 'tutor' && !selectedGoal.examData
      && !selectedGoal.tags?.some((tag) => tag === 'memorization' || tag.startsWith('srs-deck:')))
  const bookLink = definition && selectedGoal && ordinaryAtom
    && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/u.test(selectedGoal.id)
    ? `${goalBookRoute(definition.bookId)}#goal-${selectedGoal.id}` : null
  const prerequisites = [...new Set((selected?.atomicGoalIds ?? []).flatMap((id) => {
    const atom = goals.get(id)
    return atom?.effectiveRequires ?? atom?.requires ?? []
  }))]

  return (
    <details className="min-w-0 rounded-xl border border-border-color bg-sidebar-bg" data-testid="course-plan-learning-book">
      <summary className="min-h-11 cursor-pointer px-4 py-3 font-semibold">{de ? 'Lernziele auswählen' : 'Choose learning goals'}</summary>
      <div className="space-y-3 border-t border-border-color p-4">
        <p className="text-sm text-text-secondary">{de
          ? 'Aktuelle Lernziele dieser Kursauswahl. Verfügbare Buchlinks öffnen die separat veröffentlichte Ausgabe; ihr Stand kann abweichen.'
          : 'Current goals in this course selection. Available book links open the separately published edition; its version may differ.'}</p>
        <p className="text-sm text-text-secondary" data-testid="course-plan-unplanned-goals">{unplannedIds === null
          ? de ? 'Die Planzuordnung ist derzeit nicht verlässlich auswertbar.' : 'Plan assignments cannot currently be evaluated reliably.'
          : de
          ? `${unplannedIds.length} planbare atomare Ziele noch nicht eingeplant. Dies ist keine Aussage zur Beherrschung.`
          : `${unplannedIds.length} plannable atomic goals not yet scheduled. This does not describe mastery.`}</p>
        <div className="flex flex-wrap items-center gap-3">
          <label className="min-w-0 flex-1 basis-64 text-sm font-medium">{de ? 'Lernziele durchsuchen' : 'Search learning goals'}
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2" />
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" disabled={plannedGoalIds === null} checked={plannedGoalIds !== null && onlyUnplanned} onChange={(event) => setOnlyUnplanned(event.target.checked)} />{de ? 'Mit noch nicht eingeplanten Zielen' : 'With unscheduled goals'}</label>
        </div>
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <p className="mb-2 text-xs text-text-secondary">{matches.length > 50
              ? de ? `Erste 50 von ${matches.length} Treffern. Suche eingrenzen.` : `First 50 of ${matches.length} matches. Refine the search.`
              : de ? `${matches.length} Treffer` : `${matches.length} matches`}</p>
            <ul className="max-h-72 space-y-1 overflow-y-auto" aria-label={de ? 'Planbare Lernziele' : 'Plannable learning goals'}>
              {matches.slice(0, 50).map(({ goal, count }) => <li key={goal.id}>
                <button type="button" onClick={() => setSelectedId(goal.id)} aria-pressed={selectedGoal?.id === goal.id} className={`min-h-11 w-full rounded-lg border px-3 py-2 text-left text-sm ${selectedGoal?.id === goal.id ? 'border-sky-500 bg-sky-50 text-sky-950 dark:bg-sky-950 dark:text-sky-100' : 'border-border-color'}`}>
                  <InlineMathText text={goal.title} /><span className="block text-xs opacity-75">{goal.phase !== 'GLOBAL' ? `${goal.phase} · ` : ''}{count} {de ? 'planbare Ziele' : 'plannable goals'}</span>
                </button>
              </li>)}
            </ul>
          </div>
          {selected && selectedGoal ? <article className="min-w-0 rounded-xl border border-border-color bg-chat-bg p-4" data-testid="course-plan-goal-description">
            <h3 className="break-words text-lg font-semibold"><InlineMathText text={selectedGoal.title} /></h3>
            <p className="mt-3 whitespace-pre-line break-words text-sm leading-6"><InlineMathText text={selectedGoal.description} /></p>
            <p className="mt-2 break-all text-xs text-text-secondary">{selectedGoal.id}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={selected.count === 0} onClick={() => onPrepareGoal(selectedGoal.id)} className="min-h-11 rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{de ? 'Als Planabschnitt vorbereiten' : 'Prepare plan section'}</button>
              {bookLink && <a href={bookLink} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-border-color px-3 py-2 text-sm">{de ? 'Im öffentlichen Lernzielbuch öffnen' : 'Open in the public goal book'}</a>}
            </div>
            {selected.atomicGoalIds.length > 1 && <details onToggle={(event) => setShowIncluded(event.currentTarget.open)} className="mt-3 border-t border-border-color pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm">{de ? 'Zugehörige planbare Lernziele' : 'Included plannable goals'} ({selected.atomicGoalIds.length})</summary>
              {showIncluded && <><p className="text-xs text-text-secondary">{selected.atomicGoalIds.length > 100 ? de ? 'Erste 100 Ziele. Für weitere Ziele die Suche verwenden.' : 'First 100 goals. Use search to find other goals.' : ''}</p><ul className="max-h-48 space-y-2 overflow-y-auto text-sm">{selected.atomicGoalIds.slice(0, 100).map((id) => <li key={id}><InlineMathText text={goals.get(id)?.title ?? id} /> · {plannedGoalIds === null ? de ? 'Zuordnung unklar' : 'assignment unknown' : plannedGoalIds.has(id) ? de ? 'eingeplant' : 'scheduled' : de ? 'noch nicht eingeplant' : 'not yet scheduled'}</li>)}</ul></>}
            </details>}
            {prerequisites.length > 0 && <details onToggle={(event) => setShowPrerequisites(event.currentTarget.open)} className="mt-3 border-t border-border-color pt-2"><summary className="min-h-11 cursor-pointer py-2 text-sm">{de ? 'Erfasste Voraussetzungen' : 'Recorded prerequisites'} ({prerequisites.length})</summary>
              <p className="mb-2 text-xs text-text-secondary">{de ? 'Eine fehlende Planzuordnung ist kein Nachweis einer Wissenslücke.' : 'Absence from the plan does not establish a knowledge gap.'}</p>
              {showPrerequisites && <><p className="text-xs text-text-secondary">{prerequisites.length > 100 ? de ? 'Erste 100 Voraussetzungen. Für Einzelheiten ein engeres Lernziel auswählen.' : 'First 100 prerequisites. Select a narrower goal for details.' : ''}</p><ul className="max-h-48 space-y-2 overflow-y-auto break-words text-sm">{prerequisites.slice(0, 100).map((id) => <li key={id}><InlineMathText text={goals.get(id)?.title ?? id} />{!goals.has(id) ? de ? ' · außerhalb dieser Kursauswahl' : ' · outside this course selection' : ''}</li>)}</ul></>}
            </details>}
          </article> : <p className="text-sm text-text-secondary">{de ? 'Keine passenden Lernziele.' : 'No matching learning goals.'}</p>}
        </div>
      </div>
    </details>
  )
}
