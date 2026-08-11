import { sanitizeSkillpilotId } from '../../utils/skillpilotId'

export interface OpenAiMcpStartInput {
  skillpilotId: string
  language: string
  selectedCurriculum?: string
  client?: string
  launchIntent?: OpenAiMcpLaunchIntent
  providerEligibilityConfirmed: boolean
  /** Gated first-party live-test override for this launch only. */
  diagnosticSessionTtlSeconds?: number
}

export type OpenAiMcpLaunchIntent =
  | { type: 'CURRENT_UNIT' }
  | { type: 'VERIFIED_RECALL'; goalId: string; batchSize: number }
  | { type: 'ABI26_EXAM'; goalId: string; courseLevel: 'GK' | 'LK' }

export interface OpenAiMcpStartResponse {
  prompt: string
  webUrl: string
  learningSessionId: string
  expiresAt: string
  connected: boolean
}

interface OpenAiMcpLaunchResponse {
  prompt?: unknown
  webUrl?: unknown
  learningSessionId?: unknown
  expiresAt?: unknown
}

interface OpenAiMcpRequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
}

const LEARNING_SESSION_PATTERN = /^sps_[A-Za-z0-9_-]{43}$/
const LEARNING_SESSION_IN_PROMPT_PATTERN = /sps_[A-Za-z0-9_-]{43}/g

const getApiBase = (configured?: string) => {
  const runtimeEnvironment = (import.meta as ImportMeta & {
    env?: { readonly VITE_API_BASE?: string }
  }).env
  return (configured ?? runtimeEnvironment?.VITE_API_BASE ?? '').replace(/\/+$/, '')
}

const getLearnerPath = (skillpilotId: string, action: 'launch') => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) throw new Error('Missing SkillPilot ID')
  return `/api/ui/learners/${encodeURIComponent(sanitizedId)}/openai/v1/${action}`
}

export const buildOpenAiMcpEndpoint = (
  skillpilotId: string,
  action: 'launch',
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

const readLearningSession = (value: unknown, prompt: string) => {
  const learningSessionId = readRequiredString(value, 'learningSessionId')
  if (!LEARNING_SESSION_PATTERN.test(learningSessionId)) {
    throw new Error('Invalid OpenAI MCP response: invalid learningSessionId')
  }
  const promptSessions = prompt.match(LEARNING_SESSION_IN_PROMPT_PATTERN) ?? []
  if (promptSessions.length !== 1 || promptSessions[0] !== learningSessionId) {
    throw new Error('Invalid OpenAI MCP response: prompt learning session mismatch')
  }
  return learningSessionId
}

export const getSafeChatGptUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (
      url.origin !== 'https://chatgpt.com'
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

export const buildOpenAiMcpStartUrl = (webUrl: unknown, prompt: unknown): string => {
  const safeWebUrl = getSafeChatGptUrl(webUrl)
  if (!safeWebUrl) {
    throw new Error('Invalid ChatGPT start URL')
  }
  if (typeof prompt !== 'string' || !prompt.trim()) {
    throw new Error('Invalid ChatGPT start prompt')
  }

  const url = new URL('https://chatgpt.com/')
  url.searchParams.set('prompt', prompt.trim())
  return url.toString()
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

const normalizeConversationLanguage = (language: string): 'de' | 'en' =>
  language.trim().toLowerCase().startsWith('en') ? 'en' : 'de'

const requestBody = (input: OpenAiMcpStartInput) => JSON.stringify({
  communicationLocale: normalizeConversationLanguage(input.language),
  client: input.client || 'web',
  selectedCurriculum: input.selectedCurriculum || undefined,
  launchIntent: input.launchIntent,
  providerEligibilityConfirmed: input.providerEligibilityConfirmed,
  diagnosticSessionTtlSeconds: input.diagnosticSessionTtlSeconds,
})

const requestLaunch = async (
  input: OpenAiMcpStartInput,
  apiBase: string,
  fetchImpl: typeof fetch,
): Promise<OpenAiMcpStartResponse> => {
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
  const prompt = readRequiredString(launch.prompt, 'prompt')
  return {
    prompt,
    webUrl,
    learningSessionId: readLearningSession(launch.learningSessionId, prompt),
    expiresAt: readExpiry(launch.expiresAt),
    connected: true,
  }
}

export const requestOpenAiMcpStart = async (
  input: OpenAiMcpStartInput,
  options: OpenAiMcpRequestOptions = {},
): Promise<OpenAiMcpStartResponse> => {
  if (input.providerEligibilityConfirmed !== true) {
    throw new Error('OpenAI provider eligibility has not been confirmed.')
  }
  const fetchImpl = options.fetchImpl ?? fetch
  const apiBase = getApiBase(options.apiBase)
  return await requestLaunch(input, apiBase, fetchImpl)
}
