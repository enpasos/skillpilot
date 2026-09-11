import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { PROFILE_IDS, requiredHostChecks, requireProfileReady, validateReleaseLedger } from './check_oauth_profile_release.mjs'

const template = JSON.parse(readFileSync(new URL('../contracts/oauth/client-profile-release.json', import.meta.url), 'utf8'))
const commit = '1'.repeat(40)

function fixture(callback) {
  const directory = mkdtempSync(join(tmpdir(), 'skillpilot-oauth-release-'))
  const content = 'Synthetic test evidence; this is not a host acceptance.\n'
  try {
    writeFileSync(join(directory, 'evidence.txt'), content)
    const ledger = structuredClone(template)
    const profile = ledger.profiles[0]
    profile.candidateCommit = commit
    for (const stage of ['implementation', 'technical', 'realHost']) {
      profile.stages[stage] = { commit, policyRevision: '1', recordedAt: '2026-09-11T12:00:00Z', result: 'passed',
        checks: stage === 'realHost' ? requiredHostChecks(profile.id) : [],
        evidence: [{ path: 'evidence.txt', sha256: createHash('sha256').update(content).digest('hex') }] }
    }
    callback({ directory, ledger, profile, options: { profileId: profile.id, commit, policyRevision: '1', repositoryRoot: directory } })
  } finally { rmSync(directory, { recursive: true, force: true }) }
}

test('pending release ledger is valid but never claims profile acceptance', () => {
  assert.equal(validateReleaseLedger(template), template)
  for (const profileId of PROFILE_IDS) assert.throws(() => requireProfileReady(template,
    { profileId, commit, policyRevision: '1' }))
})

test('one accepted profile does not depend on other pending providers or production activation', () => {
  fixture(({ ledger, profile, options }) => {
    assert.equal(requireProfileReady(ledger, options), profile)
    assert.equal(profile.stages.production, null)
    assert.equal(ledger.profiles.find(entry => entry.id === 'claude-anthropic-held').stages.realHost, null)
  })
})

test('release evidence must belong to the exact commit and policy revision', () => {
  fixture(({ ledger, profile, options }) => {
    assert.throws(() => requireProfileReady(ledger, { ...options, commit: '2'.repeat(40) }))
    assert.throws(() => requireProfileReady(ledger, { ...options, policyRevision: '2' }))
    profile.stages.technical.commit = '2'.repeat(40)
    assert.throws(() => requireProfileReady(ledger, options))
  })
})

test('technical simulations do not substitute for real-host or external beta installation', () => {
  fixture(({ ledger, profile, options }) => {
    profile.stages.realHost.checks = profile.stages.realHost.checks.filter(check => check !== 'external-beta-installation')
    assert.throws(() => requireProfileReady(ledger, options), /external-beta-installation/u)
    profile.stages.realHost = null
    assert.throws(() => requireProfileReady(ledger, options), /realHost evidence is pending/u)
  })
})

test('each host lifecycle, security and rollback check is mandatory', () => {
  fixture(({ ledger, profile, options }) => {
    const checks = [...profile.stages.realHost.checks]
    for (const check of checks) {
      profile.stages.realHost.checks = checks.filter(value => value !== check)
      assert.throws(() => requireProfileReady(ledger, options), undefined, check)
    }
  })
})

test('Anthropic-held setup requires provisioning while controlled custom setup does not', () => {
  assert.ok(requiredHostChecks('claude-anthropic-held').includes('anthropic-provisioning'))
  assert.ok(!requiredHostChecks('claude-custom-confidential').includes('anthropic-provisioning'))
  assert.ok(!requiredHostChecks('claude-custom-confidential').includes('external-beta-installation'))
  assert.deepEqual(requiredHostChecks('chatgpt-mtls'), ['transport-accepted', 'transport-rejected', 'claude-unaffected', 'rollback-monitoring'])
})

test('stages cannot skip technical checks or turn absent evidence into a pass', () => {
  fixture(({ ledger, profile, options }) => {
    const result = profile.stages.technical
    profile.stages.technical = null
    assert.throws(() => requireProfileReady(ledger, options), /cannot precede/u)
    profile.stages.technical = result
    result.evidence = []
    assert.throws(() => requireProfileReady(ledger, options), /missing artifact evidence/u)
  })
})

test('artifacts must exist and retain the reviewed hash', () => {
  fixture(({ directory, ledger, options }) => {
    writeFileSync(join(directory, 'evidence.txt'), 'modified')
    assert.throws(() => requireProfileReady(ledger, options), /modified/u)
    rmSync(join(directory, 'evidence.txt'))
    assert.throws(() => requireProfileReady(ledger, options))
  })
})

test('artifact paths cannot escape the repository directly or by symlink', () => {
  fixture(({ directory, ledger, profile, options }) => {
    for (const path of ['../evidence.txt', '/etc/passwd', 'https://example.com/evidence', './secrets?token=secret']) {
      profile.stages.technical.evidence[0].path = path
      assert.throws(() => requireProfileReady(ledger, options), /unsafe path/u)
    }
    symlinkSync('/etc/passwd', join(directory, 'outside.txt'))
    profile.stages.technical.evidence[0].path = 'outside.txt'
    assert.throws(() => requireProfileReady(ledger, options), /escapes repository/u)
  })
})

test('unknown fields and duplicate, missing or unknown profiles are rejected', () => {
  for (const change of [
    ledger => { ledger.secret = 'must-not-appear' },
    ledger => { ledger.profiles.push(structuredClone(ledger.profiles[0])) },
    ledger => { ledger.profiles.pop() },
    ledger => { ledger.profiles[0].id = 'unknown' },
  ]) {
    const ledger = structuredClone(template)
    change(ledger)
    assert.throws(() => validateReleaseLedger(ledger))
  }
})

test('CLI fails closed without echoing malformed JSON or credential-shaped input', () => {
  fixture(({ directory }) => {
    const path = join(directory, 'invalid.json')
    const sentinel = 'private-credential-must-not-be-printed'
    writeFileSync(path, `{ "client_secret": "${sentinel}" BROKEN }`)
    const result = spawnSync(process.execPath, [new URL('./check_oauth_profile_release.mjs', import.meta.url).pathname,
      '--ledger', path], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /invalid ledger JSON/u)
    assert.ok(!`${result.stdout}${result.stderr}`.includes(sentinel))
    writeFileSync(path, JSON.stringify(template))
    const pending = spawnSync(process.execPath, [new URL('./check_oauth_profile_release.mjs', import.meta.url).pathname,
      '--ledger', path, '--profile', PROFILE_IDS[0], '--commit', commit, '--revision', '1'], { encoding: 'utf8' })
    assert.equal(pending.status, 1)
    assert.match(pending.stderr, /Release commit does not match accepted candidate/u)
  })
})
