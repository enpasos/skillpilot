import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {buildGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
const own=path.relative(process.cwd(),path.dirname(new URL(import.meta.url).pathname))
const read=(p:string)=>JSON.parse(fs.readFileSync(p,'utf8'))
const write=(n:string,v:any)=>fs.writeFileSync(`${own}/${n}`,JSON.stringify(v,null,2)+'\n',{flag:'wx'})
const beforeCfg=read(`${own}/current392.before.corrected-native-config.json`),afterCfg=read(`${own}/current392.after.corrected-native-config.json`)
const b=buildGoalBookSourceAtlasInputs(beforeCfg),a=buildGoalBookSourceAtlasInputs(afterCfg)
assert.deepEqual(b.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})),a.receipt.scopes.map(s=>({key:s.key,goalIds:s.goalIds})))
assert.deepEqual(b.receipt.counts,a.receipt.counts)
write('current392.before.native-receipt.actual.json',b.receipt);write('current392.after.native-receipt.actual.json',a.receipt)
const goalIds=[...new Set(b.receipt.scopes.flatMap(s=>s.goalIds))];assert.equal(goalIds.length,392)
const pages=goalIds.map(goalId=>({goalId,applicability:b.receipt.scopes.filter(s=>s.goalIds.includes(goalId)).map(s=>({jurisdiction:s.jurisdiction,scopes:[{stage:s.stage,durationModel:null,courseProfile:s.courseProfile}]}))}))
const model:any={book:{id:beforeCfg.bookId,landscapeId:read(beforeCfg.landscapePath).landscapeId},source:{landscapePath:beforeCfg.landscapePath},digest:'sha256:'+createHash('sha256').update(JSON.stringify(pages)).digest('hex'),pages}
const bi=buildGoalBookOriginalSources(model,process.cwd(),beforeCfg.mappingPaths),ai=buildGoalBookOriginalSources(model,process.cwd(),afterCfg.mappingPaths)
write('current392.sourceindex.before.actual.json',bi);write('current392.sourceindex.after.actual.json',ai)
const norm=(index:any,gid:string)=>{
 const evidence=new Map(index.evidence.map((e:any)=>[e.id,e])),docs=new Map(index.documents.map((d:any)=>[d.id,d]))
 return index.goals[gid].map((r:any)=>({...r,evidenceIds:undefined,evidence:r.evidenceIds.map((id:string)=>{const e:any=evidence.get(id);return {...e,id:undefined,documentId:undefined,document:{...(docs.get(e.documentId) as any),id:undefined}}}).sort((x:any,y:any)=>JSON.stringify(x).localeCompare(JSON.stringify(y)))}))
}
const scope=read(`${own}/input-snapshots/author-v3/neutral-eighteen-source-v3-locator-review.entry.json`).scopeGoalIds as string[]
const changed=goalIds.filter(gid=>JSON.stringify(norm(bi,gid))!==JSON.stringify(norm(ai,gid)))
assert.equal(changed.length,18);assert.deepEqual([...changed].sort(),[...scope].sort())
const ownV2=read(`${own}/prior-own-v2/operative-eighteen-independent-a.first-judgment.json`)
const checks=scope.map(gid=>{
 const prior=ownV2.judgments.find((r:any)=>r.goalId===gid)
 const current=norm(ai,gid)
 const previousIndex={evidence:prior.wholeSourceIndexEvidence,documents:prior.wholeSourceIndexDocuments,goals:{[gid]:prior.wholeSourceIndexContext}}
 assert.deepEqual(current,norm(previousIndex,gid))
 return {goalId:gid,currentWholeSourceIndexContext:ai.goals[gid],wholeContextExactToOwnPreviouslyReadV2:true,scientificBoundariesKeep:true}
})
write('current392-native-sourceindex-and-visible-scope-check.actual.json',{schemaVersion:1,actualExitCode:0,actualCurrentAtomicGoalCount:392,actualNativeWholeGoalCount:read(beforeCfg.landscapePath).goals.length,actualSourceViews:a.receipt.counts.sourceViews,exactVisibleSetsAndCounts:true,changedSourceContexts:changed,otherSourceContextChanges:[],all18WholeContextsExactToOwnPreviouslyReadV2:true,checks,fullBookModelBuilt:false,whole144ReleaseProjectionPassed:false,D_P_V_Approvals:0,humanApproval:false,activeWrites:false})
console.log(JSON.stringify({actualCurrentAtomicGoalCount:392,sourceViews:a.receipt.counts.sourceViews,exactVisibleSets:true,all18WholeContextsExactToOwnV2:true,otherSourceContextChanges:0,humanApproval:false}))
