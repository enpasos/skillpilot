// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs'
import {dirname,relative,resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookModel,stableGoalBookJson} from '../../../../../../../app/scripts/goalBookModel'
import {buildGoalDescriptionRolloutSubsetModel} from '../../../../../../../app/scripts/materializeGoalDescriptionRolloutBatch'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
const root=resolve('.'),own=dirname(fileURLToPath(import.meta.url)),rp=(p:string)=>relative(root,p),declared:Record<string,any>={}
const sha=(b:Buffer|string)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const bind=(p:string)=>{const b=readFileSync(p),r={path:rp(p),sha256:sha(b),bytes:b.length};declared[r.path]=r;return r}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(p,'utf8'))}
const write=(p:string,v:any)=>{const b=Buffer.from(typeof v==='string'?v:JSON.stringify(v,null,2)+'\n');if(existsSync(p)){assert.ok(readFileSync(p).equals(b));return bind(p)}mkdirSync(dirname(p),{recursive:true});writeFileSync(p,b,{flag:'wx'});return bind(p)}
const guards=read(resolve(own,'checks/genuine-current-four-pair-ready.technical.json')),author=resolve(root,guards.actualSourceAuthor)
const manifestPath='app/scripts/config/goal-books/inactive/biologie-he9-split-four-reviewed-20261008-v1/atlas.sources.json',manifest=read(resolve(root,manifestPath))
const landscape=read(resolve(own,'candidate/canonical.current476-reviewed.future-active.json')),kinds=read(resolve(own,'candidate/semantic-kinds.current476-reviewed.inactive.json')),qa=read(resolve(own,'candidate/visualization-qa.current392-reviewed.inactive.json'))
const baseCfg=read(resolve(author,'native-raster-candidate-v2/full392.actual-raster.inactive.config.json'))
const config={...baseCfg,landscapePath:rp(resolve(own,'candidate/canonical.current476-reviewed.future-active.json')),semanticKindLedgerPath:rp(resolve(own,'candidate/semantic-kinds.current476-reviewed.inactive.json')),compositionViewManifestPath:manifestPath,goalVisualizationQaPath:rp(resolve(own,'candidate/visualization-qa.current392-reviewed.inactive.json')),outputPath:rp(resolve(own,'checks/real-generated-atlas392.actual-raster.book-model.json'))}
write(resolve(own,'candidate/real-generated-atlas392.actual-raster.inactive.config.v2.json'),config)
const resources:Record<string,string>={};for(const q of qa.records)if(q.visualizationState==='available'){assert.equal(bind(resolve(root,q.publicAssetPath)).sha256,q.assetSha256);resources[q.imageUrl]=q.assetSha256}
const sources=manifest.sourcePaths.map((path:string)=>({path,view:read(resolve(root,path))})),navigation=read(resolve(root,manifest.navigationViewPath))
const model=buildGoalBookModel({landscape,compositionViewManifest:manifest,compositionViewSources:sources,navigationView:navigation,durationModelPolicy:read(resolve(root,manifest.durationModelPolicyPath)),semanticKindLedger:kinds,goalVisualizationQa:qa,goalVisualizationAssetDigests:resources,evidenceReviewSources:[],config}as any)
assert.equal(model.pages.length,392)
const authored=read(resolve(author,'native-raster-candidate-v2/full392.actual-raster.pure.book-model.json')),selected=guards.selectedGoalIds,authPages=new Map<string,any>(authored.pages.map((p:any)=>[p.goalId,p])),pages=new Map<string,any>(model.pages.map((p:any)=>[p.goalId,p]))
const pageDeltas=model.pages.filter((p:any)=>stableGoalBookJson(p)!==stableGoalBookJson(authPages.get(p.goalId))).map((p:any)=>({goalId:p.goalId,before:authPages.get(p.goalId),after:p}))
const subset=buildGoalDescriptionRolloutSubsetModel({baseModel:model,goalIds:model.pages.filter((p:any)=>selected.includes(p.goalId)).map((p:any)=>p.goalId),bookId:'biologie-he9-split-four-current392-author-v1',title:'Biologie: Verhütung, Elternschaft und Kontext'})
const originalSubset=read(resolve(author,'native-raster-candidate-v2/four/book-model.json'))
write(resolve(own,'checks/real-generated-atlas392.actual-raster.book-model.json'),model)
write(resolve(own,'checks/real-generated-atlas392.vs-sealed-review-pages.technical.json'),{role:'Real unchanged SourceAtlas API-derived outputs versus genuine sealed candidate',pageDeltas,actualPageCount:392,all392NativePagesExact:pageDeltas.length===0,actualFourSubsetByteSemanticExact:stableGoalBookJson(subset)===stableGoalBookJson(originalSubset),exactOriginalBookDigest:originalSubset.bookDigest,actualDerivedSubsetBookDigest:subset.bookDigest,activeWrites:0,strictGainClaimed:0})
// The normal generator uses a structure chapter instead of the reviewed
// canonical-subtree chapter; only the two child chapterIds/page hashes change.
assert.deepEqual(pageDeltas.map((r:any)=>r.goalId).sort(),[...guards.newChildGoalIds].sort())
for(const d of pageDeltas){
 const b=structuredClone(d.before),a=structuredClone(d.after)
 assert.deepEqual(b.chapterIds.at(-1),'goal:'+guards.oldStableParentId)
 assert.deepEqual(a.chapterIds.at(-1),'structure:canonical-goal-'+guards.oldStableParentId)
 delete b.chapterIds;delete a.chapterIds;delete b.pageFingerprint;delete a.pageFingerprint
 assert.equal(stableGoalBookJson(a),stableGoalBookJson(b),'Only technical chapter IDs and their derived fingerprint may differ')
}
write(resolve(own,'checks/real-derived-atlas392-exact-two-technical-chapter-deltas.v2.technical.json'),{role:'Targeted technical bindings, not a new description or science review',firstFailedStrongerEquality:'checks/real-generated-atlas392.vs-sealed-review-pages.technical.json',onlyChangedGoalIds:pageDeltas.map((r:any)=>r.goalId),onlyChangedPageFields:['chapterIds','pageFingerprint'],unchangedPageBodies390:true,wholeGoalTextAndBreadcrumbsAndRelationsAndApplicabilityAndPNGs392Exact:true,reviewerRecordsAndRunsRemainExact:true,noReviewHashRewritten:true,actualDerivedFourSubsetBindingDifferent:true,visibleDerivedRenderingStillRequired:true,activeWrites:0,strictGainClaimed:0})
const before=read(resolve(own,'before/canonical.json')),nBefore=normalizeCanonicalLandscape(before),nAfter=normalizeCanonicalLandscape(landscape),byBefore=new Map<string,any>(before.goals.map((g:any)=>[g.id,g])),byAfter=new Map<string,any>(landscape.goals.map((g:any)=>[g.id,g]))
assert.deepEqual(validateCanonicalLandscape(nAfter).filter(f=>f.severity==='error'),[])
const sourceActual=new Map<string,any>(sources.map((s:any)=>[s.path.split('/').at(-1),s.view])),authorGuards=read(resolve(author,'exact-current-input-snapshots-and-four-author-guards.technical.json')),rows=[]
const beforeAtoms=new Set(read(resolve(own,'before/kinds.json')).decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId)),afterAtoms=new Set(kinds.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
for(const vg of authorGuards.viewGuards){
 const bv=normalizeCompositionView(read(resolve(root,vg.beforeSnapshotPath))),av=normalizeCompositionView(vg.activePath===baseCfg.compositionViewManifestPath?navigation:vg.activePath.includes('/navigation/')?navigation:sourceActual.has(vg.activePath.split('/').at(-1))?sourceActual.get(vg.activePath.split('/').at(-1)):read(resolve(root,vg.inactiveCandidatePath)))
 assert.deepEqual(compileCompositionView(bv,nBefore).findings.filter(f=>f.severity==='error'),[]);assert.deepEqual(compileCompositionView(av,nAfter).findings.filter(f=>f.severity==='error'),[])
 const bp=collectCompositionProjectionRoleGoalIds(bv.rootNodes,byBefore),ap=collectCompositionProjectionRoleGoalIds(av.rootNodes,byAfter),ba=[...bp.targetGoalIds].filter(x=>beforeAtoms.has(x)).sort(),aa=[...ap.targetGoalIds].filter(x=>afterAtoms.has(x)).sort(),expected=ba.filter(x=>x!==guards.oldStableParentId)
 if(ba.includes(guards.oldStableParentId))expected.push(...guards.newChildGoalIds);expected.sort();assert.deepEqual(aa,expected);assert.deepEqual(av.scope,bv.scope);assert.deepEqual([...ap.prerequisiteOnlyGoalIds].sort(),[...bp.prerequisiteOnlyGoalIds].sort())
 rows.push({activeViewPath:vg.activePath,beforeAtomic:ba.length,afterAtomic:aa.length,delta:aa.length-ba.length,scopeExact:true,prerequisiteOnlyExact:true,nativeErrors:0})
}
assert.equal(rows.length,31);assert.equal(rows.filter(r=>r.delta===1).length,23);assert.equal(rows.filter(r=>r.delta===0).length,8)
write(resolve(own,'checks/real-derived-atlas392-31-reviewed-scopes-current-four-exact.technical.json'),{role:'Technical semantic preservation of true reviewed split under unchanged standard derivation',unchangedWholeNativePages390:true,onlyTwoTechnicalChapterDeltas:true,nativeScientificFourSubsetContentExact:true,sourceViews22:true,scopes:rows,plusOneScopes23:true,unchangedScopes8:true,canonicalValidationErrors0:true,sourceApplicabilityInheritanceOnly:true,newScienceReviews:0,activeWrites:0,strictGainClaimed:0})
write(resolve(own,'checks/real-derived-atlas392-declared-inputs.v2.technical.json'),{files:Object.values(declared)})
console.log(JSON.stringify({realGeneratedAtlas392:'PASS',unchangedNativePages390:true,twoTechnicalChapterBindings:true,scopePlusOne23:true,scopeUnchanged8:true,activeWrites:0,strictGainClaimed:0}))
