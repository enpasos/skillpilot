import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

type Goal = {
  id: string
  courseLevel?: string
  tags?: string[]
  [key: string]: unknown
}

type Landscape = {
  filters?: { id: string; label: string }[]
  goals: Goal[]
  [key: string]: unknown
}

const filtersDefault = [
  { id: 'GK', label: 'Grundkurs' },
  { id: 'LK', label: 'Leistungskurs' },
]

function migrateGoal(goal: Goal): Goal {
  const tags = Array.isArray(goal.tags) ? [...goal.tags] : []
  const cl = goal.courseLevel
  if (cl === 'GK') {
    if (!tags.includes('GK')) tags.push('GK')
  } else if (cl === 'LK') {
    if (!tags.includes('LK')) tags.push('LK')
  } else if (cl === 'both') {
    if (!tags.includes('GK')) tags.push('GK')
    if (!tags.includes('LK')) tags.push('LK')
  }
  const updated: Goal = { ...goal, tags }
  delete (updated as { courseLevel?: string }).courseLevel
  return updated
}

function migrateLandscape(path: string) {
  const raw = readFileSync(path, 'utf-8')
  const data = JSON.parse(raw) as Landscape
  const nextFilters = Array.isArray(data.filters) && data.filters.length > 0 ? data.filters : filtersDefault
  const goals = Array.isArray(data.goals) ? data.goals.map(migrateGoal) : []
  const updated: Landscape = { ...data, filters: nextFilters, goals }
  writeFileSync(path, JSON.stringify(updated, null, 2) + '\n', 'utf-8')
  console.log(`migrated ${path}`)
}

function main() {
  const dir = join(process.cwd(), 'landscapes')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  files.forEach((file) => migrateLandscape(join(dir, file)))
}

main()
