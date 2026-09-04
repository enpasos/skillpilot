import { useEffect, useMemo, useState } from 'react'
import { RefreshCw } from 'lucide-react'

import type { PreviewLearnerLearningPlansResponse } from '../learnerLearningPlanTypes'
import { previewLearnerLearningPlans } from '../utils/learnerLearningPlanApi'
import { berlinDateKey, formatLearnerLearningPlanDate, millisecondsUntilNextBerlinDateBoundary } from '../utils/learnerLearningPlanReadModel'
import {
  loadTeacherLearningPlanActivation,
  teacherLearningPlanActivationRequest,
  teacherLearningPlanDraftsMatch,
  teacherLearningPlanSubjectsBlocked,
  type TeacherLearningPlanActivationSubject,
  type TeacherLearningPlanContext,
} from '../utils/teacherLearningPlanActivation'

export const TrainerLearningPlanPreviewSummary = ({
  preview,
  subjects,
  language,
  compact = false,
}: {
  preview: PreviewLearnerLearningPlansResponse
  subjects: readonly TeacherLearningPlanActivationSubject[]
  language: 'de' | 'en'
  compact?: boolean
}) => {
  const de = language === 'de'
  const today = preview.days[0]
  const labels = new Map(subjects.map((subject) => [subject.landscapeId, subject.label]))
  const columns = de
    ? ['Heute neu fällig', 'Davon bereits beherrscht', 'Heute noch offen', 'Offen aus früheren Tagen']
    : ['Newly due today', 'Already mastered', 'Still open today', 'Open from earlier days']
  const metrics = (value: typeof today.totals) => [
    value.dueToday, value.completedDueToday, value.openDueToday,
    value.openDueThroughToday - value.openDueToday,
  ]
  return (
    <div data-testid="trainer-learning-plan-preview-summary">
      <p className="text-sm leading-6 text-text-secondary">
        {de
          ? 'So wirkt sich der gespeicherte Entwurf auf den Schüler aus. Die Zahlen kommen aus derselben Berechnung wie im Chat. Es wird noch nichts aktiviert.'
          : 'This is how the saved draft affects the learner. These figures use the same calculation as the chat. Nothing is activated yet.'}
      </p>
      <h3 className="mt-4 font-semibold">{de ? 'Heute' : 'Today'} · {formatLearnerLearningPlanDate(preview.asOf, language)}</h3>
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {metrics(today.totals).map((value, index) => (
          <div key={columns[index]} className="rounded-xl border border-border-color bg-sidebar-bg p-3">
            <p className="text-2xl font-semibold tabular-nums text-text-primary">{value}</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">{columns[index]}</p>
          </div>
        ))}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label={de ? 'Tagesanforderungen nach Fach' : 'Daily workload by subject'}>
        {today.subjects.map((subject) => (
          <li key={subject.landscapeId} className="rounded-xl border border-border-color p-3">
            <h4 className="font-semibold">{labels.get(subject.landscapeId)}</h4>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
              {metrics(subject.metrics).map((value, index) => (
                <div key={columns[index]}>
                  <dt className="text-xs text-text-secondary">{columns[index]}</dt>
                  <dd className="font-semibold tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm font-medium">
        {de
          ? `Bis heute insgesamt noch offen: ${today.totals.openDueThroughToday} Lernziele über alle Fächer.`
          : `Still open through today: ${today.totals.openDueThroughToday} learning goals across all subjects.`}
      </p>
      {!compact && (
        <>
          <h3 className="mt-6 font-semibold">{de ? 'Die nächsten 7 Tage · neu fällige Lernziele' : 'The next 7 days · newly due goals'}</h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border-color" tabIndex={0} role="region" aria-label={de ? 'Wochenvorschau' : 'Week preview'}>
            <table className="w-full text-left text-sm">
              <thead className="bg-sidebar-bg text-text-secondary">
                <tr><th scope="col" className="p-3">{de ? 'Tag' : 'Day'}</th>
                  {today.subjects.map((subject) => <th scope="col" className="p-3" key={subject.landscapeId}>{labels.get(subject.landscapeId)}</th>)}
                  <th scope="col" className="p-3">{de ? 'Gesamt' : 'Total'}</th>
                </tr>
              </thead>
              <tbody>
                {preview.days.map((day) => (
                  <tr key={day.date} className="border-t border-border-color">
                    <th scope="row" className="whitespace-nowrap p-3 font-medium">{formatLearnerLearningPlanDate(day.date, language)}</th>
                    {today.subjects.map(({ landscapeId }) => <td className="p-3 tabular-nums" key={landscapeId}>{day.subjects.find((subject) => subject.landscapeId === landscapeId)!.metrics.dueToday}</td>)}
                    <td className="p-3 font-semibold tabular-nums">{day.totals.dueToday}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="mt-3 text-xs leading-5 text-text-secondary">
        {de
          ? '„Bereits beherrscht“ beschreibt den aktuellen Lernstand, nicht nur heute erreichte Ziele. Die Wochenvorschau zeigt die geplante Fälligkeit; zukünftiger Lernerfolg und Lernminuten werden nicht vorhergesagt. Rückstände werden nicht täglich erneut zur Wochensumme addiert.'
          : '“Already mastered” describes current mastery, not only goals achieved today. The week preview shows scheduled due dates, not predicted future progress or learning minutes. Backlog is not repeatedly added to a weekly total.'}
      </p>
    </div>
  )
}

export interface TrainerLearningPlanPreviewProps extends TeacherLearningPlanContext {
  refreshToken: number
  hasUnsavedActiveDraft: boolean
  onSelectSubject?: (landscapeId: string) => void
}

export const TrainerLearningPlanPreview = ({
  classSession, learnerId, landscapeEntries, runtimeCatalogState, language,
  refreshToken, hasUnsavedActiveDraft, onSelectSubject,
}: TrainerLearningPlanPreviewProps) => {
  const [reloadToken, setReloadToken] = useState(0)
  const [result, setResult] = useState<{
    scope: unknown
    context: TeacherLearningPlanContext
    refreshToken: number
    reloadToken: number
    preview: PreviewLearnerLearningPlansResponse
    subjects: TeacherLearningPlanActivationSubject[]
  } | null>(null)
  const [failure, setFailure] = useState<{ scope: unknown; message: string } | null>(null)
  const context = useMemo(() => ({ classSession, learnerId, landscapeEntries, runtimeCatalogState, language }),
    [classSession, learnerId, landscapeEntries, runtimeCatalogState, language])
  const requestScope = useMemo(() => ({ context, refreshToken, reloadToken, hasUnsavedActiveDraft }),
    [context, refreshToken, reloadToken, hasUnsavedActiveDraft])
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => setReloadToken((value) => value + 1), millisecondsUntilNextBerlinDateBoundary())
    if (!hasUnsavedActiveDraft) {
      const asOf = berlinDateKey()
      void (async () => {
        const snapshot = await loadTeacherLearningPlanActivation(context, asOf, controller.signal)
        if (teacherLearningPlanSubjectsBlocked(snapshot.subjects)) throw new Error('blocked')
        const subjects = snapshot.subjects.filter((subject) => subject.copy !== null)
        if (!subjects.length) throw new Error('empty')
        const preview = await previewLearnerLearningPlans(learnerId,
          teacherLearningPlanActivationRequest(asOf, subjects), { signal: controller.signal })
        if (controller.signal.aborted) return
        if (asOf !== berlinDateKey() || !teacherLearningPlanDraftsMatch(snapshot.subjects)) throw new Error('changed')
        setResult({ scope: requestScope, context, refreshToken, reloadToken, preview, subjects })
      })().catch((cause) => {
        if (controller.signal.aborted) return
        setFailure({ scope: requestScope, message: cause instanceof Error ? cause.message : 'unavailable' })
      })
    }
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [context, hasUnsavedActiveDraft, learnerId, refreshToken, reloadToken, requestScope])
  const current = result?.scope === requestScope && result.context === context && result.refreshToken === refreshToken
    && result.reloadToken === reloadToken && !hasUnsavedActiveDraft && result.preview.asOf === berlinDateKey()
    ? result : null
  const error = failure?.scope === requestScope ? failure.message : ''
  const de = language === 'de'
  return (
    <section className="rounded-2xl border border-border-color bg-white p-4 text-text-primary sm:p-6 dark:bg-slate-950" aria-labelledby="trainer-plan-preview-title" data-testid="trainer-learning-plan-preview">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 id="trainer-plan-preview-title" className="text-xl font-semibold">{de ? 'Das bedeutet die Planung für den Schüler' : 'What the planning means for the learner'}</h2>
          <p className="mt-1 text-sm text-text-secondary">{de ? 'Alle vorbereiteten Fächer · gespeicherter Entwurf' : 'All prepared subjects · saved draft'}</p></div>
        <button type="button" onClick={() => setReloadToken((value) => value + 1)} disabled={hasUnsavedActiveDraft || (!current && !error)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm disabled:opacity-50"><RefreshCw size={16} aria-hidden="true" />{de ? 'Erneut prüfen' : 'Check again'}</button>
      </div>
      {hasUnsavedActiveDraft ? <p className="mt-4 text-sm" role="status">{de ? 'Speichere oder verwirf zuerst die Änderungen im Fachplan. Die Vorschau darf keine ungespeicherten Änderungen übergehen.' : 'Save or discard the subject plan changes first. The preview must not skip unsaved changes.'}</p>
        : error ? <p className="mt-4 text-sm" role="alert">{error === 'empty'
          ? de ? 'Lege zuerst einen Planabschnitt an.' : 'Create a plan section first.'
          : error === 'blocked' ? de ? 'Ein Fachplan muss zuerst geprüft werden. Öffne den Fachplan über die Fächerübersicht.' : 'A subject plan needs checking first. Open it from the subject overview.'
            : error === 'learning-plan-subject-scope-changed' ? de ? 'Beim Schüler gibt es weitere gültige Fachpläne. Aktualisiere die Fächerauswahl, damit die Vorschau alle Fächer umfasst.' : 'The learner has other valid subject plans. Update the subject selection so the preview includes every subject.'
            : de ? 'Die Vorschau konnte nicht zuverlässig berechnet werden. Prüfe die Fachpläne und versuche es erneut. Es wurde nichts verändert.' : 'The preview could not be calculated reliably. Check the subject plans and try again. Nothing was changed.'}</p>
          : current ? <div className="mt-5"><TrainerLearningPlanPreviewSummary preview={current.preview} subjects={current.subjects} language={language} />
            {onSelectSubject && <div className="mt-4 flex flex-wrap gap-2">{current.subjects.map((subject) => <button type="button" key={subject.landscapeId} onClick={() => onSelectSubject(subject.landscapeId)} className="min-h-11 rounded-lg border border-border-color px-3 py-2 text-sm">{subject.label} {de ? 'bearbeiten' : 'edit'}</button>)}</div>}
          </div> : <p className="mt-4 text-sm" role="status">{de ? 'Vorschau wird berechnet …' : 'Calculating preview …'}</p>}
    </section>
  )
}
