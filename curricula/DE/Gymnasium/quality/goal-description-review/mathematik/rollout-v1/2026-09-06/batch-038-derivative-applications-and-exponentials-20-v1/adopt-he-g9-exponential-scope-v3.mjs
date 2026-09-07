// Scoped Layer-A adoption of the separately reviewed v3 option. No gate/profile adoption.
// Preview is read-only. --write is guarded by exact canonical, source and mapping bytes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const repo = resolve(directory, '../../../../../../../../..');
const args = process.argv.slice(2);
assert(args.length <= 1 && args.every(arg => ['--write', '--check'].includes(arg)), 'Use no arguments, --write or --check');
const paths = {
  canonical: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
  mapping: 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json',
  source: 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json',
};
const baseline = {
  canonical: 'fd9108cf0ccc8176f1fdd3e5633ac716544cff9aa72bcaf8c1f11ad93728d34e',
  mapping: 'ecc6b19f67dbb8a55e47ae00eec46a7a441527d92f2d68a52a2d6c558bde4ceb',
  source: '3ec1451c515f4bc70d97690331ca66f922d933355c4326e1dc4100a95e3e664c',
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = path => readFileSync(resolve(repo, path));
const json = path => JSON.parse(bytes(path));
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const receiptPath = resolve(directory, 'adoption-he-g9-exponential-scope-v3.receipt.json');
if (args.includes('--check')) {
  const receipt = JSON.parse(readFileSync(receiptPath));
  for (const key of ['canonical', 'mapping']) assert.equal(sha(bytes(paths[key])), receipt.files[key].afterSha256, key + ': adoption drifted');
  assert.equal(sha(bytes(paths.source)), baseline.source, 'source drifted');
  console.log('CHECK B038h_v3_core_adoption PASS canonicalRequires=4 sourceDecisions=3 mappingRemove=2 add=2 partial=3');
  process.exit(0);
}
assert(!existsSync(receiptPath), 'Immutable receipt already exists; use --check, not another adoption');
for (const [key, path] of Object.entries(paths)) assert.equal(sha(bytes(path)), baseline[key], key + ': expected reviewed checkpoint');
const canonical = json(paths.canonical), mapping = json(paths.mapping), extraction = json(paths.source);
const originalCanonical = structuredClone(canonical), originalMapping = structuredClone(mapping);
const goals = new Map(canonical.goals.map(goal => [goal.id, goal]));
const sourceGoals = new Map(extraction.sourceGoals.map(goal => [goal.id, goal]));
const ids = {
  growth: '781f133a-08bb-54b9-8fda-efa2f8f9b12c', parameters: '346efb31-c400-5bd3-a698-dd9a7e1bc3f7',
  properties: '628928a6-4f48-54dc-952d-dec0e69dc856', continuous: 'f05acdc5-4949-54c7-b8cd-56ddd1fbdbad',
  equations: 'd900e0a4-0c45-50dd-a37b-01f9f91a134c', models: 'ab720928-9dbc-53c2-a1f8-865dda92122d',
  comparison: '49f9059a-876c-5051-8146-d008b5cc691c', logarithm: '3c1d6ce7-099e-4267-9ff2-3d1526209a89',
  inverse: 'c15fe32d-1c83-4127-b1a4-9125af3d8f5d', inverseGraph: 'dbc13bb0-963b-49a8-a441-2183f4b64c8e',
  lowerEquations: 'c088fd81-fe4f-4282-99af-ebc0d1a7d202', lowerInverse: 'aed3ca99-815b-40b8-ae91-e11bf92f51da',
  cluster: '48e7615d-3e6e-4b5c-9df3-310e510f91f0', orientation: '71cec9fb-3751-4d61-8b34-c5adbbf6e5f2',
  derivatives: '858113c5-e53b-57bb-b01f-ba95c3ddcb6f', fundamentalTheorem: 'b9bbd2a8-1379-5ffb-817f-41467d48abef',
};
const seven = ['growth', 'parameters', 'properties', 'continuous', 'equations', 'models', 'comparison'].map(key => ids[key]);
assert.deepEqual(goals.get(ids.cluster).contains, seven);
const changes = [
  { goalId: ids.growth, before: [ids.orientation, ids.derivatives], after: [ids.orientation], reason: 'Wachstum/Zerfall in Tabellen, Graphen und Kontexten erkennen und Exponentialfunktionen zuordnen erfordert keine Differentiation. Die bestehende Orientierung bleibt erhalten.' },
  { goalId: ids.properties, before: [ids.parameters], after: [ids.parameters, ids.derivatives], reason: 'Die erklärte Ableitungseigenschaft von e^x braucht die Ableitungsbasis. Diese Kante wird vom elementaren Wachstumsziel hierher verschoben; Calculus-Nachfolger bleiben abgesichert.' },
  { goalId: ids.equations, before: [ids.properties], after: [ids.growth], reason: 'Ein unbekannter Exponent wird durch die im Ziel selbst erklärte und begründete inverse Operation bestimmt. Exponentialmodellverständnis geht voraus; e^x-Ableitung und heimlich gemeisterte J10-Logarithmen werden nicht vorausgesetzt. Frisches positives Profil muss die inverse Operation innerhalb dieses Ziels nachweisen.' },
  { goalId: ids.inverse, before: [ids.fundamentalTheorem, ids.derivatives, ids.orientation], after: [ids.orientation], reason: 'Die elementare Umkehrbarkeits-, Funktionsgleichungs- und Definitions-/Wertemengenleistung benötigt weder Differentiation noch den Hauptsatz. Die gesonderte HE-Sek-I-Projektionslücke der bestehenden Orientierung bleibt HOLD.' },
];
for (const change of changes) {
  assert.deepEqual(goals.get(change.goalId).requires, change.before);
  goals.get(change.goalId).requires = change.after;
}
const s04 = 'he-math-seki-g9-10-2-04-d7759617', s06 = 'he-math-seki-g9-10-2-06-6ae4d32a', s07 = 'he-math-seki-g9-10-2-07-5e841891';
const sources = [s04, s06, s07];
const remove = [[s04, ids.parameters], [s07, ids.cluster]];
const revise = [ids.logarithm, ids.inverse, ids.inverseGraph];
const additions = [[s06, ids.lowerEquations], [s07, ids.lowerInverse]].map(([source, target]) => ({ legacyGoalId: source, canonicalGoalId: target, matchType: 'partial', reviewDecisionId: source }));
for (const [source, target] of remove) assert.equal(mapping.mappings.filter(edge => edge.legacyGoalId === source && edge.canonicalGoalId === target && edge.matchType === 'exact').length, 1);
for (const target of revise) assert.equal(mapping.mappings.filter(edge => edge.legacyGoalId === s07 && edge.canonicalGoalId === target && edge.matchType === 'exact').length, 1);
for (const addition of additions) assert(!mapping.mappings.some(edge => edge.legacyGoalId === addition.legacyGoalId && edge.canonicalGoalId === addition.canonicalGoalId));
mapping.mappings = mapping.mappings.filter(edge => !remove.some(([source, target]) => edge.legacyGoalId === source && edge.canonicalGoalId === target))
  .map(edge => edge.legacyGoalId === s07 && revise.includes(edge.canonicalGoalId) ? { ...edge, matchType: 'partial' } : edge);
for (const addition of additions) mapping.mappings.splice(mapping.mappings.findLastIndex(edge => edge.legacyGoalId === addition.legacyGoalId) + 1, 0, addition);
const rationales = {
  [s04]: 'Frische fachliche AI-Adjudikation B038h v3 (2026-09-06), G9 10.2, gedruckte S. 38: Verdopplungs-/Halbierungszeiten und Parameter werden in der G9-Projektion durch die bereits vorhandenen J10-Ziele c19d1f8f (partial) und c74d0c7e (bestehende exact-Kante unverändert) vertreten. Die zusätzliche E-Phasen-Kante auf 346efb31 entfällt ohne Kompetenzverlust; eine zweite Oberstufenroute ist dafür nicht erforderlich. Die beiden unveränderten Kanten erhalten hierdurch keine neue Einzelabnahme. Keine menschliche Quellenfreigabe behauptet.',
  [s06]: 'Frische fachliche AI-Adjudikation B038h v3 (2026-09-06), G9 10.2, gedruckte S. 38: partial-Kante auf das vorhandene J10-Ziel c088fd81 ergänzt. Den unbekannten Exponenten durch Logarithmieren als inverse Operation bestimmen ist unmittelbar gedeckt; Überprüfung und Kontextdeutung stützen sich zusätzlich auf den expliziten Anwendungs- und Modellierungsauftrag derselben Einheit. Die vier bisherigen Verweise bleiben unverändert; diese begrenzte Adjudikation ist keine neue Abnahme aller ihrer exact-Behauptungen. Keine e^x-Ableitung, kein still vorausgesetztes Calculus und keine menschliche Einzelabnahme.',
  [s07]: 'Frische fachliche AI-Adjudikation B038h v3 (2026-09-06), G9 10.2, gedruckte S. 38: Die pauschale exact-Kante zum siebenkindigen E-Cluster 48e7615d entfällt; natürliche Basis, Ableitung und asymptotische Dominanz werden von dieser Zeile nicht verlangt. 3c1d6ce7 bleibt partial für den inversen Zusammenhang, c15fe32d partial für die Umkehrbarkeit der ausgewählten Exponentialfunktion mit Definitions-/Wertebereich und dbc13bb0 partial für die Beziehung von Exponential- und Logarithmusgraph. aed3ca99 wird partial für Exponential-/Logarithmusschreibweise als Umkehrwerkzeug ergänzt, nicht als Ersatz des eigenständigen Graphauftrags. c15fe32d/dbc13bb0 behalten eine gesonderte offene Orientierungsprojektion; keine vollständige Routenabnahme oder menschliche Einzelabnahme behauptet.',
};
const beforeDecisions = originalMapping.decisions.filter(decision => sources.includes(decision.sourceGoalId));
assert.equal(beforeDecisions.length, 3);
mapping.decisions = mapping.decisions.map(decision => !sources.includes(decision.sourceGoalId) ? decision : {
  ...decision,
  canonicalGoalIds: mapping.mappings.filter(edge => edge.legacyGoalId === decision.sourceGoalId).map(edge => edge.canonicalGoalId),
  matchType: 'partial', rationale: rationales[decision.sourceGoalId], reviewedAt: '2026-09-06',
  reviewer: 'Codex fachliche AI-Adjudikation B038h v3; keine menschliche Einzelabnahme',
});
for (const decision of mapping.decisions.filter(decision => sources.includes(decision.sourceGoalId))) assert.deepEqual(decision.canonicalGoalIds, mapping.mappings.filter(edge => edge.legacyGoalId === decision.sourceGoalId).map(edge => edge.canonicalGoalId));
const atomic = id => (goals.get(id)?.contains?.length ?? 0) ? goals.get(id).contains.flatMap(atomic) : [id];
const rawG9 = edges => new Set(edges.filter(edge => sourceGoals.get(edge.legacyGoalId)?.tags?.includes('durationModel:G9')).flatMap(edge => atomic(edge.canonicalGoalId)));
const oldScope = rawG9(originalMapping.mappings), nextScope = rawG9(mapping.mappings);
const rawScopeDelta = { removed: [...oldScope].filter(id => !nextScope.has(id)).sort(), added: [...nextScope].filter(id => !oldScope.has(id)).sort() };
assert.deepEqual(rawScopeDelta.removed, [...seven].sort());
assert.deepEqual(rawScopeDelta.added, [ids.lowerEquations, ids.lowerInverse].sort());
const checked = new Set(), visiting = new Set();
function visit(id) { assert(!visiting.has(id), 'Requires cycle: ' + id); if (checked.has(id)) return; visiting.add(id); for (const required of goals.get(id)?.requires ?? []) { assert(goals.has(required), 'Missing prerequisite: ' + required); visit(required); } visiting.delete(id); checked.add(id); }
canonical.goals.forEach(goal => visit(goal.id));
const changedGoalIds = changes.map(change => change.goalId);
const dependencyContextAffectedGoalIds = new Set(changedGoalIds);
let added;
do { added = false; for (const goal of canonical.goals) if (!dependencyContextAffectedGoalIds.has(goal.id) && (goal.requires ?? []).some(id => dependencyContextAffectedGoalIds.has(id))) { dependencyContextAffectedGoalIds.add(goal.id); added = true; } } while (added);
for (const goal of originalCanonical.goals) {
  const next = goals.get(goal.id);
  assert.deepEqual({ ...goal, requires: next.requires }, next, 'Non-requires field changed: ' + goal.id);
  if (!changedGoalIds.includes(goal.id)) assert.deepEqual(next, goal);
}
assert.deepEqual(originalMapping.decisions.filter(decision => !sources.includes(decision.sourceGoalId)), mapping.decisions.filter(decision => !sources.includes(decision.sourceGoalId)));
assert.deepEqual(originalMapping.mappings.filter(edge => !sources.includes(edge.legacyGoalId)), mapping.mappings.filter(edge => !sources.includes(edge.legacyGoalId)));
const finalBytes = { canonical: serialize(canonical), mapping: serialize(mapping) };
const receipt = {
  schemaVersion: 1, adoptionId: 'B038h-HE-G9-exponential-v3', adoptedAt: '2026-09-06',
  status: 'SCOPED_LAYER_A_ADOPTED_NOT_GOAL_ACCEPTANCE', authority: 'Fachliche AI-Adjudikation unter der allgemeinen Userfreigabe für echte Layer-A-Verbesserungen; keine menschliche Einzelprüfung behauptet.',
  source: { path: paths.source, sha256: baseline.source, sourceGoalIds: sources, originalUrl: 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-06/g9-mathematik.pdf', printedPage: 38, section: '10.2 Funktionen', readBack: 'Quellzeilen 04/06/07 plus benachbarte Darstellungs-, Anwendungs- und Modellierungsanforderungen am Original gegengelesen; G9 bleibt legacy-grade-sequencing-reference, KC binding-core.' },
  files: Object.fromEntries(['canonical', 'mapping'].map(key => [key, { path: paths[key], beforeSha256: baseline[key], afterSha256: sha(finalBytes[key]) }])),
  immutableEvidence: Object.fromEntries(['source-scope-49f9059a-seven-child-proposal-v1.md', 'source-scope-49f9059a-route-audit-v2.md', 'source-scope-49f9059a-stage-route-option-v3.md', 'audit-he-g9-exponential-route-v2.ts', 'adopt-he-g9-exponential-scope-v3.mjs'].map(name => [name, sha(readFileSync(resolve(directory, name)))])),
  canonicalRequiresDelta: changes, changedGoalIds,
  beforeGoals: originalCanonical.goals.filter(goal => changedGoalIds.includes(goal.id)),
  mappingDelta: { remove: originalMapping.mappings.filter(edge => remove.some(([source, target]) => source === edge.legacyGoalId && target === edge.canonicalGoalId)), add: additions, revise: originalMapping.mappings.filter(edge => edge.legacyGoalId === s07 && revise.includes(edge.canonicalGoalId)).map(edge => ({ before: edge, after: { ...edge, matchType: 'partial' } })) },
  sourceDecisionDelta: beforeDecisions.map(before => ({ before, after: mapping.decisions.find(decision => decision.sourceGoalId === before.sourceGoalId) })),
  rawG9ProjectionDelta: rawScopeDelta,
  sourceContextAffectedGoalIds: [...new Set([...seven, ids.logarithm, ids.inverse, ids.inverseGraph, ids.lowerEquations, ids.lowerInverse])].sort(),
  dependencyContextAffectedGoalIds: [...dependencyContextAffectedGoalIds].sort(),
  freshPositiveEvidenceRequirement: { goalId: ids.equations, inverseOperationWithinGoal: true, requirements: ['Logarithmus als Umkehrung für einen unbekannten Exponenten im Ziel selbst erläutern und begründen; keine unsichtbare J10-Mastery voraussetzen.', 'Division durch die Basis als falsche Alternative unterscheiden; Basis-/Definitionsbedingungen prüfen.', 'Lösung durch Einsetzen überprüfen und im Sachkontext beurteilen; kein bloßes Taschenrechnertippen.'] },
  hold: { goalIds: [ids.inverse, ids.inverseGraph], reason: 'Vorhandene Orientierung 71cec9fb ist in HE-Sek-I nicht sichtbar; keine Projektionsentscheidung in dieser Adoption.', goalAcceptance: false },
  preserved: ['Alle Goal-IDs, DE/EN-Texte, contains, Bilder, Tags und fachlichen Geltungsfelder', 'Alle unveränderten Source-Decisions und Mapping-Kanten außerhalb der drei Quellen', 'Runtime, Mastery und eingefrorene V1-Verträge', 'Originale v1/v2/v3/audit-Evidenz, keine breite Rebindung'],
  checks: { allRequiresAcyclic: true, mappingDecisionAlignment: true, exactRawG9Delta: true, onlyFourRequiresChanged: true },
  pending: ['Vier individuelle A/M/SemanticKinds-Folgeprüfungen', 'Native Duration-/View-Generierung und tatsächlicher Scopevergleich', 'Frische positive Ziel-/Seiten-/Kontextnachweise durch Root, Maturity-Floors und zentrale Berichte'],
};
if (args.includes('--write')) {
  for (const key of ['canonical', 'mapping']) writeFileSync(resolve(repo, paths[key]), finalBytes[key]);
  writeFileSync(receiptPath, serialize(receipt), { flag: 'wx' });
}
console.log(JSON.stringify({ mode: args.includes('--write') ? 'WRITE' : 'PREVIEW', files: receipt.files, changedGoalIds, rawG9ProjectionDelta: rawScopeDelta, sourceContextAffectedGoalIds: receipt.sourceContextAffectedGoalIds, dependencyContextAffectedGoalIds: receipt.dependencyContextAffectedGoalIds, receiptPath }, null, 2));
