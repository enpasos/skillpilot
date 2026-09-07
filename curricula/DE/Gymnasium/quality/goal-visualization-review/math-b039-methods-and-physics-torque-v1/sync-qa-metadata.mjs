import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Root separately authorized native QA metadata synchronization only after the
// four exact new-byte QA entries and the original adoption verification passed.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../../../..')
process.chdir(root)
const archive='curricula/DE/Gymnasium/quality/goal-visualization-review/math-b039-methods-and-physics-torque-v1/'
const helperPath=archive+'sync-qa-metadata.mjs'
const statePath=archive+'pre-qa-metadata-sync-v1.json'
const receiptPath=archive+'qa-metadata-sync-receipt-v1.json'
const imageReceiptPath=archive+'image-qa-adoption-receipt-v1.json'
const subjects=['mathematik','physik']
const allowed=['51e80e7b-df31-5d97-97f9-4c6e26eb7416','1b888f4c-df57-52a9-9551-b2b692e929fa']
const read=p=>fs.readFileSync(p)
const json=p=>JSON.parse(read(p))
const encode=x=>JSON.stringify(x,null,2)+'\n'
const sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex')
const qaPath=s=>'curricula/DE/Gymnasium/quality/goal-visualization-qa/'+s+'.qa.json'
const one=(rows,key,id)=>{const hits=rows.filter(r=>r[key]===id);assert.equal(hits.length,1,id);return hits[0]}
const protectedQa=q=>{
 const c=structuredClone(q)
 for(const r of c.records)if(allowed.includes(r.goalId)){delete r.title;delete r.description}
 return sha(encode(c))
}
const emitFile=(p,o)=>process.stdout.write('*** Begin Patch\n*** Add File: '+p+'\n'+encode(o).trimEnd().split('\n').map(l=>'+'+l).join('\n')+'\n*** End Patch\n')
const checkImages=(imageReceipt)=>{
 for(const f of imageReceipt.fileDigests.filter(f=>!f.path.endsWith('.qa.json')))assert.equal(sha(read(f.path)),f.afterSha256,'Canonical changed')
 for(const c of imageReceipt.selectedImages){
  const q=json(qaPath(c.subject)),row=one(q.records,'goalId',c.goalId)
  assert.deepEqual(row,c.newQa,'Imported image QA changed')
  for(const f of [...c.afterAssetFiles,...c.canonicalPrompts])assert.equal(sha(read(f.path)),f.sha256)
  assert.equal(row.humanApproved,'no');assert.equal(row.humanReviewedAt,null)
  assert.equal(row.aiApproved,'yes');assert.equal(row.aiApprovedAssetSha256,c.digest)
 }
}
const checkSync=state=>{
 assert.equal(sha(read(imageReceiptPath)),state.imageAdoptionReceipt.sha256)
 const imageReceipt=json(imageReceiptPath);checkImages(imageReceipt)
 const changes=[]
 for(const s of subjects){
  const old=one(state.subjects,'subject',s),q=json(qaPath(s))
  assert.equal(protectedQa(q),old.protectedQaSha256,'Non-text QA metadata or any approval changed')
  assert.equal(sha(JSON.stringify(q.records.map(r=>r.goalId))),old.qaOrderSha256)
  for(const before of old.allowedRecords){
   const after=one(q.records,'goalId',before.goalId)
   const keys=[...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>JSON.stringify(before[k])!==JSON.stringify(after[k]))
   assert.ok(keys.every(k=>k==='title'||k==='description'))
   assert.equal(after.assetSha256,before.assetSha256)
   if(keys.length)changes.push({subject:s,goalId:before.goalId,changedKeys:keys,before,after,retainedImageSha256:after.assetSha256})
  }
 }
 assert.equal(changes.length,2,'Expected exactly the two prior canonical description updates')
 assert.deepEqual(changes.map(c=>c.goalId).sort(),[...allowed].sort())
 return changes
}
const mode=process.argv[2]
if(mode==='prepare-patch'){
 assert.equal(fs.existsSync(statePath),false);assert.equal(fs.existsSync(receiptPath),false)
 const imageReceipt=json(imageReceiptPath)
 for(const f of imageReceipt.fileDigests)assert.equal(sha(read(f.path)),f.afterSha256)
 checkImages(imageReceipt)
 emitFile(statePath,{schemaVersion:1,artifactType:'qa-metadata-sync-pre-state-v1',recordedAt:new Date().toISOString(),
  authorization:'Root explicitly authorized native Math and Physics QA metadata sync after four exact AI-QA adoptions.',
  imageAdoptionReceipt:{path:imageReceiptPath,sha256:sha(read(imageReceiptPath))},
  priorImageAdoptionVerify:{status:'PASS',observedDocumentationTime:'2026-09-06T23:35:51Z',meaning:'Observed clock immediately after the successful original helper verify; not an invented exact invocation time.'},
  subjects:subjects.map(s=>{const q=json(qaPath(s));return {subject:s,path:qaPath(s),beforeSha256:sha(read(qaPath(s))),
   protectedQaSha256:protectedQa(q),qaOrderSha256:sha(JSON.stringify(q.records.map(r=>r.goalId))),
   allowedRecords:q.records.filter(r=>allowed.includes(r.goalId))}})})
}else if(mode==='sync'){
 const state=json(statePath);assert.equal(fs.existsSync(receiptPath),false)
 for(const s of subjects)assert.equal(sha(read(qaPath(s))),one(state.subjects,'subject',s).beforeSha256)
 checkImages(json(imageReceiptPath))
 for(const s of subjects)execFileSync('npm',['--prefix','app','run','quality:goal-visualization-qa','--','--subject',s],{stdio:'inherit'})
 checkSync(state)
 for(const s of subjects)execFileSync('npm',['--prefix','app','run','check:goal-visualization-qa','--','--subject',s],{stdio:'inherit'})
 process.stdout.write('PASS native Math/Physics metadata sync; exactly two descriptions changed; all old/new approval fields and image hashes preserved.\n')
}else if(mode==='receipt-patch'){
 const state=json(statePath);assert.equal(fs.existsSync(receiptPath),false)
 const changes=checkSync(state)
 emitFile(receiptPath,{schemaVersion:1,artifactType:'qa-metadata-sync-receipt-v1',recordedAt:new Date().toISOString(),
  authority:'metadata synchronization only; no new image review or human approval',
  humanApprovalClaimed:false,imageAdoptionReceipt:state.imageAdoptionReceipt,priorImageAdoptionVerify:state.priorImageAdoptionVerify,
  helper:{path:helperPath,sha256:sha(read(helperPath))},preSyncState:{path:statePath,sha256:sha(read(statePath))},
  commands:subjects.flatMap(s=>['npm --prefix app run quality:goal-visualization-qa -- --subject '+s,'npm --prefix app run check:goal-visualization-qa -- --subject '+s]),
  changes,
  fileDigests:subjects.map(s=>({path:qaPath(s),beforeSha256:one(state.subjects,'subject',s).beforeSha256,afterSha256:sha(read(qaPath(s)))})),
  preservation:{canonicalBytesUnchanged:true,fourImportedImageQaRecordsUnchanged:true,twelveImageBytesUnchanged:true,eightPromptBytesUnchanged:true,
   approvalFieldsUnchangedAcrossEveryQaRecord:true,qaRecordOrderUnchanged:true,otherQaRecordFieldsUnchanged:true},
  provenanceClarification:{goalId:'c61af0a9-7d56-5505-a70d-ee097c3b747f',
   clarificationDe:'Die neue Wertfolge 3; 2,5; 2⅓; 2,25 sowie die ausschließlich wechselnden Werte −1,+1 sind korrekt. Der Anlass der Reparatur waren unzutreffende Punkthöhen im früheren Raster. Die Formulierung „nun korrekt 2⅓“ im abgeschlossenen Importreceipt soll nicht behaupten, dass genau dieses frühere Zahlenetikett falsch war.',
   historicalReceiptPreserved:true,noImageChange:true},
  finalVerification:'Run this helper with verify. The original adoption helper remains a historical pre-metadata-sync verification, because it intentionally binds the earlier whole-QA hashes.'})
}else if(mode==='verify'){
 const state=json(statePath),receipt=json(receiptPath)
 const changes=checkSync(state);assert.deepEqual(changes,receipt.changes)
 assert.equal(sha(read(statePath)),receipt.preSyncState.sha256)
 assert.equal(sha(read(helperPath)),receipt.helper.sha256)
 for(const f of receipt.fileDigests)assert.equal(sha(read(f.path)),f.afterSha256)
 for(const s of subjects)execFileSync('npm',['--prefix','app','run','check:goal-visualization-qa','--','--subject',s],{stdio:'inherit'})
 process.stdout.write(encode({status:'PASS',metadataChanges:changes.map(c=>({goalId:c.goalId,keys:c.changedKeys})),
  fourNewImageQaBindingsPreserved:true,allCanonicalBytesPreserved:true,allApprovalFieldsPreserved:true,
  imageAdoptionReceiptSha256:sha(read(imageReceiptPath)),metadataSyncReceiptSha256:sha(read(receiptPath))}))
}else throw new Error('Use prepare-patch, sync, receipt-patch, or verify')

