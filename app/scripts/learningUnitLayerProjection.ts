// SPDX-License-Identifier: Apache-2.0
// The landscape without its learning-unit layer: the one TypeScript definition of
// the projection that `scripts/curriculum_learning_units.py`
// (`project_out_learning_units`) applies for package contracts 1.0 and 1.1.
//
// A learning unit is an orthogonal placement layer: `programUnits` entries of kind
// `learningUnit` (their coverage reviews leave with them), `goalPlacements` of
// relation `own` or towards a learning unit, and the top-level
// `learningUnitCoverage`. Evidence about goals, edges and assessments binds the
// projected landscape, so it stays valid when only that layer changes and still
// goes stale when anything else changes. Goal objects are never touched.
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const projectionModulePath = fileURLToPath(import.meta.url)
const projectionModuleBytes = readFileSync(projectionModulePath)
/** The prerequisite-reduction proof fingerprints through this module; an edit after load is fatal there. */
export function assertLearningUnitProjectionImplementationCurrent(): void {
  if (!readFileSync(projectionModulePath).equals(projectionModuleBytes))
    throw new Error('Learning-unit projection implementation changed since module load')
}

export const LEARNING_UNIT_KIND = 'learningUnit'
export const OWN_RELATION = 'own'

export class LearningUnitProjectionError extends Error {}

type JsonObject = Record<string, unknown>
const object = (value: unknown): value is JsonObject =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
const isLearningUnit = (unit: unknown): unit is JsonObject => object(unit) && unit.kind === LEARNING_UNIT_KIND

/** Python `dict.get` semantics: an absent field and JSON null are the same key. */
function reference(value: unknown): string | null {
  return value === undefined ? null : value as string | null
}

/** A learning unit's own ID is a string; anything else cannot be projected reliably. */
function learningUnitIdentifier(unit: JsonObject): string | null {
  const id = reference(unit.id)
  if (id !== null && typeof id !== 'string')
    throw new LearningUnitProjectionError(`Learning unit ID must be a string, found ${JSON.stringify(unit.id)}`)
  return id
}

/** True when the landscape carries any learning-unit field. */
export function hasLearningUnitLayer(landscape: unknown): boolean {
  if (!object(landscape)) return false
  if (Object.hasOwn(landscape, 'learningUnitCoverage')) return true
  if (Array.isArray(landscape.programUnits) && landscape.programUnits.some(isLearningUnit)) return true
  return Array.isArray(landscape.goalPlacements)
    && landscape.goalPlacements.some(item => object(item) && item.relation === OWN_RELATION)
}

/**
 * Return the landscape as it reads without its learning-unit layer; the input is not
 * modified. A list that becomes empty only because of the projection is removed, so
 * the result equals the landscape as authored before its first learning unit. A
 * calendar unit below a learning unit cannot be projected and fails closed. A value
 * that is not a JSON object is returned unchanged.
 */
export function projectOutLearningUnits<T>(landscape: T): T {
  if (!object(landscape)) return landscape
  const result: JsonObject = structuredClone(landscape)
  delete result.learningUnitCoverage
  const units = result.programUnits
  const learningUnitIds = new Set<string | null>()
  if (Array.isArray(units)) {
    for (const unit of units) if (isLearningUnit(unit)) learningUnitIds.add(learningUnitIdentifier(unit))
    const kept = units.filter(unit => !isLearningUnit(unit))
    for (const unit of kept) {
      if (object(unit) && learningUnitIds.has(reference(unit.parentUnitId) as string | null))
        throw new LearningUnitProjectionError(
          `Program unit ${String(unit.id)} of kind ${String(unit.kind)} cannot have a learning-unit parent`)
    }
    if (kept.length > 0 || units.length === 0) result.programUnits = kept
    else delete result.programUnits
  }
  const placements = result.goalPlacements
  if (Array.isArray(placements)) {
    const kept = placements.filter(item => !(object(item) && (item.relation === OWN_RELATION
      || learningUnitIds.has(reference(item.unitId) as string | null))))
    if (kept.length > 0 || placements.length === 0) result.goalPlacements = kept
    else delete result.goalPlacements
  }
  return result as T
}

/**
 * SHA-256 (hex) of a canonical landscape file as it reads without its learning-unit
 * layer, for raw-file pins whose subject is goal content. Without a learning-unit
 * layer this is exactly the SHA-256 of the file bytes, so existing pins stay valid.
 * With one, the file must be in the repository serialization (two-space JSON plus a
 * final newline) and the projected document is hashed in that serialization;
 * anything else fails closed.
 */
export function sha256WithoutLearningUnitLayer(bytes: Buffer): string {
  const hash = (data: Buffer | string) => createHash('sha256').update(data).digest('hex')
  const text = bytes.toString('utf8')
  const document: unknown = JSON.parse(text)
  if (!hasLearningUnitLayer(document)) return hash(bytes)
  const serialize = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
  if (serialize(document) !== text)
    throw new LearningUnitProjectionError('A landscape with learning units must use the repository JSON serialization')
  return hash(serialize(projectOutLearningUnits(document)))
}
