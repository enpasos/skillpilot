type UpdateableServiceWorkerRegistration = Pick<
  ServiceWorkerRegistration,
  'installing' | 'waiting' | 'update'
>

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string,
): Promise<T> => await new Promise<T>((resolve, reject) => {
  const timeoutId = globalThis.setTimeout(() => {
    reject(new Error(message))
  }, timeoutMs)

  promise.then(
    value => {
      globalThis.clearTimeout(timeoutId)
      resolve(value)
    },
    error => {
      globalThis.clearTimeout(timeoutId)
      reject(error)
    },
  )
})

const waitUntilInstalled = async (
  worker: ServiceWorker,
  timeoutMs: number,
): Promise<void> => await new Promise<void>((resolve, reject) => {
  if (
    worker.state === 'installed'
    || worker.state === 'activating'
    || worker.state === 'activated'
  ) {
    resolve()
    return
  }
  if (worker.state === 'redundant') {
    reject(new Error('The newly found service worker became redundant before installation completed.'))
    return
  }
  const timeoutId = globalThis.setTimeout(() => {
    worker.removeEventListener('statechange', handleStateChange)
    reject(new Error('Timed out while preparing the latest application version.'))
  }, timeoutMs)

  const finish = (callback: () => void) => {
    globalThis.clearTimeout(timeoutId)
    worker.removeEventListener('statechange', handleStateChange)
    callback()
  }
  const handleStateChange = () => {
    if (
      worker.state === 'installed'
      || worker.state === 'activating'
      || worker.state === 'activated'
    ) {
      finish(resolve)
    } else if (worker.state === 'redundant') {
      finish(() => {
        reject(new Error('The newly found service worker became redundant before installation completed.'))
      })
    }
  }

  worker.addEventListener('statechange', handleStateChange)
  handleStateChange()
})

/**
 * Refresh the registration before activating its waiting worker.
 *
 * This closes the three-build race where version B is already waiting while
 * version C has reached the server. Activating the old waiting worker without
 * another update check would move the user only from A to B. A successful
 * return guarantees that a fully installed worker is waiting; callers must
 * never turn a missing worker into a blind reload of the old application.
 */
export const prepareLatestWaitingServiceWorker = async (
  registration: UpdateableServiceWorkerRegistration,
  timeoutMs: number,
): Promise<ServiceWorker | null> => {
  const deadline = Date.now() + timeoutMs
  const updatedRegistration = await withTimeout(
    registration.update(),
    timeoutMs,
    'Timed out while checking for the latest application version.',
  )

  const installingWorker = updatedRegistration.installing ?? registration.installing
  if (installingWorker) {
    const remainingTimeoutMs = Math.max(1, deadline - Date.now())
    await waitUntilInstalled(installingWorker, remainingTimeoutMs)
    // Let the registration publish the newly installed worker as `waiting`
    // before selecting the activation target.
    await Promise.resolve()
  }

  const preparedWorker = updatedRegistration.waiting
    ?? registration.waiting
    ?? (
      installingWorker
      && (installingWorker.state === 'activating' || installingWorker.state === 'activated')
        ? installingWorker
        : null
    )
  if (
    !preparedWorker
    || !['installed', 'activating', 'activated'].includes(preparedWorker.state)
  ) {
    return null
  }

  return preparedWorker
}

type ServiceWorkerActivationContainer = Pick<
  ServiceWorkerContainer,
  'addEventListener' | 'controller' | 'removeEventListener'
>

/**
 * Activate the exact worker selected during preparation.
 *
 * vite-plugin-pwa's `updateServiceWorker(true)` resolves after sending its
 * message; the boolean parameter no longer makes that promise wait for a
 * reload. Its separate reload listener also ignores an initially uncontrolled
 * tab. Observe the browser lifecycle directly instead, then let the caller
 * reload the page after this promise has proved activation.
 */
export const activatePreparedServiceWorker = async (
  serviceWorker: ServiceWorkerActivationContainer,
  worker: ServiceWorker,
  timeoutMs: number,
): Promise<void> => await new Promise<void>((resolve, reject) => {
  let settled = false

  const cleanup = () => {
    globalThis.clearTimeout(timeoutId)
    serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    worker.removeEventListener('statechange', handleStateChange)
  }
  const finish = (callback: () => void) => {
    if (settled) return
    settled = true
    cleanup()
    callback()
  }
  const handleControllerChange = () => {
    if (serviceWorker.controller === worker || worker.state === 'activated') {
      finish(resolve)
    }
  }
  const handleStateChange = () => {
    if (worker.state === 'activated') {
      finish(resolve)
    } else if (worker.state === 'redundant') {
      finish(() => {
        reject(new Error('The prepared service worker became redundant before activation.'))
      })
    }
  }
  const timeoutId = globalThis.setTimeout(() => {
    finish(() => {
      reject(new Error('Timed out while activating the latest application version.'))
    })
  }, timeoutMs)

  serviceWorker.addEventListener('controllerchange', handleControllerChange)
  worker.addEventListener('statechange', handleStateChange)
  handleStateChange()

  if (!settled && worker.state === 'installed') {
    try {
      worker.postMessage({ type: 'SKIP_WAITING' })
    } catch (error) {
      finish(() => {
        reject(error)
      })
    }
  }
})
