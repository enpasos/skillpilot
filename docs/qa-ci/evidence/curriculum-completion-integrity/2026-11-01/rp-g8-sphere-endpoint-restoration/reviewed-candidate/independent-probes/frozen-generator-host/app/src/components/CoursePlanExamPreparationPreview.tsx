import { useMemo, useState } from 'react'
import type { MilestoneCoursePlanBlock, TeacherCoursePlan, TeacherCoursePlanBlock } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import {
  buildCoursePlanExamPreparationBlocks, coursePlanPreparationConsentKey,
  defaultCoursePlanPreparationEnd, previewCoursePlanExamPreparation,
} from '../utils/coursePlanExamPreparation'
import { InlineMathText } from './InlineMathText'

export function CoursePlanExamPreparationPreview({ plan, milestone, goals, prerequisiteGoals, referenceGoals, visibleChildren, asOf, language, onApply, onClose }: {
  plan: TeacherCoursePlan
  milestone: MilestoneCoursePlanBlock
  goals: ReadonlyMap<string, UiGoal>
  /** Labels only. Goals outside the course never join the scheduled target. */
  prerequisiteGoals?: ReadonlyMap<string, UiGoal>
  referenceGoals?: ReadonlyMap<string, UiGoal>
  visibleChildren?: ReadonlyMap<string, readonly string[]>
  asOf: string
  language: 'de' | 'en'
  onApply: (blocks: TeacherCoursePlanBlock[]) => boolean
  onClose: () => void
}) {
  const de = language === 'de'
  const [startDate, setStartDate] = useState(asOf)
  const [endDate, setEndDate] = useState(defaultCoursePlanPreparationEnd(milestone))
  const [includeSuggestions, setIncludeSuggestions] = useState(false)
  const [acceptedMove, setAcceptedMove] = useState('')
  const [error, setError] = useState('')
  const preview = useMemo(() => previewCoursePlanExamPreparation({ plan, milestone, goals, referenceGoals, visibleChildren, startDate, endDate, includeSuggestions }),
    [plan, milestone, goals, referenceGoals, visibleChildren, startDate, endDate, includeSuggestions])
  const scopeKey = coursePlanPreparationConsentKey(plan, milestone, preview, startDate, endDate)
  const hasSuggestions = preview.coverage.additionalGoalIds.length > 0 || preview.foundationGoalIds.length > 0
  const needsMoveConsent = preview.laterBlockIds.length > 0
  const hasExternalPrerequisites = preview.externalFoundationGoalIds.length > 0
  const blocked = !preview.validDates || !preview.planEvaluable || preview.invalidSelectedGoalIds.length > 0
    || preview.toPlanGoalIds.length === 0
    || (needsMoveConsent && acceptedMove !== scopeKey) || milestone.active === false
  const title = (id: string) => goals.get(id)?.title ?? prerequisiteGoals?.get(id)?.title
    ?? referenceGoals?.get(id)?.title ?? prerequisiteGoals?.get(id.slice(id.indexOf(':') + 1))?.title
    ?? referenceGoals?.get(id.slice(id.indexOf(':') + 1))?.title ?? id
  const lists = [
    { ids: preview.masteredGoalIds, label: de ? 'Bereits beherrscht' : 'Already mastered' },
    { ids: preview.timelyGoalIds, label: de ? 'Rechtzeitig eingeplant' : 'Scheduled in time' },
    { ids: preview.toPlanGoalIds, label: de ? 'Ergänzen oder vorziehen' : 'Add or bring forward' },
    { ids: preview.foundationGoalIds, label: de ? 'Zusätzlich benötigte Grundlagen' : 'Additional foundations needed' },
    { ids: preview.coverage.additionalGoalIds, label: de ? 'Zusätzliche Themen der Aufgaben' : 'Additional assessment topics' },
    { ids: preview.externalFoundationGoalIds, label: de ? 'Voraussetzungen außerhalb dieses Kursplans' : 'Prerequisites outside this course plan' },
    { ids: [...new Set([...preview.unavailableGoalIds, ...preview.coverage.unknownTaskIds])], label: de ? 'Noch zu klären' : 'Needs clarification' },
    { ids: preview.excludedTaskGoalIds, label: de ? 'Nicht verfügbare Aufgaben – nicht eingeplant' : 'Unavailable assessments – not scheduled' },
  ]
  return <section data-testid="course-plan-preparation-preview" aria-label={de ? 'Vorbereitung vervollständigen' : 'Complete preparation'} className="rounded-2xl border-2 border-sky-300 bg-sky-50/50 p-4 sm:p-6 dark:border-sky-800 dark:bg-sky-950/20">
    <h3 className="text-lg font-semibold text-text-primary">{de ? 'Vorbereitung vervollständigen' : 'Complete preparation'}: <InlineMathText text={milestone.title} /></h3>
    <p className="mt-2 text-sm text-text-secondary">{de ? 'Deine ausgewählten Themen und verfügbaren Aufgaben werden eingeplant. Zusätzliche Themen und Grundlagen übernimmst du nur, wenn du sie auswählst. Der Klausurstoff bleibt unverändert.' : 'Your selected topics and available assessments are scheduled. Additional topics and foundations are included only if you choose them. The exam topic selection stays unchanged.'}</p>
    {!plan.planningBaseline && <p className="mt-2 text-sm text-text-secondary">{de ? 'Ohne persönlichen Lernstand werden alle benötigten Ziele als offen eingeplant.' : 'Without personal progress, all required goals are planned as open.'}</p>}
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-text-primary">{de ? 'Vorbereitung ab' : 'Preparation from'}<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2" /></label>
      <label className="text-sm font-medium text-text-primary">{de ? 'Vorbereitung bis' : 'Preparation until'}<input type="date" value={endDate} max={defaultCoursePlanPreparationEnd(milestone)} onChange={(event) => setEndDate(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2" /></label>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{lists.map(({ ids, label }) => <details key={label} open={ids.length > 0} className="rounded-xl border border-border-color bg-sidebar-bg p-3 text-sm"><summary className="cursor-pointer font-medium text-text-primary">{ids.length} {label}</summary>{ids.length > 0 && <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-text-secondary">{ids.map((id) => <li key={id}><InlineMathText text={title(id)} /></li>)}</ul>}</details>)}</div>
    {preview.coverage.uncoveredGoalIds.length > 0 && <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">{de ? 'Nicht alle gewählten Themen haben eine zugeordnete Aufgabe. Sie werden trotzdem zum Lernen eingeplant; eine vollständige Aufgabenabdeckung wird damit nicht zugesagt.' : 'Some selected topics have no mapped assessment. They are included for learning; this does not establish full assessment coverage.'}</p>}
    {hasSuggestions && <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-2 text-sm text-text-primary"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sky-600" checked={includeSuggestions} onChange={(event) => setIncludeSuggestions(event.target.checked)} />{de ? 'Zusätzliche Themen und Grundlagen übernehmen' : 'Include additional topics and foundations'}</label>}
    {hasExternalPrerequisites && <p className="mt-3 text-sm text-text-secondary">{de ? 'Voraussetzungen außerhalb dieses Kursplans werden hier nicht eingeplant. Beim Lernen gelten die fachlichen Voraussetzungen weiterhin.' : 'Prerequisites outside this course plan are not scheduled here. Learning still requires the relevant foundations.'}</p>}
    {!includeSuggestions && hasSuggestions && <p className="mt-2 text-sm text-text-secondary">{de ? 'Die vorgeschlagenen Ergänzungen bleiben außerhalb deiner Vorbereitung. Ausgewählte Aufgaben bleiben enthalten und können diese Themen voraussetzen.' : 'Suggested additions remain outside your preparation. Selected assessments remain included and may require those topics.'}</p>}
    {needsMoveConsent && <div className="mt-3 rounded-xl border border-amber-300 p-3 text-sm text-text-primary"><p>{de ? 'Diese Abschnitte planen benötigte Lernziele erst später ein:' : 'These sections schedule required goals too late:'}</p><ul className="mt-2 list-disc pl-5">{preview.laterBlockIds.map((id) => <li key={id}><InlineMathText text={plan.blocks.find((block) => block.id === id)?.title || id} /></li>)}</ul><label className="mt-2 flex min-h-11 cursor-pointer items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sky-600" checked={acceptedMove === scopeKey} onChange={(event) => setAcceptedMove(event.target.checked ? scopeKey : '')} />{de ? 'Diese Lernziele vorziehen und die betroffenen Abschnitte anpassen. Leere Abschnitte werden inaktiv.' : 'Bring these goals forward and update the affected sections. Empty sections become inactive.'}</label></div>}
    {!preview.validDates && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{de ? 'Wähle einen Zeitraum mit mindestens einem Werktag vor dem Klausurtermin.' : 'Choose a period with at least one weekday before the exam.'}</p>}
    {(preview.unavailableGoalIds.length > 0 || preview.coverage.unknownTaskIds.length > 0) && <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">{de ? 'Einige Aufgaben-Zuordnungen oder Voraussetzungen sind noch zu klären. Deine ausgewählten Themen können trotzdem eingeplant werden; eine vollständige Aufgabenabdeckung wird nicht zugesagt.' : 'Some assessment mappings or prerequisites need clarification. Your selected topics can still be scheduled; full assessment coverage is not established.'}</p>}
    {preview.invalidSelectedGoalIds.length > 0 && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{de ? 'Einige ausgewählte Themen sind in diesem Kurs nicht verfügbar. Bitte passe die Themenauswahl an.' : 'Some selected topics are unavailable in this course. Please update the topic selection.'}</p>}
    {preview.toPlanGoalIds.length === 0 && preview.invalidSelectedGoalIds.length === 0 && <p className="mt-3 text-sm text-text-secondary">{hasExternalPrerequisites
      ? de ? 'Alle benötigten Ziele innerhalb dieses Kurses sind bereits beherrscht oder rechtzeitig eingeplant. Die Voraussetzungen außerhalb dieses Kursplans bleiben separat zu prüfen.' : 'All required goals within this course are mastered or scheduled in time. Prerequisites outside this course plan still need to be checked separately.'
      : de ? 'Alle benötigten Ziele sind bereits beherrscht oder rechtzeitig eingeplant.' : 'All required goals are mastered or scheduled in time.'}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-border-color px-4 py-2 text-sm text-text-primary">{de ? 'Schließen' : 'Close'}</button><button type="button" disabled={blocked} onClick={() => {
      const blocks = buildCoursePlanExamPreparationBlocks({ plan, milestone, preview, goals, visibleChildren, startDate, endDate, blockId: `exam-preparation-${globalThis.crypto.randomUUID()}`, moveLaterGoals: acceptedMove === scopeKey, title: `${de ? 'Vorbereitung' : 'Preparation'}: ${milestone.title}` })
      if (!blocks) setError(de ? 'Die Vorbereitung kann in diesem Zeitraum nicht vollständig eingeplant werden. Prüfe Puffer und andere Abschnitte.' : 'Preparation cannot be fully scheduled in this period. Review buffers and other sections.')
      else if (!onApply(blocks)) setError(de ? 'Die Vorbereitung konnte nicht gespeichert werden. Es wurde kein Lernabschnitt hinzugefügt. Prüfe den Kursplan und versuche es erneut.' : 'The preparation could not be saved. No learning section was added. Check the course plan and try again.')
    }} className="min-h-11 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">{de ? 'Vorbereitung übernehmen' : 'Apply preparation'}</button></div>
  </section>
}
