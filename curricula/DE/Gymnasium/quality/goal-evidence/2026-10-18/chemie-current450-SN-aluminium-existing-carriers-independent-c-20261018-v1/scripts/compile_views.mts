// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = process.cwd().endsWith('/app') ? path.resolve(process.cwd(),'..') : process.cwd();
const {normalizeCanonicalLandscape} = await import(path.join(root,'app/src/utils/authoring/canonicalAuthoring.ts'));
const {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} = await import(path.join(root,'app/src/utils/authoring/compositionViewAuthoring.ts'));
const data=JSON.parse(fs.readFileSync(path.join(root,'tmp/chemie-SN-aluminium-independent-c-20261018/compiler-input.json'),'utf8'));
const before=normalizeCanonicalLandscape(data.beforeLandscape), after=normalizeCanonicalLandscape(data.afterLandscape);
const bm=new Map(before.goals.map(g=>[g.id,g])), am=new Map(after.goals.map(g=>[g.id,g]));
const differences=(a:Set<string>,b:Set<string>)=>[...a].filter(x=>!b.has(x)).sort();
function parents(nodes:any[],parent:string|null=null,result:any={}) {
 for(const n of nodes){const id=n.sourceGoalId??(n.runtimeId??n.id);if(id)result[id]=parent;parents(n.children??[],id??parent,result)}
 return result;
}
const rows=data.views.map((v:any)=>{
 const bv=normalizeCompositionView(v.before), av=normalizeCompositionView(v.after);
 const bp=collectCompositionProjectionRoleGoalIds(bv.rootNodes,bm),ap=collectCompositionProjectionRoleGoalIds(av.rootNodes,am);
 const bc=compileCompositionView(bv,before),ac=compileCompositionView(av,after);
 const oldParents=parents(bc.compiledRootNodes),newParents=parents(ac.compiledRootNodes);
 const changedParents=Object.keys(oldParents).filter(k=>oldParents[k]!==newParents[k]);
 const errors=[...bc.findings,...ac.findings].filter((f:any)=>f.severity==='error');
 return {path:v.path,viewId:av.viewId,addedTargets:differences(ap.targetGoalIds,bp.targetGoalIds),removedTargets:differences(bp.targetGoalIds,ap.targetGoalIds),addedPrerequisiteOnly:differences(ap.prerequisiteOnlyGoalIds,bp.prerequisiteOnlyGoalIds),removedPrerequisiteOnly:differences(bp.prerequisiteOnlyGoalIds,ap.prerequisiteOnlyGoalIds),changedExistingParents:changedParents,errors};
});
const changes=rows.filter((r:any)=>r.addedTargets.length||r.removedTargets.length||r.addedPrerequisiteOnly.length||r.removedPrerequisiteOnly.length||r.changedExistingParents.length||r.errors.length);
const passed=rows.length===41&&changes.length===1&&changes[0].viewId==='de-sn-gym-chemistry-gk'&&JSON.stringify(changes[0].addedTargets)===JSON.stringify([data.newGoalId])&&!changes[0].removedTargets.length&&!changes[0].addedPrerequisiteOnly.length&&!changes[0].removedPrerequisiteOnly.length&&!changes[0].changedExistingParents.length&&!changes[0].errors.length;
const result={role:'INDEPENDENT_C_ACTUAL_PRODUCTION_COMPILER_41',active:false,passed,scopeCount:rows.length,changes,rows,normalFilesWritten:false,nativeD_M7_HumanOrAssessmentReleaseClaim:false};
const destination=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../checks/actual41-production-compiler.json');
fs.writeFileSync(destination,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({passed,scopeCount:rows.length,changes},null,2));
if(!passed)process.exitCode=1;
