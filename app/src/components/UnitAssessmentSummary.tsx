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
  allowStart?: boolean
}

/** All evidence and planning credits are scoped to the backend's current unit revision. */
export function UnitAssessmentSummary({ assessment, completion, language, titleForGoal, allowStart = false }: Props): React.ReactElement {
  const en = language.startsWith('en')
  const sectionProfileId = `automatic:${assessment.sectionGoalId}`
  const startProfile = completion.profileId === sectionProfileId
    ? { profileId: sectionProfileId, assessments: completion.assessments }
    : completion.profileOptions.find(option => option.profileId === sectionProfileId)
  const passed = assessment.parts.filter(part => part.passed).length
  const total = assessment.parts.length
  const goals = [
    { ids: assessment.planningCreditGoalIds, label: en ? 'Credited toward your learning plan' : 'Für deinen Lernplan angerechnet' },
    { ids: assessment.individuallyOpenGoalIds, label: en ? 'Still awaiting individual evidence' : 'Einzeln noch nachzuweisen' },
  ]
  return <details data-testid="unit-assessment-summary" className="unit-assessment-summary my-2 w-full rounded-xl border border-border-color bg-sidebar-bg p-3 text-sm text-text-primary">
    <summary className="cursor-pointer rounded font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
      {assessment.passed
        ? (en ? 'Unit assessment passed' : 'Einheitenprüfung bestanden')
        : (en ? 'Unit assessment' : 'Einheitenprüfung')}
      {' · '}{en ? `${passed} of ${total} ${total === 1 ? 'part' : 'parts'} passed` : `${passed} von ${total} ${total === 1 ? 'Teil' : 'Teilen'} bestanden`}
    </summary>
    <ul aria-label={en ? 'Assessment parts' : 'Prüfungsteile'} className="mt-3 space-y-2">
      {assessment.parts.map(part => {
        const startHref = allowStart && !completion.directAssessmentRunning && !part.passed && startProfile
          && startProfile.assessments?.some(item => item.goalId === part.goalId && item.startAvailable)
          ? buildCompletionAssessmentStartHref({ profileId: startProfile.profileId, goalId: part.goalId, expectedRevision: completion.learnerRevision })
          : undefined
        const label = completionLabel(part.title, language)
        return <li key={part.goalId} className="flex flex-wrap items-center justify-between gap-x-3 rounded-lg border border-border-color px-3 py-2">
          <span className="min-w-0 [overflow-wrap:anywhere]"><InlineMathText text={label} /></span>
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
            {part.passed && <Check size={14} aria-hidden="true" />}{part.passed ? (en ? 'Verified pass' : 'Beleg vorhanden') : (en ? 'Open' : 'Offen')}
          </span>
          {startHref && <Link to={startHref}
            aria-label={en ? `Try ${label} directly` : `${label} direkt versuchen`}
            className="inline-flex min-h-9 items-center rounded text-sm font-semibold underline underline-offset-2">
            {en ? 'Try directly' : 'Direkt versuchen'}
          </Link>}
        </li>
      })}
    </ul>
    {goals.map(({ ids, label }) => {
      const titles = ids.flatMap(id => {
        const title = titleForGoal?.(id)
        return title ? [{ id, title }] : []
      })
      return titles.length ? <details key={label} className="mt-2">
        <summary className="cursor-pointer rounded font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">{label} ({ids.length})</summary>
        <ul className="ml-5 mt-2 list-disc text-text-secondary">{titles.map(({ id, title }) => <li key={id}><InlineMathText text={title} /></li>)}</ul>
      </details> : <p key={label} className="mt-2 text-text-secondary">{label} ({ids.length})</p>
    })}
  </details>
}
