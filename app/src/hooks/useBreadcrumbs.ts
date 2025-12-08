import { useMemo } from "react"
import type { UiGoal as Goal } from "../goalTypes"

export interface BreadcrumbCrumb {
  id: string
  label: string
  options: { id: string; label: string }[]
  onSelect: (id: string) => void
  onNavigate: () => void
}

interface Params {
  currentGoal: Goal | null
  goalIndexAll: Map<string, Goal>
  parentMapAll: Map<string, string[]>
  globalRootGoals: Goal[]
  onNavigate: (goalId: string, landscapeId?: string) => void
}

export function useBreadcrumbs({
  currentGoal,
  goalIndexAll,
  parentMapAll,
  globalRootGoals,
  onNavigate,
}: Params) {
  return useMemo<BreadcrumbCrumb[]>(() => {
    if (!currentGoal) return []

    const crumbs: BreadcrumbCrumb[] = []

    // Build chain root -> ... -> current using primary parent (global)
    const chain: string[] = []
    const visited = new Set<string>()
    let nodeId: string | undefined = currentGoal.id
    while (nodeId) {
      chain.push(nodeId)
      const parents = parentMapAll.get(nodeId)
      if (!parents || parents.length === 0) break
      const nextParent = parents[0]
      if (visited.has(nextParent)) break
      visited.add(nextParent)
      nodeId = nextParent
    }
    chain.reverse()

    const rootId = chain[0] ?? currentGoal.id
    const selectedRoot = goalIndexAll.get(rootId) ?? currentGoal
    const rootLabel = selectedRoot.title

    const rootOptions = Array.from(new Map(globalRootGoals.map((g) => [g.id, g])).values()).map((g) => ({
      id: g.id,
      label: g.title,
    }))

    crumbs.push({
      id: rootId,
      label: rootLabel,
      options: rootOptions.length > 0 ? rootOptions : [{ id: rootId, label: rootLabel }],
      onNavigate: () => {
        onNavigate(rootId, selectedRoot.landscapeId)
      },
      onSelect: (id: string) => {
        const target = goalIndexAll.get(id)
        onNavigate(id, target?.landscapeId)
      },
    })

    const tail = chain.slice(1)
    tail.forEach((goalId, idx) => {
      const goal = goalIndexAll.get(goalId)
      const label = goal?.title ?? goalId
      const parentId = tail[idx - 1] ?? rootId
      const parent = goalIndexAll.get(parentId)
      let options =
        parent?.contains
          .filter((childId) => goalIndexAll.has(childId))
          .map((childId) => ({ id: childId, label: goalIndexAll.get(childId)?.title ?? childId })) || []
      if (options.length === 0) options = [{ id: goalId, label }]
      const pathToHere = chain.slice(0, idx + 2)
      crumbs.push({
        id: goalId,
        label,
        options,
        onNavigate: () => {
          onNavigate(pathToHere[pathToHere.length - 1])
        },
        onSelect: (nextId: string) => {
          const target = goalIndexAll.get(nextId)
          onNavigate(nextId, target?.landscapeId)
        },
      })
    })

    return crumbs
  }, [currentGoal, goalIndexAll, parentMapAll, globalRootGoals, onNavigate])
}
