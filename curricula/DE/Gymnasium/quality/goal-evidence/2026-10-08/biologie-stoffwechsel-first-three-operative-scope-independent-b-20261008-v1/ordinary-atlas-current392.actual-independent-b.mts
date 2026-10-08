import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const repo='/home/enpasos/projects/skillpilot'
const own=dirname(fileURLToPath(import.meta.url))
const author=resolve(own,'../biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1')
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const hash=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const guards=read(resolve(author,'input/actual-current476-after19-input.guards.json'))
for(const g of guards.guards){
 const data=readFileSync(resolve(repo,g.original.path))
 assert.equal(hash(data),g.original.sha256,g.original.path)
 assert.equal(data.length,g.original.bytes,g.original.path)
}
const before=buildGoalBookSourceAtlasInputs(read(resolve(author,'input/atlas-current.inputs.exact.json')),repo)
const after=buildGoalBookSourceAtlasInputs(read(resolve(author,'candidate/ordinary-current392-source-atlas.inputs.json')),repo)
assert.deepEqual(before.receipt.counts,after.receipt.counts)
const changed:any[]=[];let unchanged=0;let viewCount=0
for(const [p,text] of Object.entries(after.outputs)){
 assert.equal(text,readFileSync(resolve(author,'candidate/generated-ordinary-outputs',p),'utf8'),p)
 if(!p.endsWith('.view.json') || !p.includes('/source-views/'))continue
 viewCount++
 const b=JSON.parse(before.outputs[p]),a=JSON.parse(text)
 const ids=(v:any)=>v.rootNodes.flatMap((n:any)=>n.children?.map((c:any)=>c.goalId)??[])
 const removed=ids(b).filter((id:string)=>!ids(a).includes(id)),added=ids(a).filter((id:string)=>!ids(b).includes(id))
 if(removed.length)changed.push({path:p,scope:a.scope,removed,added})
 else {assert.deepEqual(a,b);unchanged++}
}
assert.equal(viewCount,22);assert.equal(changed.length,10);assert.equal(unchanged,12)
const report={role:'Actual independent B ordinary source atlas run, pure helper, no active write',ordinaryFunction:'buildGoalBookSourceAtlasInputs',liveOriginalGuardsExact:guards.guards.length,actualCounts:after.receipt.counts,actualOutputCount:Object.keys(after.outputs).length,allActualCandidateOutputBytesMatchAuthorSealedOutputs:true,sourceViews:viewCount,changedWholeViews:changed,unchangedWholeViews:unchanged,activeWrites:0,strictGain:0,humanApproval:false}
writeFileSync(resolve(own,'ordinary-atlas-current392.actual-independent-b.run.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({guardCount:guards.guards.length,viewCount,changedViews:changed.length,unchangedViews:unchanged,counts:after.receipt.counts,allOutputsExact:true,activeWrites:0}))
