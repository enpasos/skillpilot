import { sanitizeSkillpilotId } from './skillpilotId'

export interface ClaudeCoachStartInput {
  skillpilotId: string
  language: string
  selectedCurriculum?: string
  promptContext?: string
  client?: string
}

export interface ClaudeConnectStartResponse {
  installUrl: string
  expiresAt: string
  connected: boolean
}

export interface ClaudeLaunchResponse {
  prompt: string
  desktopUrl: string
  webUrl: string
  expiresAt: string
}

export interface ClaudeConnectionStatusResponse {
  connected: boolean
}

interface RawClaudeResponse {
  installUrl?: unknown
  prompt?: unknown
  desktopUrl?: unknown
  webUrl?: unknown
  expiresAt?: unknown
  expiry?: unknown
  connected?: unknown
}

const enabledFlagValues = new Set(['1', 'true', 'yes', 'on'])

export const CLAUDE_COACH_BETA_ENABLED = enabledFlagValues.has(
  (import.meta.env.VITE_CLAUDE_BETA_ENABLED ?? '').trim().toLowerCase(),
)

const getApiUrl = (skillpilotId: string, action: 'connect-start' | 'launch') => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }

  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const path = `/api/ui/learners/${encodeURIComponent(sanitizedId)}/claude/${action}`
  return apiBase ? `${apiBase}${path}` : path
}

const getStatusApiUrl = (skillpilotId: string) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const path = `/api/ui/learners/${encodeURIComponent(sanitizedId)}/claude/status`
  return apiBase ? `${apiBase}${path}` : path
}

const getConnectionApiUrl = (skillpilotId: string) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }
  const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/+$/, '')
  const path = `/api/ui/learners/${encodeURIComponent(sanitizedId)}/claude/connection`
  return apiBase ? `${apiBase}${path}` : path
}

const readRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Claude response is missing ${field}`)
  }
  return value.trim()
}

const readExpiry = (response: RawClaudeResponse): string => {
  return readRequiredString(response.expiresAt ?? response.expiry, 'expiresAt')
}

const requestClaudeStart = async (
  action: 'connect-start' | 'launch',
  {
    skillpilotId,
    language,
    selectedCurriculum,
    promptContext,
    client = 'web',
  }: ClaudeCoachStartInput,
): Promise<RawClaudeResponse> => {
  const res = await fetch(getApiUrl(skillpilotId, action), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      client,
      selectedCurriculum: selectedCurriculum || undefined,
      promptContext: promptContext || undefined,
    }),
  })

  if (!res.ok) {
    const message = (await res.text()).trim()
    throw new Error(message || `Failed to prepare Claude (${res.status})`)
  }

  return await res.json() as RawClaudeResponse
}

export const requestClaudeConnectStart = async (
  input: ClaudeCoachStartInput,
): Promise<ClaudeConnectStartResponse> => {
  const response = await requestClaudeStart('connect-start', input)
  return {
    installUrl: readRequiredString(response.installUrl, 'installUrl'),
    expiresAt: readExpiry(response),
    connected: response.connected === true,
  }
}

export const requestClaudeLaunch = async (
  input: ClaudeCoachStartInput,
): Promise<ClaudeLaunchResponse> => {
  const response = await requestClaudeStart('launch', input)
  return {
    prompt: readRequiredString(response.prompt, 'prompt'),
    desktopUrl: readRequiredString(response.desktopUrl, 'desktopUrl'),
    webUrl: readRequiredString(response.webUrl, 'webUrl'),
    expiresAt: readExpiry(response),
  }
}

export const requestClaudeConnectionStatus = async (
  skillpilotId: string,
): Promise<ClaudeConnectionStatusResponse> => {
  const res = await fetch(getStatusApiUrl(skillpilotId), { credentials: 'include' })
  if (!res.ok) {
    const message = (await res.text()).trim()
    throw new Error(message || `Failed to read Claude connection status (${res.status})`)
  }
  const response = await res.json() as { connected?: unknown }
  return { connected: response.connected === true }
}

export const requestClaudeDisconnect = async (
  skillpilotId: string,
): Promise<ClaudeConnectionStatusResponse> => {
  const res = await fetch(getConnectionApiUrl(skillpilotId), {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const message = (await res.text()).trim()
    throw new Error(message || `Failed to disconnect Claude (${res.status})`)
  }
  const response = await res.json() as { connected?: unknown }
  return { connected: response.connected === true }
}

const isClaudeHostname = (hostname: string) => {
  return hostname === 'claude.ai' || hostname.endsWith('.claude.ai')
}

export const getSafeClaudeInstallUrl = (value: string): string | null => {
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:'
      || url.hostname !== 'claude.ai'
      || url.pathname !== '/customize/connectors'
      || url.searchParams.get('modal') !== 'add-custom-connector'
      || !url.searchParams.get('connectorName')?.trim()
    ) {
      return null
    }

    const connectorUrl = new URL(url.searchParams.get('connectorUrl') ?? '')
    if (connectorUrl.protocol !== 'https:') {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export const getSafeClaudeWebUrl = (value: string): string | null => {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || !isClaudeHostname(url.hostname) || url.pathname !== '/new') {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export const getSafeClaudeDesktopUrl = (value: string): string | null => {
  try {
    const url = new URL(value)
    return url.protocol === 'claude:' && url.hostname === 'claude.ai' && url.pathname === '/new'
      ? url.toString()
      : null
  } catch {
    return null
  }
}
