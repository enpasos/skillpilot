import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

async function main() {
  const root = resolve(process.argv[2])
  const out = resolve(root, process.argv[3])
  const guard = JSON.parse(readFileSync(resolve(out, 'actual-before-current-V13-two-reviewed-requires-bindings.guard.json'), 'utf8'))
  const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex')
  const load = (key: string) => {
    const input = guard.inputs[key]
    const bytes = readFileSync(resolve(root, input.path))
    if (bytes.length !== input.wholeBytes || sha(bytes) !== input.sha256) throw new Error(`Changed guarded original: ${key}`)
    return bytes.toString('utf8')
  }
  const originalCAN = JSON.parse(load('originalV12'))
  const currentCAN = JSON.parse(load('qualifiedV13'))
  const originalP = load('originalP336')
  const originalSEM = load('originalRootSEM485')
  const originalV = JSON.parse(load('originalV336'))
  load('foreignWholeRequiresAcceptance')
  const originalGoals = new Map<string, any>(originalCAN.goals.map((g: any) => [g.id, g]))
  const currentGoals = new Map<string, any>(currentCAN.goals.map((g: any) => [g.id, g]))
  const low = await import(pathToFileURL(resolve(root, guard.inputs.nativeLowModel.path)).href)
  const model = await import(pathToFileURL(resolve(root, guard.inputs.nativePModel.path)).href)
  const semModel = await import(pathToFileURL(resolve(root, guard.inputs.nativeSEMModel.path)).href)
  const eq = (a: any, b: any) => low.stableGoalEvidenceJson(a) === low.stableGoalEvidenceJson(b)
  const changedGoals: any[] = []
  if (originalGoals.size !== 485 || currentGoals.size !== 485) throw new Error('Expected485 whole goals')
  for (const [id, before] of originalGoals) {
    const after = currentGoals.get(id)
    if (!after) throw new Error(`Missing current goal ${id}`)
    if (eq(before, after)) continue
    const fields = Object.keys({ ...before, ...after }).filter((k) => !eq(before[k], after[k]))
    if (!eq(fields, ['requires'])) throw new Error(`Unexpected goal delta: ${id}/${fields}`)
    changedGoals.push({ goalId: id, fields, beforeRequires: before.requires, afterRequires: after.requires })
  }
  if (changedGoals.length !== 2 || !changedGoals.some((g) => g.goalId.startsWith('4fef')) || !changedGoals.some((g) => g.goalId.startsWith('776457c2'))) throw new Error('Unexpected reviewed two-goal scope')
  const changedIds = new Set(changedGoals.map((g) => g.goalId))
  const oldLedger = JSON.parse(originalSEM)
  const ledger = structuredClone(oldLedger)
  const semChanges: any[] = []
  for (const row of ledger.decisions) {
    const goal = currentGoals.get(row.goalId)
    const expected = semModel.fingerprintSemanticKindSourceGoal(goal)
    if (row.sourceFingerprint === expected) continue
    if (!changedIds.has(row.goalId)) throw new Error(`Unexpected SEM stale binding ${row.goalId}`)
    semChanges.push({ goalId: row.goalId, before: row.sourceFingerprint, after: expected })
    row.sourceFingerprint = expected
  }
  if (semChanges.length !== 2) throw new Error('Expected exactly2 SEM bindings')
  let semRaw = originalSEM
  for (const change of semChanges) {
    if (semRaw.split(change.before).length !== 2) throw new Error('SEM replacement is not unique')
    semRaw = semRaw.replace(change.before, change.after)
  }
  if (!eq(JSON.parse(semRaw), ledger)) throw new Error('Whole SEM raw successor mismatch')
  const kindById = new Map<string, string>(ledger.decisions.map((d: any) => [d.goalId, d.semanticKind]))
  const req = createRequire(resolve(root, 'app/package.json'))
  const ajv = new (req('ajv/dist/2020.js').default)({ allErrors: true, strict: true })
  req('ajv-formats')(ajv)
  const schema = ajv.compile(JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8')))
  const qa = new Map<string, any>(originalV.records.map((v: any) => [v.goalId, v]))
  const lines = originalP.trimEnd().split('\n')
  const pChanges: any[] = []
  const beforeStale: any[] = []
  const output = lines.map((raw) => {
    const old = JSON.parse(raw)
    const goal = currentGoals.get(old.goalId)
    const visual = qa.get(old.goalId)
    const actualPNG = readFileSync(resolve(root, 'app/public' + visual.imageUrl))
    const actualDigest = 'sha256:' + sha(actualPNG)
    if (actualDigest !== visual.assetSha256 || actualDigest !== visual.aiApprovedAssetSha256) throw new Error(`Current image mismatch ${old.goalId}`)
    const digests = { [visual.imageUrl]: actualDigest }
    const kind = kindById.get(old.goalId)
    const oldErrors = model.validatePositiveGoalEvidenceRecordSemantics(old, goal, digests, kind)
    if (oldErrors.length) beforeStale.push({ goalId: old.goalId, actualRejected: true, errors: oldErrors })
    const next = { ...old, reviewInputFingerprint: model.fingerprintPositiveGoalEvidenceReviewInput(goal, old.reviewCriteriaFingerprint, digests, kind) }
    if (next.reviewInputFingerprint !== old.reviewInputFingerprint) {
      if (!changedIds.has(old.goalId)) throw new Error(`Unexpected P rebind ${old.goalId}`)
      pChanges.push({ goalId: old.goalId, before: old.reviewInputFingerprint, after: next.reviewInputFingerprint })
      let n = 0
      raw = raw.replace(/("reviewInputFingerprint"\s*:\s*")sha256:[0-9a-f]{64}(")/g, (_, a, b) => { n += 1; return a + next.reviewInputFingerprint + b })
      if (n !== 1 || !eq(JSON.parse(raw), next)) throw new Error('P raw one-field successor mismatch')
    }
    if (!schema(next)) throw new Error(JSON.stringify(schema.errors))
    const errors = model.validatePositiveGoalEvidenceRecordSemantics(next, goal, digests, kind)
    if (errors.length) throw new Error(JSON.stringify(errors))
    if (old.status !== 'needs_human_review' || old.reviewAuthority !== 'ai_candidate' || old.evidenceLevel !== 'E1' || old.maximumClaimScope !== 'G1') throw new Error('Historical AI/Human status changed')
    return raw
  })
  if (lines.length !== 336 || pChanges.length !== 2 || beforeStale.length !== 2) throw new Error('Unexpected P scope')
  const write = (name: string, text: string) => {
    const path = resolve(out, name)
    if (existsSync(path)) throw new Error(`Immutable output exists ${path}`)
    writeFileSync(path, text)
    return { path: relative(root, path), sha256: sha(text), wholeBytes: Buffer.byteLength(text) }
  }
  const wholeP = write('whole-P336-only-two-current-reviewed-requires-input-fingerprint-successors.jsonl', output.join('\n') + '\n')
  const wholeSEM = write('whole-SEM485-only-two-current-reviewed-requires-source-fingerprint-successors.json', semRaw)
  const result = {
    at: new Date().toISOString(), role: 'Technical qualified two-Requires binding only; original scientific judgments and all statuses retained.',
    guardedInputs: guard.inputs, changedWholeGoals: changedGoals, positiveChanges: pChanges, semanticKindSourceChanges: semChanges,
    actualOriginalPStaleRejected: beforeStale,
    counts: { wholeGoals: 485, unchangedWholeGoals: 483, positiveProfiles: 336, positiveCases: output.reduce((n, raw) => n + JSON.parse(raw).profile.applicationCaseBriefs.length, 0), unchangedWholeRawPositiveLines: 334, exactRetainedWholeSEMDecisions: 483, positiveInputFingerprintOnlyChanges: 2, semanticKindSourceFingerprintOnlyChanges: 2, currentPositiveSchemaAndSemanticsErrors: 0, currentSemanticSourceFingerprintErrors: 0 },
    wholeP336: wholeP, wholeSEM485: wholeSEM, wholeV336Retained: guard.inputs.originalV336,
    wholeProfileCasesGoalFingerprintStatusAuthorityReasonAndAllOtherFieldsExact: true,
    originalCurrentSEMKindsCountsReasonsAndAllOtherFieldsExact: true,
    newScienceOrHumanReview: false, noBookCentralBuildOrLiveWrites: true, strictNetGain: 0,
  }
  const receipt = write('actual-native-two-P-input-and-two-SEM-source-binding-only.result.json', JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ receipt, wholeP, wholeSEM, counts: result.counts }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
