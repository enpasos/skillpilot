// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const baselinePath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const candidatePath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1/source-atlas/current517-bounded378.author.inputs.json'
const baseline=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(baselinePath,root),root)
const candidate=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(candidatePath,root),root)
const bind=(p:string)=>({path:p,sha256:'sha256:'+createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex')})
const b=new Map(baseline.receipt.scopes.map((r:any)=>[r.key,r])),c=new Map(candidate.receipt.scopes.map((r:any)=>[r.key,r]));const allKeys=[...new Set([...b.keys(),...c.keys()])].sort();const delta=allKeys.map(key=>{const x:any=b.get(key),y:any=c.get(key),old=new Set<string>(x?.goalIds??[]),now=new Set<string>(y?.goalIds??[]);const added=[...now].filter(id=>!old.has(id)),removed=[...old].filter(id=>!now.has(id));return{key,before:old.size,after:now.size,added,removed,addedWholeSourceWitnesses:y?.witnesses.filter((w:any)=>added.includes(w.goalId))??[],removedWholeSourceWitnesses:x?.witnesses.filter((w:any)=>removed.includes(w.goalId))??[]}})
const q={schemaVersion:1,baselineInput:bind(baselinePath),candidateInput:bind(candidatePath),actualCurrentBaselineCounts:baseline.receipt.counts,actualCurrentCandidateCounts:candidate.receipt.counts,scopes:delta,baselineWholeOmitted:baseline.receipt.omittedGoals,candidateWholeOmitted:candidate.receipt.omittedGoals,sourceSnapshotsBefore:readGoalBookSourceAtlasInputConfig(baselinePath,root).sourceDocumentSnapshots?.length,sourceSnapshotsAfter:readGoalBookSourceAtlasInputConfig(candidatePath,root).sourceDocumentSnapshots?.length,actualCandidateOutputs:Object.keys(candidate.outputs),newScientificReviews:0,newSourceClearances:0,countsDerivedFromActualReviewedRoutes:true,activeWrites:[],humanApproval:false}
const out=resolve(own,'checks/source-atlas-actual-current-scope-ID-witness-deltas.json');writeFileSync(out,JSON.stringify(q,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({output:relative(root,out),baseline:q.actualCurrentBaselineCounts,candidate:q.actualCurrentCandidateCounts,changedScopes:delta.filter(r=>r.added.length||r.removed.length).map(({key,before,after,added,removed})=>({key,before,after,added,removed}))}))
