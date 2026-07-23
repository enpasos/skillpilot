import {
  OPENAI_MCP_ELIGIBILITY_SESSION_KEY,
  OpenAiMcpEligibilityDeclinedError,
  confirmOpenAiMcpEligibility,
  getOpenAiMcpEligibilityConfirmationText,
  isOpenAiMcpEligibilityDeclinedError,
} from './providerEligibility'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`)
}

const runtime = (initialValue: string | null, answer: boolean) => {
  let stored = initialValue
  let confirmCalls = 0
  let confirmedMessage = ''
  let storedKey = ''
  return {
    value: () => stored,
    confirmCalls: () => confirmCalls,
    confirmedMessage: () => confirmedMessage,
    storedKey: () => storedKey,
    runtime: {
      sessionStorage: {
        getItem: () => stored,
        setItem: (key: string, value: string) => {
          storedKey = key
          stored = value
        },
      },
      confirm: (message: string) => {
        confirmCalls += 1
        confirmedMessage = message
        return answer
      },
    },
  }
}

const accepted = runtime(null, true)
assertEqual(confirmOpenAiMcpEligibility('de', 'learner-42', accepted.runtime), true, 'accepts explicit confirmation')
assertEqual(accepted.confirmCalls(), 1, 'asks once before the first launch')
assertEqual(
  accepted.confirmedMessage(),
  getOpenAiMcpEligibilityConfirmationText('de'),
  'uses the complete German eligibility disclosure',
)
assertEqual(accepted.storedKey(), OPENAI_MCP_ELIGIBILITY_SESSION_KEY, 'uses the scoped session key')
assertEqual(accepted.value(), 'learner-42', 'binds confirmation to the current learner profile')

const declined = runtime(null, false)
assertEqual(confirmOpenAiMcpEligibility('en', 'learner-42', declined.runtime), false, 'declines without confirmation')
assertEqual(declined.value(), null, 'does not persist a declined confirmation')

const remembered = runtime('learner-42', false)
assertEqual(confirmOpenAiMcpEligibility('de', 'learner-42', remembered.runtime), true, 'reuses same-profile confirmation')
assertEqual(remembered.confirmCalls(), 0, 'does not ask again in the same browser session')

const switchedProfile = runtime('learner-42', true)
assertEqual(
  confirmOpenAiMcpEligibility('de', 'learner-84', switchedProfile.runtime),
  true,
  'asks again after a learner profile switch',
)
assertEqual(switchedProfile.confirmCalls(), 1, 'does not reuse another learner profile confirmation')
assertEqual(switchedProfile.value(), 'learner-84', 'rebinds a new confirmation to the new learner profile')

assertEqual(confirmOpenAiMcpEligibility('de', 'learner-42', null), false, 'fails closed without a browser runtime')
assertEqual(confirmOpenAiMcpEligibility('de', '', accepted.runtime), false, 'fails closed without a learner profile')

const declinedError = new OpenAiMcpEligibilityDeclinedError('de')
assert(isOpenAiMcpEligibilityDeclinedError(declinedError), 'recognizes the explicit declined outcome')
assert(
  declinedError.message.includes('Cockpit weiter nutzen'),
  'explains that the SkillPilot cockpit remains available',
)
