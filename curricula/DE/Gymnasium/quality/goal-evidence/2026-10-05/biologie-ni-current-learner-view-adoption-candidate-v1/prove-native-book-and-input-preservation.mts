// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { loadGoalBookBuildInputs } from '../../../../../../../app/scripts/goalBookModel'
import { buildGoalBookOriginalSources } from '../../../../../../../app/scripts/goalBookOriginalSources'
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/biologie-ni-current-learner-view-adoption-candidate-v1'
const root=process.cwd(), iso=resolve(root,'tmp/biologie-ni-current-learner-view-adoption-candidate-v1-native-root')
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const hash=(p:string)=>({path:p,sha256:createHash('sha256').update(readFileSync(p)).digest('hex')})
const jsonSHA=(v:any)=>createHash('sha256').update(JSON.stringify(v)).digest('hex')
const registryPath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
const registry=read(registryPath),bio=registry.subjects.find((s:any)=>s.subject==='biologie')
const inputs=new Set<string>([registryPath,bio.landscapePath,bio.semanticKindLedgerPath,bio.visualizationQaPath,bio.semanticAtomicityConfigPath,bio.memoryReviewConfigPath,...bio.resolutionIndexPaths,...bio.positiveEvidenceConfigPaths])
for(const p of [bio.semanticAtomicityConfigPath,bio.memoryReviewConfigPath,...bio.positiveEvidenceConfigPaths]){
 const c=read(p)
 for(const k of ['reviewPath','cardReviewPath','reviewCriteriaPath'])if(c[k])inputs.add(c[k])
}
const before=[...inputs].map(hash)
const config='app/scripts/config/goal-books/de-gym-biology-national-atlas.json'
const actual=await loadGoalBookBuildInputs(config,root),prospective=await loadGoalBookBuildInputs(config,iso)
assert.equal(actual.model.pages.length,383)
assert.deepEqual(prospective.model.pages,actual.model.pages)
const currentReportPath='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/integrated-current-four-subject-central-v2.stdout.txt'
const report=read(currentReportPath),currentBio=report.subjects.find((s:any)=>s.subject==='biologie')
assert.equal(currentBio.strictComplete,67)
assert.deepEqual(currentBio.issues,[])
const byPage=new Map(actual.model.pages.map(p=>[p.goalId,p]))
assert(currentBio.strictCompleteGoalIds.every((id:string)=>byPage.has(id)))
const atlasPath='app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',atlas=read(atlasPath)
const osActual=buildGoalBookOriginalSources(actual.model,root,atlas.mappingPaths)
const osProspective=buildGoalBookOriginalSources(prospective.model,iso,atlas.mappingPaths)
assert.deepEqual(osProspective,osActual)
const after=[...inputs].map(hash)
assert.deepEqual(after,before)
const result={atUTC:new Date().toISOString(),status:'Native full383 whole-page and current original-source-consumer comparison exact, all67 protected; no active writes',currentCentralReport:hash(currentReportPath),currentStrictProtectedIds:currentBio.strictCompleteGoalIds,currentStrictCount:67,currentDenominator:383,wholePagesCompared:383,everyWholePageExact:true,wholePageComparisons:actual.model.pages.map(p=>({goalId:p.goalId,pageFingerprint:p.pageFingerprint,wholePageSHA256:jsonSHA(p),prospectiveWholePageSHA256:jsonSHA(prospective.model.pages.find(x=>x.goalId===p.goalId))})),wholeCurrentOriginalSourcesExact:true,currentOriginalSourcesSHA256:jsonSHA(osActual),prospectiveOriginalSourcesSHA256:jsonSHA(osProspective),activeMappingPathCount:atlas.mappingPaths.length,selectedMappingPaths:atlas.mappingPaths,wholeAuthorizingInputFilesBefore:before,wholeAuthorizingInputFilesAfter:after,wholeInputsByteExact:true,wholeCanonicalGoalObjectsChanged:0,DPAandVScientificChanges:0,memoryAndCardScientificRowChanges:0,onlyProposedMScopeConfigChange:true,runtimeCodeChanges:false,backendTestsRun:false,humanApproval:false,humanTrial:false,newScientificClosures:0,activeWrites:false}
writeFileSync(own+'/native-whole383-pages-original-sources-and-protected67-inputs.actual.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'})
console.log(JSON.stringify({wholeNativePagesExact:383,protectedStrictGoalCount:67,currentOriginalSourcesExact:true,wholeAuthorizingInputFilesExact:before.length,newScienceClosures:0,activeWrites:false,humanApproval:false}))
