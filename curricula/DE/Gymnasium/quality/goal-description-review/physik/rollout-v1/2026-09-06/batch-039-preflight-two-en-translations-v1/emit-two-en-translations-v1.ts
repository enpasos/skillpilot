import { readFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'

// Root-authorized translation preparation only. No D-review records exist for
// this preflight; this emitter neither imports nor creates any D-review claim.
// All mutations are emitted as an apply_patch payload and applied by the caller.
const base = 'curricula/DE/Gymnasium/'
const directory = base + 'quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-039-preflight-two-en-translations-v1/'
const helperPath = directory + 'emit-two-en-translations-v1.ts'
const receiptPath = directory + 'two-en-translations-receipt-v1.json'
const sha = (value: string | Buffer) => 'sha256:' + createHash('sha256').update(value).digest('hex')
const jsonl = (value: string) => value.trimEnd().split('\n').map(line => JSON.parse(line))
const ts = createRequire(resolve('app/package.json'))('typescript')

// Execute the actual native pure fingerprint functions, without executing each
// CLI's main function or broad --write-fingerprints mutation. Type annotations
// are removed by the repository's installed TypeScript compiler.
const nativeFingerprint = (sourcePath: string, names: string[]) => {
  const source = readFileSync(sourcePath, 'utf8')
  const ast = ts.createSourceFile(sourcePath, source, ts.ScriptTarget.Latest, true)
  const definitions = ast.statements.filter((node: any) => ts.isFunctionDeclaration(node) && names.includes(node.name?.text))
  assert.equal(definitions.length, names.length, 'Native fingerprint functions changed: ' + sourcePath)
  const code = definitions.map((node: any) => node.getText(ast)).join('\n') + '\nfingerprintGoal;'
  const compiled = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText
  return runInNewContext(compiled, { createHash }) as (goal: any, ruleVersion: string) => string
}
const atomicFingerprint = nativeFingerprint('app/scripts/semanticAtomicityReview.ts', ['normalizeText', 'stableJson', 'getSemanticPayload', 'fingerprintGoal'])
const memoryFingerprint = nativeFingerprint('app/scripts/memoryCardReview.ts', ['normalizeText', 'stableJson', 'fingerprintGoal'])
const specifications = [
  {
    goalId: 'e296aba6-f407-5944-a2bd-e5296e4c9f06',
    expectedTitleDe: 'Elektronenbeugung als Materiewellenexperiment auswerten',
    expectedDescriptionDe: 'Die lernende Person kann Aufbau und Funktion einer Elektronenbeugungsroehre beschreiben, Beugungsbilder deuten und aus Messdaten den Zusammenhang zwischen Impuls und De-Broglie-Wellenlaenge erschliessen.',
    titleEn: 'Analyze electron diffraction as a matter-wave experiment',
    descriptionEn: 'The learner can describe the setup and operation of an electron diffraction tube, interpret diffraction patterns, and infer the relationship between momentum and de Broglie wavelength from measurement data.',
    atomicityReason: 'Aufbau und Funktion der Elektronenbeugungsröhre, das Beugungsbild und die Auswertung der Messdaten sind zusammenhängende Schritte einer experimentellen Erschließung der Impuls-Wellenlängen-Beziehung. Der Satz fordert weder einen eigenständigen Röhrenentwurf noch eine zusätzliche allgemeine Beugungstheorie. Die EN-Übersetzung erhält genau diese Auswertungskompetenz und ihre vorhandenen Operatoren.',
    memoryReason: 'Die Leistung besteht darin, Beugungsbilder und Messdaten auf die Impuls-Wellenlängen-Beziehung zu beziehen. Die De-Broglie-Grundlage ist bereits als eigenes Voraussetzungsziel verknüpft; hier werden weder ein zusätzlicher Formelabruf noch feste Bauteil- oder Datenlisten verlangt. Ein eigenes Deck würde die experimentelle Erschließung nicht ersetzen und ist für diesen Kompetenzkern nicht erforderlich.',
    semanticKindReason: 'Das Ziel beschreibt fachlich überprüfbare Analyse eines Materiewellenexperiments. Es ist ein gewöhnliches Inhaltsblatt ohne contains-Kinder, examData, Orientierungsauftrag oder SRS-Tags; die experimentelle Handlung macht es nicht zu einem terminalen Prüfungsziel. curricularAtomic bleibt sachlich passend.'
  },
  {
    goalId: '52b6722a-b3b2-5d2d-a507-0215532b0422',
    expectedTitleDe: 'Quanteninterferometer mit Phasen und Weginformation deuten',
    expectedDescriptionDe: 'Die lernende Person kann Interferenzexperimente mit einzelnen Photonen, etwa im Mach-Zehnder-Interferometer, mit Phasenbeziehungen, Zeigerdiagrammen und Weginformation deuten.',
    titleEn: 'Interpret quantum interferometers using phases and which-path information',
    descriptionEn: 'The learner can interpret interference experiments with single photons, for example in a Mach-Zehnder interferometer, using phase relationships, phasor diagrams, and which-path information.',
    atomicityReason: 'Phasenbeziehungen, Zeigerdiagramme und Weginformation sind gekoppelte Modellaspekte der Deutung eines Einzelphotonen-Interferenzexperiments. Das Mach-Zehnder-Interferometer bleibt ein Beispiel; weder drei unabhängige Formalismen noch der Aufbau eines realen Interferometers werden als getrennte Leistungen hinzugefügt. Die vorhandene Interpretationskompetenz bleibt daher semantisch einheitlich.',
    memoryReason: 'Die Kompetenz erfordert das Deuten veränderlicher Phasen- und Weginformationsbedingungen anhand eines Modells. Auswendig gelernte Detektorausgänge oder eine Liste von Interferometerteilen würden diese Deutung nicht tragen; Einzelphotoneninterferenz und Komplementarität sind bereits Voraussetzungen. Der unveränderte Kompetenzkern fordert keinen zusätzlichen festen Recall-Bestand für ein eigenes Memorydeck.',
    semanticKindReason: 'Die Deutung von Einzelphotoneninterferenz ist eine fachlich assessierbare Modellkompetenz. Das Blatt besitzt keine Strukturkinder, keine examData und keine Memory- oder Orientierungstags; curricularAtomic bezeichnet weiterhin den passenden semantischen Typ.'
  }
]
assert.equal(specifications.length, 2)
assert.equal(new Set(specifications.map(s => s.goalId)).size, 2)
assert.equal(existsSync(receiptPath), false, 'Preflight receipt already exists; refuse replay')
const paths = [base + 'canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json', base + 'quality/release-model/physik.semantic-kinds.json', base + 'quality/semantic-atomicity/canonical-physics-full.review.jsonl', base + 'quality/memory-card-review/canonical-physics-full.review.jsonl']
const originals = paths.map(path => readFileSync(path, 'utf8'))
const canonical = JSON.parse(originals[0]), kinds = JSON.parse(originals[1])
const atomic = jsonl(originals[2]), memory = jsonl(originals[3])
const serialize = () => [JSON.stringify(canonical, null, 2) + '\n', JSON.stringify(kinds, null, 2) + '\n', atomic.map(row => JSON.stringify(row)).join('\n') + '\n', memory.map(row => JSON.stringify(row)).join('\n') + '\n']
assert.deepEqual(serialize(), originals, 'Refuse unrelated formatting changes')
const completeBefore = structuredClone({ canonical, kinds, atomic, memory })
const sourceArtifacts = [helperPath, 'app/scripts/semanticAtomicityReview.ts', 'app/scripts/memoryCardReview.ts', 'app/scripts/goalBookModel.ts'].map(path => ({ path, sha256: sha(readFileSync(path)) }))
const recordedAt = new Date().toISOString()
const changes: any[] = []
const unique = (rows: any[], field: string, goalId: string) => {
  const matches = rows.filter(row => row[field] === goalId)
  assert.equal(matches.length, 1, `Missing or duplicate ${field}: ${goalId}`)
  return matches[0]
}
const textFields = (g: any) => ({ title: g.title, titleEn: g.titleEn, description: g.description, descriptionEn: g.descriptionEn })
for (const s of specifications) {
  const g = unique(canonical.goals, 'id', s.goalId)
  const a = unique(atomic, 'goalId', s.goalId), m = unique(memory, 'goalId', s.goalId), k = unique(kinds.decisions, 'goalId', s.goalId)
  assert.equal(g.title, s.expectedTitleDe); assert.equal(g.description, s.expectedDescriptionDe)
  assert.equal(g.titleEn, g.title, 'Repair requires exact EN=DE title evidence')
  assert.equal(g.descriptionEn, g.description, 'Repair requires exact EN=DE description evidence')
  assert.deepEqual(g.contains ?? [], []); assert.ok(!g.examData)
  assert.ok(!(g.tags ?? []).some((tag: string) => ['Practice', 'Assessment', 'Motivation', 'Orientation', 'memorization'].includes(tag) || tag.startsWith('srs-deck:')))
  assert.equal(a.status, 'atomic'); assert.equal(a.semanticAtomic, true)
  assert.equal(m.status, 'no_memory_needed'); assert.equal(m.memoryUseful, false)
  assert.equal(k.semanticKind, 'curricularAtomic')
  assert.equal(a.fingerprint, atomicFingerprint(g, a.ruleVersion), 'Atomicity input binding drift')
  assert.equal(m.fingerprint, memoryFingerprint(g, m.ruleVersion), 'Memory input binding drift')
  assert.equal(k.sourceFingerprint, fingerprintSemanticKindSourceGoal(g), 'Semantic-kind input binding drift')
  const before = structuredClone(g), bindingsBefore = structuredClone({ atomicity: a, memory: m, semanticKind: k })
  g.titleEn = s.titleEn; g.descriptionEn = s.descriptionEn
  const reverted = structuredClone(g)
  for (const field of ['titleEn', 'descriptionEn']) reverted[field] = before[field]
  assert.deepEqual(reverted, before, 'Canonical mutation exceeds two EN fields')
  k.sourceFingerprint = fingerprintSemanticKindSourceGoal(g)
  assert.deepEqual({ ...k, sourceFingerprint: bindingsBefore.semanticKind.sourceFingerprint }, bindingsBefore.semanticKind, 'Semantic-kind status, basis or authority changed')
  for (const [record, previous, reason, fingerprint] of [[a, bindingsBefore.atomicity, s.atomicityReason, atomicFingerprint], [m, bindingsBefore.memory, s.memoryReason, memoryFingerprint]] as const) {
    record.fingerprint = fingerprint(g, record.ruleVersion)
    record.reviewedAt = recordedAt.slice(0, 10)
    record.reviewer = 'codex-physics-b039-two-en-preflight'
    record.reason = 'Individuelle fachliche AI-Prüfung bei reiner EN-Übersetzungsvorbereitung: ' + reason + ' Bestehender Status unverändert; keine menschliche Einzelabnahme oder D-Reviewentscheidung behauptet.'
    const restored = structuredClone(record)
    for (const field of ['fingerprint', 'reviewedAt', 'reviewer', 'reason']) restored[field] = previous[field]
    assert.deepEqual(restored, previous, 'A/M mutation exceeds fingerprint and AI review attribution')
  }
  changes.push({ goalId: g.id, defectEvidence: { titleEnExactlyCopiedGerman: before.titleEn === before.title, descriptionEnExactlyCopiedGerman: before.descriptionEn === before.description }, before: textFields(before), after: textFields(g), changedCanonicalFields: ['titleEn', 'descriptionEn'], goalBeforeSha256: sha(JSON.stringify(before)), goalAfterSha256: sha(JSON.stringify(g)), bindingsBefore, bindingsAfter: structuredClone({ atomicity: a, memory: m, semanticKind: k }), individualReassessment: { authority: 'ai_candidate', humanApprovalClaimed: false, atomicityReason: s.atomicityReason, memoryReason: s.memoryReason, semanticKindReason: s.semanticKindReason } })
}
const revertedAll = structuredClone({ canonical, kinds, atomic, memory })
for (const change of changes) {
  Object.assign(unique(revertedAll.canonical.goals, 'id', change.goalId), change.before)
  Object.assign(unique(revertedAll.kinds.decisions, 'goalId', change.goalId), change.bindingsBefore.semanticKind)
  Object.assign(unique(revertedAll.atomic, 'goalId', change.goalId), change.bindingsBefore.atomicity)
  Object.assign(unique(revertedAll.memory, 'goalId', change.goalId), change.bindingsBefore.memory)
}
assert.deepEqual(revertedAll, completeBefore, 'Unrelated goal, metadata, graph or binding mutation')
const outputs = serialize()
let patch = '*** Begin Patch\n'
for (const [index, path] of paths.entries()) {
  const previous = originals[index].split('\n'), next = outputs[index].split('\n')
  assert.equal(previous.length, next.length, 'Unexpected line-count change: ' + path)
  const changed = previous.flatMap((line, n) => line === next[n] ? [] : [n])
  assert.equal(changed.length, index === 0 ? 4 : 2, 'Unexpected changed-line count: ' + path)
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
const receipt = {
  schemaVersion: 1,
  artifactType: 'physics-b039-preflight-two-en-translations-v1',
  recordedAt,
  authority: { execution: 'codex_ai_agent', reviewAuthority: 'ai_candidate', humanApprovalClaimed: false, scopeDirection: 'Root-authorized exact translation preparation of two EN title/description pairs before fresh independent description-review rounds.' },
  descriptionReviewRecords: [],
  freshIndependentDescriptionReviewRequired: true,
  sourceArtifacts,
  changes,
  fileDigests: paths.map((path, i) => ({ path, beforeSha256: sha(originals[i]), afterSha256: sha(outputs[i]) })),
  boundaries: ['Exactly four canonical fields changed: two English titles and two English descriptions. All German fields, IDs, source evidence, graph relations, applicability, images and unrelated goals are preserved.', 'Two existing atomic and two existing no_memory_needed decisions were individually re-evaluated; only fingerprint, date, reviewer and AI reasoning change. No classification or authority is promoted.', 'Only the two affected semantic-kind source fingerprints change; every existing semanticKind, decisionStatus and decisionBasis is retained.', 'No D-review record, independent-round claim, profile, image, QA, registry, in-flight claim, public book, runtime artifact or generated quality report is created or changed.'],
  recovery: 'Verify each affected field against its recorded after value before restoring only the recorded before texts and binding fields. Do not overwrite later independent changes or restore whole shared files.'
}
patch += `*** Add File: ${receiptPath}\n` + JSON.stringify(receipt, null, 2).split('\n').map(line => '+' + line).join('\n') + '\n*** End Patch\n'
for (const [i, path] of paths.entries()) assert.equal(readFileSync(path, 'utf8'), originals[i], 'Concurrent shared-file drift: ' + path)
for (const artifact of sourceArtifacts) assert.equal(sha(readFileSync(artifact.path)), artifact.sha256, 'Concurrent native-source drift: ' + artifact.path)
assert.equal(existsSync(receiptPath), false, 'Receipt appeared concurrently')
process.stdout.write(patch)
