import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { evaluateCurrentVisualizationGate, hasCompleteCurrentVisualizationScope, hasMatchingVisualizationContextManifest } from '/home/enpasos/projects/skillpilot/app/scripts/lib/curriculumVisualizationValidation.ts'
import { deriveCurriculumMaturity, discoverCurriculumAssessmentScope, evaluateCurriculumExamReadiness, evaluateDeepUnderstandingQa, evaluateGraphIntegrity, evaluateExamTaskReadiness, routeProfiles } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
import { collectCurriculumMaturityFloorFailures } from '/home/enpasos/projects/skillpilot/app/scripts/checkCurriculumMaturityFloors.ts'
import { deepUnderstandingCompletionCheckIds } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
const root='/home/enpasos/projects/skillpilot';
const sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const ledgerPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json';
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const read=(p:string)=>readFileSync(root+'/'+p);
const freeze=JSON.parse(readFileSync('/dev/shm/visualization-fixed54-production-freeze.json','utf8'));
const source=JSON.parse(read(sourcePath).toString()), ledger=JSON.parse(read(ledgerPath).toString());
const goal=source.goals.find((g:any)=>g.id==='922d89fc-1cbd-56e9-ac5d-5cb59085de6c');
const row=ledger.records.find((r:any)=>r.goalId===goal.id);
const before=new Map([...freeze.map((p:any)=>[p.path,p.sha256]),[sourcePath,sha(read(sourcePath))],[ledgerPath,sha(read(ledgerPath))],[row.publicAssetPath,sha(read(row.publicAssetPath))],[row.canonicalAssetPath,sha(read(row.canonicalAssetPath))]]);
for(const [p,h] of before)assert.equal(sha(read(p as string)),h);
const native=(defs:any[]=[goal],records:any[]=[row],discoveryIssues:string[]=[])=>evaluateCurrentVisualizationGate({repositoryRoot:root,landscapeId:source.landscapeId,landscapePath:sourcePath,subject:'mathematik',goalById:new Map(defs.map(g=>[g.id,g])),currentGoalIds:new Set(defs.map(g=>g.id)),records,discoveryIssues});
const current=native();assert.ok(hasCompleteCurrentVisualizationScope(current),JSON.stringify(current));
const exam=source.goals.find((g:any)=>g.examData&&evaluateExamTaskReadiness([g]).status==='pass');
const clusterIds=[...new Set(routeProfiles.filter(p=>p.landscapeId===source.landscapeId).flatMap(p=>[...p.terminalAutonomyClusterIds,...Object.values(p.terminalAutonomyClusterIdsByDurationModel??{}).flat()]))];
const fixture={...source,goals:[{...goal,weight:1,contains:[],requires:[]},{...exam,weight:1,contains:[],requires:[]},...clusterIds.map(id=>({...source.goals.find((g:any)=>g.id===id),weight:1,contains:[exam.id],requires:[]}))]};
const graph=evaluateGraphIntegrity(fixture,[fixture]);assert.equal(graph.status,'pass');
const assessment=discoverCurriculumAssessmentScope(fixture,[]), assessmentRules=evaluateCurriculumExamReadiness(fixture,[],[fixture],assessment);assert.ok(assessmentRules.every(r=>r.status==='pass'));
const subject:any={subject:'mathematik',label:'Independent one-goal V consumer fixture',landscapeId:source.landscapeId,landscapePath:sourcePath,currentGoalIds:[goal.id],denominator:1,strictComplete:1,remaining:0,percentage:'100.0%',strictCompleteGoalIds:[goal.id],deferredVisualizationGoalIds:[],gates:{currentDescriptionResolutions:1,currentPositiveEvidenceProfiles:1,currentSemanticAtomicityDecisions:1,currentMemoryReviewDecisions:1,currentVisualizationQaRecords:1},requiredChecks:deepUnderstandingCompletionCheckIds.map(id=>({id,status:'pass'})),issues:[],visualizationValidation:structuredClone(current),strictCompletionReady:true};
const report:any={schemaVersion:1,reportId:'independent-actual-V-input-fixture',subjects:[subject],blockingIssueCount:0};
const passRule=evaluateDeepUnderstandingQa(fixture,sourcePath,report,current);assert.equal(passRule.status,'pass');
const rules:any[]=[graph,...assessmentRules,...['CQR-000','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302'].map(id=>({id,status:'pass',summary:'Isolated other requirement, no real D/P/M/A claim'})),passRule];
const scopes:any[]=[{scopeId:'fixture',label:'Fixture',maturity:'M4',selectedAtomicGoals:1,rules:[{id:'CQR-101',status:'pass',summary:'Fixture'}]}];
const artifact={curricula:[{landscapeId:source.landscapeId,frameworkId:source.frameworkId,subject:source.subject,maturity:'M7',rules,scopes}]};
const policy={schemaVersion:1,policyId:'independent-one-goal-consumer',baselineDate:'2026-08-20',exceptions:[],knownPreBaselineRegressions:[],floors:[{landscapeId:source.landscapeId,frameworkId:source.frameworkId,subject:source.subject,minimumMaturity:'M7',reason:'Independent V consumer boundary'}]};
const floor=(expect:any)=>collectCurriculumMaturityFloorFailures(artifact,policy,new Map([[source.landscapeId,assessment]]),expect?new Map([[source.landscapeId,expect]]):new Map());
assert.equal(deriveCurriculumMaturity(rules,scopes,source.landscapeId,assessment,current),'M7');assert.deepEqual(floor(current),[]);
const results:any[]=[{id:'V-CONSUMER-PEER-01',outcome:'pass',detail:'Actual original Math image/receipt through private capsule and native V; isolated valid graph/assessment gives CQR303 pass, M7 and direct-floor pass. Other D/P/A/M are explicit fixture inputs.'}];
const denies=(id:string,label:string,expected:any)=>{assert.equal(deriveCurriculumMaturity(rules,scopes,source.landscapeId,assessment,expected),'M6',label);const failures=floor(expected);assert.ok(failures.some(f=>f.includes('no complete passing visualization context report')),label);assert.ok(!failures.some(f=>f.includes('strict graph-integrity')||f.includes('assessment reports')),JSON.stringify(failures));results.push({id,outcome:'pass',detail:label,floorFailures:failures,issues:expected?.issues??[]});};
// This change is intentionally outside V content semantics: the old report must still bind the actual current input snapshot.
const changedWeight=native([{...goal,weight:goal.weight+1}]);assert.ok(hasCompleteCurrentVisualizationScope(changedWeight));assert.notEqual(changedWeight.contextsSha256,current.contextsSha256);assert.equal(hasMatchingVisualizationContextManifest(subject.visualizationValidation,changedWeight),false);assert.equal(evaluateDeepUnderstandingQa(fixture,sourcePath,report,changedWeight).status,'fail');denies('V-CONSUMER-PEER-02','Stored pass cannot replay against changed current source context even while its independently checked V content remains ready.',changedWeight);
const changedEN=native([{...goal,descriptionEn:goal.descriptionEn+' Additional independently required performance.'}]);assert.deepEqual(changedEN.readyGoalIds,[]);assert.match(changedEN.issues.join(' '),/original actually reviewed context/);denies('V-CONSUMER-PEER-03','Actually bound English context change is not hidden by equal DE text/asset or cached original history.',changedEN);
const duplicate=native([goal],[row,{...row}]);assert.deepEqual(duplicate.readyGoalIds,[]);denies('V-CONSUMER-PEER-04','Duplicate current QA row blocks V and direct floor.',duplicate);
const discovered=native([goal],[row],['Independent probe: stale authoritative semantic-kind source binding']);assert.deepEqual(discovered.readyGoalIds,[goal.id]);assert.equal(hasCompleteCurrentVisualizationScope(discovered),false);denies('V-CONSUMER-PEER-05','A ready image cannot mask a current discovery/freshness failure.',discovered);
const unqualified=source.goals.find((g:any)=>g.id==='0c2ddfcd-6f4b-5990-93c7-8bbf8b04a160')??source.goals.find((g:any)=>g.id!==goal.id&&ledger.records.some((r:any)=>r.goalId===g.id)&&!['ce198bc9-b014-52ba-814f-25cc3e020668'].includes(g.id));
const otherRow=ledger.records.find((r:any)=>r.goalId===unqualified.id);assert.ok(otherRow);
const enlarged=native([goal,unqualified],[row,otherRow]);assert.equal(enlarged.currentGoalIds.length,2);assert.ok(enlarged.readyGoalIds.length<2);denies('V-CONSUMER-PEER-06','Current scope enlargement with an unqualified actual Goal cannot borrow the one-goal stored pass.',enlarged);
denies('V-CONSUMER-PEER-07','Missing independently read native expectation fails closed.',undefined);
denies('V-CONSUMER-PEER-08','A deserialized expectation copied from the stored pass is not a native capability.',structuredClone(current));
const recovered=native();assert.deepEqual(recovered,current);assert.deepEqual(floor(recovered),[]);results.push({id:'V-CONSUMER-PEER-09',outcome:'pass',detail:'Same-process fresh original inputs recover the real pass; current-context failures did not poison or bypass the private immutable original-history cache.'});
for(const [p,h] of before)assert.equal(sha(read(p as string)),h);
const output={kind:'independent-fixed54-native-v-consumer-peer-probe',executedAt:new Date().toISOString(),root,sourceSha256:before.get(sourcePath),ledgerSha256:before.get(ledgerPath),actualGoalId:goal.id,additionalCurrentGoalId:unqualified.id,frozenProductionInputs:freeze,guards:[...before].map(([path,sha256])=>({path,sha256})),results,passed:results.length,newContentReviewClaimed:false,fullCurriculumOrM7ApprovalClaimed:false};
writeFileSync('/dev/shm/v-consumer-independent-peer-20261107/result.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({passed:results.length,goalId:goal.id,additionalCurrentGoalId:unqualified.id,executedAt:output.executedAt}));
