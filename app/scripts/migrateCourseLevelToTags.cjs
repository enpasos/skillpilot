const { readFileSync, writeFileSync, readdirSync } = require('fs')
const { join } = require('path')

const filtersDefault = [
  { id: 'GK', label: 'Grundkurs' },
  { id: 'LK', label: 'Leistungskurs' },
]

function migrateGoal(goal) {
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
  const { courseLevel, ...rest } = goal
  return { ...rest, tags }
}

function migrateLandscape(path) {
  const raw = readFileSync(path, 'utf-8')
  const data = JSON.parse(raw)
  const nextFilters = Array.isArray(data.filters) && data.filters.length > 0 ? data.filters : filtersDefault
  const goals = Array.isArray(data.goals) ? data.goals.map(migrateGoal) : []
  const updated = { ...data, filters: nextFilters, goals }
  writeFileSync(path, JSON.stringify(updated, null, 2) + '\n', 'utf-8')
  console.log(`migrated ${path}`)
}

function main() {
  const dir = join(process.cwd(), 'landscapes')
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  files.forEach((file) => migrateLandscape(join(dir, file)))
}

main()
