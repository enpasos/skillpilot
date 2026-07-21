import { sanitizeSkillpilotId } from '../../utils/skillpilotId'

export interface VisibleChatStartResponse {
  chatSessionToken: string
  expiresAt: string
  prompt: string
}

export interface VisibleChatStartInput {
  skillpilotId: string
  language: string
  selectedCurriculum?: string
  promptContext?: string
  client?: string
}

export interface VisibleChatStartRequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
}

const normalizeApiBase = (value?: string): string => (value ?? '').trim().replace(/\/+$/u, '')

const runtimeApiBase = (): string => normalizeApiBase(import.meta.env?.VITE_API_BASE)

export const buildVisibleChatStartEndpoint = (skillpilotId: string, apiBase = ''): string => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }
  const path = `/api/ui/learners/${encodeURIComponent(sanitizedId)}/visible-chat-start`
  const normalizedApiBase = normalizeApiBase(apiBase)
  return normalizedApiBase ? `${normalizedApiBase}${path}` : path
}

const parseVisibleChatStartResponse = (value: unknown): VisibleChatStartResponse => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Invalid visible chat start response')
  }
  const response = value as Record<string, unknown>
  const chatSessionToken = typeof response.chatSessionToken === 'string'
    ? response.chatSessionToken.trim()
    : ''
  const expiresAt = typeof response.expiresAt === 'string' ? response.expiresAt.trim() : ''
  const prompt = typeof response.prompt === 'string' ? response.prompt.trim() : ''
  const tokenOccurrences = chatSessionToken
    ? prompt.split(chatSessionToken).length - 1
    : 0
  if (
    !/^sps_[A-Za-z0-9_-]{43}$/u.test(chatSessionToken)
    || !expiresAt
    || Number.isNaN(Date.parse(expiresAt))
    || !prompt
    || tokenOccurrences !== 1
  ) {
    throw new Error('Invalid visible chat start response')
  }
  return { chatSessionToken, expiresAt, prompt }
}

export const requestVisibleChatStart = async (
  {
    skillpilotId,
    language,
    selectedCurriculum,
    promptContext,
    client = 'web',
  }: VisibleChatStartInput,
  options: VisibleChatStartRequestOptions = {},
): Promise<VisibleChatStartResponse> => {
  const fetchImpl = options.fetchImpl ?? fetch
  const endpoint = buildVisibleChatStartEndpoint(
    skillpilotId,
    options.apiBase === undefined ? runtimeApiBase() : options.apiBase,
  )
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      language,
      client,
      selectedCurriculum: selectedCurriculum || undefined,
      promptContext: promptContext || undefined,
    }),
  })

  if (!response.ok) {
    const message = (await response.text()).trim()
    throw new Error(message || `Failed to create visible SkillPilot chat session (${response.status})`)
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new Error('Invalid visible chat start response')
  }
  return parseVisibleChatStartResponse(body)
}
