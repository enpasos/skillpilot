import { useCallback, useEffect, useRef, useState } from 'react'
import type { LandscapeEntry } from './useLandscapes'
import type { MasteryMap } from '../learnerTypes';

interface Options {
  landscapeEntries: LandscapeEntry[]
  selectedLandscapeId: string
  initialCourseFilter?: string
}

const EMPTY_MASTERY: MasteryMap = {}

export function useLearnerProgress({ landscapeEntries, selectedLandscapeId, skillpilotId, initialCourseFilter = 'all' }: Options & { skillpilotId: string }) {
  // selectedLandscapeId is now managed by the parent (useAppCore)
  // The mastery API answers for the whole learner, not for one landscape. One
  // map per learner therefore serves every landscape: it is requested once
  // instead of again whenever the landscapes arrive or the selection changes,
  // and a landscape switch no longer shows empty progress until a reload ends.
  const [masteryState, setMasteryState] = useState<{ skillpilotId: string; mastery: MasteryMap }>({
    skillpilotId: '',
    mastery: EMPTY_MASTERY,
  })
  const masteryRequestSequenceRef = useRef(0)
  const [activeFilter, setActiveFilter] = useState<string>(initialCourseFilter ?? 'all')

  const currentLandscapeEntry =
    landscapeEntries.find((entry) => entry.meta.landscapeId === selectedLandscapeId) ?? landscapeEntries[0]

  const activeLandscapeId = currentLandscapeEntry?.meta.landscapeId ?? ''

  const refreshMastery = useCallback(async () => {
    if (!skillpilotId) return
    const requestSequence = ++masteryRequestSequenceRef.current

    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/mastery?_t=${Date.now()}` : `/api/ui/learners/${skillpilotId}/mastery?_t=${Date.now()}`
      const res = await fetch(url)
      if (res.ok) {
        // API returns { mastery: { goalId: 1.0 } }
        const data = await res.json()
        // An older answer must not replace the result of a later request.
        if (requestSequence !== masteryRequestSequenceRef.current) return
        if (data.mastery) {
          setMasteryState({ skillpilotId, mastery: data.mastery })
        }
      }
    } catch (e) {
      console.warn('Failed to fetch mastery', e)
    }
  }, [skillpilotId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshMastery()
  }, [refreshMastery])

  const mastery = masteryState.skillpilotId === skillpilotId ? masteryState.mastery : EMPTY_MASTERY

  const updateMasteryForCurrent = useCallback((updater: (prev: MasteryMap) => MasteryMap) => {
    if (!activeLandscapeId) return
    setMasteryState((prev) => ({
      skillpilotId,
      mastery: updater(prev.skillpilotId === skillpilotId ? prev.mastery : EMPTY_MASTERY),
    }))
  }, [activeLandscapeId, skillpilotId])

  const getMasteryMap = useCallback(() => mastery, [mastery])

  return {
    activeLandscapeId,
    currentLandscapeEntry,
    mastery,
    updateMasteryForCurrent,
    getMasteryMap,
    activeFilter,
    setActiveFilter,
    refreshMastery,
  }
}
