import React from 'react'
import {
  AlertTriangle,
  Check,
  LoaderCircle,
  Pencil,
} from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import type {
  PersonalizationCompletedDecision,
  PersonalizationDecisionSummary,
  PersonalizationOption,
  PersonalizationPlan,
} from '../hooks/usePersonalCurriculumEditor'
import { orderedFocusCandidatesAfterSelection } from '../utils/personalCurriculumEditorFocus'
import { getPersonalizationOptionLabel } from '../utils/personalCurriculumOptionLabel'

export interface PersonalCurriculumEditorProps {
  plan: PersonalizationPlan | null
  loading: boolean
  busy?: boolean
  error: Error | null
  applyOption: (optionId: string) => Promise<unknown> | unknown
  reopen: () => Promise<unknown> | unknown
  rewind: (rewindId: string) => Promise<unknown> | unknown
  reload: () => Promise<unknown> | unknown
  onPlanChanged?: (plan: PersonalizationPlan | null) => void
  className?: string
}

const isSelectionPlan = (plan: PersonalizationPlan) => (
  plan.stage === 'SELECTION'
  || plan.stage === 'ROOT_FILTER'
  || plan.stage === 'DESCENDANT_FILTER'
)

const inferredCurrentSelectedOptions = (plan: PersonalizationPlan): PersonalizationOption[] => {
  if (!isSelectionPlan(plan) || !plan.groupInstanceId) return []
  const pendingIds = new Set(
    plan.options
      .filter((option) => option.kind !== 'COMPLETE_GROUP')
      .map((option) => option.optionId),
  )
  return plan.navigationOptions.filter((option) => (
    option.groupInstanceId === plan.groupInstanceId
    && option.kind !== 'COMPLETE_GROUP'
    && !pendingIds.has(option.optionId)
  ))
}

interface MutationFocusIntent {
  previousGroupInstanceId: string | null
  candidateOptionIds: string[]
  forceHeading: boolean
}

export const PersonalCurriculumEditor: React.FC<PersonalCurriculumEditorProps> = ({
  plan,
  loading,
  busy = false,
  error,
  applyOption,
  reopen,
  rewind,
  reload,
  onPlanChanged,
  className,
}) => {
  const { language } = useLanguage()
  const historyHeadingId = React.useId()
  const historyHintId = React.useId()
  const preservedHeadingId = React.useId()
  const questionHeadingRef = React.useRef<HTMLHeadingElement>(null)
  const completionHeadingRef = React.useRef<HTMLHeadingElement>(null)
  const optionButtonRefs = React.useRef(new Map<string, HTMLButtonElement>())
  const focusAfterMutation = React.useRef<MutationFocusIntent | null>(null)
  const isEnglish = language === 'en'
  const copy = isEnglish
    ? {
        loading: 'Loading your curriculum choices…',
        loadError: 'Your curriculum choices could not be loaded.',
        retry: 'Try again',
        invalidTitle: 'This curriculum setup is currently unavailable.',
        invalidBody: 'No changes were made. Please retry or contact support if the problem persists.',
        completeTitle: 'Your personal curriculum is configured.',
        completeBody: 'You can change individual choices at any time.',
        noChoicesBody: 'This base curriculum requires no additional permanent choices.',
        reopen: 'Review and change choices',
        historyTitle: 'Selected so far',
        historyHint: 'Change an earlier step without starting over. That step and any dependent later choices will be asked again.',
        change: 'Change',
        none: 'No selection',
        changeAria: (label: string, value: string) => `Change ${label}, currently ${value}`,
        preservedTitle: 'Still selected',
        preservedHint: 'These independent choices stay selected and will not be asked again.',
        migratedTitle: 'Currently selected',
        migratedHint: 'These choices are currently saved. Dependent choices may be asked again after a change.',
        selected: 'Selected in this step',
        resetCurrent: 'Reset this step’s selection',
        finish: 'Finish this selection',
        remaining: (count: number) => `${count} more selection${count === 1 ? '' : 's'} required`,
        optional: 'You can select more options or finish this step.',
        exact: (count: number) => `Select ${count}.`,
        range: (min: number, max: number) => `Select between ${min} and ${max}.`,
        progress: (selected: number, max: number) => `${selected} of ${max} selected`,
        availability: (available: number, total: number) => `${available} of ${total} options available`,
        unavailableTitle: 'More subjects',
        unavailable: 'Not yet available for your selection',
      }
    : {
        loading: 'Deine Lehrplanauswahl wird geladen…',
        loadError: 'Deine Lehrplanauswahl konnte nicht geladen werden.',
        retry: 'Erneut versuchen',
        invalidTitle: 'Diese Lehrplankonfiguration ist derzeit nicht verfügbar.',
        invalidBody: 'Es wurde nichts geändert. Versuche es erneut oder wende dich bei anhaltendem Problem an den Support.',
        completeTitle: 'Dein persönlicher Lehrplan ist eingerichtet.',
        completeBody: 'Du kannst einzelne Angaben jederzeit ändern.',
        noChoicesBody: 'Für dieses Basiscurriculum sind keine weiteren dauerhaften Angaben erforderlich.',
        reopen: 'Auswahl prüfen und ändern',
        historyTitle: 'Bisher ausgewählt',
        historyHint: 'Ändere einen früheren Schritt, ohne von vorn anzufangen. Dieser und davon abhängige spätere Angaben werden dann erneut abgefragt.',
        change: 'Ändern',
        none: 'Keine Auswahl',
        changeAria: (label: string, value: string) => `${label} ändern, derzeit ${value}`,
        preservedTitle: 'Bleibt ausgewählt',
        preservedHint: 'Diese unabhängigen Angaben bleiben erhalten und werden nicht erneut abgefragt.',
        migratedTitle: 'Aktuell ausgewählt',
        migratedHint: 'Diese Angaben sind derzeit gespeichert. Abhängige Angaben können nach einer Änderung erneut abgefragt werden.',
        selected: 'In diesem Schritt ausgewählt',
        resetCurrent: 'Auswahl dieses Schritts zurücksetzen',
        finish: 'Diese Auswahl abschließen',
        remaining: (count: number) => `${count} weitere Auswahl${count === 1 ? '' : 'en'} erforderlich`,
        optional: 'Du kannst weitere Optionen auswählen oder diesen Schritt abschließen.',
        exact: (count: number) => `Wähle ${count} Option${count === 1 ? '' : 'en'}.`,
        range: (min: number, max: number) => `Wähle zwischen ${min} und ${max} Optionen.`,
        progress: (selected: number, max: number) => `${selected} von ${max} ausgewählt`,
        availability: (available: number, total: number) => `${available} von ${total} Optionen verfügbar`,
        unavailableTitle: 'Weitere Fächer',
        unavailable: 'Für deine Auswahl noch nicht verfügbar',
      }

  React.useEffect(() => {
    const focusIntent = focusAfterMutation.current
    if (!focusIntent || !plan) {
      return
    }
    if (plan.stage === 'COMPLETE') {
      focusAfterMutation.current = null
      completionHeadingRef.current?.focus()
      return
    }
    if (!isSelectionPlan(plan)) return
    focusAfterMutation.current = null
    const staysInSameGroup = (
      !focusIntent.forceHeading
      && focusIntent.previousGroupInstanceId === plan.groupInstanceId
    )
    if (staysInSameGroup) {
      const nextButton = focusIntent.candidateOptionIds
        .map((optionId) => optionButtonRefs.current.get(optionId))
        .find((button) => button && !button.disabled)
      if (nextButton) {
        nextButton.focus({ preventScroll: true })
        return
      }
    }
    questionHeadingRef.current?.focus({ preventScroll: staysInSameGroup })
  }, [plan])

  const applyAndNotify = async (
    action: () => Promise<unknown> | unknown,
  ) => {
    const nextPlan = await action()
    if (
      nextPlan
      && typeof nextPlan === 'object'
      && 'stage' in nextPlan
    ) {
      onPlanChanged?.(nextPlan as PersonalizationPlan)
    }
    return nextPlan
  }

  const handleSelectionMutation = async (
    action: () => Promise<unknown> | unknown,
    focusIntent: MutationFocusIntent,
  ) => {
    focusAfterMutation.current = focusIntent
    try {
      const nextPlan = await applyAndNotify(action)
      if (
        !nextPlan
        || typeof nextPlan !== 'object'
        || !('stage' in nextPlan)
        || (
          (nextPlan as PersonalizationPlan).stage !== 'COMPLETE'
          && !isSelectionPlan(nextPlan as PersonalizationPlan)
        )
      ) {
        focusAfterMutation.current = null
      }
    } catch (mutationError) {
      focusAfterMutation.current = null
      throw mutationError
    }
  }

  const handleRewind = async (rewindId: string) => (
    handleSelectionMutation(
      () => rewind(rewindId),
      {
        previousGroupInstanceId: plan?.groupInstanceId ?? null,
        candidateOptionIds: [],
        forceHeading: true,
      },
    )
  )

  const handleOptionMutation = async (optionId: string) => (
    handleSelectionMutation(
      () => applyOption(optionId),
      {
        previousGroupInstanceId: plan?.groupInstanceId ?? null,
        candidateOptionIds: orderedFocusCandidatesAfterSelection(
          plan?.options ?? [],
          optionId,
        ),
        forceHeading: false,
      },
    )
  )

  const renderHistory = (
    decisions: PersonalizationCompletedDecision[],
  ) => {
    if (decisions.length === 0) return null
    return (
      <section
        className="rounded-xl border border-border-color bg-input-bg/30 p-4"
        aria-labelledby={historyHeadingId}
      >
        <h3
          id={historyHeadingId}
          className="text-sm font-semibold text-text-primary"
        >
          {copy.historyTitle}
        </h3>
        <p
          id={historyHintId}
          className="mt-1 text-xs leading-relaxed text-text-secondary"
        >
          {copy.historyHint}
        </p>
        <ol className="mt-3 divide-y divide-border-color">
          {decisions.map((decision) => {
            const labels = decision.selectedOptions
              .map((option) => getPersonalizationOptionLabel(option, language))
              .filter(Boolean)
            const value = labels.length > 0 ? labels.join(', ') : copy.none
            const label = decision.stageLabel ?? decision.groupLabel ?? copy.historyTitle
            return (
              <li
                key={decision.rewindId}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    <Check size={14} className="shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                  <p className="mt-1 break-words text-sm font-medium text-text-primary">
                    {value}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { void handleRewind(decision.rewindId) }}
                  disabled={busy || loading}
                  aria-label={copy.changeAria(label, value)}
                  aria-describedby={historyHintId}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950/30 dark:hover:text-sky-300 sm:self-center"
                >
                  <Pencil size={14} aria-hidden="true" />
                  {copy.change}
                </button>
              </li>
            )
          })}
        </ol>
      </section>
    )
  }

  const renderPreservedDecisions = (
    decisions: PersonalizationDecisionSummary[],
    migratedReview = false,
  ) => {
    if (decisions.length === 0) return null
    return (
      <section
        className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/20"
        aria-labelledby={preservedHeadingId}
      >
        <h3
          id={preservedHeadingId}
          className="text-sm font-semibold text-text-primary"
        >
          {migratedReview ? copy.migratedTitle : copy.preservedTitle}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">
          {migratedReview ? copy.migratedHint : copy.preservedHint}
        </p>
        <ul className="mt-3 space-y-3">
          {decisions.map((decision) => {
            const labels = decision.selectedOptions
              .map((option) => getPersonalizationOptionLabel(option, language))
              .filter(Boolean)
            const value = labels.length > 0 ? labels.join(', ') : copy.none
            const label = decision.stageLabel ?? decision.groupLabel ?? copy.preservedTitle
            return (
              <li
                key={`${decision.groupId ?? ''}:${decision.groupInstanceId ?? ''}`}
                className="flex items-start gap-2"
              >
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    {label}
                  </div>
                  <p className="mt-1 break-words text-sm font-medium text-text-primary">
                    {value}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    )
  }

  if (loading && !plan) {
    return (
      <div className={`flex min-h-40 items-center justify-center gap-2 text-sm text-text-secondary ${className ?? ''}`}>
        <LoaderCircle size={18} className="animate-spin" />
        <span>{copy.loading}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/20 ${className ?? ''}`} role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-600 dark:text-red-400" />
          <div className="min-w-0">
            <h3 className="font-semibold text-red-900 dark:text-red-200">{copy.loadError}</h3>
            <p className="mt-1 break-words text-sm text-red-800/80 dark:text-red-200/80">{error.message}</p>
            <button
              type="button"
              onClick={() => { void applyAndNotify(reload) }}
              disabled={busy || loading}
              className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-900/40"
            >
              {copy.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!plan || plan.stage === 'INVALID') {
    return (
      <div className={`rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20 ${className ?? ''}`} role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">{copy.invalidTitle}</h3>
            <p className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/80">{copy.invalidBody}</p>
            {plan?.problemCode && (
              <p className="mt-2 font-mono text-xs text-amber-700 dark:text-amber-300">{plan.problemCode}</p>
            )}
            <button
              type="button"
              onClick={() => { void applyAndNotify(reload) }}
              disabled={busy || loading}
              className="mt-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-900/40"
            >
              {copy.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (plan.stage === 'COMPLETE') {
    return (
      <section
        className={`space-y-4 ${className ?? ''}`}
        aria-busy={busy || loading}
      >
        <div
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Check size={17} strokeWidth={3} aria-hidden="true" />
            </span>
            <div>
              <h3
                ref={completionHeadingRef}
                tabIndex={-1}
                className="font-semibold text-emerald-950 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:text-emerald-100"
              >
                {copy.completeTitle}
              </h3>
              <p className="mt-1 text-sm text-emerald-900/75 dark:text-emerald-100/75">
                {plan.completedDecisions.length > 0
                  || plan.canReopenMigratedPersonalization
                  ? copy.completeBody
                  : copy.noChoicesBody}
              </p>
            </div>
          </div>
        </div>
        {renderHistory(plan.completedDecisions)}
        {renderPreservedDecisions(
          plan.preservedDecisions,
          plan.canReopenMigratedPersonalization,
        )}
        {plan.canReopenMigratedPersonalization && (
          <div>
            <button
              type="button"
              onClick={() => {
                void handleSelectionMutation(
                  reopen,
                  {
                    previousGroupInstanceId: plan.groupInstanceId,
                    candidateOptionIds: [],
                    forceHeading: true,
                  },
                )
              }}
              disabled={busy || loading}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-secondary hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950/30 dark:hover:text-sky-300"
            >
              <Pencil size={15} aria-hidden="true" />
              {copy.reopen}
            </button>
          </div>
        )}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-text-secondary" role="status">
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
            <span>{copy.loading}</span>
          </div>
        )}
      </section>
    )
  }

  const selectedOptions = plan.currentSelectedOptions.length > 0
    ? plan.currentSelectedOptions
    : inferredCurrentSelectedOptions(plan)
  const selectedOptionIds = new Set(
    selectedOptions.map((option) => option.optionId),
  )
  const actionOptions = plan.options.filter(
    (option) => option.kind !== 'COMPLETE_GROUP',
  )
  const actionOptionIds = new Set(
    actionOptions.map((option) => option.optionId),
  )
  const authoredDisplayOptions = plan.displayOptions.length > 0
    ? plan.displayOptions
    : actionOptions
  const displayOptions = authoredDisplayOptions.filter(
    (option) => (
      option.kind !== 'COMPLETE_GROUP'
      && !selectedOptionIds.has(option.optionId)
    ),
  )
  const availableDisplayOptions = displayOptions.filter(
    (option) => actionOptionIds.has(option.optionId),
  )
  const unavailableDisplayOptions = displayOptions.filter(
    (option) => !actionOptionIds.has(option.optionId),
  )
  const totalOptionCount = new Set([
    ...authoredDisplayOptions.map((option) => option.optionId),
    ...selectedOptionIds,
  ]).size
  const availableOptionCount = new Set([
    ...actionOptionIds,
    ...selectedOptionIds,
  ]).size
  const effectiveMaxSelections = Math.min(
    plan.maxSelections,
    availableOptionCount,
  )
  const remainingRequired = Math.max(0, plan.minSelections - plan.selectedCount)
  const instruction = plan.minSelections === effectiveMaxSelections
    ? copy.exact(plan.minSelections)
    : copy.range(plan.minSelections, effectiveMaxSelections)

  return (
    <section className={`space-y-4 ${className ?? ''}`} aria-busy={busy || loading}>
      {renderHistory(plan.completedDecisions)}
      {renderPreservedDecisions(plan.preservedDecisions)}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {plan.stageLabel}
        </div>
        <h3
          ref={questionHeadingRef}
          tabIndex={-1}
          className="mt-1 text-lg font-semibold text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
        >
          {plan.groupLabel}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{instruction}</span>
          <span aria-hidden="true">·</span>
          <span>{copy.progress(plan.selectedCount, effectiveMaxSelections)}</span>
          {availableOptionCount < totalOptionCount && (
            <>
              <span aria-hidden="true">·</span>
              <span>{copy.availability(availableOptionCount, totalOptionCount)}</span>
            </>
          )}
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-input-bg" aria-hidden="true">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width]"
            style={{
              width: `${effectiveMaxSelections === 0
                ? 100
                : Math.min(100, (plan.selectedCount / effectiveMaxSelections) * 100)}%`,
            }}
          />
        </div>
      </div>

      {selectedOptions.length > 0 && (
        <div className="rounded-lg border border-border-color bg-input-bg/40 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{copy.selected}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <span
                key={option.optionId}
                className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-sm text-sky-800 dark:bg-sky-900/40 dark:text-sky-200"
              >
                <Check size={13} />
                {getPersonalizationOptionLabel(option, language)}
              </span>
            ))}
          </div>
          {plan.currentRewindId && (
            <button
              type="button"
              onClick={() => { void handleRewind(plan.currentRewindId ?? '') }}
              disabled={busy || loading}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border-color bg-white px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-sky-400 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-950/30 dark:hover:text-sky-300"
            >
              <Pencil size={14} aria-hidden="true" />
              {copy.resetCurrent}
            </button>
          )}
        </div>
      )}

      <p className="text-sm text-text-secondary">
        {remainingRequired > 0 ? copy.remaining(remainingRequired) : copy.optional}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {availableDisplayOptions.map((option) => {
          const label = getPersonalizationOptionLabel(option, language)
          return (
            <button
              key={option.optionId}
              ref={(button) => {
                if (button) {
                  optionButtonRefs.current.set(option.optionId, button)
                } else {
                  optionButtonRefs.current.delete(option.optionId)
                }
              }}
              type="button"
              onClick={() => {
                void handleOptionMutation(option.optionId)
              }}
              disabled={busy || loading || !label}
              className="rounded-xl border border-border-color bg-input-bg/40 px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-sky-950/30"
            >
              {label}
            </button>
          )
        })}
        {plan.options
          .filter((option) => option.kind === 'COMPLETE_GROUP')
          .map((option) => (
            <button
              key={option.optionId}
              ref={(button) => {
                if (button) {
                  optionButtonRefs.current.set(option.optionId, button)
                } else {
                  optionButtonRefs.current.delete(option.optionId)
                }
              }}
              type="button"
              onClick={() => {
                void handleOptionMutation(option.optionId)
              }}
              disabled={busy || loading}
              className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200 dark:hover:bg-sky-900/40"
            >
              {copy.finish}
            </button>
          ))}
      </div>

      {unavailableDisplayOptions.length > 0 && (
        <section>
          <h4 className="text-sm font-semibold text-text-primary">
            {copy.unavailableTitle}
          </h4>
          <p className="mt-1 text-xs text-text-secondary">
            {copy.unavailable}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {unavailableDisplayOptions.map((option) => {
              const label = getPersonalizationOptionLabel(option, language)
              return (
                <button
                  key={option.optionId}
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-xl border border-border-color bg-slate-100/70 px-4 py-3 text-left text-sm font-medium text-text-secondary opacity-80 dark:bg-slate-900/40"
                >
                  {label}
                  <span className="sr-only">. {copy.unavailable}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {busy && (
        <div className="flex items-center gap-2 text-sm text-text-secondary" role="status">
          <LoaderCircle size={16} className="animate-spin" />
          <span>{copy.loading}</span>
        </div>
      )}

    </section>
  )
}
