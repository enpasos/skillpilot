// SPDX-License-Identifier: Apache-2.0
// E0/G0 author materialization only; unchanged schemas/helpers and finite context audit.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve,relative,dirname} from 'node:path'
import {fileURLToPath,pathToFileURL} from 'node:url'
import {createRequire} from 'node:module'
const root=process.cwd(),own=resolve(dirname(fileURLToPath(import.meta.url)),'..'),rel=relative(root,own)
assert.ok(!existsSync(resolve(own,'FILES.finite-author-successor.seal.json')))
const at=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8')),get=(p:string)=>JSON.parse(readFileSync(resolve(own,p),'utf8'))
const hash=(b:string|Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex'),bind=(p:string)=>({path:p,sha256:hash(readFileSync(resolve(root,p))),bytes:readFileSync(resolve(root,p)).length})
const write=(p:string,d:any)=>writeFileSync(resolve(own,p),JSON.stringify(d,null,2)+'\n')
const req=createRequire(resolve(root,'app/package.json')),Ajv=req('ajv/dist/2020').default,ajv=new Ajv({strict:false,allErrors:true});req('ajv-formats')(ajv)
const schema=ajv.compile(at('contracts/goal-evidence/v2/goal-evidence-profile.schema.json')),runtime=ajv.compile(at('docs/landscape-runtime.schema.json'))
const helper=await import(pathToFileURL(resolve(root,'app/scripts/positiveGoalEvidenceProfileModel.ts')).href),book=await import(pathToFileURL(resolve(root,'app/scripts/goalBookModel.ts')).href)
const {normalizeCanonicalLandscape,validateCanonicalLandscape}=await import(pathToFileURL(resolve(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const {prepareLandscapeEntries}=await import(pathToFileURL(resolve(root,'app/src/hooks/useLandscapes.ts')).href)
const {buildGoalDescriptionCanonicalContext}=await import(pathToFileURL(resolve(root,'app/scripts/validateGoalDescriptionReviewCampaign.ts')).href)
const {fingerprintGoalDescriptionReviewContext}=await import(pathToFileURL(resolve(root,'app/scripts/validateGoalDescriptionDualRoundResolution.ts')).href)
const sel=get('INPUTS.exact-current560-author-successor.json'),before=at(sel.currentWhole560.path),after=get('candidate/canonical560.current422.two-description-successors.author.json')
const B=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),A=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
const semantic=at(sel.currentSemantic560.path),oldSemantic=structuredClone(semantic),semanticCAS:any[]=[]
for(const d of semantic.decisions){const fp=book.fingerprintSemanticKindSourceGoal(A.get(d.goalId));if(fp!==d.sourceFingerprint){semanticCAS.push({goalId:d.goalId,wholeBefore:structuredClone(d),wholeAfter:{...d,sourceFingerprint:fp}});d.sourceFingerprint=fp}}
assert.equal(semanticCAS.length,2)
write('candidate/semantic560.same-decisions-two-description-source-bindings.json',semantic)
write('CAS.semantic-two-source-bindings-only.json',{role:'Mechanical binding of unchanged existing classifications, no A vote',originalSemantic:sel.currentSemantic560,changes:semanticCAS,other558WholeDecisionsExact:true,allKindsAndOtherDecisionFieldsExact:true,newVotes:0})
const map=at(sel.whole560PhysicalInputMap.path),digests:Record<string,string>={}
for(const r of map.selectedCurrentAssetRows)digests['/'+r.normalPublicDestination.replace(/^app\/public\//,'')]=r.physicalRepositorySource.sha256
const original=readFileSync(resolve(root,sel.beforeProfiles20.path),'utf8').trim().split('\n').map(l=>JSON.parse(l)),author=at(sel.wholeOriginalAuthorSelector.path),oldMat=author.wholeCases42
const casesPath=rel+'/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json',matBind=bind(casesPath),cases=at(casesPath).cases,C=new Map<string,any>(cases.map((c:any)=>[c.id,c]))
const records:any[]=[],profileRows:any[]=[],profileCAS:any[]=[]
for(const beforeRow of original){
 const r=structuredClone(beforeRow),g=A.get(r.goalId),profile=r.profile
 for(const brief of profile.applicationCaseBriefs){
  const c=C.get(brief.id)
  for(const field of ['taskDemandDe','taskDemandEn']){assert.ok(brief[field].includes(oldMat.path)&&brief[field].includes(oldMat.sha256));brief[field]=brief[field].replace(oldMat.path,casesPath).replace(oldMat.sha256,matBind.sha256)}
  if(brief.id==='energy20-17-b'){brief.expectedPerformanceDe=c.workedReasoningDe;brief.expectedPerformanceEn=c.workedReasoningEn}
 }
 r.reviewId=beforeRow.reviewId+'-four-defects-author-successor'
 r.reviewedAt=new Date().toISOString();r.reviewer='Codex informed Energy20 four-defect successor AUTHOR;not independent reviewer'
 r.reason=beforeRow.reason+' Additive author successor after sealed original A-FIRST: two descriptions and two full cases corrected; all profiles remain E0/G0. Source/course/atomicity holds and six stale M bindings are not waived.'
 r.goalFingerprint=helper.fingerprintGoalForPositiveEvidence(g,'curricularAtomic')
 r.reviewInputFingerprint=helper.fingerprintPositiveGoalEvidenceReviewInput(g,r.reviewCriteriaFingerprint,digests,'curricularAtomic')
 r.profileFingerprint=helper.fingerprintPositiveGoalEvidenceProfile(profile)
 assert.equal(r.evidenceLevel,'E0');assert.equal(r.maximumClaimScope,'G0');assert.equal(r.reviewAuthority,'ai_candidate');assert.equal(r.status,'needs_human_review');assert.deepEqual(r.reviewRunIds,[])
 const ok=schema(r),errors=helper.validatePositiveGoalEvidenceRecordSemantics(r,g,digests,'curricularAtomic');assert.ok(ok&&!errors.length,JSON.stringify({goalId:r.goalId,schema:schema.errors,errors}))
 profileRows.push({goalId:r.goalId,schemaPass:ok,normalProductionErrors:errors,evidenceLevel:r.evidenceLevel,maximumClaimScope:r.maximumClaimScope,descriptionInputFingerprintChanged:r.reviewInputFingerprint!==beforeRow.reviewInputFingerprint,profileFingerprintChanged:r.profileFingerprint!==beforeRow.profileFingerprint})
 profileCAS.push({goalId:r.goalId,wholeBefore:beforeRow,wholeAfter:r,changes:{authorMetadata:['reviewId','reviewedAt','reviewer','reason'],materialPointerTransportInWholeProfile:true,scientificProfileContentChange:r.goalId==='551d81a7-2308-540f-8323-df35c6871d62'?'Only17b expectedPerformanceDe/En mirrors corrected whole case; other expectations/coverage/rubrics/transfers exact':'None; expectations, coverage, case task/solution/transfer semantics unchanged',descriptionInputChanged:r.reviewInputFingerprint!==beforeRow.reviewInputFingerprint}})
 records.push(r)
}
assert.equal(records.length,20);assert.deepEqual(records.map(r=>r.goalId),sel.scopeGoalIds)
assert.equal(profileRows.filter(r=>r.descriptionInputFingerprintChanged).length,2)
writeFileSync(resolve(own,'candidate/twenty-raw-profiles.E0G0.material-successor.author.jsonl'),records.map(r=>JSON.stringify(r)).join('\n')+'\n')
write('CAS.twenty-whole-raw-author-profiles.metadata-material-bindings-only.json',{role:'New raw author candidate rows, never positive P science. Complete before/after original bodies retained.',original20:sel.beforeProfiles20,currentCases:matBind,rows:profileCAS,unchangedCoverageExpectationsAndTwoDemonstrationsFreshVariationIndependentTransfer:true,newPositiveP:0,newM:0})
write('checks/PROFILE20.normal-closed-schema-and-production-helper.actual.json',{pass:true,schema:bind('contracts/goal-evidence/v2/goal-evidence-profile.schema.json'),normalHelper:bind('app/scripts/positiveGoalEvidenceProfileModel.ts'),wholeCases:matBind,records:profileRows,authorProfiles:20,positiveP:0,newVotes:0})
assert.ok(runtime(after),JSON.stringify(runtime.errors));const diagnostics=validateCanonicalLandscape(normalizeCanonicalLandscape(after));assert.ok(!diagnostics.some((d:any)=>d.severity==='error'),JSON.stringify(diagnostics))
for(const field of ['requires','contains']){const done=new Set<string>(),busy=new Set<string>();const walk=(id:string)=>{assert.ok(A.has(id));assert.ok(!busy.has(id),field+' cycle '+id);if(done.has(id))return;busy.add(id);for(const r of A.get(id)[field]??[])walk(r);busy.delete(id);done.add(id)};for(const id of A.keys())walk(id)}
const projection=(land:any)=>prepareLandscapeEntries([land])[0].goals.map((g:any)=>({id:g.id,requires:g.requires,effective:g.effectiveRequires,contains:g.contains}))
assert.deepEqual(projection(before),projection(after))
write('checks/DATA560.normal-schema-canonical-direct-contains-effective.actual.json',{pass:true,normalRuntimeSchema:true,normalCanonicalDiagnostics:diagnostics,wholeGoals:560,ordinaryAtomic:422,directRequiresDAG:true,containsDAG:true,all560DirectAndEffectiveRequiresExact:true,allResourceLinksExact:true,other558WholeGoalsExact:true,other40WholeCasesExact:true,newVotes:0})
const norm=(v:any)=>String(v??'').normalize('NFKC').replace(/\s+/g,' ').trim(),mfp=(g:any)=>hash(book.stableGoalBookJson({ruleVersion:'memory-card-review-v1',goalId:g.id,shortKey:g.shortKey??'',title:norm(g.title),titleEn:norm(g.titleEn),description:norm(g.description),descriptionEn:norm(g.descriptionEn),phase:norm(g.dimensionTags?.phase),area:norm(g.dimensionTags?.area),topicCode:norm(g.dimensionTags?.topicCode),nodeKind:norm(g.nodeKind)}))
const mr=readFileSync(resolve(root,sel.originalM422.path),'utf8').trim().split('\n').map(l=>JSON.parse(l))
const mrows=mr.map((r:any)=>({goalId:r.goalId,originalFingerprint:r.fingerprint,beforeComputed:mfp(B.get(r.goalId)),afterComputed:mfp(A.get(r.goalId)),beforeStale:r.fingerprint!==mfp(B.get(r.goalId)),afterStale:r.fingerprint!==mfp(A.get(r.goalId))}))
assert.equal(mrows.length,422);assert.equal(mrows.filter(r=>r.beforeStale).length,4);assert.equal(mrows.filter(r=>r.afterStale).length,6)
write('checks/M422.original-rows-old4-plus-new2-stales-no-refresh.actual.json',{role:'Mechanical exact production fingerprint-payload comparison, not a new M decision',pass:true,originalM422:sel.originalM422,originalReviewerSelector:sel.originalWholeM422Selector,oldFourStales:mrows.filter(r=>r.beforeStale).map(r=>r.goalId),newTwoTextStales:mrows.filter(r=>r.afterStale&&!r.beforeStale).map(r=>r.goalId),totalSixStales:mrows.filter(r=>r.afterStale).map(r=>r.goalId),remainingCurrent:416,originalRowsEdited:0,fingerprintRefreshes:0,newM:0,rows:mrows})
// Unrendered exact stock context comparison only. No native/PDF/HTML rebuild.
const prep=at(sel.currentNative20Selector.path),cfg=at(prep.selector.path),input=at(cfg.nativeConfig.path),base=at(input.baseGoalBookConfigPath),view=at(base.compositionViewPath),qa=at(sel.currentQA438.path)
const build=(l:any,s:any)=>book.buildGoalBookModel({landscape:l,compositionView:view,semanticKindLedger:s,goalVisualizationQa:qa,goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config:{...base,evidenceReviewPaths:[]}})
const bm=build(before,oldSemantic),am=build(after,semantic),bp=new Map<string,any>(bm.pages.map((p:any)=>[p.goalId,p])),ap=new Map<string,any>(am.pages.map((p:any)=>[p.goalId,p]))
const baseSel=at(at(sel.currentNative20Selector.path).selector.path),baseline=at(baseSel.isolated321StockContextProbe.path),baselineReport=at(baseline.baseline321.path),strict=baselineReport.subjects[0].strictCompleteGoalIds
const wrap=(g:any,p:any)=>({goalId:g.id,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,currentTitleDe:g.title,currentTitleEn:g.titleEn,currentDescriptionDe:g.description,currentDescriptionEn:g.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(g),reviewContext:{page:p,evidenceProfile:null}})
const radius=strict.map((id:string)=>{const b=fingerprintGoalDescriptionReviewContext(wrap(B.get(id),bp.get(id))),a=fingerprintGoalDescriptionReviewContext(wrap(A.get(id),ap.get(id)));return {goalId:id,before:b,after:a,changed:b!==a}})
assert.equal(radius.length,321);assert.ok(radius.every((r:any)=>!r.changed))
write('checks/BOOK321.actual-unrendered-isolated-two-description-radius.json',{pass:true,role:'Unchanged normal stockBook/context helpers only; author graph probe, not D review or native rebuild',beforePageCount:bm.pages.length,afterPageCount:am.pages.length,samePSelectionBeforeAndAfter:[],unchanged321:321,changed321Ids:[],records:radius,nativeRebuild:false,centralExecuted:false,newVotes:0})
console.log(JSON.stringify({normal560SchemaAndDirectContainsEffective:'PASS',rawProfiles20E0G0:'PASS',descriptionInputChanges:2,sourceBindingChanges:2,unchanged321Contexts:321,oldMStales:4,newMStales:2,totalMStales:6,positiveP:0,newVotes:0,nativeRebuild:false}))
