// SPDX-License-Identifier: Apache-2.0
/** Static diagnosis on declared plans. This reports stage order, not source
 * fidelity, assessment quality, learner mastery or complete plan acceptance. */
import {
  deriveStagePlanPreparation, validateStagePlanCatalog,
  type StagePlan, type StagePlanCatalog, type StagePlanFinding, type StagePlanGoal,
} from './stagePlan'

export interface StagePlanBackflow {
  fromGoalId: string
  requiredGoalId: string
  fromUnitId: string
  requiredUnitId: string
  witnessPath: string[]
}
export interface StagePlanScopeDiagnosis {
  planId: string
  jurisdiction: string
  durationModel: string
  /** Profiles are selected independently for each subject. */
  subjectSelections: StagePlan['subjectViews']
  units: { id: string; stage: string; after: string[]; targetCount: number; preparationCount: number }[]
  targetCount: number
  learningBasisCount: number
  preparation: { goalId: string; planUnitId: string; witnessPath: string[] }[]
  directBackflows: StagePlanBackflow[]
  /** One shortest checked path per early seed and later required atom. */
  transitiveBackflows: StagePlanBackflow[]
}
export interface StagePlanDiagnosis {
  contract: 'declared-stage-plan-diagnosis-v1'
  status: 'invalid-input' | 'backflows-present' | 'no-stage-backflows'
  findings: StagePlanFinding[]
  scopes: StagePlanScopeDiagnosis[]
}
const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
const atomic = (goal: StagePlanGoal) => goal.type !== 'cluster' && !goal.contains?.length

/** All full subject-profile combinations dominate the corresponding subject
 * subsets: removing a seed can turn it into preparation, but cannot introduce
 * a later authored placement. No synthetic GK/LK lockstep is assumed. */
function selections(plan: StagePlan): StagePlan['subjectViews'][] {
  const subjects = new Map<string, StagePlan['subjectViews']>()
  for (const authority of plan.subjectViews) {
    const entries = subjects.get(authority.landscapeId) ?? []
    entries.push(authority); subjects.set(authority.landscapeId, entries)
  }
  let combinations: StagePlan['subjectViews'][] = [[]]
  for (const id of [...subjects.keys()].sort(compare)) {
    const variants = [...subjects.get(id)!].sort((a, b) => compare(a.courseProfile, b.courseProfile) || compare(a.viewId, b.viewId))
    combinations = combinations.flatMap(current => variants.map(variant => [...current, variant]))
  }
  return combinations
}

export function diagnoseStagePlanLearningFlow(catalog: StagePlanCatalog): StagePlanDiagnosis {
  const validated = validateStagePlanCatalog(catalog)
  const findings = [...validated.findings]
  const result: StagePlanDiagnosis = { contract: 'declared-stage-plan-diagnosis-v1', status: 'invalid-input', findings, scopes: [] }
  if (!catalog.plans.length) findings.push({ code: 'SPR-INVENTORY', path: 'plans', message: 'An empty plan inventory is not a successful stage-order check.' })
  if (findings.length) return result

  const goals = new Map([...catalog.goals.values()].map(goal => [goal.id, goal]))
  const requires = new Map<string, string[]>(), contains = new Map<string, string[]>()
  if (!goals.size) findings.push({ code: 'SPR-INVENTORY', path: 'goals', message: 'An empty canonical catalog cannot establish stage order.' })
  // Check the complete supplied graph, including atoms outside selected views.
  // A missing prerequisite never becomes an implicit leaf or a waived demand.
  for (const goal of goals.values()) {
    if (!goal.id || (goal.type !== undefined && goal.type !== 'atomic' && goal.type !== 'cluster')
      || (goal.contains !== undefined && !Array.isArray(goal.contains))
      || (goal.requires !== undefined && !Array.isArray(goal.requires))
      || (goal.type === 'atomic' && goal.contains?.length)) {
      findings.push({ code: 'SPR-GRAPH', path: goal.id, message: 'Canonical goal identity, explicit type and graph arrays must be consistent.' })
      continue
    }
    const children: string[] = []
    for (const reference of goal.contains ?? []) {
      const child = catalog.goals.get(reference)
      if (!child) findings.push({ code: 'SPR-GRAPH', path: `${goal.id}.contains`, message: `Unknown canonical child ${reference}.` })
      else children.push(child.id)
    }
    contains.set(goal.id, [...new Set(children)].sort(compare))
    const ids: string[] = []
    for (const reference of goal.requires ?? []) {
      const required = catalog.goals.get(reference)
      if (!atomic(goal) || !required || !atomic(required)) {
        findings.push({ code: 'SPR-GRAPH', path: `${goal.id}.requires`, message: `Prerequisite ${reference} must join canonical atomic goals.` })
      } else ids.push(required.id)
    }
    requires.set(goal.id, [...new Set(ids)].sort(compare))
  }
  if (findings.length) return result
  const checkCycles = (edges: Map<string, string[]>, relation: string) => {
    const active = new Set<string>(), complete = new Set<string>()
    const visit = (id: string) => {
      if (active.has(id)) { findings.push({ code: 'SPR-GRAPH', path: id, message: `Cycle in canonical ${relation}.` }); return }
      if (complete.has(id)) return
      active.add(id)
      for (const next of edges.get(id) ?? []) visit(next)
      active.delete(id); complete.add(id)
    }
    for (const id of [...goals.keys()].sort(compare)) visit(id)
  }
  checkCycles(requires, 'requires'); checkCycles(contains, 'contains')
  if (findings.length) return result
  const orderedGoals = new Map([...goals].map(([id, goal]) => [id, { ...goal, requires: requires.get(id)! }]))
  const orderedAliases = new Map([...catalog.goals].map(([alias, goal]) => [alias, orderedGoals.get(goal.id)!]))

  for (const plan of [...validated.plansById.values()].sort((a, b) => compare(a.planId, b.planId))) {
    const rank = new Map(plan.rootUnit.children.map((id, index) => [id, index]))
    for (const selected of selections(plan)) {
      const targets = new Map<string, string>()
      for (const subject of selected) {
        for (const [id, unit] of validated.placementsByViewId.get(subject.viewId)!) targets.set(id, unit)
      }
      const orderedTargets = new Map([...targets].sort(([a], [b]) => compare(a, b)))
      if (!orderedTargets.size) {
        findings.push({ code: 'SPR-INVENTORY', path: plan.planId, message: 'A declared profile combination has no atomic targets to check.' })
        continue
      }
      const derived = deriveStagePlanPreparation(plan, orderedTargets, orderedAliases)
      const structural = derived.findings.filter(finding => finding.code !== 'SP-BACKFLOW')
      if (structural.length) { findings.push(...structural); continue }
      const preparation = derived.preparations.sort((a, b) => compare(a.goalId, b.goalId))
      const placements = new Map([...orderedTargets, ...preparation.map(item => [item.goalId, item.planUnitId] as const)])
      const backflow = (from: string, to: string, path: string[]): StagePlanBackflow => ({
        fromGoalId: from, requiredGoalId: to,
        fromUnitId: placements.get(from)!, requiredUnitId: placements.get(to)!, witnessPath: path,
      })
      const isLater = (from: string, to: string) => rank.get(placements.get(from)!)! < rank.get(placements.get(to)!)!
      const directBackflows: StagePlanBackflow[] = [], transitiveBackflows: StagePlanBackflow[] = []
      for (const [id] of [...placements].sort(([a], [b]) => compare(a, b))) {
        for (const required of requires.get(id)!) {
          if (!placements.has(required)) {
            findings.push({ code: 'SPR-CLOSURE', path: id, message: `Necessary atom ${required} has no learning placement.` })
          } else if (isLater(id, required)) directBackflows.push(backflow(id, required, [id, required]))
        }
      }
      for (const [seed] of orderedTargets) {
        const seen = new Set([seed]), queue: string[][] = [[seed]]
        for (let index = 0; index < queue.length; index++) {
          const path = queue[index], current = path[path.length - 1]
          for (const required of requires.get(current)!) {
            if (seen.has(required)) continue
            seen.add(required)
            const nextPath = [...path, required]
            if (placements.has(required) && isLater(seed, required)) transitiveBackflows.push(backflow(seed, required, nextPath))
            queue.push(nextPath)
          }
        }
      }
      result.scopes.push({
        planId: plan.planId, jurisdiction: plan.scope.jurisdiction, durationModel: plan.scope.durationModel,
        subjectSelections: selected.map(subject => ({ ...subject })),
        units: plan.rootUnit.children.map(id => {
          const unit = plan.units.find(candidate => candidate.id === id)!
          return { id, stage: unit.stage, after: [...unit.after],
            targetCount: [...orderedTargets.values()].filter(value => value === id).length,
            preparationCount: preparation.filter(item => item.planUnitId === id).length }
        }),
        targetCount: orderedTargets.size, learningBasisCount: placements.size, preparation,
        directBackflows, transitiveBackflows,
      })
    }
  }
  if (findings.length) { result.scopes = []; return result }
  result.status = result.scopes.some(scope => scope.directBackflows.length || scope.transitiveBackflows.length)
    ? 'backflows-present' : 'no-stage-backflows'
  return result
}
