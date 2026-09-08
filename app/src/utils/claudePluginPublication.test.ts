import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CLAUDE_CONNECTOR_PRIVACY_URL,
  CLAUDE_MARKETPLACE_INSTALLATION_ENABLED,
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  CLAUDE_PLUGIN_BETA_REQUIREMENTS,
  CLAUDE_PLUGIN_CURRENT_VERSION,
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
      version: '1.1.1',
      status: 'beta',
      filename: 'skillpilot-coach-v1-1.1.1.plugin',
      bytes: 42_000,
      sha256: digest,
      downloadUrl: `/api/public/claude/plugins/skillpilot-coach-v1/1.1.1/sha256-${digest}/skillpilot-coach-v1-1.1.1.plugin`,
      sourceUrl: 'https://github.com/enpasos/skillpilot',
      privacyUrl: 'https://skillpilot.com/privacy',
      termsUrl: 'https://skillpilot.com/legal',
      supportEmail: 'support@skillpilot.com',
      requirements: {
        minimumAge: 18,
        plan: 'claude-pro',
        installSurface: 'claude-web',
        testedSurfaces: [] as string[],
        voiceMode: false,
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
assert.equal(parsed.plugins[0]?.requirements.voiceMode, false)
assert.deepEqual(parsed.plugins[0]?.requirements.testedSurfaces, [])

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
  assert.equal(loaded.plugins[0]?.version, CLAUDE_PLUGIN_CURRENT_VERSION)
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

const nonArraySurfaces = cloneValidIndex() as unknown as {
  plugins: Array<{ requirements: { testedSurfaces: unknown } }>
}
nonArraySurfaces.plugins[0]!.requirements.testedSurfaces = 'claude-web'
assert.throws(
  () => parseClaudePluginPublicationIndex(nonArraySurfaces),
  /testedSurfaces must be a string array/u,
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
nonCanonicalDownload.plugins[0]!.downloadUrl = '/api/public/claude/plugins/skillpilot-coach-v1-1.1.1.plugin'
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

for (const retiredVersion of ['1.0.4', '1.1.0']) {
  const staleVersion = cloneValidIndex()
  staleVersion.plugins[0]!.version = retiredVersion
  staleVersion.plugins[0]!.filename = `skillpilot-coach-v1-${retiredVersion}.plugin`
  staleVersion.plugins[0]!.downloadUrl = `/api/public/claude/plugins/skillpilot-coach-v1/${retiredVersion}/sha256-${digest}/skillpilot-coach-v1-${retiredVersion}.plugin`
  assert.throws(
    () => parseClaudePluginPublicationIndex(staleVersion),
    /version must equal 1\.1\.1/u,
    `the first-party guide must fail closed instead of offering historical Claude ${retiredVersion}`,
  )
}

const wrongPlugin = cloneValidIndex()
wrongPlugin.plugins[0]!.id = 'different-plugin'
wrongPlugin.plugins[0]!.filename = 'different-plugin-1.1.1.plugin'
wrongPlugin.plugins[0]!.downloadUrl = `/api/public/claude/plugins/different-plugin/1.1.1/sha256-${digest}/different-plugin-1.1.1.plugin`
assert.throws(
  () => parseClaudePluginPublicationIndex(wrongPlugin),
  /id must equal skillpilot-coach-v1/u,
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
assert.equal(productionIndex.plugins[0]?.version, CLAUDE_PLUGIN_CURRENT_VERSION)
assert.equal(productionIndex.plugins[0]?.requirements.plan, 'claude-pro')
assert.deepEqual(productionIndex.plugins[0]?.requirements, CLAUDE_PLUGIN_BETA_REQUIREMENTS)
assert.equal(productionIndex.plugins[0]?.privacyUrl, CLAUDE_CONNECTOR_PRIVACY_URL)

const marketplaceLanePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json',
)
const marketplaceLane = JSON.parse(readFileSync(marketplaceLanePath, 'utf8')) as {
  target?: { repositoryUrl?: string }
  plugin?: { version?: string, directInstallSha256?: string }
  activation?: {
    state?: string
    firstPartyUiRoute?: string
    marketplaceUiSwitchAllowed?: boolean
    firstPartyGuideDecision?: {
      status?: string
      candidateVersion?: string
      candidateSha256?: string
      repositoryRevision?: string
      repositoryTreeSha256?: string
    }
    evidence?: Array<{
      id?: string
      status?: string
      candidateVersion?: string
      candidateSha256?: string
      revision?: string
      treeSha256?: string
    }>
  }
}
assert.equal(
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  marketplaceLane.target?.repositoryUrl,
  'the marketplace guide must use the verified canonical repository URL',
)
assert.equal(marketplaceLane.plugin?.version, CLAUDE_PLUGIN_CURRENT_VERSION)
assert.equal(marketplaceLane.plugin?.directInstallSha256, productionIndex.plugins[0]?.sha256)
assert.equal(marketplaceLane.activation?.state, 'published_pending_acceptance')
assert.equal(
  marketplaceLane.activation?.firstPartyUiRoute,
  'controlled_direct_install_beta',
  'Claude 1.1.1 installation and updates use the current file while Marketplace is unreliable',
)
assert.equal(
  marketplaceLane.activation?.marketplaceUiSwitchAllowed,
  false,
  'the withdrawn guide decision must not enable Marketplace installation',
)
const guideDecision = marketplaceLane.activation?.firstPartyGuideDecision
assert.equal(guideDecision?.status, 'withdrawn')
assert.equal(guideDecision?.candidateVersion, CLAUDE_PLUGIN_CURRENT_VERSION)
assert.equal(guideDecision?.candidateSha256, productionIndex.plugins[0]?.sha256)
assert.match(guideDecision?.repositoryRevision ?? '', /^[a-f0-9]{40}$/u)
assert.equal(
  guideDecision?.repositoryTreeSha256,
  '8c6c67b46763224d901a65b35408dad7752f6c7db08203fd38cf0f568a74c5d3',
  'the guide must be bound to the exact immutable 1.1.1 marketplace tree',
)
const repositoryEvidence = marketplaceLane.activation?.evidence?.find(
  evidence => evidence.id === 'public-repository-default-branch',
)
assert.equal(repositoryEvidence?.status, 'pass')
assert.equal(repositoryEvidence?.candidateVersion, CLAUDE_PLUGIN_CURRENT_VERSION)
assert.equal(repositoryEvidence?.candidateSha256, productionIndex.plugins[0]?.sha256)
assert.equal(repositoryEvidence?.revision, guideDecision?.repositoryRevision)
assert.equal(repositoryEvidence?.treeSha256, guideDecision?.repositoryTreeSha256)
for (const pendingEvidenceId of [
  'clean-account-marketplace-install',
  'uploaded-plugin-migration-and-marketplace-refresh',
]) {
  assert.equal(
    marketplaceLane.activation?.evidence?.find(evidence => evidence.id === pendingEvidenceId)?.status,
    'pending',
    'repository publication must not claim unperformed real-client acceptance',
  )
}
assert.equal(CLAUDE_MARKETPLACE_INSTALLATION_ENABLED, false)

const pluginCatalogSource = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../views/PluginCatalogView.tsx',
  ),
  'utf8',
)
const directGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-direct-upload-guide"')
const updateGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-update-guide"')
const requirementsIndex = pluginCatalogSource.indexOf('aria-labelledby={`${cardId}-requirements`}')
assert(updateGuideIndex >= 0 && directGuideIndex > updateGuideIndex && requirementsIndex > directGuideIndex,
  'version comparison and the primary upload guide precede secondary requirements')
assert.match(pluginCatalogSource, /download=\{plugin\.filename\}/u)
assert.match(pluginCatalogSource, /href=\{plugin\.downloadUrl\}/u)
assert.doesNotMatch(pluginCatalogSource, /navigator\.clipboard/u)
assert.match(pluginCatalogSource, /const requirements = plugin\?\.requirements \?\? CLAUDE_PLUGIN_BETA_REQUIREMENTS/u)
assert.doesNotMatch(pluginCatalogSource, /\{plugin && \(\s*<section aria-labelledby=\{`\$\{cardId\}-requirements`\}/u)
for (const requiredNavigationCopy of [
  'Einrichtung mit Plugin-Datei',
  'Lade zuerst die aktuelle Datei herunter, bevor du eine alte Installation entfernst',
  'Marketplace-Einrichtung und ihre Updates funktionieren noch nicht zuverlässig',
  'Bereits installiert? Version vergleichen',
  'Wird 1.1.1 angezeigt, ist kein erneuter Upload nötig',
  'die zuvor heruntergeladene .plugin-Datei unverändert hoch',
  'auch wenn sie aus dem Marketplace stammt',
  'Andere Plugins und Konnektoren bleiben unverändert',
  'keinen zweiten manuellen SkillPilot-Konnektor',
  'keine MCP-URL',
  'nicht automatisch auslesen',
  'Zurück zu SkillPilot',
  'Set up with the plugin file',
  'Download the current file before removing an older installation',
  'Marketplace setup and updates are not yet reliable',
  'If it shows 1.1.1, no new upload is needed',
  'including a marketplace installation',
  'Leave other plugins and connectors unchanged',
  'Upload the previously downloaded .plugin file without modifying it',
  'Do not add a second manual SkillPilot connector',
  'cannot currently read the plugin version installed in your Claude account automatically',
  'Return to SkillPilot',
]) {
  assert(pluginCatalogSource.includes(requiredNavigationCopy),
    `plugin guide contains the required Claude Web navigation copy: ${requiredNavigationCopy}`)
}
assert.match(pluginCatalogSource, /to="\/"/u)
assert.match(pluginCatalogSource, /Claude Pro/u)
assert.match(pluginCatalogSource, /Android/u)
assert.match(pluginCatalogSource, /Voice Mode|Voice mode/u)
assert.doesNotMatch(pluginCatalogSource, /claude-plugin-marketplace|stepMarketplace|CLAUDE_MARKETPLACE_REPOSITORY_URL/u,
  'the withdrawn Marketplace guide must not retain hidden installation instructions')
assert.doesNotMatch(pluginCatalogSource, /mcp-claude-v1\.skillpilot\.com/u)
assert.doesNotMatch(pluginCatalogSource, /benutzerdefinierten Konnektor hinzufügen|Add custom connector/u)
assert.doesNotMatch(pluginCatalogSource, /Löschen, Neuinstallieren oder Datei-Upload sind keine bestätigten Updatewege|Removal, reinstallation, or file upload are not confirmed update routes/u)

console.log('Claude plugin publication index tests passed')
