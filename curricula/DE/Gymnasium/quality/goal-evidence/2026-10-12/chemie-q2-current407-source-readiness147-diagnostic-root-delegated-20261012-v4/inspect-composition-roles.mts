// SPDX-License-Identifier: Apache-2.0
// Read inputs only; write diagnostic output exclusively beside this script.
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring';
import {collectCompositionProjectionRoleGoalIds,compileCompositionView,normalizeCompositionView} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring';
const out=dirname(fileURLToPath(import.meta.url)),repo=resolve(out,'../../../../../../..');
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12';
const stage=base+'/chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6';
const bindings=new Map<string,string>();
const read=async(path:string)=>{const b=await readFile(resolve(repo,path));bindings.set(path,'sha256:'+createHash('sha256').update(b).digest('hex'));return JSON.parse(b.toString());};
const entry=await read(stage+'/FINAL.current24.neutral-review-input.json');
const central=await read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');
const chemistry=central.subjects.find((s:any)=>s.subject.toLowerCase()==='chemie');
const landscapes=[['frozen-current407-candidate',entry.canonical.path],['active-normal',chemistry.landscapePath]] as const;
const holds=(await read(base+'/chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3/bounded-source-ownership-and-readiness.json')).sourceReadinessHolds;
const selected=new Set<string>(holds.flatMap((h:any)=>[h.goalId,...h.missingPrerequisitesFromTargetView]));
const sourceScopes=(await read(entry.compiledScope40Readiness.path)).scopes;
const authoredDir='curricula/DE/Gymnasium/composition-views/chemie';
const paths=(await readdir(resolve(repo,authoredDir))).filter(p=>p.endsWith('.view.json')).sort().map(p=>authoredDir+'/'+p);
const output:any[]=[];
for(const [landscapeRole,landscapePath] of landscapes){
 const land=await read(landscapePath),canonical=normalizeCanonicalLandscape(land),gm=new Map<string,any>(land.goals.map((g:any)=>[g.id,g]));
 for(const path of [...paths,...(landscapeRole==='frozen-current407-candidate'?sourceScopes.map((s:any)=>s.path):[])]){
  const view=normalizeCompositionView(await read(path));
  const compiled=compileCompositionView(view,canonical);
  const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,gm);
  output.push({landscapeRole,landscapePath,path,scope:view.scope,viewId:view.viewId,targetCount:roles.targetGoalIds.size,prerequisiteOnlyCount:roles.prerequisiteOnlyGoalIds.size,
   selectedAssignments:[...selected].sort().map(id=>({goalId:id,role:roles.targetGoalIds.has(id)?'target':roles.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'omitted',canonicalExists:gm.has(id)})),
   errors:compiled.findings.filter(f=>f.severity==='error')});
 }
}
const result={artifactRole:'informed read-only composition diagnostic, no review vote',newScientificVotes:0,grantsM7Closure:false,bindings:[...bindings].map(([path,sha256])=>({path,sha256})),views:output};
await writeFile(resolve(out,'normal-composition-roles.actual.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({views:output.length,compilerErrors:output.reduce((n,v)=>n+v.errors.length,0),explicitPrerequisiteOnlyViews:output.filter(v=>v.prerequisiteOnlyCount>0).length,newScientificVotes:0}));
