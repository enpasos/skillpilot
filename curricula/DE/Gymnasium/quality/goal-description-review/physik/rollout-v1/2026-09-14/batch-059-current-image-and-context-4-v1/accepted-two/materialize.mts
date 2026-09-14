import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Run from repository root: app/node_modules/.bin/tsx <this-file> [--write].
// Writes only absent artifacts in this exact partial-resolution directory.
// Existing source rounds, full dual summary and all other goals remain intact.
const root = process.cwd()
const out = dirname(fileURLToPath(import.meta.url))
const batch = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-14/batch-059-current-image-and-context-4-v1'
assert.equal(out, resolve(root, batch, 'accepted-two'), 'Run from repository root.')
const args = process.argv.slice(2)
assert(args.every(arg => arg === '--write') && args.length <= 1)
const write = args.includes('--write')
const ids = ['7d78da7f-6af5-440a-9d6b-6cab4bee8dd2', '7d4d6a39-0c78-5fb0-b7bf-182ed00972f7']
const excluded = ['206fe51d-cc78-5422-b139-32cc97eb1c37', 'e2014db8-c97f-5ce1-82c5-2a42741f4a61']
const hash = (bytes: Buffer | string) => 'sha256:' + createHash('sha256').update(bytes).digest('hex')
const read = (path: string) => readFile(resolve(root, path))
const json = async (path: string) => JSON.parse((await read(path)).toString())
const bytes = (value: unknown) => Buffer.from(JSON.stringify(value, null, 2) + '\n')
const rel = (path: string) => relative(out, resolve(root, path)).split('\\').join('/')
const native = (name: string) => import(pathToFileURL(resolve(root, 'app/scripts', name + '.ts')).href)
const { materializeGoalDescriptionRolloutBatchDualSummary } = await native('materializeGoalDescriptionRolloutBatch')
const { buildGoalDescriptionDualRoundResolution, extractGoalDescriptionDualRoundResolutionSource,
  validateGoalDescriptionDualRoundResolution } = await native('validateGoalDescriptionDualRoundResolution')
const { loadGoalBookBuildInputs, stableGoalBookJson } = await native('goalBookModel')
const { buildGoalDescriptionCanonicalContext } = await native('validateGoalDescriptionReviewCampaign')
const { validateLegacyResolutionIndexSnapshot } = await native('reportDeepUnderstandingRollout')
const authorBytes = await readFile(resolve(out, 'synthesis-authoring.json'))
const author = JSON.parse(authorBytes.toString())
assert.deepEqual(author.goals.map((g: any) => g.goalId), ids)
assert.deepEqual(author.goals.map((g: any) => g.evidenceRound), ['first', 'second'])
assert.deepEqual(author.excluded.map((g: any) => g.goalId), excluded)
assert.equal(author.artifactSetId, 'physics-b059-alpha-transistor-partial-20260914-v1')

const dual = await materializeGoalDescriptionRolloutBatchDualSummary(batch + '.config.json', false)
assert.equal(hash(dual.bytes), 'sha256:243fc87b94b66ed8ba887e32ff6559356875d977854c944e1e13f87a86411fff')
assert.deepEqual(dual.summary.goals.map((g: any) => g.goalId), [...ids, ...excluded])
assert.equal(dual.summary.automaticAcceptance, false)
assert.equal(dual.summary.goals.find((g: any) => g.goalId === excluded[0]).firstDecision, 'block')
assert.equal(dual.summary.diversity.distinctProviderOrModel, false)

const baseConfigPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.json'
const current = await loadGoalBookBuildInputs(baseConfigPath)
const landscape = await json(current.config.landscapePath)
const ledgerBytes = await read(current.config.semanticKindLedgerPath)
const ledger = JSON.parse(ledgerBytes.toString())
const atomicIds = ledger.decisions
  .filter((d: any) => d.semanticKind === 'curricularAtomic' && d.decisionStatus === 'authoritative')
  .map((d: any) => d.goalId)
const atomicSet = new Set(atomicIds)
const denominator = atomicIds.length
assert(denominator > 0)
assert.equal(atomicSet.size, denominator)
assert.equal(ledger.counts.curricularAtomic, denominator)
assert.deepEqual([...atomicSet].sort(), current.model.pages.map((p: any) => p.goalId).sort())
ids.forEach(id => assert(atomicSet.has(id)))

const sourceArtifacts: any[] = []
for (const [roundName, artifacts] of [['round-a', dual.first], ['round-b', dual.second]] as const) {
  const paramsPath = batch + '/' + roundName + '/generation-parameters.json'
  const paramsDigest = hash(await read(paramsPath))
  for (const pair of artifacts.resultPairs) {
    const runPath = batch + '/' + roundName + '/results/' + pair.batchId + '.run.json'
    const recordsPath = batch + '/' + roundName + '/results/' + pair.batchId + '.records.jsonl'
    assert.equal(paramsDigest, pair.run.generationParametersFingerprint)
    assert.equal(pair.run.provider, 'OpenAI')
    assert.equal(pair.run.model, 'not-exposed-by-runtime')
    assert.equal(pair.run.modelVersion, 'not-exposed-by-runtime')
    assert.equal(pair.run.blindToOtherRuns, true)
    assert.equal(hash(await read(recordsPath)), pair.run.outputDigest)
    sourceArtifacts.push({ round: roundName, runPath, runBytesDigest: hash(await read(runPath)),
      runId: pair.run.runId, recordsPath, recordsBytesDigest: hash(pair.recordsBytes),
      generationParametersPath: paramsPath, generationParametersDigest: paramsDigest,
      provider: pair.run.provider, model: pair.run.model, modelVersion: pair.run.modelVersion,
      startedAt: pair.run.startedAt, completedAt: pair.run.completedAt })
  }
}

// A four-goal subset externalizes references that are internal in the full atlas.
// Normalize only this placement and page navigation; all other fields must match.
const normalizePage = (page: any) => {
  const value = structuredClone(page)
  for (const key of ['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint']) delete value[key]
  for (const [internalKey, externalKey] of [['requires', 'externalPrerequisites'], ['reverseRequires', 'externalReverseRequires']]) {
    const references = [...(value[internalKey] ?? []), ...(value[externalKey] ?? [])]
      .map(({ goalId, title }) => ({ goalId, title }))
      .sort((a, b) => a.goalId < b.goalId ? -1 : a.goalId > b.goalId ? 1 : 0)
    assert.equal(new Set(references.map(r => r.goalId)).size, references.length)
    value[internalKey] = references
    delete value[externalKey]
  }
  return value
}
const outputs: Array<[string, Buffer]> = []
const entries: any[] = []
const checks: any[] = []
for (const selected of author.goals) {
  const id = selected.goalId
  const input = dual.first.input.goals.find((g: any) => g.goalId === id)
  const secondInput = dual.second.input.goals.find((g: any) => g.goalId === id)
  assert.deepEqual(input, secondInput)
  const goal = landscape.goals.find((g: any) => g.id === id)
  assert(goal)
  assert.deepEqual(input.canonicalContext, buildGoalDescriptionCanonicalContext(goal))
  assert.deepEqual(
    [input.currentTitleDe, input.currentTitleEn, input.currentDescriptionDe, input.currentDescriptionEn],
    [goal.title, goal.titleEn, goal.description, goal.descriptionEn])
  const page = current.model.pages.find((p: any) => p.goalId === id)
  assert(page)
  assert.equal(stableGoalBookJson(normalizePage(input.reviewContext.page)), stableGoalBookJson(normalizePage(page)))
  const imagePath = 'app/public' + page.visualization.url
  assert.equal(hash(await read(imagePath)), page.visualization.originalDigest)
  assert.equal(page.visualization.originalDigest, input.reviewContext.page.visualization.originalDigest)

  const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: id, label: 'First' })
  const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: id, label: 'Second' })
  assert.deepEqual(first.errors, [])
  assert.deepEqual(second.errors, [])
  for (const source of [first.source, second.source]) {
    assert.equal(source.decision, 'keep')
    assert.equal(source.record.recordStatus, 'candidate')
    assert.equal(source.record.reviewAuthority, 'ai_candidate')
  }
  const evidenceSource = selected.evidenceRound === 'first' ? first.source : second.source
  const resolution = buildGoalDescriptionDualRoundResolution({
    resolutionId: 'physics-b059-partial-' + id + '-20260914-v1',
    goalId: id, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current',
    currentInput: dual.first.input, dualSummaryBytes: dual.bytes,
    firstSource: first.source, secondSource: second.source,
    synthesis: {
      synthesisId: 'physics-b059-partial-informed-' + id + '-20260914-v1',
      authority: 'ai_synthesis', synthesizedBy: author.synthesizedBy, synthesizedAt: author.synthesizedAt,
      rationaleDe: selected.rationaleDe, rationaleEn: selected.rationaleEn,
      understandingEvidence: evidenceSource.record.understandingEvidence,
      dissent: [{ dissentId: 'physics-b059-evidence-selection-' + id, source: 'both',
        disposition: selected.evidenceRound === 'first' ? 'accepted_first' : 'accepted_second',
        textDe: selected.dissentDe, textEn: selected.dissentEn }],
      humanAttestation: null
    }
  })
  const validation = await validateGoalDescriptionDualRoundResolution({
    resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes,
    currentInput: dual.first.input, landscape, first: dual.first, second: dual.second
  })
  assert.deepEqual(validation.errors, [])
  assert.equal(validation.strictDescriptionComplete, true)
  assert.equal(resolution.synthesis.authority, 'ai_synthesis')
  assert.equal(resolution.synthesis.humanAttestation, null)
  const name = 'resolutions/' + id + '.resolution.json'
  const resolutionBytes = bytes(resolution)
  outputs.push([name, resolutionBytes])
  entries.push({ goalId: id, titleDe: goal.title, groupId: dual.prepared.manifest.batchId,
    decision: 'keep_current', resolutionPath: name, resolutionDigest: hash(resolutionBytes),
    resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  checks.push({ goalId: id, selectedEvidenceRound: selected.evidenceRound,
    selectedRecordId: evidenceSource.record.recordId, unchangedOwnText: true,
    unchangedCanonicalContext: true, unchangedSubstantivePageContext: true,
    boundPageFingerprint: input.pageFingerprint, currentAtlasPageFingerprint: page.pageFingerprint,
    imagePath, imageDigest: page.visualization.originalDigest, nativeValidation: validation })
}
assert.deepEqual(entries.map(e => e.goalId), ids)
assert(!entries.some(e => excluded.includes(e.goalId)))
const index = {
  schemaVersion: 1, artifactSetId: author.artifactSetId, subject: 'Physik', semanticKind: 'curricularAtomic',
  strictDescriptionReviewCompleteCount: entries.length, curriculumAtomicDenominator: denominator,
  descriptionReviewPercentage: Number(((entries.length / denominator) * 100).toFixed(1)),
  groups: [{ groupId: dual.prepared.manifest.batchId, artifactDirectory: rel(batch),
    dualSummaryPath: rel(batch + '/dual-summary.json'), dualSummaryDigest: hash(dual.bytes),
    campaignGoalCount: dual.summary.goalCount, resolvedGoalCount: entries.length }],
  resolutions: entries
}
assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
assert.equal(resolve(out, index.groups[0].artifactDirectory), resolve(root, batch))
assert.equal(resolve(out, index.groups[0].dualSummaryPath), resolve(root, batch, 'dual-summary.json'))
entries.forEach(entry => assert.equal(resolve(out, entry.resolutionPath), resolve(out, 'resolutions', entry.goalId + '.resolution.json')))
outputs.push(['resolution-index.json', bytes(index)])
const receipt = {
  schemaVersion: 1, artifactSetId: author.artifactSetId, scope: 'partial_two_goal_description_resolution',
  authority: 'informed_ai_synthesis_of_existing_independent_reviews', synthesizedAt: author.synthesizedAt,
  synthesizedBy: author.synthesizedBy, authoringDigest: hash(authorBytes),
  sourceBatchPath: batch, sourceDualSummaryDigest: hash(dual.bytes), originalCampaignGoalCount: dual.summary.goalCount,
  resolvedGoalIds: ids, excludedGoals: author.excluded, sourceArtifacts,
  denominatorBasis: { semanticKindLedgerPath: current.config.semanticKindLedgerPath,
    ledgerDigest: hash(ledgerBytes), rule: 'Count unique authoritative curricularAtomic decisions; require exact equality to current atlas page IDs and ledger count.',
    currentCurricularAtomicDenominator: denominator },
  currentBindingChecks: checks,
  pageComparisonNormalization: 'Remove pageNumber/navigationOrder/treeOrder/pageFingerprint; merge internal and external prerequisite/successor links into sorted unique goalId/title lists. All other page fields must be identical. Original review input and fingerprints are preserved.',
  nativePartialIndexValidation: { contract: 'legacy-aggregate-resolution-index-v1', errors: [] },
  newBlindReview: false, providerOrModelDiversityClaimed: false, humanApproved: false,
  profileBodyChanged: false, activeImageChanged: false, canonicalChanged: false, oldRecordsChanged: false,
  registryChanged: false, inFlightLedgerChanged: false,
  acceptanceLimits: 'Only native description-resolution closure for the selected two goals. No positive-evidence profile, learner mastery, source completeness, image/human approval, publication or full B059 closure is claimed.',
  pauseBoundary: 'No further QA batch, image generation, package or excluded-goal synthesis is authorized by this materializer.'
}
outputs.push(['synthesis-and-exclusion-receipt.json', bytes(receipt)])

// Validate every result before writing any; never overwrite even our earlier outputs.
const missing: Array<[string, Buffer]> = []
for (const [name, expected] of outputs) {
  const target = resolve(out, name)
  assert(relative(out, target) !== '..' && !relative(out, target).startsWith('../'))
  let existing: Buffer | undefined
  try { existing = await readFile(target) } catch (error: any) { if (error.code !== 'ENOENT') throw error }
  if (existing) assert(existing.equals(expected), 'Existing artifact differs: ' + target)
  else missing.push([name, expected])
}
if (!write && missing.length) throw Error('Missing artifacts: ' + missing.map(([name]) => name).join(', '))
if (write) {
  for (const [name, expected] of missing) {
    const target = resolve(out, name)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, expected, { flag: 'wx' })
  }
}
for (const artifact of sourceArtifacts) {
  assert.equal(hash(await read(artifact.runPath)), artifact.runBytesDigest)
  assert.equal(hash(await read(artifact.recordsPath)), artifact.recordsBytesDigest)
  assert.equal(hash(await read(artifact.generationParametersPath)), artifact.generationParametersDigest)
}
assert.equal(hash(await read(batch + '/dual-summary.json')), hash(dual.bytes))
assert.equal(hash(await readFile(resolve(out, 'synthesis-authoring.json'))), hash(authorBytes))
console.log('B059 partial native valid: 2/4 source goals; denominator=' + denominator + '; Alpha=A, transistor=B; HRD/habitability excluded; no registry/canonical/profile/source edits.')
