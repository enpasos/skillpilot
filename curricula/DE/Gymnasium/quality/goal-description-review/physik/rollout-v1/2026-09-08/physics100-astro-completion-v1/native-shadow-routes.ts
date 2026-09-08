/** Evaluate unmodified native route functions against in-memory candidate files.
 * No repo writes and no pretending needs_review assessments are released.
 */
import fs from 'node:fs'
import { resolve } from 'node:path'
import { createRequire, Module, syncBuiltinESMExports } from 'node:module'
import { pathToFileURL } from 'node:url'
import { buildCandidate } from './build-candidate.ts'
import {ids,assessmentIds} from './assessment-drafts.mjs'

export async function evaluateCandidateRoutes(candidate:any) {
const root=process.cwd()
const overlay=new Map(candidate.files.map(f=>[resolve(root,f.path),f.after]))
const read=fs.readFileSync, exists=fs.existsSync
const normalize=(p:any)=>p instanceof URL?p.pathname:String(p)
fs.readFileSync=((p:any,opts:any)=>{
  const text=overlay.get(normalize(p));if(text===undefined)return read(p,opts)
  return typeof opts==='string'||opts?.encoding?text:Buffer.from(text)
}) as any
fs.existsSync=((p:any)=>overlay.has(normalize(p))||exists(p)) as any
syncBuiltinESMExports()
try {
  const nativePath=resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')
  const ts=await import(pathToFileURL(resolve(root,'app/node_modules/typescript/lib/typescript.js')).href)
  let source=read(nativePath,'utf8')
  // Instrumentation only: remove CLI invocation, expose original native functions.
  // No status rule, profile, selector, threshold or function body is changed.
  if(!/\nmain\(\)\s*$/.test(source))throw Error('Native main invocation guard changed')
  source=source.replace(/\nmain\(\)\s*$/,'\n')
    .replaceAll('import.meta.url',JSON.stringify(pathToFileURL(nativePath).href))
    +'\nmodule.exports = { evaluateRouteProfile, routeProfiles, collectRenderedAtomicGoalIdsFromCompositionView };\n'
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
  const m:any=new Module(nativePath+'.astro-readonly-shadow',undefined)
  m.filename=nativePath;m.paths=(Module as any)._nodeModulePaths(resolve(root,'app/scripts'))
  m.require=createRequire(nativePath);m._compile(compiled,nativePath)
  const {buildApplicabilityCompilation}=await import(pathToFileURL(resolve(root,'app/scripts/applicabilityCompiler.ts')).href)
  const applicability=buildApplicabilityCompilation()
  const profiles=m.exports.routeProfiles.filter((p:any)=>p.landscapeId===candidate.landscape.landscapeId)
  const actual=profiles.map((p:any)=>m.exports.evaluateRouteProfile(candidate.landscape,p,applicability))
  const astroStageSupportProof=candidate.files.filter((f:any)=>/composition-views\/physik\/de-de-gym-(physics-(gk|lk)|seki-physics)\.view\.json$/.test(f.path)).map((f:any)=>{
    const view=JSON.parse(f.after),filters=view.scope.courseProfile?[view.scope.courseProfile]:[]
    const target=m.exports.collectRenderedAtomicGoalIdsFromCompositionView(candidate.landscape,resolve(root,f.path),filters,false,'SekI',[ids.motivation])
    const visible=m.exports.collectRenderedAtomicGoalIdsFromCompositionView(candidate.landscape,resolve(root,f.path),filters,true,'SekI',[ids.motivation])
    return {path:f.path,stage:'SekI',sourceLocalTaskSupport:['S','G'].map(key=>({key,goalId:ids[key],assessmentId:assessmentIds[key],stageContentTarget:target.has(ids[key]),stagePrerequisiteVisible:visible.has(ids[key]),stageAssessmentTarget:target.has(assessmentIds[key])}))}
  })
  return {status:'READ_ONLY_NATIVE_ROUTE_SHADOW',actualProposedNeedsReviewState:actual,
    astroStageSupportProof,
    nativeFunctionsUnmodified:true,cliMainNotExecuted:true,operativeWrites:0,
    releaseCaveat:'Individual task release decisions are separately content-hash-bound and explicitly Root-authorized. This shadow changes no native gate or threshold.',
    applicabilityFindings:applicability.findings?.filter((f:any)=>JSON.stringify(f).includes(candidate.landscape.landscapeId))??[],
    beforeGoals:candidate.plan.counts.beforeGoals,afterGoals:candidate.plan.counts.afterGoals}
} finally { fs.readFileSync=read;fs.existsSync=exists;syncBuiltinESMExports() }
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname)
  buildCandidate().then(evaluateCandidateRoutes).then(r=>console.log(JSON.stringify(r,null,2))).catch(error=>{console.error(error.stack);process.exitCode=1})
