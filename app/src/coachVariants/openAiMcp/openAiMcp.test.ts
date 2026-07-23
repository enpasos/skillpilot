import {
  buildOpenAiMcpEndpoint,
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
const copiedDelivery = await deliverCoachChatStart(
  recallChatStart,
  (url) => { navigatedTo = url },
  async () => undefined,
)
assertEqual(navigatedTo, 'https://chatgpt.com/', 'navigates before the optional clipboard handoff')
assertEqual(copiedDelivery.copied, true, 'reports an allowed clipboard write')
assertEqual(
  copiedDelivery.promptFallback,
  recallChatStart.prompt,
  'keeps the visible prompt available even after copying it',
)

navigatedTo = ''
const rejectedClipboardDelivery = await deliverCoachChatStart(
  recallChatStart,
  (url) => { navigatedTo = url },
  async () => { throw new Error('clipboard denied') },
)
assertEqual(navigatedTo, 'https://chatgpt.com/', 'keeps the provider launch when clipboard access is denied')
assertEqual(rejectedClipboardDelivery.copied, false, 'reports a denied clipboard write without throwing')
assertEqual(
  rejectedClipboardDelivery.promptFallback,
  recallChatStart.prompt,
  'returns a copyable fallback after clipboard denial',
)

navigatedTo = ''
const unavailableClipboardDelivery = await deliverCoachChatStart(
  recallChatStart,
  (url) => { navigatedTo = url },
)
assertEqual(navigatedTo, 'https://chatgpt.com/', 'keeps the provider launch without a clipboard API')
assertEqual(unavailableClipboardDelivery.copied, false, 'reports an unavailable clipboard API')
assertEqual(
  unavailableClipboardDelivery.promptFallback,
  recallChatStart.prompt,
  'returns a copyable fallback when no clipboard API exists',
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
