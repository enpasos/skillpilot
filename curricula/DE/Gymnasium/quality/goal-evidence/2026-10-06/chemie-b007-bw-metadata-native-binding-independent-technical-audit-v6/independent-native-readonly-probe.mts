// Apache-2.0. Independent technical audit only; all inputs stay read-only.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
const repo=process.cwd()
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/'
const author=resolve(repo,base+'chemie-b007-bw-reviewed-metadata-native-binding-preparation-author-v6')
const own=resolve(repo,base+'chemie-b007-bw-metadata-native-binding-independent-technical-audit-v6')
const model=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')).href)
const atlas=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookSourceAtlasInputs.ts')).href)
const originals=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookOriginalSources.ts')).href)
const context=await import(pathToFileURL(resolve(repo,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const dFingerprint=await import(pathToFileURL(resolve(repo,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const evidence=await import(pathToFileURL(resolve(repo,'app/scripts/goalEvidenceProfileModel.ts')).href)
const load=(p:string):any=>JSON.parse(readFileSync(p,'utf8'))
const save=(name:string,value:any)=>writeFileSync(resolve(own,name),JSON.stringify(value,null,2)+'\n')
const equal=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const stableEqual=(a:any,b:any)=>model.stableGoalBookJson(a)===model.stableGoalBookJson(b)
const hash=(bytes:any)=>'sha256:'+createHash('sha256').update(bytes).digest('hex')
const semantic=(v:any)=>hash(model.stableGoalBookJson(v))
const canon='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const ledger='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const config='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const full='curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-book-full.config.json'
const publicConfig='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json'
const currentReport=load(resolve(repo,base+'chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json'))
const protectedIDs=new Set(currentReport.subjects.find((s:any)=>s.subject==='chemie').strictCompleteGoalIds)
assert.equal(protectedIDs.size,127)
const runs:any[]=[]
for (const lane of ['baseline-current','future-metadata-only']) {
  const checkout=resolve(author,lane,'checkout')
  const canonical=load(resolve(checkout,canon))
  const kinds=load(resolve(checkout,ledger))
  assert.equal(canonical.goals.length,479)
  const goalMap=new Map(canonical.goals.map((g:any)=>[g.id,g]))
  assert.equal(goalMap.size,479)
  const fingerprints=kinds.decisions.map((r:any)=>({goalId:r.goalId,declared:r.sourceFingerprint,actual:model.fingerprintSemanticKindSourceGoal(goalMap.get(r.goalId))}))
  assert.equal(fingerprints.length,479)
  assert.ok(fingerprints.every((r:any)=>r.declared===r.actual))
  const inputConfig=atlas.readGoalBookSourceAtlasInputConfig(config,checkout)
  // Both APIs are pure reads/derivations; outputs remain returned strings.
  const derived=atlas.buildGoalBookSourceAtlasInputs(inputConfig,checkout)
  const checked=atlas.checkGoalBookSourceAtlasInputs(config,checkout)
  assert.ok(stableEqual(derived.receipt,checked.receipt))
  assert.ok(stableEqual(derived.receipt,load(resolve(author,lane,'native-artifacts/source-atlas.receipt.json'))))
  const loadedFull=await model.loadGoalBookBuildInputs(full,checkout)
  const loadedNational=await model.loadGoalBookBuildInputs(publicConfig,checkout)
  assert.equal(loadedFull.model.pages.length,378)
  assert.equal(loadedNational.model.pages.length,359)
  assert.ok(stableEqual(loadedFull.model,load(resolve(author,lane,'native-artifacts/current378.full.book-model.json'))))
  assert.ok(stableEqual(loadedNational.model,load(resolve(author,lane,'native-artifacts/national359.book-model.json'))))
  const sourceIndex=originals.buildGoalBookOriginalSources(loadedNational.model,checkout,inputConfig.mappingPaths)
  assert.ok(stableEqual(sourceIndex,load(resolve(author,lane,'native-artifacts/national359.original-sources.json'))))
  runs.push({lane,checkout,canonical,kinds,goalMap,fingerprints,derived,full:loadedFull.model,national:loadedNational.model,sourceIndex})
  console.log(lane+': independent pure native derivation/check and complete stored full378/national359/original-source models match')
}
const [before,after]=runs
assert.deepEqual(before.derived.receipt.scopes,after.derived.receipt.scopes)
assert.deepEqual(before.derived.receipt.omittedGoals,after.derived.receipt.omittedGoals)
assert.deepEqual(before.derived.receipt.unresolvedSourceScopes,after.derived.receipt.unresolvedSourceScopes)
assert.deepEqual(before.full.pages,after.full.pages)
assert.deepEqual(before.national.pages,after.national.pages)
const ledgerRows=before.kinds.decisions.map((b:any,index:number)=>{const a=after.kinds.decisions[index];const {sourceFingerprint:_b,...restB}=b;const {sourceFingerprint:_a,...restA}=a; assert.deepEqual(restB,restA);return {goalId:b.goalId,classificationStatusBasisExact:true,fingerprintChanged:b.sourceFingerprint!==a.sourceFingerprint,before:b.sourceFingerprint,after:a.sourceFingerprint}})
assert.equal(ledgerRows.filter((r:any)=>r.fingerprintChanged).length,5)
const qa=load(resolve(repo,'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'))
const resourceDigests:any={}
const imageBindings:any[]=[]
for(const r of qa.records) if(r.visualizationState==='available'){
  const bytes=readFileSync(resolve(repo,r.publicAssetPath));const digest=hash(bytes)
  resourceDigests[r.imageUrl]=digest
  imageBindings.push({goalId:r.goalId,publicAssetPath:r.publicAssetPath,sha256:digest,bytes:bytes.length,protectedCurrent127:protectedIDs.has(r.goalId)})
}
assert.equal(imageBindings.filter((r:any)=>r.protectedCurrent127).length,127)
const resolveSource=(index:any,goalID:string)=>{
  const rows=new Map(index.evidence.map((r:any)=>[r.id,r]))
  const docs=new Map(index.documents.map((r:any)=>[r.id,r]))
  return (index.goals[goalID]??[]).map((scope:any)=>{const {evidenceIds,...metadata}=scope;return {...metadata,completeEvidence:evidenceIds.map((id:string)=>{const row:any=rows.get(id);const {id:_id,documentId,...fields}=row;const document:any=docs.get(documentId);const {id:_doc,...documentFields}=document;return {...fields,completeDocument:documentFields}})}})
}
const afterPages=new Map(after.full.pages.map((p:any)=>[p.goalId,p]))
const semanticRows:any[]=[]
const attributionRows:any[]=[]
for(const pageB of before.full.pages){
  const id=pageB.goalId;const pageA:any=afterPages.get(id)
  const goalB:any=before.goalMap.get(id),goalA:any=after.goalMap.get(id)
  const dPart=(g:any,p:any)=>({goalId:id,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,currentTitleDe:g.title,currentTitleEn:g.titleEn??null,currentDescriptionDe:g.description,currentDescriptionEn:g.descriptionEn??null,canonicalContext:context.buildGoalDescriptionCanonicalContext(g),reviewContext:{page:p,evidenceProfile:null}})
  assert.equal(pageB.evidenceReview,null)
  const dB=dPart(goalB,pageB),dA=dPart(goalA,pageA)
  const pB=evidence.goalEvidenceReviewInputPayload(goalB,'goal-evidence-v1',resourceDigests,'curricularAtomic')
  const pA=evidence.goalEvidenceReviewInputPayload(goalA,'goal-evidence-v1',resourceDigests,'curricularAtomic')
  assert.deepEqual(dB,dA);assert.deepEqual(pB,pA)
  assert.deepEqual(goalB.resourceLinks,goalA.resourceLinks)
  const sourcesB=resolveSource(before.sourceIndex,id),sourcesA=resolveSource(after.sourceIndex,id)
  semanticRows.push({goalId:id,protectedCurrent127:protectedIDs.has(id),wholeDEENExact:['title','titleEn','description','descriptionEn'].every(k=>goalB[k]===goalA[k]),edgesExact:equal(goalB.requires,goalA.requires)&&equal(goalB.contains,goalA.contains),wholeNativePageExact:equal(pageB,pageA),DInputPartBefore:dB,DInputPartAfter:dA,DContextFingerprintBefore:dFingerprint.fingerprintGoalDescriptionReviewContext(dB),DContextFingerprintAfter:dFingerprint.fingerprintGoalDescriptionReviewContext(dA),PInputPayloadBefore:pB,PInputPayloadAfter:pA,PInputFingerprintBefore:evidence.fingerprintGoalEvidenceReviewInput(goalB,'goal-evidence-v1',resourceDigests,'curricularAtomic'),PInputFingerprintAfter:evidence.fingerprintGoalEvidenceReviewInput(goalA,'goal-evidence-v1',resourceDigests,'curricularAtomic'),imageLinksAndNativeVisualizationExact:equal(goalB.resourceLinks,goalA.resourceLinks)&&equal(pageB.visualization,pageA.visualization),resolvedSourceAttributionChanged:!equal(sourcesB,sourcesA)})
  if(!equal(sourcesB,sourcesA))attributionRows.push({goalId:id,protectedCurrent127:protectedIDs.has(id),before:sourcesB,after:sourcesA})
}
assert.equal(semanticRows.length,378)
assert.equal(attributionRows.length,186)
assert.equal(attributionRows.filter((r:any)=>r.protectedCurrent127).length,68)
const changedGeneratedOutputs=Object.keys(before.derived.outputs).filter(k=>before.derived.outputs[k]!==after.derived.outputs[k])
assert.deepEqual(changedGeneratedOutputs,['app/scripts/config/goal-books/source-views/de-gym-chemistry-national-atlas/source-projection.receipt.json'])
save('independent-native-production-contract-and-fingerprint.receipt.json',{schemaVersion:1,createdAtUTC:new Date().toISOString(),pureReadOnlyNativeRun:true,modelScope:'full378/national359 and all48 source derivations; no whole PDFs',productionContracts:{semanticKindSource:'semantic-kind-source-fingerprint-v1 includes /extendedData; classification/status/basis not changed',D:'buildGoalDescriptionCanonicalContext includes goal.sourceRef, not extendedData.provenance; full review config has evidenceReviewPaths [] and native pages evidenceReview null, so profile null is legitimate',P:'goalEvidenceReviewInputPayload combines semantic goal, requires/contains/examples and actual image digests; provenance.sourceRef excluded'},counts:before.derived.receipt.counts,completeStoredModelsMatchProduction:true,orderedPagesAndAll48WholeWitnessSetsExact:true,unresolvedAndOmittedSetsExact:true,ledgerFingerprintRows:ledgerRows,imageBindings,changedGeneratedOutputs,actualOriginalSourceAttributionChangedGoalIDs:attributionRows.map((r:any)=>r.goalId),actualOriginalSourceAttributionChangedProtected127IDs:attributionRows.filter((r:any)=>r.protectedCurrent127).map((r:any)=>r.goalId),runs:runs.map(r=>({lane:r.lane,semanticFingerprintChecks:r.fingerprints.length,atlasCheck:'PASS',nativeFullPages:r.full.pages.length,nativeNationalPages:r.national.pages.length,fullModelSemanticDigest:semantic(r.full),nationalModelSemanticDigest:semantic(r.national),sourceIndexSemanticDigest:semantic(r.sourceIndex)})),activeWrites:0,scienceReviews:0,newStrictClosures:0,humanApproval:false})
save('independent-complete378-DEEN-D-P-page-image.actual.json',{schemaVersion:1,rows:semanticRows,activeWrites:0})
save('independent-186-changed-source-attributions.actual.json',{schemaVersion:1,affectedGoals:186,affectedProtected:68,rows:attributionRows,noClaimOfUnchangedAttribution:true,activeWrites:0})
console.log('PASS: 479 native semantic bindings; full378/national359 pages; all48 witnesses; D/P/image continuity; changed186/protected68 source attribution')
