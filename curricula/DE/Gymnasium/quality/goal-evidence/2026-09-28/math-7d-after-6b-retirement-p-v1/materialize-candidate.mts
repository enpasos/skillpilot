import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../../../../../..')
const sourcePath = 'curricula/DE/Gymnasium/quality/goal-evidence/m7-five-png-two-text-current-20260923-v1/retained/rest-d8f.review.jsonl'
const sourceSha256 = '343216d2a6fee16be39f68bdb81099b926ea30f3224619f18a08a91e3f4f1950'
const targetPath = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-09-28/math-7d-after-6b-retirement-p-v1/positive-evidence.candidates.json'
const goalId = '7d37513b-fa1a-54cc-9e2a-9279a381f0f0'
const sha256 = (value: Buffer | string) => createHash('sha256').update(value).digest('hex')

const sourceBytes = readFileSync(resolve(root, sourcePath))
if (sha256(sourceBytes) !== sourceSha256) throw new Error(`Historical 7d P review bytes changed: ${sourcePath}`)
const source = sourceBytes.toString('utf8').trimEnd().split('\n').map((line) => JSON.parse(line))
const previous = source.filter((record) => record.goalId === goalId)
if (source.length !== 5 || previous.length !== 1) throw new Error('Expected one 7d P record in the historical five-goal review')
const record = previous[0]
if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate'
    || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') {
  throw new Error('Historical 7d candidate status changed')
}

const candidateSet = {
  schemaVersion: 1,
  authoringContract: 'positive-understanding-evidence-candidates-v1',
  reviewId: 'canonical-math-7d-after-6b-retirement-p-20260928-v1',
  reviewedAt: '2026-09-28T00:26:14Z',
  reviewer: 'OpenAI Codex current-goal review; AI candidate only',
  goals: [{
    goalId,
    reason: 'Der alte 6b-Voraussetzungsknoten bündelte bereits separat modellierte Lagebeziehungen und wurde fachlich begründet aus dem aktuellen 7d-Pfad entfernt. Das unveränderte 7d-Ziel verlangt weiterhin eigenständige vektorielle Transformationsargumente für Flächen und Volumina. Die zwei geprüften P-Fälle bleiben mathematisch korrekt und unabhängig vom alten 6b-Mastery-Wert: Bei T(X)=A+2(X−A) verdoppeln sich beide Spannvektoren und der Dreiecksinhalt vervierfacht sich von 3 auf 12; bei T(x,y,z)=(x+z,y,z) bleibt die Grundfläche 6 und die Höhe 4, also das Volumen 24. Die Fälle prüfen Begründung und Transfer statt Bildwiedergabe; es wird keine menschliche Freigabe behauptet.',
    evidenceLevel: record.evidenceLevel,
    maximumClaimScope: record.maximumClaimScope,
    dissent: record.dissent,
    profile: record.profile,
  }],
}
const expectedBytes = `${JSON.stringify(candidateSet, null, 2)}\n`
const target = resolve(root, targetPath)
if (process.argv[2] === '--write' && process.argv.length === 3) {
  writeFileSync(target, expectedBytes, { flag: 'wx' })
  console.log(`Wrote ${targetPath}: one reviewed-current 7d AI candidate`)
} else if (process.argv.length === 2) {
  if (readFileSync(target, 'utf8') !== expectedBytes) throw new Error(`Stale 7d candidate: ${targetPath}`)
  console.log(`Verified ${targetPath}: one reviewed-current 7d AI candidate`)
} else {
  throw new Error('Usage: tsx materialize-candidate.mts [--write]')
}
