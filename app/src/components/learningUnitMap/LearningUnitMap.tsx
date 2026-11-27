import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ChevronRight, Compass, Expand,
  Minus, Plus, Search, Waypoints, X } from 'lucide-react'
import { Background, BackgroundVariant, MarkerType, MiniMap, ReactFlow, ReactFlowProvider,
  getViewportForBounds, useReactFlow, useStore, type Edge, type Viewport } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { LearningEntryProgress, LearningMapCommand, LearningMapFixture } from './types'
import { MapNode, type LearningFlowNode, type LearningMapGoalAction } from './MapNode'
import { getEntryKindLabel, plainMapTitle } from './presentation'
import { MathText } from '../MathText'
import { useMapNavigation } from './useMapNavigation'
import { layoutLearningScope, NODE_HEIGHT, NODE_WIDTH, restartLearningScopeLayoutWorker, type LearningScopeLayout } from './layoutLearningScope'
import { ElkRoutedEdge } from './ElkRoutedEdge'
import { mapEntryPath } from './mapEntryPath'
import { getLearningScopeRelations } from './scopeRelations'
import './learningUnitMap.css'

const nodeTypes = { learningUnit: MapNode }
const edgeTypes = { routed: ElkRoutedEdge }
const nodeDimensions = { width: NODE_WIDTH, height: NODE_HEIGHT }
type Example = { id: string; label: string }
type MapProps = {
  fixture: LearningMapFixture
  examples?: Example[]
  exampleId?: string
  onExampleChange?: (id: string) => void
  embedded?: boolean
  active?: boolean
  headingMode?: 'standard' | 'context'
  rootLabel?: string
  learnerProgress?: Record<string, LearningEntryProgress>
  activeGoalId?: string | null
  initialScopeId?: string
  command?: LearningMapCommand | null
  /** Camera context only; it never adds nodes, changes results or renders assessment content. */
  assessmentContext?: { scopeGoalId: string; goalIds: readonly string[] }
  onEntrySelect?: (entryId: string) => void
  onSelectionChange?: (entryId: string | null) => void
  materialScopes?: ReadonlySet<string>
  getGoalAction?: (scopeId: string, entryId: string) => LearningMapGoalAction | undefined
  onReturnToTree?: () => void
  /** Hosts such as a full-window dialog own Escape once the map search is closed. */
  onEscape?: () => void
  language?: 'de' | 'en'
  /** Host controls shown in the location bar. */
  toolbar?: ReactNode
  /**
   * A host element, such as the title row of a dialog, that takes the location bar instead of a row
   * above the map. `null` means the host element is not mounted yet; omitted, the bar stays in the map.
   */
  locationBarContainer?: HTMLElement | null
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function useNarrowScreen() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)')
    const update = () => setNarrow(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return narrow
}

function MapScene({ fixture, examples, exampleId, onExampleChange, embedded = false,
  active = true, headingMode = 'standard', rootLabel,
  learnerProgress, activeGoalId, initialScopeId, command, assessmentContext, onEntrySelect,
  onSelectionChange, materialScopes, getGoalAction, onReturnToTree, onEscape, language = 'de',
  toolbar, locationBarContainer }: MapProps) {
  const label = (de: string, en: string) => language === 'en' ? en : de
  const MapContainer = embedded ? 'section' : 'main'
  const reducedMotion = useReducedMotion()
  const narrowScreen = useNarrowScreen()
  const flow = useReactFlow<LearningFlowNode>()
  const [direction, setDirection] = useState<'RIGHT' | 'DOWN'>('RIGHT')
  const [layout, setLayout] = useState<{ fixture: LearningMapFixture; key: string; data: LearningScopeLayout } | null>(null)
  const canvasWidth = useStore(state => state.width)
  const canvasHeight = useStore(state => state.height)
  const assessmentScope = assessmentContext?.scopeGoalId
  const assessmentGoalIds = assessmentContext?.goalIds
  const assessmentCamera = useMemo(() => {
    const id = command?.entryId
    if (!id || !layout || layout.fixture !== fixture || !layout.data.positions[id]
      || layout.fixture.entries[id]?.kind !== 'assessment' || !canvasWidth || !canvasHeight) return null
    const peers = Object.entries(layout.data.positions).filter(([key]) => layout.fixture.entries[key].kind === 'assessment')
    // A nested child can own just one assessment. Route it through the same
    // readable camera as neighbouring assessments rather than the full-board overview.
    const groups = [peers]
    // Optional assessments can extend this board far beyond the selected unit's
    // required parts. Keep those existing parts together before falling back to
    // a single assessment; no graph entry is hidden or rearranged.
    if (assessmentScope && layout.key === `${assessmentScope}:${direction}` && assessmentGoalIds?.includes(id)) {
      const requiredIds = new Set(assessmentGoalIds)
      const requiredPeers = peers.filter(([key]) => requiredIds.has(key))
      if (requiredPeers.length >= 2 && requiredPeers.length < peers.length) groups.push(requiredPeers)
    }
    for (const group of groups) {
      const xs = group.map(([, point]) => point.x)
      const ys = group.map(([, point]) => point.y)
      const x = Math.min(...xs)
      const y = Math.min(...ys)
      const viewport = getViewportForBounds({ x, y, width: Math.max(...xs) - x + NODE_WIDTH,
        height: Math.max(...ys) - y + NODE_HEIGHT }, canvasWidth, canvasHeight, 0, 1, 0.06)
      if (viewport.zoom >= 0.8) return viewport
    }
    const point = layout.data.positions[id]
    return { x: canvasWidth / 2 - point.x - NODE_WIDTH / 2, y: canvasHeight / 2 - point.y - NODE_HEIGHT / 2, zoom: 1 }
  }, [command?.entryId, fixture, layout, canvasWidth, canvasHeight, assessmentScope, assessmentGoalIds, direction])
  const previousAssessmentCamera = useRef<Viewport | null>(null)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [layoutAttempt, setLayoutAttempt] = useState(0)
  const mapContainer = useRef<HTMLElement>(null)
  const mapSurface = useRef<HTMLDivElement>(null)
  const pendingNodeFocus = useRef<{ id: string; center: boolean } | null>(null)
  const pendingSelectionEcho = useRef<{ entryId: string; nonce: number; baselineKey: string | null } | null>(null)
  // A newly mounted scope starts from its current selection; the supplied
  // sequence may describe a historical reveal made before the map was opened.
  const seenRevealNonce = useRef(command?.nonce ?? 0)
  const pendingReveal = useRef<{ entryId: string; nonce: number; baselineSelectionId: string } | null>(null)
  const lastCommand = useRef<string | null>(null)
  const commandNavigationEpoch = useRef(0)
  const acknowledgeScopeEntry = useCallback(() => {
    commandNavigationEpoch.current++
    pendingNodeFocus.current = null
    pendingReveal.current = null
    if (command) lastCommand.current = `${command.nonce}:${command.entryId}`
    // Keep a local double-click selection's pending URL echo: acknowledging
    // that echo must not route back to the unit's parent after drilling in.
  }, [command])
  const nav = useMapNavigation(fixture, reducedMotion, layout?.fixture === fixture ? layout.key : null,
    direction, initialScopeId, active, mapContainer, mapSurface, materialScopes, acknowledgeScopeEntry)
  const { enter, goUp, goToDepth, goToScope } = nav
  const [selection, setSelection] = useState<{ scope: string; id: string } | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [contextTrail, setContextTrail] = useState<string[]>([])
  const [contextLimit, setContextLimit] = useState(12)
  const [contextOpen, setContextOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const gestureTarget = useRef<string | null>(null)
  const gestureOnMap = useRef(true)
  const touchDistance = useRef<number | null>(null)
  const scope = fixture.entries[nav.scopeId]
  const visibleIds = useMemo(() => (scope.children ?? []).filter(id => fixture.entries[id]), [fixture, scope])
  const visible = useMemo(() => new Set(visibleIds), [visibleIds])
  const selectedId = selection?.scope === nav.scopeId && visible.has(selection.id) ? selection.id : null
  const inspected = selectedId ? fixture.entries[selectedId] : null
  const layoutKey = `${nav.scopeId}:${direction}`
  const activeLayout = layout?.fixture === fixture && layout.key === layoutKey ? layout.data : null
  const scopeTitle = nav.scopeId === fixture.rootId && rootLabel ? rootLabel : scope.title
  const extendedTools = headingMode === 'standard' || visibleIds.length >= 8
  const showMinimap = extendedTools || (narrowScreen && !!activeLayout
    && (activeLayout.width * nav.zoom > canvasWidth || activeLayout.height * nav.zoom > canvasHeight))
  const showSearch = extendedTools || (narrowScreen && visibleIds.length > 1 && Boolean(getGoalAction))

  useEffect(() => {
    if (!active) return
    let current = true
    const timeout = window.setTimeout(() => {
      if (current) setLayoutError(language === 'en' ? 'Arranging the map is taking longer than expected.' : 'Das Anordnen der Karte dauert länger als erwartet.')
    }, 15000)
    void layoutLearningScope(fixture, nav.scopeId, direction).then(data => {
      if (current) { setLayout({ fixture, key: layoutKey, data }); setLayoutError(null) }
    }).catch(() => { if (current) setLayoutError(language === 'en' ? 'The map could not be arranged.' : 'Die Karte konnte nicht angeordnet werden.') })
      .finally(() => window.clearTimeout(timeout))
    return () => { current = false; window.clearTimeout(timeout) }
  }, [active, fixture, nav.scopeId, direction, layoutKey, layoutAttempt, language])

  const highlight = useCallback((id: string) => {
    if (!visible.has(id)) return
    setSelection({ scope: nav.scopeId, id })
  }, [nav.scopeId, visible])
  const select = useCallback((id: string) => {
    if (!visible.has(id)) return
    pendingNodeFocus.current = null
    pendingReveal.current = null
    // Local intent supersedes any still-routed baseline while its echo is pending.
    if (command) lastCommand.current = `${command.nonce}:${command.entryId}`
    setContextTrail([])
    setContextLimit(12)
    pendingSelectionEcho.current = { entryId: id, nonce: command?.nonce ?? 0,
      baselineKey: command ? `${command.nonce}:${command.entryId}` : null }
    highlight(id)
    onEntrySelect?.(id)
  }, [highlight, onEntrySelect, visible, command])
  const open = useCallback((id: string) => {
    const entry = fixture.entries[id]
    if (!entry) return
    if (entry.children?.length) {
      pendingNodeFocus.current = null
      setContextTrail([])
      setSelection(null)
      enter(id)
    }
  }, [fixture, enter])
  const focusNode = useCallback((id: string, center = false) => {
    if (!visible.has(id)) return
    pendingNodeFocus.current = { id, center }
    setContextTrail([])
    highlight(id)
    setSearchOpen(false)
  }, [highlight, visible])
  const selectSearchResult = useCallback((id: string) => {
    // A borrowed deck or exam opens through its own button. Searching for it
    // positions its node on this board without routing to its home scope.
    if (!getGoalAction?.(nav.scopeId, id)) select(id)
    focusNode(id, true)
  }, [focusNode, getGoalAction, nav.scopeId, select])

  useEffect(() => {
    if (!command) return
    if (command.revealEntryId && seenRevealNonce.current !== command.nonce) {
      // The requested target is authoritative even while the router still
      // exposes the previous selection. A sequence is consumed only once.
      seenRevealNonce.current = command.nonce
      pendingReveal.current = { entryId: command.revealEntryId, nonce: command.nonce,
        baselineSelectionId: command.entryId }
      // Keep the eventual routed target echo separate from camera navigation:
      // opening its children before that echo arrives must not jump back out.
      pendingSelectionEcho.current = { entryId: command.revealEntryId, nonce: command.nonce,
        baselineKey: `${command.nonce}:${command.entryId}` }
    } else if (pendingReveal.current && (command.nonce !== pendingReveal.current.nonce
      || (command.entryId !== pendingReveal.current.baselineSelectionId && command.entryId !== pendingReveal.current.entryId))) {
      pendingReveal.current = null
    }
    const pending = pendingSelectionEcho.current
    if (!pending) return
    const key = `${command.nonce}:${command.entryId}`
    // Local highlighting can commit before the concurrent router echoes the
    // selection. Keep the intent across that unchanged old command, including
    // a drill into its children. Only its actual echo is acknowledgement.
    if (command.nonce === pending.nonce && command.entryId === pending.entryId) {
      lastCommand.current = key
      pendingSelectionEcho.current = null
    } else if (command.nonce !== pending.nonce || key !== pending.baselineKey) {
      // A fresh reveal (even of this same ID) or another external selection wins.
      pendingSelectionEcho.current = null
    }
  }, [command, selection])

  useEffect(() => { onSelectionChange?.(selectedId) }, [onSelectionChange, selectedId])

  useEffect(() => {
    if (!active || !command || nav.isTransitioning) return
    const key = `${command.nonce}:${command.entryId}`
    const reveal = pendingReveal.current
    if (!reveal && lastCommand.current === key) return
    const targetId = reveal?.entryId ?? command.entryId
    const targetPath = mapEntryPath(fixture, targetId)
    // A temporarily hydrating projection may not contain the command yet.
    if (!targetPath) return
    const ownerId = targetPath.length > 1 ? targetPath[targetPath.length - 2] : fixture.rootId
    if (ownerId !== nav.scopeId) { goToScope(ownerId); return }
    const navigationEpoch = commandNavigationEpoch.current
    const frame = requestAnimationFrame(() => {
      if (commandNavigationEpoch.current !== navigationEpoch) return
      lastCommand.current = key
      if (pendingReveal.current === reveal) pendingReveal.current = null
      const nodeId = targetPath[targetPath.length - 1]
      if (nodeId !== fixture.rootId) focusNode(nodeId)
    })
    return () => cancelAnimationFrame(frame)
  }, [active, command, fixture, nav.isTransitioning, nav.scopeId, goToScope, focusNode])

  useEffect(() => {
    if (!selectedId || nav.isTransitioning) return
    let secondFrame = 0
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const node = flow.getNode(selectedId)
        const surface = mapSurface.current
        if (!node || !surface) return
        const width = surface.clientWidth
        const height = surface.clientHeight
        const current = flow.getViewport()
        const requested = pendingNodeFocus.current?.id === selectedId ? pendingNodeFocus.current : null
        const previous = previousAssessmentCamera.current
        const stillAtAssessment = previous && Math.abs(current.x - previous.x) < 1
          && Math.abs(current.y - previous.y) < 1 && Math.abs(current.zoom - previous.zoom) < 0.005
        if (assessmentCamera && !requested?.center && (requested || stillAtAssessment)) {
          // A routed assessment opens with its peers. Refitting after hydration
          // or resize preserves a camera that the learner has already moved.
          pendingNodeFocus.current = null
          previousAssessmentCamera.current = assessmentCamera
          void flow.setViewport(assessmentCamera, { duration: 0 })
          return
        }
        if (!requested) return
        pendingNodeFocus.current = null
        if (requested?.center) {
          const zoom = Math.max(0.95, Math.min(current.zoom, 1.25))
          void flow.setViewport({ x: width / 2 - (node.position.x + 110) * zoom,
            y: height / 2 - (node.position.y + 36) * zoom, zoom }, { duration: reducedMotion ? 0 : 180 })
          return
        }
        // Keep a requested node within the visible drawing without changing graph layout.
        const left = node.position.x * current.zoom + current.x
        const top = node.position.y * current.zoom + current.y
        const right = left + 220 * current.zoom
        const bottom = top + 72 * current.zoom
        const dx = left < 20 ? 20 - left : right > width - 20 ? width - 20 - right : 0
        const dy = top < 20 ? 20 - top : bottom > height - 20 ? height - 20 - bottom : 0
        if (dx || dy) void flow.setViewport({ ...current, x: current.x + dx, y: current.y + dy },
          { duration: reducedMotion ? 0 : 130 })
      })
    })
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame) }
  }, [selection, selectedId, flow, reducedMotion, nav.isTransitioning, assessmentCamera])

  const scopeRelations = useMemo(() => getLearningScopeRelations(fixture, nav.scopeId), [fixture, nav.scopeId])
  const relationByEndpoints = useMemo(() => new Map(scopeRelations.map(relation =>
    [`${relation.source}\u0000${relation.target}`, relation])), [scopeRelations])
  const connections = useMemo(() => {
    const incoming = new Map<string, string[]>()
    const outgoing = new Map<string, string[]>()
    scopeRelations.forEach(({ source, target }) => {
      incoming.set(target, [...(incoming.get(target) ?? []), source])
      outgoing.set(source, [...(outgoing.get(source) ?? []), target])
    })
    return { incoming, outgoing }
  }, [scopeRelations])
  const related = useMemo(() => new Set(selectedId ? [selectedId,
    ...(connections.incoming.get(selectedId) ?? []), ...(connections.outgoing.get(selectedId) ?? [])] : []), [connections, selectedId])

  const nodes = useMemo<LearningFlowNode[]>(() => activeLayout ? visibleIds.map(id => {
    const entry = fixture.entries[id]
    const goalAction = getGoalAction?.(nav.scopeId, id)
    const assessmentPeer = entry.kind === 'assessment' && inspected?.kind === 'assessment'
    // ReactFlow preserves measured handles across data updates when the fixed ELK dimensions stay set.
    return { id, type: 'learningUnit', position: activeLayout.positions[id],
      ...nodeDimensions, measured: nodeDimensions, draggable: false, selectable: false,
      data: { entry, childCount: entry.children?.length ?? 0,
        outsideCount: fixture.scopeContext
          ? new Set(fixture.scopeContext[nav.scopeId]?.[id]?.map(context => context.requiredGoalId)).size
          : entry.requires.filter(ref => !visible.has(ref)).length,
        ports: activeLayout.ports[id], active: selectedId === id,
        progress: learnerProgress?.[id], activeLearningGoal: activeGoalId === id, unitEntry: id === scope.orientationGoalId, language,
        related: selectedId !== id && related.has(id), muted: !!selectedId && !related.has(id) && !goalAction && !assessmentPeer,
        goalAction,
        onSelect: select, onOpen: open } }
  }) : [], [activeLayout, fixture, nav.scopeId, scope.orientationGoalId, visible, visibleIds, selectedId, inspected, related, select, open,
    learnerProgress, activeGoalId, language, getGoalAction])

  const edges = useMemo<Edge[]>(() => activeLayout?.edges.map(edge => {
    const highlighted = edge.source === selectedId || edge.target === selectedId
    // A reversed layout edge (Rückgriff) runs from its layout target back to its layout source.
    const relationSource = edge.reversed ? edge.target : edge.source
    const relationTarget = edge.reversed ? edge.source : edge.target
    const relation = relationByEndpoints.get(`${relationSource}\u0000${relationTarget}`)
    // Unit maps only: a declared order is solid, demand against it (Rückgriff) is red and dotted.
    const backward = !!relation?.backward
    const declared = relation?.unitOrder === 'declared'
    const guided = relation?.kind === 'unitEntry' || relation?.kind === 'guidedStudy'
    const recommended = relation?.kind === 'studyRecommendation'
    const color = backward ? highlighted ? '#b42318' : '#d4553a' : highlighted ? '#2870b0' : declared ? '#6f8193' : '#9aa4ae'
    const summary = relation?.kind === 'summary' && !declared && !backward
    const sourceTitle = fixture.entries[relationSource].title
    const targetTitle = fixture.entries[relationTarget].title
    const marker = { type: MarkerType.ArrowClosed, width: 11, height: 11, color }
    return { ...edge, type: 'routed', data: { points: edge.points },
      className: relation?.kind === 'unitEntry' ? 'lum-edge--unit-entry' : undefined,
      ...(edge.reversed ? { markerStart: marker } : { markerEnd: marker }),
      style: { stroke: color, strokeWidth: highlighted ? 1.8 : backward || declared ? 1.5 : 1.1,
        strokeDasharray: backward ? '2 4' : summary ? '5 4' : undefined,
        // Declared year/phase order remains orientation context for every selection.
        opacity: selectedId && !highlighted && !declared ? 0.13 : 1 },
      zIndex: highlighted ? 2 : backward ? 1 : 0,
      ariaLabel: recommended ? `${sourceTitle} → ${targetTitle} · ${language === 'en' ? 'Recommended study order' : 'Empfohlene Lernreihenfolge'}`
        : guided ? `${language === 'en' ? 'Guided learning' : 'Geführter Lernweg'}: ${sourceTitle} → ${targetTitle}` : backward ? language === 'en'
        ? `Backward dependency: ${targetTitle} needs goals from ${sourceTitle}, which comes later`
        : `Rückgriff: ${targetTitle} braucht Ziele aus ${sourceTitle}, das erst danach kommt`
        : declared ? language === 'en' ? `${targetTitle} comes after ${sourceTitle} (declared order)`
          : `${targetTitle} kommt nach ${sourceTitle} (erklärte Reihenfolge)`
          : relation?.unitOrder === 'derived' ? language === 'en'
            ? `${sourceTitle} → ${targetTitle}: dependency from the goals, no declared order yet`
            : `${sourceTitle} → ${targetTitle}: Abhängigkeit aus den Zielen, noch ohne erklärte Reihenfolge`
            : summary ? `${sourceTitle} → ${targetTitle}: ${language === 'en' ? 'summarized atomic prerequisites, context' : 'zusammengefasste atomare Voraussetzungen, Kontext'}`
              : language === 'en' ? `${sourceTitle} prepares for ${targetTitle}`
                : `${sourceTitle} bereitet auf ${targetTitle} vor`,
    }
  }) ?? [], [activeLayout, fixture, selectedId, relationByEndpoints, language])
  const unitOrderRelations = scopeRelations.some(relation => relation.unitOrder || relation.backward)
  const backwardCount = scopeRelations.filter(relation => relation.backward).length
  const fixtureHasUnitOrder = useMemo(() => Object.values(fixture.scopeRelations ?? {})
    .some(relations => relations.some(relation => relation.unitOrder || relation.backward)), [fixture])

  useEffect(() => {
    if (!active) return
    const keys = (event: KeyboardEvent) => {
      // The location bar may live in the host's title row, outside the map's own element.
      if (!(event.target instanceof Node)
        || !(mapContainer.current?.contains(event.target) || locationBarContainer?.contains(event.target))) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && searchInput.current) {
        event.preventDefault(); searchInput.current?.focus(); setSearchOpen(true)
      } else if (event.shiftKey && event.key === 'ArrowUp' && event.target instanceof Node
        && mapSurface.current?.contains(event.target)) {
        event.preventDefault(); goUp()
      } else if (event.key === 'Escape') {
        // A consumed Escape must not also close an enclosing dialog.
        if (searchOpen) { event.preventDefault(); setSearchOpen(false); mapSurface.current?.focus({ preventScroll: true }) }
        else if (contextOpen) { event.preventDefault(); setContextOpen(false) }
        else if (onEscape) { event.preventDefault(); onEscape() }
        else if (selectedId) setSelection(null)
        else goUp()
      }
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [active, contextOpen, goUp, locationBarContainer, onEscape, searchOpen, selectedId])

  const setGestureTarget = (target: EventTarget | null) => {
    if (target instanceof Element && target.closest('.react-flow__minimap, .lum-map-controls, .lum-requirement-context')) {
      gestureOnMap.current = false
      return
    }
    gestureOnMap.current = true
    const node = target instanceof Element ? target.closest<HTMLElement>('[data-entry-id]') : null
    gestureTarget.current = node?.dataset.entryId ?? selectedId
  }
  const onMove = (event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    nav.onMove(event, viewport)
    if (active && event && gestureOnMap.current) nav.considerSemanticZoom(viewport, gestureTarget.current)
  }
  const matches = useMemo(() => {
    const text = query.trim().toLocaleLowerCase(language)
    return visibleIds.filter(id => !text || [fixture.entries[id].title, getGoalAction?.(nav.scopeId, id)?.title,
      ...(fixture.entries[id].sourceSections ?? []).map(section => section.title)].some(title => title && plainMapTitle(title).toLocaleLowerCase(language).includes(text)))
  }, [fixture, query, visibleIds, language, nav.scopeId, getGoalAction])
  const selectedRelations = selectedId ? scopeRelations.filter(relation => relation.source === selectedId || relation.target === selectedId) : []
  const selectedOutside = selectedId ? fixture.scopeContext?.[nav.scopeId]?.[selectedId] ?? [] : []
  const contextTitle = (id: string) => fixture.entries[id]?.title ?? fixture.contextGoalTitles?.[id] ?? id
  const contextTitleText = (id: string) => <MathText text={contextTitle(id)} />
  // Follow original hidden prerequisites one step at a time. These records are
  // deliberately never fed back into the board's directed edges or progress.
  const inspectedContextId = contextTrail[contextTrail.length - 1]
  const inspectedContext = inspectedContextId ? fixture.getRequirementContext?.(inspectedContextId) ?? [] : []
  const explainRequirements = (requirements: typeof selectedOutside) => requirements.slice(0, contextLimit).map((requirement, index) =>
    <div className="lum-requirement-row" key={`${requirement.dependentGoalId}:${requirement.requiredGoalId}:${requirement.authoredOnGoalId ?? ''}:${index}`}>
      <p><strong>{contextTitleText(requirement.dependentGoalId)}</strong> {label('benötigt', 'requires')} <strong>{contextTitleText(requirement.requiredGoalId)}</strong>.</p>
      <small>{requirement.inherited ? `${label('Übernommen', 'Inherited')}${requirement.authoredOnGoalId ? ` ${label('aus', 'from')} „${plainMapTitle(contextTitle(requirement.authoredOnGoalId))}“` : ` ${label('aus vorhandenen Voraussetzungen', 'from existing prerequisites')}`}. ` : ''}
        {requirement.sourceGoalIds.length} {label(`atomare Vorbereitung${requirement.sourceGoalIds.length === 1 ? '' : 'en'}`, `atomic prerequisite${requirement.sourceGoalIds.length === 1 ? '' : 's'}`)}{requirement.unresolved ? label(' · Quelldaten unvollständig', ' · incomplete source data') : ''}.</small>
      {fixture.getRequirementContext && contextTrail.length < 8 && !contextTrail.includes(requirement.requiredGoalId)
        && <button type="button" onClick={() => { setContextLimit(12); setContextTrail(current => [...current, requirement.requiredGoalId]) }}>{label('Vorbereitung ansehen:', 'Inspect prerequisites:')} {contextTitleText(requirement.requiredGoalId)}</button>}
    </div>)

  const locationBar = <div className={`lum-location-bar${toolbar ? ' lum-location-bar--toolbar' : ''}${locationBarContainer ? ' lum-location-bar--hosted' : ''}`}>
      <button type="button" className="lum-back" disabled={nav.path.length === 1 || nav.isTransitioning}
        onClick={goUp} title={label('Eine Ebene auftauchen · Shift + Doppelklick', 'Go up one level · Shift + double-click')} aria-label={label('Eine Ebene auftauchen', 'Go up one level')}><ArrowLeft size={17} /></button>
      <nav className="lum-breadcrumb" aria-label={label('Aktuelle Kartenebene', 'Current map level')}>
        {nav.path.map((id, depth) => {
          const crumbTitle = depth === 0 ? headingMode === 'context' ? rootLabel ?? fixture.entries[id].title : label('Übersicht', 'Overview') : fixture.entries[id].title
          const current = depth === nav.path.length - 1
          return <span key={id} className={current ? 'lum-crumb-current' : undefined}>
            {depth > 0 && <ChevronRight size={12} />}
            {current && headingMode === 'context'
              // The path ends in the level shown; it is the heading of the map and needs no row of its own.
              ? <h1 title={plainMapTitle(crumbTitle)} aria-current="page"><MathText text={crumbTitle} /></h1>
              : <button type="button" onClick={() => goToDepth(depth)} disabled={nav.isTransitioning}
                title={plainMapTitle(fixture.entries[id].title)} aria-current={current ? 'page' : undefined}><MathText text={crumbTitle} /></button>}
          </span>
        })}
      </nav>
      {showSearch && <div className="lum-search"><Search size={15} />
        <input ref={searchInput} aria-label={label('In dieser Ebene suchen', 'Search this level')} placeholder={label('In dieser Ebene suchen', 'Search this level')}
          value={query} onFocus={() => setSearchOpen(true)} onClick={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true) }}
          onKeyDown={event => { if (event.key === 'Enter' && matches[0]) { event.preventDefault(); selectSearchResult(matches[0]) } }} />
        {query && <button type="button" aria-label={label('Suche leeren', 'Clear search')} onClick={() => { setQuery(''); searchInput.current?.focus() }}><X size={13} /></button>}
        {searchOpen && <div className="lum-search-results" role="listbox" aria-label={label('Suchtreffer', 'Search results')}>
          {matches.slice(0, 8).map(id => <button key={id} type="button" role="option" aria-selected={selectedId === id}
            onClick={() => selectSearchResult(id)}><MathText text={getGoalAction?.(nav.scopeId, id)?.title ?? fixture.entries[id].title} /><span className="lum-search-kind">{getEntryKindLabel(fixture.entries[id], language)}</span></button>)}
          {!matches.length && <p>{label('Keine Treffer in dieser Ebene.', 'No matches in this level.')}</p>}
          {matches.length > 8 && <small>{matches.length} {label('Treffer · Suche eingrenzen', 'matches · narrow your search')}</small>}
        </div>}
      </div>}
      <div className="lum-bar-actions">
        {extendedTools && <button type="button" className="lum-direction" onClick={() => setDirection(value => value === 'RIGHT' ? 'DOWN' : 'RIGHT')}
          aria-label={label('Lernrichtung drehen', 'Rotate learning direction')} title={direction === 'RIGHT' ? label('Von links nach rechts · zum Drehen klicken', 'Left to right · click to rotate') : label('Von oben nach unten · zum Drehen klicken', 'Top to bottom · click to rotate')}>
          {direction === 'RIGHT' ? <ArrowRight size={17} /> : <ArrowDown size={17} />}
        </button>}
        {fixture.scopeRelations && <button type="button" className="lum-context-toggle" data-testid="learning-map-requirement-toggle"
          aria-expanded={contextOpen} aria-controls="lum-requirement-context" onClick={() => setContextOpen(open => !open)}
          aria-label={label('Verbindungen und Voraussetzungen', 'Connections and prerequisites')} title={label('Verbindungen und Voraussetzungen', 'Connections and prerequisites')}>
          <Waypoints size={16} />
        </button>}
      </div>
      {toolbar && <div className="lum-toolbar">{toolbar}</div>}
    </div>

  return <MapContainer ref={mapContainer} className={`lum-app${embedded ? ' lum-app--embedded' : ''}${headingMode === 'context' ? ' lum-app--contextual' : ''}`}>
    {!embedded && <header className="lum-topbar">
      <button type="button" className="lum-brand" onClick={() => goToDepth(0)} aria-label="Lernkarte Übersicht">
        <Compass size={19} strokeWidth={1.7} /><strong>SkillPilot</strong><span>Lernkarte</span>
      </button>
      <div className="lum-example-picker">{examples && <select aria-label="Beispielkarte" value={exampleId}
        onChange={event => onExampleChange?.(event.target.value)}>
        {examples.map(example => <option key={example.id} value={example.id}>{example.label}</option>)}
      </select>}<span className="lum-demo-badge">Prototyp · Beispieldaten</span></div>
    </header>}
    {locationBarContainer === undefined ? locationBar : locationBarContainer && createPortal(locationBar, locationBarContainer)}
    <div className="lum-workspace">
      <section className="lum-canvas" data-testid="learning-map-board" data-scope-id={nav.scopeId}
        aria-label={`${label('Lernkarte', 'Learning map')}: ${scopeTitle}`} aria-busy={nav.isTransitioning}
        onWheelCapture={event => { setGestureTarget(event.target); nav.recordGesture(-event.deltaY) }}
        onTouchStartCapture={event => {
          setGestureTarget(event.target)
          if (event.touches.length === 2) touchDistance.current = Math.hypot(
            event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY)
        }} onTouchMoveCapture={event => {
          if (event.touches.length !== 2) return
          const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX,
            event.touches[0].clientY - event.touches[1].clientY)
          if (touchDistance.current !== null) nav.recordGesture(distance - touchDistance.current)
          touchDistance.current = distance
        }} onTouchEndCapture={() => { touchDistance.current = null }}>
        {headingMode === 'standard' && <div className="lum-map-summary"><h1>{scopeTitle}</h1>
          <span>{visibleIds.length} Bereiche · {activeLayout?.edges.length ?? '…'} Verbindungen</span>
        </div>}
        {fixture.scopeRelations && contextOpen && <aside id="lum-requirement-context" className="lum-requirement-context" data-testid="learning-map-requirement-context"
          aria-label={label('Verbindungen und Voraussetzungen', 'Connections and prerequisites')}>
          <div className="lum-requirement-head">
            <strong>{label('Verbindungen und Voraussetzungen', 'Connections and prerequisites')}{selectedId ? <> · {contextTitleText(selectedId)}</> : ''}</strong>
            <button type="button" aria-label={label('Schließen', 'Close')} onClick={() => setContextOpen(false)}><X size={15} /></button>
          </div>
          <div className="lum-requirement-body">
            <p>{label('Pfeile führen von der Vorbereitung zur Anwendung. Gestrichelte Pfeile fassen einzelne Anforderungen zusammen; sie beschreiben Zusammenhänge zwischen Bereichen.', 'Arrows lead from preparation to application. Dashed arrows summarize individual requirements and provide context between sections.')}</p>
            {fixtureHasUnitOrder && <p>{label('Zwischen zwei Einheiten zeigt ein durchgezogener Pfeil die erklärte Reihenfolge: Die eine Einheit kommt nach der anderen. Ein rot gepunkteter Pfeil ist ein Rückgriff: Ziele einer Einheit brauchen Ziele aus einer Einheit, die erst danach kommt.',
              'Between two units, a solid arrow shows the declared order: one unit comes after the other. A red dotted arrow is a backward dependency: goals of one unit need goals from a unit that only comes later.')}</p>}
            {inspectedContextId ? <>
              <button type="button" onClick={() => { setContextLimit(12); setContextTrail(current => current.slice(0, -1)) }}>{label('Zurück', 'Back')}</button>
              <h2>{label('Vorbereitung von', 'Prerequisites for')} {contextTitleText(inspectedContextId)}</h2>
              {explainRequirements(inspectedContext)}
              {!inspectedContext.length && <p>{label('Keine weiteren Voraussetzungen in den verfügbaren Quelldaten.', 'No further prerequisites in the available source data.')}</p>}
            </> : <>
              {selectedRelations.slice(0, contextLimit).map(relation => <div key={`${relation.source}:${relation.target}`}>
                <h2>{contextTitleText(relation.source)} → {contextTitleText(relation.target)}{relation.kind === 'studyRecommendation' ? label(' · Empfohlene Lernreihenfolge', ' · Recommended study order')
                  : relation.kind === 'unitEntry' || relation.kind === 'guidedStudy' ? label(' · Geführter Lernweg', ' · Guided learning')
                  : relation.backward ? label(' · Rückgriff', ' · Backward dependency')
                  : relation.unitOrder === 'declared' ? label(' · Erklärte Reihenfolge', ' · Declared order')
                    : relation.unitOrder === 'derived' ? label(' · Noch nicht erklärte Abhängigkeit', ' · Dependency not declared yet')
                      : relation.kind === 'summary' ? label(' · Zusammenfassung', ' · Summary') : ''}</h2>
                {explainRequirements(relation.provenance)}
              </div>)}
              {selectedOutside.length > 0 && <><h2>{label('Vorbereitung außerhalb dieser Ebene', 'Prerequisites outside this level')}</h2>{explainRequirements(selectedOutside)}</>}
              {selectedId && !selectedRelations.length && !selectedOutside.length && <p>{label('Keine Verbindungen außerhalb dieses Bereichs in dieser Ebene.', 'No connections outside this section at this level.')}</p>}
              {!selectedId && <p>{label('Wähle einen Bereich oder ein Lernziel, um die Herkunft seiner Voraussetzungen zu sehen.', 'Select a section or learning goal to inspect the origin of its prerequisites.')}</p>}
              {selectedId && fixture.getRequirementContext && <button type="button" onClick={() => {
                setContextLimit(12); setContextTrail([selectedId])
              }}>{label('Ursprüngliche Voraussetzungen ansehen', 'Inspect original prerequisites')}</button>}
            </>}
            {(inspectedContextId ? inspectedContext.length > contextLimit : selectedRelations.length > contextLimit
              || selectedOutside.length > contextLimit || selectedRelations.some(relation => relation.provenance.length > contextLimit))
              && <button type="button" onClick={() => setContextLimit(value => value + 12)}>{label('Weitere Einträge anzeigen', 'Show more entries')}</button>}
          </div>
        </aside>}
        <div ref={mapSurface} tabIndex={-1} className={`lum-flow lum-flow--${nav.phase}`} onDoubleClickCapture={event => {
          if (!event.shiftKey) return
          event.preventDefault()
          event.stopPropagation()
          setSelection(null)
          goUp()
        }}>
          <ReactFlow<LearningFlowNode> nodes={nodes} edges={edges} nodeTypes={nodeTypes} edgeTypes={edgeTypes}
            nodesDraggable={false} nodesConnectable={false} nodesFocusable={false}
            edgesFocusable={false} elementsSelectable={false} zoomOnDoubleClick={false}
            minZoom={0.08} maxZoom={2.8} onMove={onMove} onlyRenderVisibleElements
            onNodeClick={(_event, node) => select(node.id)}
            onNodeDoubleClick={(_event, node) => open(node.id)}
            onPaneClick={() => { setSelection(null); setSearchOpen(false) }}
            proOptions={{ hideAttribution: true }} preventScrolling>
            <Background variant={BackgroundVariant.Dots} gap={24} size={0.65} color="#e3e6e9" />
          </ReactFlow>
        </div>
        {layoutError && <div className="lum-layout-error" role="alert" data-testid="learner-map-layout-error"><p>{layoutError}</p>
          <button type="button" onClick={() => { restartLearningScopeLayoutWorker(); setLayoutError(null); setLayoutAttempt(value => value + 1) }}>{label('Erneut versuchen', 'Try again')}</button>
          {onReturnToTree && <button type="button" onClick={onReturnToTree}>{label('Zum Baum wechseln', 'Return to tree')}</button>}
        </div>}
        {!activeLayout && !layoutError && <div className="lum-loading" role="status">{label('Karte wird angeordnet…', 'Arranging map…')}</div>}
        <div className="lum-map-bottom-bar">
          <div className="lum-map-controls" aria-label={label('Kartensteuerung', 'Map controls')} onPointerDownCapture={() => { gestureOnMap.current = false }}>
            <button type="button" onClick={() => void flow.zoomOut({ duration: reducedMotion ? 0 : 150 })} aria-label={label('Karte verkleinern', 'Zoom out')}><Minus size={16} /></button>
            <span aria-label={label('Zoomwert', 'Zoom level')}>{Math.round(nav.zoom * 100)} %</span>
            <button type="button" onClick={() => void flow.zoomIn({ duration: reducedMotion ? 0 : 150 })} aria-label={label('Karte vergrößern', 'Zoom in')}><Plus size={16} /></button>
            <span className="lum-control-divider" />
            <button type="button" onClick={() => void flow.fitView({ padding: 0.16, maxZoom: 1.1, duration: reducedMotion ? 0 : 200 })} aria-label={label('Diese Ebene einpassen', 'Fit this level')} title={label('Gesamte Ebene einpassen', 'Fit entire level')}><Expand size={16} /></button>
          </div>
          <div className="lum-map-footer">
            {unitOrderRelations && <span className="lum-order-legend" data-testid="learning-map-order-legend">
              <span><i className="lum-legend-line lum-legend-line--declared" />{label('erklärte Reihenfolge', 'declared order')}</span>
              <span title={label('Lernziele am Ende des Pfeils brauchen Lernziele an seinem Anfang. Zwischen zwei Einheiten ist dafür noch keine Reihenfolge erklärt.',
                'Goals at the end of the arrow need goals at its start. Between two units, no order has been declared for this yet.')}>
                <i className="lum-legend-line lum-legend-line--derived" />{label('Bedarf der Lernziele', 'need of the goals')}</span>
              {backwardCount > 0 && <span className="lum-legend-backward" title={label('Früheres braucht Späteres: Ein Ziel braucht ein Ziel aus einer Einheit, die nach seiner eigenen Einheit kommt.', 'Earlier needs later: a goal needs a goal from a unit that comes after its own unit.')}>
                <i className="lum-legend-line lum-legend-line--backward" />{backwardCount} {label(backwardCount === 1 ? 'Rückgriff' : 'Rückgriffe', backwardCount === 1 ? 'backward dependency' : 'backward dependencies')}</span>}
            </span>}
            <span className="lum-map-hint">{direction === 'RIGHT' ? '→' : '↓'} {label('Vorbereitung zur Anwendung', 'Preparation to application')}<span> · {label('Doppelklick hinein · Shift + Doppelklick heraus', 'Double-click in · Shift + double-click out')}</span></span>
          </div>
          {showMinimap && <MiniMap pannable zoomable style={{ width: narrowScreen ? 100 : 144, height: narrowScreen ? 44 : 56 }}
            nodeColor="#d5e1ec" nodeStrokeColor="#9db2c4" nodeBorderRadius={2}
            maskColor="rgba(245,247,249,0.75)" ariaLabel={label('Übersichtskarte', 'Overview map')} />}
        </div>
      </section>
    </div>
    <div className="lum-sr-only" role="status" aria-live="polite">{scopeTitle}, {label('Ebene', 'level')} {nav.path.length}, {visibleIds.length} {label('Bereiche', 'sections')}.</div>
  </MapContainer>
}

export function LearningUnitMap(props: MapProps) {
  return <ReactFlowProvider><MapScene {...props} /></ReactFlowProvider>
}
