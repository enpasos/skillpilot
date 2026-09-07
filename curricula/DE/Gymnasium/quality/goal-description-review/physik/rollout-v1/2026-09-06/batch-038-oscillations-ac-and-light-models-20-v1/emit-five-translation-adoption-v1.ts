import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'

// Read-only patch emitter. It reads the current files at execution time and never writes them.
// The delegated agent applies stdout with apply_patch; root owns final reviews and image decisions.
const base = 'curricula/DE/Gymnasium/'
const batch = base + 'quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-038-oscillations-ac-and-light-models-20-v1/'
const ownBatchId = 'physik-rollout-v1-batch-038-oscillations-ac-and-light-models-20-v1-20260906-first-pass-a.batch-001'
const sourceReview = batch + 'round-a/results/' + ownBatchId + '.records.jsonl'
const sourceRun = batch + 'round-a/results/' + ownBatchId + '.run.json'
const sourceInput = batch + 'round-a/batches/' + ownBatchId + '.input.jsonl'
const helperPath = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-038-oscillations-ac-and-light-models-20-v1/emit-five-translation-adoption-v1.ts'
const receiptPath = batch + 'five-translation-adoption-receipt-v1.json'
const expectedReviewDigest = 'sha256:92bba37dd56674c16fb73c962b3030aceb9309d56c2662d1df39f561e7300c66'
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const jsonl = (value: string) => value.trimEnd().split('\n').map(line => JSON.parse(line))
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (value: any): string => Array.isArray(value) ? `[${value.map(stable).join(',')}]` : value && typeof value === 'object' ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, v]) => `${JSON.stringify(key)}:${stable(v)}`).join(',')}}` : JSON.stringify(value)
// Matches the native, non-exported semanticAtomicityReview/memoryCardReview fingerprint functions.
const fingerprint = (g: any, ruleVersion: string) => sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: normalize(g.title), titleEn: normalize(g.titleEn), description: normalize(g.description), descriptionEn: normalize(g.descriptionEn), phase: normalize(g.dimensionTags?.phase), area: normalize(g.dimensionTags?.area), topicCode: normalize(g.dimensionTags?.topicCode), nodeKind: normalize(g.nodeKind) }))

const specifications = [
  {
    "goalId": "5f97952e-5ac9-5749-94d0-d1dc50dda358",
    "expectedTitleDe": "Sinusfoermige Wechselgroessen mit Zeigerdiagrammen beschreiben",
    "expectedDescriptionDe": "Die lernende Person kann sinusfoermige Spannung und Stromstaerke in ohmschen Wechselstromkreisen mit Zeigerdiagrammen darstellen und Phasenbeziehungen fachlich deuten.",
    "titleEn": "Describe sinusoidal AC quantities using phasor diagrams",
    "descriptionEn": "The learner can represent sinusoidal voltage and current in resistive AC circuits using phasor diagrams and interpret their phase relationships in physical terms.",
    "atomicityReason": "Sinusförmige Spannung und Stromstärke werden im ausdrücklich ohmschen Kreis als zwei zusammengehörige Größen einer einzigen Zeigerdarstellung interpretiert. Zeichnen und Phasendeutung prüfen dieselbe Modellbeziehung; kapazitive oder induktive Phasenverschiebungen sowie allgemeine Netzwerkanalyse sind nicht Teil dieses Ziels.",
    "memoryReason": "Die geforderte Leistung ist die begründete Zuordnung zwischen Zeitverlauf und Zeigerlage im ohmschen Modell. Ein isolierter Merksatz zur Gleichphasigkeit ersetzt diese Darstellungskompetenz nicht; das Ziel setzt keinen zusätzlichen kompakten Abrufbestand voraus, der ein eigenes Memorydeck rechtfertigen würde.",
    "semanticKindReason": "Die prüfbare Darstellung und Deutung sinusförmiger Größen eines ohmschen Wechselstromkreises ist fachliche Inhaltskompetenz. Das unveränderte Blatt ohne contains oder examData ist weder Orientierung, Memoryziel noch terminaler Prüfungsauftrag."
  },
  {
    "goalId": "ef0f2391-fd8e-5ae3-ae86-7adcdd833c7a",
    "expectedTitleDe": "Kondensator und Spule im Wechselstromkreis analysieren",
    "expectedDescriptionDe": "Die lernende Person kann Amplitudenverhaeltnisse und Phasenbeziehungen zwischen Spannung und Stromstaerke fuer Kondensator und Spule im Wechselstromkreis aus differentiellen Zusammenhaengen erschliessen und mit Zeigerdiagrammen beschreiben.",
    "titleEn": "Analyze capacitors and inductors in AC circuits",
    "descriptionEn": "The learner can derive amplitude ratios and phase relationships between voltage and current for capacitors and inductors in AC circuits from differential relationships and describe them using phasor diagrams.",
    "atomicityReason": "Kondensator und Spule werden als komplementäre Fälle derselben Ableitung sinusförmiger Bauteilbeziehungen betrachtet. Amplitudenverhältnis, Phase und Zeigerbild sind gekoppelte Ergebnisse dieses einen Verfahrens; weder eigenständige komplexe Netzwerkanalyse noch ein vollständiger RLC-Schaltungsentwurf werden ergänzt.",
    "memoryReason": "Die Formulierung verlangt ausdrücklich das Erschließen aus differentiellen Zusammenhängen. Eine auswendig gelernte Vorlauf-/Nachlaufregel würde diese begründete Ableitung nicht nachweisen. Bauteilgrundlagen bleiben die vorhandenen Voraussetzungen; daraus entsteht kein zusätzlicher zielbezogener Abrufkanon für eine eigene Karte.",
    "semanticKindReason": "Das aus Bauteilgleichungen begründete Bestimmen der Wechselstrombeziehungen ist eine assessierbare curriculare Vergleichskompetenz. Der Bauteilvergleich macht das fachliche Blatt nicht zu einer Struktur-, Motivations-, Memory- oder Assessment-Einheit."
  },
  {
    "goalId": "e413a352-33c4-53ae-b54a-30e52c3e65ae",
    "expectedTitleDe": "Frequenzabhaengige Schaltungen und Filter untersuchen",
    "expectedDescriptionDe": "Die lernende Person kann das frequenzabhaengige Verhalten von Hochpass, Tiefpass, Bandpass oder Bandfilter experimentell oder rechnerisch untersuchen und graphisch darstellen.",
    "titleEn": "Investigate frequency-dependent circuits and filters",
    "descriptionEn": "The learner can investigate the frequency-dependent behavior of high-pass, low-pass, band-pass, or band filters experimentally or through calculation and represent it graphically.",
    "atomicityReason": "Die Filterarten sind durch das ausdrückliche oder alternative Fälle einer Frequenzgang-Untersuchung. Experiment oder Rechnung liefern Daten derselben Untersuchung, deren graphische Darstellung das Ergebnis ist; der Satz fordert nicht vier unabhängige Filterentwürfe.",
    "memoryReason": "Frequenzabhängiges Verhalten soll aus Messung oder Rechnung erschlossen und dargestellt werden. Das Wiedererkennen auswendig gelernter Filterkurven oder eine Formelliste ersetzt die Untersuchung nicht. Ein fester zusätzlicher Abrufbestand oder eigenes Deck ist für den unveränderten Kompetenzkern nicht erforderlich.",
    "semanticKindReason": "Die Untersuchung und Darstellung eines Frequenzgangs ist eine prüfbare fachliche Handlung an Schaltungen. Das Ziel ist kein bloßer Gliederungsknoten, Motivationsanker, Memorydeck oder terminales examData-Assessment."
  },
  {
    "goalId": "91f1838c-80fc-55f5-ac30-e7d1498fccee",
    "expectedTitleDe": "Rückkopplungsprinzip elektromagnetischer Schwingungen erklären",
    "expectedDescriptionDe": "Die lernende Person kann das Rückkopplungsprinzip zur Aufrechterhaltung elektromagnetischer Schwingungen fachlich erklären und auf einfache Oszillator- oder Senderkontexte beziehen.",
    "titleEn": "Explain feedback in electromagnetic oscillations",
    "descriptionEn": "The learner can explain the feedback principle for sustaining electromagnetic oscillations and relate it to simple oscillator or transmitter contexts.",
    "atomicityReason": "Das Rückkopplungsprinzip und seine Einordnung in einen einfachen Oszillator- oder Senderfall bilden eine einzige qualitative Systemerklärung. Die Anwendung konkretisiert diese Erklärung; selbstständiger Schaltungsentwurf, Senderbau oder allgemeine Stabilitätsanalyse werden nicht verlangt.",
    "memoryReason": "Die Kompetenz benötigt eine kausale Erklärung der passenden Rückführung und aufrechterhaltenen Schwingung im jeweiligen einfachen System. Eine isolierte Definition von Rückkopplung belegt diesen Zusammenhang nicht; ein neuer Formelkatalog oder kompakter Abrufbestand ist im Ziel nicht festgelegt.",
    "semanticKindReason": "Die fachlich begründete Erklärung der Schwingungserhaltung ist überprüfbare physikalische Inhaltskompetenz. Der technische Anwendungskontext begründet weder ein Memoryziel noch einen Orientierungs- oder terminalen Prüfungsknoten."
  },
  {
    "goalId": "122e83ac-c9cf-50c1-8a73-a1e3db347f21",
    "expectedTitleDe": "Modulation einer Trägerwelle fachlich beschreiben",
    "expectedDescriptionDe": "Die lernende Person kann Modulation einer Trägerwelle als Grundprinzip technischer Informationsübertragung beschreiben und mit elektromagnetischen Wellenanwendungen verbinden.",
    "titleEn": "Describe modulation of a carrier wave",
    "descriptionEn": "The learner can describe modulation of a carrier wave as a basic principle of technical information transmission and relate it to applications of electromagnetic waves.",
    "atomicityReason": "Die Trägerwellenmodulation wird als ein zusammenhängendes Informationsübertragungsprinzip beschrieben und an Anwendungen konkretisiert. Die Anwendungsbeziehung ist ein Beleg desselben Grundprinzips; eine vollständige Analyse sämtlicher Modulationsverfahren oder Demodulatorschaltungen wird nicht ergänzt.",
    "memoryReason": "Erforderlich ist die begründete Unterscheidung von Information, Träger und verändertem Trägermerkmal an Anwendungen. Das Auswendiglernen von Modulationskürzeln würde diese Beschreibung nicht tragen; das Ziel fordert keinen eigenen festen Recall-Kanon und kein zusätzliches Memorydeck.",
    "semanticKindReason": "Die Beschreibung der Informationsübertragung durch eine Trägerwelle ist fachlich assessierbare curriculare Kompetenz. Das aktuelle Blatt ohne Strukturkinder oder examData ist weder Motivationsanker noch SRS-Ziel oder terminaler Prüfungsauftrag."
  }
]

assert.equal(specifications.length, 5)
assert.equal(new Set(specifications.map(s => s.goalId)).size, 5)
assert.ok(!specifications.some(s => s.goalId === '2825b528-00ee-52d0-870e-686890cb1195'), 'Held goal is outside this repair')
assert.equal(existsSync(receiptPath), false, 'Adoption receipt already exists; do not replay')
const paths = [base + 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', base + 'quality/release-model/physik.semantic-kinds.json', base + 'quality/semantic-atomicity/canonical-physics-full.review.jsonl', base + 'quality/memory-card-review/canonical-physics-full.review.jsonl']
const originals = paths.map(path => readFileSync(path, 'utf8'))
const canonical = JSON.parse(originals[0]), kinds = JSON.parse(originals[1])
const atomic = jsonl(originals[2]), memory = jsonl(originals[3])
const serialize = () => [JSON.stringify(canonical, null, 2) + '\n', JSON.stringify(kinds, null, 2) + '\n', atomic.map(row => JSON.stringify(row)).join('\n') + '\n', memory.map(row => JSON.stringify(row)).join('\n') + '\n']
assert.deepEqual(serialize(), originals, 'Nonstandard existing formatting: refuse to reformat unrelated content')
const completeBefore = structuredClone({ canonical, kinds, atomic, memory })
const sourceRecordLines = readFileSync(sourceReview, 'utf8').trimEnd().split('\n')
const reviewed = sourceRecordLines.map(line => JSON.parse(line))
const input = jsonl(readFileSync(sourceInput, 'utf8'))
const run = JSON.parse(readFileSync(sourceRun, 'utf8'))
assert.equal(sha(readFileSync(sourceReview)), expectedReviewDigest)
assert.equal(run.outputDigest, expectedReviewDigest)
assert.equal(run.batchInputFingerprint, sha(readFileSync(sourceInput)))
assert.equal(run.batchId, ownBatchId)
assert.equal(run.status, 'completed')
const sourceArtifacts = [sourceReview, sourceRun, sourceInput, helperPath].map(path => ({ path, sha256: sha(readFileSync(path)) }))
const recordedAt = new Date().toISOString()
const changes: any[] = []
const unique = (rows: any[], key: string, goalId: string) => {
  const matches = rows.filter(row => row[key] === goalId)
  assert.equal(matches.length, 1, `Missing or duplicate ${key}: ${goalId}`)
  return matches[0]
}

for (const specification of specifications) {
  const g = unique(canonical.goals, 'id', specification.goalId), r = unique(reviewed, 'goalId', specification.goalId)
  const a = unique(atomic, 'goalId', specification.goalId), m = unique(memory, 'goalId', specification.goalId), k = unique(kinds.decisions, 'goalId', specification.goalId)
  const bound = unique(input.map(row => row.goal), 'goalId', specification.goalId)
  assert.equal(g.title, specification.expectedTitleDe)
  assert.equal(g.description, specification.expectedDescriptionDe)
  assert.equal(g.titleEn, g.title, 'Only missing EN titles stored as exact DE copies may be repaired')
  assert.equal(g.descriptionEn, g.description, 'Only missing EN descriptions stored as exact DE copies may be repaired')
  assert.equal(r.decision, 'revise'); assert.equal(r.recordStatus, 'candidate'); assert.equal(r.reviewAuthority, 'ai_candidate')
  for (const [field, current] of [['title', 'currentTitleDe'], ['titleEn', 'currentTitleEn'], ['description', 'currentDescriptionDe'], ['descriptionEn', 'currentDescriptionEn']]) {
    assert.equal(g[field], r[current], `Current text drift: ${specification.goalId}/${field}`)
    assert.equal(r[current], bound[current])
  }
  assert.equal(r.proposedDescriptionDe, g.description)
  assert.equal(r.proposedDescriptionEn, specification.descriptionEn)
  assert.ok(r.rationale.includes(specification.titleEn), 'Exact proposed EN title must occur in bound round-A rationale')
  assert.ok(specification.titleEn !== g.title && specification.descriptionEn !== g.description)
  assert.equal(a.status, 'atomic'); assert.equal(a.semanticAtomic, true)
  assert.equal(m.status, 'no_memory_needed'); assert.equal(m.memoryUseful, false)
  assert.equal(a.fingerprint, fingerprint(g, a.ruleVersion))
  assert.equal(m.fingerprint, fingerprint(g, m.ruleVersion))
  assert.equal(k.semanticKind, 'curricularAtomic')
  assert.equal(k.sourceFingerprint, fingerprintSemanticKindSourceGoal(g))
  assert.deepEqual(g.contains ?? [], [])
  assert.ok(!g.examData)
  assert.ok(!(g.tags ?? []).some((tag: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(tag) || tag.startsWith('srs-deck:')))
  const before = structuredClone(g), bindingsBefore = structuredClone({ atomicity: a, memory: m, semanticKind: k })
  g.titleEn = specification.titleEn
  g.descriptionEn = r.proposedDescriptionEn
  const reverted = structuredClone(g)
  for (const field of ['titleEn', 'descriptionEn']) reverted[field] = before[field]
  assert.deepEqual(reverted, before, 'Unexpected change outside the two English text fields')
  k.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
  assert.deepEqual({ ...k, sourceFingerprint: bindingsBefore.semanticKind.sourceFingerprint }, bindingsBefore.semanticKind, 'Semantic-kind classification and authority must remain unchanged')
  for (const [record, prior, reason] of [[a, bindingsBefore.atomicity, specification.atomicityReason], [m, bindingsBefore.memory, specification.memoryReason]]) {
    record.fingerprint = fingerprint(g, record.ruleVersion)
    record.reviewedAt = recordedAt.slice(0, 10)
    record.reviewer = 'codex-physics-b038-five-translation-adoption'
    record.reason = 'Erneute individuelle fachliche AI-Prüfung der aktuellen DE/EN-Fassung: ' + reason + ' AI-Kandidatenprüfung; keine menschliche Einzelabnahme behauptet.'
    const restored = structuredClone(record)
    for (const field of ['fingerprint', 'reviewedAt', 'reviewer', 'reason']) restored[field] = prior[field]
    assert.deepEqual(restored, prior, 'Unexpected A/M ledger field change')
  }
  const changedCanonicalFields = Object.keys(g).filter(field => JSON.stringify(g[field]) !== JSON.stringify(before[field]))
  assert.deepEqual([...changedCanonicalFields].sort(), ['descriptionEn', 'titleEn'])
  changes.push({ goalId: g.id, before, after: structuredClone(g), changedCanonicalFields, reviewRecordId: r.recordId, reviewRecordLineSha256: sha(sourceRecordLines[reviewed.indexOf(r)] + '\n'), goalBeforeSha256: sha(JSON.stringify(before)), goalAfterSha256: sha(JSON.stringify(g)), bindingsBefore, bindingsAfter: structuredClone({ atomicity: a, memory: m, semanticKind: k }), individualReassessment: { atomicityReason: specification.atomicityReason, memoryReason: specification.memoryReason, semanticKindReason: specification.semanticKindReason, authority: 'ai_candidate', humanApprovalClaimed: false }, visualizationHandoff: 'Preserve the current resourceLinks and all image/QA bindings exactly as read at emission. This translation does not issue, repeat or certify image approval; root owns the independent image review.' })
}

const completeReverted = structuredClone({ canonical, kinds, atomic, memory })
for (const change of changes) {
  Object.assign(unique(completeReverted.canonical.goals, 'id', change.goalId), change.before)
  Object.assign(unique(completeReverted.kinds.decisions, 'goalId', change.goalId), change.bindingsBefore.semanticKind)
  Object.assign(unique(completeReverted.atomic, 'goalId', change.goalId), change.bindingsBefore.atomicity)
  Object.assign(unique(completeReverted.memory, 'goalId', change.goalId), change.bindingsBefore.memory)
}
assert.deepEqual(completeReverted, completeBefore, 'Unexpected changes outside the exact five goals and their native bindings')
const outputs = serialize()
let patch = '*** Begin Patch\n'
for (const [i, path] of paths.entries()) {
  const previous = originals[i].split('\n'), next = outputs[i].split('\n')
  assert.equal(previous.length, next.length, 'Unexpected formatting change: ' + path)
  const changed = previous.flatMap((line, n) => line === next[n] ? [] : [n])
  assert.equal(changed.length, i === 0 ? 10 : 5, 'Unexpected number of changed lines: ' + path)
  patch += `*** Update File: ${path}\n`
  let cursor = 0
  while (cursor < changed.length) {
    const start = Math.max(0, changed[cursor] - 2)
    let end = Math.min(previous.length, changed[cursor] + 3)
    while (cursor + 1 < changed.length && changed[cursor + 1] < end + 2) { cursor++; end = Math.min(previous.length, changed[cursor] + 3) }
    patch += '@@\n'
    for (let n = start; n < end; n++) patch += previous[n] === next[n] ? ' ' + previous[n] + '\n' : '-' + previous[n] + '\n+' + next[n] + '\n'
    cursor++
  }
}
const receipt = { schemaVersion: 1, artifactType: 'physics-b038-five-translation-adoption-v1', recordedAt, authority: { execution: 'codex_ai_agent', reviewAuthority: 'ai_candidate', humanApprovalClaimed: false, scopeDirection: 'Root-authorized repair of exactly five missing English titles/descriptions. Keep every German canonical field byte-for-byte, including ASCII umlaut spellings and U-I typography. Adopt exact round-A English title proposals from their rationale and exact proposedDescriptionEn; preserve proposedDescriptionDe unchanged. Final independent post-revision review remains required.' }, sourceArtifacts, changes, fileDigests: paths.map((path, i) => ({ path, beforeSha256: sha(originals[i]), afterSha256: sha(outputs[i]) })), recovery: 'Receipt preserves exact before/after goal objects and all three native binding records for each of the five goals. Restore only the scoped fields after verifying their after state; retain independent later image/resourceLink changes and never revert entire files blindly.', boundaries: ['Only ten canonical EN fields change: five titles and five descriptions. Every other canonical field, every goal count and order, and all unrelated goals remain byte-identical.', 'Five atomicity and five no_memory_needed decisions were individually re-evaluated with explicit AI-only attribution. Their statuses remain unchanged; only fingerprint, date, reviewer and reason change.', 'Five semantic-kind source fingerprints are refreshed with the native function. Existing classifications, decisionStatus and decisionBasis remain unchanged; no new human authority is claimed.', 'No graph, ID, applicability, source mapping, mastery, deck/card, image bytes, image-QA, resourceLink, central registry, in-flight, book, generated report or runtime-contract changes.', 'All other goals and existing holds are excluded. Review records and author candidates remain immutable; root owns current-state synthesis, image review, quality regeneration and M6 floor validation.'] }
patch += `*** Add File: ${receiptPath}\n` + JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
// Refuse emission if any read source changed during this run; execute again against the fresh state.
for (const [i, path] of paths.entries()) assert.equal(readFileSync(path, 'utf8'), originals[i], 'Concurrent file drift: ' + path)
for (const artifact of sourceArtifacts) assert.equal(sha(readFileSync(artifact.path)), artifact.sha256, 'Concurrent source drift: ' + artifact.path)
assert.equal(existsSync(receiptPath), false, 'Adoption receipt was created concurrently')
process.stdout.write(patch)
