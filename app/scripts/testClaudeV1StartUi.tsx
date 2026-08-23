import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import {
  buildClaudeWebPromptUrl,
  CLAUDE_COACH_BETA_ENABLED,
  getSafeClaudeDesktopUrl,
  getSafeClaudeWebUrl,
  isClaudeV1WebStartRequested,
  requestClaudeLaunch,
} from '../src/utils/claudeCoach'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const sessionSetupSource = readFileSync(new URL('../src/components/SessionSetup.tsx', import.meta.url), 'utf8')
const claudeAdapterSource = readFileSync(new URL('../src/utils/claudeCoach.ts', import.meta.url), 'utf8')

assert.doesNotMatch(
  appSource,
  /\/lernen\/claude|ClaudeV1StartView/u,
  'the retired standalone Claude URL must not remain in the application router',
)
assert.equal(
  existsSync(new URL('../src/views/ClaudeV1StartView.tsx', import.meta.url)),
  false,
  'the retired standalone Claude start view must be absent',
)

assert.equal(CLAUDE_COACH_BETA_ENABLED, false, 'the provider-neutral root defaults to ChatGPT only')
for (const search of ['', '?coach=chatgpt', '?coach=Claude', '?coach=unknown', '?other=claude']) {
  assert.equal(isClaudeV1WebStartRequested(search), false, `Claude stays disabled for ${search || 'empty query'}`)
}
assert.equal(isClaudeV1WebStartRequested('?coach=claude'), true)
assert.equal(isClaudeV1WebStartRequested('?other=1&coach=claude'), true)
assert.equal(isClaudeV1WebStartRequested('?coach=claude&coach=chatgpt'), false)
assert.equal(isClaudeV1WebStartRequested('?coach=claude&coach=claude'), false)

assert.match(sessionSetupSource, /\{CLAUDE_COACH_BETA_ENABLED && \(/u)
assert.match(sessionSetupSource, /<PersonalCurriculumEditor/u)
assert.match(sessionSetupSource, /sanitizeSkillpilotId\(skillpilotId\)/u)
assert.match(sessionSetupSource, /onClick=\{handleOpenChatGpt\}/u)
assert.match(sessionSetupSource, /onClick=\{handleLaunchClaude\}/u)
assert.match(sessionSetupSource, /disabled=\{!personalCurriculumReady \|\| chatStartLoading\}/u)
assert.match(sessionSetupSource, /disabled=\{!personalCurriculumReady \|\| claudeActionLoading\}/u)
assert(
  sessionSetupSource.indexOf('onClick={handleOpenChatGpt}')
    < sessionSetupSource.indexOf('onClick={handleLaunchClaude}'),
  'the shared final step must present distinct ChatGPT and Claude decisions',
)

assert.match(claudeAdapterSource, /requestClaudeV1Start\(\{/u)
assert.match(claudeAdapterSource, /client: 'web-start'/u)
assert.doesNotMatch(
  claudeAdapterSource,
  /\/api\/ui\/learners\/\$\{[^}]+\}\/claude\/(?:connect-start|launch|status|connection)/u,
  'the shared start must not fall back to the retired Claude beta endpoints',
)

const SESSION = `spc_${'A'.repeat(43)}`
const LEARNER_ID = 'c709883e-bf21-4482-9f68-eb6fe921a619'
const startPrompt = [
  'Nutze den SkillPilot-Coach-Skill und lerne weiter.',
  `learningSessionId: ${SESSION}`,
  'Umlaute: äöü & reserved = ? # / + %',
].join('\n')
const promptUrl = buildClaudeWebPromptUrl(startPrompt)
const parsedPromptUrl = new URL(promptUrl)
assert.equal(promptUrl, `https://claude.ai/new?q=${encodeURIComponent(startPrompt)}`)
assert(promptUrl.includes('%20'), 'spaces use explicit percent encoding in the Claude Web handoff')
assert(!promptUrl.includes('+'), 'literal plus and spaces must not become ambiguous query separators')
assert.equal(parsedPromptUrl.origin, 'https://claude.ai')
assert.equal(parsedPromptUrl.pathname, '/new')
assert.deepEqual([...parsedPromptUrl.searchParams.keys()], ['q'])
assert.equal(parsedPromptUrl.searchParams.get('q'), startPrompt)
assert.equal(getSafeClaudeWebUrl(promptUrl), promptUrl)
assert.equal(getSafeClaudeDesktopUrl(''), null, 'the unified start has no desktop route')
assert.equal(
  getSafeClaudeDesktopUrl('claude://claude.ai/new'),
  null,
  'even a syntactically valid desktop URL is outside the Web-only v1 contract',
)
assert.deepEqual(startPrompt.match(/spc_[A-Za-z0-9_-]{43}/gu), [SESSION])
assert.equal((startPrompt.match(/spc_/gu) ?? []).length, 1)
assert(!startPrompt.includes('sps_'))
assert(!promptUrl.toLowerCase().includes(LEARNER_ID.toLowerCase()))
assert(!promptUrl.includes(encodeURIComponent(LEARNER_ID)))
assert.throws(() => buildClaudeWebPromptUrl(' \n\t '), /Missing Claude start prompt/u)

const encodedTextUrl = 'https://claude.ai/new?q=valid%26next%3Dhttps%3A%2F%2Fevil.example%2F%2B%25'
assert.equal(getSafeClaudeWebUrl(encodedTextUrl), encodedTextUrl)
assert.equal(
  new URL(encodedTextUrl).searchParams.get('q'),
  'valid&next=https://evil.example/+%',
  'reserved text inside q is data, not an injected query parameter',
)

for (const unsafeUrl of [
  'http://claude.ai/new?q=prompt',
  'https://claude.ai:444/new?q=prompt',
  'https://www.claude.ai/new?q=prompt',
  'https://claude.ai.evil.example/new?q=prompt',
  'https://user:password@claude.ai/new?q=prompt',
  'https://claude.ai/new?q=prompt#fragment',
  'https://claude.ai/new?q=prompt&next=https%3A%2F%2Fevil.example',
  'https://claude.ai/new?q=one&q=two',
  'https://claude.ai/new?q=',
  'https://claude.ai/new?q=%20%20%20',
  'https://claude.ai/new',
  'https://claude.ai/new/',
  'https://claude.ai/chat?q=prompt',
]) {
  assert.equal(getSafeClaudeWebUrl(unsafeUrl), null, `unsafe Claude Web URL rejected: ${unsafeUrl}`)
}

const originalFetch = globalThis.fetch
try {
  globalThis.fetch = async () => new Response(JSON.stringify({
    prompt: startPrompt,
    webUrl: 'https://claude.ai/new',
    learningSessionId: SESSION,
    expiresAt: '2026-08-24T10:00:00Z',
  }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  const launch = await requestClaudeLaunch({
    skillpilotId: LEARNER_ID,
    language: 'de',
  })
  assert.equal(launch.desktopUrl, '')
  assert.equal(new URL(launch.webUrl).searchParams.get('q'), launch.prompt)
  assert.deepEqual(launch.prompt.match(/spc_[A-Za-z0-9_-]{43}/gu), [SESSION])
  assert.equal((launch.prompt.match(/spc_/gu) ?? []).length, 1)
  assert(!launch.prompt.includes('sps_'))
  assert(!launch.webUrl.toLowerCase().includes(LEARNER_ID.toLowerCase()))
} finally {
  globalThis.fetch = originalFetch
}

assert.match(claudeAdapterSource, /webUrl: buildClaudeWebPromptUrl\(response\.prompt\)/u)
assert.match(claudeAdapterSource, /desktopUrl: ''/u)

for (const unsafeDesktopUrl of [
  'claude://claude.ai:123/new',
  'claude://user:password@claude.ai/new',
  'claude://claude.ai/new?q=prompt',
  'claude://claude.ai/new#fragment',
]) {
  assert.equal(getSafeClaudeDesktopUrl(unsafeDesktopUrl), null)
}

console.log('Claude v1 unified web-start UI contract passed.')
