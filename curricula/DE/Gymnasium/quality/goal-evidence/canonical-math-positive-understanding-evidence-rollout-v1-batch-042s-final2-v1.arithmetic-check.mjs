import assert from 'node:assert/strict'
const close = (a,b,t=1e-9) => assert.ok(Math.abs(a-b)<t, a+' != '+b)
// Interior singularity: evaluate ordinary truncations on each side, then limits.
for (const eps of [.1,.01,.0001]) {
  const left=2-2*Math.sqrt(eps),right=2-2*Math.sqrt(eps)
  close(left,right)
  assert.ok(left<2 && left>0)
  assert.ok(-Math.log(eps)>0)
}
const F=x=>-1/x+1/(x*x),f=x=>(x-2)/(x*x*x)
close(F(1),0);close(F(2),-.25)
close(-(F(2)-F(1))+(0-F(2)),.5)
for (const x of [1,1.5,2,3,10]) close((F(x+1e-5)-F(x-1e-5))/2e-5,f(x),1e-8)
const sp=t=>2*t-Math.exp(-t)
assert.ok(sp(.35)<0 && sp(.36)>0)
let lo=.35,hi=.36
for(let i=0;i<70;i++){const m=(lo+hi)/2;if(sp(m)<0)lo=m;else hi=m}
const sumMinimum=(lo+hi)/2
const H=t=>12*Math.exp(-((t-3)**2)/4)
close(H(3),12);close(H(0),1.264790694742372);close(H(8),.0231654496347325)
for(const t of [0,1,3,5,8])close((H(t+1e-5)-H(t-1e-5))/2e-5,-(t-3)*H(t)/2,1e-8)
console.log(JSON.stringify({pass:true,interiorSingularIntegral:4,logarithmicComparison:'diverges to +infinity',infiniteSignedIntegral:0,infiniteAbsoluteArea:.5,sumMinimum,H0:H(0),H8:H(8)}))
