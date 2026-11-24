import { readFileSync, writeFileSync } from 'node:fs'
import { createRouteProfiles, evaluateRouteProfile } from '/home/enpasos/projects/skillpilot-e1-nachweise/app/scripts/generateCurriculumQualityStatus.ts'
import { buildApplicabilityCompilation } from '/home/enpasos/projects/skillpilot-e1-nachweise/app/scripts/applicabilityCompiler.ts'
const root='/home/enpasos/projects/skillpilot-e1-nachweise'
const current=JSON.parse(readFileSync(root+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json','utf8'))
const id='2b9e565f-d9b4-5e23-b5b7-b7977cecff06'
const candidate=structuredClone(current);candidate.goals.find((g:any)=>g.id===id).examData.coveredGoalIds=[]
const app=buildApplicabilityCompilation()
const profile=createRouteProfiles(root).find(p=>p.profileId==='canonical-physics-sek2')!
const baseline=evaluateRouteProfile(current,profile,app).rules.find(r=>r.id==='CQR-203')
const mutated=evaluateRouteProfile(candidate,profile,app).rules.find(r=>r.id==='CQR-203')
const result={contract:'Native evaluateRouteProfile with actual canonical-physics-sek2 route profile; only MP coveredGoalIds differs in memory. No canonical or rule mutation.',baseline,emptyMpCoverage:mutated}
writeFileSync('/tmp/e1-t5/mp-empty-native.actual.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2))
