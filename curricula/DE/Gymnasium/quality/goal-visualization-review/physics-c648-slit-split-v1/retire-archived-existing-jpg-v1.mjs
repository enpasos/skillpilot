import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
import {fileURLToPath} from 'node:url'

const base=path.dirname(fileURLToPath(import.meta.url))
const relative=p=>path.relative(process.cwd(),p)
const read=p=>fs.readFileSync(p)
const json=p=>JSON.parse(read(p))
const sha=p=>'sha256:'+createHash('sha256').update(read(p)).digest('hex')
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'
const qaPath='curricula/DE/Gymnasium/quality/goal-visualization-qa/physik.qa.json'
const unchangedBefore=[canonical,qaPath].map(p=>({path:p,digest:sha(p)}))
const landscape=json(canonical),qa=json(qaPath)
const archivePath=path.join(base,'previous-existing-case-images-v2/receipt.json')
const archive=json(archivePath)
const ids=['91683676-01cf-5003-80fa-a04d043b4e61','f6a3a602-1e45-5018-b0ff-3d49933cf634']
const roots=[['source','curricula/DE/Gymnasium/visualizations'],['frontend','app/public/assets/goal-visualizations'],['backend','backend/src/main/resources/static/assets/goal-visualizations']]
const targets=[],activePngs=[]
for(const id of ids){
 const goal=landscape.goals.find(g=>g.id===id),row=qa.records.find(r=>r.goalId===id)
 const links=goal.resourceLinks.filter(r=>r.type==='goal-visualization')
 assert.equal(links.length,1)
 const url='/assets/goal-visualizations/physik/'+id+'/'+id+'.png'
 assert.equal(links[0].url,url);assert.equal(row.imageUrl,url)
 assert.equal(row.aiApproved,'yes');assert.equal(row.aiApprovedAssetSha256,row.assetSha256)
 const source='curricula/DE/Gymnasium/visualizations/physik/'+id+'/'+id+'.jpg'
 const original=archive.files.find(r=>r.source===source)
 assert(original);assert.equal(sha(original.archive),original.sha256)
 for(const [role,root] of roots){
  const prefix=root+'/physik/'+id+'/'+id
  assert.equal(sha(prefix+'.png'),row.assetSha256)
  activePngs.push({path:prefix+'.png',digest:row.assetSha256})
  const from=prefix+'.jpg',to=path.join(base,'retired-active-jpg-v1',role,id+'.jpg')
  if(fs.existsSync(from)){
   assert.equal(sha(from),original.sha256);assert(!fs.existsSync(to),'refuse overwrite: '+to)
  }else {assert(fs.existsSync(to),'missing active predecessor and recovery copy: '+from);assert.equal(sha(to),original.sha256)}
  targets.push({from,to,digest:original.sha256,originalArchive:original.archive})
 }
}
// Every source, active PNG, QA binding and target is checked before any move.
if(process.argv.includes('--retire'))for(const target of targets){
 if(fs.existsSync(target.from)){fs.mkdirSync(path.dirname(target.to),{recursive:true});fs.renameSync(target.from,target.to)}
 assert.equal(sha(target.to),target.digest);assert(!fs.existsSync(target.from))
}
for(const f of [...unchangedBefore,...activePngs])assert.equal(sha(f.path),f.digest)
console.log(JSON.stringify({
 schemaVersion:1,checkedAt:new Date().toISOString(),reviewerAgent:'/root/goal_book_ci_integration',
 scope:'Only six previously replaced, hash-archived JPGs. No new image/content/D/P/QA approval.',
 mode:process.argv.includes('--retire')?'recoverable-retirement':'read-only',
 archiveReceipt:{path:relative(archivePath),digest:sha(archivePath)},unchangedSources:unchangedBefore,
 unchangedActivePngs:activePngs,targets:targets.map(t=>({...t,to:relative(t.to)})),
},null,2))
