// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import type { CompositionView, CompositionViewNode } from '../../src/utils/authoring/compositionViewAuthoring'

interface Material {
  schemaVersion?: number
  unit: { landscapeId: string; compositionNodeId: string; viewIds: string[]; orientationGoalId?: string }
}
interface Goal {
  id: string
  type?: unknown
  semanticKind?: unknown
  contains?: string[]
  requires?: string[]
  examData?: unknown
}
interface Landscape { landscapeId: string; goals: Goal[] }
const descendants = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap(node =>
  [node, ...(node.kind === 'structure' ? descendants(node.children) : [])])
const goalReference = (node: CompositionViewNode): string | undefined =>
  node.kind === 'goalEntry' || node.kind === 'canonicalSubtree' ? node.goalId : undefined

/** Every declared v2 introduction has one real own opening, first in each bound view. */
export function validateUnitMaterialOrientations(materials: readonly Material[], landscapes: readonly Landscape[],
  views: ReadonlyMap<string, CompositionView>): number {
  let checked = 0
  for (const material of materials) {
    if (material.schemaVersion !== 2) continue
    const { unit } = material
    const label = `Unit introduction ${unit.landscapeId}/${unit.compositionNodeId}`
    const id = unit.orientationGoalId
    assert(typeof id === 'string' && id.trim() === id && id, label + ': missing orientation goal')
    const owners = landscapes.filter(landscape => landscape.landscapeId === unit.landscapeId)
    assert.equal(owners.length, 1, label + ': missing or ambiguous own landscape')
    const goals = owners[0].goals.filter(goal => goal.id === id)
    assert.equal(goals.length, 1, label + ': opening must be a real goal of its own landscape')
    const opening = goals[0]
    assert(opening.type === 'atomic' && opening.semanticKind === 'orientation'
      && !(opening.contains?.length) && !(opening.requires?.length) && opening.examData == null,
    label + ': opening must be an atomic orientation without children, prerequisites or assessment')
    assert(Array.isArray(unit.viewIds) && unit.viewIds.length > 0
      && new Set(unit.viewIds).size === unit.viewIds.length, label + ': missing or repeated bound views')
    const byId = new Map(owners[0].goals.map(goal => [goal.id, goal]))
    for (const viewId of unit.viewIds) {
      const view = views.get(viewId)
      assert(view?.landscapeId === unit.landscapeId, label + ': missing own view ' + viewId)
      const nodes = descendants(view.rootNodes)
      const structures = nodes.filter(node => node.kind === 'structure' && node.id === unit.compositionNodeId)
      assert.equal(structures.length, 1, label + ': missing or ambiguous unit in ' + viewId)
      const children = (structures[0] as Extract<CompositionViewNode, { kind: 'structure' }>).children
      const first = children[0]
      assert(first && goalReference(first) === id && first.projectionRole !== 'prerequisiteOnly',
        label + ': own opening must be the first target child in ' + viewId)
      assert.equal(nodes.filter(node => goalReference(node) === id).length, 1,
        label + ': duplicate opening in ' + viewId)
      assert.equal(children.filter(node => byId.get(goalReference(node) ?? '')?.semanticKind === 'orientation').length, 1,
        label + ': a unit must have exactly one direct opening in ' + viewId)
    }
    checked++
  }
  return checked
}
