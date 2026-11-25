/** Git distribution for the independently installed ChatGPT Desktop beta. */
export const CHATGPT_DESKTOP_MARKETPLACE_URL = 'https://github.com/enpasos/skillpilot-chatgpt-marketplace'
export const CHATGPT_DESKTOP_MINIMUM_PLUGIN_VERSION = '1.2.0'

const CODEX_EXAMPLE = '[@SkillPilot Coach](plugin://skillpilot-coach@skillpilot-chatgpt-marketplace) How do I start a learning session with SkillPilot?'
export const CHATGPT_DESKTOP_LOCAL_CHAT_URL = `codex://threads/new?prompt=${encodeURIComponent(CODEX_EXAMPLE)}`
