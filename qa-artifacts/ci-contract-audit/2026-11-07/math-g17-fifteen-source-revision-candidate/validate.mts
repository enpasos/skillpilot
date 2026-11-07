import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import {checkSkillGraphIntegrity} from '/home/enpasos/projects/skillpilot/app/scripts/lib/skillGraphIntegrity.ts';
import {prepareLandscapeEntries} from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts';
import {buildApplicabilityCompilation} from '/home/enpasos/projects/skillpilot/app/scripts/applicabilityCompiler.ts';
import {normalizeCanonicalLandscape} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/canonicalAuthoring.ts';
import {normalizeCompositionView,compileCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts';
const R='/home/enpasos/projects/skillpilot',W='/dev/shm/math-g17-fifteen-jm976p3s';
const H=(v:string|Uint8Array)=>createHash('sha256').update(v).digest('hex'),read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'));
const rel='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const mode=process.argv[2],inspection=read(W+'/inspection.json'),owner=inspection.owner;
if(mode==='app-before'||mode==='app-after'){
 const sha=H(fs.readFileSync(R+'/'+rel));assert.equal(sha,mode==='app-before'?inspection.sourceSha256:inspection.afterSourceSha256);
 const out=buildApplicabilityCompilation();
 const rows=out.reports.map((r:any)=>({landscapeId:r.landscapeId,goals:r.goals.map((g:any)=>({goalId:g.goalId,compiledApplicability:g.compiledApplicability})),findings:r.findings}));
 fs.writeFileSync(W+'/'+mode+'.json',JSON.stringify({sourceSha256:sha,reports:rows},null,2)+'\n');
 console.log(JSON.stringify({mode,reports:rows.length,goals:rows.reduce((n:number,r:any)=>n+r.goals.length,0)}));
}else{
 assert.equal(mode,'core');assert.equal(H(fs.readFileSync(R+'/'+rel)),inspection.sourceSha256);
 const catalog=inspection.catalog.map((r:any)=>{const b=fs.readFileSync(R+'/'+r.path);assert.equal(H(b),r.sha256);return{...JSON.parse(b.toString()),sourceFile:r.path};});
 const after=read(W+'/after.json');assert.equal(H(fs.readFileSync(W+'/after.json')),inspection.afterSourceSha256);
 const next=catalog.map((d:any)=>d.landscapeId===owner?{...after,sourceFile:d.sourceFile}:d);
 const ids=catalog.map((d:any)=>d.landscapeId),reports=[checkSkillGraphIntegrity(catalog,ids),checkSkillGraphIntegrity(next,ids)];
 for(let i=0;i<2;i++)fs.writeFileSync(W+'/strict-'+(i?'after':'before')+'.json.gz',gzipSync(JSON.stringify(reports[i],null,2)+'\n'));
 const identify=(f:any)=>{const{witness,...rest}=f;return JSON.stringify(rest);};
 const bf=new Set(reports[0].findings.map(identify)),af=new Set(reports[1].findings.map(identify));
 const gone=[...bf].filter(x=>!af.has(x)).map(x=>JSON.parse(x)),fresh=[...af].filter(x=>!bf.has(x));
 assert.equal(gone.length,15);assert.equal(fresh.length,0);assert(gone.every((f:any)=>f.landscapeId===owner&&f.ruleId==='G17'));
 const before=prepareLandscapeEntries(catalog).flatMap(e=>e.goals),later=prepareLandscapeEntries(next).flatMap(e=>e.goals);
 const bm=new Map(before.map(g=>[g.id,g])),am=new Map(later.map(g=>[g.id,g]));assert.equal(bm.size,6524);
 const norm=(r:string)=>r.includes(':')?r.split(':')[1]:r;
 function graph(map:any,atomic:boolean){
  const leaves=new Map<string,string[]>();
  const descendants=(id:string):string[]=>{
   if(leaves.has(id))return leaves.get(id)!;
   const g=map.get(id);assert(g,id);const arr=g.contains.length?[...new Set(g.contains.flatMap((r:string)=>descendants(norm(r))))]:[id];
   leaves.set(id,arr);return arr;
  };
  const out=new Map<string,string[]>();
  for(const[id,g]of map){if(atomic&&g.contains.length)continue;const refs=(g.effectiveRequires??[]).map(norm);
   out.set(id,[...new Set(atomic?refs.flatMap(descendants):refs)] as string[]);}
  return out;
 }
 function reached(adjacency:Map<string,string[]>,id:string){
  const seen=new Set<string>(),queue=[id];for(let i=0;i<queue.length;i++)for(const t of adjacency.get(queue[i])??[]){if(!seen.has(t)){seen.add(t);queue.push(t);}}
  return [...seen].sort();
 }
 const closure=[];
 for(const atomic of [false,true]){
  const a=graph(bm,atomic),b=graph(am,atomic),h1=createHash('sha256'),h2=createHash('sha256');let pairs=0;
  for(const id of [...a.keys()].sort()){
   const x=reached(a,id),y=reached(b,id);assert.deepEqual(y,x,id);pairs+=x.length;
   h1.update(JSON.stringify([id,x])+'\n');h2.update(JSON.stringify([id,y])+'\n');
  }
  closure.push({kind:atomic?'atomic':'goal-node',nodes:a.size,reachablePairs:pairs,beforeSha256:h1.digest('hex'),afterSha256:h2.digest('hex'),same:true});
 }
 // A genuinely necessary matrix-origin withdrawal must change the mathematical demand.
 const critical=structuredClone(next),matrix='304111dd-426b-520b-a275-3fa37da1b0e0',entries='b5062446-332f-4a67-aaf7-3bfa3e5aded9';
 critical.find((d:any)=>d.landscapeId===owner).goals.find((g:any)=>g.id===matrix).requires=critical.find((d:any)=>d.landscapeId===owner).goals.find((g:any)=>g.id===matrix).requires.filter((r:string)=>r!==entries);
 const cm=new Map(prepareLandscapeEntries(critical).flatMap(e=>e.goals.map(g=>[g.id,g])));
 const full=reached(graph(am,true),matrix),cut=reached(graph(cm,true),matrix);assert(full.includes(entries));assert(!cut.includes(entries));
 const neg={source:matrix,necessaryPrerequisite:entries,withdrawalActuallyLoses:full.filter(x=>!cut.includes(x))};
 const byOwner=ids.map((id:string)=>({landscapeId:id,before:reports[0].findings.filter(f=>f.landscapeId===id).length,after:reports[1].findings.filter(f=>f.landscapeId===id).length,
  beforeG17:reports[0].findings.filter(f=>f.landscapeId===id&&f.ruleId==='G17').length,afterG17:reports[1].findings.filter(f=>f.landscapeId===id&&f.ruleId==='G17').length}));
 const canon=new Map(next.map((d:any)=>{const n=normalizeCanonicalLandscape(d);return[n.landscapeId,n]}));
 const universe:any={landscapeId:'catalog-context',title:'catalog-context',goals:[...canon.values()].flatMap((d:any)=>d.goals)};
 const representative=[];
 for(const ending of ['de-de-gk.view.json','de-de-lk.view.json','de-he-gk.view.json','de-he-lk.view.json']){
  const old=inspection.views.find((v:any)=>v.path.endsWith('/'+ending));assert(old);
  const v=normalizeCompositionView(read(R+'/'+old.path)),c=compileCompositionView(v,canon.get(owner) as any,universe,canon as any);
  assert.equal(H(JSON.stringify(c.compiledRootNodes)),old.compiledTreeSha256);assert.deepEqual(c.findings,old.compileFindings);
  representative.push({path:old.path,afterTreeExactlyEqual:true,compilerFindingsExactlyEqual:true});
 }
 const out={catalogCount:21,goalCount:6524,closure,strict:{byOwner,gone,newFindings:fresh.length,allOtherFindingIdentitiesUnchanged:true},
  actualNecessaryEdgeNegative:neg,afterNativeComposition:representative,
  boundaries:['Existing strict graph checker, native UI effective inheritance and unchanged composition/filter modules used; no new eligibility engine.',
   'No full CQR, mastery-service replay, SourceA, UUID rekey, active source or QA write.']};
 fs.writeFileSync(W+'/core-checks.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
}
