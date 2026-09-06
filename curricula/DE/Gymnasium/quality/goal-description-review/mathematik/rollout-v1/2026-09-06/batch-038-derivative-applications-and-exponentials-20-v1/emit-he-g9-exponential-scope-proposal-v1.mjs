// Read-only, source-bound AI candidate emitter. Never adopts or writes repository data.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASELINE = {
  "semanticDigest": "sha256:fcb87da6f07ea13a881ca248198f054a4b9df0159c9ae80ef9476578005f6f85",
  "sourceDigest": "sha256:67fb685b0e9a4552a1e0b9fbe073a4de249aab4b357406a5134cabf8df0b4572",
  "mappingSliceDigest": "sha256:a4bee6bef6dbf31faa3ab60b082ab8043e9410ab2ba04b0b60d52d6bf5f02c9f",
  "sourceIds": [
    "he-math-seki-g9-10-2-03-4efce4b0",
    "he-math-seki-g9-10-2-06-6ae4d32a",
    "he-math-seki-g9-10-2-07-5e841891",
    "he-math-seki-g9-10-2-08-f88dcace"
  ],
  "ids": [
    "781f133a-08bb-54b9-8fda-efa2f8f9b12c",
    "346efb31-c400-5bd3-a698-dd9a7e1bc3f7",
    "628928a6-4f48-54dc-952d-dec0e69dc856",
    "f05acdc5-4949-54c7-b8cd-56ddd1fbdbad",
    "d900e0a4-0c45-50dd-a37b-01f9f91a134c",
    "ab720928-9dbc-53c2-a1f8-865dda92122d",
    "49f9059a-876c-5051-8146-d008b5cc691c",
    "3c1d6ce7-099e-4267-9ff2-3d1526209a89",
    "c15fe32d-1c83-4127-b1a4-9125af3d8f5d",
    "dbc13bb0-963b-49a8-a441-2183f4b64c8e"
  ]
};
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const mappingPath = 'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_math_lower_secondary_source_extraction_to_canonical_math.review.json';
const extractionPath = 'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_MATHEMATIK_SEKI_KC_G8_G9.source-extraction.json';
const hash = value => 'sha256:' + createHash('sha256').update(JSON.stringify(value)).digest('hex');
const semantic = goal => Object.fromEntries(['id','title','titleEn','description','descriptionEn','requires','contains'].map(key => [key,goal[key]]));

export function buildProposal(repoRoot = process.cwd()) {
  const read = path => JSON.parse(readFileSync(resolve(repoRoot,path),'utf8'));
  const canonical = read(canonicalPath), review = read(mappingPath), extraction = read(extractionPath);
  const byId = new Map(canonical.goals.map(goal => [goal.id,goal]));
  const sources = BASELINE.sourceIds.map(id => extraction.sourceGoals.find(goal => goal.id === id));
  const before = {
    mappings: review.mappings.filter(edge => BASELINE.sourceIds.includes(edge.legacyGoalId)),
    decisions: review.decisions.filter(decision => BASELINE.sourceIds.includes(decision.sourceGoalId)),
  };
  assert.equal(hash(BASELINE.ids.map(id => semantic(byId.get(id)))),BASELINE.semanticDigest,'Relevant canonical semantics changed; fresh review required');
  assert.equal(hash(sources),BASELINE.sourceDigest,'Bound source goals changed; fresh source review required');
  assert.equal(hash(before),BASELINE.mappingSliceDigest,'Related mapping/decision slice changed; reconcile before emitting');
  const [growth,parameters,properties,continuous,equations,models,comparison,logarithm,inverse,inverseGraph] = BASELINE.ids;
  const [s03,s06,s07,s08] = BASELINE.sourceIds;
  const cluster = '48e7615d-3e6e-4b5c-9df3-310e510f91f0';
  const additions = [[s03,growth],[s06,equations],[s08,models]].map(([source,target]) => ({
    legacyGoalId:source,canonicalGoalId:target,matchType:'partial',reviewDecisionId:source,
  }));
  for (const addition of additions) assert(!review.mappings.some(edge => edge.legacyGoalId === addition.legacyGoalId && edge.canonicalGoalId === addition.canonicalGoalId));
  const removed = before.mappings.filter(edge => edge.legacyGoalId === s07 && edge.canonicalGoalId === cluster);
  assert.equal(removed.length,1);
  const revisedEdges = before.mappings.filter(edge => edge.legacyGoalId === s07 && [logarithm,inverse,inverseGraph].includes(edge.canonicalGoalId));
  assert.equal(revisedEdges.length,3);
  const afterMappings = review.mappings.filter(edge => !(edge.legacyGoalId === s07 && edge.canonicalGoalId === cluster))
    .map(edge => edge.legacyGoalId === s07 && [logarithm,inverse,inverseGraph].includes(edge.canonicalGoalId) ? {...edge,matchType:'partial'} : edge);
  for (const addition of additions) {
    const lastSourceIndex = afterMappings.map(edge => edge.legacyGoalId).lastIndexOf(addition.legacyGoalId);
    afterMappings.splice(lastSourceIndex + 1,0,addition);
  }
  const reasons = {
    [s03]: 'Frischer AI-Kandidatenvorschlag 2026-09-06: Die vorhandenen Verweise bleiben unbewertet erhalten. Zusätzlich verweist dieser konkrete Wachstum-/Zerfallskontext partial auf 781f133a: Erkennen und Zuordnen exponentieller Modelle ist durch diese Zeile zusammen mit den Darstellungsanforderungen in KC 7.3 und G9 10.2 gedeckt. Die einzelne Kontextzeile beansprucht nicht allein sämtliche Tabellen-/Graphleistungen. Keine Zuordnung zu e^x-Ableitung, kontinuierlicher e-Modellierung oder asymptotischer Grenzwertdominanz.',
    [s06]: 'Frischer AI-Kandidatenvorschlag 2026-09-06: Die vorhandenen Verweise bleiben unbewertet erhalten. Zusätzlich bildet d900e0a4 partial das Lösen nach einem unbekannten Exponenten durch Logarithmieren als Umkehrung des Potenzierens ab. Prüfen und Kontextinterpretation werden nicht allein dieser Rechenzeile zugeschrieben; sie gehören zum Anwendungszusammenhang von G9 10.2. Die Kompetenz benötigt Logarithmusverständnis, nicht die Ableitung von e^x.',
    [s07]: 'Frischer AI-Kandidatenvorschlag 2026-09-06: Die pauschale exakte Kante zum siebenkindigen Cluster 48e7615d entfällt. 3c1d6ce7 bleibt partial für den inversen Zusammenhang; die ganze Leistung zum numerischen Bestimmen von Logarithmen steht konkreter in Zeile 06. c15fe32d bleibt partial für die Umkehrbarkeit der hier ausgewählten Exponentialfunktion mit Definitions-/Wertebereich. dbc13bb0 bleibt partial für die zugehörige Beziehung von Exponential- und Logarithmusgraph; eine allgemeine Untersuchung beliebiger Funktionsfamilien wird dieser Zeile nicht unterstellt. Diese drei atomaren Verweise zusammen betreffen den tatsächlichen Logarithmus-/Umkehrgegenstand, nicht sämtliche Exponentialfunktionen-Kinder.',
    [s08]: 'Frischer AI-Kandidatenvorschlag 2026-09-06: Die vorhandenen Verweise bleiben unbewertet erhalten. Zusätzlich wird ab720928 partial an die explizite Modellierung anhand gegebenen Datenmaterials mittels Exponentialfunktionen gebunden. Die Daten-/Parameterleistung ist unmittelbar gedeckt; Vorhersagen sind Modellanwendungen und keine unbegrenzte Gültigkeitszusage. Die angrenzende Zeile 09 hält die Grenzen von Modellen ausdrücklich fest. Kein Zwang zur natürlichen Basis e oder zu Differentialrechnung.',
  };
  const afterDecisions = before.decisions.map(decision => ({
    ...decision,
    canonicalGoalIds: afterMappings.filter(edge => edge.legacyGoalId === decision.sourceGoalId).map(edge => edge.canonicalGoalId),
    matchType:'partial',
    rationale:reasons[decision.sourceGoalId],
    reviewedAt:'2026-09-06',
    reviewer:'Codex independent AI candidate; no human approval',
  }));
  for (const decision of afterDecisions) assert.deepEqual(
    decision.canonicalGoalIds,
    afterMappings.filter(edge => edge.legacyGoalId === decision.sourceGoalId).map(edge => edge.canonicalGoalId)
  );
  const requiresChanges = [
    {goalId:growth,before:['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2','858113c5-e53b-57bb-b01f-ba95c3ddcb6f'],after:['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'],reason:'Recognizing growth/decay in representations does not require differentiating elementary functions. Preserve the existing orientation edge as a separately open HE projection issue; do not invent a replacement prerequisite.'},
    {goalId:equations,before:[properties],after:[logarithm],reason:'Solving for an unknown exponent needs the actual logarithm-as-inverse competence, not e^x derivatives or prior doubling/half-life calculations.'},
    {goalId:inverse,before:['b9bbd2a8-1379-5ffb-817f-41467d48abef','858113c5-e53b-57bb-b01f-ba95c3ddcb6f','71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'],after:['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'],reason:'Neither the fundamental theorem of calculus nor differentiating elementary functions is necessary for the stated elementary invertibility/domain-range competence. The existing orientation edge remains a separately open projection issue.'},
  ];
  const candidate = structuredClone(canonical), candidateById = new Map(candidate.goals.map(goal => [goal.id,goal]));
  for (const change of requiresChanges) {
    assert.deepEqual(byId.get(change.goalId).requires,change.before);
    candidateById.get(change.goalId).requires = change.after;
  }
  const checked = new Set(), visiting = new Set();
  const visit = id => {
    assert(!visiting.has(id),'Proposed requires cycle at '+id);
    if (checked.has(id)) return;
    visiting.add(id);
    for (const required of candidateById.get(id)?.requires ?? []) if (candidateById.has(required)) visit(required);
    visiting.delete(id); checked.add(id);
  };
  BASELINE.ids.forEach(visit);
  const closure = id => {
    const seen = new Set();
    const walk = key => { if (seen.has(key)) return; seen.add(key); (candidateById.get(key)?.requires ?? []).forEach(walk); };
    walk(id); return seen;
  };
  for (const id of [equations,models]) assert(!closure(id).has(properties),'e^x derivative leaked back through prerequisites');
  assert(!closure(inverseGraph).has('b9bbd2a8-1379-5ffb-817f-41467d48abef'),'Calculus leaked back into inverse graph route');
  for (const id of [growth,parameters,equations,models,inverse,inverseGraph]) assert(!closure(id).has('858113c5-e53b-57bb-b01f-ba95c3ddcb6f'),'Elementary derivatives leaked back through '+id);
  const sourceById = new Map(extraction.sourceGoals.map(goal => [goal.id,goal]));
  const atomic = id => (byId.get(id)?.contains?.length ?? 0) ? byId.get(id).contains.flatMap(atomic) : [id];
  const rawG9 = edges => new Set(edges.filter(edge => sourceById.get(edge.legacyGoalId)?.tags?.includes('durationModel:G9')).flatMap(edge => atomic(edge.canonicalGoalId)));
  const oldRaw = rawG9(review.mappings), newRaw = rawG9(afterMappings);
  const removedRaw = [...oldRaw].filter(id => !newRaw.has(id)).sort();
  assert.deepEqual(removedRaw,[properties,continuous,comparison].sort());
  assert.deepEqual([...newRaw].filter(id => !oldRaw.has(id)),[]);
  return {
    proposalId:'B038h-HE-G9-10.2-seven-children-v1',
    status:'AI_CANDIDATE_NOT_ADOPTED',
    readiness:'SOURCE_DELTA_PREPARED_ROUTE_COMPLETION_OPEN',
    authority:'Independent source/mathematics proposal; no historical or human approval asserted',
    bindings:BASELINE,
    nativePaths:{canonicalPath,mappingPath,extractionPath},
    mappingDelta:{remove:removed,add:additions,revise:revisedEdges.map(edge => ({before:edge,after:{...edge,matchType:'partial'}}))},
    sourceDecisionDelta:before.decisions.map(decision => ({before:decision,after:afterDecisions.find(after => after.sourceGoalId === decision.sourceGoalId)})),
    canonicalRequiresDelta:requiresChanges,
    unchanged:{goalIds:BASELINE.ids,semanticContent:'IDs, titles, DE/EN descriptions, contains, course tags/core and jurisdiction applicability are not changed by this proposal'},
    rawG9ProjectionDelta:{removed:removedRaw,added:[]},
    readOnlyChecks:{sourceBindings:true,mappingDecisionAlignment:true,affectedRequiresClosureAcyclic:true,derivativeFreeEquationAndModelRoutes:true,calculusFreeInverseGraphRoute:true},
    knownOpenRouteBoundary:{
      note:'Retained E/Q2 nodes still directly require the existing E orientation, currently absent as a HE-G9 target. This pre-existing orientation projection gap is NOT repaired or bypassed by this bounded candidate.',
      missingGoalIds:['71cec9fb-3751-4d61-8b34-c5adbbf6e5f2'],
      affectedRetainedGoalIds:[growth,inverse,inverseGraph],
      adoptionReady:false,
    },
    adoptionDependencies:[
      'No adoption performed; all seven cluster children remain B038h hold until authoring and fresh evidence are completed.',
      'Apply a separately authorized source/authoring change set, not this emitter; reconcile the relevant semantic-kind/source fingerprint and duration-layout canonical hash under existing review rules.',
      'Then preview the unchanged native generator: cd app && ./node_modules/.bin/tsx scripts/generateMathDurationCompositionViews.ts (no --write).',
      'Only after verifying actual deltas use the existing generator workflow; never hand-patch generated views.',
      'Check prerequisites for mapped E/Q2 nodes explicitly: the duration generator checks canonical Sek-I phase nodes only.',
      'Freshly bind/recheck changed scope/route pages and retain existing maturity floors; no national GK/LK inference.'
    ],
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  assert(process.argv.length <= 3,'Usage: node emitter.mjs [repository-root]; no write/apply mode exists');
  process.stdout.write(JSON.stringify(buildProposal(process.argv[2] ?? process.cwd()),null,2)+'\n');
}
