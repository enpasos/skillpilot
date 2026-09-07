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

const prefix = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-042r-current-nine-contexts-v1'
const helperPath = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-042r-current-nine-contexts-v1/emit-current-keep3-v1.ts'
const expectedGoalIds = ["7e719cc2-0866-5267-a252-e7e7ac0d03f1","b3f3f4f7-b5cc-40e1-b57a-3d93649baa61","0da13365-02c2-44f1-8a81-d524ca0ac3ae"]
const explicitHolds: Record<string, string> = {
  "a12fddce-0215-58d9-bd91-21be8a960d25": "split_review/block; root confirmed all six held after post-seal comparison and direct original-source verification on 2026-09-07. See post-seal-comparison-and-scope-audit-v1.json; neither original record is rewritten. Die beiden Sprachen sind inhaltlich gleich, aber der aktuelle gemeinsame Zieltext verbindet ein einfaches zeitliches Zerfallsgesetz mit Zerfallsreihen. Der eigene Seitenkontext weist DE-HE ausdrücklich GK und LK aus. In der tatsächlich gelesenen amtlichen HE-PDF, Q4.3, S. 45–46, stehen Aktivität/Halbwertszeit/exponentielle Abnahme beim grundlegenden Niveau; Zerfallsreihen stehen dagegen unter erhöhtem Niveau (Leistungskurs). Auch die direkten Source-Extraction-Zuordnungen trennen diese Abschnitte. Das ist ein belegter Scope-Konflikt, keine Schlussfolgerung allein aus einem LK-Tag. Im Zielumfeld existiert bereits ein gesondertes Ziel zum Analysieren von Zerfallsreihen. Daher nicht den gesamten Atom pauschal auf LK verengen und nicht die Reihenkompetenz still löschen: bestehende Zielgrenzen/Quellenzuordnung müssen fachlich geklärt werden. Die BW-Sek-I-Projektion spricht zusätzlich gegen eine ungeprüfte gemeinsame Oberstufen-Vertiefung. Kein aktives Bild vorhanden; das ist nicht der Blocker. Die folgenden positiven Nachweise beschreiben den einfachen Zerfallskern; sie erteilen dem vermischten aktuellen Seitenscope keine Freigabe.",
  "853dbe54-85b0-59ab-8f3a-000c2b7746ec": "keep/block; root confirmed all six held after post-seal comparison and direct original-source verification on 2026-09-07. See post-seal-comparison-and-scope-audit-v1.json; neither original record is rewritten. Text und tatsächlich betrachtetes Raster 9da94522… sind als qualitative Einführung plausibel: Widerstand verschwindet unterhalb Tc und eine Meissner-Schwebeillustration wird gezeigt. Keine BCS-Herleitung oder sichere Durchführung eines Kryoexperiments wird verlangt. Der Blocker ist ein konkret belegter Projektionskonflikt: Die gebundene aktuelle Seite enthält DE-HE/GK. Die amtliche HE-Original-PDF Q4.5, S. 47, ordnet Supraleitung ausdrücklich dem erhöhten Niveau (Leistungskurs) zu; der direkte gemappte Source-Extraction-Eintrag he-phys-sekii-q4-5-b11-a01-14834c04 bestätigt dies. Das Urteil beruht auf dieser Originalstelle und nicht auf dem canonical LK-Tag. Den aktuellen bundesweiten Scope durch eine bloße Textänderung oder automatische Tagfilterung absegnen wäre unzulässig. Andere Länder sind einzeln zu prüfen, nicht aufgrund dieser HE-Feststellung pauschal zu ändern. Die folgende positive Evidenz gilt für den fachlichen qualitativen Kern, nicht als Freigabe der aktuellen GK-Geltung.",
  "658cf33d-a0c2-5d47-801a-3dbcd5cac074": "revise/block; root confirmed all six held after post-seal comparison and direct original-source verification on 2026-09-07. See post-seal-comparison-and-scope-audit-v1.json; neither original record is rewritten. Die bilinguale Formulierung orientiert sich am amtlichen qualitativen Auftrag, lässt aber die Rolle der Fermienergie für Besetzung gegenüber der Entstehung von Bändern knapp. Das tatsächliche Raster 2540b7c2… enthält qualitativ Metall, Halbleiter, Isolator, Bandlücken und EF-Linien; ohne Temperaturangabe ist keine Nulltemperatur-Aussage über sämtliche eingezeichneten Besetzungen zu unterstellen. Ein klarer Blocker besteht unabhängig davon im Seitenscope: DE-HE/GK wird als anwendbar aufgeführt, während die tatsächlich gelesene Original-PDF HE Q4.5, S. 47, die quantenphysikalische Erklärung der Energiebänder (Fermienergie, nur qualitativ) ausschließlich unter erhöhtem Niveau aufführt. Direkte Quelle he-phys-sekii-q4-5-b09-a01-2ee64ed0. Das einfachere GK-Bändermodell steht in einem anderen Absatz und ist bereits als Voraussetzung vorhanden; dessen Quelle darf nicht den zusätzlichen Fermienergieauftrag an GK vererben. Die RP-Auszüge zum allgemeinen Bändermodell beweisen keine allgemeine HE-GK-Fermienergiekompetenz. Zuerst den konkreten Geltungskonflikt klären, dann gegebenenfalls lokale Formulierungspräzisierung und Bildlegende.",
  "d36727cc-ce42-51a3-9425-41afb0b9acdd": "split_review/split_review; root confirmed all six held after post-seal comparison and direct original-source verification on 2026-09-07. See post-seal-comparison-and-scope-audit-v1.json; neither original record is rewritten. Die Beschreibung bündelt bipolaren Aufbau/Grundfunktion, Schalter, linearen Verstärker und rückgekoppelte Flip-Flop-Schaltung. Das sind unterschiedliche beobachtbare Funktionszusammenhänge; bloßes Interpretieren einer Schalterstellung weist Verstärkung oder Bistabilität nicht nach. 'Wie ... oder' macht daraus zwar Beispiele, schafft aber keinen eindeutigen gemeinsamen Beherrschensnachweis. Der tatsächliche HE-Originaltext Q4.5, S. 46–47, trennt Grundfunktion/Schalter einschließlich Flip-Flop (grundlegend) von Verstärkerschaltung (erhöht), während der aktuelle Atom GK und LK sowie BY-Sek-I umfasst. Im gebundenen Umfeld existiert bereits ein eigenes Verstärkerschaltungsziel. Das spricht für fachlich kontrollierte Konsolidierung bestehender Ziele und Quellen statt neuer pauschaler Duplikate oder stiller Löschung. BY Ph10.5.1–2 stützt einfache Halbleiterschaltungen, nicht automatisch jede genannte Schaltungsart. Kein aktives Bild ist vorhanden und dessen Fehlen ist kein Befund. Die positiven Nachweise unten grenzen gemeinsame Basis und zusätzliche Funktionsfälle ab; erst nach Ziel-/Scope-Aufteilung sind sie in getrennte V2-Profile zu materialisieren.",
  "1232febe-868a-4dac-b4c2-e35789434601": "revise/revise; root confirmed all six held after post-seal comparison and direct original-source verification on 2026-09-07. See post-seal-comparison-and-scope-audit-v1.json; neither original record is rewritten. Die aktuelle DE-Fassung besteht aus Themenfragmenten statt einer beobachtbaren Kompetenz und lässt den wichtigen Unterschied zwischen gleicher Impulsänderung und kleinerer mittlerer Kraft unklar. Die lokale zweisprachige Präzisierung operationalisiert exakt den vorhandenen Kontext, ohne Medizin, neue Unfallmodelle oder eine konkrete Bremswegformel einzuführen. Das HE-Original E1/E2 führt Straßenverkehr als Mechanikanwendung und Anlass zur Verhaltensreflexion an; der direkte Provenienz-Snapshot enthält diesen Kontext. Das tatsächliche Raster 00df3f01… ist rechnerisch richtig: 100000 N·0,05 s = 25000 N·0,20 s = 5000 Ns. Die zwei getrennten Achsensysteme besitzen keine ausdrücklich gemeinsame grafische F-Skalierung; daher behaupte ich aus den verschieden großen gezeichneten Flächen keinen erwiesenen Zahlenfehler. Sicherheitsabstand betrifft die Situation vor dem Stoß und wird nicht fälschlich als längere Knautschzeit dargestellt. Die Übertragung gehört ins eigene V2-Profil.",
  "fbecbd60-5db3-51e8-94be-d66b066ffa06": "revise/block; root confirmed all six held after post-seal comparison and direct original-source verification on 2026-09-07. See post-seal-comparison-and-scope-audit-v1.json; neither original record is rewritten. Zwei konkrete Punkte verhindern eine reine Freigabe. Erstens enthält der gebundene aktuelle Seitenscope DE-RP/GK (G8 und G9), während die direkt zugeordnete Quelle rp-phys-sek2-ef-oblique-throw-lk und die tatsächlich gelesene Original-PDF Rheinland-Pfalz, S. 53, den schiefen Wurf im Wahlpflichtbaustein Einführungsphase Leistungsfach ausweisen. Das ist eine überprüfte Quellen-/Projektionsdiskrepanz, kein Schluss aus dem Namen allein; eine andere tragfähige GK-Quelle wäre ausdrücklich nachzuweisen. Zweitens ist die DE/EN-Zerlegung 'waagerechter Wurf und vertikale Bewegung' missverständlich, weil der waagerechte Wurf selbst bereits die Fallbewegung enthält. Fachlich klar wären horizontale gleichförmige und vertikale gleichmäßig beschleunigte Bewegung im Modell ohne Luftwiderstand. Wegen des offenen RP-Scope-Konflikts wird hier keine scheinbar ausreichende Textrevision angeboten. Das tatsächlich gelesene Raster 44fdf8a6… zeigt die richtige Komponentenformel und Parabel; die Zahl (4,20) bei t=2 s passt etwa zu g=10 m/s², dessen Annahme jedoch nicht genannt wird. Das ist eine nachzuführende Modelllegende, keine von mir behauptete exakt widerlegte Flugbahn. Die positiven Nachweise bleiben qualitativ auf dem ursprünglichen Anforderungsniveau."
}
// Read-only patch emitter for the explicitly selected current B042r KEEP/KEEP pairs after full A/B record-body synthesis.
// Apply the emitted patch once; final description/current-page bindings are checked natively.
// The V1 index is a partial-campaign compatibility snapshot, never a live progress denominator.
const read = (p: string) => readFileSync(p)
const json = (p: string) => JSON.parse(read(p).toString())
const digest = (b: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(b).digest('hex')}`
const bytes = (x: unknown) => JSON.stringify(x, null, 2) + '\n'

async function main() {
  const checkMode = process.argv.includes('--check')
  const authored = json(prefix + '/synthesis-authoring.current-keep3-v1.json')
  const config = json(prefix + '.config.json')
  assert.equal(config.goalIds.length, 9)
  assert.deepEqual(authored.decisions.map((d: any) => d.goalId), expectedGoalIds)
  assert.equal(existsSync(prefix + '/current-keep3-v1.currency-receipt.json'), checkMode, 'Use --check for existing artifacts; never replay writes')
  const sourceBytesBefore = new Map<string, Buffer>([prefix + '.config.json', prefix + '/batch-manifest.json', prefix + '/dual-summary.json', prefix + '/synthesis-authoring.current-keep3-v1.json', helperPath].map(path => [path, read(path)]))
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
    const mixedKeepRevise = false // This B042r subset admits only the three explicitly reviewed KEEP/KEEP pairs.
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
  const manifestPath = 'synthesis-decisions.current-keep3-v1.json'
  const manifestBytes = Buffer.from(bytes(manifest))
  const files: Array<{ path: string; text: string }> = [{ path: prefix + '/' + manifestPath, text: manifestBytes.toString() }]
  const entries: any[] = []
  for (const [i, goal] of expectedGoals.entries()) {
    const decision = manifest.decisions[i]
    const resolution = buildGoalDescriptionDualRoundResolution({ resolutionId: `${authored.manifestId}-${goal.goalId}`, goalId: goal.goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', currentInput: dual.first.input, dualSummaryBytes: dual.bytes, firstSource: goal.firstSource, secondSource: goal.secondSource, synthesis: buildGoalDescriptionRolloutResolutionSynthesis({ batchId: manifest.batch.batchId, manifest, decision, summaryGoal: dual.summary.goals.find(g => g.goalId === goal.goalId)!, firstSource: goal.firstSource, secondSource: goal.secondSource }), synthesisDecisionManifest: { contract: manifest.synthesisContract, manifestPath, manifestId: manifest.manifestId, manifestDigest: digest(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: decision.decisionId } })
    const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape, first: dual.first, second: dual.second, synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath } })
    if (validation.errors.length || !validation.strictDescriptionComplete) throw new Error(`${goal.goalId}: ${validation.errors.join(' | ')}`)
    const path = `resolutions-current-keep3-v1/${goal.goalId}.resolution.json`
    const text = bytes(resolution)
    files.push({ path: prefix + '/' + path, text })
    entries.push({ goalId: goal.goalId, titleDe: goal.finalText.titleDe, groupId: manifest.batch.batchId, decision: 'keep_current', resolutionPath: path, resolutionDigest: digest(text), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  }
  const index = { schemaVersion: 1, artifactSetId: authored.manifestId, subject: config.subjectLabel, semanticKind: 'curricularAtomic', strictDescriptionReviewCompleteCount: entries.length, curriculumAtomicDenominator: historicalDenominator, descriptionReviewPercentage: Math.round(entries.length / historicalDenominator * 1000) / 10, groups: [{ groupId: manifest.batch.batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: digest(dual.bytes), campaignGoalCount: config.goalIds.length, resolvedGoalCount: entries.length }], resolutions: entries }
  assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
  assert.equal(index.groups[0].campaignGoalCount, 9)
  assert.equal(index.groups[0].resolvedGoalCount, expectedGoalIds.length)
  files.push({ path: prefix + '/resolution-index.current-keep3-v1.json', text: bytes(index) })
  const currency = { schemaVersion: 1, artifactType: 'goal-description-current-subset-page-reuse-receipt-v1', checkedAt: authored.synthesisExecutedAt, currentBaseBookDigest: current.model.digest, currentStateAudit, synthesisAuthority: 'Nonblind AI synthesis by /root/goal_book_build_generator after complete current B042r A/B record-body review; root requested the selected scope. Materializer performs structural checks only; no new blind-review or human-approval claim', materializedBy: 'codex-goal-book-build-generator-b042r-nonblind-synthesis', underlyingModelIdentifier: 'not exposed', diversityCaveat: 'Both independent current runs honestly use the same unavailable-model alias. No model diversity is claimed; existing separate reviewer instances and their context limitations are documented.', grantsBatchCompletion: false, grantsProgress: false, currentCanonicalLandscapeDigest: digest(landscapeBytes), originalBatchConfigPath: prefix + '.config.json', originalBatchConfigDigest: digest(read(prefix + '.config.json')), originalBookModelDigest: digest(read(prefix + '/bundle/book-model.json')), deterministicSynthesisTimestamp: synthesizedAt, timestampMeaning: 'Compatibility-contract timestamp: exactly one second after latest completed original run, not the actual later synthesis execution time. checkedAt records the observed current-state synthesis audit.', snapshotDenominatorAuthority: 'Legacy V1 partial-campaign compatibility only: curriculumAtomicDenominator is the original manifest curriculumAtomicDenominatorAtPreparation, not a live denominator. The central five-gate report remains sole live progress authority.', sourceArtifacts: [...sourceBytesBefore].map(([path, data]) => ({ path, sha256: digest(data) })), decision: 'Reuse exact original independent review records only for byte-equivalent current subset pages; no rebinding or fresh-review claim.', reusedGoalIds: [...goalSet], notReusedGoalIds: config.goalIds.filter((id: string) => !goalSet.has(id)), checkedFields: 'Every subset page field, both validated full campaigns, both rounds exact bilingual canonical text and canonical context, goal/page fingerprints and image bindings, selected synthesis manifest and strict resolution validators.', explicitHolds, eligibilityPolicy: 'Carryover requires all native structural/current-page checks, KEEP/KEEP, explicit per-goal nonblind synthesis after complete current A/B body review, and no fachlicher hold. Byte equality never overrides a semantic-atomicity dissent.', grantsHumanAuthority: false }
  files.push({ path: prefix + '/current-keep3-v1.currency-receipt.json', text: bytes(currency) })
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
  console.log(JSON.stringify({ patch, summary: { selected: entries.map(e => e.goalId), files: files.length, indexPath: prefix + '/resolution-index.current-keep3-v1.json' } }))
}
void main()
