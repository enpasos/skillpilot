export type CampaignEventName =
  | 'page_view'
  | 'id_created'
  | 'cockpit_opened'
  | 'gpt_prompt_copied'
  | 'gpt_start_clicked'

interface CampaignEventPayload {
  event: CampaignEventName
  occurredAt: string
  path: string
  skillpilotId?: string
  context?: Record<string, unknown>
}

const TRACKING_STORAGE_KEY = 'skillpilot_campaign_events'
const TRACKING_STORAGE_LIMIT = 200
const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')

const toApi = (path: string) => (apiBase ? `${apiBase}${path}` : path)

const saveLocally = (payload: CampaignEventPayload) => {
  try {
    const previousRaw = localStorage.getItem(TRACKING_STORAGE_KEY)
    const previous = previousRaw ? (JSON.parse(previousRaw) as CampaignEventPayload[]) : []
    const next = [...previous.slice(-(TRACKING_STORAGE_LIMIT - 1)), payload]
    localStorage.setItem(TRACKING_STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage issues in private mode.
  }
}

const sendToBackend = (payload: CampaignEventPayload) => {
  const url = toApi('/api/ui/events')
  const body = JSON.stringify(payload)

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      const sent = navigator.sendBeacon(url, blob)
      if (sent) return
    }
  } catch {
    // Fallback to fetch below.
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Ignore tracking network errors.
  })
}

export const trackCampaignEvent = (
  event: CampaignEventName,
  context: Record<string, unknown> = {},
  skillpilotId?: string,
) => {
  const payload: CampaignEventPayload = {
    event,
    occurredAt: new Date().toISOString(),
    path: window.location.pathname,
    skillpilotId: skillpilotId || undefined,
    context,
  }
  saveLocally(payload)
  sendToBackend(payload)
}
