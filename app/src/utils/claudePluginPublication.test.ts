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
  'personal_git_marketplace',
  'Claude 1.1.1 installation and updates must use the verified marketplace',
)
assert.equal(
  marketplaceLane.activation?.marketplaceUiSwitchAllowed,
  true,
  'the marketplace guide needs the candidate-bound Product Owner decision',
)
const guideDecision = marketplaceLane.activation?.firstPartyGuideDecision
assert.equal(guideDecision?.status, 'approved')
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
assert.equal(CLAUDE_MARKETPLACE_INSTALLATION_ENABLED, true)

const pluginCatalogSource = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../views/PluginCatalogView.tsx',
  ),
  'utf8',
)
const directGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-direct-upload-guide"')
const marketplaceGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-install-guide"')
const marketplaceUpdateIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-marketplace-update-guide"')
const requirementsIndex = pluginCatalogSource.indexOf('aria-labelledby={`${cardId}-requirements`}')
assert(
  marketplaceUpdateIndex >= 0
  && marketplaceGuideIndex > marketplaceUpdateIndex
  && directGuideIndex > marketplaceGuideIndex
  && requirementsIndex > directGuideIndex,
  'marketplace updates and installation must precede secondary requirements',
)
assert.match(
  pluginCatalogSource,
  /!CLAUDE_MARKETPLACE_INSTALLATION_ENABLED && \(\s*<section\s*data-testid="claude-plugin-direct-upload-guide"/u,
  'the direct-upload guide must be hidden while marketplace installation is enabled',
)
assert.match(pluginCatalogSource, /download=\{plugin\.filename\}/u)
assert.match(pluginCatalogSource, /CLAUDE_MARKETPLACE_INSTALLATION_ENABLED &&/u)
assert.match(pluginCatalogSource, /navigator\.clipboard\.writeText\(CLAUDE_MARKETPLACE_REPOSITORY_URL\)/u)
assert.doesNotMatch(pluginCatalogSource, /navigator\.clipboard\.read/u)
assert.match(pluginCatalogSource, /const requirements = plugin\?\.requirements \?\? CLAUDE_PLUGIN_BETA_REQUIREMENTS/u)
assert.doesNotMatch(pluginCatalogSource, /\{plugin && \(\s*<section aria-labelledby=\{`\$\{cardId\}-requirements`\}/u)
assert.match(pluginCatalogSource, /testId="claude-plugin-marketplace-install-navigation"/u)
for (const requiredNavigationCopy of [
  'Claude-Beta 1.1.1',
  'planorientierte Version 1.1.1 ersetzt die bisherige Claude-Variante vollständig',
  'Version 1.1.1 wird über den persönlichen SkillPilot Marketplace bereitgestellt',
  'Marketplace hinzufügen',
  'Neue Marketplace-Einrichtung',
  'Diese fünf Schritte gelten für eine neue Marketplace-Einrichtung',
  'Aus einem Repository hinzufügen',
  'Lass „Automatisch synchronisieren“ eingeschaltet',
  'Klicke anschließend auf „Synchronisieren“',
  'Bestehende Installation: Version prüfen',
  'Das erneute Hinzufügen meldet „Dieser Marketplace wurde bereits hinzugefügt“ und bestätigt kein Update',
  'Ein manueller Aktualisierungsweg für bestehende Quellen in Claude Web ist noch nicht bestätigt',
  'Erst mit 1.1.1 und verbundenem SkillPilot-Konnektor kehrst du zu SkillPilot zurück',
  'Wird weiterhin 1.0.4 angezeigt, verwende diese Installation nicht als aktuelle Version',
  'Löschen, Neuinstallieren oder Datei-Upload sind keine bestätigten Updatewege',
  'Andere Plugins und Konnektoren bleiben unverändert',
  'keinen zweiten manuellen SkillPilot-Konnektor',
  'keine MCP-URL',
  'kandidatengenaue Abnahme von Installation, Migration und Updates in Claude steht noch aus',
  'Claude beta 1.1.1',
  'plan-first version 1.1.1 fully replaces the previous Claude variant',
  'Version 1.1.1 is provided through the personal SkillPilot Marketplace',
  'Add marketplace',
  'New marketplace setup',
  'English control names below translate the observed German dialog',
  'Keep automatic synchronization enabled',
  'Then choose Synchronize (“Synchronisieren”)',
  'Existing installation: check the version',
  'this does not confirm an update',
  'A manual update route for existing sources in Claude Web is not yet confirmed',
  'return to SkillPilot and start a new session only with version 1.1.1',
  'If version 1.0.4 is still displayed, do not use that installation as the current version',
  'Removal, reinstallation, or file upload are not confirmed update routes',
  'Leave other plugins and connectors unchanged',
  'Do not add a second manual SkillPilot connector',
  'enter an MCP URL',
  'Exact-candidate acceptance of installation, migration, and updates in Claude is still pending',
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
assert.doesNotMatch(pluginCatalogSource, /claude-plugin-direct-upload-fallback/u)
assert.doesNotMatch(pluginCatalogSource, /mcp-claude-v1\.skillpilot\.com/u)
assert.doesNotMatch(pluginCatalogSource, /benutzerdefinierten Konnektor hinzufügen|Add custom connector/u)
assert.doesNotMatch(pluginCatalogSource, /Beta-Download|Beta download/u)
assert.doesNotMatch(pluginCatalogSource, /aktuell von SkillPilot unterstützte Beta-Weg|beta route currently supported/u)
assert.equal(
  [...pluginCatalogSource.matchAll(/1\.0\.4/gu)].length,
  2,
  'historical 1.0.4 appears only in the DE/EN notices that it is not the current version',
)
assert.doesNotMatch(
  pluginCatalogSource,
  /wähle „Aktualisieren“|select Update|den vorhandenen „SkillPilot Marketplace“|open the existing SkillPilot Marketplace|öffne den bestehenden Eintrag|open the existing entry/u,
  'the guide must not invent a Web update control or an existing-marketplace entry path',
)
assert.doesNotMatch(pluginCatalogSource, /Updates erfolgen.*erneuten Download und Upload|updates require downloading and uploading/u)

console.log('Claude plugin publication index tests passed')
