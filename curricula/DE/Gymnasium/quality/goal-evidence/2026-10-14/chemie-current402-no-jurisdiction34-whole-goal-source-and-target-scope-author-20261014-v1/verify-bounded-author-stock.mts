// Bounded inactive proposal checks using unmodified stock functions; Apache-2.0.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
const repo=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const eq=(a:any,b:any)=>JSON.stringify(a)===JSON.stringify(b)
const {collectAuthoritativeTargetAtomicGoalIds}=await import(pathToFileURL(resolve(repo,'app/scripts/compositionViewSourceCoverage.ts')).href)
const {compileCompositionView,normalizeCompositionView}=await import(pathToFileURL(resolve(repo,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const {evaluateCourseLevelMappingConsistency}=await import(pathToFileURL(resolve(repo,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const before=read(`${own}/inputs/canonical.whole.before.json`),after=read(`${own}/proposals/canonical.whole.after.NI-sigma-applicability-only.json`)
const beforeById=new Map(before.goals.map((g:any)=>[g.id,g]))
const modified=after.goals.filter((g:any)=>!eq(g,beforeById.get(g.id)))
const source=read(`${own}/inputs/NI.source-extraction.whole.before.json`)
const mapcas=read(`${own}/CAS.NI-LK-sigma-source-partial-partner.two-carriers.author-proposals.actual.json`).rows
const mapsBefore=mapcas.map((c:any)=>({...read(c.beforeFrozenWholeFile.path),file:c.sourceFile.path}))
const mapsAfter=mapcas.map((c:any)=>({...read(c.afterInactiveWholeFile.path),file:c.sourceFile.path}))
const sourceMap=new Map([[mapsBefore[0].sourceExtractionPath,source]])
const courseBefore=evaluateCourseLevelMappingConsistency(before,mapsBefore,sourceMap)
const courseAfter=evaluateCourseLevelMappingConsistency(after,mapsAfter,sourceMap)
const violations:any[]=[]
const views=read(`${own}/CAS.18-current-whole-composition-views.author-proposals.actual.json`).rows.map((c:any)=>{
 const b=read(c.beforeFrozenWholeFile.path),a=read(c.afterInactiveWholeFile.path)
 const bt=new Set<string>(collectAuthoritativeTargetAtomicGoalIds(before,b)),at=new Set<string>(collectAuthoritativeTargetAtomicGoalIds(after,a))
 const removed=[...bt].filter(id=>!at.has(id)),added=[...at].filter(id=>!bt.has(id))
 const remainingConsumers=after.goals.filter((g:any)=>at.has(g.id)&&g.requires?.some((id:string)=>removed.includes(id)))
 const transitiveRemovedDependencies:any[]=[]
 for (const id of at){
  const seen=new Set<string>(),todo=[...((beforeById.get(id) as any)?.requires??[])]
  while(todo.length){const x=todo.pop()!;if(seen.has(x))continue;seen.add(x);if(removed.includes(x))transitiveRemovedDependencies.push({target:id,removedDependency:x});todo.push(...((beforeById.get(x) as any)?.requires??[]))}
 }
 const bc=compileCompositionView(normalizeCompositionView(b),before),ac=compileCompositionView(normalizeCompositionView(a),after)
 const newCompileErrors=ac.findings.filter((f:any)=>f.severity==='error'&&!bc.findings.some((q:any)=>eq(f,q)))
 const row={viewId:a.viewId,courseProfile:a.scope.courseProfile,jurisdiction:a.scope.jurisdiction,beforeTargets:bt.size,afterTargets:at.size,removed,added,remainingDirectConsumersOfRemoved:remainingConsumers,transitiveRemovedDependencies,baselineCompileFindings:bc.findings,candidateCompileFindings:ac.findings,newCompileErrors}
 if(added.length||remainingConsumers.length||transitiveRemovedDependencies.length||newCompileErrors.length)violations.push(row)
 return row
})
const courseNoNewMismatch=courseAfter.status===courseBefore.status&&!(courseAfter.details??[]).some((x:string)=>(x.includes('mismatch')||x.includes('missing'))&&!(courseBefore.details??[]).includes(x))
const report={schemaVersion:1,stockFunctions:['collectAuthoritativeTargetAtomicGoalIds','compileCompositionView','normalizeCompositionView','evaluateCourseLevelMappingConsistency'],views,violations,modifiedCanonicalGoalIds:modified.map((g:any)=>g.id),courseBefore,courseAfter,courseNoNewMismatch,strictGain:0,activeWrites:false,overall:violations.length===0&&modified.length===1&&courseNoNewMismatch?'PASS':'BLOCK'}
writeFileSync(resolve(repo,`${own}/CHECK.stock-composition-and-course-preservation.actual.json`),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({overall:report.overall,views:views.length,removedTargets:views.reduce((n:any,v:any)=>n+v.removed.length,0),violations:violations.length,courseBefore:courseBefore.status,courseAfter:courseAfter.status,modifiedGoals:report.modifiedCanonicalGoalIds}))
if(report.overall!=='PASS')process.exitCode=1
