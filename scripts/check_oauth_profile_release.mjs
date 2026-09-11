#!/usr/bin/env node

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const PROFILE_IDS = Object.freeze([
  'chatgpt-cimd-jwt', 'chatgpt-basic-transition', 'claude-cimd-public',
  'claude-custom-confidential', 'claude-anthropic-held', 'chatgpt-mtls',
])
const STAGES = ['implementation', 'technical', 'realHost', 'production']
const COMMON_HOST_CHECKS = [
  'installation', 'authorization', 'tool-use', 'expiry-refresh',
  'revoke-reconnect', 'negative-auth', 'profile-isolation',
  'learning-runtime', 'rollback-monitoring',
]

export function requiredHostChecks(profileId) {
  if (profileId === 'chatgpt-mtls') return ['transport-accepted', 'transport-rejected', 'claude-unaffected', 'rollback-monitoring']
  return [...COMMON_HOST_CHECKS,
    ...(['chatgpt-cimd-jwt', 'claude-cimd-public', 'claude-anthropic-held'].includes(profileId)
      ? ['external-beta-installation'] : []),
    ...(profileId === 'claude-anthropic-held' ? ['anthropic-provisioning'] : []),
  ]
}

function exactKeys(value, allowed, label) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), `${label}: expected object`)
  assert.deepEqual(Object.keys(value).sort(), [...allowed].sort(), `${label}: unexpected or missing fields`)
}

function verifyEvidence(entry, repositoryRoot) {
  exactKeys(entry, ['path', 'sha256'], 'evidence')
  assert.equal(typeof entry.path, 'string', 'evidence: path must be repository-relative')
  assert.ok(/^[A-Za-z0-9_./-]+$/u.test(entry.path) && !isAbsolute(entry.path)
    && !entry.path.split('/').some(part => part === '..' || part === ''), 'evidence: unsafe path')
  assert.match(entry.sha256, /^[a-f0-9]{64}$/u, 'evidence: invalid SHA-256')
  const root = realpathSync(repositoryRoot)
  const file = realpathSync(resolve(root, entry.path))
  const withinRoot = relative(root, file)
  assert.ok(withinRoot && !withinRoot.startsWith('..') && !isAbsolute(withinRoot), 'evidence: path escapes repository')
  assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), entry.sha256,
    'evidence: artifact missing or modified')
}

export function validateReleaseLedger(ledger, { repositoryRoot, verifyArtifacts = true } = {}) {
  exactKeys(ledger, ['schemaVersion', 'profiles'], 'ledger')
  assert.equal(ledger.schemaVersion, 1, 'ledger: unsupported schema')
  assert.ok(Array.isArray(ledger.profiles), 'ledger: profiles must be an array')
  assert.deepEqual(ledger.profiles.map(profile => profile.id).sort(), [...PROFILE_IDS].sort(),
    'ledger: each known profile must occur exactly once')
  for (const profile of ledger.profiles) {
    exactKeys(profile, ['id', 'candidateCommit', 'policyRevision', 'stages'], 'profile')
    assert.ok(profile.candidateCommit === null || /^[a-f0-9]{40}$/u.test(profile.candidateCommit),
      `${profile.id}: invalid candidate commit`)
    assert.match(profile.policyRevision, /^[A-Za-z0-9._-]{1,64}$/u, `${profile.id}: invalid policy revision`)
    exactKeys(profile.stages, STAGES, `${profile.id}: stages`)
    let previousComplete = true
    for (const stage of STAGES) {
      const result = profile.stages[stage]
      if (result === null) { previousComplete = false; continue }
      assert.ok(previousComplete, `${profile.id}: ${stage} cannot precede earlier evidence`)
      exactKeys(result, ['commit', 'policyRevision', 'recordedAt', 'result', 'checks', 'evidence'], `${profile.id}: ${stage}`)
      assert.ok(profile.candidateCommit !== null && result.commit === profile.candidateCommit,
        `${profile.id}: ${stage} evidence belongs to another commit`)
      assert.equal(result.policyRevision, profile.policyRevision, `${profile.id}: stale policy evidence`)
      assert.match(result.recordedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u, 'evidence: invalid timestamp')
      assert.ok(Number.isFinite(Date.parse(result.recordedAt)) && new Date(result.recordedAt).toISOString() === result.recordedAt.replace('Z', '.000Z'),
        'evidence: invalid calendar timestamp')
      assert.equal(result.result, 'passed', `${profile.id}: only passed evidence advances a stage`)
      assert.ok(Array.isArray(result.checks) && result.checks.every(check => typeof check === 'string'
        && /^[a-z][a-z0-9-]{0,63}$/u.test(check)) && new Set(result.checks).size === result.checks.length,
      'evidence: invalid or duplicate checks')
      if (stage === 'realHost') {
        for (const check of requiredHostChecks(profile.id)) assert.ok(result.checks.includes(check),
          `${profile.id}: missing real-host check ${check}`)
      }
      assert.ok(Array.isArray(result.evidence) && result.evidence.length > 0, `${profile.id}: missing artifact evidence`)
      if (verifyArtifacts) {
        assert.ok(repositoryRoot, 'repositoryRoot required for artifact validation')
        for (const artifact of result.evidence) verifyEvidence(artifact, repositoryRoot)
      } else {
        for (const artifact of result.evidence) exactKeys(artifact, ['path', 'sha256'], 'evidence')
      }
    }
  }
  return ledger
}

export function requireProfileReady(ledger, { profileId, commit, policyRevision, repositoryRoot }) {
  // Other pending profiles are intentionally not a release blocker.
  validateReleaseLedger(ledger, { repositoryRoot, verifyArtifacts: false })
  const profile = ledger.profiles.find(entry => entry.id === profileId)
  assert.ok(profile, 'Unknown release profile')
  assert.match(commit, /^[a-f0-9]{40}$/u, 'Expected exact candidate commit')
  assert.equal(profile.candidateCommit, commit, 'Release commit does not match accepted candidate')
  assert.equal(profile.policyRevision, policyRevision, 'Release policy revision does not match acceptance')
  for (const stage of STAGES.slice(0, 3)) {
    const result = profile.stages[stage]
    assert.ok(result, `${profileId}: ${stage} evidence is pending; profile is not ready`)
    for (const artifact of result.evidence) verifyEvidence(artifact, repositoryRoot)
  }
  return profile
}

const script = fileURLToPath(import.meta.url)
if (process.argv[1] && resolve(process.argv[1]) === script) {
  try {
    const args = process.argv.slice(2)
    const options = new Map()
    for (let i = 0; i < args.length; i += 2) {
      assert.ok(['--ledger', '--profile', '--commit', '--revision'].includes(args[i])
        && args[i + 1] && !options.has(args[i]), 'Use --ledger PATH [--profile ID --commit SHA --revision REV]')
      options.set(args[i], args[i + 1])
    }
    const root = resolve(dirname(script), '..')
    const ledger = JSON.parse(readFileSync(resolve(root,
      options.get('--ledger') ?? 'contracts/oauth/client-profile-release.json'), 'utf8'))
    const selected = ['--profile', '--commit', '--revision'].filter(key => options.has(key))
    assert.ok(selected.length === 0 || selected.length === 3, '--profile, --commit and --revision must be supplied together')
    if (selected.length) {
      requireProfileReady(ledger, { profileId: options.get('--profile'), commit: options.get('--commit'),
        policyRevision: options.get('--revision'), repositoryRoot: root })
      process.stdout.write(`${options.get('--profile')}: recorded release evidence passed; no deployment performed.\n`)
    } else {
      validateReleaseLedger(ledger, { repositoryRoot: root })
      process.stdout.write('Release-bound evidence only; pending does not imply missing source implementation.\n')
      for (const profile of ledger.profiles) process.stdout.write(`${profile.id}: ${STAGES.map(stage => `${stage}=${profile.stages[stage] ? 'evidenced' : 'pending'}`).join(', ')}\n`)
    }
  } catch (error) {
    // Do not echo raw JSON, command arguments, evidence contents or credentials.
    const reason = error instanceof SyntaxError ? 'invalid ledger JSON'
      : error.code === 'ERR_ASSERTION' && !error.generatedMessage ? error.message.split('\n')[0]
        : ['ENOENT', 'EACCES', 'EISDIR', 'ENOTDIR', 'ELOOP'].includes(error.code) ? 'evidence file unavailable'
          : 'invalid ledger or arguments'
    process.stderr.write(`OAuth profile release gate failed: ${reason}\n`)
    process.exitCode = 1
  }
}
