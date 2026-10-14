// Apache-2.0. Narrow unchanged stock course check; no scientific decision here.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateCourseLevelMappingConsistency } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
const repo='/home/enpasos/projects/skillpilot'
const own=resolve(fileURLToPath(new URL('.',import.meta.url)))
const author=resolve(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-NI2652-three-direct-original-polymer-operators-author-20261014-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const neutral=read(resolve(author,'NEUTRAL.three-original-NI-operators-current2652-direct-partial-candidate.exact-input-selector.json'))
const whole=read(resolve(repo,neutral.wholeCurrentGoalAndExistingPartners.path))
const landscape=read(resolve(repo,whole.sourceCanonical.path))
const source=read(resolve(repo,neutral.wholeOriginalSource.path))
const after=neutral.candidateMappingCarriers.map((r:any)=>({...read(resolve(repo,r.path)),file:r.path}))
const before=after.map((m:any)=>{
 const name=m.file.split('/').pop();const p='curricula/DE/Gymnasium/mapping/DE-NI/upper-secondary/'+name
 return {...read(resolve(repo,p)),file:p}
})
const sourcePath=after.find((m:any)=>m.sourceExtractionPath).sourceExtractionPath
const sourceMap=new Map([[sourcePath,source]])
const cb=evaluateCourseLevelMappingConsistency(landscape,before,sourceMap)
const ca=evaluateCourseLevelMappingConsistency(landscape,after,sourceMap)
const sourceIds=new Set(source.sourceGoals.map((g:any)=>g.id))
const goalIds=new Set(landscape.goals.map((g:any)=>g.id))
const joins=neutral.candidateRows.map((r:any)=>({sourceGoalId:r.legacyGoalId,targetGoalId:r.canonicalGoalId,
 sourceExists:sourceIds.has(r.legacyGoalId),targetExists:goalIds.has(r.canonicalGoalId),
 matchType:r.matchType,sourceDecisionIdMatchesSourceOperator:r.reviewDecisionId===r.legacyGoalId,
 sourceAlreadyHasMappedOriginalDecision:after.some((m:any)=>(m.decisions??[]).some((d:any)=>d.sourceGoalId===r.legacyGoalId&&d.decision==='mapped'))}))
const noNewCourseFindings=ca.status===cb.status&&!(ca.details??[]).some((d:string)=>!(cb.details??[]).includes(d))
const pass=joins.length===3&&joins.every((j:any)=>j.sourceExists&&j.targetExists&&j.matchType==='partial'&&j.sourceDecisionIdMatchesSourceOperator&&j.sourceAlreadyHasMappedOriginalDecision)&&noNewCourseFindings
writeFileSync(resolve(own,'CHECK.actual-stock-source-course-and-three-direct-partial-joins.json'),JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),
 stockFunctionUnmodified:true,explicitNIOnly:true,sourceCount:source.sourceGoals.length,courseBefore:cb,courseAfter:ca,
 noNewCourseFindings,joins,pass,stockValidityIsNotWholeSourceOrWholeGKGrant:true,
 originalDecisionRowsPreservedNotReusedAsNewScienceAuthority:true,
 freshThreeEdgeScienceProvenanceMustBeBoundByNormalIntegration:true,newPQualificationClaim:false,newActiveWrites:false},null,2)+'\n')
console.log(JSON.stringify({sourceCount:source.sourceGoals.length,threeJoins:joins.length,courseBefore:cb.status,courseAfter:ca.status,noNewCourseFindings,pass}))
if(!pass)process.exitCode=1
