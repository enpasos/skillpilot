import assert from 'node:assert/strict';
let n=0;const eq=(a,b)=>{assert(Math.abs(a-b)<1e-10);n++};
eq(7+(3**2+10)-(1**2+10),15);eq(3*(2-1)-2*4,-5);
eq((2**2-2**3/3)-0,4/3);eq(.5+2,2.5);eq(2-.5,1.5);
eq(3**2+3,12);eq((-4)**2-4,12);eq(5+6*(2**2)/2,17);
eq((4*2+2**3/3)/2,16/3);eq((8-4)/2,2);eq((9*3-3**3/3)/3,6);eq((0-9)/3,-3);
eq(3*3**2+4*3,39);eq(20+39,59);eq(2*2-2**2,0);
eq(3**2/2+3,15/2);eq(3**2/2,9/2);eq(4/3,1.3333333333333333);eq(2**3/3,8/3);
for(const x of [.2,.7,1.1]){const h=1e-6,F=t=>2*(3*t+1)**1.5/9;assert(Math.abs((F(x+h)-F(x-h))/(2*h)-Math.sqrt(3*x+1))<1e-7);n++;}
for(const x of [1,2,3]){const h=1e-6,F=t=>Math.exp(t*t-4*t+7);assert(Math.abs((F(x+h)-F(x-h))/(2*h)-(2*x-4)*Math.exp(x*x-4*x+7))<1e-5);n++;}
for(const x of [-1,.5,2]){const h=1e-6,F=t=>2*t**4-3*t**2+2*t;assert(Math.abs((F(x+h)-F(x-h))/(2*h)-(8*x**3-6*x+2))<1e-7);n++;}
console.log(JSON.stringify({status:'PASS',arithmeticAssertions:n,scope:'Author numerical checks only; not learner performance, proof replacement, or semantic bulk decision'}));
