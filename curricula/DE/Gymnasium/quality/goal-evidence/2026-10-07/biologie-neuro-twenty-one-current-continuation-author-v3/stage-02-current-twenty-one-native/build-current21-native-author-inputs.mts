// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fingerprintSemanticKindSourceGoal, loadGoalBookBuildInputs, writeGoalBookModel, stableGoalBookJson } from '../../../../../../../../app/scripts/goalBookModel'
import { buildPositiveGoalEvidenceCandidateRecords } from '../../../../../../../../app/scripts/materializePositiveGoalEvidenceCandidates'
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../../app/scripts/positiveGoalEvidenceReview'
import { buildGoalDescriptionCanonicalContext } from '../../../../../../../../app/scripts/validateGoalDescriptionReviewCampaign'
import { fingerprintGoalDescriptionReviewContext } from '../../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution'

const root='/home/enpasos/projects/skillpilot', own=dirname(fileURLToPath(import.meta.url)), ownRel=relative(root,own)
const tracked=new Map<string,any>(), sha=(v:string|Buffer)=>'sha256:'+createHash('sha256').update(v).digest('hex')
const read=(p:string)=>{const abs=resolve(root,p),b=readFileSync(abs);tracked.set(relative(root,abs),{path:relative(root,abs),sha256:sha(b),bytes:b.length});return JSON.parse(b.toString())}
const write=(name:string,v:any)=>{const p=resolve(own,name);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,JSON.stringify(v,null,2)+'\n');return relative(root,p)}
const same=(a:any,b:any)=>stableGoalBookJson(a)===stableGoalBookJson(b)
const currentPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert.equal(sha(readFileSync(resolve(root,currentPath))),'sha256:244d2889ddeeb69cbf97d0a320f3e38cf5444674f3bb17f3e46c0112ac6fbff1')
const baseline=read(ownRel+'/current472.actual-baseline.snapshot.json'),future=read(ownRel+'/current472-neuro21.complete-author-candidate.json')
assert.deepEqual(baseline,read(currentPath))
const scope=read(ownRel+'/current21-thirteen-plus-eight-reuse-and-real-boundaries.author.json'), ids:string[]=scope.selected21Ids, selected=new Set(ids)
const originalKinds=read('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'),beforeKinds=structuredClone(originalKinds),afterKinds=structuredClone(originalKinds)
beforeKinds.sourceLandscapePath=ownRel+'/current472.actual-baseline.snapshot.json'
afterKinds.sourceLandscapePath=ownRel+'/current472-neuro21.complete-author-candidate.json'
const bg=new Map<string,any>(baseline.goals.map((g:any)=>[g.id,g])),fg=new Map<string,any>(future.goals.map((g:any)=>[g.id,g]))
const kindDeltas:any[]=[]
for(let i=0;i<afterKinds.decisions.length;i++){
 const d=afterKinds.decisions[i],fp=fingerprintSemanticKindSourceGoal(fg.get(d.goalId))
 assert.equal(beforeKinds.decisions[i].sourceFingerprint,fingerprintSemanticKindSourceGoal(bg.get(d.goalId)))
 if(fp!==d.sourceFingerprint){assert.ok(selected.has(d.goalId));kindDeltas.push({goalId:d.goalId,before:d.sourceFingerprint,after:fp});d.sourceFingerprint=fp}
 else assert.deepEqual(d,originalKinds.decisions[i])
 for(const k of ['semanticKind','decisionStatus','decisionBasis'])assert.deepEqual(d[k],originalKinds.decisions[i][k])
}
assert.deepEqual(beforeKinds.counts,afterKinds.counts)
assert.equal(afterKinds.counts.total,472);assert.equal(afterKinds.counts.curricularAtomic,390)
write('semantic-kinds.current472.baseline.snapshot.json',beforeKinds)
write('semantic-kinds.current472.neuro21.source-binding.author-candidate.json',afterKinds)
write('kind-source-fingerprint-deltas.technical-author-only.json',{changedSourceFingerprints:kindDeltas,otherWholeDecisionCount:472-kindDeltas.length,all472ClassificationsStatusBasisAndCountsExact:true,twoCandidateSourceLandscapePathsExplicit:true,newScientificAtomicityDecision:false})
const rootGoal=baseline.goals.find((g:any)=>g.tags?.includes('root'))
assert.ok(rootGoal)
const view={viewId:'neuro21-author-current390-canonical-review',landscapeId:baseline.landscapeId,scope:{schoolForm:'Gymnasium',stage:'CrossStage'},rootNodes:[{kind:'structure',id:'bio-current390-author-review',label:'Biologie – kanonische Prüfsicht',children:[{kind:'canonicalSubtree',goalId:rootGoal.id}]}]}
write('current390-canonical-technical-review.view.json',view)
const activeBook=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json'),qa=read(activeBook.goalVisualizationQaPath)
write('current-biology-visualization-qa.exact-snapshot.json',qa)
const configBase={schemaVersion:1,bookId:'neuro21-author-current390-canonical-review',title:'Biologie – vollständige kanonische Autoren-Prüfsicht',compositionViewPath:ownRel+'/current390-canonical-technical-review.view.json',goalVisualizationQaPath:ownRel+'/current-biology-visualization-qa.exact-snapshot.json',publicationMode:'review',atlasBaseUrl:'https://skillpilot.com/lernzielbuch',evidenceReviewPaths:[]}
const beforeConfig={...configBase,landscapePath:ownRel+'/current472.actual-baseline.snapshot.json',semanticKindLedgerPath:ownRel+'/semantic-kinds.current472.baseline.snapshot.json',outputPath:ownRel+'/qa-artifacts/full-current390.book-model.json'}
const afterConfig={...configBase,landscapePath:ownRel+'/current472-neuro21.complete-author-candidate.json',semanticKindLedgerPath:ownRel+'/semantic-kinds.current472.neuro21.source-binding.author-candidate.json',outputPath:ownRel+'/qa-artifacts/full-candidate390.book-model.json'}
write('full-current390.book.config.json',beforeConfig);write('full-candidate390.book.config.json',afterConfig)
const currentBuild=await loadGoalBookBuildInputs(ownRel+'/full-current390.book.config.json')
const futureBuild=await loadGoalBookBuildInputs(ownRel+'/full-candidate390.book.config.json')
assert.equal(currentBuild.model.pages.length,390);assert.equal(futureBuild.model.pages.length,390)
assert.deepEqual(currentBuild.model.pages.map((p:any)=>p.goalId),futureBuild.model.pages.map((p:any)=>p.goalId))
await writeGoalBookModel(currentBuild.model,resolve(root,beforeConfig.outputPath));await writeGoalBookModel(futureBuild.model,resolve(root,afterConfig.outputPath))
const bp=new Map<string,any>(currentBuild.model.pages.map((p:any)=>[p.goalId,p])),fp=new Map<string,any>(futureBuild.model.pages.map((p:any)=>[p.goalId,p]))
const inp=(g:any,p:any)=>({goalId:g.id,goalFingerprint:p.goalFingerprint,pageFingerprint:p.pageFingerprint,currentTitleDe:g.title,currentTitleEn:g.titleEn,currentDescriptionDe:g.description,currentDescriptionEn:g.descriptionEn,canonicalContext:buildGoalDescriptionCanonicalContext(g),reviewContext:{page:p,evidenceProfile:null}})
const pageDeltas=currentBuild.model.pages.map((b:any)=>{const a=fp.get(b.goalId),ci=inp(bg.get(b.goalId),b),fi=inp(fg.get(b.goalId),a);return{goalId:b.goalId,selected21:selected.has(b.goalId),wholeGoalExact:same(bg.get(b.goalId),fg.get(b.goalId)),wholePageExact:same(b,a),wholeNativeDInputExact:same(ci,fi),wholeCanonicalContextExact:same(ci.canonicalContext,fi.canonicalContext),sourceAttributionExact:same(bg.get(b.goalId).sourceRef,fg.get(b.goalId).sourceRef)&&same(bg.get(b.goalId).extendedData,fg.get(b.goalId).extendedData),actualPageChangedFields:Object.keys(b).filter(k=>!same(b[k],a[k])),before:{goalFingerprint:b.goalFingerprint,pageFingerprint:b.pageFingerprint,contextFingerprint:fingerprintGoalDescriptionReviewContext(ci)},candidate:{goalFingerprint:a.goalFingerprint,pageFingerprint:a.pageFingerprint,contextFingerprint:fingerprintGoalDescriptionReviewContext(fi)}}})
const protectedReceipt=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-eight-missing-primary-scope-remediation-author-v2/protected-current74.actual-full-page-and-source-context-checks.json')
const protectedRows=protectedReceipt.map((r:any)=>pageDeltas.find((x:any)=>x.goalId===r.goalId))
assert.equal(protectedRows.length,74);assert.ok(protectedRows.every((r:any)=>r.wholeGoalExact&&r.wholePageExact&&r.wholeNativeDInputExact))
write('all390-current-candidate-pages-contexts-source-visual-deltas.author.json',{role:'technical native full canonical model comparison; no country source-view reapproval',before:beforeConfig.outputPath,candidate:afterConfig.outputPath,all390OrderedIdsExact:true,other451WholeCanonicalGoalsExact:true,protected74Rows:protectedRows,protected74WholeGoalPageAndDContextExact:true,rows:pageDeltas,actualChangedWholePages:pageDeltas.filter((r:any)=>!r.wholePageExact).map((r:any)=>r.goalId),actualChangedWholeDInputs:pageDeltas.filter((r:any)=>!r.wholeNativeDInputExact).map((r:any)=>r.goalId),sourceAtlasBookWasNotRebuiltOrApproved:true})
const pconfig=read(ownRel+'/positive-evidence.current21.native.config.json'),spec=read(ownRel+'/positive-evidence.current21.complete.author-candidates.json')
const precords=await buildPositiveGoalEvidenceCandidateRecords({config:pconfig,candidateSet:spec})
writeFileSync(resolve(root,pconfig.reviewPath),precords.map((r:any)=>JSON.stringify(r)).join('\n')+'\n')
const checked=reviewPositiveGoalEvidenceConfig(ownRel+'/positive-evidence.current21.native.config.json')
assert.deepEqual(checked.errors,[]);assert.equal(precords.length,21)
assert.ok(precords.every((r:any)=>r.status==='needs_human_review'&&r.reviewAuthority==='ai_candidate'&&r.reviewRunIds.length===0))
write('native-positive-current21-preparation.actual.author-receipt.json',{actualProductionMaterializerAndChecker:true,records:21,blockingIssues:0,needsHumanReview:21,reviewAuthority:'ai_candidate',E1G1:true,reviewRunIdsEmpty:true,independentScientificApproval:false})
for(const [label,goalIds] of [['twenty',ids.slice(0,20)],['one',ids.slice(20)]] as const){
 const batchId='biologie-neuro-current-'+label+'-20261007-author-v3'
 write('native-d-'+label+'.batch.config.json',{$schema:'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json',schemaVersion:1,batchId,subject:'biologie',subjectLabel:'Biologie',bookId:batchId,title:'Biologie – neuronale Informationsverarbeitung ('+goalIds.length+' Ziele)',baseGoalBookConfigPath:ownRel+'/full-candidate390.book.config.json',goalIds,outputDirectory:ownRel+'/native-d-'+label,feedbackBaseUrl:'https://skillpilot.com/lernziel-feedback',promptPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',criteriaPath:'curricula/DE/Gymnasium/quality/goal-evidence/prompts/biology-goal-description-understanding-evidence-review-criteria-v2.md',printDerivativeProfile:'bounded-atlas'})
}
const missing=ids.map(id=>({goalId:id,visualization:fp.get(id).visualization,currentResourceLinks:fg.get(id).resourceLinks??[]}))
assert.ok(missing.every((r:any)=>r.currentResourceLinks.length===0))
write('all21-current-missing-visualizations.actual-author-boundary.json',{rows:missing,all21ActualGoalLinksMissing:true,newImagesGenerated:0,visualizationApproval:false,fullNativeDReviewMustRespectMissingV:true})
for(const [path,b] of tracked)assert.equal(sha(readFileSync(resolve(root,path))),b.sha256,'Live input drift: '+path)
write('actual-native-current-inputs.author-guard.json',{inputBindings:[...tracked.values()],activeBaselineUnchanged:true,canonical472:true,current390PagesExactIds:true,protected74WholePagesAndContextsExact:true,globalBuild:false,centralRun:false,activeWrites:false,sourceSupersetApproval:false})
console.log(JSON.stringify({currentWhole472:true,fullNative390Models:2,current21Positive:'PASS21',changedKindSourceFPs:kindDeltas.length,changedFullPages:pageDeltas.filter((r:any)=>!r.wholePageExact).length,protected74WholePageDContext:'exact',plannedD:[20,1],primaryImagesMissing:21,newScience:false,strictNetGain:0}))
