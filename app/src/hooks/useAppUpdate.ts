import { useCallback, useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import {
  serviceWorkerActivationTimeoutMs,
  serviceWorkerUpdateCheckIntervalMs,
  serviceWorkerUpdatePreparationTimeoutMs,
} from '../../serviceWorkerLifecyclePolicy'
import {
  activatePreparedServiceWorker,
  prepareLatestWaitingServiceWorker,
} from '../utils/serviceWorkerUpdatePreparation'

export type AppUpdateStatus = {
  updateAvailable: boolean
  activateUpdate: () => Promise<void>
  activationPending: boolean
  activationError: boolean
  dismiss: () => void
}

/**
 * Own the application's single service-worker registration and update prompt.
 *
 * The UI is deliberately driven by Workbox's `needRefresh` signal. That signal
 * is emitted only after a new worker has finished installing and is waiting,
 * so an advertised server version can never race ahead of the installable app
 * shell. Updates are checked in the background, but this coordinator activates
 * a worker only after an explicit click. That activation intentionally updates
 * every open tab controlled by the same worker so the tabs stay coherent.
 */
export const useAppUpdate = (): AppUpdateStatus => {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const updateCheckRef = useRef<Promise<void> | null>(null)
  const activationInProgressRef = useRef(false)
  const [dismissed, setDismissed] = useState(false)
  const [activationPending, setActivationPending] = useState(false)
  const [activationError, setActivationError] = useState(false)

  const checkForUpdate = useCallback(async () => {
    const registration = registrationRef.current
    if (!registration || updateCheckRef.current || activationInProgressRef.current) return

    const updateCheck = registration.update()
      .then(() => undefined)
      .catch((error: unknown) => {
        console.warn('[app-update] Service-worker update check failed', error)
      })
      .finally(() => {
        updateCheckRef.current = null
      })

    updateCheckRef.current = updateCheck
    await updateCheck
  }, [])

  const { needRefresh: [needRefresh, setNeedRefresh] } = useRegisterSW({
    immediate: true,
    onNeedRefresh: () => {
      setDismissed(false)
      setActivationError(false)
    },
    onRegisteredSW: (_serviceWorkerUrl, registration) => {
      registrationRef.current = registration
      void checkForUpdate()
    },
    onRegisterError: (error) => {
      console.warn('[app-update] Service-worker registration failed', error)
    },
  })

  useEffect(() => {
    const handleFocus = () => {
      void checkForUpdate()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate()
      }
    }
    const intervalId = globalThis.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void checkForUpdate()
      }
    }, serviceWorkerUpdateCheckIntervalMs)

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      globalThis.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkForUpdate])

  const activateUpdate = useCallback(async () => {
    if (activationInProgressRef.current) return

    activationInProgressRef.current = true
    setActivationPending(true)
    setActivationError(false)

    try {
      if (updateCheckRef.current) {
        await updateCheckRef.current
      }

      const registration = registrationRef.current
        ?? await navigator.serviceWorker.getRegistration()
      if (!registration) {
        throw new Error('No service-worker registration is available for the update.')
      }

      // A newer deployment may have arrived after the prompt was shown. Check
      // once more and wait for that exact worker to finish installation before
      // asking Workbox to activate the waiting version.
      const preparedWorker = await prepareLatestWaitingServiceWorker(
        registration,
        serviceWorkerUpdatePreparationTimeoutMs,
      )

      if (!preparedWorker) {
        // A worker can finish activation between the prompt and the click. An
        // initially uncontrolled tab can then expose that worker as `active`
        // while it is still `activating`, but it still has no controller. Wait
        // for that exact worker before reloading into its application shell. A
        // stale prompt on an already controlled current page is simply cleared.
        const activeWorker = registration.active
        if (
          activeWorker
          && activeWorker !== navigator.serviceWorker.controller
          && (activeWorker.state === 'activating' || activeWorker.state === 'activated')
        ) {
          await activatePreparedServiceWorker(
            navigator.serviceWorker,
            activeWorker,
            serviceWorkerActivationTimeoutMs,
          )
          window.location.reload()
          return
        }

        activationInProgressRef.current = false
        setActivationPending(false)
        setNeedRefresh(false)
        return
      }

      await activatePreparedServiceWorker(
        navigator.serviceWorker,
        preparedWorker,
        serviceWorkerActivationTimeoutMs,
      )
      window.location.reload()
    } catch (error) {
      console.warn('[app-update] Failed to activate the waiting service worker', error)
      activationInProgressRef.current = false
      setActivationPending(false)
      setActivationError(true)
    }
  }, [setNeedRefresh])

  const dismiss = useCallback(() => {
    setDismissed(true)
    setActivationError(false)
    setNeedRefresh(false)
  }, [setNeedRefresh])

  return {
    updateAvailable: needRefresh && !dismissed,
    activateUpdate,
    activationPending,
    activationError,
    dismiss,
  }
}
