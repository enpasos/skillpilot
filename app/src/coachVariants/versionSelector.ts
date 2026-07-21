import {
  getVisibleSessionGptBaseUrl,
} from './visibleSession/config'

export type CoachVariantVersion = 'legacy' | 'visible-session'

export interface CoachVariantEnvironment {
  readonly VITE_SKILLPILOT_COACH_VARIANT?: string
}

export type ResolvedCoachVariant =
  | { version: 'legacy' }
  | { version: 'visible-session'; gptBaseUrl: string }
  | { version: 'configuration-error'; requestedVariant: string; message: string }

export const getRequestedCoachVariant = (
  environment: CoachVariantEnvironment,
): CoachVariantVersion | null => {
  const requestedVariant = environment.VITE_SKILLPILOT_COACH_VARIANT?.trim().toLowerCase() ?? ''
  if (!requestedVariant || requestedVariant === 'visible-session') return 'visible-session'
  if (requestedVariant === 'legacy') return 'legacy'
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

  return {
    version: 'visible-session',
    gptBaseUrl: getVisibleSessionGptBaseUrl(language),
  }
}

export const resolveRuntimeCoachVariant = (language?: string): ResolvedCoachVariant =>
  resolveCoachVariant(language, import.meta.env)
