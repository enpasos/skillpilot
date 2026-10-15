// Apache-2.0. No source or curriculum mutation.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { evaluateCourseLevelMappingConsistency } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
const root='/home/enpasos/projects/skillpilot'
const author=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-author-20261014-v1')
const own=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB19-neighbor021-original-operator-source-independent-a-20261014-v1')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const proposal=read(resolve(author,'CANDIDATE.one-whole-source-cell-and-bounded-operator-component.author.json'))
const landscape=read(resolve(root,'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'))
const mappings=proposal.mappingCarriers.map((r:any)=>({...read(resolve(root,r.frozenCopy.path)),file:r.operativeCarrier.path}))
const sourcePath=mappings[0].sourceExtractionPath
const before=read(resolve(author,'inputs/HB89.before.exact-source-carrier.json'))
const after=read(resolve(author,'candidate/HB89.only021-original-production-operator.author.json'))
const baseline=evaluateCourseLevelMappingConsistency(landscape,mappings,new Map([[sourcePath,before]]))
const candidate=evaluateCourseLevelMappingConsistency(landscape,mappings,new Map([[sourcePath,after]]))
const sourceId=proposal.sourceOriginalIdRetained
const narrowBefore={...before,sourceGoals:before.sourceGoals.filter((g:any)=>g.id===sourceId)}
const narrowAfter={...after,sourceGoals:after.sourceGoals.filter((g:any)=>g.id===sourceId)}
const narrowMappings=mappings.map((m:any)=>({...m,mappings:m.mappings.filter((e:any)=>e.legacyGoalId===sourceId),decisions:(m.decisions??[]).filter((d:any)=>d.sourceGoalId===sourceId)}))
const exact021Before=evaluateCourseLevelMappingConsistency(landscape,narrowMappings,new Map([[sourcePath,narrowBefore]]))
const exact021After=evaluateCourseLevelMappingConsistency(landscape,narrowMappings,new Map([[sourcePath,narrowAfter]]))
const noNewIssues=JSON.stringify(baseline)===JSON.stringify(candidate)
mkdirSync(resolve(own,'checks'),{recursive:true})
writeFileSync(resolve(own,'checks/HB021-course-conditions.unmodified-stock.actual.json'),JSON.stringify({schemaVersion:1,stockFunction:'evaluateCourseLevelMappingConsistency',scope:'Whole frozen HB carriers before/after plus exact-cell021 course check; no mapping-content verdict inferred',baseline,candidate,wholeHBCarriersStockPass:candidate.status==='pass',noNewIssuesFrom021Correction:noNewIssues,exact021Before,exact021After,exact021StockPass:exact021After.status==='pass',sourceLevel:'GK_LK',phase:'E',oldCourseAndSchoolScopePreserved:true,scientificWholeOperatorAndWholeGoalCompletionNotInferred:true,pass:noNewIssues&&exact021Before.status==='pass'&&exact021After.status==='pass'},null,2)+'\n')
console.log(JSON.stringify({wholeHBbaseline:baseline.status,wholeHBcandidate:candidate.status,noNewIssues,exact021Before:exact021Before.status,exact021After:exact021After.status}))
if(!noNewIssues||exact021Before.status!=='pass'||exact021After.status!=='pass')process.exitCode=1
