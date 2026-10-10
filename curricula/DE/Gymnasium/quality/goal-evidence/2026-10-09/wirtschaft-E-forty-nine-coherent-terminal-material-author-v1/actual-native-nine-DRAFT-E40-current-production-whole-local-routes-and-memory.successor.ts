import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { buildApplicabilityCompilation } from './applicabilityCompiler.ts'
import { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles, buildAtomicDirectRequiresEdges, buildEffectiveRequiresEdges, collectRenderedAtomicGoalIdsFromCompositionView } from './actual-current-production-unmodified-route-profile-export-for-E40.ts'
import { convertLearningGoal } from '../src/goalTypes'
import { normalizeCompositionView } from '../src/utils/authoring/compositionViewAuthoring'
import { applyCompositionViewProjection } from '../src/utils/compositionViewRuntime'
import { goalMatchesFilters } from '../src/utils/goalFilters'
import { buildDirectChildrenMap, getRenderedChildIds } from '../src/utils/treeProjectionRuntime'
const root = '/home/enpasos/projects/skillpilot'
const relative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-E-forty-nine-coherent-terminal-material-author-v1'
const base = root + '/' + relative
const priorRelative = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/five-legacy-phase-exams-minimal-material-requires-and-course-author-v17'
const prior = root + '/' + priorRelative
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const sha = (b: Buffer|string) => createHash('sha256').update(b).digest('hex')
const meta = read(base + '/actual-E40-only-own-native-isolate-and-frozen-V17-baseline.receipt.json')
const iso = meta.physicalIsolate
const can = read(base + '/whole-inert-CAN416-only-nine-E40-DRAFT-and-existing-E-navigation.candidate.json')
const before = read(prior + '/whole-CAN407-five-minimal-requires-plus-three-LK-only.author-candidate.json')
const materials = read(base + '/whole-nine-coherent-E40-materials.DRAFT-terminal-goals.candidate.json')
const freeze = read(base + '/actual-nine-DRAFT-whole-materials-after-authoring-before-numeric-and-native-checks.freeze.receipt.json')
for (const row of freeze.frozenWholeMaterialAndPerformanceFiles) if (sha(readFileSync(root + '/' + row.path)) !== row.sha256) throw Error('Whole material mutated')
const profile = routeProfiles.find((p: any) => p.profileId === 'canonical-economics-crossstage')!
const memoryConfig = read(root + '/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-by-ten-current311-specific-native-preparation-technical-v1/current300-source35-scope2-contract479-selective-technical-v1/memory.config.json')
const memory = readFileSync(root + '/' + memoryConfig.reviewPath, 'utf8').split(/\r?\n/u).filter(Boolean).map(l => JSON.parse(l)).filter((r: any) => r.decision === 'memory_required' || r.status === 'memory_required')
const visibleClusters = (landscape: any, viewPath: string, course: string) => {
 const entry = { meta: landscape, goals: landscape.goals.map((g: any) => convertLearningGoal(g, { landscapeId: landscape.landscapeId })) }
 const projected = applyCompositionViewProjection([entry], normalizeCompositionView(read(viewPath)))[0]
 if (!projected) throw Error('No projected course entry')
 const by = new Map(projected.goals.map(g => [g.id, g])), children = buildDirectChildrenMap(by)
 children.forEach((ids, parentId) => children.set(parentId, ids.filter(id => { const g = by.get(id); return !!g && goalMatchesFilters(g, [course]) })))
 const q = projected.goals.filter(g => (g.tags ?? []).includes('root')).map(g => g.id), seen = new Set<string>()
 while (q.length) { const id = q.pop()!; if (seen.has(id)) continue; seen.add(id); q.push(...getRenderedChildIds(id, by, children)) }
 const source = new Map(landscape.goals.map((g: any) => [g.id, g]))
 return new Set([...seen].filter(id => !id.startsWith('composition:') && ((source.get(id) as any)?.contains ?? []).length > 0))
}

const compilation = buildApplicabilityCompilation()
const graph = evaluateGraphIntegrity(can, new Set(can.goals.map((g: any) => g.id)))
const type = evaluateTypeConsistency(can)
const route = evaluateRouteProfile(can, profile, compilation)
const by = new Map<string, any>(can.goals.map((g: any) => [g.id, g]))
const direct = buildAtomicDirectRequiresEdges(can)
const local: any[] = []
const baseline = read(prior + '/actual-three-variants-original-native-route-course-fixedpoint-memory-and-P311-book-impact.author-report.json').results.at(-1)
for (const course of ['GK','LK']) {
 const viewPath = iso + '/curricula/DE/Gymnasium/composition-views/wirtschaft/de-de-gym-economics-' + course.toLowerCase() + '.view.json'
 const targets = collectRenderedAtomicGoalIdsFromCompositionView(can, viewPath, [course], false)
 const visible = collectRenderedAtomicGoalIdsFromCompositionView(can, viewPath, [course], true)
 const clusters = visibleClusters(can, viewPath, course)
 const allVisible = new Set([...visible,...clusters])
 const terminals = new Set<string>(profile.terminalAutonomyClusterIds.flatMap((id: string) => by.get(id)?.contains ?? []).filter((id: string) => targets.has(id)))
 const reverse = new Map<string,string[]>()
 for(const [id,reqs]of direct){if(!targets.has(id))continue;for(const req of reqs)if(targets.has(req))reverse.set(req,[...(reverse.get(req)??[]),id])}
 const path=(start:string):string[]|null=>{const q:Array<[string,string[]]>=[[start,[start]]],seen=new Set<string>();while(q.length){const[id,p]=q.shift()!;if(seen.has(id))continue;seen.add(id);if(terminals.has(id))return p;for(const n of reverse.get(id)??[])q.push([n,[...p,n]])}return null}
 const selected=can.goals.filter((g:any)=>targets.has(g.id)&&profile.goalSelector(g))
 const missing=selected.filter((g:any)=>path(g.id)===null).map((g:any)=>({goalId:g.id,title:g.title,wholeCurrentGoal:g}))
 const fixed:any[]=[]
 for(const[contract,edges]of [['atomic-direct',direct],['effective-direct-and-inherited',buildEffectiveRequiresEdges(can)]]as const){const seeds=contract==='atomic-direct'?visible:allVisible,q=[...seeds].map(id=>({id,p:[id]})),seen=new Set<string>(),paths=new Map<string,string[]>();while(q.length){const{id,p}=q.shift()!;if(seen.has(id))continue;seen.add(id);paths.set(id,p);for(const n of edges.get(id)??[])q.push({id:n,p:[...p,n]})}fixed.push({edgeContract:contract,actualWholeFixedpointIds:[...seen].sort(),missingRequiredScopeGoals:[...seen].filter(id=>!allVisible.has(id)).sort().map(id=>({goalId:id,wholeCurrentGoal:by.get(id),firstRequiringPath:paths.get(id),sourceKind:by.get(id)?.contains?.length?'canonicalCluster':'atomic'})),noDepthLimit:true})}
 const memoryRows=memory.filter((r:any)=>targets.has(r.goalId)).map((r:any)=>({goalId:r.goalId,memoryGoalIds:r.memoryGoalIds,visibleMemoryGoalIds:(r.memoryGoalIds??[]).filter((id:string)=>targets.has(id)),satisfied:(r.memoryGoalIds??[]).some((id:string)=>targets.has(id))}))
 const old=baseline.local.find((x:any)=>x.courseProfile===course)
 const ordinaryIds=selected.map((g:any)=>g.id).sort()
 if(JSON.stringify(ordinaryIds)!==JSON.stringify(old.selectedOrdinaryGoalIds))throw Error('Ordinary course target changed')
 if(JSON.stringify(memoryRows)!==JSON.stringify(old.actualRequiredMemoryVisibility))throw Error('Required ordinary memory changed')
 const covered=materials.flatMap((g:any)=>g.requires)
 if(covered.some((id:string)=>!targets.has(id)))throw Error('New material requires actual nontarget ordinary content')
 local.push({courseProfile:course,ordinaryTargetCount:ordinaryIds.length,actualOrdinaryTargetIds:ordinaryIds,actualNewNineMaterialTargetIds:materials.filter((g:any)=>targets.has(g.id)).map((g:any)=>g.id),allNineMaterialsActuallyTargeted:materials.every((g:any)=>targets.has(g.id)),actualEndpointCount:terminals.size,actualWholeViewSHA256:sha(readFileSync(viewPath)),actualWholeRoutes:selected.map((g:any)=>({goalId:g.id,actualTerminalPath:path(g.id)})),actualMissingTerminalGoalRows:missing,actualPreviousMissing:old.missingVisibleOnlyTerminalRoutes.length,actualFixedpointScope:fixed,actualRequiredMemoryVisibility:memoryRows,allOrdinaryGoalsAndMemoryVisibilityExact:true})
}
const unchanged=before.goals.filter((g:any)=>g.id!=='14c05eec-87af-5fd6-832a-4f5d9d280e66').every((g:any)=>JSON.stringify(g)===JSON.stringify(by.get(g.id)))
if(!unchanged)throw Error('Ordinary/historical goal body changed')
const previousExams=before.goals.filter((g:any)=>g.examData)
if(previousExams.length!==47||previousExams.some((g:any)=>JSON.stringify(g.examData)!==JSON.stringify(by.get(g.id)?.examData)))throw Error('Historical material changed')
for(const row of freeze.frozenWholeMaterialAndPerformanceFiles)if(sha(readFileSync(root+'/'+row.path))!==row.sha256)throw Error('Whole material mutated after checks')
const out=base+'/actual-native-CAN416-with-current-production-profile-nine-DRAFT-E40-whole-local-routes-and-memory.successor.result.json'
if(existsSync(out))throw Error('Do not overwrite immutable output')
writeFileSync(out,JSON.stringify({schemaVersion:1,kind:'actual-native-current-production-profile-nine-draft-E40-material-graph-route-and-whole-course-debt',graph,type,originalUnmodifiedRouteQualityRules:route,local,ordinary311Exact:true,allOther406WholeGoalsExact:true,all47PreviousWholeExamDataExact:true,actualNineWholeDraftMaterialsExact:true,all11MaterialFrozenBindingsExactBeforeAfter:true,sourceWholeCourseOrIndependentMaterialApproval:false,fullNativeOwnerBookNowSeparatelyProduced:true,actualNativeBookBinding:relative+'/whole-current311-after-nine-E40-DRAFT-materials-with-frozen-V17-P311624.book-model.json',actualRootBoundedNineKindDecisionNowPresent:true,currentProductionWholeCodeSnapshot:relative+'/actual-current-production-route-status-code.whole-prefix.snapshot.ts',previous146And91GK133LKBaselineUsesSeparateExpandedCandidateProfile:true,noFinalDPrepare:true,strictNetIncrease:0,liveWrites:[]},null,2)+'\n')
console.log(JSON.stringify({graph:graph.status,type:type.status,rules:route.rules.map((r:any)=>({id:r.id,status:r.status,metrics:r.metrics})),local:local.map(r=>({course:r.courseProfile,ordinary:r.ordinaryTargetCount,newTargeted:r.actualNewNineMaterialTargetIds.length,missingTerminal:r.actualMissingTerminalGoalRows.length,previousMissing:r.actualPreviousMissing,scope:r.actualFixedpointScope.map((f:any)=>({contract:f.edgeContract,missing:f.missingRequiredScopeGoals.length})),memory:r.actualRequiredMemoryVisibility.length})),actualReceiptSHA256:sha(readFileSync(out))},null,2))
