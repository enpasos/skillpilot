// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { directedQuantityArrowImageIssues, type DirectedQuantityArrowImageReview,
  type ArrowImageRepresentation } from './lib/directedQuantityArrowVisualizationQa'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const directory = 'curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1'
const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const read = (path: string) => readFileSync(resolve(root, path))
const json = (path: string) => JSON.parse(read(path).toString('utf8'))
const digest = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const pretty = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`
interface SuccessorConfiguration {
  schemaVersion: 1
  evidencePath: string
  predecessorEvidencePath: string
  successorInspectionPath: string
  imageReviewOverrides: Record<string, string>
}
const configurationArgument = process.argv.slice(2).find(arg => arg.startsWith('--configuration='))
assert(process.argv.slice(2).every(arg => arg === '--check' || arg === configurationArgument), 'Only --check and --configuration=<path> are supported')
const configurationPath = configurationArgument?.slice('--configuration='.length)
const configuration = configurationPath ? json(configurationPath) as SuccessorConfiguration : undefined
if (configuration) {
  assert.equal(configuration.schemaVersion, 1)
  assert.deepEqual(Object.keys(configuration).sort(), ['schemaVersion', 'evidencePath', 'predecessorEvidencePath', 'successorInspectionPath', 'imageReviewOverrides'].sort())
  for (const path of [configurationPath!, configuration.evidencePath, configuration.predecessorEvidencePath,
    configuration.successorInspectionPath, ...Object.values(configuration.imageReviewOverrides)]) {
    assert(path.startsWith(`${directory}/`) && !path.includes('..'), 'Successor paths must stay in this delivery dossier')
  }
  assert.notEqual(configuration.evidencePath, configuration.predecessorEvidencePath, 'A successor must never overwrite its predecessor evidence')
}
const evidencePath = configuration?.evidencePath ?? `${directory}/rule/image-decisions.actual.json`
const legacyPath = `${directory}/rule/source-l/image-inventory.json`
const legacy = json(legacyPath) as { images: Array<{ id: string; code: string; sha256: string; observation: string }> }
const oldById = new Map(legacy.images.map(row => [row.id, row]))
const freshPath = `${directory}/rule/current-five-image-inspection.actual.json`
const fresh = json(freshPath) as { reviewedAt: string; reviewer: string; rows: Array<{ goalId: string; assetSha256: string; observation: string }> }
type CurrentInspection = typeof fresh.rows[number] & { reviewedAt?: string; reviewer?: string }
const currentById = new Map<string, CurrentInspection>(fresh.rows.map(row => [row.goalId, row]))
const newImageIds = ['b77a7e93-22f9-5722-a4cc-f18a149ab030', 'ad984bb6-e225-432a-952d-d83cda40b7f8']
const imageReviewPathById = new Map(newImageIds.map(id => [id, configuration?.imageReviewOverrides[id] ?? `${directory}/media/${id}.actual.json`]))
const sourcePaths = [legacyPath, `${directory}/rule/source-l/independent-review.actual.json`, freshPath,
  'curricula/DE/Gymnasium/quality/learning-units/physics-e2-energy-derivation-20261126-v1/media/bildpruefung.actual.json',
  ...imageReviewPathById.values(), ...(configuration ? [configurationPath!, configuration.predecessorEvidencePath, configuration.successorInspectionPath] : [])]
for (const id of newImageIds) {
  const inspected = json(imageReviewPathById.get(id)!)
  assert.equal(inspected.currentCriteriaDecision, 'accepted')
  assert.equal(digest(read(inspected.currentJpeg.path)), `sha256:${inspected.currentJpeg.sha256}`)
  currentById.set(id, { goalId: id, assetSha256: `sha256:${inspected.currentJpeg.sha256}`, observation: inspected.review })
}
if (configuration) {
  const successor = json(configuration.successorInspectionPath) as { rows: CurrentInspection[] }
  assert(Array.isArray(successor.rows) && successor.rows.length > 0)
  for (const inspected of successor.rows) {
    const previous = currentById.get(inspected.goalId)
    assert(previous && inspected.assetSha256 === previous.assetSha256, 'The actual successor inspection must match the selected image review')
    assert(inspected.reviewedAt && Number.isFinite(Date.parse(inspected.reviewedAt)) && inspected.reviewer)
    currentById.set(inspected.goalId, inspected)
  }
}
const qa = json(qaPath) as { records: Array<Record<string, unknown> & { goalId: string; assetSha256: string; canonicalAssetPath: string; visualizationState: string }> }
const rows: Array<{ goalId: string; legacyClassification: string | null; backlogGroup: string | null; review: Omit<DirectedQuantityArrowImageReview, 'evidence'> }> = []
for (const record of qa.records) {
  if (record.visualizationState !== 'available') continue
  assert.equal(digest(read(record.canonicalAssetPath)), record.assetSha256, `${record.goalId}: current QA image hash is stale`)
  const old = oldById.get(record.goalId)
  const inspected = currentById.get(record.goalId)
  let status: DirectedQuantityArrowImageReview['status']
  let kinds: ArrowImageRepresentation[]
  let notes: string
  let backlogGroup: string | null = null
  if (inspected) {
    assert.equal(inspected.assetSha256, record.assetSha256, `${record.goalId}: individual current image inspection is stale`)
    status = 'accepted'
    kinds = ['spatialQuantityArrow']
    notes = inspected.observation
  } else {
    assert(old, `${record.goalId}: no individual L or successor image reading`)
    assert.equal(`sha256:${old.sha256}`, record.assetSha256, `${record.goalId}: changed image needs a new actual criterion review`)
    if (['q', 'abstract', 'ambiguous'].includes(old.code)) {
      status = 'undecided'
      kinds = [old.code === 'q' ? 'spatialQuantityArrow' : old.code === 'abstract' ? 'separateVectorConstruction' : 'unresolved']
      backlogGroup = old.code === 'q' ? 'L-88-position-quantity-arrows' : old.code === 'abstract' ? 'L-6-separate-vector-constructions' : 'L-7-unresolved-representations'
      notes = `A3 backlog: no decision approving the new arrow criterion. Retained L observation: ${old.observation}`
    } else {
      assert.notEqual(old.code, 'pass', `${record.goalId}: L acceptance needs a current byte and material check`)
      status = 'notApplicable'
      kinds = [old.code === 'line' ? 'fieldLineConvention' : old.code === 'none' ? 'none' : 'otherRepresentation']
      notes = `L classified this exact image as ${old.code}; no body-/point-based magnitude-length arrow is established. ${old.observation}`
    }
  }
  const check = status === 'accepted' ? 'pass' : status === 'undecided' ? 'undecided' : 'notApplicable'
  const review: Omit<DirectedQuantityArrowImageReview, 'evidence'> = {
    criterionVersion: 'directed-quantity-arrows-v1', assetSha256: record.assetSha256, representationKinds: kinds, status,
    checks: { referencePoint: check, direction: check, quantityAndOwnScale: check, tipNotPlace: check,
      additionSameQuantityReference: status === 'accepted' && !['53afbda1-5776-502b-8867-471975d7b766', '839ecc8f-3a60-418b-bc92-64bfeef33824'].includes(record.goalId) ? 'notApplicable' : check },
    reviewedAt: status === 'accepted' ? inspected?.reviewedAt ?? fresh.reviewedAt : null,
    reviewer: status === 'accepted' ? inspected?.reviewer ?? fresh.reviewer : 'retained-L-image-reading', notes,
  }
  rows.push({ goalId: record.goalId, legacyClassification: old?.code ?? null, backlogGroup, review })
  if (newImageIds.includes(record.goalId)) Object.assign(record, {
    umlautsCorrectChatGpt: 'yes', contentApprovedChatGpt: 'yes', chatGptReviewedAt: review.reviewedAt,
    chatGptReviewer: 'codex-a2-current-image-review', chatGptNotes: notes,
    aiApproved: 'yes', aiApprovedAssetSha256: record.assetSha256, aiReviewedAt: review.reviewedAt,
    aiReviewer: 'codex-a2-current-image-review', aiNotes: `${notes} Exact material decision: ${imageReviewPathById.get(record.goalId)}.`,
  })
}
assert.equal(rows.filter(row => row.backlogGroup === 'L-88-position-quantity-arrows').length, 88)
assert.equal(rows.filter(row => row.review.status === 'accepted').length, 7)
const evidence = { schemaVersion: 1, documentType: 'directed-quantity-arrow-image-decisions',
  ...(configuration ? { supersedes: { path: configuration.predecessorEvidencePath, sha256: digest(read(configuration.predecessorEvidencePath)) },
    correctionScope: 'Only the explicitly inspected image successor is revised. All other individual decisions and the 88-image A3 backlog are preserved.' } : {}),
  method: 'Individual projection of retained L classifications and actual current image inspections. Existing general image approval does not imply approval of this criterion. Undecided is an explicit A3 backlog, never an accepted review.',
  sourceBindings: sourcePaths.map(path => ({ path, sha256: digest(read(path)) })), rows }
const evidenceBytes = pretty(evidence)
const evidenceDigest = digest(evidenceBytes)
const byId = new Map(rows.map(row => [row.goalId, row.review]))
for (const record of qa.records) {
  const review = byId.get(record.goalId)
  if (!review) continue
  record.directedQuantityArrowReview = { ...review, evidence: { path: evidencePath, sha256: evidenceDigest, entryId: record.goalId } }
  assert.deepEqual(directedQuantityArrowImageIssues(record), [])
}
const outputs = new Map([[evidencePath, evidenceBytes], [qaPath, pretty(qa)]])
for (const [path, contents] of outputs) {
  if (process.argv.includes('--check')) assert.equal(read(path).toString('utf8'), contents, `Stale arrow QA projection: ${path}`)
  else if (path !== qaPath && existsSync(resolve(root, path))) assert.equal(read(path).toString('utf8'), contents,
    `Historical image evidence is immutable; select a fresh successor path: ${path}`)
  else writeFileSync(resolve(root, path), contents)
}
console.log(JSON.stringify({ imageDecisions: rows.length, accepted: 7,
  notApplicable: rows.filter(row => row.review.status === 'notApplicable').length,
  undecided: rows.filter(row => row.review.status === 'undecided').length,
  spatialQuantityArrowBacklog: 88, humanApprovalsAdded: 0 }))
