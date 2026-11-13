// SPDX-License-Identifier: Apache-2.0
// Current tool derivation plus historical Math comparison; no graph/review writes.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCanonicalCatalog } from '../../../../../../../../app/scripts/deriveKnowledgeContext.ts'
import { KnowledgeContextIndex, renderKnowledgeContext } from '../../../../../../../../app/scripts/lib/knowledgeContext.ts'
const directory=dirname(fileURLToPath(import.meta.url)), root=resolve(directory,'../../../../../../../..')
const ids=["08b80080-4895-55df-8ca6-4e8c5eb0f9f5", "250daae6-58fd-59e4-8a11-f994e789ee47", "2919b3f3-aca2-5add-beeb-de1b9e0eafd8", "350fc8b1-ead0-4239-b28a-217cbd3bd1c3", "4b16fce6-84cc-52ae-98ca-f88cc518cc28", "6947245e-6bd7-52d7-9bc2-0c60cfa447c5", "79444ef9-cc85-5ac4-a3bc-f10d3ffbfd16", "8e1b0d9c-fa32-5ccd-9c11-77e788ae0941", "b3604df4-15a8-41c8-a8b0-50dadd698bd3", "b88cbf71-5e3e-55e3-ba94-6789408d38d6", "d4f2d4e2-a831-5ee2-b9c6-bb9e79986aeb", "d5feba00-4336-4f26-8dba-0537a797eddb", "d78946f9-1f5f-462c-a99c-fe01054042dd"]
const mathPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
const hash=(bytes:Buffer|string)=>`sha256:${createHash('sha256').update(bytes).digest('hex')}`
const write=(name:string,value:unknown)=>writeFileSync(resolve(directory,name),`${JSON.stringify(value,null,2)}\n`)
const catalog=loadCanonicalCatalog(), index=new KnowledgeContextIndex(catalog)
// This directory records the actual first-stage knowledge-context review.
// Never overwrite that historical input after a later canonical correction.
const recordedReceiptPath=resolve(directory,'derivation.receipt.json')
if(existsSync(recordedReceiptPath)) {
 const recorded=JSON.parse(readFileSync(recordedReceiptPath,'utf8'))
 const expected=recorded.inputs.find((item:any)=>item.path===mathPath)
 assert.equal(hash(readFileSync(resolve(root,mathPath))),expected.sha256,'Historical first-stage Math input changed; derive into a new successor directory instead')
}
const currentMath=JSON.parse(readFileSync(resolve(root,mathPath),'utf8'))
const oldRef='64124c1ec4', oldBytes=execFileSync('git',['show',`${oldRef}:${mathPath}`],{cwd:root,maxBuffer:15000000})
const oldMath=JSON.parse(oldBytes.toString())
const oldCatalog=catalog.map(landscape=>landscape.landscapeId===oldMath.landscapeId?oldMath:landscape)
const oldIndex=new KnowledgeContextIndex(oldCatalog)
const commands=[]
for(const goalId of ids){
 for(const format of ['full','json']){
  const args=['--prefix','app','run','-s','knowledge-context','--',goalId,format==='full'?'--full':'--json']
  const result=spawnSync('npm',args,{cwd:root,encoding:'utf8',maxBuffer:10000000})
  assert.equal(result.status,0,result.stderr)
  const name=`current-${goalId}.${format==='full'?'txt':'json'}`
  writeFileSync(resolve(directory,name),result.stdout)
  commands.push({command:['npm',...args],exitCode:result.status,outputPath:name,outputSha256:hash(result.stdout),stderr:result.stderr})
 }
 const context=oldIndex.context(goalId)
 write(`before-${goalId}.json`,context)
 writeFileSync(resolve(directory,`before-${goalId}.txt`),renderKnowledgeContext(context,{form:'full',language:'de'}))
 assert.deepEqual(JSON.parse(readFileSync(resolve(directory,`current-${goalId}.json`),'utf8')),index.context(goalId),'CLI and library disagree')
}
const ref=(key:string)=>{const goal=index.graph.goal(key);return {key,id:goal.id,title:goal.title,description:goal.description}}
const differences=[]
for(const key of index.graph.atomicKeys(currentMath.landscapeId)){
 if(index.graph.kind(key)!=='ordinary')continue
 const before=new Set(oldIndex.securedKeys(key)),after=new Set(index.securedKeys(key))
 const lost=[...before].filter(value=>!after.has(value)).map(ref), gained=[...after].filter(value=>!before.has(value)).map(ref)
 if(lost.length||gained.length)differences.push({goal:ref(key),beforeSecuredCount:before.size,afterSecuredCount:after.size,lost,gained})
}
write('secured-scope-delta.json',{comparison:'Existing KnowledgeContextIndex on the current complete catalog versus the same catalog with only Mathematics replaced by its actual prechange64124c1ec4 document. No hand-derived closure.',oldMathRef:oldRef,oldMathSha256:hash(oldBytes),currentMathSha256:hash(readFileSync(resolve(root,mathPath))),changedOrdinaryGoalCount:differences.length,losingOrdinaryGoalCount:differences.filter(item=>item.lost.length).length,differences})
const allFiles=(path:string):string[]=>readdirSync(path,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?allFiles(resolve(path,entry.name)):entry.isFile()&&/\.json$/iu.test(entry.name)&&!/_deck/iu.test(entry.name)?[resolve(path,entry.name)]:[]).sort()
const inputs=[...allFiles(resolve(root,'curricula/DE/Gymnasium/canonical')),...['AGENTS.md','app/scripts/deriveKnowledgeContext.ts','app/scripts/lib/knowledgeContext.ts','app/scripts/lib/learningUnitContracts.ts'].map(path=>resolve(root,path))].map(path=>({path:relative(root,path),sha256:hash(readFileSync(path))}))
write('derivation.receipt.json',{schemaVersion:1,derivedAt:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),ruleCommit:'27a0b68895',canonicalLandscapes:catalog.length,commands,historicalComparison:{ref:oldRef,mathPath,sha256:hash(oldBytes)},inputs,note:'Read-only derived knowledge contexts and scope delta. Existing native D evidence predates AGENTS2.5 and is preserved unchanged. No prerequisite-sufficiency or runtime acceptance claim.'})
console.log(JSON.stringify({derivedCurrentGoals:ids.length,changedOrdinaryGoals:differences.length,losingOrdinaryGoals:differences.filter(item=>item.lost.length).length,changes:differences.filter(item=>ids.includes(item.goal.id)).map(item=>({goal:item.goal.id,lost:item.lost.map(goal=>goal.title),gained:item.gained.map(goal=>goal.title)}))},null,2))
