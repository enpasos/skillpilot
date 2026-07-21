export type VisibleSessionLanguage = 'de' | 'en'

// The existing DE/EN GPTs are reconfigured in place. Their stable URLs therefore
// belong to this isolated variant as source constants, not to deployment config.
export const VISIBLE_SESSION_GPT_URL_EN =
  'https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english'

export const VISIBLE_SESSION_GPT_URL_DE =
  'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch'

export const normalizeVisibleSessionLanguage = (language?: string): VisibleSessionLanguage =>
  (language ?? '').trim().toLowerCase().startsWith('en') ? 'en' : 'de'

export const normalizeVisibleSessionGptBaseUrl = (value?: string): string | null => {
  const candidate = (value ?? '').trim()
  if (!candidate) return null

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' || url.hostname !== 'chatgpt.com' || !url.pathname.startsWith('/g/')) {
      return null
    }
    url.hash = ''
    return url.toString()
  } catch {
    return null
  }
}

export const getVisibleSessionGptBaseUrl = (
  language: string | undefined,
): string => normalizeVisibleSessionLanguage(language) === 'en'
  ? VISIBLE_SESSION_GPT_URL_EN
  : VISIBLE_SESSION_GPT_URL_DE
