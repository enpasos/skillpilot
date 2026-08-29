import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'

// The bounded curriculum and QA files predate a shared TypeScript schema and
// are therefore checked field by field below.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonRecord = Record<string, any>
type PlannedFile = { path: string; bytes: Buffer; appendOnly?: boolean }
type PlannedDeletion = { path: string; beforeSha256: string }

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const checkMode = process.argv.includes('--check')
const allowedArguments = new Set(['--write', '--check'])
const unexpectedArguments = process.argv.slice(2)
  .filter((argument) => !allowedArguments.has(argument))
if (unexpectedArguments.length > 0) {
  throw new Error(`Unexpected arguments: ${unexpectedArguments.join(', ')}`)
}
if (writeMode && checkMode) throw new Error('Use either --write or --check, not both')

const goalId = 'b42bdfcc-3db7-5697-8b3e-69e50962ca86'
const reviewedAt = '2026-08-28T18:35:57.000Z'
const reviewer = 'codex-math-b42-independent-visual-review-2026-08-28'
const expectedBoundedPlanSha256: string =
  '234b25b4df31b2193486c660da25eaceebad7f794ece39a7d0cf6cd5946ac44d'

// Math Batch 017 was reviewed and materialized after this B42 correction. It
// intentionally changed the shared full canonical and visualization-QA files,
// while retaining the exact B42-owned goal link and QA record. This second
// binding is check-only: it recognizes that exact later shared-file state
// without replacing or rebinding the historical B42 write-plan digest above.
const expectedPostBatch017SharedHashes = {
  canonical: '100825c360d41b225cec01e06ceda10b0014f2987e7911756b4b9166aad2d0ae',
  qa: '10d45db9da6c7438a32cd7ab3bdbfd28aa9ad2cae85c5e270156f621d8f7bad8',
} as const
const expectedPostBatch017CheckSha256 =
  'f283aae6ed3ae3cf747a33c784ea0be3f1792387a93abd596da21c96314b32ef'

const oldRasterSha256 = '42430b0e850fc21be654f6b914bd4545dfd619e0d1e356ccce437c33e6bfa5b2'
const originalNanoBananaPromptSha256 =
  '529bc2d58dedfafcdb80bc228893a25d9b601207b9f9951eb0a605eba343ddc0'

// Intentionally fail-closed until the independent v4 review supplies the
// accepted source/raster hashes. The script may be linted and typechecked in
// this state, but it cannot construct or bind a write plan.
const candidateSourceSha256 =
  '1b135b3a386bc1c568c6ee44ab06fc9f2f41711797473ffe521a7933ecd95713'
const candidateRasterSha256 =
  '514af0868752c41d908acc4989b683026a90ee144571ee6d5ead4fdfb93dacd0'
const candidateChromiumReferenceSha256 =
  'a16357672ae35ef941bd431d9324ce816c90568c18228673f5cb78331b33ed20'

const beforeHashes = {
  canonical: 'd231a574f46f3514aae2e7635507636b89ef91944decf92229911e8fc957144b',
  qa: 'f5eaf41b5c62f0249c84eeeb563def4c595a07fc997dd69e14723e5fcf487b82',
  transparencyInventory:
    'ebf3353ce7ab998cf36d635d869d6722a1d40dc44932e0e8c792cf2d7b9c0591',
} as const

const rejectedEvidence = {
  nanoBananaAttempt1:
    'ca01e1a2066f33aa728ce9a20e0c620dc690dbd07e1b7ebcdd4c0782a36baa49',
  nanoBananaAttempt2:
    '3cc58ebb91a036833ca358dfa81a6b076e4fc613b43439503b17e796645c0cea',
  nanoBananaAttempt3:
    'fba586eed1755b5c90bd14f34cf57157d441a202e24396e5d1ca4ad5fbb97133',
  nanoBananaAttempt3Reference:
    'a832b1cfd11d0aa8dbd261dbd92f16f264fdcc5c46603695e612c05a977ac0f9',
  nanoBananaAttempt3AppendPrompt:
    '4b46c0e04f004713cacae01761d3c71470d3acf5c9e078e74b1d42f868f1daff',
  repoNativeV1Source:
    '6e28d9220ff8554731533e3ff9c561d69b17ec3cdc1594979cef87774eeb63ff',
  repoNativeV1Chromium:
    'a832b1cfd11d0aa8dbd261dbd92f16f264fdcc5c46603695e612c05a977ac0f9',
  repoNativeV1Rsvg:
    'e230ae69a4df3790f1168d8b861979bccdb980ed6247b2a8fcb570336d0a1495',
  repoNativeV2Source:
    '06a5893320cafba0cb38f05e991862730a8029e982a69e876a3973910641e4ac',
  repoNativeV2Chromium:
    '22cb8e0d0e4c63c90b86b1aa505fef9bac145c3bfd42c4ff8b79d27d70862456',
  repoNativeV2Rsvg:
    '86319d6dc3eca3767a6cbf85d9a8296a987add12921d3d8e1f1e3dbefbc8cb3c',
  repoNativeV3Source:
    'd6575ed1bfdfadd633313bbff51b08e4c401f22a08518a35bfaa806f7ace518f',
  repoNativeV3Chromium:
    '56827196e276bc8ef8c17d37263731b173cb935336480d1ce80243709040c440',
  repoNativeV3Rsvg:
    '7c3346bdc783134f77e096c0e33c26f69ba712b26f16eb9e4fc4f1ac3ca28cda',
} as const

const visualRoot = `assets/goal-visualizations/mathematik/${goalId}`
const canonicalVisualRoot = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}`
const publicVisualRoot = `app/public/${visualRoot}`
const backendVisualRoot = `backend/src/main/resources/static/${visualRoot}`

const paths = {
  canonical:
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  qa: 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json',
  review:
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-batch-216.md',
  transparencyInventory: 'docs/legal/ai-transparency-inventory.json',
  oldCanonicalRaster: `${canonicalVisualRoot}/${goalId}.jpg`,
  oldPublicRaster: `${publicVisualRoot}/${goalId}.jpg`,
  oldBackendRaster: `${backendVisualRoot}/${goalId}.jpg`,
  canonicalRaster: `${canonicalVisualRoot}/${goalId}.png`,
  publicRaster: `${publicVisualRoot}/${goalId}.png`,
  backendRaster: `${backendVisualRoot}/${goalId}.png`,
  canonicalGeometry: `${canonicalVisualRoot}/repo-native-geometry-v4.svg`,
  publicGeometry: `${publicVisualRoot}/repo-native-geometry-v4.svg`,
  backendGeometry: `${backendVisualRoot}/repo-native-geometry-v4.svg`,
  activePrompt: `${canonicalVisualRoot}/prompt.de.md`,
  originalNanoBananaPrompt:
    `${canonicalVisualRoot}/prompt.nano-banana-original.de.md`,
  fallbackPrompt: `${canonicalVisualRoot}/prompt.repo-native-fallback-001.de.md`,
  reconstructionPrompt: `${canonicalVisualRoot}/image-reconstruction-prompt.de.md`,
  fallbackReconstructionPrompt:
    `${canonicalVisualRoot}/image-reconstruction-prompt.repo-native-fallback.de.md`,
  candidateSource:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v4.svg`,
  candidateRaster:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v4.png`,
  candidateChromiumReference:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v4.chromium.png`,
  nanoBananaAttempt1:
    `tmp/goal-visualizations/${goalId}/generated/${goalId}.generated.2026-08-28T17-42-25-992Z.jpg`,
  nanoBananaAttempt2:
    `tmp/goal-visualizations/${goalId}/generated/${goalId}.generated.2026-08-28T17-43-35-086Z.jpg`,
  nanoBananaAttempt3:
    `tmp/goal-visualizations/${goalId}/generated/${goalId}.generated.2026-08-28T17-54-46-362Z.jpg`,
  nanoBananaAttempt3AppendPrompt:
    `tmp/goal-visualizations/${goalId}/nano-banana-attempt-3-style-only.de.md`,
  repoNativeV1Source:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v1.svg`,
  repoNativeV1Chromium:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v1.chromium.png`,
  repoNativeV1Rsvg:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v1.png`,
  repoNativeV2Source:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v2.svg`,
  repoNativeV2Chromium:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v2.chromium.png`,
  repoNativeV2Rsvg:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v2.png`,
  repoNativeV3Source:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v3.svg`,
  repoNativeV3Chromium:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v3.chromium.png`,
  repoNativeV3Rsvg:
    `tmp/goal-visualizations/${goalId}/repository-native-fallback-v3.png`,
} as const

const plannedDeletions: PlannedDeletion[] = [
  { path: paths.oldCanonicalRaster, beforeSha256: oldRasterSha256 },
  { path: paths.oldPublicRaster, beforeSha256: oldRasterSha256 },
  { path: paths.oldBackendRaster, beforeSha256: oldRasterSha256 },
]

const outputBoundary = [
  paths.canonical,
  paths.qa,
  paths.review,
  paths.transparencyInventory,
  paths.canonicalRaster,
  paths.publicRaster,
  paths.backendRaster,
  paths.canonicalGeometry,
  paths.publicGeometry,
  paths.backendGeometry,
  paths.activePrompt,
  paths.originalNanoBananaPrompt,
  paths.fallbackPrompt,
  paths.reconstructionPrompt,
  paths.fallbackReconstructionPrompt,
] as const

function absolute(path: string): string {
  return resolve(repoRoot, path)
}

function sha256(bytes: Buffer | string): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function hashFile(path: string): string {
  return sha256(readFileSync(absolute(path)))
}

function assertFileHash(path: string, expectedSha256: string): void {
  if (!existsSync(absolute(path))) throw new Error(`${path}: required file is missing`)
  const actual = hashFile(path)
  if (actual !== expectedSha256) {
    throw new Error(`${path}: SHA-256 drift ${actual} != ${expectedSha256}`)
  }
}

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonRecord)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, item]) => [key, stable(item)]),
    )
  }
  return value
}

function stableJson(value: unknown): string {
  return JSON.stringify(stable(value))
}

function serializeJson(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`)
}

function readJson(path: string): JsonRecord {
  return JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
}

function exactKeys(value: JsonRecord, expectedKeys: readonly string[], label: string): void {
  const actual = Object.keys(value).sort((left, right) => left.localeCompare(right, 'en'))
  const expected = [...expectedKeys].sort((left, right) => left.localeCompare(right, 'en'))
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}: unexpected keys ${actual.join(',')}`)
  }
}

function hasUnboundCandidate(): boolean {
  return [
    reviewedAt,
    candidateSourceSha256,
    candidateRasterSha256,
    candidateChromiumReferenceSha256,
  ].some((value) => value.startsWith('TBD_'))
}

function detectAssetState(): 'pre' | 'post' {
  const oldStates = plannedDeletions.map(({ path }) => existsSync(absolute(path)))
  const newPaths = [
    paths.canonicalRaster,
    paths.publicRaster,
    paths.backendRaster,
    paths.canonicalGeometry,
    paths.publicGeometry,
    paths.backendGeometry,
  ]
  const newStates = newPaths.map((path) => existsSync(absolute(path)))
  if (oldStates.every(Boolean) && newStates.every((state) => !state)) return 'pre'
  if (oldStates.every((state) => !state) && newStates.every(Boolean)) return 'post'
  throw new Error('b42 asset tree is mixed; refusing a partial import or deletion')
}

function assertRejectedEvidence(preState: boolean): void {
  const bindings: Array<[string, string]> = [
    [paths.nanoBananaAttempt1, rejectedEvidence.nanoBananaAttempt1],
    [paths.nanoBananaAttempt2, rejectedEvidence.nanoBananaAttempt2],
    [paths.nanoBananaAttempt3, rejectedEvidence.nanoBananaAttempt3],
    [
      paths.nanoBananaAttempt3AppendPrompt,
      rejectedEvidence.nanoBananaAttempt3AppendPrompt,
    ],
    [paths.repoNativeV1Source, rejectedEvidence.repoNativeV1Source],
    [paths.repoNativeV1Chromium, rejectedEvidence.repoNativeV1Chromium],
    [paths.repoNativeV1Rsvg, rejectedEvidence.repoNativeV1Rsvg],
    [paths.repoNativeV2Source, rejectedEvidence.repoNativeV2Source],
    [paths.repoNativeV2Chromium, rejectedEvidence.repoNativeV2Chromium],
    [paths.repoNativeV2Rsvg, rejectedEvidence.repoNativeV2Rsvg],
    [paths.repoNativeV3Source, rejectedEvidence.repoNativeV3Source],
    [paths.repoNativeV3Chromium, rejectedEvidence.repoNativeV3Chromium],
    [paths.repoNativeV3Rsvg, rejectedEvidence.repoNativeV3Rsvg],
  ]
  if (!preState) return
  for (const [path, expectedSha256] of bindings) {
    assertFileHash(path, expectedSha256)
  }
}

function loadCandidate(
  temporaryPath: string,
  appliedPath: string,
  expectedSha256: string,
): Buffer {
  const selectedPath = existsSync(absolute(appliedPath)) ? appliedPath : temporaryPath
  assertFileHash(selectedPath, expectedSha256)
  return readFileSync(absolute(selectedPath))
}

function loadOriginalPrompt(preState: boolean): Buffer {
  const path = preState ? paths.activePrompt : paths.originalNanoBananaPrompt
  assertFileHash(path, originalNanoBananaPromptSha256)
  return readFileSync(absolute(path))
}

function buildCanonical(): JsonRecord {
  const canonical = readJson(paths.canonical)
  const goals = canonical.goals
  if (!Array.isArray(goals)) throw new Error('math canonical: missing goals array')
  const goal = goals.find((candidate) => candidate.id === goalId) as JsonRecord | undefined
  if (!goal) throw new Error(`${goalId}: missing canonical goal`)
  const links = (goal.resourceLinks ?? []) as JsonRecord[]
  const visualizationLinks = links.filter((link) => link.type === 'goal-visualization')
  if (visualizationLinks.length !== 1) {
    throw new Error(`${goalId}: expected exactly one goal-visualization link`)
  }
  const link = visualizationLinks[0]
  if (link.skillpilotId !== goalId || link.resourceType !== 'image' || link.role !== 'primary') {
    throw new Error(`${goalId}: visualization identity/role drift`)
  }
  Object.assign(link, {
    url: `/${visualRoot}/${goalId}.png`,
    provider: 'Repository-native SVG (documented Nano Banana Pro fallback)',
  })
  return canonical
}

function buildQa(): JsonRecord {
  const qa = readJson(paths.qa)
  const records = qa.records
  if (!Array.isArray(records)) throw new Error('math visualization QA: missing records array')
  const matches = records.filter((record) => record.goalId === goalId) as JsonRecord[]
  if (matches.length !== 1) throw new Error(`${goalId}: expected exactly one QA record`)
  const record = matches[0]
  if (record.visualizationState !== 'available') {
    throw new Error(`${goalId}: QA visualization is not available`)
  }
  const notes =
    'Hashgebundene unabhängige Originalauflösungs- und Geometrieprüfung der '
    + 'dokumentierten repo-native Nano-Banana-Pro-Ausnahme: Alle Werte, Punkte, '
    + 'Sekanten, die Tangente, die beidseitige Tabelle und h ≠ 0 sind exakt; '
    + 'sieben gefüllte Punktlabelboxen halten mindestens 6,854 px Abstand zu '
    + 'allen geplotteten Strichen. Außerhalb der autorisierten Labelbereiche '
    + 'änderte v3→v4 0 Pixel. Chromium- und librsvg-Render sind semantisch '
    + 'gleichwertig (SSIM 0,987306).'
  Object.assign(record, {
    imageUrl: `/${visualRoot}/${goalId}.png`,
    publicAssetPath: paths.publicRaster,
    canonicalAssetPath: paths.canonicalRaster,
    assetSha256: `sha256:${candidateRasterSha256}`,
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    chatGptReviewedAt: reviewedAt,
    chatGptReviewer: reviewer,
    chatGptNotes: notes,
    humanApproved: 'no',
    humanIssueIdentified: 'no',
    humanIssueDescription: '',
    humanReviewedAt: null,
    humanReviewer: '',
    aiApproved: 'yes',
    aiApprovedAssetSha256: `sha256:${candidateRasterSha256}`,
    aiReviewedAt: reviewedAt,
    aiReviewer: reviewer,
    aiNotes: notes,
  })
  return qa
}

function buildTransparencyInventory(): JsonRecord {
  const inventory = readJson(paths.transparencyInventory)
  const visualizations = inventory.artifactClasses?.goalVisualizations as JsonRecord | undefined
  if (!visualizations) throw new Error('AI transparency inventory: missing goalVisualizations')
  exactKeys(
    visualizations.fileExtensions as JsonRecord,
    ['jpg', 'png'],
    'goalVisualizations.fileExtensions',
  )
  const providerCounts = visualizations.providerCounts as JsonRecord
  if (
    typeof providerCounts['Google Gemini / Nano Banana Pro'] !== 'number'
    || typeof providerCounts['Repository-native SVG (documented Nano Banana Pro fallback)']
      !== 'number'
  ) {
    throw new Error('AI transparency inventory: expected provider counters are missing')
  }
  visualizations.fileExtensions = { jpg: 1505, png: 21 }
  providerCounts['Google Gemini / Nano Banana Pro'] = 1029
  providerCounts['Repository-native SVG (documented Nano Banana Pro fallback)'] = 3
  const c2pa = visualizations.c2paStructure as JsonRecord
  c2pa.detected = 1517
  const imageUrl = `/${visualRoot}/${goalId}.png`
  const notDetected = new Set<string>(c2pa.notDetectedUrls as string[])
  notDetected.add(imageUrl)
  c2pa.notDetectedUrls = [...notDetected]
    .sort((left, right) => left.localeCompare(right, 'en'))
  return inventory
}

function fallbackPromptText(): string {
  return [
    'Erzeuge eine freundliche, lockere 16:9-Unterrichtsgrafik auf warmcremefarbenem',
    'Hintergrund mit drei großen, abgerundeten Karten. Die Geometrie wird',
    'repository-native und koordinatengebunden konstruiert, weil drei gezielte',
    'Nano-Banana-Pro-Korrekturen die Punkt- und Achsengeometrie nicht zuverlässig',
    'erhalten haben.',
    '',
    'Links zeigt „Sekanten nähern sich“ für f(x)=x² den Punkt P(1|1) und mehrere',
    'Punkte Q=(1+h | (1+h)²) auf derselben Parabel. Jede farbige Sekante ist eine',
    'Gerade exakt durch P und den zugehörigen Q-Punkt. Die rote Tangente ist',
    'y=2x−1 und geht exakt durch P. Beschriftungen dürfen von keiner Kurve oder',
    'Geraden gekreuzt werden.',
    '',
    'In der Mitte steht exakt',
    'D(h)=((1+h)²−1)/h=2+h, h≠0.',
    'Eine gut lesbare Tabelle enthält positive und negative h-Werte, deren',
    'D(h)-Werte sich beidseitig 2 nähern. Deutsche Dezimalkommas verwenden.',
    '',
    'Rechts zeigt ein kalibriertes Zoomfenster P(1|1) und',
    'Q₃(1,01|1,0201) unmittelbar rechts oberhalb von P auf der Parabel. Die',
    'Ticks und Koordinaten sind vollständig und typografisch unbeschädigt. Der',
    'Schluss lautet exakt lim für h→0 D(h)=2=f′(1).',
    '',
    'Alle Formeln, Punktlagen, Geraden und Kurven müssen mathematisch konsistent',
    'sein. Keine Logos, technischen IDs, Wasserzeichen oder zusätzlichen Themen.',
    'Das bindende Layout liegt in `repo-native-geometry-v4.svg`.',
  ].join('\n')
}

function activePromptText(fallbackPrompt: string): string {
  return [
    '# Lernzielvisualisierung: Grenzwerte des Differenzenquotienten bestimmen',
    '',
    '## SkillPilot-Ziel',
    '',
    `- SkillPilot-ID: \`${goalId}\``,
    '- Titel: Grenzwerte des Differenzenquotienten bestimmen',
    '- Beschreibung: Die lernende Person kann Grenzwerte des Differenzenquotienten mit der h-Methode (h → 0) tabellarisch oder numerisch bestimmen und den Übergang von der Sekante zur Tangente begründen.',
    '',
    '## Generator',
    '',
    '- Provider: Repository-native SVG (documented Nano Banana Pro fallback)',
    '- Status: pilot',
    `- Quellbild: \`${goalId}.png\``,
    `- Public Asset: \`/${visualRoot}/${goalId}.png\``,
    '',
    '## Prompt',
    '',
    '```text',
    fallbackPrompt,
    '```',
    '',
    '## Provenienz- und Review-Notiz',
    '',
    `Der ursprüngliche Nano-Banana-Pro-Prompt bleibt bytegleich als \`${basename(paths.originalNanoBananaPrompt)}\` erhalten. Drei gezielte Nano-Banana-Pro-Korrekturversuche sowie drei frühere repo-native Fassungen wurden fachlich beziehungsweise technisch verworfen; die hashgebundene Historie steht in \`${basename(paths.review)}\`. Die repository-native Fassung ist eine enge dokumentierte Ausnahme und keine allgemeine Providerablösung. Eine menschliche Freigabe wird nicht behauptet.`,
    '',
  ].join('\n')
}

function reconstructionPromptText(fallbackPrompt: string): string {
  return [
    '# Bildrekonstruktionsprompt: Grenzwerte des Differenzenquotienten bestimmen',
    '',
    '## SkillPilot-Ziel',
    '',
    `- SkillPilot-ID: \`${goalId}\``,
    '- Titel: Grenzwerte des Differenzenquotienten bestimmen',
    '- Beschreibung: Die lernende Person kann Grenzwerte des Differenzenquotienten mit der h-Methode (h → 0) tabellarisch oder numerisch bestimmen und den Übergang von der Sekante zur Tangente begründen.',
    '',
    '## Generator',
    '',
    '- Provider: Repository-native SVG (documented Nano Banana Pro fallback)',
    `- Quellbild: \`${goalId}.png\``,
    '',
    '## Zweck',
    '',
    'Dieser Alternativprompt beschreibt das erzeugte Bild als eigenständige Promptbasis für spätere Korrekturen. Er ist keine fachliche Freigabe und ersetzt nicht den Review.',
    '',
    '## Prompt',
    '',
    '```text',
    fallbackPrompt,
    '```',
  ].join('\n')
}

function reviewText(): string {
  return [
    '# Goal Visualization Review - Mathematik Batch 216',
    '',
    'Review date: 2026-08-28',
    '',
    'Scope: dringende fachliche Korrektur der aktiven Visualisierung zum Lernziel',
    '„Grenzwerte des Differenzenquotienten bestimmen“.',
    '',
    'Status: `completed`',
    '',
    '## Entscheidung',
    '',
    '| Goal ID | Lernziel | Entscheidung | SHA-256 und fachliches Prüfergebnis |',
    '| --- | --- | --- | --- |',
    `| \`${goalId}\` | Grenzwerte des Differenzenquotienten bestimmen | \`accepted_documented_repo_native_fallback\` | \`${candidateRasterSha256}\`; alle Werte, Punktkoordinaten, Sekantensteigungen, die Tangente, h ≠ 0 und der beidseitige Grenzübergang sind exakt. Sieben gefüllte Punktlabelboxen halten mindestens 6,854 px Abstand zu geplotteten Strichen; außerhalb ihrer autorisierten Bereiche änderte v3→v4 0 Pixel. Chromium und librsvg sind semantisch gleichwertig (SSIM 0,987306). |`,
    '',
    'Die kanonische, öffentliche und Backend-PNG-Kopie ist SHA-256-identisch.',
    `Die bindende Geometriequelle ist \`repo-native-geometry-v4.svg\` mit SHA-256`,
    `\`${candidateSourceSha256}\`. Die KI-Freigabe wird nur an den finalen`,
    'Rasterhash gebunden; eine menschliche Freigabe wird nicht behauptet.',
    '',
    '## Belegter Mangel der vorherigen aktiven Fassung',
    '',
    `Die vorherige Nano-Banana-Pro-Fassung mit SHA-256 \`${oldRasterSha256}\``,
    'zeichnete Q₃(1,01|1,0201) weit links und unterhalb von P(1|1), statt',
    'unmittelbar rechts oberhalb von P auf f(x)=x². Die zugehörige Sekante konnte',
    'deshalb den tabellarischen Wert D(0,01)=2,01 nicht geometrisch darstellen.',
    'Die ansonsten korrekte Formel und Tabelle retteten die irreführende Zeichnung',
    'nicht.',
    '',
    '## Drei verworfene Nano-Banana-Pro-Korrekturversuche',
    '',
    'Nano Banana Pro blieb der zuerst verwendete Standardprovider. Alle drei',
    'Kandidaten wurden unter `--no-import` erzeugt und in Originalauflösung',
    'fachlich geprüft:',
    '',
    `1. \`${rejectedEvidence.nanoBananaAttempt1}\`: gezielte Bild-zu-Bild-Korrektur`,
    '   auf Basis des vorherigen aktiven Bildes. Q₃ blieb weit links und unter P;',
    '   der zentrale Geometriefehler bestand unverändert fort.',
    `2. \`${rejectedEvidence.nanoBananaAttempt2}\`: freie Neugenerierung mit`,
    '   expliziter Drei-Panel-Geometrie. Im rechten Hauptdiagramm lag P(1|1)',
    '   fälschlich im Achsenursprung beziehungsweise am Scheitel der blauen',
    '   Parabel; links verlief die grüne Sekante nicht zuverlässig durch P.',
    `3. \`${rejectedEvidence.nanoBananaAttempt3}\`: Style-only-Bildkorrektur mit`,
    `   der konstruierten Chromium-Referenz \`${rejectedEvidence.nanoBananaAttempt3Reference}\``,
    `   und dem Append-Prompt \`${rejectedEvidence.nanoBananaAttempt3AppendPrompt}\`.`,
    '   Im Zoom waren beide x-Ticks als 1,000 statt 1,000 und 1,010 gesetzt; der',
    '   obere y-Tick lautete 1,201 statt 1,0201, der untere war beschädigt, und das',
    '   Achsenlabel wurde zu „x gloka“. Außerdem wurde die äußere Q₂-Koordinate',
    '   abgeschnitten und der grüne m(PQ)-Balkentext über die Panelkante geschoben.',
    '',
    '## Drei verworfene repo-native Vorstufen',
    '',
    `1. SVG v1 \`${rejectedEvidence.repoNativeV1Source}\` wurde im Chromium-Render`,
    `   \`${rejectedEvidence.repoNativeV1Chromium}\` wie beabsichtigt dargestellt.`,
    `   ` + '`rsvg-convert 2.52.5`' + ` erzeugte jedoch das PNG \`${rejectedEvidence.repoNativeV1Rsvg}\``,
    '   mit großen orangefarbenen Vollflächen aus `feDropShadow`/Filtern; dieses',
    '   Produktionsraster war technisch unbrauchbar.',
    `2. SVG v2 \`${rejectedEvidence.repoNativeV2Source}\`, Chromium-PNG`,
    `   \`${rejectedEvidence.repoNativeV2Chromium}\` und rsvg-PNG`,
    `   \`${rejectedEvidence.repoNativeV2Rsvg}\` hatten korrekte Grundgeometrie,`,
    '   wurden aber fachlich/pädagogisch verworfen: In der Formel fehlte h≠0, die',
    '   Tabelle belegte nur h→0⁺ statt des zweiseitigen Grenzübergangs, Kurven',
    '   kreuzten Tangenten- und Q-Beschriftungen, und zwei Kopfkapseln waren zu eng.',
    `3. SVG v3 \`${rejectedEvidence.repoNativeV3Source}\`, Chromium-PNG`,
    `   \`${rejectedEvidence.repoNativeV3Chromium}\` und rsvg-PNG`,
    `   \`${rejectedEvidence.repoNativeV3Rsvg}\` korrigierten Formel, zweiseitige`,
    '   Tabelle, Schluss und Kapselabstände. Die ungekapselten Punktlabels P, Q₁',
    '   und Q₂ im Hauptdiagramm sowie P und Q₃ im Zoom lagen aber weiterhin in',
    '   denselben Bildschirmbereichen wie Kurven oder Geraden; besonders Q₂ und',
    '   die kleinen Zoomlabels wurden sichtbar von Strichen durchzogen.',
    '',
    '## Begründung der engen Ausnahme',
    '',
    'Erst nach drei gezielten Nano-Banana-Pro-Fehlschlägen wurde die repo-native',
    'Ausnahme aktiviert. Sie ist hier notwendig, weil das Lernziel gleichzeitig',
    'exakte Punktlagen, Sekantengeraden, einen zweiseitigen Grenzübergang und',
    'fehlerfreie Dezimalbeschriftungen verlangt. Andere fachlich korrekte',
    'Nano-Banana-Pro-Visualisierungen werden durch diesen Korrekturschritt nicht',
    'ersetzt.',
    '',
  ].join('\n')
}

function assertOutputBoundary(files: PlannedFile[]): void {
  const expected = new Set<string>(outputBoundary)
  const actual = new Set(files.map((file) => file.path))
  if (actual.size !== expected.size || [...actual].some((path) => !expected.has(path))) {
    throw new Error('b42 planned outputs escaped the exact 15-file import boundary')
  }
  const expectedDeletions = new Set<string>([
    paths.oldCanonicalRaster,
    paths.oldPublicRaster,
    paths.oldBackendRaster,
  ])
  const actualDeletions = new Set(plannedDeletions.map(({ path }) => path))
  if (
    actualDeletions.size !== expectedDeletions.size
    || [...actualDeletions].some((path) => !expectedDeletions.has(path))
  ) throw new Error('b42 deletions escaped the exact three-JPG boundary')
}

function assertAppendOnly(files: PlannedFile[]): void {
  for (const file of files) {
    if (!file.appendOnly || !existsSync(absolute(file.path))) continue
    if (!readFileSync(absolute(file.path)).equals(file.bytes)) {
      throw new Error(`Refusing to overwrite append-only artifact ${file.path}`)
    }
  }
}

function changedPlannedFiles(files: PlannedFile[]): PlannedFile[] {
  return files.filter((file) => (
    !existsSync(absolute(file.path))
    || !readFileSync(absolute(file.path)).equals(file.bytes)
  ))
}

if (hasUnboundCandidate()) {
  console.log(
    'CHECK apply_math_b42_visualization_correction BLOCKED '
    + 'reason=independent-v4-review-and-hashes-pending writes=0',
  )
  console.log(`OUTPUT_BOUNDARY ${outputBoundary.join(',')}`)
  console.log(
    `DELETE_BOUNDARY ${plannedDeletions.map(({ path }) => path).join(',')}`,
  )
  throw new Error('Refusing to construct or digest a b42 plan from an unbound v4 candidate')
}

const state = detectAssetState()
const preState = state === 'pre'
const exactPostBatch017SharedState = !preState
  && hashFile(paths.canonical) === expectedPostBatch017SharedHashes.canonical
  && hashFile(paths.qa) === expectedPostBatch017SharedHashes.qa
if (preState) {
  assertFileHash(paths.canonical, beforeHashes.canonical)
  assertFileHash(paths.qa, beforeHashes.qa)
  assertFileHash(paths.transparencyInventory, beforeHashes.transparencyInventory)
  for (const deletion of plannedDeletions) {
    assertFileHash(deletion.path, deletion.beforeSha256)
  }
} else if (expectedBoundedPlanSha256 === 'PENDING') {
  throw new Error('Refusing an unbound post-state; bind the independently reviewed plan first')
}
assertRejectedEvidence(preState)

const sourceBytes = loadCandidate(
  paths.candidateSource,
  paths.canonicalGeometry,
  candidateSourceSha256,
)
const rasterBytes = loadCandidate(
  paths.candidateRaster,
  paths.canonicalRaster,
  candidateRasterSha256,
)
if (preState) assertFileHash(paths.candidateChromiumReference, candidateChromiumReferenceSha256)
const originalPromptBytes = loadOriginalPrompt(preState)
const fallbackPrompt = fallbackPromptText()
const canonical = buildCanonical()
const qa = buildQa()
const transparencyInventory = buildTransparencyInventory()
const review = reviewText()

const plannedFiles: PlannedFile[] = [
  { path: paths.originalNanoBananaPrompt, bytes: originalPromptBytes },
  { path: paths.canonicalRaster, bytes: rasterBytes },
  { path: paths.publicRaster, bytes: rasterBytes },
  { path: paths.backendRaster, bytes: rasterBytes },
  { path: paths.canonicalGeometry, bytes: sourceBytes },
  { path: paths.publicGeometry, bytes: sourceBytes },
  { path: paths.backendGeometry, bytes: sourceBytes },
  { path: paths.fallbackPrompt, bytes: Buffer.from(`${fallbackPrompt}\n`) },
  {
    path: paths.reconstructionPrompt,
    bytes: Buffer.from(`${reconstructionPromptText(fallbackPrompt)}\n`),
  },
  {
    path: paths.fallbackReconstructionPrompt,
    bytes: Buffer.from(`${fallbackPrompt}\n`),
  },
  { path: paths.activePrompt, bytes: Buffer.from(activePromptText(fallbackPrompt)) },
  { path: paths.canonical, bytes: serializeJson(canonical) },
  { path: paths.qa, bytes: serializeJson(qa) },
  { path: paths.review, bytes: Buffer.from(review), appendOnly: true },
  { path: paths.transparencyInventory, bytes: serializeJson(transparencyInventory) },
]
assertOutputBoundary(plannedFiles)
assertAppendOnly(plannedFiles)

const boundedPlanSha256 = sha256(stableJson({
  goalId,
  reviewedAt,
  reviewer,
  beforeHashes,
  oldRasterSha256,
  originalNanoBananaPromptSha256,
  rejectedEvidence,
  candidate: {
    sourceSha256: candidateSourceSha256,
    rasterSha256: candidateRasterSha256,
    chromiumReferenceSha256: candidateChromiumReferenceSha256,
  },
  outputBoundary,
  deletionBoundary: plannedDeletions,
  downstreamRegenerationExcluded: [
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.json',
    'curricula/DE/Gymnasium/quality/goal-visualization-review/mathematik-rollout-status.md',
    'app/public/lernzielbuch/**',
    'curricula/DE/Gymnasium/quality/package-redistribution/**',
  ],
  plannedOutputBindings: plannedFiles.map((file) => ({
    path: file.path,
    sha256: sha256(file.bytes),
    appendOnly: file.appendOnly === true,
  })),
}))
const expectedPlanSha256 = exactPostBatch017SharedState
  ? expectedPostBatch017CheckSha256
  : expectedBoundedPlanSha256
if (expectedPlanSha256 !== 'PENDING' && boundedPlanSha256 !== expectedPlanSha256) {
  throw new Error(
    `b42 bounded plan drift: ${boundedPlanSha256} != ${expectedPlanSha256}`,
  )
}

const changed = changedPlannedFiles(plannedFiles)
const remainingDeletions = plannedDeletions
  .filter(({ path }) => existsSync(absolute(path)))
if (checkMode && (changed.length > 0 || remainingDeletions.length > 0)) {
  throw new Error(
    `b42 correction is not applied; writes=${changed.length} deletions=${remainingDeletions.length}`,
  )
}

if (writeMode) {
  if (exactPostBatch017SharedState) {
    throw new Error(
      'Refusing --write from the exact Math Batch 017 follow-up state; '
      + 'its binding is read-only and does not replace the historical B42 write plan',
    )
  }
  if (expectedBoundedPlanSha256 === 'PENDING') {
    throw new Error(
      `Refusing --write until expectedBoundedPlanSha256 is independently bound to ${boundedPlanSha256}`,
    )
  }
  execFileSync('node', ['scripts/check_openai_plugin_review_freeze.mjs'], {
    cwd: repoRoot,
    stdio: 'inherit',
  })
  for (const file of changed) {
    mkdirSync(dirname(absolute(file.path)), { recursive: true })
    if (file.appendOnly) writeFileSync(absolute(file.path), file.bytes, { flag: 'wx' })
    else writeFileSync(absolute(file.path), file.bytes)
  }
  for (const deletion of remainingDeletions) {
    assertFileHash(deletion.path, deletion.beforeSha256)
    unlinkSync(absolute(deletion.path))
  }
}

const status = writeMode ? 'WRITE' : changed.length === 0 ? 'PASS' : 'PLAN'
console.log(
  `CHECK apply_math_b42_visualization_correction ${status} state=${state} `
  + `plannedWrites=${changed.length} plannedDeletions=${remainingDeletions.length}`,
)
console.log(`OUTPUT_BOUNDARY ${outputBoundary.join(',')}`)
console.log(`DELETE_BOUNDARY ${plannedDeletions.map(({ path }) => path).join(',')}`)
for (const file of plannedFiles) {
  const fileState = changed.some((candidate) => candidate.path === file.path)
    ? 'WRITE'
    : 'UNCHANGED'
  console.log(`PLANNED_OUTPUT ${sha256(file.bytes)} ${fileState} ${file.path}`)
}
console.log(`BOUNDED_PLAN_SHA256 ${boundedPlanSha256} binding=${expectedPlanSha256}`)
console.log(
  'CHECK_STATE_BINDING '
  + (exactPostBatch017SharedState
    ? `math-batch-017-follow-up historicalB42Plan=${expectedBoundedPlanSha256}`
    : `historical-b42-write-plan binding=${expectedBoundedPlanSha256}`),
)
console.log(
  'DOWNSTREAM_STALE regenerate-once-after-b42-and-b017='
  + 'visualization-rollout-status,goal-books,package-redistribution',
)
