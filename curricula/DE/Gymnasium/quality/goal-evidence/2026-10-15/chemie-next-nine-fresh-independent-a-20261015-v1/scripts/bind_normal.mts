import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// This adapter only serializes already sealed judgments. All chemistry stays in
// the original FIRSTs and the separately sealed one-goal terminology amendment.
const repo = resolve(process.argv[2]!)
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-next-nine-fresh-independent-a-20261015-v1'
const host = resolve(repo, 'tmp/chemie-m7-resumed-20261015/next-nine-independent-a-normal-stock-host-v1')
const abs = (p: string) => resolve(repo, p)
const json = async (p: string) => JSON.parse(await readFile(abs(p), 'utf8'))
const digest = (b: Buffer | string) => `sha256:${createHash('sha256').update(b).digest('hex')}`
const fileRef = async (p: string) => { const b = await readFile(abs(p)); return { path: p, sha256: digest(b), bytes: b.length } }
const write = async (p: string, value: unknown) => {
  await writeFile(abs(p), `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' })
}
const requireTrue = (condition: unknown, text: string) => { if (!condition) throw new Error(text) }
const bindingStartedAt = new Date().toISOString()
const settings = await json(`${own}/normal/binding.inputs.json`)
const firstSeal = await json(`${own}/FIRST.originals.seal.json`)
for (const r of firstSeal.files) requireTrue((await fileRef(r.path)).sha256 === r.sha256, `Original FIRST changed: ${r.path}`)
const amendmentSeal = await json(`${own}/AMENDMENT.f71-rezeptfrei.FIRST.seal.json`)
for (const r of amendmentSeal.files) requireTrue((await fileRef(r.path)).sha256 === r.sha256, `Amendment FIRST changed: ${r.path}`)
const dFirst = await json(`${own}/FIRST.D6.independent-a.json`)
const sFirst = await json(`${own}/FIRST.SCOPE3.independent-a.json`)
const pFirst = await json(`${own}/FIRST.P6.independent-a.json`)
const aFirst = await json(`${own}/FIRST.A6.independent-a.json`)
const amendment = await json(`${own}/AMENDMENT.f71-rezeptfrei.FIRST.json`)
const dById = new Map(dFirst.rows.map((r: any) => [r.goalId, r]))
const sById = new Map(sFirst.rows.map((r: any) => [r.goalId, r]))
const scopeProof = await json(settings.scopeReuseProof)
const bundle = await json(settings.bundle)
const campaign = await json(settings.campaign)
const input = await json(settings.descriptionInput)
const canonical = await json(settings.canonical)
const canonicalById = new Map(canonical.goals.map((g: any) => [g.id, g]))
const batch = campaign.batches[0]
requireTrue(campaign.batches.length === 1 && input.goals.length === 9 && campaign.goalCount === 9, 'Expected exact native9 campaign')
requireTrue(amendment.goalId === 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528' && amendment.D.decision === 'keep', 'Expected the original one-goal amendment KEEP')
const originalNativeInput = await json(settings.originalDescriptionInput)
const oldDById = new Map(originalNativeInput.goals.map((g: any) => [g.goalId, g]))
const descriptionRows = []
const dRunId = 'chemie-next-nine-fresh-independent-a-d9-20261015-v1'
const originalScopeWitnesses = []
const unchangedEight = []
for (const source of input.goals) {
  const first: any = dById.get(source.goalId) ?? sById.get(source.goalId)
  requireTrue(first?.decision === 'keep', `No original KEEP for ${source.goalId}`)
  const g: any = canonicalById.get(source.goalId)
  requireTrue(g?.description === source.currentDescriptionDe && g.descriptionEn === source.currentDescriptionEn, `Foreign current text ${source.goalId}`)
  let ue = first.understandingEvidence
  let rationale = `${first.reason} Quellengrenze: ${first.sourceBoundary}`
  if (sById.has(source.goalId)) {
    const proof = scopeProof.rows.find((r: any) => r.goalId === source.goalId)
    requireTrue(proof?.wholeGoalDifferences?.every((r: any) => r.path === '/applicability/jurisdiction'), 'Scope-only proof must remain scope-only')
    const witness = proof.existingDKeepPair[0]
    const oldRecords = (await readFile(abs(witness.recordFile.path), 'utf8')).trim().split(/\r?\n/u).map((line) => JSON.parse(line))
    const oldRecord = oldRecords.find((r: any) => r.recordId === witness.recordId)
    requireTrue(oldRecord?.goalId === source.goalId && oldRecord.decision === 'keep', `Missing exact authorised scope witness ${source.goalId}`)
    ue = oldRecord.understandingEvidence
    rationale += ` Ausschließlich aktuelle engere Scope-/Seitenbindung; originale ganze Wissenschaft und Verständnisfelder unverändert wiederverwendet aus ${oldRecord.recordId}; zweiter gültiger Originalbeleg ${proof.existingDKeepPair[1].recordId}. Keine neue P/A/M/V-Stimme.`
    originalScopeWitnesses.push({ goalId: source.goalId, originalRecordId: oldRecord.recordId, sourceFile: witness.recordFile.path, understandingEvidenceExactlyReused: true })
  } else {
    requireTrue(source.reviewContext.evidenceProfile.evidenceLevel === 'E0' && source.reviewContext.evidenceProfile.maximumClaimScope === 'G0', `Native D profile must stay raw E0/G0: ${source.goalId}`)
  }
  if (source.goalId === amendment.goalId) rationale += ` Additives Terminologie-Amendment: ${amendment.D.reason} ${amendment.sourceBoundary}`
  else {
    const old: any = oldDById.get(source.goalId)
    requireTrue(old?.pageFingerprint === source.pageFingerprint, `Unexpected unchanged-page difference ${source.goalId}`)
    requireTrue(JSON.stringify(old.canonicalContext) === JSON.stringify(source.canonicalContext), `Unexpected unchanged-scope difference ${source.goalId}`)
    unchangedEight.push(source.goalId)
  }
  requireTrue(rationale.length <= 4000, `D rationale too long ${source.goalId}`)
  descriptionRows.push({
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
    schemaVersion: 1,
    recordId: `chemie-next-nine-independent-a-d-${source.goalId}-20261015`,
    runId: dRunId,
    campaignId: campaign.campaignId,
    roundId: campaign.roundId,
    bundleFingerprint: bundle.bundleFingerprint,
    bookDigest: bundle.bookModelDigest,
    ...Object.fromEntries(['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn'].map((key) => [key, source[key]])),
    decision: 'keep',
    understandingEvidence: ue,
    rationale,
    evidenceProfileContract: 'positive-understanding-evidence-v2',
    evidenceProfileRecommendation: 'none',
    recordStatus: 'candidate',
    reviewAuthority: 'ai_candidate',
  })
}
await mkdir(abs(`${own}/normal/D9`), { recursive: true })
const dRecordsPath = `${own}/normal/D9/${batch.batchId}.records.jsonl`
await writeFile(abs(dRecordsPath), `${descriptionRows.map((r) => JSON.stringify(r)).join('\n')}\n`, { flag: 'wx' })
const roleReceipt = await json(`${own}/checks/RUN.actual-role-and-original-FIRST-window.json`)
const generation = { model: roleReceipt.model, servedModelVersion: null, temperature: null, parametersExposed: false, actualRole: dFirst.reviewer, mode: 'Actual independent scientific reading followed by mechanical serialization of sealed FIRSTs; no second model API run' }
await write(`${own}/normal/generation-parameters.actual.json`, generation)
const genRef = await fileRef(`${own}/normal/generation-parameters.actual.json`)
const dRun = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', schemaVersion: 1,
  runId: dRunId, campaignId: campaign.campaignId, roundId: campaign.roundId, batchId: batch.batchId,
  batchInputFingerprint: batch.batchInputFingerprint,
  bundleFingerprint: bundle.bundleFingerprint, bookDigest: bundle.bookModelDigest,
  provider: 'OpenAI', model: roleReceipt.model, role: 'subject_reviewer',
  promptFamilyId: 'goal-description-understanding-evidence-review-v2',
  promptFingerprint: campaign.promptFingerprint, criteriaFingerprint: campaign.criteriaFingerprint,
  generationParametersFingerprint: genRef.sha256,
  independenceGroupId: campaign.independenceGroupId, blindToOtherRuns: true,
  goalIds: input.goals.map((g: any) => g.goalId),
  inputArtifacts: [...bundle.artifacts.map((r: any) => ({ role: r.role, digest: r.digest })), { role: 'description_review_batch_input_jsonl', digest: batch.batchInputFingerprint }],
  startedAt: roleReceipt.actualScientificRoleStartedAtUTC, completedAt: new Date().toISOString(), status: 'completed',
  outputDigest: (await fileRef(dRecordsPath)).sha256, toolchainVersion: 'skillpilot-unmodified-stock-tsx',
}
await write(`${own}/normal/D9/${batch.batchId}.run.json`, dRun)

const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(resolve(host, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
const rawProfiles = (await readFile(abs(settings.rawSixProfiles), 'utf8')).trim().split(/\r?\n/u).map((line) => JSON.parse(line))
const rawById = new Map(rawProfiles.map((r: any) => [r.goalId, r]))
const pRunId = 'chemie-next-nine-fresh-independent-a-p6-20261015-v1'
const pReviewId = 'chemie-next-nine-fresh-independent-a-p6-20261015-v1'
const pConfig = {
  $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json', schemaVersion: 2,
  reviewId: pReviewId, goalFingerprintRuleVersion: 'goal-evidence-v1', profileRuleVersion: 'positive-understanding-evidence-v2',
  landscapeId: canonical.landscapeId, landscapePath: settings.canonical, semanticKindLedgerPath: settings.semantic,
  reviewCriteriaPath: settings.positiveCriteria,
  reviewPath: `${own}/normal/P6.records.jsonl`, reviewRunManifestPaths: [`${own}/normal/P6.run.json`],
  reviewedResourceTypes: ['goal-visualization'], requireApproved: false,
  scope: { label: 'Chemistry independent A: exactly six current positive-evidence designs; no new P for scope3', goalIds: pFirst.rows.map((r: any) => r.goalId) },
}
const pCandidates = {
  schemaVersion: 1, authoringContract: 'positive-understanding-evidence-candidates-v1', reviewId: pReviewId,
  reviewedAt: pFirst.writtenAtUTC, reviewer: pFirst.reviewer,
  goals: pFirst.rows.map((r: any) => {
    const raw: any = rawById.get(r.goalId)
    requireTrue(raw?.evidenceLevel === 'E0' && raw.maximumClaimScope === 'G0', `Expected unchanged raw profile body ${r.goalId}`)
    const d: any = dById.get(r.goalId)
    let reason = `${r.reason} ${r.claimBoundary} Quellengrenze: ${d.sourceBoundary}`
    if (r.goalId === amendment.goalId) reason += ` Additives Terminologie-Amendment: ${amendment.P.reason}`
    requireTrue(reason.length <= 2000, `P reason too long ${r.goalId}`)
    return { goalId: r.goalId, reason, evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope, dissent: r.dissent, profile: raw.profile }
  }),
}
await write(`${own}/normal/P6.config.json`, pConfig)
const pRecords = await buildPositiveGoalEvidenceCandidateRecords({ config: pConfig, candidateSet: pCandidates })
const unchangedPBindings = []
for (const r of pRecords) {
  r.reviewRunIds = [pRunId]
  const raw: any = rawById.get(r.goalId)
  requireTrue(JSON.stringify(r.profile) === JSON.stringify(raw.profile), `Profile changed ${r.goalId}`)
  requireTrue(r.profileFingerprint === raw.profileFingerprint, `Profile fingerprint changed ${r.goalId}`)
  if (r.goalId !== amendment.goalId) requireTrue(r.goalFingerprint === raw.goalFingerprint && r.reviewInputFingerprint === raw.reviewInputFingerprint, `Unexpected P binding change ${r.goalId}`)
  else r.reviewedAt = amendment.writtenAtUTC
  unchangedPBindings.push({ goalId: r.goalId, profileBodyExactlyUnchanged: true, oldGoalFingerprint: raw.goalFingerprint, currentGoalFingerprint: r.goalFingerprint, oldReviewInputFingerprint: raw.reviewInputFingerprint, currentReviewInputFingerprint: r.reviewInputFingerprint, profileFingerprint: r.profileFingerprint })
}
await writeFile(abs(pConfig.reviewPath), `${pRecords.map((r: any) => JSON.stringify(r)).join('\n')}\n`, { flag: 'wx' })
const pInputSelector = {
  schemaVersion: 1, role: 'Actual independent P6 review inputs and unchanged raw profile body references',
  nativeSelector: await fileRef(settings.nativeSelector), canonical: await fileRef(settings.canonical), semantic: await fileRef(settings.semantic),
  actualNativeBookModel: await fileRef(settings.bookModel), actualNativePDF: await fileRef(settings.bookPdf),
  rawSixProfileBodies: await fileRef(settings.rawSixProfiles), wholeTwelveCases: await fileRef(settings.wholeTwelveCases),
  originalPFirst: await fileRef(`${own}/FIRST.P6.independent-a.json`), originalD6SourceBoundaries: await fileRef(`${own}/FIRST.D6.independent-a.json`),
  limitedF71Amendment: await fileRef(`${own}/AMENDMENT.f71-rezeptfrei.FIRST.json`),
  readReceipt: await fileRef(`${own}/READING.actual.references.json`), positivePrompt: await fileRef(settings.positivePrompt), positiveCriteria: await fileRef(settings.positiveCriteria),
  scope: pConfig.scope, actualLearnerPerformanceObserved: false, sourceCoverageApproval: false, newPForScope3: false,
}
await write(`${own}/normal/P6.actual-reviewed-input-selector.json`, pInputSelector)
const pPromptRef = await fileRef(settings.positivePrompt)
const pCriteriaRef = await fileRef(settings.positiveCriteria)
const pRun = {
  $schema: dRun.$schema, schemaVersion: 1, runId: pRunId,
  bundleFingerprint: bundle.bundleFingerprint, bookDigest: bundle.bookModelDigest,
  provider: 'OpenAI', model: roleReceipt.model, role: 'subject_reviewer',
  promptFamilyId: 'positive-understanding-evidence-v2', promptFingerprint: pPromptRef.sha256, criteriaFingerprint: pCriteriaRef.sha256,
  generationParametersFingerprint: genRef.sha256, independenceGroupId: 'chemie-next-nine-fresh-independent-a-p6-20261015-v1',
  blindToOtherRuns: true, goalIds: pConfig.scope.goalIds,
  inputArtifacts: [
    { role: 'book_pdf', digest: (await fileRef(settings.bookPdf)).sha256 },
    { role: 'review_input_json', digest: (await fileRef(`${own}/normal/P6.actual-reviewed-input-selector.json`)).sha256 },
    { role: 'review_prompt', digest: pPromptRef.sha256 }, { role: 'review_criteria', digest: pCriteriaRef.sha256 },
  ],
  startedAt: roleReceipt.actualScientificRoleStartedAtUTC, completedAt: new Date().toISOString(), status: 'completed',
  outputDigest: (await fileRef(pConfig.reviewPath)).sha256, toolchainVersion: dRun.toolchainVersion,
}
await write(`${own}/normal/P6.run.json`, pRun)

const aReviewId = 'chemie-next-nine-fresh-independent-a-a6-20261015-v1'
const aConfig = { schemaVersion: 1, reviewId: aReviewId, ruleVersion: 'semantic-atomicity-v1', landscapeId: canonical.landscapeId,
  landscapePath: settings.canonical, reviewPath: `${own}/normal/A6.records.jsonl`,
  scope: { label: 'Chemistry independent A: exactly six actual terminal competencies; scope3 excluded', leafGoalIds: aFirst.rows.map((r: any) => r.goalId) } }
const aRecords = aFirst.rows.map((r: any) => ({ schemaVersion: 1, reviewId: aReviewId, ruleVersion: 'semantic-atomicity-v1', landscapeId: canonical.landscapeId,
  goalId: r.goalId, fingerprint: `sha256:${'0'.repeat(64)}`, status: r.status, semanticAtomic: r.semanticAtomic,
  reviewedAt: r.goalId === amendment.goalId ? amendment.writtenAtUTC : aFirst.writtenAtUTC,
  reviewer: aFirst.reviewer,
  reason: `${r.reason} ${r.scopeBoundary}${r.goalId === amendment.goalId ? ` Additives Terminologie-Amendment: ${amendment.A.reason}` : ''}`,
}))
await write(`${own}/normal/A6.config.json`, aConfig)
await writeFile(abs(aConfig.reviewPath), `${aRecords.map((r: any) => JSON.stringify(r)).join('\n')}\n`, { flag: 'wx' })
await write(`${own}/normal/BINDING.actual-original-FIRST-to-normal.json`, {
  schemaVersion: 1, reviewer: dFirst.reviewer, bindingStartedAt, bindingCompletedAt: new Date().toISOString(),
  nativeSelector: await fileRef(settings.nativeSelector), currentCanonical: await fileRef(settings.canonical), currentSemantic: await fileRef(settings.semantic),
  originalFirstsExactlyPreserved: true, amendmentExactlyPreserved: true,
  D9: { records: await fileRef(dRecordsPath), campaign: await fileRef(settings.campaign), input: await fileRef(settings.descriptionInput),
    nativeRawDProfilesStillE0G0: true, scopeOriginalWitnesses: originalScopeWitnesses, unchangedEightActualPageFingerprintsAndCanonicalContexts: unchangedEight },
  P6: { records: await fileRef(pConfig.reviewPath), exactBodiesAndActualStockBindings: unchangedPBindings,
    status: 'needs_human_review', reviewAuthority: 'ai_candidate', evidenceLevel: 'E1', maximumClaimScope: 'G1', actualLearnerPerformanceObserved: false },
  A6: { config: `${own}/normal/A6.config.json`, records: aConfig.reviewPath, fingerprintBinding: 'Pending unchanged stock semanticAtomicityReview.ts --write-fingerprints; no check invoked by this adapter' },
  noNewScope3PAVotes: true, noNewNativeBuild: true, noMVGrant: true, noHumanOrSourceCoverageApproval: true, activeWrites: false, gitWrites: false,
})
console.log(JSON.stringify({ D9: descriptionRows.length, P6: pRecords.length, A6: aRecords.length, normalChecksExecuted: 0, A6FingerprintBindingPending: true }))
