import {
  getVisibleSessionGptBaseUrl,
} from './visibleSession/config'

export type CoachVariantVersion = 'legacy' | 'visible-session' | 'openai-mcp'

export interface CoachVariantEnvironment {
  readonly VITE_SKILLPILOT_COACH_VARIANT?: string
}

export type ResolvedCoachVariant =
  | { version: 'legacy' }
  | { version: 'visible-session'; gptBaseUrl: string }
  | { version: 'openai-mcp'; language: 'de' }
  | { version: 'configuration-error'; requestedVariant: string; message: string }

export const getRequestedCoachVariant = (
  environment: CoachVariantEnvironment,
): CoachVariantVersion | null => {
  const requestedVariant = environment.VITE_SKILLPILOT_COACH_VARIANT?.trim().toLowerCase() ?? ''
  if (!requestedVariant || requestedVariant === 'visible-session') return 'visible-session'
  if (requestedVariant === 'legacy') return 'legacy'
  if (requestedVariant === 'openai-mcp') return 'openai-mcp'
  return null
}

export const resolveCoachVariant = (
  language: string | undefined,
  environment: CoachVariantEnvironment,
): ResolvedCoachVariant => {
  const requestedVariant = getRequestedCoachVariant(environment)
  if (requestedVariant === null) {
    const configuredValue = environment.VITE_SKILLPILOT_COACH_VARIANT?.trim() ?? ''
    return {
      version: 'configuration-error',
      requestedVariant: configuredValue,
      message: `Unknown SkillPilot coach variant: ${configuredValue || '<empty>'}`,
    }
  }
  if (requestedVariant === 'legacy') {
    return { version: 'legacy' }
  }
  if (requestedVariant === 'openai-mcp') {
    if ((language ?? 'de').trim().toLowerCase().startsWith('en')) {
      return {
        version: 'visible-session',
        gptBaseUrl: getVisibleSessionGptBaseUrl(language),
      }
    }
    return { version: 'openai-mcp', language: 'de' }
  }

  return {
    version: 'visible-session',
    gptBaseUrl: getVisibleSessionGptBaseUrl(language),
  }
}

export const resolveRuntimeCoachVariant = (language?: string): ResolvedCoachVariant =>
  resolveCoachVariant(language, import.meta.env)
