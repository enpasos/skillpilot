import {
  buildOpenAiMcpEndpoint,
  buildOpenAiMcpStartUrl,
  getSafeChatGptUrl,
  requestOpenAiMcpStart,
} from './request'
import { deliverCoachChatStart, type CoachChatStart } from '../coachLaunch'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const assertEqual = <T>(actual: T, expected: T, message: string) => {
  assert(Object.is(actual, expected), `${message}: expected ${String(expected)}, got ${String(actual)}`)
}

const assertRejects = async (operation: () => Promise<unknown>, expectedMessage: string) => {
  try {
    await operation()
  } catch (error) {
    assert(error instanceof Error, 'rejection must be an Error')
    assertEqual(error.message, expectedMessage, 'rejection message')
    return
  }
  throw new Error(`expected rejection: ${expectedMessage}`)
}

const assertThrows = (operation: () => unknown, expectedMessage: string) => {
  try {
    operation()
  } catch (error) {
    assert(error instanceof Error, 'exception must be an Error')
    assertEqual(error.message, expectedMessage, 'exception message')
    return
  }
  throw new Error(`expected exception: ${expectedMessage}`)
}

const LEARNING_SESSION_A = `sps_${'A'.repeat(43)}`
const LEARNING_SESSION_B = `sps_${'B'.repeat(43)}`
const promptWithSession = (message: string, learningSessionId = LEARNING_SESSION_A) =>
  `${message}\nlearningSessionId: ${learningSessionId}`

const compactCurrentUnitPrompt = promptWithSession(
  'Verwende SkillPilot Coach v1 und fahre fort.',
)

assertEqual(
  buildOpenAiMcpEndpoint(' learner / 42 ', 'launch', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner%2F42/openai/v1/launch',
  'builds the single launch endpoint',
)
assertEqual(getSafeChatGptUrl('https://chatgpt.com/'), 'https://chatgpt.com/', 'accepts ChatGPT')
assertEqual(getSafeChatGptUrl('https://chatgpt.example.test/'), null, 'rejects lookalike host')

const parameterizedStartUrl = new URL(buildOpenAiMcpStartUrl(
  'https://chatgpt.com/c/example?token=must-not-leak&prompt=stale#learner-id',
  `  ${compactCurrentUnitPrompt}  `,
))
assertEqual(parameterizedStartUrl.origin, 'https://chatgpt.com', 'keeps provider origin')
assertEqual(parameterizedStartUrl.pathname, '/', 'opens a new normal chat')
assertEqual(parameterizedStartUrl.searchParams.has('token'), false, 'drops configured query parameters')
assertEqual(parameterizedStartUrl.searchParams.getAll('prompt').length, 1, 'sets one prompt')
assertEqual(
  parameterizedStartUrl.searchParams.get('prompt'),
  compactCurrentUnitPrompt,
  'round-trips the compact two-line prompt',
)
assertEqual(parameterizedStartUrl.hash, '', 'drops fragment')
assertThrows(
  () => buildOpenAiMcpStartUrl('https://chatgpt.example.test/', 'Start'),
  'Invalid ChatGPT start URL',
)
assertThrows(
  () => buildOpenAiMcpStartUrl('https://chatgpt.com/', '   '),
  'Invalid ChatGPT start prompt',
)

const launchCalls: Array<{ url: string; init: RequestInit | undefined }> = []
const launch = await requestOpenAiMcpStart({
  skillpilotId: 'learner-42',
  language: 'de-DE',
  providerEligibilityConfirmed: true,
  selectedCurriculum: 'math',
  client: 'test',
  launchIntent: {
    type: 'VERIFIED_RECALL',
    goalId: 'memory-goal-42',
    batchSize: 7,
  },
}, {
  apiBase: 'https://api.example.test/',
  fetchImpl: async (input, init) => {
    launchCalls.push({ url: String(input), init })
    return new Response(JSON.stringify({
      prompt: promptWithSession(
        'Verwende SkillPilot Coach v1 und starte eine harte Kartenprüfung mit 7 Karten.',
      ),
      webUrl: 'https://chatgpt.com/',
      learningSessionId: LEARNING_SESSION_A,
      expiresAt: '2026-07-22T20:00:00Z',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
})

assertEqual(launch.connected, true, 'launch is independent from learner-bound OAuth status')
assertEqual(launch.learningSessionId, LEARNING_SESSION_A, 'returns newly issued learning session')
assertEqual(
  launch.prompt,
  promptWithSession(
    'Verwende SkillPilot Coach v1 und starte eine harte Kartenprüfung mit 7 Karten.',
  ),
  'accepts the compact launch prompt',
)
assertEqual(launchCalls.length, 1, 'performs exactly one HTTP request')
assert(launchCalls[0]?.url.endsWith('/launch'), 'calls only the launch endpoint')
assertEqual(launchCalls[0]?.init?.method, 'POST', 'launch uses POST')
assertEqual(launchCalls[0]?.init?.credentials, 'include', 'preserves browser learner context')
assertEqual(
  launchCalls[0]?.init?.body,
  JSON.stringify({
    communicationLocale: 'de',
    client: 'test',
    selectedCurriculum: 'math',
    launchIntent: {
      type: 'VERIFIED_RECALL',
      goalId: 'memory-goal-42',
      batchSize: 7,
    },
    providerEligibilityConfirmed: true,
  }),
  'transmits only the typed launch request',
)
assert(!String(launchCalls[0]?.init?.body).includes('promptContext'), 'does not transmit free-form context')

const diagnosticLaunchCalls: Array<{ url: string; init: RequestInit | undefined }> = []
await requestOpenAiMcpStart({
  skillpilotId: 'learner-42',
  language: 'de',
  providerEligibilityConfirmed: true,
  diagnosticSessionTtlSeconds: 5_400,
}, {
  fetchImpl: async (input, init) => {
    diagnosticLaunchCalls.push({ url: String(input), init })
    return new Response(JSON.stringify({
      prompt: compactCurrentUnitPrompt,
      webUrl: 'https://chatgpt.com/',
      learningSessionId: LEARNING_SESSION_A,
      expiresAt: '2026-07-22T20:00:00Z',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  },
})
assertEqual(diagnosticLaunchCalls.length, 1, 'performs one diagnostic launch request')
assertEqual(
  JSON.parse(String(diagnosticLaunchCalls[0]?.init?.body)).diagnosticSessionTtlSeconds,
  5_400,
  'transmits the one-request diagnostic session TTL',
)

const chatStart: CoachChatStart = {
  variant: 'openai-mcp',
  language: 'de',
  prompt: launch.prompt,
  webUrl: launch.webUrl,
  learningSessionId: launch.learningSessionId,
  expiresAt: launch.expiresAt,
  connected: true,
}
let navigatedTo = ''
const delivered = await deliverCoachChatStart(chatStart, (url) => { navigatedTo = url })
assertEqual(new URL(navigatedTo).searchParams.get('prompt'), launch.prompt, 'hands prompt to ChatGPT URL')
assertEqual(delivered.copied, false, 'does not use clipboard handoff')
assertEqual(delivered.promptFallback, null, 'does not require copy-and-paste fallback')

const englishLaunchCalls: Array<{ url: string; init: RequestInit | undefined }> = []
await requestOpenAiMcpStart({
  skillpilotId: 'learner-42',
  language: 'en-GB',
  providerEligibilityConfirmed: true,
}, {
  fetchImpl: async (input, init) => {
    englishLaunchCalls.push({ url: String(input), init })
    return new Response(JSON.stringify({
      prompt: promptWithSession('Use SkillPilot Coach v1 and continue.'),
      webUrl: 'https://chatgpt.com/',
      learningSessionId: LEARNING_SESSION_A,
      expiresAt: '2026-07-22T20:00:00Z',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  },
})
assertEqual(
  JSON.parse(String(englishLaunchCalls[0]?.init?.body)).communicationLocale,
  'en',
  'transmits the normalized English conversation language',
)
await assertRejects(
  () => requestOpenAiMcpStart({
    skillpilotId: 'learner-42',
    language: 'de',
    providerEligibilityConfirmed: false,
  }),
  'OpenAI provider eligibility has not been confirmed.',
)
await assertRejects(
  () => requestOpenAiMcpStart({
    skillpilotId: 'learner-42',
    language: 'de',
    providerEligibilityConfirmed: true,
  }, {
    fetchImpl: async () => new Response(JSON.stringify({
      prompt: promptWithSession('Start.', LEARNING_SESSION_A),
      webUrl: 'https://attacker.example/',
      learningSessionId: LEARNING_SESSION_A,
      expiresAt: '2026-07-22T20:00:00Z',
    }), { status: 200 }),
  }),
  'Invalid OpenAI MCP response: invalid webUrl',
)
await assertRejects(
  () => requestOpenAiMcpStart({
    skillpilotId: 'learner-42',
    language: 'de',
    providerEligibilityConfirmed: true,
  }, {
    fetchImpl: async () => new Response(JSON.stringify({
      prompt: promptWithSession('Start.', LEARNING_SESSION_A),
      webUrl: 'https://chatgpt.com/',
      learningSessionId: LEARNING_SESSION_B,
      expiresAt: '2026-07-22T20:00:00Z',
    }), { status: 200 }),
  }),
  'Invalid OpenAI MCP response: prompt learning session mismatch',
)
await assertRejects(
  () => requestOpenAiMcpStart({
    skillpilotId: 'learner-42',
    language: 'de',
    providerEligibilityConfirmed: true,
  }, {
    fetchImpl: async () => new Response(JSON.stringify({
      prompt: `${promptWithSession('Verwende SkillPilot Coach v1 und fahre fort.', LEARNING_SESSION_A)}\n${LEARNING_SESSION_A}`,
      webUrl: 'https://chatgpt.com/',
      learningSessionId: LEARNING_SESSION_A,
      expiresAt: '2026-07-22T20:00:00Z',
    }), { status: 200 }),
  }),
  'Invalid OpenAI MCP response: prompt learning session mismatch',
)

console.log('OpenAI MCP coach variant tests passed')
