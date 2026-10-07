import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {applyCompositionViewProjection} from '../../../../../../../app/src/utils/compositionViewRuntime.ts';
import {convertLearningGoal} from '../../../../../../../app/src/goalTypes.ts';
const repo=process.cwd();
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-regional-all-required-memory-placement-author-v3';
const require=createRequire(path.resolve('app/package.json'));
const ts=require('typescript');
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p:string,v:unknown)=>fs.writeFileSync(path.join(own,p),JSON.stringify(v,null,2)+'\n');
const sha=(x:any)=>createHash('sha256').update(x).digest('hex');
const inp=read(path.join(own,'snapshots/previous25-routing-and-exact-ledger-lines.input.json'));
const raw=read(path.join(own,'actual-regional-scope-stable-goal-deck-and-parent-freeze.input.json'));
const current=read(path.join(own,'snapshots/current479-current378.observed-native-compilation-input.json'));
const goals=new Map(current.goals.map((g:any)=>[g.id,g]));
const focus=inp.currentSelected25MemoryLines.map(JSON.parse);
const six=focus.filter((r:any)=>r.status==='memory_required');
const fullRows=fs.readFileSync(path.join(own,'snapshots/full-existing-memory-ledger.readonly-review.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
const mfile='app/scripts/memoryCardReview.ts',src=fs.readFileSync(mfile,'utf8'),bound:any[]=[];
function nativeFunctions(names:string[]) {
 const bodies=names.map(name=>{
  const m=src.match(new RegExp('^function '+name+'(?:<[^>]*>)?\\s*\\(','m'));
  if(!m)throw Error('Missing actual native function '+name);
  const begin=m.index!;const next=src.slice(begin+1).match(/^function\s+\w+(?:<[^>]*>)?\s*\(/m);
  const body=src.slice(begin,next?begin+1+next.index!:src.length);
  bound.push({nativeSourcePath:mfile,nativeSourceSHA256:sha(src),functionName:name,exactDefinitionSHA256:sha(body)});return body;
 });
 const code="import {createHash} from 'node:crypto'; import {readFileSync,existsSync} from 'node:fs'; import {resolve} from 'node:path';\n"+`const repoRoot=${JSON.stringify(repo)};\n`+['statusOrder','cardStatusOrder'].map(n=>src.match(new RegExp('^const '+n+'[^\\n]*$','m'))![0]).join('\n')+'\n'+bodies.join('\n')+'\nexport {'+names.join(',')+'};\n';
 const js=ts.transpileModule(code,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};new Function('module','exports','require',js)(mod,mod.exports,require);return mod.exports as any;
}
const M=nativeFunctions(['loadJson','resolveRepoPath','normalizeText','stableJson','fingerprintGoal','fingerprintMemoryCard','isLeaf','isMemoryGoal','isReviewRelevantGoal','collectCompositionViewVisibleGoalIds','collectMemoryVisibilityReport','memoryDeckIdsFromGoal','memoryVocabularySources','resolveVocabularySourcePath','isPrimaryMemoryDeckSource','formatGoal','collectMemoryDeckEvidence','validateRecordShape','validateCardRecordShape']);
const memids=current.goals.filter((g:any)=>M.isMemoryGoal(g)).map((g:any)=>g.id);
const evidence=M.collectMemoryDeckEvidence({...current,goals:current.goals.filter((g:any)=>memids.includes(g.id))});
if(evidence.errors.length)throw Error(evidence.errors.join('\n'));
const closureLines=fs.readFileSync(path.join(own,'snapshots/full-existing-memory-ledger.readonly-review.jsonl'),'utf8').trim().split('\n');
const closureRows=closureLines.map(JSON.parse);
const closureMap=new Map(closureRows.map((r:any)=>[r.goalId,r]));
for(const r of closureRows){if(M.fingerprintGoal(goals.get(r.goalId),inp.currentMemoryConfig.ruleVersion)!==r.fingerprint)throw Error('Current closure stale '+r.goalId);}
const cardLines=fs.readFileSync(path.join(own,'snapshots/full-existing-55-card-ledger.byte-exact.input.jsonl'),'utf8').trim().split('\n');
const cards=cardLines.map(JSON.parse);
const physicalCards=new Map(evidence.primaryCards.map((c:any)=>[c.deckId+'::'+c.cardId,c]));
const exactCards=cards.map((r:any)=>{
 const c=physicalCards.get(r.deckId+'::'+r.cardId);
 if(!c)throw Error('Unknown card');
 const errs=M.validateCardRecordShape(r,inp.currentMemoryConfig,goals,closureMap);
 if(errs.length||M.fingerprintMemoryCard(c,inp.currentMemoryConfig.ruleVersion)!==r.fingerprint||r.status!=='kept'||r.necessary!==true)throw Error('Card failure '+r.cardId);
 return {activeWholeNativeCard:c,originalWholeKeptCardRecord:r,nativeCurrentCardFingerprint:r.fingerprint,cardAndOriginCurrent:true};
});
const baseFullCurrent=fullRows.filter((r:any)=>goals.has(r.goalId)&&M.fingerprintGoal(goals.get(r.goalId),inp.currentMemoryConfig.ruleVersion)===r.fingerprint);
const candidateViews:any[]=[],beforeRows:any[]=[],afterRows:any[]=[],negativeScopes:any[]=[];
const compiledSnapshot=(view:any)=>{
 const n=normalizeCompositionView(view),c=compileCompositionView(n,current as any);
 const role=collectCompositionProjectionRoleGoalIds(n.rootNodes,goals as any);
 const occurrences:any[]=[];function walk(a:any,trail:string[]=[]){if(a.sourceGoalId)occurrences.push({goalId:a.sourceGoalId,path:trail.concat(a.runtimeId)});for(const ch of a.children)walk(ch,trail.concat(a.runtimeId));}
 c.compiledRootNodes.forEach((r:any)=>walk(r));
 const entry={meta:current,goals:current.goals.map((g:any)=>convertLearningGoal(g,{landscapeId:current.landscapeId}))};
 const projected=applyCompositionViewProjection([entry] as any,view)[0];
 const runtimeById=new Map(projected.goals.map((g:any)=>[g.id,g]));
 const runtimeRoots=projected.goals.filter((g:any)=>g.tags?.includes('root')).map((g:any)=>g.id);
 const reached=new Set<string>();function reach(id:string){if(reached.has(id))return;reached.add(id);const g:any=runtimeById.get(id);for(const ch of g?.contains??[])reach(ch);}
 runtimeRoots.forEach(reach);
 const reachedCanonical=[...reached].filter(id=>goals.has(id)).sort();
 const missingRuntimeTargets=[...role.targetGoalIds].filter(id=>!reached.has(id));
 const duplicateCanonicalOccurrences=[...new Set(occurrences.map(r=>r.goalId))].filter(id=>occurrences.filter(r=>r.goalId===id).length>1);
 if(missingRuntimeTargets.length||duplicateCanonicalOccurrences.length)throw Error('Actual materialization mismatch');
 return {scope:n.scope,viewId:n.viewId,findings:c.findings,allNativeTargetGoalIds:[...role.targetGoalIds].sort(),nativePrerequisiteOnlyGoalIds:[...role.prerequisiteOnlyGoalIds].sort(),actualCompiledRootNodes:c.compiledRootNodes,canonicalOccurrences:occurrences,duplicateCanonicalOccurrences,runtimeProjectionRoots:runtimeRoots,actualRuntimeReachCanonicalGoalIds:reachedCanonical,allNativeTargetsActuallyMaterialized:true};
};
for(const spec of raw.regionalViews){
 const view=read(spec.ownSnapshotPath),n=path.basename(spec.activeViewPath),label=`${view.scope.jurisdiction} ${view.scope.courseProfile} actual CrossStage learner view`;
 const before=compiledSnapshot(view);if(before.findings.some((f:any)=>f.severity==='error'))throw Error('Existing view compiler error');
 const visible=M.collectCompositionViewVisibleGoalIds(spec.ownSnapshotPath,goals);if(visible.errors.length)throw Error(visible.errors.join('\n'));
 const each=six.map((r:any)=>({goalId:r.goalId,goalVisible:visible.visibleGoalIds.has(r.goalId),goalNativeTarget:before.allNativeTargetGoalIds.includes(r.goalId),goalActuallyRuntimeReachable:before.actualRuntimeReachCanonicalGoalIds.includes(r.goalId),memoryGoalIds:r.memoryGoalIds,visibleReferencedMemoryGoalIds:r.memoryGoalIds.filter((id:string)=>visible.visibleGoalIds.has(id))}));
 const needed=[...new Set(baseFullCurrent.filter((r:any)=>r.status==='memory_required'&&visible.visibleGoalIds.has(r.goalId)).flatMap((r:any)=>r.memoryGoalIds??[]))].sort() as string[];
 if(needed.some(id=>!memids.includes(id)))throw Error('Unknown current memory reference');
 const prop=structuredClone(view);
 if(memids.some((id:string)=>visible.visibleGoalIds.has(id)))throw Error('Candidate addition would duplicate existing memory');
 prop.rootNodes[0].children.push({kind:'structure',id:`chemistry-${view.scope.jurisdiction.toLowerCase()}-${view.scope.courseProfile.toLowerCase()}-memory-required-for-visible-goals`,label:'Lernkarten zur Chemie',children:needed.map((id:string)=>({kind:'goalEntry',goalId:id}))});
 const propPath=path.join(own,'candidate-views',n);fs.writeFileSync(propPath,JSON.stringify(prop,null,2)+'\n');
 const after=compiledSnapshot(prop);if(after.findings.some((f:any)=>f.severity==='error'))throw Error('Candidate compiler error');
 const aVis=M.collectCompositionViewVisibleGoalIds(propPath,goals);if(aVis.errors.length)throw Error(aVis.errors.join('\n'));
 const removed=before.allNativeTargetGoalIds.filter((id:string)=>!after.allNativeTargetGoalIds.includes(id));
 const added=after.allNativeTargetGoalIds.filter((id:string)=>!before.allNativeTargetGoalIds.includes(id));
 if(removed.length||JSON.stringify(added.slice().sort())!==JSON.stringify(needed.slice().sort()))throw Error('Unexpected target delta');
 const sourceBranchBefore=view.rootNodes[0].children[1],sourceBranchAfter=prop.rootNodes[0].children[1];
 if(JSON.stringify(sourceBranchBefore)!==JSON.stringify(sourceBranchAfter))throw Error('Source-backed branch changed');
 const directEach=six.map((r:any)=>({goalId:r.goalId,goalVisible:aVis.visibleGoalIds.has(r.goalId),goalNativeTarget:after.allNativeTargetGoalIds.includes(r.goalId),goalActuallyRuntimeReachable:after.actualRuntimeReachCanonicalGoalIds.includes(r.goalId),memoryGoalIds:r.memoryGoalIds,visibleReferencedMemoryGoalIds:r.memoryGoalIds.filter((id:string)=>aVis.visibleGoalIds.has(id)),referenceMemoryNativeTarget:r.memoryGoalIds.some((id:string)=>after.allNativeTargetGoalIds.includes(id)),referenceActuallyRuntimeReachable:r.memoryGoalIds.some((id:string)=>after.actualRuntimeReachCanonicalGoalIds.includes(id))}));
 beforeRows.push({activeViewPath:spec.activeViewPath,ownSnapshotPath:spec.ownSnapshotPath,label,compiledAndRuntime:before,selectedSixBinding:each});
 afterRows.push({futureActiveViewPath:spec.activeViewPath,candidateViewPath:propPath,label,compiledAndRuntime:after,selectedSixBinding:directEach,sourceBackedBranchWholeExact:true,allOldTargetsPreserved:true,exactAddedTargets:added,exactVisibleTargetRequiredMemoryReferences:needed,noUnneededReferenceAdded:true,noCurricularAtomicDenominatorChange:true});
 candidateViews.push({label,viewPath:propPath});
 const neg=structuredClone(prop);for(const r of neg.rootNodes[0].children.at(-1).children){if(r.goalId==='1e519951-9850-5a07-ac82-d9f0075e3d05')r.projectionRole='prerequisiteOnly';}
 const negPath=path.join(own,'fixtures','negative-prerequisite-only-'+n);fs.writeFileSync(negPath,JSON.stringify(neg,null,2)+'\n');negativeScopes.push({label:label+' dependency-negative fixture: bonding-memory prerequisiteOnly',viewPath:negPath});
}
const oldScopes=raw.regionalViews.map((x:any)=>({label:`${x.scope.jurisdiction} ${x.scope.courseProfile} actual learner view before placement`,viewPath:x.ownSnapshotPath}));
const cfgBefore={...inp.currentMemoryConfig,visibilityScopes:oldScopes};
const cfgAfter={...inp.currentMemoryConfig,visibilityScopes:candidateViews};
const selectedBefore=M.collectMemoryVisibilityReport(cfgBefore,goals,focus),selectedAfter=M.collectMemoryVisibilityReport(cfgAfter,goals,focus);
const fullBefore=M.collectMemoryVisibilityReport(cfgBefore,goals,baseFullCurrent),fullAfter=M.collectMemoryVisibilityReport(cfgAfter,goals,baseFullCurrent);
if(fullBefore.missingVisibleMemoryGoals!==124||fullAfter.errors.length||fullAfter.missingVisibleMemoryGoals!==0)throw Error('Expected scoped gap then resolution not observed');
const proposed=structuredClone(current),updatedPreview=JSON.parse(fs.readFileSync(path.join(own,'snapshots/previous-independent-3bc-EN-science-preview.memory.review.jsonl'),'utf8'));
const previewRaw=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next25-current-atomicity-memory-impact-independent-a-v1/3bc-exact-EN-atomicity-memory-scientific-verdict-and-visibility-HOLD.json');
const pGoal=proposed.goals.find((g:any)=>g.id===updatedPreview.goalId);pGoal.descriptionEn=previewRaw.actualENOnlyCandidateWholeGoal.descriptionEn;
write('snapshots/current-base-with-one-reviewed-EN-delta.candidate.json',proposed);
const exactWhole3bc={current:goals.get(updatedPreview.goalId),proposed:pGoal,currentMemoryFingerprint:M.fingerprintGoal(goals.get(updatedPreview.goalId),inp.currentMemoryConfig.ruleVersion),proposedMemoryFingerprint:M.fingerprintGoal(pGoal,inp.currentMemoryConfig.ruleVersion),independentPreviousPreviewExactMatch:M.fingerprintGoal(pGoal,inp.currentMemoryConfig.ruleVersion)===updatedPreview.fingerprint};
if(!exactWhole3bc.independentPreviousPreviewExactMatch)throw Error('Previous scientific EN preview FP is no longer exact');
const baseCfg={...inp.currentMemoryConfig,reportPath:path.join(own,'qa-artifacts/unused-no-write.report.md')};
const cases:any[]=[];
for(let j=0;j<4;j++)cases.push({id:`0${j+1}-original-regional-${j+1}-full54-missing-memory`,scopes:[oldScopes[j]],landscape:'snapshots/current479-current378.observed-native-compilation-input.json',fresh:false,exit:1});
for(let j=0;j<4;j++)cases.push({id:`0${j+5}-corrected-regional-${j+1}-all54-and-reviewed-EN`,scopes:[candidateViews[j]],landscape:'snapshots/current-base-with-one-reviewed-EN-delta.candidate.json',fresh:true,exit:0});

for(const c of cases){
 const prefix='fixtures/'+c.id;
 const cfg={...baseCfg,landscapePath:path.join(own,c.landscape),reviewPath:path.join(own,prefix+'.review.jsonl'),cardReviewPath:path.join(own,prefix+'.cards.review.jsonl'),visibilityScopes:c.scopes};
 // The original coverage flag is preserved exactly, never lowered. Exact per-goal coverage is also inspected separately.
 if(cfg.visibilityScopeCoverageRequired!==inp.currentMemoryConfig.visibilityScopeCoverageRequired)throw Error('Coverage policy changed');
 const rows=closureLines.map((line:string)=>c.fresh&&JSON.parse(line).goalId===updatedPreview.goalId?JSON.stringify(updatedPreview):line);
 fs.writeFileSync(cfg.reviewPath,rows.join('\n')+'\n');fs.writeFileSync(cfg.cardReviewPath,cardLines.join('\n')+'\n');
 write(prefix+'.config.json',cfg);(c as any).configPath=path.join(own,prefix+'.config.json');
}

const unionCfg={...inp.currentMemoryConfig,visibilityScopes:[...inp.currentMemoryConfig.visibilityScopes,...candidateViews]};
const unionVisibility=M.collectMemoryVisibilityReport(unionCfg,goals,baseFullCurrent);
if(unionVisibility.errors.length)throw Error('Full seven-scope union still has concrete errors '+unionVisibility.errors.join('\n'));
const unionGoalRows=baseFullCurrent.filter((r:any)=>r.status==='memory_required').map((r:any)=>({goalId:r.goalId,referencedMemoryGoalIds:r.memoryGoalIds,deckIds:r.deckIds,actualVisibleAndMemoryReferenceScopePairs:unionCfg.visibilityScopes.flatMap((s:any)=>{const v=M.collectCompositionViewVisibleGoalIds(s.viewPath,goals);return v.visibleGoalIds.has(r.goalId)?[{label:s.label,viewPath:s.viewPath,visibleReferencedMemoryGoalIds:r.memoryGoalIds.filter((id:string)=>v.visibleGoalIds.has(id))}]:[]})}));
write('full54-seven-real-learner-scopes-and-exact-required-reference-routing.actual.json',{schemaVersion:1,originalNationalScopesUnchanged:true,exactlyFourRealRegionalScopesAdded:true,allFullCurrentMemoryRequiredRows:unionGoalRows,fullSevenScopeNativeReport:unionVisibility,all54ActuallyCovered:unionGoalRows.every((r:any)=>r.actualVisibleAndMemoryReferenceScopePairs.length>0),everyConditionalReferencePairSatisfied:unionGoalRows.every((r:any)=>r.actualVisibleAndMemoryReferenceScopePairs.every((s:any)=>s.visibleReferencedMemoryGoalIds.length>0)),originalCoverageFlagPreserved:inp.currentMemoryConfig.visibilityScopeCoverageRequired??'unset',newHumanOrRuntimeAcceptance:false});
const futureReview=path.join(own,'full378-plus-reviewed-3bc-EN.memory.review.author-candidate.jsonl');
fs.writeFileSync(futureReview,closureLines.map((line:string)=>JSON.parse(line).goalId===updatedPreview.goalId?JSON.stringify(updatedPreview):line).join('\n')+'\n');
const activeScopes=raw.regionalViews.map((s:any)=>({label:`${s.scope.jurisdiction} ${s.scope.courseProfile} actual learner-facing CrossStage`,viewPath:s.activeViewPath}));
write('full378-memory.future-active-config.author-candidate.json',{...inp.currentMemoryConfig,reviewPath:futureReview,visibilityScopes:[...inp.currentMemoryConfig.visibilityScopes,...activeScopes]});
write('future-active-config-is-not-currently-runnable-before-reviewed-integration.receipt.json',{schemaVersion:1,reason:'Candidate config references active CAN and actual four future active view paths; active current files do not yet contain authored placements or the EN fix.',fullOriginalConfigScopeExact:true,existingRuleVersionReviewIdCardPathCoverageFlagAndOriginalThreeScopesPreserved:true,reviewRowsUnchangedExceptOnePreviouslyIndependentReviewed3bcEN:true,all55CardsAndSixDecksUnchanged:true,requiresDifferentIndependentPlacementReviewer:true});
write('native-four-current-regional-materializations.actual.json',{schemaVersion:1,role:'Actual production authoring compiler + production learner-runtime materialization + native memory visibility; not browser or host acceptance',views:beforeRows});
write('four-all-required-memory-placement-candidates.native-materialization-and-literal-delta.actual.json',{schemaVersion:1,role:'Authored data-only placement candidate, requires another independent reviewer before active integration',views:afterRows});
write('all54-required-six-decks-55-cards-and-regional-native-visibility.actual.json',{schemaVersion:1,selectedSix:six,actualSixMemoryGoals:memids.map((id:string)=>goals.get(id)),actual55KeptCards:exactCards,originalFourSelectedScopeVisibility:selectedBefore,candidateFourSelectedScopeVisibility:selectedAfter,fullExistingCurrentRecordCount:baseFullCurrent.length,fullLedgerStaleOutsideSelected:fullRows.filter((r:any)=>!baseFullCurrent.includes(r)).map((r:any)=>r.goalId),fullCurrentRegionalVisibilityBeforeDiagnostic:fullBefore,fullCurrentRegionalVisibilityAfterDiagnostic:fullAfter,diagnosticFullLedgerIsNotFullSourceOrScienceApproval:true,exactWhole3bc,existingOriginalNationalThreeDoNotProve3bcVisibility:true,coverageFlagOriginalAndCandidate:inp.currentMemoryConfig.visibilityScopeCoverageRequired??'unset'});
write('actual-native-helper-function-bindings-and-bounded-check-plan.json',{schemaVersion:1,exactFunctionBindings:bound,directProductionModules:['app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/compositionViewRuntime.ts','app/src/goalTypes.ts'],nativeCheckerSourceUnchanged:true,fixtureRole:'Data-only positive/negative scoped native CLI inputs; checker policy unmodified',cases});
console.log(JSON.stringify({beforeViews:beforeRows.map(v=>({path:v.activeViewPath,scope:v.compiledAndRuntime.scope,targets:v.compiledAndRuntime.allNativeTargetGoalIds.length,requiredVisible:v.selectedSixBinding.filter((r:any)=>r.goalVisible).length,memoryMissing:v.selectedSixBinding.filter((r:any)=>r.goalVisible&&r.visibleReferencedMemoryGoalIds.length===0).length,compilerErrors:v.compiledAndRuntime.findings.filter((f:any)=>f.severity==='error').length})),afterCandidateSelectedMissing:selectedAfter.missingVisibleMemoryGoals,fullCurrentDiagnosticMissingBefore:fullBefore.missingVisibleMemoryGoals,fullCurrentDiagnosticMissingAfter:fullAfter.missingVisibleMemoryGoals,cards:exactCards.length,nativeFixtureCount:cases.length},null,2));
