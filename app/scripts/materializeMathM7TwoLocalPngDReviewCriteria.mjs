import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const paths = {
  criteria: 'curricula/DE/Gymnasium/quality/goal-evidence/prompts/mathematik-goal-description-understanding-evidence-review-criteria-v2.md',
  profiles: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-two-local-png-bound-p-20260923-v1/current-two.review.jsonl',
  binding: 'curricula/DE/Gymnasium/quality/goal-evidence/m7-two-local-png-bound-p-20260923-v1/binding-review.json',
  output: 'curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-23/m7-two-local-png-p-bound-current-20260923-v2.criteria.md',
}
const goalIds = [
  'dcda6fdf-108f-5ea1-bce7-6f30d6443517',
  '570d5931-f126-5bb4-8b7f-db236d6b727f',
]
const digest = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const read = (path) => readFile(resolve(repositoryRoot, path))
const fail = (message) => { throw new Error(message) }

const [criteriaBytes, profileBytes, bindingBytes] = await Promise.all([
  read(paths.criteria), read(paths.profiles), read(paths.binding),
])
const records = profileBytes.toString('utf8').trim().split(/\r?\n/u).map((line) => JSON.parse(line))
const binding = JSON.parse(bindingBytes.toString('utf8'))
if (records.length !== goalIds.length || binding.changedGoals.length !== goalIds.length) {
  fail('Expected exactly two current P-v2 records and binding entries')
}
const byGoal = new Map(records.map((record) => [record.goalId, record]))
const bindingByGoal = new Map(binding.changedGoals.map((item) => [item.goalId, item]))
if (byGoal.size !== goalIds.length || bindingByGoal.size !== goalIds.length) {
  fail('Duplicate or missing current P-v2 goal')
}

const context = []
for (const goalId of goalIds) {
  const record = byGoal.get(goalId) ?? fail(`Missing P-v2 record for ${goalId}`)
  const bound = bindingByGoal.get(goalId) ?? fail(`Missing P-v2 binding for ${goalId}`)
  if (
    record.$schema !== 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json'
    || record.profileRuleVersion !== 'positive-understanding-evidence-v2'
    || record.status !== 'needs_human_review'
    || record.reviewAuthority !== 'ai_candidate'
    || record.goalFingerprint !== bound.goalFingerprint
    || record.reviewInputFingerprint !== bound.currentReviewInputFingerprint
    || record.profileFingerprint !== bound.currentProfileFingerprint
  ) fail(`P-v2 record/binding mismatch for ${goalId}`)
  const imagePath = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.png`
  const imageDigest = digest(await read(imagePath))
  if (imageDigest !== bound.imageSha256) fail(`Current PNG digest mismatch for ${goalId}`)
  context.push({
    goalId,
    fullAtlasPageAtPReview: bound.pageNumber,
    fullAtlasPageFingerprintAtPReview: bound.pageFingerprint,
    goalFingerprint: record.goalFingerprint,
    currentReviewInputFingerprint: record.reviewInputFingerprint,
    currentProfileFingerprint: record.profileFingerprint,
    currentPngSha256: imageDigest,
    pReviewStatus: record.status,
    pReviewAuthority: record.reviewAuthority,
    pReviewReason: record.reason,
    profile: record.profile,
  })
}

const output = [
  criteriaBytes.toString('utf8').trimEnd(),
  '',
  '## Aktueller P-v2-Kontext für genau zwei PNG-gebundene Geometrieziele',
  '',
  `- P-v2-Quellpfad: \`${paths.profiles}\``,
  `- Exakter P-v2-Quelldigest: \`${digest(profileBytes)}\``,
  `- Exakter P-v2-Bindungsdigest: \`${digest(bindingBytes)}\``,
  '- Diese beiden P-v2-Profile sind aktuelle KI-Kandidaten, keine menschliche Freigabe und kein Leistungsnachweis eines Lernenden.',
  '- Der native GoalBook-Wert `evidenceProfile: null` beschreibt hier nur dessen V1-Profilfeld. Er bedeutet nicht, dass für diese Ziele kein aktuelles P-v2-Profil existiert.',
  '- Die unten genannten Full-Atlas-Seitenzahlen und Seitenfingerprints stammen aus der P-v2-Prüfung; die eigenständige zweizielige D-Review-Ausgabe nummeriert ihre Seiten neu.',
  '- Prüfe die D-Beschreibung unabhängig. Nutze diesen Profilkontext, um bereits vorhandene positive Evidenz zu beurteilen; Bild und P-v2-Profil ersetzen keine selbständige Leistung.',
  '',
  'Die folgenden beiden JSON-Objekte sind eine verlustfreie Auswahl der aktuellen P-v2-Evidenzfelder und ihrer exakten Fingerprints:',
  '',
  '```json',
  JSON.stringify(context, null, 2),
  '```',
  '',
].join('\n')
const outputPath = resolve(repositoryRoot, paths.output)
if (process.argv[2] === '--write') {
  await writeFile(outputPath, output, { flag: 'wx' })
} else if (process.argv[2] === '--check') {
  const actual = await readFile(outputPath, 'utf8')
  if (actual !== output) fail('Bound D-review criteria differ from current P-v2 source and PNG bytes')
} else {
  fail('Usage: node app/scripts/materializeMathM7TwoLocalPngDReviewCriteria.mjs --write|--check')
}
process.stdout.write(`P-v2-bound D criteria ${process.argv[2]}: ${digest(output)}\n`)
