// SPDX-License-Identifier: Apache-2.0
// Targeted technical proof of unchanged scope/context; no new independent review or runs.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {parseAndValidateGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const bind=(p:string)=>{const b=readFileSync(p);return{path:relative(root,p),sha256:createHash('sha256').update(b).digest('hex'),bytes:b.length}}
const digest=(v:any)=>'sha256:'+createHash('sha256').update(stableGoalBookJson(v)).digest('hex')
const guards=read(resolve(own,'exact-current-input-snapshots-and-four-author-guards.technical.json'))
const impact=read(resolve(own,'checks/full392-current-position-vs-substantive-context-v2.actual.json'))
const registry=read(resolve(root,guards.snapshotMap['curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json']))
const subject=registry.subjects.find((s:any)=>s.subject==='biologie')
const beforeModel=parseAndValidateGoalBookModel(read(resolve(own,'native-raster-candidate-v2/full391.before.pure.book-model.json')))
const afterModel=parseAndValidateGoalBookModel(read(resolve(own,'native-raster-candidate-v2/full392.actual-raster.pure.book-model.json')))
const beforeLandscape=read(resolve(root,guards.snapshotMap[subject.landscapePath]))
const afterLandscape=read(resolve(own,'candidate/canonical.current476.reviewed-split.actual-raster.inactive.json'))
const bgoals=new Map<string,any>(beforeLandscape.goals.map((g:any)=>[g.id,g])),agoals=new Map<string,any>(afterLandscape.goals.map((g:any)=>[g.id,g]))
const central=read(resolve(root,guards.actualBaseline.actualCentralReport.path));const currentStrict=new Set<string>(central.subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds);assert.equal(currentStrict.size,guards.actualBaseline.strict);const wanted=new Set<string>(impact.commonPages.filter((r:any)=>r.pagePositionOnly&&currentStrict.has(r.goalId)).map((r:any)=>r.goalId));assert.ok(wanted.size>=78)
const excluded=new Set<string>((subject.resolutionSupersessions??[]).map((s:any)=>s.supersededIndexPath+'\0'+s.goalId))
for(const r of subject.resolutionWithdrawals??[])excluded.add(r.indexPath+'\0'+r.goalId)
const owners=new Map<string,any[]>()
for(const indexPath of subject.resolutionIndexPaths){const index=read(resolve(root,indexPath)),groups=new Map(index.groups.map((g:any)=>[g.groupId,g]));for(const entry of index.resolutions){if(!wanted.has(entry.goalId)||excluded.has(indexPath+'\0'+entry.goalId))continue;const rows=owners.get(entry.goalId)??[];rows.push({indexPath,index,entry,group:groups.get(entry.groupId)});owners.set(entry.goalId,rows)}}
assert.equal(owners.size,wanted.size);assert.ok([...owners.values()].every(rows=>rows.length===1))
const groupCache=new Map<string,any>(),dependencies=new Map<string,any>(),records=[]
const use=(p:string)=>{const b=bind(p);dependencies.set(b.path,b);return b}
for(const goalId of [...wanted].sort()){
 const {indexPath,entry,group}=owners.get(goalId)![0]
 const groupDirectory=resolve(dirname(resolve(root,indexPath)),group.artifactDirectory??group.groupId)
 let bundle=groupCache.get(groupDirectory)
 if(!bundle){
  const inputAPath=resolve(groupDirectory,'round-a/description-review-input.json'),inputBPath=resolve(groupDirectory,'round-b/description-review-input.json')
  const inputA=read(inputAPath),inputB=read(inputBPath)
  const bookPath=resolve(groupDirectory,'bundle/book-model.json'),oldModel=parseAndValidateGoalBookModel(read(bookPath))
  const ids=oldModel.pages.map(p=>p.goalId)
  const args={goalIds:ids,bookId:oldModel.book.id,title:oldModel.book.title}
  const subsetBefore=buildGoalDescriptionRolloutSubsetModel({baseModel:beforeModel,...args}),subsetAfter=buildGoalDescriptionRolloutSubsetModel({baseModel:afterModel,...args})
  bundle={inputA,inputB,oldModel,subsetBefore,subsetAfter,inputABind:use(inputAPath),inputBBind:use(inputBPath),historicalBook:use(bookPath)};groupCache.set(groupDirectory,bundle)
 }
 const resolutionPath=resolve(dirname(resolve(root,indexPath)),entry.resolutionPath),res=read(resolutionPath)
 assert.equal('sha256:'+use(resolutionPath).sha256,entry.resolutionDigest)
 assert.equal(res.goal.goalId,goalId)
 const ra=bundle.inputA.goals.find((g:any)=>g.goalId===goalId),rb=bundle.inputB.goals.find((g:any)=>g.goalId===goalId)
 assert.ok(ra&&rb);assert.equal(ra.pageFingerprint,res.goal.pageFingerprint);assert.equal(rb.pageFingerprint,res.goal.pageFingerprint)
 assert.deepEqual(bgoals.get(goalId),agoals.get(goalId))
 const pb=bundle.subsetBefore.pages.find((p:any)=>p.goalId===goalId),pa=bundle.subsetAfter.pages.find((p:any)=>p.goalId===goalId)
 assert.ok(pb&&pa)
 const historicalPage=bundle.oldModel.pages.find((p:any)=>p.goalId===goalId);assert.ok(historicalPage)
 const currentFullBefore=beforeModel.pages.find(p=>p.goalId===goalId)!,currentFullAfter=afterModel.pages.find(p=>p.goalId===goalId)!
 const originalAssets=[]
 for(const link of agoals.get(goalId).resourceLinks??[])if(link.type==='goal-visualization')originalAssets.push(use(resolve(root,'app/public'+link.url)))
 const equal=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
 records.push({goalId,currentWholeBodyDigest:digest(agoals.get(goalId)),wholeCurrentBodySourceMetadataAndResourceLinksExact:true,originalActualAssets:originalAssets,
  originalResolutionIndex:use(resolve(root,indexPath)),originalResolution:use(resolutionPath),originalIndexEntry:entry,
  originalRoundAInput:bundle.inputABind,originalRoundBInput:bundle.inputBBind,originalNativeSubsetBook:bundle.historicalBook,
  originalReviewedPageFingerprint:res.goal.pageFingerprint,originalReviewContextFingerprint:res.goal.goalReviewContextFingerprint,
  originalRoundRunAndRecordBindings:res.rounds,
  fullBeforePageFingerprint:currentFullBefore.pageFingerprint,fullAfterPageFingerprint:currentFullAfter.pageFingerprint,
  fullPagePositions:[currentFullBefore.pageNumber,currentFullAfter.pageNumber],fullPageContentExcludingPositionsProvedExactByImpact:true,
  actualSameSubsetBeforePageFingerprint:pb.pageFingerprint,actualSameSubsetAfterPageFingerprint:pa.pageFingerprint,
  actualSubsetPageContextAfterSplitExact:equal(pb,pa),historicalPageEqualsCurrentSameSubsetBefore:equal(historicalPage,pb),historicalPageEqualsCurrentSameSubsetAfter:equal(historicalPage,pa),
  newIndependentReviewOrRunInvented:false,technicalBindingsOnly:true,currentRestorationGate:'pending root integration into actual final392 model and original standard resolution checks; no new strict claim'})
}
const actualSubsetContextChanged=records.filter(r=>!r.actualSubsetPageContextAfterSplitExact).map(r=>r.goalId)
assert.deepEqual(actualSubsetContextChanged,[])
const legacyAuthor=read(resolve(own,'../biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1/technical-preview/native-compiled-position-and-true-context-impact.actual.json'))
const out={role:'Targeted technical position-binding proof for every currently strict affected goal; original science/records/runs/indices unmodified',baselineStrict:guards.actualBaseline.strict,baselineNativePages:391,candidateNativePages:392,wholeCurrentBodiesExact:wanted.size,actualCurrentUniqueOriginalResolutionOwners:true,actualOriginalGroups:groupCache.size,
 actualSubsetContextChangedGoalIds:actualSubsetContextChanged,allCurrentSameNativeSubsetPageContextsBeforeVsAfterSplitExact:true,
 originalHistoricalSubsetPageExactlyEqualsCurrentSubsetAfterCount:records.filter(r=>r.historicalPageEqualsCurrentSameSubsetAfter).length,
 originalHistoricalSubsetContextDifferencesNotClaimedAsNewSplitDefects:records.filter(r=>!r.historicalPageEqualsCurrentSameSubsetAfter).map(r=>r.goalId),
 exactOriginalDInputsAssetsAndResolutionDependencies:[...dependencies.values()],records,
 fullPositionDeltaExplanation:{oldAuthorComputedCompiledNodesOnly:legacyAuthor.compiledPositionChangedCount,oldAuthorPositionOnlyCompiledNodes:legacyAuthor.positionOnlyCompiledNodeCount,oldAuthorExplicitlyReportedCompiledOrderDifferentFromNativePageOrder:!legacyAuthor.beforeCompiledOrderEqualsActualNativePageOrder,newActualNativeFullPagePositionOnly:impact.positionOnly,newActualPriorStrictNativeFullPagePositionOnly:wanted.size,notSameOrderingUniverse:true},
 separateActualTrueContextGoalIds:impact.trueChangedRelationContextGoalIds,
 laterRootGate:'Keep all currently strict IDs. Apply no structural integration before genuine child D/P/V, HE11/HE13 true context review and explicit standard retained-reference validation on final model. No reopening unchanged science.',
 historicalArtifactsChanged:0,activeWrites:0,newScientificClosures:0,restoredBindingsClaimed:0,newIndependentRuns:0,humanApproval:false}
const path=resolve(own,'checks/current-page-position-only-exact-historical-references-and-subset-proof.technical.json');mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(out,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({actualCurrentOriginalResolutionOwners:records.length,actualHistoricalGroups:groupCache.size,actualSubsetPageContextChangesFromSplit:actualSubsetContextChanged.length,historicalSubsetExactToCurrentAfter:out.originalHistoricalSubsetPageExactlyEqualsCurrentSubsetAfterCount,originalRunsPreserved:true,newRuns:0,activeWrites:0,strictGain:0}))
