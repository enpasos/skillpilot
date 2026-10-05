import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync} from 'node:fs'
import {resolve,dirname} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const root=process.cwd(),base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-prospective-current-candidate-v1',out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-q1-tf-methylation-current-independent-d-a-v1',iso=resolve(root,'tmp/bio-tf-methylation-current-d-a-exact-isolated-20261005-v1')
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'))
const raw=read(base+'/prospective-full.book-model.json'),prior=read(base+'/baseline-full.book-model.json')
const {parseGoalBookRuntimeModel,filterGoalBookPages}=await import(pathToFileURL(resolve(iso,'app/src/utils/goalBookRuntime.ts')).href)
const {resolveGoalBookPersonalizationScope,compileGoalBookPersonalizedProjection}=await import(pathToFileURL(resolve(iso,'app/src/utils/goalBookPersonalizedProjection.ts')).href)
const model=parseGoalBookRuntimeModel(raw)
const ids=['946ce2e7-c30d-5670-839d-003b0619c284','0ac51522-352c-50d1-8b95-8d3992b4db15']
const scopes=[]
for(const s of raw.source.compositionViewSources){
 let p=resolve(iso,s.path)
 if(!existsSync(p)){mkdirSync(dirname(p),{recursive:true});copyFileSync(resolve(root,s.path),p)}
 const scope={jurisdiction:s.scope.jurisdiction,stage:s.scope.stage,durationModel:s.scope.durationModel??null,courseProfile:s.scope.courseProfile??null}
 const resolved0=resolveGoalBookPersonalizationScope(model,scope)
 const filters=resolved0.status==='partial'&&scope.durationModel===null?['G8','G9'].map(durationModel=>({...scope,durationModel})).filter(f=>resolveGoalBookPersonalizationScope(model,f).status==='complete'):[scope]
 for(const filter of filters){
  const resolved=resolveGoalBookPersonalizationScope(model,filter);if(resolved.status!=='complete')throw Error('unresolved scope '+JSON.stringify(filter))
  const compiled=await compileGoalBookPersonalizedProjection(JSON.parse(readFileSync(p,'utf8')),model,resolved.scope)
  const rows=filterGoalBookPages({model,query:'',chapterId:null,applicability:filter})
  const visible=rows.map((x:any)=>x.goalId)
  scopes.push({scope:filter,visibleTF:visible.includes(ids[0]),visibleMethylation:visible.includes(ids[1]),visibleHistone:visible.includes('8f6933b1-6e02-5512-acf2-a90a7fb9cb75'),compileErrors:compiled.findings.filter((f:any)=>f.severity==='error'),hasProjection:!!compiled.projection,rawViewPath:s.path})
 }
}
const active=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),future=JSON.parse(readFileSync(resolve(iso,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'),'utf8'))
const a=new Map(active.goals.map((g:any)=>[g.id,g])),n=new Map(future.goals.map((g:any)=>[g.id,g]))
const examId='3ac1cbb1-a366-5ae5-85c0-76b08270869d',capId='1cfb2f8b-d44b-57f4-aae0-c5d9f55a1c6a',oldExam:any=a.get(examId),exam:any=n.get(examId),oldCap:any=a.get(capId),cap:any=n.get(capId)
const missing:any[]=[],cycles:any[]=[]
for(const field of ['contains','requires']){const seen=new Set(),stack=new Set();function visit(id:string,path:string[]){if(stack.has(id)){cycles.push({field,path:[...path,id]});return}if(seen.has(id))return;stack.add(id);const g:any=n.get(id);for(const child of g[field]??[]){if(!n.has(child))missing.push({field,id,child});else visit(child,[...path,id])}stack.delete(id);seen.add(id)}for(const g of future.goals)visit(g.id,[])}
const pages=ids.map(id=>raw.pages.find((p:any)=>p.goalId===id))
const report={status:'independent_raw_native_context_observation',goalIds:ids,parents:future.goals.filter((g:any)=>ids.some(id=>(g.contains??[]).includes(id))).map((g:any)=>({id:g.id,title:g.title,contains:g.contains})),sourceScopes:scopes,dag:{missing,cycles},assessment:{id:examId,requires:exam.requires,coveredGoalIds:exam.examData.coveredGoalIds,declaredMax:exam.examData.scoring.maxPoints,currentRubricSum:exam.examData.scoring.steps.reduce((s:number,x:any)=>s+x.points,0),originalRubricSum:oldExam.examData.scoring.steps.reduce((s:number,x:any)=>s+x.points,0),taskContentUnchanged:exam.examData.taskContent===oldExam.examData.taskContent,solutionContentUnchanged:exam.examData.solutionContent===oldExam.examData.solutionContent,steps:exam.examData.scoring.steps},capstone:{id:capId,newPrerequisitePresent:cap.requires.includes(ids[1]),oldRequiresPreserved:oldCap.requires.every((id:string)=>cap.requires.includes(id)),examDataExactlyPreserved:JSON.stringify(cap.examData)===JSON.stringify(oldCap.examData),newGoalNotInventedAsCovered:!cap.examData.coveredGoalIds.includes(ids[1]),noNewTask:cap.examData.taskContent===oldCap.examData.taskContent},pages:pages.map((p:any)=>({goalId:p.goalId,description:p.description,applicability:p.applicability,externalPrerequisites:p.externalPrerequisites,externalReverseRequires:p.externalReverseRequires})),broadAndHistoneRowsPreserved:['99544494-1825-5fc1-8e23-56f0df808e56','8f6933b1-6e02-5512-acf2-a90a7fb9cb75','6f6ee02f-65f4-5fb4-b859-8f8c8fda0865'].map(id=>({id,unchanged:JSON.stringify(a.get(id))===JSON.stringify(n.get(id))})),humanApproval:false}
writeFileSync(resolve(root,out,'native-graph-scope-assessment-observation.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({scopeCount:scopes.length,TF:scopes.filter(s=>s.visibleTF).map(s=>s.scope),methylation:scopes.filter(s=>s.visibleMethylation).map(s=>s.scope),negativeScopes:scopes.filter(s=>!s.visibleMethylation).length,dag:report.dag,assessment:report.assessment,capstone:report.capstone,broadAndHistoneRowsPreserved:report.broadAndHistoneRowsPreserved}))
