import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, CheckCircle2, Eye, Layers3, Pencil, RefreshCw, Send } from 'lucide-react'

import type { LandscapeEntry } from '../hooks/useLandscapes'
import type { ToastKind } from '../hooks/useToast'
import type { LearnerLearningPlanDetail, PreviewLearnerLearningPlansResponse } from '../learnerLearningPlanTypes'
import type { ClassSession } from '../trainerTypes'
import {
  activateLearnerLearningPlans,
  previewLearnerLearningPlans,
  LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT,
  LearnerLearningPlanApiError,
} from '../utils/learnerLearningPlanApi'
import { berlinDateKey, millisecondsUntilNextBerlinDateBoundary } from '../utils/learnerLearningPlanReadModel'
import type { RuntimeCurriculumCatalogState } from '../utils/runtimeCurriculumCatalog'
import {
  learnerPlanCopyMatchesServer,
  loadTeacherLearningPlanActivation,
  teacherLearningPlanActivationRequest,
  teacherLearningPlanDraftsMatch,
  type TeacherLearningPlanActivationStatus,
  type TeacherLearningPlanActivationSubject,
} from '../utils/teacherLearningPlanActivation'
import { getExistingLearnerSubjectIds } from '../utils/existingLearnerClass'
import { TrainerLearningPlanPreviewSummary } from './TrainerLearningPlanPreview'

interface TrainerLearningPlanActivationProps {
  classSession: ClassSession
  learnerId: string
  landscapeEntries: LandscapeEntry[]
  runtimeCatalogState: RuntimeCurriculumCatalogState
  language: 'de' | 'en'
  refreshToken: number
  hasUnsavedActiveDraft: boolean
  onSelectSubject: (landscapeId: string) => void
  onPreview?: () => void
  onNotify?: (kind: ToastKind, message: string) => void
}

interface ActivationSnapshot {
  context: unknown
  asOf: string
  subjects: TeacherLearningPlanActivationSubject[]
  allSubjects: TeacherLearningPlanActivationSubject[]
  preview: PreviewLearnerLearningPlansResponse
}

const copyFor = (language: 'de' | 'en') => language === 'de'
  ? {
      eyebrow: 'Gemeinsame Lernplanung',
      title: 'Alle Fächer gemeinsam',
      body: 'Die Tagesanforderungen aller aktiven Fächer zählen zusammen. Der Schüler wird im Chat automatisch geführt.',
      loading: 'Fachpläne werden geprüft …',
      retry: 'Erneut prüfen',
      edit: 'Fachplan bearbeiten',
      activate: 'Für Schüler aktivieren',
      update: 'Änderungen übernehmen',
      current: 'Aktiv für den Schüler',
      preview: 'Schülervorschau',
      localOnly: 'Entwürfe nur auf diesem Gerät · erst nach Bestätigung beim Schüler wirksam',
      paused: 'Planbegleitetes Lernen ist derzeit ausgeschaltet.',
      noPlans: 'Noch ist kein berechenbarer Fachplan vorbereitet.',
      blocked: 'Mindestens ein angelegter Fachplan ist noch nicht vollständig berechenbar. Öffne das Fach und korrigiere den Entwurf, bevor du die Planung gemeinsam aktivierst.',
      unavailable: 'Der Cockpit-Stand konnte nicht zuverlässig geprüft werden. Die gemeinsame Aktivierung bleibt deshalb gesperrt.',
      scopeChanged: 'Beim Schüler gibt es weitere gültige Fachpläne, die in dieser Fächerauswahl fehlen. Prüfe das persönliche Curriculum und aktualisiere die Fächerauswahl, bevor du die gemeinsame Planung übernimmst.',
      confirmTitle: 'Diese Planung für den Schüler übernehmen?',
      confirmBody: 'Die aufgeführten Fächer werden gemeinsam übernommen. Planbegleitetes Lernen wird eingeschaltet und ein fälliges, zulässiges Lernziel startet automatisch.',
      cancel: 'Abbrechen',
      confirm: 'Planung jetzt übernehmen',
      saving: 'Wird wirksam gemacht …',
      successStarted: (count: number) => `${count} Fachpläne sind gemeinsam wirksam. Das erste fällige Lernziel ist ausgewählt.`,
      successIdle: (count: number) => `${count} Fachpläne sind gemeinsam wirksam. Heute ist kein startbares Planziel fällig.`,
      rejected: 'Die Planung konnte nicht übernommen werden. Es wurde kein Fachplan geändert. Bitte prüfe den aktuellen Stand und versuche es erneut.',
      prerequisiteScheduleConflict: 'Ein Fachplan konnte in den gewählten Zeiträumen nicht automatisch voraussetzungsgerecht verteilt werden. Öffne den Fachplan und passe die überlappenden Lernabschnitte an. Es wurde nichts übernommen.',
      outcomeUnknown: 'Das Ergebnis der gemeinsamen Aktivierung konnte nicht sicher bestätigt werden. Es wird kein Fachplan als neu wirksam dargestellt. Bitte prüfe zuerst den Cockpit-Stand erneut.',
      changed: 'Ein Fachplan hat sich während der Bestätigung geändert. Bitte prüfe die gemeinsame Planung erneut.',
      dayChanged: 'Seit der Prüfung hat ein neuer Kalendertag begonnen. Bitte prüfe die gemeinsame Planung erneut.',
      unsaved: 'Speichere oder verwirf zuerst die Änderungen im aktuell geöffneten Fachplan.',
      status: {
        draft: 'Entwurf',
        'not-ready': 'Prüfung nötig',
        ready: 'Bereit zur Aktivierung',
        current: 'Aktiv für den Schüler',
        'cockpit-only': 'Aktiv · kein lokaler Entwurf',
        'update-required': 'Änderungen noch nicht übernommen',
        unavailable: 'Prüfung nicht möglich',
      } satisfies Record<TeacherLearningPlanActivationStatus, string>,
    }
  : {
      eyebrow: 'Shared learning plan',
      title: 'All subjects together',
      body: 'Daily requirements from every active subject add up. The learner is guided automatically in the chat.',
      loading: 'Checking subject plans …',
      retry: 'Check again',
      edit: 'Edit subject plan',
      activate: 'Activate for learner',
      update: 'Apply changes',
      current: 'Active for learner',
      preview: 'Learner preview',
      localOnly: 'Drafts on this device only · applied to the learner after confirmation',
      paused: 'Plan-guided learning is currently switched off.',
      noPlans: 'No calculable subject plan has been prepared yet.',
      blocked: 'At least one existing subject plan is not fully calculable. Open that subject and correct the draft before activating the shared planning.',
      unavailable: 'The cockpit state could not be checked reliably, so shared activation remains unavailable.',
      scopeChanged: 'The learner has other valid subject plans missing from this subject selection. Check the personal curriculum and update the subject selection before applying the shared planning.',
      confirmTitle: 'Apply this planning for the learner?',
      confirmBody: 'The listed subjects will be applied together. Plan-guided learning will be enabled and a due eligible goal will start automatically.',
      cancel: 'Cancel',
      confirm: 'Apply planning now',
      saving: 'Activating …',
      successStarted: (count: number) => `${count} subject plans are active together. The first due goal is selected.`,
      successIdle: (count: number) => `${count} subject plans are active together. No eligible plan goal is due today.`,
      rejected: 'The planning could not be applied. No subject plan was changed. Check the current state and try again.',
      prerequisiteScheduleConflict: 'A subject plan could not be distributed prerequisite-safely across the selected periods automatically. Open that subject plan and adjust the overlapping learning sections. Nothing was applied.',
      outcomeUnknown: 'The result of the shared activation could not be confirmed safely. No subject plan is shown as newly active. Check the cockpit state first.',
      changed: 'A subject plan changed during confirmation. Check the shared planning again.',
      dayChanged: 'A new calendar day began after the check. Check the shared planning again.',
      unsaved: 'Save or discard the changes in the currently open subject plan first.',
      status: {
        draft: 'Draft',
        'not-ready': 'Needs checking',
        ready: 'Ready to activate',
        current: 'Active for learner',
        'cockpit-only': 'Active · no local draft',
        'update-required': 'Changes not applied yet',
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
  onPreview,
  onNotify,
}: TrainerLearningPlanActivationProps) => {
  const copy = useMemo(() => copyFor(language), [language])
  const [subjects, setSubjects] = useState<TeacherLearningPlanActivationSubject[]>([])
  const [followLearningPlans, setFollowLearningPlans] = useState(false)
  const [loadedContext, setLoadedContext] = useState<unknown>(null)
  const [checkedAsOf, setCheckedAsOf] = useState('')
  const [checkedRefreshToken, setCheckedRefreshToken] = useState(refreshToken)
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
  const prepareControllerRef = useRef<AbortController | null>(null)
  const activeContextRef = useRef<unknown>(null)
  const confirmationHeadingRef = useRef<HTMLHeadingElement>(null)
  const hasUnsavedActiveDraftRef = useRef(hasUnsavedActiveDraft)
  hasUnsavedActiveDraftRef.current = hasUnsavedActiveDraft

  const subjectIds = useMemo(() => getExistingLearnerSubjectIds(
    classSession.personalConfig ?? {},
    landscapeEntries,
    classSession.rootLandscapeId,
  ), [classSession.personalConfig, classSession.rootLandscapeId, landscapeEntries])
  const subjectKey = subjectIds.join('\u0000')

  const context = useMemo(() => ({ classSession, learnerId, landscapeEntries, runtimeCatalogState, language }),
    [classSession, learnerId, landscapeEntries, runtimeCatalogState, language])
  activeContextRef.current = context
  const loadSubjects = useCallback((asOf: string, signal?: AbortSignal) => (
    loadTeacherLearningPlanActivation(context, asOf, signal)
  ), [context])

  useEffect(() => {
    const controller = new AbortController()
    const token = loadRequestTokenRef.current + 1
    loadRequestTokenRef.current = token
    setLoadState('loading')
    setActivationState('idle')
    setConfirmation(null)
    setMessage('')
    setError('')
    void loadSubjects(berlinDateKey(), controller.signal).then((snapshot) => {
      if (controller.signal.aborted || loadRequestTokenRef.current !== token) return
      setSubjects(snapshot.subjects)
      setFollowLearningPlans(snapshot.followLearningPlans)
      setLoadedContext(context)
      setCheckedAsOf(snapshot.asOf)
      setCheckedRefreshToken(refreshToken)
      setLoadState('ready')
    }).catch((loadError) => {
      if (controller.signal.aborted || loadRequestTokenRef.current !== token) return
      console.warn('Could not inspect shared teacher learning plans', loadError)
      setLoadState('error')
      if (loadError instanceof Error && loadError.message === 'learning-plan-subject-scope-changed') setError(copy.scopeChanged)
    })
    const timer = window.setTimeout(() => setReloadToken((value) => value + 1), millisecondsUntilNextBerlinDateBoundary())
    return () => {
      controller.abort()
      prepareControllerRef.current?.abort()
      loadRequestTokenRef.current += 1
      activationRequestTokenRef.current += 1
      prepareInFlightRef.current = false
      activationInFlightRef.current = false
      window.clearTimeout(timer)
    }
  }, [context, copy.scopeChanged, loadSubjects, refreshToken, reloadToken, subjectKey])

  useEffect(() => {
    if (!hasUnsavedActiveDraft || !confirmation || activationState !== 'idle') return
    loadRequestTokenRef.current += 1
    prepareControllerRef.current?.abort()
    prepareInFlightRef.current = false
    setConfirmation(null)
    setMessage('')
    setError(copy.changed)
    setLoadState('ready')
  }, [activationState, confirmation, copy.changed, hasUnsavedActiveDraft])

  useEffect(() => {
    if (!confirmation || confirmation.context !== context || hasUnsavedActiveDraft) return
    confirmationHeadingRef.current?.scrollIntoView({ block: 'nearest' })
    confirmationHeadingRef.current?.focus({ preventScroll: true })
  }, [confirmation, context, hasUnsavedActiveDraft])

  const snapshotIsCurrent = loadedContext === context && checkedRefreshToken === refreshToken && checkedAsOf === berlinDateKey()
  const currentSubjects = snapshotIsCurrent ? subjects : []
  const activatableSubjects = currentSubjects.filter((subject) => subject.copy !== null)
  const hasBlockingPlan = currentSubjects.some((subject) => (
    (Boolean(subject.serverPlan) || Boolean(subject.localPlan?.blocks.length))
    && !subject.copy
  ))
  const hasUnavailableState = loadState === 'error'
    || currentSubjects.some((subject) => subject.status === 'unavailable')
  const allCurrent = followLearningPlans && activatableSubjects.length > 0
    && !hasBlockingPlan && !hasUnavailableState
    && activatableSubjects.every((subject) => subject.status === 'current' || subject.status === 'cockpit-only')
  const hasActivePlans = followLearningPlans && currentSubjects.some((subject) => subject.serverPlan !== null)
  const activationDisabled = loadState !== 'ready'
    || activationState !== 'idle'
    || activatableSubjects.length === 0
    || hasBlockingPlan
    || hasUnavailableState
    || hasUnsavedActiveDraft
    || allCurrent
    || !snapshotIsCurrent

  const prepareActivation = async () => {
    if (
      activationDisabled
      || prepareInFlightRef.current
      || activationInFlightRef.current
      || hasUnsavedActiveDraftRef.current
    ) return
    prepareInFlightRef.current = true
    const controller = new AbortController()
    prepareControllerRef.current = controller
    const token = loadRequestTokenRef.current + 1
    loadRequestTokenRef.current = token
    const asOf = berlinDateKey()
    setLoadState('loading')
    setMessage('')
    setError('')
    try {
      const snapshot = await loadSubjects(asOf, controller.signal)
      if (controller.signal.aborted || loadRequestTokenRef.current !== token || activeContextRef.current !== context) return
      const latest = snapshot.subjects
      setSubjects(latest)
      setFollowLearningPlans(snapshot.followLearningPlans)
      setLoadedContext(context)
      setCheckedAsOf(asOf)
      setCheckedRefreshToken(refreshToken)
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
        setLoadState('ready')
        return
      }
      const preview = await previewLearnerLearningPlans(learnerId,
        teacherLearningPlanActivationRequest(asOf, latestActivatable), { signal: controller.signal })
      if (controller.signal.aborted || loadRequestTokenRef.current !== token || activeContextRef.current !== context) return
      setLoadState('ready')
      if (hasUnsavedActiveDraftRef.current || !teacherLearningPlanDraftsMatch(latest)) {
        setError(copy.changed)
        return
      }
      if (berlinDateKey() !== asOf) { setError(copy.dayChanged); return }
      setConfirmation({ context, asOf, subjects: latestActivatable, allSubjects: latest, preview })
    } catch (loadError) {
      if (controller.signal.aborted || loadRequestTokenRef.current !== token) return
      console.warn('Could not prepare shared teacher learning plans', loadError)
      setLoadState('error')
      setError(loadError instanceof LearnerLearningPlanApiError
        && loadError.errorCode === LEARNING_PLAN_PREREQUISITE_SCHEDULE_CONFLICT
        ? copy.prerequisiteScheduleConflict
        : loadError instanceof Error && loadError.message === 'learning-plan-subject-scope-changed'
          ? copy.scopeChanged : copy.unavailable)
    } finally {
      if (loadRequestTokenRef.current === token) prepareInFlightRef.current = false
    }
  }

  const confirmActivation = async () => {
    if (
      !confirmation
      || confirmation.context !== context
      || !snapshotIsCurrent
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
    const changed = !teacherLearningPlanDraftsMatch(confirmation.allSubjects)
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
      const response = await activateLearnerLearningPlans(learnerId,
        teacherLearningPlanActivationRequest(confirmation.asOf, confirmation.subjects))
      if (activationRequestTokenRef.current !== token || activeContextRef.current !== context) return
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
      setFollowLearningPlans(true)
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
      if (activationRequestTokenRef.current !== token || activeContextRef.current !== context) return
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
      className="rounded-2xl border border-border-color bg-white p-4 text-text-primary shadow-sm dark:bg-slate-950"
      aria-labelledby="trainer-learning-plan-activation-title"
      data-testid="trainer-learning-plan-activation"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            <Layers3 size={16} aria-hidden="true" />
            {copy.eyebrow}
          </p>
          <h2 id="trainer-learning-plan-activation-title" className="mt-1 text-lg font-semibold">
            {copy.title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-text-secondary">{copy.body}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReloadToken((current) => current + 1)}
            disabled={loadState === 'loading' || activationState === 'saving'}
            aria-label={copy.retry}
            title={copy.retry}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-violet-300 bg-sidebar-bg px-3 py-2 text-sm font-medium text-text-primary hover:bg-violet-100 disabled:cursor-wait disabled:opacity-50 dark:border-violet-800 dark:hover:bg-violet-950/40"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
          {onPreview && <button type="button" onClick={onPreview} disabled={activationState === 'saving'} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color px-3 py-2 text-sm font-medium disabled:opacity-50"><Eye size={16} aria-hidden="true" />{copy.preview}</button>}
          <button
            type="button"
            onClick={() => void prepareActivation()}
            disabled={activationDisabled}
            aria-describedby={explanation ? 'trainer-learning-plan-activation-explanation' : undefined}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {allCurrent ? <CheckCircle2 size={17} aria-hidden="true" /> : <Send size={17} aria-hidden="true" />}
            {allCurrent ? copy.current : hasActivePlans ? copy.update : copy.activate}
          </button>
        </div>
      </div>

      {loadState === 'loading' ? (
        <p className="mt-4 text-sm" role="status">{copy.loading}</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={copy.eyebrow}>
          {currentSubjects.map((subject) => (
            <li key={subject.landscapeId} className="max-w-full">
              <button
                type="button"
                onClick={() => onSelectSubject(subject.landscapeId)}
                disabled={activationState === 'saving'}
                className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-left hover:ring-2 hover:ring-sky-200 disabled:opacity-50 ${statusClassName(subject.status)} ${subject.landscapeId === classSession.landscapeId ? 'ring-2 ring-sky-400 ring-offset-1' : ''}`}
                aria-label={`${copy.edit}: ${subject.label}`}
                aria-pressed={subject.landscapeId === classSession.landscapeId}
              >
                <span className="min-w-0"><span className="block text-sm font-semibold">{subject.label}</span><span className="block text-xs">{copy.status[subject.status]}</span></span>
                <Pencil size={14} className="shrink-0" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs leading-5 text-text-secondary">{copy.localOnly}{loadState === 'ready' && !followLearningPlans && currentSubjects.some((subject) => subject.serverPlan) ? ` · ${copy.paused}` : ''}</p>

      {explanation && loadState !== 'loading' && (
        <p id="trainer-learning-plan-activation-explanation" className="mt-3 flex items-start gap-2 text-sm leading-6" role={hasUnavailableState ? 'alert' : undefined}>
          <AlertTriangle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
          {explanation}
        </p>
      )}

      {confirmation && snapshotIsCurrent && confirmation.context === context && confirmation.asOf === berlinDateKey() && (
        <div className="mt-5 rounded-xl border border-violet-400 bg-white p-4 text-text-primary dark:bg-slate-950" data-testid="trainer-learning-plan-activation-confirmation">
          <h3 ref={confirmationHeadingRef} tabIndex={-1} className="font-semibold outline-none">{copy.confirmTitle}</h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{copy.confirmBody}</p>
          <div className="mt-4"><TrainerLearningPlanPreviewSummary preview={confirmation.preview} subjects={confirmation.subjects} language={language} compact /></div>
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
