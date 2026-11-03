export interface SynchronousInFlightGuard {
  tryStart: () => boolean
  finish: () => void
  isInFlight: () => boolean
}

/**
 * Guards async UI handlers before React has had a chance to render a disabled
 * state. This closes the small window in which two rapid clicks could both
 * issue a request or open a provider tab.
 */
export const createSynchronousInFlightGuard = (): SynchronousInFlightGuard => {
  let inFlight = false

  return {
    tryStart: () => {
      if (inFlight) return false
      inFlight = true
      return true
    },
    finish: () => {
      inFlight = false
    },
    isInFlight: () => inFlight,
  }
}
