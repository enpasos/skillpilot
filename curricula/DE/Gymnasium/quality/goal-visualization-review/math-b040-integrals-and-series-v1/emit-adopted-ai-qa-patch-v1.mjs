import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const args=process.argv.slice(2), receiptPath=args.shift();
assert(receiptPath && args.length);
const sha=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const roots='curricula/DE/Gymnasium/quality/goal-visualization-review/';
const aggregatePaths=args.map(a=>a.startsWith(roots)?a:roots+a);
const records=aggregatePaths.flatMap(p=>JSON.parse(fs.readFileSync(p,'utf8')).records).filter(r=>r.decision==='accept');
const patches=[], adopted=[];
for(const subject of ['mathematik','physik']){
 const qp='curricula/DE/Gymnasium/quality/goal-visualization-qa/'+subject+'.qa.json';
 const old=fs.readFileSync(qp,'utf8'), q=JSON.parse(old);
 const lp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_'+(subject==='physik'?'PHYSIK':'MATHEMATIK')+'.de.json';
 const l=JSON.parse(fs.readFileSync(lp,'utf8'));
 for(const r of records.filter(r=>r.goalContext.canonicalPath===lp)){
  const g=l.goals.find(g=>g.id===r.goalId);assert(g);
  const url='/assets/goal-visualizations/'+subject+'/'+g.id+'/'+g.id+'.jpg';
  const cp='curricula/DE/Gymnasium/visualizations/'+subject+'/'+g.id+'/'+g.id+'.jpg';
  const pp='app/public'+url,bp='backend/src/main/resources/static'+url;
  for(const p of [cp,pp,bp])assert.equal(sha(p),r.image.sha256,p);
  const idx=q.records.findIndex(x=>x.goalId===g.id), prev=idx>=0?q.records[idx]:null;
  const rec=prev?{...prev}:{...q.records[0]};
  const imageRoot=path.dirname(path.dirname(r.image.path));
  const original=imageRoot+'/original/'+g.id+'.jpg';
  if(prev){assert(fs.existsSync(original),original);assert.equal(sha(original),prev.assetSha256,'Original changed before QA import');}
  Object.assign(rec,{goalId:g.id,title:g.title,description:g.description,subject,landscapeId:l.landscapeId,landscapePath:lp,visualizationState:'available',missingReason:'',imageUrl:url,publicAssetPath:pp,canonicalAssetPath:cp,assetSha256:r.image.sha256,umlautsCorrectChatGpt:'no',contentApprovedChatGpt:'no',humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',chatGptReviewedAt:null,chatGptReviewer:'',chatGptNotes:'',humanReviewedAt:null,humanReviewer:'',aiApproved:'yes',aiApprovedAssetSha256:r.image.sha256,aiReviewedAt:new Date().toISOString(),aiReviewer:'codex-root-and-math-b039-blind-a',aiNotes:r.subjectSpecificChecks.join(' ')+' Tatsächliche AI-Rastergegenprüfung durch Root und math_b039_blind_a. Keine menschliche Abnahme, keine D/P-Vollständigkeitsbehauptung. Kandidat und Original unverändert archiviert: '+imageRoot});
  assert(rec.landscapeId,'landscapeId');
  if(idx>=0)q.records[idx]=rec;else q.records.push(rec);
  const reviewPath=path.dirname(r.image.path)+(fs.existsSync(path.dirname(r.image.path)+'/independent-ai-review-v2.json')?'/independent-ai-review-v2.json':'/independent-ai-review-v1.json');
  adopted.push({goalId:g.id,candidateNumber:r.candidateNumber,subject,oldAssetSha256:prev?.assetSha256??null,newAssetSha256:r.image.sha256,originalArchive:prev?imageRoot+'/original':null,candidateArchive:path.dirname(r.image.path),independentReviewPath:reviewPath,independentReviewSha256:sha(reviewPath),authority:'ai_review',grantsHumanAuthority:false,grantsDPCompletion:false,checkedAt:rec.aiReviewedAt,rootActuallyViewed:true,rootReviewNote:r.subjectSpecificChecks.join(' '),runtimeCopiesVerified:[cp,pp,bp]});
 }
 const next=JSON.stringify(q,null,2)+'\n';
 if(next!==old){
  // Localized object edits; preserve unrelated records and metadata.
  for(const a of adopted.filter(a=>a.subject===subject).sort((a,b)=>q.records.findIndex(r=>r.goalId===a.goalId)-q.records.findIndex(r=>r.goalId===b.goalId))){
   const prev=JSON.parse(old).records.find(r=>r.goalId===a.goalId), rec=q.records.find(r=>r.goalId===a.goalId);
   const lines=r=>JSON.stringify(r,null,2).split('\n').slice(1,-1).map(l=>'    '+l);
   if(prev)patches.push('*** Update File: '+qp+'\n@@\n'+lines(prev).map(l=>'-'+l).join('\n')+'\n'+lines(rec).map(l=>'+'+l).join('\n'));
   else {const anchor=q.records[q.records.indexOf(rec)-1];assert(anchor);const tail=lines(anchor).slice(-3);
    patches.push('*** Update File: '+qp+'\n@@\n'+tail.map(l=>' '+l).join('\n')+'\n-    }\n+    },\n+    {\n'+lines(rec).map(l=>'+'+l).join('\n')+'\n+    }');}
  }
 }
}
assert(adopted.length===records.length);
assert(!fs.existsSync(receiptPath),receiptPath);
const receipt={schemaVersion:1,artifactType:'current-image-adoption-receipt',aggregatePaths,images:adopted};
patches.push('*** Add File: '+receiptPath+'\n'+(JSON.stringify(receipt,null,2)+'\n').trimEnd().split('\n').map(l=>'+'+l).join('\n'));
const seen=new Set();
const body=patches.join('\n').replace(/^\*\*\* Update File: (.*)\n/gm,(line,file)=>{if(seen.has(file))return '';seen.add(file);return line;});
console.log(JSON.stringify({patch:'*** Begin Patch\n'+body+'\n*** End Patch',count:adopted.length,receipt}));
