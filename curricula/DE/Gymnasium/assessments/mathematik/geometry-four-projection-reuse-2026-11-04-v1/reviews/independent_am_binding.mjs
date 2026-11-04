import {readFile, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const out=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(out,'../../..');
const pack=path.join(path.dirname(out),'geometry-projection-fixpoints-vectorproduct-four-whole-forms-20261104-v1');
const ts=createRequire(path.join(repo,'app/package.json'))('typescript');
const hash=x=>createHash('sha256').update(x).digest('hex');
const canonical=JSON.parse(await readFile(path.join(pack,'original/canonical.current.json'),'utf8'));
const goals=new Map(canonical.goals.map(g=>[g.id,g]));
const entries=JSON.parse(await readFile(path.join(pack,'current-eight-registered-am-rows.json'),'utf8')).rows;
const reasons={
 '803d910d-96d1-5118-b9ca-29e93d0da76d':{
  A:'Ein Kompetenzkern: eine Parallelprojektion auf eine Ursprungsebene aus Richtung und Ebene gewinnen und als dieselbe Abbildung analysieren. Matrixherleitung, Bild, Kern, Fixpunkte und Existenzbedingung sind zusammenhängende Eigenschaften dieses Objekts; keine unabhängige Themenbündelung.',
  M:'Die Leistung besteht in der Herleitung aus dem Geraden-Ebenen-Schnitt und der begründeten Analyse. Die allgemeine Formel lässt sich daraus rekonstruieren; bloßer Formelabruf würde die zentrale Leistung nicht nachweisen. Keine eigene Gedächtniskartenpflicht.'},
 'd3c42193-f1b7-5c6d-a991-bf034d99359f':{
  A:'Ein Verfahren mit geometrischer Deutung: die gesamte Lösungsmenge von (A-I)x=0 bestimmen. Gerade, Ebene, Ursprung und ganzer Raum sind Ergebnisdimensionen desselben Verfahrens; die Form verlangt keine unabhängige Eigenwerttheorie.',
  M:'Entscheidend sind korrektes Aufstellen, Lösen und Deuten konkreter homogener Systeme sowie die Unterscheidung einzelner Proben von vollständigen Fixmengen. Ein zusätzlicher isolierter Abrufgegenstand ist nicht nötig.'},
 '5748633c-113f-5ea8-9041-24da55919de7':{
  A:'Ein Kompetenzkern: eine Koordinatenprojektion ausführen und ihr Bild geometrisch oder sachlich deuten. Die ausdrücklich mit oder verbundenen Objektarten sind Varianten, kein Katalog sämtlich separat zu bestehender Teilkompetenzen. Die umfangreichere neue Form ist eine zulässige Stichprobe, keine neue globale Vertragsauslegung.',
  M:'Koordinatenoperation und räumliche Interpretation müssen angewandt werden. Eine Merkkarte zum Nullsetzen einer Koordinate wäre kein eigener sinnvoller Abschlussnachweis; weder die neue Form noch die Punktprojektionsvariante benötigen eine zusätzliche Gedächtnispflicht.'},
 '7bb3c312-f714-55e6-a31f-f31605a93760':{
  A:'Richtung und Betrag desselben Vektorprodukts liefern die beiden ausdrücklich geforderten Anwendungen Normalenvektor und Fläche. Vorzeichenwechsel und Entartung prüfen die Grenzen dieser gemeinsamen Konstruktion. Die Teilhandlungen bilden einen fachlich kohärenten Anwendungskern.',
  M:'Vektorproduktberechnung, Orthogonalitätsbegründung, Betrag und geometrische Deutung sind anwendungsbezogene Arbeit. Die Grunddefinition hat einen eigenen vorhandenen Vorbereitungskontext; für dieses Anwendungsziel ergibt sich kein zusätzlicher isolierter Gedächtnisgegenstand.'}
};
const sources=[],decisions=[],e3Bindings=[];
const e3=goals.get('e3c70a12-7886-51f7-8bcd-ed54865415d6');
const e3Proposed=structuredClone(e3);
e3Proposed.requires.push('5748633c-113f-5ea8-9041-24da55919de7');
e3Proposed.examData.coveredGoalIds.push('5748633c-113f-5ea8-9041-24da55919de7');
for (const [lane,file,key,status] of [
 ['semantic-atomicity','semanticAtomicityReview.ts','A','atomic'],
 ['memory-card-review','memoryCardReview.ts','M','no_memory_needed']
]) {
 const source=await readFile(path.join(repo,'app/scripts',file),'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const names=new Set(['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']);
 const selected=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.has(n.name?.text)).map(n=>n.getFullText(ast)).join('\n');
 assert(selected.includes('function fingerprintGoal('));
 const js=ts.transpileModule(selected,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const fp=new Function('createHash',js+'\nreturn fingerprintGoal;')(createHash);
 sources.push({path:'app/scripts/'+file,sha256:hash(source),selectedFunctionSourceSha256:hash(selected)});
 for(const entry of entries.filter(e=>e.lane===lane)) {
  const current=entry.wholeCurrentRow;
  assert.equal(fp(goals.get(current.goalId),current.ruleVersion),current.fingerprint);
  const cfgBytes=await readFile(path.join(repo,entry.registeredConfig.inputRoot,entry.registeredConfig.path));
  assert.equal(hash(cfgBytes),entry.registeredConfig.sha256);
  const cfg=JSON.parse(cfgBytes);
  const rowBytes=await readFile(path.join(repo,entry.registeredReview.inputRoot,cfg.reviewPath));
  assert.equal(hash(rowBytes),entry.registeredReview.sha256);
  const rows=rowBytes.toString().trim().split('\n');
  assert.equal(rows.length,807);
  assert.equal(rows.filter(r=>JSON.parse(r).goalId===e3.id).length,0);
  assert.deepEqual(JSON.parse(rows[entry.line-1]),current);
  const proposed={schemaVersion:1,reviewId:current.reviewId,landscapeId:current.landscapeId,goalId:current.goalId,
    ruleVersion:current.ruleVersion,fingerprint:current.fingerprint,status,
    reviewedAt:'2026-11-04',reviewer:'independent-astra-ultra-content-review',
    ...(key==='A'?{semanticAtomic:true,suggestedSplit:[]}:{memoryUseful:false}),
    reason:reasons[current.goalId][key]};
  decisions.push({lane,decision:'INDEPENDENT_CURRENT_ORIGINAL_CONTRACT_RECOMMENDATION',
    currentRegisteredLine:entry.line,currentRegisteredRow:current,proposedRow:proposed,
    basis:'Whole original contract and preparation context; independently reviewed complete bilingual assessment and rubric; report.md',
    applied:false,futureRoleChangeApproved:false});
 }
 const ruleVersion=entries.find(e=>e.lane===lane).wholeCurrentRow.ruleVersion;
 assert.equal(fp(e3,ruleVersion),fp(e3Proposed,ruleVersion));
 e3Bindings.push({lane,ruleVersion,currentFingerprint:fp(e3,ruleVersion),
   proposedRequiresAndCoverageFingerprint:fp(e3Proposed,ruleVersion),
   existingRegisteredRows:0,necessaryReplacementRows:0,
   explanation:'These fingerprints exclude requires and examData.coveredGoalIds. Existing e3 is a practice assessment, outside the registered 807 curricular-atomic population.'});
}
assert.equal(decisions.length,8);
await writeFile(path.join(out,'eight-current-original-am-recommendations.json'),JSON.stringify({
 status:'EIGHT_INDEPENDENT_RECOMMENDATIONS_BOUND_TO_CURRENT_ORIGINAL_CONTRACTS_ONLY',
 inputManifestSha256:'481ac457449b2a2f62ddd90b62c14f9631e7b09706c88d0bdd03c50c14cee434',
 caveat:'No row was written to a registered review. A future nodeKind or contract change needs its own current fingerprint binding. R and examData are not fully represented by these lane fingerprints; these rows cannot approve a graph, form activation or scope change.',
 originalObligationsPerLane:807,fingerprintSources:sources,decisions
},null,2)+'\n');
for(const lane of ['semantic-atomicity','memory-card-review']) {
 await writeFile(path.join(out,lane+'.proposed-current-original-rows.jsonl'),decisions.filter(d=>d.lane===lane).map(d=>JSON.stringify(d.proposedRow)).join('\n')+'\n');
}
const ledgerContext=JSON.parse(await readFile(path.join(pack,'current-semantic-kind-context.json'),'utf8'));
const ledgerBytes=await readFile(path.join(repo,ledgerContext.ledger.inputRoot,ledgerContext.ledger.path));
assert.equal(hash(ledgerBytes),ledgerContext.ledger.sha256);
const ledger=JSON.parse(ledgerBytes);
const ledgerRows=Array.isArray(ledger)?ledger:(ledger.rows??ledger.goals??ledger.decisions);
const e3Kind=ledgerRows.find(r=>r.goalId===e3.id);
assert.equal(e3Kind.semanticKind,'practiceAssessment');
await writeFile(path.join(out,'e3-independent-am-and-binding.json'),JSON.stringify({
 status:'WHOLE_EXISTING_E3_REVIEWED_NO_REGISTERED_AM_REPLACEMENT_REQUIRED',
 wholeOriginalGoal:e3,originalSemanticKindRow:e3Kind,fingerprintBindings:e3Bindings,
 independentAtomicityJudgment:'Kohärente Prüfungsleistung an einer einzigen orthogonalen Projektion: Ebenenanteil und Rest bestimmen und dieselbe Zuordnung als lineare Abbildung mit Bild/Kern begründen. Die zusätzliche 574-Abdeckungsangabe beschreibt bereits bewertete Punktprojektionshandlungen; sie fügt der Aufgabe keinen zweiten unabhängigen Themenkern hinzu.',
 independentMemoryJudgment:'Die vollständige 10/10-Leistung verlangt angewandte Zerlegung und Begründung für beliebige Vektoren. Kein eigener Gedächtnisabrufgegenstand und kein Anlass, einen Prüfungsendpunkt als Gedächtniskartenziel zu behandeln.',
 assessmentContentStatus:'CONTENT_CONDITIONAL_REUSE_ACCEPTED_FOR_POINT_VARIANT_OF_574',
 proposedCoverageAppend:'5748633c-113f-5ea8-9041-24da55919de7',
 automaticMasteryOfCoveredGoals:false,
 futureSemanticKindOrOtherFingerprintBindings:'Not waived by unchanged A/M hashes; verify the actual integrated candidate and its authoritative ledgers.'
},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',independentRecommendations:decisions.length,originalObligationsPerLane:807,registeredRowsWritten:0}));
