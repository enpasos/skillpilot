import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const canonicalDir = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/canonical',
)
const runtimeRoots = [
  'app/public/assets/goal-visualizations',
  'backend/src/main/resources/static/assets/goal-visualizations',
]
const canonicalRoot = 'curricula/DE/Gymnasium/visualizations'
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function repoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/')
}

function fail(message) {
  failures.push(message)
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')
}

function imageFilesBelow(rootPath) {
  if (!fs.existsSync(rootPath)) return []
  const files = []
  const pending = [rootPath]
  while (pending.length > 0) {
    const current = pending.pop()
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        pending.push(entryPath)
      } else if (entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
        files.push(entryPath)
      }
    }
  }
  return files.sort()
}

function resolveWithinRoot(rootPath, relativePath) {
  const absoluteRoot = path.resolve(rootPath)
  const resolved = path.resolve(absoluteRoot, relativePath)
  if (resolved !== absoluteRoot && !resolved.startsWith(`${absoluteRoot}${path.sep}`)) {
    return null
  }
  return resolved
}

function realPathIsWithinRoot(rootPath, targetPath) {
  const realRoot = fs.realpathSync(rootPath)
  const realTarget = fs.realpathSync(targetPath)
  return realTarget === realRoot || realTarget.startsWith(`${realRoot}${path.sep}`)
}

const failures = []
let checkedLinks = 0
let checkedLandscapes = 0
const expectedAssetRelativePaths = new Set()
const assetOwners = new Map()

const landscapePaths = fs.readdirSync(canonicalDir)
  .filter((name) => name.endsWith('.json'))
  .sort()
  .map((name) => path.join(canonicalDir, name))

for (const landscapePath of landscapePaths) {
  checkedLandscapes += 1
  const landscape = JSON.parse(fs.readFileSync(landscapePath, 'utf8'))
  const landscapeLabel = repoRelative(landscapePath)

  for (const goal of landscape.goals ?? []) {
    const visualizationLinks = (goal.resourceLinks ?? []).filter((link) => (
      link?.type === 'goal-visualization' || link?.resourceType === 'goal-visualization'
    ))
    if (visualizationLinks.length > 1) {
      fail(`${landscapeLabel}:${goal.id}: expected at most one primary goal-visualization link, found ${visualizationLinks.length}.`)
    }

    for (const link of visualizationLinks) {
      checkedLinks += 1

      const prefix = `${landscapeLabel}:${goal.id}`
      if (link.resourceType !== 'image') {
        fail(`${prefix}: goal-visualization link must use resourceType=image.`)
      }
      if (link.role !== 'primary') {
        fail(`${prefix}: goal-visualization link must use role=primary.`)
      }
      if (link.skillpilotId !== goal.id) {
        fail(`${prefix}: skillpilotId must equal the containing goal id.`)
      }
      if (!link.altText || typeof link.altText !== 'string' || link.altText.trim() === '') {
        fail(`${prefix}: goal-visualization link is missing altText.`)
      }
      if (!link.reviewStatus || typeof link.reviewStatus !== 'string' || link.reviewStatus.trim() === '') {
        fail(`${prefix}: goal-visualization link is missing reviewStatus.`)
      }
      if (!link.url || typeof link.url !== 'string') {
        fail(`${prefix}: goal-visualization link is missing url.`)
        continue
      }
      if (!link.url.startsWith('/assets/goal-visualizations/')) {
        fail(`${prefix}: url must start with /assets/goal-visualizations/.`)
        continue
      }

      const extension = path.extname(link.url).toLowerCase()
      if (!allowedExtensions.has(extension)) {
        fail(`${prefix}: unsupported image extension ${extension}.`)
      }
      const expectedFileName = `${goal.id}${extension}`
      if (path.basename(link.url) !== expectedFileName) {
        fail(`${prefix}: image filename must be ${expectedFileName}.`)
      }

      const assetRelativePath = link.url.replace('/assets/goal-visualizations/', '')
      const assetSegments = assetRelativePath.split('/')
      const subjectSegment = assetSegments[0] ?? ''
      if (
        assetSegments.length !== 3
        || !/^[a-z0-9][a-z0-9-]*$/u.test(subjectSegment)
        || assetSegments[1] !== goal.id
        || assetSegments[2] !== expectedFileName
        || assetSegments.some((segment) => segment === '.' || segment === '..' || segment.includes('\\'))
      ) {
        fail(`${prefix}: url must use the exact path schema <subject>/${goal.id}/${expectedFileName}.`)
        continue
      }
      const previousOwner = assetOwners.get(assetRelativePath)
      if (previousOwner && previousOwner !== prefix) {
        fail(`${prefix}: asset ${assetRelativePath} is already owned by ${previousOwner}.`)
      } else {
        assetOwners.set(assetRelativePath, prefix)
      }
      expectedAssetRelativePaths.add(assetRelativePath)

      const canonicalPath = resolveWithinRoot(path.join(repoRoot, canonicalRoot), assetRelativePath)
      if (!canonicalPath) {
        fail(`${prefix}: canonical asset path escapes the visualization root.`)
        continue
      }
      const assetCopies = []
      if (!fs.existsSync(canonicalPath)) {
        fail(`${prefix}: missing canonical asset ${repoRelative(canonicalPath)}.`)
      } else if (!realPathIsWithinRoot(path.join(repoRoot, canonicalRoot), canonicalPath)) {
        fail(`${prefix}: canonical asset escapes the visualization root through a symlink.`)
      } else {
        assetCopies.push(canonicalPath)
      }

      const promptPath = path.join(path.dirname(canonicalPath), 'prompt.de.md')
      if (!fs.existsSync(promptPath)) {
        fail(`${prefix}: missing canonical provider prompt ${repoRelative(promptPath)}.`)
      } else if (!realPathIsWithinRoot(path.join(repoRoot, canonicalRoot), promptPath)) {
        fail(`${prefix}: canonical provider prompt escapes the visualization root through a symlink.`)
      }

      for (const runtimeRoot of runtimeRoots) {
        const runtimePath = resolveWithinRoot(path.join(repoRoot, runtimeRoot), assetRelativePath)
        if (!runtimePath) {
          fail(`${prefix}: runtime asset path escapes ${runtimeRoot}.`)
          continue
        }
        if (!fs.existsSync(runtimePath)) {
          fail(`${prefix}: missing runtime asset ${repoRelative(runtimePath)}.`)
        } else if (!realPathIsWithinRoot(path.join(repoRoot, runtimeRoot), runtimePath)) {
          fail(`${prefix}: runtime asset escapes ${runtimeRoot} through a symlink.`)
        } else {
          assetCopies.push(runtimePath)
        }
      }

      if (assetCopies.length === runtimeRoots.length + 1) {
        const hashes = assetCopies.map(sha256)
        if (new Set(hashes).size !== 1) {
          fail(`${prefix}: canonical/public/backend asset hashes differ for ${assetRelativePath}.`)
        }
      }
    }
  }
}

for (const root of [canonicalRoot, ...runtimeRoots]) {
  const absoluteRoot = path.join(repoRoot, root)
  for (const imagePath of imageFilesBelow(absoluteRoot)) {
    const relativeAssetPath = path.relative(absoluteRoot, imagePath).split(path.sep).join('/')
    if (!expectedAssetRelativePaths.has(relativeAssetPath)) {
      fail(`${repoRelative(imagePath)}: orphan image has no canonical primary goal-visualization link.`)
    }
  }
}

if (failures.length > 0) {
  console.error(`Goal visualization asset check failed with ${failures.length} issue(s):`)
  failures.slice(0, 50).forEach((failure) => console.error(`- ${failure}`))
  if (failures.length > 50) {
    console.error(`... ${failures.length - 50} more issue(s) omitted.`)
  }
  process.exit(1)
}

console.log(`Goal visualization asset check passed for ${checkedLinks} link(s) in ${checkedLandscapes} landscape(s).`)
