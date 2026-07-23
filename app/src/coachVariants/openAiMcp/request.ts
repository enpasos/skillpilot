import { sanitizeSkillpilotId } from '../../utils/skillpilotId'

export interface OpenAiMcpStartInput {
  skillpilotId: string
  language: string
  selectedCurriculum?: string
  client?: string
  launchIntent?: OpenAiMcpLaunchIntent
  providerEligibilityConfirmed: boolean
}

export type OpenAiMcpLaunchIntent =
  | { type: 'CURRENT_UNIT' }
  | { type: 'VERIFIED_RECALL'; goalId: string; batchSize: number }
  | { type: 'ABI26_EXAM'; goalId: string; courseLevel: 'GK' | 'LK' }

export interface OpenAiMcpStartResponse {
  prompt: string
  webUrl: string
  expiresAt: string
  connected: boolean
}

interface OpenAiMcpStatusResponse {
  connected?: unknown
}

interface OpenAiMcpConnectStartResponse {
  chatgptUrl?: unknown
  prompt?: unknown
  expiresAt?: unknown
  connected?: unknown
}

interface OpenAiMcpLaunchResponse {
  prompt?: unknown
  webUrl?: unknown
  expiresAt?: unknown
}

interface OpenAiMcpRequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
}

const DEFAULT_START_PROMPT =
  'Verwende die App SkillPilot Coach (Deutsch) und starte meine aktuelle Lerneinheit.'

const getApiBase = (configured?: string) => {
  const runtimeEnvironment = (import.meta as ImportMeta & {
    env?: { readonly VITE_API_BASE?: string }
  }).env
  return (configured ?? runtimeEnvironment?.VITE_API_BASE ?? '').replace(/\/+$/, '')
}

const getLearnerPath = (skillpilotId: string, action: 'status' | 'connect-start' | 'launch' | 'connection') => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) throw new Error('Missing SkillPilot ID')
  return `/api/ui/learners/${encodeURIComponent(sanitizedId)}/openai/de/${action}`
}

export const buildOpenAiMcpEndpoint = (
  skillpilotId: string,
  action: 'status' | 'connect-start' | 'launch' | 'connection',
  apiBase?: string,
) => `${getApiBase(apiBase)}${getLearnerPath(skillpilotId, action)}`

const readRequiredString = (value: unknown, field: string) => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Invalid OpenAI MCP response: missing ${field}`)
  }
  return value.trim()
}

const readExpiry = (value: unknown) => {
  const expiry = readRequiredString(value, 'expiresAt')
  if (Number.isNaN(Date.parse(expiry))) {
    throw new Error('Invalid OpenAI MCP response: invalid expiresAt')
  }
  return expiry
}

export const getSafeChatGptUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:'
      || url.hostname !== 'chatgpt.com'
      || url.username
      || url.password
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

const requestJson = async <T>(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch,
): Promise<T> => {
  const response = await fetchImpl(url, init)
  if (!response.ok) {
    const message = (await response.text()).trim()
    throw new Error(message || `OpenAI MCP request failed (${response.status})`)
  }
  return await response.json() as T
}

const requestBody = (input: OpenAiMcpStartInput) => JSON.stringify({
  language: 'de',
  client: input.client || 'web',
  selectedCurriculum: input.selectedCurriculum || undefined,
  launchIntent: input.launchIntent,
  providerEligibilityConfirmed: input.providerEligibilityConfirmed,
})

export const requestOpenAiMcpStart = async (
  input: OpenAiMcpStartInput,
  options: OpenAiMcpRequestOptions = {},
): Promise<OpenAiMcpStartResponse> => {
  if (input.language.trim().toLowerCase().startsWith('en')) {
    throw new Error('The OpenAI MCP coach is currently available only for German.')
  }
  if (input.providerEligibilityConfirmed !== true) {
    throw new Error('OpenAI provider eligibility has not been confirmed.')
  }
  const fetchImpl = options.fetchImpl ?? fetch
  const apiBase = getApiBase(options.apiBase)
  const status = await requestJson<OpenAiMcpStatusResponse>(
    buildOpenAiMcpEndpoint(input.skillpilotId, 'status', apiBase),
    { method: 'GET', credentials: 'include' },
    fetchImpl,
  )

  if (status.connected === true) {
    const launch = await requestJson<OpenAiMcpLaunchResponse>(
      buildOpenAiMcpEndpoint(input.skillpilotId, 'launch', apiBase),
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: requestBody(input),
      },
      fetchImpl,
    )
    const webUrl = getSafeChatGptUrl(launch.webUrl)
    if (!webUrl) throw new Error('Invalid OpenAI MCP response: invalid webUrl')
    return {
      prompt: readRequiredString(launch.prompt, 'prompt'),
      webUrl,
      expiresAt: readExpiry(launch.expiresAt),
      connected: true,
    }
  }

  const connection = await requestJson<OpenAiMcpConnectStartResponse>(
    buildOpenAiMcpEndpoint(input.skillpilotId, 'connect-start', apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody(input),
    },
    fetchImpl,
  )
  const webUrl = getSafeChatGptUrl(connection.chatgptUrl)
  if (!webUrl) throw new Error('Invalid OpenAI MCP response: invalid chatgptUrl')
  return {
    prompt: typeof connection.prompt === 'string' && connection.prompt.trim()
      ? connection.prompt.trim()
      : DEFAULT_START_PROMPT,
    webUrl,
    expiresAt: readExpiry(connection.expiresAt),
    connected: connection.connected === true,
  }
}

export const disconnectOpenAiMcp = async (
  skillpilotId: string,
  options: OpenAiMcpRequestOptions = {},
): Promise<void> => {
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(
    buildOpenAiMcpEndpoint(skillpilotId, 'connection', options.apiBase),
    { method: 'DELETE', credentials: 'include' },
  )
  if (!response.ok) {
    const message = (await response.text()).trim()
    throw new Error(message || `OpenAI MCP disconnect failed (${response.status})`)
  }
}
