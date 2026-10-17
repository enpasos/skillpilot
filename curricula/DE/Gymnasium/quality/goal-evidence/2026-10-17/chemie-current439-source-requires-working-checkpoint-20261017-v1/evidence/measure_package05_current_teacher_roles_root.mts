import fs from 'node:fs';
import assert from 'node:assert/strict';
import {collectCompositionProjectionRoleGoalIds, compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
const B='/mnt/e/skillpilot-chemie-L7-20261017';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const c=read(B+'/paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json');
const views=read(B+'/paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1/candidate.whole39views.paired48-plus20-foundations.private.json');
const inventory=read(B+'/actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1/INVENTORY.root-current149-seven-finite-packages.json');
const group=inventory.goals.filter((g:any)=>g.packageId==='05-ni-organics-materials');
const byId=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
const rows:any[]=[];
for(const viewId of ['de-ni-gym-chemistry-gk','de-ni-gym-chemistry-lk']){
 const v=views.find((v:any)=>v.viewId===viewId); assert(v);
 const roles=collectCompositionProjectionRoleGoalIds(v.rootNodes,byId);
 const starts=group.filter((g:any)=>g.nodeKind!=='memory'&&g.viewIds.includes(viewId)).map((g:any)=>g.goalId);
 const seen=new Set<string>(),missing:any[]=[];
 const walk=(id:string)=>{if(seen.has(id))return;seen.add(id);for(const prior of byId.get(id)?.requires??[]){assert(byId.has(prior));if(!roles.targetGoalIds.has(prior))missing.push({dependentGoalId:id,goalId:prior,title:byId.get(prior).title,nodeKind:byId.get(prior).nodeKind??byId.get(prior).type,role:roles.prerequisiteOnlyGoalIds.has(prior)?'prerequisiteOnly':'absent'});walk(prior);}};
 for(const id of starts)walk(id);
 rows.push({viewId,starts,visited:seen.size,missing,roleOfCa216:roles.targetGoalIds.has('ca216bc6-5205-5b46-abbd-fd5628e4ca5b')?'target':roles.prerequisiteOnlyGoalIds.has('ca216bc6-5205-5b46-abbd-fd5628e4ca5b')?'prerequisiteOnly':'absent',existingFindings:compileCompositionView(v,c).findings});
}
const out=B+'/MEASUREMENT.package05-current-C20-stock-teacher-roles.root.json';
fs.writeFileSync(out,JSON.stringify({role:'Actual bounded stock composition-helper role inspection, not science or a new learner/native/central acceptance',rows,M7:false,HumanApproval:false},null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({out,rows}));
