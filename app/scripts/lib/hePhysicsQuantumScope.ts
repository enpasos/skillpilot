/** HE KC2024 p42, Q3.3: hydrogen-like energies and Pauli are LK-only.
 * These are jurisdiction-specific exclusions, not a policy for BB/BE templates.
 */
export const HE_LK_ONLY_QUANTUM_GOAL_IDS = [
  'bacae732-2016-5a83-bc61-d0f94ed5a0e4',
  'badb0ef3-233d-560e-bc2a-9df99f09fe7d',
] as const

type ViewNode = {
  kind?: string
  id?: string
  goalId?: string
  projectionRole?: string
  children?: ViewNode[]
}

// Called only on the mutable HE template clone, before its jurisdiction changes.
// Preserve every other exclusion, placement and property in the target template.
export function stripHeQuantumOverridesFromClonedView(view: { rootNodes?: ViewNode[] }) {
  const ids = new Set<string>(HE_LK_ONLY_QUANTUM_GOAL_IDS)
  const visit = (nodes: ViewNode[]) => nodes.forEach((node) => {
    if (node.kind === 'structure' && node.id === 'physics-q3') {
      node.children = (node.children ?? []).filter((child) => !(
        child.kind === 'goalEntry'
        && child.projectionRole === 'prerequisiteOnly'
        && ids.has(child.goalId ?? '')
      ))
    }
    visit(node.children ?? [])
  })
  visit(view.rootNodes ?? [])
}
