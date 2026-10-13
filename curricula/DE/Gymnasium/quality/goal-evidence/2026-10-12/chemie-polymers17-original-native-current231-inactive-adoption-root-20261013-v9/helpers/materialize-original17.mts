// Apache-2.0. Select actual completed reviews using unchanged production APIs.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
const O = `${E}/chemie-polymers18-current231-inactive-normal-preparation-technical-20261013-v1`
const A = `${E}/chemie-polymers18-clean-independent-a-20261013-v5`
const B = `${E}/chemie-polymers18-final-native-fresh-independent-b-20261013-v6`
const F = `${E}/chemie-polymers17-original-native-current231-inactive-adoption-root-20261013-v9`
const held = ['413c5ee5-7826-549f-ad76-63743c59b188', '9d942907-a59b-5898-9ce0-347fbea7d883', 'f947cd04-952a-5a9d-9445-3ffc70e02c3c']
const abs = (p: string) => resolve(root, p)
const read = (p: string): any => JSON.parse(readFileSync(abs(p), 'utf8'))
const jsonBytes = (x: unknown) => Buffer.from(`${JSON.stringify(x, null, 2)}\n`)
const sha = (bytes: Buffer | string) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const bind = (path: string) => ({ path, sha256: sha(readFileSync(abs(path))), bytes: readFileSync(abs(path)).length })
const writeBytes = (p: string, bytes: Buffer) => {
  mkdirSync(dirname(abs(p)), { recursive: true })
  if (existsSync(abs(p))) assert.ok(readFileSync(abs(p)).equals(bytes), `Existing owned artifact differs: ${p}`)
  else writeFileSync(abs(p), bytes, { flag: 'wx' })
}
const write = (p: string, x: unknown) => writeBytes(p, jsonBytes(x))
const copyExact = (source: string, dest: string) => {
  writeBytes(dest, readFileSync(abs(source)))
  assert.equal(bind(dest).sha256, bind(source).sha256)
}
const jsonl = (p: string) => readFileSync(abs(p)).toString().split('\n').filter(l => l.trim()).map(l => ({ line: l, row: JSON.parse(l) }))
const subsetRaw = (source: string, dest: string, ids: string[]) => {
  const selected = jsonl(source).filter(({ row }) => ids.includes(row.goalId))
  assert.equal(selected.length, ids.length)
  assert.deepEqual(new Set(selected.map(({ row }) => row.goalId)), new Set(ids))
  writeBytes(dest, Buffer.from(selected.map(({ line }) => `${line}\n`).join('')))
  return selected
}
const normal = async (p: string): Promise<any> => import(pathToFileURL(abs(p)).href)
const modulePaths = ['app/scripts/validateGoalDescriptionReviewCampaignResults.ts', 'app/scripts/validateGoalDescriptionReviewDualRound.ts', 'app/scripts/validateGoalDescriptionDualRoundResolution.ts', 'app/scripts/reportDeepUnderstandingRollout.ts', 'app/scripts/goalBookModel.ts', 'app/scripts/materializeGoalDescriptionRolloutBatch.ts']
const [recordsApi, dualApi, resolutionApi, reportApi, modelApi, subsetApi] = await Promise.all(modulePaths.map(normal))
const manifestPath = `${O}/native-D18/batch-manifest.json`
const manifest = read(manifestPath)
assert.equal(manifest.goalIds.length, 18)
const ids = manifest.goalIds.filter((id: string) => !held.includes(id))
assert.equal(ids.length, 17)
const loadRound = async (name: string) => {
  const path = `${O}/native-D18/${name}`
  const campaign = read(`${path}/description-review-campaign.json`)
  const loaded = await recordsApi.loadGoalDescriptionReviewCampaignResultDirectories({ campaign, batchesDirectory: abs(`${path}/batches`), resultsDirectory: abs(`${path}/results`) })
  assert.deepEqual(loaded.errors, [])
  return { campaign, input: read(`${path}/description-review-input.json`), bundle: read(`${path}/review-bundle-manifest.json`), resultPairs: loaded.resultPairs }
}
const [first, second] = await Promise.all([loadRound('round-a'), loadRound('round-b')])
const dual = await dualApi.validateGoalDescriptionReviewDualRound({ first, second })
assert.deepEqual(dual.errors, [])
assert.equal(dual.summary.goalCount, 18)
assert.deepEqual(dual.summary.goals.map((g: any) => g.goalId), manifest.goalIds)
const summaryBytes = jsonBytes(dual.summary)
writeBytes(`${F}/native-original18.dual-summary.json`, summaryBytes)

const landscape = read(manifest.source.landscapePath)
const completed = [...first.resultPairs, ...second.resultPairs].map((pair: any) => Date.parse(pair.run.completedAt))
const synthesizedAt = new Date(Math.max(...completed) + 1000).toISOString()
const indexEntries: any[] = []
const resolutionValidation: any[] = []
const groupId = manifest.batchId
for (const goalId of ids) {
  const a = resolutionApi.extractGoalDescriptionDualRoundResolutionSource({ artifacts: first, goalId, label: 'First' })
  const b = resolutionApi.extractGoalDescriptionDualRoundResolutionSource({ artifacts: second, goalId, label: 'Second' })
  assert.deepEqual([...a.errors, ...b.errors], [])
  assert.equal(a.source.decision, 'keep')
  assert.equal(b.source.decision, 'keep')
  assert.equal(a.source.record.evidenceProfileRecommendation, 'none')
  assert.equal(b.source.record.evidenceProfileRecommendation, 'none')
  const input = first.input.goals.find((g: any) => g.goalId === goalId)
  const comparison = dual.summary.goals.find((g: any) => g.goalId === goalId)
  const fields = comparison.disagreementFields.join(', ')
  const synthesis = {
    synthesisId: `chemie-polymers17-original-native-selection-20261013-v9-synthesis-${goalId}`,
    authority: 'ai_synthesis', synthesizedBy: 'Codex root technical adoption of two completed independent original reviews', synthesizedAt,
    rationaleDe: 'Die beiden tatsächlichen unabhängigen Originalreviews bestätigen die unveränderte aktuelle zweisprachige Beschreibung mit keep. Für dieses Ziel sind auch beide vollständigen positiven Profilprüfungen ohne offene Befunde dokumentiert. Die Synthese übernimmt die konkrete Verständnis-Evidenz der ersten Runde; Unterschiede der beiden Evidenzformulierungen werden ausdrücklich als Auswahl zwischen vereinbaren keep-Befunden behandelt. Dies ist eine inaktive technische Übernahme vorhandener Prüfungen, keine neue Reviewrunde oder menschliche Freigabe.',
    rationaleEn: 'Both actual independent original reviews retain the unchanged current bilingual description with keep. Both complete positive-profile reviews also document no open finding for this goal. The synthesis adopts the concrete understanding evidence from the first round; differing evidence formulations are explicitly handled as a selection between compatible keep findings. This is an inactive technical adoption of existing reviews, no new review round or human approval.',
    understandingEvidence: structuredClone(a.source.record.understandingEvidence),
    dissent: comparison.agreement === 'disagreement' ? [{
      dissentId: `chemie-polymers17-original-native-selection-20261013-v9-dissent-${goalId}`, source: 'both',
      textDe: `Die unveränderten unabhängigen keep-Records unterscheiden sich in ${fields}. Die erste Fassung wird als aktuelle Verständnis-Evidenz ausgewählt; die zweite bleibt vollständig erhalten und widerspricht weder dem aktuellen Ziel noch dessen positiv geprüftem Profil. Der separate F947-HOLD wird durch diese Auswahl nicht aufgelöst.`,
      textEn: `The unchanged independent keep records differ in ${fields}. The first formulation is selected as current understanding evidence; the second remains fully retained and conflicts with neither the current goal nor its positively reviewed profile. This selection does not resolve the separate F947 HOLD.`, disposition: 'accepted_first',
    }] : [], humanAttestation: null,
  }
  const resolution = resolutionApi.buildGoalDescriptionDualRoundResolution({ resolutionId: `${manifest.batchId}-resolution-${goalId}`, goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', synthesis, dualSummaryBytes: summaryBytes, currentInput: first.input, firstSource: a.source, secondSource: b.source })
  assert.deepEqual(resolution.rounds.first, a.source.binding)
  assert.deepEqual(resolution.rounds.second, b.source.binding)
  const v = await resolutionApi.validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: summaryBytes, currentInput: first.input, landscape, first, second })
  assert.deepEqual(v.errors, [], goalId)
  assert.equal(v.strictDescriptionComplete, true, goalId)
  const resolutionPath = `resolutions/${goalId}.resolution.json`
  write(`${F}/${resolutionPath}`, resolution)
  indexEntries.push({ goalId, titleDe: input.currentTitleDe, groupId, decision: resolution.decision, resolutionPath, resolutionDigest: bind(`${F}/${resolutionPath}`).sha256, resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  resolutionValidation.push({ goalId, errors: v.errors, strictDescriptionComplete: v.strictDescriptionComplete, originalRoundBindings: resolution.rounds, newScientificReviewVotes: 0 })
}
const index = {
  schemaVersion: 1, artifactSetId: 'chemie-polymers17-original-native-current231-inactive-adoption-20261013-v9', subject: 'Chemie', semanticKind: 'curricularAtomic',
  strictDescriptionReviewCompleteCount: 17, curriculumAtomicDenominator: 402, descriptionReviewPercentage: Number((17 / 402 * 100).toFixed(1)),
  groups: [{ groupId, artifactDirectory: relative(abs(F), abs(`${O}/native-D18`)).split('\\').join('/'), dualSummaryPath: 'native-original18.dual-summary.json', dualSummaryDigest: sha(summaryBytes), campaignGoalCount: 18, resolvedGoalCount: 17 }], resolutions: indexEntries,
}
const indexErrors = reportApi.validateLegacyResolutionIndexSnapshot(index)
assert.deepEqual(indexErrors, [])
assert.equal(index.groups[0].resolvedGoalCount, index.resolutions.length)
assert.equal(index.groups[0].campaignGoalCount, dual.summary.goalCount)
assert.ok(index.resolutions.every((r: any) => !held.includes(r.goalId)))
write(`${F}/resolution-index.original17.aggregate-v1.json`, index)

const pSource = `${O}/positive/P18.author.one-thermal-v4.raw17-exact.jsonl`
const pOwned = `${F}/positive/P17.original-author-native-bound.raw-exact.jsonl`
const pRows = subsetRaw(pSource, pOwned, ids)
const originalPById = new Map(pRows.map(({ row }) => [row.goalId, row]))
const aPSrc = `${A}/P18.independentA.candidate-scientific-review.jsonl`
const bPSrc = `${B}/positive/P18.current-tuple-independent-b.jsonl`
const aPRows = subsetRaw(aPSrc, `${F}/provenance/P17.independentA.actual-opinions.raw-exact.jsonl`, ids)
const bPRows = subsetRaw(bPSrc, `${F}/provenance/P17.independentB.actual-opinions.raw-exact.jsonl`, ids)
const aPById = new Map(aPRows.map(({ row }) => [row.goalId, row]))
const bPById = new Map(bPRows.map(({ row }) => [row.goalId, row]))
const aVotes = read(`${A}/FINAL.manual18.after-native-sight.json`).records
const bVotes = read(`${B}/SCIENCE.whole18-independent-b.actual-findings.json`).findings
const pProof: any[] = []
const fpKeys = ['goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint', 'goalFingerprintRuleVersion', 'profileRuleVersion', 'landscapeId', 'evidenceLevel', 'maximumClaimScope']
for (const goalId of ids) {
  const original: any = originalPById.get(goalId), pa: any = aPById.get(goalId), pb: any = bPById.get(goalId)
  const av = aVotes.find((v: any) => v.goalId === goalId), bv = bVotes.find((v: any) => v.goalId === goalId)
  assert.equal(av.P, 'retain_ai_candidate')
  assert.deepEqual(av.blockingFindings, [])
  assert.equal(bv.Pdecision, 'positive_current_tuple_ai_candidate')
  assert.equal(bv.PRecommendation, 'none')
  for (const own of [pa, pb]) {
    for (const key of fpKeys) assert.deepEqual(own[key], original[key], `${goalId}:${key}`)
    assert.deepEqual(own.profile, original.profile, `${goalId}:whole profile`)
    assert.equal(own.status, 'needs_human_review')
    assert.equal(own.reviewAuthority, 'ai_candidate')
    assert.deepEqual(own.dissent, [])
  }
  const ctx = first.input.goals.find((g: any) => g.goalId === goalId)
  assert.equal(ctx.reviewContext.evidenceProfile.profileFingerprint, original.profileFingerprint)
  assert.equal(ctx.reviewContext.evidenceProfile.reviewInputFingerprint, original.reviewInputFingerprint)
  assert.equal(ctx.reviewContext.evidenceProfile.goalFingerprint, original.goalFingerprint)
  pProof.push({ goalId, originalRawLineSha256: sha(pRows.find(({ row }) => row.goalId === goalId)!.line), profileFingerprint: original.profileFingerprint, positiveResourceInputFingerprint: original.reviewInputFingerprint, goalFingerprint: original.goalFingerprint, bothIndependentWholeProfilesExact: true, independentAOpinion: av.P, independentBOpinion: bv.Pdecision, sourceA: bind(aPSrc), sourceB: bind(bPSrc), nativePageFingerprint: ctx.pageFingerprint, originalNativeContextUnchanged: true, printedMetadataRetainedFromAuthor: true, status: original.status, authority: original.reviewAuthority, evidenceLevel: original.evidenceLevel, maximumClaimScope: original.maximumClaimScope })
}
write(`${F}/checks/P17-both-original-independent-positive-and-native-print-binding.actual.json`, { schemaVersion: 1, selectedGoalCount: 17, excludedGoalIds: held, exactOriginalPAuthorLines: true, reviewerMetadataVariantsUsedAsPrintedInput: false, newScientificVotes: 0, humanApproval: false, records: pProof })
const pConfig = read(`${O}/configs/P18.author.inactive.config.json`)
pConfig.reviewPath = pOwned
pConfig.scope = { label: 'Inactive17 exact original native-bound author profiles; both independent positive reviews retained', goalIds: ids }
write(`${F}/configs/P17.original-author.inactive.config.json`, pConfig)

const aSource = `${A}/A18.independentA.actual.review.jsonl`
const aOwned = `${F}/atomicity/A17.original-independentA.raw-exact.jsonl`
const aRows = subsetRaw(aSource, aOwned, ids)
assert.ok(aRows.every(({ row }) => row.status === 'atomic' && row.semanticAtomic === true))
const aConfig = read(`${A}/A18.independentA.actual.config.json`)
aConfig.reviewPath = aOwned
aConfig.scope = { label: 'Inactive17 exact original genuine independent A atomicity; f947 excluded', leafGoalIds: ids }
write(`${F}/configs/A17.original-independentA.inactive.config.json`, aConfig)
copyExact(`${O}/memory/M402.current-raw-exact.jsonl`, `${F}/memory/M402.original-valid.raw-exact.jsonl`)
const mConfig = read(`${O}/configs/M402.inactive.config.json`)
mConfig.reviewPath = `${F}/memory/M402.original-valid.raw-exact.jsonl`
mConfig.reportPath = `${F}/checks/M402.normal.retained.report.md`
write(`${F}/configs/M402.original-retained.inactive.config.json`, mConfig)

const tupleProofPath = `${O}/checks/protected231-full-current-tuple-and-registry-bindings.actual.json`
const tupleProof = read(tupleProofPath)
const registry = read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
const subject = registry.subjects.find((s: any) => s.subject === 'chemie')
assert.equal(bind(subject.landscapePath).sha256, tupleProof.currentCanonicalSha256)
const base = modelApi.parseAndValidateGoalBookModel(read(`${O}/models/whole402.current231.normal-base.json`))
const future = modelApi.parseAndValidateGoalBookModel(read(`${O}/models/whole402.current231-plus-author18.final-inputs.normal.json`))
const native = modelApi.parseAndValidateGoalBookModel(read(`${O}/native-D18/bundle/book-model.json`))
assert.deepEqual(subsetApi.buildGoalDescriptionRolloutSubsetModel({ baseModel: future, goalIds: manifest.goalIds, bookId: native.book.id, title: native.book.title }), native)
const currentById = new Map(read(subject.landscapePath).goals.map((g: any) => [g.id, g]))
const candidateById = new Map(landscape.goals.map((g: any) => [g.id, g]))
const currentQaById = new Map(read(subject.visualizationQaPath).records.map((g: any) => [g.goalId, g]))
const futureQaById = new Map(read(`${O}/candidate/QA.current-plus-six-actualV.inactive.json`).records.map((g: any) => [g.goalId, g]))
const basePages = new Map(base.pages.map((p: any) => [p.goalId, p]))
const futurePages = new Map(future.pages.map((p: any) => [p.goalId, p]))
assert.equal(tupleProof.protectedCurrentTuples.length, 231)
for (const { goalId } of tupleProof.protectedCurrentTuples) {
  assert.equal(modelApi.stableGoalBookJson(currentById.get(goalId)), modelApi.stableGoalBookJson(candidateById.get(goalId)), goalId)
  assert.equal(modelApi.stableGoalBookJson(currentQaById.get(goalId)), modelApi.stableGoalBookJson(futureQaById.get(goalId)), goalId)
  assert.equal(modelApi.stableGoalBookJson(basePages.get(goalId)), modelApi.stableGoalBookJson(futurePages.get(goalId)), goalId)
}
for (const binding of tupleProof.currentActiveADPRegistryInputBindings) assert.equal(bind(binding.path).sha256, binding.sha256, binding.path)
write(`${F}/checks/current-CAS-protected231-and-original-native17-context.actual.json`, { schemaVersion: 1, currentCanonical: bind(subject.landscapePath), expectedCurrentCanonicalSha256: tupleProof.currentCanonicalSha256, protected231WholeGoalsQaAndPagesExact: true, originalNative18RegenerationExact: true, preserved17OriginalCampaignSourceBindings: true, checkedCurrentRegistryInputBindings: tupleProof.currentActiveADPRegistryInputBindings, sourceProof: bind(tupleProofPath), activeWrites: false, newScientificVotes: 0 })

const inputReferences = [manifestPath, `${O}/FINAL.inactive18-author-neutral-native.freeze.json`, `${A}/FINAL.independentA.seal.json`, `${B}/FINAL.original18-independent-b.freeze.json`, `${O}/models/whole402.current231.normal-base.json`, `${O}/models/whole402.current231-plus-author18.final-inputs.normal.json`, manifest.source.landscapePath, `${O}/candidate/semantic523.current-decisions.inactive.json`, `${O}/candidate/QA.current-plus-six-actualV.inactive.json`, `${O}/configs/whole402.inactive.config.json`, pSource, aSource, aPSrc, bPSrc, `${A}/FINAL.manual18.after-native-sight.json`, `${B}/SCIENCE.whole18-independent-b.actual-findings.json`, `${O}/memory/M402.current-raw-exact.jsonl`, mConfig.cardReviewPath, ...modulePaths]
for (const name of ['round-a', 'round-b']) for (const file of ['description-review-campaign.json', 'description-review-input.json', 'review-bundle-manifest.json']) inputReferences.push(`${O}/native-D18/${name}/${file}`)
for (const name of ['round-a', 'round-b']) for (const pair of (name === 'round-a' ? first : second).resultPairs) {
  const recordsName = `${pair.batchId}.records.jsonl`, runName = `${pair.batchId}.run.json`
  for (const file of [recordsName, runName]) if (existsSync(abs(`${O}/native-D18/${name}/results/${file}`))) inputReferences.push(`${O}/native-D18/${name}/results/${file}`)
}
const successorA = `${E}/chemie-f947-one-explicit-task-fresh-independent-a-20261013-v8/FINAL.scientific-a.seal.json`
const successorB = `${E}/chemie-f947-one-explicit-task-targeted-independent-b-20261013-v8/FINAL.f947-one-target-independent-b.freeze.json`
for (const p of [successorA, successorB]) if (existsSync(abs(p))) inputReferences.push(p)
write(`${F}/INPUTS.original17-current231.referenced-immutable-bindings.json`, { schemaVersion: 1, intendedUse: 'Inactive adoption of exact original17 positive scientific judgments; references are original existing artifacts, not fresh review results', originalCampaignGoalIds: manifest.goalIds, selectedGoalIds: ids, heldGoalIds: held, currentCanonicalSha256: tupleProof.currentCanonicalSha256, referencedOriginalFiles: [...new Set(inputReferences)].map(bind), nativeBookDigest: native.digest, nativeBundleFingerprint: manifest.artifacts.bundleFingerprint, nativeReviewInputFingerprint: first.input.reviewInputFingerprint, rerenderedOrRereviewed: false })
write(`${F}/HOLD.three-current-goals.not-adopted.json`, { schemaVersion: 1, goalIds: held, claimedInIndex: false, claimedInPositiveConfig: false, claimedInAtomicityConfig: false, acceptedAsComplete: false, reasons: [{ goalId: held[0], reason: 'Prior metal/alloy corrosion source/atomicity HOLD is unchanged.' }, { goalId: held[1], reason: 'Prior modified-cellulose and rubber operator/source/atomicity HOLD is unchanged.' }, { goalId: held[2], reason: 'Original independent B positive-profile HOLD remains; the one-goal explicit-task successor has further genuine independent A source/operator and water-case task/rubric HOLD. A/B disagreement is preserved, not synthesized as resolved.', successorIndependentASeal: existsSync(abs(successorA)) ? bind(successorA) : null, successorIndependentBSeal: existsSync(abs(successorB)) ? bind(successorB) : null }], full18Or20ClosureClaim: false, humanApproval: false, humanTrial: false })
write(`${F}/checks/original17-production-resolution-and-index-API.actual.json`, { schemaVersion: 1, checkedAtUTC: new Date().toISOString(), productionModuleBindings: modulePaths.map(bind), originalCampaignGoalCount: 18, resolvedSelectedGoalCount: 17, strictDescriptionValid: 17, heldF947NotSynthesizedOrClaimed: true, originalCampaignAndRunIdentities: [first.campaign.campaignId, second.campaign.campaignId], exactNormalOriginalDualSummaryDigest: sha(summaryBytes), indexSnapshotErrors: indexErrors, perGoalResolutionValidation: resolutionValidation, activeWrites: false, newScientificReviewVotes: 0, actualCentralStrictGain: 0, humanApproval: false, humanTrial: false })
console.log(JSON.stringify({ inactive17Materialized: true, originalCampaignGoals: 18, resolvedOriginal17: 17, genuinePBothPositive17: true, genuineA17RawExact: true, current402MemoryRawExact: true, protected231Unchanged: true, held3Excluded: held, newScientificVotes: 0, activeWrites: false, humanApproval: false }))
