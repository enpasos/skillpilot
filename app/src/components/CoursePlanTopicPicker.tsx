import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, Check, ChevronDown, ChevronRight, ClipboardCheck, FileText, Search, X } from 'lucide-react'
import type { UiGoal } from '../goalTypes'
import { InlineMathText } from './InlineMathText'
import {
  buildCoursePlanTopicTree,
  analyzeCoursePlanTaskCoverage,
  filterCoursePlanTopicTree,
  findCoursePlanMatchingTasks,
  resolveCoursePlanTopicSelection,
  setCoursePlanTopicSelected,
  type CoursePlanTopicTreeNode,
} from '../utils/coursePlanTopicSelection'

export interface CoursePlanTopicPickerProps {
  goals: ReadonlyMap<string, UiGoal>
  referenceGoals?: ReadonlyMap<string, UiGoal>
  visibleChildrenByParent?: ReadonlyMap<string, readonly string[]>
  selectedGoalIds: readonly string[]
  onChange: (goalIds: string[]) => void
  language: 'de' | 'en'
  disabled?: boolean
}

function TopicCheckbox({ checked, mixed, disabled, label, onChange }: {
  checked: boolean
  mixed: boolean
  disabled: boolean
  label: string
  onChange: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed }, [mixed])
  return <input ref={ref} type="checkbox" checked={checked} aria-checked={mixed ? 'mixed' : checked}
    disabled={disabled} aria-label={label} onChange={onChange}
    className="h-4 w-4 shrink-0 cursor-pointer accent-sky-600 disabled:cursor-default disabled:opacity-40" />
}

export function CoursePlanTopicPicker({
  goals, referenceGoals, visibleChildrenByParent, selectedGoalIds, onChange, language, disabled = false,
}: CoursePlanTopicPickerProps) {
  const prefix = useId()
  const de = language === 'de'
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState<ReadonlyMap<string, boolean>>(new Map())
  const searching = query.trim().length > 0
  const tree = useMemo(() => buildCoursePlanTopicTree(goals, visibleChildrenByParent), [goals, visibleChildrenByParent])
  const filteredTree = useMemo(() => filterCoursePlanTopicTree(tree, query, goals, language), [tree, query, goals, language])
  const resolution = useMemo(() => resolveCoursePlanTopicSelection(selectedGoalIds, goals, visibleChildrenByParent),
    [selectedGoalIds, goals, visibleChildrenByParent])
  const selectedAtoms = useMemo(() => new Set(resolution.atomicGoalIds), [resolution])
  const invalidIds = useMemo(() => new Set(resolution.invalidGoalIds), [resolution])
  const nodeResolutions = useMemo(() => new Map([...goals.keys()].map((id) => [
    id, resolveCoursePlanTopicSelection([id], goals, visibleChildrenByParent),
  ])), [goals, visibleChildrenByParent])
  const tasks = useMemo(() => findCoursePlanMatchingTasks(selectedGoalIds, goals, visibleChildrenByParent, referenceGoals),
    [selectedGoalIds, goals, visibleChildrenByParent, referenceGoals])
  const coverage = useMemo(() => analyzeCoursePlanTaskCoverage(selectedGoalIds, goals, visibleChildrenByParent, referenceGoals),
    [selectedGoalIds, goals, visibleChildrenByParent, referenceGoals])
  const selectedTasks = new Set(coverage.taskGoalIds)
  const availableTasks = [...new Map([...tasks, ...coverage.taskGoalIds.flatMap((id) => goals.get(id) ?? [])]
    .map((goal) => [goal.id, goal])).values()]
  const selectedRoots = [...new Set(selectedGoalIds)]
  const changeSelection = (id: string, selected: boolean) => onChange(setCoursePlanTopicSelected(
    selectedGoalIds, id, selected, goals, visibleChildrenByParent,
  ))

  function renderNode(node: CoursePlanTopicTreeNode, depth = 0): ReactNode {
    const goal = goals.get(node.goalId)
    if (!goal) return null
    const nodeResolution = nodeResolutions.get(goal.id)
    const atoms = nodeResolution?.atomicGoalIds ?? []
    const checked = atoms.length > 0 && atoms.every((id) => selectedAtoms.has(id))
    const mixed = !checked && atoms.some((id) => selectedAtoms.has(id))
    const hasChildren = node.children.length > 0
    const open = searching || (expanded.get(goal.id) ?? depth === 0)
    const pathOnly = !node.selectable
    const unavailable = atoms.length === 0 || Boolean(nodeResolution?.invalidGoalIds.length)
    return <li key={goal.id}>
      <div className={`flex min-h-11 items-center gap-1 rounded-lg pr-2 transition-colors ${checked
        ? 'bg-sky-50 text-slate-900 dark:bg-sky-950/40 dark:text-slate-100'
        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50'}`}
        style={{ paddingLeft: `${Math.min(depth, 5) * 12 + 4}px` }}>
        {hasChildren ? <button type="button" disabled={disabled || searching}
          aria-label={`${goal.title} ${de ? (open ? 'einklappen' : 'aufklappen') : (open ? 'collapse' : 'expand')}`}
          aria-expanded={open} aria-controls={`${prefix}-children-${goal.id}`}
          onClick={() => setExpanded((current) => new Map(current).set(goal.id, !open))}
          className="flex h-8 w-7 shrink-0 items-center justify-center rounded text-slate-400 hover:text-sky-600 focus-visible:outline-2 focus-visible:outline-sky-500 disabled:cursor-default">
          {open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
        </button> : <span className="w-7 shrink-0" aria-hidden="true" />}
        <label className={`flex min-w-0 flex-1 items-center gap-2 py-2 ${disabled || pathOnly || unavailable ? '' : 'cursor-pointer'}`}
          title={pathOnly ? (de ? 'Diesen Themenbereich in der vollständigen Ansicht auswählen.' : 'Select this topic in the full view.') : undefined}>
          <TopicCheckbox checked={checked} mixed={mixed} disabled={disabled || pathOnly || unavailable}
            label={`${goal.title} ${de ? 'auswählen' : 'select'}`} onChange={() => changeSelection(goal.id, !checked)} />
          <InlineMathText className={`min-w-0 flex-1 break-words text-sm ${hasChildren ? 'font-medium' : ''}`} text={goal.title} />
          <span className="shrink-0 text-xs tabular-nums text-slate-400" title={de ? 'Lernziele' : 'Learning goals'}>{atoms.length}</span>
        </label>
      </div>
      {hasChildren && open && <ul id={`${prefix}-children-${goal.id}`} className="space-y-0.5">{node.children.map((child) => renderNode(child, depth + 1))}</ul>}
    </li>
  }

  return <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]" data-testid="course-plan-topic-picker">
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900" aria-labelledby={`${prefix}-topics`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <h3 id={`${prefix}-topics`} className="font-semibold text-slate-900 dark:text-slate-100">{de ? 'Themen auswählen' : 'Select topics'}</h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">{de ? 'Mehrfachauswahl' : 'Multiple selection'}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <label className="flex min-w-0 basis-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:flex-1 sm:basis-48 dark:border-slate-700 dark:bg-slate-800">
          <Search size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
          <input type="search" value={query} disabled={disabled} onChange={(event) => setQuery(event.target.value)}
            aria-label={de ? 'Themen durchsuchen' : 'Search topics'} placeholder={de ? 'Thema suchen …' : 'Search topics …'}
            className="w-full min-w-0 bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100" />
        </label>
        <button type="button" disabled={disabled || selectedRoots.length === 0} onClick={() => onChange([])}
          className="rounded px-1 py-2 text-xs font-medium text-sky-700 hover:underline disabled:opacity-40 dark:text-sky-300">
          {de ? 'Auswahl aufheben' : 'Clear selection'}
        </button>
      </div>
      {searching && <p className="px-4 pb-2 text-xs text-slate-500 dark:text-slate-400">{de
        ? 'Die Suche schränkt nur die Ansicht ein. Deine Auswahl bleibt erhalten.'
        : 'Search only filters the view. Your selection is retained.'}</p>}
      <div className="max-h-[34rem] overflow-y-auto px-2 pb-3">
        {filteredTree.length > 0 ? <ul className="space-y-0.5" aria-label={de ? 'Themen und Lernziele' : 'Topics and learning goals'}>{filteredTree.map((node) => renderNode(node))}</ul>
          : <p className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">{de ? 'Keine passenden Themen gefunden.' : 'No matching topics found.'}</p>}
      </div>
      <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">{de
        ? 'Ein Häkchen wählt das Thema mit seinen Unterthemen aus.'
        : 'A checkbox selects the topic and its subtopics.'}</p>
    </section>

    <aside className="min-w-0 space-y-4" aria-labelledby={`${prefix}-selection`}>
      <section className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-800 dark:bg-sky-950/20">
        <h3 id={`${prefix}-selection`} className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100"><ClipboardCheck size={19} className="text-sky-600 dark:text-sky-400" aria-hidden="true" />{de ? 'Deine Auswahl' : 'Your selection'}</h3>
        <p className="my-4 flex items-baseline gap-2 text-slate-700 dark:text-slate-200" aria-live="polite" aria-atomic="true">
          <strong className="text-3xl font-semibold tabular-nums text-sky-700 dark:text-sky-300">{coverage.topicGoalIds.length}</strong>
          {de ? (coverage.topicGoalIds.length === 1 ? 'Lernthema' : 'Lernthemen') : (coverage.topicGoalIds.length === 1 ? 'learning topic' : 'learning topics')}
        </p>
        {coverage.taskGoalIds.length > 0 && <p className="mb-3 text-sm text-sky-800 dark:text-sky-300">{coverage.taskGoalIds.length} {de ? 'Aufgabenpakete ausgewählt' : 'selected assessment packages'}</p>}
        {selectedRoots.length > 0 ? <ul className="max-h-72 space-y-2 overflow-y-auto">{selectedRoots.map((id) => {
          const invalid = invalidIds.has(id)
          const title = goals.get(id)?.title ?? id
          return <li key={id} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
            {invalid ? <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
              : <Check size={15} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-400" aria-hidden="true" />}
            <span className="min-w-0 flex-1 break-words"><InlineMathText text={title} />{invalid && <span className="block text-xs text-amber-800 dark:text-amber-300">{de ? 'Im aktuellen Kurs nicht verfügbar. Bitte Auswahl prüfen.' : 'Unavailable in the current course. Please check the selection.'}</span>}</span>
            <button type="button" disabled={disabled} onClick={() => changeSelection(id, false)} aria-label={`${title} ${de ? 'entfernen' : 'remove'}`}
              className="-mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-slate-400 hover:bg-sky-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-500 disabled:opacity-40 sm:-mt-1 sm:h-8 sm:w-8 dark:hover:bg-sky-900 dark:hover:text-slate-100"><X size={16} aria-hidden="true" /></button>
          </li>
        })}</ul> : <p className="text-sm text-slate-500 dark:text-slate-400">{de ? 'Wähle ein oder mehrere Themen aus.' : 'Select one or more topics.'}</p>}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{de ? 'Gemeinsame Lernziele werden nur einmal gezählt.' : 'Shared learning goals are counted once.'}</p>
        {resolution.atomicGoalIds.length > 0 && <details className="mt-3 border-t border-sky-100 pt-3 text-sm dark:border-sky-900">
          <summary className="cursor-pointer font-medium text-sky-800 dark:text-sky-300">{de ? 'Lernziele ansehen' : 'View learning goals'}</summary>
          <ul className="mt-2 max-h-60 list-disc space-y-1 overflow-y-auto pl-5 text-slate-600 dark:text-slate-300">{coverage.topicGoalIds.map((id) => <li className="break-words" key={id}><InlineMathText text={goals.get(id)?.title ?? id} /></li>)}</ul>
        </details>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900" aria-labelledby={`${prefix}-tasks`}>
        <h3 id={`${prefix}-tasks`} className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100"><FileText size={18} className="text-sky-600 dark:text-sky-400" aria-hidden="true" />{de ? 'Passende Aufgaben' : 'Matching tasks'}</h3>
        {availableTasks.length > 0 ? <details className="mt-3 text-sm" open={coverage.taskGoalIds.length > 0}>
          <summary className="cursor-pointer font-medium text-sky-800 dark:text-sky-300">{availableTasks.length} {de ? (availableTasks.length === 1 ? 'Aufgabe ansehen' : 'Aufgaben ansehen') : (availableTasks.length === 1 ? 'task available' : 'tasks available')}</summary>
          <ul className="mt-3 max-h-60 space-y-2 overflow-y-auto text-slate-600 dark:text-slate-300">{availableTasks.map((task) => <li key={task.id} className="break-words"><label className="flex min-h-11 cursor-pointer items-start gap-2 py-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sky-600" disabled={disabled} checked={selectedTasks.has(task.id)} aria-label={`${task.title} ${de ? 'als Aufgabenpaket auswählen' : 'select assessment package'}`} onChange={(event) => changeSelection(task.id, event.target.checked)} /><InlineMathText text={task.title} /></label></li>)}</ul>
        </details> : <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{de
          ? 'Für diese Auswahl sind keine passenden Aufgaben hinterlegt.'
          : 'No matching tasks are available for this selection.'}</p>}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{de ? 'Wähle die Aufgabenpakete aus, mit denen du dich vorbereiten möchtest. Weitere Pakete findest du im Themenbaum.' : 'Select the assessment packages for your preparation. Find additional packages in the topic tree.'}</p>
      </section>

      <section data-testid="course-plan-task-coverage" className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{de ? 'Aufgabenabdeckung' : 'Assessment coverage'}</h3>
        {coverage.taskGoalIds.length === 0 ? <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{de ? 'Wähle ein Aufgabenpaket aus, um seine Themenzuordnung zu vergleichen.' : 'Select an assessment package to compare its topic coverage.'}</p> : <>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{coverage.topicGoalIds.length - coverage.uncoveredGoalIds.length} / {coverage.topicGoalIds.length} {de ? 'ausgewählte Lernthemen zugeordnet' : 'selected topics mapped'}</p>
          {[
            { ids: coverage.uncoveredGoalIds, label: de ? 'Ohne Aufgabenabdeckung' : 'Not covered by selected tasks' },
            { ids: coverage.additionalGoalIds, label: de ? 'Zusätzliche Themen der Aufgaben' : 'Additional assessment topics' },
            { ids: coverage.unknownTaskIds, label: de ? 'Zuordnung noch ungeklärt' : 'Coverage not established' },
            { ids: coverage.unavailableGoalIds, label: de ? 'Im Kurs nicht verfügbare Zuordnungen' : 'Mappings unavailable in this course' },
          ].map(({ ids, label }) => <details key={label} className="mt-3 text-sm" open={ids.length > 0}><summary className={ids.length ? 'cursor-pointer font-medium text-amber-800 dark:text-amber-300' : 'cursor-pointer text-slate-500 dark:text-slate-400'}>{ids.length} {label}</summary>{ids.length > 0 && <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-slate-600 dark:text-slate-300">{ids.map((id) => <li key={id}><InlineMathText text={goals.get(id)?.title ?? id} /></li>)}</ul>}</details>)}
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{de ? 'Gemäß der hinterlegten Themenzuordnung. Notwendige Grundlagen werden bei der Vorbereitung getrennt ausgewiesen.' : 'Based on the authored topic mapping. Required foundations are listed separately in preparation.'}</p>
        </>}
      </section>
    </aside>
  </div>
}
