import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import { validateLegacyResolutionIndexSnapshot } from '../../../../../../../../../app/scripts/reportDeepUnderstandingRollout'
import { loadGoalBookBuildInputs, stableGoalBookJson, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION } from '../../../../../../../../../app/scripts/goalBookModel'
import { materializeGoalDescriptionRolloutBatchDualSummary, buildGoalDescriptionRolloutSubsetModel } from '../../../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import { extractGoalDescriptionDualRoundResolutionSource, buildGoalDescriptionDualRoundResolution, validateGoalDescriptionDualRoundResolution } from '../../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'
import { fingerprintGoalDescriptionRolloutSynthesisDecisionManifest, buildGoalDescriptionRolloutSynthesisRoundBinding, validateGoalDescriptionRolloutSynthesisDecisionManifest } from '../../../../../../../../../app/scripts/validateGoalDescriptionRolloutSynthesisDecisionManifest'
import { buildGoalDescriptionRolloutResolutionSynthesis } from '../../../../../../../../../app/scripts/goalDescriptionRolloutResolutionSynthesis'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalForEvidence } from '../../../../../../../../../app/scripts/goalEvidenceProfileModel'

const prefix = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-046-matrix-mappings-and-probability-foundations-20-v1'
const helperPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-046-matrix-mappings-and-probability-foundations-20-v1/emit-current-keep7-v1.ts'
const expectedGoalIds = ["ccd1d108-5d9a-50dc-bfb8-6fa6e0bc503c","8823e26e-694c-581b-9adf-4db7db6f43c9","b7cc2fc4-c695-5a97-93b0-3a619c632ca8","3019e775-1420-510f-850b-5a29acc47a64","5a2371fd-74ce-5013-932e-35d3713aeaf7","71d1fd4d-8471-5f25-94a0-4c531a74783c","c2831918-26f1-421e-90fb-ce707689594e"]
const explicitHolds: Record<string, string> = {
  "0de1e45c-aea9-5e53-932a-027dcf509efa": "KEEP/BLOCK bleibt explizit offen: B hat die aktuelle HE-GK-Geltung anhand des KC geprüft und für langfristige Matrixpotenzen LK-Bindung gefunden. A hatte keine vollständige Originalquellen-/Projektionsprüfung beansprucht. Quellen-/Scope-Dissens fachlich adjudizieren, keinen historischen KEEP umschreiben.",
  "922d89fc-1cbd-56e9-ac5d-5cb59085de6c": "BLOCK/BLOCK: Das tatsächliche Bild setzt an den bereits senkrechten g-Vektor nochmals ein Transponiertzeichen; damit passt M·g nicht zu den geschriebenen Dimensionen. Zusätzlich belegt B einen HE-GK/LK-Geltungskonflikt. Beides bleibt offen; korrekte Ergebniszahlen ersetzen keine gültige Notation.",
  "69243680-c2c1-5661-80c0-c95a2be1dabf": "BLOCK/BLOCK: Für das Erkennen linearer Abbildungen sind die tatsächlich direkten harten requires Hauptsatz/elementare Ableitungen fachlich nicht notwendig. Die falsche Zugangssperre bleibt getrennt von der sinnvollen Einzelkompetenz offen.",
  "4c494716-567b-59c2-855c-6ea45635c666": "BLOCK/BLOCK: Die tatsächliche Projektionszeichnung positioniert Q=(-1,2) auf der y-Achse und P'=(5,0) oberhalb der x-Achse. Beschriftete Punkte und geometrische Lage müssen gemeinsam korrigiert werden.",
  "4d331ba0-56d6-5730-a51b-e3d1126b31ba": "BLOCK/BLOCK: Der orange Verbindungspfeil verknüpft P mit R' statt dem zugehörigen Bildpunkt. Korrekte Spiegelungsmatrix und separate Punktwerte heilen diese falsche Zuordnung nicht.",
  "b72d87d4-763e-54aa-940d-31f195b51700": "BLOCK/BLOCK: P=(2,1,3) und P'=(2,1,-3) müssten einen Mittelpunkt (2,1,0) haben; das Bild legt ihn auf die y-Achse und behauptet damit x=0. Die tatsächliche Spiegelungsgeometrie bleibt zu berichtigen.",
  "55039f9c-4ebc-5115-add5-fae95b915e46": "BLOCK/BLOCK: Das konkrete yz-Projektionsbild zeigt den Verbindungspfeil parallel zur y- statt x-Richtung und positioniert den Ausgangspunkt in falscher y-Richtung. Kein pauschaler Text- oder Kompetenzwechsel.",
  "35558905-753d-5fcb-b25e-7f85ffdbff56": "BLOCK/BLOCK: Bereits vertikal gesetzte Koordinatenvektoren werden im konkreten Ausdruck nochmals transponiert; dadurch ist die angegebene Matrixmultiplikation dimensional falsch. Notation gezielt reparieren.",
  "7bd8f022-5002-5610-994c-a9cec1890558": "BLOCK/BLOCK: Tatsächliches Bild enthält widersprüchliche doppelte y-Achsen, -e_x-Zuordnungen und einen als e_z beschrifteten Abwärtspfeil. Zusätzlich ist laut unabhängigem Quellencheck HE-GK statt LK problematisch. Bild- und Geltungskonflikt nicht zu einer Freigabe verwischen.",
  "168d8879-0412-5524-94c5-c1d8169dbd65": "KEEP/REVISE bleibt offen: Die beschriebene Spiegelung an einer schrägen Geraden muss für eine lineare Abbildung eine Ursprungsgerade sein; B verlangt die engere DE/EN-Formulierung. Das aktuelle y=x-Beispiel ist korrekt, ersetzt jedoch nicht die Klärung der Allgemeinheit im Text.",
  "2a1158e5-d4ca-51d4-860c-f43bd5a86836": "KEEP/REVISE bleibt offen: B beanstandet die EN-Formulierung worked examples als Vorgabe bereits gelöster statt eigenständig berechneter Anwendungsfälle. Das tatsächlich korrekte Münzbaum-Bild wird nicht neu blockiert; Textumfang und zweisprachige Selbstständigkeit sind getrennt zu klären.",
  "52e57eb5-7cd1-5df0-a8c6-7b090f097d9f": "KEEP/BLOCK bleibt offen: Formel und Tafelwerte stimmen, aber B liest die Pfeile der Bedingungsbeschriftungen als falsche direkte Zuordnung zu gemeinsamer/marginaler Zelle; A deutete sie als Hervorhebung der Quotientenquelle. Der konkrete visuelle Bedeutungsdissens bleibt ohne historisches Override erhalten.",
  "c3b9c561-dd83-5903-9ec6-49c7f51bafd5": "BLOCK/KEEP bleibt offen: A beanstandet exakt gesetzte 0,33/0,67 für Drittel und dadurch nicht exakte Produkte (0,60·0,33=0,198 statt 0,20); B akzeptiert übliche Zweidezimalrundung. Root adjudiziert gezielt die Darstellung von Näherung, keine stillschweigende Änderung einer versiegelten Runde."
}
// Read-only patch emitter for the explicitly selected current B046 KEEP/KEEP pairs after full A/B record-body synthesis.
// Apply the emitted patch once; final description/current-page bindings are checked natively.
// The V1 index is a partial-campaign compatibility snapshot, never a live progress denominator.
const read = (p: string) => readFileSync(p)
const json = (p: string) => JSON.parse(read(p).toString())
const digest = (b: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(b).digest('hex')}`
const bytes = (x: unknown) => JSON.stringify(x, null, 2) + '\n'

async function main() {
  const checkMode = process.argv.includes('--check')
  const authored = json(prefix + '/synthesis-authoring.current-keep7-v1.json')
  const config = json(prefix + '.config.json')
  assert.equal(config.goalIds.length, 20)
  assert.deepEqual(authored.decisions.map((d: any) => d.goalId), expectedGoalIds)
  assert.equal(existsSync(prefix + '/current-keep7-v1.currency-receipt.json'), checkMode, 'Use --check for existing artifacts; never replay writes')
  const sourceBytesBefore = new Map<string, Buffer>([prefix + '.config.json', prefix + '/batch-manifest.json', prefix + '/dual-summary.json', prefix + '/synthesis-authoring.current-keep7-v1.json', helperPath].map(path => [path, read(path)]))
  const dual = await materializeGoalDescriptionRolloutBatchDualSummary(prefix + '.config.json', false)
  const current = await loadGoalBookBuildInputs(config.baseGoalBookConfigPath)
  const subset = buildGoalDescriptionRolloutSubsetModel({ baseModel: current.model, goalIds: config.goalIds, bookId: config.bookId, title: config.title })
  const landscapeBytes = read(dual.prepared.manifest.source.landscapePath)
  const landscape = JSON.parse(landscapeBytes.toString())
  assert.equal(current.model.source.landscapeDigest, digest(stableGoalBookJson(landscape)), 'Fresh native model does not bind the canonical bytes read for synthesis')
  const runTimes = [...dual.first.resultPairs, ...dual.second.resultPairs].map(({ run }) => Date.parse(run.completedAt))
  assert.ok(runTimes.length > 0 && runTimes.every(Number.isFinite))
  const synthesizedAt = new Date(Math.max(...runTimes) + 1000).toISOString()
  assert.ok(Date.parse(synthesizedAt) <= Date.now(), 'Bound run timestamp is in the future')
  const historicalDenominator = dual.prepared.manifest.curriculumAtomicDenominatorAtPreparation
  assert.ok(Number.isInteger(historicalDenominator) && historicalDenominator >= config.goalIds.length)
  const oldPages = json(prefix + '/bundle/book-model.json').pages
  const currentStateAudit = config.goalIds.map((id: string) => {
    const oldPage = oldPages.find((p: any) => p.goalId === id)
    const newPage = subset.pages.find(p => p.goalId === id)
    const canonicalGoal = landscape.goals.find((g: any) => g.id === id)
    const input = dual.first.input.goals.find(g => g.goalId === id)!
    const secondInput = dual.second.input.goals.find(g => g.goalId === id)!
    assert.ok(oldPage && newPage && canonicalGoal && input && secondInput)
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: id, label: 'first' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: id, label: 'second' })
    assert.deepEqual([...first.errors, ...second.errors], [])
    assert.ok(first.source && second.source)
    const fullPageEqual = stableGoalBookJson(oldPage) === stableGoalBookJson(newPage)
    const canonicalContext = buildGoalDescriptionCanonicalContext(canonicalGoal)
    const currentGoalFingerprint = fingerprintGoalForEvidence(canonicalGoal, GOAL_BOOK_GOAL_FINGERPRINT_RULE_VERSION, 'curricularAtomic')
    const roundCurrentChecks = [input, secondInput].map((roundInput, index) => ({
      round: index === 0 ? 'first' : 'second',
      canonicalContextEqual: stableGoalBookJson(roundInput.canonicalContext) === stableGoalBookJson(canonicalContext),
      bilingualTextEqual: roundInput.currentTitleDe === canonicalGoal.title && roundInput.currentTitleEn === canonicalGoal.titleEn && roundInput.currentDescriptionDe === canonicalGoal.description && roundInput.currentDescriptionEn === canonicalGoal.descriptionEn,
      goalFingerprintEqual: roundInput.goalFingerprint === currentGoalFingerprint,
      pageFingerprintEqual: roundInput.pageFingerprint === newPage.pageFingerprint,
    }))
    const canonicalContextEqual = roundCurrentChecks.every(row => row.canonicalContextEqual)
    const bilingualTextEqual = roundCurrentChecks.every(row => row.bilingualTextEqual)
    const goalFingerprintEqual = roundCurrentChecks.every(row => row.goalFingerprintEqual)
    const pageFingerprintEqual = roundCurrentChecks.every(row => row.pageFingerprintEqual)
    const bothKeep = first.source.decision === 'keep' && second.source.decision === 'keep'
    const mixedKeepRevise = false // This B046 subset admits only the seven explicitly reviewed KEEP/KEEP pairs.
    const structurallyEligibleForCarryover = fullPageEqual && canonicalContextEqual && bilingualTextEqual && goalFingerprintEqual && pageFingerprintEqual && (bothKeep || mixedKeepRevise)
    const explicitHoldReason = explicitHolds[id] ?? null
    return { goalId: id, firstDecision: first.source.decision, secondDecision: second.source.decision, fullPageEqual, canonicalContextEqual, bilingualTextEqual, goalFingerprintEqual, pageFingerprintEqual, roundCurrentChecks, structurallyEligibleForCarryover, explicitHoldReason, eligibleForCarryover: structurallyEligibleForCarryover && explicitHoldReason === null, changedPageFields: [...new Set([...Object.keys(oldPage), ...Object.keys(newPage)])].filter(key => stableGoalBookJson(oldPage[key]) !== stableGoalBookJson((newPage as any)[key])), originalPageFingerprint: oldPage.pageFingerprint, currentPageFingerprint: newPage.pageFingerprint }
  })
  if (process.argv.includes('--audit')) { console.log(JSON.stringify({ currentStateAudit, selected: expectedGoalIds }, null, 2)); return }
  const invalidSelected = currentStateAudit.filter((row: any) => expectedGoalIds.includes(row.goalId) && !row.eligibleForCarryover)
  if (invalidSelected.length) throw new Error('STOP: selected current pages or bindings differ: ' + JSON.stringify(invalidSelected))
  assert.deepEqual(Object.keys(explicitHolds).sort(), config.goalIds.filter((id: string) => !expectedGoalIds.includes(id)).sort())
  assert.deepEqual(currentStateAudit.filter((row: any) => row.eligibleForCarryover).map((row: any) => row.goalId), expectedGoalIds, 'Eligible current subset changed: require explicit updated synthesis, never auto-include extra goals')

  const expectedGoals = authored.decisions.map((decision: any) => {
    const id = decision.goalId
    const oldPage = oldPages.find((p: any) => p.goalId === id)
    const newPage = subset.pages.find(p => p.goalId === id)
    if (!newPage || stableGoalBookJson(oldPage) !== stableGoalBookJson(newPage)) throw new Error(`${id}: full current subset page differs from original review`)
    const first = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.first, goalId: id, label: 'first' })
    const second = extractGoalDescriptionDualRoundResolutionSource({ artifacts: dual.second, goalId: id, label: 'second' })
    if (first.errors.length || second.errors.length || !first.source || !second.source) throw new Error(`${id}: missing validated review sources`)
    assert.ok([first.source.decision, second.source.decision].every(d => d === 'keep'))
    assert.ok(first.source.decision === 'keep' || second.source.decision === 'keep')
    const input = dual.first.input.goals.find(g => g.goalId === id)!
    return { goalId: id, effectiveSemanticKind: 'curricularAtomic' as const, goalFingerprint: input.goalFingerprint as `sha256:${string}`, pageFingerprint: input.pageFingerprint as `sha256:${string}`, goalReviewContextFingerprint: first.source.binding.goalReviewContextFingerprint, finalText: { titleDe: input.currentTitleDe, titleEn: input.currentTitleEn, descriptionDe: input.currentDescriptionDe, descriptionEn: input.currentDescriptionEn }, firstSource: first.source, secondSource: second.source }
  })
  if (!expectedGoals.length || new Set(expectedGoals.map((g: any) => g.goalId)).size !== expectedGoals.length) throw new Error('Empty or duplicate selected goals')
  const goalSet = new Set(expectedGoals.map((g: any) => g.goalId))
  if (JSON.stringify(config.goalIds.filter((id: string) => goalSet.has(id))) !== JSON.stringify([...goalSet])) throw new Error('Selection order differs from original batch')
  const firstGoal = expectedGoals[0]
  const expected = {
    batch: { batchId: dual.prepared.manifest.batchId, batchManifestDigest: digest(read(prefix + '/batch-manifest.json')), configDigest: dual.prepared.manifest.configDigest, bundleFingerprint: dual.prepared.manifest.artifacts.bundleFingerprint, bookDigest: dual.first.input.bookDigest as `sha256:${string}`, reviewInputFingerprint: dual.first.input.reviewInputFingerprint as `sha256:${string}`, dualSummaryDigest: digest(dual.bytes), canonicalLandscapeDigest: digest(landscapeBytes) },
    rounds: { first: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.firstSource.binding, dual.prepared.manifest.artifacts.rounds.first.batchInputFingerprint), second: buildGoalDescriptionRolloutSynthesisRoundBinding(firstGoal.secondSource.binding, dual.prepared.manifest.artifacts.rounds.second.batchInputFingerprint) },
    synthesizedAt,
    goals: expectedGoals,
  }
  const payload = {
    $schema: 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-synthesis-decision-manifest.schema.json' as const,
    schemaVersion: 1 as const, synthesisContract: 'goal-description-rollout-synthesis-decision-v1' as const,
    manifestId: authored.manifestId, authority: 'ai_synthesis' as const, synthesizedBy: authored.synthesizedBy,
    synthesizedAt: expected.synthesizedAt, batch: expected.batch, rounds: expected.rounds,
    decisions: expectedGoals.map((goal: any, i: number) => ({ decisionId: `${authored.manifestId}-decision-${String(i + 1).padStart(3, '0')}`, goalId: goal.goalId, effectiveSemanticKind: goal.effectiveSemanticKind, goalFingerprint: goal.goalFingerprint, pageFingerprint: goal.pageFingerprint, goalReviewContextFingerprint: goal.goalReviewContextFingerprint, finalText: goal.finalText, resolutionDecision: 'keep_current' as const, evidenceRound: authored.decisions[i].evidenceRound, records: { first: { recordId: goal.firstSource.binding.recordId, recordDigest: goal.firstSource.binding.recordDigest }, second: { recordId: goal.secondSource.binding.recordId, recordDigest: goal.secondSource.binding.recordDigest } }, ...(authored.decisions[i].revisionDissent ? { revisionDissent: authored.decisions[i].revisionDissent } : {}), rationaleDe: authored.decisions[i].rationaleDe, rationaleEn: authored.decisions[i].rationaleEn })),
  }
  const manifest = { ...payload, manifestFingerprint: fingerprintGoalDescriptionRolloutSynthesisDecisionManifest(payload) }
  const manifestCheck = await validateGoalDescriptionRolloutSynthesisDecisionManifest({ manifest, expected })
  if (manifestCheck.errors.length) throw new Error(manifestCheck.errors.join(' | '))
  const manifestPath = 'synthesis-decisions.current-keep7-v1.json'
  const manifestBytes = Buffer.from(bytes(manifest))
  const files: Array<{ path: string; text: string }> = [{ path: prefix + '/' + manifestPath, text: manifestBytes.toString() }]
  const entries: any[] = []
  for (const [i, goal] of expectedGoals.entries()) {
    const decision = manifest.decisions[i]
    const resolution = buildGoalDescriptionDualRoundResolution({ resolutionId: `${authored.manifestId}-${goal.goalId}`, goalId: goal.goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', currentInput: dual.first.input, dualSummaryBytes: dual.bytes, firstSource: goal.firstSource, secondSource: goal.secondSource, synthesis: buildGoalDescriptionRolloutResolutionSynthesis({ batchId: manifest.batch.batchId, manifest, decision, summaryGoal: dual.summary.goals.find(g => g.goalId === goal.goalId)!, firstSource: goal.firstSource, secondSource: goal.secondSource }), synthesisDecisionManifest: { contract: manifest.synthesisContract, manifestPath, manifestId: manifest.manifestId, manifestDigest: digest(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: decision.decisionId } })
    const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape, first: dual.first, second: dual.second, synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath } })
    if (validation.errors.length || !validation.strictDescriptionComplete) throw new Error(`${goal.goalId}: ${validation.errors.join(' | ')}`)
    const path = `resolutions-current-keep7-v1/${goal.goalId}.resolution.json`
    const text = bytes(resolution)
    files.push({ path: prefix + '/' + path, text })
    entries.push({ goalId: goal.goalId, titleDe: goal.finalText.titleDe, groupId: manifest.batch.batchId, decision: 'keep_current', resolutionPath: path, resolutionDigest: digest(text), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  }
  const index = { schemaVersion: 1, artifactSetId: authored.manifestId, subject: config.subjectLabel, semanticKind: 'curricularAtomic', strictDescriptionReviewCompleteCount: entries.length, curriculumAtomicDenominator: historicalDenominator, descriptionReviewPercentage: Math.round(entries.length / historicalDenominator * 1000) / 10, groups: [{ groupId: manifest.batch.batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: digest(dual.bytes), campaignGoalCount: config.goalIds.length, resolvedGoalCount: entries.length }], resolutions: entries }
  assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
  assert.equal(index.groups[0].campaignGoalCount, 20)
  assert.equal(index.groups[0].resolvedGoalCount, expectedGoalIds.length)
  files.push({ path: prefix + '/resolution-index.current-keep7-v1.json', text: bytes(index) })
  const currency = { schemaVersion: 1, artifactType: 'goal-description-current-subset-page-reuse-receipt-v1', checkedAt: authored.synthesisExecutedAt, currentBaseBookDigest: current.model.digest, currentStateAudit, synthesisAuthority: 'Nonblind AI synthesis by /root/goal_book_ci_integration after complete current B046 A/B record-body review; root requested the selected scope. Materializer performs structural checks only; no new blind-review or human-approval claim', materializedBy: 'codex-goal-book-ci-integration-b046-nonblind-synthesis', underlyingModelIdentifier: 'not exposed', diversityCaveat: 'Both independent current runs honestly use the same unavailable-model alias. No model diversity is claimed; existing separate reviewer instances and their context limitations are documented.', grantsBatchCompletion: false, grantsProgress: false, currentCanonicalLandscapeDigest: digest(landscapeBytes), originalBatchConfigPath: prefix + '.config.json', originalBatchConfigDigest: digest(read(prefix + '.config.json')), originalBookModelDigest: digest(read(prefix + '/bundle/book-model.json')), deterministicSynthesisTimestamp: synthesizedAt, timestampMeaning: 'Compatibility-contract timestamp: exactly one second after latest completed original run, not the actual later synthesis execution time. checkedAt records the observed current-state synthesis audit.', snapshotDenominatorAuthority: 'Legacy V1 partial-campaign compatibility only: curriculumAtomicDenominator is the original manifest curriculumAtomicDenominatorAtPreparation, not a live denominator. The central five-gate report remains sole live progress authority.', sourceArtifacts: [...sourceBytesBefore].map(([path, data]) => ({ path, sha256: digest(data) })), decision: 'Reuse exact original independent review records only for byte-equivalent current subset pages; no rebinding or fresh-review claim.', reusedGoalIds: [...goalSet], notReusedGoalIds: config.goalIds.filter((id: string) => !goalSet.has(id)), checkedFields: 'Every subset page field, both validated full campaigns, both rounds exact bilingual canonical text and canonical context, goal/page fingerprints and image bindings, selected synthesis manifest and strict resolution validators.', explicitHolds, eligibilityPolicy: 'Carryover requires all native structural/current-page checks, KEEP/KEEP, explicit per-goal nonblind synthesis after complete current A/B body review, and no fachlicher hold. Byte equality never overrides a semantic-atomicity dissent.', grantsHumanAuthority: false }
  files.push({ path: prefix + '/current-keep7-v1.currency-receipt.json', text: bytes(currency) })
  assert.deepEqual(read(dual.prepared.manifest.source.landscapePath), landscapeBytes, 'Canonical bytes changed during emission')
  for (const [path, data] of sourceBytesBefore) assert.deepEqual(read(path), data, 'Source artifact changed during emission: ' + path)
  if (checkMode) {
    for (const file of files) assert.equal(read(file.path).toString(), file.text, 'Current carryover artifact differs: ' + file.path)
    console.log(JSON.stringify({ checked: files.length, strictDescriptionCompleteCount: entries.length, campaignGoalCount: config.goalIds.length, currentStateAudit, synthesizedAt, historicalDenominator, grantsProgress: false, grantsHumanAuthority: false, grantsBatchCompletion: false }))
    return
  }
  const emitArg = process.argv.indexOf('--emit-file')
  const fileIndex = emitArg < 0 ? null : Number(process.argv[emitArg + 1])
  assert.ok(fileIndex === null || (Number.isInteger(fileIndex) && fileIndex >= 0 && fileIndex < files.length), 'Invalid --emit-file index')
  for (const file of files) if (existsSync(file.path)) assert.equal(read(file.path).toString(), file.text, 'Existing artifact differs: ' + file.path)
  const selectedFiles = fileIndex === null ? files : [files[fileIndex]]
  for (const file of selectedFiles) assert.equal(existsSync(file.path), false, 'Refuse overwriting existing artifact: ' + file.path)
  const patch = '*** Begin Patch\n' + selectedFiles.map(f => `*** Add File: ${resolve(f.path)}\n` + f.text.trimEnd().split('\n').map(l => '+' + l).join('\n') + '\n').join('') + '*** End Patch'
  console.log(JSON.stringify({ patch, summary: { selected: entries.map(e => e.goalId), files: files.length, indexPath: prefix + '/resolution-index.current-keep7-v1.json' } }))
}
void main()
