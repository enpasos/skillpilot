import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import {
  buildClaudeWebPromptUrl,
  getSafeClaudeDesktopUrl,
  getSafeClaudeWebUrl,
  requestClaudeLaunch,
} from '../src/utils/claudeCoach'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const sessionSetupSource = readFileSync(new URL('../src/components/SessionSetup.tsx', import.meta.url), 'utf8')
const claudeAdapterSource = readFileSync(new URL('../src/utils/claudeCoach.ts', import.meta.url), 'utf8')
const germanLocaleSource = readFileSync(new URL('../src/locales/de.ts', import.meta.url), 'utf8')
const englishLocaleSource = readFileSync(new URL('../src/locales/en.ts', import.meta.url), 'utf8')
const claudeHandlerStart = sessionSetupSource.indexOf('const handleLaunchClaude = async () => {')
const claudeHandlerEnd = sessionSetupSource.indexOf('const handleDisconnectClaude = async () => {', claudeHandlerStart)
const claudeUiStart = sessionSetupSource.indexOf('data-testid="claude-v1-start-options"')
const learnerCockpitHref = 'href={personalCurriculumReady ? learnerCockpitHref : undefined}'
const learnerCockpitHrefIndex = sessionSetupSource.indexOf(learnerCockpitHref, claudeUiStart)
const claudeUiEnd = sessionSetupSource.lastIndexOf('<a', learnerCockpitHrefIndex)
assert(claudeHandlerStart >= 0 && claudeHandlerEnd > claudeHandlerStart)
assert(claudeUiStart >= 0 && claudeUiEnd > claudeUiStart)
const activeClaudeHandlerSource = sessionSetupSource.slice(claudeHandlerStart, claudeHandlerEnd)
const activeClaudeUiSource = sessionSetupSource.slice(claudeUiStart, claudeUiEnd)
const activeClaudeStartSource = `${activeClaudeHandlerSource}\n${activeClaudeUiSource}`

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

assert.match(sessionSetupSource, /data-testid="claude-v1-start-options"/u)
assert.doesNotMatch(
  claudeAdapterSource,
  /isClaudeV1WebStartRequested|URLSearchParams|window\.location\.search/u,
  'the shared standard start must not depend on a hidden provider query',
)
assert.match(sessionSetupSource, /<PersonalCurriculumEditor/u)
assert.match(sessionSetupSource, /sanitizeSkillpilotId\(skillpilotId\)/u)
assert.match(sessionSetupSource, /onClick=\{handleOpenChatGpt\}/u)
assert.match(sessionSetupSource, /onClick=\{handleLaunchClaude\}/u)
assert.match(sessionSetupSource, /disabled=\{!personalCurriculumReady \|\| chatStartLoading\}/u)
assert.match(sessionSetupSource, /disabled=\{!personalCurriculumReady \|\| claudeActionLoading\}/u)
assert.match(
  activeClaudeHandlerSource,
  /const claudeWindow = window\.open\('', '_blank'\)[\s\S]*if \(!claudeWindow\) \{[\s\S]*setClaudeActionState\('failed'\)[\s\S]*return[\s\S]*\}/u,
  'the Claude Web start must fail clearly when the click-time popup is blocked',
)
assert.match(
  activeClaudeHandlerSource,
  /const webUrl = getSafeClaudeWebUrl\(result\.webUrl\)[\s\S]*if \(!webUrl\) throw new Error\('Invalid Claude Web launch URL'\)[\s\S]*claudeWindow\.location\.href = webUrl/u,
  'the prepared Claude window must receive only the validated q-prefilled Web URL',
)
const popupOpenIndex = activeClaudeHandlerSource.indexOf("const claudeWindow = window.open('', '_blank')")
assert.doesNotMatch(
  activeClaudeHandlerSource.slice(0, popupOpenIndex),
  /\bawait\b/u,
  'the Claude popup must be opened synchronously before the first await',
)
assert.deepEqual(
  [...activeClaudeHandlerSource.matchAll(/claudeWindow\.location\.href\s*=\s*([A-Za-z]+)/gu)]
    .map(match => match[1]),
  ['installUrl', 'webUrl'],
  'the Claude handler may navigate only to its validated install and q-prefilled Web URLs',
)
assert.equal(
  [...activeClaudeHandlerSource.matchAll(/claudeWindow\.opener\s*=\s*null/gu)].length,
  2,
  'both allowed Claude navigations must detach the opener',
)
assert.match(
  activeClaudeHandlerSource,
  /claudeWindow\?\.close\(\)[\s\S]*setClaudeActionState\('failed'\)/u,
  'a failed asynchronous Claude start must close the prepared blank window',
)
assert.doesNotMatch(
  activeClaudeStartSource,
  /navigator\.clipboard|copyClaudePrompt|handleCopyClaudeFallback|claudeLaunchFallback|claudePromptCopied|fallback-copied|result\s*(?:\.prompt|\[\s*['"]prompt['"]\s*\])|<textarea\b|claudeCopyPrompt|claudeOpenWeb|claudeOpenApp/u,
  'the unified Claude Web start must not copy or expose a manual prompt fallback',
)
assert.doesNotMatch(
  activeClaudeHandlerSource,
  /getSafeClaudeWebUrl\(result\.webUrl\)\s*\?\?\s*['"]https:\/\/claude\.ai\/new['"]/u,
  'an invalid q-prefilled launch URL must not degrade to an empty Claude chat',
)
assert(
  sessionSetupSource.indexOf('onClick={handleOpenChatGpt}')
    < sessionSetupSource.indexOf('onClick={handleLaunchClaude}'),
  'the standard shared final step must present distinct ChatGPT and Claude decisions',
)
assert.match(sessionSetupSource, /to="\/faq\/coach-setup"/u)
assert.match(germanLocaleSource, /\*\*SkillPilot ist kostenlos\.\*\*/u)
assert.match(germanLocaleSource, /linkLabel: "Zugänge vergleichen"/u)
assert.doesNotMatch(germanLocaleSource, /nur einen ChatGPT-Account/u)
assert.match(englishLocaleSource, /\*\*SkillPilot is free\.\*\*/u)
assert.match(englishLocaleSource, /linkLabel: "Compare access options"/u)
assert.doesNotMatch(englishLocaleSource, /only need a ChatGPT account/u)

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
