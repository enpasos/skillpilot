import { useEffect, useState } from 'react'
import type { SkillLandscape } from '../landscapeTypes'
import type { LandscapeEntry } from './useLandscapes'
import { prepareLandscapeEntries } from './useLandscapes'

interface Options {
  enabled?: boolean
  refreshToken?: number
}

const EMPTY_ENTRIES: LandscapeEntry[] = []

export function useLearnerScopedLandscapes(
  landscapeId: string | undefined,
  language: string,
  skillpilotId: string | undefined,
  { enabled = true, refreshToken = 0 }: Options = {},
) {
  const isActive = enabled && !!landscapeId && !!skillpilotId
  const requestKey = JSON.stringify([skillpilotId, landscapeId, language, refreshToken])
  const [result, setResult] = useState<{
    key: string
    entries: LandscapeEntry[]
    error: Error | null
  } | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

    if (!isActive || !landscapeId || !skillpilotId) {
      return () => controller.abort()
    }

    const url = apiBase
      ? `${apiBase}/api/ui/learners/${skillpilotId}/landscapes/${landscapeId}/closure`
      : `/api/ui/learners/${skillpilotId}/landscapes/${landscapeId}/closure`
    const query = `?lang=${language}`

    fetch(url + query, { signal })
      .then(async (res) => {
        if (!res.ok) {
          const message = (await res.text()).trim()
          throw new Error(message || `Failed to load learner-scoped landscape (${res.status})`)
        }
        const json = (await res.json()) as SkillLandscape[]
        if (signal.aborted) return
        setResult({ key: requestKey, entries: prepareLandscapeEntries(json), error: null })
      })
      .catch((err) => {
        if (signal.aborted) return
        setResult({ key: requestKey, entries: EMPTY_ENTRIES, error: err as Error })
      })

    return () => controller.abort()
  }, [isActive, landscapeId, language, requestKey, skillpilotId])

  const current = isActive && result?.key === requestKey ? result : null
  return {
    learnerScopedLandscapeEntries: current?.entries ?? EMPTY_ENTRIES,
    loadingLearnerScopedLandscapes: isActive && current === null,
    learnerScopedLandscapeError: current?.error ?? null,
  }
}
