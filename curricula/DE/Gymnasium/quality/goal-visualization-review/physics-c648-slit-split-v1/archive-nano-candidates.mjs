// Mechanical, append-only archive of the actual provider requests and outputs.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const base=path.dirname(new URL(import.meta.url).pathname);
const root=process.cwd();
const hash=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const jobs=[
 ['55dbede5-2fee-51e7-ac13-e3b0227c502e','double-slit','2026-09-07T01-51-01-365Z'],
 ['df4acb52-b700-5b44-bc1e-11d73f24d061','grating','2026-09-07T01-51-04-733Z'],
 ['6e4faa1f-bccf-574e-bdb9-544f44c1d7f7','single-slit','2026-09-07T01-51-08-476Z'],
];
const entries=[];
for(const [id,name,stamp]of jobs){
 const temp=path.join(root,'tmp/goal-visualizations',id),dest=path.join(base,'nano-candidate-1',name),prefix=id+'.generated.'+stamp+'.';
 const append=fs.readFileSync(path.join(base,name+'.prompt.de.md'),'utf8').trim();
 const request=fs.readFileSync(path.join(temp,'nano-banana-request.json'),'utf8');
 assert(JSON.stringify(JSON.parse(request)).includes(JSON.stringify(append).slice(1,-1)),'Prompt was not actually transmitted');
 const files=[...fs.readdirSync(path.join(temp,'generated')).filter(f=>f.startsWith(prefix)).map(f=>path.join(temp,'generated',f)),...['nano-banana-request.json','nano-banana-response-summary.json','nano-banana-prompt.de.md'].map(f=>path.join(temp,f)),path.join(base,name+'.prompt.de.md')];
 assert(files.some(f=>f.endsWith('.jpg')));assert(files.some(f=>f.endsWith('.image-reconstruction-prompt.de.md')));
 fs.mkdirSync(dest,{recursive:true});
 const archived=files.map(p=>{const out=path.join(dest,path.basename(p));if(fs.existsSync(out))assert.equal(hash(out),hash(p));else fs.copyFileSync(p,out);return{path:path.relative(root,out),sha256:hash(out),bytes:fs.statSync(out).size};});
 entries.push({goalId:id,case:name,promptAppendVerified:true,files:archived});
}
const receipt={schemaVersion:1,operation:'archive_only',provider:'Google Gemini / Nano Banana Pro (gemini-3-pro-image)',humanApprovalClaimed:false,canonicalImportPerformed:false,entries};
const p=path.join(base,'nano-candidate-1/archive-receipt.json');
const body=JSON.stringify(receipt,null,2)+'\n';if(fs.existsSync(p))assert.equal(fs.readFileSync(p,'utf8'),body);else fs.writeFileSync(p,body);
console.log(JSON.stringify({receipt:path.relative(root,p),sha256:hash(p),images:entries.map(e=>({goalId:e.goalId,...e.files.find(f=>f.path.endsWith('.jpg'))}))},null,2));
