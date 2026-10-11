import fs from 'node:fs'
import Module, {createRequire,syncBuiltinESMExports} from 'node:module'
import {resolve,dirname} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const root=process.cwd(); const originalRead=fs.readFileSync
const require=createRequire(resolve(root,'app/package.json'));const esbuild=require('esbuild')
const statusPath=resolve(root,'app/scripts/generateCurriculumQualityStatus.ts')
const candidate='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-eleven-actual-APV201-owned-bounds-exact-warning-lane-AUTHOR-INERT-c-v1/applicability-accepted-warnings.exact-eleven-Economics-bounds.AUTHOR-INERT.json'
const active='docs/qa-ci/applicability-accepted-warnings.json'
const paths=[statusPath,resolve(root,'app/scripts/applicabilityCompiler.ts'),resolve(root,active),resolve(root,candidate),resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')]
const sha=(p:string)=>createHash('sha256').update(originalRead(p)).digest('hex');const before=paths.map(path=>({path,sha256:sha(path)}))
const code=esbuild.transformSync(originalRead(statusPath,'utf8')+'\nexport {readApplicabilityWarningMetricsByLandscapeId,evaluateApplicabilityWarnings};\n',{loader:'ts',format:'cjs',target:'node20',define:{'import.meta.url':JSON.stringify(pathToFileURL(statusPath).href)}}).code
function probe(overlay:boolean){
 (fs as any).readFileSync=(p:any,...args:any[])=>{const k=typeof p==='string'?resolve(p):p instanceof URL?resolve(p.pathname):'';return(originalRead as any)(overlay&&k===resolve(root,active)?resolve(root,candidate):p,...args)};syncBuiltinESMExports()
 try{const module:any=new(Module as any)(statusPath);module.filename=statusPath;module.paths=(Module as any)._nodeModulePaths(dirname(statusPath));module._compile(code,statusPath)
 const compilation=require(resolve(root,'app/scripts/applicabilityCompiler.ts')).buildApplicabilityCompilation();const report=compilation.reports.find((r:any)=>r.landscapeId==='605bdaf6-32d5-56fd-8d92-5a80c2fd2901');const metrics=module.exports.readApplicabilityWarningMetricsByLandscapeId(compilation).get(report.landscapeId);return{actualWarnings:report.findings.filter((f:any)=>f.severity==='warning'),metrics,rule:module.exports.evaluateApplicabilityWarnings(metrics)}
 }finally{fs.readFileSync=originalRead;syncBuiltinESMExports()}
}
const baseline=probe(false);const candidateResult=probe(true);const endGuards=before.map(g=>({...g,endSha256:sha(g.path),exact:sha(g.path)===g.sha256}));if(!endGuards.every(g=>g.exact))throw Error('Input drift');if(candidateResult.rule.status!=='pass'||candidateResult.metrics.activeWarnings!==0||candidateResult.metrics.obsoleteAcceptedWarnings!==0||candidateResult.metrics.acceptedWarnings!==11)throw Error('Actual eleven-key acceptance FAIL')
const out='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-eleven-APV201-original-native-exact-keys-probe-READONLY-c-v1';fs.mkdirSync(resolve(root,out),{recursive:false});fs.copyFileSync('/tmp/economics-source-course-independent-c-na9372ou/actual-eleven-warning-keys-native.READONLY.ts',resolve(root,out,'actual-eleven-warning-keys-native.READONLY.ts'))
fs.writeFileSync(resolve(root,out,'actual-eleven-APV201-original-CQR501-before-after-exact-lane.READONLY.json'),JSON.stringify({actualAt:new Date().toISOString(),nativeMethods:['buildApplicabilityCompilation','readApplicabilityWarningMetricsByLandscapeId','evaluateApplicabilityWarnings'],mainInvoked:false,checkerImplementationChanged:false,activeWrites:0,overlay:{active,candidate},baseline,candidate:candidateResult,endGuards,nativeKeyPassNotIndependentScienceApprovalOrM6M7Claim:true},null,2)+'\n');console.log(JSON.stringify({baseline:baseline.rule,candidate:candidateResult.rule,originalCodeUnchanged:true,activeWrites:0}))
