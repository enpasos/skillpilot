import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { collectCompositionProjectionRoleGoalIds, normalizeCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
import { goalMatchesFilter } from '../../../../../../../app/src/utils/goalFilters';
const dossier = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-current-layer-a-inventory-projections-v1';
const testPath='backend/src/test/java/com/skillpilot/backend/controller/LearnerControllerIntegrationTest.java';
const testText=readFileSync(testPath,'utf8');
const fingerprint=(path:string)=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')});
const inputs:any[]=[fingerprint(testPath),fingerprint('app/src/utils/authoring/compositionViewAuthoring.ts'),fingerprint('app/src/utils/goalFilters.ts')];
const measured:any[]=[];
const subjects=[['Biologie','BIOLOGIE','biologie/de-de-gym-seki-biology.view.json'],['Chemie','CHEMIE','chemie/de-de-gym-seki-chemistry.view.json']];
for(const [subject,name,viewTail] of subjects){
 const canonPath=`curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_${name}.de.json`;
 const viewPath=`curricula/DE/Gymnasium/composition-views/${viewTail}`;
 inputs.push(fingerprint(canonPath),fingerprint(viewPath));
 const raw=JSON.parse(readFileSync(canonPath,'utf8'));
 const view=normalizeCompositionView(JSON.parse(readFileSync(viewPath,'utf8')));
 const byId=new Map<string,any>(raw.goals.map((g:any)=>[g.id,g]));
 const {targetGoalIds,prerequisiteOnlyGoalIds}=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId);
 // Counterfactual removes exactly the added B010 subtree. Canonical data remain current.
 const priorView=structuredClone(view); const strip=(nodes:any[]):any[]=>nodes.filter(n=>n.goalId!=='bf001d50-ad32-5de8-885d-bd09174a0f5e').map(n=>n.kind==='structure'?{...n,children:strip(n.children)}:n);
 priorView.rootNodes=strip(priorView.rootNodes);
 const priorTargets=collectCompositionProjectionRoleGoalIds(priorView.rootNodes,byId).targetGoalIds;
 const rows=[...testText.matchAll(new RegExp(`\\{ "${subject}", CANONICAL_[A-Z]+_ID, "(DE-[A-Z]+)", "(\\d+)", "(\\d+)" \\}`,'g'))];
 for(const row of rows){for(const duration of ['G8','G9']){
  const ids=(set:Set<string>)=>[...set].filter(id=>{const goal=byId.get(id);if(!goal)throw new Error(`Unknown ${id}`);const type=goal.type||((goal.contains?.length??0)>0?'cluster':'atomic');return type!=='cluster'&&goalMatchesFilter(goal,row[1])&&goalMatchesFilter(goal,duration)&&goalMatchesFilter(goal,'GK');}).sort();
  const current=ids(targetGoalIds), prior=ids(priorTargets); const expected=Number(duration==='G8'?row[2]:row[3]);
  measured.push({subject,landscapeId:raw.landscapeId,jurisdiction:row[1],durationModel:duration,courseProfile:'GK',stage:'SekI',javaExpected:expected,nativeCurrentTargetAtomicTotal:current.length,differenceFromCurrentJavaExpected:current.length-expected,currentTargetIds:current,priorViewCounterfactualAtomicTotal:prior.length,priorViewCounterfactualMatchesJavaExpected:prior.length===expected,addedTargetGoalIds:current.filter(id=>!prior.includes(id)),removedTargetGoalIds:prior.filter(id=>!current.includes(id)),prerequisiteOnlyCount:prerequisiteOnlyGoalIds.size});
 }}
}
const result={status:'Native app pure-data projection measurement; no backend API/test run',atUTC:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),inputs,measurementUses:'Unmodified existing composition role collector and jurisdiction/duration/course goal filters; explicit learner-facing target atomic totals, including orientation and local assessment goals',backendTestsRun:false,runtimeCodeChanged:false,rows:measured};
writeFileSync(`${dossier}/projection-targets.native.actual.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,rows:measured.map(({currentTargetIds,...r})=>r)},null,2));
