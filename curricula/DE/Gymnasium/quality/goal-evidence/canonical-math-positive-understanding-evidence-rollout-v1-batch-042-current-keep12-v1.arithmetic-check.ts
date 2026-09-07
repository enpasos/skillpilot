import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const prefix = 'curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-042-current-keep12-v1'
const candidateBytes = readFileSync(prefix + '.candidates.json')
const set = JSON.parse(candidateBytes.toString())
const checked: string[] = []
const near = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`)
const samples = [-2, -0.5, 0, 0.75, 2]
// Bounded independent arithmetic spot-checks of the explicitly authored case
// equations. These do not parse natural language, prove pedagogy, or confer
// approval; the separate body audit binds the inspected candidate bytes.
function check(caseId: string, test: () => void) {
  assert.equal(set.goals.flatMap((g: any) => g.profile.applicationCaseBriefs).filter((c: any) => c.id === caseId).length, 1)
  test()
  checked.push(caseId)
}
check('stock-versus-growth-rate', () => { const n=(t:number)=>20+6*t*t-t*t*t; near(n(4),52); near(n(0),20); near(n(5),45); near(12*2-3*4,12) })
check('position-and-reversal', () => { const v=(t:number)=>3*(t-1)*(t-3); near(v(1),0); near(v(3),0); near(v(2),-3); assert.ok(v(0.5)>0 && v(2)<0 && v(3.5)>0) })
check('net-flow-and-final-stock', () => { near(4*3-9,3); near(10+3,13); near(4-1,3) })
check('displacement-versus-distance', () => { near(9/2-3,1.5); near(0.5+2,2.5) })
check('visitor-model-validity', () => { const n=(t:number)=>1000+300*t-20*t*t; near(n(7.5),2125); near(n(0),1000); near(n(15),1000); near(n(20),-1000) })
check('capacity-breaks-filling-model', () => { near(8+3*2,14); near(8+3*(2/3),10); assert.ok(14>10) })
check('verify-product-candidate', () => samples.forEach(x=>near(Math.exp(x)+x*Math.exp(x),(x+1)*Math.exp(x))))
check('verify-composition-and-constant', () => { const f=(x:number)=>2*x*Math.exp(x*x); near(f(0)+2*0,f(0)); assert.notEqual(f(1)+2,f(1)); samples.forEach(x=>near(Math.exp(x*x)*2*x,f(x))) })
check('infer-saturation-from-growth-data', () => [20,40,50].forEach((y,t)=>near(60-40*0.5**t,y)))
check('infer-ambient-limit-from-cooling', () => [80,50,35].forEach((y,t)=>near(20+60*0.5**t,y)))
check('interpret-saturation-limit', () => { near(1200-1000,200); assert.ok(1200-1000*Math.exp(-3)<1200 && 300*Math.exp(-3)>0) })
check('same-initial-trend-different-futures', () => { near(200,1200-1000); near(200*0.1,1000*0.02); assert.ok(200*Math.exp(10)>1200 && 1200-1000*Math.exp(-2)<1200) })
check('parameter-controls-time-and-height', () => [0.5,1,3].forEach(a=>{ const f=(t:number)=>t*Math.exp(-a*t); near(f(1/a),1/(a*Math.E)); near(Math.exp(-1)*(1-a/a),0); assert.ok(f(1/a)>f(0)) }))
check('changed-polynomial-and-parameter-boundary', () => { [0.5,2].forEach(a=>near((2/a)**2*Math.exp(-2),4/(a*a*Math.E**2))); for(const a of [-1,0]) assert.ok(2*Math.exp(-2*a)*(2-2*a)>0) })
check('catenary-shape-at-fixed-low-point', () => { const y=(x:number,a:number)=>a*Math.cosh(x/a)-a; near(y(0,2),0); near(y(2,2),y(-2,2)); near(y(2,2),1.0861612696304874); near(y(2,4),0.5105038608255232); assert.ok(y(2,2)>y(2,4)) })
check('shifted-axis-and-unequal-supports', () => { const y=(x:number)=>3*Math.cosh((x-1)/3)-3; near(y(1),0); near(y(-2),3*(Math.cosh(1)-1)); near(y(7),3*(Math.cosh(2)-1)); assert.ok(y(-2)<y(7)); near((-2+7)/2,2.5) })
check('interpret-bell-parameters', () => { const c=(x:number)=>4*Math.exp(-(((x-2)/3)**2)); near(c(2),4); near(c(-1),4/Math.E); near(c(5),4/Math.E) })
check('infer-shift-and-width-from-observations', () => { const c=(x:number)=>4*Math.exp(-(((x+1)/6)**2)); near(c(-1),4); near(c(-7),4/Math.E); near(c(5),4/Math.E) })
check('linear-coefficient-ansatz', () => samples.forEach(x=>near(3+3*x-5,3*x-2)))
check('quadratic-ansatz-adaptation', () => samples.forEach(x=>near(2*x+x*x+3,x*x+2*x+3)))
check('justify-linear-family-with-chain-factor', () => samples.forEach(x=>near(2+3*(2*x-1/3),6*x+1)))
check('justify-quadratic-with-negative-chain-factor', () => samples.forEach(x=>near((-2*x-2)-(-x*x-2*x-1),x*x-1)))
check('parts-with-exponential-factor', () => near((0.5-0.25)*Math.exp(2)-(-0.25),(Math.exp(2)+1)/4))
check('hidden-factor-in-logarithm', () => near((Math.E*Math.log(Math.E)-Math.E)-(Math.log(1)-1),1))
assert.equal(checked.length,24)
assert.equal(set.goals.length,12)
console.log(JSON.stringify({candidateDigest:'sha256:'+createHash('sha256').update(candidateBytes).digest('hex'),checkedCaseCount:checked.length,checkedCases:checked,claim:'Arithmetic spot-check only; no automatic pedagogical or human approval.'}))
