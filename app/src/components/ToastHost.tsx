import React from 'react'

import type { ToastState } from '../hooks/useToast'

type ToastHostProps = {
  toast: ToastState
}

export const ToastHost: React.FC<ToastHostProps> = ({ toast }) => {
  if (!toast) return null

  const toneClasses =
    toast.kind === 'success'
      ? 'border-emerald-300 bg-emerald-50/95 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/85 dark:text-emerald-100'
      : toast.kind === 'error'
        ? 'border-rose-300 bg-rose-50/95 text-rose-900 dark:border-rose-700 dark:bg-rose-950/85 dark:text-rose-100'
        : 'border-sky-300 bg-sky-50/95 text-sky-900 dark:border-sky-700 dark:bg-sky-950/85 dark:text-sky-100'

  return (
    <div className="fixed right-4 top-4 z-[100] pointer-events-none">
      <div
        className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur text-sm ${toneClasses}`}
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
    </div>
  )
}
