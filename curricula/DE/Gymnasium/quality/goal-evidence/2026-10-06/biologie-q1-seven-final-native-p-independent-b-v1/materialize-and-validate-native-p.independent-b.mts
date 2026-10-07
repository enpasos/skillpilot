import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fingerprintGoalForPositiveEvidence, fingerprintPositiveGoalEvidenceReviewInput, fingerprintPositiveGoalEvidenceProfile, validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview'

const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
const author = base + '/biologie-q1-seven-final-native-positive-author-v1'
const prepared = base + '/biologie-q1-seven-final-native-review-inputs-author-v1'
const own = base + '/biologie-q1-seven-final-native-p-independent-b-v1'
const rootCandidate = base + '/biologie-q1-seven-reviewed-integration-candidate-v1'
const actualInputs = new Map<string, any>()
const sha = (b: Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex')
const bytes = (path: string) => { if (path.includes('/round-a/') || path.includes('independent-a')) throw new Error('Peer A input forbidden'); const data = readFileSync(resolve(path)); actualInputs.set(path, { path, sha256: sha(data), bytes: data.length }); return data }
const read = (path: string) => JSON.parse(bytes(path).toString())
const write = (path: string, data: any) => writeFileSync(resolve(own, path), JSON.stringify(data, null, 2) + '\n')
const assert = (condition: any, label: string) => { if (!condition) throw new Error(label) }
const freezePath = author + '/native-positive-author-v1.final.freeze.json'
assert(sha(bytes(freezePath)) === 'sha256:d6853ab50dbd9d49ee200b43c10fb2a5d8e6ac6b614a8fdeb5d0c973ed554212', 'Changed author P freeze')
const frozen = read(freezePath)
for (const file of frozen.files) assert(sha(bytes(author + '/' + file.path)) === 'sha256:' + file.sha256, 'Changed frozen P author file ' + file.path)
const config = read(author + '/positive-evidence.seven.author-candidates.config.json')
const records = bytes(author + '/positive-evidence.seven.author-candidates.review.jsonl').toString().trim().split('\n').map(line => JSON.parse(line))
const input = read(prepared + '/inputs/positive-review-inputs.native-fingerprints.pending.json')
const before = read(config.landscapePath)
const after = read(rootCandidate + '/canonical-390.integration-candidate.json')
const beforeByID = new Map<string, any>(before.goals.map((g: any) => [g.id, g]))
const afterByID = new Map<string, any>(after.goals.map((g: any) => [g.id, g]))
const ledger = read(config.semanticKindLedgerPath)
const snapshot = read(base + '/biologie-q1-seven-component-source-topic-corrections-author-v7/seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json')
const criteria = sha(bytes(config.reviewCriteriaPath))
const request = read(author + '/independent-p-review-request.actual-inputs.json')
bytes(request.authoringPrompt.path)
const require = createRequire(resolve('app/package.json'))
const Ajv2020 = require('ajv/dist/2020').default
const addFormats = require('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const schema = read('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')
const validate = ajv.compile(schema)
const validateConfig = ajv.compile(read('contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'))
const reasons = [
  'KEEP. Alle drei erwarteten Strukturrelationen passen zum exakt gebundenen DNA/Gen/Chromosom-Ziel. classical-carriers-a begründet die Verschachtelung und offene Genzahl; classical-carriers-b überträgt dieselbe Relation auf vorgegebene Abschnittsvarianten. Die vollständige zweite Materialkarte bleibt erhalten, das Profil verlangt aber keine zusätzliche Alleldefinition, Erbgangs- oder Genproduktkompetenz. Beide Sprachen sind semantisch gleich. Der Wechsel von Gesamtübersicht zum Abschnitt und zur homologen Darstellung ist sachhaltiger Transfer. Eigenständiges Erklären statt Ablesen des Bildes ist benannt. Direkte BE/BB-Geltung und zusätzliche prerequisiteOnly-Verfügbarkeit bleiben getrennt.',
  'KEEP. Die drei Veränderungsniveaus, ihre ausdrücklich gegebenen Ursachen und unmittelbaren Informationsfolgen werden positiv am tatsächlichen Modell verglichen. Beide vollständigen Fälle enthalten die benötigten Ursacheninformationen. Der kontrollierte Aktivitätsbefund 50±2→20±2 wird ausschließlich für den gemessenen Genfall begrenzt; es wird keine Enzymidentität, Leseraster-, klinische oder allgemeine Genproduktkompetenz eingeführt. Verdopplung versus Inversion sowie Zugewinn versus Verlust und vorhandene versus fehlende Funktionsdaten sind echte Variationen. DE/EN stimmen einschließlich der Grenze nicht gemessener Merkmale überein. SN/TH-Sek-I-Quellen bleiben komponentenbegrenzt.',
  'KEEP. Positionsvergleich und vollständige Chromosomenzählung werden getrennt begründet; ACTA→ATTA ist Position2 C→T, GCAA→GCTA Position3 A→T. Die Zahländerungen4→5 und6→5 sind korrekt. Der zweite vollständige Fall verändert zusätzlich die Evidenzlage: Q besitzt keine gemessene Gensequenz; eine passende Zusatzinformation wird benannt, ohne eine Untersuchung tatsächlich durchzuführen oder PCR-/Diagnosekompetenz zu verlangen. Das Profil bewahrt die vorgegebene Substitutionskonvention und macht sie nicht zur universellen Terminologiedefinition. DE/EN äquivalent. ST-gemeinsame Einführungsphase bleibt Sek II und wird nicht in Sek I oder einen amtlichen GK/LK-Kurs umgedeutet.',
  'KEEP. Alle vier vollständigen Materialfälle sind in den Briefs korrekt vertreten. R-Häufigkeiten0,3/2,7/0,6 Prozent und M0,2/1,8/1,7 Prozent sind richtig; Kontrollwerte größer null sowie passende Schutzwirkung bleiben erkennbar. UV-A/B/C werden mit Exposition, gleicher Teilnahme und Organisationspriorität bewertet; C bei möglicher Umstellung und B bei festem Zeitplan sind begründet. PAK-Fünftagessummen60/10/55 und der sechsminütige sichere Zusatzweg stimmen; kein unbegründetes Zusammenfassen der Streuung oder persönlicher Krankheitswert. Mechanismus, Datenvergleich, Kriterienurteil und Grenzen bleiben getrennt. UV und PAK, Gruppe und Alltag sowie veränderte Zeit-/Wetterbedingungen bieten echten Transfer. DE/EN äquivalent; tatsächliche MV-/ST-Bewertungsoperatoren werden nicht auf Mutagenbenennung reduziert.',
  'KEEP. Die drei Erwartungen begründen die tatsächliche Zellabstammung, den Zeitpunkt und die bedingte Befruchtungsbeteiligung. lineage-a liefert getrennte Tier-K-/G-Linien ohne Zellwechsel; lineage-b variiert frühe Zygotenänderung, späte Körperzelländerung und explizit unbenutzte fertige Keimzelle. Die weitergegebene DNA-Änderung und eine bestimmte Krankheit bleiben getrennt. Es wird weder allgemeine Pflanzenbiologie noch eine Keimzellwahrscheinlichkeit vorausgesetzt. In beiden Sprachen wird die unbenutzte G-Keimzelle in der angegebenen Befruchtung korrekt ausgeschlossen. Das Bild unterstützt den Stammbaum, ersetzt dessen selbst begründetes Nachverfolgen aber nicht. Direkte Quelle bleibt MV-Sek-I-Komponente.',
  'KEEP. Das Profil nutzt die ausdrücklich stipulierte vollständige Informationskonstanz bei Klonen und begrenzt den einzelnen Sequenzbefund auf den gemessenen Abschnitt. L/H12/20 und16/16 unter gleichem Licht, M-Mutation trotz Blattwert16 sowie A/B8/10→14/16→8/10 sind korrekt. Die gleichzeitig bestehende genetische Variante und zusätzliche temperaturabhängige sechs Einheiten werden getrennt; der eine Sequenzunterschied wird nicht als alleinige Ursache aller Ausgangsunterschiede ausgegeben. Die Rückkehr wird nicht zur universellen Reversibilitätsregel. Kontrollen, kausale Grenzen und Koexistenz bilden echte Variation, mit gleichem DE/EN-Umfang. Quellen- und ST-Kursgrenzen bleiben erhalten.',
  'KEEP. Die intakte alte Vorlage, der markierte neue Strang und die Paarungsregel sind im vollständigen Material vorgegeben; damit ist die Modellkorrektur keine zusätzliche molekularchemische oder Enzymkenntnis. Position3 wird korrekt zu5′–ATGC–3′ bzw.5′–CATG–3′ repariert. Erkennen, Entfernen/Ersetzen, weitere Kopie und mögliche Fixierung werden fachlich getrennt.30−24=6 sind zunächst unkorrigierte Fehlpaarungen, kein Nachweis sechs bleibender Mutationen oder eines universellen Reparaturwirkungsgrads. R/N variiert Erkennen mit und ohne Korrektur; beide Informationswege werden selbst erklärt. DE/EN äquivalent, TH-Sek-I-Quelle und einfache Modellgrenze bewahrt.'
]
assert(records.length === 7 && input.rows.length === 7, 'Wrong seven-profile scope')
const nativeRows: any[] = []
const caseRows: any[] = []
const ownRecords: any[] = []
const now = new Date().toISOString()
for (const [index, record] of records.entries()) {
  const exactInput = input.rows[index]
  assert(record.goalId === exactInput.goalId, 'Profile order or UUID changed')
  const goal = beforeByID.get(record.goalId)!
  const finalGoal = afterByID.get(record.goalId)!
  assert(ledger.decisions.find((r: any) => r.goalId === record.goalId)?.semanticKind === 'curricularAtomic', 'Wrong effective semantic kind')
  assert(record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate' && record.evidenceLevel === 'E1' && record.maximumClaimScope === 'G1', 'Inflated authority/evidence')
  assert(record.reviewRunIds.length === 0, 'Unresolved author run claim')
  assert(validate(record), 'Closed native schema: ' + ajv.errorsText(validate.errors))
  const link = goal.resourceLinks.find((r: any) => r.type === 'goal-visualization' && r.role === 'primary')
  const actualPNG = bytes(exactInput.actualSelectedAsset.path)
  const resources = { [link.url]: sha(actualPNG) }
  assert(resources[link.url] === exactInput.resourceDigests[link.url], 'Wrong actual raster')
  assert(record.reviewCriteriaFingerprint === criteria && record.goalFingerprint === fingerprintGoalForPositiveEvidence(goal, 'curricularAtomic') && record.reviewInputFingerprint === fingerprintPositiveGoalEvidenceReviewInput(goal, criteria, resources, 'curricularAtomic') && record.profileFingerprint === fingerprintPositiveGoalEvidenceProfile(record.profile), 'Wrong native fingerprints')
  assert(validatePositiveGoalEvidenceRecordSemantics(record, goal, resources, 'curricularAtomic').length === 0, 'Native profile semantics failed')
  assert(validatePositiveGoalEvidenceRecordSemantics(record, finalGoal, resources, 'curricularAtomic').length === 0, 'Profile changed against metadata-clean integration candidate')
  const originalRow = snapshot.rows.find((r: any) => r.goalId === record.goalId)
  assert(JSON.stringify(exactInput.currentSourceCaseBodies) === JSON.stringify(originalRow.cases), 'Full original case payload changed')
  const caseIDs = originalRow.cases.map((r: any) => r.caseBody.caseId ?? r.caseBody.caseKey)
  assert(JSON.stringify(record.profile.applicationCaseBriefs.map((r: any) => r.id)) === JSON.stringify(caseIDs), 'Wrong complete case UUID assignments')
  for (const original of originalRow.cases) caseRows.push({ goalId: record.goalId, caseId: original.caseBody.caseId ?? original.caseBody.caseKey, JSONPointer: original.JSONPointer, originalCanonicalJSONSHA256: original.caseBodyCanonicalJSONSHA256, fullDEENMaterialPromptSolutionAndConditionsPersonallyReReadForP: true, exactFullPayloadPreserved: true, profileBriefContentComparedWithFullSource: true, verdict: 'KEEP' })
  const ownRecord = { ...record, reviewId: 'biologie-q1-seven-final-native-p-independent-b-v1', reviewedAt: now, reviewer: 'Codex independent Biology native P reviewer B /root/biology_q1_v7_source_science_independent_b; blind to peer P-A', reason: reasons[index], reviewRunIds: [], dissent: [] }
  assert(validate(ownRecord), 'Invalid own closed native P record')
  assert(validatePositiveGoalEvidenceRecordSemantics(ownRecord, goal, resources, 'curricularAtomic').length === 0, 'Invalid own native P semantics')
  ownRecords.push(ownRecord)
  nativeRows.push({ goalId: record.goalId, goalFingerprint: record.goalFingerprint, reviewInputFingerprint: record.reviewInputFingerprint, profileFingerprint: record.profileFingerprint, profileUnchangedVsAuthor: true, originalRaster: exactInput.actualSelectedAsset.path, originalRasterSHA256: resources[link.url], closedNativeSchema: 'PASS', exactNativeSemanticsWithOriginalRaster: 'PASS', sameNativeSemanticsAgainstMetadataCleanFinalCandidate: 'PASS', expectationIDs: record.profile.expectations.map((r: any) => r.id), caseIDs, allFullExpectationsAxesBriefsPersonallyRead: true, positiveContentPerformanceTransferVerdict: 'KEEP', DEENEquivalent: true, scientificReason: reasons[index], candidateStatusRetained: true, substantiveRevisionsRequired: false })
}
assert(caseRows.length === 16, 'Wrong complete case count')
const ownReviewPath = own + '/positive-evidence.seven.independent-b.review.jsonl'
writeFileSync(resolve(ownReviewPath), ownRecords.map(r => JSON.stringify(r)).join('\n') + '\n')
const ownConfig = { ...config, reviewId: 'biologie-q1-seven-final-native-p-independent-b-v1', reviewPath: ownReviewPath, scope: { ...config.scope, label: 'Seven independent B P-v2 AI candidates; active asset integration and strict intersection remain separate' } }
assert(ownConfig.requireApproved === config.requireApproved && ownConfig.requireApproved === false, 'Approval gate changed')
assert(validateConfig(ownConfig), 'Invalid own native configuration')
write('positive-evidence.seven.independent-b.config.json', ownConfig)
const checked = reviewPositiveGoalEvidenceConfig(own + '/positive-evidence.seven.independent-b.config.json')
assert(checked.records.length === 7 && checked.counts.needsHumanReview === 7 && checked.counts.approved === 0, 'Wrong truthful native counts')
const expectedHoldsOnly = checked.errors.every(e => e.includes('goal-visualization asset is missing at') || e.includes('stale reviewInputFingerprint; expected'))
write('seven-native-positive-profiles.independent-b.review.json', { schemaVersion: 1, createdAtUTC: now, role: 'actual independent B scientific P review; personally read full seven profiles and sixteen complete bilingual materials', authorFreezeSHA256: sha(bytes(freezePath)), rows: nativeRows, fullCaseRows: caseRows, decisions: { keep: 7, revise: 0, block: 0 }, genuineFullCaseCount: 16, peerPAResultsRead: false, unchangedNativeFullChecker: { status: checked.errors.length ? 'HOLD_ACTIVE_IMAGE_BINDINGS' : 'PASS', errors: checked.errors, counts: checked.counts, expectedMissingActiveImageConsequencesOnly: expectedHoldsOnly }, allActualInputs: [...actualInputs.values()], humanApproval: false, humanTrial: false, learnerEvidence: false, activeWrites: false, strictNetGain: 0, nativePScientificBReviewComplete: true, nativePFullActiveBindingGateComplete: checked.errors.length === 0, wholeSourceClearance: false, imagesRegenerated: false })
assert(expectedHoldsOnly, 'Unexpected full native gate issue; inspect output without changing gates')
console.log('Independent P-B: 7 substantive KEEP / native closed schema and exact actual-PNG semantics PASS7 / sixteen full cases read; full native checker retains active-image binding holds.')
