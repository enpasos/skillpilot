import { useCallback, useEffect, useState } from 'react'

export type ToastKind = 'success' | 'error' | 'info'

export type ToastState = {
  kind: ToastKind
  message: string
} | null

type UseToastOptions = {
  durationMs?: number
}

const PENDING_TOAST_STORAGE_KEY = 'skillpilot_pending_toast'

export const queueToastForNextLoad = (kind: ToastKind, message: string) => {
  try {
    sessionStorage.setItem(
      PENDING_TOAST_STORAGE_KEY,
      JSON.stringify({ kind, message }),
    )
  } catch {
    // Ignore storage failures; the current action can still proceed.
  }
}

export const consumeQueuedToast = (): ToastState => {
  try {
    const raw = sessionStorage.getItem(PENDING_TOAST_STORAGE_KEY)
    if (!raw) return null
    sessionStorage.removeItem(PENDING_TOAST_STORAGE_KEY)
    const parsed = JSON.parse(raw) as Partial<Exclude<ToastState, null>>
    if (
      (parsed.kind === 'success' || parsed.kind === 'error' || parsed.kind === 'info')
      && typeof parsed.message === 'string'
      && parsed.message.trim().length > 0
    ) {
      return {
        kind: parsed.kind,
        message: parsed.message,
      }
    }
  } catch {
    // Ignore malformed or inaccessible persisted toast state.
  }
  return null
}

export const useToast = ({ durationMs = 2400 }: UseToastOptions = {}) => {
  const [toast, setToast] = useState<ToastState>(null)

  useEffect(() => {
    if (!toast) return
    const timeoutId = window.setTimeout(() => setToast(null), durationMs)
    return () => window.clearTimeout(timeoutId)
  }, [durationMs, toast])

  const showToast = useCallback((kind: ToastKind, message: string) => {
    setToast({ kind, message })
  }, [])

  const clearToast = useCallback(() => {
    setToast(null)
  }, [])

  return {
    toast,
    showToast,
    clearToast,
  }
}
