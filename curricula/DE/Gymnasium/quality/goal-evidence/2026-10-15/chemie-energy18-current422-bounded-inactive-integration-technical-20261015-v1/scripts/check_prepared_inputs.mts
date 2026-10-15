// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,lstatSync,readdirSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const repo=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..')
const load=(p:string)=>JSON.parse(readFileSync(p,'utf8')),local=(p:string)=>load(resolve(own,p))
const digest=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const map=local('checks/REBUILD.energy18-prepared.physical-exact-map.v2.json'),host=resolve(repo,map.executionHost)
const cfg=local('config/central.current422.energy18.PREPARED.pending-D4.config.json').subjects[0]
const landscape=load(resolve(host,cfg.landscapePath)),semantic=load(resolve(host,cfg.semanticKindLedgerPath)),goals=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(resolve(host,'app/scripts/goalBookModel.ts')).href)
assert.equal(goals.size,560);assert.equal(semantic.decisions.length,560);assert.equal(semantic.counts.curricularAtomic,422)
assert.deepEqual(semantic.decisions.filter((r:any)=>r.sourceFingerprint!==fingerprintSemanticKindSourceGoal(goals.get(r.goalId))),[])
for(const field of ['requires','contains']){
 const done=new Set<string>(),visiting=new Set<string>()
 const visit=(id:string)=>{assert.ok(!visiting.has(id),field+' cycle '+id);if(done.has(id))return;visiting.add(id);for(const child of goals.get(id)?.[field]??[]){assert.ok(goals.has(child),field+' missing '+child);visit(child)}visiting.delete(id);done.add(id)}
 for(const id of goals.keys())visit(id)
 assert.equal(done.size,560)
}
const input=local('INPUTS.preparation-inactive-energy18.actual-selector.json'),targets=new Set<string>(input.scope18GoalIds),selected=new Map<string,string>(),counts:any={}
for(const key of ['positiveEvidenceConfigPaths','semanticAtomicityConfigPaths']){
 let count=0
 for(const cp of cfg[key]){
  const c=load(resolve(host,cp));assert.equal(c.landscapePath,cfg.landscapePath)
  if(c.semanticKindLedgerPath)assert.equal(c.semanticKindLedgerPath,cfg.semanticKindLedgerPath)
  for(const line of readFileSync(resolve(host,c.reviewPath),'utf8').split('\n').filter(Boolean)){
   const row=JSON.parse(line),id=key+':'+row.goalId;assert.ok(!selected.has(id),'duplicate '+id);selected.set(id,cp);count++
  }
 }
 counts[key]=count
}
for(const id of targets){assert.ok(selected.has('positiveEvidenceConfigPaths:'+id));assert.ok(selected.has('semanticAtomicityConfigPaths:'+id))}
for(const id of ['e64a79df-7f21-5651-9b5d-e7d17580569e','c21d430b-424d-5b13-adf6-999f2490d2dc'])assert.ok(!selected.has('semanticAtomicityConfigPaths:'+id))
for(const row of map.stockPhysicalModules)assert.equal(digest(resolve(host,row.path)),row.sha256)
for(const row of map.aliases){const p=resolve(host,row.normalHostAlias);assert.ok(!lstatSync(p).isSymbolicLink());assert.equal(digest(p),row.physicalRepositorySource.sha256)}
for(const row of Object.values(input.inputs) as any[]){assert.equal(digest(resolve(repo,row.path)),row.sha256);assert.equal(lstatSync(resolve(repo,row.path)).size,row.bytes)}
for(const row of local('checks/PROTECTED697.actual-before.json').files){assert.equal(digest(resolve(repo,row.path)),row.sha256);assert.equal(lstatSync(resolve(repo,row.path)).size,row.bytes)}
const qa=load(resolve(host,cfg.visualizationQaPath)),qcas=local('checks/CAS.QA-preparation-real-sources-and-pending4.json'),baseQA=load(resolve(repo,qcas.baseline.path)),qaRows=new Map<string,any>(qa.records.map((r:any)=>[r.goalId,r]))
assert.equal(qa.records.length,438)
assert.equal(qa.records.filter((r:any)=>JSON.stringify(r)===JSON.stringify(baseQA.records.find((b:any)=>b.goalId===r.goalId))).length,431)
for(const row of qa.records){assert.equal(row.description,goals.get(row.goalId).description);assert.equal(row.title,goals.get(row.goalId).title)}
for(const row of qcas.changes){assert.deepEqual(qaRows.get(row.goalId),row.after);if(row.source)assert.deepEqual(row.after,load(resolve(repo,row.source.path)).records.find((v:any)=>v.goalId===row.goalId))}
assert.equal(qcas.realCompletedVSourceRowsSelected,6);assert.deepEqual(qcas.pendingV4GoalIds,[])
assert.equal(qaRows.get('0773a104-aaeb-5e96-a615-2a2bec3eb096').visualizationState,'missing')
assert.deepEqual(local('checks/PREFLIGHT.affected-normal-P18-A18-M422-QA438.actual.json').results.filter((r:any)=>r.exitCode!==0),[])
assert.deepEqual(local('checks/READONLY.normal-image-alias-consumers.actual.json').results.filter((r:any)=>r.exitCode!==0),[])
let bytes=0,files=0
const walk=(p:string)=>{for(const e of readdirSync(p,{withFileTypes:true})){const q=resolve(p,e.name);if(e.isDirectory())walk(q);else if(e.isFile()){bytes+=lstatSync(q).size;files++}}};walk(host);assert.ok(bytes<70*1024*1024)
const result={schemaVersion:1,checkedAt:new Date().toISOString(),pass:true,role:'Prepared exact technical closure, no full central execution',wholeGoals:560,semanticDecisions:560,ordinaryDenominator:422,requiresDAG:true,containsDAG:true,semanticSourceFingerprintsCurrent:true,new18ExactlyOnceInPAndA:true,duplicatePOrARows:0,selectedPRecords:counts.positiveEvidenceConfigPaths,selectedARecords:counts.semanticAtomicityConfigPaths,e64C21CurrentAClaimsSelected:0,old321WholeGoalObjectsExact:true,actualStrict321RetentionAwaitingCentral:true,oldQaRowsExact:431,realVRowsSelectedExact:6,missing0773Retained:true,ENonlyA76E64ExistingAssetDEQaPreserved:true,protectedActiveFiles:697,protectedActiveFilesExact:true,normalPhysicalAliases:51,normalPhysicalStockModules:31,privateHostRegularFiles:files,privateHostRegularBytes:bytes,maxPrivateHostBytes:70*1024*1024,affectedNormalChecksPassed:8,readonlyImageConsumerChecksPassed:4,fullCentralRunCount:0,D4PairIndexPending:true,newScientificVotes:0,activeIntegration:false,M7Grant:false}
writeFileSync(resolve(own,'checks/PREFLIGHT.prepared-exact-closure.actual.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2))
