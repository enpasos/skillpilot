import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const out=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(out,'../../..');
const pack=path.join(path.dirname(out),'geometry-six-remaining-content-20261104-v1');
const ts=createRequire(path.join(repo,'app/package.json'))('typescript');
const hash=x=>createHash('sha256').update(x).digest('hex');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const goals=new Map((await read(path.join(pack,'original/canonical.current.json'))).goals.map(g=>[g.id,g]));
const entries=(await read(path.join(pack,'current-twelve-registered-am-rows.json'))).rows;
const changes=(await read(path.join(pack,'proposed-preparation-changes.NOT-ACTIVATED.json'))).proposedDirectRequiresByGoalId;
const X='8d314e15-69e9-5af1-a10a-be820b2f821d',I='857c1c46-5d94-5dfb-9697-9a9fd04103c3';
const reasons={
 'bd3576b8-f4e5-542a-a8a2-74524d9cee21':{
  A:'Ein zusammenhängender Modellierungszyklus: eine reale räumliche Situation mit Geraden und Ebenen beschreiben, Gleichungen aufstellen und deren Lösungen sachlich zurückübersetzen. Bewegungen, Sichtlinien und Schatten sind Beispiele dieses Kompetenzkerns, keine vollständig abzuprüfenden Einzelthemen. Die geprüfte Dach-/Strahlform verbindet beide Modelltypen und prüft endliche Fläche und gerichteten Strahl.',
  M:'Die tragende Leistung ist die situationsgerechte Konstruktion und Interpretation eigener Modelle. Ein isolierter Faktenabruf kann weder die Parameterbeschränkung noch die Unterscheidung von Ebenenschnitt und Dachtreffer nachweisen. Kein zusätzliches eigenes Gedächtniskartenziel erforderlich.'},
 '857c1c46-5d94-5dfb-9697-9a9fd04103c3':{
  A:'Ein zusammenhängender Kompetenzkern: die vollständige gemeinsame Gerade zweier Ebenen berechnen, parametrisieren und ihre Lage begründen. Rechnung und Darstellung sind Schritte derselben Konstruktion. Die ganze vorhandene 8d3-Form prüft dies bereits in A und unterscheidet es zusätzlich von leerer und zweidimensionaler Lösungsmenge; keine neue Prüfung nötig.',
  M:'Gefordert sind Lösen, Parametrisieren und geometrisches Begründen eines konkreten Gleichungssystems. Ein eigener Merksatzabruf zur Schnittgeraden trägt keinen unabhängigen Nachweis bei. Die fachlich korrigierte Vorbereitung ist von dieser Gedächtnisentscheidung getrennt.'},
 '58f613da-03be-5c6a-90a9-ff0958aa7849':{
  A:'Koordinatenbedingungen zur Untersuchung besonderer Geradenlagen bilden einen kohärenten Handlungskern. Achsen und Koordinatenebenen sind ausdrücklich beide Bezugsobjekte; ihre Fälle werden durch dieselbe Stütz-/Richtungsvektoranalyse unterschieden. Die Klassifikation ist ein Gesamtergebnis, keine Sammlung separater Mastery-Teilprüfungen.',
  M:'Entscheidend ist das begründete Anwenden gemeinsamer Punktbedingungen und der Richtung, insbesondere gegen den Fehlschluss aus einer Nullkomponente allein. Ein eigenes Falltabellen-Memory würde diese Anwendung nicht ersetzen; kein zusätzlicher isolierter Abrufgegenstand nötig.'},
 'bda6a659-9640-53a5-8be0-24705ab623ef':{
  A:'Berechnen und geometrisches Deuten desselben nichtstumpfen Ebenenwinkels über geeignete Normalen sind eine einzelne kohärente Kompetenz. Normalenwahl, Orientierungsunabhängigkeit und Schnittbild begründen dieselbe Größe; der Parallelfall ist eine sinnvolle Begrenzung, keine zweite unabhängige Fachkompetenz.',
  M:'Die Formel muss mit geeigneten Normalen angewandt und die Wahl des nichtstumpfen Winkels geometrisch begründet werden. Vorbereitende Skalarprodukt- und Normalenkenntnisse liefern den rekonstruierbaren Ansatz; für diesen Anwendungs- und Deutungsgegenstand ist kein zusätzliches Memory-Deck nötig.'},
 '5f90df42-8a71-534d-b995-b8f7dcaf1661':{
  A:'Ein gemeinsamer inverser Untersuchungskern: geometrische Winkel- oder Lagebedingungen in parametrisierten Gerade-Ebene- und Ebene-Ebene-Konfigurationen in Bedingungen an den Parameter übersetzen, lösen und deuten. Die beiden Konfigurationstypen gehören zum Originalvertrag; die ODER-Liste von Bedingungsarten verlangt keine Vollprüfung sämtlicher Varianten. Vollständigkeit und Parameterrolle gehören zur gleichen Leistung.',
  M:'Die Leistung verlangt Aufstellen und vollständiges Lösen parameterabhängiger Bedingungen einschließlich Vorzeichen und geometrischer Rückprüfung. Bloßer Abruf von Sinus- und Kosinusformeln genügt nicht; deren Grundanwendung liegt im echten Vorbereitungskontext. Kein eigenes zusätzliches Gedächtniskartenziel.'},
 'eb112b6f-4cc4-58af-975a-f1ea61b727f0':{
  A:'Eine räumliche Parabelbahn parametrisch beschreiben und den Laufparameter im Bewegungskontext deuten ist ein kohärenter Kompetenzkern. Ortsbestimmung, quadratische Höhenkomponente und Umparametrisierung sind zusammenhängende Eigenschaften derselben Bahn, keine unabhängig zu zertifizierenden Themen.',
  M:'Eigene Vektordarstellung, gültiger Zeitbereich und Interpretation der Komponenten sind anwendungsbezogen. Weder Auswendiglernen einer Standard-Wurfgleichung noch separater Scheitelpunktabruf belegt diese Leistung. Die Form gibt das vereinfachte Modell und eine Scheitelidentität an; ein zusätzliches Memory-Deck ist nicht erforderlich.'}
};
const sources=[],decisions=[],xb=[];
const xp=structuredClone(goals.get(X));xp.requires=changes[X];xp.examData.coveredGoalIds.push(I);
for(const [lane,file,key,status] of [['semantic-atomicity','semanticAtomicityReview.ts','A','atomic'],['memory-card-review','memoryCardReview.ts','M','no_memory_needed']]){
 const src=await readFile(path.join(repo,'app/scripts',file),'utf8');
 const ast=ts.createSourceFile(file,src,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const names=new Set(['normalizeText','stableJson','getSemanticPayload','fingerprintGoal']);
 const selected=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.has(n.name?.text)).map(n=>n.getFullText(ast)).join('\n');
 assert(selected.includes('function fingerprintGoal('));
 const js=ts.transpileModule(selected,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const fp=new Function('createHash',js+'\nreturn fingerprintGoal;')(createHash);
 sources.push({path:'app/scripts/'+file,sha256:hash(src),selectedFunctionSourceSha256:hash(selected)});
 for(const entry of entries.filter(e=>e.lane===lane)){
  const current=entry.wholeCurrentRow,g=goals.get(current.goalId);
  assert.equal(fp(g,current.ruleVersion),current.fingerprint);
  const cfgb=await readFile(path.join(repo,entry.registeredConfig.inputRoot,entry.registeredConfig.path));assert.equal(hash(cfgb),entry.registeredConfig.sha256);
  const cfg=JSON.parse(cfgb),rb=await readFile(path.join(repo,entry.registeredReview.inputRoot,cfg.reviewPath));assert.equal(hash(rb),entry.registeredReview.sha256);
  const rows=rb.toString().trim().split('\n');assert.equal(rows.length,807);assert.deepEqual(JSON.parse(rows[entry.line-1]),current);
  assert.equal(rows.filter(r=>JSON.parse(r).goalId===X).length,0);
  const gp=structuredClone(g);if(changes[g.id])gp.requires=changes[g.id];assert.equal(fp(gp,current.ruleVersion),current.fingerprint);
  const row={schemaVersion:1,reviewId:current.reviewId,ruleVersion:current.ruleVersion,landscapeId:current.landscapeId,goalId:current.goalId,fingerprint:current.fingerprint,status,reviewedAt:'2026-11-04',reviewer:'independent-astra-ultra-content-review',...(key==='A'?{semanticAtomic:true,suggestedSplit:[]}:{memoryUseful:false}),reason:reasons[g.id][key]};
  decisions.push({lane,currentRegisteredLine:entry.line,wholeOriginalGoal:g,currentRegisteredRow:current,proposedRow:row,applied:false,roleOrScopeApproved:false});
 }
 const rv=entries.find(e=>e.lane===lane).wholeCurrentRow.ruleVersion;
 assert.equal(fp(goals.get(X),rv),fp(xp,rv));
 xb.push({lane,ruleVersion:rv,currentFingerprint:fp(goals.get(X),rv),proposedRequiresAndCoverageFingerprint:fp(xp,rv),existingRegisteredRows:0,necessaryReplacementRows:0});
}
assert.equal(decisions.length,12);
await writeFile(path.join(out,'twelve-current-original-am-recommendations.json'),JSON.stringify({status:'TWELVE_GENUINE_INDEPENDENT_CURRENT_ORIGINAL_CONTRACT_RECOMMENDATIONS_NOT_APPLIED',inputManifestSha256:'b69f993176d114ae88f1811ed64e92ccf02e9a8d466285d8833dad6aff576473',originalObligationsPerLane:807,fingerprintSources:sources,decisions,caveat:'A/M lane fingerprints exclude requires and coverage. Unchanged hashes do not approve the graph, task activation, future nodeKind, source scope or authoritative semantic-kind ledger. Bind future candidate separately.'},null,2)+'\n');
for(const lane of ['semantic-atomicity','memory-card-review'])await writeFile(path.join(out,lane+'.proposed-current-original-rows.jsonl'),decisions.filter(d=>d.lane===lane).map(d=>JSON.stringify(d.proposedRow)).join('\n')+'\n');
const lc=await read(path.join(pack,'current-semantic-kind-context.json'));
const lb=await readFile(path.join(repo,lc.ledger.inputRoot,lc.ledger.path));assert.equal(hash(lb),lc.ledger.sha256);
const ledger=JSON.parse(lb),lr=Array.isArray(ledger)?ledger:(ledger.rows??ledger.goals??ledger.decisions),xkind=lr.find(r=>r.goalId===X);assert.equal(xkind.semanticKind,'practiceAssessment');
await writeFile(path.join(out,'existing-8d3-independent-am-and-coverage.json'),JSON.stringify({status:'WHOLE_EXISTING_8D3_INDEPENDENT_REVIEW_NO_REGISTERED_AM_REPLACEMENT_NEEDED',wholeOriginalGoal:goals.get(X),semanticKindRow:xkind,fingerprintBindings:xb,independentAtomicityJudgment:'Die drei Systeme bilden eine kohärente vorhandene Prüfung des Zusammenhangs von LGS-Lösungsmenge und gegenseitiger Ebenenlage. Die vollständige Gerade in A, leere Menge in B und ganze Ebene in C sind Fälle derselben geometrisch-algebraischen Untersuchung. Der konkrete Methodenvergleich gehört zum vorhandenen Prüfungsvertrag. Die zusätzliche Abdeckung von 857 bezeichnet eine schon bewertete Handlung und erweitert die Aufgabe nicht.',independentMemoryJudgment:'Die ganze 23/21-Form fordert konkrete Rechnung, vollständige Parameterdarstellungen, geometrische Deutung und Verfahrenswahl. Sie ist ein Anwendungsnachweis ohne eigenständigen isolierten Gedächtnisabrufgegenstand. Kein Anlass, den vorhandenen Prüfungsendpunkt in ein Memory-Ziel umzudeuten.',proposedCoverageAppend:I,coverageReason:'A fordert und bewertet eine vollständige Parametergerade mit geometrischer Interpretation; die vorhandene Kappung verhindert Gesamtbestehen ohne diesen Handlungskern.',coverageNotDerivedFromRequires:true,automaticPrerequisiteMastery:false,contentStatus:'CONTENT_CONDITIONAL_REUSE_ACCEPTED',futureRoleIdScopeBinding:'REQUIRED_ON_ACTUAL_INTEGRATED_CANDIDATE_NOT_GRANTED_HERE'},null,2)+'\n');
console.log(JSON.stringify({status:'PASS',independentRows:12,existing8d3NecessaryAMReplacementRows:0,originalObligationsPerLane:807,registeredRowsWritten:0}));
