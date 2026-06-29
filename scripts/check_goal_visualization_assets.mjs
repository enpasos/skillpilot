import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const landscapePath = path.join(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const runtimeRoots = [
  'app/public/assets/goal-visualizations',
  'backend/src/main/resources/static/assets/goal-visualizations',
]
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function repoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/')
}

function fail(message) {
  failures.push(message)
}

const failures = []
const landscape = JSON.parse(fs.readFileSync(landscapePath, 'utf8'))
let checkedLinks = 0

for (const goal of landscape.goals ?? []) {
  for (const link of goal.resourceLinks ?? []) {
    if (link?.type !== 'goal-visualization' && link?.resourceType !== 'goal-visualization') {
      continue
    }
    checkedLinks += 1

    if (link.resourceType !== 'image') {
      fail(`${goal.id}: goal-visualization link must use resourceType=image.`)
    }
    if (link.role !== 'primary') {
      fail(`${goal.id}: goal-visualization link must use role=primary.`)
    }
    if (link.skillpilotId !== goal.id) {
      fail(`${goal.id}: skillpilotId must equal the containing goal id.`)
    }
    if (!link.altText || typeof link.altText !== 'string' || link.altText.trim() === '') {
      fail(`${goal.id}: goal-visualization link is missing altText.`)
    }
    if (!link.reviewStatus || typeof link.reviewStatus !== 'string' || link.reviewStatus.trim() === '') {
      fail(`${goal.id}: goal-visualization link is missing reviewStatus.`)
    }
    if (!link.url || typeof link.url !== 'string') {
      fail(`${goal.id}: goal-visualization link is missing url.`)
      continue
    }
    if (!link.url.startsWith('/assets/goal-visualizations/')) {
      fail(`${goal.id}: url must start with /assets/goal-visualizations/.`)
      continue
    }

    const extension = path.extname(link.url).toLowerCase()
    if (!allowedExtensions.has(extension)) {
      fail(`${goal.id}: unsupported image extension ${extension}.`)
    }
    const expectedFileName = `${goal.id}${extension}`
    if (path.basename(link.url) !== expectedFileName) {
      fail(`${goal.id}: image filename must be ${expectedFileName}.`)
    }

    const assetRelativePath = link.url.replace('/assets/goal-visualizations/', '')
    for (const runtimeRoot of runtimeRoots) {
      const runtimePath = path.join(repoRoot, runtimeRoot, assetRelativePath)
      if (!fs.existsSync(runtimePath)) {
        fail(`${goal.id}: missing runtime asset ${repoRelative(runtimePath)}.`)
      }
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

console.log(`Goal visualization asset check passed for ${checkedLinks} link(s).`)
