// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {pathToFileURL,fileURLToPath} from 'node:url'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const map=get('checks/REBUILD.current422-final.alias50-selected431.physical-map.json'),host=resolve(root,map.executionHost)
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
const cfg=get('config/central.current422.source3-lab1.final.inactive.config.json'),s=cfg.subjects[0]
const can=JSON.parse(readFileSync(resolve(host,s.landscapePath),'utf8'))
const sem=JSON.parse(readFileSync(resolve(host,s.semanticKindLedgerPath),'utf8'))
assert.equal(can.goals.length,554);assert.equal(sem.counts.curricularAtomic,422);assert.equal(sem.sourceLandscapePath,s.landscapePath)
const G=new Map(can.goals.map((g:any)=>[g.id,g]))
const mismatches=sem.decisions.filter((d:any)=>d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(G.get(d.goalId)))
assert.deepEqual(mismatches,[])
const duplicates:any[]=[]
for(const key of ['positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']){
 const owners=new Map<string,string>()
 for(const path of s[key]){
  const c=at(path);assert.equal(c.landscapePath,s.landscapePath)
  if(c.semanticKindLedgerPath)assert.equal(c.semanticKindLedgerPath,s.semanticKindLedgerPath)
  const rows=readFileSync(resolve(root,c.reviewPath),'utf8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l))
  for(const r of rows){if(owners.has(r.goalId))duplicates.push({key,goalId:r.goalId,one:owners.get(r.goalId),two:path});owners.set(r.goalId,path)}
 }
}
assert.deepEqual(duplicates,[])
const cfa='cfa5c1e4-6714-5be7-9a57-a24b201b6231',c441='c441d9e8-d9d9-5e55-a189-a37345541321'
const labA=at(s.semanticAtomicityConfigPaths.find((p:string)=>p.endsWith('A15-lab-original-normal-address.config.json')))
const aRows=readFileSync(resolve(root,labA.reviewPath),'utf8').trim().split('\n').map(l=>JSON.parse(l))
assert.equal(aRows.find((r:any)=>r.goalId===cfa).status,'non_atomic')
const labP=at(s.positiveEvidenceConfigPaths.find((p:string)=>p.endsWith('P14-lab-original-except-current-cfa.config.json')))
assert.ok(!labP.scope.goalIds.includes(cfa))
const mc=at(s.memoryReviewConfigPath),mr=readFileSync(resolve(root,mc.reviewPath),'utf8').trim().split('\n').map(l=>JSON.parse(l))
assert.equal(mr.length,422);assert.equal(new Set(mr.map((r:any)=>r.goalId)).size,422)
assert.ok(mr.every((r:any)=>r.reviewId===mc.reviewId))
const mcas=get('CAS.M1.single-reviewId-container-identity-transport.json')
assert.deepEqual(Object.keys(mcas.wholeAfter).filter(k=>JSON.stringify(mcas.wholeAfter[k])!==JSON.stringify(mcas.wholeBefore[k])),['reviewId'])
assert.equal(mr.find((r:any)=>r.goalId===c441).reviewer,mcas.wholeBefore.reviewer)
const q=JSON.parse(readFileSync(resolve(host,s.visualizationQaPath),'utf8')),qr=q.records.find((r:any)=>r.goalId===cfa)
assert.equal(q.records.length,438);assert.equal(qr.aiApproved,'yes')
assert.equal(qr.assetSha256,'sha256:f5077a2472d58cdac1114c9e8787c64ddc33b80508b0c207113b2375e74d1ff5')
assert.equal(qr.aiApprovedAssetSha256,qr.assetSha256);assert.equal(qr.humanApproved,'no')
for(const row of map.stockPhysicalModules){const b=readFileSync(resolve(host,row.path));assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),row.sha256)}
for(const row of map.aliases){const b=readFileSync(resolve(host,row.normalHostAlias));assert.equal('sha256:'+createHash('sha256').update(b).digest('hex'),row.physicalRepositorySource.sha256)}
const receipt={pass:true,role:'Static exact technical merge preflight, no whole central report yet',wholeGoals:554,denominator:422,
 semanticSourceFingerprintMismatches:0,duplicatePOrARecords:duplicates.length,memoryRows:422,
 singleMemoryReviewIdOnlyMetadataTransport:true,cfaCurrentPExcluded:true,cfaStillNonAtomic:true,
 cfaActualAcceptedPngBinding:qr.assetSha256,normalPhysicalAliases:map.aliases.length,stockModules:map.stockPhysicalModules.length,
 newScientificVotes:0,newStrictClosuresClaimed:0,activeIntegration:false}
writeFileSync(resolve(own,'checks/CHECK.technical-input-merge-before-central.actual.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt))
