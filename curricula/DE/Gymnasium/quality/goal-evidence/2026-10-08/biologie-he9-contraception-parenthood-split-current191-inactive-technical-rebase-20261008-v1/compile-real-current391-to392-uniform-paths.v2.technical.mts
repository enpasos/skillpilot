// First path-sorting failure and all its outputs remain immutable; exact-byte reuse only.
// SPDX-License-Identifier: Apache-2.0
// Actual inactive publication compiler after genuine paired science, never fake approval.
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {existsSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import addFormats from '../../../../../../../app/node_modules/ajv-formats/dist/index.js'
import {buildGoalBookModel,fingerprintSemanticKindSourceGoal,loadGoalBookBuildInputs} from '../../../../../../../app/scripts/goalBookModel.ts'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
import {validatePositiveGoalEvidenceRecordSemantics} from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel.ts'

const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const rp=(p:string)=>relative(root,p)
const sha=(b:Buffer|string)=>createHash('sha256').update(b).digest('hex')
const write=(p:string,o:any)=>{const bytes=Buffer.isBuffer(o)?o:Buffer.from(typeof o==='string'?o:JSON.stringify(o,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(bytes),'Existing immutable artifact must remain exact: '+p);return};mkdirSync(dirname(p),{recursive:true});writeFileSync(p,bytes,{flag:'wx'})}
const guards=read(resolve(own,'exact-current191-input-snapshots-and-rebase-guards.technical.json'))
const snapshots=guards.snapshotMap as Record<string,string>
const canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const old='3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
const children=['9d3f71d7-5273-5e50-b1ba-4e291edbf114','dd923eeb-eef0-5796-b372-a5d4f5be21f7']
const before=read(resolve(root,snapshots[canonical]))
const afterPath=resolve(own,'candidate/canonical.current476.reviewed-split.inactive.json'),after=read(afterPath)
const bb=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),ab=new Map<string,any>(after.goals.map((g:any)=>[g.id,g]))
assert.equal(before.goals.length,474);assert.equal(after.goals.length,476)
for(const [id,goal]of bb)if(id!==old)assert.deepEqual(ab.get(id),goal)
const kindsPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
const beforeKinds=read(resolve(root,snapshots[kindsPath])),kinds=structuredClone(beforeKinds)
assert.equal(kinds.counts.curricularAtomic,391)
for(const row of kinds.decisions)assert.equal(row.sourceFingerprint,fingerprintSemanticKindSourceGoal(bb.get(row.goalId)))
const scienceRefs=guards.genuinePairedSealsActuallyVerified.map((x:any)=>x.seal.path).join('; ')
const parent=kinds.decisions.find((d:any)=>d.goalId===old);assert.ok(parent)
parent.semanticKind='curricularArea';parent.sourceFingerprint=fingerprintSemanticKindSourceGoal(ab.get(old))
parent.decisionBasis='Technical adoption of both actual independent whole-source/split science judgments: stable former ID is the aggregate preserving both exact original clauses and achievement history. No atomic or human mastery claim. Science seals: '+scienceRefs
for(const goalId of children)kinds.decisions.push({goalId,sourceFingerprint:fingerprintSemanticKindSourceGoal(ab.get(goalId)),semanticKind:'curricularAtomic',decisionStatus:'authoritative',decisionBasis:'Technical adoption of paired genuine independent full-source, DE/EN cases, class, atomicity and memory science judgments for this exact whole child. Native final D/P/V and legacy gates remain pending. Science seals: '+scienceRefs})
kinds.counts=Object.fromEntries(Object.keys(kinds.counts).map(k=>[k,k==='total'?kinds.decisions.length:kinds.decisions.filter((d:any)=>d.semanticKind===k).length]))
assert.equal(kinds.counts.curricularAtomic,392);assert.equal(kinds.counts.curricularArea,45);assert.equal(kinds.counts.total,476)
kinds.sourceLandscapePath=rp(afterPath)
kinds.reviewMethod='retained-existing-scientific-classifications-plus-exact-paired-whole-HE12-split-science-adoption'
const nativeKindsPath=resolve(own,'candidate/semantic-kinds.current476.actual-paired-science.inactive.json')
write(nativeKindsPath,kinds)
const futureKinds={...kinds,sourceLandscapePath:canonical}
write(resolve(own,'candidate/semantic-kinds.current476.actual-paired-science.future-active.json'),futureKinds)
beforeKinds.sourceLandscapePath=snapshots[canonical]
const beforeKindsPath=resolve(own,'candidate/semantic-kinds.before391.scoped-snapshot.json');write(beforeKindsPath,beforeKinds)
const manifestPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.sources.json'
const beforeManifest=read(resolve(root,snapshots[manifestPath]))
beforeManifest.sourcePaths=beforeManifest.sourcePaths.map((p:string)=>snapshots[p]);beforeManifest.navigationViewPath=snapshots[beforeManifest.navigationViewPath];beforeManifest.durationModelPolicyPath=snapshots[beforeManifest.durationModelPolicyPath]
const beforeManifestPath=resolve(own,'candidate/atlas.sources.before391.scoped-snapshot.json');write(beforeManifestPath,beforeManifest)
const qaPath=snapshots['curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json']
const configBase={schemaVersion:1,bookId:'de-gym-biologie-bundesweit',title:'Lernzielbuch Biologie – Gymnasium bundesweit',publicationMode:'review',atlasBaseUrl:'https://skillpilot.com/lernzielbuch',goalVisualizationQaPath:qaPath,evidenceReviewPaths:[]}
const bc={...configBase,landscapePath:snapshots[canonical],semanticKindLedgerPath:rp(beforeKindsPath),compositionViewManifestPath:rp(beforeManifestPath),outputPath:rp(resolve(own,'native-v2/full391.before.pure.book-model.json'))}
const ac={...configBase,landscapePath:rp(afterPath),semanticKindLedgerPath:rp(nativeKindsPath),compositionViewManifestPath:rp(resolve(own,'candidate/atlas.sources.current392.uniform-view-paths.inactive.json')),outputPath:rp(resolve(own,'native-v2/full392.reviewed-split.no-new-raster.pure.book-model.json'))}
const bcp=resolve(own,'native-v2/full391.before.inactive.config.json'),acp=resolve(own,'native-v2/full392.reviewed-split.inactive.config.json')
write(bcp,bc);write(acp,ac)
const bi=await loadGoalBookBuildInputs(rp(bcp),root),ai=await loadGoalBookBuildInputs(rp(acp),root)
const bm=bi.model,am=ai.model
assert.equal(bm.pages.length,391);assert.equal(am.pages.length,392)
write(resolve(root,bc.outputPath),bm);write(resolve(root,ac.outputPath),am)
for(const id of children){const p=am.pages.find((p:any)=>p.goalId===id);assert.ok(p);assert.equal(p.visualization,null)}

// Exact native scope comparison on the latest snapshots, not the stale author baseline.
const beforeAtomic=new Set(beforeKinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const afterAtomic=new Set(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
const nBefore=normalizeCanonicalLandscape(before),nAfter=normalizeCanonicalLandscape(after)
const scopeRows=[]
for(const vg of guards.viewGuards){
 const bv=normalizeCompositionView(read(resolve(root,vg.beforeSnapshotPath))),av=normalizeCompositionView(read(resolve(root,vg.inactiveCandidatePath)))
 const bComp=compileCompositionView(bv,nBefore),aComp=compileCompositionView(av,nAfter)
 assert.deepEqual(bComp.findings.filter((f:any)=>f.severity==='error'),[]);assert.deepEqual(aComp.findings.filter((f:any)=>f.severity==='error'),[])
 const bp=collectCompositionProjectionRoleGoalIds(bv.rootNodes,bb),ap=collectCompositionProjectionRoleGoalIds(av.rootNodes,ab)
 const ba=[...bp.targetGoalIds].filter(id=>beforeAtomic.has(id)).sort(),aa=[...ap.targetGoalIds].filter(id=>afterAtomic.has(id)).sort()
 const expected=ba.filter(id=>id!==old);if(ba.includes(old))expected.push(...children);expected.sort();assert.deepEqual(aa,expected)
 assert.deepEqual(av.scope,bv.scope);assert.deepEqual([...bp.prerequisiteOnlyGoalIds].sort(),[...ap.prerequisiteOnlyGoalIds].sort())
 scopeRows.push({originalViewPath:vg.activePath,beforePath:vg.beforeSnapshotPath,afterPath:vg.inactiveCandidatePath,scope:bv.scope,beforeAtomicTargetCount:ba.length,afterAtomicTargetCount:aa.length,delta:aa.length-ba.length,oldGoalWasTarget:ba.includes(old),newChildTargetIds:children.filter(id=>aa.includes(id)),allOtherTargetIDsAndPrerequisiteOnlyIDsExact:true,actualNativeErrors:0})
}
assert.equal(scopeRows.length,31);assert.equal(scopeRows.filter(r=>r.delta===1).length,23);assert.equal(scopeRows.filter(r=>r.delta===0).length,8)
assert.deepEqual(validateCanonicalLandscape(nAfter).filter((f:any)=>f.severity==='error'),[])
const graphs=[]
for(const field of ['contains','requires']){const visiting=new Set<string>(),done=new Set<string>();const visit=(id:string)=>{assert.ok(!visiting.has(id),field+' cycle');if(done.has(id))return;visiting.add(id);for(const next of ab.get(id)[field]??[]){assert.ok(ab.has(next));visit(next)}visiting.delete(id);done.add(id)};for(const id of ab.keys())visit(id);graphs.push({field,checkedNodes:done.size,cycles:0,missingReferences:0})}
write(resolve(own,'checks/native31-scopes-476-DAG.actual.json'),{scopeRows,graphs,nativeCompileErrors:0,allOtherCurrent473WholeGoalsExact:true,actualBeforePages:391,actualAfterPages:392,scopePlusOne:23,scopeUnchanged:8,activeWrites:0,humanApproval:false})

const oldPages=new Map<string,any>(bm.pages.map((p:any)=>[p.goalId,p])),newPages=new Map<string,any>(am.pages.map((p:any)=>[p.goalId,p]))
const equal=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
// Remove positional coordinates alone to expose actual semantic page context differences.
const semanticPage=(p:any)=>{
 const q=structuredClone(p);delete q.pageNumber;delete q.navigationOrder;delete q.treeOrder;delete q.pageFingerprint
 for(const key of ['requires','reverseRequires'])for(const r of q[key]??[])delete r.pageNumber
 return q
}
const changes=[]
for(const [id,p]of oldPages){if(id===old)continue;const q=newPages.get(id);assert.ok(q);const semanticExact=equal(semanticPage(p),semanticPage(q));changes.push({goalId:id,beforePageNumber:p.pageNumber,afterPageNumber:q.pageNumber,beforeFingerprint:p.pageFingerprint,afterFingerprint:q.pageFingerprint,pageFingerprintExact:p.pageFingerprint===q.pageFingerprint,semanticPageContentExact:semanticExact,pagePositionOnly:!equal(p,q)&&semanticExact,goalFingerprintExact:p.goalFingerprint===q.goalFingerprint,before:!semanticExact?p:undefined,after:!semanticExact?q:undefined})}
assert.equal(changes.length,390)
const actualContextIds=changes.filter(r=>!r.semanticPageContentExact).map(r=>r.goalId).sort()
assert.deepEqual(actualContextIds,['249f4c5d-fd23-57c7-ac62-773d62c33b49','4b7fdc2c-9dbe-5439-8d84-295abc240eec'].sort())
const central=read(resolve(root,snapshots['curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-he9-seventeen-reviewed-active-integration-root-v1/active-after-he17-central.actual.json']))
const strict=central.subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds as string[];assert.equal(strict.length,191)
assert.ok(!strict.includes(old));assert.ok(strict.every(id=>newPages.has(id)))
write(resolve(own,'checks/full392-actual-page-position-vs-substantive-context-impact.technical.json'),{role:'Actual native content/page binding differences only; no science reapproval or strict completion inferred',beforePages:391,afterPages:392,retainedPageGoalIds:390,removedAtomicPage:old,newWholeChildPages:children.map(id=>newPages.get(id)),unchangedPageFingerprints:changes.filter(r=>r.pageFingerprintExact).length,positionOnlyPageBindingChanges:changes.filter(r=>r.pagePositionOnly).length,substantiveRelationContextGoalIds:actualContextIds,prior191StrictIDsStillPresent:strict.length,priorStrictContextChanges:changes.filter(r=>strict.includes(r.goalId)&&!r.semanticPageContentExact).map(r=>r.goalId),priorStrictPositionOnlyBindingChanges:changes.filter(r=>strict.includes(r.goalId)&&r.pagePositionOnly).map(r=>r.goalId),priorStrictUnchangedPageFingerprints:changes.filter(r=>strict.includes(r.goalId)&&r.pageFingerprintExact).map(r=>r.goalId),commonPages:changes,all390WholeGoalFingerprintsExact:changes.every(r=>r.goalFingerprintExact),newRasterMissing:true,trueContextAndPositionBindingReviewsStillPending:true,legacyGate:'pending root read-only semantic investigation',activeWrites:0,strictGainClaimed:0,humanApproval:false})

// Retained four whole positive science cases: actual new compiler kinds, no invented raster.
const author=resolve(own,'../biologie-he9-contraception-parenthood-scope-preserving-split-author-20261008-v1')
const positiveBytes=readFileSync(resolve(author,'P2.author-native.review.jsonl'),'utf8'),positive=positiveBytes.trim().split('\n').map(s=>JSON.parse(s))
const ajv=new Ajv2020({allErrors:true,strict:false});addFormats(ajv);const validator=ajv.compile(read(resolve(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')))
assert.equal(positive.length,2)
for(const record of positive){assert.ok(children.includes(record.goalId));assert.ok(validator(record),ajv.errorsText(validator.errors));assert.deepEqual(validatePositiveGoalEvidenceRecordSemantics(record,ab.get(record.goalId),{},'curricularAtomic'),[]);assert.equal(record.status,'needs_human_review');assert.equal(record.reviewAuthority,'ai_candidate');assert.equal(record.evidenceLevel,'E1');assert.equal(record.maximumClaimScope,'G1')}
write(resolve(own,'candidate/P2.whole-science-exact.pre-raster.review.jsonl'),positiveBytes)
const pc=read(resolve(author,'P2.open-author-proposals.config.json'));pc.landscapePath=rp(afterPath);pc.semanticKindLedgerPath=rp(nativeKindsPath);pc.reviewPath=rp(resolve(own,'candidate/P2.whole-science-exact.pre-raster.review.jsonl'));pc.scope.label='Current genuine two-child science contracts; actual final images and native D/P/V still pending'
write(resolve(own,'candidate/P2.current-pre-raster.inactive.config.json'),pc)
write(resolve(own,'checks/P2.current-reviewed-kind-real-native-closed-schema.actual.json'),{closedSchema:'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',actualNativeSemantics:'validatePositiveGoalEvidenceRecordSemantics',wholeProfiles:2,wholeDEENCasePairs:4,closedSchemaErrors:0,nativeSemanticErrors:0,exactOriginalRecordBodiesRetained:true,scienceOnlyGenuinePairedSeals:scienceRefs,status:'needs_human_review',reviewAuthority:'ai_candidate',evidenceLevel:'E1',maximumClaimScope:'G1',actualFinalRasterAbsent:true,noD2V2FinalApproval:true,activeWrites:0,humanApproval:false,strictGainClaimed:0})
console.log(JSON.stringify({actualNativeBefore391:bm.pages.length,actualNativeAfter392:am.pages.length,genuinePairedScientificClassAdopted:true,current473WholeGoalsUnchanged:true,actual31Scopes:[23,8],nativeDAG476:0,P2ClosedSchemaAndSemantics:0,actualSubstantiveContextIDs:actualContextIds,positionOnly:changes.filter(r=>r.pagePositionOnly).length,actualChildrenRasterMissing:true,activeWrites:0,newStrictClosures:0}))
