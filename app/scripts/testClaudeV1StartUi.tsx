import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const appSource = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const viewSource = readFileSync(new URL('../src/views/ClaudeV1StartView.tsx', import.meta.url), 'utf8')
const copySource = readFileSync(new URL('../src/coachVariants/claudeV1/copy.ts', import.meta.url), 'utf8')
const requestSource = readFileSync(new URL('../src/coachVariants/claudeV1/request.ts', import.meta.url), 'utf8')

assert.equal(
  (appSource.match(/path="\/lernen\/claude"/gu) ?? []).length,
  2,
  'the Claude start route must exist in both public and active-session route sets',
)
assert.match(appSource, /PUBLIC_PATHS[\s\S]*'\/lernen\/claude'/u)
assert.doesNotMatch(viewSource, /SessionSetup|coachLaunch|versionSelector|LearnerView/u)
assert.doesNotMatch(viewSource, /openAiMcp|\/openai\/v1|sps_/u)
assert.doesNotMatch(requestSource, /openAiMcp|\/openai\/v1/u)
assert.match(requestSource, /\/claude\/v1\/launch/u)
assert.match(requestSource, /credentials:\s*'include'/u)
assert.match(requestSource, /https:\/\/claude\.ai\/new/u)
assert.match(copySource, /genau 24 Stunden/u)
assert.match(copySource, /exactly 24 hours/u)
assert.doesNotMatch(copySource, /höchstens 24 Stunden|no more than 24 hours/iu)
assert.match(copySource, /permanent SkillPilot ID stays with SkillPilot/u)
assert.match(copySource, /Starttext kopieren/u)
assert.match(copySource, /Claude öffnen/u)
assert.match(viewSource, /target="_blank"/u)
assert.match(viewSource, /rel="noopener noreferrer"/u)
assert.doesNotMatch(viewSource, /learningSessionId/u, 'the temporary token must not be rendered')
assert.doesNotMatch(viewSource, /\{skillpilotId\}/u, 'the permanent ID must not be rendered')

console.log('Claude v1 first-party start UI passed.')
