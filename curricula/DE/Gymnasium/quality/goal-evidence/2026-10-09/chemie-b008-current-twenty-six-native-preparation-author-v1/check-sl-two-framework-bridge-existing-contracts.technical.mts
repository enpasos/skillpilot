// SPDX-License-Identifier: Apache-2.0
// Normal source API diagnostic; pending operative decisions are never relabelled reviewed.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'

const root = resolve('.'), own = dirname(fileURLToPath(import.meta.url))
const out = resolve(own, 'source-sl-bridge-author')
const cap = resolve(root, 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const hash = (b: Buffer | string) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const bind = (p: string) => { const b = readFileSync(p); return { path: relative(root, p), sha256: hash(b), bytes: b.length } }
const write = (p: string, x: unknown) => {
  assert.ok(p.startsWith(out + '/'))
  const b = Buffer.from(JSON.stringify(x, null, 2) + '\n')
  if (existsSync(p)) assert.ok(readFileSync(p).equals(b), 'Preserve original attempt')
  else { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b) }
}
const configPath = resolve(out, 'whole395-with-existing32-mappings-and-newSLbridge.normal-probe.author-candidate.json')
const config = read(configPath)
const extractionPath = resolve(out, 'SL-upper-actual-numbered-KMK-standards.source-extraction.author-candidate.json')
const extraction = read(extractionPath)
const mappingPath = resolve(out, 'SL-upper-numbered-framework-to-two-routines.mapping.author-candidate.json')
const mapping = read(mappingPath)
assert.equal(extraction.sourceGoals.length, 9)
assert.equal(mapping.decisions.length, 9)
assert.ok(mapping.decisions.every((d: any) => d.reviewer === null && d.reviewedAt === null))
const selectedIds = ['36666b4a-97af-51fc-9983-56cdcc7a8229', 'ac8b6c0f-98b2-5092-806d-d9498efbfa35']
assert.deepEqual([...new Set(mapping.decisions.flatMap((d: any) => d.canonicalGoalIds))].sort(), selectedIds)
const sourceRows = extraction.sourceGoals.map((goal: any) => {
  const passage = extraction.passages.find((p: any) => p.id === goal.passageId)
  const document = extraction.sourceDocuments.find((d: any) => d.key === goal.sourceDocumentKey)
  assert.ok(passage && document)
  const stage = sourceAtlasFacet([goal, passage, document, extraction], 'stage')
  const courseProfiles = sourceAtlasFacet([goal, passage, document, extraction], 'courseProfile')
  assert.deepEqual(stage, ['SekII'])
  assert.deepEqual(courseProfiles, ['GK', 'LK'])
  return { sourceGoalId: goal.id, originalNumberedStandard: goal.topicCode, stage, courseProfiles,
    learningEndpoint: goal.extendedData.learningEndpoint, actualWholeSourceText: goal.sourceText,
    mappedTargetIds: mapping.decisions.find((d: any) => d.sourceGoalId === goal.id).canonicalGoalIds,
    nativeSLBulletInvented: false, operativeReviewPending: true }
})
for (const path of [config.durationModelPolicyPath, config.landscapePath, config.semanticKindLedgerPath, ...config.fallbackViewPaths]) {
  const absolute = resolve(root, path), capsule = resolve(cap, path)
  mkdirSync(dirname(capsule), { recursive: true })
  if (existsSync(capsule)) assert.ok(readFileSync(capsule).equals(readFileSync(absolute)), 'Existing capsule regular input differs ' + path)
  else copyFileSync(absolute, capsule)
}
for (const path of config.mappingPaths) {
  const absolute = resolve(root, path), capsule = resolve(cap, path)
  mkdirSync(dirname(capsule), { recursive: true })
  if (existsSync(capsule)) assert.ok(readFileSync(capsule).equals(readFileSync(absolute)), 'Existing capsule mapping differs ' + path)
  else copyFileSync(absolute, capsule)
  const sourcePath = read(absolute).sourceExtractionPath
  const source = resolve(root, sourcePath), dest = resolve(cap, sourcePath)
  mkdirSync(dirname(dest), { recursive: true })
  if (existsSync(dest)) assert.ok(readFileSync(dest).equals(readFileSync(source)), 'Existing capsule extraction differs')
  else copyFileSync(source, dest)
  const e = read(source)
  for (const document of e.sourceDocuments?.length ? e.sourceDocuments : [e.sourceDocument]) {
    if (!document?.path || config.sourceDocumentSnapshots.some((snapshot: any) => snapshot.path === document.path)) continue
    const original = resolve(root, document.path), required = resolve(cap, document.path)
    mkdirSync(dirname(required), { recursive: true })
    if (existsSync(required)) assert.ok(readFileSync(required).equals(readFileSync(original)), 'Unpinned original document differs')
    else copyFileSync(original, required)
  }
}
let actualError: string | null = null
try {
  buildGoalBookSourceAtlasInputs(config, cap)
} catch (error) {
  actualError = error instanceof Error ? error.message : String(error)
}
assert.ok(actualError?.includes('Missing reviewed mapping decision metadata: sl-chem-ahr-framework-2020-'), 'New unresolved operative review must remain an actual ordinary blocker: ' + actualError)
write(resolve(out, 'actual-nine-normal-facets-and-ordinary-source-probe.pending.json'), {
  schemaVersion: 1, config: bind(configPath), sourceExtraction: bind(extractionPath), newMapping: bind(mappingPath),
  API: 'buildGoalBookSourceAtlasInputs(config, ordinaryThinCapsuleRoot)',
  ordinaryCompilerModified: false, normalSourceFacetRows: sourceRows, normalFacetChecks: 'PASS',
  ordinarySourceAtlas: 'HOLD', actualOrdinaryError: actualError,
  pendingMetadataDeliberatelyNotFabricated: true, noAtlasArtifactsWritten: true,
  oldOriginalSLMappingDecisionsUnchanged: true, old65WholeDutiesPreserved: true,
  genuineSLWholeLowerTargetStillHold: '75e2eff1-f871-5461-9e3f-26d0b333ce2f',
  oldSourceAndPartnerUnionNeverClosedByHashOrNewPartialRows: true,
  native2DeferredUntilGenuineOperativeCurrentContextAdoption: true,
  independentSourceContextReviewPending: true, activeWrites: [], strictGain: 0, humanApproval: false,
})
console.log(JSON.stringify({ normalFacetRows: 9, normalStage: 'SekII', normalCourses: ['GK', 'LK'],
  normalSourceAtlas: 'HOLD', concreteCurrentOperativeError: actualError, oldSLDecisionWrites: 0,
  sourceFieldsNotFabricated: true, native2AwaitingActualContextAdoption: true, activeWrites: 0, strictGain: 0 }))
