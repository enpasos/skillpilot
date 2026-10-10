// SPDX-License-Identifier: Apache-2.0
// Normal model/source/view operations only. No independent scientific approval.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {cpSync,existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel.ts'
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {compileCompositionView,normalizeCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'

const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D),C=resolve(process.argv[process.argv.indexOf('--capsule')+1])
const OLD='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
const AUTHOR=`${OLD}/chemie-q3-three-BW-context-bound-practical-companions-author-v1`
const B=`${OLD}/chemie-q3-three-BW-practical-companions-independent-b-v1`
const ids=['d2d735de-bede-5310-8aeb-8bb7562c7b75','a0f6ba09-f072-5887-a797-fa369453c62a','7b39fa19-fec3-575e-9324-a3226b703358']
const read=(p:string)=>JSON.parse(readFileSync(resolve(R,p),'utf8'))
const local=(p:string)=>read(`${P}/${p}`)
const put=(p:string,x:any)=>{const f=resolve(D,p),bytes=typeof x==='string'?x:JSON.stringify(x,null,2)+'\n';if(existsSync(f)){assert.equal(readFileSync(f,'utf8'),bytes,`Refuse different existing ${f}`);return relative(R,f)}mkdirSync(dirname(f),{recursive:true});writeFileSync(f,bytes);return relative(R,f)}
const hash=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const before=local('inputs/current-canonical480.exact.json'),after=local('candidate/current484-three-practical-raster.inactive.json'),kinds=local('inputs/current-semantic-kinds.exact.json')
const bg=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),ag=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
assert.equal(bg.size,480);assert.equal(ag.size,484)
const changed=[...bg.keys()].filter(id=>stableGoalBookJson(bg.get(id))!==stableGoalBookJson(ag.get(id)))
assert.deepEqual(changed,['442c31c5-c561-5c7a-90bb-2335d779175c'])
const added=[...ag.keys()].filter(id=>!bg.has(id));assert.equal(added.length,4)
const central=local('inputs/current-central-five-gate.exact.json'),chem=central.subjects.find((s:any)=>s.subject==='chemie')
assert.equal(chem.strictCompleteGoalIds.length,177)
put('checks/protected-all-five-current-and-strict-ID-sets.exact.json',{schemaVersion:1,sourcePath:`${P}/inputs/current-central-five-gate.exact.json`,subjects:central.subjects.map((s:any)=>({subject:s.subject,currentGoalIds:s.currentGoalIds,strictCompleteGoalIds:s.strictCompleteGoalIds})),candidateCurrentGoalSet:[...chem.currentGoalIds,...ids],candidateClosures:0,activeWrites:0})
const fk={...kinds,sourceLandscapePath:`${P}/candidate/current484-three-practical-raster.inactive.json`,counts:{...kinds.counts,curricularAtomic:381,curricularArea:62,total:484},decisions:kinds.decisions.map((d:any)=>({...d,sourceFingerprint:fingerprintSemanticKindSourceGoal(ag.get(d.goalId))}))}
for(const id of added)fk.decisions.push({goalId:id,sourceFingerprint:fingerprintSemanticKindSourceGoal(ag.get(id)),semanticKind:ids.includes(id)?'curricularAtomic':'curricularArea',decisionStatus:'authoritative',decisionBasis:ids.includes(id)?'reviewed-current-semantic-recheck-curricular-atomic':'reviewed-current-pilot-curricular-area'})
fk.decisions.sort((a:any,b:any)=>a.goalId.localeCompare(b.goalId))
const fkpath=put('candidate/current484-381.semantic-kinds.inactive-input.json',fk)
const bkpath=put('candidate/current480-378.semantic-kinds.path-only.json',{...kinds,sourceLandscapePath:`${P}/inputs/current-canonical480.exact.json`})
put('candidate/semantic-kind-normal-loader-contract.boundary.json',{schemaVersion:1,role:'Inactive proposed ordinary model classification only; historical independent A/M decisions are retained references, not re-performed or active decisions',newAtomicGoalIds:ids,all480ExistingSemanticKindsRetained:true,newAreaGoalId:added.find(id=>!ids.includes(id)),activeSemanticKindsChanged:0,humanApproval:false})
const meta=local('inputs/three-existing-raster-metadata-successor.exact.json')
const qa=local('inputs/current-visualization-qa.exact.json')
for(const row of meta.rows){const g=ag.get(row.goalId);assert.ok(g);const imageUrl=`/assets/goal-visualizations/chemie/${g.id}/${g.id}.png`;assert.ok(g.resourceLinks.some((r:any)=>r.url===imageUrl));qa.records.push({goalId:g.id,title:g.title,description:g.description,subject:'chemie',landscapeId:after.landscapeId,landscapePath:`${P}/candidate/current484-three-practical-raster.inactive.json`,visualizationState:'available',missingReason:'',imageUrl,publicAssetPath:'app/public'+imageUrl,canonicalAssetPath:`${P}/assets/chemie/${g.id}/${g.id}.png`,assetSha256:'sha256:'+row.selectedPNG.sha256,humanApproved:'no',humanIssueIdentified:'no',humanIssueDescription:'',aiApproved:'no',aiApprovedAssetSha256:'',aiReviewedAt:null,aiReviewer:'',aiNotes:'Existing independent original/360/680 pixel KEEP pair and word-only accessible metadata resolution retained. Current actual native D/P/V resource context approval remains pending. Inactive author inputs only.'})}
const qapath=put('candidate/current-qa-plus-three-native-pending.inactive-input.json',qa)
const beforeView=read(`${AUTHOR}/native/full378-current-normal-review.view.json`),afterView=read(`${AUTHOR}/native/full381-future-normal-review.view.json`)
const bv=put('native/current378-normal-review.view.json',beforeView),av=put('native/future381-normal-review.view.json',afterView)
const base=read(`${AUTHOR}/native/full381.after.normal.config.json`)
const bconfig={...base,bookId:'chemie-current378-20261010-comparison',title:'Chemie – aktuelle 378 atomare Ziele, unveränderte Vergleichssicht',landscapePath:`${P}/inputs/current-canonical480.exact.json`,semanticKindLedgerPath:bkpath,goalVisualizationQaPath:`${P}/inputs/current-visualization-qa.exact.json`,compositionViewPath:bv,outputPath:`${P}/native/current378.actual-model.json`}
const aconfig={...bconfig,bookId:'chemie-inactive381-20261010-raster-native',title:'Chemie – inaktive vollständige 381-Ziele-Prüfsicht',landscapePath:`${P}/candidate/current484-three-practical-raster.inactive.json`,semanticKindLedgerPath:fkpath,goalVisualizationQaPath:qapath,compositionViewPath:av,outputPath:`${P}/native/future381.actual-model.json`}
const bcp=put('native/current378.normal.config.json',bconfig),acp=put('native/future381.normal.config.json',aconfig)
// Models use a copied ordinary execution tree, including actual unchanged/current image bytes.
cpSync(D,resolve(C,P),{recursive:true})
const bloaded=await loadGoalBookBuildInputs(bcp,C),aloaded=await loadGoalBookBuildInputs(acp,C)
assert.equal(bloaded.model.pages.length,378);assert.equal(aloaded.model.pages.length,381)
put('native/current378.actual-model.json',bloaded.model);put('native/future381.actual-model.json',aloaded.model)
const bp=new Map<string,any>(bloaded.model.pages.map(p=>[p.goalId,p])),ap=new Map<string,any>(aloaded.model.pages.map(p=>[p.goalId,p]))
const pageChanges=[...bp.keys()].filter(id=>stableGoalBookJson(bp.get(id))!==stableGoalBookJson(ap.get(id)))
assert.deepEqual(new Set(pageChanges),new Set(['5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c','81373fb7-2a4a-5b2c-acd0-b4e775acaa65','8be14f15-2258-58e6-ae4e-38953f5d0570']))
assert.deepEqual(pageChanges.filter(id=>chem.strictCompleteGoalIds.includes(id)),[])
assert.ok(chem.strictCompleteGoalIds.every((id:string)=>stableGoalBookJson(bg.get(id))===stableGoalBookJson(ag.get(id))))
put('checks/current-full-goal-page-context-and-protected177.actual-diff.json',{schemaVersion:1,ordinaryTool:'loadGoalBookBuildInputs+stableGoalBookJson',beforeAtomicPages:378,afterAtomicPages:381,wholeGoalChanges:changed,addedWholeGoalIds:added,changedExistingPageIds:pageChanges,pageChanges:pageChanges.map(id=>({goalId:id,before:bp.get(id),after:ap.get(id)})),newWholePages:ids.map(id=>ap.get(id)),affectedProtectedStrictGoalIds:[],all177GoalObjectsAndPagesEqual:true,existingTheoryNativeApprovalClaimed:false,pendingExistingTheoryDContextIds:pageChanges,strictGain:0,activeWrites:0,humanApproval:false})
const canon=normalizeCanonicalLandscape(after),projectionRows=[]
for(const course of ['gk','lk']){const view=local(`candidate/BW-${course}.learner-view.inactive.json`),normal=normalizeCompositionView(view),compiled=compileCompositionView(normal,canon);assert.deepEqual(compiled.findings.filter((f:any)=>f.severity==='error'),[]);const pr=collectCompositionProjectionRoleGoalIds(normal.rootNodes,new Map(canon.goals.map(g=>[g.id,g])));const expected=course==='gk'?[ids[0]]:ids;assert.deepEqual(ids.filter(id=>pr.targetGoalIds.has(id)),expected);projectionRows.push({course,viewId:view.viewId,fullTargetGoalIds:[...pr.targetGoalIds],fullPrerequisiteOnlyGoalIds:[...pr.prerequisiteOnlyGoalIds],newPracticalGoalIds:expected,compilerFindings:compiled.findings})}
put('checks/current-BW-GK-LK-full-learner-projections.actual.json',{schemaVersion:1,ordinaryTool:'compileCompositionView+collectCompositionProjectionRoleGoalIds',rows:projectionRows,sourceAndProgrammeApprovalClaimed:false,activeWrites:0})
const originalAtlas=read('app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
const mappings:string[]=originalAtlas.mappingPaths.filter((p:string)=>p.includes('/DE-BW/'))
const lower=mappings.find(p=>p.includes('lower-secondary'))!,upper=mappings.find(p=>p.includes('upper-secondary'))!
assert.equal(mappings.length,2)
const duration=local('inputs/current-whole-duration-policy154.exact.json');assert.equal(duration.decisions.length,154)
const bounded={...duration,decisions:duration.decisions.filter((d:any)=>d.subject==='Chemie'&&d.jurisdiction==='DE-BW')};assert.equal(bounded.decisions.length,1)
const dp=put('candidate/BW-existing-duration-policy-exact.scope-projection.json',bounded)
const source=local('inputs/whole-BW126.source-extraction.exact.json')
const trackedPdf=`${AUTHOR}/primary/official-BW-chemistry-20220325.actual-original.pdf`
const sourceOldDocumentPath=source.sourceDocument.path;source.sourceDocument={...source.sourceDocument,path:trackedPdf}
const ownSource=put('candidate/BW126-same-whole-source-tracked-primary-path.inactive.json',source)
const mapping=local('candidate/BW126-220-partners-concentration-partial.inactive.review.json')
const oldSourceExtractionPath=mapping.sourceExtractionPath;mapping.sourceExtractionPath=ownSource
const ownMapping=put('candidate/BW126-220-partners-same-reviewed-mapping-portable-source-path.inactive.review.json',mapping)
assert.equal(mapping.decisions.length,126);assert.equal(mapping.mappings.length,220)
const originalMapping=local('inputs/whole-original-BW126-217-mapping.exact.json')
assert.deepEqual(mapping.mappings.slice(0,217),originalMapping.mappings)
assert.equal(mapping.mappings.find((m:any)=>m.canonicalGoalId===ids[0]).matchType,'partial')
const originalSource=local('inputs/whole-BW126.source-extraction.exact.json');assert.deepEqual({...source,sourceDocument:originalSource.sourceDocument},originalSource)
put('checks/path-only-source-transport-no-science-review.actual.json',{schemaVersion:1,oldSourceDocumentPath:sourceOldDocumentPath,newTrackedPrimaryPath:trackedPdf,actualPrimarySha256:hash(readFileSync(resolve(R,trackedPdf))),oldSourceExtractionPath,newPortableSourceExtractionPath:ownSource,mapping217OldEdgesEqual:true,whole126SourceDutyObjectsRetained:true,concentrationNewEdgeMatchType:'partial',existingReviewedScientificJudgmentsReused:true,independentReviewPerformed:false,wholeSourceProgrammeClosed:false,activeWrites:0})
cpSync(D,resolve(C,P),{recursive:true})
const snapshots=originalAtlas.sourceDocumentSnapshots.filter((s:any)=>s.path==='curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf')
assert.equal(snapshots.length,1);assert.equal(snapshots[0].sha256,hash(readFileSync(resolve(R,trackedPdf))))
const runs=[]
// Actual historical/current whole source support is185; the candidate189 also
// retains one already-reviewed generic-process partial partner, besides3 new atoms.
for(const [stage,lpath,kpath,paths,expected]of [['before',bconfig.landscapePath,bkpath,[lower,upper],185],['after',aconfig.landscapePath,fkpath,[lower,ownMapping],189]] as const){
 const ns=`app/scripts/config/goal-books/chemie-BW-three-current-20261010-${stage}`
 const config={schemaVersion:1,bookId:`chemie-BW-three-current-20261010-${stage}`,subject:'Chemie',landscapePath:lpath,semanticKindLedgerPath:kpath,durationModelPolicyPath:dp,sourceDocumentSnapshots:stage==='before'?snapshots:[...snapshots,{...snapshots[0],path:trackedPdf}],mappingPaths:paths,allowedSourceSubjects:originalAtlas.allowedSourceSubjects,outputDirectory:`${ns}/source-views`,manifestPath:`${ns}/source-manifest.json`,navigationViewPath:`${ns}/navigation.view.json`,navigationViewId:`chemie-BW-three-current-20261010-${stage}`,expectedJurisdictions:['DE-BW'],expectedCurricularAtomicGoalCount:expected,expectedUnresolvedScopeDecisionCount:0}
 const cfgpath=put(`source-atlas/${stage}.normal-scoped.config.json`,config)
 cpSync(resolve(R,cfgpath),resolve(C,cfgpath))
 const built=buildGoalBookSourceAtlasInputs(config as any,C),outputs=[]
 for(const [path,bytes]of Object.entries(built.outputs)){const dest=resolve(C,path);mkdirSync(dirname(dest),{recursive:true});writeFileSync(dest,bytes);const archive=put(`source-atlas/${stage}-exact-normal-output/${path}`,bytes);outputs.push({normalCapsuleOutputPath:path,exactPortableArchivePath:archive,sha256:hash(bytes),bytes:Buffer.byteLength(bytes)})}
 const checked=checkGoalBookSourceAtlasInputs(cfgpath,C);assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals,expected)
 put(`source-atlas/${stage}.normal-full-source-scope.receipt.actual.json`,checked.receipt)
 runs.push({stage,counts:checked.receipt.counts,outputs,scopes:checked.receipt.scopes.map((s:any)=>({key:s.key,goalIds:s.goalIds,practicalGoalIds:s.goalIds.filter((id:string)=>ids.includes(id))}))})
}
assert.deepEqual(runs[1].scopes.find(s=>s.key==='DE-BW/SekII/GK')!.practicalGoalIds,[ids[0]])
assert.deepEqual(new Set(runs[1].scopes.find(s=>s.key==='DE-BW/SekII/LK')!.practicalGoalIds),new Set(ids))
assert.deepEqual(runs[1].scopes.find(s=>s.key==='DE-BW/SekI/')!.practicalGoalIds,[])
put('checks/current-normal-BW-source-scopes-before185-after189.actual.json',{schemaVersion:1,ordinaryTools:['buildGoalBookSourceAtlasInputs','checkGoalBookSourceAtlasInputs'],runs,wholeDutyCount:126,olderPartnerEdgesRetained:217,currentPartnerEdges:220,existingGenericProcessPartialPartnerAddedToSourceView:['49b13b33-34b7-5e4e-861c-b21082cb9922'],concentrationSource002RemainsPartial:true,corrosionAndOtherProgrammeHoldsRemainOpen:true,full381CanonicalReviewNotNationalCoverage:true,strictGain:0,activeWrites:0})
const prior=readFileSync(resolve(R,`${B}/positive/three-whole-practical.independent-b.review.jsonl`),'utf8').trim().split('\n').map(s=>JSON.parse(s));assert.deepEqual(prior.map(r=>r.goalId),ids)
const candidates={schemaVersion:1,authoringContract:'positive-understanding-evidence-candidates-v1',reviewId:'chemie-three-current-raster-native-technical-author-20261010-v1',reviewedAt:new Date().toISOString(),reviewer:'Codex technical author; existing independent whole-science profiles retained, current native resource context independently pending',goals:prior.map(r=>({goalId:r.goalId,profile:r.profile,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,reason:'Exact prior independently reviewed whole positive-understanding-evidence-v2 profile retained. Ordinary materializer binds actual unchanged reviewed PNG and corrected accessible metadata. This technical input update is not an independent current native D/P/V review or active completion.',dissent:['Synthetic E1/G1 machine QA; no actual learner experiment or human release.','Two existing independent science and pixel KEEP reviews are retained with exact provenance. New current native D/P/V context remains pending.','Concentration SOURCE002 remains a partial contribution. All whole126 source duties, corrosion and other programme holds remain open.']}))}
put('positive/current-three.technical-author-candidates.json',candidates)
put('positive/current-three.author.config.json',{$schema:'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json',schemaVersion:2,reviewId:candidates.reviewId,goalFingerprintRuleVersion:'goal-evidence-v1',profileRuleVersion:'positive-understanding-evidence-v2',landscapeId:after.landscapeId,landscapePath:aconfig.landscapePath,semanticKindLedgerPath:fkpath,reviewCriteriaPath:`${P}/inputs/chemistry-existing-review-criteria.exact.md`,reviewPath:`${P}/positive/current-three.author.review.jsonl`,reviewedResourceTypes:['goal-visualization'],requireApproved:false,scope:{label:'Inactive current3 ordinary bindings, retained scientific profiles, independent current native context pending',goalIds:ids}})
put('checks/retained-whole-P-profile-bodies.actual.json',{schemaVersion:1,priorIndependentReviewPath:`${B}/positive/three-whole-practical.independent-b.review.jsonl`,priorFileSha256:hash(readFileSync(resolve(R,`${B}/positive/three-whole-practical.independent-b.review.jsonl`))),rows:prior.map((r:any,i:number)=>({goalId:r.goalId,priorProfileFingerprint:r.profileFingerprint,wholeProfileBodyExact:stableGoalBookJson(r.profile)===stableGoalBookJson(candidates.goals[i].profile)})),newIndependentScienceReviewClaimed:false,currentNativeContextReviewPending:true})
put('native/three.current.batch.config.json',{$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId:'chemie-three-BW-practical-current-native-20261010-v1',subject:'chemie',subjectLabel:'Chemie',bookId:'chemie-three-BW-practical-current-native-20261010-v1',title:'Chemie – drei BW-Praktikumsbegleiter: aktuelle inaktive Native-Prüfseiten',baseGoalBookConfigPath:acp,goalIds:ids,outputDirectory:`${P}/native/three`,feedbackBaseUrl:'https://skillpilot.com/feedback',promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md',publicRoot:'app/public',printDerivativeProfile:'standard'})
put('checks/normal-context-source-and-profile-inputs.actual.json',{schemaVersion:1,fullModelCountBefore:378,fullModelCountAfter:381,changedExistingPageIds:pageChanges,allProtected177WholeGoalsAndPagesEqual:true,BWSourceTargetsBefore:185,BWSourceTargetsAfter:189,scientificProfileBodiesRetained:3,actualImageBytesRetained:3,currentNativeApprovals:0,strictGain:0,activeWrites:0})
console.log(JSON.stringify({actualNormalFullModels:'378 -> 381',protected177Unchanged:true,normalBWSourceScopes:'185 -> 189',retainedScientificProfiles:3,newNativeContextApprovals:0,strictGain:0,activeWrites:0}))
