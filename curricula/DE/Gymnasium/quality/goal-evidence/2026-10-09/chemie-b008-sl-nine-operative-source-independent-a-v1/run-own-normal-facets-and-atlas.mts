// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildGoalBookSourceAtlasInputs, sourceAtlasFacet } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts'
const repo = resolve('.')
const own = dirname(fileURLToPath(import.meta.url))
const review = resolve(repo, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-sl-nine-operative-source-review-root-v1')
const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'))
const bind = (p: string) => { const b = readFileSync(resolve(repo,p)); return { path:p.replace(repo+'/',''), sha256:createHash('sha256').update(b).digest('hex'), bytes:b.length } }
const configPath=resolve(review,'whole395-with-existing32-and-reviewedSL.normal-probe.config.json')
const mappingPath=resolve(review,'SL-upper-nine-standards-to-two-whole-routines.mapping.reviewed-inactive.json')
const mapping=read(mappingPath)
const extractionPath=resolve(repo,mapping.sourceExtractionPath)
const extraction=read(extractionPath)
const config=read(configPath)
assert.equal(config.expectedCurricularAtomicGoalCount,395)
assert.equal(mapping.decisions.length,9)
assert.equal(mapping.mappings.length,11)
const facets=extraction.sourceGoals.map((goal:any)=>{
 const passage=extraction.passages.find((p:any)=>p.id===goal.passageId)
 const document=extraction.sourceDocuments.find((d:any)=>d.key===goal.sourceDocumentKey)
 assert.ok(passage && document)
 const stage=sourceAtlasFacet([goal,passage,document,extraction],'stage')
 const courseProfiles=sourceAtlasFacet([goal,passage,document,extraction],'courseProfile')
 assert.deepEqual(stage,['SekII']);assert.deepEqual(courseProfiles,['GK','LK'])
 return {sourceGoalId:goal.id,stage,courseProfiles,officialNumber:goal.topicCode,learningEndpoint:goal.extendedData.learningEndpoint,selectedPartialEdges:mapping.mappings.filter((e:any)=>e.legacyGoalId===goal.id)}
})
const inputPaths=new Set<string>([configPath,mappingPath,extractionPath,config.landscapePath,config.semanticKindLedgerPath,config.durationModelPolicyPath,'app/scripts/goalBookSourceAtlasInputs.ts','app/scripts/goalBookModel.ts','app/src/utils/authoring/canonicalAuthoring.ts','app/src/utils/authoring/compositionViewAuthoring.ts',...config.mappingPaths,...(config.fallbackViewPaths??[]),...(config.sourceDocumentSnapshots??[]).map((x:any)=>x.path)])
for(const p of config.mappingPaths){const m=read(resolve(repo,p)); if(m.sourceExtractionPath) inputPaths.add(m.sourceExtractionPath)}
let ordinaryError:string|null=null,counts:any=null,generatedInMemoryOutputCount=0
try { const result=buildGoalBookSourceAtlasInputs(config,repo);counts=result.receipt.counts;generatedInMemoryOutputCount=Object.keys(result.outputs).length }
catch(e){ordinaryError=e instanceof Error?e.message:String(e)}
const result={schemaVersion:1,reviewer:'Codex independent A; model variant unexposed',ownFirstSemanticSeal:bind(resolve(own,'nine-numbered-standards.first.independent-A.freeze.json')),actualAPI:'unchanged buildGoalBookSourceAtlasInputs(config, repositoryRoot) and sourceAtlasFacet',inputBindings:[...inputPaths].map(bind),normalFacetsStatus:'PASS',facets,normalAtlasStatus:ordinaryError?'HOLD':'PASS_TECHNICAL_INACTIVE_ONLY',actualOrdinaryError:ordinaryError,counts,expectedCurricularAtomicGoalCountUnchanged:395,denominatorReduced:false,generatedInMemoryOutputCount,generatedAtlasFilesWritten:false,wholeOriginalSL65ScientificallyReReviewed:false,wholeOriginalSL65UnionClosed:false,wholeNationalSourceOperatorAndCourseApproval:false,source19WholeApproved:false,nativeDPApproved:false,newAorMApproval:false,actualLearnerPerformance:false,actualPhysicalExecution:false,humanApproval:false,humanTrial:false,strictGain:0,activeWrites:[]}
const output=resolve(own,'nine-normal-facets-and-whole395-atlas.actual-independent.json');assert.ok(!existsSync(output));writeFileSync(output,JSON.stringify(result,null,2)+'\n')
console.log(JSON.stringify({normalFacetsStatus:result.normalFacetsStatus,normalAtlasStatus:result.normalAtlasStatus,actualOrdinaryError:ordinaryError,counts,generatedInMemoryOutputCount,inputBindings:inputPaths.size}))
