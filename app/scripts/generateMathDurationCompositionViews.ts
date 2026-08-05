import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

type DurationModel = 'G8' | 'G9'

type CompositionNode =
  | {
      kind: 'structure'
      id: string
      label: string
      children: CompositionNode[]
    }
  | {
      kind: 'canonicalSubtree'
      goalId: string
      displayLabel?: string
      projectionRole?: 'target' | 'prerequisiteOnly'
    }
  | {
      kind: 'goalEntry'
      goalId: string
      displayLabel?: string
      projectionRole?: 'target' | 'prerequisiteOnly'
    }
  | {
      kind: 'landscapeEntry'
      landscapeId: string
      displayLabel?: string
    }

interface CompositionView {
  viewId: string
  landscapeId: string
  scope: Record<string, string>
  rootNodes: CompositionNode[]
  [key: string]: unknown
}

interface LearningGoal {
  id?: string
  title?: string
  contains?: string[]
  requires?: string[]
  tags?: string[]
  phase?: string
  dimensionTags?: {
    phase?: string
    topicCode?: string
  }
}

interface SourceGoal {
  id?: string
  tags?: string[]
}

interface MappingEntry {
  legacyGoalId?: string
  canonicalGoalId?: string
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldWrite = process.argv.includes('--write')
const shouldCheck = process.argv.includes('--check')
const durationModels: DurationModel[] = ['G8', 'G9']
const yearLabelsByDuration: Record<DurationModel, string[]> = {
  G8: ['5', '6', '7', '8', '9'],
  G9: ['5', '6', '7', '8', '9', '10'],
}

const canonicalMathPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
)
const sourceExtractionPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json',
)
const mappingPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
)
const rpSourceExtractionPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/RP/lower-secondary/source-extraction/DE_RP_MATHEMATIK_SEKI_RAHMENLEHRPLAN_2007.source-extraction.json',
)
const rpMappingPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_math_lower_secondary_source_extraction_to_canonical_math.review.json',
)
const shSourceJsonPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/SH/lower-secondary/source-json/DE_SHL_S_GYM_1_MATHEMATIK.de.json.snapshot',
)
const shMappingPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-SH/lower-secondary/sh_math_lower_secondary_to_canonical_math.json',
)
const compositionViewDir = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/mathematik')

const CANONICAL_MATH_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const SEK1_MOTIVATION_GOAL_ID = '65365dce-f33f-49d8-9516-42f75883aa86'
const SEK1_MEMORY_GOAL_ID = '4eefbd04-9e49-41ea-a087-9ad6ac71ec5a'
const SEK1_EXAM_FOLDER_IDS_BY_YEAR: Record<string, string> = {
  '5': '81c8da58-9258-488e-9ab8-48500ab31652',
  '6': '7a2a5706-aff4-4fd0-b092-1779d6ecbc1f',
  '7': '811d6d09-130e-47b2-aba8-a5c401fe3251',
  '8': '5fb3ee61-059c-47f4-8c6f-7285d7982a41',
  '9': 'f6c9c2b8-3dbd-4839-972f-c60f33c44b63',
  '10': 'cb20dd6b-c4ff-4a1b-9636-3b3d6ea86aa8',
}

const GENERATED_VIEW_PATHS = [
  'de-he-seki-g8.view.json',
  'de-he-seki-g9.view.json',
  'de-he-gk-g8.view.json',
  'de-he-gk-g9.view.json',
  'de-he-lk-g8.view.json',
  'de-he-lk-g9.view.json',
  'de-rp-seki-g8.view.json',
  'de-rp-seki-g9.view.json',
  'de-rp-gk-g8.view.json',
  'de-rp-gk-g9.view.json',
  'de-rp-lk-g8.view.json',
  'de-rp-lk-g9.view.json',
  'de-sh-seki-g8.view.json',
  'de-sh-seki-g9.view.json',
  'de-sh-gk-g8.view.json',
  'de-sh-gk-g9.view.json',
  'de-sh-lk-g8.view.json',
  'de-sh-lk-g9.view.json',
]

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

const normalizeDurationModel = (value?: string): DurationModel | null => {
  const normalized = value?.trim().toUpperCase()
  return normalized === 'G8' || normalized === 'G9' ? normalized : null
}

const extractTagValue = (tags: string[] | undefined, prefix: string): string | null => {
  const tag = tags?.find((entry) => entry.startsWith(prefix))
  return tag ? tag.slice(prefix.length) : null
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const sortGoalIdsByTitle = (goalIds: Iterable<string>, goalById: Map<string, LearningGoal>) =>
  Array.from(goalIds).sort((left, right) => {
    const leftTitle = goalById.get(left)?.title ?? ''
    const rightTitle = goalById.get(right)?.title ?? ''
    const titleCompare = leftTitle.localeCompare(rightTitle, 'de', { numeric: true, sensitivity: 'base' })
    return titleCompare || left.localeCompare(right)
  })

const collectReferencedGoalIds = (node: CompositionNode, target: Set<string>) => {
  if (node.kind === 'canonicalSubtree' || node.kind === 'goalEntry') {
    target.add(node.goalId)
    return
  }
  if (node.kind === 'structure') {
    node.children.forEach((child) => collectReferencedGoalIds(child, target))
  }
}

const collectGoalEntriesFromStructure = (rootNodes: CompositionNode[], structureId: string) => {
  const entries: string[] = []
  const visit = (node: CompositionNode): boolean => {
    if (node.kind !== 'structure') return false
    if (node.id === structureId) {
      const collect = (child: CompositionNode) => {
        if (child.kind === 'goalEntry') {
          entries.push(child.goalId)
          return
        }
        if (child.kind === 'structure') {
          child.children.forEach(collect)
        }
      }
      node.children.forEach(collect)
      return true
    }
    return node.children.some(visit)
  }
  rootNodes.some(visit)
  return entries
}

const collectExpandedReferencedGoalIds = (nodes: CompositionNode[]) => {
  const referencedGoalIds = new Set<string>()
  nodes.forEach((node) => collectReferencedGoalIds(node, referencedGoalIds))

  const expanded = new Set<string>()
  referencedGoalIds.forEach((goalId) => {
    expanded.add(goalId)
    collectAtomicDescendantIds(goalId).forEach((atomicGoalId) => expanded.add(atomicGoalId))
  })
  return expanded
}

const removeStructureById = (nodes: CompositionNode[], structureId: string): CompositionNode[] =>
  nodes.flatMap((node) => {
    if (node.kind !== 'structure') return [node]
    if (node.id === structureId) return []
    const children = removeStructureById(node.children, structureId)
    if (children.length === 0) return []
    return [
      {
        ...node,
        children,
      },
    ]
  })

const replaceStructureById = (
  nodes: CompositionNode[],
  structureId: string,
  replacement: CompositionNode,
): { nodes: CompositionNode[]; replaced: boolean } => {
  let replaced = false
  const nextNodes = nodes.map((node) => {
    if (node.kind !== 'structure') return node
    if (node.id === structureId) {
      replaced = true
      return replacement
    }
    const childResult = replaceStructureById(node.children, structureId, replacement)
    if (childResult.replaced) {
      replaced = true
      return {
        ...node,
        children: childResult.nodes,
      }
    }
    return node
  })
  return { nodes: nextNodes, replaced }
}

const relabelStructureById = (
  nodes: CompositionNode[],
  structureId: string,
  label: string,
): CompositionNode[] => nodes.map((node) => {
  if (node.kind !== 'structure') return node
  return {
    ...node,
    ...(node.id === structureId ? { label } : {}),
    children: relabelStructureById(node.children, structureId, label),
  }
})

const canonicalMath = readJson<{ goals?: LearningGoal[] }>(canonicalMathPath)
const sourceExtraction = readJson<{ sourceGoals?: SourceGoal[] }>(sourceExtractionPath)
const mappingReview = readJson<{ mappings?: MappingEntry[] }>(mappingPath)
const baseGkView = readJson<CompositionView>(resolve(compositionViewDir, 'de-he-gk.view.json'))
const baseLkView = readJson<CompositionView>(resolve(compositionViewDir, 'de-he-lk.view.json'))
const rpSourceExtraction = readJson<{ sourceGoals?: SourceGoal[] }>(rpSourceExtractionPath)
const rpMappingReview = readJson<{ mappings?: MappingEntry[] }>(rpMappingPath)
const baseRpGkView = readJson<CompositionView>(resolve(compositionViewDir, 'de-rp-gk.view.json'))
const baseRpLkView = readJson<CompositionView>(resolve(compositionViewDir, 'de-rp-lk.view.json'))
const shSourceJson = readJson<{ goals?: LearningGoal[] }>(shSourceJsonPath)
const shMappingReview = readJson<{ mappings?: MappingEntry[] }>(shMappingPath)
const baseShGkView = readJson<CompositionView>(resolve(compositionViewDir, 'de-sh-gk.view.json'))
const baseShLkView = readJson<CompositionView>(resolve(compositionViewDir, 'de-sh-lk.view.json'))

const goalById = new Map(
  (canonicalMath.goals ?? []).flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []),
)
const sourceGoalById = new Map(
  (sourceExtraction.sourceGoals ?? []).flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []),
)
const rpSourceGoalById = new Map(
  (rpSourceExtraction.sourceGoals ?? []).flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []),
)
const shSourceGoalById = new Map(
  (shSourceJson.goals ?? []).flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []),
)

const atomicDescendantCache = new Map<string, string[]>()
const collectAtomicDescendantIds = (goalId: string, visiting: Set<string> = new Set()): string[] => {
  const cached = atomicDescendantCache.get(goalId)
  if (cached) return cached
  if (visiting.has(goalId)) return []

  const goal = goalById.get(goalId)
  if (!goal) return []
  const children = goal.contains ?? []
  if (children.length === 0) {
    atomicDescendantCache.set(goalId, [goalId])
    return [goalId]
  }

  const nextVisiting = new Set(visiting)
  nextVisiting.add(goalId)
  const atomicIds = Array.from(new Set(children.flatMap((childId) => collectAtomicDescendantIds(childId, nextVisiting))))
  atomicDescendantCache.set(goalId, atomicIds)
  return atomicIds
}

const canonicalSek1Year = (goalId: string): string | null => {
  const goal = goalById.get(goalId)
  const phase = goal?.dimensionTags?.phase ?? goal?.phase ?? ''
  const match = phase.match(/^J(5|6|7|8|9|10)$/)
  return match?.[1] ?? null
}

const isCanonicalSek1AtomicGoal = (goalId: string): boolean => {
  const goal = goalById.get(goalId)
  if (!goal || (goal.contains?.length ?? 0) > 0) return false
  if (canonicalSek1Year(goalId) !== null) return true
  const phase = goal.dimensionTags?.phase ?? goal.phase ?? ''
  const topicCode = goal.dimensionTags?.topicCode ?? ''
  return (phase === 'GLOBAL' || phase === 'SekI') && topicCode.includes('.SEK1.')
}

interface CompleteHeSek1RouteBucketsOptions<TBucket extends string> {
  durationModel: DurationModel
  buckets: Record<TBucket, string[]>
  supplementGoalIds?: string[]
  excludedGoalIds?: Set<string>
  examYears: string[]
  bucketForCanonicalYear: (year: string) => TBucket | null
}

/**
 * Keeps every generated Hessen Sek-I target route executable under the
 * composition runtime's fail-closed direct-requirement semantics. Hessen's
 * reviewed source mappings do not necessarily enumerate every direct
 * prerequisite of the mapped canonical targets. Such prerequisites remain
 * ordinary visible targets and are placed in their canonical year bucket;
 * prerequisiteOnly would make them impossible to learn from a fresh learner
 * state.
 */
const completeHeSek1RouteBuckets = <TBucket extends string>({
  durationModel,
  buckets,
  supplementGoalIds = [],
  excludedGoalIds = new Set<string>(),
  examYears,
  bucketForCanonicalYear,
}: CompleteHeSek1RouteBucketsOptions<TBucket>): Record<TBucket, string[]> => {
  const completedBuckets = Object.fromEntries(
    Object.entries(buckets).map(([bucket, goalIds]) => [bucket, new Set(goalIds as string[])]),
  ) as Record<TBucket, Set<string>>
  const examTargetIds = examYears.flatMap((year) => {
    const folderId = SEK1_EXAM_FOLDER_IDS_BY_YEAR[year]
    return folderId ? [folderId, ...collectAtomicDescendantIds(folderId)] : []
  })
  const presentGoalIds = new Set<string>([
    SEK1_MOTIVATION_GOAL_ID,
    SEK1_MEMORY_GOAL_ID,
    ...Object.values(completedBuckets).flatMap((goalIds) => Array.from(goalIds)),
    ...supplementGoalIds,
    ...examTargetIds,
    ...excludedGoalIds,
  ])
  const queued = new Set<string>()
  const queue: Array<{ goalId: string; bucketHint: TBucket | null }> = []
  const bucketByGoalId = new Map<string, TBucket>()
  Object.entries(completedBuckets).forEach(([bucket, goalIds]) => {
    ;(goalIds as Set<string>).forEach((goalId) => bucketByGoalId.set(goalId, bucket as TBucket))
  })
  const enqueueSek1Atomic = (goalId: string, bucketHint: TBucket | null = null) => {
    if (!isCanonicalSek1AtomicGoal(goalId)) return
    if (queued.has(goalId) || excludedGoalIds.has(goalId)) return
    queued.add(goalId)
    queue.push({ goalId, bucketHint: bucketByGoalId.get(goalId) ?? bucketHint })
  }

  Object.entries(completedBuckets).forEach(([bucket, goalIds]) => {
    ;(goalIds as Set<string>).forEach((goalId) => enqueueSek1Atomic(goalId, bucket as TBucket))
  })
  supplementGoalIds.forEach((goalId) => {
    const year = canonicalSek1Year(goalId)
    enqueueSek1Atomic(goalId, year ? bucketForCanonicalYear(year) : null)
  })
  examTargetIds.forEach((goalId) => {
    const year = canonicalSek1Year(goalId)
    enqueueSek1Atomic(goalId, year ? bucketForCanonicalYear(year) : null)
  })

  while (queue.length > 0) {
    const next = queue.shift()
    if (!next) continue
    const { goalId, bucketHint } = next
    const goal = goalById.get(goalId)
    for (const requiredId of goal?.requires ?? []) {
      if (presentGoalIds.has(requiredId)) {
        enqueueSek1Atomic(requiredId, bucketByGoalId.get(requiredId) ?? bucketHint)
        continue
      }

      const requiredGoal = goalById.get(requiredId)
      if (!requiredGoal) {
        throw new Error(`Missing canonical prerequisite ${requiredId} required by ${goalId}`)
      }
      if ((requiredGoal.contains?.length ?? 0) > 0) {
        throw new Error(`Sek-I route goal ${goalId} directly requires non-atomic goal ${requiredId}`)
      }
      if (!isCanonicalSek1AtomicGoal(requiredId)) {
        throw new Error(
          `Sek-I route goal ${goalId} requires out-of-stage goal ${requiredId} while generating ${durationModel}`,
        )
      }
      const requiredYear = canonicalSek1Year(requiredId)
      const bucket = requiredYear === null ? bucketHint : bucketForCanonicalYear(requiredYear)
      if (bucket === null || completedBuckets[bucket] === undefined) {
        throw new Error(
          `No ${durationModel} bucket for Sek-I prerequisite ${requiredId} required by ${goalId}`,
        )
      }

      completedBuckets[bucket].add(requiredId)
      bucketByGoalId.set(requiredId, bucket)
      presentGoalIds.add(requiredId)
      enqueueSek1Atomic(requiredId, bucket)
    }
  }

  return Object.fromEntries(
    Object.entries(completedBuckets).map(([bucket, goalIds]) => [
      bucket,
      sortGoalIdsByTitle(goalIds as Set<string>, goalById),
    ]),
  ) as Record<TBucket, string[]>
}

const sek1ExamGoalIds = new Set(Object.values(SEK1_EXAM_FOLDER_IDS_BY_YEAR).flatMap((folderId) => [
  folderId,
  ...collectAtomicDescendantIds(folderId),
]))

const evidenceAtomicIdsByDuration = Object.fromEntries(
  durationModels.map((durationModel) => [durationModel, new Set<string>()]),
) as Record<DurationModel, Set<string>>
const evidenceDurationsByAtomicId = new Map<string, Set<DurationModel>>()
const rawBuckets = Object.fromEntries(
  durationModels.map((durationModel) => [
    durationModel,
    Object.fromEntries(yearLabelsByDuration.G9.map((year) => [year, new Set<string>()])),
  ]),
) as Record<DurationModel, Record<string, Set<string>>>

for (const mapping of mappingReview.mappings ?? []) {
  if (!mapping.legacyGoalId || !mapping.canonicalGoalId) continue

  const sourceGoal = sourceGoalById.get(mapping.legacyGoalId)
  const durationModel = normalizeDurationModel(extractTagValue(sourceGoal?.tags, 'durationModel:') ?? undefined)
  const grade = extractTagValue(sourceGoal?.tags, 'grade:')
  if (!sourceGoal || !durationModel || !grade || !rawBuckets[durationModel][grade]) continue

  collectAtomicDescendantIds(mapping.canonicalGoalId).forEach((atomicGoalId) => {
    rawBuckets[durationModel][grade].add(atomicGoalId)
    evidenceAtomicIdsByDuration[durationModel].add(atomicGoalId)
    const durations = evidenceDurationsByAtomicId.get(atomicGoalId) ?? new Set<DurationModel>()
    durations.add(durationModel)
    evidenceDurationsByAtomicId.set(atomicGoalId, durations)
  })
}

const assignPrimaryGradeBuckets = (durationModel: DurationModel, excludedGoalIds: Set<string> = new Set()) => {
  const assigned = new Set<string>()
  return Object.fromEntries(
    yearLabelsByDuration[durationModel].map((year) => {
      const yearGoalIds = sortGoalIdsByTitle(rawBuckets[durationModel][year] ?? [], goalById)
        .filter((goalId) => {
          if (excludedGoalIds.has(goalId)) return false
          if (sek1ExamGoalIds.has(goalId)) return false
          if (assigned.has(goalId)) return false
          assigned.add(goalId)
          return true
        })
      return [year, yearGoalIds]
    }),
  ) as Record<string, string[]>
}

const baseSek1SupplementIds = Array.from(new Set([
  ...collectGoalEntriesFromStructure(baseGkView.rootNodes, 'he-g8-g9-supplements'),
  ...collectGoalEntriesFromStructure(baseGkView.rootNodes, 'he-source-extraction-supplements-seki'),
])).filter((goalId) => !sek1ExamGoalIds.has(goalId))

const createGoalEntry = (goalId: string): CompositionNode => ({
  kind: 'goalEntry',
  goalId,
})

const createCanonicalSubtree = (goalId: string, displayLabel?: string): CompositionNode => ({
  kind: 'canonicalSubtree',
  goalId,
  ...(displayLabel ? { displayLabel } : {}),
})

const createSek1ExamFolderEntry = (year: string): CompositionNode => {
  const goalId = SEK1_EXAM_FOLDER_IDS_BY_YEAR[year]
  if (!goalId) {
    throw new Error(`No Sek-I exam folder configured for year ${year}`)
  }
  return createCanonicalSubtree(goalId, `Prüfungen Jahrgangsstufe ${year}`)
}

const createSek1CommonTail = (): CompositionNode[] => [
  createCanonicalSubtree(SEK1_MEMORY_GOAL_ID),
]

const heBucketForCanonicalYear = (durationModel: DurationModel, year: string): string | null => {
  if (durationModel === 'G8' && year === '10') return '9'
  return yearLabelsByDuration[durationModel].includes(year) ? year : null
}

const createYearNode = (durationModel: DurationModel, year: string, goalIds: string[]): CompositionNode | null => {
  if (goalIds.length === 0) return null
  return {
    kind: 'structure',
    id: `j${year}-${durationModel.toLowerCase()}`,
    label: `Jahrgangsstufe ${year}`,
    children: [
      {
        kind: 'structure',
        id: `j${year}-${durationModel.toLowerCase()}-kompetenzen`,
        label: 'Weitere Kompetenzen',
        children: goalIds.map(createGoalEntry),
      },
      createSek1ExamFolderEntry(year),
    ],
  }
}

const createSek1Node = (durationModel: DurationModel, excludedGoalIds: Set<string> = new Set()): CompositionNode => {
  const initialBuckets = assignPrimaryGradeBuckets(durationModel, excludedGoalIds)
  const assignedGoalIds = new Set(Object.values(initialBuckets).flat())
  const extraGoalIds = baseSek1SupplementIds.filter((goalId) => {
    if (excludedGoalIds.has(goalId)) return false
    if (assignedGoalIds.has(goalId)) return false
    const evidenceDurations = evidenceDurationsByAtomicId.get(goalId)
    return !evidenceDurations || evidenceDurations.has(durationModel)
  })
  const buckets = completeHeSek1RouteBuckets({
    durationModel,
    buckets: initialBuckets,
    supplementGoalIds: extraGoalIds,
    excludedGoalIds,
    examYears: yearLabelsByDuration[durationModel],
    bucketForCanonicalYear: (year) => heBucketForCanonicalYear(durationModel, year),
  })

  const children: CompositionNode[] = [
    createCanonicalSubtree(SEK1_MOTIVATION_GOAL_ID),
    ...yearLabelsByDuration[durationModel]
      .map((year) => createYearNode(durationModel, year, buckets[year] ?? []))
      .filter((node): node is CompositionNode => node !== null),
    ...(extraGoalIds.length > 0
      ? [{
          kind: 'structure' as const,
          id: `sek1-${durationModel.toLowerCase()}-weitere-lehrplanbelegte-ziele`,
          label: 'Weitere lehrplanbelegte Sek-I-Ziele',
          children: sortGoalIdsByTitle(extraGoalIds, goalById).map(createGoalEntry),
        }]
      : []),
    ...createSek1CommonTail(),
  ]

  return {
    kind: 'structure',
    id: `sek1-${durationModel.toLowerCase()}`,
    label: 'Sekundarstufe I',
    children,
  }
}

const createSek1View = (durationModel: DurationModel): CompositionView => ({
  viewId: `de-he-gym-seki-math-${durationModel.toLowerCase()}`,
  landscapeId: CANONICAL_MATH_LANDSCAPE_ID,
  scope: {
    jurisdiction: 'DE-HE',
    schoolForm: 'Gymnasium',
    stage: 'SekI',
    durationModel,
  },
  rootNodes: [createSek1Node(durationModel)],
})

const createCrossStageView = (
  baseView: CompositionView,
  courseProfile: 'GK' | 'LK',
  durationModel: DurationModel,
): CompositionView => {
  const view = clone(baseView)
  view.viewId = `de-he-gym-math-${courseProfile.toLowerCase()}-${durationModel.toLowerCase()}`
  view.scope = {
    ...view.scope,
    durationModel,
  }

  const replacement = createSek1Node(durationModel)
  const replaced = replaceStructureById(view.rootNodes, 'sek1', replacement)
  if (!replaced.replaced) {
    throw new Error(`Could not replace Sek-I structure in ${baseView.viewId}`)
  }

  const withoutLowerSupplements = relabelStructureById(
    removeStructureById(replaced.nodes, 'he-source-extraction-supplements-seki'),
    'he-source-extraction-supplements',
    'Analytische Geometrie und Anwendungen',
  )
  const crossStageReservedGoalIds = collectExpandedReferencedGoalIds(
    removeStructureById(withoutLowerSupplements, `sek1-${durationModel.toLowerCase()}`),
  )
  const scopedReplacement = createSek1Node(durationModel, crossStageReservedGoalIds)
  const scopedReplaced = replaceStructureById(withoutLowerSupplements, `sek1-${durationModel.toLowerCase()}`, scopedReplacement)
  if (!scopedReplaced.replaced) {
    throw new Error(`Could not apply scoped Sek-I replacement in ${baseView.viewId}`)
  }

  view.rootNodes = scopedReplaced.nodes
  return view
}

const rpStages = ['orientierungsstufe', 'klasse7-8', 'klasse9-10-msa'] as const
type RpStage = typeof rpStages[number]

const rpStageLabelsByDuration: Record<DurationModel, Record<RpStage, string>> = {
  G8: {
    orientierungsstufe: 'Orientierungsstufe 5/6',
    'klasse7-8': 'Klassenstufen 7/8',
    'klasse9-10-msa': 'Klassenstufe 9 (G8)',
  },
  G9: {
    orientierungsstufe: 'Orientierungsstufe 5/6',
    'klasse7-8': 'Klassenstufen 7/8',
    'klasse9-10-msa': 'Klassenstufen 9/10 (G9)',
  },
}

const isRpStage = (value: string | null): value is RpStage =>
  rpStages.some((stage) => stage === value)

const rpRawBuckets = Object.fromEntries(
  rpStages.map((stage) => [stage, new Set<string>()]),
) as Record<RpStage, Set<string>>
const rpUngradedSourceAtomicIds = new Set<string>()

for (const mapping of rpMappingReview.mappings ?? []) {
  if (!mapping.legacyGoalId || !mapping.canonicalGoalId) continue

  const sourceGoal = rpSourceGoalById.get(mapping.legacyGoalId)
  const rpStage = extractTagValue(sourceGoal?.tags, 'rpStage:')
  const target = isRpStage(rpStage) ? rpRawBuckets[rpStage] : rpUngradedSourceAtomicIds

  collectAtomicDescendantIds(mapping.canonicalGoalId).forEach((atomicGoalId) => target.add(atomicGoalId))
}

const baseRpSek1SupplementIds = Array.from(new Set([
  ...collectGoalEntriesFromStructure(baseRpGkView.rootNodes, 'rp-source-extraction-supplements-seki'),
  ...rpUngradedSourceAtomicIds,
])).filter((goalId) => !sek1ExamGoalIds.has(goalId))

const assignRpStageBuckets = (excludedGoalIds: Set<string> = new Set()) => {
  const assigned = new Set<string>()
  return Object.fromEntries(
    rpStages.map((stage) => {
      const goalIds = sortGoalIdsByTitle(rpRawBuckets[stage], goalById)
        .filter((goalId) => {
          if (excludedGoalIds.has(goalId)) return false
          if (sek1ExamGoalIds.has(goalId)) return false
          if (assigned.has(goalId)) return false
          assigned.add(goalId)
          return true
        })
      return [stage, goalIds]
    }),
  ) as Record<RpStage, string[]>
}

const createRpStageNode = (
  durationModel: DurationModel,
  rpStage: RpStage,
  goalIds: string[],
): CompositionNode | null => {
  if (goalIds.length === 0) return null
  return {
    kind: 'structure',
    id: `rp-${rpStage}-${durationModel.toLowerCase()}`,
    label: rpStageLabelsByDuration[durationModel][rpStage],
    children: [
      {
        kind: 'structure',
        id: `rp-${rpStage}-${durationModel.toLowerCase()}-kompetenzen`,
        label: 'Lehrplanbelegte Kompetenzen',
        children: goalIds.map(createGoalEntry),
      },
      ...(
        rpStage === 'orientierungsstufe'
          ? ['5', '6']
          : rpStage === 'klasse7-8'
            ? ['7', '8']
            : durationModel === 'G8'
              ? ['9']
              : ['9', '10']
      ).map(createSek1ExamFolderEntry),
    ],
  }
}

const createRpSek1Node = (
  durationModel: DurationModel,
  excludedGoalIds: Set<string> = new Set(),
): CompositionNode => {
  const buckets = assignRpStageBuckets(excludedGoalIds)
  const assignedGoalIds = new Set(Object.values(buckets).flat())
  const supplementGoalIds = sortGoalIdsByTitle(baseRpSek1SupplementIds, goalById)
    .filter((goalId) => !excludedGoalIds.has(goalId) && !assignedGoalIds.has(goalId))

  const children: CompositionNode[] = [
    createCanonicalSubtree(SEK1_MOTIVATION_GOAL_ID),
    ...rpStages
      .map((rpStage) => createRpStageNode(durationModel, rpStage, buckets[rpStage]))
      .filter((node): node is CompositionNode => node !== null),
    ...(supplementGoalIds.length > 0
      ? [{
          kind: 'structure' as const,
          id: `rp-sek1-${durationModel.toLowerCase()}-prozesskompetenzen`,
          label: 'Übergreifende Prozesskompetenzen',
          children: supplementGoalIds.map(createGoalEntry),
        }]
      : []),
    ...createSek1CommonTail(),
  ]

  return {
    kind: 'structure',
    id: `rp-sek1-${durationModel.toLowerCase()}`,
    label: 'Sekundarstufe I',
    children,
  }
}

const createRpSek1View = (durationModel: DurationModel): CompositionView => ({
  viewId: `de-rp-gym-seki-math-${durationModel.toLowerCase()}`,
  landscapeId: CANONICAL_MATH_LANDSCAPE_ID,
  scope: {
    jurisdiction: 'DE-RP',
    schoolForm: 'Gymnasium',
    stage: 'SekI',
    durationModel,
  },
  rootNodes: [createRpSek1Node(durationModel)],
})

const createRpCrossStageView = (
  baseView: CompositionView,
  courseProfile: 'GK' | 'LK',
  durationModel: DurationModel,
): CompositionView => {
  const view = clone(baseView)
  view.viewId = `de-rp-gym-math-${courseProfile.toLowerCase()}-${durationModel.toLowerCase()}`
  view.scope = {
    ...view.scope,
    durationModel,
  }

  const replacement = createRpSek1Node(durationModel)
  const replaced = replaceStructureById(view.rootNodes, 'sek1', replacement)
  if (!replaced.replaced) {
    throw new Error(`Could not replace Sek-I structure in ${baseView.viewId}`)
  }

  const withoutLowerSupplements = removeStructureById(replaced.nodes, 'rp-source-extraction-supplements-seki')
  const crossStageReservedGoalIds = collectExpandedReferencedGoalIds(
    removeStructureById(withoutLowerSupplements, `rp-sek1-${durationModel.toLowerCase()}`),
  )
  const scopedReplacement = createRpSek1Node(durationModel, crossStageReservedGoalIds)
  const scopedReplaced = replaceStructureById(withoutLowerSupplements, `rp-sek1-${durationModel.toLowerCase()}`, scopedReplacement)
  if (!scopedReplaced.replaced) {
    throw new Error(`Could not apply scoped RP Sek-I replacement in ${baseView.viewId}`)
  }

  view.rootNodes = scopedReplaced.nodes
  return view
}

const shBands = ['jg5-6', 'jg7-9', 'jg10'] as const
type ShBand = typeof shBands[number]

const shBandLabelsByDuration: Record<DurationModel, Record<ShBand, string>> = {
  G8: {
    'jg5-6': 'Jahrgangsband 5/6',
    'jg7-9': 'Jahrgangsband 6/7/8 (G8)',
    jg10: 'Jahrgangsstufe 9 (G8)',
  },
  G9: {
    'jg5-6': 'Jahrgangsband 5/6',
    'jg7-9': 'Jahrgangsband 7/8/9',
    jg10: 'Jahrgangsstufe 10',
  },
}

const getShBand = (sourceGoalId: string): ShBand | null => {
  const sourceGoal = shSourceGoalById.get(sourceGoalId)
  const tags = sourceGoal?.tags ?? []
  if (tags.includes('Jg5-6') || sourceGoalId.includes('jg5-6')) return 'jg5-6'
  if (tags.includes('Jg7-9') || sourceGoalId.includes('jg7-9')) return 'jg7-9'
  if (tags.includes('Jg10') || sourceGoalId.includes('jg10')) return 'jg10'
  return null
}

const shRawBuckets = Object.fromEntries(
  shBands.map((band) => [band, new Set<string>()]),
) as Record<ShBand, Set<string>>

for (const mapping of shMappingReview.mappings ?? []) {
  if (!mapping.legacyGoalId || !mapping.canonicalGoalId) continue
  const shBand = getShBand(mapping.legacyGoalId)
  if (!shBand) continue

  collectAtomicDescendantIds(mapping.canonicalGoalId).forEach((atomicGoalId) => {
    shRawBuckets[shBand].add(atomicGoalId)
  })
}

const assignShBandBuckets = (excludedGoalIds: Set<string> = new Set()) => {
  const assigned = new Set<string>()
  return Object.fromEntries(
    shBands.map((band) => {
      const goalIds = sortGoalIdsByTitle(shRawBuckets[band], goalById)
        .filter((goalId) => {
          if (excludedGoalIds.has(goalId)) return false
          if (sek1ExamGoalIds.has(goalId)) return false
          if (assigned.has(goalId)) return false
          assigned.add(goalId)
          return true
        })
      return [band, goalIds]
    }),
  ) as Record<ShBand, string[]>
}

const createShBandNode = (
  durationModel: DurationModel,
  band: ShBand,
  goalIds: string[],
): CompositionNode | null => {
  if (goalIds.length === 0) return null
  return {
    kind: 'structure',
    id: `sh-${band}-${durationModel.toLowerCase()}`,
    label: shBandLabelsByDuration[durationModel][band],
    children: [
      {
        kind: 'structure',
        id: `sh-${band}-${durationModel.toLowerCase()}-kompetenzen`,
        label: 'Lehrplanbelegte Kompetenzen',
        children: goalIds.map(createGoalEntry),
      },
      ...(
        band === 'jg5-6'
          ? ['5', '6']
          : band === 'jg7-9'
            ? durationModel === 'G8'
              ? ['7', '8']
              : ['7', '8', '9']
            : durationModel === 'G8'
              ? ['9']
              : ['10']
      ).map(createSek1ExamFolderEntry),
    ],
  }
}

const createShSek1Node = (
  durationModel: DurationModel,
  excludedGoalIds: Set<string> = new Set(),
): CompositionNode => {
  const buckets = assignShBandBuckets(excludedGoalIds)
  return {
    kind: 'structure',
    id: `sh-sek1-${durationModel.toLowerCase()}`,
    label: 'Sekundarstufe I',
    children: [
      createCanonicalSubtree(SEK1_MOTIVATION_GOAL_ID),
      ...shBands
        .map((band) => createShBandNode(durationModel, band, buckets[band]))
        .filter((node): node is CompositionNode => node !== null),
      ...createSek1CommonTail(),
    ],
  }
}

const createShSek1View = (durationModel: DurationModel): CompositionView => ({
  viewId: `de-sh-gym-seki-math-${durationModel.toLowerCase()}`,
  landscapeId: CANONICAL_MATH_LANDSCAPE_ID,
  scope: {
    jurisdiction: 'DE-SH',
    schoolForm: 'Gymnasium',
    stage: 'SekI',
    durationModel,
  },
  rootNodes: [createShSek1Node(durationModel)],
})

const createShCrossStageView = (
  baseView: CompositionView,
  courseProfile: 'GK' | 'LK',
  durationModel: DurationModel,
): CompositionView => {
  const view = clone(baseView)
  view.viewId = `de-sh-gym-math-${courseProfile.toLowerCase()}-${durationModel.toLowerCase()}`
  view.scope = {
    ...view.scope,
    durationModel,
  }

  const replacement = createShSek1Node(durationModel)
  const replaced = replaceStructureById(view.rootNodes, 'sek1', replacement)
  if (!replaced.replaced) {
    throw new Error(`Could not replace Sek-I structure in ${baseView.viewId}`)
  }

  const crossStageReservedGoalIds = collectExpandedReferencedGoalIds(
    removeStructureById(replaced.nodes, `sh-sek1-${durationModel.toLowerCase()}`),
  )
  const scopedReplacement = createShSek1Node(durationModel, crossStageReservedGoalIds)
  const scopedReplaced = replaceStructureById(replaced.nodes, `sh-sek1-${durationModel.toLowerCase()}`, scopedReplacement)
  if (!scopedReplaced.replaced) {
    throw new Error(`Could not apply scoped SH Sek-I replacement in ${baseView.viewId}`)
  }

  view.rootNodes = scopedReplaced.nodes
  return view
}

const findStructureById = (nodes: CompositionNode[], structureId: string): CompositionNode | null => {
  for (const node of nodes) {
    if (node.kind !== 'structure') continue
    if (node.id === structureId) return node
    const childMatch = findStructureById(node.children, structureId)
    if (childMatch) return childMatch
  }
  return null
}

const collectProjectedTargetGoalIds = (nodes: CompositionNode[]): Set<string> => {
  const goalIds = new Set<string>()
  const visit = (node: CompositionNode) => {
    if (node.kind === 'goalEntry') {
      if (node.projectionRole === 'prerequisiteOnly') return
      goalIds.add(node.goalId)
      return
    }
    if (node.kind === 'canonicalSubtree') {
      if (node.projectionRole === 'prerequisiteOnly') return
      goalIds.add(node.goalId)
      collectAtomicDescendantIds(node.goalId).forEach((goalId) => goalIds.add(goalId))
      return
    }
    if (node.kind === 'structure') node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return goalIds
}

const assertCompleteHeSek1DirectRequirements = (view: CompositionView) => {
  const durationModel = view.scope.durationModel as DurationModel
  const jurisdiction = view.scope.jurisdiction
  // Hessen is the currently reviewed source-evidence lane for this closure.
  // Other jurisdictions need their own provenance review before prerequisites
  // can be added as learner-facing targets.
  if (jurisdiction !== 'DE-HE') return
  const structureId = `sek1-${durationModel.toLowerCase()}`
  const sek1Node = findStructureById(view.rootNodes, structureId)
  if (!sek1Node || sek1Node.kind !== 'structure') {
    throw new Error(`Missing generated Sek-I structure ${structureId} in ${view.viewId}`)
  }

  const allTargetGoalIds = collectProjectedTargetGoalIds(view.rootNodes)
  const sek1TargetGoalIds = collectProjectedTargetGoalIds([sek1Node])
  const missingEdges: string[] = []
  sek1TargetGoalIds.forEach((goalId) => {
    if (!isCanonicalSek1AtomicGoal(goalId)) return
    for (const requiredId of goalById.get(goalId)?.requires ?? []) {
      if (!allTargetGoalIds.has(requiredId)) missingEdges.push(`${goalId}->${requiredId}`)
    }
  })
  if (missingEdges.length > 0) {
    throw new Error(
      `${view.viewId} omits direct target prerequisite(s): ${missingEdges.join(', ')}`,
    )
  }
}

const generatedViews = new Map<string, CompositionView>([
  ['de-he-seki-g8.view.json', createSek1View('G8')],
  ['de-he-seki-g9.view.json', createSek1View('G9')],
  ['de-he-gk-g8.view.json', createCrossStageView(baseGkView, 'GK', 'G8')],
  ['de-he-gk-g9.view.json', createCrossStageView(baseGkView, 'GK', 'G9')],
  ['de-he-lk-g8.view.json', createCrossStageView(baseLkView, 'LK', 'G8')],
  ['de-he-lk-g9.view.json', createCrossStageView(baseLkView, 'LK', 'G9')],
  ['de-rp-seki-g8.view.json', createRpSek1View('G8')],
  ['de-rp-seki-g9.view.json', createRpSek1View('G9')],
  ['de-rp-gk-g8.view.json', createRpCrossStageView(baseRpGkView, 'GK', 'G8')],
  ['de-rp-gk-g9.view.json', createRpCrossStageView(baseRpGkView, 'GK', 'G9')],
  ['de-rp-lk-g8.view.json', createRpCrossStageView(baseRpLkView, 'LK', 'G8')],
  ['de-rp-lk-g9.view.json', createRpCrossStageView(baseRpLkView, 'LK', 'G9')],
  ['de-sh-seki-g8.view.json', createShSek1View('G8')],
  ['de-sh-seki-g9.view.json', createShSek1View('G9')],
  ['de-sh-gk-g8.view.json', createShCrossStageView(baseShGkView, 'GK', 'G8')],
  ['de-sh-gk-g9.view.json', createShCrossStageView(baseShGkView, 'GK', 'G9')],
  ['de-sh-lk-g8.view.json', createShCrossStageView(baseShLkView, 'LK', 'G8')],
  ['de-sh-lk-g9.view.json', createShCrossStageView(baseShLkView, 'LK', 'G9')],
])

const serialize = (view: CompositionView) => `${JSON.stringify(view, null, 2)}\n`

let differences = 0
for (const fileName of GENERATED_VIEW_PATHS) {
  const generatedView = generatedViews.get(fileName)
  if (!generatedView) {
    throw new Error(`Missing generator output for ${fileName}`)
  }
  assertCompleteHeSek1DirectRequirements(generatedView)

  const targetPath = resolve(compositionViewDir, fileName)
  const generated = serialize(generatedView)
  const current = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : null
  const changed = current !== generated

  if (changed) {
    differences += 1
    if (shouldWrite) {
      writeFileSync(targetPath, generated)
    }
  }

  const countPrimaryEntries = (node: CompositionNode | null) =>
    node?.kind === 'structure' && node.children[0]?.kind === 'structure'
      ? node.children[0].children.length
      : 0
  const durationModel = generatedView.scope.durationModel as DurationModel
  const assignedCounts = generatedView.viewId.startsWith('de-rp-')
    ? Object.fromEntries(
        rpStages.map((rpStage) => [
          rpStage,
          countPrimaryEntries(findStructureById(generatedView.rootNodes, `rp-${rpStage}-${durationModel.toLowerCase()}`)),
        ]),
      )
    : generatedView.viewId.startsWith('de-sh-')
      ? Object.fromEntries(
          shBands.map((band) => [
            band,
            countPrimaryEntries(findStructureById(generatedView.rootNodes, `sh-${band}-${durationModel.toLowerCase()}`)),
          ]),
        )
    : Object.fromEntries(
        yearLabelsByDuration[durationModel].map((year) => [
          year,
          countPrimaryEntries(findStructureById(generatedView.rootNodes, `j${year}-${durationModel.toLowerCase()}`)),
        ]),
      )
  console.log(`${changed ? 'changed' : 'ok'} ${fileName} ${JSON.stringify(assignedCounts)}`)
}

if (shouldCheck && differences > 0) {
  console.error(`${differences} generated Mathematik G8/G9 composition view file(s) are not up to date. Run npm run generate:math-duration-composition-views.`)
  process.exitCode = 1
}

if (!shouldCheck && !shouldWrite) {
  console.log('Dry run only. Use --write to update generated views or --check to enforce reproducibility.')
}
