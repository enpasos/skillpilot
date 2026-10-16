// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
const repo=process.cwd(),out=dirname(fileURLToPath(import.meta.url))
const h=resolve(repo,'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const sha=(p:string)=>`sha256:${createHash('sha256').update(readFileSync(p)).digest('hex')}`
async function main(){
 const composition=await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
 const book=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')).href)
 const prior='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-paired-course-terminal-nine-content-and-31views-H-technical-20261016-v1'
 const materialize=read(`${prior}/MATERIALIZE.actual-paired13-nine-machine-exam-content-31views-with-SH-source-correction.json`)
 const canonical=materialize.changedHInputs.find((r:any)=>r.normalPath.includes('/canonical/'))
 const before=read(canonical.before.path),after=read(canonical.after.path)
 const ids=new Set<string>(read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-five-supported-description-normal-H-and-native5-technical-20261016-v1/CENTRAL.actual-current435.all-five-gates-paired-final.json').subjects[0].currentGoalIds)
 const paths=(nodes:any[])=>{
   const result=new Map<string,any[]>();const walk=(ns:any[],ancestors:any[])=>{for(const n of ns){const self={runtimeId:n.runtimeId,kind:n.kind,sourceGoalId:n.sourceGoalId??null,label:n.label};if(n.sourceGoalId&&ids.has(n.sourceGoalId)){if(!result.has(n.sourceGoalId)) result.set(n.sourceGoalId,[]);result.get(n.sourceGoalId)!.push({ancestors,self})}walk(n.children??[],[...ancestors,self])}};walk(nodes,[]);return result
 }
 const rows=[]
 for(const entry of materialize.changedHInputs.filter((r:any)=>r.normalPath.includes('/composition-views/'))){
   if(sha(resolve(repo,entry.before.path))!==entry.before.sha256||sha(resolve(h,entry.normalPath))!==entry.after.sha256) throw new Error(`View pin mismatch ${entry.normalPath}`)
   const a=composition.compileCompositionView(read(entry.before.path),before)
   const b=composition.compileCompositionView(read(entry.after.path),after)
   const ap=paths(a.compiledRootNodes),bp=paths(b.compiledRootNodes)
   const all=[...new Set([...ap.keys(),...bp.keys()])]
   const changes=all.filter(id=>book.stableGoalBookJson(ap.get(id)??[])!==book.stableGoalBookJson(bp.get(id)??[])).map(id=>({goalId:id,before:ap.get(id)??[],after:bp.get(id)??[]}))
   rows.push({normalPath:entry.normalPath,scope:read(entry.after.path).scope,before:entry.before,after:entry.after,beforeCanonicalSha256:canonical.before.sha256,afterCanonicalSha256:canonical.after.sha256,beforeOrdinaryCount:ap.size,afterOrdinaryCount:bp.size,addedOrdinaryIds:[...bp.keys()].filter(id=>!ap.has(id)),removedOrdinaryIds:[...ap.keys()].filter(id=>!bp.has(id)),changedOrdinaryVisibleAncestry:changes,beforeCompilerFindings:a.findings,afterCompilerFindings:b.findings})
 }
 const result={role:'Read-only exact31 learner-view projection corroboration; separate from the full435 technical book view',ordinaryUniverseSize:ids.size,canonicalBeforeCount:before.goals.length,canonicalAfterCount:after.goals.length,views:rows.length,viewsWithOrdinaryMembershipChanges:rows.filter(r=>r.addedOrdinaryIds.length||r.removedOrdinaryIds.length).length,viewsWithOrdinaryAncestryChanges:rows.filter(r=>r.changedOrdinaryVisibleAncestry.length).length,afterCompilerErrors:rows.flatMap(r=>r.afterCompilerFindings).filter(r=>r.severity==='error').length,rows}
 writeFileSync(resolve(out,'VIEWS31.actual-composition-compiler-ordinary-membership-and-ancestry.json'),`${JSON.stringify(result,null,2)}\n`)
 console.log(JSON.stringify({...result,rows:undefined}))
}
main().catch(e=>{console.error(e);process.exitCode=1})
