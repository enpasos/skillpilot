import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import {
  buildClaudeWebPromptUrl,
  getSafeClaudeDesktopUrl,
  getSafeClaudePluginSetupUrl,
  getSafeClaudeWebUrl,
  requestClaudeLaunch,
  requestClaudePluginSetupStart,
} from '../src/utils/claudeCoach'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const sessionSetupSource = readFileSync(new URL('../src/components/SessionSetup.tsx', import.meta.url), 'utf8')
const publicLandingPanelsSource = readFileSync(
  new URL('../src/components/PublicLandingPanels.tsx', import.meta.url),
  'utf8',
)
const claudeAdapterSource = readFileSync(new URL('../src/utils/claudeCoach.ts', import.meta.url), 'utf8')
const germanLocaleSource = readFileSync(new URL('../src/locales/de.ts', import.meta.url), 'utf8')
const englishLocaleSource = readFileSync(new URL('../src/locales/en.ts', import.meta.url), 'utf8')
const claudeSetupHandlerStart = sessionSetupSource.indexOf('const handleOpenClaudePluginSetup = async () => {')
const claudeHandlerStart = sessionSetupSource.indexOf('const handleLaunchClaude = async () => {')
const claudeHandlerEnd = sessionSetupSource.indexOf('const handleSubmit = async', claudeHandlerStart)
const claudeUiStart = sessionSetupSource.indexOf('data-testid="claude-v1-start-options"')
const learnerCockpitHref = 'href={personalCurriculumReady ? learnerCockpitHref : undefined}'
const learnerCockpitHrefIndex = sessionSetupSource.indexOf(learnerCockpitHref, claudeUiStart)
const claudeUiEnd = sessionSetupSource.lastIndexOf('<a', learnerCockpitHrefIndex)
assert(claudeHandlerStart >= 0 && claudeHandlerEnd > claudeHandlerStart)
assert(claudeSetupHandlerStart >= 0 && claudeHandlerStart > claudeSetupHandlerStart)
assert(claudeUiStart >= 0 && claudeUiEnd > claudeUiStart)
const activeClaudeHandlerSource = sessionSetupSource.slice(claudeHandlerStart, claudeHandlerEnd)
const activeClaudeSetupHandlerSource = sessionSetupSource.slice(claudeSetupHandlerStart, claudeHandlerStart)
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
assert.match(sessionSetupSource, /onClick=\{handleOpenClaudePluginSetup\}/u)
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
  ['webUrl'],
  'the Claude start handler may navigate only to its validated q-prefilled Web URL',
)
assert.equal(
  [...activeClaudeHandlerSource.matchAll(/claudeWindow\.opener\s*=\s*null/gu)].length,
  1,
  'the Claude Web navigation must detach the opener',
)
assert.match(
  activeClaudeHandlerSource,
  /claudeWindow\?\.close\(\)[\s\S]*setClaudeActionState\('failed'\)/u,
  'a failed asynchronous Claude start must close the prepared blank window',
)
assert.match(
  activeClaudeSetupHandlerSource,
  /requestClaudePluginSetupStart\([\s\S]*getSafeClaudePluginSetupUrl\(result\.setupUrl\)[\s\S]*setupWindow\.location\.href = setupUrl/u,
  'the one-time setup action must open only the validated first-party plugin guide',
)
assert.doesNotMatch(
  activeClaudeHandlerSource,
  /requestClaudePluginSetupStart|requestClaudePluginSetupStatus|getSafeClaudePluginSetupUrl|setupUrl/u,
  'starting Claude must never divert back into setup or a connection-status check',
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
assert.match(activeClaudeUiSource, /data-testid="claude-plugin-setup-guide"/u)
assert.match(activeClaudeUiSource, /data-testid="claude-plugin-setup-step-1"/u)
assert.match(activeClaudeUiSource, /data-testid="claude-plugin-setup-step-2"/u)
assert(
  activeClaudeUiSource.indexOf('data-testid="claude-plugin-setup-open"')
    < activeClaudeUiSource.indexOf('data-testid="claude-plugin-start"'),
  'the one-time plugin setup action is presented before the everyday Claude start',
)
assert.match(
  sessionSetupSource,
  /<PublicLandingPanels[\s\S]*accessBanner=\{t\.startPage\.banner\}/u,
  'the public landing receives the unchanged provider-access banner from SessionSetup',
)
const accessLinkTestIdIndex = publicLandingPanelsSource.indexOf(
  'data-testid="public-landing-access-link"',
)
assert(accessLinkTestIdIndex >= 0, 'the public landing exposes one stable access-comparison action')
const accessLinkSource = publicLandingPanelsSource.slice(
  publicLandingPanelsSource.lastIndexOf('<Link', accessLinkTestIdIndex),
  publicLandingPanelsSource.indexOf('</Link>', accessLinkTestIdIndex),
)
assert.match(
  accessLinkSource,
  /to="\/faq\/coach-setup"/u,
  'the visible provider-access action keeps the access-comparison route after component extraction',
)
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
assert.doesNotMatch(
  claudeAdapterSource,
  /customize\/connectors|add-custom-connector|skillpilot_claude_v1_setup_opened|requestClaudeConnectionStatus|requestClaudeDisconnect/u,
  'the direct-plugin path must not retain the retired manual connector setup or fake local connection state',
)

const germanClaudeCopy = germanLocaleSource.slice(
  germanLocaleSource.indexOf('claudeBetaTitle:'),
  germanLocaleSource.indexOf('dashboardButton:', germanLocaleSource.indexOf('claudeBetaTitle:')),
)
const englishClaudeCopy = englishLocaleSource.slice(
  englishLocaleSource.indexOf('claudeBetaTitle:'),
  englishLocaleSource.indexOf('dashboardButton:', englishLocaleSource.indexOf('claudeBetaTitle:')),
)
assert.doesNotMatch(germanClaudeCopy, /Connector|Konnektor|OAuth/u)
assert.doesNotMatch(englishClaudeCopy, /Connector|Konnektor|OAuth/u)
assert.match(germanClaudeCopy, /Schritt 1: Plugin einrichten/u)
assert.match(germanClaudeCopy, /Schritt 2: Mit Claude starten/u)
assert.match(englishClaudeCopy, /Step 1: Set up plugin/u)
assert.match(englishClaudeCopy, /Step 2: Start with Claude/u)

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

assert.equal(getSafeClaudePluginSetupUrl('/plugins'), '/plugins')
for (const unsafeSetupUrl of [
  'https://skillpilot.com/plugins',
  '//evil.example/plugins',
  '/plugins?next=evil',
  '/plugins#fragment',
  '/faq/coach-setup',
]) {
  assert.equal(getSafeClaudePluginSetupUrl(unsafeSetupUrl), null)
}
const pluginSetup = await requestClaudePluginSetupStart({ skillpilotId: LEARNER_ID, language: 'de' })
assert.equal(pluginSetup.setupUrl, '/plugins')
assert(Number.isFinite(new Date(pluginSetup.expiresAt).getTime()))

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
