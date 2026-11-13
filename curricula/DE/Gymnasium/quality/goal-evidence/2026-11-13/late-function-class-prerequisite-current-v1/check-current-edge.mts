// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadCanonicalCatalog } from '../../../../../../../app/scripts/deriveKnowledgeContext.ts'
import { KnowledgeContextIndex } from '../../../../../../../app/scripts/lib/knowledgeContext.ts'
const directory=dirname(fileURLToPath(import.meta.url)),root=resolve(directory,'../../../../../../..')
const predecessor=JSON.parse(readFileSync(resolve(directory,'edge-predecessor-input.json'),'utf8'))
const catalog=loadCanonicalCatalog(),index=new KnowledgeContextIndex(catalog),math=catalog.find(item=>item.landscapeId==='68a8ac50-f5f5-4e24-8aa9-5e408ca01ced')!
const previous=structuredClone(catalog),previousMath=previous.find(item=>item.landscapeId===math.landscapeId)!
previousMath.goals=previousMath.goals.map(goal=>goal.id===predecessor.goalBefore.id?predecessor.goalBefore:goal)
const before=new KnowledgeContextIndex(previous),key=index.resolveAtomicGoal(predecessor.goalBefore.id),beforeKeys=new Set(before.securedKeys(key)),afterKeys=new Set(index.securedKeys(key))
const added=[...afterKeys].filter(item=>!beforeKeys.has(item)),removed=[...beforeKeys].filter(item=>!afterKeys.has(item))
assert.deepEqual(added,[`${math.landscapeId}:858113c5-e53b-57bb-b01f-ba95c3ddcb6f`]);assert.deepEqual(removed,[])
const findings=[]
let directEdges=0
for(const atom of index.graph.atomicKeys(math.landscapeId)){
 const requires=index.graph.directAtomicRequires(atom);directEdges+=requires.length
 if(index.graph.reach(atom).has(atom))findings.push({code:'cycle',goal:atom})
 for(const required of requires){
  if(!index.graph.isAtomic(required))findings.push({code:'non-atomic',goal:atom,required})
  for(const other of requires)if(other!==required&&index.graph.reach(other).has(required))findings.push({code:'redundant',goal:atom,required,via:other})
 }
}
assert.deepEqual(findings,[])
const early=['350fc8b1-ead0-4239-b28a-217cbd3bd1c3','b3604df4-15a8-41c8-a8b0-50dadd698bd3','d5feba00-4336-4f26-8dba-0537a797eddb']
for(const id of early){const previousContext=JSON.parse(readFileSync(resolve(directory,'../derivative-order-and-saddle-current-v1/knowledge-context-addendum-27a0',`current-${id}.json`),'utf8'));assert.deepEqual(index.context(id),previousContext)}
const hash=(path:string)=>`sha256:${createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')}`
const receipt={schemaVersion:1,tool:'Actual repository KnowledgeContextIndex / UnitGraph over the complete canonical catalog',canonicalPath:predecessor.canonicalPath,canonicalSha256:hash(predecessor.canonicalPath),goalId:predecessor.goalBefore.id,gained:added,lost:removed,afterSecuredCount:afterKeys.size,checkedMathAtomicGoals:index.graph.atomicKeys(math.landscapeId).length,directAtomicEdges:directEdges,findings,unchangedEarlierFullKnowledgeContexts:early,note:'Current bounded Mathematics edge/context check, not a complete registered G17 milestone, subject sufficiency or runtime acceptance.'}
writeFileSync(resolve(directory,'current-edge-check.receipt.json'),`${JSON.stringify(receipt,null,2)}\n`)
console.log(`Actual final edge check PASS: gain exactly858, early three full knowledge contexts unchanged; ${directEdges} Math direct atomic edges, 0 findings.`)
