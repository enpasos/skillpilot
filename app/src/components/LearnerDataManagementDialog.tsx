import React from 'react'
import { AlertTriangle, Database, Download, Trash2, Upload, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import type { LearnerRetentionStatus } from '../utils/learnerDataManagement'
import { getLearnerDataManagementCopy } from '../utils/learnerDataManagementCopy'

interface LearnerDataManagementDialogProps {
  isOpen: boolean
  skillpilotId: string
  retention: LearnerRetentionStatus | null
  retentionLoading: boolean
  retentionError: 'missing' | 'failed' | null
  deleteBusy: boolean
  deleteError: 'missing' | 'failed' | null
  onClose: () => void
  onExport: () => void
  onImportFileChange: React.ChangeEventHandler<HTMLInputElement>
  onDelete: () => void
  showTransferActions?: boolean
}

const formatInstant = (value: string, language: 'de' | 'en') => {
  const locale = language === 'de' ? 'de-DE' : 'en-GB'
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const LearnerDataManagementDialog: React.FC<
  LearnerDataManagementDialogProps
> = ({
  isOpen,
  skillpilotId,
  retention,
  retentionLoading,
  retentionError,
  deleteBusy,
  deleteError,
  onClose,
  onExport,
  onImportFileChange,
  onDelete,
  showTransferActions = true,
}) => {
  const { language } = useLanguage()
  const localizedLanguage = language === 'en' ? 'en' : 'de'
  const copy = getLearnerDataManagementCopy(localizedLanguage)
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const initialDeleteActionRef = React.useRef<HTMLButtonElement>(null)
  const confirmCheckboxRef = React.useRef<HTMLInputElement>(null)
  const importFileInputRef = React.useRef<HTMLInputElement>(null)
  const [view, setView] = React.useState<'overview' | 'confirm-delete'>('overview')
  const [deleteConfirmed, setDeleteConfirmed] = React.useState(false)

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) dialog.showModal()
    else if (!isOpen && dialog.open) dialog.close()
  }, [isOpen])

  React.useEffect(() => {
    if (!isOpen) {
      setView('overview')
      setDeleteConfirmed(false)
    }
  }, [isOpen])

  React.useEffect(() => {
    if (view !== 'confirm-delete') return
    window.requestAnimationFrame(() => confirmCheckboxRef.current?.focus())
  }, [view])

  const close = () => {
    if (!deleteBusy) onClose()
  }

  const returnToOverview = () => {
    if (deleteBusy) return
    setView('overview')
    setDeleteConfirmed(false)
    window.requestAnimationFrame(() => initialDeleteActionRef.current?.focus())
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="learnerDataManagementTitle"
      aria-describedby="learnerDataManagementDescription"
      className="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl border border-border-color bg-sidebar-bg p-0 text-text-primary shadow-2xl backdrop:bg-black/60"
      onCancel={(event) => {
        event.preventDefault()
        if (view === 'confirm-delete') returnToOverview()
        else close()
      }}
      onClose={() => {
        if (isOpen && !deleteBusy) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !deleteBusy && view === 'overview') close()
      }}
    >
      <div className="flex max-h-[90vh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-border-color px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <span className={`mt-0.5 rounded-full p-2 ${view === 'confirm-delete' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-200' : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'}`}>
              {view === 'confirm-delete' ? <AlertTriangle size={19} /> : <Database size={19} />}
            </span>
            <div className="min-w-0">
              <h2 id="learnerDataManagementTitle" className="text-lg font-semibold">
                {view === 'confirm-delete' ? copy.confirmTitle : copy.title}
              </h2>
              <p
                id="learnerDataManagementDescription"
                className="mt-1 text-sm leading-relaxed text-text-secondary"
              >
                {view === 'confirm-delete' ? copy.confirmDescription : copy.description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={view === 'confirm-delete' ? returnToOverview : close}
            disabled={deleteBusy}
            title={copy.closeAction}
            aria-label={copy.closeAction}
            className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-slate-200 hover:text-text-primary disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </header>

        {view === 'overview' ? (
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <section aria-labelledby="learnerDataIdentityTitle" className="rounded-xl border border-border-color bg-input-bg/40 p-4">
              <h3 id="learnerDataIdentityTitle" className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                {copy.idLabel}
              </h3>
              <code className="mt-2 block break-all text-sm text-text-primary">{skillpilotId}</code>
            </section>

            <section aria-labelledby="learnerRetentionTitle" className="rounded-xl border border-sky-200 bg-sky-50/60 p-4 dark:border-sky-900/60 dark:bg-sky-950/20">
              <h3 id="learnerRetentionTitle" className="font-semibold text-text-primary">
                {copy.retentionTitle}
              </h3>
              {retentionLoading ? (
                <p role="status" className="mt-2 text-sm text-text-secondary">{copy.retentionLoading}</p>
              ) : retentionError ? (
                <p role="alert" className="mt-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                  {retentionError === 'missing' ? copy.missingLearner : copy.retentionFailed}
                </p>
              ) : retention ? (
                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs font-semibold text-text-secondary">{copy.lastActivityLabel}</dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">
                      <time dateTime={retention.lastActivityAt}>
                        {formatInstant(retention.lastActivityAt, localizedLanguage)}
                      </time>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold text-text-secondary">{copy.scheduledDeletionLabel}</dt>
                    <dd className="mt-1 text-sm font-medium text-text-primary">
                      <time dateTime={retention.scheduledDeletionAt}>
                        {formatInstant(retention.scheduledDeletionAt, localizedLanguage)}
                      </time>
                    </dd>
                  </div>
                </dl>
              ) : null}
              <p className="mt-3 text-xs leading-relaxed text-text-secondary">
                {copy.retentionExplanation}
              </p>
            </section>

            {showTransferActions && (
              <div className="grid gap-3 sm:grid-cols-2">
                <section className="rounded-xl border border-border-color p-4">
                  <h3 className="font-semibold text-text-primary">{copy.exportTitle}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{copy.exportDescription}</p>
                  <button
                    type="button"
                    onClick={onExport}
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 dark:text-sky-200 dark:hover:bg-sky-950/30"
                  >
                    <Download size={16} />
                    {copy.exportAction}
                  </button>
                </section>
                <section className="rounded-xl border border-border-color p-4">
                  <h3 className="font-semibold text-text-primary">{copy.importTitle}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-secondary">{copy.importDescription}</p>
                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-400 px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 dark:text-sky-200 dark:hover:bg-sky-950/30"
                  >
                    <Upload size={16} />
                    {copy.importAction}
                  </button>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    onChange={onImportFileChange}
                    className="hidden"
                    accept=".json,application/json"
                  />
                </section>
              </div>
            )}

            <section className="rounded-xl border border-rose-300 bg-rose-50/70 p-4 dark:border-rose-900/70 dark:bg-rose-950/20">
              <h3 className="font-semibold text-rose-900 dark:text-rose-100">{copy.dangerTitle}</h3>
              <p className="mt-1 text-sm leading-relaxed text-rose-800 dark:text-rose-200">
                {copy.dangerDescription}
              </p>
              <button
                ref={initialDeleteActionRef}
                type="button"
                onClick={() => {
                  setDeleteConfirmed(false)
                  setView('confirm-delete')
                }}
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-rose-600 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:text-rose-200 dark:hover:bg-rose-950/50"
              >
                <Trash2 size={16} />
                {copy.beginDeleteAction}
              </button>
            </section>
          </div>
        ) : (
          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div className="space-y-3 rounded-xl border border-rose-300 bg-rose-50/70 p-4 text-sm leading-relaxed text-rose-950 dark:border-rose-900/70 dark:bg-rose-950/20 dark:text-rose-100">
              <p>{copy.confirmServerData}</p>
              <p>{copy.confirmExternalData}</p>
              <p className="font-semibold">{copy.confirmBackupHint}</p>
              {showTransferActions && (
                <button
                  type="button"
                  onClick={onExport}
                  disabled={deleteBusy}
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-sky-500 bg-white px-4 py-2 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-50 disabled:opacity-50 dark:bg-slate-900 dark:text-sky-200 dark:hover:bg-sky-950/30"
                >
                  <Download size={16} />
                  {copy.exportAction}
                </button>
              )}
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-rose-300 p-4 text-sm font-semibold text-text-primary dark:border-rose-900/70">
              <input
                ref={confirmCheckboxRef}
                type="checkbox"
                checked={deleteConfirmed}
                onChange={event => setDeleteConfirmed(event.target.checked)}
                disabled={deleteBusy}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-rose-400 accent-rose-600"
              />
              <span>{copy.confirmCheckbox}</span>
            </label>

            {deleteError && (
              <p role="alert" className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                {deleteError === 'missing' ? copy.deleteMissing : copy.deleteFailed}
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={returnToOverview}
                disabled={deleteBusy}
                className="min-h-10 rounded-full border border-border-color px-5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-sky-400 hover:text-text-primary disabled:opacity-50"
              >
                {copy.cancelDeleteAction}
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={!deleteConfirmed || deleteBusy}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-rose-700 bg-rose-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:border-slate-700 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
              >
                <Trash2 size={16} />
                {deleteBusy ? copy.deletingAction : copy.finalDeleteAction}
              </button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  )
}
