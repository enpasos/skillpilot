// SPDX-License-Identifier: Apache-2.0
// Targeted use of the unchanged normal atlas API against inactive reviewed inputs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

const root = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const capsule = resolve(root, 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const bind = (path: string) => {
  const bytes = readFileSync(path)
  return { path: relative(root, path), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
}
const configPath = resolve(own, 'whole395-with-existing32-and-reviewedSL.normal-probe.config.json')
const mappingPath = resolve(own, 'SL-upper-nine-standards-to-two-whole-routines.mapping.reviewed-inactive.json')
const config = read(configPath)
const mapping = read(mappingPath)
const extractionPath = resolve(root, mapping.sourceExtractionPath)
const extraction = read(extractionPath)
assert.equal(mapping.decisions.length, 9)
assert.equal(mapping.mappings.length, 11)
assert.ok(mapping.decisions.every((d: any) => d.reviewer === 'Codex/root actual operative source review' && d.reviewedAt === '2026-10-09T01:29:35Z'))
const facets = extraction.sourceGoals.map((goal: any) => {
  const passage = extraction.passages.find((p: any) => p.id === goal.passageId)
  const document = extraction.sourceDocuments.find((d: any) => d.key === goal.sourceDocumentKey)
  assert.ok(passage && document)
  const levels = [goal, passage, document, extraction]
  const stage = sourceAtlasFacet(levels, 'stage')
  const courseProfiles = sourceAtlasFacet(levels, 'courseProfile')
  assert.deepEqual(stage, ['SekII'])
  assert.deepEqual(courseProfiles, ['GK', 'LK'])
  return { sourceGoalId: goal.id, stage, courseProfiles, mappedTargetGoalIds: mapping.decisions.find((d: any) => d.sourceGoalId === goal.id).canonicalGoalIds, learningEndpoint: goal.extendedData.learningEndpoint }
})
for (const path of [relative(root, configPath), relative(root, mappingPath), relative(root, extractionPath)]) {
  const source = resolve(root, path)
  const dest = resolve(capsule, path)
  mkdirSync(dirname(dest), { recursive: true })
  if (existsSync(dest)) assert.ok(readFileSync(dest).equals(readFileSync(source)), 'Existing capsule input changed: ' + path)
  else copyFileSync(source, dest)
}
let error: string | null = null
let counts: unknown = null
let sourceRoleScopes: unknown = null
let generatedOutputCount = 0
try {
  const result = buildGoalBookSourceAtlasInputs(config, capsule)
  counts = result.receipt.counts
  generatedOutputCount = Object.keys(result.outputs).length
  sourceRoleScopes = result.receipt.scopes.filter((scope: any) => scope.jurisdiction === 'DE-SL').map((scope: any) => ({ key: scope.key, targetCount: scope.goalIds.length, selectedTwoWholeTargetIds: scope.goalIds.filter((id: string) => ['ac8b6c0f-98b2-5092-806d-d9498efbfa35', '36666b4a-97af-51fc-9983-56cdcc7a8229'].includes(id)) }))
} catch (caught) {
  error = caught instanceof Error ? caught.message : String(caught)
}
const receipt = {
  schemaVersion: 1, config: bind(configPath), reviewedMapping: bind(mappingPath), reviewedExtraction: bind(extractionPath),
  API: 'unchanged buildGoalBookSourceAtlasInputs and sourceAtlasFacet', normalFacetChecks: 'PASS', facets,
  normalAtlasStatus: error ? 'HOLD' : 'PASS_TECHNICAL_INACTIVE_ONLY', actualOrdinaryError: error, counts, sourceRoleScopes,
  generatedInMemoryOutputCount: generatedOutputCount, generatedAtlasFilesWritten: false,
  actualReviewedOperativeMetadataBlockerResolved: !error?.includes('Missing reviewed mapping decision metadata'),
  newWholeSourceReviewClaimedByCompiler: false, wholeOriginalSL65SourceUnionClosed: false,
  wholeNationalSourceOperatorAndCourseApproval: false, nativeDescriptionOrPositiveApproval: false,
  newScientificClosures: 0, restoredM7Bindings: 0, strictGain: 0, activeWrites: [], humanApproval: false, humanTrial: false,
}
const output = resolve(own, 'reviewed-nine-source-facets.and-normal-atlas-probe.actual.json')
assert.ok(!existsSync(output), 'Preserve the first actual probe')
writeFileSync(output, JSON.stringify(receipt, null, 2) + '\n')
console.log(JSON.stringify({ normalFacetChecks: 'PASS', normalAtlasStatus: receipt.normalAtlasStatus, error, counts, generatedOutputCount, strictGain: 0 }))
process.exitCode = error ? 1 : 0
