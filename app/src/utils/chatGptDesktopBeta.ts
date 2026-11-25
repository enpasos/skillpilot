/** Git distribution for the independently installed ChatGPT Desktop beta. */
export const CHATGPT_DESKTOP_MARKETPLACE_URL = 'https://github.com/enpasos/skillpilot-chatgpt-marketplace'
export const CHATGPT_DESKTOP_MINIMUM_PLUGIN_VERSION = '1.2.1'
/** The first-party installation guide for the desktop plugin. */
export const CHATGPT_DESKTOP_SETUP_GUIDE_PATH = '/plugins#chatgpt-desktop'

/** Selects the coach from the Git marketplace in the draft of the new chat. */
const CODEX_PLUGIN_MENTION = '[@SkillPilot Coach](plugin://skillpilot-coach@skillpilot-chatgpt-marketplace)'

/**
 * App link that opens a new local Codex chat in ChatGPT Desktop. The draft
 * holds the coach mention and the start message, passed as the link's
 * `prompt` argument. The message carries the short-lived learning session
 * and never the permanent SkillPilot ID.
 */
export const buildChatGptDesktopLocalChatUrl = (startMessage: string): string => {
  const message = startMessage.trim()
  if (!message) throw new Error('Missing ChatGPT start message')
  return `codex://threads/new?prompt=${encodeURIComponent(`${CODEX_PLUGIN_MENTION} ${message}`)}`
}
