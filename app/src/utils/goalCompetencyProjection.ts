import type { UiGoal } from '../goalTypes'
import type { CompetencyCatalogEntry, LearningLandscape } from '../landscapeTypes'
import { goalMatchesFilter } from './goalFilters'

export interface CompetencyProjectableLandscapeEntry {
  meta: LearningLandscape
  goals: UiGoal[]
}

const SYNTHETIC_COMPETENCY_TAG = 'synthetic:competency-axis'
const COMPETENCY_DIMENSION_ROOT_TAG = 'competency-axis:dimension-root'
const COMPETENCY_ENTRY_TAG = 'competency-axis:entry'
const SYNTHETIC_PROGRAM_UNIT_TAG = 'synthetic:program-unit'

const normalizeComparableText = (value: string | undefined): string =>
  (value ?? '')
    .normalize('NFKC')
    .toLocaleLowerCase('de-DE')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeCompetencyRef = (value: string | undefined): string =>
  (value ?? '')
    .trim()
    .toUpperCase()

const competencyShortId = (value: string): string => {
  const normalized = normalizeCompetencyRef(value)
  const parts = normalized.split(/[.:]/)
  return parts[parts.length - 1] ?? normalized
}

const competencyRefMatchesEntry = (ref: string, entryId: string): boolean => {
  const normalizedRef = normalizeCompetencyRef(ref)
  const normalizedEntryId = normalizeCompetencyRef(entryId)
  const shortId = competencyShortId(entryId)

  if (!normalizedRef || !normalizedEntryId) return false
  if (normalizedRef === normalizedEntryId) return true
  if (normalizedRef === shortId) return true
  if (normalizedRef.startsWith(`${shortId}.`)) return true
  if (normalizedRef.startsWith(`${normalizedEntryId}.`)) return true
  return false
}

const getGoalCompetencyRefs = (goal: UiGoal): string[] => {
  const refs = [
    ...(Array.isArray(goal.competencyRefs) ? goal.competencyRefs : []),
    ...(Array.isArray(goal.kompetenzen) ? goal.kompetenzen : []),
  ]

  return Array.from(new Set(
    refs
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter(Boolean),
  ))
}

const getDimensionRootLabel = (dimension: string): string => {
  const normalized = normalizeComparableText(dimension)
  if (normalized === 'process-competency') {
    return 'Prozessbezogene Kompetenzen (K)'
  }

  return dimension
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const getEntryTitleCandidates = (catalogEntry: CompetencyCatalogEntry): string[] => {
  const shortId = competencyShortId(catalogEntry.id)
  return [
    catalogEntry.label,
    `${shortId} ${catalogEntry.label}`,
  ].map(normalizeComparableText)
}

const isExistingDimensionRoot = (
  goal: UiGoal,
  dimension: string,
  activeFilter?: string,
): boolean => {
  if (!goalMatchesFilter(goal, activeFilter)) return false
  return normalizeComparableText(goal.title) === normalizeComparableText(getDimensionRootLabel(dimension))
}

const isExistingEntryNode = (
  goal: UiGoal,
  catalogEntry: CompetencyCatalogEntry,
  activeFilter?: string,
): boolean => {
  if (!goalMatchesFilter(goal, activeFilter)) return false
  const normalizedTitle = normalizeComparableText(goal.title)
  return getEntryTitleCandidates(catalogEntry).includes(normalizedTitle)
}

const createSyntheticCluster = (
  id: string,
  title: string,
  description: string,
  contains: string[],
  treeOrder: number,
  extraTags: string[] = [],
): UiGoal => ({
  id,
  title,
  description,
  phase: 'GLOBAL',
  themenfeld: '',
  area: 'Competency Axis',
  level: 2,
  core: true,
  weight: Math.max(contains.length, 1),
  tags: [SYNTHETIC_COMPETENCY_TAG, ...extraTags],
  leitideen: [],
  kompetenzen: [],
  sourceRef: 'runtime competency projection',
  requires: [],
  contains,
  examples: [],
  competencyRefs: [],
  effectiveRequires: [],
  inheritedRequires: [],
  extendedData: { treeOrder, synthetic: true },
  type: 'cluster',
  nodeKind: 'tutor',
})

export function applyCompetencyAxisProjection<T extends CompetencyProjectableLandscapeEntry>(
  entries: T[],
  activeFilter?: string,
): T[] {
  return entries.map((entry) => {
    const catalog = entry.meta.competencyCatalog
    if (!Array.isArray(catalog) || catalog.length === 0) return entry
    if (!Array.isArray(entry.goals) || entry.goals.length === 0) return entry

    const rootGoal = entry.goals.find((goal) => goal.tags?.includes('root'))
    if (!rootGoal) return entry

    const clonedGoals = entry.goals.map((goal) => ({
      ...goal,
      contains: Array.isArray(goal.contains) ? [...goal.contains] : [],
      tags: Array.isArray(goal.tags) ? [...goal.tags] : [],
    }))
    const goalById = new Map(clonedGoals.map((goal) => [goal.id, goal]))
    const clonedRoot = goalById.get(rootGoal.id)
    if (!clonedRoot) return entry

    const entriesByDimension = new Map<string, CompetencyCatalogEntry[]>()
    catalog.forEach((catalogEntry) => {
      const bucket = entriesByDimension.get(catalogEntry.dimension) ?? []
      bucket.push(catalogEntry)
      entriesByDimension.set(catalogEntry.dimension, bucket)
    })

    const syntheticGoals: UiGoal[] = []
    let didMutate = false
    let dimensionOrder = 1

    entriesByDimension.forEach((dimensionEntries, dimension) => {
      const existingDimensionRoot = clonedGoals.find((goal) =>
        isExistingDimensionRoot(goal, dimension, activeFilter),
      )
      const dimensionChildren = new Set<string>(existingDimensionRoot?.contains ?? [])
      const dimensionRootId = existingDimensionRoot?.id
        ?? `synthetic:${entry.meta.landscapeId}:competency-dimension:${dimension}`

      dimensionEntries.forEach((catalogEntry, index) => {
        const existingEntryNode = clonedGoals.find((goal) =>
          isExistingEntryNode(goal, catalogEntry, activeFilter),
        )
        const excludedGoalIds = new Set<string>([
          clonedRoot.id,
          dimensionRootId,
          ...(existingDimensionRoot?.contains ?? []),
          ...dimensionEntries
            .map((candidate) => clonedGoals.find((goal) => isExistingEntryNode(goal, candidate, activeFilter))?.id)
            .filter((value): value is string => typeof value === 'string'),
        ])
        const childGoalIds = clonedGoals
          .filter((goal) => {
            if (excludedGoalIds.has(goal.id)) return false
            if (goal.tags?.includes(SYNTHETIC_COMPETENCY_TAG)) return false
            if (!goalMatchesFilter(goal, activeFilter)) return false
            const refs = getGoalCompetencyRefs(goal)
            return refs.some((ref) => competencyRefMatchesEntry(ref, catalogEntry.id))
          })
          .map((goal) => goal.id)

        if (existingEntryNode) {
          if (!existingEntryNode.tags.includes(COMPETENCY_ENTRY_TAG)) {
            existingEntryNode.tags.push(COMPETENCY_ENTRY_TAG)
            didMutate = true
          }
          if (!existingEntryNode.tags.includes(`competency-dimension:${dimension}`)) {
            existingEntryNode.tags.push(`competency-dimension:${dimension}`)
            didMutate = true
          }
          if (!existingEntryNode.tags.includes(`competency-id:${catalogEntry.id}`)) {
            existingEntryNode.tags.push(`competency-id:${catalogEntry.id}`)
            didMutate = true
          }
          const mergedChildren = Array.from(new Set([...(existingEntryNode.contains ?? []), ...childGoalIds]))
          didMutate = didMutate || mergedChildren.length !== (existingEntryNode.contains ?? []).length
          existingEntryNode.contains = mergedChildren
          if (mergedChildren.length > 0) {
            dimensionChildren.add(existingEntryNode.id)
          }
          return
        }

        if (childGoalIds.length === 0) return

        const competencyGoalId = `synthetic:${entry.meta.landscapeId}:competency:${catalogEntry.id}`
        const competencyDescription =
          `Synthetischer Querschnittsknoten für ${catalogEntry.label}. Die zugeordneten Ziele werden aus competency refs und Legacy-Prozesskompetenzen projiziert.`

        syntheticGoals.push(
          createSyntheticCluster(
            competencyGoalId,
            `${competencyShortId(catalogEntry.id)} ${catalogEntry.label}`,
            competencyDescription,
            childGoalIds,
            index + 1,
            [
              SYNTHETIC_COMPETENCY_TAG,
              COMPETENCY_ENTRY_TAG,
              `competency-dimension:${dimension}`,
              `competency-id:${catalogEntry.id}`,
            ],
          ),
        )
        dimensionChildren.add(competencyGoalId)
      })

      if (dimensionChildren.size === 0) {
        return
      }

      if (existingDimensionRoot) {
        if (!existingDimensionRoot.tags.includes(COMPETENCY_DIMENSION_ROOT_TAG)) {
          existingDimensionRoot.tags.push(COMPETENCY_DIMENSION_ROOT_TAG)
          didMutate = true
        }
        if (!existingDimensionRoot.tags.includes(`competency-dimension:${dimension}`)) {
          existingDimensionRoot.tags.push(`competency-dimension:${dimension}`)
          didMutate = true
        }
        const mergedDimensionChildren = Array.from(new Set([
          ...(existingDimensionRoot.contains ?? []),
          ...dimensionChildren,
        ]))
        didMutate = didMutate || mergedDimensionChildren.length !== (existingDimensionRoot.contains ?? []).length
        existingDimensionRoot.contains = mergedDimensionChildren
      } else {
        syntheticGoals.push(
          createSyntheticCluster(
            dimensionRootId,
            getDimensionRootLabel(dimension),
            'Synthetischer Strukturknoten für eine Kompetenzachse. Die enthaltenen Einträge sind keine primären fachlichen Goals, sondern projektierte Kompetenzdimensionen.',
            Array.from(dimensionChildren),
            dimensionOrder + 0.5,
            [SYNTHETIC_COMPETENCY_TAG, COMPETENCY_DIMENSION_ROOT_TAG, `competency-dimension:${dimension}`],
          ),
        )
      }

      const dimensionRootAlreadyNestedUnderProgramUnit = clonedGoals.some((goal) =>
        goal.id !== clonedRoot.id
        && goal.tags?.includes(SYNTHETIC_PROGRAM_UNIT_TAG)
        && (goal.contains ?? []).includes(dimensionRootId),
      )

      if (!dimensionRootAlreadyNestedUnderProgramUnit && !clonedRoot.contains.includes(dimensionRootId)) {
        clonedRoot.contains.push(dimensionRootId)
        didMutate = true
      }
      dimensionOrder += 1
    })

    if (!didMutate && syntheticGoals.length === 0) return entry

    return {
      ...entry,
      goals: [...clonedGoals, ...syntheticGoals],
    }
  })
}
