import * as React from 'react'
import { RefreshCw } from 'lucide-react'

import type { PreviewLearnerLearningPlansResponse } from '../learnerLearningPlanTypes'
import { previewLearnerLearningPlans } from '../utils/learnerLearningPlanApi'
import { berlinDateKey, formatLearnerLearningPlanDate, formatLearnerLearningPlanPeriod, millisecondsUntilNextBerlinDateBoundary } from '../utils/learnerLearningPlanReadModel'
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
  const periodKey = (day: typeof today) => `${day.status.periodStart}/${day.status.periodEnd}`
  const seenPeriods = new Set([periodKey(today)])
  const upcomingPeriods = preview.days.filter((day) => {
    const key = periodKey(day)
    if (seenPeriods.has(key)) return false
    seenPeriods.add(key)
    return true
  })
  return (
    <div data-testid="trainer-learning-plan-preview-summary">
      <p className="text-sm leading-6 text-text-secondary">
        {de
          ? 'So wirkt sich der gespeicherte Entwurf auf den Lernplanstatus aus. Die Auswertung verwendet dieselbe Berechnung und den gewählten Tages- oder Wochenzeitraum wie das Cockpit. Der Entwurf wird noch nicht aktiviert.'
          : 'This is the learning-plan status for the saved draft, using the same calculation and selected daily or weekly period as the cockpit. The draft is not activated yet.'}
      </p>
      <h3 className="mt-4 font-semibold">{de ? 'Heute' : 'Today'} · {formatLearnerLearningPlanDate(preview.asOf, language)}</h3>
      <p className="mt-3 whitespace-pre-line text-sm leading-7" data-testid="trainer-learning-plan-status">{today.status.statusText}</p>
      {!compact && upcomingPeriods.length > 0 && (
        <>
          <h3 className="mt-6 font-semibold">{de ? 'Ausblick für die nächsten 7 Tage' : 'Outlook for the next 7 days'}</h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-border-color" tabIndex={0} role="region" aria-label={de ? 'Planvorschau' : 'Plan preview'}>
            <table className="w-full text-left text-sm">
              <thead className="bg-sidebar-bg text-text-secondary">
                <tr><th scope="col" className="p-3">{de ? 'Zeitraum' : 'Period'}</th>
                  <th scope="col" className="p-3">{de ? 'Planstatus nach Fach' : 'Plan status by subject'}</th>
                </tr>
              </thead>
              <tbody>
                {upcomingPeriods.map((day) => (
                  <tr key={day.date} className="border-t border-border-color">
                    <th scope="row" className="whitespace-nowrap p-3 font-medium">{day.status.periodBasis === 'WEEK'
                      ? formatLearnerLearningPlanPeriod(day.status.periodStart, day.status.periodEnd, language)
                      : formatLearnerLearningPlanDate(day.date, language)}</th>
                    <td className="whitespace-pre-line p-3 leading-6">{day.status.statusText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="mt-3 text-xs leading-5 text-text-secondary">
        {de
          ? 'Für die kommenden Tage bleibt der aktuelle Lernstand unverändert; künftige Abschlüsse werden nicht angenommen. Lernminuten werden nicht vorhergesagt.'
          : 'For future days, the current learning state is held unchanged; no future completions are assumed. Learning minutes are not predicted.'}
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
  const [reloadToken, setReloadToken] = React.useState(0)
  const [result, setResult] = React.useState<{
    scope: unknown
    context: TeacherLearningPlanContext
    refreshToken: number
    reloadToken: number
    preview: PreviewLearnerLearningPlansResponse
    subjects: TeacherLearningPlanActivationSubject[]
  } | null>(null)
  const [failure, setFailure] = React.useState<{ scope: unknown; message: string } | null>(null)
  const context = React.useMemo(() => ({ classSession, learnerId, landscapeEntries, runtimeCatalogState, language }),
    [classSession, learnerId, landscapeEntries, runtimeCatalogState, language])
  const requestScope = React.useMemo(() => ({ context, refreshToken, reloadToken, hasUnsavedActiveDraft }),
    [context, refreshToken, reloadToken, hasUnsavedActiveDraft])
  React.useEffect(() => {
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
          teacherLearningPlanActivationRequest(asOf, subjects), { signal: controller.signal, language })
        if (controller.signal.aborted) return
        if (asOf !== berlinDateKey() || !teacherLearningPlanDraftsMatch(snapshot.subjects)) throw new Error('changed')
        setResult({ scope: requestScope, context, refreshToken, reloadToken, preview, subjects })
      })().catch((cause) => {
        if (controller.signal.aborted) return
        setFailure({ scope: requestScope, message: cause instanceof Error ? cause.message : 'unavailable' })
      })
    }
    return () => { controller.abort(); window.clearTimeout(timer) }
  }, [context, hasUnsavedActiveDraft, language, learnerId, refreshToken, reloadToken, requestScope])
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
