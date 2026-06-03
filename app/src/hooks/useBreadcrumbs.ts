import { useMemo } from "react"
import type { UiGoal as Goal } from "../goalTypes"
import { getAudienceGoalTitle } from "../utils/treeProjectionRuntime"

export interface BreadcrumbCrumb {
  id: string
  label: string
  options: { id: string; label: string }[]
  onSelect: (id: string) => void
  onNavigate: () => void
}

type StageNavigationKey = 'sek1' | 'sek2'

interface Params {
  currentGoal: Goal | null
  goalIndexAll: Map<string, Goal>
  parentMapAll: Map<string, string[]>
  globalRootGoals: Goal[]
  useRawGoalTitles?: boolean
  onNavigate: (goalId: string, landscapeId?: string) => void
}

const normalizeStageTitle = (title: string) =>
  title.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLocaleLowerCase('de-DE')

const getStageNavigationKey = (goal?: Pick<Goal, 'title'>): StageNavigationKey | null => {
  if (!goal) return null
  const title = normalizeStageTitle(goal.title)
  if (title === 'sekundarstufe i') return 'sek1'
  if (/^sekundarstufe ii(?:\s*\((?:gk|lk)\))?$/u.test(title)) return 'sek2'
  return null
}

const getStageNavigationLabel = (key: StageNavigationKey) =>
  key === 'sek1' ? 'Sekundarstufe I' : 'Sekundarstufe II'

const getStageNavigationOptions = (
  siblingGoals: Goal[],
  currentGoal?: Goal,
): { id: string; label: string }[] | null => {
  const currentStageKey = getStageNavigationKey(currentGoal)
  if (!currentStageKey) return null

  const stages = new Map<StageNavigationKey, Goal>()
  siblingGoals.forEach((goal) => {
    const key = getStageNavigationKey(goal)
    if (key && !stages.has(key)) {
      stages.set(key, goal)
    }
  })
  if (currentGoal) {
    stages.set(currentStageKey, currentGoal)
  }

  const options: { id: string; label: string }[] = []
  ;(['sek1', 'sek2'] as const).forEach((key) => {
    const goal = stages.get(key)
    if (goal) {
      options.push({ id: goal.id, label: getStageNavigationLabel(key) })
    }
  })

  return options.length > 0 ? options : null
}

export function useBreadcrumbs({
  currentGoal,
  goalIndexAll,
  parentMapAll,
  globalRootGoals,
  useRawGoalTitles = false,
  onNavigate,
}: Params) {
  return useMemo<BreadcrumbCrumb[]>(() => {
    if (!currentGoal) return []
    const getDisplayTitle = (goal: Goal) => useRawGoalTitles ? goal.title : getAudienceGoalTitle(goal)

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
    const rootLabel = getDisplayTitle(selectedRoot)

    const rootOptions = Array.from(new Map(globalRootGoals.map((g) => [g.id, g])).values()).map((g) => ({
      id: g.id,
      label: getDisplayTitle(g),
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
      const label = goal ? getDisplayTitle(goal) : goalId
      const parentId = tail[idx - 1] ?? rootId
      const parent = goalIndexAll.get(parentId)
      const siblingGoals =
        parent?.contains
          .map((childId) => goalIndexAll.get(childId))
          .filter((child): child is Goal => Boolean(child)) || []
      let options =
        getStageNavigationOptions(siblingGoals, goal)
        ?? siblingGoals.map((child) => ({ id: child.id, label: getDisplayTitle(child) }))
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
  }, [currentGoal, goalIndexAll, parentMapAll, globalRootGoals, onNavigate, useRawGoalTitles])
}
