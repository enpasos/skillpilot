/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import type { LearningLandscape } from '../landscapeTypes'
import type { UiGoal as Goal } from '../goalTypes'
import { convertLearningGoal } from '../goalTypes'

export interface LandscapeEntry {
  meta: LearningLandscape
  goals: Goal[]
}

function normalizeGoalId(ref: string) {
  if (typeof ref !== 'string') return ref
  const idx = ref.indexOf(':')
  if (idx >= 0 && idx < ref.length - 1) {
    return ref.slice(idx + 1)
  }
  return ref
}

export function normalizeLandscape(raw: LearningLandscape | undefined): LandscapeEntry | null {
  if (!raw || !Array.isArray(raw.goals)) return null
  return {
    meta: raw,
    goals: raw.goals.map((goal) => convertLearningGoal(goal, { landscapeId: raw.landscapeId })),
  }
}

function applyEffectiveRequires(entries: LandscapeEntry[]): LandscapeEntry[] {
  const allGoals = entries.flatMap((entry) => entry.goals)
  const goalMap = new Map(allGoals.map((g) => [g.id, g]))

  const parentMap = new Map<string, string[]>()
  allGoals.forEach((goal) => {
    goal.contains.forEach((rawChild) => {
      const normalized = normalizeGoalId(rawChild)
      const resolved = goalMap.has(normalized) ? normalized : rawChild
      if (!goalMap.has(resolved)) return
      const parents = parentMap.get(resolved) ?? []
      parents.push(goal.id)
      parentMap.set(resolved, parents)
    })
  })

  const memo = new Map<string, { effective: string[]; inherited: string[] }>()
  const visiting = new Set<string>()

  const computeEffective = (goalId: string): { effective: string[]; inherited: string[] } => {
    const cached = memo.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) {
      return { effective: [], inherited: [] }
    }
    visiting.add(goalId)

    const goal = goalMap.get(goalId)
    const direct = goal?.requires ?? []

    const fromParents = new Set<string>()
    const parents = parentMap.get(goalId) ?? []
    parents.forEach((pid) => {
      const parentReqs = computeEffective(pid)
      parentReqs.effective.forEach((req) => fromParents.add(req))
    })

    const effectiveSet = new Set<string>(direct)
    fromParents.forEach((req) => effectiveSet.add(req))
    effectiveSet.delete(goalId) // avoid self through inheritance
    const inherited = Array.from(fromParents).filter((req) => !direct.includes(req))

    const result = { effective: Array.from(effectiveSet), inherited }
    memo.set(goalId, result)
    visiting.delete(goalId)
    return result
  }

  allGoals.forEach((goal) => {
    const { effective, inherited } = computeEffective(goal.id)
    goal.effectiveRequires = effective
    goal.inheritedRequires = inherited
  })

  return entries
}

export function useLandscapes(landscapeId?: string, language: string = 'de') {
  const [entries, setEntries] = useState<LandscapeEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal
    const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

    setLoading(true)
    setError(null)

    if (!landscapeId) {
      // If no landscape ID is provided (e.g. Trainer view), fetch the overview list
      const url = apiBase ? `${apiBase}/api/ui/landscapes` : `/api/ui/landscapes`
      const query = `?lang=${language}`
      fetch(url + query, { signal })
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to load landscapes (${res.status})`)
          const json = await res.json()
          // Expecting LandscapeOverviewResponse { summaries: [...] }
          const summaries = json.summaries || []

          // Convert summaries to LandscapeEntry with empty goals
          const entries: LandscapeEntry[] = summaries.map((s: any) => ({
            meta: { ...s, goals: [] },
            goals: [],
          }))
          setEntries(entries)
        })
        .catch((err) => {
          if (signal.aborted) return
          setError(err as Error)
        })
        .finally(() => {
          if (!signal.aborted) setLoading(false)
        })
      return () => controller.abort()
    }

    // Existing logic for specific landscape closure
    const url = apiBase ? `${apiBase}/api/ui/landscapes/${landscapeId}/closure` : `/api/ui/landscapes/${landscapeId}/closure`

    const query = `?lang=${language}`

    fetch(url + query, { signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load landscape (${res.status})`)
        const json = (await res.json()) as LearningLandscape[]

        const items = json

        // Two-pass: collect all goal IDs to resolve cross-landscape references in `contains`
        const allGoalIds = new Set<string>()
        items.forEach((item) => {
          item.goals?.forEach((g) => allGoalIds.add(g.id))
        })

        const resolved = items.map((item) => {
          if (!Array.isArray(item.goals)) return item
          const goals = item.goals.map((g) => {
            const contains = (g.contains ?? []).map((ref) => {
              if (typeof ref === 'string' && ref.includes(':')) {
                const [, goalId] = ref.split(':', 2)
                return goalId && allGoalIds.has(goalId) ? goalId : ref
              }
              return ref
            })
            return { ...g, contains }
          })
          return { ...item, goals }
        })

        const normalized = resolved
          .map((item) => normalizeLandscape(item))
          .filter((entry): entry is LandscapeEntry => Boolean(entry))

        const withEffectiveRequires = applyEffectiveRequires(normalized)

        setEntries(withEffectiveRequires)
      })
      .catch((err) => {
        if (signal.aborted) return // Ignore abort errors
        setError(err as Error)
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false)
        }
      })
    return () => {
      controller.abort()
    }
  }, [landscapeId, language])

  return { landscapeEntries: entries, loadingLandscapes: loading, landscapeError: error }
}
