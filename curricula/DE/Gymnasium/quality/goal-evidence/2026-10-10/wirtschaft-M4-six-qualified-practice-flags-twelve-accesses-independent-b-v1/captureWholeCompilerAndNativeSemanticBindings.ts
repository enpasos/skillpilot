import {readFileSync, writeFileSync} from 'node:fs'
import {pathToFileURL} from 'node:url'
const capsule=process.argv[3]
const {buildApplicabilityCompilation}=await import(pathToFileURL(capsule+'/app/scripts/applicabilityCompiler.ts').href)
const {fingerprintSemanticKindSourceGoal}=await import(pathToFileURL(capsule+'/app/scripts/goalBookModel.ts').href)
const landscape=JSON.parse(readFileSync(capsule+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json','utf8'))
const semantic=JSON.parse(readFileSync(capsule+'/curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current496-qualified-M3-materials-20261010-v5/wirtschaftswissenschaften.semantic-kinds.json','utf8'))
const compilation=buildApplicabilityCompilation()
const report=compilation.reports.find((r:any)=>r.landscapeId===landscape.landscapeId)
const byId=new Map(semantic.decisions.map((d:any)=>[d.goalId,d]))
const bindings=landscape.goals.map((goal:any)=>({goalId:goal.id,nativeSourceFingerprint:fingerprintSemanticKindSourceGoal(goal),semanticSourceFingerprint:(byId.get(goal.id) as any)?.sourceFingerprint,exact:fingerprintSemanticKindSourceGoal(goal)===(byId.get(goal.id) as any)?.sourceFingerprint}))
if(bindings.some((b:any)=>!b.exact))throw new Error('Actual SEM binding mismatch')
writeFileSync(process.argv[2],JSON.stringify({wholeNativeApplicabilityReport:report,nativeWhole496SemanticSourceBindings:bindings,noSemanticKindOrStatusChange:true},null,2)+'\n')
console.log(JSON.stringify({summary:report.summary,diagnostics:report.diagnostics?.length,whole496NativeSourceBindingsExact:true}))
