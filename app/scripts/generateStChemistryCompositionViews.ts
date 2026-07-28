import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LearningGoal, SkillLandscape } from '../src/landscapeTypes'

type MappingEntry = {
  canonicalGoalId?: string
}

type MappingFile = {
  mappings?: MappingEntry[]
}

type CourseProfile = 'GK' | 'LK'
type Jurisdiction = 'DE-ST' | 'DE-MV' | 'DE-RP' | 'DE-SL' | 'DE-SN' | 'DE-TH'

type StateConfig = {
  jurisdiction: Jurisdiction
  slug: string
  displayName: string
  mappingPaths: string[]
}

type CompositionViewNode =
  | {
    kind: 'structure'
    id: string
    label: string
    children: CompositionViewNode[]
  }
  | {
    kind: 'goalEntry'
    goalId: string
    displayLabel?: string
  }

type CompositionView = {
  viewId: string
  landscapeId: string
  scope: {
    schoolForm: 'Gymnasium'
    jurisdiction: Jurisdiction
    stage: 'CrossStage'
    courseProfile: CourseProfile
  }
  rootNodes: CompositionViewNode[]
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const canonicalChemistryPath =
  'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const outputDir = 'curricula/DE/Gymnasium/composition-views/chemie'
const stateConfigs: StateConfig[] = [
  {
    jurisdiction: 'DE-ST',
    slug: 'de-st',
    displayName: 'DE-ST',
    mappingPaths: [
      'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/mapping/DE-ST/upper-secondary/st_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ],
  },
  {
    jurisdiction: 'DE-MV',
    slug: 'de-mv',
    displayName: 'DE-MV',
    mappingPaths: [
      'curricula/DE/Gymnasium/mapping/DE-MV/lower-secondary/mv_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/mapping/DE-MV/upper-secondary/mv_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ],
  },
  {
    jurisdiction: 'DE-RP',
    slug: 'de-rp',
    displayName: 'DE-RP',
    mappingPaths: [
      'curricula/DE/Gymnasium/mapping/DE-RP/lower-secondary/rp_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/mapping/DE-RP/upper-secondary/rp_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ],
  },
  {
    jurisdiction: 'DE-SL',
    slug: 'de-sl',
    displayName: 'DE-SL',
    mappingPaths: [
      'curricula/DE/Gymnasium/mapping/DE-SL/lower-secondary/sl_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/mapping/DE-SL/upper-secondary/sl_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ],
  },
  {
    jurisdiction: 'DE-SN',
    slug: 'de-sn',
    displayName: 'DE-SN',
    mappingPaths: [
      'curricula/DE/Gymnasium/mapping/DE-SN/lower-secondary/sn_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/mapping/DE-SN/upper-secondary/sn_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ],
  },
  {
    jurisdiction: 'DE-TH',
    slug: 'de-th',
    displayName: 'DE-TH',
    mappingPaths: [
      'curricula/DE/Gymnasium/mapping/DE-TH/lower-secondary/th_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
      'curricula/DE/Gymnasium/mapping/DE-TH/upper-secondary/th_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json',
    ],
  },
]

function repoPath(relativePath: string): string {
  return path.resolve(repoRoot, relativePath)
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readFileSync(repoPath(relativePath), 'utf8')) as T
}

function slug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function isAtomicGoal(goal: LearningGoal): boolean {
  return !goal.contains || goal.contains.length === 0
}

function isSourceCoverageGoal(goal: LearningGoal): boolean {
  const tags = goal.tags ?? []
  if (tags.includes('Motivation') || tags.includes('Orientation')) return false
  if (tags.includes('Practice') || tags.includes('Assessment')) return false
  if (tags.some((tag) => tag.startsWith('srs-deck:'))) return false
  if ((goal as { examData?: unknown }).examData) return false
  return true
}

function parseGoalRef(raw: string): string {
  return raw.includes(':') ? raw.split(':').pop()! : raw
}

function buildAtomicDescendantsByGoalId(
  landscape: SkillLandscape,
): Map<string, Set<string>> {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const result = new Map<string, Set<string>>()

  const collect = (goalId: string, visiting = new Set<string>()): Set<string> => {
    const cached = result.get(goalId)
    if (cached) return cached
    if (visiting.has(goalId)) return new Set()
    visiting.add(goalId)

    const goal = goalById.get(goalId)
    const atomicGoalIds = new Set<string>()
    if (goal) {
      if (isAtomicGoal(goal)) {
        atomicGoalIds.add(goal.id)
      } else {
        for (const childRef of goal.contains ?? []) {
          collect(parseGoalRef(childRef), visiting).forEach((childId) => atomicGoalIds.add(childId))
        }
      }
    }

    visiting.delete(goalId)
    result.set(goalId, atomicGoalIds)
    return atomicGoalIds
  }

  for (const goal of landscape.goals) {
    collect(goal.id)
  }

  return result
}

function buildPrimaryParentByGoalId(landscape: SkillLandscape): Map<string, string> {
  const result = new Map<string, string>()
  const rootGoalId = landscape.goals.find((goal) => goal.tags?.includes('root'))?.id
  const goalOrder = new Map(landscape.goals.map((goal, index) => [goal.id, index]))

  for (const parent of landscape.goals) {
    for (const childRef of parent.contains ?? []) {
      const childId = parseGoalRef(childRef)
      if (!childId || parent.id === rootGoalId) continue
      const existing = result.get(childId)
      if (!existing || (goalOrder.get(parent.id) ?? 0) < (goalOrder.get(existing) ?? 0)) {
        result.set(childId, parent.id)
      }
    }
  }

  return result
}

function collectSourceBackedAtomicGoalIds(
  landscape: SkillLandscape,
  atomicDescendantsByGoalId: Map<string, Set<string>>,
  mappingPaths: string[],
): Set<string> {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const result = new Set<string>()

  for (const mappingPath of mappingPaths) {
    const mappingFile = readJson<MappingFile>(mappingPath)
    for (const mapping of mappingFile.mappings ?? []) {
      if (!mapping.canonicalGoalId) continue
      const targetGoalId = parseGoalRef(mapping.canonicalGoalId)
      const targetGoal = goalById.get(targetGoalId)
      if (!targetGoal) continue

      const atomicGoalIds = isAtomicGoal(targetGoal)
        ? new Set([targetGoal.id])
        : atomicDescendantsByGoalId.get(targetGoal.id) ?? new Set<string>()
      for (const atomicGoalId of atomicGoalIds) {
        const atomicGoal = goalById.get(atomicGoalId)
        if (atomicGoal && isSourceCoverageGoal(atomicGoal)) {
          result.add(atomicGoal.id)
        }
      }
    }
  }

  return result
}

function courseProfileAllows(goal: LearningGoal, profile: CourseProfile): boolean {
  const tags = goal.tags ?? []
  if (profile === 'GK') return tags.includes('GK')
  return tags.includes('LK')
}

function buildGoalGroups(
  landscape: SkillLandscape,
  sourceBackedAtomicGoalIds: Set<string>,
  profile: CourseProfile,
  state: StateConfig,
): CompositionViewNode[] {
  const goalById = new Map(landscape.goals.map((goal) => [goal.id, goal]))
  const primaryParentByGoalId = buildPrimaryParentByGoalId(landscape)
  const goalOrder = new Map(landscape.goals.map((goal, index) => [goal.id, index]))
  const groupedGoalIds = new Map<string, string[]>()

  const goalIds = Array.from(sourceBackedAtomicGoalIds)
    .filter((goalId) => {
      const goal = goalById.get(goalId)
      return goal && courseProfileAllows(goal, profile)
    })
    .sort((left, right) => (goalOrder.get(left) ?? 0) - (goalOrder.get(right) ?? 0))

  for (const goalId of goalIds) {
    const parentId = primaryParentByGoalId.get(goalId) ?? goalId
    const entries = groupedGoalIds.get(parentId) ?? []
    entries.push(goalId)
    groupedGoalIds.set(parentId, entries)
  }

  return Array.from(groupedGoalIds.entries())
    .sort(([leftParentId], [rightParentId]) => (goalOrder.get(leftParentId) ?? 0) - (goalOrder.get(rightParentId) ?? 0))
    .map(([parentId, entries]) => {
      const parentGoal = goalById.get(parentId)
      const label = parentGoal?.title ?? 'Lehrplanbelegte Chemie-Ziele'
      return {
        kind: 'structure',
        id: `chemistry-${state.slug}-${profile.toLowerCase()}-${slug(label)}`,
        label,
        children: entries.map((goalId) => ({
          kind: 'goalEntry',
          goalId,
        })),
      }
    })
}

function buildView(
  landscape: SkillLandscape,
  sourceBackedAtomicGoalIds: Set<string>,
  profile: CourseProfile,
  state: StateConfig,
): CompositionView {
  return {
    viewId: `${state.slug}-gym-chemistry-${profile.toLowerCase()}`,
    landscapeId: landscape.landscapeId,
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: state.jurisdiction,
      stage: 'CrossStage',
      courseProfile: profile,
    },
    rootNodes: [
      {
        kind: 'structure',
        id: 'chemistry-root',
        label: 'Chemie',
        children: [
          {
            kind: 'goalEntry',
            goalId: 'a9c22adc-b543-5b0c-a2d8-3189facdff08',
            displayLabel: 'Warum Chemie?',
          },
          {
            kind: 'structure',
            id: `chemistry-${state.slug}-${profile.toLowerCase()}-source-backed`,
            label: `Lehrplanbelegte Chemie-Ziele (${state.displayName}, ${profile})`,
            children: buildGoalGroups(landscape, sourceBackedAtomicGoalIds, profile, state),
          },
        ],
      },
    ],
  }
}

const landscape = readJson<SkillLandscape>(canonicalChemistryPath)
const atomicDescendantsByGoalId = buildAtomicDescendantsByGoalId(landscape)

mkdirSync(repoPath(outputDir), { recursive: true })
for (const state of stateConfigs) {
  const sourceBackedAtomicGoalIds = collectSourceBackedAtomicGoalIds(
    landscape,
    atomicDescendantsByGoalId,
    state.mappingPaths,
  )

  for (const profile of ['GK', 'LK'] as const) {
    const view = buildView(landscape, sourceBackedAtomicGoalIds, profile, state)
    const outputPath = path.join(outputDir, `${state.slug}-${profile.toLowerCase()}.view.json`)
    writeFileSync(repoPath(outputPath), `${JSON.stringify(view, null, 2)}\n`)
    const sourceBackedAtoms = sourceBackedAtomicGoalIds.size
    const viewAtoms = buildGoalGroups(landscape, sourceBackedAtomicGoalIds, profile, state)
      .reduce((sum, group) => sum + ('children' in group ? group.children.length : 0), 0)
    console.log(`Wrote ${outputPath} (${viewAtoms}/${sourceBackedAtoms} ${state.displayName} source-backed atoms for ${profile})`)
  }
}
