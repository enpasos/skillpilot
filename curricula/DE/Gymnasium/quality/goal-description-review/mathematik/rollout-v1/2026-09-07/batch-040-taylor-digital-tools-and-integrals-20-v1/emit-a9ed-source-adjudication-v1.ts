import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'
const base = 'curricula/DE/Gymnasium/'
const batch = base + 'quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-040-taylor-digital-tools-and-integrals-20-v1/'
const helperPath = batch + 'emit-a9ed-source-adjudication-v1.ts'
const receiptPath = batch + 'a9ed-source-adjudication-adoption-receipt-v1.json'
const id = 'a9ed219d-d497-55e5-a4e0-4d45d2554f6b'
const paths = [base + 'canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json', base + 'quality/semantic-atomicity/canonical-math-full.review.jsonl', base + 'quality/memory-card-review/canonical-math-full.review.jsonl', base + 'quality/release-model/mathematik.semantic-kinds.json']
const originals = paths.map(path => readFileSync(path, 'utf8'))
const jsonl = (text: string) => text.trimEnd().split('\n').map(line => JSON.parse(line))
const canonical = JSON.parse(originals[0]), atomic = jsonl(originals[1]), memory = jsonl(originals[2]), kinds = JSON.parse(originals[3])
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const norm = (v: unknown) => String(v ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const stable = (v: any): string => Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, w]) => JSON.stringify(k) + ':' + stable(w)).join(',') + '}' : JSON.stringify(v)
const fingerprint = (g: any, ruleVersion: string) => sha(stable({ ruleVersion, goalId: g.id, shortKey: g.shortKey ?? '', title: norm(g.title), titleEn: norm(g.titleEn), description: norm(g.description), descriptionEn: norm(g.descriptionEn), phase: norm(g.dimensionTags?.phase), area: norm(g.dimensionTags?.area), topicCode: norm(g.dimensionTags?.topicCode), nodeKind: norm(g.nodeKind) }))
const unique = (rows: any[], key: string, value: string) => { const found = rows.filter(r => r[key] === value); assert.equal(found.length, 1); return found[0] }
const serialize = () => [JSON.stringify(canonical, null, 2) + '\n', atomic.map(r => JSON.stringify(r)).join('\n') + '\n', memory.map(r => JSON.stringify(r)).join('\n') + '\n', JSON.stringify(kinds, null, 2) + '\n']
assert.deepEqual(serialize(), originals)
assert.equal(existsSync(receiptPath), false)
const g = unique(canonical.goals, 'id', id), a = unique(atomic, 'goalId', id), m = unique(memory, 'goalId', id), k = unique(kinds.decisions, 'goalId', id)
const before = structuredClone(g), bindingsBefore = structuredClone({ atomicity: a, memory: m, semanticKind: k })
assert.equal(g.description, 'Die lernende Person kann Stammfunktionen von Potenzfunktionen $f(x)=x^n$ für $n\\in\\mathbb{Z}\\setminus\\{-1\\}$ bestimmen, Faktor- und Summenregel beim Integrieren anwenden und ganzrationale Funktionen sowie $e^x$, $\\sin(x)$ und $\\cos(x)$ integrieren.')
assert.equal(g.descriptionEn, 'The learner can determine antiderivatives of power functions $f(x)=x^n$ for $n\\in\\mathbb{Z}\\setminus\\{-1\\}$, apply factor and sum rules when integrating, and integrate polynomial functions as well as $e^x$, $\\sin(x)$, and $\\cos(x)$.')
assert.equal(a.status, 'atomic'); assert.equal(a.semanticAtomic, true); assert.equal(a.fingerprint, fingerprint(g, a.ruleVersion))
assert.equal(m.status, 'memory_required'); assert.equal(m.memoryUseful, true); assert.equal(m.fingerprint, fingerprint(g, m.ruleVersion))
assert.deepEqual(m.memoryGoalIds, ['ca708087-71f8-5fae-91c5-b80721a4208f']); assert.deepEqual(m.deckIds, ['de_gymnasium_math_analysis_core'])
assert.equal(k.semanticKind, 'curricularAtomic'); assert.equal(k.sourceFingerprint, fingerprintSemanticKindSourceGoal(g))
const cardLedgerPath = base + 'quality/memory-card-review/canonical-math-full.cards.review.jsonl'
const cardRows = jsonl(readFileSync(cardLedgerPath, 'utf8')).filter(r => (r.originGoalIds ?? []).includes(id))
assert.equal(cardRows.length, 1); assert.equal(cardRows[0].cardId, 'math_analysis_c13'); assert.equal(cardRows[0].status, 'kept'); assert.equal(cardRows[0].necessary, true)
const deckPaths = ['de', 'en'].map(lang => base + 'memory-decks/de_gymnasium_math_flashcards_analysis_core.' + lang + '.json')
const cards = deckPaths.map(path => ({ path, card: unique(JSON.parse(readFileSync(path, 'utf8')).cards, 'id', 'math_analysis_c13') }))
const pdfPath = base + 'input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf'
const extractPath = base + 'input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json'
assert.equal(sha(readFileSync(pdfPath)), 'sha256:d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953')
assert.equal(sha(readFileSync(extractPath)), 'sha256:f019332e31d21ff83198235b8f446d18e27287a5ebc42bbfeff891a581d2f2b3')
const reviewPaths = ['a', 'b'].map(round => batch + 'round-' + round + '/results/mathematik-rollout-v1-batch-040-taylor-digital-tools-and-integrals-20-v1-20260907-first-pass-' + round + '.batch-001.records.jsonl')
const conflictingReviews = reviewPaths.map(path => { const record = unique(jsonl(readFileSync(path, 'utf8')), 'goalId', id); return { path, recordId: record.recordId, decision: record.decision, rationale: record.rationale, recordSha256: sha(JSON.stringify(record) + '\n') } })
assert.equal(conflictingReviews[0].decision, 'block'); assert.equal(conflictingReviews[1].decision, 'split_review')
const sources = [helperPath, pdfPath, extractPath, cardLedgerPath, ...deckPaths, ...reviewPaths].map(path => ({ path, sha256: sha(readFileSync(path)) }))
const recordedAt = new Date().toISOString()
const reasons = {
  atomicity: 'Die neue Fassung stellt den im Original KC Q1.1 S.36 Spiegelstrich4 geforderten Zusammenhang ausdrücklich her: elementare Stammfunktionen aus bekannten Ableitungsregeln erschließen und mittels Linearität zu Stammfunktionen der angegebenen Linearkombinationen verbinden. Potenzen einschließlich negativer ganzzahliger Exponenten, exp und trigonometrische Grundfunktionen sind dabei bekannte Basispaare einer einzigen inversen linearen Operation, keine getrennten Integrationsmethoden. Zwei gemischte Aufgaben plus eine Regelbegründung decken die Kompetenz einschließlich geeigneter Intervalle ab. Innere Transformation, Substitution, partielle Integration und Rekonstruktionsanwendung werden nicht hinzugenommen. Der frühere fehlende Begründungszusammenhang ist sachlich ergänzt, nicht durch einen bloßen Fingerprint-Refresh verdeckt.',
  memory: 'Die tatsächlich gelesene DE/EN-Karte math_analysis_c13 sichert eng begrenzt die kompakte Potenzregel F=x^(n+1)/(n+1) mit n≠−1. Dieser verfügbare Regelbaustein bleibt für die flüssige Anwendung im erweiterten linearen Term notwendig; das neue Erschließen aus Ableitungsregeln, die Linearkombination, trigonometrische Vorzeichen und Intervallwahl müssen unabhängig erklärt werden und sind durch Kartenabruf nicht nachgewiesen. Die Karte nennt eine Stammfunktion, daher fehlt dort keine allgemeine Konstante. Vorhandener memory_required-Status samt echtem Deck-/Memoryziel-/Kartenbezug bleibt individuell bestätigt; es wird kein zusätzliches Deck angelegt.',
  semanticKind: 'Die aktuelle Formulierung verlangt eine überprüfbare curriculare Inhaltskompetenz an Stammfunktionen. Sie ist weder eine Themenüberschrift noch ein Memoryziel oder terminales Assessment; curricularAtomic bleibt sachlich angemessen. Bestehende native Statusautorität wird nicht als neue menschliche Abnahme ausgegeben.',
}
g.description = 'Die lernende Person kann die Stammfunktionen von $x^n$ für $n\\in\\mathbb{Z}\\setminus\\{-1\\}$ sowie von $e^x$, $\\sin(x)$ und $\\cos(x)$ aus den Ableitungsregeln erschließen und damit mithilfe der Faktor- und Summenregel auf geeigneten Intervallen Stammfunktionen entsprechender Linearkombinationen bestimmen.'
g.descriptionEn = 'The learner can infer antiderivatives of $x^n$ for $n\\in\\mathbb{Z}\\setminus\\{-1\\}$ and of $e^x$, $\\sin(x)$, and $\\cos(x)$ from differentiation rules and use the factor and sum rules to determine antiderivatives of their linear combinations on suitable intervals.'
for (const [record, prior, reason] of [[a, bindingsBefore.atomicity, reasons.atomicity], [m, bindingsBefore.memory, reasons.memory]]) {
  record.fingerprint = fingerprint(g, record.ruleVersion); record.reviewedAt = recordedAt.slice(0, 10)
  record.reviewer = 'codex-math-b040-a9ed-source-adjudication'
  record.reason = 'Individuelle fachliche AI-Nachprüfung nach quellengebundener DE/EN-Präzisierung: ' + reason + ' Keine menschliche Einzelabnahme behauptet.'
  const restored = structuredClone(record)
  for (const field of ['fingerprint', 'reviewedAt', 'reviewer', 'reason']) restored[field] = prior[field]
  assert.deepEqual(restored, prior)
}
k.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
assert.deepEqual({ ...k, sourceFingerprint: bindingsBefore.semanticKind.sourceFingerprint }, bindingsBefore.semanticKind)
assert.deepEqual(Object.keys(g).filter(field => JSON.stringify(g[field]) !== JSON.stringify(before[field])).sort(), ['description', 'descriptionEn'])
assert.deepEqual({ ...g, description: before.description, descriptionEn: before.descriptionEn }, before)
const outputs = serialize()
const receipt = {
  schemaVersion: 1, artifactType: 'math-b040-a9ed-source-adjudication-and-adoption-v1', recordedAt, goalId: id,
  authority: { execution: 'OpenAI Codex AI author', model: 'unknown', modelVersion: 'unknown', reviewAuthority: 'ai_candidate', humanApprovalClaimed: false, direction: 'Root authorized exactly the proposed German and English description changes after reading the four source aspects and complete parent bullet. Titles, IDs and edges must remain unchanged. No D KEEP before fresh dual review.' },
  sources, conflictingReviews,
  sourceInspection: { pdfPath, printedPage: 36, originalPageActuallyViewed: true, extractionPath: extractPath, sourceAspectIds: ['he-math-sekii-q1-1-b04-a01-9c764d50', 'he-math-sekii-q1-1-b04-a02-69c075cb', 'he-math-sekii-q1-1-b04-a03-a7178d9f', 'he-math-sekii-q1-1-b04-a04-6475efbe'], decisiveHeading: 'Entwickeln der Integrationsregeln mithilfe der Ableitungsregeln', interpretation: 'The original heading supplies the shared rule-development relation missing from the prior activity list. A shared curriculum bullet alone does not prove atomicity; the integrated tasks below demonstrate the bounded common operation.' },
  adjudication: { decision: 'minimal_source_bound_revision_without_split', reasons, neighbors: ['31be24f0-3ab1-54d2-856d-fa9b7f36552f', '23589682-2028-54cb-9034-b468b42688f1'].map(neighborId => structuredClone(unique(canonical.goals, 'id', neighborId))), neighborBoundary: '31be24 retains its without-aids polynomial and supplied-primitive application emphasis; 23589682 retains the next source bullet on linear inner transformations. Neither scope is imported into this foundational inverse-linearity goal.', remainingGate: 'Fresh independent dual D review is still required; historical A/B records and image-QA decisions are untouched.' },
  integratedAssessmentTasks: [
    { id: 'derive-power-and-linearity', taskDe: 'Erschließe aus den Ableitungsregeln eine Stammfunktion von x^n für n≠−1 sowie den Zusammenhang für αf+βg, wenn F′=f und G′=g gelten. Erkläre die Rolle geeigneter Intervalle und der Ausnahme n=−1.', taskEn: 'Infer an antiderivative of x^n for n≠−1 and the relation for αf+βg from differentiation rules, given F′=f and G′=g. Explain suitable intervals and the exception n=−1.', expectedDe: 'F_n=x^(n+1)/(n+1), weil die Ableitung (n+1) kompensiert; (αF+βG)′=αf+βg. Bei negativen Potenzen wird auf Intervallen ohne 0 gearbeitet; für n=−1 ist diese Potenzformel nicht definiert. Logarithmusintegration ist kein zusätzliches Pflichtziel.', expectedEn: 'F_n=x^(n+1)/(n+1), since differentiation compensates n+1; (αF+βG)′=αf+βg. Negative powers are treated on intervals avoiding 0; the power formula is undefined at n=−1. Logarithmic integration is not an added requirement.' },
    { id: 'mixed-base-functions', taskDe: 'Bestimme für h=2x³+3e^x−4sin x+cos x eine Stammfunktion und begründe Basispaare, Koeffizienten und Vorzeichen durch Ableiten.', taskEn: 'Find an antiderivative of h=2x³+3e^x−4sin x+cos x and justify the basic pairs, coefficients and signs by differentiation.', expectedDe: 'H=x⁴/2+3e^x+4cos x+sin x+C; die Ableitung liefert jeden Summanden von h, und C verschwindet.', expectedEn: 'H=x⁴/2+3e^x+4cos x+sin x+C; differentiating recovers each term of h, and C disappears.' },
    { id: 'negative-power-transfer', taskDe: 'Bestimme auf x>0 eine Stammfunktion von h=x^−2−2x+2cos x−e^x. Begründe die Intervallwahl und dieselbe inverse Linearität.', taskEn: 'On x>0 find an antiderivative of h=x^−2−2x+2cos x−e^x. Justify the interval and the same inverse linearity.', expectedDe: 'H=−1/x−x²+2sin x−e^x+C, da H′=h. 0 bleibt ausgeschlossen; auf getrennten zulässigen Intervallen kann die additive Konstante unabhängig gewählt werden.', expectedEn: 'H=−1/x−x²+2sin x−e^x+C since H′=h. Zero remains excluded; additive constants can be chosen independently on separate admissible intervals.' },
  ],
  before, after: structuredClone(g), changedCanonicalFields: ['description', 'descriptionEn'], bindingsBefore, bindingsAfter: structuredClone({ atomicity: a, memory: m, semanticKind: k }),
  preservedMemoryEvidence: { ledger: cardRows, cards },
  fileDigests: paths.map((path, i) => ({ path, beforeSha256: sha(originals[i]), afterSha256: sha(outputs[i]) })),
  boundaries: ['Only two canonical description fields, one A record, one M record and one K fingerprint changed.', 'Titles, IDs, edges, applicability, source mappings, actual cards/decks, resourceLinks and images are preserved.', 'No D/P existing record, registry, claim, source, book, aggregate QA or runtime write. New P1 authoring is a separate subsequent artifact.'],
}
let patch = '*** Begin Patch\n'
for (const [i, path] of paths.entries()) {
  const previous = originals[i].split('\n'), next = outputs[i].split('\n')
  assert.equal(previous.length, next.length)
  const changed = previous.flatMap((line, index) => line === next[index] ? [] : [index])
  assert.equal(changed.length, i === 0 ? 2 : 1)
  patch += '*** Update File: ' + path + '\n'
  for (let cursor = 0; cursor < changed.length; cursor++) {
    const start = Math.max(0, changed[cursor] - 2); let end = Math.min(previous.length, changed[cursor] + 3)
    while (cursor + 1 < changed.length && changed[cursor + 1] < end + 2) { cursor++; end = Math.min(previous.length, changed[cursor] + 3) }
    patch += '@@\n'
    for (let n = start; n < end; n++) patch += previous[n] === next[n] ? ' ' + previous[n] + '\n' : '-' + previous[n] + '\n+' + next[n] + '\n'
  }
}
patch += '*** Add File: ' + receiptPath + '\n' + JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
for (const [i, path] of paths.entries()) assert.equal(readFileSync(path, 'utf8'), originals[i], 'Concurrent target drift')
for (const source of sources) assert.equal(sha(readFileSync(source.path)), source.sha256, 'Concurrent source drift')
process.stdout.write(JSON.stringify({ patch, summary: { recordedAt, canonicalSha256: sha(outputs[0]), receiptSha256: sha(JSON.stringify(receipt, null, 2) + '\n'), changes: 1 } }))
