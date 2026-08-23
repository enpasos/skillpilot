import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

import {
  CLAUDE_COACH_BETA_ENABLED,
  isClaudeV1WebStartRequested,
} from '../src/utils/claudeCoach'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const aliasSource = readFileSync(new URL('../src/views/ClaudeV1StartView.tsx', import.meta.url), 'utf8')
const sessionSetupSource = readFileSync(new URL('../src/components/SessionSetup.tsx', import.meta.url), 'utf8')
const claudeAdapterSource = readFileSync(new URL('../src/utils/claudeCoach.ts', import.meta.url), 'utf8')

assert.equal(
  (appSource.match(/path="\/lernen\/claude"/gu) ?? []).length,
  2,
  'the legacy Claude URL remains available in both route sets',
)
assert.match(appSource, /PUBLIC_PATHS[\s\S]*'\/lernen\/claude'/u)
assert.match(
  appSource,
  /<Route path="\/lernen\/claude" element=\{<ClaudeV1StartView \/>\} \/>/u,
  'the legacy route must render only the compatibility alias',
)

assert.match(aliasSource, /const UNIFIED_WEB_START_URL = '\/\?coach=claude'/u)
assert.match(aliasSource, /window\.location\.replace\(UNIFIED_WEB_START_URL\)/u)
assert.match(aliasSource, /href=\{UNIFIED_WEB_START_URL\}/u)
assert.doesNotMatch(
  aliasSource,
  /localStorage|sessionStorage|requestClaude|\/claude\/v1\/launch|fetch\s*\(|learningSessionId|persistLearnerStart/u,
  'the alias must neither read learner storage nor create a Claude session',
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

console.log('Claude v1 unified web-start UI contract passed.')
