// SPDX-License-Identifier: Apache-2.0
// Read-only native probe. The candidate run uses a read-only single-file mount;
// all production functions and all source/view inputs otherwise stay unchanged.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {checkSkillGraphIntegrity} from '../../../app/scripts/lib/skillGraphIntegrity.ts';
import {buildApplicabilityCompilation} from '../../../app/scripts/applicabilityCompiler.ts';
import {evaluateExamTaskReadiness} from '../../../app/scripts/generateCurriculumQualityStatus.ts';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from '../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import {goalMatchesFilters} from '../../../app/src/utils/goalFilters.ts';
const H=(v:unknown)=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const R=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));const root='curricula/DE/Gymnasium/canonical/';
const catalog=fs.readdirSync(root).filter(p=>p.endsWith('.json')).sort().map(p=>({...R(root+p),sourceFile:root+p}));
const owner='7d51b38c-a149-5407-bddc-d2ce7878b020',terminal='49ba66cf-accd-5938-a63e-f031bc786767';
const source=catalog.find(d=>d.landscapeId===owner)!;const goals=new Map<string,any>(source.goals.map((g:any)=>[g.id,g]));
const strict=checkSkillGraphIntegrity(catalog,[owner]);const compilation=buildApplicabilityCompilation();const report=compilation.reports.find(r=>r.landscapeId===owner)!;
const compiledGoals=new Map<string,any>(source.goals.map((g:any)=>[g.id,{...g,applicability:report.goals.find(r=>r.goalId===g.id)?.compiledApplicability??g.applicability}]));
const viewsRoot='curricula/DE/Gymnasium/composition-views/informatik/';const scopes=[];
for(const filename of fs.readdirSync(viewsRoot).filter(p=>p.endsWith('.json')).sort()){
 const path=viewsRoot+filename,raw=fs.readFileSync(path,'utf8');const view=normalizeCompositionView(JSON.parse(raw));
 const profiles=view.scope.courseProfile?[view.scope.courseProfile]:view.scope.stage==='SekI'?[null]:['GK','LK'];
 for(const profile of profiles){
  const v=structuredClone(view);if(profile)v.scope.courseProfile=profile;
  const filters=[v.scope.jurisdiction,profile,v.scope.durationModel].filter(Boolean) as string[];
  const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals);const compiledRoles=collectCompositionProjectionRoleGoalIds(v.rootNodes,compiledGoals);
  const set=(ids:Set<string>,map:Map<string,any>)=>[...ids].filter(id=>goalMatchesFilters(map.get(id),filters)).sort();
  const compiledSource={...source,goals:[...compiledGoals.values()]};const tree=compileCompositionView(v,compiledSource,compiledSource);
  scopes.push({viewPath:path,viewSha256:H(raw),viewId:v.viewId,scope:v.scope,filters,rawTargets:set(roles.targetGoalIds,goals),rawSupport:set(roles.prerequisiteOnlyGoalIds,goals),compiledTargets:set(compiledRoles.targetGoalIds,compiledGoals),compiledSupport:set(compiledRoles.prerequisiteOnlyGoalIds,compiledGoals),compiledTreeSha256:H(tree.compiledRootNodes),compositionFindings:tree.findings});
 }
}
const rows=compilation.reports.flatMap(r=>r.goals.map(g=>({goalKey:r.landscapeId+':'+g.goalId,compiledApplicability:g.compiledApplicability}))).sort((a,b)=>a.goalKey.localeCompare(b.goalKey));
console.log(JSON.stringify({sourceSha256:H(fs.readFileSync(source.sourceFile,'utf8')),status:'native-read-only-hypothesis-not-application',strictChecks:strict.checks,strictFindings:strict.findings,eTerminalG17:strict.findings.filter(f=>f.ruleId==='G17'&&f.goalId===terminal),actualUnchangedTerminalReadiness:evaluateExamTaskReadiness([goals.get(terminal)]),globalCompiledApplicability:rows,globalApplicabilityFindings:compilation.reports.map(r=>({landscapeId:r.landscapeId,findings:r.findings})),infoApplicabilityEvidence:report.goals.map(g=>({goalId:g.goalId,evidence:g.evidence})),scopeCount:scopes.length,scopes},null,2));
