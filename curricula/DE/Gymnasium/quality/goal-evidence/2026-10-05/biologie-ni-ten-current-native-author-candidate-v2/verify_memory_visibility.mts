// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { compositionViewExposesGoal } from '../../../../../../../app/src/utils/compositionViewRuntime'
const here=dirname(fileURLToPath(import.meta.url)),read=(p:string)=>JSON.parse(readFileSync(resolve(here,p),'utf8'))
const canon=read('canonical.biologie.current.inactive.snapshot.json'),meta=read('prospective-paths.json'),entries=prepareLandscapeEntries([canon])
const small=read('visibility.ni-five-six.inactive.view.json'),wide=read('visibility.ni-full-supplement.inactive.view.json')
const rows=[small,wide].map(v=>{
 const c=compileCompositionView(v,normalizeCanonicalLandscape(canon));assert.deepEqual(c.findings.filter(x=>x.severity==='error'),[])
 const pairs=Object.entries(meta.memoryOriginMappings).map(([origin,mid])=>{assert(compositionViewExposesGoal(entries,v,origin));assert(compositionViewExposesGoal(entries,v,mid as string));return {originGoalId:origin,memoryGoalId:mid,originAndMemoryVisible:true}})
 return {viewId:v.viewId,findings:c.findings,pairs,authoritativeCurrentVisibilityApproval:false}
})
const negative=Object.entries(meta.memoryOriginMappings).map(([origin,mid])=>{
 const missing=structuredClone(small);missing.rootNodes[0].children=missing.rootNodes[0].children.filter((n:any)=>n.goalId!==mid)
 assert(compositionViewExposesGoal(entries,missing,origin));assert(!compositionViewExposesGoal(entries,missing,mid as string))
 return {originGoalId:origin,omittedMemoryGoalId:mid,originStillVisible:true,memoryAbsentDetected:true}
})
writeFileSync(resolve(here,'memory.runtime-compile-and-negative-witness.actual.json'),JSON.stringify({candidateOnly:true,humanApproval:false,activeWrites:0,positive:rows,negative,limits:['Both views are inactive author candidates, not current registered scope approvals.','Native memory validator separately verifies the exact10 primary cards and stable ordinary-to-memory origins.','Recall cards do not certify a learner or replace source-operator recognition, classification or explanation.'],currentStrictNetIncrease:0},null,2)+'\n')
console.log(JSON.stringify({inactiveViewsCompiled:2,actualVisiblePairs:4,negativeMissingMemoryWitnesses:2,scopeErrors:0,currentStrictNetIncrease:0}))
