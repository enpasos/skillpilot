export const OPENAI_MCP_ELIGIBILITY_SESSION_KEY = 'skillpilot_openai_mcp_eligibility_confirmed'

export type OpenAiMcpEligibilityLanguage = 'de' | 'en'

export class OpenAiMcpEligibilityDeclinedError extends Error {
  readonly code = 'OPENAI_MCP_ELIGIBILITY_DECLINED'

  constructor(language: OpenAiMcpEligibilityLanguage) {
    super(language === 'en'
      ? 'ChatGPT was not started because the provider eligibility was not confirmed. You can continue using the SkillPilot cockpit.'
      : 'ChatGPT wurde nicht gestartet, weil die Nutzungsvoraussetzungen des Anbieters nicht bestätigt wurden. Du kannst das SkillPilot-Cockpit weiter nutzen.')
    this.name = 'OpenAiMcpEligibilityDeclinedError'
  }
}

export const isOpenAiMcpEligibilityDeclinedError = (
  error: unknown,
): error is OpenAiMcpEligibilityDeclinedError =>
  error instanceof OpenAiMcpEligibilityDeclinedError

export interface OpenAiMcpEligibilityRuntime {
  sessionStorage?: Pick<Storage, 'getItem' | 'setItem'>
  confirm: (message: string) => boolean
}

export const getOpenAiMcpEligibilityConfirmationText = (
  language: OpenAiMcpEligibilityLanguage,
): string => language === 'en'
  ? 'ChatGPT may be used for this SkillPilot start only if you are at least 13 years old and meet every higher minimum age that applies in your country. If you are under 18, you also need permission from a parent or legal guardian. Do you confirm that these requirements are met? If not, you can continue in the SkillPilot cockpit.'
  : 'ChatGPT darf für diesen SkillPilot-Start nur genutzt werden, wenn du mindestens 13 Jahre alt bist und alle höheren Altersanforderungen erfüllst, die in deinem Land gelten. Wenn du unter 18 bist, brauchst du außerdem die Erlaubnis eines Elternteils oder einer erziehungsberechtigten Person. Bestätigst du, dass diese Voraussetzungen erfüllt sind? Andernfalls kannst du das SkillPilot-Cockpit weiter nutzen.'

export const hasConfirmedOpenAiMcpEligibility = (
  skillpilotId: string,
  storage?: Pick<Storage, 'getItem'>,
): boolean => {
  try {
    return !!skillpilotId
      && storage?.getItem(OPENAI_MCP_ELIGIBILITY_SESSION_KEY) === skillpilotId
  } catch {
    return false
  }
}

export const confirmOpenAiMcpEligibility = (
  language: OpenAiMcpEligibilityLanguage,
  skillpilotId: string,
  runtime?: OpenAiMcpEligibilityRuntime | null,
): boolean => {
  const browserRuntime = runtime === null ? undefined : runtime ?? (
    typeof window === 'undefined'
      ? undefined
      : {
          sessionStorage: window.sessionStorage,
          confirm: (message: string) => window.confirm(message),
        }
  )
  if (!browserRuntime) return false
  if (!skillpilotId) return false
  if (hasConfirmedOpenAiMcpEligibility(skillpilotId, browserRuntime.sessionStorage)) return true

  const confirmed = browserRuntime.confirm(getOpenAiMcpEligibilityConfirmationText(language))
  if (!confirmed) return false
  try {
    browserRuntime.sessionStorage?.setItem(OPENAI_MCP_ELIGIBILITY_SESSION_KEY, skillpilotId)
  } catch {
    // A blocked session store must not turn a conscious confirmation into a
    // denial. The backend still requires the explicit confirmation on this
    // individual launch request.
  }
  return true
}
