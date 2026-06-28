import fs from 'node:fs'
import path from 'node:path'

const ROOT_DIR = path.resolve(__dirname, '..')
const SOURCE_DIR = path.join(ROOT_DIR, 'curricula/DE/Gymnasium/visualizations')
const TARGET_DIR = path.join(ROOT_DIR, 'app/public/assets/goal-visualizations')
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

function deployGoalVisualizations() {
  const files = walkFiles(SOURCE_DIR)
  let copied = 0

  for (const sourcePath of files) {
    const relativePath = path.relative(SOURCE_DIR, sourcePath)
    const targetPath = path.join(TARGET_DIR, relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.copyFileSync(sourcePath, targetPath)
    copied += 1
  }

  console.log(`Deployed ${copied} goal visualization asset(s) to ${path.relative(ROOT_DIR, TARGET_DIR)}`)
}

deployGoalVisualizations()
