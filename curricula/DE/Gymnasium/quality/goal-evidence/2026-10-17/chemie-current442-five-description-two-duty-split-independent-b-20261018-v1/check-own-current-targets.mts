import fs from 'node:fs';
import crypto from 'node:crypto';
import { normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
const root = '/home/enpasos/projects/skillpilot/';
const own = root + 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current442-five-description-two-duty-split-independent-b-20261018-v1/';
const cp = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';
const read = (p:string) => JSON.parse(fs.readFileSync(root+p,'utf8'));
const pin = (p:string) => { const b=fs.readFileSync(root+p); return {path:root+p,sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}; };
const c=read(cp), by=new Map<string,any>(c.goals.map((g:any)=>[g.id,g]));
const ids=['0959eef2-3c7d-5b33-a109-ddf332a5dbd9','3eb2a06c-d283-57aa-9eb4-088940c4801a','f4d5a02d-711b-5a6b-a41d-971359c1f64d'];
const dir='curricula/DE/Gymnasium/composition-views/chemie';
const rows:any[]=[];
for(const name of fs.readdirSync(root+dir).filter(x=>x.endsWith('.view.json')).sort()) {
 const p=dir+'/'+name,v=normalizeCompositionView(read(p));
 const role=collectCompositionProjectionRoleGoalIds(v.rootNodes,by);
 for(const id of ids) if(role.targetGoalIds.has(id)||role.prerequisiteOnlyGoalIds.has(id))
  rows.push({goalId:id,view:pin(p),viewId:v.viewId,scope:v.scope,actualRole:role.targetGoalIds.has(id)?'target':'prerequisiteOnly'});
}
const counts=Object.fromEntries(ids.map(id=>[id,{targets:rows.filter(x=>x.goalId===id&&x.actualRole==='target').length,support:rows.filter(x=>x.goalId===id&&x.actualRole==='prerequisiteOnly').length}]));
fs.writeFileSync(own+'CHECK.actual-current-target-roles.json',JSON.stringify({atUTC:new Date().toISOString(),canonical:pin(cp),method:'Unchanged normalizeCompositionView and collectCompositionProjectionRoleGoalIds; current input only, no candidate installation or new scope acceptance.',rows,counts},null,2)+'\n');
console.log(JSON.stringify(counts,null,2));
