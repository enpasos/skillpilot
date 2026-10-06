import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildGoalBookModel, fingerprintSemanticKindSourceGoal, stableGoalBookJson,
} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'
import { buildGoalBookOriginalSources } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookOriginalSources.ts'
import {
  buildGoalDescriptionCanonicalContext, buildGoalDescriptionReviewInput,
} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign.ts'
import {
  fingerprintGoalForEvidence, fingerprintGoalEvidenceReviewInput, goalEvidenceReviewInputPayload,
} from '/home/enpasos/projects/skillpilot/app/scripts/goalEvidenceProfileModel.ts'
import {
  fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput,
} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts'

const root = '/home/enpasos/projects/skillpilot'
const out = dirname(fileURLToPath(import.meta.url))
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
const candidate = `${base}/biologie-ni-eighteen-current-reviewed-integration-candidate-v2`
const clusterId = '9cd0dbbc-9507-5879-8c4f-df54529969ec'
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'))
const sha = (p: string) => createHash('sha256').update(readFileSync(join(root, p))).digest('hex')
const digest = (v: unknown) => `sha256:${createHash('sha256').update(stableGoalBookJson(v)).digest('hex')}`
const write = (name: string, value: unknown) => {
  assert(!existsSync(join(out, name)), `Evidence already exists: ${name}`)
  writeFileSync(join(out, name), `${JSON.stringify(value, null, 2)}\n`)
}
const plan = read(`${candidate}/integration-plan.reviewed.json`)
const canonicalRow = plan.explicitReplaceFiles.find((r: any) => r.futureActivePath.endsWith('BIOLOGIE.de.json'))
const ledgerRow = plan.explicitReplaceFiles.find((r: any) => r.futureActivePath.endsWith('biologie.semantic-kinds.json'))
assert.equal(sha(canonicalRow.prospectiveCopyPath), canonicalRow.sha256)
assert.equal(sha(ledgerRow.prospectiveCopyPath), ledgerRow.sha256)
const before = read(canonicalRow.prospectiveCopyPath)
const after = structuredClone(before)
const cluster = after.goals.find((g: any) => g.id === clusterId)
assert(!Object.hasOwn(cluster, 'dimensionTags'))
assert.equal(cluster.type, 'cluster')
assert.equal(cluster.contains.length, 20)
assert.deepEqual(cluster.applicability, { jurisdiction: ['DE-NI'] })
assert.equal(cluster.extendedData.applicabilityMappingInheritance, 'boundary')
cluster.dimensionTags = { phase: 'GLOBAL' }
const beforeLedger = read(ledgerRow.prospectiveCopyPath)
const afterLedger = structuredClone(beforeLedger)
const decision = afterLedger.decisions.find((d: any) => d.goalId === clusterId)
assert.equal(decision.semanticKind, 'curricularArea')
assert.equal(decision.decisionStatus, 'authoritative')
const oldCluster = before.goals.find((g: any) => g.id === clusterId)
assert.equal(decision.sourceFingerprint, fingerprintSemanticKindSourceGoal(oldCluster))
const previousFingerprint = decision.sourceFingerprint
decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(cluster)
assert.notEqual(previousFingerprint, decision.sourceFingerprint)
assert.deepEqual(afterLedger.counts, beforeLedger.counts)
const byBefore = new Map(before.goals.map((g: any) => [g.id, g]))
const byAfter = new Map(after.goals.map((g: any) => [g.id, g]))
const atomIds = beforeLedger.decisions.filter((d: any) => d.semanticKind === 'curricularAtomic').map((d: any) => d.goalId)
assert.equal(atomIds.length, 383)
const canonicalDeltas = before.goals.filter((g: any) => stableGoalBookJson(g) !== stableGoalBookJson(byAfter.get(g.id)))
assert.deepEqual(canonicalDeltas.map((g: any) => g.id), [clusterId])
const kindDeltas = beforeLedger.decisions.filter((d: any, i: number) => stableGoalBookJson(d) !== stableGoalBookJson(afterLedger.decisions[i]))
assert.deepEqual(kindDeltas.map((d: any) => d.goalId), [clusterId])
const currentAll383 = atomIds.map((id: string) => {
  const old = byBefore.get(id) as any
  const next = byAfter.get(id) as any
  assert.deepEqual(old, next)
  const ownInputs = [
    fingerprintSemanticKindSourceGoal(old),
    fingerprintGoalForEvidence(old, 'goal-evidence-v1', 'curricularAtomic'),
    fingerprintGoalEvidenceReviewInput(old, 'goal-evidence-v1', {}, 'curricularAtomic'),
    fingerprintGoalForPositiveEvidence(old, 'curricularAtomic'),
    fingerprintPositiveGoalEvidenceReviewInput(old, 'unchanged-technical-comparison-criteria', {}, 'curricularAtomic'),
  ]
  assert.deepEqual(ownInputs, [
    fingerprintSemanticKindSourceGoal(next),
    fingerprintGoalForEvidence(next, 'goal-evidence-v1', 'curricularAtomic'),
    fingerprintGoalEvidenceReviewInput(next, 'goal-evidence-v1', {}, 'curricularAtomic'),
    fingerprintGoalForPositiveEvidence(next, 'curricularAtomic'),
    fingerprintPositiveGoalEvidenceReviewInput(next, 'unchanged-technical-comparison-criteria', {}, 'curricularAtomic'),
  ])
  assert.deepEqual(buildGoalDescriptionCanonicalContext(old), buildGoalDescriptionCanonicalContext(next))
  assert.deepEqual(goalEvidenceReviewInputPayload(old, 'goal-evidence-v1', {}, 'curricularAtomic'),
                   goalEvidenceReviewInputPayload(next, 'goal-evidence-v1', {}, 'curricularAtomic'))
  return { goalId: id, semanticKindSourceFingerprint: ownInputs[0],
           currentGoalEvidenceFingerprint: ownInputs[1], canonicalContextDigest: digest(buildGoalDescriptionCanonicalContext(old)),
           allOwnGoalEvidenceAndPositiveInputsExact: true }
})
for (const id of cluster.contains) assert.equal((byBefore.get(id) as any).dimensionTags.phase, 'GLOBAL')

const config = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
const manifest = read(config.compositionViewManifestPath)
const qa = read(config.goalVisualizationQaPath)
const assetDigests: Record<string, string> = {}
for (const row of qa.records) if (row.imageUrl) {
  assetDigests[row.imageUrl] = `sha256:${sha(row.publicAssetPath)}`
  assert.equal(assetDigests[row.imageUrl], row.assetSha256)
}
const inputs: any = {
  landscape: before, semanticKindLedger: beforeLedger,
  compositionViewManifest: manifest,
  compositionViewSources: manifest.sourcePaths.map((p: string) => ({ path: p, view: read(p) })),
  navigationView: read(manifest.navigationViewPath), durationModelPolicy: read(manifest.durationModelPolicyPath),
  goalVisualizationQa: qa, goalVisualizationAssetDigests: assetDigests,
  evidenceReviewSources: config.evidenceReviewPaths.map((p: string) => ({ path: p, text: readFileSync(join(root, p), 'utf8') })),
  config,
}
const oldModel = buildGoalBookModel(inputs)
const newModel = buildGoalBookModel({ ...inputs, landscape: after, semanticKindLedger: afterLedger })
assert.equal(oldModel.pages.length, 383)
assert.deepEqual(oldModel.pages, newModel.pages)
assert.deepEqual(oldModel.chapters, newModel.chapters)
assert.deepEqual(oldModel.navigation, newModel.navigation)
const { digest: oldDigest, source: oldSource, ...oldOther } = oldModel
const { digest: newDigest, source: newSource, ...newOther } = newModel
assert.deepEqual(oldOther, newOther)
const sourceDeltas = Object.keys(oldSource).filter((k) => stableGoalBookJson((oldSource as any)[k]) !== stableGoalBookJson((newSource as any)[k]))
assert.deepEqual(sourceDeltas.sort(), ['landscapeDigest', 'semanticKindLedgerDigest'])
const oldSources = buildGoalBookOriginalSources(oldModel)
const newSources = buildGoalBookOriginalSources(newModel)
const { bookDigest: oldSourceBook, ...oldRows } = oldSources
const { bookDigest: newSourceBook, ...newRows } = newSources
assert.deepEqual(oldRows, newRows)
const actualD = []
for (const sub of ['native-d18', 'native-d5']) {
  const prefix = `${base}/biologie-ni-eighteen-reviewed-integration-candidate-v1/${sub}`
  const bundle = read(`${prefix}/bundle/manifest.json`)
  const reviewInput = read(`${prefix}/bundle/review-input.json`)
  const oldDto = buildGoalDescriptionReviewInput({ bundle, reviewInput, landscape: before })
  const newDto = buildGoalDescriptionReviewInput({ bundle, reviewInput, landscape: after })
  assert.deepEqual(oldDto, newDto)
  for (const round of ['round-a', 'round-b']) {
    assert.deepEqual(newDto, read(`${prefix}/${round}/description-review-input.json`))
  }
  actualD.push({ package: prefix, goalCount: newDto.goalCount,
                bookDigest: newDto.bookDigest, reviewInputFingerprint: newDto.reviewInputFingerprint,
                wholeNativeConstructedDtoAndBothOriginalRoundInputsExact: true })
}
const inputPaths = ['docs/landscape-runtime.schema.json', 'app/scripts/goalBookModel.ts',
  'app/scripts/goalBookOriginalSources.ts', 'app/scripts/validateGoalDescriptionReviewCampaign.ts',
  'app/scripts/goalEvidenceProfileModel.ts', 'app/scripts/positiveGoalEvidenceProfileModel.ts',
  config.compositionViewManifestPath, manifest.navigationViewPath, manifest.durationModelPolicyPath,
  config.goalVisualizationQaPath, ...manifest.sourcePaths]
write('in-memory-current-native-comparison.actual.json', {
  schemaVersion: 1, checkedAtUTC: new Date().toISOString(), reviewer: '/root/chem_qa_native_guard',
  clusterId, beforeCluster: oldCluster, afterCluster: cluster,
  clusterSourceFingerprintBefore: previousFingerprint, clusterSourceFingerprintAfter: decision.sourceFingerprint,
  onlyCanonicalWholeGoalChanged: clusterId, onlySemanticKindDecisionFingerprintChanged: clusterId,
  wholeCanonical464: before.goals.length, sameCurricularAtomic383: atomIds,
  all383NativeGoalContextFingerprints: currentAll383,
  actualNativeFull383PageObjectsExact: true, actualNativeChaptersAndNavigationExact: true,
  onlyBookModelSourceMetadataChanged: sourceDeltas,
  oldFullBookDigest: oldDigest, newFullBookDigest: newDigest,
  allOriginalSourceDocumentsEvidenceAndGoalScopeRowsExact: true,
  originalSourcesOldBookDigest: oldSourceBook, originalSourcesNewBookDigest: newSourceBook,
  existingD18AndD5ExactNativeDtos: actualD,
  schemaNecessaryMetadata: { dimensionTags: { phase: 'GLOBAL' } },
  inputs: inputPaths.map((p) => ({ path: p, sha256: sha(p) })),
  hypotheticalInMemoryOnly: true, activeWrites: 0, newScientificCompletions: 0,
  humanApproval: false, humanTrial: false, result: 'PASS',
})
console.log(`PASS: only cluster phase and its authoritative source fingerprint change; all 383 goals, pages, sources and existing D23 inputs exact. New cluster fingerprint: ${decision.sourceFingerprint}`)
