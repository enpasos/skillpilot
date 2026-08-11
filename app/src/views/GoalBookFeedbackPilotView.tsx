import React, { useMemo } from 'react'
import { ArrowLeft, FlaskConical, MessageSquareText } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { ThemeToggle } from '../components/ThemeToggle'
import { useLanguage } from '../contexts/LanguageContext'

const SAFE_GOAL_ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/u
const SAFE_EDITION = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,499}$/u
const SAFE_SHA256 = /^sha256:[0-9a-f]{64}$/u

export const GoalBookFeedbackPilotView: React.FC = () => {
  const { language } = useLanguage()
  const location = useLocation()
  const binding = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const safeValue = (key: string, pattern: RegExp) => {
      const candidate = params.get(key) ?? ''
      return pattern.test(candidate) ? candidate : ''
    }
    const pageCandidate = params.get('page') ?? ''
    return {
      goalId: safeValue('goalId', SAFE_GOAL_ID),
      edition: safeValue('edition', SAFE_EDITION),
      goalFingerprint: safeValue('goalFingerprint', SAFE_SHA256),
      pageFingerprint: safeValue('pageFingerprint', SAFE_SHA256),
      bookDigest: safeValue('bookDigest', SAFE_SHA256),
      page: /^(?:[1-9][0-9]{0,3})$/u.test(pageCandidate) ? pageCandidate : '',
    }
  }, [location.search])
  const goalId = binding.goalId
  const backTarget = goalId ? `/lernzielbuch#goal-${goalId}` : '/lernzielbuch'
  const english = language === 'en'

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-text-primary transition-colors dark:bg-app-gradient sm:px-6">
      <header className="mx-auto flex max-w-3xl items-center justify-between gap-4">
        <Link to={backTarget} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary hover:text-sky-600">
          <ArrowLeft size={18} aria-hidden="true" />
          {english ? 'Back to the learning goal book' : 'Zurück zum Lernzielbuch'}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto mt-12 max-w-3xl rounded-2xl border border-violet-300 bg-white/85 p-6 shadow-sm dark:border-violet-900 dark:bg-slate-900/75 sm:p-9">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
          <FlaskConical size={18} aria-hidden="true" />
          {english ? 'Feedback pilot' : 'Feedback-Pilot'}
        </p>
        <h1 className="mt-3 flex items-center gap-3 text-3xl font-semibold text-slate-800 dark:text-slate-100">
          <MessageSquareText className="shrink-0 text-violet-600" aria-hidden="true" />
          {english ? 'Structured feedback is being prepared' : 'Strukturiertes Feedback wird vorbereitet'}
        </h1>
        <p className="mt-5 text-base leading-7 text-text-primary">
          {english
            ? 'The public feedback channel is not active yet. This page deliberately contains no form and sends no data.'
            : 'Der öffentliche Feedbackkanal ist noch nicht aktiv. Diese Seite enthält bewusst kein Formular und übermittelt keine Daten.'}
        </p>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {english
            ? 'The later form will bind every observation to the exact learning-goal ID and publication version. It will not request learner names, permanent SkillPilot IDs, or chat content.'
            : 'Das spätere Formular bindet jede Beobachtung an die exakte Lernziel-ID und Publikationsversion. Es wird weder Namen von Lernenden noch permanente SkillPilot-IDs oder Chat-Inhalte abfragen.'}
        </p>
        {goalId && (
          <div className="mt-6 rounded-lg bg-violet-50 px-4 py-3 dark:bg-violet-950/40">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800 dark:text-violet-200">
              {english ? 'Referenced learning-goal ID' : 'Referenzierte Lernziel-ID'}
            </p>
            <code className="mt-1 block break-all text-xs text-violet-950 dark:text-violet-100">{goalId}</code>
            <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-[10rem_minmax(0,1fr)]">
              {binding.edition && (
                <>
                  <dt className="font-semibold">{english ? 'Book edition' : 'Buchausgabe'}</dt>
                  <dd><code className="break-all">{binding.edition}</code></dd>
                </>
              )}
              {binding.page && (
                <>
                  <dt className="font-semibold">{english ? 'Page' : 'Seite'}</dt>
                  <dd>{binding.page}</dd>
                </>
              )}
              {binding.goalFingerprint && (
                <>
                  <dt className="font-semibold">{english ? 'Goal fingerprint' : 'Zielfingerprint'}</dt>
                  <dd><code className="break-all">{binding.goalFingerprint}</code></dd>
                </>
              )}
              {binding.pageFingerprint && (
                <>
                  <dt className="font-semibold">{english ? 'Page fingerprint' : 'Seitenfingerprint'}</dt>
                  <dd><code className="break-all">{binding.pageFingerprint}</code></dd>
                </>
              )}
              {binding.bookDigest && (
                <>
                  <dt className="font-semibold">{english ? 'Book fingerprint' : 'Buchfingerprint'}</dt>
                  <dd><code className="break-all">{binding.bookDigest}</code></dd>
                </>
              )}
            </dl>
          </div>
        )}
      </main>
    </div>
  )
}
