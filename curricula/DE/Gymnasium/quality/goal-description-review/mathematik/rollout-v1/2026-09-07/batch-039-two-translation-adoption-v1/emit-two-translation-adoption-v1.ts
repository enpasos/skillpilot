// Read-only, fail-closed patch emitter. It never writes files; apply stdout with apply_patch.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'

const base = 'curricula/DE/Gymnasium/'
const batch = base + 'quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-039-two-translation-adoption-v1/'
const helperPath = batch + 'emit-two-translation-adoption-v1.ts'
const receiptPath = batch + 'two-translation-adoption-receipt-v1.json'
const preflightPath = base + 'quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-039-preflight-v1.md'
assert(!existsSync(receiptPath), 'Completed adoption must not be replayed')
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (v: any): string => Array.isArray(v) ? `[${v.map(stable).join(',')}]` : v && typeof v === 'object' ? `{${Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`).join(',')}}` : JSON.stringify(v)
// Exact native non-exported A/M payload; native checkers independently validate the result.
const fingerprint = (g: any, ruleVersion: string) => sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: normalize(g.title), titleEn: normalize(g.titleEn), description: normalize(g.description), descriptionEn: normalize(g.descriptionEn), phase: normalize(g.dimensionTags?.phase), area: normalize(g.dimensionTags?.area), topicCode: normalize(g.dimensionTags?.topicCode), nodeKind: normalize(g.nodeKind) }))
const specifications = [
  {
    goalId: '51e80e7b-df31-5d97-97f9-4c6e26eb7416',
    field: 'titleEn',
    before: 'Factorize and analyze polynomial functions',
    after: 'Factorize polynomial functions and determine their zeros',
    titleDe: 'Ganzrationale Funktionen faktorisieren und Nullstellen bestimmen',
    descriptionDe: 'Die lernende Person kann Nullstellen ganzrationaler Funktionen systematisch suchen, Funktionen in Linearfaktordarstellung überführen und Nullstellen aus linearen Faktoren ablesen.',
    atomicityReason: 'Nullstellensuche, Linearfaktordarstellung und Ablesen der Nullstellen sind auf dieselbe zusammenhängende Bestimmungskompetenz ausgerichtet. Der korrigierte englische Titel benennt wieder diesen bereits deutsch und in beiden Beschreibungen festgelegten Gegenstand. Allgemeine Funktionsuntersuchung, die gesonderte Polynomdivisionsroutine und das benachbarte Deuten von Vielfachheiten werden nicht neu aufgenommen.',
    memoryReason: 'Die Nullstellen sind aus einer geeignet gewonnenen Faktorisierung zu erschließen und am konkreten Polynom zu prüfen. Ein isolierter Merksatz oder eine Formelliste ersetzt diese prozedurale und interpretierende Leistung nicht. Der unveränderte Kompetenzkern erfordert keinen zusätzlichen eigenständigen Abrufbestand und kein eigenes Memorydeck.',
    semanticKindReason: 'Die Bestimmung von Polynomnullstellen über lineare Faktoren ist eine prüfbare fachliche Inhaltskompetenz. Das unveränderte Blatt ohne Kinder oder examData ist weder Strukturknoten, Orientierung, Memoryziel noch terminaler Prüfungsauftrag.',
  },
  {
    goalId: '4d55ba50-8d67-560c-a10f-cccff4728c40',
    field: 'descriptionEn',
    before: 'The learner can describe series as sequences of partial sums and interpret the associated notation.',
    after: 'The learner can describe series as sequences of partial sums and interpret the associated notation using mathematical language.',
    titleDe: 'Reihen als Folgen von Partialsummen beschreiben (LK)',
    descriptionDe: 'Die lernende Person kann Reihen als Folgen von Partialsummen beschreiben und die zugehörige Notation fachsprachlich deuten.',
    atomicityReason: 'Die Reihe als Folge endlicher Partialsummen und die sprachliche Deutung ihrer Notation sind zwei Zugänge zu derselben Darstellungsbedeutung. Die englische Ergänzung stellt nur die bereits deutsch ausdrücklich geforderte Fachsprache wieder her. Konvergenzbeweise, harmonische oder geometrische Spezialfälle und Anwendungen bleiben getrennte Nachbarkompetenzen.',
    memoryReason: 'Partialsummen und ihre Indizes sollen an konkreten Folgen aufgebaut und in mathematischer Sprache erklärt werden. Diese Bedeutungszuordnung wird durch Verstehen und Aufgabenpraxis getragen; ein eigener auswendig zu lernender Notations- oder Formelkatalog ist im Ziel nicht erforderlich. Die Ergänzung begründet kein zusätzliches Memorydeck.',
    semanticKindReason: 'Das Beschreiben und Deuten einer mathematischen Darstellung ist curriculare Inhaltskompetenz. Das unveränderte LK-Blatt ohne Kinder oder examData ist weder Orientierung, Memoryziel noch terminales Assessment.',
  },
]
const paths = [base + 'canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', base + 'quality/semantic-atomicity/canonical-math-full.review.jsonl', base + 'quality/memory-card-review/canonical-math-full.review.jsonl', base + 'quality/release-model/mathematik.semantic-kinds.json']
const originals = paths.map(path => readFileSync(path, 'utf8'))
const jsonl = (value: string) => value.trimEnd().split('\n').map(line => JSON.parse(line))
const canonical = JSON.parse(originals[0]), atomic = jsonl(originals[1]), memory = jsonl(originals[2]), kinds = JSON.parse(originals[3])
const serialize = () => [JSON.stringify(canonical, null, 2) + '\n', atomic.map(row => JSON.stringify(row)).join('\n') + '\n', memory.map(row => JSON.stringify(row)).join('\n') + '\n', JSON.stringify(kinds, null, 2) + '\n']
assert.deepEqual(serialize(), originals, 'Refuse unrelated formatting changes')
const completeBefore = structuredClone({ canonical, atomic, memory, kinds })
const unique = (rows: any[], key: string, id: string) => { const matches = rows.filter(row => row[key] === id); assert.equal(matches.length, 1, id); return matches[0] }
const recordedAt = new Date().toISOString()
const changes: any[] = []
for (const specification of specifications) {
  const g = unique(canonical.goals, 'id', specification.goalId)
  const a = unique(atomic, 'goalId', g.id), m = unique(memory, 'goalId', g.id), k = unique(kinds.decisions, 'goalId', g.id)
  assert.equal(g.title, specification.titleDe); assert.equal(g.description, specification.descriptionDe)
  assert.equal(g[specification.field], specification.before)
  assert.equal(a.status, 'atomic'); assert.equal(a.semanticAtomic, true)
  assert.equal(m.status, 'no_memory_needed'); assert.equal(m.memoryUseful, false)
  assert.equal(a.fingerprint, fingerprint(g, a.ruleVersion)); assert.equal(m.fingerprint, fingerprint(g, m.ruleVersion))
  assert.equal(k.semanticKind, 'curricularAtomic'); assert.equal(k.sourceFingerprint, fingerprintSemanticKindSourceGoal(g))
  assert.deepEqual(g.contains ?? [], []); assert(!g.examData)
  assert(!(g.tags ?? []).some((tag: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(tag) || tag.startsWith('srs-deck:')))
  const before = structuredClone(g), bindingsBefore = structuredClone({ atomicity: a, memory: m, semanticKind: k })
  g[specification.field] = specification.after
  assert.deepEqual({ ...g, [specification.field]: specification.before }, before, 'Only one English field per goal may change')
  for (const [row, previous, reason] of [[a, bindingsBefore.atomicity, specification.atomicityReason], [m, bindingsBefore.memory, specification.memoryReason]] as const) {
    row.fingerprint = fingerprint(g, row.ruleVersion)
    row.reviewedAt = recordedAt.slice(0, 10)
    row.reviewer = 'codex-math-b039-two-translation-individual-review'
    row.reason = 'Erneute individuelle fachliche AI-Prüfung der aktuellen DE/EN-Fassung: ' + reason + ' AI-Kandidatenprüfung; keine menschliche Einzelabnahme behauptet.'
    const reverted = { ...row }
    for (const field of ['fingerprint', 'reviewedAt', 'reviewer', 'reason']) reverted[field] = previous[field]
    assert.deepEqual(reverted, previous, 'A/M status and every other field must remain unchanged')
  }
  k.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
  assert.deepEqual({ ...k, sourceFingerprint: bindingsBefore.semanticKind.sourceFingerprint }, bindingsBefore.semanticKind, 'Do not change semantic-kind classification or authority')
  changes.push({ goalId: g.id, changedCanonicalFields: [specification.field], before, after: structuredClone(g), goalBeforeSha256: sha(JSON.stringify(before)), goalAfterSha256: sha(JSON.stringify(g)), bindingsBefore, bindingsAfter: structuredClone({ atomicity: a, memory: m, semanticKind: k }), individualReassessment: { atomicityReason: specification.atomicityReason, memoryReason: specification.memoryReason, semanticKindReason: specification.semanticKindReason, reviewAuthority: 'ai_candidate', humanApprovalClaimed: false } })
}
const reverted = structuredClone({ canonical, atomic, memory, kinds })
for (const change of changes) {
  Object.assign(unique(reverted.canonical.goals, 'id', change.goalId), change.before)
  Object.assign(unique(reverted.atomic, 'goalId', change.goalId), change.bindingsBefore.atomicity)
  Object.assign(unique(reverted.memory, 'goalId', change.goalId), change.bindingsBefore.memory)
  Object.assign(unique(reverted.kinds.decisions, 'goalId', change.goalId), change.bindingsBefore.semanticKind)
}
assert.deepEqual(reverted, completeBefore, 'Refuse any change outside these two goals and A/M/K bindings')
const outputs = serialize()
let patch = '*** Begin Patch\n'
for (const [i, path] of paths.entries()) {
  assert.equal(readFileSync(path, 'utf8'), originals[i], 'Concurrent file drift')
  const before = originals[i].split('\n'), after = outputs[i].split('\n')
  assert.equal(before.length, after.length)
  const changed = before.flatMap((line, n) => line === after[n] ? [] : [n])
  assert.equal(changed.length, 2, 'Exactly two changed lines per data file')
  patch += `*** Update File: ${path}\n`
  for (const line of changed) {
    patch += '@@\n'
    for (let n = Math.max(0, line - 2); n < Math.min(before.length, line + 3); n++) patch += before[n] === after[n] ? ' ' + before[n] + '\n' : '-' + before[n] + '\n+' + after[n] + '\n'
  }
}
const receipt = {
  schemaVersion: 1, artifactType: 'math-b039-two-translation-adoption-v1', recordedAt,
  authority: { execution: 'codex_ai_agent', provider: 'OpenAI', model: 'unknown', reviewAuthority: 'ai_candidate', humanApprovalClaimed: false, modelDiversityClaimed: false, scopeDirection: 'Root-authorized correction of exactly one English title and one English description before D-seal, with individual A/M reassessment and current A/M/K fingerprints only.' },
  sourceArtifacts: [preflightPath, helperPath].map(path => ({ path, sha256: sha(readFileSync(path)) })),
  changes,
  fileDigests: paths.map((path, i) => ({ path, beforeSha256: sha(originals[i]), afterSha256: sha(outputs[i]) })),
  preservedScope: 'Every German text, other canonical field, edge, source reference, image/resource link, A/M outcome, semantic-kind classification/authority, P/D artifact, claim, registry and runtime remains unchanged by this patch. No blind D approval, image approval, Maturity acceptance, human approval, publication or deployment is issued.',
  validationRequired: ['Native mathematics semantic atomicity --mode=check --config=', 'Native mathematics memory-card review --mode=check --config=', 'Root-owned integrated curriculum quality status and protected Maturity floors before completion'],
  recovery: 'Before and after goal snapshots and binding records identify exact reversible local changes. Do not overwrite later concurrent edits with complete historical files.',
}
patch += `*** Add File: ${receiptPath}\n` + JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
process.stdout.write(patch)
