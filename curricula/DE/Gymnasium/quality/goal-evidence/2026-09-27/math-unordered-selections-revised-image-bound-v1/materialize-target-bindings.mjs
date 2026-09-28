#!/usr/bin/env node
// Preserve nine unaffected P-v2 records verbatim and reuse only a re-inspected
// one-goal profile. Historical ten-goal artifacts remain immutable.
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const packageBase = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-27/math-unordered-selections-revised-image-bound-v1'
const oldBase = 'curricula/DE/Gymnasium/quality/goal-visualization-review/m7-ten-independent-png-20260927-v1'
const goalId = '70efdec0-110c-5564-849b-bc05cfff0f6a'
const sha = (value) => createHash('sha256').update(value).digest('hex')
const readPinned = (path, expected) => {
  const bytes = readFileSync(resolve(root, path))
  if (sha(bytes) !== expected) throw new Error(`Historical source changed: ${path}`)
  return bytes
}
const emit = (path, bytes) => {
  const target = resolve(root, path)
  if (process.argv[2] === '--write') writeFileSync(target, bytes, { flag: 'wx' })
  else if (process.argv.length === 2) {
    if (readFileSync(target, 'utf8') !== bytes) throw new Error(`Stale generated file: ${path}`)
  } else throw new Error('Usage: node materialize-target-bindings.mjs [--write]')
  console.log(`${process.argv[2] === '--write' ? 'Wrote' : 'Verified'} ${path}`)
}

const oldReviewBytes = readPinned(
  `${oldBase}/positive-current-ten.review.jsonl`,
  '1e74cff5b3f366f01b913ec9e233d6ec6e9f14edfbff10bb4db3514d79308f84',
)
const oldLines = oldReviewBytes.toString('utf8').trimEnd().split('\n')
if (oldLines.length !== 10) throw new Error('Expected exactly ten historical P-v2 records')
const retained = oldLines.filter((line) => JSON.parse(line).goalId !== goalId)
if (retained.length !== 9) throw new Error('Expected exactly nine retained P-v2 records')
const retainedConfig = JSON.parse(readFileSync(resolve(root, `${packageBase}/retained-nine.config.json`), 'utf8'))
if (retained.map((line) => JSON.parse(line).goalId).join('|') !== retainedConfig.scope.goalIds.join('|')) {
  throw new Error('Retained scope does not match historical order')
}
emit(`${packageBase}/retained-nine.review.jsonl`, `${retained.join('\n')}\n`)

const oldCandidates = JSON.parse(readPinned(
  `${oldBase}/positive-current-ten.candidates.json`,
  'b67250886358639e0b02ca4122689e37397512606949cf8c44c191b84f748c6c',
).toString('utf8'))
const oldCandidate = oldCandidates.goals.filter((entry) => entry.goalId === goalId)
if (oldCandidate.length !== 1) throw new Error('Expected exactly one historical candidate')

const config = JSON.parse(readFileSync(resolve(root, `${packageBase}/positive-evidence.config.json`), 'utf8'))
const canonical = JSON.parse(readFileSync(resolve(root, config.landscapePath), 'utf8')).goals.find(({ id }) => id === goalId)
const description = 'Die lernende Person kann die Anzahl ungeordneter Auswahlen ohne Zurücklegen mit Fakultäten bestimmen, begründen, warum verschiedene Reihenfolgen nur einmal zählen, und das Ergebnis an kleinen Beispielen prüfen, ohne den Binomialkoeffizienten bereits zu benennen.'
const descriptionEn = 'The learner can determine the number of unordered selections without replacement using factorials, explain why different orders count only once, and check the result in small examples without yet naming the binomial coefficient.'
const altText = 'Vier verschiedenfarbige Plättchen A, B, C und D ergeben sechs ungeordnete Paare AB, AC, AD, BC, BD und CD; 4! geteilt durch das Produkt aus 2! und 2! ergibt 6.'
if (!canonical || canonical.description !== description || canonical.descriptionEn !== descriptionEn) {
  throw new Error('Canonical DE/EN goal text changed; re-review target')
}
const imageLink = canonical.resourceLinks?.filter(({ type, role }) => type === 'goal-visualization' && role === 'primary')
if (imageLink?.length !== 1 || imageLink[0].altText !== altText ||
    imageLink[0].url !== `/assets/goal-visualizations/mathematik/${goalId}/${goalId}.png`) {
  throw new Error('Current primary image or alt text changed; re-review target')
}
const imagePath = `curricula/DE/Gymnasium/visualizations/mathematik/${goalId}/${goalId}.png`
if (sha(readFileSync(resolve(root, imagePath))) !== '2d19a513c73095f3d3e849352cfb8a155354865b6d611ba3552b9d63d0ab659c') {
  throw new Error('Target PNG changed; re-review target')
}
const candidate = structuredClone(oldCandidate[0])
candidate.reason = 'Die revidierte DE/EN-Zielfassung, der präzisierte Alttext und das unveränderte PNG sha256:2d19a513c73095f3d3e849352cfb8a155354865b6d611ba3552b9d63d0ab659c wurden erneut zusammen geprüft (Original und 360 px). Das Bild zeigt genau sechs ungeordnete Zweierauswahlen aus vier unterscheidbaren Plättchen, AB=BA und den korrekt geklammerten Quotienten 4!/(2!·2!)=6. Das bestehende P-v2-Profil verlangt dieselbe Anzahl-, Mehrfachzählungs- und Beispielprüfungs-Kompetenz; seine zwei unabhängigen Transferfälle 5 aus 2 =10 und 6 aus 3 =20 bleiben mathematisch korrekt. Bild und Beispiele ersetzen keine allgemeine Begründung. E1/G1, nur KI-Kandidat; keine menschliche oder lernpraktische Freigabe.'
const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: config.reviewId,
  reviewedAt: '2026-09-27T11:29:16Z',
  reviewer: 'Codex target-only current wording and original/360px PNG reinspection; AI candidate only',
  goals: [candidate],
}
emit(`${packageBase}/positive-evidence.candidates.json`, `${JSON.stringify(candidateSet, null, 2)}\n`)
