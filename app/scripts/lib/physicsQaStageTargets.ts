// SPDX-License-Identifier: Apache-2.0
import { resolve } from 'node:path'
import type { SkillLandscape } from '../../src/landscapeTypes'
import {
  collectCompositionProjectionRoleGoalIds,
  normalizeCompositionView,
} from '../../src/utils/authoring/compositionViewAuthoring'

export const PHYSICS_QA_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
export const PHYSICS_QA_CANONICAL_PATH = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const mathOwner = '68a8ac50-f5f5-4e24-8aa9-5e408ca01ced'
export const PHYSICS_QA_STAGE_VIEWS = [
  { path: 'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-seki-physics.view.json', viewId: 'de-de-gym-seki-physics', stage: 'SekI' },
  { path: 'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-gk.view.json', viewId: 'de-de-gym-sekii-physics-gk', stage: 'SekII', courseProfile: 'GK' },
  { path: 'curricula/DE/Gymnasium/composition-views/physik/de-de-gym-sekii-physics-lk.view.json', viewId: 'de-de-gym-sekii-physics-lk', stage: 'SekII', courseProfile: 'LK' },
] as const

/** Every runtime source of this selector, including the role resolver's dependency. */
export const PHYSICS_QA_SELECTOR_INPUT_PATHS = [
  PHYSICS_QA_CANONICAL_PATH, mathPath, ...PHYSICS_QA_STAGE_VIEWS.map(view => view.path),
  'app/scripts/lib/physicsQaStageTargets.ts',
  'app/src/utils/authoring/compositionViewAuthoring.ts',
  'app/src/utils/authoring/canonicalAuthoring.ts',
] as const

export type PhysicsQaStage = 'SekI' | 'SekII'
const ensure: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`Physics QA stage targets: ${message}`)
}
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value)

/** No import-time repository reads or cached target sets: the caller owns the input snapshot. */
export function loadPhysicsQaStageTargets(repositoryRoot: string, readText: (path: string) => string) {
  const goals = new Map<string, SkillLandscape['goals'][number]>()
  const ownerByGoalId = new Map<string, string>()
  let physics!: SkillLandscape
  for (const [path, owner] of [[PHYSICS_QA_CANONICAL_PATH, PHYSICS_QA_LANDSCAPE_ID], [mathPath, mathOwner]]) {
    const landscape = JSON.parse(readText(resolve(repositoryRoot, path))) as SkillLandscape
    ensure(landscape.landscapeId === owner && Array.isArray(landscape.goals), `canonical owner/shape mismatch: ${path}`)
    if (owner === PHYSICS_QA_LANDSCAPE_ID) physics = landscape
    for (const goal of landscape.goals) {
      ensure(typeof goal.id === 'string' && goal.id.length > 0 && !goals.has(goal.id), `unknown or ambiguous canonical identity: ${goal.id}`)
      goals.set(goal.id, goal)
      ownerByGoalId.set(goal.id, owner)
    }
  }
  // Role expansion must not silently truncate a missing canonical descendant.
  for (const goal of goals.values()) for (const id of goal.contains ?? []) {
    ensure(goals.has(id), `unknown canonical child: ${goal.id}->${id}`)
  }
  const explicitTargetIdsByStage = new Map<PhysicsQaStage, Set<string>>([['SekI', new Set()], ['SekII', new Set()]])
  const allTargetIdsByStage = new Map<PhysicsQaStage, Set<string>>([['SekI', new Set()], ['SekII', new Set()]])
  for (const source of PHYSICS_QA_STAGE_VIEWS) {
    const raw = JSON.parse(readText(resolve(repositoryRoot, source.path))) as unknown
    ensure(record(raw) && raw.viewId === source.viewId && raw.landscapeId === PHYSICS_QA_LANDSCAPE_ID,
      `view identity/owner mismatch: ${source.path}`)
    const scope = raw.scope
    ensure(record(scope) && scope.schoolForm === 'Gymnasium' && scope.stage === source.stage
      && scope.courseProfile === ('courseProfile' in source ? source.courseProfile : undefined)
      && (scope.jurisdiction === undefined || scope.jurisdiction === 'DE') && scope.durationModel === undefined,
    `view stage/scope mismatch: ${source.path}`)
    ensure(Array.isArray(raw.rootNodes) && raw.rootNodes.length > 0, `missing view roots: ${source.path}`)
    const explicitTargets = new Set<string>()
    const visit = (nodes: unknown[]) => {
      for (const node of nodes) {
        ensure(record(node), `invalid view node: ${source.path}`)
        ensure(node.projectionRole === undefined || node.projectionRole === 'target' || node.projectionRole === 'prerequisiteOnly',
          `invalid projection role: ${source.path}`)
        if (node.kind === 'structure') {
          ensure(Array.isArray(node.children) && node.projectionRole === undefined, `invalid structure: ${source.path}`)
          visit(node.children)
        } else {
          ensure(node.kind === 'goalEntry' || node.kind === 'canonicalSubtree', `unsupported view reference: ${source.path}`)
          ensure(typeof node.goalId === 'string' && goals.has(node.goalId), `unknown view goal: ${String(node.goalId)}`)
          ensure(node.projectionRole === 'prerequisiteOnly' || ownerByGoalId.get(node.goalId) === PHYSICS_QA_LANDSCAPE_ID,
            `foreign target owner: ${node.goalId}`)
          if (node.kind === 'goalEntry' && node.projectionRole !== 'prerequisiteOnly') explicitTargets.add(node.goalId)
        }
      }
    }
    visit(raw.rootNodes)
    const view = normalizeCompositionView(raw)
    const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, goals)
    for (const id of roles.targetGoalIds) {
      ensure(ownerByGoalId.get(id) === PHYSICS_QA_LANDSCAPE_ID, `foreign resolved target owner: ${id}`)
      allTargetIdsByStage.get(source.stage)!.add(id)
      // An explicit goalEntry target overrides an inherited support role. A
      // prerequisiteOnly reference, including an opaque parent, grants no target.
      if (explicitTargets.has(id)) explicitTargetIdsByStage.get(source.stage)!.add(id)
    }
  }
  return { physics, explicitTargetIdsByStage, allTargetIdsByStage }
}
