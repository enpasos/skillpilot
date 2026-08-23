import assert from 'node:assert/strict'

import { claudeV1StartCopy, getClaudeV1ReadyMessage } from './copy'
import {
  copyClaudeStartPrompt,
  navigatePreparedClaudeWindow,
  prepareClaudeWindow,
  type PreparedClaudeWindow,
} from './handoff'
import {
  buildClaudeV1StartEndpoint,
  getSafeClaudeNewChatUrl,
  requestClaudeV1Start,
} from './request'

const SESSION_A = `spc_${'A'.repeat(43)}`
const SESSION_B = `spc_${'B'.repeat(43)}`
const OPENAI_SESSION = `sps_${'C'.repeat(43)}`
const LEARNER_ID = 'c709883e-bf21-4482-9f68-eb6fe921a619'
const promptWithSession = (session = SESSION_A) => `Nutze SkillPilot Coach v1. Startschlüssel: ${session}`

assert.equal(
  getClaudeV1ReadyMessage('de', false, false),
  claudeV1StartCopy.de.manualReady,
  'blocked copy and popup use a neutral manual fallback',
)
assert.equal(getClaudeV1ReadyMessage('de', true, false), claudeV1StartCopy.de.copiedOnly)
assert.equal(getClaudeV1ReadyMessage('de', false, true), claudeV1StartCopy.de.openOnly)
assert.equal(getClaudeV1ReadyMessage('de', true, true), claudeV1StartCopy.de.copiedAndOpened)

const responsePayload = (overrides: Record<string, unknown> = {}) => ({
  prompt: promptWithSession(),
  webUrl: 'https://claude.ai/new',
  learningSessionId: SESSION_A,
  expiresAt: '2026-08-24T10:00:00Z',
  ...overrides,
})

const assertRejectsWithoutLeak = async (
  operation: () => Promise<unknown>,
  forbidden: string,
) => {
  await assert.rejects(operation, (error: unknown) => {
    assert(error instanceof Error)
    assert(!error.message.includes(forbidden), `error must not leak ${forbidden}`)
    return true
  })
}

assert.equal(
  buildClaudeV1StartEndpoint(' learner / 42 ', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner%2F42/claude/v1/launch',
)
assert.throws(
  () => buildClaudeV1StartEndpoint(' \n\t '),
  /noch kein Lernprofil/u,
)

assert.equal(getSafeClaudeNewChatUrl('https://claude.ai/new'), 'https://claude.ai/new')
assert.equal(getSafeClaudeNewChatUrl('https://claude.ai/new/'), 'https://claude.ai/new')
for (const unsafeUrl of [
  'https://claude.example/new',
  'https://claude.ai.evil.example/new',
  'https://claude.ai/new?session=secret',
  'https://claude.ai/new#secret',
  'https://user:password@claude.ai/new',
  'http://claude.ai/new',
  'https://claude.ai/chat',
]) {
  assert.equal(getSafeClaudeNewChatUrl(unsafeUrl), null, `rejects ${unsafeUrl}`)
}

const calls: Array<{ url: string; init?: RequestInit }> = []
const launch = await requestClaudeV1Start({
  skillpilotId: LEARNER_ID,
  language: 'de-DE',
}, {
  apiBase: 'https://api.example.test/',
  fetchImpl: async (input, init) => {
    calls.push({ url: String(input), init })
    return new Response(JSON.stringify(responsePayload()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  },
})

assert.equal(calls.length, 1)
assert.equal(
  calls[0]?.url,
  `https://api.example.test/api/ui/learners/${LEARNER_ID}/claude/v1/launch`,
)
assert.equal(calls[0]?.init?.method, 'POST')
assert.equal(calls[0]?.init?.credentials, 'include')
assert.equal(
  calls[0]?.init?.body,
  JSON.stringify({ communicationLocale: 'de', client: 'web-start' }),
)
assert(!String(calls[0]?.init?.body).includes(LEARNER_ID), 'permanent ID stays out of the body')
assert.deepEqual(launch, responsePayload())

const englishCalls: RequestInit[] = []
await requestClaudeV1Start({
  skillpilotId: LEARNER_ID,
  language: 'en-GB',
  client: 'web-start',
}, {
  fetchImpl: async (_input, init) => {
    englishCalls.push(init ?? {})
    return new Response(JSON.stringify(responsePayload()), { status: 200 })
  },
})
assert.equal(
  englishCalls[0]?.body,
  JSON.stringify({ communicationLocale: 'en', client: 'web-start' }),
)

for (const invalid of [
  responsePayload({ learningSessionId: SESSION_B }),
  responsePayload({ prompt: `${promptWithSession()}\nNoch einmal: ${SESSION_A}` }),
  responsePayload({ prompt: `${promptWithSession()}\nFremd: ${OPENAI_SESSION}` }),
  responsePayload({ learningSessionId: 'spc_too-short' }),
  responsePayload({ expiresAt: 'not-a-date' }),
  responsePayload({ webUrl: 'https://claude.ai/new?token=secret' }),
  responsePayload({ prompt: `${promptWithSession()}\n${LEARNER_ID}` }),
  responsePayload({ prompt: `${promptWithSession()}\n${LEARNER_ID.toUpperCase()}` }),
]) {
  await assertRejectsWithoutLeak(
    () => requestClaudeV1Start({ skillpilotId: LEARNER_ID, language: 'de' }, {
      fetchImpl: async () => new Response(JSON.stringify(invalid), { status: 200 }),
    }),
    LEARNER_ID,
  )
}

await assertRejectsWithoutLeak(
  () => requestClaudeV1Start({ skillpilotId: LEARNER_ID, language: 'de' }, {
    fetchImpl: async () => new Response('backend-secret-and-id', { status: 500 }),
  }),
  'backend-secret-and-id',
)
await assertRejectsWithoutLeak(
  () => requestClaudeV1Start({ skillpilotId: LEARNER_ID, language: 'de' }, {
    fetchImpl: async () => new Response('not-json', { status: 200 }),
  }),
  'not-json',
)

let modernClipboardText = ''
assert.equal(await copyClaudeStartPrompt('start prompt', {
  clipboard: { writeText: async (text) => { modernClipboardText = text } },
  document: null,
}), true)
assert.equal(modernClipboardText, 'start prompt')

let fallbackRemoved = false
let fallbackText = ''
const fallbackTextarea = {
  value: '',
  style: {} as CSSStyleDeclaration,
  setAttribute: () => undefined,
  focus: () => undefined,
  select: () => undefined,
  remove: () => { fallbackRemoved = true },
}
assert.equal(await copyClaudeStartPrompt('fallback prompt', {
  clipboard: { writeText: async () => { throw new Error('blocked') } },
  document: {
    body: { appendChild: (element: typeof fallbackTextarea) => { fallbackText = element.value } } as unknown as HTMLElement,
    createElement: () => fallbackTextarea as unknown as HTMLTextAreaElement,
    execCommand: (command) => command === 'copy',
  },
}), true)
assert.equal(fallbackText, 'fallback prompt')
assert.equal(fallbackRemoved, true)

let replacedUrl = ''
const prepared = prepareClaudeWindow(() => ({
  opener: {} as unknown,
  location: { replace: (url: string | URL) => { replacedUrl = String(url) } },
}) as unknown as Window)
assert(prepared)
assert.equal(prepared.opener, null)
assert.equal(navigatePreparedClaudeWindow(prepared, launch.webUrl), true)
assert.equal(replacedUrl, 'https://claude.ai/new')
assert.equal(prepareClaudeWindow(() => null), null)
assert.equal(navigatePreparedClaudeWindow(null, launch.webUrl), false)

let closed = false
const brokenWindow: PreparedClaudeWindow = {
  opener: null,
  location: { replace: () => { throw new Error('blocked') } },
  close: () => { closed = true },
}
assert.equal(navigatePreparedClaudeWindow(brokenWindow, launch.webUrl), false)
assert.equal(closed, true)

console.log('Claude v1 first-party start contract passed.')
