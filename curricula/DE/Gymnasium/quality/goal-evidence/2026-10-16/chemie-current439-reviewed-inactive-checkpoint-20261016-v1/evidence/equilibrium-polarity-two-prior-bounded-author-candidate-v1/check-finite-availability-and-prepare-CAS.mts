// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const R='/home/enpasos/projects/skillpilot',T=R+'/tmp/chemie-m7-resumed-20261016',
 L=T+'/chemie-shared640-recycling-native-author-capsule-L6-v1',
 O=T+'/equilibrium-polarity-two-prior-bounded-author-candidate-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(b:any)=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
const pin=(p:string)=>({path:p.slice(R.length+1),sha256:sha(fs.readFileSync(p)),bytes:fs.statSync(p).size});
function sorted(x:any):any{return Array.isArray(x)?x.map(sorted):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])):x;}
const fp=(x:any)=>sha(JSON.stringify(sorted(x)));
const out=(n:string,x:any)=>fs.writeFileSync(O+'/'+n,JSON.stringify(x,null,2)+'\n',{flag:'wx'});
const firstPath=O+'/FIRST.two-actual-whole-prerequisite-necessity.AUTHOR.science.frozen.json',science=read(firstPath);
const canonicalPath=L+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const can=read(canonicalPath),beforeBy=new Map<string,any>(can.goals.map((g:any)=>[g.id,g]));
assert.equal(pin(canonicalPath).sha256,'sha256:d389cd002b082874845802d4bd9272890050864fe52f5d838388afe9ae581a3d');
const input=read(O+'/INPUT.two-whole-goals-current-priors-and-whole-P439-records.json');
const alternatives=read(O+'/INPUT.whole-existing-foundation-alternatives-and-whole-P439.json');
for(const g of [...input.wholeGoals,...alternatives.wholeGoals])assert.deepEqual(beforeBy.get(g.id),g);
const afterBy=new Map(beforeBy),ops:any[]=[];
for(const f of science.findings){
 const before=beforeBy.get(f.goalId),after={...before,requires:f.proposedRequires};
 assert.deepEqual({...after,requires:before.requires},before);
 afterBy.set(f.goalId,after);
 ops.push({operation:'replaceWholeGoal',goalId:f.goalId,
   beforeWholeFingerprint:fp(before),afterWholeFingerprint:fp(after),before,after,
   changedFields:['requires'],scienceFIRST:pin(firstPath)});
}
const {collectCompositionProjectionRoleGoalIds}=await import(L+'/app/src/utils/authoring/compositionViewAuthoring.ts');
const {goalMatchesFilters}=await import(L+'/app/src/utils/goalFilters.ts');
const viewDir=L+'/curricula/DE/Gymnasium/composition-views/chemie';
const files=fs.readdirSync(viewDir).filter(n=>n.endsWith('.json')).sort();assert.equal(files.length,39);
const availability:any[]=[],allViews:any[]=[];
for(const n of files){const p=viewDir+'/'+n,v=read(p),r=collectCompositionProjectionRoleGoalIds(v.rootNodes,beforeBy),
 target=new Set([...r.targetGoalIds].filter(i=>goalMatchesFilters(beforeBy.get(i),v.scope.courseProfile))),
 support=new Set([...r.prerequisiteOnlyGoalIds].filter(i=>goalMatchesFilters(beforeBy.get(i),v.scope.courseProfile))),
 role=(i:string)=>target.has(i)?'target':support.has(i)?'prerequisiteOnly':'missing';
 allViews.push({view:pin(p),viewId:v.viewId,scope:v.scope});
 for(const op of ops){const ownRole=role(op.goalId);if(ownRole==='missing')continue;
  availability.push({view:pin(p),viewId:v.viewId,scope:v.scope,goalId:op.goalId,actualGoalRole:ownRole,
    directPriorsBefore:op.before.requires.map((i:string)=>({goalId:i,role:role(i)})),
    directPriorsAfter:op.after.requires.map((i:string)=>({goalId:i,role:role(i),canonicalApplicability:beforeBy.get(i)?.applicability??null})),
    afterMissingDirectPriors:op.after.requires.filter((i:string)=>role(i)==='missing')});
 }}
function cycle(edges:'requires'|'contains', map:Map<string,any>){const seen=new Set<string>(),active=new Set<string>(),errors:any[]=[];function visit(i:string,stack:string[]){if(active.has(i)){errors.push([...stack,i]);return;}if(seen.has(i))return;seen.add(i);active.add(i);for(const q of map.get(i)?.[edges]??[]){if(!map.has(q)){errors.push({unknown:q,from:i});continue;}visit(q,[...stack,i]);}active.delete(i);}for(const i of map.keys())visit(i,[]);return errors;}
const dag={requiresBefore:cycle('requires',beforeBy),requiresAfter:cycle('requires',afterBy),containsAfter:cycle('contains',afterBy)};
assert(Object.values(dag).every(x=>x.length===0));
const summary={actualViewsInspected:39,goalContextCounts:ops.map(op=>({goalId:op.goalId,allPresentContexts:availability.filter(x=>x.goalId===op.goalId).length,targetContexts:availability.filter(x=>x.goalId===op.goalId&&x.actualGoalRole==='target').length,supportContexts:availability.filter(x=>x.goalId===op.goalId&&x.actualGoalRole==='prerequisiteOnly').length})),
 missingAfterContexts:availability.filter(x=>x.afterMissingDirectPriors.length),DAGerrors:0,
 canonicalWrites:0,viewWrites:0,fullAPV:0,central:0,independentVotes:0};
out('CHECK.actual-finite-two-goal-view-course-availability-and-DAG.AUTHOR.json',{
 role:'Actual role/course inspection for only two selected goal interfaces across39 current views; not a broad route audit or full compiler',
 canonical:pin(canonicalPath),scienceFIRST:pin(firstPath),allViewPins:allViews,availability,dag,summary,
 retainedSealedBBBEProposalNotAppliedHere:true,
 interpretation:'Report all actual target/support contexts. Missing new direct prior roles are HOLDs and are not suppressed or repaired by this checker.'});
out('CAS.two-whole-goals.requires-only.AUTHOR.inactive.json',{
 role:'Inactive AUTHOR two-whole canonical goal candidate; independent followups required',
 currentCanonical:pin(canonicalPath),historicalScienceCanonical:science.canonical,
 inputDrift:'Root applied jurisdiction-only641metadata sync after science input selection. All selected scientific wholes are verified exact. Whole guards, not replacement of a full snapshot, bind the proposal.',
 fingerprintRule:'sha256 of UTF8 JSON, object keys recursively sorted, arrays exact, compact serialization',
 operations:ops,selectedCurrentPRecordsRetained:input.wholePRecords.filter((p:any)=>ops.some(op=>op.goalId===p.goalId)),
 changedDescriptionsProfilesImages:0,sourceCoverageChanges:0,applied:false,newIndependentVotes:0,HumanApproval:false,M7Claim:false});
const semPath=L+'/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json',sem=read(semPath);
const {fingerprintSemanticKindSourceGoal}=await import(L+'/app/scripts/goalBookModel.ts');
const semOps=ops.map(op=>{const before=sem.decisions.find((d:any)=>d.goalId===op.goalId);assert(before);
 assert.equal(fingerprintSemanticKindSourceGoal(op.before),before.sourceFingerprint);
 const after={...before,sourceFingerprint:fingerprintSemanticKindSourceGoal(op.after)};
 return{operation:'replaceWholeSemanticKindDecision',goalId:op.goalId,beforeWholeFingerprint:fp(before),afterWholeFingerprint:fp(after),before,after,
   changedFields:['sourceFingerprint'],semanticKindAndDecisionBodiesOtherwiseExact:true};});
out('CAS.two-whole-SEM-decisions.source-binding-only.AUTHOR.inactive.json',{
 role:'Inactive technical binding proposal only; retain existing classification and history, no new science vote',
 sourceLedger:pin(semPath),canonical:pin(canonicalPath),sourceFunction:pin(L+'/app/scripts/goalBookModel.ts'),
 operations:semOps,allOther639DecisionsExact:true,ledgerCountsUnchanged:true,applied:false,HumanApproval:false,M7Claim:false});
console.log(JSON.stringify(summary));
