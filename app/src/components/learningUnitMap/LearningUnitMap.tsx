import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Compass, Expand,
  Minus, Plus, Search, X } from 'lucide-react'
import { Background, BackgroundVariant, MarkerType, MiniMap, ReactFlow, ReactFlowProvider,
  useReactFlow, type Edge, type Viewport } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { LearningEntryProgress, LearningMapCommand, LearningMapFixture } from './types'
import { MapNode, type LearningFlowNode } from './MapNode'
import { kindLabels } from './presentation'
import { useMapNavigation } from './useMapNavigation'
import { layoutLearningScope, type LearningScopeLayout } from './layoutLearningScope'
import { ElkRoutedEdge } from './ElkRoutedEdge'
import { mapEntryPath } from './mapEntryPath'
import './learningUnitMap.css'

const nodeTypes = { learningUnit: MapNode }
const edgeTypes = { routed: ElkRoutedEdge }
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
  showInspector?: boolean
  onEntrySelect?: (entryId: string) => void
  onSelectionChange?: (entryId: string | null) => void
  renderSelectionActions?: (entryId: string) => ReactNode
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
  learnerProgress, activeGoalId, initialScopeId, command, showInspector = true, onEntrySelect,
  onSelectionChange, renderSelectionActions }: MapProps) {
  const reducedMotion = useReducedMotion()
  const narrowScreen = useNarrowScreen()
  const flow = useReactFlow<LearningFlowNode>()
  const [direction, setDirection] = useState<'RIGHT' | 'DOWN'>('RIGHT')
  const [layout, setLayout] = useState<{ fixture: LearningMapFixture; key: string; data: LearningScopeLayout } | null>(null)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const nav = useMapNavigation(fixture, reducedMotion, layout?.fixture === fixture ? layout.key : null, direction, initialScopeId, active)
  const { enter, goUp, goToDepth, goToScope } = nav
  const [selection, setSelection] = useState<{ scope: string; id: string } | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const mapSurface = useRef<HTMLDivElement>(null)
  const pendingSearchFocus = useRef<string | null>(null)
  const lastCommand = useRef<string | null>(null)
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
  const breadcrumbPath = headingMode === 'context' ? nav.path.slice(0, -1) : nav.path
  const extendedTools = headingMode === 'standard' || visibleIds.length >= 8
  const showLocationBar = headingMode === 'standard' || nav.path.length > 1 || extendedTools
  const showMinimap = extendedTools || (narrowScreen && !!activeLayout
    && (activeLayout.width * nav.zoom > window.innerWidth - 30 || activeLayout.height * nav.zoom > window.innerHeight / 2))

  useEffect(() => {
    if (!active) return
    let current = true
    void layoutLearningScope(fixture, nav.scopeId, direction).then(data => {
      if (current) { setLayout({ fixture, key: layoutKey, data }); setLayoutError(null) }
    }).catch(() => { if (current) setLayoutError('Die Karte konnte nicht angeordnet werden. Bitte lade sie erneut.') })
    return () => { current = false }
  }, [active, fixture, nav.scopeId, direction, layoutKey])

  const highlight = useCallback((id: string) => {
    if (!visible.has(id)) return
    setSelection({ scope: nav.scopeId, id })
  }, [nav.scopeId, visible])
  const select = useCallback((id: string) => {
    if (!visible.has(id)) return
    highlight(id)
    onEntrySelect?.(id)
  }, [highlight, onEntrySelect, visible])
  const open = useCallback((id: string) => {
    const entry = fixture.entries[id]
    if (!entry) return
    if (entry.kind === 'unit' && entry.children?.length) {
      setSelection(null)
      enter(id)
    }
    else select(id)
  }, [fixture, enter, select])
  const focusNode = useCallback((id: string, center = false) => {
    if (!visible.has(id)) return
    pendingSearchFocus.current = center ? id : null
    highlight(id)
    setSearchOpen(false)
  }, [highlight, visible])
  const selectSearchResult = useCallback((id: string) => {
    select(id)
    focusNode(id, true)
  }, [focusNode, select])

  useEffect(() => { onSelectionChange?.(selectedId) }, [onSelectionChange, selectedId])

  useEffect(() => {
    if (!active || !command || nav.isTransitioning) return
    const key = `${command.nonce}:${command.entryId}`
    if (lastCommand.current === key) return
    const targetPath = mapEntryPath(fixture, command.entryId)
    // A temporarily hydrating projection may not contain the command yet.
    if (!targetPath) return
    const ownerId = targetPath.length > 1 ? targetPath[targetPath.length - 2] : fixture.rootId
    if (ownerId !== nav.scopeId) { goToScope(ownerId); return }
    const frame = requestAnimationFrame(() => {
      lastCommand.current = key
      if (command.entryId !== fixture.rootId) focusNode(command.entryId)
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
        if (pendingSearchFocus.current === selectedId) {
          pendingSearchFocus.current = null
          const zoom = Math.max(0.95, Math.min(current.zoom, 1.25))
          void flow.setViewport({ x: width / 2 - (node.position.x + 110) * zoom,
            y: height / 2 - (node.position.y + 36) * zoom, zoom }, { duration: reducedMotion ? 0 : 180 })
          return
        }
        // Reserve room for the newly opened inspector without changing graph layout.
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
  }, [selection, selectedId, flow, reducedMotion, nav.isTransitioning])

  const connections = useMemo(() => {
    const incoming = new Map<string, string[]>()
    const outgoing = new Map<string, string[]>()
    visibleIds.forEach(id => {
      incoming.set(id, fixture.entries[id].requires.filter(ref => visible.has(ref)))
      fixture.entries[id].requires.filter(ref => visible.has(ref)).forEach(ref => {
        outgoing.set(ref, [...(outgoing.get(ref) ?? []), id])
      })
    })
    return { incoming, outgoing }
  }, [fixture, visible, visibleIds])
  const related = useMemo(() => new Set(selectedId ? [selectedId,
    ...(connections.incoming.get(selectedId) ?? []), ...(connections.outgoing.get(selectedId) ?? [])] : []), [connections, selectedId])

  const nodes = useMemo<LearningFlowNode[]>(() => activeLayout ? visibleIds.map(id => {
    const entry = fixture.entries[id]
    return { id, type: 'learningUnit', position: activeLayout.positions[id],
      width: 220, height: 72, draggable: false, selectable: false,
      data: { entry, childCount: entry.children?.length ?? 0,
        outsideCount: entry.requires.filter(ref => !visible.has(ref)).length,
        ports: activeLayout.ports[id], active: selectedId === id,
        progress: learnerProgress?.[id], activeLearningGoal: activeGoalId === id,
        related: selectedId !== id && related.has(id), muted: !!selectedId && !related.has(id),
        onFocus: highlight, onSelect: select, onOpen: open } }
  }) : [], [activeLayout, fixture, visible, visibleIds, selectedId, related, highlight, select, open, learnerProgress, activeGoalId])

  const edges = useMemo<Edge[]>(() => activeLayout?.edges.map(edge => {
    const highlighted = edge.source === selectedId || edge.target === selectedId
    const color = highlighted ? '#2870b0' : '#9aa4ae'
    return { ...edge, type: 'routed', data: { points: edge.points },
      markerEnd: { type: MarkerType.ArrowClosed, width: 11, height: 11, color },
      style: { stroke: color, strokeWidth: highlighted ? 1.8 : 1.1,
        opacity: selectedId && !highlighted ? 0.13 : 1 },
      zIndex: highlighted ? 2 : 0,
      ariaLabel: `${fixture.entries[edge.source].title} bereitet auf ${fixture.entries[edge.target].title} vor`,
    }
  }) ?? [], [activeLayout, fixture, selectedId])

  useEffect(() => {
    if (!active) return
    const keys = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault(); searchInput.current?.focus(); setSearchOpen(true)
      } else if (event.key === 'Escape') {
        if (searchOpen) { setSearchOpen(false); searchInput.current?.blur() }
        else if (selectedId) setSelection(null)
        else goUp()
      }
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [active, goUp, searchOpen, selectedId])

  const setGestureTarget = (target: EventTarget | null) => {
    if (target instanceof Element && target.closest('.react-flow__minimap, .lum-map-controls')) {
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
    const text = query.trim().toLocaleLowerCase('de')
    return visibleIds.filter(id => !text || fixture.entries[id].title.toLocaleLowerCase('de').includes(text))
  }, [fixture, query, visibleIds])
  const contextEntries = inspected?.requires.filter(id => !visible.has(id) && fixture.entries[id]).map(id => fixture.entries[id]) ?? []

  return <main className={`lum-app${embedded ? ' lum-app--embedded' : ''}${headingMode === 'context' ? ' lum-app--contextual' : ''}`}>
    {!embedded && <header className="lum-topbar">
      <button type="button" className="lum-brand" onClick={() => goToDepth(0)} aria-label="Lernkarte Übersicht">
        <Compass size={19} strokeWidth={1.7} /><strong>SkillPilot</strong><span>Lernkarte</span>
      </button>
      <div className="lum-example-picker">{examples && <select aria-label="Beispielkarte" value={exampleId}
        onChange={event => onExampleChange?.(event.target.value)}>
        {examples.map(example => <option key={example.id} value={example.id}>{example.label}</option>)}
      </select>}<span className="lum-demo-badge">Prototyp · Beispieldaten</span></div>
    </header>}
    {showLocationBar && <div className="lum-location-bar">
      {(headingMode === 'standard' || nav.path.length > 1) && <button type="button" className="lum-back" disabled={nav.path.length === 1 || nav.isTransitioning}
        onClick={goUp} title="Eine Ebene auftauchen · Shift + Doppelklick" aria-label="Eine Ebene auftauchen"><ArrowLeft size={17} /></button>
      }
      {breadcrumbPath.length > 0 && <nav className="lum-breadcrumb" aria-label="Aktuelle Kartenebene">
        {breadcrumbPath.map((id, depth) => <span key={id}>
          {depth > 0 && <ChevronRight size={12} />}
          <button type="button" onClick={() => goToDepth(depth)} disabled={nav.isTransitioning}
            title={fixture.entries[id].title} aria-current={depth === nav.path.length - 1 ? 'page' : undefined}>
            {depth === 0 ? headingMode === 'context' ? rootLabel ?? fixture.entries[id].title : 'Übersicht' : fixture.entries[id].title}
          </button>
        </span>)}
      </nav>}
      {extendedTools && <div className="lum-search"><Search size={15} />
        <input ref={searchInput} aria-label="In dieser Ebene suchen" placeholder="In dieser Ebene suchen"
          value={query} onFocus={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true) }}
          onKeyDown={event => { if (event.key === 'Enter' && matches[0]) { event.preventDefault(); selectSearchResult(matches[0]) } }} />
        {query && <button type="button" aria-label="Suche leeren" onClick={() => { setQuery(''); searchInput.current?.focus() }}><X size={13} /></button>}
        {searchOpen && <div className="lum-search-results" role="listbox" aria-label="Suchtreffer">
          {matches.slice(0, 8).map(id => <button key={id} type="button" role="option" aria-selected={selectedId === id}
            onClick={() => selectSearchResult(id)}>{fixture.entries[id].title}<span>{kindLabels[fixture.entries[id].kind]}</span></button>)}
          {!matches.length && <p>Keine Treffer in dieser Ebene.</p>}
          {matches.length > 8 && <small>{matches.length} Treffer · Suche eingrenzen</small>}
        </div>}
      </div>}
      {extendedTools && <button type="button" className="lum-direction" onClick={() => setDirection(value => value === 'RIGHT' ? 'DOWN' : 'RIGHT')}
        aria-label="Lernrichtung drehen" title={direction === 'RIGHT' ? 'Von links nach rechts · zum Drehen klicken' : 'Von oben nach unten · zum Drehen klicken'}>
        {direction === 'RIGHT' ? <ArrowRight size={17} /> : <ArrowDown size={17} />}
      </button>}
    </div>}
    <div className="lum-workspace">
      <section className="lum-canvas" data-testid="learning-map-board" data-scope-id={nav.scopeId}
        aria-label={`Lernkarte: ${scopeTitle}`} aria-busy={nav.isTransitioning}
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
        <div className="lum-map-summary"><h1>{scopeTitle}</h1>
          {headingMode === 'standard' && <span>{visibleIds.length} Bereiche · {activeLayout?.edges.length ?? '…'} Verbindungen</span>}
        </div>
        <div ref={mapSurface} className={`lum-flow lum-flow--${nav.phase}`} onDoubleClickCapture={event => {
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
            {showMinimap && <MiniMap pannable zoomable nodeColor="#d5e1ec" nodeStrokeColor="#9db2c4" nodeBorderRadius={2}
              maskColor="rgba(245,247,249,0.75)" ariaLabel="Übersichtskarte" />}
          </ReactFlow>
        </div>
        {layoutError && <div className="lum-layout-error" role="alert">{layoutError}</div>}
        {!activeLayout && !layoutError && <div className="lum-loading" role="status">Karte wird angeordnet…</div>}
        <div className="lum-map-controls" aria-label="Kartensteuerung" onPointerDownCapture={() => { gestureOnMap.current = false }}>
          <button type="button" onClick={() => void flow.zoomOut({ duration: reducedMotion ? 0 : 150 })} aria-label="Karte verkleinern"><Minus size={16} /></button>
          <span aria-label="Zoomwert">{Math.round(nav.zoom * 100)} %</span>
          <button type="button" onClick={() => void flow.zoomIn({ duration: reducedMotion ? 0 : 150 })} aria-label="Karte vergrößern"><Plus size={16} /></button>
          <span className="lum-control-divider" />
          <button type="button" onClick={() => void flow.fitView({ padding: 0.16, maxZoom: 1.1, duration: reducedMotion ? 0 : 200 })} aria-label="Diese Ebene einpassen" title="Gesamte Ebene einpassen"><Expand size={16} /></button>
        </div>
        <span className="lum-map-hint">{direction === 'RIGHT' ? '→' : '↓'} Vorbereitung zur Anwendung<span> · Doppelklick hinein · Shift + Doppelklick heraus</span></span>
      </section>
      {showInspector && inspected && <aside className="lum-inspector" aria-label="Ausgewählter Bereich">
        <div className="lum-inspector-top"><span>{inspected.eyebrow ?? kindLabels[inspected.kind]}</span>
          <button type="button" aria-label="Information schließen" onClick={() => setSelection(null)}><X size={17} /></button></div>
        <h2 title={inspected.description}>{inspected.title}</h2><p>{inspected.description}</p>
        {learnerProgress?.[inspected.id] && <div className="lum-selected-progress">
          <strong>{learnerProgress[inspected.id].explicit + learnerProgress[inspected.id].implicit} / {learnerProgress[inspected.id].total} erreicht</strong>
          <span>{learnerProgress[inspected.id].explicit} direkt · {learnerProgress[inspected.id].implicit} implizit</span>
        </div>}
        {renderSelectionActions && <div className="lum-selection-actions">{renderSelectionActions(inspected.id)}</div>}
        {inspected.kind === 'unit' && inspected.children?.length ? <button type="button" className="lum-enter" disabled={nav.isTransitioning}
          onClick={() => open(inspected.id)}>Einheit öffnen <ArrowUpRight size={16} /></button> : null}
        <div className="lum-relations">
          <h3>Vorbereitungen <span>{connections.incoming.get(inspected.id)?.length ?? 0}</span></h3>
          {(connections.incoming.get(inspected.id) ?? []).map(id => <button type="button" key={id} onClick={() => selectSearchResult(id)}>{fixture.entries[id].title}<ChevronRight size={13} /></button>)}
          {!connections.incoming.get(inspected.id)?.length && <small>Keine innerhalb dieser Ebene.</small>}
          <h3>Bereitet vor auf <span>{connections.outgoing.get(inspected.id)?.length ?? 0}</span></h3>
          {(connections.outgoing.get(inspected.id) ?? []).map(id => <button type="button" key={id} onClick={() => selectSearchResult(id)}>{fixture.entries[id].title}<ChevronRight size={13} /></button>)}
          {!connections.outgoing.get(inspected.id)?.length && <small>Keine innerhalb dieser Ebene.</small>}
          {contextEntries.length > 0 && <div className="lum-outside"><h3>Außerhalb dieser Ebene <span>{contextEntries.length}</span></h3>
            {contextEntries.map(entry => <span key={entry.id}>{entry.title}</span>)}</div>}
        </div>
      </aside>}
    </div>
    <div className="lum-sr-only" role="status" aria-live="polite">{scope.title}, Ebene {nav.path.length}, {visibleIds.length} Bereiche.</div>
  </main>
}

export function LearningUnitMap(props: MapProps) {
  return <ReactFlowProvider><MapScene {...props} /></ReactFlowProvider>
}
