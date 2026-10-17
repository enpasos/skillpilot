import{readFileSync,writeFileSync}from'node:fs';
import{createHash}from'node:crypto';
import{pathToFileURL}from'node:url';
const O='/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-closure-source-surrogate-neutral-preparation-technical-v1';
const K='/mnt/e/skillpilot-chemie-L7-20261017/current439-remediation14-guarded-root-integration-technical-v1/capsule';
const load=p=>JSON.parse(readFileSync(p,'utf8'));const pin=p=>({path:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex'),bytes:readFileSync(p).length});
const roleP=K+'/app/src/utils/authoring/compositionViewAuthoring.ts',filterP=K+'/app/src/utils/goalFilters.ts';const before=[pin(roleP),pin(filterP)];
const{collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(roleP).href);const{goalMatchesFilters}=await import(pathToFileURL(filterP).href);
const C=load(O+'/science/C650.whole-current-authored-goal-content.json');const by=new Map(C.goals.map(g=>[g.id,g]));const data=load(O+'/science/CONTEXT39.whole-current-view-definitions-and-existing-rendered-membership.json');
const contexts=[];
for(const d of data.contexts){const v=d.wholeView;const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);contexts.push({logicalPath:d.logicalPath,viewId:v.viewId,scope:v.scope,targetGoalIdsBeforeCourseFilter:[...roles.targetGoalIds].sort(),targetGoalIdsAfterStockCourseFilter:[...roles.targetGoalIds].filter(id=>goalMatchesFilters(by.get(id),v.scope?.courseProfile)).sort(),prerequisiteOnlyGoalIds:[...roles.prerequisiteOnlyGoalIds].sort()});}
const original=load('/mnt/e/skillpilot-chemie-L7-20261017/current439-main-portable-integration-plan-technical-v1/lower-layer-diagnosis-readonly-v1/RAW.actual-current-Chemistry-applicability-and-39-rendered-views.json');
const byIds=original.report.goals.filter(g=>g.compiledApplicability.jurisdiction?.includes('DE-BY')).map(g=>g.goalId);
const proposedBY=['GK','LK'].map(course=>({jurisdiction:'DE-BY',stage:'CrossStage',courseProfile:course,targetGoalIds:byIds.filter(id=>goalMatchesFilters(by.get(id),course)).sort(),activated:false,meaning:'Existing full compiled fallback; technical course label only. Separate BcP course optionality and selected-project obligations remain in actual source metadata; no universal official Chemistry GK/LK duty.'}));
const output={role:'Pure existing stock role specificity and course-filter extraction, not compiler/status/gate or scientific review',contexts,currentGoalCourseMatches:C.goals.map(g=>({goalId:g.id,GK:goalMatchesFilters(g,'GK'),LK:goalMatchesFilters(g,'LK')})),proposedBY,sourceGuards:before,sourceGuardsUnchanged:before.every(g=>pin(g.path).sha256===g.sha256)};if(!output.sourceGuardsUnchanged)throw Error('Source changed');
const p=O+'/science/COURSES.actual39-stock-target-role-specificity-and-course-filters-plus-proposed-BY-fallback.json';writeFileSync(p,JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({pin:pin(p),contexts:contexts.length,compilerRuns:0}));
