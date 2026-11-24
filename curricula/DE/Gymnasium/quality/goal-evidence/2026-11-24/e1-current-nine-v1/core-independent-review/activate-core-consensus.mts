// SPDX-License-Identifier: Apache-2.0
// Mechanically activate only independently unanimous A/kind opinions; never edit a goal.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../app/scripts/goalBookModel'
const root = process.cwd()
const dir = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1/core-independent-review')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const a = read(resolve(dir, 'round-a/response.json')), b = read(resolve(dir, 'round-b/response.json'))
const input = read(resolve(dir, 'round-a/canonical-input.json'))
const canonicalPath = resolve(root, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
const canonicalBytes = readFileSync(canonicalPath)
const goals = new Map(read(canonicalPath).goals.map((g: any) => [g.id, g]))
const hash = (v: Buffer | string) => `sha256:${createHash('sha256').update(v).digest('hex')}`
const stable = (v: any): string => Array.isArray(v) ? `[${v.map(stable).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.entries(v).sort(([x], [y]) => x.localeCompare(y))
    .map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`).join(',')}}` : JSON.stringify(v)
const norm = (v: unknown) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const fingerprint = (g: any) => hash(stable({ ruleVersion: 'semantic-atomicity-v1', goalId: g.id,
  shortKey: g.shortKey ?? '', title: norm(g.title), titleEn: norm(g.titleEn), description: norm(g.description),
  descriptionEn: norm(g.descriptionEn), phase: norm(g.dimensionTags?.phase), area: norm(g.dimensionTags?.area),
  topicCode: norm(g.dimensionTags?.topicCode), nodeKind: norm(g.nodeKind) }))
const atomicPath = resolve(root, 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl')
const beforeAtomic = readFileSync(atomicPath)
const records = beforeAtomic.toString('utf8').trim().split('\n').map(line => JSON.parse(line))
const oldAtomic = records.filter((r: any) => input.descriptionGoalIds.includes(r.goalId))
const kindPath = resolve(root, 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json')
const beforeKinds = readFileSync(kindPath), kinds = JSON.parse(beforeKinds.toString('utf8'))
const oldKinds = kinds.decisions.filter((r: any) => input.semanticKindGoalIds.includes(r.goalId))
const frozenCore = new Map(input.canonicalGoals.map((g: any) => [g.id, g]))
for (const id of input.descriptionGoalIds) {
  const g: any = goals.get(id), frozen: any = frozenCore.get(id)
  for (const field of ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'tags']) {
    if (stable(g[field]) !== stable(frozen[field])) throw new Error(`Reviewed core changed: ${id}/${field}`)
  }
  const ar = a.atomicityReviews.find((r: any) => r.goalId === id), br = b.atomicityReviews.find((r: any) => r.goalId === id)
  if (ar?.semanticAtomic !== true || br?.semanticAtomic !== true) throw new Error(`No atomicity consensus: ${id}`)
  const record = { schemaVersion: 1, reviewId: 'canonical-physics-full', ruleVersion: 'semantic-atomicity-v1',
    landscapeId: '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a', goalId: id, fingerprint: fingerprint(g),
    status: 'atomic', semanticAtomic: true, reviewedAt: '2026-11-24', reviewer: 'Codex integrator of actual blind gpt-6.1-sol/ultra and gpt-6.2-astra/ultra core runs',
    reason: `Two independent goal-core reviews agree. A: ${ar.reason} B: ${br.reason} Evidence: curricula/DE/Gymnasium/quality/goal-evidence/2026-11-24/e1-current-nine-v1/core-independent-review/dual-summary.actual.json`, suggestedSplit: [] }
  const i = records.findIndex((r: any) => r.goalId === id)
  if (i >= 0) records[i] = record
  else records.push(record)
}
for (const id of input.semanticKindGoalIds) {
  const ar = a.semanticKindReviews.find((r: any) => r.goalId === id), br = b.semanticKindReviews.find((r: any) => r.goalId === id)
  if (!ar || ar.semanticKind !== br?.semanticKind) throw new Error(`No kind consensus: ${id}`)
  const decision = kinds.decisions.find((r: any) => r.goalId === id)
  if (!decision || decision.semanticKind !== ar.semanticKind) throw new Error(`Unexpected kind transition: ${id}`)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(goals.get(id) as Record<string, unknown>)
  if (decision.semanticKind === 'curricularAtomic') decision.decisionBasis = 'reviewed-current-semantic-recheck-curricular-atomic'
}
records.sort((x: any, y: any) => x.goalId.localeCompare(y.goalId))
const afterAtomic = Buffer.from(records.map((record: any) => JSON.stringify(record)).join('\n') + '\n')
const afterKinds = Buffer.from(JSON.stringify(kinds, null, 2) + '\n')
const receipt = { schemaVersion: 1, contract: 'e1-core-atomicity-kind-consensus-activation-v1',
  atomicGoalIds: input.descriptionGoalIds, semanticKindGoalIds: input.semanticKindGoalIds,
  beforeAtomicLedgerSha256: hash(beforeAtomic), afterAtomicLedgerSha256: hash(afterAtomic),
  beforeKindLedgerSha256: hash(beforeKinds), afterKindLedgerSha256: hash(afterKinds),
  canonicalSha256Unchanged: hash(canonicalBytes), canonicalEdits: 0, prerequisiteEdits: 0,
  unanimousAtomicityCount: 9, unanimousKindCount: 12,
  prerequisiteBoundary: 'VEC has dissent; MP rejected in both rounds. Neither prerequisite finding is activated or declared accepted by this A/kind receipt.',
  actualRoundManifests: ['round-a/run.actual.json', 'round-b/run.actual.json'] }
if (!process.argv.includes('--write')) throw new Error('Explicit --write required; review the actual blind runs first')
if (existsSync(resolve(dir, 'activation.receipt.json'))) throw new Error('Immutable activation receipt already exists')
writeFileSync(resolve(dir, 'prior-atomic-records.json'), JSON.stringify(oldAtomic, null, 2) + '\n')
writeFileSync(resolve(dir, 'prior-kind-decisions.json'), JSON.stringify(oldKinds, null, 2) + '\n')
writeFileSync(atomicPath, afterAtomic)
writeFileSync(kindPath, afterKinds)
if (!canonicalBytes.equals(readFileSync(canonicalPath))) throw new Error('Canonical changed during mechanical activation')
writeFileSync(resolve(dir, 'activation.receipt.json'), JSON.stringify(receipt, null, 2) + '\n')
console.log('Activated 9 atomicity reviews and bound 12 unchanged semantic-kind classifications; no goal or prerequisite edit.')
