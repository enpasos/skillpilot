// SPDX-License-Identifier: Apache-2.0
// Ordinary unchanged source helpers, isolated current397 author inputs. No active integration.
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {spawnSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const R=process.cwd(),P='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-medical-ethics-ten-current397-author-successor-20261011-v2'
const BASE='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/biologie-bio8-current369-combined-Bio3-targeted-author-successor-20261011-v6'
const C=path.join(R,'tmp/medical10-current397-v2-normal-private-capsule')
const read=(p:string)=>JSON.parse(fs.readFileSync(path.join(R,p),'utf8'))
const ref=(p:string)=>{const b=fs.readFileSync(path.join(R,p));return {path:p,sha256:'sha256:'+createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const put=(p:string,x:any)=>{const f=path.join(R,P,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(x,null,2)+'\n')}
const mirror=(p:string)=>{const f=path.join(C,P,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.copyFileSync(path.join(R,P,p),f)}
const pc=P+'/positive/P10-medical.author-pending.config.json',cand=P+'/profiles/ten-complete-positive-candidates.author.json'
const command=[path.join(R,'app/node_modules/.bin/tsx'),path.join(C,'app/scripts/materializePositiveGoalEvidenceCandidates.ts'),'--config',pc,'--candidates',cand,'--write']
const result=spawnSync(command[0],command.slice(1),{cwd:C,encoding:'utf8',maxBuffer:4*1024*1024})
put('checks/normal-P10-materialization.actual-command.json',{argv:command,exitCode:result.status,stdout:result.stdout,stderr:result.stderr,activeWrites:false,scienceApproval:false})
assert.equal(result.status,0,result.stderr)
const pp='positive/P10-medical.author-pending.review.jsonl'
fs.mkdirSync(path.dirname(path.join(R,P,pp)),{recursive:true});fs.copyFileSync(path.join(C,P,pp),path.join(R,P,pp))
const {buildGoalBookSourceAtlasInputs}=await import(pathToFileURL(path.join(C,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const {loadGoalBookBuildInputs,writeGoalBookModel,stableGoalBookJson}=await import(pathToFileURL(path.join(C,'app/scripts/goalBookModel.ts')).href)
const {buildGoalBookOriginalSources}=await import(pathToFileURL(path.join(C,'app/scripts/goalBookOriginalSources.ts')).href)
const atlasConfig=read(P+'/sources/normal397-medical10.author.inputs.json')
const atlas=buildGoalBookSourceAtlasInputs(atlasConfig,C)
put('sources/normal397-atlas.receipt.whole.actual.json',atlas.receipt)
const aliases=new Map<string,string>()
for(const [p,bytes]of Object.entries(atlas.outputs)){
 const f=path.join(C,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,bytes as string)
 const dst=P+'/sources/normal-output/'+path.basename(p);aliases.set(p,dst)
 fs.mkdirSync(path.dirname(path.join(R,dst)),{recursive:true});fs.writeFileSync(path.join(R,dst),bytes as string)
}
const manifest=JSON.parse(atlas.outputs[atlasConfig.manifestPath])
const portable={...manifest,navigationViewPath:aliases.get(manifest.navigationViewPath),sourcePaths:manifest.sourcePaths.map((p:string)=>aliases.get(p))}
put('sources/normal-output/atlas.sources.portable.json',portable)
for(const dst of aliases.values()){const f=path.join(C,dst);fs.mkdirSync(path.dirname(f),{recursive:true});fs.copyFileSync(path.join(R,dst),f)}
mirror('sources/normal-output/atlas.sources.portable.json')
const cfg=read(P+'/native/whole397-medical10.normal.config.json')
cfg.compositionViewManifestPath=P+'/sources/normal-output/atlas.sources.portable.json'
put('native/whole397-medical10.normal.config.json',cfg);mirror('native/whole397-medical10.normal.config.json')
const current=await loadGoalBookBuildInputs(P+'/native/whole397-medical10.normal.config.json',C)
assert.equal(current.model.pages.length,397)
await writeGoalBookModel(current.model,path.join(R,P,'native/whole397-medical10.normal-model.actual.json'))
const baseline=read(BASE+'/native/whole397.currentRoot-Bio3-plus-Bio8.normal-model.actual.json')
const before=new Map(baseline.pages.map((p:any)=>[p.goalId,p]))
const normalized=(p:any)=>{const q=structuredClone(p);for(const k of ['pageNumber','navigationOrder','treeOrder','pageFingerprint'])delete q[k];for(const k of ['requires','reverseRequires'])q[k]=q[k].map((r:any)=>{const x={...r};delete x.pageNumber;return x});return q}
const delta=current.model.pages.flatMap((p:any)=>{
 const b:any=before.get(p.goalId),a=normalized(p),z=normalized(b)
 if(stableGoalBookJson(a)===stableGoalBookJson(z))return []
 return [{goalId:p.goalId,fields:Object.keys(a).filter(k=>stableGoalBookJson(a[k])!==stableGoalBookJson(z[k])),before:b,after:p}]
})
const ids=read(P+'/FIRST.actual-neutral-medical10-continuation-author-inputs.json').goalIds
const affected=current.model.pages.filter((p:any)=>ids.includes(p.goalId)||delta.some((d:any)=>d.goalId===p.goalId)).map((p:any)=>p.goalId)
put('checks/current397-whole-normal-page-deltas.actual.json',{actualWholePageDeltas:delta,medical10Ids:ids,affectedNativeUnion:affected,otherCanonicalGoalsExact:true,pageNormalization:'Only page positions, page fingerprints and referenced page numbers omitted; actual full text, P, raster and source content retained',sourceApproval:false,activeWrites:false})
const land=read(cfg.landscapePath),mappingData=atlasConfig.mappingPaths.map((p:string)=>({path:p,data:JSON.parse(fs.readFileSync(path.join(C,p),'utf8'))}))
const originals=buildGoalBookOriginalSources(current.model,C,atlasConfig.mappingPaths)
put('sources/whole397.normal-original-sources.actual.json',originals)
const expand=(id:string)=>(originals.goals[id]??[]).map((s:any)=>({...s,evidence:s.evidenceIds.map((id:string)=>{const e=originals.evidence.find((x:any)=>x.id===id);return {...e,document:originals.documents.find((x:any)=>x.id===e.documentId)}})}))
const goals=affected.map((id:string)=>{
 const edges=[]
 for(const m of mappingData){
  const source=JSON.parse(fs.readFileSync(path.join(C,m.data.sourceExtractionPath),'utf8'))
  for(const edge of m.data.mappings.filter((x:any)=>x.canonicalGoalId===id)){
   const row=(source.sourceGoals??source.goals??[]).find((x:any)=>(x.id??x.sourceGoalId)===edge.legacyGoalId)
   const partners=(m.data.decisions??[]).filter((x:any)=>(x.sourceGoalId??x.legacyGoalId)===edge.legacyGoalId)
   edges.push({mappingPath:m.path,sourceExtractionPath:m.data.sourceExtractionPath,wholeMapping:edge,wholeReviewDecisions:partners,wholeSourceRow:row??null,wholeSourceDocument:source.sourceDocument??null,wholeSourceDocuments:source.sourceDocuments??null})
  }
 }
 return {goalId:id,wholeCurrentGoal:land.goals.find((x:any)=>x.id===id),normalCurrentWholeSourcePage:current.model.pages.find((x:any)=>x.goalId===id),normalSourcePayload:expand(id),directWholeMappingSourcePartners:edges,normalCurrentSourceScopes:atlas.receipt.scopes.filter((s:any)=>s.goalIds.includes(id)).map((s:any)=>({key:s.key,jurisdiction:s.jurisdiction,stage:s.stage,courseProfile:s.courseProfile,witnesses:s.witnesses.filter((w:any)=>w.goalId===id)}))}
})
put('inputs/current397-medical10-and-actual-affected-union.whole-source-context.neutral.json',{role:'Actual normal raw source/context extraction; no scientific or source-union approval',normalModelDigest:current.model.digest,normalCounts:atlas.receipt.counts,goals})
const batch={...read(BASE+'/native/current397-native19.author.batch.config.json'),batchId:'biologie-medical10-current397-native-actual-union-20261011-v2',bookId:'biologie-medical10-current397-native-actual-union-20261011-v2',title:'Biologie – zehn medizinisch-ethische Ziele und tatsächlich betroffene ganze Kontexte',baseGoalBookConfigPath:P+'/native/whole397-medical10.normal.config.json',goalIds:affected,outputDirectory:P+'/native/current397-medical-native-union'}
put('native/current397-medical-native-union.author.batch.config.json',batch);mirror('native/current397-medical-native-union.author.batch.config.json')
const {prepareGoalDescriptionRolloutBatch}=await import(pathToFileURL(path.join(C,'app/scripts/materializeGoalDescriptionRolloutBatch.ts')).href)
const native=await prepareGoalDescriptionRolloutBatch(P+'/native/current397-medical-native-union.author.batch.config.json')
fs.cpSync(path.join(C,batch.outputDirectory),path.join(R,batch.outputDirectory),{recursive:true})
put('checks/normal-native-union-materialization.actual.json',{normalBatchManifest:ref(batch.outputDirectory+'/batch-manifest.json'),wholeAtomicDenominator:397,normalPages:affected.length,wholeAffectedIds:affected,changedWholePages:delta.length,sourceCounts:atlas.receipt.counts,normalP10:ref(P+'/'+pp),independentReviewsCreated:0,activeWrites:false})
console.log(JSON.stringify({P10:10,completeCases:20,nativePages:affected.length,changedWholePages:delta.length,affectedIds:affected,normalCounts:atlas.receipt.counts,activeWrites:false}))
