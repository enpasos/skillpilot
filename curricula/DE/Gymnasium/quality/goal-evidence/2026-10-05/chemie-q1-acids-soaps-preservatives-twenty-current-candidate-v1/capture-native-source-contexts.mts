import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {buildGoalBookSourceAtlasInputs,readGoalBookSourceAtlasInputConfig} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-acids-soaps-preservatives-twenty-current-candidate-v1',iso=resolve(root,'tmp/chemie-q1-acids-soaps-preservatives-twenty-native-isolated-20261005-v1')
const read=(p:string):any=>JSON.parse(readFileSync(resolve(iso,p),'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(resolve(iso,p))).digest('hex')
const selection=JSON.parse(readFileSync(resolve(root,own,'selection-and-base.actual.receipt.json'),'utf8')),ids=new Set<string>(selection.goalIds)
const config='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json',built=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(config,iso),iso),receipt=built.receipt as any,seen=new Set<string>(),contexts:any[]=[]
for(const scope of receipt.scopes)for(const w of scope.witnesses){
 if(!ids.has(w.goalId))continue
 const key=w.sourceExtractionPath+'|'+w.sourceGoalId
 if(seen.has(key))continue;seen.add(key)
 const extraction=read(w.sourceExtractionPath),source=extraction.sourceGoals.find((g:any)=>g.id===w.sourceGoalId),mapping=read(w.mappingPath),group=mapping.mappings.filter((m:any)=>m.legacyGoalId===w.sourceGoalId)
 contexts.push({sourceExtractionPath:w.sourceExtractionPath,sourceExtractionSHA256:sha(w.sourceExtractionPath),sourceGoal:source,sourceDocument:extraction.sourceDocument??extraction.sourceDocuments,mappingPath:w.mappingPath,mappingSHA256:sha(w.mappingPath),wholeSourceGroupMappings:group,wholeSourceGroupDecision:mapping.decisions?.find((d:any)=>d.sourceGoalId===w.sourceGoalId),affectedTwentyGoalIds:receipt.scopes.flatMap((s:any)=>s.witnesses).filter((x:any)=>x.sourceExtractionPath===w.sourceExtractionPath&&x.sourceGoalId===w.sourceGoalId&&ids.has(x.goalId)).map((x:any)=>x.goalId).filter((x:string,i:number,a:string[])=>a.indexOf(x)===i),actualWitnesses:receipt.scopes.flatMap((s:any)=>s.witnesses.filter((x:any)=>x.sourceExtractionPath===w.sourceExtractionPath&&x.sourceGoalId===w.sourceGoalId&&ids.has(x.goalId)).map((x:any)=>({scopeId:s.scopeId??s.viewId,jurisdiction:s.jurisdiction,courseProfile:s.courseProfile,...x})))})
}
const outputs=Object.fromEntries(Object.entries(built.outputs).map(([p,value])=>[p,'sha256:'+createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex')]))
writeFileSync(resolve(root,own,'twenty-native-whole-source-contexts.before.snapshot.json'),JSON.stringify({authority:'current_source_input_snapshot_not_independent_approval',contexts,sourceAtlasInputBindings:receipt.inputBindings,prospectiveOutputHashes:outputs,strictNetDelta:0,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({actualWholeSourceContexts:contexts.length,jurisdictions:[...new Set(contexts.map(c=>c.sourceExtractionPath.match(/input\/(..)\//)?.[1]))],selected20:ids.size,activeWrites:0}))
