// Read-only, narrowly scoped patch emitter. Apply its output with apply_patch.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'

const base = 'curricula/DE/Gymnasium/'
const mathBatch = base + 'quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-038r-exponential-scope-and-context-11-v1/'
const physicsBatch = base + 'quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-039-quantum-and-rotation-20-v1/'
const receiptPath = mathBatch + 'local-text-review-adoption-v1.json'
assert(!existsSync(receiptPath), 'Do not replay completed adoption')
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (v: any): string => Array.isArray(v) ? `[${v.map(stable).join(',')}]` : v && typeof v === 'object' ? `{${Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`).join(',')}}` : JSON.stringify(v)
// Exact native A/M normalization; native checks must subsequently verify these bindings.
const fingerprint = (g: any, ruleVersion: string) => sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: normalize(g.title), titleEn: normalize(g.titleEn), description: normalize(g.description), descriptionEn: normalize(g.descriptionEn), phase: normalize(g.dimensionTags?.phase), area: normalize(g.dimensionTags?.area), topicCode: normalize(g.dimensionTags?.topicCode), nodeKind: normalize(g.nodeKind) }))
const files = new Map<string, { before: string, after: string }>()
const read = (path: string) => readFileSync(path, 'utf8')
const jsonl = (bytes: string) => bytes.trimEnd().split('\n').map(line => JSON.parse(line))
const exactlyOne = (rows: any[], key: string, id: string) => { const found = rows.filter(r => r[key] === id); assert.equal(found.length, 1, id); return found[0] }
const spec = [
  { subject: 'math', id: '781f133a-08bb-54b9-8fda-efa2f8f9b12c', round: 'b',
    atomic: 'Erkennen und Zuordnen beziehen sich auf denselben exponentiellen Prozess; Tabelle, Graph und Kontext liefern unterschiedliche Darstellungen des konstanten Faktors bei gleichen Zeitabständen. Die Präzisierung benennt den bisherigen Unterscheidungsgrund, keine zusätzliche Parameterschätzung oder Ableitung.',
    memory: 'Konstante Verhältnisse müssen an frischen Darstellungen erkannt und gegen konstante Differenzen abgegrenzt werden. Ein auswendig gelernter Merksatz wäre kein Ersatz für diese Diagnoseleistung; kein neuer eigenständiger Abrufbestand erforderlich.' },
  { subject: 'math', id: '346efb31-c400-5bd3-a698-dd9a7e1bc3f7', round: 'b',
    atomic: 'Faktor, charakteristische Zeit und Darstellungsverknüpfung sind zusammenhängende Interpretationen derselben Exponentialfunktion. Der deutsche Anspruch bleibt unverändert; die englischen doubling times stellen die fehlende Zeitgröße richtig. Keine zusätzliche logarithmische Lösungsmethode.',
    memory: 'Die Verdopplungs- oder Halbwertszeit wird aus dem Faktor und den dargestellten Verhältnissen erschlossen. Das Ziel fordert keinen neuen zwingend auswendig verfügbaren Formelkatalog; Erklären und Darstellungswechsel bleiben führend.' },
  { subject: 'math', id: 'f05acdc5-4949-54c7-b8cd-56ddd1fbdbad', round: 'a',
    atomic: 'Die skalierte e-Funktion und ihre konstante relative Rate präzisieren einen einzigen kontinuierlichen Modellierungsanspruch für Wachstum oder Zerfall. Modellterm, berechneter Bestand und Kontextdeutung gehören zu derselben Anwendung; weder Differentialgleichungslösung noch Messdatenanpassung wird ergänzt.',
    memory: 'Anfangswert, Vorzeichen und Zeiteinheit des Exponenten müssen im neuen Kontext sinnvoll gewählt und erklärt werden. Bloßes Abrufen der Funktionsform zeigt das nicht; kein zusätzliches Memorydeck für diesen Anwendungszusammenhang nötig.' },
  { subject: 'math', id: 'ab720928-9dbc-53c2-a1f8-865dda92122d', round: 'a',
    atomic: 'Aus geeigneten Messwerten ein Exponentialmodell bestimmen und seine bedingte Prognose deuten bildet eine kohärente Modellierungskette. Die Annahmen markieren den Gültigkeitsrahmen der bisherigen Zukunftsaussage; kein zusätzlicher Vergleich verschiedener Modellklassen.',
    memory: 'Messzeitpunkte, Verhältnisse und Fortgeltung des Modells sind in der konkreten Datenlage zu prüfen. Eine isolierte Merkkarte ersetzt weder Parameterrekonstruktion noch bedingte Prognose; kein zwingender eigener Recall-Baustein.' },
  { subject: 'physics', id: 'b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc', round: 'b',
    atomic: 'Präzession wird als eine qualitative Richtungsänderung des Drehimpulsvektors erklärt. Die Abgrenzung zur Erhaltung ohne äußeres Drehmoment begründet dieselbe Erklärung, keine unabhängige neue Rechenkompetenz; ID, Voraussetzungen und Scope bleiben unverändert.',
    memory: 'Der eng begrenzte notwendige Begriffsanker bleibt die Ursache der hier behandelten Kreiselpräzession: äußeres Drehmoment ändert die Drehimpulsrichtung. Die vorhandene DE/EN-Karte physics_e_cov_068 enthält genau diesen korrekten Merksatz und keine pauschale Vektorerhaltung. Ihr Abruf unterstützt die qualitative Erklärung, ersetzt sie aber nicht; bestehendes Mechanikdeck und Herkunft bleiben erhalten.' },
]
const date = new Date().toISOString()
const receipt: any = { schemaVersion: 1, recordedAt: date, authority: 'ai_candidate', humanApprovalClaimed: false, scope: 'Individual A/M re-review and semantic-kind binding after four local mathematics wording fixes and one precession correction. No D/P approval, no graph or learner-state mutation.', changes: [], sourceArtifacts: [] }
for (const subject of ['math', 'physics']) {
  const lang = subject === 'math' ? 'mathematik' : 'physik'
  const cp = base + `canonical/DE_DEU_S_GYM_CANONICAL_${lang.toUpperCase()}.de.json`
  const ap = base + `quality/semantic-atomicity/canonical-${subject}-full.review.jsonl`
  const mp = base + `quality/memory-card-review/canonical-${subject}-full.review.jsonl`
  const kp = base + `quality/release-model/${lang}.semantic-kinds.json`
  const canonical = JSON.parse(read(cp)), atoms = jsonl(read(ap)), memories = jsonl(read(mp)), kinds = JSON.parse(read(kp))
  for (const path of [ap, mp, kp]) files.set(path, { before: read(path), after: '' })
  const batch = subject === 'math' ? mathBatch : physicsBatch
  const rounds = Object.fromEntries(['a', 'b'].map(round => {
    const dir = batch + `round-${round}/results/`
    const names = readdirSync(dir).filter(name => name.endsWith('.records.jsonl'))
    assert.equal(names.length, 1)
    const path = dir + names[0]
    receipt.sourceArtifacts.push({ path, sha256: sha(read(path)) })
    return [round, jsonl(read(path))]
  }))
  for (const s of spec.filter(s => s.subject === subject)) {
    const g = exactlyOne(canonical.goals, 'id', s.id), source = exactlyOne(rounds[s.round], 'goalId', s.id)
    const a = exactlyOne(atoms, 'goalId', s.id), m = exactlyOne(memories, 'goalId', s.id), k = exactlyOne(kinds.decisions, 'goalId', s.id)
    assert.equal(source.decision, 'revise')
    assert.equal(g.description, source.proposedDescriptionDe)
    assert.equal(g.descriptionEn, source.proposedDescriptionEn)
    const previousGoal = { ...g, title: source.currentTitleDe, titleEn: source.currentTitleEn, description: source.currentDescriptionDe, descriptionEn: source.currentDescriptionEn }
    assert.equal(a.fingerprint, fingerprint(previousGoal, a.ruleVersion), `${s.id}: old A binding`)
    assert.equal(m.fingerprint, fingerprint(previousGoal, m.ruleVersion), `${s.id}: old M binding`)
    assert.equal(k.sourceFingerprint, fingerprintSemanticKindSourceGoal(previousGoal), `${s.id}: old Kind binding`)
    assert.equal(a.status, 'atomic'); assert.equal(a.semanticAtomic, true)
    assert.equal(m.status, subject === 'math' ? 'no_memory_needed' : 'memory_required')
    assert.equal(k.semanticKind, 'curricularAtomic'); assert.deepEqual(g.contains, []); assert(!g.examData)
    const before = structuredClone({ atomicity: a, memory: m, kind: k })
    for (const [row, reason] of [[a, s.atomic], [m, s.memory]] as const) {
      row.fingerprint = fingerprint(g, row.ruleVersion)
      row.reviewedAt = date.slice(0, 10)
      row.reviewer = 'codex-b038r-b039-local-wording-individual-review'
      row.reason = reason + ' Individuelle aktuelle AI-Prüfung; keine menschliche Einzelabnahme behauptet.'
    }
    k.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
    receipt.changes.push({ goalId: s.id, canonicalPath: cp, sourceRecordIds: ['a', 'b'].map(round => exactlyOne(rounds[round], 'goalId', s.id).recordId), beforeText: { titleDe: source.currentTitleDe, titleEn: source.currentTitleEn, descriptionDe: source.currentDescriptionDe, descriptionEn: source.currentDescriptionEn }, afterText: { titleDe: g.title, titleEn: g.titleEn, descriptionDe: g.description, descriptionEn: g.descriptionEn }, before, after: structuredClone({ atomicity: a, memory: m, kind: k }), atomicityReason: s.atomic, memoryReason: s.memory })
  }
  files.get(ap)!.after = atoms.map(r => JSON.stringify(r)).join('\n') + '\n'
  files.get(mp)!.after = memories.map(r => JSON.stringify(r)).join('\n') + '\n'
  files.get(kp)!.after = JSON.stringify(kinds, null, 2) + '\n'
}
let patch = '*** Begin Patch\n'
for (const [path, { before, after }] of files) {
  assert.equal(read(path), before, 'Concurrent ledger drift')
  const a = before.split('\n'), b = after.split('\n')
  assert.equal(a.length, b.length)
  const changed = a.flatMap((line, i) => line === b[i] ? [] : [i])
  assert.equal(changed.length, path.includes('math') ? 4 : 1)
  patch += `*** Update File: ${path}\n`
  let cursor = 0
  while (cursor < changed.length) {
    const start = Math.max(0, changed[cursor] - 1)
    let end = Math.min(a.length, changed[cursor] + 2)
    while (cursor + 1 < changed.length && changed[cursor + 1] - 1 <= end) {
      cursor++
      end = Math.min(a.length, changed[cursor] + 2)
    }
    patch += '@@\n'
    for (let i = start; i < end; i++) patch += a[i] === b[i] ? ' ' + a[i] + '\n' : '-' + a[i] + '\n+' + b[i] + '\n'
    cursor++
  }
}
patch += `*** Add File: ${receiptPath}\n` + JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
process.stdout.write(patch)
