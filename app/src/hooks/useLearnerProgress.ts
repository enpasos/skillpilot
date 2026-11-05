import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import type { LandscapeEntry } from './useLandscapes'
import type { MasteryMap } from '../learnerTypes';
import { effectiveMasteryFromSnapshot, parseLearningUnits, unavailableLearningUnits, type LearningUnitsReadModel } from '../utils/learningUnitsApi'

interface Options {
  landscapeEntries: LandscapeEntry[]
  selectedLandscapeId: string
  initialCourseFilter?: string
}

export function useLearnerProgress({ landscapeEntries, selectedLandscapeId, skillpilotId, initialCourseFilter = 'all' }: Options & { skillpilotId: string }) {
  // selectedLandscapeId is now managed by the parent (useAppCore)
  const [snapshot, setSnapshot] = useState<{ learnerId: string; mastery: MasteryMap; learningUnits: LearningUnitsReadModel | null } | null>(null)
  const requestGeneration = useRef(0)
  const [activeFilter, setActiveFilter] = useState<string>(initialCourseFilter ?? 'all')

  const currentLandscapeEntry =
    landscapeEntries.find((entry) => entry.meta.landscapeId === selectedLandscapeId) ?? landscapeEntries[0]

  const activeLandscapeId = currentLandscapeEntry?.meta.landscapeId ?? ''



  const refreshMastery = useCallback(async () => {
    const generation = ++requestGeneration.current
    if (!skillpilotId) return

    try {
      const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

      // We fetch GLOBAL mastery for the learner, not just per landscape (API is global)
      const url = apiBase ? `${apiBase}/api/ui/learners/${skillpilotId}/mastery?_t=${Date.now()}` : `/api/ui/learners/${skillpilotId}/mastery?_t=${Date.now()}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        let learningUnits: LearningUnitsReadModel | null
        try {
          learningUnits = parseLearningUnits(data.learningUnits)
        } catch {
          learningUnits = unavailableLearningUnits()
          console.warn('Learning-unit status is invalid; showing explicit learning results')
        }
        if (data.mastery && generation === requestGeneration.current) {
          setSnapshot({ learnerId: skillpilotId, mastery: data.mastery, learningUnits })
        }
      } else throw new Error('Mastery request failed')
    } catch (e) {
      if (generation === requestGeneration.current) setSnapshot(previous => previous?.learnerId === skillpilotId
        ? { ...previous, learningUnits: unavailableLearningUnits() } : previous)
      console.warn('Failed to fetch mastery', e)
    }
  }, [skillpilotId])

  useEffect(() => {
    void refreshMastery()
  }, [refreshMastery, activeLandscapeId])

  const explicitMastery = useMemo(() => snapshot?.learnerId === skillpilotId ? snapshot.mastery : {}, [snapshot, skillpilotId])
  const learningUnits = snapshot?.learnerId === skillpilotId ? snapshot.learningUnits : null
  const mastery = useMemo(() => effectiveMasteryFromSnapshot(explicitMastery, learningUnits), [explicitMastery, learningUnits])

  const updateMasteryForCurrent = useCallback((updater: (prev: MasteryMap) => MasteryMap) => {
    if (!skillpilotId) return
    // A local explicit-result edit invalidates the old derived snapshot and
    // every read already in flight. Only a newer backend read can restore I.
    requestGeneration.current += 1
    setSnapshot((prev) => {
      const ownSnapshot = prev?.learnerId === skillpilotId ? prev : null
      return { learnerId: skillpilotId, mastery: updater(ownSnapshot?.mastery ?? {}), learningUnits: unavailableLearningUnits() }
    })
  }, [skillpilotId])

  const getMasteryMap: (landscapeId: string) => MasteryMap = useCallback(() => mastery, [mastery])

  return {
    activeLandscapeId,
    currentLandscapeEntry,
    mastery,
    explicitMastery,
    learningUnits,
    updateMasteryForCurrent,
    getMasteryMap,
    activeFilter,
    setActiveFilter,
    refreshMastery,
  }
}
