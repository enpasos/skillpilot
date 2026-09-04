import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Layers3, Pencil, RefreshCw, Send } from 'lucide-react'

import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { ToastKind } from '../hooks/useToast'
import type { LearnerLearningPlanDetail } from '../learnerLearningPlanTypes'
import type { ClassSession } from '../trainerTypes'
import {
  activateLearnerLearningPlans,
  getLearnerLearningPlan,
  LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT,
  LearnerLearningPlanApiError,
} from '../utils/learnerLearningPlanApi'
import { berlinDateKey } from '../utils/learnerLearningPlanReadModel'
import { loadTeacherCoursePlan } from '../utils/localTeacherCoursePlan'
import type { RuntimeCurriculumCatalogState } from '../utils/runtimeCurriculumCatalog'
import {
  learnerPlanCopyMatchesServer,
  loadTeacherLearningPlanActivationSubject,
  type TeacherLearningPlanActivationStatus,
  type TeacherLearningPlanActivationSubject,
} from '../utils/teacherLearningPlanActivation'
import { getExistingLearnerSubjectIds } from '../utils/existingLearnerClass'

interface TrainerLearningPlanActivationProps {
  classSession: ClassSession
  learnerId: string
  landscapeEntries: LandscapeEntry[]
  runtimeCatalogState: RuntimeCurriculumCatalogState
  language: 'de' | 'en'
  refreshToken: number
  hasUnsavedActiveDraft: boolean
  onSelectSubject: (landscapeId: string) => void
  onNotify?: (kind: ToastKind, message: string) => void
}

interface ActivationSnapshot {
  asOf: string
  subjects: TeacherLearningPlanActivationSubject[]
}

const copyFor = (language: 'de' | 'en') => language === 'de'
  ? {
      eyebrow: 'Gemeinsame Lernplanung',
      title: 'Fachpläne gemeinsam wirksam machen',
      body: 'SkillPilot prüft alle vorbereiteten Fachpläne und aktiviert sie mit einer Bestätigung gemeinsam. Das erste fällige Lernziel startet automatisch.',
      loading: 'Fachpläne werden geprüft …',
      retry: 'Erneut prüfen',
      edit: 'Fachplan bearbeiten',
      activate: (count: number) => `Planung mit ${count} Fachplänen wirksam machen`,
      noPlans: 'Noch ist kein berechenbarer Fachplan vorbereitet.',
      blocked: 'Mindestens ein angelegter Fachplan ist noch nicht vollständig berechenbar. Öffne das Fach und korrigiere den Entwurf, bevor du die Planung gemeinsam aktivierst.',
      unavailable: 'Der Cockpit-Stand konnte nicht zuverlässig geprüft werden. Die gemeinsame Aktivierung bleibt deshalb gesperrt.',
      confirmTitle: 'Alle Fachpläne gemeinsam aktivieren?',
      confirmBody: 'Dieser eine Schritt ersetzt die aufgeführten Fachpläne im Cockpit atomar, schaltet planbegleitetes Lernen ein und wählt sofort das erste fällige, zulässige Lernziel aus.',
      cancel: 'Abbrechen',
      confirm: 'Jetzt wirksam machen',
      saving: 'Wird wirksam gemacht …',
      successStarted: (count: number) => `${count} Fachpläne sind gemeinsam wirksam. Das erste fällige Lernziel ist ausgewählt.`,
      successIdle: (count: number) => `${count} Fachpläne sind gemeinsam wirksam. Heute ist kein startbares Planziel fällig.`,
      rejected: 'Die gemeinsame Aktivierung wurde atomar abgelehnt. Kein Fachplan wird als neu wirksam dargestellt. Bitte prüfe die Planung und versuche es erneut.',
      prerequisiteScheduleConflict: 'Ein Fachplan konnte in den gewählten Zeiträumen nicht automatisch voraussetzungsgerecht verteilt werden. Öffne den Fachplan und passe die überlappenden Lernabschnitte an. Es wurde nichts übernommen.',
      outcomeUnknown: 'Das Ergebnis der gemeinsamen Aktivierung konnte nicht sicher bestätigt werden. Es wird kein Fachplan als neu wirksam dargestellt. Bitte prüfe zuerst den Cockpit-Stand erneut.',
      changed: 'Ein Fachplan hat sich während der Bestätigung geändert. Bitte prüfe die gemeinsame Planung erneut.',
      dayChanged: 'Seit der Prüfung hat ein neuer Kalendertag begonnen. Bitte prüfe die gemeinsame Planung erneut.',
      unsaved: 'Speichere oder verwirf zuerst die Änderungen im aktuell geöffneten Fachplan.',
      status: {
        draft: 'Entwurf',
        'not-ready': 'Nicht bereit',
        ready: 'Bereit',
        current: 'Im Cockpit · aktuell',
        'cockpit-only': 'Im Cockpit · kein lokaler Entwurf',
        'update-required': 'Aktualisierung nötig',
        unavailable: 'Prüfung nicht möglich',
      } satisfies Record<TeacherLearningPlanActivationStatus, string>,
    }
  : {
      eyebrow: 'Shared learning plan',
      title: 'Activate subject plans together',
      body: 'SkillPilot checks every prepared subject plan and activates them together with one confirmation. The first due goal starts automatically.',
      loading: 'Checking subject plans …',
      retry: 'Check again',
      edit: 'Edit subject plan',
      activate: (count: number) => `Activate planning with ${count} subject plans`,
      noPlans: 'No calculable subject plan has been prepared yet.',
      blocked: 'At least one existing subject plan is not fully calculable. Open that subject and correct the draft before activating the shared planning.',
      unavailable: 'The cockpit state could not be checked reliably, so shared activation remains unavailable.',
      confirmTitle: 'Activate all subject plans together?',
      confirmBody: 'This one step atomically replaces the listed cockpit plans, enables plan-guided learning, and immediately selects the first due eligible goal.',
      cancel: 'Cancel',
      confirm: 'Activate now',
      saving: 'Activating …',
      successStarted: (count: number) => `${count} subject plans are active together. The first due goal is selected.`,
      successIdle: (count: number) => `${count} subject plans are active together. No eligible plan goal is due today.`,
      rejected: 'The shared activation was rejected atomically. No subject plan is shown as newly active. Check the planning and try again.',
      prerequisiteScheduleConflict: 'A subject plan could not be distributed prerequisite-safely across the selected periods automatically. Open that subject plan and adjust the overlapping learning sections. Nothing was applied.',
      outcomeUnknown: 'The result of the shared activation could not be confirmed safely. No subject plan is shown as newly active. Check the cockpit state first.',
      changed: 'A subject plan changed during confirmation. Check the shared planning again.',
      dayChanged: 'A new calendar day began after the check. Check the shared planning again.',
      unsaved: 'Save or discard the changes in the currently open subject plan first.',
      status: {
        draft: 'Draft',
        'not-ready': 'Not ready',
        ready: 'Ready',
        current: 'In cockpit · current',
        'cockpit-only': 'In cockpit · no local draft',
        'update-required': 'Update required',
        unavailable: 'Cannot verify',
      } satisfies Record<TeacherLearningPlanActivationStatus, string>,
    }

const statusClassName = (status: TeacherLearningPlanActivationStatus) => {
  if (status === 'current') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100'
  }
  if (status === 'ready') {
    return 'border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-100'
  }
  if (status === 'update-required') {
    return 'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100'
  }
  if (status === 'not-ready' || status === 'unavailable') {
    return 'border-rose-300 bg-rose-50 text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100'
  }
  return 'border-border-color bg-sidebar-bg text-text-secondary'
}

export const TrainerLearningPlanActivation = ({
  classSession,
  learnerId,
  landscapeEntries,
  runtimeCatalogState,
  language,
  refreshToken,
  hasUnsavedActiveDraft,
  onSelectSubject,
  onNotify,
}: TrainerLearningPlanActivationProps) => {
  const copy = useMemo(() => copyFor(language), [language])
  const [subjects, setSubjects] = useState<TeacherLearningPlanActivationSubject[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reloadToken, setReloadToken] = useState(0)
  const [confirmation, setConfirmation] = useState<ActivationSnapshot | null>(null)
  const [activationState, setActivationState] = useState<'idle' | 'saving'>('idle')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const loadRequestTokenRef = useRef(0)
  const prepareInFlightRef = useRef(false)
  const activationInFlightRef = useRef(false)
  const activationRequestTokenRef = useRef(0)
  const hasUnsavedActiveDraftRef = useRef(hasUnsavedActiveDraft)
  hasUnsavedActiveDraftRef.current = hasUnsavedActiveDraft

  const subjectIds = useMemo(() => getExistingLearnerSubjectIds(
    classSession.personalConfig ?? {},
    landscapeEntries,
    classSession.rootLandscapeId,
  ), [classSession.personalConfig, classSession.rootLandscapeId, landscapeEntries])
  const subjectKey = subjectIds.join('\u0000')

  const loadSubjects = useCallback(async (asOf: string, signal?: AbortSignal) => {
    const entriesById = new Map(landscapeEntries.map((entry) => [entry.meta.landscapeId, entry]))
    const serverStates = await Promise.all(subjectIds.map(async (landscapeId) => {
      try {
        const plan = await getLearnerLearningPlan(learnerId, landscapeId, asOf, { signal })
        return { landscapeId, plan, available: true }
      } catch (loadError) {
        if (signal?.aborted) throw loadError
        if (loadError instanceof LearnerLearningPlanApiError && loadError.status === 404) {
          return { landscapeId, plan: null, available: true }
        }
        return { landscapeId, plan: null, available: false }
      }
    }))
    const serverByLandscape = new Map(serverStates.map((state) => [state.landscapeId, state]))
    return Promise.all(subjectIds.map((landscapeId, index) => {
      const entry = entriesById.get(landscapeId)
      const label = entry?.meta.subject?.trim()
        || entry?.meta.title?.trim()
        || (language === 'de' ? `Fach ${index + 1}` : `Subject ${index + 1}`)
      const server = serverByLandscape.get(landscapeId)
      return loadTeacherLearningPlanActivationSubject({
        classSession,
        landscapeId,
        label,
        landscapeEntries,
        runtimeCatalogState,
        serverPlan: server?.plan ?? null,
        serverAvailable: server?.available === true,
        signal,
      })
    }))
  }, [classSession, landscapeEntries, language, learnerId, runtimeCatalogState, subjectIds])

  useEffect(() => {
    const controller = new AbortController()
    const token = loadRequestTokenRef.current + 1
    loadRequestTokenRef.current = token
    setLoadState('loading')
    setConfirmation(null)
    setMessage('')
    setError('')
    void loadSubjects(berlinDateKey(), controller.signal).then((nextSubjects) => {
      if (controller.signal.aborted || loadRequestTokenRef.current !== token) return
      setSubjects(nextSubjects)
      setLoadState('ready')
    }).catch((loadError) => {
      if (controller.signal.aborted || loadRequestTokenRef.current !== token) return
      console.warn('Could not inspect shared teacher learning plans', loadError)
      setLoadState('error')
    })
    return () => controller.abort()
  }, [loadSubjects, refreshToken, reloadToken, subjectKey])

  useEffect(() => {
    if (!hasUnsavedActiveDraft || !confirmation || activationState !== 'idle') return
    loadRequestTokenRef.current += 1
    prepareInFlightRef.current = false
    setConfirmation(null)
    setMessage('')
    setError(copy.changed)
    setLoadState('ready')
  }, [activationState, confirmation, copy.changed, hasUnsavedActiveDraft])

  const activatableSubjects = subjects.filter((subject) => subject.copy !== null)
  const hasBlockingPlan = subjects.some((subject) => (
    (Boolean(subject.serverPlan) || Boolean(subject.localPlan?.blocks.length))
    && !subject.copy
  ))
  const hasUnavailableState = loadState === 'error'
    || subjects.some((subject) => subject.status === 'unavailable')
  const activationDisabled = loadState !== 'ready'
    || activationState !== 'idle'
    || activatableSubjects.length === 0
    || hasBlockingPlan
    || hasUnavailableState
    || hasUnsavedActiveDraft

  const prepareActivation = async () => {
    if (
      activationDisabled
      || prepareInFlightRef.current
      || activationInFlightRef.current
      || hasUnsavedActiveDraftRef.current
    ) return
    prepareInFlightRef.current = true
    const token = loadRequestTokenRef.current + 1
    loadRequestTokenRef.current = token
    const asOf = berlinDateKey()
    setLoadState('loading')
    setMessage('')
    setError('')
    try {
      const latest = await loadSubjects(asOf)
      if (loadRequestTokenRef.current !== token) return
      setSubjects(latest)
      setLoadState('ready')
      const latestActivatable = latest.filter((subject) => subject.copy !== null)
      const latestBlocked = latest.some((subject) => (
        (Boolean(subject.serverPlan) || Boolean(subject.localPlan?.blocks.length))
        && !subject.copy
      ))
      if (
        hasUnsavedActiveDraftRef.current
        || berlinDateKey() !== asOf
        || latestActivatable.length === 0
        || latestBlocked
        || latest.some((subject) => subject.status === 'unavailable')
      ) {
        if (hasUnsavedActiveDraftRef.current) setError(copy.changed)
        else if (berlinDateKey() !== asOf) setError(copy.dayChanged)
        return
      }
      setConfirmation({ asOf, subjects: latestActivatable })
    } catch (loadError) {
      console.warn('Could not prepare shared teacher learning plans', loadError)
      if (loadRequestTokenRef.current === token) setLoadState('error')
    } finally {
      prepareInFlightRef.current = false
    }
  }

  const confirmActivation = async () => {
    if (
      !confirmation
      || activationState !== 'idle'
      || activationInFlightRef.current
      || hasUnsavedActiveDraftRef.current
    ) {
      if (confirmation && hasUnsavedActiveDraftRef.current) {
        setConfirmation(null)
        setError(copy.changed)
      }
      return
    }
    if (confirmation.asOf !== berlinDateKey()) {
      setConfirmation(null)
      setError(copy.dayChanged)
      setReloadToken((current) => current + 1)
      return
    }
    const changed = confirmation.subjects.some((subject) => {
      const current = loadTeacherCoursePlan(subject.storageId)
      if (current.quality.status !== 'complete') return true
      if (subject.activationSource === 'server') {
        return Boolean(current.plan?.blocks.length)
      }
      return subject.activationSource !== 'local'
        || !current.plan
        || current.plan.revision !== subject.localPlan?.revision
        || JSON.stringify(current.plan) !== JSON.stringify(subject.localPlan)
    })
    if (changed) {
      setConfirmation(null)
      setError(copy.changed)
      return
    }

    activationInFlightRef.current = true
    const token = activationRequestTokenRef.current + 1
    activationRequestTokenRef.current = token
    setActivationState('saving')
    setMessage('')
    setError('')
    try {
      const response = await activateLearnerLearningPlans(learnerId, {
        asOf: confirmation.asOf,
        plans: confirmation.subjects.map((subject) => ({
          landscapeId: subject.landscapeId,
          expectedRevision: subject.expectedRevision,
          planLabel: subject.copy!.planLabel,
          blocks: subject.copy!.blocks,
        })),
      })
      if (activationRequestTokenRef.current !== token) return
      const responseByLandscape = new Map(
        response.plans.map((plan) => [plan.landscapeId, plan]),
      )
      const selectedPlan = response.selectedLandscapeId
        ? responseByLandscape.get(response.selectedLandscapeId)
        : null
      const responseSelectionIsCoherent = response.activeGoalId
        ? Boolean(
            response.selectedPlanId
            && response.selectedLandscapeId
            && response.focusGoalId
            && selectedPlan
            && selectedPlan.planId === response.selectedPlanId
            && selectedPlan.blocks.some((block) => (
              block.kind === 'learning'
              && block.atomicGoalIds?.includes(response.activeGoalId!)
            )),
          )
        : response.selectedPlanId === null
          && response.selectedLandscapeId === null
          && response.focusGoalId === null
      const responseMatchesWholeBatch = response.asOf === confirmation.asOf
        && response.plans.length === confirmation.subjects.length
        && responseSelectionIsCoherent
        && confirmation.subjects.every((subject) => {
          const savedPlan = responseByLandscape.get(subject.landscapeId)
          return Boolean(
            savedPlan
            && subject.copy
            && !savedPlan.stale
            && learnerPlanCopyMatchesServer(subject.copy, savedPlan),
          )
        })
      if (!responseMatchesWholeBatch) {
        throw new Error('incomplete-learning-plan-activation-response')
      }
      const successMessage = response.activeGoalId
        ? copy.successStarted(confirmation.subjects.length)
        : copy.successIdle(confirmation.subjects.length)
      setConfirmation(null)
      setMessage(successMessage)
      onNotify?.('success', successMessage)
      const serverByLandscape = responseByLandscape as Map<string, LearnerLearningPlanDetail>
      setSubjects((current) => current.map((subject) => {
        const serverPlan = serverByLandscape.get(subject.landscapeId)
        if (!serverPlan || !subject.copy) return subject
        return {
          ...subject,
          serverPlan,
          expectedRevision: serverPlan.revision,
          status: serverPlan.stale || !learnerPlanCopyMatchesServer(subject.copy, serverPlan)
            ? 'update-required'
            : subject.activationSource === 'server'
              ? 'cockpit-only'
              : 'current',
        }
      }))
    } catch (activationError) {
      if (activationRequestTokenRef.current !== token) return
      console.warn('Could not activate shared teacher learning plans', activationError)
      setConfirmation(null)
      const requestWasDefinitelyRejected = activationError instanceof LearnerLearningPlanApiError
        && activationError.status >= 400
        && activationError.status < 500
        && activationError.status !== 408
        && activationError.status !== 429
      const failureMessage = activationError instanceof LearnerLearningPlanApiError
        && activationError.errorCode === LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT
        ? copy.prerequisiteScheduleConflict
        : requestWasDefinitelyRejected
          ? copy.rejected
          : copy.outcomeUnknown
      setError(failureMessage)
      onNotify?.('error', failureMessage)
    } finally {
      if (activationRequestTokenRef.current === token) {
        activationInFlightRef.current = false
        setActivationState('idle')
      }
    }
  }

  const explanation = hasUnavailableState
    ? copy.unavailable
    : hasUnsavedActiveDraft
      ? copy.unsaved
      : hasBlockingPlan
        ? copy.blocked
        : activatableSubjects.length === 0
          ? copy.noPlans
          : ''

  return (
    <section
      className="rounded-2xl border-2 border-violet-300 bg-violet-50/70 p-5 text-violet-950 shadow-sm dark:border-violet-900/70 dark:bg-violet-950/20 dark:text-violet-100"
      aria-labelledby="trainer-learning-plan-activation-title"
      data-testid="trainer-learning-plan-activation"
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-700 dark:text-violet-300">
            <Layers3 size={16} aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2 id="trainer-learning-plan-activation-title" className="mt-2 text-xl font-semibold">
            {copy.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 opacity-90">{copy.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReloadToken((current) => current + 1)}
            disabled={loadState === 'loading' || activationState === 'saving'}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-violet-300 bg-sidebar-bg px-3 py-2 text-sm font-medium text-text-primary hover:bg-violet-100 disabled:cursor-wait disabled:opacity-50 dark:border-violet-800 dark:hover:bg-violet-950/40"
          >
            <RefreshCw size={16} aria-hidden="true" />
            {copy.retry}
          </button>
          <button
            type="button"
            onClick={() => void prepareActivation()}
            disabled={activationDisabled}
            aria-describedby={explanation ? 'trainer-learning-plan-activation-explanation' : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={17} aria-hidden="true" />
            {copy.activate(activatableSubjects.length)}
          </button>
        </div>
      </div>

      {loadState === 'loading' ? (
        <p className="mt-4 text-sm" role="status">{copy.loading}</p>
      ) : (
        <ul className="mt-4 grid gap-2 lg:grid-cols-2" aria-label={copy.eyebrow}>
          {subjects.map((subject) => (
            <li key={subject.landscapeId} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-violet-200 bg-sidebar-bg p-3 dark:border-violet-900/60">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">{subject.label}</p>
                <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClassName(subject.status)}`}>
                  {copy.status[subject.status]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectSubject(subject.landscapeId)}
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-xs font-medium text-text-primary hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30"
                aria-label={`${copy.edit}: ${subject.label}`}
              >
                <Pencil size={15} aria-hidden="true" />
                {copy.edit}
              </button>
            </li>
          ))}
        </ul>
      )}

      {explanation && loadState !== 'loading' && (
        <p id="trainer-learning-plan-activation-explanation" className="mt-3 flex items-start gap-2 text-sm leading-6" role={hasUnavailableState ? 'alert' : undefined}>
          <AlertTriangle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
          {explanation}
        </p>
      )}

      {confirmation && (
        <div className="mt-5 rounded-xl border border-violet-400 bg-white p-4 text-text-primary dark:bg-slate-950" data-testid="trainer-learning-plan-activation-confirmation">
          <h3 className="font-semibold">{copy.confirmTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{copy.confirmBody}</p>
          <ul className="mt-3 list-inside list-disc text-sm">
            {confirmation.subjects.map((subject) => (
              <li key={subject.landscapeId}>{subject.label}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmation(null)}
              disabled={activationState === 'saving'}
              className="min-h-11 rounded-lg border border-border-color px-4 py-2 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-slate-800"
            >
              {copy.cancel}
            </button>
            <button
              type="button"
              onClick={() => void confirmActivation()}
              disabled={activationState === 'saving'}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:cursor-wait disabled:opacity-60"
            >
              <CheckCircle2 size={17} aria-hidden="true" />
              {activationState === 'saving' ? copy.saving : copy.confirm}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm font-medium text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-100" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm font-medium text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100" role="status">
          {message}
        </p>
      )}
    </section>
  )
}
