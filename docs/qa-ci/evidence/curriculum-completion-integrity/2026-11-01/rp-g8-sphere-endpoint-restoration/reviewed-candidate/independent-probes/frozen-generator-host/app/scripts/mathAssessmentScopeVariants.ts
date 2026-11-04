import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { collectCompositionProjectionRoleGoalIds, type CompositionViewNode } from '../src/utils/authoring/compositionViewAuthoring'

type View = { viewId: string; rootNodes: CompositionViewNode[] }

const registryPath = 'app/scripts/config/math-completion-assessment-variants.json'

/** Apply an explicit authored view selection; never infer enrollment from requires. */
export function applyReviewedMathAssessmentVariants<T extends View>(
  view: T,
  goalById: Parameters<typeof collectCompositionProjectionRoleGoalIds>[1],
  repositoryRoot: string,
): T {
  const registry = JSON.parse(readFileSync(resolve(repositoryRoot, registryPath), 'utf8')) as {
    schemaVersion: number; selections: Array<{ selectionPath: string; status: string; contentReviewPath: string }>
  }
  if (registry.schemaVersion !== 1) throw new Error('Unknown Mathematics assessment variant registry')
  let result = view
  for (const entry of registry.selections) {
    if (!['content-reviewed-placement-pending', 'independent-ai-reviewed'].includes(entry.status)) {
      throw new Error('Mathematics assessment variant selection needs its exact content review')
    }
    const review = JSON.parse(readFileSync(resolve(repositoryRoot, entry.contentReviewPath), 'utf8')) as { verdict: string }
    if (review.verdict !== 'PASS') throw new Error('Mathematics assessment variant content review is not PASS')
    result = applySelection(result, goalById, repositoryRoot, entry.selectionPath)
  }
  return result
}

function applySelection<T extends View>(
  view: T,
  goalById: Parameters<typeof collectCompositionProjectionRoleGoalIds>[1],
  repositoryRoot: string,
  selectionPath: string,
): T {
  const selection = JSON.parse(readFileSync(resolve(repositoryRoot, selectionPath), 'utf8')) as {
    schemaVersion: number; status: string; variantGoalId: string; originalGoalId: string; targetViewIds: string[]
  }
  if (selection.schemaVersion !== 1 || !goalById.has(selection.variantGoalId)) throw new Error('Missing canonical assessment variant')
  const selected = selection.targetViewIds.includes(view.viewId)
  const result = structuredClone(view)
  if (selected) {
    // Base views deliberately exclude the variant. A reviewed duration-specific
    // replacement removes only that exclusion and retains its shared year folder.
    const restore = (nodes: CompositionViewNode[]): CompositionViewNode[] => nodes.flatMap((node) => {
      if (node.kind === 'structure') return [{ ...node, children: restore(node.children) }]
      if (node.kind !== 'landscapeEntry' && node.goalId === selection.variantGoalId
        && node.projectionRole === 'prerequisiteOnly') return []
      return [node]
    })
    result.rootNodes = restore(result.rootNodes)
  }
  const roles = collectCompositionProjectionRoleGoalIds(result.rootNodes, goalById)
  if (selected && !roles.targetGoalIds.has(selection.variantGoalId)) {
    throw new Error(`${view.viewId}: selected assessment variant is missing from its authored year folder`)
  }
  const deniedId = selected ? selection.originalGoalId : selection.variantGoalId
  if (!roles.targetGoalIds.has(deniedId)) return result
  result.rootNodes.push({ kind: 'goalEntry', goalId: deniedId, projectionRole: 'prerequisiteOnly' })
  return result
}
