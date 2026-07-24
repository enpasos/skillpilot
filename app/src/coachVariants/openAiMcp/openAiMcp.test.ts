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

assertEqual(
  buildOpenAiMcpEndpoint(' learner / 42 ', 'status', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner%2F42/openai/de/status',
  'builds the provider- and locale-specific status endpoint',
)
assertEqual(
  getSafeChatGptUrl('https://chatgpt.com/'),
  'https://chatgpt.com/',
  'accepts the provider launch origin',
)
assertEqual(
  getSafeChatGptUrl('https://chatgpt.example.test/'),
  null,
  'rejects a lookalike launch host',
)
const parameterizedStartUrl = new URL(buildOpenAiMcpStartUrl(
  'https://chatgpt.com/c/example?token=must-not-leak&prompt=stale#learner-id',
  '  Bitte starte Karten 1 & 2.  ',
))
assertEqual(parameterizedStartUrl.origin, 'https://chatgpt.com', 'keeps the validated provider origin')
assertEqual(parameterizedStartUrl.pathname, '/', 'opens a new normal ChatGPT chat')
assertEqual(parameterizedStartUrl.searchParams.has('token'), false, 'drops configured query parameters')
assertEqual(parameterizedStartUrl.searchParams.getAll('prompt').length, 1, 'replaces a stale prompt parameter')
assertEqual(parameterizedStartUrl.searchParams.get('prompt'), 'Bitte starte Karten 1 & 2.', 'URL-encodes the start prompt')
assertEqual(parameterizedStartUrl.hash, '', 'drops the configured provider URL fragment')
assertThrows(
  () => buildOpenAiMcpStartUrl('https://chatgpt.example.test/', 'Start'),
  'Invalid ChatGPT start URL',
)
assertThrows(
  () => buildOpenAiMcpStartUrl('https://chatgpt.com:444/', 'Start'),
  'Invalid ChatGPT start URL',
)
assertEqual(
  new URL(buildOpenAiMcpStartUrl('https://chatgpt.com//lookalike.example/', 'Start')).hostname,
  'chatgpt.com',
  'does not reinterpret a provider path as a protocol-relative host',
)
assertThrows(
  () => buildOpenAiMcpStartUrl('https://chatgpt.com/', '   '),
  'Invalid ChatGPT start prompt',
)

const disconnectedCalls: Array<{ url: string; init: RequestInit | undefined }> = []
const disconnectedFetch: typeof fetch = async (input, init) => {
  const url = String(input)
  disconnectedCalls.push({ url, init })
  if (url.endsWith('/status')) {
    return new Response(JSON.stringify({ connected: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return new Response(JSON.stringify({
    chatgptUrl: 'https://chatgpt.com/',
    prompt: 'SkillPilot Coach Deutsch verwenden.',
    expiresAt: '2026-07-22T20:00:00Z',
    connected: false,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const disconnected = await requestOpenAiMcpStart({
  skillpilotId: 'learner-42',
  language: 'de',
  providerEligibilityConfirmed: true,
  selectedCurriculum: 'math',
  launchIntent: {
    type: 'VERIFIED_RECALL',
    goalId: 'memory-goal-42',
    batchSize: 7,
  },
  client: 'test',
}, {
  apiBase: 'https://api.example.test/',
  fetchImpl: disconnectedFetch,
})
assertEqual(disconnected.connected, false, 'returns a pending OAuth connection')
assertEqual(disconnected.webUrl, 'https://chatgpt.com/', 'uses the validated ChatGPT URL')
assertEqual(disconnected.prompt, 'SkillPilot Coach Deutsch verwenden.', 'uses the backend start prompt')
assertEqual(disconnectedCalls.length, 2, 'checks status before creating a binding grant')
assertEqual(disconnectedCalls[0]?.init?.credentials, 'include', 'sends the browser binding cookie context')
assertEqual(disconnectedCalls[1]?.init?.method, 'POST', 'creates a binding grant with POST')
assert(
  String(disconnectedCalls[1]?.init?.body) === JSON.stringify({
    language: 'de',
    client: 'test',
    selectedCurriculum: 'math',
    launchIntent: {
      type: 'VERIFIED_RECALL',
      goalId: 'memory-goal-42',
      batchSize: 7,
    },
    providerEligibilityConfirmed: true,
  }),
  'transmits only the typed verified-recall launch intent',
)
assert(
  !String(disconnectedCalls[1]?.init?.body).includes('promptContext'),
  'does not expose a free-form prompt context at the OpenAI launch boundary',
)

const connectedCalls: Array<{ url: string; init: RequestInit | undefined }> = []
const connected = await requestOpenAiMcpStart({
  skillpilotId: 'learner-42',
  language: 'de-DE',
  providerEligibilityConfirmed: true,
  launchIntent: {
    type: 'ABI26_EXAM',
    goalId: 'abi-goal-42',
    courseLevel: 'LK',
  },
}, {
  fetchImpl: async (input, init) => {
    const url = String(input)
    connectedCalls.push({ url, init })
    if (url.endsWith('/status')) {
      return new Response(JSON.stringify({ connected: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response(JSON.stringify({
      prompt: 'Starte meine aktuelle Lerneinheit.',
      webUrl: 'https://chatgpt.com/',
      expiresAt: '2026-07-22T20:00:00Z',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
})
assertEqual(connected.connected, true, 'returns the connected launch path')
assertEqual(connectedCalls.length, 2, 'launches directly for an existing connection')
assert(connectedCalls[1]?.url.endsWith('/launch'), 'uses the launch endpoint after a positive status')
assertEqual(
  connectedCalls[1]?.init?.body,
  JSON.stringify({
    language: 'de',
    client: 'web',
    launchIntent: {
      type: 'ABI26_EXAM',
      goalId: 'abi-goal-42',
      courseLevel: 'LK',
    },
    providerEligibilityConfirmed: true,
  }),
  'preserves the typed ABI launch intent for a connected learner',
)

const recallChatStart: CoachChatStart = {
  variant: 'openai-mcp',
  language: 'de',
  prompt: 'Bitte starte die vorbereitete Kartenprüfung.',
  webUrl: 'https://chatgpt.com/',
  expiresAt: '2026-07-22T20:00:00Z',
  connected: true,
}

let navigatedTo = ''
const delivered = await deliverCoachChatStart(
  recallChatStart,
  (url) => { navigatedTo = url },
)
const deliveredUrl = new URL(navigatedTo)
assertEqual(deliveredUrl.origin, 'https://chatgpt.com', 'navigates to the validated provider origin')
assertEqual(
  deliveredUrl.searchParams.get('prompt'),
  recallChatStart.prompt,
  'hands the complete prompt to ChatGPT in the URL',
)
assertEqual(delivered.copied, false, 'does not use a clipboard handoff')
assertEqual(
  delivered.promptFallback,
  null,
  'does not require a visible copy-and-paste fallback',
)

await assertRejects(
  () => requestOpenAiMcpStart({
    skillpilotId: 'learner-42',
    language: 'en',
    providerEligibilityConfirmed: true,
  }),
  'The OpenAI MCP coach is currently available only for German.',
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
    fetchImpl: async (input) => String(input).endsWith('/status')
      ? new Response(JSON.stringify({ connected: false }), { status: 200 })
      : new Response(JSON.stringify({
          chatgptUrl: 'https://attacker.example/',
          expiresAt: '2026-07-22T20:00:00Z',
        }), { status: 200 }),
  }),
  'Invalid OpenAI MCP response: invalid chatgptUrl',
)

console.log('OpenAI MCP coach variant tests passed')
