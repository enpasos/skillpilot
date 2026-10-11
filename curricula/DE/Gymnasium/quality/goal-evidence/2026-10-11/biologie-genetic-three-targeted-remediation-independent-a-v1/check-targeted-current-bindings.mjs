import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import {fileURLToPath,pathToFileURL} from 'node:url'
const base=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(base,'../../../../../../..')
const author=path.join(path.dirname(base),'biologie-genetic-three-targeted-source-profile-remediation-author-20261011-v1')
const neutral=path.join(path.dirname(base),'biologie-genetic-argument-three-current395-neutral-integration-preparation-b-20261011-v1')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),jsonl=p=>fs.readFileSync(p,'utf8').trim().split('\n').map(JSON.parse),hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')
const diff=(a,b,p='')=>{if(JSON.stringify(a)===JSON.stringify(b))return [];if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)){return [...new Set([...Object.keys(a),...Object.keys(b)])].sort().flatMap(k=>diff(a[k],b[k],p+'/'+k))}return [{path:p,before:a??null,after:b??null}]}
const first=read(path.join(base,'FIRST.neutral-author-inputs.independent-a.actual.json'))
const refcheck=r=>{assert.equal(fs.statSync(path.join(root,r.path)).size,r.bytes);assert.equal(hash(path.join(root,r.path)),r.sha256)}
for(const r of [first.entryManifest,first.wholeJoin,...first.inputs,...first.protectedInputs])refcheck(r)
const positive=await import(pathToFileURL(path.join(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')))
const book=await import(pathToFileURL(path.join(root,'app/scripts/goalBookModel.ts')))
const {buildGoalDescriptionCanonicalContext}=await import(pathToFileURL(path.join(root,'app/scripts/validateGoalDescriptionReviewCampaign.ts')))
const {buildGoalBookSourceAtlasInputs}=await import(pathToFileURL(path.join(root,'app/scripts/goalBookSourceAtlasInputs.ts')))
const land=read(path.join(neutral,'candidate/whole480-only-three-reviewed-image-links.inactive.json'))
const join=read(path.join(author,'inputs/neutral-whole-three-successor-source-P-case-image-author.join.json'))
const model=book.parseAndValidateGoalBookModel(read(path.join(author,'native/whole395.P3-only.normal-model.author.actual.json')))
assert.equal(model.pages.length,395)
const records=jsonl(path.join(base,'positive/P3.independent-a.current-records.jsonl'))
const goalMap=new Map(land.goals.map(g=>[g.id,g])),tuples=[]
for(const g of join.goals){
 assert.deepEqual(g.goal,goalMap.get(g.goal.id));assert.deepEqual(g.page,model.pages.find(p=>p.goalId===g.goal.id))
 const resources={[g.imageKeepBinding.url]:hash(path.join(root,g.imageKeepBinding.frozenOriginalPath))};assert.equal(resources[g.imageKeepBinding.url],g.imageKeepBinding.sha256)
 const r=records.find(r=>r.goalId===g.goal.id);assert.deepEqual(r.profile,g.positiveRecord.profile)
 assert.deepEqual(positive.validatePositiveGoalEvidenceRecordSemantics(r,g.goal,resources,'curricularAtomic'),[])
 assert.equal(r.goalFingerprint,g.page.goalFingerprint);assert.equal(r.reviewInputFingerprint,g.page.evidenceReview.reviewInputFingerprint);assert.equal(r.profileFingerprint,g.page.evidenceReview.profileFingerprint)
 assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.status,'needs_human_review');assert.equal(r.evidenceLevel,'E1');assert.equal(r.maximumClaimScope,'G1')
 for(const c of g.wholeCases.records){assert.equal(c.actualLearnerPerformance,false);assert.equal(c.actualExperimentPerformed,false);assert.equal(c.humanApproval,false);assert.equal(c.mandatoryCoverageCriteria.length,r.profile.expectations.length)}
 tuples.push({goalId:g.goal.id,goalFingerprint:r.goalFingerprint,reviewInputFingerprint:r.reviewInputFingerprint,profileFingerprint:r.profileFingerprint,currentWhole395PageFingerprint:g.page.pageFingerprint,imageDigest:resources[g.imageKeepBinding.url]})
}
const pDeltas=[]
for(const g of join.goals)for(const category of ['profiles','cases']){
 const suffix=category==='profiles'?'.whole.profile.json':'.whole-two-cases.de-en.json',file='positive/'+category+'/'+g.goal.id+suffix
 const ds=diff(read(path.join(neutral,file)),read(path.join(author,file)));pDeltas.push(...ds.map(d=>({file,...d})))
}
assert.equal(pDeltas.length,6)
const heDelta=read(path.join(author,'checks/HE-three-only-source-and-mapping.author.deltas.json'))
const heBefore=read(path.join(root,heDelta.sourceBaseline.path)),heAfter=read(path.join(root,heDelta.sourceSuccessor.path))
const changedHe=heAfter.sourceGoals.filter((g,i)=>JSON.stringify(g)!==JSON.stringify(heBefore.sourceGoals[i])).map(g=>g.id)
assert.deepEqual([...changedHe].sort(),join.goals.map(g=>g.primaryHEAuthoredSourceRow.id).sort());assert.equal(heAfter.sourceGoals.length,144)
for(const g of heAfter.sourceGoals.filter(g=>changedHe.includes(g.id))){assert.equal(g.isOfficialBullet,false);assert.equal(g.officialNumberingClaim,false);assert.equal(g.granularity,'authoredOperationalization');assert.equal(g.metadata.humanApproval,false)}
const rpDelta=read(path.join(author,'checks/RP-one-locator-only.author.delta.json'))
const rpDiff=diff(read(path.join(root,rpDelta.baseline.path)),read(path.join(root,rpDelta.successor.path)))
assert.deepEqual(rpDiff,[{path:'/sourceGoals/42/sourceRef',before:'RP-BIO-SEKI-2014 S. 43',after:'RP-BIO-SEKI-2014 S. 44'}])
const config=read(path.join(neutral,'native/whole395.normal-book.config.json'));config.evidenceReviewPaths=[path.relative(root,path.join(author,'positive/P3.author.records.jsonl'))]
const sourceManifest=read(path.join(root,config.compositionViewManifestPath))
const input={config,landscape:land,compositionViewManifest:sourceManifest,compositionViewSources:sourceManifest.sourcePaths.map(p=>({path:p,view:read(path.join(root,p))})),navigationView:read(path.join(root,sourceManifest.navigationViewPath)),durationModelPolicy:read(path.join(root,sourceManifest.durationModelPolicyPath)),semanticKindLedger:read(path.join(root,config.semanticKindLedgerPath)),goalVisualizationQa:read(path.join(root,config.goalVisualizationQaPath)),goalVisualizationAssetDigests:Object.fromEntries(model.pages.filter(p=>p.visualization).map(p=>[p.visualization.url,p.visualization.originalDigest])),evidenceReviewSources:[{path:config.evidenceReviewPaths[0],records:jsonl(path.join(root,config.evidenceReviewPaths[0]))}]}
input.evidenceReviewSources[0].text=input.evidenceReviewSources[0].records.map(r=>JSON.stringify(r)).join('\n')+'\n'
const actualRebuilt=book.parseAndValidateGoalBookModel(book.buildGoalBookModel(input));assert.deepEqual(actualRebuilt,model)
const route=read(path.join(author,'proposals/RP-argumentation-route-and-only003-method-edges.author.proposal.json'))
const routeInput=structuredClone(input),routeRebindings=[]
for(const overlay of route.exactRequiresOverlays){const g=routeInput.landscape.goals.find(g=>g.id===overlay.goalId);assert.deepEqual(g.requires,overlay.before);g.requires=overlay.proposed
 const ledger=routeInput.semanticKindLedger.decisions.find(d=>d.goalId===g.id);ledger.sourceFingerprint=book.fingerprintSemanticKindSourceGoal(g)
 const rec=routeInput.evidenceReviewSources[0].records.find(r=>r.goalId===g.id);const resources=Object.fromEntries((g.resourceLinks??[]).filter(l=>l.type==='goal-visualization').map(l=>[l.url,input.goalVisualizationAssetDigests[l.url]]));rec.reviewInputFingerprint=positive.fingerprintPositiveGoalEvidenceReviewInput(g,rec.reviewCriteriaFingerprint,resources,'curricularAtomic')
 routeRebindings.push({goalId:g.id,currentCanonicalContext:buildGoalDescriptionCanonicalContext(goalMap.get(g.id)),proposedCanonicalContext:buildGoalDescriptionCanonicalContext(g),newPReviewInputFingerprint:rec.reviewInputFingerprint})
}
routeInput.evidenceReviewSources[0].text=routeInput.evidenceReviewSources[0].records.map(r=>JSON.stringify(r)).join('\n')+'\n'
const routeModel=book.parseAndValidateGoalBookModel(book.buildGoalBookModel(routeInput)),changedRoutePages=routeModel.pages.filter((p,i)=>JSON.stringify(p)!==JSON.stringify(model.pages[i]))
assert.deepEqual(changedRoutePages.map(p=>p.goalId).sort(),[...route.exactRequiresOverlays.map(o=>o.goalId),'d11b3b18-deec-5d1a-bff6-512cddf595a2','f53d0a0b-d9b8-5012-92b5-3a021ab6c30b'].sort())
const orientation=read(path.join(author,'proposals/orientation-only-EN-title.author.proposal.json')),oriInput=structuredClone(input)
assert.deepEqual(oriInput.landscape.goals.find(g=>g.id===orientation.goalId),orientation.beforeWholeGoal)
oriInput.landscape.goals[oriInput.landscape.goals.findIndex(g=>g.id===orientation.goalId)]=orientation.proposedWholeGoal
assert.deepEqual(diff(orientation.beforeWholeGoal,orientation.proposedWholeGoal).map(d=>d.path).sort(),['/descriptionEn','/titleEn'])
oriInput.semanticKindLedger.decisions.find(d=>d.goalId===orientation.goalId).sourceFingerprint=book.fingerprintSemanticKindSourceGoal(orientation.proposedWholeGoal)
const oriModel=book.parseAndValidateGoalBookModel(book.buildGoalBookModel(oriInput));assert.deepEqual(oriModel.pages,model.pages)
const atlasConfig=read(path.join(author,'sources/normal-author-source-atlas.inactive.config.json')),atlasBefore=buildGoalBookSourceAtlasInputs(atlasConfig,root)
const atlasAfterConfig=structuredClone(atlasConfig);atlasAfterConfig.mappingPaths=atlasAfterConfig.mappingPaths.map(p=>p===path.relative(root,path.join(author,'sources/RP-mapping-locator-path-only.inactive.review.json'))?path.relative(root,path.join(author,'proposals/RP-whole-mapping-only003-three-argumentation-edges.author.proposal.review.json')):p)
assert.notDeepEqual(atlasAfterConfig.mappingPaths,atlasConfig.mappingPaths)
const atlasAfter=buildGoalBookSourceAtlasInputs(atlasAfterConfig,root)
const changedViews=Object.keys(atlasBefore.outputs).filter(p=>p.endsWith('.view.json')&&atlasBefore.outputs[p]!==atlasAfter.outputs[p]).map(p=>{const before=JSON.parse(atlasBefore.outputs[p]),after=JSON.parse(atlasAfter.outputs[p]);const ids=v=>v.rootNodes.flatMap(n=>n.children??[]).map(n=>n.goalId);return {path:p,removedGoalIds:ids(before).filter(i=>!ids(after).includes(i)),addedGoalIds:ids(after).filter(i=>!ids(before).includes(i))}})
assert.equal(changedViews.length,1);assert.deepEqual(changedViews[0].removedGoalIds.sort(),['523f7ef4-ed2b-5bda-8fc1-e4c4c94669a0','d11b3b18-deec-5d1a-bff6-512cddf595a2','f53d0a0b-d9b8-5012-92b5-3a021ab6c30b'].sort());assert.deepEqual(changedViews[0].addedGoalIds,[])
for(const r of [...first.inputs,...first.protectedInputs])refcheck(r)
const files=[];const walk=dir=>{for(const item of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,item.name);assert.equal(item.isSymbolicLink(),false);assert.equal(item.name.normalize('NFC'),item.name);if(item.isDirectory())walk(p);else{assert.equal(item.isFile(),true);files.push(path.relative(base,p))}}};walk(base);assert.equal(new Set(files.map(p=>p.toLowerCase())).size,files.length)
const output={atUTC:new Date().toISOString(),result:'PASS',currentTupleFingerprints:tuples,sixExactActualPDeltas:pDeltas,actualHEChangedOnlyThreeSourceIds:changedHe,actualHEOtherSourceRowsUnchanged:141,actualRPOnlyOneSourceLocatorChange:rpDiff,currentWhole395ModelRebuiltExactInMemory:true,currentModelDigest:model.digest,routeProposalRebindingsHypotheticalOnly:routeRebindings,routeOnlyFourChangedWholePages:changedRoutePages.map(p=>({goalId:p.goalId,before:model.pages.find(x=>x.goalId===p.goalId),after:p})),orientationDirectConsumers:land.goals.filter(g=>g.requires?.includes(orientation.goalId)).length,orientationDirectCurricularAtomicConsumers:land.goals.filter(g=>g.requires?.includes(orientation.goalId)&&input.semanticKindLedger.decisions.find(d=>d.goalId===g.id)?.semanticKind==='curricularAtomic').length,orientationChangedWhole395Pages:0,only003SourceProposalActualChangedViews:changedViews,unchangedManifestBoundInputs:first.inputs.length,unchangedProtectedInputs:first.protectedInputs.length,portableRegularFiles:files.length,ownPeerResultsRead:false,sourceApproval:false,humanApproval:false,activeWrites:false,htmlOrPdfFullRender:false}
fs.writeFileSync(path.join(base,'checks.current-normal-fingerprints-deltas-proposal-impact.actual.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({result:output.result,tuples:tuples.length,actualPFields:pDeltas.length,modelExact:true,routeChangedPages:changedRoutePages.map(p=>p.goalId),orientationConsumers:output.orientationDirectConsumers,orientationChangedWhole395Pages:0,only003ChangedSourceViews:changedViews,protectedInputsUnchanged:first.protectedInputs.length},null,2))
