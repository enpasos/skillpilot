import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
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
    }
  | {
      kind: 'goalEntry'
      goalId: string
      displayLabel?: string
    }

interface CompositionView {
  viewId: string
  landscapeId: string
  scope: {
    schoolForm: string
    jurisdiction: string
    stage: string
    durationModel?: DurationModel
  }
  rootNodes: CompositionNode[]
}

interface LearningGoal {
  id: string
  title?: string
  contains?: string[]
}

interface LearningLandscape {
  goals: LearningGoal[]
}

interface MappingEntry {
  legacyGoalId?: string
  sourceGoalId?: string
  canonicalGoalId?: string
}

interface MappingReview {
  status?: string
  sourceExtractionPath?: string
  mappings?: MappingEntry[]
}

interface DurationPolicyDecision {
  subject?: string
  jurisdiction?: string
  stage?: string
  status?: string
  decision?: string
  durationModels?: string[]
  sourceExtractionPath?: string
}

interface DurationPolicyDocument {
  decisions?: DurationPolicyDecision[]
}

interface SourceGoal {
  id?: string
  grade?: string | number
  phase?: string
  stage?: string
  topicCode?: string
  sourceSpan?: string
  rawSourceSpan?: string
}

interface SourceExtraction {
  sourceGoals?: SourceGoal[]
  goals?: SourceGoal[]
}

interface HistoryGroup {
  id: string
  label: string
  goalIds: string[]
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldWrite = process.argv.includes('--write')
const shouldCheck = process.argv.includes('--check')

const landscapeId = '92406d94-e3c1-58ec-b7c6-12122278d25a'
const motivationGoalId = '178c5d72-5a0c-514e-abed-0dc65c8d1aa2'
const memoryGoalEntries: Array<{ goalId: string; displayLabel: string }> = [
  {
    goalId: 'eea10293-4e90-51cd-916e-7e47dbe02bfb',
    displayLabel: 'Vormoderne und Revolution',
  },
  {
    goalId: '9759acac-3f6c-5867-8a58-fa551cb19217',
    displayLabel: '19. Jahrhundert',
  },
  {
    goalId: '0c90c37c-d7e0-53d4-8d1a-791fbea4afd9',
    displayLabel: 'Demokratie und Diktatur 1917-1945',
  },
  {
    goalId: '1cd8bd37-1b33-51fb-9e03-6cc5fdb92552',
    displayLabel: 'Kalter Krieg und Gegenwart',
  },
  {
    goalId: 'b1f05f41-5a8a-504c-8828-ecb5cf4e75f8',
    displayLabel: 'Erinnerungskultur und Deutungsbegriffe',
  },
]
const memoryGoalIds = new Set(memoryGoalEntries.map((entry) => entry.goalId))
const broadHistoryGoalIds = new Set([
  '37edc7ba-faca-5142-a909-4d8ecf4bd18b',
  'abed1f19-6cf8-54a4-aae2-d7691f97c2cf',
  '7463da45-5b44-5d6f-8b27-6c64bfe86abd',
  'ab3219a8-a9c3-5a2f-90c5-6bf0653dbd8b',
  'f9115061-fd36-5369-a4e9-a2d90475f855',
  '116f7ac0-2353-55a2-aded-f344f85aa053',
])

const canonicalLandscapePath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GESCHICHTE.de.json',
)
const mappingRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/mapping')
const durationPolicyPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')
const compositionViewDir = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/geschichte')

const historyGroups: HistoryGroup[] = [
  {
    id: 'orientation-premodern',
    label: 'Orientierung, Antike und Mittelalter',
    goalIds: [
      '3537a9c4-d336-5603-baf0-c428a7b20002',
      'a7c2904a-c503-5e92-9f10-3a5fb34d7493',
      '1bd17323-6be0-5391-967b-491a4e6ae43e',
      'c72992e6-65e0-5ee4-81f0-ef559a944816',
    ],
  },
  {
    id: 'early-modern-revolutions',
    label: 'Fruehe Neuzeit und Revolutionen',
    goalIds: [
      '7bde1df5-df50-5072-9a99-717f9399f8c8',
      '11dda1f5-9ebf-555b-957c-a8b078e7c06e',
      'b8db32ab-8161-5606-98cc-34317fe03db6',
    ],
  },
  {
    id: '19th-century',
    label: '19. Jahrhundert und Imperialismus',
    goalIds: [
      'b02153d5-1927-552f-b85f-321fc6c2e8ba',
      'ddfaf985-565f-5c4f-a296-604ddb65fdeb',
      'a7909282-9adf-5951-b787-00b912ac58e7',
      '2a512759-d891-5a8b-964d-9a3293bd9c2b',
    ],
  },
  {
    id: 'democracy-dictatorship-war',
    label: 'Demokratie, Diktatur und Krieg',
    goalIds: [
      '8c8235fd-3d3b-5eee-b019-b7040b1ab2f0',
      'c6610ddb-a933-5097-8225-dc00602c4cfe',
      'e7718577-7e82-5481-8398-460a06c5f3fb',
      '3b7bbc95-fca2-5075-9e08-586959e9b329',
      '77a129c7-0b39-5c4b-b331-059441f33f9b',
      '1a14733f-5dcd-5e19-bf1b-5c961142c968',
    ],
  },
  {
    id: 'postwar',
    label: 'Nachkriegsordnung und deutsche Teilung',
    goalIds: [
      'e44f244f-2d3f-566b-bd1c-cb396fa82fc2',
      'dcb1f0be-2029-5b11-89b1-9fa68d6f9de4',
      '689a4924-7a74-5a2d-a012-60360c0060d0',
      '1fd55448-a4f8-5fb1-b11a-22468519286a',
      'd5ae0c94-50fc-511f-9029-166b2211a94d',
    ],
  },
]

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

const collectFiles = (directory: string, predicate: (path: string) => boolean, target: string[] = []): string[] => {
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
    if (entry.isFile() && predicate(absolutePath)) {
      target.push(absolutePath)
    }
  }
  return target
}

const repoPath = (absolutePath: string) => absolutePath.replace(`${repoRoot}/`, '')

const normalizeDurationModel = (value?: string): DurationModel | null => {
  const normalized = value?.trim().toUpperCase()
  return normalized === 'G8' || normalized === 'G9' ? normalized : null
}

const normalizeStage = (value?: string) => value?.trim().toUpperCase() ?? ''

const stageTouchesSekI = (stage?: string) => {
  const normalized = normalizeStage(stage)
  return normalized === 'SEKI'
    || normalized === 'CROSSSTAGE'
    || normalized === 'GYMNASIUM'
    || normalized === 'SEKI+SEKII'
    || normalized === 'SEKI/SEKII'
    || normalized === 'SEKI-SEKII'
}

const jurisdictionSlug = (jurisdiction: string) => jurisdiction.toLowerCase()

const extractJahrgangNumbers = (value?: string | number) => {
  if (value === undefined) return []
  const text = String(value)
  const explicitJahrgangMatches = Array.from(text.matchAll(/\bJ(\d{1,2})(?!\d)/giu)).map((match) => Number(match[1]))
  if (explicitJahrgangMatches.length > 0) return explicitJahrgangMatches

  return Array.from(text.matchAll(/\b(\d{1,2})(?:\s*[-/]\s*(\d{1,2}))?\b/gu)).flatMap((match) => {
    const start = Number(match[1])
    const end = match[2] ? Number(match[2]) : start
    if (!Number.isFinite(start) || !Number.isFinite(end)) return []
    if (start > end) return [start, end]
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  })
}

const isSekISourceGoal = (sourceGoal: SourceGoal | undefined) => {
  if (!sourceGoal) return true
  const topicGrades = [
    sourceGoal.topicCode,
    sourceGoal.sourceSpan,
    sourceGoal.rawSourceSpan,
  ].flatMap(extractJahrgangNumbers)
  const grades = topicGrades.length > 0
    ? topicGrades
    : [
        sourceGoal.grade,
        sourceGoal.phase,
      ].flatMap(extractJahrgangNumbers)

  if (grades.length > 0) return grades.some((grade) => grade >= 5 && grade <= 10)

  const stage = normalizeStage(sourceGoal.stage)
  return stage === '' || stage === 'SEKI' || stage === 'LOWERSECONDARY' || stage === 'LOWER_SECONDARY'
}

const loadSourceGoalsById = (sourceExtractionPath: string) => {
  const sourcePath = resolve(repoRoot, sourceExtractionPath)
  if (!existsSync(sourcePath)) return new Map<string, SourceGoal>()
  const extraction = readJson<SourceExtraction>(sourcePath)
  const sourceGoals = extraction.sourceGoals ?? extraction.goals ?? []
  return new Map(sourceGoals.flatMap((goal) => (goal.id ? [[goal.id, goal]] : [])))
}

const isHistoryMappingReview = (path: string, review: MappingReview) =>
  review.status === 'complete'
  && /history|geschichte/iu.test(path)
  && /canonical_history/iu.test(path)

const isBroadHistoryGoal = (goalId: string, goal: LearningGoal | undefined) => {
  const title = goal?.title?.trim() ?? ''
  return broadHistoryGoalIds.has(goalId)
    || title === 'Geschichte'
    || /^E-Phase Geschichte$/u.test(title)
    || /^Q[1-4] Geschichte$/u.test(title)
    || /^Abiturpruefung/u.test(title)
    || /^Abiturprüfung/u.test(title)
    || /^Übungen Geschichte/u.test(title)
}

const sortGoalIdsByTitle = (goalIds: Iterable<string>, goalById: Map<string, LearningGoal>) =>
  Array.from(goalIds).sort((left, right) => {
    const leftTitle = goalById.get(left)?.title ?? ''
    const rightTitle = goalById.get(right)?.title ?? ''
    const titleCompare = leftTitle.localeCompare(rightTitle, 'de', { numeric: true, sensitivity: 'base' })
    return titleCompare || left.localeCompare(right)
  })

const collectSubtreeGoalIds = (
  goalId: string,
  goalById: Map<string, LearningGoal>,
  visited: Set<string> = new Set(),
): Set<string> => {
  if (visited.has(goalId)) return visited
  visited.add(goalId)
  const goal = goalById.get(goalId)
  for (const childGoalId of goal?.contains ?? []) {
    collectSubtreeGoalIds(childGoalId, goalById, visited)
  }
  return visited
}

const intersects = (left: Set<string>, right: Set<string>) => {
  for (const value of left) {
    if (right.has(value)) return true
  }
  return false
}

const selectNonOverlappingGoalIds = (
  candidateGoalIds: string[],
  blockedSubtreeGoalIds: Set<string>,
  goalById: Map<string, LearningGoal>,
) => {
  const selectedSubtreeGoalIds = new Set(blockedSubtreeGoalIds)
  const subtreeByGoalId = new Map<string, Set<string>>()
  candidateGoalIds.forEach((goalId) => {
    subtreeByGoalId.set(goalId, collectSubtreeGoalIds(goalId, goalById))
  })

  const selectedGoalIds: string[] = []
  const sortedCandidates = candidateGoalIds.sort((left, right) => {
    const sizeCompare = (subtreeByGoalId.get(right)?.size ?? 0) - (subtreeByGoalId.get(left)?.size ?? 0)
    if (sizeCompare !== 0) return sizeCompare
    return left.localeCompare(right)
  })

  for (const goalId of sortedCandidates) {
    const subtreeGoalIds = subtreeByGoalId.get(goalId) ?? new Set([goalId])
    if (intersects(subtreeGoalIds, selectedSubtreeGoalIds)) continue
    selectedGoalIds.push(goalId)
    subtreeGoalIds.forEach((subtreeGoalId) => selectedSubtreeGoalIds.add(subtreeGoalId))
  }

  return selectedGoalIds
}

const buildSekIChildren = (
  jurisdiction: string,
  targetGoalIds: Set<string>,
  goalById: Map<string, LearningGoal>,
) => {
  const includedGoalIds = new Set<string>()
  const children: CompositionNode[] = []

  for (const group of historyGroups) {
    const groupGoalIds = group.goalIds.filter((goalId) => targetGoalIds.has(goalId))
    if (groupGoalIds.length === 0) continue
    groupGoalIds.forEach((goalId) => includedGoalIds.add(goalId))
    children.push({
      kind: 'structure',
      id: `history-${jurisdictionSlug(jurisdiction)}-seki-${group.id}`,
      label: group.label,
      children: groupGoalIds.map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
    })
  }

  const includedSubtreeGoalIds = new Set<string>()
  includedGoalIds.forEach((goalId) => {
    collectSubtreeGoalIds(goalId, goalById).forEach((subtreeGoalId) => includedSubtreeGoalIds.add(subtreeGoalId))
  })
  includedSubtreeGoalIds.add(motivationGoalId)
  memoryGoalIds.forEach((goalId) => includedSubtreeGoalIds.add(goalId))

  const extraCandidateGoalIds = Array.from(targetGoalIds).filter((goalId) =>
    !includedGoalIds.has(goalId)
    && goalId !== motivationGoalId
    && !memoryGoalIds.has(goalId)
    && !isBroadHistoryGoal(goalId, goalById.get(goalId)),
  )
  const extraGoalIds = sortGoalIdsByTitle(
    selectNonOverlappingGoalIds(extraCandidateGoalIds, includedSubtreeGoalIds, goalById),
    goalById,
  )

  if (extraGoalIds.length > 0) {
    children.push({
      kind: 'structure',
      id: `history-${jurisdictionSlug(jurisdiction)}-seki-additional`,
      label: 'Weitere gemappte Ziele',
      children: extraGoalIds.map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
    })
  }

  if (children.length === 0) {
    throw new Error(`No learner-facing mapped history goals for ${jurisdiction}`)
  }

  return children
}

const buildView = ({
  jurisdiction,
  durationModel,
  targetGoalIds,
  goalById,
}: {
  jurisdiction: string
  durationModel?: DurationModel
  targetGoalIds: Set<string>
  goalById: Map<string, LearningGoal>
}): CompositionView => {
  const durationSuffix = durationModel ? `-${durationModel.toLowerCase()}` : ''
  const viewId = `${jurisdictionSlug(jurisdiction)}-gym-seki-history${durationSuffix}`
  return {
    viewId,
    landscapeId,
    scope: {
      jurisdiction,
      schoolForm: 'Gymnasium',
      stage: 'SekI',
      ...(durationModel ? { durationModel } : {}),
    },
    rootNodes: [
      {
        kind: 'structure',
        id: `${viewId}-root`,
        label: 'Geschichte',
        children: [
          {
            kind: 'goalEntry',
            goalId: motivationGoalId,
            displayLabel: 'Warum Geschichte?',
          },
          {
            kind: 'structure',
            id: `${viewId}-memory`,
            label: 'Lernkarten',
            children: memoryGoalEntries.map((entry) => ({
              kind: 'goalEntry',
              goalId: entry.goalId,
              displayLabel: entry.displayLabel,
            })),
          },
          {
            kind: 'structure',
            id: `${viewId}-seki`,
            label: 'Sekundarstufe I',
            children: buildSekIChildren(jurisdiction, targetGoalIds, goalById),
          },
        ],
      },
    ],
  }
}

const canonicalLandscape = readJson<LearningLandscape>(canonicalLandscapePath)
const goalById = new Map(canonicalLandscape.goals.map((goal) => [goal.id, goal]))
const policy = readJson<DurationPolicyDocument>(durationPolicyPath)

const completeMappingsBySourcePath = new Map<string, MappingReview>()
const sourceGoalsBySourcePath = new Map<string, Map<string, SourceGoal>>()
for (const mappingPath of collectFiles(mappingRoot, (path) => /\.review\.json$/u.test(path))) {
  let review: MappingReview
  try {
    review = readJson<MappingReview>(mappingPath)
  } catch {
    continue
  }
  if (!isHistoryMappingReview(mappingPath, review) || !review.sourceExtractionPath) continue
  completeMappingsBySourcePath.set(review.sourceExtractionPath, review)
  sourceGoalsBySourcePath.set(review.sourceExtractionPath, loadSourceGoalsById(review.sourceExtractionPath))
}

const policiesByJurisdiction = new Map<string, DurationPolicyDecision[]>()
for (const decision of policy.decisions ?? []) {
  if (decision.status !== 'reviewed') continue
  if (decision.subject !== 'Geschichte') continue
  if (!decision.jurisdiction || !decision.sourceExtractionPath) continue
  if (!stageTouchesSekI(decision.stage)) continue

  const current = policiesByJurisdiction.get(decision.jurisdiction) ?? []
  current.push(decision)
  policiesByJurisdiction.set(decision.jurisdiction, current)
}

const generatedViews = new Map<string, CompositionView>()
const skipped: string[] = []
for (const [jurisdiction, decisions] of Array.from(policiesByJurisdiction.entries()).sort(([left], [right]) =>
  left.localeCompare(right),
)) {
  const missingSources = decisions
    .map((decision) => decision.sourceExtractionPath as string)
    .filter((sourcePath) => !completeMappingsBySourcePath.has(sourcePath))

  if (missingSources.length > 0) {
    skipped.push(`${jurisdiction}: ${missingSources.join(', ')}`)
    continue
  }

  const targetGoalIds = new Set<string>()
  decisions.forEach((decision) => {
    const mapping = completeMappingsBySourcePath.get(decision.sourceExtractionPath as string)
    const sourceGoalsById = sourceGoalsBySourcePath.get(decision.sourceExtractionPath as string) ?? new Map()
    ;(mapping?.mappings ?? []).forEach((entry) => {
      if (!entry.canonicalGoalId) return
      const sourceGoalId = entry.legacyGoalId ?? entry.sourceGoalId
      if (sourceGoalId && !isSekISourceGoal(sourceGoalsById.get(sourceGoalId))) return
      if (!goalById.has(entry.canonicalGoalId)) {
        throw new Error(`${jurisdiction} references missing canonical history goal ${entry.canonicalGoalId}`)
      }
      targetGoalIds.add(entry.canonicalGoalId)
    })
  })

  const normalizedDurationModels = Array.from(new Set(
    decisions.flatMap((decision) => decision.durationModels ?? [])
      .map(normalizeDurationModel)
      .filter((durationModel): durationModel is DurationModel => !!durationModel),
  ))
  const hasDurationNeutralDecision = decisions.some((decision) =>
    decision.decision === 'duration-neutral-projection' || decision.decision === 'no-difference-projection',
  )
  const durationModel = hasDurationNeutralDecision ? undefined : normalizedDurationModels[0]
  const view = buildView({ jurisdiction, durationModel, targetGoalIds, goalById })
  generatedViews.set(`${view.viewId}.view.json`, view)
}

let differences = 0
for (const [fileName, view] of generatedViews) {
  const targetPath = resolve(compositionViewDir, fileName)
  const nextContent = `${JSON.stringify(view, null, 2)}\n`
  const currentContent = existsSync(targetPath) ? readFileSync(targetPath, 'utf8') : ''
  if (currentContent !== nextContent) {
    differences += 1
    if (shouldWrite) {
      mkdirSync(dirname(targetPath), { recursive: true })
      writeFileSync(targetPath, nextContent)
      console.log(`wrote ${repoPath(targetPath)}`)
    } else {
      console.log(`pending ${repoPath(targetPath)}`)
    }
  }
}

if (shouldCheck && differences > 0) {
  console.error(`${differences} Geschichte Sek-I composition view file(s) are not up to date.`)
  process.exit(1)
}

console.log(`Geschichte Sek-I composition views: ${generatedViews.size} checked, ${differences} changed`)
if (skipped.length > 0) {
  console.log(`Skipped incomplete Geschichte Sek-I source scopes: ${skipped.join('; ')}`)
}
