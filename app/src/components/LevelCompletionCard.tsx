import * as React from 'react'
import { Link } from 'react-router-dom'
import { Check, ClipboardCheck } from 'lucide-react'
import {
  buildCompletionAssessmentStartHref,
  completionLabel,
  completionNotice,
  completionUnavailableReason,
  requiresCompletionExitConfirmation,
  type CompletionActionInput,
  type LevelCompletion,
} from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'

export interface LevelCompletionCardProps {
  completion: LevelCompletion
  language: string
  stale?: boolean
  busy?: boolean
  error?: string | null
  learningPlanPaused?: boolean
  onAction: (action: CompletionActionInput) => void
  onRetry: () => void
  onShowGoal?: (goalId: string) => void
}

/** All counts and choices come from the same backend state as the active goal. */
export const LevelCompletionCard = ({
  completion, language, stale = false, busy = false, error, learningPlanPaused = false, onAction, onRetry, onShowGoal,
}: LevelCompletionCardProps) => {
  const en = language.startsWith('en')
  const headingId = React.useId()
  const [pendingChoice, setPendingChoice] = React.useState<{ action: CompletionActionInput; revision: number } | null>(null)
  const pendingTrigger = React.useRef<HTMLElement | null>(null)
  const pendingCurrent = pendingChoice?.revision === completion.learnerRevision
  React.useEffect(() => {
    if (pendingChoice && !pendingCurrent) pendingTrigger.current?.focus()
  }, [pendingChoice, pendingCurrent])
  const disabled = stale || busy
  const active = Boolean(completion.profileId)
  const valid = completion.calculationStatus === 'valid'
  const choose = (action: CompletionActionInput, trigger: HTMLElement) => {
    if (disabled) return
    if (requiresCompletionExitConfirmation(completion, action)) {
      pendingTrigger.current = trigger
      setPendingChoice({ action, revision: completion.learnerRevision })
    }
    else onAction(action)
  }
  const cancel = () => { setPendingChoice(null); pendingTrigger.current?.focus() }
  const buttonClass = 'min-h-11 rounded-lg border border-sky-400 px-3 py-2 text-sm font-semibold text-text-primary hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-sky-950/40'
  return (
    <section data-testid="level-completion-card" aria-labelledby={headingId} aria-busy={busy}
      className="mb-4 w-full rounded-2xl border border-sky-200 bg-sidebar-bg p-4 shadow-sm dark:border-sky-900/60 sm:p-5">
      <h2 id={headingId} className="flex items-center gap-2 font-semibold text-text-primary">
        <ClipboardCheck size={20} aria-hidden="true" />
        <InlineMathText text={completionLabel(completion.title, language, en ? 'Complete a learning section' : 'Einen Lernabschnitt abschließen')} />
      </h2>
      {stale ? (
        <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'This view is out of date. Reload before choosing your next step.' : 'Diese Ansicht ist veraltet. Lade den aktuellen Stand, bevor du den nächsten Schritt wählst.'}</p>
      ) : null}
      {valid ? (
        <div className="mt-3 space-y-2 text-sm">
          {completion.complete ? <p role="status" className="font-semibold">{en ? 'Learning section completed.' : 'Lernabschnitt abgeschlossen.'}</p> : null}
          <p>{en ? `${completion.masteredTargetCount} of ${completion.targetCount} learning ${completion.targetCount === 1 ? 'goal' : 'goals'} achieved.` : `${completion.masteredTargetCount} von ${completion.targetCount} ${completion.targetCount === 1 ? 'Lernziel' : 'Lernzielen'} geschafft.`}</p>
          <p>{en ? `${completion.masteredAssessmentCount} of ${completion.requiredAssessmentCount} required ${completion.requiredAssessmentCount === 1 ? 'assessment' : 'assessments'} passed.` : `Erforderliche Prüfungen: ${completion.masteredAssessmentCount} von ${completion.requiredAssessmentCount} geschafft.`}</p>
          {completion.waivedTargetCount > 0 ? <p>{en ? `Preparation for ${completion.waivedTargetCount} learning ${completion.waivedTargetCount === 1 ? 'goal' : 'goals'} is no longer required for this section. The individual goals keep their existing result.` : `Für diesen Abschnitt entfällt die Vorbereitung für ${completion.waivedTargetCount} ${completion.waivedTargetCount === 1 ? 'Lernziel' : 'Lernziele'}. Die einzelnen Lernziele behalten ihren bisherigen Stand.`}</p> : null}
          {completion.waiverDetails?.length ? <details className="rounded-lg border border-border-color p-3">
            <summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{en ? 'Why is this preparation no longer required?' : 'Warum entfällt diese Vorbereitung?'}</summary>
            <ul className="mt-3 space-y-3">
              {completion.waiverDetails.map((detail) => <li key={detail.goalId}>
                <p><InlineMathText text={completionLabel(detail.title, language)} className="font-medium" /></p>
                {onShowGoal ? <button type="button" disabled={stale} onClick={() => onShowGoal(detail.goalId)}
                  aria-label={`${en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}: ${completionLabel(detail.title, language)}`}
                  className="min-h-9 rounded text-left underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50">
                  {en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}
                </button> : null}
                <p>{en ? 'Passed assessments: ' : 'Geschaffte Prüfungen: '}
                  {detail.assessments.map((assessment, index) => <React.Fragment key={assessment.goalId}>
                    {index > 0 ? '; ' : ''}<InlineMathText text={completionLabel(assessment.title, language)} />
                  </React.Fragment>)}
                  {detail.assessmentCount > detail.assessments.length ? (en
                    ? `; and ${detail.assessmentCount - detail.assessments.length} more`
                    : `; und ${detail.assessmentCount - detail.assessments.length} weitere`) : null}.
                </p>
                <p>{en ? 'This preparation is no longer required for this section; the learning goal keeps its existing result.' : 'Diese Vorbereitung entfällt für diesen Abschnitt; das Lernziel behält seinen bisherigen Stand.'}</p>
              </li>)}
            </ul>
            {completion.waivedTargetCount > completion.waiverDetails.length ? <p className="mt-2">{en
              ? `Showing ${completion.waiverDetails.length} of ${completion.waivedTargetCount} preparation goals.`
              : `Angezeigt: ${completion.waiverDetails.length} von ${completion.waivedTargetCount} entfallenden Vorbereitungszielen.`}</p> : null}
          </details> : null}
          {completion.pendingTargetCount > 0 ? <p>{en ? `${completion.pendingTargetCount} learning ${completion.pendingTargetCount === 1 ? 'goal' : 'goals'} still required.` : `${completion.pendingTargetCount} ${completion.pendingTargetCount === 1 ? 'Lernziel' : 'Lernziele'} noch erforderlich.`}</p> : null}
        </div>
      ) : active ? (
        <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'Completion cannot currently be calculated. Your saved progress remains available.' : 'Der Abschluss kann gerade nicht berechnet werden. Dein gespeicherter Lernfortschritt bleibt erhalten.'}</p>
      ) : <p className="mt-3 text-sm text-text-secondary">{en ? 'Choose a section to learn normally or attempt its required assessments directly.' : 'Wähle einen Abschnitt, um regulär zu lernen oder seine erforderlichen Prüfungen direkt zu versuchen.'}</p>}
      {completion.directAssessmentRunning ? <p role="status" className="mt-3 text-sm font-medium">{en ? 'An assessment is running in your learning coach.' : 'Eine Prüfung läuft in deinem Lerncoach.'}</p> : null}
      {completion.navigationIntent === 'paused' ? <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'This learning route is paused. Choose your next step when you want to continue.' : 'Dieser Lernweg ist pausiert. Wähle deinen nächsten Schritt, wenn du fortfahren möchtest.'}</p> : null}
      {learningPlanPaused && active ? <p className="mt-3 text-sm text-text-secondary">{en ? 'Your regular learning plan is paused while you work on completing this section.' : 'Dein regulärer Lernplan ist pausiert, während du am Abschluss dieses Abschnitts arbeitest.'}</p> : null}
      {completion.notice ? <p className="mt-3 text-sm text-text-secondary">{completionNotice(completion.notice, language)}</p> : null}
      {completion.assessments.length > 0 && valid ? (
        <ul className="mt-4 space-y-3" aria-label={en ? 'Required assessments' : 'Erforderliche Prüfungen'}>
          {completion.assessments.map((assessment) => (
            <li key={assessment.goalId} className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border-color p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <InlineMathText text={completionLabel(assessment.title, language)} className="font-medium" />
                <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">{assessment.mastered ? <Check size={16} aria-hidden="true" /> : null}{assessment.mastered ? (en ? 'Achieved' : 'Geschafft') : (en ? 'Not yet achieved' : 'Noch nicht geschafft')}</p>
                {onShowGoal ? <button type="button" disabled={stale} onClick={() => onShowGoal(assessment.goalId)}
                  aria-label={`${en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}: ${completionLabel(assessment.title, language)}`}
                  className="min-h-9 rounded text-left text-sm underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50">
                  {en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}
                </button> : null}
                {!assessment.mastered && !assessment.startAvailable && assessment.unavailableReason ? <p className="mt-1 text-sm text-text-secondary">{completionUnavailableReason(assessment.unavailableReason, language)}</p> : null}
              </div>
              {!assessment.mastered && assessment.startAvailable && completion.profileId && !completion.directAssessmentRunning ? (
                disabled ? <span aria-disabled="true" className={`${buttonClass} opacity-50`}>{en ? 'Try assessment directly' : 'Prüfung direkt versuchen'}</span> :
                  <Link className={buttonClass} to={buildCompletionAssessmentStartHref({ profileId: completion.profileId, goalId: assessment.goalId, expectedRevision: completion.learnerRevision })}>{en ? 'Try assessment directly' : 'Prüfung direkt versuchen'}</Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {completion.profileOptions.length > 0 && !active ? <div className="mt-4 flex flex-wrap gap-2">
        {completion.profileOptions.map((option) => <div key={option.profileId} className="space-y-2">
          {option.targetCount !== undefined && option.requiredAssessmentCount !== undefined ? <p className="text-sm text-text-secondary">{en
            ? `${option.targetCount} learning ${option.targetCount === 1 ? 'goal' : 'goals'}, including ${option.requiredAssessmentCount} required ${option.requiredAssessmentCount === 1 ? 'assessment' : 'assessments'}.`
            : `${option.targetCount} ${option.targetCount === 1 ? 'Lernziel' : 'Lernziele'}, davon ${option.requiredAssessmentCount} erforderliche ${option.requiredAssessmentCount === 1 ? 'Prüfung' : 'Prüfungen'}.`}</p> : null}
          <button type="button" disabled={disabled} className={buttonClass}
            onClick={(event) => choose({ action: 'selectProfile', profileId: option.profileId }, event.currentTarget)}>{completionLabel(option.title, language)}</button>
        </div>)}
      </div> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {completion.actions.map((action, index) => <button key={`${action.action}:${action.goalId ?? index}`} type="button" disabled={disabled}
          className={buttonClass} onClick={(event) => choose({ action: action.action, goalId: action.goalId, intent: action.intent }, event.currentTarget)}>{completionLabel(action.title, language)}</button>)}
        {stale || completion.calculationStatus === 'unavailable' || completion.calculationStatus === 'invalid' ? <button type="button" disabled={busy} className={buttonClass} onClick={onRetry}>{en ? 'Reload' : 'Neu laden'}</button> : null}
      </div>
      {pendingChoice && pendingCurrent ? <div role="group" aria-label={en ? 'End current assessment' : 'Laufende Prüfung beenden'} className="mt-4 rounded-xl border border-amber-400 p-3 text-sm">
        <p>{en ? 'End the current assessment and switch to the selected route? Your saved progress is retained.' : 'Die laufende Prüfung beenden und zum gewählten Lernweg wechseln? Dein gespeicherter Lernfortschritt bleibt erhalten.'}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {pendingChoice.action.action === 'retryAssessment' && completion.profileId && pendingChoice.action.goalId ? (
            disabled ? <span aria-disabled="true" className={`${buttonClass} opacity-50`}>{en ? 'Try assessment again' : 'Prüfung erneut versuchen'}</span> :
              <Link className={buttonClass} to={buildCompletionAssessmentStartHref({ profileId: completion.profileId,
                goalId: pendingChoice.action.goalId, expectedRevision: pendingChoice.revision, restartCurrent: true })}>{en ? 'Try assessment again' : 'Prüfung erneut versuchen'}</Link>
          ) : <button type="button" disabled={disabled} className={buttonClass} onClick={() => { const choice = pendingChoice.action; setPendingChoice(null); onAction(choice) }}>{en ? 'End assessment and switch' : 'Prüfung beenden und wechseln'}</button>}
          <button type="button" className={buttonClass} onClick={cancel}>{en ? 'Continue assessment' : 'Prüfung fortsetzen'}</button>
        </div>
      </div> : pendingChoice ? <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'The learning state has changed. Please choose your next step again.' : 'Der Lernstand hat sich geändert. Bitte wähle deinen nächsten Schritt erneut.'}</p> : null}
      {error ? <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-200">{error}</p> : null}
    </section>
  )
}
