import fs from 'node:fs'
import Module, { createRequire, syncBuiltinESMExports } from 'node:module'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const R=process.cwd()
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-thirteen-SekI-country-969-raw-unsupported-disjoint-role-boundaries-AUTHOR-INERT-v1'
const originalRead=fs.readFileSync
const read=(p:string)=>JSON.parse(originalRead(resolve(R,p),'utf8'))
const sha=(p:string)=>createHash('sha256').update(originalRead(resolve(R,p))).digest('hex')
const index=read(O+'/actual-thirteen-whole-views-969-disjoint-boundaries.AUTHOR-INERT.json')
const req=createRequire(resolve(R,'app/package.json'))
const CAN='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
const nativeFile=resolve(R,'app/scripts/generateCurriculumQualityStatus.ts')
const exportsOnly='\nexport { readJurisdictionCoverageByLandscapeId, collectRenderedAtomicGoalIdsFromCompositionView };\n'
const js=req('esbuild').transformSync(originalRead(nativeFile,'utf8')+exportsOnly,{loader:'ts',format:'cjs',target:'node20',define:{'import.meta.url':JSON.stringify(pathToFileURL(nativeFile).href)}}).code
const paths=[CAN,index.inputNativeRuntimePath,O+'/actual-thirteen-whole-views-969-disjoint-boundaries.AUTHOR-INERT.json',...index.rows.flatMap((r:any)=>[r.activePath,r.beforePath,r.candidatePath]),'app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/src/utils/authoring/compositionViewAuthoring.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/compositionViewRuntime.ts','app/scripts/sourceCoverageEvidence.ts','app/scripts/compositionViewSourceCoverage.ts','curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json']
const guards=[...new Set(paths)].map(path=>({path,sha256:sha(path)}))
const canon=read(CAN)
const { normalizeCanonicalLandscape }=req(resolve(R,'app/src/utils/authoring/canonicalAuthoring.ts'))
const { normalizeCompositionView,compileCompositionView }=req(resolve(R,'app/src/utils/authoring/compositionViewAuthoring.ts'))
const normalized=normalizeCanonicalLandscape(canon)
const compileRows=index.rows.map((r:any)=>{
  const before=compileCompositionView(normalizeCompositionView(read(r.beforePath)),normalized)
  const candidate=compileCompositionView(normalizeCompositionView(read(r.candidatePath)),normalized)
  return {jurisdiction:r.jurisdiction,beforeErrors:before.findings.filter((f:any)=>f.severity==='error'),candidateErrors:candidate.findings.filter((f:any)=>f.severity==='error'),candidateWarnings:candidate.findings.filter((f:any)=>f.severity==='warning')}
})
function evaluate(candidate:boolean){
  const overlay=new Map(candidate?index.rows.map((r:any)=>[resolve(R,r.activePath),resolve(R,r.candidatePath)]):[])
  ;(fs as any).readFileSync=(p:any,...args:any[])=>{
    const key=typeof p==='string'?resolve(p):p instanceof URL?resolve(p.pathname):''
    return (originalRead as any)(overlay.get(key)??p,...args)
  }
  syncBuiltinESMExports()
  try{
    const mod:any=new (Module as any)(nativeFile);mod.filename=nativeFile;mod.paths=(Module as any)._nodeModulePaths(dirname(nativeFile));mod._compile(js,nativeFile)
    const compilation=req(resolve(R,'app/scripts/applicabilityCompiler.ts')).buildApplicabilityCompilation()
    const report=compilation.reports.find((r:any)=>r.landscapeId===canon.landscapeId)
    const source=mod.exports.readJurisdictionCoverageByLandscapeId({...compilation,reports:[report]}).get(report.landscapeId)
    const rawRows=index.rows.map((r:any)=>({jurisdiction:r.jurisdiction,rawDeclaredTargetAtomicIds:[...mod.exports.collectRenderedAtomicGoalIdsFromCompositionView(canon,resolve(R,r.activePath))].sort()}))
    return {source,rawRows}
  }finally{fs.readFileSync=originalRead;syncBuiltinESMExports()}
}
const baseline=evaluate(false),candidate=evaluate(true)
const endGuards=guards.map(g=>({...g,endSHA256:sha(g.path),exact:g.sha256===sha(g.path)}))
if(!endGuards.every(g=>g.exact))throw Error('Input drift')
const output={status:'TECHNICAL_AUTHOR_CANDIDATE_ORIGINAL_NATIVE_FUNCTIONS_NO_SCIENTIFIC_SELF_RELEASE',originalFunctions:['compileCompositionView','readJurisdictionCoverageByLandscapeId','collectRenderedAtomicGoalIdsFromCompositionView'],mainInvoked:false,activeWrites:0,compileRows,baseline,candidate,endGuards,expectedOpenTrueRuntimeSourceGaps:index.rows.flatMap((r:any)=>r.actualRuntimeUnsupportedTargetsUntouched.map((goalId:string)=>({jurisdiction:r.jurisdiction,goalId}))),noNewSourceEvidence:true,noBackendReRun:true,actualNativeRuntimeInputPath:index.inputNativeRuntimePath,actualNativeRuntimeInputSHA256:index.inputNativeRuntimeSHA256}
fs.writeFileSync(resolve(R,O,'actual-original-native-13-views-source-and-compilation.AUTHOR-INERT.json'),JSON.stringify(output,null,2)+'\n')
console.log(JSON.stringify({beforeUnsupported:baseline.source.unsupportedAssignedAtomicGoals,afterUnsupported:candidate.source.unsupportedAssignedAtomicGoals,sourceOriginal:candidate.source.sourceOriginalGoals,sourceFull:candidate.source.sourceFullyCoveredOriginalGoals,candidateCompileErrors:compileRows.reduce((n:number,r:any)=>n+r.candidateErrors.length,0),endGuardsExact:endGuards.every(g=>g.exact)}))
