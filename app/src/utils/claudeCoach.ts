import { sanitizeSkillpilotId } from './skillpilotId'
import { requestClaudeV1Start } from '../coachVariants/claudeV1/request'

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

const CLAUDE_V1_CONNECTOR_URL = 'https://mcp-claude-v1.skillpilot.com/mcp'
const CLAUDE_V1_READY_STORAGE_KEY = 'skillpilot_claude_v1_setup_opened'

export const isClaudeV1WebStartRequested = (
  search = typeof window === 'undefined' ? '' : window.location.search,
) => {
  const requestedCoaches = new URLSearchParams(search).getAll('coach')
  return requestedCoaches.length === 1 && requestedCoaches[0] === 'claude'
}

// The submitted ChatGPT root remains unchanged. Only the explicit Claude
// alias enables the additional provider choice in the shared setup flow.
export const CLAUDE_COACH_BETA_ENABLED = isClaudeV1WebStartRequested()

const requireSkillpilotId = (skillpilotId: string) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }
  return sanitizedId
}

const buildClaudeConnectorInstallUrl = () => {
  const url = new URL('https://claude.ai/customize/connectors')
  url.searchParams.set('modal', 'add-custom-connector')
  url.searchParams.set('connectorName', 'SkillPilot')
  url.searchParams.set('connectorUrl', CLAUDE_V1_CONNECTOR_URL)
  return url.toString()
}

const markClaudeSetupOpened = (opened: boolean) => {
  if (typeof window === 'undefined') return
  if (opened) {
    window.localStorage.setItem(CLAUDE_V1_READY_STORAGE_KEY, 'true')
  } else {
    window.localStorage.removeItem(CLAUDE_V1_READY_STORAGE_KEY)
  }
}

export const requestClaudeConnectStart = async (
  input: ClaudeCoachStartInput,
): Promise<ClaudeConnectStartResponse> => {
  requireSkillpilotId(input.skillpilotId)
  markClaudeSetupOpened(true)
  return {
    installUrl: buildClaudeConnectorInstallUrl(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    connected: false,
  }
}

export const requestClaudeLaunch = async (
  input: ClaudeCoachStartInput,
): Promise<ClaudeLaunchResponse> => {
  const response = await requestClaudeV1Start({
    skillpilotId: requireSkillpilotId(input.skillpilotId),
    language: input.language,
    client: 'web-start',
  })
  return {
    prompt: response.prompt,
    desktopUrl: 'claude://claude.ai/new',
    webUrl: response.webUrl,
    expiresAt: response.expiresAt,
  }
}

export const requestClaudeConnectionStatus = async (
  skillpilotId: string,
): Promise<ClaudeConnectionStatusResponse> => {
  requireSkillpilotId(skillpilotId)
  return {
    connected: typeof window !== 'undefined'
      && window.localStorage.getItem(CLAUDE_V1_READY_STORAGE_KEY) === 'true',
  }
}

export const requestClaudeDisconnect = async (
  skillpilotId: string,
): Promise<ClaudeConnectionStatusResponse> => {
  requireSkillpilotId(skillpilotId)
  markClaudeSetupOpened(false)
  return { connected: false }
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
