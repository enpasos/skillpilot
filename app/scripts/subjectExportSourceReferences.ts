export type SourceReferenceCollection = Record<string, unknown> & {
  artifactPath: string | null
  sourceGoals: Record<string, unknown>[]
}

export type SourceReferenceMatch = {
  artifactPath: string | null
  source: SourceReferenceCollection
  goal: Record<string, unknown>
}

const object = (value: unknown): Record<string, unknown> | null => (
  value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null
)
const nonemptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const packagePath = (value: unknown, prefix: string): value is string => (
  nonemptyString(value) && value.startsWith(prefix) && !value.includes('\\')
  && value.split('/').every((part) => part.length > 0 && part !== '.' && part !== '..')
)

// Version 1 used globally unique bare IDs. Version 2 preserves independently
// authored source versions and binds each mapping to its declared collections.
// Resolution returns a set of records; overlapping versions never overwrite text.
export const parseSubjectExportSourceReferences = (
  value: unknown,
  options: { artifactPaths?: ReadonlySet<string>; mappingPaths?: ReadonlySet<string> } = {},
) => {
  const issues: string[] = []
  const data = object(value)
  const schemaVersion = data?.schemaVersion === 1 ? 1 : data?.schemaVersion === 2 ? 2 : null
  if (!schemaVersion) issues.push('Unsupported source-goal reference schemaVersion')
  if (!Array.isArray(data?.sources)) issues.push('Source-goal reference sources must be an array')
  const sources: SourceReferenceCollection[] = []
  const collections = new Map<string, SourceReferenceCollection>()
  const byId = new Map<string, SourceReferenceMatch[]>()
  let goalCount = 0
  for (const raw of Array.isArray(data?.sources) ? data.sources : []) {
    const source = object(raw)
    if (!source || !Array.isArray(source.sourceGoals)) {
      issues.push('Source-goal reference collection must contain sourceGoals')
      continue
    }
    const artifactPath = schemaVersion === 2 && typeof source.artifactPath === 'string' ? source.artifactPath : null
    const collection: SourceReferenceCollection = { ...source, artifactPath, sourceGoals: [] }
    sources.push(collection)
    if (schemaVersion === 2) {
      if (!packagePath(artifactPath, 'data/sources/') || !artifactPath.endsWith('.json')) {
        issues.push('Source collection artifactPath must identify a packaged source JSON artifact')
      } else if (collections.has(artifactPath)) {
        issues.push(`Duplicate source collection artifactPath: ${artifactPath}`)
      } else {
        collections.set(artifactPath, collection)
        if (options.artifactPaths && !options.artifactPaths.has(artifactPath)) issues.push(`Missing source collection artifact: ${artifactPath}`)
      }
    }
    const localIds = new Set<string>()
    for (const rawGoal of source.sourceGoals) {
      goalCount += 1
      const goal = object(rawGoal)
      if (!goal || !nonemptyString(goal.sourceGoalId)) {
        issues.push(`Missing sourceGoalId in ${artifactPath ?? 'legacy source collection'}`)
        continue
      }
      collection.sourceGoals.push(goal)
      const id = goal.sourceGoalId
      if (localIds.has(id)) issues.push(`Duplicate sourceGoalId within collection ${artifactPath ?? '(legacy)'}: ${id}`)
      localIds.add(id)
      const matches = byId.get(id) ?? []
      if (schemaVersion === 1 && matches.length > 0) issues.push(`Duplicate legacy sourceGoalId: ${id}`)
      matches.push({ artifactPath, source: collection, goal })
      byId.set(id, matches)
    }
  }
  if (schemaVersion === 2 && data?.sourceGoalReferenceCount !== goalCount) issues.push('sourceGoalReferenceCount does not match source goal records')
  const bindings = new Map<string, Set<string>>()
  if (schemaVersion === 2) {
    if (!Array.isArray(data?.mappingSourceBindings)) issues.push('Version 2 requires mappingSourceBindings')
    for (const raw of Array.isArray(data?.mappingSourceBindings) ? data.mappingSourceBindings : []) {
      const binding = object(raw)
      const mappingPath = binding?.mappingPath
      if (!packagePath(mappingPath, 'data/mappings/') || !mappingPath.endsWith('.review.json')) {
        issues.push('Invalid source binding mappingPath')
        continue
      }
      if (bindings.has(mappingPath)) {
        issues.push(`Duplicate mapping source binding: ${mappingPath}`)
        continue
      }
      const paths = binding?.sourceArtifactPaths
      const selected = new Set<string>()
      if (!Array.isArray(paths) || paths.length === 0) issues.push(`Missing authored source collections for ${mappingPath}`)
      for (const path of Array.isArray(paths) ? paths : []) {
        if (typeof path !== 'string' || !collections.has(path)) {
          issues.push(`Unknown source collection binding in ${mappingPath}: ${String(path)}`)
        } else if (selected.has(path)) {
          issues.push(`Duplicate source collection binding in ${mappingPath}: ${path}`)
        } else {
          selected.add(path)
        }
      }
      if (options.mappingPaths && !options.mappingPaths.has(mappingPath)) issues.push(`Unknown mapping source binding: ${mappingPath}`)
      bindings.set(mappingPath, selected)
    }
    for (const path of options.mappingPaths ?? []) {
      if (!bindings.has(path)) issues.push(`Missing mapping source binding: ${path}`)
    }
  }
  return {
    schemaVersion,
    sources,
    issues,
    resolveMapping: (mappingPath: string, sourceGoalId: string): SourceReferenceMatch[] => {
      const matches = byId.get(sourceGoalId) ?? []
      if (schemaVersion === 1) return matches.length === 1 ? matches : []
      if (schemaVersion !== 2) return []
      const selected = bindings.get(mappingPath)
      return selected ? matches.filter((match) => match.artifactPath !== null && selected.has(match.artifactPath)) : []
    },
  }
}
