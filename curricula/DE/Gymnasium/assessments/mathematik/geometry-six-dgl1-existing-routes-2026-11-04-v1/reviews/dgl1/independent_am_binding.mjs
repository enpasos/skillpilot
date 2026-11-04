import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const out=path.dirname(fileURLToPath(import.meta.url)),repo=path.resolve(out,'../../..');
const pack=path.join(path.dirname(out),'dgl1-whole-form-content-20261104-v1');
const ts=createRequire(path.join(repo,'app/package.json'))('typescript');
const read=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=x=>createHash('sha256').update(x).digest('hex');
const write=async(n,x)=>writeFile(path.join(out,n),JSON.stringify(x,null,2)+'\n');
const frozen=await read(path.join(pack,'frozen-input.json'));
const canonical=await read(path.join(repo,frozen.canonical.inputRoot,frozen.canonical.path));
const goals=new Map(canonical.goals.map(g=>[g.id,g]));
const originals=(await read(path.join(pack,'current-two-registered-am-rows.json'))).rows;
const context=await read(path.join(pack,'whole-memory-obligation-and-deck-context.json'));
const decisions=[],sources=[],memoryBindings=[],cards=[];
let cardFunction,normalize,memoryConfig,registeredMemory;
for(const [lane,file,key] of [['semantic-atomicity','semanticAtomicityReview.ts','A'],['memory-card-review','memoryCardReview.ts','M']]){
 const source=await readFile(path.join(repo,'app/scripts',file),'utf8');
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
 const names=new Set(['normalizeText','stableJson','getSemanticPayload','fingerprintGoal','fingerprintMemoryCard']);
 const selected=ast.statements.filter(n=>ts.isFunctionDeclaration(n)&&names.has(n.name?.text)).map(n=>n.getFullText(ast)).join('\n');
 const js=ts.transpileModule(selected,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None}}).outputText;
 const fns=new Function('createHash',js+'\nreturn {fingerprintGoal,normalizeText'+(key==='M'?',fingerprintMemoryCard':'')+'};')(createHash);
 sources.push({path:'app/scripts/'+file,sha256:hash(source),executedSourceSha256:hash(selected)});
 const entry=originals.find(r=>r.lane===lane),old=entry.wholeCurrentRow,g=goals.get(old.goalId);
 assert.equal(fns.fingerprintGoal(g,old.ruleVersion),old.fingerprint);
 const cb=await readFile(path.join(repo,entry.registeredConfig.inputRoot,entry.registeredConfig.path));assert.equal(hash(cb),entry.registeredConfig.sha256);
 const config=JSON.parse(cb);assert.equal(config.reviewPath,entry.registeredReview.path);
 const rb=await readFile(path.join(repo,entry.registeredReview.inputRoot,config.reviewPath));assert.equal(hash(rb),entry.registeredReview.sha256);
 const lines=rb.toString().trim().split('\n');assert.equal(lines.length,807);
 assert.equal(lines[entry.line-1],entry.rawCurrentRegisteredLine);assert.deepEqual(JSON.parse(lines[entry.line-1]),old);
 const reason=key==='A'
 ?'Ein kohärenter Lösungskern: aus einer geeigneten Differenzialgleichung erster Ordnung mit einem elementaren Verfahren eine parametrisierte Lösung gewinnen und über eine Anfangsbedingung spezialisieren. Allgemeine und spezielle Lösungen sind zusammenhängende Stufen derselben Handlung. Separation und andere geeignete elementare Verfahren sind Methoden dieses Kerns; weder eine erschöpfende Methodensammlung noch selbstständige Teilmasterys sind nötig. Die geprüfte ganze Form erzwingt eine eigene nichtverschwindende Familienherleitung und mindestens eine echte Anfangswertbestimmung, erlaubt aber gleichwertige Kehrwert- und begründete Koeffizientenansätze.'
 :'Die tragende Leistung besteht in eigener Umformung, Integration beziehungsweise gleichwertiger Herleitung, dem Umgang mit Integrationskonstanten und der Anwendung einer Anfangsbedingung. Ein zusätzlicher isolierter Faktenabruf zum DGL-Verfahren wäre kein eigener erforderlicher Gedächtnisgegenstand. Die vorhandenen drei memory_required-Verträge im Original-R-Kontext sowie das Analysis-Kernregeln-Deck mit 14 aktuellen Karten bleiben ausdrücklich erhalten; die gegebene Ableitungshilfe schafft keine Memory-Ausnahme.';
 const row={schemaVersion:1,reviewId:old.reviewId,ruleVersion:old.ruleVersion,landscapeId:old.landscapeId,goalId:old.goalId,fingerprint:old.fingerprint,status:key==='A'?'atomic':'no_memory_needed',...(key==='A'?{semanticAtomic:true,suggestedSplit:[]}:{memoryUseful:false}),reviewedAt:'2026-11-04',reviewer:'independent-astra-ultra-content-review',reason};
 decisions.push({lane,currentRegisteredLine:entry.line,wholeOriginalGoal:g,currentRegisteredRow:old,proposedRow:row,applied:false});
 await writeFile(path.join(out,lane+'.proposed-current-original-rows.jsonl'),JSON.stringify(row)+'\n');
 if(key==='M'){
  cardFunction=fns.fingerprintMemoryCard;normalize=fns.normalizeText;memoryConfig={config,root:entry.registeredConfig.inputRoot};registeredMemory=lines;
  for(const e of context.wholeRegisteredMemoryRowsForDgl1AndAll54Ancestors){
   const r=e.wholeCurrentRow;assert.equal(fns.fingerprintGoal(goals.get(r.goalId),r.ruleVersion),r.fingerprint);
   assert.equal(lines[e.line-1],e.rawCurrentRegisteredLine);assert.deepEqual(JSON.parse(lines[e.line-1]),r);
   memoryBindings.push({goalId:r.goalId,status:r.status,fingerprint:r.fingerprint,memoryGoalIds:r.memoryGoalIds??[],deckIds:r.deckIds??[],registeredLine:e.line});
  }
 }
}
const manifest=await read(path.join(pack,'review-input-manifest.json'));
const cb=manifest.externalInputBindings.find(b=>b.path.endsWith('.cards.review.jsonl'));
const cardLines=(await readFile(path.join(repo,cb.inputRoot,cb.path),'utf8')).trim().split('\n');
const de=context.wholeActualDecks.find(d=>d.language==='de'),en=context.wholeActualDecks.find(d=>d.language==='en');
assert.equal(de.wholeDeck.cards.length,14);assert.equal(en.wholeDeck.cards.length,14);
const historical=[];
for(const entry of context.registeredCardReviewRowsForWholeReferencedDecks){
 const r=entry.wholeCardReviewRow;assert.equal(cardLines[entry.line-1],entry.rawRegisteredCardLine);assert.deepEqual(JSON.parse(cardLines[entry.line-1]),r);
 const c=de.wholeDeck.cards.find(c=>c.id===r.cardId),ec=en.wholeDeck.cards.find(c=>c.id===r.cardId);
 if(!c){assert.equal(r.status,'remove');assert(!ec);historical.push(r.cardId);continue;}
 assert(ec);assert.equal(r.status,'kept');
 const fp=cardFunction({deckId:de.wholeDeck.deckId,cardId:c.id,front:normalize(c.front),back:normalize(c.back),category:normalize(c.category),tags:(c.tags??[]).map(normalize).filter(Boolean)},r.ruleVersion);
 assert.equal(fp,r.fingerprint);cards.push({cardId:c.id,registeredPrimaryDEFingerprint:fp,englishPresent:true,originGoalIds:r.originGoalIds,status:r.status});
}
assert.equal(memoryBindings.length,53);const required=memoryBindings.filter(r=>r.status==='memory_required');assert.equal(required.length,3);assert.equal(cards.length,14);assert.equal(historical.length,2);
const lc=await read(path.join(pack,'current-semantic-kind-context.json'));
const ledgerBytes=await readFile(path.join(repo,lc.ledger.inputRoot,lc.ledger.path));assert.equal(hash(ledgerBytes),lc.ledger.sha256);
const ledger=JSON.parse(ledgerBytes),ledgerRows=Array.isArray(ledger)?ledger:(ledger.rows??ledger.goals??ledger.decisions);
for(const r of lc.wholeRows)assert.deepEqual(ledgerRows.find(l=>l.goalId===r.goalId),r);
assert.equal(ledgerRows.filter(r=>r.semanticKind==='curricularAtomic').length,807);
await write('two-independent-current-original-am-recommendations.json',{status:'GENUINE_CONTENT_CONDITIONAL_RECOMMENDATIONS_NOT_APPLIED',inputManifestSha256:'0562557487f7be71513c316411103d364313d82e01557f8ab5355f4f5b93347f',fingerprintSources:sources,decisions,obligationsPerLane:807,authoritativeOriginalSemanticKind:lc.wholeRows[0],futureIdOrRoleBinding:'Not granted. These rows bind only the unchanged original DGL1 identity and complete current contract; a future separate exam needs its own identity/role/source-scope check. R and coverage are absent from these A/M fingerprints, so equality is not graph approval.'});
await write('independent-memory-context-binding.json',{status:'PASS_UNCHANGED_CONTEXT_BINDING_AND_NO_NEW_EXEMPTION',memoryBindings,threeMemoryRequired:required,primaryDECardBindings:cards,wholeMemoryGoal:context.wholeReferencedMemoryGoals[0],wholeOriginalDEENDeckBindings:context.wholeActualDecks.map(d=>({language:d.language,originalBinding:d.originalBinding,cardCount:d.wholeDeck.cards.length})),historicalRemovedCards:historical,reviewedOriginalCardRows:16,newMemoryExemption:false,newOrModifiedCardRows:0,wholeOriginalContractReviewed:true,judgment:'DGL1 application assessment does not retire the compact derivative, integer-power antiderivative or fundamental-theorem retrieval obligations. All existing cards and both removed-card historical rows remain unchanged. Reading and checking this context is not a new blanket approval of unrelated curricular goals.'});
console.log(JSON.stringify({status:'PASS',freshIndependentOriginalRows:2,registeredMemoryRowsVerified:53,requiredMemory:3,currentCardsVerified:14,registeredRowsWritten:0}));
