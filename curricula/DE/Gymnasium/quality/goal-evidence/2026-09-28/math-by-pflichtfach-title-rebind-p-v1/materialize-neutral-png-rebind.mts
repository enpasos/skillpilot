import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const packagePath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-by-pflichtfach-title-rebind-p-v1'
const sourcePath = `${packagePath}/current-text-three.candidates.json`
const sourceSha256 = '8ce857056d62367f669855a6a36dd42cf565a680bc353dcc99b29ffd7d3394df'
const targetPath = `${packagePath}/current-text-three-neutral-png.candidates.json`
const configPath = `${packagePath}/current-text-three-neutral-png.config.json`
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')

const sourceBytes = readFileSync(resolve(root, sourcePath))
if (sha256(sourceBytes) !== sourceSha256) throw new Error(`Historical three-goal P candidates changed: ${sourcePath}`)
const previous = JSON.parse(sourceBytes.toString('utf8'))
const expectedIds = [
  '0b162cb0-8507-5ac2-b9d6-57f40f4d3f35',
  '71fe4a39-38e8-5c6a-8eef-ff4783fe70c2',
  '49f9059a-876c-5051-8146-d008b5cc691c',
]
const config = JSON.parse(readFileSync(resolve(root, configPath), 'utf8'))
if (JSON.stringify(previous.goals.map((goal: { goalId: string }) => goal.goalId)) !== JSON.stringify(expectedIds)
    || JSON.stringify(config.scope.goalIds) !== JSON.stringify(expectedIds)) {
  throw new Error('Current three-goal P scope differs from pinned predecessor or config')
}

const goals = structuredClone(previous.goals)
goals[1].reason = 'Nach Wechsel auf das kursneutrale PNG und dessen aktuelle Metadaten neu geprüft: Das Bild zeigt einen Besuchergraphen nur schematisch und liefert weder Term noch Zahlen des P-Falls. Der P-Fall fordert stattdessen die eigenständige Prüfung des Flugmodells h(t)=20t−5t² (Maximum 20 m bei t=2, Flugende t=4, h(5)=−25 m als unzulässige Extrapolation). Der zweite Tankkapazitätsfall bleibt ein anderer, unabhängiger Kontext. Der frühere bildgleiche Besucher-Prüfungsfall ist nicht wiederhergestellt. Textgebundener aktueller AI-Kandidat; keine menschliche Freigabe.'
goals[2].reason = 'Nach Wechsel auf das kursneutrale PNG und dessen aktuelle Metadaten neu geprüft: Die Grafik zeigt qualitativ e^x gegenüber x² und nennt e^x/x²→∞, liefert aber keinen Abschätzungsbeweis. P verlangt selbstständig aus e^x≥x³/6 den Quotienten x²/e^x≤6/x→0 und im unabhängigen Fall x→−∞ mit t=−x die Schranke |x³e^x|≤24/t samt negativem Vorzeichen. Beide Argumente bleiben mathematisch richtig und aus dem Bild nicht ablesbar. Textgebundener aktueller AI-Kandidat; keine menschliche Freigabe.'
const candidateSet = {
  ...previous,
  reviewId: config.reviewId,
  reviewedAt: '2026-09-28T01:01:54Z',
  reviewer: 'OpenAI Codex current-PNG and goal review; AI candidate only',
  goals,
}
const expectedBytes = `${JSON.stringify(candidateSet, null, 2)}\n`
const target = resolve(root, targetPath)
if (process.argv[2] === '--write' && process.argv.length === 3) {
  writeFileSync(target, expectedBytes, { flag: 'wx' })
  console.log(`Wrote ${targetPath}: three current PNG-context AI candidates`)
} else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale current PNG-context candidates: ${targetPath}`)
  console.log(`Verified ${targetPath}: three current PNG-context AI candidates`)
} else {
  throw new Error('Usage: tsx materialize-neutral-png-rebind.mts [--write]')
}
