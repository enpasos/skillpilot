export const SKILLPILOT_GPT_URL_EN =
  'https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english'

export const SKILLPILOT_GPT_URL_DE =
  'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch'

export const getSkillpilotGptUrl = (language?: string, prompt?: string): string => {
  const normalizedLanguage = (language ?? '').trim().toLowerCase()
  const baseUrl = normalizedLanguage.startsWith('en')
    ? SKILLPILOT_GPT_URL_EN
    : SKILLPILOT_GPT_URL_DE
  const normalizedPrompt = (prompt ?? '').trim()
  if (!normalizedPrompt) {
    return baseUrl
  }
  const url = new URL(baseUrl)
  url.searchParams.set('prompt', normalizedPrompt)
  return url.toString()
}
