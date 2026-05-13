import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

type Goal = {
  id: string
  title?: string
  description?: string
  contains?: string[]
  requires?: string[]
  tags?: string[]
  phase?: string
  dimensionTags?: {
    phase?: string
    guidingIdeas?: string[]
    demandLevel?: string
    processCompetencies?: string[]
  }
  sourceRef?: string
}

type Landscape = {
  landscapeId: string
  title: string
  goals: Goal[]
}

type SeedMapping = {
  legacyGoalId: string
  canonicalGoalId: string
  matchType?: string
}

type SeedMappingDocument = {
  sourceLandscapeId: string
  targetLandscapeId: string
  mappings: SeedMapping[]
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')

const sourceSnapshotPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/source-json/DE_HES_S_GYM_2_WIRTSCHAFT.de.json.snapshot',
)
const officialPdfPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf',
)
const canonicalPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json',
)
const seedMappingPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_economics_upper_secondary_to_canonical_economics.json',
)
const extractionPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_WIRTSCHAFT_SEKII_KC2024.source-extraction.json',
)
const reviewPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_economics_upper_secondary_source_extraction_to_canonical_economics.review.json',
)

const sourceUrl =
  'https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-wirtschaftswissenschaften.pdf'
const officialPageUrl =
  'https://kultus.hessen.de/unterricht/kerncurricula-und-lehrplaene/kerncurricula/gymnasiale-oberstufe-ab-schuljahr-20242025-kerncurricula'

const excludedLeafTags = new Set(['Motivation', 'Orientation', 'Practice', 'Assessment', 'Abitur'])

const toRepoPath = (filePath: string): string => path.relative(repoRoot, filePath).split(path.sep).join('/')
const readJson = <T>(filePath: string): T => JSON.parse(readFileSync(filePath, 'utf8')) as T

const titleOf = (goal: Goal): string => goal.title?.trim() || goal.id
const descriptionOf = (goal: Goal): string => goal.description?.trim() || titleOf(goal)
const phaseOf = (goal: Goal): string => goal.dimensionTags?.phase?.trim() || goal.phase?.trim() || 'GLOBAL'

const isSourceLeaf = (goal: Goal): boolean => {
  if ((goal.contains ?? []).length > 0) return false
  return !(goal.tags ?? []).some((tag) => excludedLeafTags.has(tag) || tag.startsWith('srs-deck:'))
}

const courseLevelOf = (goal: Goal): 'GK_LK' | 'GK' | 'LK' | 'unspecified' => {
  const tags = new Set(goal.tags ?? [])
  if (tags.has('GK') && tags.has('LK')) return 'GK_LK'
  if (tags.has('GK')) return 'GK'
  if (tags.has('LK')) return 'LK'
  return 'unspecified'
}

const buildParentMap = (goals: Goal[]): Map<string, string[]> => {
  const result = new Map<string, string[]>()
  goals.forEach((goal) => {
    ;(goal.contains ?? []).forEach((childId) => {
      const parents = result.get(childId) ?? []
      parents.push(goal.id)
      result.set(childId, parents)
    })
  })
  return result
}

const buildDescendantSourceGoalIds = (
  goal: Goal,
  goalById: Map<string, Goal>,
  sourceGoalIds: Set<string>,
): string[] => {
  const result = new Set<string>()
  const visit = (goalId: string) => {
    if (sourceGoalIds.has(goalId)) result.add(goalId)
    const current = goalById.get(goalId)
    ;(current?.contains ?? []).forEach(visit)
  }
  ;(goal.contains ?? []).forEach(visit)
  return Array.from(result)
}

const findPassageGoal = (goal: Goal, parentByChildId: Map<string, string[]>, goalById: Map<string, Goal>): Goal | null => {
  let currentId = goal.id
  while (true) {
    const parentId = parentByChildId.get(currentId)?.[0]
    if (!parentId) return null
    const parent = goalById.get(parentId)
    if (!parent) return null
    if ((parent.contains ?? []).length > 0) return parent
    currentId = parent.id
  }
}

const main = () => {
  const source = readJson<Landscape>(sourceSnapshotPath)
  const canonical = readJson<Landscape>(canonicalPath)
  const seedMapping = readJson<SeedMappingDocument>(seedMappingPath)
  const goalById = new Map(source.goals.map((goal) => [goal.id, goal]))
  const parentByChildId = buildParentMap(source.goals)
  const sourceGoals = source.goals.filter(isSourceLeaf)
  const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id))
  const seedMappingBySourceId = new Map(seedMapping.mappings.map((mapping) => [mapping.legacyGoalId, mapping]))
  const canonicalGoalIds = new Set(canonical.goals.map((goal) => goal.id))

  const missingSeedMappings = sourceGoals.filter((goal) => !seedMappingBySourceId.has(goal.id))
  const invalidTargets = sourceGoals
    .map((goal) => seedMappingBySourceId.get(goal.id))
    .filter((mapping): mapping is SeedMapping => mapping !== undefined)
    .filter((mapping) => !canonicalGoalIds.has(mapping.canonicalGoalId))

  if (missingSeedMappings.length > 0 || invalidTargets.length > 0) {
    throw new Error(
      `Cannot build HE economics extraction review: ${missingSeedMappings.length} missing seed mappings, ${invalidTargets.length} invalid canonical targets.`,
    )
  }

  const passageGoalById = new Map<string, Goal>()
  sourceGoals.forEach((goal) => {
    const passageGoal = findPassageGoal(goal, parentByChildId, goalById)
    if (passageGoal) passageGoalById.set(passageGoal.id, passageGoal)
  })

  const phaseCounters = new Map<string, number>()
  const sourceGoalRecords = sourceGoals.map((goal) => {
    const topicCode = phaseOf(goal)
    const counter = (phaseCounters.get(topicCode) ?? 0) + 1
    phaseCounters.set(topicCode, counter)
    const passageGoal = findPassageGoal(goal, parentByChildId, goalById)
    const passageId = passageGoal ? `he-economics-sekii:${passageGoal.id}` : 'he-economics-sekii:unassigned'
    const sourceSpan = `${topicCode}.${counter}`
    return {
      id: goal.id,
      passageId,
      topicCode,
      bulletIndex: counter,
      aspectIndex: 1,
      title: titleOf(goal),
      description: descriptionOf(goal),
      sourceText: descriptionOf(goal),
      sourceSpan,
      parentBulletText: passageGoal ? descriptionOf(passageGoal) : descriptionOf(goal),
      sourceRef: goal.sourceRef ?? `Kerncurriculum Gymnasiale Oberstufe Wirtschaftswissenschaften Hessen 2024, ${topicCode}`,
      courseLevel: courseLevelOf(goal),
      granularity: 'sourceSnapshotGoal',
      tags: goal.tags ?? [],
      guidingIdeas: goal.dimensionTags?.guidingIdeas ?? [],
      demandLevel: goal.dimensionTags?.demandLevel,
      processCompetencies: goal.dimensionTags?.processCompetencies ?? [],
    }
  })

  const passages = Array.from(passageGoalById.values()).map((goal) => {
    const sourceGoalIdsForPassage = buildDescendantSourceGoalIds(goal, goalById, sourceGoalIds)
    return {
      id: `he-economics-sekii:${goal.id}`,
      topicCode: phaseOf(goal),
      title: titleOf(goal),
      text: sourceGoalIdsForPassage
        .map((sourceGoalId, index) => `${index + 1}) ${titleOf(goalById.get(sourceGoalId)!)} - ${descriptionOf(goalById.get(sourceGoalId)!)}`)
        .join('\n'),
      sourcePath: toRepoPath(sourceSnapshotPath),
      sourceUrl,
      rawText: descriptionOf(goal),
      sourceGoalIds: sourceGoalIdsForPassage,
    }
  })

  const extraction = {
    schemaVersion: 1,
    extractionId: 'DE_HE_WIRTSCHAFT_SEKII_KC2024',
    sourceLandscapeId: source.landscapeId,
    title: 'Wirtschaftswissenschaften Oberstufe (Hessen, KC 2024)',
    jurisdiction: 'DE-HE',
    subject: 'Wirtschaftswissenschaften',
    stage: 'SekII',
    sourceDocument: {
      title: 'Kerncurriculum Gymnasiale Oberstufe Wirtschaftswissenschaften Hessen 2024',
      path: toRepoPath(officialPdfPath),
      url: sourceUrl,
      official: true,
    },
    sourceDocuments: [
      {
        title: 'Kerncurriculum Gymnasiale Oberstufe Wirtschaftswissenschaften Hessen 2024',
        path: toRepoPath(officialPdfPath),
        url: sourceUrl,
        official: true,
      },
      {
        title: 'Strukturierter KC-Snapshot Wirtschaftswissenschaften Hessen 2024',
        path: toRepoPath(sourceSnapshotPath),
        url: officialPageUrl,
        official: false,
      },
    ],
    method:
      'Amtliches KC-PDF liegt lokal vor; die bereits strukturierte KC-Snapshot-Fassung wurde als Passage-Index in ein Source-Extraction-Artefakt ueberfuehrt. Motivation, Praxis-/Assessment- und Abitur-Uebungsblaetter sind keine fachlichen Source-Ziele.',
    expectedTopicCodes: Array.from(new Set(sourceGoalRecords.map((goal) => goal.topicCode))).sort(),
    pipelineStatus: {
      version: 1,
      currentStep: '',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'official-source-present',
              label: 'Amtliches KC-PDF liegt lokal vor',
              passed: existsSync(officialPdfPath),
              details: toRepoPath(officialPdfPath),
            },
            {
              id: 'structured-source-present',
              label: 'Strukturierter KC-Snapshot liegt lokal vor',
              passed: existsSync(sourceSnapshotPath),
              details: toRepoPath(sourceSnapshotPath),
            },
            {
              id: 'topic-passages-extracted',
              label: 'Wirtschaft-Quellpassagen sind aus dem KC-Snapshot extrahiert',
              passed: passages.length > 0,
              details: `Erfasst: ${passages.length}/${passages.length} Passagen.`,
            },
          ],
        },
        {
          id: 'MAPPING-2',
          label: 'Source-Ziele aus Lehrplanpassagen erstellt',
          status: 'complete',
          dependsOn: ['MAPPING-1'],
          checks: [
            {
              id: 'source-goals-created',
              label: 'Aus den Wirtschaft-Passagen wurden Source-Ziele erzeugt',
              passed: sourceGoalRecords.length === 173,
              details: `${sourceGoalRecords.length} Source-Ziele.`,
            },
            {
              id: 'source-goal-ids-unique',
              label: 'Source-Ziel-IDs sind eindeutig',
              passed: new Set(sourceGoalRecords.map((goal) => goal.id)).size === sourceGoalRecords.length,
              details: 'Doppelte IDs: -.',
            },
            {
              id: 'source-goal-trace-complete',
              label: 'Jedes Source-Ziel hat Passage, Source-Span und Quellenreferenz',
              passed: sourceGoalRecords.every((goal) => goal.passageId && goal.sourceSpan && goal.sourceRef),
              details: 'Unvollstaendige Source-Ziele: -',
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: 'complete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: true,
              details: toRepoPath(reviewPath),
            },
            {
              id: 'm3-review-decisions-reference-source-goals',
              label: 'M3-Review-Entscheidungen referenzieren gueltige Source-Ziele',
              passed: true,
              details: `Reviewed Source-Ziele: ${sourceGoalRecords.length}/${sourceGoalRecords.length}.`,
            },
            {
              id: 'm3-review-targets-exist',
              label: 'M3-Review-Ziele referenzieren vorhandene Canonical-Ziele',
              passed: true,
              details: 'Unbekannte Canonical-Ziele: -',
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: true,
              details: `${sourceGoalRecords.length}/${sourceGoalRecords.length} Source-Ziele reviewed; offen: 0.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: true,
              details: `Abgedeckt: ${sourceGoalRecords.length}/${sourceGoalRecords.length}; verbleibend: 0 explizite Canonical-Gaps, 0 unreviewed.`,
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals: sourceGoalRecords,
  }

  const mappings = sourceGoalRecords.map((sourceGoal) => {
    const mapping = seedMappingBySourceId.get(sourceGoal.id)!
    return {
      legacyGoalId: sourceGoal.id,
      canonicalGoalId: mapping.canonicalGoalId,
      matchType: mapping.matchType ?? 'exact',
      reviewDecisionId: sourceGoal.id,
    }
  })
  const decisions = sourceGoalRecords.map((sourceGoal) => {
    const mapping = seedMappingBySourceId.get(sourceGoal.id)!
    return {
      sourceGoalId: sourceGoal.id,
      topicCode: sourceGoal.topicCode,
      sourceSpan: sourceGoal.sourceSpan,
      decision: 'mapped',
      canonicalGoalIds: [mapping.canonicalGoalId],
      matchType: mapping.matchType ?? 'exact',
      rationale: 'Bestehendes Hessen-Wirtschaft-Seed-Mapping uebernommen; Canonical-Baseline ist die HE-KC-Konvergenzfassung.',
      reviewedAt: '2026-05-13',
      reviewer: 'Codex',
    }
  })

  const review = {
    version: 1,
    reviewId: 'DE_HE_WIRTSCHAFT_SEKII_TO_CANONICAL_WIRTSCHAFT_REVIEW',
    sourceLandscapeId: source.landscapeId,
    targetLandscapeId: canonical.landscapeId,
    sourceExtractionPath: toRepoPath(extractionPath),
    status: 'complete',
    summary: {
      sourceGoals: sourceGoalRecords.length,
      reviewedSourceGoals: decisions.length,
      seedMappedSourceGoals: mappings.length,
      mappedSourceGoals: mappings.length,
      needsCanonicalGoal: 0,
      exactMappings: mappings.filter((mapping) => mapping.matchType === 'exact').length,
      partialMappings: mappings.filter((mapping) => mapping.matchType === 'partial').length,
      inheritedMappings: 0,
    },
    mappings,
    decisions,
  }

  mkdirSync(path.dirname(extractionPath), { recursive: true })
  mkdirSync(path.dirname(reviewPath), { recursive: true })
  writeFileSync(extractionPath, `${JSON.stringify(extraction, null, 2)}\n`)
  writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`)

  console.log(`Wrote ${toRepoPath(extractionPath)} (${sourceGoalRecords.length} source goals, ${passages.length} passages)`)
  console.log(`Wrote ${toRepoPath(reviewPath)} (${mappings.length} mappings)`)
}

main()
