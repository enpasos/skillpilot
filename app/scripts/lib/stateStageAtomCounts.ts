import { readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { convertLearningGoal } from '../../src/goalTypes'
import type { SkillLandscape } from '../../src/landscapeTypes'
import { goalMatchesFilters } from '../../src/utils/goalFilters'
import {
  collectCompositionProjectionRoleGoalIds,
  getCompositionProjectionRole,
  normalizeCompositionView,
  type CompositionViewNode,
} from '../../src/utils/authoring/compositionViewAuthoring'

export type StageCountScope = {
  jurisdiction: string
  stage: 'SekI' | 'SekII'
  courseProfile?: 'GK' | 'LK'
  durationModel?: string
}

let canonicalOwners: Map<string, string> | undefined
function canonicalOwner(goalId: string): string | undefined {
  if (!canonicalOwners) {
    canonicalOwners = new Map()
    const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../../../curricula/DE/Gymnasium/canonical')
    for (const file of readdirSync(directory).filter(name => name.endsWith('.json'))) {
      const source = JSON.parse(readFileSync(resolve(directory, file), 'utf8')) as SkillLandscape
      for (const goal of source.goals) canonicalOwners.set(goal.id, source.landscapeId)
    }
  }
  return canonicalOwners.get(goalId)
}

/** Count canonical subject target atoms, not synthetic leaves, preparation,
 * mastery, source claims, or the sum of overlapping optional track counts. */
export function countStageTargetAtoms(
  landscape: SkillLandscape,
  rawView: unknown,
  scope: StageCountScope,
): Set<string> {
  const view = normalizeCompositionView(rawView)
  if (view.landscapeId !== landscape.landscapeId) throw new Error(`Wrong landscape for ${view.viewId}`)
  if (view.viewFormatVersion && !['1.0', '1.2'].includes(String(view.viewFormatVersion))) {
    throw new Error(`Unsupported composition-view format ${String(view.viewFormatVersion)}`)
  }
  const goals = new Map(landscape.goals.map(goal => [goal.id, convertLearningGoal(goal)]))
  const { targetGoalIds } = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
  const selected: CompositionViewNode[] = []
  const stageLabel = scope.stage === 'SekI' ? /^Sekundarstufe I(?:$|\s|\()/u : /^Sekundarstufe II(?:$|\s|\()/u
  const findStage = (nodes: CompositionViewNode[]) => {
    for (const node of nodes) {
      if (node.kind !== 'structure') continue
      if (stageLabel.test(node.label)) selected.push(node)
      else findStage(node.children)
    }
  }
  findStage(view.rootNodes)
  if (selected.length === 0) {
    if (view.scope.stage === scope.stage) selected.push(...view.rootNodes)
    else throw new Error(`Stage ${scope.stage} not declared in ${view.viewId}`)
  }
  const atoms = new Set<string>()
  const visited = new Set<string>()
  const filters = [scope.jurisdiction, scope.courseProfile, scope.durationModel]
    .filter((value): value is string => !!value)
  const expand = (goalId: string) => {
    if (visited.has(goalId)) return
    visited.add(goalId)
    const goal = goals.get(goalId)
    if (!goal) {
      if (targetGoalIds.has(goalId)) {
        const owner = canonicalOwner(goalId)
        if (!owner || owner === landscape.landscapeId) throw new Error(`Unresolved target ${goalId} in ${view.viewId}`)
      }
      return // Foreign support is outside this subject's target count.
    }
    if (goal.contains.length > 0) {
      goal.contains.forEach(expand)
    } else if (goal.type !== 'cluster' && targetGoalIds.has(goalId) && goalMatchesFilters(goal, filters)) {
      atoms.add(goalId)
    }
  }
  const walk = (node: CompositionViewNode) => {
    if (node.kind === 'structure') node.children.forEach(walk)
    else if ((node.kind === 'canonicalSubtree' || node.kind === 'goalEntry')
      && getCompositionProjectionRole(node) === 'target') expand(node.goalId)
  }
  selected.forEach(walk)
  return atoms
}

export function countStageTargetAtomsFromFile(
  landscape: SkillLandscape,
  viewPath: string,
  scope: StageCountScope,
): number {
  return countStageTargetAtoms(landscape, JSON.parse(readFileSync(viewPath, 'utf8')), scope).size
}

/** Bind a retained count snapshot to source bytes rather than a tracker date. */
export function stageCountSourceBinding(landscapePath: string, viewDirectory: string, repoRoot: string) {
  const digest = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')
  const inventory = (directory: string, suffix: string) => {
    const files = readdirSync(directory).filter(name => name.endsWith(suffix)).sort()
    return { files: files.length, sha256: createHash('sha256')
      .update(files.map(name => `${name}:${digest(resolve(directory, name))}\n`).join('')).digest('hex') }
  }
  return {
    canonicalLandscapeSha256: digest(resolve(repoRoot, landscapePath)),
    compositionViewInventory: inventory(viewDirectory, '.view.json'),
    canonicalCatalogInventory: inventory(resolve(repoRoot, 'curricula/DE/Gymnasium/canonical'), '.json'),
  }
}
