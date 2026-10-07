// Apache-2.0. Bounded independent native derivation; only own dossier output.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {loadGoalBookBuildInputs,fingerprintSemanticKindSourceGoal} from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel';
import {buildGoalDescriptionRolloutSubsetModel} from '/home/enpasos/projects/skillpilot/app/scripts/materializeGoalDescriptionRolloutBatch';
import {buildGoalDescriptionReviewInput} from '/home/enpasos/projects/skillpilot/app/scripts/validateGoalDescriptionReviewCampaign';
const a='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-continuation-author-v3/stage-02-current-twenty-one-native',o='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-description-positive-independent-b-v3';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const bind=(p:string)=>({path:p,sha256:'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length});
const write=(p:string,x:any)=>{writeFileSync(p+'.tmp',JSON.stringify(x,null,2)+'\n');renameSync(p+'.tmp',p);};
const current=(await loadGoalBookBuildInputs(a+'/full-current390.book.config.json',process.cwd())).model;
const future=(await loadGoalBookBuildInputs(a+'/full-candidate390.book.config.json',process.cwd())).model;
assert.deepEqual(current,read(a+'/qa-artifacts/full-current390.book-model.json'));
assert.deepEqual(future,read(a+'/qa-artifacts/full-candidate390.book-model.json'));
assert.equal(current.pages.length,390);assert.equal(future.pages.length,390);
assert.deepEqual(future.pages.map(p=>p.goalId),current.pages.map(p=>p.goalId));
const subsets=[];for(const part of ['twenty','one']){const config=read(a+'/native-d-'+part+'.batch.config.json');const model=buildGoalDescriptionRolloutSubsetModel({baseModel:future,goalIds:config.goalIds,bookId:config.bookId,title:config.title});assert.deepEqual(model,read(a+'/native-d-'+part+'/bundle/book-model.json'));subsets.push({part,deepEqual:true,goalIds:model.pages.map(p=>p.goalId),digest:model.digest});}
const canon=read(a+'/current472-neuro21.complete-author-candidate.json'),before=read(a+'/current472.actual-baseline.snapshot.json');
assert.equal(canon.goals.length,472);assert.deepEqual(canon.goals.map((g:any)=>[g.id,g.requires,g.contains]),before.goals.map((g:any)=>[g.id,g.requires,g.contains]));
assert.deepEqual(before,read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'));
const raw=read(a+'/final-current21-whole-native-source-context-material-review-inputs.author.raw.json'),selected=new Set(raw.exactSelected21GoalIds);
const goals=new Map(canon.goals.map((g:any)=>[g.id,g]));const changedGoals=[];
for(const g of before.goals){const n=goals.get(g.id);if(!selected.has(g.id))assert.deepEqual(n,g);else if(JSON.stringify(n)!==JSON.stringify(g))changedGoals.push(g.id);}
const kinds=read(a+'/semantic-kinds.current472.neuro21.source-binding.author-candidate.json'),oldKinds=read(a+'/semantic-kinds.current472.baseline.snapshot.json');
assert.equal(kinds.decisions.length,oldKinds.decisions.length);const changedKinds=[];
for(let i=0;i<kinds.decisions.length;i++){const r=kinds.decisions[i],p=oldKinds.decisions[i];assert.equal(r.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(r.goalId)));const {sourceFingerprint:rf,...rr}=r,{sourceFingerprint:pf,...pp}=p;assert.deepEqual(rr,pp);if(rf!==pf)changedKinds.push(r.goalId);}
assert.equal(changedKinds.length,21);assert.deepEqual([...changedKinds].sort(),[...selected].sort());
const changes=future.pages.filter((p,i)=>JSON.stringify(p)!==JSON.stringify(current.pages[i]));assert.equal(changes.length,18);
const unselectedChanges=changes.filter(p=>!selected.has(p.goalId));assert.deepEqual(unselectedChanges.map(p=>p.goalId),['9499943f-89b7-54e3-9fe2-e90404beaa4a']);
const authorDelta=read(a+'/all390-current-candidate-pages-contexts-source-visual-deltas.author.json');
assert.equal(authorDelta.protected74Rows.length,74);for(const r of authorDelta.protected74Rows){const id=r.goalId;assert.deepEqual(goals.get(id),before.goals.find((g:any)=>g.id===id));assert.deepEqual(future.pages.find(p=>p.goalId===id),current.pages.find(p=>p.goalId===id));}
const makeContexts=(model:any,landscape:any)=>buildGoalDescriptionReviewInput({bundle:{bookModelDigest:model.digest,bundleFingerprint:'sha256:'+('0'.repeat(64)),goals:model.pages.map((p:any)=>({goalId:p.goalId,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint}))} as any,reviewInput:{schemaVersion:1,book:model.book,modelDigest:model.digest,pages:model.pages.map((page:any)=>({page,evidenceProfile:null}))} as any,landscape}).goals;
const oldContexts=makeContexts(current,before),newContexts=makeContexts(future,canon);const contextChanges=newContexts.filter((g,i)=>JSON.stringify(g)!==JSON.stringify(oldContexts[i]));
assert.deepEqual(contextChanges.map(g=>g.goalId),authorDelta.actualChangedWholeDInputs);
for(const r of authorDelta.protected74Rows){assert.deepEqual(newContexts.find(g=>g.goalId===r.goalId),oldContexts.find(g=>g.goalId===r.goalId));}
for(const part of ['twenty','one']){const base=a+'/native-d-'+part+'/round-b',bundle=read(base+'/review-bundle-manifest.json'),reviewInput=read(a+'/native-d-'+part+'/bundle/review-input.json');assert.deepEqual(buildGoalDescriptionReviewInput({bundle,reviewInput,landscape:canon}),read(base+'/description-review-input.json'));}
const output={schemaVersion:1,createdAtUTC:new Date().toISOString(),status:'PASS',productionFunctions:['loadGoalBookBuildInputs','buildGoalDescriptionRolloutSubsetModel','fingerprintSemanticKindSourceGoal'],fullCurrent390DeepEqualFrozen:true,fullCandidate390DeepEqualFrozen:true,ordered390GoalIdsExact:true,subsets,whole472IDsAndAllRequiresContainsExact:true,other451WholeCanonicalGoalsExact:true,selected21ChangedWholeGoals:changedGoals,wholeKindDecisionBodiesExact:true,only21SourceFingerprintBindingsChanged:changedKinds,protected74WholeGoalsAndPageContextsExact:true,actualChangedWholePages:changes.map(p=>({goalId:p.goalId,before:current.pages.find(q=>q.goalId===p.goalId),after:p})),changedUnselectedPageOnly949:true,unchangedWholePages:372,sourceAtlasCountryScopeApproval:false,newFull390PDFOrBrowserSight:false,paths:['full-current390.book.config.json','full-candidate390.book.config.json','qa-artifacts/full-current390.book-model.json','qa-artifacts/full-candidate390.book-model.json','current472.actual-baseline.snapshot.json','current472-neuro21.complete-author-candidate.json','semantic-kinds.current472.baseline.snapshot.json','semantic-kinds.current472.neuro21.source-binding.author-candidate.json'].map(p=>bind(a+'/'+p)),activeWrites:false,strictNetGain:0,humanApproval:false};
write(o+'/independent-b.native-current390-context-derivation.actual.json',output);
write(o+'/independent-b.native-current390-whole-D-context-comparison.actual.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),productionFunction:'buildGoalDescriptionReviewInput',scope:'Read-only full390 canonical context projection with actual pages; no full390 publication/review-bundle generation',actualSubset20And1InputsDeepEqual:true,full390OrderedContextsExact:true,actualChangedWholeDInputGoalIds:contextChanges.map(g=>g.goalId),protected74WholeDContextsExact:true,otherNonselectedChangeOnly949:true,changedContexts:contextChanges.map(g=>({goalId:g.goalId,before:oldContexts.find(q=>q.goalId===g.goalId),after:g})),activeWrites:false,humanApproval:false,strictNetGain:0});
console.log(JSON.stringify({status:'PASS',currentPages:390,candidatePages:390,subsets:subsets.map(x=>[x.part,x.goalIds.length]),changedPages:changes.length,other451Exact:true,protected74Exact:true,changedKindBindings:changedKinds.length}));
