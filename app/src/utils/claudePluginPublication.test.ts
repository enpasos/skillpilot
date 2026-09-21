import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CLAUDE_CONNECTOR_PRIVACY_URL,
  CLAUDE_MARKETPLACE_INSTALLATION_ENABLED,
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  CLAUDE_PLUGINS_DISCOVER_URL,
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
      version: '1.1.2',
      status: 'beta',
      filename: 'skillpilot-coach-v1-1.1.2.plugin',
      bytes: 42_000,
      sha256: digest,
      downloadUrl: `/api/public/claude/plugins/skillpilot-coach-v1/1.1.2/sha256-${digest}/skillpilot-coach-v1-1.1.2.plugin`,
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
const indexForVersion = (version: string) => {
  const index = cloneValidIndex()
  const plugin = index.plugins[0]!
  plugin.version = version
  plugin.filename = `${plugin.id}-${version}.plugin`
  plugin.downloadUrl = `/api/public/claude/plugins/${plugin.id}/${version}/sha256-${plugin.sha256}/${plugin.filename}`
  return index
}

const parsed = parseClaudePluginPublicationIndex(validIndex)
assert.equal(CLAUDE_PLUGIN_PUBLICATION_INDEX_URL, '/api/public/claude/plugins/index.json')
assert.equal(CLAUDE_PLUGINS_DISCOVER_URL, 'https://claude.ai/new#customize/plugins/discover')
assert.equal(CLAUDE_MARKETPLACE_REPOSITORY_URL, 'https://github.com/enpasos/skillpilot-claude-marketplace')
assert.equal(parsed.schemaVersion, 1)
assert.equal(parsed.channel, 'beta')
assert.equal(parsed.plugins[0]?.requirements.minimumAge, 18)
assert.equal(parsed.plugins[0]?.requirements.voiceMode, false)
assert.deepEqual(parsed.plugins[0]?.requirements.testedSurfaces, [])
for (const version of ['1.1.2', '1.1.3', '1.1.4', '1.1.5', '1.2.0']) {
  const current = parseClaudePluginPublicationIndex(indexForVersion(version)).plugins[0]!
  assert.equal(current.version, version, 'the publication index selects compatible newer versions without a frontend rebuild')
  assert.equal(current.filename, `skillpilot-coach-v1-${version}.plugin`)
}

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
  assert.equal(loaded.plugins[0]?.version, validIndex.plugins[0]!.version)
  globalThis.fetch = async () => new Response('{}', { status: 503 })
  await assert.rejects(loadClaudePluginPublicationIndex(), /HTTP 503/u)
  globalThis.fetch = async () => new Response('not json', { status: 200 })
  await assert.rejects(loadClaudePluginPublicationIndex(), SyntaxError)
  globalThis.fetch = async () => new Response(JSON.stringify(indexForVersion('2.0.0')), { status: 200 })
  await assert.rejects(loadClaudePluginPublicationIndex(), /compatible 1\.x release/u)
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
nonCanonicalDownload.plugins[0]!.downloadUrl = '/api/public/claude/plugins/skillpilot-coach-v1-1.1.2.plugin'
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
for (const bytes of [50 * 1024 * 1024 + 1, 1.5, Number.MAX_SAFE_INTEGER + 1]) {
  const oversized = cloneValidIndex()
  oversized.plugins[0]!.bytes = bytes
  assert.throws(() => parseClaudePluginPublicationIndex(oversized), /bytes must be a positive safe integer/u)
}

const malformedDigest = cloneValidIndex()
malformedDigest.plugins[0]!.sha256 = 'not-a-sha256'
assert.throws(
  () => parseClaudePluginPublicationIndex(malformedDigest),
  /sha256 must contain 64 hexadecimal characters/u,
)

for (const retiredVersion of ['0.9.9', '1.0.4', '1.1.0', '1.1.1', '2.0.0']) {
  assert.throws(
    () => parseClaudePluginPublicationIndex(indexForVersion(retiredVersion)),
    /version must be a compatible 1\.x release at least 1\.1\.2/u,
    `the first-party guide must reject retired or incompatible Claude ${retiredVersion}`,
  )
}
for (const version of ['01.1.2', '1.01.2', '1.1.02', '1.1.3-beta', '1.1.3+build', '1.2', '1.1.3/other']) {
  assert.throws(
    () => parseClaudePluginPublicationIndex(indexForVersion(version)),
    /version must be a canonical stable semantic version/u,
  )
}
assert.throws(
  () => parseClaudePluginPublicationIndex(indexForVersion('1.9007199254740992.0')),
  /version must be a compatible 1\.x release/u,
)
const mismatchedVersion = indexForVersion('1.2.0')
mismatchedVersion.plugins[0]!.filename = validIndex.plugins[0]!.filename
assert.throws(() => parseClaudePluginPublicationIndex(mismatchedVersion), /filename must equal/u)
const mismatchedVersionPath = indexForVersion('1.2.0')
mismatchedVersionPath.plugins[0]!.downloadUrl = validIndex.plugins[0]!.downloadUrl
assert.throws(() => parseClaudePluginPublicationIndex(mismatchedVersionPath), /versioned SHA-256 artifact path/u)
const mismatchedDigestPath = cloneValidIndex()
mismatchedDigestPath.plugins[0]!.sha256 = 'b'.repeat(64)
assert.throws(() => parseClaudePluginPublicationIndex(mismatchedDigestPath), /versioned SHA-256 artifact path/u)
for (const downloadUrl of [
  `https://example.com${validIndex.plugins[0]!.downloadUrl}`,
  `//example.com${validIndex.plugins[0]!.downloadUrl}`,
  `${validIndex.plugins[0]!.downloadUrl}?version=1.2.0`,
  `${validIndex.plugins[0]!.downloadUrl}#download`,
  '/api/public/claude/plugins/%2e%2e/other.plugin',
]) {
  const unsafePath = cloneValidIndex()
  unsafePath.plugins[0]!.downloadUrl = downloadUrl
  assert.throws(() => parseClaudePluginPublicationIndex(unsafePath), /canonical root-relative URL/u)
}

const wrongPlugin = cloneValidIndex()
wrongPlugin.plugins[0]!.id = 'different-plugin'
wrongPlugin.plugins[0]!.filename = 'different-plugin-1.1.2.plugin'
wrongPlugin.plugins[0]!.downloadUrl = `/api/public/claude/plugins/different-plugin/1.1.2/sha256-${digest}/different-plugin-1.1.2.plugin`
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
const candidateManifest = JSON.parse(readFileSync(resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../ai/claude/plugin/skillpilot-coach-v1/.claude-plugin/plugin.json',
), 'utf8')) as { name: string, version: string }
assert.equal(productionIndex.plugins[0]?.id, candidateManifest.name)
const publishedVersion = productionIndex.plugins[0]!.version
assert.equal(productionIndex.plugins[0]?.requirements.plan, 'claude-pro')
assert.deepEqual(productionIndex.plugins[0]?.requirements, CLAUDE_PLUGIN_BETA_REQUIREMENTS)
assert.equal(productionIndex.plugins[0]?.privacyUrl, CLAUDE_CONNECTOR_PRIVACY_URL)

const marketplaceLanePath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json',
)
interface MarketplaceEvidence {
  id?: string
  status?: string
  candidateVersion?: string | null
  candidateSha256?: string | null
  revision?: string | null
  treeSha256?: string | null
  verifiedAt?: string | null
  evidenceRef?: string | null
}
type MarketplaceLane = {
  target?: { repositoryUrl?: string }
  plugin?: { version?: string, directInstallSha256?: string }
  activation?: {
    state?: string
    firstPartyUiRoute?: string
    marketplaceUiSwitchAllowed?: boolean
    firstPartyGuideDecision?: {
      status?: string
      approvedAt?: string
      approvedBy?: string
      candidateVersion?: string
      candidateSha256?: string
      repositoryRevision?: string
      repositoryTreeSha256?: string
      evidenceRef?: string
    }
    evidence?: MarketplaceEvidence[]
  }
}
const candidateMarketplaceLane = JSON.parse(readFileSync(marketplaceLanePath, 'utf8')) as MarketplaceLane
assert.equal(candidateMarketplaceLane.plugin?.version, candidateManifest.version)
const marketplaceLane = publishedVersion === candidateManifest.version
  ? candidateMarketplaceLane
  : JSON.parse(readFileSync(resolve(dirname(marketplaceLanePath),
    `history/${publishedVersion}/marketplace-publication.json`), 'utf8')) as MarketplaceLane
function assertSeparateMarketplacePublication(lane: MarketplaceLane) {
  // A verified Marketplace update may precede the download/guide promotion.
  // Neither publication nor a historical approval promotes that new guide.
  assert.equal(lane.activation?.marketplaceUiSwitchAllowed, false)
  assert.equal(lane.activation?.firstPartyUiRoute, 'controlled_direct_install_beta')
  assert.equal(lane.activation?.firstPartyGuideDecision?.status, 'pending')
  for (const field of ['approvedAt', 'approvedBy', 'candidateVersion', 'candidateSha256',
    'repositoryRevision', 'repositoryTreeSha256', 'evidenceRef'] as const) {
    assert.equal(lane.activation?.firstPartyGuideDecision?.[field], null,
      `pending guide decision must not inherit ${field}`)
  }
  const entries = lane.activation?.evidence ?? []
  assert.deepEqual(entries.map(entry => entry.id), [
    'public-repository-default-branch',
    'clean-account-marketplace-install',
    'uploaded-plugin-migration-and-marketplace-refresh',
  ])
  const publication = entries[0]!
  if (publication.status === 'pass') {
    assert.equal(lane.activation?.state, 'published_pending_acceptance')
    assert.equal(publication.candidateVersion, candidateManifest.version)
    assert.equal(publication.candidateSha256, lane.plugin?.directInstallSha256)
    assert.match(publication.revision ?? '', /^[a-f0-9]{40}$/u)
    assert.match(publication.treeSha256 ?? '', /^[a-f0-9]{64}$/u)
    assert.equal(new Date(publication.verifiedAt ?? '').toISOString(), publication.verifiedAt)
    assert.match(publication.evidenceRef ?? '',
      /^https:\/\/github\.com\/enpasos\/skillpilot-claude-marketplace\/pull\/\d+$/u)
  } else {
    assert.equal(publication.status, 'pending')
    assert.equal(lane.activation?.state, 'prepared_not_published')
  }
  for (const entry of entries.filter(entry => entry.status !== 'pass' || entry !== publication)) {
    assert.equal(entry.status, 'pending', 'repository publication cannot approve a client installation')
    for (const field of ['candidateVersion', 'candidateSha256', 'revision', 'treeSha256', 'verifiedAt', 'evidenceRef'] as const) {
      assert.equal(entry[field], null, `pending evidence must not carry ${field}`)
    }
  }
}
function assertApprovedCandidateGuide(lane: MarketplaceLane) {
  const guide = lane.activation?.firstPartyGuideDecision
  const publication = lane.activation?.evidence?.find(entry => entry.id === 'public-repository-default-branch')
  assert.equal(lane.activation?.state, 'published_pending_acceptance')
  assert.equal(lane.activation?.marketplaceUiSwitchAllowed, true)
  assert.equal(lane.activation?.firstPartyUiRoute, 'personal_git_marketplace')
  assert.equal(guide?.status, 'approved')
  assert.equal(guide?.approvedBy, 'product-owner')
  assert.equal(new Date(guide?.approvedAt ?? '').toISOString(), guide?.approvedAt)
  assert.equal(guide?.candidateVersion, candidateManifest.version)
  assert.equal(guide?.candidateSha256, lane.plugin?.directInstallSha256)
  assert.match(guide?.evidenceRef ?? '', /^docs\/.*\.md#.+$/u)
  assert.equal(publication?.status, 'pass')
  assert.equal(publication?.candidateVersion, guide?.candidateVersion)
  assert.equal(publication?.candidateSha256, guide?.candidateSha256)
  assert.match(publication?.revision ?? '', /^[a-f0-9]{40}$/u)
  assert.match(publication?.treeSha256 ?? '', /^[a-f0-9]{64}$/u)
  assert.equal(guide?.repositoryRevision, publication?.revision)
  assert.equal(guide?.repositoryTreeSha256, publication?.treeSha256)
  for (const entry of lane.activation?.evidence ?? []) {
    if (entry !== publication) assert.equal(entry.status, 'pending', 'guide approval is not client acceptance')
  }
}
if (candidateMarketplaceLane.activation?.firstPartyGuideDecision?.status === 'approved') {
  // Guide approval can precede deployment of the build-generated download index.
  assertApprovedCandidateGuide(candidateMarketplaceLane)
  for (const corrupt of [
    (lane: MarketplaceLane) => { lane.activation!.firstPartyGuideDecision!.candidateVersion = '0.0.0' },
    (lane: MarketplaceLane) => { lane.activation!.firstPartyGuideDecision!.candidateSha256 = '0'.repeat(64) },
    (lane: MarketplaceLane) => { lane.activation!.firstPartyGuideDecision!.repositoryRevision = '0'.repeat(40) },
    (lane: MarketplaceLane) => { lane.activation!.evidence![0]!.status = 'pending' },
    (lane: MarketplaceLane) => { lane.activation!.evidence![1]!.status = 'pass' },
  ]) {
    const invalid = structuredClone(candidateMarketplaceLane)
    corrupt(invalid)
    assert.throws(() => assertApprovedCandidateGuide(invalid))
  }
} else if (publishedVersion !== candidateManifest.version) {
  assertSeparateMarketplacePublication(candidateMarketplaceLane)
}
{
  // Keep the independent publication boundary covered after index promotion.
  const publishedCandidate = structuredClone(candidateMarketplaceLane)
  publishedCandidate.activation!.state = 'published_pending_acceptance'
  publishedCandidate.activation!.marketplaceUiSwitchAllowed = false
  publishedCandidate.activation!.firstPartyUiRoute = 'controlled_direct_install_beta'
  publishedCandidate.activation!.firstPartyGuideDecision = {
    status: 'pending',
    ...Object.fromEntries(['approvedAt', 'approvedBy', 'candidateVersion', 'candidateSha256',
      'repositoryRevision', 'repositoryTreeSha256', 'evidenceRef'].map(field => [field, null])),
  }
  Object.assign(publishedCandidate.activation!.evidence![0]!, {
    status: 'pass', candidateVersion: candidateManifest.version,
    candidateSha256: publishedCandidate.plugin!.directInstallSha256,
    revision: 'a'.repeat(40), treeSha256: 'b'.repeat(64),
    verifiedAt: '2026-09-14T18:00:00.000Z',
    evidenceRef: 'https://github.com/enpasos/skillpilot-claude-marketplace/pull/999',
  })
  assertSeparateMarketplacePublication(publishedCandidate)
  const preparedCandidate = structuredClone(publishedCandidate)
  preparedCandidate.activation!.state = 'prepared_not_published'
  Object.assign(preparedCandidate.activation!.evidence![0]!, {
    status: 'pending', candidateVersion: null, candidateSha256: null,
    revision: null, treeSha256: null, verifiedAt: null, evidenceRef: null,
  })
  assertSeparateMarketplacePublication(preparedCandidate)
  for (const corrupt of [
    (lane: MarketplaceLane) => { lane.activation!.evidence![0]!.candidateVersion = '1.1.5' },
    (lane: MarketplaceLane) => { lane.activation!.evidence![0]!.candidateSha256 = '0'.repeat(64) },
    (lane: MarketplaceLane) => { lane.activation!.evidence![0]!.revision = null },
    (lane: MarketplaceLane) => { lane.activation!.evidence![1]!.status = 'pass' },
    (lane: MarketplaceLane) => { lane.activation!.marketplaceUiSwitchAllowed = true },
    (lane: MarketplaceLane) => { lane.activation!.firstPartyGuideDecision!.approvedBy = 'product-owner' },
  ]) {
    const invalid = structuredClone(publishedCandidate)
    corrupt(invalid)
    assert.throws(() => assertSeparateMarketplacePublication(invalid))
  }
}
assert.equal(
  CLAUDE_MARKETPLACE_REPOSITORY_URL,
  marketplaceLane.target?.repositoryUrl,
  'the marketplace guide must use the verified canonical repository URL',
)
assert.equal(marketplaceLane.plugin?.version, publishedVersion)
assert.equal(marketplaceLane.plugin?.directInstallSha256, productionIndex.plugins[0]?.sha256)
assert.equal(
  marketplaceLane.activation?.firstPartyUiRoute,
  'personal_git_marketplace',
  'the index-referenced published release has its own explicit Marketplace guide decision',
)
assert.equal(
  marketplaceLane.activation?.marketplaceUiSwitchAllowed,
  true,
  'guide-only approval enables guidance without claiming client acceptance',
)
const guideDecision = marketplaceLane.activation?.firstPartyGuideDecision
assert.equal(guideDecision?.status, 'approved')
assert.equal(guideDecision?.approvedBy, 'product-owner')
assert.equal(new Date(guideDecision?.approvedAt ?? '').toISOString(), guideDecision?.approvedAt)
assert.equal(guideDecision?.candidateVersion, publishedVersion)
assert.equal(guideDecision?.candidateSha256, productionIndex.plugins[0]?.sha256)
const guideEvidenceRefs: Record<string, string> = {
  '1.1.5': 'docs/quickstart/video-production.md#guide-freigabe-vom-13-september-2026',
  '1.1.6': 'docs/deploy/claude-personal-marketplace-release.md#guide-approval-and-website-download-promotion-14-september-2026',
  '1.1.7': 'docs/deploy/claude-personal-marketplace-release.md#117-website-version-and-download-alignment',
}
assert.ok(guideEvidenceRefs[publishedVersion], 'the indexed release needs its own explicit guide approval reference')
assert.equal(guideDecision?.evidenceRef,
  guideEvidenceRefs[publishedVersion])
const repositoryEvidence = marketplaceLane.activation?.evidence?.find(
  entry => entry.id === 'public-repository-default-branch',
)
// A candidate must pass CI before it can be published. Publication evidence
// must bind that candidate afterwards, never the previous release's tree.
if (repositoryEvidence?.status === 'pending') {
  assert.equal(marketplaceLane.activation?.state, 'prepared_not_published')
  for (const key of ['candidateVersion', 'candidateSha256', 'revision', 'treeSha256', 'verifiedAt', 'evidenceRef'] as const) {
    assert.equal(repositoryEvidence[key], null, `unpublished candidate must not carry ${key}`)
  }
} else {
  assert.equal(repositoryEvidence?.status, 'pass')
  assert.equal(marketplaceLane.activation?.state, 'published_pending_acceptance')
  assert.equal(repositoryEvidence?.candidateVersion, publishedVersion)
  assert.equal(repositoryEvidence?.candidateSha256, productionIndex.plugins[0]?.sha256)
  assert.match(repositoryEvidence?.revision ?? '', /^[a-f0-9]{40}$/u)
  assert.match(repositoryEvidence?.treeSha256 ?? '', /^[a-f0-9]{64}$/u)
  assert.equal(new Date(repositoryEvidence?.verifiedAt ?? '').toISOString(), repositoryEvidence?.verifiedAt)
  assert.match(repositoryEvidence?.evidenceRef ?? '',
    /^https:\/\/github\.com\/enpasos\/skillpilot-claude-marketplace\/pull\/\d+$/u)
}
assert.equal(repositoryEvidence?.status, 'pass', 'guide approval needs verified publication first')
assert.equal(guideDecision?.repositoryRevision, repositoryEvidence?.revision)
assert.equal(guideDecision?.repositoryTreeSha256, repositoryEvidence?.treeSha256)
for (const pendingEvidenceId of [
  'clean-account-marketplace-install',
  'uploaded-plugin-migration-and-marketplace-refresh',
]) {
  const evidence: MarketplaceEvidence | undefined = marketplaceLane.activation?.evidence?.find(
    entry => entry.id === pendingEvidenceId,
  )
  assert.equal(
    evidence?.status,
    'pending',
    'repository publication must not claim unperformed real-client acceptance',
  )
  assert.equal(evidence?.candidateVersion, null)
  assert.equal(evidence?.candidateSha256, null)
  assert.equal(evidence?.revision, null)
  assert.equal(evidence?.treeSha256, null)
  assert.equal(evidence?.verifiedAt, null)
  assert.equal(evidence?.evidenceRef, null)
}
assert.equal(CLAUDE_MARKETPLACE_INSTALLATION_ENABLED, marketplaceLane.activation?.marketplaceUiSwitchAllowed)

const historical115MarketplaceLane = JSON.parse(readFileSync(
  resolve(dirname(marketplaceLanePath), 'history/1.1.5/marketplace-publication.json'),
  'utf8',
)) as MarketplaceLane
assert.equal(historical115MarketplaceLane.plugin?.version, '1.1.5')
assert.equal(historical115MarketplaceLane.plugin?.directInstallSha256,
  '8b1713178bbb289bc0b6669afa6e60328f2b362d42651353a78a869fe6aa76c1')
assert.equal(historical115MarketplaceLane.activation?.state, 'published_pending_acceptance')
assert.equal(historical115MarketplaceLane.activation?.firstPartyUiRoute, 'personal_git_marketplace')
assert.equal(historical115MarketplaceLane.activation?.marketplaceUiSwitchAllowed, true)
assert.deepEqual(historical115MarketplaceLane.activation?.firstPartyGuideDecision, {
  status: 'approved', approvedAt: '2026-09-13T07:47:06.000Z', approvedBy: 'product-owner',
  candidateVersion: '1.1.5',
  candidateSha256: '8b1713178bbb289bc0b6669afa6e60328f2b362d42651353a78a869fe6aa76c1',
  repositoryRevision: '228f6bd59f30fa03e3f0e44fa69ffaa122f98323',
  repositoryTreeSha256: 'c854f82f337200a75ee9ad1078d1f22b8c219e5e4543e0fa62da38a19b24f4b2',
  evidenceRef: guideEvidenceRefs['1.1.5'],
})

// Preparing a replacement must not rewrite the actual 1.1.1 publication or
// turn its withdrawn guide into evidence for the new candidate.
const historicalMarketplaceLane = JSON.parse(readFileSync(
  resolve(dirname(marketplaceLanePath), 'history/1.1.1/marketplace-publication.json'),
  'utf8',
)) as typeof marketplaceLane
assert.equal(historicalMarketplaceLane.plugin?.version, '1.1.1')
assert.equal(historicalMarketplaceLane.activation?.state, 'published_pending_acceptance')
assert.equal(historicalMarketplaceLane.activation?.firstPartyUiRoute, 'controlled_direct_install_beta')
assert.equal(historicalMarketplaceLane.activation?.marketplaceUiSwitchAllowed, false)
const historicalGuideDecision = historicalMarketplaceLane.activation?.firstPartyGuideDecision
assert.equal(historicalGuideDecision?.status, 'withdrawn')
assert.equal(historicalGuideDecision?.candidateVersion, '1.1.1')
assert.equal(historicalGuideDecision?.candidateSha256, historicalMarketplaceLane.plugin?.directInstallSha256)
assert.match(historicalGuideDecision?.repositoryRevision ?? '', /^[a-f0-9]{40}$/u)
assert.equal(historicalGuideDecision?.repositoryTreeSha256,
  '8c6c67b46763224d901a65b35408dad7752f6c7db08203fd38cf0f568a74c5d3')
const historicalRepositoryEvidence = historicalMarketplaceLane.activation?.evidence?.find(
  evidence => evidence.id === 'public-repository-default-branch',
)
assert.equal(historicalRepositoryEvidence?.status, 'pass')
assert.equal(historicalRepositoryEvidence?.candidateVersion, '1.1.1')
assert.equal(historicalRepositoryEvidence?.candidateSha256, historicalGuideDecision?.candidateSha256)
assert.equal(historicalRepositoryEvidence?.revision, historicalGuideDecision?.repositoryRevision)
assert.equal(historicalRepositoryEvidence?.treeSha256, historicalGuideDecision?.repositoryTreeSha256)
for (const pendingEvidenceId of [
  'clean-account-marketplace-install',
  'uploaded-plugin-migration-and-marketplace-refresh',
]) {
  assert.equal(historicalMarketplaceLane.activation?.evidence?.find(
    evidence => evidence.id === pendingEvidenceId,
  )?.status, 'pending')
}

const pluginCatalogSource = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../views/PluginCatalogView.tsx',
  ),
  'utf8',
)
const directGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-direct-upload-guide"')
const updateGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-update-guide"')
const marketplaceGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-marketplace-guide"')
const finishGuideIndex = pluginCatalogSource.indexOf('data-testid="claude-plugin-finish-guide"')
const requirementsIndex = pluginCatalogSource.indexOf('aria-labelledby={`${cardId}-requirements`}')
assert(updateGuideIndex >= 0 && marketplaceGuideIndex > updateGuideIndex && directGuideIndex > marketplaceGuideIndex
  && finishGuideIndex > directGuideIndex && requirementsIndex > finishGuideIndex,
  'version comparison, primary Marketplace route, file fallback and shared completion precede secondary requirements')
assert.match(pluginCatalogSource, /download=\{plugin\.filename\}/u)
assert.match(pluginCatalogSource, /href=\{plugin\.downloadUrl\}/u)
assert.doesNotMatch(pluginCatalogSource, /\b[0-9]+\.[0-9]+\.[0-9]+\b/u,
  'the guide must not hardcode a current publication version')
assert.match(pluginCatalogSource, /navigator\.clipboard\.writeText\(CLAUDE_MARKETPLACE_REPOSITORY_URL\)/u)
assert.match(pluginCatalogSource, /href=\{CLAUDE_PLUGINS_DISCOVER_URL\}/u)
assert.doesNotMatch(pluginCatalogSource, /\?v=|localStorage|sessionStorage|window\.open|location\.(?:href|assign|replace)/u,
  'the guide must not add cache workarounds, installation markers or programmatic navigation')
assert.match(pluginCatalogSource, /const requirements = plugin\?\.requirements \?\? CLAUDE_PLUGIN_BETA_REQUIREMENTS/u)
assert.doesNotMatch(pluginCatalogSource, /\{plugin && \(\s*<section aria-labelledby=\{`\$\{cardId\}-requirements`\}/u)
for (const requiredNavigationCopy of [
  'Marketplaces verwalten',
  'Nach Updates suchen',
  'Automatisch synchronisieren',
  'Plugin-Datei herunterladen und hochladen',
  'Andere Plugins und Konnektoren bleiben unverändert',
  'Keinen zweiten manuellen Konnektor hinzufügen',
  'keine MCP-URL',
  'nicht automatisch auslesen',
  'Zurück zu SkillPilot',
  'Manage marketplaces',
  'Check for updates',
  'Automatically sync',
  'Download and upload the plugin file',
  'Leave other plugins and connectors unchanged',
  'Do not add a second manual connector',
  'cannot automatically read the version installed in your Claude account',
  'Return to SkillPilot',
]) {
  assert(pluginCatalogSource.includes(requiredNavigationCopy),
    `plugin guide contains the required Claude Web navigation copy: ${requiredNavigationCopy}`)
}
assert.match(pluginCatalogSource, /to="\/"/u)
assert.match(pluginCatalogSource, /Claude Pro/u)
assert.match(pluginCatalogSource, /data-testid="claude-plugin-marketplace-guide"/u)
assert.match(pluginCatalogSource, /data-testid="claude-plugin-direct-upload-guide"/u)
assert.doesNotMatch(pluginCatalogSource, /mcp-claude-v1\.skillpilot\.com/u)
assert.doesNotMatch(pluginCatalogSource, /benutzerdefinierten Konnektor hinzufügen|Add custom connector/u)
assert.doesNotMatch(pluginCatalogSource, /Löschen, Neuinstallieren oder Datei-Upload sind keine bestätigten Updatewege|Removal, reinstallation, or file upload are not confirmed update routes/u)

console.log('Claude plugin publication index tests passed')
