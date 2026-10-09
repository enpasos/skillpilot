// SPDX-License-Identifier: Apache-2.0
// Read-only planning diagnostic. Unapproved source roles never become review metadata.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, sourceAtlasDescendants, sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel.ts'
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts'
import { compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts'

const root=resolve('.'), out=dirname(fileURLToPath(import.meta.url))
const n='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-current-twenty-six-native-preparation-author-v1'
const inputs=new Map<string,any>()
const bind=(p:string)=>{const bytes=readFileSync(resolve(root,p));const b={path:relative(root,resolve(root,p)),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};inputs.set(b.path,b);return b}
const read=(p:string)=>{bind(p);return JSON.parse(readFileSync(resolve(root,p),'utf8'))}
const write=(file:string,value:any)=>{const p=resolve(out,file);assert.ok(!existsSync(p));writeFileSync(p,JSON.stringify(value,null,2)+'\n');return bind(p)}
const sourceConfigPath=n+'/twenty-two-bounded-source-routes-author-v2/whole395-with-reviewedSL-and-twenty-two-pending-routes.ordinary-inputs.author-candidate.json'
const cfg=read(sourceConfigPath),canonical=read(cfg.landscapePath),ledger=read(cfg.semanticKindLedgerPath)
const goals=new Map<string,any>(canonical.goals.map((g:any)=>[g.id,g]));for(const d of ledger.decisions)assert.equal(d.sourceFingerprint,fingerprintSemanticKindSourceGoal(goals.get(d.goalId)))
const atoms=new Set<string>(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic').map((d:any)=>d.goalId))
assert.equal(atoms.size,395);assert.equal(cfg.expectedCurricularAtomicGoalCount,395);assert.equal(cfg.expectedUnresolvedScopeDecisionCount,496)
const land=normalizeCanonicalLandscape(canonical)
const fallbacks=cfg.fallbackViewPaths.map((p:string)=>{const view=read(p);assert.deepEqual(compileCompositionView(view,land).findings.filter((f:any)=>f.severity==='error'),[]);return {view,target:collectCompositionProjectionRoleGoalIds(view.rootNodes,new Map(land.goals.map((g:any)=>[g.id,g]))).targetGoalIds}})
const baseline=new Set<string>(),potentialAdded=new Set<string>(),unresolved:any[]=[],rows:any[]=[],bindingMetadata:any[]=[],pending:any[]=[]
for(const mappingPath of cfg.mappingPaths){
 const m=read(mappingPath),ex=read(m.sourceExtractionPath),isPending=mappingPath.includes('/twenty-two-bounded-source-routes-author-v2/');assert.equal(m.targetLandscapeId,canonical.landscapeId)
 const sg=new Map<string,any>(ex.sourceGoals.map((g:any)=>[g.id,g])),passages=new Map<string,any>(ex.passages.map((g:any)=>[g.id,g]));assert.equal(m.decisions.length,sg.size)
 bindingMetadata.push({mapping:bind(mappingPath),sourceExtraction:bind(m.sourceExtractionPath),sourceLandscapeId:m.sourceLandscapeId,targetLandscapeId:m.targetLandscapeId,sourceDocument:ex.sourceDocument??null,sourceDocuments:ex.sourceDocuments??null,mappingCount:m.mappings.length,decisionCount:m.decisions.length,pendingDecisionMetadataCount:m.decisions.filter((d:any)=>!d.reviewer||!d.reviewedAt||!d.rationale).length,partialEdges:m.mappings.filter((e:any)=>e.matchType==='partial').length,scientificReviewClaim:false})
 for(const d of m.decisions){
  if(d.decision!=='mapped')continue
  const s=sg.get(d.sourceGoalId),p=passages.get(s.passageId)??{},docs=ex.sourceDocuments??[ex.sourceDocument]
  const keys=[...new Set([s.sourceDocumentKey,...(s.tags??[]).filter((t:string)=>t.startsWith('sourceDocument:')).map((t:string)=>t.slice(15)),p.sourceDocumentKey].filter(Boolean))];assert.ok(keys.length<=1)
  const matched=keys.length?docs.filter((x:any)=>x.key===keys[0]):docs;assert.equal(matched.length,1);const doc=matched[0]
  const stage=sourceAtlasFacet([s,p,doc,ex],'stage'),course=sourceAtlasFacet([s,p,doc,ex],'courseProfile')
  const scoped=course!==null&&stage?.length===1&&(stage[0]==='SekI'||course.length>0)
  if(!scoped)(isPending?pending:unresolved).push({mappingPath,sourceGoalId:s.id,stage,courseProfile:course})
  for(const t0 of d.canonicalGoalIds){const t=t0.replace(canonical.landscapeId+':','');for(const id of sourceAtlasDescendants(t,goals,atoms,canonical.landscapeId)){
   const scopes=scoped&&stage?(stage[0]==='SekI'?['']:course!).map((c:string)=>`${ex.jurisdiction}/${stage[0]}/${c}`):stage?.[0]==='SekII'&&course?.length===0?fallbacks.filter((f:any)=>f.view.scope.jurisdiction===ex.jurisdiction&&f.target.has(id)).map((f:any)=>`${ex.jurisdiction}/SekII/${f.view.scope.courseProfile}`):[]
   if(scopes.length)(isPending?potentialAdded:baseline).add(id)
   rows.push({goalId:id,mappingPath,sourceExtractionPath:m.sourceExtractionPath,sourceGoalId:s.id,sourceSpan:s.sourceSpan,mappedTargetGoalId:t,coverage:id===t?'direct':'inherited',stage,courseProfile:course,ordinaryScopes:scopes,wholeSourceGoal:s,wholePassage:p,wholeSourceDocument:doc,wholeDecision:d,unapprovedCandidate:isPending})
  }}
 }
}
assert.equal(baseline.size,354);assert.equal(unresolved.length,496);assert.equal(potentialAdded.size,21)
const potentialUnion=new Set([...baseline,...potentialAdded]);assert.equal(potentialUnion.size,375)
const rest=[...atoms].filter(id=>!potentialUnion.has(id)).sort();assert.equal(rest.length,20)
let actualCompilerError:string|null=null,returnedOutputs=0
try{const r=buildGoalBookSourceAtlasInputs(cfg,root);returnedOutputs=Object.keys(r.outputs).length}catch(e){actualCompilerError=e instanceof Error?e.message:String(e)}
assert.ok(actualCompilerError?.startsWith('Missing reviewed mapping decision metadata: by-chem-b008-scope-'));assert.equal(returnedOutputs,0)
assert.ok(!existsSync(resolve(root,cfg.outputDirectory)))
const reviewView=read(n+'/candidate/all-current504-candidate-atoms.review-only.view.json')
assert.deepEqual(compileCompositionView(reviewView,land).findings.filter((f:any)=>f.severity==='error'),[])
const reviewTargets=collectCompositionProjectionRoleGoalIds(reviewView.rootNodes,new Map(land.goals.map((g:any)=>[g.id,g]))).targetGoalIds
const atomicViewUnion=[...reviewTargets].filter(id=>atoms.has(id)).sort();assert.deepEqual(atomicViewUnion,[...atoms].sort())
const proof=read(n+'/source-view-remediation-author-v3/actual-three-secondary-one-EN-one-MV-profile.normal-contract-proof.json')
const opaque=proof.whole16Views.flatMap((r:any)=>r.actualRemainingCPV009.map((f:any)=>({viewId:r.viewId,viewBinding:r.candidateView,scope:r.scope,...f})));assert.equal(opaque.length,17)
const currentV3=read(n+'/source-view-remediation-author-v3/canonical504-one-faithful-redox-EN-existing-fields-kept.author-candidate.json')
const futureGoals=new Map<string,any>(currentV3.goals.map((g:any)=>[g.id,g]));for(const id of rest)assert.deepEqual(futureGoals.get(id),goals.get(id))
const classified={...currentV3,goals:currentV3.goals.map((g:any)=>({...g,semanticKind:ledger.decisions.find((d:any)=>d.goalId===g.id).semanticKind}))}
for(const row of proof.whole16Views){const v=read(row.candidateView.path);const errors=compileCompositionView(v,classified).findings.filter((f:any)=>f.code==='CPV-009');assert.deepEqual(errors,row.actualRemainingCPV009)}
const protectedPath=n+'/native/whole378-to-inactive395.substantive-page-context-deltas.actual.json',ctx=read(protectedPath)
assert.equal(ctx.actualEightUnresolvedProtectedContextRows.length,8)
write('actual-current395-source-scope-and-rest20.read-only-diagnosis.json',{schemaVersion:1,role:'Actual unchanged normal helpers for neutral planning only; pending mappings are hypothetical additions, never approvals',whole395GoalIds:[...atoms].sort(),actualReviewOnlyAtomicTargetUnion:atomicViewUnion,baselineSourceScopeGoalIds:[...baseline].sort(),hypotheticalUnapproved21ScopedCandidateGoalIds:[...potentialAdded].sort(),hypotheticalScopeUnion375GoalIds:[...potentialUnion].sort(),remaining20GoalIds:rest,baselineSourceScopeCount:354,unapprovedPotentialSourceScopeCount:375,gateExpectedCurricularAtomicGoalCount:395,expectedUnresolvedScopeDecisionCount:496,actualBaselineUnresolvedDecisionCount:unresolved.length,actualCandidateC11Unresolved:pending,ordinaryCompiler:{actualError:actualCompilerError,returnedOutputs,noGeneratedAtlasFilesWritten:true},actualBindingMetadata:bindingMetadata,actualRest20WholeGoalsAndAllRouteContexts:rest.map(id=>({goalId:id,wholeGoal:goals.get(id),routeContexts:rows.filter(r=>r.goalId===id),immediateWholeParents:canonical.goals.filter((g:any)=>(g.contains??[]).includes(id))})),actual17OpaqueViewErrors:opaque,protected8ContextPointers:ctx.actualEightUnresolvedProtectedContextRows.map((r:any,i:number)=>({goalId:r.goalId,wholePageDeltaPointer:{path:protectedPath,jsonPointer:'/actualEightUnresolvedProtectedContextRows/'+i},substantiveChangedFields:r.substantiveChangedFields})),inputBindings:[...inputs.values()],sourceQAClaim:false,wholeCourseApproval:false,nativeApproval:false,activeWrites:[],netStrictGain:0,humanApproval:false,humanTrial:false})
console.log(JSON.stringify({whole395:atoms.size,currentSourceScoped:baseline.size,hypotheticalUnapprovedUnion:potentialUnion.size,rest20:rest,opaqueViewErrors:opaque.length,protected8:ctx.actualEightUnresolvedProtectedContextRows.length,normalCompilerActualError:actualCompilerError,sourceQAClaim:false,activeWrites:[],strictGain:0}))
