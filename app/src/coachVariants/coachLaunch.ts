import {
  requestChatStart as requestLegacyChatStart,
  type ChatStartInput as LegacyChatStartInput,
  type ChatStartResponse as LegacyChatStartResponse,
} from '../utils/chatStart'
import { getSkillpilotGptUrl as getLegacySkillpilotGptUrl } from '../utils/skillpilotGpt'
import { requestVisibleChatStart, type VisibleChatStartResponse } from './visibleSession/request'
import { buildVisibleSessionStartUrl } from './visibleSession/startUrl'
import { getVisibleSessionLaunchCopy, type VisibleSessionLaunchCopy } from './visibleSession/copy'
import { resolveRuntimeCoachVariant } from './versionSelector'

export type CoachChatStartInput = LegacyChatStartInput

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
    : getLegacySkillpilotGptUrl(chatStart.language, chatStart.prompt)

export const getActiveVisibleSessionLaunchCopy = (language?: string): VisibleSessionLaunchCopy | null => {
  const variant = resolveRuntimeCoachVariant(language)
  return variant.version === 'visible-session'
    || (variant.version === 'configuration-error' && variant.requestedVariant === 'visible-session')
    ? getVisibleSessionLaunchCopy(language)
    : null
}
