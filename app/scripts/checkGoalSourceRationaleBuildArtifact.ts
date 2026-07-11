import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface RepositoryCompatibilityIndex {
  label: string
  publicIndexPath: string
  builtPublicIndexPath: string
  legacyBundledAssetPattern: RegExp
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const buildAssetsDir = 'backend/src/main/resources/static/assets'
const builtServiceWorkerPath = 'backend/src/main/resources/static/sw.js'

const repositoryCompatibilityIndexes: readonly RepositoryCompatibilityIndex[] = [
  {
    label: 'Mathematik',
    publicIndexPath: 'app/public/data/goal-source-rationales-math-public.json',
    builtPublicIndexPath: 'backend/src/main/resources/static/data/goal-source-rationales-math-public.json',
    legacyBundledAssetPattern: /^goal-source-rationales-math-public-[A-Za-z0-9_-]+\.json$/u,
  },
  {
    label: 'Physik',
    publicIndexPath: 'app/public/data/goal-source-rationales-physics-public.json',
    builtPublicIndexPath: 'backend/src/main/resources/static/data/goal-source-rationales-physics-public.json',
    legacyBundledAssetPattern: /^goal-source-rationales-physics-public-[A-Za-z0-9_-]+\.json$/u,
  },
]

const absolutePath = (repoPath: string): string => resolve(repoRoot, repoPath)

const failures: string[] = []
const absoluteAssetsDir = absolutePath(buildAssetsDir)

if (!existsSync(absoluteAssetsDir)) {
  failures.push(`${buildAssetsDir}: missing build assets directory; run npm run build first`)
}

const builtAssetNames = existsSync(absoluteAssetsDir)
  ? readdirSync(absoluteAssetsDir).sort((left, right) => left.localeCompare(right, 'en'))
  : []
const builtJsFiles = builtAssetNames
  .filter((fileName) => fileName.endsWith('.js'))
  .map((fileName) => absolutePath(`${buildAssetsDir}/${fileName}`))
  .filter((filePath) => statSync(filePath).isFile())
const builtJsContents = builtJsFiles.map((filePath) => ({
  filePath,
  content: readFileSync(filePath, 'utf8'),
}))
const builtServiceWorker = existsSync(absolutePath(builtServiceWorkerPath))
  ? readFileSync(absolutePath(builtServiceWorkerPath), 'utf8')
  : null
if (builtServiceWorker === null) {
  failures.push(`${builtServiceWorkerPath}: missing built service worker; run npm run build first`)
}

repositoryCompatibilityIndexes.forEach((config) => {
  const publicPath = absolutePath(config.publicIndexPath)
  const builtPublicPath = absolutePath(config.builtPublicIndexPath)
  if (!existsSync(publicPath)) {
    failures.push(`${config.publicIndexPath}: missing repository compatibility index`)
    return
  }
  if (!existsSync(builtPublicPath)) {
    failures.push(`${config.builtPublicIndexPath}: missing repository compatibility copy`)
    return
  }
  if (!readFileSync(publicPath).equals(readFileSync(builtPublicPath))) {
    failures.push(`${config.builtPublicIndexPath}: differs from ${config.publicIndexPath}`)
  }

  const legacyBundledAssets = builtAssetNames.filter((fileName) => (
    config.legacyBundledAssetPattern.test(fileName)
  ))
  if (legacyBundledAssets.length > 0) {
    failures.push(
      `${buildAssetsDir}: ${config.label} source rationale must not be bundled as hashed JSON assets: ${legacyBundledAssets.join(', ')}`,
    )
  }

  const publicRuntimePath = `/data/${basename(config.publicIndexPath)}`
  if (!builtJsContents.some(({ content }) => content.includes(publicRuntimePath))) {
    failures.push(
      `${buildAssetsDir}: no lazy repository compatibility module references ${publicRuntimePath}`,
    )
  }
  if (builtServiceWorker?.includes(publicRuntimePath) || builtServiceWorker?.includes(basename(config.publicIndexPath))) {
    failures.push(`${builtServiceWorkerPath}: must not precache repository source rationale ${publicRuntimePath}`)
  }
})

const inlinedPayloadFiles = builtJsContents
  .filter(({ content }) => content.includes('"sourceRationaleStatus"'))
  .map(({ filePath }) => basename(filePath))
if (inlinedPayloadFiles.length > 0) {
  failures.push(
    `${buildAssetsDir}: source-rationale payload data was inlined into JavaScript: ${inlinedPayloadFiles.join(', ')}`,
  )
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    'Goal source-rationale build check passed: package mode has no bundled JSON index; repository compatibility remains lazy and public-only.',
  )
}
