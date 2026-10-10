import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {reviewPositiveGoalEvidenceConfig} from './positiveGoalEvidenceReview.ts';
import {fingerprintSemanticKindSourceGoal} from './goalBookModel.ts';
const O=process.argv[2],R=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const rd=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const f=rd(join(O,'actual-v17-final237c-SEM678-P336685-book-technical-only-freeze.json'));
const results:any[]=[],records=new Map<string,any>();let cases=0;
for(const path of f.newPconfigs){
 const r=reviewPositiveGoalEvidenceConfig(path);assert.deepEqual(r.errors,[],path+JSON.stringify(r.errors));
 const c=f.all43ConfigChanges.find((x:any)=>x.new.path===path);assert.ok(c);
 const bytes=readFileSync(join(R,c.reviewWholeBytesUnchanged.path));assert.equal(createHash('sha256').update(bytes).digest('hex'),c.reviewWholeBytesUnchanged.sha256);
 for(const d of r.records){assert(!records.has(d.goalId));records.set(d.goalId,d);cases+=d.profile.applicationCaseBriefs.length;assert.equal(d.status,'needs_human_review');assert.equal(d.reviewAuthority,'ai_candidate');}
 results.push({path,goals:r.records.length,counts:r.counts,errors:r.errors,actualOriginalReviewBytesExact:true});
}
assert.equal(results.length,43);assert.equal(records.size,336);assert.equal(cases,685);
const sem=rd(join(R,f.newSEM.path)),can=rd(join(R,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'));
assert.equal(sem.decisions.length,678);assert.equal(can.goals.length,678);
const goals=new Map(can.goals.map((g:any)=>[g.id,g]));
for(const d of sem.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(d.goalId)));
const agg=readFileSync(join(R,f.newWholeP336.path),'utf8').trim().split(/\r?\n/).map(x=>JSON.parse(x));
assert.equal(agg.length,336);for(const d of agg)assert.deepEqual(d,records.get(d.goalId));
assert.equal(results.reduce((s,x)=>s+x.counts.needsHumanReview,0),336);assert.equal(results.reduce((s,x)=>s+x.counts.approved,0),0);
writeFileSync(join(O,'actual-native43-configs-P336-final237c-SEM678-original-profiles-status-authority-FPs.v17-author-PASS.json'),JSON.stringify({status:'ACTUAL_NATIVE_TECHNICAL_PASS_ONLY',configs:results,actualRecords:336,actualOriginalCases:685,actualSEMGoals:678,all678OfficialSourceFingerprintsCurrent:true,all336OriginalRecordsAndAggregateExact:true,actualNeedsHumanReview:336,actualAIcandidateAuthority:336,actualApprovedRecords:0,actualProfileSchemaSemanticDensityGoalProfileAndInputFingerprintErrors:0,foreignWholeScience:f.foreignWholeScientificBindings,foreignCombined678ScopePending:f.foreignCombined678ScopePending,newScientificDecisions:0,strictNetGain:0,humanApproval:false,activeWrites:0},null,2)+'\n');
console.log(JSON.stringify({configs:43,positiveRecords:336,cases:685,SEM:678,errors:0,needsHumanReview:336,approved:0}));
