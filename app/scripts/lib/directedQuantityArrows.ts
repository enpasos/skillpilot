// SPDX-License-Identifier: Apache-2.0
import { createHash } from 'node:crypto'
import type { LearningGoal } from '../../src/landscapeTypes'

export const PHYSICS_ARROW_GOAL_ID = 'b77a7e93-22f9-5722-a4cc-f18a149ab030'
export const PHYSICS_LANDSCAPE_ID = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
export const DIRECTED_QUANTITY_ARROW_SCHEMA_PATH = 'contracts/curriculum-package/v2/curriculum-semantic-kind-ledger.schema.json'

export type ArrowRepresentationKind = 'spatialQuantityArrow' | 'fieldLineConvention' | 'displacementArrow'
  | 'circuitReference' | 'phasor' | 'formulaVector' | 'otherRepresentation' | 'none' | 'containedGoals'
export interface DirectedQuantityArrowDecision {
  usage: 'required' | 'notRequired' | 'children'
  representationKinds: ArrowRepresentationKind[]
  evidence: { path: string; sha256: string; entryId: string }
}
export interface DirectedQuantityArrowEvidenceRow {
  goalId: string
  contractFingerprint: string
  usage: DirectedQuantityArrowDecision['usage']
  representationKinds: ArrowRepresentationKind[]
  basis: string
  rationale: string
}
export interface DirectedQuantityArrowEvidence {
  schemaVersion: 1
  documentType: 'directed-quantity-arrow-decisions'
  sourceBindings: Array<{ path: string; sha256: string }>
  rows: DirectedQuantityArrowEvidenceRow[]
}

const ensure: (condition: unknown, message: string) => asserts condition = (condition, message) => {
  if (!condition) throw new Error(`Directed quantity arrows: ${message}`)
}
const digest = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b, 'en')).map(([key, item]) => [key, canonical(item)]))
  return value
}

/** The teaching/material contract, independent of graph edits and image pixels.
 * Unlike the existing semantic-kind fingerprint this deliberately excludes
 * requires and links. A new task or wording must receive a new usage decision.
 */
export function fingerprintDirectedQuantityArrowContract(goal: unknown): string {
  const source = goal as Record<string, unknown>
  const fields = ['id', 'type', 'nodeKind', 'title', 'titleEn', 'description', 'descriptionEn', 'contains', 'examData']
  return digest(`skillpilot:directed-quantity-arrow-contract:v1\n${JSON.stringify(canonical(Object.fromEntries(fields.filter(key => Object.hasOwn(source, key)).map(key => [key, source[key]]))))}`)
}

export function validateDirectedQuantityArrowEvidence(
  goals: readonly LearningGoal[],
  decisions: ReadonlyMap<string, DirectedQuantityArrowDecision>,
  readBytes: (path: string) => Buffer,
): void {
  const evidence = new Map<string, Map<string, DirectedQuantityArrowEvidenceRow>>()
  for (const goal of goals) {
    const decision = decisions.get(goal.id)
    ensure(decision, `missing usage marker for ${goal.id}`)
    const binding = decision.evidence
    ensure(binding && /^curricula\/DE\/Gymnasium\/quality\//u.test(binding.path) && !binding.path.includes('..'), `invalid evidence path for ${goal.id}`)
    const bytes = readBytes(binding.path)
    ensure(digest(bytes) === binding.sha256, `usage evidence hash mismatch for ${goal.id}`)
    let rows = evidence.get(binding.path)
    if (!rows) {
      const review = JSON.parse(bytes.toString('utf8')) as DirectedQuantityArrowEvidence
      ensure(review.schemaVersion === 1 && review.documentType === 'directed-quantity-arrow-decisions'
        && Array.isArray(review.rows) && Array.isArray(review.sourceBindings), `invalid usage evidence ${binding.path}`)
      for (const source of review.sourceBindings) {
        ensure(typeof source.path === 'string' && /^curricula\/DE\/Gymnasium\/quality\//u.test(source.path)
          && !source.path.includes('..'), `invalid review source in ${binding.path}`)
        ensure(digest(readBytes(source.path)) === source.sha256, `changed review source ${source.path}`)
      }
      rows = new Map(review.rows.map(row => [row.goalId, row]))
      ensure(rows.size === review.rows.length, `duplicate usage evidence entry in ${binding.path}`)
      evidence.set(binding.path, rows)
    }
    const row = rows.get(binding.entryId)
    ensure(row && row.goalId === goal.id, `missing individual usage evidence for ${goal.id}`)
    ensure(row.contractFingerprint === fingerprintDirectedQuantityArrowContract(goal), `stale teaching/material contract for ${goal.id}`)
    ensure(row.usage === decision.usage
      && JSON.stringify([...row.representationKinds].sort()) === JSON.stringify([...decision.representationKinds].sort()),
    `usage marker contradicts the reviewed contract for ${goal.id}`)
    ensure(typeof row.basis === 'string' && row.basis.trim().length > 0
      && typeof row.rationale === 'string' && row.rationale.trim().length > 0, `unreasoned usage decision for ${goal.id}`)
    const cluster = (goal.contains?.length ?? 0) > 0 || goal.type === 'cluster'
    ensure(cluster === (decision.usage === 'children'), `clusters are judged at their children: ${goal.id}`)
    ensure(decision.usage !== 'required' || decision.representationKinds.includes('spatialQuantityArrow'), `required use without quantity-arrow classification for ${goal.id}`)
  }
}

export function auditDirectedQuantityArrowRoutes(
  goals: readonly LearningGoal[],
  decisions: ReadonlyMap<string, DirectedQuantityArrowDecision>,
  arrowGoalId = PHYSICS_ARROW_GOAL_ID,
) {
  const byId = new Map(goals.map(goal => [goal.id, goal]))
  const localId = (reference: string) => byId.has(reference) ? reference : reference.split(':').at(-1)!
  const pathToArrowGoal = (id: string): string[] | null => {
    const queue = [[id]]
    const seen = new Set<string>()
    while (queue.length) {
      const path = queue.shift()!
      const current = path.at(-1)!
      if (current === arrowGoalId) return path
      if (seen.has(current)) continue
      seen.add(current)
      const goal = byId.get(current)
      if (!goal || goal.type === 'cluster' || goal.contains?.length) continue
      for (const requirement of goal.requires ?? []) queue.push([...path, localId(requirement)])
    }
    return null
  }
  const required = [...decisions].filter(([, decision]) => decision.usage === 'required')
  const paths = required.map(([goalId]) => ({ goalId, path: pathToArrowGoal(goalId) }))
  return {
    rule: 'directed-quantity-arrows-v1',
    arrowGoalId,
    markedGoals: required.length,
    clusterDecisions: [...decisions.values()].filter(decision => decision.usage === 'children').length,
    passingGoals: paths.filter(row => row.path).length,
    findings: paths.filter(row => !row.path).map(row => ({ goalId: row.goalId, message: 'No authored atomic requires path to the directed-quantity-arrow goal.' })),
    paths,
  }
}
