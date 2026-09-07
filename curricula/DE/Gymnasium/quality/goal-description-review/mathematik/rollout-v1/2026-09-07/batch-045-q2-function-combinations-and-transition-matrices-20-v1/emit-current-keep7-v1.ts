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

const prefix = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-045-q2-function-combinations-and-transition-matrices-20-v1'
const helperPath = 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-045-q2-function-combinations-and-transition-matrices-20-v1/emit-current-keep7-v1.ts'
const expectedGoalIds = ["91e2f564-3bc8-4924-af85-2a3fa84c1471","cf48c918-f6c1-5429-8da6-14df43f2f550","ae5010cc-ea8d-5b14-aa4a-b0f2b5846a75","5e893892-393e-5df0-b705-fb3b3458122f","33c6e64c-5955-5b07-85d4-74a97b19dd56","8d893e63-d7de-52d9-8bcb-f48f47d1ccbf","4bc6cc77-3d20-5d27-a74a-8efb0a038d17"]
const explicitHolds: Record<string, string> = {
  "71683f37-24de-4e0f-badd-858b56fa4d64": "BLOCK/BLOCK remains HOLD after both sealed reviews. DE/EN beschreiben eine tragfähige einzelne Modellierungsleistung; h(0)=0 liefert korrekt a=-5/9. Die tatsächlich geöffnete Grafik blockiert aber die Seite: Rechts ist S(3,5)/Max. Höhe an einem Punkt auf dem absteigenden Ast der großen Flugbahn markiert; die daneben überlagerten kleinen Bögen liefern auch keine eindeutige korrekte Scheitelzuordnung. Ein Scheitel darf nicht als absteigender Punkt beschriftet werden. Enger Bildfix mit genau einem nachvollziehbaren Kontrollgraphen; keine neue Kompetenz und keine Textänderung erforderlich.",
  "ebc41c8b-5754-5161-9b07-f4525b9fd9b4": "BLOCK/BLOCK remains HOLD after both sealed reviews. Die punktweise Summenbildung ist in DE/EN fachlich sinnvoll und atomar. Das tatsächlich gesehene Bild zeigt jedoch x=1 links von der mit 0 beschrifteten senkrechten Achse und x=2 rechts davon. Damit ist die positive x-Koordinate im Koordinatenbild falsch angeordnet, obwohl 1+1=2 und 4+2=6 in Balken und Tabelle stimmen. Bildkorrektur mit gültiger linearer x-Achse oder ausdrücklich achsenfreier Zweifalltafel erforderlich.",
  "0c5e2ed1-4efb-5bdb-a8e5-fe830eb92c85": "BLOCK/BLOCK remains HOLD after both sealed reviews. DE/EN und die Produkttabelle für x(2-x) sind korrekt, aber die aktuelle Rastergrafik ist quantitativ unzuverlässig: Die positive Nullstelle '(2,0)' liegt zwischen den x-Ticks 2 und 2,5; negative x-Beschriftungen laufen -1,5, -1,0, -1 in gleicher Richtung und die y-Achse enthält zweimal -1. Die richtige Tabelle heilt die widersprüchlichen Achsen nicht. Grafik mit linear konsistenten Ticks, Punkten und Kurven neu prüfen.",
  "91311908-9209-58e4-8429-99dad9df546d": "BLOCK/BLOCK remains HOLD after both sealed reviews. Text, Maschinenreihenfolge und Tabelle zu (x+1)^2 sind fachlich passend. Die tatsächliche Grafik blockiert: Gepunktete Verbindungen weisen die Tabellenzeile x=-2,h=1 dem hohen rechten Punkt zu und x=-1,h=0 einem linken Punkt auf Höhe 1 statt dem Scheitel. Bei der durch Scheitel(-1,0) und (0,1) festgelegten Skalierung liegt der hohe rechte Punkt zudem nicht bei (1,4). Zuordnungen und Kurve müssen gemeinsam korrigiert werden.",
  "c72a8032-71f6-56ed-a896-06ae435ff2ec": "BLOCK/BLOCK remains HOLD after both sealed reviews. DE/EN formulieren eine zusammenhängende Funktionsuntersuchung ohne zwingenden Split. Definitionsbereich, Symmetrie, Ableitung und Vorzeichenrechnung des Beispiels ln(x²+1) stimmen. Das tatsächlich betrachtete Hauptdiagramm zeichnet aber einen bis x=±3 konvexen parabelförmigen Graphen; tatsächlich wechselt f''=2(1-x²)/(1+x²)² bei ±1 das Vorzeichen und die Äste flachen danach ab. Das kleine beschriftete Symbol verlegt zusätzlich den Tiefpunkt rechts von die y-Achse. Beschriftete Funktionsbilder müssen dem konkreten Verlauf entsprechen.",
  "f378917f-2ca7-4c68-bd66-3f9457095dd5": "KEEP/BLOCK remains HOLD after both sealed reviews. Tabellarisches Organisieren einfacher Tupel, Zelladressen lesen und deren Bedeutung erklären ist ein konkretes zusammengehöriges DE/EN-Ziel. Das aktuelle requires fordert jedoch Hauptsatz der Differential-/Integralrechnung und elementare Ableitungen, obwohl Tabellenlesen weder Integralrechnung noch Ableiten voraussetzt und sogar im kompilierten HE-Sek-I-G8-Scope auftaucht. Diese fachfremde harte Zugangssperre muss gezielt entfernt werden. Das Bild selbst ist für die Datenzeilen brauchbar. Tatsächlich geöffnet: Spalten A/B/C, Zeilen1–4, Q=(4;1), B3=4 als x von Q und C4=3 als y von R korrekt. 'Jede Tabellenzeile' ist hier im Kontext der Datenzeilen zu lesen, die Kopfzeile ist sichtbar; kein eigenständiger Bildblock.",
  "03685f87-7570-5bb3-b1c7-134124abb317": "BLOCK/BLOCK remains HOLD after both sealed reviews. Die einzelne Darstellungs-/Deutungsleistung ist DE/EN sinnvoll und der Rechenweg M(100,50,20)^T=(72,55,43)^T korrekt. In der tatsächlichen Rasteransicht zeigt jedoch die Sprechblasen-Spitze '30% wechseln von A nach B' auf den Eintrag 0.6 in nach-A/von-A, nicht auf 0.3 in nach-B/von-A. Gerade die Eintragsdeutung ist das Lernziel; der falsche Pfeil ist deshalb ein konkreter fachlicher Bildblocker. Nur diese Zuordnung korrigieren und das vollständige Bild danach erneut prüfen.",
  "4fb40e58-58c1-5964-b58e-3347a8022b97": "BLOCK/BLOCK remains HOLD after both sealed reviews. Skalare Multiplikation ist als einzelne grundlegende Operation legitim; DE/EN stimmen und die Endmatrix 3A=(6,-3;0,12) ist richtig. Die zentrale tatsächlich betrachtete Rechenwolke enthält aber 3·[3·2,3·(-1);3·0,3·4]: Der Skalar steht bereits in allen Einträgen und nochmals davor. Das ist 9A, nicht die daneben behauptete Endmatrix. Doppelten Faktor entfernen; keine pauschale Beschreibungserweiterung.",
  "6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8": "BLOCK/BLOCK remains HOLD after both sealed reviews. DE/EN benennen die gleiche eintragweise Operation einschließlich gleich großer Matrizen; die acht ausgerechneten Ergebniswerte im Bild stimmen. Die tatsächlich betrachteten Verbindungswege ordnen aber u.a. die grüne 4 unten rechts in A dem oberen rechten Term -1+5 bzw. -1-5 zu. Damit widerspricht die Pfeilzuordnung der behaupteten Regel 'gleiche Positionen'. Zahlen und Pfeile gemeinsam korrigieren; keine neue Teilkompetenz erforderlich.",
  "6f09c97e-779b-500b-8092-3fb9696aa5bb": "KEEP/BLOCK remains HOLD after both sealed reviews. Matrix-Vektor-Produkt und Deutung als Folgezustand sind in diesem Übergangsprozesskontext eine einzelne passende DE/EN-Kompetenz. Das Bild berechnet .8*70+.3*30=65 und .2*70+.7*30=35 richtig und zeigt die beiden Matrixzeilen. Der Block betrifft die echten direkten requires: Hauptsatz und Ableitungen sind für endliche Zeilen-Skalarprodukte nicht notwendig. Tabellen- und Matrixgrundlagen dagegen behalten; keine ausgedachte Bildkorrektur. Bild vollständig geprüft: Matrix[[.8,.3],[.2,.7]], Ausgang(70,30), Ergebnis(65,35), beide ausgeschriebenen Rechnungen und Komponenten stimmen. Kein Bildfehler als Blockgrund behauptet; die unnötige Analysis-Zugangssperre steht im aktuellen Kontext.",
  "6aa593a3-6690-581d-9b7d-37cac78187a1": "BLOCK/KEEP remains HOLD after both sealed reviews. Die Modellwahl einschließlich begründeter Wahrscheinlichkeiten ist DE/EN klar und inhaltlich atomar. Tabelle, Spaltensummen und .75/.25 sind richtig. Der untere tatsächlich gelesene Rechenausdruck lautet aber 'M [0.8 0.3;0.2 0.7] · [0.9;0.1] = ...': Ohne Gleichheitszeichen oder Kennzeichnung einer reinen Bezeichnung ist M ein zusätzlicher Matrixfaktor und führt zu M²v0=(.675,.325), nicht zum ausgegebenen v1. Die Notation muss eindeutig zu Mv0 = [Matrix]v0 werden; kein neuer fachlicher Scope.",
  "304111dd-426b-520b-a275-3fa37da1b0e0": "BLOCK/BLOCK remains HOLD after both sealed reviews. Die Matrixprodukt-Kompetenz mit Dimensionen und Reihenfolge ist DE/EN gut begrenzt. C=(2,7;14,10) und die Einzelrechnungen stimmen. Die tatsächlich gesehene zentrale Gleichheitskette setzt jedoch A=[A]·B=[B]=C=[C] und damit Matrizen unterschiedlicher Dimension gleich. Im rechten vertauschten Beispiel passen die inneren Dimensionen sogar (BA ist 3x3), weshalb 'Dimensionen passen oft nicht' dieses konkrete Beispiel nicht erklärt. Formel-/Beispielkorrektur erforderlich; die Schlussmatrix allein genügt nicht.",
  "ce198bc9-b014-52ba-814f-25cc3e020668": "KEEP/BLOCK remains HOLD after both sealed reviews. Das inverse Bestimmen einfacher2×2- oder Diagonalmatrizen mit Multiplikationsprobe ist ein angemessen begrenztes DE/EN-Ziel; die Probe gehört zum selben Verständnis. Das bereits approved Bild ist auch in der tatsächlichen Prüfung korrekt: det1, Inverse[[1,-1],[-1,2]], ProduktI. Jedoch sind direkt Hauptsatz und Ableitungen als Voraussetzung eingetragen, obwohl der hier geforderte endliche Inversions-/Prüfprozess keine Differential- oder Integralrechnung benötigt. Harte Kanten gezielt berichtigen. Bild tatsächlich geöffnet trotz Altstatus approved: alle vier ausgeschriebenen Multiplikationen ergeben1,0,0,1; Regel Diagonale tauschen/Nebendiagonale negieren ist ausdrücklich auf det=1 beschränkt. Nicht für allgemeine Determinanten als vollgültige Formel ausgegeben."
}
// Read-only patch emitter for the explicitly selected current B045 KEEP/KEEP pairs after full A/B record-body synthesis.
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
    const mixedKeepRevise = false // This B045 subset admits only the seven explicitly reviewed KEEP/KEEP pairs.
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
  const currency = { schemaVersion: 1, artifactType: 'goal-description-current-subset-page-reuse-receipt-v1', checkedAt: authored.synthesisExecutedAt, currentBaseBookDigest: current.model.digest, currentStateAudit, synthesisAuthority: 'Nonblind AI synthesis by /root/goal_book_ci_integration after complete current B045 A/B record-body review; root requested the selected scope. Materializer performs structural checks only; no new blind-review or human-approval claim', materializedBy: 'codex-goal-book-ci-integration-b045-nonblind-synthesis', underlyingModelIdentifier: 'not exposed', diversityCaveat: 'Both independent current runs honestly use the same unavailable-model alias. No model diversity is claimed; existing separate reviewer instances and their context limitations are documented.', grantsBatchCompletion: false, grantsProgress: false, currentCanonicalLandscapeDigest: digest(landscapeBytes), originalBatchConfigPath: prefix + '.config.json', originalBatchConfigDigest: digest(read(prefix + '.config.json')), originalBookModelDigest: digest(read(prefix + '/bundle/book-model.json')), deterministicSynthesisTimestamp: synthesizedAt, timestampMeaning: 'Compatibility-contract timestamp: exactly one second after latest completed original run, not the actual later synthesis execution time. checkedAt records the observed current-state synthesis audit.', snapshotDenominatorAuthority: 'Legacy V1 partial-campaign compatibility only: curriculumAtomicDenominator is the original manifest curriculumAtomicDenominatorAtPreparation, not a live denominator. The central five-gate report remains sole live progress authority.', sourceArtifacts: [...sourceBytesBefore].map(([path, data]) => ({ path, sha256: digest(data) })), decision: 'Reuse exact original independent review records only for byte-equivalent current subset pages; no rebinding or fresh-review claim.', reusedGoalIds: [...goalSet], notReusedGoalIds: config.goalIds.filter((id: string) => !goalSet.has(id)), checkedFields: 'Every subset page field, both validated full campaigns, both rounds exact bilingual canonical text and canonical context, goal/page fingerprints and image bindings, selected synthesis manifest and strict resolution validators.', explicitHolds, eligibilityPolicy: 'Carryover requires all native structural/current-page checks, KEEP/KEEP, explicit per-goal nonblind synthesis after complete current A/B body review, and no fachlicher hold. Byte equality never overrides a semantic-atomicity dissent.', grantsHumanAuthority: false }
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
