#!/usr/bin/env node
// Read-only author checks. Finite arithmetic checks do not prove general
// convergence arguments and do not constitute learner-performance evidence.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ownPath=fileURLToPath(import.meta.url);
const prefix=ownPath.replace(/\.author-check\.mjs$/, '');
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const config=read(prefix+'.config.json');
const candidates=read(prefix+'.candidates.json');
const root=resolve(new URL('../../../../../',import.meta.url).pathname);
const require=createRequire(resolve(root,'app/package.json'));
const Ajv2020=require('ajv/dist/2020').default;
const addFormats=require('ajv-formats').default;
const ajv=new Ajv2020({allErrors:true,strict:false});
addFormats(ajv);
const recordSchema=read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'));
const configSchema=read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'));
const validateConfig=ajv.compile(configSchema);
assert.ok(validateConfig(config),JSON.stringify(validateConfig.errors));
const profileSchema={$schema:recordSchema.$schema,$defs:recordSchema.$defs,...recordSchema.properties.profile};
const validateProfile=ajv.compile(profileSchema);
assert.equal(candidates.schemaVersion,1);
assert.equal(candidates.authoringContract,'positive-understanding-evidence-candidates-v1');
assert.equal(candidates.reviewId,config.reviewId);
assert.equal(candidates.goals.length,20);
assert.deepEqual(candidates.goals.map(g=>g.goalId),config.scope.goalIds);
assert.equal(new Set(config.scope.goalIds).size,20);
assert.deepEqual(config.reviewedResourceTypes,[]);
let cases=0;
for(const g of candidates.goals){
  assert.equal(g.evidenceLevel,'E1');
  assert.equal(g.maximumClaimScope,'G1');
  assert.ok(validateProfile(g.profile),g.goalId+': '+JSON.stringify(validateProfile.errors));
  const p=g.profile,c=p.coverageExpectations;
  assert.equal(c.minimumIndependentDemonstrations,2);
  assert.equal(c.freshVariationRequired,true);
  assert.equal(c.independentTransferRequired,true);
  assert.ok(p.applicationCaseBriefs.length>=2);
  assert.equal(new Set(p.applicationCaseBriefs.map(x=>x.id)).size,p.applicationCaseBriefs.length);
  assert.ok(c.requiredExpectationIds.every(id=>p.expectations.some(e=>e.id===id)));
  cases+=p.applicationCaseBriefs.length;
}
assert.equal(cases,40);
let checks=0;
const near=(a,b,t=1e-10)=>{assert.ok(Math.abs(a-b)<=t, a+' != '+b); checks++;};
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const yes=x=>{assert.ok(x);checks++;};
const sum=a=>a.reduce((x,y)=>x+y,0);
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>i+a);
const central=(f,x,h=0.001)=>(f(x+h)-f(x-h))/(2*h);
const rf=(f,a,b)=>(a*f(b)-b*f(a))/(f(b)-f(a));
const newton=(f,df,x)=>x-f(x)/df(x);
// 01 structure: composition input order really changes the function.
near(Math.exp(2**2+2),Math.exp(6));
near((Math.exp(2)+2)**2,(Math.exp(2)+2)*(Math.exp(2)+2));
yes(Math.exp(6)!==(Math.exp(2)+2)**2);
// 02 two independent polynomial expressions and numerical checks.
for(const x of [-2,0,1,3]){
 near((x*x+1)*(x-2),x**3-2*x*x+x-2);
 near(2*x*(x-2)+(x*x+1),3*x*x-4*x+1);
 near(2*(3*x-2)*3,18*x-12);
}
near(central(x=>(x+1)*Math.exp(x),0),2.000000667,1e-9);
near(central(x=>Math.exp(2*x+1),0),5.436567281,1e-9);
// 03 derivative factors, signs, extremum.
near(central(x=>2*Math.exp(-3*x+1)+5,0,1e-5),-6*Math.E,1e-7);
near(central(x=>(3*x-2)*Math.exp(-x),1,1e-5),2/Math.E,1e-8);
near((5-3*(5/3))*Math.exp(-5/3),0);
yes((5-3)*Math.exp(-1)>0 && (5-6)*Math.exp(-2)<0);
// 04 polynomial divisions and real residual factor.
for(const x of [-3,-1,0,2,4]){
 near(x**3+x*x-4*x-4,(x+1)*(x*x-4));
 near(x**3-8,(x-2)*(x*x+2*x+4));
 near(x*x+2*x+4,(x+1)**2+3);
}
for(const r of [-2,-1,2])near(r**3+r*r-4*r-4,0);
// 05 systematic real zeros; positive quadratic remainder.
for(const x of [-3,-2,-1,0,1,2,3]){
 near(x**4-5*x*x+4,(x-1)*(x+1)*(x-2)*(x+2));
 near(x**3-3*x*x+x-3,(x-3)*(x*x+1));
 yes(x*x+1>0);
}
// 06 multiplicity: signs on both sides, including flat crossing.
const f6=x=>-((x-1)**4)*((x+2)**3);
yes(f6(-2.1)>0 && f6(-1.9)<0);
yes(f6(.9)<0 && f6(1.1)<0);
const g6=x=>-x*x*(x-3);
yes(g6(-.1)>0 && g6(.1)>0 && g6(2.9)>0 && g6(3.1)<0);
// 07 bisection interval arithmetic and exact midpoint.
near(1.5**3-5,-1.625);
near(1.75**3-5,.359375);
near((1.5+1.75)/2,1.625);
near((1.75-1.5)/2,.125);
near((-2)*((-2)-2)*((-2)+2),0);
// 08 false position, including opposite endpoint replacement.
const f8=x=>x*x-3;
near(rf(f8,1,2),5/3);
near(f8(5/3),-2/9);
near(rf(f8,5/3,2),19/11);
near(f8(19/11),-2/121);
near(rf(x=>Math.sqrt(x)-2,1,9),5);
yes(Math.sqrt(5)-2>0 && Math.sqrt(1)-2<0);
// 09 same root: approximation errors and multiple-root slowdown.
near(newton(f8,x=>2*x,2),7/4);
near(newton(f8,x=>2*x,7/4),97/56);
near(Math.abs(1.5-Math.sqrt(3)),.232051,5e-7);
near(Math.abs(1.75-Math.sqrt(3)),.017949,5e-7);
near(Math.abs(5/3-Math.sqrt(3)),.065384,5e-7);
near(Math.abs(19/11-Math.sqrt(3)),.004778,5e-7);
near(Math.abs(97/56-Math.sqrt(3)),.00009205,1e-8);
near(newton(x=>(x-1)**2,x=>2*(x-1),3),2);
near(newton(x=>(x-1)**2,x=>2*(x-1),2),1.5);
// 10 explicit arithmetic/geometric sequences and shifted start index.
eq(range(1,4).map(n=>7-3*n),[4,1,-2,-5]);
eq(range(1,4).map(n=>3*2**(n-1)),[3,6,12,24]);
eq(range(0,4).map(n=>3*(-.5)**n),[3,-1.5,.75,-.375,.1875]);
// 11 finite sum formulas; these checks do not prove limits.
near(sum(range(1,5).map(k=>3+2*(k-1))),35);
near(sum(range(1,3).map(k=>6*(1/3)**(k-1))),26/3);
for(let n=1;n<=12;n++){
 near(sum(range(1,n).map(k=>3+2*(k-1))),n*(n+2));
 near(sum(range(1,n).map(k=>6*(1/3)**(k-1))),9*(1-3**(-n)));
 near(sum(range(1,n).map(k=>3*(-.5)**(k-1))),2*(1-(-.5)**n));
}
eq([3,3-1.5,3-1.5+.75],[3,1.5,2.25]);
// 12 same finite prefix, different later rule; absolute-value identity.
eq(range(1,4).map(n=>1-2**(-n)),[.5,.75,.875,.9375]);
for(const n of [1,2,7,100])near(Math.abs((-1)**n/n),1/n);
const b12=n=>n<=4?1-2**(-n):n;
near(b12(100),100);
// 13 valid algebra before use of limit laws.
for(const n of [1,2,5,100]){
 near((3*n*n-2*n+1)/(2*n*n+n),(3-2/n+1/n**2)/(2+1/n));
 near((1/n)/(1/n+1/n**2),1/(1+1/n));
}
eq(range(1,4).map(n=>1+(-1)**n),[0,2,0,2]);
// 14 explicit indices and domain.
eq(range(0,3).map(n=>(-1)**n*(n+1)),[1,-2,3,-4]);
near((-1)**100*101,101);
eq(range(3,6).map(n=>n/(n-2)),[3,2,5/3,1.5]);
near(20/18,10/9);near(7/5,1.4);
// 15 recursions, initialization and exact Newton-type fractions.
const F=[2,1];for(let n=0;n<4;n++)F.push(F[n+1]+F[n]);
eq(F,[2,1,3,4,7,11]);
near(.5*(2+3/2),7/4);
near(.5*(7/4+3/(7/4)),97/56);
near(.5*(97/56+3/(97/56)),18817/10864);
// 16 candidate formation laws and their recursive equivalence.
eq(range(1,6).map(n=>n*n+1),[2,5,10,17,26,37]);
eq(range(1,7).map(n=>1+2**(n-1)),[2,3,5,9,17,33,65]);
for(let n=1;n<8;n++)near(1+2**n,2*(1+2**(n-1))-1);
// 17 identities underpinning the written universal arguments.
for(const n of [1,2,10,100]){
 near((n+1)/(n+2)-n/(n+1),1/((n+1)*(n+2)));
 near(n/(n+1),1-1/(n+1));
 near(Math.abs(2+(-1)**n/n-2),1/n);
 yes(1<=2+(-1)**n/n && 2+(-1)**n/n<=2.5);
}
eq(range(1,4).map(n=>2+(-1)**n/n),[1,2.5,5/3,2.25]);
// 18 summands versus partial sums and start index.
eq(range(1,4).map(n=>sum(range(1,n).map(k=>2*k-1))),[1,4,9,16]);
eq(range(0,3).map(n=>sum(range(0,n).map(k=>(-1)**k))),[1,0,1,0]);
// 19 dyadic blocks and finite-prefix identity, not a finite proof.
for(let j=1;j<=8;j++){
 const block=range(2**(j-1)+1,2**j);
 eq(block.length,2**(j-1));
 yes(sum(block.map(k=>1/k))>=.5);
}
for(const n of [101,128,256]){
 near(sum(range(101,n).map(k=>1/k)),
      sum(range(1,n).map(k=>1/k))-sum(range(1,100).map(k=>1/k)));
}
// 20 geometric formula and boundary values.
for(let n=0;n<12;n++){
 near(sum(range(0,n).map(k=>5*(2/5)**k)),25/3*(1-(2/5)**(n+1)));
 near(sum(range(0,n).map(k=>2*(-.5)**k)),4/3*(1-(-.5)**(n+1)));
 near(sum(range(0,n).map(k=>2*2**k)),2*(2**(n+1)-1));
}
eq(range(0,3).map(n=>sum(range(0,n).map(k=>2*(-1)**k))),[2,0,2,0]);
console.log(JSON.stringify({status:'pass',profiles:20,applicationCases:cases,numericalAndStructuralAssertions:checks,configSchema:'native-v2',profileSchema:'native-v2-profile',binding:'not-materialized-by-this-check',authority:'ai_candidate; needs_human_review; no learner evidence'}));

