import assert from 'node:assert/strict'
import {readFileSync,writeFileSync} from 'node:fs'
import Ajv2020 from '../../../../../../../app/node_modules/ajv/dist/2020.js'
import {fingerprintSemanticKindSourceGoal} from '../../../../../../../app/scripts/goalBookModel'
import {normalizeCanonicalLandscape,validateCanonicalLandscape} from '../../../../../../../app/src/utils/authoring/canonicalAuthoring'
const base='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/'
const source=base+'wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/seven-foreign-KEEP-and-eight-qualified-kind-final493-fieldwise-assembly-v1/'
const output=base+'wirtschaft-final493-and-native43basis-source3-adapter-independent-root-v1/'
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'))
const h=read(source+'actual-final-seven-foreign-KEEP-CAN493-closedSEM493-two-views-source125-meta-reviewable-freeze.receipt.json')
const idx=read(h.materialAssemblyIndex.path)
const can=read(h.canonical493.path)
const sem=read(h.semanticKinds493CurrentClosedV2.path)
const old=read(idx.currentQualifiedSEM485.path)
const schemaPath='contracts/curriculum-package/v1/curriculum-ontology-profile.schema.json'
const ajv=new Ajv2020({allErrors:true,strict:true})
const check=ajv.compile(read(schemaPath))
assert.equal(check(sem),true,JSON.stringify(check.errors))
const goals=new Map(can.goals.map((g:any)=>[g.id,g]))
const actualBindings=sem.decisions.map((d:any)=>({goalId:d.goalId,semanticKind:d.semanticKind,expectedSourceFingerprint:fingerprintSemanticKindSourceGoal(goals.get(d.goalId) as any),actualSourceFingerprint:d.sourceFingerprint}))
assert.equal(actualBindings.length,493)
assert(actualBindings.every((r:any)=>r.expectedSourceFingerprint===r.actualSourceFingerprint))
const counts:any={};for(const r of actualBindings)counts[r.semanticKind]=(counts[r.semanticKind]??0)+1
assert.equal(counts.curricularAtomic,336);assert.equal(counts.practiceAssessment,112);assert.equal(counts.memory,10)
const changedOld=old.decisions.filter((d:any)=>d.sourceFingerprint!==fingerprintSemanticKindSourceGoal(goals.get(d.goalId) as any)).map((d:any)=>({goalId:d.goalId,oldSourceFingerprint:d.sourceFingerprint,currentActualSourceFingerprint:fingerprintSemanticKindSourceGoal(goals.get(d.goalId) as any)}))
assert.equal(changedOld.length,2)
assert.deepEqual(changedOld.map((r:any)=>r.goalId).sort(),['96183c48-b499-54d7-8530-578f6ff40207','6a5efa74-66c8-5682-8371-b0a93d17f986'].sort())
const graph=validateCanonicalLandscape(normalizeCanonicalLandscape(can))
assert.equal(graph.filter(f=>f.severity==='error').length,0)
const result={scope:'Independent actual native493 semantic source fingerprint and unchanged closed ontology schema check; no new substantive kind or description reviews.',schemaPath,closedSchemaErrors:[],actualWhole493SourceBindings:actualBindings,actualCounts:counts,actualFormerTwoOldSourceFPNegatives:changedOld,actualCanonicalGraphFindings:graph,all485HistoricalKindJudgmentsAnd8ForeignKindJudgmentsNotReReviewed:true,humanApproval:false,strictNetGain:0}
writeFileSync(output+'actual-independent-493-native-closed-schema-source-fingerprint-two-stale-negatives-and-graph.result.json',JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({closedSchemaErrors:0,actualSourceFP493:493,actualSourceFPErrors:0,oldStaleSourceFPNegatives:2,canonicalGraphErrors:0,counts,strictNetGain:0}))
