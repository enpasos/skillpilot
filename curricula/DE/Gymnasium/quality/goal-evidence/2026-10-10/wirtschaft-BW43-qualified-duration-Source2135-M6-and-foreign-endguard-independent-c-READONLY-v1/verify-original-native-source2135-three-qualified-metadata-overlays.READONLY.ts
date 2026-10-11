import fs from 'node:fs'
import Module, { createRequire, syncBuiltinESMExports } from 'node:module'
import { resolve, dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'
const root=process.cwd()
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-qualified-duration-Source2135-M6-and-foreign-endguard-independent-c-READONLY-v1'
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-BW43-BP2016-source-bound-G8-duration-policy-and-exact-QAalias-AUTHOR-INERT-v1'
const originalRead=fs.readFileSync
const json=(p:string)=>JSON.parse(originalRead(resolve(root,p),'utf8'))
const pairs=json(author+'/ROOT-ready-three-BW43-source-duration-QAalias-only-pairs.GUARDED.handoff.json').pairs
const sha=(p:string)=>createHash('sha256').update(originalRead(resolve(root,p))).digest('hex')
const oldSourceGuard=json('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current-source32-six-explicit-qualified-successors-endguard-independent-c-READONLY-v1/actual-current32-source-pairs-26-exact-six-explicit-qualified-followers.independent-READONLY.receipt.json')
const guardPaths=[...new Set([...pairs.flatMap((p:any)=>[p.activePath,p.candidatePath]),...oldSourceGuard.actualByteChecks.map((x:any)=>x.active.path),'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json','curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-final702-native-SEM-346-exact-and48-pointer-followers-AUTHOR-INERT-c-v1/semantic702.346-whole-decisions-exact-nine-qualified-practice.AUTHOR-INERT.json','app/scripts/generateCurriculumQualityStatus.ts','app/scripts/applicabilityCompiler.ts','app/scripts/sourceCoverageEvidence.ts','app/scripts/compositionViewSourceCoverage.ts'])] as string[]
const before=guardPaths.map(path=>({path,sha256:sha(path)}))
const require=createRequire(resolve(root,'app/package.json'))
const esbuild=require('esbuild')
const statusPath=resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')
const statusSource=originalRead(statusPath,'utf8')+'\nexport { readJurisdictionCoverageByLandscapeId };\n'
const compiled=esbuild.transformSync(statusSource,{loader:'ts',format:'cjs',target:'node20',define:{'import.meta.url':JSON.stringify(pathToFileURL(statusPath).href)}}).code
function evaluate(overlays:any[]) {
 const overlay=new Map(overlays.map(p=>[resolve(root,p.activePath),resolve(root,p.candidatePath)]))
 ;(fs as any).readFileSync=(path:any,...args:any[])=>{
  const key=typeof path==='string'?resolve(path):path instanceof URL?resolve(path.pathname):''
  return (originalRead as any)(overlay.get(key)??path,...args)
 }
 syncBuiltinESMExports()
 try {
  const module:any=new (Module as any)(statusPath)
  module.filename=statusPath;module.paths=(Module as any)._nodeModulePaths(dirname(statusPath));module._compile(compiled,statusPath)
  const {buildApplicabilityCompilation}=require(resolve(root,'app/scripts/applicabilityCompiler.ts'))
  const compilation=buildApplicabilityCompilation()
  const report=compilation.reports.find((r:any)=>r.landscapeId==='605bdaf6-32d5-56fd-8d92-5a80c2fd2901')
  const coverage=module.exports.readJurisdictionCoverageByLandscapeId({...compilation,reports:[report]}).get(report.landscapeId)
  return {coverage,appErrors:report.errors,appWarnings:report.warnings,sourceMappingCount:compilation.sourceMappings?.length??null}
 } finally {fs.readFileSync=originalRead;syncBuiltinESMExports()}
}
const beforeNames=['whole-source43-before.EXACT.json','whole-duration-policy-before.EXACT.json','whole-QA-report-generator-before.EXACT.ts']
const baseline=evaluate(pairs.map((p:any,i:number)=>({...p,candidatePath:author+'/'+beforeNames[i]})))
const candidate=evaluate(pairs)
const endGuards=before.map(g=>({...g,endSha256:sha(g.path),exact:sha(g.path)===g.sha256}))
if(!endGuards.every(g=>g.exact))throw Error('Active inputs or qualified candidates changed during read-only probe')
const cov=candidate.coverage
const full=2135
if(cov.sourceAtomicGoals!==full||cov.sourceMappedToViewAtomicGoals!==full||cov.sourceOriginalGoals!==full||cov.sourceFullyCoveredOriginalGoals!==full||cov.unsupportedAssignedAtomicGoals!==0||cov.unmappedSourceAtomicGoals!==0||cov.sourcePartiallyCoveredOriginalGoals!==0||cov.sourceUncoveredOriginalGoals!==0)throw Error('Bounded native Source2135 coverage guard failed')
if(JSON.stringify(baseline.coverage)!==JSON.stringify(candidate.coverage))throw Error('Source root duration successor altered actual jurisdiction/source coverage')
const artifact={reviewer:'/root/economics_common_source_course_independent_c',actualAt:new Date().toISOString(),method:'Original native buildApplicabilityCompilation and exact private readJurisdictionCoverageByLandscapeId exported in memory only. Original main argv guard prevents global report generation. Candidate three read overlays; no active writes.',statusCode: {path:'app/scripts/generateCurriculumQualityStatus.ts',sha256:sha('app/scripts/generateCurriculumQualityStatus.ts')},appCompiler:{path:'app/scripts/applicabilityCompiler.ts',sha256:sha('app/scripts/applicabilityCompiler.ts')},pairs,baseline,candidate,source2135WholeCoverageExact:true,firstConcurrentRootActivationProbeRejectedWithoutQualification:true,statusReportExcludedFromNativeInputGuardBecauseNativeFunctionReadsSourceBodiesDirectly:true,endGuards,globalGeneratorInvoked:false,buildInvoked:false,activeWrites:0,sourceNormScienceByIndependentASeparate:true,ownAliasSelfApprovalClaim:false}
fs.writeFileSync(resolve(root,own,'actual-native-qualified-three-overlay-Source2135-exact-coverage.READONLY.json'),JSON.stringify(artifact,null,2)+'\n')
console.log(JSON.stringify({sourceAtomicGoals:cov.sourceAtomicGoals,sourceOriginalGoals:cov.sourceOriginalGoals,sourceFullyCoveredOriginalGoals:cov.sourceFullyCoveredOriginalGoals,unsupported:cov.unsupportedAssignedAtomicGoals,unmapped:cov.unmappedSourceAtomicGoals,exactBaselineParity:JSON.stringify(baseline.coverage)===JSON.stringify(candidate.coverage),guardCount:endGuards.length,activeWrites:0}))
