import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const repo=process.cwd();
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-current-atomicity-memory-impact-independent-a-v1';
const require=createRequire(path.resolve('app/package.json'));
const ts=require('typescript');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=s=>createHash('sha256').update(s).digest('hex');
const write=(p,v)=>fs.writeFileSync(path.join(own,p),JSON.stringify(v,null,2)+'\n');
const input=read(path.join(own,'actual-current25-A-M-config-record-and-card-routing.input.json'));
const current=read(path.join(own,'snapshots/current479-current378.canonical.snapshot.json'));
const candidate=read(path.join(own,'snapshots/v2-en-only479-current378.canonical.snapshot.json'));
const goals=new Map(current.goals.map(g=>[g.id,g]));
const proposed=new Map(candidate.goals.map(g=>[g.id,g]));
const bound=[];
function nativeFunctions(file,names,extraConstants='') {
 const src=fs.readFileSync(file,'utf8');
 const bodies=names.map(name=>{
  const m=src.match(new RegExp('^function '+name+'(?:<[^>]*>)?\\s*\\(','m'));
  if(!m)throw Error('Missing actual native function '+name);
  const begin=m.index;const rest=src.slice(begin+1);const next=rest.match(/^function\s+\w+(?:<[^>]*>)?\s*\(/m);const body=src.slice(begin,next?begin+1+next.index:src.length);
  bound.push({nativeSourcePath:file,nativeSourceSHA256:sha(src),functionName:name,exactDefinitionSHA256:sha(body)});
  return body;
 });
 const code="import {createHash} from 'node:crypto'; import {readFileSync,existsSync} from 'node:fs'; import {resolve} from 'node:path';\n"+`const repoRoot=${JSON.stringify(repo)};\n`+extraConstants+'\n'+bodies.join('\n')+'\nexport {'+names.join(',')+'};\n';
 const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const module={exports:{}};new Function('module','exports','require',js)(module,module.exports,require);return module.exports;
}
const afile='app/scripts/semanticAtomicityReview.ts';
const A=nativeFunctions(afile,['normalizeText','stableJson','getSemanticPayload','fingerprintGoal','isLeaf','isSemanticAtomicityRelevantGoal','collectScopeGoalIds','collectConfiguredScopeGoalIds','validateRecordShape'],fs.readFileSync(afile,'utf8').match(/^const statusOrder[^\n]*$/m)[0]);
const mfile='app/scripts/memoryCardReview.ts';
const M=nativeFunctions(mfile,['loadJson','resolveRepoPath','normalizeText','stableJson','fingerprintGoal','fingerprintMemoryCard','isLeaf','isMemoryGoal','isReviewRelevantGoal','collectScopeGoalIds','collectConfiguredScopeGoalIds','collectCompositionViewVisibleGoalIds','collectMemoryVisibilityReport','memoryDeckIdsFromGoal','memoryVocabularySources','resolveVocabularySourcePath','isPrimaryMemoryDeckSource','formatGoal','collectMemoryDeckEvidence','validateRecordShape','validateCardRecordShape'],['statusOrder','cardStatusOrder'].map(n=>fs.readFileSync(mfile,'utf8').match(new RegExp('^const '+n+'[^\\n]*$','m'))[0]).join('\n'));
const selected=input.selected25GoalIds;const mcfg=input.currentMemoryConfig;const memoryRows=input.currentSelected25MemoryLines.map(JSON.parse);
const byM=new Map(memoryRows.map(r=>[r.goalId,r]));
const memids=new Set(input.nativeClosureMemoryGoalIds);
const evidence=M.collectMemoryDeckEvidence({...current,goals:current.goals.filter(g=>memids.has(g.id))});
if(evidence.errors.length)throw Error(evidence.errors.join('\n'));
const byA=new Map();for(const lane of input.currentAtomicityConfigs){const allowed=A.collectConfiguredScopeGoalIds(lane.config,goals);for(const row of lane.rows){if(!allowed.has(row.goalId))throw Error('A original config not covering '+row.goalId);if(byA.has(row.goalId))throw Error('Duplicate A selected binding '+row.goalId);byA.set(row.goalId,{row,config:lane.config,configPath:lane.configPath});}}
if(byA.size!==25 ||byM.size!==25)throw Error('Missing current25 records');
const mcScope=M.collectConfiguredScopeGoalIds(mcfg,goals);
const prep=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2/copy-rebase-structure-and-open-final-inputs.author-preparation.json');
const imageGoals=new Set(prep.sevenFutureChangedResourceLinkGoalIds);
if(imageGoals.size!==7)throw Error('Not seven prospective resource goals');
const rows=selected.map(id=>{
 const g=goals.get(id),p=proposed.get(id);const a=byA.get(id),m=byM.get(id);
 if(!A.isLeaf(g)||!A.isSemanticAtomicityRelevantGoal(g)||!M.isReviewRelevantGoal(g)||!mcScope.has(id))throw Error('Selected goal outside original relevance/scope '+id);
 const errors=[...A.validateRecordShape(a.row,a.config),...M.validateRecordShape(m,mcfg,goals,evidence)];if(errors.length)throw Error(errors.join('\n'));
 const af=A.fingerprintGoal(g,a.config.ruleVersion),ap=A.fingerprintGoal(p,a.config.ruleVersion),mf=M.fingerprintGoal(g,mcfg.ruleVersion),mp=M.fingerprintGoal(p,mcfg.ruleVersion);
 if(af!==a.row.fingerprint||mf!==m.fingerprint)throw Error('Current selected stale '+id);
 let image=null;if(imageGoals.has(id)){
  // This deliberately artificial dependency fixture is not an actual prospective image or approval.
  const altered=structuredClone(g);altered.resourceLinks=[{type:'goal-visualization',resourceType:'image',role:'primary',skillpilotId:id,url:'/assets/goal-visualizations/chemie/'+id+'/'+id+'.png',provider:'DEPENDENCY FIXTURE ONLY',license:'DEPENDENCY FIXTURE ONLY',altText:'Entire resource link replaced only to measure dependency exclusion; no image science approval.'}];
  const ai=A.fingerprintGoal(altered,a.config.ruleVersion),mi=M.fingerprintGoal(altered,mcfg.ruleVersion);if(ai!==af||mi!==mf)throw Error('Unexpected image fingerprint dependency');
  image={fixtureRole:'dependency probe only; not final PNG/metadata',resourceLinkReplacementExcludedFromAtomicityFingerprint:true,resourceLinkReplacementExcludedFromMemoryFingerprint:true,expectedResourceOnlyAtomicityDelta:false,expectedResourceOnlyMemoryDelta:false};
 }
 return {goalId:id,title:g.title,atomicityConfigPath:a.configPath,atomicityReviewPath:a.config.reviewPath,atomicityRecord:a.row,currentAtomicityFingerprint:af,currentAtomicityBindingValid:true,enOnlyCandidateAtomicityFingerprint:ap,enOnlyCandidateAtomicityDelta:af!==ap,memoryReviewConfigPath:input.currentMemoryConfigPath,memoryReviewPath:mcfg.reviewPath,memoryRecord:m,currentMemoryFingerprint:mf,currentMemoryBindingValid:true,enOnlyCandidateMemoryFingerprint:mp,enOnlyCandidateMemoryDelta:mf!==mp,prospectiveResourceOnlyDependency:image,noNewScienceReviewOfUnchangedRecord:true};
});
const changes=rows.filter(x=>x.enOnlyCandidateAtomicityDelta||x.enOnlyCandidateMemoryDelta);if(changes.length!==1||changes[0].goalId!=='3bc48951-025c-5144-99b1-924db611a5f9')throw Error('Unexpected A/M semantic delta');
const allClosureM=input.currentClosureMemoryLines.map(JSON.parse);
const currentClosureM=allClosureM.filter(r=>M.fingerprintGoal(goals.get(r.goalId),mcfg.ruleVersion)===r.fingerprint);
if(currentClosureM.length!==allClosureM.length)throw Error('Shared card origin record stale');
const currentMMap=new Map(currentClosureM.map(r=>[r.goalId,r]));
const cards=input.currentRelatedSharedDeckCardLines.map(JSON.parse);
const pc=new Map(evidence.primaryCards.map(c=>[c.deckId+'::'+c.cardId,c]));
const cardRows=cards.map(r=>{
 const key=r.deckId+'::'+r.cardId,c=pc.get(key);if(!c)throw Error('Unknown card '+key);
 const fp=M.fingerprintMemoryCard(c,mcfg.ruleVersion);const errors=M.validateCardRecordShape(r,mcfg,goals,currentMMap);if(fp!==r.fingerprint||errors.length)throw Error('Card binding failure '+key+' '+errors.join(';'));
 return {deckId:r.deckId,cardId:r.cardId,activeCard:c,wholeKeptCardRecord:r,nativeCurrentCardFingerprint:fp,actualFingerprintValid:true,status:r.status,necessary:r.necessary,originGoalIds:r.originGoalIds,selected25OriginGoalIds:(r.originGoalIds??[]).filter(id=>selected.includes(id)),candidateCardBodyAndFingerprintUnchanged:true};
});
const visibility=M.collectMemoryVisibilityReport(mcfg,goals,memoryRows);if(visibility.errors.length)throw Error(visibility.errors.join('\n'));
const proposedVisibility=M.collectMemoryVisibilityReport(mcfg,proposed,memoryRows);if(JSON.stringify(proposedVisibility)!==JSON.stringify(visibility))throw Error('EN-only changed visibility');
const viewRows=mcfg.visibilityScopes.map(scope=>{
 const c=M.collectCompositionViewVisibleGoalIds(scope.viewPath,goals),n=M.collectCompositionViewVisibleGoalIds(scope.viewPath,proposed);if(c.errors.length||n.errors.length)throw Error([...c.errors,...n.errors].join('\n'));
 if(JSON.stringify([...c.visibleGoalIds].sort())!==JSON.stringify([...n.visibleGoalIds].sort()))throw Error('EN-only view change');
 return {label:scope.label,viewPath:scope.viewPath,allVisibleGoalIdsExactBetweenCurrentAndEnOnlyCandidate:true,selectedVisibleGoalIds:selected.filter(id=>c.visibleGoalIds.has(id)),selectedRequiredMemoryBindings:memoryRows.filter(r=>r.status==='memory_required').map(r=>({goalId:r.goalId,goalVisible:c.visibleGoalIds.has(r.goalId),referencedMemoryGoalIds:r.memoryGoalIds,visibleReferencedMemoryGoalIds:r.memoryGoalIds.filter(id=>c.visibleGoalIds.has(id)),validWhenGoalVisible:!c.visibleGoalIds.has(r.goalId)||r.memoryGoalIds.some(id=>c.visibleGoalIds.has(id))}))};
});
const changed=changes[0],id=changed.goalId,a=byA.get(id).row,m=byM.get(id);
const now=new Date().toISOString();
const newA={...a,fingerprint:changed.enOnlyCandidateAtomicityFingerprint,reviewedAt:now,reviewer:'Codex independent A/M targeted EN-scope review',reason:'Gezielter unabhängiger EN-only-Review: Der vollständige deutsche Text und der korrigierte englische Text wurden gelesen. Das Erklären von Elektronenverteilungen in Atomen und Atom-Ionen gehört bereits zum deutschen Ziel. Die EN-Ergänzung vervollständigt denselben Quantenzahlen-/Besetzungsregel-Zusammenhang und fügt dem kanonischen DE-Kompetenzumfang keine neue unabhängige Routine hinzu. Status atomic bleibt für genau diesen gebundenen EN-only-Kandidaten; kein ganzer historischer Review-Neustart. Finale technische Bindung nach dem tatsächlichen v2-Endstand bleibt erforderlich.'};
const newM={...m,fingerprint:changed.enOnlyCandidateMemoryFingerprint,reviewedAt:now,reviewer:'Codex independent A/M targeted EN-scope review',reason:'Gezielter unabhängiger EN-only-Review: Memory bleibt erforderlich ausschließlich für die kompakten Besetzungsregeln Aufbau/Pauli/Hund auf der unveränderten kept-Karte chem_bond_008 des bestehenden Decks de_gymnasium_chemistry_bonding_structure und Memoryziels 1e519951-9850-5a07-ac82-d9f0075e3d05. Die nun vollständig übersetzte Elektronenverteilungs-Erklärung für Atome und Atom-Ionen ist bereits DE-Scope und bleibt Modellverständnis/Aufgabenpraxis; weder neue Karte noch Behauptung, die Karte beweise Natrium-Doppellinie, vollständige PSE-Anordnung oder jede Atom-Ion-Verteilung. Diese Entscheidung gilt dem gebundenen EN-only-Kandidaten, nicht einem unversiegelten finalen Raster-/Metastand.'};
fs.writeFileSync(path.join(own,'independent-a.3bc.atomicity.candidate-preview.review.jsonl'),JSON.stringify(newA)+'\n');
fs.writeFileSync(path.join(own,'independent-a.3bc.memory.candidate-preview.review.jsonl'),JSON.stringify(newM)+'\n');
const fixtureList=[];
for(let i=0;i<input.currentAtomicityConfigs.length;i++){
 const lane=input.currentAtomicityConfigs[i],root='fixtures/a-current-'+(i+1),cfg={...lane.config,landscapePath:path.join(own,'snapshots/current479-current378.canonical.snapshot.json'),reviewPath:path.join(own,root+'.review.jsonl'),scope:{label:'Scoped existing current25 A binding check; byte-exact old records, no science restart',leafGoalIds:lane.rows.map(r=>r.goalId)}};
 fs.writeFileSync(path.join(own,root+'.review.jsonl'),lane.lines.join('\n')+'\n');write(root+'.config.json',cfg);fixtureList.push({gate:'A',case:'current-byte-exact-reuse',configPath:path.join(own,root+'.config.json'),expectedExit:0,goalCount:lane.rows.length});
}
const aLane=byA.get(id),oneBase={...aLane.config,scope:{label:'One current EN-delta goal, targeted fixture only',leafGoalIds:[id]}};
for(const kind of ['old-record-stale','fresh-independent-preview']){
 const root='fixtures/a-candidate-one-'+kind;const cfg={...oneBase,landscapePath:path.join(own,'snapshots/v2-en-only479-current378.canonical.snapshot.json'),reviewPath:path.join(own,root+'.review.jsonl')};
 fs.writeFileSync(path.join(own,root+'.review.jsonl'),kind==='old-record-stale'?aLane.config.reviewId&&JSON.stringify(a)+'\n':JSON.stringify(newA)+'\n');write(root+'.config.json',cfg);fixtureList.push({gate:'A',case:kind,configPath:path.join(own,root+'.config.json'),expectedExit:kind==='old-record-stale'?1:0,goalCount:1});
}
for(const kind of ['current-byte-exact-reuse','candidate-old-record-stale','candidate-fresh-independent-preview']){
 const root='fixtures/m-'+kind;const isCurrent=kind==='current-byte-exact-reuse';const cfg={...mcfg,landscapePath:path.join(own,'snapshots/'+(isCurrent?'current479-current378.canonical.snapshot.json':'v2-en-only479-current378.canonical.snapshot.json')),reviewPath:path.join(own,root+'.review.jsonl'),cardReviewPath:path.join(own,root+'.cards.review.jsonl'),reportPath:path.join(own,root+'.unused-report.md'),scope:{label:'Bounded current25 plus exact existing shared-card origin closure; no new card science',leafGoalIds:[...input.nativeClosureOrdinaryGoalIds,...input.nativeClosureMemoryGoalIds]}};
 const ml=kind==='candidate-fresh-independent-preview'?input.currentClosureMemoryLines.map(l=>JSON.parse(l).goalId===id?JSON.stringify(newM):l):input.currentClosureMemoryLines;
 fs.writeFileSync(path.join(own,root+'.review.jsonl'),ml.join('\n')+'\n');fs.writeFileSync(path.join(own,root+'.cards.review.jsonl'),input.currentRelatedSharedDeckCardLines.join('\n')+'\n');write(root+'.config.json',cfg);fixtureList.push({gate:'M',case:kind,configPath:path.join(own,root+'.config.json'),expectedExit:kind==='candidate-old-record-stale'?1:0,ordinaryGoalCount:input.nativeClosureOrdinaryGoalIds.length,memoryGoalCount:input.nativeClosureMemoryGoalIds.length,cardCount:cards.length,visibilityScopes:mcfg.visibilityScopes.length});
}
write('actual-native-function-bindings-and-readonly-fixtures.json',{schemaVersion:1,nativeFunctionDefinitions:bound,functionsExtractedFromActualUnmodifiedSource:true,TypeScriptTranspileOnlyNoNativeSourceEdits:true,fixtureFiles:fixtureList,fixtureScienceScope:'Current records reused; only one EN scope reviewed anew; seven resource-only substitutions are synthetic dependency probes, no PNG verdict',activeWrites:false});
write('current25-native-A-M-fingerprints-and-prospective-deltas.actual.json',{schemaVersion:1,records:rows,currentAValid:25,currentMValid:25,currentMemoryRequired:memoryRows.filter(r=>r.status==='memory_required').length,currentNoMemoryNeeded:memoryRows.filter(r=>r.status==='no_memory_needed').length,semanticCandidateDeltaGoalIds:changes.map(r=>r.goalId),resourceOnlyDependencyProbeGoalIds:[...imageGoals],resourceOnlyADeltaCount:0,resourceOnlyMDeltaCount:0,candidateFinalStagePending:true,operativeFingerprintsNotApprovedAgainstFinalStage:true,noOther24ScientificReviewRestart:true});
write('current-two-shared-decks-22-card-status-and-three-visibility-scopes.actual.json',{schemaVersion:1,deckIds:input.relatedDeckIds,currentNativeDeckErrors:evidence.errors,currentPrimaryCards:cardRows,primaryCards:22,actualActiveCardStatuses:Object.fromEntries([...new Set(cards.map(r=>r.status))].map(s=>[s,cards.filter(r=>r.status===s).length])),currentSelected25VisibilityReport:visibility,actualViewBindings:viewRows,exactWholeVisibleSetsAfterEnOnlyCandidate:true,cardBodiesUnchanged:true,cardScienceNotHistoricallyRepeated:true,selected25RequiredGoalCount:6,nativeSharedCardClosureOrdinaryCount:41,nativeSharedMemoryGoalCount:2,noNewDecksOrCards:true,finalChangedInputsNeedFreshTechnicalEqualityCheck:true});
console.log(JSON.stringify({currentAValid:25,currentMValid:25,memoryRequired:6,noMemoryNeeded:19,semanticDelta:[id],cardStatuses:Object.fromEntries([...new Set(cards.map(r=>r.status))].map(s=>[s,cards.filter(r=>r.status===s).length])),visibilityErrors:visibility.errors.length,readOnlyFixtures:fixtureList.length,Aold:changed.currentAtomicityFingerprint,Apreview:changed.enOnlyCandidateAtomicityFingerprint,Mold:changed.currentMemoryFingerprint,Mpreview:changed.enOnlyCandidateMemoryFingerprint}));
