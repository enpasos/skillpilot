import { sanitizeSkillpilotId } from '../../utils/skillpilotId'

export interface GeminiV1StartInput {
  skillpilotId: string
  language: string
}

export interface GeminiV1StartResponse {
  prompt: string
  webUrl: string
  learningSessionId: string
  expiresAt: string
}

interface RequestOptions {
  apiBase?: string
  fetchImpl?: typeof fetch
}

const SESSION_PATTERN = /^spg_[A-Za-z0-9_-]{43}$/u
const PROMPT_SESSION_PATTERN = /(?<![A-Za-z0-9_-])spg_[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/gu
const FOREIGN_SESSION_PATTERN = /(?:spc|sps)_[A-Za-z0-9_-]{43}/u
export const GEMINI_WEB_URL = 'https://gemini.google.com/app?hl=en'
const invalidResponse = () => new Error('Die Gemini-Lernsession konnte nicht sicher vorbereitet werden.')

export function buildGeminiV1StartEndpoint(skillpilotId: string, configuredApiBase?: string) {
  const id = sanitizeSkillpilotId(skillpilotId)
  if (!id) throw new Error('In diesem Browser ist noch kein Lernprofil geladen.')
  const environment = (import.meta as ImportMeta & {
    env?: { readonly VITE_API_BASE?: string }
  }).env
  const apiBase = (configuredApiBase ?? environment?.VITE_API_BASE ?? '').replace(/\/+$/u, '')
  return `${apiBase}/api/ui/learners/${encodeURIComponent(id)}/gemini/v1/launch`
}

/** A session capability is copied into chat; it never becomes a query parameter. */
export function getSafeGeminiWebUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (url.origin !== 'https://gemini.google.com'
      || url.pathname !== '/app'
      || url.username || url.password || url.hash
      || [...url.searchParams.keys()].length !== 1
      || url.searchParams.get('hl') !== 'en') return null
    return GEMINI_WEB_URL
  } catch {
    return null
  }
}

export async function requestGeminiV1Start(
  input: GeminiV1StartInput,
  options: RequestOptions = {},
): Promise<GeminiV1StartResponse> {
  const response = await (options.fetchImpl ?? fetch)(
    buildGeminiV1StartEndpoint(input.skillpilotId, options.apiBase),
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        communicationLocale: input.language.trim().toLowerCase().startsWith('en') ? 'en' : 'de',
        client: 'web-start',
      }),
    },
  )
  if (!response.ok) throw new Error(`Gemini-Start fehlgeschlagen (${response.status}).`)
  let payload: unknown
  try { payload = await response.json() } catch { throw invalidResponse() }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw invalidResponse()
  const record = payload as Record<string, unknown>
  const { prompt, learningSessionId, expiresAt } = record
  if (typeof prompt !== 'string' || !prompt.trim()
    || typeof learningSessionId !== 'string' || !SESSION_PATTERN.test(learningSessionId)
    || typeof expiresAt !== 'string' || !Number.isFinite(Date.parse(expiresAt))) throw invalidResponse()
  const sessions = prompt.match(PROMPT_SESSION_PATTERN) ?? []
  const id = sanitizeSkillpilotId(input.skillpilotId)
  const webUrl = getSafeGeminiWebUrl(record.webUrl)
  if (!webUrl || sessions.length !== 1 || sessions[0] !== learningSessionId
    || FOREIGN_SESSION_PATTERN.test(prompt)
    || (id && prompt.toLowerCase().includes(id.toLowerCase()))) throw invalidResponse()
  return { prompt, webUrl, learningSessionId, expiresAt }
}
