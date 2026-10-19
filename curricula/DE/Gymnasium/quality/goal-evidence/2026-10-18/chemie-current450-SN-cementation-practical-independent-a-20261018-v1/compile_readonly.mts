// SPDX-License-Identifier: Apache-2.0
import {readFileSync,readdirSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,basename} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=basename(process.cwd())==='app'?resolve(process.cwd(),'..'):process.cwd();
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/';
const author=base+'chemie-current450-SN-cementation-practical-author-20261018-v1/';
const out=resolve(root,base+'chemie-current450-SN-cementation-practical-independent-a-20261018-v1');mkdirSync(out,{recursive:true});
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href);
const {normalizeCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href);
const before=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');
const after=read(author+'candidates/landscape.after.INACTIVE.json');
const bm=new Map(before.goals.map((g:any)=>[g.id,g]));const am=new Map(after.goals.map((g:any)=>[g.id,g]));
const bn=normalizeCanonicalLandscape(before);const an=normalizeCanonicalLandscape(after);
const overlays=new Map(read(author+'operations/views.two-whole-CAS.pending.json').wholeViewBeforeAfter.map((v:any)=>[v.path,v.after]));
const newId='ce0dae03-4dfe-5265-aeb3-1590cfd73d66',reuse='e81a4aed-9695-533e-8eb7-7a0c714346ea';
const role=(p:any,id:string)=>p.targetGoalIds.has(id)?'target':p.prerequisiteOnlyGoalIds.has(id)?'prerequisiteOnly':'absent';
const parents=(ns:any[],parent='ROOT',r=new Map<string,string>())=>{for(const n of ns){if(n.sourceGoalId)r.set(n.sourceGoalId,parent);parents(n.children??[],n.sourceGoalId?'goal:'+n.sourceGoalId:n.runtimeId.replace(/^[^/]+\//,''),r)}return r;};
const rows=[];
for(const name of readdirSync(resolve(root,'curricula/DE/Gymnasium/composition-views/chemie')).filter(n=>n.endsWith('.json')).sort()){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name;
 const b=normalizeCompositionView(read(path)),a=normalizeCompositionView(overlays.get(path)??b);
 const bc=compileCompositionView(b,bn),ac=compileCompositionView(a,an);
 const bp=collectCompositionProjectionRoleGoalIds(b.rootNodes,bm),ap=collectCompositionProjectionRoleGoalIds(a.rootNodes,am);
 const bpar=parents(bc.compiledRootNodes),apar=parents(ac.compiledRootNodes);
 rows.push({path,viewId:b.viewId,newIdRole:role(ap,newId),existingE81BeforeRole:role(bp,reuse),existingE81AfterRole:role(ap,reuse),oldRoleChanges:before.goals.filter((g:any)=>role(bp,g.id)!==role(ap,g.id)).map((g:any)=>g.id),oldParentChanges:[...bpar].filter(([g,p])=>apar.get(g)!==p),compilerErrors:ac.findings.filter((f:any)=>f.severity==='error')});
}
const wanted=new Set(['de-sn-gym-chemistry-gk','de-sn-gym-chemistry-lk']);
const failures=rows.filter(r=>r.oldRoleChanges.length||r.oldParentChanges.length||r.compilerErrors.length||r.newIdRole!==(wanted.has(r.viewId)?'target':'absent'));
const report={role:'Independent A actual read-only candidate compilation, not scientific approval',views:41,newId,existingReuseId:reuse,rows,failures,allNewRolePlacementsAsProposed:failures.length===0,normalFilesWritten:0};
writeFileSync(resolve(out,'CHECK.actual-independent-41-view-compilation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({views:rows.length,failures:failures.length,newTargetViews:rows.filter(r=>r.newIdRole==='target').map(r=>r.viewId),existingE81InSN:rows.filter(r=>wanted.has(r.viewId)).map(r=>({viewId:r.viewId,role:r.existingE81BeforeRole}))}));
if(failures.length)process.exitCode=1;
