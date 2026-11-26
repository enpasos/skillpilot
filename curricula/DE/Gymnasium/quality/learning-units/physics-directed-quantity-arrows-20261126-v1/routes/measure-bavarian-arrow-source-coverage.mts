// SPDX-License-Identifier: Apache-2.0
import {readFileSync,writeFileSync,existsSync} from 'node:fs'
import {resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
const root=process.cwd(),dir='curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/routes'
const output=process.argv.find(x=>x.startsWith('--output='))?.slice('--output='.length)
if(!output||existsSync(output))throw Error('Choose fresh output; retained evidence is immutable')
const load=async(p:string)=>import(pathToFileURL(resolve(root,p)).href)
const {buildApplicabilityCompilation}=await load('app/scripts/applicabilityCompiler.ts')
const {readJurisdictionCoverageByLandscapeId,evaluateJurisdictionCoverage,evaluateCourseLevelMappingConsistency,readAllGoalMappingFiles}=await load('app/scripts/generateCurriculumQualityStatus.ts')
const physicsPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',physics=JSON.parse(readFileSync(physicsPath,'utf8')),id=physics.landscapeId
const compilation=buildApplicabilityCompilation(),report=compilation.reports.find((r:any)=>r.landscapeId===id)
const arrow=report.goals.find((g:any)=>g.goalId==='b77a7e93-22f9-5722-a4cc-f18a149ab030'),beforePath=`${dir}/by-arrow-source-before.actual.json`,before=JSON.parse(readFileSync(beforePath,'utf8'))
const directBy=(g:any)=>g.evidence.filter((e:any)=>e.value==='DE-BY'&&['mapping','provenance'].includes(e.kind))
const coverage=readJurisdictionCoverageByLandscapeId({...compilation,reports:[report]}).get(id),cqr3=evaluateJurisdictionCoverage(coverage)
const cqr4=evaluateCourseLevelMappingConsistency(physics),by=coverage.jurisdictions.find((j:any)=>j.jurisdiction==='DE-BY')
const mapPath='curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.directed-quantity-arrows-20261126-v1.review.json'
const mapped=readAllGoalMappingFiles().find((m:any)=>m.file===mapPath)
const mapping=JSON.parse(readFileSync(mapPath,'utf8')),source=JSON.parse(readFileSync(mapping.sourceExtractionPath,'utf8'))
if(!mapped||mapped.mappings.length!==1||mapped.mappings[0].legacyGoalId!=='7812213c-59e5-5d52-9a01-0c0534020cd5'||mapped.mappings[0].canonicalGoalId!==arrow.goalId||mapped.mappings[0].matchType!=='partial')throw Error('Scoped actual source mapping changed')
if(directBy(before).length||!directBy(arrow).length||cqr3.status!=='pass'||cqr4.status!=='pass'||by.visibleAtomicGoals!==301||by.sourceBackedAtomicGoals!==301||by.unsupportedAssignedAtomicGoals!==0)throw Error('Actual current source coverage is incomplete')
const paths=[physicsPath,'app/scripts/applicabilityCompiler.ts','app/scripts/generateCurriculumQualityStatus.ts',mapPath,mapping.sourceExtractionPath,mapping.supplementalSourceBinding.baseReview.path,mapping.supplementalSourceBinding.independentSourceDecision.path,beforePath]
const pins=paths.map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}))
const result={schema:'physics-arrow-bavarian-current-source-binding-v1',status:'PASS',method:'Production active mapping discovery, applicability compiler and complete sixteen-Land CQR-003 source-to-view evaluation for Physics only; actual CQR-004 course-level mapping check. No global maturity run and no source denominator exception.',unbackedGoalBefore:before.goalId,bySourceEvidenceBefore:directBy(before),bySourceEvidenceCurrent:directBy(arrow),activeSupplementalMapping:{path:mapPath,sourceGoalId:mapped.mappings[0].legacyGoalId,canonicalGoalId:arrow.goalId,matchType:'partial'},unchangedOfficialSourceDenominator:source.sourceGoals.length,coverageByJurisdiction:coverage.jurisdictions,cqr3,cqr4,bindings:pins,boundaries:['The original 83 retained source/mapping files remain byte-identical. One additional current mapping endpoint refers to an existing official row; no new source requirement is invented.','The partial mapping records SkillPilot didactic elaboration honestly and preserves the specific video-analysis endpoint in the original review.','This scoped source check does not claim whole main CI, learner mastery or independent new content approval.']}
writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:'PASS',by:`${by.sourceBackedAtomicGoals}/${by.visibleAtomicGoals}`,sourceCompleteJurisdictions:coverage.sourceCompleteJurisdictions,cqr3:cqr3.status,cqr4:cqr4.status,denominator:source.sourceGoals.length}))
