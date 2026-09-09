import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const readWorkflow = (name) => readFileSync(
  new URL(`../.github/workflows/${name}`, import.meta.url), 'utf8',
)
const ci = readWorkflow('ci.yml')
const marketplace = readWorkflow('claude-marketplace.yml')

test('plugin CI stays focused on current releases', () => {
  for (const workflow of [ci, marketplace]) {
    assert.doesNotMatch(workflow, /check_openai_plugin_review_freeze(?:\.test)?\.mjs/u)
    assert.doesNotMatch(workflow, /verify_openai_review_video(?:\.test)?\.mjs/u)
    assert.doesNotMatch(workflow, /^\s*- name:.*\b(?:rejected|review freeze|review history|historical review)\b/imu)
  }
})

test('current OpenAI contract, submission and runtime checks remain active', () => {
  for (const command of [
    'npm --prefix "ai/openai app" test',
    'scripts/openai_plugin_release.test.mjs',
    'scripts/plugin_ci_workflows.test.mjs',
    'scripts/check_openai_plugin_versioning.mjs',
    'scripts/check_openai_coach_v11_candidate.test.mjs',
    'scripts/openai_plugin_submission.test.mjs',
    'scripts/openai_plugin_submission.mjs check',
    'scripts/validate_openai_v1_runtime_config.test.mjs',
    'scripts/validate_openai_v1_runtime_config.mjs',
  ]) assert(ci.includes(command), `Current check missing: ${command}`)
})

test('Claude package and publication validation remains independent', () => {
  for (const command of [
    'npm --prefix ai/claude/app test',
    'node ai/claude/plugin/skillpilot-coach-v1/check-package.mjs',
    'node scripts/claude_direct_install_beta_release.mjs verify',
  ]) assert(ci.includes(command), `Claude check missing: ${command}`)
  for (const command of [
    'node scripts/claude_direct_install_beta_release.mjs verify',
    'node --test scripts/claude_marketplace_release.test.mjs',
    ...['check', 'prepare', 'validate-cli', 'smoke-local']
      .map((action) => `node scripts/claude_marketplace_release.mjs ${action}`),
  ]) assert(marketplace.includes(command), `Marketplace check missing: ${command}`)
})
