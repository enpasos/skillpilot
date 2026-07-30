import React from 'react'
import { AlertTriangle, Check, LoaderCircle, RotateCcw } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import type {
  PersonalizationOption,
  PersonalizationPlan,
} from '../hooks/usePersonalCurriculumEditor'
import { getPersonalizationOptionLabel } from '../utils/personalCurriculumOptionLabel'

export interface PersonalCurriculumEditorProps {
  plan: PersonalizationPlan | null
  loading: boolean
  busy?: boolean
  error: Error | null
  applyOption: (optionId: string) => Promise<unknown> | unknown
  restart: () => Promise<unknown> | unknown
  reload: () => Promise<unknown> | unknown
  onPlanChanged?: (plan: PersonalizationPlan | null) => void
  className?: string
}

const isSelectionPlan = (plan: PersonalizationPlan) => (
  plan.stage === 'SELECTION'
  || plan.stage === 'ROOT_FILTER'
  || plan.stage === 'DESCENDANT_FILTER'
)

const currentSelectedOptions = (plan: PersonalizationPlan): PersonalizationOption[] => {
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

export const PersonalCurriculumEditor: React.FC<PersonalCurriculumEditorProps> = ({
  plan,
  loading,
  busy = false,
  error,
  applyOption,
  restart,
  reload,
  onPlanChanged,
  className,
}) => {
  const { language } = useLanguage()
  const isEnglish = language === 'en'
  const copy = isEnglish
    ? {
        loading: 'Loading your curriculum choices…',
        loadError: 'Your curriculum choices could not be loaded.',
        retry: 'Try again',
        invalidTitle: 'This curriculum setup is currently unavailable.',
        invalidBody: 'No changes were made. Please retry or contact support if the problem persists.',
        completeTitle: 'Your personal curriculum is configured.',
        completeBody: 'You can change the selection explicitly at any time.',
        noChoicesBody: 'This base curriculum requires no additional permanent choices.',
        restart: 'Change selection',
        selected: 'Selected in this step',
        finish: 'Finish this selection',
        remaining: (count: number) => `${count} more selection${count === 1 ? '' : 's'} required`,
        optional: 'You can select more options or finish this step.',
        exact: (count: number) => `Select ${count}.`,
        range: (min: number, max: number) => `Select between ${min} and ${max}.`,
        progress: (selected: number, max: number) => `${selected} of ${max} selected`,
      }
    : {
        loading: 'Deine Lehrplanauswahl wird geladen…',
        loadError: 'Deine Lehrplanauswahl konnte nicht geladen werden.',
        retry: 'Erneut versuchen',
        invalidTitle: 'Diese Lehrplankonfiguration ist derzeit nicht verfügbar.',
        invalidBody: 'Es wurde nichts geändert. Versuche es erneut oder wende dich bei anhaltendem Problem an den Support.',
        completeTitle: 'Dein persönlicher Lehrplan ist eingerichtet.',
        completeBody: 'Du kannst die Auswahl jederzeit ausdrücklich ändern.',
        noChoicesBody: 'Für dieses Basiscurriculum sind keine weiteren dauerhaften Angaben erforderlich.',
        restart: 'Auswahl ändern',
        selected: 'In diesem Schritt ausgewählt',
        finish: 'Diese Auswahl abschließen',
        remaining: (count: number) => `${count} weitere Auswahl${count === 1 ? '' : 'en'} erforderlich`,
        optional: 'Du kannst weitere Optionen auswählen oder diesen Schritt abschließen.',
        exact: (count: number) => `Wähle ${count} Option${count === 1 ? '' : 'en'}.`,
        range: (min: number, max: number) => `Wähle zwischen ${min} und ${max} Optionen.`,
        progress: (selected: number, max: number) => `${selected} von ${max} ausgewählt`,
      }

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
      <div className={`rounded-xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20 ${className ?? ''}`}>
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check size={17} strokeWidth={3} />
          </span>
          <div>
            <h3 className="font-semibold text-emerald-950 dark:text-emerald-100">{copy.completeTitle}</h3>
            <p className="mt-1 text-sm text-emerald-900/75 dark:text-emerald-100/75">
              {plan.navigationOptions.length > 0 ? copy.completeBody : copy.noChoicesBody}
            </p>
            {plan.navigationOptions.length > 0 && (
              <button
                type="button"
                onClick={() => { void applyAndNotify(restart) }}
                disabled={busy}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
              >
                <RotateCcw size={15} className={busy ? 'animate-spin' : ''} />
                {copy.restart}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const selectedOptions = currentSelectedOptions(plan)
  const remainingRequired = Math.max(0, plan.minSelections - plan.selectedCount)
  const instruction = plan.minSelections === plan.maxSelections
    ? copy.exact(plan.minSelections)
    : copy.range(plan.minSelections, plan.maxSelections)

  return (
    <section className={`space-y-4 ${className ?? ''}`} aria-busy={busy || loading}>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
          {plan.stageLabel}
        </div>
        <h3 className="mt-1 text-lg font-semibold text-text-primary">{plan.groupLabel}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
          <span>{instruction}</span>
          <span aria-hidden="true">·</span>
          <span>{copy.progress(plan.selectedCount, plan.maxSelections)}</span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-input-bg" aria-hidden="true">
          <div
            className="h-full rounded-full bg-sky-500 transition-[width]"
            style={{
              width: `${plan.maxSelections === 0
                ? 100
                : Math.min(100, (plan.selectedCount / plan.maxSelections) * 100)}%`,
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
        </div>
      )}

      <p className="text-sm text-text-secondary">
        {remainingRequired > 0 ? copy.remaining(remainingRequired) : copy.optional}
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        {plan.options.map((option) => {
          const isCompletion = option.kind === 'COMPLETE_GROUP'
          const label = isCompletion
            ? copy.finish
            : getPersonalizationOptionLabel(option, language)
          return (
            <button
              key={option.optionId}
              type="button"
              onClick={() => {
                void applyAndNotify(() => applyOption(option.optionId))
              }}
              disabled={busy || loading || !label}
              className={isCompletion
                ? 'rounded-xl border border-sky-300 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-800 transition-colors hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200 dark:hover:bg-sky-900/40'
                : 'rounded-xl border border-border-color bg-input-bg/40 px-4 py-3 text-left text-sm font-medium text-text-primary transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-sky-950/30'}
            >
              {label}
            </button>
          )
        })}
      </div>

      {busy && (
        <div className="flex items-center gap-2 text-sm text-text-secondary" role="status">
          <LoaderCircle size={16} className="animate-spin" />
          <span>{copy.loading}</span>
        </div>
      )}

      <div className="border-t border-border-color pt-3">
        <button
          type="button"
          onClick={() => { void applyAndNotify(restart) }}
          disabled={busy || loading}
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:text-sky-400"
        >
          <RotateCcw size={14} />
          {copy.restart}
        </button>
      </div>
    </section>
  )
}
