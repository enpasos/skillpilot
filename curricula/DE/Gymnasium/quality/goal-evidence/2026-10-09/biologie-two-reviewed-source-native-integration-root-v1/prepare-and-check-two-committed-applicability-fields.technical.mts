// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {readFileSync,writeFileSync} from 'node:fs'
import {dirname,resolve,relative} from 'node:path'
import {fileURLToPath} from 'node:url'
import {buildGoalBookModel,loadGoalBookBuildInputs,parseAndValidateGoalBookModel,stableGoalBookJson,fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel.ts'
import {fingerprintGoalForEvidence,fingerprintGoalEvidenceReviewInput} from '../../../../../../../app/scripts/goalEvidenceProfileModel.ts'
const own=dirname(fileURLToPath(import.meta.url)),root=resolve('.')
const json=(path:string)=>JSON.parse(readFileSync(resolve(root,path),'utf8'))
const sha=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex')
const currentPath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
const oldBytes=readFileSync(currentPath),before=JSON.parse(oldBytes.toString()),candidate=structuredClone(before)
const inspected=json(relative(root,resolve(own,'actual-current-APV203-findings-and-whole-goals.json')))
assert.equal(inspected.findings.length,2)
const changes=[]
for(const row of inspected.findings){
  const goal=candidate.goals.find((g:any)=>g.id===row.finding.goalId)
  assert.deepEqual(goal,row.currentWholeGoal,'Inspected whole goal still current')
  goal.applicability=structuredClone(row.actualCompiledGoal.compiledApplicability)
  assert.deepEqual(goal.applicability,{jurisdiction:['DE-NI','DE-SN','DE-ST']})
  const previous=before.goals.find((g:any)=>g.id===goal.id)
  assert.deepEqual({...goal,applicability:previous.applicability},previous)
  assert.equal(fingerprintSemanticKindSourceGoal(goal),fingerprintSemanticKindSourceGoal(previous))
  assert.equal(fingerprintGoalForEvidence(goal,'positive-understanding-evidence-v2','curricularAtomic'),fingerprintGoalForEvidence(previous,'positive-understanding-evidence-v2','curricularAtomic'))
  assert.equal(fingerprintGoalEvidenceReviewInput(goal,'positive-understanding-evidence-v2',{},'curricularAtomic'),fingerprintGoalEvidenceReviewInput(previous,'positive-understanding-evidence-v2',{},'curricularAtomic'))
  changes.push({goalId:goal.id,path:'applicability.jurisdiction',before:previous.applicability.jurisdiction,after:goal.applicability.jurisdiction})
}
const candidatePath=resolve(own,'whole479-two-applicability-fields-production-derived.inactive.json')
writeFileSync(candidatePath,JSON.stringify(candidate,null,2)+'\n',{flag:'wx'})
writeFileSync(resolve(own,'whole479-before-two-applicability-sync.exact.json'),oldBytes,{flag:'wx'})
const live=await loadGoalBookBuildInputs('app/scripts/config/goal-books/de-gym-biology-national-atlas.json',root)
const config=live.config,manifest=json(config.compositionViewManifestPath!)
const qa=json(config.goalVisualizationQaPath)
const digests=Object.fromEntries(qa.records.filter((r:any)=>r.visualizationState==='available').map((r:any)=>[r.imageUrl,'sha256:'+sha(readFileSync(r.publicAssetPath))]))
const model=buildGoalBookModel({
  landscape:candidate,compositionViewManifest:manifest,
  compositionViewSources:manifest.sourcePaths.map((path:string)=>({path,view:json(path)})),
  navigationView:json(manifest.navigationViewPath),durationModelPolicy:json(manifest.durationModelPolicyPath),
  semanticKindLedger:json(config.semanticKindLedgerPath),goalVisualizationQa:qa,
  goalVisualizationAssetDigests:digests,evidenceReviewSources:[],config,
})
parseAndValidateGoalBookModel(model)
assert.equal(model.pages.length,394)
assert.equal(stableGoalBookJson(model.pages),stableGoalBookJson(live.model.pages),'Whole394 operative page values must remain exact')
assert.equal(stableGoalBookJson(model),stableGoalBookJson(live.model),'Whole ordinary BookModel including digest must remain exact')
writeFileSync(resolve(own,'actual-two-applicability-sync-no-scientific-or-native-deltas.json'),JSON.stringify({
  schemaVersion:1,currentCanonicalBeforeSha256:sha(oldBytes),candidateCanonicalSha256:sha(readFileSync(candidatePath)),
  actualProductionCompilerFindings:2,changes,wholeGoalCount:479,
  exactlyTwoApplicabilityFieldsOnly:true,unchangedOther477WholeGoalValues:true,
  currentGoalSemanticFingerprintsAndPInputFingerprintsExact:true,semanticKindFingerprintsExact:true,
  actualWhole394PageValuesExactlyRetained:true,actualWholeBookModelExactlyRetained:true,
  modelDigest:model.digest,sourceRolesRemainPartial:true,newScientificClosures:0,
  decision:'Synchronize two stale committed applicability fields to already independently reviewed production-derived source/child-union visibility. No new science or native description review is claimed.',
},null,2)+'\n',{flag:'wx'})
console.log('Normal model PASS: exactly2 applicability metadata fields, whole394 pages and whole BookModel/digest unchanged; no evidence fingerprint updates.')
