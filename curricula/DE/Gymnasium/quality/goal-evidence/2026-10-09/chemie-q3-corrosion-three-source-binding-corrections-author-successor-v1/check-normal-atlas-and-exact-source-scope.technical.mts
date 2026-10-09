// SPDX-License-Identifier: Apache-2.0
// Real normal source-atlas API checks; only candidate evidence and temporary files are written.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { buildGoalBookSourceAtlasInputs, checkGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const repo = process.cwd()
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-corrosion-three-source-binding-corrections-author-successor-v1'
const candidateConfigPath = `${own}/normal/candidate-source-atlas.inputs.json`
const baselineConfigPath = `${own}/baseline/current-atlas-config.original.json`
const baselineConfig = readGoalBookSourceAtlasInputConfig(baselineConfigPath, repo)
const config = readGoalBookSourceAtlasInputConfig(candidateConfigPath, repo)
const baseline = buildGoalBookSourceAtlasInputs(baselineConfig, repo)
const candidate = buildGoalBookSourceAtlasInputs(config, repo)
const save = (path: string, text: string) => {
  JSON.parse(text)
  const full = resolve(repo, own, path)
  mkdirSync(dirname(full), { recursive: true })
  writeFileSync(`${full}.writing`, text)
  renameSync(`${full}.writing`, full)
}
const publish = (path: string, value: unknown) => save(path, `${JSON.stringify(value, null, 2)}\n`)
const digest = (data: string | Buffer) => `sha256:${createHash('sha256').update(data).digest('hex')}`
const aliases = JSON.parse(readFileSync(resolve(repo, own, 'candidate/exact-six-source-row-and-three-routing-path-deltas.author-candidate.json'), 'utf8')).aliases as Record<string, string>
const originalPaths = new Map(Object.entries(aliases).map(([oldPath, candidatePath]) => [candidatePath, oldPath]))
const normalWitness = (w: Record<string, unknown>) => ({ ...w,
  mappingPath: originalPaths.get(String(w.mappingPath)) ?? w.mappingPath,
  sourceExtractionPath: originalPaths.get(String(w.sourceExtractionPath)) ?? w.sourceExtractionPath,
})
const witnessKey = (w: Record<string, unknown>) => JSON.stringify(normalWitness(w))
const originalScopes = new Map(baseline.receipt.scopes.map(s => [s.key, s]))
const sourceIDs = new Set([
  'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-001-8b5653dd',
  'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-002-d041abcd',
  'rp-chem-sekii-rp-ch-sekii-2022-baustein-4-5-003-416a1404',
  'th-chem-sekii-th-ch-sekii-4-1-5-korrosion-erlautern-118-01-8b539a22',
])
const scopeDeltas = candidate.receipt.scopes.map(scope => {
  const old = originalScopes.get(scope.key)
  assert.ok(old)
  const oldSet = new Set(old.witnesses.map(witnessKey))
  const newSet = new Set(scope.witnesses.map(witnessKey))
  const addedWitnesses = scope.witnesses.filter(w => !oldSet.has(witnessKey(w)))
  const removedWitnesses = old.witnesses.filter(w => !newSet.has(witnessKey(w)))
  for (const w of [...addedWitnesses, ...removedWitnesses]) assert.ok(sourceIDs.has(w.sourceGoalId))
  return { key: scope.key,
    addedWholeGoalIds: scope.goalIds.filter(id => !old.goalIds.includes(id)),
    removedWholeGoalIds: old.goalIds.filter(id => !scope.goalIds.includes(id)),
    addedWitnesses, removedWitnesses,
    oldWholeGoalIds: old.goalIds, candidateWholeGoalIds: scope.goalIds,
  }
})
assert.equal(originalScopes.size, candidate.receipt.scopes.length)
assert.deepEqual(candidate.receipt.counts, baseline.receipt.counts)
assert.deepEqual(scopeDeltas.filter(s => s.addedWitnesses.length || s.removedWitnesses.length).map(s => s.key), ['DE-RP/SekII/GK', 'DE-TH/SekII/GK'])
const thDuty = 'th-chem-sekii-th-ch-sekii-4-1-5-korrosion-erlautern-118-01-8b539a22'
assert.ok(!candidate.receipt.scopes.find(s => s.key === 'DE-TH/SekII/GK')!.witnesses.some(w => w.sourceGoalId === thDuty))
assert.ok(candidate.receipt.scopes.find(s => s.key === 'DE-TH/SekII/LK')!.witnesses.some(w => w.sourceGoalId === thDuty))
const rpIDs = [...sourceIDs].filter(id => id.startsWith('rp-'))
for (const course of ['GK', 'LK']) for (const sourceGoalId of rpIDs) {
  assert.ok(candidate.receipt.scopes.find(s => s.key === `DE-RP/SekII/${course}`)!.witnesses.some(w => w.sourceGoalId === sourceGoalId))
}

// Existing normal offline provenance behavior: original downloads are optional
// caches whose exact hashes are pinned by the ordinary source snapshot metadata.
// All actual mandatory JSON inputs and outputs are copied as regular files.
const temporaryRepo = mkdtempSync(resolve(tmpdir(), 'skillpilot-COR2-source-candidate-'))
let normalOfflineCheck = false
let copiedMandatoryInputs = 0
try {
  const snapshots = new Set((config.sourceDocumentSnapshots ?? []).map(s => s.path))
  for (const input of candidate.receipt.inputBindings) {
    if (snapshots.has(input.path)) continue
    const data = readFileSync(resolve(repo, input.path))
    assert.equal(digest(data), input.sha256)
    const target = resolve(temporaryRepo, input.path)
    mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, data)
    copiedMandatoryInputs++
  }
  const targetConfig = resolve(temporaryRepo, candidateConfigPath)
  mkdirSync(dirname(targetConfig), { recursive: true }); writeFileSync(targetConfig, readFileSync(resolve(repo, candidateConfigPath)))
  for (const [path, data] of Object.entries(candidate.outputs)) {
    const target = resolve(temporaryRepo, path)
    mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, data)
  }
  const actual = checkGoalBookSourceAtlasInputs(candidateConfigPath, temporaryRepo)
  assert.deepEqual(actual.outputs, candidate.outputs)
  assert.deepEqual(actual.receipt.counts, candidate.receipt.counts)
  normalOfflineCheck = true
} finally { rmSync(temporaryRepo, { recursive: true, force: true }) }

const landscape = normalizeCanonicalLandscape(JSON.parse(readFileSync(resolve(repo, config.landscapePath), 'utf8')))
const fourWholeScopes = candidate.receipt.scopes.filter(s => ['DE-RP/SekII/GK', 'DE-RP/SekII/LK', 'DE-TH/SekII/GK', 'DE-TH/SekII/LK'].includes(s.key))
for (const scope of fourWholeScopes) {
  const view = normalizeCompositionView(JSON.parse(candidate.outputs[scope.path]))
  assert.deepEqual(compileCompositionView(view, landscape).findings.filter(f => f.severity === 'error'), [])
  save(`normal/whole-${scope.key.replaceAll('/', '-')}.candidate.view.json`, candidate.outputs[scope.path])
  save(`normal/whole-${scope.key.replaceAll('/', '-')}.baseline.view.json`, baseline.outputs[originalScopes.get(scope.key)!.path])
}
save('normal/normal-generated-candidate.compact-source-projection.receipt.json', candidate.outputs[`${config.outputDirectory}/source-projection.receipt.json`])
publish('normal/actual-normal-source-atlas-and-whole-scope.result.json', {
  schemaVersion: 1, codeLicense: 'Apache-2.0', evidenceLicense: 'CC-BY-4.0',
  status: 'PASS_normal_candidate_atlas_offline_exact_inputs_and_scope_checks_only',
  baselineCounts: baseline.receipt.counts, candidateCounts: candidate.receipt.counts,
  normalOfflineCheck, copiedMandatoryInputs,
  temporaryRepositoryContainedRegularExactFilesOnly: true,
  temporaryRepositoryRemoved: !existsSync(temporaryRepo),
  baselineInputBindings: baseline.receipt.inputBindings,
  candidateInputBindings: candidate.receipt.inputBindings,
  allScopeDeltas: scopeDeltas, fourWholeAffectedScopes: fourWholeScopes,
  actualSourceCourseCorrectionOnly: true,
  noCandidateMembershipIsNewWholeSourceOrMaterialApproval: true,
  bookLocalAtlasIsCompleteOperativeLearnerRoute: false,
  thirdRPOriginalWholeDutyAndPartialPartnersPreserved: true,
  wholePartnerMaterialAndPracticalOperatorFindingsRemainOpen: ['COR-A-SOURCE-003', 'COR-A-SOURCE-004'],
  newD_P_A_M_VApproval: false, newStrictClosures: 0, restoredBindings: 0,
  previousIndependentAReviewIsNotThisAuthorSuccessorsIndependentReview: true,
  humanApproval: false, humanTrial: false, activeWrites: 0,
})
console.log(JSON.stringify({ status: 'PASS', normalOfflineCheck,
  counts: candidate.receipt.counts,
  changedScopes: scopeDeltas.filter(s => s.addedWitnesses.length || s.removedWitnesses.length).map(s => ({
    key: s.key, addedGoals: s.addedWholeGoalIds, removedGoals: s.removedWholeGoalIds,
    addedWitnesses: s.addedWitnesses.length, removedWitnesses: s.removedWitnesses.length,
  })), newStrictClosures: 0 }))
