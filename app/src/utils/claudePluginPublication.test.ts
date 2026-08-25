import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CLAUDE_PLUGIN_PUBLICATION_INDEX_URL,
  loadClaudePluginPublicationIndex,
  parseClaudePluginPublicationIndex,
} from './claudePluginPublication'

const digest = 'a'.repeat(64)
const validIndex = {
  schemaVersion: 1,
  channel: 'beta',
  preparedAt: '2026-08-25T12:00:00.000Z',
  plugins: [
    {
      id: 'skillpilot-coach-v1',
      name: 'SkillPilot Claude Coach',
      version: '1.0.2',
      status: 'beta',
      filename: 'skillpilot-coach-v1-1.0.2.plugin',
      bytes: 42_000,
      sha256: digest,
      downloadUrl: `/api/public/claude/plugins/skillpilot-coach-v1/1.0.2/sha256-${digest}/skillpilot-coach-v1-1.0.2.plugin`,
      sourceUrl: 'https://github.com/enpasos/skillpilot',
      privacyUrl: 'https://skillpilot.com/privacy',
      termsUrl: 'https://skillpilot.com/legal',
      supportEmail: 'support@skillpilot.com',
      requirements: {
        minimumAge: 18,
        plan: 'claude-pro',
        installSurface: 'claude-web',
        testedSurfaces: ['claude-web', 'claude-android'],
        voiceMode: true,
      },
    },
  ],
}

const cloneValidIndex = () => JSON.parse(JSON.stringify(validIndex)) as typeof validIndex

const parsed = parseClaudePluginPublicationIndex(validIndex)
assert.equal(CLAUDE_PLUGIN_PUBLICATION_INDEX_URL, '/api/public/claude/plugins/index.json')
assert.equal(parsed.schemaVersion, 1)
assert.equal(parsed.channel, 'beta')
assert.equal(parsed.plugins[0]?.requirements.minimumAge, 18)
assert.equal(parsed.plugins[0]?.requirements.voiceMode, true)
assert.deepEqual(parsed.plugins[0]?.requirements.testedSurfaces, ['claude-web', 'claude-android'])

const originalFetch = globalThis.fetch
let requestedUrl = ''
globalThis.fetch = async (input, init) => {
  requestedUrl = String(input)
  assert.equal(init?.method, 'GET')
  assert.equal(init?.cache, 'no-store')
  return new Response(JSON.stringify(validIndex), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}
try {
  const loaded = await loadClaudePluginPublicationIndex()
  assert.equal(requestedUrl, CLAUDE_PLUGIN_PUBLICATION_INDEX_URL)
  assert.equal(loaded.plugins[0]?.version, '1.0.2')
} finally {
  globalThis.fetch = originalFetch
}

const wrongSchema = cloneValidIndex()
wrongSchema.schemaVersion = 2
assert.throws(
  () => parseClaudePluginPublicationIndex(wrongSchema),
  /schemaVersion must equal 1/u,
)

const wrongChannel = cloneValidIndex()
wrongChannel.channel = 'stable'
assert.throws(
  () => parseClaudePluginPublicationIndex(wrongChannel),
  /channel must equal beta/u,
)

const extraRootField = cloneValidIndex() as typeof validIndex & { unexpected?: boolean }
extraRootField.unexpected = true
assert.throws(
  () => parseClaudePluginPublicationIndex(extraRootField),
  /root must contain exactly/u,
)

const noPlugins = cloneValidIndex()
noPlugins.plugins = []
assert.throws(
  () => parseClaudePluginPublicationIndex(noPlugins),
  /plugins must contain exactly one plugin/u,
)

const duplicatePlugin = cloneValidIndex()
duplicatePlugin.plugins.push(structuredClone(duplicatePlugin.plugins[0]!))
assert.throws(
  () => parseClaudePluginPublicationIndex(duplicatePlugin),
  /plugins must contain exactly one plugin/u,
)

const nonCanonicalTimestamp = cloneValidIndex()
nonCanonicalTimestamp.preparedAt = '2026-08-25T12:00:00Z'
assert.throws(
  () => parseClaudePluginPublicationIndex(nonCanonicalTimestamp),
  /preparedAt must be a canonical UTC date-time/u,
)

const emptySurfaces = cloneValidIndex()
emptySurfaces.plugins[0]!.requirements.testedSurfaces = []
assert.throws(
  () => parseClaudePluginPublicationIndex(emptySurfaces),
  /testedSurfaces must be a non-empty string array/u,
)

const duplicateSurfaces = cloneValidIndex()
duplicateSurfaces.plugins[0]!.requirements.testedSurfaces = ['claude-web', 'claude-web']
assert.throws(
  () => parseClaudePluginPublicationIndex(duplicateSurfaces),
  /testedSurfaces must not contain duplicates/u,
)

const underAge = cloneValidIndex()
underAge.plugins[0]!.requirements.minimumAge = 0
assert.throws(
  () => parseClaudePluginPublicationIndex(underAge),
  /minimumAge must be a safe integer of at least 18/u,
)

const stringVoiceMode = cloneValidIndex() as unknown as {
  plugins: Array<{ requirements: { voiceMode: unknown } }>
}
stringVoiceMode.plugins[0]!.requirements.voiceMode = 'beta-tested'
assert.throws(
  () => parseClaudePluginPublicationIndex(stringVoiceMode),
  /voiceMode must be a boolean/u,
)

const unsafeDownload = cloneValidIndex()
unsafeDownload.plugins[0]!.downloadUrl = 'javascript:alert(1)'
assert.throws(
  () => parseClaudePluginPublicationIndex(unsafeDownload),
  /downloadUrl must be a canonical root-relative URL/u,
)

const nonCanonicalDownload = cloneValidIndex()
nonCanonicalDownload.plugins[0]!.downloadUrl = '/api/public/claude/plugins/skillpilot-coach-v1-1.0.2.plugin'
assert.throws(
  () => parseClaudePluginPublicationIndex(nonCanonicalDownload),
  /downloadUrl must match the versioned SHA-256 artifact path/u,
)

const insecureSource = cloneValidIndex()
insecureSource.plugins[0]!.sourceUrl = 'http://github.com/enpasos/skillpilot'
assert.throws(
  () => parseClaudePluginPublicationIndex(insecureSource),
  /sourceUrl must be an HTTPS URL without credentials/u,
)

const zeroBytes = cloneValidIndex()
zeroBytes.plugins[0]!.bytes = 0
assert.throws(
  () => parseClaudePluginPublicationIndex(zeroBytes),
  /bytes must be a positive safe integer/u,
)

const malformedDigest = cloneValidIndex()
malformedDigest.plugins[0]!.sha256 = 'not-a-sha256'
assert.throws(
  () => parseClaudePluginPublicationIndex(malformedDigest),
  /sha256 must contain 64 hexadecimal characters/u,
)

const productionIndexPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../backend/src/main/resources/claude-plugin-publication/index.json',
)
const productionIndex = parseClaudePluginPublicationIndex(
  JSON.parse(readFileSync(productionIndexPath, 'utf8')) as unknown,
)
assert.equal(productionIndex.plugins.length, 1)
assert.equal(productionIndex.plugins[0]?.id, 'skillpilot-coach-v1')
assert.equal(productionIndex.plugins[0]?.requirements.plan, 'claude-pro')

console.log('Claude plugin publication index tests passed')
