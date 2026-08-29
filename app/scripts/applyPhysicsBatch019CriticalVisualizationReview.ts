import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

type JsonRecord = Record<string, unknown>

const repoRoot = resolve(import.meta.dirname, '../..')
const writeMode = process.argv.includes('--write')
const reviewedAt = '2026-08-28T14:32:43Z'
const reviewer = 'codex-physics-batch019-critical-nbp-review-2026-08-28'
const ledgerPath = resolve(
  repoRoot,
  'curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json',
)

const reviews = [
  {
    goalId: '7fe6f8a1-5580-4e37-bf8e-9772964a6b0a',
    sha256: 'sha256:0d642d4cec5c2c37dbfbcec4545716359263a4da3eeac96f07096636c13b462b',
    notes: 'Hashgebundene Originalauflösungsprüfung nach Nano-Banana-Pro-Korrektur: Kreis-, Gerad- und offene Schraubenbahn sind getrennt und ohne widersprüchlichen Kraft- oder lokalen Bahnpfeil dargestellt. Das separate Vektor-Inset zerlegt v mit gemeinsamem Anfangspunkt korrekt in v_parallel und v_senkrecht; auch die sichtbare Gleichung ist eine echte Vektorgleichung.',
  },
  {
    goalId: 'eb1ea150-ec6c-5000-bce3-f46c820dccf8',
    sha256: 'sha256:dc74c6f10abfa4bff8f83f1e5e6bf401c26798cbb9b5067616bbb196e515f406',
    notes: 'Hashgebundene Originalauflösungsprüfung nach Nano-Banana-Pro-Korrektur: U_ind = −N · ΔΦ/Δt enthält den Windungsfaktor. In der ausdrücklich vom Magneten aus gesehenen Stirnansicht fließt der Induktionsstrom gegen den Uhrzeigersinn; dadurch ist die zugewandte Spulenseite ein Nordpol und stößt den sich nähernden Nordpol konsistent ab.',
  },
  {
    goalId: 'a1389d4e-dc97-5557-babe-a31a2bd57217',
    sha256: 'sha256:afba99c847d0ba7af902e019a712256ac908a84a36bb5da675e446ebf9723054',
    notes: 'Hashgebundene Originalauflösungsprüfung nach Nano-Banana-Pro-Korrektur: Beide Schaltbilder sind eindeutig geschlossen. Der Strom tritt in beiden Panels am gleichen oberen Anschluss der gleich orientierten Spule ein; das Magnetfeld zeigt jeweils nach unten und wird beim Entladen nur schwächer. Die Lampe leuchtet bei der Energieabgabe, und W_mag = ½ · L · I² ist korrekt.',
  },
  {
    goalId: 'd18d4190-ddc1-5181-b1b6-e79947b737c2',
    sha256: 'sha256:42ae30f63a9d1f48b08dc77f1cd052fe542225cd3b2a3c0e8527aadc183531a6',
    notes: 'Hashgebundene Originalauflösungsprüfung nach Nano-Banana-Pro-Korrektur: U_ind(t) = −N · dΦ(t)/dt ist vollständig. Die an 0, T/4, T/2, 3T/4 und T ausgerichteten Diagramme zeigen Φ als Cosinus und U_ind als korrekt vorzeichenbehaftete Sinus-Ableitung mit der erforderlichen Viertelperiodenverschiebung.',
  },
] as const

const hashFile = (path: string): string =>
  `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`

const originalBytes = readFileSync(ledgerPath, 'utf8')
const ledger = JSON.parse(originalBytes) as { records?: JsonRecord[] }
if (!Array.isArray(ledger.records)) throw new Error('physik: missing QA records')

for (const review of reviews) {
  const record = ledger.records.find(candidate => candidate.goalId === review.goalId)
  if (!record) throw new Error(`${review.goalId}: missing QA record`)
  if (record.visualizationState !== 'available') {
    throw new Error(`${review.goalId}: visualization is not available`)
  }
  const canonicalPath = resolve(repoRoot, String(record.canonicalAssetPath))
  const publicPath = resolve(repoRoot, String(record.publicAssetPath))
  const backendPath = resolve(
    repoRoot,
    String(record.publicAssetPath).replace(
      /^app\/public\//u,
      'backend/src/main/resources/static/',
    ),
  )
  const canonicalHash = hashFile(canonicalPath)
  const publicHash = hashFile(publicPath)
  const backendHash = hashFile(backendPath)
  if (
    canonicalHash !== review.sha256
    || publicHash !== review.sha256
    || backendHash !== review.sha256
    || record.assetSha256 !== review.sha256
  ) {
    throw new Error(
      `${review.goalId}: hash mismatch expected=${review.sha256} canonical=${canonicalHash} public=${publicHash} backend=${backendHash} ledger=${String(record.assetSha256)}`,
    )
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

const expected = `${JSON.stringify(ledger, null, 2)}\n`
if (writeMode) writeFileSync(ledgerPath, expected)
else if (originalBytes !== expected) throw new Error('physik: QA ledger drift')

console.log(
  `CHECK physics_batch019_critical_visualization_review ${writeMode ? 'WRITE' : 'PASS'} records=${reviews.length}`,
)
