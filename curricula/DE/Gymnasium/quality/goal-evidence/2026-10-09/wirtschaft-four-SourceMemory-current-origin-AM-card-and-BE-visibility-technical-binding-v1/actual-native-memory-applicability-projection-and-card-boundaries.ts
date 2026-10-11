import {readFileSync, writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
import {resolve} from 'node:path'
import assert from 'node:assert/strict'
import {buildApplicabilityCompilation} from './applicabilityCompiler'
import {discoverActiveMemoryCardReviewConfigs} from './memoryCardReviewConfigDiscovery'
import {normalizeCanonicalLandscape} from '../src/utils/authoring/canonicalAuthoring'
import {normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds} from '../src/utils/authoring/compositionViewAuthoring'
import {collectRenderedAtomicGoalIdsFromCompositionView} from './quality-production-readonly-export'

const R='/home/enpasos/projects/skillpilot'
const O=R+'/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-SourceMemory-current-origin-AM-card-and-BE-visibility-technical-binding-v1'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex')
const index=read(O+'/108-explicit-BE-course-variant-memory-only-placement-successors.portable-index.json')
const raw=read(O+'/whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json')
const config=read(O+'/memory-full-current-origin-only.native-author.successor-v2.config.json')
const records=readFileSync(R+'/'+config.reviewPath,'utf8').trim().split('\n').map(x=>JSON.parse(x))
const ordinary=new Set(records.map((r:any)=>r.goalId))
const sourceRecords=readFileSync(O+'/memory-source25-only.review.jsonl','utf8').trim().split('\n').map(x=>JSON.parse(x))
const sourceRequired=sourceRecords.filter((x:any)=>x.status==='memory_required')
const newMem=raw.goals.filter((g:any)=>g.extendedData?.authorCandidate?.deckDraftBinding)
const memoryIds=new Set(newMem.map((g:any)=>g.id))
const discovery=discoverActiveMemoryCardReviewConfigs()
assert.equal(discovery.find(x=>x.reviewId==='canonical-economics-full')?.configPath,config.reviewPath.replace('/memory-full336.review.jsonl','/memory-full-current-origin-only.native-author.successor-v2.config.json'))
const comp=buildApplicabilityCompilation()
const report=comp.reports.find(x=>x.landscapeId===raw.landscapeId)!
assert(report)
const applicability=new Map(report.goals.map(x=>[x.goalId,x]))
const beforeOriginConfigFourEmpty=newMem.slice(0,4).map((g:any)=>({goalId:g.id,currentRawApplicability:g.applicability,actualCompiledApplicability:applicability.get(g.id)?.compiledApplicability,evidence:applicability.get(g.id)?.evidence.filter(x=>x.kind==='memory-review-origin')}))
const compiled=structuredClone(raw)
for(const g of compiled.goals) g.applicability=applicability.get(g.id)?.compiledApplicability??{}
const by=new Map(compiled.goals.map((g:any)=>[g.id,g]))
const normalized=normalizeCanonicalLandscape(compiled)
const normalizedBy=new Map(normalized.goals.map(g=>[g.id,g]))
const variants=[]
let originChecks=0
for(const v of index.variants) {
 const before=normalizeCompositionView(read(R+'/'+v.before.path))
 const after=normalizeCompositionView(read(R+'/'+v.after.path))
 const cb=compileCompositionView(before,normalized),ca=compileCompositionView(after,normalized)
 const rb=collectCompositionProjectionRoleGoalIds(before.rootNodes,normalizedBy),ra=collectCompositionProjectionRoleGoalIds(after.rootNodes,normalizedBy)
 const oldOrd=[...rb.targetGoalIds].filter(i=>ordinary.has(i)).sort(),newOrd=[...ra.targetGoalIds].filter(i=>ordinary.has(i)).sort()
 assert.deepEqual(newOrd,oldOrd)
 assert.deepEqual([...ra.prerequisiteOnlyGoalIds].sort(),[...rb.prerequisiteOnlyGoalIds].sort())
 const visible=collectRenderedAtomicGoalIdsFromCompositionView(compiled,R+'/'+v.after.path,[v.courseProfile,'DE-BE'])
 const targetMem=[...memoryIds].filter(i=>ra.targetGoalIds.has(i)).sort()
 const visibleMem=[...memoryIds].filter(i=>visible.has(i)).sort()
 assert.deepEqual(visibleMem,targetMem)
 const required=sourceRequired.filter((r:any)=>visible.has(r.goalId))
 const missing=required.filter((r:any)=>!r.memoryGoalIds.some((id:string)=>visible.has(id)))
 const cards=newMem.filter((g:any)=>visible.has(g.id)).flatMap((g:any)=>{
  const p=R+'/'+g.extendedData.authorCandidate.deckDraftBinding.path;const d=read(p)
  return d.cards.map((c:any)=>({deckId:d.deckId,cardId:c.id,originGoalIds:c.originGoalIds,tags:c.tags,allOriginsActualCourseTargets:c.originGoalIds.every((id:string)=>visible.has(id)),originalDEOnly:!c.frontEn&&!c.backEn}))
 })
 assert.equal(cards.filter((c:any)=>!c.allOriginsActualCourseTargets).length,0)
 if(v.courseProfile==='GK') assert.equal(cards.filter((c:any)=>c.tags.includes('LK')&&!c.tags.includes('GK')).length,0)
 const oldMissing=records.filter((r:any)=>r.status==='memory_required'&&ordinary.has(r.goalId)&&visible.has(r.goalId)&&!r.memoryGoalIds.some((i:string)=>visible.has(i)))
 variants.push({variantId:v.variantId,profile:v.courseProfile,before:v.before,after:v.after,compilerBeforeErrors:cb.findings.filter(f=>f.severity==='error'),compilerAfterErrors:ca.findings.filter(f=>f.severity==='error'),ordinaryTargetCount:newOrd.length,ordinaryTargetsExact:true,prerequisiteOnlyRolesExact:true,newMemoryTargets:targetMem,newMemoryVisible:visibleMem,sourceRequiredOriginChecks:required.length,sourceMissingMemory:missing.map((r:any)=>r.goalId),newMemoryCardCount:cards.length,newMemoryCards:cards,newMemoryDirectRequires:newMem.filter((g:any)=>visible.has(g.id)).map((g:any)=>({goalId:g.id,requires:g.requires})),wholeExistingMemoryDebt:oldMissing.map((r:any)=>({goalId:r.goalId,memoryGoalIds:r.memoryGoalIds,projectionRole:'target',actualRenderedAfterJurisdictionAndCourseFilter:true}))})
 originChecks+=required.length
}
const national=[]
for(const profile of ['GK','LK']) {
 const p='curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-'+profile.toLowerCase()+'.view.json'
 for(const jurisdiction of [null,'DE-BE','DE-BB','DE-HE']) {
  const filters=jurisdiction?[profile,jurisdiction]:[profile]
  const visible=collectRenderedAtomicGoalIdsFromCompositionView(compiled,resolve(p),filters)
  const sourceVisible=sourceRecords.filter((r:any)=>visible.has(r.goalId)).map((r:any)=>r.goalId)
  const required=records.filter((r:any)=>r.status==='memory_required'&&visible.has(r.goalId))
  const missing=required.filter((r:any)=>!r.memoryGoalIds.some((i:string)=>visible.has(i)))
  national.push({profile,jurisdiction,filters,viewPath:p,visibleOrdinaryCount:[...visible].filter(i=>ordinary.has(i)).length,newSourceOrdinaryVisible:sourceVisible,newMemoryVisible:[...memoryIds].filter(i=>visible.has(i)),allRequiredOriginChecks:required.length,missingMemory:missing.map((r:any)=>({goalId:r.goalId,memoryGoalIds:r.memoryGoalIds})),boundary:'Current frozen national views unchanged. Conditional check cannot prove Source25 operational discovery when those targets are absent.'})
 }
}
const output={at:new Date().toISOString(),wholeCAN485Sha256:hash(O+'/whole-CAN485-only-one-new-BB2-memory-node-and-one-source-navigation-child.inert-author-candidate.json'),memoryConfigPath:discovery.find(x=>x.reviewId==='canonical-economics-full')?.configPath,sourceCompilerEconomicsSummary:report.summary,sourceCompilerOpenFindings:report.findings.filter(x=>x.severity==='error'),fiveCurrentMemoryApplicability:newMem.map((g:any)=>({goalId:g.id,compiledApplicability:applicability.get(g.id)?.compiledApplicability,originEvidence:applicability.get(g.id)?.evidence.filter(x=>x.kind==='memory-review-origin')})),ordinary336NotChanged:true,variants,sourceRequiredActualRenderedOriginChecks:originChecks,compilerErrorsIn108Views:variants.reduce((n,v)=>n+v.compilerAfterErrors.length,0),newMemoryMissingIn108Views:variants.reduce((n,v)=>n+v.sourceMissingMemory.length,0),national,wholeBEExistingMemoryVisibilityApproved:false,wholeSource125OrElectiveCourseApproval:false,newNodeOriginDeckPlacementsIndependentMetaReview:'pending Root',humanApproval:false,newStrictClosures:0}
writeFileSync(O+'/actual-native-five-memory-origin-applicability-108-projections-card-only-boundaries-and-national-scope.result.json',JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({fiveMemoryApplicability:output.fiveCurrentMemoryApplicability.map(x=>({goalId:x.goalId,applicability:x.compiledApplicability,originEvidence:x.originEvidence?.length})),views:variants.length,compilerErrors:output.compilerErrorsIn108Views,actualRequiredChecks:originChecks,missingNew:output.newMemoryMissingIn108Views,national:national.map(x=>({profile:x.profile,jurisdiction:x.jurisdiction,sourceVisible:x.newSourceOrdinaryVisible.length,requiredChecks:x.allRequiredOriginChecks,missing:x.missingMemory.length})),oldBEVisibilityDebt:variants.reduce((n,v)=>n+v.wholeExistingMemoryDebt.length,0)}))
assert.equal(output.compilerErrorsIn108Views,0)
assert.equal(output.newMemoryMissingIn108Views,0)
