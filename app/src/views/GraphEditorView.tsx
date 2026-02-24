import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LanguageToggle } from '../components/LanguageToggle'
import { InlineMathText } from '../components/InlineMathText'

interface GraphGoal extends Record<string, unknown> {
  id: string
  title: string
  requires: string[]
  contains: string[]
  type?: 'atomic' | 'cluster'
  extendedData?: Record<string, unknown>
}

interface GraphLandscape extends Record<string, unknown> {
  landscapeId: string
  title: string
  goals: GraphGoal[]
}

interface GraphListResponse {
  files: string[]
}

interface GraphLoadResponse {
  path: string
  landscape: unknown
}

interface GraphSaveResponse {
  path: string
}

type GoalRequireKind = 'atomic' | 'nonAtomic' | 'unresolved'

interface GoalRequireInfo {
  ref: string
  normalizedRef: string
  kind: GoalRequireKind
  goal?: GraphGoal
}

const ORDER_KEYS = ['treeOrder', 'sortOrder', 'displayOrder', 'order', 'position'] as const

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

const asString = (value: unknown, fallback = ''): string => {
  return typeof value === 'string' ? value : fallback
}

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === 'string')
}

const normalizeGoal = (value: unknown, index: number): GraphGoal => {
  const record = asRecord(value)
  const typeRaw = record.type
  const type = typeRaw === 'atomic' || typeRaw === 'cluster' ? typeRaw : undefined

  const extendedDataRaw = asRecord(record.extendedData)
  const extendedData = Object.keys(extendedDataRaw).length > 0 ? extendedDataRaw : undefined

  return {
    ...record,
    id: asString(record.id, `goal_${index + 1}`),
    title: asString(record.title, `Goal ${index + 1}`),
    requires: asStringArray(record.requires),
    contains: asStringArray(record.contains),
    type,
    extendedData,
  }
}

const normalizeLandscape = (value: unknown): GraphLandscape => {
  const record = asRecord(value)
  const goalsRaw = Array.isArray(record.goals) ? record.goals : []

  return {
    ...record,
    landscapeId: asString(record.landscapeId),
    title: asString(record.title),
    goals: goalsRaw.map((goal, index) => normalizeGoal(goal, index)),
  }
}

const normalizeGoalRef = (ref: string): string => {
  const idx = ref.indexOf(':')
  if (idx >= 0 && idx < ref.length - 1) return ref.slice(idx + 1)
  return ref
}

const refsMatch = (a: string, b: string): boolean => normalizeGoalRef(a) === normalizeGoalRef(b)

const isAtomicGoal = (goal: GraphGoal): boolean => {
  if (goal.type === 'atomic') return true
  if (goal.type === 'cluster') return false
  return (goal.contains?.length ?? 0) === 0
}

const toNumericOrder = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const readGoalOrder = (goal: GraphGoal): number | undefined => {
  const extended = asRecord(goal.extendedData)
  for (const key of ORDER_KEYS) {
    const direct = toNumericOrder((goal as Record<string, unknown>)[key])
    if (direct !== undefined) return direct
    const fromExtended = toNumericOrder(extended[key])
    if (fromExtended !== undefined) return fromExtended
  }
  return undefined
}

const dedupeGoalRefs = (refs: string[]): string[] => {
  const seen = new Set<string>()
  const deduped: string[] = []

  refs.forEach((ref) => {
    const normalized = normalizeGoalRef(ref)
    if (!normalized || seen.has(normalized)) return
    seen.add(normalized)
    deduped.push(ref)
  })

  return deduped
}

const arraysEqual = (left: string[], right: string[]): boolean => {
  if (left.length !== right.length) return false
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) return false
  }
  return true
}

const requestJson = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || `Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export const GraphEditorView: React.FC = () => {
  const [landscapeFiles, setLandscapeFiles] = useState<string[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [landscape, setLandscape] = useState<GraphLandscape | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set())
  const [expandedCandidateIds, setExpandedCandidateIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [showOnlyProblemGoals, setShowOnlyProblemGoals] = useState(false)
  const [addRequireSearch, setAddRequireSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const goalById = useMemo(() => {
    const map = new Map<string, GraphGoal>()
    for (const goal of landscape?.goals ?? []) {
      map.set(goal.id, goal)
    }
    return map
  }, [landscape])

  const compareGoalIds = useCallback(
    (leftId: string, rightId: string): number => {
      const left = goalById.get(leftId)
      const right = goalById.get(rightId)
      if (!left && !right) return leftId.localeCompare(rightId)
      if (!left) return 1
      if (!right) return -1

      const leftOrder = readGoalOrder(left)
      const rightOrder = readGoalOrder(right)
      if (leftOrder !== undefined && rightOrder !== undefined && leftOrder !== rightOrder) {
        return leftOrder - rightOrder
      }
      if (leftOrder !== undefined && rightOrder === undefined) return -1
      if (leftOrder === undefined && rightOrder !== undefined) return 1

      const byTitle = left.title.localeCompare(right.title, 'de')
      if (byTitle !== 0) return byTitle
      return left.id.localeCompare(right.id)
    },
    [goalById],
  )

  const { childrenById, parentById, rootGoalIds, orderedGoalIds } = useMemo(() => {
    const childrenMap = new Map<string, string[]>()
    const parentMap = new Map<string, string[]>()
    const goalIds = landscape?.goals.map((goal) => goal.id) ?? []

    goalIds.forEach((goalId) => {
      childrenMap.set(goalId, [])
      parentMap.set(goalId, [])
    })

    for (const goal of landscape?.goals ?? []) {
      const targetChildren = childrenMap.get(goal.id)
      if (!targetChildren) continue
      const seenChildren = new Set<string>()
      for (const ref of goal.contains) {
        const childId = normalizeGoalRef(ref)
        if (!goalById.has(childId) || childId === goal.id || seenChildren.has(childId)) continue
        targetChildren.push(childId)
        seenChildren.add(childId)
        const currentParents = parentMap.get(childId) ?? []
        currentParents.push(goal.id)
        parentMap.set(childId, currentParents)
      }
      targetChildren.sort(compareGoalIds)
    }

    parentMap.forEach((parents, goalId) => {
      const deduped = Array.from(new Set(parents))
      deduped.sort(compareGoalIds)
      parentMap.set(goalId, deduped)
    })

    const roots = goalIds.filter((goalId) => (parentMap.get(goalId)?.length ?? 0) === 0)
    roots.sort(compareGoalIds)

    const ordered = roots.slice()
    goalIds
      .filter((goalId) => !roots.includes(goalId))
      .sort(compareGoalIds)
      .forEach((goalId) => ordered.push(goalId))

    return {
      childrenById: childrenMap,
      parentById: parentMap,
      rootGoalIds: roots,
      orderedGoalIds: ordered,
    }
  }, [compareGoalIds, goalById, landscape])

  const requireInfoByGoal = useMemo(() => {
    const info = new Map<string, GoalRequireInfo[]>()

    for (const goal of landscape?.goals ?? []) {
      const requires = dedupeGoalRefs(goal.requires)
      const details: GoalRequireInfo[] = requires.map((ref) => {
        const normalizedRef = normalizeGoalRef(ref)
        const resolved = goalById.get(normalizedRef)
        if (!resolved) {
          return { ref, normalizedRef, kind: 'unresolved' }
        }
        if (isAtomicGoal(resolved)) {
          return { ref, normalizedRef, kind: 'atomic', goal: resolved }
        }
        return { ref, normalizedRef, kind: 'nonAtomic', goal: resolved }
      })
      info.set(goal.id, details)
    }

    return info
  }, [goalById, landscape])

  const problemGoalIds = useMemo(() => {
    const ids: string[] = []
    for (const goal of landscape?.goals ?? []) {
      const details = requireInfoByGoal.get(goal.id) ?? []
      if (details.some((entry) => entry.kind === 'nonAtomic')) {
        ids.push(goal.id)
      }
    }
    ids.sort(compareGoalIds)
    return ids
  }, [compareGoalIds, landscape, requireInfoByGoal])

  const problemGoalSet = useMemo(() => new Set(problemGoalIds), [problemGoalIds])

  const atomicDescendantsById = useMemo(() => {
    const memo = new Map<string, string[]>()

    const visit = (goalId: string, stack: Set<string>): string[] => {
      const cached = memo.get(goalId)
      if (cached) return cached
      if (stack.has(goalId)) return []

      const goal = goalById.get(goalId)
      if (!goal) return []

      stack.add(goalId)
      let result: string[]

      if (isAtomicGoal(goal)) {
        result = [goalId]
      } else {
        const unique = new Set<string>()
        for (const childId of childrenById.get(goalId) ?? []) {
          visit(childId, stack).forEach((atomicId) => unique.add(atomicId))
        }
        result = Array.from(unique).sort(compareGoalIds)
      }

      stack.delete(goalId)
      memo.set(goalId, result)
      return result
    }

    for (const goalId of orderedGoalIds) {
      visit(goalId, new Set<string>())
    }

    return memo
  }, [childrenById, compareGoalIds, goalById, orderedGoalIds])

  const selectedGoal = selectedGoalId ? goalById.get(selectedGoalId) ?? null : null
  const selectedGoalRequireInfo = useMemo(
    () => (selectedGoal ? requireInfoByGoal.get(selectedGoal.id) ?? [] : []),
    [requireInfoByGoal, selectedGoal],
  )

  const selectedGoalNonAtomic = useMemo(
    () => selectedGoalRequireInfo.filter((entry) => entry.kind === 'nonAtomic'),
    [selectedGoalRequireInfo],
  )
  const selectedGoalAtomic = useMemo(
    () => selectedGoalRequireInfo.filter((entry) => entry.kind === 'atomic'),
    [selectedGoalRequireInfo],
  )
  const selectedGoalUnresolved = useMemo(
    () => selectedGoalRequireInfo.filter((entry) => entry.kind === 'unresolved'),
    [selectedGoalRequireInfo],
  )

  const selectedClusterCandidates = useMemo(
    () =>
      selectedGoalNonAtomic.map((entry) => ({
        ...entry,
        atomicDescendants: atomicDescendantsById.get(entry.normalizedRef) ?? [],
      })),
    [atomicDescendantsById, selectedGoalNonAtomic],
  )

  const selectedRequireIdSet = useMemo(
    () => new Set((selectedGoal?.requires ?? []).map((ref) => normalizeGoalRef(ref))),
    [selectedGoal],
  )
  const addRequireSearchTerm = addRequireSearch.trim().toLowerCase()

  const addRequireCandidates = useMemo(() => {
    if (!selectedGoal) return []

    const candidates = orderedGoalIds
      .map((goalId) => goalById.get(goalId))
      .filter((goal): goal is GraphGoal => {
        if (!goal) return false
        if (goal.id === selectedGoal.id) return false
        if (selectedRequireIdSet.has(goal.id)) return false

        if (!addRequireSearchTerm) return true
        const haystack = `${goal.id} ${goal.title}`.toLowerCase()
        return haystack.includes(addRequireSearchTerm)
      })

    return candidates.slice(0, 250)
  }, [addRequireSearchTerm, goalById, orderedGoalIds, selectedGoal, selectedRequireIdSet])

  const loadLandscapeFile = useCallback(async (path: string) => {
    const response = await requestJson<GraphLoadResponse>(`/__graph-editor/load?path=${encodeURIComponent(path)}`)
    return normalizeLandscape(response.landscape)
  }, [])

  const loadSelectedLandscape = useCallback(async () => {
    if (!selectedPath) return

    setLoading(true)
    setStatusMessage(null)
    setErrorMessage(null)
    try {
      const loaded = await loadLandscapeFile(selectedPath)
      setLandscape(loaded)
      setDirty(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Landscape konnte nicht geladen werden.'
      setErrorMessage(message)
    } finally {
      setLoading(false)
    }
  }, [loadLandscapeFile, selectedPath])

  useEffect(() => {
    let isCancelled = false

    const loadFileList = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const response = await requestJson<GraphListResponse>('/__graph-editor/list')
        if (isCancelled) return
        const files = response.files.slice().sort((left, right) => left.localeCompare(right))
        setLandscapeFiles(files)
        if (files.length > 0) {
          setSelectedPath((previous) => previous || files[0])
        }
      } catch (error) {
        if (isCancelled) return
        const message = error instanceof Error ? error.message : 'Dateiliste konnte nicht geladen werden.'
        setErrorMessage(message)
      } finally {
        if (!isCancelled) setLoading(false)
      }
    }

    void loadFileList()
    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedPath) return
    void loadSelectedLandscape()
  }, [loadSelectedLandscape, selectedPath])

  useEffect(() => {
    if (!landscape) {
      setSelectedGoalId('')
      setExpandedGoalIds(new Set())
      return
    }

    setSelectedGoalId((previous) => {
      if (previous && goalById.has(previous)) return previous
      return problemGoalIds[0] ?? orderedGoalIds[0] ?? ''
    })

    setExpandedGoalIds(new Set(rootGoalIds))
  }, [goalById, landscape, orderedGoalIds, problemGoalIds, rootGoalIds])

  useEffect(() => {
    if (selectedClusterCandidates.length === 0) {
      setExpandedCandidateIds(new Set())
      return
    }
    setExpandedCandidateIds(new Set(selectedClusterCandidates.map((entry) => entry.normalizedRef)))
  }, [selectedClusterCandidates])

  const setGoalRequires = useCallback((goalId: string, updater: (current: string[]) => string[]) => {
    setLandscape((previous) => {
      if (!previous) return previous
      const goalIndex = previous.goals.findIndex((goal) => goal.id === goalId)
      if (goalIndex < 0) return previous

      const currentGoal = previous.goals[goalIndex]
      const currentRequires = dedupeGoalRefs(currentGoal.requires)
      const updated = dedupeGoalRefs(updater(currentRequires))

      if (arraysEqual(currentRequires, updated)) return previous

      const goals = previous.goals.slice()
      goals[goalIndex] = { ...currentGoal, requires: updated }
      setDirty(true)
      return { ...previous, goals }
    })
  }, [])

  const handleToggleAtomicRequire = useCallback(
    (atomicGoalId: string, checked: boolean) => {
      if (!selectedGoal) return
      setGoalRequires(selectedGoal.id, (current) => {
        if (checked) {
          if (current.some((ref) => refsMatch(ref, atomicGoalId))) return current
          return [...current, atomicGoalId]
        }
        return current.filter((ref) => !refsMatch(ref, atomicGoalId))
      })
    },
    [selectedGoal, setGoalRequires],
  )

  const handleRemoveRequireRef = useCallback(
    (normalizedRef: string) => {
      if (!selectedGoal) return
      setGoalRequires(selectedGoal.id, (current) => current.filter((ref) => !refsMatch(ref, normalizedRef)))
    },
    [selectedGoal, setGoalRequires],
  )

  const handleAddAtomicRefs = useCallback(
    (atomicRefs: string[]) => {
      if (!selectedGoal || atomicRefs.length === 0) return
      setGoalRequires(selectedGoal.id, (current) => {
        const next = current.slice()
        atomicRefs.forEach((atomicRef) => {
          if (!next.some((ref) => refsMatch(ref, atomicRef))) {
            next.push(atomicRef)
          }
        })
        return next
      })
    },
    [selectedGoal, setGoalRequires],
  )

  const handleAddRequireRef = useCallback(
    (goalRef: string) => {
      if (!selectedGoal) return
      setGoalRequires(selectedGoal.id, (current) => {
        if (current.some((ref) => refsMatch(ref, goalRef))) return current
        return [...current, goalRef]
      })
    },
    [selectedGoal, setGoalRequires],
  )

  const handleConvertSelectedGoal = useCallback(() => {
    if (!selectedGoal) return

    let replacedClusters = 0
    let addedAtomics = 0
    const currentRequires = dedupeGoalRefs(selectedGoal.requires)
    let nextRequires = currentRequires.slice()

    selectedClusterCandidates.forEach((cluster) => {
      if (cluster.atomicDescendants.length === 0) return

      cluster.atomicDescendants.forEach((atomicRef) => {
        if (!nextRequires.some((ref) => refsMatch(ref, atomicRef))) {
          nextRequires.push(atomicRef)
          addedAtomics += 1
        }
      })

      const before = nextRequires.length
      nextRequires = nextRequires.filter((ref) => !refsMatch(ref, cluster.normalizedRef))
      if (nextRequires.length !== before) {
        replacedClusters += 1
      }
    })

    setGoalRequires(selectedGoal.id, () => nextRequires)

    setStatusMessage(
      `Konvertiert: ${replacedClusters} Cluster-Require entfernt, ${addedAtomics} atomare Requires ergänzt.`,
    )
    setErrorMessage(null)
  }, [selectedClusterCandidates, selectedGoal, setGoalRequires])

  const handleConvertAllGoals = useCallback(() => {
    if (!landscape) return

    let changedGoals = 0
    let replacedClusters = 0
    let addedAtomics = 0

    const nextGoals = landscape.goals.map((goal) => {
      let nextRequires = dedupeGoalRefs(goal.requires)
      let changed = false

      goal.requires.forEach((ref) => {
        const normalized = normalizeGoalRef(ref)
        const targetGoal = goalById.get(normalized)
        if (!targetGoal || isAtomicGoal(targetGoal)) return

        const atomicDescendants = atomicDescendantsById.get(targetGoal.id) ?? []
        if (atomicDescendants.length === 0) return

        atomicDescendants.forEach((atomicRef) => {
          if (!nextRequires.some((entry) => refsMatch(entry, atomicRef))) {
            nextRequires.push(atomicRef)
            addedAtomics += 1
            changed = true
          }
        })

        const before = nextRequires.length
        nextRequires = nextRequires.filter((entry) => !refsMatch(entry, targetGoal.id))
        if (nextRequires.length !== before) {
          replacedClusters += 1
          changed = true
        }
      })

      nextRequires = dedupeGoalRefs(nextRequires)
      if (!changed && arraysEqual(nextRequires, dedupeGoalRefs(goal.requires))) {
        return goal
      }

      changedGoals += 1
      return { ...goal, requires: nextRequires }
    })

    if (changedGoals === 0) {
      setStatusMessage('Keine automatisch konvertierbaren Cluster-Requires gefunden.')
      setErrorMessage(null)
      return
    }

    setLandscape({ ...landscape, goals: nextGoals })
    setDirty(true)
    setStatusMessage(
      `Datei aktualisiert: ${changedGoals} Ziele angepasst, ${replacedClusters} Cluster-Requires entfernt, ${addedAtomics} atomare Requires ergänzt.`,
    )
    setErrorMessage(null)
  }, [atomicDescendantsById, goalById, landscape])

  const confirmDiscardChanges = useCallback(() => {
    if (!dirty) return true
    return window.confirm('Ungespeicherte Änderungen verwerfen?')
  }, [dirty])

  const handleReload = useCallback(() => {
    if (!confirmDiscardChanges()) return
    void loadSelectedLandscape()
  }, [confirmDiscardChanges, loadSelectedLandscape])

  const handleSave = useCallback(async () => {
    if (!selectedPath || !landscape) return
    setSaving(true)
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      await requestJson<GraphSaveResponse>('/__graph-editor/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPath, landscape }),
      })
      setDirty(false)
      setStatusMessage('Landscape erfolgreich gespeichert.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speichern fehlgeschlagen.'
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }, [landscape, selectedPath])

  const handlePathChange = useCallback(
    (nextPath: string) => {
      if (nextPath === selectedPath) return
      if (!confirmDiscardChanges()) return
      setSelectedPath(nextPath)
      setSearch('')
      setShowOnlyProblemGoals(false)
      setStatusMessage(null)
      setErrorMessage(null)
    },
    [confirmDiscardChanges, selectedPath],
  )

  const searchTerm = search.trim().toLowerCase()

  const visibleGoalIds = useMemo(() => {
    const visibilityCache = new Map<string, boolean>()
    const stack = new Set<string>()

    const matchesSelf = (goalId: string): boolean => {
      const goal = goalById.get(goalId)
      if (!goal) return false

      const matchProblem = !showOnlyProblemGoals || problemGoalSet.has(goalId)
      if (!matchProblem) return false

      if (!searchTerm) return true
      const haystack = `${goal.id} ${goal.title}`.toLowerCase()
      return haystack.includes(searchTerm)
    }

    const evaluate = (goalId: string): boolean => {
      const cached = visibilityCache.get(goalId)
      if (cached !== undefined) return cached
      if (stack.has(goalId)) return false

      stack.add(goalId)
      let visible = matchesSelf(goalId)

      for (const childId of childrenById.get(goalId) ?? []) {
        if (evaluate(childId)) visible = true
      }

      stack.delete(goalId)
      visibilityCache.set(goalId, visible)
      return visible
    }

    orderedGoalIds.forEach((goalId) => {
      evaluate(goalId)
    })

    return new Set(
      Array.from(visibilityCache.entries())
        .filter(([, visible]) => visible)
        .map(([goalId]) => goalId),
    )
  }, [childrenById, goalById, orderedGoalIds, problemGoalSet, searchTerm, showOnlyProblemGoals])

  const treeRootIds = useMemo(() => {
    const roots: string[] = []
    const seen = new Set<string>()

    const pushRoot = (goalId: string) => {
      if (!visibleGoalIds.has(goalId) || seen.has(goalId)) return
      seen.add(goalId)
      roots.push(goalId)
    }

    rootGoalIds.forEach(pushRoot)

    orderedGoalIds.forEach((goalId) => {
      if (!visibleGoalIds.has(goalId)) return
      const visibleParent = (parentById.get(goalId) ?? []).some((parentId) => visibleGoalIds.has(parentId))
      if (!visibleParent) {
        pushRoot(goalId)
      }
    })

    return roots
  }, [orderedGoalIds, parentById, rootGoalIds, visibleGoalIds])

  const visibleGoalsCount = visibleGoalIds.size

  const renderGoalNode = useCallback(
    (goalId: string, depth: number, ancestry: Set<string>): React.ReactNode => {
      if (!visibleGoalIds.has(goalId)) return null
      const goal = goalById.get(goalId)
      if (!goal) return null

      const children = (childrenById.get(goalId) ?? []).filter((childId) => visibleGoalIds.has(childId))
      const hasChildren = children.length > 0
      const isExpanded = expandedGoalIds.has(goalId)
      const isSelected = selectedGoalId === goalId
      const nonAtomicCount = (requireInfoByGoal.get(goalId) ?? []).filter((entry) => entry.kind === 'nonAtomic').length
      const unresolvedCount = (requireInfoByGoal.get(goalId) ?? []).filter((entry) => entry.kind === 'unresolved').length

      const nextAncestry = new Set(ancestry)
      nextAncestry.add(goalId)

      return (
        <div key={`goal-tree-${goalId}`}>
          <div
            className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm transition-colors ${isSelected
              ? 'border-sky-400 bg-sky-50 dark:border-sky-500/60 dark:bg-sky-950/30'
              : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <button
              type="button"
              onClick={() => {
                if (!hasChildren) return
                setExpandedGoalIds((previous) => {
                  const next = new Set(previous)
                  if (next.has(goalId)) {
                    next.delete(goalId)
                  } else {
                    next.add(goalId)
                  }
                  return next
                })
              }}
              className={`h-4 w-4 rounded text-[10px] leading-none text-text-secondary ${hasChildren ? 'hover:bg-slate-200 dark:hover:bg-slate-700/70' : 'invisible'
                }`}
              aria-label={hasChildren ? 'Unterziele ein-/ausklappen' : undefined}
            >
              {isExpanded ? '▼' : '▶'}
            </button>

            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => setSelectedGoalId(goalId)}
            >
              <InlineMathText text={goal.title} className="truncate font-medium text-text-primary" />
            </button>

            {nonAtomicCount > 0 ? (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                {nonAtomicCount} cluster
              </span>
            ) : null}
            {unresolvedCount > 0 ? (
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                {unresolvedCount} offen
              </span>
            ) : null}
          </div>

          {hasChildren && isExpanded ? (
            <div>
              {children.map((childId) => {
                if (nextAncestry.has(childId)) {
                  return (
                    <div
                      key={`cycle-${goalId}-${childId}`}
                      className="ml-8 rounded border border-rose-300/40 bg-rose-50 px-2 py-1 text-xs text-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
                    >
                      Zyklus erkannt bei {childId}
                    </div>
                  )
                }
                return renderGoalNode(childId, depth + 1, nextAncestry)
              })}
            </div>
          ) : null}
        </div>
      )
    },
    [
      childrenById,
      expandedGoalIds,
      goalById,
      requireInfoByGoal,
      selectedGoalId,
      visibleGoalIds,
    ],
  )

  const renderCandidateNode = useCallback(
    (goalId: string, depth: number, branchKey: string, ancestry: Set<string>): React.ReactNode => {
      const goal = goalById.get(goalId)
      if (!goal) return null

      const atomic = isAtomicGoal(goal)
      const children = (childrenById.get(goalId) ?? []).filter((childId) => goalById.has(childId))
      const hasChildren = children.length > 0
      const expanded = expandedCandidateIds.has(goalId)

      if (atomic) {
        const checked = selectedRequireIdSet.has(goalId)
        return (
          <label
            key={`${branchKey}:${goalId}`}
            className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800/70"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => handleToggleAtomicRequire(goalId, event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-sky-600"
            />
            <div className="min-w-0">
              <InlineMathText text={goal.title} className="truncate text-text-primary" />
              <div className="text-[11px] text-text-secondary font-mono">{goal.id}</div>
            </div>
          </label>
        )
      }

      const atomicDescendants = atomicDescendantsById.get(goalId) ?? []
      const selectedAtomicCount = atomicDescendants.filter((id) => selectedRequireIdSet.has(id)).length

      const nextAncestry = new Set(ancestry)
      nextAncestry.add(goalId)

      return (
        <div key={`${branchKey}:${goalId}`}>
          <div
            className="flex items-center gap-2 rounded px-2 py-1 text-sm"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <button
              type="button"
              onClick={() => {
                if (!hasChildren) return
                setExpandedCandidateIds((previous) => {
                  const next = new Set(previous)
                  if (next.has(goalId)) {
                    next.delete(goalId)
                  } else {
                    next.add(goalId)
                  }
                  return next
                })
              }}
              className={`h-4 w-4 rounded text-[10px] leading-none text-text-secondary ${hasChildren ? 'hover:bg-slate-200 dark:hover:bg-slate-700/70' : 'invisible'
                }`}
              aria-label={hasChildren ? 'Unterziele ein-/ausklappen' : undefined}
            >
              {expanded ? '▼' : '▶'}
            </button>

            <InlineMathText text={goal.title} className="truncate flex-1 text-text-primary" />
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-text-secondary dark:bg-slate-800">
              {selectedAtomicCount}/{atomicDescendants.length} atomar
            </span>
          </div>

          {hasChildren && expanded ? (
            <div>
              {children.map((childId) => {
                if (nextAncestry.has(childId)) {
                  return (
                    <div
                      key={`${branchKey}:${goalId}:${childId}:cycle`}
                      className="ml-6 rounded border border-rose-300/40 bg-rose-50 px-2 py-1 text-xs text-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
                    >
                      Zyklus erkannt bei {childId}
                    </div>
                  )
                }
                return renderCandidateNode(childId, depth + 1, `${branchKey}:${goalId}`, nextAncestry)
              })}
            </div>
          ) : null}
        </div>
      )
    },
    [
      atomicDescendantsById,
      childrenById,
      expandedCandidateIds,
      goalById,
      handleToggleAtomicRequire,
      selectedRequireIdSet,
    ],
  )

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary p-4 md:p-6">
      <div className="mx-auto max-w-[1900px] flex flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">Graph Editor (requires)</h1>
              <p className="text-sm text-text-secondary">
                Lokaler Editor, um `requires` gezielt auf atomare Ziele umzubauen.
              </p>
            </div>
            <LanguageToggle />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto]">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Landscape-Datei</span>
              <select
                value={selectedPath}
                onChange={(event) => handlePathChange(event.target.value)}
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
              >
                {landscapeFiles.map((path) => (
                  <option key={path} value={path}>
                    {path}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleReload}
              disabled={loading}
              className="h-fit self-end rounded-lg border border-border-color px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? 'Lade ...' : 'Neu laden'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading || !landscape}
              className="h-fit self-end rounded-lg bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? 'Speichere ...' : 'Speichern'}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span>{dirty ? 'Ungespeicherte Änderungen vorhanden.' : 'Keine ausstehenden Änderungen.'}</span>
            <span>
              Ziele: <strong>{landscape?.goals.length ?? 0}</strong>
            </span>
            <span>
              Ziele mit nicht-atomaren Requires: <strong>{problemGoalIds.length}</strong>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleConvertAllGoals}
              disabled={!landscape}
              className="rounded-lg border border-amber-300 text-amber-800 dark:text-amber-200 px-3 py-1.5 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
            >
              Auto: gesamte Datei Cluster → atomar
            </button>
          </div>

          {statusMessage ? (
            <div className="mt-3 rounded-lg border border-green-300 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200 px-3 py-2 text-sm">
              {statusMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-red-300 bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-200 px-3 py-2 text-sm font-sans">
              {errorMessage}
            </pre>
          ) : null}
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[360px_1fr_560px] gap-4 items-start">
          <aside className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-2">Zielbaum</h2>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Suche nach ID oder Titel ..."
              className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
            />

            <label className="mt-2 flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyProblemGoals}
                onChange={(event) => setShowOnlyProblemGoals(event.target.checked)}
                className="h-4 w-4 accent-sky-600"
              />
              Nur Ziele mit nicht-atomaren Requires
            </label>

            <div className="mt-2 text-xs text-text-secondary">
              Sichtbar: {visibleGoalsCount} Ziele
            </div>

            <div className="mt-3 space-y-1 max-h-[72vh] overflow-y-auto pr-1">
              {treeRootIds.length === 0 ? (
                <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-text-secondary">
                  Keine Ziele für den aktuellen Filter.
                </div>
              ) : (
                treeRootIds.map((goalId) => renderGoalNode(goalId, 0, new Set<string>()))
              )}
            </div>
          </aside>

          <section className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">Ausgewähltes Ziel</h2>

            {!selectedGoal ? (
              <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-text-secondary">
                Kein Ziel ausgewählt.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-3">
                  <div className="text-xs text-text-secondary font-mono">{selectedGoal.id}</div>
                  <InlineMathText text={selectedGoal.title} className="mt-1 text-base font-semibold text-text-primary" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg border border-emerald-300/50 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-2">
                    Atomare Requires: <strong>{selectedGoalAtomic.length}</strong>
                  </div>
                  <div className="rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-2">
                    Nicht-atomare Requires: <strong>{selectedGoalNonAtomic.length}</strong>
                  </div>
                  <div className="rounded-lg border border-rose-300/50 bg-rose-50 dark:bg-rose-900/20 px-2.5 py-2">
                    Unaufgelöste Requires: <strong>{selectedGoalUnresolved.length}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConvertSelectedGoal}
                    disabled={selectedGoalNonAtomic.length === 0}
                    className="rounded-lg border border-amber-300 text-amber-800 dark:text-amber-200 px-3 py-1.5 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-50"
                  >
                    Auto: dieses Ziel Cluster → atomar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedGoal) return
                      const nonAtomicIds = selectedGoalNonAtomic.map((entry) => entry.normalizedRef)
                      setGoalRequires(
                        selectedGoal.id,
                        (current) => current.filter((ref) => !nonAtomicIds.some((id) => refsMatch(ref, id))),
                      )
                    }}
                    disabled={selectedGoalNonAtomic.length === 0}
                    className="rounded-lg border border-rose-300 text-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50"
                  >
                    Alle nicht-atomaren Requires entfernen
                  </button>
                </div>

                <div className="rounded-xl border border-border-color">
                  <div className="border-b border-border-color px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Direkte Requires
                  </div>
                  <div className="max-h-[42vh] overflow-y-auto divide-y divide-border-color">
                    {selectedGoalRequireInfo.length === 0 ? (
                      <div className="px-3 py-3 text-sm text-text-secondary">Keine direkten Requires.</div>
                    ) : (
                      selectedGoalRequireInfo.map((entry) => (
                        <div key={`${entry.ref}:${entry.normalizedRef}`} className="px-3 py-2 text-sm">
                          <div className="flex items-start gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="font-mono text-xs text-text-secondary break-all">{entry.ref}</div>
                              <div className="text-text-primary">
                                {entry.goal ? (
                                  <InlineMathText text={entry.goal.title} className="truncate" />
                                ) : (
                                  <span className="text-rose-700 dark:text-rose-300">Unaufgelöster Verweis</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${entry.kind === 'atomic'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                  : entry.kind === 'nonAtomic'
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                    : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                                  }`}
                              >
                                {entry.kind === 'atomic' ? 'atomar' : entry.kind === 'nonAtomic' ? 'cluster' : 'offen'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRequireRef(entry.normalizedRef)}
                                className="rounded border border-border-color px-1.5 py-0.5 text-[10px] hover:bg-slate-100 dark:hover:bg-slate-800"
                                title="Require entfernen"
                              >
                                entfernen
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-border-color">
                  <div className="border-b border-border-color px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Require hinzufügen
                  </div>
                  <div className="p-3">
                    <input
                      type="text"
                      value={addRequireSearch}
                      onChange={(event) => setAddRequireSearch(event.target.value)}
                      placeholder="Suche nach ID oder Titel ..."
                      className="w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                    />

                    <div className="mt-2 text-xs text-text-secondary">
                      Treffer: {addRequireCandidates.length}
                      {addRequireCandidates.length >= 250 ? ' (auf 250 begrenzt, bitte weiter eingrenzen)' : ''}
                    </div>

                    <div className="mt-2 max-h-[28vh] overflow-y-auto divide-y divide-border-color rounded-lg border border-border-color">
                      {addRequireCandidates.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-text-secondary">
                          Keine passenden, noch nicht zugeordneten Ziele.
                        </div>
                      ) : (
                        addRequireCandidates.map((candidate) => {
                          const candidateIsAtomic = isAtomicGoal(candidate)
                          const candidateKind = candidateIsAtomic ? 'atomar' : 'cluster'
                          return (
                            <div key={`add-require-${candidate.id}`} className="px-3 py-2">
                              <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="font-mono text-xs text-text-secondary break-all">{candidate.id}</div>
                                  <InlineMathText text={candidate.title} className="truncate text-sm text-text-primary" />
                                </div>
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${candidateIsAtomic
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                                      }`}
                                  >
                                    {candidateKind}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddRequireRef(candidate.id)}
                                    className="rounded border border-sky-300 px-2 py-0.5 text-[11px] font-semibold text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/20"
                                  >
                                    hinzufügen
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary mb-3">
              Atomare Zuweisung per Tree
            </h2>

            {!selectedGoal ? (
              <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-text-secondary">
                Kein Ziel ausgewählt.
              </div>
            ) : selectedClusterCandidates.length === 0 ? (
              <div className="rounded-lg border border-border-color bg-slate-50 dark:bg-slate-950/40 px-3 py-2 text-sm text-text-secondary">
                Dieses Ziel hat keine nicht-atomaren Requires.
              </div>
            ) : (
              <div className="space-y-3 max-h-[74vh] overflow-y-auto pr-1">
                {selectedClusterCandidates.map((cluster) => {
                  const selectedCount = cluster.atomicDescendants.filter((id) => selectedRequireIdSet.has(id)).length
                  return (
                    <div key={`${cluster.ref}:${cluster.normalizedRef}`} className="rounded-xl border border-border-color">
                      <div className="border-b border-border-color px-3 py-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-mono text-text-secondary break-all">{cluster.ref}</div>
                            <div className="text-sm font-semibold text-text-primary">
                              {cluster.goal ? cluster.goal.title : cluster.normalizedRef}
                            </div>
                          </div>
                          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                            {selectedCount}/{cluster.atomicDescendants.length} atomar gewählt
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddAtomicRefs(cluster.atomicDescendants)}
                            disabled={cluster.atomicDescendants.length === 0}
                            className="rounded border border-emerald-300 text-emerald-800 dark:text-emerald-200 px-2 py-1 text-[11px] font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
                          >
                            Alle atomaren Nachfahren auswählen
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedGoal) return
                              setGoalRequires(
                                selectedGoal.id,
                                (current) =>
                                  current.filter(
                                    (ref) =>
                                      !cluster.atomicDescendants.some((atomicId) => refsMatch(ref, atomicId)),
                                  ),
                              )
                            }}
                            disabled={cluster.atomicDescendants.length === 0}
                            className="rounded border border-border-color px-2 py-1 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                          >
                            Atomare Auswahl leeren
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequireRef(cluster.normalizedRef)}
                            className="rounded border border-rose-300 text-rose-700 dark:text-rose-300 px-2 py-1 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          >
                            Cluster-Require entfernen
                          </button>
                        </div>
                      </div>

                      <div className="py-2">
                        {renderCandidateNode(cluster.normalizedRef, 0, cluster.normalizedRef, new Set<string>())}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  )
}
