import {
  requestChatStart as requestLegacyChatStart,
  type ChatStartInput as LegacyChatStartInput,
  type ChatStartResponse as LegacyChatStartResponse,
} from '../utils/chatStart'
import { getSkillpilotGptUrl as getLegacySkillpilotGptUrl } from '../utils/skillpilotGpt'
import { requestVisibleChatStart, type VisibleChatStartResponse } from './visibleSession/request'
import { buildVisibleSessionStartUrl } from './visibleSession/startUrl'
import { getVisibleSessionLaunchCopy, type VisibleSessionLaunchCopy } from './visibleSession/copy'
import {
  requestOpenAiMcpStart,
  type OpenAiMcpLaunchIntent,
} from './openAiMcp/request'
import {
  confirmOpenAiMcpEligibility,
  OpenAiMcpEligibilityDeclinedError,
} from './openAiMcp/providerEligibility'
import { resolveRuntimeCoachVariant } from './versionSelector'

export type CoachChatStartInput = LegacyChatStartInput & {
  launchIntent?: OpenAiMcpLaunchIntent
  /** Test/host override. Browser starts otherwise ask once per tab session. */
  providerEligibilityConfirmed?: boolean
}

export type CoachChatStart =
  | (LegacyChatStartResponse & {
      variant: 'legacy'
      language: string
    })
  | (VisibleChatStartResponse & {
      variant: 'visible-session'
      language: string
      gptBaseUrl: string
    })
  | {
      variant: 'openai-mcp'
      language: 'de'
      prompt: string
      webUrl: string
      expiresAt: string
      connected: boolean
    }

export const requestCoachChatStart = async (input: CoachChatStartInput): Promise<CoachChatStart> => {
  const variant = resolveRuntimeCoachVariant(input.language)
  if (variant.version === 'configuration-error') {
    throw new Error(variant.message)
  }
  if (variant.version === 'visible-session') {
    const response = await requestVisibleChatStart(input)
    return {
      ...response,
      variant: 'visible-session',
      language: input.language,
      gptBaseUrl: variant.gptBaseUrl,
    }
  }
  if (variant.version === 'openai-mcp') {
    const providerEligibilityConfirmed = input.providerEligibilityConfirmed === true
      || confirmOpenAiMcpEligibility(
        input.language.trim().toLowerCase().startsWith('en') ? 'en' : 'de',
        input.skillpilotId,
    )
    if (!providerEligibilityConfirmed) {
      throw new OpenAiMcpEligibilityDeclinedError(
        input.language.trim().toLowerCase().startsWith('en') ? 'en' : 'de',
      )
    }
    const response = await requestOpenAiMcpStart({
      ...input,
      providerEligibilityConfirmed: true,
    })
    return {
      ...response,
      variant: 'openai-mcp',
      language: 'de',
    }
  }

  const response = await requestLegacyChatStart(input)
  return {
    ...response,
    variant: 'legacy',
    language: input.language,
  }
}

export const buildCoachChatStartUrl = (chatStart: CoachChatStart): string =>
  chatStart.variant === 'visible-session'
    ? buildVisibleSessionStartUrl(chatStart.gptBaseUrl, chatStart.prompt)
    : chatStart.variant === 'openai-mcp'
      ? chatStart.webUrl
      : getLegacySkillpilotGptUrl(chatStart.language, chatStart.prompt)

export const coachStartNeedsPromptPaste = (
  chatStart: CoachChatStart,
): chatStart is Extract<CoachChatStart, { variant: 'openai-mcp' }> =>
  chatStart.variant === 'openai-mcp'

export interface DeliveredCoachChatStart {
  promptFallback: string | null
  copied: boolean
}

/**
 * Navigates to the provider before attempting the optional clipboard handoff.
 * Clipboard access is a browser convenience and must never turn a successful
 * provider launch into a failed launch.
 */
export const deliverCoachChatStart = async (
  chatStart: CoachChatStart,
  navigate: (url: string) => void,
  copyText?: (prompt: string) => Promise<void>,
): Promise<DeliveredCoachChatStart> => {
  navigate(buildCoachChatStartUrl(chatStart))
  if (!coachStartNeedsPromptPaste(chatStart)) {
    return { promptFallback: null, copied: false }
  }

  if (!copyText) {
    return { promptFallback: chatStart.prompt, copied: false }
  }

  try {
    await copyText(chatStart.prompt)
    return { promptFallback: chatStart.prompt, copied: true }
  } catch {
    return { promptFallback: chatStart.prompt, copied: false }
  }
}

export const isOpenAiMcpCoachActive = (language?: string): boolean =>
  resolveRuntimeCoachVariant(language).version === 'openai-mcp'

export const getActiveVisibleSessionLaunchCopy = (language?: string): VisibleSessionLaunchCopy | null => {
  const variant = resolveRuntimeCoachVariant(language)
  return variant.version === 'visible-session'
    || (variant.version === 'configuration-error' && variant.requestedVariant === 'visible-session')
    ? getVisibleSessionLaunchCopy(language)
    : null
}
