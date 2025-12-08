import { useCallback, useState, useEffect } from 'react'
import type { LandscapeEntry } from './useLandscapes'
import type { MasteryMap } from '../learnerTypes';

interface Options {
  landscapeEntries: LandscapeEntry[]
  selectedLandscapeId: string
  initialCourseFilter?: string
}

export function useLearnerProgress({ landscapeEntries, selectedLandscapeId, skillpilotId, initialCourseFilter = 'all' }: Options & { skillpilotId: string }) {
  // selectedLandscapeId is now managed by the parent (useAppCore)
  const [masteryByLandscape, setMasteryByLandscape] = useState<Record<string, MasteryMap>>({})
  const [activeFilter, setActiveFilter] = useState<string>(initialCourseFilter ?? 'all')

  const currentLandscapeEntry =
    landscapeEntries.find((entry) => entry.meta.landscapeId === selectedLandscapeId) ?? landscapeEntries[0]

  const activeLandscapeId = currentLandscapeEntry?.meta.landscapeId ?? ''

  // Fetch mastery when skillpilotId or activeLandscapeId changes
  useState(() => {
    // Initial state logic if needed, but we use useEffect for async data
  })

  useEffect(() => {
    if (!skillpilotId) return

    const fetchMastery = async () => {
      try {
        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

        // We fetch GLOBAL mastery for the learner, not just per landscape (API is global)
        const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/mastery` : `/api/ui/learners/${skillpilotId}/mastery`
        const res = await fetch(url)
        if (res.ok) {
          const data = await res.json()
          // API returns { mastery: { goalId: 1.0 } }
          // We need to store it. Since the API is global, we might store it for "current landscape" or globally?
          // For now, let's assume the map applies to all goals. 
          // But this hook structures it by landscapeId.
          // Let's store it under activeLandscapeId (or 'global'?)
          // The current implementation expects `masteryByLandscape[activeLandscapeId]`

          if (data.mastery) {
            setMasteryByLandscape(prev => ({
              ...prev,
              [activeLandscapeId]: data.mastery
            }))
          }
        }
      } catch (e) {
        console.warn('Failed to fetch mastery', e)
      }
    }
    fetchMastery()
  }, [skillpilotId, activeLandscapeId])

  const mastery = masteryByLandscape[activeLandscapeId] ?? {}

  const updateMasteryForCurrent = useCallback((updater: (prev: MasteryMap) => MasteryMap) => {
    if (!activeLandscapeId) return
    setMasteryByLandscape((prev) => {
      const prevMap = prev[activeLandscapeId] ?? {}
      const nextMap = updater(prevMap)
      return { ...prev, [activeLandscapeId]: nextMap }
    })
  }, [activeLandscapeId])

  const getMasteryMap = useCallback((landscapeId: string) => masteryByLandscape[landscapeId] ?? {}, [masteryByLandscape])

  return {
    activeLandscapeId,
    currentLandscapeEntry,
    mastery,
    updateMasteryForCurrent,
    getMasteryMap,
    activeFilter,
    setActiveFilter,
  }
}
