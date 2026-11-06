import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal, parseSemanticKindLedger } from '../../../app/scripts/goalBookModel'

const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const ledgerPath = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const candidatePath = 'tmp/math-memory-pilot-5cb-current-candidate.json'
const draftPath = 'tmp/math-memory-pilot-5cb-current-ledger-DRAFT.json'
const baseCommit = '5cb5e567d08bc9f640942529d9099cbce03a4747'
const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
const binding = (path: string) => ({ path, sha256: sha(readFileSync(path)) })
const originalBytes = execFileSync('git', ['show', `${baseCommit}:${sourcePath}`], { maxBuffer: 8 * 1024 * 1024 })
assert.equal(sha(originalBytes), 'e0ff0cafccf0f638c4cb36d5a252480ccc7062750619ef0452a447775bf96fe1')
const original = JSON.parse(originalBytes.toString('utf8'))
const candidateBytes = readFileSync(candidatePath)
assert.equal(sha(candidateBytes), 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6')
const candidate = JSON.parse(candidateBytes.toString('utf8'))
const ledgerBytes = readFileSync(ledgerPath)
const originalLedgerBytes = execFileSync('git', ['show', `${baseCommit}:${ledgerPath}`])
assert.equal(sha(ledgerBytes), sha(originalLedgerBytes))
const ledger = JSON.parse(ledgerBytes.toString('utf8'))
const originalById = new Map(original.goals.map((goal: any) => [goal.id, goal]))
const candidateById = new Map(candidate.goals.map((goal: any) => [goal.id, goal]))
const originalKinds = parseSemanticKindLedger(ledger, original, original.landscapeId, sourcePath)
assert.throws(() => parseSemanticKindLedger(ledger, candidate, candidate.landscapeId, sourcePath), /stale/u)
const expectedChangedIds = new Set([
  'ca708087-71f8-5fae-91c5-b80721a4208f', 'bd55594a-3e06-5097-8324-4f2f1349fd2a',
  'ffbdd7a9-45c6-54f1-988c-58256ca05eeb', '1eb0b286-2dac-5164-8d39-cd36c5704bc4',
])
const draft = structuredClone(ledger)
const changed: any[] = []
for (const row of draft.decisions) {
  const before: any = originalById.get(row.goalId)
  const after: any = candidateById.get(row.goalId)
  const fingerprint = fingerprintSemanticKindSourceGoal(after)
  if (row.sourceFingerprint === fingerprint) continue
  assert(expectedChangedIds.has(row.goalId))
  assert.equal(row.semanticKind, 'memory')
  assert.equal(row.sourceFingerprint, fingerprintSemanticKindSourceGoal(before))
  changed.push({ goalId: row.goalId, semanticKind: row.semanticKind,
    before: structuredClone(before), after: structuredClone(after),
    originalDecision: structuredClone(row), candidateSourceFingerprint: fingerprint })
  row.sourceFingerprint = fingerprint
}
assert.deepEqual(new Set(changed.map(row => row.goalId)), expectedChangedIds)
const candidateKinds = parseSemanticKindLedger(draft, candidate, candidate.landscapeId, sourcePath)
assert.deepEqual([...candidateKinds.semanticKindByGoalId], [...originalKinds.semanticKindByGoalId])
assert.deepEqual(draft.counts, ledger.counts)
const curricularIds = ledger.decisions.filter((row: any) => row.semanticKind === 'curricularAtomic').map((row: any) => row.goalId)
assert.equal(curricularIds.length, 807)
for (const id of curricularIds) assert.deepEqual(candidateById.get(id), originalById.get(id))
writeFileSync(draftPath, JSON.stringify(draft, null, 2) + '\n')
const result = {
  status: 'candidate-kind-input-impact-only-not-current-qa-approval', baseCommit,
  source: { path: sourcePath, sha256: sha(originalBytes) }, candidate: binding(candidatePath),
  originalLedger: binding(ledgerPath), privateLedgerDraft: binding(draftPath),
  verifier: binding('docs/dev/ci-graph-repairs/verify_math_memory_kind_candidate.ts'),
  semanticKindImplementation: binding('app/scripts/goalBookModel.ts'),
  schema: binding('contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'),
  normalizationProfile: binding('contracts/curriculum-package/v1/profiles/semantic-normal-form-v1.profile.json'),
  oldLedgerAgainstCandidateRejectedAsStale: true,
  changedSourceBindings: changed, unchangedKindDecisions: ledger.decisions.length,
  unchangedCurricularGoalIds: curricularIds,
  sourceApplied: false, draftKindBindingsApproved: false,
  note: 'Four private candidate fingerprints expose the exact fresh kind-review obligation. Parser validity is not review authority or D/P/A/M/V approval.',
}
writeFileSync('tmp/math-memory-pilot-5cb-kind-impact.json', JSON.stringify(result, null, 2) + '\n')
console.log(JSON.stringify({ status: result.status, staleMemoryInputs: changed.length,
  unchangedCurricularGoals: curricularIds.length, sourceApplied: false, draftKindBindingsApproved: false }))
