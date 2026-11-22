import * as React from 'react'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildCompletionAssessmentStartHref, completionLabel, type LevelCompletion, type UnitAssessment } from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'

interface Props {
  assessment: UnitAssessment
  completion: LevelCompletion
  language: string
  titleForGoal?: (goalId: string) => string | undefined
  onShowGoal?: (goalId: string) => void
  allowStart?: boolean
  expanded?: boolean
  showGoalDetails?: boolean
}

/** All evidence and planning credits are scoped to the backend's current unit revision. */
export function UnitAssessmentSummary({ assessment, completion, language, titleForGoal, onShowGoal, allowStart = false, expanded = false, showGoalDetails = true }: Props): React.ReactElement {
  const en = language.startsWith('en')
  const sectionProfileId = `automatic:${assessment.sectionGoalId}`
  const startProfile = completion.profileId === sectionProfileId
    ? { profileId: sectionProfileId, assessments: completion.assessments }
    : completion.profileOptions.find(option => option.profileId === sectionProfileId)
  const passed = assessment.parts.filter(part => part.passed).length
  const total = assessment.parts.length
  const goals = [
    { credited: true, ids: assessment.planningCreditGoalIds, label: en ? 'Credited toward your learning plan' : 'Für deinen Lernplan angerechnet' },
    { credited: false, ids: assessment.individuallyOpenGoalIds, label: en ? 'Still awaiting individual evidence' : 'Einzeln noch nachzuweisen' },
  ]
  const Container = expanded ? 'section' : 'details'
  const Heading = expanded ? 'h3' : 'summary'
  return <Container data-testid="unit-assessment-summary" className="unit-assessment-summary my-2 w-full rounded-xl border border-border-color bg-sidebar-bg p-3 text-sm text-text-primary">
    <Heading className="rounded font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
      {assessment.passed
        ? (en ? 'Unit assessment passed' : 'Einheitenprüfung bestanden')
        : (en ? 'Unit assessment' : 'Einheitenprüfung')}
      {' · '}{en ? `${passed} of ${total} ${total === 1 ? 'part' : 'parts'} passed` : `${passed} von ${total} ${total === 1 ? 'Teil' : 'Teilen'} bestanden`}
    </Heading>
    <ul aria-label={en ? 'Assessment parts' : 'Prüfungsteile'} className="mt-3 space-y-2">
      {assessment.parts.map(part => {
        const startHref = allowStart && !completion.directAssessmentRunning && !part.passed && part.materialCurrent !== false && startProfile
          && startProfile.assessments?.some(item => item.goalId === part.goalId && item.startAvailable)
          ? buildCompletionAssessmentStartHref({ profileId: startProfile.profileId, goalId: part.goalId, expectedRevision: completion.learnerRevision })
          : undefined
        const label = completionLabel(part.title, language)
        const status = part.materialCurrent === false ? (en ? 'This assessment version is unavailable' : 'Diese Prüfungsfassung ist nicht verfügbar')
          : part.passed ? (en ? 'Verified pass' : 'Beleg vorhanden') : (en ? 'Open' : 'Offen')
        return <li key={part.goalId} className="flex flex-wrap items-center justify-between gap-x-3 rounded-lg border border-border-color px-3 py-2">
          <span className="min-w-0 [overflow-wrap:anywhere]"><InlineMathText text={label} /></span>
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
            {part.passed && part.materialCurrent !== false && <Check data-testid="unit-assessment-direct-evidence" className="shrink-0 text-emerald-600 dark:text-emerald-400" size={16} strokeWidth={3} aria-hidden="true" />}{status}
          </span>
          {part.missingPlanningCreditBinding && <p className="w-full text-sm text-text-secondary">
            {en ? 'This pass counts towards the unit. It was recorded without the planning credit for the current review.'
              : 'Dieser Beleg zählt für die Einheit. Bei der Bewertung wurde die heutige Anrechnung für den Lernplan nicht mit erfasst.'}
          </p>}
          {startHref && <Link to={startHref}
            aria-label={en ? `Try ${label} directly` : `${label} direkt versuchen`}
            className="inline-flex min-h-9 items-center rounded text-sm font-semibold underline underline-offset-2">
            {en ? 'Try directly' : 'Direkt versuchen'}
          </Link>}
        </li>
      })}
    </ul>
    {showGoalDetails && goals.map(({ credited, ids, label }) => {
      const titles = ids.flatMap(id => {
        const title = titleForGoal?.(id)
        return title ? [{ id, title }] : []
      })
      return titles.length ? <details key={label} className="mt-2">
        <summary className="cursor-pointer rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{label} ({ids.length})</summary>
        <ul className="ml-5 mt-2 space-y-1 text-text-secondary">{titles.map(({ id, title }) => <li key={id} className="flex items-center gap-2">
          {credited && <Check data-testid="unit-assessment-credited-evidence" className="shrink-0 text-neutral-600 dark:text-neutral-400" size={16} strokeWidth={3} role="img" aria-label={en ? 'Credited through assessment' : 'Fachlich angerechnet'} />}
          {onShowGoal ? <button type="button" className="min-h-9 rounded text-left underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2"
            onClick={() => onShowGoal(id)}><InlineMathText text={title} /></button> : <InlineMathText text={title} />}
        </li>)}</ul>
      </details> : <p key={label} className="mt-2 text-text-secondary">{label} ({ids.length})</p>
    })}
  </Container>
}
