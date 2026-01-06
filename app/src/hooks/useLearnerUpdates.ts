import { useEffect, useRef } from 'react'

export function useLearnerUpdates(skillpilotId: string, onUpdate: () => void) {
    const onUpdateRef = useRef(onUpdate)

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

        // Using native EventSource
        const eventSource = new EventSource(url)

        eventSource.onopen = () => {
            console.log('[SSE] ✅ Connection OPENED, readyState:', eventSource.readyState)
        }

        // Listen for the custom "connected" event from backend
        eventSource.addEventListener('connected', (event) => {
            console.log('[SSE] 🔗 Received "connected" event:', event.data)
        })

        // Listen for the custom "message" event (named event, not default)
        eventSource.addEventListener('message', (event) => {
            console.log('[SSE] 📨 Received "message" event:', event.data)
            if (onUpdateRef.current) {
                console.log('[SSE] 🔄 Triggering onUpdate callback')
                onUpdateRef.current()
            }
        })

        // Default onmessage handler (for unnamed events)
        eventSource.onmessage = (event) => {
            console.log('[SSE] 📩 Received default message event:', event.data)
            if (onUpdateRef.current) {
                onUpdateRef.current()
            }
        }

        eventSource.onerror = (err) => {
            console.warn('[SSE] ❌ Connection error, readyState:', eventSource.readyState, err)
            // EventSource automatically reconnects on error
        }

        return () => {
            console.log('[SSE] 🔌 Closing connection')
            eventSource.close()
        }
    }, [skillpilotId])
}

