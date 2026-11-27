import type { GoalPlacementContext } from '../../src/landscapeTypes'

// Preservation helpers retain authored JSON, including unrelated metadata.
// Fields are optional because structure and goal-reference nodes differ.
export interface PhysicsPlacementNode extends Record<string, unknown> {
  kind: string
  id?: string
  goalId?: string
  projectionRole?: 'target' | 'prerequisiteOnly'
  children?: PhysicsPlacementNode[]
}

export interface PhysicsPlacementView extends Record<string, unknown> {
  scope: GoalPlacementContext
  rootNodes: PhysicsPlacementNode[]
}
