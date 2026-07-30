import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const inventoryPath = path.join(
  repoRoot,
  'docs/legal/ai-transparency-inventory.json',
)
const canonicalDir = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/canonical',
)
const memoryDeckDir = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/memory-decks',
)
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp'])
const audioExtensions = new Set(['.m4a', '.mp3', '.ogg', '.wav'])
const failures = []

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath)
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex')
}

function aggregateDigest(relativePaths) {
  const digest = crypto.createHash('sha256')
  for (const relativePath of relativePaths) {
    const filePath = repoPath(relativePath)
    digest.update(`${relativePath}\0${sha256(filePath)}\n`)
  }
  return digest.digest('hex')
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, 'en'))
        .map(([key, item]) => [key, stable(item)]),
    )
  }
  return value
}

function expectEqual(label, actual, expected) {
  if (JSON.stringify(stable(actual)) !== JSON.stringify(stable(expected))) {
    failures.push(
      `${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    )
  }
}

function expectFile(relativePath) {
  const absolutePath = repoPath(relativePath)
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    failures.push(`${relativePath}: expected a file`)
    return null
  }
  return absolutePath
}

function imageFileNames(relativeDir, namePattern = null) {
  const absoluteDir = repoPath(relativeDir)
  if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
    failures.push(`${relativeDir}: expected a directory`)
    return []
  }

  const pattern = namePattern === null ? null : new RegExp(namePattern, 'u')
  return fs.readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => (
      entry.isFile()
      && imageExtensions.has(path.extname(entry.name).toLowerCase())
      && (pattern === null || pattern.test(entry.name))
    ))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'))
}

function mediaPathsBelow(relativeDir, extensions) {
  const absoluteDir = repoPath(relativeDir)
  if (!fs.existsSync(absoluteDir) || !fs.statSync(absoluteDir).isDirectory()) {
    failures.push(`${relativeDir}: expected a directory`)
    return []
  }

  return fs.readdirSync(absoluteDir, { withFileTypes: true })
    .filter((entry) => (
      entry.isFile() && extensions.has(path.extname(entry.name).toLowerCase())
    ))
    .map((entry) => `${relativeDir}/${entry.name}`)
    .sort((left, right) => left.localeCompare(right, 'en'))
}

function hasC2paStructure(filePath) {
  const buffer = fs.readFileSync(filePath)
  const extension = path.extname(filePath).toLowerCase()

  if (extension === '.png') {
    return buffer.includes(Buffer.from('caBX', 'ascii'))
  }

  if (extension === '.jpg' || extension === '.jpeg') {
    return (
      buffer.includes(Buffer.from('c2pa', 'ascii'))
      && buffer.includes(Buffer.from('jumb', 'ascii'))
    )
  }

  return false
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'))

if (inventory.schemaVersion !== 1) {
  failures.push(
    `schemaVersion: expected 1, got ${JSON.stringify(inventory.schemaVersion)}`,
  )
}

const canonicalFiles = fs.readdirSync(canonicalDir)
  .filter((name) => name.endsWith('.json'))
  .sort((left, right) => left.localeCompare(right, 'en'))

let goalCount = 0
const visualizationLinks = []
for (const fileName of canonicalFiles) {
  const landscape = JSON.parse(
    fs.readFileSync(path.join(canonicalDir, fileName), 'utf8'),
  )
  const goals = Array.isArray(landscape.goals) ? landscape.goals : []
  goalCount += goals.length

  for (const goal of goals) {
    for (const link of goal.resourceLinks ?? []) {
      if (link?.type === 'goal-visualization') {
        visualizationLinks.push({ goalId: goal.id, ...link })
      }
    }
  }
}

const providerCounts = {}
const extensionCounts = {}
const withoutC2paStructure = []
for (const link of visualizationLinks) {
  const provider = link.provider ?? '<missing>'
  providerCounts[provider] = (providerCounts[provider] ?? 0) + 1

  const extension = path.extname(link.url ?? '').toLowerCase().replace('.', '')
  extensionCounts[extension] = (extensionCounts[extension] ?? 0) + 1

  if (typeof link.url !== 'string' || !link.url.startsWith('/')) {
    failures.push(
      `goal ${link.goalId}: invalid goal-visualization URL ${JSON.stringify(link.url)}`,
    )
    continue
  }

  const publicPath = expectFile(`app/public${link.url}`)
  const backendPath = expectFile(`backend/src/main/resources/static${link.url}`)
  if (publicPath === null) continue

  if (backendPath !== null && sha256(publicPath) !== sha256(backendPath)) {
    failures.push(`${link.url}: frontend and backend copies differ`)
  }

  if (!hasC2paStructure(publicPath)) {
    withoutC2paStructure.push(link.url)
  }
}

const visualizationInventory = inventory.artifactClasses.goalVisualizations
expectEqual(
  'goalVisualizations.canonicalLandscapeFiles',
  canonicalFiles.length,
  visualizationInventory.canonicalLandscapeFiles,
)
expectEqual(
  'goalVisualizations.canonicalGoalCount',
  goalCount,
  visualizationInventory.canonicalGoalCount,
)
expectEqual(
  'goalVisualizations.count',
  visualizationLinks.length,
  visualizationInventory.count,
)
expectEqual(
  'goalVisualizations.fileExtensions',
  extensionCounts,
  visualizationInventory.fileExtensions,
)
expectEqual(
  'goalVisualizations.providerCounts',
  providerCounts,
  visualizationInventory.providerCounts,
)
expectEqual(
  'goalVisualizations.c2paStructure.detected',
  visualizationLinks.length - withoutC2paStructure.length,
  visualizationInventory.c2paStructure.detected,
)
expectEqual(
  'goalVisualizations.c2paStructure.notDetectedUrls',
  withoutC2paStructure.sort((left, right) => left.localeCompare(right, 'en')),
  [...visualizationInventory.c2paStructure.notDetectedUrls]
    .sort((left, right) => left.localeCompare(right, 'en')),
)

const deckFiles = fs.readdirSync(memoryDeckDir)
  .filter((name) => name.endsWith('.json'))
  .sort((left, right) => left.localeCompare(right, 'en'))
let cardRecords = 0
const uniqueCardIds = new Set()
for (const fileName of deckFiles) {
  const deck = JSON.parse(
    fs.readFileSync(path.join(memoryDeckDir, fileName), 'utf8'),
  )
  const cards = Array.isArray(deck.cards) ? deck.cards : []
  cardRecords += cards.length
  cards.forEach((card) => uniqueCardIds.add(card.id))
}

const learningContentInventory = inventory.artifactClasses.canonicalLearningContent
expectEqual(
  'canonicalLearningContent.memoryDeckFiles',
  deckFiles.length,
  learningContentInventory.memoryDeckFiles,
)
expectEqual(
  'canonicalLearningContent.cardRecords',
  cardRecords,
  learningContentInventory.cardRecords,
)
expectEqual(
  'canonicalLearningContent.uniqueCardIds',
  uniqueCardIds.size,
  learningContentInventory.uniqueCardIds,
)

for (const collection of inventory.artifactClasses.narrativeIllustrations.collections) {
  const sourceFiles = imageFileNames(collection.sourceDir, collection.namePattern)
  expectEqual(
    `narrativeIllustrations.${collection.id}.sourceFiles`,
    sourceFiles,
    collection.sourceFiles,
  )
  for (const runtimePath of collection.runtimeFiles) {
    expectFile(runtimePath)
  }
  if (
    sourceFiles.every((fileName) => (
      fs.existsSync(repoPath(`${collection.sourceDir}/${fileName}`))
    ))
  ) {
    expectEqual(
      `narrativeIllustrations.${collection.id}.sourceDigestSha256`,
      aggregateDigest(
        sourceFiles.map((fileName) => `${collection.sourceDir}/${fileName}`),
      ),
      collection.sourceDigestSha256,
    )
  }
  if (collection.runtimeFiles.every((runtimePath) => fs.existsSync(repoPath(runtimePath)))) {
    expectEqual(
      `narrativeIllustrations.${collection.id}.runtimeDigestSha256`,
      aggregateDigest(collection.runtimeFiles),
      collection.runtimeDigestSha256,
    )
  }
}

const whitepaperInventory = inventory.artifactClasses.whitepaperRasterFigures
const whitepaperSourceFiles = imageFileNames(whitepaperInventory.sourceDir)
const whitepaperRuntimeFiles = imageFileNames(whitepaperInventory.runtimeDir)
expectEqual(
  'whitepaperRasterFigures.sourceFiles',
  whitepaperSourceFiles,
  whitepaperInventory.sourceFiles,
)
expectEqual(
  'whitepaperRasterFigures.runtimeFiles',
  whitepaperRuntimeFiles,
  whitepaperInventory.sourceFiles,
)
if (whitepaperSourceFiles.length > 0) {
  expectEqual(
    'whitepaperRasterFigures.sourceDigestSha256',
    aggregateDigest(
      whitepaperSourceFiles.map(
        (fileName) => `${whitepaperInventory.sourceDir}/${fileName}`,
      ),
    ),
    whitepaperInventory.sourceDigestSha256,
  )
  expectEqual(
    'whitepaperRasterFigures.runtimeDigestSha256',
    aggregateDigest(
      whitepaperRuntimeFiles.map(
        (fileName) => `${whitepaperInventory.runtimeDir}/${fileName}`,
      ),
    ),
    whitepaperInventory.runtimeDigestSha256,
  )
}

for (const audio of inventory.artifactClasses.podcastAudio.files) {
  const filePath = expectFile(audio.path)
  if (filePath === null) continue
  expectEqual(`${audio.path}.bytes`, fs.statSync(filePath).size, audio.bytes)
  expectEqual(`${audio.path}.sha256`, sha256(filePath), audio.sha256)

  for (const copyPath of audio.identicalRuntimeCopies ?? []) {
    const copy = expectFile(copyPath)
    if (copy !== null && sha256(copy) !== audio.sha256) {
      failures.push(`${copyPath}: does not match ${audio.path}`)
    }
  }
}

const inventoriedFrontendAudio = inventory.artifactClasses.podcastAudio.files
  .map((audio) => audio.path)
  .filter((audioPath) => audioPath.startsWith('app/public/audio/'))
  .sort((left, right) => left.localeCompare(right, 'en'))
const inventoriedBackendAudio = inventory.artifactClasses.podcastAudio.files
  .flatMap((audio) => audio.identicalRuntimeCopies ?? [])
  .filter((audioPath) => (
    audioPath.startsWith('backend/src/main/resources/static/audio/')
  ))
  .sort((left, right) => left.localeCompare(right, 'en'))
expectEqual(
  'podcastAudio.frontendRuntimeFiles',
  mediaPathsBelow('app/public/audio', audioExtensions),
  inventoriedFrontendAudio,
)
expectEqual(
  'podcastAudio.backendRuntimeFiles',
  mediaPathsBelow('backend/src/main/resources/static/audio', audioExtensions),
  inventoriedBackendAudio,
)

if (failures.length > 0) {
  console.error(
    `AI transparency inventory check failed with ${failures.length} issue(s):`,
  )
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log(
  `AI transparency inventory check passed: ${visualizationLinks.length} visualizations, `
  + `${visualizationLinks.length - withoutC2paStructure.length} with C2PA container markers, `
  + `${new Set([
    ...inventory.artifactClasses.narrativeIllustrations.collections
      .flatMap((collection) => collection.runtimeFiles),
    ...inventory.artifactClasses.whitepaperRasterFigures.sourceFiles
      .map((fileName) => (
        `${inventory.artifactClasses.whitepaperRasterFigures.runtimeDir}/${fileName}`
      )),
  ]).size} other bound runtime images, `
  + `${cardRecords} localized card records, `
  + `${inventory.artifactClasses.podcastAudio.files.length} bound audio files.`,
)
