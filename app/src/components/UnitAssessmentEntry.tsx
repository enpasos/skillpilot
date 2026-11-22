import * as React from 'react'
import { completionLabel, type CompletionAssessment, type LevelCompletion, type UnitAssessment } from '../utils/levelCompletionApi'
import { CompletionAssessmentList } from './CompletionAssessmentList'
import { UnitAssessmentSummary } from './UnitAssessmentSummary'

/** Opening this optional alternative never selects a route or changes progress. */
export function UnitAssessmentEntry({ assessment, assessmentOffers = [], completion, language, stale, busy, error, onRetry,
  openRequest, controls, sectionStatus, onShowGoal }: {
  assessment?: UnitAssessment
  assessmentOffers?: { profileId: string; assessment: CompletionAssessment }[]
  completion: LevelCompletion
  language: string
  stale: boolean
  busy: boolean
  error?: string | null
  onRetry: () => void
  openRequest?: string
  controls?: React.ReactNode
  sectionStatus?: React.ReactNode
  onShowGoal?: (goalId: string) => void
}) {
  const en = language.startsWith('en')
  const panelId = React.useId()
  const unavailable = completion.calculationStatus === 'invalid' || completion.calculationStatus === 'unavailable'
  const [open, setOpen] = React.useState(Boolean(openRequest || completion.directAssessmentRunning))
  React.useEffect(() => {
    if (openRequest || completion.directAssessmentRunning) setOpen(true)
  }, [openRequest, completion.directAssessmentRunning])
  const sectionProfileId = assessment ? 'automatic:' + assessment.sectionGoalId : undefined
  const profile = sectionProfileId ? (completion.profileId === sectionProfileId
    ? { profileId: sectionProfileId, assessments: completion.assessments }
    : completion.profileOptions.find(option => option.profileId === sectionProfileId)) : undefined
  const otherAssessments = profile?.assessments?.filter(entry => !assessment?.parts.some(part => part.goalId === entry.goalId)) ?? []
  const label = otherAssessments.every(entry => entry.voluntary)
    ? (en ? 'Optional assessments' : 'Freiwillige Zusatzprüfungen')
    : (en ? 'Other assessments in this unit' : 'Weitere Prüfungen in dieser Einheit')
  const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-full border border-sky-500 px-4 py-2 max-[420px]:px-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-sky-300 dark:hover:bg-sky-950/40'
  return <section data-testid="unit-assessment-entry" className="contents text-sm">
    <button type="button" data-testid="unit-assessment-entry-open" aria-expanded={open} aria-controls={panelId}
      className={buttonClass} onClick={() => setOpen(value => !value)}>
      {en ? 'Go directly to assessment' : 'Direkt zur Prüfung'}
    </button>
    {open && <div id={panelId} data-testid="unit-assessment-options" className="mt-3 w-full basis-full rounded-xl border border-border-color bg-sidebar-bg p-3"
      aria-label={completionLabel(completion.title, language)} aria-busy={busy}>
      {sectionStatus}
      {assessment && <UnitAssessmentSummary assessment={assessment} completion={completion} language={language}
        allowStart={!stale && !busy && completion.calculationStatus === 'valid'} expanded showGoalDetails={false} />}
      {!assessment && assessmentOffers.map(offer => <CompletionAssessmentList key={offer.profileId + ':' + offer.assessment.goalId}
        assessments={[offer.assessment]} profileId={offer.profileId} revision={completion.learnerRevision}
        language={language} disabled={stale || busy || unavailable} stale={stale}
        running={completion.directAssessmentRunning} label={en ? 'Assessment' : 'Prüfung'} onShowGoal={onShowGoal} />)}
      {!assessment && assessmentOffers.length === 0 && <p role="status">{en
        ? 'No matching assessment is currently available.' : 'Aktuell ist keine passende Prüfung verfügbar.'}</p>}
      {profile && otherAssessments.length > 0 && <CompletionAssessmentList
        key={assessment?.sectionGoalId + ':' + profile.profileId} assessments={otherAssessments} profileId={profile.profileId}
        revision={completion.learnerRevision} language={language} disabled={stale || busy || unavailable}
        stale={stale} running={completion.directAssessmentRunning} label={label} onShowGoal={onShowGoal} />}
      {completion.directAssessmentRunning && <p role="status" className="mt-3 font-medium">{en
        ? 'An assessment is running in your learning coach.' : 'Eine Prüfung läuft in deinem Lerncoach.'}</p>}
      {stale && <p role="status" className="mt-3 text-text-secondary">{en
        ? 'This view is out of date. Reload before choosing your next step.'
        : 'Diese Ansicht ist veraltet. Lade den aktuellen Stand, bevor du den nächsten Schritt wählst.'}</p>}
      {(stale || completion.calculationStatus === 'invalid' || completion.calculationStatus === 'unavailable')
        && <button type="button" disabled={busy} className={`mt-3 ${buttonClass}`} onClick={onRetry}>{en ? 'Reload' : 'Neu laden'}</button>}
      {controls}
      {error && <p role="alert" className="mt-3 text-amber-800 dark:text-amber-200">{error}</p>}
    </div>}
  </section>
}
