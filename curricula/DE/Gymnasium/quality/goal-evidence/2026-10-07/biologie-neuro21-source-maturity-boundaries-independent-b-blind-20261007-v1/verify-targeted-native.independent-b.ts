import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateCourseLevelMappingConsistency, readAllGoalMappingFiles } from '../../../../../../../app/scripts/generateCurriculumQualityStatus'
import { createReviewedRequiresClosureCoverageChecker, hasDirectSourceCoverageEvidence, sourceCoverageSurrogateKey } from '../../../../../../../app/scripts/sourceCoverageEvidence'
import { getAllJsonFiles, hasOnlyPartialMappingSourceEvidence } from '../../../../../../../app/scripts/applicabilityCompiler'

const out = dirname(fileURLToPath(import.meta.url))
const repo = resolve(out, '../../../../../../..')
const candidateDir = resolve(out, '../biologie-neuro21-source-maturity-boundaries-independent-a-candidate-20261007-v1')
const json = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const inputFiles = new Map<string, { path: string; sha256: string; bytes: number }>()
const pin = (path: string) => {
  const absolute = resolve(repo, path)
  const bytes = readFileSync(absolute)
  const entry = { path: relative(repo, absolute), sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }
  inputFiles.set(entry.path, entry)
  return entry
}
const frozenInputs = json(resolve(out, 'first-pass-inputs.actual.json'))
for (const entry of frozenInputs.files) assert.deepEqual(pin(entry.path), entry, `first-pass input drift: ${entry.path}`)
const firstSeal = json(resolve(out, 'first-pass.seal.json'))
for (const entry of firstSeal.files) assert.deepEqual(pin(entry.path), entry, `first-pass seal drift: ${entry.path}`)
const manifest = json(resolve(candidateDir, 'planned-nine-file-integration-manifest.inert.json'))
assert.equal(manifest.files.length, 9)

const protectedPaths = [
  ...getAllJsonFiles(resolve(repo, 'curricula/DE/Gymnasium/canonical')),
  ...getAllJsonFiles(resolve(repo, 'curricula/DE/Gymnasium/composition-views')),
  ...getAllJsonFiles(resolve(repo, 'curricula/DE/Gymnasium/provenance')),
].filter(existsSync)
for (const path of protectedPaths) pin(path)
for (const path of ['app/scripts/generateCurriculumQualityStatus.ts', 'app/scripts/sourceCoverageEvidence.ts', 'app/scripts/applicabilityCompiler.ts']) pin(path)

const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const canonical = json(resolve(repo, canonicalPath))
const canonicalGoals = new Map<string, any>(canonical.goals.map((goal: any) => [goal.id, goal]))
const raw = json(resolve(candidateDir, 'review-input/whole-current-two-goals-and-actual-consumer-limits.raw.json'))
for (const goal of raw.wholeGoals) assert.deepEqual(canonicalGoals.get(goal.id), goal, 'whole-current goal drift')
for (const consumer of raw.consumers) assert.deepEqual(canonicalGoals.get(consumer.goal.id), consumer.goal, 'consumer drift')

const sourceId = '41b81d9c-e22d-4af7-8b89-eaf26e1ddaa8'
const targetId = 'a46cafde-7359-5249-8754-19aaa3174ba4'
const replacementMappings = new Map<string, any>()
const replacementExtractions = new Map<string, any>()
const edgeCorrections: any[] = []
for (const item of manifest.files) {
  assert.deepEqual(pin(item.candidate.path), item.candidate)
  const next = json(resolve(repo, item.candidate.path))
  if (item.productionPath.includes('/mapping/')) replacementMappings.set(item.productionPath, { ...next, file: item.productionPath })
  else replacementExtractions.set(item.productionPath, next)
  if (!item.old) continue
  assert.deepEqual(pin(item.old.path), item.old)
  assert.deepEqual(pin(item.archive.path), item.archive)
  assert.equal(item.old.sha256, item.archive.sha256, 'old original must be byte-exact in archive')
  const previous = json(resolve(repo, item.old.path))
  assert.equal(next.mappings.length, previous.mappings.length)
  assert.equal(next.decisions.length, previous.decisions.length)
  const oldMapping = previous.mappings.filter((entry: any) => entry.legacyGoalId === sourceId)
  const newMapping = next.mappings.filter((entry: any) => entry.legacyGoalId === sourceId)
  assert.equal(oldMapping.length, 1)
  assert.equal(newMapping.length, 1)
  assert.equal(oldMapping[0].canonicalGoalId, targetId)
  assert.equal(newMapping[0].canonicalGoalId, targetId)
  assert.equal(oldMapping[0].matchType, 'exact')
  assert.equal(newMapping[0].matchType, 'partial')
  const oldDecision = previous.decisions.filter((entry: any) => entry.sourceGoalId === sourceId)
  const newDecision = next.decisions.filter((entry: any) => entry.sourceGoalId === sourceId)
  assert.equal(oldDecision.length, 1)
  assert.equal(newDecision.length, 1)
  assert.equal(newDecision[0].targetCourseLevel, 'LK')
  assert.equal(newDecision[0].matchType, 'partial')
  assert.equal(newDecision[0].wholeOriginalSourceCoverage, false)
  assert.equal(newDecision[0].wholeCanonicalGoalApproval, false)
  assert.equal(newDecision[0].humanApproval, false)
  assert.equal(newDecision[0].humanTrial, false)
  assert.equal(newDecision[0].courseLevelDecision, undefined, 'no course-level override')
  assert.equal(newMapping[0].courseLevelDecision, undefined, 'no course-level override')
  assert.equal(next.summary.exactMappings, previous.summary.exactMappings - 1)
  assert.equal(next.summary.partialMappings, previous.summary.partialMappings + 1)
  const unaffected = (document: any) => {
    const copy = structuredClone(document)
    copy.mappings = copy.mappings.filter((entry: any) => entry.legacyGoalId !== sourceId)
    copy.decisions = copy.decisions.filter((entry: any) => entry.sourceGoalId !== sourceId)
    delete copy.summary.exactMappings
    delete copy.summary.partialMappings
    return copy
  }
  assert.deepEqual(unaffected(next), unaffected(previous), 'unrelated mapping/decision changed')
  edgeCorrections.push({ file: item.productionPath, oldMatchType: 'exact', newMatchType: 'partial', targetCourseLevel: 'LK', otherContentUnchanged: true, originalBytesArchived: true })
}
assert.equal(edgeCorrections.length, 7)
const current = readAllGoalMappingFiles().filter((file) => file.targetLandscapeId === canonical.landscapeId)
for (const file of current) pin(file.file)
const next = current.map((file) => replacementMappings.get(file.file) ?? file)
for (const [path, file] of replacementMappings) if (!current.some((entry) => entry.file === path)) next.push(file)
assert.equal(next.length, current.length + 1)
const extractions = new Map<string, any>()
for (const mapping of next) {
  if (!mapping.sourceExtractionPath) continue
  if (replacementExtractions.has(mapping.sourceExtractionPath)) extractions.set(mapping.sourceExtractionPath, replacementExtractions.get(mapping.sourceExtractionPath))
  else {
    pin(mapping.sourceExtractionPath)
    extractions.set(mapping.sourceExtractionPath, json(resolve(repo, mapping.sourceExtractionPath)))
  }
}
const before = evaluateCourseLevelMappingConsistency(canonical, current, extractions)
const after = evaluateCourseLevelMappingConsistency(canonical, next, extractions)
assert.equal(before.status, 'fail')
assert.equal(before.metrics?.mismatches, 7)
assert.equal(after.status, 'pass')
assert.equal(after.metrics?.mismatches, 0)
assert.equal(after.metrics?.reviewedCourseLevelExceptions, before.metrics?.reviewedCourseLevelExceptions)
assert.equal(after.metrics?.missingSourceGoals, 0)
assert.equal(after.metrics?.missingTargetGoals, 0)

const goalId = '2381d2bb-176c-5903-8c6e-82f4bd5023a4'
const measurement = raw.rawDiagnostic.unsupported.find((entry: any) => entry.goalId === goalId)
assert.ok(measurement)
assert.equal(hasDirectSourceCoverageEvidence(measurement, 'DE-BY'), false)
const consumers = raw.consumers.map((entry: any) => ({
  goalId: entry.goal.id,
  goalType: entry.goal.contains.length ? 'cluster' : 'atomic',
  evidence: [{ kind: 'mapping', dimension: 'jurisdiction', value: 'DE-BY', source: 'actual currently assigned consumer; hypothetical bridge eligibility probe' }],
}))
const eligible = (goal: any) => !!goal && !goal.examData && !(goal.tags ?? []).some((tag: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(tag))
const checkCoverage = (goal: any, bridges: any[]) => createReviewedRequiresClosureCoverageChecker({
  landscapeId: canonical.landscapeId, jurisdiction: 'DE-BY', goals: [goal, ...consumers], canonicalGoalById: canonicalGoals,
  surrogateEntriesByKey: new Map([[sourceCoverageSurrogateKey(canonical.landscapeId, goalId, 'DE-BY'), bridges]]), isEligibleCanonicalGoal: eligible,
})
assert.equal(checkCoverage(measurement, []).hasCoverageBackedJurisdictionEvidence(measurement), false)
const invalidBridges = consumers.map((consumer: any) => ({ landscapeId: canonical.landscapeId, goalId, jurisdiction: 'DE-BY', requiredByGoalId: consumer.goalId }))
assert.equal(checkCoverage(measurement, invalidBridges).hasReviewedRequiresClosureSurrogateEvidence(measurement), false)
const route = [...replacementMappings.values()].find((entry) => entry.sourceLandscapeId === '357a7003-b636-570e-a0bd-6bb63518d2f6')
assert.equal(route.mappings.length, 1)
assert.equal(route.mappings[0].canonicalGoalId, goalId)
assert.equal(route.mappings[0].matchType, 'partial')
const source = extractions.get(route.sourceExtractionPath)
assert.equal(source.sourceGoals.length, 1)
assert.equal(source.jurisdiction, 'DE-BY')
assert.equal(source.sourceGoals[0].courseLevel, 'GK_LK')
assert.equal(source.sourceGoals[0].id, route.mappings[0].legacyGoalId)
assert.equal(source.sourceGoals[0].actualPrimaryComponents.length, 2)
assert.equal(source.sourceGoals[0].supportingPrimaryComponents.length, 6)
const directEvidence = { kind: 'mapping', dimension: 'jurisdiction', value: 'DE-BY', source: route.file, mappingStrength: route.mappings[0].matchType }
const candidateMeasurement = { ...measurement, evidence: [...measurement.evidence, directEvidence] }
assert.equal(hasDirectSourceCoverageEvidence(candidateMeasurement, 'DE-BY'), true)
assert.equal(hasOnlyPartialMappingSourceEvidence(candidateMeasurement.evidence, 'DE-BY'), true)
assert.equal(checkCoverage(candidateMeasurement, []).hasCoverageBackedJurisdictionEvidence(candidateMeasurement), true)
assert.equal(checkCoverage(candidateMeasurement, []).hasReviewedRequiresClosureSurrogateEvidence(candidateMeasurement), false)

const recorded = [...inputFiles.values()]
for (const input of recorded) assert.deepEqual(pin(input.path), input, `read-only input changed during validation: ${input.path}`)
const inputPath = resolve(out, 'native-declared-inputs.independent-b.actual.json')
const resultPath = resolve(out, 'native-targeted-validation.independent-b.actual.json')
assert.equal(existsSync(inputPath), false, 'do not overwrite immutable result')
assert.equal(existsSync(resultPath), false, 'do not overwrite immutable result')
writeFileSync(inputPath, JSON.stringify({ files: recorded }, null, 2) + '\n')
const result = {
  role: 'Independent B native targeted inert substitution; full CQR-003 aggregate and global QS not executed',
  currentCQR004: before, candidateCQR004: after, sevenChangedEdges: edgeCorrections,
  boundedBYSourceCoverage: {
    goalId, currentDirectEvidence: false, currentRequiresClosureCoverage: false,
    hypotheticalClusterAndAssessmentSurrogatesAccepted: false,
    candidateDirectPartialEvidence: true, candidateDirectCoverageApi: true, candidateSurrogateEvidence: false,
    partialOnlyDiagnosticRemains: true, wholeSourceClosure: false, wholeCurrentGoalApproval: false,
  },
  discovery: { currentBiologyMappingFiles: current.length, inertCandidateBiologyMappingFiles: next.length, replacedFiles: 7, newMappingFiles: 1, newExtractionFiles: 1 },
  protectedFileCount: protectedPaths.length, unchangedInputCount: recorded.length,
  activeFilesModified: false, globalQSExecuted: false, humanApproval: false, humanTrial: false, strictGain: 0,
  actualIntegrationAndAggregateNativeStatus: 'pending parent integration and ordinary native report; this receipt does not grant global maturity',
}
writeFileSync(resultPath, JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ beforeCQR004: before.status, beforeMismatches: before.metrics?.mismatches, candidateCQR004: after.status, candidateMismatches: after.metrics?.mismatches, candidateDirectPartialBYCoverage: true, surrogatesRejected: true, protectedFileCount: protectedPaths.length, unchangedInputs: recorded.length, strictGain: 0 }))
