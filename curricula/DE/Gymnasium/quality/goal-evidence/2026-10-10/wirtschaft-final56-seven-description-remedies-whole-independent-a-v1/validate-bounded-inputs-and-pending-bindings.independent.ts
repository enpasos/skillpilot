import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

async function main() {
  const root = process.cwd()
  const own = dirname(fileURLToPath(import.meta.url))
  const read = (name: string) => JSON.parse(readFileSync(resolve(own, name), 'utf8'))
  const { default: Ajv2020 } = await import(resolve(root, 'app/node_modules/ajv/dist/2020.js'))
  const { default: addFormats } = await import(resolve(root, 'app/node_modules/ajv-formats/dist/index.js'))
  const { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceProfile } = await import(
    resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')
  )
  const schema = JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8'))
  const ajv = new Ajv2020({ allErrors: true, strict: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  const before = read('input-snapshots/seven-whole-original-goals.BEFORE.json').goals
  const after = read('input-snapshots/seven-whole-proposed-goals.INERT.json').goals
  const kinds = read('input-snapshots/current-selected-authoritative-semantic-kinds.json').decisions
  const profiles = readFileSync(resolve(own, 'input-snapshots/seven-actual-active-whole-P-records.jsonl'), 'utf8')
    .trim().split('\n').map((line) => JSON.parse(line))
  const neighbor = read('input-snapshots/ancillary-duty-neighbor-actual-whole-P.json')
  if (profiles.length !== 7 || new Set(profiles.map((p) => p.goalId)).size !== 7) throw new Error('Expected seven unique active whole P profiles')
  for (const record of [...profiles, neighbor]) {
    if (!validate(record)) throw new Error(`${record.goalId}: ${ajv.errorsText(validate.errors)}`)
    if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate'
      || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') {
      throw new Error(`${record.goalId}: unexpected or upgraded candidate status`)
    }
    if (record.profileFingerprint !== fingerprintPositiveGoalEvidenceProfile(record.profile)) {
      throw new Error(`${record.goalId}: active whole profile body does not match its fingerprint`)
    }
  }
  const pending = profiles.map((record) => {
    const oldGoal = before.find((g: { id: string }) => g.id === record.goalId)
    const proposedGoal = after.find((g: { id: string }) => g.id === record.goalId)
    const kind = kinds.find((k: { goalId: string }) => k.goalId === record.goalId)
    if (!oldGoal || !proposedGoal || kind?.semanticKind !== 'curricularAtomic' || kind?.decisionStatus !== 'authoritative') {
      throw new Error(`${record.goalId}: missing exact whole goal/current atomic kind`)
    }
    const beforeFingerprint = fingerprintGoalForPositiveEvidence(oldGoal, kind.semanticKind)
    const candidateFingerprint = fingerprintGoalForPositiveEvidence(proposedGoal, kind.semanticKind)
    if (record.goalFingerprint !== beforeFingerprint) throw new Error(`${record.goalId}: current P goal fingerprint mismatch`)
    if (candidateFingerprint === record.goalFingerprint) throw new Error(`${record.goalId}: expected new description to require new goal binding`)
    return {
      goalId: record.goalId, activeWholeProfileBodyStillMatches: true, activeBeforeGoalBindingMatches: true,
      candidateNeedsNewGoalFingerprint: true, candidateGoalFingerprintCalculatedOnly: candidateFingerprint,
      newReviewInputFingerprint: 'not_calculated_resource_and_native_input_rebinding_pending',
      nativeDCompletionClaimed: false,
    }
  })
  const reviews = readFileSync(resolve(own, 'seven-whole-description-content.independent-review.jsonl'), 'utf8')
    .trim().split('\n').map((line) => JSON.parse(line))
  if (reviews.length !== 7 || new Set(reviews.map((r) => r.goalId)).size !== 7) throw new Error('Expected seven unique content reviews')
  const required = ['positiveUnderstandingDe', 'positiveUnderstandingEn', 'concreteExpectedPerformanceDe',
    'concreteExpectedPerformanceEn', 'transferDe', 'transferEn', 'insufficientCounterexampleDe',
    'insufficientCounterexampleEn', 'rationaleDe', 'rationaleEn']
  for (const r of reviews) {
    if (r.authoredByReviewer || r.authorReceiptRead || !r.blindToOtherCurrentDescriptionRuns) throw new Error(`${r.goalId}: independence violation`)
    if (r.status !== 'needs_human_review' || r.reviewAuthority !== 'ai_candidate' || r.evidenceLevel !== 'E1' || r.maximumClaimScope !== 'G1') {
      throw new Error(`${r.goalId}: upgraded review status`)
    }
    for (const key of required) if (typeof r[key] !== 'string' || !r[key].trim()) throw new Error(`${r.goalId}: missing ${key}`)
  }
  const changes = read('exact-whole-object-description-diff.audit.json')
  if (changes.changedStringCount !== 14 || !changes.allOtherFieldsUnchanged) throw new Error('Unexpected change scope')
  const bindings = read('input-bindings.json')
  for (const a of [...bindings.inputArtifacts, ...bindings.preservedPriorOwnEvidence]) {
    const bytes = readFileSync(resolve(root, a.path))
    const digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
    if (digest !== a.digest || bytes.length !== a.bytes) throw new Error(`Changed source/endguard: ${a.path}`)
  }
  console.log(JSON.stringify({
    claim: 'Bounded whole-input schema/status, active-before/profile fingerprints, own independent record completeness and unchanged byte guards only',
    completedAt: new Date().toISOString(), node: process.version,
    tsx: JSON.parse(readFileSync(resolve(root, 'app/node_modules/tsx/package.json'), 'utf8')).version,
    wholePSchemaPassCount: profiles.length + 1, independentContentRecords: reviews.length,
    exactBilingualDescriptionChanges: 14, activeGoalKind: 'curricularAtomic',
    pendingNewGoalAndInputBindings: pending, unchangedInputArtifacts: bindings.inputArtifacts.length,
    unchangedPriorOwnEvidenceArtifacts: bindings.preservedPriorOwnEvidence.length,
    activeWrites: false, humanApprovalClaimed: false, completeSourceOrJurisdictionApprovalClaimed: false,
    imagesReviewedForNewDescriptions: false, finalNativeDResolutionClaimed: false,
  }, null, 2))
}
main().catch((error) => { console.error(error); process.exitCode = 1 })
