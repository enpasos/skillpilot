import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateCourseLevelMappingConsistency, readAllGoalMappingFiles } from '../../../../../../../app/scripts/generateCurriculumQualityStatus'
import { createReviewedRequiresClosureCoverageChecker, sourceCoverageSurrogateKey } from '../../../../../../../app/scripts/sourceCoverageEvidence'

const out = dirname(fileURLToPath(import.meta.url))
const root = resolve(out, '../../../../../../..')
const parse = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const fingerprint = (path: string) => ({ path, sha256: createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex') })
const manifest = parse(resolve(out, 'planned-nine-file-integration-manifest.inert.json'))
const canonicalPath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const canonical = parse(resolve(root,canonicalPath))
const current = readAllGoalMappingFiles().filter(file=>file.targetLandscapeId===canonical.landscapeId)
const candidates = new Map(manifest.files.filter((file:any)=>file.productionPath.includes('/mapping/')).map((file:any)=>[file.productionPath, {...parse(resolve(root,file.candidate.path)),file:file.productionPath}]))
const next = current.map(file => candidates.get(file.file) ?? file)
for (const [path,file] of candidates) {
  if (!current.some(before=>before.file===path)) next.push(file as any)
}
const extractions = new Map<string,any>()
for (const mapping of next) {
  if (!mapping.sourceExtractionPath) continue
  const replacement = manifest.files.find((file:any)=>file.productionPath===mapping.sourceExtractionPath)
  extractions.set(mapping.sourceExtractionPath,parse(resolve(root,replacement?.candidate.path ?? mapping.sourceExtractionPath)))
}
const before = evaluateCourseLevelMappingConsistency(canonical,current,extractions)
const after = evaluateCourseLevelMappingConsistency(canonical,next,extractions)
assert.equal(before.id,'CQR-004')
assert.equal(before.status,'fail')
assert.equal(before.metrics?.mismatches,7)
assert.equal(after.status,'pass')
assert.equal(after.metrics?.mismatches,0)
assert.equal(after.metrics?.reviewedCourseLevelExceptions,before.metrics?.reviewedCourseLevelExceptions,'no new exception bypass')

const raw = parse(resolve(out,'review-input/whole-current-two-goals-and-actual-consumer-limits.raw.json'))
const measurement = raw.rawDiagnostic.unsupported.find((g:any)=>g.goalId.startsWith('2381'))
const consumers = raw.consumers.map((c:any)=>({goalId:c.goal.id,goalType:c.goal.contains.length?'cluster':'atomic',evidence:[{dimension:'jurisdiction',value:'DE-BY',kind:'mapping',source:'native diagnostic consumer applicability'}]}))
const eligible=(goal:any)=>!!goal && !goal.examData && !(goal.tags??[]).some((tag:string)=>['Practice','Assessment','Motivation','Orientation','memorization'].includes(tag))
const nativeChecker = (goal:any, entries:any[]) => createReviewedRequiresClosureCoverageChecker({
  landscapeId:canonical.landscapeId,jurisdiction:'DE-BY',goals:[goal,...consumers],
  canonicalGoalById:new Map(canonical.goals.map((g:any)=>[g.id,g])),
  surrogateEntriesByKey:new Map([[sourceCoverageSurrogateKey(canonical.landscapeId,measurement.goalId,'DE-BY'),entries]]),
  isEligibleCanonicalGoal:eligible,
})
const noBridge = nativeChecker(measurement,[])
assert.equal(noBridge.hasCoverageBackedJurisdictionEvidence(measurement),false)
const impossibleBridgeEntries = consumers.map((consumer:any)=>({landscapeId:canonical.landscapeId,goalId:measurement.goalId,jurisdiction:'DE-BY',requiredByGoalId:consumer.goalId}))
const ineligibleConsumers = nativeChecker(measurement,impossibleBridgeEntries)
assert.equal(ineligibleConsumers.hasReviewedRequiresClosureSurrogateEvidence(measurement),false)
const newRoute = manifest.files.find((file:any)=>file.productionPath.includes('/mapping/DE-BY/source-components/'))
const actualByMapping = parse(resolve(root,newRoute.candidate.path))
assert.equal(actualByMapping.mappings.length,1)
assert.equal(actualByMapping.mappings[0].canonicalGoalId,measurement.goalId)
assert.equal(actualByMapping.mappings[0].matchType,'partial')
const withActualDirectRoute = {...measurement,evidence:[...measurement.evidence,{dimension:'jurisdiction',value:'DE-BY',kind:'mapping',source:newRoute.productionPath,mappingStrength:'partial'}]}
const coveredDirect = nativeChecker(withActualDirectRoute,[])
assert.equal(coveredDirect.hasCoverageBackedJurisdictionEvidence(withActualDirectRoute),true)
assert.equal(coveredDirect.hasReviewedRequiresClosureSurrogateEvidence(withActualDirectRoute),false)
const protectedInputs = parse(resolve(out,'protected-whole-canonical-and-composition-and-registry-inputs.actual.json'))
for (const file of protectedInputs.files) assert.equal(fingerprint(file.path).sha256,file.sha256)
for (const file of manifest.files) {
  if (file.old) assert.equal(fingerprint(file.productionPath).sha256,file.old.sha256)
  if (file.archive) assert.equal(fingerprint(file.archive.path).sha256,file.old.sha256)
}
const declaredInputs = [...protectedInputs.files,...current.map(file=>fingerprint(file.file)),...[...extractions.keys()].filter(path=>!manifest.files.some((file:any)=>file.productionPath===path)).map(path=>fingerprint(path)),
  ...['app/scripts/generateCurriculumQualityStatus.ts','app/scripts/sourceCoverageEvidence.ts','app/scripts/applicabilityCompiler.ts'].map(fingerprint)]
writeFileSync(resolve(out,'native-declared-inputs.actual.json'),JSON.stringify([...new Map(declaredInputs.map(input=>[input.path,input])).values()],null,2)+'\n')
const result={
  role:'bounded inert targeted source candidate validation; not global curriculum-status run',
  helpersUnchanged:true,currentCQR004:before,candidateCQR004:after,
  actualSourceCoverageNativeApi:{goalId:measurement.goalId,oldAutomaticClosureCoverage:false,clusterAndAssessmentSurrogateConsumersAccepted:false,candidateDirectPartialCoverage:true,candidateReviewedSurrogateCoverage:false},
  actualCandidateDiscovery:{nativeReaderCurrentBiologyFiles:current.length,candidateBiologyFiles:next.length,replacedOldFiles:7,newMappingFiles:1,newSourceFiles:1,allOtherMappingsIdentical:true},
  wholeCanonicalAndCompositionAndRegistriesProtected:true,
  activeCurriculumStatusCheck:'pending Root actual integration and native ordinary CLI',
  humanApproval:false,humanTrial:false,strictGain:0,
}
writeFileSync(resolve(out,'native-targeted-inert-candidate-validation.actual.json'),JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({currentCQR004:before.status,oldMismatches:before.metrics?.mismatches,candidateCQR004:after.status,candidateMismatches:after.metrics?.mismatches,sourceCoverageNativeApi:result.actualSourceCoverageNativeApi,currentBiologyFiles:current.length,candidateBiologyFiles:next.length}))
