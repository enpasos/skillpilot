import { useMemo, useState } from 'react'
import type { MilestoneCoursePlanBlock, TeacherCoursePlan, TeacherCoursePlanBlock } from '../coursePlanTypes'
import type { UiGoal } from '../goalTypes'
import {
  buildCoursePlanExamPreparationBlocks, coursePlanPreparationConsentKey,
  defaultCoursePlanPreparationEnd, previewCoursePlanExamPreparation,
} from '../utils/coursePlanExamPreparation'
import { InlineMathText } from './InlineMathText'

export function CoursePlanExamPreparationPreview({ plan, milestone, goals, prerequisiteGoals, visibleChildren, asOf, language, onApply, onClose }: {
  plan: TeacherCoursePlan
  milestone: MilestoneCoursePlanBlock
  goals: ReadonlyMap<string, UiGoal>
  /** Labels only. Goals outside the course never join the scheduled target. */
  prerequisiteGoals?: ReadonlyMap<string, UiGoal>
  visibleChildren?: ReadonlyMap<string, readonly string[]>
  asOf: string
  language: 'de' | 'en'
  onApply: (blocks: TeacherCoursePlanBlock[]) => void
  onClose: () => void
}) {
  const de = language === 'de'
  const [startDate, setStartDate] = useState(asOf)
  const [endDate, setEndDate] = useState(defaultCoursePlanPreparationEnd(milestone))
  const [acceptedScope, setAcceptedScope] = useState('')
  const [acceptedMove, setAcceptedMove] = useState('')
  const [acceptedExternal, setAcceptedExternal] = useState('')
  const [error, setError] = useState('')
  const preview = useMemo(() => previewCoursePlanExamPreparation({ plan, milestone, goals, visibleChildren, startDate, endDate }),
    [plan, milestone, goals, visibleChildren, startDate, endDate])
  const scopeKey = coursePlanPreparationConsentKey(plan, milestone, preview, startDate, endDate)
  const needsScopeConsent = preview.coverage.additionalGoalIds.length > 0 || preview.foundationGoalIds.length > 0
  const needsMoveConsent = preview.laterBlockIds.length > 0
  const needsExternalConsent = preview.externalFoundationGoalIds.length > 0
  const blocked = !preview.validDates || !preview.planEvaluable || preview.coverage.taskGoalIds.length === 0
    || preview.coverage.unknownTaskIds.length > 0 || preview.unavailableGoalIds.length > 0
    || preview.toPlanGoalIds.length === 0 || (needsScopeConsent && acceptedScope !== scopeKey)
    || (needsMoveConsent && acceptedMove !== scopeKey) || milestone.active === false
    || (needsExternalConsent && acceptedExternal !== scopeKey)
  const title = (id: string) => goals.get(id)?.title ?? prerequisiteGoals?.get(id)?.title
    ?? prerequisiteGoals?.get(id.slice(id.indexOf(':') + 1))?.title ?? id
  const lists = [
    { ids: preview.masteredGoalIds, label: de ? 'Bereits beherrscht' : 'Already mastered' },
    { ids: preview.timelyGoalIds, label: de ? 'Rechtzeitig eingeplant' : 'Scheduled in time' },
    { ids: preview.toPlanGoalIds, label: de ? 'Ergänzen oder vorziehen' : 'Add or bring forward' },
    { ids: preview.foundationGoalIds, label: de ? 'Zusätzlich benötigte Grundlagen' : 'Additional foundations needed' },
    { ids: preview.coverage.additionalGoalIds, label: de ? 'Zusätzliche Themen der Aufgaben' : 'Additional assessment topics' },
    { ids: preview.externalFoundationGoalIds, label: de ? 'Voraussetzungen außerhalb dieses Kursplans' : 'Prerequisites outside this course plan' },
    { ids: [...new Set([...preview.unavailableGoalIds, ...preview.coverage.unknownTaskIds])], label: de ? 'Noch zu klären' : 'Needs clarification' },
  ]
  return <section data-testid="course-plan-preparation-preview" aria-label={de ? 'Vorbereitung vervollständigen' : 'Complete preparation'} className="rounded-2xl border-2 border-sky-300 bg-sky-50/50 p-4 sm:p-6 dark:border-sky-800 dark:bg-sky-950/20">
    <h3 className="text-lg font-semibold text-text-primary">{de ? 'Vorbereitung vervollständigen' : 'Complete preparation'}: <InlineMathText text={milestone.title} /></h3>
    <p className="mt-2 text-sm text-text-secondary">{de ? 'Die Vorschau ergänzt die gewählten Themen und Aufgabenpakete. Grundlagen bleiben gesondert erkennbar; der Klausurstoff wird dadurch nicht geändert.' : 'Preview preparation for the selected topics and assessment packages. Foundations are shown separately; the exam topic selection stays unchanged.'}</p>
    {!plan.planningBaseline && <p className="mt-2 text-sm text-text-secondary">{de ? 'Ohne persönlichen Lernstand werden alle benötigten Ziele als offen eingeplant.' : 'Without personal progress, all required goals are planned as open.'}</p>}
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-text-primary">{de ? 'Vorbereitung ab' : 'Preparation from'}<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2" /></label>
      <label className="text-sm font-medium text-text-primary">{de ? 'Vorbereitung bis' : 'Preparation until'}<input type="date" value={endDate} max={defaultCoursePlanPreparationEnd(milestone)} onChange={(event) => setEndDate(event.target.value)} className="mt-2 block min-h-11 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2" /></label>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{lists.map(({ ids, label }) => <details key={label} open={ids.length > 0} className="rounded-xl border border-border-color bg-sidebar-bg p-3 text-sm"><summary className="cursor-pointer font-medium text-text-primary">{ids.length} {label}</summary>{ids.length > 0 && <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5 text-text-secondary">{ids.map((id) => <li key={id}><InlineMathText text={title(id)} /></li>)}</ul>}</details>)}</div>
    {preview.coverage.uncoveredGoalIds.length > 0 && <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">{de ? 'Nicht alle gewählten Themen haben eine zugeordnete Aufgabe. Sie werden trotzdem zum Lernen eingeplant; eine vollständige Aufgabenabdeckung wird damit nicht zugesagt.' : 'Some selected topics have no mapped assessment. They are included for learning; this does not establish full assessment coverage.'}</p>}
    {needsScopeConsent && <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-2 text-sm text-text-primary"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sky-600" checked={acceptedScope === scopeKey} onChange={(event) => setAcceptedScope(event.target.checked ? scopeKey : '')} />{de ? 'Zusätzliche Themen und Grundlagen übernehmen' : 'Include additional topics and foundations'}</label>}
    {needsExternalConsent && <div className="mt-3 rounded-xl border border-amber-300 p-3 text-sm text-text-primary"><p>{de ? 'Diese Voraussetzungen werden in diesem Kursplan nicht eingeplant. Die Übernahme ergänzt nur die Vorbereitung innerhalb des Kurses und bestätigt keine vollständige Vorbereitung außerhalb davon. Beim Lernen müssen die erforderlichen Grundlagen weiterhin beherrscht sein.' : 'These prerequisites are not scheduled in this course plan. Applying adds preparation within this course only; it does not confirm complete preparation outside it. Required foundations must still be mastered when learning.'}</p><label className="mt-2 flex min-h-11 cursor-pointer items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sky-600" checked={acceptedExternal === scopeKey} onChange={(event) => setAcceptedExternal(event.target.checked ? scopeKey : '')} />{de ? 'Voraussetzungen außerhalb dieses Kursplans separat prüfen' : 'Check prerequisites outside this course plan separately'}</label></div>}
    {needsMoveConsent && <div className="mt-3 rounded-xl border border-amber-300 p-3 text-sm text-text-primary"><p>{de ? 'Diese Abschnitte planen benötigte Lernziele erst später ein:' : 'These sections schedule required goals too late:'}</p><ul className="mt-2 list-disc pl-5">{preview.laterBlockIds.map((id) => <li key={id}><InlineMathText text={plan.blocks.find((block) => block.id === id)?.title || id} /></li>)}</ul><label className="mt-2 flex min-h-11 cursor-pointer items-start gap-2"><input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-sky-600" checked={acceptedMove === scopeKey} onChange={(event) => setAcceptedMove(event.target.checked ? scopeKey : '')} />{de ? 'Diese Lernziele vorziehen und die betroffenen Abschnitte anpassen. Leere Abschnitte werden inaktiv.' : 'Bring these goals forward and update the affected sections. Empty sections become inactive.'}</label></div>}
    {!preview.validDates && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{de ? 'Wähle einen Zeitraum mit mindestens einem Werktag vor dem Klausurtermin.' : 'Choose a period with at least one weekday before the exam.'}</p>}
    {(preview.unavailableGoalIds.length > 0 || preview.coverage.unknownTaskIds.length > 0) && <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-300">{de ? 'Einige Zuordnungen oder Voraussetzungen sind im aktuellen Kurs nicht geklärt. Prüfe die Aufgabenpakete und die Themenauswahl vor der Übernahme.' : 'Some mappings or prerequisites are unresolved in this course. Review the packages and topic selection before applying.'}</p>}
    {preview.coverage.taskGoalIds.length === 0 && <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-300">{de ? 'Wähle zuerst mindestens ein Aufgabenpaket im Klausurstoff aus.' : 'First select at least one assessment package in the exam topics.'}</p>}
    {preview.toPlanGoalIds.length === 0 && preview.coverage.taskGoalIds.length > 0 && preview.unavailableGoalIds.length === 0 && preview.coverage.unknownTaskIds.length === 0 && <p className="mt-3 text-sm text-text-secondary">{needsExternalConsent
      ? de ? 'Alle benötigten Ziele innerhalb dieses Kurses sind bereits beherrscht oder rechtzeitig eingeplant. Die Voraussetzungen außerhalb dieses Kursplans bleiben separat zu prüfen.' : 'All required goals within this course are mastered or scheduled in time. Prerequisites outside this course plan still need to be checked separately.'
      : de ? 'Alle benötigten Ziele sind bereits beherrscht oder rechtzeitig eingeplant.' : 'All required goals are mastered or scheduled in time.'}</p>}
    {error && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={onClose} className="min-h-11 rounded-lg border border-border-color px-4 py-2 text-sm text-text-primary">{de ? 'Schließen' : 'Close'}</button><button type="button" disabled={blocked} onClick={() => {
      const blocks = buildCoursePlanExamPreparationBlocks({ plan, milestone, preview, goals, visibleChildren, startDate, endDate, blockId: `exam-preparation-${globalThis.crypto.randomUUID()}`, moveLaterGoals: acceptedMove === scopeKey, includeExternalFoundations: acceptedExternal === scopeKey, title: `${de ? 'Vorbereitung' : 'Preparation'}: ${milestone.title}` })
      if (blocks) onApply(blocks)
      else setError(de ? 'Die Vorbereitung kann in diesem Zeitraum nicht vollständig eingeplant werden. Prüfe Puffer und andere Abschnitte.' : 'Preparation cannot be fully scheduled in this period. Review buffers and other sections.')
    }} className="min-h-11 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">{de ? 'Vorbereitung übernehmen' : 'Apply preparation'}</button></div>
  </section>
}
