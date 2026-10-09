// SPDX-License-Identifier: Apache-2.0
// Targeted ordinary source/role compiler and exact historical preservation checks.
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,cpSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {tmpdir} from 'node:os'
import {buildGoalBookSourceAtlasInputs,checkGoalBookSourceAtlasInputs} from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import {normalizeCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import {normalizeCompositionView,compileCompositionView,collectCompositionProjectionRoleGoalIds} from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'
const R=resolve('.'),D=dirname(fileURLToPath(import.meta.url)),P=relative(R,D)
const A=relative(R,resolve(D,'../chemie-q3-three-BW-context-bound-practical-companions-author-v1'))
const S=relative(R,resolve(D,'../chemie-q3-three-BW-SOURCE002-partial-concentration-author-successor-v2'))
const read=(path:string)=>JSON.parse(readFileSync(resolve(R,path),'utf8'))
const bind=(path:string)=>{const bytes=readFileSync(resolve(R,path));return {path,sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length}}
const put=(path:string,data:any)=>{const absolute=resolve(D,path);mkdirSync(dirname(absolute),{recursive:true});writeFileSync(absolute,typeof data==='string'?data:JSON.stringify(data,null,2)+'\n',{flag:'wx'});return relative(R,absolute)}
const original=read(`${A}/inputs/whole-original-126-duty-217-edge-mapping.exact.json`)
const amended=read(`${A}/candidate/whole-BW126-220-partners.practical-successor.review.json`)
const partial=read(`${S}/candidate/whole-BW126-220-partners.concentration-partial-successor.review.json`)
assert.equal(original.mappings.length,217);assert.equal(amended.mappings.length,220)
assert.deepEqual(amended.mappings.slice(0,217),original.mappings)
assert.equal(original.decisions.length,126);assert.equal(partial.decisions.length,126)
assert.deepEqual(partial.decisions,amended.decisions)
const expectedPartial=structuredClone(amended);expectedPartial.mappings[217].matchType='partial'
assert.deepEqual(partial,expectedPartial)
const oldExtraction=read(`${A}/inputs/whole-original-source-extraction.exact.json`),newExtraction=read(`${A}/candidate/whole-BW126.source-extraction.json`)
assert.deepEqual(newExtraction,oldExtraction)
assert.equal(newExtraction.sourceGoals.length,126)
const oldCanon=read(`${A}/inputs/canonical.exact.json`),canon=read(`${A}/candidate/full484-381.inactive-canonical.json`),kinds=read(`${A}/candidate/full484-381.semantic-kinds.inactive-input.json`)
const oldById=new Map(oldCanon.goals.map((g:any)=>[g.id,g]))
const added=canon.goals.filter((g:any)=>!oldById.has(g.id))
const modified=canon.goals.filter((g:any)=>oldById.has(g.id)&&JSON.stringify(g)!==JSON.stringify(oldById.get(g.id)))
assert.equal(canon.goals.length,484);assert.equal(oldCanon.goals.length,480)
assert.equal(kinds.decisions.filter((r:any)=>r.semanticKind==='curricularAtomic').length,381)
assert.equal(added.length,4)
const ids=read(`${A}/candidate/three-new-whole-DEEN-practical-goals.json`).map((g:any)=>g.id)
assert.deepEqual(new Set(added.filter((g:any)=>!g.contains?.length).map((g:any)=>g.id)),new Set(ids))
for(const id of ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65','5a24dae0-6d33-5227-8d8b-e8f74c2ccc4c','8be14f15-2258-58e6-ae4e-38953f5d0570'])assert.deepEqual(canon.goals.find((g:any)=>g.id===id),oldById.get(id))
const modelBefore=read(`${A}/native/full381.after.actual-model.json`)
const modelAfter=read(`${S}/portable-v2/native/full381-source002-unchanged.actual-model.json`)
assert.equal(modelAfter.pages.length,381);assert.deepEqual(modelAfter,modelBefore)
const sourceBefore=read(`${S}/portable-v2/native/BW189-before.normal-model.actual.json`),sourceAfter=read(`${S}/portable-v2/native/BW189-after.normal-model.actual.json`)
assert.equal(sourceAfter.pages.length,189);assert.deepEqual(sourceAfter,sourceBefore)

const cap=mkdtempSync(resolve(tmpdir(),'skillpilot-chemie-BW-independent-B-source-'))
const cfg=read(`${S}/portable-v2/source-atlas/after.ordinary-scoped.config.json`)
const diagnosticSourcePaths=[]
const copy=(path:string)=>{const destination=resolve(cap,path);mkdirSync(dirname(destination),{recursive:true});cpSync(resolve(R,path),destination);diagnosticSourcePaths.push(bind(path))}
for(const path of [cfg.landscapePath,cfg.semanticKindLedgerPath,cfg.durationModelPolicyPath,...cfg.mappingPaths])copy(path)
for(const path of cfg.mappingPaths){const extractionPath=read(path).sourceExtractionPath;copy(extractionPath);const extraction=read(extractionPath);if(!cfg.sourceDocumentSnapshots.some((s:any)=>s.path===extraction.sourceDocument.path))copy(extraction.sourceDocument.path)}
const primary=`${A}/primary/official-BW-chemistry-20220325.actual-original.pdf`
assert.equal(bind(primary).sha256,'3ae66c6c2db6371aa24153484f78832f1dfc2097deac8b8dfbffeb32bed28c62')
const configPath=put('source-atlas/after.ordinary-scoped.independent-b.config.json',cfg);copy(configPath)
const built=buildGoalBookSourceAtlasInputs(cfg,cap),outputTransports=[]
for(const [path,bytes]of Object.entries(built.outputs)){mkdirSync(dirname(resolve(cap,path)),{recursive:true});writeFileSync(resolve(cap,path),bytes);const archive=put(`source-atlas/exact-output-archive/${path}`,bytes);outputTransports.push({ordinaryCapsuleOutputPath:path,portableExactArchive:bind(archive)})}
const checked=checkGoalBookSourceAtlasInputs(configPath,cap)
assert.equal(checked.receipt.counts.publishedCurricularAtomicGoals,189)
put('source-atlas/ordinary-current-BW189.actual-receipt.json',checked.receipt)
const normalCanon=normalizeCanonicalLandscape(canon),normalById=new Map(normalCanon.goals.map(g=>[g.id,g]))
const compiled=[]
const inspectView=(path:string,viewInput:any,label:string)=>{
 const view=normalizeCompositionView(viewInput)
 const findings=compileCompositionView(view,normalCanon).findings
 assert.deepEqual(findings.filter((f:any)=>f.severity==='error'),[])
 const roles=collectCompositionProjectionRoleGoalIds(view.rootNodes,normalById)
 const actual=ids.filter((id:string)=>roles.targetGoalIds.has(id))
 const expected=view.scope.stage==='SekI'?[]:view.scope.courseProfile==='GK'?[ids[0]]:ids
 assert.deepEqual(actual,expected)
 compiled.push({label,operativeViewPath:path,scope:view.scope,targetGoalIds:[...roles.targetGoalIds].sort(),actualNewPracticalTargets:actual,findings})
}
for(const [path,bytes]of Object.entries(built.outputs))if(path.endsWith('.view.json')&&path.includes('/source-views/'))inspectView(path,JSON.parse(bytes), 'actual ordinary source view')
assert.equal(compiled.length,3)
for(const course of ['gk','lk']){const path=`${A}/candidate/BW-${course}.learner-view.inactive-successor.json`;inspectView(path,read(path),'actual authored learner view')}
assert.equal(compiled.length,5)
put('checks/own-scoped-source-roles-and-exact-preservation.actual.json',{
 schemaVersion:1,role:'Targeted normal source compiler and exact preservation, following own whole scientific FIRST',
 actualSourceInputs:diagnosticSourcePaths,actualTrackedPrimaryBinding:bind(primary),normalSourceConfig:bind(configPath),outputTransports,compiled,
 ordinaryToolBindings:['app/scripts/goalBookSourceAtlasInputs.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts'].map(bind),
 wholeOriginalSourceDuties:126,originalPartnerEdges:217,originalPartnerEdgesExact:true,addedPartnerEdges:3,
 wholeMappingCorrectionOnly:'/mappings/217/matchType exact → partial',wholeMappedDecisionRolesRetained:true,
 oldCanonicalNodes:480,conditionalCanonicalNodes:484,conditionalCurricularAtoms:381,addedNodeIds:added.map((g:any)=>g.id),modifiedOldGoalIds:modified.map((g:any)=>g.id),
 actualThreeOldTheoryGoalsExact:true,retainedWhole381CandidateModelsExactlyEqual:true,retainedWholeBW189CandidateModelsExactlyEqual:true,
 nativeModelComparisonIsTechnicalOnly:'Whole previously generated models parsed and compared; no actual pages viewed or new D/native approval in this review.',
 firstFrameTypoDisclosure:'The immutable FIRST-associated read frame contains one prose label historical127; actual sourceGoals/decisions and verified counts are126. No source duty is removed or added by that prose typo.',
 newGKPracticalTargets:1,newLKPracticalTargets:3,newSekIPracticalTargets:0,
 sourceAtlasCompilerDoesNotValidateScientificMatchStrength:true,wholeBWProgrammeApproved:false,
 activeWrites:0,strictGain:0,newDOrVApprovals:0,humanApproval:false,actualLearnerExperiments:0,
 externalCapsulePathDiagnosticOnly:cap,allOperativeOutputsPortablyArchived:true})
console.log(JSON.stringify({ordinaryBWSourceGoals:189,viewsChecked:5,retainedSourceDuties:126,retainedEdges:217,newEdges:3,source002Only:'partial',currentWhole381Exact:true,strictGain:0}))
