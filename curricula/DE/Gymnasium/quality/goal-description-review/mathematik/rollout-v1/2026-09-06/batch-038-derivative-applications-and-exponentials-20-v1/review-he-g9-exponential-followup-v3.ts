// Four individually adjudicated native review records and one layout-preserving input binding.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../../../app/scripts/goalBookModel'

const directory = dirname(fileURLToPath(import.meta.url))
const repo = resolve(directory, '../../../../../../../../..')
const args = process.argv.slice(2)
assert(args.length <= 1 && args.every(arg => ['--write', '--check'].includes(arg)), 'Use no arguments, --write or --check')
const sha = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
const read = (path: string) => readFileSync(resolve(repo, path), 'utf8')
const json = (path: string) => JSON.parse(read(path))
const serialize = (value: unknown) => JSON.stringify(value, null, 2) + '\n'
const jsonl = (records: any[]) => records.map(record => JSON.stringify(record)).join('\n') + '\n'
const base = relative(repo, directory)
const receiptPath = `${base}/adoption-he-g9-exponential-scope-v3.receipt.json`
const auditPath = `${base}/duration-scope-adjudication-v3.json`
const followupPath = `${base}/review-followup-v3.receipt.json`
const receipt = json(receiptPath)
const paths = {
  canonical: receipt.files.canonical.path,
  atomicity: 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
  memory: 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl',
  semanticKinds: 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json',
  policy: 'app/scripts/config/math-duration-split-spanning-tree-policy.json',
}
assert.equal(sha(read(paths.canonical)), receipt.files.canonical.afterSha256)
assert.equal(sha(read(receipt.files.mapping.path)), receipt.files.mapping.afterSha256)
if (args.includes('--check')) {
  const followup = json(followupPath)
  const correctionPath = `${base}/semantic-kind-enum-correction-v3.receipt.json`
  const correction = existsSync(resolve(repo, correctionPath)) ? json(correctionPath) : null
  for (const file of followup.files) {
    const expected = correction && file.path === correction.path ? correction.afterSha256 : file.afterSha256
    if (correction && file.path === correction.path) assert.equal(correction.beforeSha256, file.afterSha256)
    assert.equal(sha(read(file.path)), expected, file.path + ': followup drifted')
  }
  console.log('CHECK B038h_v3_followup PASS reviews=4x3 unchangedAMFingerprints=8 preservedLayoutPlacements=61')
  process.exit(0)
}
assert(!existsSync(resolve(repo, followupPath)) && !existsSync(resolve(repo, auditPath)), 'Existing immutable followup; use --check')
const canonical = json(paths.canonical)
const goals = new Map<string, any>(canonical.goals.map((goal: any) => [goal.id, goal]))
const originalBytes = Object.fromEntries(Object.entries(paths).filter(([key]) => key !== 'canonical').map(([key, path]) => [key, read(path)]))
const atomicity = originalBytes.atomicity.trimEnd().split('\n').map((line: string) => JSON.parse(line))
const memory = originalBytes.memory.trimEnd().split('\n').map((line: string) => JSON.parse(line))
const kinds = JSON.parse(originalBytes.semanticKinds)
const policy = JSON.parse(originalBytes.policy)
assert.equal(policy.inputs.canonical.sha256, receipt.files.canonical.beforeSha256)
const originalPolicy = structuredClone(policy)
const decisions: Record<string, { atomicity: string; memory: string }> = {
  '781f133a-08bb-54b9-8fda-efa2f8f9b12c': {
    atomicity: 'Eine Diagnoseleistung: den konstanten relativen Änderungsfaktor aus Tabelle, Graph oder Kontext erkennen und demselben exponentiellen Prozess einen Funktionstyp zuordnen. Darstellungen sind Evidenz für denselben Gegenstand, keine unabhängigen Routinen. Die Ableitung wird hierfür nicht gebraucht; der requires-Abbau ändert nicht den semantischen Kern.',
    memory: 'Kennzeichen müssen an neuen Daten oder Graphen begründet werden. Ein isoliertes Abrufen einer Exponentialformel ersetzt weder Erkennen noch Abgrenzen gegen lineare Entwicklung; kein eigenes Memory-Deck erforderlich.',
  },
  '628928a6-4f48-54dc-952d-dec0e69dc856': {
    atomicity: 'Eine zusammenhängende Begründung der natürlichen Exponentialfunktion: ihre spezielle Ableitungseigenschaft wird mit Werten und Grenzverhalten verknüpft. Die DE/EN-Fassung bleibt identisch; die hierher verschobene Ableitungsbasis sichert die vorhandene Erklärung ab, statt einen zusätzlichen Lerngegenstand zu schaffen.',
    memory: 'Der Gegenstand ist die begründete Verbindung von Exponentialgesetz, Positivität, Ableitung und Grenzverhalten. Abruf von e≈2,718 oder einer Ableitungsformel weist diese Erklärung nicht nach; das bestehende no_memory_needed bleibt zielbezogen angemessen.',
  },
  'd900e0a4-0c45-50dd-a37b-01f9f91a134c': {
    atomicity: 'Eine Gleichungslöseleistung mit notwendiger Validierung: den unbekannten Exponenten durch die im Ziel selbst erarbeitete inverse Operation bestimmen, die Lösung durch Einsetzen prüfen und auf den Ausgangskontext zurückbeziehen. Die inverse Operation darf nicht als unsichtbare J10-Mastery angenommen werden. Ein frischer positiver Nachweis muss die Abgrenzung zur Division durch die Basis und die Definitionsbedingungen sichtbar prüfen; keine bloße Bedienroutine.',
    memory: 'Logarithmische Umformung, zulässige Basis/Argumente, Einsetzprobe und Kontextdeutung müssen an einer neuen Exponentialgleichung begründet zusammenspielen. Ein zusätzliches Merkdeck würde das Verständnis der inversen Operation nicht tragen; no_memory_needed bleibt begründet.',
  },
  'c15fe32d-1c83-4127-b1a4-9125af3d8f5d': {
    atomicity: 'Eine Umkehrfunktionskonstruktion: die eindeutige Umkehrbarkeit der ausgewählten Funktion samt Bereichsbeschränkung feststellen und daraus die passende Umkehrgleichung mit getauschter Definitions-/Wertemenge gewinnen. Die Bereichsprüfung ist notwendiger Teil derselben Leistung, keine zweite Routine. Weder Differentiation noch der Hauptsatz sind dafür erforderlich. Die noch offene HE-Sek-I-Orientierungsprojektion wird nicht als erledigt bewertet.',
    memory: 'Eine auswendig gelernte Formel für eine einzelne Umkehrfunktion reicht nicht: Bereichswahl, Eindeutigkeit und Umkehrgleichung sind am jeweiligen Beispiel zu begründen. Kein neues Memory-Deck; der Projektions-HOLD bleibt hiervon unabhängig.',
  },
}
assert.deepEqual(Object.keys(decisions).sort(), [...receipt.changedGoalIds].sort())
const normalize = (value: unknown) => String(value ?? '').normalize('NFKC').replace(/\s+/gu, ' ').trim()
const stable = (value: any): string => Array.isArray(value) ? `[${value.map(stable).join(',')}]` : value && typeof value === 'object' ? `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${stable(child)}`).join(',')}}` : JSON.stringify(value)
const fingerprint = (goal: any, ruleVersion: string) => 'sha256:' + sha(stable({ ruleVersion, goalId: goal.id, shortKey: goal.shortKey ?? '', title: normalize(goal.title), titleEn: normalize(goal.titleEn), description: normalize(goal.description), descriptionEn: normalize(goal.descriptionEn), phase: normalize(goal.dimensionTags?.phase), area: normalize(goal.dimensionTags?.area), topicCode: normalize(goal.dimensionTags?.topicCode), nodeKind: normalize(goal.nodeKind) }))
const reviews: any[] = []
for (const [goalId, rationale] of Object.entries(decisions)) {
  const goal = goals.get(goalId)
  const a = atomicity.find((record: any) => record.goalId === goalId)
  const m = memory.find((record: any) => record.goalId === goalId)
  const s = kinds.decisions.find((record: any) => record.goalId === goalId)
  assert(goal && a && m && s, goalId + ': missing native record')
  assert.equal(a.status, 'atomic'); assert.equal(m.status, 'no_memory_needed')
  assert.equal(s.semanticKind, 'curricularAtomic'); assert.equal(s.decisionStatus, 'authoritative')
  const before = { atomicity: structuredClone(a), memory: structuredClone(m), semanticKind: structuredClone(s) }
  // Native A/M payloads exclude requires. Re-evaluate, but do not fabricate different hashes.
  assert.equal(fingerprint(goal, 'semantic-atomicity-v1'), a.fingerprint)
  assert.equal(fingerprint(goal, 'memory-card-review-v1'), m.fingerprint)
  const authority = ' Frische individuelle fachliche AI-Prüfung B038h v3; keine menschliche Einzelabnahme oder vollständige Zielabnahme behauptet.'
  const common = { reviewedAt: '2026-09-06', reviewer: 'codex-math-b038h-v3-source-route-individual-review' }
  Object.assign(a, common, { reason: rationale.atomicity + authority })
  Object.assign(m, common, { reason: rationale.memory + authority })
  s.sourceFingerprint = fingerprintSemanticKindSourceGoal(goal)
  s.decisionBasis = 'reviewed-current-pilot-curricular-atomic'
  reviews.push({ goalId, before, after: { atomicity: structuredClone(a), memory: structuredClone(m), semanticKind: structuredClone(s) } })
}
const layoutPayload = ({ inputs, ...layout }: any) => layout
const layoutSha = sha(JSON.stringify(layoutPayload(policy)))
const audit: any = {
  schemaVersion: 1, adjudicationId: 'B038h-v3-source-route-layout-preserving-binding', status: 'SCOPED_LAYER_A_AI_ADJUDICATION',
  sourceAdoption: { path: receiptPath, fileSha256: sha(read(receiptPath)) },
  canonicalBeforeSha256: receipt.files.canonical.beforeSha256, canonicalAfterSha256: receipt.files.canonical.afterSha256,
  policyPath: paths.policy, policyBeforeSha256: sha(originalBytes.policy),
  preservedLayoutSha256: layoutSha, preservedSplitPlacementCount: policy.counts.splitPlacementCount,
  invariant: 'All 61 authored layout placements, template filters, policy text and earlier adjudication bindings stay byte-semantically identical. Only the canonical input binding advances and this new scope receipt is appended. Mapping buckets remain the existing authority for ordinary atomic target sets; no fresh human layout approval is asserted.',
  reviewAuthority: 'Vier individuelle fachliche AI-Entscheidungen unter allgemeiner Layer-A-Freigabe, keine menschliche Einzelabnahme.',
  changedGoalIds: receipt.changedGoalIds, rawG9ProjectionDelta: receipt.rawG9ProjectionDelta,
  freshPositiveEvidenceRequirement: receipt.freshPositiveEvidenceRequirement, hold: receipt.hold,
}
assert.equal(policy.counts.splitPlacementCount, 61)
audit.adjudicationDigest = 'sha256:' + sha(JSON.stringify(audit))
const auditBytes = serialize(audit)
policy.inputs.canonical.sha256 = receipt.files.canonical.afterSha256
policy.inputs.additiveAdjudications.push({ path: auditPath, fileSha256: sha(auditBytes), adjudicationDigest: audit.adjudicationDigest })
assert.deepEqual(layoutPayload(policy), layoutPayload(originalPolicy), 'Layout changed')
assert.deepEqual(policy.inputs.additiveAdjudications.slice(0, -1), originalPolicy.inputs.additiveAdjudications)
const outputs = { atomicity: jsonl(atomicity), memory: jsonl(memory), semanticKinds: serialize(kinds), policy: serialize(policy) }
const followup = {
  schemaVersion: 1, status: 'SCOPED_FOLLOWUP_ADOPTED_NOT_GOAL_ACCEPTANCE', adoptionId: receipt.adoptionId,
  files: Object.entries(outputs).map(([key, output]) => ({ path: paths[key as keyof typeof paths], beforeSha256: sha(originalBytes[key]), afterSha256: sha(output) })),
  reviews, durationAdjudication: { path: auditPath, fileSha256: sha(auditBytes) },
  beforePolicyInputs: originalPolicy.inputs,
  checks: { reviewedAtomicityAndMemoryIndividually: 4, unchangedNativeAMFingerprints: 8, currentSemanticKinds: 4, unchangedLayoutPlacements: 61 },
  remaining: ['Native duration/view preview and content comparison', 'Root-owned source/applicability, goal evidence, page/context and maturity checks', 'c15/dbc projection HOLD'],
}
if (args.includes('--write')) {
  writeFileSync(resolve(repo, auditPath), auditBytes, { flag: 'wx' })
  for (const [key, output] of Object.entries(outputs)) writeFileSync(resolve(repo, paths[key as keyof typeof paths]), output)
  writeFileSync(resolve(repo, followupPath), serialize(followup), { flag: 'wx' })
}
console.log(JSON.stringify({ mode: args.includes('--write') ? 'WRITE' : 'PREVIEW', files: followup.files, checks: followup.checks, durationAdjudication: followup.durationAdjudication }, null, 2))
