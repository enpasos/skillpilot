// SPDX-License-Identifier: Apache-2.0
// Actual normal model construction and exact preservation checks; no new science review.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,relative,dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {loadGoalBookBuildInputs,buildGoalBookModel,parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const author=resolve(own,'../biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1')
const used=new Map<string,any>(),ids=['82acfbde-9ce8-5658-892e-4dcfb1c3a1f1','328fd9d3-d3c3-5731-a8da-a909143d3962']
const bind=(p:string)=>{const b=readFileSync(resolve(root,p));return {path:relative(root,resolve(root,p)),sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const read=(p:string)=>{const b=bind(p);used.set(b.path,b);return JSON.parse(readFileSync(resolve(root,p),'utf8'))}
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const output=resolve(own,'actual-whole394-source-QS-native-and-P-preservation-root-v3-final-rationale.json')
assert.ok(!existsSync(output),'Immutable output must be new')
const activeBook='app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const before=await loadGoalBookBuildInputs(activeBook,root)
parseAndValidateGoalBookModel(before.model);assert.equal(before.model.pages.length,394)
const book=read(resolve(author,'candidate/whole394-final-normal-book.inactive.config.json'))
const rationaleAuthor=resolve(own,'../biologie-82ac-SN-ST-primary-operator-rationale-additive-author-v2')
const atlasConfig=read(resolve(rationaleAuthor,'candidate/normal-source-atlas-primary-operator-rationale-only-v2.inactive.inputs.json'))
const atlas=buildGoalBookSourceAtlasInputs(atlasConfig,root)
assert.equal(atlas.receipt.counts.canonicalCurricularAtomicGoals,394)
assert.equal(atlas.receipt.counts.publishedCurricularAtomicGoals,394)
assert.equal(atlas.receipt.counts.unresolvedSourceScopeDecisions,0)
const generated=(p:string)=>JSON.parse(atlas.outputs[p]),manifest=generated(atlasConfig.manifestPath)
const candidate=read(book.landscapePath),current=read(before.config.landscapePath)
assert.equal(candidate.goals.length,479)
assert.deepEqual(candidate.goals.map((g:any)=>g.id),current.goals.map((g:any)=>g.id))
const delta=candidate.goals.filter((g:any,i:number)=>!same(g,current.goals[i]))
assert.deepEqual(delta.map((g:any)=>g.id),[ids[1]])
const oldQ=current.goals.find((g:any)=>g.id===ids[1]),newQ=candidate.goals.find((g:any)=>g.id===ids[1])
assert.deepEqual(newQ,{...oldQ,requires:oldQ.requires.filter((id:string)=>id!==ids[0])})
const qa=read(book.goalVisualizationQaPath),activeQa=read(before.config.goalVisualizationQaPath)
const aliasTransfers=[]
assert.ok(same({...qa,records:[]},{...activeQa,records:[]}))
for(const old of qa.records){const actual=activeQa.records.find((v:any)=>v.goalId===old.goalId);assert.ok(actual);const a=structuredClone(old),b=structuredClone(actual);if(a.canonicalAssetPath!==b.canonicalAssetPath){const oldAsset=bind(a.canonicalAssetPath),activeAsset=bind(b.canonicalAssetPath);assert.equal(oldAsset.sha256,activeAsset.sha256);assert.equal(oldAsset.bytes,activeAsset.bytes);aliasTransfers.push({goalId:old.goalId,oldAsset,activeAsset,actualBytesExact:true});delete a.canonicalAssetPath;delete b.canonicalAssetPath}assert.ok(same(a,b),'Whole QA row must retain all human/scientific fields')}
assert.equal(aliasTransfers.length,16)
const imageDigests:Record<string,string>={}
for(const r of qa.records)if(r.visualizationState==='available'){
 const b=bind(r.publicAssetPath);assert.equal('sha256:'+b.sha256,r.assetSha256)
 imageDigests[r.imageUrl]='sha256:'+b.sha256
}
const after=buildGoalBookModel({landscape:candidate,semanticKindLedger:read(book.semanticKindLedgerPath),goalVisualizationQa:qa,goalVisualizationAssetDigests:imageDigests,compositionViewManifest:manifest,compositionViewSources:manifest.sourcePaths.map((p:string)=>({path:p,view:generated(p)})),navigationView:generated(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),evidenceReviewSources:[],config:book})
parseAndValidateGoalBookModel(after);assert.equal(after.pages.length,394)
const pages=before.model.pages.filter(p=>!same(p,after.pages.find(q=>q.goalId===p.goalId)))
assert.deepEqual(pages.map(p=>p.goalId).sort(),ids.toSorted())
const reviewedAfter=read(resolve(author,'native/full394-after-source-locator-and-requires.normal-model.actual.json'))
assert.ok(same(after.pages,reviewedAfter.pages),'All 394 normal candidate page values must match actual reviewed pages')
const sourceBindings=read(resolve(rationaleAuthor,'candidate/ordinary-QS-additive-current-paths-primary-rationale-only-v2.inactive-binding-manifest.json'))
const activeAtlas=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
const mappingChecks=[]
for(const row of sourceBindings.ordinaryOperativePathSuccessors){
 const old=read(row.existingBaseMappingPath);assert.ok(same(old,read(row.existingBaseMappingExact.path)))
 const m=read(row.wholeExactReviewedSource7Candidate.path)
 const sourcePath=activeAtlas.mappingPaths.find((p:string)=>p.includes('/'+row.state+'-whole-evolution-lower-roles.whole-successor.review.json'))
 assert.ok(sourcePath,'Actual Source7 mapping must be present in active atlas')
 const source=read(sourcePath),strip=(x:any)=>{const y=structuredClone(x);delete y.sourceExtractionPath;return y}
 // The intermediate scoped source successor removes only the unsupported 82ac witness;
 // complete current Source7 frame preservation is checked against that sealed successor.
 const narrower=read(resolve(author,'inputs/'+row.state+'-whole-narrow-proposed.mapping.exact.json'))
 const earlier=read(resolve(author,'candidate/mappings/'+row.state+'-whole-reviewed-Source7-operative-path.inactive.review.json'))
 const metaStrip=(x:any)=>{const y=strip(x);delete y.note;for(const z of y.decisions)delete z.rationale;return y}
 assert.ok(same(metaStrip(m),metaStrip(earlier)),'Whole decision/core/source/partner fields unchanged; only reviewed primary rationale and note differ')
 assert.ok(same(strip(earlier),strip(narrower)),'Original reviewed bounded source successor remains exact apart from transport path')
 const extraction=read(m.sourceExtractionPath)
 assert.equal(extraction.sourceDocument.key,m.sourceDocumentKey)
 const oldView=read(row.ordinaryLearnerViewPath),newView=read(row.wholeProposedCurrentLearnerView.path)
 assert.ok(same(oldView,read(row.wholeCurrentLearnerView.path)))
 const remove=(x:any):any=>Array.isArray(x)?x.filter(v=>!(v&&typeof v==='object'&&v.kind==='goalEntry'&&v.goalId===ids[0])).map(remove):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,remove(v)])):x
 assert.ok(same(remove(oldView),newView),'Only actual 82ac entry may be removed')
 assert.ok(JSON.stringify(newView).includes('2ae2da43-73d5-578f-84f4-be0585a7d8f9'))
 mappingChecks.push({state:row.state,wholeReviewedSource7Mapping:bind(sourcePath),wholeBoundedSuccessor:bind(row.wholeExactReviewedSource7Candidate.path),allExistingOperativeMappingsUnchanged:true,onlyActual82acViewEntryRemoved:true,whole2ae2Retained:true,originalSource7MappingReadForExistingEvidenceOnly:true})
}
const registry=read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),bio=registry.subjects.find((s:any)=>s.subject==='biologie')
const currentP=new Map<string,any>()
for(const cp of bio.positiveEvidenceConfigPaths){const c=read(cp);for(const line of readFileSync(resolve(root,c.reviewPath),'utf8').split(/\r?\n/).filter(Boolean)){const r=JSON.parse(line);if(ids.includes(r.goalId))currentP.set(r.goalId,{row:r,path:c.reviewPath})}}
const candidateP=readFileSync(resolve(author,'positive/P2-whole-current-technical-author.review.jsonl'),'utf8').split(/\r?\n/).filter(Boolean).map(l=>JSON.parse(l))
const retainedP=candidateP.map(r=>{const old=currentP.get(r.goalId);assert.ok(old);assert.ok(same(old.row.profile,r.profile));assert.equal(r.status,'needs_human_review');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1');return {goalId:r.goalId,wholeOriginalProfileExact:true,validExistingScienceRecord:bind(old.path),candidateTechnicalBindingOnly:true,changedRecordFields:Object.keys(r).filter(k=>!same(old.row[k],r[k]))}})
const protectedId='2ae2da43-73d5-578f-84f4-be0585a7d8f9'
assert.ok(same(before.model.pages.find(p=>p.goalId===protectedId),after.pages.find(p=>p.goalId===protectedId)))
const result={schemaVersion:1,normalActiveAndCandidateModelConstructionPASS:true,wholeGoals:479,wholePages:394,sourceScopes:atlas.receipt.scopes.length,unresolvedScopes:0,changedPageIds:pages.map(p=>p.goalId),other392WholePagesExact:true,wholeReviewedCandidatePageValuesExact:true,oneActualRequiresEdgeRemoved:true,allVisualizationQaFieldsExactExcept16ProvenByteExactAliasTransports:true,allHumanAndScientificQaFieldsExact:true,aliasTransfers,mappingChecks,retainedP,protected2ae2WholePageExact:true,sourceBindingScienceIsExistingReviewedSource7PlusActualNarrowOperatorFollowup:true,claims:{newScientificClosures:0,activeIntegration:0,humanApproval:false,globalMaturityRestored:false},declaredInputs:[...used.values()]}
writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({normalWhole394:'PASS',canonicalChanges:1,pageChanges:pages.map(p=>p.goalId),retainedExactPages:392,retainedWholeP2:'PASS',protected2ae2:'PASS',output:relative(root,output)}))
