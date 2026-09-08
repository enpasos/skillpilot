import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'
import { normalizeCanonicalLandscape } from '../../../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { collectCompositionProjectionRoleGoalIds, compileCompositionView, normalizeCompositionView } from '../../../../../../../../../app/src/utils/authoring/compositionViewAuthoring'

// Exact approved Layer-A checkpoint. This helper only emits an apply_patch payload
// or checks it; it never writes files or confers D/P/human/image approval.
const baseCommit = '74adc6a74'
const base = 'curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/'
const here = base + 'batch-042r-current-nine-contexts-v1/'
const original = base + 'batch-042-astro-nuclear-electronics-mechanics-20-v1/'
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const mathPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const kindPath = 'curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json'
const atomicPath = 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-physics-full.review.jsonl'
const memoryPath = 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-physics-full.review.jsonl'
const read = (path: string) => readFileSync(path, 'utf8')
const json = (path: string) => JSON.parse(read(path))
const historical = (path: string) => execFileSync('git', ['show', `${baseCommit}:${path}`], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 })
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const format = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const stable = (value: any): string => value === undefined ? 'null' : Array.isArray(value) ? '[' + value.map(stable).join(',') + ']' : value !== null && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + stable(value[key])).join(',') + '}' : JSON.stringify(value)
const norm = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim()
const baselineBytes = historical(canonicalPath)
assert.equal(sha(baselineBytes), 'sha256:d2b1b698622a1f9b1cd3de82f05e5322aa873fd269c19d1693598b24b14c5a91')
const before = JSON.parse(baselineBytes)
const after = structuredClone(before)
const planned = new Map<string, { before: string; after: string }>()
const changes: any[] = []
const recordChange = (goalId: string, field: string, oldValue: string, newValue: string) => {
  const goal = after.goals.find((entry: any) => entry.id === goalId)
  assert.ok(goal, goalId)
  assert.equal(goal[field], oldValue, goalId + '/' + field)
  assert.notEqual(oldValue, newValue)
  goal[field] = newValue
  changes.push({ goalId, field, before: oldValue, after: newValue })
}
for (const filename of ['minimal-english-translation-proposals-v1.json', 'approved-6e7-qualitativ-single-field-v1.proposal.json']) {
  for (const proposal of json(original + filename).changes) {
    for (const [field, pair] of Object.entries(proposal.fields) as [string, any][]) recordChange(proposal.goalId, field, pair.before, pair.after)
  }
}
const dose = json(original + 'dose-source-grounded-wording-proposal-v2.json')
for (const [field, pair] of Object.entries(dose.proposedFields) as [string, any][]) recordChange(dose.goalId, field, pair.before, pair.after)
const a12 = 'a12fddce-0215-58d9-bd91-21be8a960d25'
const chain = '3b50255a-6b01-578b-8f5c-4383536a3221'
const chart = '64b30d2e-cbe1-55d8-915a-a050d736b96e'
recordChange(a12, 'description', 'Die lernende Person kann einfache Zerfallsgesetze anwenden, Aktivität und Halbwertszeit interpretieren und Zerfallsreihen qualitativ beschreiben.', 'Die lernende Person kann mit einem einfachen exponentiellen Zerfallsgesetz die zeitliche Abnahme einer radioaktiven Substanz oder ihrer Aktivität bestimmen und die Halbwertszeit im Sachkontext interpretieren.')
recordChange(a12, 'descriptionEn', 'The learner can apply simple decay laws, interpret activity and half-life, and qualitatively describe decay chains.', 'The learner can use a simple exponential decay law to determine the decrease of a radioactive substance or its activity over time and interpret the half-life in context.')
recordChange(chain, 'description', 'Die lernende Person kann Zerfallsreihen qualitativ diskutieren und berechnen.', 'Die lernende Person kann in einer vorgegebenen Zerfallsreihe die Änderungen von Massenzahl und Kernladungszahl bei den angegebenen Zerfallsarten prüfen und die Konsistenz der aufeinanderfolgenden Nuklide begründen.')
recordChange(chain, 'descriptionEn', 'The learner can qualitatively discuss and calculate decay chains.', 'The learner can check changes in mass number and atomic number for the specified decay types in a supplied decay chain and justify the consistency of successive nuclides.')
assert.equal(changes.length, 11)
const wellId = '6e7c35e0-7a38-5996-a42e-005038eff0db'
const well = after.goals.find((entry: any) => entry.id === wellId)
const image = well.resourceLinks.find((link: any) => link.type === 'goal-visualization')
const oldAlt = 'Didaktische Visualisierung zum Lernziel "Potenzialtopfmodell für Kerne". Die lernende Person kann Potenzialtopfmodelle zur Bindungsenergie qualitativer beschreiben.'
assert.equal(image.altText, oldAlt)
image.altText = 'Didaktische Visualisierung zum Lernziel "Potenzialtopfmodell für Kerne". Die lernende Person kann Potenzialtopfmodelle zur Bindungsenergie qualitativ beschreiben.'
changes.push({ goalId: wellId, field: 'resourceLinks/goal-visualization/altText', before: oldAlt, after: image.altText })
const editedIds = [...new Set(changes.map(change => change.goalId))].sort()
assert.equal(editedIds.length, 6)
assert.equal(after.goals.find((entry: any) => entry.id === chart).description, before.goals.find((entry: any) => entry.id === chart).description)
for (let i = 0; i < before.goals.length; i++) {
  const oldGoal = before.goals[i], newGoal = after.goals[i]
  assert.equal(oldGoal.id, newGoal.id)
  for (const key of ['id', 'title', 'titleEn', 'description', 'descriptionEn', 'resourceLinks', 'requires', 'contains', 'weight', 'tags', 'dimensionTags', 'extendedData', 'examData']) {
    const allowed = changes.some(change => change.goalId === oldGoal.id && (change.field === key || key === 'resourceLinks' && change.field.startsWith('resourceLinks/')))
    if (!allowed) assert.deepEqual(newGoal[key], oldGoal[key], oldGoal.id + '/' + key)
  }
  if (!editedIds.includes(oldGoal.id)) assert.deepEqual(newGoal, oldGoal)
}
planned.set(canonicalPath, { before: baselineBytes, after: format(after) })

const rationaleByGoal: Record<string, { atomic: string; memory: string }> = {
  'f67550ac-df22-5a3e-8172-f04642efca64': { atomic: 'Aktuelle DE/EN-Äquivalenz geprüft: HR-Diagramm quantitativ zur Sternentwicklung auswerten; Zustandsgrößen, Distanz und Hauptreihenbeziehungen sind gekoppelte Modellinterpretationen. Nur zwei bisher deutsche EN-Felder übersetzt, keine neue Teilkompetenz. Dies ist keine neue D/P- oder Bildfreigabe.', memory: 'EN-Übersetzung inhaltlich gegen unverändertes DE geprüft. Die Kompetenz bleibt eine quantitative Diagramm- und Modellinterpretation; keine zusätzliche isolierte Erinnerungsroutine oder neue Karte erforderlich.' },
  [chart]: { atomic: 'DE unverändert und EN semantisch gleichwertig geprüft: aus einer bereitgestellten digitalen Nuklidkarte Eigenschaften/Übergänge entnehmen und eine Zerfallsreihe rekonstruieren. Eine zusammenhängende Datenauswertung; getrennt von der bloßen A/Z-Prüfung einer bereits vorgegebenen Reihe.', memory: 'Nuklidkarte liefert die benötigten Eigenschaften und Übergänge; fachliches Lesen und Rekonstruieren statt Auswendiglernen der Karte. Keine eigene Memorykarte notwendig; HE-Scope wird getrennt begrenzt.' },
  [wellId]: { atomic: 'Einzelfeldkorrektur qualitativer→qualitativ gegen aktuellen DE/EN-Auftrag geprüft: Potenzialtopfmodell für Bindungsenergie qualitativ beschreiben bleibt genau eine Modellkompetenz. Rechtschreib- und Alttextkorrektur ist keine fachliche D/P- oder Bildfreigabe.', memory: 'Unveränderte qualitative Modellkompetenz nach der einzelnen grammatischen Korrektur geprüft; Verständnis von Bindung/Energieniveaus statt isolierter Memorierpflicht. Bestehende Entscheidung ohne eigene Karte bleibt begründet.' },
  [dose.goalId]: { atomic: 'Ein integrierter Dosis-/Abschirmvergleich: passende Dosisgröße unter gegebenen Modellannahmen bestimmen und die Reduktion bei vergleichbarer Exposition beurteilen. Die Unterscheidung von Energiedosis, Äquivalentdosis und effektiver Dosis ist eine Korrektheitsbedingung derselben Anwendung; nicht alle Größen müssen in jeder Aufgabe berechnet werden.', memory: 'Die Aufgabe stellt Messdaten, Modell und nötige Strahlungs-/Gewebewichtungen bereit. Geeignete Größe wählen, Einheiten/Modellgrenzen erklären und Abschirmung vergleichen erfordert Verständnis; keine neue auswendig zu lernende Dosimetrietabelle oder Karte.' },
  [a12]: { atomic: 'Genau eine zeitliche exponentielle Zerfallsmodellierung: Abnahme von Substanz/Aktivität bestimmen und Halbwertszeit interpretieren. Eigenständige Reihenrekonstruktion ist entfernt und bleibt in den bestehenden Zielen 3b/64b. Keine gekoppelte Tochteraktivität oder Bateman-Herleitung hinzugefügt.', memory: 'Die vorhandene konkrete Karte physics_q4_c10 im Deck de_gymnasium_physics_structure_q4 wurde vollständig geprüft: N(t)=N0 exp(-lambda t) bzw. Halbwertszeitform und statistische Abnahme. Sie passt unverändert zum engeren Zeitgesetz; Deck, Karte, Memoryziel und Originbindung bleiben erhalten.' },
  [chain]: { atomic: 'Genau eine Konsistenzprüfung einer vorgegebenen Zerfallsreihe anhand angegebenen Zerfallsarten und Änderungen von A/Z. Keine eigenständige Nuklidkartensuche oder zeitabhängige Tochteraktivitätsrechnung. Alpha-Beispiel A−4/Z−2 und Beta-minus A gleich/Z+1 kontrollieren denselben invariantengebundenen Auftrag.', memory: 'Zerfallsarten sind in der Aufgabe angegeben; Reihenprüfung mit A/Z-Konsistenz ist eine Anwendung vorhandener Strahlungsgrundlagen, kein zusätzliches Auswendiglernen ganzer Reihen. Keine eigene neue Memorykarte erforderlich.' },
}
const classificationChanges: any[] = []
const kindBefore = historical(kindPath), kind = JSON.parse(kindBefore)
for (const id of editedIds) {
  const decision = kind.decisions.find((entry: any) => entry.goalId === id)
  assert.equal(decision.semanticKind, 'curricularAtomic')
  const oldRecord = structuredClone(decision)
  decision.sourceFingerprint = fingerprintSemanticKindSourceGoal(after.goals.find((entry: any) => entry.id === id))
  // Closed schema enum: retain the valid classification basis. Individual
  // current-goal reasoning belongs in the receipt, not in this enum field.
  assert.equal(decision.decisionBasis, 'reviewed-current-pilot-curricular-atomic')
  classificationChanges.push({ path: kindPath, goalId: id, before: oldRecord, after: structuredClone(decision), reason: rationaleByGoal[id].atomic })
}
planned.set(kindPath, { before: kindBefore, after: format(kind) })
for (const [path, ruleVersion, category] of [[atomicPath, 'semantic-atomicity-v1', 'atomic'], [memoryPath, 'memory-card-review-v1', 'memory']] as const) {
  const baseline = historical(path)
  const lines = baseline.trimEnd().split('\n')
  for (let i = 0; i < lines.length; i++) {
    const record = JSON.parse(lines[i])
    if (!editedIds.includes(record.goalId)) continue
    const oldRecord = structuredClone(record)
    const goal = after.goals.find((entry: any) => entry.id === record.goalId)
    record.fingerprint = sha(stable({ ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '', title: norm(goal.title), titleEn: norm(goal.titleEn), description: norm(goal.description), descriptionEn: norm(goal.descriptionEn), phase: norm(goal.dimensionTags?.phase), area: norm(goal.dimensionTags?.area), topicCode: norm(goal.dimensionTags?.topicCode), nodeKind: norm(goal.nodeKind) }))
    record.reviewedAt = '2026-09-07'
    record.reviewer = 'codex-b042-current-source-scope-checkpoint'
    record.reason = rationaleByGoal[record.goalId][category]
    if (category === 'atomic') { assert.equal(record.status, 'atomic'); assert.equal(record.semanticAtomic, true) }
    else assert.equal(record.status, record.goalId === a12 ? 'memory_required' : 'no_memory_needed')
    lines[i] = JSON.stringify(record)
    classificationChanges.push({ path, goalId: record.goalId, before: oldRecord, after: record, reason: record.reason })
  }
  planned.set(path, { before: baseline, after: lines.join('\n') + '\n' })
}
assert.equal(classificationChanges.length, 18)

const mappingChanges: any[] = []
for (const [path, entries] of [
  ['curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_physics_upper_secondary_source_extraction_to_canonical_physics.review.json', [[312, 232, a12, chain, 'HE KC2024 Q4.3: Die LK-Überschrift Zerfallsgesetze wird auf der tatsächlichen Originalseite46 ausschließlich durch Zerfallsreihen konkretisiert. Deshalb Zuordnung zum bestehenden A/Z-Reihenziel3b; GK-Zeitgesetz-Einträge303–305 bleiben a12.']]],
  ['curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/ni_physics_upper_secondary_source_extraction_to_canonical_physics.review.json', [[48, 31, chart, a12, 'NI KC2022 Originalseite30: radioaktiven Zerfall mithilfe Halbwertszeit beschreiben und Abklingkurve auswerten. Das ist das Zeitgesetz-Ziel a12, nicht Nuklidkartenauswertung64b; andere bestehende Zuordnungen bleiben erhalten.'], [136, 97, chart, a12, 'NI KC2022 Originalseite45: Zerfallsgesetz grafisch und mit Exponentialfunktionen auswerten. Das ist das Zeitgesetz-Ziel a12, nicht Nuklidkartenauswertung64b; eigenständige Nuklidkarten-Zuordnungen139/212 bleiben erhalten.']]],
] as [string, [number, number, string, string, string][]][]) {
  const baseline = historical(path), data = JSON.parse(baseline)
  for (const [mappingIndex, decisionIndex, from, to, reason] of entries) {
    const mapping = data.mappings[mappingIndex], decision = data.decisions[decisionIndex]
    assert.equal(mapping.canonicalGoalId, from)
    assert.equal(decision.sourceGoalId, mapping.legacyGoalId)
    assert.equal(decision.canonicalGoalIds.filter((id: string) => id === from).length, 1)
    assert.ok(!decision.canonicalGoalIds.includes(to))
    const old = { mapping: structuredClone(mapping), decision: structuredClone(decision) }
    mapping.canonicalGoalId = to
    decision.canonicalGoalIds = decision.canonicalGoalIds.map((id: string) => id === from ? to : id)
    decision.rationale = reason
    decision.reviewedAt = '2026-09-07'
    decision.reviewer = 'codex-b042-current-source-scope-checkpoint'
    mappingChanges.push({ path, mappingIndex, decisionIndex, before: old, after: { mapping: structuredClone(mapping), decision: structuredClone(decision) } })
  }
  planned.set(path, { before: baseline, after: format(data) })
}
const viewBase = 'curricula/DE/Gymnasium/composition-views/physik/'
const heRemoved = ['853dbe54-85b0-59ab-8f3a-000c2b7746ec', '658cf33d-a0c2-5d47-801a-3dbcd5cac074', chain, chart]
const expected = new Map<string, string[]>([
  [viewBase + 'de-he-gk.view.json', heRemoved], [viewBase + 'de-he-sekii-gk.view.json', heRemoved],
  [viewBase + 'de-rp-gk.view.json', ['fbecbd60-5db3-51e8-94be-d66b066ffa06']], [viewBase + 'de-rp-sekii-gk.view.json', ['fbecbd60-5db3-51e8-94be-d66b066ffa06']],
])
for (const [path, ids] of expected) {
  const baseline = historical(path), view = JSON.parse(baseline)
  assert.equal(view.scope.courseProfile, 'GK')
  for (const id of ids) {
    assert.ok(!view.rootNodes.some((node: any) => node.kind === 'goalEntry' && node.goalId === id))
    view.rootNodes.push({ kind: 'goalEntry', goalId: id, projectionRole: 'prerequisiteOnly' })
  }
  planned.set(path, { before: baseline, after: format(view) })
}
const canon = normalizeCanonicalLandscape(after), math = normalizeCanonicalLandscape(json(mathPath))
assert.equal(sha(read(mathPath)), sha(historical(mathPath)), 'Mathematics unchanged')
const universe = { ...canon, goals: [...canon.goals, ...math.goals] }
const landscapes = new Map([[canon.landscapeId, canon], [math.landscapeId, math]])
const goalMap = new Map(canon.goals.map(goal => [goal.id, goal]))
const manifestPath = 'app/scripts/config/goal-books/de-gym-physics-national-atlas.sources.json'
const viewProof = json(manifestPath).sourcePaths.map((path: string) => {
  const pair = planned.get(path) ?? { before: read(path), after: read(path) }
  const left = normalizeCompositionView(JSON.parse(pair.before)), right = normalizeCompositionView(JSON.parse(pair.after))
  const beforeTargets = collectCompositionProjectionRoleGoalIds(left.rootNodes, goalMap).targetGoalIds
  const afterTargets = collectCompositionProjectionRoleGoalIds(right.rootNodes, goalMap).targetGoalIds
  const removed = [...beforeTargets].filter(id => !afterTargets.has(id)).sort()
  const added = [...afterTargets].filter(id => !beforeTargets.has(id)).sort()
  assert.deepEqual(removed, [...(expected.get(path) ?? [])].sort(), path)
  assert.deepEqual(added, [])
  assert.deepEqual(compileCompositionView(right, canon, universe, landscapes).findings, [], path)
  if (path.includes('/de-he-') && right.scope.courseProfile === 'GK') assert.ok(!afterTargets.has(chain) && !afterTargets.has(chart))
  return { path, beforeSha256: sha(pair.before), afterSha256: sha(pair.after), removedTargetGoalIds: removed, addedTargetGoalIds: added, compilerFindings: [] }
})
assert.equal(viewProof.length, 64)
assert.equal(viewProof.flatMap((entry: any) => entry.removedTargetGoalIds).length, 10)
for (const edge of ['requires', 'contains']) {
  const visiting = new Set<string>(), visited = new Set<string>()
  const visit = (id: string) => {
    assert.ok(!visiting.has(id), edge + ' cycle at ' + id)
    if (visited.has(id)) return
    visiting.add(id)
    for (const next of (goalMap.get(id) as any)?.[edge] ?? []) if (goalMap.has(next)) visit(next)
    visiting.delete(id); visited.add(id)
  }
  for (const id of goalMap.keys()) visit(id)
}
const scopeEvidence = json(here + 'three-goal-gk-scope-proposal-v1.json').sourceBindings
const sourceBindings = scopeEvidence.map((binding: any) => {
  assert.equal(sha(planned.get(binding.path)?.before ?? readFileSync(binding.path)), binding.sha256, binding.path + ' original source lease')
  return binding
})
const receipt = {
  schemaVersion: 1, status: 'approved_layer_a_source_checkpoint_not_D_P_or_image_approval', sourceBaseCommit: baseCommit, reviewedAt: '2026-09-07',
  reviewer: '/root/goal_book_build_generator', model: 'Codex (exact underlying model identifier unavailable)',
  authority: 'Parent explicitly authorized these seven text fields plus exact altText, a12/3b DE+EN boundaries, three mapping redirects and HE/RP view exclusions. Existing agent with prior B042 exposure; no independent blind review or human approval claimed.',
  changes, classificationChanges, mappingChanges, viewProof, sourceBindings,
  files: [...planned].map(([path, pair]) => ({ path, beforeSha256: sha(pair.before), afterSha256: sha(pair.after) })),
  invariants: { canonicalIdsAndOrderUnchanged: true, requiresContainsUnchanged: true, twoDagsPass: true, allAssessmentBytesUnchanged: true, mathUnchanged: true, englishOnlyChartGermanUnchanged: true, cardBytesAndOriginUnchanged: true, historicalReviewSealsUnchanged: true, centralRegistriesUnchangedByThisHelper: true },
  remaining: ['Fresh exact-page D/P review after checkpoint; old results are historical.', 'Do not accept existing visualization bytes without the separately required review.', 'Assessment coverage follow-up is explicitly outside this checkpoint: old 4daef009 contains no chain or dose-quantity task, b8c3dfb7 still mentions a qualitative chain, generic exam templates are not new coverage evidence.', 'Generate current source rationale and curriculum status, validate memory visibility and all protected maturity floors.'],
}
const receiptPath = here + 'source-scope-checkpoint-v1.receipt.json'
if (process.argv.includes('--check')) {
  for (const [path, pair] of planned) assert.equal(read(path), pair.after, path)
  const recorded = json(receiptPath)
  const correctionPath = here + 'source-scope-checkpoint-v1.enum-correction.receipt.json'
  if (existsSync(correctionPath)) {
    const correction = json(correctionPath)
    assert.equal(sha(read(receiptPath)), correction.originalReceiptSha256)
    assert.equal(correction.path, kindPath)
    assert.equal(correction.changes.length, 6)
    assert.equal(sha(read(kindPath)), correction.afterSha256)
    for (const change of correction.changes) {
      assert.equal(change.field, 'decisionBasis')
      assert.equal(change.after, 'reviewed-current-pilot-curricular-atomic')
      const previous = recorded.classificationChanges.find((entry: any) => entry.path === kindPath && entry.goalId === change.goalId)
      assert.equal(previous.after.decisionBasis, change.before)
      previous.after.decisionBasis = change.after
    }
    const binding = recorded.files.find((entry: any) => entry.path === kindPath)
    assert.equal(binding.afterSha256, correction.beforeSha256)
    binding.afterSha256 = correction.afterSha256
  }
  assert.deepEqual(recorded, receipt)
  console.log(JSON.stringify({ status: 'PASS', files: planned.size, canonicalFields: changes.length, canonicalGoals: editedIds.length, classificationRecords: classificationChanges.length, mappingRedirects: mappingChanges.length, views: viewProof.length, removedTargetOccurrences: 10, receiptPath }))
} else {
  for (const [path, pair] of planned) assert.equal(read(path), pair.before, path + ' exact before guard')
  const patchFor = (path: string, pair: { before: string; after: string }) => {
    const output = execFileSync('python3', ['-c', 'import json,sys,difflib\nx=json.load(sys.stdin)\ns=list(difflib.unified_diff(x[0].splitlines(True),x[1].splitlines(True),n=3))[2:]\nsys.stdout.write("".join("@@\\n" if a.startswith("@@ ") else a for a in s))'], { input: JSON.stringify([pair.before, pair.after]), encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 })
    return '*** Update File: ' + path + '\n' + output
  }
  const patch = '*** Begin Patch\n' + [...planned].map(([path, pair]) => patchFor(path, pair)).join('') + '*** Add File: ' + receiptPath + '\n' + format(receipt).trimEnd().split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
  console.log(JSON.stringify({ patch, summary: { status: 'READY_EXACT_GUARDS_PASS', files: planned.size, canonicalFields: changes.length, canonicalGoals: editedIds.length, mappingRedirects: mappingChanges.length, classificationRecords: classificationChanges.length, removedTargetOccurrences: 10, receiptPath } }))
}
