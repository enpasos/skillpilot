// Recoverable, explicit backup before replacing the four existing active images.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const base=path.dirname(new URL(import.meta.url).pathname);
const adoption=JSON.parse(fs.readFileSync(path.join(base,'existing-goals-v2.adoption-receipt.json'),'utf8'));
const sha=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const out=path.join(base,'previous-existing-case-images-v2');
const receiptPath=path.join(out,'receipt.json');
if(fs.existsSync(receiptPath)){
  const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
  for(const f of receipt.files)assert.equal(sha(f.archive),f.sha256);
  console.log(JSON.stringify({status:'PASS_EXISTING_ARCHIVE',files:receipt.files.length}));
}else{
  const files=[];
  for(const g of adoption.archive.goals){
    const link=g.resourceLinks.find(l=>l.type==='goal-visualization');
    const source='curricula/DE/Gymnasium/visualizations/physik/'+g.id;
    assert.equal(link.url,'/assets/goal-visualizations/physik/'+g.id+'/'+g.id+'.jpg');
    for(const name of [g.id+'.jpg','prompt.de.md','image-reconstruction-prompt.de.md']){
      const input=path.join(source,name);if(!fs.existsSync(input))continue;
      const archive=path.join(out,g.id,name);assert.equal(fs.existsSync(archive),false);
      fs.mkdirSync(path.dirname(archive),{recursive:true});fs.copyFileSync(input,archive);assert.equal(sha(input),sha(archive));
      files.push({source:input,archive:path.relative(process.cwd(),archive),sha256:sha(archive)});
    }
  }
  const receipt={artifactType:'four-existing-diffraction-image-preservation-v2',createdAt:new Date().toISOString(),scope:'Exact prior active image/prompt bytes; no approval of their content',files};
  fs.writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({status:'ARCHIVED_AND_VERIFIED',files:files.length}));
}
