const MODULE_RELOAD_ATTEMPT_KEY = 'skillpilot_module_reload_attempted_at'
const MODULE_RELOAD_RETRY_AFTER_MS = 60_000

const MODULE_LOAD_ERROR_PATTERNS = [
  'error loading dynamically imported module',
  'failed to fetch dynamically imported module',
  'importing a module script failed',
  'outdated optimize dep',
  'ns_error_corrupted_content',
  'blocked due mime type',
  'nicht freigegebenen mime-typs',
  'laden fehlgeschlagen fuer das modul',
  'laden fehlgeschlagen für das modul',
]

const errorText = (value: unknown): string => {
  if (typeof value === 'string') return value
  if (value instanceof Error) return `${value.name} ${value.message} ${value.stack ?? ''}`
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>
    return [record.message, record.reason, record.error, record.type, record.target]
      .map(errorText)
      .join(' ')
  }
  return ''
}

const isModuleLoadError = (value: unknown): boolean => {
  const normalized = errorText(value).toLocaleLowerCase()
  if (!normalized) return false
  return MODULE_LOAD_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern))
}

const shouldAttemptModuleReload = () => {
  try {
    const lastAttempt = Number(sessionStorage.getItem(MODULE_RELOAD_ATTEMPT_KEY) ?? '0')
    return !Number.isFinite(lastAttempt) || Date.now() - lastAttempt > MODULE_RELOAD_RETRY_AFTER_MS
  } catch {
    return true
  }
}

const markModuleReloadAttempt = () => {
  try {
    sessionStorage.setItem(MODULE_RELOAD_ATTEMPT_KEY, String(Date.now()))
  } catch {
    // Ignore storage failures; a single reload is still the best recovery path.
  }
}

const recoverFromModuleLoadError = (event?: Event) => {
  if (!shouldAttemptModuleReload()) return
  event?.preventDefault()
  markModuleReloadAttempt()
  window.location.reload()
}

export const installModuleLoadRecovery = () => {
  window.addEventListener('vite:preloadError', (event) => {
    recoverFromModuleLoadError(event)
  })

  window.addEventListener('unhandledrejection', (event) => {
    if (isModuleLoadError(event.reason)) {
      recoverFromModuleLoadError(event)
    }
  })

  window.addEventListener(
    'error',
    (event) => {
      if (isModuleLoadError(event.error) || isModuleLoadError(event.message)) {
        recoverFromModuleLoadError(event)
      }
    },
    true,
  )
}
