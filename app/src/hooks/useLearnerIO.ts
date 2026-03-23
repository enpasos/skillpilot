import { useCallback, useRef } from 'react'
import type { UiGoal } from '../goalTypes'
import type { ToastKind } from './useToast'
import { queueToastForNextLoad } from './useToast'

const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

interface UseLearnerIOOptions {
  skillpilotId: string
  language: string
  srsGoals: UiGoal[]
  onNotify?: (kind: ToastKind, message: string) => void
  t: {
    notifications: {
      learnerExported: string
      learnerExportFailed: string
      learnerImported: string
      learnerImportFailed: string
      learnerImportSystemFailed: string
      learnerImportValidationFailed: string
      compatibilityArchiveExportFailed: string
      compatibilityArchiveExported: string
    }
  }
  onShowModal: (title: string, message: string, type: 'info' | 'error' | 'success') => void
}

const parseTimestamp = (value: unknown) => {
  if (!value) return 0
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return numeric
  const parsed = Date.parse(String(value))
  return Number.isFinite(parsed) ? parsed : 0
}

export function useLearnerIO({
  skillpilotId,
  language,
  srsGoals,
  onNotify,
  t,
  onShowModal,
}: UseLearnerIOOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadJsonPayload = useCallback((payload: unknown, filenamePrefix: string) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '')
    link.download = `${filenamePrefix}_${skillpilotId}_${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [skillpilotId])

  const syncClientData = useCallback(async (nodeId: string): Promise<boolean> => {
    if (!skillpilotId || !nodeId) return false
    const url = toApi(`/api/ui/learners/${skillpilotId}/client-state/${nodeId}`)
    const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${nodeId}`
    const storageKey = `srs_state_${skillpilotId}_${nodeId}`

    let srsState: Record<string, unknown> = {}
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) srsState = JSON.parse(stored)
    } catch (e) {
      console.warn("Error collecting local SRS state for sync", e)
    }

    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updatedAt: new Date().toISOString(),
          srsState
        })
      })

      if (res.ok) {
        try {
          const data = await res.json()
          if (data && data.savedAt) {
            localStorage.setItem(lastSyncKey, String(data.savedAt))
          } else {
            localStorage.setItem(lastSyncKey, new Date().toISOString())
          }
        } catch {
          localStorage.setItem(lastSyncKey, new Date().toISOString())
        }
        return true
      }
      if (res.status === 404) {
        console.warn('Client-state sync endpoint not available on backend.')
        return false
      }
      console.warn('Client-state sync failed', res.status, res.statusText)
      return false
    } catch (e) {
      console.warn('Client-state sync error', e)
      return false
    }
  }, [skillpilotId])

  const handleExport = useCallback(async () => {
    if (!skillpilotId) return
    try {
      const url = toApi(`/api/ui/learners/${skillpilotId}/export`)
      const res = await fetch(url)
      if (res.ok) {
        const serverData = await res.json()

        // V2 Export: Collect Local SRS State
        const clientData: Record<string, unknown> = { srsState: {} }
        const prefix = `srs_state_${skillpilotId}_`

        try {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(prefix)) {
              const val = localStorage.getItem(key)
              if (val) (clientData.srsState as Record<string, unknown>)[key] = JSON.parse(val)
            }
          }
        } catch (e) {
          console.warn("Error collecting local stats for export", e)
        }

        // Merge in server-stored SRS state (important for multi-device exports)
        try {
          const srsNodes = srsGoals.filter((goal) => goal.tags?.some((tag) => tag.startsWith('srs-deck')))
          await Promise.all(
            srsNodes.map(async (goal) => {
              const nodeId = goal.id
              const syncUrl = toApi(`/api/ui/learners/${skillpilotId}/client-state/${nodeId}`)
              try {
                const stateRes = await fetch(syncUrl)
                if (!stateRes.ok) return
                const payload = await stateRes.json()
                const serverState = payload?.srsState
                if (!serverState || Object.keys(serverState).length === 0) return

                const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${nodeId}`
                const localLast = localStorage.getItem(lastSyncKey)
                const localLastAt = parseTimestamp(localLast)
                const serverUpdatedAt = parseTimestamp(payload?.updatedAt)

                const storageKey = `srs_state_${skillpilotId}_${nodeId}`
                const existing = (clientData.srsState as Record<string, unknown>)[storageKey]
                if (!existing || serverUpdatedAt > localLastAt) {
                  (clientData.srsState as Record<string, unknown>)[storageKey] = serverState
                }
              } catch (err) {
                console.warn('Error fetching server SRS state for export', err)
              }
            })
          )
        } catch (e) {
          console.warn('Error merging server SRS state for export', e)
        }

        const exportPayload = {
          version: "2.0",
          exportedAt: new Date().toISOString(),
          serverExport: serverData,
          clientData: clientData
        }

        downloadJsonPayload(exportPayload, 'learner_data')
        onNotify?.('success', t.notifications.learnerExported)
      } else {
        console.error("Export failed", res.status, res.statusText)
        onNotify?.('error', t.notifications.learnerExportFailed)
      }
    } catch (e) {
      console.error("Export error", e)
      onNotify?.('error', t.notifications.learnerExportFailed)
    }
  }, [downloadJsonPayload, onNotify, skillpilotId, srsGoals, t.notifications.learnerExportFailed, t.notifications.learnerExported])

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !skillpilotId) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)

        // V2 Import: Unwrap if Wrapper exists
        let payloadToSend: unknown = json
        let clientDataToRestore: unknown = null

        if (json.serverExport && json.clientData) {
          console.log("Detected V2 Export Wrapper")
          payloadToSend = json.serverExport
          clientDataToRestore = json.clientData as Record<string, unknown>
        }

        const url = toApi(`/api/ui/learners/${skillpilotId}/import`)
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadToSend)
        })

        if (res.ok) {
          // Restore Local Data (SRS State) if present
          if (clientDataToRestore && (clientDataToRestore as Record<string, unknown>).srsState) {
            try {
              console.log("Restoring SRS State...")
              const srsState = (clientDataToRestore as Record<string, unknown>).srsState as Record<string, unknown>
              let restoreCount = 0
              const goalStateMap = new Map<string, Record<string, unknown>>()
              const keyPattern = /^srs_state_([^_]+)_(.+)$/

              Object.entries(srsState).forEach(([oldKey, value]) => {
                const match = oldKey.match(keyPattern)
                if (match) {
                  const goalId = match[2]
                  const newKey = `srs_state_${skillpilotId}_${goalId}`
                  localStorage.setItem(newKey, JSON.stringify(value))
                  if (value && typeof value === 'object') {
                    goalStateMap.set(goalId, value as Record<string, unknown>)
                  }
                  restoreCount++
                }
              })
              console.log(`Restored ${restoreCount} SRS state entries.`)

              // Persist restored SRS state to backend for memory nodes
              await Promise.all(
                Array.from(goalStateMap.entries()).map(async ([goalId, state]) => {
                  const syncUrl = toApi(`/api/ui/learners/${skillpilotId}/client-state/${goalId}`)
                  try {
                    const syncRes = await fetch(syncUrl, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        updatedAt: new Date().toISOString(),
                        srsState: state
                      })
                    })
                    if (syncRes.ok) {
                      const lastSyncKey = `srs_state_last_sync_${skillpilotId}_${goalId}`
                      localStorage.setItem(lastSyncKey, new Date().toISOString())
                    }
                  } catch (err) {
                    console.warn('Failed to persist imported SRS state', err)
                  }
                })
              )
            } catch (err) {
              console.error("Error restoring local state", err)
            }
          }

          queueToastForNextLoad('success', t.notifications.learnerImported)
          window.location.reload()
        } else {
          console.error("Import failed", res.status)

          let serverMsg = ""
          try {
            const errData = await res.json()
            if (errData && errData.message) serverMsg = errData.message
          } catch { /* ignore */ }

          const notifyImportError = (message: string, title: string) => {
            if (onNotify) {
              onNotify('error', message)
              return
            }
            onShowModal(title, message, 'error')
          }

          if (res.status === 400) {
            notifyImportError(
              t.notifications.learnerImportValidationFailed,
              language === 'de' ? 'Import-Validierung fehlgeschlagen' : 'Import Validation Failed',
            )
          } else {
            notifyImportError(
              serverMsg || t.notifications.learnerImportFailed,
              language === 'de' ? 'Import fehlgeschlagen' : 'Import Failed',
            )
          }
        }
      } catch (err) {
        console.error("Import error", err)
        if (onNotify) {
          onNotify('error', t.notifications.learnerImportSystemFailed)
        } else {
          onShowModal(
            language === 'de' ? 'Import-Fehler' : 'Import Error',
            language === 'de'
              ? 'Ein Netzwerk- oder Systemfehler ist während des Imports aufgetreten.'
              : 'A network or system error occurred during import.',
            'error',
          )
        }
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [
    skillpilotId,
    language,
    onNotify,
    onShowModal,
    t.notifications.learnerImported,
    t.notifications.learnerImportFailed,
    t.notifications.learnerImportSystemFailed,
    t.notifications.learnerImportValidationFailed,
  ])

  const handleCompatibilityArchiveDownload = useCallback(async (
    isCompatibilityArchivePending: boolean,
    setIsCompatibilityArchivePending: (v: boolean) => void,
  ) => {
    if (!skillpilotId || isCompatibilityArchivePending) return
    setIsCompatibilityArchivePending(true)
    try {
      const url = toApi(`/api/ui/learners/${skillpilotId}/compatibility-archive`)
      const res = await fetch(url)
      if (!res.ok) {
        const message = await res.text()
        if (onNotify) {
          onNotify('error', message || t.notifications.compatibilityArchiveExportFailed)
        } else {
          onShowModal(
            language === 'de' ? 'Archivexport fehlgeschlagen' : 'Archive export failed',
            message || (language === 'de'
              ? 'Das Kompatibilitaetsarchiv konnte nicht erstellt werden.'
              : 'Could not create the compatibility archive.'),
            'error',
          )
        }
        return
      }

      const serverArchive = await res.json()
      const clientData: Record<string, unknown> = { srsState: {} }
      const prefix = `srs_state_${skillpilotId}_`

      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            const val = localStorage.getItem(key)
            if (val) (clientData.srsState as Record<string, unknown>)[key] = JSON.parse(val)
          }
        }
      } catch (e) {
        console.warn('Error collecting local SRS state for compatibility archive', e)
      }

      const exportPayload = {
        version: 'compatibility-archive/1.0',
        exportedAt: new Date().toISOString(),
        serverArchive,
        clientData,
      }

      downloadJsonPayload(exportPayload, 'compatibility_archive')
      if (onNotify) {
        onNotify('success', t.notifications.compatibilityArchiveExported)
      } else {
        onShowModal(
          language === 'de' ? 'Archiv erstellt' : 'Archive created',
          language === 'de'
            ? 'Die eingefrorene Hessen-Kompatibilitaetsansicht wurde als Archiv exportiert.'
            : 'The frozen Hesse compatibility view was exported as an archive.',
          'success',
        )
      }
    } catch (e) {
      console.error('Compatibility archive export error', e)
      if (onNotify) {
        onNotify('error', t.notifications.compatibilityArchiveExportFailed)
      } else {
        onShowModal(
          language === 'de' ? 'Archivexport fehlgeschlagen' : 'Archive export failed',
          language === 'de'
            ? 'Waehrend des Archivexports ist ein Netzwerk- oder Systemfehler aufgetreten.'
            : 'A network or system error occurred during archive export.',
          'error',
        )
      }
    } finally {
      setIsCompatibilityArchivePending(false)
    }
  }, [
    downloadJsonPayload,
    language,
    onNotify,
    onShowModal,
    skillpilotId,
    t.notifications.compatibilityArchiveExportFailed,
    t.notifications.compatibilityArchiveExported,
  ])

  return {
    fileInputRef,
    handleExport,
    handleImportClick,
    handleFileChange,
    handleCompatibilityArchiveDownload,
    syncClientData,
  }
}
