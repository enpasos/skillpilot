// Rebind three independently reviewed P-v2 profile bodies to current images.
// No substantive profile was diluted and no human authorization is implied.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sources = [
  ['../canonical-math-positive-understanding-evidence-rollout-v1-batch-046-current-keep7-v1.review.jsonl', '7bbcbc98e6e4cd3c2cd8d103cb82a8803088b5d30a4d7810dbaac0d42f71182e'],
  ['../canonical-math-positive-understanding-evidence-rollout-v1-batch-012-j6-volume-current-v1.review.jsonl', 'cbdcb313d17d9d713b1c738f99e56f81f74bdf40d30f04ce9c73eb7857afe868'],
]
const oldRecords = new Map()
for (const [relativePath, expectedDigest] of sources) {
  const bytes = readFileSync(resolve(here, relativePath))
  const actualDigest = createHash('sha256').update(bytes).digest('hex')
  if (actualDigest !== expectedDigest) throw new Error(`Historical P source changed: ${relativePath} ${actualDigest}`)
  for (const line of bytes.toString('utf8').split('\n').filter(Boolean)) {
    const record = JSON.parse(line)
    oldRecords.set(record.goalId, record)
  }
}
const items = [
  {
    id: '8823e26e-694c-581b-9adf-4db7db6f43c9',
    reason: 'DE: Das unveränderte Daten-Profil trennt absolute Trefferzahl, Bezugsgröße und empirische Schätzung; Spinndrad-Fälle mit ungleichen Stichprobengrößen prüfen Transfer unabhängig von der neuen Zehn-Karten-Illustration. Das tatsächlich eingebundene PNG und die aktuelle GoalBook-Seite wurden getrennt fachlich geprüft. EN: The unchanged data profile distinguishes absolute count, reference total and empirical estimate; spinner cases with unequal sample sizes test transfer independently of the new ten-card illustration. The actually bound PNG and current GoalBook page were reviewed separately.',
  },
  {
    id: '7c978529-ce62-5adc-897f-24ea80babbc8',
    reason: 'DE: Das unveränderte Profil leitet Quader- und Würfelvolumen aus Einheitswürfeln und senkrechten Kanten ab und verlangt Einheitenumrechnung sowie Vergleich in drei neuen Fällen. Das neue PNG illustriert 12 bzw. 8 Einheitswürfel, liefert aber keine Lösung für die frischen Aufgaben; die aktuelle GoalBook-Seite ist geprüft. EN: The unchanged profile derives cuboid and cube volume from unit cubes and perpendicular edges and requires unit conversion and comparison in three fresh cases. The new PNG illustrates 12 and 8 unit cubes but supplies no solution to those tasks; the current GoalBook page was reviewed.',
  },
  {
    id: 'e01869db-891c-57a4-8660-789ec6875ec2',
    reason: 'DE: Das unveränderte Profil prüft disjunkte vollständige Zerlegung, Ergänzen/Subtrahieren und zwei selbstständige Lösungswege; das neue 8+4-PNG zeigt nur ein stützendes Beispiel und ersetzt weder Transfer noch Plausibilitätsprüfung. Bild und aktuelle GoalBook-Seite sind gezielt geprüft. EN: The unchanged profile tests disjoint complete decomposition, completion/subtraction and two independent solution paths; the new 8+4 PNG is only one supporting example and replaces neither transfer nor plausibility checks. Image and current GoalBook page were reviewed specifically.',
  },
]
const goals = items.map(({ id, reason }) => {
  const old = oldRecords.get(id)
  if (!old) throw new Error(`Missing original P profile ${id}`)
  if (old.status !== 'needs_human_review' || old.reviewAuthority !== 'ai_candidate' || old.evidenceLevel !== 'E1' || old.maximumClaimScope !== 'G1') {
    throw new Error(`Unexpected original authority or status ${id}`)
  }
  return { goalId: id, reason, evidenceLevel: 'E1', maximumClaimScope: 'G1', dissent: old.dissent, profile: old.profile }
})
writeFileSync(resolve(here, 'positive-evidence.candidates.json'), `${JSON.stringify({
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: 'canonical-math-positive-understanding-evidence-m7-three-new-png-post-import-20260923-v1',
  reviewedAt: '2026-09-23T02:40:00.000Z',
  reviewer: 'codex-math-m7-three-png-targeted-ai-candidate-2026-09-23',
  goals,
}, null, 2)}\n`)
