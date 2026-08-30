import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  normalizeCanonicalLandscape,
  resolveCanonicalNodeType,
  type CanonicalAuthoringLandscape,
} from '../src/utils/authoring/canonicalAuthoring'
import {
  compileCompositionView,
  normalizeCompositionView,
  type CompiledCompositionPreviewNode,
  type CompositionViewNode,
} from '../src/utils/authoring/compositionViewAuthoring'
import type { GoalBookModel } from './goalBookModel'

interface CandidateConfig {
  subjectSlug: 'math' | 'physics'
  landscapePath: string
  baseViewPath: string
  profileViewPaths: string[]
  publishedModelPath: string
  outputPath: string
  viewId: string
  title: string
  rootId: string
  combinedProfileBranch: {
    inheritedStructureId: string
    structureId: string
    label: string
  }
  externalLandscapePaths?: string[]
}

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const CANDIDATES: CandidateConfig[] = [{
  subjectSlug: 'math',
  landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  baseViewPath: 'curricula/DE/Gymnasium/composition-views/mathematik/de-de-gk.view.json',
  profileViewPaths: [
    'curricula/DE/Gymnasium/composition-views/mathematik/de-de-gk.view.json',
    'curricula/DE/Gymnasium/composition-views/mathematik/de-de-lk.view.json',
  ],
  publishedModelPath: 'app/public/lernzielbuch/de-gym-mathematik-bundesweit.book-model.json',
  outputPath: 'app/scripts/config/goal-books/navigation/de-gym-math-national-atlas.view.json',
  viewId: 'de-gym-math-goal-book-atlas-v1',
  title: 'Kanonische Gliederung Mathematik – Gymnasium bundesweit',
  rootId: 'goal-book-math-root',
  combinedProfileBranch: {
    inheritedStructureId: 'canonical-structure:sek2-gk',
    structureId: 'goal-book-math-sekii-gk-lk',
    label: 'Sekundarstufe II (GK und LK)',
  },
}, {
  subjectSlug: 'physics',
  landscapePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  baseViewPath: 'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json',
  profileViewPaths: [
    'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-gk.view.json',
    'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-physics-lk.view.json',
  ],
  publishedModelPath: 'app/public/lernzielbuch/de-gym-physik-bundesweit.book-model.json',
  outputPath: 'app/scripts/config/goal-books/navigation/de-gym-physics-national-atlas.view.json',
  viewId: 'de-gym-physics-goal-book-atlas-v1',
  title: 'Kanonische Gliederung Physik – Gymnasium bundesweit',
  rootId: 'goal-book-physics-root',
  combinedProfileBranch: {
    inheritedStructureId: 'canonical-structure:physics-sekii-gk',
    structureId: 'goal-book-physics-sekii-gk-lk',
    label: 'Sekundarstufe II (GK und LK)',
  },
  externalLandscapePaths: [
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  ],
}]

const readJson = async <T,>(path: string): Promise<T> => (
  JSON.parse(await readFile(resolve(REPOSITORY_ROOT, path), 'utf8')) as T
)

const safeStructureId = (value: string): string => (
  value.replace(/[^A-Za-z0-9._:+-]+/gu, '-').replace(/^-+|-+$/gu, '')
)

const toExplicitTree = (
  node: CompiledCompositionPreviewNode,
  goalById: ReadonlyMap<string, CanonicalAuthoringLandscape['goals'][number]>,
  atlasGoalIds: ReadonlySet<string>,
): CompositionViewNode | null => {
  if (node.kind === 'goal' && node.sourceGoalId) {
    const goal = goalById.get(node.sourceGoalId)
    if (!goal) return null
    if (resolveCanonicalNodeType(goal) === 'atomic') {
      return atlasGoalIds.has(goal.id) ? { kind: 'goalEntry', goalId: goal.id } : null
    }
  }

  const children = node.children
    .map((child) => toExplicitTree(child, goalById, atlasGoalIds))
    .filter((child): child is CompositionViewNode => child !== null)
  if (children.length === 0) return null

  const sourceId = node.kind === 'goal' && node.sourceGoalId
    ? `canonical-goal-${node.sourceGoalId}`
    : `canonical-${node.runtimeId}`
  return {
    kind: 'structure',
    id: safeStructureId(sourceId),
    label: node.label,
    children,
  }
}

const stageKey = (page: GoalBookModel['pages'][number]): 'SekI' | 'SekII' | 'CrossStage' => {
  const stages = new Set(page.applicability?.flatMap(({ scopes }) => (
    scopes.map(({ stage }) => stage)
  )) ?? [])
  if (stages.has('SekI') && stages.has('SekII')) return 'CrossStage'
  return stages.has('SekII') ? 'SekII' : 'SekI'
}

const STAGE_LABELS = {
  SekI: 'Sekundarstufe I',
  SekII: 'Sekundarstufe II',
  CrossStage: 'Stufenübergreifend',
} as const

const AREA_LABELS: Record<string, string> = {
  Algebra: 'Algebra',
  Analysis: 'Analysis und Funktionen',
  Arithmetic: 'Zahlen und Rechnen',
  Data: 'Daten und Statistik',
  Geometry: 'Geometrie',
  LinearAlgebra: 'Lineare Algebra und analytische Geometrie',
  Measurement: 'Größen und Messen',
  Probability: 'Wahrscheinlichkeit',
  Sonstiges: 'Weitere fachliche Ziele',
}

const groupedSupplement = (
  pages: GoalBookModel['pages'],
  goalById: ReadonlyMap<string, CanonicalAuthoringLandscape['goals'][number]>,
): CompositionViewNode[] => {
  const byStageAndArea = new Map<string, GoalBookModel['pages']>()
  pages.forEach((page) => {
    const goal = goalById.get(page.goalId)
    const area = typeof goal?.dimensionTags?.area === 'string'
      ? goal.dimensionTags.area
      : 'Sonstiges'
    const key = `${stageKey(page)}\0${area}`
    const grouped = byStageAndArea.get(key) ?? []
    grouped.push(page)
    byStageAndArea.set(key, grouped)
  })

  return (['SekI', 'SekII', 'CrossStage'] as const).flatMap((stage) => {
    const areas = [...byStageAndArea]
      .filter(([key]) => key.startsWith(`${stage}\0`))
      .sort(([left], [right]) => left.localeCompare(right, 'de'))
    if (areas.length === 0) return []
    return [{
      kind: 'structure' as const,
      id: `goal-book-supplement-${stage.toLowerCase()}`,
      label: STAGE_LABELS[stage],
      children: areas.map(([key, areaPages]) => {
        const area = key.split('\0')[1]
        return {
          kind: 'structure' as const,
          id: safeStructureId(`goal-book-supplement-${stage}-${area}`),
          label: AREA_LABELS[area] ?? area,
          children: areaPages
            .sort((left, right) => (
              (left.navigationOrder ?? left.pageNumber) - (right.navigationOrder ?? right.pageNumber)
            ))
            .map(({ goalId }) => ({ kind: 'goalEntry' as const, goalId })),
        }
      }),
    }]
  })
}

const renameCombinedProfileBranch = (
  nodes: CompositionViewNode[],
  branch: CandidateConfig['combinedProfileBranch'],
): void => {
  let matchCount = 0
  const visit = (node: CompositionViewNode) => {
    if (node.kind !== 'structure') return
    if (node.id === branch.inheritedStructureId) {
      matchCount += 1
      node.id = branch.structureId
      node.label = branch.label
    }
    node.children.forEach(visit)
  }
  nodes.forEach(visit)
  if (matchCount !== 1) {
    throw new Error(
      `expected exactly one combined-profile branch ${branch.inheritedStructureId}, found ${matchCount}`,
    )
  }
}

const prepareCandidate = async (config: CandidateConfig) => {
  const primaryLandscape = normalizeCanonicalLandscape(await readJson(config.landscapePath))
  const externalLandscapes = await Promise.all((config.externalLandscapePaths ?? [])
    .map(async (path) => normalizeCanonicalLandscape(await readJson(path))))
  const goalUniverse = normalizeCanonicalLandscape({
    ...primaryLandscape,
    goals: [
      ...primaryLandscape.goals,
      ...externalLandscapes.flatMap(({ goals }) => goals),
    ],
  })
  const goalById = new Map(goalUniverse.goals.map((goal) => [goal.id, goal] as const))
  const publishedModel = await readJson<GoalBookModel>(config.publishedModelPath)
  const atlasGoalIds = new Set(publishedModel.pages.map(({ goalId }) => goalId))

  const baseView = normalizeCompositionView(await readJson(config.baseViewPath))
  const baseCompilation = compileCompositionView(baseView, primaryLandscape, goalUniverse)
  const baseErrors = baseCompilation.findings.filter(({ severity }) => severity === 'error')
  if (baseErrors.length > 0) throw new Error(JSON.stringify(baseErrors, null, 2))
  const explicitRoots = baseCompilation.compiledRootNodes
    .map((root) => toExplicitTree(root, goalById, atlasGoalIds))
    .filter((root): root is CompositionViewNode => root !== null)
  if (explicitRoots.length !== 1 || explicitRoots[0].kind !== 'structure') {
    throw new Error(`${config.subjectSlug}: canonical backbone must compile to one structure root.`)
  }
  explicitRoots[0].id = config.rootId
  renameCombinedProfileBranch(explicitRoots, config.combinedProfileBranch)

  const profileTargetIds = new Set<string>()
  for (const viewPath of config.profileViewPaths) {
    const view = normalizeCompositionView(await readJson(viewPath))
    const compilation = compileCompositionView(view, primaryLandscape, goalUniverse)
    const errors = compilation.findings.filter(({ severity }) => severity === 'error')
    if (errors.length > 0) throw new Error(JSON.stringify(errors, null, 2))
    const visit = (node: CompiledCompositionPreviewNode) => {
      if (node.kind === 'goal' && node.sourceGoalId && atlasGoalIds.has(node.sourceGoalId)) {
        const goal = goalById.get(node.sourceGoalId)
        if (goal && resolveCanonicalNodeType(goal) === 'atomic') profileTargetIds.add(goal.id)
      }
      node.children.forEach(visit)
    }
    compilation.compiledRootNodes.forEach(visit)
  }

  const backboneGoalIds = new Set<string>()
  const collectExplicitGoals = (node: CompositionViewNode) => {
    if (node.kind === 'structure') node.children.forEach(collectExplicitGoals)
    else if (node.kind === 'goalEntry') backboneGoalIds.add(node.goalId)
  }
  explicitRoots.forEach(collectExplicitGoals)
  const profileAdditions = publishedModel.pages.filter(({ goalId }) => (
    profileTargetIds.has(goalId) && !backboneGoalIds.has(goalId)
  ))
  if (profileAdditions.length > 0) {
    explicitRoots[0].children.push({
      kind: 'structure',
      id: 'goal-book-canonical-profile-additions',
      label: 'Kanonische Profilergänzungen',
      children: profileAdditions.map(({ goalId }) => ({ kind: 'goalEntry', goalId })),
    })
  }

  const coveredIds = new Set([...backboneGoalIds, ...profileAdditions.map(({ goalId }) => goalId)])
  const supplementPages = publishedModel.pages.filter(({ goalId }) => !coveredIds.has(goalId))
  explicitRoots[0].children.push({
    kind: 'structure',
    id: 'goal-book-bundesland-supplements',
    label: 'Bundeslandspezifische Ergänzungen',
    children: groupedSupplement(supplementPages, goalById),
  })

  const candidate = {
    $schema: 'https://skillpilot.com/schemas/curriculum-package/v1/composition-view.schema.json',
    viewFormatVersion: '1.0',
    viewId: config.viewId,
    landscapeId: primaryLandscape.landscapeId,
    language: 'de-DE',
    title: config.title,
    scope: {
      schoolForm: 'Gymnasium',
      jurisdiction: 'DE',
      stage: 'CrossStage',
    },
    rootNodes: explicitRoots,
  }
  await mkdir(dirname(resolve(REPOSITORY_ROOT, config.outputPath)), { recursive: true })
  await writeFile(resolve(REPOSITORY_ROOT, config.outputPath), `${JSON.stringify(candidate, null, 2)}\n`)
  console.log(`${config.outputPath}: ${backboneGoalIds.size} backbone + ${profileAdditions.length} profile + ${supplementPages.length} supplement = ${atlasGoalIds.size}`)
}

for (const candidate of CANDIDATES) await prepareCandidate(candidate)
