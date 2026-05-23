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

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const shouldWrite = process.argv.includes('--write')
const shouldCheck = process.argv.includes('--check')

const landscapeId = '67bd301b-e11a-582d-94ba-4f4b1a4cefff'
const motivationGoalId = 'eff86a92-e048-5494-b561-6ecdda1fbf67'
const sekiRootGoalId = 'becd1384-eff9-5577-371b-dde4ae5e02b2'
const memoryGoalEntries: Array<{ goalId: string; displayLabel: string }> = [
  {
    goalId: 'a3ee5019-5526-5482-88aa-231752016cff',
    displayLabel: 'Grammatik und Rechtschreibung',
  },
  {
    goalId: '637b45ec-67ed-5118-be70-44b070c6f675',
    displayLabel: 'Textsorten und Argumentation',
  },
  {
    goalId: 'c67131c3-ba1f-504e-9569-8638a9467cc1',
    displayLabel: 'Gattungen und literarische Formen',
  },
  {
    goalId: '2ff3c0ca-9f5f-5417-90fd-be9c7bdd1697',
    displayLabel: 'Epochen und Kontexte',
  },
  {
    goalId: 'd44c70eb-2cfb-5fc0-9a0c-64902ce1f1f6',
    displayLabel: 'Rhetorik, Medien und Sprachmodelle',
  },
]
const memoryGoalIds = new Set(memoryGoalEntries.map((entry) => entry.goalId))
const broadGermanGoalIds = new Set([
  'a9154942-479f-54e7-9f65-7312be75686d',
  sekiRootGoalId,
  'bbcabb0c-b319-5622-a5b7-a0259f7de255',
  '17fdc0ce-eca4-5407-b1a0-8c1fbd77cbca',
  'a160849e-f745-5fac-8a73-33421a84f7c1',
  '901965f2-9441-539f-8538-1f80d4fe8fc3',
  '39ec7849-289b-548c-96d7-99fd82a11ac9',
])

const canonicalLandscapePath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json',
)
const mappingRoot = resolve(repoRoot, 'curricula/DE/Gymnasium/mapping')
const durationPolicyPath = resolve(repoRoot, 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')
const compositionViewDir = resolve(repoRoot, 'curricula/DE/Gymnasium/composition-views/deutsch')

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

const isGermanMappingReview = (path: string, review: MappingReview) =>
  review.status === 'complete'
  && /german|deutsch/iu.test(path)
  && /canonical_german/iu.test(path)

const isBroadGermanGoal = (goalId: string, goal: LearningGoal | undefined) => {
  const title = goal?.title?.trim() ?? ''
  return broadGermanGoalIds.has(goalId)
    || title === 'Deutsch'
    || /^E-Phase Deutsch$/u.test(title)
    || /^Q[1-4]$/u.test(title)
    || /^Abiturpruefung/u.test(title)
    || /^Abiturprüfung/u.test(title)
    || /^Übungen /u.test(title)
    || /^Deutsch Gesamtübungen/u.test(title)
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

const buildParentByChild = (goals: LearningGoal[]) => {
  const parentByChild = new Map<string, string[]>()
  goals.forEach((goal) => {
    ;(goal.contains ?? []).forEach((childGoalId) => {
      const parents = parentByChild.get(childGoalId) ?? []
      parents.push(goal.id)
      parentByChild.set(childGoalId, parents)
    })
  })
  return parentByChild
}

const findSekIYearRoot = (
  goalId: string,
  sekiYearRootIds: Set<string>,
  parentByChild: Map<string, string[]>,
  visited: Set<string> = new Set(),
): string | null => {
  if (sekiYearRootIds.has(goalId)) return goalId
  if (visited.has(goalId)) return null
  visited.add(goalId)
  for (const parentGoalId of parentByChild.get(goalId) ?? []) {
    const yearRoot = findSekIYearRoot(parentGoalId, sekiYearRootIds, parentByChild, visited)
    if (yearRoot) return yearRoot
  }
  return null
}

const buildSekIChildren = (
  jurisdiction: string,
  targetGoalIds: Set<string>,
  goalById: Map<string, LearningGoal>,
  parentByChild: Map<string, string[]>,
) => {
  const blockedSubtreeGoalIds = new Set<string>([motivationGoalId])
  memoryGoalIds.forEach((goalId) => blockedSubtreeGoalIds.add(goalId))

  const extraCandidateGoalIds = Array.from(targetGoalIds).filter((goalId) =>
    goalId !== motivationGoalId
    && !memoryGoalIds.has(goalId)
    && !isBroadGermanGoal(goalId, goalById.get(goalId)),
  )
  const selectedGoalIds = selectNonOverlappingGoalIds(extraCandidateGoalIds, blockedSubtreeGoalIds, goalById)
  const sekiYearRootIds = new Set(goalById.get(sekiRootGoalId)?.contains ?? [])
  const selectedByYearRoot = new Map<string, string[]>()
  const additionalGoalIds: string[] = []

  selectedGoalIds.forEach((goalId) => {
    const yearRoot = findSekIYearRoot(goalId, sekiYearRootIds, parentByChild)
    if (!yearRoot) {
      additionalGoalIds.push(goalId)
      return
    }
    const current = selectedByYearRoot.get(yearRoot) ?? []
    current.push(goalId)
    selectedByYearRoot.set(yearRoot, current)
  })

  const children: CompositionNode[] = []
  for (const yearRootId of goalById.get(sekiRootGoalId)?.contains ?? []) {
    const yearGoalIds = selectedByYearRoot.get(yearRootId)
    if (!yearGoalIds || yearGoalIds.length === 0) continue
    children.push({
      kind: 'structure',
      id: `german-${jurisdictionSlug(jurisdiction)}-seki-${yearRootId.slice(0, 8)}`,
      label: goalById.get(yearRootId)?.title ?? 'Jahrgangsstufe',
      children: sortGoalIdsByTitle(yearGoalIds, goalById).map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
    })
  }

  const sortedAdditionalGoalIds = sortGoalIdsByTitle(additionalGoalIds, goalById)
  if (sortedAdditionalGoalIds.length > 0) {
    children.push({
      kind: 'structure',
      id: `german-${jurisdictionSlug(jurisdiction)}-seki-additional`,
      label: 'Weitere gemappte Ziele',
      children: sortedAdditionalGoalIds.map((goalId) => ({ kind: 'canonicalSubtree', goalId })),
    })
  }

  if (children.length === 0) {
    throw new Error(`No learner-facing mapped German goals for ${jurisdiction}`)
  }

  return children
}

const buildView = ({
  jurisdiction,
  durationModel,
  targetGoalIds,
  goalById,
  parentByChild,
}: {
  jurisdiction: string
  durationModel?: DurationModel
  targetGoalIds: Set<string>
  goalById: Map<string, LearningGoal>
  parentByChild: Map<string, string[]>
}): CompositionView => {
  const durationSuffix = durationModel ? `-${durationModel.toLowerCase()}` : ''
  const viewId = `${jurisdictionSlug(jurisdiction)}-gym-seki-german${durationSuffix}`
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
        label: 'Deutsch',
        children: [
          {
            kind: 'goalEntry',
            goalId: motivationGoalId,
            displayLabel: 'Warum Deutsch?',
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
            children: buildSekIChildren(jurisdiction, targetGoalIds, goalById, parentByChild),
          },
        ],
      },
    ],
  }
}

const canonicalLandscape = readJson<LearningLandscape>(canonicalLandscapePath)
const goalById = new Map(canonicalLandscape.goals.map((goal) => [goal.id, goal]))
const parentByChild = buildParentByChild(canonicalLandscape.goals)
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
  if (!isGermanMappingReview(mappingPath, review) || !review.sourceExtractionPath) continue
  completeMappingsBySourcePath.set(review.sourceExtractionPath, review)
  sourceGoalsBySourcePath.set(review.sourceExtractionPath, loadSourceGoalsById(review.sourceExtractionPath))
}

const policiesByJurisdiction = new Map<string, DurationPolicyDecision[]>()
for (const decision of policy.decisions ?? []) {
  if (decision.status !== 'reviewed') continue
  if (decision.subject !== 'Deutsch') continue
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
        throw new Error(`${jurisdiction} references missing canonical German goal ${entry.canonicalGoalId}`)
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
  const view = buildView({ jurisdiction, durationModel, targetGoalIds, goalById, parentByChild })
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
  console.error(`${differences} Deutsch Sek-I composition view file(s) are not up to date.`)
  process.exit(1)
}

console.log(`Deutsch Sek-I composition views: ${generatedViews.size} checked, ${differences} changed`)
if (skipped.length > 0) {
  console.log(`Skipped incomplete Deutsch Sek-I source scopes: ${skipped.join('; ')}`)
}
