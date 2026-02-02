import { useEffect, useRef } from 'react'

type SsePayload = {
    type?: string
    timestamp?: number
    nodeId?: string
}

export function useLearnerUpdates(skillpilotId: string, onUpdate: (payload?: SsePayload) => void) {
    const onUpdateRef = useRef(onUpdate)
    const eventSourceRef = useRef<EventSource | null>(null)
    const retryTimeoutRef = useRef<number | null>(null)
    const retryDelayRef = useRef<number>(1000)
    const lastEventRef = useRef<number>(0)

    useEffect(() => {
        onUpdateRef.current = onUpdate
    }, [onUpdate])

    useEffect(() => {
        if (!skillpilotId) {
            console.log('[SSE] No skillpilotId, skipping connection')
            return
        }

        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/updates/${skillpilotId}` : `/api/ui/updates/${skillpilotId}`

        console.log('[SSE] Attempting to connect to:', url)

        const triggerUpdate = (payload?: SsePayload) => {
            lastEventRef.current = Date.now()
            onUpdateRef.current?.(payload)
        }

        const clearRetry = () => {
            if (retryTimeoutRef.current !== null) {
                window.clearTimeout(retryTimeoutRef.current)
                retryTimeoutRef.current = null
            }
        }

        const handleEvent = (raw: string) => {
            console.log('[SSE] 📩 Received event:', raw)
            let payload: SsePayload | undefined
            try {
                payload = JSON.parse(raw) as SsePayload
            } catch {
                payload = undefined
            }
            triggerUpdate(payload)
        }

        const connect = () => {
            clearRetry()
            const eventSource = new EventSource(url)
            eventSourceRef.current = eventSource

            eventSource.onopen = () => {
                console.log('[SSE] ✅ Connection OPENED, readyState:', eventSource.readyState)
                retryDelayRef.current = 1000
                lastEventRef.current = Date.now()
            }

            eventSource.addEventListener('connected', (event) => {
                console.log('[SSE] 🔗 Received "connected" event:', event.data)
                triggerUpdate()
            })

            eventSource.addEventListener('heartbeat', (event) => {
                console.log('[SSE] 💓 Heartbeat', event.data)
                lastEventRef.current = Date.now()
            })

            eventSource.onmessage = (event) => {
                handleEvent(event.data)
            }

            eventSource.addEventListener('client-state', (event) => {
                handleEvent((event as MessageEvent).data)
            })

            eventSource.onerror = (err) => {
                console.warn('[SSE] ❌ Connection error, readyState:', eventSource.readyState, err)
                eventSource.close()
                eventSourceRef.current = null
                const delay = retryDelayRef.current
                retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000)
                retryTimeoutRef.current = window.setTimeout(connect, delay)
            }
        }

        connect()

        const watchdogId = window.setInterval(() => {
            const ageMs = Date.now() - lastEventRef.current
            if (ageMs > 60000) {
                console.warn('[SSE] ⚠️ No heartbeat for', ageMs, 'ms; reconnecting')
                eventSourceRef.current?.close()
                eventSourceRef.current = null
                connect()
            }
        }, 30000)

        const handleVisibility = () => {
            if (document.visibilityState === 'visible') {
                console.log('[SSE] 👀 Tab visible; forcing refresh')
                triggerUpdate()
            }
        }
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            console.log('[SSE] 🔌 Closing connection')
            eventSourceRef.current?.close()
            eventSourceRef.current = null
            clearRetry()
            window.clearInterval(watchdogId)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [skillpilotId])
}
