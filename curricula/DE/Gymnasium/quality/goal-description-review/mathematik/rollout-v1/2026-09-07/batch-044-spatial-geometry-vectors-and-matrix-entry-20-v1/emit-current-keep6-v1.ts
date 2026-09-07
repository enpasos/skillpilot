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

const prefix = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1'
const helperPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1/emit-current-keep6-v1.ts'
const expectedGoalIds = ["075f1ef2-6860-4b20-9df2-878157eb395e","7680701b-35e3-519e-beaa-09753e733756","d81d888c-6ffa-5751-8a4b-ce2ff3085071","5390691d-1b7c-5572-9589-a69c2bba9a27","b04bd2d6-21d4-5ac5-9a77-b5f950a41c24","fb7a4fa0-03b5-53b4-bd86-608480b748a1"]
const explicitHolds: Record<string, string> = {
  "be0e8715-3c3a-5ffb-937a-0b6bce4f01d8": "DE/EN formulieren eine kohärente Darstellungs- und Deutungskompetenz. Das tatsächlich angesehene Bild erklärt jedoch, der Richtungsvektor gebe die 'Länge/Skalierung einer Geraden' an; eine Gerade besitzt keine endliche Länge. Auch A(1,2,1) und B(4,3,3) passen nicht zu einer gemeinsamen linearen Projektion mit x nach links unten und y nach rechts: horizontal müsste B weniger weit rechts als das Dreifache von A liegen, sichtbar gilt das Gegenteil. Zudem erscheinen Hauptsatz und elementares Ableiten als sachlich unbegründete direkte Voraussetzungen. Deshalb Seiten-/Modellkorrektur statt kosmetischer Beschreibung; die Evidenzkette bleibt beim beanspruchten Vektorverständnis.",
  "aae119f2-925f-5fc1-b795-b52c9e980863": "Die bilinguale Kompetenz ist ausreichend. Das aktuelle Bild besitzt zwar konsistente Eckpunkttripel, platziert aber 'x=4' an der y-parallelen Kante BC und 'y=3' an der x-parallelen Kante CD sowie zusätzliche unklar zugeordnete Innenlinien. Als Kanten-/Maßangaben sind die Bezeichnungen vertauscht; als Ebenengleichungen wären sie eigens zu kennzeichnen. Für ein Einstiegsbild zur Wahl von Koordinatenbezügen ist diese ungelöste Darstellungsmehrdeutigkeit blockierend. Keine textliche Uminterpretation als Bildreparatur.",
  "d379e28b-d9d5-5cab-b383-318e0499c0c7": "Der Wortlaut ist eine zusammenhängende Klassifikationskompetenz. Im tatsächlich gesehenen Quaderbild sind die linke senkrechte Kante und die vordere waagerechte Kante beide mit a, die parallele rechte senkrechte Kante dagegen mit c beschriftet. Die Grafik behauptet gleichzeitig drei Kantenlängen a,b,c und liefert keine Sonderbedingung a=c. Diese widersprüchliche Kantenfamilienkennzeichnung verhindert eine saubere Lehrdarstellung, unabhängig vom bisherigen approved-Flag.",
  "4af3dfb9-7e15-5da5-8b86-0aac6c80e266": "DE/EN sind hinreichend präzise. Die aktuelle Grafik markiert jedoch sämtliche Winkel einer deutlich nicht rechtwinkligen Raute mit identischen Doppelbögen, alle vier Drachenviereckseiten mit demselben Gleichheitszeichen und beide nicht parallelen Seitenfamilien des Parallelogramms mit identischen Parallelitätszeichen. Textdefinitionen sind überwiegend korrekt, aber die Zeichen lehren gegenteilige Gleichheiten. Außerdem sind die drei vorgeschalteten 3D-Koordinatenziele für elementare Figurenbeschreibung fachlich unnötig; Seiten-/Graphkontext separat korrigieren.",
  "d6b74b15-1cbc-512b-a160-0f40aecafe8c": "KEEP/BLOCK; post-seal adjudication by A reviewer recognizes B's shared-grid proportionality objection as material: displayed side ratios and the claimed factor 2 do not fit the drawn common grid. Correct labels and formulas do not cure the quantitative picture. A record remains unchanged; require corrected visualization and fresh review.",
  "ef1524f1-0b2f-59f7-a001-5ab3e3dececb": "Die DE/EN-Beschreibung hält eine einheitliche Begründungskompetenz offen. Die textliche WSW-Begründung des Parallelogramms ist korrekt. Die roten Bögen im ersten Bild umfassen aber die gesamten Winkel BAD und BCD, während die Beschriftung BAC=DCA behauptet; die Diagonale schneidet die gezeichneten Bögen statt deren Schenkel zu bilden. Zusätzlich sind beide Parallelitätsfamilien identisch markiert. Gerade bei einem Beweisziel müssen markierte und benannte Winkel exakt übereinstimmen; daher Bildkorrektur vor Abschluss.",
  "eb6bfdd9-3cbe-51b5-9798-a741bdc2782e": "Die bilinguale Kompetenz verbindet Bedienung sinnvoll mit einer fachlichen Prüfung. In der aktuellen großen Grafik ist die x-Projektionsstelle mit 1 beschriftet, obwohl Pxy(2,1,0) und P(2,1,3) angegeben werden; daneben zeigt die Draufsicht ausdrücklich x=2. Diese widersprüchliche Ableseinformation ist im Lernziel zur softwaregestützten Koordinatenprüfung blockierend. Keine Behauptung, dass das Bild eine echte Softwareaufnahme wäre.",
  "f37b0a72-9e23-51c7-aad5-438c17a56899": "Der Wortlaut beschreibt kohärent grundlegende Verschiebungsoperationen in beiden Sprachen. Die Zahlenbeispiele a+b=(1,3,4) und 2a=(4,2,2) stimmen. Im rechten Bild gehen a und 2a jedoch vom selben Ursprung in sichtbar unterschiedliche Richtungen; Skalarmultiplikation mit 2 muss exakt kollineare Pfeile ergeben. Eine lokale Textrevision würde den sachlichen Bildfehler nicht beheben.",
  "72dfc164-455d-4b63-85f0-96e803c9a1d5": "DE/EN erhalten die Einheit aus Darstellen, Koeffizientenbestimmung und geometrischer Deutung. Die Rechnung 2(1,0,1)+(0,2,1)=(2,2,3) ist korrekt. Im linken Achsenbild wird u=(1,0,1) aber nach rechts oben gezeichnet, obwohl die positive x-Achse nach links unten und z nach oben zeigt: bei y=0 kann die horizontale Projektion nicht nach rechts weisen. Die angegebene Ebene wird damit ebenfalls falsch verankert. Das schematische Mittelpanel heilt diesen expliziten Koordinatenfehler nicht.",
  "6fc9246a-9448-4cdb-b627-cf20ea1c65d3": "KEEP/BLOCK; post-seal adjudication retains the image hold because axes and arrow origin are not unambiguously tied to the given coordinate example. The left black axes are unlabeled, so B's specific claim that the left axis is x is not established by a visible label; root accepted this narrower ambiguity finding. Both sealed records remain unchanged. Require a consistently labeled representation, not inferred axes.",
  "54cfe5ce-693e-5d4a-ac1b-009570fbbc11": "Die Beschreibung ist mathematisch tragfähig und methodenoffen; die angegebenen Quotienten 2 sowie 1,5/1/4÷3 sind korrekt. Die 3D-Skizzen zeichnen a=(2,-1,3) aber nach rechts, obwohl positive x-Richtung nach links unten und positive y-Richtung nach rechts zeigen. Positive x- und negative y-Anteile müssen beide horizontal nach links beitragen. Der gleiche Fehler betrifft b und c. Die Beispiele benötigen geometrisch konsistente Pfeile oder eine explizit achsenfreie Schemafassung.",
  "68d4faef-1a56-5898-9c31-80b7d5d2e430": "Die DE/EN-Beschreibung und die Rechnung (4,6,12)-(1,2,0)=(3,4,12), Betrag 13, sind korrekt. Die tatsächlich angesehene PNG-Geometrie ist dennoch nicht mit den Punkttripeln vereinbar: bei x nach links unten, y nach rechts und z senkrecht muss die horizontale Lage B=4ex+6ey links von 3A=3ex+6ey liegen; sichtbar steht B weit rechts davon. Auch ein frei gewählter positiver Achsenmaßstab kann diesen Widerspruch nicht erklären. Der Bildkontext benötigt eine eigene Korrektur.",
  "69eda7f9-1898-5220-932d-e7bec839b7af": "Die Wortlaute verbinden Auswahl und Anwendung sinnvoll und gehen über das vorausgesetzte Zweipunktverfahren hinaus. Im Bild endet die orange als AC erläuterte Grundflächendiagonale jedoch bei B(6,0,0), während C(6,4,0) an einer angrenzenden Vorderkante beschriftet ist. Damit sind B/C-Zuordnung und zugehörige obere Eckpunkte inkonsistent; auch die x-Achse zeigt von der positiven x-Kantenfamilie weg. Die Zahlen sqrt(52) und sqrt(61) stimmen für die behaupteten Tripel, nicht für die gezeichnete Zuordnung.",
  "b5062446-332f-4a67-aaf7-3bfa3e5aded9": "BLOCK/KEEP; the current matrix-entry description and image are sound, but canonical direct requires include the fundamental theorem of calculus and elementary differentiation. These are actual frontier gates rather than historic display labels; they unnecessarily gate the elementary row/column-entry competence. Root acknowledges the graph finding, leaves the dissent open and authorizes read-only prerequisite alternatives audit only. No source edits or strict completion."
}
// Read-only patch emitter for the explicitly selected current B044 KEEP/KEEP pairs after full A/B record-body synthesis.
// Apply the emitted patch once; final description/current-page bindings are checked natively.
// The V1 index is a partial-campaign compatibility snapshot, never a live progress denominator.
const read = (p: string) => readFileSync(p)
const json = (p: string) => JSON.parse(read(p).toString())
const digest = (b: Buffer | string): `sha256:${string}` => `sha256:${createHash('sha256').update(b).digest('hex')}`
const bytes = (x: unknown) => JSON.stringify(x, null, 2) + '\n'

async function main() {
  const checkMode = process.argv.includes('--check')
  const authored = json(prefix + '/synthesis-authoring.current-keep6-v1.json')
  const config = json(prefix + '.config.json')
  assert.equal(config.goalIds.length, 20)
  assert.deepEqual(authored.decisions.map((d: any) => d.goalId), expectedGoalIds)
  assert.equal(existsSync(prefix + '/current-keep6-v1.currency-receipt.json'), checkMode, 'Use --check for existing artifacts; never replay writes')
  const sourceBytesBefore = new Map<string, Buffer>([prefix + '.config.json', prefix + '/batch-manifest.json', prefix + '/dual-summary.json', prefix + '/synthesis-authoring.current-keep6-v1.json', helperPath].map(path => [path, read(path)]))
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
    const mixedKeepRevise = false // This B044 subset admits only the six explicitly reviewed KEEP/KEEP pairs.
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
  const manifestPath = 'synthesis-decisions.current-keep6-v1.json'
  const manifestBytes = Buffer.from(bytes(manifest))
  const files: Array<{ path: string; text: string }> = [{ path: prefix + '/' + manifestPath, text: manifestBytes.toString() }]
  const entries: any[] = []
  for (const [i, goal] of expectedGoals.entries()) {
    const decision = manifest.decisions[i]
    const resolution = buildGoalDescriptionDualRoundResolution({ resolutionId: `${authored.manifestId}-${goal.goalId}`, goalId: goal.goalId, effectiveSemanticKind: 'curricularAtomic', decision: 'keep_current', currentInput: dual.first.input, dualSummaryBytes: dual.bytes, firstSource: goal.firstSource, secondSource: goal.secondSource, synthesis: buildGoalDescriptionRolloutResolutionSynthesis({ batchId: manifest.batch.batchId, manifest, decision, summaryGoal: dual.summary.goals.find(g => g.goalId === goal.goalId)!, firstSource: goal.firstSource, secondSource: goal.secondSource }), synthesisDecisionManifest: { contract: manifest.synthesisContract, manifestPath, manifestId: manifest.manifestId, manifestDigest: digest(manifestBytes), manifestFingerprint: manifest.manifestFingerprint, decisionId: decision.decisionId } })
    const validation = await validateGoalDescriptionDualRoundResolution({ resolution, dualSummary: dual.summary, dualSummaryBytes: dual.bytes, currentInput: dual.first.input, landscape, first: dual.first, second: dual.second, synthesisDecisionManifestArtifact: { manifest, manifestBytes, manifestPath } })
    if (validation.errors.length || !validation.strictDescriptionComplete) throw new Error(`${goal.goalId}: ${validation.errors.join(' | ')}`)
    const path = `resolutions-current-keep6-v1/${goal.goalId}.resolution.json`
    const text = bytes(resolution)
    files.push({ path: prefix + '/' + path, text })
    entries.push({ goalId: goal.goalId, titleDe: goal.finalText.titleDe, groupId: manifest.batch.batchId, decision: 'keep_current', resolutionPath: path, resolutionDigest: digest(text), resolutionFingerprint: resolution.resolutionFingerprint, strictDescriptionComplete: true })
  }
  const index = { schemaVersion: 1, artifactSetId: authored.manifestId, subject: config.subjectLabel, semanticKind: 'curricularAtomic', strictDescriptionReviewCompleteCount: entries.length, curriculumAtomicDenominator: historicalDenominator, descriptionReviewPercentage: Math.round(entries.length / historicalDenominator * 1000) / 10, groups: [{ groupId: manifest.batch.batchId, artifactDirectory: '.', dualSummaryPath: 'dual-summary.json', dualSummaryDigest: digest(dual.bytes), campaignGoalCount: config.goalIds.length, resolvedGoalCount: entries.length }], resolutions: entries }
  assert.deepEqual(validateLegacyResolutionIndexSnapshot(index), [])
  assert.equal(index.groups[0].campaignGoalCount, 20)
  assert.equal(index.groups[0].resolvedGoalCount, expectedGoalIds.length)
  files.push({ path: prefix + '/resolution-index.current-keep6-v1.json', text: bytes(index) })
  const currency = { schemaVersion: 1, artifactType: 'goal-description-current-subset-page-reuse-receipt-v1', checkedAt: authored.synthesisExecutedAt, currentBaseBookDigest: current.model.digest, currentStateAudit, synthesisAuthority: 'Nonblind AI synthesis by /root/goal_book_build_generator after complete current B044 A/B record-body review; root requested the selected scope. Materializer performs structural checks only; no new blind-review or human-approval claim', materializedBy: 'codex-goal-book-build-generator-b044-nonblind-synthesis', underlyingModelIdentifier: 'not exposed', diversityCaveat: 'Both independent current runs honestly use the same unavailable-model alias. No model diversity is claimed; existing separate reviewer instances and their context limitations are documented.', grantsBatchCompletion: false, grantsProgress: false, currentCanonicalLandscapeDigest: digest(landscapeBytes), originalBatchConfigPath: prefix + '.config.json', originalBatchConfigDigest: digest(read(prefix + '.config.json')), originalBookModelDigest: digest(read(prefix + '/bundle/book-model.json')), deterministicSynthesisTimestamp: synthesizedAt, timestampMeaning: 'Compatibility-contract timestamp: exactly one second after latest completed original run, not the actual later synthesis execution time. checkedAt records the observed current-state synthesis audit.', snapshotDenominatorAuthority: 'Legacy V1 partial-campaign compatibility only: curriculumAtomicDenominator is the original manifest curriculumAtomicDenominatorAtPreparation, not a live denominator. The central five-gate report remains sole live progress authority.', sourceArtifacts: [...sourceBytesBefore].map(([path, data]) => ({ path, sha256: digest(data) })), decision: 'Reuse exact original independent review records only for byte-equivalent current subset pages; no rebinding or fresh-review claim.', reusedGoalIds: [...goalSet], notReusedGoalIds: config.goalIds.filter((id: string) => !goalSet.has(id)), checkedFields: 'Every subset page field, both validated full campaigns, both rounds exact bilingual canonical text and canonical context, goal/page fingerprints and image bindings, selected synthesis manifest and strict resolution validators.', explicitHolds, eligibilityPolicy: 'Carryover requires all native structural/current-page checks, KEEP/KEEP, explicit per-goal nonblind synthesis after complete current A/B body review, and no fachlicher hold. Byte equality never overrides a semantic-atomicity dissent.', grantsHumanAuthority: false }
  files.push({ path: prefix + '/current-keep6-v1.currency-receipt.json', text: bytes(currency) })
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
  console.log(JSON.stringify({ patch, summary: { selected: entries.map(e => e.goalId), files: files.length, indexPath: prefix + '/resolution-index.current-keep6-v1.json' } }))
}
void main()
