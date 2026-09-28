import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { fingerprintSemanticKindSourceGoal } from './goalBookModel'

type JsonRecord = Record<string, unknown>
const root = resolve(import.meta.dirname, '../..')
const write = process.argv.includes('--write')
if (process.argv.slice(2).some((argument) => argument !== '--write')) throw new Error('Usage: tsx app/scripts/rebindMathM7NewtonText.ts [--write]')
const id = '0c7bbd3f-0a04-4f0e-888b-40ab7841fb76'
const reviewedAt = '2026-09-27'
const reviewer = 'codex-math-m7-newton-tangent-and-boundary-targeted-review-2026-09-27'
const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  semantic: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  atomic: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
} as const
const absolute = (path: string): string => resolve(root, path)
const readJson = (path: string): JsonRecord => JSON.parse(readFileSync(absolute(path), 'utf8')) as JsonRecord
const readJsonl = (path: string): JsonRecord[] => readFileSync(absolute(path), 'utf8').trimEnd().split('\n').map((line) => JSON.parse(line) as JsonRecord)
const stableJson = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value as JsonRecord)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableJson(nested)}`).join(',')}}`
  return JSON.stringify(value) ?? 'null'
}
const normalize = (value: unknown): string => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const fingerprint = (goal: JsonRecord, ruleVersion: string): string => `sha256:${createHash('sha256').update(stableJson({
  ruleVersion,
  goalId: goal.id,
  shortKey: goal.shortKey ?? '',
  title: normalize(goal.title),
  titleEn: normalize(goal.titleEn),
  description: normalize(goal.description),
  descriptionEn: normalize(goal.descriptionEn),
  phase: normalize((goal.dimensionTags as JsonRecord | undefined)?.phase),
  area: normalize((goal.dimensionTags as JsonRecord | undefined)?.area),
  topicCode: normalize((goal.dimensionTags as JsonRecord | undefined)?.topicCode),
  nodeKind: normalize(goal.nodeKind),
})).digest('hex')}`

const canonical = readJson(paths.canonical)
const goal = (canonical.goals as JsonRecord[]).find((row) => row.id === id)
if (!goal || goal.description !== 'Die lernende Person kann beim Newton-Verfahren die Nullstelle der Tangente im aktuellen Graphpunkt als nächsten Näherungswert bestimmen, die Iteration bei geeigneten Funktionen und Startwerten anwenden und Grenzen anhand von Ableitung und Näherungsverlauf begründen.') throw new Error('Newton goal is not the reviewed current DE state')
if (goal.descriptionEn !== "The learner can determine the root of the tangent at the current point on the graph as the next approximation in Newton's method, iterate for suitable functions and starting values, and explain limitations using the derivative and the course of the approximations.") throw new Error('Newton EN text is not the reviewed current state')
const semantic = readJson(paths.semantic)
const semanticRow = (semantic.decisions as JsonRecord[]).find((row) => row.goalId === id)
if (!semanticRow || semanticRow.semanticKind !== 'curricularAtomic' || semanticRow.decisionStatus !== 'authoritative') throw new Error('Newton semantic-kind decision missing')
semanticRow.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal as never)

const atomic = readJsonl(paths.atomic)
const atomicRow = atomic.find((row) => row.goalId === id)
if (!atomicRow || atomicRow.status !== 'atomic' || atomicRow.semanticAtomic !== true) throw new Error('Newton atomicity decision missing')
Object.assign(atomicRow, {
  fingerprint: fingerprint(goal, 'semantic-atomicity-v1'),
  reviewedAt,
  reviewer,
  reason: 'Tangenten-Nullstelle, wiederholte Näherung und Prüfung der Einsatzgrenzen sind Teile einer zusammenhängenden Newton-Verfahrenskompetenz. Der aktualisierte Text verlangt weder ein zweites unabhängiges Verfahren noch einen allgemeinen Konvergenzbeweis; ein atomarer Aufgabenverbund ist weiterhin möglich. Zielbezogene aktuelle AI-Prüfung, keine menschliche Einzelabnahme.',
})

const memory = readJsonl(paths.memory)
const memoryRow = memory.find((row) => row.goalId === id)
if (!memoryRow || memoryRow.status !== 'no_memory_needed' || memoryRow.memoryUseful !== false) throw new Error('Newton no-memory decision changed')
Object.assign(memoryRow, {
  fingerprint: fingerprint(goal, 'memory-card-review-v1'),
  reviewedAt,
  reviewer,
  reason: 'Die Formel ist kompakt, aber dieses Ziel prüft vor allem die geometrische Herleitung der Tangenten-Iteration, das selbstständige Anwenden und das Begründen von Grenzen an neuem Startwert oder Verlauf. Ein isoliertes Memory-Deck würde diese Verständnisleistung nicht nachweisen; die Formel kann in Aufgaben gegeben oder hergeleitet werden. Zielbezogene aktuelle AI-Prüfung, keine menschliche Einzelabnahme.',
})

const outputs = new Map<string, string>([
  [paths.semantic, `${JSON.stringify(semantic, null, 2)}\n`],
  [paths.atomic, `${atomic.map((row) => JSON.stringify(row)).join('\n')}\n`],
  [paths.memory, `${memory.map((row) => JSON.stringify(row)).join('\n')}\n`],
])
const changed = [...outputs].filter(([path, bytes]) => readFileSync(absolute(path), 'utf8') !== bytes)
if (write) changed.forEach(([path, bytes]) => writeFileSync(absolute(path), bytes, 'utf8'))
else if (changed.length) throw new Error(`Newton A/M/semantic bindings stale: ${changed.map(([path]) => path).join(', ')}`)
console.log(`Newton A/M/semantic ${write ? 'WRITE' : 'CHECK'}: changed=${changed.length}`)
