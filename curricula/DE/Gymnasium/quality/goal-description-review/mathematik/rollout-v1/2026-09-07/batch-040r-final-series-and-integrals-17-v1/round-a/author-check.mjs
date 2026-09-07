import assert from 'node:assert/strict';
let checks=0;const eq=(a,b)=>{assert(Math.abs(a-b)<1e-10);checks++};
const sum=a=>a.reduce((s,v)=>s+v,0);
eq(sum([5,3,1]),9);eq(6*3-3**2,9);eq(6-3+1.5,4.5);eq(6/(1+.5),4);
eq(1-.5+1/3-.25,7/12);eq(5/(1+.25),4);
eq(12+7.2+4.32,23.52);eq(12/(1-.6),30);eq(30-23.52,6.48);
eq(1+.4+.4**2/2,1.48);eq(1+.4+.4**2/2+.4**3/6,1.4906666666666666);
eq(.5*sum([0,.25,1,2.25]),1.75);eq(.5*sum([.25,1,2.25,4]),3.75);eq((1.75+3.75)/2,2.75);
eq(3**2,9);eq(4+9,13);eq(10-2*3,4);eq(10+4*3-3**2,13);eq(10+4*2-2**2,14);eq(1+2**2,5);
eq(3*(0-1),-3);eq(3*(3-1),6);eq(1**2/2-1,-.5);eq(2**2/2-2,0);
eq(4*1-2*3,-2);eq(1*1-2*1,-1);
for(const x of [-2,-1,.5,2]){const h=1e-5;const F=t=>2*t**3-2*Math.exp(t)-3*Math.cos(t);assert(Math.abs((F(x+h)-F(x-h))/(2*h)-(6*x*x-2*Math.exp(x)+3*Math.sin(x)))<1e-7);checks++;}
for(const x of [-3,-2,-1]){const h=1e-5;const F=t=>-(t**-2)+Math.sin(t);assert(Math.abs((F(x+h)-F(x-h))/(2*h)-(2*x**-3+Math.cos(x)))<1e-7);checks++;}
console.log(JSON.stringify({status:'PASS',arithmeticAssertions:checks,scope:'Author-side numerical cross-checks only; no learner evidence and no semantic bulk decision'}));
