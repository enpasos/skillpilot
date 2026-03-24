import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { LanguageToggle } from '../components/LanguageToggle'
import { InlineMathText } from '../components/InlineMathText'
import { requestJson } from '../utils/authoring/authoringClient'
import {
  buildCanonicalGraphIndex,
  normalizeCanonicalLandscape,
  resolveCanonicalNodeType,
  type CanonicalAuthoringLandscape,
} from '../utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  createEmptyCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionCanonicalSubtreeNode,
  type CompositionStructureNode,
  type CompositionView,
  type CompositionViewNode,
} from '../utils/authoring/compositionViewAuthoring'

interface CompositionViewListResponse {
  files: string[]
}

interface CanonicalLandscapeSummary {
  path: string
  landscapeId: string
  title: string
}

interface CanonicalLandscapeSummaryResponse {
  landscapes: CanonicalLandscapeSummary[]
}

interface CompositionViewLoadResponse {
  path: string
  view: unknown
}

interface CompositionViewSaveResponse {
  path: string
}

const DEFAULT_VIEW_ROOT = 'curricula/DE/Gymnasium/composition-views/custom'

const pathKeyFromIndices = (path: number[]): string => path.join('.')
const indicesFromPathKey = (pathKey: string): number[] => (
  pathKey
    .split('.')
    .map((part) => Number(part))
    .filter((entry) => Number.isInteger(entry) && entry >= 0)
)

const createStructureNode = (): CompositionStructureNode => ({
  kind: 'structure',
  id: crypto.randomUUID(),
  label: 'New Structure',
  children: [],
})

const createCanonicalSubtreeNode = (): CompositionCanonicalSubtreeNode => ({
  kind: 'canonicalSubtree',
  goalId: '',
})

const makeDefaultViewPath = (viewId: string): string => {
  const safeId = viewId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${DEFAULT_VIEW_ROOT}/${safeId || 'new-view'}.view.json`
}

const getNodeAtPath = (nodes: CompositionViewNode[], path: number[]): CompositionViewNode | null => {
  if (path.length === 0) return null
  const [head, ...rest] = path
  const node = nodes[head]
  if (!node) return null
  if (rest.length === 0) return node
  if (node.kind !== 'structure') return null
  return getNodeAtPath(node.children, rest)
}

const updateNodeAtPath = (
  nodes: CompositionViewNode[],
  path: number[],
  updater: (node: CompositionViewNode) => CompositionViewNode,
): CompositionViewNode[] => {
  if (path.length === 0) return nodes
  const [head, ...rest] = path
  if (head < 0 || head >= nodes.length) return nodes
  const nextNodes = nodes.slice()
  if (rest.length === 0) {
    nextNodes[head] = updater(nextNodes[head])
    return nextNodes
  }

  const node = nextNodes[head]
  if (node.kind !== 'structure') return nodes
  nextNodes[head] = {
    ...node,
    children: updateNodeAtPath(node.children, rest, updater),
  }
  return nextNodes
}

const removeNodeAtPath = (nodes: CompositionViewNode[], path: number[]): CompositionViewNode[] => {
  if (path.length === 0) return nodes
  const [head, ...rest] = path
  if (head < 0 || head >= nodes.length) return nodes
  if (rest.length === 0) {
    const nextNodes = nodes.slice()
    nextNodes.splice(head, 1)
    return nextNodes
  }
  const node = nodes[head]
  if (node.kind !== 'structure') return nodes
  const nextNodes = nodes.slice()
  nextNodes[head] = {
    ...node,
    children: removeNodeAtPath(node.children, rest),
  }
  return nextNodes
}

const moveNodeAtPath = (nodes: CompositionViewNode[], path: number[], direction: -1 | 1): CompositionViewNode[] => {
  if (path.length === 0) return nodes
  const parentPath = path.slice(0, -1)
  const index = path[path.length - 1]

  const moveInside = (entries: CompositionViewNode[]): CompositionViewNode[] => {
    const nextIndex = index + direction
    if (index < 0 || index >= entries.length || nextIndex < 0 || nextIndex >= entries.length) return entries
    const nextEntries = entries.slice()
    const [entry] = nextEntries.splice(index, 1)
    nextEntries.splice(nextIndex, 0, entry)
    return nextEntries
  }

  if (parentPath.length === 0) {
    return moveInside(nodes)
  }

  return updateNodeAtPath(nodes, parentPath, (node) => {
    if (node.kind !== 'structure') return node
    return {
      ...node,
      children: moveInside(node.children),
    }
  })
}

const appendRootNode = (nodes: CompositionViewNode[], node: CompositionViewNode): { nextNodes: CompositionViewNode[], path: number[] } => ({
  nextNodes: [...nodes, node],
  path: [nodes.length],
})

const appendChildNode = (
  nodes: CompositionViewNode[],
  parentPath: number[],
  node: CompositionViewNode,
): { nextNodes: CompositionViewNode[], path: number[] } => {
  const parent = getNodeAtPath(nodes, parentPath)
  if (!parent || parent.kind !== 'structure') {
    return { nextNodes: nodes, path: parentPath }
  }
  const childIndex = parent.children.length
  return {
    nextNodes: updateNodeAtPath(nodes, parentPath, (current) => {
      if (current.kind !== 'structure') return current
      return {
        ...current,
        children: [...current.children, node],
      }
    }),
    path: [...parentPath, childIndex],
  }
}

const setNodeSelectionAfterMove = (path: number[], direction: -1 | 1): string => {
  const nextPath = path.slice()
  nextPath[nextPath.length - 1] += direction
  return pathKeyFromIndices(nextPath)
}

const renderPreviewNode = (node: CompiledCompositionPreviewNode, depth: number): React.ReactNode => (
  <div key={node.runtimeId}>
    <div className="flex items-start gap-2" style={{ paddingLeft: `${depth * 14}px` }}>
      <span className={`mt-0.5 rounded px-1 py-0.5 text-[10px] font-semibold ${node.kind === 'structure'
        ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
        : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
        }`}
      >
        {node.kind === 'structure' ? 'structure' : 'goal'}
      </span>
      <div className="min-w-0">
        <InlineMathText text={node.label} className="truncate text-sm text-text-primary" />
        {node.sourceGoalId ? (
          <div className="text-[11px] font-mono text-text-secondary">{node.sourceGoalId}</div>
        ) : null}
      </div>
    </div>
    {node.children.length > 0 ? (
      <div className="mt-1 space-y-1">
        {node.children.map((child) => renderPreviewNode(child, depth + 1))}
      </div>
    ) : null}
  </div>
)

export const CompositionViewEditorView: React.FC = () => {
  const [compositionFiles, setCompositionFiles] = useState<string[]>([])
  const [canonicalSummaries, setCanonicalSummaries] = useState<CanonicalLandscapeSummary[]>([])
  const [selectedPath, setSelectedPath] = useState('')
  const [draftPath, setDraftPath] = useState('')
  const [canonicalPath, setCanonicalPath] = useState('')
  const [view, setView] = useState<CompositionView | null>(null)
  const [canonicalLandscape, setCanonicalLandscape] = useState<CanonicalAuthoringLandscape | null>(null)
  const [selectedNodePath, setSelectedNodePath] = useState('')
  const [candidateSearch, setCandidateSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canonicalIndex = useMemo(() => buildCanonicalGraphIndex(canonicalLandscape), [canonicalLandscape])
  const selectedNode = useMemo(
    () => view ? getNodeAtPath(view.rootNodes, indicesFromPathKey(selectedNodePath)) : null,
    [selectedNodePath, view],
  )

  const compileResult = useMemo(() => {
    if (!view) return null
    return compileCompositionView(view, canonicalLandscape)
  }, [canonicalLandscape, view])

  const findings = compileResult?.findings ?? []
  const blockingErrors = findings.filter((entry) => entry.severity === 'error')
  const warningCount = findings.length - blockingErrors.length

  const canonicalClusterCandidates = useMemo(() => {
    const needle = candidateSearch.trim().toLowerCase()
    return Array.from(canonicalIndex.goalById.values())
      .filter((goal) => resolveCanonicalNodeType(goal) === 'cluster')
      .filter((goal) => {
        if (!needle) return true
        const haystack = `${goal.id} ${goal.title} ${goal.shortKey ?? ''}`.toLowerCase()
        return haystack.includes(needle)
      })
      .sort((left, right) => canonicalIndex.compareGoalIds(left.id, right.id))
      .slice(0, 120)
  }, [candidateSearch, canonicalIndex])

  const selectedCanonicalSummary = useMemo(
    () => canonicalSummaries.find((entry) => entry.path === canonicalPath) ?? null,
    [canonicalPath, canonicalSummaries],
  )

  const syncCanonicalLandscape = useCallback(async (nextCanonicalPath: string) => {
    if (!nextCanonicalPath) {
      setCanonicalLandscape(null)
      return
    }
    const response = await requestJson<{ landscape: unknown }>(`/__canonical-cluster-editor/load?path=${encodeURIComponent(nextCanonicalPath)}`)
    setCanonicalLandscape(normalizeCanonicalLandscape(response.landscape))
  }, [])

  const confirmDiscardChanges = useCallback(() => {
    if (!dirty) return true
    return window.confirm('Ungespeicherte Änderungen verwerfen?')
  }, [dirty])

  useEffect(() => {
    let cancelled = false

    const loadBootData = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const [viewResponse, canonicalResponse] = await Promise.all([
          requestJson<CompositionViewListResponse>('/__composition-view-editor/list'),
          requestJson<CanonicalLandscapeSummaryResponse>('/__authoring/canonical-landscapes'),
        ])
        if (cancelled) return
        const files = viewResponse.files.slice().sort((left, right) => left.localeCompare(right))
        const landscapes = canonicalResponse.landscapes.slice().sort((left, right) => left.title.localeCompare(right.title, 'de'))
        setCompositionFiles(files)
        setCanonicalSummaries(landscapes)
        if (files.length > 0) {
          setSelectedPath((previous) => previous || files[0])
        } else {
          const emptyView = createEmptyCompositionView()
          if (landscapes[0]) {
            emptyView.landscapeId = landscapes[0].landscapeId
            setCanonicalPath(landscapes[0].path)
          }
          setView(emptyView)
          setDraftPath(makeDefaultViewPath(emptyView.viewId))
          setDirty(false)
        }
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Editor-Daten konnten nicht geladen werden.'
        setErrorMessage(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadBootData()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedPath) return

    let cancelled = false
    const loadSelectedView = async () => {
      setLoading(true)
      setErrorMessage(null)
      setStatusMessage(null)
      try {
        const response = await requestJson<CompositionViewLoadResponse>(`/__composition-view-editor/load?path=${encodeURIComponent(selectedPath)}`)
        if (cancelled) return
        const loadedView = normalizeCompositionView(response.view)
        setView(loadedView)
        setDraftPath(response.path)
        setDirty(false)
        setSelectedNodePath('')
        const matchingLandscape = canonicalSummaries.find((entry) => entry.landscapeId === loadedView.landscapeId)
        setCanonicalPath(matchingLandscape?.path ?? '')
      } catch (error) {
        if (cancelled) return
        const message = error instanceof Error ? error.message : 'Composition view konnte nicht geladen werden.'
        setErrorMessage(message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadSelectedView()
    return () => {
      cancelled = true
    }
  }, [canonicalSummaries, selectedPath])

  useEffect(() => {
    void syncCanonicalLandscape(canonicalPath)
  }, [canonicalPath, syncCanonicalLandscape])

  useEffect(() => {
    if (!view) {
      setSelectedNodePath('')
      return
    }
    if (selectedNodePath && getNodeAtPath(view.rootNodes, indicesFromPathKey(selectedNodePath))) return
    setSelectedNodePath(view.rootNodes.length > 0 ? '0' : '')
  }, [selectedNodePath, view])

  const updateView = useCallback((updater: (current: CompositionView) => CompositionView) => {
    setView((previous) => {
      if (!previous) return previous
      const next = updater(previous)
      if (next === previous) return previous
      setDirty(true)
      return next
    })
  }, [])

  const handleCreateNewView = useCallback(() => {
    if (!confirmDiscardChanges()) return
    const nextView = createEmptyCompositionView()
    const firstCanonical = canonicalSummaries[0]
    if (firstCanonical) {
      nextView.landscapeId = firstCanonical.landscapeId
      setCanonicalPath(firstCanonical.path)
    } else {
      setCanonicalPath('')
    }
    setSelectedPath('')
    setView(nextView)
    setDraftPath(makeDefaultViewPath(nextView.viewId))
    setSelectedNodePath('')
    setDirty(false)
    setStatusMessage('Neue Composition View angelegt.')
    setErrorMessage(null)
  }, [canonicalSummaries, confirmDiscardChanges])

  const handleSelectExistingPath = useCallback((nextPath: string) => {
    if (nextPath === selectedPath) return
    if (!confirmDiscardChanges()) return
    setSelectedPath(nextPath)
    setStatusMessage(null)
    setErrorMessage(null)
  }, [confirmDiscardChanges, selectedPath])

  const handleSelectCanonicalLandscape = useCallback((nextPath: string) => {
    const summary = canonicalSummaries.find((entry) => entry.path === nextPath)
    setCanonicalPath(nextPath)
    updateView((current) => ({
      ...current,
      landscapeId: summary?.landscapeId ?? '',
    }))
  }, [canonicalSummaries, updateView])

  const handleSetViewField = useCallback((field: 'viewId' | 'landscapeId', value: string) => {
    updateView((current) => ({ ...current, [field]: value }))
    if (field === 'viewId' && !selectedPath) {
      setDraftPath(makeDefaultViewPath(value))
    }
  }, [selectedPath, updateView])

  const handleSetScopeField = useCallback((field: string, value: string) => {
    updateView((current) => ({
      ...current,
      scope: {
        ...current.scope,
        [field]: value,
      },
    }))
  }, [updateView])

  const handleAddRootStructure = useCallback(() => {
    if (!view) return
    const { nextNodes, path } = appendRootNode(view.rootNodes, createStructureNode())
    updateView((current) => ({ ...current, rootNodes: nextNodes }))
    setSelectedNodePath(pathKeyFromIndices(path))
  }, [updateView, view])

  const handleAddRootCanonicalSubtree = useCallback(() => {
    if (!view) return
    const { nextNodes, path } = appendRootNode(view.rootNodes, createCanonicalSubtreeNode())
    updateView((current) => ({ ...current, rootNodes: nextNodes }))
    setSelectedNodePath(pathKeyFromIndices(path))
  }, [updateView, view])

  const handleAddChildStructure = useCallback(() => {
    if (!view || !selectedNodePath) return
    const path = indicesFromPathKey(selectedNodePath)
    const { nextNodes, path: nextPath } = appendChildNode(view.rootNodes, path, createStructureNode())
    updateView((current) => ({ ...current, rootNodes: nextNodes }))
    setSelectedNodePath(pathKeyFromIndices(nextPath))
  }, [selectedNodePath, updateView, view])

  const handleAddChildCanonicalSubtree = useCallback(() => {
    if (!view || !selectedNodePath) return
    const path = indicesFromPathKey(selectedNodePath)
    const { nextNodes, path: nextPath } = appendChildNode(view.rootNodes, path, createCanonicalSubtreeNode())
    updateView((current) => ({ ...current, rootNodes: nextNodes }))
    setSelectedNodePath(pathKeyFromIndices(nextPath))
  }, [selectedNodePath, updateView, view])

  const handleRemoveSelectedNode = useCallback(() => {
    if (!view || !selectedNodePath) return
    const path = indicesFromPathKey(selectedNodePath)
    updateView((current) => ({
      ...current,
      rootNodes: removeNodeAtPath(current.rootNodes, path),
    }))
    setSelectedNodePath(path.length > 1 ? pathKeyFromIndices(path.slice(0, -1)) : '')
  }, [selectedNodePath, updateView, view])

  const handleMoveSelectedNode = useCallback((direction: -1 | 1) => {
    if (!view || !selectedNodePath) return
    const path = indicesFromPathKey(selectedNodePath)
    updateView((current) => ({
      ...current,
      rootNodes: moveNodeAtPath(current.rootNodes, path, direction),
    }))
    setSelectedNodePath(setNodeSelectionAfterMove(path, direction))
  }, [selectedNodePath, updateView, view])

  const handleSetStructureField = useCallback((field: 'id' | 'label', value: string) => {
    if (!selectedNodePath) return
    const path = indicesFromPathKey(selectedNodePath)
    updateView((current) => ({
      ...current,
      rootNodes: updateNodeAtPath(current.rootNodes, path, (node) => {
        if (node.kind !== 'structure') return node
        return { ...node, [field]: value }
      }),
    }))
  }, [selectedNodePath, updateView])

  const handleSetCanonicalGoalId = useCallback((goalId: string) => {
    if (!selectedNodePath) return
    const path = indicesFromPathKey(selectedNodePath)
    updateView((current) => ({
      ...current,
      rootNodes: updateNodeAtPath(current.rootNodes, path, (node) => {
        if (node.kind !== 'canonicalSubtree') return node
        return { ...node, goalId }
      }),
    }))
  }, [selectedNodePath, updateView])

  const handleSave = useCallback(async () => {
    if (!view) return
    if (!draftPath.trim()) {
      setErrorMessage('Zielpfad für die Composition View fehlt.')
      setStatusMessage(null)
      return
    }
    if (blockingErrors.length > 0) {
      setErrorMessage('Speichern blockiert: Bitte zuerst die Strukturfehler der Composition View beheben.')
      setStatusMessage(null)
      return
    }

    setSaving(true)
    setErrorMessage(null)
    setStatusMessage(null)
    try {
      const response = await requestJson<CompositionViewSaveResponse>('/__composition-view-editor/save', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: draftPath, view }),
      })
      setSelectedPath(response.path)
      setDraftPath(response.path)
      setDirty(false)
      setStatusMessage('Composition View erfolgreich gespeichert.')
      const nextFiles = new Set(compositionFiles)
      nextFiles.add(response.path)
      setCompositionFiles(Array.from(nextFiles).sort((left, right) => left.localeCompare(right)))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Speichern fehlgeschlagen.'
      setErrorMessage(message)
    } finally {
      setSaving(false)
    }
  }, [blockingErrors.length, compositionFiles, draftPath, view])

  const renderCompositionNode = useCallback((node: CompositionViewNode, path: number[], depth: number): React.ReactNode => {
    const pathKey = pathKeyFromIndices(path)
    const isSelected = selectedNodePath === pathKey
    const referencedGoal = node.kind === 'canonicalSubtree' ? canonicalIndex.goalById.get(node.goalId) : null

    return (
      <div key={`composition-node-${pathKey}`}>
        <button
          type="button"
          onClick={() => setSelectedNodePath(pathKey)}
          className={`flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${isSelected
            ? 'border-sky-400 bg-sky-50 dark:border-sky-500/60 dark:bg-sky-950/30'
            : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          style={{ paddingLeft: `${depth * 18 + 12}px` }}
        >
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${node.kind === 'structure'
            ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
            : 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200'
            }`}
          >
            {node.kind}
          </span>
          <div className="min-w-0 flex-1">
            <InlineMathText
              text={node.kind === 'structure' ? node.label : (referencedGoal?.title || node.goalId || 'Unassigned canonical subtree')}
              className="truncate font-medium text-text-primary"
            />
            <div className="truncate text-[11px] font-mono text-text-secondary">
              {node.kind === 'structure' ? node.id : (referencedGoal?.id || 'goalId missing')}
            </div>
          </div>
        </button>
        {node.kind === 'structure' && node.children.length > 0 ? (
          <div className="mt-1 space-y-1">
            {node.children.map((child, indexOfChild) => renderCompositionNode(child, [...path, indexOfChild], depth + 1))}
          </div>
        ) : null}
      </div>
    )
  }, [canonicalIndex.goalById, selectedNodePath])

  return (
    <div className="min-h-screen bg-chat-bg text-text-primary p-4 md:p-6">
      <div className="mx-auto max-w-[1900px] flex flex-col gap-4">
        <header className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">Composition View Editor</h1>
              <p className="text-sm text-text-secondary">
                Lokaler Editor fuer scope-spezifische Learner-Trees auf Basis kanonischer Teilbaeume.
              </p>
            </div>
            <LanguageToggle />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Composition-View-Datei</span>
              <select
                value={selectedPath}
                onChange={(event) => handleSelectExistingPath(event.target.value)}
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
              >
                {compositionFiles.length === 0 ? (
                  <option value="">Keine gespeicherte View</option>
                ) : null}
                {compositionFiles.map((path) => (
                  <option key={path} value={path}>{path}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Zielpfad</span>
              <input
                value={draftPath}
                onChange={(event) => setDraftPath(event.target.value)}
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                placeholder="curricula/DE/Gymnasium/composition-views/..."
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-semibold">Kanonischer Graph</span>
              <select
                value={canonicalPath}
                onChange={(event) => handleSelectCanonicalLandscape(event.target.value)}
                className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
              >
                <option value="">Bitte waehlen</option>
                {canonicalSummaries.map((summary) => (
                  <option key={summary.path} value={summary.path}>
                    {summary.title} [{summary.landscapeId}]
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={handleCreateNewView}
              className="h-fit self-end rounded-lg border border-sky-300 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-700 dark:text-sky-300 dark:hover:bg-sky-950/30"
            >
              Neue View
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!view || saving || loading}
              className="h-fit self-end rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
            >
              {saving ? 'Speichere ...' : 'Speichern'}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
            <span>{dirty ? 'Ungespeicherte Aenderungen vorhanden.' : 'Keine ausstehenden Aenderungen.'}</span>
            <span>Root-Nodes: <strong>{view?.rootNodes.length ?? 0}</strong></span>
            <span>Fehler: <strong>{blockingErrors.length}</strong></span>
            <span>Warnungen: <strong>{warningCount}</strong></span>
            {selectedCanonicalSummary ? (
              <span>Kanonischer Graph: <strong>{selectedCanonicalSummary.landscapeId}</strong></span>
            ) : null}
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

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.2fr_1fr]">
          <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Composition Tree</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddRootStructure}
                  disabled={!view}
                  className="rounded-lg border border-border-color px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Root Structure
                </button>
                <button
                  type="button"
                  onClick={handleAddRootCanonicalSubtree}
                  disabled={!view}
                  className="rounded-lg border border-border-color px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                >
                  Root Subtree
                </button>
              </div>
            </div>

            <div className="mt-3 max-h-[72vh] overflow-auto rounded-xl border border-border-color bg-chat-bg/40 p-2">
              {!view || view.rootNodes.length === 0 ? (
                <div className="px-2 py-4 text-sm text-text-secondary">Noch keine Strukturknoten vorhanden.</div>
              ) : (
                <div className="space-y-1">
                  {view.rootNodes.map((node, index) => renderCompositionNode(node, [index], 0))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70">
            {!view ? (
              <div className="text-sm text-text-secondary">Keine View geladen.</div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-semibold">View Details</h2>
                  <p className="text-sm text-text-secondary">Bearbeitung von View-Metadaten und dem aktuell gewaehlten Knoten.</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-semibold">viewId</span>
                    <input
                      value={view.viewId}
                      onChange={(event) => handleSetViewField('viewId', event.target.value)}
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                    />
                  </label>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">scope.jurisdiction</span>
                      <input
                        value={view.scope.jurisdiction ?? ''}
                        onChange={(event) => handleSetScopeField('jurisdiction', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">scope.schoolForm</span>
                      <input
                        value={view.scope.schoolForm ?? ''}
                        onChange={(event) => handleSetScopeField('schoolForm', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">scope.stage</span>
                      <input
                        value={view.scope.stage ?? ''}
                        onChange={(event) => handleSetScopeField('stage', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">scope.courseProfile</span>
                      <input
                        value={view.scope.courseProfile ?? ''}
                        onChange={(event) => handleSetScopeField('courseProfile', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">scope.durationModel</span>
                      <input
                        value={view.scope.durationModel ?? ''}
                        onChange={(event) => handleSetScopeField('durationModel', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>
                  </div>
                </div>

                {!selectedNode ? (
                  <div className="rounded-xl border border-border-color bg-chat-bg/40 p-3 text-sm text-text-secondary">
                    Kein Knoten gewaehlt. Root-Nodes kannst du links anlegen oder anklicken.
                  </div>
                ) : selectedNode.kind === 'structure' ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-border-color bg-chat-bg/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">Structure Node</div>
                        <div className="text-[11px] font-mono text-text-secondary">{selectedNodePath}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleMoveSelectedNode(-1)} className="rounded border border-border-color px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">↑</button>
                        <button type="button" onClick={() => handleMoveSelectedNode(1)} className="rounded border border-border-color px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">↓</button>
                        <button type="button" onClick={handleRemoveSelectedNode} className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/30">Entfernen</button>
                      </div>
                    </div>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">id</span>
                      <input
                        value={selectedNode.id}
                        onChange={(event) => handleSetStructureField('id', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">label</span>
                      <input
                        value={selectedNode.label}
                        onChange={(event) => handleSetStructureField('label', event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={handleAddChildStructure}
                        className="rounded-lg border border-border-color px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Child Structure
                      </button>
                      <button
                        type="button"
                        onClick={handleAddChildCanonicalSubtree}
                        className="rounded-lg border border-border-color px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Child Subtree
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 rounded-xl border border-border-color bg-chat-bg/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">Canonical Subtree Reference</div>
                        <div className="text-[11px] font-mono text-text-secondary">{selectedNodePath}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => handleMoveSelectedNode(-1)} className="rounded border border-border-color px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">↑</button>
                        <button type="button" onClick={() => handleMoveSelectedNode(1)} className="rounded border border-border-color px-2 py-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800">↓</button>
                        <button type="button" onClick={handleRemoveSelectedNode} className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/30">Entfernen</button>
                      </div>
                    </div>

                    <label className="flex flex-col gap-1 text-sm">
                      <span className="font-semibold">goalId</span>
                      <input
                        value={selectedNode.goalId}
                        onChange={(event) => handleSetCanonicalGoalId(event.target.value)}
                        className="rounded-lg border border-border-color bg-chat-bg px-3 py-2 font-mono"
                      />
                    </label>

                    <input
                      type="search"
                      value={candidateSearch}
                      onChange={(event) => setCandidateSearch(event.target.value)}
                      placeholder="Suche nach kanonischem Cluster"
                      className="rounded-lg border border-border-color bg-chat-bg px-3 py-2 text-sm"
                    />

                    <div className="max-h-72 overflow-auto rounded-lg border border-border-color bg-white/60 p-2 dark:bg-slate-950/20">
                      {canonicalClusterCandidates.map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => handleSetCanonicalGoalId(goal.id)}
                          className="flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/70"
                        >
                          <div className="min-w-0">
                            <InlineMathText text={goal.title} className="truncate text-sm text-text-primary" />
                            <div className="truncate text-[11px] font-mono text-text-secondary">{goal.id}</div>
                          </div>
                          {goal.shortKey ? (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {goal.shortKey}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-border-color bg-white/70 p-4 backdrop-blur-sm dark:bg-slate-900/70">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold">Compiled Preview</h2>
                <p className="text-sm text-text-secondary">Dieselbe Compile-/Validierungslogik treibt Preview und Save-Blocking.</p>
              </div>

              <div className="max-h-[42vh] overflow-auto rounded-xl border border-border-color bg-chat-bg/40 p-3">
                {!compileResult || compileResult.compiledRootNodes.length === 0 ? (
                  <div className="text-sm text-text-secondary">Noch keine kompilierbare Preview vorhanden.</div>
                ) : (
                  <div className="space-y-2">
                    {compileResult.compiledRootNodes.map((node) => renderPreviewNode(node, 0))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold">Diagnostics</h3>
                <div className="mt-2 max-h-[28vh] overflow-auto rounded-xl border border-border-color bg-chat-bg/40 p-3">
                  {findings.length === 0 ? (
                    <div className="text-sm text-text-secondary">Keine Findings.</div>
                  ) : (
                    <div className="space-y-2">
                      {findings.map((finding, index) => (
                        <div
                          key={`${finding.severity}-${finding.nodePath ?? ''}-${finding.goalId ?? ''}-${index}`}
                          className={`rounded-lg border px-3 py-2 text-sm ${finding.severity === 'error'
                            ? 'border-rose-300/50 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-950/30 dark:text-rose-200'
                            : 'border-amber-300/50 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-200'
                            }`}
                        >
                          <div className="font-semibold">{finding.severity === 'error' ? 'Error' : 'Warning'}</div>
                          <div>{finding.message}</div>
                          {finding.nodePath ? (
                            <div className="mt-1 text-[11px] font-mono opacity-80">nodePath: {finding.nodePath}</div>
                          ) : null}
                          {finding.goalId ? (
                            <div className="mt-1 text-[11px] font-mono opacity-80">goalId: {finding.goalId}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
