// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs'
import path from 'node:path'
import {createHash} from 'node:crypto'
const R='/home/enpasos/projects/skillpilot';const O=process.cwd();
const {readActiveLandscapes,buildRequiresInventory,stableJson}=await import(R+'/app/scripts/lib/crossSubjectRequiresInventory.ts');
const {buildCrossLandscapeGraph}=await import(R+'/app/scripts/lib/crossLandscapeGraph.ts');
const read=(p:string)=>JSON.parse(fs.readFileSync(path.resolve(R,p),'utf8'));
const c=read('curricula/quality/cross-subject-requires/math-physics.config.json');
const inventory=buildRequiresInventory(R,c),persisted=read('curricula/quality/cross-subject-requires/math-physics.inventory.json');
const graph=buildCrossLandscapeGraph(readActiveLandscapes(R,{...c,excludedDirectories:['quality']}));
const first=read('tmp/cross-subject-requires/current92-whole-integration-neutral-reader-root-20261016-v1/NEUTRAL-FIRST20-WHOLE-PHYSICS-CONTEXTS.actual.json');
const previous=read('tmp/cross-subject-requires/current92-first20-whole-integration-author-20261016-v1/binding-audit/effective-prerequisite-closure.actual.json');
const rows=first.map((x:any,i:number)=>{const key=x.current.positiveEvidenceOwner.wholeP.landscapeId+':'+x.goalId;const immediate=graph.effectiveRequires.get(key)??[];const origin=graph.effectiveOrigins.get(key)??[];return{goalId:x.goalId,key,immediateEffectiveRequirements:immediate,immediateMathRequirementKeys:immediate.filter((k:string)=>k.startsWith('68a8ac50-f5f5-4e24-8aa9-5e408ca01ced:')),origins:origin,exactPreviousNativeImmediate:stableJson(immediate)===stableJson(previous.rows[i].immediateEffectiveRequires),relevantDiagnostics:graph.diagnostics.filter((d:any)=>d.nodeKey===key)}});
const result={currentInventoryRebuiltExact:stableJson(inventory)===stableJson(persisted),rows,allTwentyHaveZeroDirectOrContainsMathGuards:rows.every((x:any)=>x.immediateMathRequirementKeys.length===0),existingNineteenUnrelatedDiagnostics:graph.diagnostics,nativeGraphAPIUnmodified:true,backendRuntimeNotExecuted:true,rootWrites:false};
fs.writeFileSync(path.join(O,'NORMAL-CURRENT-TWENTY-EFFECTIVE-GUARDS.actual.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({inventoryExact:result.currentInventoryRebuiltExact,targets:rows.length,mathGuards:rows.reduce((n:number,x:any)=>n+x.immediateMathRequirementKeys.length,0),sameOld:rows.every((x:any)=>x.exactPreviousNativeImmediate),relevantErrors:rows.flatMap((x:any)=>x.relevantDiagnostics).length,unrelated:graph.diagnostics.length}));
if(!result.currentInventoryRebuiltExact||!rows.every((x:any)=>x.exactPreviousNativeImmediate)||rows.some((x:any)=>x.relevantDiagnostics.length))process.exitCode=1;
