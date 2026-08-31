import React, { useEffect, useRef, useState } from 'react'
import { LoaderCircle, MessageSquareText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useLanguage } from '../contexts/LanguageContext'
import type { UiGoal } from '../goalTypes'
import { createSynchronousInFlightGuard } from '../utils/synchronousInFlightGuard'
import {
  goalBookFeedbackUrl,
  requestCurrentGoalBookFeedbackBinding,
} from '../utils/goalBookFeedback'
import { goalBookDefinitionByLandscapeId } from '../utils/goalBookPublicationRegistry'

const copy = {
  de: {
    prompt: 'Schwäche oder Fehler entdeckt?',
    action: 'Feedback zu diesem Lernziel',
    loading: 'Feedback wird vorbereitet …',
    error: 'Der Feedbackweg ist gerade nicht verfügbar. Bitte versuche es erneut.',
  },
  en: {
    prompt: 'Found a weakness or an error?',
    action: 'Give feedback on this learning goal',
    loading: 'Preparing feedback …',
    error: 'Feedback is currently unavailable. Please try again.',
  },
} as const

type FeedbackGoal = Pick<
  UiGoal,
  'id' | 'title' | 'landscapeId' | 'semanticKind' | 'contains' | 'type' | 'nodeKind' | 'examData'
>

const IS_PACKAGE_CONSUMER_BUILD = import.meta.env?.MODE === 'package-consumer'

const canOfferLearnerGoalFeedback = (goal: FeedbackGoal): boolean => (
  !IS_PACKAGE_CONSUMER_BUILD
  && goal.type !== 'cluster'
  && goal.contains.length === 0
  && goal.nodeKind !== 'exam'
  && goal.nodeKind !== 'memory'
  && goal.examData === undefined
  && (goal.semanticKind === undefined || goal.semanticKind === 'curricularAtomic')
  && typeof goal.landscapeId === 'string'
  && goalBookDefinitionByLandscapeId(goal.landscapeId) !== undefined
)

export const LearnerGoalFeedbackAction: React.FC<{ goal: FeedbackGoal }> = ({ goal }) => {
  const navigate = useNavigate()
  const { language } = useLanguage()
  const localizedCopy = copy[language === 'en' ? 'en' : 'de']
  const inFlightRef = useRef(createSynchronousInFlightGuard())
  const abortControllerRef = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const definition = typeof goal.landscapeId === 'string'
    ? goalBookDefinitionByLandscapeId(goal.landscapeId)
    : undefined

  useEffect(() => () => {
    abortControllerRef.current?.abort()
    inFlightRef.current.finish()
  }, [goal.id, goal.landscapeId])

  if (!definition || !canOfferLearnerGoalFeedback(goal)) return null

  const handleFeedback = async () => {
    if (!inFlightRef.current.tryStart()) return
    const abortController = new AbortController()
    abortControllerRef.current = abortController
    setBusy(true)
    setFailed(false)
    try {
      const binding = await requestCurrentGoalBookFeedbackBinding({
        bookId: definition.bookId,
        goalId: goal.id,
        signal: abortController.signal,
      })
      if (!abortController.signal.aborted) {
        navigate(goalBookFeedbackUrl(binding))
      }
    } catch {
      if (!abortController.signal.aborted) setFailed(true)
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
        inFlightRef.current.finish()
        if (!abortController.signal.aborted) setBusy(false)
      }
    }
  }

  return (
    <section
      aria-label={localizedCopy.action}
      className="mt-3 rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-900/70 dark:bg-violet-950/20"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-violet-950 dark:text-violet-100">{localizedCopy.prompt}</p>
        <button
          type="button"
          onClick={handleFeedback}
          disabled={busy}
          aria-busy={busy}
          aria-label={`${localizedCopy.action}: ${goal.title}`}
          className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-violet-400 px-3 py-2 text-sm font-semibold text-violet-900 transition hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-65 dark:border-violet-700 dark:text-violet-100 dark:hover:bg-violet-950/60 dark:focus:ring-offset-slate-900 sm:w-auto"
        >
          {busy
            ? <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />
            : <MessageSquareText size={18} aria-hidden="true" />}
          {busy ? localizedCopy.loading : localizedCopy.action}
        </button>
      </div>
      {failed && (
        <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {localizedCopy.error}
        </p>
      )}
    </section>
  )
}
