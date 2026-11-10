import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, ChevronRight, Compass, Expand,
  Minus, Plus, Search, X } from 'lucide-react'
import { Background, BackgroundVariant, MarkerType, MiniMap, ReactFlow, ReactFlowProvider,
  useReactFlow, type Edge, type Viewport } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { LearningEntryProgress, LearningMapCommand, LearningMapFixture } from './types'
import { MapNode, type LearningFlowNode } from './MapNode'
import { getKindLabels } from './presentation'
import { useMapNavigation } from './useMapNavigation'
import { layoutLearningScope, restartLearningScopeLayoutWorker, type LearningScopeLayout } from './layoutLearningScope'
import { ElkRoutedEdge } from './ElkRoutedEdge'
import { mapEntryPath } from './mapEntryPath'
import { getLearningScopeRelations } from './scopeRelations'
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
  onReturnToTree?: () => void
  /** Hosts such as a full-window dialog own Escape once the map search is closed. */
  onEscape?: () => void
  language?: 'de' | 'en'
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
  onSelectionChange, renderSelectionActions, onReturnToTree, onEscape, language = 'de' }: MapProps) {
  const label = (de: string, en: string) => language === 'en' ? en : de
  const kindLabels = getKindLabels(language)
  const MapContainer = embedded ? 'section' : 'main'
  const reducedMotion = useReducedMotion()
  const narrowScreen = useNarrowScreen()
  const flow = useReactFlow<LearningFlowNode>()
  const [direction, setDirection] = useState<'RIGHT' | 'DOWN'>('RIGHT')
  const [layout, setLayout] = useState<{ fixture: LearningMapFixture; key: string; data: LearningScopeLayout } | null>(null)
  const [layoutError, setLayoutError] = useState<string | null>(null)
  const [layoutAttempt, setLayoutAttempt] = useState(0)
  const mapContainer = useRef<HTMLElement>(null)
  const mapSurface = useRef<HTMLDivElement>(null)
  const nav = useMapNavigation(fixture, reducedMotion, layout?.fixture === fixture ? layout.key : null,
    direction, initialScopeId, active, mapContainer, mapSurface)
  const { enter, goUp, goToDepth, goToScope } = nav
  const [selection, setSelection] = useState<{ scope: string; id: string } | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [contextTrail, setContextTrail] = useState<string[]>([])
  const [contextLimit, setContextLimit] = useState(12)
  const searchInput = useRef<HTMLInputElement>(null)
  const pendingNodeFocus = useRef<{ id: string; center: boolean } | null>(null)
  const pendingSelectionEcho = useRef<{ entryId: string; nonce: number; baselineKey: string | null } | null>(null)
  // A newly mounted scope starts from its current selection; the supplied
  // sequence may describe a historical reveal made before the map was opened.
  const seenRevealNonce = useRef(command?.nonce ?? 0)
  const pendingReveal = useRef<{ entryId: string; nonce: number; baselineSelectionId: string } | null>(null)
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
    const timeout = window.setTimeout(() => {
      if (current) { current = false; setLayoutError(language === 'en' ? 'Arranging the map is taking too long.' : 'Das Anordnen der Karte dauert zu lange.') }
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
    select(id)
    focusNode(id, true)
  }, [focusNode, select])

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
    const frame = requestAnimationFrame(() => {
      lastCommand.current = key
      if (pendingReveal.current === reveal) pendingReveal.current = null
      if (targetId !== fixture.rootId) focusNode(targetId)
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
        if (!showInspector && !requested) return
        pendingNodeFocus.current = null
        if (requested?.center) {
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
  }, [selection, selectedId, flow, reducedMotion, nav.isTransitioning, showInspector])

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
    return { id, type: 'learningUnit', position: activeLayout.positions[id],
      width: 220, height: 72, draggable: false, selectable: false,
      data: { entry, childCount: entry.children?.length ?? 0,
        outsideCount: fixture.scopeContext
          ? new Set(fixture.scopeContext[nav.scopeId]?.[id]?.map(context => context.requiredGoalId)).size
          : entry.requires.filter(ref => !visible.has(ref)).length,
        ports: activeLayout.ports[id], active: selectedId === id,
        progress: learnerProgress?.[id], activeLearningGoal: activeGoalId === id, language,
        related: selectedId !== id && related.has(id), muted: !!selectedId && !related.has(id),
        onSelect: select, onOpen: open } }
  }) : [], [activeLayout, fixture, nav.scopeId, visible, visibleIds, selectedId, related, select, open, learnerProgress, activeGoalId, language])

  const edges = useMemo<Edge[]>(() => activeLayout?.edges.map(edge => {
    const highlighted = edge.source === selectedId || edge.target === selectedId
    const color = highlighted ? '#2870b0' : '#9aa4ae'
    const summary = relationByEndpoints.get(`${edge.source}\u0000${edge.target}`)?.kind === 'summary'
    return { ...edge, type: 'routed', data: { points: edge.points },
      markerEnd: { type: MarkerType.ArrowClosed, width: 11, height: 11, color },
      style: { stroke: color, strokeWidth: highlighted ? 1.8 : 1.1, strokeDasharray: summary ? '5 4' : undefined,
        opacity: selectedId && !highlighted ? 0.13 : 1 },
      zIndex: highlighted ? 2 : 0,
      ariaLabel: summary ? `${fixture.entries[edge.source].title} → ${fixture.entries[edge.target].title}: ${language === 'en' ? 'summarized atomic prerequisites, context' : 'zusammengefasste atomare Voraussetzungen, Kontext'}`
        : language === 'en' ? `${fixture.entries[edge.source].title} prepares for ${fixture.entries[edge.target].title}`
          : `${fixture.entries[edge.source].title} bereitet auf ${fixture.entries[edge.target].title} vor`,
    }
  }) ?? [], [activeLayout, fixture, selectedId, relationByEndpoints, language])

  useEffect(() => {
    if (!active) return
    const keys = (event: KeyboardEvent) => {
      if (!(event.target instanceof Node) || !mapContainer.current?.contains(event.target)) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f' && searchInput.current) {
        event.preventDefault(); searchInput.current?.focus(); setSearchOpen(true)
      } else if (event.shiftKey && event.key === 'ArrowUp' && event.target instanceof Node
        && mapSurface.current?.contains(event.target)) {
        event.preventDefault(); goUp()
      } else if (event.key === 'Escape') {
        // A consumed Escape must not also close an enclosing dialog.
        if (searchOpen) { event.preventDefault(); setSearchOpen(false); mapSurface.current?.focus({ preventScroll: true }) }
        else if (onEscape) { event.preventDefault(); onEscape() }
        else if (selectedId) setSelection(null)
        else goUp()
      }
    }
    window.addEventListener('keydown', keys)
    return () => window.removeEventListener('keydown', keys)
  }, [active, goUp, onEscape, searchOpen, selectedId])

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
  const selectedRelations = selectedId ? scopeRelations.filter(relation => relation.source === selectedId || relation.target === selectedId) : []
  const selectedOutside = selectedId ? fixture.scopeContext?.[nav.scopeId]?.[selectedId] ?? [] : []
  const contextTitle = (id: string) => fixture.entries[id]?.title ?? fixture.contextGoalTitles?.[id] ?? id
  // Follow original hidden prerequisites one step at a time. These records are
  // deliberately never fed back into the board's directed edges or progress.
  const inspectedContextId = contextTrail[contextTrail.length - 1]
  const inspectedContext = inspectedContextId ? fixture.getRequirementContext?.(inspectedContextId) ?? [] : []
  const explainRequirements = (requirements: typeof selectedOutside) => requirements.slice(0, contextLimit).map((requirement, index) =>
    <div className="lum-requirement-row" key={`${requirement.dependentGoalId}:${requirement.requiredGoalId}:${requirement.authoredOnGoalId ?? ''}:${index}`}>
      <p><strong>{contextTitle(requirement.dependentGoalId)}</strong> {label('benötigt', 'requires')} <strong>{contextTitle(requirement.requiredGoalId)}</strong>.</p>
      <small>{requirement.inherited ? `${label('Übernommen', 'Inherited')}${requirement.authoredOnGoalId ? ` ${label('aus', 'from')} „${contextTitle(requirement.authoredOnGoalId)}“` : ` ${label('aus vorhandenen Voraussetzungen', 'from existing prerequisites')}`}. ` : ''}
        {requirement.sourceGoalIds.length} {label(`atomare Vorbereitung${requirement.sourceGoalIds.length === 1 ? '' : 'en'}`, `atomic prerequisite${requirement.sourceGoalIds.length === 1 ? '' : 's'}`)}{requirement.unresolved ? label(' · Quelldaten unvollständig', ' · incomplete source data') : ''}.</small>
      {fixture.getRequirementContext && contextTrail.length < 8 && !contextTrail.includes(requirement.requiredGoalId)
        && <button type="button" onClick={() => { setContextLimit(12); setContextTrail(current => [...current, requirement.requiredGoalId]) }}>{label('Vorbereitung ansehen:', 'Inspect prerequisites:')} {contextTitle(requirement.requiredGoalId)}</button>}
    </div>)

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
    {showLocationBar && <div className="lum-location-bar">
      {(headingMode === 'standard' || nav.path.length > 1) && <button type="button" className="lum-back" disabled={nav.path.length === 1 || nav.isTransitioning}
        onClick={goUp} title={label('Eine Ebene auftauchen · Shift + Doppelklick', 'Go up one level · Shift + double-click')} aria-label={label('Eine Ebene auftauchen', 'Go up one level')}><ArrowLeft size={17} /></button>
      }
      {breadcrumbPath.length > 0 && <nav className="lum-breadcrumb" aria-label={label('Aktuelle Kartenebene', 'Current map level')}>
        {breadcrumbPath.map((id, depth) => <span key={id}>
          {depth > 0 && <ChevronRight size={12} />}
          <button type="button" onClick={() => goToDepth(depth)} disabled={nav.isTransitioning}
            title={fixture.entries[id].title} aria-current={depth === nav.path.length - 1 ? 'page' : undefined}>
            {depth === 0 ? headingMode === 'context' ? rootLabel ?? fixture.entries[id].title : label('Übersicht', 'Overview') : fixture.entries[id].title}
          </button>
        </span>)}
      </nav>}
      {extendedTools && <div className="lum-search"><Search size={15} />
        <input ref={searchInput} aria-label={label('In dieser Ebene suchen', 'Search this level')} placeholder={label('In dieser Ebene suchen', 'Search this level')}
          value={query} onFocus={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true) }}
          onKeyDown={event => { if (event.key === 'Enter' && matches[0]) { event.preventDefault(); selectSearchResult(matches[0]) } }} />
        {query && <button type="button" aria-label={label('Suche leeren', 'Clear search')} onClick={() => { setQuery(''); searchInput.current?.focus() }}><X size={13} /></button>}
        {searchOpen && <div className="lum-search-results" role="listbox" aria-label={label('Suchtreffer', 'Search results')}>
          {matches.slice(0, 8).map(id => <button key={id} type="button" role="option" aria-selected={selectedId === id}
            onClick={() => selectSearchResult(id)}>{fixture.entries[id].title}<span>{kindLabels[fixture.entries[id].kind]}</span></button>)}
          {!matches.length && <p>{label('Keine Treffer in dieser Ebene.', 'No matches in this level.')}</p>}
          {matches.length > 8 && <small>{matches.length} {label('Treffer · Suche eingrenzen', 'matches · narrow your search')}</small>}
        </div>}
      </div>}
      {extendedTools && <button type="button" className="lum-direction" onClick={() => setDirection(value => value === 'RIGHT' ? 'DOWN' : 'RIGHT')}
        aria-label={label('Lernrichtung drehen', 'Rotate learning direction')} title={direction === 'RIGHT' ? label('Von links nach rechts · zum Drehen klicken', 'Left to right · click to rotate') : label('Von oben nach unten · zum Drehen klicken', 'Top to bottom · click to rotate')}>
        {direction === 'RIGHT' ? <ArrowRight size={17} /> : <ArrowDown size={17} />}
      </button>}
    </div>}
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
        <div className="lum-map-summary"><h1>{scopeTitle}</h1>
          {headingMode === 'standard' && <span>{visibleIds.length} Bereiche · {activeLayout?.edges.length ?? '…'} Verbindungen</span>}
        </div>
        {fixture.scopeRelations && <details className="lum-requirement-context" data-testid="learning-map-requirement-context">
          <summary>{label('Verbindungen und Voraussetzungen', 'Connections and prerequisites')}{selectedId ? ` · ${contextTitle(selectedId)}` : ''}</summary>
          <div className="lum-requirement-body">
            <p>{label('Pfeile führen von der Vorbereitung zur Anwendung. Gestrichelte Pfeile fassen einzelne Anforderungen zusammen; sie beschreiben Zusammenhänge zwischen Bereichen.', 'Arrows lead from preparation to application. Dashed arrows summarize individual requirements and provide context between sections.')}</p>
            {inspectedContextId ? <>
              <button type="button" onClick={() => { setContextLimit(12); setContextTrail(current => current.slice(0, -1)) }}>{label('Zurück', 'Back')}</button>
              <h2>{label('Vorbereitung von', 'Prerequisites for')} {contextTitle(inspectedContextId)}</h2>
              {explainRequirements(inspectedContext)}
              {!inspectedContext.length && <p>{label('Keine weiteren Voraussetzungen in den verfügbaren Quelldaten.', 'No further prerequisites in the available source data.')}</p>}
            </> : <>
              {selectedRelations.slice(0, contextLimit).map(relation => <div key={`${relation.source}:${relation.target}`}>
                <h2>{contextTitle(relation.source)} → {contextTitle(relation.target)}{relation.kind === 'summary' ? label(' · Zusammenfassung', ' · Summary') : ''}</h2>
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
        </details>}
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
            {showMinimap && <MiniMap pannable zoomable nodeColor="#d5e1ec" nodeStrokeColor="#9db2c4" nodeBorderRadius={2}
              maskColor="rgba(245,247,249,0.75)" ariaLabel="Übersichtskarte" />}
          </ReactFlow>
        </div>
        {layoutError && <div className="lum-layout-error" role="alert" data-testid="learner-map-layout-error"><p>{layoutError}</p>
          <button type="button" onClick={() => { restartLearningScopeLayoutWorker(); setLayoutError(null); setLayoutAttempt(value => value + 1) }}>{label('Erneut versuchen', 'Try again')}</button>
          {onReturnToTree && <button type="button" onClick={onReturnToTree}>{label('Zum Baum wechseln', 'Return to tree')}</button>}
        </div>}
        {!activeLayout && !layoutError && <div className="lum-loading" role="status">{label('Karte wird angeordnet…', 'Arranging map…')}</div>}
        <div className="lum-map-controls" aria-label={label('Kartensteuerung', 'Map controls')} onPointerDownCapture={() => { gestureOnMap.current = false }}>
          <button type="button" onClick={() => void flow.zoomOut({ duration: reducedMotion ? 0 : 150 })} aria-label={label('Karte verkleinern', 'Zoom out')}><Minus size={16} /></button>
          <span aria-label={label('Zoomwert', 'Zoom level')}>{Math.round(nav.zoom * 100)} %</span>
          <button type="button" onClick={() => void flow.zoomIn({ duration: reducedMotion ? 0 : 150 })} aria-label={label('Karte vergrößern', 'Zoom in')}><Plus size={16} /></button>
          <span className="lum-control-divider" />
          <button type="button" onClick={() => void flow.fitView({ padding: 0.16, maxZoom: 1.1, duration: reducedMotion ? 0 : 200 })} aria-label={label('Diese Ebene einpassen', 'Fit this level')} title={label('Gesamte Ebene einpassen', 'Fit entire level')}><Expand size={16} /></button>
        </div>
        <span className="lum-map-hint">{direction === 'RIGHT' ? '→' : '↓'} {label('Vorbereitung zur Anwendung', 'Preparation to application')}<span> · {label('Doppelklick hinein · Shift + Doppelklick heraus', 'Double-click in · Shift + double-click out')}</span></span>
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
        {inspected.children?.length ? <button type="button" className="lum-enter" disabled={nav.isTransitioning}
          onClick={() => open(inspected.id)}>{inspected.kind === 'unit' ? 'Einheit öffnen' : 'Bereich öffnen'} <ArrowUpRight size={16} /></button> : null}
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
    <div className="lum-sr-only" role="status" aria-live="polite">{scopeTitle}, {label('Ebene', 'level')} {nav.path.length}, {visibleIds.length} {label('Bereiche', 'sections')}.</div>
  </MapContainer>
}

export function LearningUnitMap(props: MapProps) {
  return <ReactFlowProvider><MapScene {...props} /></ReactFlowProvider>
}
