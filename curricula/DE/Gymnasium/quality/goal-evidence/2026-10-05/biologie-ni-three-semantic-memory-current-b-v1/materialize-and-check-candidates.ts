import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Ajv2020 from '/home/enpasos/projects/skillpilot/app/node_modules/ajv/dist/2020.js'
import addFormats from '/home/enpasos/projects/skillpilot/app/node_modules/ajv-formats/dist/index.js'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const root = '/home/enpasos/projects/skillpilot'
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-three-semantic-memory-current-b-v1'
const load = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'))
const write = (name: string, value: unknown) => writeFileSync(resolve(root, own, name), `${JSON.stringify(value, null, 2)}\n`)
const digest = (bytes: string | Buffer) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`
const fileDigest = (path: string) => digest(readFileSync(resolve(root, path)))
const verdict = load(`${own}/scoped-verdict.frozen.candidate.json`)
const snapshot = load(`${own}/canonical-reviewed.snapshot.json`)
const goalById = new Map<string, Record<string, any>>(snapshot.goals.map((goal: any) => [goal.id, goal]))
const exactIds = verdict.exactScopeGoalIds as string[]
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const nativeStableJson = (value: any): string => {
  if (Array.isArray(value)) return `[${value.map(nativeStableJson).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, nested]) => `${JSON.stringify(key)}:${nativeStableJson(nested)}`).join(',')}}`
  return JSON.stringify(value)
}
const nativeGoalFingerprint = (goal: any, ruleVersion: string) => digest(nativeStableJson({
  ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '',
  title: normalize(goal.title), titleEn: normalize(goal.titleEn),
  description: normalize(goal.description), descriptionEn: normalize(goal.descriptionEn),
  phase: normalize(goal.dimensionTags?.phase), area: normalize(goal.dimensionTags?.area),
  topicCode: normalize(goal.dimensionTags?.topicCode), nodeKind: normalize(goal.nodeKind),
}))
const nativeBase = (review: any, ruleVersion: string) => ({
  schemaVersion: 1, reviewId: 'canonical-biology-full', ruleVersion,
  landscapeId: snapshot.landscapeId ?? snapshot.id, goalId: review.goalId,
  fingerprint: nativeGoalFingerprint(goalById.get(review.goalId), ruleVersion),
  reviewedAt: verdict.frozenAt,
  reviewer: 'codex-ni-three-independent-b-ai-candidate',
})
const atomic = verdict.goalReviews.map((review: any) => ({
  ...nativeBase(review, 'semantic-atomicity-v1'),
  status: 'atomic', semanticAtomic: true,
  reason: `AI candidate, inactive targeted review. ${review.atomicReason} ${review.givenHelpBoundary}`,
}))
const memory = verdict.goalReviews.map((review: any) => ({
  ...nativeBase(review, 'memory-card-review-v1'),
  status: 'no_memory_needed', memoryUseful: false,
  reason: `AI candidate, inactive targeted review. ${review.memoryReason}`,
}))
const jsonl = (name: string, rows: unknown[]) => writeFileSync(resolve(root, own, name), `${rows.map(row => JSON.stringify(row)).join('\n')}\n`)
jsonl('atomicity.three.candidate.review.jsonl', atomic)
jsonl('memory.three.candidate.review.jsonl', memory)
writeFileSync(resolve(root, own, 'memory.three.candidate.cards.review.jsonl'), '')
for (const [lane, ruleVersion, reviewPath] of [
  ['atomicity', 'semantic-atomicity-v1', 'atomicity.three.candidate.review.jsonl'],
  ['memory', 'memory-card-review-v1', 'memory.three.candidate.review.jsonl'],
] as const) {
  write(`${lane}.three.candidate.config.json`, {
    schemaVersion: 1, reviewId: 'canonical-biology-full', ruleVersion,
    landscapeId: snapshot.landscapeId ?? snapshot.id,
    landscapePath: `${own}/canonical-reviewed.snapshot.json`,
    reviewPath: `${own}/${reviewPath}`,
    ...(lane === 'memory' ? { cardReviewPath: `${own}/memory.three.candidate.cards.review.jsonl` } : {}),
    scope: { label: 'Inactive independent NI three-goal candidate units only', leafGoalIds: exactIds },
  })
}
const kinds = [
  ...verdict.goalReviews.map((review: any) => ({
    goalId: review.goalId,
    sourceFingerprint: fingerprintSemanticKindSourceGoal(goalById.get(review.goalId)!),
    semanticKind: 'curricularAtomic', decisionStatus: 'candidate',
    decisionBasis: 'reviewed-current-semantic-recheck-curricular-atomic',
  })),
  ...verdict.parentReviews.map((review: any) => ({
    goalId: review.goalId,
    sourceFingerprint: fingerprintSemanticKindSourceGoal(goalById.get(review.goalId)!),
    semanticKind: 'curricularArea', decisionStatus: 'candidate',
    decisionBasis: 'reviewed-current-pilot-curricular-area',
  })),
]
write('semantic-kind.five.candidate.units.json', {
  schemaVersion: 1, recordStatus: 'candidate', reviewAuthority: 'ai_candidate',
  activeLedgerPath: 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
  sourceLandscapeId: snapshot.landscapeId ?? snapshot.id,
  sourceCanonicalPath: verdict.inputCanonicalPath,
  sourceCanonicalBytesDigest: verdict.inputCanonicalBytesDigest,
  sourceFingerprintContractId: 'semantic-kind-source-fingerprint-v1',
  decisions: kinds,
  adoptionNote: 'Inactive candidate units. Native active ledger requires authoritative status after authorized root adoption. This file grants no authority and is intentionally unusable as an active ledger.',
})
const nativeSchemaPath = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const nativeSchema = load(nativeSchemaPath)
const candidateSchema = structuredClone(nativeSchema)
delete candidateSchema.oneOf
candidateSchema.$id = 'https://skillpilot.com/schemas/quality-candidates/ni-three-kind-candidate-v1'
candidateSchema.$ref = '#/$defs/semanticKindDecision'
candidateSchema.$defs.semanticKindDecision.properties.decisionStatus = { const: 'candidate' }
write('semantic-kind.candidate-unit.schema.json', candidateSchema)
const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv)
const validateKind = ajv.compile(candidateSchema)
for (const row of kinds) {
  if (!validateKind(row)) throw new Error(ajv.errorsText(validateKind.errors))
  if (row.sourceFingerprint !== fingerprintSemanticKindSourceGoal(goalById.get(row.goalId)!)) throw new Error(`Stale kind candidate ${row.goalId}`)
}
if (fileDigest(verdict.inputCanonicalPath) !== verdict.inputCanonicalBytesDigest) throw new Error('Assigned staged canonical changed after independent verdict freeze')
if (fileDigest(`${own}/canonical-reviewed.snapshot.json`) !== verdict.inputCanonicalBytesDigest) throw new Error('Snapshot is foreign')
const bindings = verdict.goalReviews.map((review: any, index: number) => ({
  goalId: review.goalId, atomicityFingerprint: atomic[index].fingerprint,
  memoryFingerprint: memory[index].fingerprint,
  semanticKindSourceFingerprint: kinds[index].sourceFingerprint,
  descriptionFieldsDigest: digest(nativeStableJson({
    title: review.currentGoal.title, titleEn: review.currentGoal.titleEn,
    description: review.currentGoal.description, descriptionEn: review.currentGoal.descriptionEn,
    requires: review.currentGoal.requires, contains: review.currentGoal.contains,
  })),
}))
write('candidate-bindings-and-kind-check.receipt.json', {
  schemaVersion: 1, checkedAt: new Date().toISOString(), reviewAuthority: 'ai_candidate',
  candidateUnitsChecked: { atomicity: atomic.length, memory: memory.length, semanticKind: kinds.length },
  semanticKindSchemaPath: nativeSchemaPath, semanticKindSchemaDigest: fileDigest(nativeSchemaPath),
  candidateSchemaDerivation: 'Exact native semanticKindDecision shape with decisionStatus const replaced by candidate; no other decision rule changed.',
  semanticKindHelperPath: 'app/scripts/goalBookModel.ts::fingerprintSemanticKindSourceGoal',
  sourceCanonicalSnapshotBytesMatchAssignedInput: true,
  semanticKindCandidateShapeAndFingerprintsPassed: true,
  bindings,
  nativeAtomicityAndMemoryCliChecks: 'pending',
  activeAuthority: false,
})
console.log('Frozen NI candidate units: 3 A, 3 no-memory, 5 Kind; exact Kind helper fingerprints and candidate unit schema valid.')
