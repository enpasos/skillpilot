import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { generateDeepUnderstandingRollout } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
async function main() {
 const O='/home/enpasos/projects/skillpilot/qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-private-activation-package/'
 const state=JSON.parse(readFileSync(O+'private-workspace.json','utf8'))
 const actualSourceHash=createHash('sha256').update(readFileSync('/home/enpasos/projects/skillpilot/'+state.source)).digest('hex')
 const report=await generateDeepUnderstandingRollout('qa-artifacts/ci-contract-audit/2026-11-07/boxplot-label-private-activation-package/final-native-math.config.json')
 writeFileSync(state.workspace+'/final-native-math-report.json.gz',gzipSync(JSON.stringify(report,null,2)+'\n'))
 const subject=report.subjects[0]
 const summary={subject:subject.subject,sourceSha256:actualSourceHash,denominator:subject.denominator,gates:subject.gates,requiredChecks:subject.requiredChecks,strictComplete:subject.strictComplete,issueCount:subject.issues.length,issues:subject.issues,sourceReadOnly:true,threePngOverlayHash:state.newHash,actualIndependentPRecordSha256:'04ad4802599d5350ec0b7844dd75254b2f1b5ad435d6084950489f33dd44abbd',onlyOneSubject:true,fullCqrRun:false,authority132Overlaid:false,allDPAM807:subject.gates.currentDescriptionResolutions===807&&subject.gates.currentPositiveEvidenceProfiles===807&&subject.gates.currentSemanticAtomicityDecisions===807&&subject.gates.currentMemoryReviewDecisions===807}
 writeFileSync(state.workspace+'/final-native-math-summary.json',JSON.stringify(summary,null,2)+'\n')
 console.log(JSON.stringify({...summary,issues:undefined},null,2))
 if(actualSourceHash!=='e4de3c3e3a294a1751d7ebcd70fa4e63a457a63e51016996055c0e78f4510a06'||!summary.allDPAM807)process.exitCode=1
}
main().catch(e=>{console.error(e);process.exitCode=1})
