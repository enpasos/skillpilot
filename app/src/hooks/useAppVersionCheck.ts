import { useCallback, useEffect, useState } from 'react'

type AppVersionPayload = {
  buildId?: string
  buildTime?: string
  shortCommit?: string
  branch?: string
  dirty?: boolean
}

export type AppVersionStatus = {
  updateAvailable: boolean
  currentBuildId: string
  latestVersion: AppVersionPayload | null
  checkNow: () => Promise<void>
  reloadNow: () => void
  dismiss: () => void
}

const VERSION_CHECK_INTERVAL_MS = 5 * 60 * 1000

const readLoadedBuildId = () =>
  document
    .querySelector<HTMLMetaElement>('meta[name="skillpilot-build-id"]')
    ?.content
    ?.trim() ?? ''

const hasActiveEditableElement = () => {
  const activeElement = document.activeElement
  if (!activeElement) return false
  if (activeElement instanceof HTMLInputElement) return true
  if (activeElement instanceof HTMLTextAreaElement) return true
  if (activeElement instanceof HTMLSelectElement) return true
  return activeElement instanceof HTMLElement && activeElement.isContentEditable
}

const canAutoReloadForUpdate = () =>
  document.visibilityState !== 'visible' && !hasActiveEditableElement()

const fetchLatestVersion = async (): Promise<AppVersionPayload | null> => {
  const response = await fetch(`/version.json?_=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      'cache-control': 'no-cache',
      pragma: 'no-cache',
    },
  })
  if (!response.ok) return null
  return await response.json() as AppVersionPayload
}

export const useAppVersionCheck = (): AppVersionStatus => {
  const [latestVersion, setLatestVersion] = useState<AppVersionPayload | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [dismissedBuildId, setDismissedBuildId] = useState<string | null>(null)
  const [currentBuildId] = useState(readLoadedBuildId)

  const checkNow = useCallback(async () => {
    try {
      const nextVersion = await fetchLatestVersion()
      if (!nextVersion?.buildId) return

      setLatestVersion(nextVersion)
      const isNewVersion = currentBuildId
        && nextVersion.buildId !== currentBuildId
        && nextVersion.buildId !== dismissedBuildId

      if (isNewVersion) {
        if (canAutoReloadForUpdate()) {
          window.location.reload()
          return
        }
        setUpdateAvailable(true)
      }
    } catch (error) {
      console.warn('[version-check] Failed to check SkillPilot version', error)
    }
  }, [currentBuildId, dismissedBuildId])

  useEffect(() => {
    const initialCheckId = window.setTimeout(() => {
      void checkNow()
    }, 0)

    const handleFocus = () => {
      void checkNow()
    }
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkNow()
      }
    }
    const intervalId = window.setInterval(() => {
      void checkNow()
    }, VERSION_CHECK_INTERVAL_MS)

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearTimeout(initialCheckId)
      window.clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [checkNow])

  const reloadNow = useCallback(() => {
    window.location.reload()
  }, [])

  const dismiss = useCallback(() => {
    const buildId = latestVersion?.buildId
    if (buildId) {
      setDismissedBuildId(buildId)
    }
    setUpdateAvailable(false)
  }, [latestVersion?.buildId])

  return {
    updateAvailable,
    currentBuildId,
    latestVersion,
    checkNow,
    reloadNow,
    dismiss,
  }
}
