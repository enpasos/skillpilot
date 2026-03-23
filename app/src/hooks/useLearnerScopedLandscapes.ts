/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import type { LearningLandscape } from '../landscapeTypes'
import type { LandscapeEntry } from './useLandscapes'
import { prepareLandscapeEntries } from './useLandscapes'

interface Options {
  enabled?: boolean
  refreshToken?: number
}

export function useLearnerScopedLandscapes(
  landscapeId: string | undefined,
  language: string,
  skillpilotId: string | undefined,
  { enabled = true, refreshToken = 0 }: Options = {},
) {
  const [entries, setEntries] = useState<LandscapeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const isActive = enabled && !!landscapeId && !!skillpilotId

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

    if (!isActive || !landscapeId || !skillpilotId) {
      return () => controller.abort()
    }

    setLoading(true)
    setError(null)

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
        const json = (await res.json()) as LearningLandscape[]
        setEntries(prepareLandscapeEntries(json))
      })
      .catch((err) => {
        if (signal.aborted) return
        setError(err as Error)
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [isActive, landscapeId, language, refreshToken, skillpilotId])

  return {
    learnerScopedLandscapeEntries: isActive ? entries : [],
    loadingLearnerScopedLandscapes: isActive ? loading : false,
    learnerScopedLandscapeError: isActive ? error : null,
  }
}
