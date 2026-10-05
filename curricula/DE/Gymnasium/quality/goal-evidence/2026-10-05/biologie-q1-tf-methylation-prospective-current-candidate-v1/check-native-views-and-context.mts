// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const root=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-prospective-current-candidate-v1'
const meta=JSON.parse(readFileSync(resolve(root,own,'prospective-paths.json'),'utf8')),iso=meta.isolationRoot
const read=(p:string)=>JSON.parse(readFileSync(resolve(iso,p),'utf8'))
const {parseGoalBookRuntimeModel,filterGoalBookPages}=await import(pathToFileURL(resolve(root,'app/src/utils/goalBookRuntime.ts')).href)
const {resolveGoalBookPersonalizationScope,compileGoalBookPersonalizedProjection}=await import(pathToFileURL(resolve(root,'app/src/utils/goalBookPersonalizedProjection.ts')).href)
const beforeRaw=read(own+'/baseline-full.book-model.json'),afterRaw=read(own+'/prospective-full.book-model.json'),before=parseGoalBookRuntimeModel(beforeRaw),after=parseGoalBookRuntimeModel(afterRaw)
const report=read(own+'/baseline-central.report.json'),strict=report.subjects.find((s:any)=>s.subject==='biologie').strictCompleteGoalIds
const ids=meta.goalIds
const scopes=[]
for(const source of after.source.compositionViewSources){
 const scope=source.scope,baseFilter={jurisdiction:scope.jurisdiction,stage:scope.stage,durationModel:scope.durationModel??null,courseProfile:scope.courseProfile??null}
 const filters=resolveGoalBookPersonalizationScope(after,baseFilter).status==='partial'&&baseFilter.durationModel===null
  ? ['G8','G9'].map(durationModel=>({...baseFilter,durationModel})).filter(filter=>resolveGoalBookPersonalizationScope(after,filter).status==='complete')
  : [baseFilter]
 if(!filters.length)throw new Error('No resolved native scope '+JSON.stringify(scope))
 for(const filter of filters){
 const resolved=resolveGoalBookPersonalizationScope(after,filter)
 if(resolved.status!=='complete')throw new Error('Unresolved native source scope '+JSON.stringify({scope,resolved}))
 const compiled=await compileGoalBookPersonalizedProjection(read(source.path),after,resolved.scope)
 if(!compiled.projection||!compiled.suppliedProjection||compiled.findings.some((f:any)=>f.severity==='error'))throw new Error('Native personalized projection failed '+JSON.stringify({scope,compiled}))
 const oldRows=filterGoalBookPages({model:before,query:'',chapterId:null,applicability:filter}),newRows=filterGoalBookPages({model:after,query:'',chapterId:null,applicability:filter})
 const oldIds=new Set(oldRows.map((p:any)=>p.goalId)),newIds=new Set(newRows.map((p:any)=>p.goalId))
 const added=[...newIds].filter(id=>!oldIds.has(id)),removed=[...oldIds].filter(id=>!newIds.has(id))
 const allowed=scope.stage==='SekII'&&['DE-HE','DE-BY'].includes(scope.jurisdiction)
 const expectedAdded=allowed?(scope.jurisdiction==='DE-BY'?ids:[ids[1]]):[]
 if(removed.length||JSON.stringify(added)!==JSON.stringify(expectedAdded))throw new Error('Unexpected source visibility change '+JSON.stringify({scope,added,removed}))
 const tfVisible=newIds.has(ids[0]),methVisible=newIds.has(ids[1])
 if(methVisible!==allowed)throw new Error('New methylation atom leaked into unsupported state/stage')
 const lkHistone=newIds.has('8f6933b1-6e02-5512-acf2-a90a7fb9cb75'),priorHistone=oldIds.has('8f6933b1-6e02-5512-acf2-a90a7fb9cb75')
 if(lkHistone!==priorHistone)throw new Error('Existing histone visibility changed')
 const oldFocus=oldRows.slice(0,3).map((p:any)=>p.goalId),focused=filterGoalBookPages({model:after,query:'',chapterId:null,applicability:filter,goalIds:oldFocus}).map((p:any)=>p.goalId)
 if(JSON.stringify(focused)!==JSON.stringify(oldFocus))throw new Error('Old explicit focus order changed')
 scopes.push({scope,filter,oldAtomicCount:oldRows.length,newAtomicCount:newRows.length,added,removed,tfVisible,methVisible,existingHistoneVisibilityPreserved:lkHistone===priorHistone,nativePersonalizedViewCompiled:true,oldFocusIds:oldFocus,oldFocusIdsAndOrderPreserved:true})
 }
}
const stripLayout=(v:any):any=>Array.isArray(v)?v.map(stripLayout):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).filter(([k])=>!['pageNumber','navigationOrder','treeOrder','pageFingerprint','goalFingerprint'].includes(k)).map(([k,v])=>[k,stripLayout(v)])):v
const pageRows=beforeRaw.pages.map((p:any)=>{
 const n=afterRaw.pages.find((q:any)=>q.goalId===p.goalId),fields=Object.keys(p).filter(k=>JSON.stringify(p[k])!==JSON.stringify(n[k]))
 return{goalId:p.goalId,title:p.title,beforePage:p.pageNumber,afterPage:n.pageNumber,beforeGoalFingerprint:p.goalFingerprint,afterGoalFingerprint:n.goalFingerprint,beforePageFingerprint:p.pageFingerprint,afterPageFingerprint:n.pageFingerprint,changedFields:fields,goalFingerprintChanged:p.goalFingerprint!==n.goalFingerprint,pageFingerprintChanged:p.pageFingerprint!==n.pageFingerprint,semanticPagePayloadChanged:JSON.stringify(stripLayout(p))!==JSON.stringify(stripLayout(n)),previousStrict:strict.includes(p.goalId)}
})
const closed=pageRows.filter((r:any)=>r.previousStrict),semantic=closed.filter((r:any)=>r.semanticPagePayloadChanged),changed=closed.filter((r:any)=>r.pageFingerprintChanged),pagination=closed.filter((r:any)=>r.beforePage!==r.afterPage)
if(closed.length!==38)throw new Error('Did not compare the current 38 strict pages')
const graph=read(meta.canonicalPath),goals=new Map(graph.goals.map((g:any)=>[g.id,g])),missing=[],cycles=[]
for(const kind of ['contains','requires']){
 const done=new Set(),active=new Set();function visit(id:string,path:string[]){if(active.has(id)){cycles.push({kind,path:[...path,id]});return}if(done.has(id))return;active.add(id);const g:any=goals.get(id);for(const child of g?.[kind]??[]){if(!goals.has(child))missing.push({kind,goalId:id,missing:child});else visit(child,[...path,id])}active.delete(id);done.add(id)}
 for(const id of goals.keys())visit(id as string,[])
}
if(missing.length||cycles.length)throw new Error('Graph DAG invalid')
const tf:any=goals.get(ids[0]),meth:any=goals.get(ids[1]),exam:any=goals.get('3ac1cbb1-a366-5ae5-85c0-76b08270869d')
if(!ids.every((id:string)=>exam.requires.includes(id)&&exam.examData.coveredGoalIds.includes(id)))throw new Error('Assessment lost a preserved mechanism')
const prereq=new Set([...tf.requires,...meth.requires]),dependents=graph.goals.filter((g:any)=>ids.some((id:string)=>g.requires.includes(id))).map((g:any)=>({goalId:g.id,title:g.title,requires:g.requires.filter((id:string)=>ids.includes(id)),coveredGoalIds:g.examData?.coveredGoalIds?.filter((id:string)=>ids.includes(id))??[]}))
const contexts={goals:[tf,meth],parents:graph.goals.filter((g:any)=>ids.some((id:string)=>g.contains.includes(id))),prerequisites:graph.goals.filter((g:any)=>prereq.has(g.id)),dependents,sourceViews:scopes,closedPageComparison:closed,allExistingPageComparison:pageRows,newPage:afterRaw.pages.find((p:any)=>p.goalId===ids[1])}
writeFileSync(resolve(root,own,'actual-native-context-and-all-page-comparison.receipt.json'),JSON.stringify({status:'inactive_author_candidate_native_inspection',beforeBookDigest:beforeRaw.digest,afterBookDigest:afterRaw.digest,oldGoalPages:363,newGoalPages:364,graphMissingEdges:missing,graphCycles:cycles,sourceViewCount:scopes.length,contexts,summary:{oldStrictPageCount:38,strictGoalFingerprintChanges:closed.filter((r:any)=>r.goalFingerprintChanged).map((r:any)=>r.goalId),strictPageFingerprintChanges:changed.map((r:any)=>r.goalId),strictSemanticContextChanges:semantic.map((r:any)=>r.goalId),strictPaginationChanges:pagination.map((r:any)=>r.goalId),allExistingPageFingerprintChanges:pageRows.filter((r:any)=>r.pageFingerprintChanged).length,allExistingSemanticPayloadChanges:pageRows.filter((r:any)=>r.semanticPagePayloadChanged).length},currentContextAcceptance:'Any changed current strict page/context needs targeted actual revalidation before operative adoption; unchanged review bytes are preserved.',humanApproval:false,activeWrites:0},null,2)+'\n')
console.log(JSON.stringify({views:scopes.length,oldStrictCompared:closed.length,strictChangedPages:changed.length,strictSemanticContextChanges:semantic.map((r:any)=>r.goalId),strictPaginationChanges:pagination.length,existingChangedPages:pageRows.filter((r:any)=>r.pageFingerprintChanged).length,newGoalPages:364,dagValid:true,activeWrites:0}))
