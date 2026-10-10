import assert from 'node:assert/strict'
import { deepUnderstandingCompletionCheckIds, hasStrictDeepUnderstandingCompletion } from '/home/enpasos/projects/skillpilot/app/scripts/reportDeepUnderstandingRollout.ts'
import { evaluateDeepUnderstandingQa, deriveCurriculumMaturity } from '/home/enpasos/projects/skillpilot/app/scripts/generateCurriculumQualityStatus.ts'
const subject:any={subject:'wirtschaftswissenschaften',label:'Fixture Economics',landscapeId:'independent-econ-fixture',landscapePath:'fixture.json',currentGoalIds:['one','two'],denominator:2,strictComplete:1,remaining:1,percentage:'50.0%',strictCompleteGoalIds:['one'],deferredVisualizationGoalIds:[],gates:{currentDescriptionResolutions:1,currentPositiveEvidenceProfiles:2,currentSemanticAtomicityDecisions:2,currentMemoryReviewDecisions:2,currentVisualizationQaRecords:2},requiredChecks:deepUnderstandingCompletionCheckIds.map(id=>({id,status:id==='description-review-validation'?'fail':'pass'})),strictCompletionReady:false,issues:['The second current description has an unresolved scientific finding.']}
const report:any={schemaVersion:1,reportId:'independent-fixture',subjects:[subject],blockingIssueCount:1}
const landscape:any={landscapeId:subject.landscapeId,goals:[{id:'one'},{id:'two'}]}
const rules:any=['CQR-000','CQR-001','CQR-002','CQR-003','CQR-301','CQR-401','CQR-501','CQR-302'].map(id=>({id,status:'pass',summary:'Independent fixture prerequisite'}))
const scopes:any=[{scopeId:'independent',label:'Independent',maturity:'M4',selectedAtomicGoals:2,rules:[{id:'CQR-101',status:'pass',summary:'Independent route prerequisite'}]}]
const genuine=hasStrictDeepUnderstandingCompletion(subject)
const qa=evaluateDeepUnderstandingQa(landscape,subject.landscapePath,report)
const maturity=deriveCurriculumMaturity([...rules,qa],scopes)
assert.equal(genuine,false);assert.equal(qa.status,'fail');assert.equal(maturity,'M6')
const forged={...subject,strictCompletionReady:true}
assert.equal(hasStrictDeepUnderstandingCompletion(forged),false)
assert.throws(()=>assert.equal(forged.strictCompletionReady,hasStrictDeepUnderstandingCompletion(forged)))
const duplicates={...subject,strictComplete:2,strictCompleteGoalIds:['one','one']}
assert.equal(hasStrictDeepUnderstandingCompletion(duplicates),false)
assert.throws(()=>assert.equal(new Set(duplicates.strictCompleteGoalIds).size,duplicates.strictComplete))
const falseFullD={...subject,strictComplete:2,gates:{...subject.gates,currentDescriptionResolutions:2},strictCompletionReady:true}
assert.equal(hasStrictDeepUnderstandingCompletion(falseFullD),false)
assert.throws(()=>assert.equal(falseFullD.strictCompleteGoalIds.length,falseFullD.strictComplete))
const missingV={...subject,gates:{...subject.gates,currentVisualizationQaRecords:1}}
assert.throws(()=>assert.equal(missingV.gates.currentVisualizationQaRecords,missingV.denominator))
console.log(JSON.stringify({kind:'independent-short-production-fixtures',fullCentralTestRun:false,scope:subject,genuine:{strictReady:genuine,CQR303:qa.status,maturity},observedRejectedCases:['forgedReadyWithOpenFinding','duplicateCompletionIDs','falseFullDCount','missingVAtM6']},null,2))
