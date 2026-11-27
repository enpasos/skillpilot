import fs from 'node:fs'
import path from 'node:path'

const ROOT_DIR = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/visualizations')
const TARGET_DIRS = [
  path.join(ROOT_DIR, 'app/public/assets/goal-visualizations'),
  path.join(ROOT_DIR, 'backend/src/main/resources/static/assets/goal-visualizations'),
]
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg'])

function walkFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath))
    } else if (entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath)
    }
  }
  return files
}

function ensureRegularOutputDirectory(directory: string): void {
  const parent = path.dirname(directory)
  if (parent !== directory) ensureRegularOutputDirectory(parent)
  const metadata = fs.lstatSync(directory, { throwIfNoEntry: false })
  if (metadata) {
    if (metadata.isSymbolicLink() || !metadata.isDirectory()) {
      throw new Error(`Refusing goal visualization output directory alias: ${directory}`)
    }
  } else {
    fs.mkdirSync(directory)
  }
}

export function copyGoalVisualizationAsset(sourcePath: string, targetRoot: string, relativePath: string): void {
  const outputRoot = path.resolve(targetRoot)
  const targetPath = path.resolve(outputRoot, relativePath)
  if (!targetPath.startsWith(`${outputRoot}${path.sep}`)) {
    throw new Error(`Goal visualization output escapes its directory: ${relativePath}`)
  }
  ensureRegularOutputDirectory(path.dirname(targetPath))
  const previous = fs.lstatSync(targetPath, { throwIfNoEntry: false })
  if (previous) {
    if (!previous.isFile() || previous.isSymbolicLink() || previous.nlink !== 1) {
      throw new Error(`Refusing goal visualization output file alias: ${targetPath}`)
    }
    fs.chmodSync(targetPath, (previous.mode & 0o777) | 0o200)
  }
  fs.copyFileSync(sourcePath, targetPath)
  const copied = fs.lstatSync(targetPath)
  if (!copied.isFile() || copied.isSymbolicLink() || copied.nlink !== 1) {
    throw new Error(`Goal visualization copy is not a regular output file: ${targetPath}`)
  }
  fs.chmodSync(targetPath, (copied.mode & 0o777) | 0o200)
}

// A course outside the Gymnasium catalogs keeps its images beside its own data, under
// <course>/static/assets/goal-visualizations/, and links them as /assets/goal-visualizations/...
const COURSE_ASSET_SUFFIX = path.join('static', 'assets', 'goal-visualizations')
const SKIPPED_COURSE_DIRECTORIES = new Set(['Gymnasium', 'quality', 'input', 'visualizations', 'provenance', 'node_modules'])

export function findCourseVisualizationDirectories(curriculaDir: string, depth = 0): string[] {
  if (depth > 8 || !fs.existsSync(curriculaDir)) return []
  const found: string[] = []
  for (const entry of fs.readdirSync(curriculaDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || SKIPPED_COURSE_DIRECTORIES.has(entry.name)) continue
    const fullPath = path.join(curriculaDir, entry.name)
    if (fullPath.endsWith(COURSE_ASSET_SUFFIX)) found.push(fullPath)
    else found.push(...findCourseVisualizationDirectories(fullPath, depth + 1))
  }
  return found.sort()
}

function deployGoalVisualizations() {
  const sources = [SOURCE_DIR, ...findCourseVisualizationDirectories(path.join(ROOT_DIR, 'curricula'))]
  const origins = new Map<string, string>()
  let copied = 0

  for (const sourceDir of sources) {
    for (const sourcePath of walkFiles(sourceDir)) {
      const relativePath = path.relative(sourceDir, sourcePath)
      const earlier = origins.get(relativePath)
      if (earlier) throw new Error(`Two goal visualizations publish ${relativePath}: ${earlier} and ${sourcePath}`)
      origins.set(relativePath, sourcePath)
      for (const targetDir of TARGET_DIRS) {
        copyGoalVisualizationAsset(sourcePath, targetDir, relativePath)
        copied += 1
      }
    }
  }

  const targetList = TARGET_DIRS.map((targetDir) => path.relative(ROOT_DIR, targetDir)).join(', ')
  console.log(`Deployed ${copied} goal visualization asset copy/copies to ${targetList}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  deployGoalVisualizations()
}
