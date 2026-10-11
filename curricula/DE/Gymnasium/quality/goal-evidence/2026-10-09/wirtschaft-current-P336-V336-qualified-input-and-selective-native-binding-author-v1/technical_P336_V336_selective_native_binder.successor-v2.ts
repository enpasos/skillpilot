import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

// Executed with the current repository's tsx binary; dependency capsules stay outside curricula.
// Diagnostic mode writes findings only. Final binding requires the exact accepted frame SHA.
async function main() {
  const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
    const split = arg.indexOf('=')
    if (split < 0 || !arg.startsWith('--')) throw new Error(`Expected --name=value: ${arg}`)
    return [arg.slice(2, split), arg.slice(split + 1)]
  }))
  for (const key of ['repo-root', 'index', 'canonical', 'out']) {
    if (!args[key]) throw new Error(`Missing --${key}`)
  }
  const root = resolve(args['repo-root'])
  const repoPath = (path: string) => {
    const absolute = resolve(root, path)
    const rel = relative(root, absolute)
    if (rel === '..' || rel.startsWith(`..${sep}`)) throw new Error(`Nonportable input: ${path}`)
    return absolute
  }
  const sha = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex')
  const binding = (path: string) => {
    const bytes = readFileSync(repoPath(path))
    return { path, sha256: sha(bytes), wholeBytes: bytes.length }
  }
  const indexBytes = readFileSync(repoPath(args.index))
  const index = JSON.parse(indexBytes.toString('utf8'))
  const frameBytes = readFileSync(repoPath(args.canonical))
  const frame = JSON.parse(frameBytes.toString('utf8'))
  const finalMode = Boolean(args['accepted-frame-sha'])
  if (finalMode && sha(frameBytes) !== args['accepted-frame-sha']) throw new Error('Accepted frame SHA does not match actual whole bytes')
  const kindById = new Map<string, string>()
  if (args.ledger) {
    const ledger = JSON.parse(readFileSync(repoPath(args.ledger), 'utf8'))
    if (ledger.sourceLandscapeId !== frame.landscapeId) throw new Error('Kind ledger landscape mismatch')
    for (const decision of ledger.decisions) {
      if (decision.decisionStatus !== 'authoritative') throw new Error(`Not authoritative: ${decision.goalId}`)
      if (kindById.has(decision.goalId)) throw new Error(`Duplicate kind: ${decision.goalId}`)
      kindById.set(decision.goalId, decision.semanticKind)
    }
  } else if (finalMode) throw new Error('Final binding requires exact current authoritative kind ledger')
  const model = await import(pathToFileURL(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href)
  const lowModel = await import(pathToFileURL(resolve(root, 'app/scripts/goalEvidenceProfileModel.ts')).href)
  const req = createRequire(resolve(root, 'app/package.json'))
  const Ajv = req('ajv/dist/2020.js').default
  const ajv = new Ajv({ allErrors: true, strict: true })
  req('ajv-formats')(ajv)
  const validateSchema = ajv.compile(JSON.parse(readFileSync(resolve(root, 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'), 'utf8')))
  const goals = new Map<string, any>(frame.goals.map((goal: any) => [goal.id, goal]))
  const selected = index.wholeSelectedPositiveRows
  const visuals = new Map<string, any>(index.wholeRetainedQAAndActualBytes.map((row: any) => [row.goalId, row]))
  if (selected.length !== 336 || visuals.size !== 336) throw new Error('Expected336 current P/V inputs')
  const schemaErrors: any[] = []
  const bindingErrors: any[] = []
  const staleOriginals: any[] = []
  const changedBindings: any[] = []
  const outputRecords: any[] = []
  const resourceDigestsById = new Map<string, Record<string, string>>()
  const kinds = new Map<string, string>()
  for (const row of selected) {
    const original = row.wholeRecord
    const goal = goals.get(row.goalId)
    if (!goal) throw new Error(`Missing current goal: ${row.goalId}`)
    const kind = kindById.get(row.goalId) ?? 'curricularAtomic'
    if (kind !== 'curricularAtomic') throw new Error(`Positive input is not curricularAtomic: ${row.goalId}/${kind}`)
    kinds.set(row.goalId, kind)
    if (!validateSchema(original)) schemaErrors.push({ goalId: row.goalId, errors: structuredClone(validateSchema.errors) })
    const visual = visuals.get(row.goalId)
    const bytes = readFileSync(repoPath(visual.actualRetainedCanonicalBytes.path))
    if (sha(bytes) !== visual.actualRetainedCanonicalBytes.sha256 || bytes.length !== visual.actualRetainedCanonicalBytes.wholeBytes) throw new Error(`Retained PNG changed: ${row.goalId}`)
    const qa = visual.wholeQualifiedQARecord
    const digest = `sha256:${sha(bytes)}`
    if (qa.aiApproved !== 'yes' || qa.aiApprovedAssetSha256 !== digest || qa.assetSha256 !== digest) throw new Error(`Invalid retained V binding: ${row.goalId}`)
    const links = (goal.resourceLinks ?? []).filter((link: any) => link.type === 'goal-visualization')
    if (links.length !== 1 || links[0].url !== qa.imageUrl) throw new Error(`Exact current image link mismatch: ${row.goalId}`)
    const resources = { [qa.imageUrl]: digest }
    resourceDigestsById.set(row.goalId, resources)
    const staleErrors = model.validatePositiveGoalEvidenceRecordSemantics(original, goal, resources, kind)
    if (staleErrors.length) staleOriginals.push({ goalId: row.goalId, errors: staleErrors, boundary: 'Actual original record against candidate frame; no historical scientific verdict withdrawn.' })
    const current = {
      ...original,
      goalFingerprint: model.fingerprintGoalForPositiveEvidence(goal, kind),
      reviewInputFingerprint: model.fingerprintPositiveGoalEvidenceReviewInput(goal, original.reviewCriteriaFingerprint, resources, kind),
    }
    const fields = Object.keys(current).filter((key) => lowModel.stableGoalEvidenceJson(current[key]) !== lowModel.stableGoalEvidenceJson(original[key]))
    if (fields.some((field) => !['goalFingerprint', 'reviewInputFingerprint'].includes(field))) throw new Error('Unapproved positive-content mutation')
    if (fields.length) changedBindings.push({ goalId: row.goalId, fields, originalSource: row.source, before: { goalFingerprint: original.goalFingerprint, reviewInputFingerprint: original.reviewInputFingerprint }, after: { goalFingerprint: current.goalFingerprint, reviewInputFingerprint: current.reviewInputFingerprint }, semanticGoalPayload: lowModel.goalEvidenceSemanticPayload(goal, 'goal-evidence-v1', kind), actualCurrentReviewInputPayload: model.positiveGoalEvidenceReviewInputPayload(goal, original.reviewCriteriaFingerprint, resources, kind) })
    const errors = model.validatePositiveGoalEvidenceRecordSemantics(current, goal, resources, kind)
    if (errors.length) bindingErrors.push({ goalId: row.goalId, errors })
    if (!validateSchema(current)) schemaErrors.push({ goalId: row.goalId, outputErrors: structuredClone(validateSchema.errors) })
    if (current.status !== 'needs_human_review' || current.reviewAuthority !== 'ai_candidate' || current.evidenceLevel !== 'E1' || current.maximumClaimScope !== 'G1') throw new Error('AI/human claim changed')
    outputRecords.push({ record: current, rawOriginalLine: row.wholeOriginalRawLine, changed: fields.length > 0 })
  }
  if (schemaErrors.length || bindingErrors.length) throw new Error(JSON.stringify({ schemaErrors, bindingErrors }))
  const first = outputRecords[0].record
  const goal = goals.get(first.goalId)
  const kind = kinds.get(first.goalId)
  const digests = resourceDigestsById.get(first.goalId)!
  const negativeResults: any[] = []
  const mustReject = (name: string, record: any, testGoal: any, resources: any) => {
    const errors = model.validatePositiveGoalEvidenceRecordSemantics(record, testGoal, resources, kind)
    if (!errors.length) throw new Error(`Negative incorrectly accepted: ${name}`)
    negativeResults.push({ name, actualRejected: true, errors })
  }
  mustReject('changed-tag-without-current-goal-binding', first, { ...goal, tags: [...(goal.tags ?? []), '__technical_negative_tag__'] }, digests)
  mustReject('changed-direct-requires-without-current-review-input-binding', first, { ...goal, requires: [...(goal.requires ?? []), '__technical_negative_requires__'] }, digests)
  mustReject('changed-actual-image-digest-without-current-review-input-binding', first, goal, Object.fromEntries(Object.keys(digests).map((url) => [url, `sha256:${'0'.repeat(64)}`])))
  mustReject('omitted-actual-image-digests-cannot-validate-current-P-record', first, goal, {})
  const changedProfile = structuredClone(first)
  changedProfile.profile.applicationCaseBriefs[0].taskDemandDe += ' technical negative fixture'
  mustReject('changed-profile-without-profileFingerprint', changedProfile, goal, digests)
  mustReject('AI-candidate-falsely-upgraded-to-approved', { ...first, status: 'approved' }, goal, digests)
  const applicabilityOnly = { ...goal, applicability: { jurisdiction: ['__technical_only_scope__'] } }
  const applicabilityInvariant = model.fingerprintGoalForPositiveEvidence(applicabilityOnly, kind) === first.goalFingerprint
    && model.fingerprintPositiveGoalEvidenceReviewInput(applicabilityOnly, first.reviewCriteriaFingerprint, digests, kind) === first.reviewInputFingerprint
  if (!applicabilityInvariant) throw new Error('Applicability alone unexpectedly altered P fingerprint')
  const out = repoPath(args.out)
  mkdirSync(out, { recursive: true })
  const write = (name: string, value: string) => {
    const path = resolve(out, name)
    if (existsSync(path)) throw new Error(`Immutable output exists: ${path}`)
    writeFileSync(path, value)
    return binding(relative(root, path))
  }
  const result = {
    at: new Date().toISOString(), mode: finalMode ? 'final-accepted-frame-technical-binding-only' : 'unsealed-author-frame-diagnostic-only',
    inputs: { intake: binding(args.index), frame: binding(args.canonical), ledger: args.ledger ? binding(args.ledger) : null, nativeModel: binding('app/scripts/positiveGoalEvidenceProfileModel.ts'), nativeLowModel: binding('app/scripts/goalEvidenceProfileModel.ts') },
    counts: { profiles: selected.length, cases: selected.reduce((sum: number, row: any) => sum + row.wholeRecord.profile.applicationCaseBriefs.length, 0), exactQA336Rows: visuals.size, originalStaleAgainstFrame: staleOriginals.length, bindingChangedRecords: changedBindings.length, schemaErrors: schemaErrors.length, nativeBoundRecordErrors: bindingErrors.length, allAICandidateNeedsHumanReviewE1G1: true },
    staleOriginals, changedBindings, actualNegativeResults: negativeResults, applicabilityOnlyGoalAndReviewInputFingerprintInvariant: applicabilityInvariant,
    diagnosticFallbackCurricularAtomicNotAuthoritativeKindApproval: !args.ledger,
    wholeProfileCaseAuthorityStatusAndAllOtherRecordFieldsExact: true, newScienceReview: false, newHumanApproval: false, strictNetGain: 0,
    noBookCentralBuildOrSharedWrite: true, finalBindingWritten: false,
  }
  if (finalMode) {
    const records = outputRecords.map((item: any) => {
      let raw = item.rawOriginalLine
      if (item.changed) {
        for (const field of ['goalFingerprint', 'reviewInputFingerprint']) {
          let count = 0
          const regex = new RegExp(`("${field}"\\s*:\\s*")sha256:[0-9a-f]{64}(")`, 'g')
          raw = raw.replace(regex, (_match: string, prefix: string, suffix: string) => {
            count += 1
            return prefix + item.record[field] + suffix
          })
          if (count !== 1) throw new Error(`Expected exactly one original ${field} field`)
        }
      }
      if (lowModel.stableGoalEvidenceJson(JSON.parse(raw)) !== lowModel.stableGoalEvidenceJson(item.record)) throw new Error('Raw two-field successor mismatch')
      return raw
    }).join('\n') + '\n'
    ;(result as any).wholeP336 = write('whole-P336-qualified-original-content-status-and-current-goal-resource-bindings-only.jsonl', records)
    ;(result as any).wholeV336 = write('whole-V336-qualified-original-QA-rows-and-exact-foreign-assets-only.json', JSON.stringify({ schemaVersion: 1, subject: 'wirtschaftswissenschaften', source: { canonicalRoot: args.canonical, publicAssetRoot: 'app/public/assets/goal-visualizations' }, records: index.wholeRetainedQAAndActualBytes.map((row: any) => row.wholeQualifiedQARecord) }, null, 2) + '\n')
    result.finalBindingWritten = true
    ;(result as any).originalRawLinesAndWholeProfileCaseBytesRetainedExceptTwoFingerprintFields = true
  }
  const resultBinding = write('actual-native-P336-V336-whole-schema-selective-fingerprint-and-stale-negative.result.json', JSON.stringify(result, null, 2) + '\n')
  console.log(JSON.stringify({ result: resultBinding, counts: result.counts, finalBindingWritten: result.finalBindingWritten }, null, 2))
}

main().catch((error) => { console.error(error); process.exitCode = 1 })
