import fs from 'node:fs';
import crypto from 'node:crypto';
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime.ts';
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters.ts';
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-two-HE-admission-remedy-independent-c-20261018-v1';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=(p:string)=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const patchPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-two-HE-course-admission-author-remedy-20261018-v1/AUTHOR.two-whole-HE-admission-successors.pending.json';
const patch=read(patchPath);const canonicalPath=patch.canonical.path;const canonical=read(canonicalPath);
const semantics=read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json');const ordinary=new Set(semantics.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId));
const proposed=structuredClone(canonical);for(const r of patch.records){const i=proposed.goals.findIndex((g:any)=>g.id===r.goalId);proposed.goals[i]=r.proposedWholeGoal;}
const byId=new Map(proposed.goals.map((g:any)=>[g.id,g]));
const allGraphs=fs.readdirSync('curricula/DE/Gymnasium/canonical').filter(n=>n.endsWith('.json')).map(n=>read('curricula/DE/Gymnasium/canonical/'+n));
const universeById=new Map(allGraphs.map(g=>[g.landscapeId,g.landscapeId===proposed.landscapeId?proposed:g]));
const universe={...proposed,goals:[...new Map([...universeById.values()].flatMap(g=>g.goals).map(g=>[g.id,g])).values()]};
const refs=[];
for(const name of ['de-he-gk','de-he-lk','de-he-sekii-gk','de-he-sekii-lk']){
 const path='curricula/DE/Gymnasium/composition-views/chemie/'+name+'.view.json';const view=read(path);const compiled=compileCompositionView(view,proposed,universe,universeById);
 const pure=applyCompositionViewProjection([{meta:proposed,goals:proposed.goals}] as any,view)[0];const pbyId=new Map(pure.goals.map((g:any)=>[g.id,g]));
 const roots=pure.goals.filter((g:any)=>(g.tags??[]).includes('root')&&(g.contains??[]).length);
 const reached=new Set<string>();const q=roots.map((g:any)=>g.id);while(q.length){const id=q.pop()!;if(reached.has(id))continue;reached.add(id);q.push(...((pbyId.get(id) as any)?.contains??[]));}
 const filters=[view.scope.courseProfile,'DE-HE'];
 const visible=[...reached].filter(id=>ordinary.has(id)&&goalMatchesFilters(pbyId.get(id) as any,filters));
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,byId as any);
 const rolesFiltered=[...roles.targetGoalIds].filter(id=>ordinary.has(id)&&goalMatchesFilters(byId.get(id) as any,filters));
 const rec=patch.records.find((r:any)=>r.course===view.scope.courseProfile);const req=new Set(rec.proposedWholeGoal.requires);
 refs.push({viewPath:path,sha256:sha(path),scope:view.scope,filters,compileErrors:compiled.findings.filter((f:any)=>f.severity==='error'),roleTargetOrdinaryFilteredCount:rolesFiltered.length,pureProjectionVisibleOrdinaryCount:visible.length,pureProjectionVisibleOrdinaryIds:visible.sort(),roleFilteredOrdinaryIds:rolesFiltered.sort(),admissionTargetCount:rec.proposedWholeGoal.extendedData.routeCoverage.currentCourseTargetAdmissionCount,requiredCount:req.size,visibleNotRequired:visible.filter(id=>!req.has(id)),requiredNotVisible:[...req].filter(id=>!visible.includes(id)),roleTargetNotRequired:rolesFiltered.filter(id=>!req.has(id)),requiredNotRoleTarget:[...req].filter(id=>!rolesFiltered.includes(id)),capstoneVisible:reached.has(rec.goalId)});
}
fs.writeFileSync(out+'/CHECK.actual-four-HE-projections-and-filters.json',JSON.stringify({artifactRole:'INDEPENDENT_C_READONLY_STOCK_FUNCTION_MEASUREMENT_NOT_REVIEW_VOTE',patchSha256:sha(patchPath),canonicalSha256:sha(canonicalPath),ordinaryCount:ordinary.size,views:refs},null,2)+'\n');
console.log(JSON.stringify(refs.map(v=>({view:v.viewPath.split('/').at(-1),errors:v.compileErrors.length,roles:v.roleTargetOrdinaryFilteredCount,pure:v.pureProjectionVisibleOrdinaryCount,missing:v.visibleNotRequired.length,extra:v.requiredNotVisible.length,capstoneVisible:v.capstoneVisible}))));
