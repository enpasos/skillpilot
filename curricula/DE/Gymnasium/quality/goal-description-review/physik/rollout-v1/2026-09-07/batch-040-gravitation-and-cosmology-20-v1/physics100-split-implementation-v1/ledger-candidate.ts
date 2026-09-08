import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../../app/scripts/goalBookModel.ts'

// Pure candidate construction after read-only snapshot loading. No writes or CLI main.
type Row = Record<string, any>
type Judgment = { atomicityReason: string; memoryReason: string; cardReason?: string }
const LANDSCAPE = '7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a'
const BIG_BANG = 'c52d55c3-b687-586c-b0f9-8ffcd1069424'
const MEMORY = '266b6cf8-d49d-5197-862c-9998fcf179a5'
const paths = {
  A: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  M: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl',
  K: 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json',
  cards: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.cards.review.jsonl',
}
function assert(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error('B040 ledger lease/contract: ' + message)
}
const norm = (v: unknown) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
function stable(v: any): string {
  if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']'
  if (v && typeof v === 'object') return '{' + Object.entries(v)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, value]) => JSON.stringify(k) + ':' + stable(value)).join(',') + '}'
  return JSON.stringify(v)
}
const digest = (s: string) => 'sha256:' + createHash('sha256').update(s).digest('hex')
const same = (a: unknown, b: unknown) => stable(a) === stable(b)
export function fingerprintAMGoal(g: Row, ruleVersion: string): string {
  return digest(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '',
    title: norm(g.title), titleEn: norm(g.titleEn), description: norm(g.description),
    descriptionEn: norm(g.descriptionEn), phase: norm(g.dimensionTags?.phase),
    area: norm(g.dimensionTags?.area), topicCode: norm(g.dimensionTags?.topicCode),
    nodeKind: norm(g.nodeKind) }))
}
export function fingerprintCard(g: Row, deckId: string): string {
  return digest(stable({ ruleVersion: 'memory-card-review-v1', deckId,
    cardId: String(g.id).trim(), front: norm(g.front), back: norm(g.back),
    category: norm(g.category), tags: Array.isArray(g.tags) ? g.tags.map(norm).filter(Boolean) : [] }))
}
const ordinaryLeaf = (g: Row) => (!Array.isArray(g.contains) || !g.contains.length)
  && !g.examData && g.nodeKind !== 'memory'
  && !(g.tags ?? []).some((t: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(t) || t.startsWith('srs-deck:'))
function unique(rows: Row[], key: (r: Row) => string, label: string): Map<string, Row> {
  const map = new Map<string, Row>()
  for (const r of rows) { const id = key(r); assert(!map.has(id), label + ' duplicate ' + id); map.set(id, r) }
  return map
}
export function buildLedgerCandidates({ root, beforeLandscape, afterLandscape, authoring, reviewedAt, judgments }: {
  root: string; beforeLandscape: Row; afterLandscape: Row; authoring: Row;
  reviewedAt: string; judgments: Record<string, Judgment>
}) {
  assert(beforeLandscape.landscapeId === LANDSCAPE || beforeLandscape.id === LANDSCAPE, 'before landscape identity')
  assert(afterLandscape.landscapeId === LANDSCAPE || afterLandscape.id === LANDSCAPE, 'after landscape identity')
  assert(typeof reviewedAt === 'string' && Number.isFinite(Date.parse(reviewedAt)), 'real reviewedAt required')
  const beforeGoals = unique(beforeLandscape.goals, g => g.id, 'before goals')
  const afterGoals = unique(afterLandscape.goals, g => g.id, 'after goals')
  const parentIds = new Set<string>(authoring.clusterChanges.map((r: Row) => r.goalId))
  const newIds = new Set<string>(authoring.newGoals.map((g: Row) => g.id))
  const allowedIds = new Set([...parentIds, ...newIds, ...authoring.edgeChanges.map((r: Row) => r.goalId)])
  assert(parentIds.size === 3 && newIds.size === 7 && authoring.edgeChanges.length === 13, 'expected 3/7/13 scope')
  assert(afterGoals.size === beforeGoals.size + 7, 'exactly seven new canonical goals')
  for (const [id, before] of beforeGoals) {
    assert(afterGoals.has(id), 'canonical deletion not allowed: ' + id)
    if (fingerprintSemanticKindSourceGoal(before) !== fingerprintSemanticKindSourceGoal(afterGoals.get(id)!))
      assert(allowedIds.has(id), 'unscoped semantic-source change: ' + id)
  }
  for (const change of authoring.clusterChanges) {
    const g = beforeGoals.get(change.goalId); const next = afterGoals.get(change.goalId)
    assert(g && next, 'parent exists')
    for (const [k, value] of Object.entries(change.fieldLeases ?? change.before))
      assert(same(g[k], value), 'parent before field ' + change.goalId + '/' + k)
    for (const [k, value] of Object.entries(change.after))
      assert(same(next[k], value), 'parent after field ' + change.goalId + '/' + k)
    for (const k of ['title', 'titleEn', 'description', 'descriptionEn'])
      assert(same(g[k], next[k]), 'parent wording must survive: ' + change.goalId + '/' + k)
    assert(ordinaryLeaf(g) && next.type === 'cluster' && next.contains.length > 0, 'parent leaf-to-cluster shape')
  }
  for (const edge of authoring.edgeChanges) {
    assert(same(beforeGoals.get(edge.goalId)?.requires, edge.before), 'requires-before ' + edge.goalId)
    assert(same(afterGoals.get(edge.goalId)?.requires, edge.after), 'requires-after ' + edge.goalId)
  }
  for (const id of newIds) {
    assert(!beforeGoals.has(id) && afterGoals.has(id) && ordinaryLeaf(afterGoals.get(id)!), 'new ordinary leaf ' + id)
    assert(norm(judgments[id]?.atomicityReason) && norm(judgments[id]?.memoryReason), 'individual judgments required: ' + id)
  }
  const text = Object.fromEntries(Object.entries(paths).map(([k, p]) => [k, readFileSync(resolve(root, p), 'utf8')]))
  const parseLines = (s: string) => s.split('\n').filter(l => l.trim()).map(raw => ({ raw, row: JSON.parse(raw) as Row }))
  const a = parseLines(text.A); const m = parseLines(text.M); const c = parseLines(text.cards)
  const am = unique(a.map(r => r.row), r => r.goalId, 'A')
  const mm = unique(m.map(r => r.row), r => r.goalId, 'M')
  const cm = unique(c.map(r => r.row), r => r.deckId + '/' + r.cardId, 'cards')
  const k = JSON.parse(text.K)
  const km = unique(k.decisions, r => r.goalId, 'K')
  assert(km.size === beforeGoals.size, 'K must cover full before landscape')
  for (const [id, g] of beforeGoals) assert(km.get(id)?.sourceFingerprint === fingerprintSemanticKindSourceGoal(g), 'stale K ' + id)
  for (const [label, rows, rule] of [['A', am, 'semantic-atomicity-v1'], ['M', mm, 'memory-card-review-v1']] as const) {
    for (const id of parentIds) {
      const r = rows.get(id); assert(r && r.schemaVersion === 1 && r.landscapeId === LANDSCAPE && r.ruleVersion === rule, label + ' old row shape ' + id)
      assert(r.fingerprint === fingerprintAMGoal(beforeGoals.get(id)!, rule), label + ' stale old row ' + id)
    }
    for (const id of newIds) assert(!rows.has(id), label + ' new ID already reviewed ' + id)
  }
  const common = { schemaVersion: 1, reviewId: 'canonical-physics-full', landscapeId: LANDSCAPE,
    reviewedAt, reviewer: 'codex-ai-candidate' }
  const memoryDecisions = unique(authoring.memoryDecisions, r => r.goalId, 'memory decisions')
  assert(memoryDecisions.size === 7, 'seven memory decisions required')
  const newA: Row[] = []; const newM: Row[] = []
  for (const id of newIds) {
    const g = afterGoals.get(id)!; const decision = memoryDecisions.get(id)!
    assert(decision && ['no_memory_needed', 'memory_required'].includes(decision.status), 'resolved individual memory decision ' + id)
    const required = decision.status === 'memory_required'
    assert(required ? decision.memoryGoalIds?.length > 0 && decision.deckIds?.length > 0
      : !(decision.memoryGoalIds?.length || decision.deckIds?.length), 'memory references shape ' + id)
    newA.push({ ...common, ruleVersion: 'semantic-atomicity-v1', goalId: id,
      fingerprint: fingerprintAMGoal(g, 'semantic-atomicity-v1'), status: 'atomic', semanticAtomic: true,
      reason: judgments[id].atomicityReason })
    newM.push({ ...common, ruleVersion: 'memory-card-review-v1', goalId: id,
      fingerprint: fingerprintAMGoal(g, 'memory-card-review-v1'), status: decision.status, memoryUseful: required,
      memoryGoalIds: decision.memoryGoalIds ?? [], deckIds: decision.deckIds ?? [], reason: judgments[id].memoryReason })
  }
  const keptA = a.filter(r => !parentIds.has(r.row.goalId))
  const keptM = m.filter(r => !parentIds.has(r.row.goalId))
  for (const [label, rows, rule] of [['A', keptA, 'semantic-atomicity-v1'], ['M', keptM, 'memory-card-review-v1']] as const)
    for (const { row } of rows) {
      const g = afterGoals.get(row.goalId)
      assert(g && ordinaryLeaf(g), label + ' obsolete ordinary record ' + row.goalId)
      assert(row.fingerprint === fingerprintAMGoal(g, rule), label + ' existing wording requires fresh judgment: ' + row.goalId)
    }
  const kDeltas: Row[] = []
  for (const [id, g] of afterGoals) {
    const old = km.get(id); const fp = fingerprintSemanticKindSourceGoal(g)
    const kind = parentIds.has(id) ? 'curricularArea' : newIds.has(id) ? 'curricularAtomic' : old?.semanticKind
    assert(kind, 'missing K classification ' + id)
    const next = { ...(old ?? {}), goalId: id, sourceFingerprint: fp, semanticKind: kind,
      decisionStatus: 'authoritative', decisionBasis: parentIds.has(id) ? 'reviewed-current-post-split-curricular-area'
        : newIds.has(id) ? 'reviewed-current-post-split-curricular-atomic' : old.decisionBasis }
    if (!same(old, next)) kDeltas.push({ goalId: id, before: old ?? null, after: next })
    km.set(id, next)
  }
  assert(km.get(MEMORY)?.semanticKind === 'memory', 'memory266 kind must stay memory')
  k.decisions = [...km.values()].sort((a, b) => a.goalId.localeCompare(b.goalId))
  k.counts = Object.fromEntries(['curricularAtomic', 'curricularArea', 'practiceAssessment', 'programStructure', 'memory', 'runtimeSupport', 'orientation'].map(kind => [kind, k.decisions.filter((d: Row) => d.semanticKind === kind).length]))
  k.counts.total = k.decisions.length
  const deck = JSON.parse(readFileSync(resolve(root, authoring.memoryDeck.path), 'utf8'))
  assert(deck.deckId === authoring.memoryDeck.id, 'deck identity')
  const oldCard = deck.cards.find((r: Row) => r.id === authoring.memoryCard.cardId)
  assert(same(oldCard, authoring.memoryCard.before), 'c15 raw before lease')
  const cardKey = deck.deckId + '/' + oldCard.id; const oldCardRow = cm.get(cardKey)!
  assert(oldCardRow?.fingerprint === fingerprintCard(oldCard, deck.deckId), 'c15 current hash lease')
  assert(authoring.memoryCard.after === null, 'c15 current adjudication removes the active card')
  const origin = authoring.memoryCard.cardLedgerAfter.originGoalIds
  assert(same(origin, []) && authoring.memoryCard.cardLedgerAfter.status === 'remove'
    && authoring.memoryCard.cardLedgerAfter.necessary === false, 'c15 remove/not-necessary/no-active-origins')
  const bigBangMemory = newM.find(r => r.goalId === BIG_BANG)!
  assert(bigBangMemory.status === 'no_memory_needed' && !bigBangMemory.memoryGoalIds.length && !bigBangMemory.deckIds.length, 'B is qualitative understanding, no new deck obligation')
  assert(newM.every(r => r.status === 'no_memory_needed'), 'all seven new goals have individually justified no-memory decisions')
  const memoryGoal = afterGoals.get(MEMORY)!
  assert(memoryGoal.tags?.includes('srs-deck:' + deck.deckId) && !memoryGoal.requires.includes(BIG_BANG)
    && !memoryGoal.requires.includes('c9405043-bdc0-5995-8b4d-5bb56d97d05d'), 'memory266 keeps its deck without the obsolete c15-only prerequisite')
  for (const { row } of c) if (row.deckId + '/' + row.cardId !== cardKey)
    assert(!(row.originGoalIds ?? []).some((id: string) => parentIds.has(id)), 'unhandled old-parent card origin ' + row.cardId)
  const newCardRow = { ...oldCardRow, ...common, ruleVersion: 'memory-card-review-v1',
    fingerprint: fingerprintCard(oldCard, deck.deckId), status: 'remove', necessary: false,
    originGoalIds: origin, reason: judgments[BIG_BANG].cardReason ?? judgments[BIG_BANG].memoryReason }
  const afterTexts = {
    A: [...keptA.map(r => r.raw), ...newA.map(r => JSON.stringify(r))].join('\n') + '\n',
    M: [...keptM.map(r => r.raw), ...newM.map(r => JSON.stringify(r))].join('\n') + '\n',
    K: JSON.stringify(k, null, 2) + '\n',
    cards: c.map(({ raw, row }) => row.deckId + '/' + row.cardId === cardKey ? JSON.stringify(newCardRow) : raw).join('\n') + '\n',
  }
  const files = Object.entries(paths).map(([lane, path]) => ({ path, before: text[lane], after: afterTexts[lane as keyof typeof afterTexts] }))
  return { files, receipt: {
    status: 'READ_ONLY_CANDIDATES_NOT_APPLIED', reviewedAt, subjectJudgmentsSuppliedByCaller: true,
    fileLeases: files.map(f => ({ path: f.path, beforeSha256: digest(f.before), afterSha256: digest(f.after) })),
    archivedA: a.filter(r => parentIds.has(r.row.goalId)), archivedM: m.filter(r => parentIds.has(r.row.goalId)),
    addedA: newA, addedM: newM, semanticKindDeltas: kDeltas,
    cardDelta: { before: oldCardRow, after: newCardRow, removedRawCard: oldCard, beforeRawCardSha256: digest(stable(oldCard)), afterRawCardSha256: null },
    finalScope: { ordinaryLeaves: [...afterGoals.values()].filter(ordinaryLeaf).length, aRecords: keptA.length + 7, mRecords: keptM.length + 7, obsoleteA: 0, obsoleteM: 0 },
    deckWriteRequiredSeparately: [authoring.memoryDeck.path, authoring.memoryDeck.runtimePath, authoring.memoryDeck.backendRuntimePath],
    visibilityAndNativeValidationRequired: true,
  } }
}
