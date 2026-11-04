import * as React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import {
  buildCompletionAssessmentStartHref, completionLabel, completionUnavailableReason,
  type CompletionAssessment,
} from '../utils/levelCompletionApi'
import { InlineMathText } from './InlineMathText'

const PAGE_SIZE = 8

/** Browsing only: filter complete backend choices and render one bounded page. */
export function CompletionAssessmentList({
  assessments, profileId, revision, language, disabled, stale, running, label, onShowGoal,
}: {
  assessments: CompletionAssessment[]
  profileId: string
  revision: number
  language: string
  disabled: boolean
  stale: boolean
  running: boolean
  label: string
  onShowGoal?: (goalId: string) => void
}) {
  const en = language.startsWith('en')
  const searchId = React.useId()
  const [query, setQuery] = React.useState('')
  const [page, setPage] = React.useState(0)
  const normalized = query.trim().toLocaleLowerCase(en ? 'en' : 'de')
  const filtered = normalized
    ? assessments.filter(entry => completionLabel(entry.title, language).toLocaleLowerCase(en ? 'en' : 'de').includes(normalized))
    : assessments
  const lastPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1)
  const currentPage = Math.min(page, lastPage)
  const start = currentPage * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)
  const buttonClass = 'min-h-11 rounded-lg border border-sky-400 px-3 py-2 text-sm font-semibold text-text-primary hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-sky-950/40'
  return <div data-testid="completion-assessment-browser" className="mt-3">
    {assessments.length > PAGE_SIZE || query ? <div className="mb-3">
      <label htmlFor={searchId} className="text-sm font-medium text-text-primary">{en ? 'Find an assessment' : 'Prüfung suchen'}</label>
      <input id={searchId} type="search" value={query}
        onChange={event => { setQuery(event.target.value); setPage(0) }}
        className="mt-1 block min-h-11 w-full rounded-lg border border-border-color bg-input-bg px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500" />
      <p role="status" className="mt-1 text-xs text-text-secondary">{en
        ? `${filtered.length} of ${assessments.length} assessments`
        : `${filtered.length} von ${assessments.length} Prüfungen`}</p>
    </div> : null}
    <ul className="space-y-3" aria-label={label}>
      {visible.map(assessment => <li key={assessment.goalId}
        className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-border-color p-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <InlineMathText text={completionLabel(assessment.title, language)} className="font-medium" />
          <p className="mt-1 flex items-center gap-1 text-sm text-text-secondary">
            {assessment.mastered ? <Check size={16} aria-hidden="true" /> : null}
            {assessment.mastered ? (en ? 'Achieved' : 'Geschafft') : (en ? 'Not yet achieved' : 'Noch nicht geschafft')}
          </p>
          {onShowGoal ? <button type="button" disabled={stale} onClick={() => onShowGoal(assessment.goalId)}
            aria-label={`${en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}: ${completionLabel(assessment.title, language)}`}
            className="min-h-9 rounded text-left text-sm underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-50">
            {en ? 'Show in goal tree' : 'Im Lernzielbaum anzeigen'}
          </button> : null}
          {!assessment.mastered && !assessment.startAvailable ? <p className="mt-1 text-sm text-text-secondary">
            {completionUnavailableReason(assessment.unavailableReason ?? 'unavailable', language)}
          </p> : null}
        </div>
        {!assessment.mastered && assessment.startAvailable && !running ? (
          disabled ? <span aria-disabled="true" className={`${buttonClass} opacity-50`}>{en ? 'Try assessment directly' : 'Prüfung direkt versuchen'}</span>
            : <Link className={buttonClass} to={buildCompletionAssessmentStartHref({ profileId, goalId: assessment.goalId, expectedRevision: revision })}>
              {en ? 'Try assessment directly' : 'Prüfung direkt versuchen'}
            </Link>
        ) : null}
      </li>)}
    </ul>
    {filtered.length === 0 ? <p role="status" className="text-sm text-text-secondary">
      {en ? 'No assessments match your search.' : 'Keine Prüfung passt zu deiner Suche.'}
    </p> : null}
    {filtered.length > PAGE_SIZE ? <nav aria-label={en ? 'Assessment pages' : 'Prüfungsseiten'} className="mt-3 flex flex-wrap items-center gap-2">
      <button type="button" disabled={currentPage === 0} className={buttonClass} onClick={() => setPage(currentPage - 1)}>
        {en ? 'Previous' : 'Zurück'}
      </button>
      <span className="text-sm text-text-secondary">{en ? `Page ${currentPage + 1} of ${lastPage + 1}` : `Seite ${currentPage + 1} von ${lastPage + 1}`}</span>
      <button type="button" disabled={currentPage === lastPage} className={buttonClass} onClick={() => setPage(currentPage + 1)}>
        {en ? 'Next' : 'Weiter'}
      </button>
    </nav> : null}
  </div>
}
