// Bounded source metadata/joins only; no scientific approval by hash; Apache-2.0.
import {readFileSync,writeFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const repo=process.cwd(),own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-independent-b-20261014-v1',author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-HB19-neighbor021-original-operator-source-cell-author-20261014-v1'
const read=(p:string)=>JSON.parse(readFileSync(resolve(repo,p),'utf8'))
const {evaluateCourseLevelMappingConsistency}=await import(pathToFileURL(resolve(repo,'app/scripts/generateCurriculumQualityStatus.ts')).href)
const {stableGoalBookJson}=await import(pathToFileURL(resolve(repo,'app/scripts/goalBookModel.ts')).href)
const c=read(`${author}/CANDIDATE.one-whole-source-cell-and-bounded-operator-component.author.json`)
const before=read(c.sourceCarrierBefore.path),after=read(c.sourceCarrierAfter.path)
const landscape=read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1/candidate/canonical533.current407.corrected-P8-resources.inactive.json')
const maps=c.mappingCarriers.map((v:any)=>({...read(v.frozenCopy.path),file:v.operativeCarrier.path}))
const scoped=maps.filter((v:any)=>typeof v.sourceExtractionPath==='string')
const beforeMap=new Map(scoped.map((v:any)=>[v.sourceExtractionPath,before])),afterMap=new Map(scoped.map((v:any)=>[v.sourceExtractionPath,after]))
const courseBefore=evaluateCourseLevelMappingConsistency(landscape,maps,beforeMap)
const courseAfter=evaluateCourseLevelMappingConsistency(landscape,maps,afterMap)
const sourceId=c.sourceOriginalIdRetained,partnerIds=c.mappingCarriers[0].wholeExistingEdges.map((e:any)=>e.canonicalGoalId)
const missingTargets=partnerIds.filter((id:string)=>!landscape.goals.some((g:any)=>g.id===id))
const newPassage=after.passages.find((p:any)=>p.id===c.sourceCellCAS.exactAfter.passageId)
// Author whole-cell hashes bind UTF-8 stable JSON followed by one newline.
// This serialization is distinct from the stock no-newline object digest.
const fingerprints={before:`sha256:${createHash('sha256').update(stableGoalBookJson(c.sourceCellCAS.exactBefore)+'\n').digest('hex')}`,after:`sha256:${createHash('sha256').update(stableGoalBookJson(c.sourceCellCAS.exactAfter)+'\n').digest('hex')}`}
const sameCourse=stableGoalBookJson(courseBefore)===stableGoalBookJson(courseAfter)
const report={schemaVersion:1,stockFunctionsUnmodified:true,courseBefore,courseAfter,sameCourseResult:sameCourse,coursePassClaim:false,exactSourceGoalId:sourceId,wholeSourceCellCount:after.sourceGoals.length,newLiteralPassageJoinValid:newPassage?.sourceGoalIds?.includes(sourceId)===true,fourOriginalPartnerIds:partnerIds,missingTargets,authorWholeCellFingerprintSerialization:'sha256(stable UTF-8 JSON + one newline); not the no-newline stock object digest',actualWholeCellFingerprintsWithAuthorNewline:fingerprints,authoredCellFingerprintsEqual:fingerprints.before===c.sourceCellCAS.wholeBeforeFingerprint&&fingerprints.after===c.sourceCellCAS.wholeAfterFingerprint,scientificVerdict:'Literal ACCEPT;2652 partial component ACCEPT; entire four-partner manufacturing duty HOLD. Existing020/079 unmapped course-check failures remain before and after. Neither course consistency nor hashes imply whole source coverage.',activeWrites:false,strictGain:0}
writeFileSync(resolve(repo,`${own}/CHECK.stock-course-and-exact-HB021-source-joins.actual.json`),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({courseBefore:courseBefore.status,courseAfter:courseAfter.status,sameCourse,sourceCount:after.sourceGoals.length,missingTargets,sourceJoin:report.newLiteralPassageJoinValid,fingerprintJoins:report.authoredCellFingerprintsEqual}))
if(!sameCourse||missingTargets.length||!report.newLiteralPassageJoinValid||!report.authoredCellFingerprintsEqual)process.exitCode=1
