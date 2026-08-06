/**
 * Keep one browser tab on one coherent frontend version.
 *
 * Immediate takeover can replace the active worker between serving index.html
 * and loading its hashed CSS/JS files. The new worker then no longer knows the
 * previous asset URLs and the page can render without styles. A new worker
 * therefore waits until the old clients are closed before it activates and
 * cleans the previous precache.
 */
export const serviceWorkerRegisterType = 'prompt' as const

// Registration and the update prompt are owned by the React root through
// `virtual:pwa-register/react`. Injecting an additional registration script
// would create a second, uncoordinated service-worker lifecycle.
export const serviceWorkerInjectRegister = false as const

export const serviceWorkerUpdateCheckIntervalMs = 5 * 60 * 1000
export const serviceWorkerUpdatePreparationTimeoutMs = 90 * 1000
export const serviceWorkerActivationTimeoutMs = 20 * 1000

export const serviceWorkerLifecyclePolicy = Object.freeze({
  cleanupOutdatedCaches: true,
  clientsClaim: false,
  skipWaiting: false,
})
