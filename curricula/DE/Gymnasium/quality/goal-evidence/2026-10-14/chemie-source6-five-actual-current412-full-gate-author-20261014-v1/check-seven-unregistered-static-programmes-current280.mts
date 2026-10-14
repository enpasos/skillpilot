// Apache-2.0. Seven named static review documents only, no registry/runtime writes.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {collectAuthoritativeTargetAtomicGoalIds} from '/home/enpasos/projects/skillpilot/app/scripts/compositionViewSourceCoverage.ts'
import {compileCompositionView,normalizeCompositionView} from '/home/enpasos/projects/skillpilot/app/src/utils/authoring/compositionViewAuthoring.ts'
import {prepareLandscapeEntries} from '/home/enpasos/projects/skillpilot/app/src/hooks/useLandscapes.ts'
const R='/home/enpasos/projects/skillpilot',O=resolve(fileURLToPath(new URL('.',import.meta.url)))
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const base=read(resolve(O,'inputs/canonical533.actual280-base.immutable-hardlink.json'))
const candidate=read(resolve(O,'candidate/canonical539.prospective-current412-on-actual280.author-only.json'))
const baseBy=new Map(base.goals.map((g:any)=>[g.id,g])),by=new Map(candidate.goals.map((g:any)=>[g.id,g]))
const be=new Map(prepareLandscapeEntries([base]).flatMap(e=>e.goals).map(g=>[g.id,g]))
const ae=new Map(prepareLandscapeEntries([candidate]).flatMap(e=>e.goals).map(g=>[g.id,g]))
const ledger=read(resolve(O,'inputs/semantic533.actual407-base.immutable-hardlink.json'))
const ordinary=new Set(ledger.decisions.filter((d:any)=>d.semanticKind==='curricularAtomic'&&d.decisionStatus==='authoritative').map((d:any)=>d.goalId))
function deps(id:string,em=ae,gm=by){const seen=new Set<string>(),queue=[...(em.get(id)?.effectiveRequires??[])];while(queue.length){const n=queue.pop()!;if(seen.has(n))continue;seen.add(n);queue.push(...(em.get(n)?.effectiveRequires??[]),...((gm.get(n) as any)?.contains??[]))}return[...seen]}
const ps=read(resolve(O,'inputs/whole-seven-static-programme-candidates.exact-from-sealed-plan.json'))
const rows=ps.rows.map((r:any)=>{
 const before=read(resolve(R,r.baseWholeView.path)),after=read(resolve(R,r.afterInactiveWholeView.path))
 const bt=collectAuthoritativeTargetAtomicGoalIds(base,before),at=collectAuthoritativeTargetAtomicGoalIds(candidate,after)
 const bc=compileCompositionView(normalizeCompositionView(before),base),ac=compileCompositionView(normalizeCompositionView(after),candidate)
 const newErrors=ac.findings.filter((f:any)=>f.severity==='error'&&!bc.findings.some((b:any)=>JSON.stringify(f)===JSON.stringify(b)))
 const baselineMissing=new Set([...bt].flatMap(id=>deps(id,be,baseBy).filter(d=>ordinary.has(d)&&!bt.has(d))))
 const missing=deps(r.goalId).filter(d=>ordinary.has(d)&&!at.has(d))
 const added=[...at].filter(id=>!bt.has(id)),removed=[...bt].filter(id=>!at.has(id))
 const newDeps=[...bt].flatMap(id=>{const old=new Set(deps(id,be,baseBy));return deps(id).filter(d=>!old.has(d)).map(d=>({target:id,newDependency:d}))})
 if(newErrors.length||removed.length||newDeps.length||added.length!==1||added[0]!==r.goalId)throw new Error(JSON.stringify({r,newErrors,added,removed,newDeps}))
 return{goalId:r.goalId,viewId:after.viewId,course:r.course,jurisdiction:r.jurisdiction,sourceScopeKind:r.sourceScopeKind,
  wholeUnregisteredReviewView:r.afterInactiveWholeView,beforeTargets:bt.size,afterTargets:at.size,added,removed,newCompileErrors:newErrors,
  completeEffectivePrerequisiteClosure:deps(r.goalId),missingOrdinaryAcquisitionTargetIds:missing,
  newlyMissingBeyondBaseline:missing.filter(d=>!baselineMissing.has(d)),existingTargetsNewDependencies:newDeps,
  staticAuthorCurationOnly:true,actualHumanClassroomSelectionClaim:false,defaultViewOrRegistryMutation:false}
})
const total=rows.reduce((s:any,r:any)=>s+r.missingOrdinaryAcquisitionTargetIds.length,0)
if(total!==307||rows.some((r:any)=>r.newlyMissingBeyondBaseline.length))throw new Error('Expected preserved307 pre-existing gap occurrences')
const proof={schemaVersion:1,checkedAt:new Date().toISOString(),unchangedStockFunctions:true,explicitReviewDocuments:7,rows,
 technicalCompileNewErrors:0,priorWholeBaselineTargetsRemoved:0,newDependenciesOfExistingTargets:0,
 preexistingLayerAAcquisitionGapOccurrences:total,newGapOccurrencesBeyondBaseline:0,
 gapsNotReinterpretedAsNewScientificFindings:true,registeredRuntimeViews:0,wholeCourseOrActualSelectionApproval:false,
 effectiveNewRequiredPredecessorsForProtected280:0,newScienceVotes:0,hostAndActiveWrites:false}
writeFileSync(resolve(O,'checks/STOCK.seven-static-programmes-on-actual280-new-errors0-preexisting-gaps307.actual.json'),JSON.stringify(proof,null,2)+'\n')
console.log(JSON.stringify({staticDocuments:7,newCompileErrors:0,oldTargetsRemoved:0,newExistingTargetDependencies:0,preexistingAcquisitionGapOccurrences:total,newGapOccurrences:0,wholeCourseApproval:false}))
