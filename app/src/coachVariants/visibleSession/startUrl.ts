import { normalizeVisibleSessionGptBaseUrl } from './config'

export const buildVisibleSessionStartUrl = (baseUrl: string, prompt?: string): string => {
  const normalizedBaseUrl = normalizeVisibleSessionGptBaseUrl(baseUrl)
  if (!normalizedBaseUrl) {
    throw new Error('Visible-session GPT URL is not configured')
  }

  const url = new URL(normalizedBaseUrl)
  const normalizedPrompt = (prompt ?? '').trim()
  if (normalizedPrompt) {
    url.searchParams.set('prompt', normalizedPrompt)
  }
  return url.toString()
}
