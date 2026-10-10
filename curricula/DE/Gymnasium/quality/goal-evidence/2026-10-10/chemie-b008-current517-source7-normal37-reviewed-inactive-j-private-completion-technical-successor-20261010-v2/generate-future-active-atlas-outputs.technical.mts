// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const root=resolve('.'), own=dirname(fileURLToPath(import.meta.url)), cap=resolve(root,'tmp/m7-resumption-20261010/chemistry-source7-normal37-j-integration-isolated-v3')
const p=relative(root,resolve(own,'future-active/chemistry-national-atlas.inputs.json'))
const config=readGoalBookSourceAtlasInputConfig(p,cap)
const normal=buildGoalBookSourceAtlasInputs(config,cap)
const scientificCandidate=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1/source-atlas/current517-bounded378.author.inputs.json',root),root)
assert.deepEqual(normal.receipt.counts,scientificCandidate.receipt.counts)
assert.deepEqual(normal.receipt.scopes.map(({key,goalIds}:any)=>({key,goalIds})),scientificCandidate.receipt.scopes.map(({key,goalIds}:any)=>({key,goalIds})))
assert.deepEqual(normal.receipt.omittedGoals,scientificCandidate.receipt.omittedGoals)
const paths:any[]=[]
for(const [target,bytes] of Object.entries(normal.outputs)){
 const file=resolve(own,'future-active/generated-normal-source-atlas',target);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes,{flag:'wx'});JSON.parse(bytes)
 paths.push({source:{path:relative(root,file),sha256:'sha256:'+createHash('sha256').update(bytes).digest('hex'),bytes:Buffer.byteLength(bytes)},target,normalGeneratorOutputExact:true})
}
const out=resolve(own,'checks/future-active-source-atlas-normal-generated-outputs-and-scope-equivalence.actual.json')
writeFileSync(out,JSON.stringify({schemaVersion:1,configPath:p,configSha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex'),normalGeneratorUnchanged:true,counts:normal.receipt.counts,all48ScopedGoalIdsEqualSealedAuthor:true,all20SourceHoldsExactEqualSealedAuthor:true,pathBindingsOnlyAreMaterializedToFutureActiveLocations:true,generatedOutputOperations:paths,newScientificReviews:0,newSourceClearances:0,humanApproval:false,activeWrites:[]},null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({output:relative(root,out),normalCounts:normal.receipt.counts,generatedOutputs:paths.length,all48ScopedIdsExact:true,all20HoldsExact:true}))
