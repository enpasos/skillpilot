// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'

interface Node {
  kind: string
  id?: string
  goalId?: string
  children?: Node[]
}
interface Operation {
  parentId: string | null
  index: number
  deleteCount: number
  insertNodeKeys: string[]
}
interface ViewRepair {
  fileName: string
  viewId: string
  generatedSha256: string
  resultSha256: string
  operations: Operation[]
}
export interface MathDurationStagePlacementPolicy {
  schemaVersion: number
  canonicalSha256WithoutLearningUnitLayer: string
  nodes: Record<string, Node>
  views: ViewRepair[]
  /** Authored inputs before the generic source-stage presentation transform.
   * Kept separately from generated outputs so replay never reads its own output. */
  baseViews?: Record<string, unknown>
}

export const mathDurationViewSha256 = (value: unknown): string => createHash('sha256')
  .update(`${JSON.stringify(value, null, 2)}\n`).digest('hex')

/**
 * Replay the authored stage/assessment placements from the separately retained
 * policy, never from the output being checked. Both the ordinary generator result
 * and the repaired result are pinned. The usual goal-set, prerequisite and
 * composition checks still validate the repaired tree before comparing/writing it.
 */
export function replayMathDurationStagePlacements<T extends { viewId: string; rootNodes: unknown[] }>(
  view: T,
  fileName: string,
  canonicalSha256: string,
  policy: MathDurationStagePlacementPolicy,
): T {
  if (policy.schemaVersion !== 1 || policy.canonicalSha256WithoutLearningUnitLayer !== canonicalSha256) {
    throw new Error('Invalid Mathematics duration stage-placement policy input')
  }
  const entries = policy.views.filter(entry => entry.fileName === fileName)
  if (entries.length !== 1 || entries[0].viewId !== view.viewId) {
    throw new Error(`Missing or duplicate Mathematics duration stage-placement policy: ${fileName}`)
  }
  const repair = entries[0]
  if (mathDurationViewSha256(view) !== repair.generatedSha256) {
    throw new Error(`Unexpected Mathematics duration generation before stage placements: ${fileName}`)
  }
  const result = structuredClone(view)
  for (const operation of repair.operations) {
    const rootNodes = result.rootNodes as Node[]
    const parents: Node[] = []
    const visit = (nodes: Node[]): void => {
      for (const node of nodes) {
        if (node.kind !== 'structure') continue
        if (node.id === operation.parentId) parents.push(node)
        visit(node.children ?? [])
      }
    }
    if (operation.parentId !== null) visit(rootNodes)
    if (operation.parentId !== null && parents.length !== 1) {
      throw new Error(`Invalid stage-placement parent ${operation.parentId} in ${fileName}`)
    }
    const children = operation.parentId === null ? rootNodes : parents[0].children!
    if (!Number.isInteger(operation.index) || !Number.isInteger(operation.deleteCount)
      || operation.index < 0 || operation.deleteCount < 0
      || operation.index + operation.deleteCount > children.length) {
      throw new Error(`Invalid stage-placement splice in ${fileName}`)
    }
    const nodes = operation.insertNodeKeys.map(key => {
      if (!Object.hasOwn(policy.nodes, key)) throw new Error(`Unknown stage-placement node ${key}`)
      return structuredClone(policy.nodes[key])
    })
    children.splice(operation.index, operation.deleteCount, ...nodes)
  }
  if (mathDurationViewSha256(result) !== repair.resultSha256) {
    throw new Error(`Unexpected Mathematics duration stage-placement result: ${fileName}`)
  }
  return result
}
