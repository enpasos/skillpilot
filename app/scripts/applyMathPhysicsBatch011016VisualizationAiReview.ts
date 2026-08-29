import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-27T20:06:16Z'
const reviewer = 'codex-deep-understanding-batch-011-016-visual-review-2026-08-27'

const reviews = [
  {
    subject: 'mathematik',
    goalId: '9d497a0c-f48d-4a90-8ec8-aeb89ca6d0c5',
    sha256: 'sha256:0c7b180377e99a4eadd2d9cc98d94c78ad2b43b4d4c6dc78d04c00e74ae03a76',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Prisma und Pyramide zeigen jeweils Grundflächeninhalt und senkrechte Höhe; V = G · h ergibt 140 cm³ und V = ⅓ · G · h ergibt 108 cm³. Körperart, Faktor und Volumeneinheiten sind konsistent.',
  },
  {
    subject: 'mathematik',
    goalId: '7b860649-373e-5523-9843-ec96b3537f1f',
    sha256: 'sha256:ecb927454d43765513c9aa95de5a94cf59b755e1e71ee5afbc3d55e3d55bc4cc',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Beim geraden Kreiskegel sind Radius und senkrechte Höhe eindeutig markiert; G = 16π cm² und V = ⅓ · 16π · 9 = 48π cm³ ≈ 150,8 cm³ stimmen. Eine Mantellinie wird nicht fälschlich als Höhe verwendet.',
  },
  {
    subject: 'mathematik',
    goalId: 'bfc2bf06-9b37-4912-a8eb-25fb5d489d72',
    sha256: 'sha256:9b6e6d0ec738583caa384b5f1e575d0487bc9f6148c495e263a0f2065c23d6ec',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Das Bild zeigt mit f(x)=1/x² auf [1,∞) einen fachlich korrekten nichtnegativen Modellfall, formuliert das uneigentliche Integral als Grenzwert und erhält den endlichen Flächeninhalt 1. Es behauptet keine vorzeichenbedingte Auslöschung.',
  },
  {
    subject: 'mathematik',
    goalId: '57b11e9a-4acf-5ebe-b2b6-c9f99d2b5bb5',
    sha256: 'sha256:1c3703ef85f1c90f4a7dc0a6f1b1691cfc4a040d4cae96918546620150556510',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der orientierungsfesten Korrektur: Das Bild verwendet sin(α)=|v·n|/(|v||n|), zeigt Richtungs- und Normalenvektor sowie die Ergänzungswinkelbeziehung und prüft die Grenzfälle parallel (0°) und senkrecht (90°). Der Betrag verhindert eine Vorzeichenabhängigkeit.',
  },
  {
    subject: 'mathematik',
    goalId: '9bf67cce-4c8f-5497-8e64-825b83c6aa40',
    sha256: 'sha256:4e7ae02d6e85d15efdfb0eb727ece2e86a263e2538a2a0fb7198a35123b42a1a',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Die quadratische 2×2-Matrix verwendet auf beiden Achsen denselben Zustandsraum aus „Müde“ und „Wach“; die Zeilenkonvention ist ausdrücklich benannt. Alle Einträge sind nichtnegativ und jede zum Ausgangszustand gehörende Zeile summiert sich zu 1.',
  },
  {
    subject: 'mathematik',
    goalId: '8dc2c87a-cfc6-5f15-89e5-634107f5c9c7',
    sha256: 'sha256:df3c110787b1e0fb65fabfbf2b473eee2405229adef82ad179b711e09c42e757',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Die Bilder der geordneten Standardbasisvektoren e₁ und e₂ werden in derselben Reihenfolge zu den Spalten der Matrix; die Kontrollrechnung A·(4,2)ᵀ=(6,10)ᵀ ist korrekt.',
  },
  {
    subject: 'mathematik',
    goalId: 'e8d810de-95ed-52d6-ab1f-0560398e35c0',
    sha256: 'sha256:4e482b3b9e301b84c5538c36b1ba438d35f5119efdbc2874e1be7cfe80f9b77b',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Fünf unterscheidbare Elemente und eine ungeordnete Auswahl von zwei ohne Zurücklegen werden korrekt durch „5 über 2“ abgekürzt; Formel und Ergebnis 10 stimmen.',
  },
  {
    subject: 'physik',
    goalId: '48e3d6c2-00bf-5afd-8846-ba3dbd01e96d',
    sha256: 'sha256:0d2326744840b5fc96d76fdfb8be696fab21e18201ef6140d66589993aff4011',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Elektron und Positron annihilieren zentral; zwei nahezu entgegengesetzte Photonen mit je 511 keV treffen den Detektorring. Das Bild zeigt sie als PET-Messsignal und behauptet weder eine klassische Teilchenbahn noch die Paarvernichtung als Energiequelle.',
  },
  {
    subject: 'physik',
    goalId: '709e688c-eb07-5f83-a506-82c9bfe0d89f',
    sha256: 'sha256:27f224d6543f93d574ae752a328d2bc9c83e23e3766ebabbfd28e457d8ed1498',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Das Rayleigh-Kriterium θmin=1,22λ/D ist für eine kreisförmige Öffnung korrekt angegeben; kleinere Wellenlänge und größere wirksame Öffnung werden richtig mit besserem Auflösungsvermögen verknüpft.',
  },
  {
    subject: 'physik',
    goalId: '0693f68f-1bd4-50a9-ba2b-af95b1c949ee',
    sha256: 'sha256:6adb3b6db7bcf72832e7f8f134be00b11e91459bcb6586c4e2a31dbd4c55382e',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Ein gültiger Fall normaler Dispersion zeigt n_violett > n_rot, die spektral unterschiedliche Brechung am Prisma und v_phase=c/n. Eine Aussage zur Gruppengeschwindigkeit wird nicht eingeschmuggelt.',
  },
  {
    subject: 'physik',
    goalId: 'e359f8bb-6106-44aa-9edf-694528d2d2a9',
    sha256: 'sha256:1d02441874144d344bb78a19ea986c4d9b96f5b44fa017e6c0ad458bccf0938d',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Die Tafel leitet aus Newton II über das Skalarprodukt mit v und F_cons=−dE_pot/dx die verschwindende Zeitableitung von E_kin+E_pot her. Konstante Masse, Inertialsystem und ausschließlich konservative Kräfte sind sichtbar als Voraussetzungen genannt.',
  },
  {
    subject: 'physik',
    goalId: '5492f0e0-cbae-574e-a853-182616205ed3',
    sha256: 'sha256:99d1a8093eb634f37436c965c4d78f5300bf69f0cd1bc38e558dace151934cb6',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Die Kernreaktion ist als Vorher-Nachher-Bilanz dargestellt; Q=(m_vor−m_nach)c² und der gezeigte exoenergetische Fall m_vor>m_nach, Q>0 sind korrekt. Das Bild behauptet keine universelle Positivität des Q-Werts.',
  },
  {
    subject: 'physik',
    goalId: '52bdabb2-d9a1-56e6-bccf-ff58f299c739',
    sha256: 'sha256:35396a55fd330239aea9485b1eb075590b7fc0defcc118b84e7527fb099d31ca',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der Beschreibungspräzisierung: Das MRT-Übersichtsbild verbindet statisches B₀-Feld, resonanten HF-Impuls, gemessenes Signal und resultierenden Bildschnitt in richtiger qualitativer Reihenfolge. Es widerspricht weder Relaxation noch Gradientencodierung und behauptet keine ionisierende Strahlung.',
  },
  {
    subject: 'physik',
    goalId: '88d07c80-5d7d-5c70-b385-b22769381e44',
    sha256: 'sha256:4e5db5780d556f0f87297f9c253674b46ed3f0d754a2d4c6c432d4a973b09100',
    notes: 'Hashgebundene Sichtprüfung in Originalauflösung nach der begrifflichen Präzisierung: Q ist eindeutig als zugeführte Wärme beziehungsweise Energieübertragung gezeichnet, U als im System gespeicherte innere Energie mit mikroskopischen Bewegungs- und Wechselwirkungsanteilen. Temperatur wird nicht mit U gleichgesetzt.',
  },
] as const

const hashFile = (path: string): string =>
  `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`

const ledgers = new Map<string, JsonRecord>()
const originalBytes = new Map<string, string>()

for (const review of reviews) {
  const ledgerPath = resolve(repoRoot, `curricula/DE/Gymnasium/quality/goal-visualization-qa/${review.subject}.qa.json`)
  const bytes = readFileSync(ledgerPath, 'utf8')
  const ledger = ledgers.get(review.subject) ?? JSON.parse(bytes) as JsonRecord
  if (!originalBytes.has(review.subject)) originalBytes.set(review.subject, bytes)
  ledgers.set(review.subject, ledger)
  if (!Array.isArray(ledger.records)) throw new Error(`${review.subject}: missing QA records`)
  const record = ledger.records.find((candidate: JsonRecord) => candidate.goalId === review.goalId)
  if (!record) throw new Error(`${review.goalId}: missing QA record`)
  if (record.visualizationState !== 'available') throw new Error(`${review.goalId}: visualization is not available`)
  const canonicalHash = hashFile(resolve(repoRoot, record.canonicalAssetPath))
  const publicHash = hashFile(resolve(repoRoot, record.publicAssetPath))
  if (canonicalHash !== review.sha256 || publicHash !== review.sha256 || record.assetSha256 !== review.sha256) {
    throw new Error(`${review.goalId}: hash mismatch expected=${review.sha256} canonical=${canonicalHash} public=${publicHash} ledger=${record.assetSha256}`)
  }
  Object.assign(record, {
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    chatGptReviewedAt: reviewedAt,
    chatGptReviewer: reviewer,
    chatGptNotes: review.notes,
    aiApproved: 'yes',
    aiApprovedAssetSha256: review.sha256,
    aiReviewedAt: reviewedAt,
    aiReviewer: reviewer,
    aiNotes: review.notes,
  })
}

for (const [subject, ledger] of ledgers) {
  const ledgerPath = resolve(repoRoot, `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`)
  const expected = `${JSON.stringify(ledger, null, 2)}\n`
  if (writeMode) writeFileSync(ledgerPath, expected)
  else if (originalBytes.get(subject) !== expected) throw new Error(`${subject}: QA ledger drift`)
}

console.log(`CHECK math_physics_batch_011_016_visual_ai_review ${writeMode ? 'WRITE' : 'PASS'} records=${reviews.length}`)
