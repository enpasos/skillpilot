import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=path.dirname(fileURLToPath(import.meta.url));
const base=path.relative(process.cwd(),dir);
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const items=json(dir+'/adoption-plan-v1.json').items;
const lp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json';
const qp='curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json';
const bc=json('app/scripts/config/goal-books/de-gym-math-national-atlas.json');
const req=json('curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-07/batch-044-spatial-geometry-vectors-and-matrix-entry-20-v1/prerequisite-change-plan-v2.json');
const mode=process.argv[2];
const copy=(src,dst)=>{
 const bytes=fs.readFileSync(src); fs.mkdirSync(path.dirname(dst),{recursive:true});
 if(fs.existsSync(dst))assert.deepEqual(fs.readFileSync(dst),bytes,'archive drift '+dst);
 else fs.writeFileSync(dst,bytes,{flag:'wx'});
 return {path:dst,sha256:'sha256:'+sha(bytes)};
};
if(mode==='archive'){
 assert.equal('sha256:'+sha(fs.readFileSync(lp)),req.source.bytesSha256);
 const paths=[lp,qp,bc.semanticKindLedgerPath,
 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl',
 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl'];
 const files=paths.map(p=>copy(p,base+'/before-v1/'+path.basename(p).replace('canonical-math-full.review',p.includes('semantic-atomicity')?'atomicity':'memory')));
 for(const item of items){
  assert.equal(sha(fs.readFileSync(item.image)),item.sha);
  const source='curricula/DE/Gymnasium/visualizations/mathematik/'+item.goalId;
  for(const name of [item.goalId+'.jpg','prompt.de.md','image-reconstruction-prompt.de.md'])
   if(fs.existsSync(source+'/'+name))files.push(copy(source+'/'+name,base+'/before-v1/'+item.goalId+'/'+name));
  files.push(copy(item.image,base+'/accepted-v1/'+item.goalId+path.extname(item.image)));
  files.push(copy(item.prompt,base+'/accepted-v1/'+item.goalId+'.prompt.de.md'));
 }
 const receipt={schemaVersion:1,archivedAt:new Date().toISOString(),files};
 const output=base+'/before-v1/receipt.json';
 assert(!fs.existsSync(output));fs.writeFileSync(output,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({mode,archivedFiles:files.length,receipt:output}));
}else if(mode==='import'){
 assert(fs.existsSync(base+'/before-v1/receipt.json'));
 for(const item of items){
  assert.equal(sha(fs.readFileSync(item.image)),item.sha);
  const args=['scripts/import_goal_visualization.mjs','--goal',item.goalId,'--image',item.image,'--landscape',lp,'--subject','mathematik','--provider',item.provider,'--review-status','pilot','--prompt',item.prompt,'--alt-text',item.alt];
  if(!item.native){
   const reconstruction=item.image.replace(/\.jpg$/,'.image-reconstruction-prompt.de.md');
   if(fs.existsSync(reconstruction))args.push('--reconstruction-prompt',reconstruction);
  }
  const result=spawnSync(process.execPath,args,{encoding:'utf8'});assert.equal(result.status,0,result.stderr+result.stdout);
  for(const root of ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']){
   const p=root+'/mathematik/'+item.goalId+'/'+item.goalId+path.extname(item.image);
   assert.equal(sha(fs.readFileSync(p)),item.sha,p);
  }
 }
 console.log(JSON.stringify({mode,imported:items.length,metadataStatus:'pilot',humanApproval:false}));
}else if(mode==='patch'){
 const ls=fs.readFileSync(lp,'utf8'),l=JSON.parse(ls),qs=fs.readFileSync(qp,'utf8'),q=JSON.parse(qs);
 const kp=bc.semanticKindLedgerPath,ks=fs.readFileSync(kp,'utf8'),k=JSON.parse(ks);
 const chunks=[];
 const hunk=(a,b,indent=4)=>{const lines=x=>JSON.stringify(x,null,2).split('\n').slice(1,-1).map(s=>' '.repeat(indent)+s);return '@@\n'+lines(a).map(s=>'-'+s).join('\n')+'\n'+lines(b).map(s=>'+'+s).join('\n');};
 chunks.push('*** Update File: '+lp);
 for(const edit of req.canonicalChangedGoals){
  const g=l.goals.find(g=>g.id===edit.goalId);assert.deepEqual(g.requires,edit.beforeRequires);
  const next={...g,requires:edit.afterRequires};chunks.push(hunk(g,next));Object.assign(g,next);
 }
 chunks.push('*** Update File: '+kp);
 for(const change of [...req.semanticKindBindingChanges].sort((a,b)=>k.decisions.findIndex(d=>d.goalId===a.goalId)-k.decisions.findIndex(d=>d.goalId===b.goalId))){
  const d=k.decisions.find(d=>d.goalId===change.goalId);assert.equal(d.sourceFingerprint,change.beforeFingerprint);assert.equal(d.semanticKind,'curricularAtomic');
  const next={...d,sourceFingerprint:change.afterFingerprint};chunks.push(hunk(d,next));Object.assign(d,next);
 }
 chunks.push('*** Update File: '+qp);
 for(const item of [...items].sort((a,b)=>q.records.findIndex(d=>d.goalId===a.goalId)-q.records.findIndex(d=>d.goalId===b.goalId))){
  const prev=q.records.find(r=>r.goalId===item.goalId);assert(prev);
  const ext=path.extname(item.image),url='/assets/goal-visualizations/mathematik/'+item.goalId+'/'+item.goalId+ext;
  const next={...prev,imageUrl:url,publicAssetPath:'app/public'+url,canonicalAssetPath:'curricula/DE/Gymnasium/visualizations/mathematik/'+item.goalId+'/'+item.goalId+ext,assetSha256:'sha256:'+item.sha,
  umlautsCorrectChatGpt:'no',contentApprovedChatGpt:'no',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',
  chatGptReviewedAt:null,chatGptReviewer:'',chatGptNotes:'',humanReviewedAt:null,humanReviewer:'',
  aiApproved:'yes',aiApprovedAssetSha256:'sha256:'+item.sha,aiReviewedAt:new Date().toISOString(),aiReviewer:'/root and /root/goal_book_build_generator',
  aiNotes:'Both reviewers actually viewed this exact accepted raster; precise independent review receipts under '+base+'. AI approval only, no human signoff or D/P completion claim. Historical asset/metadata retained in before-v1. '+item.alt};
  chunks.push(hunk(prev,next));Object.assign(prev,next);
 }
 console.log(JSON.stringify({patch:'*** Begin Patch\n'+chunks.join('\n')+'\n*** End Patch',requires:8,kindBindings:8,imageQa:4}));
}else throw Error('Expected archive, import or patch; no implicit mode.');
