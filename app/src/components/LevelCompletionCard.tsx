import * as React from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck } from 'lucide-react'
import {
  buildCompletionAssessmentStartHref,
  completionLabel,
  completionNotice,
  completionPlanningCredits,
  isAutomaticCompletion,
  hasActiveCompletionRoute,
  requiresCompletionExitConfirmation,
  type CompletionActionInput,
  type LevelCompletion,
} from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'
import { CompletionAssessmentList } from './CompletionAssessmentList'
import { UnitAssessmentSummary } from './UnitAssessmentSummary'
import { UnitAssessmentEntry } from './UnitAssessmentEntry'

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
  titleForGoal?: (goalId: string) => string | undefined
  /** Read-only handoff from a coach; opening this disclosure never selects a route. */
  discoveryOpenRequest?: string
  onOpenSettings?: () => void
  requestedAssessmentMissing?: boolean
}

function assessmentStatus(completion: LevelCompletion, en: boolean) {
  const { requiredAssessmentCount: total, masteredAssessmentCount: passed } = completion
  if (isAutomaticCompletion(completion)) {
    if (completion.assessments.some(entry => entry.voluntary)) {
      return en ? `${passed} of ${total} required ${total === 1 ? 'assessment' : 'assessments'} passed.` : `Erforderliche Prüfungen: ${passed} von ${total} bestanden.`
    }
    if (total === 0) return en ? 'There are no assessments in this section.' : 'In diesem Abschnitt gibt es keine Prüfungen.'
    return en
      ? `${passed} of ${total} ${total === 1 ? 'assessment' : 'assessments'} in this section passed.`
      : `${passed} von ${total} ${total === 1 ? 'Prüfung' : 'Prüfungen'} in diesem Abschnitt bestanden.`
  }
  return en
    ? `${passed} of ${total} required ${total === 1 ? 'assessment' : 'assessments'} passed.`
    : `Erforderliche Prüfungen: ${passed} von ${total} geschafft.`
}

/** All counts and choices come from the same backend state as the active goal. */
export const LevelCompletionCard = ({
  completion, language, stale = false, busy = false, error, learningPlanPaused = false, onAction, onRetry, onShowGoal,
  discoveryOpenRequest, onOpenSettings, requestedAssessmentMissing = false, titleForGoal,
}: LevelCompletionCardProps) => {
  const en = language.startsWith('en')
  const headingId = React.useId()
  const [pendingChoice, setPendingChoice] = React.useState<{ action: CompletionActionInput; revision: number } | null>(null)
  const [discoveryOpen, setDiscoveryOpen] = React.useState(Boolean(discoveryOpenRequest || completion.notice))
  const [scopeQuery, setScopeQuery] = React.useState('')
  const [scopePage, setScopePage] = React.useState(0)
  React.useEffect(() => {
    if (discoveryOpenRequest) setDiscoveryOpen(true)
  }, [discoveryOpenRequest])
  const pendingTrigger = React.useRef<HTMLElement | null>(null)
  const pendingCurrent = pendingChoice?.revision === completion.learnerRevision
  React.useEffect(() => {
    if (pendingChoice && !pendingCurrent) pendingTrigger.current?.focus()
  }, [pendingChoice, pendingCurrent])
  const disabled = stale || busy
  const discoveryDisabled = disabled || completion.calculationStatus === 'invalid' || completion.calculationStatus === 'unavailable'
  const automatic = isAutomaticCompletion(completion)
  const active = hasActiveCompletionRoute(completion)
  const automaticOverview = automatic && !active
  const valid = completion.calculationStatus === 'valid'
  const unit = valid ? completion.unitAssessment : undefined
  const sectionStatus = valid && !stale && completion.complete ? <p role="status" className="font-semibold">
    {active && automatic ? (en ? 'Learning route completed.' : 'Lernweg abgeschlossen.')
      : (en ? 'Learning section completed.' : 'Lernabschnitt abgeschlossen.')}
  </p> : null
  const planningCredits = completionPlanningCredits(completion)
  const remainingWaivers = completion.waivedTargetCount - planningCredits.size
  const creditExplanation = planningCredits.size > 0 ? <p>{en
    ? `Passed assessments cover ${planningCredits.size} learning ${planningCredits.size === 1 ? 'goal' : 'goals'} for your plan. You can still practise each goal individually.`
    : `Bestandene Prüfungen decken ${planningCredits.size} ${planningCredits.size === 1 ? 'Lernziel' : 'Lernziele'} für deinen Lernplan ab. Du kannst jedes Ziel auch einzeln bearbeiten.`}</p> : null
  const unitSummary = unit && <UnitAssessmentSummary assessment={unit} completion={completion} language={language}
    titleForGoal={titleForGoal} onShowGoal={onShowGoal} allowStart={!disabled} />
  const otherAssessments = unit ? completion.assessments.filter(entry => !unit.parts.some(part => part.goalId === entry.goalId)) : completion.assessments
  const filteredScopes = completion.profileOptions.filter(option => completionLabel(option.title, language)
    .toLocaleLowerCase(en ? 'en' : 'de').includes(scopeQuery.trim().toLocaleLowerCase(en ? 'en' : 'de')))
  const scopeLastPage = Math.max(0, Math.ceil(filteredScopes.length / 6) - 1)
  const currentScopePage = Math.min(scopePage, scopeLastPage)
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
  const supplementalLabel = otherAssessments.every(entry => entry.voluntary)
    ? (en ? 'Optional assessments' : 'Freiwillige Zusatzprüfungen')
    : (en ? 'Other assessments in this section' : 'Weitere Prüfungen im Abschnitt')
  const assessmentList = valid && completion.profileId && otherAssessments.length > 0 ? <CompletionAssessmentList
    key={completion.profileId} assessments={otherAssessments} profileId={completion.profileId} revision={completion.learnerRevision}
    language={language} disabled={active ? disabled : discoveryDisabled} stale={stale} running={completion.directAssessmentRunning}
    label={unit ? supplementalLabel : !active ? (en ? 'Assessments in your Personal Curriculum' : 'Prüfungen im Persönlichen Lehrplan')
      : automatic ? (en ? 'Assessments in this section' : 'Prüfungen in diesem Abschnitt') : (en ? 'Required assessments' : 'Erforderliche Prüfungen')}
    onShowGoal={onShowGoal}
  /> : null
  const assessmentChoices = unit && assessmentList ? <details className="mt-3 text-sm text-text-secondary">
    <summary className="cursor-pointer rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{supplementalLabel}</summary>
    {assessmentList}
  </details> : assessmentList
  const pendingConfirmation = pendingChoice && pendingCurrent ? <div role="group" aria-label={en ? 'End current assessment' : 'Laufende Prüfung beenden'} className="mt-4 rounded-xl border border-amber-400 p-3 text-sm">
    <p>{en ? 'End the current assessment and switch to the selected route? Your saved progress is retained.' : 'Die laufende Prüfung beenden und zum gewählten Lernweg wechseln? Dein gespeicherter Lernfortschritt bleibt erhalten.'}</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {pendingChoice.action.action === 'retryAssessment' && completion.profileId && pendingChoice.action.goalId ? (
        disabled ? <span aria-disabled="true" className={`${buttonClass} opacity-50`}>{en ? 'Try assessment again' : 'Prüfung erneut versuchen'}</span> :
          <Link className={buttonClass} to={buildCompletionAssessmentStartHref({ profileId: completion.profileId,
            goalId: pendingChoice.action.goalId, expectedRevision: pendingChoice.revision, restartCurrent: true })}>{en ? 'Try assessment again' : 'Prüfung erneut versuchen'}</Link>
      ) : <button type="button" disabled={disabled} className={buttonClass} onClick={() => { const choice = pendingChoice.action; setPendingChoice(null); onAction(choice) }}>{en ? 'End assessment and switch' : 'Prüfung beenden und wechseln'}</button>}
      <button type="button" className={buttonClass} onClick={cancel}>{en ? 'Continue assessment' : 'Prüfung fortsetzen'}</button>
    </div>
  </div> : pendingChoice ? <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'The learning state has changed. Please choose your next step again.' : 'Der Lernstand hat sich geändert. Bitte wähle deinen nächsten Schritt erneut.'}</p> : null
  if (unit) return <div data-testid="level-completion-card" className="contents">
    <UnitAssessmentEntry key={unit.sectionGoalId} assessment={unit} completion={completion} language={language}
      stale={stale} busy={busy} error={error} onRetry={onRetry} openRequest={discoveryOpenRequest}
      sectionStatus={sectionStatus} onShowGoal={onShowGoal} controls={completion.directAssessmentRunning ? <>
        <div className="mt-4 flex flex-wrap gap-2">{completion.actions.filter(action => ['retryAssessment', 'endAssessment', 'leaveProfile'].includes(action.action))
          .map((action, index) => <button key={`${action.action}:${action.goalId ?? index}`} type="button" disabled={disabled}
            className={buttonClass} onClick={event => choose({ action: action.action, goalId: action.goalId, intent: action.intent }, event.currentTarget)}>
            {completionLabel(action.title, language)}</button>)}</div>{pendingConfirmation}
      </> : null} />
  </div>
  if (!active) return (
    <section data-testid="level-completion-card" aria-busy={busy}
      className="mb-4 w-full rounded-2xl border border-border-color bg-sidebar-bg p-4 sm:p-5">
      <details data-testid="completion-shortcut-discovery" open={discoveryOpen}
        onToggle={event => setDiscoveryOpen(event.currentTarget.open)}>
        <summary data-completion-shortcuts-heading className="cursor-pointer rounded font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          {en ? 'Assessments' : 'Prüfungen'}
        </summary>
        <p className="mt-3 text-sm text-text-secondary">{en
          ? 'Already familiar with a topic? Try its assessment directly. Passing can remove preparation for that section; other goals keep their saved result.'
          : 'Du kennst ein Thema bereits? Versuche seine Prüfung direkt. Nach dem Bestehen kann Vorbereitung für den Abschnitt entfallen; andere Lernziele behalten ihren gespeicherten Stand.'}</p>
        {automaticOverview && valid && (!unit || sectionStatus) ? <div data-testid="completion-default-overview" className="mt-3 space-y-1 text-sm text-text-secondary">
          <p className="font-medium text-text-primary"><InlineMathText text={completionLabel(completion.title, language)} /></p>
          {sectionStatus}
          {!unit && <><p>{en
            ? `${completion.masteredTargetCount} directly demonstrated, ${planningCredits.size} credited through assessment, ${remainingWaivers} no longer required for this section, ${completion.pendingTargetCount} still required.`
            : `${completion.masteredTargetCount} direkt nachgewiesen, ${planningCredits.size} fachlich angerechnet, ${remainingWaivers} für diesen Abschnitt nicht mehr erforderlich, ${completion.pendingTargetCount} noch erforderlich.`}</p>
          {creditExplanation}</>}
        </div> : null}
        {unitSummary}
        {stale ? <p role="status" className="mt-3 text-sm text-text-secondary">{en
          ? 'This view is out of date. Reload before choosing your next step.'
          : 'Diese Ansicht ist veraltet. Lade den aktuellen Stand, bevor du den nächsten Schritt wählst.'}</p> : null}
        {completion.notice ? <p className="mt-3 text-sm text-text-secondary">{completionNotice(completion.notice, language)}</p> : null}
        {requestedAssessmentMissing ? <p role="status" className="mt-3 text-sm text-text-secondary">{en
          ? 'The requested assessment is currently unavailable here. You can review your Personal Curriculum in the settings.'
          : 'Die angefragte Prüfung ist hier aktuell nicht verfügbar. Du kannst deinen Persönlichen Lehrplan in den Einstellungen prüfen.'}</p> : null}
        {automaticOverview && assessmentChoices}
        {automaticOverview && completion.profileOptions.length > 0 ? <h3 className="mt-5 font-semibold text-text-primary">
          {en ? 'Choose a learning section' : 'Lernabschnitt auswählen'}
        </h3> : null}
        {completion.profileOptions.length > 6 || scopeQuery ? <label className="mt-3 block text-sm font-medium text-text-primary">
          {en ? 'Find a learning section' : 'Lernabschnitt suchen'}
          <input type="search" value={scopeQuery} onChange={event => { setScopeQuery(event.target.value); setScopePage(0) }}
            className="mt-1 block min-h-11 w-full rounded-lg border border-border-color bg-input-bg px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" />
        </label> : null}
        <ul className="mt-4 space-y-4">
          {filteredScopes.slice(currentScopePage * 6, currentScopePage * 6 + 6).map(option => <li key={option.profileId} className="space-y-3">
            <h3 className="font-semibold text-text-primary"><InlineMathText text={completionLabel(option.title, language)} /></h3>
            {option.targetCount !== undefined && option.requiredAssessmentCount !== undefined ? <p className="text-sm text-text-secondary">{en
              ? `${option.targetCount} learning ${option.targetCount === 1 ? 'goal' : 'goals'}${isAutomaticCompletion(option) && !option.assessments?.some(entry => entry.voluntary) ? ` with ${option.requiredAssessmentCount}` : `, including ${option.requiredAssessmentCount} required`} ${option.requiredAssessmentCount === 1 ? 'assessment' : 'assessments'}.`
              : `${option.targetCount} ${option.targetCount === 1 ? 'Lernziel' : 'Lernziele'}${isAutomaticCompletion(option) && !option.assessments?.some(entry => entry.voluntary) ? ` mit ${option.requiredAssessmentCount}` : `, davon ${option.requiredAssessmentCount} erforderliche`} ${option.requiredAssessmentCount === 1 ? 'Prüfung' : 'Prüfungen'}.`}</p> : null}
            {!automaticOverview && option.assessments?.length ? <CompletionAssessmentList
              assessments={option.assessments} profileId={option.profileId} revision={completion.learnerRevision}
              language={language} disabled={discoveryDisabled} stale={stale} running={completion.directAssessmentRunning}
              label={`${en ? 'Assessments in' : 'Prüfungen in'} ${completionLabel(option.title, language)}`}
              onShowGoal={onShowGoal}
            /> : null}
            <button type="button" disabled={discoveryDisabled} className={buttonClass}
              aria-label={`${en ? 'Choose section as learning route' : 'Abschnitt als Lernweg wählen'}: ${completionLabel(option.title, language)}`}
              onClick={event => choose({ action: 'selectProfile', profileId: option.profileId }, event.currentTarget)}>
              {en ? 'Choose section as learning route' : 'Abschnitt als Lernweg wählen'}
            </button>
          </li>)}
        </ul>
        {filteredScopes.length === 0 && completion.profileOptions.length > 0 ? <p role="status" className="mt-3 text-sm text-text-secondary">
          {en ? 'No learning sections match your search.' : 'Kein Lernabschnitt passt zu deiner Suche.'}
        </p> : null}
        {filteredScopes.length > 6 ? <nav aria-label={en ? 'Learning section pages' : 'Lernabschnittsseiten'} className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className={buttonClass} disabled={currentScopePage === 0} onClick={() => setScopePage(currentScopePage - 1)}>{en ? 'Previous' : 'Zurück'}</button>
          <span className="text-sm">{en ? `Page ${currentScopePage + 1} of ${scopeLastPage + 1}` : `Seite ${currentScopePage + 1} von ${scopeLastPage + 1}`}</span>
          <button type="button" className={buttonClass} disabled={currentScopePage === scopeLastPage} onClick={() => setScopePage(currentScopePage + 1)}>{en ? 'Next' : 'Weiter'}</button>
        </nav> : null}
        {completion.profileOptions.length === 0 && (!automaticOverview || completion.assessments.length === 0) ? <p role="status" className="mt-3 text-sm text-text-secondary">{en
          ? 'No matching assessment is currently available.' : 'Aktuell ist keine passende Prüfung verfügbar.'}</p> : null}
        {(completion.profileOptions.length === 0 || requestedAssessmentMissing) && onOpenSettings
          ? <button type="button" className={`mt-3 ${buttonClass}`} onClick={onOpenSettings}>{en ? 'Open learning settings' : 'Lerneinstellungen öffnen'}</button> : null}
        {stale || completion.calculationStatus === 'unavailable' || completion.calculationStatus === 'invalid'
          ? <button type="button" disabled={busy} className={`mt-3 ${buttonClass}`} onClick={onRetry}>{en ? 'Reload' : 'Neu laden'}</button> : null}
        {error ? <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-200">{error}</p> : null}
      </details>
    </section>
  )
  return (
    <section data-testid="level-completion-card" aria-labelledby={headingId} aria-busy={busy}
      className="mb-4 w-full rounded-2xl border border-sky-200 bg-sidebar-bg p-4 shadow-sm dark:border-sky-900/60 sm:p-5">
      <h2 id={headingId} data-completion-shortcuts-heading tabIndex={-1} className="flex items-center gap-2 font-semibold text-text-primary focus:outline-none">
        <ClipboardCheck size={20} aria-hidden="true" />
        <InlineMathText text={completionLabel(completion.title, language, en ? 'Complete a learning section' : 'Einen Lernabschnitt abschließen')} />
      </h2>
      {requestedAssessmentMissing ? <p role="status" className="mt-3 text-sm text-text-secondary">{en
        ? 'The requested assessment is currently unavailable in this learning route. You can review your Personal Curriculum in the settings.'
        : 'Die angefragte Prüfung ist in diesem Lernweg aktuell nicht verfügbar. Du kannst deinen Persönlichen Lehrplan in den Einstellungen prüfen.'}</p> : null}
      {requestedAssessmentMissing && onOpenSettings ? <button type="button" className={`mt-3 ${buttonClass}`} onClick={onOpenSettings}>
        {en ? 'Open learning settings' : 'Lerneinstellungen öffnen'}
      </button> : null}
      {stale ? (
        <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'This view is out of date. Reload before choosing your next step.' : 'Diese Ansicht ist veraltet. Lade den aktuellen Stand, bevor du den nächsten Schritt wählst.'}</p>
      ) : null}
      {sectionStatus}
      {unitSummary || (valid ? (
        <div className="mt-3 space-y-2 text-sm">
          <p>{en ? `${completion.masteredTargetCount} of ${completion.targetCount} learning ${completion.targetCount === 1 ? 'goal' : 'goals'} achieved${automatic ? ' directly' : ''}.` : `${completion.masteredTargetCount} von ${completion.targetCount} ${completion.targetCount === 1 ? 'Lernziel' : 'Lernzielen'} ${automatic ? 'direkt ' : ''}geschafft.`}</p>
          <p role="status">{assessmentStatus(completion, en)}</p>
          {creditExplanation}
          {remainingWaivers > 0 ? <p>{en
            ? `For this section, ${remainingWaivers} learning ${remainingWaivers === 1 ? 'goal is' : 'goals are'} no longer required.`
            : `Für diesen Abschnitt ${remainingWaivers === 1 ? 'ist' : 'sind'} ${remainingWaivers} ${remainingWaivers === 1 ? 'Lernziel' : 'Lernziele'} nicht mehr erforderlich.`}</p> : null}
          {completion.waiverDetails?.length ? <details className="rounded-lg border border-border-color p-3">
            <summary className="cursor-pointer font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{en ? 'Which assessments count and which preparation is no longer required?' : 'Welche Nachweise zählen und welche Vorbereitung entfällt?'}</summary>
            <ul className="mt-3 space-y-3">
              {completion.waiverDetails.map((detail) => <li key={detail.goalId}>
                <p><InlineMathText text={completionLabel(detail.title, language)} className="font-medium" /></p>
                {onShowGoal ? <button type="button" disabled={stale} onClick={() => onShowGoal(detail.goalId)}
                  aria-label={`${en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}: ${completionLabel(detail.title, language)}`}
                  className="min-h-9 rounded text-left underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50">
                  {en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}
                </button> : null}
                {(!automatic || planningCredits.has(detail.goalId)) && detail.ruleId !== 'no_remaining_demand' && detail.assessments.length > 0 ? <p>{en ? 'Passed assessments: ' : 'Geschaffte Prüfungen: '}
                  {detail.assessments.map((assessment, index) => <React.Fragment key={assessment.goalId}>
                    {index > 0 ? '; ' : ''}<InlineMathText text={completionLabel(assessment.title, language)} />
                  </React.Fragment>)}
                  {detail.assessmentCount > detail.assessments.length ? (en
                    ? `; and ${detail.assessmentCount - detail.assessments.length} more`
                    : `; und ${detail.assessmentCount - detail.assessments.length} weitere`) : null}.
                </p> : null}
                <p>{planningCredits.has(detail.goalId) ? (en ? 'Your plan can use this goal as a prerequisite.' : 'Dein Lernplan kann dieses Ziel als Voraussetzung nutzen.')
                  : automatic || detail.ruleId === 'no_remaining_demand'
                  ? (en ? 'This goal is no longer required for this section. You can still earn individual evidence for it.'
                    : 'Für diesen Abschnitt ist dieses Ziel nicht mehr erforderlich. Du kannst es weiterhin einzeln nachweisen.')
                  : (en ? 'This preparation is no longer required for this section; the learning goal keeps its existing result.' : 'Diese Vorbereitung entfällt für diesen Abschnitt; das Lernziel behält seinen bisherigen Stand.')}</p>
              </li>)}
            </ul>
            {completion.waivedTargetCount > completion.waiverDetails.length ? <p className="mt-2">{en
              ? `Showing ${completion.waiverDetails.length} of ${completion.waivedTargetCount} goals.`
              : `Angezeigt: ${completion.waiverDetails.length} von ${completion.waivedTargetCount} Lernzielen.`}</p> : null}
          </details> : null}
          {completion.pendingTargetCount > 0 ? <p>{en ? `${completion.pendingTargetCount} learning ${completion.pendingTargetCount === 1 ? 'goal' : 'goals'} still required.` : `${completion.pendingTargetCount} ${completion.pendingTargetCount === 1 ? 'Lernziel' : 'Lernziele'} noch erforderlich.`}</p> : null}
        </div>
      ) : active ? (
        <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'Completion cannot currently be calculated. Your saved progress remains available.' : 'Der Abschluss kann gerade nicht berechnet werden. Dein gespeicherter Lernfortschritt bleibt erhalten.'}</p>
      ) : <p className="mt-3 text-sm text-text-secondary">{en ? 'Choose a section to learn normally or attempt its required assessments directly.' : 'Wähle einen Abschnitt, um regulär zu lernen oder seine erforderlichen Prüfungen direkt zu versuchen.'}</p>)}
      {completion.directAssessmentRunning ? <p role="status" className="mt-3 text-sm font-medium">{en ? 'An assessment is running in your learning coach.' : 'Eine Prüfung läuft in deinem Lerncoach.'}</p> : null}
      {completion.navigationIntent === 'paused' ? <p role="status" className="mt-3 text-sm text-text-secondary">{en ? 'This learning route is paused. Choose your next step when you want to continue.' : 'Dieser Lernweg ist pausiert. Wähle deinen nächsten Schritt, wenn du fortfahren möchtest.'}</p> : null}
      {learningPlanPaused && active ? <p className="mt-3 text-sm text-text-secondary">{en ? 'Your regular learning plan is paused while you work on completing this section.' : 'Dein regulärer Lernplan ist pausiert, während du am Abschluss dieses Abschnitts arbeitest.'}</p> : null}
      {completion.notice ? <p className="mt-3 text-sm text-text-secondary">{completionNotice(completion.notice, language)}</p> : null}
      {assessmentChoices}
      <div className="mt-4 flex flex-wrap gap-2">
        {completion.actions.filter(action => action.action !== 'pauseProfile').map((action, index) => <button key={`${action.action}:${action.goalId ?? index}`} type="button" disabled={disabled}
          className={buttonClass} onClick={(event) => choose({ action: action.action, goalId: action.goalId, intent: action.intent }, event.currentTarget)}>{completionLabel(action.title, language)}</button>)}
        {stale || completion.calculationStatus === 'unavailable' || completion.calculationStatus === 'invalid' ? <button type="button" disabled={busy} className={buttonClass} onClick={onRetry}>{en ? 'Reload' : 'Neu laden'}</button> : null}
      </div>
      {pendingConfirmation}
      {error ? <p role="alert" className="mt-3 text-sm text-amber-800 dark:text-amber-200">{error}</p> : null}
    </section>
  )
}
