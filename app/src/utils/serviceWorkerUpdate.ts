const DEFAULT_SERVICE_WORKER_UPDATE_TIMEOUT_MS = 15_000

export type ServiceWorkerUpdateEnvironment = {
  serviceWorker: ServiceWorkerContainer | null
  reload: () => void
  timeoutMs?: number
}

const waitForInstallableWorker = async (
  registration: ServiceWorkerRegistration,
  timeoutMs: number,
): Promise<ServiceWorker | null> => {
  if (registration.waiting) return registration.waiting

  return await new Promise<ServiceWorker | null>((resolve, reject) => {
    let settled = false
    let observedWorker: ServiceWorker | null = null

    const cleanup = () => {
      globalThis.clearTimeout(timeoutId)
      registration.removeEventListener('updatefound', handleUpdateFound)
      observedWorker?.removeEventListener('statechange', handleStateChange)
    }

    const finish = (worker: ServiceWorker | null) => {
      if (settled) return
      settled = true
      cleanup()
      resolve(worker)
    }

    const fail = (error: unknown) => {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }

    const observeWorker = (worker: ServiceWorker | null) => {
      if (settled) return
      if (!worker) return
      if (observedWorker !== worker) {
        observedWorker?.removeEventListener('statechange', handleStateChange)
        observedWorker = worker
        worker.addEventListener('statechange', handleStateChange)
      }
      handleStateChange()
    }

    const inspectRegistration = () => {
      if (settled) return false
      if (registration.waiting) {
        finish(registration.waiting)
        return true
      }
      if (registration.installing) {
        observeWorker(registration.installing)
        return true
      }
      return false
    }

    function handleUpdateFound() {
      inspectRegistration()
    }

    function handleStateChange() {
      const worker = registration.waiting ?? observedWorker
      if (!worker) return
      if (worker.state === 'installed' || worker.state === 'activated') {
        finish(worker)
        return
      }
      if (worker.state === 'redundant') {
        fail(new Error('The new SkillPilot service worker became redundant.'))
      }
    }

    const timeoutId = globalThis.setTimeout(() => {
      fail(new Error('Timed out while preparing the new SkillPilot version.'))
    }, timeoutMs)

    registration.addEventListener('updatefound', handleUpdateFound)
    const alreadyUpdating = inspectRegistration()

    if (settled || alreadyUpdating) return

    void registration.update()
      .then(() => {
        if (!inspectRegistration()) {
          // The browser completed a network update check and found no newer
          // worker. Its active worker is therefore already current; a normal
          // reload can safely pick up that worker's coherent app shell.
          finish(null)
        }
      })
      .catch(fail)
  })
}

const activateWorkerAndReload = async (
  serviceWorker: ServiceWorkerContainer,
  worker: ServiceWorker,
  reload: () => void,
  timeoutMs: number,
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    let settled = false

    const cleanup = () => {
      globalThis.clearTimeout(timeoutId)
      serviceWorker.removeEventListener('controllerchange', handleActivated)
      worker.removeEventListener('statechange', handleWorkerStateChange)
    }

    const handleActivated = () => {
      if (settled) return
      settled = true
      cleanup()
      try {
        reload()
        resolve()
      } catch (error) {
        reject(error)
      }
    }

    const handleWorkerStateChange = () => {
      if (worker.state === 'activated') {
        handleActivated()
        return
      }
      if (worker.state === 'redundant') {
        if (settled) return
        settled = true
        cleanup()
        reject(new Error('The new SkillPilot service worker could not be activated.'))
      }
    }

    const timeoutId = globalThis.setTimeout(() => {
      if (settled) return
      settled = true
      cleanup()
      reject(new Error('Timed out while activating the new SkillPilot version.'))
    }, timeoutMs)

    serviceWorker.addEventListener('controllerchange', handleActivated)
    worker.addEventListener('statechange', handleWorkerStateChange)

    try {
      worker.postMessage({ type: 'SKIP_WAITING' })
      handleWorkerStateChange()
    } catch (error) {
      if (settled) return
      settled = true
      cleanup()
      reject(error)
    }
  })
}

export const activateWaitingServiceWorkerAndReload = async ({
  serviceWorker,
  reload,
  timeoutMs = DEFAULT_SERVICE_WORKER_UPDATE_TIMEOUT_MS,
}: ServiceWorkerUpdateEnvironment): Promise<void> => {
  if (!serviceWorker) {
    reload()
    return
  }

  const registration = await serviceWorker.getRegistration()
  if (!registration) {
    reload()
    return
  }

  const worker = await waitForInstallableWorker(registration, timeoutMs)
  if (!worker) {
    reload()
    return
  }
  await activateWorkerAndReload(serviceWorker, worker, reload, timeoutMs)
}
