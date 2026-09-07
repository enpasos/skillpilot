// Read-only, bounded post-implementation checks. Run from repository root with Node 20 + tsx.
import fs from 'node:fs'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fingerprintSemanticKindSourceGoal } from '/home/enpasos/projects/skillpilot/app/scripts/goalBookModel.ts'

const batch='curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-039-quantum-and-rotation-20-v1/'
const receipt=JSON.parse(fs.readFileSync(batch+'repair-implementation-v1.receipt.json','utf8'))
const sha=(s:string)=>'sha256:'+crypto.createHash('sha256').update(s).digest('hex')
const allEdits=[...receipt.recoverableExactEdits,...receipt.followupRecoverableExactEdits]
const paths=[...new Set<string>(allEdits.map((e:any)=>e.path))]
const current=new Map(paths.map(path=>[path,fs.readFileSync(path,'utf8')]))
const restored=new Map(current)
for(const edit of [...allEdits].reverse()) {
  const text=restored.get(edit.path)!
  assert.equal(text.split(edit.after).length,2,'unique reverse precondition: '+edit.path+' '+edit.reason)
  restored.set(edit.path,text.replace(edit.after,()=>edit.before))
}
for(const row of receipt.baselineAndExpectedHashes) assert.equal(sha(restored.get(row.path)!),row.beforeSha256,'exact baseline recovered: '+row.path)
const canonical=paths.find(p=>p.includes('/canonical/'))!
const before=JSON.parse(restored.get(canonical)!), after=JSON.parse(current.get(canonical)!)
const oldMap=new Map<string,any>(before.goals.map((g:any)=>[g.id,g]))
const newMap=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const energy='5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931'
const moment='c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea'
const parent='9743baad-9371-52b6-98ee-72bc6dc68701'
const local='6d25344c-35d7-5853-925d-2bccbaf50630'
const lk='879491c0-7153-570b-91f4-c61d9fe8a143'
const phase='7f83e25c-38f7-5ac2-8f9c-ec54eeef1026'
const inertia='642aebd7-66cd-5a50-b543-73c4b207525d'
const changed=[...oldMap.keys()].filter(id=>JSON.stringify(oldMap.get(id))!==JSON.stringify(newMap.get(id)))
const added=[...newMap.keys()].filter(id=>!oldMap.has(id))
const removed=[...oldMap.keys()].filter(id=>!newMap.has(id))
assert.deepEqual(changed.sort(),[energy,parent,local,lk,phase].sort())
assert.deepEqual(added,[moment]);assert.deepEqual(removed,[])
const {goals:oldGoals,...oldMeta}=before;const {goals:newGoals,...newMeta}=after
assert.deepEqual(oldMeta,newMeta)
assert.deepEqual(oldMap.get('b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc'),newMap.get('b49e0f6b-df2a-5643-b3ce-a9dfdf25f3bc'))
for(const id of [energy,moment]) {
  assert.deepEqual(newMap.get(id).contains,[])
  assert.deepEqual(newMap.get(id).requires,[inertia])
  assert.deepEqual(newMap.get(id).tags,['GK','LK'])
  for(const field of ['alias','aliases','splitFrom','mastery','autoMastery']) assert.ok(!(field in newMap.get(id)))
}
assert.equal(newMap.get(energy).description,oldMap.get(energy).description.split(' sowie ')[0]+'.')
assert.equal(newMap.get(energy).descriptionEn,oldMap.get(energy).descriptionEn.split(' and calculate ')[0]+'.')
assert.deepEqual(newMap.get(energy).applicability,newMap.get(moment).applicability)
assert.equal(newMap.get(moment).resourceLinks,undefined)
assert.equal(newMap.get(energy).resourceLinks[0].url,oldMap.get(energy).resourceLinks[0].url)
assert.equal(newMap.get(parent).contains.indexOf(moment),newMap.get(parent).contains.indexOf(energy)+1)
for(const id of [local,lk]) {
  assert.ok(newMap.get(id).requires.includes(moment));assert.ok(newMap.get(id).requires.includes(energy))
  assert.ok(newMap.get(id).examData.coveredGoalIds.includes(moment))
  assert.ok(newMap.get(id).examData.coveredGoalIds.includes(energy))
}
assert.ok(newMap.get(phase).requires.includes(moment))
assert.deepEqual(newMap.get(phase).examData.coveredGoalIds,oldMap.get(phase).examData.coveredGoalIds)
const le=newMap.get(local).examData
assert.equal(le.scoring.maxPoints,30);assert.equal(le.scoring.passingPoints,18)
assert.equal(le.scoring.steps.reduce((s:number,r:any)=>s+r.points,0),30)
assert.equal(le.scoring.steps.at(-1).points,5)
assert.ok(le.taskContent.includes('mittlere Winkelbeschleunigung'))
assert.ok(le.taskContent.includes('resultierende Antriebsmoment'))
assert.ok(le.solutionContent.includes('250'))
assert.equal(25*200,5000);assert.equal((200-0)/20,10);assert.equal(25*10,250)
assert.equal(250*20,5000);assert.equal(25*0,0);assert.equal(1000/5000,.2)
assert.equal(2.4/1.2*1.5,3);assert.ok(Math.abs(.5*2.4*1.5**2-2.7)<1e-12)
assert.ok(Math.abs(.5*1.2*3**2-5.4)<1e-12)
assert.ok(Math.abs(.5*.32*(18**2-6**2)-46.08)<1e-12)
assert.equal(.32*(18-6)/3,1.28)
assert.equal(newMap.get(lk).examData.taskContent,oldMap.get(lk).examData.taskContent)
assert.equal(newMap.get(lk).examData.solutionContent,oldMap.get(lk).examData.solutionContent)
const getDoc=(needle:string)=>JSON.parse(current.get(paths.find(p=>p.includes(needle))!)!)
const legacy=getDoc('hessen_physics_upper_secondary_to_canonical')
const legacyRows=legacy.mappings.filter((m:any)=>m.legacyGoalId==='cecebbb6-2ad4-43c5-b9ce-4b80f5cd870c')
assert.deepEqual(legacyRows.map((m:any)=>[m.canonicalGoalId,m.matchType]),[[energy,'partial'],[moment,'partial']])
const sourceFindings=[]
for(const [needle,sourceId] of [['hessen_physics_upper_secondary_source','he-phys-sekii-e-7-b01-a01-8ba122e4'],['rp_physics_upper_secondary_source','rp-phys-sek2-ef-torque-lk']]) {
  const d=getDoc(needle), rows=d.mappings.filter((m:any)=>m.legacyGoalId===sourceId)
  const decision=d.decisions.find((r:any)=>r.sourceGoalId===sourceId)
  assert.equal(rows.length,2);assert.ok(rows.every((r:any)=>r.matchType==='partial'))
  assert.deepEqual(rows.map((r:any)=>r.canonicalGoalId),decision.canonicalGoalIds)
  assert.ok(decision.canonicalGoalIds.includes(moment))
  assert.ok(fs.readFileSync(d.sourceExtractionPath,'utf8').includes(sourceId))
  for(const r of rows) assert.ok(newMap.has(r.canonicalGoalId))
  sourceFindings.push({path:paths.find(p=>p.includes(needle)),sourceId,rows,decision})
}
const rp=getDoc('rp_physics_upper_secondary_source')
assert.deepEqual(rp.mappings.filter((r:any)=>r.legacyGoalId==='rp-phys-sek2-ef-rotational-energy-lk').map((r:any)=>[r.canonicalGoalId,r.matchType]),[[inertia,'partial'],[energy,'partial']])
const kinds=getDoc('physik.semantic-kinds.json')
for(const id of [...changed,moment]) {
 const record=kinds.decisions.find((r:any)=>r.goalId===id)
 assert.equal(record.sourceFingerprint,fingerprintSemanticKindSourceGoal(newMap.get(id)))
}
assert.equal(kinds.counts.curricularAtomic,465);assert.equal(kinds.counts.total,711)
const publicMirror=[]
for(const lang of ['de','en']) {
 const cp=paths.find(p=>p.includes('/memory-decks/')&&p.endsWith('.'+lang+'.json'))!
 const pp=paths.find(p=>p.startsWith('app/public/')&&p.endsWith('.'+lang+'.json'))!
 const card=(p:string)=>JSON.parse(current.get(p)!).cards.find((c:any)=>c.id==='physics_e_cov_089')
 assert.deepEqual(card(cp),card(pp))
 assert.ok(card(cp).tags.includes('goal:'+energy));assert.ok(card(cp).tags.includes('goal:'+moment))
 const deployment='backend/src/main/resources/static/data/'+pp.split('/').at(-1)
 publicMirror.push({language:lang,canonical:cp,public:pp,matching:true,backendBuildCopyExists:fs.existsSync(deployment),backendBuildCopyMatches:fs.existsSync(deployment)&&JSON.stringify(card(cp))===JSON.stringify(JSON.parse(fs.readFileSync(deployment,'utf8')).cards.find((c:any)=>c.id==='physics_e_cov_089'))})
}
console.log(JSON.stringify({checkedAt:new Date().toISOString(),status:'PASS',exactRecoveryBaselineHashesVerified:receipt.baselineAndExpectedHashes.length,changedExistingGoalIds:changed,addedGoalIds:added,removedGoalIds:removed,b49Unchanged:true,phaseNoFalseConcreteCoverage:true,sourceFindings,publicMirror,finalFiles:paths.map(path=>({path,beforeSha256:sha(restored.get(path)!),afterSha256:sha(current.get(path)!)}))},null,2))
