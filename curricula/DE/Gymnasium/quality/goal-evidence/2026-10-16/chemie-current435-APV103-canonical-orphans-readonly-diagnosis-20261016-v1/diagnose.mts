import { readFileSync, writeFileSync, readdirSync, realpathSync, statSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { createHash } from 'node:crypto'
const repo=resolve('.'),h=resolve('tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
const capsule=resolve('tmp/chemie-m7-resumed-20261016/route-scope-stock-capsule')
const output=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-APV103-canonical-orphans-readonly-diagnosis-20261016-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex')
const jhash=(v:any)=>'sha256:'+createHash('sha256').update(JSON.stringify(v)).digest('hex')
const pin=(p:string)=>({path:p.startsWith(repo+'/')?p.slice(repo.length+1):p,sha256:hash(p),bytes:statSync(p).size,realPath:realpathSync(p)})
const normal='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
const canonical=read(h+'/'+normal),by=new Map(canonical.goals.map((g:any)=>[g.id,g])) as Map<string,any>
const originalPin=pin(h+'/'+normal),rPin=pin(normal)
const kinds=read(h+'/curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
const kind=new Map(kinds.decisions.map((x:any)=>[x.goalId,x.semanticKind])) as Map<string,string>
const {buildApplicabilityCompilation}=await import(capsule+'/app/scripts/applicabilityCompiler.ts')
const started=new Date().toISOString(),start=performance.now(),all=buildApplicabilityCompilation()
const report=all.reports.find((x:any)=>x.landscapeId===canonical.landscapeId)
if(!report)throw Error('Missing current chemistry report')
const elapsedSeconds=(performance.now()-start)/1000
const app=new Map(report.goals.map((x:any)=>[x.goalId,x.compiledApplicability])) as Map<string,any>
const apv=report.findings.filter((f:any)=>f.code==='APV-103')
const unique=[...new Set(apv.map((f:any)=>f.goalId))] as string[]
const parents=new Map<string,string[]>()
for(const g of canonical.goals)for(const child of g.contains??[])parents.set(child,[...(parents.get(child)??[]),g.id])
const counts:Record<string,number>={},uniqueCounts:Record<string,number>={}
for(const f of apv)counts[kind.get(f.goalId)??'UNKNOWN']=(counts[kind.get(f.goalId)??'UNKNOWN']??0)+1
for(const id of unique)uniqueCounts[kind.get(id)??'UNKNOWN']=(uniqueCounts[kind.get(id)??'UNKNOWN']??0)+1
const root=canonical.goals.find((g:any)=>g.tags?.includes('root'))
const supp='6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338'
const memory=unique.filter(id=>kind.get(id)==='memory'),historical=unique.filter(id=>kind.get(id)==='curricularArea'),ordinary=unique.filter(id=>kind.get(id)==='curricularAtomic')
if(unique.some(id=>(parents.get(id)??[]).length))throw Error('Non-orphan in errors; revise plan')
const graph=(goals:any[])=>new Map(goals.map(g=>[g.id,g])) as Map<string,any>
const after=structuredClone(canonical)
after.goals.find((g:any)=>g.id===root.id).contains.push(...memory,...historical)
after.goals.find((g:any)=>g.id===supp).contains.push(...ordinary)
const aby=graph(after.goals)
const apvAlgorithm=(gby:Map<string,any>,a:Map<string,any>)=>{
 const failures:any[]=[]
 const jurisdictions=[...new Set([...a.values()].flatMap(x=>x.jurisdiction??[]))] as string[]
 for(const j of jurisdictions){
  const visible=new Set([...gby.keys()].filter(id=>a.get(id)?.jurisdiction?.includes(j))),seen=new Set<string>(),stack=visible.has(root.id)?[root.id]:[]
  while(stack.length){const id=stack.pop()!;if(seen.has(id))continue;seen.add(id);for(const c of gby.get(id)?.contains??[])if(visible.has(c)&&!seen.has(c))stack.push(c)}
  for(const id of visible)if(!seen.has(id))failures.push({goalId:id,jurisdiction:j})
 }
 return failures.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
}
const stockPairs=apv.map((f:any)=>({goalId:f.goalId,jurisdiction:f.value})).sort((a:any,b:any)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))
const replay=apvAlgorithm(by,app)
if(JSON.stringify(stockPairs)!==JSON.stringify(replay))throw Error('Pure reachability replay differs from actual stock')
// Hypothetical contains edges can widen only parent child-unions. Preserve source-evidence
// atomic applicability, then compute the stock child-union fixed point in memory.
const nextApp=new Map([...app.entries()].map(([id,a])=>[id,structuredClone(a)]))
let changed=true
while(changed){changed=false;for(const g of after.goals){if(!g.contains?.length||g.extendedData?.applicabilityProjection==='excluded')continue;const old=nextApp.get(g.id)?.jurisdiction??[];const next=[...new Set([...old,...g.contains.flatMap((id:string)=>nextApp.get(id)?.jurisdiction??[])])].sort();if(JSON.stringify([...old].sort())!==JSON.stringify(next)){nextApp.set(g.id,{...(nextApp.get(g.id)??{}),jurisdiction:next});changed=true}}}
const hypothetical=apvAlgorithm(aby,nextApp)
const {compileCompositionView,collectCompositionProjectionRoleGoalIds,normalizeCompositionView}=await import(repo+'/app/src/utils/authoring/compositionViewAuthoring.ts')
const views=[]
for(const filename of readdirSync(h+'/curricula/DE/Gymnasium/composition-views/chemie').filter(x=>x.endsWith('.json'))){
 const p=h+'/curricula/DE/Gymnasium/composition-views/chemie/'+filename,view=normalizeCompositionView(read(p)),b=compileCompositionView(view,canonical),a=compileCompositionView(view,after)
 const br=collectCompositionProjectionRoleGoalIds(view.rootNodes,by),ar=collectCompositionProjectionRoleGoalIds(view.rootNodes,aby)
 const role=(r:any)=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,[...(v as Set<string>)].sort()]))
 views.push({filename,viewId:view.viewId,inputSha256:hash(p),previewWholeOutputEqual:JSON.stringify(b)===JSON.stringify(a),previewFindingsBefore:b.findings,previewFindingsAfter:a.findings,rolesEqual:JSON.stringify(role(br))===JSON.stringify(role(ar)),roleBefore:role(br),roleAfter:role(ar)})
}
const mappingRoot=capsule+'/curricula/DE',mappingParentHits:any[]=[],mappingChemistryPins:any[]=[]
const walk=(dir:string)=>{for(const ent of readdirSync(dir,{withFileTypes:true})){const p=dir+'/'+ent.name;if(ent.name==='quality'||ent.name==='archive')continue;if(statSync(p).isDirectory()){walk(p);continue}if(!p.endsWith('.json')||!p.includes('/mapping/'))continue;let d:any;try{d=read(p)}catch{continue}if(d.targetLandscapeId!==canonical.landscapeId)continue;mappingChemistryPins.push(pin(p));for(const m of d.mappings??[])if([root.id,supp].includes(m.canonicalGoalId))mappingParentHits.push({path:p,mapping:m})}}
walk(mappingRoot)
const ordinaryWholeRetained=canonical.goals.filter((g:any)=>kind.get(g.id)==='curricularAtomic').every((g:any)=>JSON.stringify(g)===JSON.stringify(aby.get(g.id)))
const memoryWholeRetained=canonical.goals.filter((g:any)=>kind.get(g.id)==='memory').every((g:any)=>JSON.stringify(g)===JSON.stringify(aby.get(g.id)))
const decision={role:'Read-only technical diagnosis. Actual stock compiler evidence plus explicitly labelled in-memory graph/CompositionView hypothesis only. No normal/candidate authoring, independent science vote, full Layer-A PASS or M7 claim.',startedAt:started,finishedAt:new Date().toISOString(),elapsedSeconds,
 inputPins:{HCanonical:originalPin,RCanonical:rPin,stockApplicabilityModule:pin(capsule+'/app/scripts/applicabilityCompiler.ts'),RStockApplicabilityModule:pin('app/scripts/applicabilityCompiler.ts'),capsuleRegistry:pin(capsule+'/curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'),HMemoryConfig:pin(h+'/curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'),mappingChemistryPins},
 stock:{whole629:canonical.goals.length,ordinary435:canonical.goals.filter((g:any)=>kind.get(g.id)==='curricularAtomic').length,memory57:canonical.goals.filter((g:any)=>kind.get(g.id)==='memory').length,allReportSummary:all.summary,chemistrySummary:report.summary,totalAPV103:apv.length,uniqueGoals:unique.length,errorsByKind:counts,uniqueByKind:uniqueCounts,otherChemistryErrors:report.findings.filter((f:any)=>f.severity==='error'&&f.code!=='APV-103'),actualAPV103:apv},
 cause:'All APV103 goals are present as full wholegoals and have zero canonical contains parents. Actual compiler checks visible canonical-root contains reachability, not CompositionView targets. This is a true canonical placement gap; no APV003/missing-source or capsule-goal absence explains it.',
 affectedGoals:unique.map(id=>({goalId:id,title:by.get(id).title,semanticKind:kind.get(id),wholeObjectFingerprint:jhash(by.get(id)),canonicalParents:parents.get(id)??[],directRequires:by.get(id).requires??[],jurisdictions:apv.filter((f:any)=>f.goalId===id).map((f:any)=>f.value)})),
 minimumCompleteStructuralPlan:{state:'UNAUTHORED, UNREVIEWED; technical proposal only',changedExistingWholeGoalIds:[root.id,supp],rootExistingContainsCount:root.contains.length,rootAppendMemory44Ids:memory,rootAppendRetainedHistoricalContext2Ids:historical,supplementBoundaryExistingContainsCount:by.get(supp).contains.length,supplementAppendOrdinary2Ids:ordinary,newGoalIds:[],ordinaryAndMemoryWholeGoalBodiesUnchanged:true,requiresUnchanged:true,rolesUnchanged:true,whyNotExcludeHistory:'Henderson historical context already appears as a target goalEntry in HB-LK; exclusion would alter an existing learner projection. Retain its exact body and reference while restoring canonical parent. Both clusters explicitly disclaim additional atomic competence.',whyNotRootSubtreeOrBroadTopicMemoryInsertion:'44 compact memory nodes already have exact authored acquisition/support placements. Root-only canonical containment does not grant new course target roles. Attaching below existing imported topic subtrees could widen target Memory and must not be done as an unexamined shortcut.',mappingEvidenceToRootOrChosenSupplementParent:mappingParentHits},
 inMemoryHypothesis:{notAnActualAfterStockCompile:true,pureStockAlgorithmReplayBeforeExact:JSON.stringify(replay)===JSON.stringify(stockPairs),replayAPV103Before:replay.length,hypotheticalAPV103After:hypothetical.length,hypotheticalRemaining:hypothetical,parentChildUnionApplicabilityDeltas:[...nextApp.keys()].filter(id=>JSON.stringify(nextApp.get(id))!==JSON.stringify(app.get(id))).map(id=>({goalId:id,before:app.get(id),after:nextApp.get(id)})),all39CompositionPreviewOutputsExact:views.every(v=>v.previewWholeOutputEqual),all39ProjectionRoleSetsExact:views.every(v=>v.rolesEqual),ordinaryWholeRetained,memoryWholeRetained,views},
 requiredBeforeIntegration:['Author only the two bounded canonical contains deltas after science-respecting placement confirmation; keep both old retained-context wholeobjects exact.','Run unchanged actual stock applicability compiler on whole candidate; require all Chemie APV103 and other errors zero, preserve actual source/memory scopes and counts.','Run all39 actual course projections plus card acquisition/support visibility; unchanged whole targets/roles must be proven, not presumed.','Generate current book model and compare all435 ordinary page/context fingerprints. Own canonical scientific goal fields and all requires are unchanged; expected description-content review impact zero, but actual ancestor/navigation/page effects must be checked before technical rebinding.','Update only changed cluster semantic-source fingerprints with actual placement authority; no new D/P/A/M/V completion counts.','Keep protected mathematics, physics and biology floors and separate human gates.'],
 preservation:{HCanonicalAfter:pin(h+'/'+normal),RCanonicalAfter:pin(normal),HCanonicalBytesUnchanged:hash(h+'/'+normal)===originalPin.sha256,RCanonicalBytesUnchanged:hash(normal)===rPin.sha256,ordinaryCount435Unchanged:ordinaryWholeRetained,memoryCount57Unchanged:memoryWholeRetained,noNormalWrites:true,noGitActions:true,HumanApproval:false,HumanTrial:false,newScientificClosures:0,restoredBindings:0}}
writeFileSync(output+'/DIAGNOSIS.actual-stock-and-readonly-hypothesis.json.tmp',JSON.stringify(decision,null,2)+'\n');renameSync(output+'/DIAGNOSIS.actual-stock-and-readonly-hypothesis.json.tmp',output+'/DIAGNOSIS.actual-stock-and-readonly-hypothesis.json')
console.log(JSON.stringify({APV103:apv.length,unique:unique.length,kinds:counts,otherErrors:decision.stock.otherChemistryErrors.length,hypotheticalAfter:hypothetical.length,all39PreviewExact:views.every(v=>v.previewWholeOutputEqual),all39RolesExact:views.every(v=>v.rolesEqual),mappingParentHits:mappingParentHits.length,appDeltas:decision.inMemoryHypothesis.parentChildUnionApplicabilityDeltas,HUnchanged:decision.preservation.HCanonicalBytesUnchanged,elapsedSeconds}))
