import { sanitizeSkillpilotId } from './skillpilotId'
import { requestClaudeV1Start } from '../coachVariants/claudeV1/request'
import type { CompletionAssessmentStart } from './levelCompletionApi'

export interface ClaudeCoachStartInput {
  skillpilotId: string
  language: string
  selectedCurriculum?: string
  promptContext?: string
  client?: string
  completionAssessment?: CompletionAssessmentStart
}

export interface ClaudePluginSetupStartResponse {
  setupUrl: string
  expiresAt: string
}

export interface ClaudeLaunchResponse {
  prompt: string
  desktopUrl: string
  webUrl: string
  expiresAt: string
}

const CLAUDE_PLUGIN_SETUP_PATH = '/plugins'
const CLAUDE_V1_WEB_CHAT_URL = 'https://claude.ai/new'

const requireSkillpilotId = (skillpilotId: string) => {
  const sanitizedId = sanitizeSkillpilotId(skillpilotId)
  if (!sanitizedId) {
    throw new Error('Missing SkillPilot ID')
  }
  return sanitizedId
}

export const requestClaudePluginSetupStart = async (
  input: ClaudeCoachStartInput,
): Promise<ClaudePluginSetupStartResponse> => {
  requireSkillpilotId(input.skillpilotId)
  return {
    setupUrl: CLAUDE_PLUGIN_SETUP_PATH,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }
}

export const requestClaudeLaunch = async (
  input: ClaudeCoachStartInput,
): Promise<ClaudeLaunchResponse> => {
  const response = await requestClaudeV1Start({
    skillpilotId: requireSkillpilotId(input.skillpilotId),
    language: input.language,
    client: 'web-start',
    completionAssessment: input.completionAssessment,
  })
  return {
    prompt: response.prompt,
    desktopUrl: '',
    webUrl: buildClaudeWebPromptUrl(response.prompt),
    expiresAt: response.expiresAt,
  }
}

export const buildClaudeWebPromptUrl = (prompt: string) => {
  if (!prompt.trim()) throw new Error('Missing Claude start prompt')
  return `${CLAUDE_V1_WEB_CHAT_URL}?q=${encodeURIComponent(prompt)}`
}

const hasExactlyOnePromptQuery = (url: URL) => {
  const keys = [...url.searchParams.keys()]
  return keys.length === 1
    && keys[0] === 'q'
    && url.searchParams.getAll('q').length === 1
    && Boolean(url.searchParams.get('q')?.trim())
}

export const getSafeClaudePluginSetupUrl = (value: string): string | null => (
  value === CLAUDE_PLUGIN_SETUP_PATH ? value : null
)

export const getSafeClaudeWebUrl = (value: string): string | null => {
  try {
    const url = new URL(value)
    if (
      url.origin !== 'https://claude.ai'
      || url.pathname !== '/new'
      || url.username
      || url.password
      || url.hash
      || !hasExactlyOnePromptQuery(url)
    ) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export const getSafeClaudeDesktopUrl = (value: string): string | null => {
  void value
  return null
}
