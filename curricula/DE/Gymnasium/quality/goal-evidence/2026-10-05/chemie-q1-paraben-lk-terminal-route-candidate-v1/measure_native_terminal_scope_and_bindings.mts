// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync,writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildGoalBookModel,fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { goalEvidenceReviewInputPayload,goalEvidenceSemanticPayload } from '../../../../../../../app/scripts/goalEvidenceProfileModel'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'

const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-q1-paraben-lk-terminal-route-candidate-v1'
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'))
const hash=(value:any)=>createHash('sha256').update(JSON.stringify(value)).digest('hex')
const fileSHA=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex')
const clone=(value:any)=>JSON.parse(JSON.stringify(value))
const template=read(own+'/paraben-lk-terminal.goal-template.candidate.json')
assert.equal(fileSHA(template.sourceCanonicalPath),template.sourceCanonicalSHA256)
const current=read(template.sourceCanonicalPath),future=clone(current)
const addition=template.goalTemplate,target=template.existingCurricularGoalId
const clusterProposal=read(own+'/existing-q1-practice-cluster.exact-append.candidate.json')
const parentIndex=future.goals.findIndex((g:any)=>g.id===clusterProposal.clusterId)
assert.deepEqual(future.goals[parentIndex],clusterProposal.beforeWholeCluster)
future.goals[parentIndex]=clusterProposal.afterWholeCluster
assert(!future.goals.some((g:any)=>g.id===addition.id))
future.goals.push(addition)
assert.deepEqual(addition.requires,[target])
assert.deepEqual(addition.examData.coveredGoalIds,[target])
assert.deepEqual(addition.applicability,{jurisdiction:['DE-HE']})
assert(addition.tags.includes('LK') && !addition.tags.includes('GK'))
assert.equal(addition.examData.reviewStatus,'needs_review')

const configPath='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
const config=read(configPath),manifest=read(config.compositionViewManifestPath)
const ledgerPath=config.semanticKindLedgerPath,ledger=read(ledgerPath),futureLedger=clone(ledger)
const parentDecision=futureLedger.decisions.find((g:any)=>g.goalId===clusterProposal.clusterId)
parentDecision.sourceFingerprint=fingerprintSemanticKindSourceGoal(clusterProposal.afterWholeCluster)
const newDecision={goalId:addition.id,sourceFingerprint:fingerprintSemanticKindSourceGoal(addition),semanticKind:'practiceAssessment',decisionStatus:'authoritative',decisionBasis:'inactive-machine-classification-candidate-needs-independent-review'}
futureLedger.decisions.push(newDecision)
futureLedger.counts.practiceAssessment+=1;futureLedger.counts.total+=1
assert.equal(futureLedger.counts.curricularAtomic,378)
const qa=read(config.goalVisualizationQaPath)
const assetDigests=Object.fromEntries(qa.records.filter((r:any)=>r.imageUrl&&r.assetSha256).map((r:any)=>[r.imageUrl,r.assetSha256]))
const common={
  compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:read(path)})),
  navigationView:read(manifest.navigationViewPath),durationModelPolicy:read(manifest.durationModelPolicyPath),
  goalVisualizationQa:qa,goalVisualizationAssetDigests:assetDigests,
  evidenceReviewSources:config.evidenceReviewPaths.map((path:string)=>({path,text:readFileSync(path,'utf8')})),
  config,
}
const before=buildGoalBookModel({...common,landscape:current,semanticKindLedger:ledger})
const after=buildGoalBookModel({...common,landscape:future,semanticKindLedger:futureLedger})
assert.equal(before.pages.length,378);assert.equal(after.pages.length,378)
assert.deepEqual(after.pages.map(p=>p.goalId),before.pages.map(p=>p.goalId))
const actualPageDeltas=before.pages.flatMap((page,index)=>hash(page)===hash(after.pages[index])?[]:[{goalId:page.goalId,beforeSHA256:hash(page),afterSHA256:hash(after.pages[index]),beforePageFingerprint:page.pageFingerprint,afterPageFingerprint:after.pages[index].pageFingerprint,beforeWholePage:page,afterWholePage:after.pages[index]}])
assert.deepEqual(actualPageDeltas.map(row=>row.goalId),[target])
assert.deepEqual(actualPageDeltas[0].afterWholePage.externalReverseRequires.filter(ref=>ref.goalId===addition.id).map(ref=>ref.goalId),[addition.id])
const rawMap=new Map<string,any>(current.goals.map((g:any)=>[g.id,g]))
const futureMap=new Map<string,any>(future.goals.map((g:any)=>[g.id,g]))
const nativeOwnDContextChanges:string[]=[],nativeOwnPChanges:string[]=[]
for(const page of before.pages){
 const old=rawMap.get(page.goalId),next=futureMap.get(page.goalId)
 assert.deepEqual(next,old)
 if(hash(buildGoalDescriptionCanonicalContext(old))!==hash(buildGoalDescriptionCanonicalContext(next)))nativeOwnDContextChanges.push(page.goalId)
 if(hash(goalEvidenceSemanticPayload(old,'goal-evidence-v1','curricularAtomic'))!==hash(goalEvidenceSemanticPayload(next,'goal-evidence-v1','curricularAtomic'))
 ||hash(goalEvidenceReviewInputPayload(old,'positive-understanding-evidence-v2',assetDigests,'curricularAtomic'))!==hash(goalEvidenceReviewInputPayload(next,'positive-understanding-evidence-v2',assetDigests,'curricularAtomic')))nativeOwnPChanges.push(page.goalId)
}
assert.deepEqual(nativeOwnDContextChanges,[]);assert.deepEqual(nativeOwnPChanges,[])
const atlas=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const oldSources=buildGoalBookOriginalSources(before,process.cwd(),atlas.mappingPaths)
const newSources=buildGoalBookOriginalSources(after,process.cwd(),atlas.mappingPaths)
// Only the source-book digest envelope changes. No source document, clause, scope or goal binding does.
const sourceKeys=Object.keys(oldSources).filter(key=>key!=='bookDigest')
for(const key of sourceKeys)assert.deepEqual((newSources as any)[key],(oldSources as any)[key],key)
const prepared=prepareLandscapeEntries([normalizeCanonicalLandscape(future)])
const entry=prepared.find((e:any)=>e.id===addition.id)
assert(entry)
assert(entry.effectiveRequires.includes(target))
assert.equal(entry.contains?.length??0,0)
assert(clusterProposal.afterWholeCluster.contains.includes(addition.id))
const declaredDirectTerminalPath=[target,addition.id]
const preservedStrict=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/integrated-current-four-subject-central-v2.stdout.txt').subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds
assert.equal(preservedStrict.length,112)
assert(preservedStrict.includes(target))
const nativeResult={schemaVersion:1,checkedAtUTC:new Date().toISOString(),status:'PASS focused in-memory footprint; candidate remains inactive and needs independent exam/context review',sourceCanonicalSHA256:template.sourceCanonicalSHA256,assessmentGoalId:addition.id,targetCurricularGoalId:target,parentPracticeClusterId:clusterProposal.clusterId,declaredDirectAtomicTerminalPath:declaredDirectTerminalPath,nativePreparedTerminalEffectiveRequires:entry.effectiveRequires,
  routeCheckerSource:{path:'app/scripts/generateCurriculumQualityStatus.ts',sha256:fileSHA('app/scripts/generateCurriculumQualityStatus.ts'),terminalEnumeration:'configured practice-cluster contains children that are atomic and not memory',CQR101:'target reaches the new terminal in reverse effective edges',CQR102:'target reaches the new terminal in reverse direct atomic edges',fullRouteCheckerExecuted:false},
  currentAndFutureCurricularAtomicGoals:378,currentAndFutureCurricularAtomicPageIdsExact:true,all378WholeRawCurricularGoalsUnchanged:true,unchangedWhole378NativeCanonicalDContexts:true,unchangedWhole378NativeOwnPositiveProfileInputs:true,
  actualAffectedNativeBookPageGoalIds:actualPageDeltas.map(row=>row.goalId),actualPageDeltas,
  DRebindingNeededOnlyForGoalId:target,DReviewScope:'actual added external terminal reference on the unchanged paraben-use page; title/description/prerequisites/source/image are exact. Both independent current D context checks required before counting current D closure.',PRebindingNeeded:false,PReviewScope:'native own profile semantic and reviewInput payloads are byte-exact for all378; book-envelope relocation is technical and never a new positive approval',
  sourceConsumerDocumentsEvidenceAndGoalScopeRowsExact:true,originalSourceConsumerDigestBefore:hash(oldSources),originalSourceConsumerDigestAfter:hash(newSources),sourceEnvelopeBookDigestChanged:true,
  sourceAtlasConfigAndManifestAndSelectedViewsUnchanged:true,oldStrict112GoalIds:preservedStrict,oldStrict112RawGoalFieldsRetained:true,strict112PreservationNotYetCertifiedAfterIntegration:true,
  semanticKindCandidateRows:[parentDecision,newDecision],semanticKindCountsBefore:ledger.counts,semanticKindCountsProspective:futureLedger.counts,
  prospectiveChangedCanonicalGoalIds:[clusterProposal.clusterId,addition.id],newCurricularAtomicIds:[],newScientificCompletionCount:0,examMachineReleasePending:true,activeWrites:false,humanApproval:false,humanTrial:false,
  nativeCodeFiles:['app/scripts/goalBookModel.ts','app/scripts/goalEvidenceProfileModel.ts','app/scripts/validateGoalDescriptionReviewCampaign.ts','app/src/hooks/useLandscapes.ts'].map(path=>({path,sha256:fileSHA(path)}))}
writeFileSync(own+'/native-terminal-route-and-378-binding-footprint.actual.json',JSON.stringify(nativeResult,null,2)+'\n',{flag:'wx'})
console.log('PASS: new inactive HE-LK terminal4cb74; native378 raw/P contexts exact, exactly one D/page target0d59 affected; source clauses/scopes exact; actual direct and native effective prerequisite edge; no new science or active writes.')
