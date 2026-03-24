import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertLearningGoal } from '../src/goalTypes'
import type { LearningLandscape } from '../src/landscapeTypes'
import { buildGoalIndex } from '../src/hooks/useGoalIndex'
import { applyGoalPlacementProjection } from '../src/utils/goalPlacementProjection'
import { GLOBAL_STAGE_SCOPE_CONFIG_IDS } from '../src/utils/personalCurriculumStageScope'
import { buildVisibleChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../..')
const canonicalDir = join(repoRoot, 'curricula', 'DE', 'Gymnasium', 'canonical')

type PersonalCurriculumConfig = Record<string, { selected: boolean; filterId?: string }>

export interface TreeProjectionFinding {
  code: 'TPV-101' | 'TPV-102'
  severity: 'error'
  landscapeId: string
  goalId?: string
  title?: string
  dimension?: 'scope'
  value?: string
  message: string
}

function getAllJsonFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
  for (const entry of entries) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) {
      getAllJsonFiles(file, files)
      continue
    }
    if (entry.name.endsWith('.json')) {
      files.push(file)
    }
  }
  return files
}

function repoRelative(file: string): string {
  return relative(repoRoot, file).replace(/\\/g, '/')
}

function loadCanonicalLandscapes(): Array<{ file: string; landscape: LearningLandscape }> {
  return getAllJsonFiles(canonicalDir)
    .sort((a, b) => a.localeCompare(b))
    .map((file) => ({
      file,
      landscape: JSON.parse(readFileSync(file, 'utf8')) as LearningLandscape,
    }))
}

function buildStageScopeConfig(scope: 'both' | 'sek1' | 'sek2'): PersonalCurriculumConfig {
  if (scope === 'both') {
    return {
      [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: { selected: true },
      [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: { selected: true },
    }
  }
  if (scope === 'sek1') {
    return {
      [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: { selected: true },
      [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: { selected: false },
    }
  }
  return {
    [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek1]: { selected: false },
    [GLOBAL_STAGE_SCOPE_CONFIG_IDS.sek2]: { selected: true },
  }
}

function collectTreeProjectionFindingsForLandscape(
  landscape: LearningLandscape,
  activeFilter: string | undefined,
  stageScope: 'both' | 'sek1' | 'sek2',
): TreeProjectionFinding[] {
  const uiGoals = landscape.goals.map((goal) => convertLearningGoal(goal, { landscapeId: landscape.landscapeId }))
  const [projectedEntry] = applyGoalPlacementProjection(
    [{ meta: landscape, goals: uiGoals }],
    activeFilter,
  )

  if (!projectedEntry) return []

  const allGoals = new Map(projectedEntry.goals.map((goal) => [goal.id, goal]))
  const personalConfig = buildStageScopeConfig(stageScope)
  const { globalRootGoals } = buildGoalIndex(projectedEntry.goals)
  const visibleChildrenByParent = buildVisibleChildrenMap(allGoals, activeFilter, personalConfig, 'all', 'learner')
  const scopeLabel = `filter=${activeFilter ?? 'all'};stage=${stageScope};audience=learner`

  const occurrenceCountByGoalId = new Map<string, number>()
  const visibleParentIdsByGoalId = new Map<string, Set<string>>()

  const walk = (
    goalId: string,
    parentId?: string,
    inheritedPhaseContext?: ReturnType<typeof getRenderedChildIds>['phaseContext'],
    path: Set<string> = new Set(),
  ) => {
    if (path.has(goalId)) {
      return
    }

    occurrenceCountByGoalId.set(goalId, (occurrenceCountByGoalId.get(goalId) ?? 0) + 1)
    if (parentId) {
      const parents = visibleParentIdsByGoalId.get(goalId) ?? new Set<string>()
      parents.add(parentId)
      visibleParentIdsByGoalId.set(goalId, parents)
    }

    const nextPath = new Set(path)
    nextPath.add(goalId)
    const { childIds, phaseContext } = getRenderedChildIds(
      goalId,
      allGoals,
      visibleChildrenByParent,
      'learner',
      inheritedPhaseContext,
    )

    childIds.forEach((childId) => walk(childId, goalId, phaseContext, nextPath))
  }

  globalRootGoals.forEach((rootGoal) => walk(rootGoal.id))

  const findings: TreeProjectionFinding[] = []
  const reportedMultipleParents = new Set<string>()

  for (const [goalId, occurrenceCount] of occurrenceCountByGoalId.entries()) {
    if (occurrenceCount <= 1) continue
    const goal = allGoals.get(goalId)
    findings.push({
      code: 'TPV-101',
      severity: 'error',
      landscapeId: landscape.landscapeId,
      goalId,
      title: goal?.title,
      dimension: 'scope',
      value: scopeLabel,
      message: `Visible goal appears ${occurrenceCount} times in rendered tree projection ${scopeLabel}.`,
    })
  }

  for (const [goalId, parentIds] of visibleParentIdsByGoalId.entries()) {
    if (parentIds.size <= 1) continue
    if (reportedMultipleParents.has(goalId)) continue
    reportedMultipleParents.add(goalId)
    const goal = allGoals.get(goalId)
    const parentTitles = Array.from(parentIds)
      .map((parentId) => allGoals.get(parentId)?.title ?? parentId)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    findings.push({
      code: 'TPV-102',
      severity: 'error',
      landscapeId: landscape.landscapeId,
      goalId,
      title: goal?.title,
      dimension: 'scope',
      value: scopeLabel,
      message: `Visible goal has ${parentIds.size} visible parents in rendered tree projection ${scopeLabel}: ${parentTitles.join(', ')}.`,
    })
  }

  return findings
}

export function buildTreeProjectionValidationFindings(): TreeProjectionFinding[] {
  const findings: TreeProjectionFinding[] = []

  for (const { file, landscape } of loadCanonicalLandscapes()) {
    if (!Array.isArray(landscape.goals) || landscape.goals.length === 0) continue
    if (!Array.isArray(landscape.programUnits) || landscape.programUnits.length === 0) continue
    if (!Array.isArray(landscape.goalPlacements) || landscape.goalPlacements.length === 0) continue

    const filterIds = [undefined, ...((landscape.filters ?? []).map((filter) => filter.id))]
    const stageScopes: Array<'both' | 'sek1' | 'sek2'> = ['both', 'sek1', 'sek2']

    for (const filterId of filterIds) {
      for (const stageScope of stageScopes) {
        findings.push(...collectTreeProjectionFindingsForLandscape(landscape, filterId, stageScope))
      }
    }

    if (findings.length === 0) {
      void repoRelative(file)
    }
  }

  return findings
}
