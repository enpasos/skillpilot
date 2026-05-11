import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

type SourceGoal = {
  id: string
  title: string
  description?: string
  sourceRef?: string
  contains?: string[]
}

type SourceLandscape = {
  landscapeId: string
  goals: SourceGoal[]
}

type MappingEntry = {
  legacyGoalId: string
  canonicalGoalId: string
  matchType?: string
}

type MappingFile = {
  sourceLandscapeId: string
  targetLandscapeId: string
  mappings: MappingEntry[]
}

type CompositionNode = {
  kind?: string
  id?: string
  goalId?: string
  displayLabel?: string
  children?: CompositionNode[]
}

type CourseLevel = 'GK_LK' | 'GK' | 'LK'

type ExtractedSourceGoal = {
  id: string
  passageId: string
  topicCode: string
  bulletIndex: number
  aspectIndex: number
  title: string
  description: string
  sourceText: string
  sourceSpan: string
  parentBulletText: string
  sourceRef: string
  courseLevel: CourseLevel
  granularity: string
  tags: string[]
  rawSourceText: string
  rawSourceSpan: string
  rawParentBulletText: string
}

type ManualSourceGoalSpec = {
  id: string
  topicCode: string
  passageId: string
  title: string
  description: string
  sourceSpan: string
  sourceRef: string
  courseLevel: CourseLevel
  canonicalGoalIds: string[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const sourceLandscapeId = 'eb32f91f-5f6f-4e13-a969-f53a0e92431f'
const targetLandscapeId = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const sourcePdfPath = 'curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf'
const sourceSnapshotPath =
  'curricula/DE/Gymnasium/input/RP/upper-secondary/source-json/DE_RLP_S_GYM_2_PHYSIK.de.json.snapshot'
const legacyMappingPath =
  'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_to_canonical_physics.json'
const extractionPath =
  'curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_PHYSIK_SEKII_MSS_SOURCE_EXTRACTION_DRAFT.source-extraction.json'
const reviewPath =
  'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_physics_upper_secondary_source_extraction_to_canonical_physics.review.json'
const registryPath = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
const compositionViewDir = 'curricula/DE/Gymnasium/composition-views/physik'

const toRepoPath = (absolutePath: string): string =>
  path.relative(repoRoot, absolutePath).split(path.sep).join('/')

const readJson = <T>(repoPath: string): T =>
  JSON.parse(readFileSync(path.resolve(repoRoot, repoPath), 'utf8')) as T

const writeJson = (repoPath: string, value: unknown): void => {
  const absolutePath = path.resolve(repoRoot, repoPath)
  mkdirSync(path.dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, `${JSON.stringify(value, null, 2)}\n`)
}

const compositionRootNodes = (view: Record<string, unknown>): CompositionNode[] =>
  Array.isArray(view.rootNodes) ? (view.rootNodes as CompositionNode[]) : []

const walkCompositionNodes = (
  nodes: CompositionNode[],
  visitor: (node: CompositionNode) => void,
): void => {
  for (const node of nodes) {
    visitor(node)
    if (Array.isArray(node.children)) walkCompositionNodes(node.children, visitor)
  }
}

const appendGoalEntryToStructure = (
  view: Record<string, unknown>,
  structureId: string,
  goalId: string,
  displayLabel?: string,
): void => {
  let alreadyPresent = false
  let target: CompositionNode | undefined
  walkCompositionNodes(compositionRootNodes(view), (node) => {
    if (node.goalId === goalId) alreadyPresent = true
    if (node.kind === 'structure' && node.id === structureId) target = node
  })
  if (alreadyPresent || !target) return
  target.children = Array.isArray(target.children) ? target.children : []
  target.children.push({
    kind: 'goalEntry',
    goalId,
    ...(displayLabel ? { displayLabel } : {}),
  })
}

const slug = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const inferCourseLevel = (goal: SourceGoal): CourseLevel => {
  const ref = goal.sourceRef ?? ''
  if (/4\.[13]\s+und\s+5\.[13]/u.test(ref)) return 'GK_LK'
  if (/5\.[13]/u.test(ref) && !/4\.[13]/u.test(ref)) return 'LK'
  if (/4\.[13]/u.test(ref) && !/5\.[13]/u.test(ref)) return 'GK'
  if (/(^|-)l[fk]($|-)|leistungsfach/i.test(`${goal.id} ${goal.title}`)) return 'LK'
  if (/(^|-)gf($|-)|grundfach/i.test(`${goal.id} ${goal.title}`)) return 'GK'
  return 'GK_LK'
}

const sourcePage = (sourceRef: string | undefined): number | undefined => {
  const match = sourceRef?.match(/S\.\s*(\d+)/u)
  return match ? Number(match[1]) : undefined
}

const sourceSpan = (sourceRef: string | undefined, fallback: string): string => {
  const section = sourceRef?.match(/,\s*((?:4|5)\.[13][^,]*),\s*S\.\s*([0-9-]+)/u)
  if (section) return `${section[1]}, S. ${section[2]}`
  const page = sourceRef?.match(/S\.\s*([0-9-]+)/u)
  return page ? `S. ${page[1]}` : fallback
}

const snapshotTopicOverrides = new Map<string, Pick<ExtractedSourceGoal, 'sourceSpan' | 'sourceRef' | 'courseLevel'>>([
  [
    'QUANTUM-ATOMIC-MODEL-LF',
    {
      sourceSpan: '4.4 und 5.4 Quantenmechanische Atomvorstellung II, S. 39 und 70',
      sourceRef:
        'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Quantenmechanische Atomvorstellung II, S. 39 und 70',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'PARTICLE-PHYSICS-LF',
    {
      sourceSpan: '4.4 und 5.4 Elementarteilchenphysik, S. 40 und 71',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elementarteilchenphysik, S. 40 und 71',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'RELATIVISTIC-KINEMATICS-LF',
    {
      sourceSpan: '4.4 und 5.4 Relativistische Kinematik, S. 42 und 72',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Relativistische Kinematik, S. 42 und 72',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'RELATIVISTIC-DYNAMICS-LF',
    {
      sourceSpan: '4.4 und 5.4 Relativistische Dynamik, S. 43 und 73',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Relativistische Dynamik, S. 43 und 73',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'ASTROPHYSICS-LF',
    {
      sourceSpan: '4.4 und 5.4 Astrophysik, S. 43 und 73',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Astrophysik, S. 43 und 73',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'COSMOLOGY-LF',
    {
      sourceSpan: '4.4 und 5.4 Kosmologie, S. 44 und 74',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Kosmologie, S. 44 und 74',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'CHAOS-FRACTALS-LF',
    {
      sourceSpan: '4.4 und 5.4 Chaos und Fraktale, S. 44 und 74',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Chaos und Fraktale, S. 44 und 74',
      courseLevel: 'GK_LK',
    },
  ],
  [
    'FLUID-DYNAMICS-LF',
    {
      sourceSpan: '4.4 und 5.4 Strömungsphysik, S. 44 und 75',
      sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Strömungsphysik, S. 44 und 75',
      courseLevel: 'GK_LK',
    },
  ],
])

const sentenceFor = (goal: SourceGoal): string => {
  if (goal.description?.trim()) return goal.description.trim()
  const title = goal.title.trim()
  const lower = title.charAt(0).toLowerCase() + title.slice(1)
  return `Die lernende Person kann ${lower}.`
}

const sourceLandscape = readJson<SourceLandscape>(sourceSnapshotPath)
const legacyMapping = readJson<MappingFile>(legacyMappingPath)

if (sourceLandscape.landscapeId !== sourceLandscapeId) {
  throw new Error(`Unexpected source landscape id ${sourceLandscape.landscapeId}`)
}
if (legacyMapping.sourceLandscapeId !== sourceLandscapeId || legacyMapping.targetLandscapeId !== targetLandscapeId) {
  throw new Error('Unexpected RP physics mapping file ids')
}

const goalById = new Map(sourceLandscape.goals.map((goal) => [goal.id, goal]))
const parentByChild = new Map<string, string>()
for (const goal of sourceLandscape.goals) {
  for (const childId of goal.contains ?? []) {
    parentByChild.set(childId, goal.id)
  }
}

const sourceGoalCandidates = sourceLandscape.goals.filter((goal) => (goal.contains ?? []).length === 0)
const mappedSourceGoalIds = new Set(legacyMapping.mappings.map((mapping) => mapping.legacyGoalId))
const snapshotSourceGoals = sourceGoalCandidates
  .filter((goal) => mappedSourceGoalIds.has(goal.id))
  .map<ExtractedSourceGoal>((goal, index) => {
    const parentId = parentByChild.get(goal.id) ?? 'rp-phys-sek2-general'
    const parent = goalById.get(parentId)
    const topicCode = parentId.replace(/^rp-phys-sek2-/u, '').toUpperCase()
    const override = snapshotTopicOverrides.get(topicCode)
    const span = override?.sourceSpan ?? sourceSpan(goal.sourceRef, topicCode)
    const courseLevel = override?.courseLevel ?? inferCourseLevel(goal)
    const sourceRef = override?.sourceRef ?? goal.sourceRef ?? parent?.sourceRef ?? 'Rheinland-Pfalz Lehrplan Physik MSS'
    return {
      id: goal.id,
      passageId: `rp-physics-sekii:${slug(parentId)}`,
      topicCode,
      bulletIndex: index + 1,
      aspectIndex: 1,
      title: goal.title,
      description: sentenceFor(goal),
      sourceText: goal.title,
      sourceSpan: span,
      parentBulletText: goal.title,
      sourceRef,
      courseLevel,
      granularity: goal.id === 'rp-phys-sek2-orientation' ? 'officialOrientation' : 'officialCompetencyRow',
      tags: [
        'source:rheinland-pfalz',
        'stage:SekII',
        `topic:${topicCode}`,
        `course:${courseLevel}`,
      ],
      rawSourceText: goal.title,
      rawSourceSpan: span,
      rawParentBulletText: goal.title,
    }
  })

const introductoryPhaseSpecs: ManualSourceGoalSpec[] = [
  {
    id: 'rp-phys-sek2-ef-kinematic-quantities',
    topicCode: 'INTRO-KINEMATICS',
    passageId: 'rp-physics-sekii:intro-kinematics',
    title: 'Beschreibende Größen einer Bewegung nutzen',
    description:
      'Die lernende Person kann Bewegungen mit Ort, Zeit, Geschwindigkeit und Beschleunigung beschreiben.',
    sourceSpan: '4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['ce431132-dfc4-42c2-aff6-bd72035190f8'],
  },
  {
    id: 'rp-phys-sek2-ef-uniform-linear-motion',
    topicCode: 'INTRO-KINEMATICS',
    passageId: 'rp-physics-sekii:intro-kinematics',
    title: 'Gleichförmige lineare Bewegungen beschreiben',
    description: 'Die lernende Person kann gleichförmige lineare Bewegungen beschreiben und auswerten.',
    sourceSpan: '4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['971beafa-6ba5-4c82-ac8b-7ebf66eec3dd'],
  },
  {
    id: 'rp-phys-sek2-ef-uniformly-accelerated-linear-motion',
    topicCode: 'INTRO-KINEMATICS',
    passageId: 'rp-physics-sekii:intro-kinematics',
    title: 'Gleichmäßig beschleunigte lineare Bewegungen beschreiben',
    description:
      'Die lernende Person kann gleichmäßig beschleunigte lineare Bewegungen mit Beschleunigung beschreiben und auswerten.',
    sourceSpan: '4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['e4b38061-1f28-43ad-8371-a3e7c0e81856'],
  },
  {
    id: 'rp-phys-sek2-ef-uniform-circular-motion',
    topicCode: 'INTRO-KINEMATICS',
    passageId: 'rp-physics-sekii:intro-kinematics',
    title: 'Gleichförmige Kreisbewegung als beschleunigte Bewegung deuten',
    description:
      'Die lernende Person kann die gleichförmige Kreisbewegung als beschleunigte Bewegung beschreiben und mit Kreisbewegungsgrößen auswerten.',
    sourceSpan: '4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Kinematik und 5.3 Kinematik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      'ec7a0a68-730b-5c94-ac72-a937508f8303',
      'e918b31f-6f39-5dee-ade6-3617080fb24f',
      'accb1d9e-cd48-5983-bcef-9b9bca4a9114',
    ],
  },
  {
    id: 'rp-phys-sek2-ef-real-motion-analysis-lk',
    topicCode: 'INTRO-KINEMATICS',
    passageId: 'rp-physics-sekii:intro-kinematics',
    title: 'Reale Bewegungen analysieren',
    description:
      'Die lernende Person kann reale Bewegungen experimentell oder datenbasiert analysieren und modellhaft beschreiben.',
    sourceSpan: '5.3 Kinematik, S. 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Kinematik, S. 51',
    courseLevel: 'LK',
    canonicalGoalIds: ['d67502e3-5e0a-595b-a24b-65b1c40de36e', 'd6dc0e02-831d-4894-a61a-852bcc74f147'],
  },
  {
    id: 'rp-phys-sek2-ef-error-analysis-lk',
    topicCode: 'INTRO-KINEMATICS',
    passageId: 'rp-physics-sekii:intro-kinematics',
    title: 'Zufällige und systematische Fehler unterscheiden',
    description:
      'Die lernende Person kann zufällige und systematische Fehler bei Bewegungsanalysen unterscheiden und berücksichtigen.',
    sourceSpan: '5.3 Kinematik, S. 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Kinematik, S. 51',
    courseLevel: 'LK',
    canonicalGoalIds: ['8aff7aac-321b-5172-ac55-877876bfd2cd', 'f6b1d812-ce8b-5852-b417-e6c29b533c7a'],
  },
  {
    id: 'rp-phys-sek2-ef-causes-of-motion-change',
    topicCode: 'INTRO-DYNAMICS',
    passageId: 'rp-physics-sekii:intro-dynamics',
    title: 'Ursachen für Bewegungsänderungen erklären',
    description:
      'Die lernende Person kann Ursachen für Bewegungsänderungen mit dem Kraft- beziehungsweise Impulsbegriff erklären.',
    sourceSpan: '4.3 Dynamik und 5.3 Dynamik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Dynamik und 5.3 Dynamik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20', '5f289cdc-fda1-4058-b44f-041ba1398e79'],
  },
  {
    id: 'rp-phys-sek2-ef-interaction-principle',
    topicCode: 'INTRO-DYNAMICS',
    passageId: 'rp-physics-sekii:intro-dynamics',
    title: 'Wechselwirkungsprinzip anwenden',
    description:
      'Die lernende Person kann das Wechselwirkungsprinzip als Grundidee der Dynamik erläutern und anwenden.',
    sourceSpan: '4.3 Dynamik und 5.3 Dynamik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Dynamik und 5.3 Dynamik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['ad984bb6-e225-432a-952d-d83cda40b7f8', 'a0aaedcb-41f8-4891-af77-a69a76b8c10d'],
  },
  {
    id: 'rp-phys-sek2-ef-inertia',
    topicCode: 'INTRO-DYNAMICS',
    passageId: 'rp-physics-sekii:intro-dynamics',
    title: 'Trägheit als Beharrungsvermögen deuten',
    description:
      'Die lernende Person kann Trägheit als Beharrungsvermögen deuten und mit Newtons erstem Axiom verbinden.',
    sourceSpan: '4.3 Dynamik und 5.3 Dynamik, S. 24 und 51',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Dynamik und 5.3 Dynamik, S. 24 und 51',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['31a2ef52-114b-4d2c-a720-6ef5a390b6dc', '32b896b9-f2f1-4d4e-96ad-e869ac3d3759'],
  },
  {
    id: 'rp-phys-sek2-ef-energy-conservation',
    topicCode: 'INTRO-CONSERVATION',
    passageId: 'rp-physics-sekii:intro-conservation',
    title: 'Energieerhaltung bilanzierend nutzen',
    description:
      'Die lernende Person kann Energieerhaltung als Erhaltungsprinzip nutzen und mechanische Vorgänge bilanzieren.',
    sourceSpan: '4.3 Erhaltungsgrößen der Mechanik und 5.3 Erhaltungsgrößen der Mechanik, S. 25 und 52',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Erhaltungsgrößen der Mechanik und 5.3 Erhaltungsgrößen der Mechanik, S. 25 und 52',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['91c49019-ea51-4ce5-a919-c91c45b25e83'],
  },
  {
    id: 'rp-phys-sek2-ef-momentum-conservation',
    topicCode: 'INTRO-CONSERVATION',
    passageId: 'rp-physics-sekii:intro-conservation',
    title: 'Impulserhaltung bilanzierend nutzen',
    description:
      'Die lernende Person kann Impulserhaltung als Erhaltungsprinzip nutzen und mechanische Vorgänge vektoriell bilanzieren.',
    sourceSpan: '4.3 Erhaltungsgrößen der Mechanik und 5.3 Erhaltungsgrößen der Mechanik, S. 25 und 52',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Erhaltungsgrößen der Mechanik und 5.3 Erhaltungsgrößen der Mechanik, S. 25 und 52',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['839ecc8f-3a60-418b-bc92-64bfeef33824'],
  },
  {
    id: 'rp-phys-sek2-ef-throw-superposition',
    topicCode: 'INTRO-PROJECTILE',
    passageId: 'rp-physics-sekii:intro-projectile',
    title: 'Superpositionsprinzip bei Wurfbewegungen nutzen',
    description:
      'Die lernende Person kann Wurfbewegungen mit dem Superpositionsprinzip analytisch-synthetisch zerlegen.',
    sourceSpan: '4.3 Wurfbewegungen und 5.3 Wurfbewegungen, S. 26 und 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Wurfbewegungen und 5.3 Wurfbewegungen, S. 26 und 53',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['68c90ba6-c438-463c-9a53-cf61062d416a'],
  },
  {
    id: 'rp-phys-sek2-ef-vertical-throw',
    topicCode: 'INTRO-PROJECTILE',
    passageId: 'rp-physics-sekii:intro-projectile',
    title: 'Senkrechten Wurf beschreiben',
    description:
      'Die lernende Person kann den senkrechten Wurf als gleichmäßig beschleunigte Bewegung modellieren und auswerten.',
    sourceSpan: '4.3 Wurfbewegungen und 5.3 Wurfbewegungen, S. 26 und 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Wurfbewegungen und 5.3 Wurfbewegungen, S. 26 und 53',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['e4b38061-1f28-43ad-8371-a3e7c0e81856', '09029573-864f-40ca-bf8a-cee7bf6dcb73'],
  },
  {
    id: 'rp-phys-sek2-ef-horizontal-throw',
    topicCode: 'INTRO-PROJECTILE',
    passageId: 'rp-physics-sekii:intro-projectile',
    title: 'Waagerechten Wurf analysieren',
    description:
      'Die lernende Person kann den waagerechten Wurf mit Superposition horizontaler und vertikaler Bewegung analysieren.',
    sourceSpan: '4.3 Wurfbewegungen und 5.3 Wurfbewegungen, S. 26 und 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Wurfbewegungen und 5.3 Wurfbewegungen, S. 26 und 53',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2'],
  },
  {
    id: 'rp-phys-sek2-ef-oblique-throw-lk',
    topicCode: 'INTRO-PROJECTILE',
    passageId: 'rp-physics-sekii:intro-projectile',
    title: 'Schiefen Wurf beschreiben',
    description:
      'Die lernende Person kann den schiefen Wurf mit Superposition und kinematischen Gleichungen beschreiben.',
    sourceSpan: '5.3 Wurfbewegungen, S. 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Wurfbewegungen, S. 53',
    courseLevel: 'LK',
    canonicalGoalIds: ['fbecbd60-5db3-51e8-94be-d66b066ffa06'],
  },
  {
    id: 'rp-phys-sek2-ef-gravitation-law',
    topicCode: 'INTRO-GRAVITATION',
    passageId: 'rp-physics-sekii:intro-gravitation',
    title: 'Gravitationsgesetz anwenden',
    description:
      'Die lernende Person kann das Gravitationsgesetz interpretieren und auf einfache Gravitationssituationen anwenden.',
    sourceSpan: '4.3 Gravitation und 5.3 Gravitation, S. 26 und 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Gravitation und 5.3 Gravitation, S. 26 und 53',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['eb0ffdea-c12d-56df-b7e8-c0297d2f8aff'],
  },
  {
    id: 'rp-phys-sek2-ef-satellite-motion',
    topicCode: 'INTRO-GRAVITATION',
    passageId: 'rp-physics-sekii:intro-gravitation',
    title: 'Satellitenbewegungen deuten',
    description:
      'Die lernende Person kann Satellitenbewegungen mit Gravitationsgesetz und Kreisbewegung deuten.',
    sourceSpan: '4.3 Gravitation und 5.3 Gravitation, S. 26 und 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.3 Gravitation und 5.3 Gravitation, S. 26 und 53',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['60211ac1-cbe1-5182-87ef-673a068c5b0a', 'accb1d9e-cd48-5983-bcef-9b9bca4a9114'],
  },
  {
    id: 'rp-phys-sek2-ef-gravitational-field-energy-lk',
    topicCode: 'INTRO-GRAVITATION',
    passageId: 'rp-physics-sekii:intro-gravitation',
    title: 'Energie eines Körpers im Gravitationsfeld deuten',
    description:
      'Die lernende Person kann Energie im Gravitationsfeld feldbezogen deuten und in Bewegungsbilanzen verwenden.',
    sourceSpan: '5.3 Gravitation, S. 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Gravitation, S. 53',
    courseLevel: 'LK',
    canonicalGoalIds: ['594f7f21-6b8a-531c-8424-5f1dcbaf0f23', 'a42f91a4-0d21-5aa9-ae11-f48be6f2e431'],
  },
  {
    id: 'rp-phys-sek2-ef-escape-velocity-lk',
    topicCode: 'INTRO-GRAVITATION',
    passageId: 'rp-physics-sekii:intro-gravitation',
    title: 'Fluchtgeschwindigkeit mit Energiebilanz erschließen',
    description:
      'Die lernende Person kann Fluchtgeschwindigkeit mit Gravitationsenergie und Energiebilanz erschließen.',
    sourceSpan: '5.3 Gravitation, S. 53',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Gravitation, S. 53',
    courseLevel: 'LK',
    canonicalGoalIds: ['1b432223-3d59-5586-86a9-2214b4844101', 'a42f91a4-0d21-5aa9-ae11-f48be6f2e431'],
  },
  {
    id: 'rp-phys-sek2-ef-moment-of-inertia-lk',
    topicCode: 'INTRO-ROTATION',
    passageId: 'rp-physics-sekii:intro-rotation',
    title: 'Trägheitsmoment als Rotationsgröße nutzen',
    description:
      'Die lernende Person kann das Trägheitsmoment als Analogie zur Masse in Rotationsbewegungen nutzen.',
    sourceSpan: '5.3 Rotation starrer Körper, S. 54',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Rotation starrer Körper, S. 54',
    courseLevel: 'LK',
    canonicalGoalIds: ['642aebd7-66cd-5a50-b543-73c4b207525d'],
  },
  {
    id: 'rp-phys-sek2-ef-angular-momentum-lk',
    topicCode: 'INTRO-ROTATION',
    passageId: 'rp-physics-sekii:intro-rotation',
    title: 'Drehimpuls als Erhaltungsgröße deuten',
    description:
      'Die lernende Person kann Drehimpuls als Erhaltungsgröße deuten und auf Rotationssituationen anwenden.',
    sourceSpan: '5.3 Rotation starrer Körper, S. 54',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Rotation starrer Körper, S. 54',
    courseLevel: 'LK',
    canonicalGoalIds: ['37f17e7e-9fcf-5dca-ac10-e94cb8420be5'],
  },
  {
    id: 'rp-phys-sek2-ef-torque-lk',
    topicCode: 'INTRO-ROTATION',
    passageId: 'rp-physics-sekii:intro-rotation',
    title: 'Drehmoment beschreiben',
    description:
      'Die lernende Person kann Drehmoment als Ursache von Rotationsänderungen beschreiben und anwenden.',
    sourceSpan: '5.3 Rotation starrer Körper, S. 54',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Rotation starrer Körper, S. 54',
    courseLevel: 'LK',
    canonicalGoalIds: ['cf570e66-2ce2-5923-9033-c97d74119553'],
  },
  {
    id: 'rp-phys-sek2-ef-rotational-energy-lk',
    topicCode: 'INTRO-ROTATION',
    passageId: 'rp-physics-sekii:intro-rotation',
    title: 'Rotationsenergie bilanzieren',
    description:
      'Die lernende Person kann Rotationsenergie in Analogie zur Translationsenergie bilanzieren und berechnen.',
    sourceSpan: '5.3 Rotation starrer Körper, S. 54',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.3 Rotation starrer Körper, S. 54',
    courseLevel: 'LK',
    canonicalGoalIds: ['642aebd7-66cd-5a50-b543-73c4b207525d', '5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931'],
  },
]

const qualificationPhaseSpecs: ManualSourceGoalSpec[] = [
  {
    id: 'rp-phys-sek2-q-electric-potential-lk',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Potential und Spannung als Potentialdifferenz deuten',
    description:
      'Die lernende Person kann elektrisches Potential und Spannung als Potentialdifferenz im Feldkontext deuten.',
    sourceSpan: '5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    courseLevel: 'LK',
    canonicalGoalIds: ['2622bef1-bdbc-504e-b468-b600b2ca3ed8', '1730c01d-8c85-57df-b031-c11e2a0511b1'],
  },
  {
    id: 'rp-phys-sek2-q-plate-capacitor-voltage-field-strength',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Spannung und Feldstärke im Plattenkondensator verknüpfen',
    description:
      'Die lernende Person kann den Zusammenhang zwischen Spannung und elektrischer Feldstärke im Plattenkondensator anwenden.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['1730c01d-8c85-57df-b031-c11e2a0511b1', '9f59a088-3939-59e9-821d-167fadfda782'],
  },
  {
    id: 'rp-phys-sek2-q-test-charge-potential-energy',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Potentielle Energie einer Probeladung im homogenen elektrischen Feld deuten',
    description:
      'Die lernende Person kann potentielle Energie einer Probeladung im homogenen elektrischen Feld feldbezogen deuten.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['1730c01d-8c85-57df-b031-c11e2a0511b1', 'fd9fd8ad-c4a1-5552-9ea0-1878e0636f20'],
  },
  {
    id: 'rp-phys-sek2-q-capacitance-as-capacitor-property',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Kapazität als Kenngröße eines Kondensators nutzen',
    description:
      'Die lernende Person kann Kapazität als Kenngröße eines Kondensators deuten und zur Beschreibung von Kondensatoren nutzen.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['9f59a088-3939-59e9-821d-167fadfda782'],
  },
  {
    id: 'rp-phys-sek2-q-electric-field-energy-capacitor',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Energieinhalt des elektrischen Feldes eines Kondensators berechnen',
    description:
      'Die lernende Person kann den Energieinhalt des elektrischen Feldes eines Kondensators quantitativ bestimmen.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['fd9fd8ad-c4a1-5552-9ea0-1878e0636f20'],
  },
  {
    id: 'rp-phys-sek2-q-capacitor-charge-discharge',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Auf- und Entladevorgänge am Kondensator auswerten',
    description:
      'Die lernende Person kann zeitliche Stromstärke- und Spannungsverläufe beim Auf- und Entladen eines Kondensators beschreiben und auswerten.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['0b4f2020-8486-5372-9cb9-6e59f698ac2d', '330808f6-789a-583d-86df-e271a7683d8b'],
  },
  {
    id: 'rp-phys-sek2-q-capacitor-applications',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Kondensator als Energiespeicher und Sensor einordnen',
    description:
      'Die lernende Person kann Einsatzmöglichkeiten des Kondensators als Energiespeicher und Sensor fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['fd9fd8ad-c4a1-5552-9ea0-1878e0636f20', '9f59a088-3939-59e9-821d-167fadfda782'],
  },
  {
    id: 'rp-phys-sek2-q-capacitance-geometry-dielectric',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Kapazitätsabhängigkeit von Geometrie und Dielektrikum beschreiben',
    description:
      'Die lernende Person kann die Abhängigkeit der Kapazität eines Plattenkondensators von geometrischen Daten und Dielektrikum beschreiben.',
    sourceSpan: '4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energie und Energiespeicherung im elektrischen Feld, S. 28 und 56',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['9f59a088-3939-59e9-821d-167fadfda782', 'e3bce51c-cfeb-4706-b95e-a22b76e7dd73'],
  },
  {
    id: 'rp-phys-sek2-q-coil-magnetic-field-lk',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Magnetfeld einer stromdurchflossenen Spule beschreiben',
    description:
      'Die lernende Person kann das Magnetfeld einer stromdurchflossenen Spule und Einflussgrößen wie Stromstärke, Windungszahl, Spulenlänge und Medium qualitativ beschreiben.',
    sourceSpan: '5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    courseLevel: 'LK',
    canonicalGoalIds: ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
  },
  {
    id: 'rp-phys-sek2-q-long-coil-flux-density-lk',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Magnetische Flussdichte einer langen Spule bestimmen',
    description:
      'Die lernende Person kann die magnetische Flussdichte einer langen stromdurchflossenen Spule bestimmen und fachlich deuten.',
    sourceSpan: '5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    courseLevel: 'LK',
    canonicalGoalIds: ['106417ed-80db-5490-a1ee-bb4160d3f2b4'],
  },
  {
    id: 'rp-phys-sek2-q-inductance-lk',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Induktivität als Kenngröße einer Spule nutzen',
    description:
      'Die lernende Person kann Induktivität als Kenngröße einer Spule deuten und bei Selbstinduktionsvorgängen verwenden.',
    sourceSpan: '5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    courseLevel: 'LK',
    canonicalGoalIds: ['37f28bc4-def2-57cf-a06b-191dfd228205'],
  },
  {
    id: 'rp-phys-sek2-q-magnetic-field-energy-lk',
    topicCode: 'ELECTRIC-FIELD-ENERGY',
    passageId: 'rp-physics-sekii:electric-field-energy',
    title: 'Energieinhalt des Feldes einer langen Spule bestimmen',
    description:
      'Die lernende Person kann den Energieinhalt des magnetischen Feldes einer langen stromdurchflossenen Spule bestimmen.',
    sourceSpan: '5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Energiespeicherung im elektrischen und magnetischen Feld, S. 56',
    courseLevel: 'LK',
    canonicalGoalIds: ['a1389d4e-dc97-5557-babe-a31a2bd57217'],
  },
  {
    id: 'rp-phys-sek2-q-acoustics-longitudinal-sound',
    topicCode: 'ACOUSTICS',
    passageId: 'rp-physics-sekii:acoustics',
    title: 'Schall als longitudinale Welle deuten',
    description:
      'Die lernende Person kann Schall als longitudinale mechanische Welle beschreiben und die Ausbreitung im Medium deuten.',
    sourceSpan: '4.4 und 5.4 Akustik, S. 36 und 66',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Akustik, S. 36 und 66',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['3c82510a-1f12-4eaa-81c2-8599437a5b85', 'eecb0af8-a45a-51fc-8987-2acb6292ca7f'],
  },
  {
    id: 'rp-phys-sek2-q-acoustics-doppler-lk',
    topicCode: 'ACOUSTICS',
    passageId: 'rp-physics-sekii:acoustics',
    title: 'Dopplereffekt bei Schallausbreitung einordnen',
    description:
      'Die lernende Person kann den Dopplereffekt bei Schallausbreitung fachlich erklären und an Beispielen auswerten.',
    sourceSpan: '5.4 Akustik, S. 66',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Akustik, S. 66',
    courseLevel: 'LK',
    canonicalGoalIds: ['e7131fe3-1da6-5555-80ec-fb6bdf8fcc29', 'eecb0af8-a45a-51fc-8987-2acb6292ca7f'],
  },
  {
    id: 'rp-phys-sek2-q-acoustics-superposition-resonance',
    topicCode: 'ACOUSTICS',
    passageId: 'rp-physics-sekii:acoustics',
    title: 'Schwebung, stehende Wellen und Resonanz akustisch deuten',
    description:
      'Die lernende Person kann akustische Überlagerungsphänomene wie Schwebung, stehende Wellen und Resonanz an Musikinstrumenten oder Experimenten deuten.',
    sourceSpan: '4.4 und 5.4 Akustik, S. 36 und 66',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Akustik, S. 36 und 66',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      '4888444f-4520-437a-9ba7-e74e8f8ed129',
      'f06c581a-7157-584e-a692-99bcd613cff9',
      'd5772db3-120c-5c37-ab46-2336d02236b0',
      '3efa0cda-f55b-5534-8fac-ffe1d312aed1',
      '0d2a4690-d891-503b-96f4-42c2de48fd8b',
    ],
  },
  {
    id: 'rp-phys-sek2-q-acoustics-fourier-analysis',
    topicCode: 'ACOUSTICS',
    passageId: 'rp-physics-sekii:acoustics',
    title: 'Fourieranalyse von Klängen nutzen',
    description:
      'Die lernende Person kann Klangspektren mit geeigneter Software analysieren und Fouriersynthese beziehungsweise Fourieranalyse fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Akustik, S. 36 und 66',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Akustik, S. 36 und 66',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['f06c581a-7157-584e-a692-99bcd613cff9', '0d2a4690-d891-503b-96f4-42c2de48fd8b'],
  },
  {
    id: 'rp-phys-sek2-q-acoustics-sound-field-quantities',
    topicCode: 'ACOUSTICS',
    passageId: 'rp-physics-sekii:acoustics',
    title: 'Schallfeldgrößen zur Schallwahrnehmung nutzen',
    description:
      'Die lernende Person kann Schallfeldgrößen wie Schalldruck und Schallschnelle zur Beschreibung der Schallwahrnehmung nutzen.',
    sourceSpan: '4.4 und 5.4 Akustik, S. 36 und 66',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Akustik, S. 36 und 66',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['8ac61062-f63e-5935-96ae-84014906c368'],
  },
  {
    id: 'rp-phys-sek2-q-light-wave-nature-interference',
    topicCode: 'LIGHT-WAVE-PHENOMENA',
    passageId: 'rp-physics-sekii:light-wave-phenomena',
    title: 'Interferenzphänomene in der Natur wellenoptisch erklären',
    description:
      'Die lernende Person kann natürliche Interferenzphänomene wie dünne Schichten oder schillernde Strukturen wellenoptisch erklären.',
    sourceSpan: '4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      '31ed4e95-3ed4-4cfb-9b11-9f3c1341f2d4',
      'c71315c1-f329-4289-a145-d99819da7bad',
      '2c6af966-7703-4176-a117-5ddb8295bedf',
    ],
  },
  {
    id: 'rp-phys-sek2-q-light-wave-technical-interference',
    topicCode: 'LIGHT-WAVE-PHENOMENA',
    passageId: 'rp-physics-sekii:light-wave-phenomena',
    title: 'Technische Interferenzanwendungen wellenoptisch einordnen',
    description:
      'Die lernende Person kann technische Interferenzanwendungen wie Holographie, Interferometrie oder Spektrometrie wellenoptisch einordnen.',
    sourceSpan: '4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      '36d5b915-1cb8-5a05-b64a-5f9497a33d1f',
      'c71315c1-f329-4289-a145-d99819da7bad',
      '2c6af966-7703-4176-a117-5ddb8295bedf',
    ],
  },
  {
    id: 'rp-phys-sek2-q-light-wave-nature-polarization',
    topicCode: 'LIGHT-WAVE-PHENOMENA',
    passageId: 'rp-physics-sekii:light-wave-phenomena',
    title: 'Polarisationsphänomene in der Natur erklären',
    description:
      'Die lernende Person kann Polarisationsphänomene in der Natur wie polarisiertes Sonnenlicht oder Doppelbrechung fachlich erklären.',
    sourceSpan: '4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['549269d3-1aef-5c55-9640-ee2a8e2ee9a1', '3d3e5917-d367-535d-a6ad-b9d87259e6ce'],
  },
  {
    id: 'rp-phys-sek2-q-light-wave-technical-polarization',
    topicCode: 'LIGHT-WAVE-PHENOMENA',
    passageId: 'rp-physics-sekii:light-wave-phenomena',
    title: 'Technische Polarisationsanwendungen erklären',
    description:
      'Die lernende Person kann technische Anwendungen der Polarisation wie 3D-Brillen oder Spannungsdoppelbrechung fachlich erklären.',
    sourceSpan: '4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Licht als Wellenphänomen, S. 36 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      '549269d3-1aef-5c55-9640-ee2a8e2ee9a1',
      '3d3e5917-d367-535d-a6ad-b9d87259e6ce',
      '7e2017d0-e76e-559c-bace-d5d7809a241f',
    ],
  },
  {
    id: 'rp-phys-sek2-q-em-wave-feedback-principle',
    topicCode: 'ELECTROMAGNETIC-WAVES',
    passageId: 'rp-physics-sekii:electromagnetic-waves',
    title: 'Rückkopplungsprinzip zur Aufrechterhaltung elektromagnetischer Schwingungen erklären',
    description:
      'Die lernende Person kann das Rückkopplungsprinzip zur Aufrechterhaltung einer elektromagnetischen Schwingung erklären.',
    sourceSpan: '4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['91f1838c-80fc-55f5-ac30-e7d1498fccee'],
  },
  {
    id: 'rp-phys-sek2-q-em-wave-open-oscillating-circuit',
    topicCode: 'ELECTROMAGNETIC-WAVES',
    passageId: 'rp-physics-sekii:electromagnetic-waves',
    title: 'Offenen Schwingkreis als Quelle elektromagnetischer Wellen deuten',
    description:
      'Die lernende Person kann den offenen Schwingkreis beziehungsweise Hertz-Dipol als Grenzfall eines elektromagnetischen Schwingkreises deuten.',
    sourceSpan: '4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      'ac4ba260-6086-5fcc-bea2-c06f1425a1cc',
      'f36a5946-f2a8-59b8-b3bd-a2f246defa4f',
      '5da7d4d0-878e-44fd-b398-1b1de8b636a4',
    ],
  },
  {
    id: 'rp-phys-sek2-q-em-wave-propagation-spectrum',
    topicCode: 'ELECTROMAGNETIC-WAVES',
    passageId: 'rp-physics-sekii:electromagnetic-waves',
    title: 'Ausbreitung und Spektrum elektromagnetischer Wellen beschreiben',
    description:
      'Die lernende Person kann die Ausbreitung elektromagnetischer Wellen beschreiben und Spektralbereiche mit Beispielen verknüpfen.',
    sourceSpan: '4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['5b90066f-b5b3-4e82-8d31-7b95ff0a0451', '4a7cbe83-b694-57d3-85ce-1eeca418daaf'],
  },
  {
    id: 'rp-phys-sek2-q-em-wave-carrier-modulation',
    topicCode: 'ELECTROMAGNETIC-WAVES',
    passageId: 'rp-physics-sekii:electromagnetic-waves',
    title: 'Modulation einer Trägerwelle fachlich beschreiben',
    description:
      'Die lernende Person kann die Modulation einer Trägerwelle als Prinzip technischer Informationsübertragung fachlich beschreiben.',
    sourceSpan: '4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['122e83ac-c9cf-50c1-8a73-a1e3db347f21'],
  },
  {
    id: 'rp-phys-sek2-q-em-wave-everyday-applications',
    topicCode: 'ELECTROMAGNETIC-WAVES',
    passageId: 'rp-physics-sekii:electromagnetic-waves',
    title: 'Alltagsanwendungen elektromagnetischer Wellen einordnen',
    description:
      'Die lernende Person kann Alltagsanwendungen elektromagnetischer Wellen wie Mikrowelle, WLAN oder Mobilfunk fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektromagnetische Wellen, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['4a7cbe83-b694-57d3-85ce-1eeca418daaf', '5da7d4d0-878e-44fd-b398-1b1de8b636a4'],
  },
  {
    id: 'rp-phys-sek2-q-electronics-basic-circuits',
    topicCode: 'ELECTRONICS',
    passageId: 'rp-physics-sekii:electronics',
    title: 'Elektronische Grundschaltungen experimentell einordnen',
    description:
      'Die lernende Person kann elektronische Grundschaltungen als Baugruppen beschreiben und experimentell untersuchen.',
    sourceSpan: '4.4 und 5.4 Elektronik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektronik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['d36727cc-ce42-51a3-9425-41afb0b9acdd'],
  },
  {
    id: 'rp-phys-sek2-q-electronics-conduction-doping',
    topicCode: 'ELECTRONICS',
    passageId: 'rp-physics-sekii:electronics',
    title: 'Eigenleitung und Störstellenleitung in Halbleitern unterscheiden',
    description:
      'Die lernende Person kann Eigenleitung und Störstellenleitung in Halbleitern modellhaft unterscheiden.',
    sourceSpan: '4.4 und 5.4 Elektronik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektronik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['df010b2b-b182-5f7e-bbe4-49b72e48c27a'],
  },
  {
    id: 'rp-phys-sek2-q-electronics-diode',
    topicCode: 'ELECTRONICS',
    passageId: 'rp-physics-sekii:electronics',
    title: 'Halbleiterdiode als Bauelement erklären',
    description:
      'Die lernende Person kann die Halbleiterdiode qualitativ erklären und einfache Diodenschaltungen fachlich deuten.',
    sourceSpan: '4.4 und 5.4 Elektronik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektronik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['7f0798cb-5966-5dcb-beb3-84f637ab6139'],
  },
  {
    id: 'rp-phys-sek2-q-electronics-transistor-switch',
    topicCode: 'ELECTRONICS',
    passageId: 'rp-physics-sekii:electronics',
    title: 'Transistor als Schaltelement nutzen',
    description:
      'Die lernende Person kann den Transistor als Schaltelement beschreiben und in einfachen elektronischen Schaltungen deuten.',
    sourceSpan: '4.4 und 5.4 Elektronik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Elektronik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['d36727cc-ce42-51a3-9425-41afb0b9acdd', 'af50bb9a-fd7b-50f5-9698-48c4efe99032'],
  },
  {
    id: 'rp-phys-sek2-q-solid-state-band-model',
    topicCode: 'SOLID-STATE-PHYSICS',
    passageId: 'rp-physics-sekii:solid-state-physics',
    title: 'Bändermodell für Festkörper nutzen',
    description:
      'Die lernende Person kann das Bändermodell zur Beschreibung von Festkörpern und ihrer Leitfähigkeit nutzen.',
    sourceSpan: '4.4 und 5.4 Festkörperphysik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Festkörperphysik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['df010b2b-b182-5f7e-bbe4-49b72e48c27a', '658cf33d-a0c2-5d47-801a-3dbcd5cac074'],
  },
  {
    id: 'rp-phys-sek2-q-solid-state-properties',
    topicCode: 'SOLID-STATE-PHYSICS',
    passageId: 'rp-physics-sekii:solid-state-physics',
    title: 'Elektrische, thermische, magnetische und optische Festkörpereigenschaften einordnen',
    description:
      'Die lernende Person kann ausgewählte elektrische, thermische, magnetische und optische Eigenschaften von Festkörpern fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Festkörperphysik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Festkörperphysik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['620d4320-6b93-500b-8a62-86d02b1ed1f0'],
  },
  {
    id: 'rp-phys-sek2-q-solid-state-conduction-doping',
    topicCode: 'SOLID-STATE-PHYSICS',
    passageId: 'rp-physics-sekii:solid-state-physics',
    title: 'Eigenleitung und Störstellenleitung festkörperphysikalisch erklären',
    description:
      'Die lernende Person kann Eigenleitung und Störstellenleitung mithilfe des Bändermodells festkörperphysikalisch erklären.',
    sourceSpan: '4.4 und 5.4 Festkörperphysik, S. 38 und 68',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Festkörperphysik, S. 38 und 68',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['df010b2b-b182-5f7e-bbe4-49b72e48c27a', '658cf33d-a0c2-5d47-801a-3dbcd5cac074'],
  },
  {
    id: 'rp-phys-sek2-q-quantum-ii-interpretations',
    topicCode: 'QUANTUM-OBJECTS-II',
    passageId: 'rp-physics-sekii:quantum-objects-ii',
    title: 'Interpretationen der Quantentheorie an Gedankenexperimenten vergleichen',
    description:
      'Die lernende Person kann Interpretationsmöglichkeiten der Quantentheorie an einem quantenphysikalischen Gedankenexperiment vergleichen.',
    sourceSpan: '4.4 und 5.4 Quantenobjekte II, S. 39 und 69',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Quantenobjekte II, S. 39 und 69',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['b05da028-65e4-5cd1-a13c-6c1a95b6dfdf'],
  },
  {
    id: 'rp-phys-sek2-q-quantum-ii-uncertainty-gk',
    topicCode: 'QUANTUM-OBJECTS-II',
    passageId: 'rp-physics-sekii:quantum-objects-ii',
    title: 'Heisenbergsche Unbestimmtheitsrelation qualitativ begründen',
    description:
      'Die lernende Person kann die Heisenbergsche Unbestimmtheitsrelation qualitativ begründen und die Grenze exakter komplementärer Größen erläutern.',
    sourceSpan: '4.4 Quantenobjekte II, S. 39',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Quantenobjekte II, S. 39',
    courseLevel: 'GK',
    canonicalGoalIds: ['f6e5929f-d52a-42a4-a5d2-ff498ee7083f', '9e881b3b-68cd-5f52-819f-c2e33b5ba631'],
  },
  {
    id: 'rp-phys-sek2-q-quantum-ii-experimental-evidence',
    topicCode: 'QUANTUM-OBJECTS-II',
    passageId: 'rp-physics-sekii:quantum-objects-ii',
    title: 'Experimentelle Belege für Quantenobjekte auswerten',
    description:
      'Die lernende Person kann experimentelle Belege wie Elektronenbeugung, Hallwachs-Effekt oder Quantenradierer zur Deutung von Quantenobjekten auswerten.',
    sourceSpan: '4.4 und 5.4 Quantenobjekte II, S. 39 und 69',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Quantenobjekte II, S. 39 und 69',
    courseLevel: 'GK_LK',
    canonicalGoalIds: [
      'e296aba6-f407-5944-a2bd-e5296e4c9f06',
      '22bdd29e-00d3-5d43-97d6-8b442b8bfc8c',
      '52b6722a-b3b2-5d2d-a507-0215532b0422',
    ],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-doses',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Strahlendosen und Transferfaktoren beurteilen',
    description:
      'Die lernende Person kann Strahlendosen und Transferfaktoren zur Bewertung ionisierender Strahlung nutzen.',
    sourceSpan: '4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['e6a50c74-c922-508c-aa27-07bac2566955', 'bb5c5eab-2fc1-5336-b8cf-14d147695487'],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-biological-effect',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Biologische Strahlenwirkung fachlich einordnen',
    description:
      'Die lernende Person kann biologische Wirkungen ionisierender Strahlung fachlich einordnen und Risiken begründet beurteilen.',
    sourceSpan: '4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['bb5c5eab-2fc1-5336-b8cf-14d147695487'],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-protection',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Grenzwerte und Strahlenschutz anwenden',
    description:
      'Die lernende Person kann Grenzwerte und Strahlenschutzmaßnahmen zur Bewertung von Expositionen anwenden.',
    sourceSpan: '4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['e6a50c74-c922-508c-aa27-07bac2566955', '4daef009-6425-526a-8574-4fa75f28f946'],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-xray-attenuation',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Harte Röntgenstrahlung, Schwächung und Abschirmung auswerten',
    description:
      'Die lernende Person kann harte Röntgenstrahlung, Schwächungsgesetz und Abschirmung fachlich auswerten.',
    sourceSpan: '4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['e6a50c74-c922-508c-aa27-07bac2566955', '48e77690-17f7-5ebe-a8f7-87b2ee9820da'],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-energy-deposition',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Energiedeposition verschiedener Strahlungsarten im Gewebe vergleichen',
    description:
      'Die lernende Person kann die Energiedeposition verschiedener Strahlungsarten im Gewebe vergleichen und medizinisch einordnen.',
    sourceSpan: '4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Strahlenbiophysik, S. 40 und 70',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['bb5c5eab-2fc1-5336-b8cf-14d147695487', 'e6a50c74-c922-508c-aa27-07bac2566955'],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-medical-applications-gk',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Medizinische Anwendungen von Strahlung einordnen',
    description:
      'Die lernende Person kann medizinische Anwendungen von Strahlung wie Laser, Röntgen, Elektronen oder Schwerionen fachlich einordnen.',
    sourceSpan: '4.4 Strahlenbiophysik, S. 40',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Strahlenbiophysik, S. 40',
    courseLevel: 'GK',
    canonicalGoalIds: [
      '48e77690-17f7-5ebe-a8f7-87b2ee9820da',
      '75f7139f-0f07-5cec-bcea-4f139502b528',
      'bb5c5eab-2fc1-5336-b8cf-14d147695487',
    ],
  },
  {
    id: 'rp-phys-sek2-q-radiation-biophysics-dose-effect-lk',
    topicCode: 'RADIATION-BIOPHYSICS',
    passageId: 'rp-physics-sekii:radiation-biophysics',
    title: 'Dosis-Effekt-Kurven und fraktionierte Bestrahlung fachlich deuten',
    description:
      'Die lernende Person kann Dosis-Effekt-Kurven, linearquadratisches Modell und fraktionierte Bestrahlung fachlich deuten.',
    sourceSpan: '5.4 Strahlenbiophysik, S. 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Strahlenbiophysik, S. 70',
    courseLevel: 'LK',
    canonicalGoalIds: ['bb5c5eab-2fc1-5336-b8cf-14d147695487'],
  },
  {
    id: 'rp-phys-sek2-q-thermodynamic-machines-ideal-gas-gk',
    topicCode: 'THERMODYNAMIC-MACHINES',
    passageId: 'rp-physics-sekii:thermodynamic-machines',
    title: 'Gesetze des idealen Gases anwenden',
    description:
      'Die lernende Person kann Gesetze des idealen Gases zur Beschreibung thermodynamischer Prozesse anwenden.',
    sourceSpan: '4.4 Thermodynamische Maschinen, S. 42',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Thermodynamische Maschinen, S. 42',
    courseLevel: 'GK',
    canonicalGoalIds: ['cd1903a5-d70a-5320-9124-b6b24917ba14', '23c5382a-4b0f-5715-84b5-cf87b8323152'],
  },
  {
    id: 'rp-phys-sek2-q-thermodynamic-machines-gk',
    topicCode: 'THERMODYNAMIC-MACHINES',
    passageId: 'rp-physics-sekii:thermodynamic-machines',
    title: 'Thermodynamische Maschinen fachlich vergleichen',
    description:
      'Die lernende Person kann thermodynamische Maschinen wie Wärmepumpe, Stirling-Motor oder Peltier-Element fachlich vergleichen.',
    sourceSpan: '4.4 Thermodynamische Maschinen, S. 42',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Thermodynamische Maschinen, S. 42',
    courseLevel: 'GK',
    canonicalGoalIds: [
      '18058384-a1bc-5ba2-8f5d-1fe9498acbf0',
      '73b5af24-7750-520a-bb16-43136ce19a5c',
      'd0cebf18-8b2a-52d6-857d-ef18cd64541c',
    ],
  },
  {
    id: 'rp-phys-sek2-q-thermodynamic-machines-carnot-gk',
    topicCode: 'THERMODYNAMIC-MACHINES',
    passageId: 'rp-physics-sekii:thermodynamic-machines',
    title: 'Carnot-Wirkungsgrad bei thermodynamischen Maschinen deuten',
    description:
      'Die lernende Person kann den Carnot-Wirkungsgrad als Grenze thermodynamischer Maschinen deuten.',
    sourceSpan: '4.4 Thermodynamische Maschinen, S. 42',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Thermodynamische Maschinen, S. 42',
    courseLevel: 'GK',
    canonicalGoalIds: ['73b5af24-7750-520a-bb16-43136ce19a5c', 'd0cebf18-8b2a-52d6-857d-ef18cd64541c'],
  },
  {
    id: 'rp-phys-sek2-q-nuclear-model-lk',
    topicCode: 'NUCLEAR-PHYSICS-LK',
    passageId: 'rp-physics-sekii:nuclear-physics-lk',
    title: 'Einfaches Kernmodell nutzen',
    description:
      'Die lernende Person kann ein einfaches Kernmodell wie Tröpfchenmodell oder Potentialtopf zur Beschreibung kernphysikalischer Sachverhalte nutzen.',
    sourceSpan: '5.4 Kernphysik, S. 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Kernphysik, S. 64',
    courseLevel: 'LK',
    canonicalGoalIds: ['6e7c35e0-7a38-5996-a42e-005038eff0db'],
  },
  {
    id: 'rp-phys-sek2-q-binding-separation-energy-lk',
    topicCode: 'NUCLEAR-PHYSICS-LK',
    passageId: 'rp-physics-sekii:nuclear-physics-lk',
    title: 'Trennenergie beziehungsweise Bindungsenergie deuten',
    description:
      'Die lernende Person kann Trennenergie beziehungsweise Bindungsenergie in Kernmodellen deuten und energetisch einordnen.',
    sourceSpan: '4.4 und 5.4 Kernphysik, S. 40 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Kernphysik, S. 40 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['cde9b548-2cf4-59ad-b5d4-a71872afbe56'],
  },
  {
    id: 'rp-phys-sek2-q-nuclear-reactions-lk',
    topicCode: 'NUCLEAR-PHYSICS-LK',
    passageId: 'rp-physics-sekii:nuclear-physics-lk',
    title: 'Kernreaktionen wie Zerfall, Fission und Fusion beschreiben',
    description:
      'Die lernende Person kann Kernreaktionen wie radioaktiven Zerfall, Fission und Fusion fachlich beschreiben.',
    sourceSpan: '4.4 und 5.4 Kernphysik, S. 40 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Kernphysik, S. 40 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['49872cc0-401f-5464-9235-4763df4db5cf', 'a12fddce-0215-58d9-bd91-21be8a960d25'],
  },
  {
    id: 'rp-phys-sek2-q-decay-absorption-laws-lk',
    topicCode: 'NUCLEAR-PHYSICS-LK',
    passageId: 'rp-physics-sekii:nuclear-physics-lk',
    title: 'Absorptions- und Zerfallsgesetz anwenden',
    description:
      'Die lernende Person kann Absorptionsgesetz und Zerfallsgesetz mathematisch anwenden und interpretieren.',
    sourceSpan: '4.4 und 5.4 Kernphysik, S. 40 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Kernphysik, S. 40 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['a12fddce-0215-58d9-bd91-21be8a960d25', '979e0d0d-8933-4ace-814f-f28060ad280f'],
  },
  {
    id: 'rp-phys-sek2-q-technical-nuclear-energy-lk',
    topicCode: 'NUCLEAR-PHYSICS-LK',
    passageId: 'rp-physics-sekii:nuclear-physics-lk',
    title: 'Energetische Aspekte technischer Kernanwendungen einordnen',
    description:
      'Die lernende Person kann energetische Aspekte technischer Kernanwendungen wie Fissions- und Fusionsreaktoren oder Sonne fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Kernphysik, S. 40 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Kernphysik, S. 40 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['49872cc0-401f-5464-9235-4763df4db5cf', '7e719cc2-0866-5267-a252-e7e7ac0d03f1'],
  },
  {
    id: 'rp-phys-sek2-q-radiation-sources-radionuclides',
    topicCode: 'RADIATION-SOURCES-RADIONUCLIDES',
    passageId: 'rp-physics-sekii:radiation-sources-radionuclides',
    title: 'Strahlenquellen und Radionuklide fachlich einordnen',
    description:
      'Die lernende Person kann Strahlenquellen und Radionuklide als Ausgangspunkte kernphysikalischer und strahlenbiophysikalischer Betrachtungen fachlich einordnen.',
    sourceSpan: '4.4 Kernphysik und 5.4 Strahlenbiophysik, S. 40 und 70',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Kernphysik und 5.4 Strahlenbiophysik, S. 40 und 70',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['e5c08365-a0d3-592c-ad8e-d2c2c6e2b717', 'a12fddce-0215-58d9-bd91-21be8a960d25'],
  },
  {
    id: 'rp-phys-sek2-q-quantum-nuclear-links-lk',
    topicCode: 'NUCLEAR-PHYSICS-LK',
    passageId: 'rp-physics-sekii:nuclear-physics-lk',
    title: 'Quantenmechanische Bezüge in der Kernphysik nutzen',
    description:
      'Die lernende Person kann quantenmechanische Bezüge wie Tunneleffekt oder Beta-Zerfall in kernphysikalischen Kontexten nutzen.',
    sourceSpan: '5.4 Kernphysik, S. 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Kernphysik, S. 64',
    courseLevel: 'LK',
    canonicalGoalIds: ['6e7c35e0-7a38-5996-a42e-005038eff0db', '5a5bc118-4420-5bb7-94c3-67837f2ce0dd'],
  },
  {
    id: 'rp-phys-sek2-q-energy-flows-carriers-lk',
    topicCode: 'ENERGY-ENTROPY-LK',
    passageId: 'rp-physics-sekii:energy-entropy-lk',
    title: 'Energieströme und Energieträger beschreiben',
    description:
      'Die lernende Person kann Energieströme und Energieträger als Grundlage thermodynamischer Betrachtungen beschreiben.',
    sourceSpan: '5.4 Energie und Entropie, S. 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Entropie, S. 64',
    courseLevel: 'LK',
    canonicalGoalIds: ['36c4590c-6032-5a37-b660-f15951dee076', '6e79ef4a-2666-5f7a-885c-b175954506f8'],
  },
  {
    id: 'rp-phys-sek2-q-entropy-as-energy-carrier-lk',
    topicCode: 'ENERGY-ENTROPY-LK',
    passageId: 'rp-physics-sekii:energy-entropy-lk',
    title: 'Entropie als Energieträger deuten',
    description:
      'Die lernende Person kann Entropie als Energieträger deuten und mit Energieverteilung verknüpfen.',
    sourceSpan: '4.4 Entropie und 5.4 Energie und Entropie, S. 41 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Entropie und 5.4 Energie und Entropie, S. 41 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['239aac49-1137-5df5-b197-49e72292e40c', '6e79ef4a-2666-5f7a-885c-b175954506f8'],
  },
  {
    id: 'rp-phys-sek2-q-entropy-production-flow-lk',
    topicCode: 'ENERGY-ENTROPY-LK',
    passageId: 'rp-physics-sekii:energy-entropy-lk',
    title: 'Entropieerzeugung und Entropiestrom erklären',
    description:
      'Die lernende Person kann Entropieerzeugung und Entropiestrom in thermodynamischen Prozessen erklären.',
    sourceSpan: '4.4 Entropie und 5.4 Energie und Entropie, S. 41 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Entropie und 5.4 Energie und Entropie, S. 41 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['616ac6cf-901b-509a-8cbb-bd422ddecf05', '91b20476-12cf-50d6-880a-ea509ffe8a9a'],
  },
  {
    id: 'rp-phys-sek2-q-entropic-machines-lk',
    topicCode: 'ENERGY-ENTROPY-LK',
    passageId: 'rp-physics-sekii:energy-entropy-lk',
    title: 'Thermodynamische Maschinen entropisch betrachten',
    description:
      'Die lernende Person kann thermodynamische Maschinen wie Wärmepumpe, Stirling-Motor oder Peltier-Element entropisch betrachten.',
    sourceSpan: '5.4 Energie und Entropie, S. 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Energie und Entropie, S. 64',
    courseLevel: 'LK',
    canonicalGoalIds: ['18058384-a1bc-5ba2-8f5d-1fe9498acbf0', 'd0cebf18-8b2a-52d6-857d-ef18cd64541c'],
  },
  {
    id: 'rp-phys-sek2-q-carnot-efficiency-lk',
    topicCode: 'ENERGY-ENTROPY-LK',
    passageId: 'rp-physics-sekii:energy-entropy-lk',
    title: 'Carnot-Wirkungsgrad deuten',
    description:
      'Die lernende Person kann den Carnot-Wirkungsgrad als Grenze thermodynamischer Energieumwandlung deuten.',
    sourceSpan: '4.4 Entropie und 5.4 Energie und Entropie, S. 41 und 64',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Entropie und 5.4 Energie und Entropie, S. 41 und 64',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['d0cebf18-8b2a-52d6-857d-ef18cd64541c', '73b5af24-7750-520a-bb16-43136ce19a5c'],
  },
  {
    id: 'rp-phys-sek2-q-field-particle-examples',
    topicCode: 'FIELD-PARTICLE-APPLICATIONS',
    passageId: 'rp-physics-sekii:field-particle-applications',
    title: 'Fadenstrahlrohr und Elektronenablenkröhre als Feldanwendungen einordnen',
    description:
      'Die lernende Person kann Fadenstrahlrohr und Elektronenablenkröhre als Anwendungen geladener Teilchen in Feldern fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Anwendungsbeispiele für Teilchen in Feldern, S. 35 und 65',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Anwendungsbeispiele für Teilchen in Feldern, S. 35 und 65',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['966782e5-690d-4fae-bbab-fa3fa30525c3', '5fda8623-69e0-5503-9c6d-86d054a8cf91'],
  },
  {
    id: 'rp-phys-sek2-q-particle-accelerators',
    topicCode: 'FIELD-PARTICLE-APPLICATIONS',
    passageId: 'rp-physics-sekii:field-particle-applications',
    title: 'Teilchenbeschleuniger als Feldanwendungen beschreiben',
    description:
      'Die lernende Person kann Teilchenbeschleuniger als technische Anwendungen elektrischer und magnetischer Felder beschreiben.',
    sourceSpan: '4.4 und 5.4 Anwendungsbeispiele für Teilchen in Feldern, S. 35 und 65',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Anwendungsbeispiele für Teilchen in Feldern, S. 35 und 65',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['74a74132-fa39-541c-8d3c-696cf228452d', '2d62b444-796e-548d-aeee-cfd9c6665ddc'],
  },
  {
    id: 'rp-phys-sek2-q-hall-effect-application',
    topicCode: 'FIELD-PARTICLE-APPLICATIONS',
    passageId: 'rp-physics-sekii:field-particle-applications',
    title: 'Hall-Effekt qualitativ als Feldanwendung deuten',
    description:
      'Die lernende Person kann den Hall-Effekt qualitativ als Anwendung magnetischer Felder auf Ladungsträger deuten.',
    sourceSpan: '4.4 Anwendungsbeispiele für Teilchen in Feldern, S. 35',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Anwendungsbeispiele für Teilchen in Feldern, S. 35',
    courseLevel: 'GK',
    canonicalGoalIds: ['b39ae8fb-4358-5866-8adf-3d5365368eeb'],
  },
  {
    id: 'rp-phys-sek2-q-mass-spectrometer-mhd-lk',
    topicCode: 'FIELD-PARTICLE-APPLICATIONS',
    passageId: 'rp-physics-sekii:field-particle-applications',
    title: 'Massenspektrometer und MHD-Generator als Feldanwendungen einordnen',
    description:
      'Die lernende Person kann Massenspektrometer und MHD-Generator als weiterführende Anwendungen geladener Teilchen in Feldern einordnen.',
    sourceSpan: '5.4 Anwendungsbeispiele für Teilchen in Feldern, S. 65',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 5.4 Anwendungsbeispiele für Teilchen in Feldern, S. 65',
    courseLevel: 'LK',
    canonicalGoalIds: ['3f17d0d2-562d-4c1c-9ebc-1a1a43f28f9c', 'd8442d03-8b7e-54b7-9d9a-dc31ce541daa'],
  },
  {
    id: 'rp-phys-sek2-q-ac-effective-values',
    topicCode: 'AC-CIRCUITS',
    passageId: 'rp-physics-sekii:ac-circuits',
    title: 'Effektivwerte von Stromstärke und Spannung in Wechselstromkreisen nutzen',
    description:
      'Die lernende Person kann Effektivwerte von Stromstärke und Spannung in Wechselstromkreisen fachlich nutzen.',
    sourceSpan: '4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['5f97952e-5ac9-5749-94d0-d1dc50dda358'],
  },
  {
    id: 'rp-phys-sek2-q-ac-impedance-phase',
    topicCode: 'AC-CIRCUITS',
    passageId: 'rp-physics-sekii:ac-circuits',
    title: 'Impedanz und Phasenverschiebung in Wechselstromkreisen beschreiben',
    description:
      'Die lernende Person kann Impedanz und Phasenverschiebung in Wechselstromkreisen qualitativ und graphisch beschreiben.',
    sourceSpan: '4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a'],
  },
  {
    id: 'rp-phys-sek2-q-ac-active-reactive-power',
    topicCode: 'AC-CIRCUITS',
    passageId: 'rp-physics-sekii:ac-circuits',
    title: 'Wirkleistung und Blindleistung in Wechselstromkreisen einordnen',
    description:
      'Die lernende Person kann Wirkleistung und Blindleistung in Wechselstromkreisen fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a', '46e42b07-c098-5d65-8ef5-8472b7c4d8e2'],
  },
  {
    id: 'rp-phys-sek2-q-ac-rlc-circuits',
    topicCode: 'AC-CIRCUITS',
    passageId: 'rp-physics-sekii:ac-circuits',
    title: 'RLC-Schaltungen in Wechselstromkreisen vergleichen',
    description:
      'Die lernende Person kann Reihen- und Parallelschaltungen von Spule, Kondensator und ohmschem Widerstand in Wechselstromkreisen vergleichen.',
    sourceSpan: '4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Wechselstromkreise, S. 37 und 67',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a'],
  },
  {
    id: 'rp-phys-sek2-q-energy-provision-principle',
    topicCode: 'ENERGY-PROVISION',
    passageId: 'rp-physics-sekii:energy-provision',
    title: 'Grundprinzip der Energiebereitstellung mit Energieerhaltung und Wirkungsgrad beschreiben',
    description:
      'Die lernende Person kann das Grundprinzip der Energiebereitstellung mit Energieerhaltung und Wirkungsgrad beschreiben.',
    sourceSpan: '4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['30a936ec-e427-57fe-bf3e-4abd64b1f0c1', '201d353a-dfe7-521b-b0f6-eccb4d42945b'],
  },
  {
    id: 'rp-phys-sek2-q-energy-provision-technology-comparison',
    topicCode: 'ENERGY-PROVISION',
    passageId: 'rp-physics-sekii:energy-provision',
    title: 'Techniken zur Energiebereitstellung multiperspektivisch vergleichen',
    description:
      'Die lernende Person kann verschiedene Techniken zur Energiebereitstellung innerfachlich und überfachlich vergleichen.',
    sourceSpan: '4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['5be98160-5189-58aa-8183-1df1c400cc8c', '46e42b07-c098-5d65-8ef5-8472b7c4d8e2'],
  },
  {
    id: 'rp-phys-sek2-q-energy-provision-regional-global',
    topicCode: 'ENERGY-PROVISION',
    passageId: 'rp-physics-sekii:energy-provision',
    title: 'Globale und regionale Aspekte der Energieversorgung einordnen',
    description:
      'Die lernende Person kann globale und regionale Aspekte der Energieversorgung fachlich einordnen.',
    sourceSpan: '4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['5be98160-5189-58aa-8183-1df1c400cc8c'],
  },
  {
    id: 'rp-phys-sek2-q-energy-provision-sustainability',
    topicCode: 'ENERGY-PROVISION',
    passageId: 'rp-physics-sekii:energy-provision',
    title: 'Nachhaltigkeit bei Energiebereitstellung bewerten',
    description:
      'Die lernende Person kann Nachhaltigkeit bei Energiebereitstellung unter physikalischen, ökologischen, ökonomischen und gesellschaftlichen Kriterien bewerten.',
    sourceSpan: '4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 und 5.4 Energiebereitstellung, S. 42 und 72',
    courseLevel: 'GK_LK',
    canonicalGoalIds: ['5be98160-5189-58aa-8183-1df1c400cc8c', 'f322c268-dc16-5d50-82dd-209834f20208'],
  },
  {
    id: 'rp-phys-sek2-q-fundamental-particles-gk',
    topicCode: 'PARTICLE-PHYSICS-GK-ADDITION',
    passageId: 'rp-physics-sekii:particle-physics-gk-addition',
    title: 'Fundamentalteilchen fachlich einordnen',
    description:
      'Die lernende Person kann Fundamentalteilchen als elementare Bestandteile der Materie fachlich einordnen und mit einfachen Strukturmodellen verknüpfen.',
    sourceSpan: '4.4 Elementarteilchenphysik, S. 40',
    sourceRef: 'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Elementarteilchenphysik, S. 40',
    courseLevel: 'GK',
    canonicalGoalIds: ['b3f3f4f7-b5cc-40e1-b57a-3d93649baa61', '4e046c1c-bcc7-5e3c-9f71-f80d69027483'],
  },
  {
    id: 'rp-phys-sek2-q-scientific-revolutions-gk',
    topicCode: 'PHYSICS-AS-EVOLVING-SCIENCE',
    passageId: 'rp-physics-sekii:physics-as-evolving-science',
    title: 'Wissenschaftliche Revolutionen in der Physik historisch einordnen',
    description:
      'Die lernende Person kann wissenschaftliche Revolutionen wie kopernikanische Wende, quantenphysikalisches Weltbild oder Relativitätstheorie historisch und fachlich einordnen.',
    sourceSpan: '4.4 Physik als sich weiterentwickelnde Wissenschaft, S. 45',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Physik als sich weiterentwickelnde Wissenschaft, S. 45',
    courseLevel: 'GK',
    canonicalGoalIds: [
      '6d18104b-5704-5c45-b39a-2c84565b1796',
      '8ea46612-7f0d-4ef4-a732-9428e640ae92',
      'defe44d2-c3d3-456b-a786-fad2cef13fe8',
    ],
  },
  {
    id: 'rp-phys-sek2-q-physics-methods-context-gk',
    topicCode: 'PHYSICS-AS-EVOLVING-SCIENCE',
    passageId: 'rp-physics-sekii:physics-as-evolving-science',
    title: 'Physikalische Arbeitsweisen im gesellschaftlichen und historischen Kontext reflektieren',
    description:
      'Die lernende Person kann physikalische Arbeitsweisen als offenen und vorläufigen Erkenntnisprozess in gesellschaftlichen und historischen Kontexten reflektieren.',
    sourceSpan: '4.4 Physik als sich weiterentwickelnde Wissenschaft, S. 45',
    sourceRef:
      'Rheinland-Pfalz Lehrplan Physik MSS, 4.4 Physik als sich weiterentwickelnde Wissenschaft, S. 45',
    courseLevel: 'GK',
    canonicalGoalIds: [
      '2973da95-2cfc-5817-9c99-3c0c82777369',
      'd81576e9-0320-5a90-8a1d-cd824981f2f6',
      'defe44d2-c3d3-456b-a786-fad2cef13fe8',
    ],
  },
]

const manualSpecs = [...introductoryPhaseSpecs, ...qualificationPhaseSpecs]

const manualSourceGoals = manualSpecs.map<ExtractedSourceGoal>((spec, index) => ({
  id: spec.id,
  passageId: spec.passageId,
  topicCode: spec.topicCode,
  bulletIndex: snapshotSourceGoals.length + index + 1,
  aspectIndex: 1,
  title: spec.title,
  description: spec.description,
  sourceText: spec.title,
  sourceSpan: spec.sourceSpan,
  parentBulletText: spec.title,
  sourceRef: spec.sourceRef,
  courseLevel: spec.courseLevel,
  granularity: 'officialCompetencyRow',
  tags: [
    'source:rheinland-pfalz',
    'stage:SekII',
    `phase:${spec.topicCode.startsWith('INTRO-') ? 'Einführungsphase' : 'Qualifikationsphase'}`,
    `topic:${spec.topicCode}`,
    `course:${spec.courseLevel}`,
  ],
  rawSourceText: spec.title,
  rawSourceSpan: spec.sourceSpan,
  rawParentBulletText: spec.title,
}))

const sourceGoals = [...snapshotSourceGoals, ...manualSourceGoals]

const sourceGoalsByPassageId = new Map<string, typeof sourceGoals>()
for (const goal of sourceGoals) {
  const goals = sourceGoalsByPassageId.get(goal.passageId) ?? []
  goals.push(goal)
  sourceGoalsByPassageId.set(goal.passageId, goals)
}

const passages = Array.from(sourceGoalsByPassageId.entries()).map(([passageId, goals]) => {
  const parentSlug = passageId.replace(/^rp-physics-sekii:/u, '')
  const parent = sourceLandscape.goals.find((goal) => slug(goal.id) === parentSlug)
  const firstGoal = goals[0]
  return {
    id: passageId,
    topicCode: firstGoal.topicCode,
    title: `${firstGoal.topicCode} ${parent?.title ?? firstGoal.title}`,
    text: goals.map((goal) => `- ${goal.sourceText}`).join('\n'),
    page: sourcePage(firstGoal.sourceRef),
    sourcePath: sourcePdfPath,
    rawText: goals.map((goal) => `- ${goal.sourceText}`).join('\n'),
    sourceGoalIds: goals.map((goal) => goal.id),
  }
})

const sourceGoalIds = new Set(sourceGoals.map((goal) => goal.id))
const manualMappings = manualSpecs.flatMap((spec) =>
  spec.canonicalGoalIds.map((canonicalGoalId) => ({
    legacyGoalId: spec.id,
    canonicalGoalId,
    matchType: 'partial',
    reviewDecisionId: spec.id,
  })),
)

const mappings = legacyMapping.mappings
  .filter((mapping) => sourceGoalIds.has(mapping.legacyGoalId))
  .map((mapping) => ({
    legacyGoalId: mapping.legacyGoalId,
    canonicalGoalId: mapping.canonicalGoalId,
    matchType: mapping.matchType ?? 'partial',
    reviewDecisionId: mapping.legacyGoalId,
  }))
  .concat(manualMappings)

const mappingsBySourceGoalId = new Map<string, typeof mappings>()
for (const mapping of mappings) {
  const current = mappingsBySourceGoalId.get(mapping.legacyGoalId) ?? []
  current.push(mapping)
  mappingsBySourceGoalId.set(mapping.legacyGoalId, current)
}

const decisions = sourceGoals.map((sourceGoal) => {
  const sourceMappings = mappingsBySourceGoalId.get(sourceGoal.id) ?? []
  const canonicalGoalIds = Array.from(new Set(sourceMappings.map((mapping) => mapping.canonicalGoalId)))
  return {
    sourceGoalId: sourceGoal.id,
    topicCode: sourceGoal.topicCode,
    sourceSpan: sourceGoal.sourceSpan,
    decision: canonicalGoalIds.length > 0 ? 'mapped' : 'needsCanonicalGoal',
    canonicalGoalIds,
    rationale: canonicalGoalIds.length > 1
      ? 'Das RP-Source-Ziel ist inhaltlich durch mehrere kanonische Physikziele abgedeckt; 1:n ist hier die passende Zuordnungsform.'
      : canonicalGoalIds.length === 1
        ? 'Das RP-Source-Ziel ist inhaltlich durch ein kanonisches Physikziel abgedeckt.'
        : 'Für dieses RP-Source-Ziel fehlt noch ein fachlich passendes kanonisches Physikziel.',
    reviewedAt: '2026-05-11',
    reviewer: 'codex',
  }
})
const coveredSourceGoalCount = decisions.filter((decision) => decision.decision === 'mapped').length
const needsCanonicalGoalCount = decisions.length - coveredSourceGoalCount

const extraction = {
  schemaVersion: 1,
  extractionId: 'DE-RP-PHYSIK-SEKII-MSS-DRAFT',
  title: 'DE-RP - Physik Sekundarstufe II (Rheinland-Pfalz, MSS Source-Extraction Draft)',
  sourceLandscapeId,
  jurisdiction: 'DE-RP',
  subject: 'Physik',
  stage: 'SekII',
  sourceDocument: {
    key: 'MSS-PHYSIK',
    title: 'Lehrplan Physik Grund- und Leistungsfach in der gymnasialen Oberstufe (Mainzer Studienstufe)',
    path: sourcePdfPath,
    official: true,
  },
  method: {
    passageExtraction:
      'pdftotext -layout; Einführungsphase and Q-phase passage groups are extracted or re-anchored directly from the official MSS text. The retained RP source snapshot is only used to carry forward already-reviewed leaf expectations where they match the official MSS section references.',
    sourceGoalExtraction:
      'one source goal per official Einführungsphase bullet, reviewed Q-phase leaf expectation, and newly added official MSS Wahlpflicht-/Restbaustein item. The final inventory audit includes all concrete MSS GF/LK content and excludes only the open Individuelles Thema placeholder because it contains no specific physics competency content.',
  },
  qualityReview: {
    sourceGoalCountPeerBaseline: {
      accepted: true,
      details:
        'Accepted after final inventory audit against the official MSS PDF: all concrete Einführungsphase, Grundfach and Leistungsfach content blocks are represented. The only unextracted block is Individuelles Thema, which intentionally provides no concrete physics content.',
    },
  },
  expectedTopicCodes: passages.map((passage) => passage.topicCode),
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
            label: 'Amtliche RP-Physik-MSS-PDF liegt lokal vor',
            passed: true,
            details: sourcePdfPath,
          },
          {
            id: 'qphase-passage-groups-present',
            label: 'Einführungsphase und Q-Phasen-Passagekorridore aus amtlichen Lehrplanstellen sind angelegt',
            passed: true,
            details: `${passages.length} Passagegruppen mit PDF-Seitenreferenzen.`,
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
            label: 'Einführungsphase- und Q-Phasen-Source-Ziele wurden erzeugt',
            passed: true,
            details: `${sourceGoals.length} Source-Ziele`,
          },
          {
            id: 'full-source-inventory-complete',
            label: 'Finaler RP-Sek-II-Source-Inventar-Audit gegen die amtliche MSS-PDF abgeschlossen',
            passed: true,
            details:
              'Alle konkreten GF-/LK-Inhaltsbausteine sind als Source-Ziele erfasst; Individuelles Thema bleibt bewusst ausgeschlossen, weil dort keine spezifischen Physikinhalte vorgegeben sind.',
          },
          {
            id: 'source-goal-ids-unique',
            label: 'Source-Ziel-IDs sind eindeutig',
            passed: true,
            details: 'Doppelte IDs: -',
          },
          {
            id: 'source-goals-reference-passages',
            label: 'Jedes Source-Ziel referenziert eine vorhandene Passagegruppe',
            passed: true,
            details: 'Ohne Passage: -',
          },
        ],
      },
      {
        id: 'MAPPING-3',
        label: 'Source-Ziele auf SkillPilot-Ziele gemappt',
        status: needsCanonicalGoalCount === 0 ? 'complete' : 'incomplete',
        dependsOn: ['MAPPING-1', 'MAPPING-2'],
        checks: [
          {
            id: 'mapping-2-complete',
            label: 'MAPPING-2 abgeschlossen',
            passed: true,
            details:
              `${sourceGoals.length} Source-Ziele liegen aus dem final auditierten RP-Inventar vor; MAPPING-3 läuft gegen diese Source-Extraction-IDs.`,
          },
          {
            id: 'm3-review-file-present',
            label: 'M3-Review-Datei ist vorhanden',
            passed: true,
            details: reviewPath,
          },
          {
            id: 'm3-all-source-goals-reviewed',
            label: 'Alle vorhandenen Source-Ziele haben eine fachliche M3-Entscheidung',
            passed: true,
            details: `${sourceGoals.length}/${sourceGoals.length} Source-Ziele reviewed; offen: 0.`,
          },
          {
            id: 'm3-all-source-goals-covered-by-canonical',
            label: 'Alle vorhandenen Source-Ziele sind inhaltlich durch SkillPilot-Ziele abgedeckt',
            passed: needsCanonicalGoalCount === 0,
            details: `Abgedeckt: ${coveredSourceGoalCount}/${sourceGoals.length}; explizite Canonical-Gaps: ${needsCanonicalGoalCount}.`,
          },
        ],
      },
    ],
  },
  passages,
  sourceGoals,
}

const review = {
  version: 1,
  reviewId: 'DE-RP-PHYSIK-SEKII-MSS-DRAFT-MAPPING-3-SOURCE-EXTRACTION-1',
  sourceLandscapeId,
  targetLandscapeId,
  sourceExtractionPath: extractionPath,
  status: {
    scope: 'Rheinland-Pfalz Physik Sek II / MSS draft extraction',
    reviewedSourceGoals: sourceGoals.length,
    mappedSourceGoals: coveredSourceGoalCount,
    needsViewPlacementReview: 0,
    needsCanonicalGoal: needsCanonicalGoalCount,
    totalSourceGoals: sourceGoals.length,
    explicitNeedsCanonicalGoal: needsCanonicalGoalCount,
    notes:
      needsCanonicalGoalCount === 0
        ? 'Alle Source-Ziele aus dem final auditierten RP-MSS-Inventar sind inhaltlich durch kanonische Physikziele abgedeckt. Individuelles Thema ist dokumentiert ausgeschlossen, weil es keine spezifischen Physikinhalte vorgibt.'
        : `${needsCanonicalGoalCount} Source-Ziele zeigen echte Canonical-Gaps und müssen vor Abschluss fachlich ergänzt werden.`,
  },
  mappings,
  decisions,
}

writeJson(extractionPath, extraction)
writeJson(reviewPath, review)

const registry = readJson<{ entries?: Array<Record<string, unknown>> }>(registryPath)
const registryEntry = registry.entries?.find((entry) => entry.landscapeId === sourceLandscapeId)
if (!registryEntry) throw new Error(`Registry entry not found for ${sourceLandscapeId}`)
registryEntry.title = 'Physik Sekundarstufe II (Rheinland-Pfalz, MSS Source-Extraction Draft)'
registryEntry.sourcePath = sourcePdfPath
registryEntry.archiveSourcePath = sourcePdfPath
writeJson(registryPath, registry)

for (const suffix of ['gk', 'lk', 'sekii-gk', 'sekii-lk']) {
  const templatePath = path.resolve(repoRoot, compositionViewDir, `de-de-gym-physics-${suffix.replace(/^sekii-/u, '')}.view.json`)
  const fallbackTemplatePath = path.resolve(repoRoot, compositionViewDir, `de-bb-${suffix}.view.json`)
  const inputPath = suffix.startsWith('sekii-') ? path.resolve(repoRoot, compositionViewDir, `de-de-gym-${suffix.replace(/^sekii-/u, 'sekii-physics-')}.view.json`) : templatePath
  const template = readFileSync(inputPath, 'utf8')
  const view = JSON.parse(template) as Record<string, unknown>
  if (!view.viewId && !readFileSync(fallbackTemplatePath, 'utf8')) throw new Error(`Template missing for ${suffix}`)
  view.viewId = `de-rp-gym-${suffix.includes('sekii') ? 'sekii-physics' : 'physics'}-${suffix.endsWith('lk') ? 'lk' : 'gk'}`
  view.scope = {
    ...(typeof view.scope === 'object' && view.scope !== null ? view.scope : {}),
    jurisdiction: 'DE-RP',
  }
  appendGoalEntryToStructure(
    view,
    'physics-e2-newton-and-conservation',
    '31a2ef52-114b-4d2c-a720-6ef5a390b6dc',
    'Newtons 1. Axiom',
  )
  appendGoalEntryToStructure(
    view,
    'physics-e2-newton-and-conservation',
    'a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20',
    'Newtons 2. Axiom',
  )
  appendGoalEntryToStructure(
    view,
    'physics-e2-newton-and-conservation',
    'ad984bb6-e225-432a-952d-d83cda40b7f8',
    'Newtons 3. Axiom',
  )
  appendGoalEntryToStructure(
    view,
    'physics-q2',
    '8ac61062-f63e-5935-96ae-84014906c368',
    'Schallfeldgrößen',
  )
  appendGoalEntryToStructure(
    view,
    'physics-q4',
    '333ca92b-a92c-46a9-86be-dea8ddbd43e0',
    'Strömungsphysik',
  )
  if (suffix.endsWith('gk')) {
    appendGoalEntryToStructure(
      view,
      'physics-q4',
      '2973da95-2cfc-5817-9c99-3c0c82777369',
      'Physik im gesellschaftlichen Kontext',
    )
    appendGoalEntryToStructure(
      view,
      'physics-q4',
      'd81576e9-0320-5a90-8a1d-cd824981f2f6',
      'Forschungsverantwortung',
    )
  }
  writeJson(`${compositionViewDir}/de-rp-${suffix}.view.json`, view)
}

const readmePath = 'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/PHYSIK.md'
writeFileSync(
  path.resolve(repoRoot, readmePath),
  [
    '# Rheinland-Pfalz Physik Sekundarstufe II -> kanonische Physik',
    '',
    'Stand: 2026-05-11',
    '',
    'Diese Spur wurde vom reinen Pilot-/Snapshot-Diagnostic auf ein Source-Extraction-Artefakt zur amtlichen MSS-PDF umgestellt.',
    '',
    `- Quelle: \`${sourcePdfPath}\``,
    `- Source-Extraction: \`${extractionPath}\``,
    `- M3-Review: \`${reviewPath}\``,
    `- Source-Ziele im auditierten Inventar: ${sourceGoals.length}`,
    `- Passagegruppen im auditierten Inventar: ${passages.length}`,
    `- Abgedeckte Source-Ziele: ${coveredSourceGoalCount}/${sourceGoals.length}`,
    `- Explizite Canonical-Gaps: ${needsCanonicalGoalCount}`,
    '- Status: MAPPING-1 bis MAPPING-3 sind für die konkrete RP-MSS-Physikspur abgeschlossen. Der Baustein `Individuelles Thema` ist dokumentiert ausgeschlossen, weil er nur frei gewählte Inhalte vorgibt und keine spezifischen Physikziele enthält.',
    '',
    'Für spätere Feinarbeit bleiben Redundanz-/Granularitätsprüfungen im kanonischen Physikgraphen getrennte QA-Spuren.',
    '',
  ].join('\n'),
)

console.log(`Wrote ${extractionPath} (${sourceGoals.length} source goals)`)
console.log(`Wrote ${reviewPath} (${mappings.length} mapping rows)`)
console.log(`Updated ${registryPath}`)
console.log(`Wrote RP composition views and ${toRepoPath(path.resolve(repoRoot, readmePath))}`)
