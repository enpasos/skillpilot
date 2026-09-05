import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  collectCompositionProjectionRoleGoalIds,
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import { normalizeCanonicalLandscape } from '../src/utils/authoring/canonicalAuthoring'

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
  nodeKind?: string
  examData?: unknown
  extendedData?: {
    applicabilityFromRequires?: boolean
  }
  tags?: string[]
  phase?: string
  dimensionTags?: {
    phase?: string
    topicCode?: string
  }
  applicability?: {
    jurisdiction?: string[]
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

interface SemanticKindDecision {
  goalId?: string
  semanticKind?: string
  decisionStatus?: string
}

interface SplitLayoutPlacement {
  parentStructureId: string
  splitCode: string
  oldClusterGoalId: string
  renderKind: 'canonicalSubtree' | 'structure'
  removeAtomicGoalIds: string[]
  preservedReusedGoalIds?: string[]
  replacementNode: CompositionNode
}

interface SplitLayoutTemplate {
  fileName: string
  viewId: string
  fileSha256: string
  placementCount: number
  excludedGoalIds?: string[]
  prerequisiteOnlyGoalIds?: string[]
  placements: SplitLayoutPlacement[]
}

interface SplitLayoutPlan {
  schemaVersion: number
  status: string
  inputs: {
    canonical: {
      path: string
      sha256: string
    }
    additiveAdjudications?: Array<{
      path: string
      fileSha256: string
      adjudicationDigest: string
    }>
  }
  counts: {
    sek1TemplateCount: number
    splitPlacementCount: number
    crossStageOutputCount: number
    totalOutputCount: number
  }
  sek1Templates: SplitLayoutTemplate[]
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
const splitLayoutPlanPath = resolve(
  scriptDir,
  'config/math-duration-split-spanning-tree-policy.json',
)
const semanticKindLedgerPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
)

const CANONICAL_MATH_LANDSCAPE_ID = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
const SEK1_MOTIVATION_GOAL_ID = '65365dce-f33f-49d8-9516-42f75883aa86'
const SEK1_MEMORY_GOAL_ID = '4eefbd04-9e49-41ea-a087-9ad6ac71ec5a'
const J6_REFLECTIONS_CLUSTER_ID = '1335dff9-db1e-5dd6-aa55-3938b6d3b0ec'
const J6_NETS_GOAL_ID = 'f52e9d72-4995-5c80-91d2-7761ea0cbec0'
const J6_OBLIQUE_VIEW_GOAL_ID = '6bb52f96-6320-5a34-afb0-db9b471dd4ac'
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

const compareGoalIdsByTitle = (
  left: string,
  right: string,
  goalById: Map<string, LearningGoal>,
) => {
    const leftTitle = goalById.get(left)?.title ?? ''
    const rightTitle = goalById.get(right)?.title ?? ''
    const titleCompare = leftTitle.localeCompare(rightTitle, 'de', { numeric: true, sensitivity: 'base' })
    return titleCompare || left.localeCompare(right)
  }

const sortGoalIdsByTitle = (goalIds: Iterable<string>, goalById: Map<string, LearningGoal>) =>
  Array.from(goalIds).sort((left, right) => compareGoalIdsByTitle(left, right, goalById))

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
        if (child.kind === 'canonicalSubtree') {
          collectAtomicDescendantIds(child.goalId).forEach((goalId) => entries.push(goalId))
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
const splitLayoutPlan = readJson<SplitLayoutPlan>(splitLayoutPlanPath)
const semanticKindLedger = readJson<{ decisions?: SemanticKindDecision[] }>(semanticKindLedgerPath)
const canonicalMathRelativePath =
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const canonicalMathSha256 = createHash('sha256')
  .update(readFileSync(canonicalMathPath))
  .digest('hex')

if (
  splitLayoutPlan.schemaVersion !== 1
  || splitLayoutPlan.status !== 'APPROVED_REVIEWED_LAYOUT'
  || splitLayoutPlan.inputs?.canonical?.path !== canonicalMathRelativePath
  || splitLayoutPlan.inputs?.canonical?.sha256 !== canonicalMathSha256
  || splitLayoutPlan.sek1Templates.length !== splitLayoutPlan.counts.sek1TemplateCount
  || splitLayoutPlan.sek1Templates.reduce((sum, template) => sum + template.placements.length, 0)
    !== splitLayoutPlan.counts.splitPlacementCount
) {
  throw new Error(`Invalid reviewed split-layout plan ${splitLayoutPlanPath}`)
}

for (const input of splitLayoutPlan.inputs.additiveAdjudications ?? []) {
  const absolutePath = resolve(repoRoot, input.path)
  const bytes = readFileSync(absolutePath)
  const fileSha256 = createHash('sha256').update(bytes).digest('hex')
  const adjudication = JSON.parse(bytes.toString('utf8')) as Record<string, unknown>
  const digestPayload = structuredClone(adjudication)
  delete digestPayload.adjudicationDigest
  const adjudicationDigest = `sha256:${createHash('sha256')
    .update(JSON.stringify(digestPayload))
    .digest('hex')}`
  if (
    fileSha256 !== input.fileSha256
    || adjudication.adjudicationDigest !== input.adjudicationDigest
    || adjudicationDigest !== input.adjudicationDigest
  ) {
    throw new Error(`Invalid additive split-layout adjudication ${input.path}`)
  }
}

const splitLayoutTemplateByFileName = new Map(
  splitLayoutPlan.sek1Templates.map((template) => [template.fileName, template]),
)

const goalById = new Map(
  (canonicalMath.goals ?? []).flatMap((goal) => goal.id ? [[goal.id, goal]] as const : []),
)
const semanticKindByGoalId = new Map(
  (semanticKindLedger.decisions ?? []).flatMap((decision) => (
    decision.goalId && decision.decisionStatus === 'authoritative'
      ? [[decision.goalId, decision.semanticKind ?? '']] as const
      : []
  )),
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

const isGoalApplicableToJurisdiction = (goalId: string, jurisdiction: string): boolean => {
  const jurisdictions = goalById.get(goalId)?.applicability?.jurisdiction
  return !jurisdictions || jurisdictions.includes(jurisdiction)
}

interface CompleteSek1RouteBucketsOptions<TBucket extends string> {
  jurisdiction: string
  durationModel: DurationModel
  buckets: Record<TBucket, string[]>
  supplementGoalIds?: string[]
  routeSeedGoalIds?: string[]
  excludedGoalIds?: Set<string>
  blockedPrerequisiteGoalIds?: Set<string>
  bucketForCanonicalYear: (year: string) => TBucket | null
}

/**
 * Keeps every generated, source-backed Sek-I target route executable under
 * the composition runtime's fail-closed direct-requirement semantics. The
 * reviewed source mappings decide the initial target set; they do not always
 * enumerate every canonical prerequisite of those targets. Applicable
 * prerequisites therefore remain ordinary visible targets in their canonical
 * year bucket. prerequisiteOnly would make them impossible to learn from a
 * fresh learner state.
 */
const completeSek1RouteBuckets = <TBucket extends string>({
  jurisdiction,
  durationModel,
  buckets,
  supplementGoalIds = [],
  routeSeedGoalIds = [],
  excludedGoalIds = new Set<string>(),
  blockedPrerequisiteGoalIds = new Set<string>(),
  bucketForCanonicalYear,
}: CompleteSek1RouteBucketsOptions<TBucket>): Record<TBucket, string[]> => {
  const completedBuckets = Object.fromEntries(
    Object.entries(buckets).map(([bucket, goalIds]) => [bucket, new Set(goalIds as string[])]),
  ) as Record<TBucket, Set<string>>
  const presentGoalIds = new Set<string>([
    SEK1_MOTIVATION_GOAL_ID,
    SEK1_MEMORY_GOAL_ID,
    ...Object.values(completedBuckets).flatMap((goalIds) => Array.from(goalIds)),
    ...supplementGoalIds,
    ...routeSeedGoalIds,
    ...excludedGoalIds,
    ...blockedPrerequisiteGoalIds,
  ])
  const queued = new Set<string>()
  const queue: Array<{ goalId: string; bucketHint: TBucket | null }> = []
  const bucketByGoalId = new Map<string, TBucket>()
  Object.entries(completedBuckets).forEach(([bucket, goalIds]) => {
    ;(goalIds as Set<string>).forEach((goalId) => bucketByGoalId.set(goalId, bucket as TBucket))
  })
  const enqueueSek1Atomic = (goalId: string, bucketHint: TBucket | null = null) => {
    if (!isCanonicalSek1AtomicGoal(goalId)) return
    if (!isGoalApplicableToJurisdiction(goalId, jurisdiction)) return
    if (
      queued.has(goalId)
      || excludedGoalIds.has(goalId)
      || blockedPrerequisiteGoalIds.has(goalId)
    ) return
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
  routeSeedGoalIds.forEach((goalId) => {
    const year = canonicalSek1Year(goalId)
    enqueueSek1Atomic(goalId, year ? bucketForCanonicalYear(year) : null)
  })
  while (queue.length > 0) {
    const next = queue.shift()
    if (!next) continue
    const { goalId, bucketHint } = next
    const goal = goalById.get(goalId)
    for (const requiredId of goal?.requires ?? []) {
      const requiredGoal = goalById.get(requiredId)
      if (!requiredGoal) {
        throw new Error(`Missing canonical prerequisite ${requiredId} required by ${goalId}`)
      }
      if (!isGoalApplicableToJurisdiction(requiredId, jurisdiction)) {
        throw new Error(
          `${jurisdiction} Sek-I target ${goalId} requires inapplicable goal ${requiredId}`,
        )
      }
      if (presentGoalIds.has(requiredId)) {
        enqueueSek1Atomic(requiredId, bucketByGoalId.get(requiredId) ?? bucketHint)
        continue
      }

      if ((requiredGoal.contains?.length ?? 0) > 0) {
        throw new Error(`Sek-I route goal ${goalId} directly requires non-atomic goal ${requiredId}`)
      }
      if (!isCanonicalSek1AtomicGoal(requiredId)) {
        throw new Error(
          `${jurisdiction} Sek-I route goal ${goalId} requires out-of-stage goal ${requiredId} while generating ${durationModel}`,
        )
      }
      const requiredYear = canonicalSek1Year(requiredId)
      const bucket = requiredYear === null ? bucketHint : bucketForCanonicalYear(requiredYear)
      if (bucket === null || completedBuckets[bucket] === undefined) {
        throw new Error(
          `No ${jurisdiction} ${durationModel} bucket for Sek-I prerequisite ${requiredId} required by ${goalId}`,
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

const createGoalEntry = (goalId: string): CompositionNode => {
  const goal = goalById.get(goalId)
  if (!goal) throw new Error(`Cannot generate missing canonical goal ${goalId}`)
  if ((goal.contains?.length ?? 0) > 0) {
    throw new Error(`Generated direct target ${goalId} is a cluster; use an adjudicated spanning-tree subtree instead`)
  }
  return { kind: 'goalEntry', goalId }
}

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

const collectAtomicGoalIdsFromNodes = (nodes: CompositionNode[]): Set<string> => {
  const result = new Set<string>()
  const visit = (node: CompositionNode) => {
    if (node.kind === 'structure') {
      node.children.forEach(visit)
      return
    }
    if (node.kind === 'landscapeEntry' || node.projectionRole === 'prerequisiteOnly') return
    collectAtomicDescendantIds(node.goalId).forEach((goalId) => result.add(goalId))
  }
  nodes.forEach(visit)
  return result
}

const removeDirectGoalReferences = (
  nodes: CompositionNode[],
  removeGoalIds: ReadonlySet<string>,
): CompositionNode[] => nodes.flatMap((node) => {
  if (node.kind !== 'structure') {
    return node.kind !== 'landscapeEntry' && removeGoalIds.has(node.goalId) ? [] : [node]
  }
  return [{
    ...node,
    children: removeDirectGoalReferences(node.children, removeGoalIds),
  }]
})

const findStructureNode = (nodes: CompositionNode[], structureId: string): Extract<CompositionNode, { kind: 'structure' }> | null => {
  for (const node of nodes) {
    if (node.kind !== 'structure') continue
    if (node.id === structureId) return node
    const child = findStructureNode(node.children, structureId)
    if (child) return child
  }
  return null
}

const filterLayoutNodeByExcludedGoals = (
  node: CompositionNode,
  excludedGoalIds: ReadonlySet<string>,
): CompositionNode | null => {
  if (node.kind === 'landscapeEntry') return clone(node)
  if (node.kind === 'structure') {
    const children = node.children
      .map((child) => filterLayoutNodeByExcludedGoals(child, excludedGoalIds))
      .filter((child): child is CompositionNode => child !== null)
    return children.length > 0 ? { ...clone(node), children } : null
  }

  const atomicGoalIds = collectAtomicDescendantIds(node.goalId)
  const retainedAtomicGoalIds = atomicGoalIds.filter((goalId) => !excludedGoalIds.has(goalId))
  if (retainedAtomicGoalIds.length === 0) return null
  if (retainedAtomicGoalIds.length === atomicGoalIds.length) return clone(node)
  if (node.kind === 'goalEntry') {
    throw new Error(`Cannot partially filter atomic goal entry ${node.goalId}`)
  }

  const goal = goalById.get(node.goalId)
  const children = (goal?.contains ?? [])
    .map((childGoalId) => filterLayoutNodeByExcludedGoals(
      { kind: 'canonicalSubtree', goalId: childGoalId },
      excludedGoalIds,
    ))
    .filter((child): child is CompositionNode => child !== null)
  if (children.length === 0) return null
  return {
    kind: 'structure',
    id: `canonical-selection-${node.goalId}`,
    label: node.displayLabel?.trim() || goal?.title || node.goalId,
    children,
  }
}

interface ReviewedLayoutRouteContext {
  blockedPrerequisiteGoalIds: Set<string>
  replacementTargetGoalIds: string[]
}

/**
 * A reviewed split placement may replace a broad mapped atom set with a
 * narrower source-backed selection. Replacement targets must seed route
 * closure even though they are only inserted after bucket generation. Atoms
 * deliberately left out by that replacement must never be reintroduced by
 * prerequisite closure.
 */
const reviewedLayoutRouteContext = (
  templateFileName: string,
  excludedGoalIds: ReadonlySet<string> = new Set<string>(),
): ReviewedLayoutRouteContext => {
  const template = splitLayoutTemplateByFileName.get(templateFileName)
  if (!template) throw new Error(`Missing reviewed split-layout template ${templateFileName}`)
  const effectiveExcludedGoalIds = new Set([
    ...excludedGoalIds,
    ...(template.excludedGoalIds ?? []),
    ...(template.prerequisiteOnlyGoalIds ?? []),
  ])
  const replacementTargetGoalIds = new Set<string>()
  for (const placement of template.placements) {
    const replacement = filterLayoutNodeByExcludedGoals(
      placement.replacementNode,
      effectiveExcludedGoalIds,
    )
    if (!replacement) continue
    collectAtomicGoalIdsFromNodes([replacement])
      .forEach((goalId) => replacementTargetGoalIds.add(goalId))
  }

  const blockedPrerequisiteGoalIds = new Set<string>(effectiveExcludedGoalIds)
  template.placements
    .flatMap((placement) => placement.removeAtomicGoalIds)
    .filter((goalId) => !replacementTargetGoalIds.has(goalId))
    .forEach((goalId) => blockedPrerequisiteGoalIds.add(goalId))

  return {
    blockedPrerequisiteGoalIds,
    replacementTargetGoalIds: sortGoalIdsByTitle(replacementTargetGoalIds, goalById),
  }
}

const legacyExamRouteSeedGoalIds = (
  jurisdiction: string,
  years: string[],
): string[] => sortGoalIdsByTitle(
  years.flatMap((year) => {
    const folderId = SEK1_EXAM_FOLDER_IDS_BY_YEAR[year]
    return folderId ? collectAtomicDescendantIds(folderId) : []
  }).filter((goalId) => {
    const goal = goalById.get(goalId)
    return isGoalApplicableToJurisdiction(goalId, jurisdiction)
      && (goal?.nodeKind === 'exam' || Boolean(goal?.examData))
      && goal?.extendedData?.applicabilityFromRequires !== true
  }),
  goalById,
)

const applyReviewedSplitLayout = (
  sek1Node: CompositionNode,
  templateFileName: string,
  excludedGoalIds: ReadonlySet<string> = new Set<string>(),
): CompositionNode => {
  const template = splitLayoutTemplateByFileName.get(templateFileName)
  if (!template) throw new Error(`Missing reviewed split-layout template ${templateFileName}`)
  if (template.placements.length !== template.placementCount) {
    throw new Error(`Split-layout placement count mismatch for ${templateFileName}`)
  }

  const effectiveExcludedGoalIds = new Set([
    ...excludedGoalIds,
    ...(template.excludedGoalIds ?? []),
    ...(template.prerequisiteOnlyGoalIds ?? []),
  ])

  const beforeAtomicGoalIds = collectAtomicGoalIdsFromNodes([sek1Node])
  const removeGoalIds = new Set(template.placements.flatMap((placement) => placement.removeAtomicGoalIds))
  const transformed = removeDirectGoalReferences([clone(sek1Node)], removeGoalIds)[0]
  if (!transformed || transformed.kind !== 'structure') {
    throw new Error(`Reviewed split layout removed the Sek-I root for ${templateFileName}`)
  }

  const replacementSortGoalIdByStructureId = new Map<string, string>()
  for (const placement of template.placements) {
    const parent = findStructureNode([transformed], placement.parentStructureId)
    if (!parent) {
      throw new Error(
        `${templateFileName}: missing placement parent ${placement.parentStructureId} for ${placement.splitCode}`,
      )
    }
    const replacement = filterLayoutNodeByExcludedGoals(placement.replacementNode, effectiveExcludedGoalIds)
    if (!replacement) continue
    if (replacement.kind === 'structure') {
      replacementSortGoalIdByStructureId.set(replacement.id, placement.oldClusterGoalId)
    }
    parent.children.push(replacement)
    parent.children.sort((left, right) => {
      const sortGoalId = (node: CompositionNode): string => {
        if (node.kind === 'goalEntry' || node.kind === 'canonicalSubtree') return node.goalId
        if (node.kind === 'structure') {
          return replacementSortGoalIdByStructureId.get(node.id) ?? node.id
        }
        return node.landscapeId
      }
      return compareGoalIdsByTitle(sortGoalId(left), sortGoalId(right), goalById)
    })
  }

  const expectedAfterAtomicGoalIds = new Set(beforeAtomicGoalIds)
  removeGoalIds.forEach((goalId) => expectedAfterAtomicGoalIds.delete(goalId))
  template.placements.forEach((placement) => {
    const replacement = filterLayoutNodeByExcludedGoals(placement.replacementNode, effectiveExcludedGoalIds)
    if (!replacement) return
    collectAtomicGoalIdsFromNodes([replacement])
      .forEach((goalId) => expectedAfterAtomicGoalIds.add(goalId))
  })
  const afterAtomicGoalIds = collectAtomicGoalIdsFromNodes([transformed])
  const missing = [...expectedAfterAtomicGoalIds].filter((goalId) => !afterAtomicGoalIds.has(goalId))
  const unexpected = [...afterAtomicGoalIds].filter((goalId) => !expectedAfterAtomicGoalIds.has(goalId))
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${templateFileName}: split layout changed the atomic target set; missing=${missing.join(',') || '-'} unexpected=${unexpected.join(',') || '-'}`,
    )
  }
  for (const placement of template.placements) {
    for (const goalId of placement.preservedReusedGoalIds ?? []) {
      if (removeGoalIds.has(goalId)) {
        throw new Error(`${templateFileName}: preserved reused goal ${goalId} is also scheduled for removal`)
      }
      if (effectiveExcludedGoalIds.has(goalId)) continue
      if (!beforeAtomicGoalIds.has(goalId) || !afterAtomicGoalIds.has(goalId)) {
        throw new Error(`${templateFileName}: preserved reused goal ${goalId} did not remain visible`)
      }
    }
  }

  const prerequisiteOnlyGoalIds = template.prerequisiteOnlyGoalIds ?? []
  if (new Set(prerequisiteOnlyGoalIds).size !== prerequisiteOnlyGoalIds.length) {
    throw new Error(`${templateFileName}: duplicate prerequisite-only goal ID`)
  }
  for (const goalId of prerequisiteOnlyGoalIds) {
    const goal = goalById.get(goalId)
    if (!goal) {
      throw new Error(`${templateFileName}: missing prerequisite-only canonical goal ${goalId}`)
    }
    if ((goal.contains?.length ?? 0) > 0) {
      throw new Error(`${templateFileName}: prerequisite-only goal ${goalId} is not atomic`)
    }
    if (!beforeAtomicGoalIds.has(goalId)) {
      throw new Error(`${templateFileName}: prerequisite-only goal ${goalId} was not in the original target set`)
    }
    if (afterAtomicGoalIds.has(goalId)) {
      throw new Error(`${templateFileName}: prerequisite-only goal ${goalId} remained in the target set`)
    }
    const requiringTargetGoalIds = [...afterAtomicGoalIds]
      .filter((targetGoalId) => (goalById.get(targetGoalId)?.requires ?? []).includes(goalId))
    if (requiringTargetGoalIds.length === 0) {
      throw new Error(`${templateFileName}: prerequisite-only goal ${goalId} is not required by a retained target`)
    }
  }
  transformed.children.splice(
    1,
    0,
    ...prerequisiteOnlyGoalIds.map((goalId): CompositionNode => ({
      kind: 'goalEntry',
      goalId,
      projectionRole: 'prerequisiteOnly',
    })),
  )
  return transformed
}

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
  const templateFileName = `de-he-seki-${durationModel.toLowerCase()}.view.json`
  const routeContext = reviewedLayoutRouteContext(templateFileName, excludedGoalIds)
  const initialBuckets = assignPrimaryGradeBuckets(durationModel, excludedGoalIds)
  const assignedGoalIds = new Set(Object.values(initialBuckets).flat())
  const extraGoalIds = baseSek1SupplementIds.filter((goalId) => {
    if (excludedGoalIds.has(goalId)) return false
    if (assignedGoalIds.has(goalId)) return false
    const evidenceDurations = evidenceDurationsByAtomicId.get(goalId)
    return !evidenceDurations || evidenceDurations.has(durationModel)
  })
  const buckets = completeSek1RouteBuckets({
    jurisdiction: 'DE-HE',
    durationModel,
    buckets: initialBuckets,
    supplementGoalIds: extraGoalIds,
    routeSeedGoalIds: [
      ...routeContext.replacementTargetGoalIds,
      ...legacyExamRouteSeedGoalIds('DE-HE', yearLabelsByDuration[durationModel]),
    ],
    excludedGoalIds,
    blockedPrerequisiteGoalIds: routeContext.blockedPrerequisiteGoalIds,
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

  const sek1Node: CompositionNode = {
    kind: 'structure',
    id: `sek1-${durationModel.toLowerCase()}`,
    label: 'Sekundarstufe I',
    children,
  }
  return applyReviewedSplitLayout(
    sek1Node,
    templateFileName,
    excludedGoalIds,
  )
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

const rpBucketForCanonicalYear = (year: string): RpStage | null => {
  if (year === '5' || year === '6') return 'orientierungsstufe'
  if (year === '7' || year === '8') return 'klasse7-8'
  if (year === '9' || year === '10') return 'klasse9-10-msa'
  return null
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
  const templateFileName = `de-rp-seki-${durationModel.toLowerCase()}.view.json`
  const routeContext = reviewedLayoutRouteContext(templateFileName, excludedGoalIds)
  const initialBuckets = assignRpStageBuckets(excludedGoalIds)
  const assignedGoalIds = new Set(Object.values(initialBuckets).flat())
  const supplementGoalIds = sortGoalIdsByTitle(baseRpSek1SupplementIds, goalById)
    .filter((goalId) => !excludedGoalIds.has(goalId) && !assignedGoalIds.has(goalId))
  const buckets = completeSek1RouteBuckets({
    jurisdiction: 'DE-RP',
    durationModel,
    buckets: initialBuckets,
    supplementGoalIds,
    routeSeedGoalIds: [
      ...routeContext.replacementTargetGoalIds,
      ...legacyExamRouteSeedGoalIds('DE-RP', yearLabelsByDuration[durationModel]),
    ],
    excludedGoalIds,
    blockedPrerequisiteGoalIds: routeContext.blockedPrerequisiteGoalIds,
    bucketForCanonicalYear: rpBucketForCanonicalYear,
  })

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

  const sek1Node: CompositionNode = {
    kind: 'structure',
    id: `rp-sek1-${durationModel.toLowerCase()}`,
    label: 'Sekundarstufe I',
    children,
  }
  return applyReviewedSplitLayout(
    sek1Node,
    templateFileName,
    excludedGoalIds,
  )
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

const shBucketForCanonicalYear = (year: string): ShBand | null => {
  if (year === '5' || year === '6') return 'jg5-6'
  if (year === '7' || year === '8' || year === '9') return 'jg7-9'
  if (year === '10') return 'jg10'
  return null
}

const shStageWideJ6GoalIds = Array.from(new Set([
  ...collectAtomicDescendantIds(J6_REFLECTIONS_CLUSTER_ID),
  J6_NETS_GOAL_ID,
  J6_OBLIQUE_VIEW_GOAL_ID,
]))

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

const createShStageWideJ6GeometryNode = (durationModel: DurationModel): CompositionNode => ({
  kind: 'structure',
  id: `sh-stage-wide-j6-geometry-${durationModel.toLowerCase()}`,
  label: 'Stufenübergreifend lehrplanbelegte Raum-und-Form-Kompetenzen',
  children: [
    createCanonicalSubtree(J6_REFLECTIONS_CLUSTER_ID),
    createGoalEntry(J6_NETS_GOAL_ID),
    createGoalEntry(J6_OBLIQUE_VIEW_GOAL_ID),
  ],
})

const createShSek1Node = (
  durationModel: DurationModel,
  excludedGoalIds: Set<string> = new Set(),
): CompositionNode => {
  const templateFileName = `de-sh-seki-${durationModel.toLowerCase()}.view.json`
  const routeContext = reviewedLayoutRouteContext(templateFileName, excludedGoalIds)
  const buckets = completeSek1RouteBuckets({
    jurisdiction: 'DE-SH',
    durationModel,
    buckets: assignShBandBuckets(excludedGoalIds),
    supplementGoalIds: shStageWideJ6GoalIds,
    routeSeedGoalIds: [
      ...routeContext.replacementTargetGoalIds,
      ...legacyExamRouteSeedGoalIds('DE-SH', yearLabelsByDuration[durationModel]),
    ],
    excludedGoalIds,
    blockedPrerequisiteGoalIds: routeContext.blockedPrerequisiteGoalIds,
    bucketForCanonicalYear: shBucketForCanonicalYear,
  })
  const sek1Node: CompositionNode = {
    kind: 'structure',
    id: `sh-sek1-${durationModel.toLowerCase()}`,
    label: 'Sekundarstufe I',
    children: [
      createCanonicalSubtree(SEK1_MOTIVATION_GOAL_ID),
      createShStageWideJ6GeometryNode(durationModel),
      ...shBands
        .map((band) => createShBandNode(durationModel, band, buckets[band]))
        .filter((node): node is CompositionNode => node !== null),
      ...createSek1CommonTail(),
    ],
  }
  return applyReviewedSplitLayout(
    sek1Node,
    templateFileName,
    excludedGoalIds,
  )
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

const collectProjectedTargetGoalIds = (
  nodes: CompositionNode[],
  jurisdiction?: string,
): Set<string> => {
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(nodes, goalById)
  return new Set(
    [...targetGoalIds]
      .filter((goalId) => !jurisdiction || isGoalApplicableToJurisdiction(goalId, jurisdiction)),
  )
}

const sek1StructureIdForView = (view: CompositionView): string | null => {
  const durationModel = view.scope.durationModel as DurationModel
  if (view.scope.jurisdiction === 'DE-HE') return `sek1-${durationModel.toLowerCase()}`
  if (view.scope.jurisdiction === 'DE-RP') return `rp-sek1-${durationModel.toLowerCase()}`
  if (view.scope.jurisdiction === 'DE-SH') return `sh-sek1-${durationModel.toLowerCase()}`
  return null
}

const excludedAssessmentIdsByViewId = new Map<string, string[]>()

const applyDirectPrerequisiteOnlyOverrides = (
  nodes: CompositionNode[],
  goalIds: ReadonlySet<string>,
  overriddenGoalIds: Set<string>,
): CompositionNode[] => nodes.map((node) => {
  if (node.kind === 'structure') {
    return {
      ...clone(node),
      children: applyDirectPrerequisiteOnlyOverrides(
        node.children,
        goalIds,
        overriddenGoalIds,
      ),
    }
  }
  if (
    node.kind !== 'landscapeEntry'
    && goalIds.has(node.goalId)
  ) {
    overriddenGoalIds.add(node.goalId)
    return { ...clone(node), projectionRole: 'prerequisiteOnly' }
  }
  return clone(node)
})

/**
 * Assessment nodes with applicabilityFromRequires belong to a generated view
 * only when every direct curricular prerequisite remains a learnable target
 * after the reviewed split layout. This derives assessment visibility from
 * the authored target projection without promoting a deliberately excluded
 * source-unsupported atom back into the curriculum.
 */
const filterAssessmentsWithoutTargetPrerequisites = (view: CompositionView): CompositionView => {
  const structureId = sek1StructureIdForView(view)
  if (!structureId) throw new Error(`Unsupported generated Mathematics jurisdiction ${view.scope.jurisdiction}`)
  const sek1Node = findStructureById(view.rootNodes, structureId)
  if (!sek1Node || sek1Node.kind !== 'structure') {
    throw new Error(`Missing generated Sek-I structure ${structureId} in ${view.viewId}`)
  }

  const allTargetGoalIds = collectProjectedTargetGoalIds(view.rootNodes, view.scope.jurisdiction)
  const learnableCurricularAtomicGoalIds = new Set(
    [...allTargetGoalIds]
      .filter((goalId) => semanticKindByGoalId.get(goalId) === 'curricularAtomic'),
  )
  const unavailableAssessmentGoalIds = [...collectProjectedTargetGoalIds([sek1Node], view.scope.jurisdiction)]
    .filter((goalId) => {
      const goal = goalById.get(goalId)
      if (!goal || (goal.nodeKind !== 'exam' && !goal.examData)) return false
      if (goal.extendedData?.applicabilityFromRequires !== true) return false
      return (goal.requires ?? []).some((requiredId) => (
        semanticKindByGoalId.get(requiredId) === 'curricularAtomic'
        && !learnableCurricularAtomicGoalIds.has(requiredId)
      ))
    })
    .sort()

  excludedAssessmentIdsByViewId.set(view.viewId, unavailableAssessmentGoalIds)
  if (unavailableAssessmentGoalIds.length === 0) return view

  const unavailableAssessmentGoalIdSet = new Set(unavailableAssessmentGoalIds)
  const directlyOverriddenGoalIds = new Set<string>()
  const filteredSek1Node = {
    ...clone(sek1Node),
    children: applyDirectPrerequisiteOnlyOverrides(
      sek1Node.children,
      unavailableAssessmentGoalIdSet,
      directlyOverriddenGoalIds,
    ),
  }
  filteredSek1Node.children.push(...unavailableAssessmentGoalIds
    .filter((goalId) => !directlyOverriddenGoalIds.has(goalId))
    .map((goalId): CompositionNode => ({
    kind: 'goalEntry',
    goalId,
    projectionRole: 'prerequisiteOnly',
    })))
  const replaced = replaceStructureById(view.rootNodes, structureId, filteredSek1Node)
  if (!replaced.replaced) throw new Error(`${view.viewId}: could not apply assessment visibility filter`)
  const filteredView = { ...view, rootNodes: replaced.nodes }
  const stillTargetAssessmentGoalIds = unavailableAssessmentGoalIds.filter((goalId) => (
    collectProjectedTargetGoalIds(filteredView.rootNodes, view.scope.jurisdiction).has(goalId)
  ))
  if (stillTargetAssessmentGoalIds.length > 0) {
    throw new Error(
      `${view.viewId}: assessment visibility override did not remove target(s) ${stillTargetAssessmentGoalIds.join(', ')}`,
    )
  }
  return filteredView
}

const assertCompleteSek1DirectRequirements = (view: CompositionView) => {
  const jurisdiction = view.scope.jurisdiction
  const structureId = sek1StructureIdForView(view)
  if (!structureId) throw new Error(`Unsupported generated Mathematics jurisdiction ${jurisdiction}`)
  const sek1Node = findStructureById(view.rootNodes, structureId)
  if (!sek1Node || sek1Node.kind !== 'structure') {
    throw new Error(`Missing generated Sek-I structure ${structureId} in ${view.viewId}`)
  }

  const allTargetGoalIds = collectProjectedTargetGoalIds(view.rootNodes, jurisdiction)
  const sek1TargetGoalIds = collectProjectedTargetGoalIds([sek1Node], jurisdiction)
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

const unfilteredGeneratedViews = new Map<string, CompositionView>([
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
const generatedViews = new Map(
  [...unfilteredGeneratedViews].map(([fileName, view]) => [
    fileName,
    filterAssessmentsWithoutTargetPrerequisites(view),
  ]),
)

const serialize = (view: CompositionView) => `${JSON.stringify(view, null, 2)}\n`
const canonicalAuthoringLandscape = normalizeCanonicalLandscape(canonicalMath)
const collectCompiledAtomicGoalIds = (
  nodes: CompiledCompositionPreviewNode[],
  jurisdiction?: string,
): Set<string> => {
  const result = new Set<string>()
  const visit = (node: CompiledCompositionPreviewNode) => {
    if (
      node.kind === 'goal'
      && node.sourceGoalId
      && (goalById.get(node.sourceGoalId)?.contains?.length ?? 0) === 0
      && (!jurisdiction || isGoalApplicableToJurisdiction(node.sourceGoalId, jurisdiction))
    ) result.add(node.sourceGoalId)
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  return result
}

const assertGeneratedViewIntegrity = (view: CompositionView) => {
  const normalized = normalizeCompositionView(view)
  const result = compileCompositionView(normalized, canonicalAuthoringLandscape)
  const blockingCodes = new Set(['CPV-004', 'CPV-005', 'CPV-006', 'CPV-007', 'CPV-009'])
  const blockingFindings = result.findings.filter(
    (finding) => finding.severity === 'error' || blockingCodes.has(finding.code),
  )
  if (blockingFindings.length > 0) {
    throw new Error(
      `${view.viewId} fails composition compilation: ${blockingFindings.map((finding) => `${finding.code}: ${finding.message}`).join(' | ')}`,
    )
  }

  const expectedGoalIds = new Set(
    [...collectProjectedTargetGoalIds(view.rootNodes, view.scope.jurisdiction)]
      .filter((goalId) => (goalById.get(goalId)?.contains?.length ?? 0) === 0),
  )
  const actualGoalIds = collectCompiledAtomicGoalIds(result.compiledRootNodes, view.scope.jurisdiction)
  const missing = [...expectedGoalIds].filter((goalId) => !actualGoalIds.has(goalId))
  const unexpected = [...actualGoalIds].filter((goalId) => !expectedGoalIds.has(goalId))
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${view.viewId} compiled goal-set mismatch; missing=${missing.join(',') || '-'} unexpected=${unexpected.join(',') || '-'}`,
    )
  }
}

let differences = 0
for (const fileName of GENERATED_VIEW_PATHS) {
  const generatedView = generatedViews.get(fileName)
  if (!generatedView) {
    throw new Error(`Missing generator output for ${fileName}`)
  }
  assertCompleteSek1DirectRequirements(generatedView)
  assertGeneratedViewIntegrity(generatedView)

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
  const filteredAssessmentIds = excludedAssessmentIdsByViewId.get(generatedView.viewId) ?? []
  console.log(
    `${changed ? 'changed' : 'ok'} ${fileName} ${JSON.stringify(assignedCounts)} `
    + `filteredAssessments=${filteredAssessmentIds.length}`,
  )
}

if (shouldCheck && differences > 0) {
  console.error(`${differences} generated Mathematik G8/G9 composition view file(s) are not up to date. Run npm run generate:math-duration-composition-views.`)
  process.exitCode = 1
}

if (!shouldCheck && !shouldWrite) {
  console.log('Dry run only. Use --write to update generated views or --check to enforce reproducibility.')
}
