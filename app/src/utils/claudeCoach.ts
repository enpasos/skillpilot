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
const CLAUDE_V1_WEB_CHAT_URL = 'https://claude.ai/new'

export const isClaudeV1WebStartRequested = (
  search = typeof window === 'undefined' ? '' : window.location.search,
) => {
  const requestedCoaches = new URLSearchParams(search).getAll('coach')
  return requestedCoaches.length === 1 && requestedCoaches[0] === 'claude'
}

// The submitted ChatGPT root remains unchanged. Only an explicit provider
// selection enables Claude inside the same shared setup flow.
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
    desktopUrl: '',
    webUrl: buildClaudeWebPromptUrl(response.prompt),
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

export const buildClaudeWebPromptUrl = (prompt: string) => {
  if (!prompt.trim()) throw new Error('Missing Claude start prompt')
  return `${CLAUDE_V1_WEB_CHAT_URL}?q=${encodeURIComponent(prompt)}`
}

const hasExactlyOnePromptQuery = (url: URL) => {
  const keys = [...url.searchParams.keys()]
  return keys.length === 1
    && keys[0] === 'q'
    && url.searchParams.getAll('q').length === 1
    && Boolean(url.searchParams.get('q')?.trim())
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
    if (
      url.origin !== 'https://claude.ai'
      || url.pathname !== '/new'
      || url.username
      || url.password
      || url.hash
      || !hasExactlyOnePromptQuery(url)
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export const getSafeClaudeDesktopUrl = (value: string): string | null => {
  void value
  return null
}
