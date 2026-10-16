// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
const T='tmp/chemie-m7-resumed-20261016',O=`${T}/eight-empty-compiled-source-independent-b-v1/hh-v2`,A1=`${T}/eight-empty-compiled-source-author-candidate-v1`,A2=`${T}/eight-empty-compiled-source-author-candidate-v2`
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),sha=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const first=`${O}/FIRST.exact-HH-v2-additive-independent-b.science.json`;assert.equal(sha(first),'sha256:80c5a60f55a4c042e4c110a64cf32c860e5a5874914e85620434553c49a4fc77')
const sp=`${A2}/OUTPUTS.additive-HH-source-and-two-chapters-source8-v2.AUTHOR.selector.json`;assert.equal(sha(sp),'sha256:18778759d01c406e6a99a54e7efd48b764ebfce1b528b8f2e0d685c23db0f385')
const s=read(sp),c2=read(s.combinedGuardedCAS.path),c1=read(`${A1}/CAS.guarded-thirty-whole-files.source8.AUTHOR.inactive.json`),old=new Map<string,any>(c1.fileOperations.map((x:any)=>[x.logicalPath,x]))
assert.equal(sha(s.combinedGuardedCAS.path),'sha256:520bfa1a79ae97bd3e2c8a4b9ba30ff4a098fe9916940d9fd4509d2924a7d098')
const K=resolve(`${T}/chemie-combined639-two-GK-priors-final-review-capsule-v1`),l=read(c2.baselineCanonical.path),by=new Map<string,any>(l.goals.map((g:any)=>[g.id,g]))
const {collectCompositionProjectionRoleGoalIds:roles,compileCompositionView}=await import(`${K}/app/src/utils/authoring/compositionViewAuthoring.ts`)
const id='de-hh-chemie-sekii-bildungsplan-2022-3-1-072-b84cc8ad',gid='f9e6d689-6e59-59a4-9f21-8c2d44413244',nominal='Entsorgung und Recycling von Batterien und Akkumulatoren',locator='3.1, S. 31: '+nominal
let retained=0;const changed=[],views=[]
for(const op of c2.fileOperations){
 for(const side of ['before','after'])assert.equal(sha(op[side].path),op[side].sha256)
 const prev=old.get(op.logicalPath)
 if(prev&&prev.after.sha256===op.after.sha256){retained++;continue}
 const b=read(prev?prev.after.path:op.before.path),a=read(op.after.path)
 if(op.logicalPath.includes('/input/HH/')){
  assert.ok(!prev);const e=structuredClone(b),g=e.sourceGoals.find((g:any)=>g.id===id),passage=e.passages.find((p:any)=>p.id===g.passageId)
  g.sourceText=nominal;g.sourceSpan.label=locator;g.metadata.extractionMethod='literal-primary-clause-with-explicit-derived-BNE-title-and-description'
  g.metadata.source8NominalClauseBoundary={sourceTextAndLocatorRole:'Literal nominal original HH31 item, without an added assessment verb',titleAndDescriptionRole:'Derived BNE-supported teaching operationalization; bewerten is not claimed as a literal verb in this nominal source item',sourceCourseAndAllOtherCompetenciesUnchanged:true,independentReviewPending:true}
  assert.equal(passage.rawText.split(nominal+' bewerten').length-1,1);passage.rawText=passage.rawText.replace(nominal+' bewerten',nominal);assert.deepEqual(a,e)
  changed.push({logicalPath:op.logicalPath,onlyExactSelectedNominalCellAndOnePassageDelta:true,otherWholeCellsAndMetadataExact:true})
 }else if(op.logicalPath.includes('/mapping/DE-HH/')){
  const e=structuredClone(b),ds=e.decisions.filter((d:any)=>d.sourceGoalId===id);assert.equal(ds.length,1);ds[0].sourceSpan=locator;assert.deepEqual(a,e)
  changed.push({logicalPath:op.logicalPath,onlySelectedDecisionLocatorChanged:true,allWholeMappingArraysAndOtherDecisionsExact:true})
 }else if(op.logicalPath.includes('/composition-views/chemie/de-hh-')){
  const strip=(x:any):any=>Array.isArray(x)?x.filter(n=>n?.goalId!==gid&&!(n?.kind==='structure'&&n.id?.endsWith('-elektrochemische-spannungsquellen'))).map(strip):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([k,v])=>[k,strip(v)])):x
  assert.deepEqual(strip(a),strip(b))
  const hits:any[]=[]
  const walk=(x:any,labels:string[]=[])=>{if(Array.isArray(x))for(const n of x)walk(n,labels);else if(x&&typeof x==='object'){const next=x.label?[...labels,x.label]:labels;if(x.goalId===gid)hits.push({entry:x,labels:next});for(const v of Object.values(x))walk(v,next)}};walk(a)
  assert.equal(hits.length,1);assert.equal(hits[0].labels.at(-1),'Elektrochemische Spannungsquellen');assert.equal(hits[0].entry.projectionRole,'target')
  const br=roles(b.rootNodes,by),ar=roles(a.rootNodes,by);assert.deepEqual([...br.targetGoalIds].sort(),[...ar.targetGoalIds].sort());assert.deepEqual([...br.prerequisiteOnlyGoalIds].sort(),[...ar.prerequisiteOnlyGoalIds].sort())
  assert.deepEqual(compileCompositionView(a,l).findings.filter((f:any)=>f.severity==='error'),[])
  views.push({logicalPath:op.logicalPath,correctedWholeEntry:hits[0],allOtherViewNodesAndFieldsExact:true,allTargetAndSupportSetsExact:true,stockCompilerErrors:0})
 }else assert.fail(op.logicalPath)
}
assert.equal(retained,26);assert.equal(changed.length,3);assert.equal(views.length,2)
const cells1=read(`${A1}/CELLS.nine-exact-whole-source-and-selected-mapping-before-after.AUTHOR.json`).cells,cells2=read(s.nineWholeCellPairs.path).cells
assert.deepEqual(cells1.filter((c:any)=>c.sourceCase!=='HH'),cells2.filter((c:any)=>c.sourceCase!=='HH'))
assert.equal(sha(c2.baselineCanonical.path),'sha256:62f13c6ae943186ddcb60ae4af1b075c6bd6ad3c48ac766d21cc583cac6c1746')
const result={role:'Own actual finite read-only HHv2 mechanical proof after new informedFIRST; originalv1 immutable',scienceFIRST:{path:first,sha256:sha(first)},selector:{path:sp,sha256:sha(sp)},combinedCAS:{path:s.combinedGuardedCAS.path,sha256:sha(s.combinedGuardedCAS.path)},retainedExactV1AfterFiles:retained,onlyChangedSelectedSourceAndMapFiles:changed,onlyChangedTwoHHChapterViews:views,allOtherEightWholeSourceCellPairsExact:true,canonical62fUnchanged:true,newOrdinaryGoals:0,newPlacementTargets:0,newGlobalOrDPOrMRun:false,scientificHHDeltaDecision:'KEEP',originalV1DecisionStill:'REVISE',wholeSourceUnionApproved:false,HumanApproval:false,HumanTrial:false,M7Claim:false,authorWrites:false,normalWrites:false}
writeFileSync(`${O}/CHECK.actual-HH-v2-only-source-locators-and-two-views.independent-b.json`,JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({retainedExactV1AfterFiles:26,selectedHHSourceFiles:1,mapLocators:2,chapterPaths:2,stockViewErrors:0,decision:'KEEP'}))
