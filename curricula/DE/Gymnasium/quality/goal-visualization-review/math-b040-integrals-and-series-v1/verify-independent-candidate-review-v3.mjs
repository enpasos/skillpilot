import fs from 'node:fs';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const base="curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1/1b664036-3c29-5d94-9f42-97069aaa2c53",root="curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1";
const hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
let archiveFiles=0;
for(const n of [4,5]){
 const p=base+'/candidate-'+n+'/archive-receipt.json',a=JSON.parse(fs.readFileSync(p,'utf8'));
 for(const f of a.candidateFiles){assert.equal(hash(f.path),f.sha256);archiveFiles++;}
 const r=JSON.parse(fs.readFileSync(base+'/candidate-'+n+'/nano-banana-request.json','utf8'));
 const text=r.input.filter(b=>b.type==='text').map(b=>b.text).join('\n');
 assert.equal(text,a.actualRequestText);
 const ref='sha256:'+crypto.createHash('sha256').update(Buffer.from(r.input.find(b=>b.type==='image').data,'base64')).digest('hex');
 assert.equal(ref,a.referenceImageSha256);
 if(n===4){assert(a.promptProvenance.cliIgnoredNotApplied);assert(!a.promptProvenance.appendApplied);assert(!text.includes('Zusatzanweisung:'));}
 else{assert(a.promptProvenance.appendApplied);assert(text.includes(fs.readFileSync(base+'/candidate-5/attempt-5.prompt.de.md','utf8').trim()));assert(text.includes('Bei x = 1: höherer Grad → bessere Näherung'));}
}
assert.equal(archiveFiles,16);
const author=JSON.parse(fs.readFileSync(base+'/candidate-5/author-visual-check-v1.json','utf8'));
assert.equal(author.image.actuallyViewed,true);assert.equal(author.reviewer.independentOfGeneration,false);assert.equal(author.decision,'needs_independent_review');
const bad=JSON.parse(fs.readFileSync(base+'/candidate-4/independent-ai-review-v3.json','utf8'));assert.equal(bad.decision,'reject');assert.equal(bad.image.actuallyViewed,true);
const e=Math.exp(1),vals=[1,2,2.5,1+1+.5+1/6];let assertions=0;
for(let i=1;i<vals.length;i++){assert(e-vals[i]<e-vals[i-1]);assertions++;}
assert(Math.abs(1-Math.exp(-3))<Math.abs(-2-Math.exp(-3)));assertions++;
const aggregate=root+'/independent-candidate-review-v3.json';
console.log(JSON.stringify({checkedAt:new Date().toISOString(),result:'PASS',viewedImages:2,archiveFiles,arithmeticAssertions:assertions,effectivePromptsVerified:2,unappliedPromptDocumented:true,authorNotIndependentDocumented:true,aggregate:{path:aggregate,sha256:hash(aggregate)},candidate5:{path:author.image.path,sha256:hash(author.image.path)}},null,2));

