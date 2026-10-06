// SPDX-License-Identifier: Apache-2.0
// Read-only measurement of the current source projection and frozen BIO v2 inputs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  buildGoalBookOriginalSources,
  goalBookOriginalSourceMappingPaths,
  serializeGoalBookOriginalSources,
} from '../../../../../../../app/scripts/goalBookOriginalSources'
import { GOAL_BOOK_PUBLICATION_REGISTRY } from '../../../../../../../app/src/utils/goalBookPublicationRegistry'
import type { GoalBookModel } from '../../../../../../../app/scripts/goalBookModel'
import type { GoalBookOriginalSourcesPayload } from '../../../../../../../app/src/utils/goalBookOriginalSources'

async function main() {
const root = process.cwd()
const own = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-original-source-active-mapping-remediation-v3')
const candidate = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-source-version-correction-current-candidate-v2')
const isolatedRoot = resolve(root, 'tmp/biologie-q1-tf-methylation-source-v2-native-isolated-20261005-v2')
const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const sha = (path: string) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`
const write = (name: string, value: unknown) => writeFileSync(resolve(own, name), `${JSON.stringify(value, null, 2)}\n`)
const frozen = read(resolve(candidate, 'prepared-inputs.freeze.json'))
for (const file of frozen.files) {
  assert.equal(sha(resolve(root, file.preparedPath)), file.sha256)
  assert.equal(sha(resolve(isolatedRoot, file.path)), file.sha256)
}
const beforeImplementationPath = resolve(isolatedRoot, 'app/scripts/goalBookOriginalSources.ts')
const beforeImplementation = await import(pathToFileURL(beforeImplementationPath).href)
const citations = (index: GoalBookOriginalSourcesPayload, goalId: string) => {
  const documents = new Map(index.documents.map((document) => [document.id, document]))
  const evidence = new Map(index.evidence.map((item) => [item.id, item]))
  return index.goals[goalId].map(({ evidenceIds, ...tuple }) => ({
    ...tuple, citations: evidenceIds.map((id) => {
      const { id: ignored, documentId, ...item } = evidence.get(id)!
      const { id: ignoredDocumentId, ...document } = documents.get(documentId)!
      void ignored; void ignoredDocumentId
      return { ...item, ...document }
    }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b), 'en')),
  }))
}
const delta = (before: GoalBookOriginalSourcesPayload, after: GoalBookOriginalSourcesPayload) => {
  assert.deepEqual(Object.keys(after.goals), Object.keys(before.goals))
  return Object.keys(after.goals).flatMap((goalId) => {
    const previous = citations(before, goalId)
    const current = citations(after, goalId)
    assert.deepEqual(current.map(({ citations: ignored, ...tuple }) => { void ignored; return tuple }),
      previous.map(({ citations: ignored, ...tuple }) => { void ignored; return tuple }))
    return JSON.stringify(previous) === JSON.stringify(current) ? [] : [{ goalId, before: previous, after: current }]
  })
}
const entryPointImplementations = ['buildGoalBookPublications.ts', 'buildGoalBookOriginalSources.ts', 'checkGoalBookPublication.ts']
const currentSummaries = []
for (const definition of GOAL_BOOK_PUBLICATION_REGISTRY) {
  const model = read(resolve(root, `app/public/lernzielbuch/${definition.artifactStem}.book-model.json`)) as GoalBookModel
  const before = beforeImplementation.buildGoalBookOriginalSources(model, root)
  const selected = goalBookOriginalSourceMappingPaths(model, root, `app/${definition.configPath}`)
  const after = buildGoalBookOriginalSources(model, root, selected)
  assert.deepEqual(after, buildGoalBookOriginalSources(model, root), 'default registered call must use the same source selection')
  const changes = delta(before, after)
  if (selected === undefined) assert.equal(serializeGoalBookOriginalSources(after), serializeGoalBookOriginalSources(before))
  write(`${definition.subject}.current-source-citation-deltas.json`, changes)
  currentSummaries.push({ bookId: definition.bookId, bookDigest: model.digest,
    mappingSelection: selected ?? 'legacy authored-atlas review discovery (no input companion)',
    changedGoalCitationSets: changes.length, beforeEvidence: before.evidence.length, afterEvidence: after.evidence.length,
    beforeMissingTuples: Object.values(before.goals).flat().filter(({ evidenceIds }) => !evidenceIds.length).length,
    afterMissingTuples: Object.values(after.goals).flat().filter(({ evidenceIds }) => !evidenceIds.length).length,
    exactApplicabilityTuplesUnchanged: true, currentModelFileUntouched: true,
  })
}
const model = read(resolve(candidate, 'prospective-full.book-model.json')) as GoalBookModel
const before = beforeImplementation.buildGoalBookOriginalSources(model, isolatedRoot)
assert.deepEqual(before, read(resolve(candidate, 'actual-native-original-source-links.after.json')),
  'baseline projection must reproduce the exact recorded source-consumer HOLD')
const after = buildGoalBookOriginalSources(model, isolatedRoot)
write('prospective-v2-original-sources.before.json', before)
write('prospective-v2-original-sources.after.json', after)
const changes = delta(before, after)
write('prospective-v2-all-goal-citation-deltas.json', changes)
const targets = ['946ce2e7-c30d-5670-839d-003b0619c284', '0ac51522-352c-50d1-8b95-8d3992b4db15',
  '8eb86a82-c54c-51ff-a221-390dc10cd6db', 'a3f483aa-610f-529b-91af-2f10a46284e6']
const actualTargets = Object.keys(after.goals).filter((id) => targets.includes(id) || id.startsWith('a3f483') || id.startsWith('8eb86'))
assert.equal(actualTargets.length, 4)
const targetDeltas = actualTargets.map((goalId) => {
  const previous = citations(before, goalId)
  const current = citations(after, goalId)
  const falseHistoricalCitations = previous.flatMap(({ citations }) => citations)
    .filter(({ sourceRef, url }) => sourceRef.includes('39') && url.includes('2024-11'))
  assert.ok(falseHistoricalCitations.length, `${goalId}: previously wrong old-document citation must exist`)
  assert.ok(!current.flatMap(({ citations }) => citations).some(({ sourceRef, url }) => sourceRef.includes('39') && url.includes('2024-11')))
  assert.ok(current.flatMap(({ citations }) => citations).some(({ sourceRef, url }) => sourceRef.includes('39') && url.includes('2025-10')),
    `${goalId}: actual 2025 document citation must remain`)
  return { goalId, falseHistoricalCitations, before: previous, after: current }
})
write('prospective-v2-four-source-hold-deltas.actual.json', targetDeltas)
const atlas = read(resolve(isolatedRoot, 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'))
const sourceRouting = atlas.mappingPaths.map((path: string) => {
  const mapping = read(resolve(isolatedRoot, path))
  const extraction = read(resolve(isolatedRoot, mapping.sourceExtractionPath))
  return { mappingPath: path, sourceExtractionPath: mapping.sourceExtractionPath,
    targetGoals: (mapping.decisions ?? []).filter((decision: { canonicalGoalIds?: string[] }) => decision.canonicalGoalIds?.some((id) => actualTargets.includes(id)))
      .map((decision: { sourceGoalId: string }) => extraction.sourceGoals.find((goal: { id: string }) => goal.id === decision.sourceGoalId)) }
}).filter((binding: { targetGoals: unknown[] }) => binding.targetGoals.length)
write('prospective-v2-four-source-document-routing.actual.json', sourceRouting)
for (const file of frozen.files) assert.equal(sha(resolve(isolatedRoot, file.path)), file.sha256)
write('source-consumer-remediation.actual.receipt.json', {
  recordedAtUTC: new Date().toISOString(), status: 'generic build source-selection remediation demonstrated; inactive candidate only',
  originalObjectiveScope: 'Chemistry and Biology machine curriculum QA', humanApproval: false, adopted: false, newStrictClosures: 0,
  beforeImplementationPath: 'tmp/biologie-q1-tf-methylation-source-v2-native-isolated-20261005-v2/app/scripts/goalBookOriginalSources.ts',
  beforeImplementationSha256: sha(beforeImplementationPath), currentImplementationSha256: sha(resolve(root, 'app/scripts/goalBookOriginalSources.ts')),
  entryPoints: entryPointImplementations.map((path) => ({ path: `app/scripts/${path}`, sha256: sha(resolve(root, `app/scripts/${path}`)),
    configuredMappingSelectionUsed: readFileSync(resolve(root, `app/scripts/${path}`), 'utf8').includes('goalBookOriginalSourceMappingPaths') })),
  currentSummaries, prospectiveBookDigest: model.digest, prospectiveChangedGoalCitationSets: changes.length,
  prospectiveExactApplicabilityTuplesUnchanged: true, frozenProspectiveFilesVerifiedBeforeAndAfter: frozen.files.length,
  falseHistoricalPage39CitationGoalIds: actualTargets, actual2025LinksRemain: true,
  sourceDocumentKeySelectionPreserved: true, historicalReviewsChanged: 0, modelFilesChanged: 0,
  isolatedCandidateWrites: 0, productionOrRuntimeAcceptanceClaimed: false,
})
console.log(JSON.stringify({ currentSummaries, prospectiveChangedGoalCitationSets: changes.length, targets: actualTargets }, null, 2))
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
