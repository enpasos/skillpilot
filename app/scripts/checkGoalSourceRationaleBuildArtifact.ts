import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')

const sourceIndexPath = 'app/src/data/goal-source-rationales-math-public.json'
const buildAssetsDir = 'backend/src/main/resources/static/assets'
const assetFilePattern = /^goal-source-rationales-math-public-[A-Za-z0-9_-]+\.json$/u

function absolutePath(repoPath: string): string {
  return resolve(repoRoot, repoPath)
}

function readJson(repoPath: string): Record<string, unknown> {
  return JSON.parse(readFileSync(absolutePath(repoPath), 'utf8')) as Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function readItems(payload: Record<string, unknown>): unknown[] {
  return Array.isArray(payload.items) ? payload.items : []
}

function collectBuiltJsFiles(assetsDir: string): string[] {
  return readdirSync(assetsDir)
    .filter((fileName) => fileName.endsWith('.js'))
    .map((fileName) => resolve(assetsDir, fileName))
    .filter((filePath) => statSync(filePath).isFile())
}

const failures: string[] = []
const absoluteAssetsDir = absolutePath(buildAssetsDir)

if (!existsSync(absoluteAssetsDir)) {
  failures.push(`${buildAssetsDir}: missing build assets directory; run npm run build first`)
}

if (!existsSync(absolutePath(sourceIndexPath))) {
  failures.push(`${sourceIndexPath}: missing source-rationale source index`)
}

if (failures.length === 0) {
  const assetFiles = readdirSync(absoluteAssetsDir)
    .filter((fileName) => assetFilePattern.test(fileName))
    .sort((left, right) => left.localeCompare(right, 'en'))

  if (assetFiles.length !== 1) {
    failures.push(`${buildAssetsDir}: expected exactly one built goal-source-rationale JSON asset, found ${assetFiles.length}`)
  } else {
    const sourceIndex = readJson(sourceIndexPath)
    const builtAssetPath = `${buildAssetsDir}/${assetFiles[0]}`
    const builtIndex = readJson(builtAssetPath)

    const sourceItems = readItems(sourceIndex)
    const builtItems = readItems(builtIndex)
    const sourceSummary = JSON.stringify(asRecord(sourceIndex.summary))
    const builtSummary = JSON.stringify(asRecord(builtIndex.summary))

    if (sourceItems.length !== builtItems.length) {
      failures.push(`${builtAssetPath}: item count differs from ${sourceIndexPath}`)
    }
    if (sourceSummary !== builtSummary) {
      failures.push(`${builtAssetPath}: summary differs from ${sourceIndexPath}`)
    }

    const publicAssetPath = `/assets/${assetFiles[0]}`
    const jsReferenceCount = collectBuiltJsFiles(absoluteAssetsDir)
      .filter((filePath) => readFileSync(filePath, 'utf8').includes(publicAssetPath))
      .length

    if (jsReferenceCount === 0) {
      failures.push(`${buildAssetsDir}: no built JS file references ${publicAssetPath}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('Goal source-rationale build artifact check passed.')
}
