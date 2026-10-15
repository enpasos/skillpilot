import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const R=process.cwd();
const T='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1';
const stock=await import(resolve(R,'app/scripts/goalBookModel.ts'));
const positive=await import(resolve(R,'app/scripts/positiveGoalEvidenceProfileModel.ts'));
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'));
const sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(R,p))).digest('hex');
const land=read(T+'/candidate/canonical533.current407.corrected-P8-resources.inactive.json');
const sem=read(T+'/candidate/semantic533.current407.corrected-P8.inactive.json');
const model=read(T+'/models/whole407.corrected-P8.stock-book-model.inactive.json');
const semanticChecks=sem.decisions.map((d:any)=>{
 const g=land.goals.find((g:any)=>g.id===d.goalId);
 const measured=stock.fingerprintSemanticKindSourceGoal(g);
 if(measured!==d.sourceFingerprint)throw Error('Current semantic source mismatch '+d.goalId);
 return {goalId:d.goalId,sourceFingerprint:measured,semanticKind:d.semanticKind};
});
const pfiles=['five-current407.exact-retained.ai-candidate.needs-human-review.jsonl','child2.current407.ai-candidate.needs-human-review.jsonl','synthesis1.current407.ai-candidate.needs-human-review.jsonl'];
const records=pfiles.flatMap(f=>readFileSync(resolve(R,T+'/positive/'+f),'utf8').trim().split('\n').map(JSON.parse));
if(records.length!==8||new Set(records.map((r:any)=>r.goalId)).size!==8)throw Error('Expected exactly eight current records');
const criteria='curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-positive-understanding-evidence-profile-criteria-v1.md';
const measured=records.map((record:any)=>{
 const goal=land.goals.find((g:any)=>g.id===record.goalId);
 const semanticKind=sem.decisions.find((d:any)=>d.goalId===record.goalId).semanticKind;
 const resources:Object={};
 for(const link of goal.resourceLinks??[])if(link.type==='goal-visualization')resources[link.url]=sha('app/public'+link.url);
 const goalFingerprint=positive.fingerprintGoalForPositiveEvidence(goal,semanticKind);
 const profileFingerprint=positive.fingerprintPositiveGoalEvidenceProfile(record.profile);
 const reviewInputFingerprint=positive.fingerprintPositiveGoalEvidenceReviewInput(goal,sha(criteria),resources,semanticKind);
 const errors=positive.validatePositiveGoalEvidenceRecordSemantics(record,goal,resources,semanticKind);
 if(record.goalFingerprint!==goalFingerprint||record.profileFingerprint!==profileFingerprint||record.reviewInputFingerprint!==reviewInputFingerprint||errors.length)throw Error('Current P mismatch '+record.goalId+' '+JSON.stringify(errors));
 const page=model.pages.find((p:any)=>p.goalId===record.goalId);
 if(page.goalFingerprint!==goalFingerprint||page.evidenceReview.profileFingerprint!==profileFingerprint||page.evidenceReview.reviewInputFingerprint!==reviewInputFingerprint)throw Error('Full model binding mismatch '+record.goalId);
 if(record.status!=='needs_human_review'||record.reviewAuthority!=='ai_candidate')throw Error('False human or final status '+record.goalId);
 return {goalId:record.goalId,goalFingerprint,profileFingerprint,reviewInputFingerprint,resources,evidenceLevel:record.evidenceLevel,maximumClaimScope:record.maximumClaimScope,status:record.status,reviewAuthority:record.reviewAuthority,errors};
});
const oldP5=records.slice(0,5);
const oldroot='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-current406-final-resource-P7-native8-technical-author-20261013-v1';
const oldrecords=['three-current406.ai-candidate.needs-human-review.jsonl','four-current406.exact-retained.ai-candidate.needs-human-review.jsonl'].flatMap(f=>readFileSync(resolve(R,oldroot+'/positive/'+f),'utf8').trim().split('\n').map(JSON.parse));
for(const current of oldP5)if(JSON.stringify(current)!==JSON.stringify(oldrecords.find((r:any)=>r.goalId===current.goalId)))throw Error('Retained P5 whole record changed '+current.goalId);
const result={schemaVersion:1,stockModuleBindings:['app/scripts/goalBookModel.ts','app/scripts/positiveGoalEvidenceProfileModel.ts'].map(p=>({path:p,sha256:sha(p)})),
 whole533SemanticFingerprintsCurrent:true,semanticChecks,currentP8:measured,fiveRetainedWholeRecordObjectsExact:true,
 twoChildEvidenceClaimLevelsTruthfullyE0G0:measured.filter((x:any)=>['a96e9b3d-a02d-54f8-a3d3-318e0ea5180c','6413429b-53d8-5ad1-9af6-d0e562cbf0f5'].includes(x.goalId)).every((x:any)=>x.evidenceLevel==='E0'&&x.maximumClaimScope==='G0'),
 wholeModelPages:model.pages.length,fullModelDigest:model.digest,newScientificVotes:false,newDCompletions:0,humanApproval:false,activeWrites:false};
writeFileSync(resolve(R,T+'/checks/current-P8-and-whole533-semantic-bindings.stock.actual.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({currentP8:measured.length,wholeSemanticCount:semanticChecks.length,fullModelPages:model.pages.length,retainedWholeP5Exact:true,newDCompletions:0}));
