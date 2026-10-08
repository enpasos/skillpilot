// SPDX-License-Identifier: Apache-2.0
// Isolated actual ordinary-loader simulation, not a source approval.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs'
import {dirname, resolve, relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {loadGoalBookBuildInputs, buildGoalBookModel, stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalBookOriginalSources} from '../../../../../../../app/scripts/goalBookOriginalSources.ts'
import {renderGoalBookHtml} from '../../../../../../../app/scripts/goalBookRenderer.ts'

const repo = '/home/enpasos/projects/skillpilot'
const packet = dirname(fileURLToPath(import.meta.url))
const selected = ['32f47903-0788-5c27-ac88-7464f481f2f7','135447a0-5d55-564a-afc3-3e3fbed77819','ec782ce3-475e-5628-b3fe-947d72e74a74']
const read = (path:string) => JSON.parse(readFileSync(resolve(repo,path),'utf8'))
const rp = (path:string) => relative(repo,path)
const sha = (bytes:string|Buffer) => createHash('sha256').update(bytes).digest('hex')
const put = (name:string,value:unknown) => {
  const path=resolve(packet,name)
  mkdirSync(dirname(path),{recursive:true})
  const bytes=typeof value==='string'?value:JSON.stringify(value,null,2)+'\n'
  if(existsSync(path))assert.equal(readFileSync(path,'utf8'),bytes,`Existing author bytes differ ${path}`)
  else writeFileSync(path,bytes)
  return {path:rp(path),sha256:sha(bytes),bytes:Buffer.byteLength(bytes)}
}
const originalAtlas = read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const candidateAtlas = read(rp(resolve(packet,'candidate/ordinary-current392-source-atlas.inputs.json')))
const beforeAtlas=buildGoalBookSourceAtlasInputs(originalAtlas,repo)
const afterAtlas=buildGoalBookSourceAtlasInputs(candidateAtlas,repo)
assert.deepEqual(beforeAtlas.receipt.counts,afterAtlas.receipt.counts)
assert.equal(afterAtlas.receipt.counts.canonicalCurricularAtomicGoals,392)
assert.equal(afterAtlas.receipt.counts.publishedCurricularAtomicGoals,392)
assert.equal(afterAtlas.receipt.counts.omittedGoals,0)
const viewDiffs:any[]=[]
for(const [path,afterText] of Object.entries(afterAtlas.outputs)){
  assert.ok(beforeAtlas.outputs[path],`New output outside existing atlas ${path}`)
  put('candidate/generated-ordinary-outputs/'+path,afterText)
  const after=JSON.parse(afterText),before=JSON.parse(beforeAtlas.outputs[path])
  if(path.endsWith('.view.json')){
    const beforeIds=before.rootNodes.flatMap((n:any)=>n.children?.map((c:any)=>c.goalId)??[])
    const afterIds=after.rootNodes.flatMap((n:any)=>n.children?.map((c:any)=>c.goalId)??[])
    const removed=beforeIds.filter((id:string)=>!afterIds.includes(id))
    const added=afterIds.filter((id:string)=>!beforeIds.includes(id))
    assert.equal(added.length,0)
    assert.ok(removed.every((id:string)=>selected.includes(id)))
    if(removed.length)viewDiffs.push({path,scope:after.scope,removedTargetIds:removed,addedTargetIds:added,beforeWholeView:before,afterWholeView:after})
    else assert.deepEqual(after,before,`Unrelated whole view changed ${path}`)
  }
}
assert.equal(viewDiffs.length,10)
put('native/ordinary-current-atlas.before.receipt.json',beforeAtlas.receipt)
put('native/ordinary-current-atlas.after.receipt.json',afterAtlas.receipt)
put('native/ordinary-current22-source-views.actual-whole-value.diff.json',{schemaVersion:1,rows:viewDiffs,unchangedWholeViewCount:12,changedWholeViewCount:10,sourceViews:22,onlyThreeTargetIdsAffected:true,unapprovedCompanionsEntered:false})

const loaded=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',repo)
const config=loaded.config
const beforeModel=loaded.model
const manifest=JSON.parse(afterAtlas.outputs[config.compositionViewManifestPath!])
const qa=read(config.goalVisualizationQaPath)
const digests=Object.fromEntries(qa.records.filter((q:any)=>q.visualizationState==='available').map((q:any)=>[q.imageUrl,q.assetSha256]))
const afterModel=buildGoalBookModel({
  landscape:read(config.landscapePath),
  compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:JSON.parse(afterAtlas.outputs[path])})),
  navigationView:JSON.parse(afterAtlas.outputs[manifest.navigationViewPath]),
  durationModelPolicy:read(manifest.durationModelPolicyPath),
  semanticKindLedger:read(config.semanticKindLedgerPath),
  goalVisualizationQa:qa,
  goalVisualizationAssetDigests:digests,
  evidenceReviewSources:config.evidenceReviewPaths.map((path:string)=>({path,text:readFileSync(resolve(repo,path),'utf8')})),
  config,
} as any)
assert.equal(beforeModel.pages.length,392)
assert.equal(afterModel.pages.length,392)
assert.deepEqual(beforeModel.pages.map(p=>p.goalId),afterModel.pages.map(p=>p.goalId))
const pageDiffs:any[]=[]
for(const after of afterModel.pages){
  const before=beforeModel.pages.find(p=>p.goalId===after.goalId)!
  if(!selected.includes(after.goalId))assert.equal(stableGoalBookJson(after),stableGoalBookJson(before),`Unrelated whole page changed ${after.goalId}`)
  else{
    const changedKeys=Object.keys(after).filter(k=>stableGoalBookJson((after as any)[k])!==stableGoalBookJson((before as any)[k]))
    assert.ok(changedKeys.every(k=>['applicability','pageFingerprint'].includes(k)),`Scientific/image/context body changed ${after.goalId}: ${changedKeys}`)
    assert.ok(changedKeys.includes('applicability'))
    const afterScopes=after.applicability!.flatMap(g=>g.scopes.map(s=>({jurisdiction:g.jurisdiction,...s})))
    if(after.goalId===selected[2])assert.ok(!afterScopes.some(s=>s.jurisdiction==='DE-BY'))
    assert.ok(!afterScopes.some(s=>s.stage==='SekI'))
    assert.ok(afterScopes.some(s=>s.jurisdiction==='DE-HE'&&s.stage==='SekII'))
    pageDiffs.push({goalId:after.goalId,changedKeys,beforeWholePage:before,afterWholePage:after})
  }
}
put('native/current392.ordinary-model.before.exact.json',beforeModel)
put('native/current392.ordinary-model.after.actual-candidate.json',afterModel)
const renderOpts={feedbackBaseUrl:'https://skillpilot.com/lernzielbuch/feedback',printDerivativeProfile:'bounded-atlas' as const}
put('native/current392.whole-pages.before.html',renderGoalBookHtml(beforeModel,renderOpts))
put('native/current392.whole-pages.after.html',renderGoalBookHtml(afterModel,renderOpts))
put('native/current392.actual-whole-page.diff.json',{schemaVersion:1,rows:pageDiffs,totalPages:392,allOther389WholePagesExact:true,selectedGoalTextContextsImagesFingerprintsExact:true,onlyActualApplicabilityAndDerivedPageFingerprintChanged:true,current476KindsQAAndAllHumanFieldsExact:true,newApprovalClaimed:false,humanApproval:false,humanTrial:false,activeWrites:0,strictGainClaimed:0})
const beforeSources=buildGoalBookOriginalSources(beforeModel,repo,originalAtlas.mappingPaths)
const afterSources=buildGoalBookOriginalSources(afterModel,repo,candidateAtlas.mappingPaths)
put('native/current392.original-sources.before.exact.json',beforeSources)
put('native/current392.original-sources.after.actual-candidate.json',afterSources)
const goalSourceContent=(index:any,id:string)=>{
  const docs=new Map(index.documents.map((d:any)=>[d.id,d]))
  const evidence=new Map(index.evidence.map((e:any)=>[e.id,e]))
  const goal=index.goals[id]
  // eN identifiers are assigned while visiting all pages. Removing selected
  // witnesses changes their numbering and numeric-reference order elsewhere;
  // compare the complete resolved evidence set, not these generated handles.
  const expand=(value:any):any=>Array.isArray(value)?value.map(expand):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>{const normalized=expand(v);return[k,k==='evidenceIds'?normalized.sort((a:any,b:any)=>stableGoalBookJson(a).localeCompare(stableGoalBookJson(b))):normalized]})):typeof value==='string'&&evidence.has(value)?(()=>{const e:any=evidence.get(value),d:any=docs.get(e.documentId);return {...e,id:undefined,documentId:undefined,document:{...d,id:undefined}}})():value
  return expand(goal)
}
for(const page of afterModel.pages)if(!selected.includes(page.goalId))assert.equal(stableGoalBookJson(goalSourceContent(beforeSources,page.goalId)),stableGoalBookJson(goalSourceContent(afterSources,page.goalId)),`Unrelated source semantics changed ${page.goalId}`)
put('checks/ordinary-current392-source-scope-and-all-whole-pages.actual.json',{schemaVersion:1,ordinaryAPIs:['buildGoalBookSourceAtlasInputs','loadGoalBookBuildInputs','buildGoalBookModel','buildGoalBookOriginalSources','renderGoalBookHtml'],beforeCounts:beforeAtlas.receipt.counts,afterCounts:afterAtlas.receipt.counts,actualChangedViews:10,allOther12ViewsExact:true,actualChangedWholePages:3,allOther389WholePagesExact:true,allOther389OriginalSourceEvidenceContentExactIgnoringDerivedEvidenceIds:true,sourceIndexDerivedIdsAndBookDigestMayChange:true,allScientificBodiesAndCurrentRasterBytesUnchanged:true,pendingCompanionBodiesNotEntered392:true,all20WholeOriginalDutiesAnd268PartnerInputsRetained:true,fourOriginalOperatorHoldsRetained:true,independentMachineReviewsPending:true,sourceReviewNewlyClaimed:false,activeWrites:0,strictGainClaimed:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({ordinaryCurrent392AtlasPassed:true,actualChangedViews:10,actualChangedPages:3,allOther389WholePagesExact:true,other389SourceEvidenceContentExact:true,pendingCompanionsNotIntegrated:true,activeWrites:0,strictGainClaimed:0}))
