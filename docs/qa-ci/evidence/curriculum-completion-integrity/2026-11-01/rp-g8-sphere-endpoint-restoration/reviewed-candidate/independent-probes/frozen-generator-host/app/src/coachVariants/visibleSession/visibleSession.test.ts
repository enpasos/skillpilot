import {
  getVisibleSessionGptBaseUrl,
  normalizeVisibleSessionGptBaseUrl,
  VISIBLE_SESSION_GPT_URL_DE,
  VISIBLE_SESSION_GPT_URL_EN,
} from './config'
import {
  buildVisibleChatStartEndpoint,
  requestVisibleChatStart,
} from './request'
import { buildVisibleSessionStartUrl } from './startUrl'
import { getVisibleSessionLaunchCopy } from './copy'
import { buildVisibleSessionVerifiedRecallInstruction } from './verifiedRecallPrompt'
import { resolveCoachVariant } from '../versionSelector'

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

const TEST_TOKEN = `sps_${'A'.repeat(43)}`

assertEqual(
  normalizeVisibleSessionGptBaseUrl('https://chatgpt.com/g/g-visible-de'),
  'https://chatgpt.com/g/g-visible-de',
  'accepts a ChatGPT GPT URL',
)
assertEqual(
  normalizeVisibleSessionGptBaseUrl('https://example.com/g/g-visible-de'),
  null,
  'rejects a non-ChatGPT URL so prompts cannot be sent to another host',
)
assertEqual(
  VISIBLE_SESSION_GPT_URL_DE,
  'https://chatgpt.com/g/g-693ebdcb2fac8191b3a765ce7f451fb2-skillpilot-gpt-deutsch',
  'keeps the existing German GPT URL',
)
assertEqual(
  VISIBLE_SESSION_GPT_URL_EN,
  'https://chatgpt.com/g/g-69a565a532008191a3b994e83d20241c-skillpilot-gpt-english',
  'keeps the existing English GPT URL',
)
assertEqual(
  getVisibleSessionGptBaseUrl('en-GB'),
  VISIBLE_SESSION_GPT_URL_EN,
  'selects the existing English GPT URL',
)

const visibleVariant = resolveCoachVariant('de', {})
assertEqual(
  visibleVariant.version,
  'visible-session',
  'defaults to the visible-session variant without deployment variables',
)
assert(
  visibleVariant.version === 'visible-session'
    && visibleVariant.gptBaseUrl === VISIBLE_SESSION_GPT_URL_DE,
  'the default variant opens the existing German GPT',
)
assertEqual(
  resolveCoachVariant('de', {
    VITE_SKILLPILOT_COACH_VARIANT: 'legacy',
  }).version,
  'legacy',
  'an explicit legacy selection remains available for a coordinated rollback',
)
assertEqual(
  resolveCoachVariant('de', {
    VITE_SKILLPILOT_COACH_VARIANT: 'openai-mcp',
  }).version,
  'openai-mcp',
  'allows the language-neutral MCP coach variant',
)
assertEqual(
  resolveCoachVariant('en', {
    VITE_SKILLPILOT_COACH_VARIANT: 'openai-mcp',
  }).version,
  'openai-mcp',
  'uses the language-neutral MCP coach for English learners',
)
const englishMcpVariant = resolveCoachVariant('en', {
  VITE_SKILLPILOT_COACH_VARIANT: 'openai-mcp',
})
assert(
  englishMcpVariant.version === 'openai-mcp'
    && englishMcpVariant.language === 'en',
  'the OpenAI MCP deployment flag preserves the English session language',
)
assertEqual(
  resolveCoachVariant('de', { VITE_SKILLPILOT_COACH_VARIANT: 'typo' }).version,
  'configuration-error',
  'fails closed for an unknown variant instead of treating it as rollback',
)

assert(
  getVisibleSessionLaunchCopy('de').startPromptHint.includes('24 Stunden')
    && getVisibleSessionLaunchCopy('de').startPromptHint.includes('sichtbar'),
  'German rollout copy describes the 24-hour visible session token',
)
assert(
  getVisibleSessionLaunchCopy('en').startPromptHint.includes('24 hours')
    && getVisibleSessionLaunchCopy('en').startPromptHint.includes('visible'),
  'English rollout copy describes the 24-hour visible session token',
)
assert(
  buildVisibleSessionVerifiedRecallInstruction('de', 7).includes('startVisibleVerifiedRecall')
    && buildVisibleSessionVerifiedRecallInstruction('de', 7).includes('batchSize=7')
    && buildVisibleSessionVerifiedRecallInstruction('de', 7).includes('Karten-ID'),
  'German Visible Session recall launch carries the exact action, batch size, and visible card IDs',
)
assert(
  buildVisibleSessionVerifiedRecallInstruction('en', 4).includes('startVisibleVerifiedRecall')
    && buildVisibleSessionVerifiedRecallInstruction('en', 4).includes('batchSize=4')
    && buildVisibleSessionVerifiedRecallInstruction('en', 4).includes('visible card ID'),
  'English Visible Session recall launch carries the exact action, batch size, and visible card IDs',
)
const startUrl = new URL(buildVisibleSessionStartUrl(
  'https://chatgpt.com/g/g-visible-de?existing=kept',
  '  START visible session  ',
))
assertEqual(startUrl.searchParams.get('existing'), 'kept', 'preserves existing GPT URL parameters')
assertEqual(startUrl.searchParams.get('prompt'), 'START visible session', 'adds the trimmed prompt')

assertEqual(
  buildVisibleChatStartEndpoint('  learner / 42  ', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner%2F42/visible-chat-start',
  'sanitizes and encodes the learner ID in the endpoint',
)

let capturedUrl = ''
let capturedInit: RequestInit | undefined
const fetchImpl: typeof fetch = async (input, init) => {
  capturedUrl = String(input)
  capturedInit = init
  return new Response(JSON.stringify({
    chatSessionToken: TEST_TOKEN,
    expiresAt: '2026-07-22T04:38:15Z',
    prompt: `START ${TEST_TOKEN}`,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

const response = await requestVisibleChatStart({
  skillpilotId: ' learner-42 ',
  language: 'de',
  selectedCurriculum: 'math',
  promptContext: 'verified recall',
  client: 'test',
}, {
  apiBase: 'https://api.example.test/',
  fetchImpl,
})

assertEqual(
  capturedUrl,
  'https://api.example.test/api/ui/learners/learner-42/visible-chat-start',
  'posts to the visible chat start endpoint',
)
assertEqual(capturedInit?.method, 'POST', 'uses POST')
assertEqual(
  capturedInit?.body,
  JSON.stringify({
    language: 'de',
    client: 'test',
    selectedCurriculum: 'math',
    promptContext: 'verified recall',
  }),
  'preserves the existing launch context request body',
)
assertEqual(response.chatSessionToken, TEST_TOKEN, 'returns the session token contract')
assertEqual(response.expiresAt, '2026-07-22T04:38:15Z', 'returns the expiry contract')
assertEqual(response.prompt, `START ${TEST_TOKEN}`, 'returns the prompt contract')

await assertRejects(
  () => requestVisibleChatStart({ skillpilotId: 'learner-42', language: 'de' }, {
    fetchImpl: async () => new Response(JSON.stringify({ prompt: 'incomplete' }), { status: 200 }),
  }),
  'Invalid visible chat start response',
)

await assertRejects(
  () => requestVisibleChatStart({ skillpilotId: 'learner-42', language: 'de' }, {
    fetchImpl: async () => new Response(JSON.stringify({
      chatSessionToken: 'not-a-session-token',
      expiresAt: '2026-07-22T04:38:15Z',
      prompt: 'START invalid',
    }), { status: 200 }),
  }),
  'Invalid visible chat start response',
)

await assertRejects(
  () => requestVisibleChatStart({ skillpilotId: 'learner-42', language: 'de' }, {
    fetchImpl: async () => new Response(JSON.stringify({
      chatSessionToken: TEST_TOKEN,
      expiresAt: 'not-a-date',
      prompt: `START ${TEST_TOKEN}`,
    }), { status: 200 }),
  }),
  'Invalid visible chat start response',
)

await assertRejects(
  () => requestVisibleChatStart({ skillpilotId: 'learner-42', language: 'de' }, {
    fetchImpl: async () => new Response(JSON.stringify({
      chatSessionToken: TEST_TOKEN,
      expiresAt: '2026-07-22T04:38:15Z',
      prompt: 'START with a missing token',
    }), { status: 200 }),
  }),
  'Invalid visible chat start response',
)

console.log('visible-session coach variant tests passed')
