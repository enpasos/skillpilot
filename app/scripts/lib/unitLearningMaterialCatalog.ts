import { readFileSync, realpathSync } from 'node:fs'
import path from 'node:path'
import type { MapPracticeMaterial } from '../../src/components/learningUnitMap/types'

/** Only declared learning material is bundled. Unit assessment receipts are resolved by the backend. */
export function readUnitMapMaterials(curriculaRoot: string): MapPracticeMaterial[] {
  const root = realpathSync(curriculaRoot)
  const catalog = JSON.parse(readFileSync(path.join(root, 'unit-learning-materials.json'), 'utf8'))
  if (catalog.schemaVersion !== 1 || !Array.isArray(catalog.materials)) throw new Error('Invalid unit learning material catalog')
  return catalog.materials.map((entry: unknown) => {
    if (typeof entry !== 'string' || !entry || path.isAbsolute(entry)) throw new Error('Expected a relative unit material path')
    const source = realpathSync(path.join(root, entry))
    if (!source.startsWith(root + path.sep)) throw new Error('Unit material outside curriculum')
    const material = JSON.parse(readFileSync(source, 'utf8'))
    if (Object.hasOwn(material, 'schemaVersion') && ![1, 2, 3].includes(material.schemaVersion)) {
      throw new Error('Unsupported unit learning material version in ' + entry)
    }
    const { unit, intro, guidedStudyOrder, individualAssessmentOffers, exercises = [] } = material
    const { landscapeId, compositionNodeId, viewIds, flashcardGoalId, assessmentGoalId, orientationGoalId } = unit
    return { unit: { landscapeId, compositionNodeId, viewIds, flashcardGoalId, assessmentGoalId,
      ...(orientationGoalId ? { orientationGoalId } : {}) }, intro, exercises, ...(guidedStudyOrder && { guidedStudyOrder }),
      ...(individualAssessmentOffers && { individualAssessmentOffers }) }
  })
}
