import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { getViewportForBounds, useReactFlow, useStoreApi, type OnMove, type Viewport } from '@xyflow/react'
import type { LearningMapFixture } from './types'
import { mapEntryPath, validMapScopePath } from './mapEntryPath'

type Phase = 'idle' | 'leaving' | 'entering'
type Gesture = { direction: number; at: number }

/** Whether a board has more children than a graph shows; such a board is a compact list. */
export function isCompactListScope(fixture: LearningMapFixture, scopeId: string, threshold?: number): boolean {
  return threshold !== undefined && (fixture.entries[scopeId]?.children ?? []).filter(id => fixture.entries[id]).length > threshold
}

/** Camera history belongs to a scope, never to its individual visible nodes. */
export function useMapNavigation(fixture: LearningMapFixture, reducedMotion: boolean,
  layoutScopeKey?: string | null, direction = 'RIGHT', initialScopeId?: string, active = true,
  focusBoundaryRef?: RefObject<HTMLElement | null>, focusSurfaceRef?: RefObject<HTMLElement | null>,
  compactListThreshold?: number, preferList?: (scopeId: string) => boolean) {
  const flow = useReactFlow()
  const store = useStoreApi()
  const [requestedPath, setPath] = useState(() => {
    const requested = initialScopeId ? mapEntryPath(fixture, initialScopeId) : null
    return requested && fixture.entries[requested[requested.length - 1]]?.children?.length ? requested : [fixture.rootId]
  })
  // Validate synchronously: a projection may temporarily omit the current scope.
  // Retain its saved path/cameras so an unchanged scope can return after hydration.
  const path = useMemo(() => validMapScopePath(fixture, requestedPath), [fixture, requestedPath])
  const [phase, setPhase] = useState<Phase>('entering')
  const [zoom, setZoom] = useState(1)
  const [cameraKey, setCameraKey] = useState<string | null>(null)
  const cameras = useRef(new Map<string, Viewport>())
  const initialZooms = useRef(new Map<string, number>())
  const busy = useRef(true)
  const epoch = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const armed = useRef(true)
  const unlockAt = useRef(0)
  const lastGesture = useRef<Gesture>({ direction: 0, at: 0 })
  const restoreMapFocus = useRef(false)
  const scopeId = path[path.length - 1]
  const viewKey = `${scopeId}:${direction}`
  // A scope shown as a compact list has no graph nodes and hence no camera to place.
  const withoutCamera = isCompactListScope(fixture, scopeId, compactListThreshold) || !!preferList?.(scopeId)
  const layoutReady = active && (withoutCamera || layoutScopeKey === undefined || layoutScopeKey === viewKey)

  useEffect(() => {
    const version = ++epoch.current
    if (!layoutReady) {
      busy.current = true
      return
    }
    let innerFrame = 0
    const frame = requestAnimationFrame(() => {
      setPhase('entering')
      innerFrame = requestAnimationFrame(async () => {
        const saved = cameras.current.get(viewKey)
        if (withoutCamera) { /* A fit without nodes would never settle. */ }
        else if (saved) await flow.setViewport(saved, { duration: 0 })
        else {
          const nodes = flow.getNodes()
          const { width, height } = store.getState()
          const narrow = window.matchMedia('(max-width: 760px)').matches
          const overview = getViewportForBounds(flow.getNodesBounds(nodes), width, height, 0, 1.1, 0.2)
          const first = nodes.find(node => fixture.entries[node.id]?.children?.length) ?? nodes[0]
          // Fit complete boards on desktop whenever the layout fits at the existing
          // overview scale. A newly loaded card must not move its neighbours offscreen
          // just because the board now contains one more node.
          if (!narrow && overview.zoom >= 0.35 && nodes.length) {
            await flow.setViewport(overview, { duration: 0 })
          } else if (first) {
            const centerX = first.position.x + (first.width ?? 220) / 2
            const centerY = first.position.y + (first.height ?? 72) / 2
            if (!narrow) {
              await flow.setViewport(direction === 'RIGHT'
                ? { x: 36 - first.position.x, y: height / 2 - centerY, zoom: 1 }
                : { x: width / 2 - centerX, y: 36 - first.position.y, zoom: 1 }, { duration: 0 })
            } else await flow.setCenter(centerX, centerY, { zoom: 1, duration: 0 })
          }
        }
        if (version !== epoch.current) return
        if (!withoutCamera) {
          cameras.current.set(viewKey, flow.getViewport())
          if (!initialZooms.current.has(viewKey)) initialZooms.current.set(viewKey, flow.getZoom())
        }
        setZoom(flow.getZoom())
        setCameraKey(viewKey)
        timer.current = setTimeout(() => {
          if (version !== epoch.current) return
          if (restoreMapFocus.current && active) {
            const focused = document.activeElement
            // A removed map node must not strand keyboard navigation on body.
            // A learner who moved to the original answer/settings keeps focus.
            if (!focused || focused === document.body || !focused.isConnected) {
              focusSurfaceRef?.current?.focus({ preventScroll: true })
            }
          }
          restoreMapFocus.current = false
          busy.current = false
          setPhase('idle')
        }, reducedMotion ? 0 : 150)
      })
    })
    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(innerFrame)
      clearTimeout(timer.current)
    }
  }, [scopeId, viewKey, flow, store, direction, reducedMotion, fixture, layoutReady, active, focusSurfaceRef, withoutCamera])

  const navigate = useCallback((nextPath: string[], towardId?: string) => {
    if (busy.current || nextPath[nextPath.length - 1] === scopeId) return
    restoreMapFocus.current = !!focusBoundaryRef?.current?.contains(document.activeElement)
    if (!withoutCamera) cameras.current.set(viewKey, flow.getViewport())
    busy.current = true
    armed.current = false
    unlockAt.current = performance.now() + 750
    setPhase('leaving')
    if (towardId && !reducedMotion) {
      const node = flow.getNode(towardId)
      if (node) void flow.setCenter(node.position.x + (node.width ?? 220) / 2,
        node.position.y + (node.height ?? 72) / 2, {
        zoom: Math.min(2.5, flow.getZoom() * 1.3), duration: 160,
      })
    }
    timer.current = setTimeout(() => {
      setPhase('entering')
      setPath(nextPath)
    }, reducedMotion ? 0 : 170)
  }, [flow, reducedMotion, scopeId, viewKey, focusBoundaryRef, withoutCamera])

  const enter = useCallback((id: string) => {
    const entry = fixture.entries[id]
    if (!entry?.children?.length
      || !fixture.entries[scopeId]?.children?.includes(id)) return
    navigate([...path, id], id)
  }, [fixture, navigate, path, scopeId])

  const goToDepth = useCallback((depth: number) => {
    if (depth >= 0 && depth < path.length - 1) navigate(path.slice(0, depth + 1))
  }, [navigate, path])

  const goUp = useCallback(() => goToDepth(path.length - 2), [goToDepth, path.length])

  const goToScope = useCallback((id: string) => {
    const targetPath = mapEntryPath(fixture, id)
    if (targetPath && fixture.entries[id]?.children?.length) navigate(targetPath)
  }, [fixture, navigate])

  const recordGesture = useCallback((direction: number) => {
    const now = performance.now()
    // A new gesture after a quiet gap is required after every semantic transition.
    // Momentum from one wheel/pinch gesture can therefore never cascade down levels.
    if (now - lastGesture.current.at > 220 && now >= unlockAt.current) armed.current = true
    lastGesture.current = { direction, at: now }
  }, [])

  const onMove: OnMove = useCallback((_event, viewport) => {
    if (!active) return
    setZoom(viewport.zoom)
    if (!busy.current) cameras.current.set(viewKey, viewport)
  }, [active, viewKey])

  const considerSemanticZoom = useCallback((viewport: Viewport, targetId: string | null) => {
    const gesture = lastGesture.current
    if (busy.current || !armed.current || performance.now() < unlockAt.current
      || performance.now() - gesture.at > 240) return
    const base = initialZooms.current.get(viewKey) ?? 1
    if (gesture.direction > 0 && viewport.zoom >= Math.max(1.5, base * 1.65) && targetId) {
      const target = fixture.entries[targetId]
      if (target?.children?.length) enter(targetId)
    } else if (gesture.direction < 0 && path.length > 1 && viewport.zoom <= Math.max(0.18, base * 0.52)) {
      goUp()
    }
  }, [enter, fixture, goUp, path.length, viewKey])

  return { path, scopeId, phase, zoom, enter, goUp, goToDepth, goToScope, recordGesture,
    onMove, considerSemanticZoom, isTransitioning: phase !== 'idle' || !layoutReady || cameraKey !== viewKey }
}
