import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const paths=[
  "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1/1b664036-3c29-5d94-9f42-97069aaa2c53/candidate-3/independent-ai-review-v2.json",
  "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1/df5eeadd-414e-50ae-84ec-7e5dbf7449d6/candidate-3/independent-ai-review-v2.json",
  "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-series-split-v1/630bb145-9a3f-5c88-ab5a-fb69a9bb76e4/candidate-2/independent-ai-review-v2.json",
  "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-integrals-and-series-v1/independent-candidate-review-v2.json",
  "curricula/DE/Gymnasium/quality/goal-visualization-review/math-b040-series-split-v1/independent-candidate-review-v2.json"
];
const hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
let viewedImages=0,archiveFiles=0,rejected=0,accepted=0;
const aggregates=[];
for(const p of paths){
 const r=JSON.parse(fs.readFileSync(p,'utf8'));
 if(r.records){assert.equal(r.counts.reviewed,r.records.length);aggregates.push({path:p,sha256:hash(p),counts:r.counts});continue;}
 assert.equal(r.image.actuallyViewed,true);assert.equal(hash(r.image.path),r.image.sha256);
 assert.equal(hash(r.archiveReceipt.path),r.archiveReceipt.sha256);
 const a=JSON.parse(fs.readFileSync(r.archiveReceipt.path,'utf8'));
 for(const f of a.candidateFiles){assert.equal(hash(f.path),f.sha256);archiveFiles++;}
 assert.equal(r.reviewer.humanApproval,false);assert.equal(r.scope.activeAssetsChanged,false);
 viewedImages++;if(r.decision==='accept')accepted++;else if(r.decision==='reject')rejected++;else assert.fail('Unexpected decision');
}
assert.equal(viewedImages,3);assert.equal(archiveFiles,24);assert.equal(accepted,2);assert.equal(rejected,1);
let arithmeticAssertions=0;
const eq=(a,b)=>{arithmeticAssertions++;assert.equal(a,b);};
const approx=(a,b,tol)=>{arithmeticAssertions++;assert(Math.abs(a-b)<tol);};
eq(1+.5+.5**2/2,1.625);
approx(1+.5+.5**2/2+.5**3/6,1.645833,.0000005);
approx(Math.exp(.5),1.648721,.0000005);
approx(Math.exp(.5)-1.625,.023721,.0000005);
approx(Math.exp(.5)-(1+.5+.5**2/2+.5**3/6),.002888,.0000005);
eq((1+3)*2/2,4);
approx(Math.sqrt(7/3),1.53,.005);
eq(-((1-1)**2)+3,3);
eq((3+9)+(5+7),24);
eq(4/2*(2*3+3*2),24);
eq([3,5,7,9].reduce((a,b)=>a+b),24);
console.log(JSON.stringify({checkedAt:new Date().toISOString(),result:'PASS',viewedImages,archiveFiles,accepted,rejected,arithmeticAssertions,aggregates},null,2));

