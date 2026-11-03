import assert from 'node:assert/strict'
import { buildGeminiV1StartEndpoint, getSafeGeminiWebUrl, requestGeminiV1Start } from './request'

const learnerId = 'c709883e-bf21-4482-9f68-eb6fe921a619'
const session = `spg_${'A'.repeat(43)}`
const prompt = `@SkillPilot Use the SkillPilot Coach skill.\nlearningSessionId: ${session}`
const payload = (overrides: Record<string, unknown> = {}) => ({
  prompt,
  webUrl: 'https://gemini.google.com/app?hl=en',
  learningSessionId: session,
  expiresAt: '2026-10-07T10:00:00Z',
  ...overrides,
})

assert.equal(buildGeminiV1StartEndpoint(' learner / 42 ', 'https://api.example.test/'),
  'https://api.example.test/api/ui/learners/learner%2F42/gemini/v1/launch')
assert.throws(() => buildGeminiV1StartEndpoint(' \n '), /kein Lernprofil/u)
assert.equal(getSafeGeminiWebUrl('https://gemini.google.com/app?hl=en'), 'https://gemini.google.com/app?hl=en')
for (const url of [
  'https://gemini.google.com/app',
  `https://gemini.google.com/app?hl=en&prompt=${session}`,
  'https://gemini.google.com/app?hl=en&hl=en',
  'https://gemini.google.com/app?hl=de',
  'https://gemini.google.com/app?hl=en#secret',
  'https://gemini.google.com/app/?hl=en',
  'http://gemini.google.com/app?hl=en',
  'https://gemini.google.com.evil.example/app?hl=en',
  'https://user:password@gemini.google.com/app?hl=en',
  'https://gemini.google.com:444/app?hl=en',
]) assert.equal(getSafeGeminiWebUrl(url), null)

const calls: Array<{ url: string; init?: RequestInit }> = []
const result = await requestGeminiV1Start({ skillpilotId: learnerId, language: 'en-GB' }, {
  apiBase: 'https://api.example.test/',
  fetchImpl: async (url, init) => {
    calls.push({ url: String(url), init })
    return new Response(JSON.stringify(payload()), { status: 200 })
  },
})
assert.deepEqual(result, payload())
assert.equal(calls[0].url, `https://api.example.test/api/ui/learners/${learnerId}/gemini/v1/launch`)
assert.equal(calls[0].init?.method, 'POST')
assert.equal(calls[0].init?.credentials, 'include')
assert.deepEqual(JSON.parse(String(calls[0].init?.body)), { communicationLocale: 'en', client: 'web-start' })
assert(!result.prompt.includes(learnerId))
assert(!result.webUrl.includes(session))

for (const invalid of [
  payload({ learningSessionId: `spc_${'A'.repeat(43)}` }),
  payload({ learningSessionId: `sps_${'A'.repeat(43)}` }),
  payload({ learningSessionId: `spg_${'B'.repeat(43)}` }),
  payload({ prompt: `${prompt}\n${session}` }),
  payload({ prompt: `${prompt}B` }),
  payload({ prompt: `${prompt}\nspc_${'B'.repeat(43)}` }),
  payload({ prompt: `${prompt}\n${learnerId.toUpperCase()}` }),
  payload({ webUrl: `https://gemini.google.com/app?hl=en&session=${session}` }),
  payload({ expiresAt: 'invalid' }),
  payload({ prompt: null }),
  null,
  [],
]) {
  await assert.rejects(() => requestGeminiV1Start({ skillpilotId: learnerId, language: 'de' }, {
    fetchImpl: async () => new Response(JSON.stringify(invalid), { status: 200 }),
  }), (error: unknown) => error instanceof Error
    && !error.message.includes(learnerId) && !error.message.includes(session))
}
await assert.rejects(() => requestGeminiV1Start({ skillpilotId: learnerId, language: 'de' }, {
  fetchImpl: async () => new Response(`secret ${learnerId} ${session}`, { status: 503 }),
}), (error: unknown) => error instanceof Error && error.message === 'Gemini-Start fehlgeschlagen (503).')
await assert.rejects(() => requestGeminiV1Start({ skillpilotId: learnerId, language: 'de' }, {
  fetchImpl: async () => new Response('not-json', { status: 200 }),
}), /nicht sicher vorbereitet/u)
console.log('Gemini v1 session isolation and safe start contract passed.')
