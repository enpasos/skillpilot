import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
const prefix = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-042r-current-keep6-v1"
const raw = fs.readFileSync(prefix + '.candidates.json')
const candidates = JSON.parse(raw)
assert.equal(candidates.goals.length, 6)
assert.equal(candidates.goals.flatMap(g => g.profile.applicationCaseBriefs).length, 12)
const near = (actual, expected, tolerance = 1e-9) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} != ${expected}`)
const simpson = (f, a, b, n = 10000) => { const h=(b-a)/n; let s=f(a)+f(b); for(let i=1;i<n;i++)s+=(i%2?4:2)*f(a+i*h); return s*h/3 }
near(simpson(x=>(3+x/5)**2,0,10),490/3)
near(simpson(x=>(2+x/10)**2-(1.5+x/10)**2,0,10),45/2)
const N=t=>50+10*t*Math.exp(-t/2), Nd=t=>10*Math.exp(-t/2)*(1-t/2)
near(N(2),50+20/Math.E); near(Nd(2),0)
assert.ok(N(0)<N(2) && N(6)<N(2) && Nd(1)>0 && Nd(3)<0)
const v=t=>1.5*Math.PI*Math.cos(Math.PI*t/2)
near(v(1),0);near(v(3),0);near(v(2),-1.5*Math.PI)
assert.ok(v(.5)>0 && v(2)<0 && v(3.5)>0)
near(50-40/Math.E,35.28482235314231)
for(const t of [0,1,4,10,100]) {assert.ok(50-40*Math.exp(-t/4)<50);assert.ok(20+60*Math.exp(-t/10)>20)}
const E=t=>10*2**t,B=t=>80-70*2**(-t),L=t=>80/(1+7*2**(-t))
near(E(0),10);near(B(0),10);near(L(0),10);near(L(Math.log2(7)),40)
assert.ok(B(2)-B(1)<B(1)-B(0));assert.ok(L(2)-L(1)>L(1)-L(0))
near(24/20,1.2);near(28.8/24,1.2)
const k=Math.log(3)/3, logistic=t=>600/(1+3*Math.exp(-k*t))
near(logistic(0),150);near(logistic(3),300);near(600*k/4,50*Math.log(3))
near(600/450-1,1/3);near(Math.log(1/3)/k,-3)
const late=t=>600/(1+(1/3)*Math.exp(-k*t))
assert.ok(late(0)<late(1) && late(2)-late(1)<late(1)-late(0))
near(simpson(x=>2*x**3*Math.exp(x*x),0,1),1)
near(simpson(x=>x*Math.log(x)**2,1,Math.E),(Math.E**2-1)/4)
const H=x=>x*x*Math.log(x)**2/2-x*x*Math.log(x)/2+x*x/4
near(H(Math.E)-H(1),(Math.E**2-1)/4)
console.log(JSON.stringify({candidateSha256:crypto.createHash('sha256').update(raw).digest('hex'),profiles:6,cases:12,arithmetic:'PASS',scope:'Read-only arithmetic checks supplement the actual complete author-side body review. They do not grant independent-review or human authority.'}))
