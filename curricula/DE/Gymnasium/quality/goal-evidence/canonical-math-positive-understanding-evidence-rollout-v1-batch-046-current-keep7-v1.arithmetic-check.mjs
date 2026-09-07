import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
const prefix="curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-046-current-keep7-v1"
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex')
assert.equal(hash(prefix+'.candidates.json'),'8d7e0fe4128c3757642b9b017dd897b9643f39767c3d4c283b357aeecf2bef0d')
const candidates=JSON.parse(readFileSync(prefix+'.candidates.json','utf8'))
assert.equal(candidates.goals.length,7)
assert.ok(candidates.goals.every(g=>g.profile.applicationCaseBriefs.length===2))
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,a+' != '+b)
const mm=(A,B)=>{assert.equal(A[0].length,B.length);return A.map(r=>B[0].map((_,j)=>r.reduce((s,a,k)=>s+a*B[k][j],0)))}
const mv=(A,v)=>mm(A,v.map(x=>[x])).map(r=>r[0])
const A=[[1,0],[0,-1]],B=[[1,1],[0,1]]
assert.deepEqual(mm(B,A),[[1,-1],[0,-1]])
assert.deepEqual(mm(A,B),[[1,1],[0,-1]])
assert.deepEqual(mv(B,mv(A,[2,3])),[-1,-3])
assert.deepEqual(mv(mm(A,B),[2,3]),[5,-3])
const P=[[1,0,0],[0,0,1]],C=[[0,-1],[1,0]]
assert.deepEqual(mm(C,P),[[0,0,-1],[1,0,0]])
assert.deepEqual(mv(C,mv(P,[1,2,3])),[-3,1])
assert.throws(()=>mm(P,C))
near(86/200,.43);near(40/120,1/3);near((.5+.3)/2,.4)
for(const [n,k,r,a] of [[10,7,.7,2],[100,54,.54,4],[1000,512,.512,12],[1000,510,.51,10],[2000,1040,.52,40],[10000,5050,.505,50]]){near(k/n,r);near(k-n/2,a)}
const pairs=Array.from({length:6},(_,i)=>i+1).flatMap(i=>Array.from({length:6},(_,j)=>[i,j+1]))
assert.equal(pairs.length,36)
assert.deepEqual(pairs.filter(([i,j])=>i+j>=10),[[4,6],[5,5],[5,6],[6,4],[6,5],[6,6]])
assert.equal(pairs.filter(([i,j])=>i+j===2).length,1);assert.equal(pairs.filter(([i,j])=>i+j===7).length,6)
for(const [k,n,r] of [[14,20,.7],[108,200,.54],[31,40,.775],[304,400,.76]])near(k/n,r)
near(14-20/2,4);near(108-200/2,8);near(31/40-.75,.025);near(304/400-.75,.01)
const intersect=(a,b)=>a.filter(x=>b.includes(x)),diff=(a,b)=>a.filter(x=>!b.includes(x)),union=(a,b)=>[...new Set([...a,...b])].sort((x,y)=>x-y)
let omega=[1,2,3,4,5,6],a=[2,4,6],b=[4,5,6]
assert.deepEqual(intersect(a,b),[4,6]);assert.deepEqual(union(a,b),[2,4,5,6]);assert.deepEqual(diff(a,b),[2])
assert.deepEqual(diff(omega,a),[1,3,5]);assert.deepEqual(diff(union(a,b),intersect(a,b)),[2,5])
assert.deepEqual(intersect(a,diff(omega,b)),diff(a,b))
assert.deepEqual(diff(omega,union(a,b)),[1,3]);assert.deepEqual(intersect(diff(omega,a),diff(omega,b)),[1,3])
omega=[1,2,3,4,5,6,7,8];a=[2,4,6,8];b=[4,8]
assert.deepEqual(union(a,b),a);assert.deepEqual(intersect(a,b),b);assert.deepEqual(diff(union(a,b),intersect(a,b)),[2,6])
assert.deepEqual(diff(b,a),[]);assert.deepEqual(diff(omega,a),[1,3,5,7])
for(const [N,nA,nB,nAB,cells,joint,bGa,aGb] of [[100,40,30,12,[12,28,18,42],.12,.3,.4],[1000,100,500,80,[80,20,420,480],.08,.8,.16]]){
 assert.deepEqual([nAB,nA-nAB,nB-nAB,N-nA-nB+nAB],cells)
 near(nAB/N,joint);near(nAB/nA,bGa);near(nAB/nB,aGb)
 near(cells.reduce((s,c)=>s+c,0),N)
}
near(18/60,.3);near(.4*.3,.12);near(.4*.7,.28);near(.6*.3,.18);near(.6*.7,.42)
near(20/500,.04);near(.5*.16,.08);near(.5*.84,.42);near(.5*.04,.02);near(.5*.96,.48);near(.8/5,.16)
console.log(JSON.stringify({status:'PASS',goalCount:7,caseCount:14,candidateSha256:hash(prefix+'.candidates.json'),ledgerSha256:hash(prefix+'.review.jsonl'),scope:'Checks all authored numeric claims, matrix products and event sets. Supplements but never replaces complete bilingual subject body review. No human approval or learner mastery.'}))
