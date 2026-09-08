/** Evaluate unmodified native route functions against in-memory candidate files.
 * No repo writes and no pretending needs_review assessments are released.
 */
import fs from 'node:fs'
import { resolve } from 'node:path'
import { createRequire, Module, syncBuiltinESMExports } from 'node:module'
import { pathToFileURL } from 'node:url'
import { buildCandidate } from './build-candidate.ts'

const root=process.cwd(), candidate=await buildCandidate(root)
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
    +'\nmodule.exports = { evaluateRouteProfile, routeProfiles };\n'
  const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
  const m:any=new Module(nativePath+'.astro-readonly-shadow',undefined)
  m.filename=nativePath;m.paths=(Module as any)._nodeModulePaths(resolve(root,'app/scripts'))
  m.require=createRequire(nativePath);m._compile(compiled,nativePath)
  const {buildApplicabilityCompilation}=await import(pathToFileURL(resolve(root,'app/scripts/applicabilityCompiler.ts')).href)
  const applicability=buildApplicabilityCompilation()
  const profiles=m.exports.routeProfiles.filter((p:any)=>p.landscapeId===candidate.landscape.landscapeId)
  const actual=profiles.map((p:any)=>m.exports.evaluateRouteProfile(candidate.landscape,p,applicability))
  console.log(JSON.stringify({status:'READ_ONLY_NATIVE_ROUTE_SHADOW',actualProposedNeedsReviewState:actual,
    nativeFunctionsUnmodified:true,cliMainNotExecuted:true,operativeWrites:0,
    releaseCaveat:'New tasks and 335a remain needs_review. Any CQR exam release failures are real pending gates, not waived.',
    applicabilityFindings:applicability.findings?.filter((f:any)=>JSON.stringify(f).includes(candidate.landscape.landscapeId))??[],
    beforeGoals:candidate.plan.counts.beforeGoals,afterGoals:candidate.plan.counts.afterGoals},null,2))
} finally { fs.readFileSync=read;fs.existsSync=exists;syncBuiltinESMExports() }
