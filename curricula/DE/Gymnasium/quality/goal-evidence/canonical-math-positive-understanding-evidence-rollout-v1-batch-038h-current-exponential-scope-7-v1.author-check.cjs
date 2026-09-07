// Read-only checks for the seven individually reviewed current-context candidates.
const fs=require('node:fs'), assert=require('node:assert/strict'), crypto=require('node:crypto');
const prefix=__filename.replace('.author-check.cjs','');
const bytes=fs.readFileSync(prefix+'.candidates.json'), set=JSON.parse(bytes);
assert.equal(set.goals.length,7);
for(const g of set.goals) {
  assert.equal(g.evidenceLevel,'E1'); assert.equal(g.maximumClaimScope,'G1');
  assert(!g.goalFingerprint && !g.reviewInputFingerprint && !g.status);
  const p=g.profile;
  assert.deepEqual(p.coverageExpectations.requiredExpectationIds,p.expectations.map(e=>e.id));
  assert.equal(p.coverageExpectations.minimumIndependentDemonstrations,2);
  assert(p.coverageExpectations.freshVariationRequired && p.coverageExpectations.independentTransferRequired);
  assert.equal(p.applicationCaseBriefs.length,2);
}
let assertions=0; const cases=[];
const eq=(a,b,tol=1e-10)=>{assert(Math.abs(a-b)<=tol,`${a} != ${b}`);assertions++};
const yes=a=>{assert(a);assertions++};
const check=(goal,caseId,fn)=>{const g=set.goals.find(x=>x.goalId.startsWith(goal));assert(g.profile.applicationCaseBriefs.some(c=>c.id===caseId));fn();cases.push({goalId:g.goalId,caseId});};
check('781f133a','ratio-table',()=>{eq(75/50,1.5);eq(112.5/75,1.5);eq(50+25*2,100);eq(50*1.5**2,112.5);yes(75-50!==112.5-75);});
check('781f133a','three-hour-decay',()=>{eq(160*.5**(3/3),80);eq(160*.5**(6/3),40);yes(160*.5**3!==80);});
check('346efb31','root-two-growth',()=>{eq(Math.SQRT2**2,2);eq(12*Math.SQRT2**4,48);eq(24*Math.SQRT2**2,48);});
check('346efb31','two-hour-table',()=>{eq(20/80,.25);eq(5/20,.25);eq(Math.sqrt(.25),.5);eq(80*.5,40);});
check('628928a6','value-and-slope',()=>{eq(Math.exp(0),1);eq(Math.exp(1),2.71828,.000005);for(const x of [-2,0,1,3]){const h=1e-5;eq((Math.exp(x+h)-Math.exp(x-h))/(2*h),Math.exp(x),1e-8);yes(Math.exp(x)>0);}});
check('628928a6','negative-input-and-asymptote',()=>{eq(Math.exp(3)*Math.exp(-3),1);eq(Math.exp(-3),1/Math.exp(3));yes(Math.exp(-30)>0&&Math.exp(-30)<Math.exp(-3));});
check('f05acdc5','continuous-growth',()=>{eq(100*Math.exp(.2*3),182.212,.0005);eq(Math.log(2)/.2,3.466,.0005);eq(Math.exp(.693147),2,.000001);eq(100*(Math.exp(.2)-1),22.14,.005);});
check('f05acdc5','half-life-model',()=>{const k=-Math.log(2)/3;eq(k,-.23105,.000005);eq(240*Math.exp(k*3),120);eq(240*Math.exp(k*4.5),84.853,.0005);eq(Math.exp(-.693147),.5,.000001);});
check('d900e0a4','first-whole-year',()=>{const t=Math.log(1.5)/Math.log(1.1);eq(t,4.25416,.000005);eq(200*1.1**t,300);eq(200*1.1**4,292.82);eq(200*1.1**5,322.102);yes(200*1.1**4<300&&200*1.1**5>300);yes(1.1**(1.5/1.1)!==1.5);});
check('d900e0a4','decay-and-negative-time',()=>{const t=Math.log(.25)/Math.log(.8);eq(t,6.21257,.000005);eq(80*.8**t,20);eq(Math.log(1.25)/Math.log(.8),-1);eq(80*.8**-1,100);yes(Math.log(.8)<0&&80*.8**0<100);});
check('ab720928','validated-model-forecast',()=>{eq(Math.sqrt(90/40),1.5);eq(40*1.5**4,202.5);eq(40*1.5**6,455.625);});
check('ab720928','missing-origin-and-conflict',()=>{eq(Math.sqrt(64/100),.8);eq(100/.8,125);eq(125*.8**5,40.96);eq(125*.8**7,26.2144);yes(125*.8**5!==50);});
check('49f9059a','quadratic-versus-exponential',()=>{for(const x of [1,2,5,10,20])yes(0<=x*x/Math.exp(x)&&x*x/Math.exp(x)<=6/x);yes(6/1000<6/100);});
check('49f9059a','negative-direction-product',()=>{for(const t of [1,2,5,10,20]){yes(t**3/Math.exp(t)<=24/t);yes((-t)**3*Math.exp(-t)<0);}yes(24/1000<24/100);});
assert.equal(cases.length,14);
// The asymptotic arguments use the supplied all-positive bounds and the squeeze
// theorem; finite numeric samples above are arithmetic checks, not their proof.
console.log(JSON.stringify({status:'PASS',candidateSha256:'sha256:'+crypto.createHash('sha256').update(bytes).digest('hex'),profiles:7,cases:14,numericAssertions:assertions,checkedCases:cases,authority:'ai_candidate',humanApprovalClaimed:false},null,2));
