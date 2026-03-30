import { readdirSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import {
  normalizeCanonicalLandscape,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'

interface CoverageRow {
  landscapeId: string
  frameworkId: string
  title: string
  viewIds: string[]
  notes: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/canonical')
const compositionViewRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views')

const collectFiles = (directory: string, predicate: (fileName: string) => boolean, target: string[] = []): string[] => {
  let entries: ReturnType<typeof readdirSync>
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return target
  }

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectFiles(absolutePath, predicate, target)
      continue
    }
    if (!entry.isFile()) continue
    if (!predicate(entry.name)) continue
    target.push(absolutePath)
  }

  return target
}

const canonicalFiles = collectFiles(canonicalRoot, (fileName) => extname(fileName).toLowerCase() === '.json')
const compositionViewFiles = collectFiles(compositionViewRoot, (fileName) => /\.view\.json$/i.test(fileName))

const canonicalLandscapes: CanonicalAuthoringLandscape[] = canonicalFiles
  .map((canonicalPath) => normalizeCanonicalLandscape(JSON.parse(readFileSync(canonicalPath, 'utf8'))))
  .filter((landscape) => landscape.frameworkId.startsWith('canonical-gymnasium'))
  .sort((left, right) => left.title.localeCompare(right.title, 'de', { sensitivity: 'base' }))

const collectCoverageNotes = (landscape: CanonicalAuthoringLandscape): string[] => {
  const notes: string[] = []
  const localGoalIds = new Set(landscape.goals.map((goal) => goal.id))
  const referencesExternalGoals = landscape.goals.some((goal) =>
    (goal.contains ?? []).some((childId) => !localGoalIds.has(childId)),
  )

  if (referencesExternalGoals) {
    notes.push('closure root references external canonical goals; same-landscape composition views are not sufficient here')
  }

  return notes
}

const viewIdsByLandscapeId = new Map<string, string[]>()
compositionViewFiles.forEach((viewPath) => {
  const view = normalizeCompositionView(JSON.parse(readFileSync(viewPath, 'utf8')))
  const existing = viewIdsByLandscapeId.get(view.landscapeId) ?? []
  existing.push(view.viewId)
  viewIdsByLandscapeId.set(view.landscapeId, existing)
})

const coverageRows: CoverageRow[] = canonicalLandscapes.map((landscape) => ({
  landscapeId: landscape.landscapeId,
  frameworkId: landscape.frameworkId,
  title: landscape.title,
  viewIds: (viewIdsByLandscapeId.get(landscape.landscapeId) ?? []).sort((left, right) =>
    left.localeCompare(right, 'de', { sensitivity: 'base' }),
  ),
  notes: collectCoverageNotes(landscape),
}))

const withViews = coverageRows.filter((row) => row.viewIds.length > 0)
const withoutViews = coverageRows.filter((row) => row.viewIds.length === 0)

console.log('Learner Tree Fallback Coverage')
console.log(`Canonical Gymnasium landscapes: ${coverageRows.length}`)
console.log(`With composition views: ${withViews.length}`)
console.log(`Without composition views: ${withoutViews.length}`)
console.log('')

coverageRows.forEach((row) => {
  if (row.viewIds.length > 0) {
    console.log(`✅ ${row.title} [${row.frameworkId}]`)
    console.log(`   landscapeId: ${row.landscapeId}`)
    console.log(`   views: ${row.viewIds.join(', ')}`)
    row.notes.forEach((note) => console.log(`   note: ${note}`))
    return
  }

  console.log(`⚠️  ${row.title} [${row.frameworkId}]`)
  console.log(`   landscapeId: ${row.landscapeId}`)
  console.log('   views: none -> learner tree still depends on fallback projection where synthetic structure appears')
  row.notes.forEach((note) => console.log(`   note: ${note}`))
})
