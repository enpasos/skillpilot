import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'

// Read-only exact-six patch emitter. apply_patch owns every filesystem write.
// --verify checks the emitted receipt/current native bindings without writing or reading P profiles.
const base = 'curricula/DE/Gymnasium/'
const batch = base + 'quality/goal-description-review/physik/rollout-v1/2026-09-07/batch-040-gravitation-and-cosmology-20-v1/'
const helperPath = batch + 'emit-six-description-precision-adoption-v1.ts'
const receiptPath = batch + 'six-description-precision-adoption-receipt-v1.json'
const ownBatchId = 'physik-rollout-v1-batch-040-gravitation-and-cosmology-20-v1-20260907-first-pass-a.batch-001'
const sourceInput = batch + 'round-a/batches/' + ownBatchId + '.input.jsonl'
const sourceReview = batch + 'round-a/results/' + ownBatchId + '.records.jsonl'
const sourceRun = batch + 'round-a/results/' + ownBatchId + '.run.json'
const paths = [
  base + 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
  base + 'quality/semantic-atomicity/canonical-physics-full.review.jsonl',
  base + 'quality/memory-card-review/canonical-physics-full.review.jsonl',
  base + 'quality/release-model/physik.semantic-kinds.json',
]
const cardLedgerPath = base + 'quality/memory-card-review/canonical-physics-full.cards.review.jsonl'
const deckPaths = ['de', 'en'].map(lang => base + 'memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.' + lang + '.json')
const kindSchemaPath = 'contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const jsonl = (value: string) => value.trimEnd().split('\n').map(line => JSON.parse(line))
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (value: any): string => Array.isArray(value) ? '[' + value.map(stable).join(',') + ']' : value && typeof value === 'object' ? '{' + Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => JSON.stringify(k) + ':' + stable(v)).join(',') + '}' : JSON.stringify(value)
// Exact native A/M payload; native CLI checks independently recalculate it after adoption.
const fingerprint = (g: any, ruleVersion: string) => sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: normalize(g.title), titleEn: normalize(g.titleEn), description: normalize(g.description), descriptionEn: normalize(g.descriptionEn), phase: normalize(g.dimensionTags?.phase), area: normalize(g.dimensionTags?.area), topicCode: normalize(g.dimensionTags?.topicCode), nodeKind: normalize(g.nodeKind) }))
const unique = (rows: any[], key: string, id: string) => {
  const matches = rows.filter(row => row[key] === id)
  assert.equal(matches.length, 1, 'Missing or duplicate ' + key + ': ' + id)
  return matches[0]
}
const specifications = [
  {
    goalId: '594f7f21-6b8a-531c-8424-5f1dcbaf0f23',
    description: 'Die lernende Person kann potenzielle Energie über ein Potential beschreiben, einfache Fälle etwa im Gravitationsfeld berechnen und erläutern, wie Lage und gewähltes Nullniveau den Energiewert bestimmen, während Energiedifferenzen vom Nullniveau unabhängig sind.',
    descriptionEn: 'The learner can describe potential energy in terms of a potential, calculate simple cases such as a gravitational field, and explain how position and the chosen zero level determine its value while energy differences are independent of that zero level.',
    memoryStatus: 'memory_required', cardId: 'physics_e_cov_051',
    atomicityReason: 'Potential, potenzielle Energie und Nullniveau beschreiben dieselbe energiebezogene Modellbeziehung E_pot = m Phi. Das Berechnen eines einfachen Falls und das Begründen der unveränderten Energiedifferenz bei verschobenem Nullniveau sind zwei Nachweise dieses Zusammenhangs, keine unabhängigen Feldtheorien. Eine allgemeine Bezugssystemtransformation oder eine vollständige Potentialtheorie ist nicht verlangt.',
    memoryReason: 'Die tatsächlich gelesene DE/EN-Karte physics_e_cov_051 enthält ausschließlich E_pot = m Phi und die Zuordnung von Masse, Potential und Energie. Dieser kompakte Definitionszusammenhang bleibt als eng begrenzter Abrufbaustein erforderlich; Lageabhängigkeit, frei wählbares Nullniveau und die Invarianz von Energiedifferenzen müssen weiterhin erklärt und angewendet werden. Die bestehende Verknüpfung mit dem Mechanikdeck bleibt unverändert; die Karte behauptet keine vollständige Verständnisabdeckung.',
    semanticKindReason: 'Die Berechnung und begründete Interpretation potenzieller Energie ist überprüfbare fachliche Inhaltskompetenz; weder die Verknüpfung zu einer Formelkarte noch das Erklären eines Modells macht dieses gewöhnliche Blatt zu einem Memory- oder Orientierungsknoten.',
  },
  {
    goalId: '60211ac1-cbe1-5182-87ef-673a068c5b0a',
    description: 'Die lernende Person kann Planetenbewegungen im Gravitationsfeld qualitativ beschreiben und erläutern, wie die Gravitation den Geschwindigkeitsvektor verändert und auf Kreisbahnen die Zentripetalkraft liefert.',
    descriptionEn: 'The learner can qualitatively describe planetary motion in a gravitational field and explain how gravity changes the velocity vector and provides the centripetal force on circular orbits.',
    memoryStatus: 'memory_required', cardId: 'physics_e_cov_052',
    atomicityReason: 'Der gemeinsame Kompetenzkern ist die qualitative Kraft-Bewegungs-Erklärung einer gravitativen Umlaufbahn. Die Veränderung des Geschwindigkeitsvektors trägt diese Erklärung; die Kreisbahn konkretisiert sie als Spezialfall mit radialer Zentripetalkraft. Unabhängige Kepler-Rechnungen oder allgemeine Bahnlösungen werden nicht ergänzt.',
    memoryReason: 'Die DE/EN-Karte physics_e_cov_052 fragt ausdrücklich nach der Kreisbahnbedingung und gibt GMm/r² = mv²/r an. Die neue Beschreibung begrenzt genau diese Zentripetalzuordnung auf Kreisbahnen; die kompakte Beziehung bleibt daher passend und eng begrenzt erforderlich. Sie ersetzt weder die Vektordeutung noch die qualitative Erklärung nichtkreisförmiger Umlaufbahnen; keine zusätzliche Kraft neben der Gravitation ist gemeint.',
    semanticKindReason: 'Die kausale Deutung von Planetenbewegung anhand der Gravitationskraft ist assessierbare physikalische Inhaltskompetenz. Das gewöhnliche Blatt ist keine Struktur, keine Motivation, kein Memorydeck und kein terminales Assessment.',
  },
  {
    goalId: '89cadf81-143b-5f6b-82bd-29ba20d92a1b',
    description: 'Die lernende Person kann aus der Skalierung der Bewegungsgleichung im Newtonschen Gravitationsfeld bei gleicher Zentralmasse und geometrisch ähnlichen Bahnen ohne explizite Bahnrechnung den Zusammenhang $T^2 \\propto a^3$ zwischen Umlaufzeit $T$ und großer Halbachse $a$ herleiten.',
    descriptionEn: 'The learner can derive the relationship $T^2 \\propto a^3$ between orbital period $T$ and semimajor axis $a$ by scaling the equation of motion in a Newtonian gravitational field for the same central mass and geometrically similar orbits, without explicitly calculating an orbit.',
    memoryStatus: 'memory_required', cardId: 'physics_e_cov_055',
    atomicityReason: 'Das Ziel verlangt genau eine Herleitung durch Skalierung: Aus r -> lambda r folgt bei unveränderter Zentralmasse die Zeitskalierung lambda^(3/2) und damit T² proportional a³. Gleiche Zentralmasse und geometrische Ähnlichkeit begrenzen das Argument; weder das Lösen der Bahn-Differentialgleichung noch eine zweite unabhängige Gesetzesherleitung gehört dazu.',
    memoryReason: 'Die gelesene DE/EN-Karte physics_e_cov_055 hält T² proportional a³ sowie T als Umlaufzeit und a als große Halbachse fest. Die präzisierte Beschreibung stimmt insbesondere mit der bereits richtigen Halbachsenbedeutung der Karte überein. Dieser kompakte Gesetzes- und Notationsabruf bleibt erforderlich; die Skalierungsherleitung und ihre Bedingungen sind eigenständige Verständnisleistung am selben Inhaltsziel und werden nicht durch Aufsagen der Karte ersetzt.',
    semanticKindReason: 'Das eigenständige Herleiten einer physikalischen Skalierungsrelation ist eine curriculare mathematisch-physikalische Inhaltskompetenz. Das Blatt bleibt curricularAtomic; die zugeordnete Merkkarte ist nur eine ergänzende andere Lernform.',
  },
  {
    goalId: '206fe51d-cc78-5422-b139-32cc97eb1c37',
    description: 'Die lernende Person kann Sterne anhand ihrer Leuchtkraft und Oberflächentemperatur im Hertzsprung-Russell-Diagramm einordnen und die Bereiche Hauptreihe, Rote Riesen und Weiße Zwerge im Zusammenhang mit der Sternentwicklung deuten.',
    descriptionEn: 'The learner can place stars in the Hertzsprung–Russell diagram using their luminosity and surface temperature and interpret the main-sequence, red-giant and white-dwarf regions in relation to stellar evolution.',
    memoryStatus: 'no_memory_needed',
    atomicityReason: 'Einordnen und Deuten betreffen dieselbe zweidimensionale Zustandsdarstellung der Sterne. Hauptreihe, Riesen und Zwerge sind die zu interpretierenden Bereiche dieses Diagramms, keine drei selbstständigen Sternmodelle. Ein HRD-Fall mit mehreren Sternpunkten kann Platzierung und entwicklungsbezogene Interpretation gemeinsam prüfen; ein vollständiger Entwicklungszyklus jeder Sternmasse wird nicht gefordert.',
    memoryReason: 'Gefordert ist das Lesen und begründete Interpretieren eines HRD anhand von Leuchtkraft und Oberflächentemperatur. Die Regionen können im Arbeitsdiagramm bezeichnet sein; ein isolierter Abruf der drei Namen würde die Zuordnung und Entwicklungsaussage nicht belegen. Für diesen neuen handlungsbezogenen Wortlaut entsteht kein zusätzlicher harter Abrufbestand und kein eigenes Deck.',
    semanticKindReason: 'Die Platzierung konkreter Sternzustände und die Interpretation ihrer Diagrammregion sind prüfbare curriculare Inhaltsleistungen. Der Methodenbezug macht das Ziel weder zu bloßer Taxonomie noch zum Strukturknoten.',
  },
  {
    goalId: 'aa0fa5fb-7bfb-5f9f-a606-3f7187cfb745',
    description: 'Die lernende Person kann kosmologische Rotverschiebungen aus Spektraldaten berechnen, sie mithilfe vorgegebener einfacher Modelle mit der Expansion des Universums verknüpfen und die dabei verwendeten Näherungen erläutern.',
    descriptionEn: 'The learner can calculate cosmological redshifts from spectral data, relate them to the expansion of the universe using supplied simple models, and explain the approximations used.',
    memoryStatus: 'no_memory_needed',
    atomicityReason: 'Messgröße, Modellschluss und Näherungsprüfung bilden eine zusammenhängende Daten-Modell-Auswertung: Spektrallinien liefern z, ein vorgegebenes einfaches Modell verbindet z mit Expansion, und seine Gültigkeit begrenzt die Aussage. Dies ist kein Katalog unabhängiger kosmologischer Theorien; komplexe Expansionsdynamik, Dunkle Materie und Dunkle Energie werden nicht neu verlangt.',
    memoryReason: 'Die Modelle sind ausdrücklich vorgegeben. Entscheidend sind die begründete Zuordnung von Spektraldaten, Rotverschiebung und Modellfolgerung sowie das Erläutern einer Näherung, nicht das Reproduzieren eines kosmologischen Formelkatalogs. Der konservative Status no_memory_needed bleibt ohne neue Karten oder Decks angemessen.',
    semanticKindReason: 'Die datenbasierte Berechnung und physikalisch begrenzte Modellinterpretation ist überprüfbare Inhaltskompetenz. Das Ziel bleibt ein gewöhnliches curriculares Blatt und ist keine wissenschaftliche Orientierung oder abschließende Prüfungsaufgabe.',
  },
  {
    goalId: '14d99a65-8d58-5647-88ab-02137b96d55b',
    description: 'Die lernende Person kann Gravitation qualitativ als Wirkung der durch Masse geprägten Raumzeitgeometrie erläutern und Schwarze Löcher mithilfe des Begriffs Ereignishorizont in diese Beschreibung einordnen.',
    descriptionEn: 'The learner can qualitatively explain gravity in terms of spacetime geometry shaped by mass and place black holes within this description using the concept of an event horizon.',
    memoryStatus: 'no_memory_needed',
    atomicityReason: 'Der Kompetenzkern ist eine qualitative geometrische Gravitationserklärung. Das Schwarze Loch wird ausdrücklich innerhalb derselben Beschreibung anhand des Ereignishorizonts eingeordnet und nicht als separate umfassende Astrophysiktheorie angehängt. Metriken, Feldgleichungen, Hawking-Strahlung oder quantitative Horizontberechnung werden nicht verlangt.',
    memoryReason: 'Der Begriff Ereignishorizont soll in einer kohärenten Erklärung des Schwarzen Lochs verwendet werden; bloßes Auswendiglernen seiner Definition würde die geometrische Einordnung nicht belegen. Die qualitative, kontextgebundene Erklärung rechtfertigt hier keinen neuen eigenständigen Abrufkanon; bestehend no_memory_needed bleibt angemessen.',
    semanticKindReason: 'Die erklärbare Modellbeziehung zwischen Masse, Raumzeit und gravitativer Wirkung mit eingeordnetem Ereignishorizont ist eine qualitative fachliche Inhaltskompetenz, kein unverbindlicher Motivationstext und kein SRS-Ziel.',
  },
]
assert.equal(specifications.length, 6)
assert.equal(new Set(specifications.map(s => s.goalId)).size, 6)
const originals = paths.map(path => readFileSync(path, 'utf8'))
const canonical = JSON.parse(originals[0]), atomic = jsonl(originals[1]), memory = jsonl(originals[2]), kinds = JSON.parse(originals[3])
const serialize = () => [JSON.stringify(canonical, null, 2) + '\n', atomic.map(r => JSON.stringify(r)).join('\n') + '\n', memory.map(r => JSON.stringify(r)).join('\n') + '\n', JSON.stringify(kinds, null, 2) + '\n']
assert.deepEqual(serialize(), originals, 'Refuse unrelated reformatting')
const appRequire = createRequire(resolve('app/package.json'))
const Ajv2020 = appRequire('ajv/dist/2020.js').default
const addFormats = appRequire('ajv-formats').default
const ajv = new Ajv2020({ allErrors: true, strict: true }); addFormats(ajv)
const validateKindSchema = ajv.compile(JSON.parse(readFileSync(kindSchemaPath, 'utf8')))
const checkKinds = () => {
  assert.ok(validateKindSchema(kinds), ajv.errorsText(validateKindSchema.errors))
  assert.equal(kinds.sourceLandscapePath, paths[0])
  assert.equal(kinds.sourceLandscapeId, canonical.landscapeId)
  assert.equal(kinds.sourceFingerprintContractId, 'semantic-kind-source-fingerprint-v1')
  assert.equal(kinds.decisions.length, canonical.goals.length)
  assert.equal(kinds.counts.total, canonical.goals.length)
  const counts: Record<string, number> = {}
  for (const g of canonical.goals) {
    const k = unique(kinds.decisions, 'goalId', g.id)
    assert.equal(k.sourceFingerprint, fingerprintSemanticKindSourceGoal(g), 'Stale K: ' + g.id)
    assert.equal(k.decisionStatus, 'authoritative')
    counts[k.semanticKind] = (counts[k.semanticKind] ?? 0) + 1
  }
  for (const [kind, count] of Object.entries(kinds.counts)) if (kind !== 'total') assert.equal(count, counts[kind] ?? 0)
}
if (process.argv.includes('--verify')) {
  const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'))
  assert.equal(receipt.changes.length, 6)
  for (const binding of receipt.fileDigests) assert.equal(sha(readFileSync(binding.path)), binding.afterSha256, 'Post-adoption file drift: ' + binding.path)
  for (const artifact of receipt.sourceArtifacts) assert.equal(sha(readFileSync(artifact.path)), artifact.sha256, 'Preserved source drift: ' + artifact.path)
  for (const change of receipt.changes) {
    const g = unique(canonical.goals, 'id', change.goalId)
    assert.deepEqual(g, change.after)
    const a = unique(atomic, 'goalId', g.id), m = unique(memory, 'goalId', g.id)
    assert.deepEqual(a, change.bindingsAfter.atomicity); assert.deepEqual(m, change.bindingsAfter.memory)
    assert.equal(a.fingerprint, fingerprint(g, a.ruleVersion)); assert.equal(m.fingerprint, fingerprint(g, m.ruleVersion))
  }
  checkKinds()
  console.log('Exact-six adoption receipt PASS; native K schema and fingerprint bindings PASS: ' + canonical.goals.length + '; scoped A/M bindings PASS: 6')
  process.exit(0)
}
assert.equal(existsSync(receiptPath), false, 'Receipt exists; no replay')
checkKinds()
const completeBefore = structuredClone({ canonical, atomic, memory, kinds })
const sourceRecordLines = readFileSync(sourceReview, 'utf8').trimEnd().split('\n'), reviews = sourceRecordLines.map(line => JSON.parse(line))
const input = jsonl(readFileSync(sourceInput, 'utf8')), run = JSON.parse(readFileSync(sourceRun, 'utf8'))
assert.equal(sha(readFileSync(sourceReview)), 'sha256:3d0b4ea4f52a4d7038df88e39a82f574fe0486aa653ec6a99dfbc0707ce2bcb0')
assert.equal(run.outputDigest, sha(readFileSync(sourceReview))); assert.equal(run.batchInputFingerprint, sha(readFileSync(sourceInput)))
assert.equal(run.batchId, ownBatchId); assert.equal(run.status, 'completed')
const cards = jsonl(readFileSync(cardLedgerPath, 'utf8')), decks = deckPaths.map(path => JSON.parse(readFileSync(path, 'utf8')))
const sourceArtifacts = [sourceReview, sourceRun, sourceInput, helperPath, cardLedgerPath, ...deckPaths, kindSchemaPath, 'app/scripts/semanticAtomicityReview.ts', 'app/scripts/memoryCardReview.ts', 'app/scripts/goalBookModel.ts'].map(path => ({ path, sha256: sha(readFileSync(path)) }))
const recordedAt = new Date().toISOString()
const changes: any[] = []
for (const s of specifications) {
  const g = unique(canonical.goals, 'id', s.goalId), a = unique(atomic, 'goalId', s.goalId), m = unique(memory, 'goalId', s.goalId), k = unique(kinds.decisions, 'goalId', s.goalId)
  const bound = unique(input.map(row => row.goal), 'goalId', s.goalId), r = unique(reviews, 'goalId', s.goalId)
  for (const [field, current] of [['title', 'currentTitleDe'], ['titleEn', 'currentTitleEn'], ['description', 'currentDescriptionDe'], ['descriptionEn', 'currentDescriptionEn']]) {
    assert.equal(g[field], bound[current], 'Canonical/bound drift: ' + s.goalId + '/' + field)
    assert.equal(r[current], bound[current], 'Review/bound drift: ' + s.goalId + '/' + field)
  }
  assert.equal(a.status, 'atomic'); assert.equal(a.semanticAtomic, true)
  assert.equal(m.status, s.memoryStatus); assert.equal(m.memoryUseful, s.memoryStatus === 'memory_required')
  assert.equal(a.fingerprint, fingerprint(g, a.ruleVersion)); assert.equal(m.fingerprint, fingerprint(g, m.ruleVersion))
  assert.equal(k.semanticKind, 'curricularAtomic')
  assert.deepEqual(g.contains ?? [], []); assert.ok(!g.examData)
  assert.ok(!(g.tags ?? []).some((tag: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(tag) || tag.startsWith('srs-deck:')))
  const linkedCards = cards.filter(card => (card.originGoalIds ?? []).includes(g.id))
  if (s.cardId) {
    assert.deepEqual(m.memoryGoalIds, ['9f2f5ab8-0ae4-5792-b831-82a05af5895c'])
    assert.deepEqual(m.deckIds, ['de_gymnasium_physics_mechanics_ephase'])
    assert.deepEqual(linkedCards.map(card => card.cardId), [s.cardId])
    assert.equal(linkedCards[0].status, 'kept'); assert.equal(linkedCards[0].necessary, true)
    for (const deck of decks) {
      assert.equal(deck.deckId, m.deckIds[0])
      const card = unique(deck.cards, 'id', s.cardId)
      assert.ok(card.tags.includes('goal:' + g.id))
    }
  } else {
    assert.deepEqual(m.memoryGoalIds ?? [], []); assert.deepEqual(m.deckIds ?? [], []); assert.deepEqual(linkedCards, [])
  }
  const before = structuredClone(g), bindingsBefore = structuredClone({ atomicity: a, memory: m, semanticKind: k })
  g.description = s.description; g.descriptionEn = s.descriptionEn
  assert.deepEqual(Object.keys(g).filter(field => JSON.stringify(g[field]) !== JSON.stringify(before[field])).sort(), ['description', 'descriptionEn'])
  k.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
  assert.deepEqual({ ...k, sourceFingerprint: bindingsBefore.semanticKind.sourceFingerprint }, bindingsBefore.semanticKind)
  for (const [record, prior, reason] of [[a, bindingsBefore.atomicity, s.atomicityReason], [m, bindingsBefore.memory, s.memoryReason]]) {
    record.fingerprint = fingerprint(g, record.ruleVersion)
    record.reviewedAt = recordedAt.slice(0, 10)
    record.reviewer = 'codex-physics-b040-six-description-precision'
    record.reason = 'Erneute individuelle fachliche AI-Prüfung der freigegebenen DE/EN-Präzisierung: ' + reason + ' AI-Kandidatenprüfung; keine menschliche Einzelabnahme behauptet.'
    const reverted = structuredClone(record)
    for (const field of ['fingerprint', 'reviewedAt', 'reviewer', 'reason']) reverted[field] = prior[field]
    assert.deepEqual(reverted, prior, 'No status, card/deck link or other ledger field may change')
  }
  changes.push({ goalId: g.id, before, after: structuredClone(g), changedCanonicalFields: ['description', 'descriptionEn'], goalBeforeSha256: sha(JSON.stringify(before)), goalAfterSha256: sha(JSON.stringify(g)), sourceReviewRecordId: r.recordId, sourceReviewRecordLineSha256: sha(sourceRecordLines[reviews.indexOf(r)] + '\n'), adoptionBasis: 'Exact DE/EN wording explicitly supplied by root for this bounded authoring task; not represented as verbatim adoption of an old reviewer proposal.', bindingsBefore, bindingsAfter: structuredClone({ atomicity: a, memory: m, semanticKind: k }), individualReassessment: { atomicityReason: s.atomicityReason, memoryReason: s.memoryReason, semanticKindReason: s.semanticKindReason, authority: 'ai_candidate', humanApprovalClaimed: false }, preservedMemoryEvidence: { cardLedgerRecords: linkedCards, cardsByLanguage: s.cardId ? decks.map((deck, i) => ({ path: deckPaths[i], deckId: deck.deckId, card: unique(deck.cards, 'id', s.cardId!) })) : [] } })
}
checkKinds()
const reverted = structuredClone({ canonical, atomic, memory, kinds })
for (const change of changes) {
  Object.assign(unique(reverted.canonical.goals, 'id', change.goalId), change.before)
  Object.assign(unique(reverted.atomic, 'goalId', change.goalId), change.bindingsBefore.atomicity)
  Object.assign(unique(reverted.memory, 'goalId', change.goalId), change.bindingsBefore.memory)
  Object.assign(unique(reverted.kinds.decisions, 'goalId', change.goalId), change.bindingsBefore.semanticKind)
}
assert.deepEqual(reverted, completeBefore, 'Unexpected changes outside the exact-six scope')
const outputs = serialize()
const receipt = { schemaVersion: 1, artifactType: 'physics-b040-six-description-precision-adoption-v1', recordedAt, authority: { execution: 'codex_ai_agent', provider: 'OpenAI', model: 'unknown', modelVersion: 'unknown', reviewAuthority: 'ai_candidate', humanApprovalClaimed: false, direction: 'Root-authorized exact six German/English description replacements, with individual atomicity, memory and semantic-kind reassessment. Existing native classifications/statuses are retained without claiming new human authority.' }, sourceArtifacts, changes, fileDigests: paths.map((path, i) => ({ path, beforeSha256: sha(originals[i]), afterSha256: sha(outputs[i]) })), boundaries: ['Exactly twelve canonical description fields changed. All titles, IDs, edges, metadata, resourceLinks including existing alt text, and all other goals preserved.', 'Six atomicity records individually re-reviewed; three memory_required and three no_memory_needed records individually re-reviewed with all real deck/card links preserved.', 'Six semantic-kind source fingerprints recalculated by the native pinned function; classification, decisionStatus and decisionBasis unchanged.', 'No D/P review, registry, claims, image/import/QA, deck/card, source, book, aggregate QA, runtime or plugin write. Root owns outstanding image repairs and final D/P/QA/M6 integration.'], recovery: 'Exact before/after goal objects and native bindings are retained. Restore only these scoped fields after verifying their after values; do not blindly revert entire shared files or later resourceLink/image changes.' }
let patch = '*** Begin Patch\n'
for (const [i, path] of paths.entries()) {
  const previous = originals[i].split('\n'), next = outputs[i].split('\n')
  assert.equal(previous.length, next.length)
  const changed = previous.flatMap((line, n) => line === next[n] ? [] : [n])
  assert.equal(changed.length, i === 0 ? 12 : 6, 'Unexpected changed-line count: ' + path)
  patch += '*** Update File: ' + path + '\n'
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
patch += '*** Add File: ' + receiptPath + '\n' + JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
for (const [i, path] of paths.entries()) assert.equal(readFileSync(path, 'utf8'), originals[i], 'Concurrent file drift: ' + path)
for (const artifact of sourceArtifacts) assert.equal(sha(readFileSync(artifact.path)), artifact.sha256, 'Concurrent source drift: ' + artifact.path)
assert.equal(existsSync(receiptPath), false)
process.stdout.write(JSON.stringify({ patch, summary: { recordedAt, changes: changes.length, canonicalFields: 12, outputDigests: receipt.fileDigests.map(binding => ({ path: binding.path, sha256: binding.afterSha256 })) } }))
