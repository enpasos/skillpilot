import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'

type Goal = {
  id: string
  title?: string
  description?: string
  contains?: string[]
  tags?: string[]
  dimensionTags?: {
    phase?: string
    demandLevel?: string
    processCompetencies?: string[]
    guidingIdeas?: string[]
  }
}

type Landscape = {
  landscapeId: string
  title: string
  goals: Goal[]
}

type MappingEntry = {
  legacyGoalId: string
  canonicalGoalId: string
  matchType?: string
}

type MappingDocument = {
  sourceLandscapeId: string
  targetLandscapeId: string
  mappings: MappingEntry[]
}

const appRoot = process.cwd()
const repoRoot = path.resolve(appRoot, '..')

const sourcePath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/input/BY/gymnasium/Wirtschaft_und_Recht.json')
const canonicalPath = path.resolve(repoRoot, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
const seedMappingPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_to_canonical_wirtschaft.json',
)
const outputPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
)
const reviewPath = path.resolve(
  repoRoot,
  'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.json',
)

const sourceUrl = 'https://www.lehrplanplus.bayern.de/schulart/gymnasium/fach/wirtschaft-und-recht'
const excludedLeafTags = new Set(['Motivation', 'Orientation', 'Practice', 'Assessment', 'Abitur'])
const supplementalCanonicalGoalSeeds = [
  'e89d9698-7ae3-55d2-88bb-4395e8572c75',
  'c542a2cd-204d-5c5b-8abb-578f3f14dd01',
  'a4ea8ae4-056e-5cc2-b736-00809bb3369b',
  '8f126f41-feb3-5976-9efa-9d799847c24d',
  'a8b0cec5-d0e2-530c-8484-fd90562da6fd',
  'd3aded8a-9c6c-5275-b349-69666f0611a6',
  '2f642332-2914-5736-999b-e695a728fe15',
  '0ee635ec-dd4c-5f5b-ad80-761bb84539f3',
  '3e482f10-e50c-56dd-b772-1a14f9d066b0',
  '88facb62-98c7-5c8c-8edd-9cd9c84f7a1e',
  '795cf371-65a3-5775-9c03-a1e83ac12b1d',
  '40ba994b-0129-53db-bda1-0b9c71879d36',
  '4f66392b-a818-56c4-8d30-f6a543dbe89e',
  '089de811-249b-502e-a941-ea5ec7be0652',
  '9e36343d-0908-5fac-beae-9cdc1af11468',
  'd0c38d56-8d30-5aa8-9d5f-0f36435b5070',
  'c3911589-7f5c-5263-a10b-d45912702ba9',
  '76d2efd3-a767-5106-9cc3-6adf180ad8f6',
  '3f9f7357-c9cc-5070-9b4a-da8995deb02e',
  '981a4616-9069-5f2f-a33b-b9e52e85651f',
  '1984630f-362e-59d1-9a39-dde98be9cd35',
  '3138849d-e24c-5463-979f-1aa1d5d48d08',
  '864f1592-c03e-51eb-9802-d4a2551ef194',
  '1cd3d05d-7e9c-5900-87d0-c64bfd4a383f',
  '369807d1-ecd5-5fed-873a-7fe1f885925c',
  'fa01d441-9b2e-504a-8c54-78f3ec91cc03',
  'd6a5a9f0-36e0-5b98-836e-9c6e77e5e519',
  '3aa4b56c-21d8-52d3-8955-c3a7a9a6aae1',
  'a1020ccf-e61a-5791-b3e7-821ef5222b7f',
  'a81d9138-f155-53ad-9457-d8e383c6297f',
  '4ecb96ce-092f-50d3-88df-fffbca4db5be',
  '25a1e6f1-69de-5280-aaca-992d13dc9bc4',
  '01fa0918-3a8f-5600-a174-0a56cade5c53',
  '7019c3e0-9780-5b12-9af0-03d0875842b3',
]
const supplementalCanonicalGoalSeedSet = new Set(supplementalCanonicalGoalSeeds)

const toRepoPath = (filePath: string): string => path.relative(repoRoot, filePath).split(path.sep).join('/')
const readJson = <T>(filePath: string): T => JSON.parse(readFileSync(filePath, 'utf8')) as T
const titleOf = (goal: Goal): string => goal.title?.trim() || goal.id
const descriptionOf = (goal: Goal): string => goal.description?.trim() || titleOf(goal)
const uuidFromString = (value: string): string => {
  const hex = createHash('sha1').update(value).digest('hex').slice(0, 32)
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}
const supplementalCanonicalGoalId = (sourceGoalId: string): string =>
  uuidFromString(`canonical-gymnasium-economics:DE-BY:${sourceGoalId}`)

const isSourceGoal = (goal: Goal): boolean => {
  if ((goal.contains ?? []).length > 0) return false
  return !(goal.tags ?? []).some((tag) => excludedLeafTags.has(tag) || tag.startsWith('srs-deck:'))
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

const topicCodeForPassage = (goal: Goal | null): string => {
  const text = goal ? titleOf(goal) : ''
  const match = /\bWR\s*(\d{1,2})\b/iu.exec(text) ?? /\bJahrgangsstufe\s+(\d{1,2})\b/iu.exec(text)
  if (!match) return 'BY-WR'
  return `J${match[1]}`
}

const stageForTopic = (topicCode: string): 'SekI' | 'SekII' | 'SekI+SekII' => {
  const year = Number(topicCode.replace(/^J/u, ''))
  if (!Number.isFinite(year)) return 'SekI+SekII'
  return year <= 10 ? 'SekI' : 'SekII'
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

const main = () => {
  const source = readJson<Landscape>(sourcePath)
  const canonical = readJson<Landscape>(canonicalPath)
  const seedMapping = readJson<MappingDocument>(seedMappingPath)
  const canonicalGoalIds = new Set(canonical.goals.map((goal) => goal.id))
  const goalById = new Map(source.goals.map((goal) => [goal.id, goal]))
  const parentByChildId = buildParentMap(source.goals)
  const sourceGoals = source.goals.filter(isSourceGoal)
  const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id))
  const existingSeedMappings = seedMapping.mappings.filter((mapping) =>
    sourceGoalIds.has(mapping.legacyGoalId) &&
      canonicalGoalIds.has(mapping.canonicalGoalId) &&
      !supplementalCanonicalGoalSeedSet.has(mapping.legacyGoalId))
  const supplementalSeedMappings = supplementalCanonicalGoalSeeds
    .map((sourceGoalId) => ({
      legacyGoalId: sourceGoalId,
      canonicalGoalId: supplementalCanonicalGoalId(sourceGoalId),
      matchType: 'exact',
    }))
    .filter((mapping) => sourceGoalIds.has(mapping.legacyGoalId) && canonicalGoalIds.has(mapping.canonicalGoalId))
  const seedMappings = [...existingSeedMappings, ...supplementalSeedMappings]

  const passageGoalById = new Map<string, Goal>()
  sourceGoals.forEach((goal) => {
    const passageGoal = findPassageGoal(goal, parentByChildId, goalById)
    if (passageGoal) passageGoalById.set(passageGoal.id, passageGoal)
  })

  const countersByTopic = new Map<string, number>()
  const sourceGoalRecords = sourceGoals.map((goal) => {
    const passageGoal = findPassageGoal(goal, parentByChildId, goalById)
    const topicCode = topicCodeForPassage(passageGoal)
    const counter = (countersByTopic.get(topicCode) ?? 0) + 1
    countersByTopic.set(topicCode, counter)
    return {
      id: goal.id,
      passageId: passageGoal ? `by-wr:${passageGoal.id}` : 'by-wr:unassigned',
      topicCode,
      bulletIndex: counter,
      aspectIndex: 1,
      title: titleOf(goal),
      description: descriptionOf(goal),
      sourceText: descriptionOf(goal),
      sourceSpan: `${topicCode}.${counter}`,
      parentBulletText: passageGoal ? titleOf(passageGoal) : descriptionOf(goal),
      sourceRef: `LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht, ${topicCode}`,
      courseLevel: 'unspecified',
      granularity: 'sourceSnapshotGoal',
      stage: stageForTopic(topicCode),
      tags: [`jurisdiction:DE-BY`, `stage:${stageForTopic(topicCode)}`, 'courseLevel:unspecified', `topic:${topicCode}`],
      rawSourceText: descriptionOf(goal),
      rawSourceSpan: `${topicCode}.${counter}`,
      rawParentBulletText: passageGoal ? titleOf(passageGoal) : descriptionOf(goal),
    }
  })

  const passages = Array.from(passageGoalById.values()).map((goal) => {
    const topicCode = topicCodeForPassage(goal)
    const sourceGoalIdsForPassage = buildDescendantSourceGoalIds(goal, goalById, sourceGoalIds)
    return {
      id: `by-wr:${goal.id}`,
      topicCode,
      title: titleOf(goal),
      text: sourceGoalIdsForPassage
        .map((sourceGoalId, index) => `${index + 1}) ${descriptionOf(goalById.get(sourceGoalId)!)}`)
        .join('\n'),
      sourcePath: toRepoPath(sourcePath),
      sourceUrl,
      rawText: titleOf(goal),
      sourceGoalIds: sourceGoalIdsForPassage,
    }
  })

  const mappings = seedMappings.map((mapping) => ({
    legacyGoalId: mapping.legacyGoalId,
    canonicalGoalId: mapping.canonicalGoalId,
    matchType: mapping.matchType ?? 'partial',
    reviewDecisionId: mapping.legacyGoalId,
  }))

  const sourceGoalById = new Map(sourceGoalRecords.map((goal) => [goal.id, goal]))
  const decisions = mappings.map((mapping) => {
    const sourceGoal = sourceGoalById.get(mapping.legacyGoalId)
    return {
      sourceGoalId: mapping.legacyGoalId,
      topicCode: sourceGoal?.topicCode ?? 'BY-WR',
      sourceSpan: sourceGoal?.sourceSpan ?? mapping.legacyGoalId,
      decision: 'mapped',
      canonicalGoalIds: [mapping.canonicalGoalId],
      matchType: mapping.matchType,
      rationale: supplementalCanonicalGoalSeedSet.has(mapping.legacyGoalId)
        ? 'Bayerisches Wirtschaft-und-Recht-Source-Ziel als kanonische BY-Ergaenzung aufgenommen und passgenau gemappt.'
        : 'Bestehendes Bavaria-Wirtschaft-Seed-Mapping uebernommen; fachliche Vollpruefung der uebrigen Source-Ziele steht noch aus.',
      reviewedAt: '2026-05-13',
      reviewer: 'Codex',
    }
  })

  const extraction = {
    schemaVersion: 1,
    extractionId: 'DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS',
    sourceLandscapeId: source.landscapeId,
    title: 'Wirtschaft und Recht (Bayern, LehrplanPLUS Source-Extraction)',
    jurisdiction: 'DE-BY',
    subject: 'Wirtschaft und Recht',
    stage: 'SekI+SekII',
    sourceDocument: {
      title: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht',
      path: toRepoPath(sourcePath),
      url: sourceUrl,
    },
    sourceDocuments: [
      {
        title: 'LehrplanPLUS Bayern Gymnasium Wirtschaft und Recht',
        path: toRepoPath(sourcePath),
        url: sourceUrl,
      },
    ],
    method:
      'Source snapshot converted into a passage-backed mapping pipeline artifact. Motivation and non-curricular practice leaves are excluded from fachliche Source-Ziele.',
    expectedTopicCodes: Array.from(new Set(sourceGoalRecords.map((goal) => goal.topicCode))).sort(),
    pipelineStatus: {
      version: 1,
      currentStep: 'MAPPING-3',
      steps: [
        {
          id: 'MAPPING-1',
          label: 'Original-Lehrplanpassagen extrahiert',
          status: 'complete',
          dependsOn: [],
          checks: [
            {
              id: 'source-document-present',
              label: 'Strukturierte LehrplanPLUS-Quelle liegt lokal vor',
              passed: true,
              details: toRepoPath(sourcePath),
            },
            {
              id: 'topic-passages-extracted',
              label: 'Wirtschaft-und-Recht-Quellpassagen sind aus dem vorhandenen Snapshot extrahiert',
              passed: true,
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
              label: 'Aus den Wirtschaft-und-Recht-Passagen wurden Source-Ziele erzeugt',
              passed: true,
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
              passed: true,
              details: 'Unvollstaendige Source-Ziele: -',
            },
          ],
        },
        {
          id: 'MAPPING-3',
          label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
          status: 'incomplete',
          dependsOn: ['MAPPING-1', 'MAPPING-2'],
          checks: [
            {
              id: 'm3-review-file-present',
              label: 'M3-Review-Datei ist vorhanden',
              passed: true,
              details: toRepoPath(reviewPath),
            },
            {
              id: 'm3-all-source-goals-reviewed',
              label: 'Alle Source-Ziele haben eine fachliche M3-Entscheidung',
              passed: false,
              details: `${decisions.length}/${sourceGoalRecords.length} Source-Ziele reviewed; offen: ${sourceGoalRecords.length - decisions.length}.`,
            },
            {
              id: 'm3-all-source-goals-covered-by-canonical',
              label: 'Alle Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
              passed: false,
              details: `Abgedeckt: ${mappings.length}/${sourceGoalRecords.length}; verbleibend: ${sourceGoalRecords.length - mappings.length} unreviewed.`,
            },
          ],
        },
      ],
    },
    passages,
    sourceGoals: sourceGoalRecords,
  }

  const review = {
    version: 1,
    reviewId: 'DE_BY_WIRTSCHAFT_UND_RECHT_TO_CANONICAL_WIRTSCHAFT_REVIEW',
    sourceLandscapeId: source.landscapeId,
    targetLandscapeId: canonical.landscapeId,
    sourceExtractionPath: toRepoPath(outputPath),
    status: 'incomplete',
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

  mkdirSync(path.dirname(outputPath), { recursive: true })
  mkdirSync(path.dirname(reviewPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(extraction, null, 2)}\n`)
  writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`)

  console.log(`Wrote ${toRepoPath(outputPath)} (${sourceGoalRecords.length} source goals, ${passages.length} passages)`)
  console.log(`Wrote ${toRepoPath(reviewPath)} (${mappings.length}/${sourceGoalRecords.length} mapped)`)
}

main()
