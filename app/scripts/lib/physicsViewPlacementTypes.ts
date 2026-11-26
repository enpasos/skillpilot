import type { GoalPlacementContext } from '../../src/landscapeTypes'
import type { CompositionProjectionRole } from '../../src/utils/authoring/compositionViewAuthoring'

// Preservation helpers retain authored JSON, including unrelated metadata.
// Fields are optional because structure and goal-reference nodes differ.
export interface PhysicsPlacementNode extends Record<string, unknown> {
  kind: string
  id?: string
  goalId?: string
  projectionRole?: CompositionProjectionRole
  children?: PhysicsPlacementNode[]
}

export interface PhysicsPlacementView extends Record<string, unknown> {
  scope: GoalPlacementContext
  rootNodes: PhysicsPlacementNode[]
}
