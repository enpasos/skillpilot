import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {auditTransitiveMinimality} from '/home/enpasos/projects/skillpilot/app/scripts/auditTransitiveMinimality.ts';
import {checkSkillGraphIntegrity} from '/home/enpasos/projects/skillpilot/app/scripts/lib/skillGraphIntegrity.ts';
import {prepareLandscapeEntries} from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts';
import {normalizeCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts';
import {normalizeCompositionView,collectCompositionProjectionRoleGoalIds,compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
import {goalMatchesFilters} from '/home/enpasos/projects/skillpilot/app/src/utils/goalFilters.ts';
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/math-g17-fifteen-jm976p3s';
const H=(x:string|Uint8Array)=>createHash('sha256').update(x).digest('hex'),read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const raw=fs.readFileSync(R+'/'+rel);assert.equal(H(raw),'e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06');
const source=JSON.parse(raw.toString()),owner=source.landscapeId,intro='71cec9fb-3751-4d61-8b34-c5adbbf6e5f2';
const catalog=fs.readdirSync(R+'/curricula/DE/Gymnasium/canonical').filter(f=>f.endsWith('.de.json')).sort().map(f=>({...read(R+'/curricula/DE/Gymnasium/canonical/'+f),sourceFile:'curricula/DE/Gymnasium/canonical/'+f}));
const originals=new Map(catalog.flatMap(d=>d.goals.map((g:any)=>[g.id,g])));assert.equal(originals.size,6524);assert.equal(catalog.length,21);
const prefixes=["304111dd-426b-520b-a275-3fa37da1b0e0", "4fb40e58-58c1-5964-b58e-3347a8022b97", "6ebdc8cc-3393-5eb3-aadb-107e4f6d12b8", "6f09c97e-779b-500b-8092-3fb9696aa5bb", "5e893892-393e-5df0-b705-fb3b3458122f", "3e974075-b2fd-43e6-88d9-5f596ad053ec", "5927ca6a-91d5-4541-84e9-833bbb2cd7df", "d711bc18-c27c-4739-8289-edac53dc8ba3", "f14e1643-ad8d-5235-a832-97987fa18489", "bbef7cf2-90fa-59fa-a115-8b651aab9231", "be0e8715-3c3a-5ffb-937a-0b6bce4f01d8", "69243680-c2c1-5661-80c0-c95a2be1dabf", "91e2f564-3bc8-4924-af85-2a3fa84c1471", "121ef4c5-c1c2-5294-9582-86bab2355907", "c72a8032-71f6-56ed-a896-06ae435ff2ec"];
const selected=prefixes.map(p=>{const m=source.goals.filter((g:any)=>g.id===p);assert.equal(m.length,1);assert(m[0].requires.includes(intro));return m[0].id;});
const baseline=auditTransitiveMinimality(catalog,[owner]);
const candidates=selected.map(id=>{const f=baseline.findings.find(f=>f.source===owner+':'+id&&f.prerequisite===owner+':'+intro);assert(f,id);return{id,goal:originals.get(id),originalAudit:f};});
const after=structuredClone(source);for(const g of after.goals)if(selected.includes(g.id))g.requires=g.requires.filter((x:string)=>x!==intro);
fs.writeFileSync(W+'/after.json',JSON.stringify(after,null,2)+'\n');
const afterCatalog=catalog.map(d=>d.landscapeId===owner?{...after,sourceFile:d.sourceFile}:d);
const afterAudit=auditTransitiveMinimality(afterCatalog,[owner]);
const entries=prepareLandscapeEntries(catalog),afterEntries=prepareLandscapeEntries(afterCatalog);
const beforeMap=new Map(entries.flatMap(e=>e.goals.map(g=>[g.id,g]))),afterMap=new Map(afterEntries.flatMap(e=>e.goals.map(g=>[g.id,g])));
const norm=(x:string)=>x.includes(':')?x.split(':')[1]:x;
function path(map:any,start:string,end:string,allowed?:Set<string>){
 const queue=[start],prev=new Map<string,string>(),seen=new Set(queue);
 for(let i=0;i<queue.length;i++)for(const r of map.get(queue[i]).effectiveRequires??[]){const t=norm(r);if(allowed&&!allowed.has(t))continue;if(seen.has(t))continue;seen.add(t);prev.set(t,queue[i]);queue.push(t);}
 if(!seen.has(end))return null;const out=[end];while(out[0]!==start)out.unshift(prev.get(out[0])!);return out;
}
for(const c of candidates){const p=path(afterMap,c.id,intro);assert(p);Object.assign(c,{afterJointRemovalPath:p,fullPathGoals:p.map(id=>originals.get(id))});}
const canon=new Map(catalog.map(d=>{const n=normalizeCanonicalLandscape(d);return[n.landscapeId,n]})),rootByOwner=new Map([...canon].map(([id,d]:any)=>[id,d.goals.find((g:any)=>g.tags?.includes('root'))?.id]));
const goals=new Map([...canon.values()].flatMap((d:any)=>d.goals.map((g:any)=>[g.id,g]))),universe:any={landscapeId:'catalog-context',title:'catalog-context',goals:[...goals.values()]};
const views=[];const missing:any[]=[];
console.log(JSON.stringify({phase:'joint-removal-ready',before:baseline.findings.length,after:afterAudit.findings.length}));
const compiledBefore=read(W+'/app-before.json'),compiledAfter=read(W+'/app-after.json');
assert.equal(compiledBefore.sourceSha256,H(raw));assert.equal(compiledAfter.sourceSha256,H(fs.readFileSync(W+'/after.json')));
assert.deepEqual(compiledBefore.reports,compiledAfter.reports);
const inferred=new Map(compiledBefore.reports.flatMap((r:any)=>r.goals.map((g:any)=>[g.goalId,g.compiledApplicability])));
const cache=read(W+'/native-baseline-view-compilation.json');
assert.equal(cache.sourceSha256,H(raw));assert.equal(cache.reusedCompilerSourceSha256,H(fs.readFileSync(R+'/app/src/utils/authoring/compositionViewAuthoring.ts')));
for(const p of cache.catalog)assert.equal(p.sha256,H(fs.readFileSync(R+'/'+p.path)));
for(const f of fs.readdirSync(R+'/curricula/DE/Gymnasium/composition-views/mathematik').filter(f=>f.endsWith('.json')).sort()){
 const vp='curricula/DE/Gymnasium/composition-views/mathematik/'+f,v=normalizeCompositionView(read(R+'/'+vp));
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,goals,rootByOwner),cached=cache.views.find((r:any)=>r.path===vp);
 assert.equal(cached.sha256,H(fs.readFileSync(R+'/'+vp)));
 const afterRoles=collectCompositionProjectionRoleGoalIds(v.rootNodes,afterMap,rootByOwner);
 assert.deepEqual([...afterRoles.targetGoalIds].sort(),[...roles.targetGoalIds].sort());
 assert.deepEqual([...afterRoles.prerequisiteOnlyGoalIds].sort(),[...roles.prerequisiteOnlyGoalIds].sort());
 const variants=[];
 for(const course of ['','GK','LK'])for(const duration of ['','G8','G9']){
  const filters=[v.scope.jurisdiction,v.scope.courseProfile,v.scope.durationModel,course,duration].filter(Boolean) as string[];
  const visible=(ids:Set<string>)=>new Set([...ids].filter(id=>goalMatchesFilters({...beforeMap.get(id)!,applicability:inferred.get(id) as any},filters)));
  const targets=visible(roles.targetGoalIds),support=visible(roles.prerequisiteOnlyGoalIds),available=new Set([...targets,...support]);
  const checks=selected.filter(id=>targets.has(id)).map(id=>{
   const witnessTarget=path(afterMap,id,intro,targets),witnessAvailable=path(afterMap,id,intro,available);
   const b=path(beforeMap,id,intro,targets);
   const row={id,orientationTarget:targets.has(intro),beforeTargetPath:b,afterTargetPath:witnessTarget,afterAvailablePath:witnessAvailable,
    existingMissingDirectPrerequisites:beforeMap.get(id)!.requires.map(norm).filter(r=>!available.has(r))};
   if(b&&!witnessTarget)missing.push({view:v.viewId,course,duration,...row});return row;
  });
  variants.push({course:course||null,duration:duration||null,targetCount:targets.size,supportCount:support.size,checks});
 }
 views.push({path:vp,sha256:H(fs.readFileSync(R+'/'+vp)),scope:v.scope,compiledTreeSha256:cached.compiledTreeSha256,compileFindings:cached.compileFindings,baselineNativeCompilationReused:true,variants});
 if(views.length%10===0)console.log(JSON.stringify({phase:'native-views',completed:views.length,missing:missing.length}));
}
const result={owner,intro,sourceSha256:H(raw),afterSourceSha256:H(fs.readFileSync(W+'/after.json')),compiledApplicabilityAll21Unchanged:true,compiledApplicabilitySha256:H(JSON.stringify(compiledBefore.reports)),catalog:catalog.map(d=>({path:d.sourceFile,sha256:H(fs.readFileSync(R+'/'+d.sourceFile)),landscapeId:d.landscapeId,goals:d.goals.length})),
 baselineAudit:{nodeCount:baseline.nodeCount,findings:baseline.findings.length},afterAudit:{nodeCount:afterAudit.nodeCount,findings:afterAudit.findings.length},candidates,views,missing};
fs.writeFileSync(W+'/inspection.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({baseline:result.baselineAudit,after:result.afterAudit,views:views.length,filterCases:views.length*9,missing:missing.map(r=>({view:r.view,course:r.course,id:r.id}))}));
