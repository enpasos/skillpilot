import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const prefix = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-045-current-keep7-v1"
const hash = p => createHash('sha256').update(readFileSync(p)).digest('hex')
assert.equal(hash(prefix+'.candidates.json'),'4d27c2beb99e598198869bc2be58a2350263cacea03450cf069dc2154d86dfe4')
const candidates=JSON.parse(readFileSync(prefix+'.candidates.json','utf8'))
assert.equal(candidates.goals.length,7)
assert.ok(candidates.goals.every(g=>g.profile.applicationCaseBriefs.length===2))
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10, a+' != '+b)
const mm=(A,B)=>A.map(row=>B[0].map((_,j)=>row.reduce((s,a,k)=>s+a*B[k][j],0)))
const matrixNear=(A,B)=>A.forEach((r,i)=>r.forEach((v,j)=>near(v,B[i][j])))
const mv=(A,v)=>mm(A,v.map(x=>[x])).map(r=>r[0])
// Parameter cases: vertical scale versus horizontal placement.
for(const a of [.5,1]){near(a*(4-4),0);near(a*4,a===.5?2:4)}
for(const b of [0,2]){near(9-((b-3)-b)**2,0);near(9-((b+3)-b)**2,0);near((b+3)-(b-3),6)}
// Derivative identities from individually worked product/chain cases.
for(const x of [-2,-.5,0,1,3]){
 near(2*x*(x+2)+(x*x-1),3*x*x+4*x-1)
 near(Math.exp(x)+(x-1)*Math.exp(x),x*Math.exp(x))
 near(4*(3*x-2)**3*3,12*(3*x-2)**3)
 near(3*4*x**3,12*x**3)
 near(-2*x*Math.exp(-x*x),Math.exp(-x*x)*(-2*x))
}
// Independently fixed tabular mappings and graph outgoing totals.
assert.deepEqual([[0,18],[5,21],[10,25]][1],[5,21])
assert.equal([[0,18],[5,21],[10,25]][2][1],25)
assert.deepEqual([[2,7],[19,24]].map(r=>r[1]),[7,24])
for(const row of [[.8,.2],[.3,.7],[.5,.5,0],[0,.25,.75],[1,0,0]])near(row.reduce((a,b)=>a+b,0),1)
const M=[[.6,.1],[.4,.9]],M2=[[.4,.15],[.6,.85]]
matrixNear(mm(M,M),M2);near(.1*.6+.9*.1,.15)
const C=[[0,0,1],[1,0,0],[0,1,0]]
matrixNear(mm(C,C),[[0,1,0],[0,0,1],[1,0,0]])
matrixNear(mm(mm(C,C),C),[[1,0,0],[0,1,0],[0,0,1]])
assert.deepEqual(mv(C,[1,0,0]),[0,1,0])
near(mv(M,[.2,.8])[0],.2);near(mv(M,[.2,.8])[1],.8)
const S=[[0,1],[1,0]]
matrixNear(mm([[.5,.5]],S),[[.5,.5]])
matrixNear(mm([[1,0]],S),[[0,1]])
matrixNear(mm(S,S),[[1,0],[0,1]])
for(const a0 of [0,.2,.7,1])for(const n of [0,1,2,5,10]){
 const an=.2+.5**n*(a0-.2);near(.5*an+.1,.2+.5**(n+1)*(a0-.2))
}
const A=[[1,.25],[0,.75]]
let An=[[1,0],[0,1]]
for(let n=1;n<=10;n++){An=mm(A,An);matrixNear(An,[[1,1-.75**n],[0,.75**n]])}
console.log(JSON.stringify({status:'PASS',goalCount:7,caseCount:14,candidateSha256:hash(prefix+'.candidates.json'),ledgerSha256:hash(prefix+'.review.jsonl'),scope:'Arithmetic/representation checks only; does not replace full bilingual subject body review or grant approval.'}))
