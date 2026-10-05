import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { normalizeCanonicalLandscape, validateCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
import { compileCompositionView, normalizeCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring'
import { prepareLandscapeEntries } from '../../../../../../../app/src/hooks/useLandscapes'
import { applyCompositionViewProjection } from '../../../../../../../app/src/utils/compositionViewRuntime'
import { goalMatchesFilters } from '../../../../../../../app/src/utils/goalFilters'
import { buildGoalBookSourceAtlasInputs, readGoalBookSourceAtlasInputConfig } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs'
import { fingerprintSemanticKindSourceGoal } from '../../../../../../../app/scripts/goalBookModel'

const repo = '/home/enpasos/projects/skillpilot'
const iso = '/tmp/skillpilot-chem-b014-companions-regional-v1'
const own = `${repo}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-three-existing-companions-regional-candidate-v1`
const read = (p:string):any => JSON.parse(readFileSync(p,'utf8'))
const put = (p:string,d:unknown) => writeFileSync(p,JSON.stringify(d,null,2)+'\n')
const sha = (p:string) => createHash('sha256').update(readFileSync(p)).digest('hex')
const canon = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const voltage = '8be14f15-2258-58e6-ae4e-38953f5d0570'
const ph = 'c224281a-f8a3-58cd-8ca3-2c2e134d61ff'
const she = 'b781745a-256e-52b2-8d86-c1072845ccdd'
const before = read(`${repo}/${canon}`), after = read(`${iso}/${canon}`)
const beforeLandscape = normalizeCanonicalLandscape(before), afterLandscape = normalizeCanonicalLandscape(after)
assert.deepEqual(validateCanonicalLandscape(afterLandscape).filter(f=>f.severity==='error'),[])
assert.deepEqual(before.goals.map((g:any)=>g.id).sort(),after.goals.map((g:any)=>g.id).sort())
const lm = new Map(after.goals.map((g:any)=>[g.id,g]))
const ledgerPath = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
const ledger = read(`${repo}/${ledgerPath}`), kindBindings:any[]=[]
for(const d of ledger.decisions){
 const fp=fingerprintSemanticKindSourceGoal(lm.get(d.goalId) as any)
 if(fp!==d.sourceFingerprint){kindBindings.push({goalId:d.goalId,before:d.sourceFingerprint,after:fp,semanticKind:d.semanticKind});d.sourceFingerprint=fp}
}
// Inactive validation binder only; the existing kind classification is not new D/P/strict evidence.
put(`${iso}/${ledgerPath}`,ledger)
put(`${own}/semantic-kind-validation-binder.receipt.json`,{status:'inactive_candidate_only',rows:kindBindings,newKindDecisions:0,newDescriptionReviews:0,strictClosureAdded:0})
const config='app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
const nativeBefore=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(config,repo),repo)
const nativeAfter=buildGoalBookSourceAtlasInputs(readGoalBookSourceAtlasInputConfig(config,iso),iso)
const br=nativeBefore.receipt as any,ar=nativeAfter.receipt as any
assert.deepEqual(br.counts,ar.counts)
assert.deepEqual(br.omittedGoals,ar.omittedGoals)
const beforeMap=new Map(beforeLandscape.goals.map(g=>[g.id,g])),afterMap=new Map(afterLandscape.goals.map(g=>[g.id,g]))
const runtimeBefore=prepareLandscapeEntries([before]),runtimeAfter=prepareLandscapeEntries([after])
const filtered=(view:any,entries:any[],filters:string[])=>{
 const projected=applyCompositionViewProjection(entries,view)
 const map=new Map(projected[0].goals.map((g:any)=>[g.id,g]))
 const roles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(view).rootNodes,map as any)
 return [...roles.targetGoalIds].filter(id=>goalMatchesFilters(map.get(id) as any,filters)).sort()
}
const sourceComparisons:any[]=[]
for(const b of br.scopes){
 const a=ar.scopes.find((s:any)=>s.key===b.key);assert(a)
 const bv=JSON.parse(nativeBefore.outputs[b.path]),av=JSON.parse(nativeAfter.outputs[a.path])
 const filters=[b.jurisdiction,...b.courseProfile?[b.courseProfile]:[]]
 const fb=filtered(bv,runtimeBefore,filters),fa=filtered(av,runtimeAfter,filters)
 assert.deepEqual(a.goalIds,b.goalIds,`source target union changed ${b.key}`)
 assert.deepEqual(fa,fb,`source filtered visibility changed ${b.key}`)
 assert.deepEqual(compileCompositionView(normalizeCompositionView(av),afterLandscape).findings.filter(f=>f.severity==='error'),[])
 sourceComparisons.push({key:b.key,beforeCount:fb.length,afterCount:fa.length,targetIdsUnchanged:true,filteredVisibleIdsUnchanged:true,companionBefore:[voltage,ph,she].map(goalId=>({goalId,visible:fb.includes(goalId)})),companionAfter:[voltage,ph,she].map(goalId=>({goalId,visible:fa.includes(goalId)}))})
}
const authored:any[]=[]
const focusChecks:any[]=[]
const viewDir='curricula/DE/Gymnasium/composition-views/chemie'
const walk=(nodes:any[],path:string[]=[],rows:any[]=[]):any[]=>{
 for(const n of nodes){const p=[...path,n.label];if([voltage,ph,she].includes(n.sourceGoalId))rows.push({goalId:n.sourceGoalId,path:p});walk(n.children,p,rows)}return rows
}
for(const name of readdirSync(`${repo}/${viewDir}`).filter(n=>n.endsWith('.view.json'))){
 const path=`${viewDir}/${name}`,bv=read(`${repo}/${path}`),av=read(`${iso}/${path}`)
 const bview=normalizeCompositionView(bv),aview=normalizeCompositionView(av)
 const bc=compileCompositionView(bview,beforeLandscape),ac=compileCompositionView(aview,afterLandscape)
 assert.deepEqual(ac.findings.filter(f=>f.severity==='error'),[])
 const bRoles=collectCompositionProjectionRoleGoalIds(bview.rootNodes,beforeMap),aRoles=collectCompositionProjectionRoleGoalIds(aview.rootNodes,afterMap)
 assert.deepEqual([...aRoles.targetGoalIds].sort(),[...bRoles.targetGoalIds].sort(),`authored target set changed ${path}`)
 const filters=[aview.scope.jurisdiction,...aview.scope.courseProfile?[aview.scope.courseProfile]:[]].filter(Boolean) as string[]
 const fb=filtered(bv,runtimeBefore,filters),fa=filtered(av,runtimeAfter,filters)
 assert.deepEqual(fa,fb,`authored filtered set changed ${path}`)
 const changed=name==='de-he-gk.view.json'||name==='de-he-lk.view.json'
 if(!changed){assert.equal(sha(`${repo}/${path}`),sha(`${iso}/${path}`));assert.deepEqual(ac.compiledRootNodes,bc.compiledRootNodes)}
 const paths=walk(ac.compiledRootNodes)
 if(changed){
  for(const id of [voltage,ph]){const r=paths.filter(p=>p.goalId===id);assert.equal(r.length,1);assert(r[0].path.some((s:string)=>s.startsWith('Einführungsphase')));assert(fa.includes(id))}
  const projected=applyCompositionViewProjection(runtimeAfter,av)[0]
  const pmap=new Map(projected.goals.map(g=>[g.id,g]))
  const descendants=(id:string,seen=new Set<string>()):Set<string>=>{
   if(seen.has(id))return seen;seen.add(id);for(const c of pmap.get(id)?.contains??[])descendants(c,seen);return seen
  }
  const canonicalE='323a222e-5db8-53c5-b2dc-6f9c1d0d277c'
  const scopedE=projected.goals.find(g=>g.id.includes(`he-scoped-${canonicalE}`))!
  assert(scopedE);assert([voltage,ph].every(id=>descendants(scopedE.id).has(id)))
  assert([voltage,ph].every(id=>!descendants(canonicalE).has(id)))
  focusChecks.push({viewPath:path,actualNativeProjectedEAnchor:scopedE.id,scopedEStructureIncludesBothCompanions:true,originalCanonicalEFocusId:canonicalE,originalCanonicalEFocusStillIncludesBothCompanions:false,adoptionStatus:'HOLD_existing_focus_reference_continuity_requires_genuine_scoped_repair'})
 }
 authored.push({path,nativeCompileErrors:0,unchangedBytes:!changed,allTargetIdsUnchanged:true,allFilteredVisibleIdsUnchanged:true,allOtherCompiledPathsUnchanged:!changed,companionPaths:paths})
}
// Explicit native specificity probe: direct target wins over a broad prerequisite-only subtree,
// but actual projection keeps LK-only tags, so HE GK remains excluded.
const probe={viewId:'inactive-he-gk-she-specificity-probe',landscapeId:after.landscapeId,scope:{schoolForm:'Gymnasium',jurisdiction:'DE-HE',stage:'SekII',courseProfile:'GK'},rootNodes:[{kind:'structure',id:'probe',label:'Chemie',children:[{kind:'canonicalSubtree',goalId:'33766473-86a1-5f82-afc9-bdb8ed6a2ab6',projectionRole:'prerequisiteOnly'},{kind:'goalEntry',goalId:she,projectionRole:'target'}]}]}
const proles=collectCompositionProjectionRoleGoalIds(normalizeCompositionView(probe).rootNodes,afterMap)
assert(proles.targetGoalIds.has(she));assert(!filtered(probe,runtimeAfter,['DE-HE','GK']).includes(she))
const pentries=applyCompositionViewProjection(runtimeAfter,probe)
const projectedSHE=pentries[0].goals.find(g=>g.id===she)!
assert.deepEqual(projectedSHE.tags,before.goals.find((g:any)=>g.id===she).tags)
const proposedGK={...projectedSHE,tags:[...projectedSHE.tags!,'GK']}
const jurisdictions=projectedSHE.applicability!.jurisdiction
const regionalProbe=jurisdictions.map(jurisdiction=>({jurisdiction,currentGK:goalMatchesFilters(projectedSHE,[jurisdiction,'GK']),globalGKTagCounterexample:goalMatchesFilters(proposedGK,[jurisdiction,'GK'])}))
assert(regionalProbe.every(r=>!r.currentGK&&r.globalGKTagCounterexample))
put(`${own}/native-she-course-specificity.receipt.json`,{status:'HOLD',directTargetSpecificityResolved:true,actualHEGKFilteredVisible:false,projectedSHECourseTagsUnchanged:projectedSHE.tags,regionalProbe,unsupportedConditionalRelation:'DE-HE GK/LK versus other-jurisdiction LK',runtimeChanged:false})
// Effective prerequisite closures use the actual runtime preparation, including inherited cluster requires.
const runtimeMap=new Map(runtimeAfter[0].goals.map(g=>[g.id,g]))
const closure=(id:string,stack=new Set<string>()):Set<string>=>{
 assert(!stack.has(id),`effective prerequisite cycle ${id}`);const next=new Set(stack).add(id);const result=new Set<string>()
 const g=runtimeMap.get(id)!;assert(g)
 for(const r of g.effectiveRequires??[]){assert(runtimeMap.has(r));result.add(r);for(const v of closure(r,next))result.add(v)}return result
}
const closures=[voltage,ph].map(goalId=>({goalId,effective:runtimeMap.get(goalId)!.effectiveRequires,transitive:[...closure(goalId)].sort()}))
assert(!closures.find(r=>r.goalId===ph)!.transitive.includes('48115ff7-7aca-5d0b-a9e7-7fc6c78434ef'))
assert(!closures.find(r=>r.goalId===voltage)!.transitive.includes(she))
put(`${own}/native-regional-validation.receipt.json`,{observedAt:new Date().toISOString(),status:'PASS_native_checks_WITH_overall_adoption_HOLD',sourceAtlasCountsBefore:br.counts,sourceAtlasCountsAfter:ar.counts,allPreviouslyResolvedSourceViewComparisons:sourceComparisons,authoredViewComparisons:authored,actualNativeFocusChecks:focusChecks,closures,positiveHEGKECompanions:[voltage,ph],ordinaryAtomicDenominatorDelta:0,sourceUnionDenominatorDelta:0,activeMutation:false,runtimeChanged:false,newDApproval:false,newPApproval:false,strictClosureAdded:0,humanApproval:false,limitation:'Scoped HE structures preserve existing cluster IDs as opaque overview entries. Canonical overview IDs no longer own the presented child branches; caller focus references and the shared national book navigation need genuine consumer review before adoption.'})
console.log(JSON.stringify({status:'PASS_native_checks_WITH_overall_adoption_HOLD',nativeSourceViews:sourceComparisons.length,allAuthoredViews:authored.length,HEGKandLKEPlacementPositive:true,allOtherSourceViewFilteredSetsUnchanged:true,SHEActualGK:false,originalEFocusContinuity:false,sourceUnion:ar.counts.publishedCurricularAtomicGoals,strictClosureAdded:0}))
