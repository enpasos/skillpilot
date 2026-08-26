import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type JsonRecord = Record<string, unknown>

interface VisualizationQaRecord extends JsonRecord {
  goalId: string
  visualizationState: string
  canonicalAssetPath: string
  publicAssetPath: string
  assetSha256: string
}

function isJsonRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isVisualizationQaRecord(value: unknown): value is VisualizationQaRecord {
  if (!isJsonRecord(value)) return false
  return typeof value.goalId === 'string'
    && typeof value.visualizationState === 'string'
    && typeof value.canonicalAssetPath === 'string'
    && typeof value.publicAssetPath === 'string'
    && typeof value.assetSha256 === 'string'
}

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-26T07:20:00Z'
const reviewer = 'codex-deep-understanding-current-wave-visual-synthesis-2026-08-26'

const reviews = [
  {
    subject: 'mathematik',
    goalId: 'd658e26a-e351-4bca-824e-f346deaa87c5',
    sha256: 'sha256:4b3635ca63f81f9d570c194b425656abe5eea955ac1081a32f7b586e3d4c3f80',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: 3⁴ wird korrekt als 3 · 3 · 3 · 3 und als 81 dargestellt; Basis 3 und Exponent 4 sind eindeutig markiert, ohne die Potenz mit einer einfachen Multiplikation zu verwechseln.',
  },
  {
    subject: 'mathematik',
    goalId: 'e331a425-e9c6-46eb-89cb-dedf72857974',
    sha256: 'sha256:2c1036ce43585576b855bc5a647acc85518707790852281a3469a05322ba3ea7',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: 10¹, 10², 10³ und 10⁶ sind mit korrekten Dezimalwerten und Nullenzahlen dargestellt; der Exponent ist sichtbar mit der Stellenwertstruktur verknüpft.',
  },
  {
    subject: 'mathematik',
    goalId: '25593605-5e13-55cc-9a05-8f3d737e15e9',
    sha256: 'sha256:daaa45f9c17a02126390863e3a459e98a4e29f7de7fcb03ef1bb8317f501045c',
    notes:
      'Nach dem vom Product Owner gemeldeten Knick der ersetzten generativen Fassung: Hashgebundene KI-Sicht- und Geometrieprüfung in Originalauflösung. Das quadratische Gitter stellt P(−3|2) und Q(4|−1) korrekt dar. Strecke und Gerade folgen dem Richtungsvektor (7|−3). Die unbegrenzte Gerade ist ein einziges gerades SVG-line-Element; P, Q und beide Pfeile sind ohne Knick kollinear.',
  },
  {
    subject: 'physik',
    goalId: 'f827b00f-af7f-52de-84aa-2a2bbaa035bd',
    sha256: 'sha256:f30eb39c6cf3402bf31a601ad38bba04f0e1d3b43737eb8fcd8daca1049d4497',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Der Quader zeigt konsistent ein 4×3×2-Raster mit 24 Einheitswürfeln; die Kantenmaße 4 cm, 3 cm und 2 cm sowie V = 24 cm³ stimmen geometrisch und rechnerisch überein.',
  },
  {
    subject: 'physik',
    goalId: 'f92b5b8a-327f-50d2-8313-6a142399ebf0',
    sha256: 'sha256:4465879e0305e0aa15858217b1193d0687ff56806582fe020c7f9fe8c6026a87',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Der vollständig eingetauchte unregelmäßige Körper hebt den Wasserstand von 50 mL auf 68 mL; die Differenz 18 mL = 18 cm³ ist korrekt und es wird weder Überlaufen noch eine Luftblase suggeriert.',
  },
  {
    subject: 'physik',
    goalId: '3c8e5510-a12d-5770-8a01-e5fe741b259c',
    sha256: 'sha256:42a33be25096f4e56b5b006dc5bf6a6894957ac850e0d3779f098a29e941f6cd',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Einfalls- und Reflexionswinkel sind beidseits zum senkrechten Lot gemessen, die Strahlenpfeile zeigen korrekt zum beziehungsweise vom Spiegelpunkt und α = β ist geometrisch konsistent.',
  },
  {
    subject: 'physik',
    goalId: 'b57427c9-1af5-5daa-8c65-b84a4cc20785',
    sha256: 'sha256:a8035373a3fcd012ba39c03b771f45be085fca2301918a00fee4fdc6827d91eb',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: Das virtuelle, aufrechte und gleich große Spiegelbild liegt im gleichen Abstand hinter dem ebenen Spiegel; nur gestrichelte Rückverlängerungen laufen hinter den Spiegel, die realen reflektierten Strahlen zum Auge bleiben davor.',
  },
  {
    subject: 'physik',
    goalId: '33e3417c-e062-5f4a-8df9-3195dca50089',
    sha256: 'sha256:5350992b4cd8ca651203ed142c0cb20267c5b0d0619e0c292e26800d6d1dfac6',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung: An allen acht Mondpositionen ist die sonnenzugewandte Hälfte beleuchtet; die Beobachteransichten zeigen für die Nordhalbkugel Neumond, rechtes erstes Viertel, Vollmond und linkes letztes Viertel in korrekter Reihenfolge, ohne Erdschatten als Ursache.',
  },
  {
    subject: 'physik',
    goalId: 'f0046ae8-cbfc-526b-8414-04e3595b6075',
    sha256: 'sha256:c31d5ad3e4917a20fc4eb95bdf3a272d331a9d886ade58ce53e9406984b92c4c',
    notes:
      'Hashgebundene KI-Sicht- und Geometrieprüfung in Originalauflösung: Alle acht Randstrahlen sind gerade SVG-Linien. Oben sind alle vier gemeinsame Tangenten an Sonne und Mond; unten sind alle vier gemeinsame Tangenten an Sonne und Erde, während der Mond berührungsfrei im Erdschatten liegt. Der rechnerisch geprüfte maximale Tangentialfehler durch gerundete SVG-Koordinaten liegt unter 0,0005 px; Kern- und Halbschatten sind den begrenzenden Geraden konsistent zugeordnet.',
  },
  {
    subject: 'physik',
    goalId: 'c5413852-abae-566b-b435-f9939209ca63',
    sha256: 'sha256:d6842a4afa320607e4aca188956725595f3cb12b4cb62c4b83f5d1c9bac877d9',
    reviewedAt: '2026-08-26T15:41:49Z',
    notes:
      'Nach den fachlichen Hinweisen des Product Owners hashgebunden in Originalauflösung geprüft: Drei opake Barrierensegmente lassen genau zwei getrennte, gleich breite Spalte frei. Die Quelle liegt vertikal exakt mittig zwischen beiden Spaltzentren. Drei kumulative Nachweisbilder folgen zeitlich von links nach rechts; die senkrechte Richtung bleibt die Ortsachse der variierenden Schwärzung. Zentrales Hauptmaximum und größter Wahrscheinlichkeits-Peak liegen gemeinsam bei y=512,5. Alle Nachweise bleiben lokalisierte Punkte; eine klassische Photonenbahn wird weder gezeichnet noch behauptet.',
  },
  {
    subject: 'physik',
    goalId: 'a4681378-ade4-4f20-bf77-fb020469510f',
    sha256: 'sha256:92fa897740a8303aec87e5f3163931e3f2883db166cfc7ba83282e462ce0101e',
    reviewedAt: '2026-08-26T13:20:00Z',
    notes:
      'Hashgebundene KI-Sichtprüfung in Originalauflösung nach der Normalisierung auf den kanonischen PNG-Dateinamen: Links wird weißes Licht am Prisma räumlich in geordnete Spektralfarben aufgefächert. Rechts bleiben sechs Farbsektoren materiell getrennt, während die schnelle Rotation ausdrücklich nur einen annähernd weißen Farbeindruck im Auge erzeugt. Die Grafik kennzeichnet beide als verschiedene Vorgänge und behauptet weder eine Farberzeugung im Prisma noch eine physische Weißmischung auf dem Rad.',
  },
] as const

const hashFile = (path: string): string =>
  `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`

const ledgers = new Map<string, JsonRecord>()
const originalLedgerBytes = new Map<string, string>()
for (const review of reviews) {
  const reviewTimestamp = 'reviewedAt' in review ? review.reviewedAt : reviewedAt
  const ledgerPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/quality/goal-visualization-qa/${review.subject}.qa.json`,
  )
  const currentBytes = readFileSync(ledgerPath, 'utf8')
  const ledger = ledgers.get(review.subject) ?? JSON.parse(currentBytes) as JsonRecord
  if (!originalLedgerBytes.has(review.subject)) originalLedgerBytes.set(review.subject, currentBytes)
  ledgers.set(review.subject, ledger)
  if (!Array.isArray(ledger.records)) throw new Error(`${review.subject}: QA ledger has no records array`)
  const record = ledger.records.find(
    (candidate) => isVisualizationQaRecord(candidate) && candidate.goalId === review.goalId,
  ) as VisualizationQaRecord | undefined
  if (!record) throw new Error(`Missing QA record ${review.goalId}`)
  if (record.visualizationState !== 'available') {
    throw new Error(`${review.goalId}: visualization is not available`)
  }
  const canonicalPath = resolve(repoRoot, record.canonicalAssetPath)
  const publicPath = resolve(repoRoot, record.publicAssetPath)
  const canonicalHash = hashFile(canonicalPath)
  const publicHash = hashFile(publicPath)
  if (canonicalHash !== review.sha256 || publicHash !== review.sha256 || record.assetSha256 !== review.sha256) {
    throw new Error(
      `${review.goalId}: expected ${review.sha256}, canonical=${canonicalHash}, public=${publicHash}, ledger=${record.assetSha256}`,
    )
  }
  Object.assign(record, {
    umlautsCorrectChatGpt: 'yes',
    contentApprovedChatGpt: 'yes',
    humanApproved: 'no',
    humanIssueIdentified: 'no',
    humanIssueDescription: '',
    chatGptReviewedAt: reviewTimestamp,
    chatGptReviewer: reviewer,
    chatGptNotes: review.notes,
    humanReviewedAt: null,
    humanReviewer: '',
    aiApproved: 'yes',
    aiApprovedAssetSha256: review.sha256,
    aiReviewedAt: reviewTimestamp,
    aiReviewer: reviewer,
    aiNotes: review.notes,
  })

  const promptPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/visualizations/${review.subject}/${review.goalId}/prompt.de.md`,
  )
  const currentPrompt = readFileSync(promptPath, 'utf8')
  const expectedPrompt = currentPrompt
    .replace('- Status: pilot', '- Status: erzeugt und hashgebunden KI-geprüft')
    .replace(
      'Dieses Asset muss vor breitem Rollout gegen die Visualisierungs-Checkliste geprüft werden: mathematische Korrektheit, Alters- und Kontextpassung, Textlesbarkeit, Barrierefreiheit und Lizenz-/Copyright-Risiko.',
      `Das erzeugte Rasterbild wurde in Originalauflösung fachlich und auf Lesbarkeit geprüft. Die KI-Freigabe ist im QA-Ledger an ${review.sha256} gebunden; eine menschliche Freigabe wurde nicht behauptet.`,
    )
  if (writeMode) {
    writeFileSync(promptPath, expectedPrompt, 'utf8')
  } else if (currentPrompt !== expectedPrompt) {
    throw new Error(`${review.goalId}: prompt review metadata is not up to date`)
  }
}

for (const [subject, ledger] of ledgers) {
  const ledgerPath = resolve(
    repoRoot,
    `curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`,
  )
  const expected = `${JSON.stringify(ledger, null, 2)}\n`
  if (writeMode) {
    writeFileSync(ledgerPath, expected)
  } else if (originalLedgerBytes.get(subject) !== expected) {
    throw new Error(`${subject}: QA ledger does not match the bound AI review decisions`)
  }
}

console.log(`CHECK current_wave_visual_ai_review ${writeMode ? 'WRITE' : 'PASS'} records=${reviews.length}`)
