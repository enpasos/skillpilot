import { useEffect, useRef } from 'react'

export function useLearnerUpdates(skillpilotId: string, onUpdate: () => void) {
    const onUpdateRef = useRef(onUpdate)

    useEffect(() => {
        onUpdateRef.current = onUpdate
    }, [onUpdate])

    useEffect(() => {
        if (!skillpilotId) return

        const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
        const url = apiBase ? `${apiBase}/api/ui/updates/${skillpilotId}` : `/api/ui/updates/${skillpilotId}`

        // Using native EventSource
        const eventSource = new EventSource(url)

        eventSource.onopen = () => {
            console.log('[SSE] Connected to updates stream')
        }

        eventSource.onmessage = (event) => {
            // "message" event is the default used by backend
            console.log('[SSE] Update received', event.data)
            if (onUpdateRef.current) {
                onUpdateRef.current()
            }
        }

        eventSource.onerror = (err) => {
            // EventSource automatically reconnects on error
            // We just log it for debugging
            console.warn('[SSE] Connection error/reconnecting', err)
        }

        return () => {
            console.log('[SSE] Closing connection')
            eventSource.close()
        }
    }, [skillpilotId])
}

