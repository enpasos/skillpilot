import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'

const repoRoot = process.cwd()
const candidatePath = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-sibling-priority-remainder-7-v1.candidates.json"
const configPath = "curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-035-sibling-priority-remainder-7-v1.config.json"
const base = "curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/2026-09-06/batch-035-sibling-priority-remainder-7-v1"
const readJson = (path) => JSON.parse(readFileSync(resolve(repoRoot, path), 'utf8'))
const sha = (path) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(repoRoot, path))).digest('hex')
const close = (a,b) => assert.ok(Math.abs(a-b) < 1e-10, `${a} != ${b}`)

async function main() {
  const config = readJson(configPath)
  const candidateSet = readJson(candidatePath)
  const { buildPositiveGoalEvidenceCandidateRecords } = await import(pathToFileURL(resolve(repoRoot,'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href)
  const records = await buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet })
  assert.equal(records.length, 7)
  assert.deepEqual(records.map(r => r.goalId), config.scope.goalIds)
  for (const r of records) {
    assert.equal(r.status, 'needs_human_review')
    assert.equal(r.reviewAuthority, 'ai_candidate')
    assert.equal(r.evidenceLevel, 'E1')
    assert.equal(r.maximumClaimScope, 'G1')
    assert.deepEqual(r.reviewRunIds, [])
    assert.equal(r.profile.applicationCaseBriefs.length, 2)
  }
  const original = readJson(base+'/round-b/description-review-input.json')
  const canonical = readJson(config.landscapePath)
  const byId = new Map(canonical.goals.map(g => [g.id,g]))
  const originalBindings = original.goals.map(g => {
    const current = byId.get(g.goalId)
    assert.equal(current.title,g.currentTitleDe)
    assert.equal(current.description,g.currentDescriptionDe)
    assert.equal(current.titleEn,g.currentTitleEn)
    assert.equal(current.descriptionEn,g.currentDescriptionEn)
    return {goalId:g.goalId,pageFingerprint:g.pageFingerprint,originalGoalBookFingerprint:g.goalFingerprint}
  })

  // Each numeric result used in the case briefs is checked independently here.
  close(600/100+4,10); close(600/200+4,7)
  close(80*0/(4+0),0); close(80*4/(4+4),40); close(80*12/(4+12),60)
  close(1+0.2*5,2); close(Math.PI*(1+0.2*5)**2,4*Math.PI)
  close(10+20*(2*Math.exp(0)),50)
  close(10+20*(2*Math.exp(-1)),10+40/Math.E)
  close(56/100,0.56); close(3/6,0.5); close(30/40,0.75); close(3/4,0.75)
  const bin = (n,p) => ({mu:n*p,sigma:Math.sqrt(n*p*(1-p)),cv:Math.sqrt((1-p)/(n*p))})
  const x=bin(100,0.2), y=bin(400,0.2)
  close(x.mu,20);close(x.sigma,4);close(x.cv,0.2)
  close(y.mu,80);close(y.sigma,8);close(y.cv,0.1)
  close(0.7/(0.3*0.01),700/3)
  assert.equal(Math.ceil(700/3),234)
  assert.ok(bin(233,0.3).cv>0.1 && bin(234,0.3).cv<0.1)
  for (const p of [0.1,0.3,0.5,0.9]) for (const n of [1,3,10,100]) close(bin(4*n,p).cv,bin(n,p).cv/2)
  assert.equal(bin(5,1).cv,0); assert.ok(!Number.isFinite(bin(5,0).cv))
  const cartonSample = Array.from({length:30},(_,i)=>4*i+1)
  assert.equal(new Set(cartonSample).size,30)
  assert.ok(cartonSample.every(n=>n>=1&&n<=120))
  assert.equal(3*4,12)

  const subtract=(a,b)=>a.map((v,i)=>v-b[i])
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0)
  const norm=a=>Math.sqrt(dot(a,a))
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
  const equalPoint=(a,b)=>a.every((v,i)=>Math.abs(v-b[i])<1e-10)
  const edgeIntersections=(vertices,edges,normal,offset)=>{
    const points=[]
    const add=p=>{if(!points.some(q=>equalPoint(p,q)))points.push(p)}
    for(const [i,j] of edges){
      const a=vertices[i],b=vertices[j],fa=dot(normal,a)-offset,fb=dot(normal,b)-offset
      if(Math.abs(fa)<1e-10)add(a)
      if(Math.abs(fb)<1e-10)add(b)
      if(fa*fb<0){const t=-fa/(fb-fa);add(a.map((v,k)=>v+t*(b[k]-v)))}
    }
    return points
  }
  const cube=[]
  for(const xx of [0,2])for(const yy of [0,2])for(const zz of [0,2])cube.push([xx,yy,zz])
  const cubeEdges=[]
  for(let i=0;i<cube.length;i++)for(let j=i+1;j<cube.length;j++)if(cube[i].filter((v,k)=>v!==cube[j][k]).length===1)cubeEdges.push([i,j])
  const cubeExpected=[[2,0,0],[0,2,0],[0,0,2]]
  const cubeActual=edgeIntersections(cube,cubeEdges,[1,1,1],2)
  assert.equal(cubeActual.length,3)
  assert.ok(cubeExpected.every(p=>cubeActual.some(q=>equalPoint(p,q))))
  for(let i=0;i<3;i++)close(norm(subtract(cubeExpected[i],cubeExpected[(i+1)%3])),2*Math.sqrt(2))

  const prism=[[0,0,0],[4,0,0],[0,4,0],[0,0,3],[4,0,3],[0,4,3]]
  const prismEdges=[[0,1],[1,2],[2,0],[3,4],[4,5],[5,3],[0,3],[1,4],[2,5]]
  const prismExpected=[[3,0,0],[3,1,0],[0,4,3],[0,0,3]]
  const prismActual=edgeIntersections(prism,prismEdges,[1,0,1],3)
  assert.equal(prismActual.length,4)
  assert.ok(prismExpected.every(p=>prismActual.some(q=>equalPoint(p,q))))
  assert.ok(prismExpected.every(([xx,yy,zz])=>xx>=0&&yy>=0&&xx+yy<=4&&zz>=0&&zz<=3&&xx+zz===3))
  close(norm(subtract(prismExpected[1],prismExpected[0])),1)
  close(norm(subtract(prismExpected[3],prismExpected[2])),4)
  close(dot(subtract(prismExpected[0],prismExpected[3]),[0,1,0]),0)
  // Each consecutive pair lies on one actual prism face.
  const faceTests=[p=>p[2]===0,p=>p[0]+p[1]===4,p=>p[2]===3,p=>p[1]===0]
  for(let i=0;i<4;i++)assert.ok(faceTests[i](prismExpected[i])&&faceTests[i](prismExpected[(i+1)%4]))

  const a=[1,-1,0],b=[3,-1,0],c=[1,2,0]
  const dilation=p=>a.map((v,i)=>v+2*(p[i]-v))
  const ab=subtract(b,a),ac=subtract(c,a),tab=subtract(dilation(b),dilation(a)),tac=subtract(dilation(c),dilation(a))
  close(norm(cross(ab,ac))/2,3);close(norm(cross(tab,tac))/2,12)
  close(dot(tab,tac),0)
  const shear=([xx,yy,zz])=>[xx+zz,yy,zz]
  const sa=subtract(shear([2,0,0]),shear([0,0,0]))
  const sb=subtract(shear([0,3,0]),shear([0,0,0]))
  const sc=subtract(shear([0,0,4]),shear([0,0,0]))
  close(norm(cross(sa,sb)),6);close(Math.abs(dot(cross(sa,sb),sc)),24)
  assert.deepEqual(shear([0,0,4]),[4,0,4])

  console.log(JSON.stringify({
    status:'PASS',
    candidateDigest:sha(candidatePath),
    configDigest:sha(configPath),
    originalInputDigest:sha(base+'/round-b/description-review-input.json'),
    originalPagesDigest:sha(base+'/bundle/review-input.jsonl'),
    authoringPromptDigest:sha('curricula/DE/Gymnasium/quality/goal-evidence/prompts/positive-understanding-evidence-profile-authoring-v2.md'),
    criteriaDigest:sha(config.reviewCriteriaPath),
    profileSchemaDigest:sha('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),
    checks:{nativeMaterialization:7,exactOrderedScope:true,currentBilingualOriginalBindings:7,applicationCases:14,mathematicalChecks:'all assertions passed',globalWrites:false},
    mathematics:{
      averageCosts:[600/100+4,600/200+4],
      saturationResponse:[0,40,60],
      compositionAtFive:[4*Math.PI,10+40/Math.E],
      empiricalAndTheoretical:[0.56,0.5,0.75,0.75],
      binomial:[x,y,{minimumN:234,cv233:bin(233,0.3).cv,cv234:bin(234,0.3).cv}],
      surveyCounts:{cartons:30,totalLot:120,volumeRecords:12},
      cubeSection:cubeActual,
      prismSection:prismActual,
      transformedMeasures:{triangleArea:12,shearedVolume:24}
    },
    originalBindings,
    records
  }))
}
main().catch(error=>{console.error(error);process.exitCode=1})
