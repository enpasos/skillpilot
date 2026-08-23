import { sanitizeSkillpilotId } from '../../utils/skillpilotId'

export interface ClaudeV1StartInput {
  skillpilotId: string
  language: string
  client?: 'web-start'
}

export interface ClaudeV1StartResponse {
  prompt: string
  webUrl: string
  learningSessionId: string
  expiresAt: string
}

interface ClaudeV1LaunchResponse {
  prompt?: unknown
  webUrl?: unknown
  learningSessionId?: unknown
  expiresAt?: unknown
}

interface ClaudeV1RequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
}

const LEARNING_SESSION_PATTERN = /^spc_[A-Za-z0-9_-]{43}$/u
const LEARNING_SESSION_IN_PROMPT_PATTERN = /spc_[A-Za-z0-9_-]{43}/gu
const FOREIGN_SESSION_IN_PROMPT_PATTERN = /sps_[A-Za-z0-9_-]{43}/u
const CLAUDE_NEW_CHAT_URL = 'https://claude.ai/new'

const invalidResponse = () => new Error('Die Claude-Lernsession konnte nicht sicher vorbereitet werden.')

const getApiBase = (configured?: string) => {
  const runtimeEnvironment = (import.meta as ImportMeta & {
    env?: { readonly VITE_API_BASE?: string }
  }).env
  return (configured ?? runtimeEnvironment?.VITE_API_BASE ?? '').replace(/\/+$/u, '')
}

const normalizeConversationLanguage = (language: string): 'de' | 'en' => (
  language.trim().toLowerCase().startsWith('en') ? 'en' : 'de'
)

export const buildClaudeV1StartEndpoint = (skillpilotId: string, apiBase?: string) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) throw new Error('In diesem Browser ist noch kein Lernprofil geladen.')
  return `${getApiBase(apiBase)}/api/ui/learners/${encodeURIComponent(sanitizedId)}/claude/v1/launch`
}

export const getSafeClaudeNewChatUrl = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (
      url.origin !== 'https://claude.ai'
      || url.pathname.replace(/\/+$/u, '') !== '/new'
      || url.username
      || url.password
      || url.search
      || url.hash
    ) {
      return null
    }
    return CLAUDE_NEW_CHAT_URL
  } catch {
    return null
  }
}

const readRequiredString = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) throw invalidResponse()
  return value.trim()
}

const readExpiry = (value: unknown) => {
  const expiry = readRequiredString(value)
  if (Number.isNaN(Date.parse(expiry))) throw invalidResponse()
  return expiry
}

const readLearningSession = (value: unknown, prompt: string) => {
  const learningSessionId = readRequiredString(value)
  if (!LEARNING_SESSION_PATTERN.test(learningSessionId)) throw invalidResponse()

  const promptSessions = prompt.match(LEARNING_SESSION_IN_PROMPT_PATTERN) ?? []
  if (
    promptSessions.length !== 1
    || promptSessions[0] !== learningSessionId
    || FOREIGN_SESSION_IN_PROMPT_PATTERN.test(prompt)
  ) {
    throw invalidResponse()
  }
  return learningSessionId
}

const readLaunchResponse = (
  response: ClaudeV1LaunchResponse,
  permanentSkillpilotId: string,
): ClaudeV1StartResponse => {
  const prompt = readRequiredString(response.prompt)
  const sanitizedId = sanitizeSkillpilotId(permanentSkillpilotId)
  if (
    sanitizedId
    && prompt.toLowerCase().includes(sanitizedId.toLowerCase())
  ) {
    throw invalidResponse()
  }

  const webUrl = getSafeClaudeNewChatUrl(response.webUrl)
  if (!webUrl) throw invalidResponse()

  return {
    prompt,
    webUrl,
    learningSessionId: readLearningSession(response.learningSessionId, prompt),
    expiresAt: readExpiry(response.expiresAt),
  }
}

export const requestClaudeV1Start = async (
  input: ClaudeV1StartInput,
  options: ClaudeV1RequestOptions = {},
): Promise<ClaudeV1StartResponse> => {
  const fetchImpl = options.fetchImpl ?? fetch
  const response = await fetchImpl(
    buildClaudeV1StartEndpoint(input.skillpilotId, options.apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communicationLocale: normalizeConversationLanguage(input.language),
        client: input.client ?? 'web-start',
      }),
    },
  )

  if (!response.ok) {
    throw new Error(`Claude-Start fehlgeschlagen (${response.status}).`)
  }

  let payload: ClaudeV1LaunchResponse
  try {
    payload = await response.json() as ClaudeV1LaunchResponse
  } catch {
    throw invalidResponse()
  }
  return readLaunchResponse(payload, input.skillpilotId)
}
