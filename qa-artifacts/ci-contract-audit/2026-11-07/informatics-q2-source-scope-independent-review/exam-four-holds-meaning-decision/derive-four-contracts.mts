import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {protectedAssessmentMeaning,stableCoverageJson,resolveRetainedCoverage} from '/dev/shm/informatics-q2-source-scope-v3-20261107/ci/app/scripts/lib/retainedAssessmentCoverage.ts';
const R='/home/enpasos/projects/skillpilot',Q=R+'/qa-artifacts/ci-contract-audit/2026-11-07',P=Q+'/informatics-q2-source-scope-independent-review',O=P+'/exam-four-holds-meaning-decision';
const sha=(b:any)=>createHash('sha256').update(b).digest('hex'),read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const historyArchive=P+'/coverage-contract-followup/historical-informatics-source.json.gz',rawOld=gunzipSync(readFileSync(historyArchive));
const currentPath='/dev/shm/informatics-q2-source-scope-v3-20261107/candidate/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json',rawNew=readFileSync(currentPath);
const materialPath=Q+'/informatics-q2-material-review-corrections/native-examData.json';
assert.equal(sha(rawOld),'85411185514af4b2ecf818807f3bd6fe5df17fb5011c5ebf8c4996de1a47817e');
assert.equal(sha(rawNew),'c824e0b360470ef67ae4deb560146c7e677ad9601446b26cd5a46097c426e53b');
assert.equal(sha(readFileSync(materialPath)),'cb82c27a5cf0a53d7d946475dfd4f2ceae8e1065348580f97b7f0f9202871c92');
const old=JSON.parse(rawOld.toString()),current=JSON.parse(rawNew.toString()),material=read(materialPath),cases=read(Q+'/informatics-q2-material-review-corrections/casebank.json'),assemblies=read(Q+'/informatics-q2-material-review-corrections/exam-assemblies.json');
const ids=['0df1bedd-5fda-5b3b-a959-c9610237bb3e','269a561b-f12e-57b2-9b05-e20f58c9dcf6','ca2ff162-c71f-500f-8ce7-321ab2cf3f1f','6ebc2a67-ea20-5c4e-8a63-635f40438d6a'];
const evidencePaths=[historyArchive,P+'/coverage-contract-followup/history-inventory.json',P+'/coverage-gate-source-pins.json',P+'/source-v3-independent-review/README.md',P+'/source-v3-independent-review/independent-source-probe.json',materialPath,Q+'/informatics-q2-material-corrections-independent-recheck/README.md',Q+'/informatics-q2-material-corrections-independent-recheck/verdict.json',Q+'/informatics-q2-material-corrections-independent-recheck/recheck-seal.json',Q+'/informatics-q2-material-review-corrections/casebank.json',Q+'/informatics-q2-material-review-corrections/exam-assemblies.json',R+'/docs/concept/skill-graph/graph-definition.md',R+'/docs/concept/skill-graph/assessment-gated-completion.md',R+'/docs/qa-ci/skill-graph-ci-rule-corpus-2026-11-06.md'];
const pins=evidencePaths.map(path=>({path:path.startsWith(R+'/')?path.slice(R.length+1):path,sha256:sha(readFileSync(path))}));
const rows=ids.map((id,index)=>{
 const before=old.goals.find((g:any)=>g.id===id),after=current.goals.find((g:any)=>g.id===id),e=after.examData,a=assemblies[id];
 assert.deepEqual(e,material[id]);assert.deepEqual(e.coveredGoalIds,a.coverage);
 const resolved=resolveRetainedCoverage(current,e.coveredGoalIds);assert.deepEqual(resolved.issues,[]);
 const oldResolved=before?resolveRetainedCoverage(old,before.examData.coveredGoalIds):undefined;
 if(before)assert.deepEqual(oldResolved!.atoms,resolved.atoms);
 const caseIDs=a.taskIds,caseList=caseIDs.map((c:string)=>cases[c]);
 assert.equal(caseList.length,[41,23,23,20][index]);
 assert.deepEqual(caseList.map((c:any)=>c.goalId),e.coveredGoalIds);
 const criteria=caseList.flatMap((c:any)=>c.essentialCriteria);
 assert.equal(criteria.length,e.scoring.steps.length);
 for(const c of caseList){assert(e.taskContent.includes(c.task));assert(e.solutionContent.includes(c.solution));assert(c.fullGoalDescription===current.goals.find((g:any)=>g.id===c.goalId).description);for(const [name,block]of Object.entries(c.materialBlocks))assert(e.taskContent.includes(block as string),name);}
 for(const c of criteria){const step=e.scoring.steps.find((s:any)=>s.id===c.id);assert(step&&step.points===c.points&&step.description.includes(c.description));}
 assert.equal(e.scoring.maxPoints,criteria.length);assert.equal(e.scoring.passingPoints,e.scoring.maxPoints);assert(criteria.every((c:any)=>c.points===1));
 const oldMax=before?.examData.scoring.maxPoints,oldPass=before?.examData.scoring.passingPoints;
 if(before){assert.equal(oldMax,20);assert.equal(oldPass,12);assert.equal(before.examData.scoring.steps.length,4);}
 const omitOldStep=before?.examData.scoring.steps.map((s:any)=>({omittedStep:s.id,description:s.description,remainingMaximum:oldMax-s.points,passes:oldMax-s.points>=oldPass}));
 if(before)assert(omitOldStep.every((s:any)=>s.passes));
 const omitNewCriterion=criteria.map((c:any)=>({criterion:c.id,maximumWithoutCriterion:e.scoring.maxPoints-c.points,passes:false}));
 assert(omitNewCriterion.every((c:any)=>c.maximumWithoutCriterion<e.scoring.passingPoints));
 const selectedCases=caseList.filter((c:any)=>c.id==='T28'||c.id==='T15'||(index===3&&['T17','T18','T19','T20'].includes(c.id)));
 const prefix=['C','B','F'][index];
 if(before){assert(!/Hierarch|Parallel|Zustandsautomat|Zustandsdiagramm/i.test(before.examData.taskContent+' '+before.examData.solutionContent));assert(criteria.some((c:any)=>c.id===prefix+'-T28-C1'));}
 return {goalId:id,title:after.title,decision:before?'NEW_RESULT_IDENTITY_REQUIRED; do not install same-declared-contract-repair or exact-equivalence for854-to-cb82':'ELIGIBLE_EXACT_FIRST_DEFINITION_BINDING; no existing result transfer',historicalDeclaredAtoms:oldResolved?.atoms??null,currentDeclaredAtoms:resolved.atoms,declaredAtomsUnchanged:before?true:null,historyGoalObject:before??null,sourceBeforeSha256:sha(rawOld),sourceAfterSha256:sha(rawNew),historyGoalObjectSha256:before?sha(JSON.stringify(before)):null,currentGoalObjectSha256:sha(JSON.stringify(after)),historyExamDataSha256:before?sha(JSON.stringify(before.examData)):null,currentExamDataSha256:sha(JSON.stringify(e)),oldProtectedMeaningSha256:before?sha(stableCoverageJson(protectedAssessmentMeaning(before,true))):null,newProtectedMeaningSha256:sha(stableCoverageJson(protectedAssessmentMeaning(after,true))),oldPassRule:before?{maxPoints:oldMax,passingPoints:oldPass,steps:before.examData.scoring.steps}:null,currentPassRule:{maxPoints:e.scoring.maxPoints,passingPoints:e.scoring.passingPoints,steps:e.scoring.steps},currentTaskIds:caseIDs,omittedHistoricalWholeStepArithmetic:omitOldStep??null,omittedNewEssentialCriteriaArithmetic:omitNewCriterion,concreteNewPerformanceWitnesses:selectedCases,newFullNativeTaskAndSolutionBindToCasebank:true,historyPresence:!!before,qualificationLimits:before?['Historical declaration is known; its material-supported full recognition claim is not proved. This is not an ABSENT coverage contract.','Arithmetic describes admitted rubric totals, not an observed learner attempt. Missing historical material is not invented.','The same essential875 performance was already named in coverage but not established by the historical task/rubric. New reliable proof must not be attributed to the old key.']:['Previously private first definition; no historical task equivalence assertion.','All20 meanings and40 current essential criteria are exactly pinned; existing material/source reviews remain separately scoped.','No new mastery is written, no old assessment or ordinary goal result is aliased.'],evidenceReferences:pins};
});
writeFileSync(O+'/four-contract-evidence.json',JSON.stringify({status:'independent finite semantic decision; no source/code/runtime/binding activation',rows,norm:'Main U09/U11 stable meaning and attributable history suffice. PR83 per-Q/all-variant refinements are not claimed implemented or universally proved.',previousContractCorrection:'The abstract same-declared-contract-repair possibility in the sealed earlier followup does not authorize these actual854-to-cb82 replacements. The concrete historical rubric comparison now rejects these three same-ID bindings.'},null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({id:r.goalId,old:r.oldPassRule?`${r.oldPassRule.passingPoints}/${r.oldPassRule.maxPoints}`:'ABSENT_ID',current:`${r.currentPassRule.passingPoints}/${r.currentPassRule.maxPoints}`,decision:r.decision}))));
