import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {auditTransitiveMinimality} from '/home/enpasos/projects/skillpilot/app/scripts/auditTransitiveMinimality.ts';
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/math-g17-first-bW32dz';
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8')),i=read(W+'/inspection.json'),after=read(W+'/after.json');
const catalog=i.catalog.map((p:any)=>{const raw=fs.readFileSync(R+'/'+p.path);assert.equal(createHash('sha256').update(raw).digest('hex'),p.sha256);return p.landscapeId===i.owner?after:JSON.parse(raw.toString());});
const pairs=new Set(i.candidates.map((c:any)=>i.owner+':'+c.id+'->'+i.owner+':'+i.intro));
const all=new Map(catalog.flatMap((d:any)=>d.goals.map((g:any)=>[d.landscapeId+':'+g.id,g])));
const rows=[];
for(const c of i.candidates){
 const frame=structuredClone(catalog),g=frame.find((d:any)=>d.landscapeId===i.owner).goals.find((g:any)=>g.id===c.id);
 g.requires.push(i.intro);
 // The unchanged native auditor then removes this one restored origin from
 // every inherited contribution. Its effective graph is exactly the final20-cut graph.
 const result=auditTransitiveMinimality(frame,[i.owner]);
 const finding=result.findings.find(f=>f.source===i.owner+':'+c.id&&f.prerequisite===i.owner+':'+i.intro);assert(finding);
 for(const origin of finding.supportingOrigins){assert(!pairs.has(origin.source+'->'+origin.prerequisite));const og:any=all.get(origin.source);assert(og);assert(og.requires.some((r:string)=>r===origin.prerequisite||origin.source.split(':')[0]+':'+r===origin.prerequisite));}
 rows.push({sourceGoalId:c.id,actualNativeWitnessAfterJointOriginRemoval:finding,
  fullWitnessGoalObjects:finding.witness.map(k=>({key:k,goal:all.get(k)})),
  fullSupportingOriginObjects:finding.supportingOrigins.map(o=>({key:o.source,goal:all.get(o.source)})),
  noRemovedOriginUsed:true});
}
fs.writeFileSync(W+'/joint-native-witnesses.json',JSON.stringify(rows,null,2)+'\n');
console.log(JSON.stringify({nativeAuditorWitnesses:rows.length,allTwentyOriginsJointlyAbsentInEachEffectiveWitness:true}));
