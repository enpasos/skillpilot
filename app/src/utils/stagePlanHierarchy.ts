// SPDX-License-Identifier: Apache-2.0
/** The declared temporal hierarchy, never an order inferred from labels or goal phases. */
import type { StagePlan } from './stagePlan'

export function stagePlanChildren(plan: StagePlan, unitId: string): readonly string[] {
  return unitId === plan.rootUnit.id ? plan.rootUnit.children : plan.units.find(unit => unit.id === unitId)?.children ?? []
}

export function stagePlanUnitIds(plan: StagePlan, roots: readonly string[] = plan.rootUnit.children): string[] {
  const result: string[] = [], seen = new Set<string>()
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id); result.push(id)
    stagePlanChildren(plan, id).forEach(visit)
  }
  roots.forEach(visit)
  return result
}

/** Validation establishes the explicit sibling chains before this order is consumed. */
export function stagePlanLeafOrder(plan: StagePlan): Map<string, number> {
  return new Map(stagePlanUnitIds(plan).filter(id => !stagePlanChildren(plan, id).length).map((id, index) => [id, index]))
}
