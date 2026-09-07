import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
const base='curricula/DE/Gymnasium/quality/goal-visualization-review/math-b042-current-image-repairs-v1'
const plan=JSON.parse(fs.readFileSync(base+'/adoption-plan-v1.json','utf8'))
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'))
const head=p=>JSON.parse(execFileSync('git',['show','HEAD:'+p],{encoding:'utf8',maxBuffer:32*1024*1024}))
const cp='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const now=json(cp),old=head(cp)
const {goals:ng,...nt}=now,{goals:og,...ot}=old
assert.deepEqual(nt,ot)
assert.deepEqual(ng.map(g=>g.id),og.map(g=>g.id))
const allowed=new Set([...plan.images.map(r=>r.goalId),...plan.textGoalIds])
const deltas=[]
for(let i=0;i<ng.length;i++){
const n=ng[i],o=og[i]; const fields=Object.keys({...n,...o}).filter(k=>JSON.stringify(n[k])!==JSON.stringify(o[k]))
if(!fields.length)continue
assert.ok(allowed.has(n.id),'Unexpected goal '+n.id)
const expected=plan.images.some(row=>row.goalId===n.id)?['resourceLinks']:n.id===plan.textGoalIds[0]?['description','descriptionEn','resourceLinks']:['titleEn']
assert.deepEqual(fields.slice().sort(),expected.slice().sort())
assert.deepEqual(n.requires,o.requires);assert.deepEqual(n.contains,o.contains)
deltas.push({goalId:n.id,changedFields:fields})
}
assert.equal(deltas.length,8)
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const qp='curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
const q=json(qp),oq=head(qp)
assert.equal(q.records.length,oq.records.length)
for(const row of q.records)if(!allowed.has(row.goalId))assert.deepEqual(row,oq.records.find(r=>r.goalId===row.goalId))
for(const item of plan.images){
 const row=q.records.find(r=>r.goalId===item.goalId)
 assert.equal(row.assetSha256,'sha256:'+item.newSha)
 assert.equal(row.aiApproved,'yes');assert.equal(row.aiApprovedAssetSha256,row.assetSha256)
 assert.equal(row.humanApproved,'no')
 for(const root of ['curricula/DE/Gymnasium/visualizations','app/public/assets/goal-visualizations','backend/src/main/resources/static/assets/goal-visualizations']){
 const ext=item.image.endsWith('.png')?'png':'jpg'
 assert.equal(sha(root+'/mathematik/'+item.goalId+'/'+item.goalId+'.'+ext),item.newSha)
 }
}
const am=[]
for(const lane of ['semantic-atomicity','memory-card-review']){
const p='curricula/DE/Gymnasium/quality/'+lane+'/canonical-math-full.review.jsonl'
const curr=fs.readFileSync(p,'utf8').trim().split('\n'),prev=execFileSync('git',['show','HEAD:'+p],{encoding:'utf8',maxBuffer:32*1024*1024}).trim().split('\n')
assert.equal(curr.length,prev.length)
const changed=curr.filter((line,i)=>line!==prev[i]).map(line=>JSON.parse(line).goalId)
assert.deepEqual(changed.slice().sort(),plan.textGoalIds.slice().sort());am.push({lane,changedGoalIds:changed,sha256:sha(p)})
}
const archive=json(base+'/archive-before-adoption-v1/archive-receipt.json')
// Preserve historical receipt bytes; resolve only the explicitly recorded archive relocation.
const relocations=json('curricula/DE/Gymnasium/quality/goal-description-review/2026-09-07-ci-archive-relocations-v2.json').files
for(const file of [...archive.archived,...archive.reviewBindings]){
 const moved=relocations.find(row=>row.from===file.path)
 if(moved)assert.equal(moved.sha256,file.sha256)
 assert.equal(sha(moved?.to ?? file.path),file.sha256)
}
const sp='curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
const {decisions:sd,...st}=json(sp),{decisions:od,...pt}=head(sp)
assert.deepEqual(st,pt)
const skChanges=sd.filter((row,i)=>JSON.stringify(row)!==JSON.stringify(od[i]))
assert.deepEqual(skChanges.map(row=>row.goalId).sort(),plan.textGoalIds.slice().sort())
for(const row of skChanges){
const previous=od.find(d=>d.goalId===row.goalId)
assert.equal(row.semanticKind,previous.semanticKind)
assert.equal(row.decisionStatus,previous.decisionStatus)
assert.equal(row.decisionBasis,'reviewed-current-semantic-recheck-curricular-atomic')
}
const result={schemaVersion:1,checkedAt:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),canonicalSha256:sha(cp),qaSha256:sha(qp),deltas,unrelatedGoalsIdentical:true,idsAndEdgesIdentical:true,unrelatedQaRowsIdentical:true,aiApprovedAssets:6,humanApprovalsAdded:0,runtimeSourceCopiesIdentical:true,archiveFilesVerified:archive.archived.length+archive.reviewBindings.length,am,semanticKind:{sha256:sha(sp),changedGoalIds:skChanges.map(row=>row.goalId),countsAndKindsUnchanged:true}}
console.log(JSON.stringify(result,null,2))
