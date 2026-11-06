import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { normalizeCompositionView,collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import { goalMatchesFilters } from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts';
const base='/home/enpasos/projects/skillpilot/';
const pin=(p:string)=>createHash('sha256').update(fs.readFileSync(base+p)).digest('hex');
const r=JSON.parse(fs.readFileSync(base+'docs/dev/ci-graph-repairs/informatics-gk24-current-35-scope-input-2026-11-06.json','utf8'));
for(const b of r.codeBindings.filter((x:any)=>!x.path.endsWith('generateCurriculumQualityStatus.ts')))assert.equal(pin(b.path),b.sha256);
const sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json';
assert.equal(pin(sourcePath),'00bcdbaf0723441eea0e33dfef36c674ed865b61d7009705cd6c83241a897422');
const source=JSON.parse(fs.readFileSync(base+sourcePath,'utf8'));const goals=new Map(source.goals.map((g:any)=>[g.id,g]));const rows=[];
for(const row of r.rows){
 assert.equal(pin(row.viewPath),row.viewSha256);
 const v=normalizeCompositionView(JSON.parse(fs.readFileSync(base+row.viewPath,'utf8')));if(row.courseProfile)v.scope.courseProfile=row.courseProfile;
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals as any);const sorted=(ids:Set<string>)=>[...ids].filter(id=>goalMatchesFilters(goals.get(id) as any,row.filters)).sort();
 const targets=sorted(roles.targetGoalIds),support=sorted(roles.prerequisiteOnlyGoalIds);assert.deepEqual(targets,[...row.targetGoalIds].sort());assert.deepEqual(support,[...row.prerequisiteOnlyGoalIds].sort());
 const gk24=r.proposedGk24Coverage.every((id:string)=>targets.includes(id)); const lk25=r.fixed25Coverage.every((id:string)=>targets.includes(id));
 assert.equal(gk24,row.all24TargetsPresent);assert.equal(lk25,row.all25TargetsPresent);
 rows.push({viewId:row.viewId,courseProfile:row.courseProfile,targetCount:targets.length,supportCount:support.length,targetsAndSupportExactlyEqualHistoricalInput:true,all24TargetsPresent:gk24,all25TargetsPresent:lk25});
}
assert.equal(rows.length,35);assert.equal(rows.filter(r=>r.courseProfile==='GK'&&r.all24TargetsPresent).length,3);assert.equal(rows.filter(r=>r.courseProfile==='LK'&&r.all25TargetsPresent).length,3);
console.log(JSON.stringify({status:'actual-current35-scope-reference-check-pass-no-integration-candidate',sourceSha256:pin(sourcePath),existingRows:rows},null,2));
