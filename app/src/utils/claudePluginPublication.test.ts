import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CLAUDE_CONNECTOR_PRIVACY_URL,
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  CLAUDE_PLUGIN_BETA_REQUIREMENTS,
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
assert.deepEqual(productionIndex.plugins[0]?.requirements, CLAUDE_PLUGIN_BETA_REQUIREMENTS)
assert.equal(productionIndex.plugins[0]?.privacyUrl, CLAUDE_CONNECTOR_PRIVACY_URL)

const marketplaceLanePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json',
)
const marketplaceLane = JSON.parse(readFileSync(marketplaceLanePath, 'utf8')) as {
  target?: { repositoryUrl?: string }
  activation?: {
    firstPartyUiRoute?: string
    marketplaceUiSwitchAllowed?: boolean
    firstPartyGuideDecision?: { status?: string }
  }
}
assert.equal(
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  marketplaceLane.target?.repositoryUrl,
  'the first-party guide must use the repository URL from the marketplace publication lane',
)
assert.equal(
  marketplaceLane.activation?.firstPartyUiRoute,
  'personal_git_marketplace',
  'the Marketplace-first guide requires the personal Git marketplace route',
)
assert.equal(
  marketplaceLane.activation?.marketplaceUiSwitchAllowed,
  true,
  'the Marketplace-first guide must remain fail-closed without an approved UI switch',
)
assert.equal(
  marketplaceLane.activation?.firstPartyGuideDecision?.status,
  'approved',
  'the Marketplace-first guide requires an explicit Product Owner decision',
)

const pluginCatalogSource = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../views/PluginCatalogView.tsx',
  ),
  'utf8',
)
const openStepIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-install-step-open"')
const marketplaceStepIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-install-step-marketplace"')
const installStepIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-install-step-install"')
const connectorStepIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-install-step-connector"')
const returnStepIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-install-step-return"')
const fallbackIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-direct-upload-fallback"')
const fallbackDownloadIndex = pluginCatalogSource.indexOf('href={plugin.downloadUrl}')
assert.match(pluginCatalogSource, /data-testid="claude-plugin-install-guide"/u)
assert(
  openStepIndex >= 0
    && openStepIndex < marketplaceStepIndex
    && marketplaceStepIndex < installStepIndex
    && installStepIndex < connectorStepIndex
    && connectorStepIndex < returnStepIndex,
  'the primary guide orders plugin navigation, marketplace addition, installation, bundled connector activation, and return',
)
assert(
  fallbackIndex > returnStepIndex && fallbackDownloadIndex > fallbackIndex,
  'the direct download remains available only after the complete marketplace guide in the labelled fallback',
)
assert.match(pluginCatalogSource, /download=\{plugin\.filename\}/u)
assert.match(pluginCatalogSource, /href="https:\/\/claude\.ai"/u)
assert.match(pluginCatalogSource, /value=\{CLAUDE_MARKETPLACE_REPOSITORY_URL\}/u)
assert.match(pluginCatalogSource, /navigator\.clipboard\.writeText\(CLAUDE_MARKETPLACE_REPOSITORY_URL\)/u)
assert.match(pluginCatalogSource, /const requirements = plugin\?\.requirements \?\? CLAUDE_PLUGIN_BETA_REQUIREMENTS/u)
assert.doesNotMatch(pluginCatalogSource, /\{plugin && \(\s*<section aria-labelledby=\{`\$\{cardId\}-requirements`\}/u)
assert.match(pluginCatalogSource, /testId="claude-plugin-marketplace-open-navigation"/u)
assert.match(pluginCatalogSource, /testId="claude-plugin-marketplace-install-navigation"/u)
assert.match(pluginCatalogSource, /testId="claude-plugin-connector-navigation"/u)
assert.match(pluginCatalogSource, /testId="claude-plugin-direct-upload-navigation"/u)
for (const requiredNavigationCopy of [
  'Marketplace-Beta',
  'empfohlene Installations- und Updateweg',
  '„Anpassen“ (Customize) → „Plugins“ → „Deine Plugins“ (Your plugins)',
  'entferne nur dieses alte SkillPilot-Plugin',
  'Entferne keine anderen Plugins und trenne vorhandene Konnektoren nicht manuell',
  '„Marketplace hinzufügen“',
  '„Aus einem Repository hinzufügen“',
  'SkillPilot Marketplace hinzufügen',
  'Adresse kopieren',
  'Adresse kopiert',
  'SkillPilot Coach installieren',
  '„SkillPilot Coach v1“ und klicke auf „Installieren“',
  'Enthaltenen SkillPilot-Konnektor verbinden',
  'Tab „Konnektoren“ (Connectors)',
  'klicke auf „Verbinden“ (Connect)',
  'Anmeldung und Freigabe ab',
  'keinen zweiten manuellen SkillPilot-Konnektor',
  'keine MCP-URL',
  'Updates über den Marketplace',
  'Ein erneuter Datei-Upload ist nicht erforderlich',
  'Direkt-Upload nur als Fallback',
  'Marketplace- und Datei-Version nicht gleichzeitig',
  'Marketplace beta',
  'recommended installation and update route',
  'Customize → Plugins → Your plugins',
  'remove only that old SkillPilot plugin',
  'Do not remove other plugins or manually disconnect existing connectors',
  'Add marketplace',
  'Add from a repository',
  'Add the SkillPilot Marketplace',
  'Copy address',
  'Address copied',
  'Install SkillPilot Coach',
  'Select SkillPilot Coach v1 and choose Install',
  'Connect the bundled SkillPilot connector',
  'open its Connectors tab',
  'select Connect',
  'complete sign-in and approval',
  'Do not add a second manual SkillPilot connector',
  'enter an MCP URL',
  'Updates through the marketplace',
  'No new file upload is required',
  'Direct upload only as a fallback',
  'Do not install the marketplace and file-uploaded versions at the same time',
  'not curated or verified by Anthropic',
]) {
  assert(
    pluginCatalogSource.includes(requiredNavigationCopy),
    `plugin guide contains the required Claude Web navigation copy: ${requiredNavigationCopy}`,
  )
}
assert.match(pluginCatalogSource, /to="\/"/u)
assert.match(pluginCatalogSource, /Claude Pro/u)
assert.match(pluginCatalogSource, /Android/u)
assert.match(pluginCatalogSource, /Voice Mode|Voice mode/u)
assert.match(pluginCatalogSource, /<details/u)
assert.doesNotMatch(pluginCatalogSource, /mcp-claude-v1\.skillpilot\.com/u)
assert.doesNotMatch(pluginCatalogSource, /benutzerdefinierten Konnektor hinzufügen|Add custom connector/u)
assert.doesNotMatch(pluginCatalogSource, /Beta-Download|Beta download/u)
assert.doesNotMatch(pluginCatalogSource, /aktuell von SkillPilot unterstützte Beta-Weg|beta route currently supported/u)

console.log('Claude plugin publication index tests passed')
