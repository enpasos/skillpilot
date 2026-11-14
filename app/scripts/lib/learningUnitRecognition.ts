// SPDX-License-Identifier: Apache-2.0
/**
 * Recognition of own goals through valid local contracts (Graph Definition §13.2 and §13.4).
 *
 *   N_U   = Reach*(P_U \ M)            open demand: open own assessment and memory goals with all they require
 *   I_U   = Own(U) \ (M ∪ P_U ∪ N_U)   implicit set of the unit
 *   M_eff = M ∪ ⋃ I_U                  over every eligible unit
 *   Complete(U) ⇔ Own(U) ⊆ M_eff and every required child unit is complete
 *
 * A unit is eligible when the validator finds it structurally valid (R1, R3, R4
 * and structure) and its reviewed coverage is complete (R2). Demand follows the
 * normative prerequisite relation through explicitly mastered intermediate goals
 * and beyond the unit and the subject.
 *
 * This is the reference evaluation for the shared conformance cases and for
 * review tooling; the backend owns recognition at runtime. R5, the binding of
 * a result to the contract state it was achieved under, is runtime state and
 * not modelled here: every explicit result counts as bound to the current contract.
 */
import { UnitGraph, type AtomicGoalKind, type UnitValidationResult } from './learningUnitContracts'

export interface UnitRecognition {
  landscapeId: string
  unitId: string
  /** Structurally valid with complete reviewed coverage; only an eligible unit recognizes goals. */
  eligible: boolean
  /** I_U as goal IDs, sorted; empty unless the unit is eligible. */
  recognized: string[]
  /** Own unprotected goals that are neither explicit nor recognized because an open own protected goal requires them. */
  demanded: string[]
  /** Complete(U); null when the unit or a required child is structurally invalid. */
  complete: boolean | null
}

export interface RecognitionResult {
  /** M_eff as goal keys `landscapeId:goalId`, sorted. */
  effective: string[]
  units: UnitRecognition[]
}

const protectedKinds: ReadonlySet<AtomicGoalKind> = new Set(['assessment', 'memory'])
const byCodeUnit = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0
const idOf = (key: string): string => key.slice(key.indexOf(':') + 1)

/**
 * Derives M_eff and the per-unit recognition from explicit results.
 * `explicitKeys` holds the goal keys (`landscapeId:goalId`) with an explicit result of 1.
 */
export function deriveRecognition(
  graph: UnitGraph, validation: UnitValidationResult, explicitKeys: ReadonlySet<string>,
): RecognitionResult {
  const summaries = new Map(validation.units.map((summary) => [`${summary.landscapeId}:${summary.unitId}`, summary]))
  const units = validation.catalogs.flatMap((catalog) => catalog.units.map((unit) => {
    const key = `${catalog.landscapeId}:${unit.id}`, summary = summaries.get(key)!
    return {
      key, landscapeId: catalog.landscapeId, unit, valid: summary.structurallyValid,
      eligible: summary.structurallyValid && summary.goalsWithoutReviewedCoverage.length === 0,
      // A valid unit's own goals all resolve to single-kind atoms of its landscape.
      own: summary.structurallyValid
        ? unit.ownGoalIds.map((goalId) => `${catalog.landscapeId}:${goalId}`) : [],
    }
  }))

  const effective = new Set(explicitKeys)
  const implicit = new Map<string, Set<string>>(), demanded = new Map<string, Set<string>>()
  for (const entry of units) {
    const open = entry.own.filter((key) => protectedKinds.has(graph.kind(key)) && !explicitKeys.has(key))
    // Reflexive reach: the open protected goals and everything they require, through mastered goals too.
    const demand = new Set(open.flatMap((key) => [key, ...graph.reach(key)]))
    const unprotected = entry.own.filter((key) => !protectedKinds.has(graph.kind(key)) && !explicitKeys.has(key))
    const released = entry.eligible ? unprotected.filter((key) => !demand.has(key)) : []
    implicit.set(entry.key, new Set(released))
    demanded.set(entry.key, new Set(unprotected.filter((key) => demand.has(key))))
    for (const key of released) effective.add(key)
  }

  // Completion is recursive over the required children. The placeholder ends a
  // hierarchy cycle; the validator has already marked every unit on it invalid.
  const byKey = new Map(units.map((entry) => [entry.key, entry]))
  const completion = new Map<string, boolean | null>()
  const complete = (key: string): boolean | null => {
    if (completion.has(key)) return completion.get(key)!
    completion.set(key, null)
    const entry = byKey.get(key)!
    if (!entry.valid) return null
    let result: boolean | null = entry.own.every((goal) => effective.has(goal))
    for (const childId of entry.unit.childUnitIds) {
      const child = complete(`${entry.landscapeId}:${childId}`)
      if (child === null) result = null
      else if (result !== null) result = result && child
    }
    completion.set(key, result)
    return result
  }

  return {
    effective: [...effective].sort(byCodeUnit),
    units: units.map((entry) => ({
      landscapeId: entry.landscapeId, unitId: entry.unit.id, eligible: entry.eligible,
      recognized: [...implicit.get(entry.key)!].map(idOf).sort(byCodeUnit),
      demanded: [...demanded.get(entry.key)!].map(idOf).sort(byCodeUnit),
      complete: complete(entry.key),
    })),
  }
}
