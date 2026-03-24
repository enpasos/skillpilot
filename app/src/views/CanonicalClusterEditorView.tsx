import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { LanguageToggle } from '../components/LanguageToggle'
import { InlineMathText } from '../components/InlineMathText'
import { requestJson } from '../utils/authoring/authoringClient'
import {
  buildCanonicalGoalWarnings,
  buildCanonicalGraphIndex,
  deriveNewClusterFromParent,
  normalizeCanonicalLandscape,
  normalizeGoalRef,
  resolveCanonicalNodeType,
  type CanonicalAuthoringGoal,
  type CanonicalAuthoringLandscape,
  validateCanonicalLandscape,
} from '../utils/authoring/canonicalAuthoring'

interface CanonicalLandscapeListResponse {
  files: string[]
}

interface CanonicalLandscapeLoadResponse {
  path: string
  landscape: unknown
}

interface CanonicalLandscapeSaveResponse {
  path: string
}

const parseTags = (raw: string): string[] => (
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
)

const formatTags = (tags?: string[]): string => (tags ?? []).join(', ')

export const CanonicalClusterEditorView: React.FC = () => {
  const [landscapeFiles, setLandscapeFiles] = useState<string[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [landscape, setLandscape] = useState<CanonicalAuthoringLandscape | null>(null)
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [expandedGoalIds, setExpandedGoalIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [showClustersOnly, setShowClustersOnly] = useState(true)
  const [addChildSearch, setAddChildSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const goalById = useMemo(() => {
    const map = new Map<string, CanonicalAuthoringGoal>()
    for (const goal of landscape?.goals ?? []) {
      map.set(goal.id, goal)
    }
    return map
  }, [landscape])

  const canonicalIndex = useMemo(() => buildCanonicalGraphIndex(landscape), [landscape])
  const { childrenById, compareGoalIds, descendantsById, parentById, rootGoalIds } = canonicalIndex

  const selectedGoal = selectedGoalId ? goalById.get(selectedGoalId) ?? null : null
  const selectedGoalType = selectedGoal ? resolveCanonicalNodeType(selectedGoal) : undefined
  const selectedGoalIsCluster = selectedGoalType === 'cluster'

  const globalErrors = useMemo(() => {
    return canonicalIndex.goalById.size === 0
      ? []
      : validateCanonicalLandscape(landscape, canonicalIndex)
  }, [canonicalIndex, landscape])

  const selectedGoalWarnings = useMemo(() => {
    if (!selectedGoal) return []
    return buildCanonicalGoalWarnings(selectedGoal, parentById.get(selectedGoal.id)?.length ?? 0)
  }, [parentById, selectedGoal])

  const selectedGoalDiagnostics = useMemo(() => {
    if (!selectedGoal) return []
    return [
      ...globalErrors.filter((entry) => entry.goalId === selectedGoal.id),
      ...selectedGoalWarnings,
    ]
  }, [globalErrors, selectedGoal, selectedGoalWarnings])

  const loadLandscapeFile = useCallback(async (path: string) => {
    const response = await requestJson<CanonicalLandscapeLoadResponse>(`/__canonical-cluster-editor/load?path=${encodeURIComponent(path)}`)
    return normalizeCanonicalLandscape(response.landscape)
  }, [])

  const loadSelectedLandscape = useCallback(async () => {
    if (!selectedPath) return
    setLoading(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const loaded = await loadLandscapeFile(selectedPath)
      setLandscape(loaded)
      setDirty(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Canonical landscape konnte nicht geladen werden.'
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
        const response = await requestJson<CanonicalLandscapeListResponse>('/__canonical-cluster-editor/list')
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
      return rootGoalIds[0] ?? landscape.goals[0]?.id ?? ''
    })

    setExpandedGoalIds(new Set(rootGoalIds))
  }, [goalById, landscape, rootGoalIds])

  const confirmDiscardChanges = useCallback(() => {
    if (!dirty) return true
    return window.confirm('Ungespeicherte Änderungen verwerfen?')
  }, [dirty])

  const handleReload = useCallback(() => {
    if (!confirmDiscardChanges()) return
    void loadSelectedLandscape()
  }, [confirmDiscardChanges, loadSelectedLandscape])

  const handlePathChange = useCallback((nextPath: string) => {
    if (nextPath === selectedPath) return
    if (!confirmDiscardChanges()) return
    setSelectedPath(nextPath)
    setSearch('')
    setAddChildSearch('')
    setStatusMessage(null)
    setErrorMessage(null)
  }, [confirmDiscardChanges, selectedPath])

  const updateGoal = useCallback((goalId: string, updater: (goal: CanonicalAuthoringGoal) => CanonicalAuthoringGoal) => {
    setLandscape((previous) => {
      if (!previous) return previous
      const goalIndex = previous.goals.findIndex((goal) => goal.id === goalId)
      if (goalIndex < 0) return previous
      const currentGoal = previous.goals[goalIndex]
      const nextGoal = updater(currentGoal)
      if (nextGoal === currentGoal) return previous
      const nextGoals = previous.goals.slice()
      nextGoals[goalIndex] = nextGoal
      setDirty(true)
      return { ...previous, goals: nextGoals }
    })
  }, [])

  const handleSetGoalField = useCallback((goalId: string, field: 'title' | 'titleEn' | 'description' | 'descriptionEn' | 'shortKey', value: string) => {
    updateGoal(goalId, (goal) => ({ ...goal, [field]: value }))
  }, [updateGoal])

  const handleSetGoalTags = useCallback((goalId: string, raw: string) => {
    updateGoal(goalId, (goal) => {
      const nextTags = parseTags(raw)
      if (nextTags.length === 0) {
        const nextGoal = { ...goal }
        delete nextGoal.tags
        return nextGoal
      }
      return { ...goal, tags: nextTags }
    })
  }, [updateGoal])

  const handleMoveChild = useCallback((childId: string, direction: -1 | 1) => {
    if (!selectedGoal) return
    updateGoal(selectedGoal.id, (goal) => {
      const index = goal.contains.findIndex((ref) => normalizeGoalRef(ref) === childId)
      if (index < 0) return goal
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= goal.contains.length) return goal
      const nextContains = goal.contains.slice()
      const [entry] = nextContains.splice(index, 1)
      nextContains.splice(nextIndex, 0, entry)
      return { ...goal, contains: nextContains }
    })
  }, [selectedGoal, updateGoal])

  const handleRemoveChild = useCallback((childId: string) => {
    if (!selectedGoal) return
    updateGoal(selectedGoal.id, (goal) => ({
      ...goal,
      contains: goal.contains.filter((ref) => normalizeGoalRef(ref) !== childId),
    }))
  }, [selectedGoal, updateGoal])

  const handleAddChild = useCallback((childId: string) => {
    if (!selectedGoal) return
    updateGoal(selectedGoal.id, (goal) => {
      if (goal.contains.some((ref) => normalizeGoalRef(ref) === childId)) return goal
      return { ...goal, contains: [...goal.contains, childId] }
    })
    setAddChildSearch('')
  }, [selectedGoal, updateGoal])

  const handleCreateRootCluster = useCallback(() => {
    setLandscape((previous) => {
      if (!previous) return previous
      const newCluster = deriveNewClusterFromParent(undefined)
      setDirty(true)
      setSelectedGoalId(newCluster.id)
      return { ...previous, goals: [...previous.goals, newCluster] }
    })
    setStatusMessage('Neuer Root-Cluster angelegt.')
    setErrorMessage(null)
  }, [])

  const handleCreateChildCluster = useCallback(() => {
    if (!selectedGoal || !selectedGoalIsCluster) return
    const newCluster = deriveNewClusterFromParent(selectedGoal)
    setLandscape((previous) => {
      if (!previous) return previous
      const parentIndex = previous.goals.findIndex((goal) => goal.id === selectedGoal.id)
      if (parentIndex < 0) return previous
      const nextGoals = previous.goals.slice()
      const parentGoal = nextGoals[parentIndex]
      nextGoals[parentIndex] = {
        ...parentGoal,
        contains: [...parentGoal.contains, newCluster.id],
      }
      nextGoals.push(newCluster)
      setDirty(true)
      return { ...previous, goals: nextGoals }
    })
    setExpandedGoalIds((previous) => new Set(previous).add(selectedGoal.id))
    setSelectedGoalId(newCluster.id)
    setStatusMessage('Neuer Untercluster angelegt.')
    setErrorMessage(null)
  }, [selectedGoal, selectedGoalIsCluster])

  const handleSave = useCallback(async () => {
    if (!selectedPath || !landscape) return
    if (globalErrors.length > 0) {
      setErrorMessage('Speichern blockiert: Bitte zuerst die Fehler im contains-Graph beheben.')
      setStatusMessage(null)
      return
    }

    setSaving(true)
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      await requestJson<CanonicalLandscapeSaveResponse>('/__canonical-cluster-editor/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedPath, landscape }),
      })
      setDirty(false)
      setStatusMessage('Canonical landscape erfolgreich gespeichert.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speichern fehlgeschlagen.'
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }, [globalErrors.length, landscape, selectedPath])

  const searchTerm = search.trim().toLowerCase()

  const visibleGoalIds = useMemo(() => {
    const visibilityCache = new Map<string, boolean>()
    const stack = new Set<string>()

    const matchesSelf = (goalId: string): boolean => {
      const goal = goalById.get(goalId)
      if (!goal) return false
      if (showClustersOnly && resolveCanonicalNodeType(goal) !== 'cluster') return false
      if (!searchTerm) return true
      const haystack = `${goal.id} ${goal.title} ${goal.shortKey ?? ''}`.toLowerCase()
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

    Array.from(goalById.keys()).forEach((goalId) => evaluate(goalId))
    return new Set(
      Array.from(visibilityCache.entries())
        .filter(([, visible]) => visible)
        .map(([goalId]) => goalId),
    )
  }, [childrenById, goalById, searchTerm, showClustersOnly])

  const treeRootIds = useMemo(() => {
    const roots: string[] = []
    const seen = new Set<string>()
    const pushRoot = (goalId: string) => {
      if (!visibleGoalIds.has(goalId) || seen.has(goalId)) return
      seen.add(goalId)
      roots.push(goalId)
    }

    rootGoalIds.forEach(pushRoot)

    Array.from(goalById.keys()).sort(compareGoalIds).forEach((goalId) => {
      if (!visibleGoalIds.has(goalId)) return
      const hasVisibleParent = (parentById.get(goalId) ?? []).some((parentId) => visibleGoalIds.has(parentId))
      if (!hasVisibleParent) pushRoot(goalId)
    })

    return roots
  }, [compareGoalIds, goalById, parentById, rootGoalIds, visibleGoalIds])

  const addChildSearchTerm = addChildSearch.trim().toLowerCase()
  const addChildCandidates = useMemo(() => {
    if (!selectedGoal || !selectedGoalIsCluster) return []
    const currentChildren = new Set((selectedGoal.contains ?? []).map((ref) => normalizeGoalRef(ref)))
    const descendants = descendantsById.get(selectedGoal.id) ?? new Set<string>()

    return Array.from(goalById.values())
      .filter((goal) => {
        if (goal.id === selectedGoal.id) return false
        if (currentChildren.has(goal.id)) return false
        if (descendants.has(goal.id)) return false
        if (!addChildSearchTerm) return true
        const haystack = `${goal.id} ${goal.title} ${goal.shortKey ?? ''}`.toLowerCase()
        return haystack.includes(addChildSearchTerm)
      })
      .sort((left, right) => compareGoalIds(left.id, right.id))
      .slice(0, 100)
  }, [addChildSearchTerm, compareGoalIds, descendantsById, goalById, selectedGoal, selectedGoalIsCluster])

  const renderGoalNode = useCallback((goalId: string, depth: number, ancestry: Set<string>): React.ReactNode => {
    if (!visibleGoalIds.has(goalId)) return null
    const goal = goalById.get(goalId)
    if (!goal) return null
    const children = (childrenById.get(goalId) ?? []).filter((childId) => visibleGoalIds.has(childId))
    const hasChildren = children.length > 0
    const isExpanded = expandedGoalIds.has(goalId)
    const isSelected = selectedGoalId === goalId
    const type = resolveCanonicalNodeType(goal)
    const parentCount = parentById.get(goalId)?.length ?? 0
    const nextAncestry = new Set(ancestry)
    nextAncestry.add(goalId)

    return (
      <div key={`cluster-tree-${goalId}`}>
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
                if (next.has(goalId)) next.delete(goalId)
                else next.add(goalId)
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
            <div className="text-[11px] text-text-secondary font-mono truncate">{goal.id}</div>
          </button>

          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${type === 'cluster'
            ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {type}
          </span>

          {parentCount > 1 ? (
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              {parentCount} parents
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
  }, [childrenById, expandedGoalIds, goalById, parentById, selectedGoalId, visibleGoalIds])

  const renderSubtreePreview = useCallback((goalId: string, depth: number, ancestry: Set<string>): React.ReactNode => {
    const goal = goalById.get(goalId)
    if (!goal) return null
    const children = childrenById.get(goalId) ?? []
    const nextAncestry = new Set(ancestry)
    nextAncestry.add(goalId)
    return (
      <div key={`preview-${goalId}`}>
        <div className="flex items-start gap-2" style={{ paddingLeft: `${depth * 14}px` }}>
          <span className="mt-0.5 text-[10px] text-text-secondary">{resolveCanonicalNodeType(goal) === 'cluster' ? '●' : '•'}</span>
          <div className="min-w-0">
            <InlineMathText text={goal.title} className="truncate text-sm text-text-primary" />
            <div className="text-[11px] text-text-secondary font-mono">{goal.id}</div>
          </div>
        </div>
        {children.length > 0 ? (
          <div className="mt-1 space-y-1">
            {children.map((childId) => (
              nextAncestry.has(childId)
                ? (
                  <div
                    key={`preview-cycle-${goalId}-${childId}`}
                    className="rounded border border-rose-300/40 bg-rose-50 px-2 py-1 text-xs text-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
                    style={{ marginLeft: `${(depth + 1) * 14}px` }}
                  >
                    Zyklus erkannt bei {childId}
                  </div>
                )
                : renderSubtreePreview(childId, depth + 1, nextAncestry)
            ))}
          </div>
        ) : null}
      </div>
    )
  }, [childrenById, goalById])

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary p-4 md:p-6">
      <div className="mx-auto max-w-[1900px] flex flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">Canonical Cluster Editor</h1>
              <p className="text-sm text-text-secondary">
                Lokaler Editor für kanonische Cluster, `contains`-Struktur und direkte Kindreihenfolge.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start">
              <Link
                to="/workbench"
                className="rounded-lg border border-border-color px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Workbench
              </Link>
              <LanguageToggle />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Canonical-Datei</span>
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
              onClick={handleCreateRootCluster}
              disabled={!landscape || loading || saving}
              className="h-fit self-end rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/30 disabled:opacity-50"
            >
              Neuer Root-Cluster
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
              Fehler: <strong>{globalErrors.length}</strong>
            </span>
          </div>

          {statusMessage ? (
            <div className="mt-3 rounded-lg border border-emerald-300/50 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              {statusMessage}
            </div>
          ) : null}
          {errorMessage ? (
            <div className="mt-3 rounded-lg border border-rose-300/50 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200">
              {errorMessage}
            </div>
          ) : null}
        </header>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.2fr_1fr]">
          <section className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Canonical Tree</h2>
                <label className="flex items-center gap-2 text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={showClustersOnly}
                    onChange={(event) => setShowClustersOnly(event.target.checked)}
                    className="h-4 w-4 accent-sky-600"
                  />
                  nur Cluster
                </label>
              </div>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Suche nach ID, Titel oder shortKey"
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
              />

              <div className="max-h-[70vh] overflow-auto rounded-xl border border-border-color bg-chat-bg/40 p-2">
                {treeRootIds.length === 0 ? (
                  <div className="px-2 py-4 text-sm text-text-secondary">Keine passenden Knoten sichtbar.</div>
                ) : (
                  treeRootIds.map((goalId) => renderGoalNode(goalId, 0, new Set<string>()))
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4">
            {!selectedGoal ? (
              <div className="text-sm text-text-secondary">Kein Knoten ausgewählt.</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">Cluster Details</h2>
                    <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${selectedGoalIsCluster
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {selectedGoalType}
                    </span>
                  </div>
                  <div className="mt-1 text-xs font-mono text-text-secondary break-all">{selectedGoal.id}</div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">title</span>
                    <input
                      value={selectedGoal.title}
                      onChange={(event) => handleSetGoalField(selectedGoal.id, 'title', event.target.value)}
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">titleEn</span>
                    <input
                      value={selectedGoal.titleEn ?? ''}
                      onChange={(event) => handleSetGoalField(selectedGoal.id, 'titleEn', event.target.value)}
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">description</span>
                    <textarea
                      value={selectedGoal.description ?? ''}
                      onChange={(event) => handleSetGoalField(selectedGoal.id, 'description', event.target.value)}
                      rows={3}
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">descriptionEn</span>
                    <textarea
                      value={selectedGoal.descriptionEn ?? ''}
                      onChange={(event) => handleSetGoalField(selectedGoal.id, 'descriptionEn', event.target.value)}
                      rows={3}
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">shortKey</span>
                    <input
                      value={selectedGoal.shortKey ?? ''}
                      onChange={(event) => handleSetGoalField(selectedGoal.id, 'shortKey', event.target.value)}
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2 font-mono text-xs"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">tags</span>
                    <input
                      value={formatTags(selectedGoal.tags)}
                      onChange={(event) => handleSetGoalTags(selectedGoal.id, event.target.value)}
                      placeholder="canonical, GK, LK, phase:E, area:Analysis"
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3">
                    <div className="text-sm font-semibold">Parents</div>
                    <div className="mt-2 space-y-2">
                      {(parentById.get(selectedGoal.id) ?? []).length === 0 ? (
                        <div className="text-sm text-text-secondary">Kein Parent</div>
                      ) : (
                        (parentById.get(selectedGoal.id) ?? []).map((parentId) => {
                          const parentGoal = goalById.get(parentId)
                          if (!parentGoal) return null
                          return (
                            <button
                              key={parentId}
                              type="button"
                              onClick={() => setSelectedGoalId(parentId)}
                              className="block w-full rounded-lg border border-border-color px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/60"
                            >
                              <InlineMathText text={parentGoal.title} className="truncate text-sm text-text-primary" />
                              <div className="text-[11px] font-mono text-text-secondary truncate">{parentGoal.id}</div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3">
                    <div className="text-sm font-semibold">Dimension Tags</div>
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words text-[11px] text-text-secondary">
                      {JSON.stringify(selectedGoal.dimensionTags ?? {}, null, 2)}
                    </pre>
                  </div>
                </div>

                <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">Direkte Kinder</div>
                      <div className="text-xs text-text-secondary">Die Reihenfolge hier ist die gespeicherte `contains`-Reihenfolge.</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateChildCluster}
                      disabled={!selectedGoalIsCluster}
                      className="rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/30 disabled:opacity-50"
                    >
                      Untercluster anlegen
                    </button>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(childrenById.get(selectedGoal.id) ?? []).length === 0 ? (
                      <div className="text-sm text-text-secondary">Keine direkten Kinder.</div>
                    ) : (
                      (childrenById.get(selectedGoal.id) ?? []).map((childId, index, allChildIds) => {
                        const childGoal = goalById.get(childId)
                        if (!childGoal) return null
                        return (
                          <div key={childId} className="rounded-lg border border-border-color px-2 py-2">
                            <div className="flex items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <button
                                  type="button"
                                  onClick={() => setSelectedGoalId(childId)}
                                  className="w-full text-left"
                                >
                                  <InlineMathText text={childGoal.title} className="truncate text-sm font-medium text-text-primary" />
                                  <div className="text-[11px] font-mono text-text-secondary truncate">{childGoal.id}</div>
                                </button>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveChild(childId, -1)}
                                  disabled={index === 0}
                                  className="rounded border border-border-color px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-40"
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveChild(childId, 1)}
                                  disabled={index === allChildIds.length - 1}
                                  className="rounded border border-border-color px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 disabled:opacity-40"
                                >
                                  ↓
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChild(childId)}
                                  className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/30"
                                >
                                  Entfernen
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {selectedGoalIsCluster ? (
                    <div className="mt-4">
                      <div className="text-sm font-semibold">Kind hinzufügen</div>
                      <input
                        type="search"
                        value={addChildSearch}
                        onChange={(event) => setAddChildSearch(event.target.value)}
                        placeholder="Suche nach Ziel-ID, Titel oder shortKey"
                        className="mt-2 w-full rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                      />
                      <div className="mt-2 max-h-48 overflow-auto rounded-lg border border-border-color bg-white/40 dark:bg-slate-950/20">
                        {addChildCandidates.length === 0 ? (
                          <div className="px-3 py-3 text-sm text-text-secondary">Keine Kandidaten.</div>
                        ) : (
                          addChildCandidates.map((candidate) => (
                            <div key={candidate.id} className="flex items-center gap-2 border-b border-border-color/60 px-3 py-2 last:border-b-0">
                              <button
                                type="button"
                                onClick={() => setSelectedGoalId(candidate.id)}
                                className="min-w-0 flex-1 text-left"
                              >
                                <InlineMathText text={candidate.title} className="truncate text-sm text-text-primary" />
                                <div className="text-[11px] font-mono text-text-secondary truncate">{candidate.id}</div>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddChild(candidate.id)}
                                className="rounded border border-sky-300 px-2 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/30"
                              >
                                + Child
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border-color bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-4">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">Diagnostics</h2>
                <div className="mt-1 text-xs text-text-secondary">
                  Save wird bei Fehlern blockiert. Warnungen sind lokale Pflegehinweise.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-rose-300/40 bg-rose-50 px-3 py-2 dark:bg-rose-950/20">
                  <div className="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Errors</div>
                  <div className="mt-1 text-2xl font-bold text-rose-800 dark:text-rose-200">{globalErrors.length}</div>
                </div>
                <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-3 py-2 dark:bg-amber-950/20">
                  <div className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">Selected warnings</div>
                  <div className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-200">{selectedGoalWarnings.length}</div>
                </div>
              </div>

              <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3">
                <div className="text-sm font-semibold">Global errors</div>
                <div className="mt-2 max-h-56 overflow-auto space-y-2">
                  {globalErrors.length === 0 ? (
                    <div className="text-sm text-text-secondary">Keine globalen Fehler erkannt.</div>
                  ) : (
                    globalErrors.map((entry, index) => (
                      <div key={`${entry.goalId ?? 'global'}:${index}`} className="rounded-lg border border-rose-300/40 bg-rose-50 px-2 py-2 text-sm text-rose-800 dark:bg-rose-950/20 dark:text-rose-200">
                        <div>{entry.message}</div>
                        {entry.goalId ? (
                          <button
                            type="button"
                            onClick={() => setSelectedGoalId(entry.goalId!)}
                            className="mt-1 font-mono text-[11px] underline"
                          >
                            {entry.goalId}
                          </button>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3">
                <div className="text-sm font-semibold">Selected diagnostics</div>
                <div className="mt-2 max-h-40 overflow-auto space-y-2">
                  {!selectedGoal ? (
                    <div className="text-sm text-text-secondary">Kein Knoten ausgewählt.</div>
                  ) : selectedGoalDiagnostics.length === 0 ? (
                    <div className="text-sm text-text-secondary">Für den ausgewählten Knoten keine Diagnostics.</div>
                  ) : (
                    selectedGoalDiagnostics.map((entry, index) => (
                      <div
                        key={`${entry.goalId ?? selectedGoal.id}:${entry.severity}:${index}`}
                        className={`rounded-lg px-2 py-2 text-sm ${entry.severity === 'error'
                          ? 'border border-rose-300/40 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-200'
                          : 'border border-amber-300/40 bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200'
                          }`}
                      >
                        {entry.message}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3">
                <div className="text-sm font-semibold">Subtree preview</div>
                <div className="mt-2 max-h-[35vh] overflow-auto space-y-1">
                  {!selectedGoal ? (
                    <div className="text-sm text-text-secondary">Kein Knoten ausgewählt.</div>
                  ) : renderSubtreePreview(selectedGoal.id, 0, new Set<string>())}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
