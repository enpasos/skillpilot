import React from 'react'
import { Eye, EyeOff, LockKeyhole, X } from 'lucide-react'

import {
  isValidTrainerClassFilePassword,
  MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH,
} from '../utils/trainerClassFile'

export interface TrainerClassFilePasswordDialogCopy {
  exportTitle: string
  exportDescription: string
  importTitle: string
  importDescription: string
  passwordLabel: string
  confirmPasswordLabel: string
  passwordHint: string
  passwordNotRecoverable: string
  showPassword: string
  hidePassword: string
  passwordTooShort: string
  passwordsMismatch: string
  cancel: string
  exportAction: string
  importAction: string
  encrypting: string
  decrypting: string
  close: string
}

interface TrainerClassFilePasswordDialogProps {
  isOpen: boolean
  mode: 'export' | 'import'
  fileName?: string
  busy: boolean
  error: string
  copy: TrainerClassFilePasswordDialogCopy
  onClose: () => void
  onClearError: () => void
  onSubmit: (password: string) => void
}

export const TrainerClassFilePasswordDialog: React.FC<
  TrainerClassFilePasswordDialogProps
> = ({
  isOpen,
  mode,
  fileName,
  busy,
  error,
  copy,
  onClose,
  onClearError,
  onSubmit,
}) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)
  const [password, setPassword] = React.useState('')
  const [confirmation, setConfirmation] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  const [validationError, setValidationError] = React.useState('')

  React.useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen && !dialog.open) {
      dialog.showModal()
      window.requestAnimationFrame(() => passwordRef.current?.focus())
    } else if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  React.useEffect(() => {
    setPassword('')
    setConfirmation('')
    setShowPassword(false)
    setValidationError('')
  }, [fileName, isOpen, mode])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isValidTrainerClassFilePassword(password)) {
      setValidationError(copy.passwordTooShort)
      passwordRef.current?.focus()
      return
    }
    if (mode === 'export' && password !== confirmation) {
      setValidationError(copy.passwordsMismatch)
      return
    }
    setValidationError('')
    onSubmit(password)
  }

  const visibleError = validationError || error
  const description = mode === 'export'
    ? copy.exportDescription
    : copy.importDescription.replace('{{fileName}}', fileName || '')

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="trainerClassFileDialogTitle"
      aria-describedby="trainerClassFileDialogDescription"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border-color bg-sidebar-bg p-0 text-text-primary shadow-2xl backdrop:bg-black/60"
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onClose()
      }}
      onClose={() => {
        if (isOpen && !busy) onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose()
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-start justify-between gap-4 border-b border-border-color px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-full bg-sky-100 p-2 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">
              <LockKeyhole size={18} />
            </span>
            <div>
              <h2 id="trainerClassFileDialogTitle" className="text-lg font-semibold">
                {mode === 'export' ? copy.exportTitle : copy.importTitle}
              </h2>
              <p
                id="trainerClassFileDialogDescription"
                className="mt-1 text-sm leading-relaxed text-text-secondary"
              >
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full p-1.5 text-text-secondary transition-colors hover:bg-slate-200 hover:text-text-primary disabled:opacity-50 dark:hover:bg-slate-800"
            title={copy.close}
            aria-label={copy.close}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label htmlFor="trainerClassFilePassword" className="text-sm font-semibold">
              {copy.passwordLabel}
            </label>
            <div className="mt-1 flex gap-2">
              <input
                ref={passwordRef}
                id="trainerClassFilePassword"
                name="trainer-class-file-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value)
                  setValidationError('')
                  onClearError()
                }}
                disabled={busy}
                minLength={MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH}
                maxLength={256}
                autoComplete={mode === 'export' ? 'new-password' : 'off'}
                aria-invalid={visibleError ? true : undefined}
                aria-describedby={visibleError ? 'trainerClassFileDialogError' : 'trainerClassFilePasswordHint'}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-border-color bg-input-bg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(current => !current)}
                disabled={busy}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border-color text-text-secondary transition-colors hover:border-sky-400 hover:text-text-primary disabled:opacity-50"
                title={showPassword ? copy.hidePassword : copy.showPassword}
                aria-label={showPassword ? copy.hidePassword : copy.showPassword}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <p id="trainerClassFilePasswordHint" className="mt-1 text-xs text-text-secondary">
              {copy.passwordHint}
            </p>
          </div>

          {mode === 'export' && (
            <div>
              <label htmlFor="trainerClassFilePasswordConfirmation" className="text-sm font-semibold">
                {copy.confirmPasswordLabel}
              </label>
              <input
                id="trainerClassFilePasswordConfirmation"
                name="trainer-class-file-password-confirmation"
                type={showPassword ? 'text' : 'password'}
                value={confirmation}
                onChange={(event) => {
                  setConfirmation(event.target.value)
                  setValidationError('')
                  onClearError()
                }}
                disabled={busy}
                minLength={MIN_TRAINER_CLASS_FILE_PASSWORD_LENGTH}
                maxLength={256}
                autoComplete="new-password"
                aria-invalid={visibleError ? true : undefined}
                className="mt-1 min-h-11 w-full rounded-lg border border-border-color bg-input-bg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          )}

          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            {copy.passwordNotRecoverable}
          </p>

          {visibleError && (
            <p
              id="trainerClassFileDialogError"
              role="alert"
              className="text-sm font-semibold text-rose-600 dark:text-rose-300"
            >
              {visibleError}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border-color px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="min-h-10 rounded-full border border-border-color px-5 py-2 text-sm font-semibold text-text-secondary transition-colors hover:border-sky-400 hover:text-text-primary disabled:opacity-50"
          >
            {copy.cancel}
          </button>
          <button
            type="submit"
            disabled={busy}
            className="min-h-10 rounded-full border border-sky-500 bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-wait disabled:opacity-60"
          >
            {busy
              ? mode === 'export' ? copy.encrypting : copy.decrypting
              : mode === 'export' ? copy.exportAction : copy.importAction}
          </button>
        </div>
      </form>
    </dialog>
  )
}
